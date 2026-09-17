/* anim/ns2.js —— 数感大陆 12 个动画（v2：K2 + 分步 stepper）。在 math_a.js 之后加载，同名 key 覆盖。 */
(()=>{
const A=window.ANIM=window.ANIM||{}, C=K.C;
const def=(k,title,en,cap,make)=>{A[k]={title,en,cap,make}};
const F=(v,d=2)=>Number.isInteger(v)?String(v):(+v).toFixed(d);
const show=(sel,on)=>sel.attr('opacity',on?1:0);

/* ============ 1. 数量级：10 的幂阶梯 ============ */
def('ns_magnitude','数量级 · 先问几个零','Order of magnitude',
 '每级台阶是上一级的 10 倍。把任何数放到它该站的那级上，差三级以上，小数点就别看了。',
(stage,api)=>{
  const W=api.W,H=api.H,f=K2.frame(stage,api,{pad:{l:40,r:24,t:24,b:34}});
  const g=f.g, N=9, x0=60, y0=H-52, sw=(W-140)/N, sh=(H-90)/N;
  const steps=[];
  // 阶梯
  const stair=g.append('g');
  for(let k=0;k<N;k++){
    const X=x0+k*sw, Y=y0-k*sh;
    K2.rect(stair,X,Y,sw*.92,sh*.9,api.color,{fo:.10,r:3,sw:.8});
    K2.txt(stair,X+4,Y+13,'10^'+k,{size:10.5,mono:true,color:C.muted});
  }
  K2.lab(g,x0,26,'10 的幂阶梯','powers of ten',{size:13});
  const mark=g.append('g').attr('opacity',0);
  const mdot=K2.dot(mark,0,0,7,C.am,{stroke:'#fff',sw:1.2});
  const mtxt=K2.txt(mark,0,0,'',{size:12,bold:true,color:C.am});
  const put=(v,col)=>{const k=Math.max(0,Math.min(N-1,Math.floor(Math.log10(Math.abs(v)))));
    const X=x0+k*sw+sw*.46, Y=y0-k*sh-6;
    mdot.attr('cx',X).attr('cy',Y).attr('fill',col||C.am);
    mtxt.attr('x',X+10).attr('y',Y-8).text(F(v,v<10?2:0)+'  ≈ 10^'+k).attr('fill',col||C.am);
    return {X,Y,k};};
  const cmp=g.append('g').attr('opacity',0);
  const note=g.append('g');
  let sl=null, val=4700;
  steps.push({t:'一把只认零个数的尺子',d:'每上一级台阶乘 10。人对"几个零"敏感，对小数点不敏感 —— 数感的第一件事是先站对台阶。',
    at(){show(mark,0);show(cmp,0);note.selectAll('*').remove();}});
  steps.push({t:'把一个数放上去',d:'4700 → 位数 4 → 站在 10³ 那级。写成 4.7×10³：台阶给量级，前面那位给精度。',
    at(){show(mark,1);show(cmp,0);note.selectAll('*').remove();const p=put(4700);
      K2.annot(note,p.X,p.Y,p.X-40,p.Y-56,'4.7 × 10³：台阶=3，有效数字=4.7');}});
  steps.push({t:'差一级就是 10 倍',d:'相邻两级差 10 倍，不是"差一点"。台阶的高度感就是数量级的直觉。',
    at(){show(mark,1);show(cmp,1);note.selectAll('*').remove();
      cmp.selectAll('*').remove();
      const a=put(4700); const bX=x0+4*sw+sw*.46, bY=y0-4*sh-6;
      K2.dot(cmp,bX,bY,7,C.cy,{stroke:'#fff',sw:1.2});
      K2.txt(cmp,bX+10,bY-8,'47000 ≈ 10⁴',{size:12,bold:true,color:C.cy});
      K2.line(cmp,a.X,a.Y,bX,bY,C.cy,1.4,{dash:'4 4'});
      K2.txt(cmp,(a.X+bX)/2-14,(a.Y+bY)/2-10,'×10',{size:11,color:C.cy,mono:true});}});
  steps.push({t:'差三级：小数点可以不看了',d:'10³ 的差距 = 1000 倍。这时候纠结 4.7 还是 4.68，是在小数点上浪费注意力。',
    at(){show(mark,1);show(cmp,1);note.selectAll('*').remove();
      const p=put(4700); const bX=x0+6*sw+sw*.46,bY=y0-6*sh-6;
      cmp.selectAll('*').remove();
      K2.dot(cmp,bX,bY,7,C.gr,{stroke:'#fff',sw:1.2});
      K2.txt(cmp,bX+10,bY-8,'4.7×10⁶',{size:12,bold:true,color:C.gr});
      K2.annot(note,bX,bY,bX-150,bY-40,'差 3 级 = 1000 倍：小的那个直接当 0',{color:C.gr,anchor:'start'});}});
  steps.push({t:'自己拖一个数试试',d:'滑杆改数值，看它跳到哪一级。读法固定：几位数 −1 就是台阶号。',
    at(){show(mark,1);show(cmp,0);note.selectAll('*').remove();put(val);}});
  const st=K2.stepper(api,steps);
  sl=api.slider('数值 10^','0','8.9','0.1','3.7',v=>{val=Math.pow(10,+v);put(val);});
  api.button('回到第一步',()=>st.go(0));
  st.go(0);
  return {stepper:st,stop(){}};
});

/* ============ 2. 对数尺度 ============ */
def('ns_log_scale','对数尺度 · 乘法变加法','Log scale',
 '上面是线性尺，下面是对数尺。同一批数在两把尺上的位置完全不同 —— 这就是为什么跨数量级的数据必须用 log 轴。',
(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const L=60,R=W-40, yA=88, yB=196;
  const data=[1,3,10,30,100,300,1000,3000,10000];
  const lin=d3.scaleLinear().domain([0,10000]).range([L,R]);
  const log=d3.scaleLog().domain([1,10000]).range([L,R]);
  const rule=(y,sc,lab,en,ticks)=>{const gg=g.append('g');
    K2.line(gg,L,y,R,y,C.muted,1.4);
    ticks.forEach(t=>{K2.line(gg,sc(t),y-5,sc(t),y+5,C.muted,1);
      K2.txt(gg,sc(t),y+18,t>=1000?(t/1000)+'k':String(t),{anchor:'middle',size:9.5,color:C.muted});});
    K2.lab(gg,L,y-26,lab,en,{size:12}); return gg;};
  rule(yA,lin,'线性尺 · 等距=等差','linear',[0,2000,4000,6000,8000,10000]);
  rule(yB,log,'对数尺 · 等距=等比','log10',[1,10,100,1000,10000]);
  const dots=g.append('g'), links=g.append('g'), note=g.append('g');
  const dA=data.map(v=>K2.dot(dots,lin(v),yA,4.5,api.color,{op:.9}));
  const dB=data.map(v=>K2.dot(dots,log(v),yB,4.5,C.cy,{op:0}));
  const ln=data.map(v=>K2.line(links,lin(v),yA,log(v),yB,C.hair,1,{op:0,dash:'3 4'}));
  // 指数增长曲线
  const cf=K2.frame(stage,api); // 不用，占位避免未用
  const curveG=g.append('g').attr('opacity',0);
  const cx=d3.scaleLinear().domain([0,8]).range([L,R]);
  const cyL=d3.scaleLinear().domain([0,10000]).range([H-40,246]);
  const cyG=d3.scaleLog().domain([1,10000]).range([H-40,246]);
  const mk=(sc)=>d3.line().x((d,i)=>cx(i)).y(d=>sc(Math.max(1,d)))(d3.range(9).map(i=>Math.pow(3.16,i)));
  const cPath=K2.path(curveG,mk(cyL),C.am,2.2);
  K2.txt(curveG,L,240,'同一条 3.16^k 的曲线',{size:11,color:C.muted});
  const steps=[
   {t:'两把尺子，同一批数',d:'1,3,10,30,…,10000 这九个数，在线性尺上挤成一坨，最后一个把前面全压扁了。',
    at(){dA.forEach(d=>d.attr('opacity',.9));dB.forEach(d=>d.attr('opacity',0));ln.forEach(l=>l.attr('opacity',0));
      show(curveG,0);note.selectAll('*').remove();
      K2.annot(note,lin(30),yA,lin(30)+40,yA-44,'1 到 300 全挤在最左边',{color:api.color});}},
   {t:'同一批数放到 log 尺上',d:'每格乘 10。原来挤成一坨的小数被拉开了，等比的间隔变成等距。',
    at(){dB.forEach((d,i)=>d.transition().duration(400).attr('opacity',.95));
      ln.forEach(l=>l.attr('opacity',.5));show(curveG,0);note.selectAll('*').remove();
      K2.annot(note,log(3),yB,log(3)+30,yB+42,'1→3→10 现在等距了',{color:C.cy});}},
   {t:'乘法变成了加法',d:'log(a×b)=log a+log b。在 log 尺上"乘 10"就是"向右挪一格" —— 尺子把乘法翻译成了平移。',
    at(){note.selectAll('*').remove();
      const a=log(10),b=log(100),c=log(1000);
      K2.line(note,a,yB-16,b,yB-16,C.gr,2,{arrow:K2.arrow(svg,C.gr)});
      K2.line(note,b,yB-32,c,yB-32,C.gr,2,{arrow:K2.arrow(svg,C.gr)});
      K2.txt(note,(a+b)/2,yB-22,'×10',{anchor:'middle',size:11,color:C.gr,mono:true});
      K2.txt(note,(b+c)/2,yB-38,'又×10 = 同样长的一步',{anchor:'middle',size:11,color:C.gr});}},
   {t:'指数增长在 log 轴上是直线',d:'这是最有用的一条：看到一条曲线在 log 轴上拉直，就知道它是指数的，斜率就是增长率。',
    at(){show(curveG,1);cPath.attr('d',mk(cyL));note.selectAll('*').remove();
      K2.annot(note,cx(7),cyL(Math.pow(3.16,7)),cx(4),cyL(9000),'线性轴：前面全贴地，只有最后翘起来',{color:C.am});}},
   {t:'切到 log 轴',d:'同一条曲线，纵轴换成 log 之后变成一条直线。数据跨数量级时不用 log 轴，等于把信息扔了。',
    at(){show(curveG,1);cPath.transition().duration(700).attr('d',mk(cyG));note.selectAll('*').remove();
      K2.annot(note,cx(4),cyG(Math.pow(3.16,4)),cx(1.2),cyG(3000),'log 轴：一条直线，斜率=每步乘几',{color:C.am});}}
  ];
  const st=K2.stepper(api,steps);
  api.button('线性轴',()=>cPath.transition().duration(600).attr('d',mk(cyL)));
  api.button('log 轴',()=>cPath.transition().duration(600).attr('d',mk(cyG)));
  st.go(0);
  return {stepper:st,stop(){}};
});

/* ============ 3. 估算 ============ */
def('ns_estimate','估算 · 一位有效数字','Estimation',
 '把每个数砍成"一位有效数字 × 10^k"，乘起来只数零。误差 20% 以内就算赢。',
(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let a=4830, b=612;
  const round1=v=>{const k=Math.floor(Math.log10(v));const m=Math.round(v/Math.pow(10,k));return {m,k,v:m*Math.pow(10,k)};};
  const box=(x,y,w,h,c)=>K2.rect(g,x,y,w,h,c,{fo:.12,r:8});
  const gA=g.append('g'), gB=g.append('g'), gR=g.append('g'), note=g.append('g');
  const draw=()=>{
    gA.selectAll('*').remove();gB.selectAll('*').remove();gR.selectAll('*').remove();
    const ra=round1(a), rb=round1(b);
    const est=ra.v*rb.v, real=a*b, err=Math.abs(est-real)/real*100;
    K2.txt(gA,60,60,String(a),{size:26,bold:true,mono:true});
    K2.txt(gA,60,84,'↓ 砍成一位有效数字',{size:11,color:C.muted});
    K2.txt(gA,60,112,ra.m+' × 10^'+ra.k,{size:20,mono:true,color:api.color,bold:true});
    K2.txt(gB,260,60,String(b),{size:26,bold:true,mono:true});
    K2.txt(gB,260,84,'↓',{size:11,color:C.muted});
    K2.txt(gB,260,112,rb.m+' × 10^'+rb.k,{size:20,mono:true,color:api.color,bold:true});
    K2.txt(gR,60,164,'估：'+ra.m+'×'+rb.m+' = '+(ra.m*rb.m)+'，零：'+ra.k+'+'+rb.k+' = '+(ra.k+rb.k),{size:14,color:C.cy});
    K2.txt(gR,60,192,'≈ '+F(est/Math.pow(10,Math.floor(Math.log10(est))),1)+' × 10^'+Math.floor(Math.log10(est)),{size:20,bold:true,color:C.cy,mono:true});
    K2.txt(gR,60,224,'真值 '+real.toLocaleString(),{size:13,color:C.muted,mono:true});
    const ec=err<10?C.gr:err<20?C.am:C.rd;
    K2.txt(gR,60,248,'误差 '+F(err,1)+'%  '+(err<20?'✓ 够用':'✗ 要修一位'),{size:14,bold:true,color:ec});
    // 误差条
    const bx=300,by=196,bw=W-360;
    K2.rect(gR,bx,by,bw,14,C.muted,{fo:.1,r:7});
    K2.rect(gR,bx,by,bw*Math.min(1,err/40),14,ec,{fo:.75,r:7,sw:0});
    K2.line(gR,bx+bw*0.5,by-4,bx+bw*0.5,by+18,C.gr,1.4,{dash:'3 3'});
    K2.txt(gR,bx+bw*0.5,by+32,'20% 及格线',{anchor:'middle',size:10,color:C.gr});
  };
  const steps=[
   {t:'先别算，先砍',d:'4830 → 5×10³。心算的第一刀是把精度砍到一位，剩下的全交给 10 的幂。',
    at(){draw();note.selectAll('*').remove();
      K2.annot(note,120,112,150,142,'一位有效数字 + 零的个数',{color:api.color});}},
   {t:'一位数相乘，谁都会',d:'5×6=30。这一步不需要"算"，是查乘法表。',
    at(){draw();note.selectAll('*').remove();
      K2.annot(note,150,164,190,140,'这一步是查表，不是计算',{color:C.cy});}},
   {t:'零加起来',d:'10³×10²=10⁵。乘法在量级上就是加法，这就是对数尺度那块讲的同一件事。',
    at(){draw();note.selectAll('*').remove();
      K2.annot(note,330,164,360,138,'指数相加：3+2=5',{color:C.cy});}},
   {t:'看误差够不够用',d:'一位有效数字的估算，误差一般在 20% 以内。做实验读数、判断量级是否合理，这个精度完全够。',
    at(){draw();note.selectAll('*').remove();
      K2.annot(note,300+ (W-360)*0.5, 196, 300+(W-360)*0.5-30, 168,'过了这条线就该修第二位',{color:C.gr,anchor:'end'});}},
   {t:'换数字自己练',d:'两个滑杆改数，看误差条。练到看见任何两个数，1 秒内报出量级。',
    at(){draw();note.selectAll('*').remove();}}
  ];
  const st=K2.stepper(api,steps);
  api.slider('a','120','9900','10','4830',v=>{a=+v;draw();});
  api.slider('b','12','990','1','612',v=>{b=+v;draw();});
  st.go(0);
  return {stepper:st,stop(){}};
});

/* ============ 4. 3 2 1 排最大 ============ */
def('ns_max_digits','3 2 1 排最大 · 指数吃一切','Largest from 3,2,1',
 '同样三个数字，拼接/相乘/幂/幂塔差了几十个数量级。柱子是 log10，看高度就知道谁大。',
(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const cands=[
    {e:'1+2+3',v:Math.log10(6),k:'加'},
    {e:'321',v:Math.log10(321),k:'拼接'},
    {e:'3×21',v:Math.log10(63),k:'乘'},
    {e:'32×1',v:Math.log10(32),k:'乘'},
    {e:'2^31',v:31*Math.log10(2),k:'幂'},
    {e:'3^21',v:21*Math.log10(3),k:'幂'},
    {e:'21^3',v:3*Math.log10(21),k:'幂'},
    {e:'3^(2^1)',v:2*Math.log10(3),k:'塔'},
    {e:'2^(3^1)',v:3*Math.log10(2),k:'塔'}
  ];
  const bx=70, by=H-58, bw=(W-120)/cands.length, maxv=Math.max(...cands.map(c=>c.v));
  const sc=d3.scaleLinear().domain([0,maxv*1.12]).range([0,by-56]);
  const bars=g.append('g'), note=g.append('g');
  K2.lab(g,60,30,'柱高 = log10(值) = 这个数有几位','bar height = number of digits',{size:12});
  const rects=cands.map((c,i)=>{
    const x=bx+i*bw;
    const r=K2.rect(bars,x,by-sc(c.v),bw*.72,sc(c.v),C.muted,{fo:.18,r:3});
    K2.txt(bars,x+bw*.36,by+15,c.e,{anchor:'middle',size:10.5,mono:true,color:C.ink2});
    K2.txt(bars,x+bw*.36,by+28,c.k,{anchor:'middle',size:9,color:C.muted});
    K2.txt(bars,x+bw*.36,by-sc(c.v)-6,F(c.v,1),{anchor:'middle',size:10,mono:true,color:C.muted});
    return r;});
  const hi=(pred,col)=>{rects.forEach((r,i)=>{const on=pred(cands[i],i);
    r.attr('fill',on?col:C.muted).attr('stroke',on?col:C.muted).attr('fill-opacity',on?.6:.12);});};
  const steps=[
   {t:'先看最笨的几种',d:'加起来 6，拼成 321，相乘 63。都是两三位数 —— 这一档根本不用比。',
    at(){hi(c=>c.k==='加'||c.k==='拼接'||c.k==='乘',C.muted);note.selectAll('*').remove();
      K2.annot(note,bx+bw*1.4,by-sc(cands[1].v),bx+bw*2.4,by-sc(cands[1].v)-46,'拼接最多也就三位数');}},
   {t:'一上指数，直接跳档',d:'3^21 已经是 10 位数（约 1.05×10¹⁰）。指数把"位数"从加法变成了乘法。',
    at(){hi(c=>c.k==='幂',api.color);note.selectAll('*').remove();
      K2.annot(note,bx+bw*5.4,by-sc(cands[5].v),bx+bw*3.2,by-sc(cands[5].v)-40,'3^21 ≈ 1.05×10¹⁰',{color:api.color});}},
   {t:'底大不一定赢',d:'2^31 ≈ 2.1×10⁹，比 3^21 小。比较靠 指数×lg(底)：21×0.477=10.02 vs 31×0.301=9.33。',
    at(){hi(c=>c.e==='3^21'||c.e==='2^31',C.am);note.selectAll('*').remove();
      K2.annot(note,bx+bw*4.4,by-sc(cands[4].v),bx+bw*1.6,by-sc(cands[4].v)-30,'2^31 输了：31×0.301 = 9.33',{color:C.am});
      K2.annot(note,bx+bw*5.4,by-sc(cands[5].v),bx+bw*6.6,by-sc(cands[5].v)-58,'3^21 赢：21×0.477 = 10.02',{color:C.am});}},
   {t:'幂塔为什么反而小',d:'3^(2^1)=3²=9。塔要"高"才吃香，指数位只有一个 1 的时候塔没搭起来 —— 数字得先凑出大指数。',
    at(){hi(c=>c.k==='塔',C.rd);note.selectAll('*').remove();
      K2.annot(note,bx+bw*7.4,by-sc(cands[7].v),bx+bw*6,by-sc(cands[7].v)-64,'塔没搭起来，指数只有 2',{color:C.rd});}},
   {t:'反射固化',d:'看到"几个数字排最大"：先问能不能用指数 → 底取最大的一个 → 剩下的全拼成指数 → 有并列就比 指数×lg底。',
    at(){hi(c=>c.e==='3^21',C.gr);note.selectAll('*').remove();
      K2.annot(note,bx+bw*5.4,by-sc(cands[5].v)-4,bx+bw*2.6,by-sc(cands[5].v)-70,'答案：3^21，约 105 亿',{color:C.gr});}}
  ];
  const st=K2.stepper(api,steps);
  api.button('全部还原',()=>{hi(()=>false,C.muted);});
  st.go(0);
  return {stepper:st,stop(){}};
});

/* ============ 5. 24 点 ============ */
def('ns_make24','24 点 · 先找因数门','Make 24',
 '24 的门就那么几扇：3×8、4×6、2×12、24±0。拿到四个数先问：谁能当门的一半，剩下的能不能凑出另一半。',
(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  const doors=[[3,8],[4,6],[2,12],[1,24]];
  const nums=[3,3,8,8];
  const gd=g.append('g'), gn=g.append('g'), gt=g.append('g'), note=g.append('g');
  K2.lab(g,50,28,'24 的因数门','doors into 24',{size:12.5});
  const dw=110, dx=50;
  const drects=doors.map((d,i)=>{
    const x=dx+i*(dw+14);
    const r=K2.rect(gd,x,44,dw,52,C.muted,{fo:.12,r:8});
    K2.txt(gd,x+dw/2,72,d[0]+' × '+d[1],{anchor:'middle',size:17,bold:true,mono:true});
    K2.txt(gd,x+dw/2,88,'= 24',{anchor:'middle',size:10,color:C.muted});
    return r;});
  K2.lab(g,50,132,'手里的四张牌','your four numbers',{size:12.5});
  nums.forEach((n,i)=>{const x=dx+i*72;
    K2.rect(gn,x,146,56,56,api.color,{fo:.16,r:10});
    K2.txt(gn,x+28,182,String(n),{anchor:'middle',size:26,bold:true});});
  const steps=[
   {t:'先看门，不看牌',d:'24 = 3×8 = 4×6 = 2×12 = 24×1。心里先把这四扇门摆出来，再回头看手里的数。',
    at(){drects.forEach(r=>r.attr('stroke',C.muted).attr('fill',C.muted).attr('fill-opacity',.12));
      gt.selectAll('*').remove();note.selectAll('*').remove();}},
   {t:'手里有 3 3 8 8：先试 3×8',d:'有 3 也有 8，第一扇门看起来能开 —— 但用掉 3 和 8 之后，剩下的 3 和 8 得凑出 1，3/8 不是 1，这条死了。',
    at(){drects[0].attr('stroke',C.am).attr('fill',C.am).attr('fill-opacity',.4);
      gt.selectAll('*').remove();note.selectAll('*').remove();
      K2.annot(note,dx+dw/2,96,dx+dw/2+40,124,'剩下 3 和 8 要凑出 1 → 凑不出',{color:C.rd});}},
   {t:'换门：8 ÷ (3 − 8/3)',d:'当直接乘法走不通，就想"除法造分数"。8/3 是这道题的钥匙：3 − 8/3 = 1/3，再拿 8 去除。',
    at(){drects.forEach(r=>r.attr('stroke',C.muted).attr('fill',C.muted).attr('fill-opacity',.12));
      gt.selectAll('*').remove();note.selectAll('*').remove();
      K2.txt(gt,50,244,'8 ÷ ( 3 − 8 ÷ 3 )',{size:22,bold:true,mono:true,color:C.cy});}},
   {t:'一步步算给自己看',d:'8÷3 = 2.667 → 3 − 2.667 = 0.333 = 1/3 → 8 ÷ (1/3) = 24。分数是 24 点里最容易被忽略的一类门。',
    at(){gt.selectAll('*').remove();note.selectAll('*').remove();
      const lines=['8 ÷ 3 = 8/3','3 − 8/3 = 1/3','8 ÷ (1/3) = 24'];
      lines.forEach((l,i)=>K2.txt(gt,50,238+i*26,l,{size:16,mono:true,color:i===2?C.gr:C.ink2}));
      K2.annot(note,190,264,300,240,'除以 1/3 = 乘 3 —— 这才是 24 的来源',{color:C.gr});}},
   {t:'把套路记成一句话',d:'一：先列 24 的因数门。二：看手里能不能直接凑出一扇门的两半。三：凑不出就上分数，尤其是 x ÷ (小分数)。',
    at(){gt.selectAll('*').remove();note.selectAll('*').remove();
      drects.forEach(r=>r.attr('stroke',C.gr).attr('fill',C.gr).attr('fill-opacity',.22));
      K2.txt(gt,50,244,'门 → 半 → 分数',{size:20,bold:true,color:C.gr});}}
  ];
  const st=K2.stepper(api,steps);
  api.button('再看一遍',()=>st.go(0));
  st.go(0);
  return {stepper:st,stop(){}};
});

/* ============ 6. 乘法速算：面积分块 ============ */
def('ns_mental_mult','乘法速算 · 面积分块','Mental multiplication',
 '47×23 就是一个长方形。把边切开，面积拆成四块，每块都是一位数乘整十 —— 心算能扛住。',
(stage,api)=>{
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let a=47,b=23;
  const X0=70,Y0=60,SW=Math.min(W-220,300),SH=H-140;
  const gRect=g.append('g'), gLab=g.append('g'), gSum=g.append('g'), note=g.append('g');
  const parts=()=>{const a1=Math.floor(a/10)*10,a2=a-a1,b1=Math.floor(b/10)*10,b2=b-b1;return {a1,a2,b1,b2};};
  const draw=(mode)=>{
    gRect.selectAll('*').remove();gLab.selectAll('*').remove();gSum.selectAll('*').remove();
    const {a1,a2,b1,b2}=parts();
    const wx=SW*a1/a, wx2=SW*a2/a, hy=SH*b1/b, hy2=SH*b2/b;
    const cells=[[X0,Y0,wx,hy,a1*b1,api.color],[X0+wx,Y0,wx2,hy,a2*b1,C.cy],
                 [X0,Y0+hy,wx,hy2,a1*b2,C.vi],[X0+wx,Y0+hy,wx2,hy2,a2*b2,C.am]];
    if(mode===0){K2.rect(gRect,X0,Y0,SW,SH,api.color,{fo:.14,r:4});
      K2.txt(gLab,X0+SW/2,Y0+SH/2,a+' × '+b,{anchor:'middle',size:24,bold:true});}
    else{cells.forEach((c,i)=>{ if(mode===1&&i>0)return;
      K2.rect(gRect,c[0],c[1],c[2],c[3],c[5],{fo:.3,r:2});
      if(c[2]>34&&c[3]>22)K2.txt(gLab,c[0]+c[2]/2,c[1]+c[3]/2+5,String(c[4]),{anchor:'middle',size:13,bold:true,mono:true});});}
    K2.txt(gLab,X0+SW/2,Y0-14,String(a),{anchor:'middle',size:13,mono:true,color:C.muted});
    K2.txt(gLab,X0-12,Y0+SH/2,String(b),{anchor:'end',size:13,mono:true,color:C.muted});
    if(mode>=2){const sx=X0+SW+28;
      cells.forEach((c,i)=>{K2.rect(gSum,sx,Y0+i*30,12,12,c[5],{fo:.6,r:3});
        K2.txt(gSum,sx+20,Y0+i*30+11,String(c[4]),{size:14,mono:true});});
      K2.line(gSum,sx,Y0+124,sx+90,Y0+124,C.muted,1);
      K2.txt(gSum,sx+20,Y0+146,String(a*b),{size:20,bold:true,mono:true,color:C.gr});}
  };
  const steps=[
   {t:'两个数 = 一个长方形',d:'47×23 别当成"竖式"，当成一块地的面积。心算难在位数多，不难在面积。',
    at(){draw(0);note.selectAll('*').remove();}},
   {t:'切第一刀：整十',d:'把 47 切成 40+7，23 切成 20+3。为什么切整十？因为整十乘任何一位数都是查表。',
    at(){draw(1);note.selectAll('*').remove();
      K2.annot(note,X0+SW*40/47,Y0+20,X0+SW*40/47+30,Y0-8,'40 × 20 = 800');}},
   {t:'四块全填上',d:'800 + 120 + 140 + 21。每一块都是"一位数 × 整十"，没有一步需要纸。',
    at(){draw(2);note.selectAll('*').remove();}},
   {t:'加起来',d:'800+120=920 → +140=1060 → +21=1081。加法按块走，不会串位。',
    at(){draw(3);note.selectAll('*').remove();
      K2.annot(note,X0+SW+40,Y0+146,X0+SW-40,Y0+SH-16,'1081',{color:C.gr,anchor:'end'});}},
   {t:'换个数自己拆',d:'滑杆改两个数，看四块怎么变。练到看见两位数乘法，脑子里直接浮出那四块。',
    at(){draw(3);note.selectAll('*').remove();}}
  ];
  const st=K2.stepper(api,steps);
  api.slider('a','11','99','1','47',v=>{a=+v;draw(3);});
  api.slider('b','11','99','1','23',v=>{b=+v;draw(3);});
  st.go(0);
  return {stepper:st,stop(){}};
});

/* ============ 7. 平方速算 ============ */
(()=>{
const A=window.ANIM, C=K.C, F=(v,d=2)=>Number.isInteger(v)?String(v):(+v).toFixed(d);
A['ns_square_trick']={title:'平方速算 · 加一圈 L',en:'Fast squares',
 cap:'n² 是正方形。边长加 1 多出一条 L 形，面积正好 2n+1 —— 所以邻居的平方只差一个奇数。',
 make(stage,api){
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let n=7;
  const S=Math.min(H-110,240), X0=70, Y0=56;
  const gSq=g.append('g'), gL=g.append('g'), gT=g.append('g'), note=g.append('g');
  const cell=()=>S/(n+1);
  const draw=(mode)=>{
    gSq.selectAll('*').remove();gL.selectAll('*').remove();gT.selectAll('*').remove();
    const c=cell();
    for(let i=0;i<n;i++)for(let j=0;j<n;j++)
      K2.rect(gSq,X0+i*c,Y0+j*c,c-1.5,c-1.5,api.color,{fo:.26,r:1.5,sw:.4});
    K2.txt(gT,X0+n*c/2,Y0-12,n+' × '+n+' = '+(n*n),{anchor:'middle',size:14,bold:true,mono:true});
    if(mode>=1){
      for(let j=0;j<n;j++)K2.rect(gL,X0+n*c,Y0+j*c,c-1.5,c-1.5,C.am,{fo:.55,r:1.5,sw:.4});
      for(let i=0;i<n;i++)K2.rect(gL,X0+i*c,Y0+n*c,c-1.5,c-1.5,C.am,{fo:.55,r:1.5,sw:.4});
      K2.rect(gL,X0+n*c,Y0+n*c,c-1.5,c-1.5,C.gr,{fo:.7,r:1.5,sw:.4});
      K2.txt(gT,X0+n*c+c*1.6,Y0+n*c/2,'n 格',{size:11,color:C.am});
      K2.txt(gT,X0+n*c/2,Y0+n*c+c*1.9,'n 格 + 角上 1 格',{anchor:'middle',size:11,color:C.am});
    }
    const rx=X0+S+40;
    if(mode>=2){
      K2.txt(gT,rx,80,'(n+1)² = n² + 2n + 1',{size:15,bold:true,mono:true,color:C.cy});
      K2.txt(gT,rx,106,(n+1)+'² = '+(n*n)+' + '+(2*n+1)+' = '+((n+1)*(n+1)),{size:14,mono:true});
      K2.txt(gT,rx,132,'(n−1)² = n² − (2n−1)',{size:15,bold:true,mono:true,color:C.vi});
      K2.txt(gT,rx,158,(n-1)+'² = '+(n*n)+' − '+(2*n-1)+' = '+((n-1)*(n-1)),{size:14,mono:true});
    }
    if(mode>=3){
      const a=Math.floor(n/1); const b=n*10+5;
      K2.txt(gT,rx,196,'尾 5 特例：'+b+'² = '+(n*(n+1))+'|25 = '+(b*b),{size:14,mono:true,color:C.gr});
      K2.txt(gT,rx,218,'(10a+5)² = 100·a(a+1) + 25',{size:12,mono:true,color:C.muted});
    }
  };
  const steps=[
   {t:'平方就是一个正方形',d:'n² 别当成"n 乘 n"这个算式，当成边长 n 的方块。所有平方技巧都是在这块地上加减。',
    at(){draw(0);note.selectAll('*').remove();}},
   {t:'边长加 1，多出一条 L',d:'右边一竖 n 格、下边一横 n 格、角上 1 格，一共 2n+1 格。这就是为什么相邻平方差是奇数。',
    at(){draw(1);note.selectAll('*').remove();
      K2.annot(note,X0+S*0.95,Y0+S*0.95,X0+S*0.5,Y0+S+40,'L 形 = n + n + 1 = 2n+1',{color:C.am});}},
   {t:'于是有了两条心算路',d:'知道 7²=49，就知道 8²=49+15=64、6²=49−13=36。查最近的整十平方，再加减奇数。',
    at(){draw(2);note.selectAll('*').remove();}},
   {t:'尾 5 是同一条式子的特例',d:'35² = 3×4 接 25 = 1225。代数上就是 (10a+5)² = 100a(a+1)+25，几何上是把 L 形一次加满。',
    at(){draw(3);note.selectAll('*').remove();
      K2.annot(note,X0+S+120,196,X0+S+60,236,'a(a+1) 写前面，25 直接抄后面',{color:C.gr});}},
   {t:'拖着练',d:'滑杆改 n，盯住 L 形的格子数一直等于 2n+1。练到看见平方就想到"最近的整十 ± 几圈 L"。',
    at(){draw(3);note.selectAll('*').remove();}}
  ];
  const st=K2.stepper(api,steps);
  api.slider('n','3','14','1','7',v=>{n=+v;draw(3);});
  st.go(0);
  return {stepper:st,stop(){}};
 }};

/* ============ 8. 百分比心算 ============ */
A['ns_percent']={title:'百分比 · 十格条',en:'Percent mental math',
 cap:'一根切成 10 格的条：10% 一格，5% 半格，1% 是格子的十分之一。所有百分比都是这几块的拼装。',
 make(stage,api){
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let base=240, pct=15;
  const X0=60, Y0=70, BW=W-160, BH=46;
  const gBar=g.append('g'), gFill=g.append('g'), gT=g.append('g'), note=g.append('g');
  const draw=(mode)=>{
    gBar.selectAll('*').remove();gFill.selectAll('*').remove();gT.selectAll('*').remove();
    for(let i=0;i<10;i++)K2.rect(gBar,X0+i*BW/10,Y0,BW/10-2,BH,C.muted,{fo:.1,r:3});
    K2.txt(gT,X0,Y0-12,'整条 = '+base,{size:13,mono:true,color:C.ink2});
    K2.txt(gT,X0+BW,Y0-12,'一格 = 10% = '+F(base*.1,1),{anchor:'end',size:12,mono:true,color:api.color});
    if(mode>=1)K2.rect(gFill,X0,Y0,BW/10-2,BH,api.color,{fo:.5,r:3});
    if(mode>=2){
      const w=BW*pct/100;
      K2.rect(gFill,X0,Y0,w,BH,C.cy,{fo:.42,r:3});
      K2.txt(gT,X0+w+8,Y0+BH/2+5,pct+'% = '+F(base*pct/100,1),{size:15,bold:true,mono:true,color:C.cy});
      K2.txt(gT,X0,Y0+BH+26,pct+'% = '+Math.floor(pct/10)+'格 + '+(pct%10)+'%  →  '+F(base*.1,1)+'×'+Math.floor(pct/10)+' + '+F(base*.01,2)+'×'+(pct%10),{size:12.5,mono:true,color:C.ink2});
    }
    if(mode>=3){
      K2.txt(gT,X0,Y0+BH+66,'交换律：x% of y = y% of x',{size:14,bold:true,color:C.gr});
      K2.txt(gT,X0,Y0+BH+90,'18% of 50 难算 → 50% of 18 = 9，一秒',{size:13,mono:true,color:C.ink2});
    }
    if(mode>=4){
      const up=base*1.2, dn=up*0.8;
      K2.txt(gT,X0,Y0+BH+126,'涨 20% 再跌 20%：'+base+' → '+F(up,1)+' → '+F(dn,1)+'（不是回到原点）',{size:13,mono:true,color:C.rd});
      K2.txt(gT,X0,Y0+BH+148,'(1+p)(1−p) = 1 − p² = 0.96，永远亏 p²',{size:12.5,mono:true,color:C.muted});
    }
  };
  const steps=[
   {t:'先把条切成 10 格',d:'任何"求百分之几"，先把整体想成 10 格。这一步是把抽象比例变成能数的东西。',at(){draw(0);note.selectAll('*').remove();}},
   {t:'10% 是一格',d:'10% 就是小数点往左挪一位。这是唯一需要"算"的一步，其余全靠拼。',
    at(){draw(1);note.selectAll('*').remove();
      K2.annot(note,X0+BW/20,Y0+BH,X0+BW/20+50,Y0+BH+34,'240 → 24，挪一位',{color:api.color});}},
   {t:'其他都是拼装',d:'15% = 一格半；35% = 三格半；1% = 一格的十分之一。心算不是算，是数格子。',
    at(){draw(2);note.selectAll('*').remove();}},
   {t:'交换律是白送的',d:'x% of y = y% of x。18% 的 50 卡住时，翻过来算 50% 的 18，直接是 9。',
    at(){draw(3);note.selectAll('*').remove();
      K2.annot(note,X0+180,Y0+BH+90,X0+320,Y0+BH+66,'两边都是 xy/100，当然相等',{color:C.gr});}},
   {t:'最大的坑：涨跌不对称',d:'涨 20% 再跌 20% 回不到原点，差 p²。做实验算回收率、看数据涨跌，这个坑天天踩。',
    at(){draw(4);note.selectAll('*').remove();
      K2.annot(note,X0+240,Y0+BH+126,X0+330,Y0+BH+104,'永远少 4%',{color:C.rd});}}
  ];
  const st=K2.stepper(api,steps);
  api.slider('整体','40','990','10','240',v=>{base=+v;draw(4);});
  api.slider('百分比','1','99','1','15',v=>{pct=+v;draw(4);});
  st.go(0);
  return {stepper:st,stop(){}};
 }};

/* ============ 9. 珠心算 ============ */
A['ns_abacus']={title:'珠心算 · 位置就是数',en:'Mental abacus',
 cap:'一档五颗珠：上珠一颗当 5，下珠四颗各当 1。数字不是符号，是珠子靠没靠梁。',
 make(stage,api){
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let digits=[0,0,0];   // 百十个
  const RODS=3, RX=W/2-110, RY=44, RW=70, BEAD_W=44, BEAD_H=20;
  const gA=g.append('g'), gT=g.append('g'), note=g.append('g');
  const draw=()=>{
    gA.selectAll('*').remove();gT.selectAll('*').remove();
    const barY=RY+70;
    K2.rect(gA,RX-16,RY-10,RODS*RW+32,210,C.muted,{fo:.04,r:8,sw:1});
    K2.line(gA,RX-16,barY,RX+RODS*RW+16,barY,C.ink2,4);
    for(let r=0;r<RODS;r++){
      const cx=RX+r*RW+RW/2, d=digits[r];
      K2.line(gA,cx,RY,cx,RY+200,C.muted,2.5,{op:.5});
      // 上珠（值 5）
      const upOn=d>=5;
      K2.rect(gA,cx-BEAD_W/2,upOn?barY-BEAD_H-4:RY+6,BEAD_W,BEAD_H,upOn?C.am:C.muted,
        {fo:upOn?.85:.18,r:9,sw:upOn?1.2:.6});
      // 下珠四颗（各值 1）
      const low=d%5;
      for(let i=0;i<4;i++){
        const on=i<low;
        const y=on?barY+8+i*(BEAD_H+3):barY+70+i*(BEAD_H+3);
        K2.rect(gA,cx-BEAD_W/2,y,BEAD_W,BEAD_H,on?api.color:C.muted,{fo:on?.8:.18,r:9,sw:on?1.2:.6});
      }
      K2.txt(gT,cx,RY+222,['百','十','个'][r],{anchor:'middle',size:11,color:C.muted});
      K2.txt(gT,cx,RY-16,String(d),{anchor:'middle',size:15,bold:true,mono:true,color:d?C.ink:C.muted});
    }
    const val=digits[0]*100+digits[1]*10+digits[2];
    K2.txt(gT,RX-16,RY+252,'读数 '+val,{size:20,bold:true,mono:true,color:C.gr});
  };
  const set=(v)=>{v=Math.max(0,Math.min(999,v));digits=[Math.floor(v/100),Math.floor(v/10)%10,v%10];draw();};
  const steps=[
   {t:'一档五颗珠',d:'梁上一颗算 5，梁下四颗各算 1。珠子靠梁才算数 —— 所以"看数字"变成了"看位置"。',
    at(){set(0);note.selectAll('*').remove();
      K2.annot(note,RX+RW*2.5,RY+56,RX+RW*2.5+40,RY+20,'上珠 = 5',{color:C.am});
      K2.annot(note,RX+RW*2.5,RY+130,RX+RW*2.5+40,RY+170,'下珠 = 1 ×4',{color:api.color});}},
   {t:'7 长什么样',d:'一颗上珠 + 两颗下珠。心算的人看到 7，脑子里直接是这个形状，不是"七"这个字。',
    at(){set(7);note.selectAll('*').remove();
      K2.annot(note,RX+RW*2.5,RY+80,RX+RW*2.5+50,RY+50,'5 + 2 = 7',{color:C.gr});}},
   {t:'加不够怎么办：用补数',d:'个位 7 要加 8，下珠不够。做法是"进一位，再减补数"：+8 = +10 − 2。',
    at(){set(7);note.selectAll('*').remove();
      K2.annot(note,RX+RW*1.5,RY+100,RX+30,RY+120,'8 的补数是 2：进十位，个位退 2',{color:C.cy});}},
   {t:'结果 15',d:'十位进 1，个位从 7 退 2 变 5（一颗上珠）。整个过程没有"算"，只有拨。',
    at(){set(15);note.selectAll('*').remove();
      K2.annot(note,RX+RW*1.5,RY+56,RX+RW*0.4,RY+24,'十位这颗下珠是刚进上来的',{color:C.cy});}},
   {t:'心像才是目的',d:'练到闭上眼睛能看见这副盘，加减就变成了拨珠的肌肉记忆 —— 这就是珠心算比笔算快的原因。',
    at(){set(628);note.selectAll('*').remove();
      K2.annot(note,RX+RW*1.5,RY-16,RX+RW*1.5,RY-40,'628：闭眼也要能看见这三档',{color:C.gr,anchor:'middle'});}}
  ];
  const st=K2.stepper(api,steps);
  api.slider('拨一个数','0','999','1','0',v=>set(+v));
  api.button('打开完整训练器',()=>window.open('tools/abacus.html','_blank'));
  st.go(0);
  return {stepper:st,stop(){}};
 }};

})();

})();

