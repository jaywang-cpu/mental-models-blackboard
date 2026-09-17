/* anim/math_b.js — 数学宇宙 ca / pr / co / di 动画（+ ns_mental_mult）。
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
const frame=(W,H,u,cx=W/2,cy=H/2)=>({u,cx,cy,x:v=>cx+v*u,y:v=>cy-v*u,ix:p=>(p-cx)/u,iy:p=>(cy-p)/u});
const mgrid=(g,f,W,H)=>{
  const gg=g.append('g'),nx=M.ceil(W/f.u),ny=M.ceil(H/f.u);
  for(let i=-nx;i<=nx;i++) gg.append('line').attr('x1',f.x(i)).attr('x2',f.x(i)).attr('y1',0).attr('y2',H).attr('stroke',i?C.hair:C.muted).attr('stroke-width',i?.6:1.2);
  for(let j=-ny;j<=ny;j++) gg.append('line').attr('y1',f.y(j)).attr('y2',f.y(j)).attr('x1',0).attr('x2',W).attr('stroke',j?C.hair:C.muted).attr('stroke-width',j?.6:1.2);
  return gg;
};
const handle=(svg,g,x,y,color,cb)=>{
  const c=g.append('circle').attr('cx',x).attr('cy',y).attr('r',9).attr('fill',color).attr('stroke',C.ink).attr('stroke-width',1.5).style('cursor','grab');
  c.call(d3.drag().on('start drag',ev=>{const [mx,my]=d3.pointer(ev,svg.node());cb(mx,my);}));
  return c;
};
const L2=f=>d3.line().defined(p=>p&&isFinite(p[1])).x(p=>f.x(p[0])).y(p=>f.y(p[1]));
const curve=(g,f,fn,x0,x1,color,n=240,w=2.2)=>{ const pts=[]; for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n,y=fn(x); pts.push(isFinite(y)&&M.abs(y)<1e4?[x,y]:null); }
  return g.append('path').attr('d',L2(f)(pts)).attr('fill','none').attr('stroke',color).attr('stroke-width',w); };
/* 定时器托管：所有 setInterval/timeout 统一在 stop 里清 */
const timers=()=>{ const s=new Set(); return {
  every:(ms,fn)=>{ const id=setInterval(fn,ms); s.add(id); return id; },
  later:(ms,fn)=>{ const id=setTimeout(fn,ms); s.add(id); return id; },
  stop(){ s.forEach(id=>{clearInterval(id);clearTimeout(id);}); s.clear(); } }; };
const rnd=d3.randomNormal(0,1);
const fact=n=>{ let r=1; for(let i=2;i<=n;i++) r*=i; return r; };
const choose=(n,k)=>k<0||k>n?0:M.round(fact(n)/(fact(k)*fact(n-k)));
const def=(key,title,en,cap,make)=>{ A[key]={title,en,cap,make}; };

/* ============ ns 数感（补） ============ */
def('ns_mental_mult','速算拆解','Mental multiplication','×11：邻位相加插中间。平方 (10a+5)²：a(a+1) 后接 25。滑杆换数，看拆解逐步亮起。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'); let mode=0,n=47,step=0; const T=timers();
  const draw=()=>{ g.selectAll('*').remove(); const rows=[];
    if(mode===0){ const d=String(n).split('').map(Number),mid=d[0]+d[1],carry=mid>9?1:0; rows.push({zh:`${n} × 11`,en:'split digits',v:`${d[0]}  ${d[1]}`},{zh:'邻位相加',en:'add neighbours',v:`${d[0]} (${d[0]}+${d[1]}=${mid}) ${d[1]}`},{zh:carry?'进位':'不进位',en:carry?'carry 1':'no carry',v:carry?`${d[0]+1} ${mid-10} ${d[1]}`:`${d[0]} ${mid} ${d[1]}`},{zh:'答案',en:'answer',v:String(n*11)}); }
    else { const a=M.floor(n/10),m=n%10; if(m===5) rows.push({zh:`${n}² 末位是 5`,en:'ends in 5',v:`a = ${a}`},{zh:'a × (a+1)',en:'front part',v:`${a} × ${a+1} = ${a*(a+1)}`},{zh:'后接 25',en:'append 25',v:`${a*(a+1)}|25`},{zh:'答案',en:'answer',v:String(n*n)});
      else rows.push({zh:`${n}² 靠近 ${a*10+(m>5?10:0)}`,en:'use (x±d)²',v:`x = ${m>5?a*10+10:a*10}, d = ${m>5?10-m:m}`},{zh:'x² ± 2xd',en:'expand',v:`${(m>5?a*10+10:a*10)**2} ${m>5?'−':'+'} ${2*(m>5?a*10+10:a*10)*(m>5?10-m:m)}`},{zh:'+ d²',en:'add d²',v:`+ ${(m>5?10-m:m)**2}`},{zh:'答案',en:'answer',v:String(n*n)}); }
    rows.forEach((r,i)=>{ const on=i<=step,y=60+i*62; g.append('rect').attr('x',40).attr('y',y-22).attr('width',W-80).attr('height',48).attr('rx',8).attr('fill',on?api.color:C.muted).attr('fill-opacity',on?.15:.05).attr('stroke',on?api.color:C.hair);
      K.label(g,56,y,r.zh,r.en,{color:on?C.ink:C.muted}); txt(g,W-56,y+8,on?r.v:'…',{anchor:'end',size:18,mono:true,bold:true,color:i===rows.length-1&&on?C.gr:C.ink}); });
    txt(g,W/2,H-12,mode?'平方：拆成 (x+d)²，末位 5 走 a(a+1)|25':'×11 = ×10 + ×1，所以每位加它的邻居',{anchor:'middle',color:C.muted,size:11}); };
  const run=()=>{ T.stop(); step=0; draw(); T.every(700,()=>{ step++; draw(); if(step>=3) T.stop(); }); };
  run(); api.slider('n',12,99,1,47,v=>{n=+v;run();}); api.button('×11 / 平方 切换',()=>{mode^=1;run();}); return {stop(){T.stop();}};
});

/* ============ ca 微积分 ============ */
def('ca_derivative_slope','导数 = 切线斜率','Derivative = slope','拖点沿 f(x)=x³/3−x 走，切线斜率同步落到下方，画出导函数 f′(x)=x²−1。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),fn=x=>x*x*x/3-x,dfn=x=>x*x-1,f=frame(W,H,44,W/2,H*.4); mgrid(svg,f,W,H);
  curve(svg,f,fn,-3,3,C.cy); curve(svg,f,dfn,-3,3,C.vi,240,1.2).attr('stroke-dasharray','4 4').attr('opacity',.4);
  const g=svg.append('g'),hg=svg.append('g'),trace=[]; let x0=-1.6;
  const draw=()=>{ g.selectAll('*').remove(); const y0=fn(x0),s=dfn(x0);
    ln(g,f.x(x0-1.4),f.y(y0-1.4*s),f.x(x0+1.4),f.y(y0+1.4*s),C.am,2.5);
    trace.forEach(p=>dot(g,f.x(p[0]),f.y(p[1]),2.5,C.vi)); dot(g,f.x(x0),f.y(s),5,C.vi); ln(g,f.x(x0),f.y(y0),f.x(x0),f.y(s),C.hair,1,{dash:'3 3'});
    K.label(g,12,20,`x = ${K.fmt(x0,2)}   斜率 f′(x) = ${K.fmt(s,2)}`,`tangent slope = x² − 1`,{size:13,color:C.am});
    K.label(g,f.x(x0)+10,f.y(s)+4,'落点 = 导数值','derivative value',{size:11,color:C.vi}); };
  handle(svg,hg,f.x(x0),f.y(fn(x0)),C.am,(mx)=>{ x0=M.max(-3,M.min(3,f.ix(mx))); trace.push([x0,dfn(x0)]); if(trace.length>200) trace.shift(); hg.select('circle').attr('cx',f.x(x0)).attr('cy',f.y(fn(x0))); draw(); });
  draw(); api.button('清轨迹 / clear',()=>{trace.length=0;draw();}); return none();
});

