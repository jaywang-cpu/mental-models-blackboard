/* 数理宇宙 v3 · 推导层 · ns 数感大陆（12 节点）
   旁挂文件，不改动 v1/v2。深化层讲"怎么用"，这里只做两件事：把结论证出来、用代码把它跑出来。
   scratch 全部用 python3 + numpy 2.3 实际跑过，out 是真实输出（seed 固定）。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'ns.max_digits': {
  layers:{
    alg:`a^b > c^d ⇔ b·ln a > d·ln c。两层塔 a^(b^c) 再取一次 log：ln ln(a^(b^c)) = c·ln b + ln ln a。比大小永远是比对数域里的线性量。`,
    geo:`把每个数画成对数尺上的一根棍子，长度 = 指数 × ln底。一层塔的棍长是乘积，两层塔的棍长本身又是一根指数棍，要再压一次才能画进同一把尺。`,
    comp:`机器不算 3^42（会溢出或超精度），算 42*log(3) 这个 float。需要精确值就用 Python 大整数只算一次做对照，其余全走 log。`
  },
  proof:{
    from:`ln 在 (0,∞) 严格单调增；ln(x^k) = k·ln x；a,c > 1`,
    to:`a^b 与 c^d 的大小由 b·ln a 与 d·ln c 决定；两层塔比大小需取两次 log`,
    steps:[
      [`设 a^b 与 c^d 都是正数，取 ln：ln(a^b) = b·ln a，ln(c^d) = d·ln c`, `幂的对数等于指数乘底的对数，这是 ln 把乘法变加法的直接推论（b 个 ln a 相加）`],
      [`严格单调：x < y ⇔ ln x < ln y`, `ln 的导数 1/x > 0，所以严格增；严格增函数保序且不会把不等号翻转`],
      [`所以 a^b < c^d ⇔ b·ln a < d·ln c`, `第 1 步换成对数、第 2 步保证等价，两个方向都成立`],
      [`两层塔 a^(b^c)：ln 一次得 b^c·ln a，仍然是一个巨大的数`, `指数塔的顶层没被压掉，b^c 本身还是指数量级，必须再压一次`],
      [`再 ln 一次：ln(b^c·ln a) = c·ln b + ln ln a`, `乘积的对数是对数的和；这一步把塔完全压成线性量`],
      [`2^(3^4) 与 3^42 比：前者 ln = 81·ln2 = 56.1，后者 ln = 42·ln3 = 46.1，前者大`, `两个数都可以只取一次 ln 落到同一把尺上，此时不需要第二次 log`],
      [`底在 (0,1) 时 ln a < 0，不等号方向仍由 b·ln a 决定，只是它是负数`, `第 3 步的等价没用到 ln a 的正负，所以结论不变；但直觉"底大赢"彻底失效`]
    ],
    end:`比大小 = 取 log 变线性再比。这是一切"数量级思维"的证明基础：浮点数、信息量、似然函数全在对数域里比较。`
  },
  scratch:{
    lang:'python',
    code:`import math
# 1. 一层塔：精确大整数 vs log 判断，两者必须一致
pairs = [((3,21),(2,31)), ((3,42),(4,32)), ((9,11),(11,9)), ((2,100),(3,60))]
for (a,b),(c,d) in pairs:
    exact = (a**b > c**d)
    bylog = (b*math.log(a) > d*math.log(c))
    print(f"{a}^{b} vs {c}^{d}: exact={exact} bylog={bylog} lens={b*math.log(a):.1f},{d*math.log(c):.1f}")
# 2. 两层塔：取两次 log
lnln_tower = 4*math.log(3) + math.log(math.log(2))   # ln ln 2^(3^4)
lnln_flat  = math.log(42*math.log(3))                 # ln ln 3^42
print(f"lnln 2^(3^4)={lnln_tower:.3f}  lnln 3^42={lnln_flat:.3f}  exact={2**(3**4) > 3**42}")
# 3. 底在 (0,1)：底大不一定赢
print("0.5^3 vs 0.9^20:", 0.5**3 > 0.9**20, 3*math.log(0.5) > 20*math.log(0.9))`,
    out:`3^21 vs 2^31: exact=True bylog=True lens=23.1,21.5
3^42 vs 4^32: exact=True bylog=True lens=46.1,44.4
9^11 vs 11^9: exact=True bylog=True lens=24.2,21.6
2^100 vs 3^60: exact=True bylog=True lens=69.3,65.9
lnln 2^(3^4)=4.028  lnln 3^42=3.832  exact=True
0.5^3 vs 0.9^20: True True`,
    note:`第 1 段 exact 与 bylog 列列相同，对应推导第 3 步的等价；第 2 段是第 5 步取两次 log；第 3 段验证第 7 步。`
  },
  contrast:[
    {vs:`数量级（位数）判断 ns.magnitude`, same:`都取 log`, diff:`比大小只要 log 的相对大小；求位数要 lg 的整数部分再加 1，是绝对量`, when:`排序用 ln 任意底；报"多少位"必须用 lg`},
    {vs:`浮点溢出 np.overflow`, same:`都遇到 3^42 这种算不动的数`, diff:`本节是数学上比大小，溢出是机器表示失败；解法一样：在 log 域算`, when:`float64 最大 1.8e308，ln 超过 709 就先取 log 再算`},
    {vs:`指数塔的结合律 (a^b)^c = a^(bc) ≠ a^(b^c)`, same:`都是三个数堆塔`, diff:`括号在下面是乘指数，括号在上面才是真正的塔；塔默认从上往下算`, when:`看到无括号的 a^b^c 一律按 a^(b^c)`}
  ],
  ext:[
    {t:`对数尺度：把整条数轴按 log 重新刻度，比大小变成量长度`, go:'ns.log_scale'},
    {t:`指数与对数互为反函数，是本节"取 log 保序"的根`, go:'al.exp_log'},
    {t:`机器层面：先取 log 再算，避免溢出`, go:'np.overflow'}
  ]
},

'ns.make24': {
  layers:{
    alg:`4 个数的所有表达式 = 5 种括号树 × 4! 种叶子排列 × 4^3 种运算符 = 7680 个式子，用有理数精确求值，等于 24 就是解。`,
    geo:`一棵二叉树：叶子是 4 个数，内部结点是运算；每合并两个数，叶子少一个，深度 3 后只剩根。搜索就是走遍所有树。`,
    comp:`DFS：从 n 个数里任取两个，做 6 种运算（减和除有方向），得到 n−1 个数递归；n=1 时看是否等于 24。用 Fraction 避免 0.1+0.2 问题。`
  },
  proof:{
    from:`4 个有理数，运算 + − × ÷，可任意加括号`,
    to:`穷举 DFS 必然找到所有解（若存在），且搜索规模有限`,
    steps:[
      [`任何表达式都是一棵满二叉树：叶子是数，内部结点是二元运算`, `+ − × ÷ 都是二元运算，括号只是指定树的形状`],
      [`4 个叶子的满二叉树只有 Catalan(3) = 5 种形状`, `n 个叶子的满二叉树数 = C(n−1)，C(3) = 5，可以手数`],
      [`每棵树的根，最后一次运算把叶子集合分成两个非空子集`, `根结点左右子树各含至少一个叶子；所以"最后一步"总是合并两个中间结果`],
      [`因此"每次任选两个数合并成一个，重复 3 次"覆盖了所有树`, `任何树都可以按后序遍历的顺序执行，每一步恰好是合并两个当前值；反之每种合并序列对应一棵树`],
      [`合并两个数 x,y 的结果集是 {x+y, x−y, y−x, xy, x/y, y/x}，除数非零`, `+ × 可交换所以一种，− ÷ 不可交换所以各两种；共 6 种`],
      [`搜索总量上界：C(4,2)·6 × C(3,2)·6 × C(2,2)·6 = 36·18·6 = 3888 条路径`, `每层从 n 个数选一对是 C(n,2)，乘 6 种运算；有限所以必终止`],
      [`用 Fraction 求值，等于 24 的判断是精确的`, `浮点 8/(3−8/3) 会有舍入误差，有理数运算封闭且精确`]
    ],
    end:`24 点是一次可枚举完的树搜索。"先找 3×8、4×6"是人脑的剪枝，机器不需要剪枝就能穷尽 3888 条路。`
  },
  scratch:{
    lang:'python',
    code:`from fractions import Fraction as F
import itertools, random
def solve(nums):
    # nums: list of (Fraction, expr_string)
    if len(nums) == 1:
        return nums[0][1] if nums[0][0] == 24 else None
    for i, j in itertools.combinations(range(len(nums)), 2):
        (a, sa), (b, sb) = nums[i], nums[j]
        rest = [nums[k] for k in range(len(nums)) if k not in (i, j)]
        cands = [(a+b, f"({sa}+{sb})"), (a-b, f"({sa}-{sb})"), (b-a, f"({sb}-{sa})"), (a*b, f"({sa}*{sb})")]
        if b != 0: cands.append((a/b, f"({sa}/{sb})"))
        if a != 0: cands.append((b/a, f"({sb}/{sa})"))
        for v, s in cands:
            r = solve(rest + [(v, s)])
            if r: return r
    return None
for q in [(3,3,8,8), (1,5,5,5), (4,4,10,10), (4,1,8,7), (1,1,1,1)]:
    print(q, "->", solve([(F(x), str(x)) for x in q]))
random.seed(0)
hands = [tuple(random.randint(1, 13) for _ in range(4)) for _ in range(300)]
ok = sum(solve([(F(x), str(x)) for x in h]) is not None for h in hands)
print(f"random 300 hands solvable: {ok}  ({ok/300:.1%})")`,
    out:`(3, 3, 8, 8) -> (8/(3-(8/3)))
(1, 5, 5, 5) -> (5*(5-(1/5)))
(4, 4, 10, 10) -> (((10*10)-4)/4)
(4, 1, 8, 7) -> (8*(7-(4*1)))
(1, 1, 1, 1) -> None
random 300 hands solvable: 244  (81.3%)`,
    note:`solve 的每一层 combinations + 6 个候选就是推导第 4-5 步；Fraction 对应第 7 步；3,3,8,8 出现分数解验证除法方向必须双向。`
  },
  contrast:[
    {vs:`递归回溯 py.recursion`, same:`同一种 DFS 结构`, diff:`24 点的状态是"当前数的多重集"，一般回溯的状态是路径；这里合并操作让状态单调缩小，必终止`, when:`状态会缩小的问题用这种"合并"递归；状态不缩小要加 visited`},
    {vs:`因数分解 ns.factor`, same:`都靠"24 的因数对"剪枝`, diff:`因数分解是唯一的，24 点的分解方式（3×8、4×6、25−1）不唯一，是启发式而非定理`, when:`人算用因数对提示，机器直接穷举`},
    {vs:`浮点比较 abs(x−24)<1e-9`, same:`都在判断是否等于 24`, diff:`浮点判断可能漏掉 8/(3−8/3) 这种中间量不可精确表示的解；有理数不会`, when:`只涉及四则运算就用 Fraction；涉及开方才用浮点加容差`}
  ],
  ext:[
    {t:`一般表达式搜索 = 遍历满二叉树，Catalan 数就是树的个数`, go:'co.catalan'},
    {t:`递归的模板：选一步、缩小问题、回溯`, go:'py.recursion'}
  ]
},

'ns.estimate': {
  layers:{
    alg:`每个因子 x_i 四舍五入成 (1+ε_i)x_i，乘积的相对误差 ≈ Σε_i。ε 独立同分布、均值零时，n 个因子的总相对误差标准差 ∝ √n 而非 n。`,
    geo:`每个数放到对数尺上，四舍五入是把它推到最近的粗刻度；误差是推的距离。乘法是把长度首尾相接，推的距离有正有负会互相抵消。`,
    comp:`机器估算：把每个数写成 m×10^k，只保留 m 的一位，指数相加、尾数相乘再归一。开方时先把指数调成偶数。`
  },
  proof:{
    from:`因子 x_i > 0；四舍五入到一位有效数字后为 x_i(1+ε_i)，|ε_i| ≤ 0.5/首位数字 ≤ 50%（首位为 1 时最坏）`,
    to:`乘积的相对误差 ≈ Σε_i；若 ε_i 独立零均值，则误差标准差按 √n 增长，不按 n`,
    steps:[
      [`∏ x_i(1+ε_i) = (∏ x_i)·∏(1+ε_i)`, `乘法可交换可结合，把真值和误差因子分开`],
      [`ln ∏(1+ε_i) = Σ ln(1+ε_i) ≈ Σ ε_i`, `ln 把乘变加；|ε| 小时 ln(1+ε) = ε − ε²/2 + …，一阶截断`],
      [`所以相对误差 ≈ Σ ε_i，绝对误差项互不放大`, `第 2 步指数回去 e^{Σε} ≈ 1 + Σε，相对误差就是指数上那个和`],
      [`若 ε_i 独立、E[ε_i]=0、Var=σ²，则 Var(Σε_i) = nσ²，标准差 √n·σ`, `独立随机变量方差相加，这是方差的基本性质；均值零是因为四舍五入上下对称`],
      [`最坏情况 |Σε_i| ≤ n·max|ε|，但典型情况是 √n·σ`, `最坏情况要求所有误差同号，概率随 n 指数下降`],
      [`开方：√(m×10^k)，k 奇数时改写为 √(10m × 10^(k−1))`, `10^k 的平方根要求 k 偶数才能整除；把一个 10 借给尾数，尾数范围仍在 [1,100)`],
      [`一年秒数 = 365.25×86400 = 3.156e7 ≈ π×10^7，误差 0.5%`, `π = 3.1416 与 3.156 只差 0.5%，作为记忆锚点足够`]
    ],
    end:`估算的误差在对数域里是加法，随机方向的误差互相抵消，所以多因子费米估算反而更稳。这也是为什么"先定量级再修一位"就能对到 20%。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
def round1(x):                       # 四舍五入到一位有效数字
    k = np.floor(np.log10(x)); return np.round(x / 10**k) * 10**k
for n in [2, 4, 8, 16]:
    xs = rng.uniform(1, 1000, size=(20000, n))
    exact = xs.prod(axis=1)
    est   = round1(xs).prod(axis=1)
    rel   = est / exact - 1
    print(f"n={n:2d} factors: rel-err std={rel.std():.3f}  std/sqrt(n)={rel.std()/np.sqrt(n):.3f}  within20%={np.mean(np.abs(rel)<0.2):.2f}")
print("47*213 exact", 47*213, "estimate", 50*200)
print("sqrt(0.0037):", np.sqrt(0.0037).round(4), " via 37e-4 ->", (np.sqrt(37)*1e-2).round(4))
print("year seconds", 365.25*86400, " pi*1e7 =", np.pi*1e7)`,
    out:`n= 2 factors: rel-err std=0.124  std/sqrt(n)=0.088  within20%=0.89
n= 4 factors: rel-err std=0.176  std/sqrt(n)=0.088  within20%=0.76
n= 8 factors: rel-err std=0.246  std/sqrt(n)=0.087  within20%=0.58
n=16 factors: rel-err std=0.346  std/sqrt(n)=0.087  within20%=0.42
47*213 exact 10011 estimate 10000
sqrt(0.0037): 0.0608  via 37e-4 -> 0.0608
year seconds 31557600.0  pi*1e7 = 31415926.535897933`,
    note:`rel-err std 除以 √n 后近似常数，对应推导第 4 步；within20% 说明多因子估算仍大多落在 20% 内（第 5 步）；最后两行是第 6、7 步。`
  },
  contrast:[
    {vs:`数量级 ns.magnitude`, same:`都先看 10 的几次方`, diff:`数量级只要指数 k；估算还要修尾数 m 到一位有效数字`, when:`判断可行性只看量级；报一个数字要估算`},
    {vs:`精确计算`, same:`都得到一个数`, diff:`估算的误差是设计出来的（一位有效数字），精确计算的误差是浮点舍入`, when:`先估算给出量级护栏，再精确算；两者不对量级说明有一步错了`},
    {vs:`Big-O 分析 py.bigo`, same:`都忽略常数看主项`, diff:`Big-O 连 10 倍常数都扔掉；估算保留一位有效数字`, when:`比较算法用 Big-O；判断"跑多久"要把常数估回来`}
  ],
  ext:[
    {t:`把估算的对数域加法系统化，就是对数尺度`, go:'ns.log_scale'},
    {t:`独立误差按 √n 累加是中心极限定理的影子`, go:'pr.clt'},
    {t:`算法跑多久 = 复杂度 × 单步时间的估算`, go:'py.bigo'}
  ]
},

'ns.percent': {
  layers:{
    alg:`x% 的 y = xy/100 = y% 的 x：乘法交换律。涨 p 再跌 p 是 (1+p)(1−p) = 1−p²，永远小于 1。从 a 到 b 的变化率是 (b−a)/a，分母是起点。`,
    geo:`一个正方形边长 1，涨 p 是往外推 p，跌 p 是往里缩 p，得到的矩形 (1+p)×(1−p) 面积比正方形少了角上那块 p²。`,
    comp:`机器里百分比就是乘一个因子；连续涨跌就是因子连乘，永远不加。归一化 (x−min)/(max−min) 也是同一件事：先减起点再除起点尺度。`
  },
  proof:{
    from:`百分比定义：x% = x/100；乘法交换律与分配律`,
    to:`x% of y = y% of x；(1+p)(1−p) = 1−p²；a→b 与 b→a 的变化率不对称`,
    steps:[
      [`x% of y = (x/100)·y = xy/100 = (y/100)·x = y% of x`, `实数乘法可交换，两个式子是同一个数的两种写法`],
      [`10% of y = y/10，5% = 10%/2，1% = 10%/10，15% = 10% + 5%`, `分配律 (a+b)y = ay + by 让任何百分比都能拆成 10% 的整数倍加半格`],
      [`涨 p：y → y(1+p)；再跌 p：y(1+p)(1−p)`, `"涨 p%"的意思是新值 = 旧值 × (1+p)，第二次的基数是第一次的结果`],
      [`(1+p)(1−p) = 1 − p + p − p² = 1 − p²`, `平方差公式；交叉项恰好抵消，只剩负的 p²`],
      [`p ≠ 0 时 1−p² < 1，所以涨跌同幅永远亏，且顺序无关`, `p² > 0；乘法可交换，先跌后涨也是 (1−p)(1+p)`],
      [`a→b 变化率 = (b−a)/a，b→a 变化率 = (a−b)/b，二者绝对值之比 = b/a ≠ 1`, `变化率的分母是起点；两次起点不同，同样的差 |b−a| 除以不同的数`],
      [`百分点 vs 百分比：10% → 12% 是 +2 个百分点，但相对变化是 2/10 = +20%`, `百分点是差，百分比是比；单位不同，不能互换`]
    ],
    end:`百分比是乘法因子，不是加法量。所有"涨跌不对称""连乘不能加"的坑都来自把因子当成了加数。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
x, y = rng.uniform(1, 100, 5), rng.uniform(1, 100, 5)
print("x% of y == y% of x:", np.allclose(x/100*y, y/100*x))
for p in [0.1, 0.2, 0.5]:
    print(f"up {p:.0%} then down {p:.0%}: factor={(1+p)*(1-p):.4f}  1-p^2={1-p*p:.4f}")
a, b = 80, 100
print(f"{a}->{b}: {(b-a)/a:+.1%}   {b}->{a}: {(a-b)/b:+.1%}")
print("10%->12%: +{} pct points, {:+.0%} relative".format(12-10, (12-10)/10))
# 连乘 vs 相加：交替涨跌 10% 二十次
f = np.prod([1.1, 0.9]*10)
print(f"20 alternating +-10%: product={f:.4f}  naive-sum=1.0000")`,
    out:`x% of y == y% of x: True
up 10% then down 10%: factor=0.9900  1-p^2=0.9900
up 20% then down 20%: factor=0.9600  1-p^2=0.9600
up 50% then down 50%: factor=0.7500  1-p^2=0.7500
80->100: +25.0%   100->80: -20.0%
10%->12%: +2 pct points, +20% relative
20 alternating +-10%: product=0.9044  naive-sum=1.0000`,
    note:`第 1 行是第 1 步；factor 与 1−p² 相等是第 4 步；80↔100 是第 6 步；最后一行验证连乘偏离"加起来为 0"的直觉。`
  },
  contrast:[
    {vs:`百分点 (percentage point)`, same:`都带 %`, diff:`百分点是两个比率的差，百分比是比；10%→12% 是 2 个百分点、20% 的相对变化`, when:`比较两个比率用百分点；描述增长倍数用百分比`},
    {vs:`对数收益 ln(b/a)`, same:`都描述 a→b 的变化`, diff:`对数收益是对称的 ln(b/a) = −ln(a/b)，可以直接相加；百分比不对称、不能相加`, when:`多期复合、要加总用对数收益；给人看用百分比`},
    {vs:`归一化 da.normalize`, same:`都是"减起点再除尺度"`, diff:`百分比的尺度是起点自己，归一化的尺度是全距或标准差`, when:`单个量的变化用百分比；多特征对齐用归一化`}
  ],
  ext:[
    {t:`固定增长率连乘 → 翻倍时间`, go:'al.doubling'},
    {t:`ln(1+p) ≈ p 让小百分比在对数域可加`, go:'al.log_trap'},
    {t:`平均"率"要看分母，百分比的分母是起点`, go:'ns.average_trap'}
  ]
},

'ns.abacus': {
  layers:{
    alg:`十进制位值表示唯一：n = Σ d_k·10^k，0 ≤ d_k ≤ 9。每档一颗上珠值 5、四颗下珠各值 1，所以档内状态 (u,l) ∈ {0,1}×{0..4} 恰好编码 0-9 共 10 个数。补数：+b = +10 − (10−b)。`,
    geo:`一排竖档，每档的珠子位置就是一个数字的形状。加法是把珠子推向横梁；推不动就在左边一档推一颗、本档退回补数。整个过程是图形的移动，不是符号的运算。`,
    comp:`机器实现就是带进位的按位加法：每档 s = d + b，s ≥ 10 则本档 s−10、左档 +1。补数法只是把"s−10"写成"先 +10 再 −(10−b)"。`
  },
  proof:{
    from:`十进制位值制；每档珠子 (上珠 u ∈ {0,1}, 下珠 l ∈ {0,…,4})，档值 5u + l`,
    to:`珠子状态与 0-9 一一对应；补数法 +b = +10 − (10−b) 与直接进位等价；珠算加法结果正确`,
    steps:[
      [`档值 5u + l 的取值：u=0 给 0..4，u=1 给 5..9，共 10 个互不重复`, `两组值域不相交且并集恰为 0..9，所以映射是双射：一个数字一种珠形`],
      [`加 b 到某档：若 d + b ≤ 9，直接推珠；否则 d + b = 10 + (d + b − 10)`, `十进制一档最多存 9，超出的 10 必须以 1 的形式进到左档，这是位值制的定义`],
      [`d + b − 10 = d − (10 − b)`, `整理括号；10 − b 就是 b 的十补数，所以"进 1 再减补数"和"直接算 d+b−10"是同一个数`],
      [`先进位再减补数的顺序：左档 +1 与本档 −(10−b) 相互独立，任一顺序结果相同`, `两个操作作用在不同档上，加法可交换；口诀取"先进位"只是为了防止忘记`],
      [`5 的补数：d + b 在 5..9 内但下珠不够时，+b = +5 − (5 − b)`, `同一档内上珠值 5，把 b 拆成 5 − (5−b)，只改本档不涉及进位`],
      [`多档相加按低位到高位处理，每档进位最多 1`, `一档 d + b + carry ≤ 9 + 9 + 1 = 19 < 20，所以进位只会是 0 或 1`],
      [`减法 −b = −10 + (10 − b)：借 1 再加补数`, `第 3 步的等式两边取负号`]
    ],
    end:`珠算的全部口诀都是"位值制 + 一步等式变形"的产物。它把数字外化成空间状态，让工作记忆只存一张图。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
def beads(n, rods=6):
    d = [(n // 10**k) % 10 for k in range(rods)]          # 低位在前
    return [(x // 5, x % 5) for x in d]                     # (上珠, 下珠)
def val(b): return sum((5*u + l) * 10**k for k, (u, l) in enumerate(b))
def add(b, m):
    b = [list(r) for r in b]; carry = 0
    for k in range(len(b)):
        digit = (m // 10**k) % 10
        s = 5*b[k][0] + b[k][1] + digit + carry
        if s >= 10: carry, s = 1, s - 10        # 进位再减补数
        else: carry = 0
        b[k] = [s // 5, s % 5]
    return [tuple(r) for r in b]
print("7 beads:", beads(7)[0], " 27+39 ->", val(add(beads(27), 39)))
print("6+8 by complement: 6+10-(10-8) =", 6+10-(10-8))
ok = all(val(add(beads(a), b)) == a + b for a, b in rng.integers(0, 50000, size=(2000, 2)))
print("2000 random abacus additions correct:", ok)`,
    out:`7 beads: (1, 2)  27+39 -> 66
6+8 by complement: 6+10-(10-8) = 14
2000 random abacus additions correct: True`,
    note:`beads 的 (x//5, x%5) 是第 1 步的双射；add 里 s ≥ 10 时 carry=1、s−10 就是第 2-3 步；随机测试验证第 6 步整体正确。`
  },
  contrast:[
    {vs:`竖式笔算`, same:`同样是按位进位`, diff:`笔算从符号到符号，珠算从图形到图形；珠算把"9+1 进位"变成"退 9 颗珠推 1 颗"的空间动作`, when:`要留下过程用笔算；要快且不占语言区用珠算`},
    {vs:`二进制加法 di.bits`, same:`都是位值制加法带进位`, diff:`一档只有两态、进位阈值是 2；补数变成 2 的补码`, when:`人算十进制；机器算二进制，思路一样`},
    {vs:`补数 vs 补码`, same:`都是"用减法代替加法"的技巧`, diff:`十补数 10−b 是一档内的量；二进制补码是整个字长 2^n − b，用来表示负数`, when:`珠算用补数消进位；计算机用补码消减法器`}
  ],
  ext:[
    {t:`把补数思想推到整个字长，就是补码和位运算`, go:'di.bits'},
    {t:`乘法速算也是"拆成好算的块"`, go:'ns.mental_mult'},
    {t:`数字当字符串按位处理`, go:'py.string'}
  ]
},

'ns.factor': {
  layers:{
    alg:`n = ∏ p_i^{a_i} 且表示唯一。因数个数 d(n) = ∏(a_i+1)。gcd 取指数 min，lcm 取 max，min+max = a+b 给出 gcd·lcm = ab。`,
    geo:`n 是一棵分解树，怎么劈叶子集合都一样；因数是从每个 p_i 的 0..a_i 层各选一层的格点，共 ∏(a_i+1) 个格点。`,
    comp:`试除：从 2 试到 √n，除尽就一直除同一个质数直到除不动。跳出循环时若剩余 > 1，它本身是质数。`
  },
  proof:{
    from:`整除的定义；欧几里得引理：质数 p | ab ⇒ p | a 或 p | b`,
    to:`存在唯一质因数分解；d(n) = ∏(a_i+1)；gcd·lcm = ab；试除只需到 √n`,
    steps:[
      [`存在性（强归纳）：n ≥ 2 若为质数已完成；否则 n = ab，1 < a,b < n，a、b 各有分解，拼起来即 n 的分解`, `强归纳假设对所有小于 n 的数成立；合数按定义能拆成两个更小的因子`],
      [`唯一性：设 p_1…p_r = q_1…q_s 两种分解，则 p_1 | q_1…q_s`, `左边被 p_1 整除，右边等于左边`],
      [`由欧几里得引理，p_1 整除某个 q_j，而 q_j 是质数，所以 p_1 = q_j`, `引理反复用到乘积的每个因子；质数的因子只有 1 和自己`],
      [`两边约去 p_1 = q_j，对剩下的更短乘积重复，最终两边质数一一对应`, `归纳到长度 0；每一步都消掉一对相同质数`],
      [`因数个数：n 的因数 d = ∏ p_i^{b_i}，0 ≤ b_i ≤ a_i，每个 b_i 有 a_i+1 种独立选择`, `由唯一性，d 的质因数只能是 n 的质因数且指数不超过 a_i；乘法原理计数`],
      [`gcd 的指数是 min(a_i,b_i)，lcm 是 max(a_i,b_i)；min + max = a_i + b_i`, `公因数要同时被两者整除，指数取小；公倍数要被两者整除，指数取大；两数中一个是 min 另一个是 max`],
      [`所以 gcd·lcm = ∏ p^{min+max} = ∏ p^{a+b} = ab`, `第 6 步逐质数相加指数，再合并为 a·b`],
      [`试除到 √n：若 n = ab 且 a ≤ b，则 a ≤ √n`, `否则 a > √n 且 b ≥ a > √n 给出 ab > n，矛盾；所以合数必有不超过 √n 的因子`]
    ],
    end:`唯一分解是"质数是数的 DNA"这句话的数学内容；因数个数、gcd、lcm 全从指数向量的逐位运算读出。`
  },
  scratch:{
    lang:'python',
    code:`import math, random
def factor(n):
    f, p = {}, 2
    while p * p <= n:                      # 只试到 sqrt(n)
        while n % p == 0: f[p] = f.get(p, 0) + 1; n //= p
        p += 1
    if n > 1: f[n] = f.get(n, 0) + 1
    return f
def ndiv(f):
    r = 1
    for a in f.values(): r *= a + 1
    return r
print("360 =", factor(360), " divisors:", ndiv(factor(360)), " brute:", sum(360 % d == 0 for d in range(1, 361)))
print("91 =", factor(91), " 1001 =", factor(1001))
random.seed(0)
ok = True
for _ in range(500):
    a, b = random.randint(2, 10**6), random.randint(2, 10**6)
    fa, fb = factor(a), factor(b)
    ps = set(fa) | set(fb)
    g = math.prod(p ** min(fa.get(p,0), fb.get(p,0)) for p in ps)
    l = math.prod(p ** max(fa.get(p,0), fb.get(p,0)) for p in ps)
    ok &= (g == math.gcd(a, b)) and (g * l == a * b) and (math.prod(p**e for p, e in fa.items()) == a)
print("500 random: gcd via min-exp ok, gcd*lcm==ab ok, refactor==n ok:", ok)`,
    out:`360 = {2: 3, 3: 2, 5: 1}  divisors: 24  brute: 24
91 = {7: 1, 13: 1}  1001 = {7: 1, 11: 1, 13: 1}
500 random: gcd via min-exp ok, gcd*lcm==ab ok, refactor==n ok: True`,
    note:`while p*p <= n 是第 8 步；ndiv 是第 5 步；min/max 指数拼出的 g、l 满足 g·l = ab 是第 6-7 步；refactor==n 验证分解正确。`
  },
  contrast:[
    {vs:`欧几里得算法 di.gcd`, same:`都求 gcd`, diff:`欧几里得不需要分解，只做取余，复杂度 O(log n)；分解法要试除到 √n`, when:`只要 gcd 用欧几里得；要因数个数、lcm 结构、判质数才分解`},
    {vs:`质数判定 di.prime`, same:`都试除到 √n`, diff:`判质数遇到第一个因子就停；分解要把每个质因子除干净并继续`, when:`只问是否质数早停；要指数向量才完整分解`},
    {vs:`整除判定 ns.divisibility`, same:`都在问"能否被 m 整除"`, diff:`判定法是 mod 的性质，不给出商也不分解；分解要把商继续拆`, when:`快速筛掉 2、3、5、11 的倍数用判定法，再对剩下的试除`}
  ],
  ext:[
    {t:`不分解直接求 gcd：辗转相除`, go:'di.gcd'},
    {t:`质数与判定`, go:'di.prime'},
    {t:`mod 运算把整除问题变成有限集运算`, go:'di.modular'}
  ]
},

'ns.log_scale': {
  layers:{
    alg:`log(ab) = log a + log b 来自 10^x·10^y = 10^{x+y}。n 的位数 = ⌊lg n⌋ + 1，首位数字由 lg n 的小数部分 10^{frac} 决定。`,
    geo:`一把尺子，每格代表乘 10。任何正数在尺上的位置是 lg n；乘法是把两段首尾相接，幂是把一段重复 k 次。`,
    comp:`np.log 后再做加减；画图 set_yscale('log')。0 和负数没有 log，机器会给 −inf 或 nan，先加偏移。`
  },
  proof:{
    from:`指数律 10^x·10^y = 10^{x+y}；lg 是 10^x 的反函数且严格增`,
    to:`lg(ab) = lg a + lg b；lg(a^k) = k·lg a；位数 = ⌊lg n⌋ + 1；lg(a+b) 无公式`,
    steps:[
      [`令 x = lg a，y = lg b，即 a = 10^x，b = 10^y`, `lg 是 10^x 在 (0,∞) 上的反函数，任何正数都能这样写`],
      [`ab = 10^x·10^y = 10^{x+y}`, `指数律：x 个 10 和 y 个 10 相乘是 x+y 个 10（推广到实数后仍成立）`],
      [`两边取 lg：lg(ab) = x + y = lg a + lg b`, `lg 是 10^t 的反函数，lg(10^{x+y}) = x+y`],
      [`a^k = (10^x)^k = 10^{kx}，取 lg 得 k·lg a`, `幂的幂指数相乘；再用反函数`],
      [`n 有 d 位 ⇔ 10^{d−1} ≤ n < 10^d ⇔ d−1 ≤ lg n < d ⇔ d = ⌊lg n⌋ + 1`, `d 位数的范围就是这两个 10 的幂之间；lg 严格增保持不等号；取整定义`],
      [`写 lg n = m + f，0 ≤ f < 1，则 n = 10^f × 10^m，首位数字 = ⌊10^f⌋`, `10^f ∈ [1,10) 正是科学计数法的尾数，它的整数部分就是首位`],
      [`lg(a+b) = lg a + lg(1 + b/a)，没有只含 lg a、lg b 的闭式`, `加法在指数域没有对应的简单运算；只能提出较大项再处理 1+b/a`]
    ],
    end:`对数把乘法群同构到加法群，所以跨量级的量只能在对数域比较、相加、画图。位数和首位都是 lg 的整数与小数部分。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np, math
rng = np.random.default_rng(0)
a, b = rng.uniform(1, 1e6, 1000), rng.uniform(1, 1e6, 1000)
print("lg(ab)=lg a+lg b:", np.allclose(np.log10(a*b), np.log10(a)+np.log10(b)))
print("lg(a+b) vs lg a+lg b differ:", np.abs(np.log10(a+b) - (np.log10(a)+np.log10(b))).max().round(2))
for n in [2**10, 2**100, 3**42]:
    L = math.log10(n); digits = math.floor(L) + 1; lead = int(10**(L - math.floor(L)))
    print(f"lg={L:.3f} digits={digits} lead={lead}  true: {len(str(n))} {str(n)[0]}")
print("pH 7->4 ratio:", 10**(7-4), " ln20 ~ ln2+ln10 =", round(math.log(2)+math.log(10), 3), "true", round(math.log(20), 3))`,
    out:`lg(ab)=lg a+lg b: True
lg(a+b) vs lg a+lg b differ: 5.69
lg=3.010 digits=4 lead=1  true: 4 1
lg=30.103 digits=31 lead=1  true: 31 1
lg=20.039 digits=21 lead=1  true: 21 1
pH 7->4 ratio: 1000  ln20 ~ ln2+ln10 = 2.996 true 2.996`,
    note:`第 1 行是第 3 步；第 2 行是第 7 步（加法没公式）；位数与首位两列相等验证第 5-6 步。`
  },
  contrast:[
    {vs:`线性尺度`, same:`都是一条数轴`, diff:`线性尺上等距 = 等差，对数尺上等距 = 等比；指数增长在线性尺上是爆炸曲线，在对数尺上是直线`, when:`量跨 3 个量级以上用对数尺；只关心绝对差用线性`},
    {vs:`symlog / log(1+x)`, same:`都想压缩大数`, diff:`纯 log 在 0 处发散且不接受负数；log1p 或 symlog 在 0 附近改成线性`, when:`计数数据有 0（表达量、reads）用 log1p；有正负用 symlog`},
    {vs:`不同底 ln / lg / log2`, same:`都是对数，仅差常数倍`, diff:`ln 用于微积分（导数 1/x），lg 用于位数，log2 用于比特与翻倍`, when:`换底 log_a b = ln b / ln a，比大小任意底，报数值要说清底`}
  ],
  ext:[
    {t:`比大数就是比对数域长度`, go:'ns.max_digits'},
    {t:`对数只拆乘除不拆加减，log-sum-exp 是那个例外的处理办法`, go:'al.log_trap'},
    {t:`画图时切对数轴`, go:'vz.log_axis'}
  ]
},

'ns.magnitude': {
  layers:{
    alg:`任何正数写成 m×10^k，1 ≤ m < 10；k 是数量级。2^{10} = 1024 = 1.024×10^3，所以 2^{10j} = 1.024^j × 10^{3j}，"2^10 ≈ 10^3" 每用一次多 2.4% 误差。`,
    geo:`10 的幂是一段阶梯，每级高 1（对数域）。一个数站在哪级由 ⌊lg n⌋ 决定；差一级就是 10 倍，差 3 级就是千倍，小数点的位置在这个尺度下看不见。`,
    comp:`运算次数 / 每秒次数 = 秒数；只算指数：10^{12}/10^9 = 10^3 秒。内存同理：元素数 × 每元素字节数，看 2 的多少次方。`
  },
  proof:{
    from:`科学计数法 n = m×10^k，1 ≤ m < 10 唯一；2^{10} = 1024`,
    to:`数量级 k = ⌊lg n⌋；2^{10j} ≈ 10^{3j} 的相对误差是 1.024^j − 1；中英分组差异来自 10^4 与 10^3`,
    steps:[
      [`n = m×10^k 中 lg n = lg m + k，且 0 ≤ lg m < 1`, `1 ≤ m < 10 取 lg 后落在 [0,1)`],
      [`所以 k = ⌊lg n⌋：数量级就是 lg 的整数部分`, `k 是整数，lg m 是小数部分，取整只剩 k`],
      [`两个数的数量级差 = ⌊lg a⌋ − ⌊lg b⌋，差 1 意味着比值在 (1, 100) 之间，典型 10`, `⌊lg a⌋ − ⌊lg b⌋ = 1 时 lg(a/b) ∈ (0, 2)；粗判用 10`],
      [`2^{10} = 1024 = 1.024 × 10^3，于是 2^{10j} = (1.024)^j × 10^{3j}`, `幂的乘法：(2^{10})^j = 1024^j = (1.024×10^3)^j`],
      [`相对误差 1.024^j − 1 ≈ 0.024j（小 j）：1 GB = 2^{30} 比 10^9 多 7.4%`, `(1+ε)^j ≈ 1 + jε；j=3 精确值 1.0737`],
      [`中文按 10^4 分组（万、亿 = 10^8），英文按 10^3（thousand、million = 10^6、billion = 10^9）`, `万 = 10^4，亿 = 万万 = 10^8；billion = 10^3 × million = 10^9`],
      [`O(n²) 在 n = 10^6 上需要 10^{12} 步，每秒 10^9 步则 10^3 秒`, `除法在指数域是减法：12 − 9 = 3`]
    ],
    end:`数量级是 lg 的整数部分，差一级就是不同的问题。2^10 ≈ 10^3 的误差可控但会累积，换算时记住 1.024^j。`
  },
  scratch:{
    lang:'python',
    code:`import math
def mag(n): return math.floor(math.log10(n))
for n in [1e8, 3e13, 2**30, 365*86400]:
    print(f"{n:.3g}: k={mag(n)}  m={n/10**mag(n):.3f}")
for j in [1, 2, 3, 4]:
    print(f"2^{10*j} / 10^{3*j} = {2**(10*j)/10**(3*j):.4f}   1.024^{j}={1.024**j:.4f}")
print("1 billion = 10^", mag(10**9), " ; 一亿 = 10^", mag(10**8))
print("O(n^2) n=1e6 at 1e9/s:", 10**12 / 10**9, "s =", round(10**12/10**9/60, 1), "min")`,
    out:`1e+08: k=8  m=1.000
3e+13: k=13  m=3.000
1.07e+09: k=9  m=1.074
3.15e+07: k=7  m=3.154
2^10 / 10^3 = 1.0240   1.024^1=1.0240
2^20 / 10^6 = 1.0486   1.024^2=1.0486
2^30 / 10^9 = 1.0737   1.024^3=1.0737
2^40 / 10^12 = 1.0995   1.024^4=1.0995
1 billion = 10^ 9  ; 一亿 = 10^ 8
O(n^2) n=1e6 at 1e9/s: 1000.0 s = 16.7 min`,
    note:`mag 是第 2 步；2^{10j}/10^{3j} 与 1.024^j 两列相等是第 4-5 步；最后一行是第 7 步。`
  },
  contrast:[
    {vs:`估算 ns.estimate`, same:`都先看 10^k`, diff:`数量级只保留 k，估算还保留一位有效数字 m`, when:`问"能不能做"看数量级；问"大约多少"要估算`},
    {vs:`Big-O di.big_o`, same:`都忽略常数看增长`, diff:`Big-O 描述 n → ∞ 时函数的增长阶，数量级描述一个具体数的大小`, when:`比较算法用 Big-O；把算法代入具体 n 后问跑多久用数量级`},
    {vs:`二进制量级 2^{10}`, same:`都是"约等于 1000 倍"的台阶`, diff:`KiB/MiB/GiB 是 2^{10j}，KB/MB/GB 是 10^{3j}，每级差 2.4%`, when:`内存、张量大小按 2 的幂；论文里报 10 的幂`}
  ],
  ext:[
    {t:`把量级判断做成算法增长阶的语言`, go:'di.big_o'},
    {t:`量级超过 float 范围就溢出`, go:'np.overflow'},
    {t:`修尾数一位有效数字就是估算`, go:'ns.estimate'}
  ]
},

'ns.mental_mult': {
  layers:{
    alg:`分配律 (a+b)(c+d) = ac+ad+bc+bd 是所有速算的母式。乘 11：(10a+b)·11 = 100a + 10(a+b) + b。平方差 (a+b)(a−b) = a²−b²。×25 = ×100÷4。`,
    geo:`长方形面积按横竖各切一刀分成四块，四块面积之和就是乘积；凑整就是让某些块的边长变成 0 或 10 的倍数。`,
    comp:`向量化时也是分块：大矩阵乘法按块相乘再相加，就是分配律；机器的"凑整"是让块大小对齐缓存。`
  },
  proof:{
    from:`乘法分配律与交换律；10 进制位值`,
    to:`乘 11 错位相加法则；(a+b)(a−b) = a²−b²；×25 = ×100÷4；近整数乘法 (100−x)(100+y)`,
    steps:[
      [`两位数 10a + b 乘 11 = (10a+b)·10 + (10a+b) = 100a + 10b + 10a + b`, `11 = 10 + 1，分配律拆成两项，第一项就是左移一位`],
      [`合并同类项：100a + 10(a+b) + b`, `十位上收集了 b（来自左移）和 a（来自原数），所以中间位是 a+b`],
      [`若 a+b ≥ 10，则 10(a+b) = 100 + 10(a+b−10)，百位进 1`, `位值制每位最多 9，超出的 10 个十进为 1 个百`],
      [`(a+b)(a−b) = a² − ab + ab − b² = a² − b²`, `分配律展开四项，交叉项 −ab 与 +ab 抵消`],
      [`两数关于中心 a 对称（a−d 与 a+d）时，乘积 = a² − d²：97×103 = 100² − 3²`, `令 b = d 代入第 4 步；中心取整十整百让 a² 好算`],
      [`x × 25 = x × 100 / 4，x × 5 = x × 10 / 2`, `25 = 100/4，乘法结合律 x·(100/4) = (x·100)/4`],
      [`一般乘法 (10a+b)(10c+d) = 100ac + 10(ad+bc) + bd，按"大头先算再修小头"的顺序累加`, `分配律给出四块；先算 100ac 是因为它决定量级，误差最不允许出在这里`]
    ],
    end:`速算 = 分配律 + 选择好算的分块。凑整的本质是让某些块含因子 10，让某些块互相抵消。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
def mul11(n):                                   # 两位数乘 11：首尾不动中间相加
    a, b = divmod(n, 10); mid = a + b
    return 100*a + 10*mid + b                    # 进位由算术自动完成
print("78*11:", mul11(78), 78*11, " 87*11:", mul11(87), 87*11)
print("98*102 = 100^2 - 2^2 =", 100**2 - 2**2, "==", 98*102)
print("36*25 = 36*100/4 =", 36*100//4, "==", 36*25)
a, b, c, d = rng.integers(1, 10, 4)
print(f"({10*a}+{b})({10*c}+{d}): blocks {100*a*c}+{10*(a*d+b*c)}+{b*d} =", 100*a*c + 10*(a*d+b*c) + b*d, "==", (10*a+b)*(10*c+d))
x = rng.integers(10, 100, 500)
print("(a+d)(a-d)==a^2-d^2 for 500 random:", np.all((x+7)*(x-7) == x*x - 49))
print("47*23 via 47*20+47*3 =", 47*20 + 47*3)`,
    out:`78*11: 858 858  87*11: 957 957
98*102 = 100^2 - 2^2 = 9996 == 9996
36*25 = 36*100/4 = 900 == 900
(80+6)(50+3): blocks 4000+540+18 = 4558 == 4558
(a+d)(a-d)==a^2-d^2 for 500 random: True
47*23 via 47*20+47*3 = 1081`,
    note:`mul11 的 100a + 10(a+b) + b 是第 1-3 步；平方差行是第 4-5 步；×25 行是第 6 步；四块展开是第 7 步。`
  },
  contrast:[
    {vs:`平方速算 ns.square_trick`, same:`都用 (a+d)(a−d) = a²−d²`, diff:`乘法速算把乘积换成平方减，平方速算反过来把平方换成好算乘积加小平方`, when:`两数对称用乘法速算；单个数平方用平方速算`},
    {vs:`吠陀数学 纵横法 vd.urdhva`, same:`都是 (10a+b)(10c+d) 的分块`, diff:`纵横法把 ad+bc 交叉项固化成书写格式，本节只用分配律不定格式`, when:`三位以上或大量重复计算用纵横法格式；两位数心算直接分块`},
    {vs:`竖式乘法`, same:`结果相同`, diff:`竖式按位从低到高，先算最不重要的位；速算先算 100ac 大头`, when:`要精确写下来用竖式；心算和估算先大头`}
  ],
  ext:[
    {t:`平方数速算`, go:'ns.square_trick'},
    {t:`乘法分块就是矩阵分块乘法与向量化`, go:'np.vectorize'},
    {t:`(a+b)^n 展开是分配律的 n 次推广`, go:'co.binomial'}
  ]
},

'ns.square_trick': {
  layers:{
    alg:`(10a+5)² = 100a² + 100a + 25 = 100a(a+1) + 25。a² = (a+d)(a−d) + d²。√(a²+ε) ≈ a + ε/2a，误差约 ε²/(8a³)。平方数 mod 10 只能是 0,1,4,5,6,9。`,
    geo:`n² 是边长 n 的正方形；(n+1)² 多出一个 L 形，面积 n + n + 1。尾 5 的正方形可以剪成 a(a+1) 个百格加一个 5×5 的角。`,
    comp:`机器不心算，但牛顿法开方 x ← (x + n/x)/2 的第一步正好就是 a + ε/2a；这段推导就是牛顿迭代的第一次更新。`
  },
  proof:{
    from:`分配律；(x+y)² = x² + 2xy + y²`,
    to:`尾 5 平方公式；邻居平方法；平方差法；开方线性近似及其误差`,
    steps:[
      [`(10a+5)² = 100a² + 2·10a·5 + 25 = 100a² + 100a + 25`, `完全平方公式，交叉项 2·10a·5 = 100a`],
      [`100a² + 100a = 100a(a+1)`, `提公因式 100a；所以结果是 a(a+1) 后面接 25`],
      [`(n+1)² = n² + 2n + 1，(n−1)² = n² − 2n + 1`, `完全平方；2n+1 是正方形边加 1 多出的 L 形面积`],
      [`(a+d)(a−d) = a² − d²，移项得 a² = (a+d)(a−d) + d²`, `平方差公式；选 d 让 a+d 或 a−d 成为整十，乘法变简单`],
      [`√(a²+ε)：令 f(x) = √x，f'(x) = 1/(2√x)，在 x = a² 处线性化得 a + ε/(2a)`, `一阶泰勒 f(x₀+ε) ≈ f(x₀) + f'(x₀)ε；√ 的导数是 1/(2√x)`],
      [`误差：二阶项 f''(a²)ε²/2 = −ε²/(8a³)，所以线性近似总是偏大`, `f'' = −1/(4x^{3/2})，代入 x = a²；负号说明 √ 是凹函数，切线在曲线上方`],
      [`平方数末位：n mod 10 ∈ {0..9} 的平方 mod 10 为 {0,1,4,9,6,5,6,9,4,1}`, `n² mod 10 只依赖 n mod 10，十种情况穷举；集合里没有 2,3,7,8`]
    ],
    end:`平方速算全是完全平方与平方差的重排；开方近似是泰勒一阶项，也是牛顿法的第一步。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
a = rng.integers(1, 20, 300)
print("tail-5 rule (10a+5)^2 == 100a(a+1)+25:", np.all((10*a+5)**2 == 100*a*(a+1) + 25), " 65^2 =", 100*6*7+25)
n = rng.integers(10, 100, 300)
print("(n+1)^2 == n^2+2n+1:", np.all((n+1)**2 == n*n + 2*n + 1), " 31^2 =", 900 + 60 + 1)
print("48^2 = 46*50 + 2^2 =", 46*50 + 4, "==", 48*48)
for A, eps in [(7, 1), (10, 1), (7, 5)]:
    approx = A + eps/(2*A); true = np.sqrt(A*A + eps)
    print(f"sqrt({A*A+eps}): approx={approx:.5f} true={true:.5f} err={approx-true:+.2e} bound={eps**2/(8*A**3):.2e}")
print("square last digits:", sorted({(k*k) % 10 for k in range(10)}))`,
    out:`tail-5 rule (10a+5)^2 == 100a(a+1)+25: True  65^2 = 4225
(n+1)^2 == n^2+2n+1: True  31^2 = 961
48^2 = 46*50 + 2^2 = 2304 == 2304
sqrt(50): approx=7.07143 true=7.07107 err=+3.61e-04 bound=3.64e-04
sqrt(101): approx=10.05000 true=10.04988 err=+1.24e-04 bound=1.25e-04
sqrt(54): approx=7.35714 true=7.34847 err=+8.67e-03 bound=9.11e-03
square last digits: [0, 1, 4, 5, 6, 9]`,
    note:`第 1 行是第 1-2 步；第 2 行是第 3 步；48² 行是第 4 步；sqrt 表的 err 为正且接近 bound 是第 5-6 步；末位集合是第 7 步。`
  },
  contrast:[
    {vs:`乘法速算 ns.mental_mult`, same:`共用平方差`, diff:`本节是把平方拆成好算乘积，乘法速算是把对称乘积换成平方`, when:`算 n² 用本节；算 (a+d)(a−d) 用乘法速算`},
    {vs:`牛顿法开方`, same:`线性近似 a + ε/2a 就是牛顿迭代第一步`, diff:`牛顿法会继续迭代到收敛，心算只做一步`, when:`心算一步够用到 3 位；程序里多迭代几次到机器精度`},
    {vs:`吠陀 Yavadunam 平方法 vd.yavaduna`, same:`都用离整十的偏差 d`, diff:`Yavadunam 写成 (a+d)·基数 + d² 的固定格式，本节把它归为平方差恒等式`, when:`大量练习时用固定格式；理解原理看本节推导`}
  ],
  ext:[
    {t:`一阶线性近似的一般形式`, go:'ca.taylor'},
    {t:`乘法速算共享平方差恒等式`, go:'ns.mental_mult'},
    {t:`完全平方是配方法的起点`, go:'al.quadratic'}
  ]
},

'ns.divisibility': {
  layers:{
    alg:`n = Σ d_k·10^k；对 m 取模只需知道 10^k mod m。mod 9：10 ≡ 1 ⇒ n ≡ Σd_k。mod 11：10 ≡ −1 ⇒ n ≡ Σ(−1)^k d_k。mod 4：10² ≡ 0 ⇒ 只看末两位。mod 7：10 的逆是 5，n = 10q + r ⇒ 5n ≡ q − 2r。`,
    geo:`每个 10^k 在模 m 的圆盘上落到一个位置；mod 9 全落在 1，mod 11 在 1 和 −1 之间跳，mod 4 从 k=2 起全落在 0。判定法就是把每个数位乘以它落点的位置再相加。`,
    comp:`程序里直接 n % m；判定法的价值在于证明 n % 9 == digitsum(n) % 9，这是校验位、哈希、快速筛的基础。`
  },
  proof:{
    from:`同余的加法与乘法性质：a ≡ b, c ≡ d (mod m) ⇒ a+c ≡ b+d，ac ≡ bd`,
    to:`3/9、11、4/8、7 的整除判定法；互质因子才能合并`,
    steps:[
      [`n = Σ d_k 10^k，对 m 取模：n ≡ Σ d_k (10^k mod m)`, `同余对加法和乘法封闭，逐项替换 10^k 为它的余数`],
      [`m = 9：10 ≡ 1 ⇒ 10^k ≡ 1^k = 1 ⇒ n ≡ Σ d_k`, `同余的乘法性质反复用 k 次；数位和就出来了。m = 3 同理因为 10 ≡ 1 (mod 3)`],
      [`m = 11：10 ≡ −1 ⇒ 10^k ≡ (−1)^k ⇒ n ≡ d_0 − d_1 + d_2 − …`, `(−1)^k 交替；这是"交替和"判定`],
      [`m = 4：10² = 100 ≡ 0 ⇒ k ≥ 2 的项全为 0 ⇒ n ≡ 10d_1 + d_0（末两位）`, `4 | 100 所以更高位对余数无贡献；m = 8 用 1000 ≡ 0，看末三位`],
      [`m = 7：写 n = 10q + r，5·10 = 50 ≡ 1 ⇒ 5 是 10 的逆`, `50 = 7·7 + 1；有逆元说明可以"除以 10"而不改变整除性`],
      [`5n = 50q + 5r ≡ q + 5r ≡ q − 2r (mod 7)，而 7 | n ⇔ 7 | 5n`, `5 ≡ −2 (mod 7)；gcd(5,7)=1 所以乘 5 不改变是否被 7 整除`],
      [`合并判定：2 | n 且 3 | n ⇒ 6 | n；但 2 | n 且 4 | n 推不出 8 | n`, `gcd(2,3)=1 时由唯一分解，2 和 3 的指数各 ≥ 1；2 和 4 不互质，指数信息重叠（12 是反例）`]
    ],
    end:`所有判定法 = 算出 10^k mod m 的模式。理解这一条就能自己推出任何模数的判定，包括 7 的"去末位减两倍"。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
N = rng.integers(1, 10**9, 3000)
digs = lambda n: [int(c) for c in str(n)][::-1]          # d_0 在前
dsum = np.array([sum(digs(n)) for n in N])
alt  = np.array([sum(d*(-1)**k for k, d in enumerate(digs(n))) for n in N])
print("n%9 == digitsum%9:", np.all(N % 9 == dsum % 9), " n%3 == digitsum%3:", np.all(N % 3 == dsum % 3))
print("n%11 == altsum%11:", np.all(N % 11 == alt % 11))
print("n%4 == last2%4:", np.all(N % 4 == (N % 100) % 4), " n%8 == last3%8:", np.all(N % 8 == (N % 1000) % 8))
def rule7(n):
    while n >= 100: n = n // 10 - 2 * (n % 10)
    return n % 7 == 0
print("rule7 matches n%7==0:", all(rule7(int(n)) == (n % 7 == 0) for n in N), " 371:", rule7(371))
print("10^k mod 9,11,4:", [10**k % 9 for k in range(5)], [10**k % 11 for k in range(5)], [10**k % 4 for k in range(5)])
print("12: 2|12 and 4|12 but 8|12?", 12 % 8 == 0)`,
    out:`n%9 == digitsum%9: True  n%3 == digitsum%3: True
n%11 == altsum%11: True
n%4 == last2%4: True  n%8 == last3%8: True
rule7 matches n%7==0: True  371: True
10^k mod 9,11,4: [1, 1, 1, 1, 1] [1, 10, 1, 10, 1] [1, 2, 0, 0, 0]
12: 2|12 and 4|12 but 8|12? False`,
    note:`dsum/alt/last2 三行分别是第 2、3、4 步；rule7 是第 5-6 步；10^k mod 表直接展示第 1 步的落点模式；12 是第 7 步反例。`
  },
  contrast:[
    {vs:`模运算 di.modular`, same:`判定法是 mod 的特例`, diff:`模运算是一整套代数（加乘逆元），判定法只用了 10^k mod m 一个事实`, when:`推新判定法回到模运算；日常用判定法`},
    {vs:`因数分解 ns.factor`, same:`都在判断整除`, diff:`判定法只回答是否整除，不给商；分解给出完整指数向量`, when:`快速筛用判定法；需要结构用分解`},
    {vs:`校验位（ISBN、身份证）`, same:`都是 Σ w_k d_k mod m`, diff:`校验位的权重 w_k 是设计出来抓错的，判定法的权重是 10^k mod m 自然产生的`, when:`理解校验位就把它看成"自定义权重的判定法"`}
  ],
  ext:[
    {t:`同余的完整代数`, go:'di.modular'},
    {t:`离散数学里的整除与 mod 视角`, go:'di.divisibility'},
    {t:`质因数分解决定哪些判定可以合并`, go:'ns.factor'}
  ]
},

'ns.average_trap': {
  layers:{
    alg:`平均速度 = 总路程/总时间 = 2d/(d/a + d/b) = 2ab/(a+b)：速度在分母，所以是调和平均。增长率连乘，所以年均是几何平均 (∏(1+r_i))^{1/n}。HM ≤ GM ≤ AM。`,
    geo:`半圆图：直径 a+b，AM 是半径，GM 是从分点竖起的弦高，HM 是那条弦到圆心的投影。三条线段从长到短，只有 a=b 时重合。`,
    comp:`程序里永远不要直接 mean(rates)：先把率还原成分子分母再合并。groupby 后合并要按样本量加权，否则就是辛普森悖论。`
  },
  proof:{
    from:`平均的定义：总量/总计数；a, b > 0`,
    to:`平均速度是调和平均；平均增长率是几何平均；HM ≤ GM ≤ AM；辛普森悖论的代数条件`,
    steps:[
      [`去程速度 a、回程 b、单程路程 d：总时间 d/a + d/b，总路程 2d`, `速度 = 路程/时间，所以时间 = 路程/速度；两段路程相同`],
      [`平均速度 = 2d/(d/a + d/b) = 2/(1/a + 1/b) = 2ab/(a+b)`, `约掉 d；通分`],
      [`若两段时间相同（各 t），总路程 at + bt，平均 = (a+b)/2`, `此时路程与速度成正比，速度在分子，算术平均`],
      [`增长率 r_1, r_2：两年后 (1+r_1)(1+r_2)，年均 g 满足 (1+g)² = (1+r_1)(1+r_2)`, `年均的定义是"用同一个率连乘两年得到同样结果"`],
      [`GM ≤ AM：(√a − √b)² ≥ 0 ⇒ a + b ≥ 2√(ab)`, `实数平方非负；展开移项即得；等号 ⇔ √a = √b`],
      [`HM ≤ GM：对 1/a、1/b 用第 5 步，(1/a + 1/b)/2 ≥ 1/√(ab)，取倒数得 2ab/(a+b) ≤ √(ab)`, `1/a, 1/b 也是正数；正数取倒数翻转不等号`],
      [`辛普森：A 的两组命中 a_1/n_1 > b_1/m_1 且 a_2/n_2 > b_2/m_2，但 (a_1+a_2)/(n_1+n_2) < (b_1+b_2)/(m_1+m_2) 可以同时成立`, `合并率 = 各组率按分母加权的平均；权重 n_i/(n_1+n_2) 与 m_i/(m_1+m_2) 不同，加权后顺序可翻转`]
    ],
    end:`平均什么、按什么加权，由分母决定。率的分母是时间就调和，连乘就几何，分组合并按样本量加权，否则会被辛普森悖论骗。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
a, b, d = 60.0, 40.0, 120.0
print("avg speed same distance:", 2*d/(d/a + d/b), " harmonic:", 2*a*b/(a+b), " same time:", (a+b)/2)
r = np.array([0.10, 0.30])
print("avg growth:", np.prod(1+r)**(1/len(r)) - 1, " check:", (1+0.1)*(1+0.3), (1+np.prod(1+r)**0.5-1)**2)
x, y = rng.uniform(0.1, 10, 10000), rng.uniform(0.1, 10, 10000)
am, gm, hm = (x+y)/2, np.sqrt(x*y), 2*x*y/(x+y)
print("HM<=GM<=AM all:", np.all(hm <= gm + 1e-12) and np.all(gm <= am + 1e-12))
A = [(1, 1), (1, 10)]; B = [(9, 10), (0, 1)]           # (hits, tries)
each = [ha/na > hb/nb for (ha, na), (hb, nb) in zip(A, B)]
tot  = (sum(h for h, n in A)/sum(n for h, n in A), sum(h for h, n in B)/sum(n for h, n in B))
print("A wins each group:", each, " totals A,B:", [round(t, 3) for t in tot])`,
    out:`avg speed same distance: 48.0  harmonic: 48.0  same time: 50.0
avg growth: 0.19582607431013987  check: 1.4300000000000002 1.4299999999999997
HM<=GM<=AM all: True
A wins each group: [True, True]  totals A,B: [0.182, 0.818]`,
    note:`第 1 行是第 1-3 步；第 2 行是第 4 步；HM≤GM≤AM 是第 5-6 步；最后是第 7 步的辛普森反例。`
  },
  contrast:[
    {vs:`AM-GM 不等式 al.inequality_amgm`, same:`同一条 (√a−√b)² ≥ 0`, diff:`AM-GM 是求最值的工具；本节用它解释三种平均的顺序`, when:`优化用 AM-GM；选平均方式看分母`},
    {vs:`期望 pr.expectation`, same:`都是加权平均`, diff:`期望的权重是概率；本节的权重来自分母（时间、样本量）`, when:`随机变量用期望；实测的率先还原分子分母`},
    {vs:`中位数`, same:`都是"中心"`, diff:`平均对极端值敏感；中位数只看排序位置`, when:`分布偏斜、有离群点报中位数；要可加性用平均`}
  ],
  ext:[
    {t:`AM-GM 的两种证明与 n 项推广`, go:'al.inequality_amgm'},
    {t:`辛普森悖论的因果解释`, go:'ex.simpson'},
    {t:`分组合并的代码实现`, go:'da.groupby'}
  ]
}

});
