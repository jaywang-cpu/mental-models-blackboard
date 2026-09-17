/* anim/code_b.js — 代码宇宙 ml / dl / bm 动画（32 key）
   只依赖 d3 v7（全局 d3）+ K（anim/_kit.js）。key = node.id 把 '.' 换 '_'。 */
(()=>{
window.ANIM = window.ANIM || {};
const A=window.ANIM, C=K.C, M=Math;

/* ============ 共享小函数 ============ */
const none=()=>({stop(){}});
const uid=p=>p+M.random().toString(36).slice(2,8);
const txt=(sel,x,y,s,o={})=>sel.append('text').attr('x',x).attr('y',y).text(s)
  .attr('fill',o.color||C.ink).attr('font-size',o.size||12).attr('text-anchor',o.anchor||'start')
  .attr('font-family',o.mono?'ui-monospace,Menlo,monospace':null).attr('font-weight',o.bold?600:null);
const ln=(sel,x1,y1,x2,y2,color,w=2,o={})=>sel.append('line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
  .attr('stroke',color).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null).attr('marker-end',o.arrow||null);
const dot=(sel,x,y,r,color)=>sel.append('circle').attr('cx',x).attr('cy',y).attr('r',r).attr('fill',color);
const box=(sel,x,y,w,h,color,o={})=>sel.append('rect').attr('x',x).attr('y',y).attr('width',w).attr('height',h).attr('rx',o.rx==null?6:o.rx)
  .attr('fill',color).attr('fill-opacity',o.fo==null?.18:o.fo).attr('stroke',o.stroke||color).attr('stroke-width',o.sw==null?1.5:o.sw);
const rnd=seed=>{ let s=seed; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; };
const gauss=r=>{ const u=r()||1e-9,v=r(); return M.sqrt(-2*M.log(u))*M.cos(2*M.PI*v); };
const sig=z=>1/(1+M.exp(-z));
const pathL=(g,pts,color,w=2,o={})=>g.append('path').attr('d',d3.line().x(p=>p[0]).y(p=>p[1])(pts)).attr('fill','none').attr('stroke',color).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null).attr('opacity',o.op==null?1:o.op);
const handle=(svg,g,x,y,color,cb)=>{
  const c=g.append('circle').attr('cx',x).attr('cy',y).attr('r',8).attr('fill',color).attr('stroke',C.ink).attr('stroke-width',1.5).style('cursor','grab');
  c.call(d3.drag().on('start drag',ev=>{const [mx,my]=d3.pointer(ev,svg.node());cb(mx,my);})); return c; };
/* 定时器托管 */
const ticker=()=>{ const ts=[]; return { every(ms,fn){ const t=setInterval(fn,ms); ts.push(t); return t; }, stop(){ ts.forEach(clearInterval); } }; };
const def=(key,title,en,cap,make)=>{ A[key]={title,en,cap,make}; };
/* 2D 点集：两类 */
const blobs=(n,seed,sep=1.2)=>{ const r=rnd(seed),p=[]; for(let i=0;i<n;i++){ const c=i%2; p.push({x:(c?sep:-sep)+gauss(r)*.8,y:(c?-.3:.3)+gauss(r)*.8,c}); } return p; };

/* ============ ml 机器学习 ============ */
def('ml_gradient_descent','梯度下降','Gradient descent','小球沿碗壁滚：x ← x − lr·f′(x)。lr 太小走不动，太大来回震荡甚至飞出去。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),f=x=>.5*x*x,df=x=>x;
  const ax=K.axes(svg,W,H,[-4,4],[0,8]);
  pathL(g,d3.range(-4,4.01,.1).map(x=>[ax.x(x),ax.y(f(x))]),C.muted,2);
  const trail=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',1.5).attr('opacity',.7);
  const ball=dot(g,ax.x(3.5),ax.y(f(3.5)),8,api.color),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  K.label(svg,W-40,H-8,'x','',{anchor:'end',color:C.muted}); K.label(svg,12,20,'损失 L(x)','loss',{size:12});
  let lr=.2,x=3.5,pts=[],T=ticker();
  const reset=()=>{ x=3.5; pts=[[ax.x(x),ax.y(f(x))]]; };
  reset(); T.every(260,()=>{ if(M.abs(x)>4.5||pts.length>60){ reset(); } x=x-lr*df(x); pts.push([ax.x(M.max(-4.4,M.min(4.4,x))),ax.y(M.min(8,f(x)))]);
    trail.attr('d',d3.line()(pts)); ball.attr('cx',pts[pts.length-1][0]).attr('cy',pts[pts.length-1][1]).attr('fill',M.abs(x)>4?C.rd:api.color);
    info.text(`lr=${lr.toFixed(2)}  step ${pts.length-1}  x=${x.toFixed(3)}`); });
  api.slider('学习率 lr',.02,2.2,.02,.2,v=>{lr=+v;reset();}); api.button('重来 / reset',reset); return {stop:()=>T.stop()};
});

def('ml_linear_reg','线性回归','Linear regression','拖点。最小二乘 = 让所有残差方块面积之和最小。方块面积就是误差平方。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(7),ax=K.axes(svg,W,H,[0,10],[0,10]);
  const pts=d3.range(8).map(i=>({x:1+i*1.15,y:1.5+i*.8+gauss(r)*.9}));
  const fitG=g.append('g'),hg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true,color:api.color});
  const draw=()=>{ fitG.selectAll('*').remove(); const n=pts.length,mx=d3.mean(pts,p=>p.x),my=d3.mean(pts,p=>p.y);
    const b=d3.sum(pts,p=>(p.x-mx)*(p.y-my))/d3.sum(pts,p=>(p.x-mx)**2),a=my-b*mx; let sse=0;
    pts.forEach(p=>{ const e=p.y-(a+b*p.x),s=M.abs(ax.y(e)-ax.y(0)); sse+=e*e;
      box(fitG,e>0?ax.x(p.x)-s:ax.x(p.x),M.min(ax.y(p.y),ax.y(a+b*p.x)),s,s,C.am,{rx:0,fo:.15}); });
    pathL(fitG,[[ax.x(0),ax.y(a)],[ax.x(10),ax.y(a+10*b)]],api.color,2.5); info.text(`y = ${a.toFixed(2)} + ${b.toFixed(2)}x   SSE = ${sse.toFixed(2)}`); };
  pts.forEach((p,i)=>handle(svg,hg,ax.x(p.x),ax.y(p.y),C.cy,(mx,my)=>{ p.x=ax.x.invert(mx); p.y=ax.y.invert(my); hg.selectAll('circle').filter((d,j)=>j===i).attr('cx',mx).attr('cy',my); draw(); }));
  draw(); K.label(svg,W-140,H-8,'方块面积 = 残差²','square = residual²',{size:11,color:C.am}); return none();
});

def('ml_logistic','逻辑回归','Logistic regression','sigmoid 把线性得分压到 (0,1)。滑杆调权重 w：越大越陡，决策边界在 p=0.5。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[-6,6],[-.1,1.1]),r=rnd(11);
  const pts=d3.range(24).map(i=>{ const c=i%2,x=(c?1.6:-1.6)+gauss(r)*1.5; return {x,c}; });
  g.selectAll('circle').data(pts).join('circle').attr('cx',p=>ax.x(p.x)).attr('cy',p=>ax.y(p.c)).attr('r',5).attr('fill',p=>p.c?C.gr:C.rd).attr('opacity',.85);
  const cur=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',2.5),bd=ln(g,0,ax.y(-.1),0,ax.y(1.1),C.am,1.5,{dash:'5 4'}),info=txt(g,W/2,20,'',{anchor:'middle',mono:true});
  ln(g,ax.x(-6),ax.y(.5),ax.x(6),ax.y(.5),C.hair,1);
  let w=1,b=0; const draw=()=>{ cur.attr('d',d3.line()(d3.range(-6,6.01,.1).map(x=>[ax.x(x),ax.y(sig(w*x+b))]))); const x0=-b/w; bd.attr('x1',ax.x(x0)).attr('x2',ax.x(x0));
    const ll=d3.sum(pts,p=>{ const q=sig(w*p.x+b); return -(p.c*M.log(q+1e-9)+(1-p.c)*M.log(1-q+1e-9)); }); info.text(`p = σ(${w.toFixed(1)}x + ${b.toFixed(1)})   loss=${(ll/pts.length).toFixed(3)}   边界 x=${x0.toFixed(2)}`); };
  draw(); api.slider('权重 w',.2,5,.1,1,v=>{w=+v;draw();}); api.slider('偏置 b',-4,4,.1,0,v=>{b=+v;draw();});
  K.label(svg,ax.x(-5.8),ax.y(1.05),'p(类=1)','probability',{size:11}); return none();
});

