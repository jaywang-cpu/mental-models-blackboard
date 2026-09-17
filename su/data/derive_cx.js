// data/derive_cx.js —— 复数大陆 · 推导层（9 节点）
// 契约：CONTRACT3.md。旁挂，不改 v1/v2 文件。scratch 全部用 python3 + numpy 2.3 实际跑过。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

/* ================================================================== */
'cx.i_rotation': {
  layers:{
    alg:`定义 i 为"逆时针转 90°"这个线性映射：(a,b)→(−b,a)。转两次 = 转 180° = 乘 −1，所以 i²=−1 是推论。复数 a+bi ↔ 矩阵 aI+bJ，J=[[0,−1],[1,0]]，J²=−I。`,
    geo:`数轴是一条线，乘 −1 是绕原点翻半圈。要一个"翻半圈的一半"，只能离开这条线、转四分之一圈进入平面。i 就是那个垂直方向；复平面不是发明，是被这个问题逼出来的。`,
    comp:`机器里复数就是一对 float。乘 i 不需要乘法：交换两个分量并给第一个取负。i 的整数幂只看 n mod 4：{1, i, −1, −i}。`
  },
  proof:{
    from:`实数乘 −1 = 绕原点转 180°；旋转是线性映射且可复合；矩阵乘法满足结合律、分配律`,
    to:`存在满足 i²=−1 的"数"且其运算自洽（结合、分配、交换）；i 的几何意义是 90° 旋转；周期 4；复数没有全序`,
    steps:[
      [`乘 −1 把 x 送到 −x，是平面上绕原点转 180° 限制在实轴上的结果`,`把实轴嵌进平面看，180° 旋转 (x,0)→(−x,0) 与乘 −1 逐点一致`],
      [`问：什么映射 R 满足 R∘R = 转 180°？答：转 90°（逆时针或顺时针都行，约定逆时针）`,`旋转角相加：90°+90°=180°。这是唯一的"平方根"选法之一——在旋转群里 180° 恰有两个平方根`],
      [`把逆时针转 90° 命名为 i，作用在坐标上是 (a,b)→(−b,a)，矩阵 J=[[0,−1],[1,0]]`,`旋转矩阵 [[cos90°,−sin90°],[sin90°,cos90°]] 代入即得；(1,0)→(0,1) 说明 i 把 1 送到"垂直方向的 1"`],
      [`验证 J²=[[−1,0],[0,−1]]=−I：即 i²=−1`,`直接矩阵乘。这是第 2 步的代数确认：转两次 90° 就是转 180°`],
      [`定义复数 a+bi ↔ 矩阵 aI+bJ。这类矩阵对加法、乘法封闭：(aI+bJ)(cI+dJ)=(ac−bd)I+(ad+bc)J`,`展开时用 J²=−I 合并；结果仍是 αI+βJ 型，所以"实数 + i 的倍数"在乘法下不会跑出去`],
      [`结合律、分配律自动成立（继承自矩阵）；交换律成立因为 I、J 彼此可交换`,`矩阵乘法本身结合、分配；IJ=JI=J 且 I、J 的多项式两两可交换。复数域的公理不用另证`],
      [`i 的幂：J¹=J, J²=−I, J³=−J, J⁴=I，周期 4；i^n 只看 n mod 4`,`四次 90° 转一整圈回到恒等；负指数先加 4 的倍数`],
      [`复数无全序：若 i>0 则 i·i=−1>0 矛盾；若 i<0 则 (−i)>0，(−i)²=−1>0 矛盾`,`有序域里非零元的平方必为正；−1<0 是有序域公理的推论。所以"z₁>z₂"在 C 里无意义，只能比模`],
      [`陷阱来源：√(ab)=√a·√b 只对 a,b≥0 成立。写 i=√(−1) 再用这条会得 √(−1)√(−1)=√1=1 的荒谬`,`负数开方是多值的（两个根），"√"符号在负数上没有单值的主值可以同时保持乘法律。正确起点是 i²=−1 这条性质`]
    ],
    end:`i 是"转 90°"的名字，i²=−1 是"转两次等于翻半圈"的翻译。所有复数运算规则都是 2×2 旋转缩放矩阵的运算规则，因此自洽，不需要新公理。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
J = np.array([[0, -1], [1, 0]])                           # 逆时针转 90° 的矩阵，就是 i
I2 = np.eye(2)
print('J@J =', (J@J).tolist(), ' 等于 -I:', np.array_equal(J@J, -I2))
print('J 的幂周期 4:', [np.array_equal(np.linalg.matrix_power(J, k), M) for k, M in [(1, J), (2, -I2), (3, -J), (4, I2)]])
# 作用在点上：(a,b) → (−b,a)，长度不变、夹角 90°
p = np.random.randn(2); q = J@p
print('p =', np.round(p, 4).tolist(), ' J p =', np.round(q, 4).tolist(), ' |p|=|Jp|:', np.isclose(p@p, q@q), ' p·Jp =', round(p@q, 12))
# 复数 a+bi ↔ aI+bJ：矩阵乘法与复数乘法逐位一致
def M(z): return z.real*I2 + z.imag*J
z1, z2 = complex(*np.random.randn(2)), complex(*np.random.randn(2))
print('M(z1)M(z2) == M(z1 z2):', np.allclose(M(z1)@M(z2), M(z1*z2)), '  det M(z) = |z|²:', np.isclose(np.linalg.det(M(z1)), abs(z1)**2))
# 陷阱：√(-1)·√(-1) 用 √(ab)=√a√b 会算出 1
print('numpy 里 sqrt(-1+0j)**2 =', np.sqrt(-1+0j)**2, '   若误用 √(ab)=√a√b 得 √((-1)(-1)) =', np.sqrt(1.0))
# i 的大幂：只看 mod 4
print('1j**2027 =', 1j**2027, '   2027 % 4 =', 2027 % 4, ' → i³ = −i')`,
    out:`J@J = [[-1, 0], [0, -1]]  等于 -I: True
J 的幂周期 4: [True, True, True, True]
p = [1.7641, 0.4002]  J p = [-0.4002, 1.7641]  |p|=|Jp|: True  p·Jp = -0.0
M(z1)M(z2) == M(z1 z2): True   det M(z) = |z|²: True
numpy 里 sqrt(-1+0j)**2 = (-1+0j)    若误用 √(ab)=√a√b 得 √((-1)(-1)) = 1.0
1j**2027 = (4.463594664943955e-14-1j)    2027 % 4 = 3  → i³ = −i`,
    note:`J@J=−I 是第 4 步；周期 4 是第 7 步；(a,b)→(−b,a) 保长且垂直是第 3 步；M(z1)M(z2)=M(z1z2) 是第 5、6 步的封闭性；sqrt 一行是第 9 步的陷阱；最后一行是 mod 4 用法。`
  },
  contrast:[
    {vs:`负数（乘 −1）`,same:`都是"方向"而不是"数量"，都曾被叫做不存在的数`,diff:`−1 是转 180°，留在数轴上；i 是转 90°，必须离开数轴进入平面`,when:`一维反向用负号；需要"垂直/相位/旋转"就要 i`},
    {vs:`二维实向量 (a,b)`,same:`复数与 R² 一一对应，加法完全相同`,diff:`向量没有乘法（点积、叉积都不是闭合乘法）；复数有一个满足域公理的乘法 = 旋转缩放`,when:`只做平移/叠加用向量；要旋转、幂、开方用复数`},
    {vs:`2×2 旋转矩阵 R(θ)`,same:`复数 e^{iθ} 与 R(θ) 是同构的`,diff:`矩阵有 4 个数，复数只要 2 个；矩阵能表示任意线性映射（含剪切、非等比缩放），复数只能表示旋转 + 等比缩放`,when:`只有旋转缩放用复数更省；需要一般线性变换用矩阵`},
    {vs:`四元数`,same:`也是"引入满足平方 = −1 的新元"做出的数系`,diff:`四元数有 i,j,k 三个，表示三维旋转，乘法不交换；复数只有 i，表示平面旋转，可交换`,when:`平面/相位用复数；三维姿态用四元数`}
  ],
  ext:[
    {t:`乘任意复数 = 旋转 + 缩放`,go:`cx.multiply`},
    {t:`旋转角与长度分开写：极坐标`,go:`cx.polar`},
    {t:`连续旋转 e^{iθ}`,go:`cx.euler`},
    {t:`复数乘法就是 2×2 矩阵作用`,go:`la.matrix_transform`}
  ]
},

