/* anim/code_c.js — 代码宇宙 pt / si / ex / gm / lm 动画（52 key）
   只依赖 d3 v7（全局 d3）+ K（anim/_kit.js）。key = node.id 把 '.' 换 '_'。 */
(()=>{
window.ANIM = window.ANIM || {};
const A=window.ANIM, C=K.C, M=Math;

/* ============ 共享小函数 ============ */
const none=()=>({stop(){}});
const txt=(sel,x,y,s,o={})=>sel.append('text').attr('x',x).attr('y',y).text(s)
  .attr('fill',o.color||C.ink).attr('font-size',o.size||12).attr('text-anchor',o.anchor||'start')
  .attr('font-family',o.mono?'ui-monospace,Menlo,monospace':null).attr('font-weight',o.bold?600:null);
const ln=(sel,x1,y1,x2,y2,color,w=2,o={})=>sel.append('line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
  .attr('stroke',color).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null).attr('marker-end',o.arrow||null).attr('opacity',o.op==null?1:o.op);
const dot=(sel,x,y,r,color)=>sel.append('circle').attr('cx',x).attr('cy',y).attr('r',r).attr('fill',color);
const box=(sel,x,y,w,h,color,o={})=>sel.append('rect').attr('x',x).attr('y',y).attr('width',M.max(0,w)).attr('height',M.max(0,h)).attr('rx',o.rx==null?6:o.rx)
  .attr('fill',color).attr('fill-opacity',o.fo==null?.18:o.fo).attr('stroke',o.stroke||color).attr('stroke-width',o.sw==null?1.5:o.sw);
const rnd=seed=>{ let s=seed||1; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; };
const gauss=r=>{ const u=r()||1e-9,v=r(); return M.sqrt(-2*M.log(u))*M.cos(2*M.PI*v); };
const pathL=(g,pts,color,w=2,o={})=>g.append('path').attr('d',d3.line().x(p=>p[0]).y(p=>p[1])(pts)).attr('fill','none')
  .attr('stroke',color).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null).attr('opacity',o.op==null?1:o.op);
const areaL=(g,pts,y0,color,op=.25)=>g.append('path').attr('d',d3.area().x(p=>p[0]).y0(y0).y1(p=>p[1])(pts)).attr('fill',color).attr('opacity',op);
const ticker=()=>{ const ts=[]; return { every(ms,fn){ const t=setInterval(fn,ms); ts.push(t); return t; }, stop(){ ts.forEach(clearInterval); } }; };
const def=(key,title,en,cap,make)=>{ A[key]={title,en,cap,make}; };
const npdf=(x,m,s)=>M.exp(-((x-m)**2)/(2*s*s))/(s*M.sqrt(2*M.PI));
/* 正态累积（Abramowitz-Stegun） */
const ncdf=z=>{ const t=1/(1+.2316419*M.abs(z)),d=.3989423*M.exp(-z*z/2);
  let p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return z>0?1-p:p; };
/* 直方图：给一堆数，画柱 */
const hist=(g,vals,x,y0,hMax,color,bins=26)=>{
  g.selectAll('rect.hb').remove(); if(!vals.length) return;
  const b=d3.bin().domain(x.domain()).thresholds(bins)(vals),mx=d3.max(b,d=>d.length)||1;
  g.selectAll('rect.hb').data(b).join('rect').attr('class','hb')
    .attr('x',d=>x(d.x0)).attr('width',d=>M.max(1,x(d.x1)-x(d.x0)-1))
    .attr('y',d=>y0-hMax*d.length/mx).attr('height',d=>hMax*d.length/mx)
    .attr('fill',color).attr('fill-opacity',.55).attr('stroke',color).attr('stroke-width',.5); };
const softmax=(zs,T)=>{ const m=d3.max(zs),e=zs.map(z=>M.exp((z-m)/T)),s=d3.sum(e); return e.map(v=>v/s); };
const chip=(g,x,y,w,h,s,color,o={})=>{ const gg=g.append('g'); box(gg,x,y,w,h,color,{fo:o.fo==null?.22:o.fo,rx:o.rx==null?5:o.rx});
  txt(gg,x+w/2,y+h/2+4,s,{anchor:'middle',size:o.size||11,mono:true,color:o.tc||C.ink}); return gg; };

/* ============ pt PyTorch ============ */
def('pt_tensor','张量三标签','Tensor = data+device+grad','ndarray 只有数据；tensor 多贴三张标签：形状、住哪块卡、要不要记账。点标签切换，看报错怎么来。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let dev='cpu',rg=false,dt='float32';
  const bx=W/2-110,by=90; const bg=g.append('g'),tg=g.append('g'),eg=g.append('g');
  const draw=()=>{ bg.selectAll('*').remove(); tg.selectAll('*').remove(); eg.selectAll('*').remove();
    box(bg,bx,by,220,120,api.color,{fo:.14,rx:10});
    for(let i=0;i<3;i++)for(let j=0;j<4;j++) box(bg,bx+18+j*50,by+22+i*32,40,24,api.color,{fo:.3,rx:3});
    txt(bg,bx+110,by+150,'shape (3,4)',{anchor:'middle',mono:true,color:C.muted});
    const tags=[['形状 shape','(3,4)',C.cy],['设备 device',dev,dev==='cpu'?C.am:C.gr],['记账 requires_grad',rg?'True':'False',rg?C.vi:C.muted],['类型 dtype',dt,C.ink2]];
    tags.forEach((t,i)=>{ const x=40,y=40+i*58; chip(tg,x,y,150,26,t[0],t[2],{size:10}); chip(tg,x+156,y,86,26,t[1],t[2],{fo:.4}); });
    ln(tg,196,66,bx,by+30,C.hair,1); ln(tg,196,124,bx,by+60,C.hair,1); ln(tg,196,182,bx,by+90,C.hair,1);
    const msg = dev==='cuda' ? 'a.cpu() + b.cuda() → RuntimeError: 设备不同' : rg ? 'a.numpy() → RuntimeError: 先 .detach()' : '一切正常：它此刻就是个 ndarray';
    txt(eg,W/2,H-16,msg,{anchor:'middle',mono:true,size:11,color:(dev==='cuda'||rg)?C.rd:C.gr}); };
  draw();
  api.button('切设备 / device',()=>{dev=dev==='cpu'?'cuda':'cpu';draw();});
  api.button('切 requires_grad',()=>{rg=!rg;draw();});
  api.button('切 dtype',()=>{dt=dt==='float32'?'float16':dt==='float16'?'int64':'float32';draw();});
  return none();
});

def('pt_autograd','前向建图，后向流梯度','Autograd graph','前向每步记一笔账（灰线），backward 从 loss 出发顺线倒流（紫色）。点播放看一遍。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const N=[{id:'x',x:.1,y:.72,l:'x'},{id:'w',x:.1,y:.28,l:'w'},{id:'u',x:.4,y:.5,l:'u = w·x'},
           {id:'y',x:.66,y:.5,l:'y = u + b'},{id:'L',x:.9,y:.5,l:'L = (y−t)²'}];
  const E=[['x','u'],['w','u'],['u','y'],['y','L']];
  const P=id=>{const n=N.find(d=>d.id===id);return [60+n.x*(W-120),40+n.y*(H-110)];};
  const am=K.arrow(svg,'aag',C.muted),av=K.arrow(svg,'aag2',C.vi);
  const eg=g.append('g'),ng=g.append('g'),fg=g.append('g'),info=txt(g,W/2,20,'',{anchor:'middle',mono:true});
  E.forEach(e=>{const a=P(e[0]),b=P(e[1]);ln(eg,a[0],a[1],b[0],b[1],C.muted,1.6,{arrow:am,op:.5});});
  N.forEach(n=>{const p=P(n.id);const c=n.id==='L'?C.am:api.color;box(ng,p[0]-46,p[1]-17,92,34,c,{fo:.2,rx:8});txt(ng,p[0],p[1]+5,n.l,{anchor:'middle',mono:true,size:11});});
  const order=['x','w','u','y','L'],back=['L','y','u','w','x'];
  const grads={L:'1',y:'2(y−t)',u:'∂L/∂y',w:'∂L/∂u · x',x:'∂L/∂u · w'};
  let k=0,phase=0;
  const step=()=>{ fg.selectAll('*').remove();
    if(phase===0){ info.text('前向 forward：算值，同时记下每步来自谁');
      order.slice(0,k+1).forEach(id=>{const p=P(id);fg.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',26).attr('fill','none').attr('stroke',C.cy).attr('stroke-width',2);});
      k++; if(k>=order.length){k=0;phase=1;} }
    else { info.text('反向 backward：沿同一条线倒着乘链式法则');
      back.slice(0,k+1).forEach(id=>{const p=P(id);fg.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',26).attr('fill','none').attr('stroke',C.vi).attr('stroke-width',2.5);
        txt(fg,p[0],p[1]-26,'grad '+grads[id],{anchor:'middle',size:10,mono:true,color:C.vi});});
      E.forEach(e=>{const i=back.indexOf(e[1]);if(i>=0&&i<=k){const a=P(e[0]),b=P(e[1]);ln(fg,b[0],b[1],a[0],a[1],C.vi,2,{arrow:av});}});
      k++; if(k>=back.length){k=0;phase=0;} } };
  step(); T.every(900,step);
  K.label(svg,12,H-10,'灰=前向建图  紫=梯度倒流','grey build, violet backward',{size:11,color:C.muted});
  return {stop:()=>T.stop()};
});

def('pt_requires_grad','梯度流到哪里停','requires_grad & detach','把某一段涂灰（关掉记账 / detach），梯度就流不过去。点开关看梯度倒流在哪断掉。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const L=['输入 x','编码器 enc','中间 h','头部 head','损失 L'],n=L.length;
  const X=i=>60+i*(W-120)/(n-1),Y=H/2-10;
  let cut=1; /* 0=全通 1=enc冻结 2=detach h */
  const eg=g.append('g'),ng=g.append('g'),fg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const frozen=i=> cut===1? i<=1 : cut===2? i<=2 : false;
  const draw=()=>{ eg.selectAll('*').remove(); ng.selectAll('*').remove();
    for(let i=0;i<n-1;i++) ln(eg,X(i)+42,Y,X(i+1)-42,Y,C.muted,1.6,{op:.5});
    L.forEach((s,i)=>{ const c=frozen(i)?C.muted:api.color; box(ng,X(i)-42,Y-18,84,36,c,{fo:frozen(i)?.08:.22,rx:8});
      txt(ng,X(i),Y+5,s,{anchor:'middle',size:11,color:frozen(i)?C.muted:C.ink}); });
    if(cut===2){ ln(ng,X(2)+21,Y-30,X(2)+21,Y+30,C.rd,2.5,{dash:'4 3'}); txt(ng,X(2)+24,Y-36,'detach 剪断',{size:10,color:C.rd,mono:true}); }
    info.text(cut===0?'全部 requires_grad=True：梯度一路流回 x':cut===1?'enc 冻结：梯度只更新 head':'h.detach()：梯度到此为止，前面一步不更新'); };
  let t=0; T.every(420,()=>{ fg.selectAll('*').remove(); const stop=cut===0?0:cut===1?2:3;
    const seq=[]; for(let i=n-1;i>=stop;i--) seq.push(i); const k=t%(seq.length+3);
    seq.slice(0,k).forEach(i=>{ dot(fg,X(i),Y+30,5,C.vi); });
    if(k>0&&k<=seq.length){ const i=seq[k-1]; if(i>stop) ln(fg,X(i)-42,Y+30,X(i-1)+42,Y+30,C.vi,2.5); }
    if(k>seq.length) txt(fg,X(stop)-70,Y+62,'梯度到此为止 gradient stops',{size:10,color:C.rd,mono:true});
    t++; });
  draw(); api.button('全部可训练',()=>{cut=0;draw();}); api.button('冻结 encoder',()=>{cut=1;draw();}); api.button('h.detach()',()=>{cut=2;draw();});
  return {stop:()=>T.stop()};
});

def('pt_module','Module 是参数登记处','nn.Module registry','盒子套盒子。只有注册进 Module 的张量才会出现在 parameters() 里，也才被优化器看见。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const tree=[{n:'Net',d:0,p:''},{n:'enc.fc1',d:1,p:'weight (64,8)'},{n:'enc.fc1',d:1,p:'bias (64)'},
    {n:'enc.bn',d:1,p:'weight (64)'},{n:'head.fc2',d:1,p:'weight (2,64)'},{n:'head.fc2',d:1,p:'bias (2)'}];
  let listed=false,ok=true;
  const lg=g.append('g'),rg=g.append('g'),info=txt(g,W/2,H-16,'',{anchor:'middle',mono:true,size:11});
  const draw=()=>{ lg.selectAll('*').remove(); rg.selectAll('*').remove();
    box(lg,30,50,W*.42,H-110,api.color,{fo:.06,rx:10}); txt(lg,44,74,'Net(nn.Module)',{mono:true,bold:true});
    tree.slice(1).forEach((t,i)=>{ const bad=!ok&&i===4; chip(lg,58,90+i*38,W*.42-56,28,t.n+' · '+t.p,bad?C.rd:api.color,{size:10}); });
    if(!ok) txt(lg,58,90+4*38+46,'← 这个写成了裸 tensor，没注册',{size:10,color:C.rd});
    txt(rg,W*.55,74,'parameters() 摊平后',{mono:true,bold:true});
    const items=ok?tree.slice(1):tree.slice(1).filter((_,i)=>i!==4);
    if(listed) items.forEach((t,i)=>{ const c=chip(rg,W*.55,90+i*38,W*.38,28,t.p,C.gr,{size:10});
      c.attr('opacity',0).transition().delay(i*140).attr('opacity',1); });
    info.text(listed?`优化器收到 ${items.length} 组参数${ok?'':'（少了一组：它永远学不动）'}`:'点"摊平 parameters()"'); };
  draw(); api.button('摊平 parameters()',()=>{listed=true;draw();});
  api.button('制造漏网参数',()=>{ok=!ok;listed=true;draw();});
  return {stop:()=>T.stop()};
});

def('pt_optimizer','不清零就累加','zero_grad','梯度是往账本里加，不是覆盖。关掉 zero_grad，看有效步长一轮比一轮大，直接飞出去。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker(),f=x=>.5*x*x;
  const ax=K.axes(svg,W,H,[-6,6],[0,14]);
  pathL(g,d3.range(-6,6.01,.1).map(x=>[ax.x(x),ax.y(M.min(14,f(x)))],C.muted),C.muted,2);
  const trail=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',1.6).attr('opacity',.8);
  const ball=dot(g,0,0,8,api.color),info=txt(g,W/2,20,'',{anchor:'middle',mono:true}),led=g.append('g');
  let zero=true,x=2.5,acc=0,pts=[],k=0;
  const reset=()=>{x=2.5;acc=0;pts=[[ax.x(x),ax.y(f(x))]];k=0;};
  reset();
  T.every(420,()=>{ if(zero) acc=0; acc+=x; x=x-.25*acc; k++;
    if(M.abs(x)>7||k>40) reset();
    const cx=ax.x(M.max(-6,M.min(6,x))),cy=ax.y(M.min(14,f(x)));
    pts.push([cx,cy]); trail.attr('d',d3.line()(pts)); ball.attr('cx',cx).attr('cy',cy).attr('fill',M.abs(x)>5?C.rd:api.color);
    led.selectAll('*').remove();
    box(led,W-190,42,170,54,zero?C.gr:C.rd,{fo:.14});
    txt(led,W-105,64,zero?'zero_grad() ✓':'忘了 zero_grad ✗',{anchor:'middle',size:11,bold:true,color:zero?C.gr:C.rd});
    txt(led,W-105,84,'账本 grad = '+K.fmt(acc,2),{anchor:'middle',size:10,mono:true,color:C.muted});
    info.text(`step ${k}   x = ${K.fmt(x,3)}`); });
  api.button('切换 zero_grad',()=>{zero=!zero;reset();}); api.button('重来 / reset',reset);
  K.label(svg,12,20,'损失 L(x)=x²/2','loss',{size:11});
  return {stop:()=>T.stop()};
});

def('pt_dataloader','collate 把一堆拼成一箱','DataLoader & collate','Dataset 一次给一条，collate 把 batch 条码成一个张量。长度不齐就必须 padding，否则堆不起来。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const r=rnd(21),lens=d3.range(4).map(()=>3+M.floor(r()*5));
  let pad=false,t=0;
  const lg=g.append('g'),bg=g.append('g'),info=txt(g,W/2,H-16,'',{anchor:'middle',mono:true,size:11});
  const draw=()=>{ lg.selectAll('*').remove(); bg.selectAll('*').remove();
    txt(lg,30,40,'Dataset → 一条一条',{mono:true,color:C.muted,size:11});
    lens.forEach((L,i)=>{ for(let j=0;j<L;j++) box(lg,30+j*26,54+i*36,22,24,api.color,{fo:.3,rx:3}); });
    const mx=d3.max(lens); txt(bg,W*.52,40,'collate → 一个张量',{mono:true,color:C.muted,size:11});
    lens.forEach((L,i)=>{ for(let j=0;j<mx;j++){ const inb=j<L;
      if(inb||pad) box(bg,W*.52+j*26,54+i*36,22,24,inb?api.color:C.muted,{fo:inb?.3:.12,rx:3}); } });
    if(pad){ box(bg,W*.52-4,50,mx*26+2,lens.length*36,C.gr,{fo:0,stroke:C.gr,sw:1.5,rx:6});
      txt(bg,W*.52,54+lens.length*36+22,`batch tensor (4, ${mx})`,{mono:true,size:11,color:C.gr}); }
    else txt(bg,W*.52,54+lens.length*36+22,'长度不齐 → stack 报错',{mono:true,size:11,color:C.rd});
    info.text(pad?'padding 补齐后才能 stack；配 mask 告诉模型哪些是补的':'点"补齐 padding"'); };
  draw(); T.every(700,()=>{ t++; lg.selectAll('rect').attr('fill-opacity',(d,i)=>.2+.18*((i+t)%3===0?1:0)); });
  api.button('补齐 padding',()=>{pad=!pad;draw();});
  return {stop:()=>T.stop()};
});

