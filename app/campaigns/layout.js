"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar, MobileHeader } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"/>
    </div>
  );
  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sideOpen} setOpen={setSideOpen}/>
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <MobileHeader setOpen={setSideOpen}/>
        <div className="hidden md:flex items-center justify-end px-6 py-2 border-b border-white/5"
          style={{ background:"rgba(8,12,20,0.8)", backdropFilter:"blur(8px)" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"/>
            <span className="text-xs text-green-400 font-semibold">LIVE</span>
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
