// data/derive_it.js —— 信息论大陆 · 推导层（9 节点）
// 契约：CONTRACT3.md。旁挂，不改 v1/v2 文件。scratch 全部用 python3 + numpy 2.3 实际跑过。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

/* ================================================================== */
'it.surprisal': {
  layers:{
    alg:`I(p)=−log p。它是三条公理的唯一解：连续、随 p 单调减、独立事件可加 I(pq)=I(p)+I(q)。底数只定单位：log₂ 是 bit，ln 是 nat。`,
    geo:`把 [0,1] 上的概率轴对数拉伸：p 每减半，I 加 1。p=1 落在 0，p→0 冲向无穷。信息量是"惊讶"的刻度尺，等距刻度对应等比概率。`,
    comp:`分类模型的 loss 只是 −log q(真类)：一条样本的惊讶度。数值上永远用 log_softmax 从 logits 直接算，别先 softmax 再 log；概率被 clip 到 ≥1e−7 就是为了防 I=∞。`
  },
  proof:{
    from:`三条公理：(A1) I(p) 在 (0,1] 上连续；(A2) p 越小 I 越大；(A3) 独立事件 I(p·q)=I(p)+I(q)`,
    to:`满足三条公理的函数只有 I(p)=−k·log p，k>0；取 k=1/ln2 得 bit`,
    steps:[
      [`换元 p=e^{−x}（x≥0），令 g(x)=I(e^{−x})。A3 变为 g(x+y)=g(x)+g(y)`,`独立事件概率相乘，取对数后相加；换元把"乘法上的可加"变成"加法上的可加"，即 Cauchy 函数方程`],
      [`对正整数 n：g(nx)=n·g(x)；令 x=1/n 得 g(1/n)=g(1)/n；故对有理数 m/n：g(m/n)=(m/n)·g(1)`,`把 nx 拆成 n 个 x 相加反复用方程；这一步只用代数，没有用连续性。所有有理点上 g 已被 g(1) 完全决定`],
      [`A1 连续 + 有理数稠密 ⇒ 对所有实数 x≥0 有 g(x)=c·x，c=g(1)`,`连续函数在稠密集上相等则处处相等。没有连续性会有病态解（Hamel 基构造），连续性正是排除它们的那条公理`],
      [`换回来：I(p)=g(−ln p)=−c·ln p`,`p=e^{−x} ⇒ x=−ln p。函数形式至此唯一：只能是对数`],
      [`A2 单调减 ⇒ c>0（记 k）。I(1)=0 自动成立`,`−ln p 随 p 减小而增大，要 I 也增大就要 c>0；p=1 时 ln 1=0，"必然事件零信息"不需要额外公理`],
      [`单位：k=1/ln2 时 I(p)=−log₂p，公平硬币 I(½)=1 bit；I(1/8)=3 bit = 三次是非题`,`−log₂(1/8)=3；对 8 个等可能结果，二分法恰好问 3 次。bit 的操作意义就是"一次公平的是非题"`],
      [`验证唯一性的反面：1/p 满足单调但 (1/pq)≠1/p+1/q；1−p 满足单调与 I(1)=0 但不可加。所以可加性是把形式钉死为对数的那条公理`,`公理系统里每条都在排除一族候选：A3 排除所有非对数形，A1 排除病态解，A2 定符号`]
    ],
    end:`−log p 不是选择，是公理的唯一解：想让独立事件的信息相加，就只能用对数。交叉熵、码长、似然全从这一步长出来。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
I = lambda p: -np.log2(p)
p, q = np.random.rand(1000), np.random.rand(1000)
cands = {'-log2 p': I, '1/p': lambda p: 1/p, '1-p': lambda p: 1-p, 'sqrt(-log p)': lambda p: np.sqrt(-np.log(p))}
for name, fn in cands.items():
    add = np.allclose(fn(p*q), fn(p)+fn(q)); mono = bool(np.all(np.diff(fn(np.linspace(0.01, 1, 100))) < 0))
    print(f'{name:>12}: 可加 {str(add):<5} 单调减 {str(mono):<5} I(1)={fn(1.0):.2f}')
# 步骤2-3：只用可加性，g(m/n) 必为 (m/n)g(1)。用一个"未知"的可加函数（例如以 3 为底）检验
g = lambda x: np.log(x)/np.log(3)          # 任何可加函数
print('g(2^7)/g(2) =', round(g(2**7)/g(2), 6), ' (=7)   g(2^(1/4))/g(2) =', round(g(2**0.25)/g(2), 6), ' (=1/4)')
# bit 的操作含义
print('I(1/2)=', I(0.5), 'bit  I(1/8)=', I(1/8), 'bit  三枚硬币独立: I(1/2)*3 =', 3*I(0.5), '= I(1/8)')
print('I(p) 当 p->0:', [f'{I(10.0**-k):.1f}' for k in [1,3,6,9]], ' -> 无穷；模型输出精确 0 会让 loss 爆掉')`,
    out:`     -log2 p: 可加 True  单调减 True  I(1)=-0.00
         1/p: 可加 False 单调减 True  I(1)=1.00
         1-p: 可加 False 单调减 True  I(1)=0.00
sqrt(-log p): 可加 False 单调减 True  I(1)=-0.00
g(2^7)/g(2) = 7.0  (=7)   g(2^(1/4))/g(2) = 0.25  (=1/4)
I(1/2)= 1.0 bit  I(1/8)= 3.0 bit  三枚硬币独立: I(1/2)*3 = 3.0 = I(1/8)
I(p) 当 p->0: ['3.3', '10.0', '19.9', '29.9']  -> 无穷；模型输出精确 0 会让 loss 爆掉`,
    note:`第一段是第 7 步：四个候选里只有对数同时满足三条；第二段是第 2 步（任意可加函数在有理点上被 g(1) 决定）；第三段是第 6 步 bit 的操作意义与三枚硬币可加。`
  },
  contrast:[
    {vs:`熵 H(X)`,same:`都用 −log p`,diff:`信息量是对一个事件说的；熵是信息量对整个分布的期望`,when:`算一条样本的 loss 是信息量；算一个分布的不确定性是熵`},
    {vs:`似然 p(x|θ)`,same:`负对数似然 = 惊讶度`,diff:`似然把数据固定看参数；信息量把分布固定看事件`,when:`训练模型时两者是同一个数，只是视角不同`},
    {vs:`概率的倒数 1/p`,same:`都随 p 减小而增大、都度量"罕见程度"`,diff:`1/p 在独立事件下相乘不相加，没有"总信息 = 各自信息之和"的性质`,when:`要可加的度量（编码、loss 求和）只能用 −log p`},
    {vs:`p 值`,same:`都是"看到这个结果有多意外"`,diff:`p 值是尾概率（比观测更极端的总概率），不是单点概率；也不可加`,when:`假设检验用 p 值；编码与学习用 −log p`}
  ],
  ext:[
    {t:`对信息量取期望就是熵`,go:`it.entropy`},
    {t:`信息量 = 最优码长：−log₂p 就是该符号应分配的比特数`,go:`it.code_length`},
    {t:`为什么乘法变加法：对数的定义`,go:`al.exp_log`},
    {t:`分类 loss 就是真类的惊讶度`,go:`dl.loss`}
  ]
},

