/* 数理宇宙 v3 · 推导层 · py Python 大陆（10 节点）
   旁挂文件，不改动 v1/v2。代码节点的 proof 写「这个机制为什么必须是这样」。
   scratch 全部用 python3 + numpy 实际跑过，out 是真实输出。 */
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'py.list_dict': {
  layers:{
    alg:`list 是函数 f: {0..n-1} → 值，定义域是连续整数；dict 是函数 g: 可哈希对象 → 值。两者的查找都写成 O(1)，但一个靠算地址、一个靠算哈希。`,
    geo:`list 是一排贴墙的连续格子，格宽固定，第 i 格的位置 = 起点 + i×格宽；dict 是一张传送图，key 经哈希函数落到桶阵列的某个桶上，不管远近一步到位。`,
    comp:`xs[i]：一次乘加得地址，读指针。d[k]：hash(k) → 取模桶数 → 比较 key 是否相等（冲突时沿探测序列继续比）。dict 的 O(1) 是「平均、摊还」，前提是负载因子被控制在 2/3 以下。`
  },
  proof:{
    from:`内存是一维的字节数组，按地址读写是 O(1)；哈希函数把任意对象映射到整数`,
    to:`list 下标 O(1)、in 是 O(n)；dict 查找平均 O(1)，且必须靠扩容维持`,
    steps:[
      [`list 把 n 个指针连续排放，第 i 个的地址 = base + i×8`, `连续排放让「位置」和「地址」变成一个线性公式，读地址是硬件原语，所以是 O(1)`],
      [`list 没有按值的入口：问 x in xs 只能逐格比较`, `格子只按位置编号，值到位置没有任何函数关系，最坏比 n 次`],
      [`末尾 append 摊还 O(1)：容量满时按约 1.125 倍扩容并整体搬迁`, `搬迁 O(n) 但每次扩容后能免费 append 约 n/8 次，把搬迁成本分摊到每次 append 上是常数`],
      [`dict 建一个 m 个桶的数组，key 落到桶 hash(k) mod m`, `哈希把「值」变成「位置」，于是按值查找也能走地址公式`],
      [`冲突不可避免：n 个 key 落 m 个桶，鸽巢原理保证 n>m 必撞`, `所以要么链表要么开放寻址。CPython 用开放寻址 + 扰动探测序列`],
      [`平均探测次数由负载因子 α=n/m 决定，α 固定时探测次数是常数`, `均匀哈希下探测长度期望约 1/(1-α)；α≤2/3 时不超过 3 次，与 n 无关`],
      [`为保持 α 有界，n 超过 2m/3 时把 m 翻倍并重哈希全部 key`, `重哈希 O(n)，但摊到之前 n 次插入上还是 O(1)，同 list 的扩容逻辑`],
      [`key 必须不可变：若 key 在插入后被改，hash 变了，落错桶永远找不回`, `这就是 list 不能当 key、tuple 可以的根本原因，不是语法限制`]
    ],
    end:`list 的 O(1) 来自「位置=地址」的线性公式，dict 的 O(1) 来自「哈希把值变位置」+「扩容保负载因子」。手里是位置就用 list，是名字就用 dict，两者都不是魔法。`
  },
  scratch:{
    lang:'python',
    code:`import random
random.seed(0)
# 手写开放寻址哈希表：看冲突、探测次数、负载因子、扩容
class HashTable:
    def __init__(self, m=8):
        self.m=m; self.n=0; self.keys=[None]*m; self.vals=[None]*m; self.probes=0
    def _slot(self, k):
        i = hash(k) % self.m
        while self.keys[i] is not None and self.keys[i] != k:
            i = (i+1) % self.m; self.probes += 1          # 线性探测（冲突）
        return i
    def put(self, k, v):
        if self.n+1 > self.m*2//3: self._grow()          # 负载因子 > 2/3 就扩容
        i = self._slot(k)
        if self.keys[i] is None: self.n += 1
        self.keys[i]=k; self.vals[i]=v
    def get(self, k): return self.vals[self._slot(k)]
    def _grow(self):
        old = [(k,v) for k,v in zip(self.keys,self.vals) if k is not None]
        self.m *= 2; self.keys=[None]*self.m; self.vals=[None]*self.m; self.n=0
        for k,v in old: self.put(k,v)

for N in [100, 1000, 10000]:
    h = HashTable(); keys=[f"gene{i}" for i in range(N)]
    for k in keys: h.put(k, len(k))
    h.probes = 0
    for k in keys: h.get(k)
    print(f"n={N:<6} buckets={h.m:<6} load={h.n/h.m:.2f}  avg_probe/lookup={h.probes/N:.2f}")

# 对比：list 线性扫描的平均比较次数 ~ n/2
xs = list(range(10000)); cmp = 0
for target in random.sample(xs, 100):
    for j, x in enumerate(xs):
        cmp += 1
        if x == target: break
print(f"list in: avg compares/lookup = {cmp/100:.0f}  (n=10000)")`,
    out:`n=100    buckets=256    load=0.39  avg_probe/lookup=0.28
n=1000   buckets=2048   load=0.49  avg_probe/lookup=0.47
n=10000  buckets=16384  load=0.61  avg_probe/lookup=0.77
list in: avg compares/lookup = 5182  (n=10000)`,
    note:`_slot 里的 while 是第 5-6 步的冲突探测；_grow 是第 7 步的扩容重哈希。输出显示 n 增大 100 倍，平均探测次数不变，而 list 扫描约 n/2。`
  },
  contrast:[
    {vs:`set 集合`, same:`同样是哈希表，in 也是 O(1)`, diff:`set 只存 key 不挂值，等于 dict 去掉 value 那一列`, when:`只问「在不在」用 set；要「按名取值」用 dict`},
    {vs:`tuple 元组`, same:`都是按位置索引的序列`, diff:`tuple 不可变所以可哈希，能当 dict 的 key；list 不能`, when:`固定不改、要当 key 或要保证不被误改用 tuple`},
    {vs:`numpy 数组`, same:`都是连续内存、按下标 O(1)`, diff:`list 存的是指向散落对象的指针，ndarray 直接存值，所以 ndarray 才能向量化`, when:`同类型数值成批算用 ndarray；混类型、要 append 用 list`},
    {vs:`pandas DataFrame`, same:`都能按标签取东西`, diff:`dict 是一层 key→值的映射，DataFrame 是行×列的表，每列一个 dtype`, when:`一层映射用 dict，二维表用 DataFrame`}
  ],
  ext:[
    {t:`把复杂度从「数格子」升到形式化的 O 记号与摊还分析`, go:'py.bigo'},
    {t:`哈希与位运算：哈希函数为什么要打散低位`, go:'di.bits'},
    {t:`把 dict 当计数器：collections.Counter 就是 dict + get(k,0)+1`, go:'py.loop_comprehension'}
  ]
},

