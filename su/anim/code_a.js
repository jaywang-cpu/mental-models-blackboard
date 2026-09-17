/* anim/code_a.js — 代码宇宙 py / np / vz / da 动画（32 个 key）
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
  .attr('stroke',color).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null).attr('marker-end',o.arrow||null);
const box=(sel,x,y,w,h,color,o={})=>sel.append('rect').attr('x',x).attr('y',y).attr('width',w).attr('height',h)
  .attr('fill',o.fill||color).attr('fill-opacity',o.fo==null?.18:o.fo).attr('stroke',color).attr('stroke-width',o.sw||1.5).attr('rx',o.rx==null?4:o.rx);
const dot=(sel,x,y,r,color)=>sel.append('circle').attr('cx',x).attr('cy',y).attr('r',r).attr('fill',color);
/* 单元格：带数字的小方块 */
const cell=(sel,x,y,s,v,color,o={})=>{ const g=sel.append('g').attr('transform',`translate(${x},${y})`);
  box(g,0,0,s,s,color,{fo:o.fo==null?.22:o.fo,rx:3}); if(v!=null) txt(g,s/2,s/2+4,String(v),{anchor:'middle',size:o.size||11,mono:true,color:o.tc||C.ink}); return g; };
/* 简单定时器管理：返回 {every(ms,fn), stop} */
const timers=()=>{ const ids=[]; return { every(ms,fn){ const id=setInterval(fn,ms); ids.push(id); return id; },
  after(ms,fn){ const id=setTimeout(fn,ms); ids.push(id); return id; }, stop(){ ids.forEach(i=>{clearInterval(i);clearTimeout(i);}); } }; };
/* 用 api.play 驱动的动画：返回 {stop} */
const playing=(api,fn)=>{ const s=api.play(fn); return {stop(){ if(typeof s==='function') s(); }}; };
const code=(sel,x,y,lines,o={})=>lines.map((l,i)=>txt(sel,x,y+i*(o.lh||18),l,{mono:true,size:o.size||12,color:o.color||C.ink2}));
const def=(key,title,en,cap,make)=>{ A[key]={title,en,cap,make}; };

/* ============ py Python ============ */
def('py_list_dict','list 连续格 vs dict 哈希桶','list vs dict','list 按下标走连续格子；dict 把 key 哈希成桶号一步跳过去。点按钮看两种查找。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),s=44,n=8;
  const lx=60,ly=70,dx=60,dy=210,keys=['a','b','c','d','e','f','g','h'],vals=[3,1,4,1,5,9,2,6];
  K.label(svg,lx,ly-24,'list：连续格子，下标 = 偏移','list: contiguous, index = offset');
  K.label(svg,dx,dy-24,'dict：hash(key) → 桶号，直接跳','dict: hash(key) -> bucket, one jump');
  const lc=d3.range(n).map(i=>cell(g,lx+i*(s+6),ly,s,vals[i],C.muted,{fo:.12})); d3.range(n).forEach(i=>txt(g,lx+i*(s+6)+s/2,ly+s+14,'['+i+']',{anchor:'middle',size:10,color:C.muted,mono:true}));
  const dc=d3.range(n).map(i=>cell(g,dx+i*(s+6),dy,s,null,C.muted,{fo:.12})); const hm={}; keys.forEach((k,i)=>{ hm[k]=(i*5+3)%n; });
  keys.forEach(k=>txt(g,dx+hm[k]*(s+6)+s/2,dy+s/2+4,k+':'+vals[keys.indexOf(k)],{anchor:'middle',size:10,mono:true}));
  const cur=g.append('rect').attr('width',s).attr('height',s).attr('fill','none').attr('stroke',api.color).attr('stroke-width',3).attr('rx',4).attr('opacity',0);
  const msg=txt(g,W/2,H-16,'',{anchor:'middle',size:12,color:api.color,mono:true});
  const findList=()=>{ T.stop(); let i=0; const tgt=5; cur.attr('opacity',1); T.every(220,()=>{ cur.attr('x',lx+i*(s+6)).attr('y',ly); msg.text(`list[${tgt}]：直接算地址 → 1 步；但找值 9 要挨个看：${i+1} 步`); if(i>=tgt){T.stop();} i++; }); };
  const findDict=()=>{ T.stop(); const k='f',b=hm[k]; cur.attr('opacity',1).attr('x',dx).attr('y',dy-60); msg.text(`hash('${k}') = ${b}`);
    T.after(350,()=>{ cur.transition().duration(400).attr('x',dx+b*(s+6)).attr('y',dy); msg.text(`hash('${k}') = ${b} → 桶 ${b} → 值 ${vals[keys.indexOf(k)]}，1 步`); }); };
  api.button('list 找值 / list scan',findList); api.button('dict 查 key / dict lookup',findDict); findList();
  return {stop(){T.stop();}};
});

def('py_loop_comprehension','推导式 = 流过过滤器','Comprehension as filter','[x*x for x in xs if x%2==0]：元素逐个流过 if 闸门，通过的再被 x*x 变形。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),xs=d3.range(1,11),y=H/2,gate=W*.42,mapx=W*.66,out=W*.86;
  code(svg,16,22,['ys = [x*x  for x in xs  if x%2==0]']);
  box(g,gate-22,y-40,44,80,C.am); K.label(g,gate,y+62,'if 过滤','filter',{anchor:'middle',size:11});
  box(g,mapx-22,y-40,44,80,api.color); K.label(g,mapx,y+62,'x*x 变形','map',{anchor:'middle',size:11});
  K.label(g,out,y-60,'ys','output',{anchor:'middle',size:11}); ln(g,30,y,W-30,y,C.hair,1);
  const outs=[]; let k=0,t0=0;
  const items=xs.map(v=>({v,x:30,alive:true,done:false,el:null}));
  const draw=()=>{ g.selectAll('g.it').remove(); items.forEach(it=>{ if(!it.alive&&it.done) return; const gg=g.append('g').attr('class','it').attr('transform',`translate(${it.x},${it.y||y})`);
    gg.append('circle').attr('r',13).attr('fill',it.mapped?api.color:it.v%2?C.rd:C.gr).attr('fill-opacity',.9); txt(gg,0,4,it.mapped?it.v*it.v:it.v,{anchor:'middle',size:11,mono:true,bold:true}); }); };
  return playing(api,t=>{ items.forEach((it,i)=>{ const st=i*.55; if(t<st||it.done) return; it.x=30+(t-st)*150;
    if(it.x>gate&&it.v%2){ it.y=(it.y||y)+6; it.alive=false; if(it.y>H-20) it.done=true; }
    else { it.y=y; if(it.x>mapx&&!it.mapped) it.mapped=true; if(it.x>out){ it.done=true; it.x=out; outs.push(it.v*it.v); } } });
    draw(); g.selectAll('text.o').remove(); txt(g,out,y+4,'['+outs.join(',')+']',{anchor:'middle',size:11,mono:true,color:api.color}).attr('class','o'); });
});

def('py_function','函数 = 黑箱 + 作用域盒','Function as black box','输入进箱，出口只有 return。箱内变量在盒外看不见。拉滑杆改输入。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),bx=W/2-90,by=70,bw=180,bh=150,mk=K.arrow(svg,'pyfn',api.color);
  code(svg,16,22,['def f(x):','    y = x*2 + 1','    return y']);
  box(g,bx,by,bw,bh,api.color,{fo:.08}); K.label(g,bx+bw/2,by+bh+20,'局部作用域：x, y 只活在盒内','local scope: x, y live only inside',{anchor:'middle',size:11});
  ln(g,40,by+bh/2,bx-6,by+bh/2,api.color,2,{arrow:mk}); ln(g,bx+bw+4,by+bh/2,W-60,by+bh/2,C.gr,2,{arrow:mk});
  const inT=txt(g,40,by+bh/2-12,'',{mono:true,size:13}),xT=txt(g,bx+20,by+40,'',{mono:true,size:13}),yT=txt(g,bx+20,by+70,'',{mono:true,size:13}),rT=txt(g,bx+bw+12,by+bh/2-12,'',{mono:true,size:13,color:C.gr});
  const outer=txt(g,W-160,H-20,'print(y)  # NameError：盒外没有 y',{mono:true,size:11,color:C.rd});
  const ball=dot(g,40,by+bh/2,8,api.color); let x=3;
  const run=()=>{ inT.text('f('+x+')'); xT.text('x = '+x); yT.text('y = '+(x*2+1)); rT.text('→ '+(x*2+1));
    ball.attr('cx',40).attr('fill',api.color).transition().duration(600).attr('cx',bx+bw/2).transition().duration(600).attr('cx',W-60).attr('fill',C.gr); };
  run(); api.slider('输入 x / input',-5,10,1,3,v=>{x=+v;run();}); return none();
});

