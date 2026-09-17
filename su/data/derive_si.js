// 数理宇宙 v3 · 推导层：si 统计推断大陆（11 节点）
// 只 push 到 window.DERIVE，不改动 v1/v2 任何文件。scratch 只用 numpy + 标准库，输出为 python3 实跑结果（固定 seed）。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

"si.estimate_vs_test": {
  layers:{
    alg:"检验：算 t=(x̄₁−x̄₂)/SE，报 p=P(|T|≥|t| | H0)。估计：报 Δ=x̄₁−x̄₂ 与 CI=Δ±t*·SE。同一个 SE，检验只问“Δ/SE 够不够大”，估计保留 Δ 本身与它的不确定度。",
    geo:"数轴上一段区间。检验只看这段区间是否碰到 0（碰到=不显著）；估计看区间落在哪、多宽。两段一样不碰 0 的区间，一段在 0.1 附近极窄，一段在 5 附近很宽，检验说“一样显著”，估计说“完全两回事”。",
    comp:"两者共用一次 mean/std/SE 计算。p 值多做一次 t 分布尾积分；CI 多做一次分位数查表。计算量相同，信息量不同：p 是 Δ 与 n 的纠缠后的一个标量，CI 保留了两者。"
  },
  proof:{
    from:"两组独立样本，Δ̂=x̄₁−x̄₂，SE=√(s₁²/n₁+s₂²/n₂)；t=Δ̂/SE 在 H0 下近似服从 t 分布",
    to:"p 是 Δ̂ 与 n 的混合函数，固定真实效应时 p→0 随 n；CI 的位置与宽度分别编码效应大小与精度，检验得到的信息是 CI 的一个投影",
    steps:[
      ["写出 SE ∝ σ/√n，所以 t = Δ̂/SE ∝ Δ̂·√n/σ","SE 的定义；两组等 n 时 SE=σ√(2/n)，√n 因子来自方差可加性"],
      ["固定真实 Δ≠0，n→∞ 时 t→∞，p→0","t 与 √n 成正比，任何非零效应只要 n 够大都“显著”，显著性不衡量效应大小"],
      ["固定 n，Δ̂ 极小时 p 也可极小，只要 σ 也极小","p 只看比值 Δ̂/SE，比值大不代表分子大"],
      ["CI = Δ̂ ± t*·SE；其中心 Δ̂ 是效应量估计，半宽 t*·SE 是精度","区间由两个独立信息拼成：位置和宽度，p 把它们压成一个数"],
      ["“p<0.05” ⟺ “95% CI 不含 0”","两者用同一个 t* 和同一个 SE；检验是 CI 对“是否含 0”这一位的投影"],
      ["所以 CI 蕴含检验，检验不蕴含 CI","投影不可逆：从“不含 0”推不出中心在哪、宽度多少"],
      ["科学问题“效应多大、在什么条件下”需要 Δ̂ 和 SE 两个数，检验给的一个数不够","实验设计与后续功效计算都要输入效应量，而不是 p"]
    ],
    end:"p 是 CI 的一位投影。报效应量+CI 就自动含了检验，反过来不成立。这就是“估计优先于检验”的全部理由。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np, math\ndef t_pdf(x, df):\n    c = math.exp(math.lgamma((df+1)/2) - math.lgamma(df/2)) / math.sqrt(df*math.pi)\n    return c * (1 + x*x/df) ** (-(df+1)/2)\ndef t_cdf(t, df):                       # 数值积分，不用 scipy\n    x = np.linspace(-60, t, 400001); return float(np.trapezoid(t_pdf(x, df), x))\ndef p_two(t, df): return 2*(1 - t_cdf(abs(t), df))\nnp.random.seed(0)\ndef report(x, y, tag):\n    n1, n2 = len(x), len(y); d = x.mean() - y.mean()\n    se = math.sqrt(x.var(ddof=1)/n1 + y.var(ddof=1)/n2); df = n1 + n2 - 2\n    t = d/se; p = p_two(t, df)\n    tq = 1.96 if df > 200 else 2.262  # df=9 的 t* 约 2.262\n    print(f'{tag}: 差={d:.3f}  CI=[{d-tq*se:.3f}, {d+tq*se:.3f}]  t={t:.2f}  p={p:.4f}')\n# A：大效应小样本   B：微小效应巨样本   两者 p 接近\nxa = np.random.normal(1.0, 1, 6); ya = np.random.normal(0, 1, 6)\nxb = np.random.normal(0.03, 1, 20000); yb = np.random.normal(0, 1, 20000)\nreport(xa, ya, 'A n=6   ')\nreport(xb, yb, 'B n=2e4 ')\nprint('同一个 p 附近，CI 的位置和宽度完全不同 → p 丢掉了效应大小')",
    out:"A n=6   : 差=1.595  CI=[0.345, 2.845]  t=2.89  p=0.0162\nB n=2e4 : 差=0.030  CI=[0.010, 0.049]  t=2.98  p=0.0028\n同一个 p 附近，CI 的位置和宽度完全不同 → p 丢掉了效应大小",
    note:"report 里 t=d/se 是第 1 步，tq*se 是第 4 步的半宽；A、B 两行 p 接近而 CI 一个宽在 1 附近、一个窄在 0.03 附近，是第 2、6 步的数值版。"
  },
  contrast:[
    {vs:"假设检验（NHST）", same:"都基于同一个 SE 和同一个 t 分布", diff:"检验输出二值决定，估计输出效应量与精度；前者是后者的一位投影", when:"做决策（放不放行）用检验；做科学（效应多大）用估计"},
    {vs:"效应量 Cohen's d", same:"都描述“效应多大”", diff:"Δ̂ 带单位，d=Δ̂/σ 无量纲；CI 也可以对 d 给", when:"跨实验、跨论文比较用 d；本实验内报告用原单位 Δ̂+CI"},
    {vs:"贝叶斯后验区间", same:"都给出一段区间", diff:"频率 CI 是方法的长期覆盖率，后验区间是参数落入的概率；含义相反", when:"能写出合理先验且要“参数在里面的概率”用后验；否则 CI"}
  ],
  ext:[
    {t:"CI 的严格频率解释与覆盖率验证", go:"si.confidence_interval"},
    {t:"效应量与功效：n 由 d 决定，不由 p 决定", go:"si.power"},
    {t:"贝叶斯因子能表达“支持无效应”，p 不能", go:"si.bayes_factor"}
  ]
},

