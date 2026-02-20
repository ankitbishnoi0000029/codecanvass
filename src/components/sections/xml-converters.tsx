"use client";

import { useEffect, useState } from "react";
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from "@/components/ui/reusable-sidebar";
import { Button } from "@/components/ui/button";
import { Settings, Code, Download, Copy, RotateCcw } from "lucide-react";
import { getTableData } from "@/actions/dbAction";
import { dataType } from "@/utils/types/uiTypes";
import { format } from "prettier/standalone";
import prettierPluginXml from "@prettier/plugin-xml";
import Meta from "./meta";
import { PageTitle } from "./title";

// Helper function to get file extension for download
const getFileExtension = (converterId: string): string => {
  const extensions: Record<string, string> = {
    "xml-viewer": "xml",
    "xml-editor": "xml",
    "xml-pretty-print": "xml",
    "xml-converter": "xml",
    "xml-parser-online": "xml",
    "xml-minifier": "xml",
    "xpath-tester": "txt",
    "xml-to-json": "json",
    "soap-to-json": "json",
    "wsdl-to-json": "json",
    "xml-to-yaml": "yaml",
    "xml-to-html": "html",
    "xml-to-csv": "csv",
    "xml-to-tsv": "tsv",
    "xml-to-text": "txt",
    "xml-to-base64": "txt",
    "base64-to-xml": "xml",
    "xml-to-java": "java",
    "xml-to-excel": "xlsx"
  };
  return extensions[converterId] || "txt";
};

// XML to JSON converter with proper namespace handling
const xmlToJson = (xmlString: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      throw new Error("Invalid XML format");
    }

    const traverse = (node: Node): any => {
      const obj: any = {};

      // Handle element nodes
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        // Add attributes
        if (element.attributes.length > 0) {
          obj["@attributes"] = {};
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            obj["@attributes"][attr.name] = attr.value;
          }
        }

        // Handle namespace
        if (element.prefix) {
          obj["@namespace"] = element.prefix;
        }

        // Process child nodes
        for (let child of element.childNodes) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const childObj = traverse(child);
            const nodeName = child.nodeName;

            if (obj[nodeName]) {
              if (!Array.isArray(obj[nodeName])) {
                obj[nodeName] = [obj[nodeName]];
              }
              obj[nodeName].push(childObj);
            } else {
              obj[nodeName] = childObj;
            }
          } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) {
              return text;
            }
          } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
            return child.textContent || "";
          }
        }
      }

      return obj;
    };

    const result = traverse(xmlDoc.documentElement);
    return JSON.stringify(result, null, 2);
  } catch (err: any) {
    return `❌ Error: ${err.message}`;
  }
};

