export const C = {
  bg:          "#0b1120",
  surface:     "#131c2e",
  surface2:    "#1a2540",
  surface3:    "#1e2e4a",
  border:      "#1e2d47",
  primary:     "#3b82f6",
  primaryDark: "#1d4ed8",
  success:     "#22c55e",
  successDim:  "#166534",
  warning:     "#f59e0b",
  error:       "#ef4444",
  text:        "#e2e8f0",
  text2:       "#7f8fa8",
  text3:       "#3d4f68",
  white:       "#ffffff",
} as const;

export type AppColor = keyof typeof C;