/* ============ 10-12 ============ */
(()=>{
const A=window.ANIM, C=K.C, F=(v,d=2)=>Number.isInteger(v)?String(v):(+v).toFixed(d);

/* 10. 因数分解：一棵劈到底的树 */
A['ns_factor']={title:'因数分解 · 劈到叶子全是质数',en:'Factorization',
 cap:'一直劈，叶子全是质数就停。不管从哪一刀开始，叶子的集合永远一样 —— 这就是算术基本定理。',
 make(stage,api){
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let n=360;
  const gT=g.append('g'), gI=g.append('g'), note=g.append('g');
  const isP=v=>{if(v<2)return false;for(let i=2;i*i<=v;i++)if(v%i===0)return false;return true;};
  const smallest=v=>{for(let i=2;i*i<=v;i++)if(v%i===0)return i;return v;};
  const build=(v,x,y,dx,depth,order)=>{
    const node={v,x,y,kids:[]};
    if(isP(v)||depth>4)return node;
    const p=order==='small'?smallest(v):(()=>{let q=Math.floor(Math.sqrt(v));while(q>1&&v%q)q--;return q>1?q:smallest(v)})();
    node.kids=[build(p,x-dx,y+62,dx/1.9,depth+1,order),build(v/p,x+dx,y+62,dx/1.9,depth+1,order)];
    return node;};
  const drawTree=(root,col)=>{
    gT.selectAll('*').remove();
    const walk=nd=>{nd.kids.forEach(k=>{K2.line(gT,nd.x,nd.y+12,k.x,k.y-12,C.hair,1.2);walk(k)});
      const prime=isP(nd.v);
      K2.dot(gT,nd.x,nd.y,17,prime?C.gr:C.muted,{op:prime?.28:.14,stroke:prime?C.gr:C.muted,sw:1});
      K2.txt(gT,nd.x,nd.y+5,String(nd.v),{anchor:'middle',size:12,bold:true,mono:true,color:prime?C.gr:C.ink});};
    walk(root);};
  const leaves=(nd,out=[])=>{if(!nd.kids.length){out.push(nd.v);return out}nd.kids.forEach(k=>leaves(k,out));return out;};
  const draw=(mode,order)=>{
    const root=build(n,W/2,54,W/5,0,order||'small');
    drawTree(root);
    gI.selectAll('*').remove();
    const ls=leaves(root).sort((a,b)=>a-b);
    if(mode>=2){
      const cnt={};ls.forEach(v=>cnt[v]=(cnt[v]||0)+1);
      const s=Object.keys(cnt).map(k=>k+(cnt[k]>1?'^'+cnt[k]:'')).join(' × ');
      K2.txt(gI,60,H-58,n+' = '+s,{size:19,bold:true,mono:true,color:C.gr});
      const dn=Object.values(cnt).reduce((a,b)=>a*(b+1),1);
      K2.txt(gI,60,H-32,'约数个数 = '+Object.values(cnt).map(c=>'('+c+'+1)').join('×')+' = '+dn,{size:13,mono:true,color:C.ink2});
    }
    if(mode>=1){
      const lim=Math.floor(Math.sqrt(n));
      K2.txt(gI,W-60,H-58,'只需试除到 √'+n+' ≈ '+lim,{anchor:'end',size:13,mono:true,color:C.cy});
      K2.txt(gI,W-60,H-36,'2 看尾数 · 3 看数位和 · 5 看末位',{anchor:'end',size:12,color:C.muted});
    }
  };
  const steps=[
   {t:'从最小的质数开始劈',d:'360 先除 2。劈的顺序随便，但从小质数开始最省力，因为大因子会被自动带出来。',
    at(){draw(0);note.selectAll('*').remove();}},
   {t:'为什么只用试到 √n',d:'如果 n=a×b 且 a>√n，那 b 必然 <√n，早就被试出来了。所以过了 √n 就不用再试。',
    at(){draw(1);note.selectAll('*').remove();
      K2.annot(note,W-140,H-58,W-260,H-92,'超过 √n 的因子必有一个小搭档',{color:C.cy,anchor:'end'});}},
   {t:'叶子全是质数就停',d:'绿色的就是质数叶子。收集起来 360 = 2³ × 3² × 5。',
    at(){draw(2);note.selectAll('*').remove();}},
   {t:'换一刀劈，叶子一样',d:'先除 2 还是先除 5，树形不同，但叶子集合永远相同 —— 唯一分解。这是整个数论的地基。',
    at(){draw(2,'big');note.selectAll('*').remove();
      K2.annot(note,W/2,54,W/2+130,26,'树换了形状，叶子没变',{color:C.am});}},
   {t:'顺手拿到约数个数',d:'指数各加一再连乘：(3+1)(2+1)(1+1)=24。这是分解最常被用到的副产品。',
    at(){draw(2);note.selectAll('*').remove();
      K2.annot(note,220,H-32,340,H-8,'每个质因子选 0..k 次幂',{color:C.gr});}}
  ];
  const st=K2.stepper(api,steps);
  api.slider('n','12','999','1','360',v=>{n=+v;draw(2);});
  api.button('换一种劈法',()=>draw(2,'big'));
  st.go(0);
  return {stepper:st,stop(){}};
 }};

/* 11. 整除判定：10^k 塌缩 */
A['ns_divisibility']={title:'整除判定 · 权重塌缩',en:'Divisibility rules',
 cap:'10 ≡ 1 (mod 9)，所以每个数位的权重都塌成 1，整个数塌成数位和；10 ≡ −1 (mod 11)，权重就正负交替。',
 make(stage,api){
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let num=4736, m=9;
  const gD=g.append('g'), gW=g.append('g'), gS=g.append('g'), note=g.append('g');
  const draw=(mode)=>{
    gD.selectAll('*').remove();gW.selectAll('*').remove();gS.selectAll('*').remove();
    const ds=String(num).split('').map(Number), L=ds.length;
    const bw=64, X0=(W-L*bw)/2, Y=76;
    ds.forEach((d,i)=>{
      const k=L-1-i, x=X0+i*bw;
      K2.rect(gD,x,Y,bw-8,52,api.color,{fo:.18,r:6});
      K2.txt(gD,x+(bw-8)/2,Y+34,String(d),{anchor:'middle',size:24,bold:true});
      const w0='10^'+k;
      K2.txt(gW,x+(bw-8)/2,Y-12,w0,{anchor:'middle',size:11,mono:true,color:C.muted});
      if(mode>=1){
        const w=m===9?1:(m===11?(k%2?-1:1):Math.pow(10,k)%m);
        const col=w===1?C.gr:(w===-1?C.rd:C.am);
        K2.txt(gW,x+(bw-8)/2,Y+78,'× '+w,{anchor:'middle',size:14,bold:true,mono:true,color:col});
      }
    });
    if(mode>=2){
      const vals=ds.map((d,i)=>{const k=L-1-i;return m===9?d:(m===11?(k%2?-d:d):d*(Math.pow(10,k)%m))});
      const sum=vals.reduce((a,b)=>a+b,0);
      K2.txt(gS,X0,Y+124,vals.map((v,i)=>(v<0?'−'+(-v):v)).join(m===11?'  ':' + ').replace(/^/,m===11?'交替：':'和：'),
        {size:16,mono:true,color:C.cy});
      K2.txt(gS,X0,Y+156,'= '+sum+'，'+sum+' mod '+m+' = '+((sum%m)+m)%m+'  →  '+num+(((sum%m)+m)%m===0?' 能':' 不能')+'被 '+m+' 整除',
        {size:15,bold:true,mono:true,color:((sum%m)+m)%m===0?C.gr:C.rd});
      K2.txt(gS,X0,Y+184,'验算：'+num+' mod '+m+' = '+(num%m),{size:12,mono:true,color:C.muted});
    }
  };
  const steps=[
   {t:'一个数 = 每位数字 × 10 的幂',d:'4736 = 4×10³ + 7×10² + 3×10¹ + 6。整除判定就是问：这些权重在 mod m 下变成了什么。',
    at(){draw(0);note.selectAll('*').remove();}},
   {t:'mod 9 时权重全塌成 1',d:'10 ≡ 1，所以 10^k ≡ 1。每一位的权重都变成 1，整个数就塌成了数位和 —— 这就是"看数位和"的来历。',
    at(){m=9;draw(1);note.selectAll('*').remove();
      K2.annot(note,W/2,158,W/2+120,196,'10^k mod 9 全是 1',{color:C.gr});}},
   {t:'算给自己看',d:'4+7+3+6 = 20，20 mod 9 = 2，所以 4736 不能被 9 整除，余 2。跟直接取模结果一致。',
    at(){m=9;draw(2);note.selectAll('*').remove();}},
   {t:'mod 11：权重正负交替',d:'10 ≡ −1，所以 10^k ≡ (−1)^k。奇数位取负，于是判定法变成"交替和"。',
    at(){m=11;draw(2);note.selectAll('*').remove();
      K2.annot(note,W/2,158,W/2-140,196,'10 ≡ −1 → 一正一负',{color:C.rd,anchor:'end'});}},
   {t:'其他的也是同一套',d:'mod 4 只有末两位有权重（100 ≡ 0），mod 8 只看末三位，mod 2/5 只看末位。规则不用背，看 10^k mod m 就行。',
    at(){m=4;draw(2);note.selectAll('*').remove();
      K2.annot(note,W/2,158,W/2+100,196,'高位权重全是 0，只剩末两位',{color:C.am});}}
  ];
  const st=K2.stepper(api,steps);
  api.slider('数字','100','9999','1','4736',v=>{num=+v;draw(2);});
  [9,11,3,4,7].forEach(mm=>api.button('mod '+mm,()=>{m=mm;draw(2);}));
  st.go(0);
  return {stepper:st,stop(){}};
 }};

/* 12. 平均数的坑 */
A['ns_average_trap']={title:'平均数的坑 · 权重在哪',en:'Average traps',
 cap:'去程 60 回程 40，平均不是 50。慢的那段花的时间长，权重大，平均被拖向慢的一边。',
 make(stage,api){
  const W=api.W,H=api.H,svg=K.svg(stage,W,H),g=svg.append('g');
  let v1=60, v2=40, D=120;
  const gRoad=g.append('g'), gBar=g.append('g'), gT=g.append('g'), note=g.append('g');
  const draw=(mode)=>{
    gRoad.selectAll('*').remove();gBar.selectAll('*').remove();gT.selectAll('*').remove();
    const t1=D/v1, t2=D/v2, T=t1+t2, harm=2*D/T, arith=(v1+v2)/2, geo=Math.sqrt(v1*v2);
    const X0=60, RW=W-140;
    // 两段等长的路
    K2.rect(gRoad,X0,60,RW/2-4,34,api.color,{fo:.3,r:5});
    K2.rect(gRoad,X0+RW/2,60,RW/2-4,34,C.rd,{fo:.3,r:5});
    K2.txt(gRoad,X0+RW/4,82,'去程 '+D+' km @ '+v1,{anchor:'middle',size:13,bold:true});
    K2.txt(gRoad,X0+RW*3/4,82,'回程 '+D+' km @ '+v2,{anchor:'middle',size:13,bold:true});
    K2.txt(gRoad,X0,44,'路程一样长',{size:11,color:C.muted});
    if(mode>=1){
      const s=RW/T;
      K2.rect(gBar,X0,124,t1*s-4,34,api.color,{fo:.6,r:5});
      K2.rect(gBar,X0+t1*s,124,t2*s-4,34,C.rd,{fo:.6,r:5});
      K2.txt(gBar,X0+t1*s/2,146,F(t1,2)+' h',{anchor:'middle',size:12,bold:true,mono:true});
      K2.txt(gBar,X0+t1*s+t2*s/2,146,F(t2,2)+' h',{anchor:'middle',size:12,bold:true,mono:true});
      K2.txt(gBar,X0,110,'时间不一样长 —— 权重在这儿',{size:11,color:C.am});
    }
    if(mode>=2){
      const rows=[['算术平均（错）',arith,C.rd],['几何平均',geo,C.am],['调和平均（对）',harm,C.gr]];
      rows.forEach((r,i)=>{const y=196+i*30;
        K2.txt(gT,X0,y,r[0],{size:13,color:r[2]});
        K2.rect(gT,X0+140,y-12,(RW-160)*r[1]/70,16,r[2],{fo:.55,r:4});
        K2.txt(gT,X0+150+(RW-160)*r[1]/70,y,F(r[1],2)+' km/h',{size:12,mono:true,color:r[2]});});
      K2.txt(gT,X0,196+3*30+6,'总路程 '+(2*D)+' ÷ 总时间 '+F(T,2)+' = '+F(harm,2),{size:12.5,mono:true,color:C.muted});
    }
  };
  const steps=[
   {t:'两段一样长的路',d:'去 120 km，回 120 km。很多人第一反应：平均速度 (60+40)/2 = 50。',
    at(){draw(0);note.selectAll('*').remove();}},
   {t:'但时间不一样长',d:'去程 2 小时，回程 3 小时。慢的那段占了更多时间 —— 平均速度是按时间加权的，不是按段数。',
    at(){draw(1);note.selectAll('*').remove();
      K2.annot(note,W-140,141,W-260,176,'慢的那段更长，权重更大',{color:C.am,anchor:'end'});}},
   {t:'正确做法：总路程 ÷ 总时间',d:'240 ÷ 5 = 48 km/h。这个数天然就是调和平均 2/(1/60+1/40)。',
    at(){draw(2);note.selectAll('*').remove();
      K2.annot(note,220,256,340,290,'48 < 50，被慢的一段拖下来了',{color:C.gr});}},
   {t:'三个平均什么时候用哪个',d:'分母是时间/次数 → 调和；连乘增长率 → 几何；单纯一堆数 → 算术。判错的代价是结论直接反过来。',
    at(){draw(2);note.selectAll('*').remove();
      K2.annot(note,X0+150,226,X0+300,206,'几何平均 48.99：用于连乘',{color:C.am});}},
   {t:'自己调速度看差多少',d:'两段速度差越大，算术平均错得越离谱。差 10 倍时算术能比真值高一倍。',
    at(){draw(2);note.selectAll('*').remove();}}
  ];
  const st=K2.stepper(api,steps);
  api.slider('去程速度','10','120','5','60',v=>{v1=+v;draw(2);});
  api.slider('回程速度','10','120','5','40',v=>{v2=+v;draw(2);});
  st.go(0);
  return {stepper:st,stop(){}};
 }};
})();
