// node build.js → 三张「左写作 右口语」海报 html,再用 Chrome 截成 png
const fs = require('fs'), path = require('path');
global.window = {};
require('../writing-data.js'); require('../speak-data.js');
const W = window.W, S = window.S;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const slot = s => esc(s).replace(/\[([^\]]+)\]/g, '<em>[$1]</em>');

const CSS = `
*{box-sizing:border-box}
body{margin:0;width:4000px;background:#06091a;color:#e8eef4;font-family:-apple-system,"PingFang SC","Helvetica Neue",sans-serif;font-size:19px;line-height:1.45}
.pg{padding:40px 48px 48px;position:relative}
h1{margin:0 0 6px;font-size:44px;letter-spacing:6px;font-weight:600}
.sub{color:#8b94b0;font-size:20px;margin-bottom:26px}
.half{display:grid;grid-template-columns:1fr 1fr;gap:56px}
.half>div{border-top:4px solid #e9c46a;padding-top:14px}
.half>div>h1{font-size:36px;margin-bottom:16px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:32px}
h2{font-size:26px;color:#e9c46a;margin:0 0 12px;padding-bottom:6px;border-bottom:2px solid rgba(233,196,106,.35)}
h3{font-size:20px;color:#8fb8ff;margin:18px 0 8px}
.box{border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:12px 16px;margin-bottom:12px;background:rgba(255,255,255,.03);break-inside:avoid}
.k{color:#e9c46a;font-weight:600;margin-right:8px;font-size:17px}
em{font-style:normal;color:#8fb8ff}
.cn{color:#8b94b0;font-size:16px}
table{border-collapse:collapse;width:100%}
td{padding:5px 8px;border-bottom:1px solid rgba(255,255,255,.1);vertical-align:top}
td.n{color:#8b94b0;width:60px;white-space:nowrap}
td.t{color:#e9c46a;font-weight:600;white-space:nowrap}
td.b{color:#8fb8ff;white-space:nowrap}
.story{border:1px solid rgba(233,196,106,.4);border-radius:16px;padding:16px 18px;margin-bottom:16px;background:rgba(233,196,106,.04)}
.story h3{margin:0 0 4px;color:#e9c46a;font-size:24px}
.story .who{color:#8b94b0;font-size:16px;margin-bottom:10px}
.ln{display:grid;grid-template-columns:48px 1fr;gap:6px 10px;margin-bottom:6px;font-size:19px}
.ln i{font-style:normal;color:#e9c46a;font-size:14px;padding-top:4px}
.sw{color:#b9c2d6;font-size:16px;margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,.2);line-height:1.6}
.recipe{display:grid;grid-template-columns:120px 1fr;gap:4px 10px;font-size:18px}
.recipe span:nth-child(odd){color:#8fb8ff}
.st{font-size:16px;line-height:1.45;margin:2px 0 6px}
.st b{display:block;color:#e9c46a;font-weight:600;font-size:14px}
.rule{color:#ffb3b3;font-size:17px;line-height:1.6}
.two{columns:2;column-gap:28px}
.day{position:absolute;right:48px;top:40px;font-size:22px;color:#e9c46a;border:1px solid rgba(233,196,106,.5);border-radius:999px;padding:8px 22px}
.mt{margin-top:24px}
`;
const page = (title, sub, day, left, right) => `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body><div class="pg"><div class="day">${day}</div><h1>${title}</h1><div class="sub">${sub}</div>
<div class="half"><div><h1>写作</h1>${left}</div><div><h1>口语</h1>${right}</div></div></div></body></html>`;

const sentBox = (arr, ids) => ids.map(id => { const s = arr.find(x => x[0] === id); return s ? `<div class="box"><span class="k">${s[0]} ${esc(s[1])}</span>${slot(s[2])}<div class="cn">${esc(s[3])}</div></div>` : ''; }).join('');
const names = { 1: '导师', 2: '合伙人', 3: '巴尔的摩', 4: '相机与抖音' };


const ALL = [...W.T2_SENT, ...W.T1_SENT];
const expand = chain => chain.split('→').map(x => x.trim()).map(x => {
  const id = x.split(' ')[0]; const s = ALL.find(y => y[0] === id);
  return s ? `<div class="st"><b>${esc(x)} · ${esc(s[1])}</b>${slot(s[2])}</div>` : `<div class="st"><b>${esc(x)}</b></div>`;
}).join('');

// ===== 写作片段 =====
const W_struct = `<div class="cols"><div>
 <h2>大作文 · 结构(6 种题型)</h2>
 ${W.T2_TYPES.map(t => `<div class="box"><span class="k">${t[0]} ${esc(t[1])}</span><span class="cn">${esc(t[2])}</span>
 <div class="recipe" style="margin-top:6px">${W.T2_RECIPE[t[0]].map(r => `<span>${esc(r[0])}</span><span>${expand(r[1])}</span>`).join('')}</div>
 <div class="cn" style="margin-top:4px">正文1:${esc(t[4])} · 正文2:${esc(t[5])}</div></div>`).join('')}
 <h2 class="mt">7.5 规矩</h2>${W.RULES_75.map(r => `<div class="rule">· ${esc(r)}</div>`).join('')}
</div><div>
 <h2>小作文 · 结构</h2>
 ${W.T1_RECIPE.map(r => `<div class="box"><span class="k">${esc(r[0])}</span><div class="recipe" style="margin-top:6px">${r[1].map(x => `<span>${esc(x[0])}</span><span>${expand(x[1])}</span>`).join('')}</div></div>`).join('')}
 <h2 class="mt">小作文 · 词</h2>${W.T1_WORDS.map(w => `<div class="box"><span class="k">${esc(w[0])}</span>${esc(w[1])}</div>`).join('')}
 <h2 class="mt">万能例子</h2>${W.T2_EXAMPLES.map(e => `<div class="box"><span class="k">${esc(e[0])}</span><span class="cn">${esc(e[1])}</span></div>`).join('')}
</div></div>`;