'py.loop_comprehension': {
  layers:{
    alg:`[f(x) for x in X if c(x)] 就是集合建构记号 {f(x) | x∈X, c(x)} 的直译；它是 map∘filter 的复合，语义上完全等价于 for + if + append。`,
    geo:`一条传送带：元素逐个经过闸门 c，合格的经过变换 f，掉进新篮子。篮子是新造的，传送带上的原料不动。生成器则是传送带只在有人伸手接时才往前走一格。`,
    comp:`字节码里推导式用专用指令 LIST_APPEND，省掉了每轮查找 out.append 属性和一次函数调用，快 20-40%，是常数级。生成器表达式不建列表，返回一个挂起的帧，next() 一次算一个。`
  },
  proof:{
    from:`for 循环的语义：对可迭代对象依次取元素执行同一段体；函数调用有固定开销`,
    to:`推导式 ≡ for+append（无语义差别），生成器 ≡ 惰性版本（内存 O(1)、只能消费一次）`,
    steps:[
      [`把 [f(x) for x in X if c(x)] 展开：out=[]; for x in X: if c(x): out.append(f(x))`, `这是语言规范给的定义，推导式是这段循环的语法糖，位置一一对应`],
      [`多层 for 按从左到右嵌套：[.. for i in A for j in B] 外层是 A`, `展开规则是「从左到右依次缩进」，所以最左是最外层，写反得到转置配对`],
      [`为什么略快：循环体里 out.append 每轮要做一次属性查找 + 一次 Python 调用`, `推导式编译成 LIST_APPEND 字节码，跳过这两步；只省常数不改复杂度`],
      [`把方括号换成圆括号得到生成器：不执行循环体，只返回一个可迭代对象`, `生成器的帧被挂起在第一个 yield 之前，next() 才推进一步；这是惰性求值的实现`],
      [`惰性 ⇒ 内存 O(1)：sum(x*x for x in range(10**7)) 任何时刻只存一个 x`, `没有容器收集中间值，每个值算完立刻被消费者吃掉`],
      [`惰性 ⇒ 只能走一遍：帧走到末尾抛 StopIteration，再迭代得到空`, `帧的状态是单向推进的，没有「倒带」操作；要复用必须先 list() 固化`],
      [`惰性 ⇒ 可以无限：itertools.count() 永远不会「造完」`, `因为根本不造，只在被要求时给下一个；列表推导对无限序列会卡死`],
      [`惰性 ⇒ 短路：next(x for x in X if c(x)) 找到第一个就停`, `消费者只要一个，生产者就只算到那一个；列表推导必须全算完`]
    ],
    end:`推导式是 for+append 的等价重排，不改变复杂度；生成器把「造一个容器」换成「造一个按需推进的帧」，用一次性换来 O(1) 内存、无限序列与短路。`
  },
  scratch:{
    lang:'python',
    code:`import sys
# 1. 推导式 ≡ for + append
xs = range(10)
a = [x*x for x in xs if x % 3 == 0]
b = []
for x in xs:
    if x % 3 == 0: b.append(x*x)
print("equal:", a == b, a)
# 2. 多层 for：最左是最外层
print([(i,j) for i in range(2) for j in range(3)])
# 3. 生成器惰性：用计数器看 f 何时被调用
calls = 0
def f(x):
    global calls; calls += 1; return x*x
g = (f(x) for x in range(10**6))
print("after building generator, f called:", calls)
print("first 3:", [next(g) for _ in range(3)], "calls:", calls)
print("size list:", sys.getsizeof([x for x in range(10**6)]), "bytes | size gen:", sys.getsizeof((x for x in range(10**6))), "bytes")
# 4. 只能消费一次
g2 = (x for x in range(3))
print("1st pass:", list(g2), " 2nd pass:", list(g2))
# 5. 短路：只算到第一个满足条件的
calls = 0
first = next(f(x) for x in range(10**6) if x > 4)
print("first>4 squared:", first, "| f called only", calls, "times")`,
    out:`equal: True [0, 9, 36, 81]
[(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]
after building generator, f called: 0
first 3: [0, 1, 4] calls: 3
size list: 8448728 bytes | size gen: 192 bytes
1st pass: [0, 1, 2]  2nd pass: []
first>4 squared: 25 | f called only 1 times`,
    note:`第 1 段验证第 1 步的等价；calls 计数器对应第 4-5 步（建生成器时 f 一次都没调）；2nd pass 为空对应第 6 步；最后一段是第 8 步的短路。`
  },
  contrast:[
    {vs:`map / filter 内置函数`, same:`都是对每个元素做变换/筛选`, diff:`map 返回惰性迭代器且要传函数对象；推导式直接写表达式，可读性更好`, when:`函数已有名字（map(str, xs)）可用 map；否则推导式`},
    {vs:`numpy 向量化`, same:`都是「对每个元素做同一件事」`, diff:`推导式仍是 Python 逐元素解释执行；numpy 把循环下沉到 C，快 100 倍`, when:`数值数组用 numpy；字符串、对象、混类型用推导式`},
    {vs:`普通 for 循环`, same:`语义完全等价`, diff:`推导式只能「产出一个新容器」，不能 break、不能 try、不能跨轮累积状态`, when:`需要提前退出、容错、running sum 时回到 for`}
  ],
  ext:[
    {t:`笛卡尔积推导式 [(i,j) for i in A for j in B] 的元素数就是乘法原理`, go:'co.multiplication_rule'},
    {t:`把逐元素循环换成整数组运算`, go:'np.vectorize'},
    {t:`生成器读大文件：逐行处理不占内存`, go:'py.function'}
  ]
},

