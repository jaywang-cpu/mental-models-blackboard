// 数理宇宙 v3 · 推导层：dl 深度学习大陆（12 节点）
// 只 push 到 window.DERIVE，不改动 v1/v2 任何文件。scratch 全部用 python3 + numpy 实跑，out 为真实输出。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'dl.mlp': {
  layers:{
    alg:`f(x) = W_L σ(W_{L-1} σ(… σ(W_1 x + b_1) …) + b_{L-1}) + b_L。仿射与逐元素非线性 σ 交替复合；去掉 σ 后整个式子塌成一个仿射 (W_L…W_1)x + b。`,
    geo:`每个 ReLU 单元 = 一条超平面折痕。隐层把输入空间切成有限个凸多面体，每块内部网络是一个线性函数；训练就是挪折痕，使分段线性面贴近目标曲面。`,
    comp:`一层 = 一次 GEMM (B,d_in)@(d_in,d_out) + 一次逐元素 max(·,0)。前者吃算力 O(B·d_in·d_out)，后者吃访存；batch B 不进参数量。`
  },
  proof:{
    from:`仿射映射的复合仍是仿射；连续函数在紧集上可被分段线性函数一致逼近（Stone–Weierstrass 型事实）`,
    to:`为什么非线性是万能逼近的必要条件，以及一隐层 ReLU 网为什么足够`,
    steps:[
      [`写出两层无激活: W_2(W_1 x + b_1) + b_2 = (W_2 W_1) x + (W_2 b_1 + b_2)`,`矩阵乘法满足结合律与分配律，所以合并后仍是一个矩阵加一个向量，表达力 = 单层线性`],
      [`归纳到 L 层: 无激活的 L 层严格等价于一层`,`每次合并都用同一条结合律，L 有限，归纳成立；于是深度本身对线性族不加任何表达力`],
      [`加入 ReLU: σ(w·x+b) 在一维上是一个"折点在 -b/w 的斜坡"`,`ReLU 的定义 max(0,t) 只有一个折点，其位置与斜率由 (w,b) 自由控制`],
      [`H 个斜坡的线性组合 Σ a_h relu(w_h x + b_h) 可以拼出任意折点数 ≤ H 的分段线性函数`,`分段线性函数的每个折点处斜率变化量可由某个 a_h w_h 单独提供，逐折点匹配即可`],
      [`任意连续 f 在 [a,b] 上可被折点足够密的分段线性函数一致逼近到 ε`,`连续函数在紧集上一致连续，用密网格上的线性插值即可，误差随网格变细趋于 0`],
      [`高维: 把 x 先投影到方向 w 再折，Σ_h a_h relu(w_h·x+b_h) 张成的函数族在 C(K) 中稠密`,`Cybenko/Hornik 定理：只要 σ 非多项式，这类"脊函数"的有限和在紧集上稠密；非多项式是判据，多项式激活会让族退化为固定次数多项式`],
      [`深比宽省: L 层宽 H 的 ReLU 网线性区域数可达 O((H/d)^{d(L-1)} H^d)，宽度只给多项式增长，深度给指数`,`每层把前一层的每个线性区域再切一次，切分数逐层相乘，这是复合(乘)而非叠加(加)带来的`]
    ],
    end:`非线性不是"锦上添花"，是让深度从无意义变成指数级表达力的唯一开关；宽度保证存在性，深度换效率。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nx = np.linspace(-3, 3, 200)[:, None]; y = np.sin(x)\ndef train(nonlin, H=32, steps=3000, lr=0.02):\n    W1 = np.random.randn(1, H) * 0.5; b1 = np.zeros(H)\n    W2 = np.random.randn(H, 1) / np.sqrt(H); b2 = np.zeros(1)\n    for _ in range(steps):\n        z = x @ W1 + b1\n        h = np.maximum(z, 0) if nonlin else z          # 折 or 不折\n        p = h @ W2 + b2\n        g = 2 * (p - y) / len(x)                       # dL/dp\n        gW2 = h.T @ g; gb2 = g.sum(0)\n        gh = g @ W2.T\n        gz = gh * (z > 0) if nonlin else gh\n        gW1 = x.T @ gz; gb1 = gz.sum(0)\n        W1 -= lr * gW1; b1 -= lr * gb1; W2 -= lr * gW2; b2 -= lr * gb2\n    return np.mean((p - y) ** 2)\nprint('线性堆叠 MSE =', round(train(False), 4))\nprint('ReLU  MLP  MSE =', round(train(True), 4))\n# 无激活时两层严格塌缩成一层\nW1 = np.random.randn(1, 32); W2 = np.random.randn(32, 1)\nprint('W2W1 是一个标量:', np.round((W1 @ W2).ravel(), 4), '-> 等价单层线性')", out:"线性堆叠 MSE = 0.168\nReLU  MLP  MSE = 0.0017\nW2W1 是一个标量: [-5.4523] -> 等价单层线性",
    note:`nonlin=False 那条对应推导第 1–2 步(塌缩成线性，怎么训都只剩 0.168)；nonlin=True 对应第 4–6 步(32 个斜坡把 sin 拼到 0.0017)。最后一行直接算出 W_2W_1 是一个标量。` },
  contrast:[
    {vs:`线性回归 / 逻辑回归`, same:`都是 Wx+b 加一个输出变换`, diff:`它们是零隐层 MLP；没有中间的 σ，决策边界永远是超平面`, when:`特征已线性可分或样本 < 1000 用线性；需要学交互与折面时上 MLP`},
    {vs:`卷积网络 CNN`, same:`都是仿射+非线性堆叠，都用反向传播训`, diff:`CNN 把 W 约束成"局部 + 共享"的稀疏带状矩阵，把平移先验焊进结构`, when:`输入有空间/时间邻接结构用 CNN；固定长度特征表用 MLP`},
    {vs:`梯度提升树 XGBoost`, same:`都能拟合非线性、都能处理表格特征`, diff:`树是轴对齐的分段常数，MLP 是任意方向的分段线性；树自带特征选择与尺度不变性`, when:`表格数据默认先跑 XGBoost；样本上万且特征需要连续组合时 MLP 才可能赢`},
    {vs:`核方法 / SVM`, same:`都通过一个非线性映射把 x 送进高维再线性`, diff:`核的映射固定(由核函数决定)，MLP 的映射是学出来的`, when:`小样本、想要凸优化保证选核方法；大样本、想学表示选 MLP`}
  ],
  ext:[
    {t:`把 W 约束成局部共享 → 卷积网络`, go:'dl.cnn'},
    {t:`逐位置独立的两层 MLP 就是 Transformer 里的 FFN 子层`, go:'dl.transformer'},
    {t:`每层的 Wx+b 是一次矩阵变换，可从线性代数角度看它在旋转/拉伸空间`, go:'la.matrix_transform'}
  ]
},

'dl.activation': {
  layers:{
    alg:`σ 是逐元素函数。关键量不是 σ 本身而是 σ'：sigmoid' = σ(1−σ) ≤ 1/4；tanh' = 1−tanh² ≤ 1；relu' ∈ {0,1}；反向传播里每层都要乘一次 σ'。`,
    geo:`sigmoid 是躺平的 S，两端斜率趋零(饱和区)；ReLU 是折成 L 的直线，正区斜率恒 1；LeakyReLU/GELU 在负区留一条微斜的缝。`,
    comp:`前向: 一次逐元素运算，无参数，shape 不变。反向: 用前向存下的 z 算 σ'(z) 再与上游梯度逐元素相乘，ReLU 只需一个布尔掩码。`
  },
  proof:{
    from:`链式法则：∂L/∂x_0 = Π_{l} (W_l^T diag σ'(z_l)) · ∂L/∂x_L；sigmoid 的定义 σ(x)=1/(1+e^{−x})`,
    to:`sigmoid 导数上界 1/4 ⇒ 深网梯度指数消失；ReLU 正区导数 1 ⇒ 梯度可原样穿过`,
    steps:[
      [`求导: σ' = e^{−x}/(1+e^{−x})² = σ(1−σ)`,`商法则加代数整理，把 e^{−x}/(1+e^{−x}) 认出是 1−σ`],
      [`令 p=σ∈(0,1)，p(1−p) 在 p=1/2 取最大 1/4`,`一元二次函数 −p²+p 的顶点在 p=1/2，对应 x=0`],
      [`L 层 sigmoid 网，∂L/∂x_0 的每一因子都含 diag σ'(z_l)，其谱范数 ≤ 1/4`,`对角阵的谱范数就是对角元最大绝对值，而每个对角元 ≤ 1/4`],
      [`‖∂L/∂x_0‖ ≤ (1/4)^L Π‖W_l‖ ‖∂L/∂x_L‖，L=10 时 (1/4)^10 ≈ 9.5×10⁻⁷`,`范数的次可乘性 ‖AB‖ ≤ ‖A‖‖B‖ 逐层套用；若权重范数不特意放大，衰减是指数级`],
      [`float32 下这么小的更新乘 lr 后低于权重的舍入分辨率，浅层等于冻结`,`float32 有效位约 7 位十进制，1e-7 量级的相对更新被舍入吃掉`],
      [`ReLU: relu'(z)=1(z>0)，正区因子恰为 1，连乘不衰减；负区为 0，该单元此步不更新`,`max(0,z) 在 z>0 处就是恒等函数，导数按定义为 1；z<0 处是常数 0`],
      [`一个单元若 bias 被推到使所有样本 z<0，则 relu'≡0，梯度永远为 0，它永久死亡`,`更新量 ∝ 梯度，梯度恒 0 则参数不再改变，负区状态自锁`],
      [`LeakyReLU 负区斜率 α>0 保证导数 ≥ α，自锁被打破；GELU x·Φ(x) 在 0 附近平滑且负区非零`,`只要导数不为 0，更新就不为 0，单元有机会回到正区`]
    ],
    end:`激活函数的选择本质上是在选"反向传播里每层乘的那个数"：饱和型 ≤ 1/4 让深度成为负担，ReLU 族让深度成为可能。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nsig = lambda x: 1 / (1 + np.exp(-x))\nxs = np.linspace(-6, 6, 12001)\nd = sig(xs) * (1 - sig(xs))\nprint(\"max sigmoid' =\", d.max().round(4), 'at x =', xs[d.argmax()].round(2))\nprint('10 层 sigmoid 最好情况 =', (0.25 ** 10))\n# 随机预激活下真实的连乘衰减\nz = np.random.randn(10, 1000)\nprod_sig = np.prod(sig(z) * (1 - sig(z)), axis=0).mean()\nprint('10 层 sigmoid 随机预激活的平均连乘 =', f'{prod_sig:.2e}')\nprint(\"每层平均导数: sigmoid' =\", (sig(z)*(1-sig(z))).mean().round(3), \" relu' =\", (z > 0).mean().round(3))\nprint('ReLU 活路径(全正)上的 10 层连乘 =', np.prod(np.ones(10)), '(不衰减)')\n# dying ReLU\nz = np.array([-3.0, -0.5, 0.2]); print(\"relu' =\", (z > 0).astype(int), \" leaky' =\", np.where(z > 0, 1, 0.01))", out:"max sigmoid' = 0.25 at x = 0.0\n10 层 sigmoid 最好情况 = 9.5367431640625e-07\n10 层 sigmoid 随机预激活的平均连乘 = 1.46e-07\n每层平均导数: sigmoid' = 0.207  relu' = 0.489\nReLU 活路径(全正)上的 10 层连乘 = 1.0 (不衰减)\nrelu' = [0 0 1]  leaky' = [0.01 0.01 1.  ]",
    note:`前两行验证第 1–2 步(最大 0.25 在 x=0)；随机预激活连乘 1.46e-7 对应第 4 步；活路径连乘 1.0 对应第 6 步；最后一行是第 7–8 步的 dying ReLU 与 leaky 的缝。` },
  contrast:[
    {vs:`softmax`, same:`都把实数变成 (0,1) 之间的数`, diff:`softmax 是跨维度归一化(各维互相竞争)，激活函数是逐元素的；softmax 属于输出分布/注意力权重，不是隐层激活`, when:`隐层永远用逐元素激活；要一个概率分布时用 softmax`},
    {vs:`归一化层 BN/LN`, same:`都插在仿射层之后，都影响梯度能否穿过深网`, diff:`归一化是线性(仿射)重标定，不引入非线性；激活才提供表达力`, when:`两者都要：归一化把 z 拉回非饱和区，激活提供折面`},
    {vs:`sigmoid 当门控`, same:`同一个函数`, diff:`门控需要的正是饱和：输出趋 0/1 才有"开/关"语义；隐层需要的正相反`, when:`LSTM 门、attention gate 用 sigmoid；隐层用 ReLU/GELU`},
    {vs:`Kaiming 与 Xavier 初始化`, same:`都是为让各层激活方差不逐层放大或缩小`, diff:`Kaiming 的方差 2/fan_in 里的 2 是补 ReLU 砍掉的负半轴；Xavier 假设对称激活(tanh)`, when:`ReLU 族配 Kaiming，tanh/sigmoid 配 Xavier`}
  ],
  ext:[
    {t:`σ' 连乘就是链式法则，激活的选择直接决定 backprop 的数值命运`, go:'dl.backprop'},
    {t:`饱和导致的梯度消失，结构性解法是残差恒等通路`, go:'dl.resnet'},
    {t:`sigmoid 的形状与导数来自指数函数`, go:'al.exp_log'}
  ]
},

