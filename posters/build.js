// node build.js → 三张横屏海报 html,再用 Chrome 截成 png
const fs = require('fs'), path = require('path');
global.window = {};
require('../writing-data.js'); require('../speak-data.js');
const W = window.W, S = window.S;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const slot = s => esc(s).replace(/\[([^\]]+)\]/g, '<em>[$1]</em>');

const CSS = `
*{box-sizing:border-box}
body{margin:0;width:3200px;background:#06091a;color:#e8eef4;font-family:-apple-system,"PingFang SC","Helvetica Neue",sans-serif;font-size:19px;line-height:1.45}
.pg{padding:40px 48px 48px;min-height:1800px}
h1{margin:0 0 6px;font-size:44px;letter-spacing:6px;font-weight:600}
.sub{color:#8b94b0;font-size:20px;margin-bottom:26px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.cols3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px}
h2{font-size:26px;color:#e9c46a;margin:0 0 12px;padding-bottom:6px;border-bottom:2px solid rgba(233,196,106,.35)}
h3{font-size:20px;color:#8fb8ff;margin:18px 0 8px}
.box{border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:12px 16px;margin-bottom:12px;background:rgba(255,255,255,.03)}
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
.rule{color:#ffb3b3;font-size:17px;line-height:1.6}
.two{columns:2;column-gap:28px}
.day{position:absolute;right:48px;top:40px;font-size:22px;color:#e9c46a;border:1px solid rgba(233,196,106,.5);border-radius:999px;padding:8px 22px}
`;
const wrap = (title, sub, day, body) => `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body><div class="pg" style="position:relative"><div class="day">${day}</div><h1>${title}</h1><div class="sub">${sub}</div>${body}</div></body></html>`;

// ---------- 海报 1 写作 ----------
const sentBox = (arr, ids) => ids.map(id => { const s = arr.find(x => x[0] === id); return s ? `<div class="box"><span class="k">${s[0]} ${esc(s[1])}</span>${slot(s[2])}<div class="cn">${esc(s[3])}</div></div>` : ''; }).join('');
let p1 = `<div class="cols3">
<div>
 <h2>大作文 · 结构(6 种题型)</h2>
 ${W.T2_TYPES.map(t => `<div class="box"><span class="k">${t[0]} ${esc(t[1])}</span><span class="cn">${esc(t[2])}</span>
 <div class="recipe" style="margin-top:6px">${W.T2_RECIPE[t[0]].map(r => `<span>${esc(r[0])}</span><span>${esc(r[1])}</span>`).join('')}</div>
 <div class="cn" style="margin-top:4px">正文1:${esc(t[4])} · 正文2:${esc(t[5])}</div></div>`).join('')}
 <h2 style="margin-top:24px">小作文 · 结构</h2>
 ${W.T1_RECIPE.map(r => `<div class="box"><span class="k">${esc(r[0])}</span><div class="recipe" style="margin-top:6px">${r[1].map(x => `<span>${esc(x[0])}</span><span>${esc(x[1])}</span>`).join('')}</div></div>`).join('')}
 <h2 style="margin-top:24px">小作文 · 词</h2>
 ${W.T1_WORDS.map(w => `<div class="box"><span class="k">${esc(w[0])}</span>${esc(w[1])}</div>`).join('')}
 <h2 style="margin-top:24px">7.5 规矩</h2>
 ${W.RULES_75.map(r => `<div class="rule">· ${esc(r)}</div>`).join('')}
 <h2 style="margin-top:24px">万能例子</h2>
 ${W.T2_EXAMPLES.map(e => `<div class="box"><span class="k">${esc(e[0])}</span><span class="cn">${esc(e[1])}</span></div>`).join('')}
</div>
<div>
 <h2>大作文 · 25 句</h2>
 ${W.T2_GROUPS.map(g => `<h3>${esc(g[0])} <span class="cn">${esc(g[1])}</span></h3>` + sentBox(W.T2_SENT, g[2])).join('')}
</div>
<div>
 <h2>小作文 · 23 句</h2>
 <div>${W.T1_GROUPS.map(g => `<h3 style="margin-top:6px">${esc(g[0])} <span class="cn">${esc(g[1])}</span></h3>` + sentBox(W.T1_SENT, g[2])).join('')}</div>
<h2 style="margin-top:24px">想不出理由时 · 6 维度 × 5 句</h2>
 <div>${W.T2_CHUNKS.map(c => `<div class="box" style="break-inside:avoid"><span class="k">${esc(c[0])}</span>${c[1].map(x => `<div style="margin-top:5px">· ${slot(x)}</div>`).join('')}</div>`).join('')}</div>
</div>
</div>`;