// JSON to XML converter
const jsonToXml = (jsonString: string, rootName = "root"): string => {
  try {
    const obj = JSON.parse(jsonString);

    const convert = (obj: any, nodeName?: string): string => {
      if (obj === null || obj === undefined) return "";

      if (typeof obj !== "object") {
        return `<${nodeName || "value"}>${obj}</${nodeName || "value"}>`;
      }

      let xml = "";

      // Handle attributes
      let attrs = "";
      if (obj["@attributes"]) {
        attrs = " " + Object.entries(obj["@attributes"])
          .map(([key, value]) => `${key}="${value}"`)
          .join(" ");
        delete obj["@attributes"];
      }

      if (Array.isArray(obj)) {
        return obj.map(item => convert(item, nodeName)).join("");
      }

      for (let prop in obj) {
        if (prop === "@namespace") continue;

        const value = obj[prop];

        if (Array.isArray(value)) {
          for (let item of value) {
            xml += convert(item, prop);
          }
        } else if (typeof value === "object") {
          xml += convert(value, prop);
        } else {
          xml += `<${prop}>${value}</${prop}>`;
        }
      }

      return nodeName
        ? `<${nodeName}${attrs}>${xml}</${nodeName}>`
        : xml;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>${convert(obj)}</${rootName}>`;
  } catch (err: any) {
    return `❌ Error: ${err.message}`;
  }
};

// XML to YAML converter
const xmlToYaml = (xmlString: string): string => {
  try {
    const jsonObj = JSON.parse(xmlToJson(xmlString));

    const toYaml = (obj: any, indent = 0): string => {
      if (typeof obj !== "object" || obj === null) {
        return String(obj);
      }

      if (Array.isArray(obj)) {
        return obj.map(item =>
          `${"  ".repeat(indent)}- ${toYaml(item, indent + 1)}`
        ).join("\n");
      }

      return Object.entries(obj)
        .map(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            return `${"  ".repeat(indent)}${key}:\n${toYaml(value, indent + 1)}`;
          }
          return `${"  ".repeat(indent)}${key}: ${value}`;
        })
        .join("\n");
    };

    return toYaml(jsonObj);
  } catch (err: any) {
    return `❌ Error: ${err.message}`;
  }
};

// XML to HTML converter
const xmlToHtml = (xmlString: string): string => {
  try {
    const jsonObj = JSON.parse(xmlToJson(xmlString));

    const toHtml = (obj: any): string => {
      if (typeof obj !== "object" || obj === null) {
        return String(obj);
      }

      if (Array.isArray(obj)) {
        return `<ul>${obj.map(item => `<li>${toHtml(item)}</li>`).join("")}</ul>`;
      }

      return `<div class="xml-node">${Object.entries(obj)
        .map(([key, value]) =>
          `<div class="xml-property">
              <span class="xml-key">${key}:</span> 
              <span class="xml-value">${toHtml(value)}</span>
            </div>`
        ).join("")
        }</div>`;
    };

    return `<!DOCTYPE html>
<html>
<head>
  <style>
    .xml-node { margin-left: 20px; }
    .xml-property { margin: 5px 0; }
    .xml-key { font-weight: bold; color: #2c3e50; }
    .xml-value { color: #27ae60; }
    ul { list-style-type: none; padding-left: 20px; }
    li { margin: 5px 0; }
  </style>
</head>
<body>
  ${toHtml(jsonObj)}
</body>
</html>`;
  } catch (err: any) {
    return `❌ Error: ${err.message}`;
  }
};

// XML to CSV/TSV converter
const xmlToTable = (xmlString: string, delimiter: ',' | '\t'): string => {
  try {
    const jsonObj = JSON.parse(xmlToJson(xmlString));

    // Extract all elements with same tag name into rows
    const extractRows = (obj: any, rows: any[] = []): any[] => {
      if (Array.isArray(obj)) {
        obj.forEach(item => extractRows(item, rows));
      } else if (typeof obj === "object" && obj !== null) {
        // If this looks like a record, add it to rows
        if (Object.keys(obj).some(key => !key.startsWith("@"))) {
          rows.push(obj);
        }
        // Recurse
        Object.values(obj).forEach(value => extractRows(value, rows));
      }
      return rows;
    };

    const rows = extractRows(jsonObj);
    if (rows.length === 0) return "No tabular data found";

    // Get all unique keys
    const keys = Array.from(
      new Set(rows.flatMap(row => Object.keys(row).filter(k => !k.startsWith("@"))))
    );

    const headers = keys.join(delimiter);
    const dataRows = rows.map(row =>
      keys.map(key => {
        const value = row[key];
        if (typeof value === "object") {
          return JSON.stringify(value);
        }
        // Escape delimiters in strings
        if (typeof value === "string" && (value.includes(delimiter) || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      }).join(delimiter)
    );

    return [headers, ...dataRows].join("\n");
  } catch (err: any) {
    return `❌ Error: ${err.message}`;
  }
};

// XML Minifier
const minifyXml = (xmlString: string): string => {
  return xmlString
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .replace(/>\s+/g, ">")
    .replace(/\s+</g, "<")
    .trim();
};

// XML Pretty Print
const prettyPrintXml = async (xmlString: string): Promise<string> => {
  try {
    return await format(xmlString, {
      parser: "xml",
      plugins: [prettierPluginXml],
      tabWidth: 2,
      useTabs: false,
    });
  } catch {
    // Fallback to simple pretty print
    let formatted = "";
    let indent = 0;
    const lines = xmlString.split(/>\s*</);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^\/\w/)) indent--;
      formatted += "  ".repeat(indent) + "<" + line + ">\n";
      if (line.match(/^<?\w[^>]*[^\/]$/) && !line.startsWith("?")) indent++;
    }

    return formatted;
  }
};

// XPath Tester
const testXPath = (xmlString: string, xpath: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const result = xmlDoc.evaluate(
      xpath,
      xmlDoc,
      null,
      XPathResult.ANY_TYPE,
      null
    );

    const output = [];
    let node = result.iterateNext();
    while (node) {
      output.push(node.textContent);
      node = result.iterateNext();
    }

    return output.length > 0
      ? output.join("\n")
      : "No results found";
  } catch (err: any) {
    return `❌ XPath Error: ${err.message}`;
  }
};

// SOAP to JSON
const soapToJson = (soapString: string): string => {
  try {
    // Extract SOAP body
    const bodyMatch = soapString.match(/<soap:Body[^>]*>([\s\S]*?)<\/soap:Body>/);
    if (!bodyMatch) throw new Error("No SOAP body found");

    return xmlToJson(bodyMatch[1]);
  } catch (err: any) {
    return `❌ Error: ${err.message}`;
  }
};

// WSDL to JSON (simplified)
const wsdlToJson = (wsdlString: string): string => {
  try {
    const json = JSON.parse(xmlToJson(wsdlString));
    // Extract relevant WSDL info
    const simplified = {
      services: json.definitions?.service || [],
      types: json.definitions?.types?.schema || [],
      messages: json.definitions?.message || [],
      portTypes: json.definitions?.portType || [],
      bindings: json.definitions?.binding || []
    };
    return JSON.stringify(simplified, null, 2);
  } catch (err: any) {
    return `❌ Error: ${err.message}`;
  }
};

// Base64 conversions
const xmlToBase64 = (xmlString: string): string => {
  return btoa(unescape(encodeURIComponent(xmlString)));
};

const base64ToXml = (base64String: string): string => {
  return decodeURIComponent(escape(atob(base64String)));
};

// XML to Java POJO
const xmlToJava = (xmlString: string, className = "XmlObject"): string => {
  try {
    const jsonObj = JSON.parse(xmlToJson(xmlString));

    const getJavaType = (value: any): string => {
      if (value === null) return "Object";
      switch (typeof value) {
        case "string": return "String";
        case "number": return Number.isInteger(value) ? "int" : "double";
        case "boolean": return "boolean";
        case "object":
          if (Array.isArray(value)) {
            return value.length > 0
              ? `List<${getJavaType(value[0])}>`
              : "List<Object>";
          }
          return "Map<String, Object>";
        default: return "Object";
      }
    };

    const generateClass = (obj: any, name: string): string => {
      const fields = Object.entries(obj)
        .filter(([key]) => !key.startsWith("@"))
        .map(([key, value]) => {
          const javaType = getJavaType(value);
          return `  private ${javaType} ${key};`;
        })
        .join("\n");

      const gettersSetters = Object.entries(obj)
        .filter(([key]) => !key.startsWith("@"))
        .map(([key, value]) => {
          const javaType = getJavaType(value);
          const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
          return `
  public ${javaType} get${capitalized}() {
    return ${key};
  }

  public void set${capitalized}(${javaType} ${key}) {
    this.${key} = ${key};
  }`;
        })
        .join("\n");

      return `import java.util.*;

public class ${name} {
${fields}
${gettersSetters}
}`;
    };

    return generateClass(jsonObj, className);
  } catch (err: any) {
    return `❌ Error: ${err.message}`;
  }
};

// Main component
export default function XmlConverters() {
  const [selectedConverter, setSelectedConverter] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [xpathQuery, setXpathQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [list, setList] = useState<dataType[]>([]);

  // Fetch converter list
  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getTableData("xml_converters") as dataType[];
      setList(categoriesData);

      // Set first converter as default
      if (categoriesData.length > 0) {
        setSelectedConverter(categoriesData[0].route || categoriesData[0].id.toString());
      }
    };
    fetchData();
  }, []);

  // Convert SQL data → SidebarOption[]
  const sidebarOptions: SidebarOption[] = list.map((item) => ({
    id: item.route ?? item.id.toString(),
    label: item.urlName,
    description: item.des,
    keyword: item.keyword,
    icon: Code,
  }));

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const selectedOption = list.find(
    (opt) => (opt.route && opt.route === selectedConverter) || opt.id.toString() === selectedConverter
  );

  // Change converter
  const handleConverterChange = (converterId: string) => {
    setSelectedConverter(converterId);
    setInputText("");
    setOutputText("");
    setXpathQuery("");
  };

  // Main conversion logic
  const handleConvert = async () => {
    if (!selectedConverter) {
      setOutputText("Please select a converter from the sidebar");
      return;
    }

    if (!inputText.trim()) {
      setOutputText("Please enter input text");
      return;
    }

    setIsLoading(true);

    try {
      let result = "";

      switch (selectedConverter) {
        case "xml-viewer":
        case "xml-editor":
          result = inputText;
          break;

        case "xml-pretty-print":
          result = await prettyPrintXml(inputText);
          break;

        case "xml-minifier":
          result = minifyXml(inputText);
          break;

        case "xpath-tester":
          if (!xpathQuery) {
            result = "Please enter an XPath query";
          } else {
            result = testXPath(inputText, xpathQuery);
          }
          break;

        case "xml-to-json":
          result = xmlToJson(inputText);
          break;

        case "json-to-xml":
          result = jsonToXml(inputText);
          break;

        case "soap-to-json":
          result = soapToJson(inputText);
          break;

        case "wsdl-to-json":
          result = wsdlToJson(inputText);
          break;

        case "xml-to-yaml":
          result = xmlToYaml(inputText);
          break;

        case "xml-to-html":
          result = xmlToHtml(inputText);
          break;

        case "xml-to-csv":
          result = xmlToTable(inputText, ',');
          break;

        case "xml-to-tsv":
          result = xmlToTable(inputText, '\t');
          break;

        case "xml-to-text":
          result = inputText.replace(/<[^>]*>/g, "");
          break;

        case "xml-to-base64":
          result = xmlToBase64(inputText);
          break;

        case "base64-to-xml":
          result = base64ToXml(inputText);
          break;

        case "xml-to-java":
          result = xmlToJava(inputText, "XmlObject");
          break;

        case "xml-to-excel":
          result = "Excel export requires server-side processing. For now, download as CSV and open in Excel.";
          break;

        default:
          result = "Converter not implemented yet";
      }

      setOutputText(result);
    } catch (err: any) {
      setOutputText(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setXpathQuery("");
  };

  const handleCopy = () => {
    if (outputText) navigator.clipboard.writeText(outputText);
  };

  const handleDownload = () => {
    if (!outputText || outputText.startsWith("❌")) return;

    const extension = getFileExtension(selectedConverter);
    const blob = new Blob([outputText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `output.${extension}`;
    link.click();
  };

  const handleExampleXml = () => {
    setInputText(`<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>12.99</price>
  </book>
  <book category="non-fiction">
    <title lang="en">Sapiens</title>
    <author>Yuval Noah Harari</author>
    <year>2011</year>
    <price>24.99</price>
  </book>
</bookstore>`);
  };

  return (
    <ReusableSidebar
      title="XML Converter Tools"
      icon={Code}
      options={sidebarOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleConverterChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption as any}>
        <div className="mx-auto">
          <PageTitle selectedData={selectedOption} />

          {/* XPath input for XPath tester */}
          {selectedConverter === "xpath-tester" && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">XPath Query</label>
              <input
                type="text"
                value={xpathQuery}
                onChange={(e) => setXpathQuery(e.target.value)}
                className="border-2 border-gray-300 rounded-lg p-2 w-full"
                placeholder="//book/title"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Input</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full h-[400px] font-mono text-sm"
                placeholder={`<?xml version="1.0" encoding="UTF-8"?>
<root>
  <element>value</element>
</root>`}
              />
              <Button
                variant="link"
                onClick={handleExampleXml}
                className="mt-2 text-sm"
              >
                Load Example
              </Button>
            </div>

            {/* Output */}
            <div>
              <label className="text-sm font-medium mb-2 block">Output</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-[400px] overflow-auto bg-gray-50">
                {outputText ? (
                  outputText.startsWith("❌") ? (
                    <p className="text-red-500 whitespace-pre-wrap break-words">
                      {outputText}
                    </p>
                  ) : (
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                      {outputText}
                    </pre>
                  )
                ) : (
                  <p className="text-gray-400">Converted output will appear here</p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-2">
            <Button onClick={handleConvert} disabled={isLoading}>
              {isLoading ? "Converting..." : "Convert"}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="w-4 h-4 mr-1" /> Clear
            </Button>
            {outputText && !outputText.startsWith("❌") && (
              <>
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-1" /> Copy
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1" /> Download
                </Button>
              </>
            )}
          </div>
        </div>

        {/* DETAILS BOX */}
        
          { selectedOption && <Meta selectedData={selectedOption} />}
        
      </SidebarContentWrapper>
    </ReusableSidebar>
  );
}