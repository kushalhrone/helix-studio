/**
 * Helix Design System — Premium UI Components & Utilities
 * Based on Mistral.ai aesthetic + High-End Visual Design skill + Impeccable audit
 */

import React from "react";

/* ============================================
   EMPTY STATE COMPONENT
   ============================================ */
export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-lg mb-2 transition-transform duration-300 hover:scale-110"
        style={{
          background: "linear-gradient(135deg, rgba(250,82,15,0.12) 0%, rgba(255,161,16,0.06) 100%)",
          color: "#fa520f"
        }}>
        {icon}
      </div>
      <h3 className="mt-6 text-2xl font-500 text-foreground tracking-tight">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed opacity-85">{description}</p>
      {action && (
        <a
          href={action.href || "#"}
          onClick={(e) => {
            if (!action.href) {
              e.preventDefault();
              action.onClick?.();
            }
          }}
          className="mt-8 inline-block px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-lg hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #fa520f 0%, #ff8105 100%)",
            boxShadow: "rgba(250, 82, 15, 0.2) 0 4px 12px"
          }}
        >
          {action.label}
        </a>
      )}
    </div>
  );
}

/* ============================================
   SKELETON LOADER COMPONENT
   ============================================ */
export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border animate-pulse transition-colors duration-500"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(250,82,15,0.03) 100%)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(250, 82, 15, 0.08)",
      }}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-20 rounded-sm bg-gradient-to-r from-muted/50 to-muted/20" />
          <div className="h-6 w-24 rounded-sm bg-gradient-to-r from-muted/60 to-muted/30" />
        </div>
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-full rounded-sm bg-gradient-to-r from-muted/50 to-transparent" />
        <div className="h-2.5 w-5/6 rounded-sm bg-gradient-to-r from-muted/40 to-transparent" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ============================================
   TOOLTIP COMPONENT
   ============================================ */
export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);

  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div className="relative inline-block group">
      {children}
      {visible && (
        <div
          className={`absolute ${positionClasses[position]} left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-lg text-xs font-medium text-white whitespace-nowrap animate-in fade-in scale-in duration-250 origin-bottom`}
          style={{
            background: "linear-gradient(135deg, #fa520f 0%, #ff8105 100%)",
            boxShadow: "rgba(250, 82, 15, 0.4) 0 8px 24px"
          }}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
        >
          {content}
        </div>
      )}
      <div
        className="transition-opacity duration-200"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      />
    </div>
  );
}

/* ============================================
   LOADING OVERLAY COMPONENT
   ============================================ */
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300"
      style={{ background: "rgba(31, 31, 31, 0.6)" }}>
      <div className="flex flex-col items-center gap-5 p-8 rounded-2xl animate-in scale-in duration-400"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,82,15,0.06) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(250, 82, 15, 0.15)",
          boxShadow: "rgba(127, 99, 21, 0.2) 0 20px 64px"
        }}>
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-orange-500 border-r-orange-500 animate-spin" />
          <div className="absolute inset-1 rounded-full border border-orange-200/30" />
        </div>
        <p className="text-sm font-medium text-foreground tracking-wide">{message}</p>
      </div>
    </div>
  );
}

/* ============================================
   BADGE VARIANTS
   ============================================ */
export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  success: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  warning: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  error: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:shadow-md ${badgeVariants[variant]}`}
      style={{
        letterSpacing: "0.03em"
      }}>
      {children}
    </span>
  );
}

/* ============================================
   PROGRESS INDICATOR
   ============================================ */
export interface ProgressProps {
  value: number;
  label?: string;
  variant?: "default" | "success" | "warning" | "error";
}

export function Progress({ value, label, variant = "default" }: ProgressProps) {
  const colorMap = {
    default: "bg-gradient-to-r from-orange-400 to-orange-600",
    success: "bg-gradient-to-r from-emerald-400 to-emerald-600",
    warning: "bg-gradient-to-r from-amber-400 to-amber-600",
    error: "bg-gradient-to-r from-rose-400 to-rose-600",
  };

  return (
    <div className="w-full space-y-3">
      {label && <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">{label}</p>}
      <div className="h-2.5 w-full rounded-full overflow-hidden transition-colors duration-200"
        style={{ background: "rgba(250, 82, 15, 0.08)" }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-lg ${colorMap[variant]}`}
          style={{
            width: `${Math.min(value, 100)}%`,
            boxShadow: "rgba(250, 82, 15, 0.3) 0 0 8px"
          }}
        />
      </div>
    </div>
  );
}