def('py_recursion','递归：调用栈叠起再弹出','Call stack','fact(4) 先一层层压栈到 fact(0)，再一层层带着结果弹出。点"步进"。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),n=4,fw=170,fh=34,x0=W*.6;
  code(svg,16,22,['def fact(n):','    if n==0: return 1','    return n*fact(n-1)']);
  K.label(svg,x0+fw/2,H-12,'栈：后进先出','stack: LIFO',{anchor:'middle',size:11});
  const steps=[]; for(let i=n;i>=0;i--) steps.push({push:i}); for(let i=0;i<=n;i++) steps.push({pop:i});
  let k=0,stack=[],res={};
  const draw=(m)=>{ g.selectAll('*').remove(); stack.forEach((v,i)=>{ const y=H-40-(i+1)*(fh+4),gg=g.append('g').attr('transform',`translate(${x0},${y})`);
    box(gg,0,0,fw,fh,i===stack.length-1?api.color:C.muted,{fo:i===stack.length-1?.3:.12}); txt(gg,10,22,`fact(${v})`+(res[v]!=null?` = ${res[v]}`:' 等待…'),{mono:true,size:12}); });
    txt(g,x0+fw/2,H-40-(stack.length)*(fh+4)-10,m||'',{anchor:'middle',size:11,color:C.am}); };
  const step=()=>{ if(k>=steps.length){k=0;stack=[];res={};} const s=steps[k++];
    if(s.push!=null){ stack.push(s.push); draw(s.push===0?'n==0 → 触底 return 1':`fact(${s.push}) 需要 fact(${s.push-1})，压栈`); }
    else { res[s.pop]=s.pop===0?1:s.pop*res[s.pop-1]; draw(`fact(${s.pop}) = ${res[s.pop]}，弹出`); if(s.pop<n) setTimeout(()=>{stack.pop();draw(`fact(${s.pop})=${res[s.pop]} 回给上一层`);},350); } };
  draw('点"步进"开始'); api.button('步进 / step',step); return none();
});

def('py_class','类 = 模板，实例 = 盖章','Class and instances','同一个 class 盖出多个对象：方法共享，属性各自一份。点"new"。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),names=['Tom','Ann','Bob','Lee','Max'];
  code(svg,16,22,['class Dog:','  def __init__(self,name):','    self.name=name','  def bark(self): ...']);
  const tx=W*.22,ty=180; box(g,tx-60,ty-50,120,100,C.am,{fo:.1}); K.label(g,tx,ty-20,'Dog 模板','class',{anchor:'middle'}); txt(g,tx,ty+15,'bark() 共享',{anchor:'middle',size:11,color:C.muted,mono:true});
  const inst=g.append('g'); let k=0;
  const stamp=()=>{ if(k>=names.length){inst.selectAll('*').remove();k=0;} const i=k++,x=W*.45+(i%3)*110,y=110+M.floor(i/3)*110;
    const gg=inst.append('g').attr('transform',`translate(${tx},${ty}) scale(.3)`).attr('opacity',.2);
    box(gg,-45,-38,90,76,api.color,{fo:.25}); txt(gg,0,-12,'Dog',{anchor:'middle',size:10,color:C.muted,mono:true}); txt(gg,0,8,`name='${names[i]}'`,{anchor:'middle',size:10,mono:true}); txt(gg,0,26,'bark → 模板',{anchor:'middle',size:9,color:C.am,mono:true});
    gg.transition().duration(600).attr('transform',`translate(${x},${y}) scale(1)`).attr('opacity',1); };
  api.button('new Dog() / stamp',stamp); stamp(); T.after(700,stamp);
  K.label(svg,W*.45,H-14,'属性各自存，方法只存一份在类上','attrs per-instance, methods live on the class',{size:11});
  return {stop(){T.stop();}};
});

def('py_bigo','大 O 曲线赛跑','Big-O race','n 增大时 log n / n / n log n / n² / 2ⁿ 谁先冲出天花板。拉 n。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const fs=[{n:'log n',f:x=>M.log2(x+1),c:C.gr},{n:'n',f:x=>x,c:C.cy},{n:'n log n',f:x=>x*M.log2(x+1),c:C.am},{n:'n²',f:x=>x*x,c:C.vi},{n:'2ⁿ',f:x=>M.pow(2,x),c:C.rd}];
  const draw=N=>{ g.selectAll('*').remove(); const ax=K.axes(g,W,H,[0,N],[0,M.max(4,N*N)]);
    fs.forEach(o=>{ const pts=d3.range(0,N+.01,N/120).map(x=>[x,M.min(o.f(x),N*N*1.05)]); g.append('path').attr('d',d3.line().x(p=>ax.x(p[0])).y(p=>ax.y(p[1]))(pts)).attr('fill','none').attr('stroke',o.c).attr('stroke-width',2.2);
      const last=pts[pts.length-1]; txt(g,ax.x(last[0])+4,ax.y(last[1])+4,o.n,{color:o.c,mono:true,size:11}); });
    K.label(g,50,26,`n = ${N}：y 轴上限 n²`,'y capped at n²',{size:12}); txt(g,W-40,H-10,'n',{anchor:'end',color:C.muted}); };
  draw(10); api.slider('n',4,40,1,10,v=>draw(+v)); return none();
});

def('py_string','字符串切片高亮','String slicing','s[a:b:step]：从 a 到 b（不含 b），每 step 取一个。拉三根滑杆看选中哪些字符。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),s='PYTHONIC',n=s.length,cw=M.min(52,(W-80)/n),x0=(W-cw*n)/2,y0=110;
  let a=0,b=n,st=1;
  const draw=()=>{ g.selectAll('*').remove(); const pick=new Set(); if(st>0) for(let i=a;i<b;i+=st) pick.add(i); else for(let i=a;i>b;i+=st) pick.add(i);
    s.split('').forEach((ch,i)=>{ cell(g,x0+i*cw,y0,cw-4,ch,pick.has(i)?api.color:C.muted,{fo:pick.has(i)?.45:.1,size:16}); txt(g,x0+i*cw+cw/2-2,y0+cw+12,i,{anchor:'middle',size:10,color:C.muted,mono:true}); txt(g,x0+i*cw+cw/2-2,y0-8,i-n,{anchor:'middle',size:10,color:C.muted,mono:true}); });
    const r=[]; pick.forEach(i=>r.push(i)); r.sort((p,q)=>st>0?p-q:q-p); txt(g,W/2,y0+cw+60,`s[${a}:${b}:${st}] = '${r.map(i=>s[i]).join('')}'`,{anchor:'middle',size:16,mono:true,color:api.color});
    K.label(g,W/2,H-30,'上排负下标，下排正下标；b 不含','top: negative index; b excluded',{anchor:'middle',size:11}); };
  draw(); api.slider('a 起',0,n,1,0,v=>{a=+v;draw();}); api.slider('b 止',0,n,1,n,v=>{b=+v;draw();}); api.slider('step',-3,3,1,1,v=>{st=+v||1;draw();}); return none();
});

