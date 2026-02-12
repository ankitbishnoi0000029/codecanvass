"use client"

import { useState } from "react"
import { FileText, Settings, Palette } from "lucide-react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"

// --- Utility Functions ---
const utils: Record<string, (text: string) => string> = {
  "reverse-string": (text) => text.split("").reverse().join(""),
  "remove-punctuation": (text) => text.replace(/[^\w\s]|_/g, ""),
  "remove-extra-spaces": (text) => text.replace(/\s+/g, " ").trim(),
  "remove-empty-lines": (text) => text.split("\n").filter((l) => l.trim() !== "").join("\n"),
  "remove-duplicate-lines": (text) => [...new Set(text.split("\n"))].join("\n"),
  "remove-whitespace": (text) => text.replace(/\s/g, ""),
  "remove-line-breaks": (text) => text.replace(/(\r\n|\n|\r)/gm, " "),
  "case-converter": (text) => text.toUpperCase(),
  "word-counter": (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean)
    return `Words: ${words.length}, Characters: ${text.length}`
  },
  "word-sorter": (text) => text.split(/\s+/).sort((a, b) => a.localeCompare(b)).join(" "),
  "sort-text-lines": (text) => text.split("\n").sort((a, b) => a.localeCompare(b)).join("\n"),
  "word-frequency-counter": (text) => {
    const freq: Record<string, number> = {}
    text.split(/\s+/).forEach((w) => {
      const word = w.toLowerCase()
      if (word) freq[word] = (freq[word] || 0) + 1
    })
    return Object.entries(freq)
      .map(([w, c]) => `${w}: ${c}`)
      .join("\n")
  },
  "string-to-hex-converter": (text) =>
    Array.from(text).map((c) => c.charCodeAt(0).toString(16)).join(" "),
  "hex-to-string-converter": (text) =>
    text
      .split(" ")
      .map((h) => String.fromCharCode(parseInt(h, 16)))
      .join(""),
  "string-to-binary-converter": (text) =>
    text
      .split("")
      .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" "),
  "binary-to-string-converter": (text) =>
    text
      .split(" ")
      .map((b) => String.fromCharCode(parseInt(b, 2)))
      .join(""),
  "remove-accents": (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  "text-repeater": (text) => text.repeat(2),
  "word-repeater": (text) => text.split(" ").map((w) => w + " " + w).join(" "),
  "number-to-word-converter": (text) => {
    const num = parseInt(text)
    if (isNaN(num)) return "Please enter a number"
    return num.toLocaleString("en-IN", { maximumFractionDigits: 0 })
  },
  "word-to-number-converter": (text) => {
    const words: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    }
    return text
      .toLowerCase()
      .split(" ")
      .map((w) => (words[w] !== undefined ? words[w] : "?"))
      .join(" ")
  },
  "random-word-generator": () => {
    const words = ["apple", "banana", "sky", "mountain", "river", "dream", "code", "magic"]
    return Array.from({ length: 5 }, () => words[Math.floor(Math.random() * words.length)]).join(" ")
  },
  "password-generator": () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  },
  "ntlm-hash-generator": (text) => {
    // Simple hash simulation (not real NTLM)
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i)
      hash |= 0
    }
    return "NTLM-" + Math.abs(hash).toString(16)
  },
  "upside-down-text": (text) => {
    const map: Record<string, string> = {
      a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ",
      i: "ᴉ", j: "ɾ", k: "ʞ", l: "ן", m: "ɯ", n: "u", o: "o", p: "d",
      q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x",
      y: "ʎ", z: "z"
    }
    return text
      .split("")
      .reverse()
      .map((ch) => map[ch.toLowerCase()] || ch)
      .join("")
  },
  "string-builder": (text) => `Built String: ${text}`
}

export function StringUtilities() {
  const [selectedConverter, setSelectedConverter] = useState<string>("")
  const [input, setInput] = useState<string>("")
  const [output, setOutput] = useState<string>("")

  const converterOptions: SidebarOption[] = Object.keys(utils).map((id) => ({
    id,
    label: id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    icon: FileText,
    description: `Perform ${id.replace(/-/g, " ")} operation`
  }))

  const footerOptions: SidebarOption[] = [{ id: "settings", label: "Settings", icon: Settings }]

  const selectedOption = converterOptions.find((opt) => opt.id === selectedConverter)

  const handleConvert = () => {
    const func = utils[selectedConverter]
    if (func) {
      try {
        setOutput(func(input))
      } catch (error) {
        setOutput("Error performing conversion")
      }
    } else {
      setOutput("Select a valid utility")
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  return (
    <ReusableSidebar
      title="String Utilities"
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
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