/* ================================================================== */
'it.entropy': {
  layers:{
    alg:`H(p)=−Σpᵢ log pᵢ=E[−log p]。在单纯形 Σpᵢ=1 上做拉格朗日，驻点是 pᵢ 全相等；也可写 H(p)=log n − KL(p‖均匀)，KL≥0 直接给出 H ≤ log n。`,
    geo:`单纯形上的一座圆顶：中心（均匀）最高 log n，顶点（确定事件）为 0。二元熵是 [0,1] 上以 ½ 为顶的对称弧。`,
    comp:`np.sum(-p*np.log2(p)) 记得处理 p=0（约定 0·log0=0）。熵的操作版本：对均匀 8 类二分法问 3 次；对非均匀分布用霍夫曼树，平均深度 ≈ H。`
  },
  proof:{
    from:`熵定义 H(p)=−Σpᵢ ln pᵢ（信息量的期望）；约束 Σpᵢ=1，pᵢ≥0；不等式 ln x ≤ x−1`,
    to:`H(p) ≤ ln n，等号当且仅当 p 均匀；H ≥ 0；H 是 p 的凹函数`,
    steps:[
      [`拉格朗日：L=−Σpᵢ ln pᵢ − μ(Σpᵢ−1)，∂L/∂pᵢ=−ln pᵢ−1−μ=0 ⇒ ln pᵢ=−1−μ 对所有 i 相同`,`等式约束下的极值条件是目标梯度与约束梯度平行；约束梯度是全 1 向量，所以目标的每个偏导必须相等，逼出 pᵢ 全等`],
      [`代回约束 Σpᵢ=1 得 pᵢ=1/n，此时 H=ln n`,`n 个相等的数和为 1，每个是 1/n；−Σ(1/n)ln(1/n)=ln n`],
      [`这个驻点是最大而非最小：Hessian ∂²H/∂pᵢ∂pⱼ=−δᵢⱼ/pᵢ 负定，H 严格凹`,`−p ln p 的二阶导是 −1/p<0，每个坐标都凹，和也凹；凹函数的驻点是全局最大且唯一`],
      [`另一条更短的路：H(p)=−Σpᵢ ln pᵢ = ln n − Σpᵢ ln(pᵢ/(1/n)) = ln n − KL(p‖u)，u 为均匀分布`,`把 ln pᵢ 拆成 ln(1/n)+ln(pᵢ·n)，第一项求和给 ln n（因为 Σpᵢ=1），第二项正是 KL 的定义`],
      [`Gibbs：−KL(p‖u)=Σpᵢ ln(uᵢ/pᵢ) ≤ Σpᵢ(uᵢ/pᵢ−1)=Σuᵢ−Σpᵢ=0，故 KL≥0 ⇒ H ≤ ln n`,`ln x ≤ x−1 逐项放缩；等号当且仅当每个 uᵢ/pᵢ=1 即 p=u。不用求导就得到最大值与唯一性`],
      [`H ≥ 0：每项 −pᵢ ln pᵢ ≥ 0（0≤pᵢ≤1），等号当且仅当某个 pᵢ=1`,`概率不超过 1，对数非正，乘负号非负。熵为 0 ⇔ 确定事件 ⇔ 不需要问任何问题`],
      [`操作意义：均匀 2^k 个结果，二分法问 k=log₂n 次，恰是熵。非均匀时把常见结果放浅层可少问，霍夫曼平均深度落在 [H, H+1)`,`每问一次是非题最多把候选集减半，信息最多 1 bit；平均问 H 次是下界（it.code_length 的 Kraft 论证），霍夫曼达到上界 H+1`]
    ],
    end:`熵是惊讶的平均。均匀最大不是直觉，是拉格朗日或 Gibbs 不等式的一行结论；它同时是"平均最少要问几个是非题"，这一操作意义把熵和编码钉在一起。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
def H(p):
    p = np.asarray(p, float); p = p[p > 0]; return float(-np.sum(p*np.log2(p)))
n = 6
ps = np.random.dirichlet(np.ones(n), 20000)
Hs = np.array([H(p) for p in ps]); u = np.full(n, 1/n)
print(f'20000 个随机分布: 最大熵 {Hs.max():.4f} < log2(6)={np.log2(6):.4f}   均匀分布熵 {H(u):.4f}')
KL = lambda p, q: float(np.sum(p*np.log2(p/q)))
p = ps[0]
print(f'H(p) = {H(p):.6f}   log2 n - KL(p||u) = {np.log2(n)-KL(p,u):.6f}   KL>=0: {KL(p,u)>=0}')
# 凹性：弦在下
a, b = ps[1], ps[2]; lam = 0.3
print('凹: H(0.3a+0.7b) >= 0.3H(a)+0.7H(b):', H(lam*a+(1-lam)*b) >= lam*H(a)+(1-lam)*H(b))
# 操作意义：平均要问几个是非题（霍夫曼树的平均深度）
import heapq
def huffman_avg_depth(p):
    h = [(pi, i, 0) for i, pi in enumerate(p)]; heapq.heapify(h); total = 0.0; cnt = 0
    while len(h) > 1:
        a = heapq.heappop(h); b = heapq.heappop(h); total += a[0]+b[0]; cnt += 1
        heapq.heappush(h, (a[0]+b[0], n+cnt, 0))
    return total                              # 内部节点权重和 = 平均深度
for p in [np.full(8, 1/8), np.array([.5,.25,.125,.0625,.03125,.015625,.0078125,.0078125]), np.array([.9,.05,.02,.01,.01,.005,.0025,.0025])]:
    print(f'H={H(p):.3f} bit   霍夫曼平均问题数={huffman_avg_depth(p):.3f}   落在 [H, H+1): {H(p) <= huffman_avg_depth(p) < H(p)+1}')`,
    out:`20000 个随机分布: 最大熵 2.5814 < log2(6)=2.5850   均匀分布熵 2.5850
H(p) = 2.540467   log2 n - KL(p||u) = 2.540467   KL>=0: True
凹: H(0.3a+0.7b) >= 0.3H(a)+0.7H(b): True
H=3.000 bit   霍夫曼平均问题数=3.000   落在 [H, H+1): True
H=1.984 bit   霍夫曼平均问题数=1.984   落在 [H, H+1): True
H=0.680 bit   霍夫曼平均问题数=1.215   落在 [H, H+1): True`,
    note:`随机分布熵都低于 log₂n 且均匀取到，是第 1-3、5 步；H = log n − KL 一行是第 4 步的恒等式；凹性一行是第 3 步；霍夫曼平均深度落在 [H,H+1) 是第 7 步的操作意义。`
  },
  contrast:[
    {vs:`方差`,same:`都度量"分散程度"`,diff:`熵只看概率不看取值，把 6 换成 10⁶ 熵不变；方差看取值距离`,when:`离散符号、编码、分类不确定性用熵；连续量的波动用方差`},
    {vs:`微分熵 −∫f ln f`,same:`形式一样`,diff:`微分熵可以为负、随坐标缩放改变、没有"最少问几个问题"的含义`,when:`连续变量只能比较两个微分熵的差（如 KL、互信息），别单独解释其值`},
    {vs:`交叉熵 H(p,q)`,same:`都是 −Σp log(·)`,diff:`熵里 log 的是 p 自己（最优码），交叉熵 log 的是 q（用错的码），H(p,q)=H(p)+KL≥H(p)`,when:`描述数据本身用熵；训练模型（p 是数据，q 是模型）用交叉熵`},
    {vs:`基尼不纯度 1−Σp²`,same:`都是决策树的分裂指标，都在均匀时最大、确定时为 0`,diff:`基尼是 −Σp log p 的一阶近似（ln p ≈ p−1），不需要 log，没有编码含义`,when:`CART 用基尼求快；ID3/C4.5 用信息增益`}
  ],
  ext:[
    {t:`交叉熵与 KL：用错分布多付的 bit`,go:`it.cross_entropy`},
    {t:`矩约束下的最大熵：均匀只是"无约束"的特例`,go:`it.max_entropy`},
    {t:`熵作为最优平均码长的下界`,go:`it.code_length`},
    {t:`决策树用信息增益选分裂`,go:`ml.tree`}
  ]
},

/* ================================================================== */
'it.cross_entropy': {
  layers:{
    alg:`H(p,q)=−Σp log q=H(p)+KL(p‖q)。Gibbs 不等式 KL≥0 给出 H(p,q)≥H(p)，等号仅当 q=p。分类中 p 是 one-hot，H(p,q)=−log q_y。对 logits 的梯度是 softmax(z)−p。`,
    geo:`H(p) 是地板，H(p,q) 是你踩的高度，KL 是脚下的垫子厚度。训练把 q 往 p 推，垫子变薄，地板 H(p) 是数据本身的噪声，永远压不下去。`,
    comp:`logits z → log_softmax(z)=z−logsumexp(z) → 取真类 → 取负 → 求平均。一次 logsumexp 用 max 平移防溢出。梯度 softmax−onehot 一行代码，不用链式展开。`
  },
  proof:{
    from:`真分布 p、模型分布 q（同支撑）；不等式 ln x ≤ x−1（等号仅 x=1）；softmax qᵢ=e^{zᵢ}/Σe^{zⱼ}`,
    to:`H(p,q)=H(p)+KL(p‖q) ≥ H(p)，等号当且仅当 q=p；最小化交叉熵 ⇔ 最小化 KL ⇔ 最大似然；∂H(p,q)/∂z=q−p`,
    steps:[
      [`拆分：−Σpᵢ ln qᵢ = −Σpᵢ ln pᵢ + Σpᵢ ln(pᵢ/qᵢ) = H(p)+KL(p‖q)`,`在 ln qᵢ 里加减 ln pᵢ：ln qᵢ=ln pᵢ−ln(pᵢ/qᵢ)。恒等变形，没有任何不等式`],
      [`Gibbs：−KL(p‖q)=Σpᵢ ln(qᵢ/pᵢ) ≤ Σpᵢ(qᵢ/pᵢ−1)=Σqᵢ−Σpᵢ=1−1=0`,`对每一项用 ln x ≤ x−1，x=qᵢ/pᵢ；pᵢ≥0 保证不等号方向不变。两边都是归一化分布，右边恰为 0`],
      [`等号条件：ln x=x−1 仅当 x=1，故 KL=0 ⇔ 所有 qᵢ=pᵢ`,`严格凹的 ln 与其在 x=1 处的切线只在切点接触。所以交叉熵的下界 H(p) 只有 q 完全命中 p 才能取到`],
      [`因此 argmin_q H(p,q)=argmin_q KL(p‖q)=p；H(p) 与 q 无关，是不可约的地板`,`第 1 步把 H(p,q) 分成"只依赖 p"和"依赖 q 的非负项"，优化 q 时前者是常数`],
      [`p 取经验分布（每个样本 1/N）：H(p̂,q)=−(1/N)Σₙ ln q(xₙ)=−(1/N)·对数似然。最小化交叉熵 = 最大似然`,`经验分布把求和变成对样本平均；对数似然就是每个样本 ln q 之和。三个名字（交叉熵、KL、MLE）同一个目标`],
      [`one-hot 情形 p=e_y：H(p,q)=−ln q_y，只看真类概率`,`其他类 pᵢ=0 使对应项消失。其他类只通过 softmax 归一化间接影响 q_y`],
      [`对 logits 求导：ln q_y=z_y−ln Σe^{zⱼ}，∂/∂zₖ(−ln q_y)=−δ_{ky}+e^{zₖ}/Σe^{zⱼ}=qₖ−pₖ`,`logsumexp 的梯度就是 softmax；δ 项来自 z_y。梯度 = 预测 − 目标，这也是为什么交叉熵配 softmax 不会有 sigmoid+MSE 那种梯度饱和`]
    ],
    end:`交叉熵 = 熵 + KL。地板 H(p) 是数据的噪声，训练只能削 KL；Gibbs 不等式保证削到 0 时 q=p。梯度 q−p 让它成为分类的默认损失。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
H  = lambda p: -np.sum(p*np.log2(p))
CE = lambda p, q: -np.sum(p*np.log2(q))
KL = lambda p, q: np.sum(p*np.log2(p/q))
n = 5; ok_ineq = ok_id = True; worst = 0
for _ in range(5000):
    p, q = np.random.dirichlet(np.ones(n)), np.random.dirichlet(np.ones(n))
    ok_ineq &= CE(p,q) >= H(p) - 1e-12
    ok_id   &= abs(CE(p,q) - (H(p)+KL(p,q))) < 1e-12
    worst = max(worst, abs(CE(p,q) - (H(p)+KL(p,q))))
print('5000 组随机 (p,q): CE>=H 全成立', ok_ineq, '  CE == H+KL 全成立', ok_id, f' 最大恒等式误差 {worst:.1e}')
p = np.random.dirichlet(np.ones(n))
print(f'q=p 时: CE={CE(p,p):.6f}  H={H(p):.6f}  KL={KL(p,p):.1e}')
# 沿 q 从随机走向 p，CE 单调降到 H
q0 = np.random.dirichlet(np.ones(n))
print('CE 随 q->p:', [f'{CE(p,(1-t)*q0+t*p):.4f}' for t in [0, .25, .5, .75, 1]], ' 地板 H =', f'{H(p):.4f}')
# 第 5 步：经验分布上的交叉熵 = 负平均对数似然
xs = np.random.choice(n, 200, p=p); q = np.random.dirichlet(np.ones(n))
p_hat = np.bincount(xs, minlength=n)/200
print(f'经验分布交叉熵 {CE(p_hat,q):.6f}   负平均对数似然 {-np.mean(np.log2(q[xs])):.6f}')
# 第 7 步：softmax 交叉熵对 logits 的梯度 = q - p（与数值微分对比）
z = np.random.randn(n); y = 2; onehot = np.eye(n)[y]
def loss(z): return -(z[y] - np.log(np.sum(np.exp(z))))
sm = np.exp(z)/np.exp(z).sum(); num = np.array([(loss(z+1e-6*np.eye(n)[k]) - loss(z-1e-6*np.eye(n)[k]))/2e-6 for k in range(n)])
print('解析梯度 q-p:', (sm-onehot).round(5), ' 数值梯度:', num.round(5), ' 一致:', np.allclose(sm-onehot, num, atol=1e-6))`,
    out:`5000 组随机 (p,q): CE>=H 全成立 True   CE == H+KL 全成立 True  最大恒等式误差 1.8e-15
q=p 时: CE=1.600854  H=1.600854  KL=0.0e+00
CE 随 q->p: ['2.7105', '2.2719', '1.9745', '1.7524', '1.6009']  地板 H = 1.6009
经验分布交叉熵 3.024699   负平均对数似然 3.024699
解析梯度 q-p: [ 0.23384  0.17035 -0.90072  0.15799  0.33854]  数值梯度: [ 0.23384  0.17035 -0.90072  0.15799  0.33854]  一致: True`,
    note:`前两行是第 1-3 步（恒等式 + Gibbs 不等式 + 等号条件）；q→p 单调是第 4 步；经验分布行是第 5 步（交叉熵 = 负对数似然）；最后一行是第 7 步的梯度 q−p。`
  },
  contrast:[
    {vs:`KL 散度`,same:`对 q 优化时完全等价（差一个常数 H(p)）`,diff:`交叉熵含地板 H(p)，数值不能到 0；KL 可以到 0`,when:`报告"模型离真相多远"用 KL；写训练目标用交叉熵（不需要知道 H(p)）`},
    {vs:`均方误差 MSE`,same:`都是把预测推向目标的损失`,diff:`MSE 对应高斯噪声假设的似然；交叉熵对应类别分布的似然，且配 softmax 梯度 q−p 不饱和`,when:`回归用 MSE；分类用交叉熵`},
    {vs:`负对数似然 NLL`,same:`数值上相同`,diff:`NLL 站在参数一侧、对样本求和；交叉熵站在分布一侧、对 p 求期望`,when:`PyTorch 里 CrossEntropyLoss = log_softmax + NLLLoss，两个名字一件事`},
    {vs:`反向交叉熵 H(q,p)`,same:`形式对称`,diff:`H(q,p)=−Σq log p 在 p 是 one-hot 时为无穷（log 0），不能做损失`,when:`对称的 KL/JS 散度在 GAN 里用；监督学习只用 H(p,q)`}
  ],
  ext:[
    {t:`KL 的非负性、不对称性与方向选择`,go:`it.kl`},
    {t:`交叉熵最小化 = 最大似然`,go:`pr.mle`},
    {t:`分类损失：softmax + 交叉熵的工程细节`,go:`dl.loss`},
    {t:`压缩视角：用错码表多付的 bit`,go:`it.compression`}
  ]
},