'py.function': {
  layers:{
    alg:`函数是一个从参数到返回值的映射，外加一个私有命名空间。名字解析按 LEGB（Local → Enclosing → Global → Builtins）逐层向外找。`,
    geo:`一个盒子：漏斗进参数，出口吐 return。盒子里的名字盒外看不见；盒子能带走它出生时周围的变量（闭包），带走的是变量这个「标签」，不是标签当时指向的值。`,
    comp:`def 语句在执行时创建函数对象，此刻默认参数被求值一次并存进 f.__defaults__。每次调用新建一个栈帧放局部变量，return 后帧销毁。闭包通过 cell 对象引用外层变量。`
  },
  proof:{
    from:`def 是可执行语句（运行到它才创建函数对象）；变量是名字到对象的绑定；帧在调用时创建、返回时销毁`,
    to:`可变默认参数跨调用共享；闭包捕获变量而非值（late binding）；函数内赋值即判定为局部`,
    steps:[
      [`def f(xs=[]) 执行时，Python 先求值 []，把这个列表对象存入 f.__defaults__`, `def 是一条语句，默认值表达式在这条语句执行时求值，且只求这一次`],
      [`每次调用 f() 不传参时，参数 xs 绑定到 __defaults__ 里同一个对象`, `调用不重新执行 def，所以没有机会重新造列表；拿到的是同一个引用`],
      [`xs.append(1) 原地修改该对象，下一次调用看到残留`, `列表可变，原地方法改的是对象本身，所有引用该对象的名字都看到`],
      [`xs=None 再在体内 xs=[] 能修好：因为 [] 现在写在函数体，每次调用都执行`, `函数体每次调用都从头执行，体内的表达式每次都重新求值`],
      [`闭包：内层函数引用外层变量时，编译器把该变量放进 cell，内层函数持有 cell 的引用`, `cell 是「变量的盒子」而不是值的快照，这样外层后续修改内层也能看到（这是设计目标：共享状态）`],
      [`循环里造 lambda x: x*k：所有 lambda 持有同一个 cell k，循环结束后 k 是末值`, `循环变量 k 只有一个绑定，每轮重新赋值的是同一个名字；闭包读的是名字当前指向的对象`],
      [`冻结当前值：lambda x, k=k: x*k，用默认参数把值在定义时抓下来`, `第 1 步说默认参数在 def/lambda 执行时求值，这恰好成了「拍快照」的工具`],
      [`函数内对某名字赋值，编译器整体判定它为局部；赋值前读它就 UnboundLocalError`, `局部性是编译期按整个函数体决定的，不是按执行顺序动态决定的；要改外层用 nonlocal/global`]
    ],
    end:`三个坑同源：def 只执行一次、闭包抓变量不抓值、局部性由编译期决定。理解「函数对象何时创建、名字何时绑定」，三个坑一起消失。`
  },
  scratch:{
    lang:'python',
    code:`# 1. 可变默认参数：def 时求值一次
def f(x, xs=[]):
    xs.append(x); return xs
print("f(1):", f(1), " f(2):", f(2), " same object:", f.__defaults__[0] is f(3))
def g(x, xs=None):
    if xs is None: xs = []
    xs.append(x); return xs
print("g(1):", g(1), " g(2):", g(2))
# 2. 闭包捕获变量不是值（late binding）
fs = [lambda x: x*k for k in range(3)]
print("late binding:", [h(10) for h in fs], " cell contents:", fs[0].__closure__[0].cell_contents)
fs2 = [lambda x, k=k: x*k for k in range(3)]
print("frozen by default arg:", [h(10) for h in fs2])
# 3. 赋值即局部：赋值前读报 UnboundLocalError
count = 0
def inc():
    count = count + 1
try:
    inc()
except UnboundLocalError as e:
    print("UnboundLocalError:", e)
def inc2():
    global count; count += 1
inc2(); print("with global:", count)
# 4. 参数传递 = 传对象引用：重新赋值不外泄，原地修改外泄
def rebind(a): a = a + [9]
def mutate(a): a += [9]
L = [1]; rebind(L); print("rebind:", L); mutate(L); print("mutate:", L)`,
    out:`f(1): [1, 2, 3]  f(2): [1, 2, 3]  same object: True
g(1): [1]  g(2): [2]
late binding: [20, 20, 20]  cell contents: 2
frozen by default arg: [0, 10, 20]
UnboundLocalError: cannot access local variable 'count' where it is not associated with a value
with global: 1
rebind: [1]
mutate: [1, 9]`,
    note:`f.__defaults__[0] is f(3) 为 True 对应第 1-3 步；cell_contents=2 对应第 5-6 步；UnboundLocalError 对应第 8 步；最后两行是「传对象引用的值」。`
  },
  contrast:[
    {vs:`lambda 匿名函数`, same:`都是函数对象，都能闭包`, diff:`lambda 只能是单个表达式、没有名字、没有 docstring`, when:`一次性的短回调用 lambda；超过一行或要复用就 def`},
    {vs:`类的方法`, same:`方法就是定义在类里的函数`, diff:`方法调用时实例被自动塞进第一个参数 self，状态存在实例上而非闭包里`, when:`多个函数共享同一坨状态且状态要能被检视时用类；单个带状态的函数用闭包`},
    {vs:`functools.partial`, same:`都能「冻结部分参数」`, diff:`partial 在创建时把值绑死；闭包默认绑变量`, when:`循环里造带参回调优先 partial，比 k=k 更明确`},
    {vs:`生成器函数（含 yield）`, same:`都是 def 定义`, diff:`调用生成器函数不执行体，返回可迭代对象；普通函数调用立即执行到 return`, when:`要按需产出序列用 yield`}
  ],
  ext:[
    {t:`递归：函数调自己，每层一个新帧`, go:'py.recursion'},
    {t:`把共享同一组参数的函数收拢成类`, go:'py.class'},
    {t:`变量是标签不是盒子：可变与引用的完整模型`, go:'py.mutable'}
  ]
},

'py.recursion': {
  layers:{
    alg:`T(n) = n·T(n-1)、T(0)=1 这类递推式直接写成代码。正确性靠归纳：基准情形对 + 假设小一号正确则本层正确 ⇒ 全部正确。`,
    geo:`一棵调用树。fact 的树是一条链（高 n、n 个节点）；朴素 fib 的树是二叉的（高 n、约 φ^n 个节点）。时间 = 节点数，空间 = 树高。`,
    comp:`每次调用压一个栈帧（局部变量 + 返回地址），碰到基准开始弹栈，答案在弹的路上算出来。CPython 默认 1000 层上限。记忆化 = 给每个子问题一个 dict 槽，算过就查表。`
  },
  proof:{
    from:`函数调用创建栈帧、返回销毁；数学归纳法；fib 的递推 F(n)=F(n-1)+F(n-2)`,
    to:`朴素 fib 调用次数 C(n)=2F(n+1)-1 指数增长；记忆化后 O(n)；空间 O(深度)`,
    steps:[
      [`正确性：设 fact(k) 对所有 k<n 正确；fact(n)=n·fact(n-1) 由定义成立；fact(0)=1 正确`, `这是强归纳法的两条：基准 + 归纳步。只看一层就够，不用在脑中展开`],
      [`计数：朴素 fib(n) 的调用次数 C(n)=1+C(n-1)+C(n-2)，C(0)=C(1)=1`, `一次调用自身算 1，再加两个子调用各自的次数；这是把递推关系原样搬到「次数」上`],
      [`解递推：令 D(n)=C(n)+1，得 D(n)=D(n-1)+D(n-2)，D(0)=D(1)=2，所以 D(n)=2F(n+1)`, `加 1 消掉常数项，变成标准斐波那契递推，初值定出倍数 2`],
      [`所以 C(n)=2F(n+1)-1 ≈ 1.17·φ^n，φ≈1.618，指数级`, `F(n) 的通项是 φ^n/√5 主导（Binet 公式），比值 C(n+1)/C(n) → φ`],
      [`重复来源：fib(n-2) 在 fib(n) 和 fib(n-1) 里各算一次，子问题只有 n+1 个却被算了指数次`, `不同的子问题只有 0..n 共 n+1 个，调用树节点数远大于此，差额全是重复`],
      [`记忆化：第一次算 fib(k) 存入表，之后查表 O(1)；每个子问题只算一次 ⇒ 总调用 ≤ 2n+1`, `n+1 个子问题各算一次（每次至多两个子调用，命中的直接返回）；条件是函数纯、参数可哈希`],
      [`空间：递归深度 = 未返回的帧数 = 树高；fact 与 fib 都是 O(n)`, `每层帧在子调用返回前不能销毁，链的高度就是 n；这是递归比循环 O(1) 空间贵的地方`],
      [`Python 无尾调用优化，深度超过 sys.getrecursionlimit() 抛 RecursionError`, `CPython 用 C 栈承载 Python 帧，无限压栈会崩进程，所以设了保护上限；写成尾递归也照样压栈`]
    ],
    end:`递归的正确性只需看一层（归纳），代价要看整棵树：节点数是时间、树高是空间。子问题重复就记忆化，把指数树剪成线性表。`
  },
  scratch:{
    lang:'python',
    code:`import sys
from functools import lru_cache
# 1. 数朴素 fib 的调用次数，验证 C(n) = 2F(n+1) - 1
calls = 0
def fib(n):
    global calls; calls += 1
    return n if n < 2 else fib(n-1) + fib(n-2)
def F(n):
    a, b = 0, 1
    for _ in range(n): a, b = b, a+b
    return a
for n in [5, 10, 20, 25]:
    calls = 0; v = fib(n)
    print(f"fib({n})={v:<6} calls={calls:<7} 2F(n+1)-1={2*F(n+1)-1:<7} ratio~phi: {calls/(2*F(n)-1):.4f}")
# 2. 记忆化后调用次数 ≤ 2n+1
mcalls = 0
@lru_cache(maxsize=None)
def mfib(n):
    global mcalls; mcalls += 1
    return n if n < 2 else mfib(n-1) + mfib(n-2)
mcalls = 0; mfib(80); print(f"memo fib(80): calls={mcalls}  (2n+1={161})  value={mfib(80)}")
# 3. 深度 = 树高；超过上限报 RecursionError
def depth(n): return 0 if n == 0 else 1 + depth(n-1)
print("limit:", sys.getrecursionlimit(), " depth(500)=", depth(500))
try:
    depth(10**5)
except RecursionError as e:
    print("RecursionError:", str(e)[:40])`,
    out:`fib(5)=5      calls=15      2F(n+1)-1=15      ratio~phi: 1.6667
fib(10)=55     calls=177     2F(n+1)-1=177     ratio~phi: 1.6239
fib(20)=6765   calls=21891   2F(n+1)-1=21891   ratio~phi: 1.6181
fib(25)=75025  calls=242785  2F(n+1)-1=242785  ratio~phi: 1.6180
memo fib(80): calls=81  (2n+1=161)  value=23416728348467685
limit: 1000  depth(500)= 500
RecursionError: maximum recursion depth exceeded`,
    note:`calls 与 2F(n+1)-1 逐项相等验证第 2-4 步；ratio 趋向 φ=1.618；memo 版 calls=81 对应第 6 步；最后一段是第 7-8 步的深度上限。`
  },
  contrast:[
    {vs:`迭代（for/while 循环）`, same:`能算同样的东西（任何递归都可改成带显式栈的循环）`, diff:`循环空间 O(1)、无深度上限；递归空间 O(深度)但结构天然贴合树/图`, when:`一维线性往前走用循环；树、图、分治用递归`},
    {vs:`动态规划（自底向上填表）`, same:`记忆化递归和 DP 算的是同一张表`, diff:`递归按需填（自顶向下，可能跳过用不到的格子），DP 从底往上全填、无递归开销`, when:`子问题几乎全用到且要省栈就 DP；稀疏子问题用记忆化递归`},
    {vs:`数学归纳法`, same:`结构完全同构：基准情形 = 归纳基础，递推 = 归纳步`, diff:`一个是证明，一个是计算`, when:`判断递归对不对就用归纳法「只看一层」`}
  ],
  ext:[
    {t:`递推式的封闭解与生成函数`, go:'co.recursion'},
    {t:`归纳法：递归正确性的数学骨架`, go:'di.induction'},
    {t:`调用次数的指数增长与 Big-O`, go:'py.bigo'}
  ]
},

