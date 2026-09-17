/* anim/math_c.js — 数学宇宙五块新大陆动画：op 优化 / it 信息论 / fo 傅里叶 / cx 复数 / vd 吠陀速算。
   只依赖 d3 v7（全局 d3）+ K（anim/_kit.js）。key = node.id 把 '.' 换 '_'。 */
(()=>{
window.ANIM = window.ANIM || {};
const A=window.ANIM, C=K.C, M=Math, PI=M.PI, TAU=2*PI;

/* ============ 共享小函数（与 math_b 同款） ============ */
const none=()=>({stop(){}});
const uid=p=>p+M.random().toString(36).slice(2,8);
const txt=(sel,x,y,s,o={})=>sel.append('text').attr('x',x).attr('y',y).text(s)
  .attr('fill',o.color||C.ink).attr('font-size',o.size||12).attr('text-anchor',o.anchor||'start')
  .attr('font-family',o.mono?'ui-monospace,Menlo,monospace':null).attr('font-weight',o.bold?600:null);
const ln=(sel,x1,y1,x2,y2,color,w=2,o={})=>sel.append('line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
  .attr('stroke',color).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null)
  .attr('marker-end',o.arrow||null).attr('opacity',o.op==null?1:o.op);
const dot=(sel,x,y,r,color)=>sel.append('circle').attr('cx',x).attr('cy',y).attr('r',r).attr('fill',color);
const rect=(sel,x,y,w,h,color,o={})=>sel.append('rect').attr('x',x).attr('y',y).attr('width',M.max(0,w)).attr('height',M.max(0,h))
  .attr('rx',o.rx==null?3:o.rx).attr('fill',color).attr('fill-opacity',o.fo==null?.35:o.fo)
  .attr('stroke',o.stroke||color).attr('stroke-width',o.sw==null?1:o.sw).attr('stroke-opacity',o.so==null?1:o.so);
const frame=(W,H,u,cx=W/2,cy=H/2)=>({u,cx,cy,x:v=>cx+v*u,y:v=>cy-v*u,ix:p=>(p-cx)/u,iy:p=>(cy-p)/u});
const mgrid=(g,f,W,H)=>{
  const gg=g.append('g'),nx=M.ceil(W/f.u),ny=M.ceil(H/f.u);
  for(let i=-nx;i<=nx;i++) gg.append('line').attr('x1',f.x(i)).attr('x2',f.x(i)).attr('y1',0).attr('y2',H).attr('stroke',i?C.hair:C.muted).attr('stroke-width',i?.6:1.2);
  for(let j=-ny;j<=ny;j++) gg.append('line').attr('y1',f.y(j)).attr('y2',f.y(j)).attr('x1',0).attr('x2',W).attr('stroke',j?C.hair:C.muted).attr('stroke-width',j?.6:1.2);
  return gg;
};
const handle=(svg,g,x,y,color,cb)=>{
  const c=g.append('circle').attr('cx',x).attr('cy',y).attr('r',9).attr('fill',color).attr('stroke',C.ink).attr('stroke-width',1.5).style('cursor','grab');
  c.call(d3.drag().on('start drag',ev=>{const p=d3.pointer(ev,svg.node());cb(p[0],p[1]);}));
  return c;
};
const L2=f=>d3.line().defined(p=>p&&isFinite(p[1])).x(p=>f.x(p[0])).y(p=>f.y(p[1]));
const curve=(g,f,fn,x0,x1,color,n=240,w=2.2)=>{ const pts=[]; for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n,y=fn(x); pts.push(isFinite(y)&&M.abs(y)<1e4?[x,y]:null); }
  return g.append('path').attr('d',L2(f)(pts)).attr('fill','none').attr('stroke',color).attr('stroke-width',w); };
const path=(g,pts,color,w=2,o={})=>g.append('path').attr('d',d3.line().defined(p=>p&&isFinite(p[1]))(pts))
  .attr('fill','none').attr('stroke',color).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null).attr('opacity',o.op==null?1:o.op);
const timers=()=>{ const s=new Set(); return {
  every:(ms,fn)=>{ const id=setInterval(fn,ms); s.add(id); return id; },
  later:(ms,fn)=>{ const id=setTimeout(fn,ms); s.add(id); return id; },
  stop(){ s.forEach(id=>{clearInterval(id);clearTimeout(id);}); s.clear(); } }; };
const fact=n=>{ let r=1; for(let i=2;i<=n;i++) r*=i; return r; };
const rnd=d3.randomNormal(0,1);
const def=(key,title,en,cap,make)=>{ A[key]={title,en,cap,make}; };
/* 步骤面板：逐条点亮 */
const steplist=(g,W,list,step,color,y0,gap=46)=>{
  list.forEach((r,i)=>{ const on=i<=step,y=y0+i*gap,last=i===list.length-1;
    rect(g,34,y-20,W-68,gap-8,on?(last?C.gr:color):C.muted,{rx:8,fo:on?.15:.05,stroke:on?(last?C.gr:color):C.hair});
    K.label(g,50,y,r.zh,r.en,{color:on?C.ink:C.muted,size:12});
    txt(g,W-50,y+7,on?r.v:'…',{anchor:'end',size:16,mono:true,bold:true,color:on?(last?C.gr:C.ink):C.muted}); });
};
/* 吠陀 16 诀通用外壳：上半张图 + 下半逐步点亮 */
const VD=(key,title,en,cap,cfg)=>def(key,title,en,cap,(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers();
  let p=cfg.set(cfg.slider[4]),step=0;
  const draw=()=>{ g.selectAll('*').remove(); const st=cfg.steps(p);
    if(cfg.pic) cfg.pic(g,W,H,p,step,api);
    steplist(g,W,st,step,api.color,H-st.length*44-16,44);
    txt(g,W/2,H-8,cfg.note(p),{anchor:'middle',color:C.muted,size:11}); };
  const run=()=>{ T.stop(); step=0; draw(); const n=cfg.steps(p).length;
    T.every(780,()=>{ step++; draw(); if(step>=n-1) T.stop(); }); };
  run();
  api.slider(cfg.slider[0],cfg.slider[1],cfg.slider[2],cfg.slider[3],cfg.slider[4],v=>{p=cfg.set(+v);run();});
  api.button('重播 / replay',run);
  return {stop(){T.stop();}};
});

/* ============ op 优化 ============ */
def('op_convex','凸 vs 非凸：小球下滑','Convex vs non-convex','左边一只碗，右边一串山谷。同时松开三个球：碗里都到同一点，山脉里各自卡在最近的坑。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers();
  const half=W/2,pad=26,fx=(i,x)=>i*half+pad+(x+3)/6*(half-2*pad),base=H-70,amp=H*.34;
  const F=[x=>.16*x*x, x=>.05*x*x+.55*M.sin(2.1*x)+.28*M.cos(3.3*x)];
  const dF=[x=>.32*x, x=>.10*x+1.155*M.cos(2.1*x)-.924*M.sin(3.3*x)];
  const fy=(i,x)=>base-amp*(F[i](x)+ (i?1.1:0))/3.2;
  let balls=[],t0=null,run=true;
  const reset=()=>{ balls=[]; [-2.6,-.7,2.4].forEach(x=>[0,1].forEach(i=>balls.push({i,x,x0:x,v:0}))); };
  reset();
  const draw=()=>{ g.selectAll('*').remove();
    [0,1].forEach(i=>{ const pts=[]; for(let x=-3;x<=3;x+=.02) pts.push([fx(i,x),fy(i,x)]);
      path(g,pts,i?C.rd:C.gr,2.4);
      K.label(g,i*half+half/2,26,i?'非凸：多个谷':'凸：唯一谷底',i?'many local minima':'one global minimum',{anchor:'middle',color:i?C.rd:C.gr,size:13}); });
    balls.forEach(b=>{ dot(g,fx(b.i,b.x),fy(b.i,b.x)-7,7,b.i?C.am:C.cy); });
    const ends=balls.filter(b=>b.i===1).map(b=>K.fmt(b.x,2)).join(' / ');
    txt(g,W/2,H-30,`右侧三球停在 x = ${ends} —— 起点决定终点`,{anchor:'middle',color:C.ink2,size:12});
    txt(g,W/2,H-12,'凸性 = 任意两点连线不低于函数；所以没有第二个坑可躲',{anchor:'middle',color:C.muted,size:11}); };
  const stop=api.play(t=>{ if(t0==null) t0=t; const dt=M.min(.04,t-t0); t0=t; if(run)
    balls.forEach(b=>{ b.v=b.v*.90-dF[b.i](b.x)*dt*5.5; b.x=M.max(-3,M.min(3,b.x+b.v*dt*4)); }); draw(); });
  api.button('重新松手 / drop again',()=>{reset();});
  api.slider('三球起点偏移 / shift',-1,1,.05,0,v=>{ balls.forEach(b=>{b.x=M.max(-3,M.min(3,b.x0+ +v));b.v=0;}); });
  return {stop(){stop&&stop();T.stop();}};
});

def('op_gradient_descent','GD / 动量 / Adam 三条路','GD vs momentum vs Adam','狭长峡谷里：纯 GD 撞两壁走锯齿，动量沿谷底加速，Adam 把陡方向的步长自动调小。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,52,W*.28,H*.55),T=timers();
  const kx=9,ky=.55,E=(x,y)=>.5*(kx*x*x+ky*y*y),base=svg.append('g'),g=svg.append('g');
  [.15,.5,1.2,2.4,4,6].forEach(c=>{ const pts=[]; for(let i=0;i<=90;i++){const t=i/90*TAU; pts.push([M.sqrt(2*c/kx)*M.cos(t),M.sqrt(2*c/ky)*M.sin(t)]);}
    base.append('path').attr('d',L2(f)(pts)+'Z').attr('fill','none').attr('stroke',C.cy).attr('stroke-width',1).attr('opacity',.45); });
  let lr=.09,S=[];
  const reset=()=>{ S=[{n:'GD',en:'plain',c:C.rd,p:[.75,2.2],tr:[],m:[0,0],v:[0,0]},
                       {n:'动量',en:'momentum',c:C.am,p:[.75,2.2],tr:[],m:[0,0],v:[0,0]},
                       {n:'Adam',en:'adam',c:C.gr,p:[.75,2.2],tr:[],m:[0,0],v:[0,0]}]; };
  reset();
  const stepAll=()=>S.forEach((s,k)=>{ const gx=kx*s.p[0],gy=ky*s.p[1];
    if(k===0){ s.p=[s.p[0]-lr*gx,s.p[1]-lr*gy]; }
    else if(k===1){ s.m=[.85*s.m[0]-lr*gx,.85*s.m[1]-lr*gy]; s.p=[s.p[0]+s.m[0],s.p[1]+s.m[1]]; }
    else { s.v=[.95*s.v[0]+.05*gx*gx,.95*s.v[1]+.05*gy*gy];
           s.p=[s.p[0]-lr*2.2*gx/(M.sqrt(s.v[0])+1e-6),s.p[1]-lr*2.2*gy/(M.sqrt(s.v[1])+1e-6)]; }
    if(isFinite(s.p[0])&&M.abs(s.p[0])<8) s.tr.push(s.p.slice()); if(s.tr.length>160) s.tr.shift(); });
  const draw=()=>{ g.selectAll('*').remove();
    S.forEach((s,k)=>{ path(g,s.tr.map(p=>[f.x(p[0]),f.y(p[1])]),s.c,2); s.tr.forEach(p=>dot(g,f.x(p[0]),f.y(p[1]),1.8,s.c));
      dot(g,f.x(s.p[0]),f.y(s.p[1]),6,s.c); K.label(g,W-180,40+k*38,`${s.n}  f=${K.fmt(E(s.p[0],s.p[1]),3)}`,`${s.en}: ${s.tr.length} steps`,{color:s.c,size:12}); });
    K.label(g,14,22,`峡谷曲率 x:y = ${kx}:${ky}   学习率 ${K.fmt(lr,3)}`,'sharp direction limits the step size',{size:12,color:api.color}); };
  T.every(90,()=>{stepAll();draw();}); draw();
  api.slider('学习率 / lr',.01,.20,.005,.09,v=>{lr=+v;reset();});
  api.button('重跑 / rerun',reset);
  return {stop(){T.stop();}};
});

def('op_learning_rate','学习率：慢 / 刚好 / 震荡 / 发散','Learning rate regimes','抛物线 f=½Lx²，步长 η。η<1/L 单调滑下，η=1/L 一步到底，1/L<η<2/L 左右横跳，η>2/L 飞出去。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),T=timers(),L=2,f=frame(W,H,46,W/2,H-64);
  mgrid(svg,f,W,H); curve(svg,f,x=>.5*L*x*x,-4,4,C.cy); const g=svg.append('g');
  let eta=.35,pts=[],x=-3.2;
  const reset=()=>{ x=-3.2; pts=[x]; };
  reset();
  const draw=()=>{ g.selectAll('*').remove();
    for(let i=1;i<pts.length;i++){ const a=pts[i-1],b=pts[i];
      if(M.abs(a)>5||M.abs(b)>5) continue;
      ln(g,f.x(a),f.y(.5*L*a*a),f.x(b),f.y(.5*L*b*b),C.am,1.6,{dash:'3 3',op:.5});
      dot(g,f.x(b),f.y(.5*L*b*b),4,C.am); }
    const last=pts[pts.length-1];
    if(M.abs(last)<=5) dot(g,f.x(last),f.y(.5*L*last*last),8,C.gr);
    const r=M.abs(1-eta*L),tag=eta*L<1?['单调收敛','monotone',C.gr]:eta*L===1?['一步到位','one shot',C.gr]:eta*L<2?['震荡但收敛','oscillating',C.am]:['发散','diverging',C.rd];
    K.label(g,14,22,`η = ${K.fmt(eta,3)}   ηL = ${K.fmt(eta*L,2)}   收缩率 |1−ηL| = ${K.fmt(r,2)}`,`stable iff 0 < η < 2/L = ${K.fmt(2/L,1)}`,{size:13,color:tag[2]});
    K.label(g,14,52,tag[0],tag[1],{size:15,color:tag[2]});
    txt(g,W/2,H-10,'上界只由最陡方向的曲率 L 决定，跟平缓方向无关',{anchor:'middle',color:C.muted,size:11}); };
  T.every(420,()=>{ const nx=x-eta*L*x; x=nx; pts.push(x); if(pts.length>26||M.abs(x)>60) reset(); draw(); }); draw();
  api.slider('学习率 η',.05,1.15,.025,.35,v=>{eta=+v;reset();draw();});
  api.button('重跑 / rerun',()=>{reset();draw();});
  return {stop(){T.stop();}};
});

def('op_constraint_lagrange','约束上走：切点处梯度共线','Lagrange: gradients align','沿椭圆约束走一圈，目标 f=x+2y 的等高线跟着平移。等高线与约束相切的那一刻，∇f 与 ∇g 平行。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,54),mk1=K.arrow(svg,uid('a'),C.am),mk2=K.arrow(svg,uid('b'),C.vi);
  mgrid(svg,f,W,H); const base=svg.append('g'),g=svg.append('g'),T=timers();
  const a=2,b=1.3,gx=p=>2*p[0]/(a*a),gy=p=>2*p[1]/(b*b);
  const pts=[]; for(let i=0;i<=180;i++){const t=i/180*TAU;pts.push([a*M.cos(t),b*M.sin(t)]);}
  base.append('path').attr('d',L2(f)(pts)+'Z').attr('fill','none').attr('stroke',C.vi).attr('stroke-width',2.4);
  for(let c=-6;c<=6;c++) base.append('path').attr('d',L2(f)([[-4.5,(c+4.5)/2],[4.5,(c-4.5)/2]])).attr('stroke',C.cy).attr('stroke-width',.9).attr('opacity',.3);
  let th=0,auto=true,t0=null;
  const best=M.atan2(2*b*b,a*a);
  const draw=()=>{ g.selectAll('*').remove(); const x=a*M.cos(th),y=b*M.sin(th),v=x+2*y;
    const ang=M.abs(M.sin(M.atan2(2,1)-M.atan2(gy([x,y]),gx([x,y])))),tight=ang<.05;
    g.append('path').attr('d',L2(f)([[-4.5,(v+4.5)/2],[4.5,(v-4.5)/2]])).attr('stroke',tight?C.gr:C.am).attr('stroke-width',2.6);
    ln(g,f.x(x),f.y(y),f.x(x+.55),f.y(y+1.1),C.am,3,{arrow:mk1});
    const n=M.hypot(gx([x,y]),gy([x,y]))||1; ln(g,f.x(x),f.y(y),f.x(x+1.2*gx([x,y])/n),f.y(y+1.2*gy([x,y])/n),C.vi,3,{arrow:mk2});
    dot(g,f.x(x),f.y(y),7,tight?C.gr:C.ink);
    K.label(g,14,22,`f = x + 2y = ${K.fmt(v,3)}${tight?'   ← 相切，极值':''}`,`∇f=(1,2)  ∇g∝(${K.fmt(gx([x,y]),2)},${K.fmt(gy([x,y]),2)})  角差 ${K.fmt(ang,3)}`,{size:13,color:tight?C.gr:C.am});
    K.label(g,14,H-40,`最优 f* = √(a²+4b²) = ${K.fmt(M.sqrt(a*a+4*b*b),3)}`,'tangency ⟺ ∇f = λ∇g',{size:12,color:C.ink2}); };
  const stop=api.play(t=>{ if(t0==null)t0=t; if(auto){ th+=(t-t0)*.55; } t0=t; draw(); });
  api.slider('沿约束走 θ',0,6.28,.02,0,v=>{auto=false;th=+v;draw();});
  api.button('自动 / auto',()=>{auto=!auto;});
  api.button('跳到极值 / jump',()=>{auto=false;th=best;draw();});
  return {stop(){stop&&stop();T.stop();}};
});

def('op_kkt','KKT：墙要么顶着你，要么不存在','KKT complementary slackness','拖动那堵墙。墙压过来 → 最优点贴墙、λ>0；墙退到无约束最优之外 → λ=0，约束等于不存在。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,50,W*.42,H*.55),mk=K.arrow(svg,uid('k'),C.rd);
  mgrid(svg,f,W,H); const base=svg.append('g'),g=svg.append('g');
  const cx0=1.8,cy0=.9;
  [.25,1,2.25,4,6.25].forEach(r=>base.append('circle').attr('cx',f.x(cx0)).attr('cy',f.y(cy0)).attr('r',M.sqrt(r)*f.u)
    .attr('fill','none').attr('stroke',C.cy).attr('stroke-width',1).attr('opacity',.4));
  let wall=.6;
  const draw=()=>{ g.selectAll('*').remove();
    rect(g,f.x(wall),0,W-f.x(wall),H,C.rd,{rx:0,fo:.07,sw:0});
    ln(g,f.x(wall),0,f.x(wall),H,C.rd,3);
    const active=cx0>wall,px=active?wall:cx0,lam=active?2*(cx0-wall):0;
    dot(g,f.x(cx0),f.y(cy0),5,C.muted); txt(g,f.x(cx0)+8,f.y(cy0)-8,'无约束最优 / unconstrained',{color:C.muted,size:10});
    dot(g,f.x(px),f.y(cy0),8,active?C.rd:C.gr);
    if(active) ln(g,f.x(px),f.y(cy0),f.x(px-.9),f.y(cy0),C.rd,3,{arrow:mk});
    K.label(g,14,22,active?'约束起作用：贴墙，λ > 0':'约束松弛：离墙远，λ = 0',active?'active: g(x)=0, λ>0':'inactive: g(x)<0, λ=0',{size:14,color:active?C.rd:C.gr});
    K.label(g,14,54,`x* = ${K.fmt(px,2)}   λ = ${K.fmt(lam,2)}   λ·g(x*) = 0`,`constraint  x ≤ ${K.fmt(wall,2)};  gap = ${K.fmt(wall-px,2)}`,{size:12,color:C.ink2});
    txt(g,14,H-32,'互补松弛：λ 和 松弛量 (wall − x*) 永远至少一个是 0',{color:C.muted,size:11});
    txt(g,14,H-14,'贴墙时墙给一个法向推力，恰好抵消 −∇f；不贴墙时墙不出力',{color:C.muted,size:11}); };
  handle(svg,g.append('g'),f.x(wall),H*.2,C.rd,mx=>{ wall=M.max(-1.5,M.min(3.6,f.ix(mx))); draw(); });
  draw(); api.slider('墙的位置 / wall',-1.5,3.6,.05,.6,v=>{wall=+v;draw();});
  return none();
});

