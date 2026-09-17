// 数理宇宙 v3 · 推导层：bm 生物医学应用大陆（10 节点）
// 只 push 到 window.DERIVE，不改动 v1/v2 任何文件。scratch 全部用 python3 + numpy 实跑，out 为真实输出。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {
'bm.sequence': {
  layers:{
    alg:"one-hot: 字母表大小 A 的序列 s 变 (L,A) 矩阵, X[i, idx(s_i)] = 1。k-mer: 长 k 的滑窗计数, 得 A^k 维向量 v[code(w)] += 1, code 是 k 位 A 进制数。",
    geo:"one-hot 是把每个字母放到 A 维空间的一个坐标轴上: 四个字母是四个互相垂直的单位向量, 谁跟谁都等距。k-mer 是把整条序列压成一个词袋直方图, 位置轴被抹掉。",
    comp:"one-hot 用 (L,A) 的 0/1 表, 长度不齐就补 0 行并存一个 mask; k-mer 用一次 O(L) 扫描, 每个窗口算一个整数下标去加 1, 出来的向量长度与 L 无关。"
  },
  proof:{
    from:"模型只能吃定长实数张量; 字母表有限 (DNA 4, 蛋白 20); 序列长度可变",
    to:"为什么 one-hot 是 (L,A)、为什么 k-mer 有 A^k 维且丢位置、为什么 padding 必须配 mask",
    steps:[
      ["把每个字母映到 A 维标准基 e_idx(c), 整条序列堆成 (L,A) 矩阵","标准基是能让 A 个离散符号互相区分且不引入任何虚假次序的最小表示 (若用 0,1,2,3 编码, 模型会认为 G 比 A 大、C 在 A 与 G 之间)"],
      ["由此任意两字母的内积为 0、欧氏距离都是 √2, 化学相似性 (Leu~Ile) 在输入端完全不存在","标准基互相正交是定义; 相似性只能靠下游模型或预训练 embedding 学回来"],
      ["k-mer: 把每个长 k 窗口当作一个 A 进制 k 位数, 取值范围 0..A^k−1, 所以特征维数是 A^k","A 个符号排 k 位共 A^k 种排列, 这是乘法原理; 编码成整数只是为了当数组下标"],
      ["k-mer 向量只记录窗口出现次数, 不记录窗口在哪; 两条不同序列只要滑窗多重集相同, 向量就相同","计数是对位置求和, 求和对置换不变; 代价换来的是任意 L 都映到同一维数"],
      ["k 增大维数指数爆炸而样本不变, 向量迅速变稀疏; DNA k=3 是 64 维, 蛋白 k=3 已经 8000 维","非零维数 ≤ L−k+1, 而总维数 A^k, 二者比值随 k 指数衰减"],
      ["长度不齐时 one-hot 补零行到统一 L_max, 但零行的比例 = 1 − L/L_max 是长度的直接泄漏, 任何按位置求均值/求和的层都会把它当特征","补零是让张量成形的技术操作, 不是数据; 只有 mask 能告诉模型哪些行不该参与统计"],
      ["因此: 整条一个数的任务选 k-mer 或 embedding 平均 (定长); 每个位点一个数的任务必须保住长度维, 用 one-hot + 卷积/注意力 + mask","任务的输出形状决定输入能不能扔位置; 扔了位置就永远拿不回来"]
    ],
    end:"编码即决定模型能看到什么: one-hot 保位置丢相似性, k-mer 保定长丢位置, padding 不配 mask 就把长度当标签。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nfrom itertools import product\nfrom collections import defaultdict\nnp.random.seed(0)\nALPH = 'ACGT'; idx = {c: i for i, c in enumerate(ALPH)}\ndef one_hot(seq):\n    X = np.zeros((len(seq), 4)); X[np.arange(len(seq)), [idx[c] for c in seq]] = 1; return X\ndef kmer(seq, k):\n    v = np.zeros(4**k)\n    for i in range(len(seq)-k+1):\n        code = 0\n        for c in seq[i:i+k]: code = code*4 + idx[c]\n        v[code] += 1\n    return v\ns = ''.join(np.random.choice(list(ALPH), 300))\nX = one_hot(s)\nprint('one-hot 形状', X.shape, ' 元素数', X.size, ' 每行恰一个 1:', bool((X.sum(1) == 1).all()))\n# 1) one-hot = 4 个正交单位向量: 任意两字母内积 0, 距离全相等 -> 化学相似性被抹平\nE = one_hot(ALPH); D = np.sqrt(((E[:, None]-E[None])**2).sum(-1))\nprint('字母两两内积 = 单位阵:', bool((E@E.T == np.eye(4)).all()), ' 任意两字母距离都是 %.3f (Leu-Ile 与 Leu-Asp 在模型眼里等距)' % D[0, 1])\n# 2) k-mer: 维数 4^k, 定长, 但丢位置: 找两条不同序列 3-mer 向量完全相同\nfor k in (1, 2, 3): print('k=%d 维数 %4d  长300序列非零维 %d' % (k, 4**k, (kmer(s, k) > 0).sum()))\ngroups = defaultdict(list)\nfor t in product(ALPH, repeat=6): groups[tuple(kmer(''.join(t), 3))].append(''.join(t))\ndup = [g for g in groups.values() if len(g) > 1]\na, b = dup[0][0], dup[0][1]\nprint('4096 条长6序列 -> %d 个不同 3-mer 向量; 例 %s 与 %s 3-mer 相同 %s, one-hot 相同 %s' % (len(groups), a, b, bool((kmer(a, 3) == kmer(b, 3)).all()), bool((one_hot(a) == one_hot(b)).all())))\n# 3) 长度不齐: padding 行全 0; 不 mask 时 \"全 0 行占比\" 就是长度的泄漏\nseqs = [s[:50], s[:200], s]\nP = np.zeros((3, 300, 4))\nfor i, q in enumerate(seqs): P[i, :len(q)] = one_hot(q)\nmask = P.sum(2) > 0\nprint('pad 到 300 后 全0行占比', [round(float(1 - m.mean()), 3) for m in mask], ' 无 mask 的列均值(A):', np.round(P[:, :, 0].mean(1), 3).tolist(), ' 有 mask:', [round(float(P[i, mask[i], 0].mean()), 3) for i in range(3)])", out:"one-hot 形状 (300, 4)  元素数 1200  每行恰一个 1: True\n字母两两内积 = 单位阵: True  任意两字母距离都是 1.414 (Leu-Ile 与 Leu-Asp 在模型眼里等距)\nk=1 维数    4  长300序列非零维 4\nk=2 维数   16  长300序列非零维 16\nk=3 维数   64  长300序列非零维 63\n4096 条长6序列 -> 3898 个不同 3-mer 向量; 例 AAACAA 与 AACAAA 3-mer 相同 True, one-hot 相同 False\npad 到 300 后 全0行占比 [0.833, 0.333, 0.0]  无 mask 的列均值(A): [0.04, 0.17, 0.263]  有 mask: [0.24, 0.255, 0.263]",
    note:"一段 one_hot/内积单位阵对应第 1–2 步; kmer 与 4096 条序列分组对应第 3–4 步 (找到两条不同序列 3-mer 相同); 最后 pad 与 mask 的列均值对比是第 6 步。" },
  contrast:[
    {vs:"整数编码 (A=0,C=1,G=2,T=3)", same:"都把字母变数字", diff:"整数编码强加了大小与距离次序, one-hot 让四个字母等距无序", when:"树模型偶尔能吃整数编码; 任何做内积/距离的模型必须 one-hot 或 embedding"},
    {vs:"预训练 embedding (ESM)", same:"都是字符串到张量", diff:"one-hot 不含任何先验, embedding 里已经压进进化与结构信息", when:"n 上千且任务是 motif 类用 one-hot+CNN; n 几十上百用 embedding"},
    {vs:"词袋 / TF-IDF (NLP)", same:"k-mer 就是生物序列的词袋", diff:"自然语言有天然分词, 序列没有, 所以用固定 k 滑窗", when:"只关心组成用 k-mer; 关心位点用保长度的表示"},
    {vs:"结构编码 (接触图/点云)", same:"都是把分子变张量", diff:"序列编码只看一维顺序, 结构编码看三维坐标", when:"构象依赖的问题 (表位可及性、TCR-pMHC 接触面) 序列编码天花板低"}
  ],
  ext:[
    {t:"在 one-hot 之上加预训练先验就是蛋白 embedding", go:"bm.protein_embed"},
    {t:"保住长度维之后靠 RNN/CNN/注意力沿序列扫", go:"dl.rnn"},
    {t:"A^k 来自乘法原理", go:"co.perm_comb"},
    {t:"LLM 的 tokenizer 同样在决定模型的原子", go:"lm.tokenization"}
  ]
},