'py.class': {
  layers:{
    alg:`类 = 一组共享第一个参数的函数 + 一个属性字典；实例 = 一个带类型标签的 dict。s.m(x) 被翻译为 type(s).m(s, x)，self 就是被提出来的公因子。`,
    geo:`类是模板（一份代码），实例是从模板冻出来的每一支管，各自有自己的 __dict__。读属性像沿一条链往上找：实例 → 类 → 父类；写属性永远只落在实例自己身上。`,
    comp:`属性读取：先查 s.__dict__，没有再查 type(s).__dict__，再沿 MRO 查父类。属性写入：直接写 s.__dict__[name]。方法是类字典里的函数，通过描述符协议在取用时绑定 self。`
  },
  proof:{
    from:`对象有 __dict__；属性查找规则是实例字典优先、然后类字典、然后 MRO；方法是类上的普通函数`,
    to:`类变量共享、实例变量独立；「同一语法读写走不同路」解释了可变类变量的坑`,
    steps:[
      [`class C: xs = [] 把列表对象存进 C.__dict__["xs"]，只有一个`, `class 体在定义时执行一次，体内赋值都写进类字典`],
      [`a = C(); b = C() 各自有空的 __dict__，没有 xs`, `__init__ 没给 self.xs 赋值，实例字典里就没有这个键`],
      [`a.xs 读：a.__dict__ 没有 → 找 C.__dict__ 有 → 返回类上那个列表`, `查找规则实例优先、类兜底；读操作不会创建任何东西`],
      [`a.xs.append(1) 原地改类上那个列表，b.xs 立刻看到`, `两个实例读到的是同一个对象，append 改对象不改绑定`],
      [`a.xs = [1] 写：直接写进 a.__dict__，类字典不动，b 不受影响`, `写操作只落在实例自己身上，这是「读写不对称」的来源`],
      [`所以每个实例独有的可变状态必须在 __init__ 里 self.xs = []`, `__init__ 每次构造都执行，每个实例得到一个新列表`],
      [`方法绑定：C.m 是函数；s.m 取出时经描述符协议变成绑定方法，调用时把 s 塞进第一个参数`, `函数对象实现了 __get__，从实例取用时自动包一层；这就是 self 不是关键字的原因`],
      [`__init__ 只是初始化器：对象由 __new__ 先造好再传给它，所以它不能 return 值`, `构造分两步（分配 + 初始化），__init__ 的返回值被丢弃，返回非 None 直接报错`]
    ],
    end:`类的全部行为由「属性查找链 + 写只落实例 + 方法自动绑定 self」三条推出。可变类变量之坑就是「读走链、写落实例」的不对称。`
  },
  scratch:{
    lang:'python',
    code:`class Sample:
    log = []                      # 类变量：只有一份
    def __init__(self, conc):
        self.conc = conc          # 实例变量：每个实例一份
    def dilute(self, k):
        self.conc /= k; return self
a, b = Sample(10.0), Sample(20.0)
# 1. 读走链：a.log 找到的是类上的对象
print("a.log is Sample.log:", a.log is Sample.log, "| 'log' in a.__dict__:", 'log' in a.__dict__)
a.log.append("shared"); print("b.log:", b.log)
# 2. 写落实例：类不受影响
a.log = ["mine"]; print("a.__dict__:", a.__dict__, "| b.log:", b.log)
# 3. 方法就是类上的函数，self 是被塞进去的第一个参数
print("Sample.dilute is a function:", type(Sample.__dict__['dilute']).__name__)
Sample.dilute(a, 2); a.dilute(5)
print("a.conc:", a.conc, "| b.conc:", b.conc)
# 4. __init__ 不能 return
class Bad:
    def __init__(self): return 1
try:
    Bad()
except TypeError as e:
    print("TypeError:", e)`,
    out:`a.log is Sample.log: True | 'log' in a.__dict__: False
b.log: ['shared']
a.__dict__: {'conc': 10.0, 'log': ['mine']} | b.log: ['shared']
Sample.dilute is a function: function
a.conc: 1.0 | b.conc: 20.0
TypeError: __init__() should return None, not 'int'`,
    note:`第 1 段对应第 1-4 步（读走链、共享）；第 2 段对应第 5 步（写落实例）；Sample.dilute(a,2) 与 a.dilute(5) 等价对应第 7 步；最后一段是第 8 步。`
  },
  contrast:[
    {vs:`dict 字典`, same:`实例本质上就是一个带标签的 dict（s.__dict__）`, diff:`类固定了字段和行为、支持自动补全和类型提示；dict 字段动态`, when:`字段固定、有方法用类/@dataclass；字段来自外部 json 用 dict`},
    {vs:`闭包（带状态的函数）`, same:`都能把状态和操作绑在一起`, diff:`闭包的状态藏在 cell 里不好检视；实例状态在 __dict__ 里一目了然且能有多个方法`, when:`只有一个操作用闭包；多个操作共享状态用类`},
    {vs:`模块`, same:`都是命名空间，都能挂函数和数据`, diff:`模块只有一份（单例），类可以造多个实例`, when:`只需要一份状态用模块级变量；需要多份用类`}
  ],
  ext:[
    {t:`sklearn 的 fit/predict 就是「fit 把学到的东西存 self，predict 取出用」`, go:'da.pipeline'},
    {t:`继承与组合：属性查找链沿 MRO 继续向上`, go:''},
    {t:`DataFrame 本身就是一个类：列存字典 + 方法`, go:'da.dataframe'}
  ]
},

