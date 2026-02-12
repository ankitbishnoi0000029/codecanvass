"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"
import yaml from "js-yaml"

export function Validators() {
  const [selectedTool, setSelectedTool] = useState<string>("")
  const [inputValue, setInputValue] = useState<string>("")
  const [output, setOutput] = useState<string>("")

  const converterOptions: SidebarOption[] = [
    { id: "css-validator", label: "CSS Validator", icon: FileText, description: "Validate CSS code for syntax errors and compatibility issues." },
    { id: "javascript-validator", label: "JavaScript Validator", icon: FileText, description: "Check JavaScript code for syntax errors and coding issues." },
    { id: "json-validator", label: "JSON Validator", icon: FileText, description: "Validate JSON data for proper syntax and formatting." },
    { id: "json5-validator", label: "JSON5 Validator", icon: FileText, description: "Validate JSON5 files for syntax correctness and structure." },
    { id: "xml-validator", label: "XML Validator", icon: FileText, description: "Check XML files for syntax errors and well-formedness." },
    { id: "credit-card-validator", label: "Credit Card Validator", icon: FileText, description: "Validate credit card numbers using standard algorithms." },
    { id: "api-test", label: "API Test", icon: FileText, description: "Test APIs by sending requests and inspecting responses." },
    { id: "yaml-validator", label: "YAML Validator", icon: FileText, description: "Validate YAML files for syntax and formatting errors." },
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const selectedOption = converterOptions.find(opt => opt.id === selectedTool)

  // Core validation logic
  const handleValidate = async () => {
    switch (selectedTool) {
      case "css-validator":
        try {
          const res = await fetch(
            `https://jigsaw.w3.org/css-validator/validator?text=${encodeURIComponent(
              inputValue
            )}&output=json`
          )
          const data = await res.json()
          const errors = data?.cssvalidation?.errors
          setOutput(
            errors?.length
              ? `❌ CSS Errors:\n${JSON.stringify(errors, null, 2)}`
              : "✅ CSS is valid!"
          )
        } catch {
          setOutput("Error validating CSS.")
        }
        break

      case "javascript-validator":
        try {
          new Function(inputValue)
          setOutput("✅ JavaScript syntax is valid!")
        } catch (err: any) {
          setOutput(`❌ JavaScript Error: ${err.message}`)
        }
        break

      case "json-validator":
        try {
          JSON.parse(inputValue)
          setOutput("✅ JSON is valid!")
        } catch (err: any) {
          setOutput(`❌ Invalid JSON: ${err.message}`)
        }
        break

      case "json5-validator":
        try {
          const JSON5 = (await import("json5")).default
          JSON5.parse(inputValue)
          setOutput("✅ JSON5 is valid!")
        } catch (err: any) {
          setOutput(`❌ Invalid JSON5: ${err.message}`)
        }
        break

      case "xml-validator":
        try {
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(inputValue, "application/xml")
          const parserError = xmlDoc.querySelector("parsererror")
          setOutput(
            parserError
              ? `❌ Invalid XML:\n${parserError.textContent}`
              : "✅ XML is valid!"
          )
        } catch {
          setOutput("Error validating XML.")
        }
        break

      case "credit-card-validator":
        const cardNumber = inputValue.replace(/\D/g, "")
        if (!cardNumber) {
          setOutput("❌ Please enter a credit card number.")
          break
        }
        const isValid = luhnCheck(cardNumber)
        setOutput(isValid ? "✅ Valid credit card number!" : "❌ Invalid credit card number.")
        break

      case "yaml-validator":
        try {
          yaml.load(inputValue)
          setOutput("✅ YAML is valid!")
        } catch (err: any) {
          setOutput(`❌ Invalid YAML: ${err.message}`)
        }
        break

      case "api-test":
        try {
          const res = await fetch(inputValue)
          const data = await res.json()
          setOutput(`✅ API Response:\n${JSON.stringify(data, null, 2)}`)
        } catch (err: any) {
          setOutput(`❌ API Request Failed: ${err.message}`)
        }
        break

      default:
        setOutput("Please select a validator.")
    }
  }

  const handleClear = () => {
    setInputValue("")
    setOutput("")
  }

  // Luhn algorithm for credit card validation
  const luhnCheck = (num: string) => {
    let arr = (num + "")
      .split("")
      .reverse()
      .map((x) => parseInt(x))
    let lastDigit = arr.shift()!
    let sum = arr.reduce(
      (acc, val, i) =>
        acc + (i % 2 === 0 ? ((val *= 2) > 9 ? val - 9 : val) : val),
      0
    )
    sum += lastDigit
    return sum % 10 === 0
  }

  return (
    <ReusableSidebar
      title="Validators"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedTool}
      onOptionSelect={setSelectedTool}
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full"
                rows={6}
                placeholder="Paste your code, data, or URL here..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <textarea
                readOnly
                value={output}
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full bg-gray-50"
                rows={6}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleValidate}>Validate</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
