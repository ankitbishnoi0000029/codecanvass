"use client";

import { useParams, notFound } from "next/navigation"
import { Utility } from "@/components/sections/utility"

const validTools = [
  "send-snap-message",
  "responsive-website-tester",
  "credit-card-validator",
  "credit-card-fake-number-generator",
  "xpath-tester",
  "json-path-tester",
  "json-minifier",
  "file-difference",
  "json-diff",
  "xml-diff",
  "broken-link-checker",
  "json-deserialize-online",
  "json-serialize-online",
  "json-stringify-online",
  "xml-stringify-online",
  "string-to-json-online",
  "javascript-obfuscator",
  "curl-to-php",
  "crontab-format",
]

export default function ToolPage() {
  const params = useParams()
  const tool = params?.tool as string

  if (!validTools.includes(tool)) {
    notFound()
  }

  return <Utility defaultTool={tool} />
}