/* ================================================================== */
'it.kl': {
  layers:{
    alg:`KL(p‖q)=Σp log(p/q)=E_p[log p − log q]。Jensen（ln 凹）给 KL≥0；p、q 位置不对称；独立乘积上可加。前向 KL(p‖q) 对 q 的零处 p>0 罚无穷（mean-seeking），反向 KL(q‖p) 相反（mode-seeking）。`,
    geo:`不是距离：从 p 看 q 与从 q 看 p 的"路程"不同。p 有质量而 q 没有的地方是无底洞（∞）。前向 KL 让 q 铺开盖住 p 的所有峰；反向 KL 让 q 缩进一个峰里。`,
    comp:`np.sum(p*(np.log(p)−np.log(q)))，p=0 的项约定为 0，q=0 且 p>0 给 ∞。VAE 里高斯对标准正态有闭式 ½Σ(μ²+σ²−1−ln σ²)。永远说清是 KL(p‖q) 还是 KL(q‖p)。`
  },
  proof:{
    from:`KL(p‖q)=Σᵢpᵢ ln(pᵢ/qᵢ)；Jensen 不等式：φ 凹时 E[φ(X)] ≤ φ(E[X])；ln 严格凹`,
    to:`KL≥0 且等号仅当 p=q；KL 不对称（有具体反例）、不满足三角不等式；独立分布上可加；前向/反向 KL 行为相反`,
    steps:[
      [`写成期望：−KL(p‖q)=Σpᵢ ln(qᵢ/pᵢ)=E_p[ln(q/p)]`,`把求和看作在 p 下对随机变量 X=q(x)/p(x) 取期望，为用 Jensen 铺路`],
      [`Jensen（ln 凹）：E_p[ln(q/p)] ≤ ln E_p[q/p]=ln Σᵢpᵢ(qᵢ/pᵢ)=ln Σᵢqᵢ ≤ ln 1=0`,`凹函数的期望不超过期望的函数值；pᵢ 约掉后剩 Σqᵢ，q 是分布所以 ≤1（若 q 只在 p 支撑上求和，可能 <1）。故 KL≥0`],
      [`等号条件：ln 严格凹 ⇒ Jensen 取等当且仅当 q/p 几乎处处为常数；又 Σq=Σp=1 ⇒ 常数为 1 ⇒ p=q`,`严格凹函数只有在随机变量退化为常数时 Jensen 才取等。这一步给出"KL=0 当且仅当两分布相同"`],
      [`不对称反例：p=(½,½)，q=(0.9,0.1)。KL(p‖q)=½ln(½/0.9)+½ln(½/0.1)≈0.51 nat，KL(q‖p)=0.9ln(1.8)+0.1ln(0.2)≈0.37 nat`,`直接代数。两个方向差 40%，所以 KL 不是距离；再加 q=(1,0) 时 KL(p‖q)=∞ 而 KL(q‖p)=ln 2 有限，不对称可以是无穷对有限`],
      [`三角不等式也不成立：可构造 p,q,r 使 KL(p‖r) > KL(p‖q)+KL(q‖r)`,`KL 是 f-散度不是度量；它的平方根都不是度量。想要度量用 JS 散度的平方根或 Wasserstein`],
      [`可加性：p=p₁⊗p₂，q=q₁⊗q₂ 时 KL(p‖q)=KL(p₁‖q₁)+KL(p₂‖q₂)`,`ln(p₁p₂/(q₁q₂))=ln(p₁/q₁)+ln(p₂/q₂)，对乘积分布求期望时边缘化掉另一个变量。这是"信息可加"公理在散度上的体现`],
      [`方向的行为：前向 KL(p‖q)=E_p[…] 在 p>0、q≈0 处罚无穷 ⇒ q 必须覆盖 p 的全部支撑（mean-seeking）；反向 KL(q‖p)=E_q[…] 只在 q>0 处计分 ⇒ q 可以缩到 p 的一个峰（mode-seeking）`,`权重来自哪个分布决定哪里被惩罚。最大似然是前向（模型摊平覆盖所有模式），变分推断/VAE 是反向（后验近似缩进一个峰），用错方向多模态数据就糊或塌`]
    ],
    end:`KL≥0 是 Jensen 的一行，KL 不对称是定义的直接后果。它是"用 q 当 p 的模型每样本多付的 nat"，不是距离；选方向就是选"宁可糊、还是宁可漏"。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
def KL(p, q):
    p, q = np.asarray(p, float), np.asarray(q, float); m = p > 0
    return np.inf if np.any(q[m] == 0) else float(np.sum(p[m]*np.log(p[m]/q[m])))
n = 6; vals = [KL(np.random.dirichlet(np.ones(n)), np.random.dirichlet(np.ones(n))) for _ in range(5000)]
print(f'5000 组随机 KL: 最小 {min(vals):.2e} (>=0)   KL(p||p)={KL(np.ones(n)/n, np.ones(n)/n):.1e}')
p, q = [.5, .5], [.9, .1]
print(f'不对称: KL(p||q)={KL(p,q):.4f} nat   KL(q||p)={KL(q,p):.4f} nat')
print(f'无穷 vs 有限: KL([.5,.5]||[1,0])={KL([.5,.5],[1,0])}   KL([1,0]||[.5,.5])={KL([1,0],[.5,.5]):.4f}')
# 三角不等式失败
p, q, r = np.array([.98,.01,.01]), np.array([.5,.25,.25]), np.array([.01,.495,.495])
print(f'三角: KL(p||r)={KL(p,r):.3f}  >  KL(p||q)+KL(q||r)={KL(p,q)+KL(q,r):.3f} :', KL(p,r) > KL(p,q)+KL(q,r))
# 可加性
p1, p2, q1, q2 = [np.random.dirichlet(np.ones(3)) for _ in range(4)]
print('可加: KL(p1⊗p2||q1⊗q2) - KL1 - KL2 =', f'{KL(np.outer(p1,p2).ravel(), np.outer(q1,q2).ravel()) - KL(p1,q1) - KL(p2,q2):.1e}')
# 方向：双峰 p，单峰高斯族 q，分别最小化前向与反向 KL
x = np.linspace(-8, 8, 1601); dx = x[1]-x[0]
g = lambda m, s: np.exp(-(x-m)**2/(2*s*s))/(s*np.sqrt(2*np.pi))*dx
P = 0.5*g(-3, 0.7) + 0.5*g(3, 0.7)
best_f = min(((KL(P, g(m,s)), m, s) for m in np.linspace(-4,4,41) for s in np.linspace(0.3,5,48)))
best_r = min(((KL(g(m,s), P), m, s) for m in np.linspace(-4,4,41) for s in np.linspace(0.3,5,48)))
print(f'双峰 p (峰在 ±3): 前向 KL(p||q) 最优 q: mu={best_f[1]:.1f} sigma={best_f[2]:.2f} (摊平盖住两峰)   反向 KL(q||p) 最优 q: mu={best_r[1]:.1f} sigma={best_r[2]:.2f} (缩进一个峰)')`,
    out:`5000 组随机 KL: 最小 6.90e-03 (>=0)   KL(p||p)=0.0e+00
不对称: KL(p||q)=0.5108 nat   KL(q||p)=0.3681 nat
无穷 vs 有限: KL([.5,.5]||[1,0])=inf   KL([1,0]||[.5,.5])=0.6931
三角: KL(p||r)=4.415  >  KL(p||q)+KL(q||r)=2.210 : True
可加: KL(p1⊗p2||q1⊗q2) - KL1 - KL2 = 8.9e-16
双峰 p (峰在 ±3): 前向 KL(p||q) 最优 q: mu=0.0 sigma=3.10 (摊平盖住两峰)   反向 KL(q||p) 最优 q: mu=-3.0 sigma=0.70 (缩进一个峰)`,
    note:`第一行是第 2、3 步；不对称与 ∞ 对有限是第 4 步；三角不等式失败是第 5 步；可加性是第 6 步；最后的双峰拟合是第 7 步：前向得到 μ=0 的宽高斯，反向得到贴住一个峰的窄高斯。`
  },
  contrast:[
    {vs:`交叉熵`,same:`H(p,q)=H(p)+KL(p‖q)，对 q 优化等价`,diff:`KL 是"多付的部分"，可以为 0；交叉熵含地板 H(p)`,when:`训练用交叉熵；比较分布远近用 KL`},
    {vs:`JS 散度 ½KL(p‖m)+½KL(q‖m)，m=(p+q)/2`,same:`都基于 KL`,diff:`JS 对称、有界（≤ln 2）、平方根是度量；KL 都不是`,when:`要对称、要有限值（GAN 判别器的原始目标）用 JS`},
    {vs:`Wasserstein 距离`,same:`都度量两分布差异`,diff:`KL 只看同一点上的密度比，支撑不重叠就 ∞ 或饱和；Wasserstein 看"搬土的距离"，支撑不重叠也有有限且有梯度的值`,when:`分布支撑可能不重叠（生成模型早期）用 Wasserstein`},
    {vs:`互信息`,same:`互信息就是一个 KL：KL(p(x,y)‖p(x)p(y))`,diff:`互信息是对称的（因为联合分布对称），一般 KL 不对称`,when:`衡量两个变量的依赖用互信息；衡量两个分布的差异用 KL`}
  ],
  ext:[
    {t:`互信息 = 联合分布对独立乘积的 KL`,go:`it.mutual_info`},
    {t:`最大熵 = 最小化对参考分布的 KL`,go:`it.max_entropy`},
    {t:`VAE 的 KL 项：反向 KL 与后验坍缩`,go:`dl.vae`},
    {t:`最大似然 = 最小化前向 KL`,go:`pr.mle`}
  ]
},

