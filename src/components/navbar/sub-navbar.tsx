"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getTableData } from "@/actions/dbAction";

interface Category {
  id: string | number;
  name: string;
}

interface Subcategory {
  id: string | number;
  route: string;
  name: string;
  category_id: string | number;
}

interface MergedCategory extends Category {
  subcategories: Subcategory[];
}

export function SubNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubCategories] = useState<Subcategory[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState<{ left?: string; right?: string; transform?: string }>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemRefs = useRef<{ [key: string | number]: HTMLLIElement | null }>({});

  const fetchData = async () => {
    try {
      const categoriesResponse = (await getTableData("categories")) as Category[];
      const subcategoriesResponse = (await getTableData("subcategories")) as Subcategory[];
      setCategories(categoriesResponse);
      setSubCategories(subcategoriesResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mergedCategories: MergedCategory[] = categories.map((cat) => ({
    ...cat,
    subcategories: subcategories.filter((sub) => sub.category_id === cat.id),
  }));

  const handleMouseEnter = (id: string | number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(id);

    // Calculate smart dropdown position to prevent edge clipping
    const el = itemRefs.current[id];
    if (el) {
      const rect = el.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 400; // max dropdown width

      if (rect.left + dropdownWidth > viewportWidth - 16) {
        // Would overflow right edge → align to right side of trigger
        setDropdownStyle({ right: "0", left: "auto" });
      } else {
        setDropdownStyle({ left: "0", right: "auto" });
      }
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 120);
  };

  return (
    <>
      <div
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? "top-[5px] bg-white shadow-md border-b border-gray-200"
            : "top-[40px] bg-white/80 backdrop-blur-md border-b border-white/40"
        }`}
      >
        {/* ── Mobile Toggle ── */}
        <div className="lg:hidden flex justify-between items-center px-4 py-2">
          <h2 className="font-semibold text-base text-gray-800">Categories</h2>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-purple-50 transition"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* ── Desktop Menu ── */}
        <nav className="hidden lg:flex justify-center px-6 py-1.5">
          <ul className="flex flex-wrap justify-center items-center">
            {mergedCategories.map((cat) => (
              <li
                key={cat.id}
                ref={(el) => { itemRefs.current[cat.id] = el; }}
                className="relative"
                onMouseEnter={() => handleMouseEnter(cat.id)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Trigger */}
                <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150 whitespace-nowrap">
                  {cat.name}
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 text-gray-400 ${activeMenu === cat.id ? "rotate-180 text-purple-500" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {activeMenu === cat.id && cat.subcategories.length > 0 && (
                  <div
                    style={dropdownStyle}
                    className={`absolute top-full mt-1 z-50 bg-white border border-purple-100 rounded-2xl shadow-[0_8px_30px_rgba(109,40,217,0.12)] overflow-hidden dropdown-enter ${
                      cat.subcategories.length >= 7 ? "w-80" : "w-64"
                    }`}
                    onMouseEnter={() => handleMouseEnter(cat.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Dropdown header */}
                    <div className="px-4 pt-3 pb-2 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-500">
                        {cat.name}
                      </span>
                    </div>

                    {/* Links grid */}
                    <div
                      className={`p-2 grid gap-0.5 ${
                        cat.subcategories.length >= 7 ? "grid-cols-2" : "grid-cols-1"
                      }`}
                    >
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/${sub.route}`}
                          onClick={() => setActiveMenu(null)}
                          className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 font-medium hover:bg-purple-50 hover:text-purple-700 transition-all duration-150"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-200 group-hover:bg-purple-500 transition-colors duration-150 flex-shrink-0" />
                          <span className="leading-tight">{sub.name}</span>
                        </Link>
                      ))}
                    </div>

                    <div className="h-1" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="lg:hidden px-3 pb-4 pt-1 bg-white border-t border-gray-100 shadow-lg slide-down">
            <div className="space-y-1">
              {mergedCategories.map((cat) => (
                <details key={cat.id} className="group rounded-xl overflow-hidden">
                  <summary className="list-none cursor-pointer flex justify-between items-center px-3 py-2.5 bg-gray-50 hover:bg-purple-50 rounded-xl text-sm font-semibold text-gray-700 hover:text-purple-700 transition select-none">
                    {cat.name}
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 group-open:rotate-180 transition-transform duration-200"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>

                  <div className="mt-1 ml-3 pl-3 border-l-2 border-purple-100 space-y-0.5 pb-1">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/${sub.route}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-200 flex-shrink-0" />
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dropdown-enter {
          animation: dropdownIn 0.15s ease-out forwards;
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .slide-down {
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>
    </>
  );
}