def('ca_integral_area','积分 = 矩形面积之和','Integral = area','滑杆加矩形条数：条越细，总面积越贴近 ∫₀² x² dx = 8/3。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),fn=x=>x*x,f=frame(W,H,60,W/2-120,H-40); mgrid(svg,f,W,H); curve(svg,f,fn,-.3,2.3,C.cy); const g=svg.append('g');
  const draw=n=>{ g.selectAll('*').remove(); const w=2/n; let sum=0;
    for(let i=0;i<n;i++){ const x=i*w+w/2,h=fn(x); sum+=h*w; g.append('rect').attr('x',f.x(i*w)).attr('y',f.y(h)).attr('width',f.u*w).attr('height',f.u*h).attr('fill',api.color).attr('fill-opacity',.35).attr('stroke',api.color).attr('stroke-width',.8); }
    const exact=8/3; K.label(g,12,20,`${n} 条矩形：和 = ${K.fmt(sum,4)}`,`exact ∫₀² x² dx = 8/3 = ${exact.toFixed(4)}   误差 ${K.fmt(M.abs(sum-exact),4)}`,{size:13,color:api.color});
    txt(g,W-16,H-16,'宽→0，和→积分',{anchor:'end',color:C.muted,size:11}); };
  draw(4); api.slider('矩形数 / n',1,80,1,4,v=>draw(+v)); return none();
});

def('ca_chain_rule','链式法则：齿轮联动','Chain rule gears','x 转一格，u=2x 转两格，y=3u 转六格。总倍率 = 各级倍率相乘。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),cx=[W*.2,W*.5,W*.8],r=[52,40,30],k=[1,2,3],name=[['x','input'],['u = 2x','du/dx = 2'],['y = 3u','dy/du = 3']];
  let th=0,last=null; const gear=(x,y,R,ang,col,n)=>{ const gg=g.append('g').attr('transform',`translate(${x},${y}) rotate(${ang*180/PI})`); gg.append('circle').attr('r',R).attr('fill',col).attr('fill-opacity',.15).attr('stroke',col).attr('stroke-width',2);
    for(let i=0;i<n;i++){ const a=i*2*PI/n; gg.append('rect').attr('x',R-4).attr('y',-4).attr('width',10).attr('height',8).attr('fill',col).attr('transform',`rotate(${a*180/PI})`); } gg.append('line').attr('x1',0).attr('y1',0).attr('x2',R*.85).attr('y2',0).attr('stroke',C.ink).attr('stroke-width',3); };
  const draw=()=>{ g.selectAll('*').remove(); [C.cy,C.vi,C.gr].forEach((c,i)=>{ gear(cx[i],H/2-10,r[i],th*k[0]*(i>0?k[1]:1)*(i>1?k[2]:1)*(i%2?-1:1),c,[12,8,6][i]); K.label(g,cx[i],H/2+r[i]+22,name[i][0],name[i][1],{anchor:'middle',color:c}); });
    K.label(g,W/2,26,`dy/dx = dy/du · du/dx = 3 × 2 = 6`,`x turns ${K.fmt(th/(2*PI),2)} → y turns ${K.fmt(6*th/(2*PI),2)}`,{anchor:'middle',size:13,color:api.color}); };
  const stop=api.play(t=>{ if(last==null) last=t; th+=(t-last)*.5; last=t; draw(); }); return {stop(){stop&&stop();}};
});

def('ca_taylor','泰勒展开逼近 sin','Taylor series','滑杆加阶数：多项式从原点出发一层层贴上 sin，越远越需要高阶。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,40); mgrid(svg,f,W,H); curve(svg,f,M.sin,-8,8,C.cy); const g=svg.append('g');
  const taylor=(x,n)=>{ let s=0; for(let k=0;k<=n;k++){ if(k%2===1) s+=M.pow(-1,(k-1)/2)*M.pow(x,k)/fact(k); } return s; };
  const draw=n=>{ g.selectAll('*').remove(); curve(g,f,x=>taylor(x,n),-8,8,C.am,320,2.5);
    const terms=[]; for(let k=1;k<=n;k+=2) terms.push(`${(k-1)/2%2?'−':'+'}x^${k}/${k}!`); K.label(g,12,20,`阶数 ${n}：sin x ≈ ${terms.join(' ').replace(/^\+/,'')}`,`higher order = matches farther from 0`,{size:13,color:C.am}); };
  draw(1); api.slider('阶数 / order',1,15,2,1,v=>draw(+v)); return none();
});

def('ca_gradient','梯度 = 最陡上坡','Gradient','等高线上拖点：箭头指向 f 增最快方向，长度 = 坡度。永远垂直于等高线。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,44),fn=(x,y)=>x*x+.5*y*y+.4*x*y,mk=K.arrow(svg,uid('g'),C.am); mgrid(svg,f,W,H);
  const base=svg.append('g'); [.5,1,2,3,5,8,12].forEach(c=>{ const pts=[]; for(let i=0;i<=120;i++){ const t=i/120*2*PI,cs=M.cos(t),sn=M.sin(t),q=fn(cs,sn),r=M.sqrt(c/q); pts.push([r*cs,r*sn]); } base.append('path').attr('d',L2(f)(pts)+'Z').attr('fill','none').attr('stroke',C.cy).attr('stroke-width',1).attr('opacity',.6); });
  const g=svg.append('g'),hg=svg.append('g'); let p=[1.5,1.2];
  const draw=()=>{ g.selectAll('*').remove(); const gx=2*p[0]+.4*p[1],gy=p[1]+.4*p[0],n=M.hypot(gx,gy),s=.35;
    ln(g,f.x(p[0]),f.y(p[1]),f.x(p[0]+gx*s),f.y(p[1]+gy*s),C.am,3,{arrow:mk}); ln(g,f.x(p[0]),f.y(p[1]),f.x(p[0]-gx*s),f.y(p[1]-gy*s),C.rd,1.5,{dash:'4 3'});
    K.label(g,12,20,`∇f = (${K.fmt(gx,2)}, ${K.fmt(gy,2)})   |∇f| = ${K.fmt(n,2)}`,`f = x² + 0.5y² + 0.4xy;  red dashed = descent direction`,{size:13,color:C.am}); };
  handle(svg,hg,f.x(p[0]),f.y(p[1]),C.am,(mx,my)=>{ p=[f.ix(mx),f.iy(my)]; hg.select('circle').attr('cx',mx).attr('cy',my); draw(); }); draw(); return none();
});

def('ca_optimization','约束下找极值','Constrained optimum','沿圆 x²+y²=4 走，看 f=x+2y 的高低。极值处等高线与圆相切：∇f ∥ ∇g（拉格朗日）。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,50); mgrid(svg,f,W,H); const base=svg.append('g'),g=svg.append('g');
  for(let c=-5;c<=5;c++) base.append('path').attr('d',L2(f)([[-4,(c+4)/2],[4,(c-4)/2]])).attr('stroke',C.cy).attr('stroke-width',1).attr('opacity',.35);
  base.append('circle').attr('cx',f.x(0)).attr('cy',f.y(0)).attr('r',2*f.u).attr('fill','none').attr('stroke',C.vi).attr('stroke-width',2);
  const draw=t=>{ g.selectAll('*').remove(); const x=2*M.cos(t),y=2*M.sin(t),v=x+2*y,best=M.atan2(2,1),isMax=M.abs(((t-best)%(2*PI)+2*PI)%(2*PI))<.08;
    g.append('path').attr('d',L2(f)([[-4,(v+4)/2],[4,(v-4)/2]])).attr('stroke',isMax?C.gr:C.am).attr('stroke-width',2.5); dot(g,f.x(x),f.y(y),7,isMax?C.gr:C.am);
    ln(g,f.x(x),f.y(y),f.x(x+.5),f.y(y+1),C.am,2); ln(g,f.x(x),f.y(y),f.x(x*1.3),f.y(y*1.3),C.vi,2);
    K.label(g,12,20,`f = x + 2y = ${K.fmt(v,2)}   ${isMax?'极大：切线重合':''}`,`max at ∇f ∥ ∇g  → (x,y)=(2/√5, 4/√5), f=2√5≈4.47`,{size:13,color:isMax?C.gr:C.am}); };
  draw(0); api.slider('角度 θ',0,6.28,.02,0,v=>draw(+v)); return none();
});