/* ================================================================== */
'it.mutual_info': {
  layers:{
    alg:`三种写法：I(X;Y)=H(X)−H(X|Y)=H(X)+H(Y)−H(X,Y)=KL(p(x,y)‖p(x)p(y))。由 KL≥0 得 I≥0，等号 ⇔ 独立。对任意函数依赖敏感，不只是线性。`,
    geo:`两个圆的韦恩图：H(X)、H(Y) 是两圆面积，H(X,Y) 是并集，I 是交集。相关系数只量"椭圆有多扁"，互信息量"知道 Y 后 X 的可能范围缩了多少"。`,
    comp:`离散：用联合频数表 np.histogram2d 归一化后按 KL 公式算。连续：bin 数是超参，样本少时系统性高估（配准用 MI 时 bin 取 32~64 而非 256）。`
  },
  proof:{
    from:`联合分布 p(x,y)，边缘 p(x)、p(y)，条件 p(x|y)=p(x,y)/p(y)；熵 H 与 KL 的定义；KL≥0（Gibbs）`,
    to:`三种写法恒等；I(X;Y)≥0；I=0 ⇔ X⊥Y；I 对称；存在 ρ=0 但 I>0 的例子`,
    steps:[
      [`从 KL 写法出发：I=Σ_{x,y}p(x,y) ln[p(x,y)/(p(x)p(y))]`,`这是定义：联合分布离"独立假设"有多远，用 KL 度量`],
      [`拆对数：ln p(x,y)−ln p(x)−ln p(y)，分别求和：Σp(x,y)ln p(x,y)=−H(X,Y)；Σp(x,y)ln p(x)=Σₓp(x)ln p(x)=−H(X)（对 y 边缘化）；同理 −H(Y)。故 I=H(X)+H(Y)−H(X,Y)`,`对 y 求和时 Σ_y p(x,y)=p(x)，ln p(x) 不含 y 可提出。三项恰是三个熵。这是韦恩图写法`],
      [`链式法则：p(x,y)=p(y)p(x|y) ⇒ −H(X,Y)=Σp(x,y)[ln p(y)+ln p(x|y)]=−H(Y)−H(X|Y)，即 H(X,Y)=H(Y)+H(X|Y)`,`条件概率定义代入对数、拆开、分别求和；H(X|Y)=−Σp(x,y)ln p(x|y) 是条件熵的定义`],
      [`代入第 2 步：I=H(X)+H(Y)−H(Y)−H(X|Y)=H(X)−H(X|Y)`,`H(Y) 抵消。这是"知道 Y 后 X 的不确定性减少量"写法。三种写法闭环`],
      [`I≥0：第 1 步是一个 KL，Gibbs 不等式给非负；等号 ⇔ p(x,y)=p(x)p(y) 处处成立 ⇔ 独立`,`KL 的等号条件是两分布相同。推论：条件作用不增熵 H(X|Y) ≤ H(X)`],
      [`对称：第 1 步中交换 x,y 表达式不变，故 I(X;Y)=I(Y;X)，于是也等于 H(Y)−H(Y|X)`,`联合分布与乘积分布都对 (x,y) 对称；KL 本身不对称但这里两个参数都对称`],
      [`ρ=0 但 I>0：X 均匀于 {−1,0,1}，Y=X²。E[XY]=E[X³]=0 ⇒ ρ=0；但 Y 由 X 决定，H(Y|X)=0 ⇒ I=H(Y)=H(⅓,⅔)>0`,`相关系数只捕捉 E[XY]−E[X]E[Y] 这一个二阶矩，偶函数依赖在它眼里是零；互信息比较整张联合表，任何依赖都改变 p(x,y)/(p(x)p(y))`]
    ],
    end:`互信息是一个 KL：联合离独立有多远。三种写法只是拆对数的三种停法。它对任意依赖敏感、ρ=0 不等于 I=0，这就是配准、特征选择用它而不用相关系数的原因。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
def H(p):
    p = np.asarray(p, float).ravel(); p = p[p > 0]; return float(-np.sum(p*np.log2(p)))
P = np.random.dirichlet(np.ones(12)).reshape(3, 4)        # 随机联合分布 p(x,y)
px, py = P.sum(1), P.sum(0)
I_kl   = float(np.sum(P*np.log2(P/np.outer(px, py))))
I_venn = H(px) + H(py) - H(P)
H_x_given_y = -float(np.sum(P*np.log2(P/py[None, :])))
I_cond = H(px) - H_x_given_y
print(f'KL 写法 {I_kl:.12f}\\n韦恩写法 {I_venn:.12f}\\n条件写法 {I_cond:.12f}\\n三者最大差 {max(abs(I_kl-I_venn), abs(I_kl-I_cond)):.1e}')
Pi = np.outer(px, py)
print(f'独立乘积分布的 I = {np.sum(Pi*np.log2(Pi/np.outer(Pi.sum(1),Pi.sum(0)))):.1e}   对称 I(X;Y)-I(Y;X) = {I_kl - (H(py)-(-float(np.sum(P*np.log2(P/px[:,None]))))):.1e}')
# rho=0 但 I>0：X 均匀 {-1,0,1}，Y=X^2
xs = np.array([-1, 0, 1]); ys = xs**2
J = np.zeros((3, 2))                                     # p(x,y)，y∈{0,1}
for x, y in zip(xs, ys): J[x+1, y] += 1/3
rho = np.corrcoef(np.repeat(xs, 1000), np.repeat(ys, 1000))[0, 1]
I_sq = H(J.sum(1)) + H(J.sum(0)) - H(J)
print(f'Y=X^2: 相关系数 rho={rho:.3f}   互信息 I={I_sq:.4f} bit = H(Y)={H(J.sum(0)):.4f} (Y 由 X 完全决定)')`,
    out:`KL 写法 0.207996377413
韦恩写法 0.207996377413
条件写法 0.207996377413
三者最大差 6.7e-16
独立乘积分布的 I = -4.2e-16   对称 I(X;Y)-I(Y;X) = 0.0e+00
Y=X^2: 相关系数 rho=-0.000   互信息 I=0.9183 bit = H(Y)=0.9183 (Y 由 X 完全决定)`,
    note:`前四行是第 1-4 步：三种写法数值相等到 1e−12；独立时 I=0 与对称是第 5、6 步；最后一行是第 7 步的反例，ρ=0 而 I=H(Y)>0。`
  },
  contrast:[
    {vs:`皮尔逊相关系数 ρ`,same:`都量两个变量的"关系强弱"、独立时都为 0`,diff:`ρ 只看线性二阶矩，ρ=0 不代表独立；I=0 才是独立，I 对任何函数依赖敏感`,when:`线性关系、要带符号用 ρ；非线性、图像配准、特征筛选用 I`},
    {vs:`KL 散度`,same:`I 本身就是一个 KL`,diff:`I 是特定两个分布（联合 vs 乘积）的 KL，因而对称；一般 KL 不对称`,when:`比较任意两分布用 KL；量两变量依赖用 I`},
    {vs:`条件熵 H(X|Y)`,same:`都出现在 I=H(X)−H(X|Y) 里`,diff:`H(X|Y) 是"知道 Y 后剩多少不确定"，I 是"减了多少"`,when:`问剩余不确定性用条件熵；问信息增益用 I（决策树的信息增益就是 I(标签;特征)）`},
    {vs:`信道容量 C`,same:`C 就是 I 的最大值`,diff:`I 依赖于输入分布；C 对输入分布取 max，只由信道决定`,when:`给定发送策略问传了多少用 I；问信道极限用 C`}
  ],
  ext:[
    {t:`对输入分布取最大就是信道容量`,go:`it.channel`},
    {t:`I 是一个 KL，非负性来自 Gibbs`,go:`it.kl`},
    {t:`协方差与相关系数只抓线性`,go:`pr.covariance`},
    {t:`决策树的信息增益 = I(标签;特征)`,go:`ml.tree`}
  ]
},

