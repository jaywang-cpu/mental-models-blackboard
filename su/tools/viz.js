/* 计算台 · 视觉层。每张卡一张跟着输入实时变的 SVG。
   视觉型优先：先看见，再看数。
   排版铁律：统一 560 宽；左半边是图，右半边是字；右栏所有行左对齐同一条竖线，行距 21，上下居中。 */
(function(root){
const L=root.LU;
const E=s=>String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const C={am:'#FFC46B',cy:'#3BE8FF',gr:'#5CE8A8',vi:'#8B6CFF',rd:'#FF6B8A',ink:'#E8EEFB',ink2:'#93A4C4',mut:'#5C6B8A'};
const W=560, RX=330;            // 画布宽；右栏文字统一起点（左右对齐靠它）
const svg=(h,inner)=>`<svg viewBox="0 0 ${W} ${h}" class="viz" preserveAspectRatio="xMidYMid meet">
  <defs><filter id="vg" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
   <marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${C.cy}"/></marker>
   <marker id="ar2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${C.mut}"/></marker>
   <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.am}" stop-opacity=".85"/><stop offset="1" stop-color="${C.am}" stop-opacity=".45"/></linearGradient>
  </defs>${inner}</svg>`;
const t=(x,y,s,o)=>{o=o||{};return `<text x="${x}" y="${y}" fill="${o.c||C.ink2}" font-size="${o.s||11}"`
  +` text-anchor="${o.a||'middle'}" font-family="${o.mono?'ui-monospace,Menlo,monospace':'inherit'}"`
  +` font-weight="${o.w||400}" opacity="${o.o==null?1:o.o}">${E(s)}</text>`;};
const lab=(x,y,zh,en,o)=>t(x,y,zh,o)+t(x,y+11,en,Object.assign({},o,{s:8.5,c:C.mut,o:.9}));
/* 右栏：一组行，垂直居中于画布，左对齐 RX */
function col(h,lines){
  const n=lines.length, gap=21, top=h/2-(n-1)*gap/2;
  return lines.map((l,i)=>t(RX,top+i*gap,l.s,Object.assign({a:'start'},l.o||{}))).join('');
}

/* 1. 对数尺：把所有等价写法钉在同一个点上 */
function ladder(q,rows){
  if(!q||!rows||!rows.length) return '';
  const H=128,x0=44,x1=W-44;
  const vals=rows.map(r=>Math.abs(r.v)).filter(v=>v>0);
  if(!vals.length) return '';
  const lo=Math.floor(Math.log10(Math.min.apply(null,vals)))-.4, hi=Math.ceil(Math.log10(Math.max.apply(null,vals)))+.4;
  const X=v=>x0+(Math.log10(Math.abs(v))-lo)/(hi-lo)*(x1-x0);
  let s=`<line x1="${x0}" y1="70" x2="${x1}" y2="70" stroke="${C.mut}" stroke-width="1"/>`;
  for(let k=Math.ceil(lo);k<=Math.floor(hi);k++){ const x=x0+(k-lo)/(hi-lo)*(x1-x0);
    s+=`<line x1="${x.toFixed(1)}" y1="64" x2="${x.toFixed(1)}" y2="76" stroke="${C.mut}" stroke-width=".8" opacity=".6"/>`
      +t(x,90,'10^'+k,{s:9,c:C.mut,mono:1}); }
  const lanes={};
  rows.slice(0,8).forEach((r,i)=>{ const x=X(r.v), key=Math.round(x/70);
    const up=lanes[key]=(lanes[key]||0)+1;
    const y=70-16-(up-1)*13;
    s+=`<line x1="${x.toFixed(1)}" y1="70" x2="${x.toFixed(1)}" y2="${(y+4).toFixed(1)}" stroke="${C.am}" stroke-width=".8" opacity=".45"/>`
      +`<circle cx="${x.toFixed(1)}" cy="70" r="3.4" fill="${C.am}" filter="url(#vg)"/>`
      +t(x,y,L.fmt(r.v,3)+' '+L.disp(r.unit),{s:10,c:i===0?C.ink:C.ink2,mono:1});
  });
  s+=lab(W/2,112,'同一个量，只是换了刻度','same quantity, different ruler',{s:10});
  return svg(H,s);
}

/* 2. 稀释：两个杯子，色深随浓度 */
function dilute(v){
  const a=L.parseQty(v.c1), b=L.parseQty(v.c2), tt=L.parseQty(v.v2);
  if(!a||!a.ok||!b||!b.ok||!tt||!tt.ok||b.base>a.base) return '';
  const H=172, fold=a.base/b.base, frac=1/fold;
  const TOP=42, BOT=132, HT=BOT-TOP;                       // 两个杯子上下对齐同一条线
  let s='';
  s+=`<rect x="58" y="${TOP}" width="70" height="${HT}" rx="6" fill="none" stroke="${C.mut}" stroke-width="1.2"/>`
   +`<rect x="61" y="${TOP+4}" width="64" height="${HT-8}" rx="4" fill="url(#liq)"/>`
   +lab(93,BOT+18,'母液 C₁','stock',{s:10,c:C.am});
  const hh=Math.max(3,(HT-8)*Math.min(1,frac));
  s+=`<rect x="61" y="${(BOT-4-hh).toFixed(1)}" width="64" height="${hh.toFixed(1)}" fill="${C.cy}" opacity=".9"/>`;
  s+=`<path d="M142 ${(TOP+BOT)/2} L196 ${(TOP+BOT)/2}" stroke="${C.cy}" stroke-width="1.6" marker-end="url(#ar)"/>`
   +t(169,(TOP+BOT)/2-9,'取 V₁',{s:10,c:C.cy})
   +t(169,(TOP+BOT)/2+16,L.fmt(tt.base/fold*1e3,3)+' mL',{s:9,c:C.mut,mono:1});
  const dep=Math.max(.08,Math.min(1,frac));
  s+=`<rect x="212" y="${TOP}" width="88" height="${HT}" rx="6" fill="none" stroke="${C.mut}" stroke-width="1.2"/>`
   +`<rect x="215" y="${TOP+4}" width="82" height="${HT-8}" rx="4" fill="${C.am}" opacity="${(.14+.7*dep).toFixed(3)}"/>`
   +lab(256,BOT+18,'终液 C₂','final',{s:10,c:C.am});
  s+=col(H,[
    {s:'稀释 '+L.fmt(fold,3)+' 倍', o:{s:15,c:C.ink,w:600}},
    {s:'1 份母液 + '+L.fmt(fold-1,3)+' 份稀释剂', o:{s:11,c:C.ink2}},
    {s:'溶质的量不变', o:{s:11,c:C.gr}},
    {s:'C₁V₁ = C₂V₂', o:{s:12.5,c:C.gr,mono:1}}]);
  return svg(H,s);
}

/* 3. 系列稀释：一排管子的颜色梯度 */
function serial(v){
  const c=L.parseQty(v.c0); const f=parseFloat(v.fold)||10, n=Math.min(12,Math.max(2,parseInt(v.n)||8));
  if(!c||!c.ok) return '';
  const H=150, w=Math.min(44,(W-80)/n), gap=n>1?(W-80-w*n)/(n-1):0;
  let s='';
  for(let i=0;i<n;i++){
    const x=40+i*(w+gap), dep=Math.pow(1/f,i);
    const o=Math.max(.05,Math.min(.92,.12+.8*Math.pow(dep,.22)));
    s+=`<rect x="${x.toFixed(1)}" y="32" width="${w.toFixed(1)}" height="64" rx="4" fill="none" stroke="${C.mut}" stroke-width=".9"/>`
     +`<rect x="${(x+2).toFixed(1)}" y="34" width="${(w-4).toFixed(1)}" height="60" rx="3" fill="${C.am}" opacity="${o.toFixed(3)}"/>`
     +t(x+w/2,112,'#'+(i+1),{s:9.5,c:C.mut,mono:1});
    if(i<n-1) s+=`<path d="M${(x+w+1).toFixed(1)} 64 L${(x+w+gap-1).toFixed(1)} 64" stroke="${C.cy}" stroke-width="1" opacity=".5"/>`;
  }
  s+=t(W/2,134,'每步 ÷'+f+'　颜色变淡得慢，实际每步差 '+f+' 倍',{s:10.5,c:C.ink2});
  return svg(H,s);
}

/* 4. 血球板：九宫格 + 点 */
function count(v){
  const n=parseFloat(v.cells)||0, sq=parseFloat(v.sq)||4, d=parseFloat(v.d)||1;
  const per=n/sq, H=176, ox=44, oy=26, cell=36;
  let s='';
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){
    const x=ox+j*cell, y=oy+i*cell, big=(i%2===0)&&(j%2===0);
    s+=`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${big?'rgba(255,196,107,.10)':'none'}"`
      +` stroke="${C.mut}" stroke-width=".7"/>`;
  }
  const dots=Math.min(40,Math.round(per));
  let seed=42; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
  [[0,0],[2,0],[0,2],[2,2]].forEach(function(p){ const j=p[0],i=p[1];
    for(let k=0;k<dots;k++){ const x=ox+j*cell+3+rnd()*(cell-6), y=oy+i*cell+3+rnd()*(cell-6);
      s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5" fill="${C.cy}" opacity=".8"/>`; }});
  s+=lab(ox+cell*1.5,oy+cell*3+18,'四个角大格','four corner squares',{s:9.5});
  s+=col(H,[
    {s:'每格均值', o:{s:10,c:C.mut}},
    {s:L.fmt(per,3)+' 个', o:{s:16,c:C.ink,mono:1,w:600}},
    {s:'× 稀释 '+d+' × 10⁴', o:{s:11,c:C.ink2,mono:1}},
    {s:'= '+L.fmt(per*d*1e4,3)+' cells/mL', o:{s:13.5,c:C.am,mono:1,w:600}},
    {s:'一格 = 1×1×0.1 mm = 10⁻⁴ mL', o:{s:9.5,c:C.mut}}]);
  return svg(H,s);
}

/* 5. 孔板俯视 */
function seed(v,r){
  const plate=String(v.plate||'').trim();
  const spec={'96 孔':[12,8],'48 孔':[8,6],'24 孔':[6,4],'12 孔':[4,3],'6 孔':[3,2]}[plate]||[6,4];
  const cols=spec[0], rowsN=spec[1], H=162;
  const n=Math.min(cols*rowsN,parseFloat(v.n)||0);
  const cw=Math.min(26,270/cols), r0=cw*0.38;
  const bw=cols*cw+12, bh=rowsN*cw+12, bx=36, by=H/2-bh/2-8;
  let s=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="none" stroke="${C.mut}" stroke-width="1"/>`;
  for(let i=0;i<rowsN;i++)for(let j=0;j<cols;j++){
    const k=i*cols+j, on=k<n;
    s+=`<circle cx="${(bx+6+j*cw+cw/2).toFixed(1)}" cy="${(by+6+i*cw+cw/2).toFixed(1)}" r="${r0.toFixed(1)}"`
      +` fill="${on?C.am:'none'}" opacity="${on?.75:1}" stroke="${on?'none':C.mut}" stroke-width=".7"/>`;
  }
  s+=t(bx+bw/2,by+bh+20,plate+'　铺 '+L.fmt(n,3)+' 孔',{s:10.5,c:C.ink2});
  const rows=(r&&r.rows)||[];
  s+=col(H,[
    {s:'每孔', o:{s:10,c:C.mut}},
    {s:L.fmt(parseFloat(v.per)||0,3)+' cells', o:{s:15,c:C.ink,mono:1,w:600}},
    {s:'取悬液 '+(rows[0]?rows[0].v:''), o:{s:11,c:C.am,mono:1}},
    {s:'补培养基 '+(rows[1]?rows[1].v:''), o:{s:11,c:C.cy,mono:1}}]);
  return svg(H,s);
}

/* 6. 离心：转子半径与 g 力 */
function spin(v){
  const rad=parseFloat(v.r)||150, H=166, cx=124, cy=H/2-6, R=54;
  let s=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.mut}" stroke-width="1.2"/>`
   +`<circle cx="${cx}" cy="${cy}" r="6" fill="${C.ink2}"/>`;
  for(let k=0;k<6;k++){ const a=k*Math.PI/3, px=cx+Math.cos(a)*R, py=cy+Math.sin(a)*R;
    s+=`<rect x="${(px-6).toFixed(1)}" y="${(py-9).toFixed(1)}" width="12" height="18" rx="3"`
      +` transform="rotate(${(a*180/Math.PI+90).toFixed(1)},${px.toFixed(1)},${py.toFixed(1)})" fill="${C.am}" opacity=".7"/>`; }
  s+=`<line x1="${cx}" y1="${cy}" x2="${cx+R}" y2="${cy}" stroke="${C.cy}" stroke-width="1.4" stroke-dasharray="3 3"/>`
   +t(cx+R/2,cy-8,'r = '+rad+' mm',{s:10,c:C.cy,mono:1})
   +lab(cx,cy+R+26,'转子','rotor',{s:10});
  s+=col(H,[
    {s:'RCF = 1.118×10⁻⁵ · r · rpm²', o:{s:12,c:C.ink,mono:1}},
    {s:'转速翻倍，g 力 ×4', o:{s:11,c:C.gr}},
    {s:'半径不同 = 力不同', o:{s:11,c:C.rd}},
    {s:'所以论文永远写 ×g', o:{s:11,c:C.rd}}]);
  return svg(H,s);
}

/* 7. Beer-Lambert：光穿过比色皿 */
function absorb(v){
  const a=parseFloat(v.a)||0, H=152, trans=Math.pow(10,-a);
  const CT=64, CB=118, cx0=150, cw=88;
  let s=`<rect x="${cx0}" y="${CT}" width="${cw}" height="${CB-CT}" rx="4" fill="${C.am}"`
   +` opacity="${Math.min(.85,.12+a*.5).toFixed(3)}" stroke="${C.mut}" stroke-width="1"/>`
   +t(cx0+cw/2,CB+18,'比色皿 l = '+(parseFloat(v.l)||1)+' cm',{s:10,c:C.mut});
  for(let k=0;k<4;k++){ const y=CT+10+k*12;
    s+=`<line x1="58" y1="${y}" x2="${cx0-2}" y2="${y}" stroke="${C.cy}" stroke-width="2" opacity=".85"/>`
     +`<line x1="${cx0+cw+2}" y1="${y}" x2="${(cx0+cw+2+70*Math.max(.06,trans)).toFixed(1)}" y2="${y}" stroke="${C.cy}" stroke-width="2" opacity=".85"/>`; }
  s+=t(104,CT-8,'入射 I₀',{s:10,c:C.cy})+t(cx0+cw+38,CT-8,'透过 I',{s:10,c:C.cy});
  s+=col(H,[
    {s:'A = '+a+' → 透过 '+L.fmt(trans*100,3)+'%', o:{s:12,c:C.ink,mono:1}},
    {s:'A=1 → 只剩 10%', o:{s:10.5,c:C.ink2}},
    {s:'A=2 → 只剩 1%', o:{s:10.5,c:C.ink2}},
    {s:a>1.2?'超出线性区，先稀释':(a<.05?'信号太弱，浓缩':'落在 0.1–1，正好'),
     o:{s:11,c:(a>1.2||a<.05)?C.rd:C.gr}}]);
  return svg(H,s);
}

/* 8. 纳米颗粒：一颗球 + 表面蛋白 */
function particle(v,r){
  const d=parseFloat(v.d)||100, H=176, cx=112, cy=H/2-8;
  const R=Math.max(26,Math.min(56,26+Math.log10(Math.max(1,d))*14));
  let s=`<circle cx="${cx}" cy="${cy}" r="${R.toFixed(1)}" fill="${C.vi}" opacity=".3" stroke="${C.vi}" stroke-width="1.2"/>`;
  const nProt=((r&&r.rows)||[]).filter(x=>x.k==='每颗粒蛋白数')[0];
  const k=nProt?Math.min(34,Math.max(4,Math.round(parseFloat(String(nProt.v))/40)||8)):0;
  for(let i=0;i<k;i++){ const a=i*2*Math.PI/k;
    s+=`<circle cx="${(cx+Math.cos(a)*R).toFixed(1)}" cy="${(cy+Math.sin(a)*R).toFixed(1)}" r="3.2" fill="${C.gr}" opacity=".9"/>`; }
  s+=`<line x1="${cx}" y1="${cy}" x2="${(cx+R).toFixed(1)}" y2="${cy}" stroke="${C.cy}" stroke-width="1" stroke-dasharray="2 3"/>`
   +t(cx+R/2,cy-7,'r',{s:10,c:C.cy,mono:1})
   +lab(cx,cy+R+26,'一颗颗粒','one particle',{s:10});
  const rows=(r&&r.rows)||[];
  s+=col(H,[
    {s:'V = (4/3)πr³　m = ρV', o:{s:12,c:C.ink,mono:1}},
    {s:'粒径 ×2 → 粒子数 ÷8', o:{s:11,c:C.am}},
    {s:'粒径 ×2 → 表面积 ×4', o:{s:11,c:C.gr}},
    {s:rows[0]?('粒子数 '+rows[0].v):'', o:{s:11,c:C.cy,mono:1}},
    {s:nProt?('每颗粒 '+nProt.v):'填蛋白浓度可算每颗粒蛋白数', o:{s:10.5,c:nProt?C.gr:C.mut,mono:!!nProt}}]);
  return svg(H,s);
}

/* 9. Kd 结合曲线 */
function kd(v){
  const l=L.parseQty(v.l), K=L.parseQty(v.kd);
  if(!l||!l.ok||!K||!K.ok||!L.dEq(l.d,K.d)) return '';
  const H=184,x0=52,x1=W-172,y0=H-44,y1=26;
  const lo=-2.2, hi=2.6;
  const X=u=>x0+(u-lo)/(hi-lo)*(x1-x0), Y=p=>y0-p*(y0-y1);
  let d='';
  for(let i=0;i<=80;i++){ const u=lo+(hi-lo)*i/80, x=Math.pow(10,u), p=x/(x+1);
    d+=(i?' L':'M')+X(u).toFixed(1)+' '+Y(p).toFixed(1); }
  let s=`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="${C.mut}" stroke-width="1"/>`
   +`<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="${C.mut}" stroke-width="1"/>`
   +`<path d="${d}" fill="none" stroke="${C.cy}" stroke-width="2" filter="url(#vg)"/>`;
  [[-1,'Kd/10'],[0,'Kd'],[Math.log10(9),'9×Kd']].forEach(function(p){ const u=p[0];
    const yy=Y(Math.pow(10,u)/(Math.pow(10,u)+1));
    s+=`<line x1="${X(u).toFixed(1)}" y1="${y0}" x2="${X(u).toFixed(1)}" y2="${yy.toFixed(1)}" stroke="${C.mut}" stroke-width=".7" stroke-dasharray="2 3"/>`
     +t(X(u),y0+14,p[1],{s:9,c:C.mut,mono:1}); });
  const u=Math.log10(l.base/K.base), p=1/(1+K.base/l.base);
  if(u>=lo&&u<=hi) s+=`<circle cx="${X(u).toFixed(1)}" cy="${Y(p).toFixed(1)}" r="5" fill="${C.am}" filter="url(#vg)"/>`
   +t(X(u),Y(p)-13,L.fmt(p*100,3)+'%',{s:11,c:C.am,mono:1,w:600});
  s+=t(x0-8,y1+4,'100%',{s:9,c:C.mut,a:'end'})+t(x0-8,y0+3,'0',{s:9,c:C.mut,a:'end'})
   +lab((x0+x1)/2,H-14,'配体浓度（对数轴）','[L] on log scale',{s:9.5});
  s+=col(H,[
    {s:'θ = [L]/([L]+Kd)', o:{s:12,c:C.ink,mono:1}},
    {s:'10% → 90%', o:{s:10.5,c:C.ink2}},
    {s:'要跨 81 倍', o:{s:12.5,c:C.gr,w:600}},
    {s:'曲线宽度是定死的', o:{s:10.5,c:C.ink2}}]);
  return svg(H,s);
}

/* 10. 给药：注射体积条 */
function dose(v,r){
  const bw=L.parseQty(v.bw), H=136;
  const rows=(r&&r.rows)||[];
  const ul=rows[0]?parseFloat(String(rows[0].v)):0;
  const frac=ul/200;
  let s=`<rect x="48" y="60" width="240" height="22" rx="11" fill="none" stroke="${C.mut}" stroke-width="1"/>`
   +`<rect x="50" y="62" width="${Math.max(2,236*Math.min(1,frac)).toFixed(1)}" height="18" rx="9"`
   +` fill="${frac>1?C.rd:C.am}" opacity=".85"/>`
   +t(168,100,'i.v. 单次上限约 200 μL',{s:10,c:C.mut})
   +t(168,48,L.fmt(ul,3)+' μL',{s:15,c:frac>1?C.rd:C.ink,mono:1,w:600});
  s+=col(H,[
    {s:'体重 '+(bw&&bw.ok?L.fmt(bw.base,3)+' g':'—'), o:{s:11,c:C.ink2,mono:1}},
    {s:'剂量 '+(parseFloat(v.dose)||0)+' mg/kg', o:{s:11,c:C.ink2,mono:1}},
    {s:'体积 = 剂量×体重÷浓度', o:{s:11,c:C.gr}},
    {s:frac>1?'超量，提高母液浓度':'在安全范围', o:{s:11,c:frac>1?C.rd:C.gr}}]);
  return svg(H,s);
}

/* 11. SD vs SEM */
function stat(v){
  const xs=String(v.data||'').split(/[\s,，]+/).map(parseFloat).filter(x=>!isNaN(x));
  if(xs.length<2) return '';
  const H=156,x0=54,x1=W-44,y=104;
  const n=xs.length, m=xs.reduce((a,b)=>a+b,0)/n;
  const sd=Math.sqrt(xs.reduce((a,b)=>a+(b-m)*(b-m),0)/(n-1)), sem=sd/Math.sqrt(n);
  const lo=Math.min.apply(null,xs)-sd*1.2, hi=Math.max.apply(null,xs)+sd*1.2;
  const X=v=>x0+(v-lo)/((hi-lo)||1)*(x1-x0);
  let s=`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.mut}" stroke-width="1"/>`;
  xs.forEach(x=>{ s+=`<circle cx="${X(x).toFixed(1)}" cy="${y}" r="4" fill="${C.cy}" opacity=".75"/>`; });
  s+=`<line x1="${X(m).toFixed(1)}" y1="34" x2="${X(m).toFixed(1)}" y2="${y+10}" stroke="${C.ink}" stroke-width="1" stroke-dasharray="3 3"/>`
   +`<line x1="${X(m-sd).toFixed(1)}" y1="52" x2="${X(m+sd).toFixed(1)}" y2="52" stroke="${C.am}" stroke-width="2.5"/>`
   +t((X(m-sd)+X(m+sd))/2,44,'± SD　数据有多散',{s:10,c:C.am})
   +`<line x1="${X(m-sem).toFixed(1)}" y1="78" x2="${X(m+sem).toFixed(1)}" y2="78" stroke="${C.gr}" stroke-width="2.5"/>`
   +t((X(m-sem)+X(m+sem))/2,70,'± SEM　均值有多准',{s:10,c:C.gr})
   +t(X(m),y+22,'均值 '+L.fmt(m,4),{s:11,c:C.ink,mono:1})
   +t(W/2,H-8,'SEM = SD / √n　n 翻 4 倍，误差棒才减半',{s:10.5,c:C.ink2});
  return svg(H,s);
}

/* 12. 通用：质量 → mol → 个数，两座桥 */
function chain(){
  const H=118, y=44, bw=118, bh=40;
  const box=(x,zh,en,c)=>`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="${c}" opacity=".16" stroke="${c}" stroke-width="1"/>`
    +t(x+bw/2,y+19,zh,{s:12.5,c:C.ink})+t(x+bw/2,y+33,en,{s:8.5,c:C.mut});
  const x1=42, x2=221, x3=400;
  let s=box(x1,'质量 g','mass',C.am)+box(x2,'物质的量 mol','amount',C.cy)+box(x3,'个数','count',C.gr);
  s+=`<path d="M${x1+bw+4} ${y+bh/2} L${x2-6} ${y+bh/2}" stroke="${C.mut}" stroke-width="1.2" marker-end="url(#ar2)"/>`
   +`<path d="M${x2+bw+4} ${y+bh/2} L${x3-6} ${y+bh/2}" stroke="${C.mut}" stroke-width="1.2" marker-end="url(#ar2)"/>`
   +t((x1+bw+x2)/2,y+bh/2-8,'÷ MW',{s:10.5,c:C.am,mono:1})
   +t((x2+bw+x3)/2,y+bh/2-8,'× N_A',{s:10.5,c:C.gr,mono:1})
   +t(W/2,H-12,'所有"跨量纲"的换算，只有这两座桥',{s:10.5,c:C.ink2});
  return svg(H,s);
}

root.VIZ={dilute:dilute,serial:serial,count:count,seed:seed,spin:spin,absorb:absorb,
  particle:particle,kd:kd,dose:dose,stat:stat,ladder:ladder,chain:chain,
  weigh:chain, wv:chain, nucleic:chain, ratio:seed};
})(typeof window!=='undefined'?window:globalThis);
