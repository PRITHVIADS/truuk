"use client";
import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle, Pencil, Trash2, Eye } from "lucide-react";
import { Badge, StatCard, Modal, PageHeader, FilterTabs, EmptyState, Spinner } from "@/components/ui";

const EMPTY = { name:"", email:"", password:"", role:"advertiser", company:"", phone:"", status:"Active" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter !== "All") params.set("role", roleFilter);
    if (filter !== "All") params.set("status", filter);
    const r = await fetch(`/api/admin/users?${params}`);
    const d = await r.json();
    setUsers(d.users || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter, roleFilter]);

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleApprove = async (id) => {
    await fetch(`/api/admin/users/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ status:"Active" }) });
    await load();
  };

  const handleReject = async (id) => {
    await fetch(`/api/admin/users/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ status:"Rejected" }) });
    await load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/admin/users/${id}`, { method:"DELETE" });
    await load();
  };

  const handleSave = async () => {
    if (!form.name || !form.email || (!selected && !form.password)) { setError("Fill all required fields"); return; }
    setSaving(true); setError("");
    const url = selected ? `/api/admin/users/${selected._id}` : "/api/admin/users";
    const method = selected ? "PATCH" : "POST";
    const body = { ...form };
    if (selected && !body.password) delete body.password;
    const r = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Error"); setSaving(false); return; }
    await load(); setModal(null); setSaving(false);
  };

  const pending = users.filter(u => u.status === "Pending").length;
  const active = users.filter(u => u.status === "Active").length;
  const advertisers = users.filter(u => u.role === "advertiser").length;
  const affiliates = users.filter(u => u.role === "affiliate").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Users & Approvals" subtitle="Manage advertisers, affiliates and approval requests"
        action={
          <div className="flex gap-2">
            {pending > 0 && <span className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold px-3 py-2 rounded-xl animate-pulse">{pending} pending approval</span>}
            <button onClick={()=>{setForm(EMPTY);setSelected(null);setError("");setModal("form");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Add User</button>
          </div>
        }/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={users.length} color="#f97316"/>
        <StatCard label="Pending Approval" value={pending} sub="Need review" color="#ef4444"/>
        <StatCard label="Advertisers" value={advertisers} color="#3b82f6"/>
        <StatCard label="Affiliates" value={affiliates} color="#10b981"/>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          <FilterTabs options={["All","advertiser","affiliate"]} value={roleFilter} onChange={setRoleFilter}/>
          <FilterTabs options={["All","Pending","Active","Rejected"]} value={filter} onChange={setFilter}/>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size={8}/></div>
      : users.length === 0 ? <EmptyState icon="👥" title="No users found"/>
      : <div className="card overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-white/5">
            {["User","Role","Company","Status","Joined","Actions"].map(h=>(
              <th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
            ))}</tr></thead>
          <tbody>{users.map(u=>(
            <tr key={u._id} className="table-row">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-xs text-white font-black flex-shrink-0">{u.name?.[0]||"?"}</div>
                  <div><p className="text-sm text-white font-semibold">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                </div>
              </td>
              <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${u.role==="advertiser"?"bg-blue-500/15 text-blue-400 border-blue-500/30":"bg-green-500/15 text-green-400 border-green-500/30"}`}>{u.role}</span></td>
              <td className="py-3 px-4 text-sm text-slate-300">{u.company||"—"}</td>
              <td className="py-3 px-4"><Badge status={u.status}/></td>
              <td className="py-3 px-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
              <td className="py-3 px-4">
                <div className="flex gap-1">
                  {u.status==="Pending"&&<>
                    <button onClick={()=>handleApprove(u._id)} className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg transition-all"><CheckCircle size={12}/>Approve</button>
                    <button onClick={()=>handleReject(u._id)} className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg transition-all"><XCircle size={12}/>Reject</button>
                  </>}
                  {u.status==="Active"&&<button onClick={()=>handleReject(u._id)} className="text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 px-2 py-1 rounded-lg transition-all">Deactivate</button>}
                  {u.status!=="Pending"&&<button onClick={()=>{setForm({name:u.name,email:u.email,password:"",role:u.role,company:u.company||"",phone:u.phone||"",status:u.status});setSelected(u);setError("");setModal("form");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Pencil size={14}/></button>}
                  <button onClick={()=>handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div></div>}

      {modal==="form" && (
        <Modal title={selected?"Edit User":"Add New User"} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Full Name *</label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input" placeholder="Full name"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Email *</label><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input" placeholder="email@example.com"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Password {selected?"(leave blank)":""} *</label><input type="password" value={form.password} onChange={e=>f("password",e.target.value)} className="input" placeholder="••••••••"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Role *</label>
                <select value={form.role} onChange={e=>f("role",e.target.value)} className="select">
                  <option value="advertiser">Advertiser</option>
                  <option value="affiliate">Affiliate</option>
                </select></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Company</label><input value={form.company} onChange={e=>f("company",e.target.value)} className="input" placeholder="Company name"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Phone</label><input value={form.phone} onChange={e=>f("phone",e.target.value)} className="input" placeholder="+91 …"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Status</label>
                <select value={form.status} onChange={e=>f("status",e.target.value)} className="select">
                  {["Active","Pending","Inactive"].map(s=><option key={s}>{s}</option>)}
                </select></div>
            </div>
            {error&&<p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 mt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{saving?"Saving…":selected?"Save Changes":"Create User"}</button>
              <button onClick={()=>setModal(null)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
