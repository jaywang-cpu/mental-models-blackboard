// 数理宇宙 v3 · derive_co：组合大陆 13 节点推导层
// 严格遵守 CONTRACT3.md。旁挂，不改 v1/v2。scratch.out 均为 python3 实跑输出。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

/* ═══════════ 1. co.multiplication_rule 加法与乘法原理 ═══════════ */
'co.multiplication_rule': {
  layers:{
    alg:`|A×B| = |A|·|B|（笛卡尔积），|A⊔B| = |A|+|B|（不交并）。所有计数公式都是这两条的合成。`,
    geo:`乘法是一张网格：行数×列数个格子。加法是把几块互不重叠的区域拼在一起数格子。`,
    comp:`乘法 = 嵌套 for 循环，叶子数是各层分叉数之积；加法 = 并列的几个循环，各自计数后相加。`
  },
  proof:{
    from:`集合的基数；笛卡尔积 A×B = {(a,b)}；不交并 A⊔B（A∩B=∅）`,
    to:`分步相乘：|A×B| = |A||B|；分类相加：|A⊔B| = |A|+|B|`,
    steps:[
      [`把 A×B 按第一分量分组：对每个 a∈A，配对集 {(a,b): b∈B} 与 B 一一对应`, `固定 a 后，(a,b) ↔ b 是双射（去掉 a 就还原 b），基数相同为 |B|`],
      [`这 |A| 个组两两不交且并起来是 A×B`, `第一分量不同的对必不相同；每个对都恰属于第一分量那一组`],
      [`不交并的基数是各块基数之和（加法原理）`, `不交意味着没有元素被数两次，逐块数完就是全部`],
      [`所以 |A×B| = |A| 个 |B| 相加 = |A|·|B|`, `重复加法就是乘法的定义`],
      [`推广到 k 步：|A₁×…×A_k| = Π|A_i|，且允许第 i 步候选集依赖前面的具体选择，只要其大小恒为 n_i`, `分组论证只用到每组大小相同，不用到组的内容相同`],
      [`加法原理要求互斥；有重叠时 |A∪B| = |A|+|B|-|A∩B|`, `重叠部分在两块里各数了一次，多数了一次要减回`]
    ],
    end:`且→乘、或→加，条件分别是每步选项数固定、各类互斥。这是全部计数方法的公理层。`
  },
  scratch:{
    lang:'python',
    code:`import itertools
# 各位互不相同的三位数：乘法原理 9*9*8，与穷举对比
cnt = sum(1 for n in range(100, 1000) if len(set(str(n))) == 3)
print('brute', cnt, 'rule', 9*9*8)
# 分步：|A x B| = |A||B|
A, B = 'abc', 'xyzw'
print('pairs', len(list(itertools.product(A, B))), len(A)*len(B))
# 分类互斥相加 vs 有重叠：骰子 偶数 或 >4
even = {2,4,6}; big = {5,6}
print('naive add', len(even)+len(big), 'union', len(even|big), 'overlap', len(even&big))`,
    out:`brute 648 rule 648
pairs 12 12
naive add 5 union 4 overlap 1`,
    note:`itertools.product 就是推导第 1-4 步的分组；最后一行演示第 6 步：不互斥时直接加会多出交集。`
  },
  contrast:[
    {vs:`容斥原理（inclusion-exclusion）`, same:`都是把总数拆成几块相加`, diff:`加法原理要求块互斥；容斥是块有重叠时的修正版`, when:`分类天然互斥用加法；分不清是否重叠先改分类标准，改不了再容斥`},
    {vs:`排列数 P(n,k)`, same:`都是连乘`, diff:`乘法原理是公理，P(n,k)=n(n-1)…(n-k+1) 是它在"不放回取"上的特例`, when:`有约束（首位非零、某人固定位置）时回到原理逐步乘，别硬套 P`},
    {vs:`条件概率的乘法公式 P(AB)=P(A)P(B|A)`, same:`都是分步相乘`, diff:`计数乘的是选项个数，概率乘的是条件概率；后一步个数固定对应条件概率与前一步无关`, when:`等可能样本空间里两者可互换：概率 = 计数/总数`}
  ],
  ext:[
    {t:`把每步选项数不固定的情形，按受限步先做或按情况分类，走向排列组合`, go:'co.perm_comb'},
    {t:`分类有重叠时的修正：容斥原理`, go:'co.inclusion_exclusion'},
    {t:`全因子实验的样本数 = 各因子水平数连乘`, go:'ex.batch_design'}
  ]
},

/* ═══════════ 2. co.perm_comb 排列 vs 组合 ═══════════ */
'co.perm_comb': {
  layers:{
    alg:`P(n,k) = n!/(n-k)! 是有序选取；C(n,k) = P(n,k)/k! = n!/(k!(n-k)!) 是无序选取，每个组合对应 k! 个排列。`,
    geo:`n 个点，排列是画一条经过 k 个点的有向路线（顺序有意义）；组合是圈出 k 个点（只看圈住了谁）。`,
    comp:`排列 = 嵌套循环里排除已用元素；组合 = 再要求下标递增 i₁<i₂<…<i_k，递增约束把 k! 种顺序压成 1 种。`
  },
  proof:{
    from:`乘法原理；k 个不同元素有 k! 种排法`,
    to:`C(n,k) = n!/(k!(n-k)!)`,
    steps:[
      [`先数有序：从 n 个不同元素中不放回地取 k 个排成一列，方法数 P(n,k) = n(n-1)…(n-k+1)`, `每一步候选集虽然变化，但个数恒为 n-i，乘法原理成立`],
      [`把 P(n,k) 写成 n!/(n-k)!`, `n(n-1)…(n-k+1) 乘上并除以 (n-k)!，分子补成 n!`],
      [`把所有 k-排列按"用了哪 k 个元素"分组`, `每个排列恰对应一个 k 元子集（忘掉顺序），分组是划分`],
      [`每组恰有 k! 个排列`, `同一个 k 元集合的全排列数是 k!，与选了哪 k 个无关`],
      [`组数 × k! = P(n,k)，所以组数 C(n,k) = P(n,k)/k!`, `乘法原理反用：总数 = 组数 × 每组大小，各组大小相同`],
      [`代入得 C(n,k) = n!/(k!(n-k)!)，且 C(n,k) = C(n,n-k)`, `选 k 个留下 ↔ 选 n-k 个丢掉是双射，公式本身对称`]
    ],
    end:`组合 = 排列除以顺序冗余 k!。"除以对称性大小"是后面圆排列、多重排列的通用模板。`
  },
  scratch:{
    lang:'python',
    code:`import itertools, math
n, k = 7, 3
perms = list(itertools.permutations(range(n), k))
combs = list(itertools.combinations(range(n), k))
print('P', len(perms), math.factorial(n)//math.factorial(n-k))
print('C', len(combs), math.factorial(n)//(math.factorial(k)*math.factorial(n-k)))
# 按"用了哪些元素"分组，每组大小应恰为 k!
groups = {}
for p in perms:
    groups.setdefault(frozenset(p), 0)
    groups[frozenset(p)] += 1
print('groups', len(groups), 'sizes', set(groups.values()), 'k!', math.factorial(k))
print('P/k! == C', len(perms)//math.factorial(k) == len(combs))`,
    out:`P 210 210
C 35 35
groups 35 sizes {6} k! 6
P/k! == C True`,
    note:`groups 字典就是推导第 3-4 步：按元素集合分组，每组恰 k! 个；最后一行是第 5 步的除法。`
  },
  contrast:[
    {vs:`排列 P(n,k)`, same:`都是从 n 个里不放回取 k 个`, diff:`排列记顺序，组合不记；组合 = 排列 / k!`, when:`问"交换两个被选者结果变吗"：变（密码、名次）用排列，不变（委员会、握手）用组合`},
    {vs:`有放回取样 n^k`, same:`都是取 k 次`, diff:`有放回每步 n 个选项，不放回每步递减；n^k 允许重复元素`, when:`密码、骰子序列是有放回；抽人、选牌是不放回`},
    {vs:`多重集组合 C(n+k-1,k)（隔板）`, same:`都不记顺序`, diff:`C(n,k) 每个元素最多选一次；多重集允许同一元素选多次`, when:`"选不同的 k 个"用 C(n,k)；"k 个相同的东西分给 n 类"用隔板`}
  ],
  ext:[
    {t:`C(n,k) 排成三角，满足帕斯卡递推，成为 (a+b)^n 的系数`, go:'co.binomial'},
    {t:`除以对称性的模板推广到旋转（圆排列）和重复元素（多重排列）`, go:'co.circular_repeat'},
    {t:`n 次独立试验中恰 k 次成功的概率 C(n,k)p^k(1-p)^(n-k)`, go:'pr.binomial_poisson'}
  ]
},

