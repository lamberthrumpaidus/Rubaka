/* ALL Create by LamberthRumpaidus */
(() => {
  const $$=id=>document.getElementById(id);
  const intro=$$("rb-intro");
  const hints=$$("rb-hints");
  const status=$$("rb-status");
  const start=$$("rb-start");
  const fs=$$("rb-full");
  const contrast=$$("rb-contrast");
  const motion=$$("rb-motion");
  const panel=$$("rb-help");
  const help=$$("rb-help-toggle");
  const close=$$("rb-help-close");
  const key="rb-app-v3";
  let started=false;
  let toastTimer=0;
  const read=x=>{try{return localStorage.getItem(key+"-"+x)}catch{return null}};
  const save=(x,v)=>{try{localStorage.setItem(key+"-"+x,String(v))}catch{}};
  function notify(t){clearTimeout(toastTimer);status.textContent=t;status.classList.add("visible");toastTimer=setTimeout(()=>status.classList.remove("visible"),2600);}
  function hideIfRunning(){if(!started&&!document.querySelector("body > h1")){started=true;intro.hidden=true;panel.hidden=true;document.documentElement.classList.add("rb-is-playing");}}
  const observer=new MutationObserver(hideIfRunning);
  observer.observe(document.body,{childList:true,subtree:false});
  hideIfRunning();
  function setBoolean(name,element,textOn,textOff){
    let value=read(name)==="true";
    function render(){document.documentElement.dataset["rb"+name]=String(value);element.textContent=value?textOn:textOff;element.setAttribute("aria-pressed",String(value))}
    element.onclick=e=>{e.stopPropagation();value=!value;save(name,value);render();notify(value?"Preferensi diaktifkan":"Preferensi dinonaktifkan")};
    render();
  }
  setBoolean("contrast",contrast,"Kontras ✓","Kontras");
  setBoolean("motion",motion,"Gerakan minim ✓","Gerakan normal");
  help.onclick=e=>{e.preventDefault();e.stopPropagation();panel.hidden=!panel.hidden;help.setAttribute("aria-expanded",String(!panel.hidden));};
  close.onclick=e=>{e.preventDefault();e.stopPropagation();panel.hidden=true;help.setAttribute("aria-expanded","false");};
  fs.onclick=async e=>{
    e.preventDefault();e.stopPropagation();
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch{notify("Layar penuh tidak didukung.");}
  };
  start.onclick=e=>{e.preventDefault();e.stopPropagation();window.dispatchEvent(new KeyboardEvent("keydown",{code:"Space",key:" ",bubbles:true}));};
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&!panel.hidden){panel.hidden=true;help.setAttribute("aria-expanded","false");}
    if(e.key.toLowerCase()==="h"&&!e.ctrlKey&&!e.altKey&&!started){panel.hidden=!panel.hidden;help.setAttribute("aria-expanded",String(!panel.hidden));}
  });
  window.addEventListener("gamepadconnected",()=>notify("Gamepad terhubung. Tombol siap digunakan."));
  window.addEventListener("gamepaddisconnected",()=>notify("Gamepad terputus."));
  window.addEventListener("offline",()=>notify("Mode offline. Game tetap berjalan di browser."));
  window.addEventListener("online",()=>notify("Koneksi tersedia."));
  document.addEventListener("visibilitychange",()=>{if(!started)return;if(!document.hidden)notify("Kembali ke permainan.");});
  document.querySelectorAll(".tbtn").forEach(el=>{el.setAttribute("role","button");el.setAttribute("tabindex","-1");el.setAttribute("aria-label",el.textContent.trim()||el.id)});
  document.querySelectorAll('a[target="_blank"]').forEach(a=>a.rel="noopener noreferrer");
  document.documentElement.classList.add("rb-ui-ready");
})();