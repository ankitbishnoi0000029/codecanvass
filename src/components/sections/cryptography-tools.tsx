"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"
import CryptoJS from "crypto-js"

export function CryptographyTools() {
  const [selectedOptionId, setSelectedOptionId] = useState("")
  const [inputText, setInputText] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [outputText, setOutputText] = useState("")

  const converterOptions: SidebarOption[] = [
    { id: "encryption-decryption", label: "Encryption / Decryption", icon: FileText, description: "Encrypt or decrypt text using AES encryption." },
    { id: "hmac-generator", label: "HMAC Generator", icon: FileText, description: "Generate HMAC signatures for secure data integrity verification." },
    { id: "md5-hash-generator", label: "MD5 Hash Generator", icon: FileText, description: "Generate MD5 hash for text or data." },
    { id: "sha1-hash-generator", label: "SHA1 Hash Generator", icon: FileText, description: "Generate SHA-1 hash for text or data." },
    { id: "sha256-hash-generator", label: "SHA256 Hash Generator", icon: FileText, description: "Generate SHA-256 hash for text or data." },
    { id: "sha512-hash-generator", label: "SHA512 Hash Generator", icon: FileText, description: "Generate SHA-512 hash for text or data." },
    { id: "sha3-256-hash-generator", label: "SHA3-256 Hash Generator", icon: FileText, description: "Generate SHA3-256 hash for text or data." },
    { id: "crc32-hash-generator", label: "CRC32 Hash Generator", icon: FileText, description: "Generate CRC-32 hash for data integrity checks." }
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  const selectedOption = converterOptions.find(opt => opt.id === selectedOptionId)

  const handleConvert = () => {
    if (!inputText.trim()) {
      setOutputText("Please enter text to process.")
      return
    }

    try {
      let result = ""

      switch (selectedOptionId) {
        case "encryption-decryption":
          if (!secretKey) {
            setOutputText("Please enter a secret key.")
            return
          }
          // Encrypt if plain text, decrypt if cipher
          if (/^[A-Za-z0-9+/=]+$/.test(inputText)) {
            // Try decrypt
            try {
              const bytes = CryptoJS.AES.decrypt(inputText, secretKey)
              result = bytes.toString(CryptoJS.enc.Utf8) || "Invalid key or ciphertext"
            } catch {
              result = "Invalid decryption input or key"
            }
          } else {
            result = CryptoJS.AES.encrypt(inputText, secretKey).toString()
          }
          break

        case "hmac-generator":
          if (!secretKey) {
            setOutputText("Please enter a secret key for HMAC.")
            return
          }
          result = CryptoJS.HmacSHA256(inputText, secretKey).toString(CryptoJS.enc.Hex)
          break

        case "md5-hash-generator":
          result = CryptoJS.MD5(inputText).toString()
          break

        case "sha1-hash-generator":
          result = CryptoJS.SHA1(inputText).toString()
          break

        case "sha256-hash-generator":
          result = CryptoJS.SHA256(inputText).toString()
          break

        case "sha512-hash-generator":
          result = CryptoJS.SHA512(inputText).toString()
          break

        case "sha3-256-hash-generator":
          result = CryptoJS.SHA3(inputText, { outputLength: 256 }).toString()
          break

        case "crc32-hash-generator":
          result = crc32(inputText)
          break

        default:
          result = "Please select a valid option."
      }

      setOutputText(result)
    } catch (err: any) {
      setOutputText("Error: " + err.message)
    }
  }

  const handleClear = () => {
    setInputText("")
    setSecretKey("")
    setOutputText("")
  }

  // ✅ Simple CRC32 implementation
  const crc32 = (str: string) => {
    let crc = 0 ^ -1
    for (let i = 0; i < str.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff]
    }
    return ((crc ^ -1) >>> 0).toString(16)
  }

  // Precomputed CRC table
  const crcTable = (() => {
    let c, crcTable: number[] = []
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
      }
      crcTable[n] = c
    }
    return crcTable
  })()

  return (
    <ReusableSidebar
      title="Cryptography Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedOptionId}
      onOptionSelect={setSelectedOptionId}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{selectedOption?.label}</h2>
            <p className="text-muted-foreground">{selectedOption?.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Input</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full"
                  rows={8}
                  placeholder="Enter your text or ciphertext..."
                />
              </div>

              {(selectedOptionId === "encryption-decryption" ||
                selectedOptionId === "hmac-generator") && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Secret Key</label>
                  <input
                    type="text"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 w-full"
                    placeholder="Enter secret key"
                  />
                </div>
              )}
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Output</label>
                <textarea
                  readOnly
                  value={outputText}
                  className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full bg-gray-50"
                  rows={8}
                  placeholder="Output will appear here..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-2">
            <Button onClick={handleConvert}>Convert</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