def('ca_ode','微分方程 = 场线 + 粒子','ODE flow','dy/dx = y − x：每点一个小箭头是斜率，粒子只是顺着箭头走。点"撒粒子"看解曲线。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,40),F=(x,y)=>y-x; mgrid(svg,f,W,H); const base=svg.append('g'),g=svg.append('g'); let parts=[];
  for(let i=-8;i<=8;i++) for(let j=-4;j<=4;j++){ const s=F(i,j),a=M.atan(s),l=.32; base.append('line').attr('x1',f.x(i-l*M.cos(a))).attr('y1',f.y(j-l*M.sin(a))).attr('x2',f.x(i+l*M.cos(a))).attr('y2',f.y(j+l*M.sin(a))).attr('stroke',C.cy).attr('stroke-width',1).attr('opacity',.5); }
  const spawn=()=>{ parts=d3.range(12).map(()=>({x:-7+M.random()*3,y:-3+M.random()*6,tr:[]})); };
  spawn(); let last=null; const stop=api.play(t=>{ if(last==null) last=t; const dt=M.min(.05,t-last); last=t; g.selectAll('*').remove();
    parts.forEach(p=>{ if(M.abs(p.y)>5||p.x>8) return; p.tr.push([p.x,p.y]); p.x+=dt*1.5; p.y+=dt*1.5*F(p.x,p.y); g.append('path').attr('d',L2(f)(p.tr)).attr('fill','none').attr('stroke',C.am).attr('stroke-width',1.5).attr('opacity',.8); dot(g,f.x(p.x),f.y(p.y),3.5,C.am); });
    K.label(g,12,20,"dy/dx = y − x","solution y = x + 1 + C·eˣ; particles follow the arrows",{size:13,color:api.color}); });
  api.button('撒粒子 / respawn',spawn); return {stop(){stop&&stop();}};
});

def('ca_limit','极限：越放大越像','Limit zoom','f(x)=sin(x)/x 在 0 处没定义，但两边逼近 1。滑杆放大，缺口不变，值越来越明确。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),fn=x=>x===0?NaN:M.sin(x)/x;
  const draw=z=>{ g.selectAll('*').remove(); const r=6/z,f=frame(W,H,(W-80)/(2*r),W/2,H*.8),vs=(H*.65)/(1-fn(r)+.05),ff={u:f.u,x:f.x,y:v=>H*.8-(v-fn(r))*vs};
    ln(g,40,ff.y(1),W-40,ff.y(1),C.hair,1,{dash:'4 4'}); txt(g,W-42,ff.y(1)-5,'y = 1',{anchor:'end',color:C.muted,mono:true});
    curve(g,ff,fn,-r,-1e-9,C.cy); curve(g,ff,fn,1e-9,r,C.cy); g.append('circle').attr('cx',ff.x(0)).attr('cy',ff.y(1)).attr('r',5).attr('fill','none').attr('stroke',C.rd).attr('stroke-width',2);
    const e=r*.5; dot(g,ff.x(-e),ff.y(fn(-e)),5,C.am); dot(g,ff.x(e),ff.y(fn(e)),5,C.am);
    K.label(g,12,20,`放大 ${z}×：x∈[−${K.fmt(r,3)}, ${K.fmt(r,3)}]`,`f(±${K.fmt(e,3)}) = ${fn(e).toFixed(6)}  → limit 1, hole stays`,{size:13,color:C.am}); };
  draw(1); api.slider('放大 / zoom',1,200,1,1,v=>draw(+v)); return none();
});

/* ============ pr 概率统计 ============ */
def('pr_distribution','分布：参数改形状','Distribution shape','正态 N(μ,σ)：μ 平移，σ 拉宽。面积恒为 1，所以越宽越矮。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,(W-80)/12,W/2,H-40),g=svg.append('g'); let mu=0,sg=1; mgrid(svg,f,W,H);
  const draw=()=>{ g.selectAll('*').remove(); const vs=280,pdf=x=>M.exp(-((x-mu)**2)/(2*sg*sg))/(sg*M.sqrt(2*PI)),ff={u:f.u,x:f.x,y:v=>f.y(0)-v*vs};
    const pts=[]; for(let i=0;i<=240;i++){ const x=-6+i/20; pts.push([x,pdf(x)]); } g.append('path').attr('d',L2(ff)([[-6,0],...pts,[6,0]])+'Z').attr('fill',api.color).attr('fill-opacity',.25).attr('stroke',api.color).attr('stroke-width',2.2);
    [[-1,1,'68%'],[-2,2,'95%']].forEach(([a,b,s],i)=>{ ln(g,f.x(mu+a*sg),f.y(0),f.x(mu+a*sg),ff.y(pdf(mu+a*sg)),C.am,1,{dash:'3 3'}); ln(g,f.x(mu+b*sg),f.y(0),f.x(mu+b*sg),ff.y(pdf(mu+b*sg)),C.am,1,{dash:'3 3'}); txt(g,f.x(mu),f.y(0)+16+i*13,`±${b}σ ${s}`,{anchor:'middle',color:C.am,size:10,mono:true}); });
    K.label(g,12,20,`μ = ${K.fmt(mu,1)}   σ = ${K.fmt(sg,1)}`,`peak = 1/(σ√2π) = ${K.fmt(1/(sg*M.sqrt(2*PI)),3)}; area always 1`,{size:13,color:api.color}); };
  draw(); api.slider('μ',-3,3,.1,0,v=>{mu=+v;draw();}); api.slider('σ',.3,3,.1,1,v=>{sg=+v;draw();}); return none();
});

def('pr_bayes','贝叶斯：先验 × 似然','Bayes area','宽 = 先验 P(病)，高 = 似然 P(阳|·)。后验 = 真阳面积 ÷ 所有阳面积。滑先验看直觉翻车。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),x0=60,y0=60,BW=W-120,BH=H-130; let prior=.01,sens=.95,fpr=.05;
  const draw=()=>{ g.selectAll('*').remove(); const w1=BW*prior,tp=prior*sens,fp=(1-prior)*fpr,post=tp/(tp+fp);
    g.append('rect').attr('x',x0).attr('y',y0).attr('width',w1).attr('height',BH).attr('fill',C.muted).attr('fill-opacity',.15).attr('stroke',C.hair);
    g.append('rect').attr('x',x0+w1).attr('y',y0).attr('width',BW-w1).attr('height',BH).attr('fill',C.muted).attr('fill-opacity',.08).attr('stroke',C.hair);
    g.append('rect').attr('x',x0).attr('y',y0+BH*(1-sens)).attr('width',w1).attr('height',BH*sens).attr('fill',C.gr).attr('fill-opacity',.6);
    g.append('rect').attr('x',x0+w1).attr('y',y0+BH*(1-fpr)).attr('width',BW-w1).attr('height',BH*fpr).attr('fill',C.rd).attr('fill-opacity',.6);
    K.label(g,x0,y0-22,`先验 P(病) = ${(prior*100).toFixed(1)}%`,'prior = width',{size:12}); K.label(g,x0+BW,y0-22,'健康','healthy',{anchor:'end',size:12,color:C.muted});
    txt(g,x0-6,y0+BH*(1-sens)+4,'灵敏度','',{anchor:'end',color:C.gr,size:10}); txt(g,x0+BW+6,y0+BH*(1-fpr)+4,'假阳率',{color:C.rd,size:10});
    K.label(g,W/2,H-36,`阳性后真的有病：绿 ÷ (绿+红) = ${(post*100).toFixed(1)}%`,`posterior = ${tp.toFixed(4)} / (${tp.toFixed(4)} + ${fp.toFixed(4)})`,{anchor:'middle',size:14,color:api.color}); };
  draw(); api.slider('先验 prior %',.1,50,.1,1,v=>{prior=v/100;draw();}); api.slider('灵敏度 sens',.5,1,.01,.95,v=>{sens=+v;draw();}); api.slider('假阳率 FPR',0,.3,.01,.05,v=>{fpr=+v;draw();}); return none();
});

