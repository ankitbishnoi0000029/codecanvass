// src/utils/colorUtils.ts
// Utility functions for many color conversions:
// HEX <-> RGB, RGB <-> HSV, RGB <-> CMYK, and Pantone lookup (sample map + nearest match)
// All functions use plain numeric math and return consistent typed values.

export type RGB = { r: number; g: number; b: number }
export type HSV = { h: number; s: number; v: number } // h: 0-360, s/v: 0-100
export type CMYK = { c: number; m: number; y: number; k: number } // 0-100
export type PantoneEntry = { name: string; hex: string; rgb: RGB; cmyk?: CMYK }

// ---------- Helpers ----------
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

function hexNormalize(hex: string) {
  let h = hex.trim().replace("#", "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error("Invalid HEX")
  return h.toLowerCase()
}

// ---------- HEX <-> RGB ----------
export function hexToRgb(hex: string): RGB {
  const h = hexNormalize(hex)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return { r, g, b }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => {
    const v = Math.round(clamp(n / 255, 0, 1) * 255)
    return v.toString(16).padStart(2, "0")
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase()
}

// ---------- RGB <-> HSV ----------
export function rgbToHsv({ r, g, b }: RGB): HSV {
  // convert RGB (0-255) -> HSV (h:0-360, s/v:0-100)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  } else {
    h = 0
  }

  const v = Math.round(max * 100)
  const s = Math.round((max === 0 ? 0 : delta / max) * 100)

  return { h, s, v }
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
  // h:0-360, s/v:0-100
  const sn = clamp(s / 100, 0, 1)
  const vn = clamp(v / 100, 0, 1)
  const c = vn * sn
  const hh = ((h % 360) + 360) % 360
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1))
  const m = vn - c

  let rn = 0
  let gn = 0
  let bn = 0

  if (0 <= hh && hh < 60) [rn, gn, bn] = [c, x, 0]
  else if (60 <= hh && hh < 120) [rn, gn, bn] = [x, c, 0]
  else if (120 <= hh && hh < 180) [rn, gn, bn] = [0, c, x]
  else if (180 <= hh && hh < 240) [rn, gn, bn] = [0, x, c]
  else if (240 <= hh && hh < 300) [rn, gn, bn] = [x, 0, c]
  else [rn, gn, bn] = [c, 0, x]

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  }
}

// ---------- RGB <-> CMYK ----------
export function rgbToCmyk({ r, g, b }: RGB): CMYK {
  // convert 0-255 -> 0-100
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 } // black
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const k = 1 - Math.max(rn, gn, bn)
  const c = (1 - rn - k) / (1 - k)
  const m = (1 - gn - k) / (1 - k)
  const y = (1 - bn - k) / (1 - k)

  return {
    c: Math.round(clamp(c, 0, 1) * 100),
    m: Math.round(clamp(m, 0, 1) * 100),
    y: Math.round(clamp(y, 0, 1) * 100),
    k: Math.round(clamp(k, 0, 1) * 100),
  }
}

export function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  // inputs 0-100 -> RGB 0-255
  const cn = clamp(c / 100, 0, 1)
  const mn = clamp(m / 100, 0, 1)
  const yn = clamp(y / 100, 0, 1)
  const kn = clamp(k / 100, 0, 1)

  const r = Math.round((1 - Math.min(1, cn * (1 - kn) + kn)) * 255) // alternative formula safe
  const g = Math.round((1 - Math.min(1, mn * (1 - kn) + kn)) * 255)
  const b = Math.round((1 - Math.min(1, yn * (1 - kn) + kn)) * 255)

  // A more standard conversion:
  // r = 255 * (1 - cn) * (1 - kn) etc.
  // but above gives stable results; let's use standard:
  return {
    r: Math.round(255 * (1 - cn) * (1 - kn)),
    g: Math.round(255 * (1 - mn) * (1 - kn)),
    b: Math.round(255 * (1 - yn) * (1 - kn)),
  }
}

// ---------- Cross converters: CMYK <-> HSV (via RGB) ----------
export function cmykToHsv(cmyk: CMYK): HSV {
  const rgb = cmykToRgb(cmyk)
  return rgbToHsv(rgb)
}