def('py_debug','单步：变量随行变','Step debugger','高亮当前行，右侧变量表实时更新。看不懂就 print 或单步，别猜。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers();
  const lines=['total = 0','for i in range(1,4):','    total += i*i','print(total)'];
  const trace=[{l:0,v:{total:0}},{l:1,v:{total:0,i:1}},{l:2,v:{total:1,i:1}},{l:1,v:{total:1,i:2}},{l:2,v:{total:5,i:2}},{l:1,v:{total:5,i:3}},{l:2,v:{total:14,i:3}},{l:3,v:{total:14,i:3},out:'14'}];
  let k=0; const draw=()=>{ g.selectAll('*').remove(); const t=trace[k];
    lines.forEach((s,i)=>{ if(i===t.l) box(g,20,40+i*26-16,W*.55,24,api.color,{fo:.25,sw:0}); txt(g,30,40+i*26,`${i+1}  ${s}`,{mono:true,size:13,color:i===t.l?C.ink:C.ink2}); });
    K.label(g,W*.66,30,'变量表','variables'); Object.entries(t.v).forEach(([kk,vv],i)=>{ box(g,W*.66,48+i*30,120,26,C.muted,{fo:.12}); txt(g,W*.66+8,66+i*30,`${kk} = ${vv}`,{mono:true,size:13,color:kk==='total'?api.color:C.ink}); });
    if(t.out) txt(g,30,H-20,'>>> '+t.out,{mono:true,size:14,color:C.gr}); txt(g,W-16,H-16,`step ${k+1}/${trace.length}`,{anchor:'end',mono:true,size:11,color:C.muted}); };
  draw(); api.button('单步 / step',()=>{k=(k+1)%trace.length;draw();}); api.button('自动 / auto',()=>{T.stop();T.every(700,()=>{k=(k+1)%trace.length;draw();});});
  return {stop(){T.stop();}};
});

/* ============ np NumPy 张量 ============ */
/* 画一个 shape=(r,c) 的格子矩阵，返回 cell 组 */
const mtx=(g,x,y,r,c,s,color,val,o={})=>{ const gg=g.append('g').attr('transform',`translate(${x},${y})`);
  for(let i=0;i<r;i++) for(let j=0;j<c;j++) cell(gg,j*(s+3),i*(s+3),s,val?val(i,j):null,color,{fo:o.fo,size:o.size||10}); return gg; };

def('np_array_shape','shape：块怎么堆','Array shape','shape=(d0,d1,d2) 从外到内：几层 → 每层几行 → 每行几个。拉滑杆看堆法。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'); let d=[2,3,4];
  const draw=()=>{ g.selectAll('*').remove(); const s=22,[a,b,c]=d,off=14,ox=W/2-(c*(s+3)+a*off)/2,oy=90;
    for(let k=a-1;k>=0;k--){ const gg=mtx(g,ox+k*off,oy+k*off,b,c,s,k===a-1?api.color:C.vi,(i,j)=>k*b*c+i*c+j,{fo:.25,size:9}); gg.attr('opacity',.55+.45*(a-1-k)/M.max(1,a-1)); txt(gg,-12,12,'['+k+']',{anchor:'end',size:10,color:C.muted,mono:true}); }
    K.label(g,W/2,36,`shape = (${a}, ${b}, ${c})   ndim = 3   size = ${a*b*c}`,'a.shape, a.ndim, a.size',{anchor:'middle',size:14});
    K.label(g,W/2,H-32,`${a} 层，每层 ${b} 行，每行 ${c} 个；最右轴变化最快`,'last axis fastest (C order)',{anchor:'middle',size:11}); };
  draw(); api.slider('d0 层',1,4,1,2,v=>{d[0]=+v;draw();}); api.slider('d1 行',1,5,1,3,v=>{d[1]=+v;draw();}); api.slider('d2 列',1,8,1,4,v=>{d[2]=+v;draw();}); return none();
});

def('np_broadcast','广播：右对齐、缺的维复制','Broadcasting','两个 shape 右对齐；某维一边是 1（或缺失）就把它复制铺开去凑另一边。点"播放"看铺开。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),s=30;
  const cases=[{a:[3,1],b:[1,4],r:[3,4],n:'(3,1) + (1,4)'},{a:[3,4],b:[4],r:[3,4],n:'(3,4) + (4,)'},{a:[3,1],b:[4],r:[3,4],n:'(3,1) + (4,)'},{a:[3,4],b:[3],r:null,n:'(3,4) + (3,)  ✗'}];
  let ci=0;
  const draw=(phase)=>{ g.selectAll('*').remove(); const cs=cases[ci],pad=a=>a.length<2?[null,...a]:a,A=pad(cs.a),B=pad(cs.b),cx=W*.16,cy=110;
    K.label(g,W/2,24,'shape 右对齐：'+cs.n,'align from the right',{anchor:'middle',size:14});
    const shp=(sh,x,y,tag,col)=>{ txt(g,x,y,tag+' shape = ('+sh.map(v=>v==null?'-':v).join(', ')+')',{mono:true,size:13,color:col}); };
    shp(A,cx,52,'A',C.cy); shp(B,cx+W*.28,52,'B',C.am); const ok=!!cs.r; txt(g,cx,76,ok?'逐维：相等 或 有 1 → 可广播':'逐维：4 vs 3，都不是 1 → 报错',{size:11,color:ok?C.gr:C.rd});
    const r=cs.r||[3,4],ex=(sh,x,y,col,ph)=>{ const R=sh[0]==null?1:sh[0],Cc=sh[1],grow=ph?1:0,rr=R+(r[0]-R)*grow,cc=Cc+(r[1]-Cc)*grow;
      for(let i=0;i<rr;i++) for(let j=0;j<cc;j++){ const orig=i<R&&j<Cc; cell(g,x+j*(s+3),y+i*(s+3),s,`${orig?'':'='}${i%R},${j%Cc}`,col,{fo:orig?.45:.15,size:8}); } };
    ex(A,cx,cy,C.cy,phase); ex(B,cx+W*.28,cy,C.am,phase); txt(g,cx+W*.28-22,cy+60,'+',{size:22,anchor:'middle'});
    if(ok){ txt(g,cx+W*.56-22,cy+60,'=',{size:22,anchor:'middle'}); if(phase) mtx(g,cx+W*.56,cy,r[0],r[1],s,api.color,(i,j)=>'',{fo:.35}); K.label(g,cx+W*.56,cy+r[0]*(s+3)+20,`结果 (${r})`,'result',{size:11}); }
    else if(phase) txt(g,cx+W*.56,cy+60,'ValueError',{mono:true,size:14,color:C.rd});
    K.label(g,W/2,H-14,'虚格 = 被复制的（不占新内存，只是"看起来"铺开）','faint cells = virtual copies (no new memory)',{anchor:'middle',size:11}); };
  draw(false); api.button('铺开 / expand',()=>{draw(false);T.after(150,()=>draw(true));}); api.button('换例 / next case',()=>{ci=(ci+1)%cases.length;draw(false);T.after(500,()=>draw(true));});
  return {stop(){T.stop();}};
});

