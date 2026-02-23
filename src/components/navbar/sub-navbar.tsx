"use client";

import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "../ui/navigation-menu";
import Link from "next/link";

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

export function SubNavbar({ categoriesData, subcategoriesData }: { categoriesData: Category[], subcategoriesData: Subcategory[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>(categoriesData);
  const [subcategories, setSubCategories] = useState<any[]>(subcategoriesData);

  // Fetch categories & subcategories
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Merge subcategories inside categories
  const mergedCategories = categories.map((cat) => ({
    ...cat,
    subcategories: subcategories.filter(
      (sub) => sub.category_id === cat.id
    ),
  }));

  return (
    <>
      {/* Navbar wrapper */}
      <div
        className={`fixed left-0 right-0 z-40 transition-all duration-1500 
          ${
            isScrolled
              ? "top-[5px] bg-white shadow-lg border-b"
              : "top-[55px] bg-white/70 backdrop-blur-md"
          }
        `}
      >
        {/* Mobile Toggle */}
        <div className="lg:hidden flex justify-between items-center px-4 py-2">
          <h2 className="font-semibold text-lg">Categories</h2>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md border bg-white shadow-sm"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex justify-center px-4 py-1">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="flex gap-0 flex-wrap justify-center">
              {mergedCategories.map((cat) => (
                <NavigationMenuItem key={cat.id}>
                  <NavigationMenuTrigger className="px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-100 transition">
                    {cat.name}
                  </NavigationMenuTrigger>

                  <NavigationMenuContent className="rounded-2xl border border-purple-200 shadow-2xl bg-white">
                    <div
                      className={`py-2 ${
                        cat.subcategories.length >= 7 ? "w-[26rem]" : "w-60"
                      }`}
                    >
                      <div
                        className={`grid gap-1 ${
                          cat.subcategories.length >= 7
                            ? "grid-cols-2"
                            : "grid-cols-1"
                        }`}
                      >
                        {cat.subcategories.map((sub: { id: string | number; route: string; name: string }) => (
                          <NavigationMenuLink asChild key={sub.id}>
                            <Link
                              href={`/${sub.route}`}
                              className="px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all font-medium text-xs rounded-md"
                            >
                              {sub.name}
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden px-4 pb-3 bg-white border-t shadow-md animate-slideDown">
            {mergedCategories.map((cat) => (
              <div key={cat.id} className="mb-2">
                <details className="group">
                  <summary className="cursor-pointer py-2 px-2 bg-gray-100 rounded-md font-medium flex justify-between items-center">
                    {cat.name}
                    <span className="text-sm">▼</span>
                  </summary>

                  <div className="mt-1 pl-3 space-y-1">
                    {cat.subcategories.map((sub: { id: string | number; route: string; name: string }) => (
                      <Link
                        key={sub.id}
                        href={`/${sub.route}`}
                        className="block px-2 py-1 text-sm text-gray-700 rounded hover:bg-purple-50"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-slideDown {
          animation: slideDown 0.25s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