"si.pvalue": {
  layers:{
    alg:"p = P(T ≥ t_obs | H0)：先假定 H0 为真，算检验统计量 T 的分布，再算“至少这么极端”的尾部面积。它是数据给定假设的概率，不是假设给定数据的概率。",
    geo:"一条零假设下的钟形曲线，你的 t 落在某处，p 是 t 右边（双侧则两边）的尾巴面积。H0 为真时 t 在曲线上随机落点，尾巴面积就是均匀分布的随机数。",
    comp:"算法：算统计量 → 查（或积分/模拟）零分布 → 取尾面积。零分布可以来自公式（t、χ²）或来自置换/模拟。全部计算不涉及 H1，所以 p 里不含“H1 有多可信”的信息。"
  },
  proof:{
    from:"H0 为真时统计量 T 有已知连续分布 F；p=1−F(T)（单侧）",
    to:"(1) H0 为真时 p ~ Uniform(0,1)，所以“p<α”的假阳率恰为 α；(2) P(H0|p<α) 依赖先验，与 p 本身不等",
    steps:[
      ["设 U=F(T)，T~F 连续，则 P(U≤u)=P(T≤F⁻¹(u))=F(F⁻¹(u))=u","概率积分变换：连续分布的 CDF 作用在自身样本上得均匀分布"],
      ["p=1−U 也是 Uniform(0,1)","1 减均匀仍均匀"],
      ["所以 P(p<α | H0)=α","均匀分布落入 [0,α) 的概率就是 α，这就是 α 控制假阳率的全部数学"],
      ["用贝叶斯公式：P(H0|拒绝)=P(拒绝|H0)P(H0)/[P(拒绝|H0)P(H0)+P(拒绝|H1)P(H1)]","贝叶斯定理；分母是全概率展开"],
      ["代入 P(拒绝|H0)=α，P(拒绝|H1)=功效 1−β，P(H1)=π","假阳率与功效正是这两个条件概率的定义"],
      ["假发现率 = απ₀/(απ₀+(1−β)π₁)。π₁=0.1, 功效 0.8, α=0.05：0.045/(0.045+0.08)=36%","纯代数；p<0.05 的“阳性”里超过三分之一是假的，因为先验低"],
      ["p 的计算完全不含 π 和 1−β，所以 p 不可能等于 P(H0|数据)","p 的公式只用 H0 下的分布；缺少的两项正是把它换算成后验概率所需的"]
    ],
    end:"H0 下 p 均匀分布是 α 控制错误率的根据；把 p 读成“H0 为真的概率”缺了先验和功效，在低先验领域会错得离谱。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np, math\ndef t_pdf(x, df):\n    c = math.exp(math.lgamma((df+1)/2) - math.lgamma(df/2)) / math.sqrt(df*math.pi)\n    return c * (1 + x*x/df) ** (-(df+1)/2)\ndef t_cdf(t, df):                       # 数值积分，不用 scipy\n    x = np.linspace(-60, t, 400001); return float(np.trapezoid(t_pdf(x, df), x))\ndef p_two(t, df): return 2*(1 - t_cdf(abs(t), df))\nnp.random.seed(0)\nn, reps = 10, 4000\n# (1) H0 为真：两组同分布，p 应均匀\nps = []\nfor _ in range(reps):\n    x, y = np.random.randn(n), np.random.randn(n)\n    t = (x.mean()-y.mean())/math.sqrt(x.var(ddof=1)/n + y.var(ddof=1)/n)\n    ps.append(p_two(t, 2*n-2))\nps = np.array(ps)\nprint('H0 下 p 的直方图(10 箱):', np.histogram(ps, bins=10, range=(0,1))[0])\nprint('P(p<0.05) =', (ps < 0.05).mean())\n# (2) 先验 10% 为真、功效 0.8：p<0.05 的阳性里多少是假的\npi1, power, alpha = 0.10, 0.80, 0.05\nfdr = alpha*(1-pi1) / (alpha*(1-pi1) + power*pi1)\nprint(f'假发现率 = {fdr:.3f}')",
    out:"H0 下 p 的直方图(10 箱): [370 415 386 416 412 387 407 391 414 402]\nP(p<0.05) = 0.04325\n假发现率 = 0.360",
    note:"直方图各箱接近 400 是第 1-2 步“H0 下 p 均匀”的实验版；P(p<0.05)≈0.05 是第 3 步；最后一行 0.36 是第 6 步的代数。"
  },
  contrast:[
    {vs:"P(H0 | 数据)（后验概率）", same:"都是介于 0-1 的“可信度”样子", diff:"p 以 H0 为条件，后验以数据为条件；差一个先验比与功效", when:"要“这个发现是真的概率”必须用后验/贝叶斯因子；p 只回答“H0 下数据奇不奇怪”"},
    {vs:"α（显著性水平）", same:"都在 0-1 之间、常常一起出现", diff:"α 是实验前定的阈值，p 是实验后算的随机变量", when:"α 用来定决策规则；p 用来报告证据强度，不要把 p 事后当 α 用"},
    {vs:"贝叶斯因子 BF", same:"都衡量数据对假设的支持", diff:"BF 同时算 H0 与 H1 下的似然并取比；p 只算 H0", when:"能写出 H1 就用 BF，它能支持 H0；p 永远不能"}
  ],
  ext:[
    {t:"p 均匀 ⟹ 多次检验时至少一次 p<α 的概率 1−(1−α)^m", go:"si.multiple_testing"},
    {t:"功效是换算后验所缺的另一半", go:"si.power"},
    {t:"贝叶斯公式把 p 换算成后验", go:"pr.bayes"}
  ]
},

"si.confidence_interval": {
  layers:{
    alg:"95% CI = x̄ ± t*_{0.975,n−1}·s/√n。它由“枢轴量 (x̄−μ)/(s/√n) ~ t_{n−1}”反解出来：把关于统计量的概率语句，翻转成关于 μ 的区间语句。",
    geo:"真值 μ 是数轴上一根固定的钉子。每做一次实验画一段区间，区间在随机跳。95% 是“钉子被盖住的区间占多少”，不是“钉子在这段区间里的概率”——钉子不动，动的是区间。",
    comp:"算 x̄、s，查 t 分位数（df=n−1），乘 s/√n。验证覆盖率：重复模拟几千次，数“区间盖住真值”的比例。"
  },
  proof:{
    from:"X₁..Xₙ iid N(μ,σ²)；枢轴量 T=(x̄−μ)/(s/√n) 的分布是 t_{n−1}，与 μ、σ 无关",
    to:"区间 [x̄−t*·s/√n, x̄+t*·s/√n] 在重复抽样中以 95% 频率盖住 μ；概率属于区间（随机）而非 μ（固定）",
    steps:[
      ["x̄ ~ N(μ, σ²/n)，(n−1)s²/σ² ~ χ²_{n−1}，且两者独立","正态样本的均值与样本方差独立（Cochran 定理），这是能造出 t 的前提"],
      ["T=(x̄−μ)/(s/√n)=[(x̄−μ)/(σ/√n)]/√[s²/σ²] = Z/√(χ²/(n−1)) ~ t_{n−1}","t 分布的定义就是标准正态除以独立卡方均值的平方根；σ 在分子分母抵消，所以 T 的分布不依赖未知参数"],
      ["P(−t* ≤ T ≤ t*) = 0.95，t* 为 t_{n−1} 的 0.975 分位","枢轴量分布已知，就能定出一个概率恰为 0.95 的对称区间"],
      ["把不等式关于 μ 解出：x̄−t*·s/√n ≤ μ ≤ x̄+t*·s/√n","线性不等式两边同乘同加；事件不变，概率不变，仍是 0.95"],
      ["这一步中随机的是 x̄ 和 s，μ 是常数；概率语句描述的是随机区间盖住常数的频率","频率派中参数是固定未知数，没有分布；所以 0.95 不能挂在 μ 上"],
      ["区间一旦算出（数字），它要么含 μ 要么不含，概率是 0 或 1；95% 是方法的长期覆盖率","这是“置信”与“概率”的区别：属性归于产生区间的程序，而非某一个具体区间"],
      ["n 小时 t*>1.96，因为 s 估计 σ 带来额外不确定性；n→∞ 时 t*→1.96","t 分布比正态尾厚，厚出来的部分正是 s 的抽样波动"]
    ],
    end:"CI 是把“T 落在 ±t* 内”翻转成“μ 落在区间内”。概率一直属于随机的区间，翻转不改这一点。95% 是程序的覆盖率。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np, math\ndef t_pdf(x, df):\n    c = math.exp(math.lgamma((df+1)/2) - math.lgamma(df/2)) / math.sqrt(df*math.pi)\n    return c * (1 + x*x/df) ** (-(df+1)/2)\ndef t_cdf(t, df):                       # 数值积分，不用 scipy\n    x = np.linspace(-60, t, 400001); return float(np.trapezoid(t_pdf(x, df), x))\ndef p_two(t, df): return 2*(1 - t_cdf(abs(t), df))\nnp.random.seed(0)\ndef t_quantile(q, df):                  # 二分求 t 分位数\n    lo, hi = 0.0, 20.0\n    for _ in range(60):\n        mid = (lo+hi)/2\n        lo, hi = (mid, hi) if t_cdf(mid, df) < q else (lo, mid)\n    return (lo+hi)/2\nn, mu, sigma, reps = 10, 5.0, 2.0, 4000\ntstar = t_quantile(0.975, n-1); print(f'n={n}  t* = {tstar:.3f}  (正态 1.960)')\nhit_t = hit_z = 0\nfor _ in range(reps):\n    x = np.random.normal(mu, sigma, n)\n    se = x.std(ddof=1)/math.sqrt(n)\n    hit_t += abs(x.mean()-mu) <= tstar*se     # 用 t*\n    hit_z += abs(x.mean()-mu) <= 1.96*se      # 错用 1.96\nprint(f'覆盖率  t*: {hit_t/reps:.3f}   误用1.96: {hit_z/reps:.3f}')\nx = np.random.normal(mu, sigma, n); se = x.std(ddof=1)/math.sqrt(n)\nprint(f'某一次的区间 [{x.mean()-tstar*se:.2f}, {x.mean()+tstar*se:.2f}]  真值 {mu} 要么在要么不在')",
    out:"n=10  t* = 2.262  (正态 1.960)\n覆盖率  t*: 0.951   误用1.96: 0.921\n某一次的区间 [3.12, 6.23]  真值 5.0 要么在要么不在",
    note:"t_quantile 求的是第 3 步的 t*；hit_t 统计的是第 4-6 步“区间盖住固定 μ”的频率≈0.95；误用 1.96 覆盖不足，正是第 7 步“s 的抽样波动让 t* 大于 1.96”。"
  },
  contrast:[
    {vs:"贝叶斯可信区间（credible interval）", same:"都是一段区间、都常标 95%", diff:"可信区间说“μ 有 95% 概率在里面”（μ 有后验分布）；CI 说“程序 95% 的时候盖住 μ”", when:"要对 μ 做概率陈述必须用可信区间；不想引入先验用 CI"},
    {vs:"预测区间", same:"形式都是中心 ± 倍数 × 尺度", diff:"CI 盖的是均值 μ，宽度 ∝ s/√n→0；预测区间盖的是下一个观测，宽度 ∝ s√(1+1/n) 不趋于 0", when:"问“平均是多少”用 CI；问“下一只小鼠会怎样”用预测区间"},
    {vs:"标准误 SE", same:"CI 半宽 = t*×SE", diff:"SE 是一个尺度参数，CI 是加上分布形状与置信水平后的具体区间", when:"报 SE 让读者自己换算；报 CI 更直接可读；别报 SD 冒充 SE"}
  ],
  ext:[
    {t:"任何统计量都能靠 bootstrap 造 CI，不需要枢轴量", go:"si.bootstrap"},
    {t:"效应量 d 也应带 CI 报告", go:"si.effect_size"},
    {t:"CLT 让非正态数据在 n 大时仍能用 t 区间", go:"pr.clt"}
  ]
},