'bm.protein_embed': {
  layers:{
    alg:"E = f_θ(seq) ∈ R^{L×d} (ESM-2 d=1280); mean pool: e = (1/L) Σ_i E_i; 下游 ŷ = w·e, w = argmin ‖y − Xw‖² + λ‖w‖² = (XᵀX + λI)⁻¹Xᵀy。",
    geo:"每条序列是 1280 维空间里的一团 L 个点, mean pool 取质心。预训练把进化上相近的序列放到相近的区域; 你的几十个样本只是这团云里的几十个点, 下游线性模型是在这片区域里画一个超平面。",
    comp:"前向一次 ESM 得 (L,1280), 沿 L 取均值, 堆成 (n,1280) 的 X; n 几十上百时 XᵀX 秩 ≤ n < d, 必须加 λI 才可逆 (或取最小范数解); 单点突变要取突变位点那一行而不是均值。"
  },
  proof:{
    from:"预训练 embedding 是低秩、高维的连续表示; 湿实验 n ≪ d; 最小二乘与岭回归的正规方程",
    to:"为什么 n ≪ d 下要线性 + 正则、为什么 mean pool 会抹掉点突变、为什么余弦高不等于功能同",
    steps:[
      ["正规方程 XᵀX w = Xᵀy; 当 n < d, XᵀX 是 d×d 但秩 ≤ n, 不可逆, 训练误差为 0 的 w 有无穷多个","秩(XᵀX) = 秩(X) ≤ min(n,d); 零空间维数 ≥ d − n > 0, 任意零空间向量加到解上训练误差不变"],
      ["加 λI: XᵀX + λI 正定可逆, 解唯一, 且 λ→0 的极限是最小范数解","λI 把所有特征值抬高 λ > 0; 在零空间方向上唯一最小化 ‖w‖ 的解就是最小范数解"],
      ["任何能把 n 个点全背下来且无正则的模型 (MLP) 在 n ≪ d 时泛化更差, 因为容量远超数据能约束的自由度","自由度 ≥ 样本数时训练误差恒为 0, 训练误差不再携带任何关于泛化的信息, 只有先验 (正则、线性) 在起作用"],
      ["mean pool 是把 (L,d) 左乘 (1/L)·1ᵀ, 单点突变只改一行, 质心移动 = (E'_i − E_i)/L, 被稀释 L 倍","均值对每一行的权重是 1/L, 这是线性算子的定义; L=250 时差异缩 250 倍, 余弦逼近 1"],
      ["因此点突变效应要取突变位点的 token 向量或 (突变体 − 野生型) 的位点差, 让差异不被平均","位点向量对该位点的变化权重是 1, 且上下文注意力让它也携带邻近残基信息"],
      ["高维随机向量的余弦集中在 0 附近 (std ≈ 1/√d ≈ 0.028), 所以余弦 0.98 只说明两条序列几乎相同, 不说明功能相同","余弦是 d 个近独立项之和除以范数, 中心极限给 std ~ 1/√d; embedding 的训练目标是序列共现不是功能"],
      ["无监督 PCA 先降到 k 维再回归是另一种正则: 它保留方差最大的方向, 但活性相关方向未必方差最大","PCA 不看标签, 若有效方向方差小会被扔掉; 岭回归按方差加权收缩而不是硬截断"]
    ],
    end:"n ≪ d 时能做的只有线性 + 正则, 差别只在正则的形状; embedding 的每一步平均都在扔信息, 点突变要取位点。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nL, d, n = 250, 1280, 80\nwt = np.random.randn(L, d)\nprint('ESM 输出 (L,d) =', wt.shape, ' mean pool ->', wt.mean(0).shape)\ncos = lambda a, b: a@b/np.linalg.norm(a)/np.linalg.norm(b)\n# 1) mean pool 是投影到 \"全 1 方向\": 单点突变的差异被平均稀释 L 倍\nmut = wt.copy(); mut[100] = np.random.randn(d)\nprint('WT vs 单点突变: mean-pool 余弦 %.4f | 突变位点 token 余弦 %.4f | 差向量范数 全长均值 %.3f vs 位点 %.3f' % (cos(wt.mean(0), mut.mean(0)), cos(wt[100], mut[100]), np.linalg.norm(mut.mean(0)-wt.mean(0)), np.linalg.norm(mut[100]-wt[100])))\n# 2) n=80 << d=1280: 普通最小二乘有无穷多解, 训练 R2=1 但测试崩; 岭回归 (W^T W + lam I)^-1 可逆, 稳\nF = np.random.randn(12, d)                                    # 真实 embedding 是低秩的: 12 个潜因子铺满 1280 维\ndef draw(m): Z = np.random.randn(m, 12); return Z@F/np.sqrt(12) + 2.0*np.random.randn(m, d), Z\nX, Z = draw(n); Xte, Zte = draw(500)\nbeta = np.array([2, -1, 1.5, 1, -2, 0, 0, 0, 0, 0, 0, 0.])      # 活性只依赖前 5 个潜因子\ny = Z@beta + 2.5*np.random.randn(n); yte = Zte@beta + 2.5*np.random.randn(500)   # 湿实验读数噪声大\nr2 = lambda y, yh: 1 - ((y-yh)**2).sum()/((y-y.mean())**2).sum()\nprint('X^T X 的秩 = %d (< d=%d, 不可逆 -> OLS 有无穷多个训练误差为 0 的解)' % (np.linalg.matrix_rank(X.T@X), d))\nfor lam in (0, 100, 1000, 10000):\n    w_r = np.linalg.solve(X.T@X + lam*np.eye(d), X.T@y) if lam else np.linalg.lstsq(X, y, rcond=None)[0]\n    print('岭 lambda=%-5d 训练 R2 %.3f  测试 R2 %.3f  |w|=%.2f' % (lam, r2(y, X@w_r), r2(yte, Xte@w_r), np.linalg.norm(w_r)) + ('  (lambda=0 取最小范数解)' if lam == 0 else ''))\n# \"MLP\" 的替身: 2000 个随机 ReLU 隐单元 + 线性读出 (只训读出层也够背下 80 个点)\nR = np.random.randn(d, 2000)/np.sqrt(d); Hh = np.maximum(X@R, 0); Ht = np.maximum(Xte@R, 0)\nw_m = np.linalg.lstsq(Hh, y, rcond=None)[0]\nprint('随机特征 MLP(2000 隐): 训练 R2 %.3f  测试 R2 %.3f  <- 非线性 + 无正则, 背下训练集' % (r2(y, Hh@w_m), r2(yte, Ht@w_m)))\n# 3) 先 PCA 到 10 维再线性: 用训练集的主方向 (无标签) 降维\nU, s, Vt = np.linalg.svd(X - X.mean(0), full_matrices=False); P = Vt[:10].T\nw_p = np.linalg.lstsq((X - X.mean(0))@P, y - y.mean(), rcond=None)[0]\nprint('PCA(10)+OLS: 测试 R2 %.3f  (先无监督抓住主方向, 再在 10 维上回归)' % r2(yte, (Xte - X.mean(0))@P@w_p + y.mean()))\n# 4) embedding 余弦高 != 功能同: 随机高维向量的余弦本身就集中在 0 附近, 0.98 只说明序列几乎一样\nr = np.random.randn(2000, d); print('随机 1280 维向量对的余弦 std = %.4f (1/sqrt(d)=%.4f)' % (((r[:1000]*r[1000:]).sum(1)/np.linalg.norm(r[:1000], axis=1)/np.linalg.norm(r[1000:], axis=1)).std(), 1/np.sqrt(d)))", out:"ESM 输出 (L,d) = (250, 1280)  mean pool -> (1280,)\nWT vs 单点突变: mean-pool 余弦 0.9962 | 突变位点 token 余弦 0.0193 | 差向量范数 全长均值 0.197 vs 位点 49.244\nX^T X 的秩 = 80 (< d=1280, 不可逆 -> OLS 有无穷多个训练误差为 0 的解)\n岭 lambda=0     训练 R2 1.000  测试 R2 0.457  |w|=0.37  (lambda=0 取最小范数解)\n岭 lambda=100   训练 R2 1.000  测试 R2 0.456  |w|=0.37\n岭 lambda=1000  训练 R2 0.988  测试 R2 0.443  |w|=0.33\n岭 lambda=10000 训练 R2 0.746  测试 R2 0.320  |w|=0.17\n随机特征 MLP(2000 隐): 训练 R2 1.000  测试 R2 0.410  <- 非线性 + 无正则, 背下训练集\nPCA(10)+OLS: 测试 R2 0.250  (先无监督抓住主方向, 再在 10 维上回归)\n随机 1280 维向量对的余弦 std = 0.0267 (1/sqrt(d)=0.0280)",
    note:"秩 = 80 与 λ 扫描对应第 1–3 步 (λ=0 即最小范数解, 随机特征 MLP 是无正则非线性的替身); mean-pool vs 位点余弦对应第 4–5 步; 随机向量余弦 std 对应第 6 步; PCA(10) 对应第 7 步。" },
  contrast:[
    {vs:"one-hot 序列编码", same:"都把序列变成向量", diff:"one-hot 无先验、20L 维稀疏; embedding 含预训练先验、1280 维稠密", when:"n 几十上百必用 embedding; n 上千且任务局部用 one-hot+CNN"},
    {vs:"文本 embedding (lm.embedding)", same:"同一类技术: 自监督预训练后取隐状态", diff:"蛋白模型按单残基切 token, 训练目标是掩码残基预测; 文本模型按 BPE 切", when:"蛋白序列必须用蛋白模型, 通用 LLM 的 tokenizer 会把残基乱切"},
    {vs:"微调整个 ESM", same:"都用预训练权重", diff:"冻结骨干只训线性头是 1280 个参数; 微调是几亿参数", when:"n < 几千冻结; n 上万且分布与天然序列差异大再考虑微调 (LoRA)"},
    {vs:"PCA 降维后回归", same:"都是对 n ≪ d 的正则", diff:"PCA 硬截断方差小的方向且不看标签; 岭回归软收缩", when:"先岭回归拿基线; 想可视化或可解释再 PCA"}
  ],
  ext:[
    {t:"正规方程与最小范数解的来源", go:"la.least_squares"},
    {t:"λ‖w‖² 是正则化家族的一员", go:"op.regularization"},
    {t:"mean pool 是投影到全 1 方向", go:"la.projection"},
    {t:"用 embedding 做最近邻/检索", go:"ml.knn"}
  ]
},

'bm.image_seg': {
  layers:{
    alg:"Dice = 2|A∩B|/(|A|+|B|), IoU = |A∩B|/|A∪B|; 令 I=|A∩B|, s=|A|+|B|: |A∪B| = s − I, 于是 IoU = I/(s−I), Dice = 2I/s, 消去 s 得 IoU = Dice/(2−Dice)。",
    geo:"两个蒙版是两块面积, Dice 拿交集面积对两块面积的平均, IoU 拿交集对并集。全预测背景时交集为 0, 两者都为 0, 而像素准确率却是背景占比 (97%)。",
    comp:"逐像素 AND/OR 计数三个整数 I、|A|、|B| 即可; 训练时用软 Dice: 2Σ p·g/(Σp + Σg) 对概率图可导, 分子只由前景像素决定, 背景像素只出现在分母。"
  },
  proof:{
    from:"集合的交并计数; 前景像素占比 π ≪ 1; 分类指标的定义",
    to:"Dice 与 IoU 的换算恒等式、为什么类别不平衡时 accuracy 失效而 Dice 有意义",
    steps:[
      ["|A∪B| = |A| + |B| − |A∩B| (容斥)","交集被两次计入, 减一次"],
      ["记 I = |A∩B|, s = |A|+|B|: Dice = 2I/s, IoU = I/(s − I)","直接代入定义"],
      ["由 Dice 解出 s = 2I/Dice, 代入 IoU = I/(2I/Dice − I) = Dice/(2 − Dice); 反解得 Dice = 2IoU/(1 + IoU)","两式只含 I 与 s 两个量, 消去 s 后二者一一对应, 单调递增"],
      ["因此 Dice 与 IoU 排序完全一致, 但 Dice ≥ IoU 且 Dice 对同样的重叠给更高的数, 差距在中等重叠处最大","f(x) = 2x/(1+x) 在 [0,1] 上 ≥ x, 等号只在 0 与 1"],
      ["像素准确率 = (TP + TN)/N; 前景占 π 时, 全判背景得 1 − π ≈ 0.97, 而此时 I = 0, Dice = IoU = 0","TN 是背景像素数 ≈ N(1−π), 它主导了 accuracy 的分子; Dice 的定义里根本没有 TN"],
      ["逐像素交叉熵同理被背景项主导 (背景像素贡献了绝大部分损失), 所以最优化它的模型偏向背景","损失是对全部像素求和, 谁多谁说了算; 软 Dice 的分子只对前景求和"],
      ["Dice 对小目标更敏感: 同样偏移 3 像素, 半径 6 的目标 Dice 掉到 0.70, 半径 20 的只到 0.91","错位带的面积 ∝ 周长×偏移 ∝ r, 目标面积 ∝ r², 相对误差 ∝ 1/r"]
    ],
    end:"Dice 与 IoU 是同一个量的两种刻度 (IoU = D/(2−D)); 它们不含 TN, 所以不会被 97% 的背景绑架。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nH = W = 64\nyy, xx = np.mgrid[:H, :W]\ngt = ((yy-32)**2 + (xx-32)**2) < 6**2            # 一个细胞, 前景 ~2.7%\npred_shift = ((yy-32)**2 + (xx-35)**2) < 6**2    # 蒙版整体偏 3 像素\npred_bg = np.zeros_like(gt)                       # 全判背景\ndef stats(a, b):\n    i = (a & b).sum(); u = (a | b).sum(); tot = a.sum() + b.sum()\n    return (2*i/tot if tot else 0.0), (i/u if u else 0.0), (a == b).mean()\nprint('前景占比 %.1f%%' % (100*gt.mean()))\nfor name, p in (('偏移 3px', pred_shift), ('全背景  ', pred_bg)):\n    d, j, acc = stats(gt, p)\n    print('%s: pixel acc=%.3f  Dice=%.3f  IoU=%.3f | 换算 2IoU/(1+IoU)=%.3f  Dice/(2-Dice)=%.3f' % (name, acc, d, j, 2*j/(1+j), d/(2-d)))\n# Dice = 2I/(|A|+|B|), IoU = I/(|A|+|B|-I): 令 |A|+|B| = 2I/D 代入即得 IoU = D/(2-D). 随机蒙版上核对恒等式\nerr = 0.0\nfor _ in range(500):\n    a = np.random.rand(H, W) < 0.1; b = np.random.rand(H, W) < np.random.rand()*0.3\n    d, j, _ = stats(a, b); err = max(err, abs(d - 2*j/(1+j)), abs(j - d/(2-d)))\nprint('500 组随机蒙版 换算恒等式最大误差 =', err)\n# 为什么 accuracy 没用: 背景像素贡献了 97% 的项; 逐像素交叉熵同样被背景主导\np = np.clip(pred_shift.astype(float)*0.8 + 0.05 + 0.05*np.random.rand(H, W), 1e-6, 1-1e-6)\nbce_pix = -(gt*np.log(p) + (~gt)*np.log(1-p))\nprint('BCE 总量中来自背景像素的比例 %.1f%%  | 软 Dice = %.3f (只由前景重叠决定)' % (100*bce_pix[~gt].sum()/bce_pix.sum(), 2*(p*gt).sum()/(p.sum() + gt.sum())))\n# Dice 对小目标更敏感: 同样偏移 3px, 半径 6 vs 半径 20\nbig = ((yy-32)**2 + (xx-32)**2) < 20**2; big_s = ((yy-32)**2 + (xx-35)**2) < 20**2\nprint('同样偏 3px: 半径6 Dice=%.3f  半径20 Dice=%.3f  -> 小目标分割难在指标上直接体现' % (stats(gt, pred_shift)[0], stats(big, big_s)[0]))", out:"前景占比 2.7%\n偏移 3px: pixel acc=0.984  Dice=0.697  IoU=0.535 | 换算 2IoU/(1+IoU)=0.697  Dice/(2-Dice)=0.535\n全背景  : pixel acc=0.973  Dice=0.000  IoU=0.000 | 换算 2IoU/(1+IoU)=0.000  Dice/(2-Dice)=0.000\n500 组随机蒙版 换算恒等式最大误差 = 2.7755575615628914e-17\nBCE 总量中来自背景像素的比例 79.5%  | 软 Dice = 0.273 (只由前景重叠决定)\n同样偏 3px: 半径6 Dice=0.697  半径20 Dice=0.906  -> 小目标分割难在指标上直接体现",
    note:"stats() 里的三个计数就是第 2 步; 两条换算打印与 500 组随机蒙版对应第 3 步的恒等式; 全背景 acc 0.973 / Dice 0 对应第 5 步; BCE 背景占比对应第 6 步; 半径 6 vs 20 对应第 7 步。" },
  contrast:[
    {vs:"像素准确率 accuracy", same:"都是逐像素比较预测与真值", diff:"accuracy 计 TN, 被背景主导; Dice 不计 TN", when:"前景占比接近 50% 时 accuracy 尚可; 分割任务几乎永远用 Dice/IoU"},
    {vs:"F1 分数", same:"Dice 在二分类上恒等于 F1 = 2PR/(P+R)", diff:"只是场景不同: F1 说样本, Dice 说像素/体素", when:"报告时二者可互称; 医学影像习惯 Dice"},
    {vs:"IoU / Jaccard", same:"同一重叠度的单调变换", diff:"IoU 更严格, 数值更低; 检测任务用 IoU 阈值 (0.5) 判命中", when:"分割报 Dice, 检测报 IoU@0.5; 换算即可对照"},
    {vs:"Hausdorff 距离", same:"都度量两个蒙版的差异", diff:"Dice 看面积重叠, Hausdorff 看最远边界点距离, 对边界毛刺敏感", when:"关心边界精度 (放疗靶区) 加报 Hausdorff"}
  ],
  ext:[
    {t:"产生蒙版的网络结构", go:"dl.unet"},
    {t:"容斥原理是第 1 步", go:"co.inclusion_exclusion"},
    {t:"换设备就崩是批次效应在图像上的版本", go:"bm.batch_effect"},
    {t:"同一个 TN 陷阱在分类指标里", go:"ml.metrics"}
  ]
},