def('pt_train_eval','两个开关，两套行为','train / eval mode','只有 Dropout 和 BatchNorm 看这个开关。train 随机灭灯、BN 用当前批；eval 灯全亮、BN 用滑动平均。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker(),r=rnd(33);
  let mode='train';
  const dg=g.append('g'),bg=g.append('g'),hd=g.append('g');
  const draw=()=>{ hd.selectAll('*').remove();
    chip(hd,W/2-90,16,180,30,mode==='train'?'model.train()':'model.eval()',mode==='train'?C.am:C.gr,{fo:.3,size:13});
    txt(hd,W/2,H-14,mode==='train'?'训练：dropout 随机灭 · BN 用这批的均值方差':'推理：dropout 全开 · BN 用累积的滑动平均',
      {anchor:'middle',mono:true,size:11,color:mode==='train'?C.am:C.gr}); };
  txt(g,40,72,'Dropout p=0.4',{mono:true,size:11,color:C.muted});
  txt(g,W*.55,72,'BatchNorm 统计来源',{mono:true,size:11,color:C.muted});
  const cells=d3.range(20);
  T.every(500,()=>{ dg.selectAll('*').remove(); bg.selectAll('*').remove();
    cells.forEach(i=>{ const off = mode==='train' && r()<.4;
      box(dg,40+(i%5)*40,86+M.floor(i/5)*40,32,32,off?C.muted:api.color,{fo:off?.08:.45,rx:5}); });
    const bx=W*.55,cur=[.9+gauss(r)*.35,1.1+gauss(r)*.35],run=[1.0,1.0];
    const v=mode==='train'?cur:run;
    ['均值 mean','方差 var'].forEach((s,i)=>{ txt(bg,bx,110+i*70,s,{size:11,color:C.muted});
      box(bg,bx,118+i*70,M.min(W-bx-30,60+v[i]*90),26,mode==='train'?C.am:C.gr,{fo:.35});
      txt(bg,bx+8,136+i*70,K.fmt(v[i],3),{size:11,mono:true}); });
    txt(bg,bx,H-46,mode==='train'?'每批都在抖 → 小 batch 时不稳':'固定不抖 → 结果可复现',{size:10,color:C.muted,mono:true}); });
  draw(); api.button('切换 train / eval',()=>{mode=mode==='train'?'eval':'train';draw();});
  return {stop:()=>T.stop()};
});

def('pt_device','显存四层货架','GPU memory','参数、梯度、优化器状态高度固定；激活随 batch 和序列长度膨胀。拖滑杆看谁先撑爆。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let B=8,S=512,P=100; /* 参数 100M */
  const CAP=24000; /* MB */
  const bx=W*.36,bw=W*.3,y0=H-50,hMax=H-100;
  const bar=g.append('g'),info=g.append('g');
  const draw=()=>{ bar.selectAll('*').remove(); info.selectAll('*').remove();
    const par=P*2*2, grad=P*2*2, opt=P*2*8, act=B*S*P*0.00028*1000;
    const parts=[['参数 params',par,C.cy],['梯度 grads',grad,C.vi],['优化器 optim',opt,C.am],['激活 activations',act,api.color]];
    const tot=d3.sum(parts,p=>p[1]),sc=hMax/CAP; let y=y0;
    parts.forEach(p=>{ const h=p[1]*sc; box(bar,bx,y-h,bw,h,p[2],{fo:.42,rx:2}); y-=h; });
    ln(bar,bx-24,y0-CAP*sc,bx+bw+24,y0-CAP*sc,C.rd,2,{dash:'6 4'});
    txt(bar,bx+bw+28,y0-CAP*sc+4,'24GB 上限',{size:10,color:C.rd,mono:true});
    ln(bar,bx,y0,bx+bw,y0,C.hair,1);
    let ly=70; parts.forEach(p=>{ box(info,30,ly-10,14,14,p[2],{fo:.5,rx:2});
      txt(info,50,ly+2,`${p[0]}  ${(p[1]/1024).toFixed(2)} GB`,{size:11,mono:true}); ly+=26; });
    txt(info,30,ly+14,`合计 ${(tot/1024).toFixed(2)} GB`,{size:12,bold:true,color:tot>CAP?C.rd:C.gr});
    if(tot>CAP) txt(info,30,ly+36,'CUDA out of memory：先砍 batch',{size:11,color:C.rd,mono:true}); };
  draw();
  api.slider('batch size',1,64,1,8,v=>{B=+v;draw();});
  api.slider('序列长度 seq len',128,4096,128,512,v=>{S=+v;draw();});
  api.slider('参数量 (M)',10,1000,10,100,v=>{P=+v;draw();});
  return none();
});

def('pt_save_load','state_dict 按名字对号入座','Save & load','存的是一本字典：键=层路径，值=权重方块。改了层名或结构，加载就对不上号。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const keys=['enc.fc1.weight','enc.fc1.bias','enc.bn.weight','head.fc2.weight','head.fc2.bias'];
  let renamed=false,k=0;
  const lg=g.append('g'),rg=g.append('g'),mg=g.append('g'),info=txt(g,W/2,H-14,'',{anchor:'middle',mono:true,size:11});
  const cur=()=>renamed?keys.map((s,i)=>i===3?'fc_out.weight':s):keys;
  const draw=()=>{ lg.selectAll('*').remove(); rg.selectAll('*').remove(); mg.selectAll('*').remove();
    txt(lg,26,40,'checkpoint.pt 里的 state_dict',{mono:true,size:11,color:C.muted});
    keys.forEach((s,i)=>chip(lg,26,54+i*44,W*.36,32,s,C.am,{size:10}));
    txt(rg,W*.56,40,'当前模型的槽位',{mono:true,size:11,color:C.muted});
    cur().forEach((s,i)=>chip(rg,W*.56,54+i*44,W*.36,32,s,s===keys[i]?api.color:C.rd,{size:10}));
    let bad=0; keys.forEach((s,i)=>{ const ok=s===cur()[i]; if(!ok)bad++;
      if(i<k) ln(mg,26+W*.36,70+i*44,W*.56,70+i*44,ok?C.gr:C.rd,2,{dash:ok?null:'4 3'}); });
    info.text(k<keys.length?'逐条对号入座…':bad?`Missing key: ${keys[3]} —— 名字变了就装不进去`:'全部匹配：load_state_dict 成功'); };
  draw(); T.every(600,()=>{ k=(k+1)%(keys.length+3); draw(); });
  api.button('改一个层名',()=>{renamed=!renamed;k=0;draw();});
  return {stop:()=>T.stop()};
});

def('pt_amp','半精度算，单精度记账','Mixed precision','fp16 的下限约 6e-8，小梯度直接被抹成 0。loss 先放大再缩回，把它们抬回可表示区间。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(77);
  const grads=d3.range(28).map(()=>M.pow(10,-9+r()*7));
  const x=d3.scaleLog().domain([1e-11,1e-1]).range([70,W-40]);
  const ax=g.append('g').attr('transform',`translate(0,${H-70})`).call(d3.axisBottom(x).ticks(6,'.0e'))
    .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10))
    .call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  let S=1;
  const dg=g.append('g'),info=txt(g,W/2,26,'',{anchor:'middle',mono:true});
  const LIM=6e-8;
  const draw=()=>{ dg.selectAll('*').remove();
    ln(dg,x(LIM),50,x(LIM),H-70,C.rd,2,{dash:'5 4'});
    txt(dg,x(LIM)+6,64,'fp16 下限 6e-8',{size:10,color:C.rd,mono:true});
    let dead=0;
    grads.forEach((v,i)=>{ const sv=v*S,y=90+(i%14)*((H-190)/14),xx=x(M.min(1e-1,M.max(1e-11,sv))),under=sv<LIM;
      if(under)dead++; dot(dg,xx,y,4.5,under?C.rd:api.color).attr('opacity',under?.6:1);
      if(S>1) ln(dg,x(v),y,xx,y,C.gr,1,{op:.35}); });
    txt(dg,70,H-40,`loss scale = ${S}×   被抹成 0 的梯度：${dead}/${grads.length}`,{size:11,mono:true,color:dead?C.rd:C.gr});
    info.text(dead?'小梯度落进红线左边 → 变 0 → 这些参数不更新':'全部落在可表示区间，反缩放后用 fp32 更新'); };
  draw(); api.slider('loss scale 放大倍数',1,65536,1,1,v=>{S=M.pow(2,M.round(M.log2(+v)));draw();});
  K.label(svg,12,H-14,'左=数值太小 右=安全','left = underflow',{size:11,color:C.muted});
  return none();
});

def('pt_debug_shape','三个筛子过一遍','Shape / device / dtype','九成报错只有三种。按顺序过筛：形状 → 设备 → 类型。点"抛个错"随机来一个，看它卡在哪一层。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(101),T=ticker();
  const S=[{n:'形状 shape',e:'mat1 and mat2 shapes cannot be multiplied (32x64 and 128x10)',fix:'print(a.shape, b.shape) → 对齐最后两维',c:C.cy},
           {n:'设备 device',e:'Expected all tensors on the same device, but found cuda:0 and cpu',fix:'x = x.to(model.device)',c:C.am},
           {n:'类型 dtype',e:'expected scalar type Long but found Float',fix:'label = label.long()',c:C.vi}];
  let hit=-1,k=0;
  const sg=g.append('g'),bg=g.append('g'),ball=dot(g,0,0,7,C.gr).attr('opacity',0);
  const Y=i=>80+i*62;
  const draw=()=>{ sg.selectAll('*').remove(); bg.selectAll('*').remove();
    S.forEach((s,i)=>{ const stuck=hit===i,pass=hit>i||hit<0;
      box(sg,W*.28,Y(i)-20,W*.44,40,stuck?C.rd:s.c,{fo:stuck?.3:.14,rx:8});
      txt(sg,W*.5,Y(i)+5,s.n,{anchor:'middle',size:12,bold:true,color:stuck?C.rd:C.ink});
      txt(sg,W*.26,Y(i)+5,pass?'通过':'',{anchor:'end',size:11,color:C.gr,mono:true}); });
    if(hit>=0){ box(bg,30,H-72,W-60,52,C.rd,{fo:.1,rx:8});
      txt(bg,40,H-50,S[hit].e,{size:10.5,mono:true,color:C.rd});
      txt(bg,40,H-30,'修法：'+S[hit].fix,{size:10.5,mono:true,color:C.gr}); }
    else txt(bg,W/2,H-40,'点"抛个错"',{anchor:'middle',size:11,color:C.muted,mono:true}); };
  draw();
  T.every(300,()=>{ if(hit<0){ball.attr('opacity',0);return;} k++; const i=M.min(hit,M.floor(k/4)%(hit+2));
    ball.attr('opacity',1).attr('cx',W*.5).attr('cy',Y(i)-34); });
  api.button('抛个错 / raise',()=>{hit=M.floor(r()*3);k=0;draw();});
  api.button('修好 / fixed',()=>{hit=-1;draw();});
  return {stop:()=>T.stop()};
});

/* ============ si 统计推断 ============ */
def('si_estimate_vs_test','先量差多大，再问是不是运气','Estimation vs testing','尺子先给出差值和误差棒，然后才看误差棒有没有跨过 0。只报 p 值等于把尺子藏起来。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=rnd(5);
  let d=0.6,n=20;
  const x=d3.scaleLinear().domain([-1.6,1.6]).range([60,W-60]);
  const ax=g.append('g').attr('transform',`translate(0,${H-60})`).call(d3.axisBottom(x).ticks(7))
    .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10))
    .call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  const zg=g.append('g'),bg=g.append('g'),info=txt(g,W/2,26,'',{anchor:'middle',mono:true});
  const draw=()=>{ zg.selectAll('*').remove(); bg.selectAll('*').remove();
    ln(zg,x(0),60,x(0),H-60,C.muted,1.5,{dash:'5 4'}); txt(zg,x(0)+6,74,'0 = 没差别',{size:10,color:C.muted,mono:true});
    const se=M.sqrt(2/n),lo=d-1.96*se,hi=d+1.96*se,cross=lo<0&&hi>0;
    const y=H*.45; ln(bg,x(lo),y,x(hi),y,cross?C.am:C.gr,4);
    [lo,hi].forEach(v=>ln(bg,x(v),y-12,x(v),y+12,cross?C.am:C.gr,3));
    dot(bg,x(d),y,7,api.color).attr('stroke',C.ink);
    txt(bg,x(d),y-26,`差值 ${K.fmt(d,2)}`,{anchor:'middle',size:12,bold:true});
    txt(bg,x(lo),y+34,`95% CI [${K.fmt(lo,2)}, ${K.fmt(hi,2)}]`,{size:11,mono:true,color:cross?C.am:C.gr});
    const z=d/se,p=2*(1-ncdf(M.abs(z)));
    info.text(`n=${n}/组  效应 d=${K.fmt(d,2)}  →  p = ${p<1e-4?'<0.0001':K.fmt(p,4)}`);
    txt(bg,W/2,H-24,cross?'区间跨过 0 → 不显著，但你已经知道差值大概多大':'区间不跨 0 → 显著；先看区间宽度再谈结论',
      {anchor:'middle',size:11,color:cross?C.am:C.gr}); };
  draw(); api.slider('真实差值 d',-1.2,1.2,.05,.6,v=>{d=+v;draw();});
  api.slider('每组样本 n',4,200,2,20,v=>{n=+v;draw();});
  return none();
});

def('si_pvalue','p 是尾巴的面积','What p actually means','这条曲线是"假设没有效应"时统计量的分布。拖观测值，红色尾巴的面积就是 p。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const x=d3.scaleLinear().domain([-4,4]).range([60,W-60]),y0=H-60,hh=H-130;
  g.append('g').attr('transform',`translate(0,${y0})`).call(d3.axisBottom(x).ticks(9))
    .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10))
    .call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  const P=d3.range(-4,4.01,.05).map(v=>[x(v),y0-hh*npdf(v,0,1)/npdf(0,0,1)]);
  areaL(g,P,y0,C.muted,.12); pathL(g,P,C.muted,2);
  let z=1.7,two=true;
  const tg=g.append('g'),info=txt(g,W/2,26,'',{anchor:'middle',mono:true});
  const draw=()=>{ tg.selectAll('*').remove();
    const R=P.filter(p=>p[0]>=x(z)),L=P.filter(p=>p[0]<=x(-z));
    areaL(tg,R,y0,C.rd,.5); if(two) areaL(tg,L,y0,C.rd,.5);
    ln(tg,x(z),y0,x(z),y0-hh-10,C.rd,2.5); dot(tg,x(z),y0-hh-10,6,C.rd);
    txt(tg,x(z),y0-hh-20,`观测 z = ${K.fmt(z,2)}`,{anchor:'middle',size:11,mono:true,color:C.rd});
    const p=(two?2:1)*(1-ncdf(z));
    info.text(`p = ${p<1e-4?'<0.0001':K.fmt(p,4)}   ${two?'双尾':'单尾'}   ${p<.05?'p<0.05':'p≥0.05'}`);
    txt(tg,W/2,H-18,'p 说的是"零假设为真时看到这么极端的概率"，不是"零假设为真的概率"',
      {anchor:'middle',size:11,color:C.am}); };
  draw(); api.slider('观测统计量 z',0,4,.05,1.7,v=>{z=+v;draw();});
  api.button('单尾 / 双尾',()=>{two=!two;draw();});
  K.label(svg,12,50,'零假设分布','null distribution',{size:11,color:C.muted});
  return none();
});

def('si_confidence_interval','区间在抖，真值不动','Confidence interval','反复抽样画区间。竖线是真值。约 5% 的区间会漏掉它 —— 这才是 95% 的含义。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let r=rnd(9),n=15,mu=0;
  const x=d3.scaleLinear().domain([-1.8,1.8]).range([70,W-40]);
  const ig=g.append('g'),info=txt(g,W/2,24,'',{anchor:'middle',mono:true});
  ln(g,x(mu),42,x(mu),H-40,C.gr,2,{dash:'6 4'}); txt(g,x(mu)+6,56,'真值 μ',{size:11,color:C.gr,mono:true});
  let k=0,hitN=0,rows=[];
  const step=()=>{ const s=d3.range(n).map(()=>gauss(r)),m=d3.mean(s),sd=d3.deviation(s)||1,se=sd/M.sqrt(n);
    const lo=m-1.96*se,hi=m+1.96*se,ok=lo<mu&&hi>mu; if(ok)hitN++; k++;
    rows.push({lo,hi,m,ok}); if(rows.length>36) rows.shift();
    ig.selectAll('*').remove();
    rows.forEach((d,i)=>{ const yy=48+i*((H-100)/36);
      ln(ig,x(M.max(-1.8,d.lo)),yy,x(M.min(1.8,d.hi)),yy,d.ok?api.color:C.rd,d.ok?1.8:2.6).attr('opacity',d.ok?.7:1);
      dot(ig,x(M.max(-1.8,M.min(1.8,d.m))),yy,2.5,d.ok?api.color:C.rd); });
    info.text(`第 ${k} 次抽样   覆盖 ${hitN}/${k} = ${(100*hitN/k).toFixed(1)}%   (目标 95%)`); };
  T.every(180,step);
  api.slider('每次样本量 n',4,80,1,15,v=>{n=+v;});
  api.button('重来 / reset',()=>{r=rnd(1+M.floor(M.random()*9999));k=0;hitN=0;rows=[];});
  K.label(svg,12,H-14,'红色 = 这次漏掉了真值','red = missed',{size:11,color:C.rd});
  return {stop:()=>T.stop()};
});

