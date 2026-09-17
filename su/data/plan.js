// 数理宇宙 · 12 周训练计划（CONTRACT2.md 第 5 节）
// 每周 6 天，第 7 天不排：复盘 + 补做 + 到期秒答。
// 每天 = drill 秒答（提取）+ read 读一小节（元学习）+ build 跑一段真实代码（直接）。
// 顺序：元学习 → 数感代数 → 几何 → 线代 → 微积分 → 概率统计 → 组合离散 → Python/NumPy → 数据可视化 → ML/DL → BME → 整合。
// 每周至少一天「走桥」：同一个概念的数学版 + 代码版一起做。
window.PLAN = {
weeks:[

/* ========== W1 元学习：先看地图，不学内容 ========== */
{w:1, theme:'开机：先看地图', goal:'合上电脑能默画两张星图 15 个大陆，说出每块管什么、彼此怎么连',
 days:[
  {d:1, why:'先把跑代码的门打开', drill:['py.list_dict','py.debug'],
   read:[{b:1,c:3,s:'3.1'}], build:'跑通 Bk1_Ch3_01.ipynb，确认 JupyterLab 能出图', min:35},
  {d:2, why:'数是一切的地基', drill:['ns.magnitude','ns.estimate'],
   read:[{b:3,c:1,s:'1.1'}], build:'跑通 Bk3_Ch1_01.py，把 pi 换成 e 再跑一遍', min:35},
  {d:3, why:'向量是两页共用的词', drill:['ge.vector','la.matmul_shape'],
   read:[{b:4,c:1,s:'1.1'}], build:'跑 Streamlit_Bk4_Ch1_01.py，拖滑杆看向量转向', min:40},
  {d:4, why:'先认识数据长什么样', drill:['pr.expectation','ns.average_trap'],
   read:[{b:5,c:2,s:'2.1'}], build:'跑 Bk5_Ch02_01.py，换一组自己编的数看均值中位数分开', min:35},
  {d:5, why:'提前看一眼终点', drill:['ml.linear_reg','ml.metrics'],
   read:[{b:7,c:2,s:'2.1'}], build:'跑 Bk7_Ch02_01.ipynb，只改样本量看拟合线抖动', min:40},
  {d:6, why:'第一次走桥：对数尺度', drill:['ns.log_scale','vz.log_axis','al.exp_log'],
   read:[{b:2,c:8,s:'8.1'}], build:'跑 BK_2_Ch08_01.ipynb，把 y 轴改成 log 看直线化', min:45}
 ]},

/* ========== W2 数感：心算反射 ========== */
{w:2, theme:'数感开机', goal:'任意两位数平方 3 秒内报出；a^b 与 c^d 5 秒内用 ln 判大小',
 days:[
  {d:1, why:'指数吃一切，先建量级感', drill:['ns.max_digits','ns.magnitude','ns.log_scale'],
   read:[{b:3,c:1,s:'1.5'}], build:'跑 Bk3_Ch1_02.py，打印 2^31 与 3^21 的 log10 对比', min:40},
  {d:2, why:'乘法是心算的主干', drill:['ns.mental_mult','ns.square_trick'],
   read:[{b:3,c:2,s:'2.1'}], build:'跑 Bk3_Ch2_01.py，写个循环验证平方速算公式', min:35},
  {d:3, why:'拆数比硬算快十倍', drill:['ns.divisibility','ns.factor'],
   read:[{b:3,c:2,s:'2.3'}], build:'跑 Bk3_Ch2_02.py，加一段试除法打印因数', min:35},
  {d:4, why:'百分比是实验里的日常', drill:['ns.percent','ns.estimate','ns.average_trap'],
   read:[{b:5,c:2,s:'2.2'}], build:'再跑 Bk5_Ch02_01.py，塞一个离群值看均值被拉走', min:40},
  {d:5, why:'凑数练的是拆解肌肉', drill:['ns.make24','ns.abacus'],
   read:[{b:3,c:2,s:'2.5'}], build:'跑 Bk3_Ch2_03.py，改成穷举四个数的 24 点解', min:45},
  {d:6, why:'走桥：数量级到 dtype 溢出', drill:['ns.log_scale','np.overflow'],
   read:[{b:1,c:15,s:'15.1'}], build:'跑 Bk1_Ch15_01.ipynb，用 int8 故意溢出一次看回绕', min:40}
 ]},

/* ========== W3 代数：把结构看出来 ========== */
{w:3, theme:'代数：认脸不硬算', goal:'看到任意式子 5 秒内说出它属于哪类函数、图长什么样、有几个根',
 days:[
  {d:1, why:'先认函数的脸', drill:['al.function_zoo','al.exp_log'],
   read:[{b:3,c:10,s:'10.1'}], build:'跑 Bk3_Ch10_01.py，一张图叠画幂/指数/对数三条线', min:40},
  {d:2, why:'二次是所有优化的原型', drill:['al.quadratic','al.vieta'],
   read:[{b:3,c:11,s:'11.1'}], build:'跑 Bk3_Ch11_01.py，改系数看顶点和根一起动', min:40},
  {d:3, why:'换元把难题变成见过的题', drill:['al.polynomial','al.substitution'],
   read:[{b:3,c:11,s:'11.3'}], build:'跑 Bk3_Ch11_02.py，加一条高次曲线看拐点个数', min:40},
  {d:4, why:'不等式是估上界的工具', drill:['al.inequality_amgm','al.abs_ineq'],
   read:[{b:3,c:4,s:'4.3'}], build:'跑 Bk3_Ch4_02.py，用随机数验证均值不等式恒成立', min:40},
  {d:5, why:'方程组是线代的入口', drill:['al.system_eq','al.sequence','al.doubling'],
   read:[{b:3,c:23,s:'23.1'}], build:'跑 Bk3_Ch23_1.py，把鸡兔换成三种动物看方程变形', min:45},
  {d:6, why:'走桥：对数的坑在坐标轴上现形', drill:['al.log_trap','al.exp_log','vz.log_axis'],
   read:[{b:3,c:12,s:'12.1'}], build:'跑 Bk3_Ch12_01.py，把横轴改 log 看指数变直线', min:45}
 ]},

/* ========== W4 几何：三把尺 ========== */
{w:4, theme:'几何：距离角度面积', goal:'给任意两点/两向量，5 秒内写出距离、夹角余弦、围成面积的式子',
 days:[
  {d:1, why:'距离是所有相似度的祖宗', drill:['ge.distance','ge.pythagoras'],
   read:[{b:3,c:7,s:'7.1'}], build:'跑 Bk3_Ch7_01.py，加一条曼哈顿距离对比欧氏', min:35},
  {d:2, why:'点积就是投影长度', drill:['ge.vector','ge.dot_projection'],
   read:[{b:3,c:22,s:'22.1'}], build:'跑 Bk3_Ch22_1.py，画出一个向量在另一个上的投影', min:40},
  {d:3, why:'单位圆是三角函数的定义', drill:['al.trig','ge.unit_circle'],
   read:[{b:3,c:3,s:'3.3'}], build:'跑 Bk3_Ch3_03.py，让角度动起来看 sin/cos 同时扫', min:40},
  {d:4, why:'圆锥曲线=二次型的图像', drill:['ge.conic','ge.normal_line'],
   read:[{b:3,c:8,s:'8.1'}], build:'跑 Bk3_Ch8_01.py，改离心率看圆椭抛双四态切换', min:40},
  {d:5, why:'叉积一步得面积和法向', drill:['ge.area_cross','ge.similar','ge.inscribed_angle'],
   read:[{b:3,c:3,s:'3.1'}], build:'跑 Bk3_Ch3_01.py，用叉积算三角形面积并对答案', min:40},
  {d:6, why:'走桥：变换在三维里看得见', drill:['ge.transform','ge.polar','vz.3d'],
   read:[{b:2,c:26,s:'26.1'}], build:'跑 Bk_2_Ch26_01.ipynb，把旋转矩阵角度调成 30/60/90 对比', min:45}
 ]},

/* ========== W5 线代：矩阵是变换 ========== */
{w:5, theme:'线代：列告诉你基去了哪', goal:'给任意两个矩阵形状 3 秒内说能不能乘、结果 shape；看到矩阵能说出它在压缩还是旋转',
 days:[
  {d:1, why:'先把矩阵当动作看', drill:['la.matrix_transform','la.matmul_shape'],
   read:[{b:4,c:4,s:'4.1'}], build:'跑 Bk4_Ch4_01.py，把单位方格喂进矩阵看被拉成什么', min:40},
  {d:2, why:'秩=真正剩下几维', drill:['la.basis','la.rank','la.null_space'],
   read:[{b:4,c:7,s:'7.1'}], build:'跑 Streamlit_Bk4_Ch7_01.py，造一个秩亏矩阵看零空间不为零', min:45},
  {d:3, why:'行列式=面积缩放倍数', drill:['la.determinant','la.inverse'],
   read:[{b:4,c:5,s:'5.3'}], build:'跑 Bk4_Ch5_01.py，让行列式为 0 看逆矩阵报错', min:40},
  {d:4, why:'投影是最小二乘的几何', drill:['la.projection','la.orthogonal'],
   read:[{b:4,c:9,s:'9.1'}], build:'跑 Bk4_Ch9_01.py，验证残差向量与列空间正交', min:40},
  {d:5, why:'特征向量=不转只缩的方向', drill:['la.eigen','la.matrix_transform'],
   read:[{b:4,c:13,s:'13.1'}], build:'跑 Bk4_Ch13_01.py，画出特征向量方向不被矩阵掰弯', min:45},
  {d:6, why:'走桥：SVD 在 NumPy 里三行', drill:['la.svd','la.least_squares','np.linalg'],
   read:[{b:4,c:15,s:'15.1'}], build:'跑 Bk4_Ch15_01.py，只留前 k 个奇异值看重建误差', min:50}
 ]},

/* ========== W6 微积分：变化率与累加 ========== */
{w:6, theme:'微积分：斜率与面积', goal:'给任意多元函数 5 秒内写出梯度，并指出下降最快的方向',
 days:[
  {d:1, why:'导数就是放大后的直线', drill:['ca.limit','ca.derivative_slope'],
   read:[{b:3,c:15,s:'15.1'}], build:'跑 Bk3_Ch15_01.py，把 h 一路缩小看割线收敛成切线', min:40},
  {d:2, why:'链式法则是反向传播的心脏', drill:['ca.product_quotient','ca.chain_rule'],
   read:[{b:3,c:15,s:'15.3'}], build:'跑 Bk3_Ch15_02.py，手推一个复合函数导数并与数值导数对齐', min:45},
  {d:3, why:'泰勒=用多项式冒充一切', drill:['ca.taylor','ca.log_trick'],
   read:[{b:3,c:17,s:'17.1'}], build:'跑 Bk3_Ch17_01.py，把展开阶数从 1 加到 7 看逼近', min:45},
  {d:4, why:'积分只是把条形加起来', drill:['ca.integral_area','ca.integration_tricks'],
   read:[{b:3,c:18,s:'18.1'}], build:'跑 Bk3_Ch18_01.py，加细分段数看黎曼和收敛', min:40},
  {d:5, why:'Hessian 决定是谷还是鞍', drill:['ca.partial_hessian','ca.gradient'],
   read:[{b:4,c:17,s:'17.1'}], build:'跑 Bk4_Ch17_01.py，在鞍点处打印 Hessian 特征值符号', min:45},
  {d:6, why:'走桥：求极值就是梯度下降', drill:['ca.optimization','ca.lagrange','ml.gradient_descent'],
   read:[{b:3,c:19,s:'19.1'}], build:'跑 Bk3_Ch19_01.py，把学习率调到发散再调回来', min:50}
 ]},

/* ========== W7 概率统计：从不确定里提取信号 ========== */
{w:7, theme:'概率统计：认出分布', goal:'看到一句话题面 5 秒内说出用哪个分布、参数是什么、期望方差多少',
 days:[
  {d:1, why:'期望方差是分布的两把尺', drill:['pr.expectation','pr.variance'],
   read:[{b:5,c:4,s:'4.1'}], build:'跑 Bk5_Ch04_01.py，用大样本模拟核对理论期望', min:40},
  {d:2, why:'先把离散分布家族认全', drill:['pr.distribution','pr.binomial_poisson'],
   read:[{b:5,c:5,s:'5.1'}], build:'跑 Bk5_Ch05_01.py，让 n 大 p 小看二项趋近泊松', min:40},
  {d:3, why:'正态是加法的终点', drill:['pr.gaussian','pr.clt'],
   read:[{b:5,c:9,s:'9.1'}], build:'跑 Bk5_Ch09_01.py，把均匀分布抽样求和看它变正态', min:45},
  {d:4, why:'贝叶斯是证据更新信念', drill:['pr.conditional','pr.bayes'],
   read:[{b:5,c:8,s:'8.1'}], build:'跑 Bk5_Ch08_01.py，把患病率调到 0.1% 看假阳性淹没真阳性', min:45},
  {d:5, why:'MLE 是所有拟合的通用语', drill:['pr.mle','pr.hypothesis','pr.map_prior'],
   read:[{b:5,c:16,s:'16.1'}], build:'跑 Bk5_Ch16_01.py，画出似然函数并标出峰值位置', min:50},
  {d:6, why:'走桥：协方差矩阵就是一次点积', drill:['pr.covariance','pr.entropy','np.dot'],
   read:[{b:5,c:13,s:'13.1'}], build:'跑 Bk5_Ch13_01.py，用中心化矩阵手算协方差再和库对答案', min:50}
 ]},

/* ========== W8 组合离散：会数会判 ========== */
{w:8, theme:'组合与离散：数得清判得准', goal:'任意计数题 5 秒内判出「有序否/可重否/正难则反否」，写出式子不列举',
 days:[
  {d:1, why:'先定有序还是无序', drill:['co.multiplication_rule','co.perm_comb','co.circular_repeat','di.crt'],
   read:[{b:5,c:3,s:'3.1'}], build:'跑 Bk5_Ch03_01.py，用枚举验证一个排列数公式', min:40},
  {d:2, why:'隔板法覆盖一半计数题', drill:['co.binomial','co.stars_bars','co.bijection'],
   read:[{b:5,c:3,s:'3.7'}], build:'跑 Bk5_Ch03_02.py，改成隔板法场景并对答案', min:40},
  {d:3, why:'正难则反能省一半力', drill:['co.pigeonhole','co.complement','co.inclusion_exclusion','di.set_function'],
   read:[{b:3,c:20,s:'20.1'}], build:'跑 Bk3_Ch20_1.py，用补集算「至少一个」的概率', min:40},
  {d:4, why:'递推把大问题降一层', drill:['co.recursion','co.catalan','co.generating','di.fermat_fastpow'],
   read:[{b:3,c:14,s:'14.1'}], build:'跑 Bk3_Ch14_01.py，加一段斐波那契看增长率趋近黄金比', min:45},
  {d:5, why:'模运算是密码与哈希底座', drill:['di.modular','di.prime','di.gcd','di.divisibility'],
   read:[{b:3,c:1,s:'1.6'}], build:'跑 Bk3_Ch1_03.py，加辗转相除法打印 gcd 过程', min:45},
  {d:6, why:'走桥：大 O 在计时器上现形', drill:['di.big_o','di.bits','di.base_convert','py.bigo'],
   read:[{b:1,c:6,s:'6.1'}], build:'跑 Bk1_Ch06_01.ipynb，对比 O(n) 与 O(n^2) 的实测耗时', min:45}
 ]},

/* ========== W9 Python + NumPy：把手变快 ========== */
{w:9, theme:'Python 与 NumPy：手要快', goal:'任意数组操作先说出结果 shape 再运行，10 次里对 9 次；不写显式 for 循环',
 days:[
  {d:1, why:'容器选错后面全慢', drill:['py.list_dict','py.slice','py.mutable'],
   read:[{b:1,c:5,s:'5.1'}], build:'跑 Bk1_Ch05_01.ipynb，做一次浅拷贝踩坑再修好', min:35},
  {d:2, why:'推导式是 Python 的口音', drill:['py.loop_comprehension','py.function','py.string'],
   read:[{b:1,c:7,s:'7.1'}], build:'跑 Bk1_Ch07_01.ipynb，把一个 for 循环改写成推导式', min:40},
  {d:3, why:'类是把状态包起来', drill:['py.class','py.recursion','py.debug'],
   read:[{b:1,c:9,s:'9.1'}], build:'跑 Bk1_Ch09_01.ipynb，故意制造一个报错并读完整 traceback', min:40},
  {d:4, why:'shape 是 NumPy 的语法', drill:['np.array_shape','np.reshape','np.axis'],
   read:[{b:1,c:13,s:'13.1'}], build:'跑 Bk1_Ch13_01.ipynb，对同一数组分别按 axis=0/1 求和', min:40},
  {d:5, why:'广播省掉九成循环', drill:['np.broadcast','np.mask','np.vectorize'],
   read:[{b:1,c:14,s:'14.1'}], build:'跑 Bk1_Ch14_01.ipynb，用布尔掩码取出所有大于均值的元素', min:40},
  {d:6, why:'走桥：矩阵形状规则落到代码', drill:['np.dot','np.linalg','np.random','la.matmul_shape'],
   read:[{b:1,c:17,s:'17.1'}], build:'跑 Bk1_Ch17_01.ipynb，故意乘错形状读一次报错信息', min:45}
 ]},

/* ========== W10 数据与可视化：看得见才算懂 ========== */
{w:10, theme:'数据与可视化', goal:'给一份陌生表 10 分钟出三张图（分布/关系/分组），并说得出哪一步会漏数据',
 days:[
  {d:1, why:'散点看关系，线看趋势', drill:['vz.scatter','vz.line','vz.annotate'],
   read:[{b:2,c:7,s:'7.3'}], build:'跑 BK_2_Ch07_01.ipynb，给最离群的点加一条标注', min:40},
  {d:2, why:'先看分布再看模型', drill:['vz.hist','vz.color','vz.subplot'],
   read:[{b:2,c:11,s:'11.3'}], build:'跑 BK_2_Ch11_01.ipynb，换成发散型 colormap 看零点居中', min:40},
  {d:3, why:'走桥：梯度垂直于等高线', drill:['ca.gradient','vz.heatmap','vz.contour','vz.3d'],
   read:[{b:2,c:10,s:'10.1'}], build:'跑 BK_2_Ch10_01.ipynb，把等高线和三维曲面并排画', min:45},
  {d:4, why:'DataFrame 是带标签的矩阵', drill:['da.dataframe','da.groupby','da.merge'],
   read:[{b:1,c:19,s:'19.1'}], build:'跑 Bk1_Ch19_01.ipynb，做一次 groupby 聚合再 merge 回原表', min:45},
  {d:5, why:'缺失值处理决定结论', drill:['da.clean','da.tidy','da.apply'],
   read:[{b:6,c:2,s:'2.1'}], build:'跑 Bk6_Ch02_01.ipynb，对比删除行与均值填补的结果差异', min:45},
  {d:6, why:'走桥：标准化放错位置就是泄漏', drill:['da.normalize','da.split','da.leak','da.pipeline'],
   read:[{b:6,c:4,s:'4.1'}], build:'跑 Bk6_Ch04_01.ipynb，先全量标准化再划分，看指标虚高', min:50}
 ]},

/* ========== W11 机器学习 + 深度学习 ========== */
{w:11, theme:'ML 与 DL：模型是假设', goal:'给任意 conv 参数 5 秒内报出输出尺寸；给任意任务 30 秒内选出模型并说出它的归纳偏置',
 days:[
  {d:1, why:'线性模型是所有模型的原点', drill:['ml.linear_reg','ml.logistic','ml.metrics'],
   read:[{b:7,c:3,s:'3.1'}], build:'跑 Bk7_Ch03_01.ipynb，加一个共线特征看系数爆炸', min:45},
  {d:2, why:'先分清距离派和概率派', drill:['ml.knn','ml.naive_bayes','ml.svm'],
   read:[{b:7,c:8,s:'8.1'}], build:'跑 Bk7_Ch08_01.ipynb，把 k 从 1 调到 50 看决策边界变平滑', min:45},
  {d:3, why:'树是可解释的主力', drill:['ml.tree','ml.forest','ml.xgboost'],
   read:[{b:7,c:13,s:'13.1'}], build:'跑 Bk7_Ch13_01.ipynb，限制树深看过拟合被压下去', min:45},
  {d:4, why:'无监督先降维再聚类', drill:['ml.kmeans','ml.pca'],
   read:[{b:7,c:20,s:'20.1'}], build:'跑 Bk7_Ch20_01.ipynb，换随机种子看聚类结果不稳定', min:45},
  {d:5, why:'反向传播只是链式法则', drill:['dl.mlp','dl.activation','dl.backprop','dl.loss'],
   read:[{b:7,c:12,s:'12.1'}], build:'跑 Bk7_Ch12_01.ipynb，把核函数换成 RBF 体会隐式升维', min:50},
  {d:6, why:'走桥：卷积就是分块矩阵乘', drill:['dl.cnn','dl.resnet','dl.unet','la.matmul_shape'],
   read:[{b:4,c:6,s:'6.1'}], build:'跑 Bk4_Ch6_01.py，手算一遍 conv 输出尺寸再用分块乘验证', min:50}
 ]},

/* ========== W12 BME 应用 + 整合复盘 ========== */
{w:12, theme:'BME 落地与整合', goal:'拿自己一份湿实验数据，独立走完清洗→建模→评价→图，并说出每步的坑在哪块牌子上',
 days:[
  {d:1, why:'序列数据先看时间结构', drill:['bm.sequence','bm.protein_embed','dl.rnn'],
   read:[{b:6,c:6,s:'6.1'}], build:'跑 Bk6_Ch6_01.ipynb，把时间索引重采样成周粒度', min:45},
  {d:2, why:'分割与注意力都是加权求和', drill:['bm.image_seg','dl.attention','dl.transformer'],
   read:[{b:7,c:15,s:'15.1'}], build:'跑 Bk7_Ch15_01.ipynb，用截断 SVD 压缩图像看信息保留比例', min:50},
  {d:3, why:'gating 本质是混合模型', drill:['bm.flow_gating','bm.cell_cluster','dl.vae'],
   read:[{b:7,c:21,s:'21.1'}], build:'跑 Bk7_Ch21_01.ipynb，把成分数从 2 调到 5 看 BIC 拐点', min:50},
  {d:4, why:'剂量反应就是非线性拟合', drill:['bm.dose_response','bm.pk_ode','ca.ode'],
   read:[{b:7,c:4,s:'4.1'}], build:'跑 Bk7_Ch04_01.ipynb，换成四参数 logistic 拟合并读出 EC50', min:50},
  {d:5, why:'小样本最容易骗自己', drill:['bm.survival','bm.batch_effect','bm.small_n','dl.gan'],
   read:[{b:6,c:8,s:'8.1'}], build:'跑 Bk6_Ch8_01.ipynb，用随机游走造假信号看它像不像趋势', min:50},
  {d:6, why:'收尾：图论把知识连成网', drill:['co.graph_count','di.graph','di.logic','di.induction'],
   read:[{b:6,c:11,s:'11.1'}], build:'跑 Bk6_Ch11_01.ipynb，把 12 周学过的大陆画成一张关系图', min:50}
 ]}

]};
