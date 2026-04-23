"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Building2, Users } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ name:"", email:"", password:"", company:"", phone:"", website:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) { setError("Please select your role"); return; }
    setLoading(true); setError("");
    const r = await fetch("/api/auth/signup", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, role}) });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Signup failed"); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#080c14"}}>
      <div className="card p-8 max-w-md w-full text-center animate-slide-up">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-white mb-2">Account Created!</h2>
        <p className="text-slate-400 mb-6">Your account is pending admin approval. You'll be able to login once approved. This usually takes a few hours.</p>
        <Link href="/login" className="btn-primary px-6 py-3 text-sm inline-block">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center page-glow relative py-10" style={{background:"#080c14"}}>
      <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249,115,22,0.1) 0%, transparent 65%)"}}/>
      <div className="relative w-full max-w-lg px-4">
        <div className="card p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
              <Zap size={22} className="text-white"/>
            </div>
            <h1 className="text-2xl font-black text-white">Join Truuk</h1>
            <p className="text-slate-500 text-sm mt-1">Create your account to get started</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value:"advertiser", icon:Building2, title:"Advertiser", desc:"I want to run campaigns and drive conversions" },
                { value:"affiliate", icon:Users, title:"Affiliate / Publisher", desc:"I want to promote campaigns and earn commissions" },
              ].map(({value,icon:Icon,title,desc}) => (
                <button key={value} onClick={()=>setRole(value)}
                  className={`p-4 rounded-xl border text-left transition-all ${role===value ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/5 hover:bg-white/8"}`}>
                  <Icon size={20} className={role===value?"text-orange-400":"text-slate-400"} />
                  <p className={`font-bold text-sm mt-2 ${role===value?"text-orange-400":"text-white"}`}>{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e=>f("name",e.target.value)} required className="input" placeholder="Your name"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e=>f("email",e.target.value)} required className="input" placeholder="you@email.com"/></div>
            </div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Password * (min 6 chars)</label>
              <input type="password" value={form.password} onChange={e=>f("password",e.target.value)} required className="input" placeholder="••••••••"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Company / Brand</label>
                <input value={form.company} onChange={e=>f("company",e.target.value)} className="input" placeholder="Company name"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Phone</label>
                <input value={form.phone} onChange={e=>f("phone",e.target.value)} className="input" placeholder="+91 …"/></div>
            </div>
            {role==="affiliate" && (
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Website / Social Profile</label>
                <input value={form.website} onChange={e=>f("website",e.target.value)} className="input" placeholder="https://yoursite.com"/></div>
            )}

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-sm">{error}</div>}

            <button type="submit" disabled={loading||!role} className="btn-primary w-full py-3 text-sm disabled:opacity-50 mt-2">
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-5">
            Already have an account? <Link href="/login" className="text-orange-400 hover:text-orange-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
