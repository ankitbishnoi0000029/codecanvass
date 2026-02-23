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
import { dataType } from "@/utils/types/uiTypes";
import { PageTitle } from "@/components/sections/title";
import Meta from "@/components/sections/meta";

/* ---------------- HELPERS ---------------- */

const normalize = (value: string) =>
    value?.toLowerCase().replace(/\s+/g, "-") || "";

/* ---------------- TOOL FUNCTIONS ---------------- */

type ToolFunction = (input: string) => string;

const toolFunctions: Record<string, ToolFunction> = {
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
};

/* ---------------- PAGE ---------------- */

export default function Page() {
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

    /* ---------- SIDEBAR OPTIONS (FIXED) ---------- */
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
        router.replace(`/popular/${toolId}`); // ✅ FIXED
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

    // if (!selectedData && selectedTool) {
    //     return (
    //         <div className="p-8">
    //             <h1 className="text-2xl font-bold">Tool not found</h1>
    //         </div>
    //     );
    // }

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

                {selectedData && <Meta selectedData={selectedData} />}
            </SidebarContentWrapper>
        </ReusableSidebar>
    );
}