const W_sent = `<div class="cols"><div>
 <h2>大作文 · 25 句</h2>
 ${W.T2_GROUPS.map(g => `<h3>${esc(g[0])} <span class="cn">${esc(g[1])}</span></h3>` + sentBox(W.T2_SENT, g[2])).join('')}
</div><div>
 <h2>小作文 · 23 句</h2>
 ${W.T1_GROUPS.map(g => `<h3>${esc(g[0])} <span class="cn">${esc(g[1])}</span></h3>` + sentBox(W.T1_SENT, g[2])).join('')}
</div></div>`;
const chunks = (a,b) => `<h2 class="mt">想不出理由时 · ${W.T2_CHUNKS.slice(a,b).map(c=>c[0].split(' ')[0]).join(' + ')}(6 维度之 ${a+1}-${b})</h2>
<div class="cols">${W.T2_CHUNKS.slice(a,b).map(c => `<div class="box"><span class="k">${esc(c[0])}</span>${c[1].map(x => `<div style="margin-top:5px">· ${slot(x)}</div>`).join('')}</div>`).join('')}</div>`;

const cats = [...new Set(W.T2_MAP.map(r => r[0]))];
const W_map = `<h2 class="mt">65 题 → 题型 + 两段理由</h2>
<div class="two">${cats.map(c => `<h3 style="margin-top:6px;break-after:avoid">${esc(c)}</h3><table style="break-inside:avoid">${W.T2_MAP.filter(r => r[0] === c).map(r => `<tr><td class="n">${r[1]}</td><td>${esc(r[2])}<div class="cn">${esc(r[5])} / ${esc(r[6])}</div></td><td class="t">${r[3]}</td><td class="b">${esc(r[4])}</td></tr>`).join('')}</table>`).join('')}</div>`;

// ===== 口语片段 =====
const S_story = `<h2>4 个故事 · 换第一句和主角,中间不动</h2>
<div class="cols">${S.stories.map(s => `<div class="story"><h3>${s.id} · ${esc(s.name)}</h3><div class="who">${esc(s.who)} · Part 2 第 ${S.p2.filter(r => r[2] == s.id).map(r => r[0]).join(' ')} 题</div>
 ${s.lines.map(l => `<div class="ln"><i>${esc(l[0])}</i><span>${esc(l[1])}</span></div>`).join('')}
 <div class="sw">${s.swap.map(x => '· ' + esc(x)).join('<br>')}</div></div>`).join('')}</div>
<h2 class="mt">7.5-8</h2>
<div class="rule">· 模板 50%,真实细节 50%:Baltimore、my PI、2 a.m. in the lab · 每题一句 Having said that · 大词每题最多 2 个 · 收尾用虚拟语气</div>`;

const S_block = `<div class="cols"><div>
 <h2>12 块 · 每块 3 句顺着背</h2>
 <div class="cn" style="margin-bottom:10px">任何题 = 直答 1 句 + 2 块 + 1 个真细节。Part 2 = 开场 + 块 + 故事 + 块 + Having said that + 虚拟语气收尾。</div>
 ${S.blocks.map(b => `<div class="box"><span class="k">${esc(b[0])}</span>${esc(b[1])}</div>`).join('')}
</div><div>
 <h2>粘合句</h2>
 ${S.glue.map(g => `<div class="box"><span class="k">${esc(g[0])}</span>${slot(g[1])}</div>`).join('')}
</div></div>`;
const S_p3 = `<h2>Part 3 · 四句</h2>
 <div class="box">表态 → For one thing / For another → Back in the day, these days → That said, strike a balance。政府题用 H,科技题用 G,人物题用 F + A。</div>
 <h2 class="mt">Part 3 路由</h2>
 <div class="box">government / society → H · technology / future → G · why people like → E C · old vs young → G D · qualities of a good X → F A · 公司 / 商业 → 故事 2 MAITONG</div>`;

const S_map = `<h2 class="mt">题 → 故事 + 块</h2>
<div class="cols">${[1, 2, 3, 4].map(k => `<div><h3 style="margin-top:6px">故事 ${k} · ${names[k]}</h3>
 <table>${S.p2.filter(r => r[2] == k).map(r => `<tr><td class="n">P2 ${r[0]}</td><td>${esc(r[1])}</td><td class="b">${r[3]}</td></tr>`).join('')}
 ${S.p1.filter(r => r[1] == k).map(r => `<tr><td class="n">P1</td><td>${esc(r[0])}<div class="cn">${esc(r[3])}</div></td><td class="b">${r[2]}</td></tr>`).join('')}</table></div>`).join('')}</div>`;

const out = __dirname;
fs.writeFileSync(path.join(out, '1_结构与故事.html'), page('Day 1 · 结构 + 故事', '左:写作结构 + 理由(钱 时) · 右:4 个口语故事', '第 1 天', W_struct + chunks(0,2), S_story));
fs.writeFileSync(path.join(out, '2_句子与块.html'), page('Day 2 · 句子 + 块', '左:写作 48 句 + 理由(健 能) · 右:口语 12 块 + 粘合句。方括号填题目自己的词', '第 2 天', W_sent + chunks(2,4), S_block));
fs.writeFileSync(path.join(out, '3_过题目.html'), page('Day 3 · 理由 + 过题目', '左:写作 65 题 + 理由 · 右:Part 3 + 口语 71 题', '第 3 天', W_map + chunks(4,6), S_p3 + S_map));
console.log('ok');