'bm.flow_gating': {
  layers:{
    alg:"观测 = 真实 × S (S 为溢出矩阵, S_ij = 染料 i 漏进检测器 j 的比例), 补偿 = 观测 × S⁻¹。门链: N_子 = N_父 × p_子|父。有限稀释: 阴性孔比例 = e^{−cf}, f = −ln(阴性)/c。",
    geo:"补偿是把被斜着拉伸的散点云拉回正交坐标: 单阳细胞在未补偿图上沿对角线拖一条尾巴, 乘逆矩阵后尾巴回到轴上。门是一层层套着的圈, 每个圈的百分比都相对于外面那个圈。",
    comp:"每个细胞一行、每个检测器一列的矩阵右乘 inv(S); 强度先 log10/arcsinh 再画; 门内计数逐层相乘; 有限稀释数 96 孔里有几孔全阴, 取负对数除以每孔细胞数。"
  },
  proof:{
    from:"荧光叠加是线性的 (光子计数相加); 泊松分布的零项 P(0) = e^{−λ}; 条件概率的链式法则",
    to:"补偿为什么是矩阵求逆、为什么强度要取对数、门的百分比为什么必须写分母、前体频率为什么从阴性孔比例反推",
    steps:[
      ["每个检测器读到的是所有染料贡献之和: obs_j = Σ_i true_i · S_ij, 写成矩阵即 obs = true · S","光子计数相加是物理上的线性叠加; 溢出比例 S_ij 由单染对照测得, 与细胞无关"],
      ["S 是对角占优的方阵 (每种染料主要进自己的检测器), 可逆, 所以 true = obs · S⁻¹, 这就是补偿","对角占优保证行列式非零; 补偿不是估计而是精确解线性方程组"],
      ["未补偿时仅 ch1 阳性的细胞在 ch2 读到 true_1 · S_12 ≈ 1000 × 0.15 = 150 的假信号, 越亮漏得越多 → 假双阳; 补偿后归零","溢出与真实强度成正比, 所以亮细胞的假信号超过阈值"],
      ["补偿也把检测器噪声乘进 S⁻¹, 补偿后噪声 std 按 S⁻¹ 的列范数放大, 溢出越严重放大越多","线性变换下噪声协方差变为 S⁻ᵀ Σ S⁻¹; 这就是为什么要选溢出小的染料组合"],
      ["荧光强度跨 2–3 个数量级且右偏, 线性轴上 70% 细胞挤在第一格; log10 把乘性差异变成加性, 才看得到阴/阳双峰","对数把比例变差值; 阴阳峰的强度比是常数, 在 log 轴上是常数间距"],
      ["门 = 决策树的一条路径, P(CD8⁺CD69⁺) = P(CD8⁺) · P(CD69⁺ | CD8⁺); 同一个 30% 若不写父门可被误读为全体的 30%","乘法法则 P(A∩B) = P(A)P(B|A); 报数不写分母就丢了条件"],
      ["有限稀释: 每孔 c 个细胞, 前体频率 f, 每孔前体数近似 Poisson(cf); 一孔阴性当且仅当前体数为 0, 概率 e^{−cf}","c 大 f 小, 二项 (c, f) 逼近泊松; 阳性孔只要 ≥1 个前体, 所以零项是唯一干净的量"],
      ["于是 f = −ln(阴性孔比例)/c; 多个 c 做线性回归 ln(阴性) 对 c 的斜率就是 −f","取对数把指数变直线; 用多个稀释度可检验泊松假设 (单击动力学) 是否成立"]
    ],
    end:"补偿是解线性方程组, 门是条件概率连乘, 前体频率是泊松零项取对数: 三件事都只用到线性与概率的定义。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\n# 1) 补偿 = 线性解混. S[i,j] = 染料 i 的光漏进检测器 j 的比例 (行 = 染料, 列 = 检测器)\nS = np.array([[1.00, 0.15, 0.02],\n              [0.05, 1.00, 0.20],\n              [0.00, 0.08, 1.00]])\nn = 20000\npos = np.random.rand(n, 3) < [0.3, 0.2, 0.1]\ntrue = np.random.lognormal(3, 0.5, (n, 3))                   # 自发荧光 ~ 20\ntrue[pos] += np.random.lognormal(7, 0.4, pos.sum())          # 阳性 ~ 1000\nobs = true @ S                                                # 观测 = 真实 x 溢出矩阵\ncomp = obs @ np.linalg.inv(S)                                 # 补偿 = 右乘逆矩阵\nprint('补偿后与真实的最大差 = %.2e  (线性系统精确可逆)' % np.abs(comp - true).max())\nonly1 = pos[:, 0] & ~pos[:, 1]; thr = 200\nprint('仅 ch1+ 的 %d 个细胞: 未补偿时 ch2>%d 被判阳 %.1f%% (假双阳) | 补偿后 %.1f%%' % (only1.sum(), thr, 100*(obs[only1, 1] > thr).mean(), 100*(comp[only1, 1] > thr).mean()))\n# 补偿放大噪声: 逆矩阵把检测器噪声也混进来\nnoisy = obs + np.random.randn(n, 3)*5\nprint('观测噪声 std 5 -> 补偿后各通道噪声 std', np.round((noisy@np.linalg.inv(S) - true).std(0), 2).tolist(), ' (逆矩阵行范数', np.round(np.linalg.norm(np.linalg.inv(S), axis=0), 3).tolist(), ')')\n# 2) 强度跨 2-3 个数量级: 线性轴上 97% 挤在第一格, log 轴才见双峰\nx = comp[:, 0]\nprint('线性轴 10 格直方图', np.histogram(x, bins=10)[0].tolist())\nprint('log10 轴 10 格直方图', np.histogram(np.log10(np.clip(x, 1, None)), bins=10)[0].tolist())\n# 3) 门 = 条件概率链: 子门计数 = 父门计数 x 门内占比\ncd8 = np.random.rand(n) < 0.02; cd69 = cd8 & (np.random.rand(n) < 0.3)\nprint('CD8+ 占全部 %.2f%%; CD69+ 占 CD8+ 的 %.1f%% = 占全部 %.2f%%; 双阳绝对数 %d' % (100*cd8.mean(), 100*cd69.sum()/cd8.sum(), 100*cd69.mean(), cd69.sum()))\n# 4) 有限稀释: 每孔 c 个细胞, 前体频率 f, 每孔前体数 ~ Poisson(cf), 阴性孔比例 = P(0) = e^{-cf} -> f = -ln(阴性比例)/c\nf_true = 1/2000\nfor c in (500, 1000, 2000, 4000):\n    neg = np.mean(np.random.poisson(c*f_true, 96) == 0)\n    print('每孔 %4d 细胞: 96 孔中阴性 %.3f  -> f = -ln(neg)/c = 1/%.0f  (真 1/2000)' % (c, neg, -c/np.log(neg)))", out:"补偿后与真实的最大差 = 9.09e-13  (线性系统精确可逆)\n仅 ch1+ 的 4819 个细胞: 未补偿时 ch2>200 被判阳 50.8% (假双阳) | 补偿后 0.0%\n观测噪声 std 5 -> 补偿后各通道噪声 std [5.03, 5.21, 5.15]  (逆矩阵行范数 [1.009, 1.038, 1.037] )\n线性轴 10 格直方图 [14020, 1609, 2393, 1291, 458, 144, 65, 14, 5, 1]\nlog10 轴 10 格直方图 [6, 595, 5608, 6701, 1047, 17, 29, 1841, 3786, 370]\nCD8+ 占全部 2.00%; CD69+ 占 CD8+ 的 30.2% = 占全部 0.60%; 双阳绝对数 121\n每孔  500 细胞: 96 孔中阴性 0.740  -> f = -ln(neg)/c = 1/1657  (真 1/2000)\n每孔 1000 细胞: 96 孔中阴性 0.625  -> f = -ln(neg)/c = 1/2128  (真 1/2000)\n每孔 2000 细胞: 96 孔中阴性 0.406  -> f = -ln(neg)/c = 1/2220  (真 1/2000)\n每孔 4000 细胞: 96 孔中阴性 0.156  -> f = -ln(neg)/c = 1/2155  (真 1/2000)",
    note:"obs = true@S 与 comp = obs@inv(S) 对应第 1–2 步, 假双阳比例对应第 3 步, 噪声放大对应第 4 步; 两个直方图对应第 5 步; CD8/CD69 一行是第 6 步; 有限稀释循环是第 7–8 步。" },
  contrast:[
    {vs:"光谱解混 (spectral unmixing)", same:"都是观测 = 真实 × 混合矩阵后求逆", diff:"传统补偿 S 是方阵 (n 染料 = n 检测器); 光谱流式检测器多于染料, 用最小二乘 (伪逆)", when:"常规仪器用补偿; 全光谱仪器用解混, 数学上是同一件事"},
    {vs:"单细胞聚类 (bm.cell_cluster)", same:"都是给细胞分群", diff:"gating 是人手画的决策树, 每层一个二维图; 聚类是算法在高维空间分", when:"标志物少 (< 15 色) 且有先验用 gating; 高维 (CyTOF、scRNA) 用聚类再回头核对"},
    {vs:"决策树 (ml.tree)", same:"gating 就是手工决策树: 每层按一两个特征切分", diff:"树是数据驱动找阈值; 门是人按 FMO 对照定阈值", when:"想自动化 gating 可以训一棵树, 但阈值仍要对照 FMO"},
    {vs:"ELISPOT 数斑点", same:"都在估计抗原特异性细胞频率", diff:"ELISPOT 直接数阳性细胞, 有限稀释靠泊松零项间接反推", when:"频率 > 1/10⁴ 用 ELISPOT 或四聚体染色; 更稀有或要功能定义 (增殖) 用有限稀释"}
  ],
  ext:[
    {t:"矩阵可逆与解线性方程组", go:"la.inverse"},
    {t:"泊松零项与二项极限", go:"pr.binomial_poisson"},
    {t:"log 轴为什么能看见双峰", go:"ns.log_scale"},
    {t:"门链的乘法法则", go:"pr.conditional"}
  ]
},

