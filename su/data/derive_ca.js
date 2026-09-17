/* 数理宇宙 v3 · 推导层 · ca 微积分大陆（13 节点）
   旁挂文件，不改动 v1/v2。直通深度学习，推导写到最硬。
   scratch 全部用 python3 + numpy 2.3 实际跑过，out 是真实输出。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'ca.derivative_slope': {
  layers:{
    alg:`f'(a) 是唯一一个数 L，使 f(a+h) = f(a) + L·h + r(h)，且 r(h)/h → 0。导数不是「差商的极限」这么一句话，而是「最佳线性近似的系数」。`,
    geo:`把曲线在 (a, f(a)) 处无限放大，弯的变直，只剩一条过该点的直线；那条直线是所有过该点直线里贴得最紧的（误差比 h 本身小一个量级）。`,
    comp:`机器不做极限：算中心差商 [f(a+h)-f(a-h)]/2h，h 取 1e-4 到 1e-6，看数值稳定到哪里。gradient check 就是拿这个数去核对反向传播的解析梯度。`
  },
  proof:{
    from:`极限定义 f'(a) = lim_{h→0} [f(a+h)-f(a)]/h 存在`,
    to:`f(a+h) = f(a) + f'(a)h + o(h)，且这样的线性系数唯一；反之亦然`,
    steps:[
      [`令 r(h) = f(a+h) - f(a) - f'(a)h`, `这是「用切线预测」和「真实值」的差，把问题变成研究 r 有多小`],
      [`除以 h：r(h)/h = [f(a+h)-f(a)]/h - f'(a)`, `h ≠ 0 时可以除；右边第一项正是差商`],
      [`取 h→0：差商 → f'(a)，所以 r(h)/h → 0，即 r(h) = o(h)`, `这就是极限定义的直接翻译：余项比 h 更快趋零`],
      [`反向：若存在 L 使 f(a+h) = f(a) + Lh + o(h)，则差商 = L + o(h)/h → L`, `o(h)/h → 0 是 o(h) 的定义，所以 L 必为差商极限`],
      [`唯一性：若 L1、L2 都行，相减得 (L1-L2)h = o(h)，除以 h 得 L1-L2 = o(1) → 0`, `两个 o(h) 的差还是 o(h)；一个常数若是 o(1) 只能是 0`],
      [`推论：可导 ⇒ 连续。f(a+h)-f(a) = f'(a)h + o(h) → 0`, `右边两项都随 h 趋零，所以函数值连续变化；反之不成立（|x| 在 0）`],
      [`中心差分误差：对 f(a±h) 各做二阶泰勒，相减得 [f(a+h)-f(a-h)]/2h = f'(a) + O(h²)`, `h² 项在相减时抵消，所以中心差分比单侧差分（O(h)）准一个量级`]
    ],
    end:`导数 = 让余项成为 o(h) 的唯一线性系数。这句话是链式法则、泰勒、梯度、反向传播的共同源头：所有非线性问题都先被换成「局部线性 + 可忽略余项」再处理。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 验证：f(x+h) = f(x) + f'(x)h + r(h)，余项 r(h)/h -> 0
f  = lambda x: np.sin(x)*np.exp(x)
df = lambda x: np.exp(x)*(np.sin(x)+np.cos(x))   # 解析导数
x0 = 0.7
for h in [1e-1,1e-2,1e-3,1e-4]:
    r = f(x0+h) - f(x0) - df(x0)*h              # 线性近似的余项
    print(f"h={h:.0e}  r={r:+.3e}  r/h={r/h:+.3e}")
# 中心差分逼近导数，误差 O(h^2)
for h in [1e-2,1e-3,1e-4]:
    fd = (f(x0+h)-f(x0-h))/(2*h)
    print(f"h={h:.0e}  central={fd:.8f}  err={abs(fd-df(x0)):.1e}")`,
    out:`h=1e-01  r=+1.546e-02  r/h=+1.546e-01
h=1e-02  r=+1.541e-04  r/h=+1.541e-02
h=1e-03  r=+1.540e-06  r/h=+1.540e-03
h=1e-04  r=+1.540e-08  r/h=+1.540e-04
h=1e-02  central=2.83750623  err=8.1e-06
h=1e-03  central=2.83749822  err=8.1e-08
h=1e-04  central=2.83749814  err=8.1e-10`,
    note:`第一段打印 r/h 随 h 线性变小，对应推导第 3 步（余项是 o(h)）；第二段中心差分误差随 h² 缩小，对应第 7 步。`
  },
  contrast:[
    {vs:`微分 dy = f'(x)dx`, same:`同一个线性系数 f'(x)`, diff:`导数是一个数（斜率），微分是一个线性映射（把 dx 送到 dy）；多元时导数是雅可比矩阵，微分是它作用于增量向量`, when:`只关心变化率说导数；要写「增量 ≈ 多少」、要换元、要推广到多元，用微分的写法`},
    {vs:`差分 [f(x+h)-f(x)]/h（有限 h）`, same:`形式一样，都是差商`, diff:`导数是 h→0 的极限，差分是固定 h 的数；离散采样数据只有差分`, when:`有解析式求导；只有每小时一个荧光读数，只能算差分，谈导数是在加光滑假设`},
    {vs:`变化量 Δf`, same:`都描述「f 变了」`, diff:`导数是率（每单位 x 变多少），Δf 是量；单位差一个 x 的单位`, when:`写单位。f'(2)=10 mg/L/h 是率；Δf=10 mg/L 是量`},
    {vs:`次梯度（ReLU 在 0 处）`, same:`都能喂给优化器`, diff:`导数要求左右极限相等；次梯度只要求一个支撑斜率的集合，[0,1] 里随便选`, when:`光滑函数用导数；ReLU、|x|、hinge loss 用次梯度，实现里取一个值即可`}
  ],
  ext:[
    {t:`多元：导数变成雅可比矩阵，「最佳线性近似」这句话一字不改`, go:'ca.gradient'},
    {t:`反向传播就是把每一层的局部线性近似串起来`, go:'dl.backprop'},
    {t:`自动微分把「线性近似系数」按计算图逐节点传播`, go:'pt.autograd'}
  ]
},

'ca.integral_area': {
  layers:{
    alg:`∫_a^b f = lim Σ f(x_i)Δx。微积分基本定理说：定义 A(x)=∫_a^x f，则 A'(x)=f(x)；于是 ∫_a^b f = F(b)-F(a)，F 是任一原函数。`,
    geo:`曲线下方切竖条，条越细越贴。面积函数 A(x) 往右推一小段 h，多出来的那一小条高度 ≈ f(x)、宽 h，所以 A 的变化率就是 f。`,
    comp:`机器只会加：黎曼和/梯形/辛普森就是「取样 × 权重 × 步长」再求和。中点法误差 O(h²)，N 翻 10 倍误差降 100 倍。`
  },
  proof:{
    from:`f 在 [a,b] 连续；定义面积函数 A(x) = ∫_a^x f(t)dt`,
    to:`A'(x) = f(x)（FTC 第一部分），从而 ∫_a^b f = F(b) - F(a)（第二部分）`,
    steps:[
      [`写增量：A(x+h) - A(x) = ∫_x^{x+h} f(t)dt`, `积分对区间可加：[a,x+h] 的面积 = [a,x] 的面积 + [x,x+h] 的面积`],
      [`在 [x,x+h] 上 f 连续，取最小值 m_h、最大值 M_h，则 m_h·h ≤ ∫_x^{x+h} f ≤ M_h·h`, `一段面积夹在「最矮矩形」和「最高矩形」之间，这是积分单调性`],
      [`除以 h：m_h ≤ [A(x+h)-A(x)]/h ≤ M_h`, `h>0 时不等号方向不变`],
      [`h→0 时区间缩到点 x，连续性给 m_h → f(x) 且 M_h → f(x)`, `连续的定义：邻域内的值都趋于 f(x)，最大最小值也不例外`],
      [`夹逼得 lim [A(x+h)-A(x)]/h = f(x)，即 A'(x) = f(x)`, `两边同时挤到 f(x)，中间只能是 f(x)；这就是 FTC 第一部分`],
      [`设 F 是任一原函数（F'=f），则 (A-F)' = 0，故 A - F = C 为常数`, `导数恒零的函数在区间上是常数（中值定理推论）`],
      [`代 x=a：A(a)=0，得 C = -F(a)；代 x=b：∫_a^b f = A(b) = F(b) - F(a)`, `常数由端点定死，第二部分随之成立`]
    ],
    end:`面积的导数是被积函数，因为「往右推一小条」的面积就是高 × 宽 = f(x)·h。这把「无穷多个小条相加」换成「找一个原函数再相减」，积分从此不用逐条加。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 验证 FTC：A(x)=∫_0^x f，A'(x)=f(x)；黎曼和随 N 收敛到 F(b)-F(a)
f = lambda t: t**2*np.exp(-t)
F = lambda t: -np.exp(-t)*(t**2+2*t+2)        # 原函数
a,b = 0.0,3.0
for N in [10,100,1000,10000]:
    x = a + (np.arange(N)+0.5)*(b-a)/N        # 中点黎曼和
    S = np.sum(f(x))*(b-a)/N
    print(f"N={N:<6} riemann={S:.8f}  err={abs(S-(F(b)-F(a))):.1e}")
# A'(x) = f(x)：用 N=20000 的黎曼和算 A(x±h)，差商 vs f(x)
def A(x,N=20000):
    t = (np.arange(N)+0.5)*x/N; return np.sum(f(t))*x/N
x0,h = 1.5,1e-3
print(f"A'(1.5)~{(A(x0+h)-A(x0-h))/(2*h):.6f}  f(1.5)={f(x0):.6f}")`,
    out:`N=10     riemann=1.15424001  err=6.2e-04
N=100    riemann=1.15362544  err=5.6e-06
N=1000   riemann=1.15361989  err=5.6e-08
N=10000  riemann=1.15361984  err=5.6e-10
A'(1.5)~0.502043  f(1.5)=0.502043`,
    note:`第一段黎曼和收敛到 F(b)-F(a)，验证第 7 步；最后一行用数值面积函数做差商得到 f(1.5)，正是第 5 步 A'=f。`
  },
  contrast:[
    {vs:`不定积分 ∫f dx`, same:`都要找原函数`, diff:`不定积分是一族函数（差常数），定积分是一个数；连接两者的是 FTC`, when:`求「变化累计多少」用定积分；要一个可代任意上限的表达式（ODE 求解、分布函数）用不定积分`},
    {vs:`求和 Σ`, same:`都是把很多小量加起来`, diff:`Σ 是有限项、离散步长；∫ 是步长趋零的极限，出来的是面积不是计数`, when:`离散数据直接 Σ（AUC 用梯形法）；有解析式用 ∫`},
    {vs:`平均值 (1/(b-a))∫_a^b f`, same:`都用同一个积分`, diff:`积分是总量（面积），平均值除以宽度成了高度`, when:`药时曲线 AUC 是总暴露（积分）；平均血药浓度是 AUC/T`},
    {vs:`期望 E[X] = ∫ x p(x)dx`, same:`形式就是一个定积分`, diff:`期望是「值 × 权重」的积分，权重 p 积分为 1；普通积分没有归一化`, when:`权重是概率密度时叫期望`}
  ],
  ext:[
    {t:`被积函数换成 x·p(x) 就是期望，换成生存函数就是平均存活时间`, go:'pr.expectation'},
    {t:`ROC 下面积 AUC 就是一个定积分`, go:'ml.metrics'},
    {t:`换元与分部：两条求导法则倒着用`, go:'ca.integration_tricks'}
  ]
},

'ca.chain_rule': {
  layers:{
    alg:`(f∘g)'(x) = f'(g(x))·g'(x)。多元：J_{f∘g} = J_f · J_g，雅可比矩阵相乘。反向传播 = 把这串矩阵乘法从输出端往回算。`,
    geo:`两级放大镜：g 在 x 附近把长度放大 g'(x) 倍，f 在 g(x) 附近再放大 f'(g(x)) 倍；串联总放大 = 相乘。`,
    comp:`前向存每层输入，反向每层只做「上游梯度 × 本层局部导数」。一层不管别的层是什么，这就是 autograd 的模块化。`
  },
  proof:{
    from:`g 在 x 可导、f 在 u=g(x) 可导；即 g(x+h) = g(x) + g'(x)h + o(h)，f(u+k) = f(u) + f'(u)k + o(k)`,
    to:`(f∘g)'(x) = f'(g(x))·g'(x)`,
    steps:[
      [`令 k(h) = g(x+h) - g(x) = g'(x)h + o(h)`, `这是 g 的线性近似，k 就是「内层的增量」`],
      [`则 f(g(x+h)) = f(u + k) = f(u) + f'(u)k + o(k)`, `直接代入 f 的线性近似，k 是任意小增量`],
      [`注意 k = O(h)：|k| ≤ (|g'(x)|+1)|h| 对小 h 成立`, `k 与 h 同阶，所以 o(k) 也是 o(h)；这一步是常见「教科书证明」出错的地方（k 可能为 0，不能除以 k，用 o 记号绕开）`],
      [`代入 k：f(g(x+h)) = f(u) + f'(u)[g'(x)h + o(h)] + o(h) = f(u) + f'(u)g'(x)h + o(h)`, `f'(u)·o(h) 仍是 o(h)，两项 o(h) 合并`],
      [`由导数的唯一性（最佳线性系数唯一），(f∘g)'(x) = f'(u)g'(x)`, `上一步已经把复合函数写成「线性 + o(h)」的形式，系数就是导数`],
      [`多元推广：g:R^n→R^m，f:R^m→R^p，同样的三行得 J_{f∘g}(x) = J_f(g(x))·J_g(x)`, `线性近似换成矩阵乘向量，o(|h|) 的合并规则不变`],
      [`标量损失 L 时 J_L 是 1×n 行向量；从左往右乘（输出端先乘）每一步都是「行向量 × 矩阵」`, `行向量乘矩阵是 O(mn)，矩阵乘矩阵是 O(mnp)；从输出端开始乘最便宜，这就是反向传播存在的理由`]
    ],
    end:`复合的导数是局部线性放大倍数的乘积。反向传播不是新算法，是多元链式法则加一个乘法顺序选择：标量损失时从输出端往回乘最省。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 链式法则 = 反向传播：手写两层网络，解析梯度 vs 数值梯度
rng=np.random.default_rng(0)
X=rng.normal(size=(5,3)); y=rng.normal(size=(5,1))
W1=rng.normal(size=(3,4)); W2=rng.normal(size=(4,1))
def loss(W1,W2):
    h=np.tanh(X@W1); out=h@W2; return 0.5*np.mean((out-y)**2)
# 前向存中间量
z=X@W1; h=np.tanh(z); out=h@W2; L=0.5*np.mean((out-y)**2)
# 反向：每层只做「上游梯度 × 本层局部导数」
dout=(out-y)/len(y)            # dL/dout
dW2=h.T@dout                   # out=h W2 -> dL/dW2 = h^T dout
dh=dout@W2.T                   # dL/dh
dz=dh*(1-h**2)                 # tanh' = 1-tanh^2
dW1=X.T@dz                     # z=X W1
# 数值梯度：逐元素中心差分
def numgrad(W,which):
    G=np.zeros_like(W); e=1e-5
    for i in np.ndindex(W.shape):
        Wp=W.copy(); Wp[i]+=e; Wm=W.copy(); Wm[i]-=e
        G[i]=((loss(Wp,W2) if which==1 else loss(W1,Wp))-(loss(Wm,W2) if which==1 else loss(W1,Wm)))/(2*e)
    return G
print(f"loss={L:.6f}")
print(f"max|dW1-num|={np.abs(dW1-numgrad(W1,1)).max():.2e}")
print(f"max|dW2-num|={np.abs(dW2-numgrad(W2,2)).max():.2e}")
print("dW2 =",np.round(dW2.ravel(),5))`,
    out:`loss=0.459531
max|dW1-num|=3.90e-11
max|dW2-num|=6.64e-12
dW2 = [-0.23464  0.60094 -0.5879   0.14843]`,
    note:`dW2=h.T@dout、dz=dh*(1-h**2) 每行都是「上游梯度 × 本层局部导数」，对应第 6-7 步；与数值梯度差 1e-11 是第 5 步唯一性的数值证据。`
  },
  contrast:[
    {vs:`乘积法则 (uv)'`, same:`都是两个函数组合后求导`, diff:`乘积是并联（两个都吃 x），链式是串联（一个吃另一个的输出）；并联相加，串联相乘`, when:`看结构：f(g(x)) 用链式，f(x)·g(x) 用乘积；网络里 skip 连接是并联，层堆叠是串联`},
    {vs:`前向模式自动微分`, same:`都是链式法则，都精确`, diff:`前向从输入端乘（列向量×矩阵），一次得一个输入方向的导数；反向从输出端乘，一次得所有参数的梯度`, when:`输入少输出多用前向；参数多损失一个（深度学习）用反向`},
    {vs:`全导数 vs 偏导`, same:`都出现在多元链式里`, diff:`偏导只动一个变量；全导数 dL/dt 把 t 经所有路径的影响加总`, when:`变量经多条路径影响输出时，每条路径的链式乘积要相加`}
  ],
  ext:[
    {t:`多元链式 + 从输出端乘 = 反向传播`, go:'dl.backprop'},
    {t:`框架把每个算子的局部导数存成 backward 函数`, go:'pt.autograd'},
    {t:`链式倒过来就是换元积分`, go:'ca.integration_tricks'}
  ]
},

'ca.taylor': {
  layers:{
    alg:`f(a+h) = Σ_{k=0}^n f^{(k)}(a)h^k/k! + R_n，拉格朗日余项 R_n = f^{(n+1)}(ξ)h^{n+1}/(n+1)!，ξ 在 a 与 a+h 之间。`,
    geo:`在一点上逐级贴合：直线贴斜率，抛物线贴弯度，三次贴弯度的变化……n 阶多项式在该点的前 n 个导数与 f 完全一致。`,
    comp:`截断到 n 阶，误差像 h^{n+1} 缩：h 减半误差降 2^{n+1} 倍。优化器用到二阶：梯度下降 = 一阶泰勒，牛顿法 = 二阶泰勒的极小点。`
  },
  proof:{
    from:`f 在 [a, a+h] 上 n+1 阶可导；柯西中值定理：g、φ 可导且 φ' ≠ 0 时存在 ξ 使 g'(ξ)/φ'(ξ) = [g(b)-g(a)]/[φ(b)-φ(a)]`,
    to:`f(a+h) = P_n(h) + f^{(n+1)}(ξ)h^{n+1}/(n+1)!，P_n 是 n 阶泰勒多项式`,
    steps:[
      [`固定 x=a+h。定义 G(t) = f(x) - Σ_{k=0}^n f^{(k)}(t)(x-t)^k/k!，把展开点 t 当变量`, `技巧：让展开点动，端点值一目了然。G(x)=0（所有 (x-t)^k 为 0），G(a) = f(x)-P_n(h) 正是余项`],
      [`对 t 求导：相邻项望远镜式抵消，只剩 G'(t) = -f^{(n+1)}(t)(x-t)^n/n!`, `第 k 项求导得两项：f^{(k+1)}(x-t)^k/k! 和 -f^{(k)}(x-t)^{k-1}/(k-1)!，后者恰与第 k-1 项的前者相消`],
      [`取 φ(t) = (x-t)^{n+1}，φ'(t) = -(n+1)(x-t)^n，对 G 和 φ 用柯西中值定理`, `φ' 在 (a,x) 内不为零，满足柯西中值定理条件`],
      [`得 [G(x)-G(a)]/[φ(x)-φ(a)] = G'(ξ)/φ'(ξ) = f^{(n+1)}(ξ)(x-ξ)^n/n! ÷ [(n+1)(x-ξ)^n]`, `分子分母的 (x-ξ)^n 约掉，这是选 φ 为 n+1 次幂的原因`],
      [`左边 = [0 - R_n]/[0 - h^{n+1}] = R_n/h^{n+1}，右边 = f^{(n+1)}(ξ)/(n+1)!`, `代入端点值 G(x)=0、G(a)=R_n、φ(x)=0、φ(a)=h^{n+1}`],
      [`整理：R_n = f^{(n+1)}(ξ)h^{n+1}/(n+1)!`, `这就是拉格朗日余项；n=0 时退化为拉格朗日中值定理`],
      [`推论：若 |f^{(n+1)}| ≤ M，则 |R_n| ≤ M|h|^{n+1}/(n+1)!，误差 O(h^{n+1})`, `ξ 未知但被 M 控制住，这就是可以「截断」的许可证`]
    ],
    end:`泰勒定理说：一点的 n 个导数决定附近函数值到 O(h^{n+1}) 精度，误差由下一阶导数封顶。梯度下降信一阶、牛顿法信二阶，信的就是这个余项。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np, math
# 验证泰勒定理：截断误差随阶数下降，且 ≤ 拉格朗日余项上界
x = 0.5                      # 展开点 a=0，f=e^x
true = math.exp(x)
for n in range(0,7):
    approx = sum(x**k/math.factorial(k) for k in range(n+1))
    err = abs(true-approx)
    bound = math.exp(x)*x**(n+1)/math.factorial(n+1)   # M=max|f^(n+1)| on [0,x]=e^x
    print(f"n={n} approx={approx:.8f} err={err:.2e} bound={bound:.2e} ok={err<=bound}")
# 二阶近似 f(a+h) ≈ f + f'h + f''h²/2，误差是 O(h³)：h 减半误差降 8 倍
f  = np.cos
for h in [0.4,0.2,0.1,0.05]:
    e = abs(f(1+h) - (f(1) - np.sin(1)*h - np.cos(1)*h**2/2))
    print(f"h={h} err={e:.3e}")`,
    out:`n=0 approx=1.00000000 err=6.49e-01 bound=8.24e-01 ok=True
n=1 approx=1.50000000 err=1.49e-01 bound=2.06e-01 ok=True
n=2 approx=1.62500000 err=2.37e-02 bound=3.43e-02 ok=True
n=3 approx=1.64583333 err=2.89e-03 bound=4.29e-03 ok=True
n=4 approx=1.64843750 err=2.84e-04 bound=4.29e-04 ok=True
n=5 approx=1.64869792 err=2.34e-05 bound=3.58e-05 ok=True
n=6 approx=1.64871962 err=1.65e-06 bound=2.56e-06 ok=True
h=0.4 err=9.477e-03
h=0.2 err=1.156e-03
h=0.1 err=1.424e-04
h=0.05 err=1.767e-05`,
    note:`bound 那一列就是第 7 步的 M h^{n+1}/(n+1)!，err ≤ bound 全为 True；第二段 h 减半误差降约 8 倍，验证二阶截断余项是 O(h³)。`
  },
  contrast:[
    {vs:`麦克劳林展开`, same:`同一个定理`, diff:`只是展开点 a=0 的特例`, when:`在 0 附近用麦克劳林；在别的点（如当前参数 θ_t）展开就叫泰勒`},
    {vs:`傅里叶级数`, same:`都是把函数写成基函数的和`, diff:`泰勒用幂函数、只在一点附近精确、要求光滑；傅里叶用正弦、在整个区间上 L² 逼近、允许不光滑`, when:`局部近似用泰勒；周期信号/全局逼近用傅里叶`},
    {vs:`插值多项式`, same:`都是多项式逼近`, diff:`泰勒只用一点的多阶导数；插值用多个点的函数值`, when:`有解析式在一点展开；只有采样点用插值`},
    {vs:`线性近似`, same:`一阶泰勒就是线性近似`, diff:`线性近似不说误差多大；泰勒定理给出误差 f''(ξ)h²/2`, when:`要控制步长（学习率）时必须看二阶余项`}
  ],
  ext:[
    {t:`二阶泰勒的极小点就是牛顿法一步`, go:'op.second_order'},
    {t:`一阶泰勒 + 步长 = 梯度下降；学习率上限来自二阶余项`, go:'op.learning_rate'},
    {t:`多元二阶项是 hᵀHh/2，H 是 Hessian`, go:'ca.partial_hessian'}
  ]
},

'ca.gradient': {
  layers:{
    alg:`∇f = (∂f/∂x₁,…,∂f/∂xₙ)。方向导数 D_u f = ∇f·u（|u|=1）。梯度下降 x ← x - η∇f。`,
    geo:`等高线是「f 不变」的曲线；梯度垂直于它，指向 f 增最快的方向，长度是那个方向的斜率。`,
    comp:`一次反向传播算出整条 ∇f；每步沿 -∇f 走 η 倍。二次函数上 η < 2/λ_max 才收敛，η 越接近 1/λ 收敛越快。`
  },
  proof:{
    from:`f 在 p 可微：f(p+h) = f(p) + ∇f(p)·h + o(|h|)；等高线 γ(t) 是光滑曲线且 f(γ(t)) ≡ c`,
    to:`(1) D_u f = ∇f·u；(2) ∇f 垂直于等高线；(3) f 增最快的方向是 ∇f/|∇f|，最大速率 |∇f|`,
    steps:[
      [`取 h = tu（|u|=1），代入可微定义：f(p+tu) - f(p) = t∇f·u + o(t)`, `方向导数就是沿直线 p+tu 的一元导数，可微定义直接给出线性部分`],
      [`除以 t 取极限：D_u f = ∇f·u`, `o(t)/t → 0；所有方向的斜率都由一个向量 ∇f 通过点积给出`],
      [`对等高线：f(γ(t)) ≡ c，两边对 t 求导（链式）得 ∇f(γ(t))·γ'(t) = 0`, `常数的导数为零；γ'(t) 是等高线的切向量`],
      [`所以 ∇f ⊥ γ'，即梯度垂直于等高线`, `点积为零就是垂直；等价说法：沿等高线方向导数为零，因为 f 不变`],
      [`柯西-施瓦茨：∇f·u ≤ |∇f||u| = |∇f|，取等当且仅当 u 与 ∇f 同向`, `点积的上界；这证明最陡方向是梯度方向，最陡斜率是 |∇f|`],
      [`梯度下降一步：f(p - η∇f) = f(p) - η|∇f|² + o(η)`, `代 h = -η∇f 到可微定义；η 小时 f 严格下降（除非 ∇f=0）`],
      [`二次函数 f = ½xᵀHx：x_{k+1} = (I - ηH)x_k，特征方向上按 (1-ηλ_i)^k 缩`, `H 对称可对角化，每个特征方向独立迭代；|1-ηλ_i|<1 ⇔ 0<η<2/λ_i，所以 η<2/λ_max 才全收敛`]
    ],
    end:`梯度是「所有方向斜率」的压缩包：点积一下就还原任意方向。它垂直等高线，因为沿等高线 f 不动。这两条决定了梯度下降的方向，η<2/λ_max 决定它的步长。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 验证：梯度 ⊥ 等高线切向；梯度方向的方向导数最大
f = lambda p: p[0]**2 + 3*p[1]**2 + p[0]*p[1]
grad = lambda p: np.array([2*p[0]+p[1], 6*p[1]+p[0]])
p = np.array([1.0,0.5]); g = grad(p); h=1e-6
# 沿等高线走：切向 t ⊥ g，方向导数应为 0
t = np.array([-g[1],g[0]])/np.linalg.norm(g)
print(f"grad={g}  D_t f={(f(p+h*t)-f(p-h*t))/(2*h):+.2e}  (along contour ~0)")
# 扫 360 度，看哪个方向导数最大
best=None
for th in np.linspace(0,2*np.pi,3600,endpoint=False):
    u = np.array([np.cos(th),np.sin(th)])
    d = (f(p+h*u)-f(p-h*u))/(2*h)
    if best is None or d>best[0]: best=(d,th)
print(f"max D_u f={best[0]:.6f}  |grad|={np.linalg.norm(g):.6f}")
print(f"best dir angle={np.degrees(best[1]):.1f}  grad angle={np.degrees(np.arctan2(g[1],g[0])):.1f}")
# 梯度下降在二次函数上：lr 与收敛
H = np.array([[2,1],[1,6]]); L = np.linalg.eigvalsh(H).max()
for lr in [0.1,0.25,2/L-0.01,2/L+0.05]:
    x = np.array([2.0,2.0])
    for _ in range(50): x = x - lr*grad(x)
    print(f"lr={lr:.3f} |x|={np.linalg.norm(x):.2e}")`,
    out:`grad=[2.5 4. ]  D_t f=-2.22e-10  (along contour ~0)
max D_u f=4.716991  |grad|=4.716991
best dir angle=58.0  grad angle=58.0
lr=0.100 |x|=9.08e-05
lr=0.250 |x|=6.65e-13
lr=0.311 |x|=9.62e-02
lr=0.371 |x|=1.88e+06`,
    note:`D_t f≈0 是第 4 步（沿等高线切向导数为零）；扫 360 度得最大方向导数 = |∇f| 且角度重合是第 5 步；四个 lr 是第 7 步，2/λ_max 两侧收敛/发散分明。`
  },
  contrast:[
    {vs:`偏导 ∂f/∂x_i`, same:`梯度的每个分量就是一个偏导`, diff:`偏导只沿坐标轴看一个数；梯度把它们打包成向量，才有方向和长度`, when:`问「x 单独动 f 怎么变」用偏导；问「往哪走最陡」用梯度`},
    {vs:`方向导数 D_u f`, same:`都是斜率`, diff:`方向导数是给定方向的斜率（一个数），梯度是能生成所有方向斜率的向量`, when:`方向导数 = 梯度 · 单位方向；梯度是母，方向导数是子`},
    {vs:`雅可比矩阵 J`, same:`都是一阶导数打包`, diff:`标量函数的一阶导是梯度（向量）；向量函数的一阶导是雅可比（矩阵），每行一个梯度`, when:`损失函数用梯度；一层网络（向量到向量）用雅可比`},
    {vs:`次梯度`, same:`都指出下降方向`, diff:`梯度唯一；不可导点次梯度是一个集合`, when:`ReLU、L1 正则化处用次梯度`}
  ],
  ext:[
    {t:`加步长和迭代就是梯度下降`, go:'ml.gradient_descent'},
    {t:`步长上限 2/λ_max、条件数决定收敛速度`, go:'op.learning_rate'},
    {t:`凸函数上梯度为零就是全局最小`, go:'op.convex'}
  ]
},

'ca.optimization': {
  layers:{
    alg:`一阶必要条件：内点极值处 f'(x*) = 0。二阶充分条件：f'(x*)=0 且 f''(x*)>0 ⇒ 严格局部极小。`,
    geo:`谷底是平的：切线水平。碗向上弯（f''>0）是谷，向下弯是顶，弯度为零要再看更高阶。`,
    comp:`解 f'=0：能解析就解析，不能就牛顿法（x ← x - f'/f''）或梯度下降。算出候选后代回比较，别忘端点。`
  },
  proof:{
    from:`f 在开区间内的 x* 取局部极小且 f 在 x* 可导`,
    to:`f'(x*) = 0；进一步若 f''(x*) > 0 则 x* 是严格局部极小；反之 f'=0 不保证极值`,
    steps:[
      [`局部极小：存在 δ，|h|<δ 时 f(x*+h) ≥ f(x*)`, `这是定义，不涉及导数`],
      [`h>0：差商 [f(x*+h)-f(x*)]/h ≥ 0，取 h→0⁺ 得 f'(x*) ≥ 0`, `分子非负、分母正；极限保持非严格不等号`],
      [`h<0：差商 ≤ 0（分子非负、分母负），取 h→0⁻ 得 f'(x*) ≤ 0`, `同理；可导保证左右极限都等于 f'(x*)`],
      [`合并：f'(x*) = 0`, `≥0 且 ≤0 只能是 0；这就是费马定理（一阶必要条件）`],
      [`二阶：泰勒 f(x*+h) = f(x*) + 0·h + f''(x*)h²/2 + o(h²)`, `一阶项已为零，所以 h² 项主导`],
      [`若 f''(x*)>0，则小 h 时 f''h²/2 + o(h²) > 0，即 f(x*+h) > f(x*)`, `o(h²) 最终小于 f''h²/2 的一半；严格局部极小成立`],
      [`反例说明必要不充分：x³ 在 0 处 f'=0 但两边符号相反，是拐点；x⁴ 在 0 处 f''=0 却是极小`, `一阶条件只筛候选；二阶为零时要看更高阶或直接看函数值`],
      [`闭区间 [a,b] 上：最值出现在驻点或端点`, `端点处「两边都能走」不成立，第 2-3 步失效，所以端点必须单独检查`]
    ],
    end:`极值处不能再往哪边走更好 ⇒ 斜率为零。这是所有优化算法的停止判据（|∇f| < ε），二阶条件告诉你停的是谷还是鞍。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 验证一阶条件：极值点 f'=0；二阶导定碗/帽；驻点不一定极值
f  = lambda x: x**4 - 3*x**2 + x
df = lambda x: 4*x**3 - 6*x + 1
d2 = lambda x: 12*x**2 - 6
# 牛顿法找 f'=0 的根（三个驻点）
roots=[]
for x in [-1.5,0.0,1.5]:
    for _ in range(30): x = x - df(x)/d2(x)
    roots.append(x)
for r in roots:
    kind = "极小" if d2(r)>0 else "极大"
    print(f"x*={r:+.6f} f'={df(r):+.1e} f''={d2(r):+.3f} -> {kind}, f={f(r):+.6f}")
# 暴力网格最小值对照
xs = np.linspace(-3,3,600001); i = np.argmin(f(xs))
print(f"grid argmin={xs[i]:+.6f} f={f(xs[i]):+.6f}")
# 驻点非极值：x^3 在 0
print("x^3: f'(0)=0 但左负右正的斜率 -> 拐点, f(-.1)=%.4f f(.1)=%.4f"%((-.1)**3,(.1)**3))`,
    out:`x*=-1.300840 f'=+1.8e-15 f''=+14.306 -> 极小, f=-3.513905
x*=+0.169938 f'=+0.0e+00 f''=-5.653 -> 极大, f=+0.084135
x*=+1.130901 f'=+0.0e+00 f''=+9.347 -> 极小, f=-1.070230
grid argmin=-1.300840 f=-3.513905
x^3: f'(0)=0 但左负右正的斜率 -> 拐点, f(-.1)=-0.0010 f(.1)=0.0010`,
    note:`牛顿法解 f'=0 找到三个驻点（第 4 步），f'' 符号定型（第 6 步），网格暴力最小值与 f''>0 的最低驻点一致；最后一行是第 7 步反例 x³。`
  },
  contrast:[
    {vs:`驻点 f'=0`, same:`极值点一定是驻点`, diff:`驻点是候选集，极值是其中通过二阶检验或函数值比较的`, when:`先找驻点，再判型；别把驻点当答案`},
    {vs:`最值（全局）`, same:`都是「最好」`, diff:`极值是局部比邻居好；最值是全区间最好，可能在端点`, when:`闭区间问最值：驻点 + 端点全部代回比较`},
    {vs:`带约束极值`, same:`都要「不能再改进」`, diff:`无约束要 ∇f=0；有约束只要求 ∇f 沿可行方向的分量为零，∇f 本身可不为零`, when:`约束是等式用拉格朗日乘子；不等式用 KKT`},
    {vs:`凸优化`, same:`都用 f'=0`, diff:`凸函数的驻点自动是全局最小，二阶检验免了；非凸只是局部`, when:`能证凸就不用担心局部极小；深度学习非凸，只能接受局部解`}
  ],
  ext:[
    {t:`凸函数：一阶条件即全局最优`, go:'op.convex'},
    {t:`等式约束 → 拉格朗日乘子`, go:'ca.lagrange'},
    {t:`不等式约束 → KKT 条件`, go:'op.kkt'}
  ]
},

'ca.ode': {
  layers:{
    alg:`y' = f(t,y) + 初值 y(0)=y₀。最简单的 y'=-ky 解为 y₀e^{-kt}：分离变量 dy/y = -k dt 两边积分。`,
    geo:`平面上每点画一个小箭头（斜率 f），解曲线处处顺着箭头走。初值定了，曲线唯一。`,
    comp:`欧拉法：y_{n+1} = y_n + Δt·f(t_n,y_n)，沿当前箭头直走一步。全局误差 O(Δt)，y'=-ky 时 Δt > 2/k 就翻号发散。`
  },
  proof:{
    from:`一室药代动力学：药量按当前浓度成比例消除，C'(t) = -kC，C(0)=C₀，k>0`,
    to:`C(t) = C₀e^{-kt}，半衰期 t½ = ln2/k；且该解唯一`,
    steps:[
      [`C>0 时两边除以 C：C'/C = -k`, `分离变量：把 C 全挪到一边，t 全挪到另一边；C₀>0 且解连续，一段时间内 C>0`],
      [`左边是 (ln C)'（链式法则）：(ln C)' = -k`, `d/dt ln C = C'/C，这是对数导数`],
      [`两边从 0 到 t 积分：ln C(t) - ln C₀ = -kt`, `FTC：导数的积分是函数值之差`],
      [`取指数：C(t) = C₀e^{-kt}`, `ln 单调，可以两边取 exp`],
      [`半衰期：C₀/2 = C₀e^{-kt½} ⇒ t½ = ln2/k`, `解一个指数方程；t½ 与 C₀ 无关是一阶消除的标志`],
      [`唯一性：设 D 也是解，令 u = D·e^{kt}，则 u' = D'e^{kt} + kDe^{kt} = (-kD + kD)e^{kt} = 0`, `乘积法则；u 导数恒零故为常数 u(0)=C₀，所以 D = C₀e^{-kt}`],
      [`欧拉法在此方程上：C_{n+1} = C_n(1 - kΔt)，n 步后 C₀(1-kΔt)^n`, `f(C) = -kC 代入欧拉公式；|1-kΔt|<1 ⇔ Δt<2/k 才不发散，且 (1-kΔt)^{t/Δt} → e^{-kt} 当 Δt→0`]
    ],
    end:`「变化率正比自身」的唯一解是指数。分离变量把 ODE 变成积分，FTC 把积分变成原函数。欧拉法是同一件事的离散版，步长必须小于 2/k。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 一室 PK：C' = -k C，C(0)=C0；分离变量得 C=C0 e^{-kt}。欧拉法 vs 解析解
k, C0, T = 0.3, 100.0, 10.0
exact = lambda t: C0*np.exp(-k*t)
for dt in [1.0,0.5,0.1,0.01]:
    n = int(T/dt); C = C0
    for _ in range(n): C = C + dt*(-k*C)        # 欧拉：C_{n+1}=C_n(1-k dt)
    print(f"dt={dt:<5} euler={C:.5f} exact={exact(T):.5f} err={abs(C-exact(T)):.2e}")
print(f"half-life ln2/k={np.log(2)/k:.4f}; C(t_half)={exact(np.log(2)/k):.2f}")
# 步长超过 2/k 欧拉法翻号发散
print(f"dt=8 > 2/k={2/k:.2f}: C after 2 steps = {C0*(1-k*8)**2:.1f} (should be {exact(16):.2f})")`,
    out:`dt=1.0   euler=2.82475 exact=4.97871 err=2.15e+00
dt=0.5   euler=3.87595 exact=4.97871 err=1.10e+00
dt=0.1   euler=4.75525 exact=4.97871 err=2.23e-01
dt=0.01  euler=4.95631 exact=4.97871 err=2.24e-02
half-life ln2/k=2.3105; C(t_half)=50.00
dt=8 > 2/k=6.67: C after 2 steps = 196.0 (should be 0.82)`,
    note:`欧拉误差随 Δt 线性下降（O(Δt)，第 7 步）；半衰期那行验证第 5 步；最后一行 Δt=8>2/k 时两步后浓度反而变 196，就是 |1-kΔt|>1 的发散。`
  },
  contrast:[
    {vs:`代数方程`, same:`都是「解未知量」`, diff:`代数方程的未知量是数，ODE 的未知量是函数；解是曲线不是点`, when:`问「某时刻值是多少」先解 ODE 再代 t`},
    {vs:`差分方程 y_{n+1} = g(y_n)`, same:`都描述演化规则`, diff:`ODE 连续时间，差分离散时间；欧拉法就是把 ODE 变成差分方程`, when:`每天给药一次是差分；连续输注是 ODE`},
    {vs:`偏微分方程 PDE`, same:`都含导数`, diff:`ODE 只有一个自变量（时间）；PDE 有多个（时间+空间），扩散方程是 PDE`, when:`只关心浓度随时间：ODE；关心浓度在组织里的分布：PDE`},
    {vs:`ResNet`, same:`x_{l+1} = x_l + f(x_l) 形式上就是欧拉一步`, diff:`ResNet 的步长和 f 都是学出来的，不追求逼近某个连续解`, when:`Neural ODE 把层数换成积分时间，就是把这个类比当真`}
  ],
  ext:[
    {t:`多室、吸收相、非线性消除都是同一套分离变量/数值积分`, go:'bm.pk_ode'},
    {t:`残差连接 = 欧拉法一步`, go:'dl.resnet'},
    {t:`扩散模型的前向/反向过程是随机微分方程`, go:'gm.diffusion'}
  ]
},

'ca.limit': {
  layers:{
    alg:`lim_{x→a} f(x) = L：对任意 ε>0 存在 δ>0，0<|x-a|<δ ⇒ |f(x)-L|<ε。函数在 a 处有没有定义、定义成什么，一概无关。`,
    geo:`一个点沿曲线滑向 x=a，看 y 往哪靠。左右两边必须靠向同一个值，否则极限不存在。`,
    comp:`取 x = 1e-1, 1e-2, … 看数值稳没稳。稳不住（震荡）或左右不一致就是不存在。0/0 型先化简、再泰勒、最后才洛必达。`
  },
  proof:{
    from:`f、g 在 a 附近可导，f(a)=g(a)=0，g'(x)≠0 于 a 附近，且 lim f'(x)/g'(x) = L 存在`,
    to:`洛必达法则：lim_{x→a} f(x)/g(x) = L；并说明每个前提为什么不能少`,
    steps:[
      [`先证柯西中值定理：令 φ(t) = f(t)[g(x)-g(a)] - g(t)[f(x)-f(a)]，则 φ(a) = φ(x)`, `两端代入后都等于 f(a)g(x) - g(a)f(x)，构造让端点相等`],
      [`罗尔定理给 ξ ∈ (a,x) 使 φ'(ξ) = 0，即 f'(ξ)[g(x)-g(a)] = g'(ξ)[f(x)-f(a)]`, `端点相等的可导函数中间必有水平切线`],
      [`用 f(a)=g(a)=0：f(x)/g(x) = f'(ξ)/g'(ξ)`, `g(x) ≠ 0 因 g' ≠ 0 保证 g 在 a 附近单调（否则再用罗尔得矛盾）`],
      [`x→a 时 ξ 被夹在 (a,x) 中也 → a，所以 f(x)/g(x) → lim f'(ξ)/g'(ξ) = L`, `ξ 依赖 x 但被夹逼；L 存在是前提`],
      [`前提 1 不能少：f(a)=g(a)=0。否则 f/g 直接代值即可，用洛必达会算错（如 lim_{x→0} (x+1)/(x+2) = 1/2，而 f'/g' = 1）`, `0/0 是让 f(a)、g(a) 消失的关键`],
      [`前提 2 不能少：g' ≠ 0。x²sin(1/x)/sin x 在 0 处 f'/g' 震荡不存在，但原极限 = 0`, `第 3 步的除法需要 g' ≠ 0；f'/g' 不存在不代表 f/g 不存在`],
      [`前提 3：L 存在（可为 ∞）。若 f'/g' 震荡，洛必达无结论，不是原极限不存在`, `洛必达是单向蕴含，反向不成立`],
      [`更本质的观点：0/0 型极限就是「两个都趋零的量之比」，泰勒展开 f = f'(a)h + o(h)、g = g'(a)h + o(h) 直接给 f/g → f'(a)/g'(a)`, `这解释了 sin x/x → 1、(e^x-1)/x → 1：都是首项系数之比`]
    ],
    end:`极限只看趋势不看落点。洛必达是柯西中值定理的推论，三条前提缺一不可；多数 0/0 型用泰勒首项之比更快更安全。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 验证 sin x/x -> 1、(1+1/n)^n -> e、洛必达 (e^x-1)/x -> 1
for x in [1e-1,1e-2,1e-3,1e-4]:
    print(f"x={x:.0e} sinx/x={np.sin(x)/x:.10f} (e^x-1)/x={np.expm1(x)/x:.10f}")
for n in [10,1000,10**5,10**7]:
    print(f"n={n:<9} (1+1/n)^n={(1+1/n)**n:.8f}  e={np.e:.8f}")
# 单侧极限不等 -> 极限不存在
x=1e-6; print(f"|x|/x at +x={abs(x)/x:+.0f}, at -x={abs(-x)/(-x):+.0f}")
# 洛必达前提：分母导数不为零。x^2 sin(1/x)/sin x -> 0，直接算
x=1e-4; print(f"x^2 sin(1/x)/sin x = {x**2*np.sin(1/x)/np.sin(x):.2e}")`,
    out:`x=1e-01 sinx/x=0.9983341665 (e^x-1)/x=1.0517091808
x=1e-02 sinx/x=0.9999833334 (e^x-1)/x=1.0050167084
x=1e-03 sinx/x=0.9999998333 (e^x-1)/x=1.0005001667
x=1e-04 sinx/x=0.9999999983 (e^x-1)/x=1.0000500017
n=10        (1+1/n)^n=2.59374246  e=2.71828183
n=1000      (1+1/n)^n=2.71692393  e=2.71828183
n=100000    (1+1/n)^n=2.71826824  e=2.71828183
n=10000000  (1+1/n)^n=2.71828169  e=2.71828183
|x|/x at +x=+1, at -x=-1
x^2 sin(1/x)/sin x = -3.06e-05`,
    note:`前四行是第 8 步（首项之比 → 1），偏差随 x 线性缩小；|x|/x 左右不一致对应极限不存在；最后一行是第 6 步反例，原极限 ≈ 0 但洛必达失效。`
  },
  contrast:[
    {vs:`函数值 f(a)`, same:`连续时两者相等`, diff:`极限是趋势，函数值是落点；f(a) 可以不存在或不等于极限`, when:`lim = f(a) 就是连续的定义；不连续点只能谈极限`},
    {vs:`单侧极限`, same:`都是趋近`, diff:`单侧只从一边靠；双侧极限存在 ⇔ 左右极限存在且相等`, when:`分段函数、绝对值、阶跃处必须分左右`},
    {vs:`收敛 vs 一致收敛（函数列）`, same:`都是「越来越接近」`, diff:`逐点收敛：每个 x 各自有自己的 N；一致收敛：一个 N 对所有 x 通用，才能交换极限与积分/求导`, when:`要「先求极限再积分 = 先积分再求极限」必须一致收敛；x^n 在 [0,1] 逐点收敛但不一致`},
    {vs:`无穷大`, same:`都写 lim`, diff:`趋于无穷是「无界增长」不是收敛到某个数；∞ 不是数`, when:`∞/∞、∞-∞、0·∞ 都是未定式，要变形`}
  ],
  ext:[
    {t:`极限的 ε-δ 语言推广到多元、函数列、随机变量（依概率收敛）`, go:'pr.clt'},
    {t:`浮点数没有真正的极限：1e-300 再除就下溢为 0`, go:'np.overflow'},
    {t:`导数与积分都是极限，泰勒余项是极限的定量版`, go:'ca.taylor'}
  ]
},

'ca.partial_hessian': {
  layers:{
    alg:`∂f/∂x_i：其余变量当常数的一元导数。Hessian H_ij = ∂²f/∂x_i∂x_j 对称（Schwarz）。二阶泰勒 f(p+h) = f + ∇f·h + ½hᵀHh + o(|h|²)。`,
    geo:`把曲面沿一个方向切开，切口曲线的斜率是偏导、弯度是二阶偏导。H 的特征向量是曲面的主弯曲方向，特征值是各方向的弯度。`,
    comp:`数值 Hessian：二阶中心差分 [f(x+h)-2f(x)+f(x-h)]/h²。特征值全正 → 碗，全负 → 帽，有正有负 → 鞍。牛顿法一步 = -H⁻¹∇f。`
  },
  proof:{
    from:`f 二阶连续可微；一元泰勒定理；对称矩阵可正交对角化`,
    to:`(1) 多元二阶泰勒 f(p+h) = f(p) + ∇f·h + ½hᵀHh + o(|h|²)；(2) 驻点处 H 正定 ⇒ 严格局部极小，H 不定 ⇒ 鞍点`,
    steps:[
      [`固定方向 h，令 φ(t) = f(p + th)，这是一元函数`, `多元问题沿一条直线看就变一元，可用一元泰勒`],
      [`链式法则：φ'(t) = ∇f(p+th)·h = Σ_i ∂_i f · h_i`, `p+th 对 t 的导数是 h，链式把它和梯度点积`],
      [`再求导：φ''(t) = Σ_i Σ_j ∂_i∂_j f · h_i h_j = hᵀH(p+th)h`, `对每个 ∂_i f 再用一次链式，得二重和，写成二次型`],
      [`一元泰勒到二阶：φ(1) = φ(0) + φ'(0) + ½φ''(0) + o(1)，代入得 f(p+h) = f(p) + ∇f·h + ½hᵀHh + o(|h|²)`, `φ 在 [0,1] 二阶可导；余项 o(1) 关于 t，换回 h 尺度是 o(|h|²)`],
      [`驻点 ∇f=0 时 f(p+h) - f(p) = ½hᵀHh + o(|h|²)`, `一阶项消失，二次型主导 f 的增减`],
      [`H 对称 ⇒ H = QΛQᵀ，令 v = Qᵀh：hᵀHh = Σ λ_i v_i²`, `谱定理；在特征向量坐标下二次型没有交叉项`],
      [`全部 λ_i > 0：hᵀHh ≥ λ_min|h|² > 0，压过 o(|h|²)，f(p+h) > f(p)，严格极小；有正有负：沿正特征向量 f 增、沿负的 f 减，是鞍`, `每个方向的增减由对应特征值符号决定；这就是「看特征值不看对角线」的原因`],
      [`2×2 情形：det H = λ₁λ₂，tr H = λ₁+λ₂。det<0 ⇒ 异号 ⇒ 鞍；det>0 且 f_xx>0 ⇒ 都正 ⇒ 极小`, `行列式是特征值之积；f_xx>0 且 det>0 时 f_yy 也必正`]
    ],
    end:`Hessian 是多元的「弯度」：沿特征向量各自独立地弯，弯度就是特征值。高维随机函数的特征值几乎不可能同号，所以深度学习的驻点大多是鞍点，梯度下降靠噪声逃出去。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 数值 Hessian（二阶中心差分）vs 解析；特征值定型
f = lambda x,y: x**3 - 3*x*y**2 + 0.5*x**2 + 2*y**2   # 猴鞍变体
def num_hess(p,h=1e-4):
    x,y=p; H=np.zeros((2,2))
    H[0,0]=(f(x+h,y)-2*f(x,y)+f(x-h,y))/h**2
    H[1,1]=(f(x,y+h)-2*f(x,y)+f(x,y-h))/h**2
    H[0,1]=H[1,0]=(f(x+h,y+h)-f(x+h,y-h)-f(x-h,y+h)+f(x-h,y-h))/(4*h*h)
    return H
ana = lambda x,y: np.array([[6*x+1,-6*y],[-6*y,-6*x+4]])
for p in [(0.0,0.0),(1.0,1.0),(-1.0,0.0)]:
    Hn=num_hess(p); Ha=ana(*p); ev=np.linalg.eigvalsh(Ha)
    kind = "碗(极小)" if ev.min()>0 else ("帽(极大)" if ev.max()<0 else "鞍")
    print(f"p={p} maxdiff={np.abs(Hn-Ha).max():.1e} eig={np.round(ev,3)} -> {kind}")
# 沿特征向量走一步看 f 增减，验证「弯法」
H=ana(0,0); ev,V=np.linalg.eigh(H); t=0.1
for i in range(2):
    d=V[:,i]; print(f"eig={ev[i]:+.2f} dir={np.round(d,3)} f(0+td)-f(0)={f(*(t*d))-f(0,0):+.5f}")`,
    out:`p=(0.0, 0.0) maxdiff=0.0e+00 eig=[1. 4.] -> 碗(极小)
p=(1.0, 1.0) maxdiff=2.0e-08 eig=[-5. 10.] -> 鞍
p=(-1.0, 0.0) maxdiff=8.2e-09 eig=[-5. 10.] -> 鞍
eig=+1.00 dir=[1. 0.] f(0+td)-f(0)=+0.00600
eig=+4.00 dir=[0. 1.] f(0+td)-f(0)=+0.02000`,
    note:`数值 Hessian 与解析差 ≤ 2e-8，验证对称性与二阶差分；特征值定型对应第 7 步；最后两行沿特征向量走一步 f 增量 ≈ ½λt²（0.005、0.02），正是第 6 步的二次型。`
  },
  contrast:[
    {vs:`方向导数`, same:`偏导是沿坐标轴的方向导数`, diff:`偏导只沿 e_i，方向导数任意单位方向；方向导数 = 梯度 · u`, when:`要「某个变量单独的影响」用偏导；要「沿某条路径」用方向导数`},
    {vs:`全导数 / 全微分`, same:`都描述多元变化`, diff:`偏导是一个数（一个方向）；全微分 df = Σ ∂_i f dx_i 是所有方向的合成`, when:`变量之间互相依赖（t 经 x、y 都影响 f）时要全导数`},
    {vs:`雅可比矩阵`, same:`都是导数矩阵`, diff:`雅可比是向量函数的一阶导（m×n）；Hessian 是标量函数的二阶导（n×n 对称）；Hessian = 梯度的雅可比`, when:`一层网络看雅可比；损失曲面看 Hessian`},
    {vs:`Fisher 信息矩阵`, same:`都是 n×n、都刻画曲率`, diff:`Fisher 是对数似然梯度的外积期望，永远半正定；Hessian 可不定`, when:`自然梯度、XGBoost 二阶近似用 Fisher/Gauss-Newton 替代 Hessian 保证正定`}
  ],
  ext:[
    {t:`Hessian 的谱分解就是特征值问题`, go:'la.eigen'},
    {t:`牛顿法 / 拟牛顿用 H 或其近似`, go:'op.second_order'},
    {t:`XGBoost 用每个样本损失的一二阶导做分裂增益`, go:'ml.xgboost'}
  ]
},

'ca.product_quotient': {
  layers:{
    alg:`(uv)' = u'v + uv'；(u/v)' = (u'v - uv')/v²。多元推广：d(AB) = (dA)B + A(dB)，顺序不能换。`,
    geo:`矩形长 u 宽 v。长增 u'h 多一条竖边 (u'h)·v，宽增 v'h 多一条横边 u·(v'h)，角落小块 u'v'h² 是二阶小量。`,
    comp:`反向传播里 out = h·W 这类乘法节点：上游梯度分别乘另一个因子，dW = hᵀ·dout，dh = dout·Wᵀ。乘积法则就是「乘法门的反向」。`
  },
  proof:{
    from:`u、v 在 x 可导：u(x+h) = u + u'h + o(h)，v(x+h) = v + v'h + o(h)`,
    to:`(uv)' = u'v + uv'；(u/v)' = (u'v - uv')/v²（v ≠ 0）`,
    steps:[
      [`相乘：u(x+h)v(x+h) = (u + u'h + o(h))(v + v'h + o(h))`, `两个线性近似直接相乘，这是「同时变」的精确表达`],
      [`展开：= uv + (u'v + uv')h + u'v'h² + o(h)·(有界量)`, `四项两两相乘；u'v'h² 是那个角落小块，o(h) 乘有界量仍是 o(h)`],
      [`h² = o(h)，合并：u(x+h)v(x+h) = uv + (u'v + uv')h + o(h)`, `h²/h = h → 0，所以角落块可以扔；这是乘积法则里唯一「丢掉」的东西`],
      [`由导数唯一性，(uv)' = u'v + uv'`, `已写成「线性 + o(h)」，线性系数即导数`],
      [`商：先求 (1/v)'。1/v(x+h) - 1/v = -[v(x+h)-v]/[v(x+h)v] = -(v'h + o(h))/(v² + o(1))`, `通分；v 连续（可导⇒连续）故分母 → v²`],
      [`得 (1/v)' = -v'/v²`, `除以 h 取极限；也可用链式：(v⁻¹)' = -v⁻²·v'`],
      [`u/v = u·(1/v)，套乘积法则：(u/v)' = u'/v + u·(-v'/v²) = (u'v - uv')/v²`, `商法则不是新规则，是乘积 + 链式的组合`],
      [`矩阵版：(AB)' = A'B + AB'。同样展开，但 A'B ≠ BA'，顺序必须保留`, `矩阵乘法不交换；反向传播里 dW = hᵀdout 而不是 dout·hᵀ 就来自这里`]
    ],
    end:`两个量同时变，总变化 = 各自单独变的和，交叉项是二阶小量。反向传播的乘法节点、动量项的推导、分部积分，都是这条法则的正用或倒用。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 验证 (uv)' = u'v + uv'：角落小块 u'v'h^2 是二阶小量
u,du = np.sin, np.cos
v,dv = np.exp, np.exp
x0=1.2
for h in [1e-1,1e-2,1e-3]:
    total = u(x0+h)*v(x0+h) - u(x0)*v(x0)
    lin   = (du(x0)*v(x0) + u(x0)*dv(x0))*h
    corner= du(x0)*dv(x0)*h*h
    print(f"h={h:.0e} Δ(uv)={total:.6f} lin={lin:.6f} corner~{corner:.2e} resid={total-lin:.2e}")
# 商法则 (u/v)' vs 数值
q  = lambda x: np.sin(x)/(1+x**2)
dq = lambda x: (np.cos(x)*(1+x**2) - np.sin(x)*2*x)/(1+x**2)**2
h=1e-5; print(f"quotient: formula={dq(x0):.8f} numeric={(q(x0+h)-q(x0-h))/(2*h):.8f}")`,
    out:`h=1e-01 Δ(uv)=0.441102 lin=0.429755 corner~1.20e-02 resid=1.13e-02
h=1e-02 Δ(uv)=0.043095 lin=0.042975 corner~1.20e-04 resid=1.20e-04
h=1e-03 Δ(uv)=0.004299 lin=0.004298 corner~1.20e-06 resid=1.20e-06
quotient: formula=-0.22721394 numeric=-0.22721394`,
    note:`resid 列 ≈ corner 列且随 h² 缩，就是第 3 步扔掉的角落块；商法则公式与数值差商一致是第 7 步。`
  },
  contrast:[
    {vs:`链式法则`, same:`都是两个函数组合后求导`, diff:`乘积是并联（都吃 x），相加；链式是串联，相乘`, when:`u(x)·v(x) 用乘积；u(v(x)) 用链式；u(x)·v(g(x)) 两个都用`},
    {vs:`线性性 (au+bv)' = au'+bv'`, same:`都是「拆开来算」`, diff:`线性性是加法的求导，无交叉项；乘积法则有交叉项，交叉项才让 (uv)' ≠ u'v'`, when:`看运算符：加减直接拆；乘除走乘积/商`},
    {vs:`对数求导`, same:`都能处理乘积`, diff:`取 ln 后乘积变加法，(ln uv)' = u'/u + v'/v；本质是乘积法则除以 uv`, when:`多个因子连乘、幂指函数 x^x 用对数求导更快`},
    {vs:`分部积分`, same:`同一个公式`, diff:`分部积分是乘积法则两边积分后移项：∫u'v = uv - ∫uv'`, when:`积分里看到两类函数相乘，就把乘积法则倒过来用`}
  ],
  ext:[
    {t:`乘法门的反向传播 = 上游梯度乘另一个因子`, go:'dl.backprop'},
    {t:`乘积法则倒过来 = 分部积分`, go:'ca.integration_tricks'},
    {t:`连乘取对数变连加`, go:'ca.log_trick'}
  ]
},

'ca.log_trick': {
  layers:{
    alg:`(ln f)' = f'/f，所以 (ln Πf_i)' = Σ f_i'/f_i。logsumexp(z) = m + ln Σe^{z_i - m}，m = max z，数学上恒等、数值上不溢出。`,
    geo:`log 是把乘法尺变加法尺：连乘的塔摊平成一排。e^{1000} 在数轴上跳出浮点范围，减掉 max 就是把整排平移回原点附近，相对位置不变。`,
    comp:`似然永远算 log 似然；softmax 永远先减 max；交叉熵用 log_softmax 一步算而不是先 softmax 再 log。float64 上限约 e^{709}。`
  },
  proof:{
    from:`链式法则；ln 的导数 1/x；ln(ab) = ln a + ln b；e^{a+b} = e^a e^b`,
    to:`(1) 对数导数把连乘的导数变连加；(2) logsumexp 平移恒等式及其不溢出；(3) softmax 平移不变`,
    steps:[
      [`(ln f)' = (1/f)·f' = f'/f`, `链式：外层 ln 的导数是 1/(·)，内层是 f'`],
      [`L = Π_i f_i，则 ln L = Σ ln f_i，两边求导：L'/L = Σ f_i'/f_i`, `ln 把乘变加是对数的定义性质；加法的导数逐项加（线性性）`],
      [`所以 L' = L·Σ f_i'/f_i：n 个因子的乘积法则一行写完`, `直接用乘积法则要写 n 项每项 n-1 个因子，对数导数把它压成一个和`],
      [`MLE 里 L(θ) = Π p(x_i|θ)，最大化 L 与最大化 ln L 等价`, `ln 严格单调递增，不改变 argmax；且 Π 的数值会下溢到 0，Σ 不会`],
      [`logsumexp：ln Σ e^{z_i} = ln Σ e^{m}e^{z_i - m} = ln(e^m Σ e^{z_i-m}) = m + ln Σ e^{z_i - m}`, `每项提出公因子 e^m，再用 ln(ab) = ln a + ln b`],
      [`取 m = max z：每个 z_i - m ≤ 0，e^{z_i-m} ∈ (0,1]，且至少一项 = 1，和 ∈ [1,n]`, `指数不会上溢；和至少为 1 所以 ln 不会取到 -∞`],
      [`softmax_i = e^{z_i}/Σe^{z_j} = e^{z_i - m}/Σe^{z_j - m}`, `分子分母同乘 e^{-m}，比值不变；这就是「减 max」不改结果的证明`],
      [`log softmax_i = z_i - logsumexp(z)，其对 z_j 的导数 = δ_ij - softmax_j`, `直接对第 7 步取 ln；求导用第 1 步，∂logsumexp/∂z_j = softmax_j`]
    ],
    end:`log 做两件事：把乘法变加法让导数好算，把天文数字拉回人类尺度让浮点不炸。两件事的代价是零，因为 ln 单调、平移恒等。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 1) 对数导数 (ln f)'=f'/f 把连乘变连加
xs = np.array([0.5,1.5,2.0]); w=np.array([2.0,-1.0,3.0])
f  = lambda t: np.prod((xs+t)**w)             # ∏(x_i+t)^{w_i}
lnf_d = np.sum(w/(xs+0.0))                    # Σ w_i/(x_i+t) at t=0
h=1e-6; num=(np.log(f(h))-np.log(f(-h)))/(2*h)
print(f"(ln f)': formula={lnf_d:.6f} numeric={num:.6f}")
# 2) logsumexp 防溢出
z = np.array([1000.0,1000.0,999.0])
with np.errstate(over='ignore'):
    naive = np.log(np.sum(np.exp(z)))
m=z.max(); lse = m + np.log(np.sum(np.exp(z-m)))
print(f"naive={naive}  logsumexp={lse:.6f}  expect={1000+np.log(2+np.exp(-1)):.6f}")
# 3) softmax 数值稳定：减 max 不改结果
z2=np.array([1.0,2.0,3.0]); a=np.exp(z2)/np.exp(z2).sum(); b=np.exp(z2-3)/np.exp(z2-3).sum()
print("softmax shift-invariant:", np.allclose(a,b), np.round(a,4))`,
    out:`(ln f)': formula=4.833333 numeric=4.833333
naive=inf  logsumexp=1000.861995  expect=1000.861995
softmax shift-invariant: True [0.09   0.2447 0.6652]`,
    note:`第一行 Σw_i/(x_i+t) 就是第 2-3 步的对数导数；naive=inf 而 logsumexp 精确是第 5-6 步；softmax 平移不变是第 7 步。`
  },
  contrast:[
    {vs:`对数变换（数据预处理）`, same:`都是取 log`, diff:`对数求导是求导技巧，结果换回原尺度；数据 log 变换改变了模型假设（乘性噪声变加性）`, when:`求导用对数导数；数据跨数量级、右偏时才 log 变换`},
    {vs:`softmax 后再 log`, same:`数学上等于 log_softmax`, diff:`先 softmax 会先算 e^{z} 可能溢出、再 log 可能取到 log(0)；log_softmax 直接用 z - logsumexp`, when:`永远用 log_softmax / 带 logits 的交叉熵`},
    {vs:`归一化（除以 max）`, same:`都是「减掉 / 除掉一个参考值」`, diff:`除以 max 改变数值大小；减 max 在指数里只是平移，结果恒等`, when:`softmax 用减 max（恒等）；特征缩放用除`},
    {vs:`弹性 (dlnf)/(dlnx) = xf'/f`, same:`都是对数导数`, diff:`弹性是相对变化对相对变化，两边都取 log；对数导数只对 f 取 log`, when:`问「x 变 1% f 变几 %」用弹性`}
  ],
  ext:[
    {t:`MLE 全靠 log 似然`, go:'pr.mle'},
    {t:`交叉熵 = -log softmax，数值稳定版就是 logsumexp`, go:'it.cross_entropy'},
    {t:`浮点上溢/下溢的边界`, go:'np.overflow'}
  ]
},

'ca.lagrange': {
  layers:{
    alg:`min f(x) s.t. g(x)=0。最优点满足 ∇f = λ∇g 且 g=0；等价于拉格朗日函数 L = f - λg 的驻点。λ = ∂f*/∂c 是约束松一点目标变多少。`,
    geo:`等高线一圈圈扩大，第一次碰到约束曲线时相切；相切 = 两条曲线的法线（梯度）平行。`,
    comp:`n+1 个未知数（x 和 λ）、n+1 个方程（∇f = λ∇g 共 n 个、g=0 一个），解方程组；解出的是候选，代回比较。`
  },
  proof:{
    from:`f、g 连续可微；x* 是 f 在约束曲面 S = {g=0} 上的局部极小；∇g(x*) ≠ 0（约束规范）`,
    to:`存在 λ 使 ∇f(x*) = λ∇g(x*)`,
    steps:[
      [`S 在 x* 处的切空间 T = {v : ∇g(x*)·v = 0}`, `沿 S 内任一光滑曲线 γ(t)（γ(0)=x*）有 g(γ(t))≡0，链式求导得 ∇g·γ'(0)=0；∇g≠0 保证 T 是 n-1 维、S 局部是光滑曲面（隐函数定理）`],
      [`任取 v ∈ T，隐函数定理保证存在 S 内曲线 γ 使 γ(0)=x*、γ'(0)=v`, `这是约束规范 ∇g≠0 的作用：切空间的每个方向都真能沿曲面走出去`],
      [`φ(t) = f(γ(t)) 在 t=0 取局部极小（因 γ(t) 全在 S 上），一元费马定理给 φ'(0)=0`, `x* 在 S 上最优 ⇒ 沿 S 内任何路径 t=0 都是极小`],
      [`链式：φ'(0) = ∇f(x*)·v = 0 对所有 v ∈ T`, `∇f 与整个切空间正交`],
      [`T 是 ∇g 的正交补（T = ∇g^⊥），∇f ⊥ T ⇒ ∇f ∈ (T)^⊥ = span{∇g}`, `n 维空间里，与 n-1 维子空间正交的向量只能落在它的一维法线上（正交补的正交补是自身）`],
      [`所以 ∇f(x*) = λ∇g(x*)，λ 是某个实数`, `共线就是成比例；λ 可正可负可零`],
      [`λ 的意义：把约束改为 g=c，最优值 f*(c) 满足 df*/dc = λ`, `对 f(x*(c)) 用链式：∇f·dx*/dc = λ∇g·dx*/dc = λ·d(g)/dc = λ`],
      [`多个约束 g_1…g_k：T = ∩ ∇g_j^⊥，同理 ∇f ∈ span{∇g_1,…,∇g_k} = Σ λ_j ∇g_j`, `正交补的正交补 = 张成空间；每个约束一个乘子`]
    ],
    end:`在约束曲面上最优 ⇔ 目标梯度没有「沿曲面」的分量 ⇔ 梯度只剩法向 ⇔ 与约束梯度共线。SVM 的对偶、PCA 的单位向量约束、熵最大化，全是这一句话。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 约束极值：min f=x^2+2y^2  s.t. g=x+y-1=0。验证最优点 ∇f ∥ ∇g
f = lambda p: p[0]**2 + 2*p[1]**2
gf= lambda p: np.array([2*p[0], 4*p[1]])
gg= np.array([1.0,1.0])
# 解析：2x=λ, 4y=λ, x+y=1 -> x=2/3, y=1/3, λ=4/3
# 数值：在约束线上暴力找最小
xs=np.linspace(-2,3,5000001); ys=1-xs
i=np.argmin(xs**2+2*ys**2); p=np.array([xs[i],ys[i]])
print(f"grid argmin on line: {np.round(p,5)} f={f(p):.6f} (analytic 2/3,1/3, f=2/3)")
g=gf(p); lam=g[0]/gg[0]
print(f"grad f={np.round(g,5)} = λ·grad g, λ={lam:.5f} (analytic 4/3), residual={np.abs(g-lam*gg).max():.1e}")
# 非最优点：梯度沿约束方向有分量 -> 还能改进
q=np.array([0.2,0.8]); t=np.array([1,-1])/np.sqrt(2)      # 约束线的切向
print(f"at {q}: D_t f={gf(q)@t:+.4f} (nonzero); at optimum: {gf(p)@t:+.1e}")`,
    out:`grid argmin on line: [0.66667 0.33333] f=0.666667 (analytic 2/3,1/3, f=2/3)
grad f=[1.33333 1.33333] = λ·grad g, λ=1.33333 (analytic 4/3), residual=2.0e-06
at [0.2 0.8]: D_t f=-1.9799 (nonzero); at optimum: +1.4e-06`,
    note:`grad f = λ·grad g（λ=4/3）是第 6 步；非最优点沿约束切向的方向导数 -1.98 ≠ 0 而最优点 ≈ 0，就是第 4 步「∇f ⊥ 切空间」。`
  },
  contrast:[
    {vs:`无约束极值 ∇f=0`, same:`都是「不能再改进」`, diff:`无约束要求所有方向斜率为零；有约束只要求切空间内斜率为零，∇f 可以不为零`, when:`λ=0 时退化为无约束；λ≠0 说明约束真的卡住了`},
    {vs:`KKT 条件（不等式约束）`, same:`都用乘子`, diff:`等式约束 λ 无符号限制；不等式 g≤0 要求 λ≥0 且互补松弛 λg=0（约束不紧时乘子为零）`, when:`等式用拉格朗日；不等式（SVM 的间隔约束）用 KKT`},
    {vs:`罚函数法 f + μg²`, same:`都把约束并进目标`, diff:`罚函数是近似（μ→∞ 才精确）；乘子法精确但要解方程组`, when:`数值优化常用罚函数/增广拉格朗日；解析推导用乘子`},
    {vs:`代入消元`, same:`都解带约束的极值`, diff:`消元要能把约束显式解出一个变量；乘子法不需要，且保持对称性`, when:`约束简单（x+y=10）可消元；约束是 |w|=1 这种用乘子`}
  ],
  ext:[
    {t:`不等式约束 → KKT，SVM 对偶的来源`, go:'op.kkt'},
    {t:`约束优化的通用框架与对偶`, go:'op.constraint_lagrange'},
    {t:`PCA：max wᵀΣw s.t. |w|=1，乘子就是特征值`, go:'ml.pca'}
  ]
},

