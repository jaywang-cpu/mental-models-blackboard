// 数理宇宙 · 秒答生成器 第二批（吠陀 16 诀 + 数感补充 + 新大陆进阶）
// 每个 GEN.xxx() 返回 {q, a, how}；答案全部由代码算出，不写死。
// 吠陀部分原文出处：_refs/Microsoft Word - Preface.docx.pdf（页码见 data/refs.js 的 vedic.toc）
window.GEN = window.GEN || {};
(function () {
  const G = window.GEN;
  // ---------- 工具 ----------
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => { const c = arr.slice(); for (let i = c.length - 1; i > 0; i--) { const j = ri(0, i);[c[i], c[j]] = [c[j], c[i]]; } return c; };
  const rN = (x, n) => { const v = Number(x); const s = v.toFixed(n); return s.replace(/\.?0+$/, m => m.indexOf('.') === 0 ? '' : m); };
  const r1 = (x) => rN(x, 1);
  const r2 = (x) => rN(x, 2);
  const r3 = (x) => rN(x, 3);
  const r4 = (x) => rN(x, 4);
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
  const frac = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}`; };
  const nz = (a, b) => { let x = 0; while (x === 0) x = ri(a, b); return x; };
  const pad = (x, w) => String(x).padStart(w, '0');
  const sgn = (x) => (x < 0 ? '-' : '+');
  const sup = (x) => String(x);
  const commas = (n) => n.toLocaleString('en-US');
  const lg2 = (x) => Math.log(x) / Math.LN2;
  const digits = (n) => String(Math.abs(n)).length;
  const drt = (n) => { n = Math.abs(n); return n === 0 ? 0 : 1 + (n - 1) % 9; };
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

  // ============================================================
  // A. 吠陀速算 16 诀专项
  // ============================================================

  // 1. Ekadhikena Purvena「比前一个多一」 — p.9
  G.g_vedic_ekadhikena = () => {
    const mode = ri(0, 2);
    if (mode === 0) {                       // 两位尾5平方
      const a = ri(1, 9), n = 10 * a + 5;
      return {
        q: `${n}² = ?（尾数 5 的平方）`,
        a: `${n * n}（左 ${a}×${a + 1}=${a * (a + 1)}，右接 25）`,
        how: 'Ekadhikena Purvena「比前一个多一」：去掉尾 5，前面的数 ×(自己+1) 写左边，右边固定 25。成立是因为 (10a+5)²=100a(a+1)+25'
      };
    }
    if (mode === 1) {                       // 三位尾5平方
      const P = ri(10, 39), n = 10 * P + 5;
      return {
        q: `${n}² = ?（尾数 5 的平方）`,
        a: `${n * n}（左 ${P}×${P + 1}=${P * (P + 1)}，右接 25）`,
        how: '同一诀对任意位数都成立：前面那一整块 P×(P+1) 接 25，因为 (10P+5)²=100·P(P+1)+25'
      };
    }
    // 补数配对：同前段、末位互补（和为 10）
    const t = ri(2, 12), u = ri(1, 9);
    const a = 10 * t + u, b = 10 * t + (10 - u);
    return {
      q: `${a} × ${b} = ?（前段相同，末位和为 10）`,
      a: `${a * b}（左 ${t}×${t + 1}=${t * (t + 1)}，右 ${u}×${10 - u}=${pad(u * (10 - u), 2)}）`,
      how: 'Ekadhikena 的通用形：前段 t×(t+1) 写左，末位相乘写右（补两位）。因为 (10t+u)(10t+10-u)=100t(t+1)+u(10-u)'
    };
  };

  // 2. Nikhilam navatascaramam Dasatah「全部减 9，末位减 10」 — p.20
  G.g_vedic_nikhilam = () => {
    const k = pick([1, 2, 2, 2, 3]);
    const base = Math.pow(10, k);
    const near = () => {
      const d = ri(1, Math.max(2, Math.floor(base * 0.12)));
      return Math.random() < 0.65 ? base - d : base + d;
    };
    let a = near(), b = near();
    if (a === base) a = base - 1;
    if (b === base) b = base + 1;
    const da = a - base, db = b - base;
    const left = a + db;                 // = b + da
    const right = da * db;
    const prod = a * b;
    let rs = pad(Math.abs(right), k), carry = '';
    if (right >= 0 && right >= base) { carry = `（右边 ${right} 超 ${k} 位，进位 ${Math.floor(right / base)} 到左边）`; rs = pad(right % base, k); }
    if (right < 0) { carry = `（右边为负 ${right}，向左借 1：左 ${left - 1} / 右 ${pad(base + right, k)}）`; rs = pad(base + right, k); }
    return {
      q: `${a} × ${b} = ?（用补数法，基准 ${commas(base)}）`,
      a: `${commas(prod)}｜偏差 ${sgn(da)}${Math.abs(da)} 和 ${sgn(db)}${Math.abs(db)}，左 = ${a}${sgn(db)}${Math.abs(db)} = ${left}，右 = (${da})×(${db}) = ${right}${carry ? ' ' + carry : ''}`,
      how: 'Nikhilam「全部从 9 减、末位从 10 减」：左边 = 一个数加另一个数的偏差（交叉相加，两边等值），右边 = 两偏差相乘补足位数。成立是因为 (B+x)(B+y)=B(B+x+y)+xy'
    };
  };

  // 3. Urdhva-tiryagbhyam「竖直与交叉」 — p.33
  G.g_vedic_urdhva = () => {
    if (Math.random() < 0.55) {
      const a = ri(12, 99), b = ri(12, 99);
      const [a1, a2] = [Math.floor(a / 10), a % 10];
      const [b1, b2] = [Math.floor(b / 10), b % 10];
      const s0 = a2 * b2, s1 = a1 * b2 + a2 * b1, s2 = a1 * b1;
      return {
        q: `${a} × ${b} = ?（竖乘交叉，一行写完）`,
        a: `${a * b}｜三档：个位 ${a2}×${b2}=${s0}，交叉 ${a1}×${b2}+${a2}×${b1}=${s1}，百位 ${a1}×${b1}=${s2}，即 ${s2}|${s1}|${s0} 逐位进位`,
        how: 'Urdhva-tiryagbhyam「竖直与交叉」：右端竖乘、中间交叉相加、左端竖乘，从右往左进位。成立是因为 (10a1+a2)(10b1+b2) 按 10 的幂收项，交叉项就是十位系数'
      };
    }
    const a = ri(102, 999), b = ri(12, 99);
    const [a1, a2, a3] = [Math.floor(a / 100), Math.floor(a / 10) % 10, a % 10];
    const [b1, b2] = [Math.floor(b / 10), b % 10];
    const c0 = a3 * b2, c1 = a2 * b2 + a3 * b1, c2 = a1 * b2 + a2 * b1, c3 = a1 * b1;
    return {
      q: `${a} × ${b} = ?（三位×两位，竖乘交叉）`,
      a: `${a * b}｜四档从右到左：${c0}、${c1}、${c2}、${c3}，逐位进位得 ${a * b}`,
      how: 'Urdhva-tiryagbhyam：把两个数右对齐，每一档取"下标之和相同"的那些乘积加起来，就是该位系数（本质是多项式卷积），再统一进位'
    };
  };

  // 4. Paravartya Yojayet「变号移项」 — p.43
  G.g_vedic_paravartya = () => {
    if (Math.random() < 0.55) {                 // 多项式除以 (x - a)：综合除法
      const a = nz(-5, 5);
      const deg = pick([2, 3, 3]);
      const co = []; for (let i = 0; i <= deg; i++) co.push(i === 0 ? nz(1, 4) : ri(-8, 9));
      const q = [co[0]];
      for (let i = 1; i <= deg; i++) q.push(co[i] + q[i - 1] * a);
      const R = q.pop();
      return {
        q: `用变号移项法做除法：(${fmtPoly(co)}) ÷ (x ${sgn(-a)} ${Math.abs(a)})`,
        a: `商 Q = ${fmtPoly(q)}，余 R = ${R}`,
        how: `Paravartya Yojayet「变号移项」：把除式 x${sgn(-a)}${Math.abs(a)} 的常数变号得 ${a}，然后"落下首项 → 乘 ${a} → 加下一项"一路刷到底，最后一格就是余数。成立是因为 f(x)=(x-${a})Q+R，代 x=${a} 得 R=f(${a})=${R}`
      };
    }
    // 数字除法：除数略大于基准，用变号补数
    const base = 10;
    const d = ri(11, 19), t = d - base;          // 变号得 -t
    const N = ri(120, 980);
    const Q = Math.floor(N / d), R = N % d;
    return {
      q: `${N} ÷ ${d} = ?（商与余数，用变号法）`,
      a: `商 ${Q}，余 ${R}（验算 ${d}×${Q}+${R} = ${d * Q + R}）`,
      how: `Paravartya：除数 ${d} = 10+${t}，把 ${t} 变号成 -${t} 当乘数往下刷（十位落下 → 乘 -${t} → 加个位），比长除法少一次试商。成立是因为 N = 10q+r 中把 10 换成 (${d}-${t}) 展开`
    };
  };

  // 5. Sunyam Samya Samuccaye「相同者即为零」 — p.55
  G.g_vedic_sunyam = () => {
    const mode = ri(0, 2);
    if (mode === 0) {                    // 各项含公因子 x
      let p, q, r, s;
      do { p = ri(2, 12); q = ri(2, 12); r = ri(2, 12); s = ri(2, 12); } while (p + q === r + s);
      return {
        q: `解：${p}x + ${q}x = ${r}x + ${s}x`,
        a: `x = 0`,
        how: 'Sunyam Samyasamuccaye：全部项里共同出现的那个量（这里是 x），既然两边只是它的不同倍数且倍数不等，它只能是 0。成立是因为 (系数差)·x = 0 且系数差 ≠ 0'
      };
    }
    if (mode === 1) {                    // 分子+分母两边相同 → 该式 = 0
      let a, b, c, d;
      do { a = ri(1, 12); b = ri(1, 12); c = ri(1, 12); d = a + b - c; } while (d < 1 || d > 20 || a === c || a === b || 2 * c === a + b || (a + b) % 2 !== 0);
      const x = -(a + b) / 2;
      const L = (x + a) / (x + b), Rr = (x + c) / (x + d);
      return {
        q: `解：(x + ${a})/(x + ${b}) = (x + ${c})/(x + ${d})`,
        a: `x = ${x}（两边同值 ${r3(L)}，右边 ${r3(Rr)}，对上）`,
        how: `Sunyam Samyasamuccaye 的"分子分母之和相同"型：左边 N+D = 2x+${a + b}，右边 N+D = 2x+${c + d}，两者相同 → 令它 = 0 直接得 x = ${x}。成立是因为交叉相乘后差式恰好因式分解出 (N+D)`
      };
    }
    // 两个一次因式积相等
    const degenerate = Math.random() < 0.5;
    let a, b, c, d;
    if (degenerate) {                    // a+b = c+d：x² 和 x 都抵消 → Sunyam 型
      do { a = ri(1, 9); b = ri(1, 9); c = ri(1, 9); d = a + b - c; } while (d < 1 || d > 18 || a * b === c * d || (a === c && b === d) || (a === d && b === c));
    } else {                             // 和不同 → 退化成一次方程，有唯一解
      do { a = ri(1, 9); b = ri(1, 9); c = ri(1, 9); d = ri(1, 9); } while ((a + b) === (c + d));
    }
    const num = c * d - a * b, den = (a + b) - (c + d);
    const xs = den === 0 ? null : num / den;
    const chk = xs === null ? 0 : (xs + a) * (xs + b) - (xs + c) * (xs + d);
    return {
      q: `解：(x + ${a})(x + ${b}) = (x + ${c})(x + ${d})`,
      a: xs === null
        ? `无解（两边"和"都等于 ${a + b}，x² 与 x 全抵消，只剩 ${a * b} = ${c * d} 这个假等式）`
        : `x = ${frac(num, den)}（代回两边之差 = ${r3(chk)}）`,
      how: `展开后 x² 必然抵消，剩 (${a}+${b}-${c}-${d})x = ${c}×${d}-${a}×${b}。Sunyam Samyasamuccaye 的用法：先看两边"和"是否相同（${a + b} vs ${c + d}）—— 相同则一次项也没了，直接判定 x = 0 或无解，根本不用展开`
    };
  };

  // 6. Anurupye - Sunyamanyat「一个成比例，另一个为零」 — p.66
  G.g_vedic_anurupye = () => {
    const k = ri(2, 4);                    // 比例倍数
    const zeroIsX = Math.random() < 0.5;   // 谁为 0
    const b1 = ri(2, 9), c1 = ri(2, 9);
    const b2 = k * b1, c2 = k * c1;        // 成比例的那一列 + 常数列
    let a1 = ri(2, 9), a2 = ri(2, 9);
    while (a2 * b1 === a1 * b2) a2 = ri(2, 9);   // 保证方程独立
    const yv = c1 / b1;
    const eq = zeroIsX
      ? [`${a1}x + ${b1}y = ${c1}`, `${a2}x + ${b2}y = ${c2}`]
      : [`${b1}x + ${a1}y = ${c1}`, `${b2}x + ${a2}y = ${c2}`];
    const ans = zeroIsX ? `x = 0，y = ${frac(c1, b1)}` : `y = 0，x = ${frac(c1, b1)}`;
    const nm = zeroIsX ? 'y' : 'x';
    return {
      q: `解方程组：\n  ${eq[0]}\n  ${eq[1]}`,
      a: `${ans}（代入第二式：${b2}×${r3(yv)} = ${r3(b2 * yv)} = ${c2} ✓）`,
      how: `Anurupye Sunyamanyat「一个成比例，另一个为零」：${nm} 的系数比 ${b1}:${b2} = 1:${k}，常数比 ${c1}:${c2} 也是 1:${k}，说明另一个变量整列被消掉 → 它 = 0。一眼看两列比例，别去消元`
    };
  };

  // 7. Sankalana - Vyavakalanabhyam「和差法」 — p.67
  G.g_vedic_sankalana = () => {
    let a, b;
    do { a = ri(11, 99); b = ri(11, 99); } while (a === b || a === -b);
    const x = nz(-9, 9), y = nz(-9, 9);
    const p = a * x + b * y, q = b * x + a * y;
    const S = x + y, D = x - y;
    return {
      q: `解方程组（系数对称）：\n  ${a}x + ${b}y = ${p}\n  ${b}x + ${a}y = ${q}`,
      a: `x = ${x}，y = ${y}`,
      how: `Sankalana-Vyavakalanabhyam「由加和由减」：两式相加得 ${a + b}(x+y) = ${p + q} → x+y = ${S}；两式相减得 ${a - b}(x-y) = ${p - q} → x-y = ${D}；再一次加减就出 x、y。系数对称时这条永远比消元快`
    };
  };

  // 8. Ekanyunena Purvena「比前一个少一」 — p.71
  G.g_vedic_ekanyunena = () => {
    const k = pick([1, 2, 2, 3]);
    const M = Math.pow(10, k) - 1;                  // 9 / 99 / 999
    const n = ri(2, Math.pow(10, k) - 1);           // 位数 ≤ k，走标准分裂
    const L = n - 1, Rr = Math.pow(10, k) - n;
    const prod = n * M;
    return {
      q: `${n} × ${M} = ?`,
      a: `${commas(prod)}（左 ${n}-1 = ${L}，右 ${commas(Math.pow(10, k))}-${n} = ${pad(Rr, k)}）`,
      how: `Ekanyunena Purvena「比前一个少一」：乘 ${M} 时左边写 n-1，右边写 n 对 ${commas(Math.pow(10, k))} 的补数。成立是因为 n×(10^${k}-1) = (n-1)·10^${k} + (10^${k}-n)`
    };
  };

  // 9. Antyayor Dasakepi「末位和为十」 — p.95
  G.g_vedic_antyayor = () => {
    const twoBlock = Math.random() < 0.4;
    const t = twoBlock ? ri(10, 39) : ri(1, 9);
    const u = ri(1, 9);
    const a = 10 * t + u, b = 10 * t + (10 - u);
    return {
      q: `${a} × ${b} = ?（末位和为 10）`,
      a: `${commas(a * b)}｜左 ${t}×${t + 1} = ${t * (t + 1)}，右 ${u}×${10 - u} = ${pad(u * (10 - u), 2)}`,
      how: `Antyayor Dasakepi「末位凑十」+ Ekadhikena：前段不变、末位和为 10 时，左边取前段 ×(前段+1)，右边取两末位乘积补两位。成立是因为 (10t+u)(10t+10-u) = 100·t(t+1) + u(10-u)`
    };
  };

  // 10. Yavadunam Tavadunikrtya Varganca Yojayet「差多少就减多少，再补上差的平方」 — p.88
  G.g_vedic_yavadunam = () => {
    const k = pick([1, 2, 2, 3]);
    const base = Math.pow(10, k);
    const dev = pick([-1, 1]) * ri(1, Math.max(2, Math.floor(base * 0.12)));
    const n = base + dev;
    const left = n + dev, right = dev * dev;
    let note = '', rs = pad(right, k);
    if (right >= base) { note = `（右边 ${right} 超 ${k} 位，进位 ${Math.floor(right / base)}）`; rs = pad(right % base, k); }
    return {
      q: `${n}² = ?（基准 ${commas(base)}）`,
      a: `${commas(n * n)}｜偏差 ${sgn(dev)}${Math.abs(dev)}：左 = ${n}${sgn(dev)}${Math.abs(dev)} = ${left}，右 = ${Math.abs(dev)}² = ${right}${note}`,
      how: `Yavadunam「差多少就再减多少，旁边写上差的平方」：偏差 d = ${dev}，左写 n+d，右写 d²（补 ${k} 位）。成立是因为 (B+d)² = B(B+2d) + d²`
    };
  };

  // 11. Dwandwa-yoga（Duplex 二元组合）— 平方 / 开方直觉
  const duplex = (ds) => {
    let s = 0, i = 0, j = ds.length - 1;
    while (i < j) { s += 2 * ds[i] * ds[j]; i++; j--; }
    if (i === j) s += ds[i] * ds[i];
    return s;
  };
  G.g_vedic_dwandwa = () => {
    if (Math.random() < 0.6) {
      const n = ri(101, 9999);
      const ds = String(n).split('').map(Number);
      const parts = [];
      // duplex 链：从右往左取后缀，再从左往右取前缀（标准 duplex 平方展开）
      for (let L = 1; L <= ds.length; L++) parts.push({ seg: ds.slice(ds.length - L).join(''), D: duplex(ds.slice(ds.length - L)) });
      for (let L = ds.length - 1; L >= 1; L--) parts.push({ seg: ds.slice(0, L).join(''), D: duplex(ds.slice(0, L)) });
      const chain = parts.map(p => p.D);
      // 由 duplex 链按位进位还原平方，作为自检
      let carry = 0, out = [];
      for (let i = chain.length - 1; i >= 0; i--) { const v = chain[i] + carry; out.unshift(v % 10); carry = Math.floor(v / 10); }
      while (carry > 0) { out.unshift(carry % 10); carry = Math.floor(carry / 10); }
      const rebuilt = Number(out.join('')) || 0;
      return {
        q: `用 duplex（二元组合）求 ${n}²，并写出 D(${n})`,
        a: `${n}² = ${commas(n * n)}；D(${n}) = ${duplex(ds)}｜duplex 链（从右到左）：${chain.join(', ')}，逐位进位还原 = ${commas(rebuilt)}`,
        how: 'Dwandwa-yoga：D(a)=a²，D(ab)=2ab，D(abc)=2ac+b²，即"首尾配对乘 2，正中间取平方"。平方 = 各个后缀/前缀的 duplex 排成一行再进位，成立是因为 duplex 就是平方展开里同次幂那一档的系数'
      };
    }
    const r = ri(12, 316), sq = r * r;
    const dg = digits(sq);
    const rootDigits = Math.ceil(dg / 2);
    const lead = Number(String(sq).slice(0, dg % 2 === 0 ? 2 : 1));
    const lo = Math.floor(Math.sqrt(lead));
    const last = sq % 10;
    const endMap = { 0: '0', 1: '1 或 9', 4: '2 或 8', 5: '5', 6: '4 或 6', 9: '3 或 7' };
    return {
      q: `${commas(sq)} 是完全平方数，先估出根的位数、首位和末位候选，再给出根`,
      a: `根有 ${rootDigits} 位，首位 ${lo}，末位候选 ${endMap[last]}，根 = ${r}`,
      how: 'Dwandwa 的开方直觉：两位一组数出根的位数；最左一组开方定首位；平方末位只可能是 0/1/4/5/6/9，反查末位候选，再用 duplex 逐位定'
    };
  };

  // 12. Navasesa（数字根 / 弃九验算）
  G.g_vedic_digitsum = () => {
    const op = pick(['+', '-', '×', '×', '+']);
    let a = ri(123, 98765), b = ri(123, 9876);
    if (op === '-' && b > a) [a, b] = [b, a];
    const truth = op === '+' ? a + b : op === '-' ? a - b : a * b;
    const da = drt(a), db = drt(b);
    const m9 = (x) => { const v = ((x % 9) + 9) % 9; return v === 0 ? 9 : v; };
    const expect = m9(op === '+' ? da + db : op === '-' ? da - db : da * db);
    const wrong = Math.random() < 0.5;
    let shown = truth;
    if (wrong) {                       // 制造一个九余数能抓到的错（改动量不是 9 的倍数）
      let delta = 0; while (delta === 0 || delta % 9 === 0) delta = nz(-40, 40);
      shown = truth + delta;
    }
    const ds = drt(Math.abs(shown));
    const ok = ds === expect;
    return {
      q: `弃九验算：有人算出 ${commas(a)} ${op} ${commas(b)} = ${commas(shown)}，这个答案能通过九余数检验吗？`,
      a: `${ok ? '能通过' : '通不过，一定错'}｜左边数字根 ${da} ${op} ${db} → 应为 ${expect}，给出的答案数字根 = ${ds}${ok && wrong ? '（碰巧同余，但仍是错的：真值 ' + commas(truth) + '）' : ''}${!wrong ? '' : ok ? '' : '（真值 ' + commas(truth) + '）'}`,
      how: 'Navasesa 弃九法：数字根 = 模 9 余数，而 mod 9 对加减乘都保持，所以两边数字根必须一致。不一致 → 必错；一致 → 只是没抓到（差 9 的倍数会漏网），它是筛子不是证明'
    };
  };

  // ============================================================
  // B. 数感补充
  // ============================================================

  G.g_frac_decimal = () => {
    const tbl = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
    [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8], [1, 9], [1, 12], [5, 12], [1, 16], [3, 16], [1, 20], [1, 25], [1, 40]];
    const [n, d] = pick(tbl);
    const v = n / d;
    const mode = ri(0, 2);
    const dec = Number.isInteger(v * 1000000) ? String(v) : v.toFixed(4).replace(/0+$/, '') + '…';
    const pct = Number.isInteger(v * 10000) ? r3(v * 100) + '%' : r2(v * 100) + '…%';
    if (mode === 0) return { q: `${n}/${d} 的小数和百分比？`, a: `${dec}，${pct}`, how: '记住 1/8=.125 这条脊：1/2 .5、1/4 .25、1/8 .125、1/16 .0625 一路减半；1/3 .333、1/6 .1667、1/12 .0833 一路减半' };
    if (mode === 1) return { q: `${pct} 化成最简分数？`, a: `${frac(n, d)}`, how: '百分比 → 分母 100 再约分；见到 .125/.375/.625/.875 直接想八分之几，见到 .333/.667 想三分之几' };
    const x = pick([80, 120, 240, 360, 480, 600, 800]);
    return { q: `${n}/${d} × ${x} = ?（即 ${pct} of ${x}）`, a: `${r3(v * x)}`, how: `分数比百分比好算：先 ÷${d} 再 ×${n}（${x}÷${d}=${r3(x / d)}），别去乘小数` };
  };

  G.g_ratio_scale = () => {
    const mode = ri(0, 2);
    if (mode === 0) {                         // C1V1 = C2V2
      const C1 = pick([10, 100, 1000, 5, 50, 20]);
      const unit = pick(['mM', 'µM', 'mg/mL', 'X']);
      const fold = pick([5, 10, 20, 25, 50, 100, 200]);
      const C2 = C1 / fold;
      const V2 = pick([100, 200, 500, 1000, 1500, 5000]);
      const V1 = C2 * V2 / C1;
      return {
        q: `母液 ${C1} ${unit}，要配 ${V2} µL 的 ${r3(C2)} ${unit} 工作液，取母液多少、加稀释剂多少？`,
        a: `母液 ${r2(V1)} µL，稀释剂 ${r2(V2 - V1)} µL（${fold} 倍稀释）`,
        how: 'C1V1 = C2V2：先算倍数 = C1/C2，取的体积就是终体积 ÷ 倍数，剩下的补稀释剂。别把"1:N 稀释"和"N 倍稀释"搞混'
      };
    }
    if (mode === 1) {                         // 连续稀释
      const per = pick([2, 5, 10]);
      const steps = ri(3, 6);
      const C0 = pick([1000, 100, 500, 10]);
      const unit = pick(['µM', 'ng/mL', 'µg/mL']);
      const Cn = C0 / Math.pow(per, steps);
      return {
        q: `${C0} ${unit} 起始，每步 ${per} 倍连续稀释 ${steps} 次，最后一管浓度？共跨几个 log10？`,
        a: `${Cn < 0.001 ? Cn.toExponential(3) : r4(Cn)} ${unit}，跨 ${r2(steps * Math.log10(per))} 个 log10`,
        how: '连续稀释是指数：总倍数 = 每步倍数^步数。做剂量曲线要覆盖 EC50 上下各两个 log，所以 10 倍梯度只要 5~6 管'
      };
    }
    const a = ri(2, 9), b = ri(2, 9), tot = pick([120, 200, 250, 400, 500, 900, 1000]);
    const g = gcd(a, b), sum = a + b;
    const pa = tot * a / sum, pb = tot * b / sum;
    return {
      q: `按 ${a / g}:${b / g} 的比例把 ${tot} mL 分成两份，各多少？其中第一份占百分之几？`,
      a: `${r2(pa)} mL 和 ${r2(pb)} mL，第一份占 ${r2(a / sum * 100)}%`,
      how: '比例题先把"份数总和"当分母：每份 = 总量 ÷ (a+b)，再各乘自己的份数。比 ≠ 分数，a:b 的 a 对应的是 a/(a+b)'
    };
  };

  G.g_unit_prefix = () => {
    const P = [['p', -12, '皮'], ['n', -9, '纳'], ['µ', -6, '微'], ['m', -3, '毫'], ['', 0, ''], ['k', 3, '千'], ['M', 6, '兆'], ['G', 9, '吉']];
    const unit = pick(['L', 'g', 'm', 'mol', 'Hz', 'B']);
    let i = ri(0, P.length - 1), j = ri(0, P.length - 1);
    while (i === j) j = ri(0, P.length - 1);
    const val = pick([1, 1.5, 2, 2.5, 5, 7.5, 25, 250, 3, 40]);
    const e = P[i][1] - P[j][1];
    const out = val * Math.pow(10, e);
    const fmt = (x) => (Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0)) ? x.toExponential(3).replace(/e/, '×10^').replace('+', '') : r4(x);
    return {
      q: `${val} ${P[i][0]}${unit} = ? ${P[j][0]}${unit}`,
      a: `${fmt(out)} ${P[j][0]}${unit}（差 10^${e}）`,
      how: `词头就是 10 的幂：p n µ m 是 -12 -9 -6 -3，k M G 是 +3 +6 +9，每档差 1000。换算 = 原值 × 10^(源指数 - 目标指数)；这里 ${P[i][1]} - ${P[j][1]} = ${e}。方向记反就差 10^${Math.abs(2 * e)}`
    };
  };

  G.g_sci_notation = () => {
    const op = pick(['+', '-', '×', '÷']);
    const a = ri(11, 99) / 10, m = ri(-9, 12);
    const b = ri(11, 99) / 10, n = ri(-9, 12);
    const A = a * Math.pow(10, m), B = b * Math.pow(10, n);
    let res, how;
    if (op === '×') { res = A * B; how = `乘法：尾数相乘 ${a}×${b} = ${r2(a * b)}，指数相加 ${m}+${n} = ${m + n}，尾数 ≥10 就再进一位`; }
    else if (op === '÷') { res = A / B; how = `除法：尾数相除 ${a}÷${b} = ${r3(a / b)}，指数相减 ${m}-${n} = ${m - n}，尾数 <1 就借一位`; }
    else {
      const big = Math.max(m, n), gap = Math.abs(m - n);
      res = op === '+' ? A + B : A - B;
      how = `加减必须先对齐指数：把小的那个搬到 10^${big}（差 ${gap} 个数量级${gap >= 3 ? '，小的那个基本可以直接忽略' : ''}），再加减尾数。指数不对齐就加是最常见的错`;
    }
    const ex = res === 0 ? '0' : (Math.abs(res) >= 1e5 || Math.abs(res) < 1e-3 ? res.toExponential(3).replace('e', '×10^').replace('+', '') : r4(res));
    return { q: `(${a}×10^${m}) ${op} (${b}×10^${n}) = ?（写成科学计数法）`, a: ex, how };
  };

  G.g_compare_frac = () => {
    let a, b, c, d;
    do {
      a = ri(2, 30); b = ri(3, 40); c = ri(2, 30); d = ri(3, 40);
    } while (a * d === b * c || (a === c && b === d) || Math.abs(a / b - c / d) > 0.35);
    const L = a * d, R = c * b;
    const bigger = L > R ? `${a}/${b}` : `${c}/${d}`;
    return {
      q: `比大小：${a}/${b} 和 ${c}/${d}`,
      a: `${bigger} 更大（交叉乘 ${a}×${d} = ${L} vs ${c}×${b} = ${R}；小数 ${r4(a / b)} vs ${r4(c / d)}）`,
      how: '交叉相乘：a/b 与 c/d 比，只比 a·d 与 c·b（分母同为正才成立）。更快的两招：都跟 1/2 或 1 比一刀切；分子分母都接近时比"差值/分母"'
    };
  };

  G.g_approx_sqrt = () => {
    const n = ri(11, 999) + (Math.random() < 0.4 ? 0.5 : 0);
    const lo = Math.floor(Math.sqrt(n)), hi = lo + 1;
    const lin = lo + (n - lo * lo) / (2 * lo);      // 一阶近似
    const truth = Math.sqrt(n);
    return {
      q: `估 √${n} 到一位小数`,
      a: `≈ ${r1(truth)}（真值 ${r3(truth)}）`,
      how: `夹逼 + 线性插：${lo}² = ${lo * lo} ≤ ${n} ≤ ${hi * hi} = ${hi}²，取 √n ≈ ${lo} + (${r2(n - lo * lo)})/(2×${lo}) = ${r3(lin)}。这是牛顿一步，永远略偏大`
    };
  };

  G.g_log_estimate = () => {
    const mode = ri(0, 2);
    const lgTbl = { 2: 0.301, 3: 0.477, 4: 0.602, 5: 0.699, 6: 0.778, 7: 0.845, 8: 0.903, 9: 0.954 };
    if (mode === 0) {
      const m = ri(1, 9), k = ri(-6, 12);
      const v = m * Math.pow(10, k);
      return {
        q: `log10(${m}×10^${k}) ≈ ?`,
        a: `${r3(Math.log10(v))}`,
        how: `拆成 整数部分 + lg(尾数)：${k} + lg${m} ≈ ${k} + ${lgTbl[m] || 0} 。要背的只有 lg2≈.30、lg3≈.48、lg7≈.85，其余靠 lg4=2lg2、lg5=1-lg2、lg6=lg2+lg3、lg8=3lg2、lg9=2lg3`
      };
    }
    if (mode === 1) {
      const v = pick([2, 5, 10, 20, 50, 100, 1000, 1e4, 1e6, 0.1, 0.01, 3, 7]);
      return {
        q: `ln(${v}) ≈ ?`,
        a: `${r3(Math.log(v))}`,
        how: 'ln x = 2.303 × lg x。锚点：ln2≈0.69、ln10≈2.30、ln100≈4.61；半衰期常数 k = ln2/t½ 就来自这里'
      };
    }
    const n = pick([16, 32, 100, 256, 1000, 1024, 4096, 1e6, 65536]);
    return {
      q: `log2(${commas(n)}) ≈ ?`,
      a: `${r3(lg2(n))}`,
      how: '2^10 ≈ 10^3 是万能桥：log2 x ≈ 10/3 × lg x ≈ 3.32 × lg x。log2(1000)≈10、log2(10^6)≈20，二分/熵/复杂度全靠这一条'
    };
  };

  G.g_time_speed = () => {
    const mode = ri(0, 2);
    if (mode === 0) {
      const rate = pick([0.5, 1, 1.5, 2, 2.5, 4, 5]);          // mL/min
      const vol = pick([15, 30, 50, 100, 250, 500, 1000]);
      const t = vol / rate;
      return {
        q: `流速 ${rate} mL/min，跑完 ${vol} mL 要多久？（给分钟和小时）`,
        a: `${r2(t)} min = ${r2(t / 60)} h`,
        how: `时间 = 量 ÷ 速率。心算先把速率凑成 1 或 10：本题 ÷${rate} 等价于 ×${r3(1 / rate)}；除以 60 才是小时，别只算分钟就下结论`
      };
    }
    if (mode === 1) {
      const v = pick([40, 60, 72, 80, 90, 100, 120]);           // km/h
      const d = pick([15, 30, 45, 60, 90, 150, 240, 300]);
      const t = d / v * 60;
      return {
        q: `以 ${v} km/h 走 ${d} km，要多少分钟？`,
        a: `${r1(t)} min（${r2(t / 60)} h）`,
        how: `速度换"每分钟多少"最快：${v} km/h = ${r3(v / 60)} km/min，时间 = 距离 ÷ 它。60 km/h = 1 km/min 是所有速度题的锚`
      };
    }
    const n = pick([24, 48, 96, 384]);                          // 孔数
    const sec = pick([3, 4, 5, 6, 8]);
    const tot = n * sec;
    return {
      q: `${n} 个孔，每孔操作 ${sec} 秒，全程多久？如果换 8 道移液器（一次 8 孔）呢？`,
      a: `单道 ${tot} s = ${r1(tot / 60)} min；8 道 ${r1(tot / 8)} s = ${r2(tot / 480)} min（快 8 倍）`,
      how: '总时间 = 单次 × 次数；并行只改"次数"不改"单次"。先估量级再决定要不要换工具，这就是 Amdahl 在实验台上的样子'
    };
  };

  // ============================================================
  // C. 进阶（新大陆）
  // ============================================================

  G.g_convex_check = () => {
    const F = [
      { s: 'f(x) = x²', f: x => x * x, dom: [-3, 3] },
      { s: 'f(x) = -x²', f: x => -x * x, dom: [-3, 3] },
      { s: 'f(x) = x³', f: x => x * x * x, dom: pick([[1, 4], [-4, -1], [-2, 2]]) },
      { s: 'f(x) = e^x', f: x => Math.exp(x), dom: [-2, 2] },
      { s: 'f(x) = ln x', f: x => Math.log(x), dom: [0.5, 5] },
      { s: 'f(x) = 1/x', f: x => 1 / x, dom: [0.5, 4] },
      { s: 'f(x) = √x', f: x => Math.sqrt(x), dom: [0.5, 9] },
      { s: 'f(x) = |x|', f: x => Math.abs(x), dom: [-2, 2] },
      { s: 'f(x) = x⁴', f: x => x ** 4, dom: [-2, 2] },
      { s: 'f(x) = sin x', f: x => Math.sin(x), dom: pick([[0.2, 2.9], [-2.9, -0.2], [-2, 2]]) },
      { s: 'f(x) = log(1 + e^x)（softplus）', f: x => Math.log(1 + Math.exp(x)), dom: [-3, 3] },
      { s: 'f(x) = max(0, x)（ReLU）', f: x => Math.max(0, x), dom: [-2, 2] },
      { s: 'f(x) = ' + nz(-5, 5) + 'x + ' + nz(-5, 5) + '（仿射）', f: null, dom: [-3, 3], affine: true },
      { s: 'f(x) = x·ln x', f: x => x * Math.log(x), dom: [0.2, 3] },
      { s: 'f(x) = -ln x', f: x => -Math.log(x), dom: [0.5, 5] }
    ];
    const c = pick(F);
    let verdict, why;
    if (c.affine) { verdict = '既凸又凹（仿射函数）'; }
    else {
      const [lo, hi] = c.dom; const h = (hi - lo) / 400;
      let pos = false, neg = false;
      for (let i = 1; i < 60; i++) {
        const x = lo + (hi - lo) * i / 60;
        const d2 = (c.f(x + h) - 2 * c.f(x) + c.f(x - h)) / (h * h);
        if (!isFinite(d2)) continue;
        if (d2 > 1e-3) pos = true; if (d2 < -1e-3) neg = true;
      }
      verdict = pos && neg ? '都不是（在这个区间上有拐点）' : pos ? '凸（convex）' : neg ? '凹（concave）' : '既凸又凹（二阶导恒为 0）';
    }
    return {
      q: `${c.s}，在 x ∈ [${c.dom[0]}, ${c.dom[1]}] 上是凸还是凹？`,
      a: verdict,
      how: '判凸三把刀：① f″ ≥ 0 就是凸；② 图上任意两点连线在函数上方；③ 凸函数的局部最优 = 全局最优（所以损失函数凸不凸决定了梯度下降能不能信）。区间跨拐点就两者都不是'
    };
  };

  G.g_lr_step = () => {
    const a = pick([0.5, 1, 2, 3, 5]);                 // f = a(x - c)²
    const c = ri(-4, 4);
    const x0 = ri(-8, 8) + (Math.random() < 0.5 ? 0.5 : 0);
    const lr = pick([0.01, 0.05, 0.1, 0.2, 0.3, 0.5, 0.6, 1 / (2 * a), 1.2 / (2 * a)]);
    const grad = 2 * a * (x0 - c);
    const x1 = x0 - lr * grad;
    const mult = 1 - 2 * a * lr;                       // 误差每步的收缩因子
    const state = Math.abs(mult) < 1e-12 ? '一步直达最优' : Math.abs(mult) < 1 ? (mult < 0 ? '收敛（但会来回振荡）' : '单调收敛') : Math.abs(mult) === 1 ? '不收敛（原地打转）' : '发散';
    const lrMax = 1 / a;
    let x = x0; for (let i = 0; i < 5; i++) x = x - lr * 2 * a * (x - c);
    return {
      q: `f(x) = ${a}(x ${sgn(-c)} ${Math.abs(c)})²，从 x = ${x0} 出发，lr = ${r3(lr)}。走一步到哪？会收敛吗？`,
      a: `∇f = ${r3(grad)}，x₁ = ${r3(x1)}；收缩因子 1-2·${a}·lr = ${r3(mult)} → ${state}（再走 5 步到 ${Math.abs(x) > 1e6 ? x.toExponential(2) : r3(x)}，最优 x* = ${c}）`,
      how: `二次函数上梯度下降就是误差乘一个常数：e ← (1 - 2a·lr)·e。所以 |1-2a·lr| < 1 才收敛，即 lr < 1/a = ${r3(lrMax)}；lr = 1/(2a) 一步到位，超过 1/a 直接炸。这就是"lr 调大就跑飞/溢出"的全部原因`
    };
  };

  const H = (ps) => -ps.reduce((s, p) => s + (p > 0 ? p * lg2(p) : 0), 0);
  G.g_entropy_bits = () => {
    const kinds = [
      () => { const n = pick([2, 4, 8, 16]); return { d: Array(n).fill(1 / n), s: `${n} 个等概率结果` }; },
      () => { const p = pick([0.1, 0.2, 0.25, 0.3, 0.5, 0.8, 0.9, 0.99]); return { d: [p, 1 - p], s: `两个结果，概率 ${p} / ${r2(1 - p)}` }; },
      () => { const a = pick([1, 2, 3]), b = pick([1, 2, 3]), c = pick([1, 2, 4]); const t = a + b + c; return { d: [a / t, b / t, c / t], s: `三个结果，概率 ${frac(a, t)}, ${frac(b, t)}, ${frac(c, t)}` }; },
      () => { return { d: [0.5, 0.25, 0.125, 0.125], s: '四个结果，概率 1/2, 1/4, 1/8, 1/8' }; }
    ];
    const k = pick(kinds)();
    const h = H(k.d);
    const maxh = lg2(k.d.length);
    const lens = k.d.map(p => Math.ceil(-lg2(p)));
    return {
      q: `${k.s}，熵是多少 bit？平均最少要几位编码？`,
      a: `H = ${r3(h)} bit（上限 log2(${k.d.length}) = ${r3(maxh)}），理想码长 -log2 p 分别为 ${k.d.map(p => r2(-lg2(p))).join(', ')} bit`,
      how: 'H = Σ p·log2(1/p)：一个概率 p 的事件"值" log2(1/p) 比特，熵就是这些惊讶度的加权平均。等概率时熵最大 = log2 n；越偏斜越可压缩，霍夫曼码长就贴着 -log2 p 走'
    };
  };

  G.g_kl_div = () => {
    const n = pick([2, 2, 3]);
    const mk = () => { const w = Array.from({ length: n }, () => ri(1, 9)); const t = w.reduce((a, b) => a + b, 0); return w.map(x => x / t); };
    let P = mk(), Q = mk();
    while (P.every((p, i) => Math.abs(p - Q[i]) < 1e-9)) Q = mk();
    const kl = (A, B) => A.reduce((s, p, i) => s + (p > 0 ? p * Math.log(p / B[i]) : 0), 0);
    const pq = kl(P, Q), qp = kl(Q, P);
    const f = (v) => v.map(x => r3(x)).join(', ');
    return {
      q: `P = (${f(P)})，Q = (${f(Q)})，求 KL(P‖Q)（nat 和 bit），并和 KL(Q‖P) 比`,
      a: `KL(P‖Q) = ${r4(pq)} nat = ${r4(pq / Math.LN2)} bit；KL(Q‖P) = ${r4(qp)} nat（${Math.abs(pq - qp) < 1e-9 ? '恰好相等' : pq > qp ? '前者更大' : '后者更大'}）`,
      how: 'KL(P‖Q) = Σ p·log(p/q)：拿 Q 当模型去编码真分布 P，每个样本多花的比特数。永远 ≥ 0，P=Q 才为 0；不对称，所以"前向 KL 摊平、反向 KL 抓峰"，VAE 和变分推断的行为差别就在这'
    };
  };

  G.g_mutual_info = () => {
    let w;
    do { w = [ri(1, 9), ri(1, 9), ri(1, 9), ri(1, 9)]; } while (w.reduce((a, b) => a + b, 0) < 8);
    const T = w.reduce((a, b) => a + b, 0);
    const p = w.map(x => x / T);                      // p00 p01 p10 p11
    const px = [p[0] + p[1], p[2] + p[3]];
    const py = [p[0] + p[2], p[1] + p[3]];
    let I = 0;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const pij = p[i * 2 + j];
      if (pij > 0) I += pij * lg2(pij / (px[i] * py[j]));
    }
    const Hx = H(px), Hy = H(py);
    return {
      q: `2×2 联合分布（计数）X=0,Y=0: ${w[0]}；X=0,Y=1: ${w[1]}；X=1,Y=0: ${w[2]}；X=1,Y=1: ${w[3]}（共 ${T}）。求互信息 I(X;Y)`,
      a: `I(X;Y) = ${r4(I)} bit｜H(X) = ${r3(Hx)}，H(Y) = ${r3(Hy)}，H(Y|X) = ${r3(Hy - I)}，独立性${I < 0.01 ? '基本成立' : '不成立'}`,
      how: 'I = Σ p(x,y)·log2[p(x,y)/(p(x)p(y))] = H(Y) - H(Y|X)：知道 X 之后关于 Y 的不确定性少了几比特。独立 ⇔ I = 0；I ≤ min(H(X),H(Y))。决策树的 information gain 就是它'
    };
  };

  G.g_fft_bin = () => {
    const fs = pick([100, 250, 1000, 8000, 16000, 44100, 48000]);
    const N = pick([64, 128, 256, 512, 1024, 2048, 4096]);
    const df = fs / N, T = N / fs;
    const mode = ri(0, 2);
    if (mode === 0) return {
      q: `采样率 ${commas(fs)} Hz，做 ${N} 点 FFT：频率分辨率是多少？采集时长多久？`,
      a: `Δf = ${commas(fs)}/${N} = ${r4(df)} Hz，时长 T = ${r4(T)} s（Δf = 1/T）`,
      how: '分辨率只由"看了多久"决定：Δf = fs/N = 1/T。想分辨更近的两个峰只能拉长采集时间，补零只是插值不增加真分辨率'
    };
    if (mode === 1) {
      const k = ri(1, N / 2 - 1);
      return {
        q: `采样率 ${commas(fs)} Hz，${N} 点 FFT，第 k = ${k} 个 bin 对应什么频率？`,
        a: `f = k·fs/N = ${k}×${r4(df)} = ${r3(k * df)} Hz（Nyquist ${commas(fs / 2)} Hz 在 k = ${N / 2}）`,
        how: 'bin k ↔ 频率 k·fs/N，k 从 0（直流）到 N/2（Nyquist），后一半是负频率的镜像。所以有用的 bin 只有 N/2+1 个'
      };
    }
    const f = Math.round((ri(1, Math.floor(fs / 2 - 1)) * 100)) / 100;
    const kb = f / df;
    return {
      q: `采样率 ${commas(fs)} Hz，${N} 点 FFT，${f} Hz 的能量落在第几个 bin？`,
      a: `k = f/Δf = ${f}/${r4(df)} = ${r3(kb)}${Number.isInteger(Math.round(kb * 1000) / 1000) ? '（正好整数，无泄漏）' : `（非整数 → 落在 ${Math.floor(kb)} 与 ${Math.ceil(kb)} 之间，会有频谱泄漏，要加窗）`}`,
      how: 'k = f·N/fs。落不到整数 bin 上就说明这个频率在窗内不是整周期，能量会漏到邻近 bin —— 加汉宁窗压旁瓣，或调 N 让周期对齐'
    };
  };

  G.g_aliasing = () => {
    const fs = pick([100, 200, 500, 1000, 8000]);
    const f = pick([0.3, 0.45, 0.6, 0.8, 1.2, 1.7, 2.3, 3.4]) * fs;
    const fr = Math.round(f * 100) / 100;
    const k = Math.round(fr / fs);
    const alias = Math.abs(fr - k * fs);
    const ok = fr < fs / 2;
    return {
      q: `信号 ${r2(fr)} Hz，采样率 ${commas(fs)} Hz。采到的是什么频率？`,
      a: `${ok ? `${r2(fr)} Hz（未混叠，${r2(fr)} < Nyquist ${fs / 2}）` : `混叠成 ${r2(alias)} Hz（真频 ${r2(fr)} 被折回）`}`,
      how: `Nyquist：fs 必须 > 2f，否则频率被折叠。折叠公式 f_alias = |f - round(f/fs)·fs|（这里 round(${r2(fr)}/${fs}) = ${k}）。抗混叠靠采样前的模拟低通，采完再滤没救`
    };
  };

  G.g_conv_theorem = () => {
    const N = pick([8, 16, 100, 128, 256, 1000, 1024]);
    const M = pick([3, 5, 8, 16, 33, 64]);
    const full = N + M - 1, same = N, valid = N - M + 1;
    let fftN = 1; while (fftN < full) fftN *= 2;
    const direct = N * M, viaFFT = Math.round(3 * fftN * lg2(fftN));
    return {
      q: `长度 ${N} 的信号和长度 ${M} 的核做卷积：full/same/valid 各多长？改成 FFT 相乘要补到几点？`,
      a: `full = ${full}，same = ${same}，valid = ${valid > 0 ? valid : '0（核比信号长）'}；FFT 需补零到 ≥ ${full}，取 2 的幂 = ${fftN}｜直接卷 ≈ ${commas(direct)} 次乘法，FFT 路线 ≈ ${commas(viaFFT)}（${viaFFT < direct ? 'FFT 更划算' : '核太短，直接卷更快'}）`,
      how: '卷积定理：时域卷积 = 频域逐点相乘。长度必须 N+M-1，补零不够就会循环卷积把尾巴绕回开头（wrap-around）。成本 N·M vs 3·L·log2 L，核长到几十以上才值得上 FFT'
    };
  };

  G.g_complex_polar = () => {
    const mode = ri(0, 2);
    const fmtC = (a, b) => `${r3(a)} ${b < 0 ? '-' : '+'} ${r3(Math.abs(b))}i`;
    if (mode === 0) {
      const a = nz(-6, 6), b = nz(-6, 6);
      const r = Math.hypot(a, b), th = Math.atan2(b, a);
      return {
        q: `把 ${fmtC(a, b)} 化成极坐标（模 与 幅角，角度制）`,
        a: `r = ${r3(r)}，θ = ${r2(th * 180 / Math.PI)}°（= ${r3(th)} rad），即 ${r3(r)}∠${r2(th * 180 / Math.PI)}°`,
        how: 'r = √(a²+b²)、θ = atan2(b, a)（一定用 atan2，atan 会丢象限）。极坐标的意义：复数 = 一个"缩放 + 旋转"的指令'
      };
    }
    if (mode === 1) {
      const r = pick([1, 2, 3, 5]), deg = pick([0, 30, 45, 60, 90, 120, 135, 180, 210, 270, 300]);
      const th = deg * Math.PI / 180;
      return {
        q: `${r}∠${deg}° 化成直角坐标 a + bi`,
        a: fmtC(r * Math.cos(th), r * Math.sin(th)),
        how: 'a = r·cosθ，b = r·sinθ（欧拉公式 re^{iθ} = r(cosθ + i sinθ)）。30/45/60 度的 sin cos 要秒答：½、√2/2≈.707、√3/2≈.866'
      };
    }
    const r1v = ri(1, 5), d1 = pick([0, 30, 45, 60, 90, 120, 180]);
    const r2v = ri(1, 5), d2 = pick([0, 30, 45, 60, 90, 150, 270]);
    const rr = r1v * r2v, dd = ((d1 + d2) % 360 + 360) % 360;
    const th = dd * Math.PI / 180;
    return {
      q: `(${r1v}∠${d1}°) × (${r2v}∠${d2}°) = ?（极坐标与直角坐标都给）`,
      a: `${rr}∠${dd}° = ${fmtC(rr * Math.cos(th), rr * Math.sin(th))}`,
      how: '复数乘法 = 模相乘、幅角相加（除法就是模相除、角相减）。所以乘 i 就是逆时针转 90°，滤波器的"相位"全是这么算的'
    };
  };

  G.g_roots_unity = () => {
    const n = ri(3, 12);
    const k = ri(1, n - 1);
    const th = 2 * Math.PI * k / n;
    const deg = 360 * k / n;
    const ord = n / gcd(n, k);
    return {
      q: `${n} 次单位根中的 ω^${k}（ω = e^{2πi/${n}}）：写成 a+bi 与角度，并说出它的阶（几次方回到 1）`,
      a: `${r3(Math.cos(th))} ${Math.sin(th) < 0 ? '-' : '+'} ${r3(Math.abs(Math.sin(th)))}i，角度 ${r3(deg)}°，阶 = ${n}/gcd(${n},${k}) = ${ord}｜全部 ${n} 个根之和 = 0`,
      how: `n 次单位根 = 单位圆上均分的 n 个点，第 k 个在 2πk/n。全部之和为 0（对称抵消，也是 x^n-1 的一次项系数）；ω^k 的阶 = n/gcd(n,k)，gcd = 1 时是本原根。FFT 的蝶形就是在复用这些点`
    };
  };

  G.g_torch_shape = () => {
    const B = pick([1, 2, 8, 32]);
    let C = pick([1, 3]), Hh = pick([28, 32, 64]);
    const lines = [`x: (${B}, ${C}, ${Hh}, ${Hh})`];
    const nl = ri(2, 4);
    let flat = false, feat = 0;
    for (let i = 0; i < nl; i++) {
      if (!flat && (i === nl - 1 && Math.random() < 0.6)) {
        feat = C * Hh * Hh; flat = true; lines.push(`nn.Flatten()`);
        const o = pick([10, 64, 128]); lines.push(`nn.Linear(${feat}, ${o})`); feat = o; break;
      }
      const r = Math.random();
      if (r < 0.6) {
        const co = pick([8, 16, 32, 64]), k = pick([3, 5]), s = pick([1, 1, 2]), p = pick([0, 1, (k - 1) / 2]);
        const o = Math.floor((Hh + 2 * p - k) / s) + 1;
        if (o < 1) { i--; continue; }
        lines.push(`nn.Conv2d(${C}, ${co}, kernel_size=${k}, stride=${s}, padding=${p})`);
        C = co; Hh = o;
      } else {
        const k = pick([2, 2, 3]);
        const o = Math.floor(Hh / k);
        if (o < 1) { i--; continue; }
        lines.push(`nn.MaxPool2d(${k})`); Hh = o;
      }
    }
    const out = flat ? `(${B}, ${feat})` : `(${B}, ${C}, ${Hh}, ${Hh})`;
    return {
      q: `依次通过这些层，输出 shape 是多少？\n  ${lines.join('\n  ')}`,
      a: out,
      how: 'Conv 空间尺寸 ⌊(H+2p-k)/s⌋+1，通道换成 out_channels；MaxPool(k) 就是 ⌊H/k⌋；Flatten 把 C×H×W 压成一维、batch 维永远不动。p=(k-1)/2 且 s=1 时尺寸不变，这是搭网络时唯一要背的组合'
    };
  };

  G.g_pvalue_read = () => {
    const alpha = pick([0.05, 0.05, 0.01]);
    const m = pick([1, 1, 1, 6, 20, 100]);              // 同时做的检验数
    const p = pick([0.0004, 0.003, 0.012, 0.031, 0.048, 0.049, 0.052, 0.07, 0.2, 0.6]);
    const n = pick([6, 8, 12, 30, 60, 200, 1200]);
    const d = pick([0.05, 0.1, 0.2, 0.5, 0.9, 1.5]);    // 观察到的效应量
    const thr = alpha / m;
    const sig = p < thr;
    const notes = [];
    if (m > 1) notes.push(`同时做了 ${m} 个检验，Bonferroni 阈值 = ${alpha}/${m} = ${r4(thr)}`);
    if (sig && d < 0.2 && n >= 200) notes.push(`效应量 d = ${d} 很小，样本 ${n} 大 → 统计显著但可能没有实际意义`);
    if (!sig && n <= 12 && d >= 0.5) notes.push(`n = ${n} 太小、d = ${d} 却不小 → 更可能是功效不足，不能说"没有差异"`);
    if (p > 0.04 && p < 0.06) notes.push('p 贴着阈值，结论对任何一点分析选择都敏感，别硬下结论');
    return {
      q: `p = ${p}，α = ${alpha}，样本量 n = ${n}/组，观察到的效应量 d = ${d}，这一批一共做了 ${m} 个检验。能下什么结论？`,
      a: `${sig ? '在阈值 ' + r4(thr) + ' 下拒绝原假设' : '不能拒绝原假设（≠ 证明没差异）'}｜p ${p < thr ? '<' : '≥'} ${r4(thr)}${notes.length ? '。注意：' + notes.join('；') : ''}`,
      how: 'p 是"若原假设为真，见到这么极端数据的概率"，不是"假设为真的概率"，也不是效应大小。三问：① 多重比较校正了吗（α/m）② 效应量有没有实际意义 ③ 不显著时功效够不够。永远报效应量 + 置信区间，别只报 p'
    };
  };

  G.g_power_n = () => {
    const d = pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2]);
    const alpha = pick([0.05, 0.05, 0.01]);
    const power = pick([0.8, 0.8, 0.9]);
    const za = { 0.05: 1.96, 0.01: 2.576 }[alpha];
    const zb = { 0.8: 0.842, 0.9: 1.282 }[power];
    const nPer = Math.ceil(2 * Math.pow(za + zb, 2) / (d * d));
    const rough = Math.ceil(16 / (d * d));
    return {
      q: `两组比较，效应量 d = ${d}，α = ${alpha}（双侧），要 ${power * 100}% 的功效，每组大概要多少人？`,
      a: `每组 ≈ ${nPer}（共 ${2 * nPer}）｜公式 n = 2(z_{α/2}+z_β)²/d² = 2×(${za}+${zb})²/${d}² = ${r1(2 * Math.pow(za + zb, 2) / (d * d))}`,
      how: `记一条粗算：α=.05、power=.8 时 n ≈ 16/d²（本题给 ${rough}）。核心直觉：样本量与 d² 成反比 —— 效应减半，人数要 4 倍。d 从哪来？预实验或文献，不是拍脑袋`
    };
  };

  G.g_confound = () => {
    // 生成一个分层 2×2×2 表，用数据本身判断是否存在混杂 / 辛普森悖论
    const nSt = 2;
    const strata = [];
    for (let s = 0; s < nSt; s++) {
      const nE = ri(20, 300), nU = ri(20, 300);
      const baseRisk = [0.1, 0.5][s] * (0.6 + Math.random() * 0.8);
      const trueRR = pick([1.0, 1.0, 1.5, 2.0]);
      const rU = Math.min(0.95, baseRisk), rE = Math.min(0.98, baseRisk * trueRR);
      strata.push({ nE, nU, eE: Math.round(nE * rE), eU: Math.round(nU * rU), trueRR });
    }
    // 让暴露与分层变量相关（混杂的来源）：随机放大某层的暴露人数
    const tE = strata.reduce((a, s) => a + s.nE, 0), tU = strata.reduce((a, s) => a + s.nU, 0);
    const cE = strata.reduce((a, s) => a + s.eE, 0), cU = strata.reduce((a, s) => a + s.eU, 0);
    const crude = (cE / tE) / (cU / tU);
    const rrs = strata.map(s => (s.eE / s.nE) / (s.eU / s.nU));
    const spread = Math.max(...rrs) - Math.min(...rrs);
    const conf = rrs.every(r => isFinite(r)) && Math.abs(crude - (rrs[0] + rrs[1]) / 2) / ((rrs[0] + rrs[1]) / 2) > 0.1;
    const emm = spread > 0.5;
    const varName = pick(['年龄段', '病程分期', '实验批次', '中心/医院', '基线体重']);
    const verdict = emm ? `分层 RR 差别大（${r2(rrs[0])} vs ${r2(rrs[1])}）→ 主要是效应修饰（交互），要分层报告，不能合并`
      : conf ? `粗 RR ${r2(crude)} 明显偏离分层 RR（${rrs.map(r => r2(r)).join(' / ')}）→ 存在混杂，必须校正` : `粗 RR ${r2(crude)} 与分层 RR（${rrs.map(r => r2(r)).join(' / ')}）接近 → 该变量在这批数据里不构成明显混杂`;
    return {
      q: `按「${varName}」分两层看暴露与结局：\n  层1：暴露组 ${strata[0].eE}/${strata[0].nE} 发病，非暴露组 ${strata[0].eU}/${strata[0].nU}\n  层2：暴露组 ${strata[1].eE}/${strata[1].nE}，非暴露组 ${strata[1].eU}/${strata[1].nU}\n合并后粗 RR 是多少？「${varName}」是混杂吗？该怎么设计？`,
      a: `粗 RR = ${r3(crude)}；分层 RR = ${rrs.map(r => r3(r)).join('、')}。${verdict}`,
      how: '混杂的三条件：与暴露相关、独立影响结局、不在因果链上（在链上就是中介，不能校正）。识别靠分层：分层 RR 一致但都偏离粗 RR = 混杂（合并可以，需校正）；分层 RR 彼此差很大 = 效应修饰（不许合并）。设计上解决：随机化 > 限制/配对 > 事后分层或回归校正。千万别校正对撞因子，那会造假关联'
    };
  };
})();
