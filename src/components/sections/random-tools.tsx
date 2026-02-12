"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

// --- Random Utilities ---
const randomUtils = {
  "random-ip-address": () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join("."),
  "random-time-generator": () => new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  "random-uuid-generator": () => uuidv4(),
  "random-json-generator": () => JSON.stringify({ a: Math.random(), b: Math.random(), c: Math.random() }, null, 2),
  "random-xml-generator": () => `<root><a>${Math.random()}</a><b>${Math.random()}</b></root>`,
  "random-data-from-regex": () => "Example123", // Can integrate a regex generator if needed
  "random-csv-generator": () => "id,name,score\n1,John,85\n2,Jane,92",
  "random-number-generator": () => Math.random().toString(),
  "random-integer-generator": () => Math.floor(Math.random() * 100),
  "random-prime-generator": () => {
    const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]
    return primes[Math.floor(Math.random() * primes.length)]
  },
  "random-date-generator": () => new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toDateString(),
  "random-bitmap-generator": () => "[Random bitmap data]",
  "random-name-picker": () => ["Alice","Bob","Charlie","David"][Math.floor(Math.random()*4)],
  "text-lines-shuffler": () => ["line1","line2","line3"].sort(() => Math.random()-0.5).join("\n"),
  "mac-address-generator": () => Array.from({ length: 6 }, () => Math.floor(Math.random()*256).toString(16).padStart(2,"0")).join(":"),
  "random-hex-generator": () => Math.floor(Math.random()*0xffffff).toString(16),
  "random-tsv-generator": () => "col1\tcol2\nval1\tval2",
  "random-string-generator": () => Math.random().toString(36).substring(2, 12),
  "random-fraction-generator": () => (Math.random()).toFixed(2),
  "random-integer-range-generator": () => Math.floor(Math.random() * 100),
  "random-binary-generator": () => Math.floor(Math.random()*2).toString(),
  "random-byte-generator": () => Math.floor(Math.random()*256).toString(),
  "random-decimal-generator": () => (Math.random()*100).toFixed(2),
  "random-alphanumeric-generator": () => Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function RandomTools() {
  const [selectedConverter, setSelectedConverter] = useState("")
  const [output, setOutput] = useState("")

  const converterOptions: SidebarOption[] = Object.keys(randomUtils).map(id => ({
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
    const func = randomUtils[selectedConverter as keyof typeof randomUtils]
    if (func) {
      try {
        const result = func()
        setOutput(String(result))
      } catch {
        setOutput("Error generating data")
      }
    } else {
      setOutput("Select a valid generator")
    }
  }

  const handleClear = () => setOutput("")

  return (
    <ReusableSidebar
      title="Random Utilities"
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
              <label className="text-sm font-medium mb-2 block">Output</label>
              <textarea
                value={output}
                readOnly
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full bg-gray-50"
                rows={10}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleConvert}>Generate</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
