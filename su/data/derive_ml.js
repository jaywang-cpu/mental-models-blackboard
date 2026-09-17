// 数理宇宙 v3 · 推导层：ml 机器学习大陆（12 节点）
// 只 push 到 window.DERIVE，不改动 v1/v2 任何文件。scratch 全部手写、不用 sklearn，输出为 python3 实跑结果。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'ml.gradient_descent': {
  layers:{
    alg:`w ← w − lr·∇L(w)。它在解 ∇L=0 这个方程，用的是不动点迭代：把"梯度为零"改写成"w 不再动"。`,
    geo:`碗底找最低点：每帧站在当前点，只看脚下那块切平面，往最陡下坡挪 lr 那么远。等高线越扁，路线越 zigzag。`,
    comp:`一步 = 过一遍数据算 O(n·d) 次乘加得到 g，再做一次向量减法。成本 = 步数 × 每步数据量；步数由条件数 κ 决定。`
  },
  proof:{
    from:`L 可微；一阶泰勒 L(w+Δ) ≈ L(w) + ∇L·Δ 在小邻域内成立`,
    to:`w ← w − lr·∇L 单调降 L，且对二次函数收敛当且仅当 0 < lr < 2/λmax，速度由 κ=λmax/λmin 决定`,
    steps:[
      [`固定步长 ‖Δ‖=ε，问哪个方向让 L 降最多`,`泰勒展开把局部问题变成线性问题 min ∇L·Δ，线性问题才有闭式答案`],
      [`Cauchy-Schwarz：∇L·Δ ≥ −‖∇L‖·ε，取等号当且仅当 Δ ∥ −∇L`,`内积的下界由两向量反向时取到，这就是"最速下降 = 负梯度"的全部来历`],
      [`所以 Δ = −lr·∇L，lr 是信任半径不是速度`,`泰勒只在小邻域可信，lr 就是"我相信线性近似还能管多远"，超出就可能不降反升`],
      [`取 L=½wᵀAw（A 对称正定）为模型，∇L=Aw，更新为 w ← (I − lr·A)w`,`任何光滑函数在极小点附近都近似二次，二次情形的结论就是通用结论的局部版本`],
      [`在 A 的特征向量基下，每个分量独立按 (1−lr·λᵢ) 缩放`,`对称矩阵可正交对角化，迭代在特征基下解耦成 d 个标量问题`],
      [`收敛 ⟺ 对所有 i，|1−lr·λᵢ|<1 ⟺ 0 < lr < 2/λmax`,`几何级数 rᵗ→0 当且仅当 |r|<1；最陡的方向 λmax 定了步长上限`],
      [`最慢分量的因子是 1−lr·λmin ≈ 1−λmin/λmax = 1−1/κ`,`lr 被 λmax 卡住，λmin 方向只能一小步一小步挪，κ 越大越慢，这就是必须标准化特征的原因`]
    ],
    end:`梯度下降 = 反复做"局部线性近似 + 走信任半径"。稳定上界 lr<2/λmax，收敛速度 ∝ 1−1/κ。lr 太大发散、太小不动，都是这一个不等式。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\n# L(w) = 1/2 w^T A w, A 的特征值 = 1 和 25 → 条件数 25\nA = np.diag([1.0, 25.0]); lam_max = 25.0\ndef run(lr, steps=200):\n    w = np.array([1.0, 1.0])\n    for _ in range(steps):\n        g = A @ w              # 梯度 = A w\n        w = w - lr * g         # 一步：信任半径 lr 内走最速下降\n    return np.linalg.norm(w)\nfor lr in [0.01, 0.04, 0.079, 0.081]:\n    print(f'lr={lr:<6} 稳定界 2/λmax={2/lam_max:.3f}  200 步后 |w|={run(lr):.3e}')\n# 每维收敛因子 |1-lr*λ|：慢的那一维由 λmin 决定\nlr = 0.04\nprint('收敛因子 |1-lr*λ| :', np.abs(1 - lr*np.diag(A)))",
    out:"lr=0.01   稳定界 2/λmax=0.080  200 步后 |w|=1.340e-01\nlr=0.04   稳定界 2/λmax=0.080  200 步后 |w|=2.846e-04\nlr=0.079  稳定界 2/λmax=0.080  200 步后 |w|=6.323e-03\nlr=0.081  稳定界 2/λmax=0.080  200 步后 |w|=1.396e+02\n收敛因子 |1-lr*λ| : [0.96 0.  ]",
    note:`lr=0.079 在 2/λmax=0.08 之内收敛，0.081 越界爆炸，对应第 6 步；收敛因子 [0.96, 0] 说明 λ=25 的方向一步到底、λ=1 的方向每步只缩 4%，对应第 7 步。`
  },
  contrast:[
    {vs:`牛顿法 / 二阶方法`, same:`都是迭代降 L`, diff:`牛顿用 Hessian 逆把椭圆等高线拉成圆，一步直指谷底；GD 只用一阶信息`, when:`d 小且 Hessian 算得起用牛顿/L-BFGS；深度网络 d 上亿只能一阶`},
    {vs:`随机梯度下降 SGD`, same:`同一个更新公式`, diff:`SGD 用 mini-batch 估计梯度，方向带噪声但每步便宜 n/B 倍`, when:`数据大到一遍算不完就必须 SGD；做数学验证用全量`},
    {vs:`坐标下降`, same:`都是逐步降目标`, diff:`坐标下降一次只动一个维度但动到该维最优；GD 全维度同时动一小步`, when:`lasso、K-means 这类每维有闭式解的用坐标下降`}
  ],
  ext:[
    {t:`带动量 / Adam：把历史梯度做指数平均，抵消 zigzag，相当于自适应地拉平条件数`, go:'op.stochastic'},
    {t:`凸函数上局部最优即全局最优，GD 有收敛率保证；非凸只保证到驻点`, go:'op.convex'},
    {t:`反向传播就是把 ∇L 用链式法则在计算图上算出来，GD 本身不变`, go:'dl.backprop'}
  ]
},

'ml.linear_reg': {
  layers:{
    alg:`最小化 RSS(w)=‖y−Xw‖²。令导数为零得正规方程 XᵀXw=Xᵀy，w=(XᵀX)⁻¹Xᵀy。`,
    geo:`y 是 ℝⁿ 中一个点，X 的列张成一个子空间。ŷ=Xw 是 y 在该子空间上的正交投影，残差 y−ŷ 垂直于每一列特征。`,
    comp:`lstsq 不真的求逆：对 X 做 QR 或 SVD，解三角方程。O(n·d²)，n 十万 d 一千也秒出，比迭代靠谱。`
  },
  proof:{
    from:`模型 ŷ=Xw；损失 RSS(w)=(y−Xw)ᵀ(y−Xw)；X 列满秩`,
    to:`RSS 的唯一极小点 w*=(XᵀX)⁻¹Xᵀy，且它等价于把 y 正交投影到 X 的列空间`,
    steps:[
      [`展开 RSS = yᵀy − 2wᵀXᵀy + wᵀXᵀXw`,`矩阵转置乘法展开；yᵀXw 是标量，等于自己的转置 wᵀXᵀy，所以交叉项合并成 2 倍`],
      [`对 w 求梯度：∇RSS = −2Xᵀy + 2XᵀXw`,`∇(aᵀw)=a，∇(wᵀBw)=2Bw 对称 B 成立，XᵀX 恰是对称的`],
      [`令梯度为零：XᵀXw = Xᵀy（正规方程）`,`可微凸函数的极小点必在梯度为零处；这里只有一个驻点`],
      [`X 列满秩 ⟹ XᵀX 正定可逆，w*=(XᵀX)⁻¹Xᵀy 唯一`,`vᵀXᵀXv=‖Xv‖²>0 对所有 v≠0，正定矩阵可逆`],
      [`Hessian = 2XᵀX 正定 ⟹ 该驻点是全局最小`,`二阶条件；正定 Hessian 说明 RSS 是严格凸的碗`],
      [`把正规方程改写成 Xᵀ(y−Xw*)=0：残差与 X 每一列正交`,`这是同一条方程的另一种读法，几何意义是"最近点的连线垂直于子空间"`],
      [`概率读法：若 y=Xw+ε，ε~N(0,σ²I)，则 −log 似然 = RSS/2σ² + 常数`,`高斯密度的指数是 −(y−Xw)²/2σ²，最大似然 = 最小平方；"平方"来自高斯噪声，不是随便选的`]
    ],
    end:`正规方程 = "残差 ⟂ 特征"逐字翻译。它同时是最小二乘解、正交投影、高斯噪声下的极大似然，三件事一个公式。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nn, d = 50, 3\nX = np.c_[np.ones(n), np.random.randn(n, d)]          # 第一列 1 = 截距\nw_true = np.array([2.0, 1.5, -3.0, 0.5])\ny = X @ w_true + 0.3*np.random.randn(n)\n# 正规方程：令 dRSS/dw = -2 X^T (y - Xw) = 0 → X^T X w = X^T y\nw_ne = np.linalg.solve(X.T @ X, X.T @ y)\nw_ls = np.linalg.lstsq(X, y, rcond=None)[0]\nprint('正规方程 w =', np.round(w_ne, 4))\nprint('lstsq    w =', np.round(w_ls, 4))\nprint('两者最大差 =', np.abs(w_ne - w_ls).max())\nr = y - X @ w_ne\nprint('残差 ⟂ 每一列特征: X^T r =', np.round(X.T @ r, 10))\n# 梯度下降也会到同一点\nw = np.zeros(4)\nfor _ in range(2000): w -= 0.01 * (-2/n) * X.T @ (y - X @ w)\nprint('GD 2000 步 w =', np.round(w, 4))",
    out:"正规方程 w = [ 1.9827  1.4704 -3.029   0.4659]\nlstsq    w = [ 1.9827  1.4704 -3.029   0.4659]\n两者最大差 = 1.5543122344752192e-15\n残差 ⟂ 每一列特征: X^T r = [-0. -0.  0. -0.]\nGD 2000 步 w = [ 1.9827  1.4704 -3.029   0.4659]",
    note:`np.linalg.solve(X.T@X, X.T@y) 就是第 3-4 步的正规方程；X.T@r ≈ 0 是第 6 步"残差 ⟂ 特征"的数值验证；GD 那三行说明凸碗只有一个底。`
  },
  contrast:[
    {vs:`岭回归（L2 正则）`, same:`同一个线性模型、同一个平方损失`, diff:`正规方程变成 (XᵀX+λI)w=Xᵀy，永远可逆，系数被整体压小但不归零`, when:`p 接近 n 或特征共线时 OLS 系数爆炸，用岭`},
    {vs:`Lasso（L1 正则）`, same:`同一个模型加惩罚`, diff:`惩罚 ‖w‖₁ 的约束区是菱形，尖角正对坐标轴，解落在角上产生精确的 0`, when:`要特征选择用 lasso；只要稳定预测用岭`},
    {vs:`PCA 拟合的那条线`, same:`都是给点云画一条直线`, diff:`最小二乘最小化竖直距离（y 方向），PCA 最小化垂直距离`, when:`有明确因变量 y 用回归；两个变量地位对等用 PCA`},
    {vs:`逻辑回归`, same:`都是线性打分 w·x`, diff:`逻辑回归把打分过 sigmoid，损失从平方换成交叉熵`, when:`y 连续用线性回归；y 是 0/1 用逻辑回归`}
  ],
  ext:[
    {t:`最小二乘的线性代数本体：投影矩阵 P=X(XᵀX)⁻¹Xᵀ，P²=P`, go:'la.least_squares'},
    {t:`极大似然的一般框架：换噪声分布就换损失（拉普拉斯噪声 → 绝对值损失）`, go:'pr.mle'},
    {t:`加高斯先验得岭、加拉普拉斯先验得 lasso，正则 = 先验`, go:'pr.map_prior'}
  ]
},