/* ================================================================== */
'it.code_length': {
  layers:{
    alg:`前缀码 ⇔ Kraft 不等式 Σ2^{−lᵢ}≤1。在此约束下最小化 Σpᵢlᵢ，拉格朗日给 lᵢ=−log₂pᵢ，最小平均码长 =H。整数化取 ⌈−log₂pᵢ⌉ 得 H≤L<H+1；霍夫曼在整数码中最优。`,
    geo:`一棵二叉树：每个码字是一片叶子，深度 l 的叶子占据 [0,1] 区间中长度 2^{−l} 的一段。叶子们互不重叠总长 ≤1，这就是 Kraft。最优码把概率大的放浅处，让 2^{−l}≈p。`,
    comp:`heapq 每次弹出两个最小概率合并，合并次数 n−1，平均码长 = 所有内部节点权重之和。算术编码把整个消息编成一个区间，突破"每符号整数 bit"的限制逼近 H。`
  },
  proof:{
    from:`前缀码定义（无码字是他者前缀）；码长 lᵢ 为正整数；分布 pᵢ；不等式 ln x ≤ x−1`,
    to:`Kraft：前缀码存在 ⇔ Σ2^{−lᵢ}≤1；实数松弛下最优 lᵢ=−log₂pᵢ 且 L_min=H；整数码 H ≤ L_Huffman < H+1`,
    steps:[
      [`前缀码的每个码字对应二叉树的一片叶子；深度 l 的叶子"占据"完全二叉树在深度 l_max 上 2^{l_max−l} 片叶子，且各码字占据的叶子互不重叠`,`前缀性质意味着没有码字在另一个码字的子树里，所以子树互不相交。占据的叶子总数 ≤ 2^{l_max}，两边除以 2^{l_max} 得 Σ2^{−lᵢ}≤1`],
      [`反向：给定满足 Kraft 的长度序列，按长度升序在树上依次分配最左可用节点，总能放下`,`按升序分配时，放第 k 个码字前已被占的比例是 Σ_{j<k}2^{−lⱼ}<1，在深度 l_k 上仍有空叶子；升序保证不会试图放进已被占的子树`],
      [`实数松弛：min Σpᵢlᵢ s.t. Σ2^{−lᵢ}=1。拉格朗日 ∂/∂lᵢ: pᵢ−μ·2^{−lᵢ}ln2=0 ⇒ 2^{−lᵢ}=pᵢ/(μ ln2)`,`约束在最优处取等（否则可缩短某个码字）；驻点条件给出 2^{−lᵢ} 与 pᵢ 成正比`],
      [`代回 Σ2^{−lᵢ}=1 得 μ ln2=1，故 2^{−lᵢ}=pᵢ，lᵢ=−log₂pᵢ，最小平均码长 Σpᵢ(−log₂pᵢ)=H`,`比例常数由归一化钉死。信息量 −log₂p 就是最优码长，"惊讶度"和"比特数"是同一个优化问题的解，不是比喻`],
      [`下界 L≥H 对任何前缀码成立：令 qᵢ=2^{−lᵢ}/Σ2^{−lⱼ}，则 L−H=Σpᵢlog₂(pᵢ/qᵢ)−log₂Σ2^{−lⱼ} ≥ 0`,`第一项是 KL(p‖q)≥0（Gibbs），第二项因 Kraft ≤1 而 −log₂(≤1)≥0。等号 ⇔ q=p 且 Kraft 取等`],
      [`上界：取 lᵢ=⌈−log₂pᵢ⌉（香农码）。它满足 Kraft（2^{−lᵢ}≤pᵢ，和 ≤1），且 L<Σpᵢ(−log₂pᵢ+1)=H+1`,`向上取整最多加 1，且不破坏 Kraft。所以整数化的代价至多 1 bit/符号`],
      [`霍夫曼是整数前缀码里平均码长最小的（贪心合并两个最小概率，归纳可证最优），故 H ≤ L_Huffman ≤ L_Shannon < H+1`,`最优码中两个最小概率必在最深层且为兄弟（交换论证），合并后问题规模减一且最优性保持。所以霍夫曼夹在 H 与 H+1 之间；差 1 bit 只能靠块编码或算术编码消掉`]
    ],
    end:`码长 = −log₂p 是 Kraft 约束下的拉格朗日解，所以熵是压缩的硬地板。霍夫曼在整数码里达到 H+1 以内；要贴到 H 必须放弃"每符号整数 bit"。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np, heapq
np.random.seed(0)
def huffman(p):
    h = [(pi, i, ()) for i, pi in enumerate(p)]; heapq.heapify(h); lens = np.zeros(len(p), int); cnt = 0
    while len(h) > 1:
        a = heapq.heappop(h); b = heapq.heappop(h); cnt += 1
        for _, _, leaves in (a, b):
            for j in leaves: lens[j] += 1
        for t in (a, b):
            if t[2] == (): lens[t[1]] += 1
        heapq.heappush(h, (a[0]+b[0], len(p)+cnt, tuple(a[2] or (a[1],)) + tuple(b[2] or (b[1],))))
    return lens
H = lambda p: -np.sum(p*np.log2(p))
for trial in range(3):
    p = np.sort(np.random.dirichlet(np.ones(8)*0.7))[::-1]
    l_h = huffman(p); l_s = np.ceil(-np.log2(p)).astype(int)
    print(f'p={np.round(p,3)}')
    print(f'  H={H(p):.4f}  霍夫曼 L={p@l_h:.4f} (Kraft 和={np.sum(2.0**-l_h):.3f})  香农码 L={p@l_s:.4f} (Kraft 和={np.sum(2.0**-l_s):.3f})   H<=L_huff<=L_shannon<H+1: {H(p) <= p@l_h+1e-12 <= p@l_s+1e-12 < H(p)+1}')
# 实数最优 l=-log2 p 恰好让 Kraft 取等，且任何满足 Kraft 的其他长度平均都更长
p = np.array([.4, .3, .2, .1]); l_opt = -np.log2(p)
print(f'实数最优码长 -log2 p = {np.round(l_opt,3)}  Kraft 和 = {np.sum(2.0**-l_opt):.6f}  平均 = H = {p@l_opt:.4f}')
best = min(p@np.array(l) for l in np.ndindex(8,8,8,8) if all(x>0 for x in l) and np.sum(2.0**-np.array(l)) <= 1)
print(f'穷举所有满足 Kraft 的整数码长: 最小平均码长 {best:.4f} = 霍夫曼 {p@huffman(p):.4f}')
# 违反 Kraft 的长度序列不可能是前缀码：例 (1,1,2)
print('长度 (1,1,2) 的 Kraft 和 =', sum(2.0**-np.array([1,1,2])), '> 1，无法构成前缀码')`,
    out:`p=[0.496 0.176 0.086 0.076 0.071 0.047 0.044 0.003]
  H=2.2340  霍夫曼 L=2.2961 (Kraft 和=1.000)  香农码 L=2.9386 (Kraft 和=0.627)   H<=L_huff<=L_shannon<H+1: True
p=[0.656 0.179 0.069 0.055 0.023 0.01  0.007 0.001]
  H=1.5889  霍夫曼 L=1.6711 (Kraft 和=1.000)  香农码 L=2.0167 (Kraft 和=0.747)   H<=L_huff<=L_shannon<H+1: True
p=[0.492 0.147 0.131 0.108 0.061 0.041 0.019 0.001]
  H=2.1901  霍夫曼 L=2.2163 (Kraft 和=1.000)  香农码 L=2.8800 (Kraft 和=0.641)   H<=L_huff<=L_shannon<H+1: True
实数最优码长 -log2 p = [1.322 1.737 2.322 3.322]  Kraft 和 = 1.000000  平均 = H = 1.8464
穷举所有满足 Kraft 的整数码长: 最小平均码长 1.9000 = 霍夫曼 1.9000
长度 (1,1,2) 的 Kraft 和 = 1.25 > 1，无法构成前缀码`,
    note:`huffman 是第 7 步的贪心合并；每次打印验证 Kraft 和 ≤1（第 1 步）与 H ≤ L_huff ≤ L_shannon < H+1（第 5-7 步）；−log₂p 使 Kraft 取等且平均 = H 是第 3、4 步；穷举确认霍夫曼在整数码中最优。`
  },
  contrast:[
    {vs:`算术编码`,same:`都是熵编码、都基于 −log₂p`,diff:`霍夫曼每符号整数 bit，最多浪费 1 bit；算术编码把整段消息编成一个数，总长 < 总熵 + 2 bit`,when:`符号概率悬殊（p>0.5）或要逼近熵用算术编码/ANS；简单快速用霍夫曼`},
    {vs:`定长码 ⌈log₂n⌉`,same:`都是前缀码`,diff:`定长码不利用概率，均匀分布时才最优`,when:`概率均匀或未知用定长；有偏用变长`},
    {vs:`熵 H`,same:`数值上 H 是最优码长的期望`,diff:`H 是分布的性质（下界）；码长是具体方案，整数化后 ≥H`,when:`报告压缩极限说 H；报告实际方案说 L`},
    {vs:`LZ77 / gzip 类字典压缩`,same:`都在压缩`,diff:`字典法利用重复子串（上下文），不需要事先知道分布；熵编码假设符号独立、已知分布`,when:`真实文件先字典再熵编码（DEFLATE = LZ77 + 霍夫曼）`}
  ],
  ext:[
    {t:`码长的期望就是熵；均匀分布时退化为 log₂n`,go:`it.entropy`},
    {t:`用错分布 q 编码的平均码长是交叉熵`,go:`it.cross_entropy`},
    {t:`模型选择 = 总码长最短：MDL`,go:`it.compression`},
    {t:`bit 与二进制表示`,go:`di.bits`}
  ]
},

