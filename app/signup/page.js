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
          <h1 className="text-2xl font-black text-white">Create your
cat > app/signup/success/page.js << 'ENDOFFILE'
"use client";
import{useSearchParams}from"next/navigation";import{CheckCircle}from"lucide-react";
export default function SignupSuccess(){
  const params=useSearchParams();const role=params.get("role");const email=params.get("email");
  return(
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"#080c14"}}>
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-5"><CheckCircle size={32} className="text-green-400"/></div>
        <h1 className="text-2xl font-black text-white mb-2">Account Created! 🎉</h1>
        <p className="text-slate-400 mb-6">Your {role} account has been submitted. An admin will review and activate it shortly.</p>
        <div className="rounded-2xl border p-5 mb-6 text-left space-y-3" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center"><CheckCircle size={14} className="text-green-400"/></div><div><p className="text-white text-sm font-semibold">Account registered</p><p className="text-slate-500 text-xs">{email}</p></div></div>
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center"><span className="text-amber-400 text-xs font-bold">2</span></div><div><p className="text-white text-sm font-semibold">Pending admin review</p><p className="text-slate-500 text-xs">Usually within 24 hours</p></div></div>
          <div className="flex items-center gap-3 opacity-40"><div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center"><span className="text-blue-400 text-xs font-bold">3</span></div><div><p className="text-white text-sm font-semibold">Account activated</p><p className="text-slate-500 text-xs">You can then login</p></div></div>
        </div>
        <a href="/login" className="btn-primary px-6 py-3 text-sm inline-block">Go to Login →</a>
      </div>
    </div>
  );
}