'ca.integration_tricks': {
  layers:{
    alg:`换元 ∫f(g(x))g'(x)dx = ∫f(u)du，u=g(x)，定积分上下限跟着换。分部 ∫u dv = uv - ∫v du。前者是链式倒用，后者是乘积倒用。`,
    geo:`换元 = 把弯的坐标轴拉直，密度 g'(x) 是拉伸系数，面积不变。分部 = 矩形 uv 的面积减去「另一半」：∫u dv 和 ∫v du 拼成 uv。`,
    comp:`机器不做符号积分：黎曼和 / 辛普森直接算。换元在数值上是重要性采样（改变采样密度）；分部在概率里给出 E[X] = ∫S(t)dt。`
  },
  proof:{
    from:`链式法则 (F∘g)' = F'(g)·g'；乘积法则 (uv)' = u'v + uv'；FTC ∫_a^b φ' = φ(b) - φ(a)`,
    to:`换元公式与分部积分公式（定积分形式）`,
    steps:[
      [`设 F 是 f 的原函数（F'=f）。链式：(F(g(x)))' = f(g(x))g'(x)`, `复合函数求导，外层 F 的导数是 f`],
      [`两边从 a 到 b 积分，左边用 FTC：∫_a^b f(g(x))g'(x)dx = F(g(b)) - F(g(a))`, `导数的定积分等于端点值之差`],
      [`右边又等于 ∫_{g(a)}^{g(b)} f(u)du（再用一次 FTC）`, `F 在 u 变量下仍是 f 的原函数；这一步解释了上下限为什么要换成 g(a)、g(b)`],
      [`合并得换元公式。g' 是「x 每动一点 u 动多少」的密度，dx 换 du 就要乘它`, `几何：拉伸坐标后每个小条宽度变了 g' 倍，高度不变，面积守恒`],
      [`分部：(uv)' = u'v + uv'，两边从 a 到 b 积分：uv|_a^b = ∫u'v + ∫uv'`, `乘积法则 + FTC`],
      [`移项：∫_a^b u v' dx = uv|_a^b - ∫_a^b u' v dx`, `就是 ∫u dv = uv - ∫v du；把导数从 v 搬到 u`],
      [`用法判据：搬完后 ∫u'v 要比 ∫uv' 简单。多项式求导降次、e^x 和三角不变，所以多项式当 u`, `LIATE 顺序（对数、反三角、代数、三角、指数）就是「谁求导后变简单谁当 u」`],
      [`概率应用：E[X] = ∫_0^∞ x p(x)dx，令 u=x、dv=p dx、v=-S(x)（S 是生存函数），得 E[X] = ∫_0^∞ S(x)dx`, `边界项 xS(x)→0（若期望存在）；平均生存时间 = 生存曲线下面积`]
    ],
    end:`只有两条求导法则能倒着用：链式倒过来是换元，乘积倒过来是分部。其余积分技巧（三角代换、有理分式、伽马函数）都是这两条加代数。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 换元 = 链式倒过来；分部 = 乘积倒过来。都用黎曼和验证
def integ(f,a,b,N=200000):
    x=a+(np.arange(N)+0.5)*(b-a)/N; return np.sum(f(x))*(b-a)/N
# 换元：∫_0^1 2x/(1+x^2) dx = ∫_1^2 du/u = ln2
print(f"subst: {integ(lambda x:2*x/(1+x**2),0,1):.6f}  ln2={np.log(2):.6f}")
# 分部：∫_0^2 x e^x dx = [x e^x]_0^2 - ∫_0^2 e^x dx = 2e^2-(e^2-1) = e^2+1
print(f"parts: {integ(lambda x:x*np.exp(x),0,2):.6f}  e^2+1={np.e**2+1:.6f}")
# 分部的来源：∫(uv)' = uv，两边拆开
u,du = lambda x:x, lambda x:1.0+0*x; v,dv = np.exp, np.exp
lhs = integ(lambda x:du(x)*v(x)+u(x)*dv(x),0,2); rhs = u(2)*v(2)-u(0)*v(0)
print(f"∫(uv)'={lhs:.6f}  uv|_0^2={rhs:.6f}")`,
    out:`subst: 0.693147  ln2=0.693147
parts: 8.389056  e^2+1=8.389056
∫(uv)'=14.778112  uv|_0^2=14.778112`,
    note:`subst 行是第 2-3 步（换元后 ∫_1^2 du/u = ln2）；parts 行是第 6 步；最后一行 ∫(uv)' = uv|_0^2 直接验证第 5 步的出发点。`
  },
  contrast:[
    {vs:`换元 vs 分部`, same:`都是求导法则倒用`, diff:`换元处理「复合 × 内导」结构，分部处理「两类函数相乘」结构`, when:`看到 f(g)·g' 换元；看到 x·e^x、x·ln x 分部；都不像就先化简`},
    {vs:`不定积分的换元`, same:`同一个公式`, diff:`不定积分换元最后要换回 x；定积分换元只换上下限，不换回`, when:`定积分别换回 x，直接用新上下限算`},
    {vs:`重要性采样`, same:`都是换积分变量`, diff:`换元是精确恒等；重要性采样是用另一分布采样再乘密度比，蒙特卡洛近似`, when:`高维积分没法解析时用重要性采样，密度比就是 g' 的概率版`},
    {vs:`数值积分（辛普森）`, same:`都算定积分`, diff:`符号技巧给闭式；数值积分给数字，不需要原函数`, when:`要闭式（推公式、求分布函数）用技巧；只要一个数用数值`}
  ],
  ext:[
    {t:`一室模型 AUC = ∫C dt，多室/吸收相用换元和分部推 AUC 公式`, go:'bm.pk_ode'},
    {t:`平均生存时间 = 生存曲线下面积（分部积分推出）`, go:'bm.survival'},
    {t:`期望是加权积分，分部给出 E[X] = ∫S`, go:'pr.expectation'}
  ]
}

});
