"use client";
import{useState}from"react";
import{useSession}from"next-auth/react";
import{useRouter}from"next/navigation";
import{useEffect}from"react";
import{Sidebar,MobileHeader}from"@/components/layout/Sidebar";
import ImpersonationBanner from"@/components/ImpersonationBanner";

export default function DashboardLayout({children}){
  const{data:session,status}=useSession();
  const router=useRouter();
  const[open,setOpen]=useState(false);
  useEffect(()=>{
    if(status==="unauthenticated")router.push("/login");
  },[status,router]);
  if(status==="loading")return<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"/></div>;
  if(status==="unauthenticated")return null;
  return(
    <div className="min-h-screen flex">
      <Sidebar open={open} setOpen={setOpen}/>
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <MobileHeader setOpen={setOpen}/>
        <main className="flex-1 p-4 md:p-6">
          <ImpersonationBanner/>
          {children}
        </main>
      </div>
    </div>
  );
}
