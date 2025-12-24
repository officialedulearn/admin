"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await loginAction(formData);
      
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      
      if (result?.success) {
        window.location.href = "/";
        return;
      }
      
      setError("Login failed. Please try again.");
      setLoading(false);
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      
      if (errorMessage.includes('NEXT_REDIRECT') || err?.digest === 'NEXT_REDIRECT') {
        window.location.href = "/";
        return;
      }
      
      console.error("Login error:", err);
      setError(`An unexpected error occurred: ${errorMessage}`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00FF80]/10 border border-[#00FF80]/20 mb-4">
            <Lock className="w-8 h-8 text-[#00FF80]" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            EduLearn Admin
          </h1>
          <p className="text-muted-foreground">
            Enter your password to access the admin panel
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-foreground mb-2"
              >
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF80] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Authorized access only</p>
        </div>
      </div>
    </div>
  );
}