'dl.backprop': {
  layers:{
    alg:`多元链式法则：L = ℓ(f_L(…f_1(x;W_1)…;W_L))，∂L/∂W_l = (∂L/∂z_l)(∂z_l/∂W_l)，其中 ∂L/∂z_l = (∂z_{l+1}/∂z_l)^T ∂L/∂z_{l+1} 从后往前递推。`,
    geo:`一条计算图从输入流到 loss。前向沿箭头算值并存下；反向沿箭头逆流，每过一个结点乘上该结点的局部雅可比，汇入同一结点的分支相加。`,
    comp:`前向存所有中间激活(显存 O(层数×激活)，这是为什么大 batch 爆显存)；反向每层做两次矩阵乘：一次给参数梯度 (h^T δ)，一次把 δ 传给下一层 (δ W^T)。总代价 ≈ 2 倍前向。`
  },
  proof:{
    from:`多元链式法则；一层的定义 z = h_in W + b，h = σ(z)；损失对该层输出的梯度 δ = ∂L/∂z 已由后面各层递推得到`,
    to:`推出 ∂L/∂W = h_in^T δ、∂L/∂b = Σ_batch δ、∂L/∂h_in = δ W^T，并说明为什么整体代价只相当于一次前向`,
    steps:[
      [`标量情形先看: L = ℓ(σ(w x))，dL/dw = ℓ'·σ'·x`,`一元链式法则，三个局部导数相乘；反向传播只是把它写成矩阵形式并复用中间结果`],
      [`一层写成 z_{ij} = Σ_k h_{ik} W_{kj} + b_j (i 是 batch 索引)`,`矩阵乘法的逐元素定义，之后所有偏导都从这条式子出发`],
      [`∂L/∂W_{kj} = Σ_i (∂L/∂z_{ij})(∂z_{ij}/∂W_{kj}) = Σ_i δ_{ij} h_{ik}`,`W_{kj} 只出现在第 j 列、对每个样本 i 都出现一次，故对 i 求和；∂z_{ij}/∂W_{kj} = h_{ik}`],
      [`写成矩阵: ∂L/∂W = h_in^T δ，形状 (d_in,B)@(B,d_out) = (d_in,d_out) 与 W 一致`,`上一步的双下标求和正是矩阵乘法的定义；形状校验是最便宜的正确性检查`],
      [`∂L/∂b_j = Σ_i δ_{ij}，即 δ 沿 batch 求和`,`b_j 加在每个样本的 z_{ij} 上，∂z_{ij}/∂b_j = 1`],
      [`∂L/∂h_{ik} = Σ_j δ_{ij} W_{kj} ⇒ ∂L/∂h_in = δ W^T`,`h_{ik} 通过第 i 行所有 j 影响 L，按多元链式法则对 j 求和；这就是传给前一层的 δ`],
      [`穿过激活: δ_prev = (∂L/∂h_in) ⊙ σ'(z_prev)`,`σ 逐元素，其雅可比是对角阵，乘对角阵等于逐元素乘`],
      [`从 loss 出发逆序重复 6–7，每层只做两次 GEMM；比"对每个参数各扰动一次"的 O(#参数) 次前向便宜`,`各参数梯度共享同一条后段 δ，只需算一次；逆序保证算 ∂L/∂W_l 时 δ_l 已经就绪`]
    ],
    end:`反向传播 = 多元链式法则 + 按计算图逆序复用 δ。一次前向一次反向拿到全部梯度，让百万参数的梯度下降在计算上可行。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nX = np.random.randn(4, 3); Y = np.random.randn(4, 2)\nP = {'W1': np.random.randn(3, 5), 'b1': np.zeros(5), 'W2': np.random.randn(5, 2), 'b2': np.zeros(2)}\ndef fwd(P):\n    z1 = X @ P['W1'] + P['b1']; h = np.maximum(z1, 0); z2 = h @ P['W2'] + P['b2']\n    return z1, h, z2, np.mean((z2 - Y) ** 2)\ndef bwd(P):\n    z1, h, z2, L = fwd(P)\n    dz2 = 2 * (z2 - Y) / Y.size                  # dL/dz2\n    G = {'W2': h.T @ dz2, 'b2': dz2.sum(0)}      # dL/dW2 = h^T dL/dz2\n    dh = dz2 @ P['W2'].T                         # 逆序: 先过 W2\n    dz1 = dh * (z1 > 0)                          # 再过 ReLU\n    G['W1'] = X.T @ dz1; G['b1'] = dz1.sum(0)    # 最后到 W1\n    return G\nG = bwd(P); eps = 1e-5; worst = 0\nfor k in P:\n    num = np.zeros_like(P[k])\n    for i in np.ndindex(P[k].shape):\n        P[k][i] += eps; Lp = fwd(P)[3]; P[k][i] -= 2 * eps; Lm = fwd(P)[3]; P[k][i] += eps\n        num[i] = (Lp - Lm) / (2 * eps)\n    err = np.abs(num - G[k]).max(); worst = max(worst, err)\n    print(f'{k}: 解析 vs 数值 最大误差 = {err:.1e}')\nprint('全部 < 1e-7:', worst < 1e-7)", out:"W1: 解析 vs 数值 最大误差 = 5.4e-10\nb1: 解析 vs 数值 最大误差 = 4.4e-10\nW2: 解析 vs 数值 最大误差 = 3.3e-10\nb2: 解析 vs 数值 最大误差 = 2.0e-10\n全部 < 1e-7: True",
    note:`bwd 里 G['W2']=h.T@dz2 是第 4 步，dh=dz2@W2.T 是第 6 步，dz1=dh*(z1>0) 是第 7 步，G['W1']=X.T@dz1 再用一次第 4 步。中心差分数值梯度与解析梯度差 < 1e-9。` },
  contrast:[
    {vs:`数值梯度(有限差分)`, same:`都给出 ∂L/∂θ`, diff:`数值法每个参数要 2 次前向，O(#参数) 倍代价且有截断误差；反向传播一次拿全部且精确`, when:`数值梯度只用来校验手写反向；训练一律反向传播`},
    {vs:`前向模式自动微分`, same:`都是链式法则的自动化`, diff:`前向模式按输入方向传雅可比-向量积，代价 ∝ 输入维数；反向模式代价 ∝ 输出维数(loss 是标量，所以赢)`, when:`输入少输出多用前向模式；深度学习 loss 是一个标量，用反向`},
    {vs:`梯度下降`, same:`训练里总是一起出现`, diff:`反向传播只负责算梯度；怎么用梯度更新参数是优化器的事`, when:`loss.backward() 是反向传播，optimizer.step() 是梯度下降`},
    {vs:`符号求导`, same:`都得到导数表达式`, diff:`符号求导展开整棵表达式，随深度膨胀；反向传播只在数值上复用中间结果，不展开`, when:`推公式用符号；训网络用反向`}
  ],
  ext:[
    {t:`数学根：多元复合函数的链式法则`, go:'ca.chain_rule'},
    {t:`PyTorch 把这套逆序记账做成动态计算图 autograd`, go:'pt.autograd'},
    {t:`沿时间展开的反向传播(BPTT)出现雅可比连乘，引出梯度消失/爆炸`, go:'dl.rnn'}
  ]
},

'dl.cnn': {
  layers:{
    alg:`(x * k)[i,j] = Σ_{u,v} x[i+u, j+v] k[u,v]。它是一个线性算子，等价于一个稀疏带状矩阵乘 x，且矩阵每一行都是同一组 k 的平移拷贝(Toeplitz 结构)。`,
    geo:`一扇 k×k 的小窗在图上一格格滑，每停一处做一次点积；输出图上的一个像素只"看得见"输入上一小片(感受野)，越深看得越宽。`,
    comp:`im2col 把每个窗口展成一行，卷积变成一次 GEMM: (H_out·W_out, k²·C_in) @ (k²·C_in, C_out)。参数 k²·C_in·C_out + C_out，与图像尺寸无关。`
  },
  proof:{
    from:`离散卷积定义；平移算子 (T_s x)[i] = x[i−s]；感受野 = 输出一个位置在输入上依赖的范围`,
    to:`(1) 参数共享 ⇔ 平移等变的严格表述；(2) 输出尺寸公式；(3) 感受野随层数的递推`,
    steps:[
      [`把卷积写成矩阵 A：(Ax)[i] = Σ_u k[u] x[i+u]，A 的第 i 行是 k 放在位置 i 的拷贝`,`卷积对 x 线性，任何线性算子都能写成矩阵；共享同一个 k 就意味着各行是平移拷贝`],
      [`等变命题: A(T_s x) = T_s(A x)（忽略边界）`,`代入定义: A(T_s x)[i] = Σ_u k[u] x[i+u−s] = (Ax)[i−s] = T_s(Ax)[i]，因为 k 不随 i 改变`],
      [`反过来：若线性算子 A 与所有平移 T_s 交换，则 A 必是卷积`,`A 与 T_s 交换 ⇒ A 的第 i 行等于第 0 行平移 i；这正是"所有行共享同一 k"，即参数共享是平移等变的充要条件`],
      [`零填充 p、步长 s、核 k 的输出尺寸: ⌊(H + 2p − k)/s⌋ + 1`,`填充后长度 H+2p，窗口首位置可取 0 到 H+2p−k，按步长 s 取整数格点，个数为 ⌊(H+2p−k)/s⌋+1`],
      [`感受野递推: r_0 = 1, r_l = r_{l−1} + (k_l − 1)·Π_{i<l} s_i`,`第 l 层输出一个像素看 k_l 个第 l−1 层像素，相邻两者在原图上间隔 Π s_i(累积步长)，故新增覆盖 (k_l−1)×累积步长`],
      [`三层 3×3 步长 1 的感受野 = 1+2+2+2 = 7，与一层 7×7 相同但参数 3·9=27 < 49`,`代入递推；同样的感受野，堆小核参数更少且多了两次非线性`],
      [`参数量 k²·C_in·C_out 与 H、W 无关；全连接需要 (H·W·C_in)·(H·W·C_out)`,`共享让参数只取决于核与通道；同一图 32×32 的例子里两者差 5 个数量级`]
    ],
    end:`卷积 = 与平移交换的线性算子，参数共享不是省钱技巧而是这一对称性的等价表述；感受野递推告诉你深度如何换来"看全图"。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\ndef conv2d(img, k, s=1, p=0):\n    img = np.pad(img, p); H, W = img.shape; kh, kw = k.shape\n    oh, ow = (H - kh) // s + 1, (W - kw) // s + 1\n    out = np.zeros((oh, ow))\n    for i in range(oh):\n        for j in range(ow):\n            out[i, j] = np.sum(img[i*s:i*s+kh, j*s:j*s+kw] * k)   # 同一把 k 扫全图\n    return out\nimg = np.random.randn(32, 32); k = np.random.randn(3, 3)\nfor s, p in [(1, 1), (2, 0)]:\n    o = conv2d(img, k, s, p); f = (32 + 2*p - 3) // s + 1\n    print(f'k=3 s={s} p={p}: 实际 {o.shape}, 公式 {f}x{f}')\n# 平移等变: 先移后卷 == 先卷后移\nsh = np.roll(img, (2, 3), axis=(0, 1))\nlhs = conv2d(sh, k, 1, 1); rhs = np.roll(conv2d(img, k, 1, 1), (2, 3), axis=(0, 1))\ninner = (slice(4, -4), slice(4, -4))   # 去掉环绕边界\nprint('平移等变 最大误差(内部) =', np.abs(lhs[inner] - rhs[inner]).max())\nprint('参数量: conv 3x3x3->64 =', 3*3*3*64 + 64, ' | 全连接 32*32*3->32*32*64 =', 32*32*3 * 32*32*64)", out:"k=3 s=1 p=1: 实际 (32, 32), 公式 32x32\nk=3 s=2 p=0: 实际 (15, 15), 公式 15x15\n平移等变 最大误差(内部) = 0.0\n参数量: conv 3x3x3->64 = 1792  | 全连接 32*32*3->32*32*64 = 201326592",
    note:`conv2d 的双重循环用同一把 k 扫全图，对应第 1 步；两组 (s,p) 与公式核对是第 4 步；np.roll 前后对比误差 0 是第 2 步的等变命题；最后一行是第 7 步的参数量对比。` },
  contrast:[
    {vs:`全连接层 MLP`, same:`都是线性变换 + 非线性`, diff:`卷积 = 局部连接 + 权重共享的稀疏 Toeplitz 矩阵；全连接每个输出看整张图且各不共享`, when:`有平移结构(图像、信号)用卷积；特征无空间关系用全连接`},
    {vs:`信号处理里的卷积 / 相关`, same:`同一个滑窗点积`, diff:`深度学习里的"卷积"其实是互相关(核不翻转)；因为核是学出来的，翻不翻转等价`, when:`推公式对照傅里叶时注意翻转；写网络不必管`},
    {vs:`池化`, same:`都是滑窗操作`, diff:`池化无参数、固定取 max/mean，只做下采样；卷积有可学核`, when:`要缩尺寸/扩感受野用池化或步长卷积；要学特征用卷积`},
    {vs:`平移不变 vs 平移等变`, same:`都描述"移动输入"的效果`, diff:`等变: 输出跟着移(卷积层)；不变: 输出不变(全局池化后的分类头)`, when:`分割要等变，分类要不变，CNN 靠"卷积 + 全局池化"两段实现`}
  ],
  ext:[
    {t:`加恒等旁路解决深层退化 → 残差网络`, go:'dl.resnet'},
    {t:`编码-解码 + 跳接做逐像素预测 → U-Net`, go:'dl.unet'},
    {t:`卷积定理：空间域卷积 = 频率域逐点乘`, go:'fo.convolution'}
  ]
},

'dl.rnn': {
  layers:{
    alg:`h_t = tanh(W x_t + U h_{t−1} + b)，同一组 (W,U,b) 沿时间复用。∂h_T/∂h_0 = Π_{t=1}^{T} diag(1−h_t²) U，是 T 个雅可比的连乘。`,
    geo:`一条链，每节车厢把新输入和上一节的状态搅在一起。梯度是从末端沿链逆向走 T 步，每步被同一个矩阵 U 拉伸或压扁一次。`,
    comp:`按时间步串行，无法并行；BPTT 要存 T 步的 h_t。LSTM 每步多算 4 个门 (4 倍参数)，但细胞态 c_t 的更新是逐元素加法，不经过 U。`
  },
  proof:{
    from:`RNN 递推式；矩阵幂的增长由谱半径 ρ(U) 决定：‖U^T‖^{1/T} → ρ(U)；LSTM 细胞态 c_t = f_t ⊙ c_{t−1} + i_t ⊙ g_t`,
    to:`RNN 长程梯度按 ρ^T 消失或爆炸；LSTM 的遗忘门给梯度一条不经 U 的直通路`,
    steps:[
      [`链式法则: ∂h_t/∂h_{t−1} = diag(1−h_t²)·U =: J_t`,`h_t = tanh(z_t)，z_t 对 h_{t−1} 的雅可比是 U，tanh 逐元素求导得对角阵`],
      [`∂h_T/∂h_0 = J_T J_{T−1} … J_1`,`T 步复合的雅可比按链式法则连乘，顺序是从后往前`],
      [`‖J_T…J_1‖ ≤ Π‖J_t‖ ≤ Π (‖diag(1−h_t²)‖·‖U‖) ≤ ‖U‖^T`,`范数次可乘性；|1−h²| ≤ 1，所以 tanh 只会缩不会放`],
      [`若 ρ(U) < 1 (选合适范数使 ‖U‖<1)，长程梯度 ≤ ‖U‖^T → 0：消失`,`Gelfand 公式 ‖U^T‖^{1/T} → ρ(U)，谱半径 <1 则幂指数衰减；tanh 的对角因子只会让它更小`],
      [`若 ρ(U) > 1 且 h 未饱和，Π J_t 沿主特征方向按 ρ^T 增长：爆炸`,`主特征向量方向每步被放大 ρ 倍，tanh 未饱和时对角因子 ≈ 1 挡不住`],
      [`LSTM: ∂c_t/∂c_{t−1} = diag(f_t)，与 U 无关`,`c_t = f_t⊙c_{t−1} + i_t⊙g_t 对 c_{t−1} 是逐元素乘 f_t(把 f,i,g 对 c 的间接依赖视为次要项)，雅可比是对角阵 f_t`],
      [`∂c_T/∂c_0 ≈ Π_t diag(f_t)；只要 f_t ≈ 1，连乘 ≈ 1，梯度直通`,`对角阵连乘仍是对角阵，元素是 Π f_t；门是 sigmoid 输出，可学到接近 1，而 tanh-RNN 的因子由 U 的谱决定，不能逐维控制`],
      [`遗忘门 bias 初始化为正(如 1)，让训练初期 f_t ≈ 0.73 以上，避免一开始就把记忆冲掉`,`sigmoid(1)=0.73，f 越接近 1，直通越畅；这是工程上的常规做法`]
    ],
    end:`RNN 的长程梯度 = 同一个雅可比的 T 次幂，命运由谱半径决定；LSTM 把"乘 U"换成"乘门 f"，门可学到 1，这才有了可训练的长记忆。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nH, T = 16, 50\ndef run(scale):\n    U = np.random.randn(H, H) / np.sqrt(H) * scale\n    rho = np.abs(np.linalg.eigvals(U)).max()\n    h = np.zeros(H); J = np.eye(H)\n    for t in range(T):\n        x = np.random.randn(H) * 0.1\n        z = U @ h + x; h = np.tanh(z)\n        J = (np.diag(1 - h**2) @ U) @ J        # 雅可比连乘 dh_T/dh_0\n    return rho, np.linalg.norm(J, 2)\nfor sc in [0.5, 1.0, 2.0]:\n    rho, n = run(sc); print(f'scale={sc}: 谱半径≈{rho:.2f}  ||dh_50/dh_0||={n:.2e}')\n# LSTM 细胞态: c_t = f*c_{t-1} + i*g, dc_T/dc_0 = prod f\nf = 0.95; print('LSTM 遗忘门 0.95, 50 步直通梯度 =', round(f ** 50, 4), ' vs tanh RNN(0.9 谱半径) =', round(0.9 ** 50, 4))\nf = 1.0; print('遗忘门=1 时 =', f ** 50)", out:"scale=0.5: 谱半径≈0.50  ||dh_50/dh_0||=1.43e-15\nscale=1.0: 谱半径≈1.03  ||dh_50/dh_0||=1.49e+00\nscale=2.0: 谱半径≈2.11  ||dh_50/dh_0||=8.19e+03\nLSTM 遗忘门 0.95, 50 步直通梯度 = 0.0769  vs tanh RNN(0.9 谱半径) = 0.0052\n遗忘门=1 时 = 1.0",
    note:`J = diag(1−h²)@U@J 是第 1–2 步的连乘；三组 scale 分别落在 ρ<1 / ≈1 / >1，对应第 4–5 步的 1e-15、1.5、8e3；最后两行是第 7 步的 Π f_t。` },
  contrast:[
    {vs:`注意力 / Transformer`, same:`都处理变长序列、都在位置间传递信息`, diff:`RNN 任意两位置的路径长 O(距离)且串行；注意力路径长 O(1)、可并行，代价 O(n²) 显存`, when:`流式低延迟、超长序列显存受限用 RNN/状态空间模型；其余默认 Transformer`},
    {vs:`一维卷积 (TCN)`, same:`都是沿时间共享权重`, diff:`卷积感受野有限且并行；RNN 感受野理论上无限但串行`, when:`固定窗口够用选 1D 卷积；需要不定长记忆选 RNN`},
    {vs:`GRU`, same:`同为门控 RNN，同样有直通路`, diff:`GRU 只有更新/重置两门、无独立细胞态，参数 3 倍而非 4 倍`, when:`小数据/小模型先试 GRU；差别通常小于超参差别`},
    {vs:`隐马尔可夫模型 HMM`, same:`都是"隐藏状态沿时间演化"`, diff:`HMM 状态离散、转移是概率矩阵、可精确推断；RNN 状态连续、确定性、靠梯度学`, when:`要可解释概率推断用 HMM；要表达力用 RNN`}
  ],
  ext:[
    {t:`把"逐步传递"换成"一步直连" → 注意力`, go:'dl.attention'},
    {t:`时间展开的递推关系本质是递归`, go:'co.recursion'},
    {t:`谱半径决定矩阵幂的增长，就是特征值的故事`, go:'la.eigen'}
  ]
},

'dl.attention': {
  layers:{
    alg:`A = softmax(QKᵀ/√d)，out = A V。Q=XW_q, K=XW_k, V=XW_v。A 是 n×n 行随机矩阵，每行是"该位置看谁"的分布；out 每行是 V 的一个凸组合。`,
    geo:`n×n 的热力图：行是提问者，列是被问者，亮格子是它在看谁。每个 query 向量在 key 空间里找方向最接近的几个，再把对应 value 加权平均。`,
    comp:`两次 GEMM 加一次逐行 softmax：QKᵀ 是 (n,d)@(d,n) 花 O(n²d)，AV 再 O(n²d)；n² 的分数矩阵是显存瓶颈，序列翻倍显存四倍。`
  },
  proof:{
    from:`点积相似度；softmax 定义；q,k 各维独立、均值 0、方差 1 的假设(经 LN 与合理初始化后近似成立)`,
    to:`为什么要除 √d：未缩放的点积方差随 d 线性增长，会让 softmax 饱和成 one-hot，梯度归零`,
    steps:[
      [`点积 s = q·k = Σ_{i=1}^{d} q_i k_i`,`定义`],
      [`E[q_i k_i] = E[q_i]E[k_i] = 0`,`q_i 与 k_i 独立，期望可乘`],
      [`Var(q_i k_i) = E[q_i²]E[k_i²] − 0 = 1·1 = 1`,`独立时 E[(qk)²]=E[q²]E[k²]；方差各为 1 即二阶矩为 1`],
      [`Var(s) = Σ_i Var(q_i k_i) = d`,`各项独立，方差可加；于是标准差是 √d，随 d 增长`],
      [`除以 √d: Var(s/√d) = d/d = 1，与 d 无关`,`常数缩放方差按平方缩放，选 √d 恰好抵消`],
      [`softmax 饱和: 若两个分数差 Δ，权重比是 e^{Δ}；Δ 的量级 ~ √d，d=256 时 Δ≈16，e^{16}≈9×10⁶，权重≈one-hot`,`softmax 只看分数差，差随标准差线性增长，指数放大后极端分数独占权重`],
      [`softmax 的雅可比 ∂a_i/∂s_j = a_i(δ_{ij} − a_j)；a 接近 one-hot 时所有项趋于 0`,`a_i(1−a_i) 在 a_i∈{0,1} 时为 0，交叉项 a_i a_j 也为 0，梯度归零，Q/K 不再更新`],
      [`缩放后 Δ ~ O(1)，权重分散(熵高)，雅可比非零，注意力可学`,`同一个雅可比公式在 a 分散时各项非零`]
    ],
    end:`√d 不是超参而是方差校正：它让分数尺度与维度解耦，保证 softmax 停在可学区。缩放点积注意力 = 一个可学的、可微的软查表。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\ndef softmax(s): e = np.exp(s - s.max(-1, keepdims=True)); return e / e.sum(-1, keepdims=True)\ndef attn(Q, K, V, scale=True):\n    S = Q @ K.T / (np.sqrt(Q.shape[1]) if scale else 1.0)\n    A = softmax(S); return A, A @ V\nn, d = 4, 64\nX = np.random.randn(n, d)\nWq, Wk, Wv = [np.random.randn(d, d) / np.sqrt(d) for _ in range(3)]\nA, out = attn(X @ Wq, X @ Wk, X @ Wv)\nprint('权重矩阵 A (行和=1):'); print(A.round(3)); print('out shape', out.shape)\n# 点积方差随 d 线性增长\nfor dd in [16, 64, 256]:\n    q = np.random.randn(10000, dd); k = np.random.randn(10000, dd)\n    print(f'd={dd}: Var(q·k)={np.var((q*k).sum(1)):.1f}  Var(q·k/√d)={np.var((q*k).sum(1)/np.sqrt(dd)):.2f}')\n# 不除 √d 时 softmax 饱和\nq = np.random.randn(1, 256); K = np.random.randn(8, 256)\nA0 = softmax(q @ K.T); A1 = softmax(q @ K.T / 16)\nprint('不除: max权重=%.3f 熵=%.2f' % (A0.max(), -(A0*np.log(A0+1e-12)).sum()))\nprint('除√d: max权重=%.3f 熵=%.2f' % (A1.max(), -(A1*np.log(A1+1e-12)).sum()))", out:"权重矩阵 A (行和=1):\n[[0.129 0.184 0.472 0.216]\n [0.213 0.362 0.239 0.186]\n [0.179 0.58  0.161 0.081]\n [0.117 0.406 0.266 0.211]]\nout shape (4, 64)\nd=16: Var(q·k)=15.9  Var(q·k/√d)=0.99\nd=64: Var(q·k)=63.8  Var(q·k/√d)=1.00\nd=256: Var(q·k)=248.6  Var(q·k/√d)=0.97\n不除: max权重=1.000 熵=0.00\n除√d: max权重=0.433 熵=1.67",
    note:`attn 函数是第 1 步 + 第 5 步；三组 d 的 Var 列是第 4–5 步(≈d 与 ≈1)；最后两行是第 6–8 步：不除 √d 时 max 权重 1.000、熵 0，除后 0.433、熵 1.67。` },
  contrast:[
    {vs:`循环网络 RNN`, same:`都在序列位置之间搬信息`, diff:`RNN 信息走 O(距离) 步、串行；注意力任意两位置一步直连、并行，但 O(n²)`, when:`超长流式序列考虑 RNN/SSM，其余用注意力`},
    {vs:`核回归 / Nadaraya–Watson`, same:`都是"相似度加权平均"`, diff:`核回归的相似度固定(高斯核)，注意力的 Q/K 投影是学出来的且非对称`, when:`理解注意力时把它当"可学核的软查表"`},
    {vs:`点积相似度 vs 余弦相似度`, same:`都量两向量方向一致程度`, diff:`余弦除以模长，尺度固定在 [−1,1]；点积保留模长信息，所以才需要 √d 校正`, when:`注意力用点积(加 √d)；检索去重常用余弦`},
    {vs:`多头注意力`, same:`同一公式`, diff:`多头把 d 切成 h 份各自做注意力再拼接，每头能看不同的关系模式；缩放用 √(d/h)`, when:`Transformer 中默认多头；单头只用于教学与极小模型`}
  ],
  ext:[
    {t:`堆叠多头注意力 + FFN + 残差 + LN → Transformer`, go:'dl.transformer'},
    {t:`点积就是投影，相似度的几何根`, go:'ge.dot_projection'},
    {t:`因果掩码让注意力只看过去，是语言模型的基础`, go:'lm.causal_mask'}
  ]
},

'dl.transformer': {
  layers:{
    alg:`一层: x ← LN(x + MHA(x)); x ← LN(x + FFN(x))，FFN(x)=W_2 relu(W_1 x)。MHA 对输入序列置换等变: MHA(Px)=P·MHA(x)，所以必须加位置编码 x + PE。参数/层 ≈ 4d²(注意力) + 8d²(FFN, 4d 宽) = 12d²。`,
    geo:`N 个相同的积木层叠起来；每层里 token 先互相看一眼(注意力，横向混合)，再各自独立过一个小 MLP(纵向加工)；两个子层各绕一条残差旁路。`,
    comp:`全部是 GEMM，序列维可并行；注意力 O(n²d)，FFN O(nd²)。n 短时 FFN 主导算力，n 长时注意力主导显存。训练需 warmup，因为初期 LN 后的梯度尺度不稳。`
  },
  proof:{
    from:`注意力公式；置换矩阵 P 的性质 PPᵀ=I；逐位置函数的定义`,
    to:`(1) 无位置编码的 Transformer 对输入顺序置换等变，故必须注入位置；(2) 一层参数量 12d²`,
    steps:[
      [`Q=XW_q，则 (PX)W_q = P(XW_q)：投影与置换交换`,`矩阵乘结合律，P 在左边不动`],
      [`分数矩阵 S' = (PQ)(PK)ᵀ = P Q Kᵀ Pᵀ = P S Pᵀ`,`转置反序 (PK)ᵀ = KᵀPᵀ`],
      [`逐行 softmax 与"行列同时置换"交换: softmax(PSPᵀ) = P softmax(S) Pᵀ`,`softmax 只在每一行内部归一化，行换位置、列换顺序都不改变各行内的相对值`],
      [`输出 A'V' = P A Pᵀ P V = P A V`,`PᵀP = I；于是 MHA(PX) = P·MHA(X)，等变成立`],
      [`FFN、LN 都是逐位置函数，天然与置换交换；残差相加保持等变`,`逐位置意味着对每一行独立作用，行的顺序无关；两个等变映射之和仍等变`],
      [`整层、整网都等变 ⇒ 打乱输入顺序，输出只是同样被打乱：模型看不见顺序`,`等变映射的复合仍等变；分类头若做平均池化则完全不变，语序彻底丢失`],
      [`加 x + PE(pos)，PE 不随置换移动，等变被打破，顺序信息进入`,`PE 绑定的是位置下标而非内容，置换后每个 token 拿到不同的 PE，输入不再是原输入的行置换`],
      [`参数量: W_q,W_k,W_v,W_o 各 d×d = 4d²；FFN W_1: d×4d，W_2: 4d×d = 8d²；合计 12d²；d=768 得 7.08M/层`,`直接数矩阵元素；bias 与 LN 的 2d 参数量级可忽略`]
    ],
    end:`Transformer 是一个天生"看不见顺序"的集合函数，位置编码是它的眼睛；12d²/层让你能心算任何模型的规模。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nd, h, n = 32, 4, 6\ndef sm(s): e = np.exp(s - s.max(-1, keepdims=True)); return e / e.sum(-1, keepdims=True)\ndef LN(x): return (x - x.mean(-1, keepdims=True)) / np.sqrt(x.var(-1, keepdims=True) + 1e-5)\nW = {k: np.random.randn(d, d) / np.sqrt(d) for k in 'qkvo'}\nW1 = np.random.randn(d, 4*d) / np.sqrt(d); W2 = np.random.randn(4*d, d) / np.sqrt(4*d)\ndef block(x):\n    Q, K, V = x @ W['q'], x @ W['k'], x @ W['v']\n    heads = []\n    for i in range(h):                                   # 多头: 按列切\n        sl = slice(i*d//h, (i+1)*d//h)\n        heads.append(sm(Q[:, sl] @ K[:, sl].T / np.sqrt(d//h)) @ V[:, sl])\n    x = LN(x + np.concatenate(heads, 1) @ W['o'])        # 残差 + LN\n    return LN(x + np.maximum(x @ W1, 0) @ W2)            # FFN 子层\nx = np.random.randn(n, d); perm = np.random.permutation(n)\nprint('置换等变 block(Px)=P block(x) 误差 =', np.abs(block(x[perm]) - block(x)[perm]).max())\nx_pos = x + np.sin(np.arange(n)[:, None] / 10 ** (np.arange(d)[None] / d))   # 加位置编码\nprint('加位置编码后误差 =', round(np.abs(block(x_pos[perm]) - block(x_pos)[perm]).max(), 3), '(不再等变, 顺序进来了)')\nparams = 4*d*d + 2*4*d*d\nprint(f'd={d}: 注意力 4d²={4*d*d}, FFN 8d²={8*d*d}, 合计 12d²={params}')\nprint('d=768 一层 ≈', 12*768*768/1e6, 'M')", out:"置换等变 block(Px)=P block(x) 误差 = 1.1102230246251565e-15\n加位置编码后误差 = 0.0 (不再等变, 顺序进来了)\nd=32: 注意力 4d²=4096, FFN 8d²=8192, 合计 12d²=12288\nd=768 一层 ≈ 7.077888 M",
    note:`block 函数是完整一层(多头按列切、残差、LN、FFN)；perm 那行验证第 1–6 步的等变(误差 1e-15)；加 PE 后误差非零对应第 7 步；最后两行是第 8 步的 12d²。` },
  contrast:[
    {vs:`注意力 Attention`, same:`Transformer 的核心子层就是它`, diff:`注意力只是一个算子；Transformer = 多头注意力 + FFN + 残差 + LN + 位置编码的完整架构`, when:`谈机制说注意力，谈模型说 Transformer`},
    {vs:`循环网络 RNN`, same:`都建模序列`, diff:`RNN 串行、路径长 O(n)、天然有序；Transformer 并行、路径 O(1)、需要外加位置`, when:`除流式/超长场景外默认 Transformer`},
    {vs:`BN vs LN`, same:`都把激活重标定到零均值单位方差`, diff:`BN 沿 batch 维统计(依赖 batch 大小与序列 padding)；LN 沿特征维对每个 token 单独归一化`, when:`CNN 用 BN；序列模型/小 batch 用 LN`},
    {vs:`参数量 vs 计算量 FLOPs`, same:`都随 d 增长`, diff:`参数 ≈ 12d²N 与序列长度无关；每 token 计算 ≈ 2×参数 + 注意力的 O(nd)，训练总 FLOPs ≈ 6×参数×token 数`, when:`估显存看参数，估训练时间看 6ND`}
  ],
  ext:[
    {t:`只留解码器 + 因果掩码 → 自回归语言模型`, go:'lm.causal_mask'},
    {t:`KV cache 让推理不重算历史 token 的 K、V`, go:'lm.kv_cache'},
    {t:`残差 + LN 两件套的来源`, go:'dl.resnet'}
  ]
},

'dl.resnet': {
  layers:{
    alg:`y = x + F(x)，∂y/∂x = I + ∂F/∂x。L 个块复合后 ∂y_L/∂x_0 = Π (I + J_l) = I + Σ J_l + Σ J_l J_m + …，展开里永远有一个 I。`,
    geo:`主路两层卷积，旁边一条直通绕行线，末端相加。梯度从顶端回流时可以完全不走主路，直接沿绕行线到底。`,
    comp:`前向多一次逐元素加法(几乎免费)；通道/尺寸不匹配时旁路加 1×1 卷积投影。BN 放在卷积后、相加前。`
  },
  proof:{
    from:`链式法则；恒等映射的雅可比是 I；普通网络的雅可比连乘 Π J_l`,
    to:`残差让梯度存在一条恒等通路，深度不再必然导致衰减；且"加层至少不伤害"`,
    steps:[
      [`普通网络 y_L = f_L(…f_1(x))，∂y_L/∂x = J_L … J_1`,`链式法则；每个 J_l 是一层的雅可比`],
      [`若每层 ‖J_l‖ ≤ c < 1，则 ‖∂y_L/∂x‖ ≤ c^L → 0`,`范数次可乘性；50 层 0.9^50 ≈ 0.005`],
      [`残差块 y = x + F(x)，∂y/∂x = I + J_F`,`加法的导数是导数之和，恒等映射的雅可比是 I`],
      [`L 个块: ∂y_L/∂x_0 = Π_l (I + J_l) = I + Σ_l J_l + (高阶乘积项)`,`按乘法分配律展开，选"每个括号都取 I"那一项得 I，它与任何 J 的大小无关`],
      [`把 ∂L/∂x_0 = (∂L/∂y_L)(I + Σ J_l + …) 看作多条路径之和，其中恒等路径不衰减`,`矩阵展开的每一项对应一条"经过哪些 F"的路径，全不经过的那条贡献恒等`],
      [`若某块的 F 学不到东西 (F≡0)，则 y = x，网络退化为少一层的同一网络`,`恒等映射被显式包含在函数族里，于是加深的网络的最优解不会比浅网差`],
      [`普通网络要把一层学成恒等需 W 精确等于 I，对随机初始化的 ReLU 层很难；残差只需 F→0，即 W→0，易到达`,`权重衰减本身就在把 W 推向 0；"学零"比"学恒等"是更接近初始化的目标`],
      [`ResNet 的退化问题(56 层比 20 层训练误差更高)由此解释为优化困难而非过拟合`,`训练误差升高说明优化找不到浅网那个解，与泛化无关；残差把浅网解放进了可达集合`]
    ],
    end:`残差把"乘法链"改成"加法项"：梯度有一条永不衰减的恒等通路，深度从风险变成资源。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nD, L = 32, 50\ndef grad_norm(residual, gain):\n    J = np.eye(D)\n    for _ in range(L):\n        W = np.random.randn(D, D) / np.sqrt(D) * gain\n        x = np.random.randn(D); z = W @ x\n        JF = np.diag((z > 0).astype(float)) @ W          # dF/dx (ReLU 层)\n        J = ((np.eye(D) + JF) if residual else JF) @ J   # 1 + dF/dx  vs  dF/dx\n    return np.linalg.norm(J, 2)\nfor g in [0.8, 1.0]:\n    print(f'gain={g}: 普通 50 层 ||dy/dx||={grad_norm(False, g):.2e}   残差 50 层 ={grad_norm(True, g):.2e}')\n# 恒等通路: F 权重全 0 时 y = x\nx = np.abs(np.random.randn(5)); print('F=0 时 relu(0+x)-x =', np.abs(np.maximum(0 + x, 0) - x).max())", out:"gain=0.8: 普通 50 层 ||dy/dx||=1.48e-12   残差 50 层 =5.38e+03\ngain=1.0: 普通 50 层 ||dy/dx||=6.59e-08   残差 50 层 =7.65e+04\nF=0 时 relu(0+x)-x = 0.0",
    note:`J = (I + JF)@J 与 J = JF@J 分别是第 3 步与第 1 步；两组 gain 下普通 50 层为 1e-12 / 7e-8，残差为 5e3 / 8e4，对应第 2 与第 4–5 步；最后一行验证第 6 步 F=0 ⇒ y=x。` },
  contrast:[
    {vs:`普通卷积网络 / VGG`, same:`同样的卷积、BN、ReLU 积木`, diff:`残差多一条 x 的旁路，梯度与信息不必层层穿过 F`, when:`超过 10 来层几乎总用残差`},
    {vs:`LSTM 的细胞态直通`, same:`都是给梯度修一条不衰减的路`, diff:`LSTM 是沿时间的门控加法，残差是沿深度的无门加法`, when:`时间维用门控，深度维用残差`},
    {vs:`DenseNet`, same:`都用跳接`, diff:`Dense 把所有前层输出 concat(信息复用更强、显存更大)，残差只与上一块相加`, when:`默认残差；参数受限且想极致特征复用时考虑 Dense`},
    {vs:`Highway 网络`, same:`同时代的旁路设计`, diff:`Highway 用可学门 T(x) 混合 x 与 F(x)，残差直接 1 与 1，无门更简单且更稳`, when:`残差几乎全面替代 Highway`}
  ],
  ext:[
    {t:`Transformer 的每个子层都套一圈残差 + LN`, go:'dl.transformer'},
    {t:`U-Net 的跳接是残差思想在编码-解码之间的版本(concat 而非相加)`, go:'dl.unet'},
    {t:`y = x + F(x) 是一阶欧拉步，无限深残差 → 神经 ODE`, go:'ca.ode'}
  ]
},