def('op_regularization','L1 尖角出稀疏，L2 只缩不杀','L1 diamond vs L2 ball','放大约束半径，椭圆等高线从最小二乘解往里压。L1 的菱形顶点落在坐标轴上，所以解常常某一维正好 = 0。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,58,W/2,H*.5);
  mgrid(svg,f,W,H); const base=svg.append('g'),g=svg.append('g');
  const ols=[1.55,.55],Q=(x,y)=>{const dx=x-ols[0],dy=y-ols[1];return 3*dx*dx+1.1*dy*dy+1.6*dx*dy;};
  let t=1,mode=0;
  const solve=(r,mode)=>{ let best=null;
    for(let i=0;i<=720;i++){ const a=i/720*TAU; let x,y;
      if(mode){ const c=M.cos(a),s=M.sin(a),k=r/(M.abs(c)+M.abs(s)); x=k*c; y=k*s; }
      else { x=r*M.cos(a); y=r*M.sin(a); }
      const v=Q(x,y); if(!best||v<best.v) best={x,y,v}; }
    return best; };
  const draw=()=>{ g.selectAll('*').remove(); base.selectAll('*').remove();
    const r=t,s=solve(r,mode);
    if(mode) base.append('path').attr('d',L2(f)([[r,0],[0,r],[-r,0],[0,-r]])+'Z').attr('fill',C.vi).attr('fill-opacity',.10).attr('stroke',C.vi).attr('stroke-width',2.2);
    else base.append('circle').attr('cx',f.x(0)).attr('cy',f.y(0)).attr('r',r*f.u).attr('fill',C.vi).attr('fill-opacity',.10).attr('stroke',C.vi).attr('stroke-width',2.2);
    [s.v,s.v*2.2,s.v*4.5,s.v*8].forEach((c,i)=>{ const pts=[];
      for(let k=0;k<=180;k++){ const a=k/180*TAU,cs=M.cos(a),sn=M.sin(a),q=3*cs*cs+1.1*sn*sn+1.6*cs*sn,rr=M.sqrt(c/q);
        pts.push([ols[0]+rr*cs,ols[1]+rr*sn]); }
      base.append('path').attr('d',L2(f)(pts)+'Z').attr('fill','none').attr('stroke',i?C.cy:C.am).attr('stroke-width',i?.9:2.4).attr('opacity',i?.35:1); });
    dot(g,f.x(ols[0]),f.y(ols[1]),5,C.muted); txt(g,f.x(ols[0])+9,f.y(ols[1])-8,'OLS 解',{color:C.muted,size:10});
    dot(g,f.x(s.x),f.y(s.y),8,C.gr);
    const zero=M.abs(s.x)<.035||M.abs(s.y)<.035;
    K.label(g,14,22,mode?'L1：菱形（尖角在轴上）':'L2：圆（处处光滑）',mode?'|w1|+|w2| ≤ t':'w1²+w2² ≤ t',{size:14,color:C.vi});
    K.label(g,14,54,`解 w = (${K.fmt(s.x,3)}, ${K.fmt(s.y,3)})${zero?'   ← 有一维被压成 0':''}`,zero?'sparse solution: hit a corner':'both coords non-zero',{size:12,color:zero?C.gr:C.ink2});
    txt(g,14,H-14,mode?'椭圆碰到菱形，最容易先碰上顶点 —— 顶点恰好在坐标轴上':'椭圆碰到圆，切点一般在圆弧内部 —— 两个坐标都不为 0',{color:C.muted,size:11}); };
  draw(); api.slider('约束半径 t',.12,2.4,.04,1,v=>{t=+v;draw();});
  api.button('L1 / L2 切换',()=>{mode^=1;draw();});
  return none();
});

def('op_coordinate_descent','坐标下降：只走横竖的阶梯','Coordinate descent staircase','每步只优化一个坐标，走出阶梯折线。相关性滑杆把椭圆压斜，阶梯立刻变得又碎又慢。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,50,W*.45,H*.55),T=timers();
  const base=svg.append('g'),g=svg.append('g'); let rho=.9,pts=[],k=0;
  const Q=(x,y)=>x*x+y*y+2*rho*x*y;
  const reset=()=>{ pts=[[2.4,-2.1]]; k=0; base.selectAll('*').remove();
    [.2,.8,1.8,3.2,5,7.5].forEach(c=>{ const arr=[];
      for(let i=0;i<=180;i++){ const a=i/180*TAU,cs=M.cos(a),sn=M.sin(a),q=cs*cs+sn*sn+2*rho*cs*sn,r=M.sqrt(c/q); arr.push([r*cs,r*sn]); }
      base.append('path').attr('d',L2(f)(arr)+'Z').attr('fill','none').attr('stroke',C.cy).attr('stroke-width',1).attr('opacity',.45); }); };
  const draw=()=>{ g.selectAll('*').remove();
    path(g,pts.map(p=>[f.x(p[0]),f.y(p[1])]),C.am,2.2);
    pts.forEach((p,i)=>dot(g,f.x(p[0]),f.y(p[1]),i===pts.length-1?7:3,i===pts.length-1?C.gr:C.am));
    const p=pts[pts.length-1];
    K.label(g,14,22,`相关性 ρ = ${K.fmt(rho,2)}   第 ${pts.length-1} 步   f = ${K.fmt(Q(p[0],p[1]),4)}`,`ρ→1: contours tilt, staircase steps shrink`,{size:13,color:api.color});
    K.label(g,14,52,k%2?'这一步只动 y（x 冻住）':'这一步只动 x（y 冻住）',k%2?'minimize over y':'minimize over x',{size:12,color:C.am});
    txt(g,14,H-14,'一维子问题有闭式解：x ← −ρy，y ← −ρx。不需要梯度，也不需要步长',{color:C.muted,size:11}); };
  reset();
  T.every(560,()=>{ const p=pts[pts.length-1].slice();
    if(k%2===0) p[0]=-rho*p[1]; else p[1]=-rho*p[0];
    pts.push(p); k++; if(pts.length>22) reset(); draw(); });
  draw(); api.slider('相关性 ρ',0,.97,.03,.9,v=>{rho=+v;reset();draw();});
  api.button('重跑 / rerun',()=>{reset();draw();});
  return {stop(){T.stop();}};
});

def('op_second_order','牛顿法：先配一个抛物线，一步跳到它的底','Newton: fit a parabola, jump','一阶只知道坡度，二阶还知道弯度。抛物线近似的底部就是下一步落点，所以敢跨大步。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),T=timers(),f=frame(W,H,42,W*.5,H-56);
  const F=x=>.09*M.pow(x,4)-.55*x*x+.35*x+3.2,d1=x=>.36*M.pow(x,3)-1.1*x+.35,d2=x=>1.08*x*x-1.1;
  mgrid(svg,f,W,H); curve(svg,f,F,-4.2,4.2,C.cy); const g=svg.append('g');
  let x=-3.6,gx=-3.6,tr=[],trg=[];
  const reset=()=>{ x=-3.6; gx=-3.6; tr=[x]; trg=[gx]; };
  reset();
  const draw=()=>{ g.selectAll('*').remove(); const h=d2(x),s=d1(x),y=F(x);
    if(h>0){ const xn=x-s/h; curve(g,f,u=>y+s*(u-x)+.5*h*(u-x)*(u-x),x-2.2,x+2.2,C.am,120,1.8);
      ln(g,f.x(xn),f.y(F(xn)),f.x(xn),f.y(y+s*(xn-x)+.5*h*(xn-x)*(xn-x)),C.gr,1.2,{dash:'3 3'}); }
    else { ln(g,f.x(x-1.6),f.y(y-1.6*s),f.x(x+1.6),f.y(y+1.6*s),C.rd,2,{dash:'5 4'});
      txt(g,f.x(x),f.y(y)-34,'曲率为负：抛物线开口朝下，牛顿法会往上跳',{anchor:'middle',color:C.rd,size:11}); }
    trg.forEach(u=>dot(g,f.x(u),f.y(F(u)),3.5,C.vi)); tr.forEach(u=>dot(g,f.x(u),f.y(F(u)),3.5,C.am));
    dot(g,f.x(gx),f.y(F(gx)),7,C.vi); dot(g,f.x(x),f.y(F(x)),7,C.am);
    K.label(g,14,22,`牛顿：x=${K.fmt(x,4)}  f′=${K.fmt(d1(x),4)}  f″=${K.fmt(h,3)}`,`step = −f′/f″ = ${h>0?K.fmt(-s/h,3):'undefined (f″<0)'}`,{size:12,color:C.am});
    K.label(g,14,52,`梯度法(η=.12)：x=${K.fmt(gx,4)}  f′=${K.fmt(d1(gx),4)}`,`step = −η f′ = ${K.fmt(-.12*d1(gx),3)}`,{size:12,color:C.vi});
    txt(g,14,H-12,'二阶方法把椭圆掰成圆：H⁻¹ 抵消了各方向曲率的差别，所以步数少但每步贵',{color:C.muted,size:11}); };
  T.every(760,()=>{ const h=d2(x); if(h>.05) x=x-d1(x)/h; gx=gx-.12*d1(gx);
    tr.push(x); trg.push(gx); if(tr.length>14) reset(); draw(); });
  draw(); api.button('重跑 / rerun',()=>{reset();draw();});
  api.slider('起点 x₀',-4,4,.1,-3.6,v=>{x=+v;gx=+v;tr=[x];trg=[gx];draw();});
  return {stop(){T.stop();}};
});

def('op_stochastic','SGD 噪声 vs 全批量','Stochastic vs batch','同一张地形上放两个球：全批量稳稳滑进最近的坑；SGD 一路发抖，抖劲儿能把它从浅坑里颠出来。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),T=timers(),f=frame(W,H,44,W*.5,H-64);
  const F=x=>.06*x*x+.7*M.sin(1.5*x)+2.6,d=x=>.12*x+1.05*M.cos(1.5*x);
  mgrid(svg,f,W,H); curve(svg,f,F,-5,5,C.cy); const g=svg.append('g');
  let sig=.55,B={x:-3.9,tr:[]},S={x:-3.9,tr:[]},n=0;
  const reset=()=>{ B={x:-3.9,tr:[]}; S={x:-3.9,tr:[]}; n=0; };
  const draw=()=>{ g.selectAll('*').remove();
    B.tr.forEach(u=>dot(g,f.x(u),f.y(F(u)),2,C.vi)); S.tr.forEach(u=>dot(g,f.x(u),f.y(F(u)),2,C.am));
    dot(g,f.x(B.x),f.y(F(B.x))-6,7,C.vi); dot(g,f.x(S.x),f.y(F(S.x))-6,7,C.am);
    const gmin=-1.05;
    K.label(g,14,22,`批量 GD：x = ${K.fmt(B.x,2)}  f = ${K.fmt(F(B.x),3)}`,`smooth, gets stuck in the first basin`,{size:12,color:C.vi});
    K.label(g,14,52,`SGD(σ=${K.fmt(sig,2)})：x = ${K.fmt(S.x,2)}  f = ${K.fmt(F(S.x),3)}`,`noisy, can hop over small barriers`,{size:12,color:C.am});
    K.label(g,W-160,22,`步数 ${n}`,`global min near x≈${gmin}`,{size:12,color:C.ink2});
    txt(g,14,H-12,'噪声 ~ 批大小的 −½ 次方：批越小抖得越狠，探索越强、收敛越糙',{color:C.muted,size:11}); };
  T.every(80,()=>{ n++; B.x=M.max(-5,M.min(5,B.x-.12*d(B.x)));
    S.x=M.max(-5,M.min(5,S.x-.12*(d(S.x)+sig*rnd())));
    B.tr.push(B.x); S.tr.push(S.x); if(B.tr.length>240){B.tr.shift();S.tr.shift();} draw(); });
  draw(); api.slider('梯度噪声 σ',0,2.0,.05,.55,v=>{sig=+v;});
  api.button('重放 / restart',reset);
  return {stop(){T.stop();}};
});

def('op_early_stop','早停：验证曲线抬头的那一刻','Early stopping','两条曲线随 epoch 展开。训练误差一路下滑，验证误差先降后升；拐点就是最佳停车位。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),T=timers(),pad=52;
  const x=d3.scaleLinear().domain([0,100]).range([pad,W-pad]),y=d3.scaleLinear().domain([0,1]).range([H-56,34]);
  const g=svg.append('g'); let noise=.45,e=0,tr=[],va=[];
  const gen=()=>{ tr=[]; va=[];
    for(let i=0;i<=100;i++){ const t=.92*M.exp(-i/22)+.03;
      tr.push(t); va.push(t+noise*(1-M.exp(-i/30))*.55+.06); } };
  gen();
  const draw=()=>{ g.selectAll('*').remove();
    [0,.25,.5,.75,1].forEach(v=>{ ln(g,pad,y(v),W-pad,y(v),C.hair,1); txt(g,pad-8,y(v)+4,K.fmt(v,2),{anchor:'end',color:C.muted,size:10,mono:true}); });
    const n=M.floor(e),bi=va.indexOf(d3.min(va));
    path(g,d3.range(0,n+1).map(i=>[x(i),y(tr[i])]),C.gr,2.4);
    path(g,d3.range(0,n+1).map(i=>[x(i),y(va[i])]),C.rd,2.4);
    if(n>=bi){ ln(g,x(bi),y(0),x(bi),y(1),C.am,2,{dash:'5 4'}); dot(g,x(bi),y(va[bi]),6,C.am);
      K.label(g,x(bi)+8,y(1)+14,'早停点','early stop',{color:C.am,size:12}); }
    if(n>bi+6) rect(g,x(bi),34,x(n)-x(bi),y(0)-34,C.rd,{rx:0,fo:.07,sw:0});
    K.label(g,pad,26,`epoch ${n}   训练 ${K.fmt(tr[n],3)}   验证 ${K.fmt(va[n],3)}`,`best val ${K.fmt(va[bi],3)} @ epoch ${bi}`,{size:13,color:api.color});
    txt(g,W-pad,y(tr[n])+4,'训练 train',{anchor:'start',color:C.gr,size:11}); txt(g,W-pad,y(va[n])-6,'验证 val',{anchor:'start',color:C.rd,size:11});
    txt(g,W/2,H-12,'训练步数本身就是正则化超参：红色阴影区 = 在背噪声',{anchor:'middle',color:C.muted,size:11}); };
  T.every(60,()=>{ e=e>=100?0:e+1; draw(); }); draw();
  api.slider('过拟合强度 / overfit',0,1,.05,.45,v=>{noise=+v;gen();});
  api.button('重放 / replay',()=>{e=0;});
  return {stop(){T.stop();}};
});

/* ============ it 信息论 ============ */
const H2=p=>(p<=0||p>=1)?0:-(p*M.log2(p)+(1-p)*M.log2(1-p));

def('it_surprisal','惊讶度 = −log p','Surprisal','拖滑杆改 p：柱子高度 = −log₂p。p 每减半，柱子正好长高 1 bit；p=1 时高度为 0（白说）。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),pad=56;
  const x=d3.scaleLinear().domain([0,1]).range([pad,W-pad-150]),y=d3.scaleLinear().domain([0,7]).range([H-52,30]);
  const base=svg.append('g'),g=svg.append('g'); let p=.5;
  [0,1,2,3,4,5,6,7].forEach(v=>{ ln(base,pad,y(v),W-pad-150,y(v),C.hair,1); txt(base,pad-8,y(v)+4,v+'b',{anchor:'end',color:C.muted,size:10,mono:true}); });
  const pts=[]; for(let i=1;i<=400;i++){ const q=i/400; pts.push([x(q),y(M.min(7,-M.log2(q)))]); }
  path(base,pts,C.cy,2.4);
  K.label(base,pad,22,'−log₂ p 随 p 下降而爆炸','the rarer, the more informative',{size:12,color:C.cy});
  const draw=()=>{ g.selectAll('*').remove(); const s=-M.log2(p),sc=M.min(s,7);
    rect(g,W-140,y(sc),52,y(0)-y(sc),api.color,{rx:6,fo:.5});
    ln(g,x(p),y(0),x(p),y(sc),C.am,2,{dash:'4 3'}); dot(g,x(p),y(sc),6,C.am);
    ln(g,x(p),y(sc),W-140,y(sc),C.am,1,{dash:'2 4',op:.5});
    K.label(g,W-140,y(sc)-14,`${K.fmt(s,2)} bit`,`p = ${K.fmt(p,3)}`,{size:14,color:C.am});
    const half=-M.log2(p/2);
    K.label(g,pad,H-30,`p 减半 → ${K.fmt(s,2)} → ${K.fmt(half,2)} bit（正好 +1）`,`log turns "half as likely" into "one more bit"`,{size:12,color:C.ink2});
    txt(g,pad,H-10,'必然事件 p=1 信息量为 0；不可能事件 p→0 信息量 →∞',{color:C.muted,size:11}); };
  draw(); api.slider('概率 p',.005,1,.005,.5,v=>{p=+v;draw();});
  return none();
});

def('it_entropy','熵：钟形的平均惊讶度','Entropy of a coin','两根柱子 p 和 1−p 一起变。熵 = 两个惊讶度按概率加权的平均，公平硬币时最大 = 1 bit。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),T=timers();
  const bx=W*.60,pad=44,x=d3.scaleLinear().domain([0,1]).range([bx+30,W-30]),y=d3.scaleLinear().domain([0,1.05]).range([H-56,36]);
  const base=svg.append('g'),g=svg.append('g'); let p=.5,auto=false,dir=1;
  const pts=[]; for(let i=0;i<=200;i++){ const q=i/200; pts.push([x(q),y(H2(q))]); }
  path(base,pts,C.cy,2.2); ln(base,x(0),y(0),x(1),y(0),C.hair,1); ln(base,x(.5),y(0),x(.5),y(1),C.hair,1,{dash:'3 3'});
  K.label(base,bx+30,26,'H(p) 钟形，顶点在 p=0.5','max uncertainty at 50/50',{size:11,color:C.cy});
  const draw=()=>{ g.selectAll('*').remove(); const h=H2(p),bw=(bx-2*pad-24)/2;
    [[p,'正 heads',C.am],[1-p,'反 tails',C.vi]].forEach((d,i)=>{ const bh=(H-120)*d[0];
      rect(g,pad+i*(bw+24),H-56-bh,bw,bh,d[2],{rx:6,fo:.45});
      txt(g,pad+i*(bw+24)+bw/2,H-36,`${d[1]} ${K.fmt(d[0],2)}`,{anchor:'middle',color:d[2],size:11});
      if(d[0]>.02) txt(g,pad+i*(bw+24)+bw/2,H-62-bh+22,`−log₂ = ${K.fmt(-M.log2(d[0]),2)}`,{anchor:'middle',color:C.ink,size:11,mono:true}); });
    dot(g,x(p),y(h),7,C.gr);
    K.label(g,pad,24,`H = ${K.fmt(h,3)} bit`,`= ${K.fmt(p,2)}·${K.fmt(-M.log2(p),2)} + ${K.fmt(1-p,2)}·${K.fmt(-M.log2(1-p||1e-9),2)}`,{size:14,color:C.gr});
    txt(g,pad,H-14,'熵 = 猜出结果平均要问的最少是非题数；偏一点，就能用短码押常见的那面',{color:C.muted,size:11}); };
  draw(); api.slider('正面概率 p',.01,.99,.01,.5,v=>{p=+v;auto=false;draw();});
  api.button('自动扫描 / sweep',()=>{auto=!auto;});
  T.every(45,()=>{ if(!auto) return; p+=dir*.006; if(p>.99||p<.01){dir*=-1;} draw(); });
  return {stop(){T.stop();}};
});

