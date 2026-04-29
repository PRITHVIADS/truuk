"use client";
import{useEffect}from"react";

const ACCENT_COLORS={orange:"#f97316",blue:"#3b82f6",green:"#10b981",purple:"#a855f7",pink:"#ec4899",red:"#ef4444",yellow:"#f59e0b",cyan:"#06b6d4"};
const THEME_BG={dark:"#06080f",midnight:"#000000",navy:"#0a0e1a",forest:"#0a0f0a",purple:"#0d0a1a",rose:"#140a0a"};
const FONTS={default:"'DM Sans', sans-serif",inter:"'Inter', sans-serif",mono:"'JetBrains Mono', monospace",rounded:"'Nunito', sans-serif"};

export default function ThemeProvider({children}){
  useEffect(()=>{
    const apply=()=>{
      try{
        const stored=localStorage.getItem("truuk_prefs");
        if(!stored)return;
        const prefs=JSON.parse(stored);
        const root=document.documentElement;
        const body=document.body;

        // 1. Accent color
        if(prefs.accent&&ACCENT_COLORS[prefs.accent]){
          root.style.setProperty("--accent",ACCENT_COLORS[prefs.accent]);
          root.style.setProperty("--accent-color",ACCENT_COLORS[prefs.accent]);
        }

        // 2. Theme background
        if(prefs.theme&&THEME_BG[prefs.theme]){
          body.style.background=THEME_BG[prefs.theme];
          root.style.setProperty("--bg",THEME_BG[prefs.theme]);
        }

        // 3. Font
        if(prefs.font&&FONTS[prefs.font]){
          body.style.fontFamily=FONTS[prefs.font];
        }

        // 4. Border radius
        const radii={sharp:"0px",slight:"6px",rounded:"14px",pill:"999px"};
        if(prefs.borderRadius&&radii[prefs.borderRadius]){
          root.style.setProperty("--radius",radii[prefs.borderRadius]);
        }

        // 5. Animations
        if(prefs.showAnimations===false){
          root.style.setProperty("--transition","none");
          const style=document.getElementById("truuk-anim-style")||document.createElement("style");
          style.id="truuk-anim-style";
          style.innerHTML="*{transition:none!important;animation:none!important;}";
          document.head.appendChild(style);
        } else {
          const s=document.getElementById("truuk-anim-style");
          if(s)s.remove();
        }

        // 6. Compact tables
        const tableStyle=document.getElementById("truuk-table-style")||document.createElement("style");
        tableStyle.id="truuk-table-style";
        if(prefs.compactTables){
          tableStyle.innerHTML="td,th{padding-top:6px!important;padding-bottom:6px!important;}";
          document.head.appendChild(tableStyle);
        } else {
          tableStyle.innerHTML="";
        }

        // 7. Density
        const densityStyle=document.getElementById("truuk-density-style")||document.createElement("style");
        densityStyle.id="truuk-density-style";
        if(prefs.density==="compact"){
          densityStyle.innerHTML="section,main>.space-y-6{gap:12px!important;}.p-6{padding:16px!important;}.p-5{padding:14px!important;}.rounded-2xl{border-radius:10px!important;}";
        } else if(prefs.density==="comfortable"){
          densityStyle.innerHTML="section,main>.space-y-6{gap:32px!important;}.p-6{padding:28px!important;}.p-5{padding:24px!important;}";
        } else {
          densityStyle.innerHTML="";
        }
        document.head.appendChild(densityStyle);

        // 8. Colorful badges — if off, make all badges gray
        const badgeStyle=document.getElementById("truuk-badge-style")||document.createElement("style");
        badgeStyle.id="truuk-badge-style";
        if(prefs.colorfulBadges===false){
          badgeStyle.innerHTML=".text-green-400,.text-blue-400,.text-orange-400,.text-purple-400,.text-amber-400,.text-red-400{color:#94a3b8!important;}.bg-green-500\\/15,.bg-blue-500\\/15,.bg-orange-500\\/15,.bg-purple-500\\/15,.bg-amber-500\\/15,.bg-red-500\\/15{background:rgba(255,255,255,0.05)!important;}.border-green-500\\/30,.border-blue-500\\/30,.border-orange-500\\/30,.border-purple-500\\/30,.border-amber-500\\/30,.border-red-500\\/30{border-color:rgba(255,255,255,0.1)!important;}";
        } else {
          badgeStyle.innerHTML="";
        }
        document.head.appendChild(badgeStyle);

      }catch(e){console.error("Theme error:",e);}
    };

    apply();
    window.addEventListener("storage",apply);
    window.addEventListener("truuk-prefs-changed",apply);
    return()=>{window.removeEventListener("storage",apply);window.removeEventListener("truuk-prefs-changed",apply);};
  },[]);

  return children;
}
