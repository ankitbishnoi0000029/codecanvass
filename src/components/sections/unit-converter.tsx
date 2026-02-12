"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Download, Palette } from "lucide-react"

// Utility functions for conversions
const convertUnits = (type: string, inputValue: string) => {
  const value = parseFloat(inputValue)
  if (isNaN(value)) return "Please enter a valid number."

  switch (type) {
    case "length-converter":
      return `${value} meters = ${(value / 1000).toFixed(3)} kilometers = ${(value * 3.281).toFixed(3)} feet`
    case "weight-converter":
      return `${value} kilograms = ${(value * 1000).toFixed(2)} grams = ${(value * 2.205).toFixed(2)} pounds`
    case "volume-converter":
      return `${value} liters = ${(value * 1000).toFixed(2)} milliliters = ${(value * 0.264).toFixed(2)} gallons`
    case "area-converter":
      return `${value} square meters = ${(value * 10.764).toFixed(2)} square feet = ${(value * 0.000247).toFixed(6)} acres`
    case "time-converter":
      return `${value} seconds = ${(value / 60).toFixed(2)} minutes = ${(value / 3600).toFixed(2)} hours`
    case "unix-timestamp-converter":
      if (inputValue.length > 10) return new Date(value).toLocaleString()
      return `Unix Timestamp: ${value} → ${new Date(value * 1000).toLocaleString()}`
    default:
      return "Conversion not available."
  }
}

export function UnitConverter() {
  const [selectedConverter, setSelectedConverter] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [output, setOutput] = useState("")

  const converterOptions: SidebarOption[] = [
    {
      id: "length-converter",
      label: "Length Converter",
      icon: FileText,
      description: "Convert between meters, kilometers, miles, inches, and other length units."
    },
    {
      id: "weight-converter",
      label: "Weight Converter",
      icon: FileText,
      description: "Convert between grams, kilograms, pounds, and other weight units."
    },
    {
      id: "volume-converter",
      label: "Volume Converter",
      icon: FileText,
      description: "Convert between liters, milliliters, gallons, and other volume units."
    },
    {
      id: "area-converter",
      label: "Area Converter",
      icon: FileText,
      description: "Convert between square meters, square feet, acres, and other area units."
    },
    {
      id: "time-converter",
      label: "Time Converter",
      icon: FileText,
      description: "Convert between seconds, minutes, hours, days, and other time units."
    },
    {
      id: "unix-timestamp-converter",
      label: "Unix Timestamp Converter",
      icon: FileText,
      description: "Convert Unix timestamps to readable date formats and vice versa."
    },
    {
      id: "more-unit-tools",
      label: "More Unit Tools",
      icon: FileText,
      description: "Explore more unit conversion tools for temperature, pressure, and speed."
    }
  ]

  const footerOptions: SidebarOption[] = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings
    }
  ]

  const selectedOption = converterOptions.find(opt => opt.id === selectedConverter)

  // Handle converter change with auto-clear
  const handleConverterChange = (converterId: string) => {
    setSelectedConverter(converterId)
    setInputValue("")
    setOutput("")
  }

  const handleConvert = () => {
    if (!selectedConverter) {
      setOutput("Please select a converter.")
      return
    }
    const result = convertUnits(selectedConverter, inputValue)
    setOutput(result)
  }

  const handleClear = () => {
    setInputValue("")
    setOutput("")
  }

  return (
    <ReusableSidebar
      title="Unit Converter"
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
              {selectedOption?.label || "Select a Converter"}
            </h2>
            <p className="text-muted-foreground">
              {selectedOption?.description || "Choose a converter from the sidebar to get started."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Input Value</label>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter value..."
                  className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full"
                  rows={5}
                />
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Output</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center min-h-[100px] flex items-center justify-center">
                  {output ? (
                    <p className="text-sm text-gray-800 whitespace-pre-line">{output}</p>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <Download className="h-8 w-8 mb-2" />
                      <p className="text-sm">Converted results will appear here</p>
                    </div>
                  )}
                </div>
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