'bm.dose_response': {
  layers:{
    alg:"Hill 占位率 θ = xʰ/(xʰ + EC50ʰ) = 1/(1 + (EC50/x)ʰ); 四参数 logistic y = bottom + (top − bottom)·θ。令 u = log x: θ = 1/(1 + e^{−h·ln10·(u − log EC50)}), 就是以 log EC50 为中心的 logistic。",
    geo:"线性浓度轴上曲线先陡后缓像双曲线; 换成 log 轴就成了以 EC50 为中心、上下对称的 S 形, h 决定 S 的陡度: 从 10% 爬到 90% 要跨 81^{1/h} 倍浓度。",
    comp:"在 log10 x 上拟合: 非线性参数 (log EC50, h) 用 Gauss-Newton 迭代, 线性参数 (bottom, top) 每步闭式最小二乘; 初值用粗网格; 两端各要 2 个台阶点, 否则 top 与 EC50 不可辨识。"
  },
  proof:{
    from:"受体-配体结合平衡 R + L ⇌ RL, K_d = [R][L]/[RL]; 质量守恒 [R]_tot = [R] + [RL]",
    to:"四参数 logistic 从占位率推出、EC50 与 h 的物理意义、为什么剂量取 log",
    steps:[
      ["占位率 θ = [RL]/[R]_tot = [L]/([L] + K_d)","把 [R] = K_d[RL]/[L] 代入守恒式, 除以 [R]_tot; 这是 Langmuir 等温式"],
      ["θ 在 [L] = K_d 时恰为 1/2: 半数占位的浓度就是 K_d; 若响应正比于占位率, 半最大效应浓度 EC50 = K_d","1/(1+1) = 1/2; 一般情形 EC50 与 K_d 之间隔着信号放大, 所以 EC50 ≠ K_d 但形状相同"],
      ["协同结合 (n 个位点同时结合) 时 θ = [L]ⁿ/([L]ⁿ + K_dⁿ), 经验上放宽为实数 h (Hill 系数): θ = 1/(1 + (EC50/x)ʰ)","n 个位点同时占位的平衡常数是 K_dⁿ; h 是经验陡度, h>1 正协同, h<1 负协同或异质受体"],
      ["测到的响应有底 (bottom) 有顶 (top): y = bottom + (top − bottom)·θ, 这就是四参数模型","仪器读数是占位率的仿射变换; 四个参数正好是: 两个台阶、中点、陡度"],
      ["令 u = log₁₀ x: (EC50/x)ʰ = 10^{h(log EC50 − u)}, 故 θ = 1/(1 + 10^{−h(u − log EC50)}), 是标准 logistic 函数","指数的对数换底; logistic 关于中点中心对称: θ(u₀+δ) + θ(u₀−δ) = 1"],
      ["所以 y(EC50/10) + y(EC50·10) = top + bottom, 在 log 轴上关于 (log EC50, 半高) 对称, 线性轴上没有这个对称","对称性只在 u 坐标下成立, 所以浓度必须取 log 等距设置, 拟合与作图都在 log 轴"],
      ["从 θ = 0.1 到 0.9: (EC50/x)ʰ 从 9 变到 1/9, 浓度比 = 81^{1/h}; h=1 是 81 倍, h=4 只有 3 倍","两个等式相除得 (x₉₀/x₁₀)ʰ = 81; 这是 h 的可操作意义"],
      ["若两端台阶没测到, top 与 EC50 可以同时变大而残差几乎不变 (参数不可辨识), 拟合会漂到无穷","数据只约束了曲线的上升段; 上升段近似 top·(x/EC50)ʰ, 只能定 top/EC50ʰ 这个组合"]
    ],
    end:"4PL 是 Langmuir 占位率 + 仿射读数 + 经验陡度; 取 log 是因为 logistic 只在 log 坐标下对称, 也因此两端台阶不可省。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\n# Hill 占位率 theta = x^h/(x^h + K^h) = 1/(1 + (K/x)^h);  4PL: y = bot + (top - bot)*theta\ndef f4pl(x, bot, top, ec50, h): return bot + (top - bot)/(1 + (ec50/x)**h)\ntop, bot, ec50, h = 100.0, 5.0, 10.0, 1.5\nx = 10**np.linspace(-1, 3, 13)                        # 0.1..1000 nM, log 等距\ny = f4pl(x, bot, top, ec50, h) + 2*np.random.randn(x.size)\n# 1) 令 u = log x: theta = 1/(1 + e^{-h ln10 (u - log EC50)}) 就是 logistic, 关于 (log EC50, 半高) 中心对称\nmid = (top + bot)/2\nprint('y(EC50/10) + y(EC50*10) = %.3f = 2*半高 %.1f;  y(EC50) = %.1f' % (f4pl(ec50/10, bot, top, ec50, h) + f4pl(ec50*10, bot, top, ec50, h), 2*mid, f4pl(ec50, bot, top, ec50, h)))\nprint('10%%->90%% 的浓度跨度 = 81^(1/h): h=1 %.0f 倍, h=1.5 %.1f 倍, h=4 %.1f 倍' % (81, 81**(1/1.5), 81**0.25))\nprint('线性 x 轴上 x=1,10,100 的 y:', np.round(f4pl(np.array([1., 10., 100.]), bot, top, ec50, h), 1).tolist(), ' <- 只有 log 轴等距才对称')\n# 2) 拟合: 非线性参数 (log10 EC50, h) 用 Gauss-Newton, 线性参数 (bot, top) 每步闭式最小二乘 (变量投影)\ndef resid(p, lx, y):                                     # p = (log10 EC50, ln h): h>0 由参数化保证\n    s = 1/(1 + 10**(np.clip((p[0] - lx)*np.exp(p[1]), -30, 30))); A = np.c_[1 - s, s]\n    bt = np.linalg.lstsq(A, y, rcond=None)[0]; return y - A@bt, bt\ndef fit(x, y):\n    lx = np.log10(x)\n    grid = [(np.sum(resid((a, b), lx, y)[0]**2), a, b) for a in np.linspace(-1, 3, 17) for b in np.log((0.5, 1, 2, 4))]\n    p = np.array(min(grid)[1:])                           # 粗网格初值\n    for it in range(100):\n        r, _ = resid(p, lx, y); J = np.zeros((y.size, 2))\n        for k in range(2):\n            dp = np.zeros(2); dp[k] = 1e-6; J[:, k] = (resid(p + dp, lx, y)[0] - r)/1e-6\n        step = np.linalg.lstsq(J, r, rcond=None)[0]; step = np.clip(step, -0.3, 0.3); p = p - step   # 限步长的 Gauss-Newton\n        if np.abs(step).max() < 1e-10: break\n    r, bt = resid(p, lx, y); return 10**p[0], np.exp(p[1]), bt, np.sqrt((r**2).mean()), it + 1\ne, hh, bt, rmse, it = fit(x, y)\nprint('全曲线 13 点拟合 (%d 次迭代): EC50=%.2f (真 10)  h=%.2f (真 1.5)  bot=%.1f top=%.1f  RMSE=%.2f' % (it, e, hh, bt[0], bt[1], rmse))\n# 3) 顶台阶没测到: 只测到 10 nM (= 真 EC50 处, 曲线才爬到一半)\nkeep = x <= 10; e, hh, bt, rmse, it = fit(x[keep], y[keep])\nprint('只测到 10 nM (%d 点, %d 次迭代): log10 EC50=%.1f  h=%.2f  top=%.0f  RMSE=%.2f -> 没有顶台阶, top 与 EC50 不可辨识, 一起漂向无穷' % (keep.sum(), it, np.log10(e), hh, bt[1], rmse))", out:"y(EC50/10) + y(EC50*10) = 105.000 = 2*半高 105.0;  y(EC50) = 52.5\n10%->90% 的浓度跨度 = 81^(1/h): h=1 81 倍, h=1.5 18.7 倍, h=4 3.0 倍\n线性 x 轴上 x=1,10,100 的 y: [7.9, 52.5, 97.1]  <- 只有 log 轴等距才对称\n全曲线 13 点拟合 (10 次迭代): EC50=10.64 (真 10)  h=1.47 (真 1.5)  bot=7.7 top=101.5  RMSE=1.48\n只测到 10 nM (7 点, 100 次迭代): log10 EC50=9.0  h=0.00  top=6511  RMSE=8.48 -> 没有顶台阶, top 与 EC50 不可辨识, 一起漂向无穷",
    note:"第一段三个 print 对应第 5–7 步 (对称性、81^{1/h}、线性轴不对称); resid/fit 是第 4 步模型的变量投影拟合, 全曲线拟合反解 EC50≈10; 最后只测到 10 nM 的拟合漂飞对应第 8 步。" },
  contrast:[
    {vs:"逻辑回归 (ml.logistic)", same:"同一条 logistic 曲线 σ(a u + b)", diff:"逻辑回归输出概率、用交叉熵、自变量任意; 4PL 输出连续读数、用最小二乘、自变量必须是 log 浓度且多了 top/bottom", when:"二分类用逻辑回归; 剂量-读数用 4PL"},
    {vs:"Michaelis-Menten v = Vmax·S/(Km + S)", same:"同一个 Langmuir 双曲线, h=1 的 4PL", diff:"MM 说酶速率对底物, 4PL 说响应对配体; MM 通常不取 log", when:"酶动力学用 MM (Lineweaver-Burk 已过时, 直接非线性拟合); 药理用 4PL"},
    {vs:"IC50", same:"同为半最大浓度", diff:"IC50 是抑制到一半, 依赖底物/激动剂浓度 (Cheng-Prusoff); EC50 是激活到一半", when:"跨实验比较抑制剂要换算成 K_i, 不能直接比 IC50"},
    {vs:"线性回归拟合上升段", same:"都在拟合浓度-响应", diff:"线性只对上升段中间一小段近似成立, 无法给出 EC50 与 top", when:"只有粗筛时看斜率; 要报 EC50 必须全曲线 4PL"}
  ],
  ext:[
    {t:"EC50 拟合是一个非线性最小二乘问题", go:"ca.optimization"},
    {t:"log 变换的代数", go:"al.exp_log"},
    {t:"给药后浓度随时间怎么变", go:"bm.pk_ode"},
    {t:"同一条 logistic 在分类里", go:"ml.logistic"}
  ]
},