def('si_effect_size','用山宽做单位量峰距','Effect size','两座钟形山。d = 峰间距离 ÷ 山的宽度。样本量只影响误差棒，不影响 d。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const x=d3.scaleLinear().domain([-4,6]).range([50,W-50]),y0=H-70,hh=H-140;
  g.append('g').attr('transform',`translate(0,${y0})`).call(d3.axisBottom(x).ticks(8))
    .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10))
    .call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  let d=1,s=1;
  const cg=g.append('g'),info=txt(g,W/2,24,'',{anchor:'middle',mono:true});
  const draw=()=>{ cg.selectAll('*').remove();
    [[0,C.cy,'对照 control'],[d*s,api.color,'处理 treated']].forEach(c=>{
      const P=d3.range(-4,6.01,.05).map(v=>[x(v),y0-hh*npdf(v,c[0],s)/npdf(0,0,s)]);
      areaL(cg,P,y0,c[1],.2); pathL(cg,P,c[1],2.2);
      ln(cg,x(c[0]),y0,x(c[0]),y0-hh,c[1],1,{dash:'3 3'});
      txt(cg,x(c[0]),y0-hh-8,c[2],{anchor:'middle',size:11,color:c[1]}); });
    const yy=y0-hh*.35; ln(cg,x(0),yy,x(d*s),yy,C.am,2.5);
    txt(cg,x(d*s/2),yy-8,`峰距 ${K.fmt(d*s,2)}`,{anchor:'middle',size:11,color:C.am,mono:true});
    ln(cg,x(0),y0-30,x(s),y0-30,C.ink2,2); txt(cg,x(s/2),y0-36,`1 个 sd = ${K.fmt(s,2)}`,{anchor:'middle',size:10,color:C.ink2,mono:true});
    const ov=2*ncdf(-M.abs(d)/2);
    info.text(`Cohen's d = 峰距 / sd = ${K.fmt(d,2)}   重叠约 ${(100*ov).toFixed(0)}%   ${d<.2?'可忽略':d<.5?'小':d<.8?'中':'大'}`); };
  draw(); api.slider("效应量 Cohen's d",0,2.5,.05,1,v=>{d=+v;draw();});
  api.slider('噪声 sd',.5,2,.05,1,v=>{s=+v;draw();});
  return none();
});

def('si_power','功效是右峰越线的那块','Power & sample size','n 大 → 分布变窄 → 越线的面积变大。经验式：每组 n ≈ 16/d²（80% 功效，α=0.05）。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const pw=W*.58,x=d3.scaleLinear().domain([-4,8]).range([40,pw-20]),y0=H-70,hh=H-150;
  g.append('g').attr('transform',`translate(0,${y0})`).call(d3.axisBottom(x).ticks(6))
    .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10))
    .call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  let d=.5,n=20;
  const cg=g.append('g'),qg=g.append('g'),info=txt(g,pw/2,22,'',{anchor:'middle',mono:true});
  const pw_=(d,n)=>1-ncdf(1.96-d*M.sqrt(n/2));
  const draw=()=>{ cg.selectAll('*').remove(); qg.selectAll('*').remove();
    const ncp=d*M.sqrt(n/2),s=1;
    const mk=(m,c)=>d3.range(-4,8.01,.05).map(v=>[x(v),y0-hh*npdf(v,m,s)/npdf(0,0,s)]);
    const P0=mk(0,C.muted),P1=mk(ncp,api.color);
    areaL(cg,P0,y0,C.muted,.14); pathL(cg,P0,C.muted,2);
    areaL(cg,P1.filter(p=>p[0]>=x(1.96)),y0,C.gr,.5); pathL(cg,P1,api.color,2.2);
    ln(cg,x(1.96),y0,x(1.96),y0-hh-14,C.rd,2,{dash:'5 4'}); txt(cg,x(1.96)+5,y0-hh-4,'临界值 α=.05',{size:10,color:C.rd,mono:true});
    const P=pw_(d,n); info.text(`功效 power = ${(100*P).toFixed(1)}%   n=${n}/组   d=${K.fmt(d,2)}`);
    txt(cg,x(ncp),y0-hh-4,'有效应时的分布',{anchor:'middle',size:10,color:api.color});
    /* 右侧曲线 */
    const cx=d3.scaleLinear().domain([2,120]).range([pw+40,W-30]),cy=d3.scaleLinear().domain([0,1]).range([y0,y0-hh]);
    qg.append('g').attr('transform',`translate(0,${y0})`).call(d3.axisBottom(cx).ticks(4))
      .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10)).call(a=>a.selectAll('line,path').attr('stroke',C.hair));
    pathL(qg,d3.range(2,121,2).map(nn=>[cx(nn),cy(pw_(d,nn))]),api.color,2.5);
    ln(qg,cx(2),cy(.8),cx(120),cy(.8),C.gr,1.5,{dash:'4 3'}); txt(qg,cx(2)+4,cy(.8)-6,'80%',{size:10,color:C.gr,mono:true});
    dot(qg,cx(M.min(120,n)),cy(P),6,C.am);
    const need=M.ceil(16/(d*d)); txt(qg,pw+40,50,`要 80% 功效：n ≈ 16/d² = ${need}`,{size:11,mono:true,color:C.am});
    txt(qg,pw+40,y0+40,'每组样本量 n',{size:10,color:C.muted}); };
  draw(); api.slider('效应量 d',.1,1.5,.05,.5,v=>{d=+v;draw();});
  api.slider('每组样本 n',2,120,1,20,v=>{n=+v;draw();});
  return none();
});

def('si_multiple_testing','20 台老虎机总有一台亮','Multiple testing','每台 5% 中奖，全按一遍几乎必有一台亮灯。Bonferroni 把阈值除以 20，灯就基本不亮了。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let r=rnd(2),m=20,corr=false,runs=0,anyN=0;
  const mg=g.append('g'),info=txt(g,W/2,24,'',{anchor:'middle',mono:true});
  const round=()=>{ mg.selectAll('*').remove(); runs++;
    const th=corr?.05/m:.05; let lit=0;
    const cols=M.min(10,m),rw=M.ceil(m/cols),cw=(W-80)/cols,ch=M.min(52,(H-150)/rw);
    for(let i=0;i<m;i++){ const p=r(),on=p<th; if(on)lit++;
      const cx=40+(i%cols)*cw,cy=60+M.floor(i/cols)*(ch+12);
      box(mg,cx,cy,cw-8,ch,on?C.rd:C.muted,{fo:on?.5:.1,rx:5});
      txt(mg,cx+(cw-8)/2,cy+ch/2+4,K.fmt(p,3),{anchor:'middle',size:9.5,mono:true,color:on?C.rd:C.muted}); }
    if(lit)anyN++;
    txt(mg,W/2,H-52,`本轮亮 ${lit} 台   阈值 ${corr?'0.05/'+m+' = '+ (0.05/m).toFixed(4):'0.05'}`,
      {anchor:'middle',size:12,mono:true,color:lit?C.rd:C.gr});
    txt(mg,W/2,H-30,`${runs} 轮里有 ${anyN} 轮出现假阳性 = ${(100*anyN/runs).toFixed(0)}%   理论 ${(100*(1-M.pow(1-th,m))).toFixed(0)}%`,
      {anchor:'middle',size:11,mono:true,color:C.am});
    info.text(corr?'Bonferroni 校正后：整体假阳性压回 5%':'不校正：家族错误率 = 1−0.95^m'); };
  round(); T.every(1200,round);
  api.slider('检验个数 m',2,40,1,20,v=>{m=+v;runs=0;anyN=0;});
  api.button('切换 Bonferroni',()=>{corr=!corr;runs=0;anyN=0;});
  return {stop:()=>T.stop()};
});

def('si_bootstrap','有放回重抽一万次','Bootstrap','把手里这 20 个点当作总体，有放回抽 20 个算一次均值，重复上万次，堆出统计量自己的分布。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const r0=rnd(31),data=d3.range(20).map(()=>2+gauss(r0)*1.2);
  let r=rnd(88),means=[],stat='mean';
  const x=d3.scaleLinear().domain([0,4.5]).range([60,W-40]),y0=H-70,hh=H-170;
  g.append('g').attr('transform',`translate(0,${y0})`).call(d3.axisBottom(x).ticks(7))
    .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10)).call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  const sg=g.append('g'),hg=g.append('g'),qg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  data.forEach(v=>dot(sg,x(v),46,4,C.muted).attr('opacity',.7));
  txt(sg,20,50,'原样本',{size:10,color:C.muted});
  const one=()=>{ const s=d3.range(20).map(()=>data[M.floor(r()*20)]);
    return stat==='mean'?d3.mean(s):stat==='median'?d3.median(s):d3.deviation(s); };
  T.every(60,()=>{ for(let i=0;i<12;i++) means.push(one()); if(means.length>6000) means=means.slice(-6000);
    hist(hg,means,x,y0,hh,api.color);
    qg.selectAll('*').remove(); const so=means.slice().sort(d3.ascending);
    const lo=d3.quantile(so,.025),hi=d3.quantile(so,.975);
    ln(qg,x(lo),y0+16,x(hi),y0+16,C.gr,4); [lo,hi].forEach(v=>ln(qg,x(v),y0+8,x(v),y0+24,C.gr,3));
    txt(qg,W/2,y0+42,`95% bootstrap CI = [${K.fmt(lo,3)}, ${K.fmt(hi,3)}]`,{anchor:'middle',size:11,mono:true,color:C.gr});
    info.text(`重抽 ${means.length} 次   统计量 = ${stat}   不需要任何分布假设`); });
  api.button('换统计量 mean/median/sd',()=>{stat=stat==='mean'?'median':stat==='median'?'sd':'mean';means=[];});
  api.button('重来 / reset',()=>{means=[];r=rnd(1+M.floor(M.random()*9999));});
  return {stop:()=>T.stop()};
});

def('si_permutation','把标签打乱一万次','Permutation test','撕掉试管标签重新贴，重复上万次画出差值分布。真实差值排在最右尾，就说明标签真的有用。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const r0=rnd(17); let shift=.9;
  let A=[],B=[],obs=0,r=rnd(55),ds=[];
  const x=d3.scaleLinear().domain([-2,2]).range([60,W-40]),y0=H-70,hh=H-170;
  g.append('g').attr('transform',`translate(0,${y0})`).call(d3.axisBottom(x).ticks(7))
    .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10)).call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  const pg=g.append('g'),hg=g.append('g'),og=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const gen=()=>{ A=d3.range(12).map(()=>gauss(r0)); B=d3.range(12).map(()=>shift+gauss(r0)); obs=d3.mean(B)-d3.mean(A); ds=[];
    pg.selectAll('*').remove();
    A.forEach(v=>dot(pg,x(v),44,4,C.cy)); B.forEach(v=>dot(pg,x(v),60,4,api.color));
    txt(pg,20,48,'A',{size:11,color:C.cy}); txt(pg,20,64,'B',{size:11,color:api.color}); };
  gen();
  T.every(70,()=>{ const all=A.concat(B);
    for(let k=0;k<10;k++){ const s=all.slice(); for(let i=s.length-1;i>0;i--){const j=M.floor(r()*(i+1));[s[i],s[j]]=[s[j],s[i]];}
      ds.push(d3.mean(s.slice(12))-d3.mean(s.slice(0,12))); }
    if(ds.length>5000) ds=ds.slice(-5000);
    hist(hg,ds,x,y0,hh,C.muted);
    og.selectAll('*').remove();
    ln(og,x(M.max(-2,M.min(2,obs))),y0,x(M.max(-2,M.min(2,obs))),y0-hh-16,C.rd,2.5);
    txt(og,x(M.max(-2,M.min(2,obs))),y0-hh-24,`真实差 ${K.fmt(obs,3)}`,{anchor:'middle',size:11,mono:true,color:C.rd});
    const p=(ds.filter(v=>M.abs(v)>=M.abs(obs)).length+1)/(ds.length+1);
    info.text(`打乱 ${ds.length} 次   p = ${K.fmt(p,4)}   这就是零分布，没有任何公式`); });
  api.slider('真实组间差',0,1.6,.05,.9,v=>{shift=+v;gen();});
  api.button('重新取样',gen);
  return {stop:()=>T.stop()};
});

def('si_bayes_factor','证据的汇率','Bayes factor','天平两端是 H0 和 H1。数据往一边加砝码，加了多重就是 BF。p 值答不了"支持零假设"这个问题。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let bf=3,prior=1;
  const cx=W/2,cy=H*.46,arm=W*.28;
  const bg=g.append('g'),info=txt(g,W/2,24,'',{anchor:'middle',mono:true});
  const draw=()=>{ bg.selectAll('*').remove();
    const post=prior*bf,tilt=M.max(-.42,M.min(.42,M.log(post)/6));
    const dy=arm*M.sin(tilt);
    ln(bg,cx-arm,cy+dy,cx+arm,cy-dy,C.ink2,4);
    ln(bg,cx,cy,cx,cy+70,C.ink2,4); ln(bg,cx-30,cy+70,cx+30,cy+70,C.ink2,4);
    [['H0 没效应',cx-arm,cy+dy,C.muted,1],['H1 有效应',cx+arm,cy-dy,api.color,post]].forEach(s=>{
      const wgt=8+18*M.log(1+s[4]); ln(bg,s[1],s[2],s[1],s[2]+34,C.hair,1.5);
      box(bg,s[1]-wgt,s[2]+34,wgt*2,wgt*1.2,s[3],{fo:.4,rx:4});
      txt(bg,s[1],s[2]+30,s[0],{anchor:'middle',size:11,color:s[3]}); });
    const lab=bf>=100?'极强':bf>=10?'强':bf>=3?'中等':bf>=1?'弱':bf>=1/3?'弱（偏 H0）':bf>=1/10?'中等支持 H0':'强支持 H0';
    info.text(`先验比 ${K.fmt(prior,2)} × BF₁₀ ${K.fmt(bf,2)} = 后验比 ${K.fmt(post,2)}   证据强度：${lab}`);
    txt(bg,W/2,H-18,'BF<1 时它明确支持零假设 —— 这是 p 值做不到的事',{anchor:'middle',size:11,color:C.am}); };
  draw(); api.slider('BF₁₀（数据带来的砝码）',.05,100,.05,3,v=>{bf=+v;draw();});
  api.slider('先验比 H1:H0',.1,10,.1,1,v=>{prior=+v;draw();});
  return none();
});

def('si_preregistration','先封信封，再看数据','Preregistration','同一份纯噪声数据，多试几种分析就能挖出 p<0.05。滑杆=你允许自己试几个版本。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let r=rnd(43),k=3,runs=0,found=0;
  const names=['原始','去离群','log 变换','加协变量','只看男性','只看女性','分两段','换指标'];
  const cg=g.append('g'),info=txt(g,W/2,24,'',{anchor:'middle',mono:true});
  const round=()=>{ cg.selectAll('*').remove(); runs++;
    const ps=d3.range(k).map(()=>r()); const best=d3.min(ps); if(best<.05)found++;
    ps.forEach((p,i)=>{ const y=56+i*32,on=p<.05,pre=i===0;
      box(cg,50,y,W-100,26,on?C.rd:C.muted,{fo:on?.35:.08,rx:5});
      txt(cg,60,y+18,names[i%names.length]+(pre?'  ← 预注册说好只做这个':''),{size:11,color:pre?C.gr:C.ink});
      txt(cg,W-60,y+18,'p = '+K.fmt(p,3),{anchor:'end',size:11,mono:true,color:on?C.rd:C.muted}); });
    txt(cg,W/2,H-46,`试了 ${k} 种分析（数据其实全是噪声）  最小 p = ${K.fmt(best,3)}`,{anchor:'middle',size:11,mono:true});
    txt(cg,W/2,H-24,`${runs} 轮里 ${found} 轮挖到了 p<0.05 = ${(100*found/runs).toFixed(0)}%   预注册只认第一行`,
      {anchor:'middle',size:11.5,color:C.am,mono:true});
    info.text('分析自由度 = 假阳性的燃料'); };
  round(); T.every(1300,round);
  api.slider('允许试几种分析',1,8,1,3,v=>{k=+v;runs=0;found=0;});
  api.button('重来 / reset',()=>{runs=0;found=0;r=rnd(1+M.floor(M.random()*9999));});
  return {stop:()=>T.stop()};
});

