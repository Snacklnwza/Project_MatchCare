export function cropPlacement(size, imageWidth, imageHeight, zoom, horizontal, vertical) {
  const scale = Math.max(size / imageWidth, size / imageHeight) * zoom
  const width = imageWidth * scale
  const height = imageHeight * scale
  return {
    x: (size - width) * (1 - horizontal) / 2,
    y: (size - height) * (1 - vertical) / 2,
    width,
    height,
  }
}
