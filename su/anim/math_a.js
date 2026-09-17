/* anim/math_a.js — 数学宇宙 ns / al / ge / la 动画（BRIDGE 必备 id 全部覆盖，含 al.trig）
   只依赖 d3 v7（全局 d3）+ K（anim/_kit.js）。key = node.id 把 '.' 换 '_'。 */
(()=>{
window.ANIM = window.ANIM || {};
const A=window.ANIM, C=K.C, M=Math, PI=M.PI;

/* ============ 共享小函数 ============ */
const none=()=>({stop(){}});
const uid=p=>p+M.random().toString(36).slice(2,8);
const txt=(sel,x,y,s,o={})=>sel.append('text').attr('x',x).attr('y',y).text(s)
  .attr('fill',o.color||C.ink).attr('font-size',o.size||12).attr('text-anchor',o.anchor||'start')
  .attr('font-family',o.mono?'ui-monospace,Menlo,monospace':null).attr('font-weight',o.bold?600:null);
const ln=(sel,x1,y1,x2,y2,color,w=2,o={})=>sel.append('line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
  .attr('stroke',color).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null).attr('marker-end',o.arrow||null);
const dot=(sel,x,y,r,color)=>sel.append('circle').attr('cx',x).attr('cy',y).attr('r',r).attr('fill',color);
/* 数学坐标系：原点 (cx,cy)，u 像素/单位 */
const frame=(W,H,u,cx=W/2,cy=H/2)=>({u,cx,cy,x:v=>cx+v*u,y:v=>cy-v*u,ix:p=>(p-cx)/u,iy:p=>(cy-p)/u});
const mgrid=(g,f,W,H)=>{
  const gg=g.append('g'),nx=M.ceil(W/f.u),ny=M.ceil(H/f.u);
  for(let i=-nx;i<=nx;i++) gg.append('line').attr('x1',f.x(i)).attr('x2',f.x(i)).attr('y1',0).attr('y2',H).attr('stroke',i?C.hair:C.muted).attr('stroke-width',i?.6:1.2);
  for(let j=-ny;j<=ny;j++) gg.append('line').attr('y1',f.y(j)).attr('y2',f.y(j)).attr('x1',0).attr('x2',W).attr('stroke',j?C.hair:C.muted).attr('stroke-width',j?.6:1.2);
  return gg;
};
/* 可拖拽手柄：cb(mx,my) 是 viewBox 像素坐标 */
const handle=(svg,g,x,y,color,cb)=>{
  const c=g.append('circle').attr('cx',x).attr('cy',y).attr('r',9).attr('fill',color).attr('stroke',C.ink).attr('stroke-width',1.5).style('cursor','grab');
  c.call(d3.drag().on('start drag',ev=>{const [mx,my]=d3.pointer(ev,svg.node());cb(mx,my);}));
  return c;
};
const mv=(hg,i,mx,my)=>hg.selectAll('circle').filter((d,j)=>j===i).attr('cx',mx).attr('cy',my);
const vec=(g,f,x,y,color,mk,w=2.5)=>ln(g,f.x(0),f.y(0),f.x(x),f.y(y),color,w,{arrow:mk});
const mat=(a,b,c,d)=>({a,b,c,d,ap:(x,y)=>[a*x+b*y,c*x+d*y]});
const I=mat(1,0,0,1);
const rot=t=>mat(M.cos(t),-M.sin(t),M.sin(t),M.cos(t));
const mul=(p,q)=>mat(p.a*q.a+p.b*q.c,p.a*q.b+p.b*q.d,p.c*q.a+p.d*q.c,p.c*q.b+p.d*q.d);
const lerpM=(p,q,t)=>mat(p.a+(q.a-p.a)*t,p.b+(q.b-p.b)*t,p.c+(q.c-p.c)*t,p.d+(q.d-p.d)*t);
const mstr=(m,d=1)=>`[${K.fmt(m.a,d)} ${K.fmt(m.b,d)}; ${K.fmt(m.c,d)} ${K.fmt(m.d,d)}]`;
const eig2=m=>{ const tr=m.a+m.d,det=m.a*m.d-m.b*m.c,D=tr*tr-4*det; if(D<0) return null;
  return [(tr+M.sqrt(D))/2,(tr-M.sqrt(D))/2].map(l=>{
    let v=M.abs(m.b)>1e-9?[m.b,l-m.a]:M.abs(m.c)>1e-9?[l-m.d,m.c]:(M.abs(m.a-l)<1e-9?[1,0]:[0,1]);
    const n=M.hypot(v[0],v[1])||1; return {l,v:[v[0]/n,v[1]/n]}; }); };
/* 2×2 SVD：A = R(gamma) · diag(s1,s2) · R(beta) */
const svd2=m=>{ const E=(m.a+m.d)/2,F=(m.a-m.d)/2,G=(m.c+m.b)/2,Hh=(m.c-m.b)/2,Q=M.hypot(E,Hh),R=M.hypot(F,G);
  const a1=M.atan2(G,F),a2=M.atan2(Hh,E); return {s1:Q+R,s2:Q-R,beta:(a2-a1)/2,gamma:(a2+a1)/2}; };
const L2=f=>d3.line().defined(p=>p&&isFinite(p[1])).x(p=>f.x(p[0])).y(p=>f.y(p[1]));
const poly=(g,f,pts,color,o={})=>g.append('path').attr('d',L2(f)(pts)+(o.close?'Z':''))
  .attr('fill',o.fill||'none').attr('fill-opacity',o.fo==null?.2:o.fo).attr('stroke',color).attr('stroke-width',o.w||2).attr('opacity',o.op==null?1:o.op);
const curve=(g,f,fn,x0,x1,color,n=240)=>{ const pts=[]; for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n,y=fn(x); pts.push(isFinite(y)&&M.abs(y)<1e4?[x,y]:null); }
  return g.append('path').attr('d',L2(f)(pts)).attr('fill','none').attr('stroke',color).attr('stroke-width',2.2); };
/* 被矩阵 m 变换后的网格 */
const tgrid=(g,f,m,n,color)=>{ const gg=g.append('g'),L=L2(f);
  for(let i=-n;i<=n;i++){ gg.append('path').attr('d',L([m.ap(i,-n),m.ap(i,n)])).attr('stroke',color).attr('fill','none').attr('stroke-width',i?1:2).attr('opacity',i?.5:1);
    gg.append('path').attr('d',L([m.ap(-n,i),m.ap(n,i)])).attr('stroke',color).attr('fill','none').attr('stroke-width',i?1:2).attr('opacity',i?.5:1); } return gg; };
const setM=(m,k,x)=>{ const o={a:m.a,b:m.b,c:m.c,d:m.d}; o[k]=+x; return mat(o.a,o.b,o.c,o.d); };
const def=(key,title,en,cap,make)=>{ A[key]={title,en,cap,make}; };

/* ============ ns 数感 ============ */
def('ns_max_digits','数字拼最大','Largest from digits','滑杆切换写法，柱高是对数尺度：指数一层就吃掉所有乘法。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const items=[{s:'321',v:321},{s:'3×21',v:63},{s:'21³',v:9261},{s:'3²¹',v:M.pow(3,21)},{s:'2³¹',v:M.pow(2,31)}];
  const x=d3.scaleBand().domain(items.map(d=>d.s)).range([70,W-30]).padding(.35),y=d3.scaleLog().domain([1,1e11]).range([H-50,30]);
  [1,1e2,1e4,1e6,1e8,1e10].forEach(v=>{ ln(g,60,y(v),W-30,y(v),C.hair,1); txt(g,55,y(v)+4,'10^'+M.round(M.log10(v)),{color:C.muted,size:10,anchor:'end',mono:true}); });
  const bars=g.selectAll('rect').data(items).join('rect').attr('x',d=>x(d.s)).attr('width',x.bandwidth()).attr('y',H-50).attr('height',0).attr('fill',C.muted).attr('rx',4);
  const labs=g.selectAll('text.n').data(items).join('text').attr('class','n').attr('x',d=>x(d.s)+x.bandwidth()/2).attr('y',H-32).attr('text-anchor','middle').attr('fill',C.ink).attr('font-size',14).text(d=>d.s);
  const val=txt(g,W/2,20,'',{anchor:'middle',size:14,mono:true,color:api.color});
  K.label(svg,70,H-14,'对数尺度：每格 ×100','log scale: each gridline = ×100',{size:11,color:C.muted});
  const show=k=>{ bars.transition().duration(500).attr('y',d=>y(d.v)).attr('height',d=>H-50-y(d.v)).attr('fill',(d,i)=>i===k?api.color:i<k?C.vi:C.muted);
    const d=items[k]; val.text(`${d.s} = ${d.v>1e6?d.v.toExponential(2):d.v}`); labs.attr('font-weight',(_,i)=>i===k?700:400); };
  show(0); api.slider('写法 / form',0,items.length-1,1,0,v=>show(+v)); return none();
});

