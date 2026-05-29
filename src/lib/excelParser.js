import * as XLSX from 'xlsx'

// Mapeo de columnas del Excel → campos de la BD
const COL_MAP = {
  'Fecha': 'fecha',
  'Nombre Completo': 'nombre_completo',
  'Email': 'email',
  'Fecha Nacimiento': 'fecha_nacimiento',
  'Telefono': 'telefono',
  'CI': 'ci',
  'Departamento': 'departamento',
  'Codigo': 'codigo',
  'Premio': 'premio',
  'Status (Interno)': 'status_interno',
}

function limpiar(val) {
  if (val === null || val === undefined) return null
  const s = String(val).trim()
  return s === '-' || s === '' ? null : s
}

/**
 * Parsea un archivo .xlsx con el formato de Ganadores Raspadita Mundialera.
 * @param {File} file
 * @returns {Promise<Array>} array de objetos listos para insertar en participantes
 */
export function parsearExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false })

        const participantes = rows.map((row) => {
          const p = {}

          // Columna N° puede tener encoding raro — buscarla por prefijo
          const numKey = Object.keys(row).find(k => k.startsWith('N'))
          p.numero = numKey ? parseInt(limpiar(row[numKey])) || null : null

          for (const [excelCol, dbCol] of Object.entries(COL_MAP)) {
            p[dbCol] = limpiar(row[excelCol])
          }

          return p
        }).filter(p => p.nombre_completo) // descarta filas vacías

        resolve(participantes)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