def('pr_clt','中心极限：均值堆成钟形','Central limit','原始分布是歪的（掷骰 ×3 偏斜），但反复抽 n 个取平均，堆出来永远是正态。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),bins=40,cnt=new Array(bins).fill(0); let n=1,total=0;
  const draw1=()=>{ const w=[1,1,1,2,2,6]; let s=0; for(let i=0;i<n;i++) s+=w[M.floor(M.random()*6)]; return s/n; };
  const draw=()=>{ g.selectAll('*').remove(); const mx=M.max(1,d3.max(cnt)),bw=(W-80)/bins;
    cnt.forEach((c,i)=>g.append('rect').attr('x',40+i*bw).attr('y',H-50-(H-100)*c/mx).attr('width',bw-1).attr('height',(H-100)*c/mx).attr('fill',api.color).attr('fill-opacity',.7));
    [1,2,3,4,5,6].forEach(v=>txt(g,40+(v-1)/5*(W-80),H-34,String(v),{anchor:'middle',color:C.muted,size:10,mono:true}));
    K.label(g,12,20,`每次抽 n = ${n} 个取平均，已抽 ${total} 次`,`raw die is skewed {1,1,1,2,2,6}; means pile into a bell`,{size:13,color:api.color}); };
  const tick=()=>{ for(let k=0;k<8;k++){ const v=draw1(),b=M.min(bins-1,M.floor((v-1)/5*bins)); cnt[b]++; total++; } draw(); };
  draw(); T.every(60,tick); api.slider('n 每次抽几个',1,30,1,1,v=>{n=+v;cnt.fill(0);total=0;draw();}); api.button('清空 / reset',()=>{cnt.fill(0);total=0;draw();}); return {stop(){T.stop();}};
});

def('pr_expectation','期望 = 重心','Expectation = balance','杠杆上放砝码（概率），支点放在期望处才平衡。滑一个砝码，看支点跟着移。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),xs=[1,2,3,4,5,6],x=d3.scaleLinear().domain([0,7]).range([60,W-60]),yb=H*.55; let p=[1,1,1,1,1,1];
  const draw=()=>{ g.selectAll('*').remove(); const s=d3.sum(p),pr=p.map(v=>v/s),E=d3.sum(xs.map((v,i)=>v*pr[i])),tilt=0;
    g.append('path').attr('d',`M${x(E)-14},${yb+30} L${x(E)+14},${yb+30} L${x(E)},${yb+4} Z`).attr('fill',C.am); ln(g,x(.5),yb,x(6.5),yb,C.ink,4);
    xs.forEach((v,i)=>{ const h=pr[i]*180; g.append('rect').attr('x',x(v)-16).attr('y',yb-h-2).attr('width',32).attr('height',h).attr('fill',api.color).attr('fill-opacity',.75).attr('rx',3); txt(g,x(v),yb-h-8,pr[i].toFixed(2),{anchor:'middle',size:10,mono:true,color:C.ink2}); txt(g,x(v),yb+52,String(v),{anchor:'middle',size:13,mono:true}); });
    K.label(g,12,20,`E[X] = Σ x·p = ${K.fmt(E,2)}`,'fulcrum sits at the mean; heavy side pulls it over',{size:13,color:C.am}); };
  draw(); xs.forEach((v,i)=>api.slider(`砝码 ${v}`,0,5,.1,1,val=>{p[i]=+val;draw();})); return none();
});

def('pr_variance','方差 = 散开程度','Variance spread','同一个均值，点云可以紧可以散。滑 σ 看点炸开，方差 = 偏差平方的平均。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),z=d3.range(60).map(()=>rnd()),x=d3.scaleLinear().domain([-4,4]).range([60,W-60]),yb=H*.6; let sg=1,ph=0,last=null;
  const draw=()=>{ g.selectAll('*').remove(); const pts=z.map(v=>v*sg),mean=d3.mean(pts),vr=d3.mean(pts.map(v=>(v-mean)**2));
    ln(g,60,yb,W-60,yb,C.muted,1.5); pts.forEach((v,i)=>{ const yy=yb-8-(i%7)*11-M.sin(ph+i)*2; dot(g,x(v),yy,4,api.color).attr('opacity',.8); });
    ln(g,x(mean-M.sqrt(vr)),yb+24,x(mean+M.sqrt(vr)),yb+24,C.am,4); ln(g,x(mean),yb-90,x(mean),yb+30,C.gr,1.5,{dash:'4 3'});
    K.label(g,12,20,`σ = ${K.fmt(sg,2)}   方差 Var = ${K.fmt(vr,2)}`,`Var = mean((x−μ)²);  amber bar = ±√Var`,{size:13,color:C.am}); txt(g,x(mean),yb+48,'μ',{anchor:'middle',color:C.gr,size:12}); };
  const stop=api.play(t=>{ if(last==null) last=t; ph+=(t-last)*2; last=t; draw(); }); api.slider('σ',.1,3,.05,1,v=>{sg=+v;}); return {stop(){stop&&stop();}};
});

def('pr_covariance','协方差 = 点云倾斜','Covariance tilt','滑相关系数 ρ：点云从圆变成斜线。正 ρ 往右上倒，负 ρ 往左上倒。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,44),g=svg.append('g'),z=d3.range(150).map(()=>[rnd(),rnd()]); mgrid(svg,f,W,H);
  const draw=r=>{ g.selectAll('*').remove(); const pts=z.map(([a,b])=>[a,r*a+M.sqrt(M.max(0,1-r*r))*b]),cov=d3.mean(pts.map(p=>p[0]*p[1]));
    pts.forEach(p=>dot(g,f.x(p[0]),f.y(p[1]),3.5,api.color).attr('opacity',.7)); ln(g,f.x(-3),f.y(-3*r),f.x(3),f.y(3*r),C.am,2,{dash:'5 3'});
    K.label(g,12,20,`ρ = ${K.fmt(r,2)}   样本协方差 ≈ ${K.fmt(cov,2)}`,`cov = mean((x−x̄)(y−ȳ)); sign = tilt direction`,{size:13,color:C.am}); };
  draw(.6); api.slider('相关系数 ρ',-1,1,.05,.6,v=>draw(+v)); return none();
});

def('pr_mle','最大似然：滑参数看峰','MLE peak','抛硬币 10 次得 7 正。滑 p，似然 L(p)=p⁷(1−p)³ 在 p=0.7 最高：数据最"不意外"的参数。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),n=10,k=7,x=d3.scaleLinear().domain([0,1]).range([60,W-60]),L=p=>M.pow(p,k)*M.pow(1-p,n-k),Lm=L(k/n),y=v=>H-60-(H-120)*v/Lm;
  const pts=d3.range(0,1.001,.005).map(p=>[p,L(p)]); svg.append('path').attr('d',d3.line().x(d=>x(d[0])).y(d=>y(d[1]))(pts)).attr('fill','none').attr('stroke',C.cy).attr('stroke-width',2.2);
  [0,.25,.5,.75,1].forEach(v=>txt(svg,x(v),H-42,String(v),{anchor:'middle',color:C.muted,size:10,mono:true}));
  const draw=p=>{ g.selectAll('*').remove(); const v=L(p); ln(g,x(p),H-60,x(p),y(v),C.am,2,{dash:'4 3'}); dot(g,x(p),y(v),7,M.abs(p-.7)<.01?C.gr:C.am);
    for(let i=0;i<n;i++) g.append('circle').attr('cx',60+i*26).attr('cy',H-16).attr('r',9).attr('fill',i<k?api.color:C.muted).attr('fill-opacity',.8);
    K.label(g,12,20,`p = ${K.fmt(p,2)}   L(p) = ${v.toExponential(2)}`,`L = p^7 (1−p)^3;  argmax = 7/10 = 0.70`,{size:13,color:C.am}); };
  draw(.4); api.slider('p',0,1,.01,.4,v=>draw(+v)); return none();
});

