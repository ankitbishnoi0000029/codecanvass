"use client";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles } from "lucide-react";

// Custom hook to detect Dark Reader
const useDarkReader = () => {
  const [hasDarkReader, setHasDarkReader] = useState(false);

  useEffect(() => {
    // Check if Dark Reader is installed by looking for its specific attributes or styles
    const checkForDarkReader = () => {
      const testElement = document.createElement('div');
      testElement.style.display = 'none';
      document.body.appendChild(testElement);

      // Dark Reader adds specific CSS variables or modifies elements
      const computedStyle = getComputedStyle(testElement);
      const hasDarkReaderVars = computedStyle.getPropertyValue('--darkreader-background') ||
                               computedStyle.getPropertyValue('--darkreader-text') ||
                               testElement.getAttribute('data-darkreader-inline-bgcolor');

      document.body.removeChild(testElement);
      setHasDarkReader(!!hasDarkReaderVars);
    };

    // Check after a short delay to let extensions load
    const timer = setTimeout(checkForDarkReader, 1000);

    return () => clearTimeout(timer);
  }, []);

  return hasDarkReader;
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "JSON Formatter", href: "/json-formatter" },
    { name: "XML Formatter", href: "/xml-formatter" },
    { name: "Generator qr", href: "/qrGenerator" },
    { name: "Remove Background", href: "/backgroundremover" },
    { name: "Share File", href: "/sharefile" },
        { name: "Video downloder", href: "/videodownloder" },

    { name: "Blog", href: "/blog" },
  ];

  return (
    <header
      className={`top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur"
      }`}
      suppressHydrationWarning={true}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Navbar container (height reduced) */}
        <div className="flex items-center justify-between h-8 lg:h-10">
          {/* Logo */}
          <div className="flex-shrink-0 z-10">
            <a href="/" className="flex items-center space-x-2 group">
              <div className="relative w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md" suppressHydrationWarning={true}>
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-base lg:text-lg font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  CodeBeauty
                </span>
                <span className="text-[10px] text-gray-500 -mt-0.5 hidden sm:block">
                  Learn. Code. Create.
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-purple-600 text-sm font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md text-gray-700 hover:bg-purple-50 transition"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-[calc(100vh-4rem)] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-1 bg-white border-t border-gray-200">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block px-4 py-2 text-gray-700 hover:text-purple-600 text-sm font-medium transition"
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