def('ns_make24','算 24 点','Make 24','3 3 8 8 唯一解走分数：8÷3 → 3−8/3 → 8÷(1/3)=24。点"下一步"看每一步合并。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const steps=[{n:['3','3','8','8'],zh:'四个数，目标 24。整数加减乘走不通，试分数。',en:'integers fail, try fractions'},
    {n:['3','8/3','8'],zh:'8 ÷ 3 = 8/3 ≈ 2.67',en:'8 ÷ 3'},{n:['1/3','8'],zh:'3 − 8/3 = 1/3',en:'3 − 8/3'},{n:['24'],zh:'8 ÷ (1/3) = 24',en:'8 ÷ 1/3 = 24'}];
  let k=0; const draw=()=>{ g.selectAll('*').remove(); const s=steps[k],n=s.n.length,sp=M.min(120,(W-80)/n),x0=W/2-sp*(n-1)/2,last=k===steps.length-1;
    s.n.forEach((t,i)=>{ const gg=g.append('g').attr('transform',`translate(${x0+i*sp},${H/2-20})`).attr('opacity',0);
      gg.append('circle').attr('r',34).attr('fill',last?C.gr:api.color).attr('fill-opacity',.15).attr('stroke',last?C.gr:api.color).attr('stroke-width',2.5);
      txt(gg,0,7,t,{anchor:'middle',size:t.length>2?18:24,bold:true}); gg.transition().duration(400).delay(i*80).attr('opacity',1); });
    K.label(g,W/2,H-50,s.zh,s.en,{anchor:'middle',size:14}); txt(g,W-16,24,`步 ${k}/${steps.length-1}`,{anchor:'end',color:C.muted,mono:true}); };
  draw(); api.button('下一步 / next',()=>{k=(k+1)%steps.length;draw();}); api.button('重来 / reset',()=>{k=0;draw();}); return none();
});

def('ns_estimate','估算：先抓量级','Estimate first','4987×21 四舍五入到 1 位有效数字：5000×20 = 100000。滑杆看保留位数 vs 误差。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),a=4987,b=21,exact=a*b;
  const rd=(v,s)=>{ const p=M.pow(10,M.floor(M.log10(v))-s+1); return M.round(v/p)*p; };
  const x=d3.scaleLinear().domain([80000,120000]).range([50,W-50]),yl=H/2;
  const draw=s=>{ g.selectAll('*').remove(); const ra=rd(a,s),rb=rd(b,s),est=ra*rb,err=(est-exact)/exact*100;
    ln(g,50,yl,W-50,yl,C.muted,1.5); [80,90,100,110,120].forEach(t=>{ ln(g,x(t*1000),yl-6,x(t*1000),yl+6,C.muted,1); txt(g,x(t*1000),yl+22,t+'k',{anchor:'middle',color:C.muted,size:11,mono:true}); });
    ln(g,x(exact),yl-14,x(est),yl-14,C.am,3); dot(g,x(exact),yl,7,C.gr); dot(g,x(est),yl,7,api.color);
    K.label(g,x(exact),yl-52,'精确 '+exact,'exact',{anchor:'middle',color:C.gr}); K.label(g,x(est),yl+44,'估 '+est,`${ra} × ${rb}`,{anchor:'middle',color:api.color});
    txt(g,W/2,30,`保留 ${s} 位有效数字 → 误差 ${err>0?'+':''}${err.toFixed(2)}%`,{anchor:'middle',size:14});
    txt(g,W/2,H-16,'1 位就够定量级；多留的位数是精度，不是感觉',{anchor:'middle',color:C.muted,size:11}); };
  draw(1); api.slider('有效数字 / sig. digits',1,4,1,1,v=>draw(+v)); return none();
});

def('ns_percent','百分比不对称','Percent asymmetry','先降 p% 再涨 p%，回不到原点：×(1−p)(1+p) = 1−p²。拉 p 看缺口。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),y=d3.scaleLinear().domain([0,130]).range([H-44,30]),xs=[W*.2,W*.5,W*.8],bw=70;
  const draw=p=>{ g.selectAll('*').remove(); const q=p/100,v=[100,100*(1-q),100*(1-q)*(1+q)];
    ln(g,40,y(100),W-40,y(100),C.muted,1,{dash:'4 4'}); txt(g,W-42,y(100)-5,'100',{anchor:'end',color:C.muted,mono:true});
    v.forEach((h,i)=>{ g.append('rect').attr('x',xs[i]-bw/2).attr('y',y(h)).attr('width',bw).attr('height',y(0)-y(h)).attr('fill',[C.muted,C.rd,api.color][i]).attr('rx',4).attr('opacity',.85);
      txt(g,xs[i],y(h)-8,h.toFixed(1),{anchor:'middle',size:14,bold:true,mono:true}); });
    K.label(g,xs[0],H-26,'原价','start',{anchor:'middle'}); K.label(g,xs[1],H-26,`降 ${p}%`,`× (1 − ${q.toFixed(2)})`,{anchor:'middle'}); K.label(g,xs[2],H-26,`再涨 ${p}%`,`× (1 + ${q.toFixed(2)})`,{anchor:'middle'});
    ln(g,xs[2]+bw/2+6,y(100),xs[2]+bw/2+6,y(v[2]),C.am,3); txt(g,xs[2]+bw/2+12,(y(100)+y(v[2]))/2+4,`缺 ${(100-v[2]).toFixed(1)} = 100·p²`,{color:C.am,mono:true}); };
  draw(20); api.slider('p %',0,90,1,20,v=>draw(+v)); return none();
});

def('ns_abacus','算盘：位值制','Abacus place value','点珠子。上珠 = 5，下珠 = 1，每根杆是一个十进位。值 = Σ 位 × 10^k。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),R=5,beam=110,rx=d3.range(R).map(i=>W/2+(i-(R-1)/2)*80),st=d3.range(R).map(()=>({u:0,l:0}));
  const bead=(x,cy,on,cb)=>g.append('ellipse').attr('cx',x).attr('cy',cy).attr('rx',26).attr('ry',13).attr('fill',on?api.color:C.muted).style('cursor','pointer').on('click',cb);
  const draw=()=>{ g.selectAll('*').remove(); g.append('rect').attr('x',W/2-R*40-20).attr('y',beam-4).attr('width',R*80+40).attr('height',8).attr('fill',C.muted); let total=0;
    st.forEach((s,i)=>{ const x=rx[i],v=s.u*5+s.l; total+=v*M.pow(10,R-1-i); ln(g,x,30,x,H-50,C.hair,4);
      bead(x,s.u?beam-24:44,s.u,()=>{s.u^=1;draw();});
      for(let k=0;k<4;k++){ const on=k<s.l; bead(x,on?beam+24+k*28:H-62-(3-k)*28,on,()=>{s.l=on?k:k+1;draw();}); }
      txt(g,x,H-36,String(v),{anchor:'middle',size:16,bold:true,mono:true}); txt(g,x,H-20,'×10^'+(R-1-i),{anchor:'middle',size:10,color:C.muted,mono:true}); });
    K.label(g,20,22,'值 = '+total.toLocaleString(),'value',{size:16,color:api.color}); };
  draw(); api.button('清零 / clear',()=>{st.forEach(s=>{s.u=0;s.l=0;});draw();}); return none();
});

def('ns_factor','因数分解树','Factor tree','每次掰下最小质因数，直到全是质数。滑杆换 n，看树长出来。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const split=n=>{ for(let p=2;p*p<=n;p++) if(n%p===0) return {v:n,children:[{v:p},split(n/p)]}; return {v:n}; };
  const draw=n=>{ g.selectAll('*').remove(); const root=d3.hierarchy(split(n),d=>d.children); d3.tree().size([W-80,H-110])(root); const L=root.leaves().map(d=>d.data.v);
    g.selectAll('line').data(root.links()).join('line').attr('x1',d=>d.source.x+40).attr('y1',d=>d.source.y+40).attr('x2',d=>d.target.x+40).attr('y2',d=>d.target.y+40).attr('stroke',C.hair).attr('stroke-width',2);
    const nd=g.selectAll('g.n').data(root.descendants()).join('g').attr('class','n').attr('transform',d=>`translate(${d.x+40},${d.y+40})`).attr('opacity',0);
    nd.append('circle').attr('r',18).attr('fill',api.color).attr('fill-opacity',d=>d.children?0:.3).attr('stroke',api.color).attr('stroke-width',2);
    nd.append('text').text(d=>d.data.v).attr('text-anchor','middle').attr('dy',5).attr('fill',C.ink).attr('font-size',13).attr('font-weight',600);
    nd.transition().delay(d=>d.depth*220).duration(300).attr('opacity',1);
    K.label(g,20,H-14,`${n} = ${L.join(' × ')}`,'prime factorization (leaves)',{size:14,color:api.color}); };
  draw(360); api.slider('n',2,500,1,360,v=>draw(+v)); return none();
});