"si.effect_size": {
  layers:{
    alg:"Cohen's d = (x̄₁−x̄₂)/s_pooled，s_pooled=√[((n₁−1)s₁²+(n₂−1)s₂²)/(n₁+n₂−2)]。把均值差除以“个体间的典型波动”，得到无单位的相对差距。",
    geo:"两条钟形曲线，d 是它们峰之间的距离，以曲线宽度为尺子。d=0.2 两条曲线几乎重叠，d=0.8 明显分开，d=2 才基本不重叠。d 直接决定重叠面积。",
    comp:"算两组均值、两组方差、按自由度加权合并、开方、做除法。O(n)。d 的方差约为 (n₁+n₂)/(n₁n₂)+d²/(2(n₁+n₂))，可以给它算 CI。"
  },
  proof:{
    from:"两组样本，均值 μ₁ μ₂，共同标准差 σ；观测单位任意",
    to:"d=(μ₁−μ₂)/σ 对单位变换不变，且唯一决定两分布的重叠程度与 P(X₁>X₂)，因此是可跨实验比较的量",
    steps:[
      ["把观测做线性变换 y=ax+b（换单位、换基线）","MFI 换对数、mg 换 g、减去空白，都是这种变换"],
      ["均值差变为 a(μ₁−μ₂)，σ 变为 |a|σ，所以 d 不变（a>0 时）","均值与标准差都是一次齐次量，比值抵消 a，加法常数 b 在差里消掉"],
      ["假设两组正态等方差，P(X₁>X₂)=Φ(d/√2)","X₁−X₂ ~ N(μ₁−μ₂, 2σ²)，标准化后阈值为 d/√2"],
      ["两条密度的重叠面积 = 2Φ(−|d|/2)","两条等宽正态在中点 (μ₁+μ₂)/2 相交，每侧超出中点的尾巴各为 Φ(−d/2)"],
      ["功效公式的输入是 d 而非 Δ：z = d√(n/2) − z_{α/2}","t 统计量的期望 = Δ/(σ√(2/n)) = d√(n/2)，只与 d、n 有关"],
      ["s_pooled 用自由度加权：(n₁−1)s₁²+(n₂−1)s₂² 除以 n₁+n₂−2","各组样本方差是 σ² 的无偏估计，按自由度合并仍无偏；这是等方差假设下的最优估计"],
      ["小样本时 d 高估真值，乘校正 J≈1−3/(4(n₁+n₂)−9) 得 Hedges g","s 低估 σ（Jensen 不等式：E[s]<σ），除以偏小的分母使 d 偏大"]
    ],
    end:"d 是以个体波动为尺的均值差。它不随单位变、决定重叠与功效，所以是唯一能跨论文比较、能拿来算样本量的量。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np, math\nnp.random.seed(0)\ndef cohen_d(x, y):\n    nx, ny = len(x), len(y)\n    sp = math.sqrt(((nx-1)*x.var(ddof=1) + (ny-1)*y.var(ddof=1)) / (nx+ny-2))\n    return (x.mean()-y.mean())/sp\nPhi = lambda z: 0.5*(1+math.erf(z/math.sqrt(2)))\nx = np.random.normal(10.0, 2.0, 30); y = np.random.normal(8.4, 2.0, 30)   # 真 d=0.8\nd = cohen_d(x, y)\nprint(f'原单位   均值差={x.mean()-y.mean():.3f}  d={d:.3f}')\nprint(f'换单位×1000+5   均值差={(1000*x+5).mean()-(1000*y+5).mean():.1f}  d={cohen_d(1000*x+5, 1000*y+5):.3f}')\n# d 决定 P(X1>X2) 与重叠面积：模拟 vs 公式\nX = np.random.normal(10.0, 2.0, 200000); Y = np.random.normal(8.4, 2.0, 200000)\nprint(f'P(X1>X2) 模拟={ (X>Y).mean():.3f}  公式Φ(d/√2)={Phi(0.8/math.sqrt(2)):.3f}')\nprint(f'重叠面积 公式 2Φ(-d/2)={2*Phi(-0.8/2):.3f}')",
    out:"原单位   均值差=3.065  d=1.515\n换单位×1000+5   均值差=3064.8  d=1.515\nP(X1>X2) 模拟=0.715  公式Φ(d/√2)=0.714\n重叠面积 公式 2Φ(-d/2)=0.689",
    note:"换单位后均值差变了 1000 倍而 d 不变，是第 1-2 步；模拟的 P(X₁>X₂) 与 Φ(d/√2) 吻合是第 3 步；2Φ(−d/2) 是第 4 步。"
  },
  contrast:[
    {vs:"p 值", same:"都由均值差与散布算出", diff:"d 不含 n，p 含 n；n 翻倍 d 不变、p 变小", when:"报效应大小用 d；判断是否可能是噪声用 p，两者一起报"},
    {vs:"相关系数 r / R²", same:"都是无量纲效应量", diff:"r 衡量线性关联强度，d 衡量两组均值分离；两者可互换 r=d/√(d²+4)（等 n）", when:"分组比较用 d；连续变量关系用 r"},
    {vs:"比值比 OR / 风险比 RR", same:"都是无量纲效应量", diff:"OR/RR 针对二分结局，d 针对连续结局；OR 在低概率时近似 RR", when:"结局是阳性/阴性用 OR/RR；结局是测量值用 d"}
  ],
  ext:[
    {t:"功效计算把 d 变成 n：n≈16/d²", go:"si.power"},
    {t:"d 的 CI 可用 bootstrap 直接得到", go:"si.bootstrap"},
    {t:"小样本中 d 被高估（winner curse）", go:"bm.small_n"}
  ]
},