def('ml_svm','支持向量机','SVM','拖点。SVM 找间隔最宽的分界线，只有贴着虚线的点（支持向量）说了算。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[-4,4],[-4,4]),pts=blobs(16,5,1.6);
  const lg=g.append('g'),hg=g.append('g');
  const draw=()=>{ lg.selectAll('*').remove(); let w=[.1,0],b=0; for(let it=0;it<400;it++){ const lr=.05; pts.forEach(p=>{ const y=p.c?1:-1,m=y*(w[0]*p.x+w[1]*p.y+b); if(m<1){ w[0]+=lr*(y*p.x-.02*w[0]); w[1]+=lr*(y*p.y-.02*w[1]); b+=lr*y; } else { w[0]-=lr*.02*w[0]; w[1]-=lr*.02*w[1]; } }); }
    const line=(k,col,dash,wd)=>{ const f=x=>(k-b-w[0]*x)/w[1]; pathL(lg,[[ax.x(-4),ax.y(f(-4))],[ax.x(4),ax.y(f(4))]],col,wd,{dash}); };
    line(0,api.color,null,2.5); line(1,C.am,'5 4',1.5); line(-1,C.am,'5 4',1.5);
    const nw=M.hypot(w[0],w[1]); pts.forEach(p=>{ const m=(p.c?1:-1)*(w[0]*p.x+w[1]*p.y+b); if(m<1.15) lg.append('circle').attr('cx',ax.x(p.x)).attr('cy',ax.y(p.y)).attr('r',11).attr('fill','none').attr('stroke',C.am).attr('stroke-width',2); });
    txt(lg,W/2,20,`间隔宽 margin = ${(2/nw).toFixed(2)}`,{anchor:'middle',mono:true,color:C.am}); };
  pts.forEach((p,i)=>handle(svg,hg,ax.x(p.x),ax.y(p.y),p.c?C.gr:C.rd,(mx,my)=>{ p.x=ax.x.invert(mx); p.y=ax.y.invert(my); hg.selectAll('circle').filter((d,j)=>j===i).attr('cx',mx).attr('cy',my); draw(); }));
  draw(); K.label(svg,12,H-8,'圈出的点 = 支持向量','circled = support vectors',{size:11,color:C.am}); return none();
});

def('ml_tree','决策树','Decision tree','每一层选一个特征、一个阈值把平面切两半，让两边更纯。滑杆看深度。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[0,10],[0,10]),r=rnd(3);
  const pts=d3.range(60).map(()=>{ const x=r()*10,y=r()*10; return {x,y,c:(x>4&&y>5)||(x<4&&y<3)||(x>7&&y<2)?1:0}; });
  const gini=ps=>{ if(!ps.length) return 0; const p=d3.mean(ps,d=>d.c); return 2*p*(1-p); };
  const split=(ps,box_,d,out)=>{ if(d===0||ps.length<4||gini(ps)===0) return; let best=null;
    ['x','y'].forEach(k=>d3.range(.5,10,.5).forEach(t=>{ const L=ps.filter(p=>p[k]<t),R=ps.filter(p=>p[k]>=t); if(!L.length||!R.length) return; const s=(L.length*gini(L)+R.length*gini(R))/ps.length; if(!best||s<best.s) best={k,t,s,L,R}; }));
    if(!best) return; out.push({...best,box:box_}); const b=box_;
    split(best.L,best.k==='x'?{x0:b.x0,x1:best.t,y0:b.y0,y1:b.y1}:{x0:b.x0,x1:b.x1,y0:b.y0,y1:best.t},d-1,out);
    split(best.R,best.k==='x'?{x0:best.t,x1:b.x1,y0:b.y0,y1:b.y1}:{x0:b.x0,x1:b.x1,y0:best.t,y1:b.y1},d-1,out); };
  const sg=g.append('g'); g.selectAll('circle').data(pts).join('circle').attr('cx',p=>ax.x(p.x)).attr('cy',p=>ax.y(p.y)).attr('r',4).attr('fill',p=>p.c?C.gr:C.rd);
  const draw=d=>{ sg.selectAll('*').remove(); const out=[]; split(pts,{x0:0,x1:10,y0:0,y1:10},d,out);
    out.forEach((s,i)=>{ const b=s.box,l=s.k==='x'?ln(sg,ax.x(s.t),ax.y(b.y0),ax.x(s.t),ax.y(b.y1),api.color,2):ln(sg,ax.x(b.x0),ax.y(s.t),ax.x(b.x1),ax.y(s.t),api.color,2); l.attr('opacity',0).transition().delay(i*120).attr('opacity',1); });
    txt(sg,W/2,20,`深度 ${d}，切分 ${out.length} 次`,{anchor:'middle',mono:true}); };
  draw(2); api.slider('深度 / depth',0,5,1,2,v=>draw(+v)); return none();
});

def('ml_forest','随机森林','Random forest','很多棵各看一部分数据的浅树各投一票，多数说了算。点击平面任一点看投票。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(9),N=9,pw=W*.6,ax=K.axes(svg,pw,H,[0,10],[0,10]);
  const pts=d3.range(50).map(()=>{ const x=r()*10,y=r()*10; return {x,y,c:(x-5)**2+(y-5)**2<9?1:0}; });
  const trees=d3.range(N).map(()=>{ const s=pts.filter(()=>r()<.6),k=r()<.5?'x':'y',t=2+r()*6; const L=d3.mean(s.filter(p=>p[k]<t),p=>p.c)||0,R=d3.mean(s.filter(p=>p[k]>=t),p=>p.c)||0; return {k,t,L:L>.5?1:0,R:R>.5?1:0}; });
  g.selectAll('circle').data(pts).join('circle').attr('cx',p=>ax.x(p.x)).attr('cy',p=>ax.y(p.y)).attr('r',4).attr('fill',p=>p.c?C.gr:C.rd).attr('opacity',.8);
  const vg=g.append('g'),q=dot(g,ax.x(5),ax.y(5),7,C.am).attr('stroke',C.ink);
  const vote=(x,y)=>{ vg.selectAll('*').remove(); let yes=0; trees.forEach((t,i)=>{ const v=(x<t.t?t.L:t.R); yes+=v; const bx=pw+20+(i%3)*(W-pw-40)/3,by=50+M.floor(i/3)*70;
      box(vg,bx,by,44,44,v?C.gr:C.rd,{fo:.3}); txt(vg,bx+22,by+27,v?'1':'0',{anchor:'middle',size:16,bold:true}); txt(vg,bx+22,by+56,`${t.k}<${t.t.toFixed(1)}`,{anchor:'middle',size:9,color:C.muted,mono:true}); });
    K.label(vg,pw+20,H-40,`投票 ${yes}:${N-yes} → 类 ${yes>N/2?1:0}`,'majority vote',{size:14,color:yes>N/2?C.gr:C.rd}); };
  svg.on('click',ev=>{ const [mx,my]=d3.pointer(ev,svg.node()); if(mx>pw) return; q.attr('cx',mx).attr('cy',my); vote(ax.x.invert(mx),ax.y.invert(my)); });
  vote(5,5); K.label(svg,pw+20,24,`${N} 棵树各自投票`,'9 shallow trees',{size:12}); return none();
});

def('ml_xgboost','梯度提升','Gradient boosting','每轮加一棵小树去拟合上一轮的残差。点"加一棵"看残差被逐轮吃掉。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[0,10],[-3,4]),r=rnd(4);
  const xs=d3.range(0,10.01,.25),truth=x=>M.sin(x)+.3*x-1,data=xs.map(x=>({x,y:truth(x)+gauss(r)*.25}));
  let pred=xs.map(()=>0),k=0,eta=.5; const pg=g.append('g'),rg=g.append('g'),info=txt(g,W/2,20,'',{anchor:'middle',mono:true});
  g.selectAll('circle').data(data).join('circle').attr('cx',d=>ax.x(d.x)).attr('cy',d=>ax.y(d.y)).attr('r',3).attr('fill',C.muted);
  const stump=res=>{ let best=null; for(let t=.5;t<10;t+=.5){ const L=res.filter((_,i)=>xs[i]<t),R=res.filter((_,i)=>xs[i]>=t); if(!L.length||!R.length) continue; const ml=d3.mean(L),mr=d3.mean(R),s=d3.sum(L,v=>(v-ml)**2)+d3.sum(R,v=>(v-mr)**2); if(!best||s<best.s) best={t,ml,mr,s}; } return best; };
  const draw=()=>{ pg.selectAll('*').remove(); rg.selectAll('*').remove(); const res=data.map((d,i)=>d.y-pred[i]);
    xs.forEach((x,i)=>ln(rg,ax.x(x),ax.y(pred[i]),ax.x(x),ax.y(data[i].y),C.rd,1.2).attr('opacity',.6));
    pathL(pg,xs.map((x,i)=>[ax.x(x),ax.y(pred[i])]),api.color,2.5); info.text(`轮 ${k}   残差平方和 = ${d3.sum(res,v=>v*v).toFixed(2)}`); };
  api.button('加一棵树 / add tree',()=>{ const res=data.map((d,i)=>d.y-pred[i]),s=stump(res); if(!s) return; pred=pred.map((p,i)=>p+eta*(xs[i]<s.t?s.ml:s.mr)); k++; draw(); });
  api.button('重来 / reset',()=>{ pred=xs.map(()=>0); k=0; draw(); }); api.slider('学习率 η',.1,1,.1,.5,v=>{eta=+v;});
  draw(); K.label(svg,12,H-8,'红线 = 当前残差','red = residual',{size:11,color:C.rd}); return none();
});