/* ================================================================== */
'cx.multiply': {
  layers:{
    alg:`(a+bi)(c+di)=(ac−bd)+(ad+bc)i。极坐标下 z₁=r₁(cosθ₁+i sinθ₁)，z₂ 同理，乘积 = r₁r₂[cos(θ₁+θ₂)+i sin(θ₁+θ₂)]：模相乘、幅角相加。`,
    geo:`把 z₂ 看成一个动作："放大 r₂ 倍并转 θ₂"。z₁z₂ 就是对 z₁ 施加这个动作。两个动作复合，放大倍数相乘、转角相加。加法是平行四边形（首尾相接），乘法是伸缩 + 旋转，两幅完全不同的图。`,
    comp:`直角坐标做乘法 4 次实乘 2 次加；极坐标做乘法 1 次乘 1 次加，但转换要 sqrt/atan2/cos/sin。连乘、幂、开方走极坐标；加法留在直角坐标。`
  },
  proof:{
    from:`i²=−1 与分配律；两角和公式 cos(α+β)=cosαcosβ−sinαsinβ，sin(α+β)=sinαcosβ+cosαsinβ（或反过来由复数推出）`,
    to:`|z₁z₂|=|z₁||z₂|，arg(z₁z₂)=arg z₁+arg z₂；复数乘法 = 旋转缩放矩阵复合；三角和角公式是乘法展开的副产品`,
    steps:[
      [`展开 (a+bi)(c+di)=ac+adi+bci+bdi²=(ac−bd)+(ad+bc)i`,`分配律 + i²=−1；这是唯一需要"记"的规则，其余都推`],
      [`写 z₁=r₁(cosθ₁+i sinθ₁)，z₂=r₂(cosθ₂+i sinθ₂)，代入第 1 步：z₁z₂=r₁r₂[(cosθ₁cosθ₂−sinθ₁sinθ₂)+i(sinθ₁cosθ₂+cosθ₁sinθ₂)]`,`任何复数都能写成 r(cosθ+i sinθ)：r=√(a²+b²)≥0，θ=atan2(b,a)。代入是纯代数`],
      [`括号里正是 cos(θ₁+θ₂) 与 sin(θ₁+θ₂)，故 z₁z₂=r₁r₂[cos(θ₁+θ₂)+i sin(θ₁+θ₂)]`,`两角和公式。反过来：若已承认"乘法 = 旋转复合"（第 5 步的矩阵论证），第 2 步的展开就证明了两角和公式——不用背`],
      [`读出结论：|z₁z₂|=r₁r₂=|z₁||z₂|，arg(z₁z₂)=θ₁+θ₂（mod 2π）`,`第 3 步右边已是极坐标形式，模与幅角直接可读；幅角只在 mod 2π 意义下唯一`],
      [`矩阵观点：z=a+bi ↔ M(z)=[[a,−b],[b,a]]=r·R(θ)，R 是旋转矩阵。M(z₁)M(z₂)=r₁r₂R(θ₁)R(θ₂)=r₁r₂R(θ₁+θ₂)`,`旋转矩阵复合等于角度相加（几何事实：先转 θ₁ 再转 θ₂ 就是转 θ₁+θ₂）；标量 r 可提出。这是"模乘角加"的几何证明，独立于三角公式`],
      [`|z₁z₂|=|z₁||z₂| 也可纯代数验证：(ac−bd)²+(ad+bc)²=(a²+b²)(c²+d²)`,`展开后交叉项 −2abcd+2abcd 抵消（Brahmagupta–Fibonacci 恒等式）；det M(z)=a²+b²=|z|²，行列式可乘`],
      [`加法对比：|z₁+z₂|≤|z₁|+|z₂|，只在同向时取等；乘法的模是精确等式`,`加法是平行四边形对角线（三角不等式）；乘法是缩放复合，没有"方向不一致"的损耗`],
      [`不存在"复数点积"：Re(z₁)Re(z₂)≠Re(z₁z₂)；向量点积对应 Re(z₁·conj z₂)=ac+bd`,`z₁conj(z₂)=(a+bi)(c−di)=(ac+bd)+(bc−ad)i，实部是点积、虚部是叉积；直接相乘的实部是 ac−bd，不是点积`]
    ],
    end:`复数乘法 = 模相乘、角相加，因为乘一个复数就是"缩放 + 旋转"，两个这样的动作复合自然长度相乘、角度相加。三角和角公式只是这句话在直角坐标下的展开。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
Z1 = np.random.randn(1000) + 1j*np.random.randn(1000)
Z2 = np.random.randn(1000) + 1j*np.random.randn(1000)
P = Z1*Z2
wrap = lambda a: (a + np.pi) % (2*np.pi) - np.pi          # 幅角对齐到 (−π, π]
print('|z1 z2| = |z1||z2| 最大差:', f'{np.abs(np.abs(P) - np.abs(Z1)*np.abs(Z2)).max():.1e}')
print('arg(z1 z2) = arg z1 + arg z2 (mod 2π) 最大差:', f'{np.abs(wrap(np.angle(P) - np.angle(Z1) - np.angle(Z2))).max():.1e}')
# 手写 (a+bi)(c+di) = (ac−bd) + (ad+bc)i
a, b, c, d = Z1.real, Z1.imag, Z2.real, Z2.imag
print('手写展开 vs numpy 最大差:', f'{np.abs((a*c - b*d) + 1j*(a*d + b*c) - P).max():.1e}')
# 三角恒等式是乘法展开的副产品：e^{iα}e^{iβ} 的实部 = cos(α+β)
al, be = np.random.uniform(-np.pi, np.pi, 1000), np.random.uniform(-np.pi, np.pi, 1000)
lhs = np.cos(al)*np.cos(be) - np.sin(al)*np.sin(be); rhs = np.cos(al + be)
print('cosαcosβ−sinαsinβ vs cos(α+β) 最大差:', f'{np.abs(lhs - rhs).max():.1e}')
# 加法 vs 乘法几何不同：三角不等式只是 ≤，乘法模是精确 =
print('|z1+z2| ≤ |z1|+|z2| 全成立:', bool(np.all(np.abs(Z1+Z2) <= np.abs(Z1)+np.abs(Z2)+1e-12)), ' 取等比例:', np.mean(np.isclose(np.abs(Z1+Z2), np.abs(Z1)+np.abs(Z2))))
print('Re(z1)Re(z2) == Re(z1 z2)?', np.allclose(Z1.real*Z2.real, P.real), '  Re(z1·conj z2) == 向量点积:', np.allclose((Z1*Z2.conj()).real, a*c + b*d))`,
    out:`|z1 z2| = |z1||z2| 最大差: 2.7e-15
arg(z1 z2) = arg z1 + arg z2 (mod 2π) 最大差: 8.9e-16
手写展开 vs numpy 最大差: 8.9e-16
cosαcosβ−sinαsinβ vs cos(α+β) 最大差: 5.0e-16
|z1+z2| ≤ |z1|+|z2| 全成立: True  取等比例: 0.002
Re(z1)Re(z2) == Re(z1 z2)? False   Re(z1·conj z2) == 向量点积: True`,
    note:`前两行是第 4 步（模乘、角加 mod 2π）；手写展开是第 1 步；cos 和角公式误差 5e-16 是第 3 步的"副产品"；三角不等式只 0.2% 取等 vs 模精确相乘是第 7 步；最后一行是第 8 步。`
  },
  contrast:[
    {vs:`复数加法`,same:`同一个数系的两种运算`,diff:`加法是分量相加、平行四边形；乘法是模乘角加、旋转缩放。加法在直角坐标简单，乘法在极坐标简单`,when:`叠加/线性组合留直角坐标；连乘/幂/根转极坐标`},
    {vs:`向量点积 a·b=ac+bd`,same:`都是两个二维对象合成一个数`,diff:`点积是 Re(z₁·conj z₂)，交换、结果实数；复数乘积 z₁z₂ 结果仍是复数，含旋转信息`,when:`要投影/夹角用点积（带共轭）；要旋转/相位叠加用复数乘`},
    {vs:`矩阵乘法`,same:`复数乘法就是 [[a,−b],[b,a]] 这类矩阵的乘法`,diff:`一般矩阵乘法不交换；这一类矩阵（旋转缩放）彼此交换，因为平面旋转可交换`,when:`平面旋转缩放用复数；含剪切/反射的变换用矩阵`},
    {vs:`模的乘法 vs 模的加法`,same:`都是关于 |·| 的规律`,diff:`|z₁z₂|=|z₁||z₂| 是等式；|z₁+z₂|≤|z₁|+|z₂| 是不等式`,when:`估计乘积的大小可以精确；估计和的大小只有上界`}
  ],
  ext:[
    {t:`模与幅角分开写就是极坐标形式`,go:`cx.polar`},
    {t:`i 本身是 90° 旋转`,go:`cx.i_rotation`},
    {t:`乘 conj 得到点积与叉积`,go:`cx.conjugate`},
    {t:`两角和公式的三角学出处`,go:`al.trig`}
  ]
},

