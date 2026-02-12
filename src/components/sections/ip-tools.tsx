"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"

// --- IP Conversion Utilities ---
const ipConverters = {
  "hex-to-ip": (input: string) => {
    if (!/^[\da-fA-F]{8}$/.test(input)) return "Invalid hex"
    return input.match(/.{2}/g)!.map(b => parseInt(b, 16)).join(".")
  },
  "ip-to-hex": (input: string) => {
    const parts = input.split(".").map(p => parseInt(p))
    if (parts.some(p => isNaN(p) || p < 0 || p > 255)) return "Invalid IP"
    return parts.map(p => p.toString(16).padStart(2, "0")).join("")
  },
  "binary-to-ip": (input: string) => {
    const parts = input.split(".").map(b => parseInt(b, 2))
    if (parts.some(p => isNaN(p) || p < 0 || p > 255)) return "Invalid binary IP"
    return parts.join(".")
  },
  "ip-to-binary": (input: string) => {
    const parts = input.split(".").map(p => parseInt(p))
    if (parts.some(p => isNaN(p) || p < 0 || p > 255)) return "Invalid IP"
    return parts.map(p => p.toString(2).padStart(8, "0")).join(".")
  },
  "decimal-to-ip": (input: string) => {
    const dec = parseInt(input)
    if (isNaN(dec) || dec < 0 || dec > 4294967295) return "Invalid decimal"
    return [
      (dec >> 24) & 255,
      (dec >> 16) & 255,
      (dec >> 8) & 255,
      dec & 255
    ].join(".")
  },
  "ip-to-decimal": (input: string) => {
    const parts = input.split(".").map(p => parseInt(p))
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return "Invalid IP"
    return (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0).toString()
  },
  "octal-to-ip": (input: string) => {
    const dec = parseInt(input, 8)
    if (isNaN(dec)) return "Invalid octal"
    return ipConverters["decimal-to-ip"](dec.toString())
  },
  "ip-to-octal": (input: string) => {
    const dec = ipConverters["ip-to-decimal"](input)
    if (typeof dec === "string") return dec
    return Number(dec).toString(8)
  },
  "ipv6-to-binary": (input: string) => {
    // Expand IPv6 shorthand
    const expandIPv6 = (ip: string): string => {
      if (!ip.includes('::')) {
        return ip;
      }
      const parts = ip.split('::');
      if (parts.length !== 2) return 'Invalid IPv6';
      const left = parts[0].split(':').filter(p => p);
      const right = parts[1].split(':').filter(p => p);
      const missing = 8 - left.length - right.length;
      if (missing < 0) return 'Invalid IPv6';
      const zeros = Array(missing).fill('0000');
      return left.concat(zeros, right).map(h => h.padStart(4, '0')).join(':');
    };
    const full = expandIPv6(input);
    if (full === 'Invalid IPv6') return full;
    return full.split(':').map(h => parseInt(h, 16).toString(2).padStart(16, '0')).join(':');
  }
}

export function IPTools() {
  const [selectedConverter, setSelectedConverter] = useState("")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const converterOptions: SidebarOption[] = Object.keys(ipConverters).map(id => ({
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
    const func = ipConverters[selectedConverter as keyof typeof ipConverters]
    if (func) {
      try {
        setOutput(func(input))
      } catch {
        setOutput("Error performing conversion")
      }
    } else {
      setOutput("Select a valid converter")
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  return (
    <ReusableSidebar
      title="IP Utilities"
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
