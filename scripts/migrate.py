#!/usr/bin/env python3
"""
Migración de expedientes Word → ExpedienteGastro
Uso:
  python scripts/migrate.py --email TU@EMAIL --password TU_PASS
  python scripts/migrate.py --email TU@EMAIL --password TU_PASS --dry-run
"""

import argparse
import json
import os
import re
import sys
import zipfile
from datetime import datetime
import urllib.request
import urllib.error
import urllib.parse

SUPABASE_URL = "https://ihpksmdgcvnuhoknscpf.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlocGtzbWRnY3ZudWhva25zY3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjgwODAsImV4cCI6MjA5NjYwNDA4MH0.1p2c7THi8IgCSguoz0FvCl6kqMLMLeNvwhgjnumhv7Y"
FOLDER = r"C:\Users\quiro\OneDrive\Documents"

MESES = {
    'enero':1,'febrero':2,'marzo':3,'abril':4,'mayo':5,'junio':6,
    'julio':7,'agosto':8,'septiembre':9,'octubre':10,'noviembre':11,'diciembre':12
}

# Etiquetas en orden de aparición en el documento
LABELS = [
    'NOMBRE','SEXO','FECHA DE NACIMIENTO','EDAD',
    'LUGAR DE NACIMIENTO','LUGAR DE RESIDENCIA','ESCOLARIDAD',
    'OCUPACION','ESTADO CIVIL','RELIGION','HEMOTIPO','TELEFONO','FECHA',
    'DATOS GENERALES',
    'ANTECEDENTES HEREDOFAMILIARES',
    'ABUELO MATERNO','ABUELA MATERNA','ABUELO PATERNO','ABUELA PATERNA',
    'PADRE','MADRE','HERMANOS','HIJOS','OTROS',
    'ANTECEDENTES PERSONALES NO PATOLOGICOS',
    'ANTECEDENTES PERSONALES PATOLOGICOS',
    'CRONICOS','QUIRURGICOS','ALERGICOS','MEDICAMENTOS DE USO CRONICO',
    'TRANSFUSIONES','TABAQUISMO','ETILISMO','DROGAS',
    'ANTECEDENTES GINECOLOGICOS',
    'EMBARAZOS','MENARCA','RITMO','FECHA DE ULTIMA REGLA','ANTICONCEPTIVOS',
    'PADECIMIENTO ACTUAL','DIAGNOSTICO','TRATAMIENTO Y SOLICITUDES',
    'DATOS MEDICOS',
]

# Etiquetas que son separadores de sección (no tienen valor propio)
SEPARATORS = {
    'DATOS GENERALES','ANTECEDENTES HEREDOFAMILIARES',
    'ANTECEDENTES PERSONALES NO PATOLOGICOS',
    'ANTECEDENTES PERSONALES PATOLOGICOS',
    'ANTECEDENTES GINECOLOGICOS','DATOS MEDICOS',
}

def sin_acento(texto):
    for a, b in 'áa éé íi óo úu ÁA ÉE ÍI ÓO ÚU ñn Ñn üu Üu'.split():
        texto = texto.replace(a, b)
    return texto

def extraer_texto(path):
    try:
        with zipfile.ZipFile(path) as z:
            xml = z.read('word/document.xml').decode('utf-8', errors='replace')
        texto = re.sub(r'<[^>]+>', '', xml)
        texto = re.sub(r'[ \t]{2,}', ' ', texto)
        texto = re.sub(r'\n{2,}', '\n', texto)
        return texto.strip()
    except Exception:
        return None

