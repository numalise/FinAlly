/**
 * Generates perceptually distinct colors across blue-purple spectrum
 * using HSL color space for unlimited asset support
 */

export function generateDistinctColor(index: number, total: number = 30): string {
  // Blue to Purple range in HSL: 200° (blue) to 280° (purple)
  const hueStart = 200;
  const hueEnd = 280;
  const hueRange = hueEnd - hueStart;

  // Calculate hue with golden ratio distribution for better visual distinction
  const goldenRatio = 0.618033988749895;
  const hue = ((hueStart + (index * goldenRatio * hueRange)) % hueRange) + hueStart;

  // Vary lightness to create more distinction (50% to 70%)
  const lightness = 50 + ((index % 5) * 5);

  // Keep saturation high for vibrant colors (75% to 95%)
  const saturation = 75 + ((index % 3) * 10);

  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generates an array of distinct colors for a given count
 */
export function generateColorPalette(count: number): string[] {
  return Array.from({ length: count }, (_, i) => generateDistinctColor(i, count));
}

/**
 * Gets a color for an index, compatible with existing palette logic
 */
export function getColorForIndex(index: number): string {
  return generateDistinctColor(index);
}
