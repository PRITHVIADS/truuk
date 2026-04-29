"use client";
import{useEffect}from"react";

export default function ThemeProvider({children}){
  useEffect(()=>{
    const apply=()=>{
      try{
        const stored=localStorage.getItem("truuk_prefs");
        if(!stored)return;
        const prefs=JSON.parse(stored);

        const ACCENTS={orange:"249 115 22",blue:"59 130 246",green:"16 185 129",purple:"168 85 247",pink:"236 72 153",red:"239 68 68",yellow:"245 158 11",cyan:"6 182 212"};
        const THEMES={dark:"6 8 15",midnight:"0 0 0",navy:"10 14 26",forest:"10 15 10",purple:"13 10 26",rose:"20 10 10"};
        const RADII={sharp:"0px",slight:"6px",rounded:"14px",pill:"999px"};

        let css="";

        // Accent color overrides
        if(prefs.accent&&ACCENTS[prefs.accent]){
          const rgb=ACCENTS[prefs.accent];
          css+=`
            :root { --accent-rgb: ${rgb}; }
            .btn-primary, [class*="bg-orange-500"]:not([class*="bg-opacity"]) { background-color: rgb(${rgb}) !important; }
            .text-orange-400, .text-orange-500 { color: rgb(${rgb}) !important; }
            .border-orange-500 { border-color: rgb(${rgb}) !important; }
            .bg-orange-500\\/10, .bg-orange-500\\/15 { background-color: rgba(${rgb}, 0.1) !important; }
            .border-orange-500\\/30 { border-color: rgba(${rgb}, 0.3) !important; }
            a[href].text-orange-400 { color: rgb(${rgb}) !important; }
          `;
        }

        // Background
        if(prefs.theme&&THEMES[prefs.theme]){
          const rgb=THEMES[prefs.theme];
          css+=`body, .bg-\\[\\#080c14\\], .bg-\\[\\#06080f\\] { background-color: rgb(${rgb}) !important; }`;
        }

        // Border radius
        if(prefs.borderRadius&&RADII[prefs.borderRadius]){
          css+=`.rounded-2xl { border-radius: ${RADII[prefs.borderRadius]} !important; }
                .rounded-xl { border-radius: calc(${RADII[prefs.borderRadius]} * 0.7) !important; }`;
        }

        // Compact tables
        if(prefs.compactTables){
          css+=`td, th { padding-top: 6px !important; padding-bottom: 6px !important; }`;
        }

        // No animations
        if(prefs.showAnimations===false){
          css+=`*, *::before, *::after { transition: none !important; animation: none !important; }`;
        }

        // No colorful badges
        if(prefs.colorfulBadges===false){
          css+=`
            .text-green-400 { color: #94a3b8 !important; }
            .text-blue-400 { color: #94a3b8 !important; }
            .text-amber-400 { color: #94a3b8 !important; }
            .text-red-400 { color: #94a3b8 !important; }
            .text-purple-400 { color: #94a3b8 !important; }
            .bg-green-500\\/15, .bg-blue-500\\/15, .bg-amber-500\\/15, .bg-red-500\\/15, .bg-purple-500\\/15 { background: rgba(255,255,255,0.05) !important; }
            .border-green-500\\/30, .border-blue-500\\/30, .border-amber-500\\/30, .border-red-500\\/30, .border-purple-500\\/30 { border-color: rgba(255,255,255,0.1) !important; }
          `;
        }

        // Density
        if(prefs.density==="compact"){
          css+=`.p-6{padding:14px!important;}.p-5{padding:12px!important;}.space-y-6>*+*{margin-top:12px!important;}`;
        } else if(prefs.density==="comfortable"){
          css+=`.p-6{padding:32px!important;}.p-5{padding:28px!important;}.space-y-6>*+*{margin-top:32px!important;}`;
        }

        // Font
        const FONTS={default:"'DM Sans',sans-serif",inter:"'Inter',sans-serif",mono:"'JetBrains Mono',monospace",rounded:"'Nunito',sans-serif"};
        if(prefs.font&&FONTS[prefs.font]){
          css+=`body, p, span, div, button, input, textarea, select { font-family: ${FONTS[prefs.font]} !important; }`;
        }

        // Inject style
        let style=document.getElementById("truuk-theme");
        if(!style){style=document.createElement("style");style.id="truuk-theme";document.head.appendChild(style);}
        style.innerHTML=css;

      }catch(e){console.error("Theme:",e);}
    };

    apply();
    window.addEventListener("truuk-prefs-changed",apply);
    return()=>window.removeEventListener("truuk-prefs-changed",apply);
  },[]);

  return children;
}
