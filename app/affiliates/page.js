"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, Copy } from "lucide-react";
import { Badge, StatCard, Modal, PageHeader, FilterTabs, EmptyState, Spinner } from "@/components/ui";
import { formatCurrency, formatNumber } from "@/lib/utils";

const METHODS = ["Bank Transfer","UPI","PayPal","Crypto","Cheque"];
const EMPTY = { name:"",email:"",phone:"",company:"",website:"",status:"Pending",paymentMethod:"Bank Transfer",postbackUrl:"",notes:"",paymentDetails:{accountName:"",accountNumber:"",ifscCode:"",upiId:"",paypalEmail:""} };

export default function AffiliatesPage() {
  const [affiliates,setAffiliates]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  const load=async()=>{
    setLoading(true);
    const params=new URLSearchParams();
    if(filter!=="All")params.set("status",filter);
    if(search)params.set("search",search);
    const r=await fetch(`/api/affiliates?${params}`);
    const d=await r.json();
    setAffiliates(d.affiliates||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[filter]);

  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const fp=(k,v)=>setForm(p=>({...p,paymentDetails:{...p.paymentDetails,[k]:v}}));

  const handleSave=async()=>{
    if(!form.name||!form.email){setError("Name and email required");return;}
    setSaving(true);setError("");
    const url=modal==="edit"?`/api/affiliates/${selected._id}`:"/api/affiliates";
    const r=await fetch(url,{method:modal==="edit"?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    await load();setModal(null);setSaving(false);
  };

  const handleDelete=async(id)=>{
    if(!confirm("Remove this affiliate?"))return;
    await fetch(`/api/affiliates/${id}`,{method:"DELETE"});
    await load();
  };

  const copyCode=(code)=>navigator.clipboard.writeText(code);

  const active=affiliates.filter(a=>a.status==="Active").length;
  const totalEarnings=affiliates.reduce((s,a)=>s+(a.totalEarnings||0),0);
  const totalConv=affiliates.reduce((s,a)=>s+(a.conversions||0),0);

  const filtered=affiliates.filter(a=>
    a.name.toLowerCase().includes(search.toLowerCase())||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliates" subtitle="Manage your publisher network"
        action={<button onClick={()=>{setForm(EMPTY);setError("");setModal("create");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Add Affiliate</button>}/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Affiliates" value={affiliates.length} sub={`${active} active`} color="#f97316"/>
        <StatCard label="Active" value={active} color="#10b981"/>
        <StatCard label="Total Conversions" value={formatNumber(totalConv)} color="#3b82f6"/>
        <StatCard label="Total Paid Out" value={formatCurrency(totalEarnings)} color="#a855f7"/>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <FilterTabs options={["All","Active","Pending","Inactive","Banned"]} value={filter} onChange={v=>{setFilter(v);}}/>
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);}} onKeyDown={e=>{if(e.key==="Enter")load();}} placeholder="Search name or email…" className="input pl-8 w-64 text-xs"/>
        </div>
      </div>

      {loading?<div className="flex justify-center py-20"><Spinner size={8}/></div>
      :filtered.length===0?<EmptyState icon="👥" title="No affiliates found" subtitle="Add your first affiliate publisher"
        action={<button onClick={()=>{setForm(EMPTY);setModal("create");}} className="btn-primary px-4 py-2 text-sm">Add Affiliate</button>}/>
      :<div className="space-y-3">
        {filtered.map(a=>(
          <div key={a._id} className="card p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {a.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{a.name}</p>
              <p className="text-slate-500 text-xs">{a.email}</p>
            </div>
            <div className="hidden md:flex gap-6 text-center">
              {[["Clicks",formatNumber(a.clicks||0)],["Conv.",formatNumber(a.conversions||0)],["Earnings",formatCurrency(a.totalEarnings||0)],["Method",a.paymentMethod||"—"]].map(([k,v])=>(
                <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-sm text-white font-semibold">{v}</p></div>
              ))}
            </div>
            {a.referralCode&&(
              <div className="hidden lg:flex items-center gap-1 bg-black/30 border border-white/5 px-2 py-1 rounded-lg">
                <code className="text-xs text-orange-400 font-mono">{a.referralCode}</code>
                <button onClick={()=>copyCode(a.referralCode)} className="text-slate-500 hover:text-white"><Copy size={12}/></button>
              </div>
            )}
            <Badge status={a.status}/>
            <div className="flex gap-1">
              <button onClick={()=>{setSelected(a);setModal("view");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Eye size={14}/></button>
              <button onClick={()=>{setForm({...a,paymentDetails:a.paymentDetails||{}});setSelected(a);setError("");setModal("edit");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Pencil size={14}/></button>
              <button onClick={()=>handleDelete(a._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>}

      {(modal==="create"||modal==="edit")&&(
        <Modal title={modal==="create"?"Add Affiliate":"Edit Affiliate"} onClose={()=>setModal(null)} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Full Name *</label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input" placeholder="Rahul Sharma"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Email *</label><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input" placeholder="rahul@example.com"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Phone</label><input value={form.phone} onChange={e=>f("phone",e.target.value)} className="input" placeholder="+91 98765 43210"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Company</label><input value={form.company} onChange={e=>f("company",e.target.value)} className="input" placeholder="Company name"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Status</label>
                <select value={form.status} onChange={e=>f("status",e.target.value)} className="select">
                  {["Pending","Active","Inactive","Banned"].map(s=><option key={s}>{s}</option>)}
                </select></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Payment Method</label>
                <select value={form.paymentMethod} onChange={e=>f("paymentMethod",e.target.value)} className="select">
                  {METHODS.map(m=><option key={m}>{m}</option>)}
                </select></div>
              <div className="sm:col-span-2"><label className="text-xs text-slate-400 font-semibold block mb-1.5">Website</label><input value={form.website} onChange={e=>f("website",e.target.value)} className="input" placeholder="https://affiliate.com"/></div>
              <div className="sm:col-span-2"><label className="text-xs text-slate-400 font-semibold block mb-1.5">Postback URL</label><input value={form.postbackUrl} onChange={e=>f("postbackUrl",e.target.value)} className="input" placeholder="https://tracker.aff.com/postback?txid={{TXID}}"/></div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">Payment Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {form.paymentMethod==="Bank Transfer"&&<>
                  <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Account Name</label><input value={form.paymentDetails?.accountName||""} onChange={e=>fp("accountName",e.target.value)} className="input"/></div>
                  <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Account Number</label><input value={form.paymentDetails?.accountNumber||""} onChange={e=>fp("accountNumber",e.target.value)} className="input"/></div>
                  <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">IFSC Code</label><input value={form.paymentDetails?.ifscCode||""} onChange={e=>fp("ifscCode",e.target.value)} className="input"/></div>
                </>}
                {form.paymentMethod==="UPI"&&<div><label className="text-xs text-slate-400 font-semibold block mb-1.5">UPI ID</label><input value={form.paymentDetails?.upiId||""} onChange={e=>fp("upiId",e.target.value)} className="input" placeholder="name@upi"/></div>}
                {form.paymentMethod==="PayPal"&&<div><label className="text-xs text-slate-400 font-semibold block mb-1.5">PayPal Email</label><input value={form.paymentDetails?.paypalEmail||""} onChange={e=>fp("paypalEmail",e.target.value)} className="input"/></div>}
              </div>
            </div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Notes</label><textarea value={form.notes} onChange={e=>f("notes",e.target.value)} className="input resize-none" rows={2}/></div>
          </div>
          {error&&<p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{saving?"Saving…":modal==="create"?"Add Affiliate":"Save Changes"}</button>
            <button onClick={()=>setModal(null)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </Modal>
      )}

      {modal==="view"&&selected&&(
        <Modal title={selected.name} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge status={selected.status}/>
              <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400">{selected.paymentMethod}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Email",selected.email],["Phone",selected.phone||"—"],["Company",selected.company||"—"],["Website",selected.website||"—"]].map(([k,v])=>(
                <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-sm text-white font-semibold break-all">{v}</p></div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["Clicks",formatNumber(selected.clicks||0),"#3b82f6"],["Conversions",formatNumber(selected.conversions||0),"#10b981"],["Earnings",formatCurrency(selected.totalEarnings||0),"#f97316"]].map(([l,v,c])=>(
                <div key={l} className="card p-3 text-center"><p className="text-xs text-slate-500 mb-1">{l}</p><p className="font-black text-lg" style={{color:c}}>{v}</p></div>
              ))}
            </div>
            {selected.referralCode&&(
              <div><p className="text-xs text-slate-500 mb-1.5">Referral Code</p>
                <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl px-3 py-2">
                  <code className="text-orange-400 font-mono text-sm flex-1">{selected.referralCode}</code>
                  <button onClick={()=>copyCode(selected.referralCode)} className="text-slate-500 hover:text-white"><Copy size={14}/></button>
                </div>
              </div>
            )}
            {selected.notes&&<div><p className="text-xs text-slate-500 mb-1">Notes</p><p className="text-sm text-slate-300">{selected.notes}</p></div>}
          </div>
        </Modal>
      )}
    </div>
  );
}
