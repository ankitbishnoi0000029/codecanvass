import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - AI Online Tools | Free Developer Tools",
  description:
    "Learn about AI Online Tools – a free online platform providing tools to beautify, minify, convert and validate code like JSON, XML, HTML, CSS, JavaScript and more.",
  keywords: [
    "AI Online Tools",
    "JSON tools",
    "XML tools",
    "HTML beautifier",
    "code formatter",
    "developer tools online",
    "free coding tools",
  ],
  alternates: {
    canonical: "https://aionlinetoolss.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About AI Online Tools
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          AI Online Tools is a collection of powerful and easy-to-use developer
          utilities designed to help developers, students, and professionals
          format, convert, validate, and optimize code and data instantly.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">
          Our Mission
        </h2>

        <p className="text-gray-600 leading-relaxed">
          Our mission is to provide fast, reliable, and completely free online
          tools that simplify everyday developer tasks. Whether you need to
          beautify JSON, validate XML, minify JavaScript, or convert CSV data,
          our platform helps you achieve the expected results quickly and
          efficiently.
        </p>

        <p className="text-gray-600 mt-4 leading-relaxed">
          AI Online Tools is designed to improve productivity and reduce manual
          effort by offering powerful utilities in one convenient place.
        </p>
      </div>

      {/* Tools Section */}
      <div className="mb-14">
        <h2 className="text-2xl font-semibold mb-6 text-purple-700">
          Available Tool Categories
        </h2>

        <div className="grid md:grid-cols-3 gap-6 text-gray-600">

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">JSON Tools</h3>
            <ul className="space-y-1">
              <li>JSON Viewer</li>
              <li>JSON Beautifier</li>
              <li>JSON Minifier</li>
              <li>JSON Validator</li>
              <li>JSON to CSV Converter</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">XML Tools</h3>
            <ul className="space-y-1">
              <li>XML Viewer</li>
              <li>XML Beautifier</li>
              <li>XML Minifier</li>
              <li>XML Validator</li>
              <li>XML to CSV Converter</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">HTML & Web Tools</h3>
            <ul className="space-y-1">
              <li>HTML Viewer</li>
              <li>HTML Beautifier</li>
              <li>HTML Minifier</li>
              <li>JavaScript Validator</li>
              <li>CSS Validator</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Programming Tools</h3>
            <ul className="space-y-1">
              <li>Java Formatter</li>
              <li>Python Formatter</li>
              <li>Ruby Formatter</li>
              <li>C / C++ Formatter</li>
              <li>C# Formatter</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Converters</h3>
            <ul className="space-y-1">
              <li>CSV to XML / JSON</li>
              <li>Number Converter</li>
              <li>Units Converter</li>
              <li>Image to Base64</li>
              <li>Date Calculator</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Text Utilities</h3>
            <ul className="space-y-1">
              <li>Word Counter</li>
              <li>Case Converter</li>
              <li>Remove Duplicate Lines</li>
              <li>Text Minifier</li>
              <li>Text to HTML</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Why choose */}
      <div className="bg-purple-50 p-8 rounded-xl mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">
          Why Choose AI Online Tools?
        </h2>

        <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
          <li>⚡ Fast and responsive tools</li>
          <li>🔒 Secure browser-based processing</li>
          <li>🆓 Completely free utilities</li>
          <li>💻 Built for developers and data analysts</li>
          <li>📱 Mobile friendly interface</li>
          <li>🚀 No installation required</li>
        </ul>
      </div>

      {/* Support */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">
          Support Our Platform
        </h2>

        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          If you find <strong>aionlinetoolss.com</strong> useful, feel free to
          share it with others. Your support helps us improve and build more
          helpful tools for developers around the world.
        </p>

        <Link
          href="/contact"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          Contact Us
        </Link>
      </div>

    </div>
  );
}