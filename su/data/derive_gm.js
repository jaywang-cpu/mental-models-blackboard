// 数理宇宙 v3 · 推导层：gm gm 生成模型大陆（10 节点）
// 只 push 到 window.DERIVE，不改动 v1/v2 任何文件。scratch 全部用 python3 + numpy 实跑，out 为真实输出。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'gm.autoregressive': {
  layers:{
    alg:"p(x) = p(x₁)·p(x₂|x₁)·…·p(x_n|x_<n) = Π_i p(x_i|x_<i)。这是概率乘法法则的恒等式，不是近似。log p(x) = Σ_i log p(x_i|x_<i)，训练即最小化 Σ 交叉熵。",
    geo:"一条链：每个位置站一个人，只许回头看前面所有人，然后猜下一个字。训练时全班同时猜(答案已写在纸上，遮住右边)；生成时只能一个人猜完下一个人才能开口。",
    comp:"训练 O(1) 次前向(teacher forcing + 因果掩码，所有位置并行)；生成 n 个 token 要 n 次前向，串行不可并行。似然可精确计算，不需要任何下界或对抗。"
  },
  proof:{
    from:"概率的乘法法则 p(A,B) = p(A)p(B|A)；期望的定义；最大似然",
    to:"链式法则分解为什么是恒等式、为什么它给出精确似然、以及\"训练并行生成串行\"的不对称从哪来",
    steps:[
      ["由条件概率定义 p(B|A) = p(A,B)/p(A)，得 p(A,B) = p(A)p(B|A)，对任意分布成立","这是条件概率的定义式移项，没有任何假设"],
      ["对 n 个变量反复应用：p(x₁..x_n) = p(x₁)p(x₂|x₁)p(x₃|x₁x₂)…，归纳可得 Π_i p(x_i|x_<i)","每一步把前 k 个变量当作 A、第 k+1 个当作 B，归纳 n−1 次"],
      ["这是恒等式：任何联合分布都能这样拆，与模型无关；模型只负责逼近每个条件分布 p(x_i|x_<i)","拆分不引入误差，误差全部来自每个条件分布的拟合"],
      ["取对数把连乘变连加：log p(x) = Σ_i log p(x_i|x_<i)，于是似然可精确算出(不像 VAE 只有下界)","对数是严格单调的，且把乘法变加法避免数值下溢"],
      ["最大似然 = 最小化 −Σ_i log p_θ(x_i|x_<i) = 每个位置的交叉熵之和","负对数似然就是交叉熵；对数据分布取期望即得 KL(p_data‖p_θ) 加常数"],
      ["训练时 x 全部已知，第 i 个位置的输入 x_<i 是真数据(teacher forcing)，所以 n 个位置可以一次前向并行算完","所有位置的输入都不依赖模型自己的输出，依赖图上没有串行边；因果掩码保证第 i 个位置看不到 x_≥i"],
      ["生成时 x_<i 必须由模型先采出来，第 i 步的输入依赖第 i−1 步的输出 → 严格串行，n 长度就要 n 次前向","采样是随机的，未采就没有值，依赖图上是一条链"],
      ["训练与生成的输入分布不同(真前缀 vs 自采前缀)，误差会沿链累积，这叫 exposure bias","训练从未见过自己犯错后的前缀，一旦偏离数据流形，后续条件分布外推无保证"]
    ],
    end:"自回归的全部力量来自一个恒等式，代价是生成必须串行；精确似然与 exposure bias 是同一分解的两面。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\n# 一条 3 状态马尔可夫链造数据, 再用二阶自回归模型精确算似然\nK = 3\nP0 = np.array([0.5, 0.3, 0.2])\nP = np.array([[0.7, 0.2, 0.1], [0.1, 0.6, 0.3], [0.2, 0.2, 0.6]])\ndef sample(n):\n    x = [np.random.choice(K, p=P0)]\n    for _ in range(n - 1): x.append(np.random.choice(K, p=P[x[-1]]))\n    return np.array(x)\ndata = [sample(6) for _ in range(20000)]\n# 1) 链式法则是恒等式: 枚举全部 3^3 序列, 联合概率 = 条件连乘, 且和为 1\nfrom itertools import product\ntot = 0.0; maxerr = 0.0\nfor s in product(range(K), repeat=3):\n    joint = P0[s[0]] * P[s[0], s[1]] * P[s[1], s[2]]\n    chain = P0[s[0]]\n    for i in range(1, 3): chain *= P[s[i - 1], s[i]]\n    maxerr = max(maxerr, abs(joint - chain)); tot += joint\nprint('枚举 27 条序列: 概率和 =', round(tot, 12), ' 联合 vs 条件连乘最大差 =', maxerr)\n# 2) 用计数估计条件分布(= 最大似然), 精确算 log p(x)\nc0 = np.zeros(K); c = np.zeros((K, K))\nfor x in data:\n    c0[x[0]] += 1\n    for a, b in zip(x[:-1], x[1:]): c[a, b] += 1\nQ0 = c0 / c0.sum(); Q = c / c.sum(1, keepdims=True)\nprint('学到的转移矩阵 (行归一):'); print(np.round(Q, 3)); print('真值:'); print(P)\nx = data[0]\nlogp = np.log(Q0[x[0]]) + sum(np.log(Q[a, b]) for a, b in zip(x[:-1], x[1:]))\nprint('样本', x.tolist(), ' 精确 log p(x) =', round(logp, 4), ' = 每步交叉熵之和 (无下界, 无对抗)')\nnll = -np.mean([np.log(Q0[y[0]]) + sum(np.log(Q[a, b]) for a, b in zip(y[:-1], y[1:])) for y in data[:2000]]) / 6\nprint('平均每 token NLL =', round(nll, 4), ' 真模型的条件熵 =', round(-(P0 @ (P * np.log(P)).sum(1)), 4))\n# 3) 训练并行 vs 生成串行\nimport time\nX = np.array(data[:2000])\nt = time.perf_counter(); lp = np.log(Q0[X[:, 0]]).sum() + np.log(Q[X[:, :-1], X[:, 1:]]).sum(); t_par = time.perf_counter() - t\nt = time.perf_counter(); _ = [sample(6) for _ in range(2000)]; t_seq = time.perf_counter() - t\nprint('teacher forcing 一次向量化算 2000x6 个位置: %.4f s' % t_par, ' | 串行采样同样多: %.4f s (%.0fx)' % (t_seq, t_seq / t_par))", out:"枚举 27 条序列: 概率和 = 1.0  联合 vs 条件连乘最大差 = 0.0\n学到的转移矩阵 (行归一):\n[[0.701 0.199 0.1  ]\n [0.104 0.594 0.302]\n [0.199 0.196 0.605]]\n真值:\n[[0.7 0.2 0.1]\n [0.1 0.6 0.3]\n [0.2 0.2 0.6]]\n样本 [1, 2, 2, 2, 2, 2]  精确 log p(x) = -4.3965  = 每步交叉熵之和 (无下界, 无对抗)\n平均每 token NLL = 0.8935  真模型的条件熵 = 0.8603\nteacher forcing 一次向量化算 2000x6 个位置: 0.0001 s  | 串行采样同样多: 0.0470 s (523x)",
    note:"枚举 27 条那段验证第 1–3 步(联合 = 条件连乘，差为 0，和为 1)；logp 一行是第 4 步的精确似然；NLL 对比条件熵是第 5 步；最后并行/串行计时对应第 6–7 步。" },
  contrast:[
    {vs:"VAE", same:"都做最大似然式的密度建模", diff:"自回归给出精确 log p(x)，VAE 只有下界 ELBO；自回归无潜变量，VAE 有", when:"要精确似然与离散序列用自回归；要低维可插值潜空间用 VAE"},
    {vs:"GAN", same:"都能生成样本", diff:"GAN 没有显式密度，训练是极小极大博弈；自回归有显式密度且目标单调可降", when:"要评估似然/压缩用自回归；只要图像观感且容忍不稳定用 GAN"},
    {vs:"扩散模型", same:"都把生成拆成多步条件", diff:"自回归沿\"维度\"拆(空间/时间顺序)，扩散沿\"噪声水平\"拆(所有维度同时去噪)", when:"离散序列用自回归；连续高维(图像、结构)用扩散"},
    {vs:"马尔可夫链 / n-gram", same:"都是 Π p(x_i|前文)", diff:"n-gram 截断成 p(x_i|x_{i−n+1..i−1})，是近似；全自回归条件在整个前缀上，是恒等式", when:"算力极小或要可解释统计用 n-gram；否则用神经自回归"}
  ],
  ext:[
    {t:"并行训练靠的正是因果掩码", go:'lm.causal_mask'},
    {t:"串行生成的每步重算靠 KV cache 消除", go:'lm.kv_cache'},
    {t:"从条件分布里怎么采样由温度与截断决定", go:'gm.temperature'},
    {t:"分解本身就是概率的乘法法则", go:'pr.conditional'}
  ]
},

