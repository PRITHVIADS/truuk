"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PageHeader, Spinner } from "@/components/ui";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import DateRangePicker from "@/components/ui/DateRangePicker";

const TT = { background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, color:"#fff", fontSize:12 };
const today = new Date().toISOString().split("T")[0];
const ago = (d) => { const x = new Date(); x.setDate(x.getDate()-d); return x.toISOString().split("T")[0]; };

export default function DailyReport() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dr, setDr] = useState({ from: ago(30), to: today });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/daily?from=${dr.from}&to=${dr.to}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [dr]);

  const rows = data?.rows || [];
  const totals = data?.totals || {};
  const fmt = (n) => n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${(n||0).toFixed(0)}`;
  const card = { background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" };
  const chartData = [...rows].reverse();

  return (
    <div className="space-y-5">
      <PageHeader title="Daily Report" subtitle="Day by day performance breakdown"
        action={<div className="flex gap-2">
          <DateRangePicker from={dr.from} to={dr.to} onChange={setDr}/>
          <button onClick={()=>window.open(`/api/reports/export?type=daily&from=${dr.from}&to=${dr.to}`,"_blank")} className="btn-ghost px-3 py-2 text-xs flex items-center gap-1"><Download size={12}/>Export CSV</button>
        </div>}/>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[["Clicks", totals.clicks||0, "#3b82f6"], ["Unique", totals.uniqueClicks||0, "#06b6d4"], ["Conv.", totals.conversions||0, "#10b981"], ["CR%", (totals.cr||"0")+"%", "#a855f7"], ["Revenue", fmt(totals.revenue||0), "#f97316"]].map(([l,v,c]) => (
          <div key={l} className="rounded-2xl border p-4" style={card}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p>
            <p className="text-2xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner/></div> : <>
        {/* Chart */}
        <div className="rounded-2xl border p-5" style={card}>
          <p className="text-sm font-bold text-slate-300 mb-4">Performance Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={d=>d.slice(5)}/>
              <YAxis tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={TT}/>
              <Area type="monotone" dataKey="clicks" stroke="#3b82f6" fill="url(#gc)" strokeWidth={2} dot={false} name="Clicks"/>
              <Area type="monotone" dataKey="conversions" stroke="#10b981" fill="url(#gg)" strokeWidth={2} dot={false} name="Conversions"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        {rows.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={card}><div className="text-5xl mb-4 opacity-30">📅</div><p className="text-slate-400 font-bold">No data in this period</p></div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={card}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}>
                  {["Date","Clicks","Unique Clicks","Conversions","CR%",role!=="affiliate"&&"Revenue"].filter(Boolean).map(h=>(
                    <th key={h} className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {/* Totals row */}
                  <tr className="border-b border-orange-500/20 bg-orange-500/5">
                    <td className="py-3 px-4 text-orange-400 font-black">TOTAL</td>
                    <td className="py-3 px-4 font-black text-white">{totals.clicks||0}</td>
                    <td className="py-3 px-4 font-black text-white">{totals.uniqueClicks||0}</td>
                    <td className="py-3 px-4 font-black text-white">{totals.conversions||0}</td>
                    <td className="py-3 px-4 font-black text-purple-400">{totals.cr||"0"}%</td>
                    {role!=="affiliate"&&<td className="py-3 px-4 font-black text-orange-400">{fmt(totals.revenue||0)}</td>}
                  </tr>
                  {rows.map((row, i) => {
                    const prev = rows[i + 1];
                    const clickDiff = prev ? row.clicks - prev.clicks : 0;
                    return (
                      <tr key={row.date} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <p className="text-white font-semibold">{new Date(row.date).toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short"})}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className="text-white font-semibold">{row.clicks}</span>
                            {clickDiff !== 0 && <span className={`text-xs ${clickDiff > 0 ? "text-green-400" : "text-red-400"}`}>{clickDiff > 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{row.uniqueClicks}</td>
                        <td className="py-3 px-4 text-green-400 font-semibold">{row.conversions}</td>
                        <td className="py-3 px-4"><span className={`font-bold ${+row.cr>5?"text-green-400":+row.cr>2?"text-amber-400":"text-slate-400"}`}>{row.cr}%</span></td>
                        {role!=="affiliate"&&<td className="py-3 px-4 text-orange-400 font-semibold">{row.revenue>0?fmt(row.revenue):"—"}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>}
    </div>
  );
}
