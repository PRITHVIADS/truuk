"use client";
import{useEffect,useState}from"react";import{useSession}from"next-auth/react";import{PageHeader,Spinner}from"@/components/ui";import{Save,Eye,EyeOff,User,Lock,CreditCard,Globe,Key}from"lucide-react";
export default function Settings(){
  const{data:session}=useSession();const role=session?.user?.role;
  const[data,setData]=useState(null);const[loading,setLoading]=useState(true);const[tab,setTab]=useState("profile");
  const[saving,setSaving]=useState(false);const[saved,setSaved]=useState("");const[error,setError]=useState("");
  const[showPass,setShowPass]=useState(false);const[showNewPass,setShowNewPass]=useState(false);
  const[name,setName]=useState("");const[company,setCompany]=useState("");const[phone,setPhone]=useState("");const[website,setWebsite]=useState("");const[postbackUrl,setPostbackUrl]=useState("");const[paymentMethod,setPaymentMethod]=useState("Bank Transfer");
  const[currentPassword,setCurrentPassword]=useState("");const[newPassword,setNewPassword]=useState("");const[confirmPassword,setConfirmPassword]=useState("");
  const load=async()=>{setLoading(true);const r=await fetch("/api/settings");const d=await r.json();setData(d);const u=d.user||{};setName(u.name||"");setCompany(u.company||"");setPhone(u.phone||"");setWebsite(u.website||"");setPostbackUrl(u.postbackUrl||"");setPaymentMethod(u.paymentMethod||"Bank Transfer");setLoading(false);};
  useEffect(()=>{load();},[]);
  const saveProfile=async()=>{setSaving(true);setError("");setSaved("");const r=await fetch("/api/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,company,phone,website,postbackUrl,paymentMethod})});const d=await r.json();if(!r.ok){setError(d.error||"Error");setSaving(false);return;}setSaved("profile");setSaving(false);setTimeout(()=>setSaved(""),3000);};
  const savePassword=async()=>{if(newPassword!==confirmPassword){setError("Passwords don't match");return;}if(newPassword.length<8){setError("Min 8 characters");return;}setSaving(true);setError("");const r=await fetch("/api/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword,newPassword})});const d=await r.json();if(!r.ok){setError(d.error||"Error");setSaving(false);return;}setSaved("password");setSaving(false);setCurrentPassword("");setNewPassword("");setConfirmPassword("");setTimeout(()=>setSaved(""),3000);};
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  const u=data?.user||{};
  const TABS=[{id:"profile",label:"Profile",icon:User},{id:"password",label:"Password",icon:Lock},role==="affiliate"&&{id:"payment",label:"Payment",icon:CreditCard},role==="affiliate"&&{id:"postback",label:"Postback",icon:Globe}].filter(Boolean);
  if(loading)return<div className="flex justify-center py-20"><Spinner/></div>;
  return(
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your account settings"/>
      <div className="rounded-2xl border p-5" style={card}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-2xl font-black">{u.name?.[0]||"?"}</div>
          <div><p className="text-white font-black text-lg">{u.name}</p><p className="text-slate-400 text-sm">{u.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full capitalize">{role}</span>
              {(u.shortId||u.publisherId)&&<code className="text-xs text-slate-500 font-mono">{u.shortId||u.publisherId||u.referralCode}</code>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.status==="Active"?"bg-green-500/15 text-green-400 border border-green-500/30":"bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>{u.status}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setError("");setSaved("");}} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===t.id?"bg-orange-500 text-white":"bg-white/5 text-slate-400 hover:text-white"}`}><t.icon size={14}/>{t.label}</button>)}
        <a href="/api-keys" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 text-slate-400 hover:text-white"><Key size={14}/>API Keys</a>
      </div>
      {error&&<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
      {saved&&<div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">✓ {saved==="profile"?"Profile updated!":"Password changed!"}</div>}
      {tab==="profile"&&<div className="rounded-2xl border p-6 space-y-4" style={card}>
        <p className="text-white font-black">Profile Information</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Full Name</label><input value={name} onChange={e=>setName(e.target.value)} className="input w-full"/></div>
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Company</label><input value={company} onChange={e=>setCompany(e.target.value)} className="input w-full" placeholder="Optional"/></div>
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} className="input w-full"/></div>
          <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Website</label><input value={website} onChange={e=>setWebsite(e.target.value)} className="input w-full" placeholder="https://"/></div>
        </div>
        <div className="pt-2 border-t border-white/5"><label className="text-sm text-slate-400 block mb-1">Email</label><p className="text-slate-300 text-sm">{u.email} <span className="text-slate-600 text-xs ml-2">(cannot be changed)</span></p></div>
        <button onClick={saveProfile} disabled={saving} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold ${saved==="profile"?"bg-green-500 text-white":"btn-primary"} disabled:opacity-50`}><Save size={14}/>{saving?"Saving…":saved==="profile"?"✓ Saved!":"Save Profile"}</button>
      </div>}
      {tab==="password"&&<div className="rounded-2xl border p-6 space-y-4" style={card}>
        <p className="text-white font-black">Change Password</p>
        <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Current Password</label><div className="relative"><input type={showPass?"text":"password"} value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="input w-full pr-10" placeholder="Current password"/><button type="button" onClick={()=>setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{showPass?<EyeOff size={14}/>:<Eye size={14}/>}</button></div></div>
        <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">New Password</label><div className="relative"><input type={showNewPass?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="input w-full pr-10" placeholder="Min. 8 characters"/><button type="button" onClick={()=>setShowNewPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{showNewPass?<EyeOff size={14}/>:<Eye size={14}/>}</button></div>{newPassword&&<div className="flex gap-1 mt-1.5 items-center">{[1,2,3,4].map(i=><div key={i} className={`h-1 flex-1 rounded-full ${newPassword.length>=i*3?(i<=1?"bg-red-500":i<=2?"bg-amber-500":i<=3?"bg-yellow-500":"bg-green-500"):"bg-white/10"}`}/>)}<span className="text-xs text-slate-500 ml-1">{newPassword.length<4?"Weak":newPassword.length<8?"Fair":newPassword.length<12?"Good":"Strong"}</span></div>}</div>
        <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Confirm Password</label><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className={`input w-full ${confirmPassword&&newPassword!==confirmPassword?"border-red-500/50":""}`} placeholder="Repeat new password"/>{confirmPassword&&newPassword!==confirmPassword&&<p className="text-red-400 text-xs mt-1">Passwords don't match</p>}</div>
        <button onClick={savePassword} disabled={saving||!currentPassword||!newPassword||newPassword!==confirmPassword} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold ${saved==="password"?"bg-green-500 text-white":"btn-primary"} disabled:opacity-50`}><Lock size={14}/>{saving?"Saving…":saved==="password"?"✓ Changed!":"Change Password"}</button>
      </div>}
      {tab==="payment"&&role==="affiliate"&&<div className="rounded-2xl border p-6 space-y-4" style={card}>
        <p className="text-white font-black">Payment Preferences</p>
        <div className="grid grid-cols-2 gap-2">{[["Bank Transfer","🏦"],["UPI","📱"],["PayPal","💳"],["Crypto","🪙"]].map(([m,icon])=><button key={m} onClick={()=>setPaymentMethod(m)} type="button" className={`py-3 rounded-xl border text-sm font-semibold transition-all ${paymentMethod===m?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{icon} {m}</button>)}</div>
        <button onClick={saveProfile} disabled={saving} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold ${saved==="profile"?"bg-green-500 text-white":"btn-primary"} disabled:opacity-50`}><Save size={14}/>{saving?"Saving…":"Save Payment"}</button>
      </div>}
      {tab==="postback"&&role==="affiliate"&&<div className="rounded-2xl border p-6 space-y-4" style={card}>
        <p className="text-white font-black">Server Postback URL</p>
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20"><p className="text-xs text-blue-400 font-semibold mb-1">📬 How it works</p><p className="text-xs text-slate-400">Truuk fires this URL on every conversion. Use macros: <code className="text-orange-400">{"{txn_id}"}</code> <code className="text-orange-400">{"{payout}"}</code> <code className="text-orange-400">{"{click_id}"}</code></p></div>
        <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Postback URL</label><input value={postbackUrl} onChange={e=>setPostbackUrl(e.target.value)} className="input w-full" placeholder="https://tracker.platform.com/postback?txid={txn_id}&payout={payout}"/></div>
        <button onClick={saveProfile} disabled={saving} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold ${saved==="profile"?"bg-green-500 text-white":"btn-primary"} disabled:opacity-50`}><Save size={14}/>{saving?"Saving…":"Save Postback"}</button>
      </div>}
    </div>
  );
}