/* ================================================================== */
'it.channel': {
  layers:{
    alg:`C=max_{p(x)}I(X;Y)。二元对称信道翻转率 p：I=H(Y)−H(Y|X)=H(Y)−H(p)≤1−H(p)，均匀输入取等。高斯信道 C=½log₂(1+S/N)：输出方差 S+N 的高斯熵减噪声熵。`,
    geo:`信道把输入的每个点抹成一团（噪声球）。能可靠区分的码字数 ≈ 输出球体积 / 噪声球体积，取对数就是容量。翻转率 p=½ 时输出与输入无关，容量为 0。`,
    comp:`算 BSC 容量：对输入先验 π 扫描，算 I(π)，最大值在 π=½。逼近容量要长码块 + 好的纠错码（LDPC/极化码）；重复码能把错误率压低但速率 →0，不逼近容量。`
  },
  proof:{
    from:`离散无记忆信道 p(y|x)；互信息 I(X;Y)=H(Y)−H(Y|X)；二元熵 H(p)=−p log p−(1−p)log(1−p)≤1；容量定义 C=max_{p(x)} I`,
    to:`BSC(p) 容量 C=1−H(p) bit/用，均匀输入达到；高斯信道容量 ½log₂(1+SNR)；容量是可靠通信速率的硬上界`,
    steps:[
      [`BSC：Y=X⊕Z，Z~Bernoulli(p) 与 X 独立。H(Y|X)=Σₓp(x)H(Y|X=x)=Σₓp(x)H(p)=H(p)`,`给定 x，Y 只是 x 翻转与否，条件分布是 Bernoulli(p)，熵 H(p) 与 x 无关。噪声项与输入分布无关是 BSC 的关键`],
      [`I(X;Y)=H(Y)−H(p)。Y 是二元变量，H(Y)≤1 bit`,`二元熵在均匀时最大为 1（it.entropy 第 5 步）。于是 I ≤ 1−H(p)，等号需要 Y 均匀`],
      [`输入先验 π=P(X=1)：P(Y=1)=π(1−p)+(1−π)p。π=½ 时 P(Y=1)=½，H(Y)=1，取到上界。故 C=1−H(p)`,`代入 π=½：½(1−p)+½p=½。均匀输入让输出也均匀。p=0 时 C=1（无噪），p=½ 时 C=0（Y 与 X 独立），p=1 时 C=1（确定性翻转，可逆）`],
      [`高斯信道 Y=X+N，N~N(0,σ²)，功率约束 E[X²]≤P：I=h(Y)−h(N)，h(N)=½log₂(2πeσ²)`,`条件微分熵 h(Y|X)=h(N)（平移不变）。同样把问题化为"让输出熵最大"`],
      [`给定方差 P+σ² 的分布中高斯熵最大（it.max_entropy），X 高斯时 Y 高斯且 Var=P+σ²：h(Y)≤½log₂(2πe(P+σ²))`,`方差约束下的最大熵是高斯；两个独立高斯之和仍高斯，方差相加。等号在 X~N(0,P) 达到`],
      [`相减：C=½log₂(2πe(P+σ²))−½log₂(2πeσ²)=½log₂(1+P/σ²)`,`对数相减化为比值。SNR 每翻 4 倍容量加 1 bit；带宽 W 时 C=W log₂(1+SNR)，即香农-哈特利`],
      [`为什么是硬墙（编码定理概要）：速率 R<C 时随机码本 + 联合典型译码错误率 →0；R>C 时 Fano 不等式给出错误率的正下界`,`2^{nR} 个码字各带噪声球 2^{nH(Y|X)}，输出空间 2^{nH(Y)}，球不重叠要求 2^{nR}·2^{nH(Y|X)} ≤ 2^{nH(Y)} 即 R ≤ I。反向由 Fano：H(X|Y) 小则错误率小，而 nR−nC ≤ H(X^n|Y^n) 迫使错误率有下界`]
    ],
    end:`容量 = 输出熵最大化减去噪声熵：BSC 是 1−H(p)，高斯是 ½log(1+SNR)。它是硬墙：低于它冗余可以把错误压到任意小，高于它再聪明的码也救不了。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
h2 = lambda q: 0.0 if q in (0, 1) else -q*np.log2(q) - (1-q)*np.log2(1-q)
def I_bsc(pi, p):                       # I(X;Y) = H(Y) - H(Y|X)
    py1 = pi*(1-p) + (1-pi)*p; return h2(py1) - h2(p)
p = 0.1; pis = np.linspace(0, 1, 1001); Is = np.array([I_bsc(q, p) for q in pis])
print(f'BSC(p=0.1): max_pi I = {Is.max():.6f} 在 pi={pis[Is.argmax()]:.3f}   理论 1-H(0.1)={1-h2(0.1):.6f}')
print('不同翻转率的容量:', {q: round(float(1-h2(q)), 3) for q in [0, 0.05, 0.1, 0.25, 0.5, 0.9, 1.0]})
# 蒙特卡洛验证：均匀输入过 BSC，经验互信息 ≈ C
n = 200000; x = np.random.randint(0, 2, n); y = x ^ (np.random.rand(n) < p)
J = np.array([[np.mean((x==a)&(y==b)) for b in (0,1)] for a in (0,1)])
Hf = lambda P: -np.sum(P[P>0]*np.log2(P[P>0]))
print(f'蒙特卡洛 I = H(X)+H(Y)-H(X,Y) = {Hf(J.sum(1))+Hf(J.sum(0))-Hf(J):.4f}')
# 重复码：错误率降，但速率 1/k -> 0，远低于容量
for k in [1, 3, 5, 9]:
    bits = np.random.randint(0, 2, 20000); rx = np.repeat(bits, k) ^ (np.random.rand(20000*k) < p)
    dec = rx.reshape(-1, k).mean(1) > 0.5
    print(f'  重复 {k} 次: 误码率 {np.mean(dec != bits):.4f}  速率 {1/k:.3f} bit/用  (容量 {1-h2(p):.3f})')
print('高斯信道 C=1/2 log2(1+SNR):', {snr: round(float(0.5*np.log2(1+snr)), 3) for snr in [0, 1, 3, 15, 255]}, ' -> SNR 每 x4 加 1 bit')`,
    out:`BSC(p=0.1): max_pi I = 0.531004 在 pi=0.500   理论 1-H(0.1)=0.531004
不同翻转率的容量: {0: 1.0, 0.05: 0.714, 0.1: 0.531, 0.25: 0.189, 0.5: 0.0, 0.9: 0.531, 1.0: 1.0}
蒙特卡洛 I = H(X)+H(Y)-H(X,Y) = 0.5295
  重复 1 次: 误码率 0.1037  速率 1.000 bit/用  (容量 0.531)
  重复 3 次: 误码率 0.0283  速率 0.333 bit/用  (容量 0.531)
  重复 5 次: 误码率 0.0083  速率 0.200 bit/用  (容量 0.531)
  重复 9 次: 误码率 0.0010  速率 0.111 bit/用  (容量 0.531)
高斯信道 C=1/2 log2(1+SNR): {0: 0.0, 1: 0.5, 3: 1.0, 15: 2.0, 255: 4.0}  -> SNR 每 x4 加 1 bit`,
    note:`扫描 π 找最大是第 2、3 步，最大值恰为 1−H(0.1) 且在 π=½；蒙特卡洛是同一结论的样本版；重复码一段说明"压低错误率"和"逼近容量"是两回事（第 7 步）；最后一行是第 6 步的高斯公式。`
  },
  contrast:[
    {vs:`互信息 I(X;Y)`,same:`C 是 I 的最大值`,diff:`I 依赖输入分布，C 只依赖信道`,when:`评估某个具体发送策略用 I；问信道极限用 C`},
    {vs:`香农-哈特利 C=W log₂(1+SNR)`,same:`同一个高斯容量`,diff:`带宽 W 把"每次使用"换算成"每秒"（每秒 2W 次实采样，每次 ½log）`,when:`工程算 bit/s 用带宽版；理论推导用 bit/用版`},
    {vs:`奈奎斯特采样率`,same:`都出现在通信里、都和带宽 W 有关`,diff:`奈奎斯特是无噪声下的采样/符号率上界 2W；香农容量加了噪声，决定每个符号能带多少 bit`,when:`问"每秒多少符号"用奈奎斯特；问"每秒多少 bit"用香农`},
    {vs:`纠错码的编码增益`,same:`都在对抗噪声`,diff:`容量是所有码的极限；编码增益是某个具体码离这个极限还差多少 dB`,when:`选码时看它离容量的距离（LDPC 约 0.1~0.5 dB）`}
  ],
  ext:[
    {t:`容量是互信息的最大值`,go:`it.mutual_info`},
    {t:`方差约束下高斯熵最大，所以高斯输入达到容量`,go:`it.max_entropy`},
    {t:`带宽与采样：奈奎斯特`,go:`fo.sampling`},
    {t:`高斯分布与噪声模型`,go:`pr.gaussian`}
  ]
},