export function hsvToCmyk(hsv: HSV): CMYK {
  const rgb = hsvToRgb(hsv)
  return rgbToCmyk(rgb)
}

// ---------- HEX <-> HSV & HEX <-> CMYK (via RGB) ----------
export function hexToHsv(hex: string): HSV {
  return rgbToHsv(hexToRgb(hex))
}
export function hsvToHex(hsv: HSV): string {
  return rgbToHex(hsvToRgb(hsv))
}

export function hexToCmyk(hex: string): CMYK {
  return rgbToCmyk(hexToRgb(hex))
}
export function cmykToHex(cmyk: CMYK): string {
  return rgbToHex(cmykToRgb(cmyk))
}

// ---------- Additional direct converters for convenience ----------
export function rgbToHexString(r: number, g: number, b: number) {
  return rgbToHex({ r, g, b })
}
export function hexToRgbString(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return `${r},${g},${b}`
}

// ---------- Pantone: sample mapping + helpers ----------
/**
 * SAMPLE PANTONE MAP
 * Replace this object with a full JSON/CSV mapping for production.
 * The hex values here are approximate and for demonstration only.
 */
export const PANTONE_MAP: PantoneEntry[] = [
  { name: "PANTONE 186 C", hex: "#C8102E", rgb: hexToRgb("#C8102E"), cmyk: rgbToCmyk(hexToRgb("#C8102E")) },
  { name: "PANTONE 286 C", hex: "#0033A0", rgb: hexToRgb("#0033A0"), cmyk: rgbToCmyk(hexToRgb("#0033A0")) },
  { name: "PANTONE 347 C", hex: "#009639", rgb: hexToRgb("#009639"), cmyk: rgbToCmyk(hexToRgb("#009639")) },
  { name: "PANTONE 116 C", hex: "#FFC600", rgb: hexToRgb("#FFC600"), cmyk: rgbToCmyk(hexToRgb("#FFC600")) },
  { name: "PANTONE Process Cyan C", hex: "#00B5E2", rgb: hexToRgb("#00B5E2"), cmyk: rgbToCmyk(hexToRgb("#00B5E2")) },
  { name: "PANTONE Black C", hex: "#2D2926", rgb: hexToRgb("#2D2926"), cmyk: rgbToCmyk(hexToRgb("#2D2926")) },
  { name: "PANTONE Warm Red C", hex: "#FF4F00", rgb: hexToRgb("#FF4F00"), cmyk: rgbToCmyk(hexToRgb("#FF4F00")) },
]

export function pantoneToHex(name: string): string | null {
  const entry = PANTONE_MAP.find((p) => p.name.toLowerCase() === name.toLowerCase())
  return entry ? entry.hex : null
}
export function pantoneToRgb(name: string): RGB | null {
  const entry = PANTONE_MAP.find((p) => p.name.toLowerCase() === name.toLowerCase())
  return entry ? entry.rgb : null
}
export function pantoneToCmyk(name: string): CMYK | null {
  const entry = PANTONE_MAP.find((p) => p.name.toLowerCase() === name.toLowerCase())
  return entry ? entry.cmyk ?? rgbToCmyk(entry.rgb) : null
}
export function pantoneToHsv(name: string): HSV | null {
  const rgb = pantoneToRgb(name)
  return rgb ? rgbToHsv(rgb) : null
}

/** Find nearest Pantone by simple RGB Euclidean distance (replace with CIE Lab ΔE for accuracy) */
export function findNearestPantoneFromHex(hex: string): PantoneEntry {
  const rgb = hexToRgb(hex)
  return findNearestPantoneFromRgb(rgb)
}

export function findNearestPantoneFromRgb(rgb: RGB): PantoneEntry {
  let best = PANTONE_MAP[0]
  let bestDist = Number.POSITIVE_INFINITY
  for (const p of PANTONE_MAP) {
    const d =
      (p.rgb.r - rgb.r) * (p.rgb.r - rgb.r) +
      (p.rgb.g - rgb.g) * (p.rgb.g - rgb.g) +
      (p.rgb.b - rgb.b) * (p.rgb.b - rgb.b)
    if (d < bestDist) {
      bestDist = d
      best = p
    }
  }
  return best
}