def('ns_log_scale','线性 vs 对数轴','Linear vs log axis','同一组数 1,10,100…10⁶：线性轴挤成一团，对数轴等距。按按钮切换看点搬家。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),data=[1,10,100,1e3,1e4,1e5,1e6],yl=H/2;
  const lin=d3.scaleLinear().domain([0,1e6]).range([60,W-40]),log=d3.scaleLog().domain([1,1e6]).range([60,W-40]); let mode='lin';
  ln(g,50,yl,W-30,yl,C.muted,1.5);
  const pts=g.selectAll('circle').data(data).join('circle').attr('cy',yl).attr('r',8).attr('fill',api.color).attr('cx',d=>lin(d));
  const lb=g.selectAll('text.v').data(data).join('text').attr('class','v').attr('y',(d,i)=>yl+(i%2?-18:30)).attr('text-anchor','middle').attr('fill',C.ink2).attr('font-size',11).text(d=>'10^'+M.log10(d)).attr('x',d=>lin(d));
  const msg={lin:['线性轴：前 6 个点叠在一起','linear: first 6 points pile up'],log:['对数轴：每 ×10 走一格，倍数变距离','log: ×10 = one step']};
  const title=K.label(g,W/2,40,msg.lin[0],msg.lin[1],{anchor:'middle',size:14});
  const go=()=>{ mode=mode==='lin'?'log':'lin'; const s=mode==='lin'?lin:log; pts.transition().duration(900).ease(d3.easeCubicInOut).attr('cx',d=>s(d)); lb.transition().duration(900).attr('x',d=>s(d));
    title.selectAll('text').text((d,i)=>msg[mode][i]); };
  api.button('切换 线性/对数 · toggle',go); txt(g,W/2,H-20,'溢出、pH、分贝、震级：全是对数眼镜',{anchor:'middle',color:C.muted,size:11}); return none();
});

def('ns_magnitude','数量级尺子','Orders of magnitude','每 +1 是 ×10。滑杆走一格，世界换一个尺度。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),yl=H/2+20;
  const obj=[[-10,'原子','atom'],[-6,'细菌','bacterium'],[-5,'细胞','cell'],[-3,'蚂蚁','ant'],[0,'人','human'],[4,'城市','city'],[7,'地球','Earth'],[9,'太阳','Sun'],[13,'太阳系','solar system'],[21,'银河系','galaxy'],[26,'可观测宇宙','universe']];
  const x=d3.scaleLinear().domain([-10,26]).range([40,W-40]); ln(g,30,yl,W-30,yl,C.muted,1.5);
  d3.range(-10,27,2).forEach(k=>{ ln(g,x(k),yl-5,x(k),yl+5,C.muted,1); txt(g,x(k),yl+20,k,{anchor:'middle',size:10,color:C.muted,mono:true}); });
  obj.forEach(([k,zh],i)=>{ dot(g,x(k),yl,4,C.ink2); txt(g,x(k),yl-14-(i%2)*14,zh,{anchor:'middle',size:10,color:C.ink2}); });
  const mk=dot(g,x(0),yl,9,api.color),info=svg.append('g');
  const draw=k=>{ mk.transition().duration(200).attr('cx',x(k)); info.selectAll('*').remove();
    const near=obj.reduce((p,c)=>M.abs(c[0]-k)<M.abs(p[0]-k)?c:p),s=k>=0?'1'+'0'.repeat(k):'0.'+'0'.repeat(-k-1)+'1';
    K.label(info,W/2,36,`10^${k} m ≈ ${near[1]}`,near[2],{anchor:'middle',size:18,color:api.color}); txt(info,W/2,84,s,{anchor:'middle',mono:true,color:C.ink2,size:12});
    txt(info,W/2,H-16,`离"人"差 ${M.abs(k)} 个数量级 = ×10^${M.abs(k)}`,{anchor:'middle',size:11,color:C.muted}); };
  draw(0); api.slider('10 的幂 / exponent',-10,26,1,0,v=>draw(+v)); return none();
});

/* ============ al 代数 ============ */
def('al_function_zoo','函数动物园','Function zoo','同一坐标系里换形状：直线、抛物线、根号、指数、对数、倒数、正弦。点按钮看曲线变形。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,34); mgrid(svg,f,W,H);
  const zoo=[['x','line',x=>x],['x²','parabola',x=>x*x],['√x','sqrt',x=>x<0?NaN:M.sqrt(x)],['eˣ','exp',x=>M.exp(x)],['ln x','log',x=>x<=0?NaN:M.log(x)],['1/x','reciprocal',x=>M.abs(x)<.05?NaN:1/x],['sin x','sine',x=>M.sin(x)]];
  const N=240,half=W/f.u/2,xs=d3.range(N+1).map(i=>-half+i*2*half/N),L=d3.line().defined(p=>isFinite(p[1])&&M.abs(p[1])<12).x(p=>f.x(p[0])).y(p=>f.y(p[1]));
  const path=svg.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',2.5),lab=svg.append('g');
  const show=i=>{ const [zh,en,fn]=zoo[i]; path.transition().duration(600).attr('d',L(xs.map(x=>[x,fn(x)]))); lab.selectAll('*').remove(); K.label(lab,16,24,'y = '+zh,en,{size:16,color:api.color}); };
  show(1); zoo.forEach((z,i)=>api.button(z[0],()=>show(i))); return none();
});

def('al_exp_log','指数与对数互为镜像','Exp and log mirror','2ˣ 与 log₂x 关于 y=x 对称。滑杆动 x：线性走 1 步，指数翻倍，对数只挪一点。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,30,W/2-40,H/2+40); mgrid(svg,f,W,H);
  curve(svg,f,x=>x,-8,8,C.muted).attr('stroke-dasharray','4 4'); curve(svg,f,x=>M.pow(2,x),-8,4,C.rd); curve(svg,f,x=>M.log2(x),0.02,12,C.cy);
  K.label(svg,f.x(2.6),f.y(6.5),'2ˣ 指数','exp',{color:C.rd}); K.label(svg,f.x(8),f.y(2.4),'log₂x 对数','log',{color:C.cy}); K.label(svg,f.x(6.2),f.y(6.4),'y = x','mirror',{color:C.muted});
  const g=svg.append('g');
  const draw=x=>{ g.selectAll('*').remove(); const e=M.pow(2,x),l=x>0?M.log2(x):NaN;
    ln(g,f.x(x),f.y(-4),f.x(x),f.y(7),C.hair,1); dot(g,f.x(x),f.y(x),5,C.muted); if(e<8) dot(g,f.x(x),f.y(e),6,C.rd); if(isFinite(l)) dot(g,f.x(x),f.y(l),6,C.cy);
    K.label(g,16,22,`x = ${K.fmt(x,1)}   2ˣ = ${K.fmt(e,2)}   log₂x = ${isFinite(l)?K.fmt(l,2):'—'}`,'linear / exponential / logarithmic',{size:13}); };
  draw(2); api.slider('x',-3,8,.1,2,v=>draw(+v)); return none();
});

def('al_quadratic','二次函数三件套','Quadratic: a, vertex, roots','a 管开口与胖瘦，顶点 x = −b/2a，判别式定几个根。拉三根滑杆。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,28); mgrid(svg,f,W,H); const g=svg.append('g'); let a=1,b=0,c=-2;
  const draw=()=>{ g.selectAll('*').remove(); curve(g,f,x=>a*x*x+b*x+c,-14,14,api.color); const D=b*b-4*a*c,vx=-b/(2*a),vy=a*vx*vx+b*vx+c;
    dot(g,f.x(vx),f.y(vy),6,C.am); K.label(g,f.x(vx)+8,f.y(vy)-8,`顶点 (${K.fmt(vx,1)}, ${K.fmt(vy,1)})`,'vertex',{color:C.am,size:11});
    if(D>=0) [(-b-M.sqrt(D))/(2*a),(-b+M.sqrt(D))/(2*a)].forEach(r=>dot(g,f.x(r),f.y(0),6,C.gr));
    K.label(g,16,22,`y = ${K.fmt(a,1)}x² ${b<0?'−':'+'} ${K.fmt(M.abs(b),1)}x ${c<0?'−':'+'} ${K.fmt(M.abs(c),1)}`,`Δ = b² − 4ac = ${K.fmt(D,1)} → ${D>0?'2 roots':D===0?'1 root':'no real root'}`,{size:14,color:api.color}); };
  draw(); api.slider('a',-3,3,.1,1,v=>{a=+v||.1;draw();}); api.slider('b',-6,6,.1,0,v=>{b=+v;draw();}); api.slider('c',-6,6,.1,-2,v=>{c=+v;draw();}); return none();
});