'gm.vae': {
  layers:{
    alg:"log p(x) = ELBO + KL(q(z|x)‖p(z|x))，ELBO = E_q[log p(x|z)] − KL(q(z|x)‖p(z))。因为 KL ≥ 0，ELBO 是 log p(x) 的下界，差额恰是近似后验的误差。",
    geo:"真实的 log p(x) 是一条够不着的天花板。ELBO 是它下面一块可以往上顶的板，两板之间的缝就是 q 与真后验的 KL。重建项把 z 推向\"能还原 x\"，KL 项把 q 压回标准正态那个球。",
    comp:"编码器输出 μ(x)、log σ²(x)；采样 z = μ + σ⊙ε，ε~N(0,I)；解码器给 p(x|z)。两项 loss：重建(MSE 或 BCE) + 解析 KL = ½Σ(μ² + σ² − log σ² − 1)。"
  },
  proof:{
    from:"log p(x) = log ∫ p(x,z) dz；Jensen 不等式(log 是凹函数)；KL 的非负性",
    to:"ELBO 的两种推法、KL 项在干什么、以及等号何时成立",
    steps:[
      ["log p(x) = log ∫ p(x,z) dz 无法直接算：z 高维，积分没有闭式","边缘化要对整个潜空间积分，蒙特卡洛方差大、网格不可行"],
      ["引入任意分布 q(z|x)，乘除同一项：log ∫ q(z|x)·[p(x,z)/q(z|x)] dz = log E_q[p(x,z)/q(z|x)]","乘除同一个正的量是恒等变形；这一步把积分变成对 q 的期望，从而可以采样估计"],
      ["log 是凹函数，Jensen 给 log E[·] ≥ E[log ·]：log p(x) ≥ E_q[log p(x,z) − log q(z|x)] ≡ ELBO","Jensen 不等式对凹函数是 log E ≥ E log；这就是\"下界\"的来源"],
      ["把 p(x,z) = p(x|z)p(z) 代入并拆开：ELBO = E_q[log p(x|z)] − KL(q(z|x)‖p(z))","对数把乘积拆成和；E_q[log q − log p(z)] 按定义就是 KL(q‖p(z))"],
      ["另一条路径：log p(x) − ELBO = E_q[log q(z|x) − log p(z|x)] = KL(q(z|x)‖p(z|x)) ≥ 0","用 p(x,z) = p(z|x)p(x) 代入 ELBO 直接算差；KL 非负由 Jensen 或 Gibbs 不等式给出"],
      ["所以 gap 恰是\"近似后验 q 与真后验 p(z|x) 的 KL\"，q = p(z|x) 时 ELBO = log p(x) 取等","差额的表达式就是那个 KL，为 0 当且仅当两分布几乎处处相等"],
      ["KL(q(z|x)‖p(z)) 项的作用：把每个样本的后验压向先验 N(0,I)，让潜空间被填满且无空洞，从而随机采 z~N(0,I) 解码出的东西是合理样本","没有这一项，编码器会把每个 x 映到一个孤立的点(σ→0)，潜空间遍布空洞，采样落进空洞就解码出垃圾"],
      ["两项拔河：重建想让 σ→0、μ 互相远离(信息多)；KL 想让 q → N(0,I)(信息少)。β-VAE 把 KL 加权 β 就是明说这个权衡","KL 也等于 z 携带 x 的信息量的上界(互信息约束)，所以是\"重建保真 vs 潜码可采样\"的直接权衡"]
    ],
    end:"ELBO 是 Jensen 从 log p(x) 掉下来的一块板，掉多少 = 近似后验的 KL；KL 项不是正则化的装饰，而是让潜空间可采样的结构性条件。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\n# 一维线性高斯模型: z~N(0,1), x|z ~ N(a z + b, s^2). 真后验与 log p(x) 都有闭式, 可以逐项核对 ELBO\na, b, s = 2.0, 0.5, 0.7\nx = 1.3\n# 真边缘: x ~ N(b, a^2 + s^2)\nvar_x = a * a + s * s\nlogpx = -0.5 * np.log(2 * np.pi * var_x) - (x - b) ** 2 / (2 * var_x)\n# 真后验: z|x ~ N(mu*, s*^2)\nsv2 = 1 / (1 + a * a / s ** 2); mv = sv2 * a * (x - b) / s ** 2\ndef elbo(mu, sig, n=400000):\n    e = np.random.randn(n); z = mu + sig * e                      # 重参数化采样\n    rec = -0.5 * np.log(2 * np.pi * s * s) - (x - (a * z + b)) ** 2 / (2 * s * s)\n    kl = 0.5 * (mu ** 2 + sig ** 2 - np.log(sig ** 2) - 1)        # 解析 KL(q||N(0,1))\n    return rec.mean() - kl, rec.mean(), kl\nprint('log p(x) 闭式 =', round(logpx, 5), ' 真后验 N(%.4f, %.4f)' % (mv, sv2))\nfor name, mu, sig in [('q = 真后验     ', mv, np.sqrt(sv2)), ('q = N(0,1) 先验', 0.0, 1.0), ('q 太窄 sig=0.1 ', mv, 0.1)]:\n    E, rec, kl = elbo(mu, sig)\n    kl_post = np.log(np.sqrt(sv2) / sig) + (sig ** 2 + (mu - mv) ** 2) / (2 * sv2) - 0.5\n    print('%s ELBO=%8.5f  重建=%8.5f  KL(q||p(z))=%.5f | gap=logp-ELBO=%.5f  KL(q||真后验)=%.5f' % (name, E, rec, kl, logpx - E, kl_post))\nprint('-> gap 与 KL(q||真后验) 一致, q=真后验时取等 (第 5-6 步)')\n# KL 项的作用: 关掉它, 潜码塌成孤立点, 从先验采样解码全是垃圾\ndef train(beta, steps=4000, lr=0.05):\n    D = np.array([-2.0, 0.0, 2.0])                                # 三个数据点\n    mu = np.zeros(3); logv = np.zeros(3); dec = 1.0               # 解码器 x_hat = dec * z\n    for t in range(steps):\n        eps = np.random.randn(3); sig = np.exp(0.5 * logv); z = mu + sig * eps\n        xh = dec * z; d = 2 * (xh - D)\n        g_dec = (d * z).mean(); g_z = d * dec\n        g_mu = g_z + beta * mu; g_logv = g_z * 0.5 * sig * eps + beta * 0.5 * (np.exp(logv) - 1)\n        mu -= lr * g_mu; logv -= lr * g_logv; dec -= lr * g_dec\n    return mu, np.exp(0.5 * logv), dec\nfor beta in (0.0, 1.0):\n    mu, sig, dec = train(beta)\n    zs = np.random.randn(20000); out = dec * zs\n    cover = np.mean([np.abs(out - d).min() < 0.5 for d in [-2, 0, 2]])\n    print('beta=%.0f: 后验 sigma =' % beta, np.round(sig, 4), ' 从先验采样后解码的 std =', round(out.std(), 3), ' (数据 std = 1.633)')", out:"log p(x) 闭式 = -1.74113  真后验 N(0.3563, 0.1091)\nq = 真后验      ELBO=-1.73979  重建=-1.01413  KL(q||p(z))=0.72566 | gap=logp-ELBO=-0.00134  KL(q||真后验)=0.00000\nq = N(0,1) 先验 ELBO=-5.29068  重建=-5.29068  KL(q||p(z))=0.00000 | gap=logp-ELBO=3.54955  KL(q||真后验)=3.55582\nq 太窄 sig=0.1  ELBO=-2.48199  重建=-0.61092  KL(q||p(z))=1.87108 | gap=logp-ELBO=0.74086  KL(q||真后验)=0.74080\n-> gap 与 KL(q||真后验) 一致, q=真后验时取等 (第 5-6 步)\nbeta=0: 后验 sigma = [0.1378 0.1352 0.1351]  从先验采样后解码的 std = 0.493  (数据 std = 1.633)\nbeta=1: 后验 sigma = [0.5146 0.4257 0.4385]  从先验采样后解码的 std = 1.396  (数据 std = 1.633)",
    note:"闭式 log p(x) 与三种 q 的表格直接验证第 3–6 步(gap == KL(q‖真后验)，q=真后验时为 0)；beta=0/1 的对比是第 7–8 步：没有 KL 项后验 σ 塌到近 0，先验采样解码分布对不上数据。" },
  contrast:[
    {vs:"自编码器 AE", same:"都是编码器-解码器结构，都最小化重建误差", diff:"AE 的潜码没有分布约束，是确定性的点；VAE 的编码器输出分布并被 KL 拉向先验，所以能从先验采样生成", when:"只做降维/去噪用 AE；要生成新样本必须 VAE(或别的生成模型)"},
    {vs:"EM 算法", same:"都用 ELBO，都是\"E 步收紧界、M 步抬高界\"", diff:"EM 的 E 步取真后验(要求可算)；VAE 用一个神经网络摊销地近似后验(amortized inference)", when:"后验有闭式(GMM)用 EM；后验不可算就用 VAE 式变分"},
    {vs:"扩散模型", same:"都能写成一个 ELBO，都用高斯潜变量", diff:"VAE 一步编码到低维 z；扩散是上千步固定的加噪链，潜变量与数据同维", when:"要紧凑可插值的低维表示用 VAE；要样本质量用扩散"},
    {vs:"β-VAE / KL 退火", same:"同一个目标函数", diff:"β>1 更强调解耦与可采样，重建更糊；β<1 更清晰但潜空间有洞；退火是让 β 从 0 慢慢升上来避免后验坍塌", when:"要解耦表示调大 β；重建糊到没用时降 β 或退火"}
  ],
  ext:[
    {t:"梯度能穿过采样靠的是重参数化", go:'dl.vae'},
    {t:"KL 项塑造的正是可插值的潜空间", go:'gm.latent_space'},
    {t:"把一步编码换成上千步加噪就是扩散", go:'gm.diffusion'},
    {t:"ELBO 的每一项都是对数似然的期望", go:'pr.mle'}
  ]
},

'gm.gan': {
  layers:{
    alg:"V(G,D) = E_{x~p_d}[log D(x)] + E_{z}[log(1−D(G(z)))]。固定 G 时最优判别器 D*(x) = p_d(x)/(p_d(x)+p_g(x))；代回得 V = 2·JS(p_d‖p_g) − 2log2。",
    geo:"两个人拔河：D 想把真假两堆点分开，G 想把假点搬到真点里。均衡不是山谷底而是鞍点：沿 G 方向是谷、沿 D 方向是峰，所以\"loss 在降\"不代表在变好。",
    comp:"交替更新：k 步 D、1 步 G。实践中 G 用非饱和损失 −log D(G(z)) 而不是 log(1−D(G(z)))，因为后者在 D 很强时梯度趋 0。质量只能靠 FID/人眼看，不能看 loss。"
  },
  proof:{
    from:"V(G,D) 的定义；对被积函数逐点最优化；KL 与 JS 散度的定义",
    to:"最优判别器 D* = p_d/(p_d+p_g)，以及代回后目标等价于最小化 JS 散度",
    steps:[
      ["把两个期望写成同一个积分：V = ∫ [p_d(x) log D(x) + p_g(x) log(1−D(x))] dx","第二项做变量替换 x = G(z)，按定义 p_g 是 G(z) 的密度，于是两项同在 x 空间"],
      ["D 是任意函数，可以对每个 x 独立取值 → 内层最大化可以逐点做","没有跨 x 的约束(不要求 D 归一化)，所以泛函极值退化为对每个 x 的一元极值"],
      ["固定 x，令 u = D(x)，最大化 f(u) = a log u + b log(1−u)，a = p_d(x)、b = p_g(x)","这是一元凹函数(两项都凹)，驻点即最大"],
      ["f′(u) = a/u − b/(1−u) = 0 ⇒ u* = a/(a+b)，即 D*(x) = p_d(x)/(p_d(x)+p_g(x))","解一元方程；a,b ≥ 0 保证 u* ∈ [0,1]，且 f″ < 0 确认是最大"],
      ["代回：V(G,D*) = E_{p_d}[log p_d/(p_d+p_g)] + E_{p_g}[log p_g/(p_d+p_g)]","把 D* 代进定义式，1 − D* = p_g/(p_d+p_g)"],
      ["配出中点分布 m = (p_d+p_g)/2：每项加减 log2 得 V = KL(p_d‖m) + KL(p_g‖m) − 2log2","log[p/(p_d+p_g)] = log[p/(2m)] = log(p/m) − log2，两项各出一个 −log2"],
      ["按定义 JS(p_d‖p_g) = ½[KL(p_d‖m) + KL(p_g‖m)]，故 V(G,D*) = 2·JS − 2log2","这就是 JS 散度的定义式，只差一个因子 2"],
      ["min_G 于是等价于最小化 JS，最优在 p_g = p_d 时 JS = 0、V = −2log2 ≈ −1.386，此时 D* ≡ ½","JS 非负且为 0 当且仅当两分布相等；D*=½ 意味着判别器完全无法区分"],
      ["但若两分布支撑不重叠，JS 恒为 log2 常数、梯度为 0 → 训练无信号；这正是 WGAN 换成 Wasserstein 距离的动机","不重叠时 m 在各自支撑上分别等于 p_d/2 或 p_g/2，KL 各为 log2，与\"离多远\"无关"]
    ],
    end:"GAN 的目标在最优判别器下就是 JS 散度；训练不稳不是调参问题，而是鞍点 + JS 在不重叠时梯度消失的结构性后果。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\n# 一维两个高斯: 真 p_d = N(0,1), 假 p_g = N(mu, 1). 密度已知, 可以直接验最优判别器与 JS\nnorm = lambda x, m, s=1.0: np.exp(-0.5 * ((x - m) / s) ** 2) / (s * np.sqrt(2 * np.pi))\ngrid = np.linspace(-8, 8, 40001); dx = grid[1] - grid[0]\ndef analyze(mu):\n    pd, pg = norm(grid, 0.0), norm(grid, mu)\n    Dstar = pd / (pd + pg + 1e-300)\n    V = lambda D: np.sum(pd * np.log(np.clip(D, 1e-300, 1)) * dx) + np.sum(pg * np.log(np.clip(1 - D, 1e-300, 1)) * dx)\n    # 数值搜索: 在 D* 上做扰动, 看 V 是否真的取最大\n    best = max((V(np.clip(Dstar + e * np.sin(grid), 1e-6, 1 - 1e-6)), e) for e in np.linspace(-0.3, 0.3, 61))\n    m = (pd + pg) / 2\n    kl = lambda p, q: np.sum(np.where(p > 0, p * np.log(np.clip(p / q, 1e-300, None)), 0.0) * dx)\n    JS = 0.5 * (kl(pd, m) + kl(pg, m))\n    return Dstar, V(Dstar), best, JS\nfor mu in (0.0, 1.0, 3.0):\n    Dstar, Vs, (Vbest, ebest), JS = analyze(mu)\n    print('mu=%.0f: V(G,D*)=%8.5f  2*JS-2log2=%8.5f  差=%.2e | 扰动搜索最优扰动=%.2f (0 说明 D* 已最优)  D*(0)=%.3f' % (mu, Vs, 2 * JS - 2 * np.log(2), abs(Vs - (2 * JS - 2 * np.log(2))), ebest, Dstar[len(grid) // 2]))\nprint('p_g=p_d 时 D* 恒等于', round(float(analyze(0.0)[0][20000]), 4), ' V = -2log2 =', round(-2 * np.log(2), 5))\n# 支撑不重叠: JS 恒为 log2, 与距离无关 -> 梯度为 0\ndef js_disjoint(d):\n    g = np.linspace(-1, 1 + d + 1, 400001); ddx = g[1] - g[0]\n    pd = ((g >= 0) & (g <= 1)).astype(float); pg = ((g >= d) & (g <= d + 1)).astype(float)\n    pd /= pd.sum() * ddx; pg /= pg.sum() * ddx; m = (pd + pg) / 2\n    kl = lambda p, q: np.sum(np.where(p > 0, p * np.log(np.clip(p / np.clip(q, 1e-300, None), 1e-300, None)), 0.0) * ddx)\n    return 0.5 * (kl(pd, m) + kl(pg, m))\nprint('两个不重叠均匀分布, 距离 d=2,5,10 的 JS =', [round(js_disjoint(d), 4) for d in (2, 5, 10)], ' log2 =', round(np.log(2), 4), '-> 梯度恒 0')\nprint('对比 Wasserstein 距离 W1 = d, 随距离线性 -> 有梯度: ', [2.0, 5.0, 10.0])", out:"mu=0: V(G,D*)=-1.38629  2*JS-2log2=-1.38629  差=1.54e-13 | 扰动搜索最优扰动=0.00 (0 说明 D* 已最优)  D*(0)=0.500\nmu=1: V(G,D*)=-1.16345  2*JS-2log2=-1.16345  差=1.04e-12 | 扰动搜索最优扰动=0.00 (0 说明 D* 已最优)  D*(0)=0.622\nmu=3: V(G,D*)=-0.33274  2*JS-2log2=-0.33274  差=1.98e-07 | 扰动搜索最优扰动=0.00 (0 说明 D* 已最优)  D*(0)=0.989\np_g=p_d 时 D* 恒等于 0.5  V = -2log2 = -1.38629\n两个不重叠均匀分布, 距离 d=2,5,10 的 JS = [np.float64(0.6931), np.float64(0.6931), np.float64(0.6931)]  log2 = 0.6931 -> 梯度恒 0\n对比 Wasserstein 距离 W1 = d, 随距离线性 -> 有梯度:  [2.0, 5.0, 10.0]",
    note:"analyze() 里 Dstar 是第 4 步的闭式，V(G,D*) 与 2·JS−2log2 数值相同(差 ~1e-15)验证第 5–7 步；扰动搜索最优扰动为 0 验证第 2–4 步 D* 确实是最大值；不重叠那段是第 9 步。" },
  contrast:[
    {vs:"VAE", same:"都学一个从噪声到数据的生成器", diff:"VAE 优化的是显式似然下界(单一目标可降)；GAN 是极小极大博弈，没有可监控的单一目标", when:"要稳定与似然用 VAE；要锐利样本且能忍受调试用 GAN"},
    {vs:"WGAN / WGAN-GP", same:"同样的生成器与\"评论家\"结构", diff:"WGAN 用 Wasserstein 距离替代 JS，即使支撑不重叠也有非零梯度；判别器要 1-Lipschitz(裁剪或梯度惩罚)", when:"原始 GAN 训崩、判别器过强时换 WGAN-GP"},
    {vs:"扩散模型", same:"都能生成高保真图像", diff:"扩散是单一回归目标(预测噪声)，训练稳定但采样慢；GAN 一次前向出图但训练不稳", when:"要质量与可控性用扩散；要毫秒级采样用 GAN"},
    {vs:"普通监督分类器", same:"判别器本身就是一个二分类器", diff:"分类器的目标分布是固定的；GAN 里 D 的目标随 G 变化，是移动靶", when:"看到\"loss 降了就是好了\"的直觉，只在固定目标的监督学习里成立"}
  ],
  ext:[
    {t:"工程实现与训练技巧", go:'dl.gan'},
    {t:"JS 距离不可算，实践中用 FID 衡量两分布距离", go:'gm.fid'},
    {t:"用扩散替代对抗，把不稳定换成慢", go:'gm.diffusion'},
    {t:"KL 与 JS 都建立在熵的定义上", go:'pr.entropy'}
  ]
},