'ml.logistic': {
  layers:{
    alg:`p=σ(w·x)，σ(z)=1/(1+e⁻ᶻ)。损失 = 负对数似然 = 交叉熵。梯度是 (σ(w·x)−y)·x，形式和线性回归一模一样。`,
    geo:`还是一条直线 w·x=0 分平面；垂直于它立一张 S 形斜坡，离线越远概率越接近 0 或 1。梯度把线往错分点的方向推。`,
    comp:`没有闭式解，梯度下降或牛顿（IRLS）迭代。每步 O(n·d)。凸，所以从零初始化跑到收敛就是全局最优。`
  },
  proof:{
    from:`伯努利模型 P(y=1|x)=σ(z)，z=w·x；σ′(z)=σ(z)(1−σ(z))`,
    to:`∂L/∂w = (σ(w·x)−y)·x，且 L 是凸的`,
    steps:[
      [`一个样本的似然 P(y|x)=pʸ(1−p)¹⁻ʸ，取负对数得 L=−[y ln p+(1−y) ln(1−p)]`,`伯努利密度的紧凑写法；取对数把乘积变加法，负号把最大化变最小化`],
      [`对 p 求导：∂L/∂p = −y/p + (1−y)/(1−p) = (p−y)/[p(1−p)]`,`ln 的导数；通分后分子恰是 p−y`],
      [`σ 的导数 ∂p/∂z = p(1−p)`,`σ=(1+e⁻ᶻ)⁻¹，求导得 e⁻ᶻ/(1+e⁻ᶻ)² = σ·(1−σ)，是 sigmoid 独有的性质`],
      [`链式法则相乘，p(1−p) 上下抵消：∂L/∂z = p−y`,`这就是简洁形式的来历：交叉熵的分母 p(1−p) 与 sigmoid 导数的分子 p(1−p) 正好互为倒数`],
      [`再乘 ∂z/∂w=x：∂L/∂w = (σ(w·x)−y)·x`,`z 对 w 是线性的；"预测减真值乘输入"是指数族 + 正则链接函数的通用结果`],
      [`Hessian = Σ p(1−p)·x xᵀ 半正定 ⟹ L 凸`,`p(1−p)>0，x xᵀ 半正定，非负加权和仍半正定；凸函数梯度下降必到全局最优`],
      [`平方损失 + sigmoid 会怎样：∂/∂z = (p−y)·p(1−p)，p→0 或 1 时梯度消失`,`对比说明为什么二分类必须用交叉熵：它是唯一能把 sigmoid 的饱和抵消掉的损失`]
    ],
    end:`(σ(wx)−y)x 不是巧合，是交叉熵与 sigmoid 互为"配对"的结果。同一形式在线性回归、softmax、任何指数族都出现。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nsig = lambda z: 1/(1+np.exp(-z))\nn = 200\nX = np.c_[np.ones(n), np.random.randn(n, 2)]\nw_true = np.array([-0.5, 2.0, -1.5])\ny = (np.random.rand(n) < sig(X @ w_true)).astype(float)\ndef loss(w):\n    p = sig(X @ w); return -np.mean(y*np.log(p) + (1-y)*np.log(1-p))\n# 解析梯度：dL/dw = mean( (σ(wx) - y) x )\ngrad = lambda w: X.T @ (sig(X @ w) - y) / n\n# 数值梯度核对\nw0 = np.random.randn(3); eps = 1e-6\nnum = np.array([(loss(w0+eps*e)-loss(w0-eps*e))/(2*eps) for e in np.eye(3)])\nprint('解析梯度', np.round(grad(w0), 6))\nprint('数值梯度', np.round(num, 6))\nw = np.zeros(3); hist = []\nfor t in range(3000):\n    w -= 0.5 * grad(w)\n    if t % 600 == 0: hist.append(round(float(loss(w)), 4))\nprint('loss 每 600 步:', hist, '→ 单调下降（凸）')\nprint('学到的 w =', np.round(w, 3), ' 真值', w_true)\nprint('梯度范数 =', f'{np.linalg.norm(grad(w)):.2e}')",
    out:"解析梯度 [ 0.235549 -0.588763  0.293097]\n数值梯度 [ 0.235549 -0.588763  0.293097]\nloss 每 600 步: [0.6384, 0.3862, 0.3862, 0.3862, 0.3862] → 单调下降（凸）\n学到的 w = [-0.528  2.236 -1.482]  真值 [-0.5  2.  -1.5]\n梯度范数 = 4.90e-16",
    note:`grad 那一行就是第 5 步的 (σ(Xw)−y)ᵀX/n；数值梯度逐位吻合是对推导的验证；loss 单调降到平且梯度 1e-16 是第 6 步"凸 → 全局最优"。`
  },
  contrast:[
    {vs:`线性回归`, same:`同一个线性打分 w·x，梯度同形`, diff:`输出经过 sigmoid 变成概率，损失从平方换成交叉熵，没有闭式解`, when:`y 是 0/1 或概率用逻辑回归；y 连续用线性`},
    {vs:`朴素贝叶斯（生成式）`, same:`判别函数都是 x 的线性函数`, diff:`逻辑回归直接拟合 P(y|x)（判别式）；NB 先拟合 P(x|y) 再用贝叶斯翻过来（生成式）`, when:`样本少、特征独立假设不离谱用 NB；样本多用逻辑回归上限更高`},
    {vs:`线性 SVM`, same:`都是找一条线分两类`, diff:`SVM 用 hinge 损失，只关心边界点，不输出概率；逻辑回归每个点都出力，输出校准过的概率`, when:`要概率用逻辑回归；要最大间隔、点少维高用 SVM`},
    {vs:`Softmax 回归`, same:`同一个推导`, diff:`K 类版本：p=softmax(Wx)，梯度 (p−onehot(y))xᵀ`, when:`两类用 sigmoid，多类用 softmax`}
  ],
  ext:[
    {t:`交叉熵的信息论本体：最小化交叉熵 = 最小化 KL(真实 ‖ 模型)`, go:'it.cross_entropy'},
    {t:`最后一层 sigmoid/softmax + 交叉熵是深度网络分类头的标配，梯度同一个形`, go:'dl.loss'},
    {t:`作为极大似然的一个实例：换链接函数就是广义线性模型 GLM`, go:'pr.mle'}
  ]
},

'ml.svm': {
  layers:{
    alg:`min ½‖w‖² s.t. yᵢ(w·xᵢ+b) ≥ 1。对偶：max Σαᵢ − ½ΣΣαᵢαⱼyᵢyⱼ xᵢ·xⱼ，αᵢ≥0，Σαᵢyᵢ=0。w=Σαᵢyᵢxᵢ。`,
    geo:`两类点之间塞一条最宽的走廊，走廊两壁是 w·x+b=±1，宽度 2/‖w‖。只有贴壁的点撑着走廊，其余点删掉不影响。`,
    comp:`凸二次规划，SMO 每次只优化两个 α。核方法把 xᵢ·xⱼ 换成 K(xᵢ,xⱼ)，从不显式算高维特征，代价是 O(n²) 的核矩阵。`
  },
  proof:{
    from:`点 x 到超平面 w·x+b=0 的距离 = |w·x+b|/‖w‖；两类可分`,
    to:`最大间隔 = 2/‖w‖，等价于 min ½‖w‖²；对偶解 w=Σαᵢyᵢxᵢ，只有间隔上的点 αᵢ>0`,
    steps:[
      [`把"分对"写成 yᵢ(w·xᵢ+b) > 0`,`y=±1 时，分对意味着打分与标签同号，乘积为正`],
      [`(w,b) 同比例缩放不改变超平面，可归一化使离线最近的点满足 yᵢ(w·xᵢ+b)=1`,`超平面由 w·x+b=0 定义，乘正常数不变；这一步消掉了尺度自由度`],
      [`最近点到面的距离 = 1/‖w‖，两侧各一个，间隔 = 2/‖w‖`,`距离公式 |w·x+b|/‖w‖ 代入 |w·x+b|=1`],
      [`max 2/‖w‖ ⟺ min ½‖w‖² s.t. yᵢ(w·xᵢ+b) ≥ 1`,`单调变换不改变最优点；平方后目标光滑、约束线性，成为凸 QP，解唯一`],
      [`拉格朗日 L=½‖w‖² − Σαᵢ[yᵢ(w·xᵢ+b)−1]，αᵢ≥0`,`不等式约束用非负乘子；凸问题 + 可行内点 ⟹ 强对偶成立`],
      [`∂L/∂w=0 ⟹ w=Σαᵢyᵢxᵢ；∂L/∂b=0 ⟹ Σαᵢyᵢ=0`,`鞍点条件；w 被表示成训练点的线性组合，这就是对偶直觉：解活在数据张成的空间里`],
      [`代回得对偶：max Σαᵢ − ½ΣΣαᵢαⱼyᵢyⱼ(xᵢ·xⱼ)`,`把 w 消掉后目标只含内积 xᵢ·xⱼ，所以可以换成任何核 K(xᵢ,xⱼ)`],
      [`KKT 互补松弛：αᵢ[yᵢ(w·xᵢ+b)−1]=0 ⟹ 约束不取等号的点 αᵢ=0`,`只有 yᵢ(w·xᵢ+b)=1 的点（支持向量）对 w 有贡献；删掉其它点解不变`]
    ],
    end:`SVM = 在"最近点距离为 1"的归一化下最小化 ‖w‖。对偶把解写成支持向量的组合，把内积换成核就得到非线性版本。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(1)\n# 两类线性可分点\nX = np.r_[np.random.randn(30,2) + [2.5, 2.5], np.random.randn(30,2) - [2.5, 2.5]]\ny = np.r_[np.ones(30), -np.ones(30)]\nn = len(y); C = 100.0\nw = np.zeros(2); b = 0.0\n# 软间隔原问题: min 1/2|w|^2 + C Σ max(0, 1 - y(wx+b))，次梯度下降\nfor t in range(1, 20001):\n    lr = 1/(t+100)\n    m = y*(X@w + b)                     # 函数间隔\n    viol = m < 1                        # 只有越线/贴线的点有梯度\n    gw = w - C*(y[viol,None]*X[viol]).sum(0)/n\n    gb = -C*y[viol].sum()/n\n    w -= lr*gw; b -= lr*gb\nm = y*(X@w + b)\nprint('w =', np.round(w,3), ' b =', round(b,3))\nprint('几何间隔 2/|w| =', round(2/np.linalg.norm(w), 3))\nsv = np.where(m < 1.02)[0]\nprint('支持向量个数 =', len(sv), ' 它们的 y(wx+b) =', np.round(m[sv],3))\nprint('最小函数间隔 =', round(m.min(),3), '（≈1：约束取等号）')\n# 对偶直觉：w = Σ α_i y_i x_i，只由支持向量张成\nprint('w 是否落在支持向量张成的空间: rank', np.linalg.matrix_rank(np.c_[X[sv].T, w]), '== rank', np.linalg.matrix_rank(X[sv].T))",
    out:"w = [0.372 0.316]  b = -0.182\n几何间隔 2/|w| = 4.101\n支持向量个数 = 4  它们的 y(wx+b) = [1.001 1.014 1.001 1.   ]\n最小函数间隔 = 1.0 （≈1：约束取等号）\nw 是否落在支持向量张成的空间: rank 2 == rank 2",
    note:`viol 那一行是 hinge 损失的次梯度：只有 y(wx+b)<1 的点推 w，对应第 8 步"非支持向量不出力"；跑完最小函数间隔 ≈1 是第 2 步的归一化；2/|w| 是第 3 步。`
  },
  contrast:[
    {vs:`逻辑回归`, same:`线性 SVM 和逻辑回归都是一条直线 + 一个凸损失`, diff:`hinge 损失在 margin 外为 0，远离边界的点完全不出力；交叉熵每个点都拉一点`, when:`要概率、样本多用逻辑回归；点少维高、要最大间隔用 SVM`},
    {vs:`感知机`, same:`都找一个分离超平面`, diff:`感知机找到任意一条就停，SVM 找最宽的那条，解唯一`, when:`感知机只是历史/教学；实际用 SVM`},
    {vs:`KNN`, same:`都是"用训练点直接定义决策"`, diff:`SVM 只保留支持向量、有显式边界；KNN 保留全部点、边界隐式且局部`, when:`边界大致光滑用 SVM；边界极不规则、数据密用 KNN`},
    {vs:`核岭回归 / 高斯过程`, same:`同样用核矩阵，同样对偶表示`, diff:`SVM 稀疏（只有支持向量 α≠0），核岭稠密（所有点都有权重）`, when:`要稀疏、要分类用 SVM；要不确定性用高斯过程`}
  ],
  ext:[
    {t:`KKT 条件是所有带不等式约束凸优化的通用判据，SVM 是最干净的例子`, go:'op.kkt'},
    {t:`拉格朗日对偶：把约束搬进目标，原问题的下界在对偶里变成最大化`, go:'op.constraint_lagrange'},
    {t:`软间隔 C 就是正则强度的倒数；C→∞ 退回硬间隔`, go:'op.regularization'}
  ]
},