def('al_inequality_amgm','均值不等式：半圆一眼看穿','AM-GM in a semicircle','直径分成 a、b：半径 = (a+b)/2，分点竖线高 = √(ab)。竖线永远够不到半径，只有 a=b 时相等。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),R=M.min(W*.35,H-100),L=2*R,x0=(W-L)/2,y0=H-66,S=10,cx=x0+R;
  const draw=a=>{ g.selectAll('*').remove(); const b=S-a,px=x0+a/S*L,h=M.sqrt(a*b)/S*L;
    g.append('path').attr('d',`M${x0},${y0} A${R},${R} 0 0 1 ${x0+L},${y0}`).attr('fill','none').attr('stroke',C.hair).attr('stroke-width',2);
    ln(g,x0,y0,x0+L,y0,C.ink2,2); ln(g,x0,y0+14,px,y0+14,C.cy,4); ln(g,px,y0+14,x0+L,y0+14,C.vi,4);
    K.label(g,(x0+px)/2,y0+36,`a = ${K.fmt(a,1)}`,'',{anchor:'middle',color:C.cy}); K.label(g,(px+x0+L)/2,y0+36,`b = ${K.fmt(b,1)}`,'',{anchor:'middle',color:C.vi});
    ln(g,cx,y0,cx,y0-R,C.am,3); K.label(g,cx+6,y0-R+14,`半径 (a+b)/2 = ${K.fmt(S/2,2)}`,'AM',{color:C.am,size:12});
    ln(g,px,y0,px,y0-h,C.gr,3); dot(g,px,y0-h,5,C.gr); K.label(g,px+6,y0-h-6,`高 √(ab) = ${K.fmt(M.sqrt(a*b),2)}`,'GM',{color:C.gr,size:12}); dot(g,px,y0,5,C.ink);
    txt(g,W/2,26,M.abs(a-b)<1e-9?'a = b：两线等长，取等':'(a+b)/2 ≥ √(ab)，分得越偏差距越大',{anchor:'middle',size:14,color:M.abs(a-b)<1e-9?C.gr:C.ink}); };
  draw(3); api.slider('a（a + b 固定 = 10）',0.2,9.8,.1,3,v=>draw(+v)); return none();
});

def('al_substitution','换元：把四次变二次','Substitution t = x²','x⁴−5x²+4 看着凶，令 t=x² 就是 t²−5t+4=(t−1)(t−4)。左图 x 世界，右图 t 世界，一个点同步走。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),F=x=>x*x*x*x-5*x*x+4,G=t=>t*t-5*t+4;
  const half=(i,f,fn,x0,x1,color)=>{ const id=uid('c'); svg.append('defs').append('clipPath').attr('id',id).append('rect').attr('x',i?W/2+4:0).attr('y',0).attr('width',W/2-4).attr('height',H);
    const g=svg.append('g').attr('clip-path',`url(#${id})`); mgrid(g,f,W,H); curve(g,f,fn,x0,x1,color); return g; };
  const fl=frame(W,H,26,W*.25,H*.58),fr=frame(W,H,26,W*.75,H*.58);
  half(0,fl,F,-2.6,2.6,api.color); half(1,fr,G,-2,7,C.vi); ln(svg,W/2,0,W/2,H,C.hair,1);
  K.label(svg,10,20,'x 世界：x⁴ − 5x² + 4','roots ±1, ±2',{color:api.color,size:12}); K.label(svg,W/2+10,20,'t 世界：t² − 5t + 4','t = x² → roots 1, 4',{color:C.vi,size:12});
  const g=svg.append('g');
  const draw=x=>{ g.selectAll('*').remove(); const t=x*x,y=F(x);
    dot(g,fl.x(x),fl.y(y),6,api.color); dot(g,fr.x(t),fr.y(y),6,C.vi); ln(g,fl.x(x),fl.y(y),fr.x(t),fr.y(y),C.am,1,{dash:'3 3'});
    txt(g,W/2,H-12,`x = ${K.fmt(x,2)} → t = x² = ${K.fmt(t,2)} → y = ${K.fmt(y,2)}（两边同一个 y）`,{anchor:'middle',size:12,mono:true}); };
  draw(1.5); api.slider('x',-2.5,2.5,.05,1.5,v=>draw(+v)); return none();
});

def('al_polynomial','多项式 = 根的乘积','Polynomial from roots','拖 x 轴上的三个根，曲线跟着走：(x−r₁)(x−r₂)(x−r₃)。远处像 x³，近处被根牵着穿越。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,40); mgrid(svg,f,W,H); const r=[-2,.5,2.5],g=svg.append('g'),hg=svg.append('g'),lab=svg.append('g');
  const P=x=>.5*(x-r[0])*(x-r[1])*(x-r[2]);
  const draw=()=>{ g.selectAll('*').remove(); lab.selectAll('*').remove(); curve(g,f,P,-f.cx/f.u-1,(W-f.cx)/f.u+1,api.color);
    const e1=r[0]+r[1]+r[2],e2=r[0]*r[1]+r[0]*r[2]+r[1]*r[2],e3=r[0]*r[1]*r[2];
    K.label(lab,12,20,`0.5·(x − ${K.fmt(r[0],1)})(x − ${K.fmt(r[1],1)})(x − ${K.fmt(r[2],1)})`,`= 0.5(x³ − ${K.fmt(e1,1)}x² + ${K.fmt(e2,1)}x − ${K.fmt(e3,1)})   Vieta`,{size:12,color:api.color}); };
  r.forEach((v,i)=>handle(svg,hg,f.x(v),f.y(0),C.am,mx=>{ r[i]=M.max(-6,M.min(6,f.ix(mx))); mv(hg,i,f.x(r[i]),f.y(0)); draw(); }));
  draw(); return none();
});

def('al_system_eq','方程组 = 两条线的交点','System = intersection','拉第二条线的斜率与截距：交点唯一 → 一解；平行 → 无解；重合 → 无穷解。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,34); mgrid(svg,f,W,H); const g=svg.append('g'),m1=.5,c1=1; let m2=-1,c2=3;
  const draw=()=>{ g.selectAll('*').remove(); curve(g,f,x=>m1*x+c1,-14,14,C.cy); curve(g,f,x=>m2*x+c2,-14,14,C.vi);
    K.label(g,12,20,'L₁: y = 0.5x + 1','',{color:C.cy,size:12}); K.label(g,12,40,`L₂: y = ${K.fmt(m2,2)}x ${c2<0?'−':'+'} ${K.fmt(M.abs(c2),1)}`,'',{color:C.vi,size:12});
    const para=M.abs(m1-m2)<1e-6; let zh,en;
    if(!para){ const x=(c2-c1)/(m1-m2),y=m1*x+c1; dot(g,f.x(x),f.y(y),7,C.am); zh=`唯一解 (${K.fmt(x,2)}, ${K.fmt(y,2)})`; en='one solution: det ≠ 0'; }
    else if(M.abs(c1-c2)<1e-6){ zh='重合：无穷多解'; en='same line: infinite solutions'; } else { zh='平行：无解'; en='parallel: no solution (det = 0)'; }
    K.label(g,W-12,20,zh,en,{anchor:'end',size:14,color:para?C.rd:C.am}); };
  draw(); api.slider('L₂ 斜率 / slope',-3,3,.05,-1,v=>{m2=+v;draw();}); api.slider('L₂ 截距 / intercept',-5,5,.1,3,v=>{c2=+v;draw();}); return none();
});

