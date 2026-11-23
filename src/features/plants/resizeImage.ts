/**
 * Reduce una foto antes de subirla para ahorrar datos y espacio
 * (en modo demo se guarda en localStorage, que tiene unos 5 MB).
 */
export async function resizeImage(file: File, maxSize = 800, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la foto'))), 'image/jpeg', quality),
  )
}
