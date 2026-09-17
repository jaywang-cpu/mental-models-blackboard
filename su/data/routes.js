// 数理宇宙 v2 · 判型树 ROUTES（CONTRACT2.md 第 4 节）
// 每个大陆一棵。节点两种：{q, a:[{c, to}]} 或叶子 {go:'node.id', note:'一句话结论'}
// 用法：先判型（用户脑子里能判断的东西），再落到具体牌子。
window.ROUTES = window.ROUTES || {};
Object.assign(window.ROUTES, {

/* ===================== math ===================== */

ns:{ name:'数感', en:'Number Sense', page:'math',
 root:{q:'你现在要的是什么？', a:[
  {c:'一个大概的数（估算/比大小）', to:{q:'数字跨了好几个数量级吗？', a:[
    {c:'跨了，而且指数在动', to:{q:'比的是塔的高度还是位数？', a:[
      {c:'指数位在变（a^b 比 c^d）', to:{go:'ns.max_digits', note:'比 b·ln a 与 d·ln c，别看底谁大'}},
      {c:'只是位数多', to:{go:'ns.magnitude', note:'写成 首位×10^k，只保一位有效数字'}}]}},
    {c:'跨了，但只想画出来看', to:{go:'ns.log_scale', note:'跨 2 个数量级以上就换 log 轴，乘法变加法'}},
    {c:'没跨，只想快速猜个数', to:{go:'ns.estimate', note:'费米法：拆成几个能猜的因子，误差互相抵消'}}]}},
  {c:'一个精确值，但要心算', to:{q:'是乘除还是百分比？', a:[
    {c:'乘法，两数靠近同一个整数', to:{go:'ns.square_trick', note:'(a+d)(a−d)=a²−d²，先平方再修正'}},
    {c:'乘法，随便两个数', to:{go:'ns.mental_mult', note:'拆成整十再补：a×b=a×10^k ± a×r，从左往右算'}},
    {c:'一长串加减乘要连着算', to:{go:'ns.abacus', note:'脑中摆珠：每位只留 0-9 和进位，不记中间结果'}},
    {c:'百分比、涨跌、折扣', to:{go:'ns.percent', note:'x% of y = y% of x；涨 a% 再跌 a% 净亏 a²/100 %'}}]}},
  {c:'判断能不能整除 / 怎么拆开', to:{q:'只要判断，还是要真的拆出因子？', a:[
    {c:'只判断能不能整除', to:{go:'ns.divisibility', note:'3、9 看数字和；4 看末两位；11 看奇偶位差'}},
    {c:'要拆成质因数', to:{go:'ns.factor', note:'试除到 √n 为止；先剥 2、3、5 再跳着试'}}]}},
  {c:'一堆数要总结或凑出一个目标', to:{q:'是要一个代表值，还是要凑数？', a:[
    {c:'要代表值（平均/中位）', to:{go:'ns.average_trap', note:'速度取调和平均，增长率取几何平均，算术平均会骗人'}},
    {c:'要凑成指定的数', to:{go:'ns.make24', note:'先找 8×3 / 6×4 / 12×2 的两组，允许分数就多一半解'}}]}}]}},

al:{ name:'代数', en:'Algebra', page:'math',
 root:{q:'你手上是一个式子，还是一个要解的方程？', a:[
  {c:'一个函数/式子，想知道它长什么样', to:{q:'它是哪一类脸？', a:[
    {c:'有平方项', to:{go:'al.quadratic', note:'配方成 a(x+b/2a)²+c；顶点 x=−b/2a，判别式定根数'}},
    {c:'有 e^x 或 log', to:{go:'al.exp_log', note:'指数=等比增长，对数=位数；a^x=e^{x ln a}'}},
    {c:'有 sin/cos', to:{go:'al.trig', note:'先读振幅、周期 2π/ω、相位；其余靠单位圆'}},
    {c:'一堆 x 的幂相加', to:{go:'al.polynomial', note:'n 次最多 n 个根；f(a)=0 ⇔ (x−a) 是因式'}},
    {c:'都不像，只想先认脸', to:{go:'al.function_zoo', note:'看三件套：单调性、凹凸、两端跑向哪'}}]}},
  {c:'一个要解的方程或不等式', to:{q:'未知数几个？', a:[
    {c:'一个，二次或对称形式', to:{go:'al.vieta', note:'x₁+x₂=−b/a，x₁x₂=c/a；不解方程也能算对称式'}},
    {c:'一个，带绝对值', to:{go:'al.abs_ineq', note:'|x|<a ⇔ −a<x<a；|x|>a 拆成两段并起来'}},
    {c:'一个，但式子里有整块重复出现', to:{go:'al.substitution', note:'令重复那块=t，先把次数降下来再解'}},
    {c:'多个未知数', to:{go:'al.system_eq', note:'消元或写成 Ax=b；方程少于未知数就一定有自由度'}}]}},
  {c:'一串按规律往下走的数', to:{q:'相邻两项差固定还是比固定？', a:[
    {c:'差固定或比固定', to:{go:'al.sequence', note:'等差 Sn=n(a₁+aₙ)/2；等比 Sn=a₁(1−qⁿ)/(1−q)'}},
    {c:'只想知道翻倍要多久', to:{go:'al.doubling', note:'翻倍期数 ≈ 72 ÷ 每期增长率(%)'}}]}},
  {c:'要求最值 / 证一个不等式', to:{q:'有没有"和固定"或"积固定"的结构？', a:[
    {c:'有', to:{go:'al.inequality_amgm', note:'a+b ≥ 2√(ab)，等号当 a=b；和定则积最大'}},
    {c:'没有，是普通函数', to:{go:'al.quadratic', note:'化成二次就看顶点；否则留给微积分求导'}}]}},
  {c:'化简里出现了 log，答案对不上', to:{q:'是拆错了还是定义域漏了？', a:[
    {c:'把 log(a+b) 拆开了', to:{go:'al.log_trap', note:'log(a+b) ≠ log a + log b；只有乘除能拆'}},
    {c:'忘了真数必须 >0', to:{go:'al.log_trap', note:'解完必须回代验定义域；换底 log_b a = ln a / ln b'}}]}}]}},

ge:{ name:'几何', en:'Geometry', page:'math',
 root:{q:'题目给的是坐标/向量，还是纯图形？', a:[
  {c:'给了坐标或向量', to:{q:'你要的是长度、角度，还是面积？', a:[
    {c:'长度、远近', to:{go:'ge.distance', note:'欧氏 √Σ(Δx)²；只比大小就比平方，省一次开方'}},
    {c:'角度、方向像不像', to:{go:'ge.dot_projection', note:'cosθ=a·b/(|a||b|)；a 在 b 上的投影 =(a·b/|b|²)b'}},
    {c:'面积、朝向左右', to:{go:'ge.area_cross', note:'平行四边形面积=|x₁y₂−x₂y₁|，符号给出左右手'}},
    {c:'只想先会摆弄向量本身', to:{go:'ge.vector', note:'向量=方向+长度，可平移；加法首尾相接'}}]}},
  {c:'纯图形（三角形、圆、相似）', to:{q:'图里有直角或圆吗？', a:[
    {c:'有直角', to:{go:'ge.pythagoras', note:'a²+b²=c²；反过来也能用来验直角'}},
    {c:'有圆', to:{q:'问的是角，还是曲线的方程？', a:[
      {c:'角', to:{go:'ge.inscribed_angle', note:'同弧圆周角=圆心角一半；直径所对必是直角'}},
      {c:'方程或轨迹', to:{go:'ge.conic', note:'到两定点距离和=椭圆，差=双曲；到点=到线=抛物'}}]}},
    {c:'都没有，只是形状相同', to:{go:'ge.similar', note:'对应角相等 ⇒ 边成比例；面积比=边比²，体积比=边比³'}}]}},
  {c:'要把图形挪、转、缩', to:{q:'是绕原点旋转，还是一串变换叠加？', a:[
    {c:'旋转为主', to:{go:'ge.polar', note:'用 (r,θ)；乘 e^{iθ} 就是转 θ 角，复数乘法=旋转+缩放'}},
    {c:'平移旋转缩放混在一起', to:{go:'ge.transform', note:'各写成矩阵再相乘；顺序不能交换'}}]}},
  {c:'要写一条直线或一个平面', to:{q:'手上有法向量吗？', a:[
    {c:'有法向量或能读出来', to:{go:'ge.normal_line', note:'n·(x−x₀)=0；ax+by=c 的法向量就是 (a,b)'}},
    {c:'只有两个点', to:{go:'ge.distance', note:'方向向量=两点之差，再配一个点写参数方程'}}]}}]}},

la:{ name:'线性代数', en:'Linear Algebra', page:'math',
 root:{q:'你面对的是矩阵在"做什么"，还是要"解出什么"？', a:[
  {c:'想知道这个矩阵在做什么', to:{q:'关心整体变形，还是有没有不变的方向？', a:[
    {c:'整体变形：体积、翻转、可不可逆', to:{go:'la.determinant', note:'det=体积缩放倍数；det=0 就是压扁了，不可逆'}},
    {c:'整体变形：列向量到底去了哪', to:{go:'la.matrix_transform', note:'矩阵第 j 列 = 第 j 个基向量变换后的位置'}},
    {c:'它好像不改长度和角度', to:{go:'la.orthogonal', note:'QᵀQ=I，所以 Q⁻¹=Qᵀ；旋转和反射都属于它'}},
    {c:'找不变方向', to:{q:'是方阵吗？', a:[
      {c:'是方阵', to:{go:'la.eigen', note:'Av=λv；在特征基下 A^k 就变成 λ^k'}},
      {c:'长方形矩阵', to:{go:'la.svd', note:'A=UΣVᵀ：任何矩阵=旋转·拉伸·旋转，奇异值大小即重要性'}}]}}]}},
  {c:'要解方程或做拟合', to:{q:'方程数和未知数谁多？', a:[
    {c:'一样多，且矩阵可逆', to:{go:'la.inverse', note:'x=A⁻¹b；实战用 solve，别真的求逆'}},
    {c:'方程更多，解不精确', to:{go:'la.least_squares', note:'AᵀAx=Aᵀb；几何上就是把 b 投影到列空间'}},
    {c:'方程更少，解不唯一', to:{go:'la.null_space', note:'通解=一个特解+零空间；自由度=n−rank'}}]}},
  {c:'想知道信息有多少 / 有没有冗余', to:{q:'问的是独立方向数，还是换坐标系？', a:[
    {c:'独立方向数', to:{go:'la.rank', note:'rank=列空间维数=非零奇异值个数；满秩才可逆'}},
    {c:'换一套坐标看同一个东西', to:{go:'la.basis', note:'基就是一套量尺；换基 x_new=P⁻¹x'}}]}},
  {c:'代码报形状错 / 要把向量拆到某个方向上', to:{q:'是 shape 对不上，还是要做投影？', a:[
    {c:'shape 对不上', to:{go:'la.matmul_shape', note:'(m,n)·(n,p)=(m,p)；内侧维度必须相等'}},
    {c:'要投影', to:{go:'la.projection', note:'P=A(AᵀA)⁻¹Aᵀ，P²=P；残差垂直于列空间'}}]}}]}},

ca:{ name:'微积分', en:'Calculus', page:'math',
 root:{q:'你要的是"变化多快"，还是"累计多少"？', a:[
  {c:'变化多快（求导）', to:{q:'自变量几个？', a:[
    {c:'一个，而且函数套着函数', to:{go:'ca.chain_rule', note:'外层导 × 内层导；神经网络反传就是它'}},
    {c:'一个，是乘积或商', to:{go:'ca.product_quotient', note:'(uv)′=u′v+uv′；(u/v)′=(u′v−uv′)/v²'}},
    {c:'一个，只想搞懂导数是什么', to:{go:'ca.derivative_slope', note:'导数=切线斜率=局部放大后的线性系数'}},
    {c:'多个，只要最陡的方向', to:{go:'ca.gradient', note:'∇f 指向最陡上升；下降就走 −∇f'}},
    {c:'多个，还要判断是不是极小点', to:{go:'ca.partial_hessian', note:'Hessian 正定=极小，负定=极大，不定=鞍点'}}]}},
  {c:'累计多少（积分）', to:{q:'能不能直接积出来？', a:[
    {c:'常规函数，直接积', to:{go:'ca.integral_area', note:'积分=面积；∫ₐᵇ f = F(b)−F(a)'}},
    {c:'里面有复合或乘积，积不动', to:{go:'ca.integration_tricks', note:'先凑微分换元；∫u dv=uv−∫v du，把会消失的当 u'}}]}},
  {c:'要找最好的那个点', to:{q:'有没有约束条件？', a:[
    {c:'没有约束', to:{go:'ca.optimization', note:'一阶导=0 找候选，二阶导定性，端点别漏'}},
    {c:'有等式约束', to:{go:'ca.lagrange', note:'∇f=λ∇g；梯度平行=沿约束面再也走不动了'}}]}},
  {c:'只关心附近的近似，或数值算炸了', to:{q:'是要近似，还是数值出问题？', a:[
    {c:'要在某点附近近似', to:{go:'ca.taylor', note:'f(x₀+h)≈f+f′h+f″h²/2；e^x≈1+x，ln(1+x)≈x'}},
    {c:'连乘下溢 / softmax 溢出', to:{go:'ca.log_trick', note:'连乘取 log 变连加；softmax 先减最大值，用 logsumexp'}},
    {c:'出现 0/0 或 ∞/∞', to:{go:'ca.limit', note:'先化简约分；不行用洛必达或泰勒展开首项'}}]}},
  {c:'已知变化率，要推未来的量', to:{q:'变化率只依赖当前量吗？', a:[
    {c:'是（正比于自身）', to:{go:'ca.ode', note:'y′=ky ⇒ y=Ce^{kt}；先分离变量，再用初值定 C'}},
    {c:'还依赖时间或别的量', to:{go:'ca.ode', note:'先写清 dy/dt=f(y,t)，能分离就分离，不能就数值解'}}]}}]}},

pr:{ name:'概率统计', en:'Probability & Statistics', page:'math',
 root:{q:'你手上是一套"随机机制"，还是一堆"已有数据"？', a:[
  {c:'随机机制，要算概率', to:{q:'有没有"已知某事发生了"的条件？', a:[
    {c:'有，而且要反推原因', to:{go:'pr.bayes', note:'后验 ∝ 似然 × 先验；先想基础率再想证据强度'}},
    {c:'有，只是缩小了样本空间', to:{go:'pr.conditional', note:'P(A|B)=P(AB)/P(B)；独立 ⇔ P(AB)=P(A)P(B)'}},
    {c:'没有，先要认出这是哪个分布', to:{q:'数的是次数还是量？', a:[
      {c:'数成功次数 / 单位时间的件数', to:{go:'pr.binomial_poisson', note:'n 次独立试验用二项；n 大 p 小取 λ=np 用泊松'}},
      {c:'连续的量，由很多因素叠加', to:{go:'pr.gaussian', note:'N(μ,σ²)，68-95-99.7；正态的线性组合仍是正态'}},
      {c:'都不像', to:{go:'pr.distribution', note:'先问三句：离散还是连续、有没有上界、是计数还是等待时间'}}]}}]}},
  {c:'一堆数据，要总结出数字', to:{q:'一个变量还是两个？', a:[
    {c:'一个，要中心', to:{go:'pr.expectation', note:'E[aX+b]=aE[X]+b；期望对求和永远可加，不管独不独立'}},
    {c:'一个，要波动大小', to:{go:'pr.variance', note:'Var=E[X²]−E[X]²；只有独立时 Var(X+Y)=VarX+VarY'}},
    {c:'两个，要看它们有没有关系', to:{go:'pr.covariance', note:'ρ=Cov/(σₓσᵧ)∈[−1,1]；只测线性，且相关不等于因果'}},
    {c:'关心的是"样本均值"本身的随机性', to:{go:'pr.clt', note:'n 大时 x̄≈N(μ,σ²/n)；标准误 σ/√n，要精一倍得四倍样本'}}]}},
  {c:'要从数据估参数或下结论', to:{q:'是估一个数，还是判断"有没有差别"？', a:[
    {c:'估参数，没有先验信息', to:{go:'pr.mle', note:'最大化 log 似然，通常令导数=0'}},
    {c:'估参数，有先验或想防过拟合', to:{go:'pr.map_prior', note:'MAP=MLE+log 先验；高斯先验=L2，拉普拉斯先验=L1'}},
    {c:'判断两组有没有差别', to:{go:'pr.hypothesis', note:'p 值=零假设成立时看到这么极端的概率；一定要配效应量和置信区间'}},
    {c:'想量化"信息量"或两个分布差多远', to:{go:'pr.entropy', note:'H=−Σp log p；KL(p‖q)≥0 且不对称，交叉熵=H+KL'}}]}}]}},

co:{ name:'组合', en:'Combinatorics', page:'math',
 root:{q:'你要数的是什么？', a:[
  {c:'数"排法/选法"有多少种', to:{q:'顺序算不算？', a:[
    {c:'算（排列）', to:{q:'元素能重复用吗？', a:[
      {c:'不能重复', to:{go:'co.perm_comb', note:'A(n,k)=n!/(n−k)!'}},
      {c:'能重复', to:{go:'co.perm_comb', note:'nᵏ'}},
      {c:'排成一圈，或有一样的元素', to:{go:'co.circular_repeat', note:'圆排列 (n−1)!；有重复要除以各自的 nᵢ!'}}]}},
    {c:'不算（组合）', to:{q:'有没有"至少 / 恰好 / 不能相邻"这类限制？', a:[
      {c:'没有限制', to:{go:'co.perm_comb', note:'C(n,k)=n!/(k!(n−k)!)'}},
      {c:'有"至少一个""不能全是"', to:{go:'co.complement', note:'正难则反：总数 − 反面；"至少一个"最典型'}},
      {c:'几个条件互相重叠', to:{go:'co.inclusion_exclusion', note:'|A∪B|=|A|+|B|−|A∩B|；奇加偶减'}}]}},
    {c:'把 n 个相同的东西分给 k 个人', to:{go:'co.stars_bars', note:'C(n+k−1,k−1)；每人至少 1 个则 C(n−1,k−1)'}}]}},
  {c:'对象太怪，硬数数不动', to:{q:'能不能改造成已知模型？', a:[
    {c:'能和另一种好数的东西一一对应', to:{go:'co.bijection', note:'数 A 难就去数与 A 一一对应的 B'}},
    {c:'能由更小规模的情况拼出来', to:{go:'co.recursion', note:'先定状态，再写 f(n)=…f(n−1)…；汉诺塔 2ⁿ−1'}},
    {c:'是括号串、格路、二叉树这类"不许越界"的结构', to:{go:'co.catalan', note:'Cₙ=C(2n,n)/(n+1)：1,2,5,14,42'}},
    {c:'是点和边的结构', to:{go:'co.graph_count', note:'n 个标号点的树有 n^{n−2} 棵；完全图 C(n,2) 条边'}}]}},
  {c:'不数个数，只要证明"一定存在"', to:{q:'是"必有重复"还是"必有极端"？', a:[
    {c:'必有两个落进同一格', to:{go:'co.pigeonhole', note:'n+1 只鸽子 n 个巢 ⇒ 某巢 ≥2；推广到 ⌈n/k⌉'}},
    {c:'必有一个不低于平均', to:{go:'co.pigeonhole', note:'总有元素 ≥ 平均值，这是抽屉的另一副面孔'}}]}},
  {c:'要展开 (a+b)ⁿ 或求系数和', to:{q:'只要某一项，还是要整体？', a:[
    {c:'某一项的系数', to:{go:'co.binomial', note:'C(n,k)a^{n−k}bᵏ；杨辉三角相邻两数相加'}},
    {c:'整体求和或带权求和', to:{go:'co.generating', note:'把序列塞进 Σaₙxⁿ，卷积就变成乘法'}}]}},
  {c:'最基本的"该乘还是该加"没想清', to:{go:'co.multiplication_rule', note:'分步用乘，分类用加；判据是"要不要每一步都做"'}}]}},

di:{ name:'离散数论', en:'Discrete Math & Number Theory', page:'math',
 root:{q:'问题落在哪：整数的性质、逻辑证明，还是结构与效率？', a:[
  {c:'整数的性质', to:{q:'关心余数，还是关心因子？', a:[
    {c:'余数，而且指数很大', to:{go:'di.fermat_fastpow', note:'p 为质数时 a^{p−1}≡1；快速幂 O(log n) 平方累乘'}},
    {c:'余数，有好几个同余条件', to:{go:'di.crt', note:'模两两互质时解唯一，模 Πmᵢ'}},
    {c:'余数，就是普通取模', to:{go:'di.modular', note:'加减乘可以随时取模，除法不行，要乘逆元'}},
    {c:'因子，只判断能不能整除', to:{go:'di.divisibility', note:'3、9 看数字和；11 看奇偶位差；7 看末位×2 相减'}},
    {c:'因子，要拆成质数', to:{go:'di.prime', note:'试除到 √n；每个数的质因数分解唯一'}},
    {c:'因子，要两个数的公因子', to:{go:'di.gcd', note:'gcd(a,b)=gcd(b, a mod b)；lcm=ab/gcd'}}]}},
  {c:'要证明一个命题', to:{q:'命题是"对所有 n 成立"吗？', a:[
    {c:'是，而且能从 n 推到 n+1', to:{go:'di.induction', note:'先验 n=1，再假设 n=k 推 k+1；需要全部 ≤k 就用强归纳'}},
    {c:'不是，是真假的逻辑组合', to:{go:'di.logic', note:'p→q ≡ ¬p∨q；逆否等价，逆命题不等价'}},
    {c:'涉及集合、映射是否一一对应', to:{go:'di.set_function', note:'单射不撞，满射盖满，双射可逆'}}]}},
  {c:'结构与效率', to:{q:'关心"谁连着谁"，还是"要跑多久"？', a:[
    {c:'谁连着谁', to:{go:'di.graph', note:'点+边；度数和=2×边数；先判连通、有没有环、是不是二分'}},
    {c:'要跑多久', to:{go:'di.big_o', note:'只留最高阶且丢常数；嵌套循环相乘，分治 T(n)=2T(n/2)+n=O(n log n)'}}]}},
  {c:'数在计算机里的形态', to:{q:'是换进制，还是要按位操作？', a:[
    {c:'换进制', to:{go:'di.base_convert', note:'除基取余、倒着读；二进制与十六进制每 4 位一组'}},
    {c:'按位操作', to:{go:'di.bits', note:'x&(x−1) 抹掉最低位的 1；<<1 就是乘 2；异或=不进位加法'}}]}}]}},

/* ===================== code ===================== */

py:{ name:'Python', en:'Python', page:'code',
 root:{q:'你现在卡在哪？', a:[
  {c:'不知道该用什么装数据', to:{q:'要按"名字"找，还是按"位置"找？', a:[
    {c:'按名字找，或要去重', to:{go:'py.list_dict', note:'dict/set 查找 O(1)，list 查找 O(n)；键必须可哈希'}},
    {c:'按位置取一段', to:{go:'py.slice', note:'a[start:stop:step] 不含 stop；a[::−1] 反转，切片是浅拷贝'}},
    {c:'装的是文本', to:{go:'py.string', note:'str 不可变；拼接用 join，格式化用 f-string'}}]}},
  {c:'能跑但结果不对', to:{q:'是"改一个变量另一个也变"，还是循环里出的错？', a:[
    {c:'改一个另一个也跟着变', to:{go:'py.mutable', note:'list/dict 传的是引用；默认参数别写 []；要独立就 copy/deepcopy'}},
    {c:'循环里逻辑不对', to:{go:'py.loop_comprehension', note:'能写成一行推导式说明逻辑纯；边遍历边改同一个列表必错'}}]}},
  {c:'直接报错，看不懂', to:{q:'有没有 traceback？', a:[
    {c:'有', to:{go:'py.debug', note:'从最后一行往上读：先看异常类型，再看自己的那一行'}},
    {c:'没报错但结果诡异', to:{go:'py.debug', note:'打印变量的 type 和 shape，而不是打印值'}}]}},
  {c:'想把逻辑拆开或复用', to:{q:'是一段操作，还是一堆状态要绑在一起？', a:[
    {c:'一段可复用的操作', to:{go:'py.function', note:'一个函数只做一件事；别偷偷改外部状态'}},
    {c:'状态和操作要打包', to:{go:'py.class', note:'__init__ 定状态，self 指这一个实例；数据类优先'}},
    {c:'问题能拆成同形状的小问题', to:{go:'py.recursion', note:'先写终止条件，再写"缩小一步"；默认深度上限 1000'}}]}},
  {c:'数据一大就变慢', to:{q:'慢在查找还是慢在拼接？', a:[
    {c:'反复在 list 里 in 查找', to:{go:'py.bigo', note:'list 的 in 是 O(n)，换 set 变 O(1)'}},
    {c:'循环里 += 拼字符串或列表', to:{go:'py.bigo', note:'字符串 += 是 O(n²)，改成收集后一次 join'}}]}}]}},

np:{ name:'NumPy', en:'NumPy', page:'code',
 root:{q:'你想干什么？', a:[
  {c:'造数组、改形状', to:{q:'是改形状，还是要造随机数？', a:[
    {c:'改形状/转置', to:{go:'np.reshape', note:'reshape 只换视图不复制；−1 让它自己算；转置只改 stride'}},
    {c:'造随机数据', to:{go:'np.random', note:'用 rng=np.random.default_rng(0)，可复现且不污染全局'}},
    {c:'先搞清 shape 到底是什么', to:{go:'np.array_shape', note:'shape 从外往里数；ndim=括号层数'}}]}},
  {c:'报错了或结果形状不对', to:{q:'报的是形状不匹配吗？', a:[
    {c:'两个不同形状的数组想一起逐元素算', to:{go:'np.broadcast', note:'从右往左对齐，每维要么相等要么是 1'}},
    {c:'矩阵乘法维度对不上', to:{go:'np.dot', note:'(m,n)@(n,p)=(m,p)；一维数组会被自动当行或列'}},
    {c:'不是形状问题，是数值变成负数或 nan', to:{go:'np.overflow', note:'int32 会绕回；先 astype(np.float64) 再算'}}]}},
  {c:'想筛出一部分', to:{q:'按条件筛还是按下标取？', a:[
    {c:'按条件', to:{go:'np.mask', note:'a[a>0]；多条件用 & |，每段都要加括号'}},
    {c:'按一组下标', to:{go:'np.mask', note:'花式索引 a[[0,2,5]] 会复制，切片不会'}}]}},
  {c:'求和求均值，不知道 axis 填几', to:{q:'你想压掉哪一维？', a:[
    {c:'压掉行（每列一个数）', to:{go:'np.axis', note:'axis=0 压掉第 0 维，结果形状去掉这一维'}},
    {c:'压掉后还要广播回去', to:{go:'np.axis', note:'加 keepdims=True 保住维度，标准化时必用'}}]}},
  {c:'太慢，里面全是 for', to:{q:'能不能整块一起算？', a:[
    {c:'能，逐元素运算', to:{go:'np.vectorize', note:'把逐元素循环换成整数组运算，通常快 10-100 倍'}},
    {c:'是线代运算', to:{go:'np.linalg', note:'解方程用 solve 不要 inv；eig/svd/norm 注意返回值顺序'}}]}}]}},

vz:{ name:'可视化', en:'Visualization', page:'code',
 root:{q:'你想让人一眼看出什么？', a:[
  {c:'两个变量之间有没有关系', to:{q:'点多不多？', a:[
    {c:'点不多', to:{go:'vz.scatter', note:'先看趋势和离群点；重叠就调 alpha 或改点径'}},
    {c:'点太多糊成一团', to:{go:'vz.hist', note:'改成二维直方或 hexbin，用密度代替单点'}}]}},
  {c:'一个量随另一个连续变化', to:{q:'跨了几个数量级？', a:[
    {c:'一两个数量级以内', to:{go:'vz.line', note:'折线只用于有序 x；点少就把 marker 显示出来'}},
    {c:'跨好几个数量级', to:{go:'vz.log_axis', note:'log y 让指数变直线；log-log 让幂律变直线，斜率就是指数'}}]}},
  {c:'一堆数的分布长什么样', to:{q:'关心形状还是关心尾巴？', a:[
    {c:'形状', to:{go:'vz.hist', note:'bin 数从 √n 起调：太少丢细节，太多全是噪声'}},
    {c:'长尾/偏态', to:{go:'vz.log_axis', note:'先对 x 取 log 再画直方，偏态往往变对称'}}]}},
  {c:'平面上每个点都有一个值', to:{q:'看整体格局，还是看等值边界？', a:[
    {c:'整体格局', to:{go:'vz.heatmap', note:'矩阵直接 imshow；行列先排序才看得出结构'}},
    {c:'等值线、地形', to:{go:'vz.contour', note:'等高线=水平切面；梯度永远垂直于等高线'}},
    {c:'想看起伏的曲面', to:{go:'vz.3d', note:'3D 视角会骗人，优先用等高线加颜色代替'}}]}},
  {c:'图能画出来但很难读', to:{q:'问题在颜色，还是在排版？', a:[
    {c:'颜色', to:{go:'vz.color', note:'顺序数据用 viridis；有正负用发散色并让 0 居中；别用 jet'}},
    {c:'一张图挤了太多东西', to:{go:'vz.subplot', note:'分面：所有子图共用坐标范围，一次只变一个条件'}},
    {c:'看不出重点在哪', to:{go:'vz.annotate', note:'标出关键点和单位，删掉多余边框网格'}}]}}]}},

da:{ name:'数据', en:'Data Wrangling', page:'code',
 root:{q:'数据处在哪个阶段？', a:[
  {c:'刚拿到，又脏又乱', to:{q:'问题在缺失/异常，还是在表的结构？', a:[
    {c:'缺失值、异常值', to:{go:'da.clean', note:'先统计缺失比例再决定删还是填；填值只能用训练集的统计量'}},
    {c:'一行不是一个观测，列名里藏着变量', to:{go:'da.tidy', note:'长表=一行一观测一变量值；melt 变长，pivot 变宽'}},
    {c:'先想搞清 DataFrame 是什么', to:{go:'da.dataframe', note:'带标签的二维数组；index 是身份不是位置'}}]}},
  {c:'要把信息合起来或汇总', to:{q:'是纵向汇总还是横向拼表？', a:[
    {c:'按组汇总成一个数', to:{go:'da.groupby', note:'split-apply-combine；agg 出多指标，transform 保持原形状'}},
    {c:'两张表拼在一起', to:{go:'da.merge', note:'先确认连接键唯一，否则行数会爆；how 决定谁被保留'}},
    {c:'要逐行做个自定义操作', to:{go:'da.apply', note:'apply 就是伪装的循环，能向量化就别用'}}]}},
  {c:'要送进模型了', to:{q:'划分做了吗？', a:[
    {c:'还没划分', to:{go:'da.split', note:'先划分再做任何统计；时间序列必须按时间切，不能随机切'}},
    {c:'划了，要缩放特征', to:{go:'da.normalize', note:'用训练集的 μ、σ 去变换验证测试集；树模型不需要缩放'}},
    {c:'想把预处理步骤固定住', to:{go:'da.pipeline', note:'Pipeline 把预处理和模型绑一起，交叉验证才不会泄漏'}}]}},
  {c:'模型好得不真实', to:{q:'先查哪一类泄漏？', a:[
    {c:'统计量用了全量数据', to:{go:'da.leak', note:'标准化、填充、特征选择只能在训练折内做'}},
    {c:'同一个体或未来信息跨进了测试集', to:{go:'da.leak', note:'按个体分组划分；任何"事后才知道"的特征都要删'}}]}}]}},

ml:{ name:'机器学习', en:'Machine Learning', page:'code',
 root:{q:'有没有标签（标准答案）？', a:[
  {c:'有标签', to:{q:'要预测的是一个数还是一个类别？', a:[
    {c:'一个数（连续）', to:{q:'关系大概是直线吗？', a:[
      {c:'是，或者想要可解释的系数', to:{go:'ml.linear_reg', note:'ŷ=Xw，闭式解 w=(XᵀX)⁻¹Xᵀy；共线就上岭回归'}},
      {c:'不是，表格数据里全是非线性和交互', to:{go:'ml.xgboost', note:'每棵新树去学上一棵的残差；表格数据的默认首选'}}]}},
    {c:'一个类别', to:{q:'你更想要什么？', a:[
      {c:'要概率，还要能读系数', to:{go:'ml.logistic', note:'p=σ(wᵀx)；系数是 log-odds 不是概率'}},
      {c:'样本少维度高，只要一条好边界', to:{go:'ml.svm', note:'最大化间隔；核函数把线性不可分抬到高维'}},
      {c:'要能画给人看的规则', to:{go:'ml.tree', note:'每次按一个特征切一刀，看纯度增益；单棵树一定过拟合'}},
      {c:'树不稳，想更稳更准', to:{go:'ml.forest', note:'很多棵去相关的树投票，降方差；顺带给特征重要性'}},
      {c:'特征是词频，维度极高', to:{go:'ml.naive_bayes', note:'假设特征条件独立；文本任务的又快又不弱的基线'}},
      {c:'先要个不训练的基线', to:{go:'ml.knn', note:'最近 k 个邻居投票；必须先标准化，维度一高就失效'}}]}}]}},
  {c:'没有标签', to:{q:'要分组，还是要降维？', a:[
    {c:'分组', to:{go:'ml.kmeans', note:'要预先定 k，只找球形簇；先标准化，用肘部或轮廓系数选 k'}},
    {c:'降维、去冗余', to:{go:'ml.pca', note:'找方差最大的正交方向=协方差矩阵的特征向量；看累计解释方差'}}]}},
  {c:'模型训完了，或者根本训不动', to:{q:'是评价的问题，还是优化过程的问题？', a:[
    {c:'不知道好不好', to:{go:'ml.metrics', note:'类别不平衡别看 accuracy；看 PR 曲线、AUC，按代价定阈值'}},
    {c:'loss 不降或来回震荡', to:{go:'ml.gradient_descent', note:'w←w−η∇L；震荡就降 η，太慢就升 η 或换 Adam'}}]}}]}},

dl:{ name:'深度学习', en:'Deep Learning', page:'code',
 root:{q:'输入数据长什么样？', a:[
  {c:'图像 / 网格数据', to:{q:'要输出一个标签，还是一张同样大的图？', a:[
    {c:'一个标签，网络一深就训不动', to:{go:'dl.resnet', note:'加恒等捷径 y=F(x)+x，梯度有直通路，才能上百层'}},
    {c:'一个标签，普通深度', to:{go:'dl.cnn', note:'卷积=局部连接+权重共享；感受野随层数叠加'}},
    {c:'要逐像素输出（分割）', to:{go:'dl.unet', note:'编码降采样抓语义，解码升采样恢复位置，skip 补回细节'}}]}},
  {c:'序列 / 文本', to:{q:'长程依赖重要吗？', a:[
    {c:'很重要，而且想并行训练', to:{q:'你要理解的是一个机制还是整套架构？', a:[
      {c:'机制', to:{go:'dl.attention', note:'softmax(QKᵀ/√d)V；每个位置自己决定该看谁'}},
      {c:'整套架构', to:{go:'dl.transformer', note:'自注意力+FFN+残差+LayerNorm；位置信息靠 positional encoding'}}]}},
    {c:'序列短，或必须逐步在线处理', to:{go:'dl.rnn', note:'状态一步步传；长程会梯度消失，LSTM 用门缓解'}}]}},
  {c:'表格 / 普通向量', to:{q:'样本量大吗？', a:[
    {c:'大', to:{go:'dl.mlp', note:'全连接堆层，万能逼近；宽度先于深度调'}},
    {c:'不大', to:{go:'dl.mlp', note:'表格上样本效率低，通常打不过 XGBoost，先拿它当上限参考'}}]}},
  {c:'要生成新样本', to:{q:'要可控的隐空间，还是要逼真？', a:[
    {c:'要能插值的隐空间', to:{go:'dl.vae', note:'重构损失+KL；重参数化技巧才能反传随机采样'}},
    {c:'逼真优先', to:{go:'dl.gan', note:'判别器与生成器对抗；训练不稳，警惕模式崩塌'}}]}},
  {c:'网络搭好了但训练有问题', to:{q:'问题出在哪一层？', a:[
    {c:'输出层 / 目标定义不对', to:{go:'dl.loss', note:'分类用交叉熵且直接吃 logits；回归用 MSE 或 Huber'}},
    {c:'中间层梯度死了', to:{go:'dl.activation', note:'默认 ReLU；死了换 LeakyReLU/GELU；sigmoid 只放输出层'}},
    {c:'根本不知道梯度是怎么来的', to:{go:'dl.backprop', note:'前向存中间值，反向逐层乘局部导数；本质就是链式法则'}}]}}]}},

bm:{ name:'生物医学应用', en:'Biomedical Applications', page:'code',
 root:{q:'你的数据是什么类型？', a:[
  {c:'分子序列（DNA / 蛋白）', to:{q:'用不用预训练模型的表示？', a:[
    {c:'用', to:{go:'bm.protein_embed', note:'蛋白语言模型的向量当特征，下游接个小模型就够'}},
    {c:'自己编码', to:{go:'bm.sequence', note:'one-hot 或 k-mer；长度不齐要 padding 并配 mask'}}]}},
  {c:'图像（显微、病理、影像）', to:{q:'要每个像素的类别，还是整张图一个结论？', a:[
    {c:'每个像素', to:{go:'bm.image_seg', note:'U-Net + Dice loss；评价用 Dice/IoU，别用像素准确率'}},
    {c:'整张图一个结论，而且样本少', to:{go:'bm.small_n', note:'迁移学习冻结骨干；按患者划分，绝不能按图划分'}}]}},
  {c:'细胞层面的测量', to:{q:'是流式的几个通道，还是单细胞的上万基因？', a:[
    {c:'流式几个通道', to:{go:'bm.flow_gating', note:'先补偿再 gating；门的顺序决定结论，永远画双参数图'}},
    {c:'单细胞高维', to:{go:'bm.cell_cluster', note:'PCA→近邻图→Leiden；UMAP 只用来看，不用来定簇'}},
    {c:'不同批次的结果对不上', to:{go:'bm.batch_effect', note:'先看 PCA 是不是按批次分开；批次绝不能和实验分组混同'}}]}},
  {c:'剂量或时间相关的实验', to:{q:'看的是浓度-效应、浓度-时间，还是事件何时发生？', a:[
    {c:'浓度-效应', to:{go:'bm.dose_response', note:'四参数 logistic 拟 IC50；x 取 log，两端必须有平台'}},
    {c:'体内浓度随时间变', to:{go:'bm.pk_ode', note:'一室模型 dC/dt=−kC；半衰期 ln2/k，AUC 代表总暴露'}},
    {c:'事件什么时候发生', to:{go:'bm.survival', note:'Kaplan-Meier + log-rank；删失样本不能当缺失丢掉'}}]}},
  {c:'样本量很小，结果好得可疑', to:{q:'先查划分还是查评估？', a:[
    {c:'划分', to:{go:'bm.small_n', note:'按个体/患者分组划分，同一个体不能跨训练和测试'}},
    {c:'评估', to:{go:'bm.small_n', note:'用嵌套交叉验证并报重复多次的方差；n<30 别信单次 hold-out'}}]}}]}}

});
