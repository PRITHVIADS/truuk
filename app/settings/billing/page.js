"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader, Spinner } from "@/components/ui";
import { CheckCircle, Zap, TrendingUp } from "lucide-react";

const PLANS = [
  { id:"starter", name:"Starter", price:1500, gst:270, total:1770, clicks:"10 Lakh", badge:"", color:"blue", features:["Unlimited campaigns","Unlimited publishers","Unlimited advertisers","All reports + CSV export","Pixel & tag manager","API access","Email support"] },
  { id:"growth", name:"Growth", price:5000, gst:900, total:5900, clicks:"1 Crore", badge:"Most Popular", color:"orange", features:["Everything in Starter","10x more clicks","Priority support","Advanced analytics","White label (coming soon)","Dedicated account manager"] },
];

export default function Billing() {
  const { data: session } = useSession();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    fetch("/api/subscriptions/current").then(r => r.json()).then(d => { setSub(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planId) => {
    setPaying(planId);
    try {
      // Create Razorpay order
      const r = await fetch("/api/subscriptions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const order = await r.json();
      if (!r.ok) { alert(order.error); setPaying(null); return; }

      if (order.demo) {
        // Demo mode — simulate payment
        if (confirm(`Demo: Simulate payment of ₹${order.totalAmount / 100} for ${planId} plan?`)) {
          const verifyR = await fetch("/api/subscriptions/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ razorpayOrderId: order.orderId, razorpayPaymentId: "pay_demo_" + Date.now(), razorpaySignature: "demo", plan: planId, demo: true }),
          });
          const vd = await verifyR.json();
          if (vd.success) { alert("✅ Plan activated!"); window.location.reload(); }
        }
        setPaying(null);
        return;
      }

      // Load Razorpay
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: "INR",
          order_id: order.orderId,
          name: "Truuk",
          description: `${order.planName} Plan — ₹${order.amountINR} + ₹${order.gstAmount} GST`,
          image: "https://truuk.prithviads.com/logo.png",
          prefill: { name: session?.user?.name, email: session?.user?.email },
          theme: { color: "#f97316" },
          handler: async (response) => {
            const verifyR = await fetch("/api/subscriptions/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, plan: planId }),
            });
            const vd = await verifyR.json();
            if (vd.success) { window.location.reload(); }
            else alert("Payment verification failed. Contact support.");
            setPaying(null);
          },
          modal: { ondismiss: () => setPaying(null) },
        });
        rzp.open();
      };
    } catch (err) {
      alert("Error: " + err.message);
      setPaying(null);
    }
  };

  const card = { background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" };
  const daysLeft = sub?.endDate ? Math.max(0, Math.ceil((new Date(sub.endDate) - new Date()) / (1000*60*60*24))) : 0;
  const PLAN_LIMITS = { trial:50000, starter:1000000, growth:10000000, enterprise:999999999 };
  const clickPct = sub ? Math.min(100, ((sub.org?.clicksThisMonth||0) / (PLAN_LIMITS[sub.plan]||50000)) * 100) : 0;

  if (loading) return <div className="flex justify-center py-20"><Spinner/></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Billing & Subscription" subtitle="Manage your Truuk subscription plan"/>

      {/* Current plan */}
      <div className="rounded-2xl border p-5" style={card}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Current Plan</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-white capitalize">{sub?.plan || "Trial"}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${sub?.status === "active" ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}`}>
                {sub?.status === "active" ? "● Active" : "⚠ Inactive"}
              </span>
              <span className="text-xs text-slate-500 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold">BETA</span>
            </div>
            <p className="text-slate-500 text-sm mt-1">{daysLeft} days remaining · Expires {sub?.endDate ? new Date(sub.endDate).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" }) : "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Clicks This Month</p>
            <p className="text-xl font-black text-white">{(sub?.org?.clicksThisMonth||0).toLocaleString("en-IN")}</p>
            <div className="w-32 h-1.5 bg-white/5 rounded-full mt-2"><div className="h-1.5 rounded-full bg-orange-500" style={{ width: `${clickPct}%` }}/></div>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PLANS.map(plan => {
          const isCurrent = sub?.plan === plan.id;
          return (
            <div key={plan.id} className={`rounded-2xl border p-6 relative transition-all ${isCurrent ? "border-orange-500/40 bg-orange-500/5" : "hover:bg-white/[0.02]"}`} style={isCurrent ? {} : card}>
              {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</div>}
              {isCurrent && <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">✓ Current</div>}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1"><span className="text-orange-400 text-lg">₹</span><span className="text-4xl font-black text-white">{plan.price.toLocaleString("en-IN")}</span><span className="text-slate-500 text-sm">/mo</span></div>
                  <p className="text-xs text-slate-600 mt-0.5">+ ₹{plan.gst} GST = ₹{plan.total.toLocaleString("en-IN")} total</p>
                </div>
                <div className="text-right"><div className="text-xs text-slate-500">Clicks</div><div className="text-lg font-black text-orange-400">{plan.clicks}</div><div className="text-xs text-slate-600">per month</div></div>
              </div>
              <ul className="space-y-2 mb-5">
                {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-slate-400"><CheckCircle size={13} className="text-orange-400 flex-shrink-0"/>{f}</li>)}
              </ul>
              <button onClick={() => !isCurrent && handleUpgrade(plan.id)} disabled={isCurrent || paying === plan.id}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${isCurrent ? "bg-white/5 text-slate-500 cursor-default" : paying === plan.id ? "bg-orange-500/50 text-white cursor-wait" : "bg-orange-500 hover:bg-orange-400 text-white"}`}>
                {isCurrent ? "Current Plan" : paying === plan.id ? "Processing…" : `Upgrade to ${plan.name} →`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Enterprise */}
      <div className="rounded-2xl border p-5 flex items-center justify-between gap-4 flex-wrap" style={card}>
        <div className="flex items-center gap-3"><Zap size={20} className="text-purple-400"/><div><p className="text-white font-bold">Enterprise Plan</p><p className="text-slate-500 text-sm">Unlimited clicks · Custom pricing · White label · Dedicated support</p></div></div>
        <a href="mailto:hello@truuk.in" className="btn-ghost px-4 py-2.5 text-sm whitespace-nowrap">Contact Sales →</a>
      </div>

      <p className="text-xs text-slate-600 text-center">Beta pricing — locked in for early adopters. Prices may change after beta. All prices in INR + 18% GST.</p>
    </div>
  );
}
