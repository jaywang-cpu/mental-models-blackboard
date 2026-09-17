/* 数理宇宙 · 引擎：乐园地图 + 投影墙动画 + 秒答 SRS + 九步法。math.html / code.html 共用。 */
(()=>{
const CFG=window.PAGE_CFG;                      // {page,title,en,sub,other:{file,name}}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const md=s=>esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
const $=id=>document.getElementById(id);

/* ---------- 1. 数据 ---------- */
const parts=(window.PARTS||[]).filter(p=>p.page===CFG.page);
const DOMS=[],NODES=[];
parts.forEach(p=>{DOMS.push(...(p.domains||[]));NODES.push(...(p.nodes||[]))});
const DORDER=(CFG.order||[]).concat(DOMS.map(d=>d.id).filter(id=>!(CFG.order||[]).includes(id)));
DOMS.sort((a,b)=>DORDER.indexOf(a.id)-DORDER.indexOf(b.id));
const DM=Object.fromEntries(DOMS.map(d=>[d.id,d]));
const NM=Object.fromEntries(NODES.map(n=>[n.id,n]));
NODES.forEach(n=>{ if(!DM[n.dom]) console.warn('孤儿节点',n.id); });

/* ---------- 2. 存储（留存/反馈） ---------- */
const LS=k=>{try{return JSON.parse(localStorage.getItem('su.'+CFG.page+'.'+k)||'{}')}catch(e){return{}}};
const SV=(k,v)=>{try{localStorage.setItem('su.'+CFG.page+'.'+k,JSON.stringify(v))}catch(e){}};
const SRS=LS('srs'), STEPS=LS('steps');
const DAY=864e5, GAP=[0,1,3,7,16,35];                 // Leitner 间隔（天）
function grade(id,g){                                   // g: 0 不会 1 模糊 2 秒出
  const s=SRS[id]||{box:0,seen:0,ok:0,next:0};
  s.seen++; if(g===2){s.ok++;s.box=Math.min(s.box+1,5)} else if(g===1){s.box=Math.max(1,s.box)} else s.box=0;
  s.next=Date.now()+GAP[s.box]*DAY; s.last=Date.now(); SRS[id]=s; SV('srs',SRS);
  mark(id,'drill'); if(g<2) mark(id,'fb');
  paintMastery(id);
}
function mark(id,step){ const s=STEPS[id]||{}; if(!s[step]){s[step]=Date.now();STEPS[id]=s;SV('steps',STEPS)} }
const box=id=>(SRS[id]||{}).box||0;
const due=id=>!SRS[id]||SRS[id].next<=Date.now();

/* ---------- 3. 布局：大陆椭圆 + 向日葵排布 ---------- */
const cols=Math.max(3,Math.min(5,Math.round(Math.sqrt(DOMS.length*1.35)))), LW=760, LH=560, GX=120, GY=90;
DOMS.forEach((d,i)=>{
  const n=NODES.filter(x=>x.dom===d.id).length;
  const sc=Math.sqrt(Math.max(n,6)/12);
  d.rx=Math.round(LW/2*Math.max(.62,Math.min(1.15,sc))); d.ry=Math.round(LH/2*Math.max(.62,Math.min(1.15,sc)));
  const r=Math.floor(i/cols), c=i%cols;
  d.cx=GX+LW/2+c*(LW+GX)+(r%2?LW*.35:0); d.cy=GY+LH/2+r*(LH+GY);
});
const GA=Math.PI*(3-Math.sqrt(5));
const L0={};   // 一级布局快照
/* 一级布局：同一子区的牌子聚成一团，团越大占的扇区越大。
   这样一眼就能看出一块大陆里分几摊，哪一摊最重。SUBS 常量在下面才定义，这里直接读 window。 */
const SUB0=window.SUBS||{};
const CLUSTERS=[];                       // 给渲染层画子区光晕和名字用
/* 折叠子区：标了 fold:true 的子区在一级不摊开，只留一个入口牌，点它进二级。
   实验换算那一摊（计算台）就是这样收起来的，一级只看数感本身。 */
const FOLDED={};                         // 节点 id -> 入口牌
const GATES=[];                          // 一级要画的入口牌
DOMS.forEach(d=>{
  const ns=NODES.filter(x=>x.dom===d.id);
  const groups=(SUB0[d.id]||[]).map(g=>({g,gn:g.nodes.filter(id=>NM[id]).map(id=>NM[id])}))
                               .filter(x=>x.gn.length);
  const covered={}; groups.forEach(x=>x.gn.forEach(n=>covered[n.id]=1));
  const rest=ns.filter(n=>!covered[n.id]);
  if(rest.length) groups.push({g:{k:'_rest',name:'',en:''},gn:rest});
  if(groups.length<2){                                   // 没有子区就照旧铺满
    ns.forEach((n,i)=>{ const t=(i+.5)/ns.length, rad=Math.sqrt(t)*.78, a=i*GA;
      n.x=d.cx+Math.cos(a)*rad*d.rx; n.y=d.cy+Math.sin(a)*rad*d.ry+18; });
    return;
  }
  const W=g=>g.g.fold?Math.min(g.gn.length,3):g.gn.length;   // 折叠的只占 3 个牌子的地方
  const total=groups.reduce((s,x)=>s+W(x),0);
  let acc=-Math.PI/2+.55;                                // 起手角避开正上方，别撞大陆名
  groups.forEach(({g,gn})=>{
    const share=(g.fold?Math.min(gn.length,3):gn.length)/total;
    const mid=acc+share*Math.PI; acc+=share*2*Math.PI;
    const push=.54-.30*share;                            // 大团靠内，小团推到边上，互不挤
    const gcx=d.cx+Math.cos(mid)*d.rx*push;
    const gcy=d.cy+Math.sin(mid)*d.ry*push+14;
    const grx=d.rx*(.24+.36*Math.sqrt(share));           // 团的半径随牌子数长
    const gry=d.ry*(.21+.34*Math.sqrt(share));
    if(g.fold){                                          // 收起来：只留一个入口牌
      const gate={id:'gate:'+d.id+':'+g.k, isGate:1, dom:d.id, sub:g.k, count:gn.length,
        title:g.name, en:(g.en||'')+' · '+gn.length+' 牌', one:g.one||'', gut:g.one||'', links:[],
        x:gcx, y:gcy};
      GATES.push(gate); gn.forEach(n=>{FOLDED[n.id]=gate; n.x=gcx; n.y=gcy;});
      return;
    }
    gn.forEach((n,i)=>{ const t=(i+.5)/gn.length, rad=Math.sqrt(t)*.80, a=i*GA;
      n.x=gcx+Math.cos(a)*rad*grx; n.y=gcy+Math.sin(a)*rad*gry; });
    if(g.name) CLUSTERS.push({dom:d.id,name:g.name,en:g.en,k:g.k,n:gn.length,
      cx:gcx,cy:gcy,rx:grx,ry:gry,color:d.color,
      lx:gcx+Math.cos(mid)*(grx+40), ly:gcy+Math.sin(mid)*(gry+34)});
  });
});
DOMS.forEach(d=>L0['d:'+d.id]={cx:d.cx,cy:d.cy,rx:d.rx,ry:d.ry});
/* 简单斥力，避免牌子重叠 */
const L0N=NODES.filter(n=>!FOLDED[n.id]).concat(GATES);   // 一级真正画出来的牌子
const L0M={}; L0N.forEach(n=>L0M[n.id]=n);
for(let it=0;it<60;it++){
  for(let i=0;i<L0N.length;i++)for(let j=i+1;j<L0N.length;j++){
    const a=L0N[i],b=L0N[j]; if(a.dom!==b.dom)continue;
    let dx=b.x-a.x,dy=b.y-a.y; const d=Math.hypot(dx,dy)||1, min=150, miny=58;
    if(Math.abs(dx)<min&&Math.abs(dy)<miny){const f=(1-d/Math.hypot(min,miny))*4; dx/=d;dy/=d;
      a.x-=dx*f;a.y-=dy*f*.6;b.x+=dx*f;b.y+=dy*f*.6;}
  }
  L0N.forEach(n=>{const d=DM[n.dom]; const ex=(n.x-d.cx)/(d.rx*.86),ey=(n.y-d.cy-10)/(d.ry*.8); const r=Math.hypot(ex,ey);
    if(r>1){n.x=d.cx+(n.x-d.cx)/r;n.y=d.cy+10+(n.y-d.cy-10)/r}});
}
function layoutIn(regions,nodesOf){          // regions:[{k,cx,cy,rx,ry}] nodesOf:region=>node[]
  regions.forEach(r=>{
    const ns=nodesOf(r);
    ns.forEach((n,i)=>{const t=(i+.5)/ns.length, rad=Math.sqrt(t)*.74, a=i*GA;
      n.x=r.cx+Math.cos(a)*rad*r.rx; n.y=r.cy+Math.sin(a)*rad*r.ry+16;});
    for(let it=0;it<70;it++){
      for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){
        const a=ns[i],b=ns[j];let dx=b.x-a.x,dy=b.y-a.y;
        const dd=Math.hypot(dx,dy)||1,min=170,miny=62;
        if(Math.abs(dx)<min&&Math.abs(dy)<miny){const f=(1-dd/Math.hypot(min,miny))*4.5;dx/=dd;dy/=dd;
          a.x-=dx*f;a.y-=dy*f*.6;b.x+=dx*f;b.y+=dy*f*.6;}}
      ns.forEach(n=>{const ex=(n.x-r.cx)/(r.rx*.85),ey=(n.y-r.cy-10)/(r.ry*.78),rr=Math.hypot(ex,ey);
        if(rr>1){n.x=r.cx+(n.x-r.cx)/rr;n.y=r.cy+10+(n.y-r.cy-10)/rr}});
    }
  });
}
const blob=(cx,cy,rx,ry,seed)=>{
  const pts=[]; for(let k=0;k<40;k++){const a=k/40*Math.PI*2;
    const w=1+.06*Math.sin(a*3+seed)+.04*Math.sin(a*5+seed*2)+.03*Math.cos(a*7+seed*3);
    pts.push([cx+Math.cos(a)*rx*w,cy+Math.sin(a)*ry*w]);}
  return d3.line().curve(d3.curveCatmullRomClosed.alpha(.6))(pts);
};

/* ---------- 4. 画地图 ---------- */
const svg=d3.select('#mapview').append('svg');
const root=svg.append('g');
const gLand=root.append('g'),gRoad=root.append('g'),gEdge=root.append('g'),gNode=root.append('g');
const EDGES=[];
const L0id=id=>FOLDED[id]?FOLDED[id].id:id;               // 折叠掉的牌子，连线接到入口牌上
NODES.forEach(n=>(n.links||[]).forEach(t=>{ if(!NM[t])return;
  const a=L0id(n.id), b=L0id(t); if(a===b)return;
  if(!EDGES.some(e=>(e.a===b&&e.b===a)||(e.a===a&&e.b===b))) EDGES.push({a,b}); }));
let nSel,eSel;
function drawL0(){
  gLand.selectAll('*').remove(); gRoad.selectAll('*').remove(); gEdge.selectAll('*').remove(); gNode.selectAll('*').remove();
  DOMS.forEach((d,i)=>{
    const g=gLand.append('g').attr('class','land').attr('data-d',d.id);
    g.append('path').attr('class','halo').attr('d',blob(d.cx,d.cy,d.rx+40,d.ry+40,i*1.7)).attr('fill',d.color);
    g.append('path').attr('class','fill').attr('d',blob(d.cx,d.cy,d.rx,d.ry,i*1.7)).attr('fill',d.color);
    g.append('path').attr('class','ring').attr('d',blob(d.cx,d.cy,d.rx,d.ry,i*1.7)).attr('stroke',d.color);
    g.append('text').attr('class','landname').attr('x',d.cx).attr('y',d.cy-d.ry+46).attr('fill',d.color).text(d.name);
    g.append('text').attr('class','landen').attr('x',d.cx).attr('y',d.cy-d.ry+66).text(d.en);
    g.append('text').attr('class','landsub').attr('x',d.cx).attr('y',d.cy+d.ry-18).text((d.one||'')+'  ·  双击进二级');
    g.on('click',()=>{zoomTo(d);openDom(d.id)});
    g.on('dblclick',(e)=>{e.stopPropagation();enterDom(d.id)});
  });
  /* 子区光晕：把同一摊牌子圈起来并写上名字，一眼看出一块大陆分几摊 */
  CLUSTERS.forEach((c,i)=>{
    const g=gLand.append('g').attr('class','subzone').attr('data-d',c.dom).attr('data-k',c.k);
    g.append('path').attr('class','subfill').attr('d',blob(c.cx,c.cy,c.rx+26,c.ry+22,i*3.1)).attr('fill',c.color);
    g.append('path').attr('class','subring').attr('d',blob(c.cx,c.cy,c.rx+26,c.ry+22,i*3.1)).attr('stroke',c.color);
    g.append('text').attr('class','subname').attr('x',c.lx).attr('y',c.ly).attr('fill',c.color)
      .text(c.name+' · '+c.n);
    g.append('text').attr('class','suben').attr('x',c.lx).attr('y',c.ly+13).text(c.en||'');
    g.on('click',()=>{zoomTo(DM[c.dom]);openDom(c.dom)});
    g.on('dblclick',(e)=>{e.stopPropagation();enterDom(c.dom)});
  });
  for(let i=0;i<DOMS.length-1;i++){const a=DOMS[i],b=DOMS[i+1];
    const p=`M${a.cx},${a.cy+a.ry*.6} Q${(a.cx+b.cx)/2},${(a.cy+b.cy)/2+120} ${b.cx},${b.cy-b.ry*.6}`;
    gRoad.append('path').attr('class','road').attr('d',p); gRoad.append('path').attr('class','roadin').attr('d',p);}
  eSel=gEdge.selectAll('path').data(EDGES).enter().append('path').attr('class','edge')
    .attr('stroke',e=>DM[L0M[e.a].dom].color)
    .attr('d',e=>{const a=L0M[e.a],b=L0M[e.b]; const mx=(a.x+b.x)/2,my=(a.y+b.y)/2-40; return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`});
  nSel=gNode.selectAll('g').data(L0N).enter().append('g').attr('class',n=>'node'+(n.isGate?' gate':'')).attr('data-id',n=>n.id)
    .attr('transform',n=>`translate(${n.x},${n.y})`)
    .on('click',(e,n)=>{e.stopPropagation(); if(n.isGate){enterDom(n.dom);} else openNode(n.id,true)});
  nSel.append('rect').attr('class','plate').attr('x',n=>-plateW(n)/2).attr('y',-19).attr('width',plateW).attr('height',38).attr('rx',14);
  nSel.append('rect').attr('class','lv').attr('x',n=>-plateW(n)/2+3).attr('y',13).attr('height',3).attr('rx',1.5).attr('width',0).attr('fill','#5CE8A8');
  nSel.append('text').attr('class','nzh').attr('y',-1).text(n=>n.title);
  nSel.append('text').attr('class','nen').attr('y',12).text(n=>n.en);
  nSel.filter(n=>n.isGate).append('text').attr('class','ngate').attr('y',26).text('点开进去 →');
  nSel.filter(n=>!n.isGate).append('text').attr('class','nbadge').attr('x',n=>plateW(n)/2-7).attr('y',-8).attr('text-anchor','end')
    .text(n=>[(window.DERIVE&&window.DERIVE[n.id])?'∑':'',(n.bridge&&n.bridge.length)?'⇄':'',(window.ANIM&&window.ANIM[(window.ANIM_FOR||{})[n.id]||n.anim])?'◈':'',(window.DEEP&&window.DEEP[n.id])?'✦':'',(window.REFMAP&&window.REFMAP[n.id])?'▤':''].join(''));
  NODES.forEach(n=>paintMastery(n.id));
}
function plateW(n){return Math.max(96,Math.min(200,Math.max(n.title.length*14,n.en.length*6.2)+26))}
function paintMastery(id){
  const b=box(id); const el=gNode.select(`[data-id="${id}"]`); if(el.empty())return;
  const n=NM[id]; el.select('.lv').attr('width',(plateW(n)-6)*b/5);
  el.select('.plate').attr('fill',b>=4?'rgba(20,52,40,.94)':b>=2?'rgba(40,36,18,.92)':null);
}
drawL0();

/* ---------- 4.2 二级下钻：星环套星环 ---------- */
let LV=0, LVD=null;                     // 0=全景 1=某块大陆内部
function subsOf(did){
  const S=SUBS[did]; const ns=NODES.filter(n=>n.dom===did);
  if(S&&S.length){
    const used=new Set(); const out=S.map(r=>{const list=(r.nodes||[]).filter(id=>NM[id]&&NM[id].dom===did);
      list.forEach(id=>used.add(id)); return {...r,list}});
    const rest=ns.filter(n=>!used.has(n.id));
    if(rest.length)out.push({k:'_rest',name:'其余',en:'OTHERS',one:'还没归到子区的牌子',list:rest.map(n=>n.id)});
    return out.filter(r=>r.list.length);
  }
  return [{k:'_all',name:DM[did].name,en:DM[did].en,one:DM[did].one||'',list:ns.map(n=>n.id)}];
}
let LVS=null;                           // 正在专看的子区 k（比如 计算台）
function enterDom(did,subk){
  const d=DM[did]; if(!d)return;
  if(LV===1&&LVD===did&&(LVS||null)===(subk||null))return;   // 已经在这个视图，别重画
  LV=1; LVD=did; LVS=subk||null;
  let regs=subsOf(did);
  if(subk){ regs=regs.filter(r=>r.k===subk); }                 // 只看这一摊
  else { regs=regs.map(r=>r.fold?{...r,list:[],gate:r}:r); }   // 折叠的那摊在二级也只留入口
  // 子区排布：一行最多 3 个
  const RW=820,RH=600,GX2=140,GY2=120,cols=Math.min(3,Math.max(1,Math.ceil(Math.sqrt(regs.length))));
  regs.forEach((r,i)=>{const row=Math.floor(i/cols),col=i%cols;
    r.rx=RW/2*(regs.length<=2?1.1:1); r.ry=RH/2*(regs.length<=2?1.05:1);
    r.cx=200+RW/2+col*(RW+GX2)+(row%2?RW*.28:0); r.cy=200+RH/2+row*(RH+GY2);});
  const inNodes=[]; regs.forEach(r=>r.list.forEach(id=>inNodes.push(NM[id])));
  layoutIn(regs,r=>r.list.map(id=>NM[id]).filter(Boolean));
  // 上层锚点：本大陆节点连出去的其他大陆节点（同页）
  const anchors=[]; const seen=new Set();
  inNodes.forEach(n=>(n.links||[]).forEach(t=>{const m=NM[t];
    if(m&&m.dom!==did&&!seen.has(t)){seen.add(t);anchors.push(m)}}));
  const bb2={x0:Math.min(...regs.map(r=>r.cx-r.rx)),x1:Math.max(...regs.map(r=>r.cx+r.rx)),
             y0:Math.min(...regs.map(r=>r.cy-r.ry)),y1:Math.max(...regs.map(r=>r.cy+r.ry))};
  const cx0=(bb2.x0+bb2.x1)/2, cy0=(bb2.y0+bb2.y1)/2, RR=Math.max(bb2.x1-bb2.x0,bb2.y1-bb2.y0)*.66;
  anchors.forEach((m,i)=>{const a=i/anchors.length*Math.PI*2-Math.PI/2;
    m._ax=cx0+Math.cos(a)*RR*1.28; m._ay=cy0+Math.sin(a)*RR*1.16;});
  // 画
  gLand.selectAll('*').remove(); gRoad.selectAll('*').remove(); gEdge.selectAll('*').remove(); gNode.selectAll('*').remove();
  regs.forEach((r,i)=>{const g=gLand.append('g').attr('class','land sub');
    g.append('path').attr('class','halo').attr('d',blob(r.cx,r.cy,r.rx+34,r.ry+34,i*2.1)).attr('fill',d.color);
    g.append('path').attr('class','fill').attr('d',blob(r.cx,r.cy,r.rx,r.ry,i*2.1)).attr('fill',d.color);
    g.append('path').attr('class','ring').attr('d',blob(r.cx,r.cy,r.rx,r.ry,i*2.1)).attr('stroke',d.color);
    g.append('text').attr('class','landname').attr('x',r.cx).attr('y',r.cy-r.ry+46).attr('fill',d.color).attr('font-size',24).text(r.name);
    g.append('text').attr('class','landen').attr('x',r.cx).attr('y',r.cy-r.ry+64).text(r.en||'');
    g.append('text').attr('class','landsub').attr('x',r.cx).attr('y',r.cy+r.ry-16).text(r.one||'');});
  // 边：区内 + 区间
  const E2=[]; inNodes.forEach(n=>(n.links||[]).forEach(t=>{const m=NM[t];
    if(m&&m.dom===did&&!E2.some(e=>e.a===t&&e.b===n.id))E2.push({a:n.id,b:t})}));
  gEdge.selectAll('path.edge').data(E2).enter().append('path').attr('class','edge').attr('stroke',d.color)
    .attr('d',e=>{const a=NM[e.a],b=NM[e.b];return `M${a.x},${a.y} Q${(a.x+b.x)/2},${(a.y+b.y)/2-50} ${b.x},${b.y}`});
  inNodes.forEach(n=>(n.links||[]).forEach(t=>{const m=NM[t]; if(m&&m.dom!==did)
    gEdge.append('path').attr('class','edge anchor').attr('stroke',DM[m.dom].color)
      .attr('d',`M${n.x},${n.y} L${m._ax},${m._ay}`)}));
  const sel=gNode.selectAll('g').data(inNodes).enter().append('g').attr('class','node')
    .attr('data-id',n=>n.id).attr('transform',n=>`translate(${n.x},${n.y})`)
    .on('click',(e,n)=>{e.stopPropagation();openNode(n.id,false);zoomNode(n)});
  sel.append('rect').attr('class','plate').attr('x',n=>-plateW(n)/2).attr('y',-19).attr('width',plateW).attr('height',38).attr('rx',14);
  sel.append('rect').attr('class','lv').attr('x',n=>-plateW(n)/2+3).attr('y',13).attr('height',3).attr('rx',1.5)
    .attr('width',n=>(plateW(n)-6)*box(n.id)/5).attr('fill','#5CE8A8');
  sel.append('text').attr('class','nzh').attr('y',-1).text(n=>n.title);
  sel.append('text').attr('class','nen').attr('y',12).text(n=>n.en);
  const asel=gNode.selectAll('g.anch').data(anchors).enter().append('g').attr('class','node anch')
    .attr('transform',m=>`translate(${m._ax},${m._ay})`)
    .on('click',(e,m)=>{e.stopPropagation();exitDom();openNode(m.id,true)});
  asel.append('rect').attr('class','plate').attr('x',m=>-plateW(m)/2).attr('y',-16).attr('width',plateW).attr('height',32).attr('rx',12);
  asel.append('text').attr('class','nzh').attr('y',1).attr('font-size',12).text(m=>m.title);
  asel.append('text').attr('class','nen').attr('y',12).attr('font-size',8.5).text(m=>DM[m.dom].name);
  const gateNodes=regs.filter(r=>r.gate).map(r=>({id:'gate:'+did+':'+r.k, isGate:1, dom:did, sub:r.k,
      title:r.name, en:(r.en||'')+' · '+r.gate.list.length+' 牌', gut:r.one||'', links:[],
      x:r.cx, y:r.cy+10}));
  const gsel=gNode.selectAll('g.gatep').data(gateNodes).enter().append('g').attr('class','node gate gatep')
    .attr('data-id',n=>n.id).attr('transform',n=>`translate(${n.x},${n.y})`)
    .on('click',(ev,n)=>{ev.stopPropagation();enterDom(did,n.sub)});
  gsel.append('rect').attr('class','plate').attr('x',n=>-plateW(n)/2).attr('y',-19).attr('width',plateW).attr('height',38).attr('rx',14);
  gsel.append('text').attr('class','nzh').attr('y',-1).text(n=>n.title);
  gsel.append('text').attr('class','nen').attr('y',12).text(n=>n.en);
  gsel.append('text').attr('class','ngate').attr('y',26).text('点开进去 →');
  // 视图与 HUD
  fitBox(bb2.x0-140,bb2.y0-140,bb2.x1+140,bb2.y1+140,600);
  crumb(d,regs.length,inNodes.length,E2.length,anchors.length,subk?regs[0]:null);
  minimap(did);
  location.hash='in='+did+(subk?'&s='+subk:'');
}
function fitBox(x0,y0,x1,y1,dur){
  const W=$('mapview').clientWidth,H=$('mapview').clientHeight;
  const k=Math.min(W/(x1-x0),H/(y1-y0));
  const t=d3.zoomIdentity.translate(W/2-k*(x0+x1)/2,H/2-k*(y0+y1)/2).scale(k);
  (dur?svg.transition().duration(dur):svg).call(zoom.transform,t);
}
function crumb(d,nr,nn,ne,na,sub){
  let c=$('crumb'); if(!c){c=document.createElement('div');c.id='crumb';$('mapview').appendChild(c)}
  c.innerHTML=d?`<button class="bk" id="cb_back">← ${sub?esc(d.name):esc(CFG.title)}</button>
      <b>${esc(d.name)}${sub?' › '+esc(sub.name):''}</b><s>${esc(sub?(sub.en||''):d.en)}</s>
      <button class="bk" id="cb_tour">▶ 场景巡游</button>
      <span class="ct">${nr} 区 · ${nn} 点 · ${ne} 边 · 含 ${na} 个上层锚点</span>`:'';
  c.style.display=d?'flex':'none';
  if(d){$('cb_back').onclick=exitDom; $('cb_tour').onclick=()=>tourPanel(true)}
}
function minimap(did){
  let m=$('minimap'); if(!m){m=document.createElement('div');m.id='minimap';$('mapview').appendChild(m)}
  if(!did){m.style.display='none';return}
  const xs=DOMS.map(d=>L0['d:'+d.id]);
  const x0=Math.min(...xs.map(v=>v.cx-v.rx)),x1=Math.max(...xs.map(v=>v.cx+v.rx));
  const y0=Math.min(...xs.map(v=>v.cy-v.ry)),y1=Math.max(...xs.map(v=>v.cy+v.ry));
  m.style.display='block';
  m.innerHTML=`<svg viewBox="${x0} ${y0} ${x1-x0} ${y1-y0}">${DOMS.map(d=>{const v=L0['d:'+d.id];
    return `<ellipse cx="${v.cx}" cy="${v.cy}" rx="${v.rx}" ry="${v.ry}" fill="${d.color}" opacity="${d.id===did?.75:.16}" data-d="${d.id}"/>`}).join('')}</svg>`;
  m.querySelectorAll('[data-d]').forEach(el=>el.onclick=()=>{const id=el.getAttribute('data-d');
    if(id===LVD)return; exitDom(); setTimeout(()=>enterDom(id),120)});
}
function exitDom(){
  if(LV===0)return;
  if(LVS){ const d=LVD; LVS=null; LVD=null; LV=0; enterDom(d); return; }   // 从"专看某摊"退回本大陆
  LV=0; LVD=null; crumb(null); minimap(null); closeDrawer();
  drawL0(); fitAll(500); location.hash='';
}

/* 缩放 */
const bb={x0:Math.min(...DOMS.map(d=>d.cx-d.rx))-80,y0:Math.min(...DOMS.map(d=>d.cy-d.ry))-80,
          x1:Math.max(...DOMS.map(d=>d.cx+d.rx))+80,y1:Math.max(...DOMS.map(d=>d.cy+d.ry))+80};
const zoom=d3.zoom().scaleExtent([.08,3]).on('zoom',e=>root.attr('transform',e.transform))
  .on('start',()=>$('mapview').classList.add('drag')).on('end',()=>$('mapview').classList.remove('drag'));
svg.call(zoom).on('dblclick.zoom',null);
function fitAll(dur=0){
  const W=$('mapview').clientWidth,H=$('mapview').clientHeight;
  const k=Math.min(W/(bb.x1-bb.x0),H/(bb.y1-bb.y0));
  const t=d3.zoomIdentity.translate(W/2-k*(bb.x0+bb.x1)/2,H/2-k*(bb.y0+bb.y1)/2).scale(k);
  (dur?svg.transition().duration(dur):svg).call(zoom.transform,t);
}
function zoomTo(d,dur=650){
  const W=$('mapview').clientWidth,H=$('mapview').clientHeight;
  const k=Math.min(W/(d.rx*2.3),H/(d.ry*2.3),1.6);
  svg.transition().duration(dur).call(zoom.transform,d3.zoomIdentity.translate(W/2-k*d.cx,H/2-k*d.cy).scale(k));
  mark4dom(d.id);
}
function zoomNode(n){
  const W=$('mapview').clientWidth,H=$('mapview').clientHeight,k=.92;
  svg.transition().duration(500).call(zoom.transform,d3.zoomIdentity.translate(W/2-k*n.x-140,H/2-k*n.y).scale(k));
}
function mark4dom(did){NODES.filter(n=>n.dom===did).forEach(n=>mark(n.id,'map'))}
(function(){const g=document.createElement('button');g.id='globtn';g.textContent='≡ 术语表';
  g.onclick=glossary; $('mapview').appendChild(g);})();
(function(){const b=document.createElement('button');b.id='tourbtn';b.textContent='▶ 场景巡游';
  b.onclick=()=>tourPanel(!$('tourpanel')||!$('tourpanel').classList.contains('on'));
  $('mapview').appendChild(b);})();
$('zin').onclick=()=>svg.transition().call(zoom.scaleBy,1.4);
$('zout').onclick=()=>svg.transition().call(zoom.scaleBy,1/1.4);
$('zfit').onclick=()=>fitAll(500);
addEventListener('resize',()=>fitAll(0));
fitAll(0);

/* 图例 */
$('legend').innerHTML='<b>大陆 LANDS</b>'+DOMS.map(d=>`<div data-d="${d.id}" style="cursor:pointer"><i style="background:${d.color}"></i>${esc(d.name)} <span style="color:#7d746a">${esc(d.en)}</span> · ${NODES.filter(n=>n.dom===d.id).length}</div>`).join('')
 +'<div style="margin-top:6px;color:#7d746a">点大陆看面板 · <b style="color:#FFC46B">双击大陆进二级</b><br>∑ 推导 · ⇄ 桥 · ◈ 动画 · ✦ 深挖 · ▤ 书</div>';
$('legend').onclick=e=>{const r=e.target.closest('[data-d]'); if(r){zoomTo(DM[r.dataset.d]);openDom(r.dataset.d)}};

/* 搜索 */
$('search').oninput=()=>{
  const q=$('search').value.trim().toLowerCase();
  nSel.classed('dim',n=>q&&!((n.title||'')+(n.en||'')+(n.gut||'')+(n.formula||'')).toLowerCase().includes(q));
  eSel.classed('dim',e=>q&&!((NM[e.a].title+NM[e.b].title).toLowerCase().includes(q)));
};
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('search').focus();$('search').select()}
  if(e.key==='Escape'){ if($('drawer').classList.contains('on'))closeDrawer(); else if(LV===1)exitDom(); }});

/* ---------- 4.5 大陆面板 ---------- */
function openDom(did){
  const d=DM[did]; if(!d)return; const ns=NODES.filter(n=>n.dom===did);
  stopAnim(); CUR=null; nSel.classed('sel',false); eSel.classed('hot',false);
  const boxed=b=>ns.filter(n=>box(n.id)>=b).length;
  const rt=RT[did];
  const card=n=>{const b=box(n.id);
    return `<div class="dnode b${b}" data-go="${n.id}"><b>${esc(n.title)}</b><s>${esc(n.en)}</s>
      <em>${esc(n.gut)}</em><i>${(window.ANIM&&window.ANIM[n.anim])?'◈ ':''}${(window.DEEP&&window.DEEP[n.id])?'✦ ':''}${allDrills(n).length+(n.gen?'+':'')} 题</i></div>`};
  /* 牌子按二级子区分组列出，别堆成一长串 —— 大陆一多就找不到东西 */
  const SB=(SUBS[did]||[]).filter(g=>g.nodes.some(id=>NM[id]));
  const seen={}; SB.forEach(g=>g.nodes.forEach(id=>seen[id]=1));
  const rest=ns.filter(n=>!seen[n.id]);
  const grid = SB.length
    ? SB.map(g=>{const gn=g.nodes.filter(id=>NM[id]);
        const done=gn.filter(id=>box(id)>=3).length;
        return `<div class="subhead"><b>${esc(g.name)}</b><s>${esc(g.en)}</s>
          <i>${gn.length} 张 · 熟 ${done}</i><em>${esc(g.one||'')}</em></div>
          <div class="dgrid">${gn.map(id=>card(NM[id])).join('')}</div>`}).join('')
      + (rest.length?`<div class="subhead"><b>其他</b><s>OTHERS</s><i>${rest.length} 张</i></div>
          <div class="dgrid">${rest.map(card).join('')}</div>`:'')
    : `<div class="dgrid">${ns.map(card).join('')}</div>`;
  $('dbody').innerHTML=`
    <span class="chip" style="background:${d.color}">大陆 · LAND</span>
    <h2>${esc(d.name)}</h2><div class="en">${esc(d.en)}${d.book?' · '+esc(d.book):''}</div>
    ${d.one?`<div class="f gut"><div class="k">这块在干什么</div><div class="v">${md(d.one)}</div></div>`:''}
    <div class="stats"><div class="stat"><b>${ns.length}</b><small>牌子</small></div>
      <div class="stat"><b>${boxed(1)}</b><small>碰过</small></div>
      <div class="stat"><b>${boxed(3)}</b><small>熟练</small></div>
      <div class="stat"><b>${ns.filter(n=>due(n.id)).length}</b><small>今日到期</small></div></div>
    <div class="row"><button class="pill on" id="dm_enter">▣ 进二级 · 看这块的内部</button>
      <button class="pill" id="dm_drill">进这块的秒答场</button>${rt?'<button class="pill" id="dm_route">看判型树</button>':''}</div>
    ${rt?`<div class="f fold" id="dm_rt"><div class="fh"><div class="k">判型 · 看到题先问什么</div><span class="ar">▾</span></div><div class="fb"><div class="rtree">${routeHTML(rt.root,0)}</div></div></div>`:''}
    ${grid}`;
  $('drawer').classList.add('on'); $('mapview').classList.add('dopen'); $('drawer').scrollTop=0; location.hash='d='+did;
  $('dbody').querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>openNode(el.dataset.go,true));
  const be=$('dm_enter'); if(be)be.onclick=()=>{closeDrawer();enterDom(did)};
  const b1=$('dm_drill'); if(b1)b1.onclick=()=>{AF=did;showView('arena')};
  const b2=$('dm_route'); if(b2)b2.onclick=()=>{RSEL=did;showView('route')};
  const f=$('dm_rt'); if(f)f.querySelector('.fh').onclick=()=>f.classList.toggle('on');
  ns.forEach(n=>mark(n.id,'map'));
}

/* ---------- 5. 抽屉 ---------- */
let CUR=null, ANIMH=null, TIMER=null;
function closeDrawer(){$('drawer').classList.remove('on');$('mapview').classList.remove('dopen');stopAnim();
  if(nSel)nSel.classed('sel',false); if(eSel)eSel.classed('hot',false);
  gNode.selectAll('.node').classed('sel',false)}
$('close').onclick=closeDrawer;
function stopAnim(){ if(ANIMH&&ANIMH.stop)try{ANIMH.stop()}catch(e){} ANIMH=null; if(TIMER){clearInterval(TIMER);TIMER=null} }
function openNode(id,zoomIt){
  const n=NM[id]; if(!n)return;
  if(FOLDED[id]&&(LV===0||LVD!==n.dom||LVS!==FOLDED[id].sub)){ enterDom(n.dom,FOLDED[id].sub); }  // 收在计算台里的牌子：先进那一摊
  CUR=n; stopAnim();
  const d=DM[n.dom]; showView('map');
  if(nSel)nSel.classed('sel',x=>x.id===id); if(eSel&&LV===0)eSel.classed('hot',e=>e.a===id||e.b===id);
  if(LV===1)gNode.selectAll('.node').classed('sel',function(){return this.getAttribute('data-id')===id});
  if(zoomIt!==false)zoomNode(n);
  location.hash='n='+id; mark(id,'map');
  const F=(k,v,cls='')=>v?`<div class="f ${cls}"><div class="k">${k}</div><div class="v">${md(v)}</div></div>`:'';
  const AF=(window.ANIM_FOR||{})[n.id]||n.anim;
  const A=window.ANIM&&window.ANIM[AF];
  const links=(n.links||[]).filter(t=>NM[t]);
  const bridges=(n.bridge||[]);
  $('dbody').innerHTML=`
    <span class="chip" style="background:${d.color}">${esc(d.name)} · ${esc(d.en)}</span>
    <h2>${esc(n.title)}</h2><div class="en">${esc(n.en)}${n.book?' · '+esc(n.book):''}</div>
    ${F('一句直觉 GUT',n.gut,'gut')}
    ${TOOLNODES[n.id]?`<div class="f toolf"><div class="k">练习器 · 直接在这里练</div>
      <div class="toolbar">${TOOLNODES[n.id].map((t,i)=>`<button class="pill${i?'':' on'}" data-tool="${i}">${esc(t.t)}</button>`).join('')}</div>
      <div class="toolone" id="toolone">${esc(TOOLNODES[n.id][0].one)}</div>
      <div class="toolwrap"><iframe id="toolframe" src="${TOOLNODES[n.id][0].f}" title="${esc(TOOLNODES[n.id][0].t)}"></iframe></div>
      <a class="calcbtn" id="toolopen" href="${TOOLNODES[n.id][0].f}" target="_blank">↗ 单独开一页，全屏练</a></div>`:''}
    ${LABNODES[n.id]!==undefined?`<div class="f calcf"><div class="k">计算台 · 这一条在台面上长什么样</div>
      <a class="calcbtn" href="tools/labcalc.html#${esc(LABNODES[n.id])}" target="_blank">▤ 打开实时计算卡</a>
      <div style="font-size:11.5px;color:#7d746a;margin-top:5px">输入就出结果，带量纲校验和一张跟着变的图</div></div>`:''}
    <div class="screen"><div class="sh"><b>${A?esc(A.title):'投影墙'}</b><s>${A?esc(A.en||''):''}</s><span style="margin-left:auto;font-size:11px">直觉 · INTUITION</span></div>
      <div class="stage" id="stage"></div><div class="ctrls" id="ctrls"></div>
      <div class="figbar" id="figbar"></div>
      <div class="ctrls" style="justify-content:center;gap:6px">
        <button id="figgo" style="flex:1">▶ 分步讲解</button>
        <button id="s3go" style="flex:1">◈ 立体图 · 拖着转</button></div>
      <div class="s3wrap" id="s3wrap"><div class="s3h">立体图 · 拖着转 · 滚轮缩放</div>
        <div id="s3box"></div><div class="ctrls" id="s3ctrl"></div></div>${A?`<div class="cap">${esc(A.cap||'')}</div>`:''}</div>
    ${F('脑中画面 SEE',n.see)}
    ${F('为什么 WHY · 第一性',n.why)}
    ${F('公式 / 代码',n.formula,'formula')}
    ${F('坑 TRAP',n.trap,'trap')}
    <div id="deepbox"></div>
    <div id="bookbox"></div>
    <div class="drill" id="drill"></div>
    <div class="f"><div class="k">九步 · 这一块你走到哪</div><div class="steps" id="steps"></div></div>
    ${links.length?`<div class="f"><div class="k">同页相连 LINKS</div>${links.map(t=>`<span class="chip lite" data-go="${t}">${esc(NM[t].title)}</span>`).join('')}</div>`:''}
    ${bridges.length?`<div class="f"><div class="k">桥 → ${esc(CFG.other.name)}</div>${bridges.map(t=>`<span class="chip bridge" data-bridge="${t}">⇄ ${esc(t)}</span>`).join('')}<div style="font-size:11.5px;color:#7d746a;margin-top:4px">点桥 = 跳到另一页同一个概念的代码/数学版本（直接原则）</div></div>`:''}`;
  $('drawer').classList.add('on'); $('mapview').classList.add('dopen'); $('drawer').scrollTop=0;
  figStop(); runAnim(n,A,d); drillNew(n); renderSteps(n); renderDeep(n); renderBooks(n);
  const fg=$('figgo'); if(fg)fg.onclick=()=>figStart(n);
  if(S3STOP){S3STOP();S3STOP=null}
  const s3=$('s3go'); if(s3)s3.onclick=()=>s3Toggle(n);
  $('dbody').querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{
    const T=TOOLNODES[n.id][+b.dataset.tool]; if(!T)return;
    $('dbody').querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('on',x===b));
    $('toolframe').src=T.f; $('toolone').textContent=T.one; $('toolopen').href=T.f; mark(n.id,'drill');
  });
  $('dbody').querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>openNode(el.dataset.go,true));
  $('dbody').querySelectorAll('[data-bridge]').forEach(el=>el.onclick=()=>{mark(n.id,'direct');location.href=CFG.other.file+'#n='+el.dataset.bridge});
}
/* 动画 */
function runAnim(n,A,d){
  const stage=$('stage'),ctrls=$('ctrls'); stage.innerHTML=''; ctrls.innerHTML='';
  if(!A){stage.innerHTML='<div class="noanim">这一块还没有动画 · 先用脑中画面自己画</div>';stage.style.height='120px';return}
  stage.style.height='340px';
  const api={W:stage.clientWidth||520,H:340,color:d.color,
    slider(label,min,max,step,val,cb){const l=document.createElement('label');l.innerHTML=`<span>${esc(label)}</span>`;
      const i=document.createElement('input');i.type='range';i.min=min;i.max=max;i.step=step;i.value=val;
      const o=document.createElement('span');o.textContent=val;o.style.minWidth='34px';o.style.fontFamily='ui-monospace,Menlo,monospace';
      i.oninput=()=>{o.textContent=i.value;cb(+i.value)};l.append(i,o);ctrls.appendChild(l);return i;},
    button(label,cb){const b=document.createElement('button');b.textContent=label;b.onclick=cb;ctrls.appendChild(b);return b;},
    play(fn){let on=true,t0=performance.now();const lp=now=>{if(!on)return;try{fn((now-t0)/1000)}catch(e){on=false;console.error(e)}requestAnimationFrame(lp)};requestAnimationFrame(lp);return()=>{on=false}}};
  const stops=[]; const _play=api.play; api.play=fn=>{const s=_play(fn);stops.push(s);return s};
  try{ const h=A.make(stage,api)||{}; ANIMH={stop(){stops.forEach(s=>s());h.stop&&h.stop()},st:h.stepper||null}; mark(n.id,'anim'); }
  catch(e){console.error(n.anim,e);stage.innerHTML=`<div class="noanim">动画出错：${esc(e.message)}</div>`}
}
/* ---------- 书：去读（PDF 定位）/ 去跑（代码内嵌） ---------- */
/* 站内练习器：某些牌子直接把 tools/ 下的小站嵌进抽屉里练 */
const TOOLNODES={
  'ns.abacus':[{t:'心像训练器',f:'tools/abacus.html',one:'珠形闪一下 → 报数。先单档，正确率 95% 再缩短闪示时间'},
               {t:'口诀演示',f:'tools/abacus_list.html',one:'点珠子手动拨 · 点口诀卡看动画：珠形 ↔ 读数两个方向都练'}]
};
const LABNODES={"ns.units": "", "ns.dilution": "dilute", "ns.serial": "serial", "ns.molar": "weigh", "ns.percent_wv": "wv", "ns.cellcount": "count", "ns.seeding": "seed", "ns.bioratio": "ratio", "ns.rcf": "spin", "ns.beer": "absorb", "ns.nucleic": "nucleic", "ns.nanoparticle": "particle", "ns.binding": "kd", "ns.dosing": "dose"};
const BK=window.BOOKS||{}, RF=window.REFS||{}, RM=window.REFMAP||{};
const DV=window.DERIVE||{};
const DP=window.DEEP||{}, MD=window.MORE||{}, RT=window.ROUTES||{}, PL=window.PLAN||null;
const TS=(window.TOURS||[]);
const SUBS=window.SUBS||{}; const VID=window.VIDEOS||{};
const IX=window.IX||{}, DX=window.DX||{}, TO=window.TOUR_ORDER||null;
const nodeTitle=id=>NM[id]?NM[id].title:(IX[id]?IX[id].t:id);
const nodePage=id=>NM[id]?CFG.page:(IX[id]?IX[id].p:null);
const enc=encodeURIComponent;
const bkurl=(b,c)=>{if(window.NOBOOKS)return null;const bo=BK[b];if(!bo)return null;const ch=bo.chs.find(x=>x.c===c);if(!ch)return null;
  return {pdf:'_books/'+enc(bo.dir)+'/'+enc(ch.pdf),zh:bo.zh,cz:ch.zh,c:ch.c,b:+b,codes:ch.codes,cdir:ch.cdir,dir:bo.dir,secs:ch.secs||[]};};
const secOf=(u,s)=>{ if(!u||!s)return null; const f=u.secs.find(x=>x.s===s); return f?{...f,url:u.pdf+'#page='+f.p}:null; };
const cdurl=(b,c,f)=>{if(window.NOBOOKS)return null;const bo=BK[b];if(!bo)return null;const ch=bo.chs.find(x=>x.c===c);if(!ch||!ch.cdir)return null;
  return '_books/'+enc(bo.dir)+'/'+enc(ch.cdir)+'/'+enc(f);};
const rfurl=(k,p)=>{if(window.NOBOOKS)return null;const r=RF[k];if(!r)return null;return '_refs/'+enc(r.file)+'#page='+(p||1);};
/* ---------- 深化层：判型 / 深挖 / 例题 / 易错 / 费曼 / 用在哪 ---------- */
function routeHTML(node,depth){
  if(!node) return '';
  if(node.go){ const t=NM[node.go]; return `<div class="rleaf" data-go="${node.go}">→ ${t?esc(t.title):esc(node.go)}${node.note?`<em>${esc(node.note)}</em>`:''}</div>`; }
  return `<div class="rnode"><div class="rq">${esc(node.q||'')}</div>
    <div class="rbr">${(node.a||[]).map(b=>`<div class="rb"><span class="rc">${esc(b.c)}</span>
      ${typeof b.to==='string'?`<div class="rt">${esc(b.to)}</div>`:routeHTML(b.to,depth+1)}</div>`).join('')}</div></div>`;
}
function fold(k,title,en,body,open){
  return `<div class="f fold${open?' on':''}"><div class="fh"><div class="k">${title} <span style="text-transform:none;letter-spacing:0;font-weight:500;color:var(--muted)">${en}</span></div><span class="ar">▾</span></div><div class="fb">${body}</div></div>`;
}
function deriveHTML(n){
  const V=DV[n.id]; if(!V)return '';
  let h='';
  if(V.layers) h+=fold('layers','三种看法 · 同一个东西的三副面孔','THREE VIEWS',
    `<div class="lay"><div><b>代数</b>${md(V.layers.alg||'')}</div>
      <div><b>几何</b>${md(V.layers.geo||'')}</div>
      <div><b>计算</b>${md(V.layers.comp||'')}</div></div>`);
  if(V.proof) h+=fold('proof','推导 · 从零走到结论','DERIVATION',
    `<div class="prf"><div class="pf"><s>从</s>${esc(V.proof.from||'')}</div>
      <div class="pf"><s>到</s>${esc(V.proof.to||'')}</div>
      <ol>${(V.proof.steps||[]).map(st=>`<li><b>${esc(st[0])}</b><span>${esc(st[1]||'')}</span></li>`).join('')}</ol>
      <div class="pe">${md(V.proof.end||'')}</div></div>`);
  if(V.scratch) h+=fold('scratch','从零实现 · 自己跑一遍','FROM SCRATCH',
    `<div class="scr"><pre class="cdview on">${esc(V.scratch.code||'')}</pre>
      <div class="so"><s>输出</s><pre>${esc(V.scratch.out||'')}</pre></div>
      ${V.scratch.note?`<div class="sn">${md(V.scratch.note)}</div>`:''}
      <div class="tbtn"><button class="cpy" data-copy="1">复制代码</button></div></div>`);
  if(V.contrast&&V.contrast.length) h+=fold('contrast','边界 · 别和这些混了','CONTRAST',
    `<div class="ctr">${V.contrast.map(c=>`<div class="cx"><b>vs ${esc(c.vs)}</b>
      <div><s>像在</s>${esc(c.same||'')}</div><div><s>差在</s>${esc(c.diff||'')}</div><div><s>怎么选</s>${esc(c.when||'')}</div></div>`).join('')}</div>`);
  if(V.ext&&V.ext.length) h+=fold('ext','往上长 · 这东西的推广','EXTENDS',
    `<div class="ext">${V.ext.map(e=>e.go&&NM[e.go]?`<div class="e" data-go="${e.go}">${esc(e.t)} <i>→ ${esc(nodeTitle(e.go))}</i></div>`:`<div class="e">${esc(e.t)}</div>`).join('')}</div>`);
  return h;
}
function renderDeep(n){
  const box=$('deepbox'); if(!box) return; const D=DP[n.id];
  if(!D){box.innerHTML='';return}
  let h='';
  if(D.route&&D.route.length) h+=fold('route','判型 · 看到题先问什么','ROUTE',
      (Array.isArray(D.route)?D.route:[D.route]).map(r=>routeHTML(r,0)).join(''),true);
  if(D.deep) h+=fold('deep','深挖 · 这东西到底在说什么','DEEP',`<div class="v">${md(D.deep)}</div>`);
  if(D.worked&&D.worked.length) h+=fold('worked','例题 · 每一步为什么这么走','WORKED',
      D.worked.map((w,i)=>`<div class="wk"><div class="wq">${i+1}. ${esc(w.q)}</div>
        <ol>${(w.steps||[]).map(st=>`<li><b>${esc(st[0])}</b><span>${esc(st[1]||'')}</span></li>`).join('')}</ol>
        <div class="wa">答：${esc(w.a)}</div>${w.meta?`<div class="wm">套路：${esc(w.meta)}</div>`:''}</div>`).join(''));
  if(D.pit&&D.pit.length) h+=fold('pit','易错 · 会在这儿摔','PITFALLS',
      D.pit.map(p=>`<div class="pit"><b>${esc(p.t)}</b><span>${esc(p.why||'')}</span><em>改：${esc(p.fix||'')}</em></div>`).join(''));
  if(D.feyn&&D.feyn.length) h+=fold('feyn','费曼自测 · 讲不出就是没懂','FEYNMAN',
      `<ol class="fy">${D.feyn.map(q=>`<li>${esc(q)}</li>`).join('')}</ol>
       <div class="fybtn"><button id="feyndone">三条都能讲出来 · 点亮费曼格</button></div>`);
  if(D.exam) h+=fold('exam','用在哪 · 考法与课题','IN USE',`<div class="v">${md(D.exam)}</div>`);
  h+=deriveHTML(n);
  box.innerHTML=h;
  box.querySelectorAll('.fold .fh').forEach(el=>el.onclick=()=>el.parentNode.classList.toggle('on'));
  box.querySelectorAll('[data-go]').forEach(el=>el.onclick=e=>{e.stopPropagation();openNode(el.dataset.go,true)});
  const fb=$('feyndone'); if(fb) fb.onclick=e=>{e.stopPropagation();mark(n.id,'feyn');renderSteps(n);fb.textContent='已点亮 ✓'};
  box.querySelectorAll('[data-copy]').forEach(b=>b.onclick=e=>{e.stopPropagation();
    const code=b.closest('.scr').querySelector('pre').textContent;
    navigator.clipboard&&navigator.clipboard.writeText(code); b.textContent='已复制'; mark(n.id,'direct'); setTimeout(()=>b.textContent='复制代码',1500)});
}
function fmtCode(url,raw){
  const t=raw.replace(/\r/g,'');
  if(!/\.ipynb(\?|$)/.test(url)) return t.replace(/^\s*#{5,}[\s\S]*?#{5,}\s*/,'').trim();
  try{ const nb=JSON.parse(t); const out=[];
    (nb.cells||[]).forEach(c=>{ const src=(Array.isArray(c.source)?c.source.join(''):c.source||'').replace(/\s+$/,'');
      if(!src)return;
      if(c.cell_type==='markdown') out.push(src.split('\n').map(l=>'# '+l).join('\n'));
      else out.push(src); });
    return out.join('\n\n').replace(/^\s*#{5,}[\s\S]*?#{5,}\s*/,'').trim()||'（空 notebook）';
  }catch(e){ return t.slice(0,4000); }
}
function videoHTML(n){
  const vs=VID[n.id]; if(!vs||!vs.length)return '';
  return `<div class="f vids"><div class="k">看视频 <span style="text-transform:none;letter-spacing:0;font-weight:500">别人已经把这块讲透了，站在肩膀上</span></div>
    ${vs.map(v=>`<a class="vid" href="${esc(v.u)}${v.t?('&t='+v.t+'s'):''}" target="_blank" rel="noopener" data-read="1">
      <b>${esc(v.n)}</b><em>${esc(v.by||'')}${v.t?' · 从 '+Math.floor(v.t/60)+':'+String(v.t%60).padStart(2,'0')+' 开始':''}</em>
      <i>${esc(v.why||'')}</i></a>`).join('')}</div>`;
}
function renderBooks(n){
  const box=$('bookbox'); const m=RM[n.id]; if(!box)return;
  if(window.NOBOOKS){ box.innerHTML=videoHTML(n)+`<div class="f"><div class="k">书 · 去读</div>
    <div style="font-size:12px;color:#7d746a">手机 / iPad 版没带 PDF（几百 MB，放不进来）。书在电脑上的完整版里，这里先看动画和秒答。</div></div>`; return }
  if(!m){box.innerHTML=videoHTML(n);return}
  const bs=(m.books||[]).map(x=>{const u=bkurl(x.b,x.c); if(!u)return'';
    const hit=x.s?secOf(u,x.s):null;
    const head=hit?`<a class="bkchip" target="_blank" href="${hit.url}" data-read="1">${esc(u.zh)} ${esc(hit.s)} ${esc(hit.t)}<em>${esc(x.why||'')} · 第${u.c}章 p.${hit.p}</em></a>`
                 :`<a class="bkchip" target="_blank" href="${u.pdf}" data-read="1">${esc(u.zh)} 第${u.c}章 · ${esc(u.cz)}<em>${esc(x.why||'')}</em></a>`;
    const others=u.secs.filter(sc=>!hit||sc.s!==hit.s);
    return head+(others.length?`<div class="secs">${others.map(sc=>`<a class="sec" target="_blank" href="${u.pdf}#page=${sc.p}" data-read="1"><b>${esc(sc.s)}</b> ${esc(sc.t)}<span>p.${sc.p}</span></a>`).join('')}</div>`:'');}).join('');
  const rs=(m.refs||[]).map(x=>{const u=rfurl(x.k,x.p);const r=RF[x.k];return u?`<a class="bkchip ref" target="_blank" href="${u}" data-read="1">${esc(r.zh)} · ${esc(x.t||('p.'+x.p))}<em>${esc(x.why||'')}</em></a>`:''}).join('');
  const cs=(m.codes||[]).map((x,i)=>{const u=cdurl(x.b,x.c,x.f);return u?`<div class="cdrow"><button class="bkchip code" data-code="${u}" data-i="${i}">▶ ${esc(x.f)}<em>${esc(x.why||'')}</em></button><pre class="cdview" id="cd${i}"></pre></div>`:''}).join('');
  box.innerHTML=videoHTML(n)+`<div class="f books"><div class="k">书 · 去读 <span style="text-transform:none;letter-spacing:0;font-weight:500">点开是本地 PDF，直接跳到那一章</span></div>
    <div class="bkwrap">${bs}${rs||''}</div>
    ${cs?`<div class="k" style="margin-top:12px">书里的代码 · 去跑 <span style="text-transform:none;letter-spacing:0;font-weight:500">直接原则：看完动画就跑一遍</span></div><div class="cdwrap">${cs}</div>`:''}</div>`;
  box.querySelectorAll('[data-read]').forEach(a=>a.onclick=()=>mark(n.id,'direct'));
  box.querySelectorAll('[data-code]').forEach(b=>b.onclick=async()=>{
    const pre=$('cd'+b.dataset.i); if(pre.classList.contains('on')){pre.classList.remove('on');b.textContent=b.textContent.replace('▼','▶');return}
    if(!pre.dataset.load){ pre.textContent='读取中…';
      try{const raw=await fetch(b.dataset.code).then(r=>r.ok?r.text():Promise.reject(r.status));
        pre.textContent=fmtCode(b.dataset.code,raw); pre.dataset.load='1';}
      catch(e){pre.textContent='读不到（要经 start.command 起的服务打开，不能双击 html）：'+e}}
    pre.classList.add('on'); b.firstChild.nodeValue=b.firstChild.nodeValue.replace('▶','▼'); mark(n.id,'direct');
  });
}

/* ---------- 新手引导：五步教会怎么用 ---------- */
const ONB=[
 {t:'这是一张星图，不是一本书',d:'25 块大陆 280 张牌子。牌子上的小符号：∑ 有推导 · ⇄ 有桥通到另一页 · ◈ 有动画 · ✦ 有深挖 · ▤ 有书。',do:'先扫一眼图例（左下角）'},
 {t:'双击大陆 = 进二级',d:'每块大陆里面还分子区，像星环套星环。面包屑能返回，右下小地图能横跳。',do:'双击任意一块大陆试试'},
 {t:'点牌子 = 打开这一块的全部',d:'一句直觉 → 动画（可拖滑杆）→ 判型 → 深挖 → 例题 → 易错 → 费曼自测 → 推导 → 从零实现（真跑过的代码）→ 秒答 → 书与代码。',do:'点一张牌子，从上往下滑一遍'},
 {t:'不知道从哪开始？走巡游',d:'15 条场景路线，四层递进。镜头会带着你飞，每站告诉你"为什么下一站是它"。',do:'点左上「▶ 场景巡游」'},
 {t:'练反射：秒答场 + 道场',d:'题出来先在脑子里弹答案再翻开，3 秒内算秒出。自评 1/2/3 进 Leitner 盒，到期自动回来找你。',do:'顶栏「秒答场」→ 道场 60 秒'}
];
function onboard(force){
  const st=LS('ui'); if(!force&&st.onb)return;
  let el=$('onb'); if(!el){el=document.createElement('div');el.id='onb';$('mapview').appendChild(el)}
  let i=0;
  const draw=()=>{const o=ONB[i];
    el.innerHTML=`<div class="ob"><div class="oh">上手 ${i+1}/${ONB.length}<button class="x" id="ob_x">跳过</button></div>
      <b>${esc(o.t)}</b><div class="od">${esc(o.d)}</div><div class="oa">${esc(o.do)}</div>
      <div class="obt">${i>0?'<button id="ob_p">← 上一步</button>':''}
        <button class="pri" id="ob_n">${i===ONB.length-1?'开始用':'下一步 →'}</button></div>
      <div class="odots">${ONB.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div></div>`;
    el.classList.add('on');
    $('ob_x').onclick=done; $('ob_n').onclick=()=>{ if(i===ONB.length-1)return done(); i++; draw(); };
    const bp=$('ob_p'); if(bp)bp.onclick=()=>{i--;draw()};
  };
  const done=()=>{el.classList.remove('on');const s2=LS('ui');s2.onb=Date.now();SV('ui',s2)};
  draw();
}

/* ---------- 术语表：全站中英速查 ---------- */
let GLO=null;
function glossary(){
  let el=$('gloss');
  if(!el){el=document.createElement('div');el.id='gloss';$('mapview').appendChild(el)}
  if(el.classList.contains('on')){el.classList.remove('on');return}
  el.classList.add('on');
  const rows=[];
  Object.keys(IX).forEach(id=>{const x=IX[id];rows.push({id,zh:x.t,en:x.e||'',dom:x.d,page:x.p})});
  rows.sort((a,b)=>(a.en||'zzz').localeCompare(b.en||'zzz'));
  const draw=q=>{
    const list=rows.filter(r=>!q||(r.zh+r.en+r.id).toLowerCase().includes(q.toLowerCase()));
    $('glo_l').innerHTML=list.slice(0,300).map(r=>{const d=DX[r.dom]||{};
      return `<div class="gr ${r.page===CFG.page?'':'o'}" data-go="${r.id}" data-p="${r.page}">
        <b>${esc(r.en||r.zh)}</b><s>${esc(r.zh)}</s>
        <i style="color:${d.color||'#888'}">${esc(d.name||r.dom)}</i></div>`}).join('')
      +(list.length>300?`<div class="gm">还有 ${list.length-300} 条，接着打字筛</div>`:'');
    $('glo_c').textContent=list.length+' / '+rows.length;
    $('glo_l').querySelectorAll('[data-go]').forEach(a=>a.onclick=()=>{
      const id=a.dataset.go;
      if(a.dataset.p===CFG.page){glossary();showView('map');openNode(id,true)}
      else location.href=CFG.other.file+'#n='+id;});
  };
  el.innerHTML=`<div class="gh"><b>术语表</b><span id="glo_c"></span><button class="x" id="glo_x">×</button></div>
    <input id="glo_q" placeholder="搜中文 / 英文 / id…" autocomplete="off">
    <div class="gl" id="glo_l"></div>
    <div class="gf">灰色的在另一页，点了会跳过去</div>`;
  draw(''); $('glo_q').focus();
  $('glo_q').oninput=e=>draw(e.target.value);
  $('glo_x').onclick=glossary;
}

/* ---------- 立体图：把 2D 概念立起来转 ---------- */
const S3={   // 每个 key 给一组 3D 点/线，engine 负责投影+旋转
  surface:(f,n=22,R=3)=>{const P=[],L=[];
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-R+2*R*i/(n-1),y=-R+2*R*j/(n-1);P.push([x,y,f(x,y)]);}
    const id=(i,j)=>i*n+j;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){if(i<n-1)L.push([id(i,j),id(i+1,j)]);if(j<n-1)L.push([id(i,j),id(i,j+1)]);}
    return {P,L};},
  cloud:(m=160,seed=7)=>{let s=seed;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647-.5};
    const P=[];for(let i=0;i<m;i++){const a=rnd()*4,b=rnd()*1.4,c=rnd()*.7;
      P.push([a*.9+b*.35, a*.45-b*.8, c*1.6]);}return {P,L:[]};},
  axes:(R=3.2)=>({P:[[0,0,0],[R,0,0],[0,R,0],[0,0,R]],L:[[0,1],[0,2],[0,3]]})
};
function fig3d(kind,node){
  const box=$('s3box'); if(!box)return;
  const W=box.clientWidth||430,H=300;
  let rx=-.55, rz=.6, auto=true, zoom=1, drag=null, t0=performance.now(), raf=null;
  const data = kind==='bowl' ? S3.surface((x,y)=>(x*x*.35+y*y*.9)*.42)
            : kind==='saddle'? S3.surface((x,y)=>(x*x-y*y)*.22)
            : kind==='wave'  ? S3.surface((x,y)=>Math.sin(Math.hypot(x,y)*1.6)*1.1)
            : kind==='cloud' ? S3.cloud() : S3.surface((x,y)=>-Math.exp(-(x*x+y*y)/4)*2.2);
  const ax=S3.axes();
  const cv=document.createElement('canvas'); cv.width=W*2; cv.height=H*2; cv.style.width='100%'; cv.style.height=H+'px';
  box.innerHTML=''; box.appendChild(cv); const g=cv.getContext('2d'); g.scale(2,2);
  const proj=([x,y,z])=>{ const ca=Math.cos(rz),sa=Math.sin(rz);
    let X=x*ca-y*sa, Y=x*sa+y*ca, Z=z;
    const cb=Math.cos(rx),sb=Math.sin(rx); const Y2=Y*cb-Z*sb, Z2=Y*sb+Z*cb;
    const k=46*zoom/(1+Z2*.04);
    return [W/2+X*k, H/2+Y2*k*.72 - Z2*k*.42]; };
  const zs=data.P.map(p=>p[2]); const zmin=Math.min(...zs), zmax=Math.max(...zs)||1;
  const hue=z=>{const t=(z-zmin)/((zmax-zmin)||1);
    const c1=[59,232,255], c2=[139,108,255], c3=[255,196,107];
    const m=t<.5?[c1,c2,t*2]:[c2,c3,(t-.5)*2];
    return `rgb(${Math.round(m[0][0]+(m[1][0]-m[0][0])*m[2])},${Math.round(m[0][1]+(m[1][1]-m[0][1])*m[2])},${Math.round(m[0][2]+(m[1][2]-m[0][2])*m[2])})`;};
  let ball=[2.3,1.6];
  function draw(t){
    g.clearRect(0,0,W,H);
    const segs=data.L.map(([a,b])=>{const A=data.P[a],B=data.P[b];
      return {p:proj(A),q:proj(B),z:(A[2]+B[2])/2, d:(A[0]+A[1]+B[0]+B[1])/4};});
    segs.sort((x,y)=>x.d-y.d);
    segs.forEach(sg=>{g.strokeStyle=hue(sg.z);g.globalAlpha=.42;g.lineWidth=.9;
      g.beginPath();g.moveTo(sg.p[0],sg.p[1]);g.lineTo(sg.q[0],sg.q[1]);g.stroke();});
    g.globalAlpha=1;
    if(!data.L.length){ data.P.forEach(P=>{const p=proj(P);
      g.fillStyle=hue(P[2]);g.globalAlpha=.75; g.beginPath();g.arc(p[0],p[1],2.6,0,6.28);g.fill();});
      g.globalAlpha=1; }
    const o=proj(ax.P[0]); ['#FF6B8A','#5CE8A8','#3BE8FF'].forEach((c,i)=>{const q=proj(ax.P[i+1]);
      g.strokeStyle=c;g.lineWidth=1.5;g.globalAlpha=.85;g.beginPath();g.moveTo(o[0],o[1]);g.lineTo(q[0],q[1]);g.stroke();
      g.globalAlpha=1;g.fillStyle=c;g.font='10px ui-monospace';g.fillText(['x','y','z'][i],q[0]+4,q[1]);});
    if(ballOn){                                   // 小球沿曲面下滑
      const f=(x,y)=>kind==='saddle'?(x*x-y*y)*.22:kind==='bell'?-Math.exp(-(x*x+y*y)/4)*2.2:(x*x*.35+y*y*.9)*.42;
      const h=1e-3, gx=(f(ball[0]+h,ball[1])-f(ball[0]-h,ball[1]))/(2*h), gy=(f(ball[0],ball[1]+h)-f(ball[0],ball[1]-h))/(2*h);
      ball=[ball[0]-gx*.09, ball[1]-gy*.09];
      if(Math.hypot(gx,gy)<1e-3||Math.hypot(...ball)>6) ball=[2.3*Math.cos(t/900),1.7*Math.sin(t/700)];
      const bp=proj([ball[0],ball[1],f(ball[0],ball[1])+.12]);
      g.fillStyle='#FFC46B'; g.beginPath(); g.arc(bp[0],bp[1],5,0,6.28); g.fill();
      g.strokeStyle='rgba(255,196,107,.5)'; g.lineWidth=1.4; g.beginPath(); g.arc(bp[0],bp[1],9,0,6.28); g.stroke();
    }
  }
  const ballOn=(kind==='bowl'||kind==='saddle'||kind==='bell');
  function loop(t){ if(auto)rz+=.005; draw(t||0); raf=requestAnimationFrame(loop); }
  loop();
  cv.onmousedown=e=>{drag=[e.clientX,e.clientY,rz,rx];auto=false;s3btn()};
  addEventListener('mousemove',e=>{if(!drag)return; rz=drag[2]+(e.clientX-drag[0])*.01; rx=drag[3]+(e.clientY-drag[1])*.008;});
  addEventListener('mouseup',()=>drag=null);
  cv.onwheel=e=>{e.preventDefault(); zoom=Math.max(.4,Math.min(3,zoom*(e.deltaY>0?.92:1.08)));};
  function s3btn(){ const b=$('s3_auto'); if(b)b.textContent=auto?'⏸ 自转':'▶ 自转'; }
  const ctr=$('s3ctrl');
  if(ctr){ ctr.innerHTML='<button id="s3_auto">⏸ 自转</button><button id="s3_front">正视</button>'
      +'<button id="s3_top">俯视</button><button id="s3_reset">重放</button>'
      +'<span style="font-size:11px;color:var(--muted)">拖着转 · 滚轮缩放</span>';
    $('s3_auto').onclick=()=>{auto=!auto;s3btn()};
    $('s3_front').onclick=()=>{rx=-.05;rz=0;auto=false;s3btn()};
    $('s3_top').onclick=()=>{rx=-1.35;rz=.4;auto=false;s3btn()};
    $('s3_reset').onclick=()=>{rx=-.55;rz=.6;zoom=1;auto=true;s3btn()};
  }
  return ()=>{cancelAnimationFrame(raf)};
}
let S3STOP=null;
function s3kind(n){
  const id=n.id, d=n.dom;
  if(/gradient_descent|convex|optimization|lr_step|learning_rate|op\./.test(id))return 'bowl';
  if(/saddle|hessian|partial|lagrange/.test(id))return 'saddle';
  if(/fo\.|wave|fourier|sampling|filter|attention/.test(id))return 'wave';
  if(/pca|cluster|kmeans|knn|embed|cloud|scatter|covariance|umap/.test(id))return 'cloud';
  if(d==='ca'||d==='op')return 'bowl';
  if(d==='pr'||d==='ml')return 'cloud';
  if(d==='fo'||d==='cx')return 'wave';
  return 'bell';
}
function s3Toggle(n){
  const wrap=$('s3wrap'); if(!wrap)return;
  if(wrap.classList.contains('on')){ wrap.classList.remove('on'); if(S3STOP){S3STOP();S3STOP=null} return; }
  wrap.classList.add('on'); if(S3STOP)S3STOP();
  S3STOP=fig3d(s3kind(n),n);
}

/* ---------- 图解分步讲解 + 放大镜 ---------- */
let FIG=null;
function figSteps(n){
  const out=[]; const D=DP[n.id], V=DV[n.id], A=window.ANIM&&window.ANIM[n.anim];
  const ST=ANIMH&&ANIMH.st;
  if(ST&&ST.steps&&ST.steps.length){                    // 动画自己定义了分步：画面跟着走
    ST.steps.forEach((s,i)=>out.push({t:s.t,d:s.d||'',k:i,live:true}));
    if(V&&V.proof&&V.proof.steps) V.proof.steps.slice(0,3).forEach((st,i)=>out.push({t:'推导 '+(i+1)+' · '+st[0],d:st[1]}));
    if(n.trap) out.push({t:'最后盯住这个坑',d:n.trap});
    if(n.gut) out.push({t:'一句话收起来',d:n.gut});
    return out.filter(x=>x.t);
  }
  if(A&&A.cap) out.push({t:'先看这张图在演什么',d:A.cap});
  if(n.see) out.push({t:'脑中画面',d:n.see});
  if(V&&V.layers){ out.push({t:'代数的看法',d:V.layers.alg}); out.push({t:'几何的看法',d:V.layers.geo}); out.push({t:'机器怎么算',d:V.layers.comp}); }
  if(V&&V.proof&&V.proof.steps) V.proof.steps.slice(0,4).forEach((st,i)=>out.push({t:'推导 '+(i+1)+' · '+st[0],d:st[1]}));
  else if(D&&D.worked&&D.worked[0]) (D.worked[0].steps||[]).forEach((st,i)=>out.push({t:'例题 '+(i+1)+' · '+st[0],d:st[1]}));
  if(n.trap) out.push({t:'最后盯住这个坑',d:n.trap});
  if(n.gut) out.push({t:'一句话收起来',d:n.gut});
  return out.filter(x=>x.d);
}
function figStart(n){ const steps=figSteps(n); if(!steps.length)return; FIG={n,steps,i:0,auto:false}; figDraw(); }
function figDraw(){
  const bar=$('figbar'); if(!bar||!FIG)return;
  const s=FIG.steps[FIG.i], last=FIG.i>=FIG.steps.length-1;
  if(s.live&&ANIMH&&ANIMH.st){ try{ANIMH.st.go(s.k)}catch(e){} }
  bar.classList.add('on');
  bar.innerHTML='<div class="fh"><b>'+esc(FIG.n.title)+' · 分步讲解</b><span>'+(FIG.i+1)+' / '+FIG.steps.length+'</span><button class="x" id="fg_x">退出</button></div>'
    +'<div class="ft"><b>'+esc(s.t)+'</b><div>'+md(s.d||'')+'</div></div>'
    +'<div class="fp"><i style="width:'+((FIG.i+1)/FIG.steps.length*100)+'%"></i></div>'
    +'<div class="fb"><button id="fg_prev">← 上一步</button>'
    +'<button id="fg_next" class="pri">'+(last?'讲完':'下一步 →')+'</button>'
    +'<button id="fg_auto">'+(FIG.auto?'⏸ 暂停':'▶ 自动播放')+'</button>'
    +'<button id="fg_lens" class="'+(FIG.lens?'on':'')+'">放大镜 '+(FIG.lens?'开':'关')+'</button>'
    +'<button id="fg_sweep">扫一遍滑杆</button></div>';
  $('fg_x').onclick=figStop;
  $('fg_prev').onclick=()=>{FIG.i=Math.max(0,FIG.i-1);figDraw()};
  $('fg_next').onclick=()=>{ if(last)return figStop(); FIG.i++; figDraw(); };
  $('fg_auto').onclick=()=>{FIG.auto=!FIG.auto; if(FIG.timer){clearInterval(FIG.timer);FIG.timer=null}
    if(FIG.auto)FIG.timer=setInterval(()=>{ if(!FIG)return; if(FIG.i>=FIG.steps.length-1){clearInterval(FIG.timer);FIG.timer=null;FIG.auto=false;figDraw();return} FIG.i++;figDraw(); },9000); figDraw();};
  $('fg_lens').onclick=()=>{FIG.lens=!FIG.lens; lens(FIG.lens); figDraw();};
  $('fg_sweep').onclick=sweep;
}
function figStop(){ if(FIG&&FIG.timer)clearInterval(FIG.timer); lens(false); FIG=null;
  const bar=$('figbar'); if(bar){bar.classList.remove('on');bar.innerHTML=''} }
function sweep(){
  const c=$('ctrls'); const r=c&&c.querySelector('input[type=range]'); if(!r)return;
  const min=+r.min,max=+r.max,step=+(r.step||1)||1, N=Math.min(60,Math.max(8,Math.round((max-min)/step)));
  let k=0; const t=setInterval(()=>{ if(k>N){clearInterval(t);return}
    r.value=min+(max-min)*k/N; r.dispatchEvent(new Event('input',{bubbles:true})); k++; },90);
}
function lens(on){
  const st=$('stage'); if(!st)return;
  let L=st.querySelector('.lens');
  if(!on){ if(L)L.remove(); st.onmousemove=null; return; }
  if(!L){ L=document.createElement('div'); L.className='lens'; st.appendChild(L); }
  const src=st.querySelector('svg'); if(!src)return;
  const draw=(mx,my)=>{ const r=st.getBoundingClientRect(), Z=2.6, D=170;
    L.style.left=(mx-r.left-D/2)+'px'; L.style.top=(my-r.top-D/2)+'px';
    L.innerHTML=''; const c2=src.cloneNode(true); c2.removeAttribute('width'); c2.removeAttribute('height');
    c2.style.width=(r.width*Z)+'px'; c2.style.height=(r.height*Z)+'px'; c2.style.position='absolute';
    c2.style.left=(-(mx-r.left)*Z+D/2)+'px'; c2.style.top=(-(my-r.top)*Z+D/2)+'px'; c2.style.pointerEvents='none';
    L.appendChild(c2); };
  st.onmousemove=e=>draw(e.clientX,e.clientY);
  const r0=st.getBoundingClientRect(); draw(r0.left+r0.width/2,r0.top+r0.height/2);
}

/* 秒答 */
function allDrills(n){ return (n.drills||[]).concat(MD[n.id]||[]); }
function pickDrill(n){
  const g=n.gen&&window.GEN&&window.GEN[n.gen];
  const ds=allDrills(n);
  if(g&&(Math.random()<.45||!ds.length)){try{return g()}catch(e){console.error(n.gen,e)}}
  return ds.length?ds[Math.floor(Math.random()*ds.length)]:(g?g():null);
}
function drillNew(n){
  const q=pickDrill(n); const el=$('drill'); if(!q){el.innerHTML='<div class="dh">秒答 DRILL</div><div class="q" style="color:#7d746a;font-size:13px">没有题</div>';return}
  el.className='drill'; let t0=Date.now(); if(TIMER)clearInterval(TIMER);
  el.innerHTML=`<div class="dh">秒答 DRILL <span style="font-weight:400;letter-spacing:0">目标 3 秒内弹出</span><span class="timer" id="tm">0.0s</span></div>
    <div class="q">${esc(q.q)}</div>
    <div class="btns"><button class="pri" id="reveal">翻开</button><button id="skip">换一题</button></div>
    <div class="a"><div class="ans">${esc(q.a)}</div><div class="how">${esc(q.how||'')}</div>
      <div class="btns"><button class="g3">秒出</button><button class="g2">想了想</button><button class="g1">不会</button></div></div>`;
  TIMER=setInterval(()=>{$('tm').textContent=((Date.now()-t0)/1000).toFixed(1)+'s'},100);
  $('reveal').onclick=()=>{el.classList.add('open');clearInterval(TIMER);TIMER=null;const s=(Date.now()-t0)/1000;$('tm').textContent=s.toFixed(1)+'s'+(s<=3?' ✓':'')};
  $('skip').onclick=()=>drillNew(n);
  const bs=el.querySelectorAll('.a .btns button');
  bs[0].onclick=()=>{grade(n.id,2);drillNew(n);renderSteps(n)};
  bs[1].onclick=()=>{grade(n.id,1);drillNew(n);renderSteps(n)};
  bs[2].onclick=()=>{grade(n.id,0);drillNew(n);renderSteps(n)};
}
const NINE=[['map','元学习','看过这块地图'],['anim','直觉','看过动画'],['drill','钻取/提取','做过秒答'],
  ['fb','反馈','认过一次不会'],['direct','直接','走过桥到另一页'],['retain','留存','秒答盒 ≥ 3'],
  ['feyn','直觉·费曼','能一句话讲给外行'],['exp','实验','换过一种解法'],['focus','专注','一次只学这一块']];
function renderSteps(n){
  const s=STEPS[n.id]||{}; if(box(n.id)>=3)s.retain=1;
  $('steps').innerHTML=NINE.map(([k,z,d])=>`<div class="step ${s[k]?'done':''}" data-k="${k}"><b>${z}</b><small>${d}</small></div>`).join('');
  $('steps').querySelectorAll('.step').forEach(el=>el.onclick=()=>{const k=el.dataset.k; if(['feyn','exp','focus'].includes(k)){const st=STEPS[n.id]||{};st[k]=st[k]?0:Date.now();STEPS[n.id]=st;SV('steps',STEPS);renderSteps(n)}});
}

/* ---------- 6. 视图切换 ---------- */
function showView(v){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('on',x.id===v+'view'));
  document.querySelectorAll('.tab[data-v]').forEach(t=>t.classList.toggle('on',t.dataset.v===v));
  if(v==='arena')renderArena(); if(v==='method')renderMethod(); if(v==='shelf')renderShelf();
  if(v==='route')renderRoutes(); if(v==='plan')renderPlan(); if(v==='me')renderMe(); if(v==='tour')renderTour();
  if(v!=='map'&&!TOUR)closeDrawer();}
document.querySelectorAll('.tab[data-v]').forEach(t=>t.onclick=()=>showView(t.dataset.v));

/* ---------- 7. 秒答场 + 道场（限时连答） ---------- */
let DOJO=null;   // {t0,dur,list,i,hits:[],misses:[],timer}
function dojoStart(sec){
  const ps=pool(); if(!ps.length)return;
  DOJO={t0:Date.now(),dur:sec*1000,hits:[],misses:[],q:null,qt:0};
  dojoNext(); 
  DOJO.timer=setInterval(()=>{ const left=DOJO.dur-(Date.now()-DOJO.t0);
    const el=$('dojoclock'); if(el)el.textContent=(Math.max(0,left)/1000).toFixed(1)+'s';
    if(left<=0)dojoEnd(); },100);
}
function dojoNext(){
  const ps=pool(); const n=ps[Math.floor(Math.random()*ps.length)];
  DOJO.node=n; DOJO.q=pickDrill(n); DOJO.qt=Date.now(); dojoDraw();
}
function dojoDraw(){
  const box=$('dojobox'); if(!box||!DOJO)return; const d=DM[DOJO.node.dom];
  box.innerHTML=`<div class="dojo">
    <div class="dh"><span class="chip" style="background:${d.color};margin:0">${esc(d.name)}</span>
      <span class="dojoq" style="font-size:11px;color:var(--muted)">已答 ${DOJO.hits.length+DOJO.misses.length}</span>
      <span class="timer" id="dojoclock">${(DOJO.dur/1000).toFixed(1)}s</span></div>
    <div class="q">${esc(DOJO.q.q)}</div>
    <div class="btns"><button class="pri" id="dj_show">看答案 (空格)</button><button id="dj_stop">结束</button></div>
    <div class="a" id="dj_a"><div class="ans">${esc(DOJO.q.a)}</div><div class="how">${esc(DOJO.q.how||'')}</div>
      <div class="btns"><button class="g3" id="dj_ok">秒出 (1)</button><button class="g1" id="dj_no">没弹出 (2)</button></div></div></div>`;
  $('dj_show').onclick=()=>{$('dj_a').style.display='block';$('dj_show').style.display='none'};
  $('dj_stop').onclick=dojoEnd;
  $('dj_ok').onclick=()=>dojoGrade(true); $('dj_no').onclick=()=>dojoGrade(false);
}
function dojoGrade(ok){
  const dt=(Date.now()-DOJO.qt)/1000;
  (ok?DOJO.hits:DOJO.misses).push({id:DOJO.node.id,t:dt,title:DOJO.node.title});
  grade(DOJO.node.id,ok?2:0);
  if(DOJO.dur-(Date.now()-DOJO.t0)<=0)return dojoEnd();
  dojoNext();
}
function dojoEnd(){
  if(!DOJO)return; clearInterval(DOJO.timer);
  const H=DOJO.hits,M=DOJO.misses,all=H.concat(M);
  const fast=H.filter(x=>x.t<=3).length;
  const med=all.length?all.reduce((s,x)=>s+x.t,0)/all.length:0;
  const W=520,Hh=110,mx=Math.max(6,...all.map(x=>x.t));
  const bars=all.map((x,i)=>{const w=W/Math.max(all.length,1);
    return `<rect x="${i*w+1}" y="${Hh-Math.min(Hh,x.t/mx*Hh)}" width="${w-2}" height="${Math.min(Hh,x.t/mx*Hh)}" fill="${x.t<=3?'#5CE8A8':'#FF6B8A'}" opacity=".8"/>`}).join('');
  const rec=M.slice(0,8).map(x=>`<span class="chip lite" data-go="${x.id}">${esc(x.title)}</span>`).join('');
  $('dojobox').innerHTML=`<div class="dojo done">
    <div class="dh"><b style="color:var(--ink);font-size:14px">这一轮</b></div>
    <div class="stats"><div class="stat"><b>${all.length}</b><small>答题数</small></div>
      <div class="stat"><b>${H.length}</b><small>秒出</small></div>
      <div class="stat"><b>${fast}</b><small>3 秒内</small></div>
      <div class="stat"><b>${med.toFixed(1)}s</b><small>平均用时</small></div></div>
    <div style="margin:10px 0 4px;font-size:11px;letter-spacing:.12em;color:var(--muted)">每题用时 · 绿=秒出 红=没弹出</div>
    <svg viewBox="0 0 ${W} ${Hh}" style="width:100%;height:110px;background:rgba(0,0,0,.25);border-radius:10px">${bars}
      <line x1="0" x2="${W}" y1="${Hh-3/mx*Hh}" y2="${Hh-3/mx*Hh}" stroke="#3BE8FF" stroke-dasharray="4 4" opacity=".7"/></svg>
    ${rec?`<div style="margin-top:10px"><div style="font-size:11px;letter-spacing:.12em;color:var(--muted);margin-bottom:5px">没弹出的，先回去看这几块</div>${rec}</div>`:''}
    <div class="btns" style="margin-top:12px"><button class="pri" id="dj_again">再来一轮</button></div></div>`;
  $('dj_again').onclick=()=>dojoStart(DOJO.dur/1000);
  $('dojobox').querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{DOJO=null;showView('map');openNode(el.dataset.go,true)});
  DOJO.ended=true;
}
addEventListener('keydown',e=>{
  if(!DOJO||DOJO.ended||!$('arenaview').classList.contains('on'))return;
  if(e.key===' '){e.preventDefault();$('dj_show')&&$('dj_show').click()}
  else if(e.key==='1'&&$('dj_a')&&$('dj_a').style.display==='block')dojoGrade(true);
  else if(e.key==='2'&&$('dj_a')&&$('dj_a').style.display==='block')dojoGrade(false);
});

/* ---------- 7b. 秒答场 ---------- */
let AF='due', AQ=null, At0=0, ATM=null;
function pool(){ let ns=NODES.filter(n=>(n.drills&&n.drills.length)||n.gen);
  if(AF==='due')ns=ns.filter(n=>due(n.id)); else if(AF!=='all')ns=ns.filter(n=>n.dom===AF); return ns; }
function renderArena(){
  const v=$('arenaview'); const dueN=NODES.filter(n=>due(n.id)).length, learned=Object.keys(SRS).length, mast=NODES.filter(n=>box(n.id)>=3).length;
  v.innerHTML=`<div class="page"><h2>秒答场 <small>DRILL ARENA · 提取 + 反馈 + 留存</small></h2>
    <p>规则：题出来，脑子先弹答案，再翻开对。3 秒内弹出算"秒出"。不会的会更快回来找你（Leitner 盒）。</p>
    <div class="stats"><div class="stat"><b>${dueN}</b><small>今日到期 DUE</small></div><div class="stat"><b>${learned}/${NODES.length}</b><small>碰过 SEEN</small></div><div class="stat"><b>${mast}</b><small>熟练 ≥ 盒3</small></div></div>
    <div class="row" id="af"><button class="pill ${AF==='due'?'on':''}" data-f="due">到期</button><button class="pill ${AF==='all'?'on':''}" data-f="all">全部</button>${DOMS.map(d=>`<button class="pill ${AF===d.id?'on':''}" data-f="${d.id}">${esc(d.name)}</button>`).join('')}</div>
    <div class="row" style="margin-top:2px">
      <button class="pill" data-dojo="60">道场 60 秒</button><button class="pill" data-dojo="120">120 秒</button>
      <button class="pill" data-dojo="300">5 分钟</button>
      <span style="font-size:12px;color:var(--muted);align-self:center">连答不停 · 空格看答案 · 1 秒出 / 2 没弹出</span></div>
    <div id="dojobox"></div>
    <div class="drill" id="adrill"></div></div>`;
  v.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{AF=b.dataset.f;renderArena()});
  v.querySelectorAll('[data-dojo]').forEach(b=>b.onclick=()=>{$('adrill').style.display='none';dojoStart(+b.dataset.dojo)});
  arenaNext();
}
function arenaNext(){
  const el=$('adrill'); if(!el)return; const ps=pool(); if(ATM)clearInterval(ATM);
  if(!ps.length){el.innerHTML='<div class="dh">秒答 DRILL</div><div class="q" style="font-size:14px;color:#7d746a">这一档没有题了。切"全部"或去地图上开新地块。</div>';return}
  const n=ps[Math.floor(Math.random()*ps.length)], q=pickDrill(n); const d=DM[n.dom]; At0=Date.now(); el.className='drill';
  el.innerHTML=`<div class="dh"><span class="chip" style="background:${d.color};margin:0">${esc(d.name)}</span><span style="letter-spacing:0;font-weight:600;cursor:pointer" data-open="${n.id}">${esc(n.title)} ↗</span><span class="timer" id="atm">0.0s</span></div>
    <div class="q">${esc(q.q)}</div>
    <div class="btns"><button class="pri" id="areveal">翻开</button><button id="askip">跳过</button></div>
    <div class="a"><div class="ans">${esc(q.a)}</div><div class="how">${esc(q.how||'')}</div>
      <div class="btns"><button class="g3">秒出</button><button class="g2">想了想</button><button class="g1">不会</button></div></div>`;
  ATM=setInterval(()=>{const t=$('atm');if(t)t.textContent=((Date.now()-At0)/1000).toFixed(1)+'s'},100);
  $('areveal').onclick=()=>{el.classList.add('open');clearInterval(ATM);const s=(Date.now()-At0)/1000;$('atm').textContent=s.toFixed(1)+'s'+(s<=3?' ✓':'')};
  $('askip').onclick=arenaNext;
  el.querySelector('[data-open]').onclick=()=>openNode(n.id,true);
  const bs=el.querySelectorAll('.a .btns button');
  [2,1,0].forEach((g,i)=>bs[i].onclick=()=>{grade(n.id,g);arenaNext()});
  addEventListener('keydown',arenaKeys);
}
function arenaKeys(e){ if(!$('arenaview').classList.contains('on'))return; const el=$('adrill'); if(!el)return;
  if(e.key===' '&&!el.classList.contains('open')){e.preventDefault();$('areveal').click()}
  else if(el.classList.contains('open')&&['1','2','3'].includes(e.key)){el.querySelectorAll('.a .btns button')[3-+e.key].click()} }

/* ---------- 8. 方法页：九步怎么用这张图 ---------- */
function renderMethod(){
  const done=k=>Object.values(STEPS).filter(s=>s[k]).length;
  const M=[
   ['01 元学习','Metalearning','先看全图再进地块。每块大陆左下角一句话就是它的"为什么存在"。',`点开图例 8 块大陆各看一眼 · 已看 ${done('map')} 节点`,'map'],
   ['02 专注','Focus','一次只开一块大陆，25 分钟。别在地图上乱飞。','选一块大陆，双击放大','map'],
   ['03 直接','Directness','数学不是背的，是用的。每个节点都有桥通到另一页：看完就去代码里跑一次。',`走过桥 ${done('direct')} 次`,'map'],
   ['04 钻取','Drill','秒答只练一个反射：题 → 答案。哪块反射慢，就盯着它刷。','进秒答场，选一块大陆','arena'],
   ['05 提取','Retrieval','先想再翻。翻开前必须脑子里已经有答案，哪怕是错的。','秒答场 · 空格翻开 · 1/2/3 自评','arena'],
   ['06 反馈','Feedback','"不会"是最有价值的按钮。它把这题的间隔清零，让它最快回来。',`已认过 ${done('fb')} 次不会`,'arena'],
   ['07 留存','Retention','Leitner 盒：秒出→间隔 1,3,7,16,35 天。到期的题会在秒答场"到期"档等你。',`熟练 ≥ 盒3：${NODES.filter(n=>box(n.id)>=3).length} 节点`,'arena'],
   ['08 直觉','Intuition','动画是种子不是果实。看完动画，合上，用一句话讲给外行 —— 讲不出就没懂。在节点里点亮"费曼"格。',`已点亮费曼 ${done('feyn')} 节点`,'map'],
   ['09 实验','Experimentation','同一题换一种解法：24 点用因数法 vs 逆推法；导数用定义 vs 法则。换过就点亮"实验"格。',`已点亮实验 ${done('exp')} 节点`,'map']];
  $('methodview').innerHTML=`<div class="page"><h2>方法 <small>ULTRALEARNING · 九步怎么用这张图</small></h2>
    <p>这张图不是百科，是训练器。顺序：<b>地图 → 动画 → 秒答 → 桥到另一页跑一遍 → 到期回来</b>。数学页练直觉，代码页练手；同一个概念两边各有一块牌子，靠"桥"连着。</p>
    <div class="cards">${M.map(([z,e,t,s,v])=>`<div class="card"><h4>${z}<small>${e}</small></h4><div style="font-size:13px">${t}</div><span class="tag" data-v="${v}">${esc(s)} →</span></div>`).join('')}</div>
    <h2 style="margin-top:36px">数感专项 <small>NUMBER SENSE · 每天 5 分钟</small></h2>
    <p>顺序固定：珠心算 2 分钟（心像）→ 24 点 5 题（因数反射）→ 排最大 3 题（指数反射）→ 估算 5 题（数量级反射）。全部在秒答场"数感"档。</p>
    <div class="row"><button class="pill" id="me_onb">重看上手引导</button><button class="pill" data-v="arena" data-f="ns">进数感档</button><a class="pill" style="text-decoration:none;color:inherit" href="${esc(CFG.abacus||'#')}" target="_blank">打开珠心算训练器 ↗</a></div>
    <h2 style="margin-top:36px">书的对应 <small>鸢尾花书 · 从加减乘除到机器学习</small></h2>
    <div class="cards">${DOMS.map(d=>`<div class="card"><h4><span class="chip" style="background:${d.color};margin:0 6px 0 0">${esc(d.name)}</span>${esc(d.en)}</h4><div style="font-size:13px">${esc(d.one||'')}</div><div style="font-size:12px;color:#7d746a;margin-top:6px">${esc(d.book||'')}</div></div>`).join('')}</div></div>`;
  const ob=$('me_onb'); if(ob)ob.onclick=()=>{showView('map');onboard(true)};
  $('methodview').querySelectorAll('[data-v]').forEach(el=>el.onclick=()=>{if(el.dataset.f){AF=el.dataset.f}showView(el.dataset.v)});
}

/* ---------- 8.3 巡游：场景化路线，镜头在图上飞 ---------- */
let TOUR=null;   // {t, i, auto, timer}
const tourById=id=>TS.find(t=>t.id===id);
function tourStart(id,i){
  const t=tourById(id); if(!t)return;
  TOUR={t,i:i||0,auto:false,deep:!!t.scope}; showView('map');
  if(t.scope&&DM[t.scope]&&LVD!==t.scope) enterDom(t.scope);
  const st=LS('tour'); st[id]=st[id]||{started:Date.now()}; SV('tour',st);
  tourGo(TOUR.i);
}
function tourStop(){ if(TOUR&&TOUR.timer)clearInterval(TOUR.timer);
  TOUR=null; if(LV===1)exitDom(); d3.select('#tourhud').remove(); gEdge.selectAll('.tpath').remove();
  nSel.classed('tvisit',false).classed('tnow',false); closeDrawer(); }
function tourGo(i){
  if(!TOUR)return; const t=TOUR.t;
  if(i<0)i=0;
  if(i>=t.stops.length){ return tourEnd(); }
  TOUR.i=i; const s=t.stops[i];
  if(s.page&&s.page!==CFG.page){                     // 跨页：存状态跳另一页续走
    SV('tourjump',{id:t.id,i}); location.href=CFG.other.file+'#tour='+t.id+'&i='+i; return;
  }
  const n=NM[s.id]; if(!n){ return tourGo(i+1); }
  if(TOUR.deep||TOUR.t.scope){ if(LVD!==n.dom){ enterDom(n.dom); } }
  else if(LV===1){ exitDom(); }
  // 路径：把这趟走过的点连起来
  gEdge.selectAll('.tpath').remove();
  const pts=t.stops.slice(0,i+1).map(x=>NM[x.id]).filter(Boolean)
    .filter(m=>LV===0||m.dom===LVD);
  for(let k=1;k<pts.length;k++){const a=pts[k-1],b=pts[k];
    gEdge.append('path').attr('class','tpath').attr('d',`M${a.x},${a.y} Q${(a.x+b.x)/2},${(a.y+b.y)/2-70} ${b.x},${b.y}`);}
  nSel.classed('tvisit',x=>t.stops.slice(0,i).some(y=>y.id===x.id)).classed('tnow',x=>x.id===s.id);
  openNode(s.id,false); zoomNode(n); mark(s.id,'map');
  tourHUD();
}
function tourHUD(){
  const t=TOUR.t, i=TOUR.i, s=t.stops[i], n=NM[s.id], d=n?DM[n.dom]:null;
  let hud=document.getElementById('tourhud');
  if(!hud){ hud=document.createElement('div'); hud.id='tourhud'; document.getElementById('mapview').appendChild(hud); }
  hud.innerHTML=`<div class="th">
      <span class="tn">${esc(t.name)}</span>
      <span class="tp">${i+1} / ${t.stops.length}</span>
      <div class="tdots">${t.stops.map((x,k)=>`<i class="${k<i?'d':k===i?'n':''}" data-i="${k}" title="${esc(NM[x.id]?NM[x.id].title:x.id)}"></i>`).join('')}</div>
      <button class="tx" id="t_quit">退出巡游</button></div>
    <div class="tb">
      <div class="tl">
        ${s.link?`<div class="tlink"><b>为什么下一站是它</b>${md(s.link)}</div>`:''}
        <div class="tsay">${md(s.say||'')}</div>
        ${s.watch?`<div class="twatch"><b>盯住</b>${md(s.watch)}</div>`:''}
        ${s.do?`<div class="tdo"><b>动手</b>${md(s.do)}</div>`:''}
        ${s.ask?`<div class="task"><b>先想再看</b>${md(s.ask)}</div>`:''}
      </div>
      <div class="tr">
        <div class="tnode">${d?`<span class="chip" style="background:${d.color}">${esc(d.name)}</span>`:''}
          <b>${esc(n?n.title:s.id)}</b><s>${esc(n?n.en:'')}</s></div>
        <div class="tgut">${esc(n?n.gut:'')}</div>
        <div class="tbtn">
          <button id="t_prev">← 上一站</button>
          <button id="t_auto">${TOUR.auto?'⏸ 暂停':'▶ 自动'}</button>
          <button id="t_deep" class="${TOUR.deep?'on':''}">${TOUR.deep?'◉ 沉浸':'○ 沉浸'}</button>
          <button class="pri" id="t_next">${i+1>=t.stops.length?'走完 →':'下一站 →'}</button>
        </div></div></div>`;
  hud.querySelectorAll('.tdots i').forEach(el=>el.onclick=()=>tourGo(+el.dataset.i));
  document.getElementById('t_quit').onclick=tourStop;
  document.getElementById('t_prev').onclick=()=>tourGo(TOUR.i-1);
  document.getElementById('t_next').onclick=()=>tourGo(TOUR.i+1);
  document.getElementById('t_deep').onclick=()=>{TOUR.deep=!TOUR.deep;tourGo(TOUR.i)};
  document.getElementById('t_auto').onclick=()=>{ TOUR.auto=!TOUR.auto;
    if(TOUR.timer){clearInterval(TOUR.timer);TOUR.timer=null}
    if(TOUR.auto)TOUR.timer=setInterval(()=>tourGo(TOUR.i+1),22000);
    tourHUD(); };
}
function tourEnd(){
  const t=TOUR.t; const ids=t.stops.map(s=>s.id);
  const st=LS('tour'); st[t.id]={...(st[t.id]||{}),done:Date.now()}; SV('tour',st);
  const other={};
  ids.forEach(id=>{ if(NM[id]){ if(!SRS[id])SRS[id]={box:0,seen:0,ok:0,next:Date.now()}; mark(id,'map'); }
    else if(IX[id]) other[id]=1; }); SV('srs',SRS);
  try{ const k='su.'+CFG.other.file.replace('.html','')+'.srs'; const o=JSON.parse(localStorage.getItem(k)||'{}');
    Object.keys(other).forEach(id=>{ if(!o[id])o[id]={box:0,seen:0,ok:0,next:Date.now()} });
    localStorage.setItem(k,JSON.stringify(o)); }catch(e){}
  const hud=document.getElementById('tourhud');
  hud.innerHTML=`<div class="th"><span class="tn">${esc(t.name)} · 走完了</span><button class="tx" id="t_quit">关闭</button></div>
    <div class="tb"><div class="tl">
      <div class="tsay"><b>这趟你串起来的：</b>${ids.map(id=>NM[id]?`<span class="chip lite" data-go="${id}">${esc(nodeTitle(id))}</span>`:`<span class="chip lite o" data-jump="${id}">${esc(nodeTitle(id))} ↗</span>`).join(' ')}</div>
      ${t.after&&t.after.length?`<div class="tdo"><b>接下来三件事（实验原则）</b>${t.after.map(a=>`<div>· ${esc(a)}</div>`).join('')}</div>`:''}
      <div class="task"><b>留存</b>这一趟的牌子已经进了秒答场的到期队列，明天它们会回来找你。</div>
    </div>
    <div class="tr"><div class="tbtn">
      <button id="t_again">再走一遍</button>
      <button class="pri" id="t_drill">去秒答这一趟</button></div></div></div>`;
  document.getElementById('t_quit').onclick=tourStop;
  document.getElementById('t_again').onclick=()=>tourGo(0);
  document.getElementById('t_drill').onclick=()=>{AF='all';tourStop();showView('arena')};
  hud.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>openNode(el.dataset.go,true));
  hud.querySelectorAll('[data-jump]').forEach(el=>el.onclick=()=>{location.href=CFG.other.file+'#n='+el.dataset.jump});
}
function tourCard(t,st,meta){
  const s=st[t.id]||{}, done=!!s.done;
  const pre=(meta&&meta.pre||[]).filter(p=>!(st[p]||{}).done);
  const preName=pre.map(p=>{const q=tourById(p);return q?q.name:p});
  return `<div class="card tourcard ${done?'done':''} ${pre.length?'locked':''}">
    <h4>${meta?`<i class="ord">${meta.order}</i>`:''}${esc(t.name)}<small>${esc(t.en||'')}</small>${done?'<span class="ok">✓ 走过</span>':''}</h4>
    <div style="font-size:13px">${esc(t.why||'')}</div>
    <div style="font-size:12.5px;color:var(--cy);margin-top:6px">目标：${esc(t.goal||'')}</div>
    <div style="font-size:11.5px;color:var(--muted);margin-top:6px">${t.stops.length} 站 · 约 ${t.min||20} 分钟 · 跨 ${new Set(t.stops.map(x=>IX[x.id]?IX[x.id].d:'')).size} 块大陆</div>
    ${preName.length?`<div class="pre">建议先走：${preName.map(n=>esc(n)).join('、')}</div>`:''}
    <div class="trail">${t.stops.map(x=>`<span class="${(x.page||t.page)!==CFG.page?'o':''}">${esc(nodeTitle(x.id))}</span>`).join('<i>→</i>')}</div>
    <div class="tag" data-tour="${t.id}">${done?'再走一遍':'开始巡游'} →</div></div>`;
}
function tourPanel(open){
  let el=$('tourpanel');
  if(!el){el=document.createElement('div');el.id='tourpanel';$('mapview').appendChild(el)}
  if(!open){el.classList.remove('on');return}
  const st=LS('tour'), meta=TO?TO.tours:null;
  const cats=TO?TO.stages:[{k:'all',name:'全部',en:'ALL'}];
  const sorted=[...TS].sort((a,b)=>((meta&&meta[a.id]?meta[a.id].order:99)-(meta&&meta[b.id]?meta[b.id].order:99)));
  let cur=el.dataset.cat||(LV===1&&sorted.some(t=>t.scope===LVD)?('s:'+LVD):'all');
  const inCat=t=>cur==='all'?true:(cur.startsWith('s:')?t.scope===cur.slice(2):(meta&&meta[t.id]&&meta[t.id].stage===cur&&!t.scope));
  const list=sorted.filter(inCat);
  el.classList.add('on');
  el.innerHTML=`<div class="tph"><b>场景巡游</b><button class="x" id="tp_x">×</button></div>
    <div class="tpi">在 <b>${esc(CFG.title)}</b>，${TS.length} 条路线全给你，可以按分类筛</div>
    <div class="tpc"><button class="${cur==='all'?'on':''}" data-c="all">全部 ${TS.length}</button>
      ${DOMS.filter(d=>sorted.some(t=>t.scope===d.id)).map(d=>{const n=sorted.filter(t=>t.scope===d.id).length;
        return `<button class="${cur==='s:'+d.id?'on':''}" data-c="s:${d.id}" style="border-color:${d.color}66;color:${d.color}">${esc(d.name)}内 ${n}</button>`}).join('')}
      ${cats.map(c=>{const n=sorted.filter(t=>meta&&meta[t.id]&&meta[t.id].stage===c.k).length;
        return n?`<button class="${cur===c.k?'on':''}" data-c="${c.k}">${esc(c.name.replace(/^第.层 · /,''))} ${n}</button>`:''}).join('')}</div>
    <div class="tpl">${list.map(t=>{const s=st[t.id]||{};const m=meta&&meta[t.id];
      return `<div class="tpit ${s.done?'done':''}" data-tour="${t.id}">
        <div class="tt">${esc(t.name)}${s.done?'<i>✓</i>':''}</div>
        <div class="td">${esc(t.why||'')}</div>
        <div class="tm">${t.stops.length} 站 · 点开始走${m?' · 第'+m.order+'条':''}</div></div>`}).join('')}</div>`;
  $('tp_x').onclick=()=>tourPanel(false);
  el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{el.dataset.cat=b.dataset.c;tourPanel(true)});
  el.querySelectorAll('[data-tour]').forEach(b=>b.onclick=()=>{tourPanel(false);tourStart(b.dataset.tour,0)});
}
function renderTour(){
  const v=$('tourview'); if(!v)return; const st=LS('tour');
  const meta=TO?TO.tours:null;
  const sorted=[...TS].sort((a,b)=>((meta&&meta[a.id]?meta[a.id].order:99)-(meta&&meta[b.id]?meta[b.id].order:99)));
  const nextUp=sorted.find(t=>!(st[t.id]||{}).done);
  const doneN=sorted.filter(t=>(st[t.id]||{}).done).length;
  let body='';
  if(TO){
    body=TO.stages.map(sg=>{
      const list=sorted.filter(t=>meta[t.id]&&meta[t.id].stage===sg.k);
      if(!list.length)return '';
      const d=list.filter(t=>(st[t.id]||{}).done).length;
      return `<div class="stage"><h2 style="font-size:17px;margin-top:26px">${esc(sg.name)}
          <small>${esc(sg.en)} · ${d}/${list.length}</small></h2>
        <p style="font-size:13px;color:var(--ink2)">${esc(sg.why)}</p>
        <div class="cards">${list.map(t=>tourCard(t,st,meta[t.id])).join('')}</div></div>`;
    }).join('');
    const scoped=sorted.filter(t=>t.scope);
    if(scoped.length){
      const byDom={}; scoped.forEach(t=>{(byDom[t.scope]=byDom[t.scope]||[]).push(t)});
      body+=Object.keys(byDom).map(k=>{const d=DM[k]||{name:k};
        return `<div class="stage"><h2 style="font-size:17px;margin-top:26px">${esc(d.name)}内部 · 精细巡游
          <small>IN-DEPTH · ${byDom[k].length} 条</small></h2>
        <p style="font-size:13px;color:var(--ink2)">走进这块大陆的二级里，一个子区一个子区地过，每站都盯着动画看。</p>
        <div class="cards">${byDom[k].map(t=>tourCard(t,st,null)).join('')}</div></div>`}).join('');
    }
    const rest=sorted.filter(t=>!meta[t.id]&&!t.scope);
    if(rest.length)body+=`<div class="cards">${rest.map(t=>tourCard(t,st,null)).join('')}</div>`;
  } else body=`<div class="cards">${sorted.map(t=>tourCard(t,st,null)).join('')}</div>`;
  v.innerHTML=`<div class="page"><h2>巡游 <small>TOUR · 按场景走一条线，把牌子串起来</small></h2>
    <p>孤立的知识记不住，<b>串成一条线才记得住</b>。镜头在图上飞，一站一站告诉你"为什么下一站是它"：看动画 → 盯住一处 → 动手 → 先想再看。走完的牌子自动进到期队列。</p>
    <div class="stats"><div class="stat"><b>${doneN}/${sorted.length}</b><small>走完的线</small></div>
      <div class="stat" style="flex:2"><b style="font-size:15px;line-height:1.4">${nextUp?esc(nextUp.name):'全部走完'}</b><small>建议下一条</small></div></div>
    ${nextUp?`<div class="row"><button class="pill on" data-tour="${nextUp.id}">从这条开始 →</button></div>`:''}
    <p style="font-size:12.5px;color:var(--muted);margin-top:14px">顺序不是随便排的：<b>打底</b>给两页共用的语言，<b>主干</b>长出四根柱子，<b>方法</b>把柱子拼成能干活的东西，<b>实战</b>是你下周的活。跳着走也行，卡住了回上一层。</p>
    ${body}</div>`;
  v.querySelectorAll('[data-tour]').forEach(el=>el.onclick=()=>tourStart(el.dataset.tour,0));
}

/* ---------- 8.4 进度页：哪块熟、哪块还黑着 ---------- */
function renderMe(){
  const v=$('meview'); if(!v)return;
  const now=Date.now(), DAYMS=864e5;
  const seen=NODES.filter(n=>SRS[n.id]);
  const mast=NODES.filter(n=>box(n.id)>=3), dueN=NODES.filter(n=>due(n.id)&&SRS[n.id]);
  const fresh=NODES.filter(n=>!SRS[n.id]);
  // 未来 14 天到期分布
  const days=Array.from({length:14},(_,i)=>0);
  NODES.forEach(n=>{const s=SRS[n.id]; if(!s)return; const d=Math.floor((s.next-now)/DAYMS); if(d>=0&&d<14)days[d]++;});
  const maxd=Math.max(1,...days);
  // 每块大陆的掌握热条
  const lands=DOMS.map(d=>{const ns=NODES.filter(n=>n.dom===d.id);
    const cnt=[0,0,0,0,0,0]; ns.forEach(n=>cnt[box(n.id)]++);
    const w=x=>Math.round(x/ns.length*100);
    return `<div class="lrow"><div class="ln"><span style="background:${d.color}"></span>${esc(d.name)}
        <em>${ns.filter(n=>box(n.id)>=3).length}/${ns.length}</em></div>
      <div class="lbar" data-d="${d.id}">
        <i style="width:${w(cnt[0])}%;background:rgba(126,178,255,.12)"></i>
        <i style="width:${w(cnt[1]+cnt[2])}%;background:rgba(255,196,107,.55)"></i>
        <i style="width:${w(cnt[3]+cnt[4]+cnt[5])}%;background:rgba(92,232,168,.7)"></i></div></div>`}).join('');
  // 最弱的 12 块牌子（碰过但盒子低）
  const weak=seen.filter(n=>box(n.id)<=1).sort((a,b)=>(SRS[a.id].seen-SRS[a.id].ok)-(SRS[b.id].seen-SRS[b.id].ok)).reverse().slice(0,12);
  v.innerHTML=`<div class="page"><h2>进度 <small>ME · 哪块熟、哪块还黑着</small></h2>
    <p>颜色就是状态：<b>灰</b>=没碰过，<b>琥珀</b>=碰过还不熟，<b>绿</b>=盒 3 以上（间隔 ≥7 天）。点条进那块大陆。</p>
    <div class="stats"><div class="stat"><b>${seen.length}/${NODES.length}</b><small>碰过</small></div>
      <div class="stat"><b>${mast.length}</b><small>熟练 ≥盒3</small></div>
      <div class="stat"><b>${dueN.length}</b><small>今日到期</small></div>
      <div class="stat"><b>${fresh.length}</b><small>还没开过</small></div></div>
    <h2 style="font-size:17px;margin-top:26px">大陆掌握度</h2>
    <div class="lands">${lands}</div>
    <h2 style="font-size:17px;margin-top:26px">未来 14 天到期</h2>
    <div class="cal">${days.map((c,i)=>`<div class="cd"><i style="height:${Math.round(c/maxd*54)}px"></i><b>${c||''}</b><s>${i===0?'今天':'+'+i}</s></div>`).join('')}</div>
    ${weak.length?`<h2 style="font-size:17px;margin-top:26px">最该回去的 ${weak.length} 块</h2>
      <div class="row">${weak.map(n=>`<span class="chip lite" data-go="${n.id}">${esc(n.title)}</span>`).join('')}</div>`:''}
    ${fresh.length?`<h2 style="font-size:17px;margin-top:26px">还没开过的 ${fresh.length} 块 · 随便挑一块开工</h2>
      <div class="row">${fresh.slice(0,20).map(n=>`<span class="chip lite" data-go="${n.id}">${esc(n.title)}</span>`).join('')}</div>`:''}
    <div class="row" style="margin-top:22px"><button class="pill" id="me_reset">清空我的进度</button></div></div>`;
  v.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{showView('map');openNode(el.dataset.go,true)});
  v.querySelectorAll('[data-d]').forEach(el=>el.onclick=()=>{showView('map');zoomTo(DM[el.dataset.d]);openDom(el.dataset.d)});
  $('me_reset').onclick=()=>{if(confirm('清空这台机器上的秒答记录和九步打勾？')){SV('srs',{});SV('steps',{});location.reload()}};
}

/* ---------- 8.5 书架：哪一章对应哪些牌子 ---------- */
function renderShelf(){
  const v=$('shelfview'); if(!v)return;
  const use={};                      // 'b.c' -> [node]
  NODES.forEach(n=>{const m=RM[n.id];if(!m)return;(m.books||[]).forEach(x=>{(use[x.b+'.'+x.c]=use[x.b+'.'+x.c]||[]).push(n)})});
  const useR={}; NODES.forEach(n=>{const m=RM[n.id];if(!m)return;(m.refs||[]).forEach(x=>{(useR[x.k]=useR[x.k]||[]).push([n,x])})});
  const books=Object.keys(BK).sort();
  v.innerHTML=`<div class="page"><h2>书架 <small>SHELF · 章节 ↔ 牌子</small></h2>
  <p>元学习第一步是看地图：先看这本书怎么切章，再决定学哪块。<b>亮着的章</b>说明这页的牌子挂在那儿，点章名直接开 PDF，点牌子跳回图上。</p>
  ${books.map(b=>{const bo=BK[b];const hit=bo.chs.filter(c=>use[b+'.'+c.c]);
    return `<h2 style="font-size:17px;margin-top:26px">Book${b} ${esc(bo.zh)} <small>${bo.chs.length} 章 · 本页用到 ${hit.length} 章</small></h2>
    <div class="chgrid">${bo.chs.map(c=>{const ns=use[b+'.'+c.c]||[];
      const secs=c.secs||[];
      return `<div class="ch ${ns.length?'on':''}"><a target="_blank" href="_books/${enc(bo.dir)}/${enc(c.pdf)}" class="cht">${c.c}. ${esc(c.zh)}</a>
        ${c.codes.length?`<span class="cn">${c.codes.length} 代码</span>`:''}${secs.length?`<span class="cn"> · ${secs.length} 节</span>`:''}
        ${secs.length?`<div class="secs">${secs.map(sc=>`<a class="sec" target="_blank" href="_books/${enc(bo.dir)}/${enc(c.pdf)}#page=${sc.p}"><b>${esc(sc.s)}</b> ${esc(sc.t)}</a>`).join('')}</div>`:''}
        <div class="chn">${ns.map(n=>`<span class="chip lite" data-go="${n.id}">${esc(n.title)}</span>`).join('')}</div></div>`}).join('')}</div>`}).join('')}
  <h2 style="margin-top:34px">进阶 / 英文 <small>REFERENCE</small></h2>
  <div class="cards">${Object.keys(RF).map(k=>{const r=RF[k];const ns=useR[k]||[];
    return `<div class="card"><h4><a target="_blank" href="_refs/${enc(r.file)}">${esc(r.zh)}</a><small>${esc(r.en)} · ${esc(r.au)}</small></h4>
      <div style="font-size:13px">${esc(r.note||'')}</div>${r.scan?'<div style="font-size:11.5px;color:#ffb3c5;margin-top:4px">扫描版 · 只能整本打开，节点里不挂它</div>':''}
      <div style="margin-top:8px">${ns.slice(0,14).map(([n,x])=>`<span class="chip lite" data-go="${n.id}">${esc(n.title)}</span>`).join('')||'<span style="color:var(--muted);font-size:12px">这页没挂</span>'}</div>
      ${r.toc&&r.toc.length?`<div class="tag" data-toc="${k}">目录 ${r.toc.length} 条 →</div><div class="tocbox" id="toc_${k}"></div>`:''}</div>`}).join('')}</div></div>`;
  v.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{showView('map');openNode(el.dataset.go,true)});
  v.querySelectorAll('[data-toc]').forEach(el=>el.onclick=()=>{const k=el.dataset.toc,r=RF[k],box=$('toc_'+k);
    if(box.innerHTML){box.innerHTML='';return}
    const draw=q=>{const list=r.toc.filter(t=>!q||t.t.toLowerCase().includes(q.toLowerCase()));
      box.querySelector('.tl').innerHTML=list.slice(0,400).map(t=>`<a class="sec" target="_blank" href="_refs/${enc(r.file)}#page=${t.p}" style="padding-left:${6+(t.d||0)*12}px">${esc(t.t)}<span>p.${t.p}</span></a>`).join('')
        +(list.length>400?`<div style="color:var(--muted);font-size:11px;padding:4px 6px">还有 ${list.length-400} 条，用上面的框筛</div>`:'');};
    box.innerHTML=`<input class="tocq" placeholder="筛小节 · 共 ${r.toc.length} 条"><div class="tl"></div>`;
    const q=box.querySelector('.tocq'); q.oninput=()=>draw(q.value); draw('');});
}

/* ---------- 8.6 判型页：大陆级决策树 ---------- */
let RSEL=null;
function renderRoutes(){
  const v=$('routeview'); if(!v)return;
  const mine=DOMS.filter(d=>RT[d.id]); if(!RSEL||!RT[RSEL])RSEL=mine.length?mine[0].id:null;
  v.innerHTML=`<div class="page"><h2>判型 <small>ROUTE · 先判断，再动手</small></h2>
    <p>知识不是最缺的，<b>判断才是</b>。看到一道题，先沿着树往下走两三步，落到一块牌子上，再去看那块牌子的动画和秒答。</p>
    <div class="row">${DOMS.map(d=>`<button class="pill ${d.id===RSEL?'on':''} ${RT[d.id]?'':'off'}" data-r="${d.id}">${esc(d.name)}</button>`).join('')}</div>
    <div id="rtree">${RSEL?`<div class="rtree">${routeHTML(RT[RSEL].root,0)}</div>`:'<div style="color:var(--muted)">还没有这块大陆的判型树</div>'}</div></div>`;
  v.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{if(!RT[b.dataset.r])return;RSEL=b.dataset.r;renderRoutes()});
  v.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{showView('map');openNode(el.dataset.go,true)});
}
/* ---------- 8.7 计划页 ---------- */
function renderPlan(){
  const v=$('planview'); if(!v)return;
  if(!PL){v.innerHTML='<div class="page"><h2>计划</h2><p>还没有计划数据。</p></div>';return}
  const done=LS('plan');
  const dayHTML=(w,d)=>{
    const key=w.w+'-'+d.d, ok=done[key];
    const rd=(d.read||[]).map(r=>{const u=bkurl(r.b,r.c); if(!u)return '';
      const sc=r.s?secOf(u,r.s):null;
      return `<a class="sec" target="_blank" href="${sc?sc.url:u.pdf}">${esc(u.zh)} ${r.c}${r.s?'.'+esc(r.s.split('.')[1]||''):''} ${esc(sc?sc.t:u.cz)}</a>`}).join('');
    return `<div class="day ${ok?'ok':''}" data-k="${key}">
      <div class="dh"><b>D${d.d}</b><span>${d.min||35} 分钟</span><i>${esc(d.why||'')}</i><button class="tick">${ok?'✓ 完成':'标记完成'}</button></div>
      <div class="dr"><span class="lab">秒答</span>${(d.drill||[]).map(id=>NM[id]?`<span class="chip lite" data-go="${id}">${esc(NM[id].title)}</span>`:'').join('')}</div>
      <div class="dr"><span class="lab">读</span><span class="rds">${rd||'—'}</span></div>
      <div class="dr"><span class="lab">跑</span><span class="bd">${esc(d.build||'—')}</span></div></div>`;
  };
  const tot=PL.weeks.reduce((s,w)=>s+w.days.length,0), fin=Object.keys(done).length;
  v.innerHTML=`<div class="page"><h2>计划 <small>${PL.weeks.length} 周 · 每天 30-50 分钟</small></h2>
    <p>每天三件事：<b>秒答</b>（提取）+ <b>读一节</b>（元学习）+ <b>跑一段代码</b>（直接）。点"标记完成"记进度，进度只存在这台机器。</p>
    <div class="stats"><div class="stat"><b>${fin}/${tot}</b><small>已完成天数</small></div>
      <div class="stat"><b>${Math.round(fin/tot*100)}%</b><small>进度</small></div></div>
    ${PL.weeks.map(w=>`<div class="wk2"><h3>第 ${w.w} 周 · ${esc(w.theme||'')} <span>${esc(w.goal||'')}</span></h3>
      <div class="days">${w.days.map(d=>dayHTML(w,d)).join('')}</div></div>`).join('')}</div>`;
  v.querySelectorAll('.tick').forEach(b=>b.onclick=e=>{const k=e.target.closest('.day').dataset.k;
    const st=LS('plan'); if(st[k])delete st[k]; else st[k]=Date.now(); SV('plan',st); renderPlan()});
  v.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{showView('map');openNode(el.dataset.go,true)});
}

/* ---------- 9. 路由 ---------- */
function route(){
  const h=new URLSearchParams(location.hash.slice(1));
  if(h.get('n')&&NM[h.get('n')]){showView('map');openNode(h.get('n'),true);return true}
  if(h.get('d')&&DM[h.get('d')]){showView('map');zoomTo(DM[h.get('d')]);openDom(h.get('d'));return true}
  if(h.get('in')&&DM[h.get('in')]){showView('map');enterDom(h.get('in'),h.get('s')||null);return true}
  if(h.get('tour')){ const id=h.get('tour'); if(tourById(id)){ tourStart(id,+(h.get('i')||0)); return true } }
  if(h.get('v')){showView(h.get('v'));return true}
  return false;
}
addEventListener('hashchange',route);
if(!route()){showView('map');onboard(false);const hint=$('hint');hint.textContent='拖动 / 滚轮缩放 · 点大陆放大 · 点牌子看动画和秒答 · ⌘K 搜索';hint.classList.add('on');setTimeout(()=>hint.classList.remove('on'),4200)}
svg.on('click',()=>{ if($('drawer').classList.contains('on'))closeDrawer(); });

/* 手机上图例默认收起，点一下展开；顺便把窄屏的提示改成"点两下" */
(function(){
  const lg=$('legend'); if(!lg)return;
  const narrow=()=>matchMedia('(max-width:820px)').matches;
  function sync(){ if(narrow()){ if(!lg.dataset.init){lg.classList.add('fold');lg.dataset.init='1'} } else lg.classList.remove('fold'); }
  lg.addEventListener('click',e=>{ if(narrow()&&lg.classList.contains('fold')){e.stopPropagation();lg.classList.remove('fold')} });
  addEventListener('resize',sync); sync();
})();
window.SU={NODES,DOMS,openNode,zoomTo,showView,SRS,STEPS};
})();
