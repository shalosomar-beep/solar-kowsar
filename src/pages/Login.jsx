import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail, Lock, Loader2, LogIn, UserPlus, Sun } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import About from "@/components/landing/About";
import Services from "@/components/landing/Services";
import HowItWorks from "@/components/landing/HowItWorks";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import SolarKowsarLogo from "@/components/SolarKowsarLogo";

const SOLAR_BG = "https://media.base44.com/images/public/6a59d873561dbe6df255f399/80b59ffac_image.png";

export default function Login() {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Fixed full-page solar background */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${SOLAR_BG})` }}
        aria-hidden
      />
      {/* Dark tinted overlay for the whole page */}
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/65 to-black/80"
        aria-hidden
      />

      {/* Hero */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Center content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <SolarKowsarLogo size={80} showText={false} className="mb-6" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
          Solar Kowsar
        </h1>
        <p className="mt-3 text-base sm:text-lg text-white/80 max-w-md drop-shadow">
          Solar energy management & rental platform
        </p>

        {/* Two prominent buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button
            onClick={() => setLoginOpen(true)}
            className="flex-1 h-14 text-base font-semibold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-900/30 rounded-xl"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Log In
          </Button>
          <Button
            onClick={() => navigate("/register")}
            className="flex-1 h-14 text-base font-semibold bg-white/95 hover:bg-white text-zinc-900 shadow-lg shadow-black/30 rounded-xl"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Sign Up
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-white/60 text-xs">
          <Sun className="w-3.5 h-3.5" />
          <span>Powered by solar intelligence</span>
        </div>
        </div>
      </section>

      {/* Landing sections */}
      <About />
      <Services />
      <HowItWorks />
      <Faq />
      <Footer />

      {/* Login modal */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <SolarKowsarLogo size={48} showText={false} />
            </div>
            <DialogTitle className="text-center text-2xl">Solar Kowsar</DialogTitle>
            <DialogDescription className="text-center">Log in to your account</DialogDescription>
          </DialogHeader>

          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium mb-4"
            onClick={handleGoogle}
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}