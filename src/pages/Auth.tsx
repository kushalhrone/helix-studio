import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { HelixLogo } from "@/components/HelixLogo";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a confirmation link." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "Password reset link sent." });
      setShowReset(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="flex min-h-screen">
        <BrandingPanel />
        <div className="flex flex-1 items-center justify-center px-6 py-12" style={{ background: "#fffaeb" }}>
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-500 tracking-tight text-foreground leading-tight" style={{ letterSpacing: "-0.025em" }}>
                Reset password
              </h2>
              <p className="text-sm text-muted-foreground/80 leading-relaxed opacity-85">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="reset-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Email address</Label>
                <InputField value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" type="email" required />
              </div>
              <PremiumButton type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Sending..." : "Send Reset Link"}
              </PremiumButton>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setShowReset(false)}
              >
                ← Back to sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <BrandingPanel />
      <div className="flex flex-1 items-center justify-center px-6 py-12" style={{ background: "#fffaeb" }}>
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <HelixLogo size={32} />
            <span className="text-xl font-normal text-foreground" style={{ letterSpacing: "-0.5px" }}>Helix</span>
          </div>

          {/* Eyebrow tag */}
          <div className="flex">
            <span className="inline-block rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 hover:shadow-md"
              style={{
                background: "linear-gradient(135deg, rgba(250,82,15,0.12) 0%, rgba(255,161,16,0.06) 100%)",
                color: "#fa520f",
                border: "1px solid rgba(250, 82, 15, 0.2)"
              }}>
              {isLogin ? "Welcome back" : "Getting started"}
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-5xl sm:text-6xl font-500 tracking-tight text-foreground leading-tight" style={{ letterSpacing: "-0.025em" }}>
              {isLogin ? "Sign in" : "Create account"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed opacity-85 max-w-sm">
              {isLogin
                ? "Welcome back. Access your Helix dashboard and manage requests seamlessly."
                : "Join our platform and streamline your request management workflow."}
            </p>
          </div>

          {/* Form Container - Glass Morphism */}
          <div className="space-y-5 p-6 sm:p-7 rounded-2xl border transition-all duration-300" style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(250,82,15,0.04) 100%)",
            border: "1px solid rgba(250, 82, 15, 0.15)",
            backdropFilter: "blur(16px)",
            boxShadow: "rgba(127, 99, 21, 0.08) 0 8px 32px"
          }}>
            {!isLogin && (
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Display Name</Label>
                <InputField value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" required />
              </div>
            )}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Email address</Label>
              <InputField value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" type="email" required />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Password</Label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:text-orange-700 transition-colors duration-200"
                    onClick={() => setShowReset(true)}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "••••••••" : "Min. 6 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 pr-10 bg-white/60 border-orange-100 focus:border-orange-300 transition-colors duration-300"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <PremiumButton type="submit" onClick={handleSubmit} disabled={loading} className="w-full mt-6">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </PremiumButton>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground/80 leading-relaxed">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="font-semibold text-primary hover:text-orange-700 transition-colors duration-200 underline underline-offset-2"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full h-12 px-4 rounded-lg bg-white/80 border border-orange-100/60 placeholder-muted-foreground/60 text-foreground focus:outline-none focus:border-orange-300 focus:ring-2 transition-all duration-300 shadow-[inset_0_1px_3px_rgba(250,82,15,0.04)] focus:shadow-[inset_0_1px_4px_rgba(250,82,15,0.1)]"
      style={{
        focusRingColor: "rgba(250, 82, 15, 0.2)"
      }}
    />
  );
}

function PremiumButton({
  children,
  disabled,
  onClick,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.FormEvent) => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick as any}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 h-12 px-6 rounded-lg font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none ${className}`}
      style={{
        background: "linear-gradient(135deg, #fa520f 0%, #ff8105 100%)",
        color: "white",
        boxShadow: "rgba(250, 82, 15, 0.3) 0 8px 24px"
      }}
    >
      {children}
    </button>
  );
}

function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between px-12 py-16 relative overflow-hidden"
      style={{ background: "#1f1f1f", color: "#fffaeb" }}>

      {/* Mistral warm amber glow decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full blur-3xl" style={{ background: "rgba(250, 82, 15, 0.15)" }} />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl" style={{ background: "rgba(255, 161, 16, 0.10)" }} />
      </div>

      {/* Mistral block gradient bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 mistral-gradient" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 animate-in fade-in slide-in-from-left-8 duration-700">
        <div className="flex h-10 w-10 items-center justify-center mistral-gradient"
          style={{ borderRadius: "2px" }}>
          <HelixLogo size={40} />
        </div>
        <span className="text-2xl font-normal tracking-tight" style={{ color: "#fffaeb", letterSpacing: "-0.5px" }}>Helix</span>
      </div>

      {/* Main content */}
      <div className="relative space-y-8">
        <div className="space-y-4 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
          <h1 className="text-5xl font-normal leading-none" style={{ letterSpacing: "-1.5px", color: "#fffaeb" }}>
            Streamline your<br />
            <span style={{ color: "#ffa110" }}>request pipeline</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(255,250,235,0.65)" }}>
            Prioritize, classify, and manage incoming requests with unmatched clarity. Keep your sprint focused and your team aligned.
          </p>
        </div>

        {/* Feature highlights with premium styling */}
        <div className="space-y-4 animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
          {[
            { title: "Smart Triage Queue", desc: "Auto-classify and prioritize by urgency & impact" },
            { title: "Sprint Board", desc: "Drag-and-drop sprint planning with real-time updates" },
            { title: "Interrupt Tracking", desc: "Monitor unplanned work with actionable insights" },
          ].map((feat, i) => (
            <div key={feat.title} className="flex items-start gap-3 group hover:opacity-90 transition-opacity duration-300 cursor-pointer" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm" style={{ background: "#fa520f" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: "#fffaeb" }}>{feat.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,250,235,0.5)" }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mistral block gradient accent */}
        <div className="flex gap-1 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
          {["#ffd900", "#ffa110", "#ff8105", "#fb6424", "#fa520f"].map((c) => (
            <div key={c} className="h-1 flex-1 rounded-sm transition-opacity duration-300" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative text-xs" style={{ color: "rgba(255,250,235,0.35)" }}>
        © {new Date().getFullYear()} Helix · by Hrone Studio
      </div>
    </div>
  );
}