def('pr_entropy','熵：不确定度曲线','Entropy curve','滑 p：硬币越公平越难猜，H(p)=−p log p−(1−p)log(1−p) 在 0.5 到顶 1 bit。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),x=d3.scaleLinear().domain([0,1]).range([60,W-60]),y=d3.scaleLinear().domain([0,1]).range([H-60,40]),Hf=p=>p<=0||p>=1?0:-(p*M.log2(p)+(1-p)*M.log2(1-p));
  svg.append('path').attr('d',d3.line().x(p=>x(p)).y(p=>y(Hf(p)))(d3.range(0,1.001,.005))).attr('fill','none').attr('stroke',C.cy).attr('stroke-width',2.2);
  [0,.5,1].forEach(v=>txt(svg,x(v),H-42,String(v),{anchor:'middle',color:C.muted,size:10,mono:true})); txt(svg,50,y(1)+4,'1 bit',{anchor:'end',color:C.muted,size:10,mono:true});
  const draw=p=>{ g.selectAll('*').remove(); const h=Hf(p); ln(g,x(p),H-60,x(p),y(h),C.am,2,{dash:'4 3'}); dot(g,x(p),y(h),7,C.am);
    g.append('rect').attr('x',W-160).attr('y',60).attr('width',100*p).attr('height',18).attr('fill',api.color); g.append('rect').attr('x',W-160+100*p).attr('y',60).attr('width',100*(1-p)).attr('height',18).attr('fill',C.muted);
    K.label(g,12,20,`p = ${K.fmt(p,2)}   H = ${K.fmt(h,3)} bit`,`H = −Σ p log₂ p;  max uncertainty at p = 0.5`,{size:13,color:C.am}); };
  draw(.5); api.slider('p',0,1,.01,.5,v=>draw(+v)); return none();
});

/* ============ co 组合 ============ */
def('co_perm_comb','排列 vs 组合','Permutation vs combination','从 4 个球选 2：排列讲顺序 4×3=12，组合不讲 12÷2=6。点"下一步"逐个摆出来。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),cols=[C.cy,C.vi,C.gr,C.am],perms=[]; for(let i=0;i<4;i++) for(let j=0;j<4;j++) if(i!==j) perms.push([i,j]); let k=0;
  const draw=()=>{ g.selectAll('*').remove(); K.label(g,12,20,`排列 P(4,2) = 12  ·  组合 C(4,2) = 6`,`each pair appears twice in permutations (ab, ba)`,{size:13,color:api.color});
    perms.forEach((p,i)=>{ const on=i<k,x=60+(i%6)*((W-120)/6),y=70+M.floor(i/6)*60,same=perms.findIndex(q=>q[0]===p[1]&&q[1]===p[0]),dup=same<i;
      [0,1].forEach(j=>g.append('circle').attr('cx',x+j*26).attr('cy',y).attr('r',11).attr('fill',cols[p[j]]).attr('opacity',on?(dup?.35:1):.08));
      if(on&&dup) txt(g,x+13,y+30,'重复',{anchor:'middle',color:C.muted,size:10}); });
    txt(g,W/2,H-16,k>=12?'12 个排列里，配对相同的算重复 → 12 ÷ 2! = 6 个组合':`已摆 ${k}/12`,{anchor:'middle',color:C.muted,size:11}); };
  draw(); api.button('下一步 / next',()=>{k=M.min(12,k+1);draw();}); api.button('重来 / reset',()=>{k=0;draw();}); return none();
});

def('co_pigeonhole','鸽巢原理','Pigeonhole','n 只鸽子进 m 个巢，n > m 时必有巢 ≥ 2 只。滑鸽子数，看哪个巢挤了。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),m=5,T=timers(); let n=6,placed=0;
  const draw=()=>{ g.selectAll('*').remove(); const bw=(W-80)/m,cnt=new Array(m).fill(0); for(let i=0;i<placed;i++) cnt[i%m]++;
    for(let j=0;j<m;j++){ const x=40+j*bw; g.append('rect').attr('x',x+8).attr('y',H-110).attr('width',bw-16).attr('height',80).attr('rx',8).attr('fill',cnt[j]>1?C.rd:C.muted).attr('fill-opacity',cnt[j]>1?.35:.15).attr('stroke',cnt[j]>1?C.rd:C.hair);
      for(let q=0;q<cnt[j];q++) dot(g,x+bw/2+(q-(cnt[j]-1)/2)*16,H-70,7,api.color); txt(g,x+bw/2,H-16,`巢 ${j+1}: ${cnt[j]}`,{anchor:'middle',size:11,mono:true,color:cnt[j]>1?C.rd:C.ink2}); }
    for(let i=placed;i<n;i++) dot(g,60+i*22,50,7,api.color).attr('opacity',.6);
    K.label(g,12,20,`${n} 只鸽子，${m} 个巢 → 至少一个巢有 ⌈${n}/${m}⌉ = ${M.ceil(n/m)} 只`,n>m?'more pigeons than holes: sharing is forced':'enough holes: no sharing needed',{size:13,color:n>m?C.rd:C.gr}); };
  const run=()=>{ T.stop(); placed=0; draw(); T.every(300,()=>{ placed++; draw(); if(placed>=n) T.stop(); }); };
  run(); api.slider('鸽子数 / pigeons',1,12,1,6,v=>{n=+v;run();}); return {stop(){T.stop();}};
});

def('co_binomial','杨辉三角 + 加尔顿板','Binomial / Galton','小球每层左右各半，落底堆成二项分布，堆高就是 C(n,k)。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),N=8,cnt=new Array(N+1).fill(0),balls=[],dx=(W-80)/(N+2),top=40,rowH=(H-140)/N;
  const px=(r,c)=>W/2+(c-r/2)*dx;
  for(let r=0;r<=N;r++) for(let c=0;c<=r;c++){ dot(svg,px(r,c),top+r*rowH,3,C.muted); txt(svg,px(r,c)+6,top+r*rowH-4,String(choose(r,c)),{size:9,color:C.muted,mono:true}); }
  const draw=()=>{ g.selectAll('*').remove(); const mx=M.max(1,d3.max(cnt));
    cnt.forEach((c,i)=>g.append('rect').attr('x',px(N,i)-dx*.4).attr('y',H-20-60*c/mx).attr('width',dx*.8).attr('height',60*c/mx).attr('fill',api.color).attr('fill-opacity',.7));
    balls.forEach(b=>dot(g,px(b.r,b.c),top+b.r*rowH,5,C.am)); K.label(g,12,20,`已落 ${d3.sum(cnt)} 球`,'each row: left or right, 50/50',{size:13,color:api.color}); };
  T.every(120,()=>{ if(M.random()<.5) balls.push({r:0,c:0}); for(let i=balls.length-1;i>=0;i--){ const b=balls[i]; b.r++; if(M.random()<.5) b.c++; if(b.r>=N){ cnt[b.c]++; balls.splice(i,1); } } draw(); });
  draw(); api.button('清空 / reset',()=>{cnt.fill(0);balls.length=0;draw();}); return {stop(){T.stop();}};
});

def('co_recursion','递归：汉诺塔','Recursion Hanoi','n 盘 = 先搬 n−1 盘让路，再搬最大盘，再把 n−1 盘搬回来。步数 2ⁿ−1。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),cols=[C.cy,C.vi,C.gr,C.am,C.rd]; let n=4,pegs,moves,k;
  const gen=(m,a,b,c,out)=>{ if(!m) return; gen(m-1,a,c,b,out); out.push([a,b]); gen(m-1,c,b,a,out); };
  const draw=()=>{ g.selectAll('*').remove(); const px=[W*.2,W*.5,W*.8]; px.forEach(x=>ln(g,x,H-40,x,90,C.muted,4)); ln(g,40,H-40,W-40,H-40,C.muted,3);
    pegs.forEach((p,i)=>p.forEach((d,j)=>g.append('rect').attr('x',px[i]-d*14-10).attr('y',H-58-j*18).attr('width',d*28+20).attr('height',16).attr('rx',5).attr('fill',cols[d%5])));
    K.label(g,12,20,`n = ${n}   步 ${k}/${moves.length} = 2^${n} − 1`,'move n−1 aside, move biggest, bring n−1 back',{size:13,color:api.color}); };
  const run=()=>{ T.stop(); pegs=[d3.range(n,0,-1),[],[]]; moves=[]; gen(n,0,2,1,moves); k=0; draw(); T.every(450,()=>{ if(k>=moves.length){T.stop();return;} const [a,b]=moves[k++]; pegs[b].push(pegs[a].pop()); draw(); }); };
  run(); api.slider('盘数 / n',1,6,1,4,v=>{n=+v;run();}); api.button('重放 / replay',run); return {stop(){T.stop();}};
});