def('it_cross_entropy','交叉熵：拿错码表要多付','Cross entropy','真分布 p 固定，滑杆挪你的 q。柱子上的数字是码长 −log₂q；平均码长 H(p,q) 永远 ≥ H(p)，差额就是 KL。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),n=5,pad=54,bw=(W-2*pad)/n;
  const g=svg.append('g'); let shift=0;
  const P=[.42,.26,.16,.10,.06];
  const draw=()=>{ g.selectAll('*').remove();
    const raw=P.map((_,i)=>M.exp(-((i-shift)*(i-shift))/2.6)),Z=d3.sum(raw),Q=raw.map(v=>v/Z);
    let hp=0,hpq=0; P.forEach((v,i)=>{ hp+=-v*M.log2(v); hpq+=-v*M.log2(M.max(Q[i],1e-9)); });
    P.forEach((v,i)=>{ const cx=pad+i*bw,hh=(H-160)*v,hq=(H-160)*Q[i],b=H-92;
      rect(g,cx+6,b-hh,bw/2-9,hh,C.cy,{rx:4,fo:.5});
      rect(g,cx+bw/2+3,b-hq,bw/2-9,hq,C.vi,{rx:4,fo:.5});
      txt(g,cx+bw/2,b+18,`符号 ${i+1}`,{anchor:'middle',color:C.muted,size:10});
      txt(g,cx+bw/4,b-hh-6,K.fmt(v,2),{anchor:'middle',color:C.cy,size:10,mono:true});
      txt(g,cx+bw*3/4,b-hq-6,K.fmt(Q[i],2),{anchor:'middle',color:C.vi,size:10,mono:true});
      txt(g,cx+bw/2,b+34,`码长 ${K.fmt(-M.log2(M.max(Q[i],1e-9)),1)}b`,{anchor:'middle',color:Q[i]<v?C.rd:C.gr,size:10,mono:true}); });
    K.label(g,pad,24,`H(p) = ${K.fmt(hp,3)}   H(p,q) = ${K.fmt(hpq,3)}   KL = ${K.fmt(hpq-hp,3)}`,`cross entropy = entropy + KL,  KL ≥ 0 always`,{size:13,color:hpq-hp<.02?C.gr:C.am});
    rect(g,pad,44,(W-2*pad)*M.min(1,hp/3),12,C.cy,{rx:6,fo:.6});
    rect(g,pad+(W-2*pad)*M.min(1,hp/3),44,(W-2*pad)*M.min(1,(hpq-hp)/3),12,C.rd,{rx:6,fo:.6});
    txt(g,W/2,H-40,'青 = 真分布 p（不可压缩的部分）  红 = KL（用错码表多付的）',{anchor:'middle',color:C.muted,size:11});
    txt(g,W/2,H-20,'训练分类器 = 最小化交叉熵 = 把你的 q 推到 p 上，KL→0',{anchor:'middle',color:C.muted,size:11});
    txt(g,W/2,H-2,'紫 = 你的模型 q',{anchor:'middle',color:C.vi,size:11}); };
  draw(); api.slider('把 q 挪到哪 / shift q',-1,4,.1,0,v=>{shift=+v;draw();});
  api.button('对齐到 p / align',()=>{shift=0;draw();});
  return none();
});

def('it_kl','KL 不对称：摊大饼 vs 钻一个峰','KL asymmetry','p 是双峰。最小化 KL(p‖q) 逼 q 盖住两个峰（摊大饼）；最小化 KL(q‖p) 让 q 缩进一个峰（钻峰）。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),pad=46,T=timers();
  const x=d3.scaleLinear().domain([-6,6]).range([pad,W-pad]),y=d3.scaleLinear().domain([0,.45]).range([H-58,34]);
  const N=(u,m,s)=>M.exp(-(u-m)*(u-m)/(2*s*s))/(s*M.sqrt(TAU));
  const P=u=>.5*N(u,-2.1,.85)+.5*N(u,2.1,.85);
  const g=svg.append('g'); let mu=0,sd=2.6,mode=0;
  const kl=(a,b)=>{ let s=0; for(let u=-8;u<=8;u+=.02){ const pa=M.max(a(u),1e-12),pb=M.max(b(u),1e-12); s+=pa*M.log2(pa/pb)*.02; } return s; };
  const draw=()=>{ g.selectAll('*').remove(); const Q=u=>N(u,mu,sd);
    const fill=(fn,col,op)=>{ const arr=[[x(-6),y(0)]]; for(let u=-6;u<=6;u+=.05) arr.push([x(u),y(fn(u))]); arr.push([x(6),y(0)]);
      g.append('path').attr('d',d3.line()(arr)+'Z').attr('fill',col).attr('fill-opacity',op).attr('stroke',col).attr('stroke-width',2); };
    fill(P,C.cy,.22); fill(Q,C.vi,.22);
    const ov=[]; for(let u=-6;u<=6;u+=.05) ov.push([x(u),y(M.min(P(u),Q(u)))]);
    ov.unshift([x(-6),y(0)]); ov.push([x(6),y(0)]);
    g.append('path').attr('d',d3.line()(ov)+'Z').attr('fill',C.gr).attr('fill-opacity',.30).attr('stroke','none');
    const f=kl(P,Q),r=kl(Q,P);
    K.label(g,pad,24,`KL(p‖q) = ${K.fmt(f,3)}   KL(q‖p) = ${K.fmt(r,3)}`,`asymmetric: KL(p‖q) ≠ KL(q‖p)`,{size:13,color:api.color});
    K.label(g,pad,H-38,mode?'目标：min KL(q‖p) → 钻进一个峰':'目标：min KL(p‖q) → 摊平盖住两峰',mode?'mode-seeking (reverse KL)':'mode-covering (forward KL)',{size:12,color:mode?C.rd:C.gr});
    txt(g,W-pad,24,`q: μ=${K.fmt(mu,2)} σ=${K.fmt(sd,2)}`,{anchor:'end',color:C.vi,size:11,mono:true});
    txt(g,pad,H-12,'p 大而 q 小 → 前向 KL 罚得狠（怕漏）；q 大而 p 小 → 反向 KL 罚得狠（怕越界）',{color:C.muted,size:11}); };
  const fit=()=>{ let best=null; for(let m=-3;m<=3;m+=.15) for(let s=.4;s<=3.4;s+=.1){
      const Q=u=>N(u,m,s),v=mode?kl(Q,P):kl(P,Q); if(!best||v<best.v) best={m,s,v}; }
    mu=best.m; sd=best.s; draw(); };
  draw(); api.slider('q 的中心 μ',-4,4,.1,0,v=>{mu=+v;draw();});
  api.slider('q 的宽度 σ',.35,3.5,.05,2.6,v=>{sd=+v;draw();});
  api.button('前向/反向 切换',()=>{mode^=1;draw();});
  api.button('自动最小化 / fit',fit);
  return {stop(){T.stop();}};
});

def('it_mutual_info','互信息：两个圆的重叠','Mutual information Venn','滑杆调 X 与 Y 的耦合强度。两圆重叠面积就是 I(X;Y) —— 知道 Y 之后 X 少掉的 bit 数。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'); let e=.02;
  const R=M.min(H*.30,W*.19),cy=H*.44;
  const draw=()=>{ g.selectAll('*').remove();
    const hx=1,hy=1,i=1-H2(e),hxy=hx+hy-i,d=(1-i)*2*R*.98,cx1=W*.42-d/2,cx2=W*.42+d/2;
    g.append('circle').attr('cx',cx1).attr('cy',cy).attr('r',R).attr('fill',C.cy).attr('fill-opacity',.20).attr('stroke',C.cy).attr('stroke-width',2);
    g.append('circle').attr('cx',cx2).attr('cy',cy).attr('r',R).attr('fill',C.vi).attr('fill-opacity',.20).attr('stroke',C.vi).attr('stroke-width',2);
    if(d<2*R){ const cl=uid('c'); const defs=svg.select('defs').empty()?svg.append('defs'):svg.select('defs');
      defs.selectAll('#'+cl).remove();
      const cp=defs.append('clipPath').attr('id',cl); cp.append('circle').attr('cx',cx1).attr('cy',cy).attr('r',R);
      g.append('circle').attr('cx',cx2).attr('cy',cy).attr('r',R).attr('clip-path',`url(#${cl})`).attr('fill',C.gr).attr('fill-opacity',.55); }
    txt(g,cx1-R*.55,cy+5,'H(X)',{anchor:'middle',color:C.cy,size:14,bold:true});
    txt(g,cx2+R*.55,cy+5,'H(Y)',{anchor:'middle',color:C.vi,size:14,bold:true});
    if(i>.06) txt(g,W*.42,cy+5,'I(X;Y)',{anchor:'middle',color:'#0B1020',size:13,bold:true});
    const bx=W-190;
    [['H(X)',hx,C.cy],['H(Y)',hy,C.vi],['I(X;Y)',i,C.gr],['H(X|Y)',hx-i,C.am],['H(X,Y)',hxy,C.ink2]].forEach((r,k)=>{
      const yy=52+k*34; txt(g,bx,yy,r[0],{color:r[2],size:12,mono:true});
      rect(g,bx+66,yy-11,90*M.min(1,r[1]/2),14,r[2],{rx:4,fo:.55});
      txt(g,W-16,yy,K.fmt(r[1],3),{anchor:'end',color:r[2],size:12,mono:true}); });
    K.label(g,26,26,`信道翻转率 ε = ${K.fmt(e,3)}   I = 1 − H(ε) = ${K.fmt(i,3)} bit`,`ε=0 → 完全重合;  ε=0.5 → 两圆分离，I=0`,{size:12,color:api.color});
    txt(g,26,H-14,'I = H(X) − H(X|Y)：告诉你 Y 之后，X 的不确定性掉了多少。独立时重叠为 0',{color:C.muted,size:11}); };
  draw(); api.slider('耦合噪声 ε',0,.5,.005,.02,v=>{e=+v;draw();});
  return none();
});

def('it_code_length','编码树：短码给常见的','Prefix code tree','霍夫曼从最小的两个概率开始合并。概率越大挂得越浅，码长 ≈ −log₂p，平均码长逼近熵。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let skew=1.6,step=0;
  const build=()=>{ const raw=d3.range(6).map(i=>M.pow(skew,-i)),Z=d3.sum(raw);
    let nodes=raw.map((v,i)=>({p:v/Z,name:'S'+(i+1),leaf:true}));
    const merges=[];
    let cur=nodes.slice();
    while(cur.length>1){ cur.sort((a,b)=>a.p-b.p); const a=cur.shift(),b=cur.shift(),m={p:a.p+b.p,l:a,r:b}; merges.push(m); cur.push(m); }
    return {root:cur[0],leaves:nodes,merges}; };
  const draw=()=>{ g.selectAll('*').remove(); const {root,leaves,merges}=build();
    const shown=M.min(step,merges.length);
    const codes={}; const walk=(n,c,d)=>{ if(n.leaf){codes[n.name]={c:c||'0',d:M.max(1,d)};return;} walk(n.l,c+'0',d+1); walk(n.r,c+'1',d+1); };
    walk(root,'',0);
    const depth=d3.max(Object.values(codes),v=>v.d),colw=(W-260)/(depth+1);
    const ys={},order=[]; const collect=n=>{ if(n.leaf){order.push(n);return;} collect(n.l); collect(n.r); }; collect(root);
    order.forEach((n,i)=>ys[n.name]=48+i*((H-120)/M.max(1,order.length-1)));
    const pos=n=>{ if(n.leaf) return {x:60+codes[n.name].d*colw,y:ys[n.name]};
      const a=pos(n.l),b=pos(n.r); return {x:M.min(a.x,b.x)-colw,y:(a.y+b.y)/2}; };
    const drawN=(n,vis)=>{ const p=pos(n);
      if(!n.leaf){ const a=pos(n.l),b=pos(n.r),on=merges.indexOf(n)<shown;
        ln(g,p.x,p.y,a.x,a.y,on?api.color:C.hair,on?2:1); ln(g,p.x,p.y,b.x,b.y,on?api.color:C.hair,on?2:1);
        txt(g,(p.x+a.x)/2,(p.y+a.y)/2-4,'0',{color:on?C.ink2:C.muted,size:10,mono:true});
        txt(g,(p.x+b.x)/2,(p.y+b.y)/2+12,'1',{color:on?C.ink2:C.muted,size:10,mono:true});
        dot(g,p.x,p.y,on?5:3,on?api.color:C.muted); drawN(n.l); drawN(n.r); }
      else { dot(g,p.x,p.y,6,C.cy);
        txt(g,p.x+12,p.y+4,`${n.name}  p=${K.fmt(n.p,3)}`,{color:C.ink,size:11,mono:true});
        txt(g,p.x+128,p.y+4,`${codes[n.name].c}  (${codes[n.name].d}b)`,{color:C.am,size:11,mono:true});
        txt(g,p.x+206,p.y+4,`−log₂p=${K.fmt(-M.log2(n.p),2)}`,{color:C.muted,size:10,mono:true}); } };
    drawN(root);
    const Hh=d3.sum(leaves,n=>-n.p*M.log2(n.p)),Lb=d3.sum(leaves,n=>n.p*codes[n.name].d);
    K.label(g,20,24,`熵 H = ${K.fmt(Hh,3)}   霍夫曼平均码长 L = ${K.fmt(Lb,3)}`,`H ≤ L < H+1  (merge step ${shown}/${merges.length})`,{size:13,color:C.gr});
    txt(g,20,H-10,'每步合并最小的两个概率；概率大的自然被挤在浅处 → 短码',{color:C.muted,size:11}); };
  T.every(700,()=>{ step=step>=6?0:step+1; draw(); }); draw();
  api.slider('分布偏斜 / skew',1.05,3.2,.05,1.6,v=>{skew=+v;step=6;draw();});
  api.button('重播合并 / replay',()=>{step=0;draw();});
  return {stop(){T.stop();}};
});

def('it_channel','信道容量：噪声越大，管子越细','Channel capacity','二元对称信道：翻转率 ε。容量 C = 1 − H(ε)。ε=0.5 时管子彻底堵死，一个 bit 都传不过去。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let e=.08,t=0;
  const pad=44,px=d3.scaleLinear().domain([0,.5]).range([W*.56,W-pad]),py=d3.scaleLinear().domain([0,1]).range([H-56,44]);
  const draw=()=>{ g.selectAll('*').remove(); const C0=1-H2(e);
    const L=W*.08,R=W*.40,y0=H*.30,y1=H*.60;
    [[y0,'0'],[y1,'1']].forEach((d,i)=>{ dot(g,L,d[0],14,C.cy); txt(g,L,d[0]+5,d[1],{anchor:'middle',color:'#0B1020',size:14,bold:true});
      dot(g,R,d[0],14,C.vi); txt(g,R,d[0]+5,d[1],{anchor:'middle',color:'#0B1020',size:14,bold:true}); });
    ln(g,L+16,y0,R-16,y0,C.gr,1+7*(1-e)); ln(g,L+16,y1,R-16,y1,C.gr,1+7*(1-e));
    ln(g,L+16,y0,R-16,y1,C.rd,1+7*e,{op:.8}); ln(g,L+16,y1,R-16,y0,C.rd,1+7*e,{op:.8});
    txt(g,(L+R)/2,y0-12,`1−ε = ${K.fmt(1-e,2)}`,{anchor:'middle',color:C.gr,size:11,mono:true});
    txt(g,(L+R)/2,H*.46,`ε = ${K.fmt(e,2)}`,{anchor:'middle',color:C.rd,size:11,mono:true});
    const bit=(M.floor(t/12)%2),flip=((M.floor(t/12)*2654435761)%1000)/1000<e;
    const ph=(t%12)/12,bx=L+16+(R-L-32)*ph,by=(bit?y1:y0)+(flip?(bit?y0-y1:y1-y0):0)*ph;
    dot(g,bx,by,6,flip?C.rd:C.am);
    txt(g,L,H*.22,'输入 in',{anchor:'middle',color:C.muted,size:11}); txt(g,R,H*.22,'输出 out',{anchor:'middle',color:C.muted,size:11});
    const pts=[]; for(let i=0;i<=100;i++){ const q=i/200; pts.push([px(q),py(1-H2(q))]); }
    path(g,pts,C.cy,2.2); ln(g,px(0),py(0),px(.5),py(0),C.hair,1);
    dot(g,px(e),py(C0),6,C.am);
    txt(g,px(0),py(1)-10,'C = 1 − H(ε)',{color:C.cy,size:11,mono:true});
    K.label(g,pad,26,`容量 C = ${K.fmt(C0,3)} bit/次`,`below C: near-error-free coding exists;  above C: errors unavoidable`,{size:14,color:C.am});
    txt(g,pad,H-12,'ε=0.5 时输出与输入完全无关，容量为 0 —— 噪声把两个档位糊成了一个',{color:C.muted,size:11}); };
  T.every(60,()=>{t++;draw();}); draw();
  api.slider('翻转率 ε',0,.5,.005,.08,v=>{e=+v;draw();});
  return {stop(){T.stop();}};
});

def('it_max_entropy','最大熵：约束按住几处，其余摊平','Maximum entropy','只知道均值时，最大熵分布是指数族。滑杆改约束的均值，看分布怎么在“满足约束”和“尽量摊平”之间取舍。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),n=10,pad=54,g=svg.append('g'); let mean=4.5,mode=0;
  const solve=(m)=>{ let lo=-4,hi=4;
    for(let it=0;it<80;it++){ const lam=(lo+hi)/2,w=d3.range(n).map(i=>M.exp(-lam*i)),Z=d3.sum(w),p=w.map(v=>v/Z);
      const mu=d3.sum(p.map((v,i)=>v*i)); if(mu>m) lo=lam; else hi=lam; }
    const lam=(lo+hi)/2,w=d3.range(n).map(i=>M.exp(-lam*i)),Z=d3.sum(w); return {lam,p:w.map(v=>v/Z)}; };
  const draw=()=>{ g.selectAll('*').remove();
    const s=solve(mean),p=mode?d3.range(n).map((_,i)=>{const q=M.exp(-M.pow(i-mean,2)/1.2);return q;}):s.p;
    const Z=d3.sum(p),P=p.map(v=>v/Z),bw=(W-2*pad)/n,base=H-84;
    const Hh=d3.sum(P.map(v=>v>0?-v*M.log2(v):0)),mu=d3.sum(P.map((v,i)=>v*i));
    P.forEach((v,i)=>{ const hh=(H-170)*v/d3.max(P);
      rect(g,pad+i*bw+5,base-hh,bw-10,hh,mode?C.rd:api.color,{rx:5,fo:.5});
      txt(g,pad+i*bw+bw/2,base+18,String(i),{anchor:'middle',color:C.muted,size:10,mono:true});
      txt(g,pad+i*bw+bw/2,base-hh-6,K.fmt(v,3),{anchor:'middle',color:C.ink2,size:9,mono:true}); });
    ln(g,pad+mean*bw+bw/2,44,pad+mean*bw+bw/2,base,C.am,2,{dash:'5 4'});
    txt(g,pad+mean*bw+bw/2+6,58,`约束 E[X]=${K.fmt(mean,2)}`,{color:C.am,size:11});
    K.label(g,pad,26,mode?`人为挑的窄分布：H = ${K.fmt(Hh,3)}（更低 = 偷加了假设）`:`最大熵解：H = ${K.fmt(Hh,3)}  λ = ${K.fmt(s.lam,3)}`,
      mode?'hand-picked narrow distribution — extra assumptions':`p(i) ∝ exp(−λ·i);  E[X] = ${K.fmt(mu,3)}`,{size:13,color:mode?C.rd:C.gr});
    txt(g,pad,H-14,'只知均值 → 指数分布；只知均值方差 → 高斯；什么都不知 → 均匀。约束几个，就只按住几个',{color:C.muted,size:11}); };
  draw(); api.slider('约束均值 E[X]',.6,8.4,.1,4.5,v=>{mean=+v;draw();});
  api.button('对比：人为窄分布',()=>{mode^=1;draw();});
  return none();
});

