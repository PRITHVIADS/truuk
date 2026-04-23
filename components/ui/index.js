export function Badge({ status }) {
  const m = {
    Active:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Paused:"bg-amber-500/15 text-amber-400 border-amber-500/30",
    Draft:"bg-slate-500/15 text-slate-400 border-slate-500/30",
    Archived:"bg-slate-700/30 text-slate-500 border-slate-600/30",
    Inactive:"bg-red-500/15 text-red-400 border-red-500/30",
    Pending:"bg-blue-500/15 text-blue-400 border-blue-500/30",
    Paid:"bg-green-500/15 text-green-400 border-green-500/30",
    Approved:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Rejected:"bg-red-500/15 text-red-400 border-red-500/30",
    Processing:"bg-purple-500/15 text-purple-400 border-purple-500/30",
    Public:"bg-green-500/15 text-green-400 border-green-500/30",
    Private:"bg-slate-500/15 text-slate-400 border-slate-500/30",
    "Approval Required":"bg-amber-500/15 text-amber-400 border-amber-500/30",
  };
  return <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-semibold ${m[status]||"bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>{status}</span>;
}

export function StatCard({ label, value, sub, color="#f97316", icon:Icon, trend }) {
  return (
    <div className="rounded-2xl border p-5 hover:bg-white/5 transition-all" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{label}</p>
        {Icon && <Icon size={16} className="text-slate-600"/>}
      </div>
      <p className="text-3xl font-black" style={{color}}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
      {trend && <p className={`text-xs mt-1.5 font-semibold ${trend>0?"text-green-400":"text-red-400"}`}>{trend>0?"↑":"↓"} {Math.abs(trend)}% vs last week</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-black text-white">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className="" }) {
  return (
    <div className={`rounded-2xl border ${className}`} style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
      {children}
    </div>
  );
}

export function Modal({ title, children, onClose, size="md" }) {
  const w={sm:"max-w-sm",md:"max-w-lg",lg:"max-w-2xl",xl:"max-w-4xl"}[size];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)"}}>
      <div className={`rounded-2xl border w-full ${w} max-h-[90vh] flex flex-col animate-slide-up`} style={{background:"rgba(9,14,27,0.99)",borderColor:"rgba(255,255,255,0.07)"}}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <h2 className="text-white font-black text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(opt=>(
        <button key={opt} onClick={()=>onChange(opt)}
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${value===opt?"bg-orange-500 text-white":"bg-white/5 text-slate-400 hover:text-white"}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4 opacity-30">{icon}</div>
      <p className="text-slate-400 font-bold text-lg">{title}</p>
      {subtitle && <p className="text-slate-600 text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner() {
  return <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"/>;
}

export function DataTable({ headers, rows, loading, empty }) {
  if (loading) return <div className="flex justify-center py-20"><Spinner/></div>;
  if (!rows?.length) return empty || <EmptyState icon="📭" title="No data found"/>;
  return (
    <div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-white/5">
            {headers.map(h=><th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  );
}
