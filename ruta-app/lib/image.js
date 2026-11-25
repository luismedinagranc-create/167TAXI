// Reduce la foto antes de subirla (máx. 1600 px, JPEG) para que cargue rápido en el móvil
export function resizeImage(file, max = 1600) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      c.toBlob((b) => (b ? res(b) : rej(new Error('imagen'))), 'image/jpeg', 0.85)
    }
    img.onerror = rej
    img.src = URL.createObjectURL(file)
  })
}
