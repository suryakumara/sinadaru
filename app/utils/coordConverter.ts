export interface MapConfig {
  imageWidth: number;
  imageHeight: number;
  scaleX: number;
  scaleY: number;
  originX: number;
  originY: number;
}

export function metersToPixels(
  posX: number,
  posY: number,
  config: MapConfig,
): { px: number; py: number } {
  return {
    px: config.originX + posX / config.scaleX,
    py: config.originY - posY / config.scaleY,
  };
}
