"use client"

import { useState, useEffect } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { Clipboard, Download, Hash } from "lucide-react"
import CryptoJS from "crypto-js"
import crc32 from "crc-32"

// -----------------------
// Hash Functions
// -----------------------
function generateHash(algo: string, text: string): string {
  switch (algo.toLowerCase()) {
    case "md2":
    case "md4":
    case "whirlpool":
    case "shake128":
    case "shake256":
    case "checksum":
      return `${algo.toUpperCase()} not implemented` // You can expand later

    case "md5":
      return CryptoJS.MD5(text).toString()
    case "sha1":
      return CryptoJS.SHA1(text).toString()
    case "sha224":
      return CryptoJS.SHA224(text).toString()
    case "sha256":
    case "sha2":
      return CryptoJS.SHA256(text).toString()
    case "sha384":
      return CryptoJS.SHA384(text).toString()
    case "sha512":
      return CryptoJS.SHA512(text).toString()
    case "sha3":
      return CryptoJS.SHA3(text).toString()
    case "crc32":
    case "crc-32":
      return (crc32.str(text) >>> 0).toString(16).padStart(8, "0")
    default:
      return "Unsupported Algorithm"
  }
}

// --------------------------------
// Sidebar Items (MATCHES SCREENSHOT)
// --------------------------------
const hashTools: SidebarOption[] = [
  { id: "md2", label: "MD2 Hash Generator", icon: Hash },
  { id: "md4", label: "MD4 Hash Generator", icon: Hash },
  { id: "md5", label: "MD5 Hash Generator", icon: Hash },
  { id: "ntlm", label: "NTLM Hash Generator", icon: Hash },
  { id: "sha1", label: "SHA1 Hash Generator", icon: Hash },
  { id: "sha2", label: "SHA2 Hash Generator", icon: Hash },
  { id: "sha224", label: "SHA224 Hash Generator", icon: Hash },
  { id: "sha256", label: "SHA256 Hash Generator", icon: Hash },
  { id: "sha384", label: "SHA384 Hash Generator", icon: Hash },
  { id: "sha512", label: "SHA512 Hash Generator", icon: Hash },
  { id: "sha512-224", label: "SHA512/224 Hash Generator", icon: Hash },
  { id: "sha512-256", label: "SHA512/256 Hash Generator", icon: Hash },
  { id: "sha3-224", label: "SHA3-224 Hash Generator", icon: Hash },
  { id: "sha3-256", label: "SHA3-256 Hash Generator", icon: Hash },
  { id: "sha3-384", label: "SHA3-384 Hash Generator", icon: Hash },
  { id: "sha3-512", label: "SHA3-512 Hash Generator", icon: Hash },
  { id: "crc-16", label: "CRC-16 Hash Generator", icon: Hash },
  { id: "crc-32", label: "CRC-32 Hash Generator", icon: Hash },
  { id: "shake128", label: "Shake-128 Hash Generator", icon: Hash },
  { id: "shake256", label: "Shake-256 Hash Generator", icon: Hash },
  { id: "md6", label: "MD6 Hash Generator", icon: Hash },
  { id: "whirlpool", label: "Whirlpool Hash Generator", icon: Hash },
  { id: "checksum", label: "Checksum Calculator", icon: Hash },
]

export function HashTools({ defaultTool = "sha256" }: { defaultTool?: string }) {
  const [selectedTool, setSelectedTool] = useState(defaultTool)
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [auto, setAuto] = useState(true)

  const selectedOption = hashTools.find((t) => t.id === selectedTool)

  useEffect(() => {
    if (auto) {
      setOutput(generateHash(selectedTool, input))
    }
  }, [input, selectedTool, auto])

  const handleGenerate = () => {
    setOutput(generateHash(selectedTool, input))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    alert("Copied!")
  }

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${selectedTool}.txt`
    link.click()
  }

  return (
    <ReusableSidebar
      title="Hash Generators"
      icon={Hash}
      options={hashTools}
      selectedOption={selectedTool}
      onOptionSelect={(id) => {
        setSelectedTool(id)
        setInput("")
        setOutput("")
      }}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="space-y-6">

          <div>
            <h2 className="text-2xl font-bold">{selectedOption?.label}</h2>
            <p className="text-muted-foreground">
              Enter text to generate a {selectedTool.toUpperCase()} hash.
            </p>
          </div>

          {/* INPUT + OUTPUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* INPUT */}
            <div>
              <label className="font-medium text-sm mb-2 block">Input Text</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border rounded w-full p-3 h-48 text-sm"
                placeholder="Enter text here..."
              />
              <div className="mt-4 flex gap-3">
                <Button onClick={handleGenerate}>Generate</Button>
                <Button variant="secondary" onClick={() => setInput("")}>Clear</Button>
              </div>
            </div>

            {/* OUTPUT */}
            <div>
              <label className="font-medium text-sm mb-2 block">Output Hash</label>
              <div className="border rounded w-full p-3 h-48 bg-gray-100 text-sm overflow-auto">
                {output ? (
                  <code>{output}</code>
                ) : (
                  <span className="text-gray-400">Hash will appear here...</span>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <Button variant="secondary" onClick={handleCopy}>
                  <Clipboard className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button variant="secondary" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
            </div>
          </div>

        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}

export default HashTools