/* ═══════════ 3. co.binomial 二项式系数与杨辉三角 ═══════════ */
'co.binomial': {
  layers:{
    alg:`(a+b)^n = Σ_k C(n,k) a^(n-k) b^k；C(n,k) = C(n-1,k-1) + C(n-1,k)，边界 C(n,0)=C(n,n)=1。`,
    geo:`杨辉三角：每个数是头顶两数之和；第 n 行是 (a+b)^n 的系数，行和 2^n，左右对称。`,
    comp:`按行动态规划：row[k] = prev[k-1] + prev[k]，O(n²) 加法，不算阶乘，不溢出不丢精度。`
  },
  proof:{
    from:`C(n,k) 的组合定义（n 元集的 k 元子集数）；乘法分配律`,
    to:`帕斯卡恒等式 C(n,k) = C(n-1,k-1)+C(n-1,k)；二项式定理 (a+b)^n = Σ C(n,k) a^(n-k) b^k`,
    steps:[
      [`固定元素 x∈{1..n}。把所有 k 元子集分成两类：含 x 的、不含 x 的`, `任一子集要么含 x 要么不含，两类互斥且穷尽，加法原理适用`],
      [`含 x 的子集：去掉 x 后是 {1..n}\\{x} 的 (k-1) 元子集，共 C(n-1,k-1) 个`, `"去掉 x"与"加回 x"互逆，是双射`],
      [`不含 x 的子集：本身就是 n-1 元集的 k 元子集，共 C(n-1,k) 个`, `直接对应，不需变换`],
      [`相加得 C(n,k) = C(n-1,k-1)+C(n-1,k)`, `加法原理，两类不交`],
      [`二项式定理：(a+b)^n = (a+b)(a+b)…(a+b) 展开时，每一项是从 n 个括号各取 a 或 b 相乘`, `分配律把乘积展成所有取法之和，每个括号必须取且只取一个`],
      [`取到 k 个 b（其余 n-k 个 a）的项是 a^(n-k) b^k，这样的取法有 C(n,k) 种（选哪 k 个括号出 b）`, `一个取法 ↔ 一个 k 元括号子集，双射`],
      [`合并同类项：(a+b)^n = Σ_k C(n,k) a^(n-k) b^k；令 a=b=1 得 Σ C(n,k) = 2^n`, `同类项系数 = 取法个数；a=b=1 时每种取法贡献 1，总取法 2^n`]
    ],
    end:`帕斯卡递推是"选不选第 n 个"，二项式系数是"哪 k 个括号出 b"。两者都是对同一子集的两种数法，这就是组合证明的精髓。`
  },
  scratch:{
    lang:'python',
    code:`import itertools, math
def C(n, k): return math.comb(n, k)
# 帕斯卡恒等式：n<=12 全部穷举验证
ok = all(C(n,k) == C(n-1,k-1) + C(n-1,k) for n in range(1,13) for k in range(1,n))
print('pascal ok', ok)
# 二项式定理：用 a=3,b=2 逐项求和，与 (a+b)^n 对比
a, b = 3, 2
for n in (4, 7, 10):
    s = sum(C(n,k) * a**(n-k) * b**k for k in range(n+1))
    print(n, s, (a+b)**n, s == (a+b)**n)
# 组合意义：数从 n 个括号中选 k 个出 b 的取法，与 C(n,k) 对比
n = 6
counts = {}
for choice in itertools.product('ab', repeat=n):
    k = choice.count('b'); counts[k] = counts.get(k, 0) + 1
print([counts[k] for k in range(n+1)], [C(n,k) for k in range(n+1)])
print('row sum', sum(counts.values()), 2**n)`,
    out:`pascal ok True
4 625 625 True
7 78125 78125 True
10 9765625 9765625 True
[1, 6, 15, 20, 15, 6, 1] [1, 6, 15, 20, 15, 6, 1]
row sum 64 64`,
    note:`product('ab', repeat=n) 枚举第 5 步的"每个括号取 a 或 b"，按 b 的个数计数就是第 6 步的 C(n,k)。`
  },
  contrast:[
    {vs:`斐波那契递推 F_n = F_(n-1)+F_(n-2)`, same:`都是加两个前项`, diff:`帕斯卡是二维递推（上一行两个相邻），斐波那契是一维`, when:`杨辉三角的"浅对角线"求和恰给出斐波那契，两者由此相连`},
    {vs:`多项式定理 (a+b+c)^n`, same:`同样由分配律展开、同类项合并`, diff:`系数变为多项系数 n!/(i!j!k!)，即多重排列数`, when:`两项用 C(n,k)，三项及以上用多项系数`},
    {vs:`二项分布 B(n,p)`, same:`同一组系数 C(n,k)`, diff:`二项式定理是恒等式，二项分布是把 a=1-p, b=p 代入后各项作为概率`, when:`概率归一性 Σ C(n,k)p^k(1-p)^(n-k)=1 就是二项式定理在 a+b=1 的特例`}
  ],
  ext:[
    {t:`把 (1+x)^n 看作生成函数，系数运算变成多项式乘法`, go:'co.generating'},
    {t:`二项分布：n 次伯努利试验的成功次数分布`, go:'pr.binomial_poisson'},
    {t:`帕斯卡递推的动态规划实现（自底向上填表）`, go:'py.recursion'}
  ]
},