def parsear(texto):
    norma = sin_acento(texto.upper())

    encontrados = []
    # Posición donde termina 'FECHA DE NACIMIENTO' para no confundir con 'FECHA' suelto
    _fn_end = -1
    fn_pos = norma.find(sin_acento('FECHA DE NACIMIENTO'))
    if fn_pos >= 0:
        _fn_end = fn_pos + len('FECHA DE NACIMIENTO')

    for label in LABELS:
        nl = sin_acento(label)
        # 'FECHA' suelto debe buscarse DESPUÉS de 'FECHA DE NACIMIENTO'
        if label == 'FECHA':
            start = _fn_end if _fn_end >= 0 else 0
            idx = norma.find(nl, start)
        else:
            idx = norma.find(nl)
        if idx >= 0:
            encontrados.append((idx, idx + len(label), label))

    encontrados.sort(key=lambda x: x[0])

    # Eliminar solapamientos
    limpios = []
    ultimo_fin = -1
    for ini, fin, label in encontrados:
        if ini >= ultimo_fin:
            limpios.append((ini, fin, label))
            ultimo_fin = fin

    campos = {}
    for i, (ini, fin, label) in enumerate(limpios):
        if label in SEPARATORS:
            continue
        siguiente = limpios[i + 1][0] if i + 1 < len(limpios) else len(texto)
        valor = texto[fin:siguiente].strip()
        # Limpiar texto "Google maps" u otros artefactos frecuentes
        valor = re.sub(r'Google\s*maps?', '', valor, flags=re.IGNORECASE).strip()
        campos[label] = valor or None

    return campos

def parsear_fecha(texto):
    if not texto:
        return None
    texto = texto.strip().lower()

    # "10 febrero 86" / "8 abril 1964" / "21 mayo de 2026"
    m = re.match(r'(\d{1,2})\s+([a-záéíóúñ]+)\s+(?:de\s+)?(\d{2,4})', sin_acento(texto))
    if m:
        dia, mes_txt, anio_raw = int(m.group(1)), m.group(2), int(m.group(3))
        mes = MESES.get(mes_txt)
        if mes:
            anio = anio_raw if anio_raw > 100 else (2000 + anio_raw if anio_raw < 30 else 1900 + anio_raw)
            try:
                return datetime(anio, mes, dia).strftime('%Y-%m-%d')
            except Exception:
                return None

    # "dd/mm/yy" o "dd-mm-yyyy" o "dd mm yy"
    m = re.match(r'(\d{1,2})[\s/\-](\d{1,2})[\s/\-](\d{2,4})', texto)
    if m:
        dia, mes, anio_raw = int(m.group(1)), int(m.group(2)), int(m.group(3))
        anio = anio_raw if anio_raw > 100 else (2000 + anio_raw if anio_raw < 30 else 1900 + anio_raw)
        try:
            return datetime(anio, mes, dia).strftime('%Y-%m-%d')
        except Exception:
            return None

    return None

def parsear_sexo(texto):
    if not texto:
        return None
    t = sin_acento(texto.strip().lower())
    if 'femenino' in t or t == 'f' or t == 'mujer':
        return 'F'
    if 'masculino' in t or t == 'm' or t == 'hombre':
        return 'M'
    return None

_PLACEHOLDER = re.compile(r'haga clic\s.*?texto\.?\s*', re.IGNORECASE)

def s(v):
    """Limpiar valor o retornar None"""
    if not v:
        return None
    v = _PLACEHOLDER.sub('', str(v)).strip()
    return v if v else None