/* ================================================================== */
'cx.polar': {
  layers:{
    alg:`z=a+bi=r(cosθ+i sinθ)=re^{iθ}，r=√(a²+b²)，θ=atan2(b,a)。乘法 r₁r₂e^{i(θ₁+θ₂)}，幂 rⁿe^{inθ}（棣莫弗），n 次根 r^{1/n}e^{i(θ+2πk)/n}，k=0..n−1。`,
    geo:`同一个点，两种报法：直角坐标"向右 a 向上 b"，极坐标"距原点 r、方位 θ"。加法用第一种（平行四边形），乘法用第二种（伸缩转动）。θ 是多值的：转一圈回到原地，所以相位图会有 2π 跳变。`,
    comp:`np.abs / np.angle 转极坐标；angle 用 atan2 保留象限；连续相位要 np.unwrap 把 (−π,π] 的折叠展开。幂用 r**n 与 n*θ 不会像连乘那样累积误差。`
  },
  proof:{
    from:`勾股定理；atan2 的定义；复数乘法 = 模乘角加（cx.multiply）；数学归纳法`,
    to:`极坐标表示的存在唯一性（θ mod 2π）；棣莫弗 zⁿ=rⁿ(cos nθ+i sin nθ)；n 次根恰有 n 个；幅角多值 ⇒ 需要解缠绕`,
    steps:[
      [`任意 z=a+bi≠0，令 r=√(a²+b²)>0，则 (a/r)²+(b/r)²=1，故存在 θ 使 a/r=cosθ、b/r=sinθ`,`单位圆上的点都能写成 (cosθ, sinθ)；θ 由 atan2(b,a) 给出唯一代表 ∈(−π,π]，其他解差 2πk`],
      [`所以 z=r(cosθ+i sinθ)：极坐标形式存在；r 唯一，θ 在 mod 2π 下唯一`,`r=|z| 由 z 决定；若 r(cosθ+i sinθ)=r(cosφ+i sinφ) 则 cos、sin 同时相等 ⇒ θ−φ∈2πZ`],
      [`atan(b/a) 会丢象限：(−1,−1) 与 (1,1) 的 b/a 都是 1；atan2 用 (a,b) 的符号分辨四个象限`,`商 b/a 抹掉了公共符号；atan2 是 (a,b) 而非 b/a 的函数`],
      [`乘法：z₁z₂=r₁r₂[cos(θ₁+θ₂)+i sin(θ₁+θ₂)]（cx.multiply）；对 z 自乘：z²=r²(cos2θ+i sin2θ)`,`模乘角加的特例，两个因子相同`],
      [`归纳：设 z^k=r^k(cos kθ+i sin kθ)，则 z^{k+1}=z^k·z=r^{k+1}(cos(k+1)θ+i sin(k+1)θ)。棣莫弗对所有正整数成立`,`归纳步只用了一次模乘角加；k=1 显然。负整数由 z^{−1}=r^{−1}(cos(−θ)+i sin(−θ)) 同理`],
      [`n 次根：求 w 使 wⁿ=z。设 w=ρe^{iφ}，则 ρⁿ=r、nφ≡θ (mod 2π) ⇒ ρ=r^{1/n}，φ=(θ+2πk)/n`,`模的方程在正实数里唯一解；角的方程因 mod 2π 有无穷多解，但 k 与 k+n 给同一个 w`],
      [`k=0..n−1 给出 n 个不同的根，均匀分布在半径 r^{1/n} 的圆上，相邻夹角 2π/n`,`φ_k 两两相差 2π/n 的倍数且小于 2π，对应不同的点；k≥n 时重复。这就是"n 次方程有 n 个复根"的显式版本`],
      [`幅角多值的后果：连续转动的相位被 angle() 折进 (−π,π]，出现 2π 跳变；解缠绕 = 每当相邻差 >π 就加减 2π`,`真实相位连续变化，主值区间的边界把它切断；unwrap 假设相邻采样相位差 <π（采样足够密）才能恢复`]
    ],
    end:`极坐标把乘法变成加法（角）和乘法（模），于是幂、根、连乘一眼可算。代价是 θ 天生多值：算幅角必须用 atan2，做连续相位必须解缠绕。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
z = np.random.randn(5) + 1j*np.random.randn(5)
r, th = np.abs(z), np.angle(z)
print('r·e^{iθ} 还原误差:', f'{np.abs(r*np.exp(1j*th) - z).max():.1e}', '  r = √(a²+b²):', np.allclose(r, np.hypot(z.real, z.imag)))
# atan2 vs atan(b/a)：象限
for w in [1+1j, -1-1j, -1+1j]:
    print(f'z={w}:  atan2 → {np.degrees(np.arctan2(w.imag, w.real)):7.1f}°   atan(b/a) → {np.degrees(np.arctan(w.imag/w.real)):6.1f}°')
# 棣莫弗：z^n = r^n e^{inθ}，用极坐标算幂 vs 直接连乘
z0 = 1.1*np.exp(1j*0.7); n = 12
direct = z0**n; polar = 1.1**n*np.exp(1j*n*0.7)
print(f'z^12 直接 {direct:.6f}  极坐标 {polar:.6f}  差 {abs(direct - polar):.1e}')
# 开方在极坐标下是除角：√z 有两个，角 θ/2 与 θ/2+π
w = 2*np.exp(1j*2.0); roots = [np.sqrt(2)*np.exp(1j*(2.0/2 + k*np.pi)) for k in range(2)]
print('两个平方根平方回去:', [complex(np.round(rt**2, 6)) for rt in roots], ' 都等于 w:', all(np.isclose(rt**2, w) for rt in roots))
# 相位缠绕：连续转动的相位被 angle 折到 (−π, π]，unwrap 后才是真实累计角
phase = np.angle(np.exp(1j*np.linspace(0, 4*np.pi, 9)))
print('angle 折叠后:', np.round(phase, 3).tolist())
print('unwrap 后   :', np.round(np.unwrap(phase), 3).tolist())`,
    out:`r·e^{iθ} 还原误差: 1.2e-16   r = √(a²+b²): True
z=(1+1j):  atan2 →    45.0°   atan(b/a) →   45.0°
z=(-1-1j):  atan2 →  -135.0°   atan(b/a) →   45.0°
z=(-1+1j):  atan2 →   135.0°   atan(b/a) →  -45.0°
z^12 直接 -1.629750+2.682097j  极坐标 -1.629750+2.682097j  差 1.4e-15
两个平方根平方回去: [(-0.832294+1.818595j), (-0.832294+1.818595j)]  都等于 w: True
angle 折叠后: [0.0, 1.571, 3.142, -1.571, -0.0, 1.571, 3.142, -1.571, -0.0]
unwrap 后   : [0.0, 1.571, 3.142, 4.712, 6.283, 7.854, 9.425, 10.996, 12.566]`,
    note:`第一行是第 1、2 步的存在性与还原；三行 atan2 vs atan 是第 3 步；z^12 是第 5 步棣莫弗；两个平方根是第 6、7 步；angle/unwrap 是第 8 步。`
  },
  contrast:[
    {vs:`直角坐标 a+bi`,same:`同一个复数的两种坐标`,diff:`直角坐标加法简单、乘法要展开；极坐标乘法简单、加法没有公式`,when:`求和/线性组合留直角；连乘/幂/根/相位转极坐标`},
    {vs:`平面极坐标 (r,θ)（ge.polar）`,same:`就是同一个东西：模 = r，幅角 = θ`,diff:`复数极坐标多了运算规则（模乘角加）；几何极坐标只是描点`,when:`只描点用几何极坐标；要算旋转复合用复数`},
    {vs:`atan(b/a)`,same:`都想求幅角`,diff:`atan 只覆盖 (−π/2,π/2)，丢象限；atan2(b,a) 覆盖 (−π,π]`,when:`永远用 atan2；atan 只在已知 a>0 时安全`},
    {vs:`对数 log z = ln r + iθ`,same:`都把"乘"变"加"`,diff:`极坐标只是换个写法；log 是一个（多值）函数，虚部就是 θ+2πk`,when:`理解 log 多值性就是理解幅角多值性`}
  ],
  ext:[
    {t:`r e^{iθ} 的 e^{iθ} 从哪来`,go:`cx.euler`},
    {t:`n 次根均匀分布 ⇒ 单位根`,go:`cx.roots_unity`},
    {t:`模乘角加的推导`,go:`cx.multiply`},
    {t:`单位圆上的三角函数`,go:`ge.unit_circle`}
  ]
},

/* ================================================================== */
'cx.euler': {
  layers:{
    alg:`e^{iθ}=cosθ+i sinθ。三条路：泰勒级数按 iⁿ 的周期 4 拆成实虚两串；微分方程 z′=iz, z(0)=1 的唯一解；极限 (1+iθ/n)ⁿ。推论 cosθ=(e^{iθ}+e^{−iθ})/2，sinθ=(e^{iθ}−e^{−iθ})/(2i)，e^{iπ}+1=0。`,
    geo:`e^{t} 的定义是"速度等于位置"。把指数换成 it，速度变成"位置转 90°"——永远垂直于半径。垂直的速度不改变距离原点的远近，只改变方向，且速度大小 = 半径 = 1，所以走 θ 秒恰好走了 θ 弧长：落在单位圆上幅角 θ 处。`,
    comp:`np.exp(1j*theta) 直接给 cos+i sin；RK4 积分 z′=iz 到 t=π 得 −1，|z| 始终 1；(1+iθ/n)ⁿ 用 n 大时模 →1、角 →θ，每一步是"转小角 + 微增模"，模增量 O(θ²/n²)·n→0。`
  },
  proof:{
    from:`e^x 的泰勒级数（对复数收敛）；i 的幂周期 4；一阶线性 ODE 解的唯一性；复数乘法 = 模乘角加`,
    to:`e^{iθ}=cosθ+i sinθ（三种独立推导）；cos/sin 的指数表示；e^{iπ}+1=0；e^{z} 的 2πi 周期性`,
    steps:[
      [`路 1（级数）：e^{iθ}=Σₙ(iθ)ⁿ/n!。按 n mod 4 分组：iⁿ=1,i,−1,−i 循环`,`指数级数绝对收敛，对复数同样成立且可任意重排；i 的幂周期 4（cx.i_rotation）`],
      [`实部 Σ(−1)^kθ^{2k}/(2k)!=cosθ，虚部 Σ(−1)^kθ^{2k+1}/(2k+1)!=sinθ。故 e^{iθ}=cosθ+i sinθ`,`偶数项带 i^{2k}=(−1)^k，奇数项带 i^{2k+1}=i(−1)^k；分出来的两串恰是 cos、sin 的泰勒级数（ca.taylor）`],
      [`路 2（ODE）：令 f(θ)=e^{iθ}，则 f′=i f，f(0)=1。令 g(θ)=cosθ+i sinθ，g′=−sinθ+i cosθ=i(cosθ+i sinθ)=i g，g(0)=1`,`e^{cθ} 的导数是 c·e^{cθ}（对复 c 也成立，由级数逐项求导）；g 的导数直接算，提出 i 后与 g 相同`],
      [`f、g 满足同一个一阶线性 ODE 与同一初值 ⇒ f≡g`,`线性 ODE 解唯一：h=f−g 满足 h′=ih，h(0)=0，则 (|h|²)′=2Re(conj(h)·ih)=0 ⇒ |h|≡0。几何上：速度 = 位置转 90° 的运动保持模长、匀速转角`],
      [`路 3（极限）：e^{iθ}=lim(1+iθ/n)ⁿ。1+iθ/n 的模是 √(1+θ²/n²)，幅角 atan(θ/n)。n 次幂：模 (1+θ²/n²)^{n/2}→1，幅角 n·atan(θ/n)→θ`,`e^x=lim(1+x/n)ⁿ 对复 x 同样成立；模乘角加把 n 次幂变成模的 n 次方、角的 n 倍；(1+θ²/n²)^{n/2}≈e^{θ²/(2n)}→1，n·atan(θ/n)→θ 因 atan(u)/u→1`],
      [`三条路都给 e^{iθ}=cosθ+i sinθ：它在单位圆上，幅角 θ`,`|cosθ+i sinθ|=1；这也解释 e^{iθ} 是"匀速转动"——θ 既是时间又是角度`],
      [`用 θ 与 −θ 两式相加减：cosθ=(e^{iθ}+e^{−iθ})/2，sinθ=(e^{iθ}−e^{−iθ})/(2i)`,`cos 偶、sin 奇，e^{−iθ}=cosθ−i sinθ；加消虚部、减消实部。这是把三角函数化成指数、让微分和乘法变简单的钥匙`],
      [`θ=π：e^{iπ}=−1；θ=2π：e^{2πi}=1 ⇒ e^{z+2πi}=e^z，e^z 不单射，log 多值 log(−1)=iπ+2πik`,`cos π=−1、sin π=0；周期性来自转一整圈回原点。所以 (e^a)^b=e^{ab} 在复数域不总成立——指数上多了 2πik 的自由度`]
    ],
    end:`e^{iθ} 落在单位圆幅角 θ 处，因为"速度 = 位置转 90°"的运动只转不缩。三种推导殊途同归；由它 cos、sin 变成指数的实虚部，微分方程和乘法立刻变简单。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
from math import factorial
th = 0.7
# 推导 1：泰勒级数 Σ (iθ)^n/n! 的实部虚部分别收敛到 cos、sin
S = sum((1j*th)**n/factorial(n) for n in range(30))
print(f'级数 Σ(iθ)ⁿ/n! = {S:.12f}   cosθ+i sinθ = {np.cos(th)+1j*np.sin(th):.12f}   差 {abs(S - (np.cos(th)+1j*np.sin(th))):.1e}')
# 推导 2：微分方程 z′ = iz，z(0)=1 数值积分（RK4），解应落在单位圆上且幅角 = t
def rk4(f, z, t, h):
    k1 = f(z); k2 = f(z + h/2*k1); k3 = f(z + h/2*k2); k4 = f(z + h*k3)
    return z + h/6*(k1 + 2*k2 + 2*k3 + k4)
z = 1+0j; h = np.pi/3000
for _ in range(3000): z = rk4(lambda w: 1j*w, z, 0, h)
print(f'z′=iz 积分到 t=π: z = {z:.8f}   |z| = {abs(z):.10f}   e^{{iπ}} = −1 → 差 {abs(z + 1):.1e}')
# 推导 3：极限 (1 + iθ/n)^n → e^{iθ}，每一步是转小角 + 微增模，n→∞ 模增消失
for n in [10, 1000, 100000]:
    w = (1 + 1j*th/n)**n
    print(f'n={n:6d}: (1+iθ/n)^n = {w:.8f}   |w| = {abs(w):.8f}   arg = {np.angle(w):.8f}   (θ = {th})')
# 推论：cos = (e^{iθ}+e^{−iθ})/2，sin = (e^{iθ}−e^{−iθ})/(2i)
ths = np.linspace(-3, 3, 7)
print('cos 公式最大差:', f'{np.abs((np.exp(1j*ths) + np.exp(-1j*ths))/2 - np.cos(ths)).max():.1e}', '  sin 公式最大差:', f'{np.abs((np.exp(1j*ths) - np.exp(-1j*ths))/(2j) - np.sin(ths)).max():.1e}')
print('e^{iπ}+1 =', np.exp(1j*np.pi) + 1, '   e^{2πi} = 1 → log 多值: exp(iπ)=exp(3iπ)?', np.isclose(np.exp(1j*np.pi), np.exp(3j*np.pi)))`,
    out:`级数 Σ(iθ)ⁿ/n! = 0.764842187284+0.644217687238j   cosθ+i sinθ = 0.764842187284+0.644217687238j   差 1.1e-16
z′=iz 积分到 t=π: z = -1.00000000+0.00000000j   |z| = 1.0000000000   e^{iπ} = −1 → 差 2.8e-14
n=    10: (1+iθ/n)^n = 0.78451742+0.65926255j   |w| = 1.02474128   arg = 0.69886002   (θ = 0.7)
n=  1000: (1+iθ/n)^n = 0.76502967+0.64437545j   |w| = 1.00024503   arg = 0.69999989   (θ = 0.7)
n=100000: (1+iθ/n)^n = 0.76484406+0.64421927j   |w| = 1.00000245   arg = 0.70000000   (θ = 0.7)
cos 公式最大差: 0.0e+00   sin 公式最大差: 0.0e+00
e^{iπ}+1 = 1.2246467991473532e-16j    e^{2πi} = 1 → log 多值: exp(iπ)=exp(3iπ)? True`,
    note:`级数一行是第 1、2 步；RK4 积分 z′=iz 到 π 得 −1 且 |z|=1 是第 3、4 步；(1+iθ/n)ⁿ 三行是第 5 步（模→1、角→θ）；cos/sin 公式是第 7 步；最后一行是第 8 步的 e^{iπ}+1=0 与周期性。`
  },
  contrast:[
    {vs:`实指数 e^{x}`,same:`同一个级数、同一条 ODE f′=cf`,diff:`实指数是"沿半径增长"，模单调变；虚指数是"沿切线转动"，模恒为 1。e^{σ+iω} 两者兼有`,when:`增长/衰减看实部 σ；振荡看虚部 ω`},
    {vs:`cosθ+i sinθ 的极坐标写法 (cx.polar)`,same:`同一个点`,diff:`cis θ 只是名字；e^{iθ} 是真的指数，继承指数律 e^{iα}e^{iβ}=e^{i(α+β)}，于是模乘角加不用再证`,when:`一律写 e^{iθ}，指数律替你算三角`},
    {vs:`泰勒展开（ca.taylor）`,same:`路 1 就是把三个级数对上`,diff:`泰勒只给"数值上相等"；ODE 路给出"为什么是圆"的几何原因；极限路给出"无穷多次小旋转"的动态图像`,when:`证明用级数；理解用 ODE；讲直觉用极限`},
    {vs:`双曲函数 cosh、sinh`,same:`cosh x=(e^x+e^{−x})/2 形式相同`,diff:`把 iθ 换成实 x：cos(ix)=cosh x，sin(ix)=i sinh x；单位圆变双曲线`,when:`旋转对称用三角；洛伦兹/双曲几何用双曲函数`}
  ],
  ext:[
    {t:`e^{(σ+iω)t} 描述振荡与衰减`,go:`cx.oscillation`},
    {t:`e^{2πik/n} 就是单位根`,go:`cx.roots_unity`},
    {t:`级数推导的依据`,go:`ca.taylor`},
    {t:`复指数是 LTI 系统的特征函数`,go:`fo.eigenfunction`}
  ]
},

