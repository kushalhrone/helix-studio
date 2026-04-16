/**
 * Enhanced Navigation Component
 * Premium micro-interactions, accessibility, and design polish
 */

import React from "react";
import { Menu, X } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface EnhancedNavProps {
  logo: React.ReactNode;
  links: NavLink[];
  onNavigate?: (href: string) => void;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EnhancedNav({
  logo,
  links,
  onNavigate,
  primaryAction,
}: EnhancedNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    onNavigate?.(href);
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-2xl border-b border-border/20 transition-all duration-300"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(250,82,15,0.03) 100%)",
        boxShadow: "rgba(127, 99, 21, 0.08) 0 4px 12px"
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
            {logo}
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="group relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200"
              >
                <div className="flex items-center gap-1.5">
                  {link.icon && <span className="h-4 w-4">{link.icon}</span>}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: "rgba(250,82,15,0.2)",
                        color: "#fa520f",
                      }}>
                      {link.badge}
                    </span>
                  )}
                </div>

                {/* Hover underline animation */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 group-hover:w-full w-0 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" />
              </button>
            ))}
          </div>

          {/* Primary Action & Mobile Menu */}
          <div className="flex items-center gap-3">
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="hidden sm:inline-block px-4 py-2 rounded-lg font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-lg active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #fa520f 0%, #ff8105 100%)",
                }}>
                {primaryAction.label}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
              >
                {link.icon && <span className="h-4 w-4">{link.icon}</span>}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(250,82,15,0.2)",
                      color: "#fa520f",
                    }}>
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
            {primaryAction && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  primaryAction.onClick();
                }}
                className="w-full mt-4 px-4 py-2 rounded-lg font-medium text-white transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #fa520f 0%, #ff8105 100%)",
                }}>
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

/* ============================================
   BREADCRUMB NAVIGATION
   ============================================ */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-muted-foreground/50">/</span>
          )}
          {item.href ? (
            <button
              onClick={() => onNavigate?.(item.href!)}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ============================================
   PAGINATION COMPONENT
   ============================================ */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Previous page"
      >
        ←
      </button>

      {visiblePages.map((page, i) => (
        <React.Fragment key={page}>
          {i > 0 && visiblePages[i - 1] !== page - 1 && (
            <span className="text-muted-foreground">…</span>
          )}
          <button
            onClick={() => onPageChange(page)}
            className={`min-w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
              page === currentPage
                ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                : "text-foreground/70 hover:text-foreground hover:bg-muted"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
}
