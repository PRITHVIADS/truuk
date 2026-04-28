"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";

const ERROR_MSGS = {
  PENDING: "Your account is pending admin approval. Please wait.",
  REJECTED: "Your account has been rejected. Contact support.",
  INACTIVE: "Your account is inactive. Contact admin.",
  CredentialsSignin: "Invalid email or password.",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { ...form, redirect: false });
    if (res?.error) { setError(ERROR_MSGS[res.error] || ERROR_MSGS.CredentialsSignin); setLoading(false); }
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center page-glow relative" style={{background:"#080c14"}}>
      <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249,115,22,0.1) 0%, transparent 65%)"}}/>
      <div className="relative w-full max-w-sm px-4">
        <div className="card p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
              <Zap size={24} className="text-white"/>
            </div>
            <h1 className="text-2xl font-black text-white">Truuk</h1>
            <p className="text-slate-500 text-sm mt-1">Performance Marketing Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Email Address</label>
              <input type="email" required value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="you@example.com" className="input"/></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" className="input"/></div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
<p style={{textAlign:"center",marginTop:"16px",fontSize:"13px",color:"#475569"}}>New network? <a href="/register" style={{color:"#f97316",fontWeight:"600"}}>Create account →</a></p>

          <p className="text-center text-xs text-slate-500 mt-5">
            New here? <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-semibold">Create an account</Link>
          </p>
          <p className="text-center text-xs text-slate-700 mt-6">© 2024 Truuk · All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