/* ================================================================== */
'cx.roots_unity': {
  layers:{
    alg:`xⁿ=1 ⇔ ω_k=e^{2πik/n}，k=0..n−1。Σω_k=(ωⁿ−1)/(ω−1)=0（n>1），Πω_k=(−1)^{n+1}（韦达）。{ω_k} 在乘法下是 n 阶循环群 ≅ Z/nZ；ω_k 是生成元 ⇔ gcd(k,n)=1。DFT 矩阵 F[k,m]=ω_n^{−km}。`,
    geo:`把单位圆 n 等分，从 (1,0) 开始的 n 个点。它们是正 n 边形的顶点；顶点向量首尾相接闭合 ⇒ 和为零。乘以 ω₁ = 整体转一格。`,
    comp:`np.exp(2j*np.pi*np.arange(n)/n) 一行生成；FFT 的旋转因子表就是这些点；ω_j·ω_k 只需下标 (j+k) mod n——单位根乘法就是模 n 加法。`
  },
  proof:{
    from:`棣莫弗 (re^{iθ})ⁿ=rⁿe^{inθ}；有限等比数列求和；韦达定理；代数基本定理`,
    to:`xⁿ=1 恰有 n 个复根，均匀分布在单位圆上；Σ=0；Π=(−1)^{n+1}；构成循环群；生成元 ⇔ gcd(k,n)=1；它们搭出 DFT 矩阵`,
    steps:[
      [`设 x=re^{iθ}，xⁿ=rⁿe^{inθ}=1 ⇒ rⁿ=1 且 nθ≡0 (mod 2π)`,`两个复数相等 ⇔ 模相等且幅角相差 2π 整数倍；棣莫弗把 n 次幂变成模 n 次方、角 n 倍`],
      [`r>0 且 rⁿ=1 ⇒ r=1；θ=2πk/n，k∈Z`,`正实数的 n 次方根唯一；角的方程有整数族解`],
      [`k 与 k+n 给出同一个点，故恰有 n 个不同根 ω_k=e^{2πik/n}，k=0..n−1，相邻夹角 2π/n：均分单位圆`,`e^{2πi(k+n)/n}=e^{2πik/n}·e^{2πi}=e^{2πik/n}；0≤k<n 时角两两不同。n 次多项式至多 n 个根，这里恰好取满`],
      [`和：令 ω=ω₁，ω_k=ω^k。Σ_{k=0}^{n−1}ω^k=(ωⁿ−1)/(ω−1)=0/(ω−1)=0（n>1 时 ω≠1）`,`等比数列求和公式要求公比 ≠1；ωⁿ=1 使分子为零。几何上：正 n 边形顶点向量闭合`],
      [`和为零的另一证：xⁿ−1=Π(x−ω_k)，比较 x^{n−1} 系数：0=−Σω_k`,`韦达定理；xⁿ−1 的 x^{n−1} 项系数为 0`],
      [`积：比较常数项 −1=(−1)ⁿΠω_k ⇒ Πω_k=(−1)^{n+1}`,`韦达：常数项 = (−1)ⁿ×根之积；n=8 时积 −1，n 奇时积 1（scratch 验证）`],
      [`群结构：ω_j·ω_k=e^{2πi(j+k)/n}=ω_{(j+k) mod n}，ω_0=1 是单位元，ω_k 的逆是 ω_{n−k}：n 阶循环群 ≅ (Z/nZ,+)`,`指数相加 + 周期 n 归约；所有群公理由指数律继承。这是"复数把乘法变加法"的离散版`],
      [`ω_k 的幂 {ω_k^m}=ω_{km mod n}，取遍全部 n 个 ⇔ k 在 Z/nZ 中生成 ⇔ gcd(k,n)=1；这样的 ω_k 叫本原 n 次单位根`,`km mod n 取遍所有余数 ⇔ k 与 n 互质（裴蜀定理）；与 di.modular 里的原根同一个概念`],
      [`DFT 矩阵 F[k,m]=ω_n^{−km}：正交性 Σ_m ω^{(j−k)m}=n·δ_{jk} 正是第 4 步"非 1 单位根的幂和为零"`,`j≠k 时 ω^{j−k} 是非 1 的 n 次单位根，其 0..n−1 次幂和为 0；这一条撑起整个 fo.basis`]
    ],
    end:`n 次单位根就是把圆 n 等分，它们的乘法是下标模 n 相加，和为零因为多边形闭合。FFT 的旋转因子、DFT 的正交性、循环群、原根，全是这 n 个点的不同侧面。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
for n in [3, 5, 8]:
    k = np.arange(n); w = np.exp(2j*np.pi*k/n)
    print(f'n={n}: 全是 x^n=1 的根: {np.allclose(w**n, 1)}   模全为 1: {np.allclose(np.abs(w), 1)}   相邻夹角 {np.degrees(2*np.pi/n):.1f}°   Σω = {np.round(w.sum(), 12)}   Πω = {np.round(w.prod(), 10)}  ((−1)^(n+1) = {(-1)**(n+1)})')
# 和为 0 的代数原因：等比数列 Σω^k = (ω^n − 1)/(ω − 1) = 0/(ω−1)
n = 7; w1 = np.exp(2j*np.pi/n)
print('n=7 等比和公式 (ω⁷−1)/(ω−1) =', np.round((w1**n - 1)/(w1 - 1), 12), '  直接求和 =', np.round(sum(w1**k for k in range(n)), 12))
# 循环群：ω_j·ω_k = ω_{(j+k) mod n}
n = 6; w = np.exp(2j*np.pi*np.arange(n)/n)
print('乘法 = 下标模 n 相加:', all(np.isclose(w[j]*w[k], w[(j+k) % n]) for j in range(n) for k in range(n)))
# 原根：ω_k 自乘能生成全部 n 个 ⇔ gcd(k, n) = 1
from math import gcd
gen = {k: len({np.round(w[k]**m, 8) for m in range(n)}) for k in range(1, n)}
print('n=6 各 ω_k 生成的元素个数:', gen, '  与 gcd(k,6)=1 一致:', all((gen[k] == n) == (gcd(k, n) == 1) for k in gen))
# 它们就是 DFT 矩阵的元素：F[k,m] = ω_n^{−km}
N = 8; F = np.exp(-2j*np.pi*np.outer(np.arange(N), np.arange(N))/N)
x = np.arange(N, dtype=float)
print('用单位根搭的 F @ x vs np.fft.fft 差:', f'{np.abs(F@x - np.fft.fft(x)).max():.1e}')`,
    out:`n=3: 全是 x^n=1 的根: True   模全为 1: True   相邻夹角 120.0°   Σω = (-0+0j)   Πω = (1-0j)  ((−1)^(n+1) = 1)
n=5: 全是 x^n=1 的根: True   模全为 1: True   相邻夹角 72.0°   Σω = (-0+0j)   Πω = (1-0j)  ((−1)^(n+1) = 1)
n=8: 全是 x^n=1 的根: True   模全为 1: True   相邻夹角 45.0°   Σω = (-0+0j)   Πω = (-1+0j)  ((−1)^(n+1) = -1)
n=7 等比和公式 (ω⁷−1)/(ω−1) = (-0-0j)   直接求和 = (-0-0j)
乘法 = 下标模 n 相加: True
n=6 各 ω_k 生成的元素个数: {1: 6, 2: 3, 3: 2, 4: 3, 5: 6}   与 gcd(k,6)=1 一致: True
用单位根搭的 F @ x vs np.fft.fft 差: 2.7e-14`,
    note:`第一段三行验证第 3 步（均分圆周）、第 4 步（Σ=0）、第 6 步（Π=(−1)^{n+1}）；等比和一行是第 4 步的代数原因；"下标模 n 相加"是第 7 步；生成元个数与 gcd 一致是第 8 步；最后一行是第 9 步的 DFT 矩阵。`
  },
  contrast:[
    {vs:`实数里的 xⁿ=1`,same:`都在解同一个方程`,diff:`实数只有 1（n 奇）或 ±1（n 偶）；复数恰有 n 个，均匀分布`,when:`任何"n 次方程有几个根"的问题都要在 C 里数`},
    {vs:`模运算 Z/nZ（di.modular）`,same:`同构：ω_j·ω_k ↔ (j+k) mod n；本原根 ↔ 与 n 互质的元`,diff:`一个是单位圆上的乘法群，一个是整数的加法群；写法不同结构相同`,when:`几何/信号里用单位根；数论/密码里用模加法`},
    {vs:`一般 n 次根 z^{1/n}（cx.polar）`,same:`z 的 n 个 n 次根 = 一个特解 × 全部单位根`,diff:`单位根是 z=1 的特例；一般根的圆半径 |z|^{1/n}、起始角 arg z/n`,when:`求任意数的 n 次根：先算一个，再乘 ω_k 转出其余`},
    {vs:`旋转因子 W_N=e^{−2πi/N}（fo.fft）`,same:`同一组点`,diff:`W 取负号（顺时针），是 ω₁ 的共轭；FFT 里 W^{k+N/2}=−W^k 就是"转半圈变号"`,when:`看到 FFT 蝶形想单位根对称性；看到单位根想 FFT`}
  ],
  ext:[
    {t:`DFT 矩阵由单位根搭成`,go:`fo.basis`},
    {t:`FFT 利用单位根的平方与反号对称`,go:`fo.fft`},
    {t:`一般多项式的 n 个复根`,go:`cx.poly_roots`},
    {t:`循环群与原根的数论版`,go:`di.modular`}
  ]
},