'py.bigo': {
  layers:{
    alg:`f(n)=O(g(n)) ⇔ 存在 C,n₀ 使 n>n₀ 时 f(n)≤C·g(n)。只保留最高阶项、丢常数，因为 n→∞ 时低阶项占比趋零。`,
    geo:`log-log 坐标上画运行时间：O(n^k) 是斜率 k 的直线，O(log n) 几乎平，指数级一柱冲天。问「n 翻倍时间翻几倍」：2 倍是 O(n)，4 倍是 O(n²)，只多一步是 O(log n)。`,
    comp:`机械读法：数循环层数，再找隐藏循环（x in list、list.index、insert(0)、字符串 +=）。每层乘一次 n；对半砍的 while 给 log n；分治按主定理。`
  },
  proof:{
    from:`基本操作耗时为常数；循环的次数可数；in list 是线性扫描、in set 是哈希查找`,
    to:`嵌套循环 O(n²)、循环内隐藏线性扫描 O(n²)、set 化后 O(n)、对半砍 O(log n)；且能从「n 翻倍时间翻几倍」实测出指数`,
    steps:[
      [`单层 for 遍历 n 个元素，体内常数操作，总次数 c·n = O(n)`, `循环次数就是元素个数，每次常数，乘起来`],
      [`两层嵌套：外层每一轮内层跑 n 次，总 n·n = O(n²)`, `内层次数不依赖外层变量时直接相乘（乘法原理）`],
      [`隐藏循环：for x in A: if x in B（B 是 list）—— in 是线性扫描 |B| 次`, `list 无按值入口，只能逐个比较，见 py.list_dict 第 2 步；所以这也是两层`],
      [`把 B 变 set：in 变成平均 O(1)，总 O(|A|+|B|)`, `建 set O(|B|) 一次，之后每次查询哈希 O(1)；总成本相加不相乘`],
      [`字符串循环 +=：第 k 次拼接要复制长度 k 的串，总 1+2+…+n = n(n+1)/2 = O(n²)`, `字符串不可变，每次「追加」都新建并复制整串；求和公式给出平方`],
      [`对半砍：while n>1: n//=2 跑 log₂n 次`, `每步 n 变 n/2，k 步后是 n/2^k，降到 1 需 k=log₂n`],
      [`实测判定：把 n 翻倍，若时间×2 是 O(n)，×4 是 O(n²)；斜率 = log₂(T(2n)/T(n))`, `若 T=Cn^k 则 T(2n)/T(n)=2^k，与常数 C 无关；所以不用知道机器快慢也能测出 k`],
      [`丢常数的合法性：n→∞ 时 3n²+100n 与 n² 之比趋于 3，一个常数`, `极限意义下只有最高阶项影响增长率；常数留给 profiling 去抠`]
    ],
    end:`复杂度从循环结构直接读出：显式层数相乘、隐藏扫描当一层、哈希把一层变常数、对半砍给 log。不用秒表，用「翻倍看倍数」就能测指数。`
  },
  scratch:{
    lang:'python',
    code:`# 用「计数比较次数」代替计时：确定、可复现
class Cmp:                       # 每次 == 都计数
    n = 0
    def __init__(self, v): self.v = v
    def __eq__(self, o): Cmp.n += 1; return self.v == o.v
    def __hash__(self): return hash(self.v)
import math
def count(f):
    Cmp.n = 0; f(); return Cmp.n
def list_in(n):                  # for x in A: x in B(list)
    A = [Cmp(i) for i in range(n)]; B = [Cmp(i) for i in range(n, 2*n)]
    return lambda: [x in B for x in A]
def set_in(n):
    A = [Cmp(i) for i in range(n)]; B = set(Cmp(i) for i in range(n, 2*n))
    return lambda: [x in B for x in A]
def strcat(n):                   # 字符串 += 的复制字节数
    tot = 0; s = ""
    for i in range(n): s += "x"; tot += len(s)
    return tot
print("n     list_in     set_in   str+= bytes-copied   log2(n)")
prev = None
for n in [250, 500, 1000, 2000]:
    li, si, sc = count(list_in(n)), count(set_in(n)), strcat(n)
    halves = 0; m = n
    while m > 1: m //= 2; halves += 1
    tag = "" if prev is None else f"  ratio list_in x{li/prev[0]:.0f}, str x{sc/prev[1]:.0f}"
    print(f"{n:<5} {li:<10} {si:<8} {sc:<18} {halves}{tag}")
    prev = (li, sc)`,
    out:`n     list_in     set_in   str+= bytes-copied   log2(n)
250   62500      0        31375              7
500   250000     0        125250             8  ratio list_in x4, str x4
1000  1000000    0        500500             9  ratio list_in x4, str x4
2000  4000000    0        2001000            10  ratio list_in x4, str x4`,
    note:`list_in 的比较次数 n 翻倍就 ×4（第 2-3 步，O(n²)）；set_in 始终 0 次 == 比较（哈希直接不撞，第 4 步）；字符串 += 复制字节数 n(n+1)/2 也 ×4（第 5 步）；最后一列是对半砍次数 log₂n（第 6 步）。`
  },
  contrast:[
    {vs:`profiling（%timeit / cProfile）`, same:`都在回答「慢在哪」`, diff:`复杂度看增长率、决定能不能扛住规模；profiling 看这一次哪行慢、抠常数`, when:`先用复杂度砍数量级，再用 profiling 抠常数`},
    {vs:`空间复杂度`, same:`同一套 O 记号`, diff:`一个数操作次数，一个数峰值内存；递归的 O(n) 栈、list(range(10**9)) 都是空间杀手`, when:`内存报警或 RecursionError 时看空间`},
    {vs:`平均 vs 最坏`, same:`都是渐近记号`, diff:`dict 平均 O(1) 最坏 O(n)；快排平均 n log n 最坏 n²`, when:`对抗性输入或实时系统看最坏，普通数据看平均`}
  ],
  ext:[
    {t:`O 记号的形式定义与常见函数增长排序`, go:'di.big_o'},
    {t:`log-log 图上读斜率`, go:'ns.log_scale'},
    {t:`数量级估算：10^7 次/秒的体感换算`, go:'ns.magnitude'}
  ]
},