def('al_sequence','等差 vs 等比','Arithmetic vs geometric','等差每步 +d，是直线；等比每步 ×r，是指数。滑杆走 n，看两列点拉开距离。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),d=3,r=1.5,N=16;
  const x=d3.scaleLinear().domain([0,N]).range([50,W-30]),y=d3.scaleLinear().domain([0,60]).range([H-40,30]);
  ln(g,50,y(0),W-30,y(0),C.muted,1); ln(g,50,y(0),50,30,C.muted,1); const gg=svg.append('g');
  const draw=n=>{ gg.selectAll('*').remove(); let sa=0,sg=0;
    for(let k=0;k<=n;k++){ const a=1+k*d,q=M.pow(r,k); sa+=a; sg+=q; dot(gg,x(k),y(M.min(a,60)),5,C.cy); if(q<=60) dot(gg,x(k),y(q),5,C.rd); else txt(gg,x(k),34,'↑',{anchor:'middle',color:C.rd}); }
    K.label(gg,W-12,20,`等差 aₙ = 1 + 3n = ${1+n*d}，前 n 项和 ${sa}`,'arithmetic  Sₙ = n(a₁+aₙ)/2',{anchor:'end',color:C.cy,size:12});
    K.label(gg,W-12,54,`等比 bₙ = 1.5ⁿ = ${K.fmt(M.pow(r,n),1)}，和 ${K.fmt(sg,1)}`,'geometric  Sₙ = (rⁿ⁺¹−1)/(r−1)',{anchor:'end',color:C.rd,size:12}); };
  draw(5); api.slider('n',0,N,1,5,v=>draw(+v)); return none();
});

def('al_trig','三角函数三参数','A·sin(ωx + φ)','振幅 A 拉高，频率 ω 压密，相位 φ 平移。三根滑杆各管一件事。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,40); mgrid(svg,f,W,H); const g=svg.append('g'); let Am=1,w=1,ph=0;
  curve(svg,f,x=>M.sin(x),-12,12,C.muted).attr('stroke-dasharray','4 4');
  const draw=()=>{ g.selectAll('*').remove(); curve(g,f,x=>Am*M.sin(w*x+ph),-12,12,api.color); const s=-ph/w;
    ln(g,f.x(s),f.y(-.3),f.x(s),f.y(.3),C.am,2); ln(g,f.x(s),f.y(0),f.x(s+2*PI/w),f.y(0),C.gr,4).attr('opacity',.6);
    K.label(g,12,20,`y = ${K.fmt(Am,1)}·sin(${K.fmt(w,1)}x ${ph<0?'−':'+'} ${K.fmt(M.abs(ph),1)})`,`period 2π/ω = ${K.fmt(2*PI/w,2)},  shift −φ/ω = ${K.fmt(s,2)}`,{size:13,color:api.color});
    txt(g,W-12,20,'虚线 = sin x 基准',{anchor:'end',color:C.muted,size:11}); };
  draw(); api.slider('A 振幅 / amplitude',0.2,3,.1,1,v=>{Am=+v;draw();}); api.slider('ω 频率 / frequency',0.2,4,.1,1,v=>{w=+v;draw();}); api.slider('φ 相位 / phase',-3.2,3.2,.1,0,v=>{ph=+v;draw();}); return none();
});

/* ============ ge 几何 ============ */
def('ge_vector','向量 = 箭头 = 一对数','Vector: arrow and numbers','拖箭头尖。分量 (x, y) 是影子，长度是勾股，角度是 atan2。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,36); mgrid(svg,f,W,H); const mk=K.arrow(svg,uid('v'),api.color),g=svg.append('g'),hg=svg.append('g'); let v=[3,2];
  const draw=()=>{ g.selectAll('*').remove(); const [x,y]=v; ln(g,f.x(x),f.y(0),f.x(x),f.y(y),C.hair,1,{dash:'4 3'}); ln(g,f.x(0),f.y(y),f.x(x),f.y(y),C.hair,1,{dash:'4 3'});
    ln(g,f.x(0),f.y(0),f.x(x),f.y(0),C.cy,3); ln(g,f.x(x),f.y(0),f.x(x),f.y(y),C.vi,3); vec(g,f,x,y,api.color,mk,3);
    txt(g,f.x(x/2),f.y(0)+16,`x = ${K.fmt(x,1)}`,{anchor:'middle',color:C.cy,mono:true}); txt(g,f.x(x)+8,f.y(y/2)+4,`y = ${K.fmt(y,1)}`,{color:C.vi,mono:true});
    K.label(g,12,20,`|v| = √(x² + y²) = ${K.fmt(M.hypot(x,y),2)}`,`angle = atan2(y, x) = ${K.fmt(M.atan2(y,x)*180/PI,1)}°`,{size:13,color:api.color}); };
  handle(svg,hg,f.x(3),f.y(2),api.color,(mx,my)=>{ v=[f.ix(mx),f.iy(my)]; mv(hg,0,mx,my); draw(); }); draw(); return none();
});

def('ge_dot_projection','点积 = 投影 × 长度','Dot = projection × length','拖 b。b 在 a 上的影子长 = |b|cosθ，点积 = |a| × 影子。同向为正，垂直为 0，反向为负。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,34); mgrid(svg,f,W,H); const ma=K.arrow(svg,uid('a'),C.cy),mb=K.arrow(svg,uid('b'),C.vi),a=[4,1],g=svg.append('g'),hg=svg.append('g'); let b=[2,3];
  const draw=()=>{ g.selectAll('*').remove(); const la=M.hypot(a[0],a[1]),lb=M.hypot(b[0],b[1])||1e-9,d=a[0]*b[0]+a[1]*b[1],s=d/la,p=[a[0]/la*s,a[1]/la*s],th=M.acos(M.max(-1,M.min(1,d/(la*lb))))*180/PI;
    ln(g,f.x(-a[0]*3),f.y(-a[1]*3),f.x(a[0]*3),f.y(a[1]*3),C.hair,1.5); ln(g,f.x(0),f.y(0),f.x(p[0]),f.y(p[1]),d>=0?C.gr:C.rd,7).attr('opacity',.6); ln(g,f.x(b[0]),f.y(b[1]),f.x(p[0]),f.y(p[1]),C.am,1.5,{dash:'4 3'});
    vec(g,f,a[0],a[1],C.cy,ma); vec(g,f,b[0],b[1],C.vi,mb); K.label(g,f.x(a[0])+6,f.y(a[1]),'a','',{color:C.cy}); K.label(g,f.x(b[0])+6,f.y(b[1]),'b','',{color:C.vi});
    K.label(g,12,20,`a·b = ${K.fmt(d,2)}   影子 = ${K.fmt(s,2)}   |a| = ${K.fmt(la,2)}`,`a·b = |a||b|cosθ,  θ = ${K.fmt(th,1)}°`,{size:13,color:d>=0?C.gr:C.rd}); };
  handle(svg,hg,f.x(2),f.y(3),C.vi,(mx,my)=>{ b=[f.ix(mx),f.iy(my)]; mv(hg,0,mx,my); draw(); }); draw(); return none();
});

def('ge_unit_circle','单位圆转出正弦余弦','Unit circle → sin / cos','点绕圆转：高度是 sin，横坐标是 cos。把高度随时间摊开，就是波。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),R=M.min(H*.36,W*.18),cx=R+40,cy=H/2,x0=cx+R+40,L=W-x0-20,g=svg.append('g');
  svg.append('circle').attr('cx',cx).attr('cy',cy).attr('r',R).attr('fill','none').attr('stroke',C.hair).attr('stroke-width',1.5);
  ln(svg,cx-R-10,cy,cx+R+10,cy,C.muted,1); ln(svg,cx,cy-R-10,cx,cy+R+10,C.muted,1); ln(svg,x0,cy,W-20,cy,C.muted,1);
  const sp=svg.append('path').attr('fill','none').attr('stroke',C.rd).attr('stroke-width',2),cp=svg.append('path').attr('fill','none').attr('stroke',C.cy).attr('stroke-width',2);
  K.label(svg,x0,24,'sin θ = 高度','red',{color:C.rd,size:12}); K.label(svg,x0+120,24,'cos θ = 横坐标','cyan',{color:C.cy,size:12});
  let speed=1,th=0,last=null;
  const stop=api.play(t=>{ if(last==null) last=t; th+=(t-last)*speed; last=t; const px=cx+R*M.cos(th),py=cy-R*M.sin(th); g.selectAll('*').remove();
    ln(g,cx,cy,px,py,C.ink,2); ln(g,px,cy,px,py,C.rd,3); ln(g,cx,cy,px,cy,C.cy,3); dot(g,px,py,6,api.color); ln(g,px,py,x0,py,C.rd,1,{dash:'3 3'});
    const pts=d3.range(0,L,2).map(x=>[x0+x,th-x/L*3*PI]); sp.attr('d',d3.line()(pts.map(([x,u])=>[x,cy-R*M.sin(u)]))); cp.attr('d',d3.line()(pts.map(([x,u])=>[x,cy-R*M.cos(u)])));
    txt(g,cx,cy+R+26,`θ = ${K.fmt(((th%(2*PI))+2*PI)%(2*PI)*180/PI,0)}°  sin = ${K.fmt(M.sin(th),2)}  cos = ${K.fmt(M.cos(th),2)}`,{anchor:'middle',mono:true,size:12}); });
  api.slider('转速 / speed',0,3,.1,1,v=>{speed=+v;}); return {stop(){ if(typeof stop==='function') stop(); }};
});

