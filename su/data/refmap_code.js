/* 代码节点 -> 鸢尾花书章节 / 代码文件 / 英文书 的映射。
   b = 书号(1-7), c = 章号, f = 代码文件名(必须在 books.js 该章 codes 里),
   refs: k = refs.js 里的键, p = PDF 页码, t = 小节名。
   why 一句话: 去这儿看什么 / 跑什么。 */
window.REFMAP=window.REFMAP||{};
Object.assign(window.REFMAP,{

/* ---------- py: Python 基础 ---------- */
'py.list_dict':{
  books:[{b:1,c:5,why:'列表、字典的增删改查全在这章'}],
  codes:[{b:1,c:5,f:'Bk1_Ch05_11.ipynb',why:'跑增删改看列表按位置改'},
         {b:1,c:5,f:'Bk1_Ch05_16.ipynb',why:'跑字典按名字取值、加键、删键'}],
  refs:[]
},
'py.loop_comprehension':{
  books:[{b:1,c:7,why:'for/while/推导式一章讲完'}],
  codes:[{b:1,c:7,f:'Bk1_Ch07_18.ipynb',why:'推导式与嵌套推导式生成矩阵'},
         {b:1,c:7,f:'Bk1_Ch07_12.ipynb',why:'zip 同时遍历两个列表'}],
  refs:[]
},
'py.function':{
  books:[{b:1,c:8,why:'定义、参数、返回值、作用域'}],
  codes:[{b:1,c:8,f:'Bk1_Ch08_03.ipynb',why:'最小函数：输入进，return 出'},
         {b:1,c:8,f:'Bk1_Ch08_06.ipynb',why:'改局部变量看全局不变，体会不外泄'}],
  refs:[]
},
'py.recursion':{
  books:[{b:1,c:8,why:'阶乘、斐波那契递归写法'},{b:3,c:14,why:'数列视角看递推'}],
  codes:[{b:1,c:8,f:'Bk1_Ch08_21.ipynb',why:'阶乘递归，看 n==1 的停止条件'},
         {b:1,c:8,f:'Bk1_Ch08_22.ipynb',why:'斐波那契递归，改大 n 感受慢'}],
  refs:[]
},
'py.class':{
  books:[{b:1,c:9,why:'类、对象、self、继承'}],
  codes:[{b:1,c:9,f:'Bk1_Ch09_01.ipynb',why:'Rectangle 类：模板与实例'},
         {b:1,c:9,f:'Bk1_Ch09_07.ipynb',why:'Animal 继承，看子类复用父类'}],
  refs:[]
},
'py.bigo':{
  books:[{b:1,c:8,why:'手写三重循环矩阵乘法，数嵌套层'},{b:1,c:7,why:'循环写法与向量化对比'}],
  codes:[{b:1,c:8,f:'Bk1_Ch08_08.ipynb',why:'三层 for 矩阵乘 = n 的三次方'},
         {b:1,c:8,f:'Bk1_Ch08_22.ipynb',why:'递归斐波那契，n 加大看指数爆炸'}],
  refs:[]
},
'py.string':{
  books:[{b:1,c:5,why:'字符串拼接、切片、格式化'}],
  codes:[{b:1,c:5,f:'Bk1_Ch05_04.ipynb',why:'拼接、重复、切片字符串'},
         {b:1,c:5,f:'Bk1_Ch05_06.ipynb',why:'三种格式化写法对比'}],
  refs:[]
},
'py.debug':{
  books:[{b:1,c:7,why:'try/except 处理异常'},{b:1,c:8,why:'assert 与 raise 主动报错'}],
  codes:[{b:1,c:7,f:'Bk1_Ch07_06.ipynb',why:'除零异常，读报错最后一行'},
         {b:1,c:8,f:'Bk1_Ch08_10.ipynb',why:'assert 失败信息怎么写'}],
  refs:[]
},
'py.slice':{
  books:[{b:1,c:14,why:'索引切片专章，含步长与倒序'},{b:1,c:5,why:'列表切片与星号解包'}],
  codes:[{b:1,c:14,f:'Bk1_Ch14_01.ipynb',why:'跑切片小节：前三、后三、奇偶、倒序'},
         {b:1,c:5,f:'Bk1_Ch05_12.ipynb',why:'first, *rest 解包'}],
  refs:[]
},
'py.mutable':{
  books:[{b:1,c:5,why:'copy 与 deepcopy 区别'},{b:1,c:6,why:'b=a 与 a.copy() 对比'}],
  codes:[{b:1,c:5,f:'Bk1_Ch05_14.ipynb',why:'改 list2 看 list1 也变'},
         {b:1,c:5,f:'Bk1_Ch05_15.ipynb',why:'嵌套列表要 deepcopy'}],
  refs:[]
},

/* ---------- np: NumPy ---------- */
'np.array_shape':{
  books:[{b:1,c:13,why:'一维到三维数组怎么造、shape 怎么读'}],
  codes:[{b:1,c:13,f:'Bk1_Ch13_01.ipynb',why:'行向量列向量三维逐个看形状'},
         {b:1,c:13,f:'Bk1_Ch13_02.ipynb',why:'练习：两种办法造 3x4 数组'}],
  refs:[]
},
'np.broadcast':{
  books:[{b:1,c:15,why:'广播原则小节：标量、一维、二维相加'},{b:4,c:4,why:'矩阵与向量相加的线代解释'}],
  codes:[{b:1,c:15,f:'Bk1_Ch15_01.ipynb',why:'跑广播原则小节，列向量加行向量'},
         {b:4,c:4,f:'Bk4_Ch4_05.py',why:'矩阵加列向量看被拉伸'}],
  refs:[]
},
'np.dot':{
  books:[{b:1,c:17,why:'内积、矩阵乘法、格拉姆矩阵'},{b:4,c:2,why:'向量内积几何意义'},{b:4,c:4,why:'矩阵乘法与逐元素乘对比'}],
  codes:[{b:4,c:2,f:'Bk4_Ch2_06.py',why:'inner 与 a.T@b 两种写法'},
         {b:4,c:4,f:'Bk4_Ch4_06.py',why:'matmul 与 @ 看内维匹配'},
         {b:1,c:17,f:'Bk1_Ch17_01.ipynb',why:'鸢尾花矩阵乘法与格拉姆矩阵'}],
  refs:[{k:'ladr',p:86,t:'3.C Matrices',why:'矩阵乘法=线性映射复合'}]
},
'np.reshape':{
  books:[{b:1,c:16,why:'reshape、转置、扁平化专章'}],
  codes:[{b:1,c:16,f:'Bk1_Ch16_01.ipynb',why:'同一组数变各种形状看热图'}],
  refs:[]
},
'np.axis':{
  books:[{b:1,c:15,why:'统计函数小节沿轴求和求均值'},{b:1,c:16,why:'axis=0/1/2 堆叠方向'},{b:1,c:18,why:'einsum 把 axis 写成下标'}],
  codes:[{b:1,c:15,f:'Bk1_Ch15_01.ipynb',why:'改 axis 看结果形状'},
         {b:1,c:16,f:'Bk1_Ch16_02.ipynb',why:'stack 沿三个 axis 的差别'},
         {b:1,c:18,f:'Bk1_Ch18_01.ipynb',why:'einsum ij->j 就是压掉 i'}],
  refs:[]
},
'np.overflow':{
  books:[{b:1,c:5,why:'整数、浮点、复数类型与转换'},{b:1,c:13,why:'数组 dtype 怎么指定'}],
  codes:[{b:1,c:5,f:'Bk1_Ch05_02.ipynb',why:'int/float 转换看精度丢失'},
         {b:1,c:13,f:'Bk1_Ch13_01.ipynb',why:'造数组时加 dtype 试 uint8'}],
  refs:[]
},
'np.random':{
  books:[{b:1,c:13,why:'随机数小节：均匀、正态'},{b:5,c:15,why:'蒙特卡洛：seed 与样本量'},{b:5,c:16,why:'样本均值抖动随 n 变小'}],
  codes:[{b:5,c:15,f:'Bk5_Ch15_06.py',why:'随机路径，改 seed 看变化'},
         {b:5,c:16,f:'Bk5_Ch16_01.py',why:'骰子均值分布，改 n 看方差缩小'},
         {b:1,c:13,f:'Bk1_Ch13_01.ipynb',why:'跑随机数小节'}],
  refs:[]
},
'np.vectorize':{
  books:[{b:1,c:7,why:'循环点积 vs np.dot'},{b:1,c:15,why:'数组整体运算'}],
  codes:[{b:1,c:7,f:'Bk1_Ch07_10.ipynb',why:'for 循环算点积'},
         {b:1,c:7,f:'Bk1_Ch07_16.ipynb',why:'同一题 np.dot 一行，计时对比'},
         {b:1,c:15,f:'Bk1_Ch15_02.ipynb',why:'数学函数整数组一次算'}],
  refs:[]
},
'np.mask':{
  books:[{b:1,c:14,why:'布尔索引、整数索引、np.ix_'},{b:5,c:15,why:'布尔掩码数点估 pi'}],
  codes:[{b:1,c:14,f:'Bk1_Ch14_01.ipynb',why:'跑布尔索引与整数索引小节'},
         {b:5,c:15,f:'Bk5_Ch15_04.py',why:'masks 筛圆内点估 pi'}],
  refs:[]
},
'np.linalg':{
  books:[{b:1,c:17,why:'norm、inv、eig、svd 一站式'},{b:4,c:4,why:'逆矩阵'},{b:4,c:13,why:'特征值分解'}],
  codes:[{b:1,c:17,f:'Bk1_Ch17_01.ipynb',why:'范数逆特征值奇异值全跑一遍'},
         {b:4,c:4,f:'Bk4_Ch4_11.py',why:'inv(A)@A 看单位阵'},
         {b:4,c:13,f:'Bk4_Ch13_02.py',why:'eig 输出方向与缩放'}],
  refs:[{k:'ladr',p:171,t:'5.C Eigenspaces',why:'eig 到底求什么'}]
},

/* ---------- vz: 可视化 ---------- */
'vz.scatter':{
  books:[{b:2,c:7,why:'散点专章：色调大小标记'},{b:2,c:13,why:'三维散点与投影'}],
  codes:[{b:2,c:7,f:'BK_2_Ch07_02.ipynb',why:'鸢尾花散点，颜色大小当第 3、4 维'},
         {b:2,c:13,f:'BK_2_Ch13_01.ipynb',why:'三维散点沿三个轴投影'}],
  refs:[]
},
'vz.line':{
  books:[{b:2,c:8,why:'线图专章：颗粒度、参考线、曲线族'}],
  codes:[{b:2,c:8,f:'BK_2_Ch08_01.ipynb',why:'linspace 点数太少曲线会折'},
         {b:2,c:8,f:'BK_2_Ch08_08.ipynb',why:'一组参数画曲线族'}],
  refs:[]
},
'vz.heatmap':{
  books:[{b:2,c:11,why:'热图专章'},{b:2,c:6,why:'数值到颜色映射'}],
  codes:[{b:2,c:11,f:'BK_2_Ch11_01.ipynb',why:'鸢尾花矩阵与格拉姆矩阵热图'},
         {b:2,c:6,f:'BK_2_Ch06_01.ipynb',why:'同一矩阵换 cmap 看 0 在哪'}],
  refs:[]
},
'vz.contour':{
  books:[{b:2,c:10,why:'平面等高线专章'},{b:2,c:16,why:'三维等高线对照'}],
  codes:[{b:2,c:10,f:'BK_2_Ch10_02.ipynb',why:'网格到等高线标准流程'},
         {b:2,c:10,f:'BK_2_Ch10_04.ipynb',why:'多峰函数，线密处最陡'},
         {b:2,c:16,f:'Bk_2_Ch16_01.ipynb',why:'同函数三维等高线对照'}],
  refs:[]
},
'vz.hist':{
  books:[{b:5,c:7,why:'随机样本直方图配 rugplot'},{b:6,c:3,why:'直方图、箱型图看离群'},{b:2,c:3,why:'散点加边缘直方图布局'}],
  codes:[{b:5,c:7,f:'Bk5_Ch07_01.py',why:'histplot 改 bins 看形状变'},
         {b:6,c:3,f:'Bk6_Ch03_01.ipynb',why:'直方图、KDE、箱型图同一列'},
         {b:2,c:3,f:'Bk_2_Ch03_05.ipynb',why:'gridspec 边缘直方图'}],
  refs:[]
},
'vz.3d':{
  books:[{b:2,c:15,why:'网格曲面'},{b:2,c:4,why:'视角 azim/elev 怎么调'},{b:2,c:13,why:'三维散点'}],
  codes:[{b:2,c:15,f:'Bk_2_Ch15_02.ipynb',why:'plot_surface 与线框'},
         {b:2,c:4,f:'Bk_2_Ch04_06.ipynb',why:'转一圈视角看三维图读数难'}],
  refs:[]
},
'vz.color':{
  books:[{b:2,c:6,why:'颜色映射专章'},{b:2,c:5,why:'色彩空间 RGB/HSV'}],
  codes:[{b:2,c:6,f:'BK_2_Ch06_04.ipynb',why:'拆开 RdYlBu 看每个颜色'},
         {b:2,c:6,f:'BK_2_Ch06_07.ipynb',why:'自定义连续与离散色谱'}],
  refs:[]
},
'vz.subplot':{
  books:[{b:2,c:3,why:'布局专章：子图网格图中图'}],
  codes:[{b:2,c:3,f:'Bk_2_Ch03_01.ipynb',why:'2行1列、1行2列，画在 ax 上'},
         {b:2,c:3,f:'Bk_2_Ch03_07.ipynb',why:'嵌套 gridspec 分面'}],
  refs:[]
},
'vz.log_axis':{
  books:[{b:2,c:4,why:'横纵轴改对数刻度'},{b:3,c:12,why:'指数与对数函数图像'}],
  codes:[{b:2,c:4,f:'Bk_2_Ch04_04.ipynb',why:'同一曲线换对数轴'},
         {b:3,c:12,f:'Bk3_Ch12_01.py',why:'10 的 x 次方在对数轴变直线'}],
  refs:[]
},
'vz.annotate':{
  books:[{b:2,c:4,why:'装饰专章：图脊、轴、图例'},{b:2,c:3,why:'边距与轴位置'}],
  codes:[{b:2,c:4,f:'Bk_2_Ch04_01.ipynb',why:'spines 去掉多余框线'},
         {b:2,c:4,f:'Bk_2_Ch04_05.ipynb',why:'legend 与坐标标签'}],
  refs:[]
},

/* ---------- da: 数据 ---------- */
'da.dataframe':{
  books:[{b:1,c:19,why:'DataFrame 创建、查询、形状'},{b:1,c:21,why:'loc/iloc/query 索引切片'}],
  codes:[{b:1,c:19,f:'Bk1_Ch19_01.ipynb',why:'从字典和数组建表，看行列'},
         {b:1,c:21,f:'Bk1_Ch21_01.ipynb',why:'loc 按标签 iloc 按位置逐个试'}],
  refs:[]
},
'da.groupby':{
  books:[{b:1,c:22,why:'groupby 聚合小节'},{b:6,c:6,why:'gapminder 按国家分组'}],
  codes:[{b:1,c:22,f:'Bk1_Ch22_12.ipynb',why:'按 species 求均值和标准差'},
         {b:1,c:22,f:'Bk1_Ch22_16.ipynb',why:'分组取列求均值一行搞定'},
         {b:6,c:6,f:'Bk6_Ch6_04.ipynb',why:'真实数据分组聚合'}],
  refs:[]
},
'da.merge':{
  books:[{b:1,c:22,why:'拼接连接合并全在这'}],
  codes:[{b:1,c:22,f:'Bk1_Ch22_04.ipynb',why:'改 how 参数看行数变化'},
         {b:1,c:22,f:'Bk1_Ch22_01.ipynb',why:'concat 上下左右拼'}],
  refs:[]
},
'da.clean':{
  books:[{b:6,c:2,why:'缺失值：删、单变量插补、kNN 插补'},{b:6,c:3,why:'离群值：z 分数、马氏距离'}],
  codes:[{b:6,c:2,f:'Bk6_Ch02_01.ipynb',why:'先可视化缺失再三种插补'},
         {b:6,c:3,f:'Bk6_Ch03_01.ipynb',why:'箱型图与 z 分数找离群'}],
  refs:[]
},
'da.normalize':{
  books:[{b:6,c:4,why:'标准化与最小最大缩放'},{b:1,c:29,why:'z 分数标准化'}],
  codes:[{b:6,c:4,f:'Bk6_Ch04_01.ipynb',why:'两种缩放前后分布对比'},
         {b:1,c:29,f:'Bk1_Ch29_03.ipynb',why:'scaler 基本用法'}],
  refs:[]
},
'da.split':{
  books:[{b:1,c:29,why:'train_test_split 用法'},{b:7,c:4,why:'不同阶数在训练外表现'}],
  codes:[{b:1,c:29,f:'Bk1_Ch29_06.ipynb',why:'切 8:2 并可视化两集'},
         {b:7,c:4,f:'Bk7_Ch04_02.ipynb',why:'高阶多项式过拟合'}],
  refs:[]
},
'da.pipeline':{
  books:[{b:7,c:4,why:'Pipeline 串预处理与回归'},{b:1,c:30,why:'多项式特征再回归'}],
  codes:[{b:7,c:4,f:'Bk7_Ch04_02.ipynb',why:'Pipeline 一个 fit 全搞定'},
         {b:1,c:30,f:'Bk1_Ch30_03.ipynb',why:'手动两步，对比 Pipeline'}],
  refs:[]
},
'da.leak':{
  books:[{b:1,c:29,why:'scaler 与 split 的先后顺序'},{b:7,c:5,why:'正则化防过拟合'}],
  codes:[{b:1,c:29,f:'Bk1_Ch29_06.ipynb',why:'先 split，只在训练集 fit'},
         {b:1,c:29,f:'Bk1_Ch29_03.ipynb',why:'把 fit 挪到 split 前就是泄漏'}],
  refs:[]
},
'da.tidy':{
  books:[{b:1,c:22,why:'melt 与 pivot 长宽互转'},{b:1,c:12,why:'Seaborn 要长表'}],
  codes:[{b:1,c:22,f:'Bk1_Ch22_09.ipynb',why:'melt 宽变长'},
         {b:1,c:22,f:'Bk1_Ch22_06.ipynb',why:'pivot 长变宽'},
         {b:1,c:12,f:'Bk1_Ch12_01.ipynb',why:'长表喂给 seaborn 直接分面'}],
  refs:[]
},
'da.apply':{
  books:[{b:1,c:22,why:'apply 与 map 自定义函数'},{b:6,c:7,why:'apply 算对数收益'}],
  codes:[{b:1,c:22,f:'Bk1_Ch22_14.ipynb',why:'apply 自定义分箱函数'},
         {b:1,c:22,f:'Bk1_Ch22_15.ipynb',why:'分组后 apply 匿名函数'},
         {b:6,c:7,f:'Bk6_Ch7_05.ipynb',why:'同一列运算能否不用 apply'}],
  refs:[]
},

/* ---------- ml: 机器学习 ---------- */
'ml.gradient_descent':{
  books:[{b:3,c:19,why:'优化入门：最小值怎么找'},{b:4,c:17,why:'梯度场箭头指最陡方向'},{b:3,c:17,why:'数值微分求坡度'}],
  codes:[{b:4,c:17,f:'Bk4_Ch17_01.py',why:'画梯度箭头，负方向就是下山'},
         {b:3,c:19,f:'Bk3_Ch19_02.py',why:'二元函数 minimize 找谷底'},
         {b:3,c:17,f:'Bk3_Ch17_04.py',why:'差分求导，自己写一步 x-=lr*g'}],
  refs:[{k:'lifesaver',p:292,t:'13.1 Optimization',why:'导数为零处是极值'},{k:'lifesaver',p:303,t:'13.2 Linearization',why:'一步近似=线性化'}]
},
'ml.linear_reg':{
  books:[{b:7,c:2,why:'OLS 回归与残差'},{b:7,c:3,why:'多元回归'},{b:5,c:24,why:'回归=协方差投影'}],
  codes:[{b:7,c:2,f:'Bk7_Ch02_01.ipynb',why:'OLS 系数与残差可视化'},
         {b:7,c:3,f:'Bk7_Ch03_01.ipynb',why:'多元回归看向量空间'},
         {b:1,c:30,f:'Bk1_Ch30_02.ipynb',why:'sklearn 两特征回归'}],
  refs:[{k:'ladr',p:208,t:'6.C Minimization',why:'投影到子空间残差正交'}]
},
'ml.logistic':{
  books:[{b:7,c:4,why:'逻辑函数与逻辑回归'}],
  codes:[{b:7,c:4,f:'Bk7_Ch04_03.ipynb',why:'expit 画 sigmoid'},
         {b:7,c:4,f:'Bk7_Ch04_04.ipynb',why:'单特征逻辑回归概率曲线'},
         {b:7,c:4,f:'Bk7_Ch04_05.ipynb',why:'两特征决策边界还是直线'}],
  refs:[]
},
'ml.svm':{
  books:[{b:7,c:11,why:'SVM 最大间隔'},{b:7,c:12,why:'核技巧'}],
  codes:[{b:7,c:11,f:'Bk7_Ch11_01.ipynb',why:'画支持向量与间隔'},
         {b:7,c:12,f:'Bk7_Ch12_01.ipynb',why:'换核看边界弯曲'}],
  refs:[]
},
'ml.tree':{
  books:[{b:7,c:13,why:'决策树专章'}],
  codes:[{b:7,c:13,f:'Bk7_Ch13_01.ipynb',why:'plot_tree 看每一刀切在哪'},
         {b:7,c:13,f:'Streamlit_Bk7_Ch13_02.py',why:'滑 max_depth 看边界变碎'}],
  refs:[]
},
'ml.forest':{
  books:[{b:7,c:13,why:'借：单棵树是森林的基元'},{b:6,c:2,why:'借：RandomForest 做缺失插补'}],
  codes:[{b:7,c:13,f:'Bk7_Ch13_01.ipynb',why:'先跑单树，再自己循环多棵投票'},
         {b:6,c:2,f:'Bk6_Ch02_01.ipynb',why:'随机森林回归器用法'}],
  refs:[]
},
'ml.xgboost':{
  books:[{b:7,c:13,why:'借：树是每轮的弱学习器'},{b:7,c:2,why:'借：残差分析，提升学的就是残差'}],
  codes:[{b:7,c:13,f:'Bk7_Ch13_01.ipynb',why:'单树后自己对残差再拟一棵'},
         {b:7,c:2,f:'Bk7_Ch02_03.ipynb',why:'残差怎么算怎么看'}],
  refs:[]
},
'ml.knn':{
  books:[{b:7,c:8,why:'最近邻分类与回归'},{b:1,c:32,why:'sklearn KNN 最简版'}],
  codes:[{b:7,c:8,f:'Bk7_Ch08_01.ipynb',why:'改 k 看决策边界'},
         {b:7,c:8,f:'Bk7_Ch08_04.ipynb',why:'KNN 回归查表式预测'}],
  refs:[]
},
'ml.kmeans':{
  books:[{b:7,c:20,why:'k 均值专章含肘部法'},{b:1,c:33,why:'sklearn KMeans 最简版'}],
  codes:[{b:7,c:20,f:'Bk7_Ch20_01.ipynb',why:'看中心与分区'},
         {b:7,c:20,f:'Bk7_Ch20_02.ipynb',why:'inertia 肘部选 k'}],
  refs:[]
},
'ml.pca':{
  books:[{b:7,c:14,why:'PCA 专章'},{b:5,c:25,why:'PCA 的统计推导'},{b:4,c:15,why:'SVD 底层'}],
  codes:[{b:7,c:14,f:'Bk7_Ch14_01.ipynb',why:'方差解释比累积曲线'},
         {b:5,c:25,f:'Bk5_Ch25_01.py',why:'协方差特征向量就是主轴'}],
  refs:[{k:'ladr',p:248,t:'7.D SVD',why:'PCA 就是 SVD'}]
},
'ml.naive_bayes':{
  books:[{b:7,c:9,why:'朴素贝叶斯分类'},{b:5,c:18,why:'贝叶斯分类先验乘似然'}],
  codes:[{b:7,c:9,f:'Bk7_Ch09_01.ipynb',why:'GaussianNB 决策边界'},
         {b:5,c:18,f:'Bk5_Ch18_01.py',why:'手算先验、似然、后验'}],
  refs:[]
},
'ml.metrics':{
  books:[{b:7,c:5,why:'借：MSE 当回归指标'},{b:7,c:2,why:'借：R 方与拟合优度'},{b:5,c:16,why:'借：alpha 就是误报率'}],
  codes:[{b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'均方误差函数用法'},
         {b:5,c:16,f:'Bk5_Ch16_04.py',why:'改 alpha 看漏检误报此消彼长'}],
  refs:[]
},

/* ---------- dl: 深度学习（书里无神经网络，借最近方法章） ---------- */
'dl.mlp':{
  books:[{b:7,c:4,why:'借：非线性回归是 MLP 的前身'},{b:7,c:12,why:'借：核映射=隐藏层特征'}],
  codes:[{b:7,c:4,f:'Bk7_Ch04_02.ipynb',why:'多项式加深看拟合能力'},
         {b:7,c:12,f:'Bk7_Ch12_01.ipynb',why:'非线性特征映射后线性可分'}],
  refs:[]
},
'dl.activation':{
  books:[{b:7,c:4,why:'借：sigmoid 曲线'},{b:3,c:15,why:'借：导数形状'}],
  codes:[{b:7,c:4,f:'Bk7_Ch04_03.ipynb',why:'画 sigmoid，再画它的导数'},
         {b:3,c:15,f:'Bk3_Ch15_04.py',why:'sympy diff 画导函数'}],
  refs:[{k:'lifesaver',p:202,t:'9.3 Logs and Exponentials',why:'e 的导数是自己'}]
},
'dl.backprop':{
  books:[{b:3,c:17,why:'借：微分与数值求导'},{b:3,c:16,why:'借：偏导数'},{b:4,c:17,why:'借：多元梯度'}],
  codes:[{b:3,c:17,f:'Bk3_Ch17_04.py',why:'差分验证手算梯度'},
         {b:4,c:17,f:'Bk4_Ch17_01.py',why:'sympy 求梯度对照链式法则'}],
  refs:[{k:'lifesaver',p:127,t:'6.2 Derivatives',why:'链式法则原文'}]
},
'dl.cnn':{
  books:[{b:2,c:11,why:'借：图像=像素矩阵三通道'},{b:6,c:4,why:'借：图像插值即卷积核'}],
  codes:[{b:2,c:11,f:'BK_2_Ch11_05.ipynb',why:'拆 RGB 通道、降像素'},
         {b:6,c:4,f:'Bk6_Ch04_08.ipynb',why:'各插值核扫图效果'}],
  refs:[]
},
'dl.rnn':{
  books:[{b:6,c:7,why:'借：移动窗口与指数加权记忆'},{b:6,c:8,why:'借：随机过程状态传递'}],
  codes:[{b:6,c:7,f:'Bk6_Ch7_04.ipynb',why:'EWMA 权重衰减=遗忘'},
         {b:6,c:7,f:'Bk6_Ch7_01.ipynb',why:'rolling 沿时间反复用同一算法'}],
  refs:[]
},
'dl.attention':{
  books:[{b:6,c:5,why:'借：余弦相似度'},{b:6,c:19,why:'借：成对度量矩阵'},{b:4,c:2,why:'借：点积与夹角'}],
  codes:[{b:6,c:5,f:'Bk6_Ch05_07.ipynb',why:'cosine_similarity 打分'},
         {b:6,c:19,f:'Bk6_Ch19_01.ipynb',why:'所有对所有的相似度矩阵'}],
  refs:[{k:'ladr',p:179,t:'6.A Inner Products',why:'点积衡量相关'}]
},
'dl.transformer':{
  books:[{b:6,c:19,why:'借：成对矩阵=注意力图'},{b:4,c:5,why:'借：矩阵乘法并行'}],
  codes:[{b:6,c:19,f:'Bk6_Ch19_01.ipynb',why:'成对矩阵一步到任意位置'},
         {b:4,c:5,f:'Bk4_Ch5_01.py',why:'矩阵乘一次算完所有位置'}],
  refs:[]
},
'dl.resnet':{
  books:[{b:7,c:2,why:'借：残差分析'},{b:7,c:5,why:'借：加层不伤害与正则'}],
  codes:[{b:7,c:2,f:'Bk7_Ch02_03.ipynb',why:'残差=y 减预测，F(x) 学的就是它'},
         {b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'Ridge 与 OLS 对比'}],
  refs:[]
},
'dl.unet':{
  books:[{b:2,c:11,why:'借：降像素与插值放大'},{b:6,c:4,why:'借：上采样插值'}],
  codes:[{b:2,c:11,f:'BK_2_Ch11_05.ipynb',why:'降像素再插值，细节丢在哪'},
         {b:6,c:4,f:'Bk6_Ch04_08.ipynb',why:'上采样各方法对比'}],
  refs:[]
},
'dl.vae':{
  books:[{b:7,c:14,why:'借：PCA 是线性自编码器'},{b:7,c:17,why:'借：低维重建'},{b:5,c:10,why:'借：潜空间是二元高斯'}],
  codes:[{b:7,c:14,f:'Bk7_Ch14_01.ipynb',why:'压到两维再看丢了多少'},
         {b:5,c:10,f:'Bk5_Ch10_01.py',why:'高斯潜空间任取一点都合理'}],
  refs:[]
},
'dl.gan':{
  books:[{b:5,c:15,why:'借：从分布采样生成'},{b:7,c:21,why:'借：GMM 生成模型'},{b:5,c:18,why:'借：分类器当鉴定师'}],
  codes:[{b:5,c:15,f:'Bk5_Ch15_07.py',why:'二元高斯采样=最简生成器'},
         {b:7,c:21,f:'Bk7_Ch21_02.ipynb',why:'GMM 拟合再采样'}],
  refs:[]
},
'dl.loss':{
  books:[{b:7,c:2,why:'借：对数似然'},{b:7,c:5,why:'借：MSE 加惩罚项'},{b:5,c:16,why:'借：MLE 推导'}],
  codes:[{b:7,c:2,f:'Bk7_Ch02_03.ipynb',why:'Log-Likelihood 一节'},
         {b:5,c:16,f:'Bk5_Ch16_03.py',why:'sympy 手推 MLE'},
         {b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'MSE 加 L2 项'}],
  refs:[]
},

/* ---------- bm: 生物医学（借最近方法章） ---------- */
'bm.sequence':{
  books:[{b:1,c:5,why:'借：字符串按字符遍历'},{b:1,c:7,why:'借：笛卡尔积造 k-mer'},{b:6,c:19,why:'借：one-hot'}],
  codes:[{b:1,c:7,f:'Bk1_Ch07_27.ipynb',why:'product 枚举所有 k-mer'},
         {b:1,c:5,f:'Bk1_Ch05_05.ipynb',why:'enumerate 逐字符编码'},
         {b:6,c:19,f:'Bk6_Ch19_04.ipynb',why:'one-hot 编码用法'}],
  refs:[]
},
'bm.protein_embed':{
  books:[{b:7,c:14,why:'借：embedding=低维向量'},{b:7,c:17,why:'借：先降维再回归'},{b:7,c:18,why:'借：核 PCA 非线性嵌入'}],
  codes:[{b:7,c:17,f:'Bk7_Ch17_01.ipynb',why:'PCA 分数当特征做回归'},
         {b:7,c:18,f:'Bk7_Ch18_01.ipynb',why:'非线性嵌入长什么样'}],
  refs:[]
},
'bm.image_seg':{
  books:[{b:2,c:11,why:'借：逐像素操作'},{b:7,c:20,why:'借：聚类分区=分割'},{b:5,c:15,why:'借：掩码重叠面积=Dice'}],
  codes:[{b:2,c:11,f:'BK_2_Ch11_05.ipynb',why:'替换色块=像素掩码'},
         {b:7,c:20,f:'Bk7_Ch20_03.ipynb',why:'kmeans 把平面切成区'},
         {b:5,c:15,f:'Bk5_Ch15_04.py',why:'布尔掩码算重叠比例'}],
  refs:[]
},
'bm.flow_gating':{
  books:[{b:5,c:8,why:'借：条件概率链式'},{b:6,c:3,why:'借：散点上画阈值门'}],
  codes:[{b:5,c:8,f:'Bk5_Ch08_01.py',why:'父门内占比就是条件概率热图'},
         {b:6,c:3,f:'Bk6_Ch03_01.ipynb',why:'散点加阈值线圈出子群'}],
  refs:[]
},
'bm.dose_response':{
  books:[{b:7,c:4,why:'借：S 形函数与非线性拟合'},{b:3,c:12,why:'借：对数横轴'}],
  codes:[{b:7,c:4,f:'Bk7_Ch04_03.ipynb',why:'sigmoid 半高点=EC50'},
         {b:7,c:4,f:'Bk7_Ch04_01.ipynb',why:'curve_fit 拟指数与非线性'},
         {b:3,c:12,f:'Bk3_Ch12_01.py',why:'浓度换 log 轴'}],
  refs:[]
},
'bm.survival':{
  books:[{b:5,c:7,why:'借：指数分布常数风险'},{b:5,c:6,why:'借：生存函数=1-CDF'},{b:5,c:16,why:'借：小样本 t 检验'}],
  codes:[{b:5,c:7,f:'Bk5_Ch07_07.py',why:'指数分布改 lambda 看衰减'},
         {b:5,c:6,f:'Bk5_Ch06_01.py',why:'CDF 翻过来就是生存曲线'}],
  refs:[]
},
'bm.pk_ode':{
  books:[{b:3,c:12,why:'借：指数函数'},{b:3,c:14,why:'借：等比数列=离散衰减'},{b:3,c:17,why:'借：差分=一步欧拉'}],
  codes:[{b:3,c:14,f:'Bk3_Ch14_02.py',why:'q<1 等比数列就是每步乘衰减'},
         {b:3,c:12,f:'Bk3_Ch12_01.py',why:'exp 曲线在 log 轴成直线'},
         {b:3,c:17,f:'Bk3_Ch17_04.py',why:'差分手写欧拉法解 ODE'}],
  refs:[{k:'lifesaver',p:218,t:'9.6 Exponential Growth and Decay',why:'半衰期=ln2/k'},{k:'lifesaver',p:671,t:'30.2 Separable ODE',why:'一阶消除方程怎么解'}]
},
'bm.cell_cluster':{
  books:[{b:7,c:14,why:'借：PCA 降维'},{b:7,c:20,why:'借：kmeans'},{b:6,c:23,why:'借：kNN 图上谱聚类'}],
  codes:[{b:7,c:14,f:'Bk7_Ch14_01.ipynb',why:'先 PCA'},
         {b:6,c:23,f:'Bk6_Ch23_01.ipynb',why:'图聚类近似 Leiden'},
         {b:7,c:20,f:'Bk7_Ch20_01.ipynb',why:'kmeans 对照'}],
  refs:[]
},
'bm.batch_effect':{
  books:[{b:6,c:4,why:'借：标准化去尺度差'},{b:5,c:16,why:'借：两群混合分布'},{b:7,c:3,why:'借：相关矩阵找共变'}],
  codes:[{b:5,c:16,f:'Bk5_Ch16_02.py',why:'两个正态混合，批次就是这样'},
         {b:6,c:4,f:'Bk6_Ch04_01.ipynb',why:'按批分别标准化'}],
  refs:[]
},
'bm.small_n':{
  books:[{b:5,c:16,why:'借：t 分布与 alpha'},{b:7,c:5,why:'借：p 大于 n 用正则'},{b:1,c:29,why:'借：先切分'}],
  codes:[{b:5,c:16,f:'Bk5_Ch16_05.py',why:'n=6 时 t 比正态肥尾'},
         {b:5,c:16,f:'Bk5_Ch16_04.py',why:'alpha 乘 20000 次检验'},
         {b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'Ridge 压住多余特征'}],
  refs:[]
}

});
