/* 动画公用小工具：所有 anim_*.js 只依赖 d3 + K */
window.K = (()=>{
  const C={cy:'#3BE8FF',vi:'#8B6CFF',gr:'#5CE8A8',am:'#FFC46B',rd:'#FF6B8A',
           ink:'#E8EEFB',ink2:'#93A4C4',muted:'#5C6B8A',hair:'rgba(126,178,255,.16)'};
  const svg=(stage,W,H)=>d3.select(stage).append('svg')
      .attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('height','100%')
      .style('display','block').style('font-family','inherit');
  /* 中英同框标签 */
  const label=(sel,x,y,zh,en,opt={})=>{
    const g=sel.append('g').attr('transform',`translate(${x},${y})`)
      .attr('text-anchor',opt.anchor||'start');
    g.append('text').text(zh).attr('fill',opt.color||C.ink).attr('font-size',opt.size||13)
      .attr('font-weight',600);
    if(en) g.append('text').text(en).attr('y',(opt.size||13)+2).attr('fill',C.muted)
      .attr('font-size',(opt.size||13)-3).attr('font-family','ui-monospace,Menlo,monospace');
    return g;
  };
  /* 坐标轴：返回 {x,y} 比例尺，并画淡网格 */
  const axes=(sel,W,H,xd,yd,pad=36)=>{
    const x=d3.scaleLinear().domain(xd).range([pad,W-pad]);
    const y=d3.scaleLinear().domain(yd).range([H-pad,pad]);
    const g=sel.append('g');
    g.append('g').attr('transform',`translate(0,${y(0)})`).call(d3.axisBottom(x).ticks(6).tickSize(-0))
      .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10))
      .call(a=>a.selectAll('line,path').attr('stroke',C.hair));
    g.append('g').attr('transform',`translate(${x(0)},0)`).call(d3.axisLeft(y).ticks(6))
      .call(a=>a.selectAll('text').attr('fill',C.muted).attr('font-size',10))
      .call(a=>a.selectAll('line,path').attr('stroke',C.hair));
    return {x,y,g};
  };
  const grid=(sel,W,H,step=40)=>{
    const g=sel.append('g').attr('stroke',C.hair).attr('stroke-width',.5);
    for(let i=0;i<=W;i+=step) g.append('line').attr('x1',i).attr('x2',i).attr('y1',0).attr('y2',H);
    for(let j=0;j<=H;j+=step) g.append('line').attr('y1',j).attr('y2',j).attr('x1',0).attr('x2',W);
    return g;
  };
  /* 箭头 marker */
  const arrow=(svgSel,id,color)=>{
    let d=svgSel.select('defs'); if(d.empty()) d=svgSel.append('defs');
    d.append('marker').attr('id',id).attr('viewBox','0 0 10 10').attr('refX',9).attr('refY',5)
      .attr('markerWidth',7).attr('markerHeight',7).attr('orient','auto-start-reverse')
      .append('path').attr('d','M0,0L10,5L0,10z').attr('fill',color);
    return `url(#${id})`;
  };
  const fmt=(v,d=2)=>Number.isInteger(v)?String(v):(+v).toFixed(d);
  return {C,svg,label,axes,grid,arrow,fmt};
})();