def('si_assumptions','三道闸门，独立最要命','Test assumptions','独立性破了（数据成簇），名义 95% 区间的真实覆盖率会掉到七成以下。正态和方差齐没这么致命。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let rho=0,r=rnd(61),runs=0,cov=0;
  const gates=[['独立 independence',()=>rho],['分布形状 normality',()=>0],['方差齐 equal var',()=>0]];
  const gg=g.append('g'),bg=g.append('g'),info=txt(g,W/2,24,'',{anchor:'middle',mono:true});
  const draw=()=>{ gg.selectAll('*').remove();
    gates.forEach((t,i)=>{ const leak=t[1]()>0.02,y=56+i*46;
      box(gg,40,y,W*.44,34,leak?C.rd:C.gr,{fo:leak?.3:.14,rx:7});
      txt(gg,52,y+22,t[0],{size:11.5,color:leak?C.rd:C.ink});
      txt(gg,40+W*.44-12,y+22,leak?'漏':'✓',{anchor:'end',size:12,color:leak?C.rd:C.gr,mono:true}); }); };
  T.every(120,()=>{ /* 簇内相关 rho：有效样本量缩水 */
    const n=20,cl=5,per=n/cl; let s=[];
    for(let c=0;c<cl;c++){ const ce=gauss(r)*M.sqrt(rho); for(let j=0;j<per;j++) s.push(ce+gauss(r)*M.sqrt(1-rho)); }
    const m=d3.mean(s),sd=d3.deviation(s)||1,se=sd/M.sqrt(n),lo=m-1.96*se,hi=m+1.96*se;
    runs++; if(lo<0&&hi>0) cov++;
    bg.selectAll('*').remove();
    const cx=W*.56,bw=W*.36,pct=cov/runs;
    txt(bg,cx,64,'名义 95% 区间的真实覆盖率',{size:11,color:C.muted});
    box(bg,cx,76,bw,26,C.muted,{fo:.1,rx:4}); box(bg,cx,76,bw*pct,26,pct<.9?C.rd:C.gr,{fo:.5,rx:4});
    ln(bg,cx+bw*.95,70,cx+bw*.95,108,C.am,2,{dash:'3 3'});
    txt(bg,cx,120,`${(100*pct).toFixed(1)}%   （${runs} 次抽样）`,{size:12,mono:true,color:pct<.9?C.rd:C.gr});
    txt(bg,cx,152,rho>.02?`簇内相关 ρ=${K.fmt(rho,2)}：等于样本量偷偷缩水`:'独立成立：覆盖率贴着 95%',
      {size:11,color:rho>.02?C.rd:C.gr});
    info.text('选检验先问三件事；独立那道破了，另外两道修好也没用'); draw(); });
  api.slider('簇内相关 ρ（破坏独立）',0,.9,.05,0,v=>{rho=+v;runs=0;cov=0;});
  return {stop:()=>T.stop()};
});

/* ============ ex 实验设计与因果 ============ */
def('ex_randomization','随机分堆，看不见的标签也被打散','Why randomization works','每个球身上有三个你看不见的属性。随机分两堆，任何属性的比例都趋于一致；按手边顺序分就不会。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let r=rnd(23),mode='rand',N=40;
  const props=[['年龄大',C.cy],['体重高',C.am],['未知变量 Z',C.vi]];
  const bg=g.append('g'),sg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const round=()=>{ bg.selectAll('*').remove(); sg.selectAll('*').remove();
    const balls=d3.range(N).map(i=>({a:r()<.5,b:r()<.5,z:r()<.5,i}));
    balls.forEach(b=>{ b.g = mode==='rand' ? (r()<.5?0:1) : (b.z?0:1); });
    [0,1].forEach(k=>{ const px=k?W*.55:W*.08,list=balls.filter(b=>b.g===k);
      txt(bg,px,52,k?'处理组 treated':'对照组 control',{size:11.5,color:k?api.color:C.cy});
      list.forEach((b,i)=>{ const cx=px+18+(i%9)*26,cy=72+M.floor(i/9)*26;
        dot(bg,cx,cy,8,b.z?C.vi:C.muted).attr('fill-opacity',.75);
        if(b.a) ln(bg,cx-8,cy-11,cx+8,cy-11,C.cy,2); if(b.b) ln(bg,cx-8,cy+11,cx+8,cy+11,C.am,2); }); });
    const yb=H-92;
    props.forEach((p,i)=>{ const key=['a','b','z'][i];
      const f0=d3.mean(balls.filter(b=>b.g===0),b=>b[key])||0,f1=d3.mean(balls.filter(b=>b.g===1),b=>b[key])||0;
      const y=yb+i*24,gap=M.abs(f0-f1);
      txt(sg,30,y,p[0],{size:10.5,color:p[1]});
      box(sg,120,y-9,90*f0,12,C.cy,{fo:.45,rx:2}); box(sg,230,y-9,90*f1,12,api.color,{fo:.45,rx:2});
      txt(sg,340,y,`差 ${(100*gap).toFixed(0)}%`,{size:10.5,mono:true,color:gap>.25?C.rd:C.gr}); });
    info.text(mode==='rand'?'随机化：所有属性（包括你没想到的 Z）在两组里自动拉平'
      :'按 Z 分组：Z 完全失衡 → 你测到的差全是 Z 的功劳'); };
  round(); T.every(1400,round);
  api.button('随机分组 / randomize',()=>{mode='rand';round();});
  api.button('按手边顺序分',()=>{mode='conv';round();});
  api.slider('样本量 N',12,60,2,40,v=>{N=+v;round();});
  return {stop:()=>T.stop()};
});

def('ex_control_blinding','两条一样的线，只差一个阀门','Controls & blinding','对照回答"没有它会怎样"。开盲时操作员的期望会渗进读数：处理组被系统性读高。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let blind=false,r=rnd(37),vals={c:[],t:[]};
  const y=d3.scaleLinear().domain([-2,4]).range([H-70,60]);
  const lg=g.append('g'),dg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ lg.selectAll('*').remove();
    [[W*.22,'对照 control',C.cy,false],[W*.62,'处理 treated',api.color,true]].forEach(s=>{
      box(lg,s[0]-70,50,140,H-110,s[2],{fo:.05,rx:10});
      txt(lg,s[0],40,s[1],{anchor:'middle',size:12,color:s[2]});
      /* 阀门 */
      box(lg,s[0]-16,H-96,32,22,s[3]?C.gr:C.muted,{fo:s[3]?.5:.15,rx:4});
      txt(lg,s[0],H-80,s[3]?'ON':'OFF',{anchor:'middle',size:9,mono:true,color:C.ink});
      txt(lg,s[0],H-56,blind?'标签遮住':'操作员看得见',{anchor:'middle',size:10,color:blind?C.gr:C.rd}); });
    ln(lg,40,y(0),W-40,y(0),C.hair,1); txt(lg,W-38,y(0)+4,'基线',{size:10,color:C.muted}); };
  T.every(300,()=>{ const bias=blind?0:.55;
    vals.c.push(0+gauss(r)*.6); vals.t.push(1+bias+gauss(r)*.6);
    if(vals.c.length>26){vals.c.shift();vals.t.shift();}
    dg.selectAll('*').remove();
    [['c',W*.22,C.cy],['t',W*.62,api.color]].forEach(s=>{
      vals[s[0]].forEach((v,i)=>dot(dg,s[1]-46+(i%13)*8,y(v),3.4,s[2]).attr('opacity',.8));
      const m=d3.mean(vals[s[0]]); ln(dg,s[1]-56,y(m),s[1]+56,y(m),s[2],2.5);
      txt(dg,s[1]+62,y(m)+4,K.fmt(m,2),{size:11,mono:true,color:s[2]}); });
    const eff=d3.mean(vals.t)-d3.mean(vals.c);
    txt(dg,W/2,H-24,`测到的效应 = ${K.fmt(eff,2)}   真实效应 = 1.00   偏倚 = ${K.fmt(eff-1,2)}`,
      {anchor:'middle',size:12,mono:true,color:blind?C.gr:C.rd});
    info.text(blind?'双盲：期望进不来，测到的就是真的':'开盲：操作员知道谁被处理 → 读数被系统性抬高'); });
  draw(); api.button('切换盲法 / blinding',()=>{blind=!blind;vals={c:[],t:[]};draw();});
  return {stop:()=>T.stop()};
});

def('ex_confounder','借来的相关','Confounding','C 同时射向 T 和 Y。不调整时 T 与 Y 看着相关；按 C 分层后，组内相关消失。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r0=rnd(19);
  let adj=false,strength=1;
  const pw=W*.42,ax=K.axes(svg,pw,H,[-3,3],[-3,3]);
  const dg=g.append('g'),gg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const gen=()=>d3.range(70).map(()=>{ const c=gauss(r0); const t=strength*c+gauss(r0)*.6,y=strength*c+gauss(r0)*.6; return {c,t,y}; });
  let P=gen();
  const draw=()=>{ dg.selectAll('*').remove(); gg.selectAll('*').remove();
    P.forEach(p=>dot(dg,ax.x(M.max(-3,M.min(3,p.t))),ax.y(M.max(-3,M.min(3,p.y))),4,
      adj?(p.c>0?C.am:C.cy):api.color).attr('opacity',.75));
    const fit=pts=>{ if(pts.length<3) return null; const mx=d3.mean(pts,p=>p.t),my=d3.mean(pts,p=>p.y);
      const b=d3.sum(pts,p=>(p.t-mx)*(p.y-my))/(d3.sum(pts,p=>(p.t-mx)**2)||1); return {a:my-b*mx,b}; };
    const drawFit=(pts,col)=>{ const f=fit(pts); if(!f) return f;
      pathL(dg,[[ax.x(-3),ax.y(M.max(-3,M.min(3,f.a-3*f.b)))],[ax.x(3),ax.y(M.max(-3,M.min(3,f.a+3*f.b)))]],col,2.5); return f; };
    let msg;
    if(!adj){ const f=drawFit(P,C.rd); msg=`不调整：斜率 ${K.fmt(f.b,2)}（其实 T→Y 真实效应 = 0）`; }
    else { const lo=P.filter(p=>p.c<=0),hi=P.filter(p=>p.c>0);
      const a=drawFit(lo,C.cy),b=drawFit(hi,C.am); msg=`按 C 分层：组内斜率 ${K.fmt(a.b,2)} / ${K.fmt(b.b,2)} → 接近 0`; }
    txt(dg,pw/2,H-20,msg,{anchor:'middle',size:11,mono:true,color:adj?C.gr:C.rd});
    /* DAG */
    const cx=pw+ (W-pw)/2, cy0=90;
    const nodes=[['C',cx,cy0,C.vi],['T',cx-70,cy0+110,C.cy],['Y',cx+70,cy0+110,api.color]];
    const am=K.arrow(svg,'exc',C.vi);
    nodes.forEach(n=>{ box(gg,n[1]-24,n[2]-18,48,36,n[3],{fo:.25,rx:8}); txt(gg,n[1],n[2]+5,n[0],{anchor:'middle',size:14,bold:true}); });
    ln(gg,cx-6,cy0+20,cx-62,cy0+90,C.vi,2,{arrow:am}); ln(gg,cx+6,cy0+20,cx+62,cy0+90,C.vi,2,{arrow:am});
    ln(gg,cx-44,cy0+110,cx+44,cy0+110,C.muted,2,{dash:'5 4'});
    txt(gg,cx,cy0+134,'真实 T→Y = 0',{anchor:'middle',size:10,color:C.muted});
    if(adj) box(gg,cx-30,cy0-24,60,48,C.gr,{fo:0,stroke:C.gr,sw:2,rx:10});
    txt(gg,cx,cy0+186,adj?'条件化 C = 关掉后门':'后门 T←C→Y 开着',{anchor:'middle',size:11,color:adj?C.gr:C.rd});
    info.text('混杂：同时影响处理和结果的第三者'); };
  draw();
  api.button('按 C 分层 / adjust',()=>{adj=!adj;draw();});
  api.slider('混杂强度',0,2,.1,1,v=>{strength=+v;P=gen();draw();});
  return none();
});

def('ex_dag','链、叉、对撞：拧阀门的后果','Causal DAG','条件化像拧阀门。链和叉拧了断流；对撞拧了反而接通 —— 这是唯一反直觉的一个。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let cond=false,k=0;
  const am=K.arrow(svg,'exd',C.ink2);
  const cases=[{n:'链 chain',t:'X→Z→Y',open:s=>!s,d:[[0,1],[1,2]]},
               {n:'叉 fork',t:'X←Z→Y',open:s=>!s,d:[[1,0],[1,2]]},
               {n:'对撞 collider',t:'X→Z←Y',open:s=>s,d:[[0,1],[2,1]]}];
  const cg=g.append('g'),fg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const cw=W/3;
  const pos=(i,j)=>{ const bx=i*cw+cw/2; const P=[[bx-72,150],[bx,cases[i].n==='叉 fork'?86:150],[bx+72,150]];
    if(cases[i].n==='对撞 collider') P[1]=[bx,214]; return P[j]; };
  const draw=()=>{ cg.selectAll('*').remove();
    cases.forEach((c,i)=>{ const bx=i*cw+cw/2,open=c.open(cond);
      txt(cg,bx,58,c.n,{anchor:'middle',size:12.5,bold:true}); txt(cg,bx,76,c.t,{anchor:'middle',size:11,mono:true,color:C.muted});
      c.d.forEach(e=>{ const a=pos(i,e[0]),b=pos(i,e[1]);
        const ux=(b[0]-a[0]),uy=(b[1]-a[1]),L=M.hypot(ux,uy);
        ln(cg,a[0]+ux/L*22,a[1]+uy/L*20,b[0]-ux/L*24,b[1]-uy/L*22,C.ink2,2,{arrow:am}); });
      ['X','Z','Y'].forEach((s,j)=>{ const p=pos(i,j),isZ=j===1,c2=isZ?(cond?C.gr:C.vi):api.color;
        box(cg,p[0]-20,p[1]-18,40,36,c2,{fo:cond&&isZ?.5:.22,rx:8});
        txt(cg,p[0],p[1]+5,s,{anchor:'middle',size:13,bold:true});
        if(isZ&&cond) box(cg,p[0]-26,p[1]-24,52,48,C.gr,{fo:0,stroke:C.gr,sw:2,rx:10}); });
      txt(cg,bx,H-58,open?'X 与 Y 相关（通路开）':'X 与 Y 独立（通路断）',
        {anchor:'middle',size:11.5,color:open?C.rd:C.gr}); });
    info.text(cond?'条件化 Z（灰框）：链断、叉断、对撞反而打开':'不条件化：链通、叉通、对撞天然断开'); };
  draw();
  T.every(420,()=>{ fg.selectAll('*').remove(); k++;
    cases.forEach((c,i)=>{ if(!c.open(cond)) return; const bx=i*cw+cw/2;
      const ph=(k%8)/8,xx=bx-72+144*ph; dot(fg,xx,c.n==='对撞 collider'?150:(c.n==='叉 fork'?118:150),4,C.am); }); });
  api.button('条件化 Z / condition',()=>{cond=!cond;draw();});
  return {stop:()=>T.stop()};
});

def('ex_backdoor','每条后门路上放一块石头','Backdoor criterion','堵住所有从 T 反向出发的路径，但不许堵在 T 的下游。点节点选调整集，看还剩几条后门开着。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const N={T:[W*.28,H*.62],Y:[W*.72,H*.62],U:[W*.5,H*.2],Z:[W*.5,H*.4],M:[W*.5,H*.62],S:[W*.5,H*.86]};
  const E=[['U','T'],['U','Z'],['Z','T'],['Z','Y'],['T','M'],['M','Y'],['Y','S'],['T','S']];
  const paths=[{p:['T','Z','Y'],ok:s=>s.has('Z')},{p:['T','U','Z','Y'],ok:s=>s.has('Z')||s.has('U')}];
  const sel=new Set();
  const am=K.arrow(svg,'exb',C.ink2),eg=g.append('g'),ng=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ eg.selectAll('*').remove(); ng.selectAll('*').remove();
    E.forEach(e=>{ const a=N[e[0]],b=N[e[1]],ux=b[0]-a[0],uy=b[1]-a[1],L=M.hypot(ux,uy);
      const back=paths.some(pp=>{for(let i=0;i<pp.p.length-1;i++){const x=pp.p[i],y=pp.p[i+1];
        if((x===e[0]&&y===e[1])||(x===e[1]&&y===e[0]))return true;} return false;});
      ln(eg,a[0]+ux/L*24,a[1]+uy/L*22,b[0]-ux/L*26,b[1]-uy/L*24,back?C.am:C.ink2,back?2.4:1.8,{arrow:am,op:back?.9:.5}); });
    ln(eg,N.T[0]+26,N.T[1],N.Y[0]-26,N.Y[1],C.gr,3,{arrow:K.arrow(svg,'exb2',C.gr)});
    txt(eg,W/2,H*.62-12,'要估的因果效应',{anchor:'middle',size:10,color:C.gr});
    Object.keys(N).forEach(k=>{ const p=N[k],on=sel.has(k),bad=(k==='M'||k==='S')&&on;
      box(ng,p[0]-22,p[1]-18,44,36,on?(bad?C.rd:C.gr):(k==='T'||k==='Y'?api.color:C.vi),{fo:on?.5:.22,rx:9})
        .style('cursor','pointer').on('click',()=>{ if(k==='T'||k==='Y')return; sel.has(k)?sel.delete(k):sel.add(k); draw(); });
      txt(ng,p[0],p[1]+5,k,{anchor:'middle',size:13,bold:true}).style('pointer-events','none'); });
    txt(ng,N.U[0]+30,N.U[1],'U 不可测',{size:10,color:C.muted});
    txt(ng,N.M[0]+30,N.M[1],'M 中介（T 的后代）',{size:10,color:C.muted});
    txt(ng,N.S[0]+30,N.S[1],'S 对撞（T,Y 的后代）',{size:10,color:C.muted});
    const openN=paths.filter(pp=>!pp.ok(sel)).length;
    const bad=sel.has('M')||sel.has('S');
    info.text(`调整集 {${[...sel].join(',')||'空'}}   还开着的后门：${openN} 条` + (bad?'   ← 调整了 T 的后代，把好路也堵了':''));
    txt(ng,W/2,H-16,openN===0&&!bad?'满足后门准则：可识别':'不满足：估计会有偏',
      {anchor:'middle',size:12,bold:true,color:openN===0&&!bad?C.gr:C.rd}); };
  draw(); api.button('清空调整集',()=>{sel.clear();draw();});
  api.button('给出答案 {Z}',()=>{sel.clear();sel.add('Z');draw();});
  return none();
});

