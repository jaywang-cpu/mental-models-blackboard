/* 量纲引擎 · 实验室单位的唯一真相
   第一性：任何换算都是"乘以 1"。1 = 1000 mg / 1 g。
   所以只需要每个单位到基准单位的因子 + 一套维度向量，剩下全是乘除。
   维度向量 [M 质量, V 体积, N 物质的量, L 长度, T 时间, C 个数] */
(function(root){
const D=(M=0,V=0,N=0,L=0,T=0,C=0)=>[M,V,N,L,T,C];
const dEq=(a,b)=>a.every((x,i)=>x===b[i]);
const dMul=(a,b)=>a.map((x,i)=>x+b[i]);
const dDiv=(a,b)=>a.map((x,i)=>x-b[i]);
const dPow=(a,p)=>a.map(x=>x*p);
const dZero=D();

/* 基本单位表：sym -> {f 到基准的因子, d 维度, zh} */
const U={};
const add=(syms,f,d,zh)=>syms.split(' ').forEach(s=>{U[s]={f,d,zh,canon:syms.split(' ')[0]}});

/* 质量 基准 g */
add('kg 千克',1e3,D(1),'千克');      add('g 克',1,D(1),'克');
add('mg 毫克',1e-3,D(1),'毫克');     add('ug µg μg 微克',1e-6,D(1),'微克');
add('ng 纳克',1e-9,D(1),'纳克');     add('pg 皮克',1e-12,D(1),'皮克');
add('fg',1e-15,D(1),'飞克');
add('Da dalton',1.66053906660e-24,D(1),'道尔顿');
add('kDa',1.66053906660e-21,D(1),'千道尔顿');
add('MDa',1.66053906660e-18,D(1),'兆道尔顿');
/* 体积 基准 L */
add('L 升 l',1,D(0,1),'升');         add('dL',0.1,D(0,1),'分升');
add('mL ml 毫升',1e-3,D(0,1),'毫升'); add('uL µL μL ul 微升',1e-6,D(0,1),'微升');
add('nL nl',1e-9,D(0,1),'纳升');     add('pL',1e-12,D(0,1),'皮升');
add('cm3 cc',1e-3,D(0,1),'立方厘米');add('m3',1e3,D(0,1),'立方米');
add('mm3',1e-6,D(0,1),'立方毫米');   add('um3 µm3 μm3',1e-15,D(0,1),'立方微米');
/* 物质的量 基准 mol */
add('mol 摩尔',1,D(0,0,1),'摩尔');   add('mmol',1e-3,D(0,0,1),'毫摩');
add('umol µmol μmol',1e-6,D(0,0,1),'微摩'); add('nmol',1e-9,D(0,0,1),'纳摩');
add('pmol',1e-12,D(0,0,1),'皮摩');   add('fmol',1e-15,D(0,0,1),'飞摩');
add('amol',1e-18,D(0,0,1),'阿摩');
/* 长度 基准 m */
add('km',1e3,D(0,0,0,1),'千米');     add('m 米',1,D(0,0,0,1),'米');
add('cm 厘米',1e-2,D(0,0,0,1),'厘米');add('mm 毫米',1e-3,D(0,0,0,1),'毫米');
add('um µm μm 微米',1e-6,D(0,0,0,1),'微米'); add('nm 纳米',1e-9,D(0,0,0,1),'纳米');
add('A Å angstrom',1e-10,D(0,0,0,1),'埃'); add('pm',1e-12,D(0,0,0,1),'皮米');
/* 时间 基准 s */
add('s sec 秒',1,D(0,0,0,0,1),'秒'); add('min 分',60,D(0,0,0,0,1),'分钟');
add('h hr 小时',3600,D(0,0,0,0,1),'小时'); add('d day 天',86400,D(0,0,0,0,1),'天');
/* 个数 基准 个（无量纲计数） */
add('cell cells 细胞',1,D(0,0,0,0,0,1),'个细胞');
add('particle particles 颗粒 p',1,D(0,0,0,0,0,1),'颗粒');
add('copy copies 拷贝',1,D(0,0,0,0,0,1),'拷贝');
add('event events',1,D(0,0,0,0,0,1),'事件');
add('个 count',1,D(0,0,0,0,0,1),'个');
/* 面积（由长度推导，直接给常用） */
add('cm2',1e-4,D(0,0,0,2),'平方厘米'); add('m2',1,D(0,0,0,2),'平方米');
add('mm2',1e-6,D(0,0,0,2),'平方毫米'); add('um2 µm2 μm2',1e-12,D(0,0,0,2),'平方微米');
add('nm2',1e-18,D(0,0,0,2),'平方纳米');

/* 摩尔浓度别名：M = mol/L */
const MOLAR=D(0,-1,1);
add('M 摩尔浓度',1,MOLAR,'摩尔每升');  add('mM',1e-3,MOLAR,'毫摩尔每升');
add('uM µM μM',1e-6,MOLAR,'微摩尔每升'); add('nM',1e-9,MOLAR,'纳摩尔每升');
add('pM',1e-12,MOLAR,'皮摩尔每升');    add('fM',1e-15,MOLAR,'飞摩尔每升');
/* 无量纲比例 */
add('% pct',1e-2,dZero,'百分比');
add('ppm',1e-6,dZero,'百万分之一'); add('ppb',1e-9,dZero,'十亿分之一');
add('x X 倍',1,dZero,'倍');
add('fold',1,dZero,'倍');

/* ---------- 解析 ---------- */
const NORM=s=>String(s).trim()
  .replace(/([\d.])\s*[×x*]\s*10\s*\^?\s*([-+]?\d+)/g,'$1e$2')   // 2.5×10^-4 → 2.5e-4
  .replace(/µ/g,'μ').replace(/μ/g,'u')          // 统一微
  .replace(/[（]/g,'(').replace(/[）]/g,')')
  .replace(/·|∙|\*/g,'*').replace(/÷/g,'/')
  .replace(/\s+/g,' ');
function lookup(sym){
  if(U[sym]) return U[sym];
  const alt=sym.replace(/^u/,'μ'); if(U[alt]) return U[alt];
  return null;
}
/* 解析单位串，如 'mg/mL'、'g/(L*min)'、'cells/mL'、'nm^3' */
function parseUnit(str){
  const s=NORM(str); if(!s) return {f:1,d:dZero.slice(),ok:true,txt:''};
  let i=0, f=1, d=dZero.slice(), sign=1, ok=true;
  const tok=()=>{ let j=i; while(j<s.length && /[A-Za-zμÅ%°0-9\u4e00-\u9fa5]/.test(s[j])) j++; return s.slice(i,(i=j)); };
  while(i<s.length){
    const c=s[i];
    if(c===' '||c==='*'){ i++; continue; }
    if(c==='/'){ sign=-1; i++; continue; }
    if(c==='('){ i++; const st=i; let dep=1;
      while(i<s.length&&dep){ if(s[i]==='(')dep++; if(s[i]===')')dep--; i++; }
      const inner=parseUnit(s.slice(st,i-1)); if(!inner.ok) return {ok:false};
      f*= sign>0?inner.f:1/inner.f; d=sign>0?dMul(d,inner.d):dDiv(d,inner.d); sign=1; continue; }
    let t=tok(); if(!t){ return {ok:false,bad:s.slice(i)}; }
    let p=1;
    const m=t.match(/^([A-Za-zμÅ%\u4e00-\u9fa5]+)(\d+)$/);                 // cm2, nm3
    let base=t;
    if(m && !lookup(t)){ base=m[1]; p=+m[2]; }
    if(s[i]==='^'){ i++; const e=tok(); p*= +e||1; }
    const u=lookup(base);
    if(!u) return {ok:false,bad:base};
    f *= Math.pow(u.f, p*sign);
    d = sign>0 ? dMul(d,dPow(u.d,p)) : dDiv(d,dPow(u.d,p));
    sign=1;
  }
  return {f,d,ok,txt:str.trim()};
}
/* 解析 '2.17 g/L' -> {v, unit} */
function parseQty(str){
  const s=NORM(str);
  const m=s.match(/^([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)\s*(.*)$/);
  if(!m) return {ok:false, err:'开头要是一个数'};
  const v=parseFloat(m[1]); const us=m[2].trim();
  const u=parseUnit(us);
  if(!u.ok) return {ok:false, err:'看不懂的单位：'+(u.bad||us)};
  return {ok:true, v, unit:us, f:u.f, d:u.d, base:v*u.f};
}
/* 桥：两条量纲之间差的正好是 MW 和 NA 的幂次时，自动搭桥
   MW 的维度 = 质量/物质的量，NA 的维度 = 个数/物质的量
   解 q.d + a·dim(MW) + b·dim(NA) = t.d，a、b 是 -2..2 的整数 */
function bridge(qd,td){
  const a=td[0]-qd[0];                       // 质量分量只能由 MW 提供
  const b=qd[2]-a-td[2];                     // 物质的量分量配平
  if(Math.abs(a)>2||Math.abs(b)>2) return null;
  if(qd[5]+b!==td[5]) return null;            // 个数分量要对上
  if(qd[1]!==td[1]||qd[3]!==td[3]||qd[4]!==td[4]) return null;   // 体积/长度/时间必须已相等
  return {a,b};
}
const DAF={Da:1,dalton:1,kDa:1e3,MDa:1e6};          // 1 Da 当分子量用就是 1 g/mol
const MOLARMASS=D(1,0,-1);
function convert(str,target,opt){
  opt=opt||{};
  const q=parseQty(str); if(!q.ok) return q;
  const t=parseUnit(target);
  if(!t.ok) return {ok:false, err:'看不懂的目标单位：'+(t.bad||target)};
  if(dEq(q.d,t.d)) return {ok:true, v:q.base/t.f, unit:target};
  const us=NORM(q.unit), ts=NORM(target);
  if(DAF[us] && dEq(t.d,MOLARMASS))                  // 150 kDa → g/mol
    return {ok:true, v:q.v*DAF[us]/t.f, unit:target, via:'1 Da = 1 g/mol'};
  if(DAF[ts] && dEq(q.d,MOLARMASS))                  // 150000 g/mol → kDa
    return {ok:true, v:q.base/DAF[ts], unit:target, via:'1 g/mol = 1 Da'};
  const br=bridge(q.d,t.d);
  if(!br) return {ok:false, err:'量纲不符：'+dName(q.d)+' 换不成 '+dName(t.d)};
  if(br.a!==0 && !opt.mw) return {ok:false, need:'mw',
    err:dName(q.d)+' 换 '+dName(t.d)+' 要分子量 MW（g/mol），填了就能算'};
  const mw=opt.mw||1;
  const v=q.base*Math.pow(mw,br.a)*Math.pow(NA,br.b)/t.f;
  return {ok:true, v, unit:target, via:(br.a?('MW^'+br.a+' '):'')+(br.b?('NA^'+br.b):'')};
}
const DIMNAME=[[D(1),'质量'],[D(0,1),'体积'],[D(0,0,1),'物质的量'],[D(0,0,0,1),'长度'],
 [D(0,0,0,2),'面积'],[D(0,0,0,3),'体积(长度³)'],[D(0,0,0,0,1),'时间'],[D(0,0,0,0,0,1),'个数'],
 [D(1,-1),'质量浓度'],[D(0,-1,1),'摩尔浓度'],[D(0,-1,0,0,0,1),'数量浓度'],
 [D(1,0,-1),'摩尔质量'],[D(0,0,0,-2,0,1),'面密度'],[dZero,'无量纲']];
function dName(d){ const h=DIMNAME.find(x=>dEq(x[0],d)); return h?h[1]:'['+d.join(',')+']'; }

/* 同维度下所有"好看"的等价写法 */
const FAMILY={
 '质量浓度':['kg/L','g/L','mg/mL','ug/uL','g/mL','mg/L','ug/mL','ng/uL','ng/mL','pg/uL','pg/mL','ug/L','ng/L'],
 '摩尔浓度':['M','mM','uM','nM','pM','fM','mol/L','mmol/L','umol/L','nmol/mL','pmol/uL'],
 '质量':['kg','g','mg','ug','ng','pg','fg','Da','kDa','MDa'],
 '体积':['L','mL','uL','nL','pL'],
 '物质的量':['mol','mmol','umol','nmol','pmol','fmol'],
 '长度':['m','cm','mm','um','nm','A'],
 '面积':['m2','cm2','mm2','um2','nm2'],
 '时间':['d','h','min','s'],
 '个数':['cells','particles','copies'],
 '数量浓度':['cells/mL','cells/uL','cells/L','particles/mL','particles/uL','copies/uL','copies/mL'],
 '摩尔质量':['g/mol','kg/mol','Da'],
 '无量纲':['x','%','ppm','ppb']
};
function equivalents(str,limit,opt){
  opt=opt||{};
  const q=parseQty(str); if(!q.ok) return q;
  const fam=FAMILY[dName(q.d)]||[];
  const rows=[];
  fam.forEach(u=>{
    const t=parseUnit(u); if(!t.ok||!dEq(t.d,q.d))return;
    const v=q.base/t.f;
    rows.push({unit:u, v, tidy: Math.abs(v)>=0.1&&Math.abs(v)<10000});
  });
  rows.sort((a,b)=>(b.tidy-a.tidy)|| (Math.abs(Math.log10(Math.abs(a.v)||1))-Math.abs(Math.log10(Math.abs(b.v)||1))));
  // 用户自己写的那个单位永远排第一，哪怕数字不好看
  const own=NORM(q.unit);
  const oi=rows.findIndex(r=>NORM(r.unit)===own);
  if(oi>0) rows.unshift(rows.splice(oi,1)[0]);
  else if(oi<0&&own) rows.unshift({unit:q.unit, v:q.v, tidy:true, self:1});
  // 有分子量就把跨维度的家族也桥过来（质量浓度 ↔ 摩尔浓度、质量 ↔ mol、mol ↔ 个数）
  const cross=[];
  if(opt.mw||dEq(q.d,D(0,0,1))||dEq(q.d,D(0,-1,1))||dEq(q.d,D(0,0,0,0,0,1))){
    Object.keys(FAMILY).forEach(k=>{
      if(k===dName(q.d))return;
      FAMILY[k].forEach(u=>{
        const r=convert(fmt(q.v,12)+' '+q.unit,u,opt);
        if(r.ok&&isFinite(r.v)&&Math.abs(r.v)>=0.01&&Math.abs(r.v)<1e5) cross.push({unit:u,v:r.v,dim:k,tidy:true});
      });
    });
  }
  return {ok:true, dim:dName(q.d), base:q.base, rows:limit?rows.slice(0,limit):rows, cross, q};
}
/* 数字排版：有效数字优先，大小数走科学计数 */
function fmt(v,sig){
  sig=sig||4;
  if(!isFinite(v)) return '—';
  if(v===0) return '0';
  const a=Math.abs(v);
  if(a>=1e5||a<1e-4){ const e=Math.floor(Math.log10(a)); const m=v/Math.pow(10,e);
    return (+m.toFixed(sig-1))+'×10^'+e; }
  const digits=Math.max(0,sig-1-Math.floor(Math.log10(a)));
  return String(+v.toFixed(Math.min(12,digits)));
}
/* 常数 */
const NA=6.02214076e23;
/* 显示用：内部一律 u，给人看一律 μ */
const disp=u=>String(u).replace(/\bu(g|L|l|M|m|mol|m2|m3)\b/g,'μ$1');
root.LU={parseUnit,parseQty,convert,equivalents,dName,fmt,NA,U,FAMILY,dEq,D,bridge,disp};
})(typeof window!=='undefined'?window:globalThis);
