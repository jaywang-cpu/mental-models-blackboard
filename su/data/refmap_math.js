/* 数学牌子 -> 鸢尾花书章节 / 代码文件 / 英文书页码。b=第几本 c=第几章 f=代码文件 k=refs.js key p=PDF页码 */
window.REFMAP=window.REFMAP||{};
Object.assign(window.REFMAP,{

/* ===== 数感 ns ===== */
'ns.max_digits':{
  books:[{b:3,c:12,why:'看指数曲线怎么甩开幂函数'},{b:3,c:11,why:'幂函数不同指数的形状对比'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_01.py',why:'对数轴上看增长快慢'},{b:3,c:11,f:'Bk3_Ch11_01.py',why:'一排幂函数放一起比'}],
  refs:[{k:'vedic',p:118,t:'1. Terms and Operations',why:'幂与量级的心算基本功'}]
},
'ns.make24':{
  books:[{b:3,c:2,why:'乘除与阶乘的基本操作'},{b:3,c:1,why:'加减和累加的写法'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_01.py',why:'两数相乘最小例子'},{b:3,c:1,f:'Bk3_Ch1_04.py',why:'两数相加最小例子'}],
  refs:[{k:'vedic',p:153,t:'5. Miscellaneous Items',why:'凑数与拆数的杂技口诀'}]
},
'ns.estimate':{
  books:[{b:3,c:1,why:'π的位数与有效数字概念'},{b:3,c:3,why:'多边形逼近π的估算过程'}],
  codes:[{b:3,c:1,f:'Bk3_Ch1_02.py',why:'看π到多少位才算够'},{b:3,c:3,f:'Bk3_Ch3_03.py',why:'边数越多估计越准'}],
  refs:[{k:'vedic',p:108,t:'17. Vilokanam',why:'一眼看出答案的观察法'}]
},
'ns.percent':{
  books:[{b:3,c:2,why:'除法与比例的写法'},{b:5,c:2,why:'比例和频率的统计描述'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_04.py',why:'除法最小例子'}],
  refs:[{k:'vedic',p:77,t:'11. Anurupyena',why:'按比例缩放的口诀'}]
},
'ns.abacus':{
  books:[{b:3,c:1,why:'加减与累加的机器视角'}],
  codes:[{b:3,c:1,f:'Bk3_Ch1_06.py',why:'累加就是珠子逐位进位'}],
  refs:[{k:'vedic',p:132,t:'2. Addition and Subtraction',why:'补数进位的加减心算'},{k:'vedic',p:20,t:'2. Nikhilam navatascaramam Dasatah',why:'九减末位十减求补数'}]
},
'ns.factor':{
  books:[{b:3,c:2,why:'整除、余数与阶乘'},{b:3,c:1,why:'奇偶判断入口'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_05.py',why:'取余是试除的核心'},{b:3,c:1,f:'Bk3_Ch1_03.py',why:'用余数判奇偶'}],
  refs:[{k:'vedic',p:146,t:'4. Division',why:'试除的速算路径'},{k:'vedic',p:43,t:'4. Paravartya Yojayet',why:'换号除法一眼出商余'}]
},
'ns.log_scale':{
  books:[{b:3,c:12,why:'对数轴上的曲线怎么变直'},{b:6,c:4,why:'数据取对数后的分布变化'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_01.py',why:'同一曲线线性轴与对数轴对比'},{b:6,c:4,f:'Bk6_Ch04_01.ipynb',why:'对数变换压缩量级'}],
  refs:[{k:'lifesaver',p:192,t:'9.1 The Basics',why:'对数把乘法变加法的定义'}]
},
'ns.magnitude':{
  books:[{b:3,c:1,why:'数的大小与位数'},{b:3,c:12,why:'指数增长几步就翻几个零'}],
  codes:[{b:3,c:1,f:'Bk3_Ch1_02.py',why:'千位小数看量级差距'},{b:3,c:12,f:'Bk3_Ch12_01.py',why:'对数轴每格一个零'}],
  refs:[{k:'vedic',p:118,t:'1. Terms and Operations',why:'位值与数量级的底子'}]
},
'ns.mental_mult':{
  books:[{b:3,c:2,why:'乘法的各种形态：标量、向量、矩阵'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_01.py',why:'乘法最小例子'},{b:3,c:2,f:'Bk3_Ch2_03.py',why:'累乘看数字怎么爆'}],
  refs:[{k:'vedic',p:33,t:'3. Urdhva - tiryagbhyam',why:'竖乘横加的万能乘法'},{k:'vedic',p:20,t:'2. Nikhilam navatascaramam Dasatah',why:'靠近整十整百的乘法'}]
},
'ns.square_trick':{
  books:[{b:3,c:2,why:'幂运算与乘法'},{b:3,c:11,why:'平方函数的形状'}],
  codes:[{b:3,c:11,f:'Bk3_Ch11_01.py',why:'看平方随邻居怎么变'}],
  refs:[{k:'vedic',p:9,t:'1. Ekadhikena Purvena',why:'尾5平方口诀'},{k:'vedic',p:88,t:'13. Yavadunam Tavadunikrtya Varganca Yojayet',why:'靠近整十的平方'}]
},
'ns.divisibility':{
  books:[{b:3,c:2,why:'余数与整除'},{b:3,c:1,why:'奇偶就是最简单的整除'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_05.py',why:'余数为零即整除'},{b:3,c:1,f:'Bk3_Ch1_03.py',why:'2的整除判定'}],
  refs:[{k:'vedic',p:146,t:'4. Division',why:'整除与速除口诀'},{k:'vedic',p:9,t:'1. Ekadhikena Purvena',why:'被9、11整除的判定源头'}]
},
'ns.average_trap':{
  books:[{b:5,c:2,why:'均值、中位数与加权的区别'},{b:3,c:2,why:'除法与比率'}],
  codes:[{b:5,c:2,f:'Bk5_Ch02_01.py',why:'同一数据不同均值算法'}],
  refs:[{k:'vedic',p:153,t:'5. Miscellaneous Items',why:'平均与比率的心算杂技'}]
},

/* ===== 代数 al ===== */
'al.function_zoo':{
  books:[{b:3,c:10,why:'函数的基本性质与分类'},{b:3,c:11,why:'代数函数的脸：线性、幂、多项式'},{b:3,c:12,why:'超越函数的脸：指数、对数、三角'}],
  codes:[{b:3,c:11,f:'Bk3_Ch11_03.py',why:'一组代数函数并排画'},{b:3,c:12,f:'Bk3_Ch12_02.py',why:'高斯函数参数怎么改形状'}],
  refs:[{k:'lifesaver',p:44,t:'1.6 Common Functions and Graphs',why:'常见函数图像速查'}]
},
'al.exp_log':{
  books:[{b:3,c:12,why:'指数对数互逆的图像'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_01.py',why:'指数在对数轴变直线'}],
  refs:[{k:'lifesaver',p:192,t:'9.1 The Basics',why:'指数对数规则一页总结'},{k:'lifesaver',p:198,t:'9.2 Definition of e',why:'e从哪来'}]
},
'al.quadratic':{
  books:[{b:3,c:11,why:'二次函数与幂函数图像'},{b:3,c:9,why:'抛物线作为圆锥曲线'}],
  codes:[{b:3,c:11,f:'Bk3_Ch11_02.py',why:'二次项系数改变开口'},{b:3,c:4,f:'Bk3_Ch4_09.py',why:'sympy求根'}],
  refs:[{k:'lifesaver',p:44,t:'1.6 Common Functions and Graphs',why:'抛物线顶点与形状'}]
},
'al.inequality_amgm':{
  books:[{b:3,c:13,why:'二元函数曲面看和积关系'},{b:3,c:19,why:'约束下的最值'}],
  codes:[{b:3,c:13,f:'Bk3_Ch13_01.py',why:'xy曲面在x=y处最高'}],
  refs:[{k:'lifesaver',p:292,t:'13.1 Optimization',why:'和定积最大的微积分证法'}]
},
'al.substitution':{
  books:[{b:3,c:4,why:'符号代入与化简'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_02.py',why:'subs把整坨换成t'},{b:3,c:4,f:'Bk3_Ch4_03.py',why:'simplify自动化简'}],
  refs:[{k:'lifesaver',p:36,t:'1.3 Composition of Functions',why:'换元本质是复合函数'}]
},
'al.polynomial':{
  books:[{b:3,c:4,why:'多项式展开与求根'},{b:3,c:11,why:'多项式函数图像'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_05.py',why:'(x+1)^n展开看系数'},{b:3,c:4,f:'Bk3_Ch4_09.py',why:'根就是因式'}],
  refs:[{k:'ladr',p:138,t:'Zeros of Polynomials',why:'根与因式的严格对应'}]
},
'al.system_eq':{
  books:[{b:3,c:23,why:'鸡兔同笼：方程组的三种看法'},{b:3,c:24,why:'方程组变最小二乘'},{b:4,c:6,why:'矩阵视角解方程'}],
  codes:[{b:3,c:23,f:'Bk3_Ch23_1.py',why:'Ax=b一行解出'},{b:3,c:23,f:'Bk3_Ch23_2.py',why:'解=列向量的组合'}],
  refs:[{k:'ladr',p:45,t:'2.A Span and Linear Independence',why:'解存在=b在列张成里'}]
},
'al.sequence':{
  books:[{b:3,c:14,why:'等差等比与求和'},{b:2,c:19,why:'数列的可视化'}],
  codes:[{b:3,c:14,f:'Bk3_Ch14_01.py',why:'等差求和公式实现'},{b:3,c:14,f:'Bk3_Ch14_02.py',why:'公比变号变大时的走势'}],
  refs:[{k:'lifesaver',p:527,t:'23.1 How to Evaluate Geometric Series',why:'等比级数求和'},{k:'rudin',p:59,t:'Ch3 Numerical Sequences and Series',why:'数列收敛的严格定义'}]
},
'al.trig':{
  books:[{b:3,c:12,why:'三角函数图像与周期'},{b:3,c:5,why:'单位圆参数方程'}],
  codes:[{b:3,c:5,f:'Bk3_Ch5_05.py',why:'cos横sin竖画单位圆'},{b:3,c:4,f:'Bk3_Ch4_03.py',why:'三角恒等式自动化简'}],
  refs:[{k:'lifesaver',p:50,t:'2.1 The Basics',why:'三角函数从单位圆定义'},{k:'lifesaver',p:64,t:'2.4 Trig Identities',why:'必背恒等式清单'}]
},
'al.vieta':{
  books:[{b:3,c:4,why:'多项式根与系数'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_09.py',why:'求根后验证和与积'},{b:3,c:4,f:'Bk3_Ch4_05.py',why:'展开看系数来源'}],
  refs:[{k:'ladr',p:139,t:'Factorization of polynomials over C',why:'根乘积展开即系数'}]
},
'al.abs_ineq':{
  books:[{b:3,c:11,why:'绝对值函数的V形'},{b:3,c:7,why:'距离就是绝对值'}],
  codes:[{b:3,c:11,f:'Bk3_Ch11_03.py',why:'绝对值函数图像'},{b:3,c:7,f:'Bk3_Ch7_01.py',why:'两点距离计算'}],
  refs:[{k:'lifesaver',p:97,t:'4.6 Limits Involving Absolute Values',why:'绝对值拆区间套路'}]
},
'al.doubling':{
  books:[{b:3,c:12,why:'指数增长与翻倍'},{b:3,c:14,why:'等比数列就是复利'}],
  codes:[{b:3,c:14,f:'Bk3_Ch14_02.py',why:'公比1.1跑50步看翻倍'}],
  refs:[{k:'lifesaver',p:218,t:'9.6 Exponential Growth and Decay',why:'翻倍时间=ln2/r'}]
},
'al.log_trap':{
  books:[{b:3,c:12,why:'对数运算规则'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_01.py',why:'对数轴下加法不再是加法'}],
  refs:[{k:'lifesaver',p:192,t:'9.1 The Basics',why:'对数只拆乘除的规则'}]
},

/* ===== 几何 ge ===== */
'ge.vector':{
  books:[{b:3,c:22,why:'向量是箭头：加法与数乘'},{b:4,c:2,why:'向量运算全集'}],
  codes:[{b:3,c:22,f:'Bk3_Ch22_1.py',why:'画箭头看首尾相接'},{b:4,c:2,f:'Bk4_Ch2_05.py',why:'数乘拉伸'}],
  refs:[{k:'ladr',p:19,t:'1.A Rn and Cn',why:'向量加法数乘的严格定义'}]
},
'ge.dot_projection':{
  books:[{b:4,c:2,why:'点积、夹角余弦'},{b:4,c:9,why:'投影长度'}],
  codes:[{b:4,c:2,f:'Bk4_Ch2_09.py',why:'点积除范数得cos'},{b:4,c:9,f:'Bk4_Ch9_01.py',why:'向量往各方向的影子'}],
  refs:[{k:'ladr',p:179,t:'6.A Inner Products and Norms',why:'内积与柯西不等式'}]
},
'ge.unit_circle':{
  books:[{b:3,c:5,why:'单位圆参数方程'},{b:4,c:20,why:'单位圆经矩阵变椭圆'}],
  codes:[{b:3,c:5,f:'Bk3_Ch5_05.py',why:'(cos t, sin t)画圆'},{b:4,c:20,f:'Bk4_Ch20_01.py',why:'单位圆被矩阵拉扯'}],
  refs:[{k:'lifesaver',p:53,t:'2.2 Extending the Domain of Trig Functions',why:'任意角在圆上的位置'}]
},
'ge.conic':{
  books:[{b:3,c:8,why:'切圆锥得四种曲线'},{b:3,c:9,why:'圆锥曲线的方程与参数'},{b:4,c:20,why:'二次型视角'}],
  codes:[{b:3,c:8,f:'Bk3_Ch8_01.py',why:'隐函数画四种曲线'},{b:3,c:9,f:'Bk3_Ch9_02.py',why:'a、b怎么改椭圆'}],
  refs:[{k:'lifesaver',p:606,t:'27.2 Polar Coordinates',why:'极坐标下的圆锥曲线'}]
},
'ge.transform':{
  books:[{b:4,c:8,why:'平移缩放旋转的矩阵'},{b:2,c:26,why:'平面变换可视化'}],
  codes:[{b:4,c:8,f:'Bk4_Ch8_01.py',why:'同一形状经各种矩阵'},{b:4,c:8,f:'Bk4_Ch8_02.py',why:'复合变换顺序不同结果不同'}],
  refs:[{k:'ladr',p:68,t:'3.A The Vector Space of Linear Maps',why:'变换复合=矩阵相乘'}]
},
'ge.distance':{
  books:[{b:3,c:7,why:'点点、点线距离'},{b:2,c:25,why:'各种距离的等高线'}],
  codes:[{b:3,c:7,f:'Bk3_Ch7_01.py',why:'两点距离勾股'},{b:3,c:7,f:'Bk3_Ch7_04.py',why:'点到直线垂足公式'}],
  refs:[{k:'ladr',p:208,t:'6.C Orthogonal Complements and Minimization Problems',why:'最近点在垂足的证明'}]
},
'ge.area_cross':{
  books:[{b:4,c:2,why:'叉积定义'},{b:4,c:4,why:'行列式=面积'}],
  codes:[{b:4,c:2,f:'Bk4_Ch2_11.py',why:'np.cross算叉积'},{b:4,c:4,f:'Bk4_Ch4_15.py',why:'2x2行列式即平行四边形面积'}],
  refs:[{k:'ladr',p:322,t:'10.B Determinant',why:'行列式与体积的关系'}]
},
'ge.similar':{
  books:[{b:3,c:3,why:'多边形与圆的几何关系'},{b:4,c:8,why:'缩放矩阵按比例放大'}],
  codes:[{b:3,c:3,f:'Bk3_Ch3_01.py',why:'同心多边形按比例长大'},{b:4,c:8,f:'Bk4_Ch8_01.py',why:'缩放k倍面积k平方'}],
  refs:[]
},
'ge.pythagoras':{
  books:[{b:3,c:7,why:'距离公式即勾股'},{b:4,c:3,why:'L2范数是勾股的推广'}],
  codes:[{b:3,c:7,f:'Bk3_Ch7_01.py',why:'sqrt(dx²+dy²)'},{b:3,c:22,f:'Bk3_Ch22_3.py',why:'向量L2范数'}],
  refs:[{k:'ladr',p:179,t:'6.A Inner Products and Norms',why:'范数版勾股定理'}]
},
'ge.polar':{
  books:[{b:3,c:5,why:'极坐标画法'},{b:2,c:24,why:'复数乘法=旋转'},{b:2,c:9,why:'极坐标图集'}],
  codes:[{b:3,c:5,f:'Bk3_Ch5_04.py',why:'极坐标绘图函数'},{b:2,c:24,f:'Bk2_Ch24_01.ipynb',why:'复数在平面上转'}],
  refs:[{k:'lifesaver',p:606,t:'27.2 Polar Coordinates',why:'极坐标与直角坐标互换'},{k:'lifesaver',p:624,t:'28.2 The Complex Plane',why:'乘复数=转角加长度乘'}]
},
'ge.inscribed_angle':{
  books:[{b:3,c:3,why:'圆内接多边形的角'},{b:2,c:12,why:'平面几何作图'}],
  codes:[{b:3,c:3,f:'Bk3_Ch3_01.py',why:'内接多边形顶点在圆上'}],
  refs:[]
},
'ge.normal_line':{
  books:[{b:3,c:7,why:'直线一般式与点线距离'},{b:4,c:19,why:'从直线到超平面的法向量'}],
  codes:[{b:3,c:7,f:'Bk3_Ch7_04.py',why:'ax+by+c里的(a,b)'},{b:4,c:19,f:'Bk4_Ch19_01.py',why:'梯度就是法向量'}],
  refs:[{k:'ladr',p:208,t:'6.C Orthogonal Complements and Minimization Problems',why:'法向量与正交补'}]
},

/* ===== 线代 la ===== */
'la.matrix_transform':{
  books:[{b:4,c:5,why:'矩阵乘法的列视角'},{b:4,c:8,why:'矩阵把形状变成什么'},{b:4,c:4,why:'矩阵基本运算'}],
  codes:[{b:4,c:5,f:'Bk4_Ch5_01.py',why:'矩阵乘向量拆成列加权'},{b:4,c:8,f:'Bk4_Ch8_01.py',why:'看基向量去哪了'}],
  refs:[{k:'ladr',p:86,t:'3.C Matrices',why:'矩阵列=基向量的像'}]
},
'la.eigen':{
  books:[{b:4,c:13,why:'特征值分解几何'},{b:4,c:14,why:'马尔科夫链的稳态即特征向量'}],
  codes:[{b:4,c:13,f:'Bk4_Ch13_02.py',why:'单位圆上哪些方向不转'},{b:4,c:14,f:'Bk4_Ch14_01.py',why:'np.linalg.eig一行'}],
  refs:[{k:'ladr',p:159,t:'5.B Eigenvectors and Upper-Triangular Matrices',why:'特征向量存在性'},{k:'ladr',p:171,t:'5.C Eigenspaces and Diagonal Matrices',why:'可对角化条件'}]
},
'la.svd':{
  books:[{b:4,c:15,why:'转缩转的几何'},{b:4,c:16,why:'SVD四种形式与数据'},{b:2,c:28,why:'SVD可视化'}],
  codes:[{b:4,c:15,f:'Bk4_Ch15_01.py',why:'单位圆被A变椭圆的三步'},{b:4,c:15,f:'Bk4_Ch15_02.py',why:'SVD热图拆解'}],
  refs:[{k:'ladr',p:248,t:'7.D Polar Decomposition and Singular Value Decomposition',why:'SVD严格推导'}]
},
'la.rank':{
  books:[{b:4,c:7,why:'张成空间与秩'},{b:4,c:11,why:'分解看秩'}],
  codes:[{b:4,c:7,f:'Streamlit_Bk4_Ch7_01.py',why:'拖动列向量看张成'},{b:4,c:11,f:'Bk4_Ch11_01.py',why:'分解后数非零主元'}],
  refs:[{k:'ladr',p:75,t:'3.B Null Spaces and Ranges',why:'秩=像空间维数'},{k:'ladr',p:61,t:'2.C Dimension',why:'维数计数'}]
},
'la.inverse':{
  books:[{b:4,c:4,why:'逆矩阵的计算'},{b:4,c:6,why:'分块矩阵求逆'}],
  codes:[{b:4,c:4,f:'Bk4_Ch4_11.py',why:'np.linalg.inv'},{b:4,c:4,f:'Bk4_Ch4_12.py',why:'A.I 写法'}],
  refs:[{k:'ladr',p:96,t:'3.D Invertibility and Isomorphic Vector Spaces',why:'可逆当且仅当双射'}]
},
'la.basis':{
  books:[{b:4,c:7,why:'基、坐标、换基'},{b:4,c:9,why:'正交基下坐标=投影'}],
  codes:[{b:4,c:7,f:'Streamlit_Bk4_Ch7_02.py',why:'换基看坐标怎么变'},{b:4,c:9,f:'Bk4_Ch9_02.py',why:'在旋转基上的坐标'}],
  refs:[{k:'ladr',p:56,t:'2.B Bases',why:'基的定义与唯一表示'}]
},
'la.projection':{
  books:[{b:4,c:9,why:'正交投影几何'},{b:4,c:10,why:'数据往方向上投'}],
  codes:[{b:4,c:9,f:'Bk4_Ch9_01.py',why:'向量在各角度上的投影'},{b:4,c:10,f:'Bk4_Ch10_01.py',why:'鸢尾花数据投影'}],
  refs:[{k:'ladr',p:208,t:'6.C Orthogonal Complements and Minimization Problems',why:'投影=最近点定理'}]
},
'la.determinant':{
  books:[{b:4,c:4,why:'行列式计算'},{b:4,c:8,why:'变换后面积倍数'}],
  codes:[{b:4,c:4,f:'Bk4_Ch4_15.py',why:'np.linalg.det'},{b:4,c:8,f:'Bk4_Ch8_01.py',why:'看形状面积怎么缩放翻面'}],
  refs:[{k:'ladr',p:322,t:'10.B Determinant',why:'行列式=体积缩放的证明'}]
},
'la.matmul_shape':{
  books:[{b:4,c:4,why:'矩阵乘法与形状'},{b:4,c:5,why:'乘法的多种视角'}],
  codes:[{b:4,c:4,f:'Bk4_Ch4_07.py',why:'(1x2)(2x2)看形状'},{b:4,c:4,f:'Bk4_Ch4_06.py',why:'@与*的区别'}],
  refs:[{k:'ladr',p:86,t:'3.C Matrices',why:'矩阵乘法为何这样定义'}]
},
'la.orthogonal':{
  books:[{b:4,c:9,why:'旋转矩阵与正交'},{b:4,c:8,why:'旋转反射的矩阵'}],
  codes:[{b:4,c:13,f:'Bk4_Ch13_03.py',why:'旋转矩阵R的构造'},{b:4,c:8,f:'Bk4_Ch8_02.py',why:'旋转保长度'}],
  refs:[{k:'ladr',p:240,t:'7.C Positive Operators and Isometries',why:'等距变换=正交'},{k:'ladr',p:195,t:'6.B Orthonormal Bases',why:'正交基与转置即逆'}]
},
'la.least_squares':{
  books:[{b:3,c:24,why:'鸡兔同笼超定方程'},{b:7,c:2,why:'回归就是最小二乘'},{b:5,c:24,why:'线性回归的统计视角'}],
  codes:[{b:3,c:24,f:'Bk3_Ch24_1.py',why:'多组数据拟合直线'},{b:7,c:2,f:'Bk7_Ch02_01.ipynb',why:'一元回归拟合'}],
  refs:[{k:'ladr',p:208,t:'6.C Orthogonal Complements and Minimization Problems',why:'最小二乘=投影'}]
},
'la.null_space':{
  books:[{b:4,c:7,why:'四个子空间'},{b:4,c:16,why:'SVD给出零空间'}],
  codes:[{b:4,c:16,f:'Bk4_Ch16_01.py',why:'完整SVD看V的后几列'},{b:4,c:11,f:'Bk4_Ch11_01.py',why:'分解找被压扁的方向'}],
  refs:[{k:'ladr',p:75,t:'3.B Null Spaces and Ranges',why:'零空间与秩定理'}]
},

/* ===== 微积分 ca ===== */
'ca.derivative_slope':{
  books:[{b:3,c:15,why:'割线变切线'},{b:3,c:17,why:'微分即线性近似'}],
  codes:[{b:3,c:15,f:'Bk3_Ch15_03.py',why:'割线逼近切线动画'},{b:3,c:15,f:'Bk3_Ch15_04.py',why:'导函数与原函数并排'}],
  refs:[{k:'lifesaver',p:109,t:'5.2 Differentiability',why:'导数从极限定义'},{k:'lifesaver',p:139,t:'6.3 Finding the Equation of a Tangent Line',why:'切线方程写法'}]
},
'ca.integral_area':{
  books:[{b:3,c:18,why:'积分=细条求和'}],
  codes:[{b:3,c:18,f:'Bk3_Ch18_07.py',why:'矩形条越细越准'},{b:3,c:18,f:'Bk3_Ch18_01.py',why:'sympy定积分'}],
  refs:[{k:'lifesaver',p:339,t:'15.2 Displacement and Area',why:'面积为什么等于积分'},{k:'lifesaver',p:383,t:'17.2 The First Fundamental Theorem',why:'积分与导数互逆'}]
},
'ca.chain_rule':{
  books:[{b:3,c:15,why:'求导法则'},{b:3,c:16,why:'多元链式与偏导'}],
  codes:[{b:3,c:15,f:'Bk3_Ch15_04.py',why:'sympy diff自动剥层'}],
  refs:[{k:'lifesaver',p:127,t:'6.2 Finding Derivatives (the Nice Way)',why:'链式法则例题'}]
},
'ca.taylor':{
  books:[{b:3,c:17,why:'泰勒展开逐阶逼近'}],
  codes:[{b:3,c:17,f:'Bk3_Ch17_02.py',why:'e^x的多项式逼近'},{b:3,c:17,f:'Streamlit_Bk3_Ch17_02.py',why:'拖动阶数看逼近'}],
  refs:[{k:'lifesaver',p:544,t:'24.1 Approximations and Taylor Polynomials',why:'泰勒多项式怎么来'},{k:'lifesaver',p:565,t:'25.3 Estimation Problems Using the Error Term',why:'误差项估计'}]
},
'ca.gradient':{
  books:[{b:4,c:17,why:'梯度向量场'},{b:3,c:16,why:'偏导数拼成梯度'}],
  codes:[{b:4,c:17,f:'Bk4_Ch17_01.py',why:'画梯度箭头指向上坡'},{b:4,c:17,f:'Bk4_Ch17_03.py',why:'等高线与梯度垂直'}],
  refs:[{k:'rudin',p:216,t:'Ch9 Functions of Several Variables',why:'多元可微的严格定义'}]
},
'ca.optimization':{
  books:[{b:3,c:19,why:'优化入门：驻点与曲率'},{b:4,c:21,why:'正定性判极值'}],
  codes:[{b:3,c:19,f:'Bk3_Ch19_01.py',why:'一元函数找极值'},{b:3,c:19,f:'Bk3_Ch19_02.py',why:'二元优化scipy'}],
  refs:[{k:'lifesaver',p:250,t:'11.1 Extrema of Functions',why:'极值点判定'},{k:'lifesaver',p:264,t:'11.5 Classifying Points Where the Derivative Vanishes',why:'二阶导定弯向'}]
},
'ca.ode':{
  books:[{b:3,c:18,why:'积分反推原函数'},{b:6,c:8,why:'随机过程按规则演化'}],
  codes:[{b:3,c:18,f:'Bk3_Ch18_01.py',why:'积分即解最简微分方程'}],
  refs:[{k:'lifesaver',p:671,t:'30.2 Separable First-order Differential Equations',why:'分离变量解法'},{k:'lifesaver',p:690,t:'30.5 Modeling Using Differential Equations',why:'变化率建模例子'}]
},
'ca.limit':{
  books:[{b:3,c:15,why:'极限引出导数'},{b:3,c:14,why:'数列极限'}],
  codes:[{b:3,c:15,f:'Bk3_Ch15_01.py',why:'(1+1/x)^x逼近e'},{b:3,c:15,f:'Bk3_Ch15_02.py',why:'左右极限不同'}],
  refs:[{k:'lifesaver',p:66,t:'3.1 Limits: The Basic Idea',why:'极限直觉'},{k:'rudin',p:59,t:'Ch3 Numerical Sequences and Series',why:'ε-N严格定义'}]
},
'ca.partial_hessian':{
  books:[{b:3,c:16,why:'偏导数与二阶偏导'},{b:4,c:21,why:'Hessian正定看曲面'}],
  codes:[{b:3,c:16,f:'Bk3_Ch16_01.py',why:'一阶二阶偏导曲面'},{b:4,c:21,f:'Bk4_Ch21_01.py',why:'判正定'}],
  refs:[{k:'rudin',p:216,t:'Ch9 Functions of Several Variables',why:'偏导与全微分关系'}]
},
'ca.product_quotient':{
  books:[{b:3,c:15,why:'求导法则'}],
  codes:[{b:3,c:15,f:'Bk3_Ch15_04.py',why:'sympy验证乘积法则'}],
  refs:[{k:'lifesaver',p:127,t:'6.2 Finding Derivatives (the Nice Way)',why:'乘除法则与例题'}]
},
'ca.log_trick':{
  books:[{b:3,c:12,why:'对数函数性质'},{b:6,c:4,why:'数据取对数稳定数值'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_01.py',why:'对数轴'},{b:6,c:4,f:'Bk6_Ch04_01.ipynb',why:'对数变换'}],
  refs:[{k:'lifesaver',p:214,t:'9.5 Logarithmic Differentiation',why:'取对数再求导'}]
},
'ca.lagrange':{
  books:[{b:4,c:18,why:'拉格朗日乘子法'},{b:3,c:19,why:'约束优化入门'}],
  codes:[{b:4,c:17,f:'Bk4_Ch17_03.py',why:'等高线与约束相切处'},{b:3,c:19,f:'Bk3_Ch19_02.py',why:'带约束用scipy'}],
  refs:[{k:'rudin',p:216,t:'Ch9 Functions of Several Variables',why:'隐函数定理是根基'}]
},
'ca.integration_tricks':{
  books:[{b:3,c:18,why:'积分技巧与二重积分'}],
  codes:[{b:3,c:18,f:'Bk3_Ch18_02.py',why:'高斯积分sympy一行'},{b:3,c:18,f:'Bk3_Ch18_04.py',why:'二重积分'}],
  refs:[{k:'lifesaver',p:408,t:'18.1 Substitution',why:'换元套路'},{k:'lifesaver',p:418,t:'18.2 Integration by Parts',why:'分部选谁求导'}]
},

/* ===== 概率 pr ===== */
'pr.distribution':{
  books:[{b:5,c:5,why:'离散分布家族'},{b:5,c:7,why:'连续分布家族'},{b:5,c:1,why:'全景图先认路'}],
  codes:[{b:5,c:5,f:'Bk5_Ch05_03.py',why:'二项分布n变大的形状'},{b:5,c:7,f:'Bk5_Ch07_07.py',why:'指数分布等待时间'}],
  refs:[]
},
'pr.bayes':{
  books:[{b:5,c:8,why:'条件概率与贝叶斯'},{b:5,c:20,why:'贝叶斯推断先验到后验'},{b:5,c:18,why:'贝叶斯分类'}],
  codes:[{b:5,c:20,f:'Bk5_Ch20_01.py',why:'看数据一点点更新Beta后验'},{b:5,c:8,f:'Bk5_Ch08_01.py',why:'条件概率算贝叶斯'}],
  refs:[]
},
'pr.clt':{
  books:[{b:5,c:16,why:'样本均值分布'},{b:5,c:15,why:'蒙特卡洛看钟形冒出来'}],
  codes:[{b:5,c:16,f:'Bk5_Ch16_01.py',why:'掷骰子均值趋钟形'},{b:5,c:16,f:'Bk5_Ch16_02.py',why:'双峰总体样本均值也钟形'}],
  refs:[]
},
'pr.expectation':{
  books:[{b:5,c:4,why:'离散随机变量期望'},{b:5,c:2,why:'均值统计描述'}],
  codes:[{b:5,c:4,f:'Bk5_Ch04_01.py',why:'PMF加权求期望'},{b:5,c:2,f:'Bk5_Ch02_01.py',why:'样本均值'}],
  refs:[]
},
'pr.variance':{
  books:[{b:5,c:4,why:'方差定义'},{b:5,c:2,why:'样本方差与标准差'}],
  codes:[{b:5,c:4,f:'Bk5_Ch04_01.py',why:'离散变量方差'},{b:5,c:2,f:'Bk5_Ch02_01.py',why:'描述统计一次算完'}],
  refs:[]
},
'pr.covariance':{
  books:[{b:5,c:13,why:'协方差矩阵'},{b:5,c:10,why:'二元高斯里的相关系数'}],
  codes:[{b:5,c:13,f:'Bk5_Ch13_01.py',why:'协方差与相关矩阵热图'},{b:5,c:10,f:'Bk5_Ch10_02.py',why:'rho改椭圆倾斜'}],
  refs:[]
},
'pr.mle':{
  books:[{b:5,c:16,why:'频率派参数估计'},{b:5,c:17,why:'概率密度估计'}],
  codes:[{b:5,c:16,f:'Bk5_Ch16_03.py',why:'似然函数对mu、sigma求极值'},{b:5,c:17,f:'Bk5_Ch17_01.py',why:'拟合分布参数'}],
  refs:[]
},
'pr.entropy':{
  books:[{b:7,c:13,why:'决策树用熵分裂'},{b:5,c:4,why:'离散分布是熵的原料'}],
  codes:[{b:7,c:13,f:'Bk7_Ch13_01.ipynb',why:'信息增益'},{b:5,c:4,f:'Bk5_Ch04_01.py',why:'PMF算惊讶度'}],
  refs:[]
},
'pr.conditional':{
  books:[{b:5,c:8,why:'条件概率与独立'},{b:5,c:3,why:'古典概型数样本点'}],
  codes:[{b:5,c:8,f:'Bk5_Ch08_01.py',why:'缩小样本空间重新数'},{b:5,c:3,f:'Bk5_Ch03_01.py',why:'两骰子模拟'}],
  refs:[]
},
'pr.binomial_poisson':{
  books:[{b:5,c:5,why:'二项与泊松'}],
  codes:[{b:5,c:5,f:'Bk5_Ch05_03.py',why:'二项分布PMF'},{b:5,c:5,f:'Bk5_Ch05_05.py',why:'泊松lambda变化'}],
  refs:[]
},
'pr.gaussian':{
  books:[{b:5,c:9,why:'一元高斯'},{b:5,c:10,why:'二元高斯'}],
  codes:[{b:5,c:9,f:'Bk5_Ch09_01.py',why:'手写PDF'},{b:5,c:9,f:'Bk5_Ch09_03.py',why:'几个sigma覆盖多少'}],
  refs:[{k:'lifesaver',p:456,t:'20.1 Convergence and Divergence',why:'高斯积分为何收敛'}]
},
'pr.hypothesis':{
  books:[{b:5,c:16,why:'置信区间与检验'}],
  codes:[{b:5,c:16,f:'Bk5_Ch16_04.py',why:'z区间'},{b:5,c:16,f:'Bk5_Ch16_05.py',why:'t区间'}],
  refs:[]
},
'pr.map_prior':{
  books:[{b:5,c:20,why:'先验乘似然'},{b:7,c:5,why:'正则化就是先验'},{b:7,c:6,why:'贝叶斯回归'}],
  codes:[{b:5,c:20,f:'Bk5_Ch20_01.py',why:'先验强弱影响后验'},{b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'L2惩罚项'}],
  refs:[]
},

/* ===== 组合 co ===== */
'co.perm_comb':{
  books:[{b:3,c:4,why:'排列组合枚举'},{b:5,c:3,why:'古典概型计数'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_06.py',why:'combinations枚举'},{b:3,c:4,f:'Bk3_Ch4_07.py',why:'permutations枚举'}],
  refs:[{k:'vedic',p:141,t:'3. Multiplication',why:'连乘阶乘心算'}]
},
'co.pigeonhole':{
  books:[{b:3,c:4,why:'集合与计数'},{b:5,c:3,why:'古典概型的反面'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_01.py',why:'集合运算'}],
  refs:[]
},
'co.binomial':{
  books:[{b:3,c:4,why:'二项展开'},{b:5,c:5,why:'二项分布系数'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_05.py',why:'展开看杨辉三角'},{b:5,c:5,f:'Bk5_Ch05_03.py',why:'系数乘概率'}],
  refs:[{k:'vedic',p:33,t:'3. Urdhva - tiryagbhyam',why:'竖乘横加与多项式乘法同构'}]
},
'co.recursion':{
  books:[{b:3,c:14,why:'斐波那契递推'},{b:1,c:8,why:'Python递归函数'}],
  codes:[{b:3,c:14,f:'Bk3_Ch14_03.py',why:'fib递归'},{b:1,c:8,f:'Bk1_Ch08_01.ipynb',why:'函数调用自己'}],
  refs:[{k:'lifesaver',p:502,t:'22.1 Convergence and Divergence of Sequences',why:'递推数列的极限'}]
},
'co.inclusion_exclusion':{
  books:[{b:3,c:4,why:'集合并交补'},{b:5,c:3,why:'事件并的概率'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_01.py',why:'并集交集差集'}],
  refs:[]
},
'co.generating':{
  books:[{b:3,c:4,why:'多项式乘法与系数'},{b:3,c:14,why:'级数求和'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_05.py',why:'展开读系数'},{b:3,c:14,f:'Bk3_Ch14_05.py',why:'sympy符号求和'}],
  refs:[{k:'lifesaver',p:551,t:'24.2 Power Series and Taylor Series',why:'幂级数就是生成函数'}]
},
'co.graph_count':{
  books:[{b:6,c:11,why:'无向图度数'},{b:6,c:18,why:'图变矩阵数边'}],
  codes:[{b:6,c:11,f:'Bk6_Ch11_01.ipynb',why:'建图数度'},{b:6,c:18,f:'Bk6_Ch18_01.ipynb',why:'邻接矩阵行和=度'}],
  refs:[]
},
'co.stars_bars':{
  books:[{b:3,c:4,why:'组合计数'},{b:5,c:5,why:'多项分布的组合数'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_06.py',why:'组合数枚举'},{b:5,c:5,f:'Bk5_Ch05_04.py',why:'多项分布'}],
  refs:[]
},
'co.multiplication_rule':{
  books:[{b:3,c:4,why:'排列组合的根'},{b:5,c:3,why:'样本空间大小'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_08.py',why:'全排列个数=n!'},{b:5,c:3,f:'Bk5_Ch03_01.py',why:'两骰子36种'}],
  refs:[{k:'vedic',p:141,t:'3. Multiplication',why:'乘法心算'}]
},
'co.circular_repeat':{
  books:[{b:3,c:4,why:'排列枚举'},{b:3,c:2,why:'阶乘计算'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_08.py',why:'全排列看重复'},{b:3,c:2,f:'Bk3_Ch2_02.py',why:'阶乘'}],
  refs:[]
},
'co.catalan':{
  books:[{b:6,c:22,why:'树结构计数'},{b:3,c:14,why:'递推数列'}],
  codes:[{b:6,c:22,f:'Bk6_Ch22_01.ipynb',why:'二叉树画法'},{b:3,c:14,f:'Bk3_Ch14_03.py',why:'递推写法'}],
  refs:[]
},
'co.complement':{
  books:[{b:5,c:3,why:'补事件概率'},{b:3,c:4,why:'集合补集'}],
  codes:[{b:5,c:3,f:'Bk5_Ch03_02.py',why:'至少一次正面=1减全反'},{b:3,c:4,f:'Bk3_Ch4_01.py',why:'差集'}],
  refs:[{k:'vedic',p:20,t:'2. Nikhilam navatascaramam Dasatah',why:'补数思维的心算版'}]
},
'co.bijection':{
  books:[{b:3,c:4,why:'集合与映射'},{b:3,c:10,why:'函数单射满射'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_01.py',why:'集合基数'}],
  refs:[{k:'ladr',p:96,t:'3.D Invertibility and Isomorphic Vector Spaces',why:'同构=一一对应'}]
},

/* ===== 离散 di ===== */
'di.modular':{
  books:[{b:3,c:2,why:'余数运算'},{b:2,c:30,why:'模乘圆上的心形线'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_05.py',why:'%取余'},{b:2,c:30,f:'Streamlit_modular_multiplication_circle.py',why:'模乘法画出图案'}],
  refs:[{k:'vedic',p:146,t:'4. Division',why:'余数速算'}]
},
'di.prime':{
  books:[{b:3,c:2,why:'整除与因数'},{b:1,c:7,why:'循环写试除'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_05.py',why:'余数判整除'},{b:1,c:7,f:'Bk1_Ch07_01.ipynb',why:'for循环试除'}],
  refs:[{k:'vedic',p:146,t:'4. Division',why:'快速试除'}]
},
'di.gcd':{
  books:[{b:3,c:2,why:'除法与余数'},{b:1,c:8,why:'递归写辗转相除'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_05.py',why:'一步取余'},{b:1,c:8,f:'Bk1_Ch08_01.ipynb',why:'函数递归'}],
  refs:[{k:'vedic',p:146,t:'4. Division',why:'连续除法心算'}]
},
'di.graph':{
  books:[{b:6,c:10,why:'图论入门'},{b:6,c:18,why:'邻接矩阵'},{b:6,c:15,why:'路径'}],
  codes:[{b:6,c:18,f:'Bk6_Ch18_01.ipynb',why:'图转邻接矩阵'},{b:6,c:15,f:'Bk6_Ch15_01.ipynb',why:'找路径'}],
  refs:[]
},
'di.logic':{
  books:[{b:1,c:6,why:'布尔运算'},{b:1,c:7,why:'if条件分支'}],
  codes:[{b:1,c:6,f:'Bk1_Ch06_01.ipynb',why:'and or not'},{b:1,c:7,f:'Bk1_Ch07_01.ipynb',why:'条件判断'}],
  refs:[{k:'rudin',p:13,t:'Ch1 The Real and Complex Number Systems',why:'公理化证明的写法'}]
},
'di.induction':{
  books:[{b:3,c:14,why:'数列递推'},{b:3,c:1,why:'累加公式'}],
  codes:[{b:3,c:14,f:'Bk3_Ch14_01.py',why:'等差求和公式验证'},{b:3,c:1,f:'Bk3_Ch1_06.py',why:'cumsum逐步验证'}],
  refs:[{k:'rudin',p:13,t:'Ch1 The Real and Complex Number Systems',why:'归纳法严格用法'}]
},
'di.bits':{
  books:[{b:1,c:6,why:'位运算符'},{b:1,c:5,why:'整数类型'}],
  codes:[{b:1,c:6,f:'Bk1_Ch06_01.ipynb',why:'位运算'},{b:1,c:5,f:'Bk1_Ch05_01.ipynb',why:'整数与二进制'}],
  refs:[]
},
'di.big_o':{
  books:[{b:3,c:12,why:'指数、幂、对数增长对比'},{b:3,c:14,why:'数列增长率'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_01.py',why:'对数轴看增长快慢'},{b:3,c:11,f:'Bk3_Ch11_01.py',why:'幂函数指数越大越陡'}],
  refs:[{k:'lifesaver',p:481,t:'21.3 Behavior of Common Functions near Infinity',why:'谁涨得快的排序'}]
},
'di.divisibility':{
  books:[{b:3,c:2,why:'整除与余数'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_05.py',why:'取余判整除'}],
  refs:[{k:'vedic',p:146,t:'4. Division',why:'整除口诀'},{k:'vedic',p:9,t:'1. Ekadhikena Purvena',why:'9与11的整除源'}]
},
'di.fermat_fastpow':{
  books:[{b:3,c:2,why:'幂与取余'},{b:4,c:4,why:'矩阵幂同样二进制拆'}],
  codes:[{b:4,c:4,f:'Bk4_Ch4_08.py',why:'矩阵幂'},{b:3,c:2,f:'Bk3_Ch2_05.py',why:'取余'}],
  refs:[{k:'vedic',p:9,t:'1. Ekadhikena Purvena',why:'循环小数与费马周期'}]
},
'di.set_function':{
  books:[{b:3,c:4,why:'集合运算'},{b:3,c:10,why:'函数定义域值域'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_01.py',why:'集合并交'},{b:3,c:10,f:'Bk3_Ch10_01.py',why:'函数单调性'}],
  refs:[{k:'ladr',p:96,t:'3.D Invertibility and Isomorphic Vector Spaces',why:'单射满射双射'},{k:'rudin',p:36,t:'Ch2 Basic Topology',why:'集合与可数性'}]
},
'di.crt':{
  books:[{b:3,c:2,why:'余数运算'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_05.py',why:'取余'}],
  refs:[{k:'vedic',p:43,t:'4. Paravartya Yojayet',why:'换号法解同余'}]
},
'di.base_convert':{
  books:[{b:1,c:5,why:'整数进制表示'},{b:1,c:6,why:'整除与取余运算'}],
  codes:[{b:1,c:5,f:'Bk1_Ch05_01.ipynb',why:'bin hex转换'},{b:1,c:6,f:'Bk1_Ch06_01.ipynb',why:'//和%'}],
  refs:[{k:'vedic',p:118,t:'1. Terms and Operations',why:'位值制底层'}]
}

});
