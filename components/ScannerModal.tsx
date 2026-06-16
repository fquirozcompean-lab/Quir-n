'use client'
import { useState, useRef } from 'react'

/* ══════════ Types ══════════ */
type Filter  = 'auto' | 'texto' | 'nitido' | 'vibrante' | 'original'
type Corner  = 'tl' | 'tr' | 'br' | 'bl'
type Point   = { x: number; y: number }   // 0-100 % of display container
interface Quad { tl: Point; tr: Point; br: Point; bl: Point }
interface Page { thumb: string; blob: Blob; ocrText: string }

const DEFAULT_QUAD: Quad = {
  tl: { x: 5,  y: 5  },
  tr: { x: 95, y: 5  },
  br: { x: 95, y: 95 },
  bl: { x: 5,  y: 95 },
}

/* ══════════ Filters ══════════ */
const FILTERS: { id: Filter; label: string; css: string }[] = [
  { id: 'auto',     label: '✨ Auto',      css: 'contrast(1.35) saturate(1.25) brightness(1.04)' },
  { id: 'texto',    label: '📄 Texto',     css: 'contrast(2.2) brightness(1.3) saturate(0.4)'   },
  { id: 'nitido',   label: '🔍 Nítido',    css: 'contrast(1.9) saturate(1.1)'                   },
  { id: 'vibrante', label: '🌈 Vibrante',  css: 'contrast(1.2) saturate(2.4) brightness(1.05)'  },
  { id: 'original', label: '🎨 Original',  css: 'none'                                           },
]

function clamp(v: number) { return Math.round(Math.max(0, Math.min(255, v))) }

function applyPixelFilter(ctx: CanvasRenderingContext2D, w: number, h: number, f: Filter) {
  if (f === 'original') return
  const id = ctx.getImageData(0, 0, w, h)
  const d  = id.data
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2]
    if (f === 'auto') {
      // Boost saturation then contrast
      const avg = (r + g + b) / 3
      r = clamp(avg + (r - avg) * 1.2); g = clamp(avg + (g - avg) * 1.2); b = clamp(avg + (b - avg) * 1.2)
      r = clamp((r - 128) * 1.3 + 128); g = clamp((g - 128) * 1.3 + 128); b = clamp((b - 128) * 1.3 + 128)
    } else if (f === 'texto') {
      // Push light areas white, darken dark areas — keep residual color
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      if (lum > 155) {
        const t = (lum - 155) / 100
        r = clamp(r + (255 - r) * t * 0.92); g = clamp(g + (255 - g) * t * 0.92); b = clamp(b + (255 - b) * t * 0.92)
      } else {
        const t = (155 - lum) / 155
        r = clamp(r * (1 - t * 0.55)); g = clamp(g * (1 - t * 0.55)); b = clamp(b * (1 - t * 0.55))
      }
    } else if (f === 'nitido') {
      r = clamp((r - 128) * 1.85 + 128); g = clamp((g - 128) * 1.85 + 128); b = clamp((b - 128) * 1.85 + 128)
    } else if (f === 'vibrante') {
      const avg = (r + g + b) / 3
      r = clamp(avg + (r - avg) * 2.3); g = clamp(avg + (g - avg) * 2.3); b = clamp(avg + (b - avg) * 2.3)
      r = clamp((r - 128) * 1.15 + 128); g = clamp((g - 128) * 1.15 + 128); b = clamp((b - 128) * 1.15 + 128)
    }
    d[i] = r; d[i + 1] = g; d[i + 2] = b
  }
  ctx.putImageData(id, 0, 0)
}