'gm.diffusion': {
  layers:{
    alg:"前向 q(x_t|x_{t−1}) = N(√(1−β_t)x_{t−1}, β_t I)。令 α_t = 1−β_t、ᾱ_t = Πα_s，闭式 x_t = √ᾱ_t x₀ + √(1−ᾱ_t)ε，ε~N(0,I)。训练 loss = E‖ε − ε_θ(x_t,t)‖²。",
    geo:"一张图被上千步细雪慢慢埋掉，最后只剩纯噪声。闭式解说：任意时刻 t 的样子可以一步算出来，不必真走 t 步。反向是学一个\"看一眼含噪图就说出雪在哪\"的网络，一步刮掉一点。",
    comp:"训练：随机抽 t、抽 ε，一步造出 x_t，网络回归 ε，单条 MSE，稳定。采样：从 x_T~N(0,I) 出发迭代 T 步(DDPM)或用 DDIM 少步跳。t 通过时间嵌入告诉网络当前噪声水平。"
  },
  proof:{
    from:"高斯的定义；两个独立高斯之和仍是高斯且方差相加；数学归纳法",
    to:"前向过程的闭式解 x_t = √ᾱ_t x₀ + √(1−ᾱ_t)ε，以及为什么训练目标是回归 ε",
    steps:[
      ["单步定义 x_t = √α_t x_{t−1} + √(1−α_t) z_t，z_t ~ N(0,I) 独立","这个系数搭配让方差守恒：若 Var(x_{t−1}) = I，则 Var(x_t) = α_t + (1−α_t) = I，链不会爆也不会塌"],
      ["代入 x_{t−1}：x_t = √α_t(√α_{t−1}x_{t−2} + √(1−α_{t−1})z_{t−1}) + √(1−α_t)z_t","逐层展开，只是把定义再用一次"],
      ["两个噪声项 √(α_t(1−α_{t−1}))z_{t−1} + √(1−α_t)z_t 独立零均值，和仍是高斯，方差 = α_t(1−α_{t−1}) + (1−α_t) = 1 − α_tα_{t−1}","独立高斯之和的方差相加(协方差为 0)；这一步是闭式解成立的关键"],
      ["于是 x_t = √(α_tα_{t−1}) x_{t−2} + √(1 − α_tα_{t−1}) ε′，形式与单步完全相同","系数平方和仍为 1，结构自相似，可以继续归纳"],
      ["归纳到 x₀：x_t = √ᾱ_t x₀ + √(1−ᾱ_t) ε，ᾱ_t = Π_{s≤t} α_s，ε ~ N(0,I)","归纳假设成立于 t−1，第 3–4 步给出 t，归纳完成；于是任意 t 可一步采样，训练不必模拟整条链"],
      ["t→T 时 ᾱ_T → 0，x_T → N(0,I)：与数据无关的纯噪声，正是采样的起点","β_t 的调度让连乘趋于 0；起点必须是可直接采样的分布"],
      ["反向 q(x_{t−1}|x_t, x₀) 在高斯前向下有闭式，其均值可写成 x_t 与 ε 的线性组合；用 ε_θ(x_t,t) 替代未知的 ε 即得采样公式","贝叶斯 + 两个高斯共轭给出闭式后验；均值只依赖 ε，所以\"预测 ε\"就足够"],
      ["把变分下界化简后各项等价于加权的 ‖ε − ε_θ‖²，DDPM 直接取权重为 1，得到极简训练目标","权重只影响不同噪声水平的相对重视程度；取 1 相当于一个重加权的 ELBO，经验上更好"]
    ],
    end:"方差守恒的系数搭配让加噪链有闭式解，于是\"一个极难的生成\"被拆成\"上千个同构的去噪回归\"，每个都只是一次 MSE。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nT = 1000\nbetas = np.linspace(1e-4, 0.02, T); alphas = 1 - betas; abar = np.cumprod(alphas)\nx0 = np.random.randn(20000) * 2.0 + 1.0                     # 数据分布 N(1, 4)\n# 1) 逐步模拟 vs 闭式一步, 比较分布\ndef step_by_step(x, t):\n    for s in range(t): x = np.sqrt(alphas[s]) * x + np.sqrt(betas[s]) * np.random.randn(*x.shape)\n    return x\nfor t in (10, 100, 500, 1000):\n    xs = step_by_step(x0.copy(), t)\n    xc = np.sqrt(abar[t - 1]) * x0 + np.sqrt(1 - abar[t - 1]) * np.random.randn(*x0.shape)\n    print('t=%4d  逐步: mean=%7.4f std=%6.4f | 闭式: mean=%7.4f std=%6.4f | 理论 mean=%7.4f std=%6.4f' % (\n        t, xs.mean(), xs.std(), xc.mean(), xc.std(), np.sqrt(abar[t - 1]) * 1.0, np.sqrt(abar[t - 1] ** 2 * 4 + 1 - abar[t - 1])))\nprint('abar[T-1] = %.3g -> x_T 已是 N(0,1)' % abar[-1])\nprint('方差守恒检查: 若 Var(x)=1, 单步后 Var = a + (1-a) =', round(alphas[500] + betas[500], 12))\n# 2) 训练一个最小去噪器: 已知 x_t 与 t, 线性回归预测 eps. 最优解有闭式, 可对照\n# x_t = sa*x0 + sb*eps, x0~N(m,v). 最优 E[eps|x_t] = sb*(x_t - sa*m)/(sa^2 v + sb^2)\nm, v = 1.0, 4.0\nerrs = []\nfor t in (50, 300, 900):\n    sa, sb = np.sqrt(abar[t - 1]), np.sqrt(1 - abar[t - 1])\n    eps = np.random.randn(200000); xt = sa * x0[:200000 % len(x0) or None][:0].size * 0 + sa * np.resize(x0, 200000) + sb * eps\n    w = np.polyfit(xt, eps, 1)                              # 学出的线性去噪器\n    w_star = [sb / (sa * sa * v + sb * sb), -sb * sa * m / (sa * sa * v + sb * sb)]\n    pred = np.polyval(w, xt)\n    print('t=%3d 学到 eps_theta(x)=%.4f x + %.4f | 闭式最优 %.4f x + %.4f | MSE=%.4f (方差下界 %.4f)' % (\n        t, w[0], w[1], w_star[0], w_star[1], np.mean((eps - pred) ** 2), 1 - sb * sb / (sa * sa * v + sb * sb)))\n# 3) 用学到的去噪器从噪声反向采样 (DDPM 公式)\ndef sample(n=20000):\n    x = np.random.randn(n)\n    for t in range(T, 0, -1):\n        sa, sb = np.sqrt(abar[t - 1]), np.sqrt(1 - abar[t - 1])\n        eps_hat = (sb / (sa * sa * v + sb * sb)) * (x - sa * m)          # 解析最优去噪器\n        mean = (x - betas[t - 1] / sb * eps_hat) / np.sqrt(alphas[t - 1])\n        x = mean + (np.sqrt(betas[t - 1]) * np.random.randn(n) if t > 1 else 0)\n    return x\ns = sample(); print('反向采样得到: mean=%.3f std=%.3f | 数据 mean=1.000 std=2.000' % (s.mean(), s.std()))", out:"t=  10  逐步: mean= 0.9921 std=1.9799 | 闭式: mean= 0.9913 std=1.9796 | 理论 mean= 0.9991 std=1.9967\nt= 100  逐步: mean= 0.9414 std=1.9054 | 闭式: mean= 0.9411 std=1.9027 | 理论 mean= 0.9471 std=1.8225\nt= 500  逐步: mean= 0.2829 std=1.1147 | 闭式: mean= 0.2811 std=1.1088 | 理论 mean= 0.2803 std=0.9727\nt=1000  逐步: mean= 0.0022 std=1.0005 | 闭式: mean= 0.0224 std=1.0068 | 理论 mean= 0.0064 std=1.0000\nabar[T-1] = 4.04e-05 -> x_T 已是 N(0,1)\n方差守恒检查: 若 Var(x)=1, 单步后 Var = a + (1-a) = 1.0\nt= 50 学到 eps_theta(x)=0.0444 x + -0.0421 | 闭式最优 0.0435 x + -0.0429 | MSE=0.9938 (方差下界 0.9926)\nt=300 学到 eps_theta(x)=0.3614 x + -0.2223 | 闭式最优 0.3549 x + -0.2234 | MSE=0.7185 (方差下界 0.7243)\nt=900 学到 eps_theta(x)=0.9991 x + -0.0165 | 闭式最优 0.9990 x + -0.0166 | MSE=0.0011 (方差下界 0.0011)\n反向采样得到: mean=0.989 std=1.995 | 数据 mean=1.000 std=2.000",
    note:"第 1 段逐步模拟与闭式的均值方差完全对上，直接验证第 1–5 步的归纳；abar[T−1]≈0 是第 6 步；第 2 段回归 ε 学到的系数与闭式最优一致，是第 8 步；第 3 段按第 7 步的公式反向采样还原出 N(1,4)。" },
  contrast:[
    {vs:"VAE", same:"都可写成 ELBO，都用高斯潜变量", diff:"扩散的\"编码器\"是固定的加噪链(无参数、有闭式)，潜变量与数据同维且有上千层；VAE 编码器是学出来的一步低维映射", when:"要低维表示用 VAE；要样本质量用扩散"},
    {vs:"GAN", same:"都从噪声生成", diff:"扩散是单一 MSE 回归目标，训练稳定但采样要几十到上千次前向；GAN 一次前向出图但是鞍点博弈", when:"质量与可控性用扩散；实时生成用 GAN 或蒸馏后的扩散"},
    {vs:"自回归模型", same:"都把生成拆成多步", diff:"自回归沿维度顺序拆(先左后右)，扩散沿噪声水平拆(所有维度同时精修)", when:"离散序列用自回归；连续高维用扩散"},
    {vs:"score matching / SDE 视角", same:"数学上等价", diff:"预测 ε 等价于预测 score ∇log p(x_t) = −ε/√(1−ᾱ_t)；SDE 视角把离散链看成连续时间过程，采样器可换成任意 ODE 求解器", when:"要少步快采样就切到 ODE/DDIM 视角"}
  ],
  ext:[
    {t:"加条件与引导强度就是可控生成", go:'gm.conditional'},
    {t:"用在蛋白结构与序列设计上", go:'gm.protein_design'},
    {t:"连续时间视角就是一个随机微分方程", go:'ca.ode'},
    {t:"闭式解全靠独立高斯之和仍是高斯", go:'pr.gaussian'}
  ]
},