/* ═══════════ 4. co.recursion 递推：斐波那契与汉诺塔 ═══════════ */
'co.recursion': {
  layers:{
    alg:`F_n = F_(n-1)+F_(n-2)，F_1=F_2=1；T(n) = 2T(n-1)+1，T(1)=1 ⇒ T(n)=2^n-1。`,
    geo:`一棵递归树：根是 n，分出 n-1 和 n-2 两棵子树；叶子数就是答案。汉诺塔是一棵满二叉树，节点数 2^n-1。`,
    comp:`自顶向下递归会重复算（指数级）；自底向上用两个变量滚动，O(n)。递推式即循环体，初值即循环起点。`
  },
  proof:{
    from:`加法原理；"最后一步"分类；汉诺塔规则（一次一盘，大不压小）`,
    to:`楼梯走法满足斐波那契递推；汉诺塔最少步数 T(n)=2^n-1`,
    steps:[
      [`上 n 阶楼梯，按最后一步分类：从 n-1 跨 1 阶，或从 n-2 跨 2 阶`, `最后一步只有这两种可能，且互斥（跨 1 与跨 2 不同），加法原理`],
      [`第一类走法数 = 上 n-1 阶的走法数 a_(n-1)，第二类 = a_(n-2)`, `去掉最后一步，剩下的是一个规模更小的同类问题，与最后一步无关`],
      [`所以 a_n = a_(n-1)+a_(n-2)，a_1=1，a_2=2`, `初值必须直接数：1 阶只有 1 种，2 阶有 {1+1, 2} 两种`],
      [`汉诺塔：把 n 盘从 A 移到 C，最大盘必须在某一刻从 A 直接移到 C，此时其他 n-1 盘全在 B`, `最大盘只能压在空柱上；A 上它是最底，C 要空，所以 n-1 小盘只能都在 B`],
      [`最大盘移动前至少要把 n-1 盘 A→B（T(n-1) 步），移动后至少要 n-1 盘 B→C（T(n-1) 步），共 T(n) = 2T(n-1)+1`, `小盘的搬运是独立的规模 n-1 子问题，且下界与上界都是 T(n-1)，所以是等式而非不等式`],
      [`解递推：T(n)+1 = 2(T(n-1)+1)，T(1)+1=2，所以 T(n)+1 = 2^n`, `加 1 后变成等比数列，是处理 aT+b 型线性递推的标准换元`],
      [`得 T(n) = 2^n - 1`, `归纳法确认对所有 n 成立（基例 n=1 为 1）`]
    ],
    end:`递推 = "大问题按最后一步分类，剩下的是小问题"。写对初值和分类，通项只是解方程。`
  },
  scratch:{
    lang:'python',
    code:`import itertools
# 楼梯走法：穷举所有 1/2 步序列，与斐波那契递推对比
def stairs_brute(n):
    return sum(1 for L in range(1, n+1) for seq in itertools.product((1,2), repeat=L) if sum(seq) == n)
def stairs_rec(n):
    a, b = 1, 2
    for _ in range(n-1): a, b = b, a+b
    return a
print([stairs_brute(n) for n in range(1, 9)])
print([stairs_rec(n) for n in range(1, 9)])
# 汉诺塔：真的模拟搬运，数步数
def hanoi(n, src, dst, via, moves):
    if n == 0: return
    hanoi(n-1, src, via, dst, moves)
    moves.append((n, src, dst))
    hanoi(n-1, via, dst, src, moves)
for n in (1, 3, 5, 8):
    m = []; hanoi(n, 'A', 'C', 'B', m)
    print(n, len(m), 2**n - 1)`,
    out:`[1, 2, 3, 5, 8, 13, 21, 34]
[1, 2, 3, 5, 8, 13, 21, 34]
1 1 1
3 7 7
5 31 31
8 255 255`,
    note:`stairs_rec 的两变量滚动是第 3 步的递推；hanoi 的三行结构正是第 5 步的 T(n-1)+1+T(n-1)。`
  },
  contrast:[
    {vs:`通项公式（closed form）`, same:`描述同一个数列`, diff:`递推给"下一项怎么来"，通项直接给第 n 项；递推更易写，通项更易算大 n`, when:`只要前 n 项就循环递推；要 n=10^18 或要分析增长率就求通项（特征方程 / 生成函数）`},
    {vs:`数学归纳法`, same:`都从 n-1 到 n`, diff:`递推是构造数列的定义，归纳是证明性质的方法；证递推解正确恰好用归纳`, when:`猜出通项后用归纳法验证`},
    {vs:`递归函数（代码）`, same:`结构一模一样`, diff:`朴素递归会重复计算子问题，指数时间；递推数列通常按顺序算一次即可`, when:`子问题重叠时改记忆化或自底向上循环`}
  ],
  ext:[
    {t:`带"不许越线"约束的递推给出卡特兰数`, go:'co.catalan'},
    {t:`用形式幂级数解递推：x/(1-x-x²)`, go:'co.generating'},
    {t:`递归程序的写法与栈深度限制`, go:'py.recursion'}
  ]
},

/* ═══════════ 5. co.inclusion_exclusion 容斥原理 ═══════════ */
'co.inclusion_exclusion': {
  layers:{
    alg:`|A₁∪…∪A_m| = Σ|A_i| - Σ|A_i∩A_j| + Σ|A_i∩A_j∩A_k| - …；等价地 |∩A_i^c| = Σ_S (-1)^|S| |∩_{i∈S} A_i|。`,
    geo:`三个圆的韦恩图：中间那块被三个圆各数一次（+3）、三个两两交各减一次（-3）、再补回一次（+1），净数 1。`,
    comp:`枚举所有 2^m 个子集 S，符号 (-1)^|S|，累加交集大小；m 小可直接做，m 大要用结构（如整除用 lcm）。`
  },
  proof:{
    from:`加法原理（互斥相加）；二项式定理 Σ_k (-1)^k C(t,k) = (1-1)^t = 0（t≥1）`,
    to:`|A₁∪…∪A_m| = Σ_{S≠∅} (-1)^(|S|+1) |∩_{i∈S} A_i|`,
    steps:[
      [`把等式右边看成对每个元素 x 的贡献之和：|∩_{i∈S}A_i| = Σ_x [x∈所有 A_i, i∈S]`, `集合大小就是对元素求和的示性函数，交换求和顺序是有限和`],
      [`固定一个元素 x，设它恰属于 t 个集合（t≥1，否则两边贡献都为 0）`, `不属于任何 A_i 的 x 对并集和每个交集都无贡献，可忽略`],
      [`x 对右边的贡献 = Σ_{k=1}^{t} (-1)^(k+1) C(t,k)`, `x 属于 ∩_{i∈S}A_i 当且仅当 S ⊆ 那 t 个集合；大小为 k 的这样的 S 有 C(t,k) 个`],
      [`Σ_{k=1}^{t} (-1)^(k+1) C(t,k) = 1 - Σ_{k=0}^{t} (-1)^k C(t,k) = 1 - (1-1)^t = 1`, `二项式定理取 a=1, b=-1；t≥1 时 0^t=0`],
      [`所以每个属于并集的元素在右边恰被数 1 次，右边 = |并集|`, `左右两边都是对元素的计数，逐元素相等则整体相等`],
      [`推论（错排）：n 封信全错的方法数 D_n = n! Σ_{k=0}^{n} (-1)^k/k!`, `A_i = 第 i 封信放对；|∩_{i∈S}A_i| = (n-|S|)!，代入公式取补集`]
    ],
    end:`容斥不是技巧，是"让每个元素净数一次"的二项式恒等式。任何"至少一个"问题都能机械地展开。`
  },
  scratch:{
    lang:'python',
    code:`import itertools, math
# 1..N 中被 2 或 3 或 5 整除的个数：暴力 vs 容斥（子集枚举）
N, ps = 100, (2, 3, 5)
brute = sum(1 for x in range(1, N+1) if any(x % p == 0 for p in ps))
ie = 0
for r in range(1, len(ps)+1):
    for S in itertools.combinations(ps, r):
        ie += (-1)**(r+1) * (N // math.prod(S))
print('union', brute, ie)
# 错排：暴力数全排列中无不动点者，与 n! sum (-1)^k/k! 对比
def derange_brute(n):
    return sum(1 for p in itertools.permutations(range(n)) if all(p[i] != i for i in range(n)))
def derange_ie(n):
    return sum((-1)**k * math.factorial(n) // math.factorial(k) for k in range(n+1))
print([derange_brute(n) for n in range(1, 8)])
print([derange_ie(n) for n in range(1, 8)])
# 逐元素净计数 = 1：t 个集合都含 x 时的交错和
print([sum((-1)**(k+1)*math.comb(t,k) for k in range(1,t+1)) for t in range(1,8)])`,
    out:`union 74 74
[0, 1, 2, 9, 44, 265, 1854]
[0, 1, 2, 9, 44, 265, 1854]
[1, 1, 1, 1, 1, 1, 1]`,
    note:`combinations 枚举子集 S 并按 (-1)^(r+1) 加权是定理本身；最后一行验证第 4 步的交错和恒为 1。`
  },
  contrast:[
    {vs:`补集计数（正难则反）`, same:`都处理"至少一个"`, diff:`补集只做一次减法（全集减"都不"）；容斥是补集里"都不"本身要展开时的工具`, when:`只有一个条件用补集；多个条件的"都不"用容斥再补集`},
    {vs:`加法原理`, same:`都是把块相加`, diff:`加法原理要求互斥；容斥允许重叠并系统地修正`, when:`能重新分类成互斥就不用容斥，省事且不易错`},
    {vs:`概率的加法公式 P(A∪B)=P(A)+P(B)-P(AB)`, same:`结构完全相同`, diff:`一个数元素个数，一个算测度；容斥对任何有限可加测度都成立`, when:`等可能空间里两者直接换算`}
  ],
  ext:[
    {t:`推广到 Möbius 反演：在偏序集上做"逐层减去重复"`, go:''},
    {t:`概率版容斥：Bonferroni 不等式给出多重检验的上界`, go:'si.multiple_testing'},
    {t:`错排 D_n/n! → 1/e，与泊松分布的联系`, go:'pr.binomial_poisson'}
  ]
},

