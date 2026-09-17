/* 数理宇宙 v3 · 推导层 · np NumPy 张量大陆（10 节点）
   旁挂文件，不改动 v1/v2。代码节点的 proof 写「这个机制为什么必须是这样」。
   scratch 全部用 python3 + numpy 实际跑过，out 是真实输出。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'np.array_shape': {
  layers:{
    alg:`ndarray 是一个函数 a: {0..d0-1}×…×{0..dk-1} → 同一 dtype 的值。shape=(d0,…,dk) 是定义域，ndim=k+1，size=Πdᵢ。所有运算的合法性先看定义域对不对得上。`,
    geo:`一个 k+1 维的盒子，shape 是每条边长。(5,) 是一根线，(5,1) 是竖着的一列格子，(1,5) 是横着的一行格子：三个盒子形状不同，装的数一样。`,
    comp:`机器里只有一条字节线 + 两组整数：shape 和 strides。取 a[i,j,k] 就是算 base + i·s0 + j·s1 + k·s2 然后读那个地址。NumPy 取一个元素只做一次乘加。`
  },
  proof:{
    from:`内存是一维字节数组；每个元素占 itemsize 字节；行优先约定：最后一维在内存里相邻`,
    to:`ndarray = 连续内存 + shape + strides；地址 = base + Σ 下标×stride；很多操作只需改 shape/strides 不动数据`,
    steps:[
      [`把 n 个同 dtype 的值紧挨着放：第 i 个的地址 = base + i·itemsize`, `同 dtype 保证格宽相同，位置和地址才是线性公式；这是 list 存指针做不到的`],
      [`要看成 (d0,d1) 的表：约定 a[i,j] 是第 i·d1+j 个元素`, `行优先只是一个双射 (i,j)↔线性下标，不需要搬任何字节`],
      [`把 i·d1·itemsize 记作 s0，itemsize 记作 s1：地址 = base + i·s0 + j·s1`, `把「每维走一步跳几字节」预先算好，就是 strides；取元素退化成一次点积`],
      [`推广到 k+1 维：strides=(d1·d2…·w, d2·…·w, …, w)，递减`, `最后一维 stride 最小 = 它在内存里相邻，所以沿最后一维遍历缓存最友好`],
      [`shape 与 strides 是元数据，数据本身不知道自己是几维`, `同一段内存挂上 (5,)、(5,1)、(1,5) 三套元数据就是三个数组，所以它们广播行为不同但共享内存`],
      [`任何能写成「新 shape + 新 strides + 同一 base」的操作都是 O(1) 的视图`, `reshape(连续时)、转置、切片都只改元数据；这是后面 reshape/transpose 便宜的根源`],
      [`不规则数据放不进这个模型：每维长度必须固定`, `object 数组退化成指针数组，地址公式指向的是 Python 对象，向量化全部失效`]
    ],
    end:`ndarray 的全部秘密是「一条线 + 两组整数」。速度、视图、广播、reshape 都从地址公式长出来。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# ndarray = 一块连续内存 + shape + strides。手算地址，和 NumPy 取值对照
a = np.arange(24, dtype=np.int32).reshape(2, 3, 4)
print("shape", a.shape, "strides(bytes)", a.strides, "itemsize", a.itemsize, "nbytes", a.nbytes)
flat = a.tobytes()                       # 内存里那条线
def at(i, j, k):
    off = i*a.strides[0] + j*a.strides[1] + k*a.strides[2]     # 地址公式：起点 + Σ 下标×stride
    return int(np.frombuffer(flat[off:off+4], dtype=np.int32)[0])
print("a[1,2,3] =", a[1,2,3], " 手算 =", at(1,2,3))
print("a[0,1,0] =", a[0,1,0], " 手算 =", at(0,1,0))
# 行优先：最后一维 stride 最小 = 内存里挨着的那一维
print("strides 递减:", a.strides[0] > a.strides[1] > a.strides[2])
# (5,) (5,1) (1,5) 是三种 shape，同一块内存
v = np.arange(5)
for s in [(5,), (5,1), (1,5)]:
    w = v.reshape(s); print(s, "ndim", w.ndim, "strides", w.strides, "共享内存", np.shares_memory(v, w))
# 不规则数据不是张量
r = np.array([[1,2],[3]], dtype=object)
print("object 数组 dtype:", r.dtype, "元素是 Python 对象, 向量化失效:", type(r[0]).__name__)`,
    out:`shape (2, 3, 4) strides(bytes) (48, 16, 4) itemsize 4 nbytes 96
a[1,2,3] = 23  手算 = 23
a[0,1,0] = 4  手算 = 4
strides 递减: True
(5,) ndim 1 strides (8,) 共享内存 True
(5, 1) ndim 2 strides (8, 8) 共享内存 True
(1, 5) ndim 2 strides (40, 8) 共享内存 True
object 数组 dtype: object 元素是 Python 对象, 向量化失效: list`,
    note:`at() 函数就是第 3-4 步的地址公式；三个 reshape 的 strides 与 shares_memory 对应第 5 步；object 数组对应第 7 步。`
  },
  contrast:[
    {vs:`Python 嵌套 list`, same:`都能 a[i][j] 取二维数据`, diff:`list 每层存指针、元素散在堆上；ndarray 是一片连续的值`, when:`同 dtype 成批算用 ndarray；混类型、变长、频繁 append 用 list`},
    {vs:`torch.Tensor`, same:`同样是连续内存 + shape + strides，API 几乎一样`, diff:`Tensor 多了设备(GPU)和 autograd 记录；ndarray 只在 CPU 且不记梯度`, when:`训练模型用 Tensor；预处理、分析、画图用 ndarray`},
    {vs:`pandas DataFrame`, same:`二维表都能按行列取`, diff:`DataFrame 每列一个 dtype 且有标签；ndarray 全体一个 dtype、只有位置`, when:`列异构、要按名字取用 DataFrame；喂模型前转成 ndarray`}
  ],
  ext:[
    {t:`shape 和 strides 决定了 reshape/转置何时是零拷贝视图`, go:'np.reshape'},
    {t:`长度 1 的轴是广播插槽`, go:'np.broadcast'},
    {t:`同一模型加上设备与梯度就是 PyTorch 张量`, go:'pt.tensor'}
  ]
},

'np.broadcast': {
  layers:{
    alg:`逐元素运算 f(A,B) 要求 shape 相同。广播定义了一个把 (A,B) 映射到公共 shape 的规则：右对齐，每位取 max，前提是每位相等或有一方是 1（缺失当 1）。`,
    geo:`小数组被「复印」铺满大数组：一列 (3,1) 向右拉成 (3,4)，一行 (1,4) 向下拉成 (3,4)，两张同样大的纸叠在一起逐格相加。`,
    comp:`机器不复印。把要拉伸的那一维 stride 设成 0，指针沿这一维走一步不动，同一个数被读 4 次。所以广播零内存、零拷贝。`
  },
  proof:{
    from:`ndarray = 内存 + shape + strides；逐元素 ufunc 对两个同 shape 数组按位置配对`,
    to:`广播规则必然是「右对齐 + 相等或为 1」，且实现是 stride 置 0 的虚拟复制`,
    steps:[
      [`要让 (3,1) 和 (1,4) 逐元素相加，必须先把两者变成同一个 shape (3,4)`, `ufunc 的定义域是位置配对，没有公共 shape 就没法配对`],
      [`长度为 1 的轴可以被「拉伸」到任意长度而不需要新信息：每个位置都是同一个值`, `拉伸长度 n 的轴到 m≠n 要凭空造 m-n 个值，没有唯一答案，所以只有 1 能拉伸`],
      [`拉伸不用复制：把该轴 stride 置 0，地址公式 base + i·0 = base，读到同一个数`, `strides 是元数据，as_strided 能构造出 (3,4) 但只占 3 个数的内存`],
      [`两个数组 ndim 不同：短的在左边补 1`, `为什么是左边：行优先下最后一维是「最内层、变化最快」的，(3,) 自然指一行的 3 个值，配到列上；左补 1 等价于右对齐`],
      [`补齐后逐位检查：相等→保留；一方为 1→取另一方；否则无定义→报错`, `这是第 2 步的直接推论，规则里没有任何额外约定`],
      [`(5,3) 与 (5,) 报错：右对齐 3 对 5，不等也非 1`, `想按行减均值要 (5,1)：keepdims=True 或 [:,None] 就是显式插一个可拉伸的轴`],
      [`结果 shape 每位 = max(该位)，这就是 np.broadcast_shapes`, `手写这个规则和 NumPy 逐一对照一致，说明规则就这一条`]
    ],
    end:`广播 = 「只有 1 能无损拉伸」+「拉伸用 stride 0 实现」。记住右对齐和 keepdims，90% 的 shape 报错都是这一条。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
from numpy.lib.stride_tricks import as_strided
# 1. 手写广播对齐规则：右对齐，每位相等或有 1，缺失当 1
def bshape(*shapes):
    n = max(len(s) for s in shapes)
    out = []
    for dims in zip(*[(1,)*(n-len(s)) + tuple(s) for s in shapes]):   # 左补 1 = 右对齐
        non1 = {d for d in dims if d != 1}
        if len(non1) > 1: raise ValueError(f"不能广播 {shapes}")
        out.append(non1.pop() if non1 else 1)
    return tuple(out)
for shapes in [((3,1),(1,4)), ((5,3),(3,)), ((8,1,6,1),(7,1,5)), ((2,3,4),(3,1)), ((5,3),(5,))]:
    try: mine = bshape(*shapes)
    except ValueError: mine = "Error"
    try: ref = np.broadcast_shapes(*shapes)
    except ValueError: ref = "Error"
    print(shapes, "->", mine, "np:", ref, "一致" if mine == ref else "不一致")
# 2. 广播的实现：stride 置 0 = 虚拟复制，不占新内存
col = np.arange(3).reshape(3,1) * 10        # (3,1)
virt = as_strided(col, shape=(3,4), strides=(col.strides[0], 0))   # 列方向 stride=0
print("虚拟复制:\\n", virt, "\\n共享内存:", np.shares_memory(col, virt), " nbytes 实际:", col.nbytes)
print("与 np.broadcast_to 一致:", np.array_equal(virt, np.broadcast_to(col, (3,4))))
# 3. 按行去均值的坑：(5,) 配不上 (5,3)，keepdims 才行
X = np.arange(15.).reshape(5,3)
try: X - X.mean(axis=1)
except ValueError as e: print("X - X.mean(axis=1):", "ValueError")
print("keepdims 后 shape:", (X - X.mean(axis=1, keepdims=True)).shape)`,
    out:`((3, 1), (1, 4)) -> (3, 4) np: (3, 4) 一致
((5, 3), (3,)) -> (5, 3) np: (5, 3) 一致
((8, 1, 6, 1), (7, 1, 5)) -> (8, 7, 6, 5) np: (8, 7, 6, 5) 一致
((2, 3, 4), (3, 1)) -> (2, 3, 4) np: (2, 3, 4) 一致
((5, 3), (5,)) -> Error np: Error 一致
虚拟复制:
 [[ 0  0  0  0]
 [10 10 10 10]
 [20 20 20 20]] 
共享内存: True  nbytes 实际: 24
与 np.broadcast_to 一致: True
X - X.mean(axis=1): ValueError
keepdims 后 shape: (5, 3)`,
    note:`bshape() 是第 4-5 步的规则；as_strided(strides=(…,0)) 是第 3 步的虚拟复制；最后的 ValueError 是第 6 步。`
  },
  contrast:[
    {vs:`np.tile / np.repeat 显式复制`, same:`都能把小数组铺成大数组`, diff:`tile 真的分配新内存并复制；广播只改 strides，零拷贝`, when:`能靠广播就别 tile；需要后续原地修改每份副本时才 tile`},
    {vs:`矩阵乘 @`, same:`都让不同 shape 的数组相互作用`, diff:`广播是逐元素、对齐的是「同一位置」；matmul 是求和收缩、对齐的是内维 k`, when:`加减乘除、比较用广播；线性组合、投影用 @`},
    {vs:`pandas 的索引对齐`, same:`都自动让两个对象配上`, diff:`pandas 按标签名对齐（缺的补 NaN）；NumPy 按位置和长度对齐（配不上报错）`, when:`有意义的行列名用 pandas；纯数值网格用 NumPy`}
  ],
  ext:[
    {t:`keepdims 留下的长度 1 轴就是广播插槽`, go:'np.axis'},
    {t:`matmul 的 batch 维也走广播规则`, go:'np.dot'},
    {t:`标准化 (X-mu)/sd 是广播最常见的用法`, go:'da.normalize'}
  ]
},

'np.dot': {
  layers:{
    alg:`a·b = Σᵢ aᵢbᵢ。矩阵乘 C=A@B 是 C[i,j] = Σₖ A[i,k]B[k,j]：把 k 这一维求和收缩掉，只有 k 相等才能配对。`,
    geo:`点积 = |a||b|cosθ = 把 b 投到 a 方向上的长度乘 |a|。矩阵乘 = 左矩阵每一行分别去和右矩阵每一列比方向，结果表里每个格子是一个「相似度」。`,
    comp:`三重循环 i,j,k；BLAS 把它分块塞进缓存并用 SIMD。batch 维不参与循环，只是把同一段代码在前面的维度上重复；前导维走广播。`
  },
  proof:{
    from:`点积定义 a·b=Σaᵢbᵢ；矩阵是把向量按列（或行）排起来`,
    to:`(m,k)@(k,n)→(m,n)、内维必须相等、* 与 @ 不同、batch 语义只作用于最后两维`,
    steps:[
      [`点积把两个等长向量压成一个数，长度不等无定义`, `Σᵢ 要求 i 走同一个范围，这就是「内维相等」的最原始来源`],
      [`把 A 看成 m 个行向量、B 看成 n 个列向量，两两做点积得 m×n 张表`, `这是矩阵乘的定义；内维 k 是每个行/列向量的长度，被 Σ 吃掉，所以结果里没有 k`],
      [`等价看法：A@B = Σₖ (A 的第 k 列) ⊗ (B 的第 k 行)，k 个秩一矩阵相加`, `把求和顺序交换即可；这个看法解释了为什么 rank(AB) ≤ k`],
      [`* 是 ufunc，走广播按位置相乘，不做求和`, `两种乘法的区别就是有没有 Σ：有 Σ 才有维度收缩`],
      [`一维 (3,)@(3,) 返回标量：两个向量的点积，没有行列之分`, `一维数组既不是行也不是列，NumPy 不会偷偷给它升维；(3,1)@(1,3) 才是外积 (3,3)`],
      [`多维 (…,m,k)@(…,k,n)：只对最后两维做矩阵乘，前面的维度当 batch 逐个重复`, `矩阵乘只定义在二维上；前导维没有别的合理解释，只能是「一沓矩阵各做各的」`],
      [`batch 维 shape 不同时按广播规则配：(2,1,3,4)@(6,4,5)→(2,6,3,5)`, `前导维是逐元素级别的对齐，自然复用广播规则`]
    ],
    end:`@ 是「行·列 + 收缩内维」，* 是「位置对位置」。看到 @ 先对内维，看到多维先把最后两维圈出来。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
A = rng.standard_normal((3,4)); B = rng.standard_normal((4,2))
# 1. 矩阵乘 = 一堆点积：C[i,j] = 左第 i 行 · 右第 j 列
C = np.zeros((3,2))
for i in range(3):
    for j in range(2):
        C[i,j] = sum(A[i,k]*B[k,j] for k in range(4))
print("三重循环 == A@B:", np.allclose(C, A@B))
# 2. 另一个看法：A@B = Σ_k (A 第 k 列 外积 B 第 k 行)
C2 = sum(np.outer(A[:,k], B[k,:]) for k in range(4))
print("外积之和 == A@B:", np.allclose(C2, A@B))
# 3. 点积 = |a||b|cosθ
a = np.array([1.,2,3]); b = np.array([4.,5,6])
cos = a@b/np.linalg.norm(a)/np.linalg.norm(b)
print("a·b =", a@b, " |a||b|cosθ =", round(np.linalg.norm(a)*np.linalg.norm(b)*cos, 6))
# 4. 一维的特殊性：(3,)@(3,) 标量；(3,1)@(1,3) 外积
print("(3,)@(3,) ->", (a@b).shape, " (3,1)@(1,3) ->", (a[:,None]@b[None,:]).shape)
# 5. 批量语义：前面的维度是 batch，按广播配；只有最后两维做矩阵乘
Xb = rng.standard_normal((5,3,4)); Wb = rng.standard_normal((4,2))
Y = Xb @ Wb
print("(5,3,4)@(4,2) ->", Y.shape, " 逐个 batch 相等:", all(np.allclose(Xb[b]@Wb, Y[b]) for b in range(5)))
P = rng.standard_normal((2,1,3,4)); Q = rng.standard_normal((6,4,5))
print("(2,1,3,4)@(6,4,5) ->", (P@Q).shape, " batch 维走广播")
# 6. * 是逐元素（走广播），@ 才是矩阵乘
M = np.arange(4.).reshape(2,2)
print("M*M =", (M*M).tolist(), " M@M =", (M@M).tolist())`,
    out:`三重循环 == A@B: True
外积之和 == A@B: True
a·b = 32.0  |a||b|cosθ = 32.0
(3,)@(3,) -> ()  (3,1)@(1,3) -> (3, 3)
(5,3,4)@(4,2) -> (5, 3, 2)  逐个 batch 相等: True
(2,1,3,4)@(6,4,5) -> (2, 6, 3, 5)  batch 维走广播
M*M = [[0.0, 1.0], [4.0, 9.0]]  M@M = [[2.0, 3.0], [6.0, 11.0]]`,
    note:`三重循环是第 2 步；np.outer 求和是第 3 步；(3,)@(3,) 与 (3,1)@(1,3) 是第 5 步；batch 两例是第 6-7 步。`
  },
  contrast:[
    {vs:`逐元素乘 *`, same:`都叫「乘」，都能作用在两个数组上`, diff:`* 无求和、走广播、shape 相同或可广播；@ 有 Σ、要求内维相等、结果少一维`, when:`缩放、掩码、逐点加权用 *；投影、线性层、变换用 @`},
    {vs:`np.einsum`, same:`都能表达矩阵乘`, diff:`einsum 用下标字符串显式写哪些维求和、哪些保留，matmul 是它「最后两维收缩」的特例`, when:`标准矩阵乘用 @；转置+收缩+批量混在一起说不清时用 einsum`},
    {vs:`np.dot`, same:`二维时和 @ 完全一样`, diff:`dot 对多维是「A 的最后一维 和 B 的倒数第二维」求和，不是 batch 语义`, when:`二维随便；三维以上一律用 @ 或 matmul`}
  ],
  ext:[
    {t:`矩阵乘的 shape 规则与线性变换的复合`, go:'la.matmul_shape'},
    {t:`batch 维走广播`, go:'np.broadcast'},
    {t:`注意力 QKᵀ 就是一次批量矩阵乘`, go:'dl.attention'}
  ]
},

'np.reshape': {
  layers:{
    alg:`reshape 是一个双射 (i,j)↔线性下标 的重新约定：数据序列不变，只换分组方式。转置是坐标置换 (i,j)→(j,i)：读取顺序真的变了。`,
    geo:`一串珠子：reshape 是换一种每行几颗的盘法，珠子顺序不变；转置是把盘好的方阵沿对角线翻个面，行变列。`,
    comp:`reshape：连续数组只改 shape 和 strides，O(1)；转置：交换 strides 两个数，O(1)，但结果不再 C 连续。不连续数组再 reshape 必须先拷贝成连续。`
  },
  proof:{
    from:`ndarray = base + shape + strides；地址 = base + Σ 下标×stride；C 连续 = strides 恰好等于「后面所有维长度之积 × itemsize」`,
    to:`reshape（连续时）与转置都是零拷贝视图；判据是能否用一组 strides 描述新 shape；转置后再 reshape 会拷贝`,
    steps:[
      [`(12,) 的 strides=(8,)；要看成 (3,4)，令 strides=(32,8)，地址 = base + 32i + 8j = base + 8(4i+j)`, `4i+j 正好是原来的线性下标，所以不动一个字节就得到 (3,4) 的读法`],
      [`任何 C 连续数组的 reshape 都能这样构造：新 strides = 后缀积 × itemsize`, `这就是「reshape 便宜」的判据：只要数据在内存里按行优先排好，任何整除的 shape 都只是换元数据`],
      [`转置 (3,4)→(4,3)：把 strides 从 (32,8) 换成 (8,32)`, `新数组 t[i,j] 地址 = base + 8i + 32j = m[j,i] 的地址，正是转置定义；同样零拷贝`],
      [`转置后 strides=(8,32) 不是后缀积 (24,8)，所以不是 C 连续`, `连续性是关于 strides 的一个等式，转置破坏了它`],
      [`对不连续数组 reshape(-1)：需要一个 stride 使 base + s·n 依次遍历 0,4,8,1,5,9,…`, `这个序列不是等差的，一个 stride 描述不了，只能先拷贝成连续再 reshape；这就是 view vs copy 的判据`],
      [`reshape 不是转置：m.reshape(4,3)[0]=[0,1,2] 是把行拆碎重排，m.T[0]=[0,4,8] 才是原第一列`, `一个只换分组、一个换坐标顺序；数据序列是否改变是本质区别`],
      [`图像 (H,W,C)→(C,H,W) 必须 transpose(2,0,1)，reshape(C,H,W) 内容错误`, `reshape 保留了像素在内存的顺序 RGBRGB…，会把一张图切成三张乱码`]
    ],
    end:`能用 strides 描述就是视图，不能就拷贝。reshape 改分组、转置改坐标，改视图会连原数组一起改。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
from numpy.lib.stride_tricks import as_strided
a = np.arange(12)                       # 内存：一条线 0..11，stride 8 字节
print("a.strides", a.strides)
# 1. reshape = 只换 shape 和 strides，数据不动。用 as_strided 手工复现
r = as_strided(a, shape=(3,4), strides=(4*8, 8))
print("手工 reshape(3,4) == a.reshape(3,4):", np.array_equal(r, a.reshape(3,4)), " 共享内存:", np.shares_memory(a, r))
# 2. 转置 = 只交换 strides，同样不动数据
m = a.reshape(3,4)
t = as_strided(m, shape=(4,3), strides=(8, 32))            # 把 (32,8) 换成 (8,32)
print("手工转置 == m.T:", np.array_equal(t, m.T), " m.T.strides =", m.T.strides, " 共享:", np.shares_memory(m, m.T))
# 3. reshape 不是转置
print("m.reshape(4,3)[0] =", m.reshape(4,3)[0].tolist(), "  m.T[0] =", m.T[0].tolist())
# 4. view vs copy 的判据：能否用一组 strides 描述目标 shape。转置后已不连续，再 reshape 只能拷贝
mt = m.T
print("m.T 连续?", mt.flags.c_contiguous, " m.T.reshape(-1) 共享内存?", np.shares_memory(mt, mt.reshape(-1)))
print("m.reshape(-1) 共享内存?", np.shares_memory(m, m.reshape(-1)))
# 5. 改 view 会改原数组；改 copy 不会
v = m.T; v[0,0] = 99; print("改 m.T[0,0] 后 a[0] =", a[0])
c = mt.reshape(-1); c[0] = -1; print("改 m.T.reshape(-1)[0] 后 a[0] =", a[0])
# 6. 图像 (H,W,C)->(C,H,W) 用 transpose，不是 reshape
img = np.arange(2*3*4).reshape(2,3,4)
print("transpose(2,0,1).shape", img.transpose(2,0,1).shape, " strides", img.transpose(2,0,1).strides, " 与 reshape(4,2,3) 相同内容?", np.array_equal(img.transpose(2,0,1), img.reshape(4,2,3)))`,
    out:`a.strides (8,)
手工 reshape(3,4) == a.reshape(3,4): True  共享内存: True
手工转置 == m.T: True  m.T.strides = (8, 32)  共享: True
m.reshape(4,3)[0] = [0, 1, 2]   m.T[0] = [0, 4, 8]
m.T 连续? False  m.T.reshape(-1) 共享内存? False
m.reshape(-1) 共享内存? True
改 m.T[0,0] 后 a[0] = 99
改 m.T.reshape(-1)[0] 后 a[0] = 99
transpose(2,0,1).shape (4, 2, 3)  strides (8, 96, 32)  与 reshape(4,2,3) 相同内容? False`,
    note:`两次 as_strided 分别是第 1 步和第 3 步；flags.c_contiguous 与 shares_memory 是第 4-5 步的判据；最后两行是第 6-7 步。`
  },
  contrast:[
    {vs:`转置 .T / transpose`, same:`都能把 (3,4) 变成 (4,3)，都是零拷贝`, diff:`reshape 保持内存顺序只改分组；转置改坐标顺序、破坏连续性`, when:`拉平/分块/加减轴用 reshape；交换维度含义（HWC↔CHW、行↔列）用 transpose`},
    {vs:`np.ravel 与 flatten`, same:`都把数组拉成一维`, diff:`ravel 能视图就视图（连续时零拷贝）；flatten 永远拷贝`, when:`只读用 ravel；要独立副本用 flatten 或 copy()`},
    {vs:`切片视图 a[2:5]`, same:`都是共享内存的视图`, diff:`切片改 base 与 shape，reshape 改 shape 与 strides；两者都不拷贝`, when:`取子块用切片，换形状用 reshape，两者可以叠加`}
  ],
  ext:[
    {t:`strides 的来源：ndarray 的三件套`, go:'np.array_shape'},
    {t:`转置是坐标置换，本质是线性变换`, go:'la.matrix_transform'},
    {t:`CNN 输入 (N,C,H,W) 的轴顺序约定`, go:'dl.cnn'}
  ]
},

'np.axis': {
  layers:{
    alg:`沿 axis=k 归约 = 对固定其他下标、让第 k 个下标跑遍的一条 1D 切片做 f。结果 shape = 原 shape 去掉第 k 位。axis 是「被吃掉的轴」。`,
    geo:`(行,列) 表：axis=0 是竖着压扁，每列剩一个数；axis=1 是横着压扁，每行剩一个数。被压扁的方向消失。`,
    comp:`把目标轴挪到最后，遍历剩下所有下标组合，每次对最内层连续一段做 reduce。keepdims 只是在结果里补一个长度 1 的轴。`
  },
  proof:{
    from:`归约函数 f 把一个 1D 序列变成一个数；多维数组是很多 1D 切片的堆叠`,
    to:`sum/mean/max(axis=k) 的结果 shape 是去掉第 k 位；多轴归约同理；keepdims 为广播服务`,
    steps:[
      [`f 只吃 1D 序列。要在 (2,3,4) 上用 f，必须先说清「哪一维是序列」`, `没有这句话，f 不知道该把哪 4 个（或 3 个、2 个）数当成一组`],
      [`指定 axis=k 后，固定其余下标 (i₁,…,i_{k-1},i_{k+1},…)，第 k 个下标跑遍，就是一条 1D 切片`, `这是唯一能从多维里切出 1D 序列而不混合其他维的方式`],
      [`每条切片给一个数，切片的编号正好是「去掉第 k 位后的下标」，所以结果 shape 少了第 k 位`, `结果的每个位置对应一条切片，切片由剩下的下标唯一确定`],
      [`「按列求均值」= 每列一条切片 = 沿行跑 = axis=0：直觉常反，因为人说的是「留下」列，NumPy 说的是「吃掉」行`, `两种说法互补，记「axis 是被吃掉的」就不会反`],
      [`axis=(0,1,2) 一次吃多个轴：把这几维合并成一条更长的切片`, `切片的定义允许任意子集的下标跑遍，剩下的仍然确定结果位置`],
      [`keepdims=True 把被吃掉的轴留成长度 1`, `长度 1 的轴是广播插槽，(5,1) 才能广播回 (5,3)；(5,) 会右对齐到 3 上报错`],
      [`argmax 也是归约：切片→那条切片里最大值的位置，结果 shape 同样少一位`, `归约的定义只要求「1D 切片 → 一个值」，值是什么类型无所谓`]
    ],
    end:`axis 就是「被吃掉的那一维」。先想清楚哪些下标固定、哪个下标跑遍，shape 自然就对了。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
X = np.arange(2*3*4).reshape(2,3,4)
# 手写「沿 axis 归约」：被吃掉的那一维在结果里消失，其他维原样保留
def reduce_axis(x, axis, f=np.add.reduce):
    x = np.moveaxis(x, axis, -1)                 # 把要吃的轴挪到最后
    out = np.empty(x.shape[:-1], dtype=x.dtype)
    for idx in np.ndindex(*x.shape[:-1]):        # 遍历所有「剩下的」下标
        out[idx] = f(x[idx])                     # 对那一条 1D 切片做归约
    return out
for ax in [0, 1, 2]:
    mine = reduce_axis(X, ax)
    print(f"axis={ax}: 结果 shape {mine.shape}  == X.sum(axis={ax}):", np.array_equal(mine, X.sum(axis=ax)))
# 二维直觉：axis=0 竖着压（每列一个数），axis=1 横着压（每行一个数）
M = np.array([[1,2],[3,4]])
print("sum(axis=0)", M.sum(axis=0).tolist(), " sum(axis=1)", M.sum(axis=1).tolist())
# 多轴一起吃：(N,H,W,C) 每通道均值
img = np.random.default_rng(0).random((8,5,5,3))
print("(8,5,5,3).mean(axis=(0,1,2)).shape =", img.mean(axis=(0,1,2)).shape)
# keepdims：留一根长度 1 的轴，才能广播回去
A = np.arange(15.).reshape(5,3)
print("mean(axis=1).shape", A.mean(axis=1).shape, " keepdims", A.mean(axis=1, keepdims=True).shape,
      " 按行去均值后每行均值:", np.round((A - A.mean(axis=1, keepdims=True)).mean(axis=1), 12).tolist())
# argmax 也是归约：吃掉那一轴，返回位置
print("(4,5).argmax(axis=1).shape =", np.random.default_rng(1).random((4,5)).argmax(axis=1).shape)`,
    out:`axis=0: 结果 shape (3, 4)  == X.sum(axis=0): True
axis=1: 结果 shape (2, 4)  == X.sum(axis=1): True
axis=2: 结果 shape (2, 3)  == X.sum(axis=2): True
sum(axis=0) [4, 6]  sum(axis=1) [3, 7]
(8,5,5,3).mean(axis=(0,1,2)).shape = (3,)
mean(axis=1).shape (5,)  keepdims (5, 1)  按行去均值后每行均值: [0.0, 0.0, 0.0, 0.0, 0.0]
(4,5).argmax(axis=1).shape = (4,)`,
    note:`reduce_axis() 里 moveaxis + ndindex 就是第 2-3 步；(8,5,5,3).mean(axis=(0,1,2)) 是第 5 步；keepdims 那行是第 6 步。`
  },
  contrast:[
    {vs:`groupby 聚合`, same:`都是「分组后各算一个数」`, diff:`axis 归约的分组是规则网格的一个维度；groupby 的分组由一列值决定，组数不定`, when:`张量沿维压缩用 axis；表按类别列聚合用 groupby`},
    {vs:`逐元素 ufunc（np.exp 等）`, same:`都是对整个数组一次调用`, diff:`ufunc 不改 shape；归约少一维`, when:`变换每个值用 ufunc；汇总用归约`},
    {vs:`np.cumsum(axis=k)`, same:`都沿一条轴走`, diff:`cumsum 是扫描，保留每一步的中间结果，shape 不变；sum 只留最后一个`, when:`要累计曲线用 cumsum，要总量用 sum`}
  ],
  ext:[
    {t:`keepdims 留下的轴靠广播回去`, go:'np.broadcast'},
    {t:`按类别列而非按维度分组`, go:'da.groupby'},
    {t:`mean(axis=0) 就是样本均值，是期望的估计`, go:'pr.expectation'}
  ]
},

'np.overflow': {
  layers:{
    alg:`int8 是模 2⁸ 的环 Z/256 平移到 [-128,127]：127+1 ≡ -128。float32 = 符号 + 8 位指数 + 23 位尾数，相邻可表示数间距 = 2^(e-23)，机器 ε = 2⁻²³。`,
    geo:`整数是一个 256 格的里程表，跑到头绕回；浮点是一把越远刻度越稀的尺子，1 附近刻度 1e-7，1e8 附近刻度 8。`,
    comp:`CPU 做整数加法丢弃进位，不报错；浮点加法先对齐指数，小数的低位被移出尾数丢掉。exp(1000) 超过最大指数直接给 inf。`
  },
  proof:{
    from:`每个数占固定 bit；整数用二进制补码；浮点 = (1+尾数)×2^指数，尾数 23 位`,
    to:`整数溢出是位环绕（模运算）；float32 的 ε=2⁻²³，大于 2²⁴ 的整数不再连续可表示；大数吃小数`,
    steps:[
      [`8 位能表示 256 个状态；补码约定最高位是 -128`, `这样加法电路对正负数统一，代价是 127+1 的进位溢出到第 9 位被丢掉`],
      [`丢掉进位 = 结果对 256 取模，再映射回 [-128,127]：(x+128) mod 256 - 128`, `这就是「环绕」的公式，输出里 int8(127)+1 = -128 与公式完全一致`],
      [`uint8 图像 (a+b)//2：a+b 先在 uint8 里算，250+10=260 mod 256=4，再除 2 得 2`, `运算的 dtype 由操作数决定，除法在溢出之后；先 astype(float) 才能把中间结果放进更大的格子`],
      [`float32 的尾数 23 位，隐含首位 1，共 24 位有效数字。1 后面能表示的下一个数是 1+2⁻²³`, `这个间距就是机器 ε；1+ε/2 落在两个可表示数中间，四舍五入回 1`],
      [`指数每加 1，间距翻倍：x 附近间距 = 2^(⌊log₂x⌋-23)。到 2²⁴ 时间距变成 2，所以 2²⁴+1 表示不了`, `24 位有效数字只能数到 2²⁴=16777216，再往上整数开始跳`],
      [`1e8 附近间距是 8，加 1 不够跨过半个间距，四舍五入回 1e8`, `「大数吃小数」不是 bug，是尺子在那里的刻度就是 8`],
      [`exp(1000)：1000/ln2≈1443 位指数，float64 最大指数 1023，溢出成 inf；inf/inf = nan`, `softmax 先减 max 是把所有指数平移到 ≤0，exp 落在 (0,1]，数学上恒等（分子分母同乘 e^{-max}）`]
    ],
    end:`dtype 是格子大小。整数溢出绕圈、浮点大数吃小数、指数上溢成 inf，三种病根都是「格子有限」。算之前先想值域。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np, warnings
warnings.simplefilter("ignore")
# 1. 整数溢出 = 模 2^bits 的环绕
def wrap_int8(x): return (x + 128) % 256 - 128
def wrap_uint8(x): return x % 256
print("int8 127+1 :", int(np.int8(127) + np.int8(1)), " 公式:", wrap_int8(128))
print("uint8 200+100:", int(np.uint8(200) + np.uint8(100)), " 公式:", wrap_uint8(300))
a = np.array([250, 200], dtype=np.uint8); b = np.array([10, 100], dtype=np.uint8)
print("uint8 图像 (a+b)//2 :", ((a+b)//2).tolist(), "  先 astype(float):", ((a.astype(float)+b)/2).tolist())
# 2. float32：24 位有效数字，机器 epsilon = 2^-23
eps32 = np.finfo(np.float32).eps
print("float32 eps =", eps32, "== 2^-23:", eps32 == 2.0**-23, "  float64 eps =", np.finfo(np.float64).eps)
print("float32(1)+eps != 1:", np.float32(1)+np.float32(eps32) != np.float32(1), " float32(1)+eps/2 == 1:", np.float32(1)+np.float32(eps32/2) == np.float32(1))
# 3. 精度边界：整数只能精确到 2^24
print("float32(2^24)+1 ==", int(np.float32(2**24) + np.float32(1)), " (2^24 =", 2**24, ")")
print("float32(1e8)+1 == 1e8:", np.float32(1e8) + np.float32(1) == np.float32(1e8))
# 4. 相邻可表示数的间距随大小变大：越远刻度越稀
for v in [1.0, 1e3, 1e6, 1e8]:
    print(f"  float32 在 {v:g} 附近的间距 = {np.spacing(np.float32(v)):.3g}")
# 5. exp 溢出与 log-sum-exp
x = np.array([1000., 1001., 1002.])
print("exp(x) 直接:", np.exp(x)[:1], " softmax 直接:", np.exp(x)/np.exp(x).sum())
z = x - x.max(); print("先减 max:", np.round(np.exp(z)/np.exp(z).sum(), 4))`,
    out:`int8 127+1 : -128  公式: -128
uint8 200+100: 44  公式: 44
uint8 图像 (a+b)//2 : [2, 22]   先 astype(float): [130.0, 150.0]
float32 eps = 1.1920929e-07 == 2^-23: True   float64 eps = 2.220446049250313e-16
float32(1)+eps != 1: True  float32(1)+eps/2 == 1: True
float32(2^24)+1 == 16777216  (2^24 = 16777216 )
float32(1e8)+1 == 1e8: True
  float32 在 1 附近的间距 = 1.19e-07
  float32 在 1000 附近的间距 = 6.1e-05
  float32 在 1e+06 附近的间距 = 0.0625
  float32 在 1e+08 附近的间距 = 8
exp(x) 直接: [inf]  softmax 直接: [nan nan nan]
先减 max: [0.09   0.2447 0.6652]`,
    note:`wrap_int8 是第 2 步的模公式；(a+b)//2 是第 3 步；eps 与 2²⁴ 两行是第 4-5 步；spacing 表是第 5-6 步；log-sum-exp 是第 7 步。`
  },
  contrast:[
    {vs:`Python 原生 int`, same:`都叫整数`, diff:`Python int 任意精度自动扩容，永不溢出；NumPy 整数是固定 bit 的 C 类型`, when:`少量大整数（阶乘、大计数）用 Python int；成批数值用 NumPy 并盯住 dtype`},
    {vs:`float64`, same:`同样的 IEEE 754 结构`, diff:`尾数 52 位，ε≈2.2e-16，整数连续到 2⁵³；float32 只到 2²⁴`, when:`科学计算默认 float64；深度学习为省显存用 float32/16 但要防溢出`},
    {vs:`NaN`, same:`都是「算出了不正常的数」`, diff:`溢出是值超出范围（inf 或环绕）；NaN 是无定义运算（0/0、inf-inf）的结果，且会传染`, when:`看到 inf 查上溢；看到 NaN 查除零、log 负数、inf 相减`}
  ],
  ext:[
    {t:`二进制位与补码的来源`, go:'di.bits'},
    {t:`数量级思维：先估值域再选 dtype`, go:'ns.magnitude'},
    {t:`混合精度训练里 float16 的溢出与 loss scaling`, go:'pt.amp'}
  ]
},

'np.random': {
  layers:{
    alg:`伪随机数是确定性递推 xₙ₊₁ = g(xₙ)，seed 是 x₀。样本均值 x̄ 的方差 = σ²/n，标准差 σ/√n：这是 Var(ΣXᵢ)=nσ² 除以 n² 的直接结果。`,
    geo:`seed 是迷宫的入口，同一个入口走出来的路径一模一样。样本均值的抖动是一个随 n 缩小的钟形，宽度按 1/√n 收：样本 4 倍，宽度减半。`,
    comp:`default_rng(seed) 建一个 PCG64 状态机，每次 .random() 推进状态并输出。shuffle 原地交换元素；permutation 先拷贝再 shuffle；integers 高端不含。`
  },
  proof:{
    from:`计算机是确定性的；方差的线性性 Var(aX)=a²Var(X)，独立和的方差可加`,
    to:`seed 决定整条随机序列；样本均值的标准差 = σ/√n；误差减半要 4 倍样本`,
    steps:[
      [`确定性机器造不出真随机，只能造一个递推 xₙ₊₁ = g(xₙ) 让输出看起来均匀且无关`, `LCG (ax+c) mod m 就是最简单的 g；PCG64 是更好的 g，原理相同`],
      [`给定 x₀=seed，整条序列被唯一决定`, `递推是函数，输入相同输出必相同；这就是可复现性的全部来源，也是为什么不设 seed 每次结果不同`],
      [`n 个独立同分布样本的和 S=ΣXᵢ 有 Var(S)=nσ²`, `独立时协方差为 0，方差直接相加`],
      [`样本均值 x̄=S/n，Var(x̄)=Var(S)/n²=σ²/n`, `除以常数 n 让方差除以 n²，这是 Var(aX)=a²Var(X)`],
      [`开根号：std(x̄)=σ/√n`, `这就是模拟里实测 std 与 σ/√n 逐行吻合的原因；n=10→640 涨 64 倍，std 缩 8 倍`],
      [`要把误差减半，需要 √n 翻倍，即 n 变 4 倍`, `成本与精度的平方成反比，实验设计时决定 n 的第一性公式`],
      [`CLT 进一步说 x̄ 的分布趋近正态，与 Xᵢ 的分布无关`, `所以 SEM=σ/√n 加 1.96 倍就是 95% 置信区间`]
    ],
    end:`seed 管可复现，σ/√n 管精度。前者是工程纪律，后者是决定样本量的物理定律。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 1. 伪随机 = 确定性序列，seed 是起点
g1, g2 = np.random.default_rng(42), np.random.default_rng(42)
print("同 seed 同序列:", np.array_equal(g1.random(5), g2.random(5)), " 不同 seed:", np.array_equal(np.random.default_rng(1).random(3), np.random.default_rng(2).random(3)))
# 2. 手写一个 LCG 说明「确定性」：x_{n+1} = (a x_n + c) mod m
def lcg(seed, n, a=1664525, c=1013904223, m=2**32):
    x = seed; out = []
    for _ in range(n): x = (a*x + c) % m; out.append(x/m)
    return out
print("LCG seed=7 两次:", lcg(7,3) == lcg(7,3), " 前 3 个:", [round(v,4) for v in lcg(7,3)])
# 3. 样本均值的标准差 = σ/√n（CLT）
rng = np.random.default_rng(0); sigma = 2.0
for n in [10, 40, 160, 640]:
    means = rng.normal(0, sigma, size=(20000, n)).mean(axis=1)
    print(f"n={n:<4} 样本均值 std 实测={means.std():.4f}  理论 σ/√n={sigma/np.sqrt(n):.4f}")
# 4. integers 高端不含；shuffle 原地，permutation 返回新的
r = np.random.default_rng(3)
print("integers(0,3) 取值集合:", sorted(set(r.integers(0, 3, 1000).tolist())))
x = np.arange(5); p = r.permutation(x); print("permutation 后 x 不变:", x.tolist(), " 新数组:", p.tolist())
r.shuffle(x); print("shuffle 后 x 变了:", x.tolist())`,
    out:`同 seed 同序列: True  不同 seed: False
LCG seed=7 两次: True  前 3 个: [0.2388, 0.9135, 0.6125]
n=10   样本均值 std 实测=0.6308  理论 σ/√n=0.6325
n=40   样本均值 std 实测=0.3158  理论 σ/√n=0.3162
n=160  样本均值 std 实测=0.1578  理论 σ/√n=0.1581
n=640  样本均值 std 实测=0.0791  理论 σ/√n=0.0791
integers(0,3) 取值集合: [0, 1, 2]
permutation 后 x 不变: [0, 1, 2, 3, 4]  新数组: [2, 0, 4, 3, 1]
shuffle 后 x 变了: [4, 0, 1, 2, 3]`,
    note:`lcg() 是第 1-2 步的确定性递推；四行 n=10..640 的实测 vs 理论是第 3-5 步；permutation/shuffle 是接口细节。`
  },
  contrast:[
    {vs:`np.random.seed + np.random.rand（旧全局 API）`, same:`都是伪随机、都能设 seed`, diff:`旧 API 改全局状态，任何库调用都会推进它；default_rng 是独立对象，互不干扰`, when:`新代码一律 default_rng(seed) 并把 rng 传下去`},
    {vs:`真随机（os.urandom）`, same:`都输出看起来随机的字节`, diff:`真随机来自硬件噪声不可复现；伪随机可复现`, when:`密码学用真随机；模拟、划分数据集用伪随机并固定 seed`},
    {vs:`SD 与 SEM`, same:`都是「一个 σ」`, diff:`SD 是单个样本的离散 σ；SEM=σ/√n 是样本均值的离散`, when:`描述个体差异报 SD；描述均值估得多准报 SEM 或 CI`}
  ],
  ext:[
    {t:`中心极限定理：为什么均值趋近正态`, go:'pr.clt'},
    {t:`方差的性质 Var(aX)=a²Var(X)`, go:'pr.variance'},
    {t:`训练/测试划分必须固定 seed`, go:'da.split'}
  ]
},

'np.vectorize': {
  layers:{
    alg:`向量化是把 ∀i: yᵢ=f(xᵢ) 这条量词语句交给一个原语一次执行，而不是 n 次调用 f。语义相同，执行模型不同。`,
    geo:`for 循环是一个人一颗颗数珠子，每颗都要先看是什么珠子；向量化是把整串珠子放进一台机器一次过秤。`,
    comp:`Python for 每个元素：取 PyObject → 查类型 → 分派 → 调函数 → 装箱结果，几十条指令。NumPy 把循环下沉到 C 的一个 tight loop：无类型检查、SIMD 一次算 4-8 个、内存连续预取命中缓存。`
  },
  proof:{
    from:`CPython 是解释器，每个字节码都要分派；ndarray 是同 dtype 的连续内存；CPU 有 SIMD 和缓存行`,
    to:`向量化比 for 快 1-2 个数量级，来源是三层：解释器开销消失、SIMD 并行、缓存局部性；np.vectorize 不属于此列`,
    steps:[
      [`Python 循环里 s += v*v 每次要做：取 v（一个 PyFloat 对象）、查 __mul__、分配新对象、再查 __add__、再分配`, `动态类型意味着类型在运行时才知道，每一步都要分派；这是解释器开销，与算术本身无关`],
      [`NumPy 的 x*x 是一次 C 调用：dtype 在入口检查一次，然后一个 for 循环直接乘 double`, `类型在数组级别是已知的，循环体里没有任何分派；这是第一层加速，也是最大的一层`],
      [`C 循环体是紧凑的乘加，编译器把它向量化成 SIMD 指令，一条指令算 4-8 个 double`, `数据连续且同类型才能装进 SIMD 寄存器；list 里的指针做不到`],
      [`连续内存让 CPU 预取器命中缓存行（64 字节 = 8 个 double）；跨步读每读 1 个数就拉一整行`, `同样个数的求和，连续读明显快于 stride 64 字节的跨步读，这就是缓存局部性`],
      [`np.vectorize 只是把 Python 函数包成能接受数组的形式，内部仍逐元素调用 Python`, `它没有绕过第 1 步的分派，所以耗时和手写 for 同量级`],
      [`条件分支也能向量化：np.where(cond, a, b) 先算两支再按掩码选`, `避免逐元素 if；代价是两支都算，但仍远快于解释器循环`],
      [`list*2 是序列重复，ndarray*2 是逐元素乘`, `前者是 Python 序列协议，后者是 ufunc；这是理解「哪些运算天然逐元素」的分界`]
    ],
    end:`快不是因为「用了 NumPy」，是因为消灭了逐元素分派、用上了 SIMD 和缓存。能写成整数组运算的就别写 for。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np, time
rng = np.random.default_rng(0)
x = rng.random(1_000_000)
# 1. 解释器开销：Python for 每个元素都要 取对象 -> 查类型 -> 调用 -> 装箱
t = time.perf_counter(); s1 = 0.0
for v in x: s1 += v*v
t_loop = time.perf_counter() - t
t = time.perf_counter(); s2 = float((x*x).sum()); t_np = time.perf_counter() - t
print(f"结果一致: {abs(s1-s2) < 1e-6}   loop={t_loop*1e3:.0f} ms  numpy={t_np*1e3:.1f} ms  倍数≈{t_loop/t_np:.0f}x")
# 2. np.vectorize 只是语法糖：还是 Python 逐个调
f = np.vectorize(lambda v: v*v)
t = time.perf_counter(); f(x); t_vec = time.perf_counter() - t
print(f"np.vectorize={t_vec*1e3:.0f} ms  (和 loop 同量级, 不是 SIMD)")
# 3. 缓存局部性：同样的加法，沿连续内存 vs 跳着读
M = rng.random((4000, 4000))
rows = M[::8, :]; cols = M[:, ::8]                                           # 元素个数相同
t = time.perf_counter(); rows.sum(); t_row = time.perf_counter() - t         # 每行连续读 (stride 8 B)
t = time.perf_counter(); cols.sum(); t_col = time.perf_counter() - t         # 跳着读 (stride 64 B)
print(f"同样 {rows.size} 个数求和: 连续读 {t_row*1e3:.1f} ms  vs  跨步读 {t_col*1e3:.1f} ms  -> 缓存行被浪费")
# 4. list*2 是重复，ndarray*2 是逐元素
print("[1,2]*2 =", [1,2]*2, "  np.array([1,2])*2 =", (np.array([1,2])*2).tolist())
# 5. 条件也能向量化：np.where 代替 if
y = np.where(x > 0.5, 1, 0)
print("np.where 与循环 if 一致:", y.sum() == sum(1 for v in x[:100000] if v > 0.5) + int((x[100000:] > 0.5).sum()))`,
    out:`结果一致: True   loop=69 ms  numpy=1.0 ms  倍数≈68x
np.vectorize=56 ms  (和 loop 同量级, 不是 SIMD)
同样 2000000 个数求和: 连续读 1.1 ms  vs  跨步读 3.9 ms  -> 缓存行被浪费
[1,2]*2 = [1, 2, 1, 2]   np.array([1,2])*2 = [2, 4]
np.where 与循环 if 一致: True`,
    note:`loop vs numpy 计时是第 1-2 步；np.vectorize 那行是第 5 步；连续读 vs 跨步读是第 4 步；np.where 是第 6 步。时间数值每次运行会略有不同。`
  },
  contrast:[
    {vs:`列表推导式`, same:`都比裸 for 写得短`, diff:`推导式仍是 Python 逐元素执行，只省了 append 的属性查找；向量化下沉到 C`, when:`元素是 Python 对象（字符串、字典）用推导式；数值数组用 NumPy`},
    {vs:`numba / Cython`, same:`都能把数值循环变成机器码`, diff:`NumPy 只加速「能写成数组表达式」的模式；numba 能加速任意形状的循环（如递推依赖）`, when:`先向量化；有前后依赖、写不成数组式的循环再上 numba`},
    {vs:`多进程并行`, same:`都追求「同时算很多」`, diff:`SIMD 是一个核心一条指令算多个数；多进程是多个核心各跑一份解释器`, when:`单核向量化优先；数据能切块且每块都重时再多进程`}
  ],
  ext:[
    {t:`布尔掩码是向量化条件的核心工具`, go:'np.mask'},
    {t:`复杂度记号：常数因子 vs 阶`, go:'py.bigo'},
    {t:`DataFrame 上同样的道理：apply 是慢速兜底`, go:'da.apply'}
  ]
},

'np.mask': {
  layers:{
    alg:`索引是一个「位置选择函数」。切片 a[i:j:k] 是等差数列，用 (base, shape, stride) 就能描述；布尔掩码等价于 nonzero 后的整数数组，整数数组是任意映射 idx→位置，可重复可乱序。`,
    geo:`掩码是一张和数组同形的透明胶片，涂黑的格子被挑出来排成一行；花式索引是一张点名单，按单子顺序把格子拎出来，同一个格子可以点两次。`,
    comp:`切片只算新 base/shape/strides，返回视图；掩码先 nonzero 得位置数组，再逐个 gather 到新内存，所以是副本。a[mask]=v 是 scatter，直接写原内存。`
  },
  proof:{
    from:`ndarray 视图 = base + shape + strides；任意位置集合一般不是等差数列`,
    to:`布尔掩码与花式索引返回副本、切片返回视图；掩码长度必须等于被索引轴；条件组合用 & | 加括号`,
    steps:[
      [`切片选中的位置是等差数列 i, i+k, i+2k…，可以用一个 stride 描述`, `所以切片只改元数据，返回视图，不拷贝`],
      [`掩码 [F,F,F,T,T,T,T,F,F,F] 选中 3,4,5,6，一般情况下选中的位置没有规律`, `没有等差结构就没有 stride 能描述，必须把值一个个搬到新内存，因此是副本`],
      [`布尔掩码 ≡ 整数数组 np.nonzero(mask)：先把 True 的位置列出来再 gather`, `两种索引在实现上汇合成同一条路径，所以 a[mask] == a[np.nonzero(mask)]`],
      [`整数数组允许重复和乱序：a[[7,0,7,3]] 就是按单子逐个取`, `gather 只是 out[t] = a[idx[t]]，对 idx 没有任何单调或唯一要求`],
      [`掩码长度必须等于被索引轴的长度`, `掩码的第 t 位对应轴上第 t 个位置，长度不等就有位置没有对应的真值，无定义`],
      [`a[mask]=0 生效但 a[mask][0]=-1 不生效`, `前者是 __setitem__，直接 scatter 写进原内存；后者先 __getitem__ 得到副本，再改副本`],
      [`(a>1) and (a<5) 报错：and 要求整个数组有一个真值；& 是逐元素位运算，优先级高于 > 所以要加括号`, `Python 的 and 不能重载为逐元素，NumPy 只能借用 & | ~`]
    ],
    end:`规则位置→视图，任意位置→副本。筛选用掩码，重排用整数数组，改值一步写 a[mask]=v。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
a = np.arange(10) * 10
# 1. 布尔掩码 = 「要哪些位置」的 0/1 表；等价于 nonzero 后按整数下标挑
mask = (a > 20) & (a < 70)
print("mask:", mask.astype(int).tolist(), " 位置:", np.nonzero(mask)[0].tolist())
print("a[mask] =", a[mask].tolist(), " == a[np.nonzero(mask)]:", np.array_equal(a[mask], a[np.nonzero(mask)]))
# 手写花式索引：按整数数组逐个取，可重复可乱序
def take(x, idx): return np.array([x[i] for i in idx])
idx = [7, 0, 7, 3]
print("手写 take:", take(a, idx).tolist(), " a[idx]:", a[idx].tolist())
# 2. 掩码/花式索引返回副本，切片返回视图
sl = a[2:5]; fm = a[mask]; fi = a[idx]
print("切片共享内存:", np.shares_memory(a, sl), " 掩码:", np.shares_memory(a, fm), " 花式:", np.shares_memory(a, fi))
b = a.copy(); b[b > 50] = 0; print("a[mask]=0 原地改:", b.tolist())
c = a.copy(); c[c > 50][0] = -1; print("c[c>50][0]=-1 改的是副本, c 不变:", c[6])
# 3. and/or 报错，要 & | 并加括号
try: (a > 1) and (a < 5)
except ValueError: print("(a>1) and (a<5): ValueError (真值不明确)")
# 4. 掩码长度必须等于被索引轴
M = np.arange(12).reshape(3,4)
print("行掩码 (3,) ->", M[np.array([True, False, True])].shape, " 列掩码 (4,) ->", M[:, np.array([1,0,1,0], bool)].shape)
try: M[np.array([True, False])]
except IndexError: print("长度 2 的掩码索引 3 行: IndexError")`,
    out:`mask: [0, 0, 0, 1, 1, 1, 1, 0, 0, 0]  位置: [3, 4, 5, 6]
a[mask] = [30, 40, 50, 60]  == a[np.nonzero(mask)]: True
手写 take: [70, 0, 70, 30]  a[idx]: [70, 0, 70, 30]
切片共享内存: True  掩码: False  花式: False
a[mask]=0 原地改: [0, 10, 20, 30, 40, 50, 0, 0, 0, 0]
c[c>50][0]=-1 改的是副本, c 不变: 60
(a>1) and (a<5): ValueError (真值不明确)
行掩码 (3,) -> (2, 4)  列掩码 (4,) -> (3, 2)
长度 2 的掩码索引 3 行: IndexError`,
    note:`nonzero 那行是第 3 步；手写 take 是第 4 步；三个 shares_memory 是第 1-2 步；c[c>50][0] 是第 6 步；ValueError 与 IndexError 分别是第 7、5 步。`
  },
  contrast:[
    {vs:`切片 a[2:5]`, same:`都是「取一部分」`, diff:`切片是视图、位置等差；掩码/花式是副本、位置任意`, when:`取连续块用切片（还能原地改）；按条件筛或按名单挑用掩码/花式`},
    {vs:`np.where(cond, x, y)`, same:`都基于布尔条件`, diff:`a[mask] 缩短数组只留 True 的；np.where 保持 shape，False 的位置填 y`, when:`要过滤掉用掩码；要保形替换用 where`},
    {vs:`pandas 的 df[df.a>0]`, same:`语法一样，都是布尔筛行`, diff:`pandas 按标签对齐掩码，且链式赋值 df[m]["b"]=1 静默失效`, when:`pandas 里改值一律 df.loc[m, "b"]=1`}
  ],
  ext:[
    {t:`掩码是向量化条件的基础`, go:'np.vectorize'},
    {t:`Python 切片规则与视图`, go:'py.slice'},
    {t:`清洗缺失：isna 就是一张掩码`, go:'da.clean'}
  ]
},

'np.linalg': {
  layers:{
    alg:`solve(A,b) 解 Ax=b，走 LU 分解；inv 也走 LU 但要解 n 个方程再乘 b，误差多一轮放大。eig 给 A V = V diag(w)，特征向量是 V 的列。svd 给 A = U diag(s) Vt，返回的已是 Vᵀ。`,
    geo:`Ax=b 是问「哪个 x 被 A 变成了 b」；inv 是先把整个变换倒过来再作用，solve 是直接倒推这一个点。eig 找变换只拉伸不旋转的方向；svd 找变换把哪个正交系送到哪个正交系。`,
    comp:`solve：LU 分解 O(n³/3) + 两次三角回代；inv：LU + n 次回代 O(n³)，再一次矩阵向量乘。病态矩阵下 inv 的每一步误差都被 cond(A) 放大两次。`
  },
  proof:{
    from:`线性方程组的解、特征值定义 Av=λv、SVD 存在性、浮点误差被条件数放大`,
    to:`solve 比 inv 稳；特征向量按列取；对称阵用 eigh；lstsq 等价正规方程但更稳`,
    steps:[
      [`求 x=A⁻¹b 不需要 A⁻¹：把 A 分解成 LU，解 Ly=b 再解 Ux=y`, `两个三角系统回代即可，避免显式构造逆矩阵`],
      [`inv(A) 等价于对单位阵每一列各解一次 Ax=eᵢ，再算 A⁻¹b`, `多做了 n 次求解和一次矩阵乘，每一步都带舍入误差`],
      [`相对误差上界 ∝ cond(A)：solve 放大一次，inv 再乘 b 放大两次`, `Hilbert 矩阵 cond≈1e13 时，输出里 inv@b 误差比 solve 大一个量级`],
      [`eig 返回 (w, V) 满足 A V = V diag(w)，写成列即 A V[:,i] = w[i] V[:,i]`, `矩阵乘的定义决定了「对列成立」；用 V[i,:] 验证会失败`],
      [`对称阵特征值全实、特征向量正交，eigh 用专门算法保证这两点且升序返回`, `协方差矩阵、Gram 矩阵都是对称的，eigh 又快又不会返回复数噪声`],
      [`SVD：A = U diag(s) Vᵀ，NumPy 直接返回 Vᵀ 记作 Vt，奇异值降序`, `按此约定 U @ diag(s) @ Vt 直接复原 A，不用再转置一次`],
      [`最小二乘 min‖Xβ-y‖²：正规方程 XᵀXβ=Xᵀy 把 cond 平方；lstsq 用 QR/SVD 直接解`, `两者数值上一致但 lstsq 对病态 X 更稳；正规方程只在教学时写`]
    ],
    end:`能 solve 别 inv，特征向量看列，对称用 eigh，Vt 已转置。这四条覆盖 90% 的线代调用坑。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
# 1. solve 比 inv 稳：用病态的 Hilbert 矩阵
n = 10
H = 1.0 / (np.arange(1, n+1)[:, None] + np.arange(n)[None, :])
x_true = np.ones(n); b = H @ x_true
x_solve = np.linalg.solve(H, b); x_inv = np.linalg.inv(H) @ b
print(f"cond(H)={np.linalg.cond(H):.1e}")
print(f"solve 误差 {np.abs(x_solve-x_true).max():.2e}   inv@b 误差 {np.abs(x_inv-x_true).max():.2e}")
# 2. eig：特征向量是列。验证 A v = λ v
A = rng.standard_normal((4,4)); w, V = np.linalg.eig(A)
print("按列验证 A@V[:,0] ≈ w[0]*V[:,0]:", np.allclose(A @ V[:,0], w[0]*V[:,0]), "  按行(错):", np.allclose(A @ V[0,:], w[0]*V[0,:]))
# 3. 对称阵用 eigh：实特征值、正交向量、升序
S = A @ A.T; ws, Vs = np.linalg.eigh(S)
print("eigh 特征值升序:", np.all(np.diff(ws) >= 0), " V 正交 VᵀV=I:", np.allclose(Vs.T @ Vs, np.eye(4)), " 全实:", ws.dtype)
# 4. svd 返回的是 Vt（已转置）；A = U diag(s) Vt
U, s, Vt = np.linalg.svd(A)
print("U@diag(s)@Vt == A:", np.allclose(U @ np.diag(s) @ Vt, A), " s 降序:", np.all(np.diff(s) <= 0))
# 5. norm 默认 L2；矩阵 norm 默认 Frobenius
v = np.array([3., 4.]); print("norm([3,4]) =", np.linalg.norm(v), " L1 =", np.linalg.norm(v, 1), " Frobenius(A) == sqrt(Σs²):", np.isclose(np.linalg.norm(A), np.sqrt((s**2).sum())))
# 6. 最小二乘：lstsq 等价于解正规方程，但不用显式求逆
X = rng.standard_normal((50, 3)); y = X @ np.array([1., -2, 0.5]) + 0.1*rng.standard_normal(50)
beta = np.linalg.lstsq(X, y, rcond=None)[0]; beta2 = np.linalg.solve(X.T @ X, X.T @ y)
print("lstsq ≈ 正规方程:", np.allclose(beta, beta2), " beta =", np.round(beta, 3).tolist())`,
    out:`cond(H)=1.6e+13
solve 误差 4.20e-04   inv@b 误差 5.95e-03
按列验证 A@V[:,0] ≈ w[0]*V[:,0]: True   按行(错): False
eigh 特征值升序: True  V 正交 VᵀV=I: True  全实: float64
U@diag(s)@Vt == A: True  s 降序: True
norm([3,4]) = 5.0  L1 = 7.0  Frobenius(A) == sqrt(Σs²): True
lstsq ≈ 正规方程: True  beta = [0.978, -2.016, 0.495]`,
    note:`Hilbert 矩阵那两行是第 1-3 步；A@V[:,0] 是第 4 步；eigh 三个判断是第 5 步；svd 复原是第 6 步；lstsq vs 正规方程是第 7 步。`
  },
  contrast:[
    {vs:`np.linalg.inv`, same:`都能得到 Ax=b 的解`, diff:`inv 显式构造逆再乘，误差放大两次、多 O(n³) 工作；solve 直接回代`, when:`只有真的需要 A⁻¹ 本身（极少）才 inv`},
    {vs:`np.linalg.eig vs eigh`, same:`都求特征分解`, diff:`eig 是一般矩阵，可能返回复数、向量不正交、无序；eigh 只对对称/厄米阵，实数、正交、升序`, when:`协方差、核矩阵、拉普拉斯矩阵一律 eigh`},
    {vs:`PCA 用 svd 还是 eigh`, same:`都能得到主成分`, diff:`eigh 作用于 XᵀX（cond 平方）；svd 直接作用于 X`, when:`特征多、数据病态时用 svd(X)；小矩阵两者都行`}
  ],
  ext:[
    {t:`特征值与特征向量的几何`, go:'la.eigen'},
    {t:`SVD 与低秩近似`, go:'la.svd'},
    {t:`最小二乘的投影解释`, go:'la.least_squares'}
  ]
},

});
