/**
 * Genera la imagen de ganador compositeando los assets de public/ganador/
 * Coordenadas calibradas en Python/Pillow contra la referencia visual.
 *
 * @param {{ nombre: string, region: string, ticket: string }} ganador
 * @returns {Promise<string>} Object URL del PNG descargable (1200×1003)
 */

const BASE = () => `${import.meta.env.BASE_URL}ganador/`
const url  = (f) => BASE() + encodeURIComponent(f)

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Dibuja una imagen escalada por ancho fijo */
function drawRW(ctx, img, nw, x, y) {
  const nh = Math.round(img.height * nw / img.width)
  ctx.drawImage(img, x, y, nw, nh)
  return nh   // devuelve la altura resultante
}

export async function generarImagenGanador({ nombre, region, ticket }) {
  const W = 1200, H = 1003

  // Carga en paralelo de los 9 assets
  const [fondo, logo, feli, tktLbl, regLbl, nomLbl, rasp, siempre, ganadores] =
    await Promise.all([
      loadImg(url('FONDO.png')),
      loadImg(url('LOGO PACEÑA.png')),
      loadImg(url('FELICIDADES.png')),
      loadImg(url('TICKET GANADOR -BAJA OPAC.png')),
      loadImg(url('REGION- BAJA OPACIDAD.png')),
      loadImg(url('NOMBRE- BAJA OPAC.png')),
      loadImg(url('RASPADITA AL MUNDIAL.png')),
      loadImg(url('SIEMPRE CON LA NUESTRA.png')),
      loadImg(url('GANADORES.png')),
    ])

  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── 1. FONDO – cover crop (ratio ~1.2 ≈ canvas ratio 1.197) ──────────
  const scaleF = H / fondo.height
  const srcW   = W / scaleF
  const srcX   = (fondo.width - srcW) / 2
  ctx.drawImage(fondo, srcX, 0, srcW, fondo.height, 0, 0, W, H)

  // ── 2. LOGO PACEÑA – top center ───────────────────────────────────────
  drawRW(ctx, logo, 500, Math.round((W - 500) / 2), 1)

  // ── 3. FELICIDADES stamp – dibujado ANTES que RASPADITA (capa inferior)
  const feliW = 600
  const feliH = drawRW(ctx, feli, feliW, 460, 400)   // top=405, bottom≈699

  // ── 4. RASPADITA AL MUNDIAL – encima del stamp (capa superior) ────────
  const raspW = 550
  const raspH = Math.round(rasp.height * raspW / rasp.width)   // ≈ 229px
  // rasp bottom = 172+229 = 401  →  4px antes del stamp (top=405) ✓
  drawRW(ctx, rasp, raspW, Math.round((W - raspW) / 2) + 150, 172)

  // ── 5. Label cards (izquierda) ────────────────────────────────────────
  // Bounds medidos en los assets 615×336:
  //   TICKET: content x=[91,489] y=[54,288]  white=[134,288]
  //   RÉGION: content x=[110,508] y=[47,281] white=[127,281]
  //   NOMBRE: content x=[131,529] y=[40,274] white=[120,274]
  //   Content width = 398px para los tres → scale = 262/398 = 0.658
  const TARGET_W = 262
  const scaleC   = TARGET_W / 398

  const CARDS = [
    { img: tktLbl, cxs: 91,  cys: 54,  wmin: 134, wmax: 288, vtop: 328, val: (ticket || '').toUpperCase() },
    { img: regLbl, cxs: 110, cys: 47,  wmin: 127, wmax: 281, vtop: 493, val: (region || '').toUpperCase() },
    { img: nomLbl, cxs: 131, cys: 40,  wmin: 120, wmax: 274, vtop: 658, val: (nombre || '').toUpperCase() },
  ]

  ctx.textBaseline = 'middle'
  ctx.fillStyle    = 'rgba(60,60,60,1)'

  for (const { img, cxs, cys, wmin, wmax, vtop, val } of CARDS) {
    const aw = Math.round(615 * scaleC)
    const ah = Math.round(336 * scaleC)
    const ax = -Math.round(cxs * scaleC)
    const ay = vtop - Math.round(cys * scaleC)
    ctx.drawImage(img, ax, ay, aw, ah)

    const wbTop  = vtop + Math.round((wmin - cys) * scaleC)
    const wbBot  = vtop + Math.round((wmax - cys) * scaleC)
    const textCy = Math.round((wbTop + wbBot) / 2)
    const textCx = Math.round(TARGET_W / 2)

    // Auto-fit: reduce font size hasta que entre en el ancho disponible
    let fz = 27
    ctx.font = `bold ${fz}px Arial, Helvetica, sans-serif`
    while (ctx.measureText(val).width > TARGET_W - 18 && fz > 13) {
      fz--
      ctx.font = `bold ${fz}px Arial, Helvetica, sans-serif`
    }
    ctx.fillText(val, textCx - ctx.measureText(val).width / 2, textCy)
  }

  // ── 6. SIEMPRE CON LA NUESTRA – anclado al borde inferior ────────────
  const siemW = 390
  const siemH = Math.round(siempre.height * siemW / siempre.width)   // ≈ 212px
  drawRW(ctx, siempre, siemW, 0, H - siemH + 10)

  // ── 7. GANADORES – esquina inferior derecha ───────────────────────────
  const ganW = 335
  const ganH = Math.round(ganadores.height * ganW / ganadores.width)  // ≈ 183px
  drawRW(ctx, ganadores, ganW, 840, H - ganH + 5)

  // ── Exportar como PNG ─────────────────────────────────────────────────
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), 'image/png')
  })
}