'ml.tree': {
  layers:{
    alg:`不纯度 Gini=1−Σpₖ²、熵 H=−Σpₖlog₂pₖ。分裂增益 = 父不纯度 − 子节点按样本数加权的不纯度。贪心选增益最大的 (特征, 阈值)。`,
    geo:`特征空间被一刀刀切成与坐标轴平行的矩形，每个矩形贴一个标签。决策边界是阶梯状的，永远不会斜。`,
    comp:`每个节点：对每个特征排序 O(n log n)，扫一遍阈值累计左右类别计数 O(n)，总 O(d·n log n)。递归到深度/纯度/最小样本数为止。`
  },
  proof:{
    from:`节点内类别比例 p=(p₁..pₖ)；需要一个"混杂程度"的度量 I(p)，要求纯时为 0、均匀时最大、对称、凹`,
    to:`Gini 与熵都满足要求；分裂增益 = I(父) − Σ(nⱼ/n)·I(子ⱼ) ≥ 0，贪心最大化它就是决策树`,
    steps:[
      [`Gini 的定义：从节点随机抽两个样本，标签不同的概率 = 1 − Σpₖ²`,`两次独立抽样同为 k 类的概率是 pₖ²，对 k 求和是"相同"的概率，取补`],
      [`熵的定义：编码一个样本标签平均需要的比特数 −Σpₖlog₂pₖ`,`信息论：概率 p 的事件最优码长 −log₂p，取期望`],
      [`两者都在纯节点取 0、均匀时最大`,`Gini：p=(1,0..) 时 1−1=0；均匀时 1−1/K。熵：p=1 时 −log 1=0；均匀时 log₂K。两者都是 p 的凹函数`],
      [`定义分裂增益 G = I(父) − [n_L·I(左)+n_R·I(右)]/n`,`子节点的不纯度按样本数加权，才和父节点在同一尺度上可比；用熵时这个 G 就是互信息 I(y; 分裂)`],
      [`G ≥ 0 恒成立`,`I 是凹函数，Jensen 不等式：加权平均的 I ≥ I 的加权平均。父分布是子分布的加权平均`],
      [`对每个 (特征 j, 阈值 t) 算 G，取最大者切一刀，递归`,`全局最优树是 NP 难的，贪心逐层选最大增益是可行的近似；每刀只需比较有限个阈值（相邻取值的中点）`],
      [`Gini 是熵在 p=1 附近的二阶近似：−ln p ≈ 1−p ⟹ −Σpₖ ln pₖ ≈ Σpₖ(1−pₖ) = Gini`,`泰勒展开；所以两者选出的分裂几乎总是同一刀，Gini 省一个 log`]
    ],
    end:`决策树 = 用凹的不纯度函数量化"混"，用 Jensen 保证每刀只会更纯，贪心逐刀切。深度不限必背题，因为每刀都在降训练不纯度。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\ndef gini(y):  p = np.bincount(y, minlength=2)/len(y); return 1 - (p**2).sum()\ndef entropy(y):\n    p = np.bincount(y, minlength=2)/len(y); p = p[p>0]; return -(p*np.log2(p)).sum()\ndef best_split(X, y, imp):\n    best = (0, None, None)                      # (增益, 特征, 阈值)\n    for j in range(X.shape[1]):\n        for t in np.unique(X[:, j])[:-1]:\n            L, R = y[X[:, j] <= t], y[X[:, j] > t]\n            gain = imp(y) - (len(L)*imp(L) + len(R)*imp(R))/len(y)   # 父 − 子加权\n            if gain > best[0]: best = (gain, j, t)\n    return best\ndef build(X, y, depth, imp):\n    if depth == 0 or len(np.unique(y)) == 1: return int(np.bincount(y).argmax())\n    g, j, t = best_split(X, y, imp)\n    if j is None: return int(np.bincount(y).argmax())\n    m = X[:, j] <= t\n    return (j, round(float(t),3), build(X[m], y[m], depth-1, imp), build(X[~m], y[~m], depth-1, imp))\ndef pred(tree, x):\n    while isinstance(tree, tuple): j, t, l, r = tree; tree = l if x[j] <= t else r\n    return tree\nX = np.random.rand(300, 2); y = ((X[:,0] > 0.4) & (X[:,1] > 0.6)).astype(int)   # 真规则：两刀\nprint('根节点 Gini =', round(gini(y),3), ' 熵(bit) =', round(entropy(y),3))\ng, j, t = best_split(X, y, gini);    print(f'Gini 第一刀: 特征{j} <= {t:.3f}  增益={g:.4f}')\ng, j, t = best_split(X, y, entropy); print(f'熵   第一刀: 特征{j} <= {t:.3f}  增益={g:.4f}')\nfor dep in [1, 2]:\n    tr = build(X, y, dep, gini); acc = np.mean([pred(tr, x)==t for x, t in zip(X, y)])\n    print(f'depth={dep} 训练准确率={acc:.3f}')\nprint('depth2 树 (特征, 阈值, 左, 右):', build(X, y, 2, gini))",
    out:"根节点 Gini = 0.354  熵(bit) = 0.778\nGini 第一刀: 特征1 <= 0.604  增益=0.1655\n熵   第一刀: 特征1 <= 0.604  增益=0.3971\ndepth=1 训练准确率=0.837\ndepth=2 训练准确率=1.000\ndepth2 树 (特征, 阈值, 左, 右): (1, 0.604, 0, (0, 0.393, 0, 1))",
    note:`gain 那一行就是第 4 步的加权增益；Gini 与熵选出同一刀（特征 1 ≤ 0.604）印证第 7 步；depth=2 恰好复原两刀规则、准确率 1.0。`
  },
  contrast:[
    {vs:`逻辑回归 / 线性模型`, same:`都做分类`, diff:`树的边界是轴对齐的阶梯，不需要标准化、天然处理交互；线性模型边界是一条斜线`, when:`特征有阈值效应、混合类型、有交互用树；特征线性可分、要可解释系数用线性`},
    {vs:`随机森林`, same:`森林由许多树组成`, diff:`单树方差极大（数据抖一下树就变形）；森林平均后方差降、可解释性丢`, when:`单树只用于讲解和规则提取；实际预测几乎总是用森林或提升`},
    {vs:`KNN`, same:`都是非参数、局部决策`, diff:`树在训练时切好格子、预测 O(深度)；KNN 训练什么都不做、预测 O(n·d)`, when:`要快预测和可解释规则用树；边界极不规则用 KNN`},
    {vs:`信息增益率 / C4.5`, same:`都用熵`, diff:`增益率除以分裂本身的熵，惩罚多取值特征（如 ID 列）`, when:`类别特征取值数差异大时看增益率`}
  ],
  ext:[
    {t:`熵与互信息：增益就是标签与分裂变量的互信息`, go:'it.mutual_info'},
    {t:`熵的概率论本体`, go:'pr.entropy'},
    {t:`许多树 + 随机性 = 随机森林；许多浅树 + 残差 = 梯度提升`, go:'ml.forest'}
  ]
},

'ml.forest': {
  layers:{
    alg:`B 棵树各自 bootstrap 一份数据、每次分裂只看 m≈√d 个特征，预测取平均/众数。Var(平均) = ρσ² + (1−ρ)σ²/B。`,
    geo:`每棵树是一张歪歪扭扭的阶梯边界，几百张叠在一起取平均，锯齿被抹平，边界变得接近光滑。`,
    comp:`B 棵树完全独立，天然并行。OOB 样本（约 36.8% 未被抽中）免费当验证集。预测 O(B·深度)。`
  },
  proof:{
    from:`B 个同分布估计量 T₁..T_B，各自方差 σ²，两两相关系数 ρ`,
    to:`平均 T̄ 的方差 = ρσ² + (1−ρ)σ²/B；B→∞ 时下限 ρσ²，所以降方差的关键是降 ρ`,
    steps:[
      [`Var(T̄) = (1/B²)·Var(ΣTᵢ) = (1/B²)[Σ Var(Tᵢ) + Σᵢ≠ⱼ Cov(Tᵢ,Tⱼ)]`,`和的方差 = 各自方差 + 所有两两协方差；常数 1/B 提出来平方`],
      [`Var(Tᵢ)=σ²，Cov(Tᵢ,Tⱼ)=ρσ²，对角 B 项、非对角 B(B−1) 项`,`同分布 + 等相关的假设把双重求和化成两个数`],
      [`Var(T̄) = [Bσ² + B(B−1)ρσ²]/B² = σ²/B + (1−1/B)ρσ² = ρσ² + (1−ρ)σ²/B`,`代数整理；这就是随机森林的核心公式`],
      [`ρ=0 时 σ²/B，ρ=1 时 σ²：完全相关的树平均了等于没平均`,`两个极端说明"多"本身没用，"不同"才有用`],
      [`bootstrap 让每棵树看的数据不同，降 ρ；但树仍会抢同一个最强特征，ρ 仍偏高`,`同一批强特征会让所有树的顶层分裂几乎相同，树之间高度相关`],
      [`每次分裂只随机看 m 个特征，强特征常被屏蔽，树被迫走不同路径，ρ 进一步降`,`这是随机森林相对 bagging 的唯一改动，代价是单树 σ² 略升，但 ρ 降得更多，净效果是 Var(T̄) 降`],
      [`偏差不变：E[T̄]=E[Tᵢ]，平均不改变期望`,`期望是线性的；所以森林只降方差不降偏差，单树必须是低偏差的深树`],
      [`P(某样本不被抽中) = (1−1/n)ⁿ → 1/e ≈ 0.368`,`n 次独立抽样每次漏掉它的概率 1−1/n；极限就是 e 的定义`]
    ],
    end:`Var(平均)=ρσ²+(1−ρ)σ²/B。B 只能消掉 (1−ρ) 那一项，ρσ² 是硬下限，所以旋钮是 max_features 而不是树数。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nsigma2, B, T = 4.0, 100, 20000\nfor rho in [0.0, 0.3, 0.7, 1.0]:\n    # 造 B 个两两相关系数为 rho、方差 sigma2 的估计量：共享分量 + 独立分量\n    shared = np.random.randn(T, 1) * np.sqrt(rho*sigma2)\n    indep  = np.random.randn(T, B) * np.sqrt((1-rho)*sigma2)\n    est = shared + indep                       # 每一列是一棵\"树\"\n    avg = est.mean(1)                          # bagging：取平均\n    print(f'rho={rho}  平均后方差 实测={avg.var():.3f}  公式 ρσ²+(1-ρ)σ²/B={rho*sigma2+(1-rho)*sigma2/B:.3f}')\n# bootstrap 的 OOB 比例\nn = 1000; idx = np.random.randint(0, n, size=(200, n))\noob = np.mean([len(set(range(n)) - set(r))/n for r in idx])\nprint(f'bootstrap 未抽中比例 = {oob:.3f}  vs 1/e = {1/np.e:.3f}')",
    out:"rho=0.0  平均后方差 实测=0.039  公式 ρσ²+(1-ρ)σ²/B=0.040\nrho=0.3  平均后方差 实测=1.234  公式 ρσ²+(1-ρ)σ²/B=1.228\nrho=0.7  平均后方差 实测=2.802  公式 ρσ²+(1-ρ)σ²/B=2.812\nrho=1.0  平均后方差 实测=4.059  公式 ρσ²+(1-ρ)σ²/B=4.000\nbootstrap 未抽中比例 = 0.367  vs 1/e = 0.368",
    note:`shared+indep 构造出相关系数恰为 ρ 的 B 个估计量，est.mean(1) 就是 bagging；四行实测对公式的吻合是第 3 步；最后一行是第 8 步的 1/e。`
  },
  contrast:[
    {vs:`Bagging`, same:`都是 bootstrap + 平均`, diff:`森林多了"每次分裂随机选 m 个特征"，专门压 ρ`, when:`几乎总用森林；bagging 只在讲原理时出现`},
    {vs:`梯度提升 / XGBoost`, same:`都是很多树`, diff:`森林并行、深树、降方差；提升串行、浅树、降偏差，且会过拟合`, when:`要省心、抗噪、少调参用森林；追求极限精度、表格竞赛用提升`},
    {vs:`单棵决策树`, same:`森林的基本单元`, diff:`单树高方差、可解释；森林低方差、只剩特征重要性`, when:`要给人看规则用单树，要预测用森林`},
    {vs:`模型集成（stacking）`, same:`都是多个模型合并`, diff:`森林同质模型简单平均；stacking 异质模型用另一个模型学权重`, when:`已有多个不同类型的强模型时 stacking`}
  ],
  ext:[
    {t:`bootstrap 本身是一种通用的重采样估计方差的方法`, go:'si.bootstrap'},
    {t:`方差公式的概率论根：和的方差含协方差项`, go:'pr.covariance'},
    {t:`提升树是另一种"多树"，但机制是函数空间的梯度下降`, go:'ml.xgboost'}
  ]
},

