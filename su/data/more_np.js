/* 数理宇宙 v2 · 加题：np NumPy 张量大陆（每节点 8 题，一半秒答一半推演） */
window.MORE = window.MORE || {};
Object.assign(window.MORE, {

'np.array_shape':[
  {q:'np.zeros((6,5,4,3)) 的 size 和 ndim？', a:'360 和 4', how:'size=全乘 6*5*4*3；ndim=shape 里几个数'},
  {q:'np.arange(10)[::3] 的 shape？', a:'(4,)', how:'0,3,6,9 共 4 个；步长切片个数 = ceil(10/3)'},
  {q:'x.shape=(3,1,4)，x.squeeze() 的 shape？', a:'(3,4)', how:'squeeze 去掉所有长度 1 的轴'},
  {q:'np.expand_dims(a, 1)，a.shape=(5,5)，结果 shape？', a:'(5,1,5)', how:'在位置 1 插一根长度 1 的轴，等价 a[:,None,:]'},
  {q:'np.zeros((2,3), dtype=np.float32) 占多少字节？', a:'24', how:'6 个元素 × 4 字节'},
  {q:'三个 (4,5) 数组，np.stack 和 np.concatenate 各得到什么 shape？', a:'stack → (3,4,5)；concatenate → (12,5)', how:'stack 新建一根轴，concatenate 沿已有轴 0 接长'},
  {q:'a=np.zeros((7,8,9))，len(a) 是多少？为什么不能用它判断数组大小？', a:'7；len 只给 shape[0]', how:'len 是第 0 维长度，元素总数要 a.size=504'},
  {q:'x=np.arange(3)。x.T.shape 是多少？想得到列向量该怎么写？', a:'仍是 (3,)；用 x[:,None] 得 (3,1)', how:'转置是倒转轴顺序，一维倒过来还是自己'}
],

'np.broadcast':[
  {q:'(3,1,5) 与 (4,5) 相加，结果 shape？', a:'(3,4,5)', how:'右对齐：5↔5，1↔4 拉伸，3↔缺失'},
  {q:'(1,) 与 (9,9,9) 相加，结果 shape？', a:'(9,9,9)', how:'标量式的 1 拉伸到任何长度'},
  {q:'(2,1)、(1,3)、(2,3) 三者一起运算，结果 shape？', a:'(2,3)', how:'广播可多方同时进行，每位取非 1 的那个'},
  {q:'np.arange(3)[:,None] * np.arange(4) 的 shape？这是什么表？', a:'(3,4)，一张乘法表', how:'(3,1) 与 (4,) 右对齐 → (3,4)，每格是 i*j'},
  {q:'图像 (256,256,3) 减去每通道背景 (3,)，能直接减吗？', a:'能，结果 (256,256,3)', how:'右对齐 3↔3，前两维对缺失补 1'},
  {q:'(5,3) + (3,5) 为什么报错？两种可能的修法各给出什么 shape？', a:'右对齐 3 vs 5 冲突；A+B.T→(5,3)，A.T+B→(3,5)', how:'先答清哪一维是样本，再决定转谁'},
  {q:'X.shape=(1000,20)。X - X.mean(axis=1) 报错，X - X.mean(axis=0) 不报错，为什么？', a:'axis=1 得 (1000,)，右对齐 20 vs 1000 冲突；axis=0 得 (20,)，20↔20 合法', how:'归约轴在最后一维时天然可广播，在前面必须 keepdims'},
  {q:'a.shape=(1000,1)，b.shape=(1,1000)，a+b 占多少额外内存（float64）？', a:'结果 8 MB，但两个输入没有被复制', how:'广播把那一维的 stride 设成 0，零拷贝；开销只在结果数组本身'}
],

'np.dot':[
  {q:'(7,) @ (7,3) 的 shape？', a:'(3,)', how:'一维在左临时补成 (1,7)，算完去掉 → (3,)'},
  {q:'(32,128) @ (128,) 的 shape？', a:'(32,)', how:'一维在右临时补成 (128,1)，算完去掉'},
  {q:'(8,2,3,4) @ (8,2,4,5) 的 shape？', a:'(8,2,3,5)', how:'最后两维 (3,4)@(4,5)→(3,5)，前面 (8,2) 是批量维，一一对上'},
  {q:'np.dot([1,-1,2],[3,0,1]) 等于多少？两向量夹角是锐角还是钝角？', a:'5，锐角', how:'3+0+2=5>0，正的就是方向偏一致'},
  {q:'np.outer([1,2],[3,4,5]) 的 shape？', a:'(2,3)', how:'外积把 (2,1) 与 (1,3) 广播相乘'},
  {q:'X 是 (100,5)。X.T@X 与 X@X.T 的 shape 各是多少，分别在回答什么问题？', a:'(5,5) 特征之间；(100,100) 样本之间', how:'转置放左边得特征协方差式，放右边得样本 Gram 矩阵'},
  {q:'(5,1,4) @ (3,4,2) 报错，(1,1,4) @ (3,4,2) 却给 (3,1,2)，为什么？', a:'矩阵部分都合法，差别在批量维：5 vs 3 无法广播，1 vs 3 可以', how:'matmul 要过两关：最后两维看内维，前面所有维看广播'},
  {q:'a=np.ones((3,3))，b=np.ones((3,3))。a*b 与 a@b 的每个元素分别是多少？', a:'a*b 全是 1；a@b 全是 3', how:'* 逐元素相乘；@ 是行乘列求和，3 个 1 相加'}
],

'np.reshape':[
  {q:'np.arange(8).reshape(2,2,2)[1,0,1] 是多少？', a:'5', how:'内存 0..7，下标换算 1*4+0*2+1=5'},
  {q:'(5,6) 数组 reshape(-1,3) 的 shape？', a:'(10,3)', how:'size 30 除以 3'},
  {q:'np.arange(10).reshape(3,4) 会怎样？', a:'报错 cannot reshape array of size 10 into shape (3,4)', how:'10 不等于 12，元素数必须完全相等'},
  {q:'(64,3,7,7) 转成 NHWC，写出 transpose 参数与结果 shape。', a:'transpose(0,2,3,1) → (64,7,7,3)', how:'参数是"新轴依次取自哪个旧轴"'},
  {q:'(2,3,4).swapaxes(0,2) 的 shape？', a:'(4,3,2)', how:'只交换指定的两根轴，中间轴不动'},
  {q:'a=np.arange(6).reshape(2,3)。a.reshape(3,2) 与 a.flatten() 哪个和 a 共享内存？', a:'reshape 共享（view），flatten 不共享（永远 copy）', how:'ravel 能给 view 就给，flatten 一定拷贝'},
  {q:'np.arange(12).reshape(3,4).T.reshape(2,6) 输出什么？为什么这一步一定发生了拷贝？', a:'[[0,4,8,1,5,9],[2,6,10,3,7,11]]；因为 .T 后不连续，新读法无法用 strides 表达', how:'转置只改 strides，再 reshape 时 NumPy 静默拷贝一份'},
  {q:'img.shape=(512,512,3)。img.reshape(3,512,512) 报错吗？结果对吗？', a:'不报错，但结果是错的', how:'元素数相同所以合法；内存是 RGB 逐像素交错，硬折会把图打乱。要 transpose(2,0,1)'}
],

'np.axis':[
  {q:'(2,3,4).mean(axis=(1,2)) 的 shape？', a:'(2,)', how:'吃掉第 1、2 维，只剩第 0 维'},
  {q:'(10,20,30).std(axis=0, keepdims=True) 的 shape？', a:'(1,20,30)', how:'keepdims 把被吃掉的轴留成 1'},
  {q:'(4,5).sum(axis=-2) 的 shape？', a:'(5,)', how:'-2 就是倒数第二维，即轴 0'},
  {q:'[[1,5],[7,2]] 的 argmin(axis=0) 输出？', a:'[0, 1]', how:'吃掉行：第一列 min 在第 0 行，第二列 min 在第 1 行'},
  {q:'[[True,False],[True,True]].sum(axis=1) 输出？', a:'[1, 2]', how:'布尔当 0/1，横着加得每行 True 的个数'},
  {q:'[[1,2,3],[4,5,6]].cumsum(axis=1) 输出？为什么 shape 没变？', a:'[[1,3,6],[4,9,15]]；cumsum 是累积不是归约', how:'归约吃掉一维，累积保留全部位置，只是把前缀和写回去'},
  {q:'a=[[1,9],[8,2]]。a.argmax() 与 a.argmax(axis=1) 分别给什么？怎么把前者还原成 (行,列)？', a:'1 与 [1,0]；用 np.unravel_index(1, a.shape) 得 (0,1)', how:'不写 axis 会先拉平返回扁平下标'},
  {q:'(64,3,32,32) 要按通道归一化。均值该沿哪些轴？加 keepdims 后 shape 是多少？', a:'axis=(0,2,3)，keepdims 后 (1,3,1,1)', how:'要保留通道轴就把它排除在 axis 之外；(1,3,1,1) 正好广播回原 shape'}
],

'np.overflow':[
  {q:'np.uint8(0) - np.uint8(1) 等于多少？', a:'255', how:'无符号 8 bit 环，0 往下退一格绕到顶'},
  {q:'np.int16(30000) + np.int16(10000) 等于多少？', a:'-25536', how:'int16 上限 32767；40000-65536=-25536'},
  {q:'np.array([250,250], dtype=np.uint8) * 2 输出？', a:'[244, 244]', how:'500-256=244，逐元素运算保持 dtype'},
  {q:'np.iinfo(np.int32).max 是多少量级？什么时候必须换 int64？', a:'约 2.1e9；计数或索引可能超过 21 亿时', how:'超过就绕成负数且不报错'},
  {q:'np.array([1,2,3]) / 2 的 dtype 是什么？', a:'float64', how:'真除法一律升 float，即使输入是整数'},
  {q:'np.array([np.nan]) == np.array([np.nan]) 输出？该怎么判断 nan？', a:'[False]；用 np.isnan(x)', how:'nan 与任何数比较都是 False，包括它自己'},
  {q:'np.array([200,100], dtype=np.uint8).sum() 是 300 还是 44？为什么和 np.uint8(200)+np.uint8(100) 结果不同？', a:'sum 得 300，逐元素加得 44', how:'归约运算会把 dtype 提升到 uint64，逐元素运算保持原 dtype'},
  {q:'logits=[1000,1001,1002]，直接 np.exp(logits)/np.exp(logits).sum() 输出什么？正确写法是什么？', a:'全是 nan；正确是先减 max：exp(x-x.max())/exp(x-x.max()).sum() → [0.090,0.245,0.665]', how:'exp(1000) 溢出成 inf，inf/inf 得 nan；分子分母同乘常数不改变 softmax'}
],

'np.random':[
  {q:'σ=6，n=9 的样本均值标准误是多少？', a:'2', how:'6/√9'},
  {q:'标准误要从 1 降到 0.2，样本量要乘几倍？', a:'25 倍', how:'误差∝1/√n，缩 5 倍 → n 乘 25'},
  {q:'rng.random((2,3)) 的 shape 和取值范围？', a:'(2,3)，[0,1) 均匀', how:'random 给半开区间，不含 1'},
  {q:'rng.normal(0, 4) 的方差是多少？', a:'16', how:'第二个参数是标准差，方差是它的平方'},
  {q:'a=np.arange(5)；写 a = rng.shuffle(a) 之后 a 是什么？', a:'None', how:'shuffle 原地改并返回 None；要新数组用 rng.permutation'},
  {q:'rng.integers(0,10,5) 能出现 10 吗？要含 10 该怎么写？', a:'不能；写 rng.integers(0,11,5) 或加 endpoint=True', how:'integers 高端不含'},
  {q:'10000 个样本做 2000 次 bootstrap，取样下标数组该是什么 shape？统计量沿哪个轴归约？', a:'idx 是 (2000,10000)，统计量沿 axis=1', how:'每次重采样一行，吃掉样本轴得到 (2000,) 的分布'},
  {q:'两次 np.random.default_rng(42).integers(0,10,5) 结果相同吗？换成 np.random.randint 呢？', a:'相同；np.random.randint 用全局状态，别处调用会改变结果', how:'Generator 把状态封在对象里，这就是可复现的做法'}
],

'np.vectorize':[
  {q:'np.maximum(x, 0) 对 x=[-2,0,3] 输出？这是什么激活函数？', a:'[0,0,3]，ReLU', how:'逐元素取较大者，无需 where'},
  {q:'np.clip([-5,0,300], 0, 255) 输出？', a:'[0,0,255]', how:'低于下界抬到 0，高于上界压到 255'},
  {q:'np.cumsum([1,2,3,4]) 输出？', a:'[1,3,6,10]', how:'前缀和，shape 不变'},
  {q:'(np.arange(5)**2).sum() 等于多少？', a:'30', how:'0+1+4+9+16'},
  {q:'lut=np.arange(256)[::-1]，lut[np.array([0,1,255],dtype=np.uint8)] 输出？', a:'[255,254,0]', how:'按值查表 = 整数数组索引，一行代替百万次循环'},
  {q:'A (100,3) 与 B (50,3) 求两两距离，写出广播式与结果 shape。中间数组多大？', a:'np.sqrt(((A[:,None,:]-B[None,:,:])**2).sum(-1))，结果 (100,50)；中间 (100,50,3) 约 120 KB', how:'加轴 + 广播 + 沿坐标轴归约，是所有两两配对问题的模板'},
  {q:'np.where(x>0, np.log(x), 0) 对含负数的 x 为什么还是报 invalid value 警告？', a:'where 会把两个分支都完整算完再挑，log 对负数已经执行了', how:'先 np.clip(x,eps,None) 再 log，或用 np.errstate 屏蔽'},
  {q:'为什么 np.vectorize(f)(x) 通常不比 for 循环快？什么时候还值得用它？', a:'它内部就是 Python 循环；值得用只是为了让标量函数支持广播和统一接口', how:'要真加速就改写成 NumPy 原生表达式或上 numba'}
],

'np.mask':[
  {q:'a=[4,7,1,9,3]，a[a>3] 输出？', a:'[4,7,9]', how:'掩码 [T,T,F,T,F]'},
  {q:'同上 a，np.flatnonzero(a>3) 输出？和 a[a>3] 差别是什么？', a:'[0,1,3]；一个给位置一个给值', how:'要拿去索引别的数组就取位置'},
  {q:'(a>3).sum() 和 (a>3).mean() 分别是多少？', a:'3 和 0.6', how:'True 当 1：个数与比例'},
  {q:'X=np.arange(20).reshape(4,5)。X[X>10] 的 shape？', a:'(9,)', how:'二维布尔掩码把结果拉平成一维'},
  {q:'X (4,5)。X[[0,3]] 与 X[:,[0,2]] 的 shape 各是多少？', a:'(2,5) 和 (4,2)', how:'整数数组放哪一维就挑哪一维'},
  {q:'a=np.arange(6)。b=a[::2]; b[0]=99 与 c=a[[0,2,4]]; c[0]=99，a 分别变成什么？', a:'第一种 a=[99,1,2,3,4,5]；第二种 a 不变', how:'切片是 view（能用 strides 表达），花式索引是 copy'},
  {q:'X=np.arange(20).reshape(4,5)。X[[1,2],[0,4]] 输出什么？想要 2x2 子矩阵该怎么写？', a:'[5, 14]，是配对取的两个标量；子矩阵用 X[np.ix_([1,2],[0,4])] 得 [[5,9],[10,14]]', how:'多个整数数组按位置配对，不是笛卡尔积'},
  {q:'写 a[a>1 and a<5] 会怎样？正确写法？', a:'报 ambiguous truth value；正确是 a[(a>1) & (a<5)]', how:'and 要求整个数组给单一真假值；& 优先级低于比较符，必须加括号'}
],

'np.linalg':[
  {q:'np.linalg.norm([[3,4],[5,12]], axis=1) 输出？', a:'[5., 13.]', how:'axis=1 吃掉列，得到每行的 L2 长度'},
  {q:'np.linalg.det([[2,0],[0,5]]) 等于多少？', a:'10', how:'对角阵行列式=对角元乘积'},
  {q:'np.trace([[1,2],[3,4]]) 等于多少？它等于特征值的什么？', a:'5；等于特征值之和', how:'迹=对角和=Σλ；行列式=Πλ'},
  {q:'解 [[1,1],[1,-1]] x = [5,1]，x 是多少？', a:'[3, 2]', how:'两式相加得 2x₁=6'},
  {q:'[[1,2],[2,4]] 的秩是多少？solve 会怎样？', a:'秩 1；solve 报 Singular matrix', how:'第二行是第一行的 2 倍，不满秩。改用 lstsq'},
  {q:'X 是 (1000,20)。svd(X, full_matrices=False) 后 U,s,Vt 的 shape？不加这个参数会怎样？', a:'(1000,20)、(20,)、(20,20)；不加会生成 (1000,1000) 的 U，大数据上直接爆内存', how:'数据矩阵做 SVD 一律加 full_matrices=False'},
  {q:'w,V = np.linalg.eigh([[4,0],[0,1]])。w 是什么顺序？第一个特征向量怎么取？', a:'w=[1,4]，升序；取 V[:,0]=[0,1]', how:'eigh 保证实数且升序；特征向量按列存，V[:,i] 对应 w[i]'},
  {q:'np.linalg.cond([[1,0],[0,1e-6]]) 是多少？看到回归系数乱跳该先查什么？', a:'1e6；先查条件数，再标准化特征', how:'cond=σmax/σmin，它是输入误差的放大倍数'}
]
});