/* ══════════ Perspective correction ══════════ */
// Gaussian elimination to solve 8×8 linear system
function solve8(A: number[][], b: number[]): number[] {
  const n = 8
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let max = col
    for (let row = col + 1; row < n; row++) if (Math.abs(M[row][col]) > Math.abs(M[max][col])) max = row
    ;[M[col], M[max]] = [M[max], M[col]]
    const piv = M[col][col]
    if (Math.abs(piv) < 1e-12) continue
    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const f = M[row][col] / piv
      for (let j = col; j <= n; j++) M[row][j] -= f * M[col][j]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

// Compute homography h from 4 src→dst point pairs
// Returns h[0..7] where h[8]=1 (normalized)
function homography(src: Point[], dst: Point[]): number[] {
  const A: number[][] = [], b: number[] = []
  for (let i = 0; i < 4; i++) {
    const { x: xs, y: ys } = src[i], { x: xd, y: yd } = dst[i]
    A.push([xs, ys, 1, 0, 0, 0, -xd * xs, -xd * ys]); b.push(xd)
    A.push([0, 0, 0, xs, ys, 1, -yd * xs, -yd * ys]); b.push(yd)
  }
  return solve8(A, b)
}

// Convert display-container % coords → image pixel coords (accounts for object-contain letterboxing)
function toImgPx(p: Point, cW: number, cH: number, iW: number, iH: number): Point {
  const scale   = Math.min(cW / iW, cH / iH)
  const offX    = (cW - iW * scale) / 2
  const offY    = (cH - iH * scale) / 2
  return {
    x: Math.max(0, Math.min(iW, ((p.x / 100) * cW - offX) / scale)),
    y: Math.max(0, Math.min(iH, ((p.y / 100) * cH - offY) / scale)),
  }
}

function perspectiveWarp(img: HTMLImageElement, quad: Quad, cW: number, cH: number): HTMLCanvasElement {
  const iW = img.naturalWidth, iH = img.naturalHeight

  // Convert quad corners (% of container) → image pixels
  const corners: [Point, Point, Point, Point] = [
    toImgPx(quad.tl, cW, cH, iW, iH),
    toImgPx(quad.tr, cW, cH, iW, iH),
    toImgPx(quad.br, cW, cH, iW, iH),
    toImgPx(quad.bl, cW, cH, iW, iH),
  ]
  const [tl, tr, br, bl] = corners

  // Output size: estimated from quad edge lengths
  const topW  = Math.hypot(tr.x - tl.x, tr.y - tl.y)
  const botW  = Math.hypot(br.x - bl.x, br.y - bl.y)
  const leftH = Math.hypot(bl.x - tl.x, bl.y - tl.y)
  const ritH  = Math.hypot(br.x - tr.x, br.y - tr.y)
  const rawW  = Math.max(topW, botW)
  const rawH  = Math.max(leftH, ritH)

  // Cap at 1600px on longest side for performance
  const maxPx = 1600
  const sc    = Math.min(1, maxPx / Math.max(rawW, rawH))
  const W     = Math.round(rawW * sc)
  const H     = Math.round(rawH * sc)

  // Destination corners = rectangle [0,0,W,H]
  const dst: Point[] = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }]
  // Inverse homography: dst → src, so we can sample source for each dest pixel
  const h = homography(dst, corners)

  // Extract source pixels
  const tmp = document.createElement('canvas')
  tmp.width = iW; tmp.height = iH
  tmp.getContext('2d')!.drawImage(img, 0, 0)
  const src = tmp.getContext('2d')!.getImageData(0, 0, iW, iH).data

  const out    = document.createElement('canvas')
  out.width = W; out.height = H
  const outCtx = out.getContext('2d')!
  const outId  = outCtx.createImageData(W, H)
  const od     = outId.data

  for (let yd = 0; yd < H; yd++) {
    for (let xd = 0; xd < W; xd++) {
      const den = h[6] * xd + h[7] * yd + 1
      const xs  = (h[0] * xd + h[1] * yd + h[2]) / den
      const ys  = (h[3] * xd + h[4] * yd + h[5]) / den
      const x0  = Math.floor(xs), y0 = Math.floor(ys)
      if (x0 < 0 || y0 < 0 || x0 + 1 >= iW || y0 + 1 >= iH) continue
      const fx = xs - x0, fy = ys - y0
      const di = (yd * W + xd) * 4
      for (let c = 0; c < 3; c++) {
        const i00 = (y0 * iW + x0) * 4 + c
        od[di + c] = clamp(
          src[i00]               * (1 - fx) * (1 - fy) +
          src[i00 + 4]           * fx * (1 - fy) +
          src[i00 + iW * 4]      * (1 - fx) * fy +
          src[i00 + iW * 4 + 4]  * fx * fy
        )
      }
      od[di + 3] = 255
    }
  }

  outCtx.putImageData(outId, 0, 0)
  return out
}

/* ══════════ OCR ══════════ */
async function runOcr(blob: Blob): Promise<string> {
  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('spa', 1, { logger: () => {} })
    const url = URL.createObjectURL(blob)
    const { data: { text } } = await worker.recognize(url)
    URL.revokeObjectURL(url); await worker.terminate()
    return text
  } catch { return '' }
}