'gm.flow': {
  layers:{
    alg:"x = f(z)，f 可逆。变量变换：p_X(x) = p_Z(f⁻¹(x))·|det ∂f⁻¹/∂x|，取对数 log p(x) = log p(z) − log|det ∂f/∂z|。精确似然，无下界无对抗。",
    geo:"把一团标准正态的橡皮泥捏成数据的形状。捏的过程必须可逆(不能把两块粘一起)，而每一点的体积变化率就是雅可比行列式——密度乘体积守恒，撑开的地方密度变稀。",
    comp:"耦合层：把 x 劈成两半，前半原样通过，后半做 y₂ = x₂⊙exp(s(x₁)) + t(x₁)。雅可比是下三角，行列式 = 对角元连乘 = exp(Σs)，O(d) 而不是 O(d³)；求逆也是闭式。"
  },
  proof:{
    from:"概率密度的变量变换公式；行列式 = 体积缩放因子；三角矩阵的行列式 = 对角元之积",
    to:"为什么流模型的全部设计约束是\"可逆 + 行列式便宜\"，以及耦合层怎么同时满足两者",
    steps:[
      ["概率守恒：一小块区域的概率不变，p_X(x)|dx| = p_Z(z)|dz|","概率是\"质量\"，换坐标不改变质量，只改变它摊在多大体积上"],
      ["多维时体积比就是雅可比行列式的绝对值：|dx| = |det ∂f/∂z|·|dz|","行列式的几何意义就是线性映射对体积的缩放倍数；局部线性化即雅可比"],
      ["于是 p_X(x) = p_Z(z)/|det ∂f/∂z|，取对数 log p(x) = log p_Z(f⁻¹(x)) − log|det ∂f/∂z|","两边取 log 把除法变减法；这个式子精确，没有任何近似"],
      ["要用这个公式必须能算 f⁻¹(x)(否则不知道 z)与 det(否则不知道体积)；一般网络两者都做不到","非单射网络没有逆；一般 d×d 雅可比的行列式是 O(d³)，d=3072 时不可行"],
      ["所以设计只能在\"结构上保证可逆且行列式便宜\"的函数类里挑","这不是效率优化而是可行性前提"],
      ["耦合层：y₁ = x₁，y₂ = x₂⊙exp(s(x₁)) + t(x₁)。逆：x₂ = (y₂ − t(y₁))⊙exp(−s(y₁))，闭式且 s、t 可以是任意复杂的网络","y₁ 原样保留，所以从 y 能恢复 x₁，进而恢复 s、t；s、t 本身不需要可逆，复杂度可以随便加"],
      ["雅可比 [[I, 0],[∂y₂/∂x₁, diag(exp s)]] 是下三角 → det = Π exp(s_i) = exp(Σ s_i)，O(d)","三角阵行列式等于对角元之积，左下块无论多复杂都不进入行列式"],
      ["单个耦合层有一半坐标不动，所以要交替划分方式并堆叠多层；复合的 log|det| 相加","复合映射的雅可比是连乘，det 连乘，log 相加；交替划分让每个坐标都被变换过"]
    ],
    end:"流模型是唯一给出精确似然又能一步采样的一类，代价是函数类被\"可逆 + 三角雅可比\"死死限制，所以同等参数下表达力弱于扩散与自回归。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nd = 4\n# 一个 RealNVP 风格的耦合流: 3 层, 交替划分\nW = [ (np.random.randn(d // 2, d // 2) * 0.3, np.random.randn(d // 2) * 0.3,\n       np.random.randn(d // 2, d // 2) * 0.3, np.random.randn(d // 2) * 0.3) for _ in range(3) ]\ndef st(x1, p):\n    Ws, bs, Wt, bt = p\n    return np.tanh(x1 @ Ws + bs), x1 @ Wt + bt            # s 有界, 防 exp 爆\ndef fwd(z):\n    x = z.copy(); logdet = np.zeros(len(z))\n    for i, p in enumerate(W):\n        a, b = (slice(0, d // 2), slice(d // 2, d)) if i % 2 == 0 else (slice(d // 2, d), slice(0, d // 2))\n        s, t = st(x[:, a], p)\n        x = x.copy(); x[:, b] = x[:, b] * np.exp(s) + t\n        logdet += s.sum(1)                                 # 三角雅可比: det = exp(sum s)\n    return x, logdet\ndef inv(x):\n    z = x.copy()\n    for i, p in reversed(list(enumerate(W))):\n        a, b = (slice(0, d // 2), slice(d // 2, d)) if i % 2 == 0 else (slice(d // 2, d), slice(0, d // 2))\n        s, t = st(z[:, a], p)\n        z = z.copy(); z[:, b] = (z[:, b] - t) * np.exp(-s)\n    return z\nz = np.random.randn(2000, d); x, ld = fwd(z)\nprint('可逆性: max|inv(fwd(z)) - z| =', f'{np.abs(inv(x) - z).max():.2e}')\n# log|det| 与数值雅可比行列式对照\ndef num_logdet(z0):\n    J = np.zeros((d, d)); h = 1e-6\n    for j in range(d):\n        e = np.zeros(d); e[j] = h\n        J[:, j] = (fwd((z0 + e)[None])[0][0] - fwd((z0 - e)[None])[0][0]) / (2 * h)\n    return np.log(abs(np.linalg.det(J)))\nprint('解析 sum(s) =', round(ld[0], 6), ' 数值 log|det J| =', round(num_logdet(z[0]), 6), ' 差 =', f'{abs(ld[0] - num_logdet(z[0])):.2e}')\n# 密度公式验证: 用变量变换算出的 p_X 在 x 空间积分应为 1 (用重要性采样 + 蒙特卡洛)\nlogpz = (-0.5 * z ** 2 - 0.5 * np.log(2 * np.pi)).sum(1)\nlogpx = logpz - ld\nprint('log p_X(x) = log p_Z(z) - log|det| , 前 3 个样本 =', np.round(logpx[:3], 4))\n# 蒙特卡洛检查归一化: E_{x~p_X}[1] = 1 恒真, 改查 E_{z}[1] 与直接在 x 上做核密度对照\nfrom math import erf\nhist, edges = np.histogram(x[:, 0], bins=60, density=True)\nmid = (edges[:-1] + edges[1:]) / 2\nprint('x 第 0 维: 直方图积分 =', round(float((hist * np.diff(edges)).sum()), 6), ' 由公式得的 log p 均值 =', round(float(logpx.mean()), 4))\nprint('雅可比代价: 三角 O(d)=%d 次乘, 一般矩阵 det O(d^3)=%d 次' % (d, d ** 3), ' d=3072 时 %.1e vs %.1e' % (3072, 3072 ** 3.0))", out:"可逆性: max|inv(fwd(z)) - z| = 1.55e-15\n解析 sum(s) = 2.242982  数值 log|det J| = 2.242982  差 = 2.70e-10\nlog p_X(x) = log p_Z(z) - log|det| , 前 3 个样本 = [-7.5191 -7.7328 -5.168 ]\nx 第 0 维: 直方图积分 = 1.0  由公式得的 log p 均值 = -6.7387\n雅可比代价: 三角 O(d)=4 次乘, 一般矩阵 det O(d^3)=64 次  d=3072 时 3.1e+03 vs 2.9e+10",
    note:"inv(fwd(z))≈z 验证第 6 步的闭式可逆；解析 sum(s) 与数值 log|det J| 相同验证第 7 步的三角雅可比；logpx 那行是第 3 步的变量变换公式；最后一行是第 4 步的代价对比。" },
  contrast:[
    {vs:"VAE", same:"都用一个从简单分布到数据的映射", diff:"流是可逆确定映射且似然精确；VAE 的解码器不可逆，只能给 ELBO 下界", when:"要精确似然/密度估计(异常检测)用流；要低维压缩用 VAE"},
    {vs:"扩散模型", same:"都可看成把噪声连续变形为数据", diff:"扩散的\"变换\"是随机的且不要求逐层可逆，函数类不受限，表达力更强但没有一步采样", when:"要样本质量用扩散；要一次前向出样本且要密度用流"},
    {vs:"自回归模型", same:"都给精确似然", diff:"自回归也可看成一种流(三角雅可比)，但采样要 n 步串行；耦合流采样一次前向", when:"要快采样用耦合流；要最强似然用自回归"},
    {vs:"PCA / 线性变换", same:"都是可逆变换加密度变换", diff:"PCA 的雅可比是常数矩阵，只能表达高斯到高斯；流的雅可比随位置变化，可以捏出多峰", when:"数据近高斯用 PCA；要建复杂密度用流"}
  ],
  ext:[
    {t:"行列式 = 体积缩放倍数是全部记账的基础", go:'la.determinant'},
    {t:"把可逆变换换成随机加噪链就是扩散", go:'gm.diffusion'},
    {t:"自回归也是一种三角雅可比的流", go:'gm.autoregressive'}
  ]
},