def('ml_knn','K 近邻','k-NN','拖黄点。找最近的 k 个邻居，看它们多数是什么色就判什么色。k 大更平滑。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[-4,4],[-4,4]),pts=blobs(30,13,1.3);
  g.selectAll('circle').data(pts).join('circle').attr('cx',p=>ax.x(p.x)).attr('cy',p=>ax.y(p.y)).attr('r',5).attr('fill',p=>p.c?C.gr:C.rd).attr('opacity',.85);
  const ring=g.append('circle').attr('fill',api.color).attr('fill-opacity',.08).attr('stroke',api.color).attr('stroke-dasharray','4 3'),lg=g.append('g'),info=txt(g,W/2,20,'',{anchor:'middle',mono:true});
  let k=5,qx=0,qy=0; const hg=g.append('g');
  const draw=()=>{ lg.selectAll('*').remove(); const nb=pts.map(p=>({p,d:M.hypot(p.x-qx,p.y-qy)})).sort((a,b)=>a.d-b.d).slice(0,k),yes=nb.filter(n=>n.p.c).length;
    ring.attr('cx',ax.x(qx)).attr('cy',ax.y(qy)).attr('r',nb[nb.length-1].d*(ax.x(1)-ax.x(0)));
    nb.forEach(n=>ln(lg,ax.x(qx),ax.y(qy),ax.x(n.p.x),ax.y(n.p.y),n.p.c?C.gr:C.rd,1.2)); hg.select('circle').attr('fill',yes>k/2?C.gr:C.rd);
    info.text(`k=${k}   邻居 ${yes} 绿 : ${k-yes} 红 → 判 ${yes>k/2?'绿':'红'}`); };
  handle(svg,hg,ax.x(0),ax.y(0),C.am,(mx,my)=>{ qx=ax.x.invert(mx); qy=ax.y.invert(my); hg.select('circle').attr('cx',mx).attr('cy',my); draw(); });
  draw(); api.slider('k',1,15,2,5,v=>{k=+v;draw();}); return none();
});

def('ml_kmeans','K 均值聚类','k-means','两步循环：每点归最近质心；质心移到自己那群的平均。点"一步"看质心走。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[-5,5],[-4,4]),r=rnd(21),K_=3,cols=[C.cy,C.am,C.vi];
  const ctr=[[-2.5,1.5],[2.5,1.5],[0,-2]],pts=d3.range(90).map(i=>{ const c=ctr[i%3]; return {x:c[0]+gauss(r)*.9,y:c[1]+gauss(r)*.9,a:0}; });
  let cen=d3.range(K_).map(()=>[gauss(r)*.5,gauss(r)*.5]),it=0,phase=0;
  const pg=g.selectAll('circle').data(pts).join('circle').attr('cx',p=>ax.x(p.x)).attr('cy',p=>ax.y(p.y)).attr('r',4).attr('fill',C.muted);
  const cg=g.append('g'),info=txt(g,W/2,20,'',{anchor:'middle',mono:true});
  const drawC=()=>{ const s=cg.selectAll('path').data(cen); s.join('path').attr('d',d3.symbol().type(d3.symbolCross).size(200)).attr('fill',(d,i)=>cols[i]).attr('stroke',C.ink).transition().duration(500).attr('transform',d=>`translate(${ax.x(d[0])},${ax.y(d[1])})`); };
  const step=()=>{ if(phase===0){ pts.forEach(p=>{ let b=0,bd=1e9; cen.forEach((c,i)=>{ const d=M.hypot(p.x-c[0],p.y-c[1]); if(d<bd){bd=d;b=i;} }); p.a=b; }); pg.transition().duration(400).attr('fill',p=>cols[p.a]); info.text(`轮 ${it}：分配 assign`); }
    else { cen=cen.map((c,i)=>{ const m=pts.filter(p=>p.a===i); return m.length?[d3.mean(m,p=>p.x),d3.mean(m,p=>p.y)]:c; }); drawC(); it++; info.text(`轮 ${it}：更新质心 update`); } phase^=1; };
  drawC(); info.text('点"一步"开始'); api.button('一步 / step',step); const T=ticker(); api.button('自动 / auto',()=>{ T.stop(); T.every(700,step); }); return {stop:()=>T.stop()};
});

def('ml_pca','主成分分析','PCA','旋转一根轴，把点投影上去。方差最大的那个方向就是第一主成分。拖滑杆找峰值。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W*.62,H,[-4,4],[-4,4]),r=rnd(8);
  const pts=d3.range(60).map(()=>{ const t=gauss(r)*1.8,n=gauss(r)*.5; return {x:t*M.cos(.6)-n*M.sin(.6),y:t*M.sin(.6)+n*M.cos(.6)}; });
  g.selectAll('circle').data(pts).join('circle').attr('cx',p=>ax.x(p.x)).attr('cy',p=>ax.y(p.y)).attr('r',3.5).attr('fill',C.muted);
  const axl=g.append('g'),bar=g.append('g'),vx=d3.scaleLinear().domain([0,180]).range([W*.66,W-20]),vy=d3.scaleLinear().domain([0,4]).range([H-40,60]);
  const vs=d3.range(0,181,3).map(a=>{ const t=a*M.PI/180,u=[M.cos(t),M.sin(t)]; return [a,d3.variance(pts,p=>p.x*u[0]+p.y*u[1])]; });
  pathL(g,vs.map(v=>[vx(v[0]),vy(v[1])]),C.muted,1.5); K.label(svg,W*.66,40,'投影方差 vs 角度','variance(θ)',{size:11});
  const draw=a=>{ axl.selectAll('*').remove(); bar.selectAll('*').remove(); const t=a*M.PI/180,u=[M.cos(t),M.sin(t)],v=d3.variance(pts,p=>p.x*u[0]+p.y*u[1]);
    ln(axl,ax.x(-4*u[0]),ax.y(-4*u[1]),ax.x(4*u[0]),ax.y(4*u[1]),api.color,2.5);
    pts.forEach(p=>{ const s=p.x*u[0]+p.y*u[1]; ln(axl,ax.x(p.x),ax.y(p.y),ax.x(s*u[0]),ax.y(s*u[1]),C.hair,1); dot(axl,ax.x(s*u[0]),ax.y(s*u[1]),2.5,C.am); });
    dot(bar,vx(a),vy(v),6,api.color); txt(bar,vx(a),vy(v)-12,`θ=${a}° var=${v.toFixed(2)}`,{anchor:'middle',mono:true,size:11,color:api.color}); };
  draw(0); api.slider('轴角度 θ',0,180,1,0,v=>draw(+v)); return none();
});

def('ml_naive_bayes','朴素贝叶斯','Naive Bayes','假设特征彼此独立，各自的条件概率直接相乘。切换特征取值看两类分数怎么变。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const F=[{n:'发烧 fever',p:[.8,.2]},{n:'咳嗽 cough',p:[.7,.3]},{n:'皮疹 rash',p:[.1,.4]}],prior=[.3,.7],st=[1,1,0];
  const draw=()=>{ g.selectAll('*').remove(); const sc=[0,1].map(c=>prior[c]*F.reduce((a,f,i)=>a*(st[i]?f.p[c]:1-f.p[c]),1)),tot=sc[0]+sc[1];
    F.forEach((f,i)=>{ const y=50+i*60,on=st[i]; box(g,30,y,150,40,on?api.color:C.muted,{fo:on?.3:.08}).style('cursor','pointer').on('click',()=>{st[i]^=1;draw();});
      txt(g,105,y+25,`${f.n} = ${on?'是':'否'}`,{anchor:'middle',size:12});
      [0,1].forEach(c=>{ const v=on?f.p[c]:1-f.p[c],x0=220+c*(W-240)/2,w=(W-260)/2; box(g,x0,y+8,w*v,24,c?C.gr:C.rd,{fo:.5,rx:3}); txt(g,x0+w*v+6,y+25,v.toFixed(2),{mono:true,size:11}); }); });
    [0,1].forEach(c=>{ const x0=220+c*(W-240)/2; K.label(g,x0,32,c?'流感':'麻疹',c?'flu':'measles',{color:c?C.gr:C.rd}); txt(g,x0,H-64,`先验 ${prior[c]} × ∏ = ${sc[c].toExponential(2)}`,{mono:true,size:11,color:C.muted});
      txt(g,x0,H-40,`后验 P = ${(sc[c]/tot).toFixed(3)}`,{size:15,bold:true,color:c?C.gr:C.rd,mono:true}); });
    K.label(g,30,H-20,'点左侧方块切换特征','click to toggle',{size:11,color:C.muted}); };
  draw(); return none();
});