/* ================================================================== */
'cx.oscillation': {
  layers:{
    alg:`e^{st}，s=σ+iω：d/dt e^{st}=s·e^{st}，微分变成乘 s。实解 x(t)=Re[A e^{st}]=|A|e^{σt}cos(ωt+arg A)。二阶 ODE x″+2ζω₀x′+ω₀²x=0 代入 e^{st} 得特征方程 s²+2ζω₀s+ω₀²=0，根 s=−ζω₀±iω₀√(1−ζ²)。`,
    geo:`一个点在复平面上转圈（ω）同时半径按 e^{σt} 缩放：σ<0 螺旋向内、σ>0 螺旋向外、σ=0 匀速圆周。你看到的实信号是这个点在实轴上的投影——阻尼振荡就是螺旋线的影子。`,
    comp:`np.exp(s*t) 一行得复轨迹，.real 取投影；ODE 数值积分与 Re[e^{s₁t}] 对比；A 的模和辐角分别设幅度与初相。Re 一定放最后一步。`
  },
  proof:{
    from:`e^{iθ}=cosθ+i sinθ；指数律 e^{a+b}=e^a e^b；(e^{ct})′=c e^{ct} 对复 c 成立；线性 ODE 解的叠加`,
    to:`复指数是微分算子的特征函数（微分 = 乘常数）；实振荡 = 复指数的实部；线性常系数 ODE 化为代数方程；复幅值 A 编码幅度与初相`,
    steps:[
      [`e^{(σ+iω)t}=e^{σt}e^{iωt}=e^{σt}(cos ωt+i sin ωt)`,`指数律 + 欧拉。实部 e^{σt}cos ωt 是包络 × 振荡`],
      [`d/dt e^{st}=s e^{st}：微分只乘一个常数 s，函数形状不变`,`级数逐项求导（或链式法则）对复 s 同样成立；对比 (cos ωt)′=−ω sin ωt 形状变了、(sin)′ 又变回 cos，实正弦不是微分的特征函数`],
      [`因此对 e^{st}，任何常系数线性微分算子 L=Σa_k d^k/dt^k 作用后得 L[e^{st}]=(Σa_k s^k)e^{st}=P(s)e^{st}`,`每次微分乘一个 s，叠加得多项式 P(s)。微分方程 L[x]=0 在 x=e^{st} 上化为代数方程 P(s)=0`],
      [`x″+2ζω₀x′+ω₀²x=0 ⇒ s²+2ζω₀s+ω₀²=0 ⇒ s=−ζω₀±iω₀√(1−ζ²)（0<ζ<1）`,`求根公式；判别式 4ω₀²(ζ²−1)<0 给出共轭复根。实部 −ζω₀ 是衰减率，虚部是阻尼振荡频率`],
      [`通解 x=C₁e^{s₁t}+C₂e^{s₂t}，s₂=conj(s₁)。要 x 实值需 C₂=conj(C₁)，于是 x=2Re[C₁e^{s₁t}]`,`线性叠加；实系数方程的复根共轭成对（cx.conjugate），取共轭系数使两项互为共轭，和为实数`],
      [`写 A=2C₁=|A|e^{iφ}：x=|A|e^{σt}cos(ωt+φ)。复幅值 A 的模 = 幅度，辐角 = 初相`,`Re[|A|e^{iφ}e^{σt}e^{iωt}]=|A|e^{σt}cos(ωt+φ)；两个实常数（幅度、相位）被打包进一个复常数`],
      [`Re 必须最后取：Re(z₁)Re(z₂)≠Re(z₁z₂)。中途取实部会丢掉相位信息`,`乘法混合实虚部：Re(z₁z₂)=Re z₁Re z₂−Im z₁Im z₂。线性运算（加、微分、积分、卷积）与 Re 可交换，乘法不行`],
      [`相量约定：稳态 σ=0 时所有量共用 e^{iωt}，省略它只留 A；电路里 i 写作 j`,`同频线性系统里 e^{iωt} 因子处处相同，可整体约掉；记号差异只是历史`]
    ],
    end:`复指数在微分下只被乘常数，所以线性常系数微分方程一代入就变成多项式方程；实际的实振荡是复螺旋在实轴上的影子，最后一步取实部即可，中间全用复数算。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
sigma, om = -0.3, 2.0; s = sigma + 1j*om
t = np.linspace(0, 6, 601); dt = t[1]-t[0]
z = np.exp(s*t)
# 1) 微分 = 乘常数 s（数值导数 vs s·z）
dz = np.gradient(z, dt)
print('d/dt e^{st} vs s·e^{st} 最大差:', f'{np.abs(dz - s*z)[5:-5].max():.1e}')
# 2) 实部 = e^{σt}cos ωt，且 Re 放最后 ≠ 中途取 Re
print('Re[e^{st}] vs e^{σt}cos ωt 最大差:', f'{np.abs(z.real - np.exp(sigma*t)*np.cos(om*t)).max():.1e}')
A = 2*np.exp(1j*0.9)                                       # 复幅值：模=幅度，辐角=初相
print('Re[A e^{st}] == 2e^{σt}cos(ωt+0.9):', np.allclose((A*z).real, 2*np.exp(sigma*t)*np.cos(om*t + 0.9)), '   Re(A)Re(z) == Re(Az)?', np.allclose(A.real*z.real, (A*z).real))
# 3) ODE  x″ + 2ζω₀x′ + ω₀²x = 0：代入 e^{st} 化成代数方程 s² + 2ζω₀s + ω₀² = 0
w0, zeta = 3.0, 0.2
roots = np.roots([1, 2*zeta*w0, w0**2])
print('特征根 s =', np.round(roots, 4).tolist(), '  实部 = −ζω₀ =', -zeta*w0, '  虚部 = ω₀√(1−ζ²) =', round(w0*np.sqrt(1 - zeta**2), 4))
# 用特征根拼实解，与数值积分对比
s1 = roots[0]; x_formula = (np.exp(s1*t)).real            # 初值 x(0)=1, x′(0)=Re(s1)
x = np.zeros_like(t); v = np.zeros_like(t); x[0] = 1; v[0] = s1.real
for i in range(len(t)-1):                                  # 半隐式欧拉，步长小
    a = -2*zeta*w0*v[i] - w0**2*x[i]; v[i+1] = v[i] + a*dt; x[i+1] = x[i] + v[i+1]*dt
print('Re[e^{s₁t}] vs 数值积分 ODE 最大差:', f'{np.abs(x - x_formula).max():.1e}')
# 4) 复指数过微分算子不换形，实正弦会在 sin/cos 间跳
print('d/dt cos = −sin (形状变了)；d/dt e^{iωt} = iω e^{iωt} (只乘常数):', np.allclose(np.gradient(np.exp(1j*om*t), dt)[5:-5], 1j*om*np.exp(1j*om*t)[5:-5], atol=1e-3))`,
    out:`d/dt e^{st} vs s·e^{st} 最大差: 1.4e-04
Re[e^{st}] vs e^{σt}cos ωt 最大差: 0.0e+00
Re[A e^{st}] == 2e^{σt}cos(ωt+0.9): True    Re(A)Re(z) == Re(Az)? False
特征根 s = [(-0.6+2.9394j), (-0.6-2.9394j)]   实部 = −ζω₀ = -0.6000000000000001   虚部 = ω₀√(1−ζ²) = 2.9394
Re[e^{s₁t}] vs 数值积分 ODE 最大差: 1.3e-02
d/dt cos = −sin (形状变了)；d/dt e^{iωt} = iω e^{iωt} (只乘常数): True`,
    note:`第一行是第 2 步（微分 = 乘 s）；第二、三行是第 1、6、7 步（实部 = 包络×cos，A 编码幅度初相，Re 不可中途取）；特征根一行是第 4 步；ODE 数值解 vs Re[e^{s₁t}] 是第 5 步；最后一行再对照第 2 步。`
  },
  contrast:[
    {vs:`实正弦 A cos(ωt+φ)`,same:`就是 Re[A e^{iφ}e^{iωt}]，同一个信号`,diff:`实正弦微分后在 sin/cos 间跳、两个参数分开算；复指数微分只乘 iω、两个参数打包在 A 里`,when:`推导与求解全程用复指数；最后展示/测量取实部`},
    {vs:`纯实指数 e^{σt}`,same:`都是"微分 = 乘常数"的特征函数`,diff:`实指数只增长/衰减不振荡；加上 iω 才转圈。s 平面上前者在实轴，后者离开实轴`,when:`一阶系统（RC、放射衰变）只需实指数；二阶以上出现共轭复根就需要振荡`},
    {vs:`相量 A（省略 e^{iωt}）`,same:`同一个复幅值`,diff:`相量只描述单频稳态，丢掉了 e^{σt} 与瞬态；完整复指数含衰减与起振`,when:`稳态交流/阻抗分析用相量；瞬态、稳定性回到 e^{st}`},
    {vs:`傅里叶变换的 e^{iωt}（fo.eigenfunction）`,same:`σ=0 的复指数，同为 LTI 系统与微分算子的特征函数`,diff:`傅里叶只在虚轴 s=iω 上；e^{st} 是拉普拉斯变换的核，多一维 σ 描述增长衰减`,when:`稳态频响用傅里叶；瞬态与极点用拉普拉斯`}
  ],
  ext:[
    {t:`特征根 s 的位置就是极点，决定稳定性与共振`,go:`cx.pole_zero`},
    {t:`e^{iθ} 的来源`,go:`cx.euler`},
    {t:`复指数过 LTI 系统只被乘 H(ω)`,go:`fo.eigenfunction`},
    {t:`线性 ODE 的一般解法`,go:`ca.ode`}
  ]
},

