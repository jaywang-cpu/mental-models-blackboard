/* _kit2.js —— 动画工具箱 v2：把"能画"升级成"能讲"。
   所有 anim_*.js 可用 K（v1）+ K2（本文件）。K2 里的东西都返回 d3 selection 或控制器。 */
window.K2 = (()=>{
const C = K.C;
const EASE = d3.easeCubicInOut;

/* ---------- 画布与坐标 ---------- */
// 带边距的坐标系：返回 {svg,g,x,y,W,H,pad,ax()}
function frame(stage, api, opt={}){
  const W=api.W, H=api.H, pad=opt.pad||{l:44,r:22,t:26,b:34};
  const svg=K.svg(stage,W,H);
  const defs=svg.append('defs');
  // 发光滤镜
  const f=defs.append('filter').attr('id','glow'+Math.random().toString(36).slice(2,7));
  f.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','b');
  const m=f.append('feMerge'); m.append('feMergeNode').attr('in','b'); m.append('feMergeNode').attr('in','SourceGraphic');
  const glow='url(#'+f.attr('id')+')';
  const g=svg.append('g');
  const x=d3.scaleLinear().range([pad.l,W-pad.r]);
  const y=d3.scaleLinear().range([H-pad.b,pad.t]);
  return {svg,g,defs,glow,x,y,W,H,pad,
    axes(xd,yd,opt2={}){ x.domain(xd); y.domain(yd);
      const gx=g.append('g').attr('class','ax').attr('transform',`translate(0,${y(Math.max(yd[0],Math.min(yd[1],0)))})`)
        .call(d3.axisBottom(x).ticks(opt2.xt||6).tickSize(3));
      const gy=g.append('g').attr('class','ax').attr('transform',`translate(${x(Math.max(xd[0],Math.min(xd[1],0)))},0)`)
        .call(d3.axisLeft(y).ticks(opt2.yt||5).tickSize(3));
      [gx,gy].forEach(a=>{a.selectAll('text').attr('fill',C.muted).attr('font-size',9.5);
        a.selectAll('line,path').attr('stroke','rgba(126,178,255,.22)')});
      if(opt2.grid!==false){const gg=g.insert('g',':first-child').attr('stroke','rgba(126,178,255,.07)');
        x.ticks(opt2.xt||6).forEach(v=>gg.append('line').attr('x1',x(v)).attr('x2',x(v)).attr('y1',pad.t).attr('y2',H-pad.b));
        y.ticks(opt2.yt||5).forEach(v=>gg.append('line').attr('y1',y(v)).attr('y2',y(v)).attr('x1',pad.l).attr('x2',W-pad.r));}
      if(opt2.xlab)txt(g,W-pad.r,H-pad.b+22,opt2.xlab,{anchor:'end',size:10,color:C.muted});
      if(opt2.ylab)txt(g,pad.l-6,pad.t-8,opt2.ylab,{anchor:'end',size:10,color:C.muted});
      return {gx,gy};}};
}
/* ---------- 文字 ---------- */
const txt=(sel,x,y,s,o={})=>sel.append('text').attr('x',x).attr('y',y).text(s)
  .attr('fill',o.color||C.ink).attr('font-size',o.size||12).attr('text-anchor',o.anchor||'start')
  .attr('font-weight',o.bold?650:400).attr('opacity',o.op==null?1:o.op)
  .attr('font-family',o.mono?'ui-monospace,Menlo,monospace':null);
// 中英双行标签
const lab=(sel,x,y,zh,en,o={})=>{const g=sel.append('g').attr('transform',`translate(${x},${y})`);
  txt(g,0,0,zh,{...o,size:o.size||12.5,bold:true}); if(en)txt(g,0,(o.size||12.5)+2,en,{size:(o.size||12.5)-3.5,color:C.muted,mono:true,anchor:o.anchor});
  return g;};
/* 标注：一条引线 + 一段话，会淡入 */
function annot(sel,x,y,tx,ty,s,o={}){
  const g=sel.append('g').attr('opacity',0);
  g.append('path').attr('d',`M${x},${y} L${tx},${ty}`).attr('stroke',o.color||C.am)
    .attr('stroke-width',1).attr('stroke-dasharray','3 3').attr('fill','none');
  g.append('circle').attr('cx',x).attr('cy',y).attr('r',3).attr('fill',o.color||C.am);
  const t=txt(g,tx+(o.anchor==='end'?-6:6),ty+4,s,{size:o.size||11.5,color:o.color||C.am,anchor:o.anchor||'start'});
  const bb=()=>{try{return t.node().getBBox()}catch(e){return null}};
  const b=bb(); if(b) g.insert('rect',':nth-child(3)').attr('x',b.x-5).attr('y',b.y-3).attr('width',b.width+10).attr('height',b.height+6)
    .attr('rx',5).attr('fill','rgba(4,6,13,.82)').attr('stroke',(o.color||C.am)).attr('stroke-opacity',.35);
  g.transition().duration(o.dur||420).attr('opacity',1);
  return g;
}
/* ---------- 图元 ---------- */
const dot=(sel,x,y,r,c,o={})=>sel.append('circle').attr('cx',x).attr('cy',y).attr('r',r)
  .attr('fill',c).attr('opacity',o.op==null?1:o.op).attr('stroke',o.stroke||null).attr('stroke-width',o.sw||null);
const line=(sel,x1,y1,x2,y2,c,w=1.5,o={})=>sel.append('line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
  .attr('stroke',c).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null)
  .attr('opacity',o.op==null?1:o.op).attr('marker-end',o.arrow||null).attr('stroke-linecap','round');
const rect=(sel,x,y,w,h,c,o={})=>sel.append('rect').attr('x',x).attr('y',y).attr('width',w).attr('height',h)
  .attr('rx',o.r==null?4:o.r).attr('fill',o.fill===false?'none':(o.fill||c)).attr('fill-opacity',o.fo==null?.18:o.fo)
  .attr('stroke',c).attr('stroke-width',o.sw==null?1.2:o.sw).attr('stroke-dasharray',o.dash||null);
const path=(sel,d,c,w=1.8,o={})=>sel.append('path').attr('d',d).attr('fill',o.fill||'none')
  .attr('stroke',c).attr('stroke-width',w).attr('stroke-dasharray',o.dash||null).attr('opacity',o.op==null?1:o.op)
  .attr('stroke-linejoin','round').attr('stroke-linecap','round');
/* 箭头 marker，返回 url() */
function arrow(svgSel,color,id){ id=id||('a'+Math.random().toString(36).slice(2,8));
  let d=svgSel.select('defs'); if(d.empty())d=svgSel.append('defs');
  d.append('marker').attr('id',id).attr('viewBox','0 0 10 10').attr('refX',9).attr('refY',5)
   .attr('markerWidth',6.5).attr('markerHeight',6.5).attr('orient','auto-start-reverse')
   .append('path').attr('d','M0,0L10,5L0,10z').attr('fill',color);
  return `url(#${id})`;
}
/* 向量：带箭头 + 标签，可更新 */
function vec(sel,svgSel,ox,oy,c,label){
  const mk=arrow(svgSel,c);
  const l=line(sel,ox,oy,ox,oy,c,2.2,{arrow:mk});
  const t=label?txt(sel,ox,oy,label,{color:c,size:12,bold:true}):null;
  return {set(x,y){l.attr('x2',x).attr('y2',y); if(t)t.attr('x',x+7).attr('y',y-4); return this;},
          el:l,txt:t};
}
/* 函数曲线：给 f 和 x 域，返回 path，可 update */
function curve(sel,x,y,f,c,o={}){
  const N=o.n||160;
  const gen=()=>{const d=[];const [a,b]=x.domain();
    for(let i=0;i<=N;i++){const xv=a+(b-a)*i/N, yv=f(xv);
      if(isFinite(yv))d.push([x(xv),y(Math.max(y.domain()[0],Math.min(y.domain()[1],yv)))]);}
    return d3.line().curve(d3.curveMonotoneX)(d);};
  const p=path(sel,gen(),c,o.w||2,o);
  return {el:p,update(f2){f=f2||f;p.attr('d',gen());return this;},
          flash(){p.attr('opacity',.2).transition().duration(500).attr('opacity',1);return this;}};
}
/* 矩阵网格：返回 {g, cell(i,j), set(i,j,v), hi(i,j,color)} */
function matrix(sel,x0,y0,rows,cols,s,o={}){
  const g=sel.append('g').attr('transform',`translate(${x0},${y0})`);
  const cells=[];
  for(let i=0;i<rows;i++){cells[i]=[];for(let j=0;j<cols;j++){
    const c=g.append('g').attr('transform',`translate(${j*(s+3)},${i*(s+3)})`);
    const r=rect(c,0,0,s,s,o.color||C.muted,{fo:o.fo==null?.12:o.fo,r:3});
    const t=txt(c,s/2,s/2+4,o.v?o.v(i,j):'',{anchor:'middle',size:o.fs||11,mono:true});
    cells[i][j]={g:c,rect:r,txt:t};}}
  if(o.label)lab(g,0,-10,o.label,o.en||'',{size:11});
  return {g,cells,
    set(i,j,v){cells[i][j].txt.text(v);return this;},
    hi(i,j,c,fo){cells[i][j].rect.attr('stroke',c||C.cy).attr('fill',c||C.cy).attr('fill-opacity',fo==null?.42:fo);return this;},
    dim(){cells.forEach(r=>r.forEach(c=>c.rect.attr('stroke',o.color||C.muted).attr('fill',o.color||C.muted).attr('fill-opacity',o.fo==null?.12:o.fo)));return this;},
    row(i,c){cells[i].forEach((_,j)=>this.hi(i,j,c));return this;},
    col(j,c){cells.forEach((_,i)=>this.hi(i,j,c));return this;},
    w:cols*(s+3)-3, h:rows*(s+3)-3};
}
/* 条形图：返回 {update(vals)} */
function bars(sel,x0,y0,w,h,vals,o={}){
  const g=sel.append('g').attr('transform',`translate(${x0},${y0})`);
  const n=vals.length, bw=w/n*0.72, gap=w/n;
  const sc=d3.scaleLinear().domain([0,o.max||d3.max(vals)||1]).range([0,h]);
  const rs=vals.map((v,i)=>rect(g,i*gap,h-sc(v),bw,sc(v),o.color||C.cy,{fo:.55,r:3}));
  const ts=o.labels?vals.map((v,i)=>txt(g,i*gap+bw/2,h+13,o.labels[i],{anchor:'middle',size:10,color:C.muted})):null;
  const vs=o.showv?vals.map((v,i)=>txt(g,i*gap+bw/2,h-sc(v)-5,K.fmt(v,o.dp==null?2:o.dp),{anchor:'middle',size:10,color:C.ink2})):null;
  return {g,update(nv,max){ if(max)sc.domain([0,max]);
    nv.forEach((v,i)=>{rs[i].attr('y',h-sc(v)).attr('height',Math.max(0,sc(v)));
      if(vs)vs[i].attr('y',h-sc(v)-5).text(K.fmt(v,o.dp==null?2:o.dp));});return this;},
    color(i,c){rs[i].attr('fill',c).attr('stroke',c);return this;}};
}
/* 点云：返回 {pts, g, redraw(f)} */
function cloud(sel,x,y,pts,c,o={}){
  const g=sel.append('g');
  const cs=pts.map(p=>dot(g,x(p[0]),y(p[1]),o.r||3,c,{op:o.op==null?.7:o.op}));
  return {g,cs,move(np){np.forEach((p,i)=>cs[i].attr('cx',x(p[0])).attr('cy',y(p[1])));return this;},
    color(f){cs.forEach((c2,i)=>c2.attr('fill',f(i)));return this;}};
}
/* ---------- 动效 ---------- */
// 沿路径跑的点
function runner(sel,pathEl,c,r=5){
  const node=pathEl.node?pathEl.node():pathEl, L=node.getTotalLength();
  const d=dot(sel,0,0,r,c);
  return {at(t){const p=node.getPointAtLength(Math.max(0,Math.min(1,t))*L);d.attr('cx',p.x).attr('cy',p.y);return this;},el:d};
}
// 脉冲高亮
function pulse(el,c){ el.attr('stroke',c||C.am).attr('stroke-width',3)
  .transition().duration(320).attr('stroke-width',1.4).transition().duration(320).attr('stroke-width',3)
  .on('end',function(){d3.select(this).attr('stroke-width',2)}); return el; }
// 数字滚动
function counter(sel,x,y,o={}){ const t=txt(sel,x,y,'',{size:o.size||13,mono:true,color:o.color||C.ink,bold:true,anchor:o.anchor});
  return {set(v,suf){t.text((o.pre||'')+K.fmt(v,o.dp==null?2:o.dp)+(suf||o.suf||''));return this;},el:t}; }
/* ---------- 分步：让"分步讲解"能真的改画面 ---------- */
// steps: [{t:'这一步在干什么', d:'为什么', at:()=>{...改画面...}}]
function stepper(api,steps){
  let i=-1;
  const go=k=>{ i=Math.max(0,Math.min(steps.length-1,k)); for(let j=0;j<=i;j++){ if(steps[j].at)steps[j].at(j===i); } return i; };
  return {n:steps.length, steps, go, cur:()=>i,
    next(){return go(i+1)}, prev(){return go(i-1)}, reset(){i=-1;return go(0)}};
}
/* 图例 */
function legend(sel,x,y,items,o={}){
  const g=sel.append('g').attr('transform',`translate(${x},${y})`);
  items.forEach((it,i)=>{const yy=i*(o.gap||15);
    if(it.line)line(g,0,yy,16,yy,it.c,2.4,{dash:it.dash});
    else rect(g,0,yy-5,11,11,it.c,{fo:.6,r:2});
    txt(g,21,yy+4,it.t,{size:10.5,color:C.ink2});});
  return g;
}
return {frame,txt,lab,annot,dot,line,rect,path,arrow,vec,curve,matrix,bars,cloud,runner,pulse,counter,stepper,legend,C,EASE};
})();
