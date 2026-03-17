'use client';
import {
  Sparkles,
  Mail,
  Heart,
  ChevronDown,
  LoaderPinwheelIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState, type ChangeEvent } from 'react';
import { footerSections } from '@/utils/consitants/consitaint';
import { toast } from 'sonner';
import { subscribe } from '@/actions/dbAction';

export function Footer() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const sendMail = async () => {
    await fetch('/api/sendmail', {
      method: 'POST',
      body: JSON.stringify(email),
    }).then((res) => {
      if (res.ok) {
        toast.success('Email sent successfully');
        setEmail('');
        subscribe(email);
        setLoading(false);
      } else {
        toast.error('Failed to send email');
        setLoading(false);
      }
    });
  };
  const handleEmail = () => {
    setLoading(true);
    sendMail();
    //
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
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
            </div>

            {/* Footer Links - Takes 9 columns, divided into sections */}
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {footerSections.map((section) => {
                const isExpanded = expandedSections[section.title];
                const displayLinks = isExpanded ? section.links : section.links.slice(0, 10);

                return (
                  <div key={section.title} className="space-y-4">
                    <h3 className="font-bold text-gray-900 text-base">{section.title}</h3>
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
              <h3 className="font-bold text-gray-900 text-lg mb-1">Stay Updated</h3>
              <p className="text-gray-600 text-sm">
                Get the latest programming tutorials and tool updates
              </p>
            </div>
            <div className="flex w-full md:w-auto max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-l-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                aria-label="Email address"
              />
              <button
                onClick={handleEmail}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white font-bold rounded-r-xl text-sm whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? <LoaderPinwheelIcon className="animate-spin w-5 h-5" /> : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-purple-100/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            {/* Copyright */}
            <div className="flex items-center space-x-2">
              <span>© {new Date().getFullYear()} AI Online Tools. All rights reserved.</span>
            </div>

            {/* Contact */}
            <a
              href="mailto:support@aionlinetoolss.com"
              className="flex items-center space-x-1 hover:text-purple-600 transition-colors group"
            >
              <Mail className="w-4 h-4 group-hover:fill-purple-600" />
              <span>support@aionlinetoolss.com</span>
            </a>

            {/* About us */}
            <div className="flex items-center space-x-4">
              <a href="/about" className="hover:text-purple-600 transition-colors">
                About Us
              </a>
              <a href="/disclaimer" className="hover:text-purple-600 transition-colors">
                Disclaimer Us
              </a>
              {/* Policy Links */}
              <a href="/privacy-policy" className="hover:text-purple-600 transition-colors">
                Privacy Policy
              </a>

              <a href="/terms-of-service" className="hover:text-purple-600 transition-colors">
                Terms of Service
              </a>
              <a href="/contact" className="hover:text-purple-600 transition-colors">
                Contact Us
              </a>
            </div>

            {/* Developer */}
            <a
              href="/contact"
              className="flex items-center space-x-1 hover:text-purple-600 transition-colors"
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Contact Developer</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
