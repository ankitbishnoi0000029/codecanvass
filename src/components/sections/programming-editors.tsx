
"use client"

import { useState } from "react"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Code,
    File,
    Settings,
    Download,
    Upload,
    Palette
} from "lucide-react"
import { base64ToImage } from "@/utils/utils"
import Image from "next/image"

export function ProgrammingEditors() {
    const [selectedConverter, setSelectedConverter] = useState("")
    const [img, setImg] = useState('')

    const converterOptions: SidebarOption[] = [
      
      {
    id: "xml-editor",
    label: "XML Editor",
    icon: FileText,
    description: "Edit XML documents with syntax highlighting and structured formatting."
  },
  {
    id: "json-editor",
    label: "JSON Editor",
    icon: FileText,
    description: "Edit and manipulate JSON data in a structured and readable format."
  },
  {
    id: "real-time-html-editor",
    label: "Real Time HTML Editor",
    icon: FileText,
    description: "Edit HTML code with live preview to see changes instantly."
  },
  {
    id: "yaml-editor",
    label: "YAML Editor",
    icon: FileText,
    description: "Edit YAML files with proper indentation and structure support."
  },
  {
    id: "online-editor",
    label: "ONLINE Editor",
    icon: FileText,
    description: "A generic online editor for code or text with basic formatting tools."
  },
  {
    id: "java-editor",
    label: "JAVA Editor",
    icon: FileText,
    description: "Write and edit Java code with syntax highlighting and formatting."
  },
  {
    id: "csharp-editor",
    label: "C# Editor",
    icon: FileText,
    description: "Edit C# (C-Sharp) code with proper syntax highlighting."
  },
  {
    id: "actionscript-editor",
    label: "Actionscript Editor",
    icon: FileText,
    description: "Edit ActionScript code for Flash or AIR projects."
  },
  {
    id: "markdown-editor",
    label: "Markdown Editor",
    icon: FileText,
    description: "Write and preview Markdown content in real-time."
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

    const handlestrtobase64 = () => {
        setImg(base64ToImage(selectedConverter))
       
    }
    console.log(img)
    return (
        <ReusableSidebar
            title="Converter Tools"
            icon={Palette}
            options={converterOptions}
            selectedOption={selectedConverter}
            onOptionSelect={setSelectedConverter}
            footerOptions={footerOptions}
        >
            <SidebarContentWrapper selectedOption={selectedOption}>
                <div className=" mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                            {selectedOption?.label}
                        </h2>
                        <p className="text-muted-foreground">
                            {selectedOption?.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Input</label>
                                <textarea value={selectedConverter} onChange={(e) => setSelectedConverter(e.target.value)} className="border-2 border-dashed border-gray-300 rounded-lg pt-2 px-4 w-full h-full" rows={5} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Output</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    {img ? (
                                        <>
                                            <Download className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-500">Converted files will appear here</p>
                                        </>
                                    ) : (
                                        <Image src={img} width={50} height={50} alt="Converted Image" />
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Button onClick={handlestrtobase64} >Convert</Button>
                        <Button variant="outline">Clear</Button>
                    </div>
                </div>
            </SidebarContentWrapper>
        </ReusableSidebar>
    );
}