'ml.xgboost': {
  layers:{
    alg:`F_m = F_{m−1} + η·h_m，h_m 拟合伪残差 rᵢ = −∂L(yᵢ,F(xᵢ))/∂F(xᵢ)。平方损失时 r = y−F 就是普通残差。`,
    geo:`把"预测函数 F"当成一个点，在函数空间里做梯度下降：每棵新树是一步负梯度方向，η 是步长，树的深度限制了每步能画多细。`,
    comp:`串行，第 m 棵树依赖前 m−1 棵的输出。每棵树 O(d·n log n)。XGBoost 额外用二阶导（牛顿步）+ 直方图分桶 + 正则化叶子权重。`
  },
  proof:{
    from:`损失 L(y,F(x)) 可微；当前模型 F_{m−1}；想找一个函数增量 h 使 Σ L(yᵢ, F_{m−1}(xᵢ)+h(xᵢ)) 最小`,
    to:`最优 h 的方向 = 负梯度 −∂L/∂F 在各样本点上的值；用树拟合它就是梯度提升`,
    steps:[
      [`把 F 看作一个 n 维向量 (F(x₁),…,F(xₙ))，损失是它的函数`,`训练集有限，函数只在 n 个点上被评估，所以"函数空间"在这里就是 ℝⁿ`],
      [`一阶泰勒：L(F+h) ≈ L(F) + Σ gᵢ·h(xᵢ)，gᵢ=∂L/∂F(xᵢ)`,`和参数空间的梯度下降完全一样，只是坐标是每个样本的预测值`],
      [`最速下降方向 h(xᵢ) = −gᵢ`,`同 Cauchy-Schwarz：固定步长下内积最负的方向是负梯度`],
      [`平方损失 L=½(y−F)²：−g = y−F = 残差`,`直接求导；这就是"新树学残差"的来历，残差只是负梯度的特例`],
      [`−gᵢ 只在训练点上有定义，用一棵回归树 h_m 去拟合它，得到处处有定义的函数`,`树是把 n 个点上的值推广到整个输入空间的方式；这就是"基学习器"的角色`],
      [`F_m = F_{m−1} + η·h_m，η∈(0,1] 是学习率`,`同梯度下降的信任半径；η 小 + 树多 = 步子小走得稳，η×树数 ≈ 总步长`],
      [`XGBoost 再加二阶项：L ≈ L + Σ[gᵢh + ½hᵢh²] + Ω(h)，叶子最优权重 = −Σg/(Σh+λ)`,`二阶泰勒给出牛顿步；每片叶子内是一个标量二次问题，闭式解；λ 正则叶子权重防过拟合`],
      [`每棵树只修正上一轮的错误，所以降的是偏差，树要浅（3-8 层）`,`深树一棵就能拟合噪声，串行叠加会把噪声放大；浅树每步只学一点点`]
    ],
    end:`Boosting = 在函数空间做梯度下降，树是"把负梯度推广成函数"的工具。平方损失下负梯度=残差；换损失只换 g。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nn = 300\nx = np.sort(np.random.rand(n)*6); y = np.sin(x) + 0.2*np.random.randn(n)\ndef stump_fit(x, r):                         # 一棵深度 1 的树：拟合目标 r\n    best = (np.inf, None, None, None)\n    for t in x[::5]:\n        L, R = r[x<=t], r[x>t]\n        if len(L)==0 or len(R)==0: continue\n        sse = ((L-L.mean())**2).sum() + ((R-R.mean())**2).sum()\n        if sse < best[0]: best = (sse, t, L.mean(), R.mean())\n    return best[1:]\neta = 0.1; F = np.full(n, y.mean()); trees = []\nfor m in range(1, 201):\n    r = y - F                                 # 平方损失: −∂L/∂F = y − F = 残差\n    t, cl, cr = stump_fit(x, r)\n    h = np.where(x<=t, cl, cr)\n    F = F + eta*h                              # F_m = F_{m-1} + η h_m\n    if m in (1, 10, 50, 100, 200): print(f'第 {m:>3} 棵树后 训练MSE = {np.mean((y-F)**2):.4f}')\nprint('噪声方差 0.2²=0.04 → MSE 逼近噪声底')",
    out:"第   1 棵树后 训练MSE = 0.4590\n第  10 棵树后 训练MSE = 0.1602\n第  50 棵树后 训练MSE = 0.0622\n第 100 棵树后 训练MSE = 0.0444\n第 200 棵树后 训练MSE = 0.0368\n噪声方差 0.2²=0.04 → MSE 逼近噪声底",
    note:`r = y − F 是第 4 步的负梯度；stump_fit 是第 5 步"用树拟合负梯度"；F + eta*h 是第 6 步。MSE 单调降到噪声底 0.04 附近说明再加树只会去拟合噪声。`
  },
  contrast:[
    {vs:`随机森林`, same:`都是很多树`, diff:`森林并行取平均降方差，树要深；提升串行学残差降偏差，树要浅`, when:`噪声大、少调参用森林；追求精度、肯调 η/树数/early stop 用提升`},
    {vs:`AdaBoost`, same:`都是串行加权组合弱学习器`, diff:`AdaBoost 重加权样本，等价于指数损失下的梯度提升；GBM 对任意可微损失通用`, when:`AdaBoost 是历史特例；实际用 GBM/XGBoost/LightGBM`},
    {vs:`参数空间的梯度下降`, same:`同一个泰勒展开、同一个负梯度、同一个步长`, diff:`GD 更新参数向量；boosting 更新函数本身，每步加一个新函数`, when:`有参数化模型用 GD；模型是"函数的加法组合"用 boosting`},
    {vs:`神经网络`, same:`都能拟合任意函数`, diff:`表格数据上 GBDT 几乎总赢；图像/文本/序列上网络赢`, when:`表格用 XGBoost/LightGBM，非结构化用网络`}
  ],
  ext:[
    {t:`一阶/二阶泰勒展开是整个推导的根`, go:'ca.taylor'},
    {t:`二阶项 = 牛顿法，XGBoost 的叶子权重是牛顿步`, go:'op.second_order'},
    {t:`early stopping 就是用验证集决定总步长 η×树数`, go:'op.early_stop'}
  ]
},

'ml.knn': {
  layers:{
    alg:`ŷ(x) = 多数票{yᵢ : i ∈ 最近的 k 个}。回归时取均值。没有参数，"模型"就是训练集本身。`,
    geo:`新点落地画一个圈，圈大到刚好套住 k 个邻居。k=1 是 Voronoi 图，边界锯齿极细；k 大圈大，边界被抹平。`,
    comp:`训练 O(1)。预测每个查询 O(n·d) 暴力距离，再 O(n log k) 选 top-k。n 大要 KD-tree（低维）或 HNSW/faiss（高维近似）。`
  },
  proof:{
    from:`局部性假设：x 附近的点标签分布 ≈ x 的标签分布；k 个邻居的投票是对 P(y|x) 的估计`,
    to:`k 小 → 方差大偏差小；k 大 → 方差小偏差大；k=1 训练误差恒为 0；最优 k 在中间且随 n 增大`,
    steps:[
      [`KNN 的估计 p̂(x) = (1/k)Σ_{i∈N_k(x)} yᵢ，是 k 个伯努利变量的均值`,`多数票 = p̂ > 0.5；把它写成均值才能算偏差和方差`],
      [`方差 ≈ p(1−p)/k`,`k 个近似独立的伯努利均值，方差按 1/k 缩；k 越小越抖，边界越锯齿`],
      [`偏差 = E[p̂(x)] − p(x)，邻居离 x 越远、p 在邻域内变化越大，偏差越大`,`k 大则圈大，圈里混进了 p 明显不同的远点；k=n 时退化成全局多数类，偏差最大`],
      [`k=1 时训练误差 = 0`,`训练点自己就是自己的最近邻，距离 0；所以训练误差对 KNN 毫无信息，必须留出/交叉验证`],
      [`测试误差 = 偏差² + 方差 + 噪声，先降后升，最优 k 在中间`,`两项随 k 反向变化，和有内部最小值；标签噪声越大最优 k 越大`],
      [`k=1 的渐近误差 ≤ 2× 贝叶斯误差（Cover-Hart）`,`n→∞ 时最近邻趋于 x 本身，两次独立抽标签不一致的概率 ≈ 2p(1−p)`],
      [`维度诅咒：d 维单位立方体内套住 k/n 比例的点需要边长 (k/n)^(1/d)，d=100 时几乎是整个空间`,`体积随 d 指数缩，"最近"的邻居也很远，局部性假设失效，距离之间趋同`]
    ],
    end:`KNN 用邻居投票估计 P(y|x)，k 就是偏差方差的旋钮。训练误差恒 0 不可信；高维必须先降维或用学过的嵌入。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\ndef make(n):\n    X = np.random.randn(n, 2); y = (X[:,0]**2 + X[:,1] > 0.5).astype(int)\n    flip = np.random.rand(n) < 0.15; return X, y ^ flip          # 15% 标签噪声\nXtr, ytr = make(300); Xte, yte = make(2000)\ndef knn(Xtr, ytr, Xq, k):\n    d = ((Xq[:,None,:] - Xtr[None,:,:])**2).sum(-1)           # 全部两两距离 O(n·m·d)\n    nb = np.argsort(d, axis=1)[:, :k]                          # 最近 k 个\n    return (ytr[nb].mean(1) > 0.5).astype(int)                 # 多数票\nprint(' k  训练误差 测试误差')\nfor k in [1, 3, 5, 11, 21, 51, 101, 299]:\n    tr = np.mean(knn(Xtr, ytr, Xtr, k) != ytr); te = np.mean(knn(Xtr, ytr, Xte, k) != yte)\n    print(f'{k:>3}  {tr:.3f}    {te:.3f}')\nprint('k=1 训练误差 0（自己是自己的邻居）；k 小方差大、k 大偏差大，测试误差在中间最低')",
    out:" k  训练误差 测试误差\n  1  0.000    0.248\n  3  0.133    0.211\n  5  0.167    0.203\n 11  0.180    0.202\n 21  0.190    0.206\n 51  0.200    0.223\n101  0.243    0.229\n299  0.460    0.455\nk=1 训练误差 0（自己是自己的邻居）；k 小方差大、k 大偏差大，测试误差在中间最低",
    note:`knn() 三行 = 算距离、取 top-k、投票；k=1 训练误差 0 是第 4 步；测试误差先降(1→11)后升(51→299) 是第 5 步的偏差方差 U 形。`
  },
  contrast:[
    {vs:`K-means`, same:`名字都有 K、都算欧氏距离`, diff:`KNN 是有监督分类，K 是邻居数；K-means 是无监督聚类，K 是簇数`, when:`有标签预测用 KNN；无标签找结构用 K-means`},
    {vs:`核密度估计 / Parzen 窗`, same:`都是局部平均`, diff:`Parzen 固定半径数点数；KNN 固定点数看半径`, when:`密度差异大的数据 KNN 自适应更好`},
    {vs:`SVM`, same:`都直接用训练点定义决策`, diff:`SVM 只留支持向量且边界全局光滑；KNN 全部点保留、边界局部锯齿`, when:`边界简单用 SVM；边界复杂、数据密用 KNN`},
    {vs:`向量检索（RAG 召回）`, same:`本质完全一样：查最近的 k 个向量`, diff:`检索关心的是"取回哪些"，而不是投票出一个标签`, when:`今天 KNN 的工业形态就是 faiss/HNSW`}
  ],
  ext:[
    {t:`高维嵌入上的近邻检索：蛋白/细胞的 embedding 空间里找最像的`, go:'bm.protein_embed'},
    {t:`RAG 召回 = 近似 KNN`, go:'lm.rag'},
    {t:`距离度量本身可以学（metric learning），KNN 效果由度量决定`, go:'ge.distance'}
  ]
},