def('ex_ab_sequential','偷看会把 5% 抬到 20%','A/B & sequential testing','A、B 其实完全一样。p 值随样本量随机游走，你每多看一眼，就多一次踩到 0.05 的机会。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let r=rnd(71),peek=true,runs=0,fp=0;
  const x=d3.scaleLinear().domain([20,600]).range([60,W-40]),y=d3.scaleLog().domain([.001,1]).range([H-70,60]);
  g.append('g').attr('transform',`translate(0,${H-70})`).call(d3.axisBottom(x).ticks(6))
    .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10)).call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  g.append('g').attr('transform','translate(60,0)').call(d3.axisLeft(y).ticks(4,'.3f'))
    .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10)).call(a=>a.selectAll('line,path').attr('stroke',C.hair));
  ln(g,60,y(.05),W-40,y(.05),C.rd,2,{dash:'6 4'}); txt(g,W-38,y(.05)+4,'0.05',{size:10,color:C.rd,mono:true});
  const wg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const round=()=>{ wg.selectAll('*').remove(); runs++;
    let sa=0,sb=0,pts=[],hit=null;
    for(let n=20;n<=600;n+=10){ for(let i=0;i<10;i++){ sa+=gauss(r); sb+=gauss(r); }
      const se=M.sqrt(2/n),z=(sb-sa)/n/se,p=M.max(.0011,2*(1-ncdf(M.abs(z))));
      pts.push([x(n),y(p)]); if(!hit&&p<.05&&peek) hit=[n,p]; }
    pathL(wg,pts,api.color,2);
    const last=pts[pts.length-1];
    if(peek&&hit){ dot(wg,x(hit[0]),y(hit[1]),7,C.rd); txt(wg,x(hit[0]),y(hit[1])-14,`n=${hit[0]} 就喊停`,{anchor:'middle',size:10,mono:true,color:C.rd}); }
    dot(wg,last[0],last[1],5,C.gr);
    const sig = peek? !!hit : (y.invert(last[1])<.05);
    if(sig) fp++;
    txt(wg,W/2,H-40,peek?'边看边停：只要曾经跌破 0.05 就宣布赢':'固定样本量 600 才看一次',
      {anchor:'middle',size:11,color:peek?C.rd:C.gr});
    txt(wg,W/2,H-18,`${runs} 轮里 ${fp} 轮宣布显著（真相：A=B）= ${(100*fp/runs).toFixed(0)}%`,
      {anchor:'middle',size:12,mono:true,color:C.am});
    info.text('要边看边停，就得用序贯边界或 alpha spending'); };
  round(); T.every(1500,round);
  api.button('切换：偷看 / 只看一次',()=>{peek=!peek;runs=0;fp=0;});
  return {stop:()=>T.stop()};
});

def('ex_batch_design','别让批次和处理同向排','Batch design','左：处理按列整齐排，跟批次完全共线，两者永远分不开。右：打散到每个区域，效应可分离。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let good=false,r=rnd(13),t=0;
  const R=8,Cn=12,cw=M.min(26,(W*.9)/Cn),ch=M.min(24,(H-150)/R);
  const px=(W-Cn*cw)/2,py=70;
  const pg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ pg.selectAll('*').remove();
    for(let i=0;i<R;i++)for(let j=0;j<Cn;j++){
      const batch=M.floor(j/(Cn/3));
      const trt = good ? ((i+j)%2===0) : (j>=Cn/2);
      box(pg,px+j*cw,py+i*ch,cw-3,ch-3,trt?api.color:C.muted,{fo:trt?.55:.14,rx:3}); }
    [0,1,2].forEach(b=>{ box(pg,px+b*(Cn/3)*cw-2,py-6,(Cn/3)*cw,R*ch+8,[C.cy,C.am,C.vi][b],{fo:0,sw:1.5,rx:6,stroke:[C.cy,C.am,C.vi][b]});
      txt(pg,px+b*(Cn/3)*cw+(Cn/3)*cw/2,py-12,'批次 '+(b+1),{anchor:'middle',size:10,color:[C.cy,C.am,C.vi][b]}); });
    const y2=py+R*ch+34;
    txt(pg,W/2,y2,good?'处理与批次正交：批次效应可以单独扣掉'
      :'处理 = 批次 → 完全共线，模型里两项无法同时估计',{anchor:'middle',size:12,color:good?C.gr:C.rd});
    txt(pg,W/2,y2+24,good?'实践：每个批次里都放上所有处理，且组内位置随机'
      :'典型翻车：对照今天做、处理明天做',{anchor:'middle',size:11,color:C.muted});
    info.text('批次是最常见的隐形混杂'); };
  draw(); T.every(900,()=>{ t++; pg.selectAll('rect').attr('stroke-opacity',.6+.4*(t%2)); });
  api.button('切换：共线 / 正交',()=>{good=!good;draw();});
  return {stop:()=>T.stop()};
});

def('ex_replicate_level','n 是能独立随机分配的单位','Technical vs biological','三只小鼠各测 100 个细胞。把细胞当 n 会把 p 值压到几乎必然显著 —— 那是假的精度。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let cells=100,level='mouse',r=rnd(29),nm=3;
  const y=d3.scaleLinear().domain([-2,4]).range([H-90,70]);
  const mg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const round=()=>{ mg.selectAll('*').remove();
    const groups=[[C.cy,0,'对照'],[api.color,1,'处理']],mice=[];
    groups.forEach((gr,gi)=>{ for(let m=0;m<nm;m++){ const me=gr[1]+gauss(r)*.8,cs=d3.range(cells).map(()=>me+gauss(r)*.25);
      mice.push({g:gi,me:d3.mean(cs),cs,col:gr[0],x:W*.16+gi*W*.42+m*46}); } });
    mice.forEach(mo=>{ mo.cs.slice(0,60).forEach(v=>dot(mg,mo.x+(r()-.5)*26,y(M.max(-2,M.min(4,v))),1.6,mo.col).attr('opacity',.5));
      mg.append('circle').attr('cx',mo.x).attr('cy',y(mo.me)).attr('r',15).attr('fill','none')
        .attr('stroke',level==='mouse'?C.am:C.hair).attr('stroke-width',level==='mouse'?2.5:1);
      dot(mg,mo.x,y(mo.me),4,C.am); });
    groups.forEach((gr,gi)=>txt(mg,W*.16+gi*W*.42+46,H-64,gr[2],{anchor:'middle',size:11.5,color:gr[0]}));
    let n,sd,diff;
    if(level==='mouse'){ const a=mice.filter(m=>m.g===0).map(m=>m.me),b=mice.filter(m=>m.g===1).map(m=>m.me);
      n=nm; diff=d3.mean(b)-d3.mean(a); sd=M.max(.15,(d3.deviation(a.concat(b.map(v=>v-diff)))||.8)); }
    else { const a=mice.filter(m=>m.g===0).flatMap(m=>m.cs),b=mice.filter(m=>m.g===1).flatMap(m=>m.cs);
      n=a.length; diff=d3.mean(b)-d3.mean(a); sd=M.max(.05,d3.deviation(a)||.25); }
    const se=sd*M.sqrt(2/n),z=diff/se,p=2*(1-ncdf(M.abs(z)));
    txt(mg,W/2,H-36,`统计单位 = ${level==='mouse'?'小鼠（正确）':'细胞（伪重复）'}   n = ${n}   p = ${p<1e-6?'<1e-6':K.fmt(p,5)}`,
      {anchor:'middle',size:12,mono:true,color:level==='mouse'?C.gr:C.rd});
    txt(mg,W/2,H-14,level==='mouse'?'圆圈是小鼠：随机分配发生在这一层'
      :'把细胞当 n：n 被吹大 100 倍，p 值假到没边',{anchor:'middle',size:11,color:C.muted});
    info.text('测得多 ≠ 样本量大'); };
  round(); T.every(1600,round);
  api.button('切换统计单位：小鼠 / 细胞',()=>{level=level==='mouse'?'cell':'mouse';round();});
  api.slider('每只测多少细胞',10,300,10,100,v=>{cells=+v;round();});
  api.slider('小鼠只数',2,6,1,3,v=>{nm=+v;round();});
  return {stop:()=>T.stop()};
});

def('ex_simpson','合并前后趋势翻转','Simpson paradox','两组各自都向上，但两组的起点高低不同。把点合起来拟合，整体斜率变成向下。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r0=rnd(41);
  let sep=3,merged=false;
  const ax=K.axes(svg,W,H,[0,10],[0,10]);
  const dg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const gen=()=>{ const P=[]; for(let k=0;k<2;k++) for(let i=0;i<24;i++){
      const x=(k?5.4:1.2)+r0()*3.2, y=(k? 8-sep : 2+sep) + .38*(x-(k?5.4:1.2)) + gauss(r0)*.35;
      P.push({x,y:M.max(.4,M.min(9.6,y)),k}); } return P; };
  let P=gen();
  const fit=pts=>{ const mx=d3.mean(pts,p=>p.x),my=d3.mean(pts,p=>p.y);
    const b=d3.sum(pts,p=>(p.x-mx)*(p.y-my))/(d3.sum(pts,p=>(p.x-mx)**2)||1); return {a:my-b*mx,b}; };
  const draw=()=>{ dg.selectAll('*').remove();
    P.forEach(p=>dot(dg,ax.x(p.x),ax.y(p.y),4.5,merged?api.color:(p.k?C.am:C.cy)).attr('opacity',.85));
    const L=P.filter(p=>!p.k),R=P.filter(p=>p.k);
    if(!merged){ [[L,C.cy],[R,C.am]].forEach(s=>{ const f=fit(s[0]),xs=d3.extent(s[0],p=>p.x);
      pathL(dg,[[ax.x(xs[0]),ax.y(f.a+f.b*xs[0])],[ax.x(xs[1]),ax.y(f.a+f.b*xs[1])]],s[1],3); });
      info.text(`分组看：左组斜率 ${K.fmt(fit(L).b,2)}，右组斜率 ${K.fmt(fit(R).b,2)} —— 都向上`); }
    else { const f=fit(P); pathL(dg,[[ax.x(0),ax.y(f.a)],[ax.x(10),ax.y(f.a+10*f.b)]],C.rd,3.5);
      info.text(`合并看：整体斜率 ${K.fmt(f.b,2)} —— 方向反了`); }
    txt(dg,W/2,H-16,merged?'到底信哪个？看那个分组变量是不是混杂：是就信分组':'点"合并"看趋势翻转',
      {anchor:'middle',size:11,color:C.am}); };
  draw(); api.button('合并 / 分组',()=>{merged=!merged;draw();});
  api.slider('两组起点落差',0,4,.2,3,v=>{sep=+v;P=gen();draw();});
  return none();
});

def('ex_selection_bias','筛网造出一条假斜线','Selection & collider bias','两个本来独立的变量，只留下"和 > 阈值"的样本，剩下的点自动排成一条负相关的斜线。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r0=rnd(53);
  let th=-9,sel=false;
  const ax=K.axes(svg,W*.6,H,[-3,3],[-3,3]);
  const P=d3.range(240).map(()=>({x:gauss(r0),y:gauss(r0)}));
  const dg=g.append('g'),sg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ dg.selectAll('*').remove(); sg.selectAll('*').remove();
    const keep=P.filter(p=>p.x+p.y>th);
    P.forEach(p=>{ const on=p.x+p.y>th;
      dot(dg,ax.x(M.max(-3,M.min(3,p.x))),ax.y(M.max(-3,M.min(3,p.y))),3.4,on?api.color:C.muted)
        .attr('opacity',on?.9:(sel?.06:.35)); });
    if(th>-8){ const f=x=>th-x; pathL(dg,[[ax.x(-3),ax.y(M.max(-3,M.min(3,f(-3))))],[ax.x(3),ax.y(M.max(-3,M.min(3,f(3))))]],C.rd,2,{dash:'5 4'});
      txt(dg,ax.x(-2.8),ax.y(2.8),'筛网：只有 x+y > 阈值 才进样本',{size:10.5,color:C.rd}); }
    const use=sel?keep:P;
    const mx=d3.mean(use,p=>p.x),my=d3.mean(use,p=>p.y);
    const b=d3.sum(use,p=>(p.x-mx)*(p.y-my))/(d3.sum(use,p=>(p.x-mx)**2)||1);
    const rr=d3.sum(use,p=>(p.x-mx)*(p.y-my))/M.sqrt((d3.sum(use,p=>(p.x-mx)**2)||1)*(d3.sum(use,p=>(p.y-my)**2)||1));
    pathL(dg,[[ax.x(-3),ax.y(M.max(-3,M.min(3,my+b*(-3-mx))))],[ax.x(3),ax.y(M.max(-3,M.min(3,my+b*(3-mx))))]],
      sel?C.rd:C.gr,3);
    const bx=W*.62;
    txt(sg,bx,80,`总体里 x ⟂ y`,{size:12}); txt(sg,bx,102,`相关 r ≈ 0`,{size:11,mono:true,color:C.gr});
    txt(sg,bx,146,sel?'只看入选样本':'看全部样本',{size:12,color:sel?C.rd:C.gr});
    txt(sg,bx,168,`n = ${use.length}   r = ${K.fmt(rr,3)}`,{size:11,mono:true,color:sel&&M.abs(rr)>.2?C.rd:C.gr});
    txt(sg,bx,212,'S = 是否入选，是 x 和 y 的共同后代',{size:10.5,color:C.muted});
    txt(sg,bx,232,'按 S 筛样本 = 条件化对撞点',{size:10.5,color:C.muted});
    txt(sg,bx,252,'→ 凭空造出相关',{size:10.5,color:C.rd});
    info.text('样本怎么进来的，决定你能得出什么结论'); };
  draw(); api.slider('筛网阈值',-9,2.5,.1,-9,v=>{th=+v;draw();});
  api.button('只看入选样本 / 看全部',()=>{sel=!sel;draw();});
  return none();
});

/* ============ gm 生成模型 ============ */
def('gm_autoregressive','一颗珠子只看左边','Autoregressive','联合概率拆成一串条件概率。每一步只看已经生成的左侧，采一个词，再把它接到条件里。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const V=['猫','狗','在','桌','上','睡','了'],r=rnd(67);
  let seq=['<s>'],k=0,probs=[];
  const bg=g.append('g'),pg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const step=()=>{ if(seq.length>7){ seq=['<s>']; }
    probs=softmax(V.map(()=>r()*3),.8);
    const c=d3.cumsum(probs); let u=r(),i=c.findIndex(v=>v>u); if(i<0)i=V.length-1;
    seq.push(V[i]); k++;
    bg.selectAll('*').remove(); pg.selectAll('*').remove();
    seq.forEach((s,j)=>{ const x=50+j*(M.min(70,(W-140)/8)),last=j===seq.length-1;
      chip(bg,x,80,58,38,s,last?C.gr:api.color,{fo:last?.5:.22,size:14});
      if(j<seq.length-1) ln(bg,x+58,99,x+M.min(70,(W-140)/8),99,C.muted,1.5,{op:.5}); });
    const lx=50+(seq.length-1)*M.min(70,(W-140)/8);
    for(let j=0;j<seq.length-1;j++){ const x=50+j*M.min(70,(W-140)/8)+29;
      g.append('path'); ln(bg,x,76,lx+29,64,C.vi,1.2,{op:.45}); }
    txt(bg,lx+29,52,'只看左边全部',{anchor:'middle',size:10,color:C.vi});
    const bw=(W-120)/V.length;
    V.forEach((s,j)=>{ const h=probs[j]*(H-230);
      box(pg,60+j*bw,H-56-h,bw-8,h,V[j]===seq[seq.length-1]?C.gr:api.color,{fo:.45,rx:3});
      txt(pg,60+j*bw+(bw-8)/2,H-40,s,{anchor:'middle',size:11});
      txt(pg,60+j*bw+(bw-8)/2,H-60-h,K.fmt(probs[j],2),{anchor:'middle',size:9,mono:true,color:C.muted}); });
    txt(pg,60,H-172,`p(下一个 | ${seq.slice(1).join('')||'空'})`,{size:11,mono:true,color:C.muted});
    info.text(`p(x₁..x_n) = Π p(x_t | x_<t)   已生成 ${seq.length-1} 个`); };
  step(); T.every(1000,step);
  api.button('重新开始',()=>{seq=['<s>'];step();});
  return {stop:()=>T.stop()};
});