/* ═══════════ 6. co.generating 生成函数直觉 ═══════════ */
'co.generating': {
  layers:{
    alg:`A(x)=Σa_n x^n；若 c_n = Σ_k a_k b_(n-k)（卷积），则 C(x)=A(x)B(x)。1/(1-x)=Σx^n，1/(1-x)^k 的 x^n 系数是 C(n+k-1,k-1)。`,
    geo:`两条系数序列"反向对齐滑过"，每个位置乘积求和——这是卷积的图像，也是多项式乘法竖式的图像。`,
    comp:`系数数组相乘就是 np.convolve；递推式对应有理函数，分母 = 1 - 递推系数的多项式。`
  },
  proof:{
    from:`多项式乘法的分配律；多重集计数的定义（各类各选若干，总数为 n）`,
    to:`方案数序列的生成函数 = 各类选择的生成函数之积；乘积系数 = 卷积`,
    steps:[
      [`设第 1 类物品选 i 个有 a_i 种方式，第 2 类选 j 个有 b_j 种方式，记 A(x)=Σa_i x^i, B(x)=Σb_j x^j`, `这是定义：用 x 的指数记录"选了多少个"，系数记录"有几种方式"`],
      [`两类合起来总数为 n 的方案数 c_n = Σ_{i+j=n} a_i b_j`, `按第 1 类选了多少个分类（互斥），每类内部分步（乘法原理）`],
      [`A(x)B(x) 的 x^n 系数 = Σ_{i+j=n} a_i b_j`, `分配律：a_i x^i · b_j x^j = a_i b_j x^(i+j)，指数相加，合并同类项就是对 i+j=n 求和`],
      [`所以 C(x) = A(x)B(x)：指数相加 ↔ 数量相加，系数相乘 ↔ 方式相乘，合并同类项 ↔ 分类相加`, `多项式乘法的三条规则恰好一一对应计数的三条规则，这是同构不是巧合`],
      [`归纳到 k 类：总方案的生成函数 = 各类生成函数之积`, `两两相乘结合律，每次合并都保持上述对应`],
      [`应用：每类不限量则每类的生成函数是 1+x+x²+… = 1/(1-x)，k 类得 1/(1-x)^k`, `形式幂级数中 (1-x)(1+x+x²+…) = 1，不需要收敛`],
      [`1/(1-x)^k 的 x^n 系数 = 从 k 类中取 n 个的多重集数 = C(n+k-1,k-1)（隔板）`, `两种数法数同一个东西：一边是系数提取，一边是隔板双射`]
    ],
    end:`生成函数把"分类相加、分步相乘、数量相加"编码成多项式运算，计数问题变成代数问题。x 只是占位符。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np, itertools, math
# 用 1 元和 2 元硬币凑 n 元（不计顺序）：暴力 vs 多项式乘法系数
N = 12
one = np.ones(N+1, dtype=int)                     # 1 元用 0..N 个：1+x+x^2+...
two = np.array([1 if i % 2 == 0 else 0 for i in range(N+1)])  # 2 元：1+x^2+x^4+...
prod = np.convolve(one, two)[:N+1]
brute = [sum(1 for a in range(n+1) for b in range(n//2+1) if a + 2*b == n) for n in range(N+1)]
print(prod.tolist()); print(brute)
# 两骰子点数和的方式数：(x+...+x^6)^2 的系数
die = np.array([0,1,1,1,1,1,1])
print('sum=7 ways', np.convolve(die, die)[7])
# 1/(1-x)^k 的系数 = C(n+k-1,k-1)
k = 3
g = np.array([1])
for _ in range(k): g = np.convolve(g, np.ones(N+1, dtype=int))[:N+1]
print(g.tolist()); print([math.comb(n+k-1, k-1) for n in range(N+1)])`,
    out:`[1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7]
[1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7]
sum=7 ways 6
[1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91]
[1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91]`,
    note:`np.convolve 就是第 3 步的"指数相加、系数相乘、同类项合并"；最后两行是第 7 步与隔板法的对账。`
  },
  contrast:[
    {vs:`卷积（信号处理）`, same:`同一个运算：反向滑动乘加`, diff:`生成函数里 x 是形式符号，卷积里下标是时间/空间`, when:`两个独立整数变量之和的分布也是卷积——概率生成函数`},
    {vs:`幂级数（分析）`, same:`都写成 Σa_n x^n`, diff:`形式幂级数不问收敛，只做系数运算；分析里要收敛半径`, when:`只做计数用形式的；要估渐近增长率时才代入解析`},
    {vs:`递推关系`, same:`描述同一序列`, diff:`递推是逐项规则，生成函数把它压成一个有理函数，求通项变成部分分式`, when:`线性常系数递推一律可用生成函数解`}
  ],
  ext:[
    {t:`指数生成函数 Σa_n x^n/n! 处理有标号对象（排列类问题）`, go:''},
    {t:`概率生成函数与特征函数：独立随机变量之和的分布是卷积`, go:'pr.distribution'},
    {t:`卷积在 CNN 与信号里的同一形式`, go:'fo.convolution'}
  ]
},

/* ═══════════ 7. co.graph_count 图计数 ═══════════ */
'co.graph_count': {
  layers:{
    alg:`Σ_v deg(v) = 2|E|；|E(K_n)| = C(n,2)；标记简单图数 2^C(n,2)；标记树数 n^(n-2)（Cayley）。`,
    geo:`每条边是一根两端各插一个点的火柴；数所有点插了几根火柴头，再除以 2。`,
    comp:`用邻接矩阵：度 = 行和，边数 = 矩阵元素总和 / 2；枚举图 = 枚举 C(n,2) 位的 0/1 串。`
  },
  proof:{
    from:`图 = (V, E)，E 是 V 的 2 元子集族；度 deg(v) = 含 v 的边数`,
    to:`握手引理 Σdeg = 2|E|；奇度点个数为偶；|E(K_n)| = C(n,2)；标记简单图共 2^C(n,2) 个`,
    steps:[
      [`数所有 (v, e) 对，其中 v∈e（"端点-边"关联对）`, `同一个集合用两种方式数，结果必相等——双重计数`],
      [`按点数：每个 v 贡献 deg(v) 个对，总数 Σ_v deg(v)`, `deg(v) 的定义就是含 v 的边数`],
      [`按边数：每条边恰有 2 个端点，总数 2|E|`, `简单图无自环，每条边端点恰两个不同点`],
      [`所以 Σdeg = 2|E| 为偶数；偶度点的度之和为偶，故奇度点的度之和也为偶，奇度点个数必为偶`, `奇数个奇数相加是奇数，与总和为偶矛盾`],
      [`K_n 的每对不同点恰一条边，|E| = 点对数 = C(n,2)`, `边 ↔ 2 元子集是双射`],
      [`n 个标记点上的简单图 ↔ 对 C(n,2) 条可能的边各决定有/无，共 2^C(n,2) 个`, `图由边集唯一确定，边集是 C(n,2) 元集的任意子集，乘法原理`],
      [`树：|E| = |V| - 1（对 n 归纳：去掉一片叶子，点边各减一）`, `有限树必有叶子（否则沿边走不重复会成环），去叶子后仍是树`]
    ],
    end:`图计数的根是双重计数：端点-边关联对按点数与按边数必须相等。`
  },
  scratch:{
    lang:'python',
    code:`import itertools, numpy as np
rng = np.random.default_rng(0)
# 随机图验证握手引理 & 奇度点个数为偶
for trial in range(3):
    n = 8
    A = np.triu(rng.integers(0, 2, (n, n)), 1); A = A + A.T
    deg = A.sum(axis=1); E = A.sum() // 2
    print('sum deg', deg.sum(), '2E', 2*E, 'odd-degree count', int((deg % 2).sum()))
# 枚举 4 个标记点的所有简单图，数出 2^C(4,2) 与树的个数 n^(n-2)
n = 4
pairs = list(itertools.combinations(range(n), 2))
graphs = 0; trees = 0
for bits in itertools.product((0,1), repeat=len(pairs)):
    graphs += 1
    edges = [p for p, b in zip(pairs, bits) if b]
    if len(edges) != n-1: continue
    parent = list(range(n))
    def find(x):
        while parent[x] != x: x = parent[x]
        return x
    ok = True
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv: ok = False; break
        parent[ru] = rv
    trees += ok
print('graphs', graphs, 2**len(pairs), 'trees', trees, n**(n-2), 'K4 edges', len(pairs))`,
    out:`sum deg 34 2E 34 odd-degree count 6
sum deg 30 2E 30 odd-degree count 4
sum deg 36 2E 36 odd-degree count 6
graphs 64 64 trees 16 16 K4 edges 6`,
    note:`deg.sum() 与 2*E 是第 2-3 步的两种数法；product 枚举 0/1 串是第 6 步；并查集判环 + 边数 n-1 验证第 7 步与 Cayley 公式。`
  },
  contrast:[
    {vs:`组合 C(n,2)`, same:`完全图边数就是无序对数`, diff:`C(n,2) 是抽象的对数；图计数还要管度、连通、环等结构`, when:`只问"有几条边"用 C(n,2)；问结构（树、欧拉路）要握手引理与连通性`},
    {vs:`有向图`, same:`同样是点与边`, diff:`有向边分出入度，Σ出度 = Σ入度 = |E|，不再有 2 倍`, when:`关系不对称（引用、依赖、因果 DAG）用有向图`},
    {vs:`Cayley 公式 n^(n-2) 与二叉树计数（卡特兰）`, same:`都数树`, diff:`Cayley 数的是标记无根树，卡特兰数的是无标记有序二叉树形状`, when:`点有身份用 Cayley；只看形状用卡特兰`}
  ],
  ext:[
    {t:`图的邻接矩阵幂数路径、BFS/DFS 遍历`, go:'di.graph'},
    {t:`注意力矩阵是加权完全图，L 个 token 有 L² 条边`, go:'dl.attention'},
    {t:`因果图 DAG：有向无环的结构约束`, go:'ex.dag'}
  ]
},