"si.power": {
  layers:{
    alg:"功效 1−β = P(拒绝 H0 | 真效应 d)。等 n 双样本 t：t 的期望 ≈ d√(n/2)，功效 ≈ Φ(d√(n/2) − z_{α/2})。反解 n = 2(z_{α/2}+z_β)²/d²，α=0.05、功效 0.8 时 ≈ 15.7/d²。",
    geo:"两条钟形曲线：H0 下 t 以 0 为中心，H1 下以 d√(n/2) 为中心。临界线 1.96 竖在中间。α 是 H0 曲线过线的尾巴，功效是 H1 曲线过线的部分。n 增大把 H1 曲线往右推，过线的面积就大。",
    comp:"给定 d、α、目标功效，代公式求 n 并向上取整。或者直接模拟：在真效应 d 下抽 n 个样本做检验，重复几千次数 p<α 的比例。"
  },
  proof:{
    from:"双样本、等 n、等 σ、真效应 d=Δ/σ；大 n 时 t 近似正态",
    to:"n ≈ 2(z_{α/2}+z_β)²/d²；α=0.05 双侧、功效 0.8 时 n≈16/d²（每组）",
    steps:[
      ["H1 下 t=(x̄₁−x̄₂)/(σ√(2/n)) 的均值为 Δ/(σ√(2/n)) = d√(n/2)，方差≈1","两组均值差的 SE=σ√(2/n)；除以 SE 后期望是非中心参数 δ=d√(n/2)，大 n 时 t≈N(δ,1)"],
      ["拒绝 H0 ⟺ t > z_{α/2}（忽略左尾）","双侧检验的左尾在 H1 右移时几乎为 0，忽略不影响结果"],
      ["功效 = P(N(δ,1) > z_{α/2}) = Φ(δ − z_{α/2})","把 N(δ,1) 平移到标准正态"],
      ["令功效 = 1−β：δ − z_{α/2} = z_β（z_β 是标准正态上 1−β 分位）","Φ 的反函数；这一步把“功效”翻译成对 δ 的要求"],
      ["d√(n/2) = z_{α/2}+z_β ⟹ n = 2(z_{α/2}+z_β)²/d²","代入 δ 的表达式再平方；n 与 d² 成反比"],
      ["α=0.05 双侧 z=1.960，功效 0.8 z=0.842：2(2.802)²=15.7 ⟹ n≈16/d²","纯算术；效应减半样本量翻四倍"],
      ["功效 0.8 意味着 20% 的真效应会漏检；且显著的那些 |Δ̂| 平均被高估","只有超过临界线的估计才“显著”，从右侧截断的估计期望偏大，这就是 winner curse"]
    ],
    end:"功效公式就是“把 H1 曲线推到临界线右边足够远”。n≈16/d²：d=0.5 每组 64，d=0.2 每组 400。样本量由效应量决定，不由愿望决定。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np, math\nnp.random.seed(0)\nPhi = lambda z: 0.5*(1+math.erf(z/math.sqrt(2)))\nza, zb = 1.960, 0.842\nprint(f'2(z_a+z_b)^2 = {2*(za+zb)**2:.2f}  → n ≈ 16/d²')\ndef power_sim(d, n, reps=3000, alpha=0.05):\n    hits = 0\n    for _ in range(reps):\n        x = np.random.normal(d, 1, n); y = np.random.normal(0, 1, n)\n        se = math.sqrt(x.var(ddof=1)/n + y.var(ddof=1)/n)\n        hits += abs((x.mean()-y.mean())/se) > za   # 大 n 用正态临界值\n    return hits/reps\nfor d in [0.5, 0.8]:\n    n = math.ceil(16/d**2)\n    print(f'd={d}  n=16/d²={n}  公式功效={Phi(d*math.sqrt(n/2)-za):.3f}  模拟功效={power_sim(d, n):.3f}')\n# 功效不足时显著结果的效应被高估（winner curse）\nd, n = 0.3, 20; ests = []\nfor _ in range(4000):\n    x = np.random.normal(d, 1, n); y = np.random.normal(0, 1, n)\n    se = math.sqrt(x.var(ddof=1)/n + y.var(ddof=1)/n); dd = x.mean()-y.mean()\n    if abs(dd/se) > 2.02: ests.append(dd)\nprint(f'd=0.3 n=20：功效≈{len(ests)/4000:.2f}，显著结果的平均效应={np.mean(ests):.2f}（真值 0.3）')",
    out:"2(z_a+z_b)^2 = 15.70  → n ≈ 16/d²\nd=0.5  n=16/d²=64  公式功效=0.807  模拟功效=0.814\nd=0.8  n=16/d²=25  公式功效=0.807  模拟功效=0.802\nd=0.3 n=20：功效≈0.15，显著结果的平均效应=0.77（真值 0.3）",
    note:"第一行 15.7 是第 6 步；公式功效 Φ(d√(n/2)−z) 是第 3 步，与模拟吻合；最后一行显著结果均值 0.77 远大于 0.3，是第 7 步的 winner curse。"
  },
  contrast:[
    {vs:"α（第一类错误）", same:"都是检验的错误概率", diff:"α 是 H0 真时误拒的概率，β 是 H1 真时漏检的概率；功效=1−β", when:"α 由领域约定；功效由你设计 n 来保证"},
    {vs:"事后功效（post-hoc power）", same:"同一个公式", diff:"把观测到的 d̂ 代入算功效，与 p 一一对应，不提供新信息", when:"永远别用事后功效解释阴性结果；用 CI 的宽度"},
    {vs:"效应量 d", same:"功效公式的输入", diff:"d 描述效应，功效描述检出它的能力；d 固定时功效只随 n 变", when:"先估 d（文献或预实验），再算 n"}
  ],
  ext:[
    {t:"效应量 d 的定义与为什么它是功效的唯一输入", go:"si.effect_size"},
    {t:"多重检验下每个检验的有效 α 更小，需要的 n 更大", go:"si.multiple_testing"},
    {t:"小样本实验的结构性问题", go:"bm.small_n"}
  ]
},

"si.multiple_testing": {
  layers:{
    alg:"m 个独立零假设各以 α 检验，至少一个假阳的概率 FWER=1−(1−α)^m。Bonferroni：每个用 α/m，FWER≤α。BH：把 p 排序，找最大的 k 使 p_(k) ≤ kq/m，拒绝前 k 个，控制 FDR=E[假阳/阳性]≤q。",
    geo:"m 个均匀随机数撒在 [0,1] 上，问最小的那个多容易落进 [0,α)。m=100 时几乎必然。Bonferroni 把门槛缩到 α/m；BH 画一条斜率 q/m 的直线，排序后的 p 在线下的都算阳性。",
    comp:"Bonferroni：一行，p<α/m。BH：排序 O(m log m)，从大往小扫找第一个 p_(k)≤kq/m。两者控制的目标不同：一个是“一个都不许错”，一个是“阳性里错的比例”。"
  },
  proof:{
    from:"m 个检验，H0 下每个 p ~ Uniform(0,1)（si.pvalue 已证）",
    to:"(1) 不校正时 FWER=1−(1−α)^m→1；(2) Bonferroni 用 α/m 保证 FWER≤α；(3) BH 控制的是 FDR，它允许一定比例假阳换来更多功效",
    steps:[
      ["独立时 P(全部不假阳) = (1−α)^m，所以 FWER = 1−(1−α)^m","独立事件概率相乘；m=20 时 0.64，m=100 时 0.994"],
      ["Bonferroni：P(∪ 假阳ᵢ) ≤ Σ P(假阳ᵢ) = m·(α/m) = α","布尔不等式（并的概率 ≤ 概率之和），不需要独立性，所以 Bonferroni 在任何相关结构下都成立"],
      ["代价：每个检验门槛 α/m，m=10000 时 5e-6，功效急剧下降","门槛缩小 m 倍，需要的效应量或 n 相应增大"],
      ["定义 FDR = E[V/R]（V 假阳数，R 拒绝总数，R=0 时取 0）","FWER 问“V≥1 的概率”，FDR 问“V 占 R 的期望比例”，后者在 R 大时宽松得多"],
      ["BH：排序 p_(1)≤…≤p_(m)，取 k*=max{k: p_(k)≤kq/m}，拒绝前 k* 个","门槛随排名线性上升：第 1 个用 q/m，第 m 个用 q；比 Bonferroni 只对最小 p 严格"],
      ["独立（或正相关）时 BH 保证 FDR ≤ (m₀/m)q ≤ q","Benjamini-Hochberg 1995 定理；直观：真零假设的 p 均匀分布，其落入前 k 名的期望数≈m₀·kq/m，除以 k 得 ≤ q"],
      ["组学里 m 大、真效应多，允许 5% 假阳换 10 倍功效是合理交换；临床主终点一个都不许错，用 FWER","控制目标的选择是科学问题而非统计问题：错一个的代价是否致命"]
    ],
    end:"不校正 ⟹ 假阳几乎必然。Bonferroni 控 FWER（一个都不错），BH 控 FDR（阳性里错的比例）。选哪个取决于错一个的代价，不取决于哪个 p 更好看。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nm, reps, alpha = 100, 2000, 0.05\ndef bh(p, q):\n    o = np.argsort(p); ps = p[o]; k = np.where(ps <= (np.arange(1, m+1)*q/m))[0]\n    rej = np.zeros(m, bool)\n    if len(k): rej[o[:k.max()+1]] = True\n    return rej\nfw_raw = fw_bonf = 0; fdr_bh = []; pow_bh = pow_bonf = 0\nfor _ in range(reps):\n    true = np.zeros(m, bool); true[:20] = True            # 20 个真效应，80 个零\n    z = np.random.randn(m) + 3.0*true\n    p = 2*(1 - 0.5*(1+np.vectorize(__import__('math').erf)(np.abs(z)/np.sqrt(2))))\n    fw_raw  += (p[~true] < alpha).any()\n    fw_bonf += (p[~true] < alpha/m).any()\n    r = bh(p, 0.05); fdr_bh.append((r & ~true).sum()/max(r.sum(), 1))\n    pow_bh += (r & true).mean()*m/20; pow_bonf += (p[true] < alpha/m).mean()\nprint(f'm={m}  不校正 FWER={fw_raw/reps:.3f}  (理论 1-0.95^80={1-0.95**80:.3f})')\nprint(f'Bonferroni FWER={fw_bonf/reps:.3f}  功效={pow_bonf/reps:.3f}')\nprint(f'BH  FDR={np.mean(fdr_bh):.3f}  (目标 ≤ 0.05×80/100=0.04)  功效={pow_bh/reps:.3f}')",
    out:"m=100  不校正 FWER=0.978  (理论 1-0.95^80=0.983)\nBonferroni FWER=0.041  功效=0.322\nBH  FDR=0.040  (目标 ≤ 0.05×80/100=0.04)  功效=0.616",
    note:"fw_raw≈0.98 是第 1 步的 1−(1−α)^m₀；fw_bonf≤0.05 是第 2 步；BH 的 FDR≈0.04≤q·m₀/m 是第 6 步，且功效比 Bonferroni 高得多，是第 7 步的交换。"
  },
  contrast:[
    {vs:"Bonferroni（FWER 控制）", same:"都是对 m 个 p 值做校正", diff:"Bonferroni 控“至少一个假阳”的概率，BH 控“假阳占阳性的比例”；前者严格得多", when:"少数几个关键假设、错一个就翻车用 Bonferroni；成千上万基因/峰用 BH"},
    {vs:"Holm 逐步法", same:"也控 FWER", diff:"Holm 从最小 p 开始逐个用 α/(m−i+1)，一致地比 Bonferroni 功效高且同样不需独立", when:"要 FWER 时优先 Holm，没理由用原版 Bonferroni"},
    {vs:"q 值", same:"都是 FDR 框架", diff:"q 值是每个检验的“最小 FDR 使它被拒绝”，还估计了 m₀/m（π₀）", when:"报告单个特征的 FDR 用 q 值；只要一个阈值用 BH"}
  ],
  ext:[
    {t:"p 在 H0 下均匀是这一切的起点", go:"si.pvalue"},
    {t:"看着数据挑分析等价于隐性的多重检验", go:"si.preregistration"},
    {t:"序贯观察也是多重检验", go:"ex.ab_sequential"}
  ]
},