def('it_compression','MDL：模型长度 + 残差长度的谷底','MDL: model + residual','滑杆加模型复杂度。模型描述越长，残差越短；总长有一个谷底，那就是最佳复杂度。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),pad=52,g=svg.append('g'); let k=1;
  const x=d3.scaleLinear().domain([0,14]).range([pad,W*.56]),y=d3.scaleLinear().domain([0,120]).range([H-58,36]);
  const mdl=q=>8*q+4,res=q=>110*M.exp(-q/2.3)+6;
  const draw=()=>{ g.selectAll('*').remove();
    [0,40,80,120].forEach(v=>{ ln(g,pad,y(v),W*.56,y(v),C.hair,1); txt(g,pad-8,y(v)+4,String(v),{anchor:'end',color:C.muted,size:10,mono:true}); });
    const mk=q=>d3.range(0,14.1,.25).map(q2=>[x(q2),y(q(q2))]);
    path(g,mk(mdl),C.vi,2.2); path(g,mk(res),C.am,2.2); path(g,mk(q=>mdl(q)+res(q)),C.gr,2.8);
    let best=0; for(let q=0;q<=14;q+=.05) if(mdl(q)+res(q)<mdl(best)+res(best)) best=q;
    ln(g,x(best),y(0),x(best),y(120),C.gr,1.4,{dash:'4 4'});
    dot(g,x(k),y(mdl(k)+res(k)),7,C.gr); dot(g,x(k),y(mdl(k)),5,C.vi); dot(g,x(k),y(res(k)),5,C.am);
    txt(g,W*.56+6,y(mdl(14)),'模型 model',{color:C.vi,size:11}); txt(g,W*.56+6,y(res(14))+14,'残差 residual',{color:C.am,size:11});
    txt(g,x(best)+6,y(118),`谷底 k*≈${K.fmt(best,1)}`,{color:C.gr,size:11});
    const bx=W*.72,tot=mdl(k)+res(k),sc=2.2;
    rect(g,bx,H*.34,mdl(k)*sc,26,C.vi,{rx:5,fo:.55}); rect(g,bx+mdl(k)*sc,H*.34,res(k)*sc,26,C.am,{rx:5,fo:.55});
    txt(g,bx,H*.34-10,'压缩后的文件 = 模型 + 残差',{color:C.ink2,size:11});
    txt(g,bx,H*.34+48,`总长 ${K.fmt(tot,1)} bit`,{color:C.gr,size:13,mono:true,bold:true});
    K.label(g,pad,24,`复杂度 k = ${K.fmt(k,1)}   模型 ${K.fmt(mdl(k),1)} + 残差 ${K.fmt(res(k),1)} = ${K.fmt(tot,1)}`,
      `minimum description length ⟺ best generalization`,{size:12,color:api.color});
    txt(g,pad,H-12,'能压缩 = 发现了规律。压得最短的那个模型，就是最好的模型',{color:C.muted,size:11}); };
  draw(); api.slider('模型复杂度 k',0,14,.2,1,v=>{k=+v;draw();});
  return none();
});

/* ============ fo 傅里叶与信号 ============ */
def('fo_eigenfunction','正弦进，正弦出','Sinusoids pass through unchanged','同一个线性时不变盒子：喂方波出来变形，喂正弦出来还是同频正弦，只矮了一点、平移了一点。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'); let t0=null,ph=0,which=0,tau=.55;
  const box=[W*.40,H*.18,W*.20,H*.30],pad=30;
  const sq=u=>{ let s=0; for(let k=1;k<=15;k+=2) s+=M.sin(k*u)/k; return s*4/PI*.8; };
  const sqOut=u=>{ let s=0; for(let k=1;k<=15;k+=2){ const g0=1/M.sqrt(1+M.pow(k*tau,2)),p=M.atan(k*tau); s+=g0*M.sin(k*u-p)/k; } return s*4/PI*.8; };
  const sn=u=>M.sin(u),snOut=u=>M.sin(u-M.atan(tau))/M.sqrt(1+tau*tau);
  const draw=()=>{ g.selectAll('*').remove();
    rect(g,box[0],box[1],box[2],box[3],api.color,{rx:12,fo:.12,sw:2});
    K.label(g,box[0]+box[2]/2,box[1]+box[3]/2-4,'LTI 系统','linear time-invariant',{anchor:'middle',color:api.color,size:13});
    const wIn=[pad,box[0]-20],wOut=[box[0]+box[2]+20,W-pad],yc=box[1]+box[3]/2,amp=H*.12;
    const fi=which?sq:sn,fo=which?sqOut:snOut;
    [[wIn,fi,C.cy],[wOut,fo,C.gr]].forEach(d=>{ const pts=[];
      for(let i=0;i<=200;i++){ const u=i/200*4*PI,px=d[0][0]+(d[0][1]-d[0][0])*i/200; pts.push([px,yc-amp*d[1](u+ph)]); }
      path(g,pts,d[2],2.4); ln(g,d[0][0],yc,d[0][1],yc,C.hair,1); });
    K.label(g,pad,H*.14,which?'输入：方波':'输入：正弦',which?'square wave in':'sine in',{color:C.cy,size:12});
    K.label(g,box[0]+box[2]+20,H*.14,which?'输出：波形被改了形状':'输出：同频正弦，只矮了 / 移了',which?'shape changed — many frequencies, many gains':'same frequency, new amplitude & phase',{color:which?C.rd:C.gr,size:12});
    K.label(g,pad,H-38,`增益 ${K.fmt(1/M.sqrt(1+tau*tau),3)}   相移 −${K.fmt(M.atan(tau),3)} rad`,`sin(ωt) → |H(ω)|·sin(ωt + ∠H(ω))`,{size:12,color:C.am});
    txt(g,pad,H-14,'正弦是 LTI 系统的特征函数：频率这条身份证过箱子不变，只有幅度和相位被改',{color:C.muted,size:11}); };
  const stop=api.play(t=>{ if(t0==null) t0=t; ph+=(t-t0)*2.2; t0=t; draw(); });
  api.slider('系统时间常数 τ',.05,2.5,.05,.55,v=>{tau=+v;});
  api.button('正弦 / 方波 切换',()=>{which^=1;});
  return {stop(){stop&&stop();}};
});

def('fo_basis','频域柱子 ↔ 时域波形','Time domain ↔ frequency domain','拖动频域柱子的高度，时域波形立刻跟着变。同一个向量，两套坐标读数。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),hg=svg.append('g');
  const A=[0,.9,0,.45,0,.3,0,0],N=A.length,pad=36,bx=W*.56,bw=(W-bx-pad)/N,base=H-56;
  const wy=H*.30,wamp=H*.20;
  const sig=u=>{ let s=0; for(let k=1;k<N;k++) s+=A[k]*M.sin(k*u); return s; };
  const draw=()=>{ g.selectAll('*').remove(); hg.selectAll('*').remove();
    const pts=[]; for(let i=0;i<=320;i++){ const u=i/320*TAU; pts.push([pad+(bx-2*pad)*i/320,wy-wamp*sig(u)]); }
    ln(g,pad,wy,bx-pad,wy,C.hair,1); path(g,pts,C.cy,2.6);
    for(let k=1;k<N;k++){ if(A[k]<.02) continue; const p2=[];
      for(let i=0;i<=320;i++){ const u=i/320*TAU; p2.push([pad+(bx-2*pad)*i/320,wy-wamp*A[k]*M.sin(k*u)]); }
      path(g,p2,C.vi,1,{op:.35}); }
    K.label(g,pad,H*.10,'时域：每个时刻的值','time domain samples',{color:C.cy,size:12});
    K.label(g,bx,H*.10,'频域：每个频率的成分','frequency-domain coefficients',{color:C.am,size:12});
    for(let k=1;k<N;k++){ const hh=(base-H*.20)*A[k],x0=bx+k*bw;
      rect(g,x0+4,base-hh,bw-8,hh,C.am,{rx:4,fo:.5});
      txt(g,x0+bw/2,base+16,`${k}f`,{anchor:'middle',color:C.muted,size:10,mono:true});
      handle(svg,hg,x0+bw/2,base-hh,C.am,(mx,my)=>{ A[k]=M.max(0,M.min(1,(base-my)/(base-H*.20))); draw(); }); }
    ln(g,bx,base,W-pad,base,C.hair,1);
    K.label(g,pad,H-34,`系数 = [${A.slice(1).map(v=>K.fmt(v,2)).join(', ')}]`,`DFT is an orthogonal matrix: same vector, rotated axes`,{size:11,color:C.ink2});
    txt(g,pad,H-12,'向量本身一个字没变，只是换了一组基去读它。淡紫是每个单频成分',{color:C.muted,size:11}); };
  draw();
  api.button('方波配方 / square',()=>{ for(let k=1;k<N;k++) A[k]=k%2?1/k:0; draw(); });
  api.button('锯齿 / sawtooth',()=>{ for(let k=1;k<N;k++) A[k]=1/k*(k%2?1:-1); draw(); });
  api.button('清空 / clear',()=>{ for(let k=1;k<N;k++) A[k]=0; A[1]=.9; draw(); });
  return none();
});

def('fo_fft','FFT：分治把 N² 砍成 N log N','FFT divide and conquer','8 点任务劈成两个 4 点，再劈成 4 个 2 点……递归树 log₂N 层，每层合并代价 O(N)。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let lvl=0,N=8;
  const draw=()=>{ g.selectAll('*').remove(); const L=M.log2(N),rows=[];
    for(let d=0;d<=L;d++){ const cnt=M.pow(2,d),sz=N/cnt,arr=[];
      for(let b=0;b<cnt;b++){ const items=[]; for(let i=0;i<sz;i++) items.push(b+i*cnt); arr.push(items); }
      rows.push({d,cnt,sz,arr}); }
    const rh=(H-120)/(L+1);
    rows.forEach(r=>{ const on=r.d<=lvl,y=52+r.d*rh,tot=W-90,gapw=10,bw=(tot-(r.cnt-1)*gapw)/r.cnt;
      r.arr.forEach((items,b)=>{ const x0=45+b*(bw+gapw);
        rect(g,x0,y,bw,rh-22,on?(b%2?C.vi:C.cy):C.muted,{rx:6,fo:on?.22:.05,stroke:on?(b%2?C.vi:C.cy):C.hair});
        txt(g,x0+bw/2,y+(rh-22)/2+4,items.join(' '),{anchor:'middle',color:on?C.ink:C.muted,size:M.min(12,bw/(items.length*4.6)+5),mono:true});
        if(r.d>0&&on){ const pw=(tot-(r.cnt/2-1)*gapw)/(r.cnt/2),px=45+M.floor(b/2)*(pw+gapw)+pw/2;
          ln(g,px,y-22,x0+bw/2,y,api.color,1.2,{op:.6}); } });
      txt(g,10,y+(rh-22)/2+4,`层 ${r.d}`,{color:on?C.ink2:C.muted,size:10,mono:true});
      if(on) txt(g,W-8,y+(rh-22)/2+4,`${r.cnt}×${r.sz}`,{anchor:'end',color:C.muted,size:10,mono:true}); });
    K.label(g,45,26,`N = ${N}   层数 log₂N = ${L}   每层合并 O(N)   总计 O(N log N) = ${N*L}`,
      `naive DFT costs N² = ${N*N};  speedup ×${K.fmt(N*N/M.max(1,N*L),1)}`,{size:13,color:api.color});
    txt(g,45,H-38,'偶数下标一组、奇数下标一组，各做一次半长 DFT，再用旋转因子 W = e^{−2πi/N} 拼回来',{color:C.muted,size:11});
    txt(g,45,H-16,`当前展开到第 ${lvl} 层（蓝=偶数支，紫=奇数支）`,{color:C.ink2,size:11}); };
  T.every(820,()=>{ lvl=lvl>=M.log2(N)?0:lvl+1; draw(); }); draw();
  api.slider('点数 N (2^k)',3,6,1,3,v=>{N=M.pow(2,+v);lvl=0;draw();});
  api.button('重播 / replay',()=>{lvl=0;draw();});
  return {stop(){T.stop();}};
});

def('fo_convolution','卷积定理：时域滑动 = 频域相乘','Convolution theorem','上面是核在信号上滑动做重叠积分（慢）；下面是两条频谱一格对一格相乘（快）。结果一模一样。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let s=0,kw=6;
  const N=48,sig=d3.range(N).map(i=>(i>10&&i<20?1:0)+(i>26&&i<32?.7:0));
  const draw=()=>{ g.selectAll('*').remove();
    const ker=d3.range(N).map(i=>(i<kw?1/kw:0)),out=d3.range(N).map(i=>{ let v=0; for(let j=0;j<kw;j++) if(i-j>=0) v+=sig[i-j]/kw; return v; });
    const pad=44,bw=(W-2*pad)/N,rowY=[H*.20,H*.42,H*.62];
    const bars=(arr,y,col,upto)=>arr.forEach((v,i)=>{ if(upto!=null&&i>upto) return;
      rect(g,pad+i*bw+.6,y-v*H*.13,bw-1.2,v*H*.13,col,{rx:1,fo:.55}); });
    bars(sig,rowY[0],C.cy); bars(out,rowY[2],C.gr,s);
    for(let j=0;j<kw;j++){ const i=s-j; if(i<0||i>=N) continue;
      rect(g,pad+i*bw+.6,rowY[0]-sig[i]*H*.13,bw-1.2,sig[i]*H*.13,C.am,{rx:1,fo:.8}); }
    rect(g,pad+M.max(0,s-kw+1)*bw,rowY[0]-H*.135,kw*bw,H*.135,C.am,{rx:3,fo:.10,sw:1.5,stroke:C.am});
    dot(g,pad+s*bw+bw/2,rowY[2]-out[s]*H*.13-8,4,C.am);
    K.label(g,pad,rowY[0]-H*.155,'信号 x（黄框 = 核当前覆盖的窗）','signal x, kernel window slides',{color:C.cy,size:11});
    K.label(g,pad,rowY[2]-H*.155,'输出 = 每一步窗内加权和','output y = x ∗ h (running weighted sum)',{color:C.gr,size:11});
    const fx=k=>{ let re=0,im=0; for(let i=0;i<N;i++){ re+=sig[i]*M.cos(-TAU*k*i/N); im+=sig[i]*M.sin(-TAU*k*i/N); } return M.hypot(re,im)/N; };
    const fh=k=>{ const a=PI*k*kw/N; return k===0?1:M.abs(M.sin(a)/(kw*M.sin(PI*k/N)||1e-9)); };
    const fpad=pad,fbw=(W-2*pad)/24,fy=H-56;
    for(let k=0;k<24;k++){ const a=fx(k)*3.2,b=fh(k),c=a*b;
      rect(g,fpad+k*fbw+1,fy-a*H*.10,fbw/3-1,a*H*.10,C.cy,{rx:1,fo:.5});
      rect(g,fpad+k*fbw+fbw/3+1,fy-b*H*.10,fbw/3-1,b*H*.10,C.vi,{rx:1,fo:.5});
      rect(g,fpad+k*fbw+2*fbw/3+1,fy-c*H*.10,fbw/3-1,c*H*.10,C.gr,{rx:1,fo:.7}); }
    K.label(g,pad,fy-H*.115,'频域：|X|·|H| = |Y| 逐格相乘（青×紫=绿）','pointwise multiply in frequency',{color:C.vi,size:11});
    K.label(g,W-230,26,`滑到第 ${s} 格   核宽 ${kw}`,`time O(N·k) vs freq O(N log N)`,{size:12,color:api.color}); };
  T.every(90,()=>{ s=s>=N-1?0:s+1; draw(); }); draw();
  api.slider('核宽度 / kernel',2,14,1,6,v=>{kw=+v;s=0;draw();});
  api.button('重扫 / rescan',()=>{s=0;draw();});
  return {stop(){T.stop();}};
});

def('fo_sampling','采样太稀 → 混叠出假频','Sampling & aliasing','真信号频率 f，采样率 fs 固定。当 f > fs/2，采样点上冒出一条完全不同的低频假信号 —— 车轮倒转。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),pad=44; let f=1.4,fs=8,t0=null,ph=0;
  const yc=H*.36,amp=H*.20,Tw=2;
  const draw=()=>{ g.selectAll('*').remove(); ln(g,pad,yc,W-pad,yc,C.hair,1);
    const px=u=>pad+(W-2*pad)*u/Tw;
    const pts=[]; for(let i=0;i<=600;i++){ const u=i/600*Tw; pts.push([px(u),yc-amp*M.sin(TAU*f*u+ph)]); }
    path(g,pts,C.cy,2.2,{op:.85});
    const ny=fs/2,alias=M.abs(f-fs*M.round(f/fs)),bad=f>ny+1e-9;
    if(bad){ const ap=[]; for(let i=0;i<=600;i++){ const u=i/600*Tw;
        ap.push([px(u),yc-amp*M.sin(TAU*alias*u*(M.sign(M.sin(TAU*f/fs))||1)+ph*alias/f)]); }
      path(g,ap,C.rd,2.4,{dash:'6 4'}); }
    const n=M.floor(fs*Tw);
    for(let k=0;k<=n;k++){ const u=k/fs,v=M.sin(TAU*f*u+ph);
      ln(g,px(u),yc,px(u),yc-amp*v,C.am,1,{op:.5}); dot(g,px(u),yc-amp*v,4.5,C.am); }
    K.label(g,pad,26,`信号 f = ${K.fmt(f,2)} Hz   采样率 fs = ${fs} Hz   奈奎斯特 fs/2 = ${K.fmt(ny,2)}`,
      bad?`ALIASED → looks like ${K.fmt(alias,2)} Hz`:`f < fs/2 → reconstruction is exact`,{size:13,color:bad?C.rd:C.gr});
    K.label(g,pad,H-72,bad?'混叠：高频折到低频区，红虚线才是你重建出来的东西':'安全区：采样点唯一决定原信号',
      bad?'aliasing: high frequency folds down':'no aliasing',{size:13,color:bad?C.rd:C.gr});
    const sx=W*.55,sw=W*.40,sy=H-40;
    ln(g,sx,sy,sx+sw,sy,C.hair,1);
    [0,1,2].forEach(m=>[1,-1].forEach(sg=>{ const pos=m*fs+sg*f; if(pos<0||pos>3*fs) return;
      const X=sx+sw*pos/(3*fs); ln(g,X,sy,X,sy-(m?24:34),m?C.vi:C.cy,m?2:3); }));
    const nx=sx+sw*ny/(3*fs); ln(g,nx,sy+6,nx,sy-40,C.am,1.4,{dash:'3 3'});
    txt(g,nx,sy+18,'fs/2',{anchor:'middle',color:C.am,size:10,mono:true});
    txt(g,sx,sy-46,'频谱按 fs 复制成一排；采太慢，副本互相压上',{color:C.muted,size:10}); };
  const stop=api.play(t=>{ if(t0==null)t0=t; ph+=(t-t0)*1.1; t0=t; draw(); });
  api.slider('信号频率 f',.2,9,.1,1.4,v=>{f=+v;});
  api.slider('采样率 fs',3,20,1,8,v=>{fs=+v;});
  return {stop(){stop&&stop();}};
});