def('gm_vae','重建和 KL 在拔河','VAE & ELBO','β 小：云收得很紧，重建好但潜空间有洞。β 大：云被压成标准正态，采样漂亮但图糊。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let beta=1,r=rnd(83);
  const ax=K.axes(svg,W*.52,H,[-3,3],[-3,3]);
  const cg=g.append('g'),bg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ cg.selectAll('*').remove(); bg.selectAll('*').remove();
    const sd=.15+.85*M.min(1,beta/2), spread=2.0/(1+beta*.8);
    cg.append('circle').attr('cx',ax.x(0)).attr('cy',ax.y(0)).attr('r',(ax.x(1)-ax.x(0)))
      .attr('fill','none').attr('stroke',C.gr).attr('stroke-width',1.5).attr('stroke-dasharray','5 4');
    txt(cg,ax.x(0)+(ax.x(1)-ax.x(0))+4,ax.y(0),'先验 N(0,I)',{size:10,color:C.gr});
    const rr=rnd(83);
    for(let i=0;i<7;i++){ const a=i/7*2*M.PI,mx=spread*M.cos(a),my=spread*M.sin(a);
      cg.append('ellipse').attr('cx',ax.x(mx)).attr('cy',ax.y(my))
        .attr('rx',(ax.x(sd)-ax.x(0))).attr('ry',(ax.x(sd)-ax.x(0)))
        .attr('fill',api.color).attr('fill-opacity',.22).attr('stroke',api.color);
      dot(cg,ax.x(mx),ax.y(my),2.5,api.color); }
    const rec=.15+1.6*M.min(1,beta/2.2), kl=1.6/(1+beta*1.1);
    const bx=W*.56;
    txt(bg,bx,66,'ELBO = 重建项 + β·KL 项',{size:12,mono:true});
    [['重建误差 recon',rec,C.am],['KL(q‖p)',kl,C.vi]].forEach((s,i)=>{
      const y=100+i*54; txt(bg,bx,y,s[0],{size:11,color:s[2]});
      box(bg,bx,y+8,(W-bx-40)*M.min(1,s[1]/2),22,s[2],{fo:.45,rx:3});
      txt(bg,bx+(W-bx-40)*M.min(1,s[1]/2)+8,y+24,K.fmt(s[1],2),{size:10,mono:true,color:C.muted}); });
    txt(bg,bx,H-70,`总损失 = ${K.fmt(rec+beta*kl,2)}`,{size:12,bold:true});
    txt(bg,bx,H-44,beta<.4?'β 小：云散开、留洞 → 随便采一点解码出垃圾'
      :beta>2.2?'β 大：云全挤到原点 → 后验坍塌，图很糊':'平衡：云挨着但铺满先验球',
      {size:10.5,color:beta<.4||beta>2.2?C.rd:C.gr});
    info.text('编码器给一团云（均值+方差），解码器从云里采一点还原'); };
  draw(); api.slider('β（KL 的权重）',0,4,.1,1,v=>{beta=+v;draw();});
  return {stop:()=>T.stop()};
});

def('gm_gan','拉锯，不是下坡','GAN as a game','没有单一可下降的目标。参数在鞍点周围打转；把判别器调太强，生成器梯度直接消失。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let bal=1,gx=1.4,gy=.2,pts=[];
  const ax=K.axes(svg,W*.55,H,[-2,2],[-2,2]);
  const tg=g.append('g'),bg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const trail=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',1.5).attr('opacity',.7);
  const ball=dot(g,0,0,7,api.color);
  T.every(60,()=>{ /* 双人梯度：dG = -y, dD = x → 绕圈 */
    const lr=.05*bal,lrD=.05/bal;
    const nx=gx-lr*gy, ny=gy+lrD*nx; gx=nx*0.999; gy=ny*0.999;
    if(M.abs(gx)>2||M.abs(gy)>2){gx=1.4;gy=.2;pts=[];}
    pts.push([ax.x(gx),ax.y(gy)]); if(pts.length>240) pts.shift();
    trail.attr('d',d3.line()(pts)); ball.attr('cx',ax.x(gx)).attr('cy',ax.y(gy));
    bg.selectAll('*').remove();
    const bx=W*.58,Dacc=.5+.45*(1-1/(1+M.exp(3*(bal-1))))*2*0.5+.45*M.min(1,M.max(0,(bal-1)/2));
    const acc=M.min(.99,.5+.45*M.max(0,(bal-1)/1.5));
    txt(bg,bx,64,'判别器准确率 D acc',{size:11,color:C.muted});
    box(bg,bx,74,(W-bx-40),24,C.muted,{fo:.1,rx:4}); box(bg,bx,74,(W-bx-40)*acc,24,acc>.9?C.rd:C.gr,{fo:.5,rx:4});
    txt(bg,bx,116,`${(100*acc).toFixed(0)}%`,{size:12,mono:true,color:acc>.9?C.rd:C.gr});
    txt(bg,bx,150,'生成器收到的梯度',{size:11,color:C.muted});
    const gmag=M.max(.02,1-acc*1.05);
    box(bg,bx,160,(W-bx-40)*gmag,24,gmag<.15?C.rd:api.color,{fo:.5,rx:4});
    txt(bg,bx,202,gmag<.15?'D 太强 → 生成器梯度消失，学不动':'两边势均力敌 → 都在学',
      {size:11,color:gmag<.15?C.rd:C.gr});
    txt(bg,bx,232,'目标是纳什均衡，不是最低点',{size:10.5,color:C.am});
    info.text('轨迹在鞍点周围绕圈：损失下降不代表变好'); });
  K.label(svg,12,50,'参数轨迹（G 对 D）','G vs D trajectory',{size:11,color:C.muted});
  api.slider('D / G 强弱平衡',.4,3,.1,1,v=>{bal=+v;});
  api.button('重来 / reset',()=>{gx=1.4;gy=.2;pts=[];});
  return {stop:()=>T.stop()};
});

def('gm_diffusion','加噪毁掉，去噪还原','Diffusion','拖时间轴：右移一步步被雪花淹没，左移就是生成。模型学的是"这一步该减掉多少噪声"。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const n=16,cell=M.min(15,(H-140)/n);
  const base=[]; for(let i=0;i<n;i++)for(let j=0;j<n;j++){
    const d=M.hypot(i-n/2+.5,j-n/2+.5); base.push(d<n*.28?.9:(d<n*.4?.45:.08)); }
  const r0=rnd(97),noise=base.map(()=>gauss(r0));
  let t=0,auto=true,dir=1;
  const K_=40;
  const bx=(W-n*cell)/2, by=64;
  const cg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const cells=[];
  for(let i=0;i<n*n;i++){ cells.push(cg.append('rect').attr('x',bx+(i%n)*cell).attr('y',by+M.floor(i/n)*cell)
    .attr('width',cell-1).attr('height',cell-1).attr('rx',1)); }
  const bar=g.append('g');
  const draw=()=>{ const a=M.max(0,M.min(1,1-t/K_)),sa=M.sqrt(a),sb=M.sqrt(1-a);
    cells.forEach((c,i)=>{ const v=M.max(0,M.min(1,sa*base[i]+sb*(noise[i]*.35+.5)));
      c.attr('fill',api.color).attr('fill-opacity',v); });
    bar.selectAll('*').remove();
    const w=W-120; box(bar,60,H-56,w,10,C.muted,{fo:.12,rx:5});
    box(bar,60,H-56,w*t/K_,10,C.rd,{fo:.6,rx:5}); dot(bar,60+w*t/K_,H-51,7,C.am);
    txt(bar,60,H-66,'t=0 干净图',{size:10,color:C.gr}); txt(bar,60+w,H-66,'t=T 纯噪声',{anchor:'end',size:10,color:C.rd});
    txt(bar,W/2,H-24,dir>0?'正向 q(x_t | x_{t-1})：加噪，没有可学的东西'
      :'反向 p_θ(x_{t-1} | x_t)：网络预测该减掉的噪声 ε',{anchor:'middle',size:11,mono:true,color:dir>0?C.rd:C.gr});
    info.text(`步 t = ${t} / ${K_}   ${dir>0?'加噪 forward':'去噪 reverse'}`); };
  draw();
  T.every(110,()=>{ if(!auto) return; t+=dir; if(t>=K_){t=K_;dir=-1;} if(t<=0){t=0;dir=1;} draw(); });
  api.slider('时间步 t',0,K_,1,0,v=>{auto=false;const nv=+v;dir=nv>=t?1:-1;t=nv;draw();});
  api.button('自动播放 / 暂停',()=>{auto=!auto;});
  return {stop:()=>T.stop()};
});

def('gm_flow','拉橡皮泥，行列式记账','Normalizing flows','可逆变换把方格拉扁拉长。格子被撑大的地方密度变小 —— |det J| 就是体积缩放比。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let s=1,auto=true,ph=0;
  const ax=K.axes(svg,W*.55,H,[-2.5,2.5],[-2.5,2.5]);
  const gg=g.append('g'),pg=g.append('g'),bg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const r0=rnd(59),P=d3.range(160).map(()=>({x:gauss(r0)*.7,y:gauss(r0)*.7}));
  const f=(x,y)=>[x*(1+ .0)*M.exp(s*.35), y*M.exp(-s*.35) + s*.35*x*x*.35];
  const draw=()=>{ gg.selectAll('*').remove(); pg.selectAll('*').remove(); bg.selectAll('*').remove();
    for(let i=-2;i<=2;i+=.5){ const a=[],b=[];
      for(let t=-2;t<=2.001;t+=.1){ const p=f(i,t),q=f(t,i);
        a.push([ax.x(M.max(-2.5,M.min(2.5,p[0]))),ax.y(M.max(-2.5,M.min(2.5,p[1])))]);
        b.push([ax.x(M.max(-2.5,M.min(2.5,q[0]))),ax.y(M.max(-2.5,M.min(2.5,q[1])))]); }
      pathL(gg,a,C.hair,1); pathL(gg,b,C.hair,1); }
    P.forEach(p=>{ const q=f(p.x,p.y); dot(pg,ax.x(M.max(-2.5,M.min(2.5,q[0]))),ax.y(M.max(-2.5,M.min(2.5,q[1]))),3,api.color).attr('opacity',.8); });
    const detJ=M.exp(s*.35)*M.exp(-s*.35);
    const bx=W*.58;
    txt(bg,bx,70,'log p(x) = log p(z) − log|det J|',{size:12,mono:true});
    txt(bg,bx,104,`本例 |det J| = e^{+a}·e^{−a} = ${K.fmt(detJ,3)}`,{size:11,mono:true,color:C.gr});
    txt(bg,bx,130,'（一个方向拉长，另一个压扁 → 体积守恒）',{size:10,color:C.muted});
    const stretch=M.exp(s*.35);
    [['横向拉伸',stretch,C.cy],['纵向压缩',1/stretch,C.am]].forEach((r,i)=>{
      const y=170+i*46; txt(bg,bx,y,r[0]+' ×'+K.fmt(r[1],2),{size:11,color:r[2]});
      box(bg,bx,y+8,M.min(W-bx-40,(W-bx-40)*M.min(2,r[1])/2),18,r[2],{fo:.45,rx:3}); });
    txt(bg,bx,H-40,'可逆 + 行列式好算，是流模型的全部约束',{size:10.5,color:C.am});
    info.text('简单分布 → 一串可逆变换 → 复杂分布，概率精确可算'); };
  draw(); T.every(60,()=>{ if(!auto)return; ph+=.03; s=1.4*M.sin(ph); draw(); });
  api.slider('变换强度',-2,2,.05,1,v=>{auto=false;s=+v;draw();});
  api.button('自动 / 暂停',()=>{auto=!auto;});
  return {stop:()=>T.stop()};
});

def('gm_temperature','温度捏分布的尖锐度','Temperature & diversity','T→0 只剩最高柱（贪心），T=1 原样，T 大被压平接近均匀。top-p 是另一把刀：先砍尾巴再采。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T_=ticker();
  const words=['的','了','猫','跑','紫色','量子','薛定谔','嗯'],z=[3.2,2.6,2.1,1.6,.9,.4,-.2,-.8];
  let T=1,topp=1,r=rnd(107),counts=words.map(()=>0);
  const bg=g.append('g'),sg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const cur=()=>{ let p=softmax(z,M.max(.05,T));
    const idx=p.map((v,i)=>i).sort((a,b)=>p[b]-p[a]); let c=0,keep=new Set();
    for(const i of idx){ keep.add(i); c+=p[i]; if(c>=topp) break; }
    p=p.map((v,i)=>keep.has(i)?v:0); const s=d3.sum(p); return {p:p.map(v=>v/s),keep}; };
  const draw=()=>{ bg.selectAll('*').remove();
    const {p,keep}=cur(),bw=(W-100)/words.length,y0=H-90;
    words.forEach((w,i)=>{ const h=(H-190)*p[i];
      box(bg,50+i*bw,y0-h,bw-10,h,keep.has(i)?api.color:C.muted,{fo:keep.has(i)?.5:.1,rx:3});
      txt(bg,50+i*bw+(bw-10)/2,y0+18,w,{anchor:'middle',size:11,color:keep.has(i)?C.ink:C.muted});
      txt(bg,50+i*bw+(bw-10)/2,y0-h-6,K.fmt(p[i],2),{anchor:'middle',size:9,mono:true,color:C.muted}); });
    const ent=-d3.sum(p.filter(v=>v>0),v=>v*M.log2(v));
    info.text(`T = ${K.fmt(T,2)}   top-p = ${K.fmt(topp,2)}   熵 = ${K.fmt(ent,2)} bit   ${T<.2?'几乎确定（贪心）':T>2?'接近均匀（胡说）':''}`); };
  draw();
  T_.every(160,()=>{ const {p}=cur(),c=d3.cumsum(p); let u=r(),i=c.findIndex(v=>v>u); if(i<0)i=0;
    counts[i]++; sg.selectAll('*').remove();
    const tot=d3.sum(counts)||1,bw=(W-100)/words.length;
    words.forEach((w,j)=>{ box(sg,50+j*bw,H-56,(bw-10)*counts[j]/tot,10,C.gr,{fo:.55,rx:2}); });
    txt(sg,50,H-64,`实际采样频率（${tot} 次）`,{size:10,color:C.gr,mono:true}); });
  api.slider('温度 T',.05,3,.05,1,v=>{T=+v;counts=words.map(()=>0);draw();});
  api.slider('top-p',.1,1,.05,1,v=>{topp=+v;counts=words.map(()=>0);draw();});
  return {stop:()=>T_.stop()};
});

def('gm_fid','两团点云的距离','FID and its limits','FID = 中心距 + 形状差，全在特征空间里算。它看不出单张图好不好，也很吃样本量和特征网络。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let shift=1,spread=1,N=300;
  const ax=K.axes(svg,W*.55,H,[-3,4],[-3,3]);
  const r0=rnd(113);
  const dg=g.append('g'),bg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ dg.selectAll('*').remove(); bg.selectAll('*').remove();
    const r=rnd(113);
    const A=d3.range(N).map(()=>[gauss(r),gauss(r)]),
          B=d3.range(N).map(()=>[shift+gauss(r)*spread,gauss(r)*spread]);
    A.forEach(p=>dot(dg,ax.x(M.max(-3,M.min(4,p[0]))),ax.y(M.max(-3,M.min(3,p[1]))),2.6,C.gr).attr('opacity',.55));
    B.forEach(p=>dot(dg,ax.x(M.max(-3,M.min(4,p[0]))),ax.y(M.max(-3,M.min(3,p[1]))),2.6,api.color).attr('opacity',.55));
    ln(dg,ax.x(0),ax.y(0),ax.x(shift),ax.y(0),C.am,2.5); dot(dg,ax.x(0),ax.y(0),4,C.gr); dot(dg,ax.x(shift),ax.y(0),4,api.color);
    const mean2=shift*shift, tr=2*(1+spread*spread-2*spread), fid=mean2+tr;
    const bx=W*.58;
    txt(bg,bx,66,'FID = ‖μ₁−μ₂‖² + tr(Σ₁+Σ₂−2(Σ₁Σ₂)^½)',{size:10.5,mono:true});
    [['中心距² mean',mean2,C.am],['形状差 covariance',tr,C.vi]].forEach((s,i)=>{
      const y=110+i*54; txt(bg,bx,y,`${s[0]} = ${K.fmt(s[1],2)}`,{size:11,color:s[2]});
      box(bg,bx,y+8,M.min(W-bx-40,(W-bx-40)*M.min(1,s[1]/6)),20,s[2],{fo:.45,rx:3}); });
    txt(bg,bx,H-92,`FID ≈ ${K.fmt(fid,2)}  （越小越像）`,{size:13,bold:true,color:fid<.3?C.gr:C.ink});
    txt(bg,bx,H-64,`样本量 n=${N}：n 小时 FID 被系统性高估`,{size:10.5,color:N<200?C.rd:C.muted});
    txt(bg,bx,H-42,'局限：只看两团的一阶二阶矩',{size:10.5,color:C.am});
    txt(bg,bx,H-22,'FID 好 ≠ 每张图都好；换特征网络数值就不可比',{size:10.5,color:C.am});
    info.text('真图和假图丢进同一个网络取特征，再比两团高斯'); };
  draw(); api.slider('中心偏移',0,3,.05,1,v=>{shift=+v;draw();});
  api.slider('方差比例',.3,2.5,.05,1,v=>{spread=+v;draw();});
  api.slider('样本量 n',30,800,10,300,v=>{N=+v;draw();});
  return none();
});

