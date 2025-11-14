"use client"

import Link from "next/link"
import { Music, LogOut, User } from "lucide-react"
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
  
  const isLoginPage = pathname === "/login" || pathname === "/"
  
  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/create", label: "Generate" },
    { href: "/history", label: "History" },
  ]

  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center transition-transform group-hover:scale-110">
              <Music size={24} className="text-white sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              AI Playlist Generator
            </h1>
          </Link>

          {/* Navigation - Only show when logged in and not on login page */}
          {user && !isLoginPage && (
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Nav Links - Hidden on mobile */}
              <nav className="hidden md:flex items-center gap-1">
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
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="text-sm text-gray-300 hidden lg:inline">
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
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && !isLoginPage && (
          <nav className="md:hidden flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  pathname === link.href
                    ? "bg-[#1DB954] text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}