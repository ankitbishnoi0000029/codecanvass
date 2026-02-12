"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"

// --- Number / Text Conversion Utilities ---
const converters = {
  "decimal-to-binary": (input: string) => parseInt(input).toString(2),
  "decimal-to-octal": (input: string) => parseInt(input).toString(8),
  "binary-to-decimal": (input: string) => parseInt(input, 2).toString(10),
  "binary-to-hex": (input: string) => parseInt(input, 2).toString(16),
  "binary-to-octal": (input: string) => parseInt(input, 2).toString(8),
  "hex-to-decimal": (input: string) => parseInt(input, 16).toString(10),
  "hex-to-binary": (input: string) => parseInt(input, 16).toString(2),
  "hex-to-octal": (input: string) => parseInt(input, 16).toString(8),
  "octal-to-decimal": (input: string) => parseInt(input, 8).toString(10),
  "octal-to-binary": (input: string) => parseInt(input, 8).toString(2),
  "octal-to-hex": (input: string) => parseInt(input, 8).toString(16),
  "binary-to-text": (input: string) =>
    input.split(" ").map(b => String.fromCharCode(parseInt(b, 2))).join(""),
  "text-to-binary": (input: string) =>
    input.split("").map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" "),
  "ascii-to-text": (input: string) =>
    input.split(" ").map(a => String.fromCharCode(parseInt(a))).join(""),
  "char-to-ascii": (input: string) =>
    input.split("").map(c => c.charCodeAt(0).toString()).join(" "),
  "reverse-hex": (input: string) =>
    input.match(/.{1,2}/g)?.reverse().join("") || ""
}

export function NumberUtilities() {
  const [selectedConverter, setSelectedConverter] = useState("")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const converterOptions: SidebarOption[] = Object.keys(converters).map(id => ({
    id,
    label: id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    icon: FileText,
    description: `Perform ${id.replace(/-/g, " ")} operation`
  }))

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  const selectedOption = converterOptions.find(opt => opt.id === selectedConverter)

  const handleConvert = () => {
    const func = converters[selectedConverter as keyof typeof converters]
    if (func) {
      try {
        setOutput(func(input))
      } catch {
        setOutput("Invalid input for conversion")
      }
    } else {
      setOutput("Select a converter")
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  return (
    <ReusableSidebar
      title="Number Utilities"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={setSelectedConverter}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{selectedOption?.label}</h2>
            <p className="text-muted-foreground">{selectedOption?.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full"
                rows={6}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <textarea
                value={output}
                readOnly
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full bg-gray-50"
                rows={6}
              />
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
