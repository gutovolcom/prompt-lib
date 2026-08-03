// Compressão client-side para arquivos acima do limite de upload:
// converte para WebP na resolução original, começando em qualidade alta
// e reduzindo apenas o necessário para caber no limite.

const QUALITY_STEPS = [0.92, 0.85, 0.75, 0.65]

async function encodeWebp(bitmap: ImageBitmap, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D não suportado neste navegador.')
  ctx.drawImage(bitmap, 0, 0)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao converter imagem.'))),
      'image/webp',
      quality,
    )
  })
}

/**
 * Converte a imagem para WebP mantendo a resolução original, na maior
 * qualidade que caiba em maxBytes. Lança erro se nem a menor qualidade couber.
 */
export async function compressToWebp(file: File, maxBytes: number): Promise<File> {
  const bitmap = await createImageBitmap(file)
  try {
    for (const quality of QUALITY_STEPS) {
      const blob = await encodeWebp(bitmap, quality)
      if (blob.size <= maxBytes) {
        const name = file.name.replace(/\.[^.]+$/, '.webp')
        return new File([blob], name, { type: 'image/webp' })
      }
    }
  } finally {
    bitmap.close()
  }
  throw new Error(
    `"${file.name}" continua acima de 15MB mesmo comprimida. Reduza a resolução e tente de novo.`,
  )
}
