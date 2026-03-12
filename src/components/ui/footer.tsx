"use client";
import { Sparkles, Star, Github, Twitter, Youtube, Mail, Heart, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function Footer() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const footerSections = [
    {
      title: 'Popular Functionality',
      links: [
        { name: 'JSON Beautifier', href: '/json-formatter' },
        { name: 'HTML Viewer', href: '/html-converters/html-stripper' },
        { name: 'Number to Words', href: '/popular/number-to-words' },
        { name: 'SQL Formatter', href: '/sql-converters/sql-to-csv' },
        { name: 'Image to Base64', href: '/base64-tools/image-to-base64' },
        { name: 'Base64 to Image', href: '/base64-tools/base64-to-image' },
        { name: 'HEX to Pantone', href: '/popular/hex-to-pantone' },
        { name: 'Source Code Viewer', href: '/popular/source-code-viewer' },
        { name: 'Binary to Text', href: '/encode-decode/base64-decode' },
        { name: 'JSON Viewer', href: '/json-formatter' },
        { name: 'JSON Validator', href: '/json-formatter' },
        { name: 'Base64 Decode', href: '/encode-decode/base64-decode' },
        { name: 'Hex to Decimal', href: '/popular/hex-to-decimal' },
        { name: 'XML Viewer', href: '/xml-converters/xml-viewer' },
        { name: 'XML to JSON', href: '/xml-converters/xml-to-json' },
        { name: 'Encryption-Decryption', href: '/encode-decode/base64-encode' },
        { name: 'Excel to HTML', href: '/popular/excel-to-html' },
        { name: 'CSS Validator', href: '/popular/css-validator' },
        { name: 'XML Validator', href: '/xml-formatter' },
        { name: 'JavaScript Validator', href: '/popular/javascript-validator' },
        { name: 'CSS Beautifier', href: '/popular/css-beautifier' },
        { name: 'ONLINE JSON EDITOR', href: '/json-formatter' },
        { name: 'Decimal to Hex', href: '/popular/decimal-to-hex' },
        { name: 'Binary to Decimal', href: '/popular/binary-to-decimal' },
        { name: 'ASCII to Text', href: '/encode-decode/base64-decode' },
        { name: 'Random Emoji Generator', href: '/popular/random-emoji-generator' },
        { name: 'REM to PX Converter', href: '/popular/rem-to-px-converter' },
        { name: 'Incorrect Quotes Generator', href: '/popular/incorrect-quotes-generator' },
        { name: 'Lua Beautifier', href: '/trendingtool/lua-beautifier' }
      ]
    },
    {
      title: 'Trending Tools',
      links: [
        { name: 'Bitwise Calculator', href: '/trendingtool/number-utilities' },
        { name: 'Number Sorter', href: '/trendingtool/number-utilities' },
        { name: 'Remove Punctuation', href: '/trendingtool/number-utilities' },
        { name: 'HTML Stripper', href: '/trendingtool/html-stripper' },
        { name: 'Real Time HTML Editor', href: '/html-converters/html-stripper' },
        { name: 'HTML to Markdown', href: '/html-converters/html-to-markdown' },
        { name: 'Markdown to HTML', href: '/html-converters/markdown-to-html' },
        { name: 'Lua Minifier', href: '/trendingtool/lua-minifier' },
        { name: 'Lua Beautifier', href: '/trendingtool/lua-beautifier' },
        { name: 'WordPress Password Hash', href: '/trendingtool/wordpress-password-hash' },
        { name: 'Mirror Online', href: '/trendingtool/mirror-online' },
        { name: 'PHP Formatter', href: '/trendingtool/php-formatter' },
        { name: 'Image to ASCII Art', href: '/trendingtool/image-to-ascii-art' },
        { name: 'SHA256 Hash Generator', href: '/trendingtool/sha256' },
        { name: 'SHA512 Hash Generator', href: '/trendingtool/sha512' },
        { name: 'Excel Viewer', href: '/trendingtool/excel-viewer' },
        { name: 'Paraphrasing Tool', href: '/trendingtool/paraphrasing-tool' },
        { name: 'Word to HTML', href: '/trendingtool/word-to-html' },
        { name: 'CSV to Excel', href: '/trendingtool/csv-to-excel' },
        { name: 'Sharelink Generator', href: '/trendingtool/sharelink-generator' }
      ]
    },
    {
      title: 'Developer Tools',
      links: [
        { name: 'IP Tools', href: '/' },
        { name: 'Formatters & Beautifiers', href: '/json-formatter' },
        { name: 'Image Converter Tools', href: '/image-tools/jpg-to-png' },
        { name: 'Finance Tools', href: '/' },
        { name: 'TSV Tools', href: '/json-converters/json-to-tsv' },
        { name: 'JSON Tools', href: '/json-formatter' },
        { name: 'XML Tools', href: '/xml-formatter' },
        { name: 'YAML Tools', href: '/yaml-converters/yaml-to-json' },
        { name: 'HTML Tools', href: '/html-converters/html-stripper' },
        { name: 'CSS Tools', href: '/popular/css-beautifier' },
        { name: 'JavaScript Tools', href: '/popular/javascript-validator' },
        { name: 'CSV Tools', href: '/json-converters/json-to-csv' },
        { name: 'SQL Tools', href: '/sql-converters/sql-to-csv' },
        { name: 'Color Tools', href: '/popular/hex-to-pantone' },
        { name: 'Unit Tools', href: '/popular/rem-to-px-converter' },
        { name: 'Number Tools', href: '/popular/number-to-words' },
        { name: 'String Tools', href: '/trendingtool/number-utilities' },
        { name: 'Base64 Tools', href: '/base64-tools/image-to-base64' },
        { name: 'Random Tools', href: '/popular/random-emoji-generator' },
        { name: 'Minifiers', href: '/minifier/json-minify' },
        { name: 'Validators', href: '/popular/css-validator' },
        { name: 'Cryptography', href: '/trendingtool/sha256' },
        { name: 'Escape Unescape Tools', href: '/encode-decode/url-encode' },
        { name: 'UTF Tools', href: '/encode-decode/utf8-encode' },
        { name: 'Compress Decompress', href: '/minifier/json-minify' },
        { name: 'HTML Generators', href: '/html-converters/html-table-generator' },
        { name: 'CSS Generators', href: '/popular/css-beautifier' },
        { name: 'Other Tools', href: '/' },
        { name: 'Text Style Tools', href: '/json-converters/json-to-text' },
        { name: 'CSS Unit Converter Tools', href: '/popular/rem-to-px-converter' },
        { name: 'POJO Tools', href: '/json-converters/json-to-java' },
        { name: 'Twitter Tools', href: '/' },
        { name: 'Random Generators', href: '/popular/random-emoji-generator' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/codebeauty' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/codebeauty' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/codebeauty' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@codebeauty.com' }
  ];

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <footer className="bg-gradient-to-b from-white via-purple-50/30 to-purple-100/50 border-t border-purple-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Logo and Description - Takes 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              <Link 
                href="/" 
                className="flex items-center space-x-3 group w-fit"
                aria-label="CodeBeauty - Home"
              >
                <div className="relative w-11 h-11 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    AI ONLINE TOOLS
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">Power Your Code with AI</span>
                </div>
              </Link>

              {/* Social Links */}
              <div className="flex items-center space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2.5 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 group"
                    aria-label={`Follow us on ${social.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>
           
            {/* Footer Links - Takes 9 columns, divided into sections */}
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {footerSections.map((section) => {
                const isExpanded = expandedSections[section.title];
                const displayLinks = isExpanded ? section.links : section.links.slice(0, 10);
                
                return (
                  <div key={section.title} className="space-y-4">
                    <h3 className="font-bold text-gray-900 text-base">
                      {section.title}
                    </h3>
                    <ul className="space-y-2.5">
                      {displayLinks.map((link) => (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            className="text-gray-600 hover:text-purple-600 transition-colors duration-300 text-sm font-medium group"
                          >
                            <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                              {link.name}
                            </span>
                          </Link>
                        </li>
                      ))}
                      {section.links.length > 10 && (
                        <li>
                          <button
                            onClick={() => toggleSection(section.title)}
                            className="text-purple-600 hover:text-purple-700 font-semibold text-sm inline-flex items-center group"
                          >
                            {isExpanded ? 'Show less' : `View all ${section.links.length} tools`}
                            <ChevronDown 
                              className={`w-3 h-3 ml-1 transition-transform duration-300 ${
                                isExpanded ? 'rotate-180' : 'rotate-[-90deg]'
                              } group-hover:translate-x-1`}
                            />
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="py-8 border-t border-purple-100/50">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                Stay Updated
              </h3>
              <p className="text-gray-600 text-sm">
                Get the latest programming tutorials and tool updates
              </p>
            </div>
            <div className="flex w-full md:w-auto max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                aria-label="Email address"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white font-bold rounded-r-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-purple-100/50">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>© 2024 AI Online Tools. All rights reserved.</span>
              <span className="hidden md:block">•</span>
              <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors duration-300 group">
                <Star className="w-4 h-4 group-hover:fill-purple-600 transition-all duration-300" />
                <span>Favorites (3)</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>for developers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}