def('ge_conic','圆锥曲线：一个 e 全家','Conics by eccentricity','到焦点距离 ÷ 到准线距离 = e。e<1 椭圆，e=1 抛物线，e>1 双曲线。拉 e 看一条曲线变三种。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,40,W*.45,H/2); mgrid(svg,f,W,H); const g=svg.append('g'),d=2;
  const draw=e=>{ g.selectAll('*').remove(); const pts=[];
    for(let i=0;i<=720;i++){ const th=-PI+i*2*PI/720,den=1+e*M.cos(th); const r=den>.03?e*d/den:Infinity; pts.push(r<40?[r*M.cos(th),r*M.sin(th)]:null); }
    g.append('path').attr('d',L2(f)(pts)).attr('fill','none').attr('stroke',api.color).attr('stroke-width',2.5);
    dot(g,f.x(0),f.y(0),6,C.am); K.label(g,f.x(0)+8,f.y(0)-8,'焦点','focus',{color:C.am,size:11}); ln(g,f.x(d),0,f.x(d),H,C.vi,2,{dash:'6 4'}); K.label(g,f.x(d)+6,H-30,'准线','directrix',{color:C.vi,size:11});
    const th=1.1,r=e*d/(1+e*M.cos(th)),P=[r*M.cos(th),r*M.sin(th)]; ln(g,f.x(0),f.y(0),f.x(P[0]),f.y(P[1]),C.am,1.5); ln(g,f.x(P[0]),f.y(P[1]),f.x(d),f.y(P[1]),C.vi,1.5); dot(g,f.x(P[0]),f.y(P[1]),4,C.ink);
    const kind=e<1?['椭圆','ellipse']:M.abs(e-1)<1e-9?['抛物线','parabola']:['双曲线','hyperbola'];
    K.label(g,12,20,`e = ${K.fmt(e,2)}  →  ${kind[0]}`,`${kind[1]}:  dist(focus) / dist(directrix) = e`,{size:14,color:api.color}); };
  draw(.6); api.slider('e 离心率 / eccentricity',0.05,2,.05,.6,v=>draw(+v)); return none();
});

def('ge_transform','变换 = 矩阵动作','Transformations','同一个"F"：旋转、缩放、剪切、反射，都是 2×2 矩阵乘一下。点按钮看它动。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,40); mgrid(svg,f,W,H);
  const F=[[0,0],[0,3],[2,3],[2,2.4],[.8,2.4],[.8,1.7],[1.7,1.7],[1.7,1.1],[.8,1.1],[.8,0]];
  poly(svg,f,F,C.muted,{close:true,fill:C.muted,fo:.15}); const shape=poly(svg,f,F,api.color,{close:true,fill:api.color,fo:.25}),lab=svg.append('g');
  const ops=[['旋转 rotate 45°',rot(PI/4)],['缩放 scale',mat(1.5,0,0,.6)],['剪切 shear',mat(1,.8,0,1)],['反射 reflect',mat(-1,0,0,1)],['复位 identity',I]]; let cur=I;
  const go=(name,m)=>{ const from=cur; cur=m; lab.selectAll('*').remove(); K.label(lab,12,20,name,mstr(m,2),{size:14,color:api.color});
    shape.transition().duration(800).attrTween('d',()=>t=>{ const mm=lerpM(from,m,t); return L2(f)(F.map(p=>mm.ap(p[0],p[1])))+'Z'; }); };
  ops.forEach(([n,m])=>api.button(n,()=>go(n,m))); go('原样 identity',I); return none();
});

def('ge_distance','距离 = 勾股','Distance = Pythagoras','拖两个点。dx、dy 围成直角，斜边 √(dx²+dy²) 是欧氏距离；走格子 |dx|+|dy| 是曼哈顿。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,36); mgrid(svg,f,W,H); const P=[[-3,-1],[3,2]],g=svg.append('g'),hg=svg.append('g');
  const draw=()=>{ g.selectAll('*').remove(); const [a,b]=P,dx=b[0]-a[0],dy=b[1]-a[1],sx=M.sign(dx)||1,sy=M.sign(dy)||1;
    ln(g,f.x(a[0]),f.y(a[1]),f.x(b[0]),f.y(a[1]),C.cy,3); ln(g,f.x(b[0]),f.y(a[1]),f.x(b[0]),f.y(b[1]),C.vi,3); ln(g,f.x(a[0]),f.y(a[1]),f.x(b[0]),f.y(b[1]),api.color,3);
    g.append('path').attr('d',`M${f.x(b[0])-12*sx},${f.y(a[1])} v${-12*sy} h${12*sx}`).attr('fill','none').attr('stroke',C.am).attr('stroke-width',1.5);
    txt(g,f.x(a[0]+dx/2),f.y(a[1])+18,`dx = ${K.fmt(dx,1)}`,{anchor:'middle',color:C.cy,mono:true}); txt(g,f.x(b[0])+8,f.y(a[1]+dy/2)+4,`dy = ${K.fmt(dy,1)}`,{color:C.vi,mono:true});
    K.label(g,12,20,`欧氏 √(dx² + dy²) = ${K.fmt(M.hypot(dx,dy),2)}`,'Euclidean (L2)',{size:13,color:api.color}); K.label(g,12,52,`曼哈顿 |dx| + |dy| = ${K.fmt(M.abs(dx)+M.abs(dy),2)}`,'Manhattan (L1)',{size:13,color:C.am}); };
  P.forEach((p,i)=>handle(svg,hg,f.x(p[0]),f.y(p[1]),i?C.vi:C.cy,(mx,my)=>{ P[i]=[f.ix(mx),f.iy(my)]; mv(hg,i,mx,my); draw(); })); draw(); return none();
});

def('ge_area_cross','叉积 = 平行四边形面积','Cross = parallelogram area','拖两个向量。面积 = |x₁y₂ − x₂y₁|；符号看方向：逆时针为正（绿），顺时针为负（红）。三角形面积是一半。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,36); mgrid(svg,f,W,H); const m1=K.arrow(svg,uid('u'),C.cy),m2=K.arrow(svg,uid('v'),C.vi),V=[[3,1],[1,2.5]],g=svg.append('g'),hg=svg.append('g');
  const draw=()=>{ g.selectAll('*').remove(); const [u,v]=V,cr=u[0]*v[1]-u[1]*v[0],col=cr>=0?C.gr:C.rd;
    poly(g,f,[[0,0],u,[u[0]+v[0],u[1]+v[1]],v],col,{close:true,fill:col,fo:.22});
    vec(g,f,u[0],u[1],C.cy,m1); vec(g,f,v[0],v[1],C.vi,m2); K.label(g,f.x(u[0])+6,f.y(u[1]),'u','',{color:C.cy}); K.label(g,f.x(v[0])+6,f.y(v[1]),'v','',{color:C.vi});
    K.label(g,12,20,`u×v = ${K.fmt(u[0],1)}·${K.fmt(v[1],1)} − ${K.fmt(u[1],1)}·${K.fmt(v[0],1)} = ${K.fmt(cr,2)}`,`area = |u×v| = ${K.fmt(M.abs(cr),2)},  sign: ${cr>=0?'CCW +':'CW −'}`,{size:13,color:col}); };
  V.forEach((p,i)=>handle(svg,hg,f.x(p[0]),f.y(p[1]),i?C.vi:C.cy,(mx,my)=>{ V[i]=[f.ix(mx),f.iy(my)]; mv(hg,i,mx,my); draw(); })); draw(); return none();
});

def('ge_similar','相似：长 ×k，面积 ×k²','Similar: length k, area k²','拉放大倍数 k。每条边乘 k，面积却乘 k²，因为面积是两个长度相乘。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=[[0,0],[4,0],[1,3]],f=frame(W,H,28,60,H-50),area=k=>6*k*k,bx=W-150,by=40;
  const bar=(x,frac,col)=>{ g.append('rect').attr('x',x).attr('y',by).attr('width',30).attr('height',120).attr('fill',C.hair); g.append('rect').attr('x',x).attr('y',by+120-120*frac).attr('width',30).attr('height',120*frac).attr('fill',col); };
  const draw=k=>{ g.selectAll('*').remove(); const S=T.map(p=>[p[0]*k,p[1]*k]);
    poly(g,f,T,C.muted,{close:true,fill:C.muted,fo:.25}); poly(g,f,S,api.color,{close:true,fill:api.color,fo:.18}); T.forEach((p,i)=>ln(g,f.x(p[0]),f.y(p[1]),f.x(S[i][0]),f.y(S[i][1]),C.hair,1,{dash:'3 3'}));
    txt(g,f.x(2*k),f.y(0)+16,`底 4k = ${K.fmt(4*k,1)}`,{anchor:'middle',color:api.color,mono:true,size:11}); txt(g,f.x(k)-6,f.y(1.5*k),`高 3k = ${K.fmt(3*k,1)}`,{anchor:'end',color:api.color,mono:true,size:11});
    bar(bx,M.min(1,k/2.5),C.cy); bar(bx+50,M.min(1,k*k/6.25),C.am);
    K.label(g,bx-4,by+140,`边 ×${K.fmt(k,1)}`,'length',{size:11,color:C.cy}); K.label(g,bx+46,by+140,`积 ×${K.fmt(k*k,2)}`,'area',{size:11,color:C.am});
    K.label(g,12,20,`k = ${K.fmt(k,1)}：面积 ${area(1)} → ${K.fmt(area(k),1)}`,`ratio ${K.fmt(k*k,2)} = k²`,{size:14,color:api.color}); };
  draw(1.6); api.slider('k 放大倍数 / scale',0.5,2.5,.1,1.6,v=>draw(+v)); return none();
});

