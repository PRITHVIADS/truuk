"use client";
import{useEffect,useState}from"react";import{PageHeader,Spinner}from"@/components/ui";import{Plus,Trash2,Copy,Check,Code,Eye,EyeOff}from"lucide-react";
const PIXEL_TYPES=[{id:"google_tag",label:"Google Tag (gtag.js)",icon:"🔴",desc:"Google Ads & Analytics conversion tracking"},{id:"gtm",label:"Google Tag Manager",icon:"🔵",desc:"Fire GTM dataLayer events on conversion"},{id:"facebook",label:"Facebook / Meta Pixel",icon:"🟦",desc:"Track conversions in Facebook Ads Manager"},{id:"tiktok",label:"TikTok Pixel",icon:"⬛",desc:"Track conversions in TikTok Ads"},{id:"snapchat",label:"Snapchat Pixel",icon:"🟡",desc:"Track conversions in Snapchat Ads"},{id:"custom",label:"Custom HTML/Script",icon:"💻",desc:"Inject any custom JavaScript on conversion"},{id:"postback",label:"Server Postback URL",icon:"📬",desc:"Fire a server-to-server GET request on conversion"}];
const EMPTY={name:"",type:"google_tag",campaignId:"",googleTagId:"",gtmId:"",googleEventName:"conversion",facebookPixelId:"",facebookEventName:"Purchase",tiktokPixelId:"",tiktokEventName:"CompletePayment",snapchatPixelId:"",customUrl:"",includeValue:true,includeCurrency:true};
function getCode(pixel){
  const cid=pixel.campaignId?.shortId||"CAMP_ID";
  if(pixel.type==="google_tag")return`<!-- Google Tag - ${cid} -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${pixel.googleTagId}"></script>\n<script>\n  window.dataLayer=window.dataLayer||[];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js',new Date());\n  gtag('config','${pixel.googleTagId}');\n</script>\n\n<!-- Place on CONVERSION PAGE only -->\n<script>\n  gtag('event','${pixel.googleEventName||"conversion"}',{\n    'send_to':'${pixel.googleTagId}',\n    ${pixel.includeValue?"'value':'{{SALE_AMOUNT}}',\n    ":""}'currency':'INR',\n    'transaction_id':'{{TXN_ID}}'\n  });\n</script>`;
  if(pixel.type==="gtm")return`<!-- GTM - ${cid} -->\n<!-- In <head> -->\n<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${pixel.gtmId}');</script>\n\n<!-- On CONVERSION PAGE -->\n<script>\n  dataLayer.push({\n    'event':'truuk_conversion',\n    'campaign_id':'${cid}',\n    ${pixel.includeValue?"'value':'{{SALE_AMOUNT}}',\n    ":""}'transaction_id':'{{TXN_ID}}'\n  });\n</script>`;
  if(pixel.type==="facebook")return`<!-- Facebook Pixel - ${cid} -->\n<!-- In <head> of ALL pages -->\n<script>\n!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');\nfbq('init','${pixel.facebookPixelId}');\nfbq('track','PageView');\n</script>\n\n<!-- On CONVERSION PAGE only -->\n<script>\n  fbq('track','${pixel.facebookEventName||"Purchase"}',{\n    ${pixel.includeValue?"value:'{{SALE_AMOUNT}}',\n    ":""}'currency':'INR',\n    order_id:'{{TXN_ID}}'\n  });\n</script>`;
  if(pixel.type==="tiktok")return`<!-- TikTok Pixel - ${cid} -->\n<script>\n!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify"];ttq.load=function(e){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq.load(e);var o=d.createElement("script");o.async=!0;o.src=i+"?sdkid="+e;d.head.appendChild(o)};ttq.load('${pixel.tiktokPixelId}');ttq.page();}(window,document,'ttq');\n</script>\n\n<!-- On CONVERSION PAGE -->\n<script>\n  ttq.track('${pixel.tiktokEventName||"CompletePayment"}',{\n    ${pixel.includeValue?"value:'{{SALE_AMOUNT}}',\n    ":""}'currency':'INR',\n    order_id:'{{TXN_ID}}'\n  });\n</script>`;
  if(pixel.type==="custom")return`<!-- Custom Script - ${cid} -->\n<script>\n${pixel.customUrl||"// Your custom JS here\n// Variables: {{TXN_ID}}, {{SALE_AMOUNT}}, {{PAYOUT}}, {{CAMPAIGN_ID}}"}\n</script>`;
  if(pixel.type==="postback")return`<!-- Server Postback - ${cid} -->\n<!-- Fire this GET request from your server on conversion -->\n${pixel.customUrl||"https://your-endpoint.com/conversion"}?txn_id={{TXN_ID}}&amount={{SALE_AMOUNT}}&camp=${cid}\n\n<!-- OR from browser -->\n<script>\n  fetch('${pixel.customUrl||"https://your-endpoint.com"}?txn_id={{TXN_ID}}&amount={{SALE_AMOUNT}}')\n    .then(()=>console.log('Fired'));\n</script>`;
  return"// Configure pixel to generate code";
}
export default function PixelsPage(){
  const[data,setData]=useState(null);const[loading,setLoading]=useState(true);const[modal,setModal]=useState(false);const[saving,setSaving]=useState(false);const[error,setError]=useState("");const[form,setForm]=useState(EMPTY);const[copied,setCopied]=useState("");const[codeOpen,setCodeOpen]=useState({});
  const load=async()=>{setLoading(true);const r=await fetch("/api/pixels");const d=await r.json();setData(d);setLoading(false);};
  useEffect(()=>{load();},[]);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleCreate=async()=>{if(!form.name){setError("Name required");return;}setSaving(true);setError("");const r=await fetch("/api/pixels",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok){setError(d.error||"Error");setSaving(false);return;}setModal(false);setForm(EMPTY);setSaving(false);await load();};
  const handleDelete=async(id)=>{if(!confirm("Delete?"))return;await fetch(`/api/pixels?id=${id}`,{method:"DELETE"});await load();};
  const handleToggle=async(id,isActive)=>{await fetch("/api/pixels",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,isActive:!isActive})});await load();};
  const copy=(text,key)=>{navigator.clipboard.writeText(text);setCopied(key);setTimeout(()=>setCopied(""),2000);};
  const pixels=data?.pixels||[];const campaigns=data?.campaigns||[];
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  return(
    <div className="space-y-6">
      <PageHeader title="Pixels & Tags" subtitle="Create tracking pixels for client websites — fire conversions to Google, Facebook, TikTok and more"
        action={<button onClick={()=>setModal(true)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Add Pixel</button>}/>
      <div className="rounded-2xl border p-5" style={card}>
        <p className="text-sm font-bold text-white mb-3">⚡ How it works</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[["1. Create Pixel","Set up Google Tag, GTM, Facebook etc.","🔧"],["2. Get Code","Copy the generated code snippet","📋"],["3. Client Installs","Client places code on their thank-you page","🌐"],["4. Auto-fires","Pixel fires on every conversion","🚀"]].map(([t,d,i])=>(
            <div key={t} className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-xl mb-2">{i}</div><p className="text-white text-xs font-bold mb-1">{t}</p><p className="text-slate-500 text-xs">{d}</p></div>
          ))}
        </div>
      </div>
      {loading?<div className="flex justify-center py-20"><Spinner/></div>:pixels.length===0?(
        <div className="rounded-2xl border p-12 text-center" style={card}><div className="text-5xl mb-4">📡</div><p className="text-slate-400 font-bold mb-1">No pixels yet</p><p className="text-slate-600 text-sm mb-4">Add your first tracking pixel</p><button onClick={()=>setModal(true)} className="btn-primary px-4 py-2 text-sm">Add Pixel</button></div>
      ):<div className="space-y-4">{pixels.map(pixel=>{
        const ptype=PIXEL_TYPES.find(t=>t.id===pixel.type);const code=getCode(pixel);const isOpen=codeOpen[pixel._id];
        return(<div key={pixel._id} className={`rounded-2xl border overflow-hidden ${pixel.isActive?"":"opacity-60"}`} style={card}>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-2xl">{ptype?.icon||"📡"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1"><p className="text-white font-black">{pixel.name}</p><span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${pixel.isActive?"bg-green-500/15 text-green-400 border-green-500/30":"bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>{pixel.isActive?"Active":"Inactive"}</span></div>
                  <p className="text-slate-400 text-xs mb-2">{ptype?.label} · {pixel.campaignId?.name||"All campaigns"}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {pixel.googleTagId&&<code className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-mono">{pixel.googleTagId}</code>}
                    {pixel.gtmId&&<code className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono">{pixel.gtmId}</code>}
                    {pixel.facebookPixelId&&<code className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono">{pixel.facebookPixelId}</code>}
                    {pixel.tiktokPixelId&&<code className="text-slate-300 bg-white/5 px-2 py-0.5 rounded font-mono">{pixel.tiktokPixelId}</code>}
                    <span className="text-slate-500">Fired: {pixel.fired||0}×</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={()=>setCodeOpen(p=>({...p,[pixel._id]:!isOpen}))} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isOpen?"bg-orange-500 text-white":"bg-white/5 text-slate-400 hover:text-white"}`}><Code size={12}/>{isOpen?"Hide":"Get Code"}</button>
                <button onClick={()=>handleToggle(pixel._id,pixel.isActive)} className={`p-1.5 rounded-lg ${pixel.isActive?"bg-amber-500/10 text-amber-400":"bg-green-500/10 text-green-400"}`}>{pixel.isActive?<EyeOff size={14}/>:<Eye size={14}/>}</button>
                <button onClick={()=>handleDelete(pixel._id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
          {isOpen&&<div className="border-t border-white/5" style={{background:"rgba(0,0,0,0.4)"}}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <p className="text-xs font-bold text-slate-400">📋 INSTALLATION CODE</p>
              <button onClick={()=>copy(code,pixel._id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${copied===pixel._id?"bg-green-500 text-white":"bg-white/10 text-slate-300"}`}>{copied===pixel._id?<><Check size={12}/>Copied!</>:<><Copy size={12}/>Copy</>}</button>
            </div>
            <div className="p-5 overflow-x-auto"><pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">{code}</pre></div>
            <div className="px-5 py-3 border-t border-white/5"><p className="text-xs text-slate-500">Replace <code className="text-orange-400">{"{{TXN_ID}}"}</code> and <code className="text-orange-400">{"{{SALE_AMOUNT}}"}</code> with actual values from your order system.</p></div>
          </div>}
        </div>);
      })}</div>}
      {modal&&<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.8)"}}>
        <div className="w-full max-w-2xl rounded-2xl border overflow-hidden max-h-[90vh] overflow-y-auto" style={{background:"#0a0f1a",borderColor:"rgba(255,255,255,0.1)"}}>
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between sticky top-0" style={{background:"#0a0f1a"}}><h3 className="text-white font-black text-lg">Add Tracking Pixel</h3><button onClick={()=>setModal(false)} className="text-slate-500 hover:text-white text-2xl leading-none">×</button></div>
          <div className="p-6 space-y-5">
            <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Pixel Name <span className="text-red-400">*</span></label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input w-full" placeholder="e.g. Google Ads - Flipkart"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-2">Pixel Type <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-2">{PIXEL_TYPES.map(t=><button key={t.id} onClick={()=>f("type",t.id)} type="button" className={`p-3 rounded-xl border text-left transition-all ${form.type===t.id?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5"}`}><div className="flex items-center gap-2 mb-0.5"><span>{t.icon}</span><span className={`text-xs font-bold ${form.type===t.id?"text-orange-400":"text-white"}`}>{t.label}</span></div><p className="text-xs text-slate-500">{t.desc}</p></button>)}</div>
            </div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Link to Campaign</label><select value={form.campaignId} onChange={e=>f("campaignId",e.target.value)} className="select w-full"><option value="">All campaigns</option>{campaigns.map(c=><option key={c._id} value={c._id}>{c.name} ({c.shortId})</option>)}</select></div>
            {form.type==="google_tag"&&<><div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Google Tag ID <span className="text-red-400">*</span></label><input value={form.googleTagId} onChange={e=>f("googleTagId",e.target.value)} className="input w-full" placeholder="G-XXXXXXXXXX or AW-XXXXXXXXXX"/></div><div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Event Name</label><input value={form.googleEventName} onChange={e=>f("googleEventName",e.target.value)} className="input w-full" placeholder="conversion"/></div></>}
            {form.type==="gtm"&&<div><label className="text-sm text-slate-300 font-semibold block mb-1.5">GTM Container ID <span className="text-red-400">*</span></label><input value={form.gtmId} onChange={e=>f("gtmId",e.target.value)} className="input w-full" placeholder="GTM-XXXXXXX"/></div>}
            {form.type==="facebook"&&<><div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Facebook Pixel ID <span className="text-red-400">*</span></label><input value={form.facebookPixelId} onChange={e=>f("facebookPixelId",e.target.value)} className="input w-full" placeholder="1234567890123456"/></div><div><label className="text-sm text-slate-300 font-semibold block mb-2">Event Name</label><div className="flex flex-wrap gap-2">{["Purchase","Lead","CompleteRegistration","AddToCart","InitiateCheckout"].map(ev=><button key={ev} onClick={()=>f("facebookEventName",ev)} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${form.facebookEventName===ev?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{ev}</button>)}</div></div></>}
            {form.type==="tiktok"&&<><div><label className="text-sm text-slate-300 font-semibold block mb-1.5">TikTok Pixel ID <span className="text-red-400">*</span></label><input value={form.tiktokPixelId} onChange={e=>f("tiktokPixelId",e.target.value)} className="input w-full" placeholder="CXXXXXXXXXXXXXXXXXX"/></div><div><label className="text-sm text-slate-300 font-semibold block mb-2">Event Name</label><div className="flex flex-wrap gap-2">{["CompletePayment","PlaceAnOrder","Subscribe","SubmitForm"].map(ev=><button key={ev} onClick={()=>f("tiktokEventName",ev)} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${form.tiktokEventName===ev?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{ev}</button>)}</div></div></>}
            {form.type==="snapchat"&&<div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Snapchat Pixel ID <span className="text-red-400">*</span></label><input value={form.snapchatPixelId} onChange={e=>f("snapchatPixelId",e.target.value)} className="input w-full" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/></div>}
            {form.type==="custom"&&<div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Custom JavaScript</label><textarea value={form.customUrl} onChange={e=>f("customUrl",e.target.value)} className="input w-full resize-none font-mono text-xs" rows={5} placeholder="// Your JS here&#10;// {{TXN_ID}}, {{SALE_AMOUNT}}, {{PAYOUT}}"/></div>}
            {form.type==="postback"&&<div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Postback URL <span className="text-red-400">*</span></label><input value={form.customUrl} onChange={e=>f("customUrl",e.target.value)} className="input w-full" placeholder="https://your-server.com/conv?txn={{TXN_ID}}&amount={{SALE_AMOUNT}}"/></div>}
            {["google_tag","gtm","facebook","tiktok","snapchat"].includes(form.type)&&<div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.includeValue} onChange={e=>f("includeValue",e.target.checked)} className="w-4 h-4 accent-orange-500"/><span className="text-sm text-slate-300">Include sale value</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.includeCurrency} onChange={e=>f("includeCurrency",e.target.checked)} className="w-4 h-4 accent-orange-500"/><span className="text-sm text-slate-300">Include currency</span></label></div>}
            {error&&<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
            <div className="flex gap-3 pt-2"><button onClick={handleCreate} disabled={saving} className="btn-primary flex-1 py-3 text-sm">{saving?"Creating…":"Create Pixel"}</button><button onClick={()=>{setModal(false);setError("");}} className="btn-ghost px-5 py-3 text-sm">Cancel</button></div>
          </div>
        </div>
      </div>}
    </div>
  );
}
