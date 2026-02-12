"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"

export function OtherTools() {
  const [selectedConverter, setSelectedConverter] = useState<string>("")
  const [inputValue, setInputValue] = useState<string>("")
  const [output, setOutput] = useState<string>("")

  const converterOptions: SidebarOption[] = [
    { id: "lorem-ipsum", label: "Lorem-Ipsum", icon: FileText, description: "Generate placeholder text for design or content purposes." },
    { id: "sharelink-generator", label: "Sharelink Generator", icon: FileText, description: "Create shareable links for files or web content." },
    { id: "hostname-to-ip", label: "Hostname to IP", icon: FileText, description: "Resolve a hostname to its corresponding IP address." },
    { id: "ip-to-hostname", label: "IP to Hostname", icon: FileText, description: "Find the hostname associated with a given IP address." },
    { id: "dns-lookup", label: "DNS Lookup", icon: FileText, description: "Perform a DNS lookup to retrieve domain records." },
    { id: "mx-lookup", label: "MX Lookup", icon: FileText, description: "Check the mail exchange (MX) records of a domain." },
    { id: "nameserver-lookup", label: "Nameserver Lookup", icon: FileText, description: "Retrieve the nameservers associated with a domain." },
    { id: "website-to-ip-address", label: "Website to IP Address", icon: FileText, description: "Resolve a website URL to its IP address." },
    { id: "open-port-checker", label: "Open Port Checker", icon: FileText, description: "Check if a specific port on your IP or server is open." },
    { id: "webcam-test", label: "Webcam Test", icon: FileText, description: "Test your webcam functionality directly online." }
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings }
  ]

  const selectedOption = converterOptions.find(opt => opt.id === selectedConverter)

  const handleAction = async () => {
    switch (selectedConverter) {
      case "lorem-ipsum":
        setOutput("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet.")
        break

      case "sharelink-generator":
        if (!inputValue.trim()) return setOutput("Enter a valid URL first!")
        setOutput(`Shareable Link: ${encodeURI(inputValue)}`)
        break

      case "hostname-to-ip":
        try {
          const res = await fetch(`https://dns.google/resolve?name=${inputValue}`)
          const data = await res.json()
          const ip = data?.Answer?.[0]?.data || "No IP found"
          setOutput(ip)
        } catch {
          setOutput("Error resolving hostname.")
        }
        break

      case "ip-to-hostname":
        try {
          const res = await fetch(`https://ipapi.co/${inputValue}/json/`)
          const data = await res.json()
          setOutput(data?.hostname || "No hostname found.")
        } catch {
          setOutput("Error fetching hostname.")
        }
        break

      case "dns-lookup":
        try {
          const res = await fetch(`https://dns.google/resolve?name=${inputValue}`)
          const data = await res.json()
          setOutput(JSON.stringify(data, null, 2))
        } catch {
          setOutput("Error performing DNS lookup.")
        }
        break

      case "mx-lookup":
        try {
          const res = await fetch(`https://dns.google/resolve?name=${inputValue}&type=MX`)
          const data = await res.json()
          setOutput(JSON.stringify(data, null, 2))
        } catch {
          setOutput("Error performing MX lookup.")
        }
        break

      case "nameserver-lookup":
        try {
          const res = await fetch(`https://dns.google/resolve?name=${inputValue}&type=NS`)
          const data = await res.json()
          setOutput(JSON.stringify(data, null, 2))
        } catch {
          setOutput("Error performing nameserver lookup.")
        }
        break

      case "website-to-ip-address":
        try {
          const res = await fetch(`https://dns.google/resolve?name=${inputValue}`)
          const data = await res.json()
          const ip = data?.Answer?.[0]?.data || "No IP found"
          setOutput(ip)
        } catch {
          setOutput("Error resolving website to IP.")
        }
        break

      case "open-port-checker":
        setOutput("Port checking is restricted in browsers. Use a backend API or tool like nmap instead.")
        break

      case "webcam-test":
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          setOutput("✅ Webcam access granted! Working fine.")
          stream.getTracks().forEach(track => track.stop())
        } catch {
          setOutput("❌ Webcam not accessible.")
        }
        break

      default:
        setOutput("Select a tool to use.")
    }
  }

  const handleClear = () => {
    setInputValue("")
    setOutput("")
  }

  return (
    <ReusableSidebar
      title="Other Tools"
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full"
                rows={5}
                placeholder="Enter text, URL, or domain..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <textarea
                readOnly
                value={output}
                className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full bg-gray-50"
                rows={5}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleAction}>Run</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