def('fo_filter','滤波 = 给每个频率配一个增益','Low-pass / high-pass','频谱上盖一张模板：留下的原样通过，抹掉的消失。看波形怎么被磨平或被掏空。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'); let cut=5,mode=0,t0=null,ph=0;
  const N=16,A=d3.range(N).map(k=>k===0?0:(k<4?.9/k:.34/M.sqrt(k)));
  const draw=()=>{ g.selectAll('*').remove();
    const gain=k=>mode?1/(1+M.pow(cut/M.max(k,.3),4)):1/(1+M.pow(k/cut,4));
    const pad=40,wy=H*.26,amp=H*.16,bx=W*.56;
    const wave=(fn,col,w)=>{ const pts=[]; for(let i=0;i<=400;i++){ const u=i/400*TAU; let s=0;
        for(let k=1;k<N;k++) s+=fn(k)*M.sin(k*u+ph*(1+k*.02)); pts.push([pad+(bx-2*pad)*i/400,wy-amp*s]); }
      path(g,pts,col,w); };
    ln(g,pad,wy,bx-pad,wy,C.hair,1);
    wave(k=>A[k],C.muted,1.4); wave(k=>A[k]*gain(k),C.gr,2.6);
    K.label(g,pad,H*.09,mode?'高通：留快的，慢的被掏掉':'低通：留慢的，快的被磨平',
      mode?'high-pass keeps fast wiggles':'low-pass keeps slow trend',{color:C.gr,size:13});
    txt(g,pad,H-38,'灰 = 原波形    绿 = 滤波后',{color:C.muted,size:11});
    const fpad=bx,fw=(W-fpad-30)/N,base=H-56;
    for(let k=1;k<N;k++){ const h0=(base-H*.22)*A[k]/.9,h1=h0*gain(k);
      rect(g,fpad+k*fw+2,base-h0,fw-4,h0,C.muted,{rx:2,fo:.20,so:.4});
      rect(g,fpad+k*fw+2,base-h1,fw-4,h1,C.am,{rx:2,fo:.6}); }
    const mp=[]; for(let k=0;k<=N;k+=.2) mp.push([fpad+k*fw+fw/2,base-(base-H*.22)*gain(k)]);
    path(g,mp,C.vi,2.2); ln(g,fpad,base,W-30,base,C.hair,1);
    ln(g,fpad+cut*fw+fw/2,base,fpad+cut*fw+fw/2,H*.22,C.rd,1.6,{dash:'4 4'});
    K.label(g,fpad,H*.18,'紫线 = 滤波器频响模板','filter gain template |H(f)|',{color:C.vi,size:11});
    K.label(g,fpad,26,`截止 ${K.fmt(cut,1)}   ${mode?'high-pass':'low-pass'}`,`gain = 1/(1+(f/fc)⁴) — slope steepness costs time-domain ringing`,{size:12,color:api.color});
    txt(g,pad,H-14,'过渡带越陡，时域冲激响应拖得越长（时频不能同时锋利）',{color:C.muted,size:11}); };
  const stop=api.play(t=>{ if(t0==null)t0=t; ph+=(t-t0)*1.3; t0=t; draw(); });
  api.slider('截止频率 fc',1,14,.5,5,v=>{cut=+v;});
  api.button('低通 / 高通 切换',()=>{mode^=1;});
  return {stop(){stop&&stop();}};
});

def('fo_window','窗函数：主瓣宽 换 旁瓣低','Window functions','矩形窗让谱线长出一排小耳朵（泄漏）；换成汉宁窗耳朵没了，但中间那根线变胖。这是必付的税。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let mix=0,L=48,auto=true;
  const win=(i,n)=>{ const r=1,h=.5-.5*M.cos(TAU*i/(n-1)); return (1-mix)*r+mix*h; };
  const draw=()=>{ g.selectAll('*').remove();
    const pad=40,wy=H*.24,amp=H*.13,bx=W*.50,f0=5.35;
    const pts=[],wp=[];
    for(let i=0;i<L;i++){ const x=pad+(bx-2*pad)*i/(L-1),w=win(i,L);
      pts.push([x,wy-amp*w*M.sin(TAU*f0*i/L)]); wp.push([x,wy-amp*w]); }
    path(g,wp,C.vi,1.6,{dash:'4 3'}); path(g,pts.map(p=>[p[0],wy+ (wy-p[1])*0+ (p[1]-wy)]),C.cy,2);
    ln(g,pad,wy,bx-pad,wy,C.hair,1);
    K.label(g,pad,H*.09,mix<.5?'矩形窗：两端硬切':'汉宁窗：两端渐隐',mix<.5?'rectangular window — hard edges':'Hann window — tapered edges',{color:C.vi,size:12});
    const sx=bx,sw=W-bx-34,sy=H-58,db=v=>M.max(-70,20*M.log10(M.max(v,1e-9)));
    const spec=[]; let peak=0,vals=[];
    for(let k=0;k<=L/2;k+=.08){ let re=0,im=0;
      for(let i=0;i<L;i++){ const w=win(i,L),s=w*M.sin(TAU*f0*i/L); re+=s*M.cos(-TAU*k*i/L); im+=s*M.sin(-TAU*k*i/L); }
      const m=M.hypot(re,im)/L; peak=M.max(peak,m); vals.push([k,m]); }
    vals.forEach(v=>spec.push([sx+sw*v[0]/(L/2),sy+(sy-H*.20)*db(v[1]/peak)/70]));
    [0,-20,-40,-60].forEach(d=>{ const yy=sy+(sy-H*.20)*d/70; ln(g,sx,yy,sx+sw,yy,C.hair,1);
      txt(g,sx-6,yy+4,d+'dB',{anchor:'end',color:C.muted,size:9,mono:true}); });
    path(g,spec,C.am,2);
    let side=-99; vals.forEach(v=>{ if(M.abs(v[0]-f0)>2.2) side=M.max(side,db(v[1]/peak)); });
    let mw=0; vals.forEach(v=>{ if(db(v[1]/peak)>-6) mw=M.max(mw,M.abs(v[0]-f0)*2); });
    K.label(g,sx,H*.11,`主瓣宽 ≈ ${K.fmt(mw,2)} bin   最高旁瓣 ${K.fmt(side,1)} dB`,`rect: −13dB sidelobes;  Hann: −31dB but 2× wider main lobe`,{size:12,color:C.am});
    K.label(g,pad,H-38,`窗形 ${K.fmt(mix,2)}（0=矩形 1=汉宁）   窗长 ${L}`,`taper trades resolution for leakage`,{size:12,color:api.color});
    txt(g,pad,H-14,'截断信号 = 乘一个窗；频域被窗的谱抹开。软窗 = 少泄漏，代价是分辨率变粗',{color:C.muted,size:11}); };
  T.every(60,()=>{ if(!auto) return; mix+=.012; if(mix>1){mix=0;} draw(); }); draw();
  api.slider('矩形 → 汉宁',0,1,.02,0,v=>{auto=false;mix=+v;draw();});
  api.slider('窗长 L',16,96,8,48,v=>{L=+v;draw();});
  api.button('自动扫 / auto',()=>{auto=!auto;});
  return {stop(){T.stop();}};
});

def('fo_spectrogram','频谱图：窗长决定你看清谁','Spectrogram tradeoff','一段扫频 + 两声短促敲击。窗短 → 敲击的竖线清楚，扫频糊；窗长 → 扫频这条斜线锐利，敲击被抹宽。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let wl=24,t=0;
  const NT=64,NF=28;
  const draw=()=>{ g.selectAll('*').remove();
    const pad=52,cw=(W-pad-24)/NT,ch=(H-140)/NF,top=64;
    const sigF=i=>3+ i/NT*18;
    for(let ti=0;ti<NT;ti++) for(let fi=0;fi<NF;fi++){
      const tw=wl/12,fw=12/wl;
      let v=M.exp(-M.pow((fi-sigF(ti))/(1.1*fw+.5),2));
      [16,42].forEach(tk=>{ v+=1.15*M.exp(-M.pow((ti-tk)/(1.0*tw+.4),2))*M.exp(-M.pow((fi-16)/(9/(tw+.3)+1),2)); });
      v=M.min(1,v);
      if(v>.02) rect(g,pad+ti*cw,top+(NF-1-fi)*ch,cw+.5,ch+.5,v>.6?C.am:v>.3?api.color:C.vi,{rx:0,fo:.15+.8*v,sw:0}); }
    ln(g,pad,top+NF*ch,W-24,top+NF*ch,C.hair,1); ln(g,pad,top,pad,top+NF*ch,C.hair,1);
    txt(g,W-24,top+NF*ch+18,'时间 time →',{anchor:'end',color:C.muted,size:11});
    txt(g,pad-8,top+8,'频率 freq ↑',{anchor:'end',color:C.muted,size:11});
    const wpx=cw*wl/2.2,tx=pad+(t%NT)*cw;
    rect(g,tx-wpx/2,top,wpx,NF*ch,C.gr,{rx:2,fo:.10,sw:1.6,stroke:C.gr});
    txt(g,tx,top-8,`分析窗 ${wl}`,{anchor:'middle',color:C.gr,size:11,mono:true});
    K.label(g,pad,26,wl<26?'短窗：时间准，频率糊':wl>60?'长窗：频率准，时间糊':'中等窗：两边都还行',
      `Δt·Δf ≥ 1/4π — you cannot sharpen both`,{size:14,color:wl<26?C.cy:wl>60?C.vi:C.gr});
    txt(g,pad,H-38,'斜线 = 扫频信号；两根竖条 = 短促敲击。移动窗长看它们谁清楚谁糊',{color:C.muted,size:11});
    txt(g,pad,H-16,'STFT = 切段 + 每段一次 FFT + 堆成热图',{color:C.muted,size:11}); };
  T.every(110,()=>{t++;draw();}); draw();
  api.slider('窗长 / window',8,88,4,24,v=>{wl=+v;draw();});
  return {stop(){T.stop();}};
});

def('fo_wavelet','小波：砖块随频率变形状','Wavelet tiling','STFT 的砖一律等大；小波在高频区又扁又宽（时间细），在低频区又高又窄（频率细）。按钮切换看形变。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let mode=0,p=1,dir=1;
  const draw=()=>{ g.selectAll('*').remove();
    const pad=52,top=54,PW=W-pad-140,PH=H-140;
    ln(g,pad,top+PH,pad+PW,top+PH,C.hair,1.4); ln(g,pad,top,pad,top+PH,C.hair,1.4);
    txt(g,pad+PW,top+PH+20,'时间 time →',{anchor:'end',color:C.muted,size:11});
    txt(g,pad-8,top+10,'频率 freq ↑',{anchor:'end',color:C.muted,size:11});
    const rows=5;
    for(let r=0;r<rows;r++){
      const nS=8,nW=M.pow(2,r);
      const n=M.round(nS+(nW-nS)*p*mode+(nW-nS)*p*(mode?0:0));
      const cnt=mode?M.round(nS*M.pow(2,r*p)/M.pow(2,2*p)*4)||1:8;
      const hS=PH/rows,hW=PH*(M.pow(2,r)/(M.pow(2,rows)-1));
      let y0=0; for(let k=0;k<r;k++) y0+=mode?PH*(M.pow(2,k)/(M.pow(2,rows)-1))*p+PH/rows*(1-p):PH/rows;
      const hh=mode?hW*p+hS*(1-p):hS;
      const nc=M.max(1,M.round(mode?(8*M.pow(2,r-2))*p+8*(1-p):8));
      const bw=PW/nc,col=[C.vi,C.cy,C.gr,C.am,C.rd][r];
      for(let c=0;c<nc;c++) rect(g,pad+c*bw+1,top+PH-y0-hh+1,bw-2,hh-2,col,{rx:3,fo:.22,sw:1,stroke:col}); }
    K.label(g,pad,26,mode>.5?'小波：高频用短窗，低频用长窗':'STFT：所有砖一样大',
      mode>.5?'wavelet: constant-Q tiling':'STFT: uniform tiling',{size:14,color:mode>.5?C.gr:C.cy});
    const bx=W-124;
    K.label(g,bx,top+10,'高频区','high freq',{color:C.rd,size:11});
    txt(g,bx,top+40,mode>.5?'时间细':'时间中',{color:C.rd,size:11});
    K.label(g,bx,top+PH-30,'低频区','low freq',{color:C.vi,size:11});
    txt(g,bx,top+PH,mode>.5?'频率细':'频率中',{color:C.vi,size:11});
    txt(g,pad,H-38,'每块砖的面积恒定（不确定性原理），只能改它的长宽比',{color:C.muted,size:11});
    txt(g,pad,H-16,'母小波缩放 + 平移，就把整个时频平面铺满',{color:C.muted,size:11}); };
  T.every(50,()=>{ p+=dir*.03; if(p>1){p=1;dir=-1;} if(p<0){p=0;dir=1;} draw(); }); draw();
  api.button('STFT / 小波 切换',()=>{mode^=1;draw();});
  api.slider('形变程度 / morph',0,1,.05,1,v=>{p=+v;dir=0;draw();});
  return {stop(){T.stop();}};
});

/* ============ cx 复数 ============ */
def('cx_i_rotation','乘 i = 转 90 度','i is a quarter turn','点一下乘一次 i：1 → i → −1 → −i → 1。转四次回到原地，所以 i⁴=1；转两次是 −1，所以 i²=−1。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,M.min(W,H)*.30),T=timers();
  mgrid(svg,f,W,H); const mk=K.arrow(svg,uid('i'),C.am),g=svg.append('g');
  svg.append('circle').attr('cx',f.x(0)).attr('cy',f.y(0)).attr('r',f.u).attr('fill','none').attr('stroke',C.hair).attr('stroke-width',1.4);
  let k=0,ang=0,target=0,t0=null;
  const names=['1','i','−1','−i'];
  const draw=()=>{ g.selectAll('*').remove();
    const x=M.cos(ang),y=M.sin(ang);
    const arc=d3.arc()({innerRadius:f.u*.30,outerRadius:f.u*.34,startAngle:PI/2-ang,endAngle:PI/2});
    g.append('path').attr('d',arc).attr('transform',`translate(${f.x(0)},${f.y(0)})`).attr('fill',C.am).attr('opacity',.6);
    [0,1,2,3].forEach(j=>{ const a=j*PI/2; dot(g,f.x(M.cos(a)),f.y(M.sin(a)),4,C.muted);
      txt(g,f.x(M.cos(a)*1.16),f.y(M.sin(a)*1.16)+5,names[j],{anchor:'middle',color:j===(k%4)?C.am:C.muted,size:14,bold:true,mono:true}); });
    ln(g,f.x(0),f.y(0),f.x(x),f.y(y),C.am,3,{arrow:mk});
    K.label(g,14,24,`乘了 ${k} 次 i   →   i^${k} = ${names[k%4]}`,`each × i rotates by 90°;  i² = −1 = half turn`,{size:14,color:C.am});
    K.label(g,14,H-52,'i 不是想象出来的数，是“转四分之一圈”这个动作','i is an action: a quarter turn',{size:12,color:C.ink2});
    txt(g,14,H-14,'乘 −1 = 转半圈；那么什么乘两次等于转半圈？转四分之一圈的那个 —— 就是 i',{color:C.muted,size:11}); };
  const stop=api.play(t=>{ if(t0==null)t0=t; const dt=t-t0; t0=t;
    if(ang<target){ ang=M.min(target,ang+dt*3.0); draw(); } });
  T.every(1000,()=>{ k++; target=k*PI/2; });
  draw(); api.button('再乘一次 i / ×i',()=>{k++;target=k*PI/2;});
  api.button('归位 / reset',()=>{k=0;ang=0;target=0;draw();});
  return {stop(){stop&&stop();T.stop();}};
});

def('cx_multiply','乘法 = 模相乘、角相加','Multiply: scale and rotate','拖两个箭头。乘积的长度 = 两条长度的乘积，方向 = 两个角度之和。加法只是平移，乘法是转+伸。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,M.min(W,H)*.15,W*.40,H*.55);
  mgrid(svg,f,W,H); const mk1=K.arrow(svg,uid('m'),C.cy),mk2=K.arrow(svg,uid('n'),C.vi),mk3=K.arrow(svg,uid('p'),C.gr);
  const g=svg.append('g'),hg=svg.append('g'); let z1=[1.4,.9],z2=[1.1,-.5];
  const draw=()=>{ g.selectAll('*').remove();
    const pr=[z1[0]*z2[0]-z1[1]*z2[1], z1[0]*z2[1]+z1[1]*z2[0]];
    const r1=M.hypot(z1[0],z1[1]),r2=M.hypot(z2[0],z2[1]),a1=M.atan2(z1[1],z1[0]),a2=M.atan2(z2[1],z2[0]);
    svg.selectAll('circle.uc').remove();
    g.append('circle').attr('cx',f.x(0)).attr('cy',f.y(0)).attr('r',f.u).attr('fill','none').attr('stroke',C.hair);
    ln(g,f.x(0),f.y(0),f.x(z1[0]),f.y(z1[1]),C.cy,3,{arrow:mk1});
    ln(g,f.x(0),f.y(0),f.x(z2[0]),f.y(z2[1]),C.vi,3,{arrow:mk2});
    ln(g,f.x(0),f.y(0),f.x(pr[0]),f.y(pr[1]),C.gr,3.4,{arrow:mk3});
    ln(g,f.x(z1[0]),f.y(z1[1]),f.x(pr[0]),f.y(pr[1]),C.gr,1,{dash:'3 4',op:.5});
    txt(g,f.x(z1[0])+10,f.y(z1[1]),'z₁',{color:C.cy,size:13,mono:true,bold:true});
    txt(g,f.x(z2[0])+10,f.y(z2[1]),'z₂',{color:C.vi,size:13,mono:true,bold:true});
    txt(g,f.x(pr[0])+10,f.y(pr[1]),'z₁z₂',{color:C.gr,size:13,mono:true,bold:true});
    const bx=W-236;
    K.label(g,bx,44,`|z₁| = ${K.fmt(r1,2)}   ∠ ${K.fmt(a1,2)}`,`z₁ = ${K.fmt(z1[0],2)} + ${K.fmt(z1[1],2)}i`,{color:C.cy,size:12});
    K.label(g,bx,94,`|z₂| = ${K.fmt(r2,2)}   ∠ ${K.fmt(a2,2)}`,`z₂ = ${K.fmt(z2[0],2)} + ${K.fmt(z2[1],2)}i`,{color:C.vi,size:12});
    K.label(g,bx,150,`|z₁z₂| = ${K.fmt(r1,2)}×${K.fmt(r2,2)} = ${K.fmt(r1*r2,2)}`,`∠ = ${K.fmt(a1,2)} + ${K.fmt(a2,2)} = ${K.fmt(a1+a2,2)}`,{color:C.gr,size:12});
    txt(g,bx,200,`= ${K.fmt(pr[0],2)} ${pr[1]<0?'−':'+'} ${K.fmt(M.abs(pr[1]),2)}i`,{color:C.gr,size:13,mono:true});
    txt(g,14,H-14,'|z₂|>1 时乘法把 z₁ 拉长，<1 时缩短；单位圆上的复数只转不伸',{color:C.muted,size:11}); };
  handle(svg,hg,f.x(z1[0]),f.y(z1[1]),C.cy,(mx,my)=>{ z1=[f.ix(mx),f.iy(my)]; hg.selectAll('circle').filter((d,i)=>i===0).attr('cx',mx).attr('cy',my); draw(); });
  handle(svg,hg,f.x(z2[0]),f.y(z2[1]),C.vi,(mx,my)=>{ z2=[f.ix(mx),f.iy(my)]; hg.selectAll('circle').filter((d,i)=>i===1).attr('cx',mx).attr('cy',my); draw(); });
  draw(); return none();
});

