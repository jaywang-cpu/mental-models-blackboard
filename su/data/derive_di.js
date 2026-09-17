/* 数理宇宙 v3 · 推导层 · di 离散数论大陆（13 节点）
   旁挂文件，不改动 v1/v2。
   scratch 全部用 python3 + numpy 2.3 实际跑过，out 是真实输出。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'di.gcd': {
  layers:{
    alg:`gcd(a,b) = gcd(b, a mod b)。因为 a = qb + r，任何整除 a 和 b 的数也整除 r = a − qb，反过来整除 b 和 r 的数也整除 a；两对数的公约数集合完全相同，最大者自然相同。`,
    geo:`a×b 的长方形，每次切掉尽可能多的 b×b 正方形，剩下 b×r 的小长方形；能铺满整张的最大正方形边长，就是也能铺满余下小块的最大边长。余数每轮至少减半，图形很快收敛。`,
    comp:`一个 while 循环：(a,b) ← (b, a%b)，b 为 0 停。反着把每一步的商代回去，得到 ax + by = gcd 的整数系数，这就是扩展欧几里得，也是求模逆的机器。`
  },
  proof:{
    from:`带余除法：对任意整数 a 和 b>0，存在唯一的 q, r 使 a = qb + r，0 ≤ r < b`,
    to:`辗转相除必在有限步内终止，终止时的非零余数是 gcd(a,b)；且存在整数 x, y 使 ax + by = gcd(a,b)（贝祖定理）`,
    steps:[
      [`设 d | a 且 d | b，则 d | (a − qb) = r`, `整除对整数线性组合封闭：d 整除 a 和 b，就整除它们的任何整系数组合`],
      [`反过来 d | b 且 d | r，则 d | (qb + r) = a`, `同一条封闭性，方向反过来用`],
      [`所以 {a,b} 与 {b,r} 的公约数集合相同，gcd(a,b) = gcd(b,r)`, `两个集合相同，最大元素当然相同；这就是递推式合法的全部理由`],
      [`余数序列 b > r₁ > r₂ > … ≥ 0 严格递减`, `带余除法保证 0 ≤ r < 除数，每轮除数换成上一轮余数，所以严格变小；非负整数不能无限递减，必到 0`],
      [`余数为 0 时 gcd(r_k, 0) = r_k，即最后一个非零余数就是答案`, `任何数都整除 0，所以 (r_k, 0) 的最大公约数就是 r_k 本身`],
      [`贝祖：对最后一步 r_k = gcd 反向代入。r_{k} = r_{k-2} − q·r_{k-1}，而 r_{k-1} 又是前两项的组合`, `每个余数都是前两个数的整系数组合，归纳往回代，最终 gcd 写成 a 与 b 的整系数组合`],
      [`推论：若 gcd(a,m)=1，则 ax + my = 1，即 ax ≡ 1 (mod m)，x 是 a 的模逆`, `把等式两边对 m 取余，my 项消失；这是 CRT 和 RSA 的基础`]
    ],
    end:`gcd 是余数链的终点，贝祖系数是把这条链倒着走一遍。一切「模逆存在」的结论，根子都在 ax + by = 1。`
  },
  scratch:{
    lang:'python',
    code:`import math, random
random.seed(0)
def gcd_trace(a, b):
    while b:
        print(f"  ({a}, {b}) -> 余数 {a % b}")
        a, b = b, a % b
    return a
def ext_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1      # 反向代入：g = b*x1 + (a%b)*y1
print("辗转相除 (252, 105):")
g = gcd_trace(252, 105)
print("gcd =", g)
g, x, y = ext_gcd(252, 105)
print(f"贝祖: 252*({x}) + 105*({y}) = {252*x + 105*y}")
ok = True
for _ in range(2000):
    a, b = random.randint(1, 10**9), random.randint(1, 10**9)
    g, x, y = ext_gcd(a, b)
    ok &= (g == math.gcd(a, b)) and (a*x + b*y == g)
print("2000 组随机: gcd 与 math.gcd 一致且 ax+by=g:", ok)
a, m = 17, 3120
g, x, y = ext_gcd(a, m)
print(f"gcd(17,3120)={g}, 模逆 x={x % m}, 验证 17*x mod 3120 = {17*(x % m) % m}")`,
    out:`辗转相除 (252, 105):
  (252, 105) -> 余数 42
  (105, 42) -> 余数 21
  (42, 21) -> 余数 0
gcd = 21
贝祖: 252*(-2) + 105*(5) = 21
2000 组随机: gcd 与 math.gcd 一致且 ax+by=g: True
gcd(17,3120)=1, 模逆 x=2753, 验证 17*x mod 3120 = 1`,
    note:`while 循环打印的余数序列对应第 4 步（严格递减必终止）；ext_gcd 的回代那一行 x1 − (a//b)·y1 就是第 6 步的反向代入。`
  },
  contrast:[
    {vs:`最小公倍数 lcm(a,b)`, same:`都由素因子指数决定`, diff:`gcd 取每个素因子指数的最小值，lcm 取最大值；gcd·lcm = ab`, when:`求「同时整除」用 gcd；求「同时是倍数」（周期对齐、分母通分）用 lcm = ab/gcd`},
    {vs:`因数分解求 gcd`, same:`都能得到 gcd`, diff:`分解是指数级难的（RSA 靠这个），辗转相除是 O(log) 步的`, when:`永远用辗转相除；分解只在教学或数很小时`},
    {vs:`模逆 pow(a, -1, m)`, same:`底层就是扩展欧几里得`, diff:`模逆是贝祖等式的一个特例（gcd=1 时的 x）`, when:`要 ax ≡ 1 就用 pow(a,-1,m)；要通解或 gcd ≠ 1 的情况用 ext_gcd`}
  ],
  ext:[
    {t:`模逆存在 ⇔ gcd=1，是中国剩余定理构造的核心`, go:'di.crt'},
    {t:`费马小定理给出素数模下逆元的另一条路 a^{p-2}`, go:'di.fermat_fastpow'},
    {t:`多项式的辗转相除同样成立，得到多项式 gcd`, go:'al.polynomial'}
  ]
},

'di.modular': {
  layers:{
    alg:`a ≡ b (mod m) ⇔ m | (a − b)。同余是一种等价关系，把整数分成 m 个类；加法和乘法在类上定义良好：先取余再算，和先算再取余，落在同一个类里。`,
    geo:`把数轴卷成周长为 m 的圆，整数按余数落到 m 个刻度上。加法是转圈，乘法是重复转圈；不管你在圆上怎么走，只有落点的刻度有意义。`,
    comp:`机器每做一次乘法就 % m 一次，中间结果永远小于 m²，不会溢出。pow(a, n, m) 内部就是这么做的，这也是 hash、随机数、加密全部能在 64 位整数里完成的原因。`
  },
  proof:{
    from:`定义 a ≡ b (mod m) 当且仅当 m | (a − b)`,
    to:`若 a ≡ a' 且 b ≡ b' (mod m)，则 a+b ≡ a'+b' 且 ab ≡ a'b' (mod m)；从而 (ab) mod m = ((a mod m)(b mod m)) mod m`,
    steps:[
      [`写 a = a' + km，b = b' + lm`, `m | (a − a') 就是存在整数 k 使 a − a' = km，这是整除的定义`],
      [`相加：a + b = (a' + b') + (k + l)m`, `直接代入并合并 m 的倍数`],
      [`所以 m | (a+b) − (a'+b')，即 a+b ≡ a'+b'`, `差是 m 的整数倍，对回定义`],
      [`相乘：ab = a'b' + (a'l + b'k + klm)m`, `展开四项，除 a'b' 外每一项都含因子 m`],
      [`所以 ab ≡ a'b' (mod m)`, `差 (a'l + b'k + klm)m 是 m 的倍数`],
      [`取 a' = a mod m，b' = b mod m（都在 0..m-1 内）代入第 5 步`, `a ≡ a mod m 是显然的，因为 a − (a mod m) = qm`],
      [`两边再取 mod m：(ab) mod m = ((a mod m)(b mod m)) mod m`, `同余类里的每个数 mod m 得到同一个代表元，所以取余不改变类`]
    ],
    end:`同余对加乘封闭，所以整数 mod m 构成一个环 Z_m。这意味着任何只含加乘的整数公式都可以「边算边取余」，中间数永远有界。`
  },
  scratch:{
    lang:'python',
    code:`import random
random.seed(0)
add = mul = fold = True
for _ in range(5000):
    m = random.randint(2, 1000)
    a, b = random.randint(-10**6, 10**6), random.randint(-10**6, 10**6)
    add  &= (a + b) % m == (a % m + b % m) % m
    mul  &= (a * b) % m == ((a % m) * (b % m)) % m
    fold &= (a * b) % m == (((a % m) * b) % m)
print("5000 组随机 (a,b,m):")
print("  (a+b) mod m == (a mod m + b mod m) mod m :", add)
print("  (ab) mod m == ((a mod m)(b mod m)) mod m  :", mul)
print("  边乘边取余与最后取余一致                :", fold)
# 7^100 mod 13：逐步取余，中间数永远 < 13*7
r = 1
for i in range(100):
    r = (r * 7) % 13
big = 7**100
print(f"7^100 有 {len(str(big))} 位，直接取余 = {big % 13}，逐步取余 = {r}，pow(7,100,13) = {pow(7,100,13)}")`,
    out:`5000 组随机 (a,b,m):
  (a+b) mod m == (a mod m + b mod m) mod m : True
  (ab) mod m == ((a mod m)(b mod m)) mod m  : True
  边乘边取余与最后取余一致                : True
7^100 有 85 位，直接取余 = 9，逐步取余 = 9，pow(7,100,13) = 9`,
    note:`随机 5000 组的三条检验对应第 3、5、7 步；7^100 逐步取余那段演示第 7 步的实际用途：85 位的数被压在 13 以内算完。`
  },
  contrast:[
    {vs:`Python 的 % 与 C 的 %`, same:`都叫取余`, diff:`Python 结果与除数同号（-7 % 3 = 2），C/numpy 的 fmod 与被除数同号（-1）`, when:`做模运算永远要 0..m-1 的代表元，Python 的 % 直接给；numpy 用 np.mod 而非 np.fmod`},
    {vs:`模除法 / 模逆`, same:`都在 Z_m 里做`, diff:`加减乘对任何 m 都封闭，除法只对与 m 互质的数有定义（要模逆）`, when:`m 是素数时人人可除（有限域）；m 合数时先查 gcd`},
    {vs:`浮点取整 round`, same:`都把数压到一个格子里`, diff:`取余是精确的整数运算，round 是丢信息的近似`, when:`哈希、加密、周期计数用 mod；测量数据用 round`}
  ],
  ext:[
    {t:`整除判定就是 10^k mod m 的规律`, go:'di.divisibility'},
    {t:`乘法封闭 + 逆元存在 ⇒ 费马小定理与快速幂`, go:'di.fermat_fastpow'},
    {t:`int 溢出本质是 mod 2^64 的环绕`, go:'np.overflow'}
  ]
},

'di.prime': {
  layers:{
    alg:`素数是只有 1 和自身两个约数的 >1 整数。算术基本定理：每个 >1 整数唯一写成素数幂之积 n = Πp_i^{a_i}，约数个数 = Π(a_i+1)。`,
    geo:`把 n 看成一堆积木塔，每种颜色（素数）一列，高度是指数。约数就是从每列拿 0 到 a_i 块，所以数一数有几种拿法就是 Π(a_i+1)。`,
    comp:`试除只到 √n：若 n 有因子 d > √n，则 n/d < √n 早已被试到。埃氏筛从 i·i 开始划掉倍数，理由相同。`
  },
  proof:{
    from:`带余除法与良序原理（非空自然数集有最小元）`,
    to:`素数有无穷多个；每个 n>1 可唯一分解为素数之积`,
    steps:[
      [`存在性：设有不能分解的数，取最小者 n。n 不是素数（否则自己就是分解），故 n = ab，1<a,b<n`, `良序原理允许取最小反例；素数本身算作长度 1 的分解`],
      [`a, b 都比 n 小，所以都能分解；拼起来 n 也能分解，矛盾`, `最小反例假设保证比它小的都不是反例；矛盾说明没有反例`],
      [`引理（欧几里得）：素数 p | ab ⇒ p | a 或 p | b`, `若 p ∤ a 则 gcd(p,a)=1，贝祖给 px + ay = 1，两边乘 b 得 pbx + aby = b，左边被 p 整除，故 p | b`],
      [`唯一性：设 p₁…p_r = q₁…q_s 是两种分解。p₁ 整除右边乘积，由引理整除某个 q_j，素数只能整除素数当且仅当相等，故 p₁ = q_j`, `引理反复用即可推广到多个因子；素数的约数只有 1 和自身`],
      [`两边约去 p₁，对剩下的乘积归纳，得两种分解相同`, `归纳的变量是乘积中因子的个数，每步减一`],
      [`无穷：若素数只有 p₁…p_k，令 N = p₁…p_k + 1。N 除以每个 p_i 余 1，故 N 的素因子不在名单里`, `N>1 必有素因子（存在性）；N mod p_i = 1 ≠ 0 说明这个素因子是新的`],
      [`约数计数：n = Πp_i^{a_i} 的约数是 Πp_i^{b_i}，0 ≤ b_i ≤ a_i，每个 b_i 有 a_i+1 种选法`, `唯一分解保证不同的 (b_i) 给不同的约数，乘法原理计数`]
    ],
    end:`素数是整数的「原子」，分解唯一是整数世界的基本定理；RSA 的安全性正是分解难而乘法易。`
  },
  scratch:{
    lang:'python',
    code:`import math
def sieve(n):
    is_p = [True] * (n + 1); is_p[0] = is_p[1] = False
    for i in range(2, int(n**0.5) + 1):
        if is_p[i]:
            for j in range(i*i, n + 1, i):   # 从 i*i 开始划
                is_p[j] = False
    return [i for i in range(n + 1) if is_p[i]]
def factor(n):
    f = {}; d = 2
    while d * d <= n:                        # 试除只到 sqrt(n)
        while n % d == 0:
            f[d] = f.get(d, 0) + 1; n //= d
        d += 1
    if n > 1: f[n] = f.get(n, 0) + 1
    return f
P = sieve(100)
print("100 以内素数个数:", len(P), " 前 10 个:", P[:10])
print("pi(10^6) =", len(sieve(10**6)))
# 欧几里得：前 k 个素数乘积 + 1 的素因子不在名单里
for k in [3, 4, 5, 6]:
    N = math.prod(P[:k]) + 1
    f = factor(N)
    print(f"  {P[:k]} 之积+1 = {N} = {f}  新素因子不在名单: {all(p not in P[:k] for p in f)}")
# 约数个数 = prod(a_i + 1) 与暴力一致
ok = True
for n in range(2, 2001):
    f = factor(n)
    formula = math.prod(a + 1 for a in f.values())
    brute = sum(1 for d in range(1, n + 1) if n % d == 0)
    ok &= formula == brute
print("2..2000 约数个数公式 == 暴力:", ok, "  例 360 =", factor(360), "->", math.prod(a+1 for a in factor(360).values()), "个约数")`,
    out:`100 以内素数个数: 25  前 10 个: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
pi(10^6) = 78498
  [2, 3, 5] 之积+1 = 31 = {31: 1}  新素因子不在名单: True
  [2, 3, 5, 7] 之积+1 = 211 = {211: 1}  新素因子不在名单: True
  [2, 3, 5, 7, 11] 之积+1 = 2311 = {2311: 1}  新素因子不在名单: True
  [2, 3, 5, 7, 11, 13] 之积+1 = 30031 = {59: 1, 509: 1}  新素因子不在名单: True
2..2000 约数个数公式 == 暴力: True   例 360 = {2: 3, 3: 2, 5: 1} -> 24 个约数`,
    note:`乘积+1 那段对应第 6 步（新素因子一定不在名单里）；约数个数公式与暴力一致对应第 7 步。sieve 从 i*i 起、试除到 √n 对应 comp 层。`
  },
  contrast:[
    {vs:`互质 gcd(a,b)=1`, same:`都在讲「没有公共素因子」`, diff:`素数是一个数的性质，互质是两个数的关系；两个合数也能互质（8 和 9）`, when:`CRT、模逆看互质，不看是否素数`},
    {vs:`Miller-Rabin 概率素性检验`, same:`都判断是否素数`, diff:`试除是确定的 O(√n)，Miller-Rabin 是概率的 O(k log³ n)`, when:`n < 10^12 试除；RSA 级 600 位数只能用概率检验`},
    {vs:`因数分解 vs 素性判定`, same:`都关于素因子`, diff:`判定「是不是素数」有多项式算法，找出「因子是谁」目前没有`, when:`这就是公钥加密能存在的缝隙`}
  ],
  ext:[
    {t:`唯一分解给出 gcd/lcm 的指数最小/最大表述`, go:'di.gcd'},
    {t:`素数模下的乘法群是费马小定理的舞台`, go:'di.fermat_fastpow'},
    {t:`心算分解与试除技巧`, go:'ns.factor'}
  ]
},

'di.divisibility': {
  layers:{
    alg:`n = Σ d_k·10^k。对 m 取余时 10^k 可以换成 10^k mod m：10 ≡ 1 (mod 3, 9) 给数字和，10 ≡ −1 (mod 11) 给交错和，100 ≡ 0 (mod 4) 给末两位。`,
    geo:`每个十进制位是一堆「10^k 元硬币」。若 10^k 元硬币在模 m 下都值 1 元，那 n 的价值就是硬币个数（数字和）；若在模 11 下值 ±1，价值就是交错和。`,
    comp:`不需要做除法：字符串逐字符扫描，累加 digit × (10^k mod m)。这是任意进制、任意模的通用判定，硬编码的规则只是它的特例。`
  },
  proof:{
    from:`十进制表示 n = Σ_{k=0}^{L} d_k 10^k，以及同余对加乘封闭`,
    to:`n ≡ Σ d_k (mod 3 和 9)；n ≡ Σ (−1)^k d_k (mod 11)；n ≡ 末两位 (mod 4)，n ≡ 末三位 (mod 8)`,
    steps:[
      [`10 = 9 + 1 ≡ 1 (mod 9)，也 ≡ 1 (mod 3)`, `9 是 3 和 9 的倍数，10 − 1 = 9`],
      [`归纳：10^k ≡ 1^k = 1 (mod 9)`, `同余对乘法封闭：10^{k+1} = 10^k·10 ≡ 1·1`],
      [`n = Σ d_k 10^k ≡ Σ d_k·1 = 数字和 (mod 9)`, `同余对加法和乘常数封闭，逐项替换 10^k 为 1`],
      [`10 = 11 − 1 ≡ −1 (mod 11)，故 10^k ≡ (−1)^k`, `同样的乘法封闭，只是代表元换成 −1`],
      [`n ≡ Σ (−1)^k d_k = 个位 − 十位 + 百位 − … (mod 11)`, `逐项替换，得交错和`],
      [`100 = 4·25 ≡ 0 (mod 4)，故 k ≥ 2 时 10^k ≡ 0；n ≡ d₀ + 10d₁ = 末两位 (mod 4)`, `含因子 100 的项全被 4 整除而消失；1000 = 8·125 同理给末三位`],
      [`每条规则不只判整除，还给出余数本身`, `第 3、5、6 步都是同余等式，不是只在整除时成立`]
    ],
    end:`整除规则 = 10^k mod m 的周期表。记规则不如记这一句：把每一位乘上「它那位的 10 的幂在模 m 下的值」。`
  },
  scratch:{
    lang:'python',
    code:`import random
random.seed(0)
print("k      :", list(range(6)))
for m in [3, 9, 11, 4, 8]:
    print(f"10^k mod {m:<2}:", [pow(10, k, m) for k in range(6)])
def digits(n): return [int(c) for c in str(n)][::-1]   # d0 是个位
r3 = r9 = r11 = r4 = r8 = True
for _ in range(5000):
    n = random.randint(0, 10**12)
    d = digits(n)
    s = sum(d)
    alt = sum((-1)**k * dk for k, dk in enumerate(d))
    r3  &= n % 3 == s % 3
    r9  &= n % 9 == s % 9
    r11 &= n % 11 == alt % 11
    r4  &= n % 4 == (n % 100) % 4
    r8  &= n % 8 == (n % 1000) % 8
print("5000 个随机数 五条规则给出的是余数本身:", r3, r9, r11, r4, r8)
n = 987654321
d = digits(n)
print(f"{n}: 数字和 {sum(d)} -> mod 9 = {sum(d) % 9} (真值 {n % 9});  交错和 {sum((-1)**k*x for k,x in enumerate(d))} -> mod 11 = {sum((-1)**k*x for k,x in enumerate(d)) % 11} (真值 {n % 11})")`,
    out:`k      : [0, 1, 2, 3, 4, 5]
10^k mod 3 : [1, 1, 1, 1, 1, 1]
10^k mod 9 : [1, 1, 1, 1, 1, 1]
10^k mod 11: [1, 10, 1, 10, 1, 10]
10^k mod 4 : [1, 2, 0, 0, 0, 0]
10^k mod 8 : [1, 2, 4, 0, 0, 0]
5000 个随机数 五条规则给出的是余数本身: True True True True True
987654321: 数字和 45 -> mod 9 = 0 (真值 0);  交错和 5 -> mod 11 = 5 (真值 5)`,
    note:`第一行打印 10^k mod 3,9,11 对应第 2、4 步的周期表；5000 个随机数的五条规则对应第 3、5、6 步；最后一行验证规则给出的是余数不只是整除。`
  },
  contrast:[
    {vs:`弃九法验算`, same:`都用「数字和 ≡ 原数 (mod 9)」`, diff:`整除判定用它判 0，弃九法用它核对乘法结果的余数`, when:`手算大数乘法后用弃九法快速查错，抓不到位数互换的错`},
    {vs:`模 7 判定`, same:`也来自 10^k mod 7`, diff:`10^k mod 7 的周期是 6（1,3,2,6,4,5），没有简单的数字和形式`, when:`模 7 直接做除法或按 6 位一组算`},
    {vs:`二进制的 mod 3`, same:`同一套思路`, diff:`2 ≡ −1 (mod 3)，所以二进制位交错和判 3 整除`, when:`这说明规则依赖进制，不是数的性质`}
  ],
  ext:[
    {t:`一般化：任意进制 b 与任意模 m，规则由 b^k mod m 的周期决定`, go:'di.modular'},
    {t:`心算整除与因数拆分`, go:'ns.divisibility'},
    {t:`归纳法证 10^k ≡ 1 的那一步`, go:'di.induction'}
  ]
},

'di.fermat_fastpow': {
  layers:{
    alg:`p 素数，p ∤ a，则 a^{p−1} ≡ 1 (mod p)。推论：a^{-1} ≡ a^{p−2}，指数可对 p−1 取余。快速幂把 a^n 按 n 的二进制拆成 log n 次平方。`,
    geo:`乘以 a 是 {1,…,p−1} 上的一个洗牌：每个元素被送到一个不同的位置，没有两个撞到一起。洗牌不改变全体乘积，两边约掉乘积就剩 a^{p−1} = 1。`,
    comp:`pow(a, n, p) 内部循环 n 的二进制位：遇 1 就把当前平方乘进结果，每轮把底数平方并取余。10^9 次幂只要 30 步。`
  },
  proof:{
    from:`p 素数，gcd(a,p) = 1；Z_p 中非零元有模逆（由贝祖）`,
    to:`a^{p−1} ≡ 1 (mod p)；且快速幂在 ⌈log₂ n⌉ 步内正确算出 a^n mod m`,
    steps:[
      [`考虑集合 S = {1, 2, …, p−1} 和映射 f(x) = a·x mod p`, `目标是证 f 是 S 到自身的双射`],
      [`f(x) ≠ 0：若 p | ax，由欧几里得引理 p | a 或 p | x，都不可能`, `p ∤ a 是假设，1 ≤ x ≤ p−1 不可能被 p 整除`],
      [`f 单射：若 ax ≡ ay，则 p | a(x−y)，故 p | (x−y)，而 |x−y| < p，所以 x = y`, `再用一次引理消去 a；有限集上单射即双射`],
      [`因此 Π_{x∈S} (ax) ≡ Π_{x∈S} x (mod p)，即 a^{p−1}·(p−1)! ≡ (p−1)!`, `双射意味着左边只是右边换了顺序，乘积相同`],
      [`(p−1)! 与 p 互质，可约去，得 a^{p−1} ≡ 1`, `每个因子 1..p−1 都有模逆，乘积也有模逆`],
      [`推论 a·a^{p−2} = a^{p−1} ≡ 1，所以 a^{p−2} 是 a 的逆；a^n ≡ a^{n mod (p−1)}`, `n = q(p−1) + r 时 a^n = (a^{p−1})^q a^r ≡ a^r`],
      [`快速幂：写 n = Σ b_k 2^k，则 a^n = Π_{b_k=1} a^{2^k}，而 a^{2^{k+1}} = (a^{2^k})²`, `指数相加对应幂相乘；每轮一次平方就得到下一个 a^{2^k}，共 ⌊log₂ n⌋+1 轮`],
      [`每一步都 mod m，由同余封闭性结果不变，中间数 < m²`, `这是 modular 节点的第 7 步`]
    ],
    end:`费马小定理是「乘 a 是一次置换」这一个图像的代数投影。快速幂 + 费马逆元让模素数下的除法只需 O(log p) 次乘法。`
  },
  scratch:{
    lang:'python',
    code:`def fast_pow(a, n, m):
    r, base, steps = 1, a % m, 0
    while n:
        if n & 1: r = r * base % m
        base = base * base % m       # a^(2^k) -> a^(2^(k+1))
        n >>= 1; steps += 1
    return r, steps
def naive_pow(a, n, m):
    r = 1
    for _ in range(n): r = r * a % m
    return r
primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
for p in primes:
    for a in range(1, p):
        perm = sorted(a * x % p for x in range(1, p))
        assert perm == list(range(1, p))          # 乘 a 是 {1..p-1} 的置换
        assert pow(a, p - 1, p) == 1              # 费马小定理
        assert a * pow(a, p - 2, p) % p == 1      # a^(p-2) 是逆
print("25 个素数 x 全部 a: 置换 / a^(p-1)=1 / a^(p-2) 是逆  全部通过")
p = 7; a = 3
print(f"p=7, a=3: 3*x mod 7 =", [a * x % p for x in range(1, p)])
ok = all(fast_pow(a, n, 1000003)[0] == naive_pow(a, n, 1000003) for a in [2, 3, 10] for n in range(0, 300))
print("fast_pow == naive_pow (a in 2,3,10; n<300):", ok)
for n in [10, 1000, 10**6, 10**9]:
    r, s = fast_pow(3, n, 1000003)
    print(f"  3^{n} mod 1000003 = {r:>7}  快速幂 {s} 轮 (log2 n = {n.bit_length()})  朴素要 {n} 次乘法")`,
    out:`25 个素数 x 全部 a: 置换 / a^(p-1)=1 / a^(p-2) 是逆  全部通过
p=7, a=3: 3*x mod 7 = [3, 6, 2, 5, 1, 4]
fast_pow == naive_pow (a in 2,3,10; n<300): True
  3^10 mod 1000003 =   59049  快速幂 4 轮 (log2 n = 4)  朴素要 10 次乘法
  3^1000 mod 1000003 =   73216  快速幂 10 轮 (log2 n = 10)  朴素要 1000 次乘法
  3^1000000 mod 1000003 =  222223  快速幂 20 轮 (log2 n = 20)  朴素要 1000000 次乘法
  3^1000000000 mod 1000003 =  347529  快速幂 30 轮 (log2 n = 30)  朴素要 1000000000 次乘法`,
    note:`assert perm == list(range(1,p)) 就是第 3 步的双射；pow(a,p-2,p) 验证第 6 步；fast_pow 的 steps 计数对应第 7 步的 log n 轮。`
  },
  contrast:[
    {vs:`欧拉定理 a^{φ(m)} ≡ 1`, same:`同一个置换论证，集合换成与 m 互质的数`, diff:`费马是 m 为素数的特例，φ(p) = p−1`, when:`m 合数（RSA 的 n = pq）要用欧拉，φ(n) = (p−1)(q−1)`},
    {vs:`扩展欧几里得求逆`, same:`都得 a^{-1} mod m`, diff:`费马只在 m 素数时可用，O(log p) 次乘法；扩展欧几里得对任何互质 m 可用，O(log m) 步`, when:`竞赛里 m = 10^9+7 用 pow(a, m-2, m)；一般 m 用 pow(a, -1, m)`},
    {vs:`费马伪素数 (Carmichael 数)`, same:`也满足 a^{n−1} ≡ 1`, diff:`定理是单向的：素数 ⇒ 等式，等式 ⇏ 素数（561 = 3·11·17 对所有互质 a 都过）`, when:`费马检验只能作筛子，确定性要 Miller-Rabin`}
  ],
  ext:[
    {t:`模逆存在的更一般条件 gcd = 1 与扩展欧几里得`, go:'di.gcd'},
    {t:`快速幂的分治结构与 O(log n)`, go:'di.big_o'},
    {t:`矩阵快速幂：同样的二进制拆分算斐波那契`, go:'la.matrix_transform'}
  ]
},

'di.crt': {
  layers:{
    alg:`m_i 两两互质，M = Πm_i。x = Σ a_i·M_i·(M_i^{-1} mod m_i)，M_i = M/m_i。每一项在自己的模下等于 a_i，在别的模下等于 0，所以加起来同时满足全部同余。`,
    geo:`两个互质周期 3 和 5 的转盘并排转，15 步之内每一对刻度组合 (r₃, r₅) 恰好出现一次。CRT 说：余数向量和 0..M−1 的整数是一一对应的。`,
    comp:`对每个方程算 M_i、它的模逆、乘上 a_i，求和后 % M。三行代码；模逆来自扩展欧几里得或 pow(M_i, -1, m_i)。`
  },
  proof:{
    from:`m_i 两两互质；贝祖定理（互质 ⇒ 模逆存在）`,
    to:`同余方程组 x ≡ a_i (mod m_i) 在 mod M 意义下恰有一个解`,
    steps:[
      [`令 M_i = M/m_i，则 gcd(M_i, m_i) = 1`, `M_i 是其他模的乘积，与 m_i 两两互质的数之积仍与 m_i 互质`],
      [`存在 y_i 使 M_i·y_i ≡ 1 (mod m_i)`, `互质 ⇒ 模逆存在，这是贝祖`],
      [`令 e_i = M_i·y_i。则 e_i ≡ 1 (mod m_i)，e_i ≡ 0 (mod m_j)（j ≠ i）`, `M_i 含因子 m_j，所以对 m_j 取余是 0；对 m_i 取余就是第 2 步`],
      [`取 x = Σ a_i·e_i。对每个 m_i 取余：x ≡ a_i·1 + Σ_{j≠i} a_j·0 = a_i`, `e_i 像单位向量，只在自己的坐标上是 1；这是构造性存在证明`],
      [`唯一性：若 x, x' 都是解，则 每个 m_i | (x − x')`, `两解在每个模下同余，差被每个 m_i 整除`],
      [`两两互质的数都整除 d ⇒ 它们的乘积 M 整除 d`, `唯一分解：各 m_i 的素因子互不重叠，d 含全部这些因子`],
      [`故 x ≡ x' (mod M)，解在 0..M−1 中唯一；映射 x ↦ (x mod m_i) 是 Z_M 到 ΠZ_{m_i} 的双射`, `单射由唯一性，两边都有 M 个元素，所以是双射`]
    ],
    end:`CRT 把一个大模拆成几个小模独立算再拼回来。它是并行化模运算、多项式插值（拉格朗日）与 RSA 加速的共同结构。`
  },
  scratch:{
    lang:'python',
    code:`import math
def crt(rs, ms):
    M = math.prod(ms); x = 0
    for a, mi in zip(rs, ms):
        Mi = M // mi                       # 第 1 步
        inv = pow(Mi, -1, mi)              # 第 2 步：Mi 的模逆（贝祖）
        x += a * Mi * inv                  # 第 4 步：e_i = Mi*inv 只在自己坐标上是 1
    return x % M, M
rs, ms = [2, 3, 2], [3, 5, 7]
x, M = crt(rs, ms)
print(f"x = 2 (mod 3), 3 (mod 5), 2 (mod 7)  ->  x = {x} (mod {M})")
print("回代:", [x % m for m in ms], "== ", rs)
brute = [t for t in range(M) if all(t % m == a for a, m in zip(rs, ms))]
print("暴力枚举 0..104 的解:", brute, " 恰一个:", len(brute) == 1)
x2, M2 = crt([5, 7, 3, 9], [11, 13, 17, 19])
print(f"四模 [11,13,17,19]: x = {x2}, M = {M2}, 回代 {[x2 % m for m in [11,13,17,19]]}")
try:
    crt([1, 3], [4, 6])
except ValueError as e:
    print("模不互质 (4,6): 模逆不存在 ->", e)
print("(4,6) 下 x=1 mod 4, x=3 mod 6 的解:", [t for t in range(24) if t % 4 == 1 and t % 6 == 3], "  x=1 mod 4, x=2 mod 6 的解:", [t for t in range(24) if t % 4 == 1 and t % 6 == 2])`,
    out:`x = 2 (mod 3), 3 (mod 5), 2 (mod 7)  ->  x = 23 (mod 105)
回代: [2, 3, 2] ==  [2, 3, 2]
暴力枚举 0..104 的解: [23]  恰一个: True
四模 [11,13,17,19]: x = 1567, M = 46189, 回代 [5, 7, 3, 9]
模不互质 (4,6): 模逆不存在 -> base is not invertible for the given modulus
(4,6) 下 x=1 mod 4, x=3 mod 6 的解: [9, 21]   x=1 mod 4, x=2 mod 6 的解: []`,
    note:`crt 函数循环里的 Mi、inv、a*Mi*inv 三行分别对应第 1、2、4 步；暴力枚举 0..104 只找到一个解对应第 7 步；最后一段演示不互质时第 2 步失效。`
  },
  contrast:[
    {vs:`拉格朗日插值`, same:`结构完全同构：构造在一个点为 1 其余为 0 的基函数再加权求和`, diff:`CRT 在整数模下，插值在多项式模 (x − x_i) 下`, when:`看到「基元素 + 加权」的构造，两个都能想到`},
    {vs:`模不互质的方程组`, same:`都是同余方程组`, diff:`不互质时解可能不存在（a_i 要在 gcd 下一致），存在时模是 lcm 而非乘积`, when:`先检查 a_i ≡ a_j (mod gcd(m_i,m_j))，再逐对合并`},
    {vs:`直接枚举 0..M−1`, same:`都能找到解`, diff:`枚举是 O(M)，CRT 是 O(Σ log m_i)`, when:`M 上万就必须用构造`}
  ],
  ext:[
    {t:`模逆是构造的关键一步`, go:'di.gcd'},
    {t:`余数向量与整数的一一对应就是双射计数`, go:'co.bijection'},
    {t:`大整数乘法与 RSA 解密用 CRT 把 mod n 拆成 mod p 与 mod q`, go:'di.modular'}
  ]
},

'di.induction': {
  layers:{
    alg:`P(1) 真，且 ∀k [P(k) ⇒ P(k+1)]，则 ∀n P(n)。它不是「看了几个例子就相信」，而是一条推理规则，等价于自然数的良序原理。`,
    geo:`一排多米诺：第一块倒下（base），每块倒下都撞倒下一块（step）。要让第 1000 块倒，不用碰它，前 999 次碰撞把力传过去了。`,
    comp:`递归函数就是归纳法的可执行形式：base case 是 P(1)，递归调用假设 P(k) 已成立并造出 P(k+1)。归纳证明写好，递归代码自然正确。`
  },
  proof:{
    from:`自然数的良序原理：任何非空自然数子集有最小元`,
    to:`归纳法合法：若 P(1) 且 ∀k [P(k) ⇒ P(k+1)]，则对所有 n ≥ 1，P(n) 成立`,
    steps:[
      [`反设结论不成立：集合 F = {n ≥ 1 : P(n) 假} 非空`, `反证法：要证的是一个全称命题，否定它就是存在反例`],
      [`由良序原理 F 有最小元 m`, `F 是非空自然数子集，这正是良序原理的适用条件`],
      [`m ≠ 1，因为 P(1) 真`, `base 条件直接排除 m = 1`],
      [`所以 m ≥ 2，m − 1 ≥ 1 是自然数且 m − 1 ∉ F，即 P(m−1) 真`, `m 是最小反例，比它小的都不是反例`],
      [`由归纳步骤（取 k = m−1）得 P(m) 真`, `step 条件对每个 k 都成立，尤其对 k = m−1`],
      [`与 m ∈ F 矛盾，故 F 为空，结论成立`, `同一个 m 既在 F 里又满足 P，矛盾只能来自反设`],
      [`反向：从归纳法也能推出良序原理，所以两者等价`, `对「前 n 个数中任意非空子集有最小元」做归纳即可`]
    ],
    end:`归纳法 = 良序原理的另一副面孔：没有「最小的坏例子」。递归、动态规划、循环不变量全靠它保证正确。`
  },
  scratch:{
    lang:'python',
    code:`N = 200
P = lambda n: sum(range(1, n + 1)) == n * (n + 1) // 2
base = P(1)
step_ok = all((not P(k)) or P(k + 1) for k in range(1, N))    # P(k) => P(k+1)
print("P(n): 1+...+n = n(n+1)/2")
print("  base P(1):", base, "  step P(k)=>P(k+1) for k<200:", step_ok)
reached = {1} if base else set()
k = 1
while k in reached and k < N:            # 多米诺：从 1 一路推到 N
    if (not P(k)) or P(k + 1): reached.add(k + 1)
    k += 1
print("  多米诺推到的集合 == {1..200}:", reached == set(range(1, N + 1)))
Q = lambda n: n >= 5
print("Q(n): n >= 5")
print("  base Q(1):", Q(1), "  step Q(k)=>Q(k+1) for k<200:", all((not Q(k)) or Q(k + 1) for k in range(1, N)))
reachedQ = {1} if Q(1) else set()
print("  多米诺推到的集合:", reachedQ, " -> 缺 base 时 step 再对也推不出任何 n")
print("最小反例检验 F = {n : not P(n)} 在 1..200 内:", [n for n in range(1, N + 1) if not P(n)])`,
    out:`P(n): 1+...+n = n(n+1)/2
  base P(1): True   step P(k)=>P(k+1) for k<200: True
  多米诺推到的集合 == {1..200}: True
Q(n): n >= 5
  base Q(1): False   step Q(k)=>Q(k+1) for k<200: True
  多米诺推到的集合: set()  -> 缺 base 时 step 再对也推不出任何 n
最小反例检验 F = {n : not P(n)} 在 1..200 内: []`,
    note:`base 与 step_ok 两行对应定理的两个前提；reached 集合显式走一遍多米诺链对应第 4-5 步；Q 的反例说明缺 base 时 step 空转，对应第 3 步不可省。`
  },
  contrast:[
    {vs:`强归纳法`, same:`同样合法，同样等价于良序`, diff:`假设 P(1)…P(k) 全真推 P(k+1)，而不是只用 P(k)`, when:`分解、分治（归并排序）的正确性要用到比 k 小的任意子问题，用强归纳`},
    {vs:`归纳推理（从样本猜规律）`, same:`都叫 induction`, diff:`数学归纳法是演绎，结论必然为真；统计归纳是概率性的猜测`, when:`n=1..5 都成立不是证明；必须给出 P(k) ⇒ P(k+1) 的通用论证`},
    {vs:`循环不变量`, same:`都是「每步保持性质」`, diff:`不变量是归纳法在程序循环上的应用，base 是进入循环前，step 是循环体`, when:`证算法正确性先写不变量`}
  ],
  ext:[
    {t:`递归函数的正确性就是归纳证明`, go:'py.recursion'},
    {t:`递推关系与封闭形式的验证`, go:'co.recursion'},
    {t:`结构归纳：对树、表达式、图做归纳`, go:'di.graph'}
  ]
},

'di.big_o': {
  layers:{
    alg:`f = O(g) ⇔ 存在 C, n₀ 使 n > n₀ 时 f(n) ≤ C·g(n)。只看最高阶项，扔掉常数。主定理：T(n) = aT(n/b) + n^d 的解由 a 与 b^d 谁大决定。`,
    geo:`递归树：每层节点数乘 a，每个节点规模除 b。每层总工作量是一个等比数列，公比 a/b^d。公比 <1 根占主导，=1 每层等量（乘 log），>1 叶子占主导。`,
    comp:`别算精确次数，数「主循环嵌套了几层、递归树多深」。n log n 与 n² 在 n = 10^6 时差 5 万倍；常数因子几乎从不翻盘。`
  },
  proof:{
    from:`递推 T(n) = aT(n/b) + n^d，a ≥ 1，b > 1，T(1) = 1`,
    to:`T(n) = Θ(n^d) 若 a < b^d；Θ(n^d log n) 若 a = b^d；Θ(n^{log_b a}) 若 a > b^d`,
    steps:[
      [`展开一层：T(n) = a·T(n/b) + n^d；再展开：= a²T(n/b²) + a(n/b)^d + n^d`, `每次把 T(n/b^k) 用递推式替换，这是递推的定义`],
      [`展开到 k = log_b n 层（规模到 1）：T(n) = a^{L}·T(1) + Σ_{k=0}^{L−1} a^k (n/b^k)^d，L = log_b n`, `深度为 L 时子问题规模为 1，递推终止`],
      [`第 k 层的工作量 = n^d·(a/b^d)^k`, `a^k·(n/b^k)^d = n^d·a^k/b^{dk}，提出公比 r = a/b^d`],
      [`叶子项 a^L = a^{log_b n} = n^{log_b a}`, `换底：a^{log_b n} = b^{log_b a · log_b n} = n^{log_b a}`],
      [`情形 r < 1：等比和 ≤ n^d/(1−r)，且叶子 n^{log_b a} < n^d，故 T = Θ(n^d)`, `r < 1 ⇔ a < b^d ⇔ log_b a < d；根那一层的 n^d 占主导`],
      [`情形 r = 1：每层都是 n^d，共 L+1 层，T = Θ(n^d log n)`, `L = log_b n = Θ(log n)，各层等量`],
      [`情形 r > 1：等比和由最后一项主导 ≈ n^d·r^L = a^L = n^{log_b a}，叶子占主导`, `r^L = a^L/b^{dL} = a^L/n^d，代回得 n^{log_b a}`]
    ],
    end:`主定理是「递归树每层工作量的等比数列」这一个图像。归并排序 a=2,b=2,d=1 → n log n；二分 a=1,b=2,d=0 → log n；Strassen a=7,b=2,d=2 → n^{2.81}。`
  },
  scratch:{
    lang:'python',
    code:`import math
from functools import lru_cache
@lru_cache(None)
def T1(n): return 1 if n == 1 else T1(n // 2) + n          # a=1,b=2,d=1  a<b^d
@lru_cache(None)
def T2(n): return 1 if n == 1 else 2 * T2(n // 2) + n      # a=2,b=2,d=1  a=b^d
@lru_cache(None)
def T3(n): return 1 if n == 1 else 4 * T3(n // 2) + n      # a=4,b=2,d=1  a>b^d
print(" n        T1/n     T2/(n log2 n)   T3/n^2")
for k in range(4, 21, 2):
    n = 2 ** k
    print(f"2^{k:<2}   {T1(n)/n:8.4f}   {T2(n)/(n*math.log2(n)):10.4f}   {T3(n)/n**2:10.4f}")
print("极限: T1/n -> 2 (根主导, Theta(n));  T2/(n log n) -> 1 (每层等量, Theta(n log n));  T3/n^2 -> 2 (叶子主导, Theta(n^log2 4)=Theta(n^2))")`,
    out:` n        T1/n     T2/(n log2 n)   T3/n^2
2^4      1.9375       1.2500       1.9375
2^6      1.9844       1.1667       1.9844
2^8      1.9961       1.1250       1.9961
2^10     1.9990       1.1000       1.9990
2^12     1.9998       1.0833       1.9998
2^14     1.9999       1.0714       1.9999
2^16     2.0000       1.0625       2.0000
2^18     2.0000       1.0556       2.0000
2^20     2.0000       1.0500       2.0000
极限: T1/n -> 2 (根主导, Theta(n));  T2/(n log n) -> 1 (每层等量, Theta(n log n));  T3/n^2 -> 2 (叶子主导, Theta(n^log2 4)=Theta(n^2))`,
    note:`三个递归函数直接按递推式数工作量，对应第 1-2 步；三列比值分别收敛到常数，对应第 5、6、7 步的三种情形。`
  },
  contrast:[
    {vs:`Θ 与 Ω`, same:`都描述增长量级`, diff:`O 是上界，Ω 是下界，Θ 是两边都夹住`, when:`说「算法至多 n²」用 O；说「就是 n log n」用 Θ；日常口语的 O 通常想说 Θ`},
    {vs:`实际运行时间`, same:`都关心快慢`, diff:`大 O 扔掉常数和低阶项，只在 n 大时有意义；n 小时常数、缓存、向量化说了算`, when:`n < 1000 别信大 O，跑一下；n > 10^6 大 O 几乎决定一切`},
    {vs:`空间复杂度`, same:`同一套记号`, diff:`计的是内存不是时间；递归深度也是空间`, when:`GPU 上 attention 的 n² 首先是显存问题`}
  ],
  ext:[
    {t:`快速幂 T(n) = T(n/2) + 1 = O(log n)`, go:'di.fermat_fastpow'},
    {t:`Python 中各种操作的复杂度速查`, go:'py.bigo'},
    {t:`注意力的 n² 与序列长度`, go:'dl.attention'}
  ]
},

'di.bits': {
  layers:{
    alg:`整数是 Σ b_k 2^k。左移一位 = 每个 2^k 变 2^{k+1} = 乘 2；x & 1 取 b₀ 判奇偶；x & (x−1) 把最低位的 1 清零；n 位补码里 −x 表示为 2^n − x。`,
    geo:`一排开关，每个开关的「重量」是 2^k。移位就是把整排开关整体挪一格；与、或、异或是逐开关比对，各位互不干扰。`,
    comp:`CPU 做移位和位运算是一个周期，做乘除是几十个周期。int8 加 1 越过 127 直接绕到 −128，没有报错，这是 numpy 里悄悄出错的头号来源。`
  },
  proof:{
    from:`二进制表示 x = Σ_{k≥0} b_k 2^k，b_k ∈ {0,1}`,
    to:`x << 1 = 2x；x >> 1 = ⌊x/2⌋；x & (x−1) 清除最低位 1；n 位补码中 −x ≡ 2^n − x 且加法自动正确`,
    steps:[
      [`x << 1：每个 b_k 移到 k+1 位，值变成 Σ b_k 2^{k+1} = 2·Σ b_k 2^k = 2x`, `移位不改变系数，只改变权重，提公因子 2`],
      [`x >> 1：丢掉 b₀，得 Σ_{k≥1} b_k 2^{k−1} = (x − b₀)/2 = ⌊x/2⌋`, `x − b₀ 是偶数，除 2 精确；b₀ ∈ {0,1} 正好是被舍去的余数`],
      [`设 x 最低位的 1 在第 j 位，即 x = …1 0…0（j 个 0）。则 x − 1 = …0 1…1（第 j 位变 0，其下全变 1，更高位不变）`, `减 1 要向上借位，一直借到第一个 1 为止`],
      [`x & (x−1)：第 j 位 1&0 = 0，第 j 位以下 0&1 = 0，更高位不变`, `按位与逐位独立，只有两边都是 1 才留下`],
      [`所以结果恰好是 x 去掉最低位 1；循环到 0 的次数 = 1 的个数`, `每次去掉一个 1，去光即为 0`],
      [`补码：定义 n 位下 −x 表示为 2^n − x。则 x + (2^n − x) = 2^n，在 n 位内溢出为 0`, `n 位寄存器只保留 mod 2^n，2^n 本身表示为 0，所以 x 与它的补码相加得 0`],
      [`因此加法电路不用区分正负，减法 = 加补码；范围为 −2^{n−1} .. 2^{n−1}−1`, `最高位为 1 的编码被解释为负数，正负各占一半`]
    ],
    end:`位运算是「按 2 的幂分解」的直接操作。理解补码就理解了 int 溢出为什么是静默环绕，而不是错误。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
x = 0b101100
print(f"x = {x:08b} = {x}")
print(f"x<<1 = {x<<1:08b} = {x<<1} = 2x ({2*x})")
print(f"x>>2 = {x>>2:08b} = {x>>2} = x//4 ({x//4})")
print(f"x-1  = {x-1:08b}   x&(x-1) = {x&(x-1):08b} = {x&(x-1)}  (去掉最低位 1)")
def popcount(v):
    c = 0
    while v:
        v &= v - 1; c += 1
    return c
print("popcount 循环 == bin().count('1') for 0..4095:", all(popcount(v) == bin(v).count('1') for v in range(4096)))
a = np.array([127], dtype=np.int8)
print("int8: 127 + 1 =", (a + 1)[0], "  (2^8 环绕, 静默)")
neg5 = (-5) & 0xFF
print(f"8 位补码 -5 = {neg5:08b} = {neg5} = 256 - 5;  5 + 251 = {5 + 251} = 2^8 -> 8 位内为 {(5 + 251) & 0xFF}")
print("int8 范围:", np.iinfo(np.int8).min, "..", np.iinfo(np.int8).max)`,
    out:`x = 00101100 = 44
x<<1 = 01011000 = 88 = 2x (88)
x>>2 = 00001011 = 11 = x//4 (11)
x-1  = 00101011   x&(x-1) = 00101000 = 40  (去掉最低位 1)
popcount 循环 == bin().count('1') for 0..4095: True
int8: 127 + 1 = -128   (2^8 环绕, 静默)
8 位补码 -5 = 11111011 = 251 = 256 - 5;  5 + 251 = 256 = 2^8 -> 8 位内为 0
int8 范围: -128 .. 127`,
    note:`x<<1、x>>2 对应第 1-2 步；x&(x-1) 与 popcount 循环对应第 3-5 步；int8 环绕与 -5 的补码对应第 6-7 步。`
  },
  contrast:[
    {vs:`逻辑运算 and / or / not`, same:`同样是与或非`, diff:`位运算逐位作用于整数，逻辑运算作用于整个布尔值；& 与 and 优先级不同`, when:`numpy 布尔掩码必须用 & | ~ 并加括号；Python 条件用 and or not`},
    {vs:`乘除 2`, same:`x<<1 与 x*2 结果相同`, diff:`负数 >> 是算术移位（向下取整），//2 也向下取整，但 C 里 / 向零取整`, when:`可读性优先写 *2 //2；只有热循环和位掩码才写移位`},
    {vs:`浮点数的 bit`, same:`都是 bit 串`, diff:`float 分符号/指数/尾数三段，移位没有算术意义`, when:`float 别做位运算；fp16 的 5 位指数是混合精度下溢的根源`}
  ],
  ext:[
    {t:`进制转换是位运算的 10 进制版本`, go:'di.base_convert'},
    {t:`int 溢出的静默环绕在 numpy 里怎么防`, go:'np.overflow'},
    {t:`fp16 的位布局决定混合精度的可表示范围`, go:'pt.amp'}
  ]
},

'di.base_convert': {
  layers:{
    alg:`任何 n 唯一写成 Σ d_k b^k，0 ≤ d_k < b。反复除 b 取余，余数序列自低位到高位就是各 d_k。一位 16 进制恰对应四位二进制，因为 16 = 2^4。`,
    geo:`n 个珠子按 b 个一组打包，包再按 b 个一组打成大包……每层「剩下没打包的」就是那一位的数字。`,
    comp:`to_base 是 while n: n%b, n//=b；from_base 是 Horner：v = v*b + d。两者互逆。hex 与 bin 之间不用算，直接按 4 位一组查表。`
  },
  proof:{
    from:`带余除法：n = qb + r，0 ≤ r < b，且 q, r 唯一`,
    to:`每个非负整数 n 有唯一的 b 进制表示，且反复除 b 取余得到它`,
    steps:[
      [`存在性：n = q₀b + d₀，再 q₀ = q₁b + d₁，…，直到 q_k = 0`, `每次带余除法，商严格变小（q < n 当 n ≥ 1），有限步到 0`],
      [`回代：n = d₀ + b(d₁ + b(d₂ + …)) = Σ d_k b^k`, `逐层把 q_i 展开，这就是 Horner 形式反过来读`],
      [`唯一性：若 Σ d_k b^k = Σ d'_k b^k，两边 mod b 得 d₀ = d'₀`, `所有 k ≥ 1 的项含因子 b，mod b 后只剩 d₀；0 ≤ d₀, d'₀ < b 保证相等`],
      [`减去 d₀ 再除 b，对剩下的归纳，得所有 d_k = d'_k`, `每步剥掉一位，归纳变量是位数`],
      [`from_base 的 Horner：v ← v·b + d 从高位读，读完 k 位后 v = Σ_{i<k} d_i b^{k−1−i}`, `每读一位，之前的所有位权重乘 b，正是「整体升一位」`],
      [`16 = 2^4，所以 Σ h_j 16^j = Σ h_j 2^{4j}，每个 0 ≤ h_j < 16 恰好占 4 个二进制位`, `一位十六进制的 4 位二进制表示不会溢出到相邻组`]
    ],
    end:`进制只是同一个整数的不同「打包方式」。唯一性来自带余除法的唯一性；Horner 是所有多项式求值的原型。`
  },
  scratch:{
    lang:'python',
    code:`import random
random.seed(0)
D = "0123456789abcdef"
def to_base(n, b):
    if n == 0: return "0"
    s = []
    while n:
        s.append(D[n % b]); n //= b          # 反复除 b 取余
    return "".join(reversed(s))
def from_base(s, b):
    v = 0
    for ch in s:
        v = v * b + D.index(ch)              # Horner
    return v
print("2024 ->", {b: to_base(2024, b) for b in [2, 8, 10, 16]})
h = to_base(2024, 16)
print("hex 逐位 4 位:", " ".join(f"{D.index(c):04b}" for c in h), "==", to_base(2024, 2).zfill(4 * len(h)))
ok = all(from_base(to_base(n, b), b) == n and to_base(n, b) == (format(n, {2:'b',8:'o',16:'x'}[b]) if b in (2,8,16) else to_base(n, b))
         for n in random.sample(range(0, 10**9), 1000) for b in range(2, 17))
print("1000 个随机数 x 进制 2..16 往返互逆 (且与 format 一致):", ok)
print("int('7e8', 16) =", int("7e8", 16), " from_base =", from_base("7e8", 16))`,
    out:`2024 -> {2: '11111101000', 8: '3750', 10: '2024', 16: '7e8'}
hex 逐位 4 位: 0111 1110 1000 == 011111101000
1000 个随机数 x 进制 2..16 往返互逆 (且与 format 一致): True
int('7e8', 16) = 2024  from_base = 2024`,
    note:`to_base 的 n%b, n//=b 是第 1 步；from_base 的 v*b+d 是第 5 步；hex 逐位映射 4 位对应第 6 步；1000 个数互逆验证第 3-4 步的唯一性。`
  },
  contrast:[
    {vs:`浮点的二进制表示`, same:`同样是 Σ 位 × 2^k`, diff:`小数部分是负指数 2^{−k}，0.1 在二进制下是无限循环，所以 0.1+0.2 ≠ 0.3`, when:`整数进制转换精确；小数转换要接受截断`},
    {vs:`字符编码 (ASCII/UTF-8)`, same:`都把东西映射成字节`, diff:`进制是数值的表示，编码是字符到整数的约定，不做算术`, when:`看到 0x41 想 65 再想 'A'，中间那步是进制，最后一步是编码`},
    {vs:`科学计数法`, same:`都写成 系数 × 底^指数`, diff:`科学计数法只有一个指数，进制表示是每位都带指数的和`, when:`量级估算用科学计数法；精确表示用进制`}
  ],
  ext:[
    {t:`二进制位上的直接操作`, go:'di.bits'},
    {t:`Horner 就是多项式求值的最省乘法方式`, go:'al.polynomial'},
    {t:`对数刻度：位数就是 log_b n 的整数部分加一`, go:'ns.log_scale'}
  ]
},

'di.graph': {
  layers:{
    alg:`图 G = (V, E)。邻接矩阵 A_{ij} = 1 表示 i–j 有边。(A^k)_{ij} = 从 i 到 j 长为 k 的路径数。握手引理 Σ deg = 2|E|；树满足 |E| = |V| − 1。`,
    geo:`点和线。矩阵乘一次就是「再走一步」：A² 的 (i,j) 数的是所有中转点 m，i→m→j 都有边的情况。`,
    comp:`稠密图用 n×n 矩阵，稀疏图用邻接表 dict[node] → list。BFS 就是逐层展开 A 的幂而不真的做矩阵乘；注意力矩阵就是一张带权完全图的邻接矩阵。`
  },
  proof:{
    from:`邻接矩阵定义 A_{ij} = [i–j 有边]；矩阵乘法定义 (AB)_{ij} = Σ_m A_{im} B_{mj}`,
    to:`(A^k)_{ij} = 从 i 到 j 恰好走 k 步的路径（walk）数；Σ_v deg(v) = 2|E|`,
    steps:[
      [`k = 1：(A¹)_{ij} = A_{ij} = 1 步路径数（有边则 1 条，否则 0）`, `归纳 base，直接由定义`],
      [`设 (A^k)_{ij} 是 k 步路径数。(A^{k+1})_{ij} = Σ_m (A^k)_{im} A_{mj}`, `矩阵乘法定义，把 A^{k+1} 写成 A^k · A`],
      [`每一项 (A^k)_{im}·A_{mj} = 「i 走 k 步到 m 的路径数」×「m 到 j 是否有边」`, `乘法原理：前段有 (A^k)_{im} 种走法，后段有 A_{mj} ∈ {0,1} 种`],
      [`对所有中转点 m 求和，得 i 走 k+1 步到 j 的路径总数`, `k+1 步路径的倒数第二个点必是某个 m，按 m 分类互不重叠，加法原理`],
      [`由归纳法，对所有 k 成立`, `base + step 完成`],
      [`握手引理：每条边 {u,v} 给 deg(u) 贡献 1，给 deg(v) 贡献 1`, `度数定义为关联边数；按边数而不是按点数`],
      [`所以 Σ deg = 2|E|；推论：奇度点个数为偶数`, `偶数减去偶度点的贡献仍是偶数`]
    ],
    end:`「矩阵乘法 = 再走一步」把图论问题变成线性代数：路径计数、连通性、PageRank、图神经网络的消息传递全是 A 的幂或它的归一化版本。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
from itertools import product
edges = [(0,1),(0,2),(1,2),(1,3),(2,3),(3,4)]
n = 5
A = np.zeros((n, n), dtype=int)
for u, v in edges:
    A[u, v] = A[v, u] = 1
deg = A.sum(axis=1)
print("度序列:", deg.tolist(), " sum =", int(deg.sum()), " 2|E| =", 2 * len(edges), " 奇度点数:", int((deg % 2).sum()))
A3 = np.linalg.matrix_power(A, 3)
def walks(i, j, k):
    return sum(1 for mid in product(range(n), repeat=k - 1)
               if all(A[p, q] for p, q in zip((i,) + mid, mid + (j,))))
B = np.array([[walks(i, j, 3) for j in range(n)] for i in range(n)])
print("A^3 =")
print(A3)
print("暴力枚举 3 步 walk 数 == A^3:", np.array_equal(A3, B))
print("A^2 对角线 = 度数:", np.diag(np.linalg.matrix_power(A, 2)).tolist())`,
    out:`度序列: [2, 3, 3, 3, 1]  sum = 12  2|E| = 12  奇度点数: 4
A^3 =
[[2 5 5 2 2]
 [5 4 5 6 1]
 [5 5 4 6 1]
 [2 6 6 2 3]
 [2 1 1 3 0]]
暴力枚举 3 步 walk 数 == A^3: True
A^2 对角线 = 度数: [2, 3, 3, 3, 1]`,
    note:`A.sum() = 2E 对应第 6-7 步；matrix_power(A,3) 与暴力枚举 walks 逐项相等对应第 2-5 步。`
  },
  contrast:[
    {vs:`路径 (path) 与游走 (walk)`, same:`都是沿边走`, diff:`A^k 数的是 walk，允许重复经过点和边；path 不允许重复点`, when:`连通性、马尔可夫链用 walk；最短路、哈密顿路问题说 path`},
    {vs:`树`, same:`树是图的特例`, diff:`连通且无环，等价于 |E| = |V|−1 且连通；任意两点恰一条路径`, when:`层级结构、递归结构、决策树用树；有环关系（社交、蛋白互作）用一般图`},
    {vs:`有向图`, same:`同样用邻接矩阵`, diff:`A 不对称，A_{ij} ≠ A_{ji}；度分入度出度`, when:`因果图、计算图、依赖关系有方向；相似性、共现是无向`}
  ],
  ext:[
    {t:`邻接矩阵的特征向量给中心性与谱聚类`, go:'la.eigen'},
    {t:`注意力矩阵是 token 之间的带权邻接矩阵`, go:'dl.attention'},
    {t:`图的计数问题`, go:'co.graph_count'}
  ]
},

'di.logic': {
  layers:{
    alg:`命题只有真假。A→B 定义为 ¬A ∨ B，所以只在 A 真 B 假时为假。德摩根 ¬(A∧B) = ¬A∨¬B。逆否 A→B ≡ ¬B→¬A。量词否定要翻转：¬∀x P = ∃x ¬P。`,
    geo:`文氏图：A→B 是「A 的圆整个落在 B 的圆里」。圆外面的点（A 假）不违反包含关系，所以前提假时蕴含恒真。`,
    comp:`真值表就是穷举 2^n 行；if 条件、assert、单元测试的「反例」全是逻辑。写 not (a and b) 时 Python 会短路求值，等价于 (not a) or (not b)。`
  },
  proof:{
    from:`真值表定义：¬, ∧, ∨ 的取值；A→B 定义为 ¬A ∨ B`,
    to:`德摩根律、逆否等价、量词否定翻转`,
    steps:[
      [`列 A, B 四种取值，逐行算 ¬(A∧B) 与 ¬A∨¬B`, `命题逻辑的等价就是「所有取值下真值相同」，有限行可以穷举`],
      [`四行都相同：TT→F,F；TF→T,T；FT→T,T；FF→T,T`, `这就完成了德摩根律的证明，穷举即证明`],
      [`A→B = ¬A∨B；¬B→¬A = ¬¬B∨¬A = B∨¬A`, `按定义展开，双重否定消去`],
      [`∨ 交换律给 ¬A∨B = B∨¬A，故 A→B ≡ ¬B→¬A`, `两者是同一个式子换了顺序`],
      [`A→B 只在 A 真 B 假为假：¬A∨B 为假 ⇔ ¬A 假且 B 假 ⇔ A 真 B 假`, `∨ 为假当且仅当两边都假`],
      [`有限域 {x₁…x_n} 上 ∀x P(x) = P(x₁)∧…∧P(x_n)；对它取否定用德摩根`, `全称是大合取，存在是大析取，德摩根逐项翻转`],
      [`¬(P(x₁)∧…∧P(x_n)) = ¬P(x₁)∨…∨¬P(x_n) = ∃x ¬P(x)`, `∨ 链就是存在量词；无限域上作为定义采用同一规则`]
    ],
    end:`逻辑等价 = 真值表逐行相同。「蕴含前提假则恒真」和「否定要翻量词」是写证明和写测试时最常犯错的两处。`
  },
  scratch:{
    lang:'python',
    code:`from itertools import product
print(" A  B | ~(A&B)  ~A|~B | A->B  ~B->~A")
for a, b in product([True, False], repeat=2):
    print(f" {int(a)}  {int(b)} |   {int(not (a and b))}       {int((not a) or (not b))}   |  {int((not a) or b)}      {int(b or (not a))}")
rows = list(product([True, False], repeat=2))
dm   = all((not (a and b)) == ((not a) or (not b)) for a, b in rows)
allq = all(((not a) or b) == (b or (not a)) for a, b in rows)
print("德摩根 ~(A&B) == ~A|~B :", dm, "   逆否 A->B == ~B->~A :", allq)
P = lambda x: x < 7
dom = range(10)
print("range(10), P(x)= x<7:  not all(P) =", not all(P(x) for x in dom), "  any(not P) =", any(not P(x) for x in dom), "  反例:", [x for x in dom if not P(x)])
print("前提假的蕴含: (1>2) -> (任何) =", (not (1 > 2)) or False, "; 只有 T->F 为假:", (not True) or False)`,
    out:` A  B | ~(A&B)  ~A|~B | A->B  ~B->~A
 1  1 |   0       0   |  1      1
 1  0 |   1       1   |  0      0
 0  1 |   1       1   |  1      1
 0  0 |   1       1   |  1      1
德摩根 ~(A&B) == ~A|~B : True    逆否 A->B == ~B->~A : True
range(10), P(x)= x<7:  not all(P) = True   any(not P) = True   反例: [7, 8, 9]
前提假的蕴含: (1>2) -> (任何) = True ; 只有 T->F 为假: False`,
    note:`真值表打印对应第 1-2 步；allq 与 dm 两个 all() 是第 2、4 步的穷举验证；有限域 range(10) 上 any(not P) 对应第 6-7 步；最后一行是第 5 步。`
  },
  contrast:[
    {vs:`蕴含 A→B 与因果 A 导致 B`, same:`日常语言都说「如果…就…」`, diff:`蕴含只是真值关系，与时间和机制无关；「1=2 → 月亮是奶酪」为真`, when:`证明里只用蕴含；实验设计里谈因果要用 DAG 和干预`},
    {vs:`逆命题 B→A`, same:`长得像`, diff:`逆命题与原命题不等价；逆否才等价`, when:`「可导则连续」不能倒过来用；反证法用的是逆否`},
    {vs:`异或 XOR`, same:`都是二元连接词`, diff:`A⊕B 在恰一个为真时为真，是「不等价」；A↔B 是「等价」`, when:`奇偶校验、翻转位用 XOR；判断等价用 ↔`}
  ],
  ext:[
    {t:`归纳法的形式 P(1) ∧ ∀k[P(k)→P(k+1)] 就是一条逻辑推理规则`, go:'di.induction'},
    {t:`集合运算的交并补与逻辑的与或非一一对应`, go:'di.set_function'},
    {t:`布尔掩码：numpy 里 & | ~ 就是逐元素的逻辑`, go:'np.mask'}
  ]
},

'di.set_function': {
  layers:{
    alg:`函数 f: A→B 是给 A 的每个元素恰指定一个像。单射：不同元素像不同；满射：B 每个元素都被打到；双射：两者都是。|A→B| = |B|^{|A|}，双射数 = n!，|A∪B| = |A|+|B|−|A∩B|。`,
    geo:`两列点，从左列每个点引恰一条箭头到右列。单射 = 右边没有点被两支箭头打中；满射 = 右边没有点空着；双射 = 两列点配成对。`,
    comp:`dict 就是有限函数：键唯一（每个元素恰一个像），值可以重复（未必单射）。求逆 {v:k} 只在单射时不丢信息。set 的 | & - 对应并交差。`
  },
  proof:{
    from:`函数的定义（每个 a ∈ A 恰一个像）；乘法原理；容斥的两集合形式`,
    to:`|A→B| = |B|^{|A|}；有限集 |A| = |B| = n 时单射 ⇔ 满射 ⇔ 双射，且双射数为 n!`,
    steps:[
      [`A = {a₁…a_m}，f 由 (f(a₁),…,f(a_m)) 完全决定`, `函数就是它的像表；两个函数相等 ⇔ 逐点相等`],
      [`每个 f(a_i) 有 |B| 种独立选择，共 |B|^m 个函数`, `乘法原理：各坐标独立选，总数是乘积`],
      [`单射：f(a₁) 有 n 种，f(a₂) 不能重复剩 n−1 种，…，共 n(n−1)…(n−m+1)`, `每选一个就排除一个，m > n 时为 0（鸽笼）`],
      [`|A| = |B| = n 时单射数 = n!；单射的像有 n 个不同元素，恰好填满 B，故满射`, `n 个不同元素放进 n 个位置，没有空位`],
      [`反过来满射：B 的 n 个元素都被打中，A 只有 n 支箭头，每支只能打一个，故无重复，是单射`, `鸽笼原理的另一面：n 个像盖住 n 个目标，不能有重复`],
      [`所以有限等大集合上单射 ⇔ 满射 ⇔ 双射，双射数 = n!`, `第 4、5 步合起来；无限集不成立（n ↦ 2n 单射不满射）`],
      [`|A∪B|：把 A 和 B 各数一遍，交集被数了两次，减去一次`, `容斥的最简形式，推广到 k 个集合要交替加减`]
    ],
    end:`「函数 = 像表」把计数问题变成填表问题。双射是计数的核心工具：证两个集合一样大，只要造一个双射。`
  },
  scratch:{
    lang:'python',
    code:`from itertools import product, permutations
A = [1, 2, 3]; B = ['a', 'b', 'c', 'd']
F = list(product(B, repeat=len(A)))              # 每个像表 = 一个函数
inj = [f for f in F if len(set(f)) == len(f)]
print(f"|A|=3,|B|=4: 函数数 {len(F)} = 4^3 = {4**3};  单射数 {len(inj)} = 4*3*2 = {4*3*2};  满射数 {sum(1 for f in F if set(f)==set(B))} (3 支箭头盖不住 4 个目标)")
B3 = ['a', 'b', 'c']
F3 = list(product(B3, repeat=3))
inj3 = [f for f in F3 if len(set(f)) == 3]
sur3 = [f for f in F3 if set(f) == set(B3)]
bij = [f for f in F3 if len(set(f)) == 3 and set(f) == set(B3)]
print(f"|A|=|B|=3: 函数 {len(F3)}, 单射 {len(inj3)}, 满射 {len(sur3)}, 双射 {len(bij)} = 3! = {len(list(permutations(B3)))}")
print("等大有限集上 单射 <=> 满射 (逐函数):", all((len(set(f)) == 3) == (set(f) == set(B3)) for f in F3))
S, T = set(range(0, 12)), set(range(8, 20))
print(f"|S|+|T|-|S&T| = {len(S)}+{len(T)}-{len(S & T)} = {len(S)+len(T)-len(S&T)}  |S u T| = {len(S | T)}")`,
    out:`|A|=3,|B|=4: 函数数 64 = 4^3 = 64;  单射数 24 = 4*3*2 = 24;  满射数 0 (3 支箭头盖不住 4 个目标)
|A|=|B|=3: 函数 27, 单射 6, 满射 6, 双射 6 = 3! = 6
等大有限集上 单射 <=> 满射 (逐函数): True
|S|+|T|-|S&T| = 12+12-4 = 20  |S u T| = 20`,
    note:`product(B, repeat=len(A)) 就是第 1-2 步的像表枚举；inj、bij 计数对应第 3-4 步；all(...) 那行验证第 6 步的等价；最后一行是第 7 步。`
  },
  contrast:[
    {vs:`关系 R ⊆ A×B`, same:`都是 A 和 B 之间的对应`, diff:`函数是每个 a 恰一个像的关系；关系可以一对多、可以没有`, when:`数据库的一对多是关系不是函数；dict 只能存函数`},
    {vs:`序列 / 元组`, same:`都是有序的像表`, diff:`序列是定义域为 {0..n−1} 的函数`, when:`把序列看成函数，就能谈单调、有界、逆`},
    {vs:`多重集 / 组合`, same:`都在计数`, diff:`函数计数区分顺序（a₁ 打到哪，a₂ 打到哪），组合不区分`, when:`分配任务给人是函数；从人里选小组是组合`}
  ],
  ext:[
    {t:`双射证明两集合等大是组合计数的主武器`, go:'co.bijection'},
    {t:`鸽笼原理：m > n 时无单射`, go:'co.pigeonhole'},
    {t:`容斥推广到多个集合`, go:'co.inclusion_exclusion'}
  ]
}

});
