"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    ReusableSidebar,
    SidebarContentWrapper,
    SidebarOption,
} from "@/components/ui/reusable-sidebar";
import { Button } from "@/components/ui/button";
import { Download, Settings, Palette } from "lucide-react";
import { getTableData } from "@/actions/dbAction";
import { dataType, PageDataUI } from "@/utils/types/uiTypes";
import { PageTitle } from "@/components/sections/title";
import Meta from "@/components/sections/meta";
import PageRenderer from "../ui/page-rander";

/* ---------------- HELPERS ---------------- */

const normalize = (value: string) =>
    value?.toLowerCase().replace(/\s+/g, "-") || "";

/* ---------------- TOOL FUNCTIONS ---------------- */

type ToolFunction = (input: string) => string;

const toolFunctions: Record<string, ToolFunction> = {
    // ---------- Existing tools ----------
    "json-beautifier": (input) => {
        try {
            return JSON.stringify(JSON.parse(input), null, 2);
        } catch {
            return "❌ Invalid JSON";
        }
    },
    "json-validator": (input) => {
        try {
            JSON.parse(input);
            return "✅ Valid JSON";
        } catch {
            return "❌ Invalid JSON";
        }
    },
    "binary-to-decimal": (input) =>
        isNaN(parseInt(input, 2))
            ? "❌ Invalid binary"
            : parseInt(input, 2).toString(),
    "decimal-to-hex": (input) =>
        isNaN(Number(input))
            ? "❌ Invalid decimal"
            : Number(input).toString(16),
    "hex-to-decimal": (input) =>
        isNaN(parseInt(input, 16))
            ? "❌ Invalid hex"
            : parseInt(input, 16).toString(),
    "ascii-to-text": (input) =>
        input
            .split(" ")
            .map((n) => String.fromCharCode(Number(n)))
            .join(""),
    "random-emoji-generator": () => {
        const emojis = ["😀", "🔥", "🚀", "🎉", "😎", "💡"];
        return emojis[Math.floor(Math.random() * emojis.length)];
    },
    "rem-to-px-converter": (input) => {
        const num = parseFloat(input);
        return isNaN(num) ? "❌ Invalid number" : `${num * 16}px`;
    },

    // ---------- New tools ----------
    "html-viewer": (input) => {
        // Simple HTML prettifier
        try {
            return input.replace(/>\s*</g, ">\n<");
        } catch {
            return input;
        }
    },
    "number-to-words": (input) => {
        const num = parseInt(input, 10);
        if (isNaN(num)) return "❌ Invalid number";

        const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
        const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
        const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

        if (num === 0) return "zero";
        if (num < 0) return "negative " + toolFunctions["number-to-words"](String(-num));
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) {
            const ten = Math.floor(num / 10);
            const unit = num % 10;
            return tens[ten] + (unit ? "-" + ones[unit] : "");
        }
        if (num < 1000) {
            const hundred = Math.floor(num / 100);
            const rest = num % 100;
            return ones[hundred] + " hundred" + (rest ? " " + toolFunctions["number-to-words"](String(rest)) : "");
        }
        return "❌ Number too large (max 999)";
    },
    "sql-formatter": (input) => {
        // Very basic SQL formatting: uppercase keywords, newlines before major clauses
        const keywords = ["select", "from", "where", "insert", "update", "delete", "join", "left join", "right join", "inner join", "outer join", "group by", "order by", "having", "limit", "offset"];
        let formatted = input;
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, "gi");
            formatted = formatted.replace(regex, kw.toUpperCase());
        });
        // Add newline before major keywords
        formatted = formatted.replace(/\b(FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING|LIMIT)\b/gi, "\n$1");
        return formatted;
    },
    "hex-to-pantone": (input) => {
        const hex = input.trim().replace(/^#/, "");
        if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return "❌ Invalid hex color";
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `Closest Pantone: PANTONE ${r}${g}${b} C (simulated)`;
    },
    "source-code-viewer": (input) => input, // Just return the input
    "binary-to-text": (input) => {
        const binaryArr = input.trim().split(/\s+/);
        let text = "";
        for (let bin of binaryArr) {
            if (!/^[01]+$/.test(bin)) return "❌ Invalid binary";
            text += String.fromCharCode(parseInt(bin, 2));
        }
        return text;
    },
    "json-viewer": (input) => {
        try {
            return JSON.stringify(JSON.parse(input), null, 2);
        } catch {
            return "❌ Invalid JSON";
        }
    },
    "base64-decode": (input) => {
        try {
            return atob(input);
        } catch {
            return "❌ Invalid Base64";
        }
    },
    "xml-viewer": (input) => {
        try {
            return input.replace(/>\s*</g, ">\n<");
        } catch {
            return input;
        }
    },
    "xml-to-json": (input) => {
        // Very naive XML to JSON conversion
        try {
            return JSON.stringify({ xml: input }, null, 2);
        } catch {
            return "❌ Conversion failed";
        }
    },
    "encryption-decryption": (input) => {
        // Simple Caesar cipher (shift 1) for demo
        return input.split("").map(c => String.fromCharCode(c.charCodeAt(0) + 1)).join("");
    },
    "excel-to-html": (input) => {
        // Assume input is CSV
        const rows = input.trim().split("\n").map(row => row.split(","));
        let html = '<table border="1">\n';
        rows.forEach(row => {
            html += "  <tr>\n    " + row.map(cell => `<td>${cell.trim()}</td>`).join("") + "\n  </tr>\n";
        });
        html += "</table>";
        return html;
    },
    "css-validator": (input) => {
        // Basic check: look for unbalanced braces
        const openBraces = (input.match(/{/g) || []).length;
        const closeBraces = (input.match(/}/g) || []).length;
        if (openBraces !== closeBraces) return "❌ Unbalanced braces";
        return "✅ CSS looks valid (basic check)";
    },
    "xml-validator": (input) => {
        // Basic check: look for matching tags
        const openTags = (input.match(/<[^/][^>]*>/g) || []).length;
        const closeTags = (input.match(/<\/[^>]+>/g) || []).length;
        if (openTags !== closeTags) return "❌ Unbalanced tags";
        return "✅ XML looks valid (basic check)";
    },
    "javascript-validator": (input) => {
        try {
            new Function(input);
            return "✅ JavaScript syntax looks valid";
        } catch (e: any) {
            return `❌ Syntax error: ${e.message}`;
        }
    },
    "css-beautifier": (input) => {
        // Simple formatter: add newlines after braces and semicolons
        return input.replace(/{/g, "{\n").replace(/}/g, "\n}\n").replace(/;/g, ";\n");
    },
    "online-json-editor": (input) => {
        try {
            return JSON.stringify(JSON.parse(input), null, 2);
        } catch {
            return "❌ Invalid JSON";
        }
    },
    "incorrect-quotes-generator": () => {
        const quotes = [
            '"I\'m not arguing, I\'m just explaining why I\'m right."',
            '"It\'s not a bug, it\'s a feature."',
            '"I don\'t need a hair stylist, my pillow gives me a new hairstyle every morning."',
            '"I\'m not lazy, I\'m on energy-saving mode."',
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    },
    "lua-beautifier": (input) => {
        // Simple Lua formatter: ensure indentation
        let indent = 0;
        return input.split("\n").map(line => {
            line = line.trim();
            if (line.startsWith("end") || line.startsWith("until") || line.startsWith("else")) indent--;
            const formatted = "  ".repeat(Math.max(0, indent)) + line;
            if (line.endsWith("then") || line.endsWith("do") || line.endsWith("function") || line.endsWith("else")) indent++;
            return formatted;
        }).join("\n");
    },
};

/* ---------------- PAGE ---------------- */

export default function PopularTools(data:PageDataUI) {
    const router = useRouter();
    const pathname = usePathname();

    const [selectedTool, setSelectedTool] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [output, setOutput] = useState("");
    const [list, setList] = useState<dataType[]>([]);
    const [loading, setLoading] = useState(true);

    /* ---------- FETCH TOOLS ---------- */
    useEffect(() => {
        getTableData("popular")
            .then((res) => setList(res as dataType[]))
            .finally(() => setLoading(false));
    }, []);

    /* ---------- GET TOOL FROM URL ---------- */
    useEffect(() => {
        const slug = pathname.split("/").pop() || "";
        setSelectedTool(slug);
        setInputValue("");
        setOutput("");
    }, [pathname]);

    /* ---------- SIDEBAR OPTIONS ---------- */
    const toolOptions: SidebarOption[] = list.map((item) => ({
        id: item.yrl ?? String(item.url_id),
        label: item.urlName,
        description: item.des,
        icon: Palette,
    }));

    const selectedData = list.find(
        (item) => (item.yrl ?? String(item.url_id)) === selectedTool
    );
    const selectedOption = toolOptions.find(
        (opt) => opt.id === selectedTool
    );

    const handleToolChange = (toolId: string) => {
        router.replace(`/popular/${toolId}`);
    };

    /* ---------- CONVERT ---------- */
    const handleConvert = () => {
        if (!selectedTool) {
            setOutput("❌ No tool selected");
            return;
        }

        const func = toolFunctions[selectedTool];

        if (!func) {
            setOutput("⚠ Tool logic not implemented yet.");
            return;
        }

        setOutput(func(inputValue));
    };

    const handleClear = () => {
        setInputValue("");
        setOutput("");
    };

    const handleDownload = () => {
        if (!output) return;

        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedTool}.txt`;
        a.click();

        URL.revokeObjectURL(url);
    };

    /* ---------- LOADING ---------- */
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                Loading tools...
            </div>
        );
    }

    /* ---------- RENDER ---------- */
    return (
        <ReusableSidebar
            title="Developer Tools"
            icon={Palette}
            options={toolOptions}
            selectedOption={selectedTool}
            onOptionSelect={handleToolChange}
            footerOptions={[
                { id: "settings", label: "Settings", icon: Settings },
            ]}
        >
            <SidebarContentWrapper selectedOption={selectedOption}>
                {selectedData && <PageTitle selectedData={selectedData} />}

                <div className="grid md:grid-cols-2 gap-6">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="border rounded-lg p-3 h-48 font-mono text-sm"
                        placeholder="Enter input here..."
                    />

                    <div className="border rounded-lg p-3 bg-gray-50 h-48 overflow-auto font-mono text-sm">
                        <pre>{output}</pre>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <Button onClick={handleConvert}>Convert</Button>
                    <Button variant="outline" onClick={handleClear}>
                        Clear
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleDownload}
                        disabled={!output}
                    >
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                </div>

             <PageRenderer data={data} />
                {/* {selectedData && <Meta  selectedData={selectedData} />} */}
            </SidebarContentWrapper>
        </ReusableSidebar>
    );
}