def('cx_polar','同一个点，两套读数','Rectangular vs polar','拖点：左边读 (a,b) 适合加减，右边读 (r,θ) 适合乘除幂。换算就是一个直角三角形。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,M.min(W,H)*.16,W*.36,H*.55),T=timers();
  mgrid(svg,f,W,H); const g=svg.append('g'),hg=svg.append('g'); let z=[1.7,1.1],n=1;
  const draw=()=>{ g.selectAll('*').remove();
    const r=M.hypot(z[0],z[1]),th=M.atan2(z[1],z[0]);
    g.append('circle').attr('cx',f.x(0)).attr('cy',f.y(0)).attr('r',r*f.u).attr('fill','none').attr('stroke',C.vi).attr('stroke-width',1).attr('opacity',.5);
    ln(g,f.x(z[0]),f.y(0),f.x(z[0]),f.y(z[1]),C.cy,2,{dash:'4 3'});
    ln(g,f.x(0),f.y(z[1]),f.x(z[0]),f.y(z[1]),C.cy,2,{dash:'4 3'});
    ln(g,f.x(0),f.y(0),f.x(z[0]),f.y(z[1]),C.am,3);
    g.append('path').attr('d',d3.arc()({innerRadius:f.u*.42,outerRadius:f.u*.46,startAngle:PI/2-th,endAngle:PI/2}))
      .attr('transform',`translate(${f.x(0)},${f.y(0)})`).attr('fill',C.am).attr('opacity',.55);
    dot(g,f.x(z[0]),f.y(z[1]),6,C.am);
    txt(g,f.x(z[0]/2),f.y(0)+18,`a = ${K.fmt(z[0],2)}`,{anchor:'middle',color:C.cy,size:12,mono:true});
    txt(g,f.x(0)-10,f.y(z[1]/2),`b = ${K.fmt(z[1],2)}`,{anchor:'end',color:C.cy,size:12,mono:true});
    const bx=W-238;
    K.label(g,bx,44,'直角坐标（适合加减）','rectangular (a, b)',{color:C.cy,size:12});
    txt(g,bx,72,`${K.fmt(z[0],3)} ${z[1]<0?'−':'+'} ${K.fmt(M.abs(z[1]),3)}i`,{color:C.cy,size:14,mono:true});
    K.label(g,bx,110,'极坐标（适合乘除幂）','polar (r, θ)',{color:C.vi,size:12});
    txt(g,bx,138,`r = ${K.fmt(r,3)}`,{color:C.vi,size:14,mono:true});
    txt(g,bx,160,`θ = ${K.fmt(th,3)} rad = ${K.fmt(th*180/PI,1)}°`,{color:C.vi,size:13,mono:true});
    const pr=M.pow(r,n),pa=th*n;
    K.label(g,bx,198,`z^${n}：模 ${K.fmt(pr,3)}  角 ${K.fmt(pa,2)}`,`de Moivre: r^n (cos nθ + i sin nθ)`,{color:C.gr,size:12});
    ln(g,f.x(0),f.y(0),f.x(pr*M.cos(pa)),f.y(pr*M.sin(pa)),C.gr,2,{dash:'5 3'});
    dot(g,f.x(pr*M.cos(pa)),f.y(pr*M.sin(pa)),5,C.gr);
    txt(g,14,H-14,`换算：a=r cosθ, b=r sinθ；反过来 r=√(a²+b²), θ=atan2(b,a)`,{color:C.muted,size:11}); };
  handle(svg,hg,f.x(z[0]),f.y(z[1]),C.am,(mx,my)=>{ z=[f.ix(mx),f.iy(my)]; hg.select('circle').attr('cx',mx).attr('cy',my); draw(); });
  draw(); api.slider('看 z 的 n 次幂',1,6,1,1,v=>{n=+v;draw();});
  return {stop(){T.stop();}};
});

def('cx_euler','欧拉：速度永远垂直位置 → 走出圆','Euler formula','点从 1 出发，每一瞬间速度垂直于当前位置向量。长度不变，走出单位圆；走过的弧长就是 θ。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,M.min(W,H)*.26,W*.30,H*.50),T=timers();
  mgrid(svg,f,W,H); const mkv=K.arrow(svg,uid('v'),C.gr),mkp=K.arrow(svg,uid('q'),C.am);
  svg.append('circle').attr('cx',f.x(0)).attr('cy',f.y(0)).attr('r',f.u).attr('fill','none').attr('stroke',C.hair).attr('stroke-width',1.4);
  const g=svg.append('g'); let th=0,t0=null,run=true;
  const px=W*.60,pw=W-px-30;
  const draw=()=>{ g.selectAll('*').remove(); const c=M.cos(th),s=M.sin(th);
    const arc=[]; for(let a=0;a<=th;a+=.02) arc.push([f.x(M.cos(a)),f.y(M.sin(a))]);
    path(g,arc,C.am,3.2);
    ln(g,f.x(0),f.y(0),f.x(c),f.y(s),C.am,2.4,{arrow:mkp});
    ln(g,f.x(c),f.y(s),f.x(c-s*.7),f.y(s+c*.7),C.gr,3,{arrow:mkv});
    dot(g,f.x(c),f.y(s),6,C.am);
    ln(g,f.x(c),f.y(0),f.x(c),f.y(s),C.cy,1.4,{dash:'3 3'}); ln(g,f.x(0),f.y(s),f.x(c),f.y(s),C.vi,1.4,{dash:'3 3'});
    K.label(g,14,24,`θ = ${K.fmt(th,3)}   e^{iθ} = ${K.fmt(c,3)} ${s<0?'−':'+'} ${K.fmt(M.abs(s),3)}i`,`= cos θ + i sin θ;  |e^{iθ}| = 1 always`,{size:13,color:C.am});
    txt(g,f.x(c)+8,f.y(s)-32,'速度 = i·位置（转 90°）',{color:C.gr,size:11});
    const yc=H*.30,amp=H*.16;
    ln(g,px,yc,W-30,yc,C.hair,1);
    const cp=[],sp=[]; for(let a=0;a<=TAU*1.2;a+=.02){ const X=px+pw*a/(TAU*1.2); cp.push([X,yc-amp*M.cos(a)]); sp.push([X,yc-amp*M.sin(a)]); }
    path(g,cp,C.cy,2); path(g,sp,C.vi,2);
    const X=px+pw*M.min(th,TAU*1.2)/(TAU*1.2);
    dot(g,X,yc-amp*c,5,C.cy); dot(g,X,yc-amp*s,5,C.vi);
    txt(g,px,yc-amp-16,'实部 cos θ',{color:C.cy,size:11}); txt(g,px+70,yc-amp-16,'虚部 sin θ',{color:C.vi,size:11});
    [[PI/2,'π/2 = i'],[PI,'π = −1'],[TAU,'2π = 1']].forEach(d=>{ if(M.abs(th-d[0])<.06)
      txt(g,f.x(0),f.y(0)-f.u-18,`e^{i${d[1]}}`,{anchor:'middle',color:C.gr,size:16,mono:true,bold:true}); });
    txt(g,14,H-14,'d/dθ e^{iθ} = i·e^{iθ}：导数就是把自己转 90 度 —— 所以只能绕圈，不能变长',{color:C.muted,size:11}); };
  const stop=api.play(t=>{ if(t0==null)t0=t; if(run) th=(th+(t-t0)*.9)%TAU; t0=t; draw(); });
  api.slider('角度 θ',0,6.28,.02,0,v=>{run=false;th=+v;draw();});
  api.button('自动 / auto',()=>{run=!run;});
  api.button('停到 e^{iπ} = −1',()=>{run=false;th=PI;draw();});
  return {stop(){stop&&stop();T.stop();}};
});

def('cx_roots_unity','单位根：把圆均分，和为 0','Roots of unity','n 颗钉子均匀钉在单位圆上。把它们当向量首尾相接，正好围成闭合的正 n 边形 —— 所以和恒为 0。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,M.min(W,H)*.26,W*.32,H*.50),T=timers();
  mgrid(svg,f,W,H); const g=svg.append('g'); let n=6,k=0;
  svg.append('circle').attr('cx',f.x(0)).attr('cy',f.y(0)).attr('r',f.u).attr('fill','none').attr('stroke',C.hair).attr('stroke-width',1.4);
  const draw=()=>{ g.selectAll('*').remove();
    const cols=[C.cy,C.vi,C.gr,C.am,C.rd];
    for(let j=0;j<n;j++){ const a=j*TAU/n,on=j<=k;
      ln(g,f.x(0),f.y(0),f.x(M.cos(a)),f.y(M.sin(a)),on?cols[j%5]:C.hair,on?2:1);
      dot(g,f.x(M.cos(a)),f.y(M.sin(a)),on?6:3,on?cols[j%5]:C.muted); }
    const poly=[]; for(let j=0;j<n;j++){ const a=j*TAU/n; poly.push([f.x(M.cos(a)),f.y(M.sin(a))]); }
    if(k>=n-1) g.append('path').attr('d',d3.line()(poly)+'Z').attr('fill',api.color).attr('fill-opacity',.10).attr('stroke',api.color).attr('stroke-width',1.4);
    const cx=W*.72,cy=H*.42,sc=f.u*.62; let px=cx,py=cy;
    for(let j=0;j<=M.min(k,n-1);j++){ const a=j*TAU/n,nx=px+sc*M.cos(a),ny=py-sc*M.sin(a);
      ln(g,px,py,nx,ny,cols[j%5],2.4); px=nx; py=ny; }
    dot(g,cx,cy,5,C.ink); dot(g,px,py,5,k>=n-1?C.gr:C.am);
    txt(g,cx,cy+18,'起点',{anchor:'middle',color:C.muted,size:10});
    let sr=0,si=0; for(let j=0;j<n;j++){ sr+=M.cos(j*TAU/n); si+=M.sin(j*TAU/n); }
    K.label(g,14,24,`n = ${n}   第 ${M.min(k+1,n)} 个根 = e^{2πi·${M.min(k,n-1)}/${n}}`,`the n solutions of z^n = 1, evenly spaced by 2π/n`,{size:13,color:api.color});
    K.label(g,cx-60,H-70,`向量首尾相接 → 闭合正 ${n} 边形`,`sum = ${K.fmt(M.abs(sr)<1e-9?0:sr,3)} + ${K.fmt(M.abs(si)<1e-9?0:si,3)}i = 0`,{size:12,color:k>=n-1?C.gr:C.ink2});
    txt(g,14,H-14,'和为 0 的原因：它们是 zⁿ−1 = 0 的根，而 zⁿ−1 里 z^{n−1} 的系数是 0',{color:C.muted,size:11}); };
  T.every(420,()=>{ k=k>=n?0:k+1; draw(); }); draw();
  api.slider('n 等分',2,12,1,6,v=>{n=+v;k=0;draw();});
  api.button('重播 / replay',()=>{k=0;draw();});
  return {stop(){T.stop();}};
});

def('cx_oscillation','复指数：螺旋的两个投影','Complex exponential spiral','e^{(σ+iω)t} 在平面上转圈同时伸缩。右边是它投到实轴的波形：σ<0 衰减，σ=0 等幅，σ>0 发散。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,M.min(W,H)*.16,W*.26,H*.50);
  mgrid(svg,f,W,H); const g=svg.append('g'); let sig=-.25,om=3,t0=null,tt=0;
  const px=W*.52,pw=W-px-30;
  const draw=()=>{ g.selectAll('*').remove();
    const sp=[]; for(let u=0;u<=6;u+=.01){ const r=M.exp(sig*u); if(r>6) break; sp.push([f.x(r*M.cos(om*u)),f.y(r*M.sin(om*u))]); }
    path(g,sp,C.vi,2,{op:.6});
    const r=M.exp(sig*tt),cx=r*M.cos(om*tt),cy=r*M.sin(om*tt);
    if(M.abs(cx)<8&&M.abs(cy)<8){ ln(g,f.x(0),f.y(0),f.x(cx),f.y(cy),C.am,2.4); dot(g,f.x(cx),f.y(cy),6,C.am); }
    const yc=H*.34,amp=H*.20;
    ln(g,px,yc,W-30,yc,C.hair,1);
    const mk=(fn,col)=>{ const p2=[]; for(let u=0;u<=6;u+=.01){ const v=M.exp(sig*u)*fn(om*u);
        p2.push([px+pw*u/6,yc-amp*M.max(-2.4,M.min(2.4,v))]); } path(g,p2,col,2.2); };
    const env=[]; for(let u=0;u<=6;u+=.02) env.push([px+pw*u/6,yc-amp*M.min(2.4,M.exp(sig*u))]);
    path(g,env,C.rd,1.2,{dash:'4 3'}); path(g,env.map(p=>[p[0],2*yc-p[1]]),C.rd,1.2,{dash:'4 3'});
    mk(M.cos,C.cy); mk(M.sin,C.vi);
    const X=px+pw*M.min(tt,6)/6; dot(g,X,yc-amp*M.max(-2.4,M.min(2.4,r*M.cos(om*tt))),5,C.cy);
    K.label(g,14,24,`σ = ${K.fmt(sig,2)}   ω = ${K.fmt(om,2)}`,`e^{(σ+iω)t} = e^{σt}(cos ωt + i sin ωt)`,{size:13,color:api.color});
    K.label(g,px,H-70,sig<-.02?'σ<0：螺旋收紧，振荡衰减':sig>.02?'σ>0：螺旋张开，振荡发散':'σ=0：等幅圆，纯振荡',
      sig<-.02?'stable / decaying':sig>.02?'unstable / growing':'marginally stable',{size:13,color:sig<-.02?C.gr:sig>.02?C.rd:C.am});
    txt(g,px,H-40,'红虚线 = 包络 e^{σt}（实部管涨落）    青 = 实部    紫 = 虚部',{color:C.muted,size:11});
    txt(g,14,H-14,'一个式子写完所有波形：σ 管包络，ω 管转速',{color:C.muted,size:11}); };
  const stop=api.play(t=>{ if(t0==null)t0=t; tt=(tt+(t-t0)*1.1)%6; t0=t; draw(); });
  api.slider('实部 σ（衰减）',-1,.5,.02,-.25,v=>{sig=+v;});
  api.slider('虚部 ω（转速）',.5,8,.1,3,v=>{om=+v;});
  return {stop(){stop&&stop();}};
});

def('cx_conjugate','共轭：实轴是一面镜子','Conjugate mirror','拖 z，它的镜像 z̄ 跟着动。两者相乘时角度正好抵消，结果落回实轴，值就是 |z|²。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,M.min(W,H)*.15,W*.38,H*.50);
  mgrid(svg,f,W,H); const g=svg.append('g'),hg=svg.append('g'); let z=[1.6,1.05],T=timers();
  const draw=()=>{ g.selectAll('*').remove();
    ln(g,0,f.y(0),W,f.y(0),C.gr,2.4,{op:.5});
    txt(g,W-8,f.y(0)-8,'实轴 = 镜面',{anchor:'end',color:C.gr,size:11});
    const r=M.hypot(z[0],z[1]),th=M.atan2(z[1],z[0]);
    g.append('circle').attr('cx',f.x(0)).attr('cy',f.y(0)).attr('r',r*f.u).attr('fill','none').attr('stroke',C.hair);
    ln(g,f.x(0),f.y(0),f.x(z[0]),f.y(z[1]),C.cy,3);
    ln(g,f.x(0),f.y(0),f.x(z[0]),f.y(-z[1]),C.vi,3);
    ln(g,f.x(z[0]),f.y(z[1]),f.x(z[0]),f.y(-z[1]),C.hair,1.4,{dash:'3 3'});
    ln(g,f.x(0),f.y(0),f.x(r*r),f.y(0),C.gr,4,{op:.85});
    dot(g,f.x(z[0]),f.y(z[1]),6,C.cy); dot(g,f.x(z[0]),f.y(-z[1]),6,C.vi);
    if(r*r<8) dot(g,f.x(r*r),f.y(0),7,C.gr);
    txt(g,f.x(z[0])+10,f.y(z[1]),'z',{color:C.cy,size:14,mono:true,bold:true});
    txt(g,f.x(z[0])+10,f.y(-z[1])+6,'z̄',{color:C.vi,size:14,mono:true,bold:true});
    const bx=W-232;
    K.label(g,bx,44,`z  = ${K.fmt(z[0],2)} ${z[1]<0?'−':'+'} ${K.fmt(M.abs(z[1]),2)}i`,`angle ${K.fmt(th,2)}`,{color:C.cy,size:12});
    K.label(g,bx,90,`z̄ = ${K.fmt(z[0],2)} ${z[1]<0?'+':'−'} ${K.fmt(M.abs(z[1]),2)}i`,`angle ${K.fmt(-th,2)} — mirrored`,{color:C.vi,size:12});
    K.label(g,bx,140,`z·z̄ = ${K.fmt(r*r,3)}`,`= |z|² = a² + b², a real number`,{color:C.gr,size:13});
    K.label(g,bx,190,`z + z̄ = ${K.fmt(2*z[0],2)} = 2a`,`z − z̄ = ${K.fmt(2*z[1],2)}i = 2bi`,{color:C.ink2,size:12});
    txt(g,14,H-32,'角度相加：θ + (−θ) = 0 → 落在实轴上',{color:C.muted,size:11});
    txt(g,14,H-12,'除法就靠它：1/z = z̄/|z|²，分母被共轭化成实数',{color:C.muted,size:11}); };
  handle(svg,hg,f.x(z[0]),f.y(z[1]),C.cy,(mx,my)=>{ z=[f.ix(mx),f.iy(my)]; hg.select('circle').attr('cx',mx).attr('cy',my); draw(); });
  draw(); return {stop(){T.stop();}};
});

def('cx_poly_roots','根在复平面上跑','Roots move in the plane','x²+bx+c：滑杆改系数。判别式转负的一刻，两个实根离开实轴，变成一对共轭复根 —— 根从没消失，只是离开了那条线。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,M.min(W,H)*.19,W*.34,H*.52);
  mgrid(svg,f,W,H); const g=svg.append('g'); let b=-1,c=-1,tr=[];
  const draw=()=>{ g.selectAll('*').remove();
    ln(g,0,f.y(0),W,f.y(0),C.gr,2,{op:.45});
    txt(g,10,f.y(0)-8,'实数轴（只有这条线上你才“看得见”根）',{color:C.gr,size:11});
    const D=b*b-4*c; let R;
    if(D>=0) R=[[(-b+M.sqrt(D))/2,0],[(-b-M.sqrt(D))/2,0]];
    else R=[[-b/2,M.sqrt(-D)/2],[-b/2,-M.sqrt(-D)/2]];
    tr.push(R.map(p=>p.slice())); if(tr.length>90) tr.shift();
    tr.forEach((pair,i)=>pair.forEach((p,j)=>{ if(M.abs(p[0])<9&&M.abs(p[1])<9) dot(g,f.x(p[0]),f.y(p[1]),1.6,j?C.vi:C.cy).attr('opacity',i/tr.length*.6); }));
    R.forEach((p,j)=>{ if(M.abs(p[0])<9&&M.abs(p[1])<9) dot(g,f.x(p[0]),f.y(p[1]),7,D<0?C.rd:C.gr); });
    if(D<0) ln(g,f.x(R[0][0]),f.y(R[0][1]),f.x(R[1][0]),f.y(R[1][1]),C.rd,1.2,{dash:'3 3'});
    const px=W*.68,pw=W-px-24,pyc=H*.28,pa=H*.16;
    ln(g,px,pyc,W-24,pyc,C.hair,1);
    const pp=[]; for(let x=-4;x<=4;x+=.05){ const v=x*x+b*x+c; pp.push([px+pw*(x+4)/8,pyc-pa*M.max(-3,M.min(3,v))/3]); }
    path(g,pp,C.am,2.2);
    if(D>=0) R.forEach(p=>{ if(M.abs(p[0])<=4) dot(g,px+pw*(p[0]+4)/8,pyc,5,C.gr); });
    txt(g,px,pyc-pa-10,'抛物线 y = x²+bx+c',{color:C.am,size:11});
    K.label(g,14,24,`b = ${K.fmt(b,2)}   c = ${K.fmt(c,2)}   判别式 Δ = ${K.fmt(D,3)}`,
      D>=0?`two real roots — parabola crosses the axis`:`two conjugate roots — parabola misses the axis`,{size:13,color:D>=0?C.gr:C.rd});
    K.label(g,14,H-52,D>=0?`根 = ${K.fmt(R[0][0],3)} 与 ${K.fmt(R[1][0],3)}`:`根 = ${K.fmt(-b/2,3)} ± ${K.fmt(M.sqrt(-D)/2,3)}i`,
      `always exactly n roots in C (fundamental theorem of algebra)`,{size:13,color:D>=0?C.gr:C.rd});
    txt(g,14,H-14,'两根之和 = −b，两根之积 = c —— 不管在实轴上还是悬在平面里',{color:C.muted,size:11}); };
  draw(); api.slider('一次项 b',-5,5,.1,-1,v=>{b=+v;draw();});
  api.slider('常数项 c',-5,7,.1,-1,v=>{c=+v;draw();});
  api.button('清轨迹 / clear',()=>{tr=[];draw();});
  return none();
});