def('ml_metrics','混淆矩阵与阈值','Confusion matrix','滑阈值。阈值高→查准 P 升、查全 R 降；F1 是两者调和平均。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(17);
  const pts=d3.range(80).map(i=>{ const c=i%2; return {c,s:sig((c?1.2:-1.2)+gauss(r)*1.2)}; });
  const sx=d3.scaleLinear().domain([0,1]).range([40,W*.55]),y0=H-60;
  pts.forEach(p=>dot(g,sx(p.s),y0-10-(p.c?30:0)-r()*30,4,p.c?C.gr:C.rd).attr('opacity',.8)); ln(g,40,y0,W*.55,y0,C.muted,1.5);
  K.label(svg,40,H-30,'预测得分 →','score',{size:11,color:C.muted}); const th=ln(g,0,y0-90,0,y0,C.am,2),mg=g.append('g');
  const draw=t=>{ mg.selectAll('*').remove(); th.attr('x1',sx(t)).attr('x2',sx(t)); let tp=0,fp=0,fn=0,tn=0; pts.forEach(p=>{ const y=p.s>=t; if(p.c&&y) tp++; else if(!p.c&&y) fp++; else if(p.c) fn++; else tn++; });
    const P=tp/(tp+fp||1),R=tp/(tp+fn||1),F=2*P*R/(P+R||1),cx=W*.62,cw=(W-cx-30)/2;
    [[tp,'TP',C.gr],[fp,'FP',C.rd],[fn,'FN',C.rd],[tn,'TN',C.gr]].forEach((d,i)=>{ const x=cx+(i%2)*cw,y=40+M.floor(i/2)*70; box(mg,x,y,cw-6,64,d[2],{fo:.2}); txt(mg,x+cw/2-3,y+28,d[1],{anchor:'middle',size:11,color:C.muted,mono:true}); txt(mg,x+cw/2-3,y+50,String(d[0]),{anchor:'middle',size:18,bold:true,mono:true}); });
    txt(mg,cx,H-70,`阈值 ${t.toFixed(2)}`,{mono:true,color:C.am}); txt(mg,cx,H-50,`查准 P = ${P.toFixed(2)}   查全 R = ${R.toFixed(2)}`,{mono:true,size:12}); txt(mg,cx,H-30,`F1 = ${F.toFixed(2)}`,{mono:true,size:14,bold:true,color:api.color}); };
  draw(.5); api.slider('阈值 / threshold',.02,.98,.02,.5,v=>draw(+v)); return none();
});

/* ============ dl 深度学习 ============ */
const layersXY=(W,H,sizes)=>sizes.map((n,l)=>d3.range(n).map(i=>[60+l*(W-120)/(sizes.length-1),H/2+(i-(n-1)/2)*44]));
def('dl_mlp','多层感知机','MLP forward','信号从左到右逐层点亮：每个神经元 = 加权求和 + 激活。点"前向"看一遍。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),sizes=[3,5,5,2],L=layersXY(W,H,sizes),r=rnd(2);
  const edges=[],nodes=[]; L.forEach((lay,l)=>{ if(l) L[l-1].forEach(a=>lay.forEach(b=>edges.push(ln(g,a[0],a[1],b[0],b[1],C.hair,1).datum({l}))));
    lay.forEach(p=>nodes.push(g.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',12).attr('fill',C.muted).attr('fill-opacity',.4).attr('stroke',C.muted).datum({l}))); });
  ['输入 input','隐层 h1','隐层 h2','输出 output'].forEach((s,l)=>txt(g,L[l][0][0],H-14,s,{anchor:'middle',size:11,color:C.muted}));
  const T=ticker(); const fire=()=>{ nodes.forEach(n=>n.attr('fill',C.muted).attr('stroke',C.muted).attr('r',12)); edges.forEach(e=>e.attr('stroke',C.hair).attr('stroke-width',1)); let l=0;
    T.stop(); T.every(450,()=>{ if(l>=sizes.length){ T.stop(); return; } nodes.filter(n=>n.datum().l===l).forEach(n=>n.transition().duration(300).attr('fill',api.color).attr('stroke',api.color).attr('r',12+r()*5));
      edges.filter(e=>e.datum().l===l).forEach(e=>e.transition().duration(300).attr('stroke',api.color).attr('stroke-width',.5+r()*2.5).attr('opacity',.7)); l++; }); };
  fire(); api.button('前向传播 / forward',fire); K.label(svg,12,20,'线粗 = 权重大小','width = |weight|',{size:11}); return {stop:()=>T.stop()};
});

def('dl_activation','激活函数','Activation','切换函数：ReLU 负半轴清零，sigmoid/tanh 会饱和（梯度消失），GELU 是平滑的 ReLU。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[-4,4],[-1.5,3]);
  const F=[['ReLU',x=>M.max(0,x)],['sigmoid',x=>sig(x)],['tanh',x=>M.tanh(x)],['GELU',x=>x*sig(1.702*x)],['LeakyReLU',x=>x>0?x:.1*x]];
  const cur=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',3),der=g.append('path').attr('fill','none').attr('stroke',C.am).attr('stroke-width',1.5).attr('stroke-dasharray','4 3'),tt=txt(g,W/2,20,'',{anchor:'middle',size:15,bold:true,mono:true});
  const draw=k=>{ const [n,f]=F[k],xs=d3.range(-4,4.01,.05); cur.transition().duration(400).attr('d',d3.line()(xs.map(x=>[ax.x(x),ax.y(f(x))])));
    der.transition().duration(400).attr('d',d3.line()(xs.map(x=>[ax.x(x),ax.y((f(x+1e-3)-f(x-1e-3))/2e-3)]))); tt.text(n); };
  draw(0); api.slider('函数 / fn',0,F.length-1,1,0,v=>draw(+v)); K.label(svg,W-30,40,'虚线 = 导数','dashed = derivative',{anchor:'end',size:11,color:C.am}); return none();
});

def('dl_backprop','反向传播','Backprop','误差从输出端红色反流：每层梯度 = 上游梯度 × 本层局部导数（链式法则）。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),sizes=[3,4,4,1],L=layersXY(W,H,sizes),mk=K.arrow(svg,uid('a'),C.rd);
  L.forEach((lay,l)=>{ if(l) L[l-1].forEach(a=>lay.forEach(b=>ln(g,a[0],a[1],b[0],b[1],C.hair,1))); lay.forEach(p=>dot(g,p[0],p[1],11,C.muted).attr('fill-opacity',.5)); });
  const fg=g.append('g'),info=K.label(svg,W/2,H-26,'','',{anchor:'middle'}); let step=0;
  const T=ticker(); const run=()=>{ fg.selectAll('*').remove(); step=sizes.length-1; T.stop(); T.every(700,()=>{ if(step<=0){ T.stop(); return; }
    L[step].forEach(b=>L[step-1].forEach(a=>ln(fg,b[0],b[1],a[0],a[1],C.rd,2,{arrow:mk}).attr('opacity',0).transition().duration(400).attr('opacity',.8)));
    L[step-1].forEach(p=>fg.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',11).attr('fill',C.rd).attr('fill-opacity',.5));
    info.select('text').text(`∂L/∂h${step-1} = ∂L/∂h${step} · ∂h${step}/∂h${step-1}`).attr('font-family','ui-monospace,Menlo,monospace'); step--; }); };
  run(); api.button('再反传一次 / backprop',run); K.label(svg,L[3][0][0],L[3][0][1]-24,'损失 L','loss',{anchor:'middle',color:C.rd}); return {stop:()=>T.stop()};
});

def('dl_cnn','卷积','Convolution','3×3 卷积核在图上滑窗，每格 = 对应位置相乘再求和。切换核看边缘/模糊。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),N=8,cs=M.min(30,(H-60)/N),r=rnd(6);
  const img=d3.range(N).map(i=>d3.range(N).map(j=>(j<N/2?.2:.8)+r()*.15));
  const KS=[['边缘 edge',[[-1,-1,-1],[-1,8,-1],[-1,-1,-1]]],['模糊 blur',[[1,1,1],[1,1,1],[1,1,1]].map(a=>a.map(v=>v/9))],['竖边 vertical',[[-1,0,1],[-2,0,2],[-1,0,1]]]];
  const x0=40,y0=40,x1=W-40-(N-2)*cs; let ki=0,pos=0; const T=ticker();
  const cell=(x,y,v,col)=>box(g,x,y,cs-2,cs-2,col,{fo:M.max(0,M.min(1,v)),rx:2,sw:.5,stroke:C.hair});
  const draw=()=>{ g.selectAll('*').remove(); const k=KS[ki][1],out=d3.range(N-2).map(i=>d3.range(N-2).map(j=>d3.sum(k.flat().map((w,q)=>w*img[i+M.floor(q/3)][j+q%3]))));
    img.forEach((row,i)=>row.forEach((v,j)=>cell(x0+j*cs,y0+i*cs,v,C.ink))); const pi=M.floor(pos/(N-2)),pj=pos%(N-2);
    out.forEach((row,i)=>row.forEach((v,j)=>{ if(i*(N-2)+j<=pos) cell(x1+j*cs,y0+i*cs,(v+1)/2,api.color); }));
    g.append('rect').attr('x',x0+pj*cs-2).attr('y',y0+pi*cs-2).attr('width',3*cs).attr('height',3*cs).attr('fill','none').attr('stroke',C.am).attr('stroke-width',2.5);
    g.append('rect').attr('x',x1+pj*cs-2).attr('y',y0+pi*cs-2).attr('width',cs).attr('height',cs).attr('fill','none').attr('stroke',C.am).attr('stroke-width',2.5);
    const kx=W/2-45,ky=H-70; k.forEach((row,i)=>row.forEach((v,j)=>{ box(g,kx+j*28,ky+i*22,26,20,C.am,{fo:.15,rx:2}); txt(g,kx+j*28+13,ky+i*22+14,K.fmt(v,1),{anchor:'middle',size:9,mono:true}); }));
    K.label(g,x0,26,'输入','input',{size:11}); K.label(g,x1,26,'输出特征图','feature map',{size:11}); txt(g,W/2,H-80,KS[ki][0],{anchor:'middle',size:11,color:C.am}); };
  draw(); T.every(220,()=>{ pos=(pos+1)%((N-2)*(N-2)); draw(); }); api.slider('卷积核 / kernel',0,KS.length-1,1,0,v=>{ki=+v;pos=0;draw();}); return {stop:()=>T.stop()};
});

def('dl_rnn','循环网络','RNN unrolled','同一个格子按时间展开：h_t = f(W·h_{t−1} + U·x_t)。状态一步步往右传。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T_=6,sp=(W-100)/(T_-1),mk=K.arrow(svg,uid('r'),api.color),xs='H e l l o !'.split(' ');
  const cells=d3.range(T_).map(t=>{ const x=50+t*sp,y=H/2; box(g,x-26,y-22,52,44,C.muted,{fo:.1}); txt(g,x,y+5,'h'+t,{anchor:'middle',mono:true,size:13});
    ln(g,x,y+60,x,y+24,C.muted,1.5,{arrow:mk}); txt(g,x,y+80,xs[t],{anchor:'middle',size:16,bold:true}); ln(g,x,y-24,x,y-60,C.muted,1.5,{arrow:mk}); txt(g,x,y-70,'y'+t,{anchor:'middle',mono:true,size:11,color:C.muted});
    return {x,y,arr:t<T_-1?ln(g,x+28,y,x+sp-28,y,C.muted,1.5,{arrow:mk}):null}; });
  const pulse=dot(g,cells[0].x,cells[0].y,9,api.color).attr('opacity',.9),Tk=ticker(); let t=0;
  Tk.every(650,()=>{ t=(t+1)%T_; g.selectAll('rect').attr('stroke',C.muted).attr('fill',C.muted); cells.forEach((c,i)=>{ if(c.arr) c.arr.attr('stroke',i<t?api.color:C.muted); });
    d3.select(g.selectAll('rect').nodes()[t]).attr('stroke',api.color).attr('fill',api.color); pulse.transition().duration(500).attr('cx',cells[t].x); });
  K.label(svg,12,18,'同一组权重 W,U 被重复使用','shared weights across time',{size:11}); return {stop:()=>Tk.stop()};
});