/* ═══════════ 8. co.stars_bars 隔板法 ═══════════ */
'co.stars_bars': {
  layers:{
    alg:`x₁+…+x_k = n 的非负整数解数 = C(n+k-1, k-1)；正整数解数 = C(n-1, k-1)（先每组发 1 个）。`,
    geo:`n 颗星排一行，插 k-1 块板切成 k 段，每段星数就是 x_i；板可相邻（空段）也可在两端。`,
    comp:`枚举长度 n+k-1 的串中 k-1 个板的位置，即 combinations(n+k-1, k-1)；反过来从解读板位置是前缀和。`
  },
  proof:{
    from:`组合数 C(m,r) 的定义；双射两边基数相等`,
    to:`非负整数解 (x₁,…,x_k) 的个数 = C(n+k-1, k-1)`,
    steps:[
      [`构造映射 f：(x₁,…,x_k) ↦ 长为 n+k-1 的串 "星×x₁ | 星×x₂ | … | 星×x_k"`, `串长 = 星总数 n + 板数 k-1，与解无关，所以所有像落在同一集合里`],
      [`f 单射：串确定后按板切开，各段星数唯一恢复 x_i`, `板的位置决定分段，分段决定每个 x_i，无信息丢失`],
      [`f 满射：任意含 n 星 k-1 板的串切开后得到 k 个非负整数且和为 n`, `相邻板或板在端点给出空段（x_i=0），仍是合法非负解；星总数 n 保证和为 n`],
      [`所以解数 = 这类串的个数`, `双射保持基数`],
      [`这类串由板的位置唯一确定：在 n+k-1 个位置中选 k-1 个放板，共 C(n+k-1, k-1)`, `位置集合 ↔ 串是双射，其余位置自动放星`],
      [`正整数解：令 y_i = x_i - 1 ≥ 0，则 Σy_i = n-k，解数 C(n-k+k-1, k-1) = C(n-1, k-1)`, `平移是双射，把"每组至少 1"归约到非负情形`],
      [`不等式 Σx_i ≤ n：加松弛变量 x_(k+1) = n - Σx_i ≥ 0，变成 k+1 个变量的等式，解数 C(n+k, k)`, `松弛变量与原解一一对应`]
    ],
    end:`相同物品只有数量信息，"分配"等价于"板的位置"，于是化为组合数。所有变形都是先做双射再套 C。`
  },
  scratch:{
    lang:'python',
    code:`import itertools, math
def brute(n, k, lo=0):
    return sum(1 for xs in itertools.product(range(n+1), repeat=k) if sum(xs) == n and min(xs) >= lo)
for n, k in ((10,3), (7,4), (5,5)):
    print('nonneg', n, k, brute(n,k), math.comb(n+k-1, k-1),
          '| pos', brute(n,k,1), math.comb(n-1, k-1))
# 显式双射：解 -> 星板串 -> 解，往返一致
def to_str(xs): return '|'.join('*'*x for x in xs)
def from_str(s): return tuple(len(seg) for seg in s.split('|'))
sols = [xs for xs in itertools.product(range(5), repeat=3) if sum(xs) == 4]
strs = {to_str(xs) for xs in sols}
print('sols', len(sols), 'distinct strings', len(strs), 'len', {len(s) for s in strs},
      'roundtrip', all(from_str(to_str(xs)) == xs for xs in sols))
# 不等式 x+y+z <= 10：松弛变量
le = sum(1 for xs in itertools.product(range(11), repeat=3) if sum(xs) <= 10)
print('<=10', le, math.comb(13, 3))`,
    out:`nonneg 10 3 66 66 | pos 36 36
nonneg 7 4 120 120 | pos 20 20
nonneg 5 5 126 126 | pos 1 1
sols 15 distinct strings 15 len {6} roundtrip True
<=10 286 286`,
    note:`to_str / from_str 就是第 1-3 步的双射及其逆，distinct strings == sols 验证单射，len 集合只有一个值验证第 1 步的串长恒定。`
  },
  contrast:[
    {vs:`组合 C(n,k)（不同物品选 k 个）`, same:`都是无序选取`, diff:`C(n,k) 选的是不同元素各至多一次；隔板是相同物品分到不同盒子，允许一盒多个`, when:`问"选哪些"用 C(n,k)；问"每类几个"用隔板`},
    {vs:`把不同的球放入不同的盒 k^n`, same:`都是分配`, diff:`球可区分时每球独立选盒，乘法原理 k^n；球不可区分时只剩数量，隔板`, when:`先问"球能否区分"`},
    {vs:`整数分拆 p(n)`, same:`都是把 n 拆成若干份`, diff:`隔板的盒子有标号（x₁=2,x₂=1 与 x₁=1,x₂=2 不同）；分拆盒子无标号`, when:`盒子有名字用隔板；只关心份数形状用分拆（无闭式）`}
  ],
  ext:[
    {t:`隔板数 C(n+k-1,k-1) 正是 1/(1-x)^k 的系数——生成函数视角`, go:'co.generating'},
    {t:`多重集组合与有放回抽样的无序结果数`, go:'co.perm_comb'},
    {t:`双射法总纲：把难数的换成好数的`, go:'co.bijection'}
  ]
},