def('cx_pole_zero','极点顶帐篷，零点钉地面','Poles and zeros','拖极点。沿虚轴（频率轴）量橡皮膜的高度，量出来的就是频率响应。极点越靠近虚轴，那个频率越尖锐。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),f=frame(W,H,M.min(W,H)*.14,W*.30,H*.50);
  mgrid(svg,f,W,H); const g=svg.append('g'),hg=svg.append('g'); let pole=[-.6,1.6],zero=[0,3.2];
  const draw=()=>{ g.selectAll('*').remove();
    ln(g,f.x(0),0,f.x(0),H,C.gr,2,{op:.45});
    txt(g,f.x(0)+8,20,'虚轴 = 频率轴',{color:C.gr,size:11});
    [[pole,C.rd,'×','极点 pole'],[[pole[0],-pole[1]],C.rd,'×','共轭 conj'],[zero,C.cy,'○','零点 zero'],[[zero[0],-zero[1]],C.cy,'○','conj']].forEach(d=>{
      txt(g,f.x(d[0][0]),f.y(d[0][1])+7,d[2],{anchor:'middle',color:d[1],size:22,bold:true});
      txt(g,f.x(d[0][0])+14,f.y(d[0][1])+4,d[3],{color:d[1],size:10}); });
    const px=W*.58,pw=W-px-30,py0=H-64,ph=H-120;
    ln(g,px,py0,W-30,py0,C.hair,1); ln(g,px,py0,px,py0-ph,C.hair,1);
    const mag=w=>{ const zp=M.hypot(0-zero[0],w-zero[1])*M.hypot(0-zero[0],w+zero[1]);
      const pp=M.hypot(0-pole[0],w-pole[1])*M.hypot(0-pole[0],w+pole[1]); return zp/M.max(pp,1e-6); };
    let mx=0; for(let w=0;w<=6;w+=.02) mx=M.max(mx,mag(w));
    const pts=[]; for(let w=0;w<=6;w+=.02) pts.push([px+pw*w/6,py0-ph*M.min(1,mag(w)/mx)]);
    path(g,pts,C.am,2.4);
    let wpk=0; for(let w=0;w<=6;w+=.01) if(mag(w)>mag(wpk)) wpk=w;
    ln(g,px+pw*wpk/6,py0,px+pw*wpk/6,py0-ph,C.rd,1.2,{dash:'4 3'});
    ln(g,px+pw*M.abs(zero[1])/6,py0,px+pw*M.abs(zero[1])/6,py0-ph,C.cy,1.2,{dash:'4 3'});
    txt(g,px,py0-ph-8,'|H(iω)| 频率响应',{color:C.am,size:11});
    txt(g,px+pw,py0+18,'ω →',{anchor:'end',color:C.muted,size:11});
    const Q=M.abs(pole[1])/(2*M.abs(pole[0])||1e-6);
    K.label(g,14,24,`极点 ${K.fmt(pole[0],2)} ± ${K.fmt(M.abs(pole[1]),2)}i   Q ≈ ${K.fmt(Q,2)}`,
      `peak at ω ≈ ${K.fmt(wpk,2)};  notch at ω = ${K.fmt(M.abs(zero[1]),2)}`,{size:12,color:C.rd});
    K.label(g,14,H-52,M.abs(pole[0])<.25?'极点贴着虚轴：共振非常尖锐（几乎不稳定）':'极点离虚轴远：响应平缓',
      M.abs(pole[0])<.25?'close to the axis → high Q, long ringing':'far from the axis → damped',{size:12,color:M.abs(pole[0])<.25?C.rd:C.gr});
    txt(g,14,H-14,'极点在右半平面（实部>0）= 发散 = 系统不稳定',{color:C.muted,size:11}); };
  handle(svg,hg,f.x(pole[0]),f.y(pole[1]),C.rd,(mx2,my)=>{ pole=[M.min(-.05,f.ix(mx2)),M.max(.1,f.iy(my))]; hg.selectAll('circle').filter((d,i)=>i===0).attr('cx',f.x(pole[0])).attr('cy',f.y(pole[1])); draw(); });
  handle(svg,hg,f.x(zero[0]),f.y(zero[1]),C.cy,(mx2,my)=>{ zero=[0,M.max(.1,f.iy(my))]; hg.selectAll('circle').filter((d,i)=>i===1).attr('cx',f.x(0)).attr('cy',f.y(zero[1])); draw(); });
  draw(); return none();
});

/* ============ vd 吠陀速算 16 诀 ============ */
/* 小卡片：心算路径上的一块 */
const card=(g,x,y,w,h,s,col,on,sub)=>{ rect(g,x,y,w,h,on?col:C.muted,{rx:8,fo:on?.20:.05,stroke:on?col:C.hair,sw:1.4});
  txt(g,x+w/2,y+h/2+7,s,{anchor:'middle',color:on?C.ink:C.muted,size:M.min(22,w/(String(s).length*.62)),mono:true,bold:true});
  if(sub) txt(g,x+w/2,y+h+14,sub,{anchor:'middle',color:on?col:C.muted,size:10}); return x+w; };
/* 左右两半拼数：吠陀最常见的骨架 */
const halves=(g,W,y,L,R,step,colL,colR,subL,subR)=>{ const w=M.min(150,(W-140)/2),x0=W/2-w-10;
  card(g,x0,y,w,58,L,colL,step>=1,subL); card(g,x0+w+20,y,w,58,R,colR,step>=2,subR);
  txt(g,W/2,y+34,'|',{anchor:'middle',color:C.muted,size:26}); };

VD('vd_ekadhikena','尾 5 平方：a(a+1) 接 25','Ekadhikena Purvena','左段跟它的下一位邻居握手，右段永远盖 25 的印章。滑杆换数看两块怎么拼。',{
  slider:['前段 a',1,9,1,8], set:v=>({a:v,n:10*v+5}),
  pic:(g,W,H,p,step)=>{ halves(g,W,26,`${p.a}×${p.a+1}=${p.a*(p.a+1)}`,'25',step,C.cy,C.am,'左半 left half','固定 fixed');
    txt(g,W/2,H*.33,`${p.n}² = ${p.n*p.n}`,{anchor:'middle',color:step>=3?C.gr:C.muted,size:26,mono:true,bold:true}); },
  steps:p=>[{zh:`把 ${p.n} 切成两段`,en:'split at the 5',v:`${p.a} | 5`},
            {zh:`左段：a×(a+1)`,en:'one more than the previous',v:`${p.a}×${p.a+1} = ${p.a*(p.a+1)}`},
            {zh:'右段：固定 25',en:'always 25',v:'25'},
            {zh:'拼起来',en:'concatenate',v:`${p.n*p.n}`}],
  note:p=>`为什么：(10a+5)² = 100a² + 100a + 25 = 100·a(a+1) + 25`});

VD('vd_nikhilam','近 100：交叉相减，补数相乘','Nikhilam Navatashcaramam','两数各自欠 100 多少写在右边；左半交叉减，右半补数乘。超过两位就往左进位。',{
  slider:['第一个数 a',86,99,1,97], set:v=>{const a=v,b=v<=93?v+5:v-3;return{a,b,da:100-a,db:100-b};},
  pic:(g,W,H,p,step)=>{ const L=p.a-p.db,R=p.da*p.db,carry=R>=100;
    halves(g,W,22,String(L+(carry?1:0)),String(R%100).padStart(2,'0'),step,C.cy,C.am,
      `${p.a}−${p.db} = ${L}${carry?' +1 进位':''}`,`${p.da}×${p.db} = ${R}`);
    txt(g,W/2,H*.32,`${p.a} × ${p.b} = ${p.a*p.b}`,{anchor:'middle',color:step>=3?C.gr:C.muted,size:24,mono:true,bold:true}); },
  steps:p=>{const L=p.a-p.db,R=p.da*p.db,carry=R>=100;
    return [{zh:'各自离 100 差多少',en:'deficits from 100',v:`−${p.da} , −${p.db}`},
            {zh:'交叉相减 = 左半',en:'cross-subtract',v:`${p.a}−${p.db} = ${L}`},
            {zh:carry?'补数相乘（≥100 要进位）':'补数相乘 = 右半',en:'multiply the deficits',v:carry?`${p.da}×${p.db}=${R} → 进 1，留 ${R%100}`:`${p.da}×${p.db} = ${R}`},
            {zh:'答案',en:'answer',v:String(p.a*p.b)}];},
  note:p=>`为什么：(100−x)(100−y) = 100(100−x−y) + xy，前一半就是交叉减`});

VD('vd_urdhva','竖乘加交叉：从右往左点亮','Urdhva-tiryagbhyam','个位竖乘、中间画 X 交叉相加、十位竖乘。本质就是多项式卷积，进位往左推。',{
  slider:['第一个数 a',12,98,1,23], set:v=>{const a=v,r=+String(v).split('').reverse().join(''),b=r<10?r*10+1:r;
    return {a,b,p:M.floor(a/10),q:a%10,r:M.floor(b/10),s:b%10};},
  pic:(g,W,H,p,step)=>{ const cx=W/2-70,y0=24,dx=52;
    [[p.p,p.q],[p.r,p.s]].forEach((row,i)=>row.forEach((d,j)=>
      txt(g,cx+j*dx,y0+i*40,String(d),{anchor:'middle',color:C.ink,size:26,mono:true,bold:true})));
    if(step>=1) ln(g,cx+dx,y0+6,cx+dx,y0+26,C.am,2.5);
    if(step>=2){ ln(g,cx,y0+6,cx+dx,y0+26,C.gr,2.5); ln(g,cx+dx,y0+6,cx,y0+26,C.gr,2.5); }
    if(step>=3) ln(g,cx,y0+6,cx,y0+26,C.vi,2.5);
    txt(g,cx+dx+70,y0+22,`${p.a} × ${p.b} = ${p.a*p.b}`,{color:step>=4?C.gr:C.muted,size:20,mono:true,bold:true}); },
  steps:p=>{const u=p.q*p.s,m=p.p*p.s+p.q*p.r,t=p.p*p.r;
    return [{zh:'个位：竖着乘',en:'units: vertical',v:`${p.q}×${p.s} = ${u}`},
            {zh:'十位：画 X 交叉相加',en:'tens: crosswise sum',v:`${p.p}×${p.s}+${p.q}×${p.r} = ${m}`},
            {zh:'百位：竖着乘',en:'hundreds: vertical',v:`${p.p}×${p.r} = ${t}`},
            {zh:'从右往左带进位相加',en:'carry from the right',v:`${u} + ${m}0 + ${t}00 = ${p.a*p.b}`}];},
  note:p=>'和多项式乘法一模一样：交叉项就是 x¹ 的系数'});

VD('vd_paravartya','移项：除数变号，一路乘加','Paravartya Yojayet','把除数首位之后的数字全部变号挂在旁边，然后像综合除法一样乘加下去，线左是商线右是余。',{
  slider:['被除数',1100,1999,13,1225], set:v=>({N:v,d:12,ds:String(v).split('').map(Number)}),
  pic:(g,W,H,p,step)=>{ const cx=W*.30,y0=30,dx=44;
    txt(g,cx-90,y0+20,'12 → −2',{color:C.rd,size:18,mono:true,bold:true});
    p.ds.forEach((d,i)=>txt(g,cx+i*dx,y0+20,String(d),{anchor:'middle',color:i<3?C.ink:C.am,size:24,mono:true,bold:true}));
    ln(g,cx+2.5*dx+dx/2,y0-2,cx+2.5*dx+dx/2,y0+56,C.am,2,{dash:'4 3'});
    let c=p.ds[0],cols=[c];
    for(let i=1;i<4;i++){ c=p.ds[i]-2*c; cols.push(c); }
    cols.forEach((v,i)=>{ if(step>=i) txt(g,cx+i*dx,y0+50,String(v),{anchor:'middle',color:i<3?C.gr:C.am,size:18,mono:true}); });
    txt(g,cx+4.4*dx,y0+20,`÷ 12`,{color:C.muted,size:14,mono:true}); },
  steps:p=>{ let c=p.ds[0],cols=[c]; for(let i=1;i<4;i++){ c=p.ds[i]-2*c; cols.push(c); }
    return [{zh:'除数 12 → 首位留 1，其余变号',en:'flip the signs after the leading digit',v:'−2'},
            {zh:'首位落下，×(−2) 加到下一位',en:'bring down, multiply, add',v:`${cols[0]} → ${cols[1]}`},
            {zh:'继续到分隔线',en:'repeat to the bar',v:`${cols[1]} → ${cols[2]}`},
            {zh:'线右是余数列',en:'right of the bar = remainder',v:`${cols[3]}`},
            {zh:'整理进位借位后',en:'normalise carries',v:`商 ${M.floor(p.N/12)} 余 ${p.N%12}`}];},
  note:p=>`验算：${M.floor(p.N/12)}×12 + ${p.N%12} = ${p.N}`});

VD('vd_sunyam','两边有同一坨 → 那坨等于 0','Sunyam Samya Samuccaye','两边各挂着一模一样的括号，系数又不相等，那括号只能是 0。跳过所有展开。',{
  slider:['括号里的 k',1,9,1,1], set:v=>({k:v,pcoef:5,qcoef:3}),
  pic:(g,W,H,p,step)=>{ const y=40;
    txt(g,W*.30,y,`5(x+${p.k})`,{anchor:'middle',color:C.cy,size:26,mono:true,bold:true});
    txt(g,W*.50,y,'=',{anchor:'middle',color:C.muted,size:26});
    txt(g,W*.70,y,`3(x+${p.k})`,{anchor:'middle',color:C.vi,size:26,mono:true,bold:true});
    if(step>=1){ rect(g,W*.30-46,y-26,92,36,C.am,{rx:6,fo:.14,stroke:C.am}); rect(g,W*.70-46,y-26,92,36,C.am,{rx:6,fo:.14,stroke:C.am}); }
    if(step>=2) txt(g,W/2,y+46,`x + ${p.k} = 0`,{anchor:'middle',color:C.gr,size:24,mono:true,bold:true}); },
  steps:p=>[{zh:'两边出现同一个括号',en:'same block on both sides',v:`(x+${p.k})`},
            {zh:'系数 5 ≠ 3',en:'coefficients differ',v:'5 ≠ 3'},
            {zh:'那这个括号只能是 0',en:'so the block must vanish',v:`x+${p.k} = 0`},
            {zh:'答案',en:'answer',v:`x = ${-p.k}`}],
  note:p=>`验算：5×(${-p.k}+${p.k}) = 0 = 3×(${-p.k}+${p.k}) ✓ 展开也一样，但要多算三行`});

VD('vd_anurupye','一个成比例 → 另一个是 0','Anurupye Sunyamanyat','盯 y 那一列和等号右边：两个比相等，那 x 那一列就直接出局 = 0。',{
  slider:['放大倍数 m',2,6,1,2], set:v=>({m:v,a:6,b:19,c:7,d:8}),
  pic:(g,W,H,p,step)=>{ const x0=W*.18,dx=W*.17,y0=34;
    const rows=[[p.a,p.c,p.d],[p.b,p.c*p.m,p.d*p.m]];
    rows.forEach((r,i)=>{ txt(g,x0,y0+i*36,`${r[0]}x`,{color:step>=2?C.rd:C.ink,size:22,mono:true,bold:true});
      txt(g,x0+dx,y0+i*36,`+ ${r[1]}y`,{color:C.cy,size:22,mono:true,bold:true});
      txt(g,x0+2*dx,y0+i*36,`= ${r[2]}`,{color:C.am,size:22,mono:true,bold:true}); });
    if(step>=1){ rect(g,x0+dx-8,y0-24,dx-6,66,C.cy,{rx:6,fo:.12,stroke:C.cy});
      rect(g,x0+2*dx-8,y0-24,dx-6,66,C.am,{rx:6,fo:.12,stroke:C.am});
      txt(g,x0+dx+30,y0+62,`比 = 1:${p.m}`,{anchor:'middle',color:C.cy,size:12});
      txt(g,x0+2*dx+30,y0+62,`比 = 1:${p.m}`,{anchor:'middle',color:C.am,size:12}); } },
  steps:p=>[{zh:'看 y 那一列的比',en:'ratio of the y column',v:`${p.c} : ${p.c*p.m} = 1:${p.m}`},
            {zh:'看常数项的比',en:'ratio of the constants',v:`${p.d} : ${p.d*p.m} = 1:${p.m}`},
            {zh:'两比相等 → x 出局',en:'ratios match → the other is zero',v:'x = 0'},
            {zh:'代回求 y',en:'back-substitute',v:`y = ${p.d}/${p.c} = ${K.fmt(p.d/p.c,4)}`}],
  note:p=>`验算：${p.a}×0 + ${p.c}×${K.fmt(p.d/p.c,3)} = ${p.d} ✓`});

VD('vd_sankalana','一加一减，两步出解','Sankalana-Vyavakalanabhyam','系数镜像的两条方程：加起来得 x−y，减出来得 x+y。两条极简新方程直接给答案。',{
  slider:['系数 a',30,60,1,45], set:v=>{const a=v,b=23,x=2,y=-1;return{a,b,P:a*x-b*y,Q:b*x-a*y,x,y};},
  pic:(g,W,H,p,step)=>{ const y0=32;
    txt(g,W/2,y0,`${p.a}x − ${p.b}y = ${p.P}`,{anchor:'middle',color:C.cy,size:20,mono:true,bold:true});
    txt(g,W/2,y0+28,`${p.b}x − ${p.a}y = ${p.Q}`,{anchor:'middle',color:C.vi,size:20,mono:true,bold:true});
    if(step>=1) txt(g,W*.27,y0+62,`＋ → x−y = ${p.x-p.y}`,{anchor:'middle',color:C.gr,size:16,mono:true});
    if(step>=2) txt(g,W*.73,y0+62,`－ → x+y = ${p.x+p.y}`,{anchor:'middle',color:C.am,size:16,mono:true}); },
  steps:p=>[{zh:'两式相加',en:'add them',v:`${p.a+p.b}(x−y) = ${p.P+p.Q}`},
            {zh:'两式相减',en:'subtract them',v:`${p.a-p.b}(x+y) = ${p.P-p.Q}`},
            {zh:'两条一次方程',en:'two simple equations',v:`x−y=${p.x-p.y} , x+y=${p.x+p.y}`},
            {zh:'解出',en:'solve',v:`x = ${p.x} , y = ${p.y}`}],
  note:p=>`系数镜像时才能用：${p.a},${p.b} ↔ ${p.b},${p.a}`});

