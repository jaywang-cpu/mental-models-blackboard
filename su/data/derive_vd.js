/* 数理宇宙 v3 · 推导层 · vd 吠陀速算大陆（16 节点 = 16 口诀）
   旁挂文件，不改动 v1/v2。深化层讲"怎么用"，这里只做两件事：把每条口诀的一般式严格证出来、用代码穷举它的适用范围。
   scratch 全部用 python3 + numpy 2.3 实际跑过，out 是真实输出（seed 固定）。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'vd.ekadhikena': {
  layers:{
    alg:`(10a+5)² = 100a² + 100a + 25 = 100·a(a+1) + 25。交叉项 2·10a·5 = 100a 自带因子 100，所以能和 100a² 合并成 a(a+1) 整体推到百位以上；25 < 100 保证右段永不进位。`,
    geo:`边长 10a+5 的正方形切成四块：a²个百格、两条 10a×5 的长条（合起来正好又是 a 个百格）、一个 5×5 的小角。前三块拼成 a(a+1) 个百格，小角 25 单独留在右下。`,
    comp:`机器不做平方：取前缀 P = n//10，算 P*(P+1)，字符串拼 '25'。P(P+1) 本身是一次乘法，前缀超两位时这一步不再免费。`
  },
  proof:{
    from:`十进制表示 n = 10a + 5（a ≥ 0 整数）；乘法分配律`,
    to:`n² 的末两位恒为 25，其余部分恒为 a(a+1)；并推广到 (10a+b)(10a+c)、b+c=10`,
    steps:[
      [`展开 (10a+5)² = 100a² + 2·10a·5 + 25`, `完全平方公式 (x+y)² = x² + 2xy + y²，只用了分配律`],
      [`交叉项 2·10a·5 = 100a`, `2·5 = 10 与 10a 相乘得 100a：末位是 5 这个条件正是为了让交叉项凑出因子 100`],
      [`合并 100a² + 100a = 100·a(a+1)`, `两项都含 100，提公因子；a(a+1) 是"前缀乘它的后继"`],
      [`所以 n² = 100·a(a+1) + 25`, `第 1-3 步的代数合并，等式严格成立`],
      [`因为 0 ≤ 25 < 100，右段 25 恰好占满两位且不进位，左段就是 a(a+1) 的十进制`, `十进制中 100·X + Y（0 ≤ Y < 100）的写法唯一：X 是去掉末两位的部分，Y 是末两位`],
      [`前缀多位时令 P = 前缀（如 165 → P=16），n = 10P + 5，同一条式子给 P(P+1)|25`, `推导只用了 n = 10a+5 这个形式，没限制 a 是一位数，所以 P 必须是整个前缀`],
      [`推广：(10a+b)(10a+c) 且 b+c=10 时 = 100a² + 10a(b+c) + bc = 100a(a+1) + bc`, `交叉项 10a(b+c) = 100a 同样带因子 100；b=c=5 就退回本口诀，且 bc ≤ 25 < 100 仍不进位`]
    ],
    end:`末位 5 的平方 = 前缀×后继 拼 25，因为交叉项恰好凑出 100 而 25 < 100。它是 Antyayor Dasakepi 在 b=c=5 时的特例。`
  },
  scratch:{
    lang:'python',
    code:`# Ekadhikena: (10a+5)^2 = 100*a*(a+1) + 25 ; 推广 (10a+b)(10a+c), b+c=10 ; 分数支 1/(10k-1)
ok = 0
for n in range(5, 100000, 10):          # 所有末位 5 的数, 直到 5 位
    a = n // 10
    assert n * n == 100 * a * (a + 1) + 25 and 25 < 100
    ok += 1
print('尾5平方 (10a+5)^2 = a(a+1)|25: 验证', ok, '组 (5..99995) 全部通过')
good = bad = 0
for a in range(1, 100):
    for b in range(0, 11):
        for c in range(0, 11):
            lhs = (10 * a + b) * (10 * a + c); rhs = 100 * a * (a + 1) + b * c
            if b + c == 10: assert lhs == rhs; good += 1
            else: assert lhs - rhs == 10 * a * (b + c - 10); bad += 1
print('b+c=10 时 a(a+1)|bc 成立', good, '组; b+c!=10 时偏差恒为 10a(b+c-10), 共', bad, '组无一成立')
# 只有末位 5 才行: 末位 u 的平方, 交叉项 2*10a*u 含 100 当且仅当 u=5 (或 0)
ends = [u for u in range(10) if (2 * 10 * u) % 100 == 0]
print('交叉项 20au 能被 100 整除的末位 u:', ends)
def ekadhika_digits(D, m):                 # 1/D, D 末位 9: 反复除以 k=D//10+1
    k = D // 10 + 1; out = []; cur = 1
    for _ in range(m):
        q, r = divmod(cur, k); out.append(q); cur = r * 10 + q
    return out
def long_div(D, m):
    out = []; r = 1
    for _ in range(m):
        r *= 10; out.append(r // D); r %= D
    return out
cnt = 0
for D in range(19, 1000, 10):
    assert ekadhika_digits(D, 60) == long_div(D, 60); cnt += 1
print('分数支: 分母末位 9 共', cnt, '个 (19..999), 前 60 位小数与长除法逐位一致')`,
    out:`尾5平方 (10a+5)^2 = a(a+1)|25: 验证 10000 组 (5..99995) 全部通过
b+c=10 时 a(a+1)|bc 成立 1089 组; b+c!=10 时偏差恒为 10a(b+c-10), 共 10890 组无一成立
交叉项 20au 能被 100 整除的末位 u: [0, 5]
分数支: 分母末位 9 共 99 个 (19..999), 前 60 位小数与长除法逐位一致`,
    note:`第 1 段穷举 10000 个末位 5 的数对应第 4-6 步；第 2 段是第 7 步的推广并给出 b+c≠10 时的偏差；u∈{0,5} 那行是第 2 步的条件；分数支验证同名口诀的另一用法。`
  },
  contrast:[
    {vs:`Antyayor Dasakepi vd.antyayor_dasake`, same:`同一条恒等式 100a(a+1) + bc`, diff:`本口诀 b=c=5 是平方；那条 b+c=10 是两个不同数相乘`, when:`同一个数平方用这条；47×43 这种末位互补用那条`},
    {vs:`Yavadunam vd.yavadunam`, same:`都算平方、都是左右拼段`, diff:`这条看末位是不是 5，那条看离 10 的幂近不近`, when:`85² 用这条；96² 用那条；两条都不沾就 Urdhva`},
    {vs:`Ekadhikena 的分数用法（1/19 循环小数）`, same:`同一个口诀名`, diff:`那是 1/(10k−1) 的几何级数展开，只反复乘除 k=a+1，与平方毫无关系`, when:`分母末位是 9 求循环小数才用分数支`}
  ],
  ext:[
    {t:`一般化为末位互补的乘法`, go:'vd.antyayor_dasake'},
    {t:`平方速算全家：(a±b)² 的各种拆法`, go:'ns.square_trick'},
    {t:`把 (10a+5)² 看成多项式在 x=10 处求值`, go:'al.polynomial'}
  ]
},

'vd.nikhilam': {
  layers:{
    alg:`(B−a)(B−b) = B² − B(a+b) + ab = B(B−a−b) + ab。B=10^k 时 B·(B−a−b) 只是把 (B−a−b) 左移 k 位，ab 落进右边 k 个空位。`,
    geo:`一个 B×B 的大正方形，切掉宽 a 的竖条和宽 b 的横条，剩下 (B−a)(B−b) 的矩形。两条都切走多减了一次右下角 a×b，要补回来：面积 = B(B−a−b) + ab。`,
    comp:`算 x·y：a=B−x, b=B−y；左 = x−b（= x+y−B），右 = ab。右段按 k 位对齐：ab<0 借 1、ab≥B 进 1、ab<10^(k−1) 补 0。全是整数加减和一次小乘法。`
  },
  proof:{
    from:`任意整数 B、a、b；分配律；十进制位值 n = B·q + r（0 ≤ r < B）唯一`,
    to:`(B−a)(B−b) = B(B−a−b) + ab，且当 B=10^k 时左段 x−b、右段 ab 占 k 位；借位/进位/补零规则全由这条式子读出`,
    steps:[
      [`展开 (B−a)(B−b) = B² − aB − bB + ab`, `四项分配律，无任何条件`],
      [`前三项提 B：B² − aB − bB = B(B−a−b)`, `公因子 B；此时括号里 B−a−b = (B−a) − b = x − b，即"一个数减去另一个数的偏差"`],
      [`所以 xy = B·(x−b) + ab，两个数交叉减 = 左段，偏差相乘 = 右段`, `第 1-2 步合并；x−b 与 y−a 相等（都等于 x+y−B），所以交叉减哪边都行`],
      [`B = 10^k 时 B·L 就是 L 后面跟 k 个 0，ab 若满足 0 ≤ ab < 10^k 就恰好填进这 k 个 0 的位置`, `位值制：10^k·L + R（0 ≤ R < 10^k）的十进制写法唯一是 L 拼 R（R 左补 0 到 k 位）`],
      [`ab ≥ 10^k 时把 ab 的高位加到 L：10^k·L + ab = 10^k·(L + ab//10^k) + ab mod 10^k`, `带余除法把超出的部分归到左段，这就是"进位"`],
      [`a、b 异号时 ab < 0：10^k·L + ab = 10^k·(L−1) + (10^k + ab)`, `从左段借一个 10^k 加到右段，使右段落回 [0,10^k)，这就是"借位"；103×96 → 99|−12 → 98|88`],
      [`B 不必是 10 的幂，恒等式照样成立，只是 B·L 不再是"左移"，得真的乘`, `第 1-3 步没用到 B 的任何性质；这是 Anurupyena 换工作基的根据`]
    ],
    end:`Nikhilam 是恒等式 (B−a)(B−b) = B(B−a−b) + ab 的十进制读法。位宽、补零、进位、借位四条规则全是"10^k·L + R 写法唯一"的推论。`
  },
  scratch:{
    lang:'python',
    code:`# Nikhilam: (B-a)(B-b) = B(B-a-b) + ab ; B=100 附近全部数对, 含借位/进位/补零
def nikhilam(x, y, B):
    a, b = B - x, B - y                     # 偏差, 可为负
    left, right = x - b, a * b              # 左段 = B-a-b = x-b, 右段 = ab
    while right < 0:  left -= 1; right += B # 借位: 从式子读出 B*L + ab = B*(L-1) + (B+ab)
    while right >= B: left += 1; right -= B # 进位: B*L + ab = B*(L+1) + (ab-B)
    return left * B + right
B = 100; total = borrow = carry = pad = plain = 0
for x in range(1, 200):
    for y in range(1, 200):
        a, b = B - x, B - y
        assert nikhilam(x, y, B) == x * y; total += 1
        if a * b < 0: borrow += 1
        elif a * b >= B: carry += 1
        elif a * b < 10: pad += 1
        else: plain += 1
print('B=100, x,y 取遍 1..199:', total, '组全部等于 x*y')
print('  直接拼接', plain, '| 右段一位需补 0', pad, '| 右段超两位需进位', carry, '| 偏差异号需借位', borrow)
x, y = 103, 96; a, b = B - x, B - y
print('103x96: 偏差 %d,%d 左段 %d 右段 %d -> 借位后 %d|%02d = %d' % (a, b, x - b, a * b, x - b - 1, a * b + B, nikhilam(x, y, B)))
print('994x988 (B=1000): 右段', (1000 - 994) * (1000 - 988), '按 B 占 3 位 -> 982|072 =', nikhilam(994, 988, 1000))
for Bk in (10, 1000, 10000):
    n = 0
    for x in range(Bk // 2, 2 * Bk, max(1, Bk // 50)):
        for y in range(Bk // 2, 2 * Bk, max(1, Bk // 50)):
            assert nikhilam(x, y, Bk) == x * y; n += 1
    print('B=%d 抽样 %d 组全部通过' % (Bk, n))
n = 0
for Bk in (7, 12, 50, 250):                 # B 不是 10 的幂, 恒等式照样成立
    for x in range(1, 3 * Bk):
        for y in range(1, 3 * Bk):
            assert Bk * (x + y - Bk) + (Bk - x) * (Bk - y) == x * y; n += 1
print('任意 B in {7,12,50,250}:', n, '组恒等式成立 (只是 B*L 不再是左移)')`,
    out:`B=100, x,y 取遍 1..199: 39601 组全部等于 x*y
  直接拼接 900 | 右段一位需补 0 443 | 右段超两位需进位 18656 | 偏差异号需借位 19602
103x96: 偏差 -3,4 左段 99 右段 -12 -> 借位后 98|88 = 9888
994x988 (B=1000): 右段 72 按 B 占 3 位 -> 982|072 = 982072
B=10 抽样 225 组全部通过
B=1000 抽样 5625 组全部通过
B=10000 抽样 5625 组全部通过
任意 B in {7,12,50,250}: 584827 组恒等式成立 (只是 B*L 不再是左移)`,
    note:`nikhilam 里两个 while 就是第 5-6 步的进位/借位规则；第 1 段 39601 对全部通过并统计四种右段情形（第 4-6 步）；103×96 是第 6 步借位、994×988 是第 4 步位宽由 B 定；最后一段是第 7 步任意 B。`
  },
  contrast:[
    {vs:`Urdhva 竖乘 vd.urdhva`, same:`都是两数相乘`, diff:`Nikhilam 是一次恒等式代换，只在偏差小时省力；Urdhva 是通用 O(n²) 卷积`, when:`两数都在 10 的幂附近用这条；否则 Urdhva`},
    {vs:`Yavadunam vd.yavadunam`, same:`同一恒等式`, diff:`Yavadunam 是 a=b 的特例：(B−a)² = B(B−2a) + a²`, when:`平方用 Yavadunam 的说法，其实是同一件事`},
    {vs:`Anurupyena vd.anurupyena`, same:`同一恒等式`, diff:`B 不是 10 的幂时，B·L 得真乘一次再按比例还原`, when:`数离 10 的幂远、离 50/200/500 近时换工作基`}
  ],
  ext:[
    {t:`换任意工作基 B`, go:'vd.anurupyena'},
    {t:`乘数 = B−1 的特例：乘 9、99、999`, go:'vd.ekanyunena'},
    {t:`把 (B−a)(B−b) 当多项式看：x=B 处的二项式乘积`, go:'al.polynomial'}
  ]
},

'vd.urdhva': {
  layers:{
    alg:`把 n 位数写成 Σ dᵢ·10ⁱ，两数相乘 = Σₖ (Σᵢ₊ⱼ₌ₖ aᵢbⱼ)·10ᵏ。第 k 列的值是下标和为 k 的全部乘积之和——离散卷积。最后从右往左处理进位。`,
    geo:`两行数字上下对齐，每一列的结果来自"竖线 + 交叉线"连出的所有配对。列号从右数 k，配对数 = min(k+1, 2n−1−k)，中间列最多。`,
    comp:`双重循环 conv[i+j] += a[i]*b[j]，然后一趟进位。多项式乘法不进位，数字乘法把 x 代成 10 再进位。np.convolve 就是这段循环。`
  },
  proof:{
    from:`位值制 x = Σᵢ aᵢ10ⁱ，y = Σⱼ bⱼ10ʲ；分配律；进位规则`,
    to:`xy 的第 k 位（进位前）= Σᵢ₊ⱼ₌ₖ aᵢbⱼ，即数字序列的卷积；n 位×n 位共 2n−1 列，O(n²) 次乘法`,
    steps:[
      [`xy = (Σᵢ aᵢ10ⁱ)(Σⱼ bⱼ10ʲ) = Σᵢ Σⱼ aᵢbⱼ 10ⁱ⁺ʲ`, `双重分配律：每一项乘每一项`],
      [`按 k = i+j 归并：xy = Σₖ (Σᵢ₊ⱼ₌ₖ aᵢbⱼ) 10ᵏ`, `有限和可以任意重排；把 10 的同次幂收在一起`],
      [`记 cₖ = Σᵢ₊ⱼ₌ₖ aᵢbⱼ，这正是序列 (aᵢ) 与 (bⱼ) 的离散卷积 (a∗b)ₖ`, `卷积的定义就是"下标和固定的乘积求和"；口诀里的竖线是 i=j 的项，交叉线是 i≠j 的项`],
      [`第 k 列的配对数 = #{(i,j): i+j=k, 0≤i,j<n}`, `计数：k ≤ n−1 时有 k+1 对，之后递减；中间列最多 n 对，所以"三位乘三位中间要加 3 个乘积"`],
      [`cₖ 可能 ≥ 10，从 k=0 开始 cₖ₊₁ += cₖ//10，cₖ %= 10`, `10ᵏ·cₖ = 10ᵏ⁺¹·(cₖ//10) + 10ᵏ·(cₖ%10)：进位就是带余除法，必须从右往左因为高位的进位依赖低位的结果`],
      [`若不代 x=10、不进位，第 2 步就是多项式乘法 (Σaᵢxⁱ)(Σbⱼxʲ) = Σcₖxᵏ`, `推导到第 3 步为止没用 10 的任何性质，换成 x、换成 12（尺寸）、换成 60（时间）全成立`],
      [`乘法次数 = n·n，列数 = 2n−1`, `每对 (i,j) 恰好乘一次；这是朴素长乘法的 O(n²)，Karatsuba/FFT 才能更低`]
    ],
    end:`竖乘加交叉 = 数字序列做卷积再进位。它和多项式乘法、CNN 的卷积核、FFT 快速乘法是同一个运算的不同外衣。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
def urdhva(p, q):
    # 数位低->高; 第 k 列 = sum_{i+j=k} p_i q_j (卷积), 再从右往左进位
    cols = [sum(p[i] * q[k - i] for i in range(len(p)) if 0 <= k - i < len(q)) for k in range(len(p) + len(q) - 1)]
    assert cols == list(np.convolve(p, q))          # 交叉和 == 卷积
    out, c = [], 0
    for v in cols:
        v += c; out.append(v % 10); c = v // 10
    while c: out.append(c % 10); c //= 10
    return int(''.join(map(str, out[::-1])))
n = 0
for _ in range(3000):
    x, y = int(rng.integers(100, 1000)), int(rng.integers(100, 1000))
    p = [int(d) for d in str(x)[::-1]]; q = [int(d) for d in str(y)[::-1]]
    assert urdhva(p, q) == x * y; n += 1
print('随机三位x三位', n, '组: 交叉和==np.convolve, 进位后==真积, 全部通过')
print('三位x三位每列交叉项个数:', [min(k + 1, 3, 5 - k) for k in range(5)], '共 9 次乘法, 5 列')
a, b = rng.integers(-5, 6, 4), rng.integers(-5, 6, 3)
assert list(np.convolve(a, b)) == list(np.polymul(a, b)); print('多项式乘法 == 同一卷积 (不进位): 通过')
# 数字根校验 (模 9 同态): 查得出什么, 查不出什么
def dr(n): return n % 9
caught = {'单位错': 0, '换位错': 0, '差9倍错': 0}; tried = {k: 0 for k in caught}
for _ in range(2000):
    x, y = int(rng.integers(100, 1000)), int(rng.integers(100, 1000)); t = x * y
    s = list(str(t)); i = int(rng.integers(len(s)))
    w = s[:]; w[i] = str((int(w[i]) + int(rng.integers(1, 9))) % 10); w = int(''.join(w))   # 改一位
    tried['单位错'] += 1; caught['单位错'] += (dr(w) != dr(x) * dr(y) % 9)
    if s[0] != s[1]:
        w = s[:]; w[0], w[1] = w[1], w[0]; w = int(''.join(w))                                # 前两位换位
        tried['换位错'] += 1; caught['换位错'] += (dr(w) != dr(x) * dr(y) % 9)
    w = t + 9; tried['差9倍错'] += 1; caught['差9倍错'] += (dr(w) != dr(x) * dr(y) % 9)
for k in caught: print('模9校验 %s: 查出 %d / %d' % (k, caught[k], tried[k]))`,
    out:`随机三位x三位 3000 组: 交叉和==np.convolve, 进位后==真积, 全部通过
三位x三位每列交叉项个数: [1, 2, 3, 2, 1] 共 9 次乘法, 5 列
多项式乘法 == 同一卷积 (不进位): 通过
模9校验 单位错: 查出 1986 / 2000
模9校验 换位错: 查出 0 / 1777
模9校验 差9倍错: 查出 0 / 2000`,
    note:`cols 双重求和是第 1-3 步的卷积，进位循环是第 5 步；[1,2,3,2,1] 是第 4 步配对计数；polymul 那行是第 6 步；模 9 校验段说明数字根查得出改一位、查不出换位和差 9 倍（同余同态的盲区）。`
  },
  contrast:[
    {vs:`Nikhilam vd.nikhilam`, same:`都算乘法`, diff:`Urdhva 通用、不挑数；Nikhilam 只在两数靠近基准时才快`, when:`先看能不能用 Nikhilam/Antyayor，都不行再 Urdhva`},
    {vs:`傅里叶卷积 fo.convolution`, same:`同一个卷积定义`, diff:`这里是有限整数序列；FFT 把 O(n²) 卷积变 O(n log n)，大整数乘法就是这么加速的`, when:`几百位以上的大数乘法用 FFT`},
    {vs:`CNN 卷积 dl.cnn`, same:`同一个"滑窗乘加"`, diff:`CNN 的核通常翻转与否不重要且只取有效区域；数学卷积要翻转`, when:`理解 CNN 时把核当成短多项式即可`}
  ],
  ext:[
    {t:`换进制 x=12、60：带单位的乘法`, go:'vd.adyamadyena'},
    {t:`多项式乘法就是系数卷积`, go:'al.polynomial'},
    {t:`卷积定理：时域卷积 = 频域相乘，大数乘法加速`, go:'fo.convolution'}
  ]
},

'vd.paravartya': {
  layers:{
    alg:`除以 x−c 的综合除法：商系数 qᵢ = pᵢ + c·qᵢ₋₁。除数 10^k + d 就是 x=10 处的 x^k + d，根是 −d，所以"旗"= −d。走到分隔线左边是商、右边是余数。`,
    geo:`一排被除数数字，分隔线把最右 k 位圈成余数区。旗 −d 像一个传送带：每个商位乘旗后送到右边下一位，商区走完，传送带把最后一次送进余数区。`,
    comp:`一趟 O(n) 乘加，比长除法少了试商。位值可能变负或超 9，最后按值合成 Q、R，再把 R 归到 [0, 除数) 区间：R<0 就 Q−1、R+除数。`
  },
  proof:{
    from:`多项式带余除法 p(x) = (x−c)q(x) + r 存在唯一；十进制 n = p(10)`,
    to:`商系数满足 qᵢ = pᵢ + c·qᵢ₋₁（综合除法）；除以 10^k+d 时旗为 −d；余数可能出界，需按带余除法修正`,
    steps:[
      [`设 p(x) = Σ pᵢxⁿ⁻ⁱ，q(x) = Σ qᵢxⁿ⁻¹⁻ⁱ，写出 (x−c)q(x) + r 并比较同次系数`, `多项式相等当且仅当各次系数相等，这是比较系数法的依据`],
      [`得 q₀ = p₀，qᵢ = pᵢ + c·qᵢ₋₁（i ≥ 1），r = pₙ + c·qₙ₋₁`, `(x−c)q(x) 的 xⁿ⁻ⁱ 项系数是 qᵢ − c·qᵢ₋₁，令它等于 pᵢ 移项即得`],
      [`除数 10+d 就是 x+d 在 x=10 处，根 c = −d，所以每步乘 −d：这就是"变号"`, `x+d = x−(−d)，综合除法里乘的是根 c，根是 −d；口诀说"变号"只是 c=−d 的直白说法`],
      [`除数 10^k + d₁d₂…dₖ 时旗是 (−d₁, −d₂, …)，每个商位乘旗依次加到后 k 位`, `多项式 xᵏ + d₁xᵏ⁻¹ + … 的综合除法要同时减去多项，等价于每个商位向后散 k 个乘积`],
      [`按值合成：n = Q·除数 + R 精确成立`, `第 1-2 步是多项式恒等式，代 x=10 后数值恒等；数字出界（负或 >9）不影响数值`],
      [`R 可能 <0 或 ≥ 除数，因为多项式余数只保证次数低，不保证 0 ≤ R < 除数`, `多项式除法的余数条件是 deg r < deg 除数；整数除法的条件是 0 ≤ R < 除数，两者不同，所以要修正`],
      [`修正：R<0 时 Q−1、R+除数；R ≥ 除数时 Q+1、R−除数，直到 R 落回区间`, `整数带余除法 (Q,R) 唯一，每次修正保持 n = Q·除数 + R 不变，只是移动 R；有限步必到`]
    ],
    end:`Paravartya = 综合除法在 x=10 处的实例，旗就是根 −d。它省掉试商，代价是余数要按整数除法规则回归区间。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
def paravartya(N, d, k):
    # 除以 10^k + d: 旗 = -d, 商位 q_i = p_i + (-d)*q_{i-k}, 即 x^k + d 的综合除法在 x=10 处
    digs = [int(c) for c in str(N)]; head = digs[:len(digs) - k]
    q = []
    for i, dig in enumerate(head):
        q.append(dig + (-d) * (q[i - k] if i - k >= 0 else 0))
    Q = sum(v * 10 ** (len(q) - 1 - i) for i, v in enumerate(q))   # 商位可能 <0 或 >9, 按值合成
    R = N - Q * (10 ** k + d)                                       # 多项式恒等式保证 N = Q*除数 + R
    fixes = 0
    while R < 0: Q -= 1; R += 10 ** k + d; fixes += 1               # 余数回归 [0, 除数)
    while R >= 10 ** k + d: Q += 1; R -= 10 ** k + d; fixes += 1
    return Q, R, fixes
tot = need = 0
for d in (1, 2, 3, 4, 5):
    for N in range(100, 100000):
        Q, R, fx = paravartya(N, d, 1)
        assert (Q, R) == divmod(N, 10 + d); tot += 1; need += (fx > 0)
print('除数 11..15, 被除数 100..99999:', tot, '组商余全部正确; 其中', need, '组多项式余数越界需修正')
tot2 = 0
for d in (1, 2, 3, 12, 23):
    for N in range(1000, 1000000, 7):
        Q, R, fx = paravartya(N, d, 2)
        assert (Q, R) == divmod(N, 100 + d); tot2 += 1
print('除数 101,102,103,112,123 (k=2, 旗隔两位生效):', tot2, '组商余全部正确')
print('1232/11: 商位序列', [1, 2 - 1, 3 - 1], '-> Q,R =', paravartya(1232, 1, 1)[:2])
rng = np.random.default_rng(1); n = 0
for _ in range(500):                                                # 纯多项式版 == np.polydiv
    p = rng.integers(-9, 10, 5); c = int(rng.integers(-5, 6))
    q = [int(p[0])]
    for a in p[1:]: q.append(int(a) + c * q[-1])
    Q, R = np.polydiv(p, [1, -c])
    assert np.allclose(Q, q[:-1]) and np.allclose(R, [q[-1]]); n += 1
print('多项式综合除法 q_i = p_i + c*q_{i-1} vs np.polydiv:', n, '组一致 (除以 x+d 时 c=-d 即变号)')`,
    out:`除数 11..15, 被除数 100..99999: 499500 组商余全部正确; 其中 430740 组多项式余数越界需修正
除数 101,102,103,112,123 (k=2, 旗隔两位生效): 713575 组商余全部正确
1232/11: 商位序列 [1, 1, 2] -> Q,R = (112, 0)
多项式综合除法 q_i = p_i + c*q_{i-1} vs np.polydiv: 500 组一致 (除以 x+d 时 c=-d 即变号)`,
    note:`q.append 那行是第 2-4 步的乘加（旗 −d 隔 k 位生效）；按值合成 Q、R 是第 5 步；两个 while 是第 7 步的修正（86% 的除法需要，第 6 步）；最后一段是纯多项式版对 np.polydiv。`
  },
  contrast:[
    {vs:`Nikhilam 除法（除数略小于 10 的幂，如 88、998）`, same:`都是一趟乘加不试商`, diff:`那边旗是正的补数 (10^k − 除数)，这边旗是负的超出量；本质都是综合除法，根的符号不同`, when:`除数 1 开头略大用 Paravartya，9 开头略小用 Nikhilam`},
    {vs:`长除法`, same:`结果相同`, diff:`长除法每位试商、乘、减；综合除法只乘加，且商位可以暂时不是合法数字`, when:`除数首位是 1 且后面位小才划算；除数 87 这种老实长除`},
    {vs:`Antyayoreva vd.antyayoreva`, same:`都在处理"多项式的比"`, diff:`那条是合分比消掉同比部分，不是除法`, when:`分式方程用那条，求商余用这条`}
  ],
  ext:[
    {t:`综合除法是多项式带余除法，与因式定理、Vieta 相连`, go:'al.vieta'},
    {t:`整除判定：余数为 0 ⟺ 除数是因子`, go:'di.divisibility'},
    {t:`同一套乘加换成 x=10 以外的进制`, go:'di.base_convert'}
  ]
},

'vd.sunyam': {
  layers:{
    alg:`A·S = B·S ⟹ (A−B)·S = 0 ⟹ S = 0（当 A ≠ B）。整数环/实数域无零因子，乘积为零必有一因子为零。三种外衣：公因式、常数积相等、分母之和。`,
    geo:`两边各画一个同样的括号方块，方块被 5 倍和 3 倍拉伸后还相等，只可能是方块本身面积为零。`,
    comp:`先识别 Samuccaya（公共块），令它为 0 解一次方程，再代回原式验证——验证一步不能省，因为条件（分子相同、系数和匹配）容易看错。`
  },
  proof:{
    from:`实数域无零因子：xy = 0 ⟹ x=0 或 y=0；分式加法通分`,
    to:`三种形态下 Samuccaya = 0：(1) A·S=B·S, A≠B ⟹ S=0；(2) (x+a)(x+b)=(x+c)(x+d), ab=cd, a+b≠c+d ⟹ x=0；(3) 1/P + 1/Q = 0 ⟹ P+Q=0`,
    steps:[
      [`A·S = B·S 移项：(A−B)·S = 0`, `等式两边减同一个数仍相等，再提公因子 S`],
      [`A ≠ B ⟹ A−B ≠ 0 ⟹ S = 0`, `无零因子：两个数乘积为 0 且一个不为 0，另一个必为 0`],
      [`形态 (2)：展开两边 x² + (a+b)x + ab = x² + (c+d)x + cd`, `二项式乘法展开`],
      [`ab = cd 时约去，得 (a+b−c−d)·x = 0`, `两边同减 x² 和相等的常数项，剩下一次项`],
      [`a+b ≠ c+d ⟹ x = 0，且这是唯一解`, `同第 2 步无零因子；一次方程系数非零时解唯一。若 a+b=c+d 则 0=0 恒成立，退化`],
      [`形态 (3)：1/P + 1/Q = (P+Q)/(PQ)，分子相同（都是 1）才能这样合并`, `通分：分子交叉相加 Q·1 + P·1 = P+Q；若分子是 1 和 2 则分子变成 Q+2P，不再是 P+Q`],
      [`分式为 0 ⟺ 分子为 0 且分母非零 ⟹ P+Q = 0`, `分数 = 0 的充要条件；解出后必须检查 P、Q 都不为 0`]
    ],
    end:`Sunyam Samya Samuccaye 是"无零因子"这条公理换了三件衣服。功夫全在识别公共块 S 并核对使用条件。`
  },
  scratch:{
    lang:'python',
    code:`from fractions import Fraction as F
# 形态 1: A*S = B*S, A != B  ==> S = 0 (老实解一次方程验证)
n = 0
for A in range(-9, 10):
    for B in range(-9, 10):
        if A == B: continue
        for c in range(-9, 10):                    # S = x + c
            x = F((B - A) * c, A - B); assert x == -c; n += 1   # (A-B)x = (B-A)c
print('公因式型 A*S=B*S (A!=B):', n, '组 解恒为 S=0')
# 形态 2: (x+a)(x+b) = (x+c)(x+d), ab = cd ==> x = 0 ; 若还有 a+b=c+d 则退化为恒等式
ok = deg = 0
for a in range(-9, 10):
    for b in range(-9, 10):
        for c in range(-9, 10):
            for d in range(-9, 10):
                if a * b != c * d: continue
                if a + b == c + d: deg += 1; continue
                x = F(c * d - a * b, a + b - c - d); assert x == 0; ok += 1
print('常数积相等型: 唯一解 x=0 共', ok, '组; 一次项也相等时退化为恒等式', deg, '组')
# 形态 3: 1/P + 1/Q = 0 <=> P + Q = 0 (P,Q != 0); 分子不同则不成立
m = 0
for p in range(-9, 10):
    for q in range(-9, 10):
        if p == 0 or q == 0: continue
        assert (F(1, p) + F(1, q) == 0) == (p + q == 0); m += 1
print('分母型 1/P+1/Q=0 <=> P+Q=0:', m, '组通过')
bad = sum(1 for p in range(-9, 10) for q in range(-9, 10) if p and q and p + q == 0 and F(1, p) + F(2, q) != 0)
print('分子换成 1 和 2 时, P+Q=0 的', bad, '组里 1/P+2/Q 全都不为 0 -> 分子相同是必要条件')`,
    out:`公因式型 A*S=B*S (A!=B): 6498 组 解恒为 S=0
常数积相等型: 唯一解 x=0 共 2338 组; 一次项也相等时退化为恒等式 703 组
分母型 1/P+1/Q=0 <=> P+Q=0: 324 组通过
分子换成 1 和 2 时, P+Q=0 的 18 组里 1/P+2/Q 全都不为 0 -> 分子相同是必要条件`,
    note:`第 1 段形态 (1)（第 1-2 步）；第 2 段穷举常数积相等的方程验证解恒为 0 并数出退化组（第 3-5 步）；第 3 段形态 (3)（第 6-7 步）；最后一行是第 6 步"分子相同"条件的反例。`
  },
  contrast:[
    {vs:`两边同除以 (x+1)`, same:`看起来都在"消掉公共块"`, diff:`同除会把 x=−1 这个解丢掉；Sunyam 正是在说公共块等于 0 才是解`, when:`永远移项提公因子，不要除以含未知数的式子`},
    {vs:`Anurupye Sunyamanyat vd.anurupye`, same:`口诀名里都有 Sunyam（零）`, diff:`那条是二元方程组里"另一个变量为 0"，靠系数比例判定`, when:`一元用这条，二元看比例用那条`},
    {vs:`Antyayoreva vd.antyayoreva`, same:`都处理分式方程`, diff:`那条消掉的是"同比的高次部分"，这条消的是"相同的公共块"`, when:`两边比例结构一致用那条，两边有同一块用这条`}
  ],
  ext:[
    {t:`一元方程的一般解法：代换`, go:'al.substitution'},
    {t:`因式分解与零点：p(x)=0 ⟺ 某因子为 0`, go:'al.quadratic'},
    {t:`二元版本：系数成比例 ⟹ 另一变量为零`, go:'vd.anurupye'}
  ]
},

'vd.anurupye': {
  layers:{
    alg:`a₁x + b₁y = c₁，a₂x + b₂y = c₂。若 b₂ = k·b₁ 且 c₂ = k·c₁，第二式减 k 倍第一式：(a₂ − k·a₁)x = 0，只要 a₂ ≠ k·a₁ 就 x = 0，y = c₁/b₁。`,
    geo:`两条直线。y 列和常数列同比意味着两条直线在 y 轴上截距相同（都是 c₁/b₁），交点必在 y 轴上，即 x = 0。`,
    comp:`不消元：先扫两列比值，等于常数列比值的那列变量留下（= c/b），另一个变量直接写 0。同时检查 det = b₁(k·a₁ − a₂) ≠ 0。`
  },
  proof:{
    from:`线性方程组的等价变形（一式加减另一式的倍数不改变解集）；无零因子`,
    to:`b₁:b₂ = c₁:c₂ = 1:k 且 a₂ ≠ k·a₁ ⟹ 唯一解 x = 0，y = c₁/b₁`,
    steps:[
      [`设 b₂ = k·b₁，c₂ = k·c₁`, `"成比例"的定义；k 是公共比值`],
      [`第二式减去第一式的 k 倍：(a₂ − k·a₁)x + (b₂ − k·b₁)y = c₂ − k·c₁`, `方程组的初等变换不改变解集`],
      [`括号里 b₂ − k·b₁ = 0，c₂ − k·c₁ = 0，剩 (a₂ − k·a₁)x = 0`, `第 1 步代入；y 和常数项被同时消光，这就是为什么"看比例"能跳过消元`],
      [`a₂ ≠ k·a₁ ⟹ x = 0`, `无零因子`],
      [`代回第一式：b₁y = c₁ ⟹ y = c₁/b₁`, `x=0 后第一式只剩 y；b₁ ≠ 0 否则该列全零无法成比例`],
      [`几何：两式在 y 轴 (x=0) 上的截距都是 c₁/b₁ = c₂/b₂，交点就在 y 轴上`, `令 x=0 分别解出 y，两值相等说明 (0, c₁/b₁) 同时在两条线上`],
      [`a₂ = k·a₁ 时 det = a₁b₂ − a₂b₁ = b₁(k·a₁ − a₂) = 0，两式整体成比例，无穷多解，口诀失效`, `行列式为零 ⟺ 两方程线性相关；此时第 3 步变成 0 = 0，不能推出 x=0`]
    ],
    end:`一列与常数列同比 ⟹ 消元后另一列的变量只能为零。它是"减 k 倍"这一步消元的心算版，前提是行列式非零。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
from fractions import Fraction as F
ok = sing = 0
for a1 in range(-6, 7):
  for b1 in range(-6, 7):
    for c1 in range(-6, 7):
      for k in range(-4, 5):
        if k == 0 or b1 == 0: continue
        for a2 in range(-6, 7):
          b2, c2 = k * b1, k * c1                      # y 列与常数列同比 1:k
          if a2 == k * a1: sing += 1; continue           # 整行成比例: det=0, 无唯一解
          x = F(c1 - c2 * F(1, k), a1 - a2 * F(1, k))    # 老实消元
          assert x == 0
          y = F(c1, b1)
          assert a2 * x + b2 * y == c2; ok += 1
          assert a1 * b2 - a2 * b1 == b1 * (k * a1 - a2) # det 的因式分解
print('b1:b2 = c1:c2 的方程组', ok, '组: 消元解得 x=0, y=c1/b1 全部通过;', sing, '组因 a2=k*a1 (det=0) 退化跳过')
rng = np.random.default_rng(2); n = 0
for _ in range(1000):
    a1, b1, c1 = rng.integers(-9, 10, 3); k = int(rng.choice([-3, -2, 2, 3])); a2 = int(rng.integers(-9, 10))
    if b1 == 0 or a2 == k * a1: continue
    M = np.array([[a1, b1], [a2, k * b1]], float); v = np.array([c1, k * c1], float)
    s = np.linalg.solve(M, v); assert abs(s[0]) < 1e-9 and abs(s[1] - c1 / b1) < 1e-9; n += 1
print('numpy.linalg.solve 抽样', n, '组一致')
print('例 6x+7y=8, 19x+14y=16: 7:14 = 8:16 -> x=0, y=8/7 =', F(8, 7))`,
    out:`b1:b2 = c1:c2 的方程组 202176 组: 消元解得 x=0, y=c1/b1 全部通过; 8736 组因 a2=k*a1 (det=0) 退化跳过
numpy.linalg.solve 抽样 931 组一致
例 6x+7y=8, 19x+14y=16: 7:14 = 8:16 -> x=0, y=8/7 = 8/7`,
    note:`外层穷举全部成比例系统：x=0、y=c₁/b₁ 与 det = b₁(k·a₁ − a₂) 逐组验证（第 1-5、7 步）；8736 组 det=0 跳过是第 7 步的退化；numpy 抽样交叉确认；最后一行是 drill 例题。`
  },
  contrast:[
    {vs:`Sankalana-Vyavakalanabhyam vd.sankalana`, same:`都是靠系数结构跳过通用消元`, diff:`那条要求系数互换（对称），这条要求一列与常数列成比例`, when:`先扫比例，再看对称，都没有就 Cramer/消元`},
    {vs:`Cramer 法则 la.determinant`, same:`都能解 2×2`, diff:`Cramer 对任何非退化系统都行；这条只在特定比例结构下秒解`, when:`看到比例就用这条，看不到就 Cramer`},
    {vs:`Sunyam Samya Samuccaye vd.sunyam`, same:`结论都是"某个东西 = 0"`, diff:`那条是一元公共块为零，这条是二元方程组某变量为零`, when:`一元/二元区分`}
  ],
  ext:[
    {t:`一般线性方程组：消元与行列式`, go:'al.system_eq'},
    {t:`退化条件 det=0 就是秩不满`, go:'la.rank'},
    {t:`对称系数的另一种捷径`, go:'vd.sankalana'}
  ]
},

'vd.sankalana': {
  layers:{
    alg:`ax + by = p，bx + ay = q。相加 (a+b)(x+y) = p+q，相减 (a−b)(x−y) = p−q。令 s=x+y、d=x−y，两个一元方程各解一次，x=(s+d)/2、y=(s−d)/2。`,
    geo:`系数矩阵 [[a,b],[b,a]] 把 (1,1) 方向拉伸 a+b 倍、把 (1,−1) 方向拉伸 a−b 倍，两个方向互相垂直、互不干扰。相加相减就是把方程投到这两个方向上。`,
    comp:`不做高斯消元：s = (p+q)/(a+b)，d = (p−q)/(a−b)，四次加减两次除法。a=±b 时对应那一步分母为零，退化。`
  },
  proof:{
    from:`方程组的初等变换保持解集；矩阵 M = [[a,b],[b,a]] 的特征向量`,
    to:`和差法得到解耦的两个一元方程，等价于在 (1,1)、(1,−1) 基下对角化 M`,
    steps:[
      [`两式相加：(a+b)x + (a+b)y = p+q，即 (a+b)(x+y) = p+q`, `同类项合并，x 与 y 的系数恰好都变成 a+b——这是系数互换的直接后果`],
      [`两式相减：(a−b)x − (a−b)y = p−q，即 (a−b)(x−y) = p−q`, `同理，相减后 x、y 系数变成 a−b 与 −(a−b)`],
      [`令 s = x+y，d = x−y：s = (p+q)/(a+b)，d = (p−q)/(a−b)`, `两个方程各含一个新未知数，完全解耦；需 a ≠ ±b`],
      [`x = (s+d)/2，y = (s−d)/2`, `s、d 到 x、y 是可逆线性变换，行列式 −2 ≠ 0`],
      [`矩阵观点：M·(1,1)ᵀ = (a+b)(1,1)ᵀ，M·(1,−1)ᵀ = (a−b)(1,−1)ᵀ`, `直接相乘验证；这说明 (1,1)、(1,−1) 是 M 的特征向量，特征值 a+b、a−b`],
      [`(1,1) ⊥ (1,−1)，在这组正交基下 M 是对角阵 diag(a+b, a−b)`, `对称矩阵的不同特征值对应的特征向量正交；相加相减就是把方程组投影到这两个特征方向`],
      [`a = b 时 a−b = 0，相减得 0 = 0，方程组退化（秩 1）；a = −b 时相加退化`, `特征值为零 ⟺ 矩阵奇异；此时那条特征方向上没有信息`]
    ],
    end:`和差法 = 用对称矩阵的特征基 (1,1)、(1,−1) 对角化。系数互换让方程组具有交换 x↔y 的对称性，对称问题用对称坐标就解耦。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
from fractions import Fraction as F
ok = deg = 0
for a in range(-9, 10):
  for b in range(-9, 10):
    if a == b or a == -b: deg += 1; continue          # a+b=0 或 a-b=0: 某一步分母为零
    for p in range(-9, 10):
      for q in range(-9, 10):
        s = F(p + q, a + b); d = F(p - q, a - b)      # x+y, x-y
        x, y = (s + d) / 2, (s - d) / 2
        assert a * x + b * y == p and b * x + a * y == q; ok += 1
print('系数互换型 ax+by=p, bx+ay=q:', ok, '组 和差法解全部回代成立;', deg, '组 a=±b 退化')
rng = np.random.default_rng(3); n = 0
for _ in range(500):                                   # [[a,b],[b,a]] 的特征向量恒为 (1,1),(1,-1)
    a, b = rng.normal(size=2); M = np.array([[a, b], [b, a]])
    assert np.allclose(M @ [1, 1], (a + b) * np.array([1, 1])) and np.allclose(M @ [1, -1], (a - b) * np.array([1, -1]))
    w = np.sort(np.linalg.eigh(M)[0]); assert np.allclose(w, sorted([a + b, a - b])); n += 1
print('特征向量 (1,1),(1,-1) 与 eigh 特征值 {a+b, a-b} 检查', n, '组通过')
a, b, p, q = 45, -23, 113, -91                          # 45x-23y=113, 23x-45y=91 -> 第二式乘 -1
s, d = F(p + q, a + b), F(p - q, a - b)
print('45x-23y=113, 23x-45y=91: x+y =', s, ', x-y =', d, '-> x,y =', (s + d) / 2, (s - d) / 2)`,
    out:`系数互换型 ax+by=p, bx+ay=q: 116964 组 和差法解全部回代成立; 37 组 a=±b 退化
特征向量 (1,1),(1,-1) 与 eigh 特征值 {a+b, a-b} 检查 500 组通过
45x-23y=113, 23x-45y=91: x+y = 1 , x-y = 3 -> x,y = 2 -1`,
    note:`Fraction 段按第 1-4 步和差法解出 x、y 回代（116964 组）；M@(1,1)、M@(1,−1) 与 eigh 对应第 5-6 步；37 组 a=±b 是第 7 步退化；最后一行是 45x−23y=113、23x−45y=91（第二式乘 −1 化成 bx+ay=q）。`
  },
  contrast:[
    {vs:`Anurupye Sunyamanyat vd.anurupye`, same:`都是看系数结构跳过消元`, diff:`那条看一列与常数列的比例，这条看两行系数是否互换`, when:`互换用这条，成比例用那条`},
    {vs:`一般对角化 la.eigen`, same:`同一件事`, diff:`一般矩阵要先算特征值；[[a,b],[b,a]] 的特征向量与 a、b 无关，永远是 (1,±1)`, when:`见到循环/对称结构就直接用 (1,±1) 基`},
    {vs:`"系数相等"的方程组`, same:`长得像`, diff:`要求的是互换（a,b 与 b,a），不是相等；符号也要跟着换`, when:`45,−23 与 23,−45 是互换；45,−23 与 45,−23 是同一条方程`}
  ],
  ext:[
    {t:`一般线性方程组的解法`, go:'al.system_eq'},
    {t:`对称矩阵正交对角化：本节是 2×2 最简版`, go:'la.eigen'},
    {t:`换基：(1,1),(1,−1) 是一组正交基`, go:'la.basis'}
  ]
},

'vd.purana': {
  layers:{
    alg:`ax² + bx + c = 0 → x² + (b/a)x = −c/a → 加 (b/2a)²：(x + b/2a)² = (b² − 4ac)/4a²。三次：x³ + px² + … 令 y = x + p/3 消掉二次项。`,
    geo:`x² + bx 是一个 x×x 的正方形加一条 b×x 的长条；把长条对半劈开贴在正方形两边，缺一个 (b/2)² 的小角。补上小角就是完整的 (x+b/2)² 正方形。`,
    comp:`求根公式就是配方跑一遍的结果；机器解三次先做 y = x + p/3 平移成 depressed cubic 再用 Cardano 或数值法。两边同加是不变量。`
  },
  proof:{
    from:`完全平方 (x+k)² = x² + 2kx + k²；等式两边同加同减仍相等`,
    to:`(1) 任意二次方程配方得求根公式；(2) 三次方程 y = x + p/3 平移后二次项系数为零`,
    steps:[
      [`ax² + bx + c = 0，两边除以 a：x² + (b/a)x + c/a = 0`, `a ≠ 0（否则不是二次）；等式两边同除非零数`],
      [`要让 x² + (b/a)x 成为 (x+k)² 的前两项，需 2k = b/a，即 k = b/2a`, `比较 (x+k)² = x² + 2kx + k² 的一次项系数`],
      [`两边同加 k² = (b/2a)²：(x + b/2a)² = (b/2a)² − c/a = (b² − 4ac)/4a²`, `同加保持等式；右边通分。只在左边加是最常见的错`],
      [`开方：x + b/2a = ±√(b²−4ac)/2a，x = (−b ± √(b²−4ac))/2a`, `u² = C 的解是 u = ±√C（C ≥ 0 时实数）；这就是求根公式的来源`],
      [`三次 x³ + px² + qx + r，令 x = y − p/3`, `平移变量不改变根的个数，只把根整体挪 p/3`],
      [`展开 (y−p/3)³ + p(y−p/3)² 的 y² 项：3·(−p/3)y² + p·y² = −py² + py² = 0`, `二项式展开，两个 y² 项恰好相消；这是"补全"的一般原理——选平移量让次高项归零`],
      [`例：x³+6x²+11x+6，p=6，y = x+2，得 y³ − y = 0 ⟹ y ∈ {0, ±1} ⟹ x ∈ {−2, −1, −3}`, `代入第 6 步的一般式：q − p²/3 = 11 − 12 = −1，r − pq/3 + 2p³/27 = 6 − 22 + 16 = 0`]
    ],
    end:`Puranapuranabhyam = 选一个平移量让次高项消失。二次时给出求根公式，三次时给出 depressed cubic，这是所有代数解法的第一步。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
from fractions import Fraction as F
# 配方恒等式 ax^2+bx+c = a[(x + b/2a)^2 - D/4a^2] 在 81 个有理点上逐点相等
n = 0
for a in range(-6, 7):
  if a == 0: continue
  for b in range(-9, 10):
    for c in range(-9, 10):
      D = b * b - 4 * a * c
      for x in [F(k, 4) for k in range(-40, 41)]:
        assert a * x * x + b * x + c == a * ((x + F(b, 2 * a)) ** 2 - F(D, 4 * a * a))
      n += 1
print('配方恒等式:', n, '个 (a,b,c) x 81 个点 全部相等')
rng = np.random.default_rng(4); m = 0
for _ in range(2000):                               # 开方得到的根代回为 0
    a, b, c = rng.integers(-9, 10, 3)
    if a == 0 or b * b - 4 * a * c < 0: continue
    for sgn in (1, -1):
        x = (-b + sgn * np.sqrt(b * b - 4 * a * c)) / (2 * a)
        assert abs(a * x * x + b * x + c) < 1e-9
    m += 1
print('求根公式 (配方后开方) 代回:', m, '组实根方程通过')
def pmul(u, v):                                   # 多项式乘法 (系数高->低, Fraction)
    out = [F(0)] * (len(u) + len(v) - 1)
    for i, a in enumerate(u):
        for j, b in enumerate(v): out[i + j] += a * b
    return out
def shift(coefs, k):                                # p(y - k) 的系数: sum c_i (y-k)^(n-i)
    n = len(coefs) - 1; out = [F(0)] * (n + 1)
    for i, c in enumerate(coefs):
        term = [F(1)]
        for _ in range(n - i): term = pmul(term, [F(1), -k])
        for j, t in enumerate(term): out[n + 1 - len(term) + j] += c * t
    return out
cnt = 0
for _ in range(500):
    p, q, r = (int(v) for v in rng.integers(-9, 10, 3))
    co = shift([F(1), F(p), F(q), F(r)], F(p, 3))    # x = y - p/3
    assert co[0] == 1 and co[1] == 0; cnt += 1         # y^2 系数精确为 0
    assert co[2] == q - F(p * p, 3) and co[3] == r - F(p * q, 3) + F(2 * p ** 3, 27)
print('三次 x = y - p/3 平移:', cnt, '组 y^2 系数精确为 0, 且 P = q - p^2/3, Q = r - pq/3 + 2p^3/27')
print('x^3+6x^2+11x+6 -> y 系数', [str(v) for v in shift([F(1), F(6), F(11), F(6)], F(2))], '= y^3 - y, y in {0,1,-1} -> x in {-2,-1,-3}')`,
    out:`配方恒等式: 4332 个 (a,b,c) x 81 个点 全部相等
求根公式 (配方后开方) 代回: 1166 组实根方程通过
三次 x = y - p/3 平移: 500 组 y^2 系数精确为 0, 且 P = q - p^2/3, Q = r - pq/3 + 2p^3/27
x^3+6x^2+11x+6 -> y 系数 ['1', '0', '-1', '0'] = y^3 - y, y in {0,1,-1} -> x in {-2,-1,-3}`,
    note:`第 1 段逐点验证配方恒等式（第 1-3 步）；第 2 段开方求根代回（第 4 步）；shift 用 Fraction 精确算 p(y − p/3)，y² 系数恒为 0（第 5-6 步）；最后一行是第 7 步例子。`
  },
  contrast:[
    {vs:`因式分解（十字相乘）`, same:`都解二次方程`, diff:`因式分解要求有理根且靠观察；配方对任何系数都机械可行`, when:`能一眼看出因子就分解，否则配方/公式`},
    {vs:`Calana-Kalanabhyam vd.calana`, same:`都围绕二次方程`, diff:`配方是解方程；Calana 用导数判根的类型`, when:`要根的值用配方，要判重根用导数`},
    {vs:`Lagrange 乘子/最优化 ca.optimization`, same:`配方也能直接读出抛物线顶点 −b/2a`, diff:`最优化处理任意可微函数，配方只处理二次`, when:`二次目标直接配方，不必求导`}
  ],
  ext:[
    {t:`二次方程与判别式`, go:'al.quadratic'},
    {t:`变量代换的一般思路`, go:'al.substitution'},
    {t:`凸二次函数的最小值就在配方的顶点`, go:'op.convex'}
  ]
},

'vd.calana': {
  layers:{
    alg:`p = ax² + bx + c 的根 x* 满足 p′(x*) = 2ax* + b = ±√(b²−4ac)。一般地 p 有重根 r ⟺ (x−r) | p 且 (x−r) | p′ ⟺ gcd(p, p′) ≠ 1。`,
    geo:`抛物线与 x 轴：两根处切线斜率一正一负，大小都是 √Δ；两根靠拢时斜率趋于零，重合那一刻曲线与 x 轴相切——函数值和导数同时为零。`,
    comp:`判重根别用 Δ == 0：浮点下 Δ 几乎不会精确为零，用 |Δ|/b² 相对量级。符号多项式用欧几里得算 gcd(p, p′) 的次数。`
  },
  proof:{
    from:`求导法则；因式定理 p(r)=0 ⟺ (x−r) | p；多项式 gcd 的欧几里得算法`,
    to:`(1) 二次多项式在根处 p′ = ±√Δ；(2) p 有重根 ⟺ deg gcd(p, p′) ≥ 1`,
    steps:[
      [`p = ax² + bx + c，根 x* = (−b ± √Δ)/2a，Δ = b² − 4ac`, `求根公式（见 vd.purana）`],
      [`p′(x) = 2ax + b，代入 x*：2a·(−b ± √Δ)/2a + b = ±√Δ`, `幂函数求导 (xⁿ)′ = nxⁿ⁻¹；代入后 −b 与 +b 抵消`],
      [`所以 Δ = 0 ⟺ p′(x*) = 0 ⟺ 根处切线水平 ⟺ 重根`, `第 2 步等式两边平方即 p′(x*)² = Δ`],
      [`一般多项式：若 p = (x−r)²·q，则 p′ = 2(x−r)q + (x−r)²q′ = (x−r)[2q + (x−r)q′]`, `乘积法则；两项都含 (x−r)，提出来`],
      [`故 (x−r) 同时整除 p 和 p′，gcd(p, p′) 含因子 (x−r)，次数 ≥ 1`, `公共因子的定义；gcd 是所有公共因子的乘积`],
      [`反之若 (x−r) | p 且 (x−r) | p′：p = (x−r)q，p′ = q + (x−r)q′，p′(r) = q(r) = 0，所以 (x−r) | q，p = (x−r)²·(…)`, `因式定理用在 q 上；这给出充要性`],
      [`gcd 可用欧几里得算法有限步算出，不需要先求根`, `多项式带余除法每步降次，终止于余式为零；这就是"用导数看重根"能机械化的原因`]
    ],
    end:`Calana-Kalanabhyam 把微分接进代数：重根 ⟺ p 与 p′ 有公共根 ⟺ gcd(p,p′) 非常数。二次情形退化为 Δ = 0。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
from fractions import Fraction as F
n = rep = 0
for r in range(-12, 13):
    for s in range(-12, 13):
        b, c = -(r + s), r * s                   # p = x^2 + bx + c, p' = 2x + b
        D = b * b - 4 * c
        shared = (2 * r + b == 0) or (2 * s + b == 0)   # p' 在 p 的某根处为 0
        assert shared == (r == s) == (D == 0)
        assert (2 * r + b) ** 2 == D and (2 * s + b) ** 2 == D
        n += 1; rep += (r == s)
print('整根二次式', n, '组: [重根 <=> p 与 p\\' 共根 <=> Delta=0] 全部一致, 重根', rep, '组; p\\'(根)^2 == Delta 全部通过')
rng = np.random.default_rng(5); m = 0
for _ in range(2000):
    a, b, c = rng.integers(-9, 10, 3)
    if a == 0: continue
    for x in np.roots([a, b, c]): assert abs((2 * a * x + b) ** 2 - (b * b - 4 * a * c)) < 1e-6
    m += 1
print('一般 ax^2+bx+c:', m, '组 (2ax+b)^2 == Delta 在两根处成立 (含复根)')
def pdiv(p, d):                                    # 多项式带余除法, 系数高->低, Fraction
    p = p[:]
    while len(p) >= len(d) and any(p):
        f = p[0] / d[0]; p = [pi - f * di for pi, di in zip(p, d + [F(0)] * (len(p) - len(d)))][1:]
    return p
def deriv(p): return [F(len(p) - 1 - i) * v for i, v in enumerate(p[:-1])]
def pgcd(p, q):
    while any(q):
        p, q = q, pdiv(p, q)
        while q and q[0] == 0: q = q[1:]
    return len(p) - 1                              # gcd 的次数
polys = {'x^3-3x+2': [1, 0, -3, 2], 'x^3-x': [1, 0, -1, 0], '(x-1)^3': [1, -3, 3, -1], 'x^2+1': [1, 0, 1]}
for name, co in polys.items():
    co = [F(v) for v in co]; print('deg gcd(p, p\\') of', name, '=', pgcd(co, deriv(co)))
print('x^3-3x+2 的根', np.round(np.roots([1, 0, -3, 2]), 6), '; 浮点陷阱: (x-0.1)^2 = x^2-0.2x+0.01 的 b^2-4ac =', 0.2 ** 2 - 4 * 0.01, '!= 0, 要看相对量级')`,
    out:`整根二次式 625 组: [重根 <=> p 与 p' 共根 <=> Delta=0] 全部一致, 重根 25 组; p'(根)^2 == Delta 全部通过
一般 ax^2+bx+c: 1891 组 (2ax+b)^2 == Delta 在两根处成立 (含复根)
deg gcd(p, p') of x^3-3x+2 = 1
deg gcd(p, p') of x^3-x = 0
deg gcd(p, p') of (x-1)^3 = 2
deg gcd(p, p') of x^2+1 = 0
x^3-3x+2 的根 [-2.  1.  1.] ; 浮点陷阱: (x-0.1)^2 = x^2-0.2x+0.01 的 b^2-4ac = 6.938893903907228e-18 != 0, 要看相对量级`,
    note:`第 1 段整根二次式验证三个等价命题与 p′(根)² = Δ（第 1-3 步）；pgcd 用 Fraction 做欧几里得（第 7 步），四个例子对应第 4-6 步判据；最后一行是浮点下 Δ 不为精确零的陷阱。`
  },
  contrast:[
    {vs:`Puranapuranabhyam vd.purana`, same:`都处理二次方程`, diff:`配方求根的值；这条判根的类型（重不重、实不实）`, when:`先用 Δ 判型，再决定是否值得求根`},
    {vs:`数值求根 np.roots / cx.poly_roots`, same:`都关心根`, diff:`数值方法给近似根，重根附近条件数极差（根对系数扰动敏感度 ∝ 1/√ε）`, when:`怀疑重根时先算 gcd 或看 |Δ|/b²，不要信数值根的虚部`},
    {vs:`导数求极值 ca.derivative_slope`, same:`都令 p′ = 0`, diff:`极值点是 p′ 的根；重根是 p 与 p′ 的公共根`, when:`只有当极值点恰好落在 x 轴上才是重根`}
  ],
  ext:[
    {t:`判别式与根的分布`, go:'al.quadratic'},
    {t:`Δ < 0 时根离开实轴成为共轭复根`, go:'cx.poly_roots'},
    {t:`导数即切线斜率`, go:'ca.derivative_slope'}
  ]
},

'vd.ekanyunena': {
  layers:{
    alg:`n × (10^k − 1) = n·10^k − n = (n−1)·10^k + (10^k − n)。左段 n−1，右段 n 的 k 位补数。它是 Nikhilam 在 b = 1（乘数 = B−1）时的特例。`,
    geo:`n 个 10^k 排成一行再拿走一个 n：从最后那个 10^k 里扣，剩 10^k − n 正好是右段；前面完整的 n−1 个 10^k 是左段。`,
    comp:`不做乘法：left = n−1，right = 10^k − n 左补 0 到 k 位，拼接。位数不够（124×9）用变形 [n − (前缀+1)] : (10 − 末位)。`
  },
  proof:{
    from:`分配律；十进制 10^k·L + R（0 ≤ R < 10^k）写法唯一`,
    to:`n ≤ 10^k 时 n(10^k − 1) = (n−1) | (10^k − n)，右段恰占 k 位；并给出 n 位数多于 k 时的变形`,
    steps:[
      [`n(10^k − 1) = n·10^k − n`, `分配律`],
      [`n·10^k = (n−1)·10^k + 10^k`, `从 n 个 10^k 里拆出一个`],
      [`所以 = (n−1)·10^k + (10^k − n)`, `第 1-2 步合并；这一步是"借一个 10^k 来减 n"`],
      [`1 ≤ n ≤ 10^k 时 0 ≤ 10^k − n < 10^k，右段恰好 k 位（不足补 0），左段就是 n−1`, `位值制唯一写法；n 的位数 ≤ k 保证右段不出界`],
      [`10^k − n 就是 n 的"全从 9 减、末位从 10 减"补数`, `10^k − 1 − n 是各位从 9 减，再加 1 就是末位从 10 减：Nikhilam 的口诀名`],
      [`Nikhilam 视角：B = 10^k，a = B − n，b = 1，(B−a)(B−b) = B(B−a−b) + ab = B(n−1) + (B−n)`, `直接代入 Nikhilam 恒等式，与第 3 步逐字相同`],
      [`n 位数多于 k（124×9）：n = 10P + u，9n = 10n − n = 10(n − P − 1) + (10 − u)`, `10n − n = 10n − 10P − u = 10(n−P) − u = 10(n−P−1) + (10−u)；右段一位、左段是 n 减(前缀+1)`]
    ],
    end:`乘 9…9 = 乘 10^k 再减自己，拆出一个 10^k 来做减法就得到"左 n−1、右补数"。它是 Nikhilam 的 b=1 特例。`
  },
  scratch:{
    lang:'python',
    code:`# Ekanyunena: n*(10^k-1) = (n-1)*10^k + (10^k - n),  1 <= n <= 10^k
tot = pad = 0
for k in (1, 2, 3, 4):
    B = 10 ** k
    for n in range(1, B + 1):
        assert n * (B - 1) == (n - 1) * B + (B - n) and 0 <= B - n < B; tot += 1
        pad += (B - n < B // 10)                   # 右段不足 k 位要补 0
print('n <= 10^k, k=1..4:', tot, '组 左段 n-1 | 右段 10^k-n 全部通过; 其中右段需左补 0 的', pad, '组')
print('878x9999: 左段', 877, '右段', str(10000 - 878).zfill(4), '->', 877 * 10000 + (10000 - 878), '==', 878 * 9999)
n0 = 0
for k in (1, 2, 3):                                # Nikhilam 视角: a = B-n, b = 1
    B = 10 ** k
    for n in range(1, B + 1):
        a, b = B - n, 1
        assert B * (B - a - b) + a * b == n * (B - 1); n0 += 1
print('Nikhilam 代入 b=1:', n0, '组 B(B-a-1) + a == n(B-1) 逐组相同')
ok = carry = 0
for n in range(10, 100000):                        # n 位数多于 k: n*9 = [n-(前缀+1)] : (10-末位)
    pre, last = divmod(n, 10)
    left, right = n - (pre + 1), 10 - last
    assert left * 10 + right == n * 9; ok += 1
    carry += (right == 10)                          # 末位 0 -> 右段写 10 要进位
print('n*9 变形式 n=10..99999:', ok, '组通过; 其中末位为 0 的', carry, '组右段=10 需进位')
m = 0
for n in range(100, 100000):
    pre, last = divmod(n, 100)
    assert (n - (pre + 1)) * 100 + (100 - last) == n * 99; m += 1
print('n*99 变形式 n=100..99999:', m, '组通过 (右段占 2 位)')`,
    out:`n <= 10^k, k=1..4: 11110 组 左段 n-1 | 右段 10^k-n 全部通过; 其中右段需左补 0 的 1111 组
878x9999: 左段 877 右段 9122 -> 8779122 == 8779122
Nikhilam 代入 b=1: 1110 组 B(B-a-1) + a == n(B-1) 逐组相同
n*9 变形式 n=10..99999: 99990 组通过; 其中末位为 0 的 9999 组右段=10 需进位
n*99 变形式 n=100..99999: 99900 组通过 (右段占 2 位)`,
    note:`第 1 段对 k=1..4 穷举 n ≤ 10^k 验证恒等式并数出需补 0 的组（第 3-4 步）；878×9999 是右段补 0；Nikhilam 段是第 6 步逐组相同；后两段是第 7 步 n 位数多于 k 的变形。`
  },
  contrast:[
    {vs:`Nikhilam vd.nikhilam`, same:`同一恒等式`, diff:`这条固定 b=1，所以右段 ab = a 不用乘`, when:`乘数是 9、99、999 用这条；乘数是 97 这种用 Nikhilam`},
    {vs:`直接乘 10 再减`, same:`数值上一样 n·10^k − n`, diff:`口诀把减法拆成"减 1"和"取补数"两个不借位的动作`, when:`心算用口诀，写程序直接 n*10**k − n`},
    {vs:`百分比减法 ns.percent`, same:`×99 相当于 −1%`, diff:`×0.99 是乘因子，×99 是整数乘法再看位置`, when:`估算用百分比，精确用口诀`}
  ],
  ext:[
    {t:`一般基准的补数乘法`, go:'vd.nikhilam'},
    {t:`换工作基后同样有 B−1 特例`, go:'vd.anurupyena'},
    {t:`补数与进制：10^k − n 就是 k 位十进制补码`, go:'di.base_convert'}
  ]
},

'vd.anurupyena': {
  layers:{
    alg:`Nikhilam 恒等式 xy = B(x+y−B) + (B−x)(B−y) 对任何 B 成立。取 B 靠近 x、y（50、200、500）让偏差小；代价是 B·L 要真乘：B=50 时 L·50 = (L//2)·100 + (L%2)·50。`,
    geo:`同一张"大正方形切两条补一角"的图，只是正方形边长换成 50 或 200。切条变窄了，右下角那块 ab 变小了，代价是大方块的面积不再是"左移几位"能读出来的。`,
    comp:`选 B = 10^k / m 或 10^k · m；left = x+y−B，right = (B−x)(B−y)；result = left*B + right。写成 100 形式时 left 乘 B/100 再合并进位。`
  },
  proof:{
    from:`Nikhilam 恒等式 (B−a)(B−b) = B(B−a−b) + ab 对任意 B 成立（vd.nikhilam 第 7 步）`,
    to:`工作基 B = 10^k/m 时 xy = (L·B) + ab，且 L·B = (L//m)·10^k + (L mod m)·(10^k/m)；偏差 |a|,|b| 缩小到 |x−B|`,
    steps:[
      [`xy = B·L + ab，其中 L = x + y − B，a = B−x，b = B−y`, `Nikhilam 恒等式，推导未用 B 是 10 的幂`],
      [`若 B = 100，|a|、|b| 是 x、y 到 100 的距离；46×43 时 a=54、b=57，ab = 3078 比原题还难`, `偏差乘积的难度 ∝ 偏差大小；偏差超过两位就失去心算意义`],
      [`改 B = 50：a=4、b=7，ab=28，L = 46+43−50 = 39`, `第 1 步对 B=50 照样成立；偏差缩到一位`],
      [`B·L = 39×50 = 1950，不是"左移两位"的 3900`, `B 不是 10 的幂时 B·L 是真正的乘法；这就是"按比例"——50 = 100/2，所以 39×50 = 39×100/2`],
      [`写成 100 形式：L·50 = (L//2)·100 + (L%2)·50，L 为奇数时把 50 带到右段`, `带余除法 L = 2(L//2) + (L%2)；47×43 → L=40 → 20|21 = 2021；L=39 → 19|(50+28) = 1978`],
      [`B = 200 时 L·200 = 2L·100；B = 500 时 L·500 = 5L·100`, `同理，倍数 m 乘进左段`],
      [`右段 ab 的位宽仍按 10^k 留（B=50 时留两位）`, `合成时 (L//m)·10^k + [(L%m)·B + ab]，方括号里的量按 10^k 进位；ab 本身没有"位宽"，位宽来自 10^k`]
    ],
    end:`Anurupyena 是 Nikhilam 恒等式在 B ≠ 10^k 时的读法：偏差变小，代价是左段要真乘 B。忘了乘 B 而当成左移，是唯一的错法。`
  },
  scratch:{
    lang:'python',
    code:`import itertools
# Anurupyena: xy = B(x+y-B) + (B-x)(B-y) 对任意工作基 B 成立
tot = 0
for B in (20, 25, 30, 40, 50, 60, 200, 250, 500, 5000):
    lo, hi = (B // 2, 3 * B // 2 + 1) if B <= 60 else (B - 30, B + 31)
    for x in range(lo, hi):
        for y in range(lo, hi):
            a, b = B - x, B - y
            assert x * y == B * (x - b) + a * b; tot += 1
print('工作基 B in {20,25,30,40,50,60,200,250,500,5000}, 小基取 [B/2, 3B/2], 大基取 B±30:', tot, '组通过')
n = 0
for m in (2, 4, 5):                                # 写成 100 形式: B = 100/m, L*B = (L//m)*100 + (L%m)*B
    B = 100 // m
    for x in range(B - 20, B + 21):
        for y in range(B - 20, B + 21):
            L, right = x + y - B, (B - x) * (B - y)
            assert x * y == (L // m) * 100 + (L % m) * B + right; n += 1
print('B=100/m (m=2,4,5): 左段除 m 进百位, 余数乘 B 并入右段:', n, '组通过')
for x, y in ((46, 43), (47, 43)):
    B = 50; L, right = x + y - B, (B - x) * (B - y)
    print('%dx%d B=50: L=%d ab=%d -> %d|%d = %d (误当左移会得 %d)' % (x, y, L, right, L // 2, (L % 2) * 50 + right, L * 50 + right, L * 100 + right))
worse = total = 0
for x, y in itertools.product(range(20, 81), repeat=2):
    d100 = abs(100 - x) + abs(100 - y)
    dbest = min(abs(B - x) + abs(B - y) for B in (20, 25, 30, 40, 50, 60, 70, 80))
    total += 1; worse += (d100 > dbest)
print('20..80 两位数对', total, '组: 换工作基后总偏差严格更小的', worse, '组')`,
    out:`工作基 B in {20,25,30,40,50,60,200,250,500,5000}, 小基取 [B/2, 3B/2], 大基取 B±30: 24965 组通过
B=100/m (m=2,4,5): 左段除 m 进百位, 余数乘 B 并入右段: 5043 组通过
46x43 B=50: L=39 ab=28 -> 19|78 = 1978 (误当左移会得 3928)
47x43 B=50: L=40 ab=21 -> 20|21 = 2021 (误当左移会得 4021)
20..80 两位数对 3721 组: 换工作基后总偏差严格更小的 3721 组`,
    note:`第 1 段对十个工作基穷举（第 1 步）；第 2 段是第 5 步"100 形式"的 L//m 进百位、余数乘 B；46×43 与 47×43 两行展示第 4-5 步及"误当左移"的错；最后一行说明第 2-3 步换基总能缩小偏差。`
  },
  contrast:[
    {vs:`Nikhilam vd.nikhilam`, same:`同一恒等式`, diff:`B = 10^k 时 B·L 免费；B 任意时 B·L 要乘`, when:`两数离 10 的幂近用 Nikhilam，离 50/200/500 近用这条`},
    {vs:`Antyayor Dasakepi vd.antyayor_dasake`, same:`46×43 这类数两条都可能想到`, diff:`Antyayor 要末位和为 10（46×44 才行）；这条不要求`, when:`先看末位和是不是 10，是就用 Antyayor，不是就换基`},
    {vs:`估算 ns.estimate`, same:`都先找一个"附近的整数"`, diff:`估算舍掉偏差项，这条精确补回 ab`, when:`要量级用估算，要精确值用这条`}
  ],
  ext:[
    {t:`母恒等式与 B = 10^k 情形`, go:'vd.nikhilam'},
    {t:`平方版：(B+d)² = B(B+2d) + d²`, go:'vd.yavadunam'},
    {t:`乘数为 B−1 的特例`, go:'vd.ekanyunena'}
  ]
},

'vd.adyamadyena': {
  layers:{
    alg:`(ax+b)(cx+d) = ac·x² + (ad+bc)·x + bd，x 是进制（12 in/ft，60 min/h）。首×首落 x² 位，尾×尾落常数位，交叉项落 x 位，单位是"混合"的，按 x 折算。`,
    geo:`一块 (a ft b in) × (c ft d in) 的板：左上 a×c 平方尺大块，右下 b×d 平方寸小块，两条 a×d 和 b×c 的"尺·寸"长条——长条的面积单位既不是平方尺也不是平方寸，要切成 12 寸一段折算。`,
    comp:`把混合单位数转成 (高位, 低位) 二元组，做卷积得三列 [ac, ad+bc, bd]，再从右往左按进制进位：inch 满 144 进 sq ft，cross 满 12 进 sq ft、余数乘 12 归 sq in。`
  },
  proof:{
    from:`Urdhva 卷积 (ax+b)(cx+d) = acx² + (ad+bc)x + bd 对任意 x 成立（vd.urdhva 第 6 步）；单位换算 1 ft = 12 in`,
    to:`混合进制乘法 = 多项式在 x=进制 处求值；交叉项必须显式折算，且 ft² : ft·in : in² = x² : x : 1`,
    steps:[
      [`a ft b in = (12a + b) in = ax + b，x = 12`, `单位换算就是位值制，只是"位"的进制是 12 不是 10`],
      [`面积 = (ax+b)(cx+d) in² = ac·x² + (ad+bc)·x + bd in²`, `Urdhva 多项式乘法，x 保持符号不代值`],
      [`x² in² = 144 in² = 1 ft²，所以 ac·x² 项就是 ac 平方尺`, `1 ft² = (12 in)² = 144 in²；这项单位干净`],
      [`bd 项单位是 in²，干净`, `两个寸数相乘`],
      [`(ad+bc)·x in² = (ad+bc)·12 in²，即 (ad+bc) 个"ft·in"，1 ft·in = 12 in² = 1/12 ft²`, `交叉项的单位是 x¹，既不是 x² 也不是 x⁰，必须折算；直接当 in² 会少乘 12`],
      [`折算：(ad+bc) ft·in = ((ad+bc)//12) ft² + ((ad+bc)%12)·12 in²`, `带余除法把 x 位向 x² 位进位，余数向 x⁰ 位下放`],
      [`最后 in² 若 ≥ 144 再向 ft² 进位`, `同一条进位规则再用一次，保证 0 ≤ in² < 144，写法唯一`]
    ],
    end:`Adyamadyena 就是 Urdhva 在 x=12（或 60）处求值：首乘首、尾乘尾都干净，中间的交叉项是混合单位，靠进制折算归位。`
  },
  scratch:{
    lang:'python',
    code:`# Adyamadyena: (a ft b in)(c ft d in) = ac x^2 + (ad+bc) x + bd, x=12; 交叉项按 12 折算
def area(a, b, c, d):
    ff, cross, ii = a * c, a * d + b * c, b * d
    ff += cross // 12; ii += (cross % 12) * 12      # ft*in -> 整平方尺 + 余数*12 平方寸
    ff += ii // 144; ii %= 144                        # 平方寸满 144 进平方尺
    return ff, ii
n = 0
for a in range(0, 10):
  for b in range(0, 12):
    for c in range(0, 10):
      for d in range(0, 12):
        ff, ii = area(a, b, c, d)
        tot = (12 * a + b) * (12 * c + d)
        assert ff * 144 + ii == tot and (ff, ii) == divmod(tot, 144); n += 1
print('英尺英寸乘法 0..9 ft x 0..11 in 全组合:', n, '组 折算后与 divmod(总平方寸,144) 全部一致')
a, b, c, d = 6, 4, 5, 8
print('6ft4in x 5ft8in: 首x首 %d, 交叉 %d ft.in, 尾x尾 %d in^2 -> %s (sq ft, sq in); 误把交叉 %d 当平方寸会少 %d in^2' %
      (a * c, a * d + b * c, b * d, area(a, b, c, d), a * d + b * c, (a * d + b * c) * 11))
for x in (60, 10):                                  # 同一段代码换进制: 时:分, 普通十进制
    m = 0
    for a in range(0, 6):
      for b in range(0, x):
        for c in range(0, 6):
          for d in range(0, x):
            hi, cr, lo = a * c, a * d + b * c, b * d
            hi += cr // x; lo += (cr % x) * x; hi += lo // (x * x); lo %= x * x
            assert hi * x * x + lo == (x * a + b) * (x * c + d); m += 1
    print('进制 x=%d:' % x, m, '组通过 (同一卷积, 只换进位基)')`,
    out:`英尺英寸乘法 0..9 ft x 0..11 in 全组合: 14400 组 折算后与 divmod(总平方寸,144) 全部一致
6ft4in x 5ft8in: 首x首 30, 交叉 68 ft.in, 尾x尾 32 in^2 -> (35, 128) (sq ft, sq in); 误把交叉 68 当平方寸会少 748 in^2
进制 x=60: 129600 组通过 (同一卷积, 只换进位基)
进制 x=10: 3600 组通过 (同一卷积, 只换进位基)`,
    note:`area 里 cross//12 与 %12*12 是第 5-6 步的折算，ii//144 是第 7 步；14400 组与 divmod 一致验证第 2 步；6ft4in 那行展开第 3-5 步并给出"误当平方寸"少的量；最后换 x=60、10。`
  },
  contrast:[
    {vs:`Urdhva vd.urdhva`, same:`同一个卷积`, diff:`Urdhva 代 x=10；这条代 x=12/60，且进位规则随进制变`, when:`带单位就用这条的说法`},
    {vs:`先全部化成寸再乘`, same:`结果相同`, diff:`化寸要做两次 12 倍乘法再一次大乘法；口诀只做三次小乘法加折算`, when:`心算用口诀，程序里化成最小单位最不容易错`},
    {vs:`进制转换 di.base_convert`, same:`都是位值制`, diff:`进制转换是同一个数换写法；这里是两个混合进制数相乘`, when:`理解"ft·in 是 x¹ 位"就是进制思维`}
  ],
  ext:[
    {t:`母运算：数字/多项式卷积`, go:'vd.urdhva'},
    {t:`混合进制就是非 10 进制的位值制`, go:'di.base_convert'},
    {t:`多项式在某点求值`, go:'al.polynomial'}
  ]
},

'vd.yavadunam': {
  layers:{
    alg:`(B+d)² = B² + 2Bd + d² = B(B+2d) + d² = B·[(B+d)+d] + d²。d 可正可负同一式；B=10^k 时右段 d² 占 k 位，不足补 0，超出进位。`,
    geo:`边长 B+d 的正方形 = 边长 B 的正方形 + 两条 B×d 长条 + 一个 d×d 小角。两条长条拼到大正方形旁边成 B×(B+2d) 的矩形，小角 d² 单独放右边。`,
    comp:`d = n − B（带符号），left = n + d，right = d*d 按 k 位对齐。它就是 Nikhilam 在 x=y 时的代码，一个函数两用。`
  },
  proof:{
    from:`完全平方公式；十进制 10^k·L + R 写法唯一；Nikhilam 恒等式`,
    to:`(B+d)² = B(B+2d) + d² 对任意实数 d 成立；B=10^k 时左段 = 数±偏差、右段 = 偏差平方占 k 位`,
    steps:[
      [`(B+d)² = B² + 2Bd + d²`, `完全平方，d 的符号不限`],
      [`B² + 2Bd = B(B + 2d)`, `提公因子 B`],
      [`B + 2d = (B+d) + d：左段是"数再加一次偏差"`, `B+d 就是原数 n，所以左段 = n + d；d<0 时就是"数减偏差"，同一式`],
      [`B = 10^k 且 0 ≤ d² < 10^k 时，10^k·(n+d) + d² 的十进制就是 (n+d) 拼 k 位的 d²`, `位值制唯一写法；|d| < 10^(k/2) 保证不进位`],
      [`d² ≥ 10^k 时（如 88²，d=−12，d²=144）把 d²//10^k 加到左段`, `带余除法进位；76 + 1 | 44 = 7744`],
      [`d² < 10^(k−1) 时左补 0（994²，B=1000，d²=36 → 036）`, `右段必须占满 k 位，否则 10^k·L + R 的写法就错了位`],
      [`与 Nikhilam 的关系：x=y=B+d 时 (B−a)(B−b)，a=b=−d，B(B−a−b)+ab = B(B+2d)+d²`, `直接代入，逐项相同：Yavadunam 是 Nikhilam 的对角线`]
    ],
    end:`Yavadunam 是 (B+d)² 的重排：B(B+2d) + d²。正负偏差一个式子，位宽由 B 定，进位和补零都是位值制的要求。`
  },
  scratch:{
    lang:'python',
    code:`# Yavadunam: (B+d)^2 = B(B+2d) + d^2 = B[(B+d)+d] + d^2, d 正负同一式
def yav(n, B):
    d = n - B
    left, right = n + d, d * d
    while right >= B: left += 1; right -= B      # d^2 超出 k 位槽要进位
    return left * B + right
tot = carry = pad = neg = pos = 0
for B in (10, 100, 1000, 10000):
    for n in range(B // 2, 2 * B):
        assert yav(n, B) == n * n; tot += 1
        d = n - B; carry += (d * d >= B); pad += (0 < d * d < B // 10); neg += (d < 0); pos += (d > 0)
print('B=10..10000, n in [B/2, 2B):', tot, '组全部通过; 低于基准', neg, '组, 高于基准', pos, '组, 同一公式')
print('  其中 d^2 超出右段位宽需进位', carry, '组; d^2 不足位宽需补 0', pad, '组; 其余直接拼接')
for n, B in ((96, 100), (104, 100), (88, 100), (994, 1000), (1012, 1000)):
    d = n - B; k = len(str(B)) - 1
    print('%d^2 (B=%d): d=%+d 左段 %d 右段 %s -> %d == %d' % (n, B, d, n + d, str(d * d).zfill(k), yav(n, B), n * n))
m = 0
for B in (100, 1000):                              # 与 Nikhilam 对角线 x=y 逐点一致
    for n in range(B // 2, 2 * B):
        a = B - n
        assert B * (B - a - a) + a * a == yav(n, B); m += 1
print('Nikhilam 取 x=y:', m, '组 B(B-2a)+a^2 与 Yavadunam 逐点相同')`,
    out:`B=10..10000, n in [B/2, 2B): 16665 组全部通过; 低于基准 5555 组, 高于基准 11106 组, 同一公式
  其中 d^2 超出右段位宽需进位 16377 组; d^2 不足位宽需补 0 86 组; 其余直接拼接
96^2 (B=100): d=-4 左段 92 右段 16 -> 9216 == 9216
104^2 (B=100): d=+4 左段 108 右段 16 -> 10816 == 10816
88^2 (B=100): d=-12 左段 76 右段 144 -> 7744 == 7744
994^2 (B=1000): d=-6 左段 988 右段 036 -> 988036 == 988036
1012^2 (B=1000): d=+12 左段 1024 右段 144 -> 1024144 == 1024144
Nikhilam 取 x=y: 1650 组 B(B-2a)+a^2 与 Yavadunam 逐点相同`,
    note:`yav 的 left=n+d 是第 3 步、while 是第 5 步进位；第 1 段对四个 B 穷举 d 正负同一式（第 1-4 步）并统计进位/补 0 组数（第 5-6 步）；五个例子中 994² 的 036 是补零、88² 的 144 是进位；最后一段是第 7 步与 Nikhilam 逐点一致。`
  },
  contrast:[
    {vs:`Nikhilam vd.nikhilam`, same:`同一恒等式`, diff:`Yavadunam 是 x=y 的对角线特例，只需一个偏差`, when:`平方用这条的说法，两个不同数用 Nikhilam`},
    {vs:`Ekadhikena vd.ekadhikena`, same:`都算平方、都拼段`, diff:`那条看末位 5，这条看离 10 的幂近`, when:`95² 两条都行（Ekadhikena 9×10|25，Yavadunam 90|25），答案一样`},
    {vs:`(a+b)² 展开 ns.square_trick`, same:`就是完全平方`, diff:`口诀固定 a = 10^k 让 2ab 项变成左移`, when:`离 10 的幂远时回到一般的 (a+b)²`}
  ],
  ext:[
    {t:`母恒等式`, go:'vd.nikhilam'},
    {t:`工作基不是 10 的幂时的平方`, go:'vd.anurupyena'},
    {t:`平方速算总览`, go:'ns.square_trick'}
  ]
},

'vd.antyayor_dasake': {
  layers:{
    alg:`(10a+b)(10a+c)，b+c=10：= 100a² + 10a(b+c) + bc = 100a² + 100a + bc = 100·a(a+1) + bc。一般化：(Ma+b)(Ma+c)，b+c=M=10^k，= M²·a(a+1) + bc，右段占 2k 位。`,
    geo:`两个数共享前缀 a，末位一个是 b 一个是 10−b。矩形 (10a+b)×(10a+10−b) 补成 (10a)×(10a+10) 的大矩形再加回 b(10−b) 的小块。`,
    comp:`检查两个条件：prefix 相同、末 k 位之和 = 10^k。left = P*(P+1)，right = b*c 补 0 到 2k 位。任一条件不满足直接不能用。`
  },
  proof:{
    from:`分配律；十进制 M²·L + R（0 ≤ R < M²）写法唯一，M = 10^k`,
    to:`前缀相同、末 k 位之和为 M 时乘积 = a(a+1) | bc，右段占 2k 位；且缺任一条件式子不成立`,
    steps:[
      [`(Ma+b)(Ma+c) = M²a² + Ma(b+c) + bc`, `分配律`],
      [`b + c = M ⟹ Ma(b+c) = M²a`, `代入条件；这一步是全部的关键：交叉项凑出 M²`],
      [`M²a² + M²a = M²·a(a+1)`, `提 M²`],
      [`bc ≤ (M/2)² = M²/4 < M²，所以右段 bc 占 2k 位不进位`, `AM-GM：b+c 固定时 bc 在 b=c=M/2 最大；M²/4 < M² 保证不越界`],
      [`所以乘积 = a(a+1) 拼 2k 位的 bc（不足补 0）`, `位值制唯一写法；98×92 → 90|16，292×208 → 6|0736`],
      [`若 b+c = M±1，交叉项是 M²a ± Ma，多出的 ±Ma 不能并入 a(a+1)`, `第 2 步失效；穷举可见成立个数为 0`],
      [`若前缀不同（a 与 a+1），(Ma+b)(M(a+1)+c) 多出 M²a + Mc 项，也不成立`, `同理；两个条件缺一不可。k=1、b=c=5 即 Ekadhikena`]
    ],
    end:`末位互补 + 前缀相同 ⟹ 交叉项恰好凑出 M²，乘积 = 前缀×后继 拼 末位积。Ekadhikena 是它 b=c=5 的特例。`
  },
  scratch:{
    lang:'python',
    code:`# Antyayor Dasakepi: (10a+b)(10a+c), b+c=10 -> 100 a(a+1) + bc ; 不满足条件时偏差 10a(b+c-10)
ok = 0
for a in range(1, 1000):
    for b in range(0, 11):
        c = 10 - b
        assert (10 * a + b) * (10 * a + c) == 100 * a * (a + 1) + b * c and b * c < 100; ok += 1
print('前缀 a=1..999, 末位 b+c=10:', ok, '组通过, 右段 bc<100 永不进位')
fail = 0
for a in range(1, 100):
    for b in range(0, 10):
        for c in range(0, 10):
            gap = (10 * a + b) * (10 * a + c) - (100 * a * (a + 1) + b * c)
            assert gap == 10 * a * (b + c - 10); fail += (gap != 0)
print('b+c != 10 时公式失效', fail, '组, 偏差恒等于 10a(b+c-10) (b+c=9 或 11 各差 10a)')
bad = 0
for a in range(1, 100):                             # 前缀差 1 时也不成立
    for b in range(1, 10):
        c = 10 - b
        bad += ((10 * a + b) * (10 * (a + 1) + c) != 100 * a * (a + 1) + b * c)
print('前缀 a 与 a+1 不同时:', bad, '/ 891 组不成立, 两个条件缺一不可')
for k in (1, 2, 3):                                 # 一般式 M=10^k: 末 k 位和为 M, 右段占 2k 位
    M = 10 ** k; m = 0; mx = 0
    for a in range(1, 60):
        for b in range(0, M + 1):
            c = M - b
            assert (M * a + b) * (M * a + c) == M * M * a * (a + 1) + b * c; m += 1; mx = max(mx, b * c)
    print('k=%d: %d 组通过, 右段最大 bc=%d < M^2=%d' % (k, m, mx, M * M))
print('292x208: 2*3 | 92*8 =', 6, '|', str(92 * 8).zfill(4), '->', 60000 + 92 * 8, '==', 292 * 208)`,
    out:`前缀 a=1..999, 末位 b+c=10: 10989 组通过, 右段 bc<100 永不进位
b+c != 10 时公式失效 9009 组, 偏差恒等于 10a(b+c-10) (b+c=9 或 11 各差 10a)
前缀 a 与 a+1 不同时: 891 / 891 组不成立, 两个条件缺一不可
k=1: 649 组通过, 右段最大 bc=25 < M^2=100
k=2: 5959 组通过, 右段最大 bc=2500 < M^2=10000
k=3: 59059 组通过, 右段最大 bc=250000 < M^2=1000000
292x208: 2*3 | 92*8 = 6 | 0736 -> 60736 == 60736`,
    note:`第 1 段穷举 a≤999 验证 a(a+1)|bc 且 bc<100（第 1-5 步）；第 2、3 段分别是第 6、7 步两个条件缺一不可；k=1,2,3 段是一般式并给出右段上界 < M²（第 4 步）；最后一行是 2k=4 位补零。`
  },
  contrast:[
    {vs:`Ekadhikena vd.ekadhikena`, same:`同一恒等式`, diff:`那条 b=c=5 是平方；这条 b≠c 是乘法`, when:`同一数平方用那条，末位互补的两数用这条`},
    {vs:`Nikhilam vd.nikhilam`, same:`47×43 两条都能算`, diff:`Nikhilam 偏差 53、57 太大不实用；这条直接 4×5|21`, when:`末位互补优先用这条`},
    {vs:`Yavadunam vd.yavadunam`, same:`都是拼段`, diff:`这条不要求靠近 10 的幂，只要求末位互补`, when:`62×68 用这条，96×96 用 Yavadunam`}
  ],
  ext:[
    {t:`特例 b=c=5`, go:'vd.ekadhikena'},
    {t:`一般乘法退路`, go:'vd.urdhva'},
    {t:`AM-GM：b+c 固定时 bc 的上界`, go:'al.inequality_amgm'}
  ]
},

'vd.antyayoreva': {
  layers:{
    alg:`合分比：若 N₁/D₁ = r 且 (N₁+N₂)/(D₁+D₂) = r，则 N₂/D₂ = r。用在 (x²+2x+7)/(x²+3x+5) = (x+2)/(x+3)：高次部分 x(x+2)/x(x+3) 已是右边的比，所以余下 7/5 也等于 (x+2)/(x+3)。`,
    geo:`一个分式是两段拼成的：大段（高次部分）和小段（常数项）。若整体的比等于大段的比，小段的比也必须相同——否则拼起来的比会被拉偏。`,
    comp:`先验证"高次部分同比"（分子分母分别除以 x 后与右边一致），再解一次方程 5(x+2) = 7(x+3)，最后代回原式并检查分母非零。`
  },
  proof:{
    from:`分式相等 ⟺ 交叉相乘相等（分母非零）`,
    to:`(N₁+N₂)/(D₁+D₂) = N₁/D₁ ⟹ N₂/D₂ = N₁/D₁；应用得原方程解 x = −11/2`,
    steps:[
      [`设 (N₁+N₂)/(D₁+D₂) = N₁/D₁，交叉相乘：(N₁+N₂)D₁ = N₁(D₁+D₂)`, `分母非零时分式相等等价于交叉积相等`],
      [`展开：N₁D₁ + N₂D₁ = N₁D₁ + N₁D₂ ⟹ N₂D₁ = N₁D₂`, `两边同减 N₁D₁`],
      [`所以 N₂/D₂ = N₁/D₁（D₂ ≠ 0）`, `再交叉相乘回去；这就是合分比：等比的部分可以整体抽走`],
      [`原题：x²+2x+7 = x(x+2) + 7，x²+3x+5 = x(x+3) + 5`, `拆成"高次部分 + 常数"；N₁ = x(x+2)，D₁ = x(x+3)，N₂ = 7，D₂ = 5`],
      [`N₁/D₁ = x(x+2)/x(x+3) = (x+2)/(x+3) 恰是右边`, `约去 x（x ≠ 0；x=0 代入原式 7/5 ≠ 2/3 不是解，可放心约）`],
      [`由第 3 步：N₂/D₂ = 7/5 = (x+2)/(x+3) ⟹ 5x + 10 = 7x + 21 ⟹ x = −11/2`, `一次方程`],
      [`代回：x = −11/2 时分母 x²+3x+5 = 121/4 − 33/2 + 5 = 75/4 ≠ 0，x+3 = −5/2 ≠ 0，等式两边都是 7/5`, `合分比只是必要条件的推导链，必须回代确认分母非零`]
    ],
    end:`Antyayoreva = 合分比定理：高次部分若已同比，只看"最后两项"的比即可。前提是高次部分真的同比，且解不使分母为零。`
  },
  scratch:{
    lang:'python',
    code:`from fractions import Fraction as F
# 合分比: (N1+N2)/(D1+D2) = N1/D1  ==>  N2/D2 = N1/D1  (D1, D2, D1+D2 != 0)
n = hit = 0
for N1 in range(-6, 7):
  for D1 in range(-6, 7):
    for D2 in range(-6, 7):
      if 0 in (D1, D2, D1 + D2): continue
      for N2 in range(-6, 7):
        if F(N1 + N2, D1 + D2) == F(N1, D1): assert F(N2, D2) == F(N1, D1); hit += 1
        n += 1
print('合分比引理 检查', n, '组四元组, 前提成立的', hit, '组结论全部成立, 无反例')
# (x^2+px+r)/(x^2+qx+s) = (x+p)/(x+q)  ==>  r/s = (x+p)/(x+q)  ==>  x = (qr - ps)/(s - r)
ok = deg = 0
for p in range(-5, 6):
  for q in range(-5, 6):
    if p == q: continue
    for r in range(-5, 6):
      for s in range(-5, 6):
        if s == 0 or s == r: deg += 1; continue
        x = F(q * r - p * s, s - r)
        if x + q == 0 or x * x + q * x + s == 0: deg += 1; continue
        assert (x * x + p * x + r) / (x * x + q * x + s) == (x + p) / (x + q); ok += 1
print('残渣方程 r/s=(x+p)/(x+q):', ok, '组回代原方程成立;', deg, '组因 s=r 或分母为 0 排除')
x = F(3 * 7 - 2 * 5, 5 - 7)
print('例 (x^2+2x+7)/(x^2+3x+5) = (x+2)/(x+3): x =', x, ', 回代两边 =', (x * x + 2 * x + 7) / (x * x + 3 * x + 5), (x + 2) / (x + 3), ', 分母 =', x * x + 3 * x + 5)
x0 = F(-11, 2)                                   # 高次部分不同比时捷径失效
print('若左边改成 (x^2+2x+7)/(2x^2+3x+5): 代 x=-11/2 两边 =', (x0 * x0 + 2 * x0 + 7) / (2 * x0 * x0 + 3 * x0 + 5), (x0 + 2) / (x0 + 3), '-> 不等, 捷径失效')`,
    out:`合分比引理 检查 22308 组四元组, 前提成立的 676 组结论全部成立, 无反例
残渣方程 r/s=(x+p)/(x+q): 10788 组回代原方程成立; 2522 组因 s=r 或分母为 0 排除
例 (x^2+2x+7)/(x^2+3x+5) = (x+2)/(x+3): x = -11/2 , 回代两边 = 7/5 7/5 , 分母 = 75/4
若左边改成 (x^2+2x+7)/(2x^2+3x+5): 代 x=-11/2 两边 = 15/28 7/5 -> 不等, 捷径失效`,
    note:`第 1 段穷举四元组验证合分比蕴含（第 1-3 步）；第 2 段对 r/s = (x+p)/(x+q) 的一般解 x=(qr−ps)/(s−r) 回代原方程（第 4-6 步）；例题行含分母检查（第 7 步）；最后一行是第 5 步"高次同比"不满足时捷径失效。`
  },
  contrast:[
    {vs:`Sunyam Samya Samuccaye vd.sunyam`, same:`都是"抽掉一部分只看剩下"`, diff:`Sunyam 抽的是相同的公共块并令其为 0；这条抽的是同比的部分，剩下部分保持同一个比`, when:`两边有同一块用 Sunyam；两边结构成比例用这条`},
    {vs:`通分交叉相乘硬解`, same:`结果相同`, diff:`硬解得三次方程再约分；合分比直接降到一次`, when:`看出高次同比就用这条，看不出就硬解`},
    {vs:`Paravartya vd.paravartya`, same:`都涉及多项式的比`, diff:`那条求商余，这条解方程`, when:`要商余用 Paravartya`}
  ],
  ext:[
    {t:`分式方程的代换技巧`, go:'al.substitution'},
    {t:`多项式的拆分：高次部分 + 余项`, go:'al.polynomial'},
    {t:`一元公共块为零的姊妹口诀`, go:'vd.sunyam'}
  ]
},

'vd.lopana': {
  layers:{
    alg:`E = (p₁x+q₁y+r₁z)(p₂x+q₂y+r₂z)。令 z=0 得 (p₁x+q₁y)(p₂x+q₂y)，令 y=0 得 (p₁x+r₁z)(p₂x+r₂z)。两次分解共享 x 系数 p₁、p₂，据此对齐并拼出完整因式；yz 项 q₁r₂+q₂r₁ 用来校验。`,
    geo:`一个三维物体（两个平面的乘积）拍两张投影照：z=0 平面上一张、y=0 平面上一张。每张照片各显示两条直线，按 x 方向的斜率配对，就能还原两个平面。`,
    comp:`对 z=0 的二元二次式枚举整数分解 (p₁,p₂,q₁,q₂)，对 y=0 同样枚举 (P₁,P₂,r₁,r₂)，要求 (P₁,P₂) = (p₁,p₂)，再检查 e = q₁r₂ + q₂r₁。校验不过就换下一组或宣告不可分解。`
  },
  proof:{
    from:`多项式恒等式代入特殊值后仍成立；二元二次式的整数分解可枚举`,
    to:`若 E 可分解为两个线性式之积，则 z=0、y=0 两次分解的因式按 x 系数对齐即可拼出原因式；yz 系数是必要校验`,
    steps:[
      [`设 E = (p₁x+q₁y+r₁z)(p₂x+q₂y+r₂z)`, `假设可分解；目标是求出六个系数`],
      [`令 z=0：E|_{z=0} = (p₁x+q₁y)(p₂x+q₂y)`, `恒等式对所有 (x,y,z) 成立，特别对 z=0 成立；代入后每个因式丢掉 z 项`],
      [`令 y=0：E|_{y=0} = (p₁x+r₁z)(p₂x+r₂z)`, `同理；这两张"照片"各给出因式的一部分系数`],
      [`两张照片里 x 的系数都是 p₁、p₂，把 q 和 r 按同一个 p 归到同一个因式`, `第 2、3 步的因式共享 p₁、p₂；若 p₁ ≠ p₂，对齐方式唯一；p₁ = p₂ 时要靠第 6 步校验挑`],
      [`拼出 (p₁x+q₁y+r₁z)(p₂x+q₂y+r₂z)`, `六个系数全部到手`],
      [`展开后 yz 项系数应等于 q₁r₂ + q₂r₁，与 E 的 yz 系数比较`, `yz 项在两张照片里都被消掉了（z=0 或 y=0 都杀死 yz），它是唯一没被"拍到"的信息，所以必须用它校验`],
      [`若 E 本不可分解，第 2、3 步可能各自可分解（如 x²+y²+z²+xy+yz+zx 的 z=0 部分 x²+xy+y² 在整数上不可分，算法直接失败），或拼出来但第 6 步不过`, `算法本身不检查可分解性，回代是唯一的保险`]
    ],
    end:`Lopana-Sthapanabhyam = 降维拍照再合成：消掉一个变量得到因式的投影，按共享系数对齐拼回。没被拍到的 yz 项是必做的校验。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np, itertools
rng = np.random.default_rng(6)
def factors2(A, Bc, C, R=5):
    # 二元二次式 A u^2 + Bc uv + C v^2 的全部整数分解 (p1 u + q1 v)(p2 u + q2 v), p1,p2 > 0
    return [(p1, q1, p2, q2) for p1, q1, p2, q2 in itertools.product(range(-R, R + 1), repeat=4)
            if p1 > 0 and p2 > 0 and p1 * p2 == A and p1 * q2 + p2 * q1 == Bc and q1 * q2 == C]
def expand(L1, L2):
    (p1, q1, r1), (p2, q2, r2) = L1, L2
    return (p1 * p2, q1 * q2, r1 * r2, p1 * q2 + p2 * q1, q1 * r2 + q2 * r1, p1 * r2 + p2 * r1)
def lopana(co):
    a, b, c, d, e, f = co                     # x^2, y^2, z^2, xy, yz, zx
    for p1, q1, p2, q2 in factors2(a, d, b):          # 照片 1: z=0
        for P1, r1, P2, r2 in factors2(a, f, c):      # 照片 2: y=0
            for (Pa, ra), (Pb, rb) in (((P1, r1), (P2, r2)), ((P2, r2), (P1, r1))):
                if (Pa, Pb) != (p1, p2): continue     # 按 x 系数对齐
                if q1 * rb + q2 * ra != e: continue   # yz 系数: 两张照片都没拍到, 必须回代校验
                return (p1, q1, ra), (p2, q2, rb)
    return None
ok = 0
for _ in range(300):
    L1 = (int(rng.integers(1, 5)),) + tuple(int(v) for v in rng.integers(-4, 5, 2))
    L2 = (int(rng.integers(1, 5)),) + tuple(int(v) for v in rng.integers(-4, 5, 2))
    co = expand(L1, L2); res = lopana(co)
    assert res is not None and expand(*res) == co; ok += 1
print('随机可分解三元二次式', ok, '组: 消 z / 消 y 两次拍照 + 按 x 系数对齐 + yz 校验 -> 复原全部通过')
bad = caught = 0
for _ in range(300):
    L1 = tuple(int(v) for v in rng.integers(1, 5, 3)); L2 = tuple(int(v) for v in rng.integers(1, 5, 3))
    co = list(expand(L1, L2)); co[4] += 1                    # 只改坏 yz 系数
    res = lopana(tuple(co)); bad += 1; caught += (res is None)
    if res is not None: assert expand(*res) == tuple(co)     # 没拦下的: 改坏后恰好是另一个可分解式
print('故意改坏 yz 系数', bad, '组: 两张照片完全不变, 只有 yz 校验能发现 ->', caught, '组被拦下, 其余', bad - caught, '组改后恰好仍可分解 (回代验证)')
print('例 3x^2+2y^2+6z^2+7xy+7yz+11zx =', lopana((3, 2, 6, 7, 7, 11)))
print('不可分解 x^2+y^2+z^2+xy+yz+zx: z=0 照片 x^2+xy+y^2 的整数分解 =', factors2(1, 1, 1), '->', lopana((1, 1, 1, 1, 1, 1)))`,
    out:`随机可分解三元二次式 300 组: 消 z / 消 y 两次拍照 + 按 x 系数对齐 + yz 校验 -> 复原全部通过
故意改坏 yz 系数 300 组: 两张照片完全不变, 只有 yz 校验能发现 -> 298 组被拦下, 其余 2 组改后恰好仍可分解 (回代验证)
例 3x^2+2y^2+6z^2+7xy+7yz+11zx = ((1, 2, 3), (3, 1, 2))
不可分解 x^2+y^2+z^2+xy+yz+zx: z=0 照片 x^2+xy+y^2 的整数分解 = [] -> None`,
    note:`factors2 是第 2、3 步的二元分解枚举；(Pa,Pb)==(p1,p2) 是第 4 步对齐；q1*rb+q2*ra==e 是第 6 步校验；300 组随机乘积全部复原；改坏 yz 段说明校验是唯一保险；最后一行是第 7 步不可分解。`
  },
  contrast:[
    {vs:`二元二次式十字相乘`, same:`z=0 那一步就是它`, diff:`三元多了一个变量和一个"没拍到"的交叉项，必须两次分解 + 校验`, when:`二元直接十字相乘，三元用 Lopana`},
    {vs:`矩阵秩判定 la.rank`, same:`可分解 ⟺ 二次型矩阵秩 ≤ 2 且判别条件`, diff:`秩判定给"能不能分"，Lopana 给"分成什么"`, when:`先看能不能分（秩），再用 Lopana 分`},
    {vs:`Adyamadyena vd.adyamadyena`, same:`都是"首乘首、尾乘尾"的配对思路`, diff:`那条是数值乘法的正向展开，这条是因式分解的逆向还原`, when:`展开用 Adyamadyena/Urdhva，还原用 Lopana`}
  ],
  ext:[
    {t:`多项式因式分解总览`, go:'al.polynomial'},
    {t:`二次型与矩阵秩：可分解的判据`, go:'la.rank'},
    {t:`正向展开的对偶口诀`, go:'vd.urdhva'}
  ]
}

});
