/* 新大陆节点 -> 鸢尾花书章节·小节 / 代码文件 / 英文书 的映射。
   code_c: pt PyTorch / si 统计推断 / ex 实验设计与因果 / gm 生成模型 / lm 语言模型
   math_c: op 优化 / it 信息论 / fo 傅里叶 / cx 复数 / vd 吠陀速算
   b=书号 c=章号 s=小节号 f=代码文件名 k=refs.js 键 p=PDF 页码。
   书里没有的主题，挂最接近的方法章，why 以「借：」开头。 */
window.REFMAP=window.REFMAP||{};
Object.assign(window.REFMAP,{

/* ================= pt PyTorch ================= */
'pt.tensor':{
  books:[{b:1,c:13,s:'13.2',why:'借：ndarray 就是张量的底子'},
         {b:1,c:15,s:'15.2',why:'借：广播规则和张量完全一致'}],
  codes:[{b:1,c:13,f:'Bk1_Ch13_01.ipynb',why:'手动造数组看形状与类型'},
         {b:1,c:15,f:'Bk1_Ch15_01.ipynb',why:'逐元素运算，感受形状对齐'}],
  refs:[]
},
'pt.autograd':{
  books:[{b:3,c:15,s:'15.4',why:'借：导数=切线斜率，反传发的就是它'},
         {b:3,c:17,s:'17.1',why:'借：微分即线性近似，链式法则的地基'}],
  codes:[{b:3,c:15,f:'Bk3_Ch15_01.py',why:'画切线，看导数是怎么来的'},
         {b:3,c:17,f:'Bk3_Ch17_01.py',why:'线性近似逼近曲线'}],
  refs:[{k:'lifesaver',p:127,t:'6.2 Finding Derivatives (the Nice Way)',why:'链式法则的标准练法'}]
},
'pt.requires_grad':{
  books:[{b:1,c:14,s:'14.3',why:'借：视图 vs 副本，就是共享还是切断'},
         {b:3,c:16,s:'16.2',why:'借：偏导也是函数，决定哪条线要记账'}],
  codes:[{b:1,c:14,f:'Bk1_Ch14_01.ipynb',why:'改视图会改到原数组，体会没切断'},
         {b:3,c:16,f:'Bk3_Ch16_01.py',why:'偏导曲面，看梯度沿哪一维走'}],
  refs:[]
},
'pt.module':{
  books:[{b:1,c:9,s:'9.2',why:'借：定义属性=参数登记'},
         {b:1,c:9,s:'9.5',why:'借：继承父类就是搭 Module'}],
  codes:[{b:1,c:9,f:'Bk1_Ch09_01.ipynb',why:'类与实例，看属性存在哪'},
         {b:1,c:9,f:'Bk1_Ch09_07.ipynb',why:'继承父类，复用已有逻辑'}],
  refs:[]
},
'pt.optimizer':{
  books:[{b:3,c:19,s:'19.1',why:'借：优化就是找谷底，step 是一步'},
         {b:7,c:5,s:'5.1',why:'借：正则化项也进同一个目标函数'}],
  codes:[{b:3,c:19,f:'Bk3_Ch19_01.py',why:'一元极值，看往哪走'},
         {b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'加惩罚项后参数怎么变'}],
  refs:[{k:'lifesaver',p:292,t:'13.1 Optimization',why:'最优化的手算范式'}]
},
'pt.dataloader':{
  books:[{b:1,c:22,s:'22.2',why:'借：拼接就是 collate'},
         {b:1,c:29,s:'29.7',why:'借：切训练/测试集就是最简单的采样'}],
  codes:[{b:1,c:22,f:'Bk1_Ch22_02.ipynb',why:'把多条拼成一张表'},
         {b:1,c:29,f:'Bk1_Ch29_06.ipynb',why:'随机划分数据集'}],
  refs:[]
},
'pt.train_eval':{
  books:[{b:7,c:5,s:'5.1',why:'借：过拟合与抑制，正是两个模式的用意'},
         {b:1,c:29,s:'29.7',why:'借：训练与评估必须分开'}],
  codes:[{b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'训练集好测试集差是什么样'},
         {b:1,c:29,f:'Bk1_Ch29_06.ipynb',why:'划分后分别评估'}],
  refs:[]
},
'pt.device':{
  books:[{b:1,c:16,s:'16.1',why:'借：reshape 只改视图不搬数据'},
         {b:1,c:13,s:'13.7',why:'借：数组进出内存的开销'}],
  codes:[{b:1,c:16,f:'Bk1_Ch16_01.ipynb',why:'reshape 前后内存是否复制'},
         {b:1,c:13,f:'Bk1_Ch13_02.ipynb',why:'数组导入导出，看搬运成本'}],
  refs:[]
},
'pt.save_load':{
  books:[{b:1,c:13,s:'13.7',why:'借：存数组不存代码，权重同理'}],
  codes:[{b:1,c:13,f:'Bk1_Ch13_02.ipynb',why:'保存再读回，比对一致性'}],
  refs:[]
},
'pt.amp':{
  books:[{b:3,c:1,s:'1.1',why:'借：数字的表示精度与量级'},
         {b:1,c:15,s:'15.1',why:'借：加乘的误差累积在哪一步'}],
  codes:[{b:3,c:1,f:'Bk3_Ch1_01.py',why:'看数的精度与舍入'},
         {b:1,c:15,f:'Bk1_Ch15_01.ipynb',why:'改 dtype 看结果差多少'}],
  refs:[]
},
'pt.debug_shape':{
  books:[{b:1,c:16,s:'16.1',why:'借：reshape 报错就是形状不对'},
         {b:1,c:15,s:'15.2',why:'借：广播规则决定能不能对齐'},
         {b:4,c:4,s:'4.5',why:'借：矩阵乘法维度必须咬合'}],
  codes:[{b:1,c:16,f:'Bk1_Ch16_01.ipynb',why:'故意 reshape 错看报错'},
         {b:1,c:15,f:'Bk1_Ch15_02.ipynb',why:'广播成功与失败的边界'}],
  refs:[{k:'ladr',p:90,t:'Matrix Multiplication',why:'维度咬合的严格说法'}]
},

/* ================= si 统计推断 ================= */
'si.estimate_vs_test':{
  books:[{b:5,c:16,s:'16.2',why:'频率派工具箱：估计与检验各管一半'},
         {b:7,c:2,s:'2.9',why:'t 检验只回答“是不是 0”'}],
  codes:[{b:5,c:16,f:'Bk5_Ch16_01.py',why:'先做点估计再看区间'},
         {b:7,c:2,f:'Bk7_Ch02_02.ipynb',why:'回归输出里估计与 p 值并排'}],
  refs:[]
},
'si.pvalue':{
  books:[{b:7,c:2,s:'2.9',why:'p 值在回归表里怎么算出来'},
         {b:5,c:16,s:'16.3',why:'零假设分布靠中心极限定理'}],
  codes:[{b:7,c:2,f:'Bk7_Ch02_02.ipynb',why:'看回归系数的 t 与 p'},
         {b:5,c:16,f:'Bk5_Ch16_03.py',why:'抽样分布怎么逼近正态'}],
  refs:[]
},
'si.confidence_interval':{
  books:[{b:5,c:16,s:'16.7',why:'区间估计的完整推导'},
         {b:5,c:9,s:'9.4',why:'68-95-99.7 给区间宽度的直觉'}],
  codes:[{b:5,c:16,f:'Bk5_Ch16_06.py',why:'算区间，改样本量看它变窄'},
         {b:5,c:9,f:'Bk5_Ch09_04.py',why:'标准差与覆盖率的对应'}],
  refs:[{k:'rudin',p:59,t:'3. Convergent Sequences',why:'“长期命中率”的收敛语言'}]
},
'si.effect_size':{
  books:[{b:5,c:9,s:'9.3',why:'标准化后差值才能跨实验比'},
         {b:6,c:4,s:'4.3',why:'Z 分数就是除以噪声'}],
  codes:[{b:5,c:9,f:'Bk5_Ch09_03.py',why:'标准高斯，看单位是标准差'},
         {b:6,c:4,f:'Bk6_Ch04_03.ipynb',why:'跑标准化，看量纲被消掉'}],
  refs:[]
},
'si.power':{
  books:[{b:5,c:16,s:'16.3',why:'样本量怎么把抽样分布收窄'},
         {b:5,c:15,s:'15.1',why:'借：功效可以直接模拟出来'}],
  codes:[{b:5,c:16,f:'Bk5_Ch16_03.py',why:'改 n 看分布变窄'},
         {b:5,c:15,f:'Bk5_Ch15_01.py',why:'蒙特卡洛模拟功效'}],
  refs:[{k:'rudin',p:59,t:'3. Convergent Sequences',why:'n 增大时收敛的严格版'}]
},
'si.multiple_testing':{
  books:[{b:5,c:5,s:'5.4',why:'借：20 次里出 1 次就是二项分布'},
         {b:5,c:3,s:'3.7',why:'借：全概率视角看“至少一次”'}],
  codes:[{b:5,c:5,f:'Bk5_Ch05_04.py',why:'算至少一次假阳性的概率'},
         {b:5,c:3,f:'Bk5_Ch03_02.py',why:'穷举事件，看概率怎么累起来'}],
  refs:[]
},
'si.bootstrap':{
  books:[{b:5,c:15,s:'15.1',why:'借：重抽样就是蒙特卡洛'},
         {b:5,c:17,s:'17.1',why:'借：样本经验分布当总体'}],
  codes:[{b:5,c:15,f:'Bk5_Ch15_01.py',why:'伪随机重抽，看统计量分布'},
         {b:5,c:17,f:'Bk5_Ch17_01.py',why:'直方图就是经验分布'}],
  refs:[]
},
'si.permutation':{
  books:[{b:5,c:15,s:'15.8',why:'借：打乱标签等于随机漫步式模拟'},
         {b:5,c:3,s:'3.1',why:'借：等可能假设正是置换的前提'}],
  codes:[{b:5,c:15,f:'Bk5_Ch15_08.py',why:'随机重排跑出零分布'},
         {b:5,c:3,f:'Bk5_Ch03_01.py',why:'古典概型里的等可能'}],
  refs:[]
},
'si.bayes_factor':{
  books:[{b:5,c:20,s:'20.1',why:'贝叶斯推断的整体框架'},
         {b:5,c:19,s:'19.1',why:'似然是 BF 的分子分母'}],
  codes:[{b:5,c:20,f:'Bk5_Ch20_01.py',why:'先验后验一起画'},
         {b:5,c:19,f:'Bk5_Ch19_01.py',why:'算两个模型下的似然'}],
  refs:[]
},
'si.preregistration':{
  books:[{b:7,c:2,s:'2.13',why:'借：信息准则=事先定好的选模型规则'},
         {b:7,c:5,s:'5.1',why:'借：不预先约束就会拟合噪声'}],
  codes:[{b:7,c:2,f:'Bk7_Ch02_03.ipynb',why:'按准则选模型而不是按结果选'},
         {b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'看事后调参怎么骗自己'}],
  refs:[]
},
'si.assumptions':{
  books:[{b:5,c:7,s:'7.4',why:'厚尾时用 t 不用正态'},
         {b:5,c:4,s:'4.8',why:'独立性的准确定义'},
         {b:6,c:3,s:'3.4',why:'QQ 图检查分布形状'}],
  codes:[{b:5,c:7,f:'Bk5_Ch07_04.py',why:'t 与正态的尾巴差别'},
         {b:6,c:3,f:'Bk6_Ch03_02.ipynb',why:'画 QQ 图判断偏离'}],
  refs:[]
},

/* ================= ex 实验设计与因果 ================= */
'ex.randomization':{
  books:[{b:5,c:3,s:'3.1',why:'借：随机的数学定义在这'},
         {b:5,c:15,s:'15.1',why:'借：伪随机发生器怎么做分配'}],
  codes:[{b:5,c:3,f:'Bk5_Ch03_01.py',why:'等可能抽样最小例子'},
         {b:5,c:15,f:'Bk5_Ch15_01.py',why:'跑随机分配，看组间平衡'}],
  refs:[]
},
'ex.control_blinding':{
  books:[{b:1,c:29,s:'29.7',why:'借：留出集就是“没看过”的对照'},
         {b:5,c:2,s:'2.1',why:'借：描述与推断分工，防止先看后编'}],
  codes:[{b:1,c:29,f:'Bk1_Ch29_06.ipynb',why:'划分数据，测试集不许偷看'},
         {b:5,c:2,f:'Bk5_Ch02_01.py',why:'先只做描述统计'}],
  refs:[]
},
'ex.confounder':{
  books:[{b:5,c:4,s:'4.5',why:'借：协方差量的是相关不是因果'},
         {b:6,c:19,s:'19.3',why:'借：相关性矩阵里找可疑第三者'}],
  codes:[{b:5,c:4,f:'Bk5_Ch04_02.py',why:'算协方差与相关系数'},
         {b:6,c:19,f:'Bk6_Ch19_03.ipynb',why:'相关矩阵热图，看谁跟谁都相关'}],
  refs:[]
},
'ex.dag':{
  books:[{b:6,c:12,s:'12.1',why:'借：有向图=DAG 的画法与术语'},
         {b:6,c:18,s:'18.2',why:'借：有向图到邻接矩阵，路径可算'}],
  codes:[{b:6,c:12,f:'Bk6_Ch12_01.ipynb',why:'画有向图，认链、叉、对撞'},
         {b:6,c:18,f:'Bk6_Ch18_02.ipynb',why:'邻接矩阵幂次=几步能到'}],
  refs:[]
},
'ex.backdoor':{
  books:[{b:6,c:15,s:'15.2',why:'借：后门就是图上的一类路径问题'},
         {b:6,c:16,s:'16.1',why:'借：堵路=破坏连通性'}],
  codes:[{b:6,c:15,f:'Bk6_Ch15_02.ipynb',why:'枚举两点间所有路径'},
         {b:6,c:16,f:'Bk6_Ch16_01.ipynb',why:'删点后还通不通'}],
  refs:[]
},
'ex.ab_sequential':{
  books:[{b:5,c:16,s:'16.3',why:'借：固定 n 的检验才有 5%'},
         {b:5,c:15,s:'15.8',why:'借：边看边停就是随机漫步撞边界'}],
  codes:[{b:5,c:15,f:'Bk5_Ch15_08.py',why:'随机漫步会碰到阈值多少次'},
         {b:5,c:16,f:'Bk5_Ch16_03.py',why:'固定 n 的抽样分布长什么样'}],
  refs:[]
},
'ex.batch_design':{
  books:[{b:6,c:4,s:'4.1',why:'借：批次效应先看转换与标准化'},
         {b:5,c:13,s:'13.1',why:'借：协方差矩阵能看出两因素同向'}],
  codes:[{b:6,c:4,f:'Bk6_Ch04_01.ipynb',why:'转换前后分布怎么变'},
         {b:5,c:13,f:'Bk5_Ch13_01.py',why:'算协方差，看两列是否共线'}],
  refs:[]
},
'ex.replicate_level':{
  books:[{b:5,c:4,s:'4.8',why:'独立性决定哪个才算一个 n'},
         {b:5,c:16,s:'16.5',why:'借：方差估计里的 n 是谁'}],
  codes:[{b:5,c:4,f:'Bk5_Ch04_01.py',why:'独立与不独立的联合分布对比'},
         {b:5,c:16,f:'Bk5_Ch16_05.py',why:'n 变了方差估计怎么变'}],
  refs:[]
},
'ex.simpson':{
  books:[{b:5,c:8,s:'8.1',why:'条件期望与总期望的差别'},
         {b:1,c:23,s:'23.8',why:'借：全集与子集的均值钻取'}],
  codes:[{b:5,c:8,f:'Bk5_Ch08_01.py',why:'分组算条件期望再合并'},
         {b:1,c:23,f:'Bk1_Ch23_01.ipynb',why:'交互图里切换全集/子集'}],
  refs:[]
},
'ex.selection_bias':{
  books:[{b:6,c:3,s:'3.5',why:'借：剔除离群值本身就是一次选择'},
         {b:5,c:19,s:'19.5',why:'借：条件化会造出假的相关'}],
  codes:[{b:6,c:3,f:'Bk6_Ch03_01.ipynb',why:'删掉尾巴后结论怎么变'},
         {b:5,c:19,f:'Bk5_Ch19_01.py',why:'独立与条件独立的反例'}],
  refs:[]
},

/* ================= gm 生成模型 ================= */
'gm.autoregressive':{
  books:[{b:5,c:8,s:'8.1',why:'借：条件概率链式分解的原型'},
         {b:6,c:20,s:'20.3',why:'借：马尔科夫链就是一步步生成'}],
  codes:[{b:5,c:8,f:'Bk5_Ch08_01.py',why:'条件分布怎么一层层算'},
         {b:6,c:20,f:'Bk6_Ch20_03.ipynb',why:'转移矩阵逐步生成序列'}],
  refs:[]
},
'gm.vae':{
  books:[{b:5,c:12,s:'12.1',why:'借：潜变量与观测的联合/条件关系'},
         {b:5,c:11,s:'11.1',why:'借：先验取多元高斯的原因'}],
  codes:[{b:5,c:12,f:'Bk5_Ch12_01.py',why:'条件高斯的形状怎么被压回去'},
         {b:5,c:11,f:'Bk5_Ch11_01.py',why:'多元高斯采样'}],
  refs:[]
},
'gm.gan':{
  books:[{b:3,c:19,s:'19.2',why:'借：先学会写目标函数再谈博弈'},
         {b:7,c:11,s:'11.1',why:'借：SVM 的最大最小间隔是同类结构'}],
  codes:[{b:3,c:19,f:'Bk3_Ch19_02.py',why:'构造并求解一个优化问题'},
         {b:7,c:11,f:'Bk7_Ch11_01.ipynb',why:'看两方对抗式的边界怎么定'}],
  refs:[]
},
'gm.diffusion':{
  books:[{b:6,c:8,s:'8.1',why:'借：布朗运动就是正向加噪'},
         {b:5,c:15,s:'15.9',why:'借：高斯相加还是高斯，才能一步跳'}],
  codes:[{b:6,c:8,f:'Bk6_Ch8_01.ipynb',why:'跑布朗运动，看噪声累积'},
         {b:5,c:15,f:'Bk5_Ch15_09.py',why:'两个高斯相加的方差怎么合'}],
  refs:[]
},
'gm.flow':{
  books:[{b:4,c:8,s:'8.1',why:'借：可逆线性变换的最简版'},
         {b:3,c:18,s:'18.6',why:'借：换元积分里的体积因子'}],
  codes:[{b:4,c:8,f:'Bk4_Ch8_01.py',why:'看变换怎么拉伸面积'},
         {b:3,c:18,f:'Bk3_Ch18_06.py',why:'二重积分的面积元'}],
  refs:[{k:'ladr',p:322,t:'10.B Determinant',why:'行列式=体积缩放因子'}]
},
'gm.temperature':{
  books:[{b:5,c:5,s:'5.1',why:'借：分布的形状由参数决定'},
         {b:7,c:4,s:'4.5',why:'借：逻辑函数的陡峭度'}],
  codes:[{b:5,c:5,f:'Bk5_Ch05_01.py',why:'改参数看分布变尖变平'},
         {b:7,c:4,f:'Bk7_Ch04_05.ipynb',why:'逻辑函数的斜率就是温度的倒数'}],
  refs:[]
},
'gm.fid':{
  books:[{b:5,c:23,s:'23.1',why:'借：马氏距离=考虑分布的距离'},
         {b:5,c:11,s:'11.1',why:'借：两团高斯用均值和协方差比'}],
  codes:[{b:5,c:23,f:'Bk5_Ch23_01.py',why:'算两团点的马氏距离'},
         {b:5,c:11,f:'Bk5_Ch11_01.py',why:'多元高斯的均值协方差'}],
  refs:[]
},
'gm.conditional':{
  books:[{b:5,c:12,s:'12.1',why:'借：条件生成=条件分布'},
         {b:5,c:18,s:'18.1',why:'借：贝叶斯定理给引导的方向'}],
  codes:[{b:5,c:12,f:'Bk5_Ch12_02.py',why:'给定一维后另一维分布怎么缩'},
         {b:5,c:18,f:'Bk5_Ch18_01.py',why:'后验=先验乘似然'}],
  refs:[]
},
'gm.latent_space':{
  books:[{b:4,c:7,s:'7.3',why:'借：张成空间里的直线插值'},
         {b:7,c:14,s:'14.1',why:'借：PCA 是最简单的潜空间'}],
  codes:[{b:4,c:7,f:'Streamlit_Bk4_Ch7_01.py',why:'拖系数看线性组合怎么连续变'},
         {b:7,c:14,f:'Bk7_Ch14_01.ipynb',why:'主成分坐标下移动一格看什么变'}],
  refs:[{k:'ladr',p:45,t:'Linear Combinations and Span',why:'张成与插值的严格说法'}]
},
'gm.protein_design':{
  books:[{b:7,c:8,s:'8.1',why:'借：生成后要按近邻排序筛候选'},
         {b:7,c:24,s:'24.1',why:'借：聚类去冗余，别把一族当十个'}],
  codes:[{b:7,c:8,f:'Bk7_Ch08_01.ipynb',why:'按距离排序取前 k 个'},
         {b:7,c:24,f:'Bk7_Ch24_01.ipynb',why:'密度聚类合并相似候选'}],
  refs:[]
},

/* ================= lm 语言模型 ================= */
'lm.tokenization':{
  books:[{b:1,c:5,s:'5.3',why:'借：字符串是切分的原料'},
         {b:1,c:22,s:'22.9',why:'借：apply 做自定义切分'}],
  codes:[{b:1,c:5,f:'Bk1_Ch05_03.ipynb',why:'字符串切片与编码'},
         {b:1,c:22,f:'Bk1_Ch22_09.ipynb',why:'自定义函数逐条处理文本'}],
  refs:[]
},
'lm.embedding':{
  books:[{b:4,c:7,s:'7.1',why:'借：意义=向量空间里的一个点'},
         {b:4,c:2,s:'2.7',why:'借：余弦相似度就是夹角'}],
  codes:[{b:4,c:2,f:'Bk4_Ch2_07.py',why:'算夹角余弦，比距离更稳'},
         {b:4,c:7,f:'Streamlit_Bk4_Ch7_01.py',why:'看基底与坐标的关系'}],
  refs:[{k:'ladr',p:179,t:'Inner Products',why:'内积与夹角的定义'}]
},
'lm.causal_mask':{
  books:[{b:4,c:6,s:'6.1',why:'借：上三角就是分块矩阵的一种'},
         {b:6,c:18,s:'18.2',why:'借：有向边=只许往一个方向看'}],
  codes:[{b:4,c:6,f:'Bk4_Ch6_01.py',why:'构造上/下三角块看结构'},
         {b:6,c:18,f:'Bk6_Ch18_02.ipynb',why:'有向图邻接矩阵不对称'}],
  refs:[]
},
'lm.kv_cache':{
  books:[{b:4,c:5,s:'5.10',why:'借：矩阵乘法可以按列增量算'},
         {b:1,c:16,s:'16.11',why:'借：分块拼接就是缓存追加'}],
  codes:[{b:4,c:5,f:'Bk4_Ch5_01.py',why:'按列拆开矩阵乘法'},
         {b:1,c:16,f:'Bk1_Ch16_02.ipynb',why:'数组分块与拼接'}],
  refs:[]
},
'lm.context_window':{
  books:[{b:6,c:6,s:'6.3',why:'借：长序列里趋势与噪声怎么分'},
         {b:1,c:21,s:'21.5',why:'借：条件索引=只取窗口内那段'}],
  codes:[{b:6,c:6,f:'Bk6_Ch6_03.ipynb',why:'长序列里提取趋势'},
         {b:1,c:21,f:'Bk1_Ch21_05.ipynb',why:'按条件截取一段数据'}],
  refs:[]
},
'lm.finetune_vs_prompt':{
  books:[{b:7,c:5,s:'5.1',why:'借：小数据微调最容易过拟合'},
         {b:1,c:29,s:'29.7',why:'借：先划验证集再决定改不改模型'}],
  codes:[{b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'看样本少时正则化多重要'},
         {b:1,c:29,f:'Bk1_Ch29_06.ipynb',why:'留出集判断有没有真变好'}],
  refs:[]
},
'lm.rag':{
  books:[{b:6,c:19,s:'19.2',why:'借：亲近度矩阵就是检索打分'},
         {b:7,c:8,s:'8.1',why:'借：召回 top-k 就是最近邻'}],
  codes:[{b:6,c:19,f:'Bk6_Ch19_02.ipynb',why:'核函数算相似度矩阵'},
         {b:7,c:8,f:'Bk7_Ch08_01.ipynb',why:'k 变大变小，召回怎么变'}],
  refs:[{k:'ladr',p:179,t:'Inner Products',why:'相似度=内积的几何'}]
},
'lm.hallucination':{
  books:[{b:5,c:5,s:'5.1',why:'借：模型只是个分布，不含真值'},
         {b:7,c:13,s:'13.2',why:'借：熵能说明它到底有多不确定'}],
  codes:[{b:5,c:5,f:'Bk5_Ch05_01.py',why:'从分布里采样必然有低概率项'},
         {b:7,c:13,f:'Bk7_Ch13_01.ipynb',why:'算熵，看不确定性怎么量化'}],
  refs:[]
},
'lm.eval_align':{
  books:[{b:7,c:2,s:'2.7',why:'借：先有评价指标才谈改进'},
         {b:1,c:29,s:'29.7',why:'借：评测集必须独立于训练'}],
  codes:[{b:7,c:2,f:'Bk7_Ch02_01.ipynb',why:'算拟合优度这类硬指标'},
         {b:1,c:29,f:'Bk1_Ch29_06.ipynb',why:'划分出干净的评测集'}],
  refs:[]
},
'lm.research_use':{
  books:[{b:7,c:1,s:'1.6',why:'借：机器学习流程=先定验证再上模型'},
         {b:7,c:2,s:'2.13',why:'借：用准则而不是感觉判断好坏'}],
  codes:[{b:7,c:2,f:'Bk7_Ch02_03.ipynb',why:'按信息准则做选择'},
         {b:1,c:29,f:'Bk1_Ch29_06.ipynb',why:'凡输出都先过一遍留出验证'}],
  refs:[]
},

/* ================= op 优化 ================= */
'op.convex':{
  books:[{b:4,c:21,s:'21.1',why:'正定=碗形，凸性的矩阵判据'},
         {b:3,c:19,s:'19.4',why:'一元极值点判定的完整规则'}],
  codes:[{b:4,c:21,f:'Bk4_Ch21_01.py',why:'画正定曲面，看只有一个底'},
         {b:3,c:19,f:'Bk3_Ch19_01.py',why:'一元函数找极值'}],
  refs:[{k:'lifesaver',p:264,t:'11.5 Classifying Points Where the Derivative Vanishes',why:'驻点是极大极小还是拐点'}]
},
'op.gradient_descent':{
  books:[{b:4,c:17,s:'17.4',why:'方向导数：往哪走降得最快'},
         {b:3,c:16,s:'16.1',why:'偏导的几何含义'}],
  codes:[{b:4,c:17,f:'Bk4_Ch17_01.py',why:'画梯度场，看箭头指哪'},
         {b:3,c:16,f:'Bk3_Ch16_01.py',why:'偏导曲面与切平面'}],
  refs:[{k:'lifesaver',p:250,t:'11.1 Extrema of Functions',why:'极值与导数为零的关系'}]
},
'op.learning_rate':{
  books:[{b:3,c:17,s:'17.2',why:'泰勒二阶项就是曲率上界的来源'},
         {b:3,c:15,s:'15.4',why:'切线斜率决定一步走多远'}],
  codes:[{b:3,c:17,f:'Bk3_Ch17_02.py',why:'多项式近似误差随步长怎么涨'},
         {b:3,c:15,f:'Bk3_Ch15_03.py',why:'交互看切线近似的有效范围'}],
  refs:[{k:'lifesaver',p:303,t:'13.2 Linearization',why:'线性近似只在小步内成立'}]
},
'op.constraint_lagrange':{
  books:[{b:4,c:18,s:'18.1',why:'拉格朗日乘子法的完整推导'},
         {b:3,c:19,s:'19.3',why:'约束条件如何限定搜索区域'}],
  codes:[{b:3,c:19,f:'Bk3_Ch19_02.py',why:'带约束的优化怎么解'},
         {b:4,c:17,f:'Bk4_Ch17_02.py',why:'看目标与约束的梯度方向'}],
  refs:[{k:'lifesaver',p:292,t:'13.1 Optimization',why:'约束优化的手算流程'}]
},
'op.kkt':{
  books:[{b:3,c:6,s:'6.5',why:'三类不等式约束划出的可行域'},
         {b:4,c:18,s:'18.1',why:'乘子的符号含义从这来'}],
  codes:[{b:3,c:6,f:'Bk3_Ch6_04.py',why:'画不等式划出的区域'},
         {b:3,c:6,f:'Bk3_Ch6_05.py',why:'多个约束叠加后的可行域'}],
  refs:[]
},
'op.regularization':{
  books:[{b:7,c:5,s:'5.4',why:'套索的菱形约束与稀疏'},
         {b:7,c:5,s:'5.3',why:'岭回归的圆形约束对比'},
         {b:4,c:3,s:'3.1',why:'L 范数球的形状'}],
  codes:[{b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'调 α 看系数被压到 0'},
         {b:4,c:3,f:'Bk4_Ch3_01.py',why:'画不同 p 的范数球'}],
  refs:[]
},
'op.coordinate_descent':{
  books:[{b:3,c:13,s:'13.5',why:'山谷面上沿一维走的样子'},
         {b:4,c:9,s:'9.1',why:'一维最优=在该方向上的投影'}],
  codes:[{b:3,c:13,f:'Bk3_Ch13_01.py',why:'画山谷，沿单轴切一刀看'},
         {b:4,c:9,f:'Bk4_Ch9_01.py',why:'标量投影的闭式解'}],
  refs:[]
},
'op.second_order':{
  books:[{b:3,c:16,s:'16.3',why:'二阶偏导组成海塞矩阵'},
         {b:4,c:21,s:'21.2',why:'正定性决定抛物面开口方向'}],
  codes:[{b:3,c:16,f:'Bk3_Ch16_01.py',why:'算二阶偏导'},
         {b:4,c:21,f:'Bk4_Ch21_02.py',why:'看曲率把椭圆掰成圆'}],
  refs:[{k:'lifesaver',p:312,t:"13.3 Newton's Method",why:'牛顿法一步跳的算法'}]
},
'op.stochastic':{
  books:[{b:5,c:15,s:'15.1',why:'借：小批量梯度就是蒙特卡洛估计'},
         {b:5,c:16,s:'16.3',why:'借：批量越大噪声越小'}],
  codes:[{b:5,c:15,f:'Bk5_Ch15_01.py',why:'抽样估计的方差随 n 变'},
         {b:5,c:16,f:'Bk5_Ch16_03.py',why:'样本均值的抖动幅度'}],
  refs:[]
},
'op.early_stop':{
  books:[{b:7,c:5,s:'5.1',why:'借：早停与惩罚项是同一件事'},
         {b:7,c:4,s:'4.4',why:'借：多项式次数越高越贴噪声'}],
  codes:[{b:7,c:5,f:'Bk7_Ch05_01.ipynb',why:'看训练久了泛化怎么掉'},
         {b:7,c:4,f:'Bk7_Ch04_04.ipynb',why:'次数从低到高，过拟合现形'}],
  refs:[]
},

/* ================= it 信息论 ================= */
'it.surprisal':{
  books:[{b:3,c:12,s:'12.2',why:'−log p 里的对数怎么算'},
         {b:5,c:4,s:'4.1',why:'随机变量与取值概率'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_01.py',why:'画对数曲线，看 p→0 时爆炸'},
         {b:5,c:4,f:'Bk5_Ch04_01.py',why:'离散分布的概率表'}],
  refs:[]
},
'it.entropy':{
  books:[{b:7,c:13,s:'13.2',why:'信息熵的定义与计算'},
         {b:5,c:5,s:'5.2',why:'均匀分布熵最大'}],
  codes:[{b:7,c:13,f:'Bk7_Ch13_01.ipynb',why:'算每个划分的熵'},
         {b:5,c:5,f:'Bk5_Ch05_02.py',why:'均匀分布的形状'}],
  refs:[]
},
'it.cross_entropy':{
  books:[{b:7,c:4,s:'4.5',why:'逻辑回归的损失就是交叉熵'},
         {b:7,c:13,s:'13.3',why:'信息增益=熵差'}],
  codes:[{b:7,c:4,f:'Bk7_Ch04_05.ipynb',why:'跑逻辑回归看损失怎么降'},
         {b:7,c:13,f:'Bk7_Ch13_01.ipynb',why:'划分前后熵的变化'}],
  refs:[]
},
'it.kl':{
  books:[{b:5,c:17,s:'17.1',why:'借：真分布 vs 估计分布的差'},
         {b:5,c:5,s:'5.1',why:'借：两个分布放一起才谈得上 KL'}],
  codes:[{b:5,c:17,f:'Bk5_Ch17_01.py',why:'估计密度与真密度叠一起看'},
         {b:5,c:5,f:'Bk5_Ch05_01.py',why:'改参数看两分布拉开'}],
  refs:[]
},
'it.mutual_info':{
  books:[{b:7,c:13,s:'13.3',why:'信息增益就是互信息'},
         {b:5,c:4,s:'4.5',why:'相关系数是它的线性特例'}],
  codes:[{b:7,c:13,f:'Bk7_Ch13_01.ipynb',why:'算按某特征划分省了多少熵'},
         {b:5,c:4,f:'Bk5_Ch04_02.py',why:'相关系数抓不到非线性'}],
  refs:[]
},
'it.code_length':{
  books:[{b:3,c:12,s:'12.2',why:'log₂ 与码长的换算'},
         {b:5,c:5,s:'5.4',why:'借：概率不均时短码给谁'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_02.py',why:'画 −log₂p 的曲线'},
         {b:5,c:5,f:'Bk5_Ch05_04.py',why:'二项分布的概率高低分布'}],
  refs:[]
},
'it.channel':{
  books:[{b:5,c:8,s:'8.1',why:'借：给定输入后输出的条件分布'},
         {b:5,c:4,s:'4.6',why:'借：边缘化得到输出分布'}],
  codes:[{b:5,c:8,f:'Bk5_Ch08_01.py',why:'条件分布随输入怎么变'},
         {b:5,c:4,f:'Bk5_Ch04_02.py',why:'联合表求边缘'}],
  refs:[]
},
'it.max_entropy':{
  books:[{b:5,c:5,s:'5.2',why:'只知道范围时取均匀'},
         {b:5,c:9,s:'9.1',why:'只知道均值方差时取高斯'}],
  codes:[{b:5,c:5,f:'Bk5_Ch05_02.py',why:'均匀分布：不加任何偏好'},
         {b:5,c:9,f:'Bk5_Ch09_01.py',why:'高斯：给定二阶矩下最散'}],
  refs:[]
},
'it.compression':{
  books:[{b:7,c:15,s:'15.4',why:'截断 SVD=丢掉信息最少的压缩'},
         {b:7,c:14,s:'14.1',why:'PCA 用几维就说明规律多强'}],
  codes:[{b:7,c:15,f:'Bk7_Ch15_01.ipynb',why:'保留 k 个奇异值，看还原度'},
         {b:7,c:14,f:'Bk7_Ch14_01.ipynb',why:'累计解释方差曲线'}],
  refs:[]
},

/* ================= fo 傅里叶与信号 ================= */
'fo.eigenfunction':{
  books:[{b:4,c:13,s:'13.1',why:'借：特征向量=过系统只缩放不变向'},
         {b:3,c:12,s:'12.1',why:'借：指数函数的自复制性质'}],
  codes:[{b:4,c:13,f:'Bk4_Ch13_01.py',why:'看哪些向量方向不被改变'},
         {b:3,c:12,f:'Bk3_Ch12_01.py',why:'指数函数导数还是自己'}],
  refs:[{k:'rudin',p:194,t:'8. The Trigonometric Functions',why:'三角函数的严格定义'}]
},
'fo.basis':{
  books:[{b:4,c:7,s:'7.1',why:'换基就是换坐标系'},
         {b:4,c:10,s:'10.5',why:'标准正交基下投影即取坐标'}],
  codes:[{b:4,c:10,f:'Bk4_Ch10_01.py',why:'数据在正交基上的坐标'},
         {b:4,c:7,f:'Streamlit_Bk4_Ch7_01.py',why:'拖动看同一向量换基后的坐标'}],
  refs:[{k:'ladr',p:195,t:'6.B Orthonormal Bases',why:'正交基的定义与展开式'}]
},
'fo.fft':{
  books:[{b:4,c:6,s:'6.2',why:'借：分块矩阵=把大乘法拆小'},
         {b:3,c:14,s:'14.2',why:'借：奇偶下标拆分的数列视角'}],
  codes:[{b:4,c:6,f:'Bk4_Ch6_02.py',why:'分块算矩阵乘法'},
         {b:3,c:14,f:'Bk3_Ch14_02.py',why:'按下标规律拆数列'}],
  refs:[]
},
'fo.convolution':{
  books:[{b:4,c:5,s:'5.10',why:'借：卷积可写成矩阵乘法'},
         {b:3,c:18,s:'18.6',why:'借：连续卷积就是二重积分'}],
  codes:[{b:4,c:5,f:'Bk4_Ch5_01.py',why:'矩阵乘法的多种展开视角'},
         {b:3,c:18,f:'Bk3_Ch18_06.py',why:'二重积分的累加结构'}],
  refs:[]
},
'fo.sampling':{
  books:[{b:3,c:14,s:'14.2',why:'借：采样就是把连续变数列'},
         {b:2,c:23,s:'23.1',why:'借：参数方程画正弦看点够不够密'}],
  codes:[{b:3,c:14,f:'Bk3_Ch14_01.py',why:'数列取点疏密的影响'},
         {b:2,c:23,f:'BK_2_Ch23_01.ipynb',why:'改点数看曲线失真'}],
  refs:[]
},
'fo.filter':{
  books:[{b:6,c:6,s:'6.3',why:'借：提趋势=低通，去趋势=高通'},
         {b:2,c:8,s:'8.1',why:'借：先把信号画成线看清楚'}],
  codes:[{b:6,c:6,f:'Bk6_Ch6_03.ipynb',why:'平滑掉高频看趋势'},
         {b:2,c:8,f:'BK_2_Ch08_01.ipynb',why:'把序列画成线图'}],
  refs:[]
},
'fo.window':{
  books:[{b:3,c:18,s:'18.3',why:'借：截断=乘一个矩形指示函数'},
         {b:2,c:8,s:'8.6',why:'借：端点不连续画出来什么样'}],
  codes:[{b:3,c:18,f:'Bk3_Ch18_03.py',why:'限定区间的积分'},
         {b:2,c:8,f:'BK_2_Ch08_06.ipynb',why:'特殊点线：看断点'}],
  refs:[]
},
'fo.spectrogram':{
  books:[{b:2,c:11,s:'11.3',why:'借：时间×频率就是一张热图'},
         {b:6,c:6,s:'6.1',why:'借：时间序列切段的做法'}],
  codes:[{b:2,c:11,f:'BK_2_Ch11_01.ipynb',why:'画热图，认横纵轴'},
         {b:6,c:6,f:'Bk6_Ch6_01.ipynb',why:'时间序列按段切开'}],
  refs:[]
},
'fo.wavelet':{
  books:[{b:3,c:13,s:'13.9',why:'借：高斯窗是最常用的软窗'},
         {b:2,c:15,s:'15.1',why:'借：时间-尺度平面就是一张曲面'}],
  codes:[{b:3,c:13,f:'Bk3_Ch13_02.py',why:'改宽度看高斯窗胖瘦'},
         {b:2,c:15,f:'BK_2_Ch15_01.ipynb',why:'把二维系数画成曲面'}],
  refs:[]
},

/* ================= cx 复数 ================= */
'cx.i_rotation':{
  books:[{b:2,c:24,s:'24.2',why:'复变函数把复数当动作看'},
         {b:4,c:8,s:'8.4',why:'旋转矩阵与乘 i 是同一件事'}],
  codes:[{b:2,c:24,f:'Bk2_Ch24_01.ipynb',why:'复平面上画点，乘 i 看转 90°'},
         {b:4,c:8,f:'Bk4_Ch8_01.py',why:'旋转矩阵作用在向量上'}],
  refs:[{k:'lifesaver',p:620,t:'28.1 The Basics',why:'i 的定义与基本运算'}]
},
'cx.multiply':{
  books:[{b:2,c:24,s:'24.2',why:'模相乘角相加的可视化'},
         {b:3,c:5,s:'5.4',why:'极坐标下距离与夹角'}],
  codes:[{b:2,c:24,f:'Bk2_Ch24_02.ipynb',why:'两复数相乘，看模与角'},
         {b:3,c:5,f:'Bk3_Ch5_04.py',why:'极坐标画点'}],
  refs:[{k:'lifesaver',p:628,t:'28.3 Taking Large Powers of Complex Numbers',why:'角相加规律的直接用法'}]
},
'cx.polar':{
  books:[{b:3,c:5,s:'5.4',why:'极坐标：只需 r 和 θ'},
         {b:2,c:23,s:'23.2',why:'球坐标：极坐标升一维'}],
  codes:[{b:3,c:5,f:'Bk3_Ch5_03.py',why:'直角与极坐标互转'},
         {b:2,c:23,f:'BK_2_Ch23_02.ipynb',why:'角度参数化看点怎么跑'}],
  refs:[{k:'lifesaver',p:624,t:'28.2 The Complex Plane',why:'模与幅角的标准写法'}]
},
'cx.euler':{
  books:[{b:3,c:12,s:'12.1',why:'指数函数的增长本性'},
         {b:3,c:17,s:'17.2',why:'泰勒级数把三者拼到一起'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_01.py',why:'画 e^x 看自身导数'},
         {b:3,c:17,f:'Bk3_Ch17_02.py',why:'级数逐项逼近三角函数'}],
  refs:[{k:'lifesaver',p:640,t:"28.7 Euler's Identity and Power Series",why:'欧拉公式的级数证明'}]
},
'cx.roots_unity':{
  books:[{b:3,c:3,s:'3.3',why:'弧度制下把圆等分'},
         {b:2,c:30,s:'30.1',why:'借：圆上均匀取点的画法'}],
  codes:[{b:3,c:3,f:'Bk3_Ch3_01.py',why:'角度与弧度换算'},
         {b:2,c:30,f:'Bk2_Ch30_01.ipynb',why:'圆上均匀点连线的图案'}],
  refs:[{k:'lifesaver',p:629,t:'28.4 Solving zn = w',why:'n 次方根的求法'}]
},
'cx.oscillation':{
  books:[{b:3,c:12,s:'12.1',why:'实部指数给包络'},
         {b:2,c:23,s:'23.1',why:'参数方程画振荡轨迹'}],
  codes:[{b:3,c:12,f:'Bk3_Ch12_02.py',why:'改底数看衰减还是发散'},
         {b:2,c:23,f:'BK_2_Ch23_01.ipynb',why:'参数曲线看螺旋'}],
  refs:[{k:'lifesaver',p:635,t:'28.5 Solving ez = w',why:'复指数的解法'}]
},
'cx.conjugate':{
  books:[{b:2,c:24,s:'24.2',why:'共轭在复平面上的镜像'},
         {b:4,c:2,s:'2.6',why:'借：z·z̄=|z|² 就是内积'}],
  codes:[{b:2,c:24,f:'Bk2_Ch24_01.ipynb',why:'画 z 与其共轭'},
         {b:4,c:2,f:'Bk4_Ch2_06.py',why:'内积得到模长平方'}],
  refs:[{k:'ladr',p:134,t:'Complex Conjugate and Absolute Value',why:'共轭与模的性质表'}]
},
'cx.poly_roots':{
  books:[{b:3,c:11,s:'11.4',why:'多项式函数的形状与根'},
         {b:3,c:4,s:'4.4',why:'借：系数从杨辉三角来'}],
  codes:[{b:3,c:11,f:'Bk3_Ch11_03.py',why:'改系数看实根消失'},
         {b:3,c:4,f:'Bk3_Ch4_04.py',why:'展开系数的规律'}],
  refs:[{k:'ladr',p:140,t:'4.13 Fundamental Theorem of Algebra',why:'n 次必有 n 根'}]
},
'cx.pole_zero':{
  books:[{b:3,c:11,s:'11.3',why:'借：二次函数的零点决定形状'},
         {b:2,c:22,s:'22.1',why:'借：隐函数等高线看奇点附近'}],
  codes:[{b:3,c:11,f:'Bk3_Ch11_02.py',why:'零点位置怎么改曲线'},
         {b:2,c:22,f:'BK_2_Ch22_01.ipynb',why:'画隐函数曲面看尖峰'}],
  refs:[{k:'ladr',p:138,t:'Zeros of Polynomials',why:'零点与因式的对应'}]
},

/* ================= vd 吠陀速算 ================= */
'vd.ekadhikena':{
  books:[{b:3,c:4,s:'4.3',why:'代数式展开验证这条口诀'},
         {b:3,c:2,s:'2.1',why:'乘除的基本顺序'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_01.py',why:'符号展开 (10a+5)² 验证'},
         {b:3,c:2,f:'Bk3_Ch2_01.py',why:'乘法最小例子'}],
  refs:[{k:'vedic',p:9,t:'1. Ekadhikena Purvena',why:'尾 5 平方的原诀与例题'}]
},
'vd.nikhilam':{
  books:[{b:3,c:2,s:'2.1',why:'补数乘法的算术依据'},
         {b:3,c:1,s:'1.1',why:'位值与十的幂'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_02.py',why:'验证交叉减与补数相乘'},
         {b:3,c:1,f:'Bk3_Ch1_01.py',why:'看数怎么按位拆'}],
  refs:[{k:'vedic',p:20,t:'2. Nikhilam navatascaramam Dasatah',why:'近 100 乘法的原诀'}]
},
'vd.urdhva':{
  books:[{b:3,c:2,s:'2.3',why:'借：竖乘交叉就是卷积/矩阵乘'},
         {b:3,c:11,s:'11.4',why:'借：多项式相乘的系数对位'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_03.py',why:'按位展开乘法过程'},
         {b:3,c:11,f:'Bk3_Ch11_03.py',why:'多项式乘法的系数卷积'}],
  refs:[{k:'vedic',p:33,t:'3. Urdhva - tiryagbhyam',why:'通用竖乘法的原诀'}]
},
'vd.paravartya':{
  books:[{b:3,c:2,s:'2.6',why:'借：求逆与做除法的关系'},
         {b:3,c:11,s:'11.4',why:'借：综合除法就是多项式除法'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_06.py',why:'除法与逆的计算'},
         {b:3,c:11,f:'Bk3_Ch11_03.py',why:'多项式带余除法'}],
  refs:[{k:'vedic',p:43,t:'4. Paravartya Yojayet',why:'变号移项除法的原诀'}]
},
'vd.sunyam':{
  books:[{b:3,c:4,s:'4.1',why:'代数恒等变形的底子'},
         {b:3,c:23,s:'23.1',why:'借：方程组的结构化解法'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_02.py',why:'符号化简看公共块'},
         {b:3,c:23,f:'Bk3_Ch23_1.py',why:'方程组的直接解'}],
  refs:[{k:'vedic',p:55,t:'5. Sunyam Samya Samuccaye',why:'公共块置零的原诀'}]
},
'vd.anurupye':{
  books:[{b:3,c:23,s:'23.2',why:'借：系数比就是向量成比例'},
         {b:3,c:24,s:'24.1',why:'借：两式关系的图像看法'}],
  codes:[{b:3,c:23,f:'Bk3_Ch23_2.py',why:'向量共线时解的结构'},
         {b:3,c:24,f:'Bk3_Ch24_1.py',why:'两式关系画出来'}],
  refs:[{k:'vedic',p:66,t:'6. Anurupye - Sunyamanyat',why:'成比例则另一个为零'}]
},
'vd.sankalana':{
  books:[{b:3,c:23,s:'23.4',why:'借：加减消元的向量视角'},
         {b:3,c:24,s:'24.4',why:'借：一次方程组的标准解法'}],
  codes:[{b:3,c:23,f:'Bk3_Ch23_3.py',why:'加减消元一步出结果'},
         {b:3,c:24,f:'Bk3_Ch24_2.py',why:'两式相加相减看几何'}],
  refs:[{k:'vedic',p:67,t:'7. Sankalana - Vyavakalanabhyam',why:'一加一减两步解的原诀'}]
},
'vd.purana':{
  books:[{b:3,c:11,s:'11.3',why:'配方=补成完全平方'},
         {b:3,c:4,s:'4.4',why:'借：立方展开的系数来源'}],
  codes:[{b:3,c:11,f:'Bk3_Ch11_02.py',why:'配方前后抛物线同一条'},
         {b:3,c:4,f:'Bk3_Ch4_04.py',why:'二项展开系数'}],
  refs:[{k:'vedic',p:69,t:'8. Puranapuranabhyam',why:'补全与不补全的原诀'}]
},
'vd.calana':{
  books:[{b:3,c:15,s:'15.5',why:'导数也是函数，可与原式联立'},
         {b:3,c:11,s:'11.4',why:'多项式与其导数的公共根'}],
  codes:[{b:3,c:15,f:'Bk3_Ch15_01.py',why:'画原函数与导函数'},
         {b:3,c:11,f:'Bk3_Ch11_03.py',why:'重根处曲线与横轴相切'}],
  refs:[{k:'vedic',p:70,t:'9. Calana - Kalanabhyam',why:'用微分找重根的原诀'},
        {k:'lifesaver',p:127,t:'6.2 Finding Derivatives (the Nice Way)',why:'先把求导练熟'}]
},
'vd.ekanyunena':{
  books:[{b:3,c:2,s:'2.1',why:'乘 9/99 的分配律依据'},
         {b:3,c:1,s:'1.1',why:'十的幂与借位'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_04.py',why:'验证左半减 1 的规律'},
         {b:3,c:1,f:'Bk3_Ch1_02.py',why:'看数位与量级'}],
  refs:[{k:'vedic',p:71,t:'10. Ekanyunena Purvena',why:'乘 9 系列的原诀'}]
},
'vd.anurupyena':{
  books:[{b:3,c:2,s:'2.1',why:'换基相当于提公因数'},
         {b:3,c:11,s:'11.5',why:'借：幂函数看倍数缩放'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_05.py',why:'提出倍数再乘回去'},
         {b:3,c:11,f:'Bk3_Ch11_01.py',why:'缩放对结果的影响'}],
  refs:[{k:'vedic',p:77,t:'11. Anurupyena',why:'换工作基的原诀'}]
},
'vd.adyamadyena':{
  books:[{b:3,c:1,s:'1.1',why:'进制与单位换算的底子'},
         {b:3,c:2,s:'2.3',why:'借：首尾交叉就是二项展开'}],
  codes:[{b:3,c:1,f:'Bk3_Ch1_03.py',why:'按位拆数再合'},
         {b:3,c:2,f:'Bk3_Ch2_07.py',why:'交叉项怎么合并'}],
  refs:[{k:'vedic',p:84,t:'12. Adyamadyenantya - mantyena',why:'首乘首尾乘尾的原诀'}]
},
'vd.yavadunam':{
  books:[{b:3,c:4,s:'4.4',why:'(a±d)² 展开就是这条口诀'},
         {b:3,c:11,s:'11.3',why:'二次函数在基准点附近的值'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_04.py',why:'符号展开验证'},
         {b:3,c:11,f:'Bk3_Ch11_02.py',why:'看偏差平方那一项'}],
  refs:[{k:'vedic',p:88,t:'13. Yavadunam Tavadunikrtya Varganca Yojayet',why:'近十的幂平方的原诀'}]
},
'vd.antyayor_dasake':{
  books:[{b:3,c:4,s:'4.3',why:'代数式展开验证前缀×(前缀+1)'},
         {b:3,c:2,s:'2.1',why:'乘法的分配律'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_03.py',why:'符号验证这条恒等式'},
         {b:3,c:2,f:'Bk3_Ch2_08.py',why:'直接乘一遍对答案'}],
  refs:[{k:'vedic',p:95,t:'14. Antyayor Dasakepi',why:'末位和为 10 的原诀'}]
},
'vd.antyayoreva':{
  books:[{b:3,c:2,s:'2.6',why:'借：分式方程要先看两边比例'},
         {b:3,c:4,s:'4.6',why:'借：结构规律先看再算'}],
  codes:[{b:3,c:2,f:'Bk3_Ch2_09.py',why:'分式化简'},
         {b:3,c:4,f:'Bk3_Ch4_06.py',why:'找数字规律再下手'}],
  refs:[{k:'vedic',p:98,t:'15. Antyayoreva',why:'只看末项的原诀'}]
},
'vd.lopana':{
  books:[{b:3,c:4,s:'4.6',why:'借：置零消元找因式的思路'},
         {b:3,c:13,s:'13.1',why:'借：多元式在平面上的截线'}],
  codes:[{b:3,c:4,f:'Bk3_Ch4_05.py',why:'符号分解多元二次式'},
         {b:3,c:13,f:'Bk3_Ch13_01.py',why:'令一元为 0 看截面'}],
  refs:[{k:'vedic',p:103,t:'16. Lopana Sthapanabhyam',why:'交替消去与保留的原诀'}]
}

});