/* ================================================================== */
'it.max_entropy': {
  layers:{
    alg:`max H(p) s.t. E_p[fₖ]=cₖ, Σp=1。拉格朗日驻点 ln pᵢ=−1−μ−Σλₖfₖ(xᵢ)，即 p ∝ exp(−Σλₖfₖ)：指数族。λ 由矩约束反解。均匀、指数、高斯、伯努利、泊松都是它的特例。`,
    geo:`单纯形上熵的圆顶被几张平面（矩约束）切出一个截面，最大熵是截面最高点。截面越多（约束越多）顶点越低、分布越"有形状"。`,
    comp:`解 λ：一维用二分（E_λ[f] 关于 λ 单调）；多维用凸优化对偶 min_λ ln Z(λ)+λᵀc。logistic 回归、CRF 就是"给定特征期望的最大熵"，训练 = 解 λ。`
  },
  proof:{
    from:`离散支撑 {xᵢ}；目标 H(p)=−Σpᵢ ln pᵢ；约束 Σpᵢ=1、Σpᵢfₖ(xᵢ)=cₖ（k=1..m）；KL≥0`,
    to:`最大熵解是指数族 p*(x)=exp(−Σλₖfₖ(x))/Z；且它是唯一最大（任何满足约束的 q 有 H(q)=H(p*)−KL(q‖p*)）；特例给出均匀/指数/高斯`,
    steps:[
      [`拉格朗日 L=−Σpᵢ ln pᵢ−(μ−1)(Σpᵢ−1)−Σₖλₖ(Σpᵢfₖ(xᵢ)−cₖ)，∂L/∂pᵢ=−ln pᵢ−μ−Σₖλₖfₖ(xᵢ)=0`,`等式约束的极值：目标梯度是约束梯度的线性组合。常数项写成 μ−1 只是为了消掉 −1，不影响结果`],
      [`解出 pᵢ=exp(−μ)·exp(−Σₖλₖfₖ(xᵢ))=exp(−Σₖλₖfₖ(xᵢ))/Z(λ)，Z=Σᵢexp(−Σₖλₖfₖ(xᵢ))`,`e^{−μ} 是与 i 无关的常数，由归一化定为 1/Z。形式已定：对数密度是特征的线性函数，这就是指数族的定义`],
      [`λ 由约束反解：∂ln Z/∂λₖ=−E_p[fₖ]，要求 E_p[fₖ]=cₖ。函数 ln Z(λ)+λᵀc 凸，其最小点给出 λ*`,`ln Z 是凸的（对数配分函数的 Hessian 是特征的协方差，半正定），所以解 λ 是凸优化且唯一；一维时 E_λ[f] 关于 λ 单调，二分即可`],
      [`唯一性/最优性（不靠二阶条件）：对任何满足约束的 q，H(q)=−Σq ln q=−Σq ln p*−KL(q‖p*)`,`在 ln q 里加减 ln p*。这是把熵拆成"交叉项 + KL"的标准手法`],
      [`交叉项 −Σq ln p*=Σq(Σλₖfₖ+ln Z)=Σλₖcₖ+ln Z=−Σp* ln p*=H(p*)`,`ln p* 是 fₖ 的线性函数，而 q 与 p* 的 E[fₖ] 都等于 cₖ，所以 q 与 p* 在 ln p* 上的期望相同。这一步只用了"矩约束匹配"`],
      [`故 H(q)=H(p*)−KL(q‖p*) ≤ H(p*)，等号 ⇔ q=p*`,`KL≥0 且仅在相同时为 0。最大熵解不但是驻点，还是唯一全局最大——而且顺便得到解释：任何别的 q 比 p* 多出的"结构"恰是 KL(q‖p*) 那么多 nat`],
      [`特例：无 f ⇒ 均匀；x>0、f=x ⇒ p ∝ e^{−λx} 指数分布；f=(x,x²) ⇒ p ∝ exp(−λ₁x−λ₂x²) 高斯；f=x 于 {0,1} ⇒ 伯努利；f=x 于 ℕ 加 ln x! 的测度 ⇒ 泊松`,`每个常见分布对应一组"你承认自己知道的统计量"。这就是它们无处不在的原因：不是自然偏爱高斯，而是"只知均值方差"时高斯是最诚实的选择`]
    ],
    end:`最大熵 = 只承认给定的矩、其余全不假设。拉格朗日逼出指数族，KL 分解证明它唯一。高斯不是自然规律，是"只知均值方差"的诚实答案；换约束就换分布。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
xs = np.arange(10)                                   # 支撑 {0..9}，约束 E[x]=3
H = lambda p: float(-np.sum(p[p>0]*np.log(p[p>0])))
KL = lambda q, p: float(np.sum(q[q>0]*np.log(q[q>0]/p[q>0])))
def p_lam(l): w = np.exp(-l*xs); return w/w.sum()
lo, hi = -5, 5                                        # 二分解 lambda：E_lam[x] 关于 lam 单调减
for _ in range(100):
    mid = (lo+hi)/2; lo, hi = (mid, hi) if p_lam(mid)@xs > 3 else (lo, mid)
lam = (lo+hi)/2; ps = p_lam(lam)
print(f'lambda*={lam:.5f}  E[x]={ps@xs:.6f}  H(p*)={H(ps):.5f}  p*={np.round(ps,3)}')
# 任何满足 E[x]=3 的 q 熵更低，且 H(q) = H(p*) - KL(q||p*) 精确成立
cands = {'两点 {0,6}': np.array([.5,0,0,0,0,0,.5,0,0,0]),
         '均匀 {0..6}': np.array([1/7]*7+[0]*3),
         '三角形': np.array([1,2,3,4,3,2,1,0,0,0])/16,
         '点质量 {3}': np.eye(10)[3]}
q = np.random.dirichlet(np.ones(10)*0.5); m = q@xs                  # 随机分布，与点质量混合修正到均值 3
q = (3/m)*q + (1-3/m)*np.eye(10)[0] if m > 3 else (1-(3-m)/(9-m))*q + (3-m)/(9-m)*np.eye(10)[9]
cands['随机(修正到均值3)'] = q
for name, q in cands.items():
    print(f'  {name:>14}: E[x]={q@xs:.3f}  H(q)={H(q):.4f} <= H(p*)  ;  H(p*)-KL(q||p*)={H(ps)-KL(q,ps):.4f}  差 {abs(H(q)-(H(ps)-KL(q,ps))):.1e}')
# 特例：约束 (E x, E x^2) -> 离散高斯型；无约束 -> 均匀
fs = np.stack([xs, xs**2]); target = np.array([4.5, 4.5**2+4])
l = np.zeros(2)
for _ in range(5000):                                 # 梯度下降解对偶 min ln Z + lam·c
    w = np.exp(-l@fs); p2 = w/w.sum(); l -= 0.002*(target - fs@p2)
print(f'约束 E x=4.5, Var=4: p ∝ exp(-l1 x - l2 x^2), l2={l[1]:.4f}>0 (高斯型),  E x={fs[0]@p2:.3f} Var={fs[1]@p2-(fs[0]@p2)**2:.3f}')
print('无约束时 lambda=0 ->', np.round(p_lam(0), 2)[:3], '... 均匀')`,
    out:`lambda*=0.19293  E[x]=3.000000  H(p*)=2.16219  p*=[0.205 0.169 0.14  0.115 0.095 0.078 0.065 0.053 0.044 0.036]
        两点 {0,6}: E[x]=3.000  H(q)=0.6931 <= H(p*)  ;  H(p*)-KL(q||p*)=0.6931  差 3.3e-16
       均匀 {0..6}: E[x]=3.000  H(q)=1.9459 <= H(p*)  ;  H(p*)-KL(q||p*)=1.9459  差 6.7e-16
             三角形: E[x]=3.000  H(q)=1.8407 <= H(p*)  ;  H(p*)-KL(q||p*)=1.8407  差 2.2e-16
         点质量 {3}: E[x]=3.000  H(q)=-0.0000 <= H(p*)  ;  H(p*)-KL(q||p*)=0.0000  差 4.4e-16
      随机(修正到均值3): E[x]=3.000  H(q)=1.2129 <= H(p*)  ;  H(p*)-KL(q||p*)=1.2129  差 2.2e-16
约束 E x=4.5, Var=4: p ∝ exp(-l1 x - l2 x^2), l2=0.1060>0 (高斯型),  E x=4.489 Var=4.104
无约束时 lambda=0 -> [0.1 0.1 0.1] ... 均匀`,
    note:`二分解 λ 是第 3 步；打印的 p* ∝ e^{−λx} 是第 2 步的指数族；候选 q 全部熵更低且 H(q)=H(p*)−KL 精确成立是第 4-6 步；最后两行是第 7 步的特例（二阶矩给高斯型、无约束给均匀）。`
  },
  contrast:[
    {vs:`最大似然`,same:`指数族里两者是对偶：MLE 解 E_θ[f]=经验矩，最大熵解 E_p[f]=给定矩`,diff:`MLE 先定模型族再找参数；最大熵先定约束（特征期望）再推出模型族`,when:`设计模型时用最大熵想"我知道什么"；有数据时用 MLE 拟合`},
    {vs:`均匀先验 / 无差别原则`,same:`都想"不多假设"`,diff:`均匀只是无约束时的最大熵；有矩约束时最大熵不是均匀；且连续情形依赖参考测度`,when:`离散有限且一无所知用均匀；知道某些矩用最大熵`},
    {vs:`最小 KL（最小相对熵）`,same:`数学上同一问题：max H(p) = min KL(p‖均匀)`,diff:`最小 KL 允许任意参考分布 p₀，解为 p ∝ p₀·exp(−Σλf)`,when:`已有先验 p₀ 要"最小改动地"满足新约束用最小 KL`},
    {vs:`正则化`,same:`都在"约束下选最不特殊的解"`,diff:`最大熵约束的是分布的矩，目标是熵；正则化约束的是参数范数，目标是损失`,when:`logistic 回归 = 最大熵 + L2 正则，两个视角叠加`}
  ],
  ext:[
    {t:`拉格朗日乘子与对偶：解 λ 是凸对偶问题`,go:`op.constraint_lagrange`},
    {t:`均匀分布是无约束特例；KL 分解是 H=log n−KL 的推广`,go:`it.entropy`},
    {t:`方差约束下高斯熵最大 ⇒ 高斯信道容量`,go:`it.channel`},
    {t:`logistic 回归是"给定特征期望"的最大熵模型`,go:`ml.logistic`}
  ]
},