/* ═══════════ 9. co.circular_repeat 圆排列与重复元素 ═══════════ */
'co.circular_repeat': {
  layers:{
    alg:`圆排列 (n-1)!；项链（可翻转）(n-1)!/2；多重排列 n!/(n₁!n₂!…n_m!)。`,
    geo:`把一排 n 个人首尾接成圈，旋转 n 次得到的都是同一个圈；同色球互换看不出变化，视觉等价类。`,
    comp:`按"全不同"生成全排列，再对每个排列取等价类代表（最小旋转 / 排序后的形状），数代表个数。`
  },
  proof:{
    from:`乘法原理；n! 是 n 个不同元素的线排列数；等价类划分`,
    to:`圆排列数 (n-1)!；多重排列数 n!/(n₁!…n_m!)`,
    steps:[
      [`把 n 个不同的人的线排列（n! 种）按"首尾接圈后相同"分组`, `"旋转后相同"是等价关系（自反、对称、传递），等价类构成划分`],
      [`每个圈对应恰 n 个线排列：从圈上 n 个位置中任一个开始读`, `不同起点读出不同线排列（人两两不同），且每个线排列都由某起点读出`],
      [`所以圈数 = n!/n = (n-1)!`, `乘法原理反用：总数 = 类数 × 每类大小，各类等大`],
      [`可翻转的项链：翻转再把每个圈配成 2 个（n≥3 时翻转后不同于任一旋转），得 (n-1)!/2`, `旋转 + 翻转构成大小 2n 的对称群，每类大小 2n`],
      [`多重排列：先把 n₁ 个 A 编号 A₁…A_{n₁}，同理其他，得 n! 个全不同的排列`, `编号后元素两两不同，可用 n!`],
      [`去掉编号：同一个无编号排列对应 n₁!·n₂!·…·n_m! 个有编号排列`, `各类内部独立地任意互换编号，位置形状不变，乘法原理`],
      [`所以多重排列数 = n!/(n₁!…n_m!)`, `与第 3 步同一个"总数除以等价类大小"的模板；等价类必须等大才能这样除`]
    ],
    end:`看不出区别的等价类等大时，答案 = 全不同的数目 / 等价类大小。圆排列除 n，翻转再除 2，重复元素除 k!。`
  },
  scratch:{
    lang:'python',
    code:`import itertools, math
# 圆排列：把每个线排列归一到"最小旋转"代表，数代表个数
def canon_rot(p):
    return min(p[i:]+p[:i] for i in range(len(p)))
for n in (3, 4, 5, 6):
    reps = {canon_rot(p) for p in itertools.permutations(range(n))}
    reps_flip = {min(canon_rot(p), canon_rot(p[::-1])) for p in itertools.permutations(range(n))}
    print(n, 'circular', len(reps), math.factorial(n-1), '| necklace', len(reps_flip), math.factorial(n-1)//2)
# 多重排列：BANANA 与 LEVEL
for w in ('BANANA', 'LEVEL', 'MISSISSIPPI'):
    distinct = len(set(itertools.permutations(w)))
    denom = 1
    for c in set(w): denom *= math.factorial(w.count(c))
    print(w, distinct, math.factorial(len(w)) // denom)
# 相邻/不相邻：5 人排一排，甲乙相邻 48，不相邻 72
ps = list(itertools.permutations('ABCDE'))
adj = sum(1 for p in ps if abs(p.index('A') - p.index('B')) == 1)
print('adjacent', adj, 'not', len(ps) - adj)`,
    out:`3 circular 2 2 | necklace 1 1
4 circular 6 6 | necklace 3 3
5 circular 24 24 | necklace 12 12
6 circular 120 120 | necklace 60 60
BANANA 60 60
LEVEL 30 30
MISSISSIPPI 34650 34650
adjacent 48 not 72`,
    note:`canon_rot 把每个等价类压成一个代表，reps 的个数就是第 3 步的 n!/n；set(permutations(w)) 直接实现第 6 步"去掉编号"。`
  },
  contrast:[
    {vs:`线排列 n!`, same:`都是把元素排开`, diff:`线排列有绝对位置，圆排列只有相对位置；圆排列 = 线排列 / n`, when:`圆桌、项链、环形队列用圆排列；一排座位用线排列`},
    {vs:`组合 C(n,k) = n!/(k!(n-k)!)`, same:`同样是 n! 除以阶乘`, diff:`C(n,k) 是二类多重排列（选中 / 未选中）的特例`, when:`多重排列公式在 m=2 时退化为组合数`},
    {vs:`Burnside 引理`, same:`都数对称下的等价类`, diff:`本节要求每个等价类等大；Burnside 处理类不等大（如涂色时某些方案自身对称）`, when:`元素两两不同用除法；有自对称的涂色问题用 Burnside`}
  ],
  ext:[
    {t:`一般的"除以对称群大小"推广为 Burnside / Pólya 计数`, go:''},
    {t:`多重排列数 = 多项式定理系数`, go:'co.binomial'},
    {t:`捆绑法/插空法处理相邻与不相邻约束`, go:'co.complement'}
  ]
},

/* ═══════════ 10. co.catalan 卡特兰数 ═══════════ */
'co.catalan': {
  layers:{
    alg:`C_n = C(2n,n) - C(2n,n+1) = C(2n,n)/(n+1)；递推 C_n = Σ_{i} C_i C_{n-1-i}，C_0=1。`,
    geo:`(0,0)→(n,n) 的格路，不许跨到对角线 y=x 上方；越线的坏路径把首次越线点之后翻折，落到 (n-1,n+1)。`,
    comp:`动态规划：dp[n] = Σ dp[i]·dp[n-1-i]，O(n²)；或直接 comb(2n,n)//(n+1) 精确整数。`
  },
  proof:{
    from:`格路数 (0,0)→(a,b) 为 C(a+b, a)；补集计数；反射构造双射`,
    to:`不越对角线的格路数 C_n = C(2n,n) - C(2n,n+1) = C(2n,n)/(n+1)`,
    steps:[
      [`所有 (0,0)→(n,n) 的右/上格路共 C(2n,n) 条`, `2n 步中选哪 n 步向右，组合数`],
      [`坏路径 = 至少一次触到直线 y = x+1（即跨过对角线）`, `跨过对角线等价于某一刻 上步数 - 右步数 = 1，恰触到 y=x+1`],
      [`对每条坏路径，取首次触到 y=x+1 的点 P，把 P 之后的路径关于 y=x+1 反射（右↔上互换）`, `反射后仍是右/上格路，终点 (n,n) 映到 (n-1, n+1)`],
      [`这是坏路径与 (0,0)→(n-1,n+1) 所有格路的双射`, `任何到 (n-1,n+1) 的路径必触 y=x+1（终点在其上方），取首触点反射回去即逆映射`],
      [`到 (n-1,n+1) 的格路共 C(2n, n+1) 条，故坏路径数 = C(2n,n+1)`, `2n 步选 n+1 步向上`],
      [`好路径 C_n = C(2n,n) - C(2n,n+1)`, `补集：总数减坏数`],
      [`化简：C(2n,n+1) = C(2n,n)·n/(n+1)，所以 C_n = C(2n,n)/(n+1)`, `C(2n,n+1)/C(2n,n) = n!n!/((n+1)!(n-1)!) = n/(n+1)`]
    ],
    end:`反射法把"越线"这个难约束翻译成"终点错位"，一步双射得到闭式。括号、二叉树、三角剖分都与格路双射，所以共用 C_n。`
  },
  scratch:{
    lang:'python',
    code:`import itertools, math
def good_paths(n):
    cnt = 0
    for steps in itertools.product('RU', repeat=2*n):
        if steps.count('R') != n: continue
        h = 0; ok = True
        for s in steps:
            h += 1 if s == 'R' else -1
            if h < 0: ok = False; break
        cnt += ok
    return cnt
def bad_paths(n):
    return math.comb(2*n, n) - good_paths(n)
for n in range(1, 7):
    print(n, 'good', good_paths(n), math.comb(2*n,n)//(n+1),
          '| bad', bad_paths(n), math.comb(2*n, n+1))
# 反射双射：把坏路径首次越线后 R<->U 互换，落点应为 (n-1, n+1)
n = 4; targets = set()
for steps in itertools.product('RU', repeat=2*n):
    if steps.count('R') != n: continue
    h = 0
    for i, s in enumerate(steps):
        h += 1 if s == 'R' else -1
        if h < 0:
            refl = steps[:i+1] + tuple('U' if c == 'R' else 'R' for c in steps[i+1:])
            targets.add((refl.count('R'), refl.count('U')))
            break
print('reflected endpoints', targets)`,
    out:`1 good 1 1 | bad 1 1
2 good 2 2 | bad 4 4
3 good 5 5 | bad 15 15
4 good 14 14 | bad 56 56
5 good 42 42 | bad 210 210
6 good 132 132 | bad 792 792
reflected endpoints {(3, 5)}`,
    note:`h<0 检测第 2 步的首次越线；refl 的 R/U 互换是第 3 步的反射，targets 只含 (n-1,n+1) 验证第 4 步。`
  },
  contrast:[
    {vs:`斐波那契 1,1,2,3,5,8`, same:`前几项都出现 1,2,5`, diff:`卡特兰 1,1,2,5,14,42 增长 ~4^n/n^1.5，是二次递推（卷积型）；斐波那契是线性递推`, when:`括号、树形状、格路用卡特兰；楼梯、兔子用斐波那契`},
    {vs:`格路总数 C(2n,n)`, same:`同一批路径`, diff:`C(2n,n) 不管越线；卡特兰加了"不越对角线"约束`, when:`无约束用组合数，有单侧约束用反射法`},
    {vs:`二叉树计数（无标号）`, same:`也是卡特兰数`, diff:`二叉树递推 C_n = ΣC_iC_{n-1-i} 是按根的左子树大小分类；格路是反射法。两者双射但推导路线不同`, when:`能写"按第一个返回点分类"的结构都是卡特兰`}
  ],
  ext:[
    {t:`一般化的 ballot 问题：候选人 A 始终领先 B 的计票序列数 (a-b)/(a+b)·C(a+b,a)`, go:''},
    {t:`卡特兰生成函数 C(x) = 1 + xC(x)²，由递推直接写出`, go:'co.generating'},
    {t:`Dyck 路 ↔ 合法括号 ↔ 二叉树的双射`, go:'co.bijection'}
  ]
},