'dl.unet': {
  layers:{
    alg:`enc_i = down(enc_{i−1})，瓶颈 b = enc_4；dec_i = conv(concat(up(dec_{i+1}), enc_i))。输出与输入同分辨率的逐像素 logits，损失 = CE + Dice。`,
    geo:`一个 U 形：左臂逐级缩小、变厚(看更大范围、懂语义)，右臂逐级放大、变薄(画细节)，同层之间横着的运输带把左臂的高分辨率特征原样送到右臂。`,
    comp:`4 级 2× 下采样后瓶颈是 1/16 分辨率；上采样用转置卷积或最近邻+卷积；concat 沿通道维使右臂输入通道翻倍。显存主要在高分辨率的前两层。`
  },
  proof:{
    from:`感受野递推(见 dl.cnn)；下采样是多对一映射，不可逆；两个张量沿通道 concat 保留全部信息`,
    to:`为什么逐像素任务必须同时有编码-解码与跳接：单靠瓶颈无法恢复像素级位置，跳接补回被下采样丢掉的信息`,
    steps:[
      [`语义需要大感受野；感受野每级下采样后按累积步长成倍扩大`,`感受野递推 r_l = r_{l−1} + (k−1)·Πs，步长 2 的下采样让后续每层增量翻倍`],
      [`2× 下采样(最大池化/步长 2)是 2→1 的多对一映射，无法从输出唯一反推输入`,`函数不单射就没有逆；边缘落在 2×2 块内的哪一格的信息已经丢失`],
      [`4 级后位置精度降到 16 像素：瓶颈只知道边缘在哪一个 16 像素块内`,`每级损失 1 位位置信息，四级损失 4 位，2⁴=16`],
      [`只用上采样从瓶颈重建，边缘位置误差最大可达 16 像素`,`上采样是插值，它没有被丢掉的那 4 位信息，只能猜块中心或块边`],
      [`concat 左臂同分辨率特征后，解码器同时拥有"语义(来自瓶颈)"与"细节(来自跳接)"`,`concat 不做任何压缩，左臂特征在该分辨率下的全部信息被保留传来`],
      [`一个卷积即可学到 "语义 AND 细节" 的组合，精确恢复边缘`,`两路信息都在通道维上，卷积对通道做线性组合再非线性，足以实现按位与`],
      [`跳接同时给梯度一条短路径回到浅层，缓解深编码器的训练困难`,`与残差同理：梯度不必穿过瓶颈`],
      [`前景占比极小(5%)时 CE 被背景主导，加 Dice = 2|A∩B|/(|A|+|B|) 直接优化重叠度`,`Dice 对类别不平衡不敏感，因为分母只数前景相关像素，背景不参与`]
    ],
    end:`U-Net 的 U 解决"看多大"与"画多细"的矛盾，跳接解决下采样不可逆带来的位置丢失；两者缺一都做不到像素级精确。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\n# 编码器分辨率链\nr = 256; chain = [r]\nfor _ in range(4): r //= 2; chain.append(r)\nprint('分辨率链:', chain)\n# 下采样丢位置: 1D 边缘信号, 4 次 2x maxpool 再最近邻上采样\nsig = np.zeros(256); sig[137:] = 1.0            # 边缘在 137\nx = sig.copy()\nfor _ in range(4): x = x.reshape(-1, 2).max(1)   # 16 个点\nup = np.repeat(x, 16)                            # 回到 256\nprint('瓶颈重建的边缘位置 =', int(np.argmax(up > 0)), ' 真边缘 = 137  误差 =', 137 - int(np.argmax(up > 0)))\n# 跳接: concat 高分辨率特征后, 1 个\"卷积\"(这里取 min)即可恢复精确边缘\ncat = np.stack([up, sig])                        # 通道拼接 (2, 256)\nrec = cat.min(0)                                 # 解码器学到: 语义 AND 细节\nprint('带跳接重建的边缘位置 =', int(np.argmax(rec > 0)))\nprint('concat 通道数: 256 + 256 =', 256 + 256)\npred = 120; gt = 100; inter = 80\nprint('Dice =', round(2*inter/(pred+gt), 3), ' IoU =', round(inter/(pred+gt-inter), 3))", out:"分辨率链: [256, 128, 64, 32, 16]\n瓶颈重建的边缘位置 = 128  真边缘 = 137  误差 = 9\n带跳接重建的边缘位置 = 137\nconcat 通道数: 256 + 256 = 512\nDice = 0.727  IoU = 0.571",
    note:`四次 reshape(-1,2).max(1) 是第 2–3 步的下采样；up 的边缘落到 128(误差 9)是第 4 步；cat.min(0) 是第 5–6 步"语义 AND 细节"精确回到 137；最后两行是 concat 通道与 Dice/IoU。` },
  contrast:[
    {vs:`普通编码-解码器 (无跳接)`, same:`同样的 U 形分辨率变化`, diff:`无跳接时细节必须挤过瓶颈，边缘只能精确到块级`, when:`分割/去噪/超分等逐像素任务都要跳接`},
    {vs:`ResNet 残差`, same:`都是跳接`, diff:`残差是同层相加(通道数不变)，U-Net 是跨分辨率 concat(通道翻倍)`, when:`深度方向用相加，编码-解码之间用 concat`},
    {vs:`分类 CNN`, same:`共用同样的编码器(下采样臂)`, diff:`分类要平移不变，最后全局池化把位置抹掉；分割要等变，位置必须保留`, when:`输出一个标签用分类网，输出一张图用 U-Net`},
    {vs:`Dice vs IoU`, same:`都量预测与真值的重叠`, diff:`Dice=2I/(P+G)，IoU=I/(P+G−I)；Dice ≥ IoU，二者单调等价`, when:`训练常用 Dice 损失(可微、梯度友好)；报告常用 IoU`}
  ],
  ext:[
    {t:`医学图像分割的主力，把细胞/器官逐像素标出`, go:'bm.image_seg'},
    {t:`扩散模型的去噪网络就是带时间嵌入的 U-Net`, go:'gm.diffusion'},
    {t:`编码器部分就是卷积网络`, go:'dl.cnn'}
  ]
},

'dl.vae': {
  layers:{
    alg:`log p(x) ≥ E_{q(z|x)}[log p(x|z)] − KL(q(z|x) ‖ p(z)) =: ELBO。等号当且仅当 q = p(z|x)。高斯 q 与标准高斯先验的 KL 有闭式 ½Σ(μ²+σ²−1−log σ²)。`,
    geo:`编码器把每张图压成潜空间里的一小团高斯云(μ 是中心，σ 是毛边)；KL 项把所有云推向原点附近的标准球，让云与云挨着、之间无空洞；解码器从云里任取一点都能画回图。`,
    comp:`前向: 编码器出 (μ, log σ²)，采样 ε~N(0,I)，z = μ + σ⊙ε，解码器出 x̂；损失 = 重建项 + β·KL。重参数化把随机性挪到输入端，梯度才能穿过采样。`
  },
  proof:{
    from:`边缘似然 p(x) = ∫ p(x|z)p(z) dz；Jensen 不等式：log 是凹函数，log E[Y] ≥ E[log Y]；KL ≥ 0`,
    to:`ELBO 是 log p(x) 的下界，gap 恰为 KL(q‖p(z|x))；最大化 ELBO = 同时学生成模型与近似后验`,
    steps:[
      [`引入任意分布 q(z|x)：log p(x) = log ∫ q(z|x) · p(x,z)/q(z|x) dz`,`乘除同一个 q，积分值不变(q>0 处)`],
      [`= log E_q[p(x,z)/q(z|x)] ≥ E_q[log p(x,z)/q(z|x)]`,`Jensen：log 凹，log E ≥ E log；这就是 ELBO`],
      [`拆开: E_q[log p(x|z)] + E_q[log p(z) − log q(z|x)] = E_q[log p(x|z)] − KL(q(z|x)‖p(z))`,`p(x,z)=p(x|z)p(z)，log 拆成和；后一项按 KL 定义`],
      [`精确计算 gap: log p(x) − ELBO = E_q[log q(z|x) − log p(z|x)] = KL(q(z|x) ‖ p(z|x)) ≥ 0`,`用 p(x,z)=p(z|x)p(x) 代回，log p(x) 与 z 无关可提出期望；KL 非负(Gibbs 不等式)`],
      [`故 q 越接近真后验，下界越紧；q = p(z|x) 时取等`,`KL 为 0 当且仅当两分布相等`],
      [`高斯 q=N(μ,σ²)、p(z)=N(0,1) 的 KL = ½(μ² + σ² − 1 − log σ²)`,`代入两高斯密度取 log 差再对 q 求期望，用 E_q[z]=μ，E_q[z²]=μ²+σ²`],
      [`E_q[log p(x|z)] 对 (μ,σ) 的梯度需穿过采样：写 z = μ + σε，ε~N(0,1)`,`z 的分布不变(仿射变换高斯仍高斯)，但随机性移到 ε，z 对 μ,σ 可微`],
      [`于是 ∇_{μ,σ} E_ε[log p(x|μ+σε)] = E_ε[∇ log p(x|μ+σε)]，用单次采样做无偏估计`,`ε 的分布与参数无关，期望与梯度可交换；一个样本的梯度是期望梯度的无偏估计`]
    ],
    end:`VAE = 用 Jensen 把不可算的 log p(x) 换成可算的 ELBO，用重参数化让它可微；KL 项既是下界的一部分，也是让潜空间规整的正则。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\n# 玩具模型: z~N(0,1), x|z ~ N(a z, s^2)  =>  p(x)=N(0, a^2+s^2), 后验 q*(z|x) 可闭式算\na, s, x = 2.0, 0.5, 1.3\nlogN = lambda v, m, var: -0.5*np.log(2*np.pi*var) - (v-m)**2/(2*var)\nlog_px = logN(x, 0, a*a + s*s)\ndef elbo(mu, sig, n=200000):\n    eps = np.random.randn(n); z = mu + sig*eps                  # 重参数化\n    return np.mean(logN(x, a*z, s*s)) - 0.5*(mu**2 + sig**2 - 1 - np.log(sig**2))   # E_q log p(x|z) - KL\npost_var = 1/(1 + a*a/(s*s)); post_mu = post_var * a*x/(s*s)\nprint('log p(x) =', round(log_px, 4))\nfor mu, sg, name in [(0, 1, '先验当 q'), (0.5, 0.5, '随便一个 q'), (post_mu, np.sqrt(post_var), '真后验当 q')]:\n    e = elbo(mu, sg); print(f'{name}: ELBO={e:.4f}  gap={log_px-e:.4f}')\n# KL 闭式 vs 蒙特卡洛\nmu, sg = 1.0, 0.7; z = mu + sg*np.random.randn(200000)\nmc = np.mean(logN(z, mu, sg*sg) - logN(z, 0, 1))\nprint('KL 闭式 =', round(0.5*(mu**2+sg**2-1-np.log(sg**2)), 4), ' MC =', round(mc, 4))", out:"log p(x) = -1.8412\n先验当 q: ELBO=-11.5395  gap=9.6982\n随便一个 q: ELBO=-2.8455  gap=1.0043\n真后验当 q: ELBO=-1.8409  gap=-0.0003\nKL 闭式 = 0.6017  MC = 0.6022",
    note:`elbo 函数里 z=mu+sig*eps 是第 7 步的重参数化，返回值是第 3 步的两项；三组 q 的 gap 从 9.7 降到 ≈0 验证第 4–5 步(真后验时取等，−0.0003 是 MC 噪声)；最后一行验证第 6 步的闭式 KL。` },
  contrast:[
    {vs:`普通自编码器 AE`, same:`都是编码-瓶颈-解码，都用重建损失`, diff:`AE 潜空间是点、无先验约束、有空洞；VAE 潜空间是分布、被 KL 拉向标准高斯、可采样`, when:`只要压缩/去噪用 AE；要生成/插值用 VAE`},
    {vs:`生成对抗网络 GAN`, same:`都从潜变量 z 生成 x`, diff:`VAE 最大化似然下界，有显式 ELBO 可算、图偏糊；GAN 用判别器当损失，无似然、图清晰但训练不稳`, when:`要密度估计/可控潜空间选 VAE；要清晰样本选 GAN`},
    {vs:`扩散模型`, same:`同为似然类生成模型，扩散的训练目标也是一个 ELBO`, diff:`VAE 一步编码一步解码；扩散是 T 步固定的加噪(编码)与 T 步学的去噪(解码)，潜空间与数据同维`, when:`质量优先选扩散；速度/压缩优先选 VAE(常作扩散的第一级压缩器)`},
    {vs:`最大似然估计 MLE`, same:`目标都是最大化 log p(x)`, diff:`MLE 直接优化似然；VAE 因积分不可算而优化其下界`, when:`似然可算(如高斯、自回归)用 MLE；含隐变量且积分不可算用变分`}
  ],
  ext:[
    {t:`把编码换成固定加噪、解码拆成 T 步 → 扩散模型`, go:'gm.diffusion'},
    {t:`潜空间插值、算术与解耦`, go:'gm.latent_space'},
    {t:`KL 散度的定义与性质`, go:'it.kl'}
  ]
},

