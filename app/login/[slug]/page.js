"use client";
import{useState,useEffect}from"react";import{useRouter,useParams}from"next/navigation";import{signIn}from"next-auth/react";import{Eye,EyeOff}from"lucide-react";
export default function OrgLoginPage(){
  const router=useRouter();const{slug}=useParams();
  const[org,setOrg]=useState(null);const[loading,setLoading]=useState(true);
  const[form,setForm]=useState({email:"",password:""});const[showPass,setShowPass]=useState(false);const[error,setError]=useState("");const[signing,setSigning]=useState(false);
  useEffect(()=>{fetch(`/api/organizations/by-slug/${slug}`).then(r=>r.json()).then(d=>{if(d.org)setOrg(d.org);else setOrg(null);setLoading(false);}).catch(()=>setLoading(false));},[slug]);
  const handleLogin=async()=>{
    if(!form.email||!form.password){setError("Email and password required");return;}
    setSigning(true);setError("");
    const res=await signIn("credentials",{email:form.email,password:form.password,redirect:false});
    if(res?.error){setError(res.error==="PENDING"?"Your account is pending approval.":res.error==="REJECTED"?"Account rejected.":"Invalid email or password");setSigning(false);return;}
    router.push("/dashboard");
  };
  if(loading)return<div className="min-h-screen flex items-center justify-center" style={{background:"#080c14"}}><div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"/></div>;
  if(!org)return(
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"#080c14"}}>
      <div className="text-center"><div className="text-5xl mb-4">🔍</div><h1 className="text-white font-black text-xl mb-2">Network not found</h1><p className="text-slate-500 text-sm mb-4">The network <strong className="text-white">"{slug}"</strong> doesn't exist.</p><a href="/login" className="text-orange-400 text-sm hover:underline">← Back to main login</a></div>
    </div>
  );
  return(
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{background:"#080c14"}}>
      <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(249,115,22,0.08) 0%,transparent 70%)"}}/>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">{org.name[0].toUpperCase()}</div>
          <h1 className="text-2xl font-black text-white mb-1">{org.name}</h1>
          <p className="text-slate-500 text-sm">Sign in to your affiliate dashboard</p>
          <div className="flex items-center justify-center gap-2 mt-2"><span className="text-xs text-slate-600">Powered by</span><span className="text-xs font-bold text-orange-400">Truuk</span></div>
        </div>
        <div className="rounded-2xl border p-6 space-y-4" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Email</label><input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} className="input w-full" placeholder="you@example.com" autoFocus/></div>
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Password</label>
            <div className="relative"><input type={showPass?"text":"password"} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} className="input w-full pr-10" placeholder="Your password"/><button type="button" onClick={()=>setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showPass?<EyeOff size={15}/>:<Eye size={15}/>}</button></div>
          </div>
          {error&&<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <button onClick={handleLogin} disabled={signing} className="btn-primary w-full py-3 text-sm font-bold disabled:opacity-50">{signing?"Signing in…":"Sign In →"}</button>
        </div>
        <div className="text-center mt-4 space-y-1">
          <p className="text-slate-600 text-xs">Your login URL: <code className="text-orange-400">/login/{slug}</code></p>
          <a href="/login" className="text-slate-600 text-xs hover:text-slate-400 underline block">Sign in with different network</a>
        </div>
      </div>
    </div>
  );
}