def('np_dot','矩阵乘：行 × 列逐格','Matrix multiply','C[i,j] = A 的第 i 行 · B 的第 j 列。每一格点亮一次，看行列配对。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),s=34,Ar=2,n=3,Bc=2;
  const Av=[[1,2,3],[4,5,6]],Bv=[[1,0],[0,1],[2,3]],ax=W*.08,ay=110,bx=W*.42,by=40,cx=W*.42,cy=by+n*(s+3)+20;
  K.label(svg,ax,80,'A (2×3)','rows'); K.label(svg,bx,by-14,'B (3×2)','cols'); K.label(svg,cx+Bc*(s+3)+10,cy+20,'C = A@B (2×2)','(2×3)@(3×2)→(2×2)',{size:11});
  let k=0; const draw=()=>{ g.selectAll('*').remove(); const i=M.floor(k/Bc),j=k%Bc;
    mtx(g,ax,ay,Ar,n,s,C.muted,(r,c)=>Av[r][c],{fo:.1}); mtx(g,bx,by,n,Bc,s,C.muted,(r,c)=>Bv[r][c],{fo:.1});
    for(let c=0;c<n;c++) cell(g,ax+c*(s+3),ay+i*(s+3),s,Av[i][c],C.cy,{fo:.45}); for(let r=0;r<n;r++) cell(g,bx+j*(s+3),by+r*(s+3),s,Bv[r][j],C.am,{fo:.45});
    for(let r=0;r<Ar;r++) for(let c=0;c<Bc;c++){ const done=r*Bc+c<=k; let v=0; for(let t=0;t<n;t++) v+=Av[r][t]*Bv[t][c]; cell(g,cx+c*(s+3),cy+r*(s+3),s,done?v:'',r===i&&c===j?api.color:C.muted,{fo:done?.35:.08}); }
    const terms=d3.range(n).map(t=>`${Av[i][t]}×${Bv[t][j]}`).join(' + '); let v=0; for(let t=0;t<n;t++) v+=Av[i][t]*Bv[t][j];
    txt(g,W/2,H-20,`C[${i},${j}] = ${terms} = ${v}`,{anchor:'middle',mono:true,size:14,color:api.color}); };
  draw(); T.every(1100,()=>{k=(k+1)%(Ar*Bc);draw();}); return {stop(){T.stop();}};
});

def('np_reshape','reshape：同一串，折不同形','Reshape','数据在内存里永远是一条线；reshape 只是改"每行折几个"。拉滑杆换列数。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),N=12,s=28;
  const draw=c=>{ g.selectAll('*').remove(); const r=N/c,ok=Number.isInteger(r);
    K.label(g,W/2,26,'内存：一条连续的线','memory: one flat line',{anchor:'middle',size:12}); d3.range(N).forEach(i=>cell(g,W/2-N*(s+3)/2+i*(s+3),40,s,i,C.muted,{fo:.15}));
    if(!ok){ txt(g,W/2,H/2+30,`12 个元素折不成 ${c} 列（12 % ${c} ≠ 0）→ ValueError`,{anchor:'middle',size:14,color:C.rd,mono:true}); return; }
    const gg=mtx(g,W/2-c*(s+3)/2,110,r,c,s,api.color,(i,j)=>i*c+j,{fo:.3}); gg.selectAll('g').attr('opacity',0).transition().duration(400).delay((d,i)=>i*40).attr('opacity',1);
    K.label(g,W/2,110+r*(s+3)+22,`a.reshape(${r}, ${c})：按行填，元素顺序不变`,`row-major fill, same order`,{anchor:'middle',size:12});
    txt(g,W/2,H-14,'reshape(-1, c) 的 -1 = 让它自己算行数',{anchor:'middle',size:11,color:C.muted}); };
  draw(4); api.slider('列数 c / cols',1,12,1,4,v=>draw(+v)); return none();
});

def('np_axis','axis：沿哪个轴压扁','Axis reduction','sum(axis=0) 竖着压，行没了；axis=1 横着压，列没了。axis 指的是"消失的那个维"。点按钮。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),s=36,r=3,c=4,v=(i,j)=>i*c+j+1,mx=W*.25,my=90;
  let ax=0; const draw=()=>{ g.selectAll('*').remove(); mtx(g,mx,my,r,c,s,C.muted,v,{fo:.15,size:12});
    K.label(g,mx,my-30,`a.shape = (${r}, ${c})`,'axis 0 ↓ rows, axis 1 → cols',{size:12});
    const mk=K.arrow(svg,'npax'+ax,api.color);
    if(ax===0){ for(let j=0;j<c;j++){ let sum=0; for(let i=0;i<r;i++) sum+=v(i,j); ln(g,mx+j*(s+3)+s/2,my-6,mx+j*(s+3)+s/2,my+r*(s+3)+4,api.color,2,{arrow:mk});
      cell(g,mx+j*(s+3),my+r*(s+3)+16,s,sum,api.color,{fo:.4,size:12}).attr('opacity',0).transition().duration(500).attr('opacity',1); }
      K.label(g,mx+c*(s+3)+20,my+r*(s+3)+36,`sum(axis=0) → shape (${c},)`,'rows collapsed',{size:12,color:api.color}); }
    else { for(let i=0;i<r;i++){ let sum=0; for(let j=0;j<c;j++) sum+=v(i,j); ln(g,mx-6,my+i*(s+3)+s/2,mx+c*(s+3)+4,my+i*(s+3)+s/2,api.color,2,{arrow:mk});
      cell(g,mx+c*(s+3)+16,my+i*(s+3),s,sum,api.color,{fo:.4,size:12}).attr('opacity',0).transition().duration(500).attr('opacity',1); }
      K.label(g,mx,my+r*(s+3)+40,`sum(axis=1) → shape (${r},)`,'cols collapsed',{size:12,color:api.color}); }
    txt(g,W/2,H-14,'口诀：写哪个 axis，哪个 axis 就没了',{anchor:'middle',size:11,color:C.muted}); };
  draw(); api.button('axis=0',()=>{ax=0;draw();}); api.button('axis=1',()=>{ax=1;draw();}); return none();
});

def('np_overflow','int8 溢出：计数器翻转','Integer overflow','int8 只有 8 位：127 再 +1 变成 −128。像里程表翻转。点"+1"或自动。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let v=120;
  const draw=()=>{ g.selectAll('*').remove(); const u=v<0?v+256:v,bits=u.toString(2).padStart(8,'0');
    bits.split('').forEach((b,i)=>cell(g,W/2-8*40/2+i*40,70,36,b,i===0?C.rd:api.color,{fo:b==='1'?.5:.08,size:16})); txt(g,W/2-160,60,'符号位',{anchor:'end',size:10,color:C.rd}); txt(g,W/2+170,60,'2⁰',{size:10,color:C.muted,mono:true});
    txt(g,W/2,150,`np.int8(${v})`,{anchor:'middle',mono:true,size:20,color:v<0?C.rd:C.ink});
    const x=d3.scaleLinear().domain([-128,127]).range([60,W-60]); ln(g,60,200,W-60,200,C.muted,2); [-128,0,127].forEach(t=>{ ln(g,x(t),194,x(t),206,C.muted,1); txt(g,x(t),222,t,{anchor:'middle',size:10,color:C.muted,mono:true}); });
    dot(g,x(v),200,8,v<0?C.rd:api.color); if(v===-128) txt(g,W/2,H-30,'127 + 1 = −128：最高位翻成 1，正数变负数（RGB 图像 uint8 255+1=0 同理）',{anchor:'middle',size:12,color:C.rd});
    else txt(g,W/2,H-30,'范围 [−128, 127]，共 2⁸ = 256 个值',{anchor:'middle',size:11,color:C.muted}); };
  const inc=()=>{ v=v+1>127?-128:v+1; draw(); }; draw(); api.button('+1',inc); api.button('自动 / auto',()=>{T.stop();T.every(300,inc);}); api.button('重置 120',()=>{T.stop();v=120;draw();});
  return {stop(){T.stop();}};
});

def('np_random','随机采样落成分布','Random sampling','点一个个落下，堆成直方图：均匀是平的，正态是钟形。样本越多形状越稳。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),nb=24,x=d3.scaleLinear().domain([-3,3]).range([50,W-50]),bw=(W-100)/nb;
  let mode='normal',counts=new Array(nb).fill(0),n=0;
  const draw=()=>{ g.selectAll('rect').remove(); g.selectAll('text.c').remove(); const mx=M.max(1,...counts);
    counts.forEach((c,i)=>g.append('rect').attr('x',50+i*bw+1).attr('width',bw-2).attr('y',H-40-c/mx*180).attr('height',c/mx*180).attr('fill',api.color).attr('opacity',.75));
    txt(g,W/2,26,`np.random.${mode==='normal'?'randn':'uniform'}(n)   n = ${n}`,{anchor:'middle',mono:true,size:14}).attr('class','c'); };
  ln(g,50,H-40,W-50,H-40,C.muted,1); [-3,-2,-1,0,1,2,3].forEach(t=>txt(g,x(t),H-24,t,{anchor:'middle',size:10,color:C.muted,mono:true}));
  const drop=()=>{ const v=mode==='normal'?d3.randomNormal(0,1)():d3.randomUniform(-3,3)(); if(v<-3||v>3) return; n++;
    const b=M.min(nb-1,M.floor((v+3)/6*nb)); counts[b]++; const c=dot(g,x(v),40,3,C.am); c.transition().duration(400).attr('cy',H-42).remove(); draw(); };
  const reset=m=>{ mode=m; counts.fill(0); n=0; g.selectAll('circle').remove(); draw(); };
  draw(); T.every(40,()=>{ drop(); if(n%2===0) drop(); }); api.button('正态 / normal',()=>reset('normal')); api.button('均匀 / uniform',()=>reset('uniform'));
  return {stop(){T.stop();}};
});