'bm.survival': {
  layers:{
    alg:"S(t) = P(T > t) = Π_{t_i ≤ t} (1 − d_i/n_i), d_i 是 t_i 时刻的事件数, n_i 是 t_i 之前仍在观察 (未事件、未删失) 的人数。删失只影响后续的 n_i, 不出现在乘积里。",
    geo:"一条向右下走的阶梯: 每个事件时刻掉一台阶, 台阶高度 = 当前高度 × d/n; 删失在曲线上只是一个小竖标, 不掉台阶, 但让后面的台阶变高 (n 变小)。",
    comp:"把事件时刻排序去重, 对每个 t_i 数 n_i = #{观察时间 ≥ t_i}, d_i = #{在 t_i 发生事件}, 累乘 (1 − d_i/n_i); 中位生存期 = S 首次 ≤ 0.5 的 t_i。"
  },
  proof:{
    from:"生存函数 S(t) = P(T > t); 条件概率乘法法则; 删失与事件时间独立 (非信息删失)",
    to:"Kaplan-Meier 为什么是条件生存概率的连乘、删失为什么只减风险集不减 S",
    steps:[
      ["把时间轴切在事件时刻 t_1 < t_2 < …; 活过 t_k 等价于依次活过 t_1, t_2, …, t_k","事件 {T > t_k} = ∩_{i≤k} {T > t_i}, 因为 t 递增"],
      ["乘法法则: P(T > t_k) = Π_{i ≤ k} P(T > t_i | T > t_{i−1}) = Π (1 − P(T = t_i | T ≥ t_i))","P(A∩B) = P(A)P(B|A) 反复用; 每一项是 '到了 t_i 还活着的人里在 t_i 出事的比例' 的补"],
      ["在 t_i 出事的条件概率用当时数据估计: h_i = d_i/n_i, n_i 是 t_i 时刻仍在风险集里的人","这是该条件概率的极大似然估计 (二项比例); 只用到 t_i 那一刻还在被观察的人"],
      ["t_i 之前被删失的人不在 n_i 里: 他们贡献了 '活过删失时刻' 的信息 (进入了更早的 n_j), 但对 t_i 的条件概率既不算事件也不算幸存","删失后我们不知道他在 t_i 是死是活; 把他算幸存会高估 S, 算事件会低估 S; 唯一无偏的处理是不算"],
      ["于是删失只通过缩小后续的 n_i 起作用, 让每一台阶掉得更多 (d_i/n_i 变大), 而不直接乘进 S","S 的因子只在事件时刻产生; 删失时刻 d = 0, 因子为 1"],
      ["非信息删失下 d_i/n_i 是 h(t_i) 的无偏估计, 连乘得到 S(t) 的一致估计; 模拟里 KM 贴合 e^{−t/10}, 把删失当事件或丢掉都系统性偏低","删失独立于 T 时风险集是幸存者的随机子样本, 比例估计无偏; 丢掉删失者等于只保留短随访的人"],
      ["中位生存期是 S 首次 ≤ 0.5 的时刻; 曲线没跌到 0.5 就报不出, 此时不能用均值代替","均值需要曲线尾部到 0, 而删失让尾部未观测; 这是设计决定的, 不是缺陷"]
    ],
    end:"KM 只是乘法法则 + 每一时刻的二项比例; 删失被处理成 '此后不再提供信息', 所以只减分母不减 S。"
  },
  scratch:{ lang:'python', code:"import numpy as np\ndef km(t, e):\n    t = np.asarray(t, float); e = np.asarray(e, int)\n    ut, d = np.unique(t[e == 1], return_counts=True)             # 各事件时刻与事件数\n    n = np.array([(t >= u).sum() for u in ut])                    # 风险集: 该时刻仍在观察的人\n    return ut, n, d, np.cumprod(1 - d/n)\ndef S_at(t, e, tt):\n    ut, _, _, S = km(t, e); i = np.searchsorted(ut, tt, 'right'); return S[i - 1] if i else 1.0\n# 10 人: t=5 两事件; t=6,7,8 三人删失; t=9 一事件; 其余 15 时删失\nt = [5, 5, 6, 7, 8, 9, 15, 15, 15, 15]; e = [1, 1, 0, 0, 0, 1, 0, 0, 0, 0]\nprint(' t  风险集n  事件d  1-d/n   S(t)')\nfor u, n, d, S in zip(*km(t, e)): print('%2d    %2d      %d    %.3f   %.4f' % (u, n, d, 1 - d/n, S))\nprint('S(9) = 0.8 x (1 - 1/5) = %.4f: 三个删失只把 t=9 的风险集从 8 减到 5, 没有直接乘进 S' % S_at(t, e, 9))\n# 三种对待删失的方式\nprint('正确 KM S(9)=%.4f | 把删失当事件 S(9)=%.4f (偏低) | 直接丢掉删失者 S(9)=%.4f (偏低, 且丢了他们活到 6-8 的信息)' % (S_at(t, e, 9), S_at(t, [1]*10, 9), S_at([5, 5, 9], [1, 1, 1], 9)))\n# 连乘 = 条件概率: P(T>t) = Π P(T>t_i | T>=t_i). 用已知真值 (指数分布, 独立删失) 的大样本核对\nnp.random.seed(0); N = 20000\nT = np.random.exponential(10, N); C = np.random.exponential(15, N)\nobs = np.minimum(T, C); ev = (T <= C).astype(int)\nprint('模拟 N=%d, 删失率 %.0f%%' % (N, 100*(1 - ev.mean())))\nfor tt in (5, 10, 20): print('t=%2d  KM=%.4f  真 S=e^{-t/10}=%.4f | 把删失当事件 %.4f | 丢掉删失 %.4f' % (tt, S_at(obs, ev, tt), np.exp(-tt/10), S_at(obs, np.ones(N, int), tt), S_at(obs[ev == 1], ev[ev == 1], tt)))\n# 中位生存期 = S 首次 <= 0.5 的时刻; 曲线没跌到 0.5 就报不出\nut, _, _, S = km(obs, ev); print('中位生存期 = %.2f  (真 10 ln2 = %.2f)' % (ut[np.argmax(S <= 0.5)], 10*np.log(2)))", out:" t  风险集n  事件d  1-d/n   S(t)\n 5    10      2    0.800   0.8000\n 9     5      1    0.800   0.6400\nS(9) = 0.8 x (1 - 1/5) = 0.6400: 三个删失只把 t=9 的风险集从 8 减到 5, 没有直接乘进 S\n正确 KM S(9)=0.6400 | 把删失当事件 S(9)=0.4000 (偏低) | 直接丢掉删失者 S(9)=0.0000 (偏低, 且丢了他们活到 6-8 的信息)\n模拟 N=20000, 删失率 40%\nt= 5  KM=0.6025  真 S=e^{-t/10}=0.6065 | 把删失当事件 0.4301 | 丢掉删失 0.4286\nt=10  KM=0.3647  真 S=e^{-t/10}=0.3679 | 把删失当事件 0.1872 | 丢掉删失 0.1835\nt=20  KM=0.1391  真 S=e^{-t/10}=0.1353 | 把删失当事件 0.0361 | 丢掉删失 0.0362\n中位生存期 = 6.84  (真 10 ln2 = 6.93)",
    note:"km() 里 n 与 d 的计数和 cumprod 是第 2–3 步; 10 人表与 S(9) = 0.8×(1−1/5) 是第 4–5 步 (三个删失只把 n 从 8 减到 5); 20000 人模拟对照真值 e^{−t/10} 是第 6 步; 末行是第 7 步。" },
  contrast:[
    {vs:"把删失当阴性/事件", same:"都在算 '活到 t 的比例'", diff:"把删失者当作在删失时刻出事, S 系统性偏低 (模拟里 0.43 vs 真 0.61)", when:"永远不要; 唯一例外是删失本身就是终点定义 (那就不叫删失)"},
    {vs:"Cox 比例风险模型", same:"都处理删失, 都基于风险集", diff:"KM 是无参数的单臂描述; Cox 估计协变量对风险 h(t) 的乘性效应 HR, 不估 S 的形状", when:"画曲线、报中位生存用 KM; 比较组间并校正协变量用 Cox"},
    {vs:"log-rank 检验", same:"都用 KM 的风险集 n_i、d_i", diff:"log-rank 把每个时刻的 '观测事件 − 期望事件' 累加做检验, 不估 S", when:"两条 KM 曲线要报 p 值用 log-rank; 要效应量报 HR"},
    {vs:"HR = 2 与 '寿命减半'", same:"都在说组间差异", diff:"HR 是瞬时风险比, 不是时间比; HR=2 在指数分布下中位时间是 1/2, 其他分布不是", when:"解释 HR 只说 '任一时刻出事的风险是 2 倍'"}
  ],
  ext:[
    {t:"连乘的第 2 步是条件概率乘法法则", go:"pr.conditional"},
    {t:"d/n 是二项比例的极大似然估计", go:"pr.mle"},
    {t:"n 小时报置信区间而不是点估计", go:"bm.small_n"},
    {t:"半衰期是指数分布的中位生存期", go:"bm.pk_ode"}
  ]
},