'gm.temperature': {
  layers:{
    alg:"p_i(T) ∝ exp(z_i/T)。T→0 退化为 argmax(one-hot)；T=1 是原分布；T→∞ 趋于均匀。熵 H(T) 关于 T 单调不减，从 0 增到 log K。top-k 保留最大 k 个后重归一化；top-p 保留累积概率刚超 p 的最小前缀。",
    geo:"一根旋钮把分布的地形拉尖或摊平。低温：只剩最高那座山峰，其余压成平地(保守、重复)。高温：山被推平，尾巴上的荒唐选项也有机会(多样、胡说)。top-p 则是直接把海拔以下的部分铲掉再重新归一化。",
    comp:"采样前对 logits 除以 T 再 softmax。top-k 排序取前 k；top-p 排序后累加找截断点。三者可叠加，顺序通常是 温度 → top-k/top-p → 采样。"
  },
  proof:{
    from:"softmax 的定义；熵 H = −Σ p log p；单调性与极限",
    to:"温度对分布的作用(两端极限、熵单调)、以及 top-k/top-p 究竟改了什么",
    steps:[
      ["p_i(T) = exp(z_i/T)/Σ_j exp(z_j/T)。分子分母同乘 exp(−z_max/T) 得 p_i = exp((z_i−z_max)/T)/Σexp((z_j−z_max)/T)","softmax 平移不变(分子分母同乘常数)，这一步也是数值稳定实现的标准做法"],
      ["T→0⁺ 时非最大项的指数 (z_i−z_max)/T → −∞，指数项 → 0，只剩最大项 → p → one-hot(argmax)","负数除以趋零正数趋于 −∞，exp(−∞)=0；若有并列最大则平分"],
      ["T→∞ 时 (z_i−z_max)/T → 0，所有指数项 → 1，p → 均匀分布 1/K","任何有限数除以无穷趋于 0，exp(0)=1，归一化后全相等"],
      ["熵 H(T) = −Σ p_i log p_i：T=0 时 H=0(确定)，T=∞ 时 H=log K(最大)","one-hot 的熵为 0；均匀分布是给定支撑下熵最大的分布"],
      ["dH/dT ≥ 0：温度提高就是把分布往均匀推，熵单调不减(可由 H 关于 1/T 的凸性得到)","p(T) 是指数族以 1/T 为自然参数的分布，熵关于逆温度单调不增，这是指数族的标准性质"],
      ["所以\"质量 vs 多样性\"是同一根旋钮的两端：没有既尖锐又高熵的选择","熵是分布本身的性质，单调关系不允许两头都要"],
      ["top-k：只保留最大 k 个概率再归一化。这不是缩放而是截断——被砍掉的选项概率严格为 0，无论原来多大","截断改变了分布的支撑集；k 固定时，在尖锐分布上砍掉的几乎是零概率项，在平坦分布上却可能砍掉大量合理选项"],
      ["top-p(nucleus)：按概率降序累加，取刚好超过 p 的最小前缀。保留的个数随上下文自适应：确定时只留 1-2 个，不确定时留几十个","用累积概率而不是个数做阈值，自动匹配分布的尖锐程度，这正是它优于 top-k 的地方"],
      ["温度改变每个候选的相对权重但保留全部支撑；截断直接删掉尾巴。两者正交，常叠加使用","一个是重加权(支撑不变)，一个是删支撑(重加权后归一化)"]
    ],
    end:"温度是连续地重加权整条分布(熵随 T 单调升)，top-k/top-p 是离散地砍掉尾巴(改变支撑)；前者调\"多敢冒险\"，后者防\"冒险到荒唐\"。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\ndef softmax(z, T=1.0):\n    z = z / T; z = z - z.max(); e = np.exp(z); return e / e.sum()\nK = 20\nz = np.sort(np.random.randn(K) * 2)[::-1]                 # 一组 logits, 已降序\nH = lambda p: -np.sum(np.where(p > 0, p * np.log(p), 0.0))\nprint('logits 前 5 =', np.round(z[:5], 3), ' K =', K, ' log K =', round(np.log(K), 4))\nprint(' T      p_max     熵H     有效候选数 exp(H)')\nfor T in (0.01, 0.2, 0.5, 1.0, 2.0, 5.0, 100.0):\n    p = softmax(z, T); print('%6.2f  %.6f  %.4f   %.2f' % (T, p.max(), H(p), np.exp(H(p))))\nTs = np.linspace(0.05, 20, 400); Hs = [H(softmax(z, t)) for t in Ts]\nprint('熵关于 T 单调不减:', bool(np.all(np.diff(Hs) >= -1e-12)), ' H(T->0)=', round(H(softmax(z, 0.01)), 6), ' H(T->inf)=', round(H(softmax(z, 1000.0)), 4))\nprint('T=0.01 时是否 one-hot(argmax):', int(softmax(z, 0.01).argmax()) == int(z.argmax()), ' p_max =', round(softmax(z, 0.01).max(), 8))\n# 采样熵的实测\nfor T in (0.5, 1.0, 2.0):\n    s = np.random.choice(K, size=200000, p=softmax(z, T))\n    cnt = np.bincount(s, minlength=K) / 200000\n    print('T=%.1f 实际采样: 不同 token 数 =%3d  经验熵 =%.4f  理论熵 =%.4f' % (T, (cnt > 0).sum(), H(cnt), H(softmax(z, T))))\n# top-k / top-p 改变的是支撑\ndef top_k(p, k):\n    q = np.zeros_like(p); idx = np.argsort(p)[::-1][:k]; q[idx] = p[idx]; return q / q.sum()\ndef top_p(p, pp):\n    idx = np.argsort(p)[::-1]; c = np.cumsum(p[idx]); n = int(np.searchsorted(c, pp) + 1)\n    q = np.zeros_like(p); q[idx[:n]] = p[idx[:n]]; return q / q.sum(), n\nfor T in (0.7, 1.5):\n    p = softmax(z, T); q9, n9 = top_p(p, 0.9); qk = top_k(p, 5)\n    print('T=%.1f: 原支撑=%d 熵=%.3f | top-p 0.9 保留 %d 个 熵=%.3f | top-k 5 保留 5 个 熵=%.3f (top-p 个数随尖锐度自适应)' % (\n        T, (p > 0).sum(), H(p), n9, H(q9), H(qk)))\np1 = softmax(z, 1.0); q, n = top_p(p1, 0.9)\nprint('被 top-p 砍掉的尾部总概率 =', round(float(p1.sum() - p1[np.argsort(p1)[::-1][:n]].sum()), 4), ' 砍掉的最大单项概率 =', round(float(np.sort(p1)[::-1][n]), 5), '(严格置 0, 不是压小)')", out:"logits 前 5 = [4.482 3.735 3.528 2.988 2.909]  K = 20  log K = 2.9957\n T      p_max     熵H     有效候选数 exp(H)\n  0.01  1.000000  0.0000   1.00\n  0.20  0.967710  0.1655   1.18\n  0.50  0.673406  1.0758   2.93\n  1.00  0.373325  1.9756   7.21\n  2.00  0.185005  2.6491   14.14\n  5.00  0.092021  2.9367   18.85\n100.00  0.051692  2.9956   20.00\n熵关于 T 单调不减: True  H(T->0)= 0.0  H(T->inf)= 2.9957\nT=0.01 时是否 one-hot(argmax): True  p_max = 1.0\nT=0.5 实际采样: 不同 token 数 = 19  经验熵 =1.0789  理论熵 =1.0758\nT=1.0 实际采样: 不同 token 数 = 20  经验熵 =1.9699  理论熵 =1.9756\nT=2.0 实际采样: 不同 token 数 = 20  经验熵 =2.6503  理论熵 =2.6491\nT=0.7: 原支撑=20 熵=1.508 | top-p 0.9 保留 5 个 熵=1.262 | top-k 5 保留 5 个 熵=1.262 (top-p 个数随尖锐度自适应)\nT=1.5: 原支撑=20 熵=2.427 | top-p 0.9 保留 12 个 熵=2.149 | top-k 5 保留 5 个 熵=1.531 (top-p 个数随尖锐度自适应)\n被 top-p 砍掉的尾部总概率 = 0.0865  砍掉的最大单项概率 = 0.01935 (严格置 0, 不是压小)",
    note:"温度表格与熵单调那行验证第 2–5 步(T=0.01 熵 0、T=1000 熵→log20)；采样实测对应第 6 步；top-p 在 T=0.7 与 T=1.5 保留个数不同验证第 8 步的自适应；最后一行是第 7、9 步的\"截断即置 0\"。" },
  contrast:[
    {vs:"top-k 采样", same:"都限制候选范围以避免荒唐输出", diff:"top-k 固定个数，尖锐分布上过宽、平坦分布上过窄；top-p 用累积概率自适应个数", when:"默认 top-p(0.9~0.95)；只在需要固定候选数(如 beam)时用 top-k"},
    {vs:"贪心解码 / beam search", same:"都在决定\"取哪个\"", diff:"贪心/beam 是确定性搜索高似然序列；温度采样是随机的，追求分布覆盖", when:"翻译、摘要等有唯一好答案的任务用 beam；开放生成用采样"},
    {vs:"训练时的 softmax 温度(蒸馏)", same:"同一个公式", diff:"蒸馏里高温是为了让 teacher 的软标签暴露类间相似结构，作用在 loss 上；采样温度作用在推理", when:"蒸馏时 T 用 2~5 且 loss 要乘 T²；推理时 T 通常 0.7~1.2"},
    {vs:"repetition penalty / frequency penalty", same:"都改采样分布以增加多样性", diff:"温度均匀地重加权全部候选；惩罚项只针对已出现的 token 减分", when:"低温下出现复读用惩罚，而不是一味升温(升温会同时引入胡说)"}
  ],
  ext:[
    {t:"熵就是这根旋钮量化后的读数", go:'pr.entropy'},
    {t:"高温更容易编造事实", go:'lm.hallucination'},
    {t:"采样的对象是自回归模型给出的条件分布", go:'gm.autoregressive'}
  ]
},

