"use client";
import{CheckCircle}from"lucide-react";
export default function RegisterSuccess(){
  return(
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"#080c14"}}>
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-5"><CheckCircle size={32} className="text-green-400"/></div>
        <h1 className="text-2xl font-black text-white mb-2">You are registered! 🎉</h1>
        <p className="text-slate-400 mb-6">Your affiliate network account has been created and is pending review. We will activate it within 24 hours.</p>
        <div className="rounded-2xl border p-5 mb-6 text-left space-y-4" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center"><CheckCircle size={14} className="text-green-400"/></div><div><p className="text-white text-sm font-semibold">Account created</p><p className="text-slate-500 text-xs">Check your email for confirmation</p></div></div>
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center"><span className="text-amber-400 text-xs font-bold">2</span></div><div><p className="text-white text-sm font-semibold">Pending admin review</p><p className="text-slate-500 text-xs">Usually within 24 hours</p></div></div>
          <div className="flex items-center gap-3 opacity-40"><div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center"><span className="text-blue-400 text-xs font-bold">3</span></div><div><p className="text-white text-sm font-semibold">Account activated</p><p className="text-slate-500 text-xs">You will receive an email to login</p></div></div>
        </div>
        <a href="/login" className="btn-primary px-6 py-3 text-sm inline-block">Go to Login</a>
      </div>
    </div>
  );
}
// v2