'bm.pk_ode': {
  layers:{
    alg:"dC/dt = −kC ⟹ C(t) = C₀e^{−kt}; t½ = ln2/k; CL = k·V; AUC = ∫₀^∞ C dt = C₀/k = Dose/CL; 多剂量间隔 τ 时第 n 剂后累积到稳态的比例 1 − 2^{−nτ/t½}。",
    geo:"一只底部有洞的桶, 水位越高漏得越快: 曲线是指数下坡, 每过一个半衰期高度减半, 无论从多高开始。log 轴上是一条直线, 斜率 −k。",
    comp:"欧拉法 C_{n+1} = C_n(1 − k·dt) 一步步递推, dt 越小越接近 e^{−kt}; 半衰期在数值解上找 C 首次 ≤ C₀/2 的时刻; AUC 用梯形法累加。"
  },
  proof:{
    from:"消除速率与当前浓度成正比 (酶/转运体未饱和, 一级动力学); 导数与指数函数的定义; 定积分",
    to:"指数衰减、半衰期与剂量无关、清除率与分布容积的关系、AUC 的意义",
    steps:[
      ["单室: 药物瞬间均匀分布在体积 V 里, 消除量 ∝ 浓度: dA/dt = −CL·C, A = C·V, 所以 dC/dt = −(CL/V)·C ≡ −kC","一级动力学 = 消除器官每单位时间清空固定体积 (CL) 的血; 除以 V 就把 '量' 换成 '浓度'"],
      ["dC/dt = −kC 的解: 分离变量 dC/C = −k dt, 积分得 ln C = −kt + c, C = C₀e^{−kt}","唯一满足 '导数等于自身乘常数' 的函数是指数; 初值 C(0) = C₀ = Dose/V"],
      ["欧拉法 C_{n+1} = C_n + dt·(−kC_n) = C_n(1 − k dt), n 步后 C₀(1 − k dt)^{t/dt} → C₀e^{−kt} (dt→0)","(1 − x/m)^m → e^{−x}; 欧拉法在有限 dt 下系统性偏低, 误差 ∝ dt"],
      ["半衰期: C₀/2 = C₀e^{−k t½} ⟹ t½ = ln2/k, 里面没有 C₀","两边除以 C₀ 后 C₀ 消失; 这是一级动力学的签名: 每个半衰期都减半, 与起点无关"],
      ["CL = k·V: k 是 '每小时清掉的比例', V 是 '药物分布的表观体积', 乘起来是 '每小时清空的血体积'","由第 1 步 k = CL/V 移项; CL 与 V 是独立的生理量, k 与 t½ 是它们的派生量"],
      ["AUC = ∫₀^∞ C₀e^{−kt} dt = C₀/k = (Dose/V)/(CL/V) = Dose/CL","指数的积分; AUC 只依赖剂量与清除率, 不依赖 V, 所以 AUC 是 '总暴露量', 用来算生物利用度 F = AUC_oral/AUC_iv"],
      ["多剂量, 间隔 τ = t½: 第 n 剂前的谷浓度 = C₀(½ + ¼ + … + ½ⁿ) = C₀(1 − 2^{−n}), 5 剂到 97%","线性系统叠加原理: 各剂独立衰减后相加, 是等比数列求和"],
      ["酶饱和时消除速率变为常数 Vmax (零阶): dC/dt = −Vmax, 直线下降, 降到一半的时间 = C₀/(2Vmax) 随剂量变","Michaelis-Menten 在 C ≫ Km 时 v → Vmax; 此时 '半衰期' 不再是常数, 剂量翻倍 AUC 远不止翻倍"]
    ],
    end:"一级消除 ⟹ 指数 ⟹ 半衰期与剂量无关 ⟹ AUC = Dose/CL; 这一串全部来自 '消除 ∝ 浓度' 一个假设, 饱和时它失效。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nk, C0, V = 0.1, 100.0, 10.0          # /h, mg/L, L\n# 1) dC/dt = -kC 的欧拉法 C_{n+1} = C_n + dt*(-k C_n) = C_n (1 - k dt) -> (1 - k dt)^{t/dt} -> e^{-kt}\nfor dt in (1.0, 0.1, 0.01):\n    C = C0\n    for _ in range(int(round(20/dt))): C += dt*(-k*C)\n    print('dt=%-4g 欧拉 C(20)=%.4f  解析 100e^{-2}=%.4f  误差 %+.4f' % (dt, C, C0*np.exp(-2), C - C0*np.exp(-2)))\n# 2) 半衰期: C0/2 = C0 e^{-k t} -> t = ln2/k, 与 C0 无关 (一阶动力学的签名)\nt = np.linspace(0, 80, 80001)\nfor c0 in (100.0, 10.0):\n    C = c0*np.exp(-k*t); print('C0=%3.0f: 数值找到 C=C0/2 的时刻 %.3f h  (ln2/k = %.3f);  再过一个 t1/2 -> %.2f' % (c0, t[np.argmax(C <= c0/2)], np.log(2)/k, c0/4))\n# 3) CL = k V;  AUC = ∫C dt = C0/k = Dose/CL  (梯形法数值积分 vs 解析)\nC = C0*np.exp(-k*t); auc = np.sum((C[1:] + C[:-1])/2*np.diff(t))\nprint('CL = kV = %.1f L/h;  AUC(0-80h) 梯形 %.2f  解析 C0/k %.2f  Dose/CL %.2f' % (k*V, auc, C0/k, C0*V/(k*V)))\n# 4) 多剂量, 间隔 tau = t1/2: 第 n 剂前谷浓度 = C0 (1 - 2^-n), 5 个半衰期到 97%\ntau = np.log(2)/k; Cm = np.zeros_like(t)\nfor j in range(8): Cm += np.where(t >= j*tau, C0*np.exp(-k*(t - j*tau)), 0)\nfor j in (1, 3, 5): print('第 %d 剂后谷浓度 %.2f = 稳态谷 %.0f 的 %.1f%%  (公式 1-2^-n = %.1f%%)' % (j, Cm[np.argmax(t >= j*tau) - 1], C0, 100*Cm[np.argmax(t >= j*tau) - 1]/C0, 100*(1 - 0.5**j)))\n# 5) 零阶 (酶饱和): dC/dt = -Vmax, 直线下降, \"半衰期\" 随剂量变\nVmax = 5.0\nfor c0 in (100.0, 10.0): print('零阶 Vmax=%.0f: C0=%3.0f 降到一半需 %4.1f h  (一阶下都是 %.2f h)' % (Vmax, c0, c0/2/Vmax, np.log(2)/k))", out:"dt=1    欧拉 C(20)=12.1577  解析 100e^{-2}=13.5335  误差 -1.3759\ndt=0.1  欧拉 C(20)=13.3980  解析 100e^{-2}=13.5335  误差 -0.1356\ndt=0.01 欧拉 C(20)=13.5200  解析 100e^{-2}=13.5335  误差 -0.0135\nC0=100: 数值找到 C=C0/2 的时刻 6.932 h  (ln2/k = 6.931);  再过一个 t1/2 -> 25.00\nC0= 10: 数值找到 C=C0/2 的时刻 6.932 h  (ln2/k = 6.931);  再过一个 t1/2 -> 2.50\nCL = kV = 1.0 L/h;  AUC(0-80h) 梯形 999.66  解析 C0/k 1000.00  Dose/CL 1000.00\n第 1 剂后谷浓度 50.00 = 稳态谷 100 的 50.0%  (公式 1-2^-n = 50.0%)\n第 3 剂后谷浓度 87.50 = 稳态谷 100 的 87.5%  (公式 1-2^-n = 87.5%)\n第 5 剂后谷浓度 96.88 = 稳态谷 100 的 96.9%  (公式 1-2^-n = 96.9%)\n零阶 Vmax=5: C0=100 降到一半需 10.0 h  (一阶下都是 6.93 h)\n零阶 Vmax=5: C0= 10 降到一半需  1.0 h  (一阶下都是 6.93 h)",
    note:"欧拉三行对应第 3 步 (误差随 dt 线性缩小), C₀=100/10 找半衰期对应第 4 步, CL 与 AUC 三种算法一致对应第 5–6 步, 多剂量谷浓度对应第 7 步, 零阶两行对应第 8 步。" },
  contrast:[
    {vs:"零阶消除 (乙醇、苯妥英)", same:"都是 ODE 描述浓度下降", diff:"零阶 dC/dt = −Vmax 直线, '半衰期' ∝ 剂量; 一级指数, 半衰期常数", when:"治疗浓度接近 Km 的药 (苯妥英) 要用 MM 模型, 剂量微调会引起浓度剧变"},
    {vs:"二室模型", same:"都是线性 ODE 系统", diff:"二室有分布相 + 消除相, 曲线是两个指数之和, log 轴上先陡后缓", when:"静脉给药后早期浓度下降明显快于末端相时用二室"},
    {vs:"放射性衰变 / 一阶化学反应", same:"同一个方程 dN/dt = −λN", diff:"只是变量名不同: λ ↔ k, 半衰期同为 ln2/λ", when:"任何 '速率 ∝ 存量' 的系统都套这个解"},
    {vs:"剂量反应曲线 (bm.dose_response)", same:"都是药物的定量模型", diff:"PK 说浓度随时间 (身体对药做什么), PD 说效应随浓度 (药对身体做什么)", when:"PK/PD 串起来: C(t) 进 4PL 得 E(t)"}
  ],
  ext:[
    {t:"dC/dt = −kC 是最简单的常微分方程", go:"ca.ode"},
    {t:"AUC 是曲线下面积", go:"ca.integral_area"},
    {t:"e^{−kt} 与 ln2/k 的代数", go:"al.exp_log"},
    {t:"浓度进入 4PL 得效应", go:"bm.dose_response"}
  ]
},