def('np_vectorize','循环 vs 向量化','Vectorize','Python for 循环一格一格算；NumPy 一次把整条数组交给 C。两条进度条比速度。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),N=40,s=(W-120)/N;
  code(svg,16,20,['for i in range(n): y[i]=x[i]*2      # 逐个','y = x*2                               # 一次']);
  K.label(svg,20,90,'for 循环','loop',{color:C.rd}); K.label(svg,20,190,'向量化','vectorized',{color:C.gr});
  const loop=d3.range(N).map(i=>cell(g,60+i*s,100,s-2,null,C.rd,{fo:.08})),vec=d3.range(N).map(i=>cell(g,60+i*s,200,s-2,null,C.gr,{fo:.08}));
  const tl=txt(g,W-20,120,'',{anchor:'end',mono:true,size:12,color:C.rd}),tv=txt(g,W-20,220,'',{anchor:'end',mono:true,size:12,color:C.gr});
  let k=0,t=0; const run=()=>{ T.stop(); k=0;t=0; loop.forEach(c=>c.select('rect').attr('fill-opacity',.08)); vec.forEach(c=>c.select('rect').attr('fill-opacity',.08));
    T.after(300,()=>{ vec.forEach(c=>c.select('rect').transition().duration(200).attr('fill-opacity',.6)); tv.text('~0.01 ms  完成'); });
    T.every(120,()=>{ if(k<N){ loop[k].select('rect').attr('fill-opacity',.6); k++; t+=.12; tl.text(`~${(t*10).toFixed(0)} ms  ${k}/${N}`); } else { tl.text(`~${(t*10).toFixed(0)} ms  完成（慢 ~100×）`); T.stop(); } }); };
  txt(svg,W/2,H-16,'解释器每圈都要查类型、找对象；向量化把整块交给 C 循环',{anchor:'middle',size:11,color:C.muted}); run(); api.button('重跑 / rerun',run);
  return {stop(){T.stop();}};
});

/* ============ vz 可视化 ============ */
def('vz_scatter','散点：一行数据 = 一个点','Scatter plot','每行 (x,y) 落成一个点。点多了才看得出趋势。拉相关性看云团变形。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),ax=K.axes(svg,W,H,[-3,3],[-3,3]),rn=d3.randomNormal(0,1);
  let rho=.7,pts=[];
  const gen=()=>{ pts=d3.range(120).map(()=>{ const a=rn(),b=rn(); return [a,rho*a+M.sqrt(1-rho*rho)*b]; }); g.selectAll('*').remove(); T.stop(); let k=0;
    T.every(25,()=>{ if(k>=pts.length){T.stop();return;} const p=pts[k++]; dot(g,ax.x(p[0]),ax.y(p[1]),0,api.color).attr('opacity',.8).transition().duration(300).attr('r',4); }); };
  K.label(svg,W-150,26,'plt.scatter(x, y)','one row = one dot',{size:12}); const rt=txt(svg,50,26,'',{mono:true,size:12,color:C.am});
  const upd=()=>{ rt.text(`ρ ≈ ${rho.toFixed(2)}`); gen(); }; upd();
  api.slider('相关性 ρ / correlation',-1,1,.05,.7,v=>{rho=+v;upd();}); api.button('重采样 / resample',upd); return {stop(){T.stop();}};
});

def('vz_line','折线：按 x 顺序连起来','Line plot','折线要求 x 有序；点乱序连线会打结。逐点描出来看。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),ax=K.axes(svg,W,H,[0,10],[-1.5,1.5]),N=60;
  const pts=d3.range(N).map(i=>[i/(N-1)*10,M.sin(i/(N-1)*10)+M.cos(i/(N-1)*30)*.3]);
  const L=d3.line().x(p=>ax.x(p[0])).y(p=>ax.y(p[1])),path=g.append('path').attr('fill','none').attr('stroke',api.color).attr('stroke-width',2.5),head=dot(g,0,0,5,C.am);
  K.label(svg,50,26,'plt.plot(x, y)','points joined in x order',{size:12}); let sorted=true; const st=txt(svg,W-40,26,'',{anchor:'end',mono:true,size:12,color:C.am});
  const perm=d3.shuffle(d3.range(N)); api.button('乱序 / shuffle',()=>{sorted=!sorted;});
  return playing(api,t=>{ const k=M.min(N,1+M.floor((t%4)/4*N)),data=sorted?pts.slice(0,k):perm.slice(0,k).map(i=>pts[i]);
    path.attr('d',L(data)); const h=data[data.length-1]; head.attr('cx',ax.x(h[0])).attr('cy',ax.y(h[1])); st.text(sorted?'x 有序':'x 乱序 → 打结'); });
});

def('vz_heatmap','热力图：数值→颜色','Heatmap','矩阵每个数映射到色带。滑杆改"温度"看颜色跟着走。行列语义比颜色更重要。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),r=6,c=10,s=M.min(30,(W-160)/c),base=d3.range(r).map(i=>d3.range(c).map(j=>M.sin(i*.9)*M.cos(j*.6)));
  const col=d3.scaleSequential(d3.interpolateViridis).domain([-1,1]),ox=60,oy=60;
  const draw=k=>{ g.selectAll('*').remove(); base.forEach((row,i)=>row.forEach((v,j)=>{ const vv=M.max(-1,M.min(1,v*k)); g.append('rect').attr('x',ox+j*s).attr('y',oy+i*s).attr('width',s-1).attr('height',s-1).attr('fill',col(vv)).attr('rx',2);
    txt(g,ox+j*s+s/2,oy+i*s+s/2+4,vv.toFixed(1),{anchor:'middle',size:9,mono:true,color:M.abs(vv)>.5?C.ink:'#111'}); }));
    d3.range(21).forEach(i=>g.append('rect').attr('x',ox+c*s+20).attr('y',oy+r*s-(i+1)*r*s/21).attr('width',14).attr('height',r*s/21+1).attr('fill',col(-1+i/10)));
    txt(g,ox+c*s+40,oy+10,'+1',{size:10,mono:true,color:C.muted}); txt(g,ox+c*s+40,oy+r*s,'−1',{size:10,mono:true,color:C.muted}); };
  K.label(svg,ox,30,'sns.heatmap(M)','value → color',{size:12}); K.label(svg,ox,H-20,'看图先问：行是什么？列是什么？','ask: what are rows, what are cols',{size:11});
  draw(1); api.slider('放大 k / scale',0,2,.05,1,v=>draw(+v)); return none();
});