/* ═══════════ 11. co.complement 正难则反 ═══════════ */
'co.complement': {
  layers:{
    alg:`|A| = |U| - |A^c|；P(至少一次) = 1 - P(零次)；"至少一个"的补是"一个都没有"。`,
    geo:`一整块大饼挖掉一小块；剩下的那块形状再怪也不用画，只要知道整块和挖掉的。`,
    comp:`if not any(...) 比枚举 "至少一个" 的所有情形容易得多；代码里用 total - count(none)。`
  },
  proof:{
    from:`全集 U，子集 A，补集 A^c = U \\ A；加法原理`,
    to:`|A| = |U| - |A^c|，且"至少一个"的补集是"全都不"`,
    steps:[
      [`A 与 A^c 互斥且并为 U`, `补集的定义：每个元素恰属于 A、A^c 之一`],
      [`由加法原理 |U| = |A| + |A^c|`, `互斥集合的并的基数是各基数之和`],
      [`移项得 |A| = |U| - |A^c|`, `整数减法，|U| 有限`],
      [`"至少一个 A_i 发生" = ∪A_i；其补集 = ∩A_i^c = "全都不发生"`, `德摩根律：¬(∃i A_i) = ∀i ¬A_i`],
      [`"全都不"往往是单一情形，可用乘法原理直接连乘（每一步都排除坏选项）`, `每一步选项数固定（如每位数字 9 选 1），乘法原理成立；而"至少一个"要按个数分类，繁琐`],
      [`陷阱：全集必须是原题的样本空间（4 位数是 1000~9999 共 9000 个）`, `补集是相对于 U 定义的，U 选错整段推理无效`]
    ],
    end:`补集把"至少"翻成"全无"，把分类问题变成一次减法。前提只有一条：全集选对。`
  },
  scratch:{
    lang:'python',
    code:`import itertools
# 含至少一个 7 的四位数：暴力 vs 9000 - 8*9*9*9
brute = sum(1 for n in range(1000, 10000) if '7' in str(n))
print('at least one 7', brute, 9000 - 8*9*9*9)
# 抛 4 次至少一次正面：16 - 1
print('coin', sum(1 for s in itertools.product('HT', repeat=4) if 'H' in s), 2**4 - 1)
# 1..20 选 3 个至少一个偶数：C(20,3)-C(10,3)
import math
b = sum(1 for c in itertools.combinations(range(1,21), 3) if any(x % 2 == 0 for x in c))
print('>=1 even', b, math.comb(20,3) - math.comb(10,3))
# 全集选错的后果：把四位数全集误当 10000
print('wrong universe', 10000 - 9*9*9*9, 'right', 9000 - 8*9*9*9)`,
    out:`at least one 7 3168 3168
coin 15 15
>=1 even 1020 1020
wrong universe 3439 right 3168`,
    note:`每行都是第 3 步的 total - none；最后一行演示第 6 步全集选错会得到不同答案。`
  },
  contrast:[
    {vs:`容斥原理`, same:`都处理"至少一个"`, diff:`补集是一次减法；当"全都不"本身仍有多个条件交织时，才需要容斥展开`, when:`条件独立可连乘时用补集；条件不独立（整除、放对信）用容斥`},
    {vs:`直接分类相加`, same:`答案一样`, diff:`正面数要按"恰好 1 个、恰好 2 个…"分类，项数多易漏；反面只有一项`, when:`看到"至少""不全""存在"先想补集`},
    {vs:`概率补事件 P(A) = 1 - P(A^c)`, same:`同一恒等式`, diff:`计数用基数，概率用测度；独立事件"全不发生"直接连乘 (1-p)^n`, when:`"n 次试验至少一次成功" = 1-(1-p)^n`}
  ],
  ext:[
    {t:`多个条件的"全都不"需要容斥展开`, go:'co.inclusion_exclusion'},
    {t:`几何概率与"至少一次"：1-(1-p)^n 估计需要多少次实验才有把握观测到`, go:'pr.conditional'},
    {t:`逻辑基础：德摩根律与量词否定`, go:'di.logic'}
  ]
},