'py.string': {
  layers:{
    alg:`str 是不可变的字符序列：支持一切只读序列操作（下标、切片、len、in、遍历），不支持任何原地修改。所有「修改」方法都返回新串。`,
    geo:`一条刻好字的石板：能读任何一段、能拓印出新的，但不能在原板上改字。DNA 序列就是这样的板，切片是限制酶，find 是探针。`,
    comp:`每个 str 是一块连续的码位数组 + 缓存的哈希值。s[i] O(1)；s.count/find 是 O(n·m) 扫描；s += t 分配新块并复制 len(s)+len(t) 字节。`
  },
  proof:{
    from:`str 对象创建后内容不可改；哈希值在创建后计算并缓存；序列协议`,
    to:`s[0]="C" 必须报错、方法必须返回新串、循环 += 是 O(n²)、字符串能当 dict key`,
    steps:[
      [`不可变 ⇒ 没有 __setitem__，s[0]="C" 抛 TypeError`, `类型不提供该协议，解释器找不到方法就报错；这不是保护，是根本没这个操作`],
      [`不可变 ⇒ replace/strip/upper 只能返回新对象，原串 id 不变`, `既然不能改原对象，「修改」的唯一实现方式是造新的`],
      [`不可变 ⇒ 哈希值可缓存：内容永不变，hash 算一次永远有效`, `可变对象若缓存哈希，改内容后哈希失真，落错桶；所以 list 不可哈希而 str 可以`],
      [`可哈希 ⇒ 可当 dict key / 进 set：基因名、孔号能直接当键`, `dict 要求 key 可哈希且相等则哈希相等，不可变的 str 天然满足`],
      [`循环 s += t：第 k 轮要新建长度约 k 的串并复制，总 Σk = O(n²)`, `每次都是「造新串」而非「追加」，复制量随当前长度线性增长，求和得平方`],
      [`"".join(parts)：先算总长一次性分配，再逐段复制，O(n)`, `知道总长才能一次分配；list 里的片段各复制一次，没有重复复制`],
      [`count 只数不重叠：找到一次后从匹配末尾继续扫`, `实现按「消费掉匹配」推进；重叠计数要用滑窗或 re 前瞻`],
      [`split/join 互逆：sep.join(s.split(sep)) == s`, `split 按分隔符切成片段列表且不含分隔符，join 用同一分隔符拼回，信息无损`]
    ],
    end:`一切从「不可变」推出：改不了所以返回新串、不变所以可哈希、可哈希所以能当 key、每次新建所以 += 是平方。掌握 split/join 这座桥，字符串与列表自由往返。`
  },
  scratch:{
    lang:'python',
    code:`s = "ATGCATGGC"
# 1. 不可变：无 __setitem__
try:
    s[0] = "C"
except TypeError as e:
    print("TypeError:", e)
# 2. 方法返回新对象，原串 id 不变
t = s.replace("ATG", "xxx"); print("s unchanged:", s, "| new:", t, "| same id:", id(s) == id(t))
# 3. 可哈希 => 可当 key；list 不行
d = {s: 1}; print("hash cached & usable as key:", d[s])
try:
    {list(s): 1}
except TypeError as e:
    print("TypeError:", e)
# 4. += 的累计复制字节数 O(n^2) vs join O(n)
def cost_plus(n):
    s2 = ""; tot = 0
    for _ in range(n): s2 += "A"; tot += len(s2)      # 每次复制当前长度
    return tot
def cost_join(n): return n                             # 每片复制一次
for n in [1000, 2000, 4000]:
    print(f"n={n}: += copies {cost_plus(n):>9} chars, join copies {cost_join(n):>5}")
# 5. count 不重叠；滑窗重叠
print("AAAA.count('AA') =", "AAAA".count("AA"), "| overlapping =", sum("AAAA"[i:i+2]=="AA" for i in range(3)))
# 6. split/join 互逆
print(",".join("a,b,,c".split(",")) == "a,b,,c", "|", s[::-1], s.count("ATG"), s[1:4])`,
    out:`TypeError: 'str' object does not support item assignment
s unchanged: ATGCATGGC | new: xxxCxxxGC | same id: False
hash cached & usable as key: 1
TypeError: unhashable type: 'list'
n=1000: += copies    500500 chars, join copies  1000
n=2000: += copies   2001000 chars, join copies  2000
n=4000: += copies   8002000 chars, join copies  4000
AAAA.count('AA') = 2 | overlapping = 3
True | CGGTACGTA 2 TGC`,
    note:`TypeError 两处对应第 1、4 步；id 不变对应第 2 步；复制字节数 n 翻倍 ×4 对应第 5-6 步；最后两行是第 7-8 步。`
  },
  contrast:[
    {vs:`bytes`, same:`都是不可变序列`, diff:`str 的元素是 Unicode 码位，bytes 是 0-255 整数；两者不能直接相加，编码/解码是唯一的桥`, when:`文本用 str，文件二进制/网络用 bytes`},
    {vs:`list`, same:`序列协议相同（下标、切片、len、in）`, diff:`list 可变可原地改、不可哈希；str 相反`, when:`要频繁改就转 list(s)，改完 "".join 回来`},
    {vs:`正则 re`, same:`都做文本匹配`, diff:`str 方法只处理固定子串；re 处理模式（可变长、可选、捕获组）`, when:`固定分隔符用 split，前后缀用 startswith；真有模式才上 re`}
  ],
  ext:[
    {t:`切片语义：含头不含尾、负步长`, go:'py.slice'},
    {t:`DNA/蛋白序列的比对与 k-mer 计数`, go:'bm.sequence'},
    {t:`字符的位表示与编码`, go:'di.bits'}
  ]
},

'py.debug': {
  layers:{
    alg:`程序是一串状态变换 s₀→s₁→…→sₙ。bug = 存在第一个 k 使 sₖ ≠ 你预期的 sₖ。调试就是找这个最小的 k：二分法 log₂n 次定位。`,
    geo:`Traceback 是倒着画的呼叫链：底部是爆炸点，往上是谁调了谁。错误类型是分类标签（哪一类不对），行号是地图坐标（哪里不对）。`,
    comp:`异常沿调用栈向上传播，每层帧记录文件、行号、函数名；未被捕获就打印整条链。assert 是自动化的「我以为」：条件为假立即抛 AssertionError 把沉默 bug 变响亮。`
  },
  proof:{
    from:`异常对象携带类型 + 消息 + 栈帧链；断言在条件为假时抛异常；每行代码的执行是有序的`,
    to:`读 Traceback 最后一行 + 自己文件的行号最快定位；沉默 bug 只能靠断言暴露；二分法 O(log n) 找到出错行`,
    steps:[
      [`异常从抛出点向外层帧逐层传播，每经过一帧就记录一条 (文件, 行号, 函数)`, `这是解释器的栈展开机制；所以 Traceback 从上到下是入口→爆炸点`],
      [`最后一行是异常类型 + 消息：它回答「什么不对」`, `类型是解释器在抛出点就确定的分类：Index/Key/Type/Name/Value 各对应一种状态错误`],
      [`从下往上第一个属于你的文件的帧，是「你的代码里最深的出错行」`, `库内部的帧是被你喂了坏数据才炸的，根因在数据来源，即你最深那一层`],
      [`沉默 bug 不抛异常：广播 (3,1)+(1,3) 合法地给 (3,3)、切片越界静默截断`, `这些操作按语言规则是合法的，解释器没有理由报错；「合法但不是你要的」只有你自己知道`],
      [`所以必须写 assert：把「我以为 shape 是 (n,3)」变成机器可检查的条件`, `断言把隐含预期显式化，第一次不满足就抛出，把静默错误转成响亮错误且指向精确位置`],
      [`二分定位：n 行代码，在中点打印中间量，正确则错在下半、否则上半`, `状态错误一旦发生就会一路带下去（单调），所以中点检查能把范围减半`],
      [`重复 log₂n 次收敛到一行`, `每次减半，100 行 7 次；比通读快一个量级且不需要理解全部逻辑`],
      [`最小复现：不断砍数据和代码直到再砍就不报错`, `保留错误的最小子集就是根因的「充分必要」部分，砍的过程本身把根因逼出来`]
    ],
    end:`Traceback 底部说「什么」、自己文件的行号说「哪里」；不报错的 bug 靠 assert 变成报错的 bug；再大的程序二分 log n 次就定位。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np, traceback
# 1. Traceback 结构：从底部读类型+消息，再找自己文件的帧
def load(d): return d["gene"]
def pipeline(d): return load(d) * 2
try:
    pipeline({"Gene": 1})
except Exception as e:
    tb = traceback.extract_tb(e.__traceback__)
    print("type:", type(e).__name__, "| msg:", e)
    print("frames (top->bottom):", [f.name for f in tb], "| deepest line:", tb[-1].lineno)
# 2. 沉默 bug：广播合法但不是你要的
a = np.arange(3).reshape(3,1); b = np.arange(3).reshape(1,3)
print("(3,1)+(1,3) ->", (a+b).shape, "  silently")
try:
    out = a + b
    assert out.shape == (3,), f"expected (3,), got {out.shape}"
except AssertionError as e:
    print("AssertionError:", e)
# 3. 二分定位：模拟 100 步流水线，第 37 步把状态弄坏
def step(i, x): return -abs(x) if i == 37 else x
def state_at(k):
    x = 1.0
    for i in range(1, k+1): x = step(i, x)
    return x
ok = lambda x: x > 0
lo, hi, checks = 0, 100, 0
while hi - lo > 1:
    mid = (lo+hi)//2; checks += 1
    if ok(state_at(mid)): lo = mid
    else: hi = mid
print(f"bisect: first bad step = {hi}, checks = {checks} (log2 100 ~ 6.6)")`,
    out:`type: KeyError | msg: 'gene'
frames (top->bottom): ['<module>', 'pipeline', 'load'] | deepest line: 3
(3,1)+(1,3) -> (3, 3)   silently
AssertionError: expected (3,), got (3, 3)
bisect: first bad step = 37, checks = 7 (log2 100 ~ 6.6)`,
    note:`extract_tb 展示第 1-3 步的帧链与最后一行；广播段对应第 4-5 步（合法但 assert 抓住）；二分段对应第 6-7 步，7 次定位到第 37 行。`
  },
  contrast:[
    {vs:`单元测试`, same:`都是「预期 vs 实际」的比对`, diff:`调试找已知的错，测试防未知的错；测试是留在仓库里的断言`, when:`修完一个 bug 顺手写一条测试它就不会回来`},
    {vs:`profiling`, same:`都是「程序不对劲」`, diff:`调试处理「结果错」，profiling 处理「结果对但慢」`, when:`不报错也不算错只是慢，用 %timeit / cProfile`},
    {vs:`日志 logging`, same:`都往外打信息`, diff:`print 是临时探针用完删；logging 有级别、可开关、留在生产代码里`, when:`一次性定位用 print，长期运行用 logging`}
  ],
  ext:[
    {t:`shape 断言是 numpy 调试的核心`, go:'np.array_shape'},
    {t:`广播的静默陷阱`, go:'np.broadcast'},
    {t:`PyTorch 里的 shape 调试`, go:'pt.debug_shape'}
  ]
},