def('dl_attention','注意力','Attention','每个 query 和所有 key 点积→softmax 得权重（热力），再用权重加权 value。拖温度看聚焦程度。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),tok=['The','cat','sat','on','mat'],n=tok.length,r=rnd(19),cs=M.min(38,(H-90)/n);
  const Q=tok.map(()=>[gauss(r),gauss(r)]),Kk=tok.map((_,i)=>[Q[i][0]+gauss(r)*.5,Q[i][1]+gauss(r)*.5]),x0=70,y0=50;
  const sc=d3.scaleSequential(t=>d3.interpolateRgb(C.muted,api.color)(t)).domain([0,1]);
  const draw=temp=>{ g.selectAll('*').remove(); tok.forEach((t,i)=>{ txt(g,x0-8,y0+i*cs+cs/2+4,t,{anchor:'end',size:11}); txt(g,x0+i*cs+cs/2,y0-8,t,{anchor:'middle',size:11}); });
    Q.forEach((q,i)=>{ const s=Kk.map(k=>(q[0]*k[0]+q[1]*k[1])/temp),m=M.max(...s),e=s.map(v=>M.exp(v-m)),z=d3.sum(e),w=e.map(v=>v/z);
      w.forEach((v,j)=>{ box(g,x0+j*cs,y0+i*cs,cs-2,cs-2,sc(v),{fo:1,rx:3,sw:0}); txt(g,x0+j*cs+cs/2-1,y0+i*cs+cs/2+4,v.toFixed(2),{anchor:'middle',size:9,mono:true,color:v>.5?'#0b1220':C.ink}); });
      const bx=x0+n*cs+40,bw=W-bx-30; box(g,bx,y0+i*cs+4,bw*M.max(...w),cs-10,C.am,{fo:.6,rx:3}); txt(g,bx+bw*M.max(...w)+6,y0+i*cs+cs/2+3,`max ${M.max(...w).toFixed(2)}`,{size:10,mono:true,color:C.muted}); });
    K.label(g,x0,y0+n*cs+22,'行 = query，列 = key，颜色 = softmax 权重','rows: query, cols: key, color: weight',{size:11}); K.label(g,x0+n*cs+40,y0-14,'最大权重','peak',{size:10,color:C.am}); };
  draw(1); api.slider('温度 T（√d 的作用）',.2,4,.1,1,v=>draw(+v)); return none();
});

def('dl_transformer','Transformer 块','Transformer block','多头并行：同一输入被 h 个头各自看一遍再拼起来，然后残差 + LayerNorm + FFN。点亮看数据流。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),heads=4,mk=K.arrow(svg,uid('t'),C.muted);
  const cols=[C.cy,C.vi,C.gr,C.am],st=[[W*.08,'输入\nInput'],[W*.5,'拼接 concat'],[W*.7,'残差+LN'],[W*.88,'FFN']];
  const bl=(x,y,w,h,s,col)=>{ const b=box(g,x-w/2,y-h/2,w,h,col,{fo:.15}); s.split('\n').forEach((t,i)=>txt(g,x,y+5+(i-.5)*13,t,{anchor:'middle',size:11})); return b; };
  const parts=[bl(st[0][0],H/2,64,44,'输入\nx',C.muted)];
  const hb=d3.range(heads).map(i=>{ const y=40+i*(H-80)/(heads-1); ln(g,st[0][0]+32,H/2,W*.3-30,y,C.muted,1.2,{arrow:mk}); ln(g,W*.3+30,y,st[1][0]-30,H/2,C.muted,1.2,{arrow:mk}); return bl(W*.3,y,60,32,`Head ${i+1}`,cols[i]); });
  parts.push(bl(st[1][0],H/2,60,44,'拼接\nconcat',C.muted)); ln(g,st[1][0]+30,H/2,st[2][0]-32,H/2,C.muted,1.2,{arrow:mk});
  parts.push(bl(st[2][0],H/2,64,44,'残差+LN\nAdd&Norm',C.muted)); ln(g,st[2][0]+32,H/2,st[3][0]-28,H/2,C.muted,1.2,{arrow:mk}); parts.push(bl(st[3][0],H/2,56,44,'FFN',C.muted));
  g.append('path').attr('d',`M${st[0][0]},${H/2+22} Q${W*.4},${H-10} ${st[2][0]},${H/2+22}`).attr('fill','none').attr('stroke',C.am).attr('stroke-dasharray','4 3').attr('stroke-width',1.5);
  const seq=[[parts[0]],hb,[parts[1]],[parts[2]],[parts[3]]],T=ticker(); let k=0;
  T.every(600,()=>{ [...parts,...hb].forEach(b=>b.attr('fill-opacity',.15).attr('stroke-width',1.5)); seq[k].forEach(b=>b.attr('fill-opacity',.6).attr('stroke-width',3)); k=(k+1)%seq.length; });
  K.label(svg,W*.4,H-14,'跳接 residual','x + Attn(x)',{anchor:'middle',size:10,color:C.am}); return {stop:()=>T.stop()};
});

def('dl_resnet','残差连接','ResNet skip','y = F(x) + x。层学的是"修正量"，退化时 F→0 直接传 x，所以能堆很深。滑杆看深度下梯度。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),mk=K.arrow(svg,uid('s'),C.muted);
  const draw=d=>{ g.selectAll('*').remove(); const n=M.min(d,8),sp=(W-100)/M.max(n,1),y=H/2-20; let gp=1,gr=1;
    d3.range(n).forEach(i=>{ const x=50+sp*i+sp/2; box(g,x-22,y-22,44,44,api.color,{fo:.15}); txt(g,x,y+5,'F'+(i+1),{anchor:'middle',mono:true});
      ln(g,x-sp/2+4,y,x-24,y,C.muted,1.5,{arrow:mk}); g.append('path').attr('d',`M${x-sp/2+6},${y} Q${x},${y-58} ${x+sp/2-6},${y}`).attr('fill','none').attr('stroke',C.am).attr('stroke-width',2); dot(g,x+sp/2-4,y,5,C.am); });
    for(let i=0;i<d;i++){ gp*=.7; gr*=1; } const gs=H-60;
    K.label(g,50,gs,`纯堆叠 plain：梯度 ≈ 0.7^${d} = ${gp.toExponential(1)}`,'gradient vanishes',{size:12,color:C.rd}); box(g,W*.55,gs-14,(W*.4)*gp,12,C.rd,{fo:.6});
    K.label(g,50,gs+34,`残差 residual：梯度 ≥ 1（+x 的那条路恒为 1）`,'identity path keeps gradient',{size:12,color:C.gr}); box(g,W*.55,gs+20,W*.4,12,C.gr,{fo:.6});
    txt(g,W/2,24,`深度 ${d} 层`,{anchor:'middle',mono:true,size:13}); };
  draw(4); api.slider('深度 / depth',1,30,1,4,v=>draw(+v)); return none();
});