// ---------- 海报 2 口语 ----------
const names = { 1: '导师', 2: '合伙人', 3: '巴尔的摩', 4: '相机与抖音' };
let p2 = `<div class="cols">
<div>
 <h2>4 个故事 · 换第一句和主角,中间不动</h2>
 ${S.stories.map(s => `<div class="story"><h3>${s.id} · ${esc(s.name)}</h3><div class="who">${esc(s.who)} · Part 2 第 ${S.p2.filter(r => r[2] == s.id).map(r => r[0]).join(' ')} 题</div>
 ${s.lines.map(l => `<div class="ln"><i>${esc(l[0])}</i><span>${esc(l[1])}</span></div>`).join('')}
 <div class="sw">${s.swap.map(x => '· ' + esc(x)).join('<br>')}</div></div>`).join('')}
</div>
<div>
 <h2>12 块 · 每块 3 句顺着背</h2>
 <div class="cn" style="margin-bottom:10px">任何题 = 直答 1 句 + 2 块 + 1 个真细节。Part 2 = 开场 + 块 + 故事 + 块 + Having said that + 虚拟语气收尾。</div>
 ${S.blocks.map(b => `<div class="box"><span class="k">${esc(b[0])}</span>${esc(b[1])}</div>`).join('')}
 <h2 style="margin-top:24px">粘合句</h2>
 <div class="two">${S.glue.map(g => `<div class="box" style="break-inside:avoid"><span class="k">${esc(g[0])}</span>${slot(g[1])}</div>`).join('')}</div>
 <h2 style="margin-top:24px">Part 3 · 四句</h2>
 <div class="box">表态 → For one thing / For another → Back in the day, these days → That said, strike a balance。政府题用 H,科技题用 G,人物题用 F + A。</div>
 <h2 style="margin-top:24px">7.5-8</h2>
 <div class="rule">· 模板 50%,真实细节 50%:Baltimore、my PI、2 a.m. in the lab<br>· 每题一句 Having said that<br>· 大词每题最多 2 个,其余说人话<br>· 收尾用虚拟语气</div>
</div>
</div>`;

// ---------- 海报 3 题目 ----------
const cats = [...new Set(W.T2_MAP.map(r => r[0]))];
let p3 = `<div class="cols">
<div>
 <h2>写作 · 65 题 → 题型 + 两段理由</h2>
 <div class="two">${cats.map(c => `<h3 style="margin-top:6px;break-after:avoid">${esc(c)}</h3><table style="break-inside:avoid">${W.T2_MAP.filter(r => r[0] === c).map(r => `<tr><td class="n">${r[1]}</td><td>${esc(r[2])}<div class="cn">${esc(r[5])} / ${esc(r[6])}</div></td><td class="t">${r[3]}</td><td class="b">${esc(r[4])}</td></tr>`).join('')}</table>`).join('')}</div>
</div>
<div>
 <h2>口语 · 题 → 故事 + 块</h2>
 <div class="cols" style="gap:24px">
 ${[1, 2, 3, 4].map(k => `<div><h3 style="margin-top:6px">故事 ${k} · ${names[k]}</h3>
 <table>${S.p2.filter(r => r[2] == k).map(r => `<tr><td class="n">P2 ${r[0]}</td><td>${esc(r[1])}</td><td class="b">${r[3]}</td></tr>`).join('')}
 ${S.p1.filter(r => r[1] == k).map(r => `<tr><td class="n">P1</td><td>${esc(r[0])}<div class="cn">${esc(r[3])}</div></td><td class="b">${r[2]}</td></tr>`).join('')}</table></div>`).join('')}
 </div>
 <h3 style="margin-top:18px">Part 3 路由</h3>
 <div class="box">government / society → H · technology / future → G · why people like → E C · old vs young → G D · qualities of a good X → F A · 公司 / 商业 → 故事 2 MAITONG</div>
</div>
</div>`;

const out = path.join(__dirname);
fs.writeFileSync(path.join(out, '1_写作.html'), wrap('Day 1 · 写作', '左:结构 · 右:句子。方括号填题目自己的词', '第 1 天', p1));
fs.writeFileSync(path.join(out, '2_口语.html'), wrap('Day 2 · 口语', '左:4 个故事 · 右:12 块 + 粘合句', '第 2 天', p2));
fs.writeFileSync(path.join(out, '3_过题目.html'), wrap('Day 3 · 过题目', '左:写作 65 题 · 右:口语 34 + 37 题', '第 3 天', p3));
console.log('ok');

// ---------- 合一:左写作 右口语,下面过题目 ----------
const all = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>雅思冲刺</title><style>${CSS}
body{width:4800px}
.half{display:grid;grid-template-columns:1fr 1fr;gap:56px}
.half>div{border-top:4px solid #e9c46a;padding-top:14px}
.half h1{font-size:40px}
</style></head><body><div class="pg">
<h1>雅思 7.5-8 · 写作 + 口语</h1><div class="sub">左:写作 · 右:口语 · 下:过题目。方括号填题目自己的词</div>
<div class="half"><div><h1>写作</h1>${p1}</div><div><h1>口语</h1>${p2}</div></div>
<div class="half" style="margin-top:48px"><div><h1>写作 · 过题目</h1>${p3.match(/<div class="cols">\s*<div>([\s\S]*?)<\/div>\s*<div>\s*<h2>口语/)[1]}</div><div><h1>口语 · 过题目</h1>${p3.slice(p3.indexOf('<h2>口语'))}</div></div>
</div></body></html>`;
fs.writeFileSync(path.join(out, '0_合一.html'), all.replace('</div></div>\n</div></body>', '</div></div>\n</div></body>'));
