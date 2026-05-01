"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Megaphone, Users, BarChart2, Wallet, Settings,
  LogOut, Zap, X, Menu, ChevronDown, ChevronRight, Store, Bell,
  UserCheck, Shield, Link2, Cpu, FileText, TrendingUp, Target,
  Image, Tag, Star, Layers, Globe, Repeat, AlertTriangle,
  TestTube, Network, Code, Calendar, Download, SendHorizonal
} from "lucide-react";

const ADMIN_NAV = [
  { label:"Dashboard", href:"/dashboard", icon:LayoutDashboard },
  { label:"Campaigns", icon:Megaphone, children:[
    { label:"Manage Campaigns", href:"/campaigns/manage" },
    { label:"Create Campaign", href:"/campaigns/create" },
    { label:"Campaign Wizard", href:"/campaigns/wizard" },
    { label:"Campaign Access", href:"/campaigns/access" },
    { label:"Traffic Channels", href:"/campaigns/traffic" },
    { label:"Creatives", href:"/campaigns/creatives" },
    { label:"Coupon Codes", href:"/campaigns/coupons" },
    { label:"Featured Campaigns", href:"/campaigns/featured" },
    { label:"Bulk Targeting", href:"/campaigns/targeting" },
    { label:"Campaign Settings", href:"/campaigns/settings" },
    { label:"Referrer Settings", href:"/campaigns/referrer" },
  ]},
  { label:"Publishers", icon:Users, children:[
    { label:"Manage", href:"/publishers/manage" },
    { label:"PostBack / Pixels", href:"/publishers/postback" },
  ]},
  { label:"Advertisers", icon:UserCheck, children:[
    { label:"Manage", href:"/advertisers/manage" },
    { label:"Postback Hits", href:"/advertisers/postbacks" },
  ]},
  { label:"Reports", icon:BarChart2, children:[
    { label:"Campaigns Report", href:"/reports/campaigns" },
    { label:"Publishers Report", href:"/reports/publishers" },
    { label:"Advertisers Report", href:"/reports/advertisers" },
    { label:"Daily Report", href:"/reports/daily" },
    { label:"Click Report", href:"/reports/clicks" },
    { label:"Conversion Report", href:"/reports/conversions" },
    { label:"Postback Sent Logs", href:"/reports/postback-logs" },
    { label:"Referrer / Domain", href:"/reports/referrers" },
    { label:"Daily Report", href:"/reports/daily" },
    { label:"Scheduled Reports", href:"/reports/scheduled" },
  ]},
  { label:"Invoices", icon:FileText, children:[
    { label:"Dashboard", href:"/invoices/dashboard" },
    { label:"Publishers", href:"/invoices/publishers" },
    { label:"Advertisers", href:"/invoices/advertisers" },
    { label:"Settings", href:"/invoices/settings" },
  ]},
  { label:"Automation", icon:Cpu, children:[
    { label:"Anti-Fraud Tools", href:"/automation/fraud" },
    { label:"Link Test Tools", href:"/automation/link-test" },
    { label:"Smart Link", href:"/automation/smart-link" },
    { label:"API", href:"/automation/api" },
  ]},
  { label:"Team Members", href:"/team", icon:Users },
  { label:"Settings", href:"/settings", icon:Settings },
];

const ADVERTISER_NAV = [
  { label:"Dashboard", href:"/dashboard", icon:LayoutDashboard },
  { label:"My Campaigns", icon:Megaphone, children:[
    { label:"Manage Campaigns", href:"/campaigns/manage" },
    { label:"Create Campaign", href:"/campaigns/create" },
    { label:"Creatives", href:"/campaigns/creatives" },
  ]},
  { label:"Join Requests", href:"/requests", icon:Bell },
  { label:"Reports", icon:BarChart2, children:[
    { label:"Campaigns Report", href:"/reports/campaigns" },
    { label:"Click Report", href:"/reports/clicks" },
    { label:"Conversion Report", href:"/reports/conversions" },
  ]},
  { label:"Invoices", href:"/invoices/dashboard", icon:FileText },
  { label:"Team Members", href:"/team", icon:Users },
  { label:"Settings", href:"/settings", icon:Settings },
];

const AFFILIATE_NAV = [
  { label:"Dashboard", href:"/dashboard", icon:LayoutDashboard },
  { label:"Marketplace", href:"/marketplace", icon:Store },
  { label:"My Stats", icon:BarChart2, children:[
    { label:"Click Report", href:"/reports/clicks" },
    { label:"Conversion Report", href:"/reports/conversions" },
    { label:"Daily Report", href:"/reports/daily" },
  ]},
  { label:"Payouts", href:"/payouts", icon:Wallet },
  { label:"Team Members", href:"/team", icon:Users },
  { label:"Settings", href:"/settings", icon:Settings },
];

function NavItem({ item, depth=0 }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => item.children?.some(c => pathname.startsWith(c.href)));

  if (item.children) {
    const isActive = item.children.some(c => pathname.startsWith(c.href));
    return (
      <div>
        <button onClick={() => setOpen(p=>!p)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? "text-orange-400 bg-orange-500/10" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
          {item.icon && <item.icon size={17} className="flex-shrink-0"/>}
          <span className="flex-1 text-left">{item.label}</span>
          {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
        </button>
        {open && (
          <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/5 pl-3">
            {item.children.map(child => (
              <Link key={child.href} href={child.href}
                className={`block px-3 py-2 rounded-lg text-xs font-semibold transition-all ${pathname===child.href || pathname.startsWith(child.href) ? "text-orange-400 bg-orange-500/10" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const active = pathname === item.href;
  return (
    <Link href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? "bg-orange-500/15 text-orange-400" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
      {item.icon && <item.icon size={17}/>}
      {item.label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"/>}
    </Link>
  );
}

export function Sidebar({ open, setOpen }) {
  const { data: session } = useSession();
  const role = session?.user?.role || "admin";
  const NAV = role==="admin" ? ADMIN_NAV : role==="advertiser" ? ADVERTISER_NAV : AFFILIATE_NAV;
  const roleColors = { admin:"from-orange-500 to-red-500", advertiser:"from-blue-500 to-purple-600", affiliate:"from-green-500 to-teal-600" };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={()=>setOpen(false)}/>}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 md:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}
        style={{ background:"#090e1b", borderRight:"1px solid rgba(255,255,255,0.05)" }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap size={18} className="text-white"/>
            </div>
            <div>
              <p className="text-white font-black text-base">Truuk</p>
              <p className="text-white/50 text-xs capitalize">{role} panel</p>
            </div>
          </div>
          <button onClick={()=>setOpen(false)} className="md:hidden text-slate-500 hover:text-white"><X size={18}/></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item,i) => <NavItem key={i} item={item}/>)}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[role]} flex items-center justify-center text-xs text-white font-black flex-shrink-0`}>
              {session?.user?.name?.[0]||"A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{session?.user?.name}</p>
              <p className="text-white/50 text-xs capitalize">{role}</p>
            </div>
            <button onClick={()=>signOut({callbackUrl:"/login"})} className="text-white/50 hover:text-red-400 transition-colors"><LogOut size={15}/></button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileHeader({ setOpen }) {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center gap-4 px-4 py-3.5 border-b border-white/5"
      style={{ background:"rgba(8,12,20,0.95)", backdropFilter:"blur(12px)" }}>
      <button onClick={()=>setOpen(true)} className="text-slate-400 hover:text-white"><Menu size={20}/></button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center"><Zap size={14} className="text-white"/></div>
        <span className="text-white font-black text-sm">Truuk</span>
      </div>
    </header>
  );
}