'bm.cell_cluster': {
  layers:{
    alg:"X (细胞×基因) → X/行和 × 10⁴ (CPM) → log1p → 取方差最大的 2000 基因 → 中心化后 SVD 取前 50 列 (PCA) → kNN 图 (k=15) → 图上社区发现 (Leiden) → UMAP 只用来画。",
    geo:"两万维空间里每个细胞是一个点, 但测序深度让所有点沿一个方向被拉长, 少数高表达基因又让某几个坐标轴压倒一切; 归一化和 log 把云团摆正, PCA 把它塌到 50 维, 然后只相信每个点的 15 个最近邻组成的那张网。",
    comp:"每步都是矩阵操作: 行归一化、逐元素 log1p、按列方差排序取子集、一次 SVD、一次 n×n 距离 (或近似) 取 top-k, 再在稀疏图上跑社区算法; 分辨率参数决定簇数。"
  },
  proof:{
    from:"counts 服从 Poisson/负二项, 均值 ∝ 测序深度 × 真实比例; PCA 找方差最大方向; 高维空间中距离集中",
    to:"为什么每一步是必需的, 以及为什么聚类要做在 kNN 图上而不是原始空间",
    steps:[
      ["counts_ij ~ Poisson(depth_i · π_ij), 深度 depth_i 跨几倍, 所以原始矩阵最大的方差方向就是深度","所有基因的均值同乘 depth_i, 这是一个所有细胞共有的一维变化, 方差最大; 模拟里 PC1 与深度相关 0.998"],
      ["除以行和 (CPM) 消掉 depth_i, 只留比例 π_ij","Poisson 均值 ∝ depth, 比例的期望与深度无关"],
      ["表达量跨几个数量级且右偏, 方差 ∝ 均值 (Poisson) 甚至 ∝ 均值² (过离散); 不取 log 时 PCA 被几个最高表达基因主导, 中等表达的标志基因 (转录因子、受体) 被淹没","PCA 按方差加权, 方差随均值增长; log1p 把乘性差异变加性, 方差趋于稳定"],
      ["两万基因大多是与细胞类型无关的噪声, 选高变基因是把信噪比最高的坐标留下来","无信息基因的方差是纯技术噪声, 保留它们只会稀释距离"],
      ["PCA 到 50 维: 前几十个主成分承载了结构, 其余是噪声; 同时缓解高维距离集中 (最近邻/最远邻距离比从 0.74 降到 0.32)","在高维各向同性噪声下所有点对距离趋于相等, 最近邻失去意义; 降维后邻居关系才可靠"],
      ["只信局部: 建 kNN 图, 在图上找社区 (Leiden 最大化模块度); 不在 PCA 空间直接做 K-means","细胞类型的流形是弯曲的、大小不一的, 全局距离与球形簇假设都不成立; 局部邻居关系是最稳的信息"],
      ["UMAP 只优化局部邻居的保持, 簇间距离与簇面积没有全局意义; 分辨率参数改簇数, 不代表 '真实' 类型数","UMAP 的目标函数只惩罚近邻错位; 社区数由分辨率控制是模块度的性质"]
    ],
    end:"流水线的每一步都在删掉一种已知的伪信号 (深度、尺度、噪声基因、高维距离), 剩下的只敢用局部邻居; UMAP 是画, 不是证据。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nn_cell, n_gene, K = 600, 2000, 3\nlab = np.repeat(np.arange(K), n_cell//K)\nbase = np.random.lognormal(0, 1.5, n_gene); mu = np.tile(base, (n_cell, 1))   # 表达跨几个数量级\nmid = np.argsort(base)[800:860]                                   # 标志基因取中等表达的基因 (转录因子/受体那一档)\nfor c in range(K): mu[np.ix_(lab == c, mid[c*20:(c+1)*20])] *= 3   # 每类 20 个标志基因, 只高 3 倍\ndepth = 10**np.random.uniform(3.5, 4, n_cell)                      # 测序深度差 3 倍\nX = np.random.poisson(mu/mu.sum(1, keepdims=True)*depth[:, None]).astype(float)\ndef pca(Z, k): Z = Z - Z.mean(0); U, s, Vt = np.linalg.svd(Z, full_matrices=False); return U[:, :k]*s[:k], s**2/(s**2).sum()\ndef knn(P, k=15): D = ((P[:, None, :] - P[None, :, :])**2).sum(-1); return np.argsort(D, 1)[:, 1:k+1]\ndef pipeline(X, norm=True, log=True, n_hvg=200):\n    Z = X/X.sum(1, keepdims=True)*1e4 if norm else X               # CPM: 去掉深度\n    if log: Z = np.log1p(Z)                                        # 稳方差\n    hvg = np.argsort(Z.var(0))[-n_hvg:]                            # 高变基因\n    Z = Z[:, hvg]\n    return pca(Z, 20)\nfor norm, log in ((False, False), (True, False), (True, True)):\n    P, ev = pipeline(X, norm, log); nn = knn(P)\n    print('CPM=%-5s log1p=%-5s  PC1 方差占比 %.3f  PC1 与深度相关 %.3f  kNN(15) 邻居同类型比例 %.3f' % (norm, log, ev[0], abs(np.corrcoef(P[:, 0], depth)[0, 1]), (lab[nn] == lab[:, None]).mean()))\n# 图上聚类 (标签传播 = Leiden 的极简替身): 只用局部邻居关系\nP, _ = pipeline(X); nn = knn(P); c = np.arange(n_cell)\nfor _ in range(15):\n    for i in np.random.permutation(n_cell):\n        v, cnt = np.unique(c[nn[i]], return_counts=True); c[i] = v[np.argmax(cnt)]\nids = np.unique(c)\nprint('kNN 图标签传播 -> %d 个簇, 每簇多数类型占比 %s' % (len(ids), [round(float(np.bincount(lab[c == j]).max()/(c == j).sum()), 3) for j in ids]))\n# 高维距离不可信: 原始 2000 维 vs PCA 20 维, 最近邻/最远邻距离比\nZ = np.log1p(X/X.sum(1, keepdims=True)*1e4)\nfor name, M in (('2000 维', Z), ('PCA 20 维', P)):\n    D = np.sqrt(((M[:50, None] - M[None])**2).sum(-1)); D[np.arange(50), np.arange(50)] = np.inf\n    print('%s: 最近邻距 / 最远邻距 中位数 = %.3f' % (name, np.median(D.min(1)/np.where(np.isinf(D), -1, D).max(1))))", out:"CPM=False log1p=False  PC1 方差占比 0.751  PC1 与深度相关 0.998  kNN(15) 邻居同类型比例 0.342\nCPM=True  log1p=False  PC1 方差占比 0.040  PC1 与深度相关 0.077  kNN(15) 邻居同类型比例 0.337\nCPM=True  log1p=True   PC1 方差占比 0.047  PC1 与深度相关 0.016  kNN(15) 邻居同类型比例 0.985\nkNN 图标签传播 -> 3 个簇, 每簇多数类型占比 [1.0, 1.0, 1.0]\n2000 维: 最近邻距 / 最远邻距 中位数 = 0.738\nPCA 20 维: 最近邻距 / 最远邻距 中位数 = 0.324",
    note:"三种预处理的对比 (PC1 与深度相关、kNN 邻居纯度) 对应第 1–3 步; hvg 选择是第 4 步; pca() 与最近/最远邻距离比是第 5 步; 图上标签传播 (Leiden 的极简替身) 对应第 6 步。" },
  contrast:[
    {vs:"K-means (ml.kmeans)", same:"都在分簇", diff:"K-means 假设球形、等大小簇且要预设 K; 图社区发现只用局部邻居, 簇可以任意形状", when:"单细胞永远先 kNN 图 + Leiden; K-means 只在 PCA 空间做粗分或初始化"},
    {vs:"PCA (ml.pca)", same:"流水线里就用它", diff:"PCA 是线性降维, 用来去噪与降到几十维; 它不是可视化终点也不是聚类", when:"PCA 到 50 维给 kNN 用; 画图再 UMAP"},
    {vs:"流式 gating (bm.flow_gating)", same:"都给细胞分群", diff:"gating 是低维手工阈值; 聚类是高维无监督", when:"< 15 个标志物用 gating; 转录组用聚类再用标志基因回头命名"},
    {vs:"批次效应校正 (Harmony)", same:"都在 PCA 空间操作", diff:"聚类找生物结构, 校正先删掉批次结构", when:"多批次样本在 PCA 后、建图前先校正, 但校正后的值别拿去做差异表达检验"}
  ],
  ext:[
    {t:"PCA 就是中心化后的 SVD", go:"la.svd"},
    {t:"高维距离为什么不可信", go:"ge.distance"},
    {t:"降维结果里两团分开先问批次", go:"bm.batch_effect"},
    {t:"簇内 vs 簇间的差异检验要按样本不按细胞", go:"ex.replicate_level"}
  ]
},

'bm.batch_effect': {
  layers:{
    alg:"观测 = μ_生物(组) + β_批次 + ε。若批次与组共线 (处理组周一、对照组周五), 则 β 与 μ 在数据里不可分离: 任何分类器学 β 与学 μ 得到同样的训练分数。校正 (按批次中心化) 在共线设计下把 μ 一起减掉。",
    geo:"降维图上两团点分得干干净净; 按分组着色是两团, 按日期着色还是同样的两团。共线的意思是这两个标签在样本上是同一个划分, 看图无法区分谁造成了分离。",
    comp:"模拟: 每个基因一个随机批次偏移 (sd 1), 20 个基因一个微弱生物效应 (0.4); 最近质心分类器在留出集上算 AUC; 再把同一模型拿到另一天 (新的偏移) 的数据上; 再看按批次中心化在正交/共线设计下各发生什么。"
  },
  proof:{
    from:"线性模型 y = Xβ + ε 的可辨识条件; 分类器只利用与标签相关的任何信号; 方差分解",
    to:"为什么共线时 AUC 0.99 常是学到了批次、为什么事后校正救不了共线设计、为什么校正后的数据不能拿去算 p 值",
    steps:[
      ["写模型: x_gene = μ_gene·y + β_gene·b + ε, y 是组别, b 是批次","这是加性效应模型, 批次是每个基因一个偏移, 生物效应也是每个基因一个偏移"],
      ["若 b ≡ y (共线), 模型变为 x = (μ + β)·y + ε, 数据里只有 μ + β 这个和, 没有任何统计方法能把它拆开","设计矩阵的两列相同, 秩亏; 可辨识性是数据的性质, 不是方法的性质"],
      ["批次偏移通常比生物效应大 (试剂、仪器、日期), 所以共线时分类器主要在学 β: 把 μ 设为 0, AUC 依然 1.0","分类器最大化训练区分度, 谁的信号强就学谁; 它没有 '生物学' 这个偏好"],
      ["同批次的留出集与训练集共享同一个 β, 所以留出/交叉验证照样给虚高分数; 只有另一天做的新批次 (新的 β') 才会暴露","验证集必须与训练集在混杂上独立, 否则验证的是混杂的可重复性"],
      ["正交设计 (每批两组各半) 下 b 与 y 独立, β 对分类是噪声, AUC 反映真实 μ; 按批次中心化能进一步去掉 β","b ⟂ y 时批次列与组别列线性无关, 各自可估; 中心化只减掉 β 不碰 μ"],
      ["共线设计下按批次中心化 = 按组中心化, 把 μ 一起减掉: 20 个真实差异基因的组间差从 0.38 变成 0.00","中心化减的是批次均值, 而批次均值 = 组均值 (因为它们是同一批人)"],
      ["校正后的残差方差被系统性低估 (每批多减了一个估计出来的均值), 用它算检验统计量会放大显著性","每批估一个均值消耗自由度, 且把批内真实波动一部分当作批次吸走; 正确做法是把批次当协变量进模型"]
    ],
    end:"批次问题的解在采样前 (随机化、交叉配平), 不在算法里; 共线一旦发生, 数据本身不含区分的信息。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nn, p = 80, 100\ndef make(confounded, bio=0.4, batch_sd=1.0):\n    y = np.repeat([0, 1], n//2)\n    batch = y.copy() if confounded else np.tile([0, 1], n//2)       # 共线 vs 每批各半\n    X = np.random.randn(n, p) + bio*y[:, None]*(np.arange(p) < 20)  # 真实效应: 20 个基因偏 bio\n    X += batch_sd*batch[:, None]*np.random.randn(1, p)              # 批次: 每个基因一个随机偏移\n    return X, y, batch\ndef auc(s, y):\n    r = np.argsort(np.argsort(s)); n1 = (y == 1).sum(); return (r[y == 1].sum() - n1*(n1 - 1)/2)/(n1*(len(y) - n1))\ntr = (np.arange(n) % 2 == 0); te = ~tr                                # 一半训练一半测试 (两组、两批各半)\ndef split_auc(X, y):\n    c0 = X[tr & (y == 0)].mean(0); c1 = X[tr & (y == 1)].mean(0)      # 最近质心分类器\n    return auc(((X[te] - c0)**2).sum(1) - ((X[te] - c1)**2).sum(1), y[te])\nfor conf in (True, False):\n    X, y, b = make(conf); print('批次与分组%s: 留出 AUC = %.3f' % ('共线' if conf else '正交', split_auc(X, y)))\nX, y, b = make(True, bio=0.0); print('共线 且 生物效应=0: 留出 AUC = %.3f  <- 全是批次' % split_auc(X, y))\n# 共线模型拿到\"另一天\"的数据 (新的批次偏移) 上\nX, y, b = make(True); Xn, yn, _ = make(True)\nc0 = X[tr & (y == 0)].mean(0); c1 = X[tr & (y == 1)].mean(0)\nprint('同一个共线模型: 同批留出 AUC = %.3f | 拿到另一天的新批次上 AUC = %.3f' % (split_auc(X, y), auc(((Xn - c0)**2).sum(1) - ((Xn - c1)**2).sum(1), yn)))\n# 事后校正 (按批次中心化): 正交设计下有效; 共线设计下把生物效应一起减掉\ndef center_by_batch(X, b):\n    Xc = X.copy()\n    for k in np.unique(b): Xc[b == k] -= Xc[b == k].mean(0)\n    return Xc\nX, y, b = make(False); Xc = center_by_batch(X, b)\nprint('正交设计 校正后 AUC = %.3f | 基因方差 校正前 %.3f 校正后 %.3f (被压低 -> 校正后的数据别拿去算 p 值)' % (split_auc(Xc, y), X.var(0).mean(), Xc.var(0).mean()))\nX, y, b = make(True); Xc = center_by_batch(X, b)\nprint('共线设计 校正后 AUC = %.3f (掉到 0.5 以下) | 20 个真实差异基因的组间差 校正前 %.2f 校正后 %.2f' % (split_auc(Xc, y), (X[y == 1, :20] - X[y == 0, :20]).mean(), (Xc[y == 1, :20] - Xc[y == 0, :20]).mean()))", out:"批次与分组共线: 留出 AUC = 1.000\n批次与分组正交: 留出 AUC = 0.745\n共线 且 生物效应=0: 留出 AUC = 1.000  <- 全是批次\n同一个共线模型: 同批留出 AUC = 1.000 | 拿到另一天的新批次上 AUC = 0.839\n正交设计 校正后 AUC = 0.733 | 基因方差 校正前 1.219 校正后 0.980 (被压低 -> 校正后的数据别拿去算 p 值)\n共线设计 校正后 AUC = 0.043 (掉到 0.5 以下) | 20 个真实差异基因的组间差 校正前 0.38 校正后 -0.00",
    note:"make() 就是第 1 步的加性模型; 共线 AUC 1.0 与 '生物效应 = 0 仍 1.0' 对应第 2–3 步; 新批次验证对应第 4 步; 正交校正对应第 5 步; 共线校正后组间差归零对应第 6 步; 方差被压低那一行对应第 7 步。" },
  contrast:[
    {vs:"混杂 (ex.confounder)", same:"批次就是一种混杂: 与处理相关又影响结果", diff:"批次是技术性的、通常可测 (日期、试剂号), 所以能设计掉", when:"能随机化的混杂靠设计消除; 不能随机化的靠 DAG 与调整"},
    {vs:"数据泄漏 (bm.small_n)", same:"都让验证分数虚高", diff:"泄漏是测试信息进了训练; 批次是训练和测试共享同一个假信号", when:"两者都要靠 '真正独立的验证集' 才能暴露"},
    {vs:"域偏移 / 分布漂移", same:"换设备、换医院性能崩", diff:"域偏移说的是部署时分布变了; 批次效应说的是训练数据内部就有假结构", when:"批次效应是域偏移在实验室内的版本, 先解决它再谈泛化"},
    {vs:"ComBat / Harmony", same:"都是事后校正", diff:"只能在批次与分组不共线时工作, 且校正后的数据只用于可视化与预测", when:"已经共线就重做; 正交时可校正后聚类, 但检验时把批次放进模型"}
  ],
  ext:[
    {t:"设计阶段的随机化与配平", go:"ex.batch_design"},
    {t:"混杂的一般理论", go:"ex.confounder"},
    {t:"共线是设计矩阵秩亏", go:"la.rank"},
    {t:"单细胞降维图里两团分开先问这个", go:"bm.cell_cluster"}
  ]
},