def('dl_unet','U-Net','U-Net','左边逐层下采样抓语义，右边逐层上采样恢复位置，同层跳接把细节直接搬过去。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),L=4,mk=K.arrow(svg,uid('u'),C.am),bl=[],dx=(W-120)/(2*L);
  for(let i=0;i<L;i++){ const h=100-i*22,w=18+i*10,y=40+i*50,xl=50+i*dx,xr=W-50-i*dx-w; bl.push([box(g,xl,y,w,h,api.color,{fo:.25}),box(g,xr,y,w,h,C.gr,{fo:.25})]);
    ln(g,xl+w+6,y+h/2,xr-6,y+h/2,C.am,1.5,{arrow:mk,dash:'5 4'}); if(i<L-1){ ln(g,xl+w/2,y+h+2,xl+w/2+dx*.7,y+50,C.muted,1.5); ln(g,xr-dx*.7+w,y+50,xr+w/2,y+h+2,C.muted,1.5); } }
  const bh=box(g,W/2-30,40+L*50-10,60,30,C.vi,{fo:.3}); txt(g,W/2,40+L*50+10,'bottleneck',{anchor:'middle',size:10,mono:true});
  K.label(svg,50,26,'编码 下采样','encoder ↓',{size:11}); K.label(svg,W-50,26,'解码 上采样','decoder ↑',{anchor:'end',size:11,color:C.gr}); K.label(svg,W/2,H-12,'虚线 = 跳接，把细节直接抄过去','skip connections',{anchor:'middle',size:11,color:C.am});
  const order=[...bl.map(b=>b[0]),bh,...bl.map(b=>b[1]).reverse()],T=ticker(); let k=0;
  T.every(450,()=>{ order.forEach(b=>b.attr('fill-opacity',.25).attr('stroke-width',1.5)); order[k].attr('fill-opacity',.8).attr('stroke-width',3); k=(k+1)%order.length; }); return {stop:()=>T.stop()};
});

def('dl_vae','变分自编码器','VAE','编码器输出 μ 和 σ 而不是一个点；采样 z = μ + σ·ε 再解码。点"采样"看重建在潜空间里晃。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(23),mk=K.arrow(svg,uid('v'),C.muted);
  const cx=W/2,cy=H/2-10,ax={x:v=>cx+v*40,y:v=>cy-v*40}; let mu=[.5,.3],sd=.6;
  box(g,30,cy-40,70,80,api.color,{fo:.2}); txt(g,65,cy+5,'Encoder',{anchor:'middle',size:11}); box(g,W-100,cy-40,70,80,C.gr,{fo:.2}); txt(g,W-65,cy+5,'Decoder',{anchor:'middle',size:11});
  ln(g,102,cy,cx-90,cy,C.muted,1.5,{arrow:mk}); ln(g,cx+90,cy,W-104,cy,C.muted,1.5,{arrow:mk});
  const el=g.append('ellipse').attr('fill',api.color).attr('fill-opacity',.12).attr('stroke',api.color).attr('stroke-dasharray','4 3'),mp=dot(g,0,0,5,api.color),zp=dot(g,0,0,7,C.am).attr('stroke',C.ink),sg=g.append('g');
  const draw=(z)=>{ el.attr('cx',ax.x(mu[0])).attr('cy',ax.y(mu[1])).attr('rx',sd*80).attr('ry',sd*80); mp.attr('cx',ax.x(mu[0])).attr('cy',ax.y(mu[1]));
    if(z){ zp.transition().duration(300).attr('cx',ax.x(z[0])).attr('cy',ax.y(z[1])); sg.selectAll('*').remove(); const dist=M.hypot(z[0]-mu[0],z[1]-mu[1]); d3.range(5).forEach(i=>d3.range(5).forEach(j=>box(sg,W-96+j*12,cy+50+i*10,10,8,C.gr,{fo:M.max(.1,1-dist*.8)*(((i+j+M.round(z[0]*3))%2)?1:.3),rx:1,sw:0})));
      txt(sg,W-65,cy+110,`z=(${z[0].toFixed(2)}, ${z[1].toFixed(2)})`,{anchor:'middle',size:9,mono:true,color:C.muted}); } };
  K.label(svg,cx,cy-90,'潜空间 z ~ N(μ, σ²)','latent space',{anchor:'middle',size:12}); K.label(svg,cx,H-22,'KL 项把椭圆拉向标准正态；重建项让解码像原图','KL + reconstruction',{anchor:'middle',size:10,color:C.muted});
  const sample=()=>draw([mu[0]+sd*gauss(r),mu[1]+sd*gauss(r)]); draw(); sample();
  api.button('采样 / sample',sample); api.slider('σ',.1,1.5,.05,.6,v=>{sd=+v;draw();}); return none();
});

def('dl_gan','生成对抗网络','GAN','生成器 G 想骗过判别器 D，D 想分清真假。看两条 loss 互相拉扯，G 的分布逐渐盖住真实分布。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W*.55,H,[-4,4],[0,.7]),lx=d3.scaleLinear().domain([0,60]).range([W*.6,W-20]),ly=d3.scaleLinear().domain([0,1.6]).range([H-40,50]);
  const pdf=(m,s)=>x=>M.exp(-((x-m)**2)/(2*s*s))/(s*M.sqrt(2*M.PI)),xs=d3.range(-4,4.01,.1),real=pdf(1,.7);
  pathL(g,xs.map(x=>[ax.x(x),ax.y(real(x))]),C.gr,2.5); const fake=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',2.5),dl=g.append('path').attr('fill','none').attr('stroke',C.rd).attr('stroke-width',2),gl=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',2);
  K.label(svg,ax.x(-3.8),40,'真实分布','real',{size:11,color:C.gr}); K.label(svg,ax.x(-3.8),68,'生成分布','fake (G)',{size:11,color:api.color}); K.label(svg,W*.6,36,'loss 曲线','D red / G blue',{size:11});
  let t=0,m=-2,s=1.6; const hd=[],hg=[],T=ticker(),info=txt(g,W*.6,H-20,'',{mono:true,size:10,color:C.muted});
  T.every(200,()=>{ if(t>60){ t=0; m=-2; s=1.6; hd.length=0; hg.length=0; } m+=(1-m)*.08; s+=(.7-s)*.08; const gap=M.abs(m-1)+M.abs(s-.7),D=M.log(2)*(1-M.min(1,gap/3))+.15*M.sin(t*.7)+.05,G=.7+gap*.4+.1*M.cos(t*.7);
    hd.push([lx(t),ly(D)]); hg.push([lx(t),ly(G)]); fake.attr('d',d3.line()(xs.map(x=>[ax.x(x),ax.y(pdf(m,s)(x))]))); dl.attr('d',d3.line()(hd)); gl.attr('d',d3.line()(hg)); info.text(`step ${t}  D≈${D.toFixed(2)} G≈${G.toFixed(2)}`); t++; });
  return {stop:()=>T.stop()};
});

def('dl_loss','损失函数','Loss functions','真值固定，拖预测值看不同 loss 的形状：MSE 对离群点很敏感，Huber 远处变线性，交叉熵在错得离谱时爆炸。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[-3,3],[0,6]),y0=0;
  const F=[['MSE',C.cy,e=>e*e],['MAE',C.am,e=>M.abs(e)],['Huber δ=1',C.gr,e=>M.abs(e)<1?.5*e*e:M.abs(e)-.5],['BCE(y=1,p=σ(x))',C.rd,e=>-M.log(sig(e+2)+1e-9)]];
  F.forEach((f,i)=>{ pathL(g,d3.range(-3,3.01,.05).map(e=>[ax.x(e),ax.y(M.min(6,f[2](e)))]),f[1],2); K.label(svg,W-40,40+i*22,f[0],'',{anchor:'end',size:11,color:f[1]}); });
  const vl=ln(g,0,ax.y(0),0,ax.y(6),C.ink,1.5,{dash:'4 3'}),dg=g.append('g'),info=txt(g,W/2,20,'',{anchor:'middle',mono:true});
  const draw=e=>{ vl.attr('x1',ax.x(e)).attr('x2',ax.x(e)); dg.selectAll('*').remove(); F.forEach(f=>dot(dg,ax.x(e),ax.y(M.min(6,f[2](e))),5,f[1])); info.text(`误差 ŷ − y = ${e.toFixed(2)}   MSE=${(e*e).toFixed(2)}  MAE=${M.abs(e).toFixed(2)}  Huber=${F[2][2](e).toFixed(2)}`); };
  draw(1); api.slider('预测偏差 ŷ − y',-3,3,.05,1,v=>draw(+v)); return none();
});