VD('vd_purana','补全那个缺角，凑成完全平方','Puranapuranabhyam','缺角的正方形补上一小块就成 (x+m)²，右边也要减掉同样一块。凑齐的一刻只剩一个括号。',{
  slider:['一次项半系数 m',1,8,1,3], set:v=>({m:v,k:3}),
  pic:(g,W,H,p,step)=>{ const S=76,x0=W*.16,y0=20,u=S*.72;
    rect(g,x0,y0,u,u,C.cy,{rx:2,fo:.30}); txt(g,x0+u/2,y0+u/2+5,'x²',{anchor:'middle',color:C.ink,size:15,mono:true});
    rect(g,x0+u,y0,S-u,u,C.vi,{rx:2,fo:.30}); rect(g,x0,y0+u,u,S-u,C.vi,{rx:2,fo:.30});
    txt(g,x0+u+(S-u)/2,y0+u/2+4,'mx',{anchor:'middle',color:C.ink,size:10,mono:true});
    rect(g,x0+u,y0+u,S-u,S-u,step>=1?C.am:C.muted,{rx:2,fo:step>=1?.55:.10,stroke:step>=1?C.am:C.hair});
    if(step>=1) txt(g,x0+u+(S-u)/2,y0+u+(S-u)/2+4,'m²',{anchor:'middle',color:C.ink,size:10,mono:true});
    txt(g,x0+S+22,y0+30,`x² + ${2*p.m}x + ${p.m*p.m-p.k*p.k} = 0`,{color:C.ink,size:17,mono:true,bold:true});
    if(step>=2) txt(g,x0+S+22,y0+58,`(x + ${p.m})² = ${p.k*p.k}`,{color:C.gr,size:19,mono:true,bold:true}); },
  steps:p=>[{zh:'原式',en:'given',v:`x²+${2*p.m}x+${p.m*p.m-p.k*p.k}=0`},
            {zh:`补上 m² = ${p.m*p.m}（两边同补）`,en:'complete the square',v:`+${p.m*p.m} 两边`},
            {zh:'左边收成一个括号',en:'left side becomes a square',v:`(x+${p.m})² = ${p.k*p.k}`},
            {zh:'开方',en:'take roots',v:`x = ${-p.m+p.k} 或 ${-p.m-p.k}`}],
  note:p=>`验算：(${-p.m+p.k})²+${2*p.m}×(${-p.m+p.k})+${p.m*p.m-p.k*p.k} = ${M.pow(-p.m+p.k,2)+2*p.m*(-p.m+p.k)+p.m*p.m-p.k*p.k}`});

VD('vd_calana','导数看重根：函数与斜率同时为 0','Calana-Kalanabhyam','抛物线与它的斜率曲线并排。常数项调到临界值时，抛物线跟 x 轴相切 —— 那点上 f 和 f′ 同时为 0。',{
  slider:['常数项 c',-3,9,.5,2], set:v=>({b:-4,c:v,D:16-4*v}),
  pic:(g,W,H,p,step,api)=>{ const pad=30,pw=W*.44,y0=18,ph=112,f=x=>x*x+p.b*x+p.c;
    const X=x=>pad+pw*(x+1)/6,Y=y=>y0+ph/2-y*11;
    ln(g,X(-1),Y(0),X(5),Y(0),C.hair,1.2);
    const pts=[]; for(let x=-1;x<=5;x+=.05) pts.push([X(x),Y(M.max(-5,M.min(5,f(x))))]);
    path(g,pts,C.cy,2.2);
    const dp=[]; for(let x=-1;x<=5;x+=.1) dp.push([X(x),Y(M.max(-5,M.min(5,(2*x+p.b)/1.6)))]);
    if(step>=1) path(g,dp,C.vi,1.6,{dash:'4 3'});
    const v=-p.b/2; if(step>=2){ ln(g,X(v),Y(-5),X(v),Y(5),C.am,1.2,{dash:'3 3'}); dot(g,X(v),Y(f(v)),6,M.abs(p.D)<.01?C.gr:C.rd); }
    txt(g,W*.60,y0+24,`f  = x²${p.b}x+${K.fmt(p.c,1)}`,{color:C.cy,size:15,mono:true});
    txt(g,W*.60,y0+48,`f′ = 2x${p.b}`,{color:C.vi,size:15,mono:true});
    txt(g,W*.60,y0+76,M.abs(p.D)<.01?'重根！相切':p.D>0?'两个实根':'无实根（根跑到复平面）',
      {color:M.abs(p.D)<.01?C.gr:p.D>0?C.am:C.rd,size:15,bold:true}); },
  steps:p=>[{zh:'求导',en:'differentiate',v:`f′ = 2x ${p.b}`},
            {zh:'f′ = 0 给对称轴',en:'critical point',v:`x = ${-p.b/2}`},
            {zh:'代回看 f 的值',en:'evaluate f there',v:`f(${-p.b/2}) = ${K.fmt(p.c-p.b*p.b/4,2)}`},
            {zh:M.abs(p.D)<.01?'同时为 0 → 重根':'不同时为 0 → 没有重根',en:'double root ⟺ f and f′ share a root',
             v:`Δ = ${K.fmt(p.D,2)}`}],
  note:p=>`Δ = b²−4c = ${K.fmt(p.D,2)}；Δ=0 那一刻，f 与 f′ 有公共根 x=${-p.b/2}`});

VD('vd_ekanyunena','乘 99：左半减一，右半补数','Ekanyunena Purvena','左边写 n−1，右边写 99 减掉左半。两截一气呵成，一次乘法都不用做。',{
  slider:['被乘数 n',11,99,1,24], set:v=>({n:v,L:v-1,R:100-v}),
  pic:(g,W,H,p,step)=>{ halves(g,W,22,String(p.L),String(p.R).padStart(2,'0'),step,C.cy,C.am,
      `${p.n} − 1`,`99 − ${p.L} = ${p.R}`);
    txt(g,W/2,H*.32,`${p.n} × 99 = ${p.n*99}`,{anchor:'middle',color:step>=3?C.gr:C.muted,size:24,mono:true,bold:true}); },
  steps:p=>[{zh:'左半 = 原数 − 1',en:'one less than the previous',v:`${p.n} − 1 = ${p.L}`},
            {zh:'右半 = 99 − 左半',en:'nine-complement',v:`99 − ${p.L} = ${p.R}`},
            {zh:'两截拼起来',en:'concatenate',v:`${p.L}|${String(p.R).padStart(2,'0')}`},
            {zh:'答案',en:'answer',v:String(p.n*99)}],
  note:p=>`为什么：n×99 = n×100 − n = (n−1)×100 + (100−n)`});

VD('vd_anurupyena','换工作基：50 比 100 好使','Anurupyena','数离 100 太远就借个近的基准（50/200/500），交叉得初值，再按倍数还原。',{
  slider:['第一个数 a',38,62,1,46], set:v=>({a:v,b:43,da:v-50,db:-7,base:50}),
  pic:(g,W,H,p,step)=>{ const y=22;
    txt(g,W*.26,y+10,`${p.a}`,{anchor:'middle',color:C.cy,size:28,mono:true,bold:true});
    txt(g,W*.26,y+34,`${p.da>=0?'+':''}${p.da}`,{anchor:'middle',color:C.muted,size:14,mono:true});
    txt(g,W*.40,y+10,'×',{anchor:'middle',color:C.muted,size:22});
    txt(g,W*.54,y+10,`${p.b}`,{anchor:'middle',color:C.vi,size:28,mono:true,bold:true});
    txt(g,W*.54,y+34,`${p.db}`,{anchor:'middle',color:C.muted,size:14,mono:true});
    txt(g,W*.80,y+10,`基 ${p.base}`,{anchor:'middle',color:C.am,size:18,mono:true});
    if(step>=1) ln(g,W*.26,y+38,W*.54,y+16,C.gr,2); if(step>=1) ln(g,W*.54,y+38,W*.26,y+16,C.gr,2); },
  steps:p=>{const cross=p.a+p.db,rest=p.da*p.db;
    return [{zh:`以 ${p.base} 为基，各自的偏差`,en:'deviations from the working base',v:`${p.da>=0?'+':''}${p.da} , ${p.db}`},
            {zh:'交叉相加得初值',en:'cross-add',v:`${p.a} ${p.db} = ${cross}`},
            {zh:`初值 × 基 = ${p.base}`,en:'scale back by the base',v:`${cross} × ${p.base} = ${cross*p.base}`},
            {zh:'加上偏差之积',en:'add the product of deviations',v:`+ ${p.da}×${p.db} = ${rest}`},
            {zh:'答案',en:'answer',v:String(p.a*p.b)}];},
  note:p=>`验算：${p.a}×${p.b} = ${p.a*p.b}；用 100 当基要算 ${100-p.a} 和 ${100-p.b}，太大不好心算`});

VD('vd_adyamadyena','首乘首，尾乘尾，交叉按进制折','Adyamadyenantya-mantyena','木匠量板子：尺×尺、寸×寸、再把交叉项按 12 折算。三件小事拼出面积。',{
  slider:['第一块的寸数',0,11,1,4], set:v=>({f1:6,i1:v,f2:5,i2:8}),
  pic:(g,W,H,p,step)=>{ const x0=W*.10,y0=18,u=9,w1=p.f1*12+p.i1,h1=p.f2*12+p.i2,sc=1.05;
    rect(g,x0,y0,p.f1*u*sc,p.f2*u*sc,C.cy,{rx:2,fo:.30});
    rect(g,x0+p.f1*u*sc,y0,p.i1*u*sc/3,p.f2*u*sc,step>=2?C.gr:C.muted,{rx:2,fo:step>=2?.45:.08});
    rect(g,x0,y0+p.f2*u*sc,p.f1*u*sc,p.i2*u*sc/3,step>=2?C.gr:C.muted,{rx:2,fo:step>=2?.45:.08});
    rect(g,x0+p.f1*u*sc,y0+p.f2*u*sc,p.i1*u*sc/3,p.i2*u*sc/3,step>=1?C.am:C.muted,{rx:2,fo:step>=1?.6:.08});
    txt(g,x0+p.f1*u*sc/2,y0+p.f2*u*sc/2+5,'尺×尺',{anchor:'middle',color:C.ink,size:12});
    txt(g,x0+p.f1*u*sc+52,y0+14,`${p.f1}尺${p.i1}寸 × ${p.f2}尺${p.i2}寸`,{color:C.ink2,size:14,mono:true});
    txt(g,x0+p.f1*u*sc+52,y0+38,`= ${w1*h1} 平方寸`,{color:step>=3?C.gr:C.muted,size:16,mono:true,bold:true}); },
  steps:p=>{const A=p.f1*p.f2,B=p.f1*p.i2+p.f2*p.i1,Cc=p.i1*p.i2;
    const inTot=(p.f1*12+p.i1)*(p.f2*12+p.i2);
    return [{zh:'首×首 = 平方尺',en:'first × first',v:`${p.f1}×${p.f2} = ${A} ft²`},
            {zh:'尾×尾 = 平方寸',en:'last × last',v:`${p.i1}×${p.i2} = ${Cc} in²`},
            {zh:'交叉项（尺·寸）',en:'crosswise term',v:`${p.f1}×${p.i2}+${p.f2}×${p.i1} = ${B}`},
            {zh:'交叉项按 12 折算',en:'carry 12 in = 1 ft',v:`${B} = ${M.floor(B/12)}尺 + ${B%12}`},
            {zh:'合计',en:'total',v:`${A+M.floor(B/12)} ft² + ${(B%12)*12+Cc} in²`},
            {zh:'验算（全化成平方寸）',en:'check in square inches',v:`${inTot}`}];},
  note:p=>`1 ft² = 144 in²；${(p.f1*p.f2+M.floor((p.f1*p.i2+p.f2*p.i1)/12))*144+((p.f1*p.i2+p.f2*p.i1)%12)*12+p.i1*p.i2} = ${(p.f1*12+p.i1)*(p.f2*12+p.i2)} ✓`});

VD('vd_yavadunam','近 10 的幂平方：差多少减多少','Yavadunam','比 100 少 4：左半 = 96−4，右半 = 4²。多出来也一样，加就行。右半超两位往左进。',{
  slider:['底数 n',88,112,1,96], set:v=>({n:v,d:v-100}),
  pic:(g,W,H,p,step)=>{ const L=p.n+p.d,R=p.d*p.d,carry=R>=100;
    halves(g,W,22,String(L+(carry?M.floor(R/100):0)),String(R%100).padStart(2,'0'),step,C.cy,C.am,
      `${p.n} ${p.d>=0?'+':'−'} ${M.abs(p.d)}`,`${p.d}² = ${R}`);
    txt(g,W/2,H*.32,`${p.n}² = ${p.n*p.n}`,{anchor:'middle',color:step>=3?C.gr:C.muted,size:24,mono:true,bold:true}); },
  steps:p=>{const L=p.n+p.d,R=p.d*p.d,carry=R>=100;
    return [{zh:`离 100 差 ${p.d}`,en:'deviation from 100',v:`${p.d>=0?'+':''}${p.d}`},
            {zh:'左半 = 数 + 偏差',en:'add the deviation again',v:`${p.n}${p.d>=0?'+':''}${p.d} = ${L}`},
            {zh:carry?'右半 = 偏差²（要进位）':'右半 = 偏差²',en:'square the deviation',
             v:carry?`${R} → 进 ${M.floor(R/100)}，留 ${String(R%100).padStart(2,'0')}`:String(R).padStart(2,'0')},
            {zh:'答案',en:'answer',v:String(p.n*p.n)}];},
  note:p=>`为什么：(100+d)² = 100(100+2d) + d²，而 100+2d 正是 n+d`});

VD('vd_antyayor_dasake','前缀同、尾数凑 10','Antyayor Dasakepi','前缀一样、末位加起来正好 10：左半 = 前缀×(前缀+1)，右半 = 两个末位相乘。',{
  slider:['共同前缀 a',1,9,1,4], set:v=>({a:v,b:7,n1:10*v+7,n2:10*v+3}),
  pic:(g,W,H,p,step)=>{ txt(g,W/2,20,`${p.n1} × ${p.n2}`,{anchor:'middle',color:C.ink,size:22,mono:true,bold:true});
    txt(g,W/2,40,`前缀都是 ${p.a}，末位 ${p.b}+${10-p.b} = 10`,{anchor:'middle',color:C.muted,size:11});
    halves(g,W,52,`${p.a}×${p.a+1}=${p.a*(p.a+1)}`,String(p.b*(10-p.b)).padStart(2,'0'),step,C.cy,C.am,'左半','右半'); },
  steps:p=>[{zh:'检查条件',en:'check the pattern',v:`前缀同 ${p.a}，尾数 ${p.b}+${10-p.b}=10`},
            {zh:'左半：前缀 × (前缀+1)',en:'prefix × (prefix+1)',v:`${p.a}×${p.a+1} = ${p.a*(p.a+1)}`},
            {zh:'右半：末位相乘（补两位）',en:'multiply the last digits',v:String(p.b*(10-p.b)).padStart(2,'0')},
            {zh:'答案',en:'answer',v:String(p.n1*p.n2)}],
  note:p=>`为什么：(10a+b)(10a+10−b) = 100a(a+1) + b(10−b)`});

VD('vd_antyayoreva','只看最后那两项','Antyayoreva','两对括号的和一样 → 令 u = x²+Sx，方程只剩“最后那两项”的常数在决定 u。',{
  slider:['内对参数 p',.5,2.5,.5,2], set:v=>({p:v,S:5,P:v*(5-v),q:1,Q:1*4,k:2}),
  pic:(g,W,H,p,step)=>{ const y=26;
    txt(g,W/2,y,`(x+${K.fmt(p.p,1)})(x+${K.fmt(p.S-p.p,1)})  /  (x+${p.q})(x+${p.S-p.q}) = ${p.k}`,
      {anchor:'middle',color:C.ink,size:15,mono:true,bold:true});
    txt(g,W/2,y+22,`两对之和都是 ${p.S}`,{anchor:'middle',color:C.muted,size:11});
    if(step>=1) txt(g,W/2,y+50,`令 u = x² + ${p.S}x`,{anchor:'middle',color:C.am,size:18,mono:true,bold:true});
    if(step>=2) txt(g,W/2,y+76,`(u + ${K.fmt(p.P,2)}) = ${p.k}(u + ${p.Q})`,{anchor:'middle',color:C.gr,size:17,mono:true}); },
  steps:p=>{const u=p.P-p.k*p.Q,disc=p.S*p.S+4*u;
    const r1=(-p.S+M.sqrt(M.max(0,disc)))/2,r2=(-p.S-M.sqrt(M.max(0,disc)))/2;
    return [{zh:`两对括号的和相同`,en:'both pairs sum to the same S',v:`S = ${p.S}`},
            {zh:'只剩“最后两项”的乘积',en:'only the last terms differ',v:`${K.fmt(p.P,2)} vs ${p.Q}`},
            {zh:'换元后是一次方程',en:'linear in u',v:`u = ${K.fmt(p.P,2)} − ${p.k}×${p.Q} = ${K.fmt(u,2)}`},
            {zh:disc>=0?'解 x²+Sx−u=0':'判别式为负，无实解',en:'solve the quadratic',
             v:disc>=0?`x = ${K.fmt(r1,3)} 或 ${K.fmt(r2,3)}`:`Δ = ${K.fmt(disc,2)}`}];},
  note:p=>`x² 和 x 的系数两边同型，所以“只有最后那两项”真正起作用`});

VD('vd_lopana','轮流置 0，再把缺口填回去','Lopana Sthapanabhyam','先让 z=0 分解一次，再让 y=0 分解一次。两组因式骨架一致，把缺的变量按位填进去就拼好了。',{
  slider:['系数 m',1,6,1,2], set:v=>({m:v}),
  pic:(g,W,H,p,step)=>{ const m=p.m,y=24;
    txt(g,W/2,y,`x² + ${m+1}xy + 2xz + ${m}y² + ${m+1}yz + z²`,{anchor:'middle',color:C.ink,size:16,mono:true,bold:true});
    if(step>=1) txt(g,W*.27,y+34,`z=0 → (x+${m}y)(x+y)`,{anchor:'middle',color:C.cy,size:14,mono:true});
    if(step>=2) txt(g,W*.73,y+34,`y=0 → (x+z)(x+z)`,{anchor:'middle',color:C.vi,size:14,mono:true});
    if(step>=3) txt(g,W/2,y+66,`(x + ${m}y + z)(x + y + z)`,{anchor:'middle',color:C.gr,size:20,mono:true,bold:true}); },
  steps:p=>{const m=p.m;
    return [{zh:'令 z = 0，只剩 x、y',en:'set z = 0',v:`x²+${m+1}xy+${m}y² = (x+${m}y)(x+y)`},
            {zh:'令 y = 0，只剩 x、z',en:'set y = 0',v:`x²+2xz+z² = (x+z)²`},
            {zh:'两组骨架都是两个因式',en:'same skeleton, fill the gaps',v:`(x+${m}y+?)(x+y+?)`},
            {zh:'把 z 按位填回去',en:'restore the missing variable',v:`(x+${m}y+z)(x+y+z)`},
            {zh:`验算 yz 项`,en:'check the yz coefficient',v:`${m}·1 + 1·1 = ${m+1} ✓`}];},
  note:p=>`每次置 0 都把三元问题降成二元，代价是要用交叉项把缺口对回来`});

})();