'py.slice': {
  layers:{
    alg:`xs[a:b:c] 取下标 a, a+c, a+2c, … 且 (c>0 时) < b。半开区间 [a,b) 让 len = b-a、xs[:k]+xs[k:] = xs、相邻块无缝无重叠——这三条同时成立只有半开一种选法。`,
    geo:`下标标的是格子之间的缝隙：0 在最左缘，n 在最右缘。xs[a:b] 是「从缝 a 剪到缝 b」，剪下来的正是两刀之间的东西。负数是从右缘往回数缝。`,
    comp:`slice.indices(len) 把 (a,b,c) 规范化：None 换成方向边界、负数加 len、越界钳到 [0,len]。list 切片复制指针（浅拷贝）；ndarray 切片只改 offset 和 strides，零拷贝（视图）。`
  },
  proof:{
    from:`序列长 n；切片语义由 (start, stop, step) 三个整数定义；ndarray 元素地址 = base + Σ iₖ·strideₖ`,
    to:`半开区间是使 len=b-a、拼接无缝、越界不报错三条同时成立的唯一约定；ndarray 切片必然是视图`,
    steps:[
      [`规范化：None → (c>0 ? 0 : n-1) 或 (c>0 ? n : -1)；负数 += n；然后钳到 [0,n]`, `把所有写法归一成三个非负整数，后面只需一条公式；钳位就是「越界不报错」的来源`],
      [`元素集合 = {a + k·c : k ≥ 0, a+k·c < b}（c>0）`, `这是切片的定义；k 的个数 = ceil((b-a)/c)`],
      [`c=1 时 len = b-a：k 取 0..b-a-1`, `半开使 stop 不计入，长度公式没有 ±1；闭区间就得写 b-a+1`],
      [`拼接无缝：xs[:k] 取 [0,k)，xs[k:] 取 [k,n)，并集 [0,n) 无重叠无遗漏`, `两个半开区间在同一点 k 一个闭一个开，恰好衔接；闭区间会重复 k`],
      [`负步长：方向反转，起点在右，stop 仍不包含；xs[::-1] 规范化为 (n-1, -1, -1)`, `stop 规范化为 -1 而不是 0，否则 0 号元素被排除；所以 xs[:3:-1] 是从末尾走到 4 停`],
      [`list 切片新建列表并复制 b-a 个指针：外层独立、元素共享（浅拷贝）`, `列表元素本身是引用，复制指针不复制对象，所以嵌套结构改内层两边都变`],
      [`ndarray 切片 [a:b:c] 只需 offset += a·stride，stride *= c，shape 改成 len`, `地址公式是线性的，切片就是换起点与步长，无需搬任何数据，所以是视图`],
      [`花式索引 a[[0,2,7]] 无法用一个 (offset, stride) 表达，必须拷贝`, `任意下标序列不是等差数列，不满足线性地址公式，只能逐个复制`]
    ],
    end:`半开区间 = 让长度、拼接、分块三个公式都没有 ±1 的唯一选择。ndarray 切片零拷贝，因为它只改地址公式的参数；花式索引必须拷贝，因为它不是等差数列。`
  },
  scratch:{
    lang:'python',
    code:`import numpy as np, random
random.seed(0)
# 1. 手写 slice 规范化 + 取元素，与内置切片对比
def norm(a, b, c, n):
    if c is None: c = 1
    if a is None: a = 0 if c > 0 else n-1
    elif a < 0: a += n
    if b is None: b = n if c > 0 else -1
    elif b < 0: b += n
    clamp = (lambda v: min(max(v, 0), n)) if c > 0 else (lambda v: min(max(v, -1), n-1))
    return clamp(a), clamp(b), c
def my_slice(xs, a, b, c):
    a, b, c = norm(a, b, c, len(xs)); out = []; i = a
    while (i < b) if c > 0 else (i > b): out.append(xs[i]); i += c
    return out
xs = list(range(10)); bad = 0
for _ in range(3000):
    a, b = [random.choice([None]+list(range(-13, 13))) for _ in range(2)]
    c = random.choice([None, 1, 2, 3, -1, -2])
    if my_slice(xs, a, b, c) != xs[a:b:c]: bad += 1
print("random slices mismatch:", bad, "/ 3000")
print("xs[3::-1]=", xs[3::-1], " xs[:3:-1]=", xs[:3:-1], " xs[10:]=", xs[10:], " (no error)")
# 2. 半开的三条性质
a, b = 2, 7
print("len==b-a:", len(xs[a:b]) == b-a, "| xs[:5]+xs[5:]==xs:", xs[:5]+xs[5:] == xs)
# 3. ndarray 切片只改 offset/strides => 视图；花式索引 => 拷贝
arr = np.arange(10, dtype=np.int64)
v = arr[2:8:2]
print("strides:", arr.strides, "->", v.strides, "| shares memory:", np.shares_memory(arr, v))
v[0] = 99; print("arr after v[0]=99:", arr[:5])
f = arr[[0, 2, 7]]; print("fancy shares memory:", np.shares_memory(arr, f))`,
    out:`random slices mismatch: 0 / 3000
xs[3::-1]= [3, 2, 1, 0]  xs[:3:-1]= [9, 8, 7, 6, 5, 4]  xs[10:]= []  (no error)
len==b-a: True | xs[:5]+xs[5:]==xs: True
strides: (8,) -> (16,) | shares memory: True
arr after v[0]=99: [ 0  1 99  3  4]
fancy shares memory: False`,
    note:`norm 函数就是第 1 步的规范化，3000 个随机切片零不匹配验证第 2-5 步；len/拼接检查是第 3-4 步；strides 从 8 变 16 且共享内存是第 7 步，花式索引不共享是第 8 步。`
  },
  contrast:[
    {vs:`numpy 花式索引 a[[0,2,7]]`, same:`都从数组里挑元素`, diff:`切片是等差序列、零拷贝视图；花式索引任意下标、必然拷贝`, when:`连续/等距取用切片；乱序、重复、按表取用花式索引`},
    {vs:`布尔掩码 a[a>2]`, same:`都能「取子集」`, diff:`掩码按条件选、结果长度事先未知、返回拷贝`, when:`按值筛用掩码，按位置取用切片`},
    {vs:`range(a,b,c)`, same:`同样的 (start, stop, step) 半开语义`, diff:`range 生成整数序列，切片用这些整数去索引序列`, when:`需要下标本身用 range，需要元素用切片`},
    {vs:`pandas loc 切片`, same:`语法长得一样`, diff:`loc 按标签且含尾（标签的「下一个」无定义）；iloc 按位置不含尾`, when:`标签用 loc，位置用 iloc，别混`}
  ],
  ext:[
    {t:`字符串切片：同一套规则`, go:'py.string'},
    {t:`多维切片与 strides 的完整模型`, go:'np.array_shape'},
    {t:`视图与拷贝：可变与引用`, go:'py.mutable'}
  ]
},