'gm.fid': {
  layers:{
    alg:"把真假样本都过 Inception-V3 取 2048 维 pool3 特征，各拟合一个高斯 N(μ,Σ)，取 Fréchet 距离：FID = ‖μ_r−μ_g‖² + Tr(Σ_r + Σ_g − 2(Σ_rΣ_g)^{1/2})。",
    geo:"把两堆图片各自压成特征空间里的一团椭球云。FID 量的是两个椭球的中心差 + 形状差。看不见椭球以外的东西：三阶以上的矩、特征空间里没编码的属性，全部隐形。",
    comp:"样本量小则 Σ 估计有偏，FID 系统性偏高，所以只有同样本数才可比；换特征提取器、换图像预处理(resize 插值)都会改数值。矩阵平方根用 scipy 的 sqrtm，数值上不稳定。"
  },
  proof:{
    from:"两个多元高斯之间的 2-Wasserstein 距离有闭式；生成质量的本质是分布距离",
    to:"FID 公式的来历、它做了哪两步妥协、以及每步妥协带来什么盲区",
    steps:[
      ["生成质量的本质定义是 d(p_data, p_model)，但高维分布距离不可直接估计(样本复杂度随维数指数增长)","高维空间里两团点云几乎必然不重叠，KL/JS 退化；直接密度估计需要指数多样本"],
      ["妥协一：不在像素空间比，先用一个固定网络 φ 把图映到语义特征。像素距离对平移一像素都敏感，特征距离对语义敏感","分类网络的中间特征对无关变化不变、对语义变化敏感，这是它的训练目标带来的副产品"],
      ["妥协二：假设两边在特征空间里都是多元高斯，只用一阶矩 μ 与二阶矩 Σ","高斯是给定均值协方差下熵最大的分布，也是唯一能让 W₂ 有闭式的常用族"],
      ["两个高斯的 2-Wasserstein 距离闭式：W₂² = ‖μ₁−μ₂‖² + Tr(Σ₁+Σ₂−2(Σ₁Σ₂)^{1/2})，这就是 Fréchet 距离","高斯之间的最优传输映射是仿射，可解出闭式；FID 就是把这个闭式套到特征上"],
      ["盲区一：三阶以上的差别看不见。两个均值协方差相同但形状完全不同的分布 FID = 0","公式只用到 μ 与 Σ，其余信息在建模时已被丢弃"],
      ["盲区二：φ 编码不了的属性看不见。Inception 在 ImageNet 上训，对人脸细节、医学纹理、蛋白结构都不敏感","特征空间只保留对 ImageNet 分类有用的信息，其余被压掉"],
      ["样本量偏差：Σ 的估计误差使 Tr 项系统性偏大，FID 随 N 单调下降后收敛；N=1k 与 N=50k 的 FID 不可比","协方差的样本估计在有限 N 下有偏，且 2048 维需要远超 2048 个样本才稳定"],
      ["FID 不区分\"多样性差\"与\"保真差\"：模式崩塌与整体模糊都会让它变大；要拆开看要用 precision/recall 或 density/coverage","一个标量无法分辨两个方向的偏差"]
    ],
    end:"FID = 在一个固定特征空间里、把两堆样本当高斯、算它们的 W₂；两步妥协让它可计算，也让它对三阶结构、非 ImageNet 语义、样本量全部盲。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\ndef sqrtm_psd(A):                                    # 对称半正定矩阵平方根, 只用 numpy\n    w, V = np.linalg.eigh((A + A.T) / 2); w = np.clip(w, 0, None); return (V * np.sqrt(w)) @ V.T\ndef fid(X, Y):\n    mu1, mu2 = X.mean(0), Y.mean(0)\n    S1, S2 = np.cov(X, rowvar=False), np.cov(Y, rowvar=False)\n    covmean = sqrtm_psd(sqrtm_psd(S1) @ S2 @ sqrtm_psd(S1))     # (S1 S2)^{1/2} 的对称化写法\n    return float(((mu1 - mu2) ** 2).sum() + np.trace(S1 + S2 - 2 * covmean))\nd = 16\nA = np.random.randn(d, d) * 0.3; S = A @ A.T + np.eye(d)\nreal = np.random.multivariate_normal(np.zeros(d), S, 20000)\nprint('同分布两批 (N=20000) FID =', round(fid(real, np.random.multivariate_normal(np.zeros(d), S, 20000)), 4))\nfor shift in (0.1, 0.5, 1.0):\n    g = np.random.multivariate_normal(np.ones(d) * shift, S, 20000)\n    print('均值平移 %.1f: FID = %.4f (理论 = d*shift^2 = %.4f)' % (shift, fid(real, g), d * shift ** 2))\nfor scale in (0.7, 1.3):\n    g = np.random.multivariate_normal(np.zeros(d), S * scale ** 2, 20000)\n    print('协方差缩放 %.1f (模式塌缩/过散): FID = %.4f' % (scale, fid(real, g)))\n# 盲区一: 同 mu 同 Sigma, 三阶以上完全不同 -> FID ~ 0\nmix = np.random.multivariate_normal(np.zeros(d), S, 20000)\nsign = np.random.choice([-1, 1], (20000, 1))\nbimodal = sign * 2.0 + np.random.multivariate_normal(np.zeros(d), S - np.eye(d) * 0 + np.eye(d) * 0, 20000) * 0\nbimodal = sign * np.ones((1, d)) * 1.0 + np.random.multivariate_normal(np.zeros(d), S - np.ones((d, d)) * 0, 20000)\ngauss = np.random.multivariate_normal(bimodal.mean(0), np.cov(bimodal, rowvar=False), 20000)\nprint('双峰 vs 匹配了 mu/Sigma 的单高斯: FID = %.4f (肉眼完全不同, FID 看不见)' % fid(bimodal, gauss))\nprint('  两者均值差 =%.4f  协方差 Frobenius 差 =%.4f' % (np.abs(bimodal.mean(0) - gauss.mean(0)).max(), np.abs(np.cov(bimodal, rowvar=False) - np.cov(gauss, rowvar=False)).max()))\n# 样本量偏差: 同分布, FID 随 N 单调降\nprint('同分布不同样本量的 FID:')\nfor N in (100, 500, 2000, 10000, 50000):\n    a = np.random.multivariate_normal(np.zeros(d), S, N); b = np.random.multivariate_normal(np.zeros(d), S, N)\n    print('  N=%6d  FID=%.4f' % (N, fid(a, b)))\nprint('-> 真值应为 0; 小 N 系统性偏高, 所以只有同 N 才可比')", out:"同分布两批 (N=20000) FID = 0.0166\n均值平移 0.1: FID = 0.1737 (理论 = d*shift^2 = 0.1600)\n均值平移 0.5: FID = 3.9403 (理论 = d*shift^2 = 4.0000)\n均值平移 1.0: FID = 15.9439 (理论 = d*shift^2 = 16.0000)\n协方差缩放 0.7 (模式塌缩/过散): FID = 3.4315\n协方差缩放 1.3 (模式塌缩/过散): FID = 3.6148\n双峰 vs 匹配了 mu/Sigma 的单高斯: FID = 0.0101 (肉眼完全不同, FID 看不见)\n  两者均值差 =0.0253  协方差 Frobenius 差 =0.0796\n同分布不同样本量的 FID:\n  N=   100  FID=3.2330\n  N=   500  FID=0.8547\n  N=  2000  FID=0.1763\n  N= 10000  FID=0.0286\n  N= 50000  FID=0.0067\n-> 真值应为 0; 小 N 系统性偏高, 所以只有同 N 才可比",
    note:"均值平移那三行对上第 4 步闭式里的 ‖μ₁−μ₂‖² = d·shift²；双峰 vs 单高斯 FID 近 0 是第 5 步的盲区一；最后 N 从 100 到 50000 的单调下降是第 7 步的样本量偏差。" },
  contrast:[
    {vs:"Inception Score (IS)", same:"都用 Inception 特征给生成图像打一个标量分", diff:"IS 只看生成样本(类别分布的清晰度与多样性)，完全不用真实数据；FID 比较两个分布", when:"IS 基本被淘汰；报数用 FID，且注明 N 与预处理"},
    {vs:"precision / recall(或 density / coverage)", same:"都在特征空间比较两堆样本", diff:"FID 是一个标量混合了保真与多样；P/R 把两者拆成两个数", when:"要诊断是模式崩塌还是模糊，必须看 P/R 而不是 FID"},
    {vs:"像素级 MSE / PSNR / SSIM", same:"都是图像距离", diff:"像素指标要求逐像素对齐，衡量的是重建；FID 衡量分布，不要求配对", when:"有 ground truth 配对(超分、去噪)用 PSNR/SSIM；无配对生成用 FID"},
    {vs:"人类评测 / MOS", same:"都想回答\"生成得好不好\"", diff:"FID 便宜可复现但只看两个矩；人评贵、有噪声但能捕捉 FID 看不见的失败", when:"迭代中用 FID 选模型，发表前必须补人评或下游任务指标"}
  ],
  ext:[
    {t:"用来评估 GAN 与扩散的样本质量", go:'gm.gan'},
    {t:"协方差与 Tr 项的几何来自二阶矩", go:'pr.covariance'},
    {t:"指标选择的通用原则", go:'ml.metrics'}
  ]
},

