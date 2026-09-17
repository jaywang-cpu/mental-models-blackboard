/* 数理宇宙 v3 · 推导层 · ge 几何大陆（12 节点）
   旁挂文件，不改动 v1/v2。深化层讲"怎么用"，这里只做两件事：把结论证出来、用代码把它跑出来。
   scratch 全部用 python3 + numpy 2.3 实际跑过，out 是真实输出（seed 固定）。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'ge.vector': {
  layers:{
    alg:`向量是有序数组 v = (v₁,…,vₙ)，加法与数乘逐分量。长度 |v| = √(Σvᵢ²) 由勾股逐维归纳。三角不等式 |v + w| ≤ |v| + |w| 由柯西-施瓦茨 v·w ≤ |v||w| 得到。`,
    geo:`箭头没有起点，只有方向和长度；平移不变。两支箭首尾相接得到和，和的长度不超过两段之和（绕路不更短），等号只在同向。`,
    comp:`np.array 一行就是一个向量；加法、数乘、np.linalg.norm 都是逐元素运算加一次归约。基因表达谱、图片展平后都是这个对象，几何性质（长度、夹角）直接可算。`
  },
  proof:{
    from:`平面勾股定理；分量定义的加法与数乘；v·w = Σvᵢwᵢ`,
    to:`n 维长度公式；柯西-施瓦茨；三角不等式与等号条件；平行 ⇔ 数乘`,
    steps:[
      [`二维：v = (x, y)，x 轴分量与 y 轴分量垂直，勾股给 |v|² = x² + y²`, `分量沿正交坐标轴，构成直角三角形`],
      [`n 维归纳：(v₁,…,vₙ) = (v₁,…,vₙ₋₁, 0) + (0,…,0,vₙ)，两者垂直，|v|² = |v_{n−1}|² + vₙ²`, `前 n−1 个坐标张成的子空间与第 n 个坐标轴垂直；再用一次平面勾股`],
      [`柯西-施瓦茨：对任意 t，0 ≤ |v − tw|² = |v|² − 2t(v·w) + t²|w|²`, `长度平方非负；按分量展开平方和得到 t 的二次式`],
      [`二次式恒非负 ⇒ 判别式 ≤ 0：4(v·w)² − 4|v|²|w|² ≤ 0 ⇒ |v·w| ≤ |v||w|`, `一个开口向上的二次函数恒 ≥ 0 当且仅当 Δ ≤ 0`],
      [`|v + w|² = |v|² + 2v·w + |w|² ≤ |v|² + 2|v||w| + |w|² = (|v| + |w|)²`, `展开平方；用第 4 步放大中间项`],
      [`开方得 |v + w| ≤ |v| + |w|；等号 ⇔ v·w = |v||w| ⇔ w = tv (t ≥ 0)`, `等号追溯到第 3 步 |v − tw| = 0，即 v 与 w 同向成比例`],
      [`反向 ||v| − |w|| ≤ |v − w|，所以 |v + w| ∈ [||v| − |w||, |v| + |w|]`, `把三角不等式用在 v = (v − w) + w`],
      [`平行 ⇔ v = kw：二维判据 v₁w₂ − v₂w₁ = 0`, `v = kw 代入叉积为零；反之叉积为零且 w ≠ 0 可解出 k`]
    ],
    end:`向量长度是勾股的 n 维推广，三角不等式是柯西-施瓦茨的推论。这两条让"高维数据点"具备了可用的几何：距离、夹角、投影全部由此出发。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
v, w = rng.normal(size=(1000, 7)), rng.normal(size=(1000, 7))
nv, nw = np.linalg.norm(v, axis=1), np.linalg.norm(w, axis=1)
print("|v|^2 == sum v_i^2:", np.allclose(nv**2, (v*v).sum(1)), " (3,4)->", np.linalg.norm([3, 4]))
dot = (v*w).sum(1)
print("Cauchy-Schwarz |v.w| <= |v||w|:", np.all(np.abs(dot) <= nv*nw + 1e-12))
print("triangle |v+w| <= |v|+|w|:", np.all(np.linalg.norm(v+w, axis=1) <= nv + nw + 1e-12))
print("reverse ||v|-|w|| <= |v-w|:", np.all(np.abs(nv-nw) <= np.linalg.norm(v-w, axis=1) + 1e-12))
u = v[0]; print("equality when w = 2v:", np.isclose(np.linalg.norm(u + 2*u), np.linalg.norm(u) + np.linalg.norm(2*u)))
print("|v|=3,|w|=4: range of |v+w| =", [1, 7], " perpendicular:", np.linalg.norm(np.array([3, 0]) + np.array([0, 4])))
print("unit of (3,4):", np.array([3, 4])/5, " parallel test (1,2)&(2,4):", 1*4 - 2*2 == 0)`,
    out:`|v|^2 == sum v_i^2: True  (3,4)-> 5.0
Cauchy-Schwarz |v.w| <= |v||w|: True
triangle |v+w| <= |v|+|w|: True
reverse ||v|-|w|| <= |v-w|: True
equality when w = 2v: True
|v|=3,|w|=4: range of |v+w| = [1, 7]  perpendicular: 5.0
unit of (3,4): [0.6 0.8]  parallel test (1,2)&(2,4): True`,
    note:`第 1 行是第 1-2 步；Cauchy-Schwarz 行是第 4 步；triangle/reverse 是第 5-7 步；w = 2v 等号是第 6 步；最后一行是第 8 步。`
  },
  contrast:[
    {vs:`点（坐标）`, same:`都写成 (x, y)`, diff:`点是位置，向量是位移；两点之差是向量，点加向量还是点`, when:`描述位置用点；描述变化、方向用向量`},
    {vs:`标量`, same:`都是"数"`, diff:`标量只有大小，向量有方向；标量乘法有交换律，向量没有"向量乘向量得向量"的通用乘法`, when:`温度、质量是标量；速度、力是向量`},
    {vs:`绝对值不等式 al.abs_ineq`, same:`三角不等式形式相同`, diff:`一维只需 ab ≤ |a||b|；高维要柯西-施瓦茨`, when:`一维用绝对值；高维用范数`},
    {vs:`列表 / 数组 np.array_shape`, same:`向量在机器里就是一维数组`, diff:`数组是容器，向量是带线性结构的对象；Python list 相加是拼接，np.array 相加才是向量加`, when:`要几何运算一定用 numpy 数组`}
  ],
  ext:[
    {t:`点积：长度与夹角的来源`, go:'ge.dot_projection'},
    {t:`基与坐标：同一支箭在不同基下的名字`, go:'la.basis'},
    {t:`numpy 里的向量形状与广播`, go:'np.broadcast'}
  ]
},

'ge.dot_projection': {
  layers:{
    alg:`两种定义 v·w = Σvᵢwᵢ 与 v·w = |v||w|cosθ 通过余弦定理等价。投影 proj_w v = (v·w / w·w) w 是最小化 |v − tw|² 的解。`,
    geo:`把 v 垂直压到 w 所在直线上，影子长 |v|cosθ；点积 = 影子长 × |w|。投影向量就是影子，残差 v − proj 垂直于 w。`,
    comp:`np.dot 是乘加；余弦相似度是先归一化再点积；注意力打分 QKᵀ 是一批点积。投影一行：(v@w)/(w@w)*w。`
  },
  proof:{
    from:`余弦定理 |v − w|² = |v|² + |w|² − 2|v||w|cosθ；分量定义 |u|² = Σuᵢ²`,
    to:`Σvᵢwᵢ = |v||w|cosθ；投影公式；残差垂直；余弦相似度`,
    steps:[
      [`按分量展开 |v − w|² = Σ(vᵢ − wᵢ)² = Σvᵢ² + Σwᵢ² − 2Σvᵢwᵢ`, `完全平方逐项展开再求和`],
      [`余弦定理给出同一个量 |v − w|² = |v|² + |w|² − 2|v||w|cosθ`, `v、w、v − w 构成三角形，θ 是 v 与 w 的夹角`],
      [`两式相减：Σvᵢwᵢ = |v||w|cosθ`, `|v|² = Σvᵢ²、|w|² = Σwᵢ² 相同项抵消，只剩交叉项`],
      [`推论：cosθ = v·w / (|v||w|)；v·w = 0 ⇔ θ = 90°（v、w 非零）`, `除以非零长度；cos 在 (0,π) 内仅在 π/2 为零`],
      [`投影：求 t 使 |v − tw|² 最小。f(t) = |v|² − 2t(v·w) + t²|w|²，f'(t) = 0 ⇒ t* = v·w / |w|²`, `f 是开口向上的二次函数，驻点即最小点`],
      [`proj_w v = t* w = (v·w / w·w) w，长度 |t*||w| = |v·w|/|w| = |v||cosθ|`, `代入 t*；用第 3 步换算`],
      [`残差 r = v − t*w 满足 r·w = v·w − t*|w|² = 0`, `代入 t* 恰好抵消；这就是"最小误差 ⇔ 残差垂直"`],
      [`余弦相似度 = (v/|v|)·(w/|w|)，只看方向；点积还受长度影响`, `归一化后长度为 1，点积退化为 cosθ`]
    ],
    end:`两种点积定义的等价是余弦定理的一行代数；投影公式来自最小化残差，残差必垂直。最小二乘、PCA、注意力都是这一页的推广。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
v, w = rng.normal(size=(2000, 5)), rng.normal(size=(2000, 5))
nv, nw = np.linalg.norm(v, axis=1), np.linalg.norm(w, axis=1)
cos_from_lawcos = (nv**2 + nw**2 - np.linalg.norm(v-w, axis=1)**2) / (2*nv*nw)      # 由余弦定理反解 cosθ
print("sum v_i w_i == |v||w|cos(theta):", np.allclose((v*w).sum(1), nv*nw*cos_from_lawcos))
a, b = np.array([1., 2.]), np.array([3., 4.])
print("(1,2).(3,4) =", a @ b, " cos =", (a@b)/(np.linalg.norm(a)*np.linalg.norm(b)).round(4))
t = (v*w).sum(1) / (w*w).sum(1); proj = t[:, None]*w; resid = v - proj
print("residual perpendicular to w:", np.allclose((resid*w).sum(1), 0))
ts = np.linspace(-3, 3, 6001); i = 0
dists = [np.linalg.norm(v[i] - s*w[i]) for s in ts]
print(f"argmin_t |v - t w| by grid = {ts[np.argmin(dists)]:.3f}  formula t* = {t[i]:.3f}")
print("proj of (2,2) on (1,0):", (np.array([2.,2.]) @ np.array([1.,0.])) / 1 * np.array([1., 0.]))
big = 10*a; print("dot grows with length:", a@b, "->", big@b, "  cosine unchanged:", np.isclose((a@b)/(np.linalg.norm(a)*np.linalg.norm(b)), (big@b)/(np.linalg.norm(big)*np.linalg.norm(b))))`,
    out:`sum v_i w_i == |v||w|cos(theta): True
(1,2).(3,4) = 11.0  cos = 0.9838734202123377
residual perpendicular to w: True
argmin_t |v - t w| by grid = -0.226  formula t* = -0.226
proj of (2,2) on (1,0): [2. 0.]
dot grows with length: 11.0 -> 110.0   cosine unchanged: True`,
    note:`第 1 行是第 1-3 步（从余弦定理反解的 cosθ 与分量点积一致）；residual 行是第 7 步；grid 与 t* 相同是第 5 步；最后一行是第 8 步。`
  },
  contrast:[
    {vs:`叉积 ge.area_cross`, same:`都是两向量的乘积`, diff:`点积是数，测同向程度（cos）；叉积测垂直程度（sin），二维是数三维是向量`, when:`要相似度、投影用点积；要面积、法向量用叉积`},
    {vs:`余弦相似度`, same:`同一个 cosθ`, diff:`点积未归一化，长向量会得到更大的值；余弦只看方向`, when:`长度有意义（如表达量总量）用点积；只比方向用余弦`},
    {vs:`相关系数 pr.covariance`, same:`相关系数 = 中心化后向量的余弦`, diff:`相关系数先减均值；余弦不减`, when:`统计相关用相关系数；embedding 相似用余弦`},
    {vs:`矩阵投影 la.projection`, same:`投影到一条线是投影到子空间的特例`, diff:`子空间投影用 A(AᵀA)⁻¹Aᵀ，一条线时 AᵀA 是标量 w·w`, when:`一个方向用本节；多个方向用矩阵`}
  ],
  ext:[
    {t:`投影到子空间与最小二乘`, go:'la.projection'},
    {t:`注意力打分就是一批点积`, go:'dl.attention'},
    {t:`协方差与相关系数是中心化点积`, go:'pr.covariance'},
    {t:`SVM 的间隔是到超平面的投影长`, go:'ml.svm'}
  ]
},

'ge.unit_circle': {
  layers:{
    alg:`弧度 θ = 弧长 / 半径，单位圆上弧长就是 θ。点 P(θ) = (cos θ, sin θ) 满足 cos² + sin² = 1。0 < θ < π/2 时 sin θ < θ < tan θ。`,
    geo:`半径 1 的圆，从 (1,0) 逆时针走弧长 θ 到达的点，它的横纵坐标就是 cos、sin。走满一圈弧长 2π，所以 2π rad = 360°。`,
    comp:`np.cos/np.sin 吃弧度；度转弧度乘 π/180。随机方向向量：θ ~ U(0, 2π)，取 (cos θ, sin θ) 就是单位圆上均匀点。`
  },
  proof:{
    from:`圆的定义：到圆心距离为 r 的点集；弧长与半径成正比；扇形面积 = r²θ/2`,
    to:`弧度定义与角度换算；cos² + sin² = 1；象限符号；sin θ < θ < tan θ 及 sin θ ≈ θ`,
    steps:[
      [`相似圆的弧长与半径成正比，所以 弧长/半径 只依赖角，定义它为弧度`, `所有圆相似，同一圆心角对应的弧长按半径等比放大`],
      [`整圆周长 2πr，弧长/半径 = 2π，所以 360° = 2π rad，1 rad = 180/π ≈ 57.3°`, `周长公式；比例换算`],
      [`单位圆上点 P = (x, y)，|OP| = 1 ⇒ x² + y² = 1，定义 x = cos θ、y = sin θ 即得 cos² + sin² = 1`, `圆的定义 + 勾股`],
      [`象限：cos 的符号跟 x，sin 的符号跟 y；θ 与 θ + 2π 是同一个点`, `坐标符号由所在象限决定；绕一整圈回到原处`],
      [`0 < θ < π/2：三角形 OAP 面积 = sin θ / 2（底 1 高 sin θ）`, `A = (1,0)，P 到 x 轴的高是 sin θ`],
      [`扇形 OAP 面积 = θ/2；三角形 OAT 面积 = tan θ / 2（T 是切线与 OP 延长线交点）`, `扇形面积 r²θ/2 取 r = 1；切线段长 tan θ`],
      [`三者包含关系：三角形 OAP ⊂ 扇形 ⊂ 三角形 OAT，所以 sin θ < θ < tan θ`, `面积单调于包含`],
      [`除以 sin θ：1 < θ/sin θ < 1/cos θ → 1，夹逼得 sin θ / θ → 1，即 sin θ ≈ θ`, `cos θ → 1；夹逼定理`]
    ],
    end:`弧度不是单位换算，它是"弧长即角"的定义，因此 sin θ ≈ θ 是几何事实而非近似技巧。所有三角函数的微积分性质（导数、级数）都依赖这个选择。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
th = rng.uniform(0, 2*np.pi, 5000)
P = np.stack([np.cos(th), np.sin(th)], 1)
print("cos^2+sin^2==1:", np.allclose((P**2).sum(1), 1), " 2pi rad =", np.degrees(2*np.pi), "deg  1 rad =", np.degrees(1).round(2), "deg")
print("150deg ->", np.cos(np.radians(150)).round(4), np.sin(np.radians(150)).round(4), " (-sqrt3/2, 1/2) =", (-np.sqrt(3)/2).round(4), 0.5)
print("pi/4 =", np.degrees(np.pi/4), "deg   cos(-60)=", np.cos(np.radians(-60)).round(4), "  P(pi) =", np.cos(np.pi), np.sin(np.pi).round(12))
q = [(np.sign(np.cos(t)), np.sign(np.sin(t))) for t in np.radians([45, 135, 225, 315])]
print("quadrant signs (cos, sin):", q)
# 弧长 = 角：用折线近似单位圆上从 0 到 theta 的弧长
theta = 1.2; ts = np.linspace(0, theta, 100001); arc = np.sum(np.hypot(np.diff(np.cos(ts)), np.diff(np.sin(ts))))
print(f"arc length from 0 to {theta} rad = {arc:.6f}")
for x in [0.5, 0.1, 0.01]:
    print(f"x={x}: sin={np.sin(x):.6f} < x < tan={np.tan(x):.6f}  sin/x={np.sin(x)/x:.6f}")`,
    out:`cos^2+sin^2==1: True  2pi rad = 360.0 deg  1 rad = 57.3 deg
150deg -> -0.866 0.5  (-sqrt3/2, 1/2) = -0.866 0.5
pi/4 = 45.0 deg   cos(-60)= 0.5   P(pi) = -1.0 0.0
quadrant signs (cos, sin): [(np.float64(1.0), np.float64(1.0)), (np.float64(-1.0), np.float64(1.0)), (np.float64(-1.0), np.float64(-1.0)), (np.float64(1.0), np.float64(-1.0))]
arc length from 0 to 1.2 rad = 1.200000
x=0.5: sin=0.479426 < x < tan=0.546302  sin/x=0.958851
x=0.1: sin=0.099833 < x < tan=0.100335  sin/x=0.998334
x=0.01: sin=0.010000 < x < tan=0.010000  sin/x=0.999983`,
    note:`arc length 等于 θ 是第 1 步的定义；cos²+sin² 是第 3 步；quadrant signs 是第 4 步；最后三行是第 7-8 步的夹逼。`
  },
  contrast:[
    {vs:`三角函数恒等式 al.trig`, same:`同一个圆`, diff:`本节是定义与弧度；那里从旋转矩阵推和角公式`, when:`概念与象限看本节；推恒等式看 al.trig`},
    {vs:`极坐标 ge.polar`, same:`(r cos θ, r sin θ)`, diff:`单位圆固定 r = 1 只有角；极坐标多一个半径自由度`, when:`只关心方向用单位圆；有远近用极坐标`},
    {vs:`角度制`, same:`都度量角`, diff:`角度是人为分 360 份；弧度由弧长定义，让 (sin x)' = cos x 没有多余常数`, when:`报给人看用度；任何计算用弧度`}
  ],
  ext:[
    {t:`和角、倍角公式从旋转矩阵来`, go:'al.trig'},
    {t:`加上半径就是极坐标与复数`, go:'ge.polar'},
    {t:`圆周角定理：圆上的角`, go:'ge.inscribed_angle'},
    {t:`e^{iθ} 就是单位圆上的点`, go:'cx.euler'}
  ]
},

'ge.conic': {
  layers:{
    alg:`焦点-准线定义：|PF| = e·|PL|。取 F 在原点、准线 x = −d，得 x² + y² = e²(x + d)²，整理为 (1 − e²)x² − 2e²d·x + y² = e²d²。e < 1 二次项同号是椭圆，e = 1 二次项消失是抛物线，e > 1 异号是双曲线。`,
    geo:`一个点 F 和一条线 L，到 F 的距离与到 L 的距离之比恒为 e 的点的轨迹。e 小时点被 F 拉得紧，闭合成椭圆；e = 1 时刚好逃逸；e > 1 时被 L 推开成两支。`,
    comp:`用极坐标 r = ed / (1 − e cos θ) 一行生成三种曲线，只改 e。判断一条二次曲线是什么：算 B² − 4AC 的符号，负椭圆、零抛物、正双曲。`
  },
  proof:{
    from:`点到点的距离、点到直线的距离；焦点-准线定义 |PF| = e|PL|，e > 0`,
    to:`三种曲线由 e 统一；标准方程中 e = c/a；协方差等高线是椭圆`,
    steps:[
      [`设 F = (0,0)，准线 x = −d。P = (x,y)：|PF| = √(x² + y²)，|PL| = x + d`, `坐标选取不失一般性；点到竖直线的距离是横坐标差`],
      [`|PF| = e|PL| 两边平方：x² + y² = e²(x + d)²`, `两边非负，平方等价`],
      [`展开整理：(1 − e²)x² − 2e²d·x + y² − e²d² = 0`, `移项合并 x² 项`],
      [`e = 1：x² 项消失，y² = 2d·x + d²，是开口向右的抛物线`, `只剩 y 的二次与 x 的一次，正是 y² = 4p(x − x₀) 的形状`],
      [`e ≠ 1：配方 (1 − e²)(x − e²d/(1−e²))² + y² = e²d² + e⁴d²/(1−e²) = e²d²/(1−e²)`, `对 x 配方，常数项合并`],
      [`除以右边：(x − h)²/a² + y²/b² = 1，其中 a² = e²d²/(1−e²)²，b² = e²d²/(1−e²)`, `标准化；e < 1 时 1 − e² > 0，a², b² 都正，是椭圆；e > 1 时 b² < 0，是双曲线 (x−h)²/a² − y²/|b²| = 1`],
      [`椭圆：c² = a² − b² = e²d²[1 − (1−e²)]/(1−e²)² = e⁴d²/(1−e²)² = e²a²，所以 e = c/a`, `代入 a²、b² 直接计算；双曲线同理 c² = a² + |b²| = e²a²`],
      [`一般二次曲线 Ax² + Bxy + Cy² + … = 0：旋转消去 xy 后二次项系数的乘积符号不变，等于 −(B² − 4AC)/4 的符号`, `B² − 4AC 是旋转不变量；二次项同号椭圆、一个为零抛物线、异号双曲线`]
    ],
    end:`三种圆锥曲线是同一个方程在 e 的三个区间里的样子，e = c/a 不是定义而是推论。协方差矩阵的等高线 xᵀΣ⁻¹x = 1 是 B² − 4AC < 0 的椭圆，主轴就是特征向量。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
d = 2.0
for e in [0.5, 1.0, 2.0]:
    th = rng.uniform(0, 2*np.pi, 4000)
    r = e*d / (1 - e*np.cos(th)); m = r > 0                   # 极坐标形式，焦点在原点、准线 x=-d
    x, y = r[m]*np.cos(th[m]), r[m]*np.sin(th[m])
    ratio = np.hypot(x, y) / np.abs(x + d)
    # 由 (1-e^2)x^2 - 2 e^2 d x + y^2 - e^2 d^2 = 0 的系数判定类型
    A, C = 1 - e*e, 1.0; kind = "parabola" if np.isclose(A, 0) else ("ellipse" if A*C > 0 else "hyperbola")
    print(f"e={e}: |PF|/|PL| = {ratio.mean():.6f} (std {ratio.std():.1e})  A*C={A*C:+.2f} -> {kind}")
# 标准椭圆 x^2/25 + y^2/9 = 1：e = c/a，焦点 (±4,0)，且 |PF1|+|PF2| = 2a
a, b = 5.0, 3.0; c = np.sqrt(a*a - b*b); t = rng.uniform(0, 2*np.pi, 1000); x, y = a*np.cos(t), b*np.sin(t)
print("ellipse foci c =", c, " e=c/a =", c/a, " |PF1|+|PF2| == 2a:", np.allclose(np.hypot(x-c, y) + np.hypot(x+c, y), 2*a))
print("y^2=8x focus (p,0), 4p=8 -> p =", 8/4, "   x^2-y^2=1 asymptote slopes +-b/a =", 1/1)
S = np.array([[2.0, 0.8], [0.8, 1.0]]); w, V = np.linalg.eigh(np.linalg.inv(S))
Aq, Bq, Cq = np.linalg.inv(S)[0,0], 2*np.linalg.inv(S)[0,1], np.linalg.inv(S)[1,1]
print("covariance contour x^T S^-1 x = 1: B^2-4AC =", round(Bq*Bq - 4*Aq*Cq, 3), "<0 ellipse; axis dirs = eigvecs:", V.round(3).tolist())`,
    out:`e=0.5: |PF|/|PL| = 0.500000 (std 6.3e-17)  A*C=+0.75 -> ellipse
e=1.0: |PF|/|PL| = 1.000000 (std 1.3e-16)  A*C=+0.00 -> parabola
e=2.0: |PF|/|PL| = 2.000000 (std 3.8e-16)  A*C=-3.00 -> hyperbola
ellipse foci c = 4.0  e=c/a = 0.8  |PF1|+|PF2| == 2a: True
y^2=8x focus (p,0), 4p=8 -> p = 2.0    x^2-y^2=1 asymptote slopes +-b/a = 1.0
covariance contour x^T S^-1 x = 1: B^2-4AC = -2.941 <0 ellipse; axis dirs = eigvecs: [[-0.875, -0.485], [-0.485, 0.875]]`,
    note:`三行 |PF|/|PL| 恒等于 e 验证第 1-2 步的定义；A·C 符号判类型是第 4-6 步；椭圆 c/a 与焦距和是第 7 步；最后一行是第 8 步与协方差椭圆。`
  },
  contrast:[
    {vs:`二次函数 al.quadratic`, same:`抛物线是二次函数的图像`, diff:`二次函数 y = ax² 是抛物线的特例（轴竖直）；圆锥曲线是一般二元二次方程，含 xy 项与旋转`, when:`函数关系用 y = ax²；几何轨迹用圆锥曲线`},
    {vs:`特征值分解 la.eigen`, same:`二次型的等高线是圆锥曲线`, diff:`特征向量给主轴方向，特征值给半轴长的平方倒数`, when:`协方差、Hessian 的等高线形状看特征值`},
    {vs:`圆`, same:`e = 0 的极限`, diff:`圆没有单独的准线（d → ∞）；两焦点重合`, when:`圆是椭圆的退化，公式里令 c = 0`}
  ],
  ext:[
    {t:`二次型的等高线与主轴：特征分解`, go:'la.eigen'},
    {t:`PCA 就是找协方差椭圆的主轴`, go:'ml.pca'},
    {t:`画等高线`, go:'vz.contour'}
  ]
},

'ge.transform': {
  layers:{
    alg:`线性变换 T 由基向量的像决定：T(x e₁ + y e₂) = x T(e₁) + y T(e₂)，所以矩阵的列 = 基的像。复合 = 矩阵乘法 (AB)v = A(Bv)，右边先作用。仿射 x ↦ Ax + b 不保原点，用齐次坐标 [A b; 0 1] 变回线性。`,
    geo:`网格纸被拉伸、旋转、推斜：直线仍是直线、平行仍平行、原点不动。平移是整张纸搬家。先转后搬与先搬后转的终点不同，因为转是绕原点转，搬过之后原点在别处。`,
    comp:`图像增强、3D 渲染、坐标系变换都是一串矩阵连乘；用齐次坐标把平移也塞进矩阵，整条流水线就是一次 4×4 乘法。图像坐标 y 向下，视觉上旋转方向反过来。`
  },
  proof:{
    from:`线性：T(u + v) = T(u) + T(v)，T(cu) = cT(u)；矩阵乘法定义`,
    to:`矩阵的列是基的像；旋转矩阵；复合是乘法且不交换；齐次坐标包含平移`,
    steps:[
      [`任意 v = x e₁ + y e₂，T(v) = x T(e₁) + y T(e₂)`, `线性的两条性质`],
      [`把 T(e₁)、T(e₂) 按列排成矩阵 M，则 T(v) = M [x; y]`, `矩阵乘向量的定义就是列的线性组合，系数是 v 的坐标`],
      [`旋转 θ：e₁ → (cos θ, sin θ)，e₂ → (−sin θ, cos θ)，所以 R(θ) = [[c, −s],[s, c]]`, `单位圆上转 θ 的坐标；e₂ 领先 90°`],
      [`复合：先 B 后 A，v ↦ A(Bv) = (AB)v`, `矩阵乘法的结合律；写法上右边的矩阵先作用`],
      [`一般 AB ≠ BA：R(90°)·diag(2,1) 与 diag(2,1)·R(90°) 把 e₁ 分别送到 (0,2) 与 (0,1)`, `逐列计算即可看出不同`],
      [`平移 v ↦ v + b 不线性（T(0) = b ≠ 0），所以不能写成 2×2 矩阵`, `线性变换必须保原点`],
      [`齐次坐标 [x; y; 1]，矩阵 H = [[A, b],[0, 1]]：H[v; 1] = [Av + b; 1]`, `分块乘法，最后一行保持 1；平移变成了线性`],
      [`先转后移 H = T_b R，先移后转 H' = R T_b = T_{Rb} R，二者相差平移量 b 与 Rb`, `分块乘法：R T_b [v;1] = [R(v + b); 1] = [Rv + Rb; 1]`]
    ],
    end:`矩阵是线性变换的名字，列告诉你基去了哪；复合就是乘法，所以顺序不能换。齐次坐标把平移收编，整个图形学和坐标系变换就只剩矩阵链。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
R = lambda t: np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
S = np.diag([2.0, 1.0]); K = np.array([[1.0, 0.5], [0.0, 1.0]])
v = np.array([1.0, 1.0]); e1, e2 = np.eye(2)
M = np.column_stack([R(np.pi/3) @ e1, R(np.pi/3) @ e2])
print("columns are images of basis:", np.allclose(M, R(np.pi/3)))
print("R(90)(1,0) =", (R(np.pi/2) @ e1).round(6), "  R(90) matrix:", R(np.pi/2).round(6).tolist())
print("compose = product: R(S v) == (R S) v:", np.allclose(R(0.7) @ (S @ v), (R(0.7) @ S) @ v))
print("RS e1 =", (R(np.pi/2) @ S @ e1).round(6), " SR e1 =", (S @ R(np.pi/2) @ e1).round(6), " -> not commutative")
# 直线保直线、平行保平行：三点共线的像仍共线
P = np.array([[0, 0], [1, 2], [2, 4]], float).T; Q = K @ R(0.4) @ P
print("collinear preserved:", np.isclose(np.linalg.det(np.column_stack([Q[:,1]-Q[:,0], Q[:,2]-Q[:,0]])), 0))
H = lambda A, b: np.block([[A, np.array(b)[:, None]], [np.zeros((1, 2)), np.ones((1, 1))]])
vh = np.array([1.0, 1.0, 1.0])
print("scale x2 then translate (1,0):", (H(np.eye(2), [1, 0]) @ H(S, [0, 0]) @ vh)[:2])
print("translate (1,0) then rot90:", (H(R(np.pi/2), [0, 0]) @ H(np.eye(2), [1, 0]) @ vh)[:2].round(6), "  rot90 then translate:", (H(np.eye(2), [1, 0]) @ H(R(np.pi/2), [0, 0]) @ vh)[:2].round(6))`,
    out:`columns are images of basis: True
R(90)(1,0) = [0. 1.]   R(90) matrix: [[0.0, -1.0], [1.0, 0.0]]
compose = product: R(S v) == (R S) v: True
RS e1 = [0. 2.]  SR e1 = [0. 1.]  -> not commutative
collinear preserved: True
scale x2 then translate (1,0): [3. 1.]
translate (1,0) then rot90: [-1.  2.]   rot90 then translate: [0. 1.]`,
    note:`第 1 行是第 1-2 步；R(90) 行是第 3 步；compose 与 not commutative 是第 4-5 步；collinear 验证线性变换保直线；最后两行是第 7-8 步的齐次坐标与顺序差异。`
  },
  contrast:[
    {vs:`矩阵作为变换 la.matrix_transform`, same:`同一件事`, diff:`本节聚焦二维几何直觉（旋转、缩放、剪切、平移）；那里推广到任意维与列空间`, when:`画图理解看本节；做线性代数看那里`},
    {vs:`相似 ge.similar`, same:`缩放是变换的一种`, diff:`相似变换 = 旋转 + 等比缩放 + 平移，保角；一般线性变换（剪切、非等比缩放）不保角`, when:`要保形状用相似；要一般变形用仿射`},
    {vs:`坐标变换 vs 物体变换`, same:`同一个矩阵`, diff:`动物体等价于反向动坐标系；矩阵互为逆`, when:`相机外参是坐标变换，模型摆放是物体变换，别混`},
    {vs:`卷积 dl.cnn`, same:`都对图像做线性操作`, diff:`几何变换改变像素位置，卷积改变像素值；数据增强用前者，特征提取用后者`, when:`旋转翻转是增强；边缘检测是卷积`}
  ],
  ext:[
    {t:`一般维的矩阵变换与列空间`, go:'la.matrix_transform'},
    {t:`正交矩阵：保长度保角的变换`, go:'la.orthogonal'},
    {t:`复数乘法 = 旋转加缩放的紧凑写法`, go:'ge.polar'},
    {t:`3D 可视化里的视角变换`, go:'vz.3d'}
  ]
},

'ge.distance': {
  layers:{
    alg:`欧氏距离 d(P,Q) = |P − Q| = √((P−Q)·(P−Q))。点到直线 ax + by + c = 0：法向量 n = (a,b)，任取线上一点 P₀，距离 = |n·(P − P₀)| / |n| = |ax₀ + by₀ + c| / √(a² + b²)。`,
    geo:`两点连线是直角三角形的斜边。点到直线的最近点是垂足，因为斜边比直角边长；距离就是沿法向量方向的投影长。`,
    comp:`高维用 np.linalg.norm(P − Q)；批量用广播 ((X[:,None]−Y[None])**2).sum(−1)。特征先标准化，否则大数值特征独占距离。高维时所有距离趋同，改余弦或先降维。`
  },
  proof:{
    from:`勾股定理；点积与投影；|n| = √(a² + b²)`,
    to:`两点距离；点到直线距离公式；最近点是垂足；曼哈顿距离与三角不等式`,
    steps:[
      [`P = (x₁,y₁)，Q = (x₂,y₂)，Δx、Δy 是直角边，d = √(Δx² + Δy²)`, `坐标轴正交，两点的坐标差构成直角三角形`],
      [`推广 d² = (P − Q)·(P − Q) = Σ(pᵢ − qᵢ)²`, `n 维向量长度 |v|² = v·v`],
      [`直线 L: ax + by + c = 0 上任取 P₀，则 a x₀' + b y₀' = −c；对 L 上任意点 Q，n·(Q − P₀) = 0`, `两点都满足方程，相减得 a(Δx) + b(Δy) = 0，即法向量垂直于线上任意方向`],
      [`点 P 到 L 上任意点 Q 的向量 P − Q 分解为沿 n 的分量与沿线方向的分量`, `n 与线方向正交，构成一组基`],
      [`|P − Q|² = (沿 n 分量)² + (沿线分量)² ≥ (沿 n 分量)²，等号 ⇔ 沿线分量为 0 ⇔ Q 是垂足`, `勾股；最近点使沿线分量消失`],
      [`沿 n 分量 = |n·(P − Q)| / |n| = |n·(P − P₀)| / |n|（对线上任意 Q 都一样）`, `投影长公式；n·Q = n·P₀ = −c 由第 3 步`],
      [`n·P + c = a x₀ + b y₀ + c，所以 d = |a x₀ + b y₀ + c| / √(a² + b²)`, `代入 n·P₀ = −c`],
      [`曼哈顿 |Δx| + |Δy| ≥ √(Δx² + Δy²)，两者都满足三角不等式，都是合法距离`, `(|Δx| + |Δy|)² = Δx² + Δy² + 2|Δx||Δy| ≥ Δx² + Δy²`]
    ],
    end:`距离 = 长度 = 点积开方；点到直线距离 = 沿法向量的投影长，最近点是垂足。KNN、K-means、SVM 间隔、最小二乘残差全部是这一条。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
P, Q = np.array([1., 2.]), np.array([4., 6.])
print("dist (1,2)-(4,6) =", np.linalg.norm(P-Q), " manhattan =", np.abs(P-Q).sum())
def dist_line(p, a, b, c): return abs(a*p[0] + b*p[1] + c) / np.hypot(a, b)
print("(1,1) to 3x+4y-12=0:", dist_line((1, 1), 3, 4, -12), "  (0,0) to x-y+2=0:", dist_line((0, 0), 1, -1, 2).round(6), "= sqrt2 =", np.sqrt(2).round(6))
# 最近点是垂足：在直线上采样，最小距离等于公式值，且最近点处 (P-Q) 平行于法向量
a, b, c = 3., 4., -12.; p = np.array([1., 1.]); n = np.array([a, b]); dirv = np.array([b, -a])
P0 = np.array([0., -c/b]); ts = np.linspace(-5, 5, 200001); Qs = P0[None] + ts[:, None]*dirv[None]
ds = np.linalg.norm(Qs - p, axis=1); k = ds.argmin()
print(f"min over line = {ds[k]:.6f}  formula = {dist_line(p, a, b, c):.6f}  (P-Q_min) x n = {np.cross(p - Qs[k], n):.2e} (parallel)")
# 高维距离趋同
for dim in [2, 20, 200, 2000]:
    X = rng.normal(size=(300, dim)); D = np.linalg.norm(X[:, None] - X[None], axis=-1); D = D[np.triu_indices(300, 1)]
    print(f"dim={dim:4d}: (max-min)/mean of pairwise dist = {(D.max()-D.min())/D.mean():.3f}")
# 量纲：一个特征放大 1000 倍后独占距离
X = rng.normal(size=(100, 2)); X2 = X.copy(); X2[:, 0] *= 1000
d1 = np.linalg.norm(X[0]-X[1:], axis=1); d2 = np.linalg.norm(X2[0]-X2[1:], axis=1)
print("nearest neighbor same before/after scaling one feature?", d1.argmin() == d2.argmin())`,
    out:`dist (1,2)-(4,6) = 5.0  manhattan = 7.0
(1,1) to 3x+4y-12=0: 1.0   (0,0) to x-y+2=0: 1.414214 = sqrt2 = 1.414214
min over line = 1.000000  formula = 1.000000  (P-Q_min) x n = -8.88e-15 (parallel)
dim=   2: (max-min)/mean of pairwise dist = 3.957
dim=  20: (max-min)/mean of pairwise dist = 1.231
dim= 200: (max-min)/mean of pairwise dist = 0.381
dim=2000: (max-min)/mean of pairwise dist = 0.127
nearest neighbor same before/after scaling one feature? True`,
    note:`dist_line 是第 7 步；min over line 等于公式且 (P−Q) 与 n 平行是第 5-6 步；dim 表展示高维趋同；最后一行展示未标准化的后果。`
  },
  contrast:[
    {vs:`范数 / 绝对值 al.abs_ineq`, same:`距离 d(P,Q) = |P − Q|`, diff:`范数是向量的长度，距离是两点之差的范数`, when:`单个向量说范数；两点之间说距离`},
    {vs:`余弦距离`, same:`都衡量不相似`, diff:`欧氏看差向量长度，余弦只看夹角，不受长度影响`, when:`高维稀疏、长度无意义时用余弦`},
    {vs:`马氏距离`, same:`都是二次型开方`, diff:`马氏用 Σ⁻¹ 加权，消除量纲与相关性；欧氏用单位矩阵`, when:`特征相关或量纲不同先标准化，或直接用马氏`},
    {vs:`点到平面 / 超平面`, same:`同一个公式 |wᵀx + b| / |w|`, diff:`法向量从 (a,b) 变成 w ∈ Rⁿ`, when:`SVM 的间隔就是它`}
  ],
  ext:[
    {t:`勾股定理是距离的根`, go:'ge.pythagoras'},
    {t:`法向量与超平面`, go:'ge.normal_line'},
    {t:`KNN 与 K-means 全靠距离`, go:'ml.knn'},
    {t:`标准化再算距离`, go:'da.normalize'}
  ]
},

'ge.area_cross': {
  layers:{
    alg:`二维叉积 a × b = a₁b₂ − a₂b₁。拉格朗日恒等式 (a₁b₂ − a₂b₁)² = |a|²|b|² − (a·b)² 给出 |a × b| = |a||b| sin θ = 平行四边形面积。鞋带公式是把多边形切成以原点为顶点的三角形后叉积求和。`,
    geo:`两支箭张成平行四边形，底 |a|、高 |b| sin θ。符号是从 a 到 b 逆时针为正。多边形从原点出发扇形切分，外侧三角形为正、回程为负，正负抵消后恰好剩下多边形本身。`,
    comp:`np.cross 对二维返回标量；三维返回法向量。鞋带公式向量化：0.5*abs(np.dot(x, np.roll(y,−1)) − np.dot(y, np.roll(x,−1)))。`
  },
  proof:{
    from:`点积 a·b = |a||b| cos θ；sin² + cos² = 1；三角形面积 = 底×高/2`,
    to:`|a₁b₂ − a₂b₁| = |a||b| sin θ = 平行四边形面积；三点三角形面积公式；鞋带公式；共线 ⇔ 叉积为零`,
    steps:[
      [`拉格朗日恒等式：(a₁² + a₂²)(b₁² + b₂²) − (a₁b₁ + a₂b₂)² = (a₁b₂ − a₂b₁)²`, `两边展开都是 a₁²b₂² + a₂²b₁² − 2a₁a₂b₁b₂，纯代数`],
      [`左边 = |a|²|b|² − (a·b)² = |a|²|b|²(1 − cos²θ) = |a|²|b|² sin²θ`, `点积的几何定义；sin² = 1 − cos²`],
      [`所以 |a₁b₂ − a₂b₁| = |a||b| sin θ`, `两边开方；θ ∈ [0, π] 时 sin θ ≥ 0`],
      [`平行四边形底 |a|，高 = |b| sin θ，面积 = |a||b| sin θ = |a × b|`, `高是 b 在垂直于 a 方向上的分量`],
      [`符号：a × b > 0 ⇔ 从 a 逆时针转到 b 不超过 180°`, `取 a = (1,0)，a × b = b₂，b 在上半平面为正；一般情形旋转不改变叉积（旋转矩阵行列式为 1）`],
      [`三角形 (P₁,P₂,P₃) 面积 = ½|(P₂ − P₁) × (P₃ − P₁)| = ½|x₁(y₂−y₃) + x₂(y₃−y₁) + x₃(y₁−y₂)|`, `三角形是平行四边形的一半；展开叉积整理`],
      [`鞋带：多边形 P₁…Pₙ，S = ½ Σ Pᵢ × Pᵢ₊₁（Pₙ₊₁ = P₁）`, `以原点 O 为顶点把多边形分成三角形 O Pᵢ Pᵢ₊₁，每个有向面积 ½ Pᵢ × Pᵢ₊₁；原点在外时多余部分正负抵消`],
      [`叉积为零 ⇔ sin θ = 0 ⇔ 共线；此时行列式为零、矩阵不可逆`, `第 3 步；面积为零意味着两列线性相关`]
    ],
    end:`叉积就是 2×2 行列式，它测的是"两向量有多不共线"，几何上是有向面积。鞋带公式、行列式几何、雅可比换元的面积因子都是这一条。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
a, b = rng.normal(size=(5000, 2)), rng.normal(size=(5000, 2))
cr = a[:,0]*b[:,1] - a[:,1]*b[:,0]
na, nb = np.linalg.norm(a, axis=1), np.linalg.norm(b, axis=1); dot = (a*b).sum(1)
print("Lagrange: cross^2 == |a|^2|b|^2 - dot^2:", np.allclose(cr**2, na**2*nb**2 - dot**2))
th = np.arccos(np.clip(dot/(na*nb), -1, 1))
print("|cross| == |a||b| sin(theta):", np.allclose(np.abs(cr), na*nb*np.sin(th)))
print("(3,0)x(0,4) =", 3*4 - 0*0, "  (1,2)x(2,4) =", 1*4 - 2*2, "(collinear)")
print("sign: (1,0)x(0,1) =", 1*1 - 0*0, " (0,1)x(1,0) =", 0*0 - 1*1)
tri = lambda p1, p2, p3: 0.5*abs((p2[0]-p1[0])*(p3[1]-p1[1]) - (p2[1]-p1[1])*(p3[0]-p1[0]))
print("triangle (0,0),(4,0),(0,3):", tri((0,0),(4,0),(0,3)), "  (0,0),(2,1),(1,3):", tri((0,0),(2,1),(1,3)))
def shoelace(P):
    x, y = P[:,0], P[:,1]; return 0.5*abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))
sq = np.array([[1,1],[4,1],[4,3],[1,3]], float)
print("shoelace rectangle 3x2 =", shoelace(sq), "  shifted by (10,-7):", shoelace(sq + [10, -7]))
poly = np.array([[0,0],[4,0],[4,4],[2,2],[0,4]], float)             # 凹多边形，面积 = 16 - 4
print("concave polygon area:", shoelace(poly), " (16 - 4 = 12)")
print("det [[a],[b]] == cross:", np.allclose(np.linalg.det(np.stack([a, b], 1)), cr))`,
    out:`Lagrange: cross^2 == |a|^2|b|^2 - dot^2: True
|cross| == |a||b| sin(theta): True
(3,0)x(0,4) = 12   (1,2)x(2,4) = 0 (collinear)
sign: (1,0)x(0,1) = 1  (0,1)x(1,0) = -1
triangle (0,0),(4,0),(0,3): 6.0   (0,0),(2,1),(1,3): 2.5
shoelace rectangle 3x2 = 6.0   shifted by (10,-7): 6.0
concave polygon area: 12.0  (16 - 4 = 12)
det [[a],[b]] == cross: True`,
    note:`Lagrange 行是第 1-2 步；sin 行是第 3-4 步；sign 行是第 5 步；tri 是第 6 步；shoelace 平移不变与凹多边形是第 7 步；最后一行是第 8 步。`
  },
  contrast:[
    {vs:`点积 ge.dot_projection`, same:`都是两向量相乘得数`, diff:`点积 ∝ cos θ 测同向，叉积 ∝ sin θ 测垂直；二者平方和 = |a|²|b|²`, when:`投影用点积，面积用叉积`},
    {vs:`行列式 la.determinant`, same:`二维叉积就是 2×2 行列式`, diff:`行列式推广到 n 维是 n 维体积；叉积作为向量只在三维存在`, when:`二维、三维说叉积；一般维说行列式`},
    {vs:`三维叉积`, same:`长度都是平行四边形面积`, diff:`三维叉积是垂直于两者的向量，方向按右手定则；二维只是一个带符号的数`, when:`要法向量用三维叉积`}
  ],
  ext:[
    {t:`行列式 = n 维有向体积`, go:'la.determinant'},
    {t:`相似比与面积比的平方关系`, go:'ge.similar'},
    {t:`旋转矩阵行列式为 1：保面积`, go:'la.orthogonal'}
  ]
},

'ge.similar': {
  layers:{
    alg:`相似变换 x ↦ kRx + t（R 正交）。长度乘 k，面积乘 k²（det(kR) = k² det R = k²），体积乘 k³。三角形面积 ½ab sin C 中 a、b 各乘 k、C 不变，所以面积乘 k²。`,
    geo:`放大镜下同一个图形：角一个没变，每条边都乘 k。面积是"边 × 边"所以是 k²，体积是"边 × 边 × 边"所以是 k³。表面积/体积 ∝ 1/L，越大的东西越"里面多外面少"。`,
    comp:`图像缩放 k 倍，像素数乘 k²；3D 网格缩放 k 倍，体素数乘 k³。分割算法按面积算细胞大小时，放大倍数改变要按 k² 换算。`
  },
  proof:{
    from:`AA 判定：两角对应相等则相似；相似 ⇔ 对应边成比例 k；三角形面积 = ½ab sin C；行列式是面积缩放因子`,
    to:`面积比 k²；体积比 k³；周长比 k；S/V ∝ 1/L 与平方-立方定律`,
    steps:[
      [`相似三角形对应边 a' = ka，b' = kb，夹角 C' = C`, `相似的定义：角相等、边成比例`],
      [`面积 S' = ½a'b' sin C' = ½(ka)(kb) sin C = k²·½ab sin C = k²S`, `面积公式；k 提出两次`],
      [`任意多边形可三角剖分，每块面积乘 k²，总面积乘 k²`, `相似变换把剖分映到剖分，逐块相加`],
      [`一般证明：相似变换的线性部分是 kR，|det(kR)| = k²|det R| = k²`, `2×2 矩阵的每列乘 k，行列式乘 k²；R 正交 |det R| = 1；行列式是面积缩放因子`],
      [`三维同理 |det(kR)| = k³，体积比 k³`, `3×3 每列乘 k，行列式乘 k³`],
      [`周长是长度之和，每段乘 k，周长比 k`, `线性量`],
      [`表面积 ∝ L²，体积 ∝ L³，S/V ∝ L²/L³ = 1/L`, `第 2、5 步取比`],
      [`推论：细胞半径加倍 S/V 减半；面积比 4:9 则边比 √(4/9) = 2:3`, `第 7 步；第 2 步反向开方`]
    ],
    end:`相似 = 尺度不变性。长度、面积、体积分别按 k、k²、k³ 缩放，这条平方-立方定律解释了细胞为什么小、大象腿为什么粗、模型放大时表面项与体积项为何失衡。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
shoelace = lambda P: 0.5*abs(np.dot(P[:,0], np.roll(P[:,1], -1)) - np.dot(P[:,1], np.roll(P[:,0], -1)))
R = lambda t: np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
P = rng.normal(size=(3, 2)); k = 3.0
Q = (k * R(0.9) @ P.T).T + np.array([5, -2])                     # 相似变换：旋转+缩放 k+平移
def angles(T):
    out = []
    for i in range(3):
        u, v = T[(i+1)%3]-T[i], T[(i+2)%3]-T[i]
        out.append(np.degrees(np.arccos(u@v/np.linalg.norm(u)/np.linalg.norm(v))))
    return np.round(sorted(out), 6)
print("angles preserved:", np.allclose(angles(P), angles(Q)), angles(P))
side = lambda T: np.linalg.norm(T - np.roll(T, -1, 0), axis=1)
print("side ratio:", (side(Q)/side(P)).round(6), " perimeter ratio:", (side(Q).sum()/side(P).sum()).round(6))
print("area ratio:", (shoelace(Q)/shoelace(P)).round(6), " k^2 =", k*k, "  det(kR) =", np.linalg.det(k*R(0.9)).round(6))
print("3D: det(kR3) =", np.linalg.det(k*np.eye(3)).round(6), "= k^3 =", k**3)
r = np.array([1.0, 2.0]); S, V = 4*np.pi*r**2, 4/3*np.pi*r**3
print("sphere S/V at r=1,2:", (S/V).round(4), " ratio =", ((S/V)[1]/(S/V)[0]).round(4))
print("area ratio 4:9 -> side ratio", np.sqrt(4/9).round(6), "= 2/3")`,
    out:`angles preserved: True [ 24.427057  37.037413 118.53553 ]
side ratio: [3. 3. 3.]  perimeter ratio: 3.0
area ratio: 9.0  k^2 = 9.0   det(kR) = 9.0
3D: det(kR3) = 27.0 = k^3 = 27.0
sphere S/V at r=1,2: [3.  1.5]  ratio = 0.5
area ratio 4:9 -> side ratio 0.666667 = 2/3`,
    note:`angles preserved 是第 1 步；side/perimeter ratio = k 是第 6 步；area ratio = k² = det(kR) 是第 2-4 步；3D 是第 5 步；S/V 与 4:9 是第 7-8 步。`
  },
  contrast:[
    {vs:`全等`, same:`k = 1 的相似`, diff:`全等保长度，相似只保形状`, when:`能重合是全等；成比例是相似`},
    {vs:`仿射变换 ge.transform`, same:`相似是仿射的子集`, diff:`仿射允许剪切和非等比缩放，不保角；相似保角`, when:`要保形状用相似；一般变形用仿射`},
    {vs:`叉积与面积 ge.area_cross`, same:`面积比 k² 的证明用到行列式`, diff:`叉积算一个具体面积；本节算面积的缩放因子`, when:`算面积用叉积；算比例用相似`},
    {vs:`线性缩放的直觉`, same:`都是"放大 k 倍"`, diff:`直觉容易把面积也当成乘 k；实际是 k²`, when:`任何"边长比"换"面积比"先平方`}
  ],
  ext:[
    {t:`一般几何变换与矩阵`, go:'ge.transform'},
    {t:`行列式是面积/体积缩放因子`, go:'la.determinant'},
    {t:`图像分割按面积计数要考虑放大倍数`, go:'bm.image_seg'}
  ]
},

'ge.pythagoras': {
  layers:{
    alg:`a² + b² = c²。面积证明：边长 a+b 的大正方形 = 4 个直角三角形 + 中间边长 c 的正方形，(a+b)² = 2ab + c²。内积证明：u ⊥ v 时 |u + v|² = |u|² + 2u·v + |v|² = |u|² + |v|²。`,
    geo:`四个同样的直角三角形拼在大正方形四角，中间空出一个斜正方形；把三角形挪成两个矩形，中间就空出两个小正方形 a² 和 b²。同一块空地两种数法。`,
    comp:`np.linalg.norm 就是 √Σxᵢ²，是 n 维勾股。方差分解 SS_tot = SS_reg + SS_res 是勾股：残差向量垂直于拟合向量。`
  },
  proof:{
    from:`正方形与三角形面积公式；三角形内角和 180°；内积的双线性`,
    to:`a² + b² = c²；判断锐角/钝角；n 维推广；方差分解是勾股`,
    steps:[
      [`取边长 a + b 的正方形，在四角各放一个直角边为 a、b 的直角三角形，斜边朝内`, `四个三角形全等，摆放合法`],
      [`中间四边形四边都是 c；每个角 = 180° − (α + β) = 90°，所以是正方形`, `直角三角形两锐角 α + β = 90°；每个内角由一个 α 与一个 β 拼成的补角`],
      [`面积两种数法：(a + b)² = 4 · ½ab + c²`, `大正方形 = 四个三角形 + 中间正方形`],
      [`展开：a² + 2ab + b² = 2ab + c² ⇒ a² + b² = c²`, `消去 2ab`],
      [`逆命题与判角：由余弦定理 c² = a² + b² − 2ab cos C，c² 与 a² + b² 的大小关系决定 cos C 的符号`, `cos C > 0 锐角、= 0 直角、< 0 钝角；c 取最长边`],
      [`内积版：u ⊥ v 即 u·v = 0，则 |u + v|² = (u+v)·(u+v) = |u|² + 2u·v + |v|² = |u|² + |v|²`, `内积双线性展开；正交项为零`],
      [`n 维：v = Σ vᵢeᵢ，各分量互相正交，反复用第 6 步得 |v|² = Σ vᵢ²`, `标准基两两正交`],
      [`方差分解：y − ȳ = (ŷ − ȳ) + (y − ŷ)，最小二乘保证残差 ⊥ 拟合值，所以 SS_tot = SS_reg + SS_res`, `正规方程 Xᵀ(y − ŷ) = 0 给出正交；第 6 步`]
    ],
    end:`勾股是"平直空间里正交分量的平方可加"。面积证明给直觉，内积证明给推广：范数、距离、方差分解、R² 全是它。球面上不成立，因为那里不平直。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
a, b = rng.uniform(1, 10, 1000), rng.uniform(1, 10, 1000)
print("(a+b)^2 - 4*(ab/2) == a^2+b^2:", np.allclose((a+b)**2 - 2*a*b, a*a + b*b))
# 构造真实直角三角形：随机 u，v 取与 u 垂直的向量
u = rng.normal(size=(1000, 2)); v = np.stack([-u[:,1], u[:,0]], 1) * rng.uniform(0.5, 2, (1000, 1))
print("u.v == 0:", np.allclose((u*v).sum(1), 0), " |u+v|^2 == |u|^2+|v|^2:", np.allclose(((u+v)**2).sum(1), (u*u).sum(1) + (v*v).sum(1)))
print("6,8 ->", np.hypot(6, 8), "  5,12,13 right?", 5**2 + 12**2 == 13**2, "  7,8,10:", "acute" if 7**2 + 8**2 > 10**2 else "obtuse", "  unit square diag:", np.sqrt(2).round(6))
w = rng.normal(size=(500, 9)); print("n-dim |v|^2 == sum v_i^2:", np.allclose((w*w).sum(1), np.linalg.norm(w, axis=1)**2))
# 方差分解 = 勾股：残差 ⊥ 拟合
X = np.column_stack([np.ones(200), rng.normal(size=200)]); y = X @ [1.0, 2.0] + rng.normal(size=200)
beta = np.linalg.lstsq(X, y, rcond=None)[0]; yhat = X @ beta; res = y - yhat
SS_tot, SS_reg, SS_res = ((y-y.mean())**2).sum(), ((yhat-y.mean())**2).sum(), (res**2).sum()
print(f"res . (yhat-ybar) = {res @ (yhat - y.mean()):.2e}   SS_tot={SS_tot:.3f}  SS_reg+SS_res={SS_reg+SS_res:.3f}")
# 球面上不成立：球面直角三角形 a=b=90deg(弧长 pi/2 R), c 也是 pi/2 R
Rr = 1.0; A, B, C = np.array([1,0,0.]), np.array([0,1,0.]), np.array([0,0,1.])
arc = lambda p, q: Rr*np.arccos(p@q)
print("sphere octant triangle: a^2+b^2 =", (arc(A,C)**2 + arc(B,C)**2).round(4), " c^2 =", arc(A,B)**2.round(4), "(not equal)")`,
    out:`__OUT_ge.pythagoras__`,
    note:`第 1 行是第 3-4 步的面积恒等式；u ⊥ v 行是第 6 步；n-dim 行是第 7 步；方差分解行是第 8 步（残差与拟合正交，SS 相加相等）；最后一行验证球面上失效。`
  },
  contrast:[
    {vs:`余弦定理`, same:`勾股是 C = 90° 的特例`, diff:`余弦定理多一项 −2ab cos C，用来判角`, when:`直角用勾股；任意角用余弦定理`},
    {vs:`距离 ge.distance`, same:`距离公式就是勾股`, diff:`勾股是定理，距离是用它定义的量`, when:`推公式回勾股；算数用距离`},
    {vs:`方差 pr.variance`, same:`SS_tot = SS_reg + SS_res 是勾股`, diff:`统计里的"平方和可加"要求正交，最小二乘保证了它；一般分解不可加`, when:`报 R² 前确认拟合含截距且用的是最小二乘`},
    {vs:`球面几何`, same:`都有"三角形"`, diff:`球面三角形 a² + b² ≠ c²，内角和 > 180°`, when:`地球尺度的距离用大圆弧，不用勾股`}
  ],
  ext:[
    {t:`欧氏距离与点到直线`, go:'ge.distance'},
    {t:`方差分解与 R²`, go:'pr.variance'},
    {t:`最小二乘的残差正交性`, go:'la.least_squares'}
  ]
},

'ge.polar': {
  layers:{
    alg:`x = r cos θ，y = r sin θ；r = √(x² + y²)，θ = atan2(y, x)。复数 z = r e^{iθ}，z₁z₂ = r₁r₂ e^{i(θ₁+θ₂)}：模相乘、辐角相加。乘 i 是转 90°。`,
    geo:`雷达屏：一根针从中心伸出，针长 r、转角 θ。复数乘法就是把针拉长 r₂ 倍再多转 θ₂。i² = −1 就是转两次 90° 到达反向。`,
    comp:`用 np.arctan2(y, x) 不用 np.arctan(y/x)；后者在第二、三象限差 π，且 x = 0 时除零。复数乘法 np 直接支持：(a+bj)*(c+dj)。`
  },
  proof:{
    from:`单位圆坐标；和角公式；复数乘法 (a + bi)(c + di) = (ac − bd) + (ad + bc)i`,
    to:`直角-极坐标互换；复数乘法 = 模乘角加；i 是 90° 旋转；atan2 与 arctan 的区别`,
    steps:[
      [`点到原点距离 r，与 x 轴正向夹角 θ，则 x = r cos θ，y = r sin θ`, `单位圆上点 (cos θ, sin θ) 按 r 放大`],
      [`反过来 r = √(x² + y²)；θ 由 (cos θ, sin θ) = (x/r, y/r) 决定，需要同时看 x、y 的符号`, `勾股给 r；仅 y/x 无法区分 (1,1) 与 (−1,−1)，因为 tan 周期为 π`],
      [`atan2(y, x) 按象限返回 (−π, π] 内唯一的 θ；arctan(y/x) 只返回 (−π/2, π/2)`, `atan2 定义就是带象限修正的反正切；x = 0 时 atan2 仍有定义`],
      [`z₁ = r₁(cos θ₁ + i sin θ₁)，z₂ = r₂(cos θ₂ + i sin θ₂)`, `复数的极形式：实部 x、虚部 y 用第 1 步`],
      [`z₁z₂ = r₁r₂[(cos θ₁ cos θ₂ − sin θ₁ sin θ₂) + i(sin θ₁ cos θ₂ + cos θ₁ sin θ₂)]`, `按复数乘法定义展开，i² = −1`],
      [`括号内正是 cos(θ₁ + θ₂) + i sin(θ₁ + θ₂)，所以 z₁z₂ = r₁r₂ e^{i(θ₁+θ₂)}`, `和角公式；欧拉记号 e^{iθ} = cos θ + i sin θ`],
      [`i = e^{iπ/2}（r = 1，θ = 90°），乘 i 即角加 90°；i·i = e^{iπ} = −1`, `第 6 步取 r₂ = 1、θ₂ = π/2`],
      [`(−1,−1)：atan2(−1,−1) = −135°；arctan(−1/−1) = arctan 1 = 45°，错了 180°`, `第 3 步的具体反例`]
    ],
    end:`极坐标让乘法变成"长度乘、角度加"，这是复数、旋转矩阵、傅里叶相位共用的语言。atan2 是唯一正确的反解方式。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
x, y = rng.normal(size=2000), rng.normal(size=2000)
r, th = np.hypot(x, y), np.arctan2(y, x)
print("round trip (x,y)->(r,th)->(x,y):", np.allclose(r*np.cos(th), x) and np.allclose(r*np.sin(th), y))
bad = np.arctan(y/x); print("arctan(y/x) wrong in how many of 2000:", int(np.sum(~np.isclose(np.mod(bad - th, 2*np.pi), 0))), " (those with x<0)")
print("(1,1):", np.hypot(1,1).round(4), np.degrees(np.arctan2(1,1)), "deg   (2,60deg) ->", (2*np.cos(np.radians(60))).round(6), (2*np.sin(np.radians(60))).round(6))
print("(-1,-1): atan2 =", np.degrees(np.arctan2(-1,-1)), "deg   arctan(y/x) =", np.degrees(np.arctan(1)), "deg (wrong)")
z1, z2 = rng.normal(size=500) + 1j*rng.normal(size=500), rng.normal(size=500) + 1j*rng.normal(size=500)
p = z1*z2
print("|z1 z2| == |z1||z2|:", np.allclose(np.abs(p), np.abs(z1)*np.abs(z2)), " arg(z1 z2) == arg z1 + arg z2 (mod 2pi):", np.allclose(np.mod(np.angle(p) - np.angle(z1) - np.angle(z2), 2*np.pi) % (2*np.pi - 1e-9), 0, atol=1e-8))
z = 3 + 4j
print("z*i rotates 90deg:", np.degrees(np.angle(z*1j) - np.angle(z)).round(6), " i*i =", 1j*1j, " |z| unchanged:", abs(z*1j) == abs(z))
print("e^{i pi} =", np.exp(1j*np.pi).round(12))`,
    out:`round trip (x,y)->(r,th)->(x,y): True
arctan(y/x) wrong in how many of 2000: 1148  (those with x<0)
(1,1): 1.4142 45.0 deg   (2,60deg) -> 1.0 1.732051
(-1,-1): atan2 = -135.0 deg   arctan(y/x) = 45.0 deg (wrong)
|z1 z2| == |z1||z2|: True  arg(z1 z2) == arg z1 + arg z2 (mod 2pi): True
z*i rotates 90deg: 90.0  i*i = (-1+0j)  |z| unchanged: True
e^{i pi} = (-1+0j)`,
    note:`round trip 是第 1-2 步；arctan 出错计数与 (−1,−1) 是第 3、8 步；|z₁z₂| 与 arg 行是第 5-6 步；z·i 行是第 7 步。`
  },
  contrast:[
    {vs:`直角坐标`, same:`同一个点`, diff:`直角坐标擅长加法（逐分量），极坐标擅长乘法与旋转`, when:`平移用直角；旋转、缩放、周期用极坐标`},
    {vs:`旋转矩阵 ge.transform`, same:`乘 e^{iθ} 与乘 R(θ) 是同一个变换`, diff:`复数只能表示二维旋转+等比缩放；矩阵可以表示任意线性变换`, when:`二维旋转用复数最简洁；三维或剪切用矩阵`},
    {vs:`arctan`, same:`都是反正切`, diff:`arctan 丢失象限信息且 x = 0 除零；atan2 两个参数都保留`, when:`永远用 atan2`},
    {vs:`复数极坐标 cx.polar`, same:`同一套 r e^{iθ}`, diff:`本节从几何坐标出发，那里从复数代数出发并推到单位根`, when:`几何直觉看本节；复数运算看 cx`}
  ],
  ext:[
    {t:`欧拉公式 e^{iθ} 的来源`, go:'cx.euler'},
    {t:`单位根：把圆等分`, go:'cx.roots_unity'},
    {t:`旋转位置编码用的就是复数旋转`, go:'dl.transformer'}
  ]
},

'ge.inscribed_angle': {
  layers:{
    alg:`圆心 O，弦 AB，圆周上点 P。∠AOB = 2∠APB。证明用等腰三角形：OA = OP = OB，外角 = 两内角和。推论：同弧圆周角相等；直径对直角；内接四边形对角互补。`,
    geo:`弦固定，顶点 P 在同侧弧上滑动，角度不变，因为它永远是同一个圆心角的一半。P 滑到另一侧弧，角变成补角。`,
    comp:`数值验证：随机取圆上三点，用 arccos 算 ∠APB，与 ∠AOB/2 比较；P 在另一侧时比较 180° − ∠AOB/2。也可用复数：∠APB = arg((A−P)/(B−P))。`
  },
  proof:{
    from:`圆的定义：OA = OB = OP = r；等腰三角形两底角相等；三角形外角 = 不相邻两内角之和`,
    to:`圆周角 = 同弧圆心角的一半；直径对直角；同弧圆周角相等；内接四边形对角互补`,
    steps:[
      [`情形一：圆心 O 在 ∠APB 内部。连 PO 并延长交圆于 D`, `作辅助线把角劈成两部分，每部分与一个等腰三角形对应`],
      [`△OAP 等腰（OA = OP），∠OAP = ∠OPA = α；外角 ∠AOD = 2α`, `等腰底角相等；∠AOD 是 △OAP 在 O 处的外角，等于两不相邻内角之和 α + α`],
      [`同理 △OBP 等腰，∠BOD = 2β，其中 β = ∠OPB`, `对称重复第 2 步`],
      [`∠AOB = ∠AOD + ∠BOD = 2(α + β) = 2∠APB`, `角相加；∠APB = α + β`],
      [`情形二：O 在 ∠APB 外部（同侧）。同样作 PD，此时 ∠AOB = ∠BOD − ∠AOD = 2β − 2α = 2(β − α) = 2∠APB`, `角相减而非相加，等腰与外角的论证不变`],
      [`情形三：O 在边 PA 上。则 ∠AOB 是 △OBP 的外角 = 2∠OPB = 2∠APB`, `一个等腰三角形即可`],
      [`推论：AB 是直径时 ∠AOB = 180°，∠APB = 90°；同弧的圆周角都等于同一圆心角的一半，所以相等`, `第 4 步取特例；圆心角只依赖弧`],
      [`内接四边形 ABCD：∠A 与 ∠C 分别对弧 BCD 与弧 BAD，两弧圆心角之和 360°，所以 ∠A + ∠C = 180°`, `两弧拼成整圆；各取一半`]
    ],
    end:`圆里所有角度定理都从"半径相等 ⇒ 等腰 ⇒ 外角加倍"一条链长出来。圆周角不变性是圆的刚性：顶点在弧上怎么滑，角度锁死。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
def ang(P, A, B):                                  # 角 APB，度
    u, v = A - P, B - P
    return np.degrees(np.arccos(np.clip(u@v/np.linalg.norm(u)/np.linalg.norm(v), -1, 1)))
O = np.zeros(2); pt = lambda t: np.array([np.cos(t), np.sin(t)])
tA, tB = 0.3, 2.1; A, B = pt(tA), pt(tB); central = np.degrees(tB - tA)
same_side, other_side = [], []
for t in rng.uniform(0, 2*np.pi, 4000):
    P = pt(t); a = ang(P, A, B)
    (same_side if not (tA < t < tB) else other_side).append(a)
print(f"central angle AOB = {central:.4f}")
print(f"inscribed (major arc side): mean={np.mean(same_side):.4f} std={np.std(same_side):.1e}  == central/2 = {central/2:.4f}")
print(f"inscribed (minor arc side): mean={np.mean(other_side):.4f} std={np.std(other_side):.1e}  == 180 - central/2 = {180-central/2:.4f}")
# 直径对直角
A2, B2 = pt(0), pt(np.pi); print("diameter subtends:", np.round([ang(pt(t), A2, B2) for t in [0.5, 1.7, 4.0]], 6))
# 内接四边形对角互补
ts = np.sort(rng.uniform(0, 2*np.pi, 4)); Q = [pt(t) for t in ts]
print("cyclic quad: angle A + angle C =", round(ang(Q[0], Q[3], Q[1]) + ang(Q[2], Q[1], Q[3]), 6))
print("chord = radius -> inscribed angle:", round(ang(pt(3.0), pt(0), pt(np.pi/3)), 6), "deg")`,
    out:`central angle AOB = 103.1324
inscribed (major arc side): mean=51.5662 std=6.7e-13  == central/2 = 51.5662
inscribed (minor arc side): mean=128.4338 std=2.2e-13  == 180 - central/2 = 128.4338
diameter subtends: [90. 90. 90.]
cyclic quad: angle A + angle C = 180.0
chord = radius -> inscribed angle: 30.0 deg`,
    note:`两个 inscribed 行 std 为 0 且分别等于 central/2 与 180 − central/2，对应第 4-5 步与"另一侧是补角"；diameter 行是第 7 步；cyclic quad 是第 8 步。`
  },
  contrast:[
    {vs:`圆心角`, same:`对同一段弧`, diff:`圆心角顶点在圆心，等于弧的度数；圆周角顶点在圆上，是它的一半`, when:`弧长、扇形面积用圆心角；圆上的角度关系用圆周角`},
    {vs:`弦切角`, same:`也等于所夹弧的圆周角`, diff:`一边是切线，是圆周角顶点滑到弦端点的极限情形`, when:`见到切线与弦的夹角，按圆周角处理`},
    {vs:`相似 ge.similar`, same:`同弧圆周角相等常用来证明三角形相似（AA）`, diff:`圆周角给角相等，相似给边成比例；相交弦定理 PA·PB = PC·PD 就是这么来的`, when:`圆里找相似三角形先找同弧的角`}
  ],
  ext:[
    {t:`单位圆上的角与坐标`, go:'ge.unit_circle'},
    {t:`用同弧角证相似`, go:'ge.similar'},
    {t:`复数辐角 arg((A−P)/(B−P)) 就是圆周角`, go:'cx.polar'}
  ]
},

'ge.normal_line': {
  layers:{
    alg:`ax + by + c = 0 ⇔ n·x = −c，n = (a,b)。线上两点之差 d 满足 n·d = 0，所以 n 是法向量，方向向量取 (b,−a)。符号 s = ax₀ + by₀ + c 判侧，s/|n| 是有向距离。两线垂直 ⇔ n₁·n₂ = 0。`,
    geo:`把 (a,b) 画成一支箭插在直线上；直线是"与这支箭点积相同"的所有点，即垂直于箭的一排。箭指向 s > 0 的那一侧。`,
    comp:`线性分类器 wᵀx + b = 0：w 就是法向量，sign(wᵀx + b) 是预测类别，|wᵀx + b|/|w| 是到边界的距离，SVM 最大化的就是这个距离的最小值。`
  },
  proof:{
    from:`点积的双线性；点到直线距离公式；两向量垂直 ⇔ 点积为零`,
    to:`法向量与方向向量；符号判侧；用法向量判垂直优于斜率；推广到超平面`,
    steps:[
      [`直线 L = {x : n·x = −c}，n = (a,b) ≠ 0`, `ax + by = (a,b)·(x,y)，这是方程的向量写法`],
      [`P, Q ∈ L ⇒ n·(P − Q) = n·P − n·Q = −c − (−c) = 0`, `点积对减法线性；两点都满足方程`],
      [`所以 n 垂直于线上任何方向，是法向量；(b,−a)·(a,b) = ab − ab = 0，是方向向量`, `第 2 步对所有 P,Q 成立；直接验算点积`],
      [`斜率：方向 (b,−a) 的斜率 −a/b（b ≠ 0）；b = 0 时竖直线无斜率，但法向量 (a,0) 仍有定义`, `斜率 = Δy/Δx；法向量表示不需要除法`],
      [`符号：取 P₀ ∈ L，s(P) = n·P + c = n·P − n·P₀ = n·(P − P₀)`, `c = −n·P₀`],
      [`s(P) > 0 ⇔ P − P₀ 与 n 夹角小于 90° ⇔ P 在 n 指向的一侧；|s|/|n| 是到 L 的距离`, `点积符号 = cos 符号；距离公式`],
      [`两线垂直 ⇔ 方向向量垂直 ⇔ 法向量垂直 ⇔ n₁·n₂ = 0；斜率法 k₁k₂ = −1 遇竖直线失效`, `法向量与方向向量各转 90°，垂直关系不变；斜率法需要两个斜率都存在`],
      [`n 维：超平面 wᵀx + b = 0，w 是法向量，sign(wᵀx + b) 分两侧，|wᵀx + b|/|w| 是距离`, `第 1-6 步没有用到维数`]
    ],
    end:`直线的系数就是法向量，这个写法在任何维都成立且不怕竖直线。线性分类器的边界、SVM 的间隔、逻辑回归的 logit 全是"法向量点积加偏置"。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
a, b, c = 3.0, 4.0, -5.0; n = np.array([a, b]); d = np.array([b, -a])
ts = rng.uniform(-5, 5, 1000); P0 = np.array([0., -c/b]); pts = P0 + ts[:, None]*d
print("all sampled points satisfy ax+by+c=0:", np.allclose(pts @ n + c, 0), " n.d =", n @ d)
diffs = pts[1:] - pts[:-1]; print("n perpendicular to every chord:", np.allclose(diffs @ n, 0))
print("normal of 3x+4y=5:", n, "  slope -a/b =", -a/b, "  direction slope:", d[1]/d[0])
# 过 (1,1) 垂直于 2x-y=0：新法向量 = 原方向向量 (1,2)
n2 = np.array([1., 2.]); c2 = -(n2 @ np.array([1., 1.])); print("perpendicular line through (1,1): x + 2y =", -c2)
print("2x+y=1 perpendicular to x-2y=3? n1.n2 =", np.array([2., 1.]) @ np.array([1., -2.]))
p = np.array([2., 3.]); s = p @ np.array([1., 1.]) - 4
print("(2,3) vs x+y-4=0: sign =", np.sign(s), " signed dist =", (s/np.sqrt(2)).round(6))
# 竖直线 x = 2：斜率不存在，法向量照常工作
nv = np.array([1., 0.]); print("vertical x=2 normal:", nv, " perpendicular to y=1 (normal (0,1))? dot =", nv @ np.array([0., 1.]))
# 超平面推广：sign(w.x+b) 与 |w.x+b|/|w|
w = rng.normal(size=5); bb = 0.3; X = rng.normal(size=(6, 5)); s = X @ w + bb
print("5D: sides", np.sign(s).astype(int).tolist(), " min dist", (np.abs(s)/np.linalg.norm(w)).min().round(4))`,
    out:`all sampled points satisfy ax+by+c=0: True  n.d = 0.0
n perpendicular to every chord: True
normal of 3x+4y=5: [3. 4.]   slope -a/b = -0.75   direction slope: -0.75
perpendicular line through (1,1): x + 2y = 3.0
2x+y=1 perpendicular to x-2y=3? n1.n2 = 0.0
(2,3) vs x+y-4=0: sign = 1.0  signed dist = 0.707107
vertical x=2 normal: [1. 0.]  perpendicular to y=1 (normal (0,1))? dot = 0.0
5D: sides [-1, 1, -1, -1, -1, -1]  min dist 0.0862`,
    note:`前两行是第 1-3 步；slope 行是第 4 步；perpendicular 两行是第 7 步；sign 行是第 5-6 步；vertical 行展示斜率法失效处法向量仍可用；最后一行是第 8 步。`
  },
  contrast:[
    {vs:`斜截式 y = kx + m`, same:`同一条线`, diff:`斜截式在竖直线失效且不显示法向量；一般式 ax + by + c = 0 处处可用`, when:`画图读斜率用斜截式；判垂直、算距离、推广高维用一般式`},
    {vs:`方向向量`, same:`都刻画直线的朝向`, diff:`方向向量沿线，法向量垂直线；二维互转是转 90°，高维一个超平面有 n−1 个方向但只有一个法向量`, when:`参数化直线用方向向量；写方程与判侧用法向量`},
    {vs:`点积投影 ge.dot_projection`, same:`s/|n| 就是 P − P₀ 在 n 上的投影长`, diff:`投影是一般操作，判侧是它的符号`, when:`要距离用投影长，要类别看符号`},
    {vs:`逻辑回归 ml.logistic`, same:`决策边界 wᵀx + b = 0`, diff:`逻辑回归把有向距离再过 sigmoid 变成概率`, when:`要概率用逻辑回归；只要边界看法向量`}
  ],
  ext:[
    {t:`SVM：最大化到超平面的最小距离`, go:'ml.svm'},
    {t:`逻辑回归的 logit 就是有向距离乘 |w|`, go:'ml.logistic'},
    {t:`投影到法向量与子空间`, go:'la.projection'}
  ]
}

});