/* ============ bm 生物医学 ============ */
def('bm_sequence','序列编码','Sequence encoding','DNA 序列先 one-hot（每碱基一列 4 行），再用 k-mer 滑窗切成词。拖滑杆看窗口走。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),seq='ATGCGTACGATTAGCC'.split(''),B='ACGT',n=seq.length,cs=M.min(34,(W-120)/n),x0=80,y0=50,cols={A:C.gr,C:C.cy,G:C.am,T:C.rd};
  seq.forEach((b,j)=>{ txt(g,x0+j*cs+cs/2,y0-12,b,{anchor:'middle',size:14,bold:true,mono:true,color:cols[b]}); B.split('').forEach((r,i)=>box(g,x0+j*cs,y0+i*cs,cs-2,cs-2,b===r?cols[b]:C.muted,{fo:b===r?.8:.08,rx:3,sw:.5})); });
  B.split('').forEach((r,i)=>txt(g,x0-10,y0+i*cs+cs/2+4,r,{anchor:'end',mono:true,size:12,color:cols[r]})); K.label(svg,x0-70,y0-12,'one-hot','4 × L',{size:11});
  const win=g.append('rect').attr('y',y0-30).attr('height',4*cs+32).attr('fill',api.color).attr('fill-opacity',.12).attr('stroke',api.color).attr('stroke-width',2).attr('rx',4),kg=g.append('g');
  let k=3,pos=0; const draw=()=>{ win.attr('x',x0+pos*cs-2).attr('width',k*cs+2); kg.selectAll('*').remove(); const mers=d3.range(n-k+1).map(i=>seq.slice(i,i+k).join(''));
    mers.forEach((m,i)=>{ const x=x0+(i%8)*(cs*2.3),y=y0+4*cs+30+M.floor(i/8)*22; txt(kg,x,y,m,{mono:true,size:11,color:i===pos?api.color:C.muted,bold:i===pos}); });
    K.label(kg,x0-70,y0+4*cs+30,`${k}-mer 词表`,`${mers.length} tokens`,{size:11}); };
  draw(); api.slider('窗口位置',0,n-3,1,0,v=>{pos=M.min(+v,n-k);draw();}); api.slider('k',2,5,1,3,v=>{k=+v;pos=M.min(pos,n-k);draw();}); return none();
});

def('bm_protein_embed','蛋白嵌入','Protein embedding','序列→语言模型→高维向量→降到 2D。相似功能的蛋白在嵌入空间聚在一起。点"嵌入"看它们飞到位。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(31),fam=[['激酶 kinase',C.cy,[W*.72,90]],['蛋白酶 protease',C.am,[W*.85,220]],['转运 transporter',C.gr,[W*.6,250]]],mk=K.arrow(svg,uid('p'),C.muted);
  const AA='ACDEFGHIKLMNPQRSTVWY',prot=d3.range(18).map(i=>({f:i%3,s:d3.range(8).map(()=>AA[M.floor(r()*20)]).join(''),y:30+i*(H-50)/18}));
  box(g,W*.33,H/2-40,70,80,C.vi,{fo:.2}); txt(g,W*.33+35,H/2-2,'ESM /',{anchor:'middle',size:11}); txt(g,W*.33+35,H/2+14,'ProtBERT',{anchor:'middle',size:10,mono:true});
  ln(g,W*.33+72,H/2,W*.5,H/2,C.muted,1.5,{arrow:mk}); txt(g,W*.42,H/2-8,'1280-d → 2D',{anchor:'middle',size:9,mono:true,color:C.muted});
  const rows=prot.map(p=>{ const t=txt(g,20,p.y,p.s,{mono:true,size:10,color:C.muted}); const c=dot(g,W*.31,p.y,4,C.muted); return {t,c}; });
  fam.forEach(f=>K.label(svg,f[2][0],f[2][1]-30,f[0],'',{anchor:'middle',size:11,color:f[1]}));
  let done=false; const embed=()=>{ rows.forEach((row,i)=>{ const f=fam[prot[i].f],tx=done?W*.31:f[2][0]+gauss(r)*22,ty=done?prot[i].y:f[2][1]+gauss(r)*22;
      row.c.transition().duration(900).delay(i*40).attr('cx',tx).attr('cy',ty).attr('r',done?4:6).attr('fill',done?C.muted:f[1]); row.t.transition().duration(500).attr('fill',done?C.muted:f[1]); }); done=!done; };
  embed(); api.button('嵌入 / embed ⇄ 还原',embed); return none();
});

def('bm_image_seg','图像分割','Segmentation','模型给每个像素一个概率，阈值一切就是掩膜。滑阈值看掩膜逐像素覆盖细胞。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),N=22,cs=M.min(13,(H-50)/N),x0=(W-N*cs)/2,y0=30,r=rnd(37);
  const cells=[[6,7,4],[15,6,3.5],[11,15,4.5],[17,16,2.5]],prob=d3.range(N).map(i=>d3.range(N).map(j=>{ let p=.05+r()*.15; cells.forEach(c=>{ const d=M.hypot(i-c[1],j-c[0]); p=M.max(p,sig((c[2]-d)*2.2)*(.85+r()*.15)); }); return M.min(1,p); }));
  prob.forEach((row,i)=>row.forEach((p,j)=>box(g,x0+j*cs,y0+i*cs,cs-1,cs-1,C.ink,{fo:.1+p*.5,rx:1,sw:0})));
  const mg=g.append('g'),info=txt(g,W/2,20,'',{anchor:'middle',mono:true});
  const draw=t=>{ mg.selectAll('*').remove(); let n=0; prob.forEach((row,i)=>row.forEach((p,j)=>{ if(p>=t){ n++; box(mg,x0+j*cs,y0+i*cs,cs-1,cs-1,api.color,{fo:.55,rx:1,sw:0}).attr('opacity',0).transition().delay((i+j)*8).attr('opacity',1); } }));
    info.text(`阈值 ${t.toFixed(2)}   掩膜像素 ${n} / ${N*N} = ${(100*n/N/N).toFixed(1)}%`); };
  draw(.5); api.slider('阈值 / threshold',.1,.95,.05,.5,v=>draw(+v)); K.label(svg,x0,H-6,'灰度 = 预测概率，彩色 = 掩膜','gray: p(cell), color: mask',{size:11,color:C.muted}); return none();
});

def('bm_flow_gating','流式设门','Flow gating','散点是细胞（CD4 vs CD8）。拖门框的角，实时统计框里占比。这就是设门。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[0,5],[0,5]),r=rnd(41);
  const pts=d3.range(400).map(i=>{ const k=i%4; return {x:[.8,3.6,.8,3.4][k]+gauss(r)*.45,y:[.8,.9,3.5,3.6][k]+gauss(r)*.45}; });
  const pg=g.selectAll('circle').data(pts).join('circle').attr('cx',p=>ax.x(p.x)).attr('cy',p=>ax.y(p.y)).attr('r',2.2).attr('fill',C.muted).attr('opacity',.7);
  const gate=g.append('rect').attr('fill',api.color).attr('fill-opacity',.1).attr('stroke',api.color).attr('stroke-width',2).attr('stroke-dasharray','6 3'),hg=g.append('g'),info=txt(g,W/2,20,'',{anchor:'middle',mono:true,size:13,color:api.color});
  let a=[2.5,2.5],b=[4.8,4.8]; K.label(svg,W-40,H-8,'CD8 →','',{anchor:'end',size:11}); K.label(svg,40,20,'CD4 ↑','',{size:11});
  const draw=()=>{ const x0=M.min(a[0],b[0]),x1=M.max(a[0],b[0]),y0=M.min(a[1],b[1]),y1=M.max(a[1],b[1]); gate.attr('x',ax.x(x0)).attr('y',ax.y(y1)).attr('width',ax.x(x1)-ax.x(x0)).attr('height',ax.y(y0)-ax.y(y1));
    let n=0; pg.attr('fill',p=>{ const i=p.x>=x0&&p.x<=x1&&p.y>=y0&&p.y<=y1; if(i) n++; return i?api.color:C.muted; }); info.text(`门内 ${n} / ${pts.length} = ${(100*n/pts.length).toFixed(1)}%`); };
  handle(svg,hg,ax.x(a[0]),ax.y(a[1]),C.am,(mx,my)=>{ a=[ax.x.invert(mx),ax.y.invert(my)]; hg.selectAll('circle').filter((d,i)=>i===0).attr('cx',mx).attr('cy',my); draw(); });
  handle(svg,hg,ax.x(b[0]),ax.y(b[1]),C.am,(mx,my)=>{ b=[ax.x.invert(mx),ax.y.invert(my)]; hg.selectAll('circle').filter((d,i)=>i===1).attr('cx',mx).attr('cy',my); draw(); });
  draw(); return none();
});