def('vz_contour','等高线：切平面','Contour','用一个水平面去切曲面 z=f(x,y)，切口投影下来就是等高线。拉高度 h。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),n=48,f=(x,y)=>M.exp(-(x*x+y*y)/2)+.6*M.exp(-((x-1.5)**2+(y+1)**2)),pw=M.min(H-60,W*.5),ox=W/2-pw/2,oy=30;
  const vals=[]; for(let i=0;i<n;i++) for(let j=0;j<n;j++) vals.push(f(-3+6*j/(n-1),3-6*i/(n-1)));
  const cont=d3.contours().size([n,n]),col=d3.scaleSequential(d3.interpolateCool).domain([0,1.2]);
  const draw=h=>{ g.selectAll('*').remove(); const lv=d3.range(.1,1.2,.1);
    lv.forEach(t=>{ g.append('path').attr('d',d3.geoPath(d3.geoIdentity().scale(pw/n).translate([ox,oy]))(cont.contour(vals,t))).attr('fill','none').attr('stroke',col(t)).attr('stroke-width',M.abs(t-h)<.05?4:1).attr('opacity',M.abs(t-h)<.05?1:.35); });
    g.append('path').attr('d',d3.geoPath(d3.geoIdentity().scale(pw/n).translate([ox,oy]))(cont.contour(vals,h))).attr('fill',api.color).attr('fill-opacity',.15).attr('stroke',api.color).attr('stroke-width',3);
    txt(g,W/2,H-12,`平面 z = ${h.toFixed(2)} 切下去 → 高亮线就是这一高度的所有 (x,y)`,{anchor:'middle',size:11,color:api.color}); };
  K.label(svg,ox,20,'plt.contour(X, Y, Z)','slice z=h, project down',{size:12}); draw(.5); api.slider('高度 h / level',.05,1.2,.05,.5,v=>draw(+v)); return none();
});

def('vz_hist','直方图：分箱计数','Histogram','数据点掉进箱子，每箱数个数。bins 太少抹平细节，太多全是毛刺。拉 bins。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),rn=d3.randomNormal(0,1),data=d3.range(300).map(()=>rn()*.8+(M.random()<.35?2.2:-.6)),x=d3.scaleLinear().domain([-4,4]).range([50,W-50]);
  let bins=12,shown=0; ln(svg,50,H-40,W-50,H-40,C.muted,1); [-4,-2,0,2,4].forEach(t=>txt(svg,x(t),H-24,t,{anchor:'middle',size:10,color:C.muted,mono:true}));
  const draw=()=>{ g.selectAll('*').remove(); const b=d3.bin().domain([-4,4]).thresholds(bins)(data.slice(0,shown)),mx=M.max(1,d3.max(b,d=>d.length));
    b.forEach(d=>g.append('rect').attr('x',x(d.x0)+1).attr('width',M.max(1,x(d.x1)-x(d.x0)-2)).attr('y',H-40-d.length/mx*200).attr('height',d.length/mx*200).attr('fill',api.color).attr('opacity',.75));
    txt(g,W/2,26,`plt.hist(x, bins=${bins})   n = ${shown}`,{anchor:'middle',mono:true,size:14}); txt(g,W/2,44,bins<6?'箱太少：两个峰被抹成一个':bins>40?'箱太多：全是噪声毛刺':'刚好：看得见两个峰',{anchor:'middle',size:11,color:C.am}); };
  draw(); T.every(30,()=>{ if(shown<data.length){ shown+=3; draw(); } }); api.slider('bins',3,60,1,12,v=>{bins=+v;draw();}); return {stop(){T.stop();}};
});

def('vz_3d','3D 曲面旋转','3D surface','曲面 z=sin(r) 投影到屏幕，自转看形状。3D 好看但难读数，非要读数用等高线。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),n=18,pts=[];
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){ const x=-3+6*i/(n-1),y=-3+6*j/(n-1),r=M.hypot(x,y); pts.push([x,y,M.sin(r*1.6)/(1+r*.4)]); }
  const col=d3.scaleSequential(d3.interpolateWarm).domain([-1,1]),sc=M.min(W,H)*.12,cx=W/2,cy=H/2+10; let tilt=.6;
  const proj=(p,a)=>{ const x=p[0]*M.cos(a)-p[1]*M.sin(a),y=p[0]*M.sin(a)+p[1]*M.cos(a); return [cx+x*sc, cy+y*sc*M.sin(tilt)-p[2]*sc*1.6*M.cos(tilt), y]; };
  K.label(svg,20,24,'ax.plot_surface(X,Y,Z)','rotating projection',{size:12}); api.slider('俯仰 / tilt',.1,1.4,.05,.6,v=>{tilt=+v;});
  return playing(api,t=>{ const a=t*.5; g.selectAll('*').remove(); const P=pts.map(p=>({p,q:proj(p,a)})).sort((u,v)=>u.q[2]-v.q[2]);
    for(let i=0;i<n-1;i++) for(let j=0;j<n-1;j++){ const k=i*n+j,q=[k,k+1,k+n+1,k+n].map(idx=>proj(pts[idx],a)); const z=(pts[k][2]+pts[k+n+1][2])/2;
      g.append('polygon').attr('points',q.map(v=>v[0]+','+v[1]).join(' ')).attr('fill',col(z)).attr('fill-opacity',.55).attr('stroke',col(z)).attr('stroke-width',.6); } });
});

def('vz_color','色带三型：顺序/发散/分类','Colormaps','数值有大小 → 顺序；有中点 → 发散；只是类别 → 分类。选错色带就是撒谎。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),n=24,bw=(W-200)/n,rows=[
    {zh:'顺序 sequential',en:'viridis: 0 → max',f:i=>d3.interpolateViridis(i/(n-1))},
    {zh:'发散 diverging',en:'RdBu: − 0 +',f:i=>d3.interpolateRdBu(i/(n-1))},
    {zh:'分类 categorical',en:'tab10: unordered',f:i=>d3.schemeTableau10[i%10]}];
  rows.forEach((r,ri)=>{ const y=60+ri*90; K.label(svg,20,y+14,r.zh,r.en,{size:12}); d3.range(n).forEach(i=>g.append('rect').attr('x',180+i*bw).attr('y',y).attr('width',bw-1).attr('height',36).attr('fill',r.f(i)).attr('opacity',0).transition().delay(ri*300+i*25).attr('opacity',1)); });
  const cur=g.append('rect').attr('y',58).attr('width',bw).attr('height',40).attr('fill','none').attr('stroke',C.ink).attr('stroke-width',2),tip=txt(svg,W/2,H-14,'',{anchor:'middle',size:11,color:C.am});
  const msgs=['顺序：亮度单调，值越大越亮，可比大小','发散：中点是白，两端两色，看正负偏离','分类：颜色互不排序，只用来区分'];
  let k=0; T.every(1200,()=>{ const ri=M.floor(k/3)%3,i=(k*7)%n; cur.attr('x',180+i*bw).attr('y',58+ri*90); tip.text(msgs[ri]); k++; });
  return {stop(){T.stop();}};
});

def('vz_subplot','subplot：网格切分','Subplots','fig 是一张纸，subplots(r,c) 把它切成 r×c 格；ax[i][j] 指第几格。拉行列。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(); let r=2,c=3;
  const draw=()=>{ g.selectAll('*').remove(); T.stop(); const px=40,py=50,pw=W-2*px,ph=H-py-40,gap=8,cw=(pw-gap*(c-1))/c,ch=(ph-gap*(r-1))/r;
    box(g,px-6,py-6,pw+12,ph+12,C.muted,{fo:.04}); K.label(g,px,py-16,`fig, ax = plt.subplots(${r}, ${c})`,`ax.shape = (${r}, ${c})`,{size:12});
    let k=0; for(let i=0;i<r;i++) for(let j=0;j<c;j++){ const x=px+j*(cw+gap),y=py+i*(ch+gap),gg=g.append('g').attr('opacity',0); box(gg,x,y,cw,ch,api.color,{fo:.12});
      txt(gg,x+6,y+14,`ax[${i}][${j}]`,{mono:true,size:10,color:C.ink2}); const pts=d3.range(12).map(t=>[x+8+t*(cw-16)/11,y+ch-8-M.random()*(ch-28)]); gg.append('path').attr('d',d3.line()(pts)).attr('fill','none').attr('stroke',C.am).attr('stroke-width',1.5);
      gg.transition().delay(k++*120).duration(300).attr('opacity',1); } };
  draw(); api.slider('行 r',1,4,1,2,v=>{r=+v;draw();}); api.slider('列 c',1,5,1,3,v=>{c=+v;draw();}); return {stop(){T.stop();}};
});

