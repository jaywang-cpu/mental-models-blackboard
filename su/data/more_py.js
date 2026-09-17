/* 数理宇宙 v2 · 加题：py Python 大陆（每节点 8 题，前 4 题秒答·读代码说输出，后 4 题 30 秒·怎么改快改对）
   所有输出用 python3 实跑验证过。旁挂文件，不改动 data/code_a.js。 */
window.MORE = window.MORE || {};
Object.assign(window.MORE, {

'py.list_dict':[
  {q:'d={"a":1}; d.setdefault("b",[]).append(2); print(d)', a:'{"a": 1, "b": [2]}', how:'setdefault 返回的是桶本身，可以直接往里塞——建“键→列表”索引的标准写法'},
  {q:'print(len({1, 1.0, True, "x"}))', a:'2', how:'1 == 1.0 == True 且哈希相同，在 set 里算同一个 key；只剩 1 和 "x"'},
  {q:'print(list({"b":2,"a":1,"c":3}))', a:'["b", "a", "c"]', how:'dict 保插入顺序，不是排序；要排序必须显式 sorted'},
  {q:'print({"a":1,"b":2} | {"b":9,"c":3})', a:'{"a": 1, "b": 9, "c": 3}', how:'| 合并两个 dict，右边覆盖左边；3.9 起可用'},
  {q:'两块板各 5 万个孔号，要找共有孔号。now：[w for w in p1 if w in p2]。怎么改快？', a:'先 s2=set(p2)，再 [w for w in p1 if w in s2]；不在乎顺序就 set(p1)&set(p2)', how:'循环里对 list 做 in，一律先把被查那一方转 set'},
  {q:'counts[base] = counts[base] + 1 在第一个碱基就 KeyError。三种改法？', a:'counts.get(base,0)+1；collections.defaultdict(int)；collections.Counter(seq) 一步到位', how:'“对每个类别累加”永远是 Counter，别手写计数循环'},
  {q:'现在有三个平行 list：plates、wells、ods，长度都是 960，查“3 号板 A1 孔的 OD”要写双重循环。怎么重构？', a:'嵌套 dict {板号: {孔号: OD}}，或用 (板号,孔号) 元组当 key 的一层 dict', how:'多个平行 list 靠下标对齐 = 迟早错位；改成 dict 让 key 自己对号'},
  {q:'想用 [板号, 孔号] 当 dict 的 key，报 TypeError: unhashable type: "list"。怎么改？', a:'改成元组 ("p1","A1")；d[("p1","A1")] 正常工作', how:'key 必须不可变：list 不行，tuple 行；这是可哈希的定义'}
],

'py.loop_comprehension':[
  {q:'print([x for x in range(6) if x%2][::-1])', a:'[5, 3, 1]', how:'先过滤出奇数 [1,3,5]，再整体倒序'},
  {q:'print({x%3 for x in range(10)})', a:'{0, 1, 2}', how:'花括号加单值是集合推导，自动去重'},
  {q:'print(sum(1 for c in "ATGCAA" if c=="A"))', a:'3', how:'sum(1 for …) 是不建列表的计数写法，内存常数'},
  {q:'g=[[0]*2]*2; g[0][0]=9; print(g)', a:'[[9, 0], [9, 0]]', how:'*2 复制的是同一个内层列表的引用；改一个全变。要独立必须 [[0]*2 for _ in range(2)]'},
  {q:'20 万行 rows 求 OD 总和，写成 sum([float(r["od"]) for r in rows])。怎么省内存？', a:'去掉方括号：sum(float(r["od"]) for r in rows)', how:'sum/max/any 后面直接给生成器表达式，别先造一个用完就扔的列表'},
  {q:'g=(x*x for x in range(4)); print(sum(g), sum(g)) 输出 14 0。为什么？要复用怎么办？', a:'生成器只能消费一次，第二次已经空了；要复用就 vals=list(g) 存下来', how:'生成器是配方不是结果；需要走两遍就落成 list'},
  {q:'[f(x) for x in xs if f(x) > 0]，f 是一次 0.1 秒的拟合。怎么改？', a:'用海象：[y for x in xs if (y:=f(x)) > 0]', how:'推导式里同一个昂贵调用出现两次，就上 walrus 只算一遍'},
  {q:'[[c for c in line.split(",")] for line in open(f) for f in files if line] 报 NameError。错在哪？', a:'for 的顺序写反了：外层应是 for f in files，内层才是 for line in open(f)。推导式里最左的 for 是最外层', how:'多层推导式的 for 顺序 = 缩进从上到下的顺序，不能倒着读'}
],

'py.function':[
  {q:'def f(x, acc=[]): acc.append(x); return acc。连续 print(f(1)) 和 print(f(2)) 输出？', a:'[1] 然后 [1, 2]', how:'默认值在 def 执行时只创建一次，被所有调用共享——可变默认参数第一坑'},
  {q:'n=1; def f(x=n): return x; n=99; print(f())', a:'1', how:'默认值在定义时求值并冻住，不是每次调用现取'},
  {q:'def f(x): x*2 ；print(f(3))', a:'None', how:'没有 return 的函数返回 None；算了不返回等于白算'},
  {q:'def f(a,*b,**c): return (a,b,c) ；print(f(1,2,3,k=4))', a:'(1, (2, 3), {"k": 4})', how:'*b 收位置参数成元组，**c 收关键字成字典'},
  {q:'上面的 def f(x, acc=[]) 怎么改对？', a:'def f(x, acc=None): if acc is None: acc=[] ；再 acc.append(x)', how:'默认参数只放不可变量（None/数字/字符串），可变的一律 None 哨兵'},
  {q:'def h(xs): xs.append(9) ；a=[1]; h(a) 之后 a 变成 [1,9]，不想动原数据怎么改？', a:'函数里先 xs = list(xs) 再改，或调用时传 h(a[:])；最好返回新列表而不是原地改', how:'函数拿到的是同一个对象的标签；想不污染就在函数里先拷一份'},
  {q:'def log(msg, t=datetime.now()): … 所有日志时间戳都一样。为什么？怎么改？', a:'now() 在 def 时算了一次就冻住；改成 t=None，函数体里 t = t or datetime.now()', how:'默认值里绝不放“调用时才该求”的东西'},
  {q:'一个函数里用了 global counts 累加。评审说要改，怎么改？', a:'把 counts 作为参数传进去、返回新值，或返回增量由调用方合并', how:'全局可变状态 = Jupyter 里跑第二遍结果就变；输入输出全走参数和返回值'}
],

'py.recursion':[
  {q:'def rsum(n): return 0 if n==0 else n+rsum(n-1) ；print(rsum(4))', a:'10', how:'4+3+2+1+0；底是 n==0 返回 0'},
  {q:'朴素 fib（fib(n)=n if n<2）算 fib(6)，fib 函数一共被调用几次？', a:'25 次', how:'调用数 = 2*fib(n+1)-1；朴素递归是 O(φⁿ)，重复算同一个子问题'},
  {q:'def flat(x): return [x] if not isinstance(x,list) else [y for i in x for y in flat(i)] ；print(flat([1,[2,[3,[4]]]]))', a:'[1, 2, 3, 4]', how:'递归天然适合任意深度嵌套；迭代写法得自己维护一个栈'},
  {q:'print(sys.getrecursionlimit()) 默认是多少？', a:'1000', how:'超过就 RecursionError；Python 没有尾递归优化，深度是硬约束'},
  {q:'朴素 fib(35) 要跑几十秒。一行怎么改快？', a:'函数上加 @functools.lru_cache(None)；fib(30) 的调用次数从百万级降到 31 次', how:'纯函数 + 重复子问题 = 直接上 lru_cache，不用自己写记忆化字典'},
  {q:'遍历 10 万层深的目录树，递归写法 RecursionError。怎么改？', a:'改迭代：用一个 list 当栈，while stack: node=stack.pop() … stack.extend(children)', how:'深度可能超千的递归一律改显式栈；sys.setrecursionlimit 只是治标还可能爆内存'},
  {q:'解析嵌套的 FASTA 目录，递归函数忘了写底，程序直接崩。底该怎么定？', a:'底 = 不能再拆的那一层（不是目录、或列表为空）；先写底再写递归步', how:'写递归的顺序永远是：先写“什么时候停”，再写“怎么缩小一步”'},
  {q:'求 1..n 的和，n=10^6。递归还是迭代？', a:'迭代（或直接 n*(n+1)//2）。递归会在 n≈1000 时 RecursionError', how:'线性递归没有分支结构可言，一律改循环；能有闭式就别循环'}
],

'py.class':[
  {q:'class C: xs=[] ；a=C(); b=C(); a.xs.append(1); print(a.xs, b.xs)', a:'[1] [1]', how:'类体里写的是类变量，所有实例共享同一个对象'},
  {q:'class C: def __init__(self): self.xs=[] ；a=C(); b=C(); a.xs.append(1); print(a.xs, b.xs)', a:'[1] []', how:'self.xs 每次 __init__ 都新建一个，实例之间独立'},
  {q:'class S: def __init__(self,v): self.v=v ；print(S(1)==S(1))', a:'False', how:'默认的 == 比的是身份（是不是同一个对象），不比内容'},
  {q:'class C: def __init__(self,c): self.c=c ；def dilute(self,f): self.c/=f; return self ；print(C(100).dilute(2).dilute(5).c)', a:'10.0', how:'方法 return self 就能链式调用；除法结果是 float'},
  {q:'class Plate: wells=[] 导致所有板共享孔位。怎么改？', a:'搬进 __init__：def __init__(self): self.wells = []', how:'会被修改的东西一律放实例；类变量只放常量（单位、默认阈值）'},
  {q:'想让 S(1) == S(1) 为 True，怎么改？', a:'定义 __eq__(self, o): return self.v == o.v；想当 dict key 还要配 __hash__', how:'== 看内容就实现 __eq__；is 永远只看身份，改不了'},
  {q:'print(sample_list) 出来一堆 <__main__.Sample object at 0x…>，看不出是哪个样品。怎么改？', a:'加 __repr__(self): return f"Sample({self.id}, {self.conc})"', how:'调试用 __repr__ 不是 __str__；容器打印时调的是 repr'},
  {q:'一个 Sample 类只有 __init__ 和几个字段，没有方法。怎么简化？', a:'@dataclasses.dataclass，自动给 __init__/__repr__/__eq__；不可变就加 frozen=True', how:'只装数据不装行为的类，一律 dataclass（或 NamedTuple）'}
],

'py.bigo':[
  {q:'xs=[]; for i in range(5): xs.insert(0,i) ；print(xs)。这个循环 n 次是什么复杂度？', a:'[4, 3, 2, 1, 0]；O(n²)', how:'insert(0) 要把已有元素整体后挪；要在头部加就用 collections.deque.appendleft'},
  {q:'for i in range(n): for j in range(i)，循环体一共执行几次？', a:'n(n-1)/2 次，O(n²)', how:'内层跟着 i 走的三角形循环仍是 O(n²)，常数是 1/2'},
  {q:'n=10^6，O(n²) 每步 1 ns，大约要多久？', a:'10^12 ns = 1000 秒 ≈ 17 分钟', how:'先估量级：10^6 平方是 10^12，1 ns 一步就是 10^3 秒'},
  {q:'在 10^6 个已排序元素里二分查找，最多几次比较？', a:'约 20 次（log2(10^6) ≈ 20）', how:'log2 每翻十倍加 3.3；10^6 → 20，10^9 → 30'},
  {q:'循环里做 s += line 拼接 10 万行文本，很慢。怎么改？', a:'收进 list 再 "".join(parts)；O(n²) 降到 O(n)', how:'字符串不可变，每次 += 都新建整串；批量拼接一律 join'},
  {q:'20 万条读数要取最大的 10 条，现在写的是 sorted(xs)[-10:]。怎么改快？', a:'heapq.nlargest(10, xs)：O(n log k) 而不是 O(n log n)', how:'“只要前 k 个”别全排序，用 heapq'},
  {q:'外层 10 万样本，内层在 10 万个已知 ID 的 list 里 in 查。怎么把 10^10 降到 10^5？', a:'循环外先 known = set(ids)，内层 if x in known 变 O(1)', how:'一次建表 O(n)，之后每查 O(1)——把 O(n²) 拍平成 O(n) 的通用招'},
  {q:'代码是纯数值的逐元素循环，n=10^7，已经用了推导式还是慢。下一步？', a:'上 NumPy 向量化：循环推到 C 层，通常快 10-100 倍', how:'优化顺序：先砍复杂度（换数据结构），再向量化，最后才谈微优化'}
],

'py.string':[
  {q:'print("  ATG\\n".strip())', a:'ATG', how:'strip 默认去两端所有空白，含 \\n \\r \\t；读文件行必做'},
  {q:'print("A,B,,C".split(","))', a:'["A", "B", "", "C"]', how:'split 指定分隔符时不合并连续分隔符，空字段会保留——csv 里的空孔就是这么来的'},
  {q:'print("ATGATG".find("GA"))', a:'2', how:'find 返回首次出现的下标，找不到返回 -1（不是报错）'},
  {q:'print("plate_A1_od.csv".rsplit("_",1))', a:'["plate_A1", "od.csv"]', how:'从右切一刀用 rsplit + maxsplit；拆文件名后缀的标准手法'},
  {q:'循环里 out = out + line 拼 5 万行 FASTA，慢得离谱。怎么改？', a:'parts=[] 收着，最后 "".join(parts)', how:'字符串不可变 → 循环拼接一律先收 list 再 join'},
  {q:'FASTA 里同一条序列被换行断成多行，怎么把一条序列拼回来？', a:'遇到 ">" 开头就开新记录，否则把 line.strip() 追加进当前记录的 list，读完再 join', how:'解析 FASTA 的骨架：以 ">" 判断记录边界，序列行一律 strip 后累积'},
  {q:'两个孔号看着都是 "A1" 却 != ，怎么查？', a:'print(repr(a), repr(b))：多半是 "A1\\r"（Windows 换行）或前后空格、不间断空格', how:'字符串诡异不等一律先 repr 看真身，别用 print 看'},
  {q:'把 "  A1 , 0.352 \\r\\n" 这行 csv 拆成干净的 (孔号, 浮点数)，怎么写？', a:'w, v = [p.strip() for p in line.strip().split(",")]；再 float(v)', how:'先整行 strip 去行尾，再逐字段 strip 去内部空格，最后才转类型'}
],

'py.debug':[
  {q:'int("3.0") 报什么错？', a:'ValueError: invalid literal for int() with base 10: "3.0"', how:'int 不吃小数字符串；要 int(float("3.0"))'},
  {q:'float("n/a") 报什么错？', a:'ValueError: could not convert string to float: "n/a"', how:'酶标仪导出的空孔常写 n/a 或 OVRFLW，转换前必须挡一道'},
  {q:'[1,2,3].remove(9) 报什么错？', a:'ValueError: list.remove(x): x not in list', how:'remove 按值删且不存在就炸；不确定就先 if 9 in xs'},
  {q:'print(0.1+0.2 == 0.3)', a:'False', how:'二进制浮点没有精确的 0.1；比较浮点用 math.isclose 或 round 到有效位'},
  {q:'df = pd.read_csv(...) 在 Jupyter 里跑第二遍结果就变了，重启内核又对。为什么？怎么改？', a:'状态污染：某个 cell 原地改了 df 或复用了全局变量。把逻辑包成函数、只靠参数和返回值传状态，改完 Restart & Run All 验证一遍', how:'Jupyter 的输出只有在 Restart & Run All 之下才算数'},
  {q:'一个 20 万行的批处理跑到第 3 万行崩在 float(v)。怎么改成跑完并知道哪几行坏？', a:'包 try/except ValueError，把 (行号, 原值) 记进 bad 列表，继续跑；跑完打印 bad', how:'批处理里“一条坏数据毁掉整批”要用窄 except 收集而不是中断'},
  {q:'except: pass 把所有错都吞了，现在结果不对但看不出哪错。怎么改？', a:'只接住你预期的类型（except ValueError as e），并把 e 和上下文打印或记日志', how:'裸 except 是把报错信息扔掉——报错是唯一告诉你哪错的东西'},
  {q:'函数返回值不对，但不知道中间哪一步偏了。最省事的定位法？', a:'二分插桩：在函数中点 print(repr(中间量))，对了就往后半段挪，错了就往前半段；或直接 breakpoint()', how:'调 bug 是二分查找不是通读代码：每次把可疑区间砍一半'}
],

'py.slice':[
  {q:'xs=[0,1,2,3,4,5]; print(xs[10:20])', a:'[]', how:'切片越界不报错只给空；单个下标 xs[10] 才 IndexError'},
  {q:'xs=[0,1,2,3,4,5]; print(xs[-1:], xs[-1])', a:'[5] 5', how:'切片永远返回同类型容器，单下标返回元素本身'},
  {q:'xs=[0,1,2,3,4,5]; print(xs[5:1:-1])', a:'[5, 4, 3, 2]', how:'负步长时 start 在右 stop 在左，仍然含头不含尾'},
  {q:'a=[0,1,2,3,4,5]; a[1:3]=[9]; print(a)', a:'[0, 9, 3, 4, 5]', how:'切片赋值可以改变长度：两格换成一格，整体缩短'},
  {q:'b = a[:] 之后改 b[0].append(9)，a 也变了。为什么？怎么改？', a:'切片是浅拷贝，只复制外层，内层还是同一批对象；要独立用 copy.deepcopy(a)', how:'嵌套结构的 [:] 只挡住外层；内层共享是浅拷贝的定义'},
  {q:'要取一个 list 的最后 3 个元素，n 可能小于 3。xs[-3:] 安全吗？', a:'安全，n<3 时给出全部；别写 xs[len(xs)-3:]，n<3 会得到负起点从而错位', how:'负索引切片天然容错，手算长度反而容易越界'},
  {q:'想把 xs 就地清空，让所有指向它的引用都看到。怎么写？', a:'xs[:] = [] 或 xs.clear()；写 xs = [] 只是把本地标签挪走，别人还看着老列表', how:'“就地改”走切片赋值/clear，“重新绑定”走 =，两者对别的引用效果完全不同'},
  {q:'图片文件夹里 3 万个路径，只要每隔 100 张抽一张做质检。怎么写？', a:'paths[::100]，或大数据量下 itertools.islice(paths, 0, None, 100) 不建中间列表', how:'等间隔抽样就是步长切片；内存吃紧时换 islice'}
],

'py.mutable':[
  {q:'a=[1,2]; b=a; b+=[3]; print(a, b)', a:'[1, 2, 3] [1, 2, 3]', how:'list 的 += 是就地 extend，两个标签指同一个对象'},
  {q:'a=[1,2]; b=a; b=b+[3]; print(a, b)', a:'[1, 2] [1, 2, 3]', how:'b = b + […] 新建了一个对象再重绑标签，原对象没动'},
  {q:'a=(1,2); b=a; b+=(3,); print(a, b)', a:'(1, 2) (1, 2, 3)', how:'tuple 不可变，+= 只能新建再重绑；不可变类型没有“就地改”'},
  {q:'rows=[{"v":0}]*2; rows[0]["v"]=5; print(rows)', a:'[{"v": 5}, {"v": 5}]', how:'*2 复制引用不复制对象；建 n 个独立字典要 [dict() for _ in range(n)]'},
  {q:'d2 = d1.copy() 之后改 d2["x"].append(2)，d1 也变了。怎么改？', a:'copy.deepcopy(d1)；或建 d2 时对每个值单独重建', how:'.copy() / dict(d) / [:] 都是浅拷贝，只挡一层'},
  {q:'一个函数原地改了传进来的 DataFrame，上游数据被污染。怎么改？', a:'函数开头 df = df.copy()，或全程用返回新对象的写法并让调用方接住', how:'“函数是否改我的输入”必须是明确的约定；默认选不改'},
  {q:'实验参数字典想传给多个分析函数，怕被改。怎么防？', a:'用不可变结构：tuple / frozenset / dataclass(frozen=True) / types.MappingProxyType(d)', how:'防污染最彻底的手段是让它根本改不动，而不是靠纪律'},
  {q:'不确定 a 和 b 是不是同一个对象，怎么一行查？', a:'print(a is b, id(a), id(b))；is 比身份，== 比内容', how:'凡是“我改了这个那个怎么也变了”，第一步就是打 is'}
]

});
