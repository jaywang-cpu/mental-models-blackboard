/* 数理宇宙 v3 · 推导层 · da 数据处理大陆（10 节点）
   旁挂文件，不改动 v1/v2。proof 写「这个数据操作为什么必须这样做」。
   scratch 不用 pandas/sklearn：numpy 手写 DataFrame/groupby/join/Pipeline，全部实际跑过。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'da.dataframe': {
  layers:{
    alg:`DataFrame 是列的有序字典 {name → 同长一维数组} 加一个行标签数组 index。每列一个 dtype。loc 是按标签的映射 index→位置，iloc 是恒等映射（位置就是位置）。`,
    geo:`一张 Excel：表头是列名，最左边灰色的行号是 index。一列是一根同色的竖条（同 dtype），一行是横切所有竖条得到的一片彩色碎片（异构）。`,
    comp:`列存储：取一列是 O(1) 拿引用；取一行要跨所有列各拷一个值再装成 Series。loc 先在 index 里查标签（哈希或二分）再取位置；iloc 直接用位置。标签切片含尾、位置切片不含尾。`
  },
  proof:{
    from:`ndarray 是同 dtype 连续内存；真实表格的列类型异构；行需要一个稳定身份`,
    to:`DataFrame = dict of 列数组 + index；loc/iloc 两套索引的区别；df[0] 是列不是行；有 NaN 整列升 float`,
    steps:[
      [`一张表每列类型不同（id 是字符串、age 是整数、conc 是浮点），塞进一个 ndarray 只能全变 object`, `ndarray 要求同 dtype；object 数组失去向量化，所以必须按列分开存`],
      [`按列存成 {name → ndarray}，每列独立 dtype，列内运算仍然向量化`, `这是 DataFrame 的核心结构；df["col"] 直接返回那个数组（Series），O(1)`],
      [`行需要身份：删行、排序、合并后「第 3 行」会变，所以给每行一个标签 index`, `index 是行的名字，位置是行的座位号；两者在默认 RangeIndex 下碰巧相等，一旦排序/筛选就分道扬镳`],
      [`于是需要两套索引：loc 按标签（先查 index 表得到位置），iloc 按位置`, `一套无法同时表达「叫 a 的那行」和「第 0 行」；混用是 pandas 最常见的 bug 源`],
      [`标签切片 loc[0:3] 含尾（4 行），位置切片 iloc[0:3] 不含尾（3 行）`, `标签是名字，名字区间没有「下一个」的概念，所以设计成闭区间；位置遵循 Python 半开约定`],
      [`df[0] 走的是列字典查找，找名为 0 的列，不是第一行`, `方括号在 DataFrame 上默认取列，因为列是一等对象；取行必须显式 loc/iloc`],
      [`一列里有一个 NaN，整列升成 float64；混进字符串整列变 object`, `dtype 是列级属性，NaN 是浮点值，整数列装不下它；这是 isna 前 dtypes 必看的原因`]
    ],
    end:`DataFrame = 列字典 + 行标签。取列用方括号，取行用 loc（名字）或 iloc（座位），新表先看 shape/dtypes/head。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
# 手写一个迷你 DataFrame：列存 (dict of 同长数组) + 行标签 index。每列独立 dtype
class DF:
    def __init__(self, cols, index=None):
        self.cols = {k: np.asarray(v) for k, v in cols.items()}
        n = len(next(iter(self.cols.values()))); self.index = np.asarray(index if index is not None else range(n))
    @property
    def shape(self): return (len(self.index), len(self.cols))
    @property
    def dtypes(self): return {k: v.dtype.name for k, v in self.cols.items()}
    def __getitem__(self, col): return self.cols[col]                          # df["col"] -> 一列 (Series)
    def iloc(self, rows, col=None):                                            # 按位置：Python 切片，不含尾
        sel = np.arange(len(self.index))[rows]
        return DF({k: v[sel] for k, v in self.cols.items()}, self.index[sel]) if col is None else self.cols[col][sel]
    def loc(self, rows, col=None):                                             # 按标签：布尔掩码或含尾的标签区间
        if isinstance(rows, slice):
            lo = np.where(self.index == rows.start)[0][0]; hi = np.where(self.index == rows.stop)[0][0]
            sel = np.arange(lo, hi + 1)                                        # 标签切片含尾
        else: sel = np.where(rows)[0]
        return DF({k: v[sel] for k, v in self.cols.items()}, self.index[sel]) if col is None else self.cols[col][sel]
df = DF({"id": ["p1","p2","p3","p4","p5"], "age": [23, 45, 31, 52, 38], "conc": [0.1, 0.5, np.nan, 2.0, 1.2]})
print("shape", df.shape, " dtypes", df.dtypes)
print('df["age"] ->', df["age"].tolist(), type(df["age"]).__name__)
print("iloc[0:3] 行数", df.iloc(slice(0, 3)).shape[0], "(不含尾)   loc[0:3] 行数", df.loc(slice(0, 3)).shape[0], "(含尾)")
print("loc[age>30, 'id'] ->", df.loc(df["age"] > 30, "id").tolist())
# 换成非整数 index 后 loc 和 iloc 分道扬镳
df2 = DF({"age": [23, 45, 31]}, index=["b", "a", "c"])
print("index=[b,a,c]: iloc[0]=", df2.iloc(0, "age"), "  loc['a':'c']=", df2.loc(slice("a", "c"), "age").tolist())
# 每列独立 dtype：整列有一个 NaN 就升成 float；混字符串就变 object
print("conc 有 NaN ->", df["conc"].dtype, "  np.array([1,'a']).dtype ->", np.array([1, "a"]).dtype.kind, "(object/str, 数值运算全废)")`,
    out:`shape (5, 3)  dtypes {'id': 'str64', 'age': 'int64', 'conc': 'float64'}
df["age"] -> [23, 45, 31, 52, 38] ndarray
iloc[0:3] 行数 3 (不含尾)   loc[0:3] 行数 4 (含尾)
loc[age>30, 'id'] -> ['p2', 'p3', 'p4', 'p5']
index=[b,a,c]: iloc[0]= 23   loc['a':'c']= [45, 31]
conc 有 NaN -> float64   np.array([1,'a']).dtype -> U (object/str, 数值运算全废)`,
    note:`class DF 的 cols/index 是第 2-3 步；iloc/loc 方法是第 4-5 步；index=[b,a,c] 那行展示两者分离；最后一行是第 7 步。`
  },
  contrast:[
    {vs:`NumPy 二维数组`, same:`都是行×列的二维数据`, diff:`ndarray 单 dtype、只有位置；DataFrame 每列 dtype、有标签`, when:`列异构或要按名字取用 DataFrame；喂模型前 .to_numpy()`},
    {vs:`Python dict of list`, same:`结构上一样是列字典`, diff:`DataFrame 的列是 ndarray（向量化）且有对齐的 index 与 loc/iloc/groupby/merge 等操作`, when:`几十行的配置用 dict；分析数据用 DataFrame`},
    {vs:`Series`, same:`都带 index`, diff:`Series 是一列，DataFrame 是多列共享一个 index`, when:`df["col"] 得到 Series；df[["col"]] 得到单列 DataFrame`}
  ],
  ext:[
    {t:`ndarray 的连续内存模型`, go:'np.array_shape'},
    {t:`按列值分组聚合`, go:'da.groupby'},
    {t:`长表/宽表两种排法`, go:'da.tidy'}
  ]
},

'da.groupby': {
  layers:{
    alg:`split-apply-combine：按键 k 把行集 D 划分成等价类 {D_k}，对每类应用 f，再按 k 索引拼回。当 f 是幺半群折叠（sum、count、max）时可分块算再合并；median 不行。transform 是 f 的结果按 inv 广播回原行。`,
    geo:`一摞卡片按「细胞类型」分成几堆，每堆算一个数写在便签上，便签排成一张小表（agg）；或者把便签复印贴回每张卡片（transform）。`,
    comp:`np.unique(keys, return_inverse=True) 给每行一个组编号 inv；聚合 = bincount(inv, weights) 一次扫完；transform = result[inv] 花式索引广播回去。多键 = 先把键组合编码成一个键。`
  },
  proof:{
    from:`等价关系把集合划分成不相交的类；幺半群（结合律 + 单位元）允许任意分块折叠`,
    to:`groupby 三步的代数结构；agg 压行 transform 保行；sum/count 可并行、median 不可；多键组数 ≤ 键值域之积`,
    steps:[
      [`「每个 X 的 Y」= 按 X 的值定义等价关系：X 相同的行属于同一类`, `等价类互不相交且覆盖全集，所以每行恰好进一个组，不多不少`],
      [`split：np.unique 返回组的代表 keys 和每行的组编号 inv`, `inv 就是划分的编码；后续所有操作只需要它，不需要真的把行物理拆开`],
      [`apply：对每组的值向量做 f，得到一个数`, `f 的输入是「一组」而非「一行」，这是 groupby 与逐行 apply 的本质差别`],
      [`combine：结果按 keys 排列，keys 成为新 index`, `组的代表值天然是结果的行标签；as_index=False 只是把它搬回列`],
      [`当 f 是幺半群折叠：f(A∪B)=f(A)⊕f(B)。sum、count、max 满足，所以分两半各算再合并等于整体算`, `结合律保证任意切块顺序结果相同；这就是 bincount 能一趟扫完、Spark 能分布式 groupby 的原因`],
      [`median 不满足：中位数的中位数 ≠ 整体中位数`, `需要全组数据才能算，无法流式或分块；这类 f 要走慢路径`],
      [`transform 把组结果按 inv 广播回每行：z = (x - mean[inv]) / std[inv]，行数不变`, `组内标准化、组内排名都是「每行减自己组的统计量」，agg 后再花式索引就是 transform`],
      [`多键 groupby([drug, dose])：组 = 出现过的键组合，数量 ≤ |drug|×|dose|`, `笛卡尔积是上界；实际组数只算出现过的组合`]
    ],
    end:`groupby = 划分 + 每类一个 f + 按键拼回。写代码前先说出「每个 ___ 的 ___」，前者是键、后者是 agg。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
cell = rng.choice(["T", "B", "NK"], 12); expr = np.round(rng.normal(5, 1, 12), 2)
# split-apply-combine 手写：unique 给出组编号 -> 按编号收集 -> 每组算 -> 按组序拼回
keys, inv = np.unique(cell, return_inverse=True)          # inv[i] = 第 i 行属于第几组
def groupby_agg(vals, inv, k, f): return np.array([f(vals[inv == g]) for g in range(k)])
m = groupby_agg(expr, inv, len(keys), np.mean)
print("groupby(cell)[expr].mean():", dict(zip(keys.tolist(), np.round(m, 3).tolist())))
# 代数结构：sum/count 是幺半群 (结合律 + 单位元) -> 可分块算再合并，等价于 bincount
s_fast = np.bincount(inv, weights=expr); n_fast = np.bincount(inv)
print("bincount 分块合并 == 逐组 mean:", np.allclose(s_fast / n_fast, m))
half = 6; s1 = np.bincount(inv[:half], weights=expr[:half], minlength=3); s2 = np.bincount(inv[half:], weights=expr[half:], minlength=3)
print("先分两半各算 sum 再相加 == 整体 sum:", np.allclose(s1 + s2, s_fast), "  (median 没有这个性质:", np.median(expr) == np.median([np.median(expr[:half]), np.median(expr[half:])]), ")")
# agg 压缩行数；transform 保持行数：把组统计量按 inv 广播回每一行
z = (expr - m[inv]) / groupby_agg(expr, inv, 3, lambda v: v.std(ddof=0))[inv]
print("agg 行数", len(m), " transform 行数", len(z), " 组内 z-score 每组均值≈0:", np.round(np.bincount(inv, weights=z), 10).tolist())
# 多键 = 键的笛卡尔积中「出现过的」组合，最多 |A|·|B| 行
drug = rng.choice(["d1", "d2", "d3"], 12); dose = rng.choice([1, 10, 100, 1000], 12)
combo = np.unique(np.stack([drug, dose.astype(str)], 1), axis=0)
print(f"groupby([drug,dose]) 实际 {len(combo)} 组 ≤ 3x4=12")`,
    out:`groupby(cell)[expr].mean(): {'B': 4.903, 'NK': 5.083, 'T': 4.058}
bincount 分块合并 == 逐组 mean: True
先分两半各算 sum 再相加 == 整体 sum: True   (median 没有这个性质: False )
agg 行数 3  transform 行数 12  组内 z-score 每组均值≈0: [-0.0, 0.0, 0.0]
groupby([drug,dose]) 实际 7 组 ≤ 3x4=12`,
    note:`unique+inv 是第 2 步；groupby_agg 是第 3-4 步；bincount 与分两半相加是第 5 步；median 那行是第 6 步；z 是第 7 步；combo 是第 8 步。`
  },
  contrast:[
    {vs:`axis 归约`, same:`都是「分组后各算一个数」`, diff:`axis 的组是规则网格的一维；groupby 的组由一列值决定、组数不定`, when:`张量沿维压缩用 axis；表按类别列聚合用 groupby`},
    {vs:`pivot_table`, same:`都能按键聚合`, diff:`pivot_table 是 groupby 两个键后再把其中一个键展开成列（宽表）`, when:`结果要看成二维交叉表用 pivot_table；要继续处理用 groupby`},
    {vs:`SQL GROUP BY`, same:`语义完全一样`, diff:`SQL 的 HAVING 对应 groupby 后 filter；窗口函数 OVER 对应 transform`, when:`数据在数据库里用 SQL；在内存里用 pandas`}
  ],
  ext:[
    {t:`规则网格上的归约`, go:'np.axis'},
    {t:`分组前后常接表连接`, go:'da.merge'},
    {t:`长表让 groupby 变成一行`, go:'da.tidy'}
  ]
},

'da.merge': {
  layers:{
    alg:`inner join = {(a,b) ∈ A×B : key(a)=key(b)}。按键分桶后行数 = Σ_k n_A(k)·n_B(k)；left = Σ_k n_A(k)·max(1,n_B(k))；outer 再加 B 独有键的行。键唯一时 n(k)∈{0,1}，行数 ≤ min/max；键重复时是乘积。`,
    geo:`两张表各按键分成小堆，同一个键的两堆做笛卡尔积再拼在一起。一对一是拉链，一对多是扇形展开，多对多是每堆都爆成矩形。`,
    comp:`pd.merge 先对右表键建哈希，左表逐行查桶，命中几行就产出几行。键 dtype 不同（int 1 vs str "1"）哈希不同，一行都配不上，静默给全 NaN。`
  },
  proof:{
    from:`join 的定义是键相等的笛卡尔积子集；乘法原理`,
    to:`行数公式 Σ n_A(k)·n_B(k)；一对多扇出、多对多爆炸；合并前必查键唯一性与 dtype`,
    steps:[
      [`join 的定义：在 A×B 的所有对里留下键相等的`, `这是关系代数的定义；暴力双重循环数出的 inner 行数与公式一致`],
      [`把 A、B 各按键分桶，键 k 的桶大小 n_A(k)、n_B(k)。只有同键的桶之间有配对`, `不同键的对被过滤掉，所以总数可以按键分开数`],
      [`同键桶内每一对都保留，共 n_A(k)·n_B(k) 对；对 k 求和得 inner 行数`, `乘法原理；这就是行数公式，也是一切「膨胀」的根源`],
      [`一对一：n(k) ≤ 1，行数 ≤ min(|A|,|B|)；一对多：100 病人 × 每人 3 化验 = 300 行`, `左表一行对右表 3 行就展开成 3 行，left join 后病人表从 100 变 300`],
      [`多对多：A 有 50 个键 1、B 有 40 个键 1 → 50×40=2000 行，仅这一个键`, `两边都重复时乘积爆炸，100×100 的两张表能变成 5000 行`],
      [`left：左表没配上的行也留一行，右列 NaN；公式里 max(1, n_B(k))`, `left 的语义是「保左表全部」，没配上的键贡献 n_A(k)×1`],
      [`键 dtype 不同：int 1 与 str "1" 哈希不同，inner 得 0 行，left 得全 NaN 且不报错`, `哈希比较是严格相等；这是最隐蔽的错误，合并后要看 NaN 比例`],
      [`预防：合并前对每张表检查 键.is_unique 与 最大重复次数，决定是 1:1、1:m 还是 m:m`, `公式告诉你行数会怎么变；validate="one_to_many" 参数就是把这个检查自动化`]
    ],
    end:`join 行数 = Σ 同键桶大小之积。合并前问三件事：哪张表的键唯一、dtype 一不一样、合并后行数该是多少。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
from collections import Counter
# 行数公式：inner 行数 = Σ_k nA(k)·nB(k)；left = Σ_k nA(k)·max(1, nB(k))；outer 再加 B 独有键的 nB(k)
def join_counts(A, B):
    ca, cb = Counter(A), Counter(B); keys = set(ca) | set(cb)
    inner = sum(ca[k] * cb[k] for k in keys)
    left = sum(ca[k] * max(1, cb[k]) for k in keys)
    outer = left + sum(cb[k] for k in keys if ca[k] == 0)
    return inner, left, outer
def brute_inner(A, B): return sum(1 for a in A for b in B if a == b)      # 定义：笛卡尔积里键相等的对
# 1. 一对一
A = [1, 2, 3]; B = [2, 3, 4]
print("1:1  inner/left/outer =", join_counts(A, B), " 暴力 inner =", brute_inner(A, B))
# 2. 一对多：100 个病人 × 每人 3 次化验
pat = list(range(100)); lab = [p for p in pat for _ in range(3)]
print("1:多 (100 病人, 300 化验) left =", join_counts(pat, lab)[1], " 行数从 100 变 300")
# 3. 多对多爆炸：两张表键都重复
A = [1]*50 + [2]*50; B = [1]*40 + [2]*60
inner, _, _ = join_counts(A, B)
print(f"多:多 A={len(A)} 行 B={len(B)} 行 -> inner {inner} 行 = 50*40 + 50*60  (爆炸 {inner/len(A):.0f} 倍)")
# 4. 键 dtype 不同：int 1 和 str '1' 配不上 -> 全 NaN 且不报错
A = [1, 2, 3]; B = ["1", "2", "3"]
print("int 键 vs str 键 inner =", join_counts(A, B)[0], " (left 保留 3 行, 右列全 NaN)")
# 5. 合并前检查键唯一性 = 防爆炸的一行
for name, k in [("病人表", pat), ("化验表", lab)]:
    print(f"  {name} 键唯一? {len(set(k)) == len(k)}  最大重复 {max(Counter(k).values())}")`,
    out:`1:1  inner/left/outer = (2, 3, 4)  暴力 inner = 2
1:多 (100 病人, 300 化验) left = 300  行数从 100 变 300
多:多 A=100 行 B=100 行 -> inner 5000 行 = 50*40 + 50*60  (爆炸 50 倍)
int 键 vs str 键 inner = 0  (left 保留 3 行, 右列全 NaN)
  病人表 键唯一? True  最大重复 1
  化验表 键唯一? False  最大重复 3`,
    note:`join_counts() 是第 2-3、6 步的公式；brute_inner 是第 1 步的定义；三个例子分别是第 4、5、7 步；最后两行是第 8 步。`
  },
  contrast:[
    {vs:`pd.concat(axis=0)`, same:`都把两张表变一张`, diff:`concat 是上下堆叠（并集行），不看键；merge 是按键横向对齐`, when:`同结构的两批数据用 concat；不同实体按 id 关联用 merge`},
    {vs:`join 的四种 how`, same:`都按键匹配`, diff:`inner 交集、left 保左、right 保右、outer 并集；区别只在没配上的行去留`, when:`主表是左表且不想丢样本用 left；两边都要全用 outer 再查 NaN`},
    {vs:`groupby 后再 merge`, same:`都涉及键`, diff:`groupby 先把多行压成每键一行，再 merge 就是一对一`, when:`一对多想避免扇出：先聚合右表再合并`}
  ],
  ext:[
    {t:`合并后按键分组聚合`, go:'da.groupby'},
    {t:`把 merge 放进 pipeline 防止重复合并`, go:'da.pipeline'},
    {t:`键相等是布尔逻辑`, go:'di.logic'}
  ]
},

'da.clean': {
  layers:{
    alg:`缺失机制形式化：R 是缺失指示。MCAR：P(R|X,Y)=P(R)；MAR：P(R|X,Y)=P(R|X_obs)；MNAR：依赖 Y 自身。均值填补后方差 = (1-p)·Var，因为填进去的 p 比例的值离均值距离为 0。`,
    geo:`表上的洞。MCAR 是随机打的洞，剩下的还是原图；MAR 是洞集中在某些行（老年人不填浓度），能靠年龄猜；MNAR 是低于检测限的值全成了洞，剩下的图整体上移。均值填补是把所有洞都涂成一个灰色，图变平了。`,
    comp:`isna().sum() 看每列洞数；-999/0/"NA"/空串先 replace 成 NaN；数值列 fillna(中位数)，类别列填众数或 unknown；填充值只能从训练集算。`
  },
  proof:{
    from:`三种缺失机制的定义；方差 = E[(x-μ)²]；完整案例分析用的是 P(Y|R=0)`,
    to:`MCAR 可忽略（只损失样本量），MAR 需要用观测列建模，MNAR 无法从数据内部纠正；均值填补压方差 (1-p) 倍并削弱相关`,
    steps:[
      [`写出缺失指示 R 与数据的联合分布，缺失机制就是 P(R | 数据) 依赖什么`, `不写出来就无法判断删行是否有偏；三种机制是这个条件分布的三种情形`],
      [`MCAR：R 与一切独立 → 观测到的子集是原分布的随机样本，完整案例均值无偏（偏差 -0.001）`, `随机子样本的期望等于总体期望；只损失 n，不损失正确性`],
      [`MAR：R 依赖 age，而 conc 与 age 相关 → 观测子集在 age 上有偏 → conc 均值有偏（-0.235）`, `条件在 age 上分布未变，所以用 age 回归填补能纠回（偏差 +0.0002）；这就是「可用观测列建模」`],
      [`MNAR：R 依赖 conc 自身（低于检测限）→ 观测子集系统性偏高（+0.556）`, `P(conc | 观测到) ≠ P(conc)，且没有任何观测列携带缺失原因，数据内部无法纠正，必须外部知识（检测限模型）`],
      [`均值填补：设缺失比例 p，填入值 = 观测均值 μ̂。方差 = (1-p)·E[(x-μ)²|观测] + p·0 = (1-p)·Var`, `填进去的点对方差贡献为 0，只剩 (1-p) 份真实离散；实测 0.698 ≈ 0.70`],
      [`同理协方差被压 (1-p) 倍、方差压 (1-p) 倍，相关系数被压 √(1-p)：0.445→0.374`, `相关 = cov/√(var_x var_y)，只有 y 有洞时分子分母各压一次`],
      [`所以均值填补让「看起来更确定、相关更弱」，下游检验的 p 值和置信区间都偏`, `被压低的方差直接进入 SE 的计算；填补必须要么带噪声（多重填补）要么用模型`],
      [`伪装缺失 -999 不是 NaN，isnan 找到 0 个；先 replace 再 isna`, `缺失编码是数据字典约定，不是浮点 NaN；不查字典就会把 -999 当真值算进均值`]
    ],
    end:`先问洞为什么在那里。MCAR 删、MAR 建模填、MNAR 要外部知识；均值填补把方差压 (1-p) 倍，除非只是占位否则别用。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0); n = 200000
age = rng.normal(50, 10, n); conc = 2 + 0.05*age + rng.normal(0, 1, n)      # conc 依赖 age
true_mean = conc.mean(); true_var = conc.var()
# 三种缺失机制，形式化：P(缺失 | 数据) 依赖于什么
mech = {
  "MCAR 与任何量无关":        rng.random(n) < 0.3,
  "MAR  只依赖观测到的 age":  rng.random(n) < np.clip((age - 30) / 40, 0, 1),
  "MNAR 依赖 conc 自身(低于检测限)": conc < np.percentile(conc, 30),
}
print(f"真实 mean={true_mean:.3f} var={true_var:.3f}")
for name, miss in mech.items():
    obs = conc[~miss]
    cc_bias = obs.mean() - true_mean                              # 完整案例分析的偏差
    filled = np.where(miss, obs.mean(), conc)                     # 均值填补
    print(f"{name:<28} 缺失率 {miss.mean():.2f}  完整案例 mean 偏差 {cc_bias:+.3f}  均值填补后 var/真实 = {filled.var()/true_var:.3f} (≈1-p={1-miss.mean():.2f})")
# 均值填补压低方差的推导：填进去的值离均值距离为 0，方差 = (1-p)·Var_obs
p = 0.3; miss = rng.random(n) < p; filled = np.where(miss, conc[~miss].mean(), conc)
print(f"MCAR p={p}: 填补后 var = {filled.var():.3f}  推导 (1-p)·var = {(1-p)*true_var:.3f}  相关系数 corr(age,conc) 从 {np.corrcoef(age, conc)[0,1]:.3f} 降到 {np.corrcoef(age, filled)[0,1]:.3f}")
# MAR 下用 age 做回归填补能纠偏
b, a = np.polyfit(age[~mech["MAR  只依赖观测到的 age"]], conc[~mech["MAR  只依赖观测到的 age"]], 1)
m = mech["MAR  只依赖观测到的 age"]; reg_fill = np.where(m, a + b*age, conc)
print(f"MAR 回归填补 mean 偏差 {reg_fill.mean()-true_mean:+.4f} (均值填补是 {np.where(m, conc[~m].mean(), conc).mean()-true_mean:+.3f})")
# 伪装缺失
x = np.array([1.2, -999, 0.8, -999, 2.1]); print("isnan 找到", int(np.isnan(x).sum()), "个;  -999 其实是", int((x == -999).sum()), "个缺失 -> 先 replace 再 isna")`,
    out:`真实 mean=4.500 var=1.251
MCAR 与任何量无关                  缺失率 0.30  完整案例 mean 偏差 -0.001  均值填补后 var/真实 = 0.698 (≈1-p=0.70)
MAR  只依赖观测到的 age             缺失率 0.50  完整案例 mean 偏差 -0.235  均值填补后 var/真实 = 0.479 (≈1-p=0.50)
MNAR 依赖 conc 自身(低于检测限)       缺失率 0.30  完整案例 mean 偏差 +0.556  均值填补后 var/真实 = 0.345 (≈1-p=0.70)
MCAR p=0.3: 填补后 var = 0.874  推导 (1-p)·var = 0.876  相关系数 corr(age,conc) 从 0.445 降到 0.374
MAR 回归填补 mean 偏差 +0.0002 (均值填补是 -0.235)
isnan 找到 0 个;  -999 其实是 2 个缺失 -> 先 replace 再 isna`,
    note:`三种 mech 的三行是第 2-4 步；MCAR p=0.3 那行是第 5-6 步的 (1-p) 与相关衰减；MAR 回归填补是第 3 步的纠偏；-999 是第 8 步。`
  },
  contrast:[
    {vs:`删行 dropna`, same:`都是处理缺失`, diff:`删行不造数据但损失 n 且 MAR/MNAR 下有偏；填补保 n 但引入假确定性`, when:`MCAR 且 n 充裕删行；样本贵或 MAR 用模型填补；标签缺失一律删`},
    {vs:`多重填补 / KNN / 回归填补`, same:`都是填`, diff:`均值填补一个常数、压方差；模型填补用其他列预测，多重填补还加噪声保留不确定性`, when:`MAR 用回归/KNN/多重填补；均值填补只做基线`},
    {vs:`异常值处理`, same:`都在改数据`, diff:`缺失是「没有值」，异常是「有值但可疑」`, when:`异常值先画图判断是测量错误还是真实极端；别机械 3σ 删`}
  ],
  ext:[
    {t:`填充统计量只能来自训练集`, go:'da.leak'},
    {t:`isna 就是一张布尔掩码`, go:'np.mask'},
    {t:`缺失机制与选择偏差同源`, go:'ex.selection_bias'}
  ]
},

'da.normalize': {
  layers:{
    alg:`z-score：x′ = (x-μ)/σ，按列（axis=0）算 μ、σ；min-max：(x-min)/(max-min)。距离² = Σ_j (Δx_j)²，尺度大的列主导；缩放后每列方差 1，各列等权。μ、σ 是模型参数，只能从训练集估。`,
    geo:`身高（cm）和体重（kg）画在同一平面，cm 那一轴长得多，所有点的远近几乎只由身高决定。缩放后云团变成圆的，每个方向一样重要。`,
    comp:`mu = X_train.mean(0); sd = X_train.std(0); Z = (X - mu)/sd 广播。测试集用同一组 mu、sd，列均值 ≠ 0 是正常的。树模型不需要。`
  },
  proof:{
    from:`欧氏距离与梯度对各坐标的依赖；方差的平移缩放性质；训练/测试的分布假设`,
    to:`距离/梯度类模型必须缩放；z-score 沿 axis=0；scaler 只 fit 训练集；min-max 怕离群`,
    steps:[
      [`距离² = Σ_j Δx_j²：某列尺度 ×1000，它的 Δ² ×10⁶，其余列贡献占比 0.0`, `kNN、SVM、k-means、PCA 都直接吃这个距离，尺度就是权重`],
      [`同理梯度 ∂L/∂w_j ∝ x_j：大尺度列梯度大，损失面变成细长椭圆，梯度下降震荡`, `神经网络、逻辑回归、正则回归对尺度敏感的根源`],
      [`z-score 让每列 μ=0、σ=1：Var((x-μ)/σ) = Var(x)/σ² = 1`, `方差的缩放性质；缩放后每列对距离的期望贡献相等`],
      [`μ、σ 每列一个，所以沿 axis=0（吃掉行）算，得到 shape (F,)，广播到 (N,F)`, `axis 是被吃掉的维；这一步错成 axis=1 就是每行标准化，语义全变`],
      [`μ、σ 是从数据估出的参数，和模型权重一样属于「学到的东西」，只能来自训练集`, `测试集模拟「未来数据」，未来数据的均值在训练时不可知；用了就是泄漏`],
      [`测试集用训练的 μ、σ 后列均值是 0.116、-0.123，不为 0，这是正确的`, `它反映训练/测试的分布差异；强行让测试集也均值 0 反而抹掉了这个信息`],
      [`量化：在全体上 fit z-score 再切分，1-NN 准确率的乐观偏差约 0.005 量级`, `统计泄漏本身很小，危险在于同一习惯用到特征选择、填补、目标编码上时偏差会到 0.4+`],
      [`min-max 把 [1,2,3,4,100] 压成 [0,0.01,0.02,0.03,1]：一个离群值把其他全挤扁`, `max 由离群值决定；有离群值用 RobustScaler（中位数与 IQR）或先 log`]
    ],
    end:`尺度就是权重。距离/梯度模型先缩放，按列算，只 fit 训练集；树模型免。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
# 1. 尺度不同时距离被大尺度维度垄断
h = rng.normal(170, 8, 200); w = rng.normal(65, 10, 200); age_ = rng.normal(40, 12, 200)
X = np.stack([h, w, age_ / 365 * 365 * 1000], 1)          # 第 3 列改成「天」(尺度 x1000)
d = X[0] - X[1]; print("原始尺度: 各维对距离² 的贡献占比", np.round(d**2 / (d**2).sum(), 4).tolist())
# 2. z-score：沿 axis=0（每列一个均值），用广播
def zfit(Xtr): return Xtr.mean(axis=0), Xtr.std(axis=0)
def zapply(X, mu, sd): return (X - mu) / sd
mu, sd = zfit(X); Z = zapply(X, mu, sd); d = Z[0] - Z[1]
print("z-score 后: 各维贡献占比", np.round(d**2 / (d**2).sum(), 3).tolist(), " 列均值", np.round(Z.mean(0), 10).tolist(), " 列 std", np.round(Z.std(0), 10).tolist())
# 3. scaler 只能 fit 训练集：测试集的均值不是 0 是正常的
idx = rng.permutation(200); tr, te = idx[:150], idx[150:]
mu, sd = zfit(X[tr]); Zte = zapply(X[te], mu, sd)
print("测试集用训练统计量后的列均值:", np.round(Zte.mean(0), 3).tolist(), "(≠0 正常)")
# 4. 先在全体上 fit 再切分 = 泄漏。量化乐观偏差：1-NN 分类，重复 300 次
def knn1_acc(Xtr, ytr, Xte, yte):
    D = ((Xte[:, None, :] - Xtr[None, :, :])**2).sum(-1); return (ytr[D.argmin(1)] == yte).mean()
gap = []
for _ in range(300):
    n = 40; y = rng.integers(0, 2, n); F = rng.normal(0, 1, (n, 5)) + 0.3*y[:, None]
    F[:, 0] *= 1000                                                    # 一列尺度巨大
    p = rng.permutation(n); a, b = p[:20], p[20:]
    mu, sd = zfit(F[a]); acc_ok = knn1_acc(zapply(F[a], mu, sd), y[a], zapply(F[b], mu, sd), y[b])
    mu, sd = zfit(F);    acc_leak = knn1_acc(zapply(F[a], mu, sd), y[a], zapply(F[b], mu, sd), y[b])
    gap.append(acc_leak - acc_ok)
print(f"z-score 在全体上 fit 的乐观偏差: 平均 {np.mean(gap):+.4f} (n=40, 5 维)  -> 统计泄漏本身小, 但它是习惯, 危险的是同一习惯用在特征选择/填补上")
# 5. min-max 与离群值
x = np.array([1., 2, 3, 4, 100]); print("min-max:", np.round((x - x.min()) / (x.max() - x.min()), 3).tolist(), " 前 4 个被压进 0.03 内")`,
    out:`原始尺度: 各维对距离² 的贡献占比 [0.0, 0.0, 1.0]
z-score 后: 各维贡献占比 [0.074, 0.002, 0.923]  列均值 [-0.0, -0.0, -0.0]  列 std [1.0, 1.0, 1.0]
测试集用训练统计量后的列均值: [0.116, -0.123, 0.064] (≠0 正常)
z-score 在全体上 fit 的乐观偏差: 平均 -0.0048 (n=40, 5 维)  -> 统计泄漏本身小, 但它是习惯, 危险的是同一习惯用在特征选择/填补上
min-max: [0.0, 0.01, 0.02, 0.03, 1.0]  前 4 个被压进 0.03 内`,
    note:`第一个占比是第 1 步；z-score 后占比与列均值/std 是第 3-4 步；测试集列均值是第 6 步；300 次重复是第 7 步的量化；min-max 是第 8 步。`
  },
  contrast:[
    {vs:`min-max 与 z-score`, same:`都是线性缩放`, diff:`min-max 压到 [0,1]、受离群值控制；z-score 无界、按标准差`, when:`神经网络输入像素类有界数据用 min-max；一般特征用 z-score；有离群值用 Robust`},
    {vs:`log 变换`, same:`都改变特征尺度`, diff:`log 是非线性，改变分布形状（压长尾）；z-score 只平移缩放，形状不变`, when:`长尾（表达量、浓度）先 log 再 z-score`},
    {vs:`按行归一化（L2 normalize）`, same:`都叫 normalize`, diff:`按行让每个样本向量长度 1（axis=1）；按列让每个特征 σ=1（axis=0）`, when:`文本 TF-IDF、嵌入向量按行；表格特征按列`}
  ],
  ext:[
    {t:`(X-mu)/sd 的广播`, go:'np.broadcast'},
    {t:`为什么只 fit 训练集：泄漏`, go:'da.leak'},
    {t:`kNN 是尺度敏感的极端例子`, go:'ml.knn'}
  ]
},

'da.split': {
  layers:{
    alg:`泛化误差是对未见分布的期望，测试集是它的蒙特卡洛估计，前提是测试样本与训练样本独立。随机切分下测试集正例数服从超几何分布，Var = n·p(1-p)·(N-n)/(N-1)；分层把它固定成常数，方差为 0。`,
    geo:`三个抽屉：训练（学）、验证（调参）、测试（只开一次）。同一个病人的切片全部要进同一个抽屉；时间序列按时间切一刀，左边训练右边测试。`,
    comp:`rng.permutation(n) 打乱下标再切；分层 = 每类内部各自 permutation 再按比例取；分组 = 先 permutation 组 id 再展开成样本；时间 = 直接按 t 排序切。固定 seed。`
  },
  proof:{
    from:`泛化 = 在独立同分布的新样本上的表现；超几何分布的方差；重复测量的相关性`,
    to:`测试集只碰一次；分层降方差；同组样本不跨集；时间序列不随机切`,
    steps:[
      [`测试误差是泛化误差的无偏估计，条件是测试集在训练中从未被用过`, `每看一次测试集并据此改模型，测试集就变成了训练信号，估计开始乐观`],
      [`所以调参必须用另一份数据：验证集。测试集留到最后只开一次`, `三个抽屉的分工来自「每份数据只能承担一种角色」`],
      [`类别 1:19 时随机切 40 个，正例数是超几何随机变量：均值 2、std 1.22、11% 的切分一个正例都没有`, `随机切分让类别比例本身成为噪声源；没有正例的测试集算不出召回率`],
      [`分层：每类内部按比例抽，正例数固定为 2，std 0`, `把「类别比例」从随机变量变成常数，消灭了这一项方差；指标估计更稳`],
      [`理论 std = √(n·p(1-p)(N-n)/(N-1)) = 1.24 与实测 1.22 一致`, `这是分层降方差的定量版本：降掉的正是这一项`],
      [`同一病人 10 张切片随机切分：测试集 9/9 个病人也在训练集里`, `同一病人的切片高度相关，模型「认人」就能猜对，这不是泛化`],
      [`按病人切分：先打乱病人 id 再展开成样本，测试病人与训练病人交集为 0`, `独立性要在「重复测量的单位」层面保证，切分的单位必须是那个层面`],
      [`时间序列随机切分：训练集最晚时刻 99 > 测试集最早时刻 15，用未来预测过去`, `部署时只有过去；切分要模拟部署，所以按时间一刀切`]
    ],
    end:`切分模拟部署。类别不均衡就分层，有重复测量就按组，有时间就按时间。测试集只碰一次。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
# 1. 类别 1:19 时随机切分的测试集正例数波动；分层切分把这个方差压成 0
n = 200; y = np.array([1]*10 + [0]*190); n_te = 40
rand_pos = []; strat_pos = []
for _ in range(2000):
    p = rng.permutation(n); rand_pos.append(y[p[:n_te]].sum())
    pos = np.where(y == 1)[0]; neg = np.where(y == 0)[0]
    te = np.concatenate([rng.permutation(pos)[:2], rng.permutation(neg)[:38]]); strat_pos.append(y[te].sum())
rand_pos, strat_pos = np.array(rand_pos), np.array(strat_pos)
print(f"随机切分 测试集正例数: 均值 {rand_pos.mean():.2f} std {rand_pos.std():.2f}  出现 0 个正例的概率 {np.mean(rand_pos == 0):.3f}")
print(f"分层切分 测试集正例数: 均值 {strat_pos.mean():.2f} std {strat_pos.std():.2f}")
# 理论：超几何分布 Var = n_te·p(1-p)·(N-n_te)/(N-1)
p_ = 10/200; print(f"超几何理论 std = {np.sqrt(n_te*p_*(1-p_)*(n-n_te)/(n-1)):.2f}")
# 2. 分层还降低「估计准确率」的方差：每折正例比例固定 -> 指标更稳
# 3. 组泄漏：10 个病人各 10 张切片，随机切分 vs 按病人切分
patient = np.repeat(np.arange(10), 10); idx = rng.permutation(100); te = idx[:20]; tr = idx[20:]
shared = len(set(patient[te]) & set(patient[tr]))
print(f"随机切分: 测试集里 {shared}/{len(set(patient[te]))} 个病人也出现在训练集 (组泄漏)")
pats = rng.permutation(10); te_p = pats[:2]; te_g = np.where(np.isin(patient, te_p))[0]; tr_g = np.where(~np.isin(patient, te_p))[0]
print(f"按病人切分: 测试集病人 {sorted(set(patient[te_g].tolist()))} 与训练集交集 {len(set(patient[te_g]) & set(patient[tr_g]))} 个")
# 4. 时间序列按时间切：随机切分会用未来预测过去
t = np.arange(100); p = rng.permutation(100); print(f"随机切分: 训练集最晚时刻 {t[p[20:]].max()} > 测试集最早时刻 {t[p[:20]].min()} -> 用了未来")
# 5. 三个抽屉：验证集调参，测试集只碰一次
print("60/20/20 of 200 ->", [int(200*f) for f in (0.6, 0.2, 0.2)])`,
    out:`随机切分 测试集正例数: 均值 1.94 std 1.22  出现 0 个正例的概率 0.110
分层切分 测试集正例数: 均值 2.00 std 0.00
超几何理论 std = 1.24
随机切分: 测试集里 9/9 个病人也出现在训练集 (组泄漏)
按病人切分: 测试集病人 [2, 7] 与训练集交集 0 个
随机切分: 训练集最晚时刻 99 > 测试集最早时刻 15 -> 用了未来
60/20/20 of 200 -> [120, 40, 40]`,
    note:`随机 vs 分层两行是第 3-4 步；超几何理论值是第 5 步；两种病人切分是第 6-7 步；时间那行是第 8 步。`
  },
  contrast:[
    {vs:`K 折交叉验证`, same:`都是把数据分开评估`, diff:`CV 轮流用每一折做验证，n 次训练取平均，方差更小；单次切分只用一次`, when:`n 小或要选模型用 CV（分层/分组版本）；n 大或训练贵用单次切分`},
    {vs:`分层 vs 分组`, same:`都不是纯随机`, diff:`分层保证类别比例一致；分组保证同一实体不跨集`, when:`类别不均衡用分层；有病人/批次/小鼠重复测量用分组；两者都要就 StratifiedGroupKFold`},
    {vs:`bootstrap 重采样`, same:`都对样本随机操作`, diff:`bootstrap 有放回、估计统计量的不确定性；切分无放回、估计泛化`, when:`要置信区间用 bootstrap；要泛化误差用切分/CV`}
  ],
  ext:[
    {t:`固定 seed 保证可复现`, go:'np.random'},
    {t:`跨集就是泄漏`, go:'da.leak'},
    {t:`测试集上算什么指标`, go:'ml.metrics'}
  ]
},

'da.pipeline': {
  layers:{
    alg:`Pipeline 是变换的复合 g∘f_k∘…∘f_1，每个 f_i 有参数 θ_i 由训练集估出。fit(X_tr) 顺序估 θ_1..θ_k 并把变换后的数据传给下一步；predict(X) 只用已估的 θ 做 transform。交叉验证里每折重新估全部 θ。`,
    geo:`一条流水线：缺失填补 → 缩放 → 模型，三台机器串在一起。训练时每台机器各自校准一次（只看流过它的训练数据）；测试时数据原样流过，机器不再动刻度。`,
    comp:`class Pipeline: fit 循环 step.fit(X).transform(X)，最后一步 fit；predict 循环 step.transform(X)。CV 时整条 Pipeline 作为一个 estimator 被 fit，所以每折的 scaler.mu 不同。`
  },
  proof:{
    from:`每个预处理步骤都有从数据估出的参数；泄漏 = 测试信息进入参数估计；函数复合的结合律`,
    to:`预处理必须在每折内部 fit；Pipeline 把这个纪律变成结构；同 seed 才可复现`,
    steps:[
      [`中位数填补的中位数、scaler 的 μσ、模型的权重，都是从数据估出来的参数`, `它们没有本质区别，都会把训练集的信息编码进去`],
      [`手工分步：scaler.fit(X_all) 再切分再 CV，μσ 里已经含了每一折的验证数据`, `这是最常见的泄漏形式，代码上看不出错，因为 fit 只调了一次`],
      [`把所有步骤封成一个对象，fit 只接收训练折：每一步只能看到流过它的训练数据`, `结构上消灭了「在切分之前 fit」的可能，纪律变成了类型约束`],
      [`5 折里每折的 scaler.mu[1] 分别是 34.19、27.30、38.60、33.72、40.14，各不相同`, `证明每折确实重新 fit 了预处理；如果在外面 fit 过一次，五个数会相同`],
      [`Pipeline.predict == 手工按顺序 imp.transform → sc.transform → clf.predict`, `函数复合满足结合律，Pipeline 只是把复合写成一个对象，语义与手工链式完全一致`],
      [`测试时只 transform 不 fit：中位数、μσ 用训练时记住的`, `测试数据必须像部署时一样被处理，部署时没有「重新校准」这一步`],
      [`同 seed 两次结果相同；seed 1 与 7 准确率 0.78 与 0.80 不同`, `切分是随机的，结果的差异来自切分不来自模型；不固定 seed 无法区分「改进」和「运气」`]
    ],
    end:`凡是从数据学出来的东西都要在折内学。Pipeline 让这条纪律不可违反，seed 让结果可比。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
# 手写 Pipeline：步骤 = 函数复合；fit 只看训练集，transform 用记住的参数
class Scaler:
    def fit(self, X, y=None): self.mu, self.sd = X.mean(0), X.std(0); return self
    def transform(self, X): return (X - self.mu) / self.sd
class MedianImputer:
    def fit(self, X, y=None): self.med = np.nanmedian(X, 0); return self
    def transform(self, X): return np.where(np.isnan(X), self.med, X)
class Centroid:                                                       # 最近质心分类器
    def fit(self, X, y): self.c = np.stack([X[y == k].mean(0) for k in (0, 1)]); return self
    def predict(self, X): return ((X[:, None, :] - self.c[None]) ** 2).sum(-1).argmin(1)
class Pipeline:
    def __init__(self, steps): self.steps = steps
    def fit(self, X, y):
        for s in self.steps[:-1]: X = s.fit(X, y).transform(X)         # 每一步只在训练集上 fit
        self.steps[-1].fit(X, y); return self
    def predict(self, X):
        for s in self.steps[:-1]: X = s.transform(X)                   # 测试集只 transform
        return self.steps[-1].predict(X)
n, d = 200, 4; y = rng.integers(0, 2, n); X = rng.normal(0, 1, (n, d)) + 0.6 * y[:, None]; X[:, 1] *= 100
X[rng.random((n, d)) < 0.1] = np.nan
folds = np.array_split(rng.permutation(n), 5); acc = []; mus = []
for k in range(5):
    te = folds[k]; tr = np.concatenate([folds[j] for j in range(5) if j != k])
    pipe = Pipeline([MedianImputer(), Scaler(), Centroid()]).fit(X[tr], y[tr])
    acc.append((pipe.predict(X[te]) == y[te]).mean()); mus.append(pipe.steps[1].mu[1])
print("5 折准确率:", np.round(acc, 3).tolist(), " 均值", round(float(np.mean(acc)), 3))
print("每折 Scaler 学到的第 2 列均值不同 (证明每折重新 fit):", np.round(mus, 2).tolist())
# 等价性：Pipeline.fit_predict == 手工顺序 fit/transform
imp = MedianImputer().fit(X[tr]); Xa = imp.transform(X[tr]); sc = Scaler().fit(Xa); clf = Centroid().fit(sc.transform(Xa), y[tr])
print("Pipeline == 手工顺序:", np.array_equal(pipe.predict(X[te]), clf.predict(sc.transform(imp.transform(X[te])))))
# 可复现：同 seed 同结果
def run(seed):
    r = np.random.default_rng(seed); p = r.permutation(n); a, b = p[:150], p[150:]
    return (Pipeline([MedianImputer(), Scaler(), Centroid()]).fit(X[a], y[a]).predict(X[b]) == y[b]).mean()
print("seed=1 两次:", run(1) == run(1), f" seed=1 acc={run(1):.3f} seed=7 acc={run(7):.3f} (切分不同, 结果不同, 所以要固定 seed)")`,
    out:`5 折准确率: [0.775, 0.8, 0.75, 0.8, 0.9]  均值 0.805
每折 Scaler 学到的第 2 列均值不同 (证明每折重新 fit): [34.19, 27.3, 38.6, 33.72, 40.14]
Pipeline == 手工顺序: True
seed=1 两次: True  seed=1 acc=0.780 seed=7 acc=0.800 (切分不同, 结果不同, 所以要固定 seed)`,
    note:`Pipeline.fit 的循环是第 3 步；五个不同的 mu 是第 4 步；等价性检查是第 5 步；predict 只 transform 是第 6 步；seed 两行是第 7 步。`
  },
  contrast:[
    {vs:`手工顺序调用 fit/transform`, same:`语义等价（输出里验证为 True）`, diff:`手工版在 CV 里要自己在每折内重写全部步骤，容易漏`, when:`一次性探索可以手工；任何进 CV/网格搜索的流程必须 Pipeline`},
    {vs:`ColumnTransformer`, same:`都是把预处理组合起来`, diff:`Pipeline 是串联（步骤依次），ColumnTransformer 是并联（不同列走不同变换再拼接）`, when:`数值列缩放 + 类别列 one-hot 用 ColumnTransformer，再塞进 Pipeline`},
    {vs:`函数式 compose`, same:`都是复合`, diff:`Pipeline 区分 fit（估参数）和 transform（用参数）两个阶段；纯函数复合没有状态`, when:`有状态的变换（需要训练统计量）用 Pipeline；无状态的（log、clip）随便`}
  ],
  ext:[
    {t:`每一步为什么只 fit 训练集`, go:'da.normalize'},
    {t:`填补的中位数也是参数`, go:'da.clean'},
    {t:`Pipeline 防的就是泄漏`, go:'da.leak'}
  ]
},

'da.leak': {
  layers:{
    alg:`泄漏 = 训练时用到的信息 I_train 与部署时可得信息 I_deploy 不同：I_train ⊄ I_deploy。三种：统计泄漏（预处理参数含测试集）、目标泄漏（特征 ⊥̸ y | 部署时刻）、组泄漏（训练/测试样本非独立）。`,
    geo:`考试前偷看了答案的三种方式：用全班（含考卷）的分数分布调整评分标准；题目里印着答案的影子；同一个人的另一张卷子在题库里。三种都让考试分数虚高。`,
    comp:`纯噪声 n=50、p=5000：用全体数据按 |corr| 选 20 个特征再 CV，准确率 0.98；每折内部选特征，0.46。目标泄漏列让准确率 1.00。随机切分下 50% 的测试样本最近邻是同一病人。`
  },
  proof:{
    from:`部署时只有当时可得的信息；多重比较下最大相关的期望随 p 增长；重复测量的相关性`,
    to:`好得离谱先怀疑泄漏；特征选择/填补/缩放/重采样全部要在折内；组和时间不能随机切`,
    steps:[
      [`模型的价值在部署时的表现，部署时只有 I_deploy`, `训练时多用的任何信息在部署时都拿不到，指标就不可信`],
      [`统计泄漏的极端：p=5000 个纯噪声特征，用全部 50 个样本选出与 y 最相关的 20 个`, `5000 次比较里总有几十个碰巧和 y 相关 0.4+；这些「相关」是从测试折的 y 里挑出来的`],
      [`再做 CV：每折的验证样本已经参与了特征选择，准确率 0.98`, `纯噪声的真实准确率是 0.5，0.48 的差距全部是泄漏；这就是乐观偏差的量级`],
      [`正确做法：每折内部只用训练折选特征，准确率 0.46 ≈ 0.5`, `验证折的 y 从未被看到，估计回到真相`],
      [`目标泄漏：特征是 y 的衍生量（用药后住院天数、复查结果），准确率 1.00`, `这些量在预测时刻还不存在；判据是「这一列在预测发生的那一刻能拿到吗」`],
      [`组泄漏：同一病人 5 次测量随机切分，测试样本 50% 的最近邻是自己的另一次测量`, `模型学到的是病人身份而不是病理规律；按病人切分后这条捷径消失`],
      [`SMOTE 等重采样在切分前做，合成样本是测试样本的插值，同样泄漏`, `任何「看数据」的操作都要在折内：缩放、填补、选特征、重采样、目标编码`],
      [`诊断信号：指标好得离谱、去掉某一列指标暴跌、CV 与外部验证差距大`, `泄漏不会报错，只会让数字变漂亮；怀疑是第一道防线`]
    ],
    end:`凡是碰过测试数据或未来数据的步骤都是泄漏。指标太好先找泄漏，再谈模型。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
# 纯噪声数据：n=50, p=5000 个特征，标签随机 -> 真实准确率只能是 50%
n, p = 50, 5000; X = rng.normal(0, 1, (n, p)); y = rng.integers(0, 2, n)
def centroid_acc(Xtr, ytr, Xte, yte):
    c = np.stack([Xtr[ytr == k].mean(0) for k in (0, 1)])
    return (((Xte[:, None, :] - c[None]) ** 2).sum(-1).argmin(1) == yte).mean()
def top_feats(X, y, k=20):                              # 用 |corr(特征, y)| 选前 k 个
    r = np.abs(((X - X.mean(0)) * (y - y.mean())[:, None]).mean(0) / (X.std(0) * y.std()))
    return np.argsort(r)[-k:]
folds = np.array_split(rng.permutation(n), 5)
def cv(select_inside):
    acc = []
    for k in range(5):
        te = folds[k]; tr = np.concatenate([folds[j] for j in range(5) if j != k])
        feats = top_feats(X[tr], y[tr]) if select_inside else top_feats(X, y)   # 泄漏：用了测试折选特征
        acc.append(centroid_acc(X[tr][:, feats], y[tr], X[te][:, feats], y[te]))
    return np.mean(acc)
print(f"错误做法 (全体数据选特征再 CV): 准确率 {cv(False):.2f}   <- 纯噪声也能 90%+，这就是泄漏的量级")
print(f"正确做法 (每折内部选特征):      准确率 {cv(True):.2f}   <- 真相 ≈ 0.5")
# 目标泄漏：特征里混进了标签的衍生量
Xr = rng.normal(0, 1, (200, 3)); yr = (Xr[:, 0] + rng.normal(0, 1, 200) > 0).astype(int)
leaky = np.column_stack([Xr, yr * 2 + rng.normal(0, 0.01, 200)])          # 「用药后出院天数」之类
tr, te = np.arange(150), np.arange(150, 200)
print(f"目标泄漏列: 准确率 {centroid_acc(leaky[tr], yr[tr], leaky[te], yr[te]):.2f}  去掉后 {centroid_acc(Xr[tr], yr[tr], Xr[te], yr[te]):.2f}  -> 好得离谱先怀疑")
# 组泄漏：同一病人的重复测量跨集，最近邻直接「认出」同一个人
pat = np.repeat(np.arange(20), 5); base = rng.normal(0, 3, 20)[pat]; Xg = base[:, None] + rng.normal(0, 0.2, (100, 2)); yg = (base > 0).astype(int)
idx = rng.permutation(100); a, b = idx[:70], idx[70:]
D = ((Xg[b][:, None] - Xg[a][None]) ** 2).sum(-1); nn = a[D.argmin(1)]
print(f"随机切分: 测试样本的最近邻是同一病人的比例 {np.mean(pat[nn] == pat[b]):.2f}  -> 学到的是「认人」不是「病理」")`,
    out:`错误做法 (全体数据选特征再 CV): 准确率 0.98   <- 纯噪声也能 90%+，这就是泄漏的量级
正确做法 (每折内部选特征):      准确率 0.46   <- 真相 ≈ 0.5
目标泄漏列: 准确率 1.00  去掉后 0.80  -> 好得离谱先怀疑
随机切分: 测试样本的最近邻是同一病人的比例 0.50  -> 学到的是「认人」不是「病理」`,
    note:`cv(False) vs cv(True) 是第 2-4 步的量化；目标泄漏那行是第 5 步；最近邻同病人比例是第 6 步。`
  },
  contrast:[
    {vs:`过拟合`, same:`都表现为训练好、真实差`, diff:`过拟合是模型记住了训练集噪声，CV 能发现；泄漏是评估本身被污染，CV 也被骗`, when:`CV 差→过拟合；CV 好但外部验证差→泄漏`},
    {vs:`混杂因素`, same:`都让模型学到假关系`, diff:`混杂是数据生成过程里的第三变量；泄漏是评估流程的错误`, when:`混杂要靠实验设计和因果推断；泄漏靠 Pipeline 和分组切分`},
    {vs:`选择偏差`, same:`都让样本不代表部署分布`, diff:`选择偏差是样本来源的问题；泄漏是训练/测试之间信息流动的问题`, when:`两者都要查，但泄漏可以纯靠代码纪律消灭`}
  ],
  ext:[
    {t:`切分单位与时间`, go:'da.split'},
    {t:`Pipeline 把折内 fit 变成结构`, go:'da.pipeline'},
    {t:`多重比较为什么必然挑出假相关`, go:'si.multiple_testing'}
  ]
},

'da.tidy': {
  layers:{
    alg:`tidy 三条：每变量一列、每观测一行、每类观测单位一张表。宽表 W (n×k) 的列名里藏着一个变量 day；melt 是 W[i,j] → (row_i, col_j, W[i,j]) 三元组，pivot 是它的逆，前提是 (row,col) 唯一。`,
    geo:`宽表是一张成绩单，每个学生一行、每门课一列；长表是一叠成绩条，每条写「谁、哪门、几分」。melt 是把成绩单剪成条，pivot 是把条贴回表格。`,
    comp:`melt：np.repeat(行 id, k) 与 np.tile(列 id, n) 造出两列，值列 ravel。pivot：searchsorted 得 (ri,ci)，out[ri,ci]=v；重复组合会覆盖，所以 pandas 报错并要求 pivot_table 指定 aggfunc。`
  },
  proof:{
    from:`关系模型：一张表的行是同一类实体的观测；变量是「可以被过滤、分组、映射的东西」`,
    to:`tidy 让过滤=掩码、分组=groupby 一列、绘图分面=一列；宽表适合喂矩阵；melt/pivot 互逆`,
    steps:[
      [`宽表列名 day0、day3、day7 里藏着变量 day 的三个值`, `列名不能被 groupby、不能被过滤、不能当 x 轴：变量被编码成了结构而不是数据`],
      [`tidy 第一条「每变量一列」：把 day 拉出来成一列，值成另一列`, `变量成为列之后，所有按变量的操作（筛选、分组、映射到视觉通道）都变成对一列的操作`],
      [`tidy 第二条「每观测一行」：一行 = 一个 (sample, day) 的一次测量`, `行是操作的最小单位；一行多个观测时任何逐行操作都会混淆它们`],
      [`tidy 第三条「每类观测单位一张表」：样本元数据表、测量表分开，靠键连接`, `混在一张表里会让样本级信息重复 k 次，更新时不一致`],
      [`长表上「每个 day 的均值」= groupby(day) 一行；宽表要先知道哪些列是 day`, `输出里 bincount 分组结果与 wide.mean(axis=0) 一致，但前者不需要知道列的语义`],
      [`melt 是 W[i,j] → (i,j,v) 的展开，行数 n·k；pivot 是逆映射，pivot(melt(W)) == W`, `两者互逆的条件是 (row,col) 组合唯一；这就是 pivot 遇重复报错的原因`],
      [`重复 (index, columns) 组合时 pivot 无法决定填哪个值，pandas 报错；pivot_table 用 aggfunc 先聚合再展开`, `逆映射要求单射；不单射就必须先约化`],
      [`模型要 (n_samples, n_features) 矩阵，即宽表；画图和分组要长表`, `同一份数据两种排法各有用途，melt/pivot 在两者之间切换`]
    ],
    end:`变量藏在列名里就 melt。长表给 groupby 和分面，宽表给模型，melt/pivot 是可逆的开关。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np
rng = np.random.default_rng(0)
# 宽表：一行一样本，列名里藏着变量 (day)。tidy 三条：每变量一列、每观测一行、每类观测一表
samples = np.array(["s1", "s2", "s3"]); days = np.array([0, 3, 7]); wide = np.round(rng.normal(5, 1, (3, 3)), 2)
print("宽表 (3 样本 x 3 天):\\n", wide)
# melt：wide (n, k) -> long (n*k, 3)。用广播造出 sample/day 两列，值列直接 ravel
def melt(wide, row_ids, col_ids):
    r = np.repeat(row_ids, wide.shape[1]); c = np.tile(col_ids, wide.shape[0]); return r, c, wide.ravel()
s_col, d_col, v_col = melt(wide, samples, days)
print("长表前 4 行 (sample, day, value):", list(zip(s_col[:4].tolist(), d_col[:4].tolist(), v_col[:4].tolist())), " 共", len(v_col), "行")
# 长表上「每个 day 的均值」是一行 groupby；宽表上要知道哪些列是 day
_, inv = np.unique(d_col, return_inverse=True)
print("长表 groupby(day).mean():", np.round(np.bincount(inv, weights=v_col) / np.bincount(inv), 3).tolist(), " == 宽表 mean(axis=0):", np.allclose(np.bincount(inv, weights=v_col)/np.bincount(inv), wide.mean(0)))
# pivot：long -> wide，melt 的逆。(index, columns) 组合必须唯一，否则要 pivot_table 指定 aggfunc
def pivot(r, c, v, row_ids, col_ids):
    out = np.full((len(row_ids), len(col_ids)), np.nan)
    ri = np.searchsorted(row_ids, r); ci = np.searchsorted(col_ids, c)
    pairs = set(zip(ri.tolist(), ci.tolist())); assert len(pairs) == len(v), "重复 (index, columns) 组合，pivot 报错"
    out[ri, ci] = v; return out
print("pivot(melt(wide)) == wide:", np.array_equal(pivot(s_col, d_col, v_col, samples, days), wide))
try: pivot(np.append(s_col, "s1"), np.append(d_col, 0), np.append(v_col, 9.9), samples, days)
except AssertionError as e: print("重复组合 ->", e)
# 三条规则各自让什么变成一行：过滤一个变量 = 一个掩码；分面 = groupby 一列；喂模型 = pivot 回宽表
print("day==3 的观测:", v_col[d_col == 3].tolist(), " (宽表上得先知道第 2 列是 day 3)")`,
    out:`宽表 (3 样本 x 3 天):
 [[5.13 4.87 5.64]
 [5.1  4.46 5.36]
 [6.3  5.95 4.3 ]]
长表前 4 行 (sample, day, value): [('s1', 0, 5.13), ('s1', 3, 4.87), ('s1', 7, 5.64), ('s2', 0, 5.1)]  共 9 行
长表 groupby(day).mean(): [5.51, 5.093, 5.1]  == 宽表 mean(axis=0): True
pivot(melt(wide)) == wide: True
重复组合 -> 重复 (index, columns) 组合，pivot 报错
day==3 的观测: [4.87, 4.46, 5.95]  (宽表上得先知道第 2 列是 day 3)`,
    note:`melt() 里 repeat/tile 是第 6 步的展开；groupby(day) 与 mean(axis=0) 对照是第 5 步；pivot 往返与重复报错是第 6-7 步；最后一行是第 2 步的过滤。`
  },
  contrast:[
    {vs:`groupby`, same:`都在重新组织表`, diff:`groupby 聚合（行数变少、信息损失）；melt/pivot 只重排（行列互换、信息不变）`, when:`要汇总用 groupby；要换排法用 melt/pivot；pivot_table 是两者合一`},
    {vs:`转置 .T`, same:`都能行列互换`, diff:`转置把整个表翻过来（列名变 index）；pivot 只把一列的值展开成列`, when:`二维矩阵翻面用 T；把某个分类变量展开成列用 pivot`},
    {vs:`MultiIndex`, same:`都能表示多维数据`, diff:`MultiIndex 把多个键堆在 index 上，仍是「宽」的层级表`, when:`groupby 多键后的结果是 MultiIndex；reset_index 就回到长表`}
  ],
  ext:[
    {t:`长表上一行 groupby`, go:'da.groupby'},
    {t:`分面绘图吃长表`, go:'vz.subplot'},
    {t:`DataFrame 结构`, go:'da.dataframe'}
  ]
},

'da.apply': {
  layers:{
    alg:`df.apply(f, axis=1) 是 map f 到行的集合：n 次 Python 调用。向量化列运算是一次 C 级 ufunc。两者语义相同，前者 O(n) 次解释器分派，后者 O(n) 次机器指令。`,
    geo:`一沓 20 万张卡片：apply 是一张张拿起来，每张都念一遍规则；向量化是把整沓放进切纸机，一刀下去。`,
    comp:`逐行 200000 次调用 32 ms，np.where 0.6 ms（约 50 倍）。字典 map 8 ms vs 查表数组 0.2 ms。链式 df[m]["b"]=1 先 __getitem__ 得副本再赋值，原表不变；df.loc[m,"b"]=1 一步 __setitem__。`
  },
  proof:{
    from:`CPython 每次函数调用有固定开销；ndarray 运算下沉到 C；掩码索引返回副本`,
    to:`能写成列运算的绝不 apply；map 用查表；改值一步 loc；apply 只做无法向量化的兜底`,
    steps:[
      [`apply(axis=1) 对每行构造一个 Series（跨列拷值）再调用 Python 函数`, `构造 Series + 调用 + 装箱结果，每行几微秒；20 万行就是几十毫秒起，100 列时更慢`],
      [`同一逻辑写成 np.where(cond, a*b, a+b)：三个 ufunc 各扫一遍数组`, `每个 ufunc 是 C 循环，无分派；即使多算了一支也快 50 倍`],
      [`判据：函数体能否只用「整列之间的算术/比较/布尔」表达；能就向量化`, `df.a*df.b、np.where、.str.、.dt. 覆盖绝大多数「逐行逻辑」`],
      [`单列字典映射：逐个 m[g] 是 Python 查字典 20 万次；np.array(values)[codes] 是一次 gather`, `Series.map(dict) 内部也是这条查表路径；类别多时先 factorize 成整数码`],
      [`链式赋值 x[x>3][0] = -1：x[x>3] 是掩码索引，返回副本；对副本赋值原数组不变`, `掩码位置不规则无法做视图，这是 NumPy 层的事实；pandas 在其上再加一层不确定性`],
      [`一步索引 x[pos] = -1 或 df.loc[m, "b"] = 1：直接 __setitem__ 写原内存`, `只有一次索引才是 scatter；两次索引中间必有一个临时对象`],
      [`真正无法向量化的（调外部解析器、复杂状态机）才 apply，且优先 itertuples 不用 iterrows`, `iterrows 每行造 Series 并统一 dtype，itertuples 造具名元组，快一个量级`]
    ],
    end:`apply 是「我不知道怎么向量化」的诚实标记。先试列运算、where、map 查表；改值一律 loc 一步到位。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np, time
rng = np.random.default_rng(0); n = 200_000
a = rng.random(n); b = rng.random(n); grp = rng.integers(0, 3, n)
# 1. apply(axis=1) = 每行调一次 Python 函数；向量化 = 整列一次算
def per_row(a_i, b_i, g_i): return a_i * b_i if g_i == 0 else a_i + b_i
t = time.perf_counter(); r1 = np.array([per_row(a[i], b[i], grp[i]) for i in range(n)]); t_apply = time.perf_counter() - t
t = time.perf_counter(); r2 = np.where(grp == 0, a * b, a + b); t_vec = time.perf_counter() - t
print(f"结果一致 {np.allclose(r1, r2)}   逐行 {t_apply*1e3:.0f} ms  向量化 {t_vec*1e3:.1f} ms  ≈{t_apply/t_vec:.0f}x")
# 2. map 用字典映射一列：等价于 unique + 查表
m = {0: "T", 1: "B", 2: "NK"}
t = time.perf_counter(); s1 = [m[g] for g in grp]; t_map = time.perf_counter() - t
t = time.perf_counter(); s2 = np.array(["T", "B", "NK"])[grp]; t_lut = time.perf_counter() - t
print(f"字典逐个 map {t_map*1e3:.0f} ms  查表 {t_lut*1e3:.1f} ms  一致 {list(s2[:5]) == s1[:5]}")
# 3. 链式赋值的坑：掩码索引先产生副本，再对副本赋值，原表不变
x = np.arange(6.); x[x > 3][0] = -1                              # 等价 df[df.a>3]["b"] = -1
print("x[x>3][0] = -1 后 x =", x.tolist(), "(没变)")
x[np.where(x > 3)[0][0]] = -1                                     # 等价 df.loc[df.a>3, "b"] = -1
print("x[loc 一步索引] = -1 后 x =", x.tolist(), "(变了)")
# 4. 什么时候只能 apply：每行逻辑无法写成列运算 (如调外部解析器)。此时至少用 itertuples 级别的循环，别 iterrows
t = time.perf_counter(); _ = [str(v) for v in a[:50000]]; t_str = time.perf_counter() - t
print(f"必须逐行时 5 万行字符串化 {t_str*1e3:.0f} ms -> 可接受; 但 10 万行 x 100 列 iterrows 造 Series 就慢 100 倍")`,
    out:`结果一致 True   逐行 32 ms  向量化 0.6 ms  ≈53x
字典逐个 map 8 ms  查表 0.2 ms  一致 True
x[x>3][0] = -1 后 x = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0] (没变)
x[loc 一步索引] = -1 后 x = [0.0, 1.0, 2.0, 3.0, -1.0, 5.0] (变了)
必须逐行时 5 万行字符串化 11 ms -> 可接受; 但 10 万行 x 100 列 iterrows 造 Series 就慢 100 倍`,
    note:`第一行计时是第 1-2 步；map vs 查表是第 4 步；两行 x 的赋值是第 5-6 步；最后一行是第 7 步。计时数值每次运行略有不同。`
  },
  contrast:[
    {vs:`NumPy 向量化`, same:`同一件事`, diff:`pandas 列运算底层就是 ndarray ufunc，多了索引对齐`, when:`pandas 里写 df.a*df.b 就是在用 NumPy 向量化`},
    {vs:`groupby.apply`, same:`都叫 apply`, diff:`groupby.apply 每组调一次（组数通常远小于行数），开销可接受；行级 apply 每行一次`, when:`组级自定义逻辑可以 groupby.apply/agg；行级逻辑先向量化`},
    {vs:`Series.map vs apply`, same:`都对单列逐元素`, diff:`map 接受字典/Series 走查表路径；apply 只接受函数`, when:`值到值的映射用 map(dict)；需要计算才用 apply(f)，且先考虑 np.where/np.select`}
  ],
  ext:[
    {t:`向量化为什么快的三层原因`, go:'np.vectorize'},
    {t:`掩码索引为什么是副本`, go:'np.mask'},
    {t:`DataFrame 列存储`, go:'da.dataframe'}
  ]
},

});