/* ============================================
   DIVIDER COMPONENT
   ============================================ */
export function Divider({ label }: { label?: string }) {
  if (!label) {
    return <div className="h-px bg-border/50 my-4" />;
  }

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

/* ============================================
   CARD WITH CUSTOM STYLING
   ============================================ */
export interface CustomCardProps {
  children: React.ReactNode;
  variant?: "default" | "glass" | "elevated" | "subtle";
  className?: string;
}

const cardVariants = {
  default: "border border-border/50 bg-card",
  glass: "border border-border/30 bg-white/40 dark:bg-black/20 backdrop-blur-8",
  elevated: "border border-border/50 bg-card shadow-lg",
  subtle: "border border-transparent bg-muted/20",
};

export function CustomCard({ children, variant = "default", className }: CustomCardProps) {
  return (
    <div className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-md ${cardVariants[variant]} ${className || ""}`}
      style={variant === "glass" ? {
        background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(250,82,15,0.04) 100%)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(250, 82, 15, 0.12)"
      } : {}}
    >
      {children}
    </div>
  );
}

/* ============================================
   CALL-TO-ACTION SECTION
   ============================================ */
export interface CTASectionProps {
  headline: string;
  description: string;
  primaryAction: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export function CTASection({ headline, description, primaryAction, secondaryAction }: CTASectionProps) {
  return (
    <div className="py-16 px-6 sm:px-8 lg:px-12 rounded-2xl text-center border transition-all duration-300 hover:shadow-lg"
      style={{
        background: "linear-gradient(135deg, rgba(250,82,15,0.08) 0%, rgba(255,161,16,0.04) 100%)",
        borderColor: "rgba(250, 82, 15, 0.12)"
      }}>
      <h2 className="text-3xl sm:text-4xl font-500 text-foreground leading-tight" style={{ letterSpacing: "-0.02em" }}>
        {headline}
      </h2>
      <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed opacity-85">{description}</p>
      <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={primaryAction.onClick}
          className="px-7 py-3 rounded-lg font-medium text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-lg hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #fa520f 0%, #ff8105 100%)",
            boxShadow: "rgba(250, 82, 15, 0.25) 0 8px 24px"
          }}
        >
          {primaryAction.label}
        </button>
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-7 py-3 rounded-lg font-medium text-primary transition-all duration-300 border hover:bg-orange-50 hover:shadow-md"
            style={{
              borderColor: "rgba(250, 82, 15, 0.25)"
            }}
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================
   STAT DISPLAY VARIANTS
   ============================================ */
export interface StatDisplayProps {
  value: number | string;
  label: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  size?: "sm" | "md" | "lg";
}

const sizeVariants = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
};

export function StatDisplay({ value, label, icon, trend, size = "md" }: StatDisplayProps) {
  return (
    <div className="space-y-3 group">
      <div className="flex items-center gap-2">
        {icon && <div className="text-primary transition-transform duration-300 group-hover:scale-110">{icon}</div>}
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">{label}</p>
      </div>
      <div className="flex items-baseline gap-3">
        <p className={`font-600 text-foreground transition-colors duration-300 ${sizeVariants[size]}`}>{value}</p>
        {trend && (
          <span className={`text-xs font-bold transition-all duration-300 ${
            trend === "up" ? "text-rose-600" : trend === "down" ? "text-emerald-600" : "text-muted-foreground/50"
          }`}
            style={{
              fontSize: "0.625rem",
              lineHeight: "1"
            }}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>
    </div>
  );
}