def('co_inclusion_exclusion','容斥：加了减，减了加','Inclusion-exclusion','三圆：|A∪B∪C| = 单 − 双 + 三。点"下一步"看每层怎么把重数修正到恰好 1。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),cx=W/2,cy=H/2+10,R=78,cs=[[cx-45,cy-30],[cx+45,cy-30],[cx,cy+45]],cols=[C.cy,C.vi,C.gr]; let step=0;
  const regs=[[1,0,0],[0,1,0],[0,0,1],[1,1,0],[1,0,1],[0,1,1],[1,1,1]],pos=[[cx-80,cy-55],[cx+80,cy-55],[cx,cy+90],[cx,cy-60],[cx-45,cy+25],[cx+45,cy+25],[cx,cy]];
  const draw=()=>{ g.selectAll('*').remove(); cs.forEach((c,i)=>g.append('circle').attr('cx',c[0]).attr('cy',c[1]).attr('r',R).attr('fill',cols[i]).attr('fill-opacity',.12).attr('stroke',cols[i]).attr('stroke-width',2));
    regs.forEach((r,i)=>{ const m=d3.sum(r),cnt=step>=1?m:0,c2=step>=2?cnt-choose(m,2):cnt,c3=step>=3?c2+choose(m,3):c2,v=step?c3:0; txt(g,pos[i][0],pos[i][1]+5,String(v),{anchor:'middle',size:16,bold:true,mono:true,color:v===1?C.gr:v===0?C.muted:C.rd}); });
    const cap=[['点下一步','start'],['+ |A|+|B|+|C|：交叠处被算 2 或 3 次','singles overcount'],['− |AB|−|AC|−|BC|：三重区被扣成 0','pairs overcorrect'],['+ |ABC|：全部恰好 1','triple fixes it']][step];
    K.label(g,12,20,cap[0],cap[1],{size:13,color:api.color}); };
  draw(); api.button('下一步 / next',()=>{step=(step+1)%4;draw();}); return none();
});

def('co_generating','生成函数 = 系数卷积','Generating function','(1+x+x²)(1+x)：把两组系数滑过去对齐相乘再相加，就是多项式乘法 = 卷积。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),a=[1,1,1],b=[1,2,1],T=timers(); let k=0; const n=a.length+b.length-1,cw=54,x0=W/2-n*cw/2;
  const draw=()=>{ g.selectAll('*').remove(); const out=[]; for(let i=0;i<n;i++){ let s=0; for(let j=0;j<a.length;j++){ const t=i-j; if(t>=0&&t<b.length) s+=a[j]*b[t]; } out.push(s); }
    a.forEach((v,i)=>{ g.append('rect').attr('x',x0+i*cw).attr('y',60).attr('width',cw-6).attr('height',36).attr('rx',6).attr('fill',C.cy).attr('fill-opacity',.25).attr('stroke',C.cy); txt(g,x0+i*cw+cw/2-3,84,`${v}x^${i}`,{anchor:'middle',mono:true}); });
    b.forEach((v,j)=>{ const i=k-j,on=i>=0&&i<a.length,xx=x0+(k-j)*cw; g.append('rect').attr('x',xx).attr('y',120).attr('width',cw-6).attr('height',36).attr('rx',6).attr('fill',on?C.vi:C.muted).attr('fill-opacity',on?.35:.1).attr('stroke',on?C.vi:C.hair); txt(g,xx+cw/2-3,144,`${v}x^${j}`,{anchor:'middle',mono:true,color:on?C.ink:C.muted}); });
    out.forEach((v,i)=>{ const on=i<=k; g.append('rect').attr('x',x0+i*cw).attr('y',200).attr('width',cw-6).attr('height',36).attr('rx',6).attr('fill',i===k?C.am:C.gr).attr('fill-opacity',on?.3:.05).attr('stroke',on?(i===k?C.am:C.gr):C.hair); txt(g,x0+i*cw+cw/2-3,224,on?`${v}x^${i}`:'?',{anchor:'middle',mono:true,bold:true,color:on?C.ink:C.muted}); });
    K.label(g,12,20,`x^${k} 的系数 = Σ a[j]·b[${k}−j] = ${out[k]}`,'(1+x+x²)(1+2x+x²): slide, align, multiply, sum',{size:13,color:C.am}); };
  draw(); T.every(1100,()=>{k=(k+1)%n;draw();}); return {stop(){T.stop();}};
});

def('co_graph_count','图的边有多少种','Counting edges','n 个点两两连线共 C(n,2) 条，每条要或不要 → 2^C(n,2) 张图。滑 n 看边数炸开。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let n=5,shown=0;
  const draw=()=>{ g.selectAll('*').remove(); const R=M.min(H,W)/2-60,pts=d3.range(n).map(i=>[W/2+R*M.cos(i*2*PI/n-PI/2),H/2+10+R*M.sin(i*2*PI/n-PI/2)]),E=choose(n,2); let c=0;
    for(let i=0;i<n;i++) for(let j=i+1;j<n;j++){ c++; ln(g,pts[i][0],pts[i][1],pts[j][0],pts[j][1],c<=shown?api.color:C.hair,c<=shown?1.8:.8); }
    pts.forEach(p=>dot(g,p[0],p[1],8,C.cy)); K.label(g,12,20,`n = ${n}：边 C(n,2) = ${E}，已画 ${M.min(shown,E)}`,`possible graphs = 2^${E} = ${E<40?M.pow(2,E).toLocaleString():'2^'+E}`,{size:13,color:api.color}); };
  const run=()=>{ T.stop(); shown=0; draw(); T.every(150,()=>{ shown++; draw(); if(shown>=choose(n,2)) T.stop(); }); };
  run(); api.slider('点数 / n',2,10,1,5,v=>{n=+v;run();}); return {stop(){T.stop();}};
});

def('co_stars_bars','隔板法','Stars and bars','7 颗星放 3 个盒 = 在 9 个位置里挑 2 个当隔板 C(9,2)=36。拖隔板，盒子分配跟着变。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),hg=svg.append('g'),S=7,B=2,x0=80,sp=(W-160)/(S+B),yb=H/2; let bars=[2,5];
  const draw=()=>{ g.selectAll('*').remove(); const sorted=[...bars].sort((a,b)=>a-b),boxes=[sorted[0],sorted[1]-sorted[0],S-sorted[1]];
    for(let i=0;i<S+B;i++){ const isBar=sorted.includes(i); if(!isBar){ const idx=i-sorted.filter(b=>b<i).length,box=sorted.filter(b=>b<i).length; txt(g,x0+i*sp,yb+8,'★',{anchor:'middle',size:24,color:[C.cy,C.vi,C.gr][box]}); } }
    K.label(g,12,20,`盒子：${boxes.join(' + ')} = ${S}`,`positions ${S}+${B}, choose ${B} for bars: C(${S+B},${B}) = ${choose(S+B,B)}`,{size:13,color:api.color});
    boxes.forEach((v,i)=>K.label(g,W*(.25+.25*i),H-40,`盒 ${i+1}: ${v}`,'',{anchor:'middle',color:[C.cy,C.vi,C.gr][i]})); };
  bars.forEach((b,i)=>{ const r=hg.append('rect').attr('x',x0+b*sp-5).attr('y',yb-26).attr('width',10).attr('height',44).attr('rx',3).attr('fill',C.am).style('cursor','grab');
    r.call(d3.drag().on('start drag',ev=>{ const [mx]=d3.pointer(ev,svg.node()); let s=M.round((mx-x0)/sp); s=M.max(0,M.min(S+B-1,s)); if(bars[1-i]===s) return; bars[i]=s; r.attr('x',x0+s*sp-5); draw(); })); });
  draw(); return none();
});