'ml.kmeans': {
  layers:{
    alg:`J(μ,a) = Σᵢ ‖xᵢ − μ_{aᵢ}‖²。交替：固定 μ 求 a（认领最近）；固定 a 求 μ（取均值）。`,
    geo:`k 个磁铁吸走各自 Voronoi 格子里的点，然后每个磁铁跳到自家点的重心。格子重画、磁铁再跳，直到不动。`,
    comp:`每轮 O(n·k·d) 算距离 + O(n·d) 取均值，通常几十轮收敛。结果依赖初始化，跑 n_init 次取 J 最小；k-means++ 让初始点撒开。`
  },
  proof:{
    from:`目标 J(μ₁..μ_k, a₁..aₙ) = Σᵢ ‖xᵢ − μ_{aᵢ}‖²，a 是离散归属、μ 是连续中心`,
    to:`Lloyd 算法是对 J 的坐标下降，每步 J 不增，且有限步内必收敛（到局部最优）`,
    steps:[
      [`固定 μ，对每个 i 单独最小化 ‖xᵢ − μ_{aᵢ}‖²`,`J 在 a 上是 n 个独立项之和，每项只含一个 aᵢ，可逐个取最优`],
      [`最优 aᵢ = argmin_j ‖xᵢ − μⱼ‖²（认领最近中心）`,`有限个候选取最小值，这一步 J 只能降或不变`],
      [`固定 a，对每个簇 j 最小化 Σ_{i∈Cⱼ} ‖xᵢ − μⱼ‖²`,`J 在 μ 上分解成 k 个独立的二次函数，每个只含一个 μⱼ`],
      [`求导 −2Σ(xᵢ − μⱼ)=0 ⟹ μⱼ = 簇内均值`,`二次函数的驻点是极小；"均值最小化平方距离和"是方差的定义`],
      [`两步都不增 J，J ≥ 0 有下界，所以 J 单调收敛`,`单调有界数列必收敛`],
      [`归属 a 只有 kⁿ 种，J 严格降时归属不能重复，所以有限步后归属不再变化，算法停机`,`离散状态有限 + 单调，不可能无限循环`],
      [`收敛点只是局部最优：J 对 (μ,a) 联合非凸`,`坐标下降只保证每个坐标块内最优，不同初始化落进不同盆地，所以要多次重启`]
    ],
    end:`K-means = 对组内平方和做坐标下降：认领步和均值步各自闭式最优，所以 J 单调降、有限步停。代价是只到局部最优。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nX = np.r_[np.random.randn(100,2), np.random.randn(100,2)+[5,0], np.random.randn(100,2)+[2,5]]\nk = 3; mu = X[np.random.choice(len(X), k, replace=False)]      # 随机挑 k 个点做初始中心\ndef inertia(X, mu, a): return sum(((X[a==j] - mu[j])**2).sum() for j in range(k))\nfor it in range(1, 20):\n    d = ((X[:,None,:] - mu[None,:,:])**2).sum(-1)              # 每点到每中心的距离²\n    a = d.argmin(1)                                             # E 步：固定 μ，认领最近中心\n    J1 = inertia(X, mu, a)\n    new_mu = np.array([X[a==j].mean(0) for j in range(k)])     # M 步：固定归属，取均值\n    J2 = inertia(X, new_mu, a)\n    print(f'iter {it}: 认领后 J={J1:.2f}  移中心后 J={J2:.2f}')\n    if np.allclose(new_mu, mu): print('中心不再动 → 收敛'); break\n    mu = new_mu\nprint('最终中心:\\n', np.round(mu, 2))",
    out:"iter 1: 认领后 J=3390.32  移中心后 J=1914.91\niter 2: 认领后 J=1834.07  移中心后 J=1826.57\niter 3: 认领后 J=1822.19  移中心后 J=1818.87\niter 4: 认领后 J=1814.82  移中心后 J=1807.06\niter 5: 认领后 J=1799.33  移中心后 J=1789.43\niter 6: 认领后 J=1769.62  移中心后 J=1709.81\niter 7: 认领后 J=1600.94  移中心后 J=1408.51\niter 8: 认领后 J=1099.71  移中心后 J=731.26\niter 9: 认领后 J=624.98  移中心后 J=599.97\niter 10: 认领后 J=594.95  移中心后 J=593.95\niter 11: 认领后 J=593.95  移中心后 J=593.95\n中心不再动 → 收敛\n最终中心:\n [[ 1.89  4.93]\n [ 4.88 -0.12]\n [ 0.04  0.17]]",
    note:`a = d.argmin(1) 是第 2 步，new_mu 取均值是第 4 步；每行 J 从"认领后"到"移中心后"再到下一轮"认领后"逐段不增，是第 5 步；中心不动即停是第 6 步。`
  },
  contrast:[
    {vs:`高斯混合 GMM / EM`, same:`同样是 E 步（归属）M 步（更新参数）交替`, diff:`K-means 硬归属 + 球形等方差；GMM 软归属 + 每簇自己的协方差，K-means 是 GMM 方差→0 的极限`, when:`簇是椭圆、大小差异大、要归属概率用 GMM`},
    {vs:`KNN`, same:`都算欧氏距离到"某些点"`, diff:`K-means 无监督找 k 个中心；KNN 有监督找 k 个邻居`, when:`无标签用 K-means；有标签用 KNN`},
    {vs:`DBSCAN`, same:`都是聚类`, diff:`K-means 要指定 k、只能切凸簇；DBSCAN 按密度长簇，能切月牙、自动标噪声`, when:`簇形状不规则或有噪声点用 DBSCAN`},
    {vs:`层次聚类`, same:`都无监督`, diff:`层次聚类不用定 k、出树状图，O(n²) 起步；K-means O(n·k)`, when:`n 小要看层级结构用层次；n 大用 K-means`}
  ],
  ext:[
    {t:`坐标下降的一般原理：每个坐标块有闭式解时交替优化`, go:'op.coordinate_descent'},
    {t:`单细胞聚类：先 PCA 再 K-means/Leiden，K-means 是基线`, go:'bm.cell_cluster'},
    {t:`K-means 是 EM 算法在硬归属下的特例`, go:'pr.mle'}
  ]
},

'ml.pca': {
  layers:{
    alg:`中心化 X，协方差 C=XᵀX/n。主方向 = C 的特征向量，按特征值降序；前 q 个张成的子空间同时使投影方差最大、重构误差最小。`,
    geo:`点云是一个斜椭球。PCA 找椭球的长轴、次长轴……然后把点垂直摔到前 q 根轴张成的平面上。投影方差 + 垂直距离² = 总方差，是勾股定理。`,
    comp:`不显式算 C：直接对中心化后的 X 做 SVD，X=USVᵀ，V 的列就是主方向，S²/n 就是特征值。O(n·d·min(n,d))；n 巨大用随机化 SVD。`
  },
  proof:{
    from:`中心化数据 X ∈ ℝⁿˣᵈ；单位向量 u；C = XᵀX/n 对称半正定`,
    to:`最大化投影方差 max uᵀCu 与最小化重构误差 min ‖X − Xuuᵀ‖² 是同一个问题，解都是 C 的最大特征向量`,
    steps:[
      [`投影到 u 上的坐标是 Xu，其方差 = ‖Xu‖²/n = uᵀCu`,`中心化后均值为 0，方差就是平方和除以 n；提出 u 得二次型`],
      [`max uᵀCu s.t. ‖u‖=1，拉格朗日 uᵀCu − λ(uᵀu−1)，求导得 Cu=λu`,`带等式约束的极值用乘子；驻点条件恰是特征方程`],
      [`代回：uᵀCu = λ，所以取最大特征值 λ₁，u=v₁`,`在所有特征向量里目标值就是对应特征值，最大的自然是 λ₁`],
      [`重构误差：‖x − uuᵀx‖² = ‖x‖² − (uᵀx)²`,`uuᵀ 是到 u 的正交投影，勾股定理：原长² = 投影长² + 残差长²`],
      [`对所有点求和：Σ‖xᵢ − uuᵀxᵢ‖² = Σ‖xᵢ‖² − n·uᵀCu`,`第一项与 u 无关；所以最小化重构误差 ⟺ 最大化 uᵀCu，两个目标等价`],
      [`推广到 q 维：在与 v₁ 正交的补空间里重复，得 v₂…v_q；总投影方差 = λ₁+…+λ_q，重构误差 = λ_{q+1}+…+λ_d`,`C 对称 ⟹ 特征向量正交；总方差 = tr(C) = Σλ，前 q 个拿走，剩下的就是误差`],
      [`SVD 联系：X=USVᵀ ⟹ C = V(S²/n)Vᵀ，所以 V 的列 = 特征向量，λ = S²/n`,`XᵀX = VSUᵀUSVᵀ = VS²Vᵀ，U 正交；数值上做 SVD 比先算 C 再 eigh 更稳`]
    ],
    end:`PCA 的两个目标是一个勾股定理的两边：投影方差 + 重构误差 = 总方差。解是协方差的特征向量，等价于中心化数据的 SVD。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nn = 500\nZ = np.random.randn(n, 3) * [3, 1, 0.3]                       # 三个方向方差 9,1,0.09\nR = np.linalg.qr(np.random.randn(3,3))[0]                     # 随机旋转\nX = Z @ R.T + [1, 2, 3]\nXc = X - X.mean(0)                                            # 必须中心化\nC = Xc.T @ Xc / n                                             # 协方差\nlam, V = np.linalg.eigh(C); lam, V = lam[::-1], V[:, ::-1]    # 从大到小\nU, S, Vt = np.linalg.svd(Xc, full_matrices=False)\nprint('eigh 特征值      =', np.round(lam, 3))\nprint('SVD S²/n         =', np.round(S**2/n, 3))\nprint('主方向一致(|cos|)=', np.round(np.abs((V * Vt.T).sum(0)), 4))\n# 两个等价目标：投影方差 + 重构误差 = 总方差（勾股）\nfor q in [1, 2]:\n    P = V[:, :q]; Xh = Xc @ P @ P.T\n    var_kept = (Xc @ P).var(0, ddof=0).sum(); rec = ((Xc - Xh)**2).sum(1).mean()\n    print(f'q={q}: 投影方差={var_kept:.3f} 重构误差={rec:.3f} 和={var_kept+rec:.3f} 总方差={np.trace(C):.3f}')",
    out:"eigh 特征值      = [8.501 1.037 0.081]\nSVD S²/n         = [8.501 1.037 0.081]\n主方向一致(|cos|)= [1. 1. 1.]\nq=1: 投影方差=8.501 重构误差=1.118 和=9.619 总方差=9.619\nq=2: 投影方差=9.538 重构误差=0.081 和=9.619 总方差=9.619",
    note:`eigh(C) 是第 2-3 步，与 SVD 的 S²/n 逐位一致是第 7 步；最后两行"投影方差 + 重构误差 = 总方差 9.619"是第 5-6 步的勾股恒等式，重构误差正好是舍掉的特征值之和。`
  },
  contrast:[
    {vs:`线性判别分析 LDA`, same:`都是找一组投影方向`, diff:`PCA 无监督，最大化总方差；LDA 有监督，最大化类间方差/类内方差`, when:`可视化、去噪、降维用 PCA；为分类找方向用 LDA`},
    {vs:`最小二乘回归线`, same:`都给点云画一条线`, diff:`PCA 最小化垂直距离、变量对等；回归最小化 y 方向距离、x 是自变量`, when:`有因变量用回归；没有用 PCA`},
    {vs:`UMAP / t-SNE`, same:`都是降维可视化`, diff:`PCA 线性、保全局距离、可逆；UMAP/t-SNE 非线性、只保邻域、不可逆、坐标无意义`, when:`先 PCA 到 50 维去噪，再 UMAP 画图`},
    {vs:`ICA / 因子分析`, same:`都是线性分解`, diff:`PCA 要方向正交且方差最大；ICA 要成分统计独立；因子分析有噪声模型`, when:`分离混合信号用 ICA；建潜变量模型用因子分析`}
  ],
  ext:[
    {t:`特征分解是 PCA 的全部数学`, go:'la.eigen'},
    {t:`SVD 是 PCA 的数值实现，也是低秩近似的最优解（Eckart-Young）`, go:'la.svd'},
    {t:`单细胞：PCA 到 30-50 维是聚类和 UMAP 前的标准第一步`, go:'bm.cell_cluster'}
  ]
},