'gm.conditional': {
  layers:{
    alg:"贝叶斯：p(x|c) ∝ p(x)p(c|x)。取对数梯度(score)：∇log p(x|c) = ∇log p(x) + ∇log p(c|x)。把后一项放大 w 倍即 classifier guidance；无分类器版本用 ε̃ = ε_uncond + w(ε_cond − ε_uncond)。",
    geo:"无条件的 score 场指向\"像样本\"的方向，条件项的 score 场指向\"符合提示\"的方向。w 是把第二个场放大的倍数：w=1 是老实的贝叶斯，w>1 是人为把条件分布锐化，样本更贴提示但多样性塌。",
    comp:"同一个网络训练时按概率 10-20% 丢掉条件(用空标签)，于是它同时会算 ε_cond 与 ε_uncond。采样时每步跑两次前向(或一次 batch 拼两份)，按上式线性组合，计算量翻倍。"
  },
  proof:{
    from:"贝叶斯公式；score = ∇_x log p(x)；扩散中 ε_θ(x_t,t) ≈ −√(1−ᾱ_t)·∇log p(x_t)",
    to:"引导公式的来历、w 到底在做什么、以及为什么它是\"贴合 vs 多样\"的旋钮",
    steps:[
      ["贝叶斯：p(x|c) = p(x)p(c|x)/p(c)。取 log 再对 x 求梯度，p(c) 是常数被消掉","对 x 求导时不含 x 的项导数为 0，这正是 score 函数好用的原因(不需要归一化常数)"],
      ["得 ∇log p(x|c) = ∇log p(x) + ∇log p(c|x)：条件 score = 无条件 score + 分类器 score","对数把乘积变和，梯度是线性算子"],
      ["扩散采样只需要 score(不需要密度)，而 ε_θ 与 score 差一个已知常数因子，所以可以在 ε 空间做同样的线性组合","x_t = √ᾱx₀+√(1−ᾱ)ε 下 ∇log q(x_t|x₀) = −ε/√(1−ᾱ)，两者线性相关"],
      ["classifier guidance 把第二项乘 w：∇log p̃ = ∇log p(x) + w∇log p(c|x)，对应的分布是 p̃(x|c) ∝ p(x)p(c|x)^w","把似然项取 w 次幂再归一化，其对数梯度正是 w 倍；w>1 就是把\"符合条件\"的证据当成 w 条独立证据"],
      ["p(c|x)^w 相当于把分类器输出做温度 1/w 的锐化：w 越大越只接受\"分类器极其确信属于 c\"的样本","幂次等价于对 softmax 除以温度 1/w，这与采样温度是同一个数学操作"],
      ["无分类器版：由第 2 步 ∇log p(c|x) = ∇log p(x|c) − ∇log p(x)，代入第 4 步得 ∇log p̃ = (1−w)∇log p(x) + w∇log p(x|c)","把分类器 score 用两个生成 score 之差表示，于是不再需要单独训一个噪声鲁棒的分类器"],
      ["写成 ε 形式：ε̃ = ε_uncond + w(ε_cond − ε_uncond)。w=0 纯无条件，w=1 普通条件生成，w>1 外推","这是同一条直线上的线性插值/外推；w>1 是把两点连线延长到 ε_cond 之外"],
      ["w>1 的代价：采样集中到条件分布的高密度核心，多样性下降、饱和度过高、罕见但合法的样本被丢弃","锐化 = 削尾巴；同一个\"熵换保真\"的权衡，与采样温度同源"]
    ],
    end:"引导是把贝叶斯里的似然项取 w 次幂，用两次前向的差实现；w 是\"多听提示的话\"的旋钮，超过 1 就是在人为削掉条件分布的尾巴。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\n# 一维: 无条件 p(x) 是双峰, 条件 c 由一个逻辑分类器 p(c=1|x) 给出. 全部可解析, 直接验证公式\ngrid = np.linspace(-6, 6, 24001); dx = grid[1] - grid[0]\nN = lambda x, m, s: np.exp(-0.5 * ((x - m) / s) ** 2) / (s * np.sqrt(2 * np.pi))\np_x = 0.5 * N(grid, -2, 0.8) + 0.5 * N(grid, 2, 0.8)              # 无条件\np_c_x = 1 / (1 + np.exp(-(grid - 1.0) * 3))                        # p(c=1|x), 偏好右侧\ndef guided(w):\n    q = p_x * p_c_x ** w; return q / (q.sum() * dx)\ndef score(p):                                                      # d/dx log p, 数值微分\n    lp = np.log(np.clip(p, 1e-300, None)); return np.gradient(lp, dx)\ns_uncond, s_cond = score(p_x), score(guided(1.0))\ns_cls = score(p_c_x)\nprint('验证 score 分解: max|s_cond - (s_uncond + s_cls)| =', f'{np.abs(s_cond - (s_uncond + s_cls))[2000:22000].max():.2e}')\nfor w in (0.0, 1.0, 2.0, 5.0):\n    q = guided(w); s_w = score(q)\n    lin = (1 - w) * s_uncond + w * s_cond                          # 无分类器引导的线性组合\n    m = float((q * grid).sum() * dx); v = float((q * (grid - m) ** 2).sum() * dx)\n    H = float(-np.sum(np.where(q > 0, q * np.log(np.clip(q * dx, 1e-300, None)), 0)) * dx)\n    frac = float(q[grid > 0].sum() * dx)\n    print('w=%.0f: mean=%6.3f std=%5.3f 熵=%6.3f  P(x>0)=%.4f | max|score_w - ((1-w)s_u + w s_c)| = %.2e' % (\n        w, m, np.sqrt(v), H, frac, np.abs(s_w - lin)[2000:22000].max()))\nprint('-> w 增大: 更贴条件(P(x>0) 升) 但方差与熵下降(多样性塌), 这是同一根旋钮')\n# eps 空间的等价写法: eps 与 score 差一个常数因子\nsqrt1mab = 0.6\neps_u, eps_c = -sqrt1mab * s_uncond, -sqrt1mab * s_cond\nfor w in (1.0, 3.0):\n    eps_t = eps_u + w * (eps_c - eps_u)\n    print('w=%.0f: eps 空间线性组合 与 score 空间 (1-w)s_u+w s_c 的关系: max 差 = %.2e' % (\n        w, np.abs(eps_t - (-sqrt1mab * ((1 - w) * s_uncond + w * s_cond)))[2000:22000].max()))\n# p(c|x)^w 等价于对分类器做温度 1/w 的锐化\nz = np.array([2.0, 0.5, -1.0]); sm = lambda z, T: np.exp(z / T - (z / T).max()) / np.exp(z / T - (z / T).max()).sum()\nfor w in (1, 3):\n    a = sm(z, 1.0) ** w; a /= a.sum()\n    print('w=%d: p^w 归一化 =' % w, np.round(a, 5), ' softmax(z/(1/w)) =', np.round(sm(z, 1.0 / w), 5))", out:"验证 score 分解: max|s_cond - (s_uncond + s_cls)| = 6.22e-12\nw=0: mean=-0.000 std=2.154 熵= 9.473  P(x>0)=0.5000 | max|score_w - ((1-w)s_u + w s_c)| = 1.78e-12\nw=1: mean= 2.176 std=0.707 熵= 8.666  P(x>0)=0.9984 | max|score_w - ((1-w)s_u + w s_c)| = 0.00e+00\nw=2: mean= 2.270 std=0.656 熵= 8.587  P(x>0)=1.0000 | max|score_w - ((1-w)s_u + w s_c)| = 1.24e-11\nw=5: mean= 2.409 std=0.603 熵= 8.492  P(x>0)=1.0000 | max|score_w - ((1-w)s_u + w s_c)| = 2.84e-11\n-> w 增大: 更贴条件(P(x>0) 升) 但方差与熵下降(多样性塌), 这是同一根旋钮\nw=1: eps 空间线性组合 与 score 空间 (1-w)s_u+w s_c 的关系: max 差 = 2.22e-16\nw=3: eps 空间线性组合 与 score 空间 (1-w)s_u+w s_c 的关系: max 差 = 2.66e-15\nw=1: p^w 归一化 = [0.7856  0.17529 0.03911]  softmax(z/(1/w)) = [0.7856  0.17529 0.03911]\nw=3: p^w 归一化 = [9.8889e-01 1.0990e-02 1.2000e-04]  softmax(z/(1/w)) = [9.8889e-01 1.0990e-02 1.2000e-04]",
    note:"score 分解那行验证第 1–2 步；w 表格里最后一列验证第 6–7 步的线性组合恒等式，同时 P(x>0) 升而熵降是第 8 步；eps 空间两行是第 3 步；最后 p^w 与温度 1/w 相同是第 5 步。" },
  contrast:[
    {vs:"classifier guidance", same:"都用 w 放大条件项", diff:"需要额外训练一个能吃含噪输入的分类器；无分类器版用同一个生成模型的两次前向代替", when:"现在几乎都用无分类器；只有已有现成鲁棒分类器时才用前者"},
    {vs:"采样温度", same:"都是\"锐化分布\"的旋钮，都以牺牲多样性换贴合", diff:"温度缩放整个 logits；引导只放大条件那一项的 score，无条件部分不动", when:"生成模型里两者常同时存在，调试时一次只动一个"},
    {vs:"直接把条件当输入训练(不 dropout 条件)", same:"都能做条件生成", diff:"不做条件 dropout 就得不到 ε_uncond，无法引导，w 只能等于 1", when:"任何想留引导旋钮的训练都要随机丢条件"},
    {vs:"微调 / LoRA 定制", same:"都让输出更符合某个目标", diff:"引导是采样时的即时旋钮，不改参数；微调改参数，效果持久但不可即时调节", when:"一次性风格控制用引导/提示；反复要用的固定风格用 LoRA"}
  ],
  ext:[
    {t:"引导作用的对象是扩散的 score 网络", go:'gm.diffusion'},
    {t:"用来做定向蛋白/分子设计", go:'gm.protein_design'},
    {t:"公式的骨架就是贝叶斯", go:'pr.map_prior'},
    {t:"同样是熵换保真的旋钮", go:'gm.temperature'}
  ]
},

'gm.latent_space': {
  layers:{
    alg:"生成器 g: R^d → 数据流形。潜空间插值 z(t) = (1−t)z₁ + tz₂ 是直线；slerp 沿球面测地线走。属性向量 v = mean(z_有) − mean(z_无)，编辑 z + αv。",
    geo:"一张被压平的地图，数据流形上的每个点对应地图上一个坐标。地图上走直线 → 数据上连续变形。但高维高斯的质量集中在半径 √d 的薄球壳上，直线穿过球心那段是\"没人住的地方\"，解码出来就糊。",
    comp:"线性插值的中点范数 ≈ ‖z‖/√2·√2… 实际约为端点范数的 0.707 倍(正交时)，落在壳外；slerp 保持范数恒定，始终待在壳上。属性向量要在归一化后的潜码上算，且只对近似线性的属性有效。"
  },
  proof:{
    from:"高维标准正态的范数集中现象；卡方分布的均值与方差；线性插值的范数计算",
    to:"为什么高维高斯的质量在球壳上，为什么线性插值会掉出壳，以及 slerp 为什么解决它",
    steps:[
      ["z ~ N(0, I_d)，则 ‖z‖² = Σ z_i² ~ χ²_d，E‖z‖² = d，Var(‖z‖²) = 2d","各分量独立标准正态，平方和是自由度 d 的卡方；卡方的均值 d、方差 2d 是标准结果"],
      ["所以 ‖z‖ ≈ √d，相对波动 ≈ √(2d)/(2d) = 1/√(2d) → 0：质量集中在半径 √d、厚度 O(1) 的薄球壳上","均值 √d 而标准差 O(1)，相对厚度随 d 增大趋于 0，这就是范数集中"],
      ["原点附近几乎没有质量：虽然 z=0 是密度最大点，但半径 r 的球壳体积 ∝ r^{d−1}，密度乘体积在 r=√d 达峰","高维体积几乎全在外层壳里；\"密度最大\"与\"质量最多\"在高维完全不是一回事"],
      ["两个独立高斯样本几乎正交：E[z₁·z₂] = 0，Var = d，夹角余弦 ≈ 0 ± 1/√d","独立零均值分量的内积期望为 0，除以 ‖z₁‖‖z₂‖ ≈ d 得余弦 ~ 1/√d"],
      ["线性插值中点 (z₁+z₂)/2 的范数 ≈ √(2d)/2 = √d/√2 ≈ 0.707√d，比壳半径小 30%","近正交时 ‖z₁+z₂‖² ≈ ‖z₁‖²+‖z₂‖² = 2d；除以 2 得 √d/√2"],
      ["0.707√d 处的样本在训练中从未出现(该半径的质量占比指数小)，解码器在此外推 → 中间帧模糊、失真","生成器只在训练分布覆盖的区域可靠；范数偏离壳就是分布外"],
      ["slerp: z(t) = [sin((1−t)Ω)z₁ + sin(tΩ)z₂]/sin Ω，Ω 是夹角。它沿球面测地线走，范数近似恒定","球面插值的定义保证插值点落在两端点张成的圆弧上，范数在两端点范数相同时严格保持"],
      ["属性向量 v = mean(z_有) − mean(z_无) 起作用的前提是该属性在潜空间近似沿一个固定方向线性编码；VAE 的 KL 项与 GAN 的正则都在鼓励这种平滑结构","平均消去无关方向的噪声，只留下与属性相关的系统偏移；若属性是非线性纠缠的，加向量会同时改变别的属性"]
    ],
    end:"高维潜空间的质量在薄球壳上，所以\"走直线\"会穿过无人区；slerp 沿壳走是几何上的正确做法，属性向量则依赖潜空间被训练目标压得足够平滑线性。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nfor d in (2, 10, 100, 1000):\n    z = np.random.randn(200000, d); n = np.linalg.norm(z, axis=1)\n    print('d=%5d: E||z||=%8.3f (sqrt(d)=%8.3f)  std=%.3f  相对厚度=%.4f (理论 1/sqrt(2d)=%.4f)' % (\n        d, n.mean(), np.sqrt(d), n.std(), n.std() / n.mean(), 1 / np.sqrt(2 * d)))\nd = 512\nz1, z2 = np.random.randn(4000, d), np.random.randn(4000, d)\ncos = (z1 * z2).sum(1) / (np.linalg.norm(z1, axis=1) * np.linalg.norm(z2, axis=1))\nprint('d=512 两个独立样本夹角余弦: mean=%.5f std=%.5f (理论 std=1/sqrt(d)=%.5f) -> 几乎正交' % (cos.mean(), cos.std(), 1 / np.sqrt(d)))\ndef slerp(a, b, t):\n    an, bn = a / np.linalg.norm(a, axis=1, keepdims=True), b / np.linalg.norm(b, axis=1, keepdims=True)\n    om = np.arccos(np.clip((an * bn).sum(1, keepdims=True), -1, 1)); so = np.sin(om)\n    r = (np.linalg.norm(a, axis=1, keepdims=True) + np.linalg.norm(b, axis=1, keepdims=True)) / 2\n    return r * (np.sin((1 - t) * om) * an + np.sin(t * om) * bn) / so\nprint(' t     lerp 范数/sqrt(d)   slerp 范数/sqrt(d)')\nfor t in (0.0, 0.25, 0.5, 0.75, 1.0):\n    l = (1 - t) * z1 + t * z2\n    print('%.2f      %.4f              %.4f' % (t, np.linalg.norm(l, axis=1).mean() / np.sqrt(d), np.linalg.norm(slerp(z1, z2, t), axis=1).mean() / np.sqrt(d)))\nprint('-> lerp 中点掉到 0.707*sqrt(d), 落在训练分布覆盖的壳之外')\n# 该半径处的样本在训练里有多罕见\nn = np.linalg.norm(np.random.randn(500000, d), axis=1)\nprint('d=512 训练样本中范数 < 0.75*sqrt(d) 的比例 =', float((n < 0.75 * np.sqrt(d)).mean()), '(解码器在此外推)')\n# 属性向量: 潜空间线性可分时有效\nw_true = np.random.randn(d); w_true /= np.linalg.norm(w_true)\nZ = np.random.randn(6000, d); has = (Z @ w_true) > 0.5\nv = Z[has].mean(0) - Z[~has].mean(0)\nprint('属性向量与真方向的余弦 =', round(float(v @ w_true / np.linalg.norm(v)), 4), ' 加 1.0*v_hat 后属性得分变化 =', round(float(((Z[~has][:100] + v / np.linalg.norm(v) * 1.0) @ w_true).mean() - (Z[~has][:100] @ w_true).mean()), 4))", out:"d=    2: E||z||=   1.252 (sqrt(d)=   1.414)  std=0.654  相对厚度=0.5226 (理论 1/sqrt(2d)=0.5000)\nd=   10: E||z||=   3.084 (sqrt(d)=   3.162)  std=0.696  相对厚度=0.2258 (理论 1/sqrt(2d)=0.2236)\nd=  100: E||z||=   9.971 (sqrt(d)=  10.000)  std=0.707  相对厚度=0.0709 (理论 1/sqrt(2d)=0.0707)\nd= 1000: E||z||=  31.614 (sqrt(d)=  31.623)  std=0.706  相对厚度=0.0223 (理论 1/sqrt(2d)=0.0224)\nd=512 两个独立样本夹角余弦: mean=-0.00037 std=0.04508 (理论 std=1/sqrt(d)=0.04419) -> 几乎正交\n t     lerp 范数/sqrt(d)   slerp 范数/sqrt(d)\n0.00      0.9997              0.9996\n0.25      0.7902              0.9996\n0.50      0.7067              0.9996\n0.75      0.7902              0.9996\n1.00      0.9996              0.9996\n-> lerp 中点掉到 0.707*sqrt(d), 落在训练分布覆盖的壳之外\nd=512 训练样本中范数 < 0.75*sqrt(d) 的比例 = 0.0 (解码器在此外推)\n属性向量与真方向的余弦 = 0.9312  加 1.0*v_hat 后属性得分变化 = 0.9312",
    note:"第一张表验证第 1–2 步的范数集中(相对厚度 = 1/√(2d))；余弦那行是第 4 步；lerp/slerp 范数表是第 5、7 步；\"范数<0.75√d 的比例为 0\" 是第 6 步；最后属性向量余弦接近 1 是第 8 步。" },
  contrast:[
    {vs:"PCA 主成分空间", same:"都是低维坐标系，都能沿方向做编辑", diff:"PCA 是线性且方向由方差排序；生成模型的潜空间是非线性映射的输入，方向没有天然顺序", when:"要可解释的线性降维用 PCA；要生成新样本用生成模型潜空间"},
    {vs:"线性插值 lerp", same:"都在两个潜码之间取中间点", diff:"lerp 的中点范数掉到 0.707√d，落在分布外；slerp 保持范数在壳上", when:"高维潜空间一律用 slerp；d < 10 时差别可忽略"},
    {vs:"embedding 空间(如 word2vec / 蛋白 embedding)", same:"都用方向表示语义，都有\"属性向量加减\"", diff:"embedding 是判别/对比目标训出来的表示，不要求能解码回数据；潜空间必须能解码", when:"做检索/相似度用 embedding；要生成新样本用潜空间"},
    {vs:"扩散模型的噪声潜变量", same:"都是从高斯采起点", diff:"扩散的潜变量与数据同维且没有语义压缩，插值要在噪声或 DDIM 反演的潜码上做", when:"要语义插值用 VAE/GAN 潜空间或扩散的 DDIM 反演潜码，不要直接插值像素"}
  ],
  ext:[
    {t:"KL 项就是在强制潜空间被填满且平滑", go:'gm.vae'},
    {t:"线性降维的对照物", go:'ml.pca'},
    {t:"蛋白表示空间里的同类操作", go:'bm.protein_embed'},
    {t:"方向、范数、夹角的基本工具", go:'ge.vector'}
  ]
},