/* ============ di 离散数论 ============ */
def('di_modular','模运算 = 时钟','Modular clock','mod 12 就是钟面：加多少只看落在哪一格。点"+步"看指针绕圈，绕回来的都是同余。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),cx=W/2,cy=H/2+10,R=110,T=timers(); let m=12,v=0,step=5,hist=[];
  const draw=()=>{ g.selectAll('*').remove(); g.append('circle').attr('cx',cx).attr('cy',cy).attr('r',R).attr('fill','none').attr('stroke',C.muted).attr('stroke-width',2);
    for(let i=0;i<m;i++){ const a=i*2*PI/m-PI/2,on=i===v%m; dot(g,cx+R*M.cos(a),cy+R*M.sin(a),on?9:5,on?C.am:hist.includes(i)?api.color:C.muted); txt(g,cx+(R+22)*M.cos(a),cy+(R+22)*M.sin(a)+4,String(i),{anchor:'middle',mono:true,size:12,color:on?C.am:C.ink2}); }
    const a=(v%m)*2*PI/m-PI/2; ln(g,cx,cy,cx+(R-14)*M.cos(a),cy+(R-14)*M.sin(a),C.am,3);
    K.label(g,12,20,`${v} mod ${m} = ${v%m}`,`${v} = ${M.floor(v/m)}×${m} + ${v%m};  step +${step}`,{size:13,color:C.am}); };
  draw(); api.button(`+步 / step`,()=>{ hist.push(v%m); v+=step; draw(); }); api.slider('模 m',2,24,1,12,x=>{m=+x;v=0;hist=[];draw();}); api.slider('步长 step',1,12,1,5,x=>{step=+x;v=0;hist=[];draw();}); return {stop(){T.stop();}};
});

def('di_prime','埃氏筛','Sieve of Eratosthenes','取最小未划数为质数，划掉它所有倍数。自动跑到 √n 就停：剩下全是质数。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),N=100,cols=10,cw=(W-80)/cols,ch=(H-70)/cols,T=timers(),st=new Array(N+1).fill(0); let p=1,cur=0;
  const draw=()=>{ g.selectAll('*').remove(); for(let i=1;i<=N;i++){ const x=40+((i-1)%cols)*cw,y=50+M.floor((i-1)/cols)*ch,s=st[i];
    g.append('rect').attr('x',x+1).attr('y',y+1).attr('width',cw-2).attr('height',ch-2).attr('rx',4).attr('fill',s===2?C.gr:s===1?C.muted:i===p?C.am:api.color).attr('fill-opacity',s===1?.12:s===2?.45:i===p?.7:.2);
    txt(g,x+cw/2,y+ch/2+4,String(i),{anchor:'middle',mono:true,size:11,color:s===1?C.muted:C.ink}); }
    K.label(g,12,20,p>M.sqrt(N)?'筛完：绿色 = 质数':`当前质数 p = ${p}，划掉 ${p} 的倍数`,'unmarked survivors are prime',{size:13,color:p>M.sqrt(N)?C.gr:C.am}); };
  const run=()=>{ T.stop(); st.fill(0); st[1]=1; p=1; cur=0; draw(); T.every(120,()=>{ if(cur===0){ p++; while(p<=N&&st[p]) p++; if(p>M.sqrt(N)){ for(let i=2;i<=N;i++) if(!st[i]) st[i]=2; T.stop(); draw(); return; } st[p]=2; cur=p*p; } else { st[cur]=st[cur]||1; cur+=p; if(cur>N) cur=0; } draw(); }); };
  run(); api.button('重放 / replay',run); return {stop(){T.stop();}};
});

def('di_gcd','辗转相除 = 切正方形','Euclid squares','长方形 a×b 每次切掉最大正方形，剩下的小长方形继续切。最后那块正方形边长就是 gcd。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let a=42,b=30,sq=[],k=0;
  const plan=()=>{ sq=[]; let x=0,y=0,w=a,h=b; while(w>0&&h>0){ if(w>=h){ sq.push({x,y,s:h}); x+=h; w-=h; } else { sq.push({x,y,s:w}); y+=w; h-=w; } } };
  const draw=()=>{ g.selectAll('*').remove(); const u=M.min((W-80)/a,(H-90)/b),x0=40,y0=50; g.append('rect').attr('x',x0).attr('y',y0).attr('width',a*u).attr('height',b*u).attr('fill','none').attr('stroke',C.muted).attr('stroke-dasharray','4 3');
    sq.slice(0,k).forEach((q,i)=>{ const last=i===sq.length-1; g.append('rect').attr('x',x0+q.x*u).attr('y',y0+q.y*u).attr('width',q.s*u).attr('height',q.s*u).attr('fill',last?C.gr:[C.cy,C.vi,C.am][i%3]).attr('fill-opacity',last?.6:.25).attr('stroke',last?C.gr:[C.cy,C.vi,C.am][i%3]); txt(g,x0+(q.x+q.s/2)*u,y0+(q.y+q.s/2)*u+4,String(q.s),{anchor:'middle',mono:true,size:12}); });
    const last=sq[sq.length-1]; K.label(g,12,20,`${a} × ${b}   ${k>=sq.length?`gcd = ${last.s}`:`切第 ${k} 块`}`,`${a} = ${M.floor(a/b)}·${b} + ${a%b} → keep dividing`,{size:13,color:k>=sq.length?C.gr:C.am}); };
  const run=()=>{ T.stop(); plan(); k=0; draw(); T.every(600,()=>{ k++; draw(); if(k>=sq.length) T.stop(); }); };
  run(); api.slider('a',1,60,1,42,v=>{a=+v;run();}); api.slider('b',1,60,1,30,v=>{b=+v;run();}); return {stop(){T.stop();}};
});

def('di_graph','图：力导向','Force graph','点是节点，线是边。拖任意点，弹簧把邻居拉过来：图只关心谁连谁，不关心画在哪。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),nodes=d3.range(10).map(i=>({id:i})),links=[[0,1],[0,2],[1,2],[1,3],[3,4],[4,5],[5,6],[6,3],[2,7],[7,8],[8,9],[9,7]].map(([s,t])=>({source:s,target:t}));
  const lg=svg.append('g'),ng=svg.append('g'); const sim=d3.forceSimulation(nodes).force('l',d3.forceLink(links).distance(60)).force('c',d3.forceManyBody().strength(-220)).force('x',d3.forceCenter(W/2,H/2+10));
  const L=lg.selectAll('line').data(links).join('line').attr('stroke',C.muted).attr('stroke-width',1.8);
  const Nn=ng.selectAll('g').data(nodes).join('g').style('cursor','grab'); Nn.append('circle').attr('r',13).attr('fill',api.color).attr('stroke',C.ink).attr('stroke-width',1.5); Nn.append('text').text(d=>d.id).attr('text-anchor','middle').attr('y',4).attr('fill','#0B1020').attr('font-size',11).attr('font-weight',700);
  Nn.call(d3.drag().on('start',(e,d)=>{ if(!e.active) sim.alphaTarget(.3).restart(); d.fx=d.x; d.fy=d.y; }).on('drag',(e,d)=>{ const [mx,my]=d3.pointer(e,svg.node()); d.fx=mx; d.fy=my; }).on('end',(e,d)=>{ if(!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null; }));
  sim.on('tick',()=>{ L.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y); Nn.attr('transform',d=>`translate(${d.x},${d.y})`); });
  K.label(svg,12,20,`${nodes.length} 节点 ${links.length} 边`,'degree of node 1 = 3; two triangles + one square',{size:13,color:api.color});
  api.button('重排 / shake',()=>sim.alpha(1).restart()); return {stop(){sim.stop();}};
});