/* ═══════════ 12. co.bijection 一一对应 ═══════════ */
'co.bijection': {
  layers:{
    alg:`存在双射 f: A→B ⇒ |A| = |B|。子集 ↔ 0/1 串（2^n）；格路 ↔ R/U 串（C(m+n,n)）；选 k ↔ 丢 n-k。`,
    geo:`左右两堆点，每个左点射出一箭恰中一个右点，每个右点恰被一箭中；两堆点数必相等。`,
    comp:`写 encode 和 decode 两个函数，验证 decode(encode(x)) == x 且 encode(decode(y)) == y，然后数好数的那边。`
  },
  proof:{
    from:`函数、单射、满射的定义；有限集基数`,
    to:`双射保持基数；n 元集子集数 2^n；C(n,k) = C(n,n-k)`,
    steps:[
      [`f: A→B 单射 ⇒ |A| ≤ |B|`, `不同元素映到不同像，像集是 B 的子集且与 A 等大`],
      [`f 满射 ⇒ |A| ≥ |B|`, `每个 b 至少有一个原像，选一个原像得 B→A 的单射`],
      [`双射 = 单且满 ⇒ |A| = |B|`, `两个不等式合并`],
      [`子集 S ⊆ {1..n} ↦ 0/1 串 (s₁…s_n)，s_i = [i∈S]`, `每个元素独立地"在或不在"，串唯一确定 S，S 唯一确定串：双射`],
      [`0/1 串共 2^n 个（每位 2 选 1，乘法原理），故子集数 2^n`, `乘法原理 + 双射保持基数`],
      [`k 元子集 S ↦ 补集 S^c（n-k 元子集），是双射，故 C(n,k) = C(n,n-k)`, `补集的补集是自身，映射自逆，必为双射`],
      [`奇数大小子集 ↔ 偶数大小子集：固定元素 x，S ↦ S△{x}（有 x 则去，无则加）`, `大小变化 ±1 改变奇偶，映射自逆，故两类等大各 2^(n-1)`]
    ],
    end:`计数的本质是构造到 {1..N} 的对应；找到一个双射，问题就搬到熟悉的地盘。验证时必须两个方向都能回去。`
  },
  scratch:{
    lang:'python',
    code:`import itertools, math
n = 5; U = list(range(n))
subsets = [frozenset(c) for k in range(n+1) for c in itertools.combinations(U, k)]
enc = lambda S: tuple(int(i in S) for i in U)
dec = lambda bits: frozenset(i for i, b in enumerate(bits) if b)
print('subsets', len(subsets), 2**n,
      'roundtrip', all(dec(enc(S)) == S for S in subsets),
      'onto', len({enc(S) for S in subsets}) == 2**n)
# 选 k <-> 丢 n-k
k = 2
comp = lambda S: frozenset(U) - S
ks = [S for S in subsets if len(S) == k]
print('C(n,k)', len(ks), 'C(n,n-k)', len({comp(S) for S in ks}), math.comb(n, n-k))
# 奇偶子集配对：S -> S xor {0}
odd = [S for S in subsets if len(S) % 2]; even = [S for S in subsets if len(S) % 2 == 0]
flip = lambda S: S ^ frozenset([0])
print('odd', len(odd), 'even', len(even), 'flip maps odd->even bijectively',
      {flip(S) for S in odd} == set(even), 2**(n-1))
# 格路 <-> 串
paths = [p for p in itertools.product('RU', repeat=6) if p.count('R') == 3]
print('paths (3,3)', len(paths), math.comb(6,3))`,
    out:`subsets 32 32 roundtrip True onto True
C(n,k) 10 C(n,n-k) 10 10
odd 16 even 16 flip maps odd->even bijectively True 16
paths (3,3) 20 20`,
    note:`enc/dec 及 roundtrip+onto 两项检查就是第 4 步双射的两个方向；comp 与 flip 分别实现第 6、7 步的自逆映射。`
  },
  contrast:[
    {vs:`单射 / 满射`, same:`都是函数`, diff:`单射给 ≤，满射给 ≥，只有双射给 =`, when:`只需上界或下界时单射/满射就够（鸽巢就是"无单射"）`},
    {vs:`直接用公式计数`, same:`结果相同`, diff:`公式是别人做好的双射；自己构造双射能解没有现成公式的题`, when:`题目对象怪（括号、剖分、路径）时先找它和熟悉对象的双射`},
    {vs:`多对一映射（k-to-1）`, same:`也能算基数`, diff:`每个像恰有 k 个原像时 |A| = k|B|，这是"除以对称性"的基础，不是双射`, when:`圆排列、组合数推导用 k-to-1；等大才用双射`}
  ],
  ext:[
    {t:`无穷集的双射定义"同基数"：N 与 Q 等势，与 R 不等势（对角线论证）`, go:'di.set_function'},
    {t:`隔板、卡特兰都是双射法的实例`, go:'co.stars_bars'},
    {t:`鸽巢原理 = |A|>|B| 时不存在单射`, go:'co.pigeonhole'}
  ]
},

/* ═══════════ 13. co.pigeonhole 鸽巢原理 ═══════════ */
'co.pigeonhole': {
  layers:{
    alg:`n 个盒放 m 个物，m > kn ⇒ 某盒 ≥ k+1；等价：f: A→B, |A|>|B| ⇒ f 不是单射。`,
    geo:`平均每盒 m/n 个，最满的盒不可能低于平均；平均 > k 则最满的 ≥ k+1。`,
    comp:`往 dict 里丢东西，键是"盒"；键数少于元素数时必有一个键出现两次——碰撞检测。`
  },
  proof:{
    from:`有限集基数；整数的离散性（整数 > k ⇒ ≥ k+1）`,
    to:`m 个物放 n 个盒，m > kn ⇒ 某盒至少 k+1 个；推论 m = n+1 时某盒 ≥ 2`,
    steps:[
      [`反设每个盒至多 k 个`, `反证法：假设结论的否定`],
      [`则物品总数 ≤ n·k`, `n 个盒各至多 k 个，加法原理求和`],
      [`与 m > kn 矛盾`, `m 是物品总数，同一数量不能既 ≤ kn 又 > kn`],
      [`所以存在某盒 ≥ k+1 个`, `否定的否定；"≥ k+1"由整数离散性从"> k"得到`],
      [`平均值版本：max ≥ 平均 = m/n，取上整 ⌈m/n⌉`, `最大值不小于平均值；盒中物数是整数所以可取上整`],
      [`应用模板：设计"盒"使得同盒 ⇒ 结论。如 mod n 余数为盒（n+1 个整数中两数之差被 n 整除），配对 {i, 11-i} 为盒（1..10 选 6 个必有两数和 11）`, `原理本身平凡，功夫在于选盒：盒数 < 物数，且同盒即得所需性质`],
      [`最少保证数：要保证 k 个同类，需 (k-1)·n + 1 个`, `(k-1)n 个可以每盒恰 k-1 个（反例存在），再加 1 个由原理必超`]
    ],
    end:`鸽巢 = "总量超过容量必有溢出"。它给存在性不给位置。难点永远是造盒子。`
  },
  scratch:{
    lang:'python',
    code:`import itertools, numpy as np
rng = np.random.default_rng(1)
# 盒 = mod n 余数：任取 n+1 个整数，必有两数差被 n 整除
for n in (5, 7, 12):
    ok = True
    for _ in range(200):
        xs = rng.integers(0, 10**6, n+1)
        boxes = {}
        for x in xs: boxes.setdefault(int(x) % n, []).append(int(x))
        if max(len(v) for v in boxes.values()) < 2: ok = False
    print('mod', n, 'always collision', ok)
# 1..10 选 6 个，必有两数和为 11：穷举全部 C(10,6) 种
sixes = itertools.combinations(range(1, 11), 6)
print('sum-11 pair always', all(any(a + b == 11 for a, b in itertools.combinations(c, 2)) for c in sixes))
# 反例边界：1..10 选 5 个可以没有和 11 的对
print('5 can avoid', any(not any(a+b == 11 for a,b in itertools.combinations(c,2)) for c in itertools.combinations(range(1,11),5)))
# 最少保证数：4 色球保证 3 个同色需 4*2+1 = 9；8 个可反例
print('8 balls can avoid', sorted([2,2,2,2]), 'max', max([2,2,2,2]) < 3, '| 9 balls', 4*2+1)`,
    out:`mod 5 always collision True
mod 7 always collision True
mod 12 always collision True
sum-11 pair always True
5 can avoid True
8 balls can avoid [2, 2, 2, 2] max True | 9 balls 9`,
    note:`boxes 字典按余数分盒是第 6 步的造盒；'5 can avoid' 与 '8 balls' 两行是第 7 步的反例边界。`
  },
  contrast:[
    {vs:`双射 / 单射`, same:`都在比较两个集合大小`, diff:`鸽巢 = |A|>|B| 时无单射，是双射思想的否定形式`, when:`要证"必有两个相同"用鸽巢，要证"数目相等"用双射`},
    {vs:`概率论的生日悖论`, same:`都关于碰撞`, diff:`鸽巢给确定性保证（367 人必有同生日）；生日悖论算概率（23 人 >50%）`, when:`要"必然"用鸽巢，要"多半"用概率`},
    {vs:`平均值原理（存在元素 ≥ 平均）`, same:`鸽巢就是它的整数版`, diff:`平均值原理对实数成立，鸽巢多了取整`, when:`连续量用平均值原理，离散计数用鸽巢`}
  ],
  ext:[
    {t:`Ramsey 理论：足够大的结构里必有规则子结构（6 人中必有 3 人互识或互不识）`, go:''},
    {t:`哈希碰撞不可避免：键空间大于桶数时必有碰撞`, go:'py.list_dict'},
    {t:`无损压缩不可能对所有输入都缩短（2^n 个串压不进更少的短串）`, go:'it.compression'}
  ]
}

});
