"use client";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui";

export default function ScheduledReports(){
  return(
    <div className="space-y-6">
      <PageHeader title="Scheduled Reports" subtitle="Automate report delivery to your email"
        action={<button className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Schedule Report</button>}/>
      <div className="rounded-2xl border p-8 text-center" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
        <div className="text-5xl mb-4">📅</div>
        <p className="text-slate-400 font-bold">No scheduled reports yet</p>
        <p className="text-slate-600 text-sm mt-1">Create a scheduled report to receive automated emails</p>
        <button className="btn-primary px-4 py-2.5 text-sm mt-4">Schedule Your First Report</button>
      </div>
    </div>
  );
}
