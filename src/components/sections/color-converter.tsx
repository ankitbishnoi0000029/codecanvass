"use client"

import { useState, useEffect } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Settings,
  Download,
  Palette
} from "lucide-react"

import {
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  rgbToCmyk,
  cmykToRgb,
  cmykToHsv,
  hsvToCmyk,
  hexToHsv,
  hsvToHex,
  hexToCmyk,
  cmykToHex,
  pantoneToHex,
  pantoneToRgb,
  pantoneToCmyk,
  pantoneToHsv,
  findNearestPantoneFromHex,
  findNearestPantoneFromRgb,
  hsvToRgb as hsv2rgb,
  cmykToRgb as cmyk2rgb,
  rgbToHex as rgb2hex,
  hexToRgb as hex2rgb
} from '@/utils/utils/colorUtils'

export function ColorConverter() {
  const [selectedConverter, setSelectedConverter] = useState<string>("")
  const [inputValue, setInputValue] = useState<string>("")
  const [output, setOutput] = useState<string>("")

  const converterOptions: SidebarOption[] = [
    { id: "hex-to-pantone", label: "HEX to Pantone Converter", icon: FileText },
    { id: "rgb-to-pantone", label: "RGB to Pantone Converter", icon: FileText },
    { id: "hsv-to-pantone", label: "HSV to Pantone Converter", icon: FileText },
    { id: "cmyk-to-pantone", label: "CMYK to Pantone Converter", icon: FileText },
    { id: "cmyk-to-hex", label: "CMYK to HEX Converter", icon: FileText },
    { id: "cmyk-to-rgb", label: "CMYK to RGB Converter", icon: FileText },
    { id: "cmyk-to-hsv", label: "CMYK to HSV Converter", icon: FileText },
    { id: "hsv-to-hex", label: "HSV to HEX Converter", icon: FileText },
    { id: "hsv-to-rgb", label: "HSV to RGB Converter", icon: FileText },
    { id: "hsv-to-cmyk", label: "HSV to CMYK Converter", icon: FileText },
    { id: "hex-to-hsv", label: "HEX to HSV Converter", icon: FileText },
    { id: "rgb-to-hex", label: "RGB to HEX Converter", icon: FileText },
    { id: "rgb-to-hsv", label: "RGB to HSV Converter", icon: FileText },
    { id: "rgb-to-cmyk", label: "RGB to CMYK Converter", icon: FileText },
    { id: "hex-to-rgb", label: "HEX to RGB Converter", icon: FileText },
    { id: "hex-to-cmyk", label: "HEX to CMYK Converter", icon: FileText },
    { id: "pantone-to-hex", label: "Pantone to HEX Converter", icon: FileText },
    { id: "pantone-to-rgb", label: "Pantone to RGB Converter", icon: FileText },
    { id: "pantone-to-cmyk", label: "Pantone to CMYK Converter", icon: FileText },
    { id: "pantone-to-hsv", label: "Pantone to HSV Converter", icon: FileText }
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  // Automatic reset when converter changes
  useEffect(() => {
    setInputValue("")
    setOutput("")
  }, [selectedConverter])

  const selectedOption = converterOptions.find(opt => opt.id === selectedConverter)

  const handleConverterChange = (id: string) => {
    setSelectedConverter(id)
    // Input and output will auto-clear via useEffect
  }

  const handleConvert = () => {
  try {
    let result = ""
    const val = inputValue.trim()

    switch (selectedConverter) {
      // Pantone conversions
      case "hex-to-pantone": {
        if (!val.match(/^#?[0-9A-Fa-f]{6}$/)) {
          result = "Invalid HEX format. Use: #FF5733 or FF5733"
          break
        }
        const pantone = findNearestPantoneFromHex(val)
        result = `${pantone.name} (${pantone.hex})`
        break
      }
      
      case "rgb-to-pantone": {
        const cleaned = val.replace(/[RGBrgb:\s]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 3) {
          result = "Invalid RGB format. Use: 255,87,51"
          break
        }
        
        const [r, g, b] = parts.map(Number)
        
        if ([r, g, b].some(isNaN)) {
          result = "Invalid RGB format. Use: 255,87,51"
          break
        }
        
        const pantone = findNearestPantoneFromRgb({ r, g, b })
        result = `${pantone.name} (${pantone.hex})`
        break
      }
      
      case "hsv-to-pantone": {
        const cleaned = val.replace(/[HSVhsv:\s%°]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 3) {
          result = "Invalid HSV format. Use: 0,100,100"
          break
        }
        
        const [h, s, v] = parts.map(Number)
        
        if ([h, s, v].some(isNaN)) {
          result = "Invalid HSV format. Use: 0,100,100"
          break
        }
        
        const rgb = hsvToRgb({ h, s, v })
        const pantone = findNearestPantoneFromRgb(rgb)
        result = `${pantone.name} (${pantone.hex})`
        break
      }
      
      case "cmyk-to-pantone": {
        const cleaned = val.replace(/[CMYKcmyk:\s%]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 4) {
          result = "Invalid CMYK format. Use: 0,100,100,0"
          break
        }
        
        const [c, m, y, k] = parts.map(Number)
        
        if ([c, m, y, k].some(isNaN)) {
          result = "Invalid CMYK format. Use: 0,100,100,0"
          break
        }
        
        const rgb = cmykToRgb({ c, m, y, k })
        const pantone = findNearestPantoneFromRgb(rgb)
        result = `${pantone.name} (${pantone.hex})`
        break
      }

      // CMYK conversions
      case "cmyk-to-hex": {
        const cleaned = val.replace(/[CMYKcmyk:\s%]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 4) {
          result = "Invalid CMYK format. Use: 0,100,100,0"
          break
        }
        
        const [c, m, y, k] = parts.map(Number)
        
        if ([c, m, y, k].some(isNaN)) {
          result = "Invalid CMYK format. Use: 0,100,100,0"
          break
        }
        
        result = cmykToHex({ c, m, y, k })
        break
      }
      
      case "cmyk-to-rgb": {
        const cleaned = val.replace(/[CMYKcmyk:\s%]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 4) {
          result = "Invalid CMYK format. Use: 0,100,100,0"
          break
        }
        
        const [c, m, y, k] = parts.map(Number)
        
        if ([c, m, y, k].some(isNaN)) {
          result = "Invalid CMYK format. Use: 0,100,100,0"
          break
        }
        
        result = JSON.stringify(cmykToRgb({ c, m, y, k }))
        break
      }
      
      case "cmyk-to-hsv": {
        const cleaned = val.replace(/[CMYKcmyk:\s%]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 4) {
          result = "Invalid CMYK format. Use: 0,100,100,0"
          break
        }
        
        const [c, m, y, k] = parts.map(Number)
        
        if ([c, m, y, k].some(isNaN)) {
          result = "Invalid CMYK format. Use: 0,100,100,0"
          break
        }
        
        result = JSON.stringify(cmykToHsv({ c, m, y, k }))
        break
      }

      // HSV conversions
      case "hsv-to-hex": {
        const cleaned = val.replace(/[HSVhsv:\s%°]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 3) {
          result = "Invalid HSV format. Use: 0,100,100"
          break
        }
        
        const [h, s, v] = parts.map(Number)
        
        if ([h, s, v].some(isNaN)) {
          result = "Invalid HSV format. Use: 0,100,100"
          break
        }
        
        result = hsvToHex({ h, s, v })
        break
      }
      
      case "hsv-to-rgb": {
        const cleaned = val.replace(/[HSVhsv:\s%°]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 3) {
          result = "Invalid HSV format. Use: 0,100,100"
          break
        }
        
        const [h, s, v] = parts.map(Number)
        
        if ([h, s, v].some(isNaN)) {
          result = "Invalid HSV format. Use: 0,100,100"
          break
        }
        
        result = JSON.stringify(hsvToRgb({ h, s, v }))
        break
      }
      
      case "hsv-to-cmyk": {
        const cleaned = val.replace(/[HSVhsv:\s%°]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 3) {
          result = "Invalid HSV format. Use: 0,100,100"
          break
        }
        
        const [h, s, v] = parts.map(Number)
        
        if ([h, s, v].some(isNaN)) {
          result = "Invalid HSV format. Use: 0,100,100"
          break
        }
        
        result = JSON.stringify(hsvToCmyk({ h, s, v }))
        break
      }

      // HEX conversions
      case "hex-to-hsv": {
        if (!val.match(/^#?[0-9A-Fa-f]{6}$/)) {
          result = "Invalid HEX format. Use: #FF5733 or FF5733"
          break
        }
        result = JSON.stringify(hexToHsv(val))
        break
      }
      
      case "hex-to-rgb": {
        if (!val.match(/^#?[0-9A-Fa-f]{6}$/)) {
          result = "Invalid HEX format. Use: #FF5733 or FF5733"
          break
        }
        result = JSON.stringify(hexToRgb(val))
        break
      }
      
      case "hex-to-cmyk": {
        if (!val.match(/^#?[0-9A-Fa-f]{6}$/)) {
          result = "Invalid HEX format. Use: #FF5733 or FF5733"
          break
        }
        result = JSON.stringify(hexToCmyk(val))
        break
      }

      // RGB conversions
      case "rgb-to-hex": {
        const cleaned = val.replace(/[RGBrgb:\s]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 3) {
          result = "Invalid RGB format. Use: 255,87,51"
          break
        }
        
        const [r, g, b] = parts.map(Number)
        
        if ([r, g, b].some(isNaN)) {
          result = "Invalid RGB format. Use: 255,87,51"
          break
        }
        
        result = rgbToHex({ r, g, b })
        break
      }
      
      case "rgb-to-hsv": {
        const cleaned = val.replace(/[RGBrgb:\s]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 3) {
          result = "Invalid RGB format. Use: 255,87,51"
          break
        }
        
        const [r, g, b] = parts.map(Number)
        
        if ([r, g, b].some(isNaN)) {
          result = "Invalid RGB format. Use: 255,87,51"
          break
        }
        
        result = JSON.stringify(rgbToHsv({ r, g, b }))
        break
      }
      
      case "rgb-to-cmyk": {
        const cleaned = val.replace(/[RGBrgb:\s]/g, '').trim()
        const parts = cleaned.split(",")
        
        if (parts.length !== 3) {
          result = "Invalid RGB format. Use: 255,87,51"
          break
        }
        
        const [r, g, b] = parts.map(Number)
        
        if ([r, g, b].some(isNaN)) {
          result = "Invalid RGB format. Use: 255,87,51"
          break
        }
        
        result = JSON.stringify(rgbToCmyk({ r, g, b }))
        break
      }

      // Pantone to other formats
      case "pantone-to-hex": {
        result = pantoneToHex(val) ?? "Not found"
        break
      }
      
      case "pantone-to-rgb": {
        const rgb = pantoneToRgb(val)
        result = rgb ? JSON.stringify(rgb) : "Not found"
        break
      }
      
      case "pantone-to-cmyk": {
        const cmyk = pantoneToCmyk(val)
        result = cmyk ? JSON.stringify(cmyk) : "Not found"
        break
      }
      
      case "pantone-to-hsv": {
        const hsv = pantoneToHsv(val)
        result = hsv ? JSON.stringify(hsv) : "Not found"
        break
      }
      
      default:
        result = "Select a converter and provide valid input."
    }

    setOutput(result)
  } catch (err) {
    setOutput("Error: Invalid input format.")
  }
}

  const handleClear = () => {
    setInputValue("")
    setOutput("")
  }

  return (
    <ReusableSidebar
      title="Color Converter"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleConverterChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {selectedOption?.label ?? "Choose a converter"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Input</label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full"
                rows={5}
                placeholder={
                  selectedConverter?.includes("rgb")
                    ? "Enter RGB like 255,0,0"
                    : selectedConverter?.includes("hsv")
                    ? "Enter HSV like 0,100,100"
                    : selectedConverter?.includes("cmyk")
                    ? "Enter CMYK like 0,100,100,0"
                    : selectedConverter?.includes("pantone")
                    ? "Enter Pantone name like PANTONE 186 C"
                    : "#FF0000"
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[120px] break-all">
                {output || <span className="text-gray-400 text-sm">Converted result will appear here.</span>}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleConvert}>Convert</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}