def construir_registro(campos, user_id):
    nombre = s(campos.get('NOMBRE'))
    if not nombre or len(nombre) < 4:
        return None
    # Filtrar registros que no son pacientes
    if nombre.startswith(':'):
        return None
    if nombre[0].isdigit():
        return None
    if any(x in nombre.upper() for x in [
        'DATOS GENERALES','CEDULA','FORMATO','HISTORIA',
        'ENDOSCOPIA','COLONOSCOPIA','A NIVEL INTERNACIONAL',
        'CURRICULUM','RECETA','VALORACION','HOJA MEMBRETADA',
    ]):
        return None

    return {
        'user_id': user_id,
        'nombre': nombre,
        'sexo': parsear_sexo(campos.get('SEXO')),
        'fecha_nacimiento': parsear_fecha(campos.get('FECHA DE NACIMIENTO')),
        'lugar_nacimiento': s(campos.get('LUGAR DE NACIMIENTO')),
        'ciudad': s(campos.get('LUGAR DE RESIDENCIA')),
        'escolaridad': s(campos.get('ESCOLARIDAD')),
        'ocupacion': s(campos.get('OCUPACION')),
        'estado_civil': s(campos.get('ESTADO CIVIL')),
        'religion': s(campos.get('RELIGION')),
        'hemotipo': s(campos.get('HEMOTIPO')),
        'telefono': s(campos.get('TELEFONO')),
        'fecha_consulta': parsear_fecha(campos.get('FECHA')),
        'ahf_abuelo_materno': s(campos.get('ABUELO MATERNO')),
        'ahf_abuela_materna': s(campos.get('ABUELA MATERNA')),
        'ahf_abuelo_paterno': s(campos.get('ABUELO PATERNO')),
        'ahf_abuela_paterna': s(campos.get('ABUELA PATERNA')),
        'ahf_padre': s(campos.get('PADRE')),
        'ahf_madre': s(campos.get('MADRE')),
        'ahf_hermanos': s(campos.get('HERMANOS')),
        'ahf_hijos': s(campos.get('HIJOS')),
        'ahf_otros': s(campos.get('OTROS')),
        'otros_np': s(campos.get('ANTECEDENTES PERSONALES NO PATOLOGICOS')),
        'cronicos': s(campos.get('CRONICOS')),
        'quirurgicos': s(campos.get('QUIRURGICOS')),
        'alergicos': s(campos.get('ALERGICOS')),
        'medicamentos': s(campos.get('MEDICAMENTOS DE USO CRONICO')),
        'transfusiones': s(campos.get('TRANSFUSIONES')),
        'tabaquismo': s(campos.get('TABAQUISMO')),
        'alcohol': s(campos.get('ETILISMO')),
        'drogas': s(campos.get('DROGAS')),
        'gesta': s(campos.get('EMBARAZOS')),
        'menarca': s(campos.get('MENARCA')),
        'ritmo': s(campos.get('RITMO')),
        'fur': parsear_fecha(campos.get('FECHA DE ULTIMA REGLA')),
        'anticonceptivos': s(campos.get('ANTICONCEPTIVOS')),
        'padecimiento': s(campos.get('PADECIMIENTO ACTUAL')),
        'dx_texto': s(campos.get('DIAGNOSTICO')),
        'tx_texto': s(campos.get('TRATAMIENTO Y SOLICITUDES')),
        'dx': [],
        'tx': [],
        'estudios_solicitados': [],
    }

def existe_paciente(nombre, token):
    params = urllib.parse.urlencode({'nombre': f'eq.{nombre}', 'select': 'id'})
    status, body = api('GET', f'/rest/v1/patients?{params}', token=token)
    if status == 200:
        return len(json.loads(body)) > 0
    return False

def actualizar_fecha(nombre, fecha, token):
    """UPDATE fecha_consulta WHERE nombre = ... AND fecha_consulta IS NULL"""
    params = urllib.parse.urlencode({'nombre': f'eq.{nombre}', 'fecha_consulta': 'is.null'})
    status, body = api('PATCH', f'/rest/v1/patients?{params}', {'fecha_consulta': fecha}, token)
    return status in (200, 204), body