def('gm_conditional','引导 = 沿两个方向外推','Conditional generation','ε = ε_uncond + w·(ε_cond − ε_uncond)。w=1 是纯条件；w 越大越听话，但多样性和保真度一起掉。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let w=3;
  const cx=W*.28,cy=H*.55,S=70;
  const vg=g.append('g'),bg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const am=K.arrow(svg,'gmc1',C.muted),ac=K.arrow(svg,'gmc2',C.cy),af=K.arrow(svg,'gmc3',api.color);
  const draw=()=>{ vg.selectAll('*').remove(); bg.selectAll('*').remove();
    const u=[1,-.35],c=[.55,-1.0];
    const f=[u[0]+w*(c[0]-u[0]),u[1]+w*(c[1]-u[1])];
    ln(vg,cx,cy,cx+u[0]*S,cy+u[1]*S,C.muted,2.5,{arrow:am});
    txt(vg,cx+u[0]*S+6,cy+u[1]*S,'ε 无条件',{size:10.5,color:C.muted});
    ln(vg,cx,cy,cx+c[0]*S,cy+c[1]*S,C.cy,2.5,{arrow:ac});
    txt(vg,cx+c[0]*S+6,cy+c[1]*S,'ε 有条件',{size:10.5,color:C.cy});
    const L=M.hypot(f[0],f[1]),cl=M.min(1,2.4/L);
    ln(vg,cx,cy,cx+f[0]*S*cl,cy+f[1]*S*cl,api.color,3.5,{arrow:af});
    txt(vg,cx+f[0]*S*cl+6,cy+f[1]*S*cl,`最终 (w=${K.fmt(w,1)})`,{size:11,color:api.color});
    dot(vg,cx,cy,4,C.ink);
    txt(vg,cx-40,cy+30,'x_t 当前噪声图',{size:10,color:C.muted});
    const bx=W*.56,fit=M.min(1,.25+.24*w),div=M.max(.05,1/(1+.55*w)),qual=M.max(.05,1-M.pow(M.max(0,w-6)/8,1.4));
    [['贴合条件 fidelity',fit,C.gr],['多样性 diversity',div,C.cy],['画面自然度',qual,C.am]].forEach((s,i)=>{
      const y=80+i*62; txt(bg,bx,y,`${s[0]}  ${(100*s[1]).toFixed(0)}%`,{size:11,color:s[2]});
      box(bg,bx,y+8,W-bx-40,20,C.muted,{fo:.1,rx:4}); box(bg,bx,y+8,(W-bx-40)*s[1],20,s[2],{fo:.5,rx:4}); });
    txt(bg,bx,H-56,w<1.2?'w≈1：条件几乎没起作用':w>9?'w 太大：过饱和、细节崩、全都长一个样':'常用区间 w = 3 ~ 8',
      {size:11,color:(w<1.2||w>9)?C.rd:C.gr});
    txt(bg,bx,H-30,'classifier-free guidance：训练时随机丢掉条件',{size:10.5,color:C.muted});
    info.text('引导强度是一把外推的刀，切得越狠越听话也越假'); };
  draw(); api.slider('引导强度 w',0,14,.5,3,v=>{w=+v;draw();});
  return {stop:()=>T.stop()};
});

def('gm_latent_space','潜空间里走直线','Latent space','两点之间插值，解码出的形状连续变形。方向对应属性；数据里没有的组合，走过去就是"新样本"。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let t=0,auto=true,slerp=false;
  const ax=K.axes(svg,W*.46,H,[-2.2,2.2],[-2.2,2.2]);
  const zA=[-1.5,1.1],zB=[1.4,-1.2];
  const mg=g.append('g'),dg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const r0=rnd(127);
  d3.range(90).forEach(()=>{ const x=gauss(r0),y=gauss(r0);
    dot(g,ax.x(M.max(-2.2,M.min(2.2,x))),ax.y(M.max(-2.2,M.min(2.2,y))),2.4,C.muted).attr('opacity',.35); });
  const zc=t=>{ if(!slerp) return [zA[0]+(zB[0]-zA[0])*t, zA[1]+(zB[1]-zA[1])*t];
    const a=M.atan2(zA[1],zA[0]),b=M.atan2(zB[1],zB[0]),ra=M.hypot(...zA),rb=M.hypot(...zB);
    const th=a+(b-a)*t,rr=ra+(rb-ra)*t; return [rr*M.cos(th),rr*M.sin(th)]; };
  const shape=(gsel,cx,cy,z)=>{ const pts=[];
    for(let k=0;k<80;k++){ const a=k/80*2*M.PI;
      const rr=52+14*M.sin(3*a+z[0]*1.6)+12*M.cos(2*a-z[1]*1.4)+6*z[0]*M.sin(a);
      pts.push([cx+rr*M.cos(a),cy+rr*M.sin(a)*.86]); }
    pts.push(pts[0]); pathL(gsel,pts,api.color,2.5); areaL(gsel,pts,cy,api.color,.14); };
  const draw=()=>{ mg.selectAll('*').remove(); dg.selectAll('*').remove();
    const P=d3.range(0,1.001,.02).map(u=>{const z=zc(u);return [ax.x(z[0]),ax.y(z[1])];});
    pathL(mg,P,C.am,2,{dash:'4 3'});
    [[zA,'A'],[zB,'B']].forEach(s=>{ dot(mg,ax.x(s[0][0]),ax.y(s[0][1]),7,C.gr);
      txt(mg,ax.x(s[0][0])+10,ax.y(s[0][1]),s[1],{size:12,bold:true,color:C.gr}); });
    const z=zc(t); dot(mg,ax.x(z[0]),ax.y(z[1]),7,api.color).attr('stroke',C.ink);
    shape(dg,W*.72,H*.48,z);
    txt(dg,W*.72,H*.48+96,`解码 decode(z)   t = ${K.fmt(t,2)}`,{anchor:'middle',size:11,mono:true,color:C.muted});
    txt(dg,W*.72,H*.48+118,slerp?'球面插值 slerp：留在高密度壳上':'直线插值：中途可能穿过低密度区',
      {anchor:'middle',size:10.5,color:slerp?C.gr:C.am});
    info.text('潜空间的直线 = 数据空间里的一次连续变形'); };
  draw(); T.every(50,()=>{ if(!auto)return; t+=.012; if(t>1){t=0;} draw(); });
  api.slider('插值 t',0,1,.01,0,v=>{auto=false;t=+v;draw();});
  api.button('自动 / 暂停',()=>{auto=!auto;});
  api.button('直线 / 球面插值',()=>{slerp=!slerp;draw();});
  return {stop:()=>T.stop()};
});

def('gm_protein_design','漏斗：生成便宜，验证很贵','Protein & molecule generation','模型吐十万条，每一层过滤都在收窄。真正的价值是"排在前面的那几十条命中率高"，不是产量。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let quality=.5,gen=100000,k=0;
  const stages=[['生成 generate',1,C.vi],['可合成 / 可表达',.12,C.cy],['结构打分 pLDDT',.25,api.color],
                ['结合打分 docking',.12,C.am],['湿实验验证',.02,C.gr]];
  const sg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ sg.selectAll('*').remove();
    let n=gen,maxW=W*.62,y=60;
    stages.forEach((s,i)=>{ if(i>0) n=M.max(1,M.round(n*s[1]*(i>=2?(.5+quality):1)));
      const wpx=maxW*M.max(.06,M.log10(n+1)/M.log10(gen+1));
      box(sg,W*.5-wpx/2,y,wpx,40,s[2],{fo:.35,rx:6});
      txt(sg,W*.5,y+25,`${s[0]}   ${n.toLocaleString()}`,{anchor:'middle',size:11.5,mono:true});
      if(i<stages.length-1){ const nn=M.max(1,M.round(n*stages[i+1][1]*(i+1>=2?(.5+quality):1)));
        txt(sg,W*.5+wpx/2+10,y+52,`×${K.fmt(nn/n,3)}`,{size:10,mono:true,color:C.muted}); }
      y+=54; });
    const hits=M.max(0,M.round(n*(.05+quality*.35)));
    txt(sg,W/2,H-46,`最终命中 ${hits} 条   湿实验成本 ≈ ${n} × $500 = $${(n*500).toLocaleString()}`,
      {anchor:'middle',size:12,mono:true,color:hits>0?C.gr:C.rd});
    txt(sg,W/2,H-22,'模型变好 = 同样的湿实验预算里命中更多，不是吐得更多',
      {anchor:'middle',size:11,color:C.am});
    info.text(`模型排序质量 ${(100*quality).toFixed(0)}%   生成量 ${gen.toLocaleString()}`); };
  draw(); T.every(700,()=>{ k++; sg.selectAll('rect').attr('stroke-opacity',.5+.5*(k%2)); });
  api.slider('模型排序质量',0,1,.05,.5,v=>{quality=+v;draw();});
  api.slider('生成条数（log10）',3,6,1,5,v=>{gen=M.pow(10,+v);draw();});
  return {stop:()=>T.stop()};
});

/* ============ lm 语言模型 ============ */
def('lm_tokenization','一句话被剪成碎片','Tokenization','常见词一片，生僻词碎成好几片。数字和空格的切法，就是它算不对数、数不清字母的原因。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const samples=[
    {s:'The cat sat.',t:['The',' cat',' sat','.'],note:'常见英文词：一词一片'},
    {s:'strawberry',t:['str','aw','berry'],note:'问"有几个 r"→ 它看到的是 3 块，不是 10 个字母'},
    {s:'3.14159265',t:['3','.','141','592','65'],note:'数字被切得毫无规律 → 算术天然吃亏'},
    {s:'脱氧核糖核酸',t:['脱','氧','核','糖','核','酸'],note:'中文常一字一片，同样长度更费 token'},
    {s:'  leading  spaces',t:['  ','leading','  ','spaces'],note:'空格属于 token 的一部分，多一个空格就是另一个 id'}];
  let i=0,k=0;
  const sg=g.append('g'),info=txt(g,W/2,24,'',{anchor:'middle',mono:true});
  const draw=()=>{ sg.selectAll('*').remove(); const S=samples[i];
    txt(sg,W/2,72,'"'+S.s+'"',{anchor:'middle',size:20,mono:true});
    const cols=[C.cy,api.color,C.am,C.vi,C.gr];
    let x=40; const tw=S.t.map(t=>M.max(44,t.length*13+22));
    const tot=d3.sum(tw); x=(W-tot-(S.t.length-1)*8)/2;
    S.t.forEach((t,j)=>{ const gg=chip(sg,x,130,tw[j],42,t.replace(/ /g,'·'),cols[j%5],{fo:j<k?.45:.08,size:13});
      txt(sg,x+tw[j]/2,190,'id '+(1200+j*173%9000),{anchor:'middle',size:9,mono:true,color:j<k?C.muted:'transparent'});
      x+=tw[j]+8; });
    txt(sg,W/2,H-58,`${S.t.length} 个 token`,{anchor:'middle',size:13,bold:true,color:api.color});
    txt(sg,W/2,H-30,S.note,{anchor:'middle',size:11.5,color:C.am});
    info.text('模型看不到字符，只看到词表里的编号'); };
  draw(); T.every(420,()=>{ k++; if(k>samples[i].t.length+2){k=0;i=(i+1)%samples.length;} draw(); });
  api.button('下一句 / next',()=>{i=(i+1)%samples.length;k=99;draw();});
  return {stop:()=>T.stop()};
});

def('lm_embedding','意义变成方向','Embedding space','相似度用夹角（余弦）量，不用距离。拖查询向量，看它和每个词的夹角与余弦值。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const words=[['国王',.92,.38],['王后',.86,.5],['男人',.72,-.69],['女人',.6,-.8],
               ['苹果',-.55,.83],['香蕉',-.68,.73],['汽车',-.85,-.52],['卡车',-.9,-.44]];
  const cx=W*.36,cy=H*.5,R=M.min(cx-40,cy-40);
  let qa=.3;
  g.append('circle').attr('cx',cx).attr('cy',cy).attr('r',R).attr('fill','none').attr('stroke',C.hair);
  const wg=g.append('g'),qg=g.append('g'),lg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const am=K.arrow(svg,'lme',api.color);
  const draw=()=>{ wg.selectAll('*').remove(); qg.selectAll('*').remove(); lg.selectAll('*').remove();
    const q=[M.cos(qa),M.sin(qa)];
    const sims=words.map(w=>{ const n=M.hypot(w[1],w[2]); return {w:w[0],c:(q[0]*w[1]+q[1]*w[2])/n,x:w[1]/n,y:w[2]/n}; });
    sims.forEach(s=>{ ln(wg,cx,cy,cx+s.x*R,cy-s.y*R,C.muted,1.4,{op:.4});
      dot(wg,cx+s.x*R,cy-s.y*R,5,s.c>.8?C.gr:api.color);
      txt(wg,cx+s.x*(R+14),cy-s.y*(R+14),s.w,{anchor:s.x<0?'end':'start',size:11,color:s.c>.8?C.gr:C.ink2}); });
    ln(qg,cx,cy,cx+q[0]*R,cy-q[1]*R,api.color,3,{arrow:am});
    txt(qg,cx+q[0]*R*.6,cy-q[1]*R*.6-10,'查询 query',{size:11,color:api.color});
    const bx=W*.66; txt(lg,bx,60,'余弦相似度 cos θ',{size:12,mono:true});
    sims.slice().sort((a,b)=>b.c-a.c).forEach((s,i)=>{ const y=84+i*30;
      txt(lg,bx,y+12,s.w,{size:11}); const bw=W-bx-90;
      box(lg,bx+52,y,bw*M.max(0,s.c),16,i===0?C.gr:api.color,{fo:.5,rx:3});
      txt(lg,W-34,y+12,K.fmt(s.c,2),{anchor:'end',size:10,mono:true,color:C.muted}); });
    info.text('长度不重要，方向才重要 → 检索前先归一化'); };
  draw(); api.slider('查询方向（角度）',0,6.28,.02,.3,v=>{qa=+v;draw();});
  return none();
});

def('lm_causal_mask','只许往左看','Causal mask','下三角亮，右上全黑。黑格在 softmax 前被置成 −∞，所以第 t 个位置一丝未来信息都拿不到。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const toks=['我','今','天','去','了','实','验','室'],n=toks.length;
  const cell=M.min(30,(H-140)/n),ox=W*.3,oy=70;
  let row=0,masked=true;
  const mg=g.append('g'),rg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ mg.selectAll('*').remove(); rg.selectAll('*').remove();
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){ const ok=!masked||j<=i;
      box(mg,ox+j*cell,oy+i*cell,cell-2,cell-2,ok?api.color:C.muted,{fo:ok?(i===row?.6:.28):.05,rx:2});
      if(!ok&&i===row) txt(mg,ox+j*cell+cell/2-1,oy+i*cell+cell/2+4,'−∞',{anchor:'middle',size:8,mono:true,color:C.rd}); }
    toks.forEach((t,j)=>{ txt(mg,ox+j*cell+cell/2-1,oy-8,t,{anchor:'middle',size:11,color:C.muted});
      txt(mg,ox-8,oy+j*cell+cell/2+4,t,{anchor:'end',size:11,color:j===row?api.color:C.muted}); });
    txt(mg,ox+n*cell/2,oy-30,'键 key（被看的位置）',{anchor:'middle',size:10.5,color:C.muted});
    txt(mg,ox-46,oy+n*cell/2,'查询',{anchor:'middle',size:10.5,color:C.muted});
    const bx=ox+n*cell+40;
    txt(rg,bx,oy+10,`第 ${row+1} 个 token：“${toks[row]}”`,{size:12,color:api.color});
    txt(rg,bx,oy+34,masked?`能看到 ${row+1} 个位置`:`能看到全部 ${n} 个位置`,{size:11,mono:true});
    txt(rg,bx,oy+58,masked?'训练时一次算 n 个位置的预测，':'双向：BERT 那类编码器',{size:10.5,color:C.muted});
    txt(rg,bx,oy+76,masked?'互不泄漏 → 一次前向拿 n 个监督信号':'不能直接用来自回归生成',{size:10.5,color:C.muted});
    txt(rg,bx,oy+112,masked?'去掉掩码 = 答案泄漏，loss 掉到 0':'',{size:11,color:C.rd});
    info.text(masked?'causal / 因果掩码：未来位置置 −∞':'无掩码：每个位置都看得到未来'); };
  draw(); T.every(600,()=>{ row=(row+1)%n; draw(); });
  api.button('开 / 关掩码',()=>{masked=!masked;draw();});
  return {stop:()=>T.stop()};
});

def('lm_kv_cache','备忘条越写越长','KV cache','有缓存：每步只算新 token 那一列，代价随长度线性。无缓存：每步把整段重算，代价是长度平方。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let cache=true,t=1,N=18;
  const cell=M.min(22,(W*.5)/N);
  const cg=g.append('g'),bg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ cg.selectAll('*').remove(); bg.selectAll('*').remove();
    const ox=40,oy=64;
    txt(cg,ox,oy-12,'KV 备忘条（每列 = 一个 token 的 K,V）',{size:11,color:C.muted});
    for(let j=0;j<N;j++){ const live=j<t,fresh=j===t-1,recomp=!cache&&live;
      box(cg,ox+j*cell,oy,cell-2,30,fresh?C.gr:(live?(recomp?C.am:api.color):C.muted),
        {fo:live?(fresh?.65:(recomp?.5:.3)):.05,rx:2}); }
    txt(cg,ox,oy+52,cache?'灰=还没生成  蓝=缓存里直接取  绿=本步新算的一列'
      :'橙=本步重新算了一遍（浪费）  绿=新 token',{size:10.5,color:C.muted});
    const flops=cache?t:t*t, tot=cache?t*(t+1)/2:d3.sum(d3.range(1,t+1),k=>k*k);
    const bx=W*.62;
    txt(bg,bx,72,`当前第 ${t} 步`,{size:12});
    txt(bg,bx,98,cache?`本步算 1 列 → O(t) 注意力`:`本步重算 ${t} 列 → O(t²)`,{size:11,mono:true,color:cache?C.gr:C.rd});
    txt(bg,bx,130,'累计计算量',{size:11,color:C.muted});
    const mx=d3.sum(d3.range(1,N+1),k=>k*k);
    box(bg,bx,140,(W-bx-40)*tot/mx,20,cache?C.gr:C.rd,{fo:.5,rx:4});
    txt(bg,bx,178,`${tot}  单位  （无缓存全程 ${mx}）`,{size:10.5,mono:true,color:C.muted});
    txt(bg,bx,214,'代价：显存里要存 2·层数·头数·头维·长度',{size:10.5,color:C.am});
    txt(bg,bx,234,'长上下文时 KV cache 常比权重还大',{size:10.5,color:C.am});
    txt(bg,bx,262,'→ MQA / GQA / 量化 KV 都是在省这块',{size:10.5,color:C.muted});
    info.text(cache?'有 KV cache：只算新的一列':'没有 cache：每步把整段重来一遍'); };
  draw(); T.every(320,()=>{ t++; if(t>N)t=1; draw(); });
  api.button('开 / 关 KV cache',()=>{cache=!cache;t=1;draw();});
  return {stop:()=>T.stop()};
});