"si.bootstrap": {
  layers:{
    alg:"总体分布 F 未知，用经验分布 F̂ₙ（每个观测点质量 1/n）代替。从 F̂ₙ 有放回抽 n 个得 x*，算 θ̂*=θ̂(x*)，重复 B 次。θ̂* 的标准差 ≈ θ̂ 的标准误，θ̂* 的分位数 ≈ CI。",
    geo:"真世界：从总体 F 抽样得 θ̂，它围绕 θ 抖。bootstrap 世界：从样本 F̂ₙ 抽样得 θ̂*，它围绕 θ̂ 抖。两个世界的“抖动幅度”几乎一样，因为 F̂ₙ 长得像 F。这是一个嵌套的自相似结构。",
    comp:"B 次：np.random.choice(x, n, replace=True) → 算统计量。O(B·cost(θ̂))。B=1000 够算 SE，B≥2000 算分位 CI。统计量任意复杂都行，这是它的全部价值。"
  },
  proof:{
    from:"样本 x₁..xₙ iid ~ F；统计量 θ̂=θ̂(x)；经验分布 F̂ₙ 在每个 xᵢ 放质量 1/n",
    to:"Var_{F̂ₙ}(θ̂*) ≈ Var_F(θ̂)，所以 bootstrap 样本的标准差是 SE 的一致估计；对均值可显式验证",
    steps:[
      ["Glivenko-Cantelli：sup|F̂ₙ−F|→0 几乎必然","经验分布一致收敛到真分布，所以“用 F̂ₙ 代替 F”在 n 大时误差趋零"],
      ["SE(θ̂) 是 F 的一个泛函 σ(F)；bootstrap 估计 σ(F̂ₙ)","标准误由分布决定；插入原理（plug-in）：把未知的 F 换成已知的 F̂ₙ"],
      ["若 σ(·) 在 F 处连续，则 σ(F̂ₙ)→σ(F)","连续泛函 + 参数收敛 ⟹ 泛函值收敛"],
      ["对均值：从 F̂ₙ 抽一个 x* 的方差 = (1/n)Σ(xᵢ−x̄)² = σ̂²（分母 n）","F̂ₙ 是离散均匀分布，其方差就是样本的总体方差"],
      ["x̄* 是 n 个独立 x* 的均值，Var(x̄*) = σ̂²/n","独立同分布均值的方差 = 单个方差 / n；这在 bootstrap 世界里精确成立"],
      ["所以 bootstrap SE ≈ σ̂/√n ≈ s/√n（差一个 √((n−1)/n)）","与解析 SEM 只差分母 n 与 n−1 的区别，验证了插入原理"],
      ["对中位数、AUC、比值等无解析 SE 的统计量，第 2-3 步同样成立，只是 σ(·) 没有闭式","推导没用到“均值”的任何特殊性质，只用了连续性；这就是 bootstrap 通用的原因"]
    ],
    end:"bootstrap = 插入原理：SE 是分布的函数，把分布换成经验分布就能算。对均值可以手算验证它与 s/√n 一致，对复杂统计量则是唯一可行的路。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nn, B = 30, 4000\nx = np.random.exponential(2.0, n)              # 偏态总体，真均值 2\nboot_mean = np.array([np.random.choice(x, n, replace=True).mean() for _ in range(B)])\nboot_med  = np.array([np.median(np.random.choice(x, n, replace=True)) for _ in range(B)])\nprint(f'解析 SEM = s/√n = {x.std(ddof=1)/np.sqrt(n):.4f}')\nprint(f'bootstrap SE(均值) = {boot_mean.std(ddof=1):.4f}   插入理论值 σ̂/√n = {x.std()/np.sqrt(n):.4f}')\nprint(f'bootstrap 95% CI(均值) = [{np.percentile(boot_mean,2.5):.3f}, {np.percentile(boot_mean,97.5):.3f}]')\nprint(f'bootstrap SE(中位数) = {boot_med.std(ddof=1):.4f}   (中位数没有简单解析 SE)')\n# 真实抽样分布对照：从总体反复抽 n 个\ntrue_se = np.array([np.random.exponential(2.0, n).mean() for _ in range(4000)]).std()\nprint(f'真实 SE(均值)（重复抽总体）= {true_se:.4f}')",
    out:"解析 SEM = s/√n = 0.3597\nbootstrap SE(均值) = 0.3484   插入理论值 σ̂/√n = 0.3537\nbootstrap 95% CI(均值) = [1.765, 3.105]\nbootstrap SE(中位数) = 0.4171   (中位数没有简单解析 SE)\n真实 SE(均值)（重复抽总体）= 0.3604",
    note:"boot_mean.std 对应第 5-6 步，与 s/√n、σ̂/√n 三者接近；boot_med 是第 7 步（无解析解也能算）；最后一行“真实 SE”是第 2 步所要逼近的目标。"
  },
  contrast:[
    {vs:"置换检验", same:"都是重采样、都不假设分布", diff:"bootstrap 有放回、估计一个量的不确定度；置换无放回打乱标签、检验零假设", when:"要 CI/SE 用 bootstrap；要 p 值用置换"},
    {vs:"解析 SEM = s/√n", same:"都估计均值的标准误", diff:"解析式只对均值（和少数统计量）有；bootstrap 对任何统计量通用，代价是 B 倍计算", when:"均值直接用 s/√n；中位数、AUC、比值、模型系数用 bootstrap"},
    {vs:"交叉验证", same:"都是对样本重复利用", diff:"CV 无放回切分评估泛化误差；bootstrap 有放回评估统计量波动", when:"评估模型性能用 CV；评估估计值的不确定度用 bootstrap"}
  ],
  ext:[
    {t:"bootstrap 分位区间也是一种 CI，覆盖率可以模拟验证", go:"si.confidence_interval"},
    {t:"随机森林的 bagging 就是对模型做 bootstrap", go:"ml.forest"},
    {t:"效应量 d 的 CI 用 bootstrap 给", go:"si.effect_size"}
  ]
},

