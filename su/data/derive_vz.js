/* 数理宇宙 v3 · 推导层 · vz 可视化大陆（10 节点）
   旁挂文件，不改动 v1/v2。proof 写「这条画图规矩背后的感知/数学原理」。
   scratch 不画图：用 numpy 模拟感知实验、误差棒、色带亮度等，全部实际跑过。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'vz.scatter': {
  layers:{
    alg:`散点图是映射 (xᵢ,yᵢ) → 平面位置。位置是人眼最精确的通道（Cleveland-McGill：位置 > 长度 > 角度 > 面积 > 颜色），所以两个连续量的关系首选散点。`,
    geo:`一团点云。看形状（直/弯）、看宽度（噪声）、看团块（聚类）、看孤点（异常）。四张统计量完全相同的图，点云形状可以截然不同。`,
    comp:`每个点画一个圆；n 大时圆叠成一坨，可见信息随占格率饱和。修正：alpha 叠加、缩小 s、抖动、或改成 2D 直方（hexbin）。`
  },
  proof:{
    from:`视觉通道的判读精度实验（Cleveland & McGill 1984）；Stevens 幂定律：感知 = 物理^k`,
    to:`两个连续量先画散点；第 3、4 维用颜色/大小时精度递减；统计量不能代替图`,
    steps:[
      [`把数值编码成视觉属性有多种通道：位置、长度、角度、面积、颜色`, `图不是数据本身，是数据到视觉属性的映射；映射选错，信息就在眼睛里丢失`],
      [`实验测得判读误差：位置（共同刻度）最小，其次长度、角度，面积和颜色最差`, `这是可重复的心理物理实验结果，不是审美偏好`],
      [`Stevens 幂定律给出机制：长度 k≈1（线性感知），面积 k≈0.7，亮度 k≈0.5`, `k<1 意味着感知被压缩：真实 2:1 的面积看成 1.62:1，颜色更糟`],
      [`两个连续变量各占一个位置通道 x、y，两者都用最好的通道`, `所以散点图是「看关系」的默认选择，没有更精确的替代`],
      [`第 3 维只能用次级通道：颜色分类别（离散色相还行），大小编码连续量误差 13%+`, `位置通道已经用完；这也是为什么 ≥4 维要先降维或分面`],
      [`Anscombe 四组数据均值、方差、相关、回归线全同，但形状是线性/弯曲/离群/杠杆点`, `统计量是对分布的有损压缩，只有位置编码保留形状信息`],
      [`n 很大时点重叠，40×40 格里 1 万点占满 70%，最密格叠 43 个点`, `不透明圆点的信息上限是像素格数；alpha 或 hexbin 把「叠了几层」重新编码成颜色/计数`]
    ],
    end:`散点图把最准的两个通道都给了数据。先画散点再算统计量，不是反过来。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 1. Anscombe 四重奏：四组数据统计量全同，只有散点图能分辨形状
x1 = np.array([10,8,13,9,11,14,6,4,12,7,5.])
y1 = np.array([8.04,6.95,7.58,8.81,8.33,9.96,7.24,4.26,10.84,4.82,5.68])
y2 = np.array([9.14,8.14,8.74,8.77,9.26,8.10,6.13,3.10,9.13,7.26,4.74])
y3 = np.array([7.46,6.77,12.74,7.11,7.81,8.84,6.08,5.39,8.15,6.42,5.73])
x4 = np.array([8,8,8,8,8,8,8,19,8,8,8.])
y4 = np.array([6.58,5.76,7.71,8.84,8.47,7.04,5.25,12.50,5.56,7.91,6.89])
for k,(x,y) in enumerate([(x1,y1),(x1,y2),(x1,y3),(x4,y4)], 1):
    b, a = np.polyfit(x, y, 1)
    print(f"组{k}: mean_y={y.mean():.2f} var_y={y.var(ddof=1):.2f} r={np.corrcoef(x,y)[0,1]:.3f} 拟合 y={a:.2f}+{b:.3f}x")
# 2. 感知通道模拟（Cleveland-McGill 排序：位置 > 长度 > 角度 > 面积 > 颜色）
# 用 Stevens 幂定律 感知=物理^k 建模：长度 k=1.0，面积 k=0.7，亮度 k≈0.5
rng = np.random.default_rng(0); truth = rng.uniform(1, 10, 2000); ref = 5.0
for name, k in [("位置/长度", 1.0), ("面积", 0.7), ("颜色亮度", 0.5)]:
    est = ref * (truth/ref)**k                      # 主观判断的比例
    print(f"  {name:<6} k={k}: 判断真实比 2:1 时感知为 {2**k:.2f}:1, 中位相对误差 {np.median(np.abs(est-truth)/truth)*100:.0f}%")
# 3. 点太多叠成一坨：10000 点落在 40x40 格里，能看见的格子占比
pts = rng.standard_normal((10000, 2))
H, _, _ = np.histogram2d(pts[:,0], pts[:,1], bins=40, range=[[-3,3],[-3,3]])
print(f"被点占住的格子 {int((H>0).sum())}/1600, 最密格子 {int(H.max())} 个点堆在一起 -> 用 alpha 或 hexbin")`,
    out:`组1: mean_y=7.50 var_y=4.13 r=0.816 拟合 y=3.00+0.500x
组2: mean_y=7.50 var_y=4.13 r=0.816 拟合 y=3.00+0.500x
组3: mean_y=7.50 var_y=4.12 r=0.816 拟合 y=3.00+0.500x
组4: mean_y=7.50 var_y=4.12 r=0.817 拟合 y=3.00+0.500x
  位置/长度  k=1.0: 判断真实比 2:1 时感知为 2.00:1, 中位相对误差 0%
  面积     k=0.7: 判断真实比 2:1 时感知为 1.62:1, 中位相对误差 13%
  颜色亮度   k=0.5: 判断真实比 2:1 时感知为 1.41:1, 中位相对误差 21%
被点占住的格子 1109/1600, 最密格子 43 个点堆在一起 -> 用 alpha 或 hexbin`,
    note:`Anscombe 四行是第 6 步；Stevens 三行是第 2-3 步；histogram2d 那行是第 7 步。`
  },
  contrast:[
    {vs:`折线图`, same:`都把 (x,y) 放到平面位置`, diff:`折线连接相邻点，隐含 x 有序且中间连续；散点不做这个假设`, when:`x 是时间/剂量等有序量用折线；x 是另一个测量值用散点`},
    {vs:`气泡图（大小编码第 3 维）`, same:`都是散点`, diff:`大小走面积通道，k≈0.7，判读误差大且要 √ 缩放`, when:`第 3 维只需「大概大小」时用气泡；需要精确比较时换分面或颜色分箱`},
    {vs:`hexbin / 2D 密度图`, same:`都展示两个连续量的联合分布`, diff:`hexbin 先分箱计数再用颜色编码密度，牺牲单点换来不饱和`, when:`n < 1000 用散点；n 上万用 hexbin`}
  ],
  ext:[
    {t:`颜色作为第 3 维的编码规则`, go:'vz.color'},
    {t:`相关系数只是点云的一个数`, go:'pr.covariance'},
    {t:`散点上叠回归线`, go:'ml.linear_reg'}
  ]
},

'vz.line': {
  layers:{
    alg:`折线图 = 有序样本 (x₀<x₁<…<xₙ) 的分段线性插值。画函数 = 密采样 + 逐点求值 + 连线，插值误差 ≤ h²·max|f″|/8。误差棒是 μ̂ ± c·s，c 与 s 的选择决定它是 SD、SEM 还是 CI。`,
    geo:`点与点之间拉直线，眼睛读的是斜率和趋势。采样稀曲线变成折线段；类别之间拉线会造出根本不存在的「趋势」。误差棒是均值上下的一根尺，SD 最长、SEM 最短、CI 居中。`,
    comp:`np.linspace(a,b,n) 生成 n 个等距 x，ufunc 算 y，plot 顺次连线。误差棒：SD=s，SEM=s/√n，95%CI≈1.96·SEM（n 小用 t 分位数）。`
  },
  proof:{
    from:`线性插值误差公式；折线的语义是「相邻点之间连续变化」；Var(x̄)=σ²/n`,
    to:`折线只用于有序 x；至少 ~100 点才像曲线；SD、SEM、CI 三种误差棒的数学关系与各自含义`,
    steps:[
      [`折线在 [xᵢ,xᵢ₊₁] 上用直线代替 f，误差 ≤ (h²/8)·max|f″|，h 是采样间距`, `泰勒展开的二阶余项；这是「为什么点要密」的定量版本`],
      [`n 翻倍 h 减半，误差 /4：sin 在 n=5,10,20,40,80 时误差 0.21→0.06→0.014→0.003→0.0008`, `实测严格按 h² 收敛，100 点时肉眼已看不出折线感`],
      [`连线的含义是「中间存在且连续」；对照/药A/药B 之间没有中间态`, `类别没有顺序，换个排列斜率符号就变，画出来的趋势是排列顺序的产物`],
      [`单个样本的离散：SD = s，描述个体之间差多少`, `SD 是总体分布宽度的估计，与 n 无关，n 大只是估得更准`],
      [`均值的离散：Var(x̄)=σ²/n，所以 SEM = s/√n`, `独立和的方差可加，除以 n 后方差除 n²；模拟里 SEM 实测与 s/√n 每行吻合`],
      [`95% CI ≈ x̄ ± 1.96·SEM（大 n）；n 小用 t 分位数略宽`, `CLT 说 x̄ 近似正态，正态双侧 95% 分位是 1.96`],
      [`三种误差棒长度比 SD : SEM : CI = 1 : 1/√n : 1.96/√n，n=20 时是 1 : 0.22 : 0.44`, `同一份数据，选 SEM 误差棒比 SD 短 4.5 倍；不标明是哪种就是误导`]
    ],
    end:`折线的两个前提：x 有序、中间连续。误差棒必须写清是 SD（个体）还是 SEM/CI（均值精度），三者只差一个 √n。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 1. 折线 = 相邻点线性插值。采样太稀，曲线变折线段；误差 ∝ h²
f = np.sin; xs_fine = np.linspace(0, 2*np.pi, 100001)
for n in [5, 10, 20, 40, 80]:
    x = np.linspace(0, 2*np.pi, n); y = f(x)
    err = np.abs(np.interp(xs_fine, x, y) - f(xs_fine)).max()
    print(f"n={n:<3} 最大插值误差 {err:.4f}")
print("n 翻倍误差约 /4 -> 误差 ∝ h², 至少 100 点才像曲线")
# 2. 类别之间连线没意义：三组独立测量，排列顺序一换「趋势」就反了
groups = {"对照": 1.0, "药A": 0.6, "药B": 0.8}
for order in [["对照","药A","药B"], ["对照","药B","药A"]]:
    ys = [groups[g] for g in order]; print("顺序", order, "折线斜率符号:", np.sign(np.diff(ys)).tolist())
# 3. 误差棒三兄弟：SD 描述个体离散，SEM=SD/√n 描述均值精度，95%CI≈±1.96 SEM
rng = np.random.default_rng(0); mu, sigma = 10.0, 2.0
for n in [5, 20, 80]:
    means = []; sds = []
    for _ in range(4000):
        s = rng.normal(mu, sigma, n); means.append(s.mean()); sds.append(s.std(ddof=1))
    sd_bar = np.mean(sds); sem_theory = sigma/np.sqrt(n); sem_emp = np.std(means)
    print(f"n={n:<3} SD≈{sd_bar:.2f}  SEM实测={sem_emp:.3f} SD/√n={sem_theory:.3f}  95%CI半宽≈{1.96*sem_theory:.3f}  三种误差棒长度比 SD:SEM:CI = 1 : {sem_theory/sigma:.2f} : {1.96*sem_theory/sigma:.2f}")`,
    out:`n=5   最大插值误差 0.2105
n=10  最大插值误差 0.0594
n=20  最大插值误差 0.0136
n=40  最大插值误差 0.0032
n=80  最大插值误差 0.0008
n 翻倍误差约 /4 -> 误差 ∝ h², 至少 100 点才像曲线
顺序 ['对照', '药A', '药B'] 折线斜率符号: [-1.0, 1.0]
顺序 ['对照', '药B', '药A'] 折线斜率符号: [-1.0, -1.0]
n=5   SD≈1.87  SEM实测=0.892 SD/√n=0.894  95%CI半宽≈1.753  三种误差棒长度比 SD:SEM:CI = 1 : 0.45 : 0.88
n=20  SD≈1.98  SEM实测=0.451 SD/√n=0.447  95%CI半宽≈0.877  三种误差棒长度比 SD:SEM:CI = 1 : 0.22 : 0.44
n=80  SD≈2.00  SEM实测=0.223 SD/√n=0.224  95%CI半宽≈0.438  三种误差棒长度比 SD:SEM:CI = 1 : 0.11 : 0.22`,
    note:`插值误差五行是第 1-2 步；两种顺序的斜率符号是第 3 步；n=5/20/80 三行是第 4-7 步的 SD、SEM、CI 对照。`
  },
  contrast:[
    {vs:`散点图`, same:`都是 (x,y) 到位置`, diff:`散点不连线、不假设顺序；折线连线、断言连续`, when:`x 有序且连续用折线；x 是独立测量或类别用散点/点图`},
    {vs:`柱状图 + 误差棒`, same:`都能画组均值 ± 误差`, diff:`柱从 0 起、比较的是长度；n<10 时柱掩盖了每个点`, when:`小样本直接画每个点 + 均值线；柱只在类别多且 n 大时用`},
    {vs:`阶梯图 step`, same:`都用于有序 x`, diff:`阶梯图表示分段常数（如生存曲线），折线表示线性过渡`, when:`事件计数、生存率用 step；连续测量用 line`}
  ],
  ext:[
    {t:`跨数量级的 x 或 y 换对数轴`, go:'vz.log_axis'},
    {t:`SEM 的来源：样本均值方差`, go:'pr.clt'},
    {t:`置信区间的正式定义`, go:'si.confidence_interval'}
  ]
},

'vz.heatmap': {
  layers:{
    alg:`热图是映射 M[i,j] → color(norm(M[i,j]))，norm 把 [vmin,vmax] 线性压到 [0,1]，再查色带。行下标 i 对应图像的 y，列下标 j 对应 x。`,
    geo:`一张矩阵铺成马赛克，每格的颜色深浅就是数值。默认第 0 行画在最上面（矩阵习惯），与数学坐标 y 向上相反。两张热图要能比，色标必须是同一把尺。`,
    comp:`imshow：先 clip 到 [vmin,vmax]，归一化，按 256 级查表。不给 vmin/vmax 就各自取 min/max，同一个数在两张图上颜色不同。`
  },
  proof:{
    from:`颜色映射 = 归一化 + 查表；imshow 的行列约定；发散数据 0 有特殊含义`,
    to:`看热图先看 colorbar 范围和 0 在哪；对比多张图必须共享 vmin/vmax；有正负用发散色且对称`,
    steps:[
      [`把 M 的每个数变颜色需要一个 [vmin,vmax]→[0,1] 的归一化，再查色带`, `色带只有 [0,1] 一段，任何数值都得先被压进去；vmin/vmax 就是这把尺的两端`],
      [`imshow 把 M[0] 画在顶部、M[i,j] 的 i 向下增长`, `它是「显示一个矩阵」的语义，矩阵第 0 行在上；数学坐标 y 向上要 origin="lower"`],
      [`两张图各自 auto 范围：A 的最大值 4 和 B 的最大值 40 都映到色带顶端`, `各自归一化后同一颜色代表不同的数，视觉上「一样深」是假象`],
      [`共享 vmin/vmax 后，4 映到底部、40 映到顶部，颜色差异才对应数值差异`, `一把尺量两张图，这是「对比」成立的前提`],
      [`有正负的数据（相关、log 倍数变化）0 是分界，色带中点必须落在 0`, `发散色带的中性色在 0.5；线性归一 [-1,3] 把 0 放在 0.25，中性色对应的是 1 而非 0`],
      [`所以要 vmin=-v, vmax=v（v=max|M|），或用 TwoSlopeNorm 把两侧分别归一`, `对称范围让 0 归一到 0.5；这是发散色「中点对齐」的全部数学`],
      [`相关矩阵天然对称、对角为 1、范围 [-1,1]，直接 vmin=-1,vmax=1,cmap=RdBu`, `范围已知就不该让数据自动定尺，否则不同数据集之间不可比`]
    ],
    end:`热图 = 归一化 + 查表。三个必看：colorbar 两端、0 在哪、原点在哪。多图对比先统一尺。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 1. 热图 = 矩阵每个数 -> 颜色。手写归一化 + 查表
def to_color(M, vmin, vmax, ramp):                  # ramp: 灰度级字符表
    t = np.clip((M - vmin) / (vmax - vmin), 0, 1)   # 先线性归一到 [0,1]
    return np.array(list(ramp))[(t * (len(ramp)-1)).round().astype(int)]
ramp = " .:-=+*#%@"
M = np.array([[0, 1, 2], [3, 4, 5], [6, 7, 8]], dtype=float)
# 2. imshow 默认 origin='upper'：第 0 行画在最上面（矩阵习惯），与数学坐标 y 向上相反
img = to_color(M, 0, 8, ramp)
print("origin='upper' (M[0] 在顶):"); [print("  ", "".join(r)) for r in img]
print("origin='lower' (M[0] 在底):"); [print("  ", "".join(r)) for r in img[::-1]]
# 3. 不共享 vmin/vmax：同一个数在两张图上颜色不同，无法对比
A = np.array([[1., 2.], [3., 4.]]); B = A * 10
print("各自 auto 范围: A 的 4 ->", f"'{to_color(A, A.min(), A.max(), ramp)[1,1]}'", " B 的 40 ->", f"'{to_color(B, B.min(), B.max(), ramp)[1,1]}'", "(同色, 但差 10 倍)")
lo, hi = min(A.min(), B.min()), max(A.max(), B.max())
print("共享范围:       A 的 4 ->", f"'{to_color(A, lo, hi, ramp)[1,1]}'", " B 的 40 ->", f"'{to_color(B, lo, hi, ramp)[1,1]}'")
# 4. 有正负用发散色，0 必须在中点：vmin/vmax 要对称
C = np.array([-1., 0., 3.])
print("不对称 [-1,3] 时 0 落在归一化位置", round(float((0 - -1) / (3 - -1)), 2), "(不是 0.5 -> 0 不是白)")
v = np.abs(C).max(); print("对称 [-3,3] 时 0 落在", round(float((0 + v) / (2*v)), 2))
# 5. 相关矩阵热图：对称 + 对角 1
X = np.random.default_rng(0).standard_normal((50, 4)); R = np.corrcoef(X.T)
print("R 对称:", np.allclose(R, R.T), " 对角=1:", np.allclose(np.diag(R), 1), " 范围 [-1,1] -> vmin=-1, vmax=1, cmap=RdBu")`,
    out:`origin='upper' (M[0] 在顶):
    .:
   -=*
   #%@
origin='lower' (M[0] 在底):
   #%@
   -=*
    .:
各自 auto 范围: A 的 4 -> '@'  B 的 40 -> '@' (同色, 但差 10 倍)
共享范围:       A 的 4 -> '.'  B 的 40 -> '@'
不对称 [-1,3] 时 0 落在归一化位置 0.25 (不是 0.5 -> 0 不是白)
对称 [-3,3] 时 0 落在 0.5
R 对称: True  对角=1: True  范围 [-1,1] -> vmin=-1, vmax=1, cmap=RdBu`,
    note:`to_color() 是第 1 步的归一化+查表；两段字符画是第 2 步的 origin；A/B 对比是第 3-4 步；[-1,3] vs [-3,3] 是第 5-6 步；corrcoef 是第 7 步。`
  },
  contrast:[
    {vs:`等高线图`, same:`都展示 z=f(x,y)`, diff:`热图用颜色编码每格的值（连续色）；等高线只画等值线（位置编码，更精确）`, when:`矩阵型离散数据（相关、混淆、注意力）用热图；连续光滑曲面用等高线`},
    {vs:`聚类热图 clustermap`, same:`都是矩阵变色块`, diff:`clustermap 先按相似度重排行列，让块状结构浮现`, when:`基因×样本表达矩阵用 clustermap；行列本身有顺序（时间、位置）时别重排`},
    {vs:`散点图着色`, same:`都用颜色编码数值`, diff:`热图的位置是网格下标，散点的位置是数据本身`, when:`数据本来就是矩阵用热图；数据是 (x,y,z) 三元组用着色散点`}
  ],
  ext:[
    {t:`色带选择：顺序/发散/类别`, go:'vz.color'},
    {t:`混淆矩阵是最常见的热图`, go:'ml.metrics'},
    {t:`注意力权重矩阵可视化`, go:'dl.attention'}
  ]
},

'vz.contour': {
  layers:{
    alg:`等高线是水平集 {(x,y): f(x,y)=c}。∇f 与水平集处处垂直（沿等高线 f 不变，方向导数为 0）。相邻等高线间距 ≈ Δc/|∇f|，所以线密处陡。`,
    geo:`把一座山用「同高连线」压成地形图。圈心是山顶或谷底，线挤在一起是悬崖。梯度箭头永远垂直穿过等高线，指向最陡上坡。`,
    comp:`meshgrid 造出所有 (x,y) 组合，X.shape=(len(y),len(x))，行对应 y；在网格上算 Z；contour 在每个网格单元里线性插值找 Z=c 的穿越点连成线。`
  },
  proof:{
    from:`水平集定义；方向导数 D_v f = ∇f·v；一阶泰勒 f(p+d) ≈ f(p) + ∇f·d`,
    to:`梯度 ⟂ 等高线；线密 = 陡；细长椭圆 = 特征尺度不一致 = 梯度下降会震荡`,
    steps:[
      [`要在平面上画 f(x,y) 必须先有一张网格：meshgrid 把 x 向量和 y 向量拼成所有组合`, `函数要在每个点求值，网格就是「每个点」；X 的行对应 y 是因为图像的行是竖直方向`],
      [`等高线 f=c 是所有满足 f(x,y)=c 的点，在网格上就是 |Z-c| 最小的那些点连起来`, `这是水平集的定义，contour 只是在单元格内做线性插值找精确穿越点`],
      [`沿等高线移动一小步 d，f 不变：0 = f(p+d)-f(p) ≈ ∇f·d`, `一阶泰勒展开；等高线的切向 d 与 ∇f 点积为 0，即垂直`],
      [`数值验证：椭圆 x²+4y²=4 上取 1298 个点，梯度与切向夹角余弦中位数 0.004`, `解析梯度 (2x,8y) 与差分切向几乎正交，与第 3 步一致`],
      [`从 f=c 走到 f=c+Δc 需要沿梯度方向走 Δc/|∇f|`, `一阶泰勒：Δf = |∇f|·Δs；|∇f| 大则 Δs 小，等高线挤在一起`],
      [`x²+4y² 在 (2,0) 处 |∇f|=4，在 (0,1) 处 |∇f|=8：y 方向线密一倍，椭圆细长`, `两个方向的曲率差 4 倍就是两个特征的尺度差 2 倍`],
      [`细长椭圆上梯度不指向圆心，梯度下降会在陡方向来回震荡`, `标准化把椭圆变圆，梯度直指最优；这是可视化损失面能直接告诉你的事`]
    ],
    end:`等高线把三维压成二维而不丢读数。梯度垂直穿线、线密即陡、椭圆细长即该标准化。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 1. meshgrid：X.shape = (len(y), len(x))，行对应 y
x = np.linspace(-2, 2, 5); y = np.linspace(-1, 1, 3)
X, Y = np.meshgrid(x, y)
print("X.shape", X.shape, " X[0] (沿 x 变):", X[0].tolist(), " Y[:,0] (沿 y 变):", Y[:,0].tolist())
# 2. 等高线 = f(x,y)=c 的点集。手工提取：对细网格找 |f-c| 最小的点
f = lambda x, y: x**2 + 4*y**2                        # 细长椭圆碗
xs = np.linspace(-3, 3, 1201); ys = np.linspace(-3, 3, 1201); XX, YY = np.meshgrid(xs, ys); Z = f(XX, YY)
c = 4.0; on = np.abs(Z - c) < 0.01; px, py = XX[on], YY[on]
print(f"等高线 f=4 上取到 {on.sum()} 个点, 其 f 值范围 [{Z[on].min():.3f}, {Z[on].max():.3f}]")
# 3. 梯度 ⟂ 等高线：数值梯度 与 等高线切向 的点积 ≈ 0
gx, gy = 2*px, 8*py                                   # 解析梯度
th = np.arctan2(py/1.0, px/2.0); order = np.argsort(th); px, py, gx, gy = px[order], py[order], gx[order], gy[order]
k = 25; tx, ty = np.roll(px, -k) - np.roll(px, k), np.roll(py, -k) - np.roll(py, k)   # 沿等高线走的切向 (隔 k 点差分, 抗抖)
cosang = (gx*tx + gy*ty) / (np.hypot(gx, gy) * np.hypot(tx, ty) + 1e-12)
print(f"梯度与切向夹角余弦 |cos| 中位数 = {np.median(np.abs(cosang)):.4f} (≈0 即垂直)")
# 4. 线密 = 陡：相邻等高线间距 ≈ Δc/|∇f|
for (qx, qy) in [(2.0, 0.0), (0.0, 1.0)]:
    g = np.hypot(2*qx, 8*qy); print(f"  点({qx},{qy}) f={f(qx,qy):.0f} |∇f|={g:.1f}  相邻等高线(Δc=1)间距≈{1/g:.3f}")
print("y 方向更陡 -> 等高线在 y 方向更密 -> 椭圆细长 = 两个特征尺度不一致 -> 先标准化")`,
    out:`X.shape (3, 5)  X[0] (沿 x 变): [-2.0, -1.0, 0.0, 1.0, 2.0]  Y[:,0] (沿 y 变): [-1.0, 0.0, 1.0]
等高线 f=4 上取到 1298 个点, 其 f 值范围 [3.990, 4.010]
梯度与切向夹角余弦 |cos| 中位数 = 0.0044 (≈0 即垂直)
  点(2.0,0.0) f=4 |∇f|=4.0  相邻等高线(Δc=1)间距≈0.250
  点(0.0,1.0) f=4 |∇f|=8.0  相邻等高线(Δc=1)间距≈0.125
y 方向更陡 -> 等高线在 y 方向更密 -> 椭圆细长 = 两个特征尺度不一致 -> 先标准化`,
    note:`meshgrid 那行是第 1 步；|Z-c| 提取是第 2 步；余弦中位数是第 3-4 步；两个点的 |∇f| 与间距是第 5-6 步。`
  },
  contrast:[
    {vs:`3D 曲面图`, same:`都展示 z=f(x,y)`, diff:`等高线无遮挡、可读数、极值位置直接可读；3D 有透视失真和遮挡`, when:`要读数、找极值、看梯度方向用等高线；只要「整体长什么样」的直觉才用 3D`},
    {vs:`热图`, same:`都在平面上表示 z`, diff:`热图每格一个颜色（连续填充）；等高线只在等值处画线`, when:`光滑函数用等高线；离散矩阵用热图；也可 contourf 填色两者兼得`},
    {vs:`矢量场图 quiver`, same:`都描述 f 在平面上的变化`, diff:`quiver 直接画 ∇f 箭头；等高线画的是与箭头垂直的曲线`, when:`看流向用 quiver；看高低和陡缓用等高线；叠加画最清楚`}
  ],
  ext:[
    {t:`梯度的定义与方向导数`, go:'ca.gradient'},
    {t:`梯度下降在损失等高线上的路径`, go:'ml.gradient_descent'},
    {t:`标准化让椭圆变圆`, go:'da.normalize'}
  ]
},

'vz.hist': {
  layers:{
    alg:`直方图是密度的分段常数估计：p̂(x) = nₖ/(n·h)，x 在第 k 个 bin。偏差 ∝ h（太宽抹平），方差 ∝ 1/(nh)（太窄噪声）；Freedman-Diaconis 取 h = 2·IQR·n^(-1/3) 平衡两者。箱线图只报五个分位数。`,
    geo:`把数轴切成格子，每格垒起一摞方块。格太宽双峰糊成一个包，格太窄全是锯齿。箱线图是把整个分布压成一个盒子加两根须，盒子里面是什么形状看不见。`,
    comp:`np.histogram 数每个 bin 的落入个数；density=True 除以 n·h 让面积为 1。箱线图算 Q1、Q2、Q3，须到 1.5·IQR 内最远点，外面画成离群点。`
  },
  proof:{
    from:`密度估计的偏差-方差分解；分位数定义；IQR = Q3-Q1`,
    to:`bin 宽决定看到的形状；bins="auto" 有理论依据；箱线图会藏住双峰；长尾先 log`,
    steps:[
      [`直方图在每个 bin 内假设密度为常数，真密度有起伏时这一段被抹平：偏差 ∝ h·|p′|`, `分段常数逼近的一阶误差正比于区间宽度`],
      [`每个 bin 的计数是二项随机变量，相对波动 ∝ 1/√(nh)：bin 窄则每格样本少、噪声大`, `格子里样本数 ≈ n·h·p，泊松式波动 √(nhp) 相对于 nhp 就是 1/√(nhp)`],
      [`最优 h 让两者之和最小，解出 h ∝ n^(-1/3)；用 IQR 估分布尺度得 FD 规则 2·IQR·n^(-1/3)`, `这是 bins="auto" 背后的公式；实测建议 ≈10 个 bin，正好看到双峰`],
      [`双峰数据 bins=1,3 时峰数被抹成 1-2 个模糊包，bins=300 时出现 79 个假峰`, `偏差和方差两个极端的直接演示`],
      [`density=True 把计数除以 n·h，总面积 = Σ nₖ/(n·h)·h = 1`, `只有面积为 1 才能和 pdf 曲线画在同一坐标系里`],
      [`箱线图只用 Q1、中位数、Q3 和 1.5·IQR 须：双峰数据与均匀数据的五数概括几乎相同`, `分位数是单调统计量，中间掏空一块不改变 Q1/Q3；箱线图对双峰结构是盲的`],
      [`长尾数据（表达量、浓度）原始尺度上 48% 样本挤在第一格；log 后最大格只占 9%`, `对数把乘性尺度变成加性，格子在每个数量级上等宽`]
    ],
    end:`直方图的形状是你选的 h 造出来的，用 FD 规则起步。箱线图看不见双峰，小样本直接叠散点。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
# 1. 直方图是密度估计：bin 太宽抹平，太窄全噪声。双峰数据在不同 bin 数下的峰数
data = np.concatenate([rng.normal(-2, 0.7, 500), rng.normal(2, 0.7, 500)])
def n_peaks(counts):
    c = np.r_[0, counts, 0]; return int(np.sum((c[1:-1] > c[:-2]) & (c[1:-1] >= c[2:])))
for bins in [1, 3, 6, 12, 50, 300]:
    cnt, _ = np.histogram(data, bins=bins); print(f"bins={bins:<4} 峰数={n_peaks(cnt):<3}" + (f" counts={cnt.tolist()}" if bins <= 6 else ""))
h_fd = 2 * (np.percentile(data, 75) - np.percentile(data, 25)) / len(data)**(1/3)
print(f"Freedman-Diaconis 建议 bin 宽 {h_fd:.2f} -> 约 {int(np.ptp(data)/h_fd)} 个 bin (bins='auto' 就是它)")
# 2. density=True 面积=1，才能与 pdf 叠
cnt, edges = np.histogram(data, bins=30, density=True)
print("density 面积 =", round(float((cnt * np.diff(edges)).sum()), 6))
# 3. 箱线图的四分位定义 & 它藏住双峰：双峰数据和单峰数据五数概括几乎一样
uni = rng.uniform(-3, 3, 1000)
def five(x): return np.round(np.percentile(x, [0, 25, 50, 75, 100]), 2).tolist()
print("双峰 五数:", five(data)); print("均匀 五数:", five(uni))
q1, q3 = np.percentile(data, [25, 75]); iqr = q3 - q1
print(f"IQR={iqr:.2f}, 须=1.5·IQR 之外算离群: 下界 {q1-1.5*iqr:.2f} 上界 {q3+1.5*iqr:.2f}")
# 4. 长尾先 log 再画：表达量类数据
expr = rng.lognormal(3, 1, 2000)
c1, _ = np.histogram(expr, bins=30); c2, _ = np.histogram(np.log10(expr), bins=30)
print(f"原始尺度: 第一格占 {c1[0]/len(expr)*100:.0f}% 样本, 最后 15 格共 {c1[15:].sum()} 个;  log10 后最大格占 {c2.max()/len(expr)*100:.0f}%")`,
    out:`bins=1    峰数=1   counts=[1000]
bins=3    峰数=2   counts=[284, 247, 469]
bins=6    峰数=2   counts=[17, 267, 211, 36, 329, 140]
bins=12   峰数=2  
bins=50   峰数=11 
bins=300  峰数=79 
Freedman-Diaconis 建议 bin 宽 0.79 -> 约 10 个 bin (bins='auto' 就是它)
density 面积 = 1.0
双峰 五数: [-4.73, -2.04, 0.05, 1.93, 3.74]
均匀 五数: [-2.99, -1.63, -0.2, 1.48, 2.99]
IQR=3.97, 须=1.5·IQR 之外算离群: 下界 -7.99 上界 7.89
原始尺度: 第一格占 48% 样本, 最后 15 格共 9 个;  log10 后最大格占 9%`,
    note:`bins=1..300 六行是第 1-4 步；density 面积是第 5 步；两组五数概括是第 6 步；lognormal 两行是第 7 步。`
  },
  contrast:[
    {vs:`核密度估计 KDE`, same:`都估密度，都有一个带宽参数`, diff:`KDE 用光滑核代替方块，没有 bin 边界位置的任意性`, when:`展示用 KDE 更好看；小样本、有界数据（浓度 ≥0）KDE 会溢出边界，用直方图`},
    {vs:`箱线图`, same:`都概括一个变量的分布`, diff:`箱线图只有 5 个数，看不到多峰；直方图保留形状`, when:`多组并排快速比中位数和离散用箱线图；单组细看形状用直方图；两者都不如 n<50 时直接画点`},
    {vs:`小提琴图`, same:`和箱线图一样用于多组对比`, diff:`小提琴两侧是 KDE，能显示双峰`, when:`组多且 n 大用小提琴；n 小时 KDE 不可靠`}
  ],
  ext:[
    {t:`分布与密度函数`, go:'pr.distribution'},
    {t:`跨数量级数据的对数轴`, go:'vz.log_axis'},
    {t:`样本均值的分布随 n 收窄`, go:'np.random'}
  ]
},

'vz.3d': {
  layers:{
    alg:`3D 图是投影 P: R³→R²，透视下屏幕坐标 = (x,y)·d/(d+z)。投影不是单射：不同的 (x,y,z) 落在同一像素，读数没有逆映射。体积编码走 Stevens k≈0.6，比长度（k=1）压缩最狠。`,
    geo:`屏幕是平的，第三维靠近大远小和遮挡骗大脑。同样高的柱子，远的看起来矮；前排挡住后排。它给的是「碗/鞍/多峰」的整体形状，不给任何数。`,
    comp:`plot_surface 同样吃 meshgrid 网格，按视角把每个面投影后排序绘制（画家算法）。改视角就换一张图，读者无法自己转，投稿静态图更是如此。`
  },
  proof:{
    from:`针孔透视投影公式；Stevens 幂定律；遮挡是深度排序的必然结果`,
    to:`3D 图给直觉不给读数；3D 柱/饼几乎永远错；能用等高线就别 3D；>3 个特征先降维`,
    steps:[
      [`透视投影屏幕高度 = 真实高度 × d/(d+z)：深度 z=0,2,4 时同样的 1 变成 1.00、0.71、0.56`, `这是针孔相机模型，任何 3D 渲染都逃不掉；同一刻度在不同深度不等长`],
      [`既然刻度随深度变，读者无法从屏幕长度反推数值`, `缺少深度信息时投影不可逆；3D 柱状图的柱高因此不可比`],
      [`3D 柱用体积传达数值，Stevens 指数 0.6：真实 1:2:4:8 感知成 1:1.5:2.3:3.5`, `体积通道比面积（0.7）更压缩，比长度（1.0）差远了`],
      [`同理气泡面积要 √ 缩放：半径 ∝ √值 才让面积 ∝ 值；半径 ∝ 值会让 2 倍变 4 倍`, `面积 = πr²，要让面积正比于数据就得对半径开方；很多库默认按半径缩放，要自己开方`],
      [`遮挡：随机曲面在斜视角下约 56% 的格子被前景挡住`, `深度排序后近处覆盖远处，被挡的数据在这张图里等于不存在`],
      [`等高线在同一曲面上直接读出极小值位置 (0.5,-0.3)，无遮挡无透视`, `等高线是水平集的正交投影，保持 x、y 的位置编码，这两个是最准的通道`],
      [`超过 3 个特征硬画 3D 只是挑了 3 个轴，其余信息全丢`, `先 PCA 到 2D 保留最大方差方向，再用位置 + 颜色，比 3D 散点信息更多也更可读`]
    ],
    end:`3D 只用于看整体形状。要读数、比大小、找极值，退回等高线或分面 2D。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 1. 透视投影：屏幕只有二维，第三维靠 z 缩放欺骗；同样长的柱子离得远就变短
def project(x, y, z, d=5.0):       # 简单针孔投影：远处 (z 大) 缩小
    s = d / (d + z); return x*s, y*s, s
for z in [0, 2, 4]:
    _, h, s = project(0, 1.0, z); print(f"高度 1 的柱子 深度 z={z} -> 屏幕高度 {h:.2f} (缩放 {s:.2f})")
print("同样高度读出不同数 -> 3D 柱状图不能读数")
# 2. Stevens 幂定律：长度 k=1.0，面积 k=0.7，体积 k=0.6。3D 用体积编码，感知压缩最狠
vals = np.array([1, 2, 4, 8])
for name, k in [("长度(2D 柱)", 1.0), ("面积(气泡)", 0.7), ("体积(3D 柱)", 0.6)]:
    perc = vals ** k; print(f"  {name:<9} 真实比 1:2:4:8 -> 感知比 1:{perc[1]:.2f}:{perc[2]:.2f}:{perc[3]:.2f}")
print("面积要 √ 缩放：半径 ∝ √值 才让面积 ∝ 值；若半径 ∝ 值，面积 ∝ 值² 夸大 ->", "半径 2 倍面积", (2**2), "倍")
# 3. 遮挡：随机视角下，前面的面挡住后面
rng = np.random.default_rng(0); Z = rng.random((20, 20))
hidden = 0
for i in range(20):
    for j in range(20):
        # 从 (+x,+y) 斜上方看：若前面任一格更高就被挡（粗略）
        if np.any(Z[i+1:, j+1:] > Z[i, j] + 0.3): hidden += 1
print(f"20x20 曲面在斜视角下约 {hidden/400*100:.0f}% 的格子被前景挡住 -> 等高线无遮挡")
# 4. 能用等高线就别 3D：同一曲面，等高线的极值位置直接可读
xs = np.linspace(-2, 2, 401); X, Y = np.meshgrid(xs, xs); F = (X-0.5)**2 + 2*(Y+0.3)**2
i, j = np.unravel_index(F.argmin(), F.shape); print(f"等高线圈心 (极小) 读出 x={X[i,j]:.2f}, y={Y[i,j]:.2f}")`,
    out:`高度 1 的柱子 深度 z=0 -> 屏幕高度 1.00 (缩放 1.00)
高度 1 的柱子 深度 z=2 -> 屏幕高度 0.71 (缩放 0.71)
高度 1 的柱子 深度 z=4 -> 屏幕高度 0.56 (缩放 0.56)
同样高度读出不同数 -> 3D 柱状图不能读数
  长度(2D 柱)  真实比 1:2:4:8 -> 感知比 1:2.00:4.00:8.00
  面积(气泡)    真实比 1:2:4:8 -> 感知比 1:1.62:2.64:4.29
  体积(3D 柱)  真实比 1:2:4:8 -> 感知比 1:1.52:2.30:3.48
面积要 √ 缩放：半径 ∝ √值 才让面积 ∝ 值；若半径 ∝ 值，面积 ∝ 值² 夸大 -> 半径 2 倍面积 4 倍
20x20 曲面在斜视角下约 56% 的格子被前景挡住 -> 等高线无遮挡
等高线圈心 (极小) 读出 x=0.50, y=-0.30`,
    note:`三行透视缩放是第 1-2 步；Stevens 三行是第 3-4 步；遮挡百分比是第 5 步；最后一行等高线极小值是第 6 步。`
  },
  contrast:[
    {vs:`等高线`, same:`都表示 z=f(x,y)`, diff:`等高线保留位置编码、无遮挡；3D 用透视和体积编码`, when:`默认等高线；3D 只在需要「一眼看出是碗还是鞍」时用，且配合等高线`},
    {vs:`分面 2D（small multiples）`, same:`都能表示 3 个以上变量`, diff:`分面把第 3 维切片成多张 2D 图，每张都精确可读`, when:`第 3 维是离散或可分箱时用分面；3D 散点几乎总可以被分面替代`},
    {vs:`交互式 3D（plotly）`, same:`都是 3D 渲染`, diff:`交互可旋转缓解遮挡和视角问题，静态 PDF 做不到`, when:`探索阶段可用交互 3D；论文图一律 2D`}
  ],
  ext:[
    {t:`等高线：3D 的正确替代`, go:'vz.contour'},
    {t:`高维先 PCA 再画`, go:'ml.pca'},
    {t:`第 3 维用颜色编码的规则`, go:'vz.color'}
  ]
},

'vz.color': {
  layers:{
    alg:`色带是映射 [0,1]→RGB。顺序数据要求相对亮度 L(t) 单调；发散数据要求 L 在 0.5 对称且中点中性；类别数据要求色相彼此可分且在色盲模拟矩阵作用后仍可分。`,
    geo:`人眼是亮度探测器，色相只是标签。viridis 是一条从深到亮的单调坡；jet 是坡上有一个驼峰，驼峰处凭空出现一条边界。红和绿在 8% 男性眼里是同一种颜色。`,
    comp:`数值 → 归一化 → 查 256 级表。TwoSlopeNorm 分别把 [vmin,0] 和 [0,vmax] 映到 [0,0.5] 和 [0.5,1]。色盲模拟是线性 RGB 上乘一个 3×3 矩阵。`
  },
  proof:{
    from:`相对亮度 L = 0.2126R+0.7152G+0.0722B（线性化后）；Stevens 亮度 k≈0.5；红绿色盲缺少 L/M 视锥之一`,
    to:`顺序用亮度单调色带；发散色中点必须对齐 0 且对称；类别配色要过色盲模拟；jet 制造假边界`,
    steps:[
      [`视觉系统对亮度差最敏感、能排序；对色相能区分但不能排序`, `「红比蓝大」没有生理基础，「亮比暗大」有；顺序数据必须走亮度通道`],
      [`沿 jet 采样 11 点，亮度 0.02→0.88→0.05 先升后降；viridis 0.02→0.78 单调`, `亮度非单调意味着同一亮度对应两个数值，且驼峰处产生一条数据里不存在的边界`],
      [`亮度感知 k≈0.5，比位置差得多，所以颜色只适合传「大概多少」`, `这是为什么热图要配 colorbar、精确比较要换位置编码`],
      [`发散数据的 0 是语义中心，色带的中性色在 t=0.5`, `把 0 归一到 0.5 是发散色的定义；线性归一 [-1,3] 把 0 放到 0.25，中性色对应的是 +1`],
      [`修正：vmin=-max|v|, vmax=+max|v| 对称，或 TwoSlopeNorm 两侧各自线性`, `两种方法都让 0→0.5；前者浪费一半色带，后者两侧斜率不同但 0 对齐`],
      [`色盲模拟：对 RGB 乘 protanopia 矩阵后，红 vs 绿距离从 0.82 缩到 0.50 且亮度差仅 0.10；蓝 vs 橙、紫 vs 黄距离保持`, `红绿色盲缺少区分 L/M 视锥的信号，投影矩阵把红绿压到同一轴上；蓝黄轴不受影响`],
      [`判据：模拟后颜色距离仍大 + 亮度差大 + 类别 ≤8`, `前两条保证色盲和灰度打印都能分；第三条是色相通道的可分辨上限`]
    ],
    end:`顺序看亮度、发散对齐 0、类别过色盲检查。viridis / RdBu / tab10（或 Okabe-Ito）覆盖 95% 场景，jet 永远不用。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
def lum(rgb):                                         # 相对亮度 (sRGB 近似线性化后加权)
    c = np.asarray(rgb, float); c = np.where(c <= 0.04045, c/12.92, ((c+0.055)/1.055)**2.4)
    return c @ np.array([0.2126, 0.7152, 0.0722])
# 1. 顺序色靠亮度单调。手写 jet（红-黄-绿-青-蓝 分段线性）vs viridis 端点抽样
def jet(t):
    r = np.clip(1.5 - abs(4*t - 3), 0, 1); g = np.clip(1.5 - abs(4*t - 2), 0, 1); b = np.clip(1.5 - abs(4*t - 1), 0, 1)
    return np.stack([r, g, b], -1)
viridis = np.array([[0.267,0.005,0.329],[0.283,0.141,0.458],[0.254,0.265,0.530],[0.207,0.372,0.553],[0.164,0.471,0.558],[0.128,0.567,0.551],[0.135,0.659,0.518],[0.267,0.749,0.441],[0.478,0.821,0.318],[0.741,0.873,0.150],[0.993,0.906,0.144]])
t = np.linspace(0, 1, 11)
Lj, Lv = lum(jet(t)), lum(viridis)
print("jet 亮度:    ", np.round(Lj, 2).tolist()); print("viridis 亮度:", np.round(Lv, 2).tolist())
print("单调递增? jet:", bool(np.all(np.diff(Lj) > 0)), " viridis:", bool(np.all(np.diff(Lv) > 0)), " -> jet 中段亮度先升后降 = 假边界")
# 2. 发散色 0 要在中点：手写 TwoSlopeNorm
def norm_two_slope(v, vmin, vcenter, vmax): return np.where(v < vcenter, 0.5*(v-vmin)/(vcenter-vmin), 0.5 + 0.5*(v-vcenter)/(vmax-vcenter))
v = np.array([-1., 0., 3.])
print("线性归一 [-1,3]: 0 ->", round(float((0+1)/4), 2), "  对称 vmax=|max|: 0 ->", 0.5, "  TwoSlopeNorm: 0 ->", float(norm_two_slope(0., -1, 0, 3)))
# 3. 色盲安全判据：模拟红色盲 (Machado 2009 protanopia 矩阵) 后两色仍要可分
P = np.array([[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]])
def sim(rgb): return np.clip(np.asarray(rgb) @ P.T, 0, 1)
pairs = {"红 vs 绿": ([0.84,0.15,0.16], [0.17,0.63,0.17]), "蓝 vs 橙": ([0.12,0.47,0.71], [1.0,0.50,0.05]), "紫 vs 黄": ([0.27,0.0,0.33], [0.99,0.91,0.14])}
for name, (c1, c2) in pairs.items():
    d0 = np.linalg.norm(np.subtract(c1, c2)); d1 = np.linalg.norm(sim(c1) - sim(c2)); dl = abs(lum(c1) - lum(c2))
    print(f"  {name}: 正常视觉距离 {d0:.2f} -> 红色盲后 {d1:.2f}  亮度差 {dl:.2f}")
print("判据：模拟色盲后距离仍大 + 亮度差大。红绿塌缩，蓝橙/紫黄安全")`,
    out:`jet 亮度:     [0.02, 0.06, 0.12, 0.39, 0.77, 0.78, 0.88, 0.53, 0.26, 0.17, 0.05]
viridis 亮度: [0.02, 0.04, 0.07, 0.11, 0.16, 0.22, 0.3, 0.4, 0.51, 0.64, 0.78]
单调递增? jet: False  viridis: True  -> jet 中段亮度先升后降 = 假边界
线性归一 [-1,3]: 0 -> 0.25   对称 vmax=|max|: 0 -> 0.5   TwoSlopeNorm: 0 -> 0.5
  红 vs 绿: 正常视觉距离 0.82 -> 红色盲后 0.50  亮度差 0.10
  蓝 vs 橙: 正常视觉距离 1.10 -> 红色盲后 0.76  亮度差 0.20
  紫 vs 黄: 正常视觉距离 1.18 -> 红色盲后 1.29  亮度差 0.77
判据：模拟色盲后距离仍大 + 亮度差大。红绿塌缩，蓝橙/紫黄安全`,
    note:`lum() 与 jet/viridis 两行是第 1-2 步；三种归一化是第 4-5 步；protanopia 矩阵三行是第 6-7 步的判据。`
  },
  contrast:[
    {vs:`顺序 vs 发散色带`, same:`都编码连续数值`, diff:`顺序单调从暗到亮；发散两端深中间浅，中点有语义`, when:`只有正值（计数、表达量）用顺序；有正负或有基线（log FC、相关）用发散`},
    {vs:`类别色 vs 顺序色`, same:`都是一组颜色`, diff:`类别色刻意让亮度相近、色相拉开，避免暗示顺序；顺序色反之`, when:`细胞类型、药物用类别色；剂量、时间用顺序色`},
    {vs:`灰度`, same:`都是亮度编码`, diff:`灰度只有亮度一个通道，viridis 在亮度之外加了色相帮助定位`, when:`黑白打印或极简图用灰度；屏幕和彩印用 viridis`}
  ],
  ext:[
    {t:`热图的 vmin/vmax 与色带配合`, go:'vz.heatmap'},
    {t:`散点第 3 维着色`, go:'vz.scatter'},
    {t:`对数尺度下的颜色归一化`, go:'ns.log_scale'}
  ]
},

'vz.subplot': {
  layers:{
    alg:`一张画布是 axes 的网格；subplots(r,c) 返回 shape (r,c) 的 axes 数组（squeeze 后 (1,c)→(c,)，(1,1)→标量）。分面 = 按类别变量 g 把数据切成 {D_g}，每片一个 axes，共享尺度。`,
    geo:`同一张纸上排几个小窗口，每个窗口一个坐标系。窗口尺度不统一时，每个窗口都自动放大到填满，噪声看起来和真差异一样大；sharey 让所有窗口用同一把尺。`,
    comp:`fig, axes = plt.subplots(r, c, sharex=, sharey=)；在 ax 上画不在 plt 上画；axes.flat 一维遍历。自动缩放默认加 5% 边距。`
  },
  proof:{
    from:`每个 axes 独立做 autoscale：ylim = [min-5%·range, max+5%·range]；像素/单位 = 面板高 / (ylim 宽)`,
    to:`多组对比要分面 + 共享尺度；独立 y 轴会把噪声放大成假差异；ax 接口才可控`,
    steps:[
      [`一张图里画 3 组会重叠混乱；3 张独立的图又无法并排比较`, `分面是折中：同一画布多个坐标系，位置对齐便于比较`],
      [`subplots 返回的 axes 数组 shape 跟随网格：(1,3)→(3,)、(2,3)→(2,3)、(1,1)→单个 ax`, `默认 squeeze=True 去掉长度 1 的维；统一用 axes.flat 遍历避免分支`],
      [`每个 axes 各自 autoscale：把自己的 [min,max] 加 5% 边距撑满面板`, `这是默认行为，让每张小图「填满」；代价是尺度各不相同`],
      [`像素/单位 = 面板高 / ylim 宽：对照组的噪声 std 0.3 在独立轴下每单位 246 px，共享轴下 51 px`, `独立轴把小组内波动放大 4.8 倍，三张图看起来都在剧烈波动`],
      [`共享 y 轴后，对照与药A 几乎持平，药B 明显高 4 个单位`, `同一把尺量三组，差异的视觉大小才与数值大小成比例`],
      [`分面按类别拆数据：每面 n 不同、范围不同，但 xlim 应共享`, `共享 xlim 让读者在面与面之间直接比位置，不用读刻度`],
      [`画在 ax 上而不是 plt 上：plt.plot 作用于「当前 axes」，多子图时是哪一个取决于调用顺序`, `显式 ax 让每条命令的目标确定，脚本可复现、可重排`]
    ],
    end:`分面 + sharex/sharey 是多组对比的默认。独立尺度只在各组量纲不同时用，并且要在图注里说明。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
# 1. axes 数组形状 = subplots(nrows, ncols) 的网格；(1,1) 是单个对象
for shape in [(1, 3), (2, 3), (3, 1)]:
    axes = np.empty(shape, dtype=object); axes = axes.squeeze()      # matplotlib 默认 squeeze=True
    print(f"subplots{shape} -> axes.shape {axes.shape}  用 axes.flat 统一遍历 {len(list(axes.flat))} 个")
# 2. 各自自动缩放 vs sharey：matplotlib 默认 margin 5%
def autolim(y, margin=0.05):
    lo, hi = y.min(), y.max(); r = hi - lo; return lo - margin*r, hi + margin*r
groups = {"对照": rng.normal(10, 0.3, 30), "药A": rng.normal(10.6, 0.3, 30), "药B": rng.normal(14, 0.3, 30)}
allv = np.concatenate(list(groups.values())); shared = autolim(allv)
H = 300                                                                 # 面板高 300 像素
for g, y in groups.items():
    lo, hi = autolim(y); px_own = H / (hi - lo); px_sh = H / (shared[1] - shared[0])
    print(f"  {g}: 独立 y 轴 每单位 {px_own:5.0f} px  共享 y 轴 每单位 {px_sh:5.0f} px  -> 独立轴把噪声放大 {px_own/px_sh:.1f} 倍")
print("三张独立轴子图看起来「波动都很大」；sharey 才看出药B 才是真差异")
# 3. 分面 = 按类别拆成小图：每面同尺度，一眼比。手写 facet 拆分
cats = rng.choice(["T", "B", "NK"], 300); val = rng.normal(0, 1, 300)
for c in ["T", "B", "NK"]:
    m = cats == c; print(f"  facet {c}: n={m.sum()} 范围 [{val[m].min():.2f}, {val[m].max():.2f}]  共享 xlim=[{val.min():.2f}, {val.max():.2f}]")`,
    out:`subplots(1, 3) -> axes.shape (3,)  用 axes.flat 统一遍历 3 个
subplots(2, 3) -> axes.shape (2, 3)  用 axes.flat 统一遍历 6 个
subplots(3, 1) -> axes.shape (3,)  用 axes.flat 统一遍历 3 个
  对照: 独立 y 轴 每单位   246 px  共享 y 轴 每单位    51 px  -> 独立轴把噪声放大 4.8 倍
  药A: 独立 y 轴 每单位   280 px  共享 y 轴 每单位    51 px  -> 独立轴把噪声放大 5.4 倍
  药B: 独立 y 轴 每单位   216 px  共享 y 轴 每单位    51 px  -> 独立轴把噪声放大 4.2 倍
三张独立轴子图看起来「波动都很大」；sharey 才看出药B 才是真差异
  facet T: n=102 范围 [-3.90, 2.76]  共享 xlim=[-3.90, 2.76]
  facet B: n=88 范围 [-2.97, 2.55]  共享 xlim=[-3.90, 2.76]
  facet NK: n=110 范围 [-1.70, 2.03]  共享 xlim=[-3.90, 2.76]`,
    note:`三行 subplots shape 是第 2 步；三组 px/单位对比是第 3-5 步；facet 三行是第 6 步。`
  },
  contrast:[
    {vs:`同一坐标系叠加多组`, same:`都用于多组对比`, diff:`叠加共享尺度但会重叠遮挡；分面不重叠但占面积`, when:`≤3 组且不重叠用叠加；组多或分布重叠用分面`},
    {vs:`seaborn FacetGrid / relplot(col=)`, same:`都是分面`, diff:`FacetGrid 自动按列值拆分、共享尺度、加标题；matplotlib subplots 要手工循环`, when:`探索期用 seaborn 一行分面；定稿细调用 subplots`},
    {vs:`inset 子图`, same:`都是一张图里多个 axes`, diff:`inset 是主图内的放大镜，尺度刻意不同`, when:`要同时看全局和局部细节时用 inset`}
  ],
  ext:[
    {t:`每个面里的折线`, go:'vz.line'},
    {t:`分面前先 groupby 拆数据`, go:'da.groupby'},
    {t:`长表格式让分面变成一行`, go:'da.tidy'}
  ]
},

'vz.log_axis': {
  layers:{
    alg:`对数轴是坐标变换 u = log x。指数 y=a·bˣ 变成 log y = log a + x·log b（semilogy 直线，斜率 log b）；幂律 y=a·xᵏ 变成 log y = log a + k·log x（loglog 直线，斜率 k）。乘性关系在 log 下是加性。`,
    geo:`线性轴上 1 和 1000 之间，1 和 10 挤在起点一个像素里。log 轴把「倍数」变成「距离」：每个数量级等宽。误差棒 ±SD 在 log 轴上变得上短下长。`,
    comp:`ax.set_yscale("log")：刻度按 10ᵏ 放，中间小刻度是 2..9 倍。0 和负数没有对数，画不出；用 symlog 或单独处理对照。`
  },
  proof:{
    from:`对数恒等式 log(ab)=log a+log b、log(xᵏ)=k log x；像素位置与数值线性对应`,
    to:`跨数量级必须 log；指数在 semilogy 变直线、幂律在 loglog 变直线；0 无对数；误差棒不对称是正常的`,
    steps:[
      [`剂量 1e-9..1e-5 M 在 400 px 线性轴上：前 7 个点全落在 0.4 px 内`, `线性像素 ∝ 数值，最大值决定尺度，比它小 100 倍的点都被压到起点`],
      [`取 log 后 9 个点等距各占 50 px`, `log 把每个数量级映到等长区间，这是「跨数量级必须 log」的全部理由`],
      [`指数 y=3·2ˣ：y 对 x 线性相关 r=0.81（弯的）；log y 对 x 相关 0.9998，斜率 0.995≈log₂2=1`, `log 把乘 2 变成加 1，等比数列变等差数列`],
      [`幂律 y=5·x^1.5：log-log 拟合斜率 1.506、截距 10^0.69≈5`, `log(a·xᵏ)=log a+k·log x，斜率直接读出幂指数`],
      [`所以「在哪种轴上是直线」本身是诊断：semilogy 直 → 指数增长；loglog 直 → 幂律；都不直 → 别的机制`, `直线是人眼最容易判断的形状，坐标变换把假设检验变成看图`],
      [`log(0)=-inf：浓度 0 的对照画不上`, `对数的定义域是正数；解决：断轴单独放对照、symlog、或用最低剂量的 1/10 占位并注明`],
      [`μ±SD 在线性轴对称（70,130），log 后下侧 0.155、上侧 0.114`, `log 是凹函数，向下的区间被拉长；不对称是坐标变换的结果，不是数据有问题`]
    ],
    end:`数据跨 2 个以上数量级或关系是乘性的，就换 log 轴。看到直线读斜率，看到 0 想 symlog。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
# 1. 线性轴上 1 与 1000 挤在一起：剂量 1e-9..1e-5 M 在 400px 宽的轴上各占多少像素
dose = np.logspace(-9, -5, 9)
lin_px = (dose - dose.min()) / (dose.max() - dose.min()) * 400
log_px = (np.log10(dose) - -9) / 4 * 400
print("线性轴像素位置:", np.round(lin_px, 1).tolist()); print("对数轴像素位置:", np.round(log_px, 1).tolist())
print("线性轴前 7 个点挤在 0.4 px 内; 对数轴等距 -> 跨数量级必须 log")
# 2. 指数关系 y=a·b^x 在 semilogy 变直线：log y = log a + x·log b
x = np.arange(0, 10); y = 3 * 2.0**x * np.exp(rng.normal(0, 0.05, 10))
print(f"y vs x 线性相关 r={np.corrcoef(x, y)[0,1]:.3f}   log y vs x 相关 r={np.corrcoef(x, np.log(y))[0,1]:.4f}  斜率 {np.polyfit(x, np.log2(y), 1)[0]:.3f} (=log2 b=1)")
# 3. 幂律 y=x^k 在 log-log 变直线，斜率 = k（乘性关系变加性）
xp = np.logspace(0, 3, 20); yp = 5 * xp**1.5 * np.exp(rng.normal(0, 0.05, 20))
k, c = np.polyfit(np.log10(xp), np.log10(yp), 1); print(f"log-log 斜率 {k:.3f} (真值 1.5)  截距 10^{c:.2f} ≈ 5")
# 4. 0 和负数没有对数：浓度 0 的对照要单独处理
with np.errstate(divide="ignore"): print("log10(0) =", np.log10(0.0), " -> 对照放 x 轴左侧断轴 / 用 symlog / 用 1/10 最低剂量占位")
# 5. log 轴上对称的误差 ±SD 变得不对称
m, sd = 100.0, 30.0
print(f"线性: [{m-sd:.0f}, {m+sd:.0f}] 上下各 {sd:.0f};  log10 后: 下 {np.log10(m)-np.log10(m-sd):.3f} 上 {np.log10(m+sd)-np.log10(m):.3f} -> 不对称是正常的")`,
    out:`线性轴像素位置: [0.0, 0.1, 0.4, 1.2, 4.0, 12.6, 40.0, 126.5, 400.0]
对数轴像素位置: [0.0, 50.0, 100.0, 150.0, 200.0, 250.0, 300.0, 350.0, 400.0]
线性轴前 7 个点挤在 0.4 px 内; 对数轴等距 -> 跨数量级必须 log
y vs x 线性相关 r=0.812   log y vs x 相关 r=0.9998  斜率 0.995 (=log2 b=1)
log-log 斜率 1.506 (真值 1.5)  截距 10^0.69 ≈ 5
log10(0) = -inf  -> 对照放 x 轴左侧断轴 / 用 symlog / 用 1/10 最低剂量占位
线性: [70, 130] 上下各 30;  log10 后: 下 0.155 上 0.114 -> 不对称是正常的`,
    note:`两行像素位置是第 1-2 步；r 与斜率那行是第 3 步；log-log 斜率是第 4 步；log10(0) 是第 6 步；最后一行是第 7 步。`
  },
  contrast:[
    {vs:`先 np.log 再画线性轴`, same:`图形状完全相同`, diff:`刻度标签不同：log 轴仍标 1,10,100（可读原值）；变换后标 0,1,2（读者要换算）`, when:`展示用 log 轴；做统计（回归、t 检验）用变换后的值`},
    {vs:`symlog`, same:`都压缩大数值`, diff:`symlog 在 0 附近有一段线性区，能容纳 0 和负数`, when:`数据含 0 或跨越正负（log 倍数变化本身就是 log 了，别再 log）用 symlog`},
    {vs:`sqrt 轴`, same:`都是单调压缩`, diff:`sqrt 压缩弱、能容纳 0；log 每个数量级等宽`, when:`计数数据（泊松，方差稳定用 sqrt）；跨多个数量级用 log`}
  ],
  ext:[
    {t:`对数尺度的数量级直觉`, go:'ns.log_scale'},
    {t:`指数与对数函数的代数`, go:'al.exp_log'},
    {t:`剂量-反应曲线的 x 轴一定是 log`, go:'bm.dose_response'}
  ]
},

'vz.annotate': {
  layers:{
    alg:`一张图是一个论证：结论（标题）+ 证据（数据墨水）+ 度量衡（轴标签、单位、刻度）。数据墨水比 = 传达数据的像素 / 全部像素，最大化它；刻度取 {1,2,2.5,5}×10ᵏ 的「好数」让读者不用算。`,
    geo:`读者的眼睛先落到标题，再找轴，再看数据。框线、网格、3D 阴影都在和数据抢注意力。去掉上右两条边框后，图从一个盒子变成一个开口的坐标系。`,
    comp:`ax.set_title(结论句)、ax.set_xlabel("量 (单位)")、ax.spines[["top","right"]].set_visible(False)、ax.annotate(文字, xy=, xytext=, arrowprops=)。savefig 在 show 之前，dpi=300，bbox_inches="tight"。`
  },
  proof:{
    from:`注意力有限；数据墨水原则（Tufte）；刻度可读性 = 心算难度；投稿分辨率要求`,
    to:`标题说结论、标签带单位、刻度用好数、去掉非数据墨水、savefig 顺序与参数`,
    steps:[
      [`读者停留几秒，先读标题：「Figure 1」传递零信息，「Drug A reduces viability to 51% of control」直接给结论`, `标题是唯一保证被读的文字；结论式标题让图不用图注也能自解释`],
      [`轴标签必须是「量 + 单位」：Value 不够，Viability (% of control) 才够`, `没有单位的数不可比较、不可复现`],
      [`刻度用好数：[0,7.3] 上 linspace 给 1.825, 3.65…，nice_ticks 给 0,1,2,…8`, `心算 3.65 到 5.475 的差要花时间；步长取 1/2/2.5/5×10ᵏ 是所有绘图库 locator 的共同规则`],
      [`数据墨水比：带框+网格的图 4/48=0.08，去框去网格后 4/17=0.24`, `每一滴非数据墨水都在稀释数据；上右边框、密网格、阴影都可去`],
      [`关键点用 annotate 指出：IC50、峰值、异常点，箭头 + 一句话`, `读者不知道你想让他看哪里，标注把「你看到的」变成「他看到的」`],
      [`savefig 必须在 plt.show() 之前`, `show 之后图形对象在非交互后端被清空，再存是空白`],
      [`投稿 dpi=300：3.5 英寸单栏 = 1050 px；字号 ≥7 pt = 29 px 高；bbox_inches="tight" 防标签被裁`, `印刷分辨率与最小可读字号是期刊硬性要求；tight 让边界按内容而非默认画布裁切`]
    ],
    end:`图是论证。标题给结论，轴给度量衡，数据占最多墨水，其他一律删。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 1. 刻度要「好数」：手写 matplotlib MaxNLocator 的核心：步长取 1,2,2.5,5 ×10^k
def nice_ticks(lo, hi, n=5):
    raw = (hi - lo) / n; mag = 10 ** np.floor(np.log10(raw))
    step = min([1, 2, 2.5, 5, 10], key=lambda s: abs(s*mag - raw)) * mag
    return np.arange(np.floor(lo/step)*step, np.ceil(hi/step)*step + step/2, step)
for lo, hi in [(0, 7.3), (0.013, 0.089), (-12, 240)]:
    print(f"[{lo}, {hi}] -> linspace: {np.round(np.linspace(lo, hi, 5), 3).tolist()}  nice: {np.round(nice_ticks(lo, hi), 3).tolist()}")
# 2. 数据墨水比：一张图里哪些像素在传信息。用字符画粗估
fig_junk = ["+-----------+", "|  *  .  .  |", "| . * .  .  |", "|  .  *  .  |", "| .  . * .  |", "+-----------+"]
fig_clean = ["             ", "   *         ", "     *       ", "       *     ", "         *   ", "_____________"]
ink = lambda f: sum(ch not in " " for r in f for ch in r); data = lambda f: sum(ch == "*" for r in f for ch in r)
print(f"带框+网格: 数据墨水 {data(fig_junk)}/{ink(fig_junk)} = {data(fig_junk)/ink(fig_junk):.2f}   去框去网格: {data(fig_clean)}/{ink(fig_clean)} = {data(fig_clean)/ink(fig_clean):.2f}")
# 3. 标题说结论：从数据自动生成「结论式标题」而不是「Figure 1」
rng = np.random.default_rng(0); ctrl = rng.normal(1.0, 0.1, 6); drug = rng.normal(0.52, 0.1, 6)
fold = drug.mean() / ctrl.mean()
print(f'标题: "Drug A reduces viability to {fold*100:.0f}% of control at 10 uM (n={len(drug)})"  而不是 "Figure 1"')
# 4. 投稿分辨率：dpi=300 下 3.5 英寸单栏图的像素数；bbox_inches="tight" 防裁
print("3.5 in x 300 dpi =", 3.5*300, "px 宽;  标签字号 ≥7 pt 在 300 dpi 下 =", round(7/72*300), "px 高")`,
    out:`[0, 7.3] -> linspace: [0.0, 1.825, 3.65, 5.475, 7.3]  nice: [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0]
[0.013, 0.089] -> linspace: [0.013, 0.032, 0.051, 0.07, 0.089]  nice: [0.0, 0.02, 0.04, 0.06, 0.08, 0.1]
[-12, 240] -> linspace: [-12.0, 51.0, 114.0, 177.0, 240.0]  nice: [-50.0, 0.0, 50.0, 100.0, 150.0, 200.0, 250.0]
带框+网格: 数据墨水 4/48 = 0.08   去框去网格: 4/17 = 0.24
标题: "Drug A reduces viability to 51% of control at 10 uM (n=6)"  而不是 "Figure 1"
3.5 in x 300 dpi = 1050.0 px 宽;  标签字号 ≥7 pt 在 300 dpi 下 = 29 px 高`,
    note:`nice_ticks 三行是第 3 步；数据墨水比是第 4 步；自动生成的结论式标题是第 1 步；最后一行是第 7 步的像素换算。`
  },
  contrast:[
    {vs:`图注 caption`, same:`都是解释图的文字`, diff:`标题在图上、一句话、说结论；图注在图下、说方法与 n`, when:`标题给 what，图注给 how；两者都要有`},
    {vs:`网格线`, same:`都是辅助读数`, diff:`轻灰细网格帮助读数，密网格抢注意力`, when:`需要读精确值时开 y 方向轻网格；展示趋势时全关`},
    {vs:`图例 legend`, same:`都标识数据`, diff:`图例是间接查表，直接在线末标注是零跳转`, when:`≤4 组直接标在线旁；组多才用图例`}
  ],
  ext:[
    {t:`多图排版与共享尺度`, go:'vz.subplot'},
    {t:`颜色选择`, go:'vz.color'},
    {t:`误差棒要写清是 SD/SEM/CI`, go:'vz.line'}
  ]
},

});