'dl.gan': {
  layers:{
    alg:`min_G max_D V(D,G) = E_{x~p_data}[log D(x)] + E_{z}[log(1 − D(G(z)))]。固定 G 时最优 D*(x) = p_data/(p_data + p_G)；代回得 V(D*,G) = −log 4 + 2·JS(p_data ‖ p_G)。`,
    geo:`两团分布，D 是一条在两团之间的软分界面(输出 p_data 占比)；G 每步把自己那团往 D 说"更像真"的方向推。均衡时两团重合，D 处处 0.5。`,
    comp:`交替更新: 采一批真 x 与一批假 G(z)，先对 D 做一步梯度上升，再固定 D 对 G 做一步下降(实践用 −log D(G(z)) 的非饱和形式，避免早期梯度为 0)。`
  },
  proof:{
    from:`GAN 目标函数；JS 散度定义 JS(p‖q) = ½KL(p‖m) + ½KL(q‖m)，m=(p+q)/2；单变量函数 a log y + b log(1−y) 的极值`,
    to:`固定 G 的最优判别器 D* 与全局最优 p_G = p_data；GAN 的博弈在最优 D 下等价于最小化 JS 散度`,
    steps:[
      [`把期望写成积分: V = ∫ [p_data(x) log D(x) + p_G(x) log(1−D(x))] dx`,`换元 x=G(z) 后 E_z[f(G(z))] = E_{x~p_G}[f(x)]，两项合成对 x 的一个积分`],
      [`逐点最大化被积函数 a log y + b log(1−y)，a=p_data(x)，b=p_G(x)`,`D(x) 在每个 x 可独立取值，积分最大 ⇔ 逐点最大(D 容量无限时)`],
      [`求导 a/y − b/(1−y) = 0 ⇒ y* = a/(a+b)，即 D*(x) = p_data/(p_data+p_G)`,`一阶条件；二阶导 −a/y² − b/(1−y)² < 0 保证是最大`],
      [`代回: V(D*) = ∫ p_data log[p_data/(p_data+p_G)] + p_G log[p_G/(p_data+p_G)] dx`,`直接替换 D`],
      [`分母配成 2m，m=(p_data+p_G)/2: V(D*) = −log 4 + KL(p_data‖m) + KL(p_G‖m)`,`p/(p+q) = ½ · p/m，log ½ 提出来两项各得 −log 2，合计 −log 4`],
      [`即 V(D*) = −log 4 + 2·JS(p_data ‖ p_G)`,`JS 的定义正是两个 KL 的平均`],
      [`JS ≥ 0 且 =0 当且仅当 p_G = p_data ⇒ G 的全局最优是 p_G = p_data，此时 V = −log 4，D* ≡ ½`,`KL 非负性推出 JS 非负；等号条件继承自 KL；代入 D* 公式得 ½`],
      [`训练早期若两分布支撑集不重叠，JS 恒为 log 2，梯度为 0：这就是 GAN 难训与 WGAN 改用 Wasserstein 距离的动机`,`不重叠时 m 上两 KL 都等于 log 2，与 G 的参数无关，导数为 0`]
    ],
    end:`GAN 在最优判别器下就是在最小化 JS 散度；判别器不是对手而是一个可学的距离度量，均衡点 D≡½ 即"分布重合"。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nxs = np.linspace(-8, 8, 4001); dx = xs[1] - xs[0]\nN = lambda m, s: np.exp(-(xs-m)**2/(2*s*s))/np.sqrt(2*np.pi*s*s)\np = N(0, 1)                                         # p_data\ndef value(D, q): return np.sum((p*np.log(D) + q*np.log(1-D)) * dx)\nfor m in [3.0, 1.0, 0.0]:\n    q = N(m, 1)                                     # p_G\n    Ds = p/(p+q)                                    # 最优判别器\n    V = value(Ds, q)\n    M = (p+q)/2; JS = 0.5*np.sum(p*np.log(p/M)*dx) + 0.5*np.sum(q*np.log(q/M)*dx)\n    Vbad = value(np.clip(Ds + 0.1*np.sin(xs), 1e-6, 1-1e-6), q)   # 扰动 D, 值应变小\n    print(f'p_G=N({m},1): V(D*)={V:.4f}  -log4+2JS={-np.log(4)+2*JS:.4f}  扰动D后 V={Vbad:.4f}  D*(0)={Ds[2000]:.3f}')", out:"p_G=N(3.0,1): V(D*)=-0.3327  -log4+2JS=-0.3327  扰动D后 V=-0.4270  D*(0)=0.989\np_G=N(1.0,1): V(D*)=-1.1635  -log4+2JS=-1.1635  扰动D后 V=-1.1892  D*(0)=0.622\np_G=N(0.0,1): V(D*)=-1.3863  -log4+2JS=-1.3863  扰动D后 V=-1.4038  D*(0)=0.500",
    note:`Ds = p/(p+q) 是第 3 步；V(D*) 与 −log4+2JS 逐位相等验证第 4–6 步；扰动 D 后 V 变小验证 D* 确是最大；p_G=p_data 那行 V=−1.3863=−log 4、D*(0)=0.5 验证第 7 步。` },
  contrast:[
    {vs:`变分自编码器 VAE`, same:`都从 z 生成 x`, diff:`VAE 优化似然下界(有 ELBO 可算、图糊)；GAN 用判别器做隐式距离(无似然、图锐、不稳)`, when:`要密度/潜空间用 VAE，要视觉质量用 GAN 或扩散`},
    {vs:`扩散模型`, same:`都能出高质量样本`, diff:`扩散是似然类、训练是稳定的回归(预测噪声)、采样多步慢；GAN 一步采样快但训练是博弈`, when:`2022 后质量默认扩散；实时/单步生成仍用 GAN 或蒸馏`},
    {vs:`JS 散度 vs KL 散度`, same:`都量两分布差异`, diff:`KL 不对称、可无穷；JS 对称、有界 [0, log 2]，但支撑不重叠时恒为 log 2 无梯度`, when:`MLE 对应 KL(p_data‖p_G)；原始 GAN 对应 JS；WGAN 换成 Wasserstein`},
    {vs:`判别式分类器`, same:`D 就是一个二分类器`, diff:`普通分类器的数据分布固定；D 的负类分布 p_G 在训练中不断移动，所以不能训到收敛再换 G`, when:`把 D 当"会动的损失函数"来理解`}
  ],
  ext:[
    {t:`把 JS 换成 Wasserstein、加谱归一化、条件生成`, go:'gm.gan'},
    {t:`用 FID 评估生成分布与真实分布的距离`, go:'gm.fid'},
    {t:`KL 散度是 JS 的基石`, go:'it.kl'}
  ]
},

'dl.loss': {
  layers:{
    alg:`损失 = 负对数似然。高斯噪声 ⇒ −log N(y; ŷ, σ²) ∝ (y−ŷ)²；多项分布 ⇒ CE = −Σ_i y_i log p_i，p = softmax(z)。softmax+CE 对 logits 的梯度 ∂L/∂z = p − y。`,
    geo:`真值那一格上方吊着 −log p 的曲线：p→1 时贴地，p→0 时冲天。梯度 p − y 是"预测分布减真值分布"，是一个指向真值格子的向量，错得越狠拉得越狠。`,
    comp:`logits 先减最大值再 exp(防溢出)，log-softmax 合成一步 z_i − logsumexp(z)；PyTorch 的 CrossEntropyLoss 内含 log_softmax，反向只需一次减法 p − y。`
  },
  proof:{
    from:`softmax 定义 p_i = e^{z_i}/Σ_j e^{z_j}；交叉熵 L = −Σ_i y_i log p_i，y 是 one-hot；最大似然原理`,
    to:`∂L/∂z_k = p_k − y_k；并说明为什么分类用 MSE 会在错得最狠时梯度反而最小`,
    steps:[
      [`log p_i = z_i − log Σ_j e^{z_j}`,`对 softmax 取对数，分母提出`],
      [`∂ log p_i/∂z_k = δ_{ik} − e^{z_k}/Σ_j e^{z_j} = δ_{ik} − p_k`,`z_i 对 z_k 的导数是 δ_{ik}；logsumexp 对 z_k 的导数恰是 p_k`],
      [`∂L/∂z_k = −Σ_i y_i(δ_{ik} − p_k) = −y_k + p_k Σ_i y_i`,`链式法则套第 2 步，把 p_k 提出求和`],
      [`Σ_i y_i = 1 ⇒ ∂L/∂z_k = p_k − y_k`,`one-hot 恰好和为 1；软标签也成立，只要 y 是分布`],
      [`向量形式 ∂L/∂z = p − y，其各分量之和为 0`,`Σ p = Σ y = 1；梯度是把概率从错格子搬到真格子的"搬运向量"`],
      [`该梯度对真类是 p_真 − 1，越错(p_真→0)绝对值越接近 1，永不消失`,`直接读第 4 步；|p−1| 单调随 p 减小而增大`],
      [`对比 MSE on softmax: ∂L/∂z = J_softmaxᵀ · 2(p−y)，J = diag(p) − ppᵀ；p_真→0 时 J 的真类行 ∝ p_真(1−p_真) → 0，梯度归零`,`softmax 的雅可比在饱和处为 0，这个因子被乘进去；CE 之所以没有这个因子，是因为 log 恰好抵消了 softmax 的指数`],
      [`从 MLE 看：多项分布似然 Π p_i^{y_i} 的负对数正是 CE，所以损失不是"选"的，是噪声模型推出来的`,`最大似然 = 最小负对数似然；换噪声模型(高斯)就得到 MSE`]
    ],
    end:`softmax+CE 的梯度 = 预测减真值，简洁且永不饱和；loss 是概率假设的影子——先定噪声模型，损失自动跟着定。`
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\ndef softmax(z): e = np.exp(z - z.max()); return e / e.sum()\nz = np.array([2.0, 1.0, 0.0]); y = np.array([0, 0, 1.0])\np = softmax(z); print('softmax =', p.round(3), ' CE =', round(-np.sum(y*np.log(p)), 4))\nprint('解析梯度 p-y =', (p - y).round(6))\nnum = np.zeros(3); eps = 1e-6\nfor i in range(3):\n    zp = z.copy(); zp[i] += eps; zm = z.copy(); zm[i] -= eps\n    num[i] = (-np.sum(y*np.log(softmax(zp))) + np.sum(y*np.log(softmax(zm)))) / (2*eps)\nprint('数值梯度     =', num.round(6), ' 最大误差 =', f'{np.abs(num-(p-y)).max():.1e}')\n# 错得越狠, MSE 的梯度反而越小; CE 不会\nfor zt in [0.0, -3.0, -8.0]:\n    z2 = np.array([zt, 0.0]); y2 = np.array([1.0, 0.0]); p2 = softmax(z2)\n    J = np.diag(p2) - np.outer(p2, p2)                 # dp/dz\n    g_mse = J @ (2*(p2 - y2)); g_ce = p2 - y2\n    print(f'真类logit={zt:>4}: p真={p2[0]:.4f}  |grad MSE|={np.abs(g_mse[0]):.4f}  |grad CE|={np.abs(g_ce[0]):.4f}')", out:"softmax = [0.665 0.245 0.09 ]  CE = 2.4076\n解析梯度 p-y = [ 0.665241  0.244728 -0.909969]\n数值梯度     = [ 0.665241  0.244728 -0.909969]  最大误差 = 1.2e-10\n真类logit= 0.0: p真=0.5000  |grad MSE|=0.5000  |grad CE|=0.5000\n真类logit=-3.0: p真=0.0474  |grad MSE|=0.1721  |grad CE|=0.9526\n真类logit=-8.0: p真=0.0003  |grad MSE|=0.0013  |grad CE|=0.9997",
    note:`p−y 与中心差分数值梯度逐位相同(误差 1e-10)验证第 1–4 步；末三行对比第 6–7 步：真类 logit 从 0 到 −8，CE 的梯度升到 0.9997，MSE 的梯度掉到 0.0013。` },
  contrast:[
    {vs:`均方误差 MSE`, same:`都是负对数似然`, diff:`MSE 来自高斯噪声、适合连续目标；分类上套 MSE 会经过 softmax 的饱和雅可比，错得最狠时梯度最小`, when:`回归 MSE/Huber；分类 CE`},
    {vs:`二元交叉熵 BCE`, same:`同为交叉熵`, diff:`BCE 每个输出各自 sigmoid，各类独立；CE 用 softmax，各类互斥竞争`, when:`单标签多分类 CE；多标签或二分类 BCE(WithLogits)`},
    {vs:`KL 散度`, same:`CE(y,p) = H(y) + KL(y‖p)`, diff:`只差一个与模型无关的常数 H(y)，one-hot 时 H(y)=0 两者相等`, when:`优化时等价；软标签/蒸馏场景报 KL 更清楚`},
    {vs:`负对数似然 NLL`, same:`就是同一件事`, diff:`PyTorch 的 NLLLoss 吃 log-prob，CrossEntropyLoss = LogSoftmax + NLLLoss`, when:`手动做了 log_softmax 用 NLLLoss，否则直接 CrossEntropyLoss`}
  ],
  ext:[
    {t:`交叉熵的信息论含义：用 p 编码 y 的平均码长`, go:'it.cross_entropy'},
    {t:`从最大似然出发推各种损失`, go:'pr.mle'},
    {t:`p − y 送进反向传播，是整个网络梯度的起点`, go:'dl.backprop'}
  ]
}

});
