/* 数理宇宙 v3 · 推导层 · al 代数大陆（13 节点）
   旁挂文件，不改动 v1/v2。深化层讲"怎么用"，这里只做两件事：把结论证出来、用代码把它跑出来。
   scratch 全部用 python3 + numpy 2.3 实际跑过，out 是真实输出（seed 固定）。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'al.function_zoo': {
  layers:{
    alg:`增长序 log x ≪ x^n ≪ a^x（a>1）的意思是比值趋于 0：x^n/a^x → 0，等价于 n·ln x − x·ln a → −∞，而这又归结为 ln x / x → 0。函数方程 f(x+y)=f(x)f(y) 的连续解只有 a^x。`,
    geo:`六条曲线画在同一张对数-对数图上：幂函数是直线（斜率 n），指数是向上弯的曲线，对数是趴着的；任何直线最终都被向上弯的曲线超过。`,
    comp:`验证增长序不能靠画到 x=100，1.01^x 在 x≈1e5 之后才超过 x^100。机器比大小一律取 log：比 n·ln x 与 x·ln a。`
  },
  proof:{
    from:`ln x / x → 0 (x→∞)；ln 严格增；a > 1，n > 0`,
    to:`x^n / a^x → 0；ln x / x^n → 0；f(x+y) = f(x)f(y) 连续 ⇒ f(x) = a^x`,
    steps:[
      [`ln(x^n / a^x) = n·ln x − x·ln a = x·(n·ln x / x − ln a)`, `对数把商变差、幂变乘；提出公因子 x`],
      [`x → ∞ 时 n·ln x / x → 0，所以括号 → −ln a < 0，整体 → −∞`, `前提 ln x / x → 0（可由 ln x ≤ 2√x 得到：ln x / x ≤ 2/√x）；a > 1 使 ln a > 0`],
      [`ln 趋于 −∞ 意味着原式 x^n/a^x → 0`, `e^{−∞} = 0；ln 与 exp 互逆`],
      [`ln x / x^n：令 t = x^n，则 ln x / x^n = (1/n)·ln t / t → 0`, `换元后回到同一个基本极限；n > 0 使 t → ∞`],
      [`函数方程：f(x+y) = f(x)f(y)，取 y = 0 得 f(x) = f(x)f(0)，若 f 不恒零则 f(0) = 1`, `方程对所有 x,y 成立，代特殊值是合法的`],
      [`f(x) = f(x/2)² ≥ 0，且若某点 f(x₀)=0 则 f(x) = f(x₀)f(x−x₀) = 0 恒零；排除后 f > 0`, `平方非负；零点会传染到整个实轴`],
      [`令 g = ln f，则 g(x+y) = g(x) + g(y)，连续 ⇒ g(x) = cx（有理数上由归纳得 g(q) = q·g(1)，连续延拓到实数）`, `Cauchy 方程的连续解是线性的：先证整数、再有理、再由连续性取极限`],
      [`所以 f(x) = e^{cx} = a^x，a = e^c`, `指数回去；把 e^c 记为 a`]
    ],
    end:`"指数终胜幂，幂终胜对数"归结为一个极限 ln x / x → 0；"加变乘"这一条性质就唯一锁定了指数函数。认脸的依据是这两个事实。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 1. x^100 vs 1.01^x：在 log 域找交点（第一个 x 使 100 ln x < x ln 1.01）
xs = np.arange(1, 2_000_000, dtype=float)
diff = 100*np.log(xs) - xs*np.log(1.01)
cross = xs[np.where((diff[:-1] > 0) & (diff[1:] <= 0))[0] + 1]
print("crossover x where 1.01^x overtakes x^100:", cross.astype(int))
for x in [1e3, 1e5, 1e6]:
    print(f"x={x:.0e}: 100 ln x={100*np.log(x):.1f}  x ln1.01={x*np.log(1.01):.1f}")
# 2. ln x / x -> 0
for x in [1e2, 1e4, 1e6, 1e8]: print(f"ln(x)/x at {x:.0e} = {np.log(x)/x:.2e}")
# 3. 加变乘 / 乘变加 / 奇偶
x, y = 0.7, 1.9
print("exp: f(x+y)==f(x)f(y):", np.isclose(2**(x+y), 2**x * 2**y), " log: f(xy)==f(x)+f(y):", np.isclose(np.log(x*y), np.log(x)+np.log(y)))
print("odd: sin(-x)==-sin(x):", np.isclose(np.sin(-x), -np.sin(x)), " even: cos(-x)==cos(x):", np.isclose(np.cos(-x), np.cos(x)))`,
    out:`crossover x where 1.01^x overtakes x^100: [117309]
x=1e+03: 100 ln x=690.8  x ln1.01=10.0
x=1e+05: 100 ln x=1151.3  x ln1.01=995.0
x=1e+06: 100 ln x=1381.6  x ln1.01=9950.3
ln(x)/x at 1e+02 = 4.61e-02
ln(x)/x at 1e+04 = 9.21e-04
ln(x)/x at 1e+06 = 1.38e-05
ln(x)/x at 1e+08 = 1.84e-07
exp: f(x+y)==f(x)f(y): True  log: f(xy)==f(x)+f(y): True
odd: sin(-x)==-sin(x): True  even: cos(-x)==cos(x): True`,
    note:`第 1 段在 log 域找交点，对应推导第 1-3 步（差值由正变负）；第 2 段是第 2 步的前提极限；第 3 段是第 5-8 步的函数方程与奇偶性。`
  },
  contrast:[
    {vs:`Big-O 增长阶 di.big_o`, same:`同一个增长序 log ≪ 幂 ≪ 指数`, diff:`函数动物园看的是具体函数的形状与极限；Big-O 是等价类，扔掉常数和低阶项`, when:`建模选形状看动物园；比算法看 Big-O`},
    {vs:`激活函数 dl.activation`, same:`sigmoid、tanh、ReLU 也是"认脸"`, diff:`激活函数是为了非线性与梯度性质挑选的，动物园是自然出现的基本函数`, when:`sigmoid 是 exp 的重排 1/(1+e^{−x})，认出它就知道饱和在哪`},
    {vs:`多项式 al.polynomial`, same:`x^n 是动物园成员`, diff:`多项式是幂的有限线性组合，仍然输给指数；泰勒级数是无限组合才能追上 e^x`, when:`局部近似用多项式；全局增长认指数`}
  ],
  ext:[
    {t:`指数与对数互为反函数的严格推导`, go:'al.exp_log'},
    {t:`极限的定义与基本极限`, go:'ca.limit'},
    {t:`sigmoid、softplus 是 exp 与 log 拼出来的激活函数`, go:'dl.activation'}
  ]
},

'al.exp_log': {
  layers:{
    alg:`定义 e^x 为满足 f' = f、f(0) = 1 的函数，则 e^{x+y} = e^x e^y。ln 是它的反函数，(ln x)' = 1/x。a^x := e^{x ln a}，于是 log_a b = ln b / ln a。`,
    geo:`e^x 的曲线上任意一点，切线斜率等于高度；ln 是把这条曲线沿 y=x 翻过去。换底就是把所有对数曲线看成 ln 曲线的竖直缩放。`,
    comp:`机器只实现 exp 和 log（自然底），a^x 算成 exp(x*log(a))；log2、log10 都是 log(x)/log(2)。这就是为什么 np.power 对非整数指数会返回 nan 当底为负。`
  },
  proof:{
    from:`e^x 是唯一满足 f'(x) = f(x)、f(0) = 1 的函数；反函数求导法则`,
    to:`e^{x+y} = e^x e^y；(ln x)' = 1/x；a^x = e^{x ln a}；log_a b = ln b / ln a；(a^m)^n = a^{mn}`,
    steps:[
      [`固定 y，令 g(x) = e^{x+y} / e^y。则 g'(x) = e^{x+y}/e^y = g(x)，且 g(0) = 1`, `链式法则 (e^{x+y})' = e^{x+y}；除以常数 e^y 不影响"导数等于自身"`],
      [`由唯一性 g(x) = e^x，即 e^{x+y} = e^x e^y`, `满足 f' = f、f(0) = 1 的函数只有一个（若 h 也满足，(h/e^x)' = 0，h/e^x 恒等于 1）`],
      [`e^x 严格增（导数 e^x > 0），有反函数 ln：e^{ln x} = x，ln(e^x) = x`, `严格单调连续函数必有反函数；e^x > 0 来自 e^x = (e^{x/2})² 且不为零`],
      [`对 e^{ln x} = x 两边求导：e^{ln x}·(ln x)' = 1 ⇒ (ln x)' = 1/x`, `链式法则；e^{ln x} = x 代回`],
      [`ln(xy) = ln x + ln y：令 x = e^u，y = e^v，则 xy = e^{u+v}，取 ln 得 u + v`, `第 2 步的加法公式经反函数翻译成乘法公式`],
      [`定义 a^x := e^{x ln a}（a > 0）。则 a^{m+n} = e^{(m+n) ln a} = a^m a^n，(a^m)^n = e^{n ln(a^m)} = e^{n·m ln a} = a^{mn}`, `这个定义在整数 x 时与重复相乘一致（归纳），并延拓到实数；性质从 e 的性质继承`],
      [`换底：设 y = log_a b，即 a^y = b，取 ln：y ln a = ln b，y = ln b / ln a`, `log_a 的定义是 a^y = b；两边取 ln 用第 6 步 ln(a^y) = y ln a`],
      [`(a^m)^n ≠ a^{(m^n)}：(2^3)^2 = 2^6 = 64，2^{3^2} = 2^9 = 512`, `第 6 步给出括号在下是指数相乘；塔从上往下算是另一种运算`]
    ],
    end:`整个指数-对数体系可以从一条微分方程 f' = f 长出来；加变乘、换底、幂的幂全是它的推论。这也是为什么 e 是"自然"底。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
x, y = rng.uniform(-3, 3, 1000), rng.uniform(-3, 3, 1000)
print("e^(x+y)==e^x e^y:", np.allclose(np.exp(x+y), np.exp(x)*np.exp(y)))
h = 1e-6; t = np.linspace(0.5, 5, 10)
print("(e^x)' == e^x:", np.allclose((np.exp(t+h)-np.exp(t-h))/(2*h), np.exp(t), rtol=1e-6))
print("(ln x)' == 1/x:", np.allclose((np.log(t+h)-np.log(t-h))/(2*h), 1/t, rtol=1e-6))
print("inverse: exp(log t)==t, log(exp t)==t:", np.allclose(np.exp(np.log(t)), t), np.allclose(np.log(np.exp(t)), t))
a, b = 2.0, 10.0
print("a^x == exp(x ln a):", np.allclose(a**x, np.exp(x*np.log(a))), " log2(10)=ln10/ln2 =", np.log(b)/np.log(a), np.log2(b))
print("(2^3)^2 =", (2**3)**2, " 2^(3^2) =", 2**(3**2))
print("half-life 5d, 20d left:", 0.5**(20/5), " ln(e^3 sqrt e) =", np.log(np.e**3*np.sqrt(np.e)))`,
    out:`e^(x+y)==e^x e^y: True
(e^x)' == e^x: True
(ln x)' == 1/x: True
inverse: exp(log t)==t, log(exp t)==t: True True
a^x == exp(x ln a): True  log2(10)=ln10/ln2 = 3.3219280948873626 3.321928094887362
(2^3)^2 = 64  2^(3^2) = 512
half-life 5d, 20d left: 0.0625  ln(e^3 sqrt e) = 3.5`,
    note:`第 1 行是第 2 步；导数两行是定义与第 4 步；inverse 行是第 3 步；a^x 与换底是第 6-7 步；64 与 512 是第 8 步。`
  },
  contrast:[
    {vs:`幂函数 x^n`, same:`都写成"某数的某次方"`, diff:`指数函数的变量在指数位，幂函数的变量在底；导数一个是自身乘常数，一个降一次`, when:`x 在肩上认指数；x 在脚下认幂`},
    {vs:`对数尺度 ns.log_scale`, same:`都是 log`, diff:`对数尺度是应用（把乘法压成加法画图），本节是 log 作为反函数的代数性质`, when:`画图选尺度看对数尺度；推公式回本节`},
    {vs:`sigmoid 1/(1+e^{−x})`, same:`由 e^x 构成`, diff:`sigmoid 是把 (−∞,∞) 压到 (0,1) 的 S 形；e^x 本身无上界`, when:`要概率用 sigmoid；要增长模型用 e^{rx}`},
    {vs:`72 法则 al.doubling`, same:`都解 a^t = 2`, diff:`本节给出精确解 t = ln 2 / ln a；72 法则是它的一阶近似`, when:`心算用 72；程序里直接 log(2)/log(1+r)`}
  ],
  ext:[
    {t:`e^x 是导数等于自身的函数：微分方程视角`, go:'ca.ode'},
    {t:`翻倍时间 ln2/ln(1+r) 的近似`, go:'al.doubling'},
    {t:`log 只拆乘除，log-sum-exp 处理加法`, go:'al.log_trap'},
    {t:`sigmoid、softmax、交叉熵都是 exp/log 的组合`, go:'dl.loss'}
  ]
},

'al.quadratic': {
  layers:{
    alg:`ax² + bx + c = a(x + b/2a)² − Δ/4a，Δ = b² − 4ac。令平方项等于 Δ/4a² 解出 x = (−b ± √Δ)/2a。顶点 (−b/2a, −Δ/4a)。`,
    geo:`配方就是把抛物线平移到顶点在原点：a·X²。判别式决定顶点在 x 轴上方还是下方：a>0 且顶点 y = −Δ/4a < 0（即 Δ>0）时碗底在轴下，穿轴两次。`,
    comp:`数值求根不要直接套公式：b² 很大时 −b + √Δ 会灾难性抵消。稳定做法：先算 q = −(b + sign(b)√Δ)/2，两根为 q/a 与 c/q。`
  },
  proof:{
    from:`完全平方 (x+p)² = x² + 2px + p²；a ≠ 0；实数平方非负`,
    to:`求根公式；顶点坐标；Δ 的符号决定实根个数；Δ 的几何意义是顶点到 x 轴的距离乘 −4a`,
    steps:[
      [`ax² + bx + c = a(x² + (b/a)x) + c`, `a ≠ 0 可以提出；目标是把 x 的项凑成完全平方`],
      [`x² + (b/a)x = (x + b/2a)² − b²/4a²`, `取 p = b/2a 使 2px = (b/a)x；补上 p² 再减回去`],
      [`所以 ax² + bx + c = a(x + b/2a)² + c − b²/4a = a(x + b/2a)² − Δ/4a`, `代回并通分：c − b²/4a = (4ac − b²)/4a = −Δ/4a`],
      [`顶点：平方项 ≥ 0，a > 0 时最小值在 x = −b/2a，值为 −Δ/4a；a < 0 时是最大值`, `a(x+b/2a)² 的符号由 a 决定，且当且仅当 x = −b/2a 时为零`],
      [`令原式 = 0：(x + b/2a)² = Δ/4a²`, `移项除以 a；右边分母是正的 4a²`],
      [`Δ < 0：左边非负、右边为负，无实根；Δ = 0：唯一解 x = −b/2a；Δ > 0：x + b/2a = ±√Δ/2a`, `实数平方非负；开方产生正负两支`],
      [`x = (−b ± √Δ)/2a`, `第 6 步移项即得；两根关于 −b/2a 对称，距离各为 √Δ/2|a|`],
      [`几何：顶点纵坐标 −Δ/4a 与 a 异号 ⇔ Δ > 0 ⇔ 顶点在 x 轴"另一侧"⇔ 抛物线穿轴两次`, `a>0 碗开口向上，碗底在轴下面必然穿轴两次；Δ 正比于顶点离轴的距离`]
    ],
    end:`求根公式是配方的副产品，配方的本质是平移到顶点。Δ 不是神秘符号，它是"顶点离 x 轴多远"乘 −4a；这套平移-配方思路直接推广到二次型和最小二乘。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
ok_roots = ok_vertex = True
for _ in range(500):
    a, b, c = rng.uniform(-5, 5, 3)
    if abs(a) < 0.2 or abs(b/(2*a)) > 15: continue
    D = b*b - 4*a*c
    xs = np.linspace(-20, 20, 40001)
    v = a*xs*xs + b*xs + c
    i = np.argmin(v) if a > 0 else np.argmax(v)
    ok_vertex &= np.isclose(xs[i], -b/(2*a), atol=2e-3) and np.isclose(v[i], -D/(4*a), atol=1e-4)
    if D > 0:
        r = (-b + np.array([1, -1])*np.sqrt(D))/(2*a)
        ok_roots &= np.allclose(np.sort(r), np.sort(np.roots([a, b, c]).real)) and np.allclose(a*r*r+b*r+c, 0)
print("vertex at -b/2a with value -D/4a:", ok_vertex, "  roots match np.roots:", ok_roots)
print("x^2-5x+6 roots:", np.roots([1, -5, 6]), " x^2+2x+5 min:", -((4-20)/4))
print("D<0 example x^2+2x+5:", np.roots([1, 2, 5]))
# 数值稳定：b 很大时的抵消
a, b, c = 1.0, 1e8, 1.0
naive = (-b + np.sqrt(b*b-4*a*c))/(2*a)
q = -(b + np.sign(b)*np.sqrt(b*b-4*a*c))/2; stable = c/q
print(f"small root: naive={naive:.6e} stable={stable:.6e} true~{-c/b:.6e}")`,
    out:`vertex at -b/2a with value -D/4a: True   roots match np.roots: True
x^2-5x+6 roots: [3. 2.]  x^2+2x+5 min: 4.0
D<0 example x^2+2x+5: [-1.+2.j -1.-2.j]
small root: naive=-7.450581e-09 stable=-1.000000e-08 true~-1.000000e-08`,
    note:`ok_vertex 对应第 3-4 步（网格上极值点与顶点公式一致）；ok_roots 对应第 5-7 步；Δ<0 输出复根对应第 6 步；最后一行展示公式的数值陷阱。`
  },
  contrast:[
    {vs:`韦达定理 al.vieta`, same:`同一个方程`, diff:`求根公式给出根本身；韦达只给根的和与积，不需要开方`, when:`要根的具体值用公式；只要对称量用韦达`},
    {vs:`二次型 x^T A x`, same:`都是二次`, diff:`一元二次的配方对应多元的对角化；Δ 的角色由特征值符号接管`, when:`一元看 Δ；多元看 Hessian 特征值`},
    {vs:`梯度下降 ml.gradient_descent`, same:`都在找抛物线最低点`, diff:`配方一步到位；梯度下降沿斜率一步步走，学习率超过 1/a 会发散`, when:`能配方就配方；高维非二次才迭代`}
  ],
  ext:[
    {t:`韦达：从因式分解直接读根的和与积`, go:'al.vieta'},
    {t:`极值点附近任何函数都像抛物线，这是优化的基础`, go:'ca.optimization'},
    {t:`最小二乘是多元的配方`, go:'la.least_squares'}
  ]
},

'al.inequality_amgm': {
  layers:{
    alg:`(a+b)/2 ≥ √(ab)。证明一：(√a − √b)² ≥ 0。证明二：ln 是凹函数，ln((a+b)/2) ≥ (ln a + ln b)/2。n 项版本用切线 ln x ≤ x − 1。`,
    geo:`周长固定的矩形里正方形面积最大。半圆图：直径 a+b 上的半径是 AM，从分点竖起到圆弧的高是 GM，半径永远不短于弦高。`,
    comp:`用 AM-GM 求最值时机器做的事：把目标写成几项和，令各项相等解出取等点，再代回验证。不检查取等条件就会得到达不到的"最小值"。`
  },
  proof:{
    from:`实数平方非负；ln x ≤ x − 1（切线不等式，等号仅在 x = 1）`,
    to:`两项 AM-GM 及等号条件；n 项 AM-GM；x + 1/x ≥ 2 (x > 0) 且 x < 0 时反向`,
    steps:[
      [`证明一：(√a − √b)² = a − 2√(ab) + b ≥ 0`, `a, b ≥ 0 才能开方；任何实数的平方非负`],
      [`移项：a + b ≥ 2√(ab)，即 (a+b)/2 ≥ √(ab)；等号 ⇔ √a = √b ⇔ a = b`, `平方为零当且仅当底数为零`],
      [`证明二（凹性）：ln'' = −1/x² < 0，所以 ln((a+b)/2) ≥ (ln a + ln b)/2 = ln √(ab)`, `凹函数在中点的值不低于两端值的平均（弦在曲线下方）`],
      [`ln 严格增，两边脱去 ln 得 (a+b)/2 ≥ √(ab)`, `严格增函数保序`],
      [`n 项：令 A = (a_1+…+a_n)/n，对每个 i 用 ln(a_i/A) ≤ a_i/A − 1`, `切线不等式 ln x ≤ x − 1 对所有 x > 0 成立，因为 ln 凹且在 x=1 处切线为 x − 1`],
      [`求和：Σ ln(a_i/A) ≤ Σ(a_i/A) − n = n − n = 0`, `Σ a_i = nA 所以 Σ a_i/A = n`],
      [`即 ln(∏a_i) ≤ n ln A，(∏a_i)^{1/n} ≤ A；等号 ⇔ 每个 a_i/A = 1 ⇔ 全相等`, `对数和变乘积；切线不等式取等只在 x = 1`],
      [`推论：x > 0 时 x + 1/x ≥ 2√(x·1/x) = 2；x < 0 时对 −x 用同样式子得 x + 1/x ≤ −2`, `两项乘积为常数 1 是 AM-GM 的标准形；负数先变号`]
    ],
    end:`AM-GM 说的是"和固定时全相等最优"，两种证明分别揭示它的代数根（平方非负）和分析根（ln 凹）。凹性证明直接给出 n 项版本和 Jensen 不等式。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
a, b = rng.uniform(0.01, 10, 10000), rng.uniform(0.01, 10, 10000)
print("AM>=GM all:", np.all((a+b)/2 >= np.sqrt(a*b) - 1e-12), " gap == (sqrt a - sqrt b)^2/2:", np.allclose((a+b)/2 - np.sqrt(a*b), (np.sqrt(a)-np.sqrt(b))**2/2))
print("concavity: ln((a+b)/2) >= (ln a+ln b)/2:", np.all(np.log((a+b)/2) >= (np.log(a)+np.log(b))/2 - 1e-12))
X = rng.uniform(0.01, 10, (5000, 6))
print("6-term AM>=GM all:", np.all(X.mean(1) >= np.exp(np.log(X).mean(1)) - 1e-12))
x = np.linspace(0.01, 1, 1000); print("tangent ln x <= x-1:", np.all(np.log(x) <= x - 1))
xs = np.linspace(0.05, 10, 20000); f = xs + 4/xs
print(f"min of x+4/x on x>0: {f.min():.4f} at x={xs[f.argmin()]:.2f}  (AM-GM: 4 at 2)")
g = xs**2 + 2/xs
print(f"min of x^2+2/x: {g.min():.4f} at x={xs[g.argmin()]:.2f}  (split 2/x=1/x+1/x -> 3 at 1)")
print("x<0: x+1/x at -2 =", -2 + 1/-2, " <= -2")`,
    out:`AM>=GM all: True  gap == (sqrt a - sqrt b)^2/2: True
concavity: ln((a+b)/2) >= (ln a+ln b)/2: True
6-term AM>=GM all: True
tangent ln x <= x-1: True
min of x+4/x on x>0: 4.0000 at x=2.00  (AM-GM: 4 at 2)
min of x^2+2/x: 3.0000 at x=1.00  (split 2/x=1/x+1/x -> 3 at 1)
x<0: x+1/x at -2 = -2.5  <= -2`,
    note:`第 1 行 gap 恰等于 (√a−√b)²/2 是证明一（第 1-2 步）；第 2 行是证明二（第 3 步）；6 项与切线行是第 5-7 步；后三行验证第 8 步与取等点。`
  },
  contrast:[
    {vs:`柯西-施瓦茨 (Σa_ib_i)² ≤ Σa_i²Σb_i²`, same:`都是"对称时取等"的不等式`, diff:`AM-GM 比较同一组数的两种平均；柯西比较两组数的内积与长度乘积`, when:`和积问题用 AM-GM；内积、相关系数、投影用柯西`},
    {vs:`Jensen 不等式`, same:`证明二就是 ln 的 Jensen`, diff:`Jensen 对任意凸/凹函数与任意权重成立；AM-GM 是它取 ln 与等权的特例`, when:`加权平均、期望的不等式（如 E[ln X] ≤ ln E[X]）用 Jensen`},
    {vs:`平均数的坑 ns.average_trap`, same:`HM ≤ GM ≤ AM 同源`, diff:`那里关心选哪种平均描述数据；这里关心用不等式求最值`, when:`描述用前者；优化用后者`},
    {vs:`配方求最值 al.quadratic`, same:`都能求 x + c/x 型最值`, diff:`配方要求二次；AM-GM 要求乘积为常数，对 x² + 2/x 这种非二次也行`, when:`二次配方；乘积定常用 AM-GM`}
  ],
  ext:[
    {t:`凸性与 Jensen：AM-GM 的一般化`, go:'op.convex'},
    {t:`熵最大在均匀分布，是 AM-GM 的信息论版本`, go:'it.max_entropy'},
    {t:`平均速度、平均增长率选哪种平均`, go:'ns.average_trap'}
  ]
},

'al.substitution': {
  layers:{
    alg:`若 φ 是 x 的定义域到 t 的值域的映射，方程 F(φ(x)) = 0 的解集 = φ⁻¹({t : F(t)=0, t ∈ φ(D)})。换元合法的全部内容就是：解 F(t)=0，然后只取落在 φ 值域里的 t 反解回去。`,
    geo:`换元是换坐标轴：把 x 轴上弯曲的问题映到 t 轴上变直。t 轴上只有一段是从 x 轴映过来的（值域），那段之外的解没有原像。`,
    comp:`程序里换元就是定义一个函数 phi 并在 phi(x) 上解题；解完必须 filter 掉不在 phi 值域内的 t（t=x²≥0，t=2^x>0），再对每个 t 求原像集合（可能 0、1、2 个）。`
  },
  proof:{
    from:`函数的定义域、值域与原像；方程解集的定义`,
    to:`换元解方程的正确流程：解 t，筛值域，反解原像；x + 1/x 的值域是 |t| ≥ 2`,
    steps:[
      [`设 t = φ(x)，原方程 F(φ(x)) = 0。x 是解 ⇔ φ(x) 是 F(t) = 0 的解`, `代入定义：x 满足原方程等价于把 φ(x) 记为 t 后满足 F(t) = 0`],
      [`所以原方程解集 = { x : φ(x) ∈ S }，S = { t : F(t) = 0 }`, `第 1 步的集合写法；这是 S 在 φ 下的原像 φ⁻¹(S)`],
      [`S 中不在 φ 值域内的 t 原像为空，可直接丢弃`, `原像为空意味着没有 x 映到它；t = x² = −1 无实 x`],
      [`S 中在值域内的 t，每个可能有多个原像：t = x² = 4 ⇒ x = ±2`, `φ 不必单射；反解要把所有原像都列出`],
      [`例：x⁴ − 5x² + 4 = 0，t = x²，t² − 5t + 4 = 0，t = 1, 4，都 ≥ 0，原像 x = ±1, ±2`, `第 1-4 步逐条执行`],
      [`例：4^x − 3·2^x + 2 = 0，t = 2^x > 0，t² − 3t + 2 = 0，t = 1, 2，原像 x = 0, 1`, `2^x 的值域是 (0,∞)，两个 t 都合法且各有唯一原像（2^x 单射）`],
      [`t = x + 1/x 的值域：x > 0 时 AM-GM 给 t ≥ 2；x < 0 时 t ≤ −2；所以 |t| ≥ 2`, `x 与 1/x 乘积为 1，AM-GM 取等在 x = 1；负半轴对称`],
      [`例：√(x+1) = x − 1，t = √(x+1) ≥ 0，x = t² − 1，t = t² − 2，t² − t − 2 = 0，t = 2 或 −1，丢 −1，x = 3`, `根号的值域非负；t = −1 在值域外无原像`]
    ],
    end:`换元的正确性只依赖"解集 = 原像"这一个集合论事实。所有"忘了检查范围""漏了负根"的错误都是漏做了第 3 或第 4 步。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
def solve_by_sub(F_coef, phi, phi_range_ok, preimage):
    ts = np.roots(F_coef); ts = ts[np.isclose(ts.imag, 0)].real          # 解 F(t)=0
    ts = [float(t) for t in ts if phi_range_ok(t)]                        # 筛值域
    xs = sorted({round(float(x), 9) for t in ts for x in preimage(t)})    # 反解原像
    return ts, xs
# x^4 - 5x^2 + 4 = 0, t = x^2
ts, xs = solve_by_sub([1, -5, 4], lambda x: x*x, lambda t: t >= 0, lambda t: [np.sqrt(t), -np.sqrt(t)])
print("t:", sorted(ts), " x:", xs, " check:", np.allclose([x**4-5*x**2+4 for x in xs], 0))
# 4^x - 3*2^x + 2 = 0, t = 2^x
ts, xs = solve_by_sub([1, -3, 2], lambda x: 2**x, lambda t: t > 0, lambda t: [np.log2(t)])
print("t:", sorted(ts), " x:", xs)
# sqrt(x+1) = x-1, t = sqrt(x+1) >= 0, x = t^2-1  ->  t^2 - t - 2 = 0
ts, xs = solve_by_sub([1, -1, -2], None, lambda t: t >= 0, lambda t: [t*t - 1])
print("t kept:", ts, " x:", xs, " check:", [bool(np.isclose(np.sqrt(x+1), x-1)) for x in xs])
# t = x + 1/x 的值域
x = np.concatenate([np.linspace(-50, -0.01, 20000), np.linspace(0.01, 50, 20000)]); t = x + 1/x
print("range of x+1/x: min |t| =", np.abs(t).min().round(4), " x^2+1/x^2=7 -> t^2 = 9 -> t =", np.sqrt(7+2))`,
    out:`t: [1.0, 4.0]  x: [-2.0, -1.0, 1.0, 2.0]  check: True
t: [1.0, 2.0]  x: [0.0, 1.0]
t kept: [2.0]  x: [3.0]  check: [True]
range of x+1/x: min |t| = 2.0  x^2+1/x^2=7 -> t^2 = 9 -> t = 3.0`,
    note:`solve_by_sub 的三行分别是推导第 1-2、3、4 步；第三个例子丢掉 t = −1 是第 8 步；最后一行验证第 7 步的值域。`
  },
  contrast:[
    {vs:`积分换元 u-substitution`, same:`同样是 t = φ(x)`, diff:`解方程只需原像；积分还要乘 dx/dt 并换积分限`, when:`方程换元查值域；积分换元查雅可比`},
    {vs:`因式分解`, same:`都把高次降成低次`, diff:`因式分解找的是根，换元找的是重复出现的结构；x⁴−5x²+4 两者都行，4^x−3·2^x+2 只能换元`, when:`看到重复的子表达式先换元`},
    {vs:`链式法则 ca.chain_rule`, same:`都是复合函数 F(φ(x))`, diff:`链式法则算复合的导数；换元解复合的方程`, when:`求导用链式；求根用换元`}
  ],
  ext:[
    {t:`积分里的换元：多一个雅可比因子`, go:'ca.integration_tricks'},
    {t:`复合函数求导`, go:'ca.chain_rule'},
    {t:`换元后的二次方程`, go:'al.quadratic'}
  ]
},

'al.polynomial': {
  layers:{
    alg:`带余除法 f(x) = (x−a)q(x) + r，r 是常数，代 x = a 得 r = f(a)。所以 f(a) = 0 ⇔ (x−a) | f。实系数多项式的复根成对：f(z̄) = conj(f(z))。奇次实多项式两端异号，必有实根。`,
    geo:`n 次多项式图像最多穿 x 轴 n 次、拐 n−1 次；穿一次对应一个实根因式，重根处只碰不穿。两端走向由首项 a_n x^n 决定。`,
    comp:`综合除法（Horner）：从最高次系数开始，每步 b_k = a_k + a·b_{k+1}，最后一个 b 就是余数 f(a)，前面的 b 是商的系数。n 次乘加，也是最稳的求值方法。`
  },
  proof:{
    from:`多项式带余除法：deg r < deg 除式；复共轭保持加法与乘法`,
    to:`余式定理、因式定理；Horner 法正确性；复根成对；奇次至少一实根；(a+b)^n 的二项式系数`,
    steps:[
      [`f(x) = (x−a)q(x) + r，deg r < 1 所以 r 是常数`, `除以一次式，余式次数小于 1`],
      [`代 x = a：f(a) = 0·q(a) + r = r`, `等式对所有 x 成立，代特殊值合法；余式定理`],
      [`因式定理：f(a) = 0 ⇔ r = 0 ⇔ (x−a) | f`, `第 2 步给出 r = f(a)；r = 0 就是整除的定义`],
      [`Horner：f(x) = (…((a_n x + a_{n−1})x + a_{n−2})x + …) + a_0；令 b_n = a_n，b_k = a_k + a·b_{k+1}`, `按 x 逐层提取公因子；b_k 正是把 x = a 代入后每层的值，b_0 = f(a)，b_1..b_n 是商的系数（对比 (x−a)q + r 的系数）`],
      [`实系数：f(z̄) = Σ a_k z̄^k = conj(Σ a_k z^k) = conj(f(z))`, `共轭是环同态，且 a_k 实数时 ā_k = a_k`],
      [`所以 f(z) = 0 ⇒ f(z̄) = conj(0) = 0，非实复根成对出现，实根个数与 n 同奇偶`, `代数基本定理给 n 个复根（计重数）；成对去掉偶数个，剩下的是实根`],
      [`奇次 n：x → +∞ 与 x → −∞ 时 a_n x^n 异号，f 连续，介值定理给出零点`, `首项主导两端；连续函数取遍两端之间的值`],
      [`(a+b)^n = Σ C(n,k) a^k b^{n−k}：展开是从 n 个括号各选 a 或 b，选 k 个 a 的方式有 C(n,k) 种`, `分配律展开是 2^n 项之和，按 a 的个数归类计数`]
    ],
    end:`根与因式是一回事（因式定理），求值与除法是一回事（Horner）。多项式是有限次乘加，所以它是数值计算的通用积木，也是泰勒展开的目标形式。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
from math import comb
def horner(coef, a):                       # coef 高次在前；返回 (商系数, 余数)
    b = [coef[0]]
    for c in coef[1:]: b.append(c + a*b[-1])
    return b[:-1], b[-1]
f = [1, -6, 11, -6]                        # x^3 - 6x^2 + 11x - 6
q, r = horner(f, 1)
print("f(1) via Horner remainder:", r, " quotient:", q, " -> roots of quotient:", np.roots(q))
print("x^10+1 divided by (x-1) remainder:", horner([1]+[0]*9+[1], 1)[1])
rng = np.random.default_rng(0)
ok = all(np.isclose(horner(c, a)[1], np.polyval(c, a)) for c, a in zip(rng.normal(size=(200, 5)), rng.normal(size=200)))
print("Horner remainder == f(a) for 200 random:", ok)
roots = np.roots([1, 2, 5, 3, 7])          # 实系数 4 次
print("roots:", np.round(roots, 3), " conjugate pairs:", np.allclose(np.sort_complex(roots), np.sort_complex(np.conj(roots))))
odd = [int(np.sum(np.isclose(np.roots(c).imag, 0))) for c in rng.normal(size=(300, 4))]   # 3 次
print("cubic real-root counts seen:", sorted(set(odd)))
print("(x-1)(x-2)(x-3) x^2 coef:", np.poly([1, 2, 3])[1], " C(5,k):", [comb(5, k) for k in range(6)], "== (1+x)^5 coefs:", [int(v) for v in (np.poly1d([1, 1])**5).coeffs])`,
    out:`f(1) via Horner remainder: 0  quotient: [1, -5, 6]  -> roots of quotient: [3. 2.]
x^10+1 divided by (x-1) remainder: 2
Horner remainder == f(a) for 200 random: True
roots: [-1.148+1.599j -1.148-1.599j  0.148+1.336j  0.148-1.336j]  conjugate pairs: True
cubic real-root counts seen: [1, 3]
(x-1)(x-2)(x-3) x^2 coef: -6.0  C(5,k): [1, 5, 10, 10, 5, 1] == (1+x)^5 coefs: [1, 5, 10, 10, 5, 1]`,
    note:`horner 的 b.append(c + a*b[-1]) 是第 4 步；余数等于 f(a) 是第 1-2 步；conjugate pairs 是第 5-6 步；三次实根数只出现 1 或 3 是第 7 步；最后一行是第 8 步。`
  },
  contrast:[
    {vs:`泰勒多项式 ca.taylor`, same:`都是多项式`, diff:`本节的多项式是精确对象，泰勒多项式是对非多项式的截断近似`, when:`对象本身是多项式用因式与根；逼近光滑函数用泰勒`},
    {vs:`韦达定理 al.vieta`, same:`都连接根与系数`, diff:`因式定理是单根与单因式的对应；韦达是全部根的对称函数与全部系数的对应`, when:`试根、降次用因式定理；不解根求对称量用韦达`},
    {vs:`np.polyval / np.roots`, same:`同样求值、求根`, diff:`polyval 内部就是 Horner；roots 用伴随矩阵特征值，不是因式分解`, when:`理解用 Horner；生产用 numpy`}
  ],
  ext:[
    {t:`根的对称函数与系数：韦达`, go:'al.vieta'},
    {t:`用多项式逼近任意光滑函数`, go:'ca.taylor'},
    {t:`二项式系数的组合意义`, go:'co.binomial'},
    {t:`复根、单位根与多项式在复平面`, go:'cx.poly_roots'}
  ]
},

'al.system_eq': {
  layers:{
    alg:`a₁x + b₁y = c₁，a₂x + b₂y = c₂。消 y：乘 b₂、b₁ 后相减得 (a₁b₂ − a₂b₁)x = c₁b₂ − c₂b₁。分母 D = a₁b₂ − a₂b₁ 就是行列式；D ≠ 0 唯一解，D = 0 时无解或无穷解。`,
    geo:`两条直线的法向量 (a₁,b₁)、(a₂,b₂)；D 是它们张成的平行四边形面积。面积为零 ⇔ 法向量平行 ⇔ 直线平行（或重合）。`,
    comp:`高斯消元：把增广矩阵用行变换化成上三角再回代；行变换是可逆的所以解集不变。numpy 的 solve 就是 LU 分解版的消元，遇到 D ≈ 0 报 singular。`
  },
  proof:{
    from:`等式两边同乘非零数、两式相加减，解集不变（行变换可逆）`,
    to:`克莱姆法则；D ≠ 0 ⇔ 唯一解；D = 0 的两种情形；几何对应`,
    steps:[
      [`第一式乘 b₂，第二式乘 b₁：a₁b₂x + b₁b₂y = c₁b₂；a₂b₁x + b₁b₂y = c₂b₁`, `两边同乘常数不改变解集（若 b 为零可换用另一变量消元，结论相同）`],
      [`相减：(a₁b₂ − a₂b₁)x = c₁b₂ − c₂b₁`, `y 的系数相同被消掉；两个等式相减得到的等式在原解集上仍成立`],
      [`同理消 x：(a₁b₂ − a₂b₁)y = a₁c₂ − a₂c₁`, `对称地乘 a₂、a₁ 相减`],
      [`记 D = a₁b₂ − a₂b₁。D ≠ 0 时 x = (c₁b₂ − c₂b₁)/D，y = (a₁c₂ − a₂c₁)/D，且代回验证成立`, `除以非零数；行变换可逆保证由新式推回原式，所以是充要`],
      [`D = 0：若 c₁b₂ − c₂b₁ ≠ 0 则 0·x = 非零，无解；若两个分子都为零则两式成比例，无穷解`, `0 = 非零 矛盾；分子全零意味着第二式是第一式的倍数，只剩一条直线`],
      [`几何：D = (a₁,b₁) × (a₂,b₂)，是两法向量的叉积（有向面积）`, `二维叉积定义 ad − bc；面积为零 ⇔ 两向量共线`],
      [`法向量共线 ⇔ 两直线平行或重合；D ≠ 0 ⇔ 不平行 ⇔ 恰一个交点`, `直线方向由法向量唯一决定；不平行的两直线恰交于一点`],
      [`推广：n 元时 D 是 n×n 行列式，消元变成高斯消元，判据不变`, `行变换的可逆性与行列式非零 ⇔ 可逆矩阵在任意维成立`]
    ],
    end:`解方程组 = 消元，消元的分母 = 行列式 = 法向量张成的面积。"方程数等于未知数"不保证唯一解，D ≠ 0 才保证。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
def cramer(a1, b1, c1, a2, b2, c2):
    D = a1*b2 - a2*b1
    if abs(D) < 1e-12: return None, D
    return ((c1*b2 - c2*b1)/D, (a1*c2 - a2*c1)/D), D
def gauss(A, b):                                  # 手写消元 + 回代
    M = np.hstack([A.astype(float), b.reshape(-1, 1).astype(float)]); n = len(b)
    for i in range(n):
        p = i + np.argmax(np.abs(M[i:, i])); M[[i, p]] = M[[p, i]]
        for j in range(i+1, n): M[j] -= M[j, i]/M[i, i]*M[i]
    x = np.zeros(n)
    for i in range(n-1, -1, -1): x[i] = (M[i, -1] - M[i, i+1:n] @ x[i+1:]) / M[i, i]
    return x
print("x+y=5, x-y=1 ->", cramer(1, 1, 5, 1, -1, 1)[0])
print("x+2y=5, 3x-y=1 ->", cramer(1, 2, 5, 3, -1, 1)[0])
print("2x+3y=12, 4x+6y=24 -> D =", cramer(2, 3, 12, 4, 6, 24)[1], " (infinite)   x+y=2, x+y=3 -> D =", cramer(1, 1, 2, 1, 1, 3)[1], "(none)")
ok = True
for _ in range(300):
    A, b = rng.normal(size=(4, 4)), rng.normal(size=4)
    ok &= np.allclose(gauss(A, b), np.linalg.solve(A, b))
print("hand gauss == np.linalg.solve (300 random 4x4):", ok)
A = rng.normal(size=(2, 2)); print("D == cross of normals == det:", np.isclose(A[0,0]*A[1,1]-A[1,0]*A[0,1], np.linalg.det(A)))`,
    out:`x+y=5, x-y=1 -> (3.0, 2.0)
x+2y=5, 3x-y=1 -> (1.0, 2.0)
2x+3y=12, 4x+6y=24 -> D = 0  (infinite)   x+y=2, x+y=3 -> D = 0 (none)
hand gauss == np.linalg.solve (300 random 4x4): True
D == cross of normals == det: True`,
    note:`cramer 的 D 与两个分子对应第 2-4 步；D=0 两例对应第 5 步；gauss 的行变换与回代是第 8 步的推广；最后一行是第 6 步。`
  },
  contrast:[
    {vs:`矩阵求逆 la.inverse`, same:`Ax = b 都能解`, diff:`求逆算出 A⁻¹ 再乘，代价高且数值差；消元直接得 x`, when:`一次求解用消元；同一个 A 解很多 b 用 LU 分解，几乎不需要显式逆`},
    {vs:`最小二乘 la.least_squares`, same:`都是"解" Ax = b`, diff:`方程数多于未知数时一般无精确解，最小二乘找残差最小的 x`, when:`方程数 = 未知数且 D ≠ 0 用消元；超定用最小二乘`},
    {vs:`非线性方程组`, same:`都求交点`, diff:`线性的解集只能是空集、一点或整条线/面；非线性可以有有限多个孤立解`, when:`线性走消元；非线性走牛顿迭代`}
  ],
  ext:[
    {t:`行列式的几何意义：面积与可逆性`, go:'la.determinant'},
    {t:`逆矩阵与解的存在唯一`, go:'la.inverse'},
    {t:`秩：D = 0 时解集是几维`, go:'la.rank'}
  ]
},

'al.sequence': {
  layers:{
    alg:`等差 S_n = n(a₁+a_n)/2 由正反相加。等比 S_n − qS_n = a₁ − a₁q^n 由错位相减。递推 a_{n+1} = pa_n + q 的不动点 x* = q/(1−p)，b_n = a_n − x* 是公比 p 的等比。`,
    geo:`等差是楼梯，两个楼梯倒扣拼成 n×(a₁+a_n) 的矩形。等比是自相似的雪球，剥掉最外一层还是同样形状的雪球缩小 q 倍，这就是错位相减。`,
    comp:`程序里等差等比求和用公式 O(1)；递推数列直接 for 循环。判断 |q|<1 再用无穷和公式，否则 a₁/(1−q) 会给出一个荒谬的有限值。`
  },
  proof:{
    from:`加法交换律与结合律；等差、等比、线性递推的定义`,
    to:`等差求和；等比求和；|q| < 1 时无穷和；不动点法求 a_{n+1} = pa_n + q 的通项`,
    steps:[
      [`等差：S = a₁ + a₂ + … + a_n，倒写 S = a_n + a_{n−1} + … + a₁`, `加法可交换，倒序求和不变`],
      [`两式对应相加：每一对 a_k + a_{n+1−k} = 2a₁ + (n−1)d = a₁ + a_n`, `a_k = a₁ + (k−1)d，配对后 d 的系数 (k−1) + (n−k) = n−1 与 k 无关`],
      [`2S = n(a₁ + a_n)，S = n(a₁ + a_n)/2`, `n 对相同的和`],
      [`等比：S = a₁(1 + q + … + q^{n−1})，qS = a₁(q + … + q^n)`, `每项乘 q 恰好整体右移一位`],
      [`相减 S − qS = a₁(1 − q^n)，q ≠ 1 时 S = a₁(1 − q^n)/(1 − q)`, `中间项全部抵消只剩首尾；q = 1 时 S = na₁ 另算`],
      [`|q| < 1 ⇒ q^n → 0 ⇒ S_∞ = a₁/(1 − q)；|q| ≥ 1 时 q^n 不趋零，级数发散`, `|q|^n = e^{n ln|q|}，ln|q| < 0 才趋零`],
      [`递推 a_{n+1} = pa_n + q（p ≠ 1）：不动点 x* = px* + q ⇒ x* = q/(1−p)`, `不动点是"代进去不动"的值；线性方程唯一解`],
      [`令 b_n = a_n − x*，则 b_{n+1} = pa_n + q − x* = p(a_n − x*) = pb_n，所以 b_n = b₁p^{n−1}，a_n = x* + (a₁ − x*)p^{n−1}`, `减去不动点消掉常数项 q；剩下的是纯等比`]
    ],
    end:`等差配对、等比错位、递推平移到不动点，三个技巧都是"利用结构让大部分项抵消"。不动点法就是线性 ODE 求特解加齐次解的离散版本。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
n = 100; print("1+...+100 =", n*(1+n)//2, "==", sum(range(1, n+1)))
a1, q = 1.0, 0.5
print("1+1/2+1/4+... partial n=30:", a1*(1-q**30)/(1-q), " limit a1/(1-q) =", a1/(1-q))
rng = np.random.default_rng(0)
ok = True
for _ in range(300):
    a1, d, n = rng.normal(), rng.normal(), rng.integers(1, 50)
    ok &= np.isclose(n*(2*a1+(n-1)*d)/2, sum(a1+k*d for k in range(n)))
    a1, r = rng.normal(), rng.uniform(-3, 3)
    ok &= np.isclose(a1*(1-r**n)/(1-r), sum(a1*r**k for k in range(n)))
print("arith/geom sum formulas match brute force:", ok)
# 递推 a_{n+1} = 2 a_n + 1, a_1 = 1：不动点 -1
a = [1]
for _ in range(9): a.append(2*a[-1] + 1)
xstar = 1/(1-2)
print("a_n:", a, " formula 2^n-1:", [2**k - 1 for k in range(1, 11)], " fixed point:", xstar)
q = 1.5; print("|q|>1: partial sums grow:", [round(a1*(1-q**k)/(1-q), 1) for k in (5, 10, 20)][:3], "  formula a1/(1-q) would give", round(a1/(1-q), 2), "(meaningless)")`,
    out:`1+...+100 = 5050 == 5050
1+1/2+1/4+... partial n=30: 1.9999999981373549  limit a1/(1-q) = 2.0
arith/geom sum formulas match brute force: True
a_n: [1, 3, 7, 15, 31, 63, 127, 255, 511, 1023]  formula 2^n-1: [1, 3, 7, 15, 31, 63, 127, 255, 511, 1023]  fixed point: -1.0
|q|>1: partial sums grow: [10.9, 94.1, 5517.8]   formula a1/(1-q) would give -1.66 (meaningless)`,
    note:`两个求和公式与暴力求和一致是第 3、5 步；partial 与 limit 是第 6 步；a_n 与 2^n − 1 完全相同是第 7-8 步；最后一行展示 |q|≥1 时公式失效。`
  },
  contrast:[
    {vs:`72 法则 al.doubling`, same:`等比数列 = 固定增长率`, diff:`72 法则问"几项翻倍"，等比求和问"前 n 项加起来多少"`, when:`问增长到多少用通项；问累计用求和`},
    {vs:`递归 co.recursion`, same:`a_{n+1} = f(a_n) 就是递归定义`, diff:`数列求通项要闭式；递归编程只要能算下去`, when:`分析复杂度、求极限要闭式；实现直接循环`},
    {vs:`极限 ca.limit`, same:`无穷和是部分和的极限`, diff:`本节只处理 q^n → 0 一种极限；一般极限有完整的 ε-N 语言`, when:`等比外的级数收敛性要回到极限与比较判别法`}
  ],
  ext:[
    {t:`递推与递归的组合计数`, go:'co.recursion'},
    {t:`生成函数：把数列装进一个幂级数`, go:'co.generating'},
    {t:`离散动力系统的连续版：线性 ODE`, go:'ca.ode'}
  ]
},

'al.trig': {
  layers:{
    alg:`(cos θ, sin θ) 是单位圆上的点，所以 cos² + sin² = 1。旋转矩阵 R(θ) = [[c,−s],[s,c]]，R(a)R(b) = R(a+b) 展开即和角公式。令 a = b 得倍角。`,
    geo:`先转 b 再转 a 与一次转 a+b 到达同一点。把 (1,0) 沿这两条路走，比较终点坐标就是和角公式。`,
    comp:`机器用弧度，np.sin(1) 是 sin(1 rad)。反三角只返回主值区间，解方程要手动补 π − x、x + 2πk。`
  },
  proof:{
    from:`单位圆上点 P(θ) = (cos θ, sin θ) 的定义；旋转是线性变换且保长度`,
    to:`cos² + sin² = 1；和角公式；倍角公式；sin x ≈ x`,
    steps:[
      [`P(θ) 在单位圆上，|P|² = cos²θ + sin²θ = 1`, `单位圆的定义是到原点距离 1；勾股`],
      [`逆时针旋转 θ 是线性变换：e₁ = (1,0) → (cos θ, sin θ)，e₂ = (0,1) → (−sin θ, cos θ)`, `e₂ 领先 e₁ 90°，转 θ 后到 θ + 90°，坐标 (cos(θ+90°), sin(θ+90°)) = (−sin θ, cos θ) 由单位圆对称性`],
      [`所以 R(θ) = [[cos θ, −sin θ],[sin θ, cos θ]]（列是基向量的像）`, `线性变换由基向量的像唯一确定`],
      [`先转 b 再转 a = 转 a+b：R(a)R(b) = R(a+b)`, `旋转的复合是角度相加，这是旋转的几何定义；矩阵乘法对应变换复合`],
      [`左边乘出来第一列：(cos a cos b − sin a sin b, sin a cos b + cos a sin b)；右边第一列 (cos(a+b), sin(a+b))`, `矩阵乘法按行乘列；两边第一列必须相等`],
      [`所以 cos(a+b) = cos a cos b − sin a sin b，sin(a+b) = sin a cos b + cos a sin b`, `对比第 5 步两列分量`],
      [`令 a = b = x：cos 2x = cos²x − sin²x = 1 − 2sin²x，sin 2x = 2 sin x cos x`, `和角公式的特例；再用第 1 步替换 cos²`],
      [`小角：0 < x < π/2 时 sin x < x < tan x（扇形面积夹在两个三角形之间），除以 sin x 取极限得 sin x / x → 1`, `三角形 (1/2)sin x ≤ 扇形 x/2 ≤ 三角形 (1/2)tan x；夹逼`]
    ],
    end:`所有三角恒等式都是"单位圆 + 旋转复合"的推论。把 sin、cos 看成旋转矩阵的元素，和角公式就是矩阵乘法，不需要背。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
R = lambda t: np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
a, b = rng.uniform(-np.pi, np.pi, 2000), rng.uniform(-np.pi, np.pi, 2000)
print("cos^2+sin^2==1:", np.allclose(np.cos(a)**2 + np.sin(a)**2, 1))
print("R(a)R(b)==R(a+b) all:", all(np.allclose(R(x) @ R(y), R(x+y)) for x, y in zip(a[:300], b[:300])))
print("sin(a+b) formula:", np.allclose(np.sin(a+b), np.sin(a)*np.cos(b) + np.cos(a)*np.sin(b)), " cos(a+b):", np.allclose(np.cos(a+b), np.cos(a)*np.cos(b) - np.sin(a)*np.sin(b)))
print("cos2x == 1-2sin^2x:", np.allclose(np.cos(2*a), 1 - 2*np.sin(a)**2))
print("sin15 = (sqrt6-sqrt2)/4:", np.sin(np.radians(15)).round(6), ((np.sqrt(6)-np.sqrt(2))/4).round(6))
for x in [0.5, 0.1, 0.01]: print(f"x={x}: sin x/x = {np.sin(x)/x:.6f}   sin<x<tan: {np.sin(x) < x < np.tan(x)}")
print("sin(1 rad) =", np.sin(1).round(4), "== sin(57.3 deg) =", np.sin(np.radians(57.29578)).round(4), " period of sin(3x):", 2*np.pi/3)`,
    out:`cos^2+sin^2==1: True
R(a)R(b)==R(a+b) all: True
sin(a+b) formula: True  cos(a+b): True
cos2x == 1-2sin^2x: True
sin15 = (sqrt6-sqrt2)/4: 0.258819 0.258819
x=0.5: sin x/x = 0.958851   sin<x<tan: True
x=0.1: sin x/x = 0.998334   sin<x<tan: True
x=0.01: sin x/x = 0.999983   sin<x<tan: True
sin(1 rad) = 0.8415 == sin(57.3 deg) = 0.8415  period of sin(3x): 2.0943951023931953`,
    note:`R(a)R(b)==R(a+b) 是第 4 步，紧接着两行是从它读出的第 5-7 步；sin x/x 与夹逼是第 8 步；最后一行提醒弧度。`
  },
  contrast:[
    {vs:`单位圆 ge.unit_circle`, same:`同一个圆`, diff:`单位圆节点讲角度与坐标的对应；本节讲由此导出的恒等式代数`, when:`定义与象限看单位圆；推公式看本节`},
    {vs:`欧拉公式 cx.euler`, same:`e^{iθ} = cos θ + i sin θ 把 R(θ) 压成一个复数`, diff:`复数乘法 e^{ia}e^{ib} = e^{i(a+b)} 一行就是和角公式；实矩阵要乘四个元素`, when:`推恒等式用欧拉最快；实现旋转用矩阵`},
    {vs:`双曲函数 sinh, cosh`, same:`同样有 cosh² − sinh² = 1 与和角公式`, diff:`参数化的是双曲线不是圆；没有周期性`, when:`看到 x² − y² = 1 或 e^x ± e^{−x} 想双曲`}
  ],
  ext:[
    {t:`把旋转矩阵压成一个复数：欧拉公式`, go:'cx.euler'},
    {t:`旋转矩阵作为线性变换`, go:'ge.transform'},
    {t:`极坐标与复数乘法 = 转角加、长度乘`, go:'ge.polar'},
    {t:`sin/cos 作为傅里叶基`, go:'fo.basis'}
  ]
},

'al.vieta': {
  layers:{
    alg:`ax² + bx + c = a(x − r₁)(x − r₂) = a[x² − (r₁+r₂)x + r₁r₂]，对比系数：r₁ + r₂ = −b/a，r₁r₂ = c/a。任何对称多项式都是 e₁ = r₁+r₂ 与 e₂ = r₁r₂ 的多项式。`,
    geo:`两根是 x 轴上的两个点，它们的中点 −b/2a 就是对称轴；乘积 c/a 是 f(0)/a，即抛物线在 y 轴上的截距除以开口。`,
    comp:`程序里不解根就能算 r₁² + r₂² = e₁² − 2e₂；Newton 恒等式让所有幂和 p_k 由 e₁、e₂ 递推。numpy 的 poly 与 roots 互为逆：poly(roots) 恢复系数，系数就是韦达。`
  },
  proof:{
    from:`因式定理：r 是根 ⇔ (x − r) 整除；多项式相等 ⇔ 各次系数相等`,
    to:`二次韦达；由和与积表示 r₁² + r₂²、1/r₁ + 1/r₂；三次韦达的符号交替；Newton 恒等式 p₂ = e₁p₁ − 2e₂`,
    steps:[
      [`r₁ 是根 ⇒ f(x) = (x − r₁)g(x)，g 是一次；r₂ 是根且 r₂ ≠ r₁ ⇒ g(r₂) = 0 ⇒ g = a(x − r₂)（重根时用重数）`, `因式定理两次；首项系数 a 由 x² 的系数继承`],
      [`展开 a(x − r₁)(x − r₂) = ax² − a(r₁ + r₂)x + a r₁r₂`, `分配律`],
      [`与 ax² + bx + c 对比系数：−a(r₁+r₂) = b，a r₁r₂ = c`, `两个多项式恒等 ⇒ 对应系数相等（多项式的系数表示唯一）`],
      [`所以 r₁ + r₂ = −b/a，r₁r₂ = c/a；实根时要求 Δ ≥ 0，否则等式对复根仍成立`, `除以 a ≠ 0；推导没用到根是实数`],
      [`r₁² + r₂² = (r₁ + r₂)² − 2r₁r₂ = e₁² − 2e₂`, `完全平方展开后移项`],
      [`1/r₁ + 1/r₂ = (r₁ + r₂)/(r₁r₂) = e₁/e₂（e₂ ≠ 0）`, `通分`],
      [`三次：a(x−r₁)(x−r₂)(x−r₃) = a[x³ − e₁x² + e₂x − e₃]，所以 e₁ = −b/a，e₂ = c/a，e₃ = −d/a`, `逐项展开，选 k 个 (−r_i) 相乘产生 (−1)^k e_k`],
      [`Newton：p_k = Σ r_i^k，则 p₁ = e₁，p₂ = e₁p₁ − 2e₂，p₃ = e₁p₂ − e₂p₁ + 3e₃`, `把 x = r_i 代入 x^k − e₁x^{k−1} + … = 0 后对 i 求和；低次项另外用计数修正`]
    ],
    end:`韦达就是"因式分解后对比系数"。它把关于根的对称问题全部转换为系数问题，所以不用开方；这也是特征多项式的迹 = 特征值之和、行列式 = 特征值之积的来源。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
ok = True
for _ in range(500):
    a, b, c = rng.normal(size=3)
    r = np.roots([a, b, c])                          # 可能是复根
    ok &= np.isclose(r.sum(), -b/a) and np.isclose(r.prod(), c/a)
print("r1+r2=-b/a, r1r2=c/a for 500 random (incl. complex):", ok)
a, b, c = 1, -3, 1; e1, e2 = -b/a, c/a
r = np.roots([a, b, c])
print("x^2-3x+1: r1^2+r2^2 =", (r**2).sum().round(6), "== e1^2-2e2 =", e1**2 - 2*e2, "  1/r1+1/r2 =", (1/r).sum().round(6), "== e1/e2 =", e1/e2)
print("roots 2,-5 -> monic poly coef:", np.poly([2, -5]), " (x^2+3x-10)")
ok3 = True
for _ in range(300):
    co = rng.normal(size=4); a, b, c, d = co; r = np.roots(co)
    e1, e2, e3 = r.sum(), (r[0]*r[1] + r[0]*r[2] + r[1]*r[2]), r.prod()
    ok3 &= np.allclose([e1, e2, e3], [-b/a, c/a, -d/a])
    p1, p2, p3 = (r**1).sum(), (r**2).sum(), (r**3).sum()
    ok3 &= np.isclose(p2, e1*p1 - 2*e2) and np.isclose(p3, e1*p2 - e2*p1 + 3*e3)
print("cubic Vieta signs alternate + Newton identities (300 random):", ok3)`,
    out:`r1+r2=-b/a, r1r2=c/a for 500 random (incl. complex): True
x^2-3x+1: r1^2+r2^2 = 7.0 == e1^2-2e2 = 7.0   1/r1+1/r2 = 3.0 == e1/e2 = 3.0
roots 2,-5 -> monic poly coef: [  1.   3. -10.]  (x^2+3x-10)
cubic Vieta signs alternate + Newton identities (300 random): True`,
    note:`第 1 行包含复根，验证第 4 步"不要求实根"；第 2 行是第 5-6 步；poly([2,-5]) 是第 3 步反向；最后一行是第 7-8 步。`
  },
  contrast:[
    {vs:`求根公式 al.quadratic`, same:`同一方程`, diff:`公式要开方给出每个根；韦达不开方只给对称量`, when:`题目只问和、积、平方和用韦达`},
    {vs:`迹与行列式 la.eigen`, same:`tr A = Σλ，det A = ∏λ 就是特征多项式的韦达`, diff:`特征值是矩阵的根，韦达用在特征多项式上`, when:`2×2 矩阵不解特征方程就能知道 λ₁+λ₂ 与 λ₁λ₂`},
    {vs:`对称多项式基本定理`, same:`韦达是它的应用`, diff:`定理说任何对称多项式是 e_k 的多项式；韦达说 e_k 就是系数`, when:`遇到关于根的对称表达式，先化成 e_k 再代系数`}
  ],
  ext:[
    {t:`特征多项式的韦达：迹与行列式`, go:'la.eigen'},
    {t:`高次多项式与因式定理`, go:'al.polynomial'},
    {t:`复根成对时韦达仍成立`, go:'cx.poly_roots'}
  ]
},

'al.abs_ineq': {
  layers:{
    alg:`|x| = √x²，|x − a| 是 x 到 a 的距离。三角不等式 |a + b| ≤ |a| + |b| 由两边平方 (a+b)² ≤ (|a|+|b|)² 即 ab ≤ |a||b| 得到。反向 ||a| − |b|| ≤ |a − b|。`,
    geo:`数轴上 |x − a| < r 是以 a 为中心、半径 r 的开区间；|x − a| > r 是区间外的两条射线。三角不等式：绕路不比直走短。`,
    comp:`L1 范数是绝对值之和，它是所有范数里的"三角不等式最紧"的那个；MAE、Lasso 用它。代码里 abs 不可导于 0，取次梯度 sign(x)。`
  },
  proof:{
    from:`|x| 定义：x ≥ 0 时为 x，否则为 −x；|x|² = x²；ab ≤ |ab| = |a||b|`,
    to:`|x − a| < r ⇔ a − r < x < a + r；|x| > r ⇔ x > r 或 x < −r；三角不等式与反向三角不等式；|x−1| + |x+1| ≥ 2`,
    steps:[
      [`|x| < r ⇔ −r < x < r（r > 0）`, `x ≥ 0 时 |x| = x < r；x < 0 时 |x| = −x < r ⇔ x > −r；合起来是开区间`],
      [`把 x 换成 x − a：|x − a| < r ⇔ a − r < x < a + r`, `第 1 步对任何表达式成立；加 a 平移区间`],
      [`|x| > r ⇔ x > r 或 x < −r`, `第 1 步的补集：区间外面是两条射线，是"或"不是"且"`],
      [`|a + b|² = (a + b)² = a² + 2ab + b² ≤ a² + 2|a||b| + b² = (|a| + |b|)²`, `|t|² = t²；ab ≤ |ab| = |a||b|`],
      [`两边非负，开方得 |a + b| ≤ |a| + |b|；等号 ⇔ ab = |ab| ⇔ ab ≥ 0（同号）`, `√ 在 [0,∞) 严格增保序；等号追溯到 ab = |a||b|`],
      [`反向：|a| = |(a − b) + b| ≤ |a − b| + |b| ⇒ |a| − |b| ≤ |a − b|；交换 a,b 得 |b| − |a| ≤ |a − b|，合起来 ||a| − |b|| ≤ |a − b|`, `三角不等式用在拆分 a = (a−b) + b 上`],
      [`|x − 1| + |x + 1| = |x − 1| + |−1 − x| ≥ |(x − 1) + (−1 − x)| = 2，等号 ⇔ (x−1)(−1−x) ≥ 0 ⇔ −1 ≤ x ≤ 1`, `三角不等式，等号条件是同号`],
      [`平方去绝对值：|u| < |v| ⇔ u² < v²，但 u < v 与 u² < v² 只在 u, v ≥ 0 时等价`, `t ↦ t² 只在 [0,∞) 上单调，两边有负数时会翻转`]
    ],
    end:`绝对值 = 距离，三角不等式 = 绕路不更短。这一条是所有范数、误差界、收敛证明的公理，L1/L2 范数、余弦距离都必须满足它才配叫距离。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
a, b = rng.normal(size=100000), rng.normal(size=100000)
print("|a+b| <= |a|+|b| all:", np.all(np.abs(a+b) <= np.abs(a)+np.abs(b) + 1e-12))
print("equality iff ab>=0:", np.allclose(np.abs(a+b)[a*b >= 0], (np.abs(a)+np.abs(b))[a*b >= 0]), np.all(np.abs(a+b)[a*b < 0] < (np.abs(a)+np.abs(b))[a*b < 0]))
print("||a|-|b|| <= |a-b| all:", np.all(np.abs(np.abs(a)-np.abs(b)) <= np.abs(a-b) + 1e-12))
x = np.linspace(-10, 10, 200001)
print("|x-3|<2 solution:", x[np.abs(x-3) < 2].min().round(4), "to", x[np.abs(x-3) < 2].max().round(4))
s = x[np.abs(2*x+1) >= 5]; print("|2x+1|>=5 pieces: x<=", s[s < 0].max().round(4), " or x>=", s[s > 0].min().round(4))
f = np.abs(x-1) + np.abs(x+1); print("min |x-1|+|x+1| =", f.min(), " attained on [", x[np.isclose(f, 2)].min().round(2), ",", x[np.isclose(f, 2)].max().round(2), "]")
print("|a|=3,|b|=5 -> |a+b| in [2,8]:", sorted({abs(s1*3 + s2*5) for s1 in (1, -1) for s2 in (1, -1)}))
u, v = -3, 2; print("u<v but u^2<v^2?", u < v, u*u < v*v, " (squaring needs both >= 0)")`,
    out:`|a+b| <= |a|+|b| all: True
equality iff ab>=0: True True
||a|-|b|| <= |a-b| all: True
|x-3|<2 solution: 1.0001 to 4.9999
|2x+1|>=5 pieces: x<= -3.0  or x>= 2.0
min |x-1|+|x+1| = 2.0  attained on [ -1.0 , 1.0 ]
|a|=3,|b|=5 -> |a+b| in [2,8]: [2, 8]
u<v but u^2<v^2? True False  (squaring needs both >= 0)`,
    note:`第 1-2 行是第 4-5 步（含等号条件）；第 3 行是第 6 步；区间与两条射线是第 1-3 步；min = 2 在 [−1,1] 是第 7 步；最后一行是第 8 步的反例。`
  },
  contrast:[
    {vs:`AM-GM al.inequality_amgm`, same:`都是基本不等式`, diff:`AM-GM 关于和与积，要求非负；三角不等式关于距离，对任何实数/向量成立`, when:`最值问题用 AM-GM；误差界、收敛用三角不等式`},
    {vs:`向量的三角不等式 ge.vector`, same:`|v + w| ≤ |v| + |w| 形式相同`, diff:`向量版的证明要用柯西-施瓦茨代替 ab ≤ |a||b|`, when:`一维用本节；高维要先证柯西`},
    {vs:`L1 vs L2 范数`, same:`都满足三角不等式`, diff:`L1 = Σ|x_i| 在坐标轴上有棱角，L2 光滑；L1 惩罚产生稀疏解`, when:`要稀疏、抗离群用 L1；要光滑可导用 L2`}
  ],
  ext:[
    {t:`向量长度与三角不等式`, go:'ge.vector'},
    {t:`距离的公理化：范数与度量`, go:'ge.distance'},
    {t:`L1 正则化为什么稀疏`, go:'op.regularization'}
  ]
},

'al.doubling': {
  layers:{
    alg:`(1+r)^t = 2 ⇒ t = ln 2 / ln(1+r)。ln(1+r) ≈ r − r²/2，所以 t ≈ (ln 2 / r)(1 + r/2) = 69.3/r% × (1 + r/2)。在 r ≈ 8% 处修正因子 1.04，69.3 × 1.04 ≈ 72。`,
    geo:`对数尺上指数增长是直线，斜率 ln(1+r)；翻倍就是竖直上升 ln 2，所需水平距离 = ln 2 / 斜率。`,
    comp:`程序里直接 log(2)/log1p(r)，用 log1p 避免 r 很小时 1+r 的精度损失。72 法则只是心算。`
  },
  proof:{
    from:`ln 2 = 0.6931；ln(1+r) = r − r²/2 + r³/3 − …（|r| < 1）`,
    to:`精确翻倍时间；69.3 法则；为何取 72；衰减半衰期用 70`,
    steps:[
      [`(1+r)^t = 2，两边取 ln：t·ln(1+r) = ln 2`, `ln 严格增，等式两边取 ln 仍等价；幂的对数 = 指数乘对数`],
      [`t = ln 2 / ln(1+r)`, `ln(1+r) > 0（r > 0）可以除`],
      [`ln(1+r) ≈ r − r²/2 = r(1 − r/2)`, `泰勒展开取前两项，r 小时高阶项可忽略`],
      [`t ≈ ln 2 / [r(1 − r/2)] ≈ (ln 2 / r)(1 + r/2)`, `1/(1 − ε) ≈ 1 + ε`],
      [`换成百分数 R = 100r：t ≈ (69.3/R)(1 + R/200)`, `ln 2 / r = 0.693/(R/100) = 69.3/R`],
      [`R = 8 时 69.3 × 1.04 = 72.1；R = 6 时 71.4；R = 10 时 72.8。72 因数多（2,3,4,6,8,9,12），所以选 72`, `一个常数不可能处处精确，选在常见利率区间误差最小且好除的`],
      [`R 大时失真：R = 50，精确 ln 2 / ln 1.5 = 1.71，72/50 = 1.44`, `第 3 步的截断在 r = 0.5 时误差大`],
      [`衰减 (1−r)^t = 1/2：t = ln 2 / [−ln(1−r)]，−ln(1−r) ≈ r + r²/2，所以 t ≈ (69.3/R)(1 − R/200)，R = 3 时约 70/R`, `ln(1−r) 的二阶项符号相反，修正向下，70 更合适`]
    ],
    end:`72 法则是 ln 2 / ln(1+r) 的一阶泰勒近似加一个为常见利率量身选的常数。理解推导就知道它在 2%-12% 好用，在 50% 失效，衰减要换 70。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
print(" R%   exact   69.3/R  69.3/R*(1+R/200)  72/R")
for R in [1, 2, 3, 6, 8, 10, 12, 20, 50]:
    r = R/100; exact = np.log(2)/np.log1p(r)
    print(f"{R:3d}  {exact:6.2f}  {69.3/R:6.2f}  {69.3/R*(1+R/200):8.2f}       {72/R:6.2f}")
print("bacteria 20min doubling, 3h:", 2**(180/20), "x")
for R in [3, 8]:
    r = R/100; print(f"decay R={R}%: exact half-life {np.log(2)/-np.log1p(-r):.2f}  70/R={70/R:.2f}  72/R={72/R:.2f}")
print("1e6 at 6% for 12y:", round(1e6*1.06**12), " (~2e6)")`,
    out:` R%   exact   69.3/R  69.3/R*(1+R/200)  72/R
  1   69.66   69.30     69.65        72.00
  2   35.00   34.65     35.00        36.00
  3   23.45   23.10     23.45        24.00
  6   11.90   11.55     11.90        12.00
  8    9.01    8.66      9.01         9.00
 10    7.27    6.93      7.28         7.20
 12    6.12    5.77      6.12         6.00
 20    3.80    3.46      3.81         3.60
 50    1.71    1.39      1.73         1.44
bacteria 20min doubling, 3h: 512.0 x
decay R=3%: exact half-life 22.76  70/R=23.33  72/R=24.00
decay R=8%: exact half-life 8.31  70/R=8.75  72/R=9.00
1e6 at 6% for 12y: 2012196  (~2e6)`,
    note:`表格第 2 列是第 2 步精确值，第 4 列是第 4-5 步的一阶修正（几乎重合），第 5 列 72/R 在 R=6..10 最贴；R=50 那行是第 7 步；decay 两行是第 8 步。`
  },
  contrast:[
    {vs:`连续复利 e^{rt}`, same:`都是指数增长`, diff:`连续复利翻倍时间恰为 ln 2 / r = 69.3/R，没有 (1+R/200) 修正`, when:`ODE、细胞生长用连续形式；按期计息用离散形式`},
    {vs:`半衰期 bm.pk_ode`, same:`同一个 ln 2`, diff:`半衰期是衰减，修正方向相反（用 70）；药代动力学里直接从消除速率常数 k 得 t½ = ln2/k`, when:`增长用 72，衰减用 70，连续过程用 ln 2 / k`},
    {vs:`线性增长`, same:`都在涨`, diff:`线性增长没有固定翻倍时间，翻倍越来越慢；指数增长翻倍时间恒定`, when:`看 log 图是不是直线`}
  ],
  ext:[
    {t:`指数与对数的精确关系`, go:'al.exp_log'},
    {t:`ln(1+x) ≈ x 的来源与边界`, go:'al.log_trap'},
    {t:`药物半衰期与一阶消除 ODE`, go:'bm.pk_ode'}
  ]
},

'al.log_trap': {
  layers:{
    alg:`log 是 (R⁺, ×) → (R, +) 的同态，对 + 没有结构。唯一的处理：log(a+b) = log a + log(1 + b/a)，当 b/a 小时再用 ln(1+x) = x − x²/2 + …。log-sum-exp：log Σe^{x_i} = m + log Σe^{x_i − m}，m = max x_i。`,
    geo:`log 曲线是凹的，弦在曲线下方：log 的"加法"永远比先加再 log 小。ln(1+x) 在 0 附近的切线是 y = x，切线在曲线上方。`,
    comp:`直接 np.log(np.sum(np.exp(x))) 在 x = 1000 时溢出成 inf。减去最大值后所有指数 ≤ 0，最大那项恰为 1，不溢出也不全部下溢。这是 softmax 与交叉熵的标准实现。`
  },
  proof:{
    from:`log(ab) = log a + log b；ln(1+x) 的泰勒级数；e^x 单调`,
    to:`log(a+b) 的唯一分解；ln(1+x) ≈ x 的误差界；log-sum-exp 恒等式与其数值稳定性；log 方程要查定义域`,
    steps:[
      [`log(a+b) = log[a(1 + b/a)] = log a + log(1 + b/a)`, `提出公因子 a > 0，再用乘法公式；这是精确恒等式，不是近似`],
      [`若 log(a+b) = log a + log b 恒成立，取 a = b = 1 得 log 2 = 0，矛盾`, `一个反例足以否定恒等式`],
      [`ln(1+x) = x − x²/2 + x³/3 − …，|x| < 1；截断到一阶的误差 ≤ x²/2`, `ln(1+x) 的导数 1/(1+x) = 1 − x + x² − … 逐项积分；交错级数余项不超过首个舍去项`],
      [`ln(1.01) ≈ 0.01，误差 ≤ 5e−5；ln(1.5) ≈ 0.5 误差 0.095，一阶近似失效`, `第 3 步的界在 x = 0.5 时是 0.125，已经不小`],
      [`log-sum-exp：Σ e^{x_i} = e^m Σ e^{x_i − m}，取 log 得 m + log Σ e^{x_i − m}`, `提出公因子 e^m；对任何 m 成立，选 m = max x_i`],
      [`稳定性：x_i − m ≤ 0 所以 e^{x_i − m} ∈ (0, 1]，其中最大项恰为 1，和 ∈ [1, n]`, `不会上溢（≤ n），也不会全部下溢成 0 导致 log 0`],
      [`softmax_i = e^{x_i − LSE(x)}，减去 LSE 后再 exp，全程无溢出`, `softmax = e^{x_i}/Σe^{x_j}，分子分母同除 e^m`],
      [`log 方程：lg x + lg(x−3) = 1 要求 x > 3；合并成 lg[x(x−3)] = 1 扩大了定义域，解出 x = 5 或 −2 后必须丢 −2`, `lg u + lg v 要求 u, v > 0；lg(uv) 只要求 uv > 0；合并是单向蕴含`]
    ],
    end:`log 不拆加法是群论事实；能做的只有提公因子。log-sum-exp 是这个事实在数值计算里的标准形态，softmax、交叉熵、logsumexp pooling 都靠它。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
np.seterr(over='ignore')
rng = np.random.default_rng(0)
a, b = rng.uniform(1, 100, 1000), rng.uniform(1, 100, 1000)
print("log(a+b) == log a + log(1+b/a):", np.allclose(np.log(a+b), np.log(a) + np.log1p(b/a)), "  log2(8+8)=", np.log2(16), " not 3+3")
for x in [0.01, 0.1, 0.5]:
    print(f"ln(1+{x}) = {np.log1p(x):.5f}  approx x = {x}  err = {abs(np.log1p(x)-x):.2e}  bound x^2/2 = {x*x/2:.2e}")
x = np.array([1000.0, 1000.0, 999.0])
naive = np.log(np.sum(np.exp(x)))
m = x.max(); stable = m + np.log(np.sum(np.exp(x - m)))
print("naive LSE:", naive, " stable LSE:", stable)
sm = np.exp(x - stable); print("softmax:", sm.round(4), " sums to", sm.sum())
# log 方程定义域
cands = np.roots([1, -3, -10]); print("lg x + lg(x-3) = 1 candidates:", cands, " valid (x>3):", cands[cands > 3])
print("ln 1000 = 3 ln 10 =", 3*np.log(10))`,
    out:`log(a+b) == log a + log(1+b/a): True   log2(8+8)= 4.0  not 3+3
ln(1+0.01) = 0.00995  approx x = 0.01  err = 4.97e-05  bound x^2/2 = 5.00e-05
ln(1+0.1) = 0.09531  approx x = 0.1  err = 4.69e-03  bound x^2/2 = 5.00e-03
ln(1+0.5) = 0.40547  approx x = 0.5  err = 9.45e-02  bound x^2/2 = 1.25e-01
naive LSE: inf  stable LSE: 1000.8619948040582
softmax: [0.4223 0.4223 0.1554]  sums to 1.000000000000038
lg x + lg(x-3) = 1 candidates: [ 5. -2.]  valid (x>3): [5.]
ln 1000 = 3 ln 10 = 6.907755278982138`,
    note:`第 1 行是第 1-2 步；三行 err ≤ bound 是第 3-4 步；naive 为 inf、stable 为有限值是第 5-6 步；softmax 行是第 7 步；最后是第 8 步。`
  },
  contrast:[
    {vs:`指数与对数 al.exp_log`, same:`同一对函数`, diff:`那里是它们成立的性质，这里是它们不成立的性质与补救`, when:`推公式回 exp_log；调 bug 看本节`},
    {vs:`浮点溢出 np.overflow`, same:`log-sum-exp 就是为溢出设计的`, diff:`溢出节点讲机器表示范围；本节讲用恒等式绕开它`, when:`exp 的参数可能超过 709 就先减最大值`},
    {vs:`交叉熵 dl.loss`, same:`−log softmax 的实现就是 LSE − x_y`, diff:`交叉熵是损失函数的定义，LSE 是它的稳定计算方式`, when:`永远用 log_softmax 而不是 log(softmax)`}
  ],
  ext:[
    {t:`交叉熵与 log_softmax 的实现`, go:'dl.loss'},
    {t:`浮点上溢与下溢`, go:'np.overflow'},
    {t:`极大似然为什么取 log`, go:'ca.log_trick'}
  ]
}

});
