/* 实验室计算卡 · 纯计算层（不碰 DOM，可在 node 里自测）
   每张卡：f 字段定义，run(v) 拿到已解析的数值，返回 {rows:[{k,v,hi}], say, warn}
   数值解析统一走 LU：字段值可以带单位，也可以是纯数字（用 unit 兜底） */
(function(root){
const L=root.LU;
const Q=(s,def)=>{ const r=L.parseQty(String(s||'').trim()||String(def||'')); return r.ok?r:null; };
const inU=(s,unit,def)=>{                      // 把字段解析成指定单位下的数值
  const t=String(s??'').trim(); if(t==='') return NaN;
  if(/^[-+0-9.eE]+$/.test(t)) return parseFloat(t);
  const r=L.convert(t,unit); return r.ok?r.v:NaN;
};
const F=L.fmt;
/* 把一个基准单位下的数值，挑一个读起来最顺的单位写出来（不做字符串往返） */
const pretty=(base,dim,sig)=>{
  const fam=L.FAMILY[dim]||[]; let best=null;
  fam.forEach(u=>{ const t=L.parseUnit(u); if(!t.ok)return; const v=base/t.f;
    const score=(Math.abs(v)>=0.1&&Math.abs(v)<10000)?0:1;
    const dist=Math.abs(Math.log10(Math.abs(v)||1));
    if(!best||score<best.score||(score===best.score&&dist<best.dist)) best={score,dist,v,u}; });
  return best? L.fmt(best.v,sig)+' '+best.u : L.fmt(base,sig);
};
/* C₂ 字段也接受"稀释倍数"写法：10x / 10× / 10倍 / 1:10 / 1：10 */
const FOLD=s=>{
  const t=String(s??'').trim(); if(!t) return 0;
  let m=t.match(/^1\s*[:：]\s*([0-9.]+(?:[eE][-+]?\d+)?)$/);
  if(m) return parseFloat(m[1]);
  m=t.match(/^([0-9.]+(?:[eE][-+]?\d+)?)\s*(?:x|X|×|倍)$/);
  if(m) return parseFloat(m[1]);
  return 0;
};

const PLATE={'96 孔':0.32,'48 孔':0.95,'24 孔':1.9,'12 孔':3.8,'6 孔':9.6,'T25':25,'T75':75,'T175':175,'10 cm 皿':56.7,'15 cm 皿':152};

const CALCS=[
{id:'dilute', cat:'浓度与稀释', name:'稀释 C₁V₁=C₂V₂', en:'DILUTION',
 gut:'溶质的量不变，所以浓度和体积成反比。先算稀释倍数，再看要几分之一。',
 f:[{k:'c1',label:'母液浓度 C₁',ph:'10 mg/mL',def:'10 mg/mL'},
    {k:'c2',label:'目标浓度 C₂ 或倍数',ph:'0.5 mg/mL，也可写 10x / 1:10',def:'0.5 mg/mL'},
    {k:'v2',label:'要配多少 V₂',ph:'10 mL',def:'10 mL'}],
 run(v){
   const a=L.parseQty(v.c1), t=L.parseQty(v.v2);
   const fd=FOLD(v.c2);                        // C₂ 也可以直接写稀释倍数
   const b=fd?null:L.parseQty(v.c2);
   if(!a||!a.ok||!t||!t.ok||(!fd&&(!b||!b.ok))) return {rows:[],warn:'三个都要填，带单位（C₂ 也可写 10x / 1:10）'};
   if(fd&&!(fd>0)) return {rows:[],warn:'稀释倍数要是正数'};
   if(b&&!L.dEq(a.d,b.d)) return {rows:[],warn:'两个浓度的量纲不一样：'+L.dName(a.d)+' vs '+L.dName(b.d)};
   const fold=fd||a.base/b.base;
   if(fold<1) return {rows:[],warn:'目标比母液还浓，稀释做不到（要浓缩）'};
   const v1L=t.base/fold;                      // 基准单位 L
   const mk=x=>pretty(x,'体积');
   return {rows:[
     {k:'取母液 V₁', v:mk(v1L), hi:1},
     {k:'加稀释剂', v:mk(t.base-v1L), hi:1},
     {k:'稀释倍数', v:'1 : '+F(fold)},
     {k:'目标浓度 C₂', v:fd?(F(a.v/fold)+' '+L.disp(a.unit)):v.c2},
     {k:'终体积', v:v.v2}],
    say: fd? 'V₁ = V₂ / 倍数 = '+F(t.base)+' / '+F(fold)
           : 'V₁ = C₂V₂ / C₁ = '+F(b.base)+'×'+F(t.base)+' / '+F(a.base),
    warn: v1L/t.base<0.01?'取样量不到终体积的 1%，移液误差会被放大 —— 先做一步中间稀释':''};
 },
 trap:'"加稀释剂"是 V₂−V₁，不是 V₂。稀释 10 倍 = 1 份母液 + 9 份稀释剂。'},

{id:'serial', cat:'浓度与稀释', name:'系列稀释', en:'SERIAL DILUTION',
 gut:'每步乘同一个因子，浓度是等比数列，log 轴上等距。',
 f:[{k:'c0',label:'起始浓度',ph:'1 mM',def:'1 mM'},
    {k:'fold',label:'每步稀释倍数',ph:'10',def:'10'},
    {k:'n',label:'做几个点',ph:'8',def:'8'},
    {k:'v',label:'每管终体积',ph:'200 uL',def:'200 uL'}],
 run(v){
   const c=L.parseQty(v.c0), vol=L.parseQty(v.v);
   const f=parseFloat(v.fold)||10, n=Math.min(24,Math.max(2,parseInt(v.n)||8));
   if(!c||!c.ok||!vol||!vol.ok) return {rows:[],warn:'起始浓度和体积要带单位'};
   const take=vol.base/f, add=vol.base-take;
   const unit=c.unit, cf=c.f;
   const rows=[{k:'每步：取',v:F(take*1e6)+' μL 上一管 + '+F(add*1e6)+' μL 稀释剂',hi:1}];
   for(let i=0;i<n;i++){
     const val=c.base/Math.pow(f,i);
     rows.push({k:'#'+(i+1)+(i?'':'（母液）'), v:pretty(val,L.dName(c.d))});
   }
   return {rows, say:'跨度 '+F(Math.pow(f,n-1))+' 倍 = '+F(Math.log10(Math.pow(f,n-1)),3)+' 个数量级',
     warn: take*1e6<2?'每步取样 <2 μL，移液枪误差太大 —— 提高终体积或降低稀释倍数':''};
 },
 trap:'每步取的是"上一管"的液，不是母液。每步之间一定要吹打混匀，否则误差按倍数累乘。'},

{id:'weigh', cat:'浓度与稀释', name:'从粉末配母液', en:'WEIGH OUT',
 gut:'先算要多少 mol，再乘分子量变成克，最后除以纯度。',
 f:[{k:'c',label:'目标浓度',ph:'10 mM',def:'10 mM'},
    {k:'v',label:'配多少体积',ph:'50 mL',def:'50 mL'},
    {k:'mw',label:'分子量 MW',unit:'g/mol',ph:'342.3',def:'342.3'},
    {k:'p',label:'纯度 %',ph:'100',def:'100'}],
 run(v){
   const c=L.parseQty(v.c), vol=L.parseQty(v.v), mw=parseFloat(v.mw), p=(parseFloat(v.p)||100)/100;
   if(!c||!c.ok||!vol||!vol.ok||!mw) return {rows:[],warn:'浓度、体积、分子量都要填'};
   let molL;
   if(L.dEq(c.d,L.D(0,-1,1))) molL=c.base;                       // 已是摩尔浓度
   else if(L.dEq(c.d,L.D(1,-1))) molL=c.base/mw;                 // 质量浓度 → mol/L
   else return {rows:[],warn:'目标浓度要是摩尔浓度或质量浓度'};
   const mol=molL*vol.base, g=mol*mw, gp=g/p;
   return {rows:[
     {k:'称取', v:F(gp*1000)+' mg'+(p<1?('（已按纯度 '+(p*100)+'% 放大）'):''), hi:1},
     {k:'= 物质的量', v:F(mol*1e6)+' μmol'},
     {k:'定容到', v:v.v, hi:1},
     {k:'纯品质量', v:F(g*1000)+' mg'}],
    say:'m = c × V × MW ÷ 纯度 = '+F(molL)+' mol/L × '+F(vol.base)+' L × '+mw+' ÷ '+p,
    warn: gp*1000<1?'称量 <1 mg，天平精度撑不住 —— 先配高浓度母液再稀释':''};
 },
 trap:'水合物的 MW 要用带结晶水的那个（如 CuSO₄·5H₂O 是 249.7 不是 159.6）。定容是"加到"体积，不是"加入"体积。'},

{id:'wv', cat:'浓度与稀释', name:'%w/v · ppm · 倍数液', en:'PERCENT & FOLD',
 gut:'1% w/v = 1 g / 100 mL = 10 g/L。ppm 在稀水溶液里就是 mg/L。',
 f:[{k:'x',label:'输入',ph:'0.9 %  或 10 g/L  或 500 ppm',def:'0.9 %'},
    {k:'mw',label:'分子量（想出摩尔浓度就填）',unit:'g/mol',ph:'58.44',def:'58.44'}],
 run(v){
   const t=String(v.x||'').trim(); const m=t.match(/^([-+0-9.eE]+)\s*(%|ppm|ppb)$/);
   let gL=null, src='';
   if(m){ const x=parseFloat(m[1]);
     gL = m[2]==='%'? x*10 : m[2]==='ppm'? x*1e-3 : x*1e-6;
     src = m[2]==='%'?'1% w/v = 10 g/L':'1 ppm ≈ 1 mg/L（稀水溶液）'; }
   else { const q=L.parseQty(t); if(!q||!q.ok||!L.dEq(q.d,L.D(1,-1))) return {rows:[],warn:'填 %、ppm，或一个质量浓度如 10 g/L'};
     gL=q.base; }
   const mw=parseFloat(v.mw)||0;
   const rows=[{k:'g/L', v:F(gL)+' g/L', hi:1},
     {k:'%w/v', v:F(gL/10)+' %', hi:1},
     {k:'mg/mL', v:F(gL)+' mg/mL'},
     {k:'ppm', v:F(gL*1000)+' ppm'},
     {k:'μg/μL', v:F(gL)+' μg/μL'}];
   if(mw) rows.push({k:'摩尔浓度', v:F(gL/mw)+' M = '+F(gL/mw*1e3)+' mM = '+F(gL/mw*1e6)+' μM', hi:1});
   return {rows, say:src||'质量浓度家族一律同一个数只挪小数点'};
 },
 trap:'%v/v（体积比）和 %w/v（质量体积比）不是一回事；乙醇 70% 是 v/v。ppm→mg/L 只在密度≈1 的稀水溶液里成立。'},

{id:'count', cat:'细胞与培养', name:'血球板计数', en:'HEMOCYTOMETER',
 gut:'一个大格是 0.1 μL，所以均值 ×10⁴ 就是每毫升。',
 f:[{k:'cells',label:'四个大格总计数',ph:'320',def:'320'},
    {k:'sq',label:'数了几个大格',ph:'4',def:'4'},
    {k:'d',label:'稀释倍数',ph:'台盼蓝 1:1 填 2',def:'2'},
    {k:'dead',label:'其中死细胞数',ph:'12',def:''},
    {k:'v',label:'悬液总体积',ph:'10 mL',def:'10 mL'}],
 run(v){
   const n=parseFloat(v.cells), sq=parseFloat(v.sq)||4, d=parseFloat(v.d)||1;
   const vol=L.parseQty(v.v);
   if(!n||!sq) return {rows:[],warn:'计数和格数要填'};
   const perMl=(n/sq)*d*1e4;
   const rows=[{k:'细胞浓度', v:F(perMl)+' cells/mL = '+F(perMl/1e6)+'×10⁶/mL', hi:1}];
   if(vol&&vol.ok) rows.push({k:'总细胞数', v:F(perMl*vol.base*1000)+' cells', hi:1});
   const dead=parseFloat(v.dead);
   if(dead>=0&&!isNaN(dead)) rows.push({k:'活率', v:F((1-dead/n)*100,3)+' %', hi:1});
   rows.push({k:'每格均值', v:F(n/sq,3)+' 个'});
   return {rows, say:'一个大格 1mm×1mm×0.1mm = 10⁻⁴ mL，所以 ×10⁴',
     warn: n/sq<20?'每格 <20 个，统计误差 >20% —— 少稀释一点重数':(n/sq>200?'每格 >200 个数不准，先稀释':'')};
 },
 trap:'压线细胞只数两条边（上+左）。台盼蓝 1:1 混的稀释倍数是 2，不是 1。'},

{id:'seed', cat:'细胞与培养', name:'铺板取样', en:'SEEDING',
 gut:'先算每孔要多少个，再用浓度换成体积，剩下的补培养基。',
 f:[{k:'conc',label:'悬液浓度',ph:'1e6 cells/mL',def:'1e6 cells/mL'},
    {k:'per',label:'每孔要多少细胞',ph:'5e4',def:'5e4'},
    {k:'n',label:'铺几个孔',ph:'24',def:'24'},
    {k:'vw',label:'每孔终体积',ph:'500 uL',def:'500 uL'},
    {k:'plate',label:'板型',ph:'24 孔',def:'24 孔'}],
 run(v){
   const c=L.parseQty(v.conc), per=parseFloat(v.per), n=parseFloat(v.n)||1, vw=L.parseQty(v.vw);
   if(!c||!c.ok||!per||!vw||!vw.ok) return {rows:[],warn:'浓度、每孔细胞数、孔体积要填'};
   const perMl=c.base*1e-3;                                   // cells/L → cells/mL
   const ulPerWell=per/perMl*1000;                            // μL
   const total=n*1.1;                                          // 10% 富余
   const area=PLATE[String(v.plate||'').trim()]||0;
   const rows=[
     {k:'每孔取悬液', v:F(ulPerWell)+' μL', hi:1},
     {k:'每孔补培养基', v:F(vw.base*1e6-ulPerWell)+' μL', hi:1},
     {k:'配 mastermix（+10%）', v:F(ulPerWell*total)+' μL 悬液 + '+F((vw.base*1e6-ulPerWell)*total)+' μL 培养基', hi:1},
     {k:'总需细胞', v:F(per*n)+' cells'}];
   if(area) rows.push({k:'面密度', v:F(per/area)+' cells/cm²（'+v.plate+'，'+area+' cm²）'});
   return {rows, say:'体积 = 需要的细胞数 ÷ 悬液浓度',
     warn: ulPerWell>vw.base*1e6?'取样量已经超过孔体积 —— 悬液太稀，先离心浓缩':(ulPerWell<5?'取样 <5 μL，先稀释悬液再铺':'')};
 },
 trap:'算 mastermix 一定要留 10% 富余，否则最后一孔总是不够。面密度比"每孔多少个"更能跨板型复现。'},

{id:'ratio', cat:'细胞与培养', name:'比例族 E:T · bead:cell · MOI', en:'RATIOS',
 gut:'所有比例都是"每个靶细胞配几个"。先定靶细胞数，再乘比例。',
 f:[{k:'target',label:'靶/被作用细胞数',ph:'1e5',def:'1e5'},
    {k:'r',label:'比例 效应:靶',ph:'10 表示 10:1',def:'10'},
    {k:'src',label:'效应物储液浓度',ph:'2e6 cells/mL',def:'2e6 cells/mL'}],
 run(v){
   const t=parseFloat(v.target), r=parseFloat(v.r);
   const c=L.parseQty(v.src);
   if(!t||!r) return {rows:[],warn:'靶细胞数和比例要填'};
   const need=t*r;
   const rows=[{k:'需要效应物', v:F(need)+' 个（'+r+':1）', hi:1}];
   if(c&&c.ok){ const perMl=c.base*1e-3; rows.push({k:'取储液', v:F(need/perMl*1000)+' μL', hi:1}); }
   rows.push({k:'反过来 1:1', v:F(t)+' 个'});
   rows.push({k:'常见档', v:[20,10,5,2,1,0.5].map(x=>x+':1 → '+F(t*x)).join('　')});
   return {rows, say:'E:T、bead:cell、MOI（病毒 pfu/细胞）是同一个算式，只是效应物换了身份',
     note:'bead:cell 的效果强烈依赖铺板密度（confluency），换了密度必须重新优化，不能沿用旧比例'};
 },
 trap:'MOI 用的是"感染性颗粒数"（TU/pfu），不是总颗粒数；两者常差 100 倍以上。'},

{id:'spin', cat:'仪器与物理', name:'离心 rpm ↔ g', en:'RCF',
 gut:'g 力只和半径与转速平方有关：RCF = 1.118×10⁻⁵ × r(mm) × rpm²。',
 f:[{k:'mode',label:'已知量',ph:'300 g 或 1500 rpm',def:'300 g'},
    {k:'r',label:'转子半径',unit:'mm',ph:'150',def:'150'}],
 run(v){
   const r=parseFloat(v.r); const t=String(v.mode||'').trim();
   if(!r) return {rows:[],warn:'要填转子半径（离心机说明书上的 rmax）'};
   const m=t.match(/^([-+0-9.eE]+)\s*(rpm|g|xg|×g)?$/i);
   if(!m) return {rows:[],warn:'填成 300 g 或 1500 rpm'};
   const x=parseFloat(m[1]), isRpm=/rpm/i.test(m[2]||'');
   const K=1.118e-5;
   if(isRpm){ const g=K*r*x*x; return {rows:[{k:'相对离心力',v:F(g)+' × g',hi:1},{k:'转速',v:F(x)+' rpm'}],
     say:'RCF = 1.118×10⁻⁵ × '+r+' mm × '+F(x)+'² '};}
   const rpm=Math.sqrt(x/(K*r));
   return {rows:[{k:'设定转速', v:F(rpm)+' rpm', hi:1},{k:'相对离心力', v:F(x)+' × g'},
     {k:'常用对照', v:[200,300,500,1000,2000].map(g=>g+'g → '+F(Math.sqrt(g/(K*r)),3)+'rpm').join('　')}],
    say:'rpm = √(RCF / (1.118×10⁻⁵ × r))',
    warn:'论文里永远写 ×g，不写 rpm —— rpm 换台机器就不是同一个力'};
 },
 trap:'r 用 rmax 还是 rav 会差 10–20%，比较实验要固定同一台机器同一个转子。'},

{id:'absorb', cat:'仪器与物理', name:'吸光度定量', en:'BEER-LAMBERT',
 gut:'A = ε·c·l。吸光度是浓度的线性刻度，前提是 A 落在 0.1–1。',
 f:[{k:'a',label:'吸光度 A',ph:'0.42',def:'0.42'},
    {k:'eps',label:'消光系数 ε',unit:'M⁻¹cm⁻¹',ph:'ExPASy 能算',def:'43824'},
    {k:'mw',label:'分子量',unit:'g/mol',ph:'66500',def:'66500'},
    {k:'l',label:'光程',unit:'cm',ph:'1',def:'1'},
    {k:'df',label:'读数前稀释倍数',ph:'1',def:'1'}],
 run(v){
   const a=parseFloat(v.a), eps=parseFloat(v.eps), mw=parseFloat(v.mw), l=parseFloat(v.l)||1, df=parseFloat(v.df)||1;
   if(!a||!eps) return {rows:[],warn:'吸光度和 ε 要填'};
   const M=a/(eps*l)*df;
   const rows=[{k:'摩尔浓度', v:F(M)+' M = '+F(M*1e6)+' μM', hi:1}];
   if(mw) rows.push({k:'质量浓度', v:F(M*mw)+' g/L = '+F(M*mw)+' mg/mL', hi:1});
   rows.push({k:'原液（已乘稀释 '+df+'×）', v:F(M*1e6)+' μM'});
   rows.push({k:'OD600 粗算', v:'OD600 1.0 ≈ 8×10⁸ E.coli/mL（仪器不同要自己标定）'});
   return {rows, say:'c = A / (ε·l) × 稀释倍数',
     warn: a>1.2?'A>1.2 超出线性区，稀释后重读':(a<0.05?'A<0.05 信噪比太差，浓缩或加大光程':'')};
 },
 trap:'NanoDrop 的光程不是 1 cm（常是 0.1 或 1 mm），它已内部折算，别再乘一遍。A280 受核酸污染抬高，看 A260/A280。'},

{id:'nucleic', cat:'分子与结合', name:'核酸 ng ↔ pmol ↔ 拷贝', en:'NUCLEIC ACID',
 gut:'dsDNA 每个碱基对约 650 g/mol。质量除以长度换算出的 MW，就得到 mol。',
 f:[{k:'c',label:'浓度',ph:'50 ng/uL',def:'50 ng/uL'},
    {k:'bp',label:'长度',unit:'bp',ph:'ssDNA/RNA 填 nt 数',def:'1000'},
    {k:'type',label:'类型',ph:'dsDNA',def:'dsDNA'},
    {k:'v',label:'体积（算总量用）',ph:'20 uL',def:'20 uL'}],
 run(v){
   const c=L.parseQty(v.c), bp=parseFloat(v.bp), vol=L.parseQty(v.v);
   const per={dsDNA:650,ssDNA:330,RNA:340}[String(v.type||'dsDNA').trim()]||650;
   if(!c||!c.ok||!bp) return {rows:[],warn:'浓度和长度要填'};
   const mw=bp*per;
   const molL=c.base/mw;
   const rows=[
     {k:'摩尔浓度', v:F(molL*1e9)+' nM', hi:1},
     {k:'分子量', v:F(mw)+' g/mol（'+bp+' × '+per+'）'},
     {k:'拷贝数浓度', v:F(molL*L.NA*1e-3)+' copies/mL'}];
   if(vol&&vol.ok){
     const mol=molL*vol.base;
     rows.push({k:'总量', v:F(c.base*vol.base*1e9)+' ng = '+F(mol*1e12)+' pmol', hi:1});
     rows.push({k:'总拷贝数', v:F(mol*L.NA)+' copies', hi:1});
   }
   return {rows, say:'mol = 质量 / (长度 × 每碱基 '+per+' g/mol)'};
 },
 trap:'引物按 nt 用 330，别用 650。合成引物管上的 nmol 是物质的量，OD 是吸光度，两者不能混。'},

{id:'particle', cat:'分子与结合', name:'纳米颗粒 · 粒子数与包被', en:'NANOPARTICLE',
 gut:'先由粒径算单颗粒体积×密度得单颗粒质量，质量浓度除以它就是粒子数浓度。',
 f:[{k:'d',label:'粒径（直径）',unit:'nm',ph:'100',def:'100'},
    {k:'rho',label:'材料密度',unit:'g/cm³',ph:'PLGA 1.34　PS 1.05　Fe₃O₄ 5.2',def:'1.05'},
    {k:'c',label:'质量浓度',ph:'1 mg/mL',def:'1 mg/mL'},
    {k:'pc',label:'包被蛋白浓度',ph:'20 ug/mL',def:''},
    {k:'pmw',label:'蛋白分子量',unit:'g/mol',ph:'150000',def:'150000'}],
 run(v){
   const d=parseFloat(v.d), rho=parseFloat(v.rho), c=L.parseQty(v.c);
   if(!d||!rho||!c||!c.ok) return {rows:[],warn:'粒径、密度、质量浓度要填'};
   const r=d/2*1e-7;                                  // cm
   const volCm3=4/3*Math.PI*r*r*r;
   const mPart=volCm3*rho;                            // g/particle
   const gPerMl=c.base*1e-3;                          // g/L → g/mL
   const nPerMl=gPerMl/mPart;
   const saPart=4*Math.PI*r*r;                        // cm²
   const rows=[
     {k:'粒子数浓度', v:F(nPerMl)+' particles/mL', hi:1},
     {k:'单颗粒质量', v:F(mPart*1e15)+' fg'},
     {k:'单颗粒表面积', v:F(saPart*1e14)+' nm²'},
     {k:'每毫升总表面积', v:F(saPart*nPerMl)+' cm²/mL', hi:1},
     {k:'等效"摩尔"浓度', v:F(nPerMl*1000/L.NA*1e9)+' nM（把颗粒当分子）'}];
   const pc=L.parseQty(v.pc||''), pmw=parseFloat(v.pmw);
   if(pc&&pc.ok&&pmw){
     const protPerMl=pc.base*1e-3/pmw*L.NA;           // 分子数/mL
     rows.push({k:'每颗粒蛋白数', v:F(protPerMl/nPerMl)+' 个/颗粒', hi:1});
     rows.push({k:'表面密度', v:F(protPerMl/nPerMl/(saPart*1e14))+' 个/nm²'});
     rows.push({k:'蛋白:颗粒 质量比', v:F(pc.base/c.base*1000)+' μg 蛋白 / mg 颗粒'});
   }
   return {rows, say:'m = (4/3)πr³ρ，粒子数 = 质量浓度 / m。半径三次方 —— 粒径差 2 倍，粒子数差 8 倍',
     note:'粒径用数均还是体均差别巨大（多分散时可差几倍），报数据要写清是 DLS 的哪个'};
 },
 trap:'DLS 给的是流体力学直径，比干态 TEM 直径大。算粒子数用 TEM/NTA，别直接用 DLS 的 Z-average。'},

{id:'kd', cat:'分子与结合', name:'Kd 与占位率', en:'BINDING',
 gut:'配体浓度等于 Kd 时，正好占一半。占位率 = [L]/([L]+Kd)。',
 f:[{k:'l',label:'游离配体浓度 [L]',ph:'10 nM',def:'10 nM'},
    {k:'kd',label:'Kd',ph:'5 nM',def:'5 nM'},
    {k:'rt',label:'受体总量',ph:'选填，算绝对结合数',def:''}],
 run(v){
   const l=L.parseQty(v.l), kd=L.parseQty(v.kd);
   if(!l||!l.ok||!kd||!kd.ok) return {rows:[],warn:'[L] 和 Kd 都要带单位'};
   if(!L.dEq(l.d,kd.d)) return {rows:[],warn:'两个量纲不一样'};
   const occ=l.base/(l.base+kd.base);
   const rows=[
     {k:'占位率', v:F(occ*100,3)+' %', hi:1},
     {k:'[L]/Kd', v:F(l.base/kd.base)},
     {k:'要占到 90% 需要', v:F(kd.base*9/kd.f)+' '+kd.unit, hi:1},
     {k:'要占到 99% 需要', v:F(kd.base*99/kd.f)+' '+kd.unit},
     {k:'占 50%', v:F(kd.base/kd.f)+' '+kd.unit+'（就是 Kd 本身）'}];
   const rt=parseFloat(v.rt);
   if(rt) rows.push({k:'结合上的受体数', v:F(rt*occ)+' / '+F(rt), hi:1});
   return {rows, say:'θ = [L]/([L]+Kd)。从 10% 到 90% 需要浓度跨 81 倍 —— 剂量反应曲线的宽度是定死的',
     note:'这条公式要求 [L] 是游离浓度；受体多、配体少时会耗尽配体，必须用二次方程解'};
 },
 trap:'aAPC 这类多价结合看的是 avidity 不是 affinity：表观 Kd 可以比单价低几个数量级，别直接套单价 Kd。'},

{id:'dose', cat:'给药与统计', name:'动物给药', en:'DOSING',
 gut:'剂量 mg/kg × 体重 kg = 需要的毫克数，再除以母液浓度得到体积。',
 f:[{k:'dose',label:'剂量',unit:'mg/kg',ph:'5',def:'5'},
    {k:'bw',label:'体重',ph:'22 g',def:'22 g'},
    {k:'c',label:'母液浓度',ph:'2 mg/mL',def:'2 mg/mL'},
    {k:'n',label:'几只',ph:'8',def:'8'}],
 run(v){
   const dose=parseFloat(v.dose), bw=L.parseQty(v.bw), c=L.parseQty(v.c), n=parseFloat(v.n)||1;
   if(!dose||!bw||!bw.ok||!c||!c.ok) return {rows:[],warn:'剂量、体重、母液浓度要填'};
   const kg=bw.base/1000;                              // g → kg
   const mg=dose*kg;
   const mlPerMouse=mg/(c.base);                       // c.base 单位 g/L = mg/mL
   const rows=[
     {k:'每只注射', v:F(mlPerMouse*1000)+' μL', hi:1},
     {k:'每只药量', v:F(mg*1000)+' μg'},
     {k:'一共要配（+10%）', v:F(mlPerMouse*n*1.1*1000)+' μL', hi:1},
     {k:'总药量', v:F(mg*n*1.1)+' mg'}];
   return {rows, say:'体积 = 剂量 × 体重 ÷ 浓度',
     warn: mlPerMouse>0.2?'小鼠 i.v. 单次一般 ≤200 μL，i.p. ≤500 μL —— 提高母液浓度':''};
 },
 trap:'跨物种换算剂量要用体表面积（HED），不能直接按体重线性缩放。'},

{id:'stat', cat:'给药与统计', name:'均值 · SD · SEM · CV', en:'STATS',
 gut:'SD 描述数据有多散，SEM 描述均值有多准，SEM = SD/√n。',
 f:[{k:'data',label:'一组数',ph:'12.1 11.8 12.6 12.0 11.5',def:'12.1 11.8 12.6 12.0 11.5',wide:1}],
 run(v){
   const xs=String(v.data||'').split(/[\s,，]+/).map(parseFloat).filter(x=>!isNaN(x));
   if(xs.length<2) return {rows:[],warn:'至少两个数'};
   const n=xs.length, m=xs.reduce((a,b)=>a+b,0)/n;
   const sd=Math.sqrt(xs.reduce((a,b)=>a+(b-m)*(b-m),0)/(n-1));
   const sem=sd/Math.sqrt(n);
   const sorted=xs.slice().sort((a,b)=>a-b);
   const med=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
   return {rows:[
     {k:'n', v:String(n)},
     {k:'均值', v:F(m,5), hi:1},
     {k:'SD', v:F(sd,4), hi:1},
     {k:'SEM', v:F(sem,4), hi:1},
     {k:'CV', v:F(sd/m*100,3)+' %'},
     {k:'95% CI（近似）', v:F(m-1.96*sem,5)+' ~ '+F(m+1.96*sem,5)},
     {k:'中位数', v:F(med,5)},
     {k:'极差', v:F(sorted[0],4)+' ~ '+F(sorted[n-1],4)}],
    say:'SD 用 n−1（样本标准差）。SEM = SD/√n，所以样本量翻 4 倍误差棒才减半',
    warn: n<3?'n<3 时 SD 基本没有意义':(sd/m>0.3?'CV >30%，技术重复太散，先查移液和混匀':'')};
 },
 trap:'画图写 ±SEM 会让数据看起来比实际整齐；描述数据的离散要用 SD，比较均值才用 SEM。'}
];
root.CALCS=CALCS; root.PLATE=PLATE; root.pretty=pretty;
})(typeof window!=='undefined'?window:globalThis);
