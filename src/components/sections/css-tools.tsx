"use client";

import { useState } from "react";
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar";
import { Button } from "@/components/ui/button";
import { Settings, Palette, Sparkles } from "lucide-react";

import { css as cssBeautify } from "js-beautify";
import less from "less";
import * as sass from "sass";

// ⭐ FIX: Stylus dynamically imported to avoid build issues

export function CssTools() {
  const [selectedTool, setSelectedTool] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);

  const tools: SidebarOption[] = [
    { id: "css-beautifier", label: "CSS Beautifier", icon: Sparkles, description: "Beautify and format messy CSS code." },

    { id: "css-to-less", label: "CSS → LESS", icon: Sparkles, description: "Convert plain CSS to LESS syntax." },
    { id: "css-to-scss", label: "CSS → SCSS", icon: Sparkles, description: "Convert CSS to SCSS format." },
    { id: "css-to-sass", label: "CSS → SASS", icon: Sparkles, description: "Convert CSS to indented SASS syntax." },
    { id: "css-to-stylus", label: "CSS → Stylus", icon: Sparkles, description: "Convert CSS to Stylus syntax." },

    { id: "stylus-compiler", label: "Stylus Compiler", icon: Palette, description: "Compile Stylus code to CSS." },
    { id: "stylus-to-css", label: "Stylus → CSS", icon: Palette, description: "Convert Stylus to CSS output." },

    { id: "less-compiler", label: "LESS Compiler", icon: Palette, description: "Compile LESS code to CSS." },
    { id: "less-to-css", label: "LESS → CSS", icon: Palette, description: "Convert LESS to CSS output." },

    { id: "scss-compiler", label: "SCSS Compiler", icon: Palette, description: "Compile SCSS code to CSS." },
    { id: "scss-to-css", label: "SCSS → CSS", icon: Palette, description: "Convert SCSS to CSS output." },

    { id: "sass-compiler", label: "SASS Compiler", icon: Palette, description: "Compile SASS code to CSS." },
    { id: "sass-to-css", label: "SASS → CSS", icon: Palette, description: "Convert SASS to CSS output." },
  ];

  const footerOptions: SidebarOption[] = [{ id: "settings", label: "Settings", icon: Settings }];

  const selectedOption = tools.find((tool) => tool.id === selectedTool);

  const handleConvert = async () => {
    if (!selectedTool) return;
    setLoading(true);
    let output = "";

    try {
      switch (selectedTool) {
        // Beautifier
        case "css-beautifier":
          output = cssBeautify(inputText, { indent_size: 2 });
          break;

        // LESS
        case "less-compiler":
        case "less-to-css":
          output = (await less.render(inputText)).css;
          break;

        // SCSS
        case "scss-compiler":
        case "scss-to-css":
          output = sass.compileString(inputText).css;
          break;

        // SASS
        case "sass-compiler":
        case "sass-to-css":
          output = sass.compileString(inputText, { syntax: "indented" }).css;
          break;

        // ⭐ Stylus (FIXED)
        case "stylus-compiler":
        case "stylus-to-css":
          try {
            const response = await fetch('/api/stylus', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ code: inputText }),
            });
            const data = await response.json();
            if (response.ok) {
              output = data.css;
            } else {
              output = "⚠️ Error: " + data.error;
            }
          } catch (e: any) {
            output = "⚠️ Stylus package is not available or failed to load.";
          }
          break;

        // Simple syntax conversion
        default:
          output = inputText
            .replace(/\{/g, "")
            .replace(/\}/g, "")
            .replace(/;/g, "")
            .replace(/  /g, "  ");
      }
    } catch (err: any) {
      output = "⚠️ Error: " + err.message;
    }

    setOutputText(output);
    setLoading(false);
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  return (
    <ReusableSidebar
      title="CSS Tools"
      icon={Palette}
      options={tools}
      selectedOption={selectedTool}
      onOptionSelect={setSelectedTool}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-2">{selectedOption?.label}</h2>
          <p className="text-gray-500 mb-4">{selectedOption?.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="border rounded p-3 min-h-[200px]"
              placeholder="Enter your code..."
            />

            <div className="border rounded p-3 bg-gray-50 min-h-[200px] overflow-auto text-xs whitespace-pre-wrap">
              {outputText || "Converted output will appear here..."}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button onClick={handleConvert} disabled={loading}>
              {loading ? "Converting..." : "Convert"}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  );
}