'ml.naive_bayes': {
  layers:{
    alg:`argmax_y log P(y) + Σⱼ log P(xⱼ|y)。训练 = 按类数每个特征的频率（加拉普拉斯平滑）；预测 = 对数先验加对数似然。`,
    geo:`二值特征时判别函数 log[P(y=1|x)/P(y=0|x)] = w·x + b，边界是一条直线，w 每一维是该词的对数似然比。`,
    comp:`一遍数据 O(n·d) 数计数，预测 O(d)。没有迭代、没有优化器，几百万文档也秒训。`
  },
  proof:{
    from:`贝叶斯公式 P(y|x) ∝ P(y)P(x|y)；朴素假设 P(x|y)=Πⱼ P(xⱼ|y)`,
    to:`二值特征下 log 后验比是 x 的线性函数 w·x+b；且极大似然估计就是计数`,
    steps:[
      [`P(y|x) = P(y)P(x|y)/P(x)，分母与 y 无关，比较时可丢`,`贝叶斯公式；argmax 对 y 求，P(x) 是常数`],
      [`条件独立假设：P(x|y) = Πⱼ P(xⱼ|y)`,`把 2ᵈ 个参数的联合分布砍成 d 个边际，这是唯一让数据够估的办法；假设明显错但排序常常对`],
      [`取对数：score(y) = log P(y) + Σⱼ log P(xⱼ|y)`,`连乘几百个 <1 的数会下溢到 0；log 单调，argmax 不变`],
      [`伯努利特征 xⱼ∈{0,1}，P(xⱼ|y)=θⱼᵧ^{xⱼ}(1−θⱼᵧ)^{1−xⱼ}，取对数 = xⱼ log θⱼᵧ + (1−xⱼ) log(1−θⱼᵧ)`,`伯努利密度的紧凑写法；对 xⱼ 是线性的`],
      [`两类相减：log[P(1|x)/P(0|x)] = Σⱼ xⱼ·log[θⱼ₁(1−θⱼ₀)/(θⱼ₀(1−θⱼ₁))] + [log P(1)/P(0) + Σⱼ log (1−θⱼ₁)/(1−θⱼ₀)] = w·x + b`,`把与 xⱼ 相乘的项收成 wⱼ，剩下的常数收成 b；判别函数在对数空间是线性的，和逻辑回归同一族`],
      [`极大似然估计 θⱼᵧ = (类 y 中 xⱼ=1 的数)/(类 y 的样本数)`,`伯努利的 MLE 就是频率；对 log 似然求导令零即得`],
      [`拉普拉斯平滑 θ = (count+1)/(N+2)`,`频率为 0 会让 log 0 = −∞ 把整条打死；加 1 相当于 Beta(1,1) 先验的 MAP`]
    ],
    end:`朴素贝叶斯 = 贝叶斯公式 + 条件独立 + 取对数。二值特征下它就是一条直线，只是 w 由计数直接算出，不用迭代。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nV, n = 6, 400                                                 # 词表 6 个词，二值特征\ntheta = np.array([[0.8,0.6,0.5,0.1,0.1,0.2], [0.1,0.2,0.5,0.7,0.6,0.9]])   # P(词|类)\ny = (np.random.rand(n) < 0.4).astype(int)                     # P(y=1)=0.4\nX = (np.random.rand(n, V) < theta[y]).astype(int)\n# 训练 = 数数（拉普拉斯平滑 +1/+2）\nprior = np.bincount(y)/n\ncnt = np.array([X[y==c].sum(0) for c in (0,1)]); Nc = np.bincount(y)\np = (cnt + 1) / (Nc[:,None] + 2)\nprint('估计 P(词|y=1) =', np.round(p[1],2), ' 真值', theta[1])\n# 判别函数：log P(y=1|x) - log P(y=0|x) = w·x + b（对数空间里是线性的）\nw = np.log(p[1]/(1-p[1])) - np.log(p[0]/(1-p[0]))\nb = np.log(prior[1]/prior[0]) + (np.log(1-p[1]) - np.log(1-p[0])).sum()\nlin = (X @ w + b > 0).astype(int)\n# 直接算后验 argmax 做对照\nlp = np.log(prior)[None,:] + X @ np.log(p).T + (1-X) @ np.log(1-p).T\npost = lp.argmax(1)\nprint('线性判别 w =', np.round(w, 2), ' b =', round(b, 2))\nprint('线性判别 与 argmax 后验 一致率 =', np.mean(lin == post))\nprint('训练准确率 =', np.mean(post == y))",
    out:"估计 P(词|y=1) = [0.1  0.2  0.54 0.65 0.52 0.89]  真值 [0.1 0.2 0.5 0.7 0.6 0.9]\n线性判别 w = [-3.61 -1.68  0.15  2.83  2.19  3.4 ]  b = -1.87\n线性判别 与 argmax 后验 一致率 = 1.0\n训练准确率 = 0.9325",
    note:`p = (cnt+1)/(Nc+2) 是第 6-7 步的计数 + 平滑；w、b 两行逐字是第 5 步的公式；"线性判别 与 argmax 后验 一致率 1.0"验证了对数空间线性这个结论。`
  },
  contrast:[
    {vs:`逻辑回归（判别式）`, same:`判别函数都是 w·x+b`, diff:`NB 的 w 由每维单独计数得出（生成式，估 P(x|y)）；逻辑回归直接优化 P(y|x)，w 联合学出`, when:`样本少、维度高、特征近似独立用 NB；样本多用逻辑回归上限更高`},
    {vs:`高斯 NB vs LDA`, same:`都假设每类是高斯`, diff:`高斯 NB 协方差对角（各维独立）；LDA 共享全协方差，允许相关`, when:`特征相关明显用 LDA`},
    {vs:`多项式 NB vs 伯努利 NB`, same:`都做文本`, diff:`多项式看词频计数；伯努利只看出现与否且缺席也算证据`, when:`长文档用多项式；短文本/是否型特征用伯努利`},
    {vs:`贝叶斯网络`, same:`都基于条件概率分解`, diff:`NB 是"所有特征只连 y"的星形图；贝叶斯网络允许任意 DAG`, when:`特征间依赖必须建模时用贝叶斯网络`}
  ],
  ext:[
    {t:`贝叶斯公式是它的全部`, go:'pr.bayes'},
    {t:`平滑 = MAP 估计 + Beta/Dirichlet 先验`, go:'pr.map_prior'},
    {t:`生成式的一般框架：先建 P(x|y)，再翻成 P(y|x)；深度版本是 VAE`, go:'gm.vae'}
  ]
},

'ml.metrics': {
  layers:{
    alg:`混淆矩阵四格 TP/FP/FN/TN。P=TP/(TP+FP)，R=TP/(TP+FN)，F1=2PR/(P+R)=2TP/(2TP+FP+FN)。AUC=P(正样本分数 > 负样本分数)。`,
    geo:`混淆矩阵一列是"报出来的"（竖着除得 P），一行是"真的有的"（横着除得 R）。ROC 曲线是滑动阈值时 (FPR,TPR) 走过的路，AUC 是它下面的面积。`,
    comp:`P/R/F1 是一个阈值下的四个整数；ROC/AUC 要按分数排序 O(n log n)，一次遍历累积 TP/FP。AUC 等价于所有正负对里排对的比例。`
  },
  proof:{
    from:`一个阈值下的四格 TP/FP/FN/TN；分类器输出连续分数 s`,
    to:`F1 是 P、R 的调和平均且等于 2TP/(2TP+FP+FN)；AUC = 随机正样本分数高于随机负样本的概率；不平衡时 accuracy 失效`,
    steps:[
      [`P = TP/(TP+FP)：报阳性的里有多少真的；R = TP/(TP+FN)：真阳性里抓到多少`,`两者分子相同、分母是混淆矩阵的一列和一行，分别回答"准不准"和"漏不漏"`],
      [`调和平均 H = 2/(1/P+1/R) = 2PR/(P+R)`,`调和平均是"倒数的算术平均的倒数"，对小值敏感：P=1,R=0.01 时算术平均 0.505 而调和 0.02`],
      [`代入 P、R 的定义：F1 = 2TP/(2TP+FP+FN)`,`通分；这个形式说明 F1 完全不看 TN，所以多数类的"正确拒绝"不能抬分`],
      [`为什么用调和不用算术：把 P、R 看作两种"率"，同一份 TP 分别除以两个分母，合并两个率的正确方式是调和（同路程不同速度求平均速度的道理）`,`算术平均允许一边为 0 另一边为 1 得 0.5，把"全报阳性"这种废模型打成及格`],
      [`accuracy = (TP+TN)/n；阳性率 π 很小时全判负 accuracy = 1−π`,`多数类贡献了几乎全部分子，指标被 TN 绑架，与模型是否学到东西无关`],
      [`ROC：滑动阈值 t，TPR(t)=P(s>t|+)，FPR(t)=P(s>t|−)；AUC = ∫TPR d(FPR)`,`每个阈值一个点，阈值从高到低连成曲线；面积就是把 TPR 对 FPR 积分`],
      [`AUC = P(s₊ > s₋)`,`把积分换元成对负样本分数的分布积分：∫P(s₊>t)·p₋(t)dt = P(s₊>s₋)，这就是 Mann-Whitney U 统计量；所以 AUC 与阈值无关、只看排序`],
      [`PPV 随患病率变化：PPV = Sens·π / [Sens·π + (1−Spec)(1−π)]`,`贝叶斯公式；π=1% 时即使 Sens=Spec=99%，PPV 也只有 50%`]
    ],
    end:`P/R 是同一个 TP 除以两个不同分母，F1 用调和平均把它们合成一个不能靠偏科拿分的数。AUC 是排序质量，不含阈值，所以上线前还得单独选阈值。`
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nn = 1000; y = (np.random.rand(n) < 0.06).astype(int)                 # 6% 阳性\nscore = np.random.randn(n) + 1.8*y                                    # 分类器打分\ndef confusion(y, pred):\n    TP = ((pred==1)&(y==1)).sum(); FP = ((pred==1)&(y==0)).sum()\n    FN = ((pred==0)&(y==1)).sum(); TN = ((pred==0)&(y==0)).sum(); return TP, FP, FN, TN\nfor thr in [0.5, 1.0, 1.5]:\n    TP, FP, FN, TN = confusion(y, (score > thr).astype(int))\n    P = TP/(TP+FP); R = TP/(TP+FN); F1 = 2*P*R/(P+R); acc = (TP+TN)/n\n    print(f'thr={thr}: TP={TP} FP={FP} FN={FN} TN={TN}  P={P:.3f} R={R:.3f} F1={F1:.3f} acc={acc:.3f}  调和={2/(1/P+1/R):.3f} 算术={(P+R)/2:.3f}')\nprint('全判负 acc =', round(1-y.mean(), 3), '← 准确率被多数类绑架')\n# AUC 两种算法：ROC 梯形面积 == 随机正样本分数 > 随机负样本的概率\norder = np.argsort(-score); ys = y[order]\ntpr = np.cumsum(ys)/y.sum(); fpr = np.cumsum(1-ys)/(1-y).sum()\nfx, fy = np.r_[0,fpr], np.r_[0,tpr]\nauc_roc = ((fx[1:]-fx[:-1]) * (fy[1:]+fy[:-1])/2).sum()           # 梯形面积\npos, neg = score[y==1], score[y==0]\nauc_rank = (pos[:,None] > neg[None,:]).mean()\nprint(f'AUC 梯形={auc_roc:.4f}  排序概率={auc_rank:.4f}  （阈值无关，所以它不告诉你上线该切哪）')",
    out:"thr=0.5: TP=54 FP=282 FN=1 TN=663  P=0.161 R=0.982 F1=0.276 acc=0.717  调和=0.276 算术=0.571\nthr=1.0: TP=48 FP=140 FN=7 TN=805  P=0.255 R=0.873 F1=0.395 acc=0.853  调和=0.395 算术=0.564\nthr=1.5: TP=36 FP=64 FN=19 TN=881  P=0.360 R=0.655 F1=0.465 acc=0.917  调和=0.465 算术=0.507\n全判负 acc = 0.945 ← 准确率被多数类绑架\nAUC 梯形=0.9451  排序概率=0.9451  （阈值无关，所以它不告诉你上线该切哪）",
    note:`confusion() 数四格是第 1 步；每行"调和 = F1 ≠ 算术"是第 2-4 步；"全判负 acc 0.945"是第 5 步；最后一行梯形面积与排序概率相等是第 6-7 步的 AUC 等价性。`
  },
  contrast:[
    {vs:`准确率 accuracy`, same:`都从混淆矩阵来`, diff:`accuracy 把 TN 算进去，不平衡时被多数类绑架；F1 不看 TN`, when:`类别均衡看 accuracy；不平衡看 F1/PR 曲线`},
    {vs:`AUC-ROC`, same:`都评价二分类`, diff:`F1 是一个阈值下的分数；AUC 是全部阈值的排序质量，不含阈值`, when:`比模型用 AUC；决定上线阈值、报告最终性能用 F1/P/R`},
    {vs:`PR-AUC（平均精确率）`, same:`都是曲线下面积`, diff:`ROC 的 FPR 分母是大量负样本，极不平衡时 ROC 仍虚高；PR 曲线只看正类，更诚实`, when:`阳性率 <5% 时看 PR-AUC 而不是 ROC-AUC`},
    {vs:`敏感度/特异度（医学）`, same:`敏感度就是召回率`, diff:`特异度 = TN/(TN+FP) 看的是负类，与精确率不同；PPV 才对应精确率且随患病率剧变`, when:`医学报告必须同时给 Sens/Spec 和当前患病率下的 PPV`}
  ],
  ext:[
    {t:`PPV 随患病率变化就是贝叶斯公式`, go:'pr.bayes'},
    {t:`AUC 就是 Mann-Whitney U 检验的统计量，可以做假设检验`, go:'si.pvalue'},
    {t:`小样本下指标的置信区间必须用 bootstrap 给出`, go:'si.bootstrap'}
  ]
}

});