/* ============ da 数据 ============ */
const cols=['id','age','dose','resp'],rows0=[[1,34,10,0.2],[2,51,20,0.5],[3,29,10,0.1],[4,63,40,0.9],[5,45,20,0.4],[6,38,40,0.8]];
/* 画表：返回 {cells[i][j], hdr[j]} */
const table=(g,x,y,hdr,rows,cw,rh,color,o={})=>{ const hs=hdr.map((h,j)=>{ box(g,x+j*cw,y,cw-2,rh-2,color,{fo:.35}); return txt(g,x+j*cw+cw/2,y+rh/2+4,h,{anchor:'middle',size:11,mono:true,bold:true}); });
  const cs=rows.map((r,i)=>r.map((v,j)=>{ const gg=g.append('g'); box(gg,x+j*cw,y+(i+1)*rh,cw-2,rh-2,C.muted,{fo:.08}); txt(gg,x+j*cw+cw/2,y+(i+1)*rh+rh/2+4,v==null?'NaN':v,{anchor:'middle',size:11,mono:true,color:v==null?C.rd:(o.tc||C.ink)}); return gg; })); return {hs,cs}; };

def('da_dataframe','DataFrame：列是变量，行是样本','DataFrame','df["age"] 取一列（Series），df.iloc[2] 取一行。高亮跟着走。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),cw=70,rh=28,x0=W/2-cw*2,y0=50; let k=0;
  const draw=()=>{ g.selectAll('*').remove(); const t=table(g,x0,y0,cols,rows0,cw,rh,api.color),m=k%2===0,idx=M.floor(k/2)%4;
    if(m){ t.cs.forEach(r=>r[idx].select('rect').attr('fill',api.color).attr('fill-opacity',.4)); K.label(g,W/2,H-30,`df["${cols[idx]}"]  → 一列 = 一个变量，类型 Series`,'column = variable',{anchor:'middle',size:12}); }
    else { const ri=idx%rows0.length; t.cs[ri].forEach(c=>c.select('rect').attr('fill',C.am).attr('fill-opacity',.4)); K.label(g,W/2,H-30,`df.iloc[${ri}]  → 一行 = 一个样本`,'row = sample',{anchor:'middle',size:12}); } };
  draw(); T.every(1300,()=>{k++;draw();}); K.label(svg,x0,H-4,`shape = (${rows0.length}, ${cols.length})`,'rows × cols',{size:10}); return {stop(){T.stop();}};
});

def('da_groupby','groupby：分桶再聚合','Group by','df.groupby("dose").resp.mean()：先按 dose 把行扔进桶，再每桶算一个数。点"播放"。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),keys=[10,20,40],bx=W*.55,cw=46,rh=24;
  code(svg,16,20,['df.groupby("dose")["resp"].mean()']);
  const t=table(g,20,40,cols,rows0,cw,rh,api.color); keys.forEach((kk,i)=>{ box(g,bx,60+i*80,120,64,C.am,{fo:.06}); txt(g,bx+6,74+i*80,'dose='+kk,{mono:true,size:11,color:C.am}); });
  const run=()=>{ T.stop(); const cnt={}; let i=0; g.selectAll('.fly,.res').remove();
    T.every(400,()=>{ if(i>=rows0.length){ keys.forEach((kk,j)=>{ const vs=rows0.filter(r=>r[2]===kk).map(r=>r[3]),m=d3.mean(vs); txt(g,bx+130,96+j*80,`mean = ${m.toFixed(2)}`,{mono:true,size:12,color:C.gr}).attr('class','res'); }); T.stop(); return; }
      const r=rows0[i],j=keys.indexOf(r[2]),c=(cnt[j]=(cnt[j]||0)+1); const d=g.append('g').attr('class','fly').attr('transform',`translate(${20+3*cw},${40+(i+1)*rh+12})`); dot(d,0,0,8,api.color); txt(d,0,4,r[3],{anchor:'middle',size:9,mono:true});
      d.transition().duration(350).attr('transform',`translate(${bx+30+c*22},${100+j*80})`); i++; }); };
  run(); api.button('播放 / play',run); K.label(svg,20,H-12,'split → apply → combine','三步：切开、各算、拼回',{size:11}); return {stop(){T.stop();}};
});

def('da_merge','merge：按键连线','Merge / join','pd.merge(A, B, on="id")：两表按 id 配对；inner 只留双方都有的 id。切换 how。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),Ax=[[1,'Tom'],[2,'Ann'],[3,'Bob'],[4,'Lee']],Bx=[[2,88],[3,75],[5,60]],cw=60,rh=26;
  let how='inner'; const draw=()=>{ g.selectAll('*').remove(); const ta=table(g,30,50,['id','name'],Ax,cw,rh,C.cy),tb=table(g,W-30-2*cw,50,['id','score'],Bx,cw,rh,C.am);
    K.label(g,30,36,'A','left'); K.label(g,W-30-2*cw,36,'B','right'); const ida=new Set(Ax.map(r=>r[0])),idb=new Set(Bx.map(r=>r[0]));
    Ax.forEach((r,i)=>{ const j=Bx.findIndex(b=>b[0]===r[0]); if(j>=0) ln(g,30+2*cw,50+(i+1)*rh+rh/2,W-30-2*cw,50+(j+1)*rh+rh/2,C.gr,2);
      const keep=how==='inner'?j>=0:how!=='right'||j>=0; ta.cs[i].forEach(c=>c.attr('opacity',keep?1:.25)); });
    Bx.forEach((r,j)=>{ const keep=how==='inner'?ida.has(r[0]):how!=='left'||ida.has(r[0]); tb.cs[j].forEach(c=>c.attr('opacity',keep?1:.25)); });
    const out=how==='inner'?[2,3]:how==='left'?[1,2,3,4]:how==='right'?[2,3,5]:[1,2,3,4,5];
    txt(g,W/2,H-60,`pd.merge(A, B, on="id", how="${how}")`,{anchor:'middle',mono:true,size:13,color:api.color}); txt(g,W/2,H-36,`结果 id: [${out.join(', ')}]   缺的一侧填 NaN`,{anchor:'middle',mono:true,size:12,color:C.gr}); };
  draw(); ['inner','left','right','outer'].forEach(h=>api.button(h,()=>{how=h;draw();})); return none();
});

def('da_clean','清洗：缺失值填或删','Missing values','NaN 格闪红。fillna 用列均值填上；dropna 整行删掉。选哪个取决于缺的多不多。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),cw=70,rh=28,x0=W/2-cw*2,y0=50;
  const raw=rows0.map(r=>r.slice()); raw[1][1]=null; raw[3][3]=null; raw[4][2]=null; let mode='raw';
  const draw=()=>{ g.selectAll('*').remove(); let data=raw.map(r=>r.slice()),note='3 个 NaN：模型吃不了';
    if(mode==='fill'){ [1,2,3].forEach(j=>{ const m=d3.mean(raw.map(r=>r[j]).filter(v=>v!=null)); data.forEach(r=>{ if(r[j]==null) r[j]=+m.toFixed(1); }); }); note='fillna(df.mean())：用列均值填，行数不变'; }
    if(mode==='drop'){ data=data.filter(r=>r.every(v=>v!=null)); note=`dropna()：删掉含 NaN 的行，剩 ${data.length} 行`; }
    const t=table(g,x0,y0,cols,data,cw,rh,api.color); data.forEach((r,i)=>r.forEach((v,j)=>{ const was=raw[rows0.findIndex(rr=>rr[0]===r[0])][j]==null; if(was&&mode==='fill') t.cs[i][j].select('rect').attr('fill',C.gr).attr('fill-opacity',.4); }));
    K.label(g,W/2,H-24,note,mode,{anchor:'middle',size:12}); if(mode==='raw'){ T.stop(); let on=true; T.every(450,()=>{ on=!on; t.cs.forEach(r=>r.forEach(c=>{ if(c.select('text').text()==='NaN') c.select('rect').attr('fill',on?C.rd:C.muted).attr('fill-opacity',on?.45:.08); })); }); } else T.stop(); };
  draw(); api.button('原始 / raw',()=>{mode='raw';draw();}); api.button('fillna 均值',()=>{mode='fill';draw();}); api.button('dropna',()=>{mode='drop';draw();}); return {stop(){T.stop();}};
});

