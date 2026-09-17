/* 计算台 · 渲染层 */
(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sup=s=>esc(LU.disp(s)).replace(/×10\^(-?\d+)/g,(m,e)=>'×10<sup>'+e.replace('-','−')+'</sup>')
  .replace(/\^(-?\d+)/g,'<sup>$1</sup>');
const KEY='labcalc_v1';
let MEM=(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}})();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(MEM))}catch(e){}};
const CATS=[...new Set(CALCS.map(c=>c.cat))];
let FILTER='全部', ONLY='';

/* ---------- 顶部万能换算 ---------- */
function topbar(){
  const m=MEM.__top||{x:'2.17 g/L',to:'',mw:''};
  $('top').innerHTML=`
   <div class="tl"><b>万能换算</b><s>CONVERT ANYTHING · 敲进去就出全套等价写法</s></div>
   <div class="trow">
     <input id="t_x" class="big" value="${esc(m.x)}" placeholder="2.17 g/L" spellcheck="false" autocomplete="off">
     <input id="t_to" value="${esc(m.to)}" placeholder="换成 …（留空＝全部）" spellcheck="false" autocomplete="off">
     <input id="t_mw" value="${esc(m.mw)}" placeholder="MW g/mol（跨到摩尔浓度才要）" spellcheck="false" autocomplete="off">
   </div>
   <div id="t_out"></div>
   <div class="quick">${['2.17 g/L','10 mg/mL','50 uM','150 kDa','1e6 cells/mL','100 nm','0.9 %','50 ng/uL','300 g/mol']
     .map(q=>`<button data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`;
  const draw=()=>{
    const x=$('t_x').value, to=$('t_to').value.trim(), mw=parseFloat($('t_mw').value)||0;
    MEM.__top={x,to,mw:$('t_mw').value}; save();
    const box=$('t_out');
    if(!x.trim()){ box.innerHTML=''; return; }
    if(to){
      const r=LU.convert(x,to,{mw});
      box.innerHTML=r.ok?`<div class="one">${sup(x)} <i>=</i> <b>${sup(LU.fmt(r.v))} ${esc(LU.disp(to))}</b>${r.via?`<em>via ${esc(r.via)}</em>`:''}</div>`
        :`<div class="bad">${esc(r.err)}</div>`;
      return;
    }
    const e=LU.equivalents(x,99,{mw});
    if(!e.ok){ box.innerHTML=`<div class="bad">${esc(e.err)}</div>`; return; }
    const main=e.rows.filter(r=>r.self||(Math.abs(r.v)>=1e-3&&Math.abs(r.v)<1e6));
    box.innerHTML=(VIZ.ladder(e.q,main)||'')
      +`<div class="dim">量纲 · ${esc(e.dim)}</div>
      <div class="eqs">${main.map(r=>`<span class="eq ${r.tidy?'tidy':''}">${sup(LU.fmt(r.v))} <i>${esc(LU.disp(r.unit))}</i></span>`).join('<b class="sep">=</b>')}</div>
      ${(e.cross||[]).length?`<div class="dim">跨量纲（用了 MW / N<sub>A</sub>）</div>
       <div class="eqs">${e.cross.map(r=>`<span class="eq x">${sup(LU.fmt(r.v))} <i>${esc(LU.disp(r.unit))}</i></span>`).join('')}</div>`:''}
      ${!mw&&(e.dim==='质量浓度'||e.dim==='质量')?`<div class="hint">填上 MW 就能同时给出摩尔浓度</div>`:''}`;
  };
  ['t_x','t_to','t_mw'].forEach(id=>$(id).oninput=draw);
  document.querySelectorAll('.quick button').forEach(b=>b.onclick=()=>{$('t_x').value=b.dataset.q;draw()});
  draw();
}

/* ---------- 计算卡 ---------- */
function cardHTML(c){
  const m=MEM[c.id]||{};
  return `<div class="calc" id="c_${c.id}" data-cat="${esc(c.cat)}">
    <div class="ch"><b>${esc(c.name)}</b><s>${esc(c.en)}</s><span class="cat">${esc(c.cat)}</span></div>
    <div class="cg">${esc(c.gut)}</div>
    <div class="cf">${c.f.map(f=>`<label class="${f.wide?'wide':''}">
      <span>${esc(f.label)}${f.unit?` <i>${esc(LU.disp(f.unit))}</i>`:''}</span>
      <input data-c="${c.id}" data-k="${f.k}" value="${esc(m[f.k]!==undefined?m[f.k]:f.def)}"
        placeholder="${esc(f.ph||'')}" spellcheck="false" autocomplete="off"></label>`).join('')}</div>
    <div class="cv" id="v_${c.id}"></div>
    <div class="co" id="o_${c.id}"></div>
    <div class="ct"><b>坑</b>${esc(c.trap)}</div>
  </div>`;
}
function calc(c){
  const v={}; document.querySelectorAll(`[data-c="${c.id}"]`).forEach(i=>v[i.dataset.k]=i.value);
  MEM[c.id]=v; save();
  let r; try{ r=c.run(v)||{}; }catch(e){ r={rows:[],warn:'算不动：'+e.message}; }
  const vb=$('v_'+c.id);
  if(vb){ let g=''; try{ g=(VIZ[c.id]||VIZ.chain)(v,r)||''; }catch(e){ g=''; } vb.innerHTML=g; }
  const box=$('o_'+c.id);
  box.innerHTML=(r.rows&&r.rows.length?`<div class="rs">${r.rows.map(x=>
      `<div class="r ${x.hi?'hi':''}">${x.k?`<s>${esc(x.k)}</s>`:''}<b>${sup(x.v)}</b></div>`).join('')}</div>`:'')
    +(r.say?`<div class="say">${sup(r.say)}</div>`:'')
    +(r.warn?`<div class="warn">${esc(r.warn)}</div>`:'')
    +(r.note?`<div class="note">${esc(r.note)}</div>`:'');
}
function render(){
  const list=ONLY?CALCS.filter(c=>c.id===ONLY):CALCS.filter(c=>FILTER==='全部'||c.cat===FILTER);
  $('cards').innerHTML=list.map(cardHTML).join('');
  list.forEach(c=>{
    document.querySelectorAll(`[data-c="${c.id}"]`).forEach(i=>i.oninput=()=>calc(c));
    calc(c);
  });
}
function nav(){
  if(ONLY){ const c=CALCS.filter(x=>x.id===ONLY)[0];
    $('nav').innerHTML=`<button class="nb on">只看 · ${esc(c?c.name:'')}</button><button class="nb" id="showall">← 看全部 14 张</button>`;
    $('showall').onclick=()=>{ONLY='';location.hash='';nav();render()};
    return; }
  $('nav').innerHTML=['全部'].concat(CATS).map(k=>
    `<button class="nb ${k===FILTER?'on':''}" data-k="${esc(k)}">${esc(k)}<i>${k==='全部'?CALCS.length:CALCS.filter(c=>c.cat===k).length}</i></button>`).join('');
  document.querySelectorAll('.nb[data-k]').forEach(b=>b.onclick=()=>{FILTER=b.dataset.k;nav();render();window.scrollTo({top:0,behavior:'smooth'})});
}
/* 从数感大陆点进来时带着卡片 id：直接只显示那一张，不用滚 */
(function(){ const h=location.hash.replace('#','');
  if(h&&CALCS.some(c=>c.id===h)) ONLY=h; })();
topbar(); nav(); render();
$('reset').onclick=()=>{ if(!confirm('清空所有输入框，回到默认值？'))return; MEM={}; save(); topbar(); render(); };
addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('t_x').focus();$('t_x').select()} });
})();