def('di_logic','真值表点亮','Truth table','点 A、B 开关，看 AND / OR / XOR / → 哪个灯亮。逻辑就是开关电路。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ops=[['AND','∧',(a,b)=>a&&b],['OR','∨',(a,b)=>a||b],['XOR','⊕',(a,b)=>a!==b],['→','implies',(a,b)=>!a||b]]; let A_=0,B_=0;
  const draw=()=>{ g.selectAll('*').remove(); [['A',A_,W*.3],['B',B_,W*.7]].forEach(([n,v,x])=>{ const gg=g.append('g').style('cursor','pointer').on('click',()=>{ if(n==='A') A_^=1; else B_^=1; draw(); });
      gg.append('rect').attr('x',x-40).attr('y',40).attr('width',80).attr('height',36).attr('rx',18).attr('fill',v?C.gr:C.muted).attr('fill-opacity',.35).attr('stroke',v?C.gr:C.muted); dot(gg,v?x+22:x-22,58,14,v?C.gr:C.ink2); txt(gg,x,64,`${n} = ${v}`,{anchor:'middle',mono:true,bold:true,size:13}); });
    ops.forEach(([n,sym,fn],i)=>{ const x=W*(.2+.2*i),on=fn(!!A_,!!B_); ln(g,W*.3,76,x,140,A_?C.gr:C.hair,A_?2:1); ln(g,W*.7,76,x,140,B_?C.gr:C.hair,B_?2:1);
      g.append('circle').attr('cx',x).attr('cy',170).attr('r',26).attr('fill',on?C.am:C.muted).attr('fill-opacity',on?.8:.15).attr('stroke',on?C.am:C.muted).attr('stroke-width',2); txt(g,x,175,n,{anchor:'middle',bold:true,size:12,color:on?'#0B1020':C.ink2}); txt(g,x,215,sym,{anchor:'middle',size:11,color:C.muted,mono:true}); });
    const rows=[[0,0],[0,1],[1,0],[1,1]]; rows.forEach((r,j)=>{ const cur=r[0]===A_&&r[1]===B_,y=H-90+j*18; txt(g,W/2-100,y,`${r[0]} ${r[1]}   ${ops.map(o=>+o[2](!!r[0],!!r[1])).join('    ')}`,{mono:true,size:11,color:cur?C.am:C.muted,bold:cur}); });
    txt(g,W/2-100,H-104,'A B   AND  OR  XOR  →',{mono:true,size:10,color:C.muted}); K.label(g,12,20,'点开关 A / B','click the switches',{size:13,color:api.color}); };
  draw(); return none();
});

def('di_induction','归纳法 = 多米诺','Induction dominoes','基例：第一张倒。归纳步：每张倒都会推倒下一张。两个都成立，全部倒。去掉任意一个，链断。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),N=12,sp=(W-80)/N; let base=1,stepOK=1,fallen=0,phase=0,broken=-1;
  const draw=()=>{ g.selectAll('*').remove(); ln(g,30,H-60,W-30,H-60,C.muted,2);
    for(let i=0;i<N;i++){ const x=50+i*sp,down=i<fallen,isB=i===broken,ang=down?70:i===fallen&&phase>0?phase*70:0; g.append('rect').attr('x',-6).attr('y',-70).attr('width',12).attr('height',70).attr('rx',3).attr('fill',isB?C.rd:down?C.gr:api.color).attr('fill-opacity',isB?.4:.85).attr('transform',`translate(${x},${H-60}) rotate(${ang})`); txt(g,x,H-40,`P(${i+1})`,{anchor:'middle',size:9,mono:true,color:C.muted}); }
    K.label(g,12,20,`基例 ${base?'✓':'✗'}   归纳步 ${stepOK?'✓':'✗ (第 5 张卡住)'}   → 倒了 ${fallen}/${N}`,'P(1) true, P(k)→P(k+1) true ⇒ all true',{size:13,color:fallen===N?C.gr:C.am}); };
  const run=()=>{ T.stop(); fallen=0; phase=0; broken=stepOK?-1:4; draw(); if(!base) return; T.every(40,()=>{ if(fallen>=N||fallen===broken){T.stop();return;} phase+=.25; if(phase>=1){ phase=0; fallen++; } draw(); }); };
  run(); api.button('基例开关 / base',()=>{base^=1;run();}); api.button('归纳步开关 / step',()=>{stepOK^=1;run();}); api.button('重放 / replay',run); return {stop(){T.stop();}};
});

def('di_bits','二进制翻转','Binary bits','点任意位翻转。每位是 2 的幂，值 = 亮着的位相加。8 位最大 255。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),N=8,bits=new Array(N).fill(0),cw=(W-80)/N;
  const draw=()=>{ g.selectAll('*').remove(); let v=0; bits.forEach((b,i)=>{ const pw=M.pow(2,N-1-i),x=40+i*cw; v+=b*pw; const gg=g.append('g').style('cursor','pointer').on('click',()=>{bits[i]^=1;draw();});
      gg.append('rect').attr('x',x+4).attr('y',80).attr('width',cw-8).attr('height',70).attr('rx',8).attr('fill',b?C.am:C.muted).attr('fill-opacity',b?.8:.12).attr('stroke',b?C.am:C.hair); txt(gg,x+cw/2,125,String(b),{anchor:'middle',size:32,bold:true,mono:true,color:b?'#0B1020':C.muted}); txt(gg,x+cw/2,170,String(pw),{anchor:'middle',size:11,mono:true,color:b?C.am:C.muted}); txt(gg,x+cw/2,66,`2^${N-1-i}`,{anchor:'middle',size:9,mono:true,color:C.muted}); });
    const on=bits.map((b,i)=>b?M.pow(2,N-1-i):0).filter(Boolean); K.label(g,12,20,`值 = ${on.length?on.join(' + '):'0'} = ${v}`,`hex 0x${v.toString(16).toUpperCase().padStart(2,'0')}; click a bit to flip`,{size:14,color:C.am});
    txt(g,W/2,H-24,'左移一位 = ×2，右移一位 = ÷2 取整',{anchor:'middle',color:C.muted,size:11}); };
  draw(); api.button('+1',()=>{ let i=N-1; while(i>=0&&bits[i]){bits[i]=0;i--;} if(i>=0) bits[i]=1; draw(); }); api.button('左移 <<1',()=>{ bits.shift(); bits.push(0); draw(); }); api.button('清零',()=>{bits.fill(0);draw();}); return none();
});

def('di_big_o','大 O：曲线赛跑','Big-O race','n 从 1 涨到 60：log n 几乎躺平，n² 冲天，2ⁿ 直接出画。常数因子在大 n 面前无关紧要。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),fs=[['log n',C.gr,n=>M.log2(n)],['n',C.cy,n=>n],['n log n',C.vi,n=>n*M.log2(n)],['n²',C.am,n=>n*n/8],['2ⁿ',C.rd,n=>M.pow(2,n)/2000]],x=d3.scaleLinear().domain([1,60]).range([60,W-120]),y=d3.scaleLinear().domain([0,400]).range([H-50,40]);
  let nMax=1,last=null; [0,100,200,300,400].forEach(v=>{ ln(svg,60,y(v),W-120,y(v),C.hair,1); txt(svg,52,y(v)+4,String(v),{anchor:'end',color:C.muted,size:10,mono:true}); });
  const draw=()=>{ g.selectAll('*').remove(); fs.forEach(([nm,col,fn])=>{ const pts=[]; for(let n=1;n<=nMax;n+=.5){ const v=fn(n); if(v<=420) pts.push([x(n),y(v)]); }
      g.append('path').attr('d',d3.line()(pts)).attr('fill','none').attr('stroke',col).attr('stroke-width',2.2); const e=pts[pts.length-1]; if(e){ dot(g,e[0],e[1],4,col); txt(g,e[0]+8,e[1]+4,nm,{color:col,size:11,mono:true}); } });
    K.label(g,12,20,`n = ${M.floor(nMax)}`,'n² shown ÷8, 2ⁿ shown ÷2000 and still wins',{size:13,color:api.color}); };
  const stop=api.play(t=>{ if(last==null) last=t; nMax=M.min(60,nMax+(t-last)*8); last=t; draw(); }); api.button('重跑 / rerun',()=>{nMax=1;}); return {stop(){stop&&stop();}};
});

})();