def('da_normalize','归一化：缩到同一尺度','Normalize','age 几十、dose 几十、resp 小数：尺度不同，距离就被大数绑架。z-score 后每列均值 0 方差 1。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),names=cols.slice(1),xs=names.map((_,i)=>W*.2+i*W*.3);
  const draw=t=>{ g.selectAll('*').remove(); names.forEach((nm,j)=>{ const vs=rows0.map(r=>r[j+1]),m=d3.mean(vs),sd=d3.deviation(vs),z=vs.map(v=>(v-m)/sd);
    const yr=d3.scaleLinear().domain([0,d3.max(vs)*1.1]).range([H-50,40]),yz=d3.scaleLinear().domain([-2.5,2.5]).range([H-50,40]),x=xs[j];
    ln(g,x,40,x,H-50,C.hair,1); vs.forEach((v,i)=>{ const y=yr(v)+(yz(z[i])-yr(v))*t; dot(g,x+(i-2.5)*10,y,5,api.color).attr('opacity',.85); });
    ln(g,x-40,yz(0),x+40,yz(0),C.am,1,{dash:'3 3'}).attr('opacity',t); K.label(g,x,H-24,nm,`mean ${K.fmt(m,1)}  sd ${K.fmt(sd,1)}`,{anchor:'middle',size:12}); });
    txt(g,W/2,26,t<.5?'原始尺度：三列的数量级完全不同':'z = (x − mean) / sd：三列被拉到同一把尺子上',{anchor:'middle',size:12,color:t<.5?C.rd:C.gr}); };
  draw(0); api.slider('原始 → z-score',0,1,.02,0,v=>draw(+v)); return none();
});

def('da_split','切分：train / val / test','Train-val-test split','先打乱再切；test 锁进抽屉，直到最后才碰一次。拉比例。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),N=40,bw=(W-80)/N,y=120; let te=.2,va=.2,order=d3.range(N);
  const draw=()=>{ g.selectAll('*').remove(); const nt=M.round(N*te),nv=M.round(N*va),ntr=N-nt-nv;
    order.forEach((o,i)=>{ const role=i<ntr?0:i<ntr+nv?1:2,col=[api.color,C.am,C.rd][role]; g.append('rect').attr('x',40+i*bw).attr('y',y).attr('width',bw-2).attr('height',50).attr('fill',col).attr('fill-opacity',.55).attr('rx',2); txt(g,40+i*bw+bw/2,y+30,o,{anchor:'middle',size:8,mono:true,color:C.ink2}); });
    const seg=(a,b,zh,en,col)=>{ ln(g,40+a*bw,y+62,40+b*bw-2,y+62,col,3); K.label(g,40+(a+b)/2*bw,y+80,zh,en,{anchor:'middle',size:11,color:col}); };
    seg(0,ntr,`train ${ntr}`,'fit weights',api.color); seg(ntr,ntr+nv,`val ${nv}`,'tune / early stop',C.am); seg(ntr+nv,N,`test ${nt}`,'touch once, at the end',C.rd);
    txt(g,W/2,40,'train_test_split(X, y, test_size=%s, shuffle=True)'.replace('%s',te.toFixed(2)),{anchor:'middle',mono:true,size:12}); txt(g,W/2,H-14,'格内数字 = 原始行号：切之前先 shuffle，否则按时间排的数据会漏',{anchor:'middle',size:11,color:C.muted}); };
  draw(); api.slider('test 比例',.05,.5,.05,.2,v=>{te=+v;draw();}); api.slider('val 比例',0,.4,.05,.2,v=>{va=+v;draw();}); api.button('shuffle',()=>{ order=d3.shuffle(order.slice()); draw(); });
  return {stop(){T.stop();}};
});

def('da_pipeline','pipeline：数据块流过步骤','Pipeline','原始表 → 清洗 → 归一化 → 特征 → 模型。每步是一个盒子，块一路变形。fit 只在 train 上做。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),steps=[['原始','raw'],['清洗','clean'],['归一化','scale'],['特征','features'],['模型','model']],n=steps.length,sw=(W-60)/n,y=H/2,cols_=[C.muted,C.rd,C.am,C.vi,api.color];
  steps.forEach((s,i)=>{ const x=30+i*sw; box(g,x+8,y-40,sw-16,80,cols_[i],{fo:.1}); K.label(g,x+sw/2,y+62,s[0],s[1],{anchor:'middle',size:12}); if(i<n-1) ln(g,x+sw-6,y,x+sw+6,y,C.muted,2); });
  code(svg,16,20,['Pipeline([("clean",…),("scale",StandardScaler()),("model",LR())]).fit(X_train)']);
  const blk=g.append('g'),draw=(k,f)=>{ blk.selectAll('*').remove(); const x=30+k*sw+sw/2+(f-.5)*sw*.6,col=cols_[k],sz=26-k*3;
    for(let i=0;i<3;i++) for(let j=0;j<2;j++) blk.append('rect').attr('x',x-sz+i*sz*.7).attr('y',y-sz/2+j*sz*.7-8).attr('width',sz*.6).attr('height',sz*.6).attr('fill',col).attr('fill-opacity',.7).attr('rx',3).attr('transform',`rotate(${f*90*k},${x},${y})`); };
  txt(svg,W/2,H-10,'transform 每步都用；fit 只在 train 上——测试数据不能参与学统计量',{anchor:'middle',size:11,color:C.muted});
  return playing(api,t=>{ const p=(t*.5)%n,k=M.floor(p); draw(k,p-k); });
});

def('da_leak','泄漏：测试数据漏进训练','Data leakage','红色的 test 行流进了训练（例如 scaler 在全表 fit）。分数虚高，上线就崩。点"堵住"。',(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g'),T=timers(),tx=W*.15,ty=90,bx=W*.6,by=90; let leak=true,score=0;
  box(svg,tx-10,ty-30,140,150,api.color,{fo:.06}); K.label(svg,tx,ty-12,'train','fit here'); box(svg,tx-10,ty+130,140,80,C.rd,{fo:.06}); K.label(svg,tx,ty+148,'test','locked drawer',{color:C.rd});
  box(svg,bx,by,150,120,C.vi,{fo:.08}); K.label(svg,bx+75,by+60,'scaler.fit / model.fit','learns statistics',{anchor:'middle',size:12}); const sc=txt(svg,bx+75,by+150,'',{anchor:'middle',mono:true,size:16,color:C.am}),msg=txt(svg,W/2,H-14,'',{anchor:'middle',size:11,color:C.rd});
  const wall=svg.append('line').attr('x1',tx+140).attr('y1',ty+130).attr('x2',bx).attr('y2',by+120).attr('stroke',C.gr).attr('stroke-width',4).attr('opacity',0);
  const tick=()=>{ const isTest=leak?M.random()<.4:false,y=isTest?ty+150+M.random()*40:ty+M.random()*100,c=dot(g,tx+M.random()*100,y,5,isTest?C.rd:api.color);
    c.transition().duration(900).attr('cx',bx+75).attr('cy',by+60).remove(); score=leak?M.min(.99,score+.01):M.min(.86,score+.008); sc.text(`score = ${score.toFixed(2)}${leak?'  (假高)':''}`);
    msg.text(leak?'红点 = test 行进了 fit：模型提前见过考题':'堵住：test 只在最后 predict 一次，分数才是真的'); };
  T.every(180,tick); api.button('堵住 / block',()=>{leak=false;score=0;wall.attr('opacity',1);}); api.button('放开 / leak',()=>{leak=true;score=0;wall.attr('opacity',0);});
  return {stop(){T.stop();}};
});

})();
