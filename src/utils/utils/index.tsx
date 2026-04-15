// utils/base64ToImage.ts
export function base64ToImage(base64String: string): string {
  if (typeof window === "undefined") return "";

  // Ensure it's a string and not empty
  if (!base64String || typeof base64String !== "string") {
    console.warn("⚠️ base64ToImage: Empty or invalid string input");
    return "";
  }

  // ✅ Detect valid Base64 (with or without data:image/... prefix)
  const isValidBase64 =
    /^data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=\r\n]+$/.test(base64String) ||
    /^[A-Za-z0-9+/=\r\n]+$/.test(base64String);

  if (!isValidBase64) {
    console.warn("⚠️ base64ToImage: Input is not valid Base64 ->", base64String);
    return "";
  }

  // Extract MIME type (default PNG)
  const mimeMatch = base64String.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

  // Remove prefix if present  
  let base64Data = base64String.includes(",")
    ? base64String.split(",")[1]
    : base64String;

  // Clean up data
  base64Data = base64Data
    .replace(/[\r\n]+/g, "")
    .replace(/ /g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  // Ensure padding
  while (base64Data.length % 4 !== 0) base64Data += "=";

  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("❌ base64ToImage: Failed to decode base64 string", error);
    return "";
  }
}


// utils/imageToBase64.ts
export async function imageFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // converts file → base64 string
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}



// utils/htmlStripper.ts
export function stripHTML(html: string): string {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}



// utils/downloadUtils.ts

/**
 * Downloads an array of { metric, value } objects as a formatted .txt file
 * @param data - Array of objects with `metric` and `value` properties
 * @param options - Optional configuration
 */
export const downloadMetricsAsText = (
  data: Array<{ metric: string; value: any }>,
  options?: {
    filename?: string;          // default: 'report'
    title?: string;             // default: 'Data Report'
    includeDate?: boolean;      // default: true
    separator?: string;         // default: '--------------------------------------------------'
    footer?: string;            // default: '* Generated from application'
    dateLocale?: string;        // default: 'en-IN'
  }
) => {
  const {
    filename = 'report',
    title = 'Data Report',
    includeDate = true,
    separator = '--------------------------------------------------',
    footer = '* Generated from application',
    dateLocale = 'en-IN',
  } = options || {};

  // Build content
  const lines: string[] = [];

  lines.push(title);
  lines.push('');

  if (includeDate) {
    lines.push(`Date: ${new Date().toLocaleDateString(dateLocale)}`);
    lines.push('');
  }

  lines.push(separator);
  lines.push('');

  // Add each metric: value line
  data.forEach(row => {
    lines.push(`${row.metric}: ${row.value}`);
  });

  lines.push('');
  lines.push(separator);
  lines.push(footer);

  const textContent = lines.join('\n');

  // Trigger download
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  a.download = `${filename}_${timestamp}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};