/* ============ la 线性代数 ============ */
def('la_matrix_transform','矩阵 = 网格怎么变形','Matrix warps the grid','四根滑杆是矩阵四个数。列向量 = î、ĵ 落在哪里；整张网格跟着走。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,36); mgrid(svg,f,W,H); const mi=K.arrow(svg,uid('i'),C.gr),mj=K.arrow(svg,uid('j'),C.rd),g=svg.append('g'); let m=mat(1,.5,0,1);
  const draw=()=>{ g.selectAll('*').remove(); tgrid(g,f,m,8,api.color); vec(g,f,m.a,m.c,C.gr,mi,3); vec(g,f,m.b,m.d,C.rd,mj,3);
    K.label(g,f.x(m.a)+6,f.y(m.c),'î → 第一列','(a, c)',{color:C.gr,size:11}); K.label(g,f.x(m.b)+6,f.y(m.d),'ĵ → 第二列','(b, d)',{color:C.rd,size:11});
    K.label(g,12,20,`A = ${mstr(m)}`,`det = ${K.fmt(m.a*m.d-m.b*m.c,2)}  (area scale)`,{size:14,color:api.color}); };
  draw(); ['a','b','c','d'].forEach((k,i)=>api.slider(k,-2,2,.1,[1,.5,0,1][i],x=>{ m=setM(m,k,x); draw(); })); return none();
});

def('la_eigen','特征向量：方向不变的那几条','Eigenvectors keep direction','一圈单位向量被 A 打过去（灰 → 彩）。大多数被拧歪，只有特征方向上的箭头只伸缩不转，λ 就是伸缩倍数。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,44); mgrid(svg,f,W,H); const g=svg.append('g'); let m=mat(2,1,1,2);
  const draw=()=>{ g.selectAll('*').remove(); const E=eig2(m);
    for(let k=0;k<36;k++){ const t=k*PI/18,x=M.cos(t),y=M.sin(t),[u,v]=m.ap(x,y),al=!!E&&M.abs(x*v-y*u)/(M.hypot(u,v)||1)<.04;
      ln(g,f.x(0),f.y(0),f.x(x),f.y(y),C.hair,1); ln(g,f.x(x),f.y(y),f.x(u),f.y(v),al?C.am:C.muted,al?2.5:1).attr('opacity',al?1:.6); dot(g,f.x(u),f.y(v),al?4:2.5,al?C.am:api.color); }
    if(E) E.forEach((e,i)=>{ const [x,y]=e.v; ln(g,f.x(-9*x),f.y(-9*y),f.x(9*x),f.y(9*y),C.am,1,{dash:'5 4'}).attr('opacity',.5); ln(g,f.x(0),f.y(0),f.x(x*e.l),f.y(y*e.l),C.am,3);
      K.label(g,f.x(x*e.l)+6,f.y(y*e.l)-4,`λ${i+1} = ${K.fmt(e.l,2)}`,`v = (${K.fmt(x,2)}, ${K.fmt(y,2)})`,{color:C.am,size:11}); });
    K.label(g,12,20,`A = ${mstr(m)}`,E?'2 real eigen-directions (amber): Av = λv':'no real eigenvector: rotation twists every direction',{size:14,color:api.color}); };
  draw(); ['a','b','c','d'].forEach((k,i)=>api.slider(k,-2,3,.1,[2,1,1,2][i],x=>{ m=setM(m,k,x); draw(); })); return none();
});

def('la_svd','SVD：转 → 拉 → 转','SVD = rotate, stretch, rotate','任何矩阵 = Vᵀ 旋转 · Σ 沿轴拉伸 · U 再旋转。滑杆走 0→3，看单位圆一步步变成椭圆。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,44); mgrid(svg,f,W,H); const m1=K.arrow(svg,uid('p'),C.gr),m2=K.arrow(svg,uid('q'),C.rd),Am=mat(1.6,1,.4,1.2),S=svd2(Am),g=svg.append('g'),circ=d3.range(73).map(i=>[M.cos(i*PI/36),M.sin(i*PI/36)]);
  const at=t=>{ const s1=M.min(1,t),s2=M.max(0,M.min(1,t-1)),s3=M.max(0,M.min(1,t-2)); return mul(rot(S.gamma*s3),mul(mat(1+(S.s1-1)*s2,0,0,1+(S.s2-1)*s2),rot(S.beta*s1))); };
  const draw=t=>{ g.selectAll('*').remove(); const m=at(t); tgrid(g,f,m,6,api.color).attr('opacity',.35); poly(g,f,circ.map(p=>m.ap(p[0],p[1])),api.color,{fill:api.color,fo:.15});
    vec(g,f,m.a,m.c,C.gr,m1,3); vec(g,f,m.b,m.d,C.rd,m2,3);
    const ph=t<1?['第 1 步：Vᵀ 旋转',`rotate by β = ${K.fmt(S.beta*180/PI,1)}°`]:t<2?['第 2 步：Σ 沿轴拉伸',`σ₁ = ${K.fmt(S.s1,2)},  σ₂ = ${K.fmt(S.s2,2)}`]:['第 3 步：U 再旋转',`rotate by γ = ${K.fmt(S.gamma*180/PI,1)}°`];
    K.label(g,12,20,ph[0],ph[1],{size:14,color:api.color}); txt(g,W-12,20,`A = ${mstr(Am)}`,{anchor:'end',mono:true,color:C.ink2,size:12}); txt(g,W-12,H-14,'t = 3 时正好等于直接乘 A',{anchor:'end',color:C.muted,size:11}); };
  draw(0); api.slider('t（0→3 三步）',0,3,.02,0,v=>draw(+v)); return none();
});

def('la_rank','秩 = 张成的维数','Rank = dimension spanned','拉第二列，让它越来越像第一列的倍数：平行四边形压扁成线，秩 2 → 1，行列式 → 0。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,40); mgrid(svg,f,W,H); const m1=K.arrow(svg,uid('r'),C.cy),m2=K.arrow(svg,uid('s'),C.vi),u=[3,1],v0=[-1,2.5],v1=[2.4,.8],g=svg.append('g');
  const draw=t=>{ g.selectAll('*').remove(); const v=[v0[0]+(v1[0]-v0[0])*t,v0[1]+(v1[1]-v0[1])*t],det=u[0]*v[1]-u[1]*v[0],rank=M.abs(det)<.05?1:2,col=rank===2?C.gr:C.rd;
    poly(g,f,[[0,0],u,[u[0]+v[0],u[1]+v[1]],v],col,{close:true,fill:col,fo:.2});
    for(let i=-3;i<=3;i++) for(let j=-3;j<=3;j++) dot(g,f.x(u[0]*i+v[0]*j),f.y(u[1]*i+v[1]*j),2,C.hair);
    vec(g,f,u[0],u[1],C.cy,m1,3); vec(g,f,v[0],v[1],C.vi,m2,3);
    K.label(g,12,20,`秩 rank = ${rank}`,`det = ${K.fmt(det,2)};  columns ${rank===2?'independent → span the plane':'dependent → span only a line'}`,{size:15,color:col}); };
  draw(0); api.slider('第二列 → 第一列的倍数 / t',0,1,.01,0,v=>draw(+v)); return none();
});

