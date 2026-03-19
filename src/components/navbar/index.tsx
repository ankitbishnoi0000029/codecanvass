'use client';
import { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Compress Hub', href: '/compress' },
    { name: 'JSON Formatter', href: '/json-formatter' },
    { name: 'XML Formatter', href: '/xml-formatter' },
    { name: 'Generator QR', href: '/qrGenerator' },
    { name: 'Remove Background', href: '/bg-remove' },
    // { name: 'Share File', href: '/sharefile' },
    // { name: 'Video Downloader', href: '/videodownloder' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 py-1 left-0 right-0 z-50 transition-all duration-300 w-screen ${
          isScrolled
            ? 'bg-white shadow-md'
            : 'bg-white/70 backdrop-blur-md border-b border-gray-200'
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* NAVBAR */}
          <div className="flex items-center justify-between ">
            
            {/* LOGO */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center group">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    AI ONLINE TOOLS
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Power Your Code with AI Tools
                  </span>
                </div>
              </a>
            </div>
             <div className="hidden lg:flex items-center xl:gap-8 scrollbar-hide px-3 py-1 rounded-md bg-black text-white">
              
                <a
                  href={'/chat-GPT'}
                  className="font-medium transition-colors hover:border-b-2 border-purple-600"
                >
                  {'ChatGPT'}
                </a>
             
            </div>
            {/* DESKTOP MENU */}
            <div className="hidden lg:flex items-center gap-2.5 xl:gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-purple-600 text-xs font-medium transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-purple-50 transition"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div
          className={`lg:hidden transition-all duration-300 ${
            isMobileMenuOpen
              ? 'max-h-[500px] opacity-100'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-4 py-3 space-y-2 bg-white border-t">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:text-purple-600 text-sm font-medium"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* BODY OFFSET (IMPORTANT) */}
      <div className="h-16" />
    </>
  );
}