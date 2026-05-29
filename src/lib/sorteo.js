// Lógica de sorteo verificable con seed — adaptado de sorteo.md
// Corre íntegramente en el browser con Web Crypto API (no requiere backend)

/** Genera un seed criptográficamente seguro de 64 chars hex */
export function generarSeed() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Ejecuta el sorteo sobre una lista plana de participantes elegibles.
 * @param {string} seed  - seed generado en el paso de preparación
 * @param {Array}  elegibles - array de participantes (deben tener .id)
 *                            ordenados de forma determinista (por id)
 * @returns {{ ganador, virtualPos, totalElegibles, hash, seed, timestamp }}
 */
export async function ejecutarSorteo(seed, elegibles) {
  if (!elegibles.length) throw new Error('Sin participantes elegibles')

  const timestamp = Date.now()
  const enc = new TextEncoder()

  // Hash 1: calcula posición virtual
  const h1 = await crypto.subtle.digest('SHA-256', enc.encode(`${seed}|${timestamp}`))
  const hex1 = Array.from(new Uint8Array(h1)).map(b => b.toString(16).padStart(2, '0')).join('')
  const virtualPos = Number(BigInt('0x' + hex1) % BigInt(elegibles.length)) + 1

  // Lista ordenada → posición virtual es el índice 1-based
  const ganador = elegibles[virtualPos - 1]

  // Hash de verificación pública: SHA-256(seed|participante_id|timestamp)
  const h2 = await crypto.subtle.digest('SHA-256', enc.encode(`${seed}|${ganador.id}|${timestamp}`))
  const hashVerificacion = Array.from(new Uint8Array(h2)).map(b => b.toString(16).padStart(2, '0')).join('')

  return {
    ganador,
    virtualPos,
    totalElegibles: elegibles.length,
    hash: hashVerificacion,
    seed,
    timestamp,
  }
}

/**
 * Verificación pública offline:
 * SHA-256(seed|participante_id|timestamp) debe coincidir con el hash guardado
 */
export async function verificarSorteo(seed, participanteId, timestamp, hashEsperado) {
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(`${seed}|${participanteId}|${timestamp}`))
  const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hash === hashEsperado
}
