"use client";
import{useState}from"react";import{useRouter}from"next/navigation";import{Eye,EyeOff,CheckCircle,ArrowRight,Megaphone,Users}from"lucide-react";
export default function SignupPage(){
  const router=useRouter();
  const[role,setRole]=useState(null);
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState("");
  const[showPass,setShowPass]=useState(false);
  const[form,setForm]=useState({name:"",email:"",password:"",company:"",phone:"",website:"",paymentMethod:"Bank Transfer"});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSubmit=async()=>{
    if(!form.name){setError("Full name is required");return;}
    if(!form.email){setError("Email is required");return;}
    if(!form.password||form.password.length<8){setError("Password must be at least 8 characters");return;}
    setSaving(true);setError("");
    const r=await fetch(role==="advertiser"?"/api/auth/signup/advertiser":"/api/auth/signup/publisher",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,role})});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    router.push(`/signup/success?role=${role}&email=${form.email}`);
  };
  if(!role)return(
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"#080c14"}}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white">T</div>
          <h1 className="text-3xl font-black text-white mb-2">Join Truuk</h1>
          <p className="text-slate-400">The performance affiliate marketing platform</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[{role:"advertiser",icon:"📢",title:"I'm an Advertiser",desc:"Promote my products and pay publishers for results",color:"blue",points:["Create performance campaigns","Pay only for results","Access publisher network","Real-time tracking"]},{role:"affiliate",icon:"💰",title:"I'm a Publisher",desc:"Promote campaigns and earn commissions on every conversion",color:"green",points:["Browse & join campaigns","Earn on every conversion","Real-time earnings dashboard","Unique tracking links"]}].map(opt=>(
            <button key={opt.role} onClick={()=>setRole(opt.role)} className="p-6 rounded-2xl border text-left hover:scale-[1.02] transition-all group" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${opt.color==="blue"?"bg-blue-500/15":"bg-green-500/15"}`}>{opt.icon}</div>
              <h2 className="text-white font-black text-lg mb-1">{opt.title}</h2>
              <p className="text-slate-500 text-sm mb-4">{opt.desc}</p>
              <div className="space-y-1.5">{opt.points.map(p=><div key={p} className="flex items-center gap-2"><CheckCircle size={13} className={opt.color==="blue"?"text-blue-400":"text-green-400"}/><span className="text-xs text-slate-400">{p}</span></div>)}</div>
              <div className={`mt-5 flex items-center gap-2 text-sm font-bold ${opt.color==="blue"?"text-blue-400":"text-green-400"}`}>Get started <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/></div>
            </button>
          ))}
        </div>
        <p className="text-center text-slate-500 text-sm mt-6">Already have an account? <a href="/login" className="text-orange-400 font-semibold">Sign in</a></p>
      </div>
    </div>
  );
  const isAdv=role==="advertiser";
  return(
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"#080c14"}}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-4 text-xl font-black text-white">T</div>
          <h1 className="text-2xl font-black text-white">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">{isAdv?"Advertiser — promote your business":"Publisher — earn from promotions"}</p>
          <button onClick={()=>setRole(null)} className="text-xs text-slate-600 hover:text-slate-400 mt-1 underline">← Change account type</button>
        </div>
        <div className="rounded-2xl border p-6 space-y-4" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
          <div className={`flex items-center gap-2 p-3 rounded-xl ${isAdv?"bg-blue-500/10 border border-blue-500/20":"bg-green-500/10 border border-green-500/20"}`}>
            {isAdv?<Megaphone size={15} className="text-blue-400"/>:<Users size={15} className="text-green-400"/>}
            <span className={`text-xs font-bold ${isAdv?"text-blue-400":"text-green-400"}`}>{isAdv?"Advertiser Account":"Publisher Account"}</span>
            <span className="text-xs text-slate-500 ml-auto">Pending approval after signup</span>
          </div>
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Full Name <span className="text-red-400">*</span></label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input w-full" placeholder="Your full name"/></div>
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Email Address <span className="text-red-400">*</span></label><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input w-full" placeholder="you@example.com"/></div>
          <div>
            <label className="text-sm text-slate-300 font-semibold block mb-1.5">Password <span className="text-red-400">*</span></label>
            <div className="relative"><input type={showPass?"text":"password"} value={form.password} onChange={e=>f("password",e.target.value)} className="input w-full pr-10" placeholder="Min. 8 characters"/><button type="button" onClick={()=>setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showPass?<EyeOff size={15}/>:<Eye size={15}/>}</button></div>
            {form.password&&<div className="flex gap-1 mt-1.5 items-center">{[1,2,3,4].map(i=><div key={i} className={`h-1 flex-1 rounded-full ${form.password.length>=i*3?(i<=1?"bg-red-500":i<=2?"bg-amber-500":i<=3?"bg-yellow-500":"bg-green-500"):"bg-white/10"}`}/>)<span className="text-xs text-slate-500 ml-1">{form.password.length<4?"Weak":form.password.length<8?"Fair":form.password.length<12?"Good":"Strong"}</span></div>}
          </div>
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Company <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><input value={form.company} onChange={e=>f("company",e.target.value)} className="input w-full" placeholder={isAdv?"Your company or brand":"Your website or media company"}/></div>
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Phone <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><input value={form.phone} onChange={e=>f("phone",e.target.value)} className="input w-full" placeholder="+91 98765 43210"/></div>
          {!isAdv&&<div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Preferred Payment</label><div className="grid grid-cols-2 gap-2">{["Bank Transfer","UPI","PayPal","Crypto"].map(m=><button key={m} onClick={()=>f("paymentMethod",m)} type="button" className={`py-2 rounded-xl border text-xs font-semibold transition-all ${form.paymentMethod===m?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{m==="Bank Transfer"?"🏦":m==="UPI"?"📱":m==="PayPal"?"💳":"🪙"} {m}</button>)}</div></div>}
          {error&&<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <button onClick={handleSubmit} disabled={saving} className="btn-primary w-full py-3 text-sm font-bold disabled:opacity-50">{saving?"Creating account…":"Create Account →"}</button>
          <p className="text-xs text-slate-500 text-center">Your account will be reviewed before activation.</p>
        </div>
        <p className="text-center text-slate-500 text-sm mt-4">Already have an account? <a href="/login" className="text-orange-400 font-semibold">Sign in</a></p>
      </div>
    </div>
  );
}