"si.permutation": {
  layers:{
    alg:"H0：标签与数据无关（可交换）。观测统计量 T_obs（如均值差）。随机打乱标签 B 次，每次算 T*，p = (#{|T*|≥|T_obs|}+1)/(B+1)。零分布由数据自己造，不用任何公式。",
    geo:"把两组数据倒进一个桶，重新随机分成两堆算均值差，得一个点；重复几千次画出一座山，这座山就是零分布。你的观测差在山的哪里，尾巴面积就是 p。",
    comp:"B 次 np.random.permutation + 一次统计量。O(B·n)。n₁+n₂≤20 可以穷举全部 C(n,n₁) 种分法得精确 p。统计量随便换（中位数差、AUC、相关系数）。"
  },
  proof:{
    from:"H0：所有 n=n₁+n₂ 个观测来自同一分布（可交换）；给定观测值的多重集合，每种标签分配等可能",
    to:"置换 p 值在 H0 下是精确的（P(p≤α)≤α），无需分布假设；对均值差它与 t 检验在 n 大时给出几乎相同的 p",
    steps:[
      ["H0 下以观测值的集合为条件，标签是均匀随机分配的","可交换性的定义：任意置换联合分布不变，所以条件在数值上，哪 n₁ 个被标为“处理”是均匀的"],
      ["于是 T 在 H0 下的条件分布就是遍历全部 C(n,n₁) 种分配算出的 T 的分布","这是零分布的定义，直接从 H0 构造，没有任何近似"],
      ["精确 p = #{分配: |T*|≥|T_obs|}/C(n,n₁)","尾概率的定义；观测分配也是其中一种，所以 p≥1/C(n,n₁)"],
      ["P(p≤α | H0) ≤ α","p 是离散均匀变量的秩函数，秩的尾概率不超过 α；这是精确性，不依赖 n 大"],
      ["蒙特卡洛：随机抽 B 种分配估计上式，加 1 修正 p=(k+1)/(B+1)","把观测分配算作一次抽样，保证估计的 p 仍满足第 4 步的性质"],
      ["对均值差：T* 的方差 ≈ σ²(1/n₁+1/n₂)，与 t 检验的 SE² 相同","有限总体抽样的方差公式；这解释了为什么置换 p 与 t 检验 p 在正态数据上几乎相同"],
      ["数据偏态或异常值时 t 分布不成立，置换仍精确","第 1-4 步没用到正态性，只用了可交换；t 检验用了正态或 CLT"]
    ],
    end:"置换检验把“标签无关”直接变成“标签可打乱”，零分布由数据自己生成，精确且零假设。t 检验是它在正态数据上的公式化近似。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np, math\ndef t_pdf(x, df):\n    c = math.exp(math.lgamma((df+1)/2) - math.lgamma(df/2)) / math.sqrt(df*math.pi)\n    return c * (1 + x*x/df) ** (-(df+1)/2)\ndef t_cdf(t, df):                       # 数值积分，不用 scipy\n    x = np.linspace(-60, t, 400001); return float(np.trapezoid(t_pdf(x, df), x))\ndef p_two(t, df): return 2*(1 - t_cdf(abs(t), df))\nnp.random.seed(0)\nn1, n2 = 12, 12\nx = np.random.normal(0.9, 1, n1); y = np.random.normal(0, 1, n2)\ndef perm_p(x, y, B=20000):\n    n1 = len(x); pool = np.r_[x, y]; obs = x.mean()-y.mean(); k = 0\n    for _ in range(B):\n        s = np.random.permutation(pool)          # 打乱标签\n        k += abs(s[:n1].mean()-s[n1:].mean()) >= abs(obs)\n    return (k+1)/(B+1)\nt = (x.mean()-y.mean())/math.sqrt(x.var(ddof=1)/n1 + y.var(ddof=1)/n2)\nprint(f'正态数据   t 检验 p={p_two(t, n1+n2-2):.4f}   置换 p={perm_p(x, y):.4f}')\n# 偏态+异常值：t 检验假设不成立，置换仍精确\nnp.random.seed(1)\nxs = np.random.exponential(1, n1); ys = np.random.exponential(1, n2); xs[0] += 8   # 一个异常值\nt = (xs.mean()-ys.mean())/math.sqrt(xs.var(ddof=1)/n1 + ys.var(ddof=1)/n2)\nprint(f'偏态+异常值 t 检验 p={p_two(t, n1+n2-2):.4f}   置换 p={perm_p(xs, ys):.4f}')\n# H0 下置换 p 均匀（精确性）\nnp.random.seed(2); ps = [perm_p(np.random.randn(8), np.random.randn(8), 400) for _ in range(500)]\nprint(f'H0 下 P(置换 p<0.05) = {np.mean(np.array(ps) < 0.05):.3f}')",
    out:"正态数据   t 检验 p=0.0008   置换 p=0.0005\n偏态+异常值 t 检验 p=0.8048   置换 p=0.9262\nH0 下 P(置换 p<0.05) = 0.036",
    note:"perm_p 里的 permutation 是第 1-2 步造零分布，(k+1)/(B+1) 是第 5 步；第一行与 t 检验 p 接近是第 6 步；最后一行 ≤0.05 是第 4 步的精确性。"
  },
  contrast:[
    {vs:"t 检验", same:"都检验两组均值是否不同", diff:"t 用公式零分布（需正态/CLT），置换用数据自造零分布（只需可交换）", when:"n 小、偏态、异常值多、统计量非均值时用置换；正态大样本两者等价"},
    {vs:"bootstrap", same:"都是重采样", diff:"bootstrap 有放回、估计不确定度；置换无放回打乱标签、检验 H0", when:"问“差多少”用 bootstrap；问“有没有差”用置换"},
    {vs:"Mann-Whitney U（秩和检验）", same:"都是非参数检验", diff:"U 检验是把数据换成秩后的置换检验，对异常值更钝但丢信息", when:"只关心排序、异常值极端时用 U；想保留原始尺度用置换"}
  ],
  ext:[
    {t:"可交换性在实验设计中的保证：随机化", go:"ex.randomization"},
    {t:"伪重复破坏可交换性，置换单位必须是独立单位", go:"si.assumptions"},
    {t:"不确定度估计的对偶方法", go:"si.bootstrap"}
  ]
},