/* ══════════ Component ══════════ */
export default function ScannerModal({
  onDone, onCancel,
}: {
  onDone: (file: File, ocrText: string) => void
  onCancel: () => void
}) {
  const [pages,  setPages]  = useState<Page[]>([])
  const [rawSrc, setRawSrc] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('auto')
  const [quad,   setQuad]   = useState<Quad>(DEFAULT_QUAD)
  const [status, setStatus] = useState('')

  const cameraRef    = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef       = useRef<HTMLImageElement>(null)
  const activeCorner = useRef<Corner | null>(null)

  /* ── Camera ── */
  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setRawSrc(ev.target!.result as string); setQuad(DEFAULT_QUAD) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  /* ── Drag corners independently ── */
  function onCornerDown(corner: Corner, e: React.PointerEvent) {
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    activeCorner.current = corner
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!activeCorner.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const xp   = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width)  * 100))
    const yp   = Math.max(0, Math.min(100, ((e.clientY - rect.top)  / rect.height) * 100))
    setQuad(prev => ({ ...prev, [activeCorner.current!]: { x: xp, y: yp } }))
  }
  function onPointerUp() { activeCorner.current = null }

  /* ── Accept page: warp + filter → OCR → list ── */
  async function acceptPage() {
    if (!rawSrc || !containerRef.current) return
    setStatus('Corrigiendo perspectiva…')

    const img = new Image()
    await new Promise<void>(res => { img.onload = () => res(); img.src = rawSrc })

    const cW   = containerRef.current.clientWidth
    const cH   = containerRef.current.clientHeight
    const warped = perspectiveWarp(img, quad, cW, cH)

    setStatus('Aplicando filtro…')
    applyPixelFilter(warped.getContext('2d')!, warped.width, warped.height, filter)

    const blob  = await new Promise<Blob>(res => warped.toBlob(b => res(b!), 'image/jpeg', 0.9))
    const thumb = warped.toDataURL('image/jpeg', 0.2)

    setStatus('Reconociendo texto…')
    const ocrText = await runOcr(blob)

    setPages(prev => [...prev, { thumb, blob, ocrText }])
    setRawSrc(null)
    setStatus('')
  }

  /* ── Generate PDF ── */
  async function finalize() {
    setStatus('Generando PDF…')
    const { PDFDocument } = await import('pdf-lib')
    const pdf = await PDFDocument.create()
    for (const p of pages) {
      const bytes = await p.blob.arrayBuffer()
      const img   = await pdf.embedJpg(bytes)
      const page  = pdf.addPage([img.width, img.height])
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
    }
    const bytes = await pdf.save()
    const name  = `Escaneo_${new Date().toISOString().slice(0, 10)}.pdf`
    const file  = new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' })
    onDone(file, pages.map(p => p.ocrText).join('\n'))
  }

  /* ══════════ RENDER ══════════ */

  /* ── Page list ── */
  if (!rawSrc && pages.length > 0) return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-black/30">
        <button onClick={onCancel} className="text-white opacity-70 text-2xl leading-none">✕</button>
        <h2 className="text-white font-bold flex-1">Páginas ({pages.length})</h2>
        <button onClick={() => cameraRef.current?.click()} className="text-teal-300 text-sm font-semibold px-3 py-1 border border-teal-300 rounded-full">
          + Página
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-3">
          {pages.map((p, i) => (
            <div key={i} className="relative">
              <img src={p.thumb} className="w-full aspect-[3/4] object-cover rounded-lg border border-white/20" />
              <button
                onClick={() => setPages(prev => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
              >×</button>
              <p className="text-white/50 text-xs text-center mt-1">Pág. {i + 1}</p>
            </div>
          ))}
        </div>
      </div>

      {status && <p className="text-center text-teal-300 text-sm py-2 animate-pulse">{status}</p>}

      <div className="p-4 pb-8 flex gap-3">
        <button onClick={onCancel} className="flex-none text-white/60 text-sm px-4 py-3 rounded-xl border border-white/20">
          Cancelar
        </button>
        <button
          onClick={finalize}
          disabled={!!status}
          className="flex-1 bg-teal-500 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          Crear PDF ({pages.length} {pages.length === 1 ? 'pág.' : 'págs.'})
        </button>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
    </div>
  )

  /* ── Preview + perspective handles + filters ── */
  if (rawSrc) {
    const pts: { corner: Corner; p: Point }[] = [
      { corner: 'tl', p: quad.tl },
      { corner: 'tr', p: quad.tr },
      { corner: 'br', p: quad.br },
      { corner: 'bl', p: quad.bl },
    ]
    const svgPts = `${quad.tl.x},${quad.tl.y} ${quad.tr.x},${quad.tr.y} ${quad.br.x},${quad.br.y} ${quad.bl.x},${quad.bl.y}`

    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={() => setRawSrc(null)} className="text-white/70 text-2xl leading-none">✕</button>
          <span className="text-white text-sm font-semibold flex-1">Ajustar perspectiva</span>
          <button
            onClick={() => setQuad(DEFAULT_QUAD)}
            className="text-white/60 text-xs border border-white/30 px-3 py-1 rounded-full mr-1"
          >
            Reset
          </button>
          {status
            ? <span className="text-teal-300 text-xs animate-pulse">{status}</span>
            : <button
                onClick={acceptPage}
                className="bg-teal-500 text-white text-sm font-bold px-4 py-1.5 rounded-full"
              >
                {pages.length === 0 ? 'Usar' : 'Agregar'}
              </button>
          }
        </div>

        {/* Image + overlay */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden flex items-center justify-center mt-14 mb-24"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <img
            ref={imgRef}
            src={rawSrc}
            className="absolute inset-0 w-full h-full object-contain select-none"
            style={{ filter: FILTERS.find(f => f.id === filter)!.css }}
            draggable={false}
          />

          {/* SVG overlay: dark outside quad + border lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Dark mask */}
            <path
              fillRule="evenodd"
              fill="rgba(0,0,0,0.52)"
              d={`M0,0 L100,0 L100,100 L0,100 Z M${svgPts} Z`}
            />
            {/* Quad border */}
            <polygon points={svgPts} fill="none" stroke="#2dd4bf" strokeWidth="0.6" strokeDasharray="2,1" />
            {/* Edge lines */}
            <line x1={quad.tl.x} y1={quad.tl.y} x2={quad.tr.x} y2={quad.tr.y} stroke="#2dd4bf" strokeWidth="0.4" opacity="0.6" />
            <line x1={quad.tr.x} y1={quad.tr.y} x2={quad.br.x} y2={quad.br.y} stroke="#2dd4bf" strokeWidth="0.4" opacity="0.6" />
            <line x1={quad.br.x} y1={quad.br.y} x2={quad.bl.x} y2={quad.bl.y} stroke="#2dd4bf" strokeWidth="0.4" opacity="0.6" />
            <line x1={quad.bl.x} y1={quad.bl.y} x2={quad.tl.x} y2={quad.tl.y} stroke="#2dd4bf" strokeWidth="0.4" opacity="0.6" />
          </svg>

          {/* Draggable corner handles */}
          {pts.map(({ corner, p }) => (
            <div
              key={corner}
              onPointerDown={e => onCornerDown(corner, e)}
              className="absolute touch-none cursor-grab active:cursor-grabbing"
              style={{
                left: `${p.x}%`,
                top:  `${p.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Outer ring */}
              <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-teal-300 opacity-40" style={{ margin: '-4px' }} />
              {/* Inner dot */}
              <div className="w-7 h-7 rounded-full bg-teal-400 border-2 border-white shadow-lg" />
            </div>
          ))}
        </div>

        {/* Filter strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pb-6 pt-4">
          <div className="flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-none text-xs px-3 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
                  filter === f.id
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ── Initial: launch camera ── */
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center gap-6">
      <button onClick={onCancel} className="absolute top-4 left-4 text-white/70 text-2xl">✕</button>
      <div className="text-6xl">📷</div>
      <p className="text-white font-bold text-lg">Escanear documento</p>
      <p className="text-white/50 text-sm text-center px-10 leading-relaxed">
        Toma la foto del documento. Podrás ajustar cada esquina de forma independiente para corregir la perspectiva.
      </p>
      <button
        onClick={() => cameraRef.current?.click()}
        className="bg-teal-500 text-white font-bold px-8 py-4 rounded-2xl text-base mt-2"
      >
        Abrir cámara
      </button>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
    </div>
  )
}