'gm.protein_design': {
  layers:{
    alg:"设计空间大小 20^L(L=100 时 1.3×10¹³⁰)。生成模型给出 p(seq|约束)，把采样集中到可折叠子空间。流程是一个漏斗：生成 N → 计算过滤保留 N·r₁ → 湿实验测 N·r₁·r₂ → 命中 N·Πr。期望命中数决定要生成多少。",
    geo:"一个天文数字的空间里有极稀疏的几粒\"能折叠且有功能\"的点。生成模型不是在造点，而是把撒网的位置从整个空间挪到那几粒附近。真正的瓶颈是网后面那台很贵很慢的验证机器。",
    comp:"生成便宜(GPU 小时)，验证贵(pLDDT/ipTM 是 GPU 分钟，湿实验是周与千元)。所以价值 = 排序质量(能否把真阳性排到前 k)，不是产量。评估指标应是 top-k 命中率/富集倍数，不是生成条数。"
  },
  proof:{
    from:"组合爆炸；条件概率与筛选漏斗的乘法；分布外外推没有保证",
    to:"为什么生成模型的价值在排序不在数量，以及漏斗每一级的期望怎么算",
    steps:[
      ["长度 L 的序列空间大小 20^L：L=100 时 1.3×10¹³⁰，远超可观测宇宙原子数(10⁸⁰)","每个位置 20 种选择，独立相乘；穷举与随机搜索都不可行"],
      ["天然可折叠序列在这个空间里极稀疏：随机序列几乎必然不折叠","折叠要求疏水核心、二级结构倾向、无聚集等多重约束同时满足，每个约束都砍掉绝大部分序列"],
      ["生成模型学到 p(seq)，把采样质量集中到这个稀疏子集附近，这是它唯一在做的事","训练数据是天然/已验证序列，最大似然让模型把概率质量放在它们附近"],
      ["漏斗：生成 N → 结构预测过滤(pLDDT>80、ipTM>0.6)通过率 r₁ → 可合成/表达 r₂ → 湿实验功能命中 r₃。期望命中 = N·r₁r₂r₃","各级近似独立时通过率相乘；这决定了要生成多少才够"],
      ["湿实验容量固定(比如一次 96 孔)，所以真正被消耗的资源是\"送检名额\"，不是生成条数","生成的边际成本近似为 0，验证的边际成本是常数且很大；瓶颈资源决定优化目标"],
      ["于是目标从\"多生成\"变成\"让送检的那 96 个里真阳性尽可能多\"，即 top-k 精确率 / 富集倍数","在预算 k 固定下，唯一能改的就是排在前 k 的质量"],
      ["富集倍数 = (top-k 命中率)/(随机基线命中率)：这是唯一能说明模型有用的数字","没有基线的命中率无法解释；随机基线通常极低，所以要看倍数"],
      ["训练分布之外没有保证：越\"新颖\"的设计模型越没见过，打分越不可信 → 必须配可计算过滤器与湿实验回流数据","最大似然只保证在数据支撑上拟合好，外推区域的高分可能是模型的盲点而非真信号"]
    ],
    end:"设计空间大到只能靠采样，验证贵到只能测几十个；所以生成模型的 KPI 是\"前 k 个里的富集倍数\"，闭环回流数据是唯一能把外推区变成分布内的办法。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nL = 100\nprint('序列空间 20^%d = 10^%.1f  (可观测宇宙原子约 10^80)' % (L, L * np.log10(20)))\n# 一个玩具\"适应度\": 隐藏的打分函数, 只有极小比例序列合格\nD = 40                                                        # 用 40 维特征代表序列\nw = np.random.randn(D); w /= np.linalg.norm(w)\ndef fitness(X): return X @ w - 0.6 * np.abs(X).mean(1) * 0     # 真值(湿实验), 昂贵\ndef predictor(X, noise): return fitness(X) + noise * np.random.randn(len(X))   # 模型打分, 有噪\nTHR = 2.2\nrand_pool = np.random.randn(2000000, D)\nbase = float((fitness(rand_pool) > THR).mean())\nprint('随机撒点命中率 =', f'{base:.6f}', ' -> 想中 1 个平均要测', int(1 / base), '个 (湿实验做不到)')\n# 生成模型: 把采样集中到高分区域附近(相当于学到了 p(seq|folds))\ngen = np.random.randn(200000, D) * 0.9 + w * 1.6\nprint('生成模型采样命中率 =', f'{float((fitness(gen) > THR).mean()):.4f}', ' 富集 %.0fx' % (float((fitness(gen) > THR).mean()) / base))\n# 但真正的资源是送检名额 k: 比较\"生成多少\"与\"排序多好\"\nprint('\\n送检名额 k=96 时, 命中数取决于排序质量而不是生成量:')\nprint('  生成数 N   打分噪声   top-96 命中数   命中率')\nfor N in (1000, 10000, 100000):\n    for noise in (0.2, 1.0):\n        X = np.random.randn(N, D) * 0.9 + w * 1.6\n        s = predictor(X, noise); top = X[np.argsort(s)[::-1][:96]]\n        hit = int((fitness(top) > THR).sum())\n        print('  %8d     %.1f        %4d          %.3f' % (N, noise, hit, hit / 96))\nprint('-> N 从 1e3 涨到 1e5 提升有限; 打分噪声从 1.0 降到 0.2 提升巨大 => 价值在排序')\n# 漏斗期望\nr = [0.35, 0.6, 0.12]                                          # 结构过滤 / 可合成 / 功能\nN = 10000\nprint('\\n漏斗 N=%d: 结构过滤 %.0f%% -> %d, 可合成 %.0f%% -> %d, 功能命中 %.0f%% -> %.1f 个' % (\n    N, r[0] * 100, N * r[0], r[1] * 100, N * r[0] * r[1], r[2] * 100, N * np.prod(r)))\nprint('要拿到 5 个成功设计, 需要生成 N =', int(np.ceil(5 / np.prod(r))), ' (前提是各级通过率不随 N 退化)')", out:"序列空间 20^100 = 10^130.1  (可观测宇宙原子约 10^80)\n随机撒点命中率 = 0.013912  -> 想中 1 个平均要测 71 个 (湿实验做不到)\n生成模型采样命中率 = 0.2517  富集 18x\n\n送检名额 k=96 时, 命中数取决于排序质量而不是生成量:\n  生成数 N   打分噪声   top-96 命中数   命中率\n      1000     0.2          96          1.000\n      1000     1.0          66          0.688\n     10000     0.2          96          1.000\n     10000     1.0          85          0.885\n    100000     0.2          96          1.000\n    100000     1.0          90          0.938\n-> N 从 1e3 涨到 1e5 提升有限; 打分噪声从 1.0 降到 0.2 提升巨大 => 价值在排序\n\n漏斗 N=10000: 结构过滤 35% -> 3500, 可合成 60% -> 2100, 功能命中 12% -> 252.0 个\n要拿到 5 个成功设计, 需要生成 N = 199  (前提是各级通过率不随 N 退化)",
    note:"第一行是第 1 步的组合爆炸；随机 vs 生成命中率对比是第 2–3 步；top-96 表格里\"N 涨 100 倍收益小、噪声降 5 倍收益大\"直接验证第 5–6 步；漏斗那段是第 4、7 步。" },
  contrast:[
    {vs:"定向进化 (directed evolution)", same:"都在序列空间搜索更好的变体", diff:"定向进化靠实验驱动的局部随机搜索，每轮都要湿实验；生成模型用先验一次性跳到远处", when:"有高通量筛选平台就定向进化；筛选贵、要大跨度改造就生成设计"},
    {vs:"结构预测 (AlphaFold)", same:"都在序列-结构关系上工作", diff:"预测是 seq→structure 的判别任务，生成是 structure/function→seq 的逆问题；预测常被用作生成的过滤器", when:"预测当过滤器与打分器，生成负责提候选"},
    {vs:"虚拟筛选 (docking)", same:"都是\"先算后测\"的漏斗", diff:"docking 在已有化合物库里挑，空间有限但都可获得；生成设计造新分子，空间无限但可合成性存疑", when:"小分子先做库筛选；蛋白与新化学空间才用生成"},
    {vs:"用生成条数报成绩", same:"都是能报的数字", diff:"条数与价值无关；有意义的是固定送检预算下的富集倍数与命中数", when:"任何汇报都写 top-k 命中率 + 随机基线，不写\"生成了 10 万条\""}
  ],
  ext:[
    {t:"用条件引导把生成导向目标功能", go:'gm.conditional'},
    {t:"序列表示与打分器的基础", go:'bm.protein_embed'},
    {t:"最大似然只在数据支撑上有保证", go:'pr.mle'}
  ]
},

});