"si.bayes_factor": {
  layers:{
    alg:"BF₁₀ = p(D|H1)/p(D|H0)，其中 p(D|H1)=∫p(D|θ)p(θ|H1)dθ 是把 H1 下所有参数取值按先验加权的似然。后验比 = 先验比 × BF。BF<1 就是数据支持 H0。",
    geo:"两条“预测曲线”：H0 把所有预测质量堆在 0 附近；H1 把质量摊在一个宽范围上。数据落在哪，谁在那里的密度高谁就赢。H1 摊得越宽，落在任何一点的密度越低——复杂假设自动被罚。",
    comp:"共轭情形闭式：x̄ 在 H0 下 ~ N(0,σ²/n)，H1 下 ~ N(0,σ²/n+τ²)，两个正态密度之比。一般情形要数值积分或 MCMC。计算量在于积分，而 p 值只算一个尾面积。"
  },
  proof:{
    from:"数据 D；H0: μ=0；H1: μ~N(0,τ²)；x̄|μ ~ N(μ,σ²/n)，σ 已知",
    to:"BF₁₀ 有闭式，且固定 p=0.05（z=1.96）时 n→∞ BF₁₀→0：同一个 p 在大 n 下反而支持 H0（Lindley 悖论）",
    steps:[
      ["贝叶斯定理：P(H1|D)/P(H0|D) = [P(H1)/P(H0)] × [p(D|H1)/p(D|H0)]","两次贝叶斯定理相除，p(D) 消掉；把“证据”与“先验信念”乘法分离"],
      ["p(D|H0) = N(x̄; 0, σ²/n)","H0 是点假设，无参数可积，似然就是抽样分布"],
      ["p(D|H1) = ∫N(x̄; μ, σ²/n)N(μ; 0, τ²)dμ = N(x̄; 0, σ²/n+τ²)","正态-正态卷积仍正态，方差相加；H1 的预测更“散”"],
      ["BF₁₀ = √(v₀/(v₀+τ²))·exp[x̄²/2 · (1/v₀ − 1/(v₀+τ²))]，v₀=σ²/n","两个正态密度相除；前面的根号项 <1 是对 H1 复杂度的自动惩罚（Occam 因子）"],
      ["写 x̄=z√v₀，固定 z=1.96：BF₁₀ = √(v₀/(v₀+τ²))·exp[z²/2 · τ²/(v₀+τ²)]","代入；n→∞ 时 v₀→0"],
      ["n→∞：根号项→0，指数项→exp(z²/2)=6.8（有限），所以 BF₁₀→0","指数项有界而根号项趋零；同一个 p=0.05 在大样本下成为支持 H0 的证据"],
      ["BF 可以小于 1，表示 D 在 H0 下更可能；p 值不区分“无证据”与“支持 H0”","BF 计算了 H0 下的似然并与 H1 相比；p 只算 H0 下的尾概率，永远无法说“支持 H0”"]
    ],
    end:"BF 是两个假设对数据的预测密度之比。它罚复杂假设、能支持 H0，并揭示 p=0.05 在大 n 下其实是 H0 的证据。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np, math\nnp.random.seed(0)\ndef bf10(xbar, n, sigma=1.0, tau=1.0):\n    v0 = sigma**2/n; v1 = v0 + tau**2\n    return math.sqrt(v0/v1) * math.exp(xbar**2/2 * (1/v0 - 1/v1))\n# 固定 p=0.05 (z=1.96)，看 BF 随 n\nfor n in [10, 100, 1000, 100000]:\n    xbar = 1.96*math.sqrt(1/n)\n    print(f'n={n:>6}  x̄={xbar:.4f}  p=0.05  BF10={bf10(xbar, n):.3f}')\n# 蒙特卡洛验证闭式：H1 下 x̄ 的边际密度\nn, tau = 20, 1.0; mus = np.random.normal(0, tau, 400000)\nxb = np.random.normal(mus, 1/math.sqrt(n))\ngrid_x = 0.3; band = 0.01\ndens_mc = ((np.abs(xb-grid_x) < band).mean())/(2*band)\ndens_cf = math.exp(-grid_x**2/(2*(1/n+tau**2)))/math.sqrt(2*math.pi*(1/n+tau**2))\nprint(f'p(x̄=0.3|H1)  蒙特卡洛={dens_mc:.4f}  闭式={dens_cf:.4f}')\n# 真 H0 下的数据：BF 能支持 H0\nx = np.random.normal(0, 1, 200)\nprint(f'真 μ=0, n=200: BF10={bf10(x.mean(), 200):.3f}  → BF01={1/bf10(x.mean(),200):.1f} 支持 H0')",
    out:"n=    10  x̄=0.6198  p=0.05  BF10=1.728\nn=   100  x̄=0.1960  p=0.05  BF10=0.666\nn=  1000  x̄=0.0620  p=0.05  BF10=0.215\nn=100000  x̄=0.0062  p=0.05  BF10=0.022\np(x̄=0.3|H1)  蒙特卡洛=0.3819  闭式=0.3730\n真 μ=0, n=200: BF10=0.225  → BF01=4.4 支持 H0",
    note:"bf10 是第 4 步的闭式；前四行固定 z=1.96 时 BF 随 n 降到 <1 是第 5-6 步的 Lindley 悖论；蒙特卡洛密度 ≈ 闭式验证第 3 步；最后一行 BF01>1 是第 7 步“支持 H0”。"
  },
  contrast:[
    {vs:"p 值", same:"都是“数据对假设”的度量", diff:"p 只看 H0 下的尾概率；BF 比较 H0 与 H1 下的预测密度，能支持 H0、依赖 H1 的先验", when:"有合理 H1 先验且想表达“支持无效应”用 BF；只想控制长期错误率用 p"},
    {vs:"似然比（LR）", same:"都是两个似然之比", diff:"LR 用 H1 的最优参数（最大似然），BF 用先验加权平均；LR 永远偏向复杂模型，BF 自带 Occam 惩罚", when:"嵌套模型、大样本用 LR 检验；要罚复杂度用 BF 或 BIC（BIC 是 BF 的近似）"},
    {vs:"后验概率 P(H1|D)", same:"都在贝叶斯框架内", diff:"BF 不含先验比，后验概率 = 先验比 × BF 再归一化", when:"报 BF 让读者自带先验；决策时再乘先验得后验"}
  ],
  ext:[
    {t:"贝叶斯定理本体", go:"pr.bayes"},
    {t:"先验的选择即正则化", go:"pr.map_prior"},
    {t:"p 的含义与它缺的两项", go:"si.pvalue"}
  ]
},

"si.preregistration": {
  layers:{
    alg:"p 值的 α 保证要求分析规则 R 在看数据前固定：P(p_R<α|H0)=α。若 R 依赖数据（R=R(D)），实际报告的是 min_R p_R，其 H0 分布远不均匀。预注册 = 把 R 写死并有时间戳。",
    geo:"一条只看一次的均匀分布 p，落进 [0,0.05) 的概率是 5%。当你有 k 条自由度（k 个指标、k 个剔除规则、k 次中期查看），相当于抽 k 个 p 取最小值，最小值几乎必落进去。“研究者自由度”就是隐性的 m。",
    comp:"模拟：H0 下生成数据，允许“看 5 个指标挑最显著”“每 10 个样本查看一次、显著就停”“试 3 种剔除规则”，数最终 p<0.05 的比例。真实假阳率轻松 30-60%。"
  },
  proof:{
    from:"H0 下任意固定分析规则的 p ~ Uniform(0,1)（si.pvalue）；研究者有 k 个可选规则",
    to:"数据依赖的规则选择使实际假阳率 = P(min_i p_i < α) ≫ α；预注册把 k 压回 1 使 α 重新成立",
    steps:[
      ["设 k 个候选分析各给 p₁..p_k，H0 下每个均匀","每个规则单独看都是合法检验，问题不在单个规则"],
      ["“挑最显著的报告” ⟺ 报 p_min = min pᵢ","这就是 p-hacking 的数学定义：选择步骤本身是一次未记录的运算"],
      ["独立时 P(p_min<α) = 1−(1−α)^k；k=5 时 0.23，k=20 时 0.64","与多重检验同一个公式，只是这里的 m 没有被写出来"],
      ["中期查看（optional stopping）：每次查看都是一次新的检验，p 的路径以概率 1 迟早越过 α","布朗运动的重对数律：随机游走的标准化值必定无穷次越过任何固定阈值"],
      ["相关的候选分析（同一数据的不同剔除规则）使膨胀小于独立情形，但仍远大于 α","相关 p 值的最小值分布比独立情形集中，但仍偏向 0"],
      ["预注册固定 R：k=1，P(p<α|H0)=α 恢复","α 保证的前提就是 R 与 D 独立，预注册是让这个前提可被审核"],
      ["探索性分析仍可做，但必须标为探索并在新数据上确认","探索产生的 p 是 p_min，不能当作确认性证据；新数据上的 p 才是 k=1 的"]
    ],
    end:"p 的错误率保证只对“先定规则再看数据”成立。每一个看着数据做的选择都是隐性的多重检验。预注册不是流程，是让 α 重新等于 α 的数学条件。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nPhi = lambda z: 0.5*(1+__import__('math').erf(z/2**0.5))\ndef p_of(x, y):\n    t = (x.mean()-y.mean())/np.sqrt(x.var(ddof=1)/len(x) + y.var(ddof=1)/len(y))\n    return 2*(1-Phi(abs(t)))\nreps, n = 3000, 40\nhonest = hack_outcome = hack_stop = hack_all = 0\nfor _ in range(reps):\n    X = np.random.randn(n, 5); Y = np.random.randn(n, 5)           # H0 真，5 个指标\n    honest += p_of(X[:,0], Y[:,0]) < 0.05                          # 预注册：只看指标 0、只看一次\n    hack_outcome += min(p_of(X[:,j], Y[:,j]) for j in range(5)) < 0.05   # 挑最显著的指标\n    stop = any(p_of(X[:m,0], Y[:m,0]) < 0.05 for m in range(10, n+1, 5))  # 每加 5 个样本看一次\n    hack_stop += stop\n    hack_all += any(p_of(X[:m,j], Y[:m,j]) < 0.05 for m in range(10, n+1, 5) for j in range(5))\nprint(f'预注册（1指标、看1次）  假阳率={honest/reps:.3f}')\nprint(f'5 个指标挑最小 p        假阳率={hack_outcome/reps:.3f}   独立理论 1-0.95^5={1-0.95**5:.3f}')\nprint(f'每 5 个样本看一次、显著就停 假阳率={hack_stop/reps:.3f}')\nprint(f'两者都用                假阳率={hack_all/reps:.3f}')",
    out:"预注册（1指标、看1次）  假阳率=0.042\n5 个指标挑最小 p        假阳率=0.230   独立理论 1-0.95^5=0.226\n每 5 个样本看一次、显著就停 假阳率=0.169\n两者都用                假阳率=0.622",
    note:"honest≈0.05 是第 6 步（k=1）；hack_outcome≈0.23 是第 2-3 步的 p_min；hack_stop 是第 4 步的中期查看；两者叠加超过 50%，是第 7 步为什么探索性 p 不能当确认。"
  },
  contrast:[
    {vs:"多重检验校正", same:"都是“做了很多次只报一次”的问题", diff:"多重检验的 m 是显性的、可校正；p-hacking 的 k 是隐性的、没人记录，无法事后校正", when:"能列出全部候选分析就校正；列不出来只能预注册"},
    {vs:"探索性分析（EDA）", same:"都是看着数据做选择", diff:"EDA 合法且必要，只要不把产生的 p 当确认性证据", when:"先探索生成假设，再预注册在新数据上确认"},
    {vs:"序贯检验（alpha spending）", same:"都涉及中期查看", diff:"序贯设计事先把 α 分配到每次查看，是合法的多次查看；optional stopping 没分配", when:"必须中期看数据（临床安全）用预先设计的序贯方案"}
  ],
  ext:[
    {t:"显性多重检验的校正方法", go:"si.multiple_testing"},
    {t:"合法的多次查看：序贯设计", go:"ex.ab_sequential"},
    {t:"p 在 H0 下均匀是这一切的前提", go:"si.pvalue"}
  ]
},

