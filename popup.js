let current=null;
const $=id=>document.getElementById(id);
function say(s){$("message").textContent=s;}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function scan(){
 say("Scanning visible page elements...");
 try{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  const [result]=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>{
   const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden"&&Number(s.opacity)>0.02};
   const norm=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return c;const a=m[1].split(",").map(x=>x.trim());if(a.length===4&&Number(a[3])===0)return "";return `rgb(${a.slice(0,3).join(", ")})`;};
   const colours=new Map(),fonts=new Map();let scanned=0;
   for(const e of Array.from(document.querySelectorAll("body *")).slice(0,12000)){
    if(!visible(e))continue;scanned++;
    const s=getComputedStyle(e), area=Math.max(1,Math.min(500000,e.getBoundingClientRect().width*e.getBoundingClientRect().height));
    for(const [kind,val] of [["text",norm(s.color)],["background",norm(s.backgroundColor)]]){
     if(!val||val==="rgba(0, 0, 0, 0)"||val==="transparent")continue;
     const key=val;const old=colours.get(key)||{value:key,count:0,area:0,kinds:{}};old.count++;old.area+=area;old.kinds[kind]=(old.kinds[kind]||0)+1;colours.set(key,old);
    }
    const fam=(s.fontFamily||"").split(",")[0].replace(/^["']|["']$/g,"");
    if(fam){const key=[fam,s.fontWeight,s.fontSize].join("|");const old=fonts.get(key)||{family:fam,weight:s.fontWeight,size:s.fontSize,count:0};old.count++;fonts.set(key,old);}
   }
   return {title:document.title||location.hostname,url:location.href,scanned,
    colours:[...colours.values()].sort((a,b)=>b.area-a.area).slice(0,12),
    fonts:[...fonts.values()].sort((a,b)=>b.count-a.count).slice(0,12)};
  }});
  current=result.result;render();say(`Scanned ${current.scanned} visible elements.`);
 }catch(e){say("Could not scan this page. Try a normal website tab.");}
}
function render(){
 $("colours").innerHTML=current.colours.map((c,i)=>`<div class="item"><span class="swatch" style="background:${esc(c.value)}"></span><div class="info"><b>${esc(c.value)}</b><div class="muted">${c.count} elements · ${Object.keys(c.kinds).join(", ")}</div></div><button data-copy="${i}">Copy</button></div>`).join("")||"No colours found.";
 $("fonts").innerHTML=current.fonts.map((f,i)=>`<div class="item"><div class="info"><b style="font-family:${esc(f.family)}">${esc(f.family)}</b><div class="muted">Weight ${esc(f.weight)} · ${esc(f.size)} · ${f.count} elements</div></div><button data-font="${i}">Copy</button></div>`).join("")||"No fonts found.";
 document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>copy(current.colours[+b.dataset.copy].value));
 document.querySelectorAll("[data-font]").forEach(b=>b.onclick=()=>copy(current.fonts[+b.dataset.font].family));
}
async function copy(t){await navigator.clipboard.writeText(t);say("Copied to clipboard.");}
async function loadKits(){
 const {kits=[]}=await chrome.storage.local.get("styleKits");
 $("kits").innerHTML=kits.length?kits.map((k,i)=>`<div class="kitrow"><span>${esc(k.name)}</span><span><button data-load="${i}">Load</button> <button data-delete="${i}">Delete</button></span></div>`).join(""):'<div class="muted">No saved kits yet.</div>';
 document.querySelectorAll("[data-load]").forEach(b=>b.onclick=()=>{current=kits[+b.dataset.load].data;render();say("Loaded saved kit.");});
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{kits.splice(+b.dataset.delete,1);await chrome.storage.local.set({styleKits:kits});loadKits();});
}
$("scan").onclick=scan;
$("save").onclick=async()=>{if(!current){say("Scan a website first.");return;}const name=$("kitName").value.trim();if(!name){say("Enter a name for this kit.");return;}const {styleKits=[]}=await chrome.storage.local.get("styleKits");styleKits.unshift({name,data:current,savedAt:new Date().toISOString()});await chrome.storage.local.set({styleKits});$("kitName").value="";say("Style kit saved in this Chrome profile.");loadKits();};
$("export").onclick=()=>{if(!current){say("Scan or load a kit first.");return;}const vars=[...current.colours.map((c,i)=>`  --style-color-${i+1}: ${c.value};`),...current.fonts.flatMap((f,i)=>[`  --style-font-${i+1}: ${JSON.stringify(f.family)};`,`  --style-font-${i+1}-weight: ${f.weight};`,`  --style-font-${i+1}-size: ${f.size};`])];const css=`/* Style kit: ${current.title} */\n:root {\n${vars.join("\n")}\n}\n`;const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([css],{type:"text/css"}));a.download="style-spy-kit.css";a.click();URL.revokeObjectURL(a.href);say("CSS variables exported.");};
loadKits();