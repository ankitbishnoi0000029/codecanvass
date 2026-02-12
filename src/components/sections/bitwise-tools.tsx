"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"

// Helper functions for bitwise operations
const performBitwiseOperation = (a: string, b: string, type: string): string => {
  const numA = parseInt(a, 2)
  const numB = parseInt(b, 2)

  if (isNaN(numA) || isNaN(numB)) return "Invalid binary input"

  let result = 0
  switch (type) {
    case "bitwise-calculator":
      result = numA & numB
      break
    case "and-calculator":
      result = numA & numB
      break
    case "or-calculator":
      result = numA | numB
      break
    case "xor-calculator":
      result = numA ^ numB
      break
    case "nand-calculator":
      result = ~(numA & numB)
      break
    case "nor-calculator":
      result = ~(numA | numB)
      break
    case "xnor-calculator":
      result = ~(numA ^ numB)
      break
    default:
      return "Unknown operation"
  }

  // Keep result in 8-bit binary for display
  const bin = (result >>> 0).toString(2)
  return bin.slice(-8).padStart(8, "0")
}

export function BitwiseTools() {
  const [selectedConverter, setSelectedConverter] = useState("")
  const [inputA, setInputA] = useState("")
  const [inputB, setInputB] = useState("")
  const [output, setOutput] = useState("")

  const converterOptions: SidebarOption[] = [
    {
      id: "bitwise-calculator",
      label: "Bitwise Calculator",
      icon: FileText,
      description: "Perform general bitwise operations on binary numbers."
    },
    {
      id: "xor-calculator",
      label: "XOR Calculator",
      icon: FileText,
      description: "Calculate XOR of two binary numbers."
    },
    {
      id: "and-calculator",
      label: "AND Calculator",
      icon: FileText,
      description: "Calculate AND of two binary numbers."
    },
    {
      id: "nand-calculator",
      label: "NAND Calculator",
      icon: FileText,
      description: "Calculate NAND (NOT AND) of two binary numbers."
    },
    {
      id: "or-calculator",
      label: "OR Calculator",
      icon: FileText,
      description: "Calculate OR of two binary numbers."
    },
    {
      id: "nor-calculator",
      label: "NOR Calculator",
      icon: FileText,
      description: "Calculate NOR (NOT OR) of two binary numbers."
    },
    {
      id: "xnor-calculator",
      label: "XNOR Calculator",
      icon: FileText,
      description: "Calculate XNOR (NOT XOR) of two binary numbers."
    }
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  const selectedOption = converterOptions.find(opt => opt.id === selectedConverter)

  const handleConvert = () => {
    if (!selectedConverter) return setOutput("Please select a calculator")
    if (!inputA || !inputB) return setOutput("Please enter both binary inputs")

    const result = performBitwiseOperation(inputA, inputB, selectedConverter)
    setOutput(result)
  }

  const handleClear = () => {
    setInputA("")
    setInputB("")
    setOutput("")
  }

  return (
    <ReusableSidebar
      title="Bitwise Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={setSelectedConverter}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {selectedOption?.label || "Select a calculator"}
            </h2>
            <p className="text-muted-foreground">
              {selectedOption?.description || "Choose a bitwise calculator to start."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Binary Input A</label>
                <input
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value.replace(/[^01]/g, ""))}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                  placeholder="Enter binary (e.g. 10101010)"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Binary Input B</label>
                <input
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value.replace(/[^01]/g, ""))}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                  placeholder="Enter binary (e.g. 11001100)"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium mb-2 block">Output</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center min-h-[100px] flex items-center justify-center">
                <p className="text-lg font-mono break-all">
                  {output || "Result will appear here"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleConvert}>Convert</Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