def('lm_context_window','长纸带，两头亮中间暗','Context window','把答案埋在不同位置，看命中率。开头和结尾好找，中间掉得最狠 —— 窗口大 ≠ 都用得上。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let pos=.5,len=32,k=0;
  const tg=g.append('g'),cg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const acc=p=>M.max(.28,M.min(.98,.97-.72*M.exp(-M.pow((p-0)/.16,2))*0 + 0)) ;
  const curve=p=>{ const edge=M.max(M.exp(-M.pow(p/.14,2)),M.exp(-M.pow((1-p)/.11,2))); return .42+.55*edge; };
  const draw=()=>{ tg.selectAll('*').remove(); cg.selectAll('*').remove();
    const ox=50,ow=W-100,oy=70,cw=ow/len;
    for(let j=0;j<len;j++){ const p=j/(len-1),lit=curve(p);
      box(tg,ox+j*cw,oy,cw-1.5,34,api.color,{fo:.06+.5*(lit-.42)/.55,rx:2}); }
    const jx=M.round(pos*(len-1));
    box(tg,ox+jx*cw-1,oy-4,cw+1,42,C.am,{fo:0,stroke:C.am,sw:2,rx:4});
    txt(tg,ox+jx*cw+cw/2,oy-12,'答案埋在这里',{anchor:'middle',size:10,color:C.am});
    txt(tg,ox,oy+52,'开头',{size:10,color:C.gr}); txt(tg,ox+ow,oy+52,'结尾',{anchor:'end',size:10,color:C.gr});
    txt(tg,ox+ow/2,oy+52,'中间（最容易被忽略）',{anchor:'middle',size:10,color:C.rd});
    /* 命中率曲线 */
    const y0=H-60,hh=H-210;
    const P=d3.range(0,1.001,.02).map(p=>[ox+p*ow,y0-hh*(curve(p)-.35)/.65]);
    pathL(cg,P,C.ink2,2); areaL(cg,P,y0,C.ink2,.1);
    const a=curve(pos); dot(cg,ox+pos*ow,y0-hh*(a-.35)/.65,7,C.am);
    txt(cg,ox,y0-hh-8,'命中率 accuracy',{size:10.5,color:C.muted});
    txt(cg,W/2,H-22,`窗口 ${len}k tokens   答案在 ${(100*pos).toFixed(0)}% 处   命中率 ≈ ${(100*a).toFixed(0)}%`,
      {anchor:'middle',size:12,mono:true,color:a<.6?C.rd:C.gr});
    info.text('把关键信息放开头或结尾；别指望它在中间自己找到'); };
  draw(); T.every(90,()=>{ k++; pos=(M.sin(k/40)+1)/2; draw(); });
  api.slider('答案位置',0,1,.01,.5,v=>{pos=+v;draw();});
  api.slider('窗口长度 (k tokens)',8,128,8,32,v=>{len=+v;draw();});
  return {stop:()=>T.stop()};
});

def('lm_finetune_vs_prompt','三个旋钮，各修各的病','Finetune vs prompt','格式不对拧微调，事实缺失拧检索，能力不够换模型。拧错旋钮 = 花钱不解决问题。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const knobs=[['提示 / 微调','说话方式、输出格式',C.cy,'format'],
               ['检索 RAG','事实、你的私有资料',C.am,'fact'],
               ['换模型 / 加算力','推理与能力上限',C.vi,'ability']];
  const probs=[['输出老是不按 JSON 格式','format'],['编造了不存在的文献','fact'],
               ['多步推理算错了','ability'],['不知道我们公司内部流程','fact'],
               ['语气太啰嗦不像我们品牌','format'],['解不了这道竞赛题','ability']];
  let pi=0,picked=null;
  const kg=g.append('g'),pg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ kg.selectAll('*').remove(); pg.selectAll('*').remove();
    const want=probs[pi][1];
    txt(pg,W/2,64,'症状：'+probs[pi][0],{anchor:'middle',size:15,bold:true});
    knobs.forEach((k,i)=>{ const cx=W*(.2+i*.3),cy=H*.52,ok=picked===k[3],right=k[3]===want;
      const ang=ok?(right?-.9:.9):0;
      kg.append('circle').attr('cx',cx).attr('cy',cy).attr('r',44)
        .attr('fill',k[2]).attr('fill-opacity',ok?(right?.4:.18):.12).attr('stroke',ok?(right?C.gr:C.rd):k[2]).attr('stroke-width',ok?3:1.5)
        .style('cursor','pointer').on('click',()=>{picked=k[3];draw();});
      ln(kg,cx,cy,cx+40*M.sin(ang),cy-40*M.cos(ang),ok?(right?C.gr:C.rd):C.ink2,3);
      txt(kg,cx,cy+66,k[0],{anchor:'middle',size:12,bold:true,color:k[2]});
      txt(kg,cx,cy+84,k[1],{anchor:'middle',size:10,color:C.muted}); });
    if(picked) txt(pg,W/2,H-34,picked===want?'对：这个旋钮正好治这个症状'
      :'不对：拧这个旋钮不会让症状消失，只会烧钱',{anchor:'middle',size:12.5,color:picked===want?C.gr:C.rd});
    else txt(pg,W/2,H-34,'点一个旋钮试试',{anchor:'middle',size:11.5,color:C.muted});
    info.text('先分类症状，再选手段'); };
  draw(); api.button('下一个症状 / next',()=>{pi=(pi+1)%probs.length;picked=null;draw();});
  return {stop:()=>T.stop()};
});

def('lm_rag','向量球里找最近邻','RAG retrieval','问题落成一个点，取夹角最近的几块文档塞进上下文。召回不到，生成端一定编。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const r0=rnd(151);
  const docs=d3.range(60).map(i=>({x:gauss(r0),y:gauss(r0),id:i,gold:false}));
  docs[7].x=1.5; docs[7].y=.9; docs[7].gold=true;
  let k=4,qx=1.2,qy=.7,drift=0;
  const ax=K.axes(svg,W*.55,H,[-3,3],[-3,3]);
  const dg=g.append('g'),qg=g.append('g'),lg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const draw=()=>{ dg.selectAll('*').remove(); qg.selectAll('*').remove(); lg.selectAll('*').remove();
    const q={x:qx+drift,y:qy};
    const sorted=docs.map(d=>({...d,dist:M.hypot(d.x-q.x,d.y-q.y)})).sort((a,b)=>a.dist-b.dist);
    const top=sorted.slice(0,k),ids=new Set(top.map(d=>d.id));
    docs.forEach(d=>dot(dg,ax.x(M.max(-3,M.min(3,d.x))),ax.y(M.max(-3,M.min(3,d.y))),
      d.gold?6:3.4,d.gold?C.gr:(ids.has(d.id)?api.color:C.muted)).attr('opacity',ids.has(d.id)||d.gold?1:.35));
    top.forEach(d=>ln(dg,ax.x(q.x),ax.y(q.y),ax.x(M.max(-3,M.min(3,d.x))),ax.y(M.max(-3,M.min(3,d.y))),api.color,1.4,{op:.6}));
    const rr=M.abs(ax.x(top[k-1].dist)-ax.x(0));
    dg.append('circle').attr('cx',ax.x(q.x)).attr('cy',ax.y(q.y)).attr('r',rr)
      .attr('fill','none').attr('stroke',api.color).attr('stroke-dasharray','4 3');
    dot(qg,ax.x(q.x),ax.y(q.y),7,C.am).attr('stroke',C.ink);
    txt(qg,ax.x(q.x)+10,ax.y(q.y)-10,'问题 query',{size:11,color:C.am});
    const hit=ids.has(7),bx=W*.6;
    txt(lg,bx,66,`取回 top-${k} 块文档`,{size:12,mono:true});
    top.forEach((d,i)=>{ const y=92+i*26; if(i>7)return;
      chip(lg,bx,y-14,W-bx-40,22,`doc#${d.id}${d.gold?'  ← 正确答案就在这块':''}   d=${K.fmt(d.dist,2)}`,
        d.gold?C.gr:api.color,{size:10}); });
    txt(lg,bx,H-72,hit?'召回命中 → 模型有据可依':'召回失败 → 模型没有依据',{size:12.5,bold:true,color:hit?C.gr:C.rd});
    txt(lg,bx,H-48,hit?'生成端只需要抄和整合':'它不会说"我不知道"，只会顺着编',{size:11,color:hit?C.muted:C.rd});
    txt(lg,bx,H-24,'先修召回率，再谈提示词',{size:10.5,color:C.am});
    info.text('RAG 的成败在检索，不在生成'); };
  draw(); T.every(70,()=>{ drift=1.6*M.sin(Date.now()/1400); draw(); });
  api.slider('取回条数 k',1,8,1,4,v=>{k=+v;draw();});
  return {stop:()=>T.stop()};
});

def('lm_hallucination','最像话的那条路','Why hallucination','每步都选概率最高的词，路上没有任何"真假"标记。事实和瞎编在模型眼里是同一种连贯。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  const steps=[[['Hinton',.55,1],['LeCun',.3,1],['Schmidhuber',.15,1]],
               [['在 2012 年',.62,1],['在 2006 年',.28,1],['在 1998 年',.10,0]],
               [['发表了',.7,1],['获得了',.3,1]],
               [['《ImageNet 分类》',.34,1],['《Attention Is All You Need》',.33,0],['《深度学习综述》',.33,0]]];
  let k=0,path=[],r=rnd(163),greedy=true;
  const cg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  const step=()=>{ if(k>=steps.length){ k=0; path=[]; }
    const L=steps[k]; let idx;
    if(greedy) idx=0; else { const c=d3.cumsum(L.map(d=>d[1])); let u=r(); idx=c.findIndex(v=>v>u); if(idx<0)idx=0; }
    path.push(idx); k++;
    cg.selectAll('*').remove();
    const colw=(W-70)/steps.length;
    steps.forEach((L,i)=>{ L.forEach((d,j)=>{
        const x=40+i*colw,y=76+j*54,on=i<path.length&&path[i]===j;
        box(cg,x,y,colw-18,40,on?(d[2]?C.gr:C.rd):C.muted,{fo:on?.45:.08,rx:6});
        txt(cg,x+(colw-18)/2,y+18,d[0],{anchor:'middle',size:10.5,color:on?C.ink:C.muted});
        txt(cg,x+(colw-18)/2,y+33,'p='+K.fmt(d[1],2),{anchor:'middle',size:9,mono:true,color:C.muted});
        if(on&&i>0){ const py=76+path[i-1]*54+20; ln(cg,40+(i-1)*colw+colw-18,py,x,y+20,api.color,2); } }); });
    const bad=path.some((j,i)=>steps[i][j][2]===0);
    txt(cg,W/2,H-52,path.map((j,i)=>steps[i][j][0]).join(' '),{anchor:'middle',size:13,color:bad?C.rd:C.gr});
    txt(cg,W/2,H-26,bad?'这句话同样流畅、同样自信，但里面有一处是编的'
      :'这次恰好都对 —— 但模型自己并不知道这件事',{anchor:'middle',size:11,color:bad?C.rd:C.am});
    info.text(`${greedy?'贪心解码':'按概率采样'}：目标是"最像话"，不是"是真的"`); };
  step(); T.every(900,step);
  api.button('贪心 / 采样',()=>{greedy=!greedy;k=0;path=[];step();});
  return {stop:()=>T.stop()};
});

def('lm_eval_align','先有尺子，再谈调','Eval & alignment','没有评测集，改动只能靠感觉：左边是凭感觉的随机游走，右边是有尺子的爬坡。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=ticker();
  let r=rnd(173),a=[.5],b=[.5];
  const x=d3.scaleLinear().domain([0,60]).range([50,W-50]),y=d3.scaleLinear().domain([0,1]).range([H-80,60]);
  g.append('g').attr('transform',`translate(0,${H-80})`).call(d3.axisBottom(x).ticks(6))
    .call(s=>s.selectAll('text').attr('fill',C.muted).attr('font-size',10)).call(s=>s.selectAll('line,path').attr('stroke',C.hair));
  g.append('g').attr('transform','translate(50,0)').call(d3.axisLeft(y).ticks(5))
    .call(s=>s.selectAll('text').attr('fill',C.muted).attr('font-size',10)).call(s=>s.selectAll('line,path').attr('stroke',C.hair));
  const pg=g.append('g'),lg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  T.every(180,()=>{ if(a.length>60){a=[.5];b=[.5];}
    a.push(M.max(.05,M.min(.95,a[a.length-1]+gauss(r)*.06)));
    const cand=b[b.length-1]+gauss(r)*.08; b.push(M.max(.05,M.min(.97,cand>b[b.length-1]?cand:b[b.length-1])));
    pg.selectAll('*').remove(); lg.selectAll('*').remove();
    pathL(pg,a.map((v,i)=>[x(i),y(v)]),C.rd,2.2);
    pathL(pg,b.map((v,i)=>[x(i),y(v)]),C.gr,2.6);
    dot(pg,x(a.length-1),y(a[a.length-1]),5,C.rd); dot(pg,x(b.length-1),y(b[b.length-1]),5,C.gr);
    txt(lg,W-60,y(a[a.length-1])-10,'凭感觉改',{anchor:'end',size:11,color:C.rd});
    txt(lg,W-60,y(b[b.length-1])-10,'有评测集：只接受涨的改动',{anchor:'end',size:11,color:C.gr});
    txt(lg,50,44,'能力 / 满意度',{size:10.5,color:C.muted});
    txt(lg,W/2,H-46,`第 ${a.length} 次改动   凭感觉 ${K.fmt(a[a.length-1],2)}   有尺子 ${K.fmt(b[b.length-1],2)}`,
      {anchor:'middle',size:11.5,mono:true});
    txt(lg,W/2,H-22,'对齐（SFT/RLHF/DPO）调的是偏好和风格，不是往里塞知识',
      {anchor:'middle',size:11,color:C.am});
    info.text('先花两天做 50 条评测集，比调三周提示词值'); });
  api.button('重来 / reset',()=>{a=[.5];b=[.5];r=rnd(1+M.floor(M.random()*9999));});
  return {stop:()=>T.stop()};
});

def('lm_research_use','只在能验证的那半边用','Using LLMs in research','把任务拖到分界线两侧。左边（你能一眼查证）用它加速；右边（验证成本比自己做还高）别用。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const tasks=[['把这段代码改成向量化','L'],['列 10 个可能的实验对照','L'],['给这段方法写英文润色','L'],
               ['报一个具体文献的 p 值','R'],['总结我贴的这篇 PDF','L'],['判断这个通路是否已知','R'],
               ['生成 50 条候选引物','L'],['告诉我这个基因的最新功能','R']];
  const pos=tasks.map((t,i)=>({t:t[0],side:t[1],x:W*.5+(t[1]==='L'?-1:1)*(60+((i*37)%90)),y:70+i*((H-140)/8),drag:false}));
  const lg=g.append('g'),tg=g.append('g'),info=txt(g,W/2,22,'',{anchor:'middle',mono:true});
  ln(lg,W/2,50,W/2,H-46,C.am,2.5,{dash:'6 4'});
  txt(lg,W*.25,50,'能被你快速验证',{anchor:'middle',size:12.5,color:C.gr});
  txt(lg,W*.75,50,'验证比自己做还贵',{anchor:'middle',size:12.5,color:C.rd});
  const draw=()=>{ tg.selectAll('*').remove();
    pos.forEach(p=>{ const now=p.x<W/2?'L':'R',ok=now===p.side;
      const gg=tg.append('g').attr('transform',`translate(${p.x},${p.y})`).style('cursor','grab');
      box(gg,-96,-13,192,26,now==='L'?C.gr:C.rd,{fo:.22,rx:13});
      txt(gg,0,5,p.t,{anchor:'middle',size:10.5});
      if(!ok) gg.append('circle').attr('cx',104).attr('cy',0).attr('r',5).attr('fill',C.am);
      gg.call(d3.drag().on('drag',ev=>{ p.x=M.max(110,M.min(W-110,ev.x)); p.y=M.max(64,M.min(H-56,ev.y)); draw(); })); });
    const wrong=pos.filter(p=>(p.x<W/2?'L':'R')!==p.side).length;
    txt(tg,W/2,H-24,wrong?`还有 ${wrong} 条放错了（右侧小圆点标出）`:'全部归位：这就是安全用法的边界',
      {anchor:'middle',size:12,color:wrong?C.am:C.gr});
    info.text('不能验证的输出一律不要 —— 这是唯一一条硬规则'); };
  draw(); api.button('一键归位 / snap',()=>{ pos.forEach((p,i)=>{p.x=W*.5+(p.side==='L'?-1:1)*130;p.y=70+i*((H-140)/8);}); draw(); });
  return none();
});

})();
