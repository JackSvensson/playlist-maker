"use client"

import { useState } from "react"
import Link from "next/link"
import { Music, LogOut, User, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

interface HeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  onLogout?: () => void
}

export default function Header({ user, onLogout }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isLoginPage = pathname === "/login" || pathname === "/"
  
  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/create", label: "Generate" },
    { href: "/history", label: "History" },
  ]

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-gray-800 bg-gradient-to-b from-gray-950 to-black backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-2 sm:gap-3 group">
            {/* Icon with subtle accent */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center transition-all group-hover:from-gray-700 group-hover:to-gray-600 border border-gray-700 group-hover:border-gray-600">
              <Music size={20} className="text-white sm:w-5 sm:h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight">
                AI Playlist
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-400 font-bold tracking-wider hidden sm:block">
                GENERATOR
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Only show when logged in and not on login page */}
          {user && !isLoginPage && (
            <>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-3 lg:gap-4">
                {/* Nav Links */}
                <nav className="flex items-center gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        pathname === link.href
                          ? "bg-white text-black"
                          : "text-white hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* User Info */}
                <div className="hidden lg:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-800">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-xs text-white font-medium max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                </div>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 px-3 lg:px-4 py-2 rounded-lg transition-all border border-gray-800 text-sm text-white font-medium hover:border-gray-700"
                  >
                    <LogOut size={15} />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:bg-gray-900 rounded-lg transition border border-gray-700 hover:border-gray-600 active:scale-95"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={22} strokeWidth={2.5} />
                ) : (
                  <Menu size={22} strokeWidth={2.5} />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {user && !isLoginPage && mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-in Menu */}
          <div className="fixed top-[57px] right-0 bottom-0 w-72 bg-gradient-to-b from-gray-950 to-gray-900 border-l border-gray-800 z-50 md:hidden animate-in slide-in-from-right duration-200 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* User Info */}
              <div className="p-5 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border-2 border-gray-700">
                    <User size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate mb-0.5">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-300 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      pathname === link.href
                        ? "bg-white text-black"
                        : "text-white hover:text-white hover:bg-gray-800 active:scale-98"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Logout Button */}
              {onLogout && (
                <div className="p-4 border-t border-gray-800">
                  <button
                    onClick={() => {
                      handleLinkClick()
                      onLogout()
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg transition-all border border-gray-700 text-sm font-semibold text-white hover:border-gray-600 active:scale-98"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}