def api(method, path, body=None, token=None):
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode('utf-8') if body else None
    headers = {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json',
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')

def login(email, password):
    status, body = api('POST', '/auth/v1/token?grant_type=password', {'email': email, 'password': password})
    if status != 200:
        print(f"Error al iniciar sesión ({status}): {body}")
        sys.exit(1)
    data = json.loads(body)
    return data['access_token'], data['user']['id']

def insertar(registro, token):
    status, body = api('POST', '/rest/v1/patients', registro, token)
    return status in (200, 201), body

def main():
    parser = argparse.ArgumentParser(description='Migrar expedientes Word a ExpedienteGastro')
    parser.add_argument('--email', required=True, help='Tu correo de acceso')
    parser.add_argument('--password', required=True, help='Tu contraseña de acceso')
    parser.add_argument('--folder', default=FOLDER, help='Carpeta con los .docx')
    parser.add_argument('--dry-run', action='store_true', help='Solo parsear, no subir')
    parser.add_argument('--update-dates', action='store_true', help='Solo actualizar fecha_consulta en expedientes ya importados')
    parser.add_argument('--debug-dates', action='store_true', help='Mostrar campo FECHA crudo de cada documento')
    args = parser.parse_args()

    if args.debug_dates:
        archivos = sorted([f for f in os.listdir(args.folder) if f.endswith('.docx')])
        print(f"Archivos: {len(archivos)}\n{'='*60}")
        con_fecha = sin_fecha_raw = sin_fecha_parse = 0
        for fname in archivos:
            path = os.path.join(args.folder, fname)
            texto = extraer_texto(path)
            if not texto:
                continue
            campos = parsear(texto)
            nombre = s(campos.get('NOMBRE')) or fname
            raw = campos.get('FECHA')
            parsed = parsear_fecha(raw)
            raw_short = (raw or '')[:80].replace('\n', ' ')
            if parsed:
                con_fecha += 1
                print(f"  OK    {nombre[:40]:<40}  {parsed}  raw={raw_short!r}")
            elif raw:
                sin_fecha_parse += 1
                print(f"  NOPRS {nombre[:40]:<40}  raw={raw_short!r}")
            else:
                sin_fecha_raw += 1
                print(f"  NOFLD {nombre[:40]:<40}  (sin campo FECHA)")
        print(f"\nCon fecha   : {con_fecha}")
        print(f"Sin parsear : {sin_fecha_parse}")
        print(f"Sin campo   : {sin_fecha_raw}")
        return

    if args.dry_run and not args.update_dates:
        token, user_id = None, 'dry-run'
        print("Modo simulación (--dry-run): no se subirá nada\n")
    else:
        print("Iniciando sesión...")
        token, user_id = login(args.email, args.password)
        print("Sesion iniciada OK\n")

    archivos = sorted([f for f in os.listdir(args.folder) if f.endswith('.docx')])
    print(f"Archivos .docx encontrados: {len(archivos)}\n")

    # ── Modo actualización de fechas ──────────────────────────────────────────
    if args.update_dates:
        print("Modo --update-dates: actualizando fecha_consulta en expedientes existentes\n")
        actualizados = sin_fecha = omitidos_u = 0
        for fname in archivos:
            path = os.path.join(args.folder, fname)
            texto = extraer_texto(path)
            if not texto:
                omitidos_u += 1
                continue
            campos = parsear(texto)
            nombre = s(campos.get('NOMBRE'))
            if not nombre:
                omitidos_u += 1
                continue
            fecha = parsear_fecha(campos.get('FECHA'))
            if not fecha:
                sin_fecha += 1
                continue
            exito, _ = actualizar_fecha(nombre, fecha, token)
            if exito:
                print(f"  UPD   {nombre}  →  {fecha}")
                actualizados += 1
            else:
                omitidos_u += 1
        print(f"\n{'='*50}")
        print(f"Actualizados : {actualizados}")
        print(f"Sin fecha    : {sin_fecha}")
        print(f"Omitidos     : {omitidos_u}")
        return

    # ── Modo migración normal ─────────────────────────────────────────────────
    ok = omitidos = errores = duplicados = 0
    log_errores = []

    for fname in archivos:
        path = os.path.join(args.folder, fname)
        texto = extraer_texto(path)
        if not texto:
            print(f"  SKIP  {fname}  (no se pudo leer)")
            omitidos += 1
            continue

        campos = parsear(texto)
        registro = construir_registro(campos, user_id)

        if not registro:
            print(f"  SKIP  {fname}  (no parece expediente clínico)")
            omitidos += 1
            continue

        nombre = registro['nombre']

        if args.dry_run:
            fecha = registro.get('fecha_consulta')
            print(f"  OK    {nombre}  fecha={fecha}")
            ok += 1
            continue

        # Saltar pacientes ya importados
        if existe_paciente(nombre, token):
            print(f"  DUP   {nombre}  (ya existe)")
            duplicados += 1
            continue

        exito, resp = insertar(registro, token)
        if exito:
            print(f"  OK    {nombre}")
            ok += 1
        else:
            msg = resp[:200]
            print(f"  ERR   {nombre}  →  {msg}")
            log_errores.append(f"{fname}\t{nombre}\t{msg}")
            errores += 1

    # Guardar log de errores
    if log_errores:
        log_path = os.path.join(os.path.dirname(__file__), 'errores.txt')
        with open(log_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(log_errores))
        print(f"\nLog de errores guardado en: {log_path}")

    print(f"\n{'='*50}")
    print(f"Importados : {ok}")
    print(f"Ya existían: {duplicados}")
    print(f"Omitidos   : {omitidos}")
    print(f"Errores    : {errores}")

if __name__ == '__main__':
    main()