/* ================================================================== */
'cx.conjugate': {
  layers:{
    alg:`conj(a+bi)=a−bi。保持 +、×：conj(z₁+z₂)=conj z₁+conj z₂，conj(z₁z₂)=conj z₁·conj z₂，固定实数。z·conj z=|z|²，Re z=(z+conj z)/2，1/z=conj z/|z|²。实系数 p：p(conj z)=conj p(z) ⇒ 根共轭成对。实信号 X[N−k]=conj X[k]。`,
    geo:`关于实轴照镜子：(a,b)→(a,−b)。镜像保持所有距离和角度（只把方向反过来），所以加法的平行四边形、乘法的旋转缩放在镜子里照样成立——这就是"保持结构"。`,
    comp:`np.conj 只翻虚部符号，零成本。实信号 rfft 只存一半频谱，因为另一半是共轭；改频谱时正负频率必须成对改，否则 ifft 出虚部。复内积 np.vdot(a,b) 自动对第一个取共轭。`
  },
  proof:{
    from:`复数乘法展开式；实数的共轭是自身；DFT 定义；e^{−j2π(N−k)n/N}=e^{j2πkn/N}`,
    to:`conj 是保持加法乘法、固定 R 的域自同构；z conj z=|z|²；实系数多项式的非实根共轭成对；实信号频谱共轭对称`,
    steps:[
      [`conj(z₁+z₂)=(a+c)−(b+d)i=conj z₁+conj z₂`,`按定义逐分量；加法逐分量所以显然`],
      [`conj(z₁z₂)=(ac−bd)−(ad+bc)i；conj z₁·conj z₂=(a−bi)(c−di)=(ac−bd)−(ad+bc)i，相等`,`展开两边，交叉项符号一致。几何上：先镜像再旋转 θ = 先旋转 −θ 再镜像，角度反号与镜像相容`],
      [`z·conj z=(a+bi)(a−bi)=a²+b²=|z|²，实数且 ≥0；故 1/z=conj z/|z|²，Re z=(z+conj z)/2，Im z=(z−conj z)/(2i)`,`第 2 步的特例；分母有理化、求模、取实虚部全靠这一条`],
      [`实系数 p(z)=Σa_k z^k，a_k 实：conj p(z)=Σconj(a_k)conj(z)^k=Σa_k conj(z)^k=p(conj z)`,`第 1、2 步反复使用（conj 对和与积都可分配）；实系数 conj a_k=a_k`],
      [`若 p(r)=0，则 p(conj r)=conj p(r)=conj 0=0：conj r 也是根。非实根成对出现，实系数奇次多项式至少有一个实根`,`把整个方程照镜子，系数不动，根被镜像；根总数 n，配对后若 n 奇必剩一个自共轭的（实）根`],
      [`实信号 x[n]∈R：X[N−k]=Σx[n]e^{−j2π(N−k)n/N}=Σx[n]e^{j2πkn/N}=conj(Σx[n]e^{−j2πkn/N})=conj X[k]`,`e^{−j2πNn/N}=1 消去；x[n] 实所以 conj 可以整体提到求和外。这是第 4 步在"多项式 = 求和"上的同一个论证`],
      [`推论：X[0]、X[N/2] 必为实数；只改 X[k] 不同步改 X[N−k] 会破坏对称 ⇒ ifft 结果带虚部`,`k=0 与 k=N/2 是自己的镜像 ⇒ conj X=X ⇒ 实；对称一旦被破坏，逆变换不再是实信号（scratch：虚部 0.18）`],
      [`复内积必须带共轭：<v,v>=Σ v conj v=Σ|v|²≥0；不带共轭 Σv²可为负`,`第 3 步保证每项非负；v=(i,2i) 时 Σv²=−5，而 Σv conj v=5=‖v‖²`]
    ],
    end:`共轭是唯一非平凡的、保持加法乘法又固定实数的映射——照镜子。所以任何"用实数写成"的东西（实系数方程、实信号）在镜子里不变，它的复根、复频谱就必须左右对称。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
z1, z2 = complex(*np.random.randn(2)), complex(*np.random.randn(2))
c = np.conj
print('conj 保持结构: conj(z1+z2)=conj z1+conj z2:', np.isclose(c(z1+z2), c(z1)+c(z2)), ' conj(z1 z2)=conj z1·conj z2:', np.isclose(c(z1*z2), c(z1)*c(z2)), ' 固定实数 conj(3.5)=3.5:', c(3.5) == 3.5)
print('z·conj z = |z|²:', np.isclose(z1*c(z1), abs(z1)**2), '  Re z = (z+conj z)/2:', np.isclose((z1 + c(z1))/2, z1.real), '  1/z = conj z/|z|²:', np.isclose(1/z1, c(z1)/abs(z1)**2))
# 实系数多项式：根共轭成对
p = [1, -2, 5, -8, 4]                                      # 实系数
r = np.roots(p)
print('实系数多项式的根:', np.round(r, 6).tolist())
print('每个根的共轭也是根:', all(np.min(np.abs(r - c(rt))) < 1e-8 for rt in r), '   p(conj r) = conj p(r):', np.allclose(np.polyval(p, c(r)), c(np.polyval(p, r))))
# 实信号频谱共轭对称 X[N−k] = conj X[k]
N = 16; x = np.random.randn(N); X = np.fft.fft(x)
print('X[N−k] vs conj X[k] 最大差:', f'{np.abs(X[(-np.arange(N)) % N] - c(X)).max():.1e}', '  X[0], X[N/2] 虚部:', np.round(X[0].imag, 12), np.round(X[N//2].imag, 12))
# 只改正频率不同步改负频率 ⇒ 逆变换出虚部
Y = X.copy(); Y[3] *= 0.0
print('只清 X[3] 不清 X[13]: ifft 最大虚部 =', f'{np.abs(np.fft.ifft(Y).imag).max():.3f}', '  同步清 X[13]: 最大虚部 =', end=' ')
Y[N-3] *= 0.0; print(f'{np.abs(np.fft.ifft(Y).imag).max():.1e}')
# 复内积要带共轭，否则 <z,z> 可能是负数
v = np.array([1j, 2j])
print('不带共轭 Σ z·z =', np.sum(v*v), '   带共轭 Σ z·conj z =', np.sum(v*c(v)), '= ‖v‖² =', np.linalg.norm(v)**2)`,
    out:`conj 保持结构: conj(z1+z2)=conj z1+conj z2: True  conj(z1 z2)=conj z1·conj z2: True  固定实数 conj(3.5)=3.5: True
z·conj z = |z|²: True   Re z = (z+conj z)/2: True   1/z = conj z/|z|²: True
实系数多项式的根: [2j, -2j, (1+0j), (1+0j)]
每个根的共轭也是根: True    p(conj r) = conj p(r): True
X[N−k] vs conj X[k] 最大差: 5.0e-16   X[0], X[N/2] 虚部: 0.0 0.0
只清 X[3] 不清 X[13]: ifft 最大虚部 = 0.181   同步清 X[13]: 最大虚部 = 1.2e-16
不带共轭 Σ z·z = (-5+0j)    带共轭 Σ z·conj z = (5+0j) = ‖v‖² = 5.000000000000001`,
    note:`第一行是第 1、2 步（保加保乘固定实数）；第二行是第 3 步；多项式两行是第 4、5 步；X[N−k]=conj X[k] 与 X[0]、X[N/2] 虚部为 0 是第 6、7 步；只清一边出虚部 0.18 是第 7 步陷阱；最后一行是第 8 步。`
  },
  contrast:[
    {vs:`取负 −z`,same:`都是把 z 映到"对面"`,diff:`−z 是转 180°（关于原点对称），保持乘法但不固定实数；conj 是关于实轴反射，固定实数`,when:`要反向用 −z；要"配对成实"用 conj`},
    {vs:`求逆 1/z`,same:`1/z 与 conj z 幅角相同（都是 −θ）`,diff:`1/z 的模是 1/|z|，conj z 的模仍是 |z|；单位圆上两者相等`,when:`|z|=1 时 1/z=conj z，可省一次除法（单位根、旋转因子）`},
    {vs:`实内积 Σa_i b_i`,same:`复内积在实向量上退化为它`,diff:`复内积 Σ conj(a_i) b_i 对第一个变量取共轭，否则 <v,v> 不再非负、‖v‖ 无定义`,when:`凡是复向量，np.vdot 或显式 conj；np.dot 不取共轭`},
    {vs:`厄米转置 A^H=conj(A)ᵀ`,same:`就是矩阵版的共轭`,diff:`实矩阵的对称 A=Aᵀ 推广为 A=A^H（厄米），特征值实、特征向量正交这些性质靠 H 而不是 T`,when:`复矩阵一律用 .conj().T；DFT 矩阵的逆是 F^H/N`}
  ],
  ext:[
    {t:`实系数多项式根的分布`,go:`cx.poly_roots`},
    {t:`实信号 DFT 的共轭对称与 rfft`,go:`fo.basis`},
    {t:`z conj z=|z|² 与模乘`,go:`cx.multiply`},
    {t:`复内积与正交性`,go:`la.orthogonal`}
  ]
},