'bm.small_n': {
  layers:{
    alg:"m 个检验在全零假设下 p ~ Uniform(0,1), 假阳性数 ~ Binomial(m, α), 期望 mα。Bonferroni: 阈值 α/m 控族错误率; BH: 排序后取最大 k 使 p_(k) ≤ kα/m, 控 FDR。泄漏: 任何用到测试样本 (含其标签) 的步骤在划分前做, 测试就不再独立。",
    geo:"两万个基因排队各掷一次骰子, 光靠运气就有一千个 p < 0.05。泄漏像考试前看过题: 特征选择在划分前做, 等于用全班的答案挑出 '有区分度' 的题, 再拿同一批人考试。",
    comp:"p 值向量排序一次; Bonferroni 一个阈值; BH 一条与直线 kα/m 的比较。泄漏检查: 把每一步预处理 (选特征、标准化、SMOTE) 放进每折的训练部分, 并按病人 (group) 而不是按样本切折。"
  },
  proof:{
    from:"p 值在零假设下均匀分布; 独立事件计数的期望; 交叉验证的独立性假设",
    to:"多重比较为什么假阳性线性堆积、Bonferroni 与 BH 各控什么、泄漏为什么让纯噪声也能 '预测'、为什么要按病人分组",
    steps:[
      ["零假设成立时, p = P(统计量 ≥ 观测值) 是分布函数的变换, 服从 Uniform(0,1), 故 P(p < α) = α","概率积分变换: 连续随机变量代入自己的分布函数得均匀分布"],
      ["m 个独立零假设下, p < α 的个数 ~ Binomial(m, α), 期望 mα; m = 20000, α = 0.05 时期望 1000 个","独立伯努利求和; 即使不独立, 期望仍是 mα (期望的线性)"],
      ["Bonferroni 把每个阈值改为 α/m: P(至少一个假阳) ≤ Σ P(p_i < α/m) = α, 控的是 '一个都不错' (FWER)","布尔不等式 (并的概率 ≤ 概率之和), 不需要独立性; 代价是检出力大跌 (模拟里 100 个真阳只检出 26)"],
      ["BH 控的是 FDR = E[假阳/全部阳性]: 排序后找最大 k 使 p_(k) ≤ kα/m, 拒绝前 k 个; 允许少量假阳换取检出力 (62/100, FDR 0.03)","阈值随排名线性放宽: 排在第 k 位的 p 若真为零假设, 其期望位置约 p·m, 所以 p ≤ kα/m 意味着它排得比随机靠前 1/α 倍"],
      ["泄漏: 在划分前用全部 12 个样本的标签选 top 50 特征, 相当于在 20000 个纯噪声里挑出恰好与这 12 个标签相关的 50 个; 之后无论怎么 CV, 测试样本的标签已经参与了特征选择","特征选择是一个拟合步骤; 用到测试标签就是在测试集上训练。纯噪声留一准确率 1.00 而正确做法 0.42"],
      ["同一病人的 5 张切片高度相关 (共享病人效应), 按切片随机切折时同病人的其他切片在训练集里, 模型靠 '认出病人' 就能猜对标签 (0.94), 与生物学无关","独立性假设被违反: 训练与测试样本不独立, 泛化的估计对象从 '新病人' 变成了 '同一病人的新切片'"],
      ["按病人分组切折 (GroupKFold) 后准确率回到 0.56 ≈ 随机, 这才是对新病人的诚实估计","分组保证训练与测试之间没有共享的随机效应, 这是 CV 有效的前提"]
    ],
    end:"n 小 p 大时, 假阳性按检验次数线性堆积、泄漏能让纯噪声拿满分; 两者都不是模型问题, 是把 '看过答案' 混进了估计。"
  },
  scratch:{ lang:'python', code:"import numpy as np, math\nnp.random.seed(0)\nm, alpha = 20000, 0.05\npval = lambda z: np.array([math.erfc(abs(v)/math.sqrt(2)) for v in z])     # 双侧 p (z 检验)\n# 1) 全零假设: 20000 个 z ~ N(0,1), p 均匀分布, p<0.05 的个数期望 = m*alpha\nz = np.random.randn(m); p = pval(z)\nprint('无任何真实差异: p<0.05 的基因 %d 个 (期望 %d)  Bonferroni 阈值 %.1e 通过 %d 个' % ((p < alpha).sum(), int(m*alpha), alpha/m, (p < alpha/m).sum()))\n# 2) 混入 100 个真实效应 (z 偏移 4): 不校正 / Bonferroni / BH 的检出与假阳\nz2 = z.copy(); z2[:100] += 4; p2 = pval(z2)\nps = np.sort(p2); k = np.arange(1, m + 1); ok = np.where(ps <= k*alpha/m)[0]; thr_bh = ps[ok.max()] if ok.size else 0\nfor name, thr in (('不校正', alpha), ('Bonferroni', alpha/m), ('BH(FDR .05)', thr_bh)):\n    hit = p2 <= thr; print('%-12s 真阳 %3d/100  假阳 %4d  FDR=%.3f' % (name, hit[:100].sum(), hit[100:].sum(), hit[100:].sum()/max(hit.sum(), 1)))\n# 3) 泄漏: 纯噪声 X (n=12, p=20000, 标签随机), 划分前选 top50 vs 每折内选\nn = 12; X = np.random.randn(n, m); y = np.array([0]*6 + [1]*6)\ndef loo_acc(select_inside):\n    correct = 0\n    for i in range(n):\n        tr = np.ones(n, bool); tr[i] = False\n        sub = tr if select_inside else np.ones(n, bool)                # 划分前选 = 用到第 i 个样本的标签\n        d = np.abs(X[sub & (y == 1)].mean(0) - X[sub & (y == 0)].mean(0)); f = np.argsort(d)[-50:]\n        c0 = X[tr & (y == 0)][:, f].mean(0); c1 = X[tr & (y == 1)][:, f].mean(0)\n        correct += int(((X[i, f] - c1)**2).sum() < ((X[i, f] - c0)**2).sum()) == y[i]\n    return correct/n\nprint('纯噪声 留一准确率: 划分前选特征 %.2f | 每折内选特征 %.2f  (真值 0.5)' % (loo_acc(False), loo_acc(True)))\n# 4) 同一病人 5 张切片: 特征只有\"病人身份\", 与标签无关\nG, s = 20, 5; pid = np.repeat(np.arange(G), s); yy = np.random.randint(0, 2, G)[pid]\nXs = np.random.randn(G, 50)[pid] + 0.5*np.random.randn(G*s, 50)\ndef cv_acc(train_of):\n    correct = 0\n    for i in range(G*s):\n        tr = train_of(i); c0 = Xs[tr & (yy == 0)].mean(0); c1 = Xs[tr & (yy == 1)].mean(0)\n        correct += int(((Xs[i] - c1)**2).sum() < ((Xs[i] - c0)**2).sum()) == yy[i]\n    return correct/(G*s)\nprint('标签与特征无关: 按切片留一 %.2f | 按病人分组留一 %.2f  (真值 0.5)' % (cv_acc(lambda i: np.arange(G*s) != i), cv_acc(lambda i: pid != pid[i])))", out:"无任何真实差异: p<0.05 的基因 955 个 (期望 1000)  Bonferroni 阈值 2.5e-06 通过 0 个\n不校正          真阳  99/100  假阳  951  FDR=0.906\nBonferroni   真阳  26/100  假阳    0  FDR=0.000\nBH(FDR .05)  真阳  62/100  假阳    2  FDR=0.031\n纯噪声 留一准确率: 划分前选特征 1.00 | 每折内选特征 0.42  (真值 0.5)\n标签与特征无关: 按切片留一 0.94 | 按病人分组留一 0.56  (真值 0.5)",
    note:"第一段 955/1000 与 Bonferroni 0 个对应第 1–3 步; 混入 100 个真效应的三行对应第 3–4 步的检出力与 FDR; 纯噪声留一 1.00 vs 0.42 对应第 5 步; 切片 vs 病人分组 0.94 vs 0.56 对应第 6–7 步。" },
  contrast:[
    {vs:"Bonferroni vs BH", same:"都是多重比较校正", diff:"Bonferroni 控 '至少一个假阳' 的概率 (FWER), BH 控假阳占比 (FDR)", when:"确证性、一个都不能错 (临床终点) 用 Bonferroni; 探索性筛选 (差异基因) 用 BH"},
    {vs:"批次效应 (bm.batch_effect)", same:"都让分数虚高、都要独立验证集才能暴露", diff:"批次是数据里有假信号; 泄漏是流程里把测试信息喂给了训练", when:"先查流程 (泄漏), 再查数据 (批次)"},
    {vs:"过拟合", same:"都表现为训练好测试差", diff:"过拟合是模型容量问题, 测试集干净时能被诚实的 CV 发现; 泄漏让 CV 本身失效", when:"CV 分数高得离谱先怀疑泄漏, 不是先换模型"},
    {vs:"数据划分 (da.split / da.leak)", same:"同一件事在数据工程层的操作", diff:"da 层讲怎么写代码 (pipeline 内 fit_transform); 这里讲为什么", when:"实现时用 Pipeline + GroupKFold, 让泄漏在结构上不可能"}
  ],
  ext:[
    {t:"多重检验的统计理论", go:"si.multiple_testing"},
    {t:"泄漏在代码层怎么防", go:"da.leak"},
    {t:"按病人分组切折的实现", go:"da.split"},
    {t:"嵌套结构与重复水平", go:"ex.replicate_level"}
  ]
},

});