def('bm_dose_response','剂量效应','Dose-response 4PL','y = d + (a−d)/(1+(x/EC50)^h)。拖 EC50 和 Hill 系数 h，看 S 曲线在对数轴上平移、变陡。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(43),lx=d3.scaleLog().domain([.01,1000]).range([50,W-30]),ly=d3.scaleLinear().domain([0,110]).range([H-40,30]);
  g.append('g').attr('transform',`translate(0,${H-40})`).call(d3.axisBottom(lx).ticks(5,'~g')).call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10)).call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  g.append('g').attr('transform','translate(50,0)').call(d3.axisLeft(ly).ticks(5)).call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10)).call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  const doses=[.01,.03,.1,.3,1,3,10,30,100,300,1000],pl=(x,e,h)=>100/(1+M.pow(x/e,-h))*-1+100,obs=doses.map(x=>100-100/(1+M.pow(x/3,-1.2))+gauss(r)*5);
  g.selectAll('circle').data(doses).join('circle').attr('cx',x=>lx(x)).attr('cy',(x,i)=>ly(M.max(0,obs[i]))).attr('r',4.5).attr('fill',C.am);
  const cur=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',2.5),vl=ln(g,0,ly(0),0,ly(100),C.gr,1.5,{dash:'5 4'}),info=txt(g,W/2,20,'',{anchor:'middle',mono:true});
  let e=3,h=1.2; const draw=()=>{ const xs=d3.range(-2,3.01,.05).map(v=>M.pow(10,v)); cur.attr('d',d3.line()(xs.map(x=>[lx(x),ly(100-100/(1+M.pow(x/e,-h)))]))); vl.attr('x1',lx(e)).attr('x2',lx(e));
    const sse=d3.sum(doses,(x,i)=>(obs[i]-(100-100/(1+M.pow(x/e,-h))))**2); info.text(`EC50 = ${K.fmt(e,2)}   Hill h = ${h.toFixed(1)}   SSE = ${sse.toFixed(0)}`); };
  draw(); api.slider('log10 EC50',-1.5,2.5,.05,M.log10(3),v=>{e=M.pow(10,+v);draw();}); api.slider('Hill h',.3,4,.1,1.2,v=>{h=+v;draw();});
  K.label(svg,W-30,H-8,'剂量 (log)','dose',{anchor:'end',size:11}); K.label(svg,54,26,'抑制 %','response',{size:11}); return none();
});

def('bm_survival','生存曲线','Kaplan-Meier','每发生一次事件，曲线就掉一格：S(t) = ∏(1 − d_i/n_i)。删失只画小竖线不掉。点"下一事件"。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(47),ax=K.axes(svg,W,H,[0,24],[0,1.05]);
  const mk=(n,scale)=>d3.range(n).map(()=>({t:M.min(24,-M.log(r())*scale),e:r()<.75})).sort((a,b)=>a.t-b.t);
  const arms=[{n:'治疗 treatment',c:api.color,d:mk(30,18)},{n:'对照 control',c:C.rd,d:mk(30,9)}];
  arms.forEach((a,i)=>{ a.path=g.append('path').attr('fill','none').attr('stroke',a.c).attr('stroke-width',2.5); a.cg=g.append('g'); K.label(svg,W-40,40+i*24,a.n,'',{anchor:'end',size:11,color:a.c}); });
  let k=0; const draw=()=>{ arms.forEach(a=>{ let s=1,n=a.d.length,pts=[[ax.x(0),ax.y(1)]]; a.cg.selectAll('*').remove();
      a.d.slice(0,k).forEach(ev=>{ if(ev.e){ s*=(1-1/n); pts.push([ax.x(ev.t),pts[pts.length-1][1]],[ax.x(ev.t),ax.y(s)]); } else ln(a.cg,ax.x(ev.t),ax.y(s)-6,ax.x(ev.t),ax.y(s)+6,a.c,1.5); n--; });
      pts.push([ax.x(k<a.d.length?a.d[M.min(k,a.d.length-1)].t:24),pts[pts.length-1][1]]); a.path.attr('d',d3.line()(pts)); }); };
  draw(); api.button('下一事件 / next',()=>{ k=M.min(k+1,30); draw(); }); const T=ticker(); api.button('播放 / play',()=>{ k=0; T.stop(); T.every(250,()=>{ k++; draw(); if(k>=30) T.stop(); }); });
  K.label(svg,W-40,H-8,'月 months','',{anchor:'end',size:11}); K.label(svg,44,24,'S(t) 生存率','survival',{size:11}); return {stop:()=>T.stop()};
});

def('bm_pk_ode','药代动力学','PK one-compartment','一室模型：dC/dt = −k·C，k = ln2/t½。口服有吸收相先升后降。拖剂量和半衰期看曲线。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[0,48],[0,12]);
  const cur=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',2.5),mic=ln(g,ax.x(0),ax.y(2),ax.x(48),ax.y(2),C.rd,1.2,{dash:'5 4'}),info=txt(g,W/2,20,'',{anchor:'middle',mono:true}),ag=g.append('g');
  K.label(svg,ax.x(46),ax.y(2)-6,'最低有效浓度 MEC','',{anchor:'end',size:10,color:C.rd});
  let D=8,th=6,ka=1.2; const draw=()=>{ const ke=M.LN2/th,V=1,pts=[]; let A=D,Cc=0,above=0; for(let t=0;t<=48;t+=.1){ pts.push([t,Cc]); const dA=-ka*A,dC=ka*A/V-ke*Cc; A+=dA*.1; Cc+=dC*.1; if(Cc>2) above+=.1; }
    cur.attr('d',d3.line()(pts.map(p=>[ax.x(p[0]),ax.y(M.min(12,p[1]))]))); ag.selectAll('*').remove(); ag.append('path').attr('d',d3.area().x(p=>ax.x(p[0])).y0(ax.y(0)).y1(p=>ax.y(M.min(12,p[1])))(pts)).attr('fill',api.color).attr('fill-opacity',.12);
    const mx=d3.max(pts,p=>p[1]),auc=d3.sum(pts,p=>p[1])*.1; info.text(`剂量 ${D}  t½ ${th}h  Cmax ${mx.toFixed(2)}  AUC ${auc.toFixed(1)}  高于 MEC ${above.toFixed(1)}h`); };
  draw(); api.slider('剂量 dose',1,20,1,8,v=>{D=+v;draw();}); api.slider('半衰期 t½ (h)',1,24,.5,6,v=>{th=+v;draw();}); api.slider('吸收 ka',.2,3,.1,1.2,v=>{ka=+v;draw();});
  K.label(svg,W-40,H-8,'小时 h','time',{anchor:'end',size:11}); K.label(svg,44,24,'血药浓度 C','concentration',{size:11}); return none();
});

def('bm_cell_cluster','单细胞聚类','scRNA clusters','UMAP 把每个细胞压成 2D 一个点，相似表达的挤成岛。滑杆切换按"簇"还是按"某基因表达"着色。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(53),cols=[C.cy,C.am,C.gr,C.vi,C.rd],names=['T cell','B cell','Monocyte','NK','Dendritic'];
  const cen=[[W*.25,H*.35],[W*.6,H*.3],[W*.75,H*.7],[W*.4,H*.72],[W*.5,H*.5]],cells=d3.range(500).map(i=>{ const k=i%5,a=r()*2*M.PI,d=M.abs(gauss(r))*(35+k*6); return {k,x:cen[k][0]+M.cos(a)*d*1.4,y:cen[k][1]+M.sin(a)*d,gene:[.9,.1,.3,.7,.2][k]+r()*.25}; });
  const pg=g.selectAll('circle').data(cells).join('circle').attr('cx',c=>c.x).attr('cy',c=>c.y).attr('r',3).attr('opacity',.85),lg=g.append('g');
  const seq=d3.scaleSequential(t=>d3.interpolateRgb(C.muted,api.color)(t)).domain([0,1.1]),modes=['按簇 cluster','CD3E 表达','CD19 表达','CD14 表达'],genes=[null,[.9,.1,.2,.6,.1],[.05,.95,.1,.05,.2],[.05,.1,.95,.05,.5]];
  const draw=m=>{ lg.selectAll('*').remove(); if(m===0){ pg.transition().duration(500).attr('fill',c=>cols[c.k]); cen.forEach((c,i)=>txt(lg,c[0],c[1]-45,names[i],{anchor:'middle',size:12,bold:true,color:cols[i]})); }
    else { const gv=genes[m]; pg.transition().duration(500).attr('fill',c=>seq(gv[c.k]+(c.gene-.5)*.3)); d3.range(11).forEach(i=>box(lg,W-140+i*10,H-30,10,10,seq(i/10),{fo:1,rx:0,sw:0})); txt(lg,W-140,H-36,'低',{size:10,color:C.muted}); txt(lg,W-30,H-36,'高 expression',{size:10,color:C.muted,anchor:'end'}); }
    K.label(lg,20,24,modes[m],'',{size:13,color:api.color}); };
  draw(0); api.slider('着色 / color by',0,3,1,0,v=>draw(+v)); K.label(svg,20,H-8,'UMAP 1 →','',{size:10,color:C.muted}); return none();
});

})();