/* ================================================================== */
'cx.poly_roots': {
  layers:{
    alg:`代数基本定理：n 次复系数多项式恰有 n 个复根（计重数），p(z)=aₙΠ(z−rᵢ)。韦达 Σrᵢ=−aₙ₋₁/aₙ，Πrᵢ=(−1)ⁿa₀/aₙ。实系数 ⇒ 非实根共轭成对。根对系数的敏感度 ∝ 1/|p′(r)|，重根 m 阶 ⇒ 误差 ε^{1/m}。`,
    geo:`在半径很大的圆上，p(z)≈aₙzⁿ，z 绕一圈 p(z) 绕原点 n 圈。把圆连续缩到一点，绕数只能在穿过零点时改变；最后缩成一点绕数为 0，所以中间必然穿过 n 个零点（计重数）。根 = 缠绕数的来源。`,
    comp:`np.roots 用伴随矩阵的特征值（QR 迭代），不是解方程；反过来"先求特征多项式再求根"数值上很差（Wilkinson）。重根附近 np.roots 误差是 ε^{1/m} 量级，不是 ε。`
  },
  proof:{
    from:`多项式除法（因式定理）；幅角原理的直觉版（绕数连续性）；复数乘法模乘角加；共轭保持结构（cx.conjugate）`,
    to:`n 次多项式恰 n 个复根、可完全分解；韦达；实系数根共轭成对；根对系数扰动的病态性`,
    steps:[
      [`存在性直觉：|z|=R 很大时 p(z)=aₙzⁿ(1+O(1/R))，z 绕圆一周，p(z) 的幅角累计变化 ≈ n·2π`,`最高次项主导：|aₙzⁿ| 远大于其余项之和；zⁿ 的幅角是 nθ，θ 走 2π 则它走 2πn`],
      [`把圆的半径从 R 连续缩到 0：若 p 处处非零，绕数是连续的整数值函数 ⇒ 恒为 n；但半径 0 时曲线退化成一点 p(0)，绕数为 0。矛盾 ⇒ p 有零点`,`绕数只在曲线穿过原点时跳变；连续变化的整数只能是常数。这是代数基本定理的拓扑证明骨架`],
      [`因式定理：p(r)=0 ⇒ p(z)=(z−r)q(z)，q 是 n−1 次。对 q 重复第 1、2 步，归纳得 p=aₙΠ(z−rᵢ)，恰 n 个根（计重数）`,`多项式带余除法：p(z)=(z−r)q(z)+p(r)；余数 p(r)=0。每次降一次，n 次后到常数 aₙ`],
      [`韦达：展开 aₙΠ(z−rᵢ) 比较系数。z^{n−1} 系数 −aₙΣrᵢ=aₙ₋₁，常数项 aₙ(−1)ⁿΠrᵢ=a₀`,`乘法分配律展开，z^{n−1} 项来自选 n−1 个 z 与一个 −rᵢ；常数项来自全选 −rᵢ`],
      [`实系数 ⇒ p(conj z)=conj p(z) ⇒ r 是根则 conj r 是根：非实根成对，实系数奇次多项式必有实根`,`cx.conjugate 第 4、5 步；配对后若 n 奇必剩一个自共轭的实根`],
      [`绕数论证的数值版：在 |z|=50 上算 arg p(z) 的累计变化，除以 2π 得 5.0（5 次多项式）`,`第 1 步的直接测量；unwrap 把相位连续化后末值/2π 就是绕数`],
      [`敏感度：单根 r 处 p(r)=0，系数 a_k 扰动 δ：p(r+Δ)+δ r^k≈p′(r)Δ+δr^k=0 ⇒ Δ≈−δ r^k/p′(r)`,`一阶泰勒；根挤得越近 p′(r)=aₙΠ_{j≠i}(r−r_j) 越小，Δ 越大。Wilkinson 多项式 r=1..20 时 r^{19} 巨大、p′ 相对小 ⇒ 2^{−23} 扰动把根推离实轴 2.8`],
      [`m 重根：p(r+Δ)≈p^{(m)}(r)Δ^m/m!，与扰动 δ 平衡 ⇒ Δ∝δ^{1/m}`,`前 m−1 阶导数在重根处为零，最低非零项是 m 阶；(x−2)³ 常数项扰 1e-9 ⇒ 根偏 1e-3。所以数值上"先求特征多项式再求根"算特征值是错的，要直接 QR 迭代`]
    ],
    end:`复数域代数闭：任何多项式都能拆成 n 个一次因子，因为大圆上的缠绕数 n 不可能连续地消失。分解一旦存在，系数就是根的对称函数（韦达）；但反过来从系数求根是病态的——根贴近或重合时误差以 ε^{1/m} 放大。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
# 1) 代数基本定理的数值版：n 次多项式恰有 n 个复根，且 p(z) = a∏(z−rᵢ)
p = np.random.randn(6)                                     # 随机 5 次多项式
r = np.roots(p)
print('次数 5 → 根数', len(r), '  非实根个数', int(np.sum(np.abs(r.imag) > 1e-9)), ' 成共轭对:', all(np.min(np.abs(r - np.conj(rt))) < 1e-8 for rt in r))
z = np.random.randn(4) + 1j*np.random.randn(4)
print('p(z) vs a∏(z−rᵢ) 最大差:', f'{np.abs(np.polyval(p, z) - p[0]*np.prod(z[:, None] - r, axis=1)).max():.1e}')
# 2) 韦达
print('Σrᵢ =', np.round(r.sum(), 10), ' −a₄/a₅ =', round(-p[1]/p[0], 10), ' | Πrᵢ =', np.round(r.prod(), 10), ' (−1)⁵a₀/a₅ =', round(-p[5]/p[0], 10))
# 3) 幅角原理直觉：|z|=R 大圆上绕一圈，p(z) 的幅角绕 n 圈
R = 50; th = np.linspace(0, 2*np.pi, 20001)
w = np.polyval(p, R*np.exp(1j*th))
print('大圆上 arg p(z) 累计转过:', round(np.unwrap(np.angle(w))[-1] / (2*np.pi), 4), '圈  (= 次数 5)')
# 4) Wilkinson 病态：微扰 x^19 系数 2^{−23}
k = np.arange(1, 21); wk = np.poly(k)                      # ∏(x−k)
pert = wk.copy(); pert[1] += 2.0**-23
rr = np.sort_complex(np.roots(pert))
print('Wilkinson 微扰后 最大虚部:', round(np.abs(rr.imag).max(), 3), '  原根 全是 1..20 的实数; 偏离最大的根:', np.round(rr[np.argmax(np.abs(rr.imag))], 3))
# 5) 重根的数值误差是 ε^{1/m}
q = np.poly([2, 2, 2]); q[-1] += 1e-9                      # (x−2)³ 常数项扰动 1e-9
print('(x−2)³ 常数项扰 1e-9 后根偏离:', f'{np.abs(np.roots(q) - 2).max():.2e}', '  ≈ (1e-9)^(1/3) =', f'{1e-9**(1/3):.2e}')`,
    out:`次数 5 → 根数 5   非实根个数 4  成共轭对: True
p(z) vs a∏(z−rᵢ) 最大差: 8.9e-15
Σrᵢ = (-0.2268397586+0j)  −a₄/a₅ = -0.2268397586  | Πrᵢ = (0.553995964-0j)  (−1)⁵a₀/a₅ = 0.553995964
大圆上 arg p(z) 累计转过: 5.0 圈  (= 次数 5)
Wilkinson 微扰后 最大虚部: 2.775   原根 全是 1..20 的实数; 偏离最大的根: (15.306-2.775j)
(x−2)³ 常数项扰 1e-9 后根偏离: 1.00e-03   ≈ (1e-9)^(1/3) = 1.00e-03`,
    note:`第一行根数 5、共轭成对是第 3、5 步；p(z)=aΠ(z−rᵢ) 是第 3 步；韦达一行是第 4 步；大圆绕 5 圈是第 1、2、6 步；Wilkinson 是第 7 步；(x−2)³ 的 ε^{1/3} 是第 8 步。`
  },
  contrast:[
    {vs:`实数域的多项式（al.polynomial）`,same:`同一个多项式`,diff:`实数域可能无根（x²+1）或根数 <n；复数域恰 n 个，分解永远完全`,when:`数根、分解、判定"有几个解"都要到 C 里做，再看哪些是实的`},
    {vs:`矩阵特征值（la.eigen）`,same:`特征值 = 特征多项式的根，np.roots 内部反而用伴随矩阵求特征值`,diff:`由矩阵直接 QR 迭代稳定；先展开特征多项式再求根把好条件问题变成病态问题`,when:`永远用 eigvals，不要 roots(poly(A))`},
    {vs:`单位根 xⁿ=1（cx.roots_unity）`,same:`代数基本定理的最简实例：恰 n 个根、均匀分布`,diff:`一般多项式的根位置无规律，要数值求；单位根有闭式`,when:`xⁿ=c 型用极坐标闭式；一般多项式用 np.roots 或迭代`},
    {vs:`韦达定理（al.vieta）`,same:`同一组根与系数的关系`,diff:`韦达是"知根求系数"，稳定；反问题"知系数求根"病态`,when:`验算根用韦达；求根别指望韦达`}
  ],
  ext:[
    {t:`最简单的完全分解：单位根`,go:`cx.roots_unity`},
    {t:`根共轭成对的来源`,go:`cx.conjugate`},
    {t:`分母多项式的根 = 系统极点`,go:`cx.pole_zero`},
    {t:`特征多项式与特征值的数值稳定性`,go:`la.eigen`}
  ]
},

