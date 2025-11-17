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
    <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center transition-transform group-hover:scale-110">
              <Music size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hidden xs:block">
              AI Playlist Generator
            </h1>
            <h1 className="text-base font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent xs:hidden">
              AI Playlist
            </h1>
          </Link>

          {/* Desktop Navigation - Only show when logged in and not on login page */}
          {user && !isLoginPage && (
            <>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-4 lg:gap-6">
                {/* Nav Links */}
                <nav className="flex items-center gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        pathname === link.href
                          ? "bg-[#1DB954] text-white"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* User Info */}
                <div className="hidden lg:flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="text-sm text-gray-300">
                    {user.name || user.email}
                  </span>
                </div>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition border border-gray-700 text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={24} />
                ) : (
                  <Menu size={24} />
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-in Menu */}
          <div className="fixed top-[73px] right-0 bottom-0 w-64 bg-gray-900 border-l border-gray-800 z-50 md:hidden animate-in slide-in-from-right duration-200">
            <div className="flex flex-col h-full">
              {/* User Info */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      pathname === link.href
                        ? "bg-[#1DB954] text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
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
                    className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg transition border border-gray-700 text-sm font-medium"
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