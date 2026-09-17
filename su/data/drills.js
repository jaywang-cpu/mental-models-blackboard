// 数理宇宙 · 秒答生成器（CONTRACT.md 第 5 节固定清单，共 67 个）
// 每个 GEN.xxx() 返回 {q, a, how}；答案全部由代码算出。
window.GEN = window.GEN || {};
(function () {
  const G = window.GEN;
  // ---------- 工具 ----------
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => { const c = arr.slice(); for (let i = c.length - 1; i > 0; i--) { const j = ri(0, i);[c[i], c[j]] = [c[j], c[i]]; } return c; };
  const r3 = (x) => (Math.round(x * 1000) / 1000).toString();
  const r2 = (x) => (Math.round(x * 100) / 100).toString();
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
  const frac = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}`; };
  const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
  const C = (n, k) => { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  const P = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= (n - i); return r; };
  const vec = (v) => `(${v.join(', ')})`;
  const mat = (m) => '[' + m.map(r => '[' + r.join(', ') + ']').join(', ') + ']';
  const sgn = (x) => (x < 0 ? '-' : '+');
  // 多项式：coeffs 从最高次到常数
  const fmtPoly = (co, v = 'x') => {
    const n = co.length - 1; let s = '';
    co.forEach((c, i) => {
      const p = n - i; if (c === 0) return;
      const ac = Math.abs(c);
      let term = p === 0 ? String(ac) : (ac === 1 ? '' : String(ac)) + (p === 1 ? v : `${v}^${p}`);
      s += s === '' ? (c < 0 ? '-' : '') + term : ` ${sgn(c)} ${term}`;
    });
    return s || '0';
  };
  const nz = (a, b) => { let x = 0; while (x === 0) x = ri(a, b); return x; };

  // ================= 数感 ns =================
  G.g_max_digits = () => {
    const d = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
    const perms = []; const [a, b, c] = d;
    [[a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]].forEach(x => perms.push(x));
    const cand = [];
    perms.forEach(([p, q, r]) => {
      cand.push({ e: `${p}${q}${r}`, l: Math.log10(100 * p + 10 * q + r) });
      cand.push({ e: `${p}${q}×${r}`, l: Math.log10((10 * p + q) * r) });
      cand.push({ e: `${p}^${q}${r}`, l: (10 * q + r) * Math.log10(p) });
      cand.push({ e: `${p}${q}^${r}`, l: r * Math.log10(10 * p + q) });
      cand.push({ e: `${p}^(${q}×${r})`, l: q * r * Math.log10(p) });
      cand.push({ e: `${p}^(${q}^${r})`, l: Math.pow(q, r) * Math.log10(p) });
    });
    cand.sort((x, y) => y.l - x.l);
    const best = cand[0];
    const mag = (l) => l < 15 ? `≈ ${(Math.pow(10, l - Math.floor(l))).toFixed(2)}×10^${Math.floor(l)}` : `≈ 10^${Math.round(l).toLocaleString('en')}`;
    const seen = new Set(); const top = [];
    for (const x of cand) { if (!seen.has(x.e)) { seen.add(x.e); top.push(x); } if (top.length === 3) break; }
    return {
      q: `用 ${d.join(', ')} 各一次（可拼接、乘、幂、幂塔），拼出最大的数`,
      a: `${best.e} ${mag(best.l)}。前三名 log10：${top.map(x => `${x.e}→${Math.round(x.l)}`).join('；')}`,
      how: '幂塔 a^(b^c) 吃一切；比 log10 = 指数×lg(底)，底小指数塔高常赢，1 当底作废'
    };
  };

  const solve24 = (nums) => {
    const rec = (items) => {
      if (items.length === 1) return Math.abs(items[0].v - 24) < 1e-9 ? items[0].e : null;
      for (let i = 0; i < items.length; i++) for (let j = 0; j < items.length; j++) {
        if (i === j) continue;
        const A = items[i], B = items[j];
        const rest = items.filter((_, k) => k !== i && k !== j);
        const cs = [[A.v + B.v, `(${A.e}+${B.e})`], [A.v - B.v, `(${A.e}-${B.e})`], [A.v * B.v, `(${A.e}×${B.e})`]];
        if (Math.abs(B.v) > 1e-9) cs.push([A.v / B.v, `(${A.e}÷${B.e})`]);
        for (const [v, e] of cs) { const r = rec(rest.concat([{ v, e }])); if (r) return r; }
      }
      return null;
    };
    return rec(nums.map(n => ({ v: n, e: String(n) })));
  };
  G.g_make24 = () => {
    let nums, sol;
    do { nums = [ri(1, 13), ri(1, 13), ri(1, 13), ri(1, 13)]; sol = solve24(nums); } while (!sol);
    sol = sol.replace(/^\((.*)\)$/, '$1');
    const m = sol.match(/^\((.*)\)×\((.*)\)$/) || sol.match(/^(.*)×\((.*)\)$/) || sol.match(/^\((.*)\)×(.*)$/);
    return {
      q: `用 ${nums.join(', ')} 各一次算 24（+ - × ÷ 括号）`,
      a: `${sol} = 24`,
      how: '先找 24 的因数对 3×8 / 4×6 / 2×12，再看剩下两个数能不能凑出缺的那个；不行再试 ×÷ 出分数' + (m ? '（本题走的就是乘法拆分）' : '')
    };
  };

  G.g_estimate = () => {
    if (Math.random() < 0.5) {
      const a = ri(12, 98), b = ri(12, 98), ex = a * b;
      const ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10;
      return { q: `估算 ${a} × ${b}（先给数量级，再给精确值）`, a: `量级 10^${Math.floor(Math.log10(ex))}（≈ ${ra}×${rb}=${ra * rb}），精确 ${ex}`, how: '各取整到十位相乘定量级，再用 (a±d) 展开补差' };
    }
    const b = ri(12, 49), qv = ri(11, 89), a = b * qv + ri(0, b - 1);
    return { q: `估算 ${a} ÷ ${b}（先给数量级，再给精确值）`, a: `量级 ≈ ${Math.round(a / 10) * 10}÷${Math.round(b / 10) * 10}≈${Math.round((Math.round(a / 10) * 10) / (Math.round(b / 10) * 10))}，精确 ${(a / b).toFixed(2)}（商 ${Math.floor(a / b)} 余 ${a % b}）`, how: '除数凑整看倍数：先问"几个 b 够 a"，再微调' };
  };

  G.g_percent = () => {
    const mode = ri(0, 2);
    if (mode === 0) {
      const p = pick([5, 10, 12.5, 15, 20, 25, 30, 40, 75]), n = pick([80, 120, 160, 240, 320, 400, 480, 640, 800]);
      return { q: `${p}% of ${n} = ?`, a: r3(p * n / 100), how: '拆成 10% 和 5%（10% 的一半）叠加；25%=÷4，12.5%=÷8' };
    }
    if (mode === 1) {
      const p = pick([10, 20, 25, 30, 50]), n = pick([100, 200, 400, 1000]);
      const fin = n * (1 + p / 100) * (1 - p / 100);
      return { q: `${n} 先涨 ${p}% 再跌 ${p}%，最后多少？净变化几个百分点？`, a: `${r3(fin)}，净 -${r3(p * p / 100)}%`, how: '(1+p)(1-p)=1-p²，先涨后跌永远亏 p² 个百分点' };
    }
    const b = pick([40, 50, 80, 200, 250, 400]), a = b * pick([0.1, 0.15, 0.2, 0.3, 0.45, 0.6, 0.8, 1.2]);
    return { q: `${r3(a)} 是 ${b} 的百分之几？`, a: `${r3(a / b * 100)}%`, how: '把分母变 100：分子分母同乘 100/b' };
  };

  G.g_factor = () => {
    if (Math.random() < 0.5) {
      const ps = [2, 3, 5, 7, 11, 13]; let n = 1; const fs = {};
      const k = ri(2, 4);
      for (let i = 0; i < k; i++) { const p = pick(ps); n *= p; fs[p] = (fs[p] || 0) + 1; }
      const s = Object.keys(fs).map(Number).sort((x, y) => x - y).map(p => fs[p] > 1 ? `${p}^${fs[p]}` : `${p}`).join('×');
      return { q: `分解质因数：${n}`, a: `${n} = ${s}`, how: '先 2（看末位偶）、再 3（数字和）、再 5（末位 0/5），剩下试 7、11、13' };
    }
    const r = nz(-6, 6), s = nz(-6, 6);
    const b = r + s, c = r * s;
    return { q: `因式分解：${fmtPoly([1, b, c])}`, a: `(x ${sgn(-r)} ${Math.abs(r)})(x ${sgn(-s)} ${Math.abs(s)})`, how: '找两数：积 = 常数项，和 = 一次项系数' };
  };

  G.g_log_scale = () => {
    const mode = ri(0, 2);
    const lg = { 2: 0.301, 3: 0.477, 5: 0.699, 7: 0.845, 8: 0.903 };
    if (mode === 0) {
      const m = pick([2, 3, 5, 7, 8]), k = ri(2, 9);
      return { q: `log10(${m}×10^${k}) ≈ ?`, a: r3(k + Math.log10(m)), how: `记 lg2≈0.30 lg3≈0.48 lg5≈0.70 lg7≈0.85：指数 + lg(尾数) = ${k}+${lg[m]}` };
    }
    if (mode === 1) {
      const k = ri(1, 12);
      return { q: `log2(${Math.pow(2, k)}) = ?  log2(${Math.pow(2, k)}×1000) ≈ ?`, a: `${k}；≈ ${r3(k + Math.log2(1000))}`, how: '2^10≈10^3，所以 log2(1000)≈10，log2 × 0.3 = log10' };
    }
    const k = ri(1, 6), m = pick([2, 3, 5, 8]);
    const val = m * Math.pow(10, k);
    return { q: `10^${r3(k + Math.log10(m))} ≈ 多少？`, a: `≈ ${val.toLocaleString('en')}`, how: '整数部分定位数，小数 0.3→2、0.48→3、0.7→5、0.9→8' };
  };

  G.g_magnitude = () => {
    if (Math.random() < 0.5) {
      const a = ri(2, 9), m = ri(2, 12), b = ri(2, 9), n = ri(2, 12);
      const prod = a * b * Math.pow(10, m + n), e = Math.floor(Math.log10(prod));
      return { q: `(${a}×10^${m}) × (${b}×10^${n}) 是 10 的几次方量级？`, a: `≈ ${(prod / Math.pow(10, e)).toFixed(1)}×10^${e}，量级 10^${e}`, how: '指数相加，尾数相乘；尾数积 ≥10 就进一位' };
    }
    const n = pick([16, 20, 24, 30, 32, 40, 50, 64]);
    const l = n * Math.log10(2);
    return { q: `2^${n} 大约是 10 的几次方？`, a: `≈ 10^${r2(l)}，即 ≈ ${(Math.pow(10, l - Math.floor(l))).toFixed(1)}×10^${Math.floor(l)}`, how: '2^10≈10^3：指数 ×0.3 就是 10 的次方数' };
  };

  G.g_mental_mult = () => {
    const mode = ri(0, 3);
    if (mode === 0) { const n = ri(12, 98); return { q: `11 × ${n} = ?`, a: String(11 * n), how: '两头不动，中间放两位数字之和（满十进位）' }; }
    if (mode === 1) { const t = ri(1, 12); const n = t * 10 + 5; return { q: `${n}² = ?`, a: String(n * n), how: `十位×(十位+1) 接 25：${t}×${t + 1}=${t * (t + 1)} 接 25` }; }
    if (mode === 2) { const m = pick([20, 30, 40, 50, 60, 70, 80, 90, 100]), d = ri(1, 9); return { q: `${m - d} × ${m + d} = ?`, a: String(m * m - d * d), how: `差平方：${m}² - ${d}² = ${m * m} - ${d * d}` }; }
    const a = ri(91, 99), b = ri(91, 99);
    return { q: `${a} × ${b} = ?`, a: String(a * b), how: `离 100 差 ${100 - a} 和 ${100 - b}：前两位 = 100-(${100 - a}+${100 - b})=${a + b - 100}，后两位 = ${100 - a}×${100 - b}=${(100 - a) * (100 - b)}` };
  };

  // ================= 代数 al =================
  G.g_quadratic = () => {
    const r = nz(-7, 7), s = nz(-7, 7);
    const b = -(r + s), c = r * s;
    const roots = [...new Set([r, s])].sort((x, y) => x - y);
    return { q: `解方程：${fmtPoly([1, b, c])} = 0`, a: `x = ${roots.join(' 或 ')}`, how: `韦达：两根和 = ${-b}，积 = ${c}，直接找两数` };
  };

  G.g_exp_log = () => {
    const mode = ri(0, 3);
    if (mode === 0) { const b = pick([2, 3, 5, 10]), k = ri(2, 6); return { q: `解 ${b}^x = ${Math.pow(b, k)}`, a: `x = ${k}`, how: '把右边写成同底的幂，指数直接相等' }; }
    if (mode === 1) { const b = pick([2, 3, 4, 5]), k = ri(2, 5); return { q: `log_${b}(${Math.pow(b, k)}) = ?`, a: String(k), how: 'log 问的是"底数的几次方"' }; }
    if (mode === 2) { const a = pick([2, 4, 5, 8]), b = pick([2, 5, 25, 125]); return { q: `log10(${a}) + log10(${b}) = log10(?)，值 ≈ ?`, a: `log10(${a * b}) ≈ ${r3(Math.log10(a * b))}`, how: '加 log = 乘真数；凑 2×5=10、4×25=100' }; }
    const k = ri(2, 6), m = ri(2, 4);
    return { q: `化简 (${pick(['2', '3', 'a'])}^${k})^${m} 的指数，以及 e^(ln ${k}) = ?`, a: `指数 ${k * m}；e^(ln ${k}) = ${k}`, how: '幂的幂指数相乘；e 和 ln 互相抵消' };
  };

  G.g_amgm = () => {
    const mode = ri(0, 2);
    if (mode === 0) { const S = 2 * ri(3, 15); return { q: `x, y > 0，x + y = ${S}，xy 最大是多少？`, a: `${S / 2 * S / 2}（x = y = ${S / 2}）`, how: '和定积最大：均分时取到，最大 = (S/2)²' }; }
    if (mode === 1) { const t = ri(2, 12), Pd = t * t; return { q: `x, y > 0，xy = ${Pd}，x + y 最小是多少？`, a: `${2 * t}（x = y = ${t}）`, how: '积定和最小：2√P' }; }
    const k = ri(2, 10) ** 2;
    return { q: `x > 0，x + ${k}/x 的最小值？`, a: `${2 * Math.sqrt(k)}（x = ${Math.sqrt(k)}）`, how: '两项乘积是常数 k → 最小 = 2√k，取等时两项相等' };
  };

  G.g_sequence = () => {
    if (Math.random() < 0.5) {
      const a1 = ri(-5, 10), d = nz(-4, 6), n = ri(6, 20);
      const an = a1 + (n - 1) * d, Sn = n * (a1 + an) / 2;
      return { q: `等差数列 a1 = ${a1}，d = ${d}，求 a${n} 和 S${n}`, a: `a${n} = ${an}，S${n} = ${Sn}`, how: 'a_n = a1 + (n-1)d；S_n = n×(首+尾)/2' };
    }
    const a1 = pick([1, 2, 3, 5]), r = pick([2, 3, -2, 1 / 2]), n = ri(4, 7);
    const an = a1 * Math.pow(r, n - 1);
    const Sn = a1 * (1 - Math.pow(r, n)) / (1 - r);
    return { q: `等比数列 a1 = ${a1}，q = ${r === 0.5 ? '1/2' : r}，求 a${n} 和 S${n}`, a: `a${n} = ${r === 0.5 ? frac(a1, Math.pow(2, n - 1)) : an}，S${n} = ${r === 0.5 ? frac(a1 * (Math.pow(2, n) - 1), Math.pow(2, n - 1)) : Sn}`, how: 'a_n = a1·q^(n-1)；S_n = a1(1-q^n)/(1-q)' };
  };

  G.g_system_eq = () => {
    let a, b, c, d, x, y;
    do { a = nz(-5, 5); b = nz(-5, 5); c = nz(-5, 5); d = nz(-5, 5); } while (a * d - b * c === 0);
    x = ri(-6, 6); y = ri(-6, 6);
    const e1 = a * x + b * y, e2 = c * x + d * y;
    const cf = (k) => (k === 1 ? '' : k === -1 ? '-' : String(k)); const ab = (k) => (Math.abs(k) === 1 ? '' : String(Math.abs(k)));
    return { q: `解方程组：${cf(a)}x ${sgn(b)} ${ab(b)}y = ${e1}；${cf(c)}x ${sgn(d)} ${ab(d)}y = ${e2}`, a: `x = ${x}，y = ${y}`, how: `克拉默：det = ${a}×${d} - ${b}×${c} = ${a * d - b * c}；x = det_x/det，或消元凑同系数相减` };
  };

  G.g_substitution = () => {
    const mode = ri(0, 2);
    if (mode === 0) { const k = ri(3, 9); return { q: `已知 x + 1/x = ${k}，求 x² + 1/x²`, a: String(k * k - 2), how: '平方展开多出 2：(x+1/x)² - 2' }; }
    if (mode === 1) { const s = ri(3, 10), p = ri(1, 12); return { q: `x + y = ${s}，xy = ${p}，求 x² + y²`, a: String(s * s - 2 * p), how: 's² - 2p，别去解 x, y' }; }
    const s = ri(2, 8), p = ri(1, 10);
    return { q: `x + y = ${s}，xy = ${p}，求 x³ + y³`, a: String(s ** 3 - 3 * s * p), how: 's³ - 3sp：立方和 = 和³ - 3·积·和' };
  };

  // ================= 几何 ge =================
  const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15]];
  const triples3 = [[1, 2, 2, 3], [2, 3, 6, 7], [2, 6, 9, 11], [4, 4, 7, 9], [1, 4, 8, 9], [6, 6, 7, 11]];
  const signs = (v) => v.map(x => x * pick([1, -1]));
  G.g_vector_len = () => {
    if (Math.random() < 0.5) { const [a, b, l] = pick(triples); const v = signs(shuffle([a, b])); return { q: `|${vec(v)}| = ?`, a: String(l), how: '认出勾股三元组 3-4-5 / 5-12-13 / 8-15-17 及其倍数' }; }
    const [a, b, c, l] = pick(triples3); const v = signs(shuffle([a, b, c]));
    return { q: `|${vec(v)}| = ?`, a: String(l), how: '平方和开根；三维常见 1-2-2→3、2-3-6→7、2-6-9→11' };
  };

  G.g_dot = () => {
    const n = pick([2, 3]);
    const u = Array.from({ length: n }, () => ri(-5, 5)), v = Array.from({ length: n }, () => ri(-5, 5));
    const d = u.reduce((s, x, i) => s + x * v[i], 0);
    const rel = d === 0 ? '垂直' : d > 0 ? '夹角为锐角' : '夹角为钝角';
    return { q: `${vec(u)} · ${vec(v)} = ?  两向量夹角是锐角、钝角还是垂直？`, a: `${d}，${rel}`, how: '对应相乘再相加；符号就是 cos 的符号：正锐、负钝、零垂直' };
  };

  G.g_unit_circle = () => {
    const T = {
      0: ['0', '1', '0'], 30: ['1/2', '√3/2', '√3/3'], 45: ['√2/2', '√2/2', '1'], 60: ['√3/2', '1/2', '√3'], 90: ['1', '0', '不存在'],
      120: ['√3/2', '-1/2', '-√3'], 135: ['√2/2', '-√2/2', '-1'], 150: ['1/2', '-√3/2', '-√3/3'], 180: ['0', '-1', '0'],
      210: ['-1/2', '-√3/2', '√3/3'], 225: ['-√2/2', '-√2/2', '1'], 240: ['-√3/2', '-1/2', '√3'], 270: ['-1', '0', '不存在'],
      300: ['-√3/2', '1/2', '-√3'], 315: ['-√2/2', '√2/2', '-1'], 330: ['-1/2', '√3/2', '-√3/3']
    };
    const deg = Number(pick(Object.keys(T))); const fi = ri(0, 2); const fn = ['sin', 'cos', 'tan'][fi];
    const rad = deg === 0 ? '0' : frac(deg, 180) === '1' ? 'π' : `${frac(deg, 180)}π`.replace(/^1π/, 'π');
    return { q: `${fn}(${deg}°) = ?  （${deg}° = ${rad}）`, a: T[deg][fi], how: '先定象限定符号，再看参考角 30/45/60：sin 是 1/2、√2/2、√3/2 递增' };
  };

  G.g_distance = () => {
    if (Math.random() < 0.5) {
      const [a, b, l] = pick(triples); const p = [ri(-5, 5), ri(-5, 5)]; const q = [p[0] + a * pick([1, -1]), p[1] + b * pick([1, -1])];
      return { q: `点 ${vec(p)} 到点 ${vec(q)} 的距离`, a: String(l), how: '先算 Δx、Δy，认勾股三元组' };
    }
    const [a, b] = pick([[3, 4], [4, 3], [5, 12], [12, 5], [8, 15], [6, 8]]); const c = ri(-9, 9); const p = [ri(-5, 5), ri(-5, 5)];
    const num = Math.abs(a * p[0] + b * p[1] + c), den = Math.sqrt(a * a + b * b);
    return { q: `点 ${vec(p)} 到直线 ${a}x + ${b}y ${sgn(c)} ${Math.abs(c)} = 0 的距离`, a: `${frac(num, den)}${num % den ? ` ≈ ${r3(num / den)}` : ''}`, how: '|ax0+by0+c| / √(a²+b²)；分母认 3-4-5 直接得 5' };
  };

  G.g_area_cross = () => {
    if (Math.random() < 0.5) {
      const u = [nz(-5, 5), nz(-5, 5)], v = [nz(-5, 5), nz(-5, 5)];
      const cr = u[0] * v[1] - u[1] * v[0];
      return { q: `向量 ${vec(u)} 与 ${vec(v)} 张成的平行四边形面积；三角形面积`, a: `平行四边形 ${Math.abs(cr)}，三角形 ${frac(Math.abs(cr), 2)}`, how: '|ad - bc| 就是面积（2×2 行列式绝对值），三角形再除 2' };
    }
    const A = [ri(-4, 4), ri(-4, 4)], B = [ri(-4, 4), ri(-4, 4)], Cc = [ri(-4, 4), ri(-4, 4)];
    const cr = (B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]);
    return { q: `三角形 A${vec(A)} B${vec(B)} C${vec(Cc)} 的面积`, a: `${frac(Math.abs(cr), 2)}${cr === 0 ? '（三点共线）' : ''}`, how: '鞋带公式：|AB × AC| / 2，两边向量做叉积' };
  };

  // ================= 线性代数 la =================
  const rmat = (n, m, lo = -4, hi = 4) => Array.from({ length: n }, () => Array.from({ length: m }, () => ri(lo, hi)));
  G.g_det2 = () => {
    const A = rmat(2, 2, -6, 6); const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    return { q: `det ${mat(A)} = ?`, a: `${d}${d === 0 ? '（奇异，不可逆）' : ''}`, how: '主对角积 - 副对角积；几何上是列向量张成的有向面积' };
  };

  const rank = (M) => {
    const A = M.map(r => r.slice()); const n = A.length, m = A[0].length; let rk = 0;
    for (let c = 0; c < m && rk < n; c++) {
      let p = rk; for (let i = rk; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
      if (Math.abs(A[p][c]) < 1e-9) continue;
      [A[rk], A[p]] = [A[p], A[rk]];
      for (let i = rk + 1; i < n; i++) { const f = A[i][c] / A[rk][c]; for (let j = c; j < m; j++) A[i][j] -= f * A[rk][j]; }
      rk++;
    }
    return rk;
  };
  G.g_rank = () => {
    const mode = ri(0, 2); let A;
    if (mode === 0) A = rmat(3, 3, -3, 3);
    else if (mode === 1) { A = rmat(2, 3, -3, 3); const k1 = nz(-2, 2), k2 = ri(-2, 2); A.push(A[0].map((x, j) => k1 * x + k2 * A[1][j])); }
    else { const r = rmat(1, 3, -3, 3)[0]; A = [1, nz(-2, 2), nz(-3, 3)].map(k => r.map(x => k * x)); }
    const rk = rank(A);
    return { q: `rank ${mat(A)} = ?`, a: String(rk), how: '先肉眼找行倍数/行之和；找不到再高斯消元数非零主元行数' };
  };

  G.g_matrix_vec = () => {
    const n = pick([2, 2, 3]); const A = rmat(n, n, -3, 3); const x = Array.from({ length: n }, () => ri(-3, 3));
    const y = A.map(r => r.reduce((s, v, j) => s + v * x[j], 0));
    return { q: `${mat(A)} × ${vec(x)}ᵀ = ?`, a: vec(y), how: '看成列的线性组合：x1×第1列 + x2×第2列 …' };
  };

  G.g_inverse2 = () => {
    let A, d; do { A = rmat(2, 2, -5, 5); d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; } while (d === 0);
    const [[a, b], [c, dd]] = A;
    const inv = [[frac(dd, d), frac(-b, d)], [frac(-c, d), frac(a, d)]];
    return { q: `${mat(A)} 的逆矩阵`, a: `(1/${d}) × ${mat([[dd, -b], [-c, a]])} = ${mat(inv)}`, how: '主对角互换、副对角变号、整体除以 det' };
  };

  G.g_eigen2 = () => {
    const l1 = nz(-4, 5), l2 = nz(-4, 5); const p = ri(-2, 2), q = ri(-2, 2);
    const Pm = [[1, p], [q, 1 + p * q]], Pi = [[1 + p * q, -p], [-q, 1]];
    const D = [[l1, 0], [0, l2]];
    const mul = (X, Y) => X.map(r => Y[0].map((_, j) => r.reduce((s, v, k) => s + v * Y[k][j], 0)));
    const A = mul(mul(Pm, D), Pi);
    const tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    const ev = [l1, l2].sort((x, y) => x - y);
    return { q: `${mat(A)} 的特征值`, a: `λ = ${ev.join(', ')}（迹 ${tr}，det ${det}）`, how: `迹 = λ1+λ2 = ${tr}，det = λ1λ2 = ${det}，找两数；三角阵直接读对角` };
  };

  // ================= 微积分 ca =================
  const rpoly = (deg) => { const co = Array.from({ length: deg + 1 }, () => ri(-5, 5)); if (co[0] === 0) co[0] = nz(1, 5); return co; };
  const deriv = (co) => { const n = co.length - 1; return co.slice(0, -1).map((c, i) => c * (n - i)); };
  const evalP = (co, x) => co.reduce((s, c) => s * x + c, 0);
  G.g_derivative_poly = () => {
    const co = rpoly(ri(2, 4)); const d = deriv(co); const x0 = ri(-2, 2);
    return { q: `f(x) = ${fmtPoly(co)}，求 f'(x) 与 f'(${x0})`, a: `f'(x) = ${fmtPoly(d)}；f'(${x0}) = ${evalP(d, x0)}`, how: '指数掉下来当系数、指数减 1，常数归零' };
  };

  G.g_integral_poly = () => {
    const co = rpoly(ri(1, 3)); const b = ri(1, 3), a0 = pick([0, 0, -1]);
    const n = co.length - 1;
    const F = (x) => co.reduce((s, c, i) => s + c * Math.pow(x, n - i + 1) / (n - i + 1), 0);
    const val = F(b) - F(a0);
    const den = fact(n + 1); const num = Math.round(val * den);
    const anti = co.map((c, i) => { const p = n - i + 1; if (c === 0) return ''; const f = frac(c, p); const cf = f === '1' ? '' : f === '-1' ? '-' : f; return `${cf}${p === 1 ? 'x' : `x^${p}`}`; }).filter(Boolean).join(' + ').replace(/\+ -/g, '- ');
    return { q: `∫ 从 ${a0} 到 ${b} (${fmtPoly(co)}) dx`, a: `${frac(num, den)}${num % den ? ` ≈ ${r3(val)}` : ''}（原函数 ${anti}）`, how: '指数加 1 再除以新指数，代上限减下限' };
  };

  G.g_chain = () => {
    const a = nz(-4, 4), b = ri(-3, 3), n = ri(2, 5);
    const inner = fmtPoly([a, b]);
    const mode = ri(0, 3);
    if (mode === 0) return { q: `d/dx (${inner})^${n}`, a: `${n * a}(${inner})^${n - 1}`, how: '外层幂法则 × 内层导数 a' };
    if (mode === 1) return { q: `d/dx sin(${inner})`, a: `${a}cos(${inner})`, how: '外导 cos 保留内层，再乘内导 a' };
    if (mode === 2) { const k = nz(-3, 3); return { q: `d/dx e^(${k}x²)`, a: `${2 * k}x·e^(${k}x²)`, how: 'e 不变，乘内层导数 2kx' }; }
    return { q: `d/dx ln(${inner})`, a: `${a}/(${inner})`, how: 'ln 的导数 = 内导/内层' };
  };

  G.g_limit = () => {
    const mode = ri(0, 3);
    if (mode === 0) { const a = nz(-5, 5); return { q: `lim x→${a} (x² - ${a * a})/(x - ${a})`, a: String(2 * a), how: '0/0 先因式分解约掉 (x-a)，剩 x+a' }; }
    if (mode === 1) { const a = nz(-5, 5), b = nz(1, 5); return { q: `lim x→0 sin(${a}x)/(${b}x)`, a: frac(a, b), how: 'sin(t)/t → 1，答案就是系数比 a/b' }; }
    if (mode === 2) { const a = nz(-3, 3); return { q: `lim n→∞ (1 + ${a}/n)^n`, a: `e^${a}${a === 1 ? ' = e' : ` ≈ ${r3(Math.exp(a))}`}`, how: '(1+a/n)^n → e^a，看分子上的 a' }; }
    const a = nz(-5, 5), b = nz(1, 5), c = ri(-5, 5), d = ri(-5, 5);
    return { q: `lim x→∞ (${fmtPoly([a, c, 1])})/(${fmtPoly([b, d, 2])})`, a: frac(a, b), how: '同次多项式比 → 首项系数比；分子次数低 → 0；高 → ∞' };
  };

  G.g_taylor_coef = () => {
    const mode = ri(0, 3); const n = ri(2, 5);
    if (mode === 0) { const a = nz(-3, 3); return { q: `e^(${a === 1 ? '' : a === -1 ? '-' : a}x) 展开中 x^${n} 的系数`, a: frac(Math.pow(a, n), fact(n)), how: 'e^t = Σ t^n/n!，代 t = ax 得 a^n/n!' }; }
    if (mode === 1) { const a = nz(-3, 3); return { q: `1/(1 ${sgn(-a)} ${Math.abs(a) === 1 ? '' : Math.abs(a)}x) 展开中 x^${n} 的系数`, a: String(Math.pow(a, n)), how: '几何级数 1/(1-t) = Σ t^n，系数 a^n' }; }
    if (mode === 2) { const c = n % 2 === 0 ? 0 : Math.pow(-1, (n - 1) / 2); return { q: `sin x 展开中 x^${n} 的系数`, a: c === 0 ? '0（sin 只有奇次项）' : frac(c, fact(n)), how: 'sin 只有奇次：x - x³/3! + x⁵/5!，符号交替' }; }
    return { q: `ln(1 + x) 展开中 x^${n} 的系数`, a: frac(Math.pow(-1, n + 1), n), how: 'ln(1+x) = x - x²/2 + x³/3 …，分母是 n 不是 n!' };
  };

  G.g_gradient = () => {
    const a = nz(-3, 3), b = nz(-3, 3), c = nz(-3, 3), d = ri(-3, 3), e = ri(-3, 3);
    const x0 = ri(-2, 2), y0 = ri(-2, 2);
    const fx = 2 * a * x0 + b * y0 + d, fy = b * x0 + 2 * c * y0 + e;
    const f = `${a}x² ${sgn(b)} ${Math.abs(b)}xy ${sgn(c)} ${Math.abs(c)}y²${d ? ` ${sgn(d)} ${Math.abs(d)}x` : ''}${e ? ` ${sgn(e)} ${Math.abs(e)}y` : ''}`;
    return { q: `f(x,y) = ${f}，求 ∇f(${x0}, ${y0})`, a: `∇f = (${2 * a}x ${sgn(b)} ${Math.abs(b)}y ${d ? `${sgn(d)} ${Math.abs(d)}` : ''}, ${b}x ${sgn(2 * c)} ${Math.abs(2 * c)}y ${e ? `${sgn(e)} ${Math.abs(e)}` : ''}) → ${vec([fx, fy])}`, how: '对 x 求导时把 y 当常数，反之亦然；梯度指向上升最快方向' };
  };

  // ================= 概率统计 pr =================
  G.g_prob_basic = () => {
    if (Math.random() < 0.5) {
      const k = ri(2, 12); let cnt = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === k) cnt++;
      return { q: `掷两枚骰子，点数和 = ${k} 的概率`, a: `${frac(cnt, 36)} ≈ ${r3(cnt / 36)}`, how: '数格子：和为 k 的组合数 = 6 - |k - 7|，除以 36' };
    }
    const r = ri(2, 6), b = ri(2, 6); const num = r * (r - 1), den = (r + b) * (r + b - 1);
    return { q: `袋中 ${r} 红 ${b} 蓝，不放回抽 2 个，都是红的概率`, a: `${frac(num, den)} ≈ ${r3(num / den)}`, how: '链式相乘：r/(r+b) × (r-1)/(r+b-1)' };
  };

  G.g_bayes = () => {
    const p = pick([0.001, 0.005, 0.01, 0.02, 0.05, 0.1]), s = pick([0.9, 0.95, 0.99]), t = pick([0.9, 0.95, 0.99]);
    const post = p * s / (p * s + (1 - p) * (1 - t));
    return { q: `患病率 ${p * 100}%，灵敏度 ${s * 100}%，特异度 ${t * 100}%。检测阳性，真患病概率？`, a: r3(post), how: '想 10000 人：真阳 = 病人×灵敏度，假阳 = 健康×(1-特异度)，答案 = 真阳/(真阳+假阳)' };
  };

  G.g_expectation = () => {
    const vals = shuffle([-2, -1, 0, 1, 2, 3, 4, 5, 6, 10]).slice(0, 3).sort((a, b) => a - b);
    let w = [ri(1, 6), ri(1, 6), ri(1, 6)]; const tot = w.reduce((a, b) => a + b, 0);
    const E = vals.reduce((s, v, i) => s + v * w[i] / tot, 0);
    return { q: `X 取 ${vals.join(', ')} 的概率分别为 ${w.map(x => frac(x, tot)).join(', ')}，求 E[X]`, a: `${frac(vals.reduce((s, v, i) => s + v * w[i], 0), tot)}${Number.isInteger(E) ? '' : ` ≈ ${r3(E)}`}`, how: '值×概率求和；先通分母，只算分子' };
  };

  G.g_variance = () => {
    if (Math.random() < 0.5) {
      const m = ri(3, 8); const dev = [ri(-3, 3), ri(-3, 3), ri(-3, 3)]; dev.push(-dev.reduce((a, b) => a + b, 0));
      const data = dev.map(d => m + d); const v = dev.reduce((s, d) => s + d * d, 0) / 4;
      return { q: `数据 ${data.join(', ')} 的总体方差与标准差`, a: `均值 ${m}，方差 ${r3(v)}，标准差 ${r3(Math.sqrt(v))}`, how: '先求均值，再平均"离差平方"；样本方差分母改 n-1' };
    }
    const vals = [0, 1, ri(2, 4)]; const w = [ri(1, 5), ri(1, 5), ri(1, 5)]; const tot = w.reduce((a, b) => a + b, 0);
    const E = vals.reduce((s, v, i) => s + v * w[i], 0) / tot, E2 = vals.reduce((s, v, i) => s + v * v * w[i], 0) / tot;
    return { q: `X 取 ${vals.join(', ')}，概率 ${w.map(x => frac(x, tot)).join(', ')}，求 Var(X)`, a: `E[X] = ${r3(E)}，E[X²] = ${r3(E2)}，Var = ${r3(E2 - E * E)}`, how: 'Var = E[X²] - (E[X])²，别去减均值再平方' };
  };

  G.g_binomial_prob = () => {
    const n = ri(3, 6), k = ri(0, n), p = pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6]);
    const pr = C(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    return { q: `X ~ B(${n}, ${p})，P(X = ${k}) = ?`, a: `C(${n},${k})·${p}^${k}·${1 - p}^${n - k} = ${C(n, k)}×${r3(Math.pow(p, k) * Math.pow(1 - p, n - k))} ≈ ${r3(pr)}`, how: '三件套：选哪几次 C(n,k)、成功 p^k、失败 (1-p)^(n-k)' };
  };

  G.g_entropy = () => {
    const H = (ps) => -ps.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
    if (Math.random() < 0.5) { const p = pick([0.1, 0.2, 0.25, 0.3, 0.5, 0.75, 0.9]); return { q: `伯努利 p = ${p} 的熵（bit）`, a: `${r3(H([p, 1 - p]))} bit`, how: 'p=0.5 是 1 bit 最大；越偏越小；H(p)=H(1-p)' }; }
    const dist = pick([[0.5, 0.25, 0.25], [0.5, 0.5, 0, 0], [0.25, 0.25, 0.25, 0.25], [0.5, 0.25, 0.125, 0.125], [0.7, 0.2, 0.1], [0.4, 0.4, 0.2]]);
    return { q: `分布 (${dist.join(', ')}) 的熵（bit）`, a: `${r3(H(dist))} bit`, how: '均匀 n 类 = log2 n；2 的负幂概率直接用 -log2 p 加权：1/2→1，1/4→2，1/8→3' };
  };

  // ================= 组合 co =================
  G.g_perm_comb = () => {
    const mode = ri(0, 2); const n = ri(5, 9), k = ri(2, 4);
    if (mode === 0) return { q: `从 ${n} 人中选 ${k} 人排成一排，有几种？`, a: `P(${n},${k}) = ${P(n, k)}`, how: '有顺序 → 排列：n(n-1)…连乘 k 项' };
    if (mode === 1) return { q: `从 ${n} 人中选 ${k} 人组队（不分顺序），有几种？`, a: `C(${n},${k}) = ${C(n, k)}`, how: '无顺序 → 组合：排列再除以 k!' };
    return { q: `${n} 人围圆桌坐，有几种坐法？`, a: `(${n}-1)! = ${fact(n - 1)}`, how: '圆排列固定一人当参照，剩下 (n-1)!' };
  };

  G.g_binomial_coef = () => {
    const n = ri(3, 7), k = ri(1, n - 1), a = nz(-3, 3);
    const coef = C(n, k) * Math.pow(a, n - k);
    return { q: `(x ${sgn(a)} ${Math.abs(a)})^${n} 展开中 x^${k} 的系数`, a: `C(${n},${k})·(${a})^${n - k} = ${C(n, k)}×${Math.pow(a, n - k)} = ${coef}`, how: '选 k 个 x、其余 n-k 个取常数：C(n,k)·a^(n-k)，注意负号奇偶' };
  };

  G.g_stars_bars = () => {
    const n = ri(5, 12), k = ri(3, 4);
    if (Math.random() < 0.5) return { q: `x1 + … + x${k} = ${n}，非负整数解个数`, a: `C(${n + k - 1},${k - 1}) = ${C(n + k - 1, k - 1)}`, how: 'n 个星 k-1 个隔板：C(n+k-1, k-1)' };
    return { q: `x1 + … + x${k} = ${n}，正整数解个数`, a: `C(${n - 1},${k - 1}) = ${C(n - 1, k - 1)}`, how: '正整数 → 先每人发 1 个，或直接 n-1 个空隙选 k-1：C(n-1, k-1)' };
  };

  G.g_inclusion_exclusion = () => {
    if (Math.random() < 0.5) {
      const N = pick([100, 200, 300, 500, 1000]); const [a, b] = pick([[2, 3], [3, 5], [2, 5], [3, 7], [4, 6], [6, 9]]);
      const l = a * b / gcd(a, b); const ans = Math.floor(N / a) + Math.floor(N / b) - Math.floor(N / l);
      return { q: `1~${N} 中能被 ${a} 或 ${b} 整除的数有几个？`, a: `${Math.floor(N / a)} + ${Math.floor(N / b)} - ${Math.floor(N / l)} = ${ans}`, how: '加两个、减掉公倍数（lcm）重复的那份' };
    }
    const tot = ri(30, 60), A = ri(10, 25), B = ri(10, 25), both = ri(2, Math.min(A, B) - 1);
    return { q: `班上 ${tot} 人，${A} 人学 Python，${B} 人学 R，${both} 人都学。两者都不学的有几人？`, a: `${tot} - (${A} + ${B} - ${both}) = ${tot - (A + B - both)}`, how: '|A∪B| = |A|+|B|-|A∩B|，再用总数减' };
  };

  G.g_pigeonhole = () => {
    const mode = ri(0, 2);
    if (mode === 0) { const c = ri(2, 6), k = ri(2, 4); return { q: `抽屉里 ${c} 种颜色的袜子，闭眼至少拿几只，保证有 ${k} 只同色？`, a: String(c * (k - 1) + 1), how: '最坏情况每种拿 k-1 只，再多 1 只：c(k-1)+1' }; }
    if (mode === 1) { const k = ri(2, 5); return { q: `至少几个人，保证有 ${k} 人生日在同一个月？`, a: String(12 * (k - 1) + 1), how: '12 个抽屉，每个先塞 k-1，再加 1' }; }
    const n = ri(13, 40); return { q: `${n} 个人中，保证至少几人同一月生日？`, a: String(Math.ceil(n / 12)), how: '⌈n/12⌉：物品数除以抽屉数向上取整' };
  };

  G.g_recursion_seq = () => {
    const mode = ri(0, 2);
    if (mode === 0) { const p = pick([2, 3, -1, 2]), qv = ri(-3, 4), a0 = ri(0, 3), n = ri(3, 5); let a = a0; for (let i = 0; i < n; i++) a = p * a + qv; return { q: `a0 = ${a0}，a_n = ${p}·a_{n-1} ${sgn(qv)} ${Math.abs(qv)}，求 a${n}`, a: String(a), how: '直接迭代 n 步；封闭式：不动点 x=px+q，a_n - x = p^n(a0 - x)' }; }
    if (mode === 1) { const a0 = ri(0, 3), a1 = ri(1, 4), n = ri(5, 9); const s = [a0, a1]; for (let i = 2; i <= n; i++) s.push(s[i - 1] + s[i - 2]); return { q: `a0 = ${a0}，a1 = ${a1}，a_n = a_{n-1} + a_{n-2}，求 a${n}`, a: `${s[n]}（序列 ${s.join(', ')}）`, how: '斐波那契结构：逐项相加，大约每步 ×1.618' }; }
    const n = ri(3, 8); return { q: `T(0) = 0，T(n) = 2T(n-1) + 1，求 T(${n})`, a: `2^${n} - 1 = ${Math.pow(2, n) - 1}`, how: '汉诺塔：两边加 1 变等比，T(n)+1 = 2^n' };
  };

  // ================= 离散数论 di =================
  const powmod = (a, b, m) => { let r = 1; a %= m; while (b > 0) { if (b & 1) r = r * a % m; a = a * a % m; b >>= 1; } return r; };
  G.g_modular = () => {
    const mode = ri(0, 2);
    if (mode === 0) { const a = ri(2, 9), b = ri(10, 99), m = pick([5, 7, 11, 13]); return { q: `${a}^${b} mod ${m} = ?`, a: String(powmod(a, b, m)), how: `费马小定理：a^${m - 1} ≡ 1 (mod ${m})，指数先对 ${m - 1} 取余 → ${b % (m - 1)}` }; }
    if (mode === 1) { const a = ri(2, 9), n = ri(10, 99); return { q: `${a}^${n} 的个位数字`, a: String(powmod(a, n, 10)), how: '个位 4 一循环：指数 mod 4（余 0 看第 4 个）' }; }
    const a = ri(20, 99), b = ri(20, 99), m = ri(5, 12);
    return { q: `(${a} × ${b}) mod ${m} = ?`, a: String(a * b % m), how: `先各自取余再乘：${a % m} × ${b % m} = ${a % m * (b % m)}，再 mod ${m}` };
  };

  G.g_gcd = () => {
    const g = pick([1, 2, 3, 4, 6, 7, 12]); let a = g * ri(5, 30), b = g * ri(5, 30); if (a < b)[a, b] = [b, a];
    const steps = []; let x = a, y = b; while (y) { steps.push(`${x} = ${Math.floor(x / y)}×${y} + ${x % y}`);[x, y] = [y, x % y]; }
    const G0 = x;
    return { q: `gcd(${a}, ${b}) = ?  lcm = ?`, a: `gcd = ${G0}，lcm = ${a * b / G0}（${steps.slice(0, 3).join('；')}）`, how: '辗转相除：大数 mod 小数，直到余 0；lcm = ab/gcd' };
  };

  G.g_prime = () => {
    const n = ri(51, 300) | 1; let f = 0; for (let p = 2; p * p <= n; p++) if (n % p === 0) { f = p; break; }
    return { q: `${n} 是素数吗？`, a: f ? `不是，${n} = ${f} × ${n / f}` : '是素数', how: `只试除到 √${n} ≈ ${Math.floor(Math.sqrt(n))} 的素数：2,3,5,7,11,13,17；3 看数字和，11 看奇偶位差` };
  };

  G.g_bits = () => {
    const mode = ri(0, 3); const n = ri(5, 200);
    if (mode === 0) return { q: `${n} 的二进制？1 的个数？`, a: `${n.toString(2)}，共 ${n.toString(2).split('1').length - 1} 个 1`, how: '从大到小减 2 的幂：128,64,32,16,8,4,2,1' };
    if (mode === 1) return { q: `${n} & (${n} - 1) = ?  ${n} 是 2 的幂吗？`, a: `${n & (n - 1)}，${(n & (n - 1)) === 0 ? '是' : '不是'}`, how: 'n&(n-1) 抹掉最低位的 1；结果为 0 ⇔ 2 的幂' };
    if (mode === 2) { const k = ri(1, 4); return { q: `${n} << ${k} = ?  ${n} >> ${k} = ?`, a: `${n << k}，${n >> k}`, how: '左移 = ×2^k，右移 = ÷2^k 取整' }; }
    const m = ri(1, 127); return { q: `-${m} 的 8 位补码（二进制）`, a: (256 - m).toString(2).padStart(8, '0'), how: '256 - m 再转二进制；或取反加 1' };
  };

  G.g_bigo = () => {
    if (Math.random() < 0.5) {
      const a = pick([1, 2, 3, 4, 8]), b = pick([2, 3, 4]), d = pick([0, 1, 2]);
      const lg = Math.log(a) / Math.log(b); let ans;
      if (Math.abs(lg - d) < 1e-9) ans = `Θ(n^${d} log n)`.replace('n^0 ', '').replace('n^1 ', 'n ');
      else if (lg > d) ans = Number.isInteger(Math.round(lg * 1e9) / 1e9) ? (Math.round(lg) === 1 ? 'Θ(n)' : `Θ(n^${Math.round(lg)})`) : `Θ(n^log_${b}(${a})) = Θ(n^${r2(lg)})`;
      else ans = d === 0 ? 'Θ(1)' : `Θ(n^${d})`.replace('n^1', 'n');
      return { q: `T(n) = ${a}T(n/${b}) + n^${d}，T(n) = ?`, a: ans, how: `主定理：比 log_${b}(${a}) = ${r2(lg)} 和 ${d}：大者胜，相等加 log n` };
    }
    const items = [
      ['for i in range(n): for j in range(i): …', 'O(n²)', '内层平均 n/2，仍是 n²'],
      ['while n > 1: n //= 2', 'O(log n)', '每步砍半 → log'],
      ['for i in range(n): while j < n: j *= 2', 'O(n log n)', '外 n × 内 log n'],
      ['sorted(arr) 后二分查找 k 次', 'O(n log n + k log n)', '排序主导，查找便宜'],
      ['for i in range(n): for j in range(n): for k in range(n): …', 'O(n³)', '三层独立循环相乘'],
      ['递归 fib(n) 不带记忆', 'O(2^n)', '每层分两支，深度 n'],
      ['字典 d[k] 查 n 次', 'O(n)', '哈希单次 O(1)'],
      ['list 里 x in lst 查 n 次', 'O(n²)', '线性查找 × n 次'],
    ];
    const it = pick(items); return { q: `时间复杂度：${it[0]}`, a: it[1], how: it[2] };
  };

  G.g_induction_check = () => {
    const F = [
      ['1 + 2 + … + n', (n) => n * (n + 1) / 2, 'n(n+1)/2', '(k+1)(k+2)/2'],
      ['1² + 2² + … + n²', (n) => n * (n + 1) * (2 * n + 1) / 6, 'n(n+1)(2n+1)/6', '(k+1)(k+2)(2k+3)/6'],
      ['1 + 3 + 5 + … + (2n-1)', (n) => n * n, 'n²', '(k+1)²'],
      ['1 + 2 + 4 + … + 2^n', (n) => Math.pow(2, n + 1) - 1, '2^(n+1) - 1', '2^(k+2) - 1'],
      ['1³ + 2³ + … + n³', (n) => Math.pow(n * (n + 1) / 2, 2), '(n(n+1)/2)²', '((k+1)(k+2)/2)²'],
    ];
    const f = pick(F); const k = ri(3, 8);
    return { q: `归纳法验证 ${f[0]} = ${f[2]}：n = ${k} 时两边各等于多少？由 P(k) 推 P(k+1) 时右边目标是什么？`, a: `两边都 = ${f[1](k)}；目标右边 ${f[3]}，只需证 ${f[2].replace(/n/g, 'k')} + 第 k+1 项 = ${f[3]}`, how: '归纳步只做一件事：老右边 + 新一项 = 新右边，其余不动' };
  };

  // ================= Python / NumPy =================
  const rshape = () => Array.from({ length: ri(1, 3) }, () => pick([1, 1, 2, 3, 4, 5]));
  G.g_broadcast_shape = () => {
    let A = rshape(), B = rshape();
    if (Math.random() < 0.5) { B = A.slice(-ri(1, A.length)).map(x => Math.random() < 0.5 ? 1 : x); if (Math.random() < 0.3) B = B.concat([ri(2, 4)]); }
    const n = Math.max(A.length, B.length); const a = Array(n - A.length).fill(1).concat(A), b = Array(n - B.length).fill(1).concat(B);
    const out = []; let ok = true;
    for (let i = 0; i < n; i++) { if (a[i] === b[i] || a[i] === 1 || b[i] === 1) out.push(Math.max(a[i], b[i])); else { ok = false; break; } }
    return { q: `shape (${A.join(',')}) 与 (${B.join(',')}) 相加，结果 shape？`, a: ok ? `(${out.join(',')})` : '不能广播（有一维既不相等也不为 1）', how: '右对齐逐维比：相等或有 1 就取大；缺的维当 1' };
  };

  G.g_reshape = () => {
    const A = [ri(2, 4), ri(2, 4), ri(2, 4)]; const tot = A[0] * A[1] * A[2];
    const d = pick([2, 3, 4, 5, 6, 8]);
    return { q: `np.arange(${tot}).reshape(${A.join(',')}).reshape(-1, ${d}) 的 shape？`, a: tot % d === 0 ? `(${tot / d}, ${d})` : `报错：${tot} 不能被 ${d} 整除`, how: '元素总数不变：-1 = 总数 ÷ 已知维，除不尽就报错' };
  };

  const pyslice = (arr, s, e, st) => {
    const n = arr.length; st = st == null ? 1 : st;
    const norm = (v, def) => { if (v == null) return def; if (v < 0) v += n; return Math.max(st > 0 ? 0 : -1, Math.min(v, st > 0 ? n : n - 1)); };
    let i = norm(s, st > 0 ? 0 : n - 1), j = norm(e, st > 0 ? n : -1); const out = [];
    if (st > 0) for (; i < j; i += st) out.push(arr[i]); else for (; i > j; i += st) out.push(arr[i]);
    return out;
  };
  G.g_slice = () => {
    const n = ri(6, 10); const arr = Array.from({ length: n }, (_, i) => i * pick([1, 1, 2]) + (Math.random() < 0.3 ? 1 : 0));
    const mode = ri(0, 4); let s, e, st, txt;
    if (mode === 0) { s = ri(0, 3); e = ri(s + 1, n); txt = `${s}:${e}`; }
    else if (mode === 1) { s = -ri(2, 4); txt = `${s}:`; }
    else if (mode === 2) { st = -1; txt = '::-1'; }
    else if (mode === 3) { s = ri(0, 2); st = ri(2, 3); txt = `${s}::${st}`; }
    else { s = ri(1, 3); e = -ri(1, 2); st = 2; txt = `${s}:${e}:2`; }
    return { q: `a = [${arr.join(', ')}]，a[${txt}] = ?`, a: `[${pyslice(arr, s, e, st).join(', ')}]`, how: '起点含、终点不含；负数从尾数；步长负则反向走' };
  };

  G.g_list_comp = () => {
    const n = ri(5, 9); const ex = pick([['x*x', x => x * x], ['2*x+1', x => 2 * x + 1], ['x%3', x => x % 3], ['x//2', x => Math.floor(x / 2)]]);
    const k = ri(1, 4); const cond = pick([['', () => true], ['if x%2==0', x => x % 2 === 0], [`if x>${k}`, x => x > k], ['if x%2', x => x % 2 === 1]]);
    const res = []; for (let x = 0; x < n; x++) if (cond[1](x)) res.push(ex[1](x));
    return { q: `[${ex[0]} for x in range(${n}) ${cond[0]}] = ?`, a: `[${res.join(', ')}]`, how: '先按 if 筛 x，再对留下的算表达式；range 不含 n' };
  };

  G.g_dot_shape = () => {
    const mode = ri(0, 3); const m = ri(2, 6), n = ri(2, 6), p = ri(2, 6), b = ri(2, 8);
    if (mode === 0) return { q: `A (${m},${n}) @ B (${n},${p}) 的 shape？`, a: `(${m},${p})`, how: '内维消掉，外维留下' };
    if (mode === 1) { const k = n + pick([1, 2]); return { q: `A (${m},${n}) @ B (${k},${p}) 的 shape？`, a: `报错：内维 ${n} ≠ ${k}`, how: '内维不等直接报 shape mismatch；想要 (m,p) 得转置' }; }
    if (mode === 2) return { q: `x (${n},) @ W (${n},${p}) 的 shape？`, a: `(${p},)`, how: '一维向量当行向量，结果也是一维' };
    return { q: `X (${b},${m},${n}) @ W (${n},${p}) 的 shape？`, a: `(${b},${m},${p})`, how: 'batch 维广播保留，最后两维做矩阵乘' };
  };

  G.g_axis_sum = () => {
    if (Math.random() < 0.5) {
      const r = ri(2, 3), c = ri(2, 3); const A = rmat(r, c, 0, 9); const ax = pick([0, 1]);
      const res = ax === 0 ? A[0].map((_, j) => A.reduce((s, row) => s + row[j], 0)) : A.map(row => row.reduce((s, v) => s + v, 0));
      return { q: `A = ${mat(A)}，A.sum(axis=${ax}) = ?`, a: `[${res.join(', ')}]，shape (${ax === 0 ? c : r},)`, how: 'axis=哪个，哪个维被压掉：0 竖着加（列和），1 横着加（行和）' };
    }
    const S = [ri(2, 8), ri(2, 8), ri(2, 8)]; const ax = ri(0, 2); const kd = Math.random() < 0.5;
    const out = S.map((v, i) => i === ax ? (kd ? 1 : null) : v).filter(v => v !== null);
    return { q: `shape (${S.join(',')}) 做 .mean(axis=${ax}${kd ? ', keepdims=True' : ''})，结果 shape？`, a: `(${out.join(',')})`, how: '删掉 axis 那一维；keepdims 则留成 1，方便再广播回去' };
  };

  G.g_dtype_overflow = () => {
    const mode = ri(0, 2);
    if (mode === 0) { const v = ri(100, 127), k = ri(1, 50); const r = ((v + k + 128) % 256 + 256) % 256 - 128; return { q: `np.int8(${v}) + np.int8(${k}) = ?`, a: `${r}（回绕）`, how: 'int8 范围 -128~127，超过就 -256 回绕' }; }
    if (mode === 1) { const v = ri(0, 20), k = ri(v + 1, 60); return { q: `np.uint8(${v}) - np.uint8(${k}) = ?`, a: String(((v - k) % 256 + 256) % 256), how: 'uint8 无负数，负结果 +256' }; }
    const v = ri(200, 255), k = ri(1, 100); return { q: `np.uint8(${v}) + ${k}（uint8）= ?`, a: String((v + k) % 256), how: '超过 255 就减 256；图像像素加亮最容易踩' };
  };

  // ================= 数据 / ML / DL / 生医 =================
  G.g_groupby = () => {
    const rows = Array.from({ length: ri(5, 7) }, () => [pick(['A', 'B', 'C']), ri(1, 9)]);
    const agg = pick(['sum', 'mean', 'count', 'max']); const g = {};
    rows.forEach(([k, v]) => { (g[k] = g[k] || []).push(v); });
    const res = Object.keys(g).sort().map(k => { const a = g[k]; const v = agg === 'sum' ? a.reduce((s, x) => s + x, 0) : agg === 'mean' ? r3(a.reduce((s, x) => s + x, 0) / a.length) : agg === 'count' ? a.length : Math.max(...a); return `${k}: ${v}`; });
    return { q: `df: ${rows.map(r => `(${r[0]},${r[1]})`).join(' ')}，df.groupby('g').v.${agg}() = ?`, a: res.join('，'), how: '拆-算-合：先按键分堆，每堆各算一次，键排序输出' };
  };

  G.g_split_leak = () => {
    if (Math.random() < 0.5) {
      const n = ri(50, 1000), t = pick([0.1, 0.2, 0.25, 0.3]); const nt = Math.ceil(n * t);
      return { q: `${n} 条样本，train_test_split(test_size=${t})，训练/测试各多少条？`, a: `训练 ${n - nt}，测试 ${nt}`, how: 'sklearn 测试集向上取整 ceil(n×test_size)，训练 = 剩下' };
    }
    const sc = pick([
      ['先对全量数据 StandardScaler.fit，再切分训练/测试', '泄漏：测试集的均值方差进了训练', '任何 fit 只能看训练集'],
      ['切分后只在训练集 fit scaler，再 transform 测试集', '不泄漏', '先切再 fit 是标准姿势'],
      ['同一病人的多次采样随机分到训练和测试', '泄漏：模型记住病人而非规律', '按病人分组切（GroupKFold）'],
      ['用全量数据做特征选择后再交叉验证', '泄漏：特征选择偷看了测试标签', '特征选择放进 pipeline 每折重做'],
      ['时间序列随机打乱切分', '泄漏：用未来预测过去', '按时间切，训练在前测试在后'],
    ]);
    return { q: `是否泄漏：${sc[0]}`, a: sc[1], how: sc[2] };
  };

  G.g_metric = () => {
    const TP = ri(5, 60), FP = ri(1, 30), FN = ri(1, 30), TN = ri(10, 100);
    const p = TP / (TP + FP), r = TP / (TP + FN), f = 2 * p * r / (p + r), acc = (TP + TN) / (TP + FP + FN + TN);
    return { q: `混淆矩阵 TP=${TP} FP=${FP} FN=${FN} TN=${TN}，求 precision / recall / F1 / accuracy`, a: `P=${r3(p)} R=${r3(r)} F1=${r3(f)} Acc=${r3(acc)}`, how: 'P 看预测正的那列，R 看真实正的那行；F1 是两者调和平均，偏向小的那个' };
  };

  G.g_gd_step = () => {
    if (Math.random() < 0.5) {
      const c = ri(-3, 3), a = pick([1, 2, 0.5]), w0 = ri(-5, 5), lr = pick([0.1, 0.2, 0.25, 0.5]);
      const w1 = w0 - lr * 2 * a * (w0 - c), w2 = w1 - lr * 2 * a * (w1 - c);
      return { q: `f(w) = ${a}(w ${sgn(-c)} ${Math.abs(c)})²，w0 = ${w0}，lr = ${lr}，求 w1、w2`, a: `w1 = ${r3(w1)}，w2 = ${r3(w2)}（最优 w* = ${c}）`, how: `w ← w - lr·f'(w)，f' = ${2 * a}(w - ${c})；每步离最优点差距乘 (1 - ${2 * a * lr})` };
    }
    const w = [ri(-3, 3), ri(-3, 3)], g = [ri(-4, 4), ri(-4, 4)], lr = pick([0.1, 0.5, 0.01]);
    return { q: `w = ${vec(w)}，∇L = ${vec(g)}，lr = ${lr}，一步梯度下降后 w = ?`, a: vec(w.map((x, i) => r3(x - lr * g[i]))), how: '逆着梯度走：w - lr·grad，逐分量减' };
  };

  G.g_sigmoid = () => {
    const z = pick([-4, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 4]); const s = 1 / (1 + Math.exp(-z));
    return { q: `σ(${z}) ≈ ?  σ'(${z}) ≈ ?`, a: `σ = ${r3(s)}，σ' = σ(1-σ) = ${r3(s * (1 - s))}`, how: '锚点：σ(0)=.5，σ(1)≈.73，σ(2)≈.88，σ(4)≈.98；σ(-z)=1-σ(z)；导数最大 0.25 在 0' };
  };

  G.g_softmax = () => {
    const z = [ri(-2, 3), ri(-2, 3), ri(-2, 3)]; const m = Math.max(...z); const e = z.map(v => Math.exp(v - m)); const S = e.reduce((a, b) => a + b, 0);
    return { q: `softmax(${vec(z)}) ≈ ?`, a: vec(e.map(v => r3(v / S))), how: '先减最大值防溢出；每差 1 概率比 ≈ 2.7 倍，差 2 ≈ 7.4 倍' };
  };

  G.g_conv_out = () => {
    const H = pick([28, 32, 64, 224]), k = pick([3, 5, 7]), s = pick([1, 2, 2]), p = pick([0, 1, 2, (k - 1) / 2]), cin = pick([1, 3, 16]), cout = pick([8, 16, 32, 64]);
    const o = Math.floor((H + 2 * p - k) / s) + 1;
    return { q: `输入 (${cin}, ${H}, ${H})，Conv2d(${cin}→${cout}, k=${k}, s=${s}, p=${p})，输出 shape？`, a: `(${cout}, ${o}, ${o})`, how: '⌊(H + 2p - k)/s⌋ + 1；p=(k-1)/2 且 s=1 时尺寸不变；通道数只看 out_channels' };
  };

  G.g_param_count = () => {
    if (Math.random() < 0.5) { const i = pick([64, 128, 256, 784]), o = pick([10, 32, 64, 128]); return { q: `nn.Linear(${i}, ${o}) 参数量？`, a: `${i}×${o} + ${o} = ${i * o + o}`, how: '权重 in×out，别忘 bias 加 out' }; }
    const ci = pick([3, 16, 32]), co = pick([16, 32, 64]), k = pick([3, 5]);
    return { q: `nn.Conv2d(${ci}, ${co}, kernel_size=${k}) 参数量？`, a: `${ci}×${co}×${k}×${k} + ${co} = ${ci * co * k * k + co}`, how: 'cin×cout×k×k + cout；与输入图像大小无关' };
  };

  G.g_attention_shape = () => {
    const B = pick([2, 4, 8]), L = pick([16, 32, 128, 512]), d = pick([64, 128, 256, 512]), h = pick([4, 8]);
    const dh = d / h; const mode = ri(0, 2);
    if (mode === 0) return { q: `B=${B} L=${L} d_model=${d} heads=${h}，多头拆分后 Q 的 shape？`, a: `(${B}, ${h}, ${L}, ${dh})`, how: 'd_model 拆成 heads×d_head，再把 heads 换到 L 前面' };
    if (mode === 1) return { q: `B=${B} L=${L} d_model=${d} heads=${h}，注意力分数 QKᵀ 的 shape？`, a: `(${B}, ${h}, ${L}, ${L})，共 ${B * h * L * L} 个数`, how: '每个头一张 L×L 表，序列长度平方是显存大头' };
    return { q: `B=${B} L=${L} d_model=${d} heads=${h}，注意力层最终输出 shape？`, a: `(${B}, ${L}, ${d})`, how: '拼回 heads 后和输入同形，才能残差相加' };
  };

  G.g_dose_response = () => {
    const bottom = pick([0, 0, 5, 10]), top = pick([90, 100, 100, 120]), ec50 = pick([1, 2, 5, 10, 20]), hill = pick([1, 1, 2]);
    const xm = pick([0.25, 0.5, 1, 2, 4, 10]); const x = ec50 * xm;
    const y = bottom + (top - bottom) / (1 + Math.pow(ec50 / x, hill));
    return { q: `4PL：bottom=${bottom}，top=${top}，EC50=${ec50}，Hill=${hill}。剂量 x=${x} 时响应 y ≈ ?`, a: `${r2(y)}（占区间 ${r3(1 / (1 + Math.pow(1 / xm, hill)) * 100)}%）`, how: 'x = EC50 正好一半；Hill=1 时 x=2×EC50 → 2/3，x=4× → 4/5，x=EC50/4 → 1/5；Hill 越大越陡' };
  };

  G.g_survival = () => {
    let n = ri(8, 20); const ev = []; let S = 1; let t = 0;
    const k = ri(2, 4);
    for (let i = 0; i < k && n > 1; i++) {
      t += ri(1, 6); const d = ri(1, Math.min(3, n - 1)); const c = ri(0, Math.min(2, n - d - 1 > 0 ? n - d - 1 : 0));
      S *= (n - d) / n; ev.push(`t=${t}: 风险 ${n}，死亡 ${d}${c ? `，删失 ${c}` : ''}`); n -= d + c;
    }
    return { q: `KM 估计：${ev.join('；')}。S(${t}) = ?`, a: r3(S), how: '每个事件时刻乘一次 (1 - d/n)；删失只减风险人数不减 S' };
  };

  G.g_pk_halflife = () => {
    const C0 = pick([100, 200, 400, 80]), th = pick([2, 3, 4, 6, 8, 12]); const mode = ri(0, 2);
    if (mode === 0) { const t = th * ri(1, 4); return { q: `C0 = ${C0} mg/L，半衰期 ${th} h，${t} h 后浓度？`, a: `${r2(C0 * Math.pow(0.5, t / th))} mg/L`, how: `数半衰期：${t / th} 个，每个 ÷2` }; }
    if (mode === 1) { const t = ri(1, 20); return { q: `C0 = ${C0} mg/L，半衰期 ${th} h，${t} h 后浓度？消除速率常数 k？`, a: `${r2(C0 * Math.pow(0.5, t / th))} mg/L，k = ln2/${th} ≈ ${r3(Math.LN2 / th)} /h`, how: 'C = C0·(1/2)^(t/t½)；k = 0.693/t½' }; }
    const pct = pick([10, 5, 1]); const nh = Math.ceil(Math.log2(100 / pct));
    return { q: `半衰期 ${th} h，多久后浓度降到初始的 ${pct}% 以下？`, a: `${nh} 个半衰期 = ${nh * th} h（精确 ${r2(th * Math.log2(100 / pct))} h）`, how: '5 个半衰期 ≈ 3%，7 个 ≈ 1%；2^10≈1000 → 10 个降千分之一' };
  };
})();