def('la_inverse','逆矩阵 = 倒着走回去','Inverse undoes','0→1 用 A 把网格变形，1→2 用 A⁻¹ 变回来。det = 0 的矩阵把平面压扁，回不去，所以没有逆。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,40); mgrid(svg,f,W,H); const Am=mat(1,1,.5,2),det=Am.a*Am.d-Am.b*Am.c,Ai=mat(Am.d/det,-Am.b/det,-Am.c/det,Am.a/det),g=svg.append('g'),sq=[[0,0],[1,0],[1,1],[0,1]]; let stopper=null;
  const draw=t=>{ g.selectAll('*').remove(); const m=t<=1?lerpM(I,Am,t):lerpM(Am,I,t-1); tgrid(g,f,m,7,api.color); poly(g,f,sq.map(p=>m.ap(p[0],p[1])),C.am,{close:true,fill:C.am,fo:.3});
    const ph=t<=1?['去：乘 A',`A = ${mstr(Am)}`]:['回：乘 A⁻¹',`A⁻¹ = ${mstr(Ai,2)}   (A⁻¹A = I)`]; K.label(g,12,20,ph[0],ph[1],{size:14,color:api.color});
    txt(g,W-12,20,`det A = ${K.fmt(det,2)} ≠ 0 → 可逆 invertible`,{anchor:'end',color:C.ink2,size:12,mono:true}); };
  draw(0); const sl=api.slider('t（0→1 乘 A，1→2 乘 A⁻¹）',0,2,.02,0,v=>draw(+v));
  api.button('自动播放 / auto',()=>{ if(stopper) stopper(); let t0=null; stopper=api.play(tt=>{ if(t0==null) t0=tt; const t=M.min(2,(tt-t0)*.6); draw(t); if(sl&&sl.value!==undefined) sl.value=t; if(t>=2&&stopper){ stopper(); stopper=null; } }); });
  return {stop(){ if(stopper) stopper(); }};
});

def('la_basis','基 = 换一套坐标尺','Basis = a choice of rulers','同一个点：标准基 (î, ĵ) 下的坐标是白字，新基 (b₁, b₂) 下的坐标是彩字。拖点看两套坐标各自怎么变。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,40); mgrid(svg,f,W,H); const B=mat(2,.5,.5,1.5); tgrid(svg,f,B,6,api.color).attr('opacity',.45);
  const m1=K.arrow(svg,uid('b1'),C.cy),m2=K.arrow(svg,uid('b2'),C.vi); vec(svg,f,B.a,B.c,C.cy,m1,3); vec(svg,f,B.b,B.d,C.vi,m2,3);
  K.label(svg,f.x(B.a)+6,f.y(B.c)+4,'b₁','(2, 0.5)',{color:C.cy,size:11}); K.label(svg,f.x(B.b)+6,f.y(B.d)-4,'b₂','(0.5, 1.5)',{color:C.vi,size:11});
  const det=B.a*B.d-B.b*B.c,Bi=mat(B.d/det,-B.b/det,-B.c/det,B.a/det),g=svg.append('g'),hg=svg.append('g'); let p=[3,2];
  const draw=()=>{ g.selectAll('*').remove(); const [c1,c2]=Bi.ap(p[0],p[1]);
    ln(g,f.x(0),f.y(0),f.x(B.a*c1),f.y(B.c*c1),C.cy,4).attr('opacity',.5); ln(g,f.x(B.a*c1),f.y(B.c*c1),f.x(p[0]),f.y(p[1]),C.vi,4).attr('opacity',.5);
    ln(g,f.x(p[0]),f.y(0),f.x(p[0]),f.y(p[1]),C.hair,1,{dash:'3 3'}); ln(g,f.x(0),f.y(p[1]),f.x(p[0]),f.y(p[1]),C.hair,1,{dash:'3 3'});
    K.label(g,12,20,`标准基坐标 (${K.fmt(p[0],2)}, ${K.fmt(p[1],2)})`,'standard basis',{size:13}); K.label(g,12,52,`新基坐标 (${K.fmt(c1,2)}, ${K.fmt(c2,2)})`,'x = c₁b₁ + c₂b₂  →  c = B⁻¹x',{size:13,color:api.color}); };
  handle(svg,hg,f.x(3),f.y(2),C.am,(mx,my)=>{ p=[f.ix(mx),f.iy(my)]; mv(hg,0,mx,my); draw(); }); draw(); return none();
});

def('la_projection','投影 = 最近的影子','Projection = closest point','拖 b。把 b 投到 a 的方向上：p = (a·b / a·a) a，误差 b−p 垂直于 a。最小二乘就是把 y 投到列空间。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,36); mgrid(svg,f,W,H); const ma=K.arrow(svg,uid('a'),C.cy),mb=K.arrow(svg,uid('b'),C.vi),mp=K.arrow(svg,uid('p'),C.gr),a=[4,1.5],g=svg.append('g'),hg=svg.append('g'); let b=[1,3.5];
  const draw=()=>{ g.selectAll('*').remove(); const k=(a[0]*b[0]+a[1]*b[1])/(a[0]*a[0]+a[1]*a[1]),p=[a[0]*k,a[1]*k],e=[b[0]-p[0],b[1]-p[1]],n=M.hypot(a[0],a[1]);
    ln(g,f.x(-a[0]*3),f.y(-a[1]*3),f.x(a[0]*3),f.y(a[1]*3),C.hair,1.5); vec(g,f,a[0],a[1],C.cy,ma); vec(g,f,b[0],b[1],C.vi,mb); vec(g,f,p[0],p[1],C.gr,mp,3.5); ln(g,f.x(b[0]),f.y(b[1]),f.x(p[0]),f.y(p[1]),C.rd,2,{dash:'5 3'});
    const sg=M.sign(a[0]*e[1]-a[1]*e[0])||1,ux=a[0]/n*.4,uy=a[1]/n*.4,vx=-a[1]/n*.4*sg,vy=a[0]/n*.4*sg;
    g.append('path').attr('d',`M${f.x(p[0]+ux)},${f.y(p[1]+uy)} L${f.x(p[0]+ux+vx)},${f.y(p[1]+uy+vy)} L${f.x(p[0]+vx)},${f.y(p[1]+vy)}`).attr('fill','none').attr('stroke',C.am).attr('stroke-width',1.5);
    K.label(g,f.x(b[0])+8,f.y(b[1]),'b','',{color:C.vi}); K.label(g,f.x(p[0])+8,f.y(p[1])+14,'p = 投影','projection',{color:C.gr,size:11}); K.label(g,f.x((b[0]+p[0])/2)+8,f.y((b[1]+p[1])/2),'误差 ⊥ a','residual',{color:C.rd,size:11});
    K.label(g,12,20,`k = a·b / a·a = ${K.fmt(k,2)}`,`p = k·a = (${K.fmt(p[0],2)}, ${K.fmt(p[1],2)}),   |e| = ${K.fmt(M.hypot(e[0],e[1]),2)} (minimal)`,{size:13,color:api.color}); };
  handle(svg,hg,f.x(1),f.y(3.5),C.vi,(mx,my)=>{ b=[f.ix(mx),f.iy(my)]; mv(hg,0,mx,my); draw(); }); draw(); return none();
});

def('la_determinant','行列式 = 面积放大倍数','Determinant = area factor','单位方块被 A 打成平行四边形，面积就是 |det|。拉滑杆，det 过 0 时颜色翻转 = 方向翻面。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,44); mgrid(svg,f,W,H); const mi=K.arrow(svg,uid('i'),C.gr),mj=K.arrow(svg,uid('j'),C.rd),g=svg.append('g'); let m=mat(2,1,0,1.5);
  const draw=()=>{ g.selectAll('*').remove(); const det=m.a*m.d-m.b*m.c,col=det>0?C.gr:det<0?C.rd:C.muted;
    poly(g,f,[[0,0],[1,0],[1,1],[0,1]],C.muted,{close:true,fill:C.muted,fo:.25}); poly(g,f,[[0,0],[m.a,m.c],[m.a+m.b,m.c+m.d],[m.b,m.d]],col,{close:true,fill:col,fo:.25});
    vec(g,f,m.a,m.c,C.gr,mi,3); vec(g,f,m.b,m.d,C.rd,mj,3);
    K.label(g,12,20,`det ${mstr(m)} = ${K.fmt(m.a,1)}·${K.fmt(m.d,1)} − ${K.fmt(m.b,1)}·${K.fmt(m.c,1)} = ${K.fmt(det,2)}`,`|det| = area × ${K.fmt(M.abs(det),2)};  ${det<0?'negative: orientation flipped':M.abs(det)<1e-9?'zero: squashed flat, not invertible':'positive: orientation kept'}`,{size:13,color:col}); };
  draw(); ['a','b','c','d'].forEach((k,i)=>api.slider(k,-2,3,.1,[2,1,0,1.5][i],x=>{ m=setM(m,k,x); draw(); })); return none();
});

/* 供检查脚本使用：导出 svd2 自检（浏览器里无副作用） */
A.__math_a_check = {svd2, mat, mul, rot};
})();