"si.assumptions": {
  layers:{
    alg:"t 检验假设：独立、（近似）正态、等方差。SE=s/√n 的 √n 来自 Var(Σxᵢ)=Σ Var(xᵢ)，这一步只在独立时成立。相关观测的 Var(x̄) = σ²/n·[1+(k−1)ρ]，k 为簇大小、ρ 为簇内相关。",
    geo:"4 只小鼠各测 10 个细胞：40 个点其实是 4 团。团内的点互相抄袭，独立信息只有 4 份。把 40 当 n，SE 被缩小约 √(1+9ρ) 倍，t 被放大同样倍数。正态性不重要是因为均值的分布在 CLT 下自动变正态。",
    comp:"检查独立性看设计不看数据：谁是随机分配的单位，n 就是谁。等方差用 Welch 修正（分别用 s₁²/n₁+s₂²/n₂，df 用 Welch-Satterthwaite）。正态性在 n≥20 时几乎不用管，除非极端偏态或异常值。"
  },
  proof:{
    from:"观测分 m 个簇每簇 k 个：xᵢⱼ=μ+aᵢ+eᵢⱼ，Var(a)=σ_a²，Var(e)=σ_e²，簇内相关 ρ=σ_a²/(σ_a²+σ_e²)",
    to:"把 mk 当 n 时 SE 被低估 √(1+(k−1)ρ) 倍（设计效应），假阳率远超 α；正确做法是以簇均值为单位 n=m",
    steps:[
      ["总方差 σ²=σ_a²+σ_e²；同簇两观测协方差 = σ_a²","共享同一个 aᵢ；不同簇协方差为 0"],
      ["Var(x̄) = (1/(mk)²)[mk·σ² + mk(k−1)·σ_a²] = σ²/(mk)·[1+(k−1)ρ]","方差展开：mk 个对角项 + 每簇 k(k−1) 个同簇协方差项；括号里就是设计效应"],
      ["天真 SE² = s²/(mk) 估计的是 σ²/(mk)，漏掉 [1+(k−1)ρ] 因子","s² 估的是 σ²（总方差），它不知道观测之间是相关的"],
      ["ρ=0.5，k=10：设计效应 = 5.5，t 被放大 √5.5≈2.3 倍","纯代数；真实 α=0.05 的检验实际拒绝率变成 P(|Z|>1.96/2.3)≈0.40"],
      ["以簇均值 x̄ᵢ 为单位：x̄ᵢ 独立，Var(x̄ᵢ)=σ_a²+σ_e²/k，n=m 的 t 检验重新合法","不同簇的 aᵢ 独立；簇均值把簇内相关全部吸收进一个独立单位"],
      ["正态性：x̄ 在 CLT 下趋于正态，与总体形状无关；t 对此稳健","t 统计量只依赖 x̄ 和 s 的分布；n≥20-30 时非极端偏态影响可忽略"],
      ["等方差：Welch 用 s₁²/n₁+s₂²/n₂ 直接估 Var(x̄₁−x̄₂)，不合并","合并方差在 n 不等、σ 不等时偏向大 n 组，Welch 无此偏差且几乎没有功效损失"]
    ],
    end:"独立性是 SE 公式里 √n 的来源，破坏它没有救。伪重复把 SE 缩小 √设计效应倍，p 小几个数量级。n = 独立分配单位数，永远。"
  },
  scratch:{
    lang:'python',
    code:"import numpy as np\nnp.random.seed(0)\nPhi = lambda z: 0.5*(1+__import__('math').erf(z/2**0.5))\ndef p_of(x, y):\n    t = (x.mean()-y.mean())/np.sqrt(x.var(ddof=1)/len(x) + y.var(ddof=1)/len(y))\n    return 2*(1-Phi(abs(t)))\nm, k, rho, reps = 4, 10, 0.5, 3000        # 每组 4 只鼠，每只 10 个细胞，簇内相关 0.5\nsa, se = np.sqrt(rho), np.sqrt(1-rho)\nfp_cell = fp_mouse = 0\nfor _ in range(reps):\n    def group(): a = np.random.normal(0, sa, m); return a[:,None] + np.random.normal(0, se, (m, k))\n    A, B = group(), group()                # H0 真：两组无差\n    fp_cell  += p_of(A.ravel(), B.ravel()) < 0.05          # 把 40 个细胞当 n\n    a, b = A.mean(1), B.mean(1); t_m = (a.mean()-b.mean())/np.sqrt(a.var(ddof=1)/m + b.var(ddof=1)/m)\n    fp_mouse += abs(t_m) > 2.447                             # 把 4 只鼠当 n，df=6 的 t 临界值\ndeff = 1 + (k-1)*rho\nprint(f'设计效应 1+(k-1)ρ = {deff:.1f}  SE 被低估 {np.sqrt(deff):.2f} 倍')\nprint(f'H0 下假阳率  细胞当 n: {fp_cell/reps:.3f}   小鼠当 n: {fp_mouse/reps:.3f}')\nprint(f'理论: 细胞当 n 的假阳率 ≈ P(|Z|>1.96/{np.sqrt(deff):.2f}) = {2*(1-Phi(1.96/np.sqrt(deff))):.3f}')\n# Welch vs 合并方差：方差不等 + n 不等\nfp_pool = fp_welch = 0\nfor _ in range(reps):\n    x = np.random.normal(0, 4, 8); y = np.random.normal(0, 1, 40)\n    sp = np.sqrt(((7*x.var(ddof=1) + 39*y.var(ddof=1))/46) * (1/8 + 1/40))\n    fp_pool  += abs((x.mean()-y.mean())/sp) > 2.01\n    tw = (x.mean()-y.mean())/np.sqrt(x.var(ddof=1)/8 + y.var(ddof=1)/40)\n    fp_welch += abs(tw) > 2.36                    # Welch-Satterthwaite df≈7.2 的 t 临界值\nprint(f'方差不等(4 vs 1) n 不等(8 vs 40)  合并方差假阳率={fp_pool/reps:.3f}  Welch={fp_welch/reps:.3f}')",
    out:"设计效应 1+(k-1)ρ = 5.5  SE 被低估 2.35 倍\nH0 下假阳率  细胞当 n: 0.455   小鼠当 n: 0.050\n理论: 细胞当 n 的假阳率 ≈ P(|Z|>1.96/2.35) = 0.403\n方差不等(4 vs 1) n 不等(8 vs 40)  合并方差假阳率=0.350  Welch=0.052",
    note:"fp_cell≈0.4 与理论 P(|Z|>1.96/√5.5) 吻合，是第 2-4 步的设计效应；fp_mouse 回到 ≈0.05 是第 5 步；最后一行小组方差大时合并方差假阳率膨胀到 0.05 的几倍而 Welch 正常，是第 7 步。"
  },
  contrast:[
    {vs:"混合效应模型", same:"都处理簇结构数据", diff:"簇均值 t 检验丢掉簇内信息但简单正确；混合模型同时估 σ_a、σ_e，能利用不平衡设计", when:"簇数少、每簇均衡用簇均值；簇数多、不均衡、有簇内协变量用混合模型"},
    {vs:"Welch t 检验", same:"都是 t 检验", diff:"Welch 放弃等方差假设，df 由 Welch-Satterthwaite 公式给；几乎总是更安全", when:"默认用 Welch；只有明确知道方差相等且 n 很小才用合并"},
    {vs:"非参数检验（Mann-Whitney）", same:"都是应对假设不满足的办法", diff:"非参数解决的是正态性，不解决独立性；伪重复照样让它出错", when:"偏态/异常值用非参数；伪重复必须改分析单位，换检验没用"}
  ],
  ext:[
    {t:"技术重复 vs 生物重复：n 是谁", go:"ex.replicate_level"},
    {t:"CLT 为什么让正态性不重要", go:"pr.clt"},
    {t:"置换检验也要求以独立单位置换", go:"si.permutation"}
  ]
}

});