/* ================================================================== */
'cx.pole_zero': {
  layers:{
    alg:`H(s)=K·Π(s−zᵢ)/Π(s−pⱼ)。|H(jω)|=|K|·Π|jω−zᵢ|/Π|jω−pⱼ|，∠H=Σ∠(jω−zᵢ)−Σ∠(jω−pⱼ)。冲激响应 h(t)=Σ Rⱼe^{pⱼt}（部分分式）。稳定 ⇔ 所有 Re pⱼ<0（连续）或 |pⱼ|<1（离散）。二阶 H=ω₀²/(s²+2ζω₀s+ω₀²)：极点 −ζω₀±jω₀√(1−ζ²)，共振峰 ≈1/(2ζ)。`,
    geo:`s 平面上插几根旗子：零点 ○ 极点 ×。沿虚轴从下往上走，每个位置的增益 = 到所有 ○ 的距离之积 ÷ 到所有 × 的距离之积。走到一个 × 旁边分母骤小、增益冲天（共振）；踩到一个 ○ 上增益为零（陷波）。× 若在右半平面，对应的 e^{pt} 随时间膨胀——系统爆炸。`,
    comp:`np.roots 求分母根得极点；频响直接按距离公式 np.prod(1j*w−poles)；判稳看 poles.real.max()<0；离散 IIR y[n]=a y[n−1]+x[n] 极点 z=a，|a|≥1 就发散。高阶 IIR 拆成二阶节避免极点被舍入推出单位圆。`
  },
  proof:{
    from:`线性常系数 ODE 代入 e^{st} 化为代数方程（cx.oscillation）；多项式完全分解（cx.poly_roots）；部分分式；复数模乘角加`,
    to:`传递函数由零极点决定；|H(jω)| 的几何距离公式；极点决定瞬态与稳定性；极点靠近虚轴 ⇒ 共振；零点在虚轴上 ⇒ 陷波；右半平面零点 ⇒ 非最小相位`,
    steps:[
      [`线性常系数系统 Σb_k y^{(k)}=Σa_k x^{(k)}，输入 e^{st} 时输出 H(s)e^{st}，H(s)=N(s)/D(s)=Σa_k s^k/Σb_k s^k`,`e^{st} 是微分的特征函数（cx.oscillation 第 3 步），每次微分乘 s，两边各得一个多项式`],
      [`分子分母在 C 上完全分解：H(s)=K·Π(s−zᵢ)/Π(s−pⱼ)。零点 zᵢ 是 N 的根，极点 pⱼ 是 D 的根`,`代数基本定理（cx.poly_roots）；系统被有限个点 + 一个常数 K 完全刻画`],
      [`令 s=jω，取模：|H(jω)|=|K|Π|jω−zᵢ|/Π|jω−pⱼ|；取幅角：∠H=Σ∠(jω−zᵢ)−Σ∠(jω−pⱼ)`,`复数乘除 = 模乘除、角加减（cx.multiply）；|jω−p| 就是虚轴上点 jω 到 p 的欧氏距离`],
      [`极点 p 靠近虚轴（Re p→0⁻）：ω≈Im p 时分母含 |jω−p|≈|Re p| 极小 ⇒ 增益峰。二阶系统峰 ≈1/(2ζ)`,`距离公式直接读；二阶时 |jω₀−p|=ζω₀，另一极点距离 ≈2ω₀，K=ω₀² ⇒ ω₀²/(ζω₀·2ω₀)=1/(2ζ)（scratch：ζ=0.02 时 25.0）`],
      [`零点恰在虚轴 jω₀ 上：|jω₀−z|=0 ⇒ |H(jω₀)|=0，该频率被完全扣掉（陷波）`,`分子的某个因子为零；50/60 Hz 陷波器就是把一对共轭零点放在 ±j2π·50 上、极点放在它们内侧一点`],
      [`部分分式（极点互异）：H(s)=ΣRⱼ/(s−pⱼ) ⇒ h(t)=ΣRⱼe^{pⱼt}（t≥0）。每个极点贡献一个模态 e^{pⱼt}`,`有理函数可按极点拆成一次分式之和；1/(s−p) 的逆拉普拉斯是 e^{pt}。极点 = 系统自己会振的模式`],
      [`稳定 ⇔ 所有 Re pⱼ<0：|e^{pt}|=e^{Re(p)t}，Re p<0 衰减、>0 指数爆炸。离散 y[n]=a y[n−1]+x[n] ⇒ H(z)=1/(1−az⁻¹)，极点 a，h[n]=aⁿ，稳定 ⇔ |a|<1`,`模态是否衰减只看指数的实部（连续）或底数的模（离散）；s 平面左半 ↔ z 平面单位圆内（z=e^{sT}）`],
      [`零点在右半平面（非最小相位）：|H| 不变（到 z 和到 −conj z 的距离相同）但相位多滞后，阶跃响应先向反方向走`,`把零点 z 换成关于虚轴的镜像 −conj z，每个 ω 的距离相同 ⇒ 幅频相同；但 ∠(jω−z) 的走向相反 ⇒ 额外相位滞后。(s−1)/(s+1)² 的阶跃响应先到 +0.21 再落到 −1（scratch）`]
    ],
    end:`系统的一切都写在 s 平面几根旗子上：增益 = 到零点距离积 ÷ 到极点距离积，瞬态 = 每个极点各贡献一个 e^{pt}。极点贴近虚轴就是共振，越过虚轴就是爆炸；零点决定哪些频率被扣掉、以及相位怎么走。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
# 连续系统 H(s) = ω₀² / (s² + 2ζω₀ s + ω₀²)：极点靠近虚轴 ⇒ 共振
w0 = 10.0
for zeta in [0.5, 0.1, 0.02]:
    poles = np.roots([1, 2*zeta*w0, w0**2])
    w = np.linspace(0.1, 30, 30000); s = 1j*w
    H = w0**2/np.prod(s[:, None] - poles, axis=1)          # |H| = K / ∏|jω − pⱼ|
    print(f'ζ={zeta:4.2f} 极点 {np.round(poles[0], 3)}  距虚轴 {abs(poles[0].real):5.2f}  峰值增益 {np.abs(H).max():6.2f} (≈1/(2ζ)={1/(2*zeta):5.2f})  峰在 ω={w[np.argmax(np.abs(H))]:.2f}')
# 稳定性：极点实部 < 0 ⇒ 冲激响应衰减；> 0 ⇒ 爆炸
t = np.linspace(0, 5, 6)
for pole in [-1+3j, 1+3j]:
    print(f'极点 {pole}: |e^{{pt}}| 随 t =', np.round(np.abs(np.exp(pole*t)), 2).tolist())
# 离散系统 y[n] = a y[n−1] + x[n]：极点 z=a，|a|<1 稳定
for a in [0.9, 1.05]:
    y = 0.0; x = np.zeros(60); x[0] = 1
    ys = []
    for xn in x: y = a*y + xn; ys.append(y)
    print(f'离散极点 a={a}: y[59] = {ys[-1]:.3e}   {"稳定" if abs(a) < 1 else "发散"}')
# 零点：|H| = ∏|jω−zᵢ|/∏|jω−pⱼ|，零点在 jω₀ 上 ⇒ 该频率完全被扣掉（陷波）
zeros = np.array([1j*5, -1j*5]); poles = np.array([-0.5+5j, -0.5-5j])
w = np.array([4.0, 5.0, 6.0]); s = 1j*w
H = np.prod(s[:, None] - zeros, axis=1)/np.prod(s[:, None] - poles, axis=1)
print('陷波器 |H| 在 ω=4,5,6:', np.round(np.abs(H), 4).tolist(), ' (零点正好在 j5 上)')
# 右半平面零点：稳定但阶跃响应先反向。H(s)=(s−1)/(s+1)²：先解 x″+2x′+x=1，再取 y = x′ − x
dt = 1e-3; T = 8.0; x = v = 0.0; ys = []
for _ in range(int(T/dt)):
    a = 1 - 2*v - x; v += a*dt; x += v*dt; ys.append(v - x)
ys = np.array(ys)
print('非最小相位 (s−1)/(s+1)² 阶跃响应: 前 0.5s 最大值', round(ys[:500].max(), 3), ' 终值', round(ys[-1], 3), ' (先往 + 走，最后落到 −1)')`,
    out:`ζ=0.50 极点 (-5+8.66j)  距虚轴  5.00  峰值增益   1.15 (≈1/(2ζ)= 1.00)  峰在 ω=7.07
ζ=0.10 极点 (-1+9.95j)  距虚轴  1.00  峰值增益   5.03 (≈1/(2ζ)= 5.00)  峰在 ω=9.90
ζ=0.02 极点 (-0.2+9.998j)  距虚轴  0.20  峰值增益  25.00 (≈1/(2ζ)=25.00)  峰在 ω=10.00
极点 (-1+3j): |e^{pt}| 随 t = [1.0, 0.37, 0.14, 0.05, 0.02, 0.01]
极点 (1+3j): |e^{pt}| 随 t = [1.0, 2.72, 7.39, 20.09, 54.6, 148.41]
离散极点 a=0.9: y[59] = 1.997e-03   稳定
离散极点 a=1.05: y[59] = 1.779e+01   发散
陷波器 |H| 在 ω=4,5,6: [0.8931, 0.0, 0.8935]  (零点正好在 j5 上)
非最小相位 (s−1)/(s+1)² 阶跃响应: 前 0.5s 最大值 0.213  终值 -0.994  (先往 + 走，最后落到 −1)`,
    note:`前三行 ζ 越小极点越贴虚轴、峰 ≈1/(2ζ) 是第 3、4 步；|e^{pt}| 两行与离散 a=0.9/1.05 是第 6、7 步稳定性；陷波器 |H(j5)|=0 是第 5 步；最后一行非最小相位先反向是第 8 步。`
  },
  contrast:[
    {vs:`多项式根（cx.poly_roots）`,same:`极点零点就是分母分子的根`,diff:`根只是数；极点零点赋予它们物理含义——每个极点一个模态 e^{pt}，位置决定衰减与频率`,when:`求位置用 np.roots；解释行为看它们相对虚轴/单位圆的位置`},
    {vs:`频率响应 H(jω)（fo.filter）`,same:`H(jω) 就是 H(s) 在虚轴上的取值`,diff:`频响只看虚轴这一条线，稳态；零极点看整个平面，附带瞬态与稳定性`,when:`只关心稳态增益/相位看频响；设计 IIR、判稳定、看振铃看零极点`},
    {vs:`FIR 滤波器`,same:`也是 H(z)=N(z)/D(z)`,diff:`FIR 的 D(z)=z^M，所有极点在原点，永远稳定；IIR 有非平凡极点，效率高但要防越界`,when:`保稳定/线性相位选 FIR；低阶陡截止选 IIR 并用二阶节`},
    {vs:`特征值（la.eigen）`,same:`状态空间里极点 = 系统矩阵 A 的特征值`,diff:`极点是传递函数视角，特征值是状态矩阵视角，零极点相消时特征值可能多于极点`,when:`单输入单输出用传递函数；多变量/内部稳定性用特征值`}
  ],
  ext:[
    {t:`每个极点贡献一个 e^{pt} 模态`,go:`cx.oscillation`},
    {t:`极点零点是多项式的根`,go:`cx.poly_roots`},
    {t:`虚轴上的取值就是滤波器频响`,go:`fo.filter`},
    {t:`状态矩阵特征值 = 极点`,go:`la.eigen`}
  ]
}

});