'py.mutable': {
  layers:{
    alg:`变量是名字到对象的绑定（一张标签）。赋值 b=a 是给同一对象再贴一张标签；原地方法改对象本身；「不可变」类型没有任何原地操作，所有「修改」都是新对象换标签。`,
    geo:`对象是堆上的箱子，名字是贴在箱子上的便签。b=a 是两张便签贴同一箱；浅拷贝是新箱子里装同一批旧内容物的引用；深拷贝是连内容物一起复制到底。`,
    comp:`每个对象有唯一 id（地址）和引用计数。赋值只增引用计数，不搬数据。list.copy() 分配新的指针数组并复制指针；deepcopy 递归复制并用 memo 表处理环。ndarray 切片返回持有 base 的视图。`
  },
  proof:{
    from:`名字是绑定不是存储；对象有身份（id）与内容；可变类型提供原地操作、不可变类型不提供`,
    to:`b=a 后改 b 影响 a；浅拷贝只隔离外层；[[0]*3]*2 两行同体；+= 对 list 原地对 tuple 换绑；ndarray 切片共享内存`,
    steps:[
      [`b = a 执行后 id(a)==id(b)：赋值不创建对象，只创建绑定`, `赋值语句的语义是「让名字指向右边表达式求出的对象」，右边是已有对象，没有构造动作`],
      [`b.append(2) 是对对象的原地操作，a 通过同一 id 看到变化`, `方法作用于对象而非名字；所有指向该对象的名字都观察到同一内容`],
      [`浅拷贝 c = a.copy()：新建外层列表，复制的是元素的引用（指针）`, `复制指针数组是 O(n) 的常数动作，不递归进入元素；所以 c is not a 但 c[0] is a[0]`],
      [`[[0]*3]*2：外层 * 把同一个内层列表引用重复 2 次，两行同体`, `序列乘法复制引用不复制对象，这是第 3 步在构造时的表现`],
      [`深拷贝递归复制每一层，用 memo 字典避免重复与环`, `要彻底独立必须递归；memo 保证同一对象只复制一次，环不会无限递归`],
      [`+= 对 list 调 __iadd__ 原地扩展；tuple 无 __iadd__，退化为 a = a + b 换绑`, `运算符协议：有原地版本就用，没有就回退到 __add__ 再赋值；所以同一符号行为随类型分叉`],
      [`ndarray 切片 v = a[:3] 返回视图：v.base is a，共享同一块内存`, `切片只改 offset/strides（见 py.slice），不复制数据；这是为处理 GB 级数组省内存的设计`],
      [`is 比 id、== 比内容；None 是单例所以用 is None`, `身份与相等是两个问题；小整数缓存让 is 偶尔「碰巧」为真，不能当值比较`]
    ],
    end:`一切来自「名字是标签」：赋值贴标签、原地改对象、拷贝分深浅、+= 随类型分叉、ndarray 切片是视图。要独立就显式 copy/deepcopy，要判空用 is None。`
  },
  scratch:{
    lang:'python',
    code:`import copy, numpy as np
# 1. 赋值只贴标签
a = [1]; b = a; b.append(2)
print("id same:", id(a) == id(b), "| a:", a)
# 2. 浅拷贝：外层新、内层共享
a = [[0]*3, [0]*3]; c = a.copy(); c[0][0] = 9; c.append("new")
print("c is a:", c is a, "| c[0] is a[0]:", c[0] is a[0], "| a:", a)
# 3. [[0]*3]*2 两行同体
m = [[0]*3]*2; m[0][0] = 1
print("[[0]*3]*2 after m[0][0]=1:", m, "| rows same object:", m[0] is m[1])
# 4. 深拷贝隔离到底
d = copy.deepcopy(a); d[0][0] = -1
print("deepcopy: a[0][0] =", a[0][0], "| d[0][0] =", d[0][0])
# 5. += 随类型分叉
L = [1]; L2 = L; L += [2]
T = (1,); T2 = T; T += (2,)
print("list +=: L2 is L", L2 is L, L2, "| tuple +=: T2 is T", T2 is T, T2)
# 6. ndarray 切片视图 vs 拷贝
arr = np.arange(6); v = arr[:3]; v[0] = 99
print("view base is arr:", v.base is arr, "| arr:", arr, "| copy independent:", arr[:3].copy().base is None)
# 7. is vs ==
x = [1, 2]; y = [1, 2]
print("x == y:", x == y, "| x is y:", x is y, "| None is None:", None is None)`,
    out:`id same: True | a: [1, 2]
c is a: False | c[0] is a[0]: True | a: [[9, 0, 0], [0, 0, 0]]
[[0]*3]*2 after m[0][0]=1: [[1, 0, 0], [1, 0, 0]] | rows same object: True
deepcopy: a[0][0] = 9 | d[0][0] = -1
list +=: L2 is L True [1, 2] | tuple +=: T2 is T False (1,)
view base is arr: True | arr: [99  1  2  3  4  5] | copy independent: True
x == y: True | x is y: False | None is None: True`,
    note:`第 1-2 段对应第 1-3 步；[[0]*3]*2 对应第 4 步；deepcopy 对应第 5 步；+= 分叉对应第 6 步；v.base is arr 对应第 7 步；最后一行是第 8 步。`
  },
  contrast:[
    {vs:`函数参数传递`, same:`调用时形参绑定实参就是一次 b=a`, diff:`函数内重新赋值只挪函数内的标签；原地方法改共享对象`, when:`函数不应改入参就只读+返回新对象；确需原地改在函数名里写明`},
    {vs:`numpy 视图`, same:`都是「两个名字看同一块数据」`, diff:`视图是同一内存的另一种读法（shape/strides 可不同），不是同一对象；v is a 为 False 但共享内存`, when:`用 np.shares_memory 或 .base 判断，不能用 is`},
    {vs:`pandas 链式赋值`, same:`同样是「改了副本以为改了原表」`, diff:`布尔索引返回副本，副本上的赋值随即丢弃`, when:`一律 df.loc[cond, col] = v 单次索引`}
  ],
  ext:[
    {t:`切片为什么是视图：地址公式`, go:'py.slice'},
    {t:`reshape/transpose 返回视图的 strides 机制`, go:'np.reshape'},
    {t:`掩码与花式索引返回拷贝`, go:'np.mask'}
  ]
},

});
