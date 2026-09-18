/* 星场：三层视差 + 缓慢漂移 + 偶发流星。挂到 #sky */
(()=>{
  const c=document.getElementById('sky'); if(!c) return;
  const x=c.getContext('2d'); let W,H,S=[],M=[],t=0;
  const R=()=>{const d=Math.min(devicePixelRatio||1,2);
    W=c.width=innerWidth*d; H=c.height=innerHeight*d;
    c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; x.scale(1,1);
    const n=Math.round(innerWidth*innerHeight/5200);
    S=Array.from({length:n},()=>{const l=Math.random();
      return{x:Math.random()*W,y:Math.random()*H,z:.3+l*.9,
        r:(.4+l*1.15)*d,a:.18+l*.62,p:Math.random()*6.28,
        h:l>.93?(Math.random()<.5?'#9fd9ff':'#d8c4ff'):'#ffffff'};});};
  addEventListener('resize',R); R();
  const beat=()=>{ if(Math.random()<.014&&M.length<2){
      const d=Math.min(devicePixelRatio||1,2);
      M.push({x:Math.random()*W*.8,y:Math.random()*H*.4,l:0,v:(7+Math.random()*6)*d});}};
  (function loop(){
    t+=.016; x.clearRect(0,0,W,H); beat();
    for(const s of S){
      s.y-=s.z*.045; if(s.y<-2) s.y=H+2;
      const tw=s.a*(.72+.28*Math.sin(t*1.5+s.p));
      x.globalAlpha=tw; x.fillStyle=s.h;
      x.beginPath(); x.arc(s.x,s.y,s.r,0,6.284); x.fill();
    }
    for(let i=M.length-1;i>=0;i--){const m=M[i]; m.l+=m.v;
      const g=x.createLinearGradient(m.x+m.l,m.y+m.l*.55,m.x+m.l-90,m.y+m.l*.55-50);
      g.addColorStop(0,'rgba(190,230,255,.85)'); g.addColorStop(1,'rgba(190,230,255,0)');
      x.globalAlpha=1; x.strokeStyle=g; x.lineWidth=1.4;
      x.beginPath(); x.moveTo(m.x+m.l,m.y+m.l*.55);
      x.lineTo(m.x+m.l-90,m.y+m.l*.55-50); x.stroke();
      if(m.l>Math.max(W,H)) M.splice(i,1);
    }
    x.globalAlpha=1; requestAnimationFrame(loop);
  })();
})();