/* ================================================================== */
'it.compression': {
  layers:{
    alg:`两部码：L(M)+L(D|M)=−log p(M)−log p(D|M)，最小化它 = 最大化 p(M)p(D|M) ∝ p(M|D)，即 MAP。高斯残差下 L(D|M)=(n/2)log(RSS/n)+常数，k 个参数按 1/√n 精度编码要 (k/2)log n bit ⇒ BIC。`,
    geo:`一条数据曲线，模型是"规律"，残差是"没解释的部分"。模型越复杂，规律那本册子越厚、残差那本越薄；总页数最少的模型最好。背下整份数据的"模型"规律册子和数据一样厚。`,
    comp:`对每个候选复杂度 k 算 MDL_k=(n/2)ln(RSS_k/n)+(k/2)ln n，取 argmin。RSS 单独看永远随 k 下降，MDL 会拐头。这是 BIC 的公式，AIC 把 (k/2)ln n 换成 k。`
  },
  proof:{
    from:`香农/Kraft：任何分布 p 对应一个平均码长 −log₂p 的前缀码；贝叶斯 p(M|D) ∝ p(M)p(D|M)；高斯噪声模型 D=f_M(x)+ε，ε~N(0,σ²)`,
    to:`最短两部码 ⇔ MAP；高斯残差下总码长 ≈ (n/2)ln(RSS/n)+(k/2)ln n（BIC），所以"最短描述"自动惩罚复杂度、防止过拟合`,
    steps:[
      [`给定分布 p，存在码使符号 s 的码长为 ⌈−log₂p(s)⌉ ≈ −log₂p(s) bit（Kraft + 香农码）`,`it.code_length 第 4、6 步。反过来任何前缀码也定义一个分布 2^{−l}。"码长"和"概率"可以互换`],
      [`两部码：先传模型 M（码长 L(M)=−log₂p(M)，p(M) 是模型先验），再在 M 下传数据（L(D|M)=−log₂p(D|M)）`,`接收方先解出 M，再用 M 定义的分布解码 D。两段都按第 1 步用最优码，总长 = −log₂[p(M)p(D|M)]`],
      [`最小化总码长 ⇔ 最大化 p(M)p(D|M) ∝ p(M|D) ⇔ MAP。均匀先验时 ⇔ 最大似然`,`贝叶斯公式，p(D) 与 M 无关。压缩、编码、学习、贝叶斯推断是同一个方程`],
      [`高斯残差：p(D|M)=∏N(εᵢ;0,σ²)，−ln p(D|M)=(n/2)ln(2πσ²)+RSS/(2σ²)；用 MLE σ̂²=RSS/n 代入得 (n/2)ln(RSS/n)+n/2+常数`,`把 σ 也当参数并取其最大似然值；n/2 与常数不随模型变。残差平方和进对数，所以 RSS 减半只省 (n/2)ln2 bit`],
      [`参数编码：k 个实数参数，以精度 δ 编码各花 log₂(范围/δ) bit；最优精度 δ ∝ 1/√n（估计的标准误），故 L(M) ≈ (k/2)log₂n+O(k)`,`参数精度高于标准误是浪费（数据分辨不了），低于则 L(D|M) 变差；平衡点 δ≈1/√n。这是 Rissanen 的推导，(k/2)ln n 就是 BIC 的惩罚项`],
      [`合并：MDL(M)=(n/2)ln(RSS_M/n)+(k_M/2)ln n。k 增大时第一项下降、第二项上升，最小点在真实复杂度附近`,`对数下 RSS 的边际收益递减，而参数代价线性增长。过拟合在这个视角下就是"把噪声也写进了码本"，多写的比特没被 RSS 的下降抵消`],
      [`退化情形：把数据全背下来的模型 L(D|M)=0 但 L(M)=L(D)，总长不变；小样本时 (k/2)ln n 相对 n 很大，逼你用简单模型`,`两部码的"模型"和"数据"是同一枚硬币的两面，总长有下界；BME 的小 n 场景下正是模型描述费付不起，才必须简单`]
    ],
    end:`学习 = 压缩：找到规律就是把数据写得更短。两部码把"复杂度惩罚"从直觉变成了 (k/2)ln n 这个数，MAP、BIC、正则化都是它的读法。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
n = 30; x = np.linspace(-1, 1, n); y = 1.0 - 2.0*x + 3.0*x**2 + 0.3*np.random.randn(n)     # 真实二次
print(' k(度)   RSS       n/2 ln(RSS/n)   (k+1)/2 ln n    MDL总码长')
rows = []
for deg in range(0, 9):
    c = np.polyfit(x, y, deg); rss = np.sum((np.polyval(c, x) - y)**2); k = deg + 1
    fit, pen = n/2*np.log(rss/n), k/2*np.log(n); rows.append((deg, rss, fit, pen, fit+pen))
    print(f'  {deg}    {rss:7.3f}    {fit:9.2f}       {pen:6.2f}       {fit+pen:8.2f}')
best = min(rows, key=lambda r: r[4]); print('RSS 单调下降:', all(rows[i][1] >= rows[i+1][1] for i in range(8)), '  MDL 最小在度数 =', best[0], '(真实为 2)')
# 两部码 = MAP：均匀先验 + 高斯似然，MAP 就是 MLE；换成偏爱低阶的先验 p(M) ∝ 2^{-k}，MAP 改变
loglik = np.array([-(n/2)*np.log(r[1]/n) for r in rows]); k = np.arange(1, 10)
print('均匀先验 argmax p(D|M) 度数 =', int(np.argmax(loglik)), '  先验 p(M)∝2^-k 时 argmax p(M)p(D|M) 度数 =', int(np.argmax(loglik - k*np.log(2))), '  MDL(BIC) 度数 =', int(np.argmax(loglik - k/2*np.log(n))))
# 用未见数据验证：MDL 选的模型泛化最好
xt = np.random.uniform(-1, 1, 1000); yt = 1.0 - 2.0*xt + 3.0*xt**2 + 0.3*np.random.randn(1000)
test = [np.mean((np.polyval(np.polyfit(x, y, d), xt) - yt)**2) for d in range(9)]
print('测试 MSE 按度数:', [f'{t:.3f}' for t in test], ' 最小在度数', int(np.argmin(test)))`,
    out:` k(度)   RSS       n/2 ln(RSS/n)   (k+1)/2 ln n    MDL总码长
  0     83.799        15.41         1.70          17.11
  1     35.942         2.71         3.40           6.11
  2      2.730       -35.95         5.10         -30.85
  3      2.672       -36.27         6.80         -29.47
  4      2.542       -37.02         8.50         -28.52
  5      2.539       -37.04        10.20         -26.84
  6      2.511       -37.21        11.90         -25.30
  7      2.431       -37.69        13.60         -24.09
  8      2.298       -38.54        15.31         -23.23
RSS 单调下降: True   MDL 最小在度数 = 2 (真实为 2)
均匀先验 argmax p(D|M) 度数 = 8   先验 p(M)∝2^-k 时 argmax p(M)p(D|M) 度数 = 2   MDL(BIC) 度数 = 2
测试 MSE 按度数: ['2.224', '0.951', '0.110', '0.112', '0.111', '0.111', '0.114', '0.117', '0.117']  最小在度数 2`,
    note:`表格三列分别是第 4 步的 (n/2)ln(RSS/n)、第 5 步的 (k/2)ln n 与第 6 步的总码长；RSS 单调降而 MDL 拐头选出真实度数 2；先验一行是第 3 步（MDL = MAP）；测试集确认最短码长的模型泛化最好。`
  },
  contrast:[
    {vs:`AIC`,same:`都是 −2 lnL + 惩罚`,diff:`AIC 惩罚 2k（预测最优、不一致），BIC/MDL 惩罚 k ln n（一致，n→∞ 选中真模型）`,when:`目标是预测精度用 AIC；目标是找出真实结构用 BIC/MDL`},
    {vs:`交叉验证`,same:`都在防过拟合、选复杂度`,diff:`CV 用留出数据估计泛化误差，不需要概率模型；MDL 用码长，需要似然与参数编码假设`,when:`小样本、算得起用 CV；有明确概率模型或要理论依据用 MDL`},
    {vs:`正则化 λ‖w‖²`,same:`都是"拟合 + 复杂度代价"`,diff:`正则化的代价是参数大小（连续），MDL 的代价是参数个数与精度（离散码长）；高斯先验下 L(M) 就是 λ‖w‖²`,when:`固定结构调参数用正则化；比较不同结构（阶数、特征数）用 MDL`},
    {vs:`柯尔莫哥洛夫复杂度`,same:`都是"最短描述"`,diff:`K 复杂度用通用图灵机、不可计算；MDL 限定在一个模型族内、可计算`,when:`理论用 K；实践永远是 MDL`}
  ],
  ext:[
    {t:`码长 = −log p 是整个论证的地基`,go:`it.code_length`},
    {t:`L(D|M) 就是负对数似然 = 交叉熵`,go:`it.cross_entropy`},
    {t:`L(M) 的连续版本是正则化项`,go:`op.regularization`},
    {t:`小样本下模型描述费付不起`,go:`bm.small_n`}
  ]
}

});
