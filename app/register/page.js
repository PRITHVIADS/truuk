"use client";
import{useState}from"react";import{useRouter}from"next/navigation";import{Eye,EyeOff,CheckCircle}from"lucide-react";
export default function RegisterPage(){
  const router=useRouter();
  const[step,setStep]=useState(1);
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState("");
  const[showPass,setShowPass]=useState(false);
  const[plan,setPlan]=useState("trial");
  const[form,setForm]=useState({orgName:"",name:"",email:"",password:"",phone:"",website:""});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const validateEmail=(email)=>{
    const re=/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if(!re.test(email))return"Please enter a valid email address";
    const blocked=["test.com","example.com","tempmail.com","mailinator.com","guerrillamail.com","throwaway.email","yopmail.com","sharklasers.com","guerrillamailblock.com","spam4.me","trashmail.com","fakeinbox.com"];
    const domain=email.split("@")[1]?.toLowerCase();
    if(blocked.includes(domain))return"Please use a valid business or personal email";
    return null;
  };
  const handleSubmit=async()=>{
    if(!form.orgName){setError("Organization name required");return;}
    if(!form.name){setError("Your name required");return;}
    if(!form.email){setError("Email required");return;}
    if(!form.password||form.password.length<8){setError("Password min 8 characters");return;}
    setSaving(true);setError("");
    const r=await fetch("/api/organizations/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,plan})});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error creating account");setSaving(false);return;}
    router.push("/register/success");
  };
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  const PLANS=[
    {id:"trial",name:"Free Trial",price:"₹0",duration:"14 days",desc:"Try Truuk free, no credit card needed"},
    {id:"starter",name:"Starter",price:"₹1,500+GST",duration:"per month",desc:"For small affiliate networks"},
    {id:"growth",name:"Growth",price:"₹5,000+GST",duration:"per month",desc:"For growing networks"},
  ];
  return(
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"#080c14"}}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-lg">T</div>
            <span className="text-white font-black text-xl">Truuk</span>
          </a>
          <h1 className="text-2xl font-black text-white mb-2">Start your affiliate network</h1>
          <p className="text-slate-400 text-sm">Create your account and manage campaigns, publishers and conversions</p>
        </div>

        <div className="rounded-2xl border p-6 space-y-5" style={card}>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2">
            {[1,2].map(s=>(
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step>=s?"bg-orange-500 text-white":"bg-white/10 text-slate-500"}`}>{step>s?<CheckCircle size={14}/>:s}</div>
                {s<2&&<div className={`flex-1 h-0.5 w-16 rounded ${step>s?"bg-orange-500":"bg-white/10"}`}/>}
                <span className={`text-xs font-semibold ${step>=s?"text-white":"text-slate-500"}`}>{s===1?"Your Details":"Choose Plan"}</span>
              </div>
            ))}
          </div>

          {step===1&&<>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Organization / Network Name <span className="text-red-400">*</span></label><input value={form.orgName} onChange={e=>f("orgName",e.target.value)} className="input w-full" placeholder="e.g. Acme Affiliate Network"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Your Full Name <span className="text-red-400">*</span></label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input w-full" placeholder="Your name"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Email Address <span className="text-red-400">*</span></label><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input w-full" placeholder="you@yournetwork.com"/></div>
            <div>
              <label className="text-sm text-slate-300 font-semibold block mb-1.5">Password <span className="text-red-400">*</span></label>
              <div className="relative"><input type={showPass?"text":"password"} value={form.password} onChange={e=>f("password",e.target.value)} className="input w-full pr-10" placeholder="Min. 8 characters"/><button type="button" onClick={()=>setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showPass?<EyeOff size={14}/>:<Eye size={14}/>}</button></div>
            </div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Phone <span className="text-xs text-slate-500">(Optional)</span></label><input value={form.phone} onChange={e=>f("phone",e.target.value)} className="input w-full" placeholder="+91 98765 43210"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Website <span className="text-xs text-slate-500">(Optional)</span></label><input value={form.website} onChange={e=>f("website",e.target.value)} className="input w-full" placeholder="https://yournetwork.com"/></div>
            {error&&<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
            <button onClick={()=>{if(!form.orgName||!form.name||!form.email||!form.password){setError("Please fill all required fields");return;}
              const emailErr=validateEmail(form.email);
              if(emailErr){setError(emailErr);return;}
              if(form.password.length<8){setError("Password min 8 characters");return;}
              setError("");setStep(2);}} className="btn-primary w-full py-3 text-sm font-bold">Next: Choose Plan →</button>
          </>}

          {step===2&&<>
            <div className="space-y-3">
              {PLANS.map(p=>(
                <button key={p.id} onClick={()=>setPlan(p.id)} type="button"
                  className={`w-full p-4 rounded-xl border text-left transition-all ${plan===p.id?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5 hover:border-white/20"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${plan===p.id?"border-orange-500":"border-slate-600"}`}>{plan===p.id&&<div className="w-2 h-2 rounded-full bg-orange-500"/>}</div>
                      <span className={`font-bold text-sm ${plan===p.id?"text-orange-400":"text-white"}`}>{p.name}</span>
                      {p.id==="trial"&&<span className="text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">Recommended</span>}
                    </div>
                    <div className="text-right"><p className={`font-black text-sm ${plan===p.id?"text-orange-400":"text-white"}`}>{p.price}</p><p className="text-xs text-slate-500">{p.duration}</p></div>
                  </div>
                  <p className="text-xs text-slate-500 pl-6">{p.desc}</p>
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs text-blue-400">🎉 <strong>Beta pricing</strong> — prices locked in for early adopters. Start with free trial, upgrade anytime.</p>
            </div>
            {error&&<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
            <div className="flex gap-3">
              <button onClick={()=>setStep(1)} className="btn-ghost px-4 py-3 text-sm">← Back</button>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 py-3 text-sm font-bold">{saving?"Creating account…":"Create Account →"}</button>
            </div>
          </>}
        </div>

        <p className="text-center text-slate-500 text-sm mt-4">Already have an account? <a href="/login" className="text-orange-400 font-semibold hover:text-orange-300">Sign in</a></p>
        <p className="text-center text-slate-600 text-xs mt-2">By signing up you agree to our Terms of Service. Your account requires admin approval.</p>
      </div>
    </div>
  );
}
