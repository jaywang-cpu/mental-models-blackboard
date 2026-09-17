/* 代码宇宙 · 分片 A：py Python | np NumPy张量 | vz 可视化 | da 数据 */
window.PARTS = window.PARTS || [];
PARTS.push({
page:'code',
domains:[
  {id:'py', name:'编程', en:'Python', color:'#3BE8FF',
   one:'一句话：把想法翻译成机器一步步能做的动作', book:'鸢尾花书 Book1 编程不难 ch1-9：变量/容器/控制流/函数/类/异常'},
  {id:'np', name:'张量', en:'NumPy', color:'#8B6CFF',
   one:'一句话：shape 是一切，所有运算先问形状', book:'鸢尾花书 Book1 编程不难 ch13-16：数组/广播/随机/线代'},
  {id:'vz', name:'可视化', en:'Visualize', color:'#5CE8A8',
   one:'一句话：把数变成眼睛能比的位置、长度、颜色', book:'鸢尾花书 Book2 可视之美：布局/色彩/二维/三维/统计图'},
  {id:'da', name:'数据', en:'Data', color:'#FFC46B',
   one:'一句话：表=行是样本、列是特征，所有操作是对行或对列', book:'鸢尾花书 Book6 数据有道：pandas/清洗/合并/分组/缩放/划分'}
],
nodes:[
/* ================= py ================= */
{ id:'py.list_dict', dom:'py', title:'列表与字典', en:'list & dict',
  gut:'列表按位置找，字典按名字找',
  see:'列表=一排编号的抽屉；字典=贴了标签的抽屉',
  why:'第一性：找东西只有两种方式：按序号（数组，下标 O(1)）或按键（哈希，key O(1)）。手里拿的是位置就用列表，是名字就用字典。',
  formula:'xs[2] 按下标   d["gene"] 按键',
  trap:'d["x"] 键不存在直接 KeyError，用 d.get("x", 默认值)。列表 xs[-1] 是最后一个，不是报错。',
  anim:'py_list_dict', bridge:['di.big_o'], links:['py.loop_comprehension','py.bigo','py.string','py.mutable'],
  book:'Book1 ch4 容器',
  drills:[
    {q:'xs=[3,1,4,1,5]; xs[-2] 是?', a:'1', how:'-1 是 5，再往前一个是 1'},
    {q:'d={"a":1,"b":2}; d.get("c",0) 返回?', a:'0', how:'键不存在→给默认值，不报错'},
    {q:'统计每个基因出现次数，用列表还是字典?', a:'字典 {gene: count}', how:'按名字查+累加，字典 O(1)'},
    {q:'xs=[1,2,3]; xs.append([4,5]); len(xs)?', a:'4', how:'append 把整个列表当一个元素塞进去；要展开用 extend'}
  ], gen:'' },

{ id:'py.loop_comprehension', dom:'py', title:'循环与推导式', en:'loop & comprehension',
  gut:'推导式=一行把 for 折进方括号',
  see:'传送带：每个元素过一遍变换，合格的掉进新篮子',
  why:'第一性：循环=对每个元素做同一件事。推导式只是按读法顺序把"做什么 for 谁 if 条件"写在一行，完全等价于 for + append。',
  formula:'[f(x) for x in xs if c(x)]  ≡  for x in xs: if c(x): out.append(f(x))',
  trap:'两层 [.. for i in A for j in B]：外层在前、内层在后，和 for 缩进顺序一致。写反了得到的是转置的组合。',
  anim:'py_loop_comprehension', bridge:['co.perm_comb'], links:['py.list_dict','np.vectorize','py.function'],
  book:'Book1 ch5 循环 / ch6 推导式',
  drills:[
    {q:'[x*x for x in range(4)] 输出?', a:'[0, 1, 4, 9]', how:'range(4) 是 0..3'},
    {q:'[x for x in range(10) if x%3==0] 输出?', a:'[0, 3, 6, 9]', how:'0..9 里被 3 整除的'},
    {q:'[(i,j) for i in range(2) for j in range(3)] 有几个元素?', a:'6', how:'2×3 笛卡尔积'},
    {q:'{k: len(k) for k in ["ab","cde"]} 输出?', a:'{"ab": 2, "cde": 3}', how:'字典推导：键→值'}
  ], gen:'g_list_comp' },

{ id:'py.function', dom:'py', title:'函数', en:'function',
  gut:'函数=装箱：输入进，输出出，里面不外泄',
  see:'黑盒机器：漏斗进参数，出口吐 return',
  why:'第一性：重复出现的步骤起个名字。参数是入口，return 是唯一出口；没写 return 就吐 None。局部变量在箱子里，函数结束即销毁。',
  formula:'def f(x, k=2): return x**k   # f(3)=9, f(3,3)=27',
  trap:'默认参数是可变对象 def f(xs=[]) 会在多次调用间共享！用 xs=None 再在函数内 xs=[]。',
  anim:'py_function', bridge:['al.function_zoo'], links:['py.recursion','py.class','py.debug','py.mutable'],
  book:'Book1 ch7 函数',
  drills:[
    {q:'def f(x): x*2 ；f(3) 返回?', a:'None', how:'没写 return'},
    {q:'def f(a,b=10): return a+b ；f(1) 和 f(1,2)?', a:'11 和 3', how:'默认参数只在没传时生效'},
    {q:'def g(x): x=x+1 ；y=5; g(y); y 是?', a:'5', how:'x 是局部名字，整数不可变'},
    {q:'def h(xs): xs.append(1) ；a=[]; h(a); a?', a:'[1]', how:'列表可变，函数内原地修改外面可见'}
  ], gen:'' },

{ id:'py.recursion', dom:'py', title:'递归', en:'recursion',
  gut:'递归=缩小一号再调自己，底部必须停',
  see:'俄罗斯套娃：一层层打开到最小那个，再一层层合上带答案回来',
  why:'第一性：大问题=小一号的同型问题+一步。两件事：递推关系（怎么缩小）、基准情形（何时停）。没基准=无限套娃=RecursionError。',
  formula:'fact(n) = n*fact(n-1);  fact(0) = 1',
  trap:'朴素 fib(n) 调用次数指数级 O(2^n)，n=40 就卡死。加 @lru_cache 或改循环变 O(n)。Python 默认递归深度 1000。',
  anim:'py_recursion', bridge:['co.recursion','di.induction','co.perm_comb'], links:['py.function','py.bigo'],
  book:'Book1 ch7 函数与递归',
  drills:[
    {q:'fact(4)（fact(0)=1 为底）共做几次乘法?', a:'4 次', how:'4·fact(3), 3·fact(2), 2·fact(1), 1·fact(0)'},
    {q:'def f(n): return 0 if n==0 else n+f(n-1) ；f(5)?', a:'15', how:'5+4+3+2+1+0'},
    {q:'朴素递归 fib(5)（fib(0),fib(1) 为底）fib 函数共被调用几次?', a:'15 次', how:'T(n)=1+T(n-1)+T(n-2), T(0)=T(1)=1 → 1,1,3,5,9,15'},
    {q:'def f(n): return f(n-1) ；缺了什么?', a:'基准情形', how:'永不停止 → RecursionError'}
  ], gen:'g_recursion_seq' },

{ id:'py.class', dom:'py', title:'类与对象', en:'class & object',
  gut:'类=模板，对象=实例，self=我这一份',
  see:'细胞系冻存管：类是 protocol，每支管是一个对象，各自有自己的传代数',
  why:'第一性：数据和操作它的函数天然一起（样本有浓度，也有稀释方法）。类把两者绑定；self.x 是这个实例自己的数据，方法是绑在实例上的函数。',
  formula:'class Sample:\n  def __init__(self, conc): self.conc = conc\n  def dilute(self, k): self.conc /= k',
  trap:'写在 class 体里的列表是类变量，所有实例共享；每个实例独有的必须写在 __init__ 里 self.xxx = ...',
  anim:'py_class', bridge:[], links:['py.function','py.mutable','da.dataframe'],
  book:'Book1 ch8 类与对象',
  drills:[
    {q:'s=Sample(10); s.dilute(2); s.conc?', a:'5.0', how:'/= 原地改 self.conc'},
    {q:'a=Sample(1); b=Sample(2); a.conc+b.conc?', a:'3', how:'两个实例各有自己的 conc'},
    {q:'class C: xs=[] ；a=C(); b=C(); a.xs.append(1); b.xs?', a:'[1]', how:'类变量共享'},
    {q:'调用 s.dilute(2) 时 self 是谁?', a:'s 本身', how:'Python 自动把 s 塞进第一个参数'}
  ], gen:'' },

{ id:'py.bigo', dom:'py', title:'复杂度 Big-O', en:'Big-O',
  gut:'数嵌套层：一层 n，两层 n²，对半砍 log n',
  see:'n 从 1000 到 100 万：O(n) 多等 1000 倍，O(n²) 多等 100 万倍，O(log n) 几乎没感觉',
  why:'第一性：耗时随数据量怎么长。只看增长最快的项，常数丢掉。in 列表 O(n)，in 字典/集合 O(1)，排序 O(n log n)。',
  formula:'for i in n: for j in n: → O(n²)   |   while n>1: n//=2 → O(log n)',
  trap:'for x in A: if x in B —— 两个 O(n) 套一起是 O(n²)。把 B 变成 set 就是 O(n)。',
  anim:'py_bigo', bridge:['ns.magnitude','di.big_o','ns.log_scale'], links:['py.list_dict','py.recursion','np.vectorize'],
  book:'Book1 ch5 循环',
  drills:[
    {q:'for i in range(n): for j in range(i): 复杂度?', a:'O(n²)', how:'1+2+…+n = n(n+1)/2'},
    {q:'n=10^6，O(n²) 每步 1 ns 要多久?', a:'10^12 ns ≈ 1000 秒 ≈ 17 分钟', how:'(10^6)² = 10^12'},
    {q:'二分查找 n=10^6 最多几次比较?', a:'20 次', how:'log2(10^6) ≈ 19.9'},
    {q:'在 10^5 元素的 list 里 in 查 10^5 次，vs 换成 set?', a:'10^10 vs 10^5 次操作', how:'list in 是 O(n)，set in 是 O(1)'}
  ], gen:'g_bigo' },

{ id:'py.string', dom:'py', title:'字符串', en:'string',
  gut:'字符串=不可变的字符列表，切片同列表',
  see:'一条 DNA 序列 ATGC…：切片=限制酶，find=探针，count=计数',
  why:'第一性：文本就是字符序列。下标、切片、len、in 全适用；不可变意味着每次"修改"都产生新串。split/join 是字符串和列表之间的桥。',
  formula:'s="ATGCATG"; s[1:4]="TGC"; s.count("ATG")=2; s[::-1]="GTACGTA"',
  trap:'s[0]="C" 报错（不可变）。大量拼接用 "".join(list)，别在循环里 +=（O(n²)）。',
  anim:'py_string', bridge:['di.bits'], links:['py.list_dict','py.slice','bm.sequence'],
  book:'Book1 ch3 字符串',
  drills:[
    {q:'s="ATGCATG"; s[-3:]?', a:'"ATG"', how:'倒数 3 个'},
    {q:'"a,b,c".split(",")?', a:'["a","b","c"]', how:'按逗号切成列表'},
    {q:'"-".join(["x","y"])?', a:'"x-y"', how:'列表→用 - 粘起来'},
    {q:'s="GATTACA"; s.count("A")?', a:'3', how:'位置 1,4,6'}
  ], gen:'' },

{ id:'py.debug', dom:'py', title:'报错与调试', en:'debug',
  gut:'先读 Traceback 最后一行，再找你自己文件的行号',
  see:'错误栈=倒着的呼叫链：底部是爆炸点，往上是谁叫的谁',
  why:'第一性：程序在某一行状态不对。错误类型说"什么不对"（Index/Key/Type/Name/Value），行号说"哪里"。print(type(x), x.shape) 是最快的显微镜。',
  formula:'IndexError 越界 | KeyError 键没有 | TypeError 类型混用 | NameError 没定义 | ValueError 值/shape 不合法',
  trap:'沉默 bug 最危险：不报错但结果错（广播错、切片少一位、= 写成 ==）。写小 assert 检查 shape 和范围。',
  anim:'py_debug', bridge:['di.logic'], links:['py.function','np.array_shape','np.broadcast'],
  book:'Book1 ch9 异常处理',
  drills:[
    {q:'xs=[1,2]; xs[2] 报什么?', a:'IndexError', how:'下标最大 1'},
    {q:'"3"+4 报什么?', a:'TypeError', how:'str 和 int 不能加；int("3")+4'},
    {q:'d={}; d["x"] 报什么?', a:'KeyError', how:'键不存在'},
    {q:'np.zeros((3,2)) @ np.zeros((3,2)) 报什么?', a:'ValueError（shapes not aligned）', how:'内维 2≠3'}
  ], gen:'' },

{ id:'py.slice', dom:'py', title:'切片', en:'slice',
  gut:'[a:b:c] 含头不含尾，步长 c，负数从尾数',
  see:'尺子的刻度：切片切在刻度之间不是格子上，所以 b-a 就是长度',
  why:'第一性：下标指的是元素之间的缝隙（0 在最左）。含头不含尾让 len=b-a，且 xs[:k]+xs[k:] 无缝拼回。',
  formula:'xs=[0,1,2,3,4,5]; xs[1:4]=[1,2,3]; xs[::2]=[0,2,4]; xs[::-1] 反转',
  trap:'越界切片不报错，静默截断：xs[10:]==[]。numpy 里 a[1:2] 保留维度，a[1] 降一维。',
  anim:'py_string', bridge:[], links:['py.string','py.list_dict','np.array_shape'],
  book:'Book1 ch4 容器',
  drills:[
    {q:'xs=[0,1,2,3,4,5]; xs[-3:]?', a:'[3, 4, 5]', how:'倒数 3 个到末尾'},
    {q:'xs[1:5:2]?', a:'[1, 3]', how:'1,3（5 不含）'},
    {q:'xs[5:1:-1]?', a:'[5, 4, 3, 2]', how:'倒着走，到 1 停（不含）'},
    {q:'len(xs[2:100])?', a:'4', how:'截断到末尾 [2,3,4,5]'}
  ], gen:'g_slice' },

{ id:'py.mutable', dom:'py', title:'可变与引用', en:'mutable & reference',
  gut:'b=a 不是复制，是两个名字贴同一个东西',
  see:'两根绳子拴同一头牛：拉哪根牛都动。想要第二头牛得 copy',
  why:'第一性：变量是标签不是盒子。列表/字典/数组可变，改的是那个对象，所有标签都看到；整数/字符串/元组不可变，"修改"其实是换标签指向新对象。',
  formula:'a=[1]; b=a; b.append(2); a→[1,2]   |   b=a.copy() 才独立',
  trap:'numpy 切片是视图：v=a[:3]; v[0]=99 会改 a。要独立用 a[:3].copy()。pandas 链式赋值同理。',
  anim:'py_list_dict', bridge:[], links:['py.list_dict','py.function','np.reshape','np.mask'],
  book:'Book1 ch4 容器',
  drills:[
    {q:'a=[1,2]; b=a; b+=[3]; a?', a:'[1, 2, 3]', how:'+= 对列表原地修改'},
    {q:'a=(1,2); b=a; b+=(3,); a?', a:'(1, 2)', how:'元组不可变，b 换成新对象'},
    {q:'x=5; y=x; y+=1; x?', a:'5', how:'整数不可变'},
    {q:'a=np.arange(5); v=a[1:3]; v[:]=0; a?', a:'[0, 0, 0, 3, 4]', how:'切片是视图，改 v 就是改 a'}
  ], gen:'' },

/* ================= np ================= */
{ id:'np.array_shape', dom:'np', title:'数组与 shape', en:'array & shape',
  gut:'先问 shape；元组几个数就是几维',
  see:'(样本数, 特征数)=一张表；(批, 高, 宽, 通道)=一沓照片',
  why:'第一性：张量=同类型数字按网格排。shape 说每个方向多长；ndim=len(shape)；size=全乘起来。一切运算合法性先看 shape。',
  formula:'a=np.zeros((32,64,3)); a.ndim=3; a.size=6144; a.shape[0]=32',
  trap:'(5,) (5,1) (1,5) 是三种东西：一维向量、列向量、行向量。广播时行为完全不同。',
  anim:'np_array_shape', bridge:['ge.vector','la.matrix_transform'], links:['np.reshape','np.broadcast','np.axis'],
  book:'Book1 ch13 NumPy 数组',
  drills:[
    {q:'np.ones((4,3,2)).size?', a:'24', how:'4×3×2'},
    {q:'[[1,2,3],[4,5,6]] 的 shape?', a:'(2, 3)', how:'2 行 3 列'},
    {q:'x.shape=(100,); x[:,None].shape?', a:'(100, 1)', how:'None 加一根长度 1 的轴'},
    {q:'np.arange(12).shape 和 ndim?', a:'(12,) 和 1', how:'一维 12 个元素'}
  ], gen:'' },

{ id:'np.broadcast', dom:'np', title:'广播', en:'broadcasting',
  gut:'右对齐比 shape：相等或有 1 才配，1 被拉伸',
  see:'一列小数字被"复印"铺满整个大矩阵，再逐格相加',
  why:'第一性：逐元素运算要求 shape 相同。广播=把长度 1 的轴虚拟复制到对方长度。规则一条：从右往左对齐，每位要么相等、要么一方是 1、要么缺失（当 1）。',
  formula:'(3,1)+(1,4)→(3,4)   (5,3)+(3,)→(5,3)   (5,3)+(5,)→报错',
  trap:'(5,3) 想按行去均值：mean(axis=1) 是 (5,) 配不上，要 keepdims=True 变 (5,1)。',
  anim:'np_broadcast', bridge:['la.matrix_transform'], links:['np.array_shape','np.axis','da.normalize'],
  book:'Book1 ch14 广播',
  drills:[
    {q:'(4,1)+(3,) 结果 shape?', a:'(4, 3)', how:'右对齐：1↔3 拉伸，4↔缺失'},
    {q:'(2,3,4)*(3,1) 结果 shape?', a:'(2, 3, 4)', how:'(3,1)↔(3,4) 拉伸 1→4；前面缺失当 1→2'},
    {q:'(5,3)+(5,) 能广播吗?', a:'不能', how:'右对齐 3 vs 5，不等且都不是 1'},
    {q:'(8,1,6,1)+(7,1,5) 结果 shape?', a:'(8, 7, 6, 5)', how:'每位取非 1 那个'}
  ], gen:'g_broadcast_shape' },

{ id:'np.dot', dom:'np', title:'点积与矩阵乘', en:'dot & matmul',
  gut:'@ 看内维：(m,k)@(k,n)→(m,n)，k 必须相等',
  see:'左矩阵每一行 × 右矩阵每一列：两根箭头方向越像，数越大',
  why:'第一性：点积=对应位相乘再相加=两向量方向一致度（投影）。矩阵乘=一堆点积排成表：结果 [i,j] 是左第 i 行·右第 j 列。',
  formula:'a·b = Σaᵢbᵢ = |a||b|cosθ   |   (m,k)@(k,n) = (m,n)',
  trap:'* 是逐元素乘（走广播），@ 才是矩阵乘。(3,)@(3,) 是标量；(3,1)@(1,3) 是 (3,3) 外积。',
  anim:'np_dot', bridge:['ge.dot_projection','la.matrix_transform','la.projection'], links:['np.broadcast','np.array_shape','np.linalg','ml.linear_reg'],
  book:'Book1 ch16 线性代数',
  drills:[
    {q:'np.dot([1,2,3],[4,5,6])?', a:'32', how:'4+10+18'},
    {q:'(64,784)@(784,10) 结果 shape?', a:'(64, 10)', how:'内维 784 消掉'},
    {q:'(3,4)@(3,4) 会怎样?', a:'报错', how:'内维 4≠3；要 (3,4)@(4,3)→(3,3)'},
    {q:'a=[1,0], b=[0,1]; a·b?', a:'0', how:'垂直=无投影'}
  ], gen:'g_dot_shape' },

{ id:'np.reshape', dom:'np', title:'reshape 与转置', en:'reshape & transpose',
  gut:'reshape 只换读法不动数据；-1 让它自己算',
  see:'同一条珠子串，重新按每行 4 颗盘起来；转置是把盘好的翻个面',
  why:'第一性：内存里永远是一条线（行优先）。reshape 只改"每行几个"的解释；.T 交换轴才真正改变读取顺序。size 必须能整除。',
  formula:'np.arange(12).reshape(3,4)   .reshape(-1,2)→(6,2)   (3,4).T→(4,3)',
  trap:'reshape 不是转置！(3,4).reshape(4,3) 把行拆碎重排，(3,4).T 才是行列互换。图像 (H,W,C)→(C,H,W) 要 transpose(2,0,1)。',
  anim:'np_reshape', bridge:['la.matrix_transform'], links:['np.array_shape','np.axis','py.mutable','dl.cnn'],
  book:'Book1 ch13 NumPy 数组',
  drills:[
    {q:'np.arange(6).reshape(2,3)[1,0]?', a:'3', how:'第二行 [3,4,5] 的首个'},
    {q:'(2,3,4).reshape(-1) 的 shape?', a:'(24,)', how:'全拉平'},
    {q:'(10,28,28).reshape(10,-1) 的 shape?', a:'(10, 784)', how:'28×28=784'},
    {q:'np.arange(6).reshape(2,3).T[0]?', a:'[0, 3]', how:'转置后第一行=原第一列'}
  ], gen:'g_reshape' },

{ id:'np.axis', dom:'np', title:'axis 归约', en:'axis reduction',
  gut:'axis=k 就是压掉第 k 维，结果少那一位',
  see:'(行,列) 表：axis=0 竖着压成一行（每列一个数），axis=1 横着压成一列',
  why:'第一性：sum/mean/max 沿某轴做，就是让那个轴消失。记法：axis 是"被吃掉的轴"，不是"走的方向"。keepdims=True 留长度 1 好广播回去。',
  formula:'(5,3).sum(axis=0)→(3,)   (5,3).mean(axis=1)→(5,)   keepdims→(5,1)',
  trap:'"按列求均值"=axis=0（吃掉行），直觉常反。(N,H,W,C) 求每通道均值 axis=(0,1,2)。',
  anim:'np_axis', bridge:['pr.expectation'], links:['np.broadcast','np.array_shape','da.groupby'],
  book:'Book1 ch14 广播与聚合',
  drills:[
    {q:'[[1,2],[3,4]].sum(axis=0)?', a:'[4, 6]', how:'竖着加'},
    {q:'[[1,2],[3,4]].sum(axis=1)?', a:'[3, 7]', how:'横着加'},
    {q:'(32,10,64).mean(axis=1) 的 shape?', a:'(32, 64)', how:'第 1 维消失'},
    {q:'(4,5).argmax(axis=1) 返回 shape 和含义?', a:'(4,)；每行最大值的列下标', how:'吃掉列轴，每行剩一个位置'}
  ], gen:'g_axis_sum' },

{ id:'np.overflow', dom:'np', title:'dtype 与溢出', en:'dtype & overflow',
  gut:'uint8 到 255 加 1 归零；float 大数吃小数',
  see:'里程表跑到 255 归零；浮点是越远刻度越稀疏的尺子',
  why:'第一性：每个数占固定 bit。int8=256 个格子，超出绕回（模运算）。float32 只有 24 bit 精度，1e8+1==1e8。图像 uint8 相加前先 astype(float)。',
  formula:'np.uint8(250)+np.uint8(10)=4   |   np.float32(1e8)+1=1e8   |   np.exp(1000)=inf',
  trap:'显微图像 uint8 做 (a+b)/2 会先溢出再除。softmax 直接 exp(x) 会 inf：先减 max。',
  anim:'np_overflow', bridge:['ns.log_scale','di.bits','ns.magnitude'], links:['np.array_shape','dl.activation','ml.logistic'],
  book:'Book1 ch13 数据类型',
  drills:[
    {q:'np.int8(127)+np.int8(1)?', a:'-128', how:'8 bit 有符号绕回'},
    {q:'np.uint8(200)+np.uint8(100)?', a:'44', how:'300-256'},
    {q:'np.array([1,2,3]).dtype 和 np.array([1.,2,3]).dtype?', a:'int64 和 float64', how:'有一个小数点整列升 float'},
    {q:'float32 能精确存 16777217 吗?', a:'不能', how:'2^24+1 超 24 bit 尾数，变 16777216'}
  ], gen:'g_dtype_overflow' },

{ id:'np.random', dom:'np', title:'随机与种子', en:'random & seed',
  gut:'seed 才可复现；样本均值抖动 ∝ 1/√n',
  see:'掷 1 万次骰子画直方图：平；每 30 次的平均画直方图：钟形',
  why:'第一性：伪随机=确定性序列，seed 是起点。样本均值的标准差=σ/√n（中心极限定理）：误差减半，样本要 4 倍。',
  formula:'rng=np.random.default_rng(0); rng.normal(0,1,(100,3)); rng.choice(n,k,replace=False)',
  trap:'integers 高端不含。shuffle 原地改，permutation 返回新的。划分训练/测试要固定 seed 否则每次不同。',
  anim:'np_random', bridge:['pr.clt','pr.distribution','pr.variance'], links:['da.split','vz.hist','np.axis'],
  book:'Book1 ch15 随机数',
  drills:[
    {q:'rng.integers(0,10,5) 可能出现 10 吗?', a:'不能', how:'高端不含'},
    {q:'总体 σ=4，n=16 的样本均值标准差?', a:'1', how:'4/√16'},
    {q:'样本均值误差从 2 降到 0.5，样本量乘几?', a:'16 倍', how:'误差∝1/√n，缩 4 倍→n 乘 16'},
    {q:'rng.normal(5,2,(1000,)).mean() 大约?', a:'5（±0.06 左右）', how:'2/√1000≈0.063'}
  ], gen:'g_prob_basic' },

{ id:'np.vectorize', dom:'np', title:'向量化', en:'vectorize',
  gut:'逐元素 for 改整数组一次算，快百倍',
  see:'一次搬 1000 块砖的叉车 vs 一次一块的手',
  why:'第一性：Python for 每步都解释一遍；numpy 把循环下沉到 C 一次跑完。算术、比较、np 函数天然逐元素；条件用布尔掩码或 np.where。',
  formula:'for i: y[i]=x[i]**2 → y=x**2   |   if x>0: → np.where(x>0, x, 0)',
  trap:'np.vectorize 只是语法糖，不加速。列表 [1,2]*2 是重复，np.array([1,2])*2 是逐元素。',
  anim:'np_vectorize', bridge:['la.matrix_transform'], links:['np.broadcast','np.mask','py.loop_comprehension','py.bigo'],
  book:'Book1 ch14 向量化运算',
  drills:[
    {q:'x=np.array([-1,2,-3]); np.where(x>0,x,0)?', a:'[0, 2, 0]', how:'正的留，负的换 0'},
    {q:'x=np.array([1,2,3,4]); x[x%2==0]?', a:'[2, 4]', how:'布尔掩码筛偶数'},
    {q:'np.array([1,2,3])*2 和 [1,2,3]*2?', a:'[2,4,6] 和 [1,2,3,1,2,3]', how:'数组逐元素，列表重复'},
    {q:'(x>0).sum() 算的是?', a:'正数个数', how:'True 当 1'}
  ], gen:'' },

{ id:'np.mask', dom:'np', title:'布尔掩码与花式索引', en:'mask & fancy index',
  gut:'布尔数组当下标=筛；整数数组当下标=按序挑',
  see:'流式门控：画一个门，掩码 True 的细胞留下',
  why:'第一性：索引=告诉数组要哪些位置。布尔掩码长度必须等于被索引轴；整数列表可重复可乱序。两者都返回副本，不同于切片视图。',
  formula:'a[a>2]   a[[0,2,2]]   a[mask, :]   a[np.argsort(a)]',
  trap:'两个条件用 & | 并加括号 a[(a>1)&(a<5)]，写 and 报错。a[mask]=0 原地改 a。',
  anim:'np_vectorize', bridge:['di.logic'], links:['np.vectorize','da.clean','py.slice'],
  book:'Book1 ch13 索引',
  drills:[
    {q:'a=np.array([5,1,4]); a[[2,0]]?', a:'[4, 5]', how:'按顺序挑位置 2、0'},
    {q:'a=np.array([5,1,4]); a[a>2]?', a:'[5, 4]', how:'掩码 [T,F,T]'},
    {q:'a=np.arange(6).reshape(2,3); a[[True,False]].shape?', a:'(1, 3)', how:'只留第一行，维度保留'},
    {q:'a=np.array([3,1,2]); a[np.argsort(a)]?', a:'[1, 2, 3]', how:'argsort 给排序后的下标'}
  ], gen:'' },

{ id:'np.linalg', dom:'np', title:'常用线代调用', en:'np.linalg',
  gut:'solve 代替 inv；norm 长度；eig 方向+缩放',
  see:'矩阵是一台变形机：eig 找不变方向，svd 找最有信息的方向',
  why:'第一性：Ax=b 是"哪个 x 被变成 b"，solve 直接分解求，比 inv 再乘更稳更快。norm 默认 L2。eig 返回 (特征值数组, 特征向量按列排)。',
  formula:'np.linalg.solve(A,b)  np.linalg.norm(v)  w,V=np.linalg.eig(A)  U,s,Vt=np.linalg.svd(X)',
  trap:'特征向量是 V 的列不是行：V[:,0] 对应 w[0]。svd 返回的 Vt 已经转置。对称阵（协方差）用 eigh。',
  anim:'np_dot', bridge:['la.eigen','la.svd','la.inverse'], links:['np.dot','ml.pca'],
  book:'Book1 ch16 线性代数',
  drills:[
    {q:'np.linalg.norm([3,4])?', a:'5', how:'√(9+16)'},
    {q:'A=[[2,0],[0,3]] 的特征值?', a:'2 和 3', how:'对角阵特征值=对角元'},
    {q:'解 [[2,0],[0,4]] x = [2,8]，x?', a:'[1, 2]', how:'2x₁=2, 4x₂=8'},
    {q:'X 是 (100,5)，svd(full_matrices=False) 后 U,s,Vt 的 shape?', a:'(100,5), (5,), (5,5)', how:'秩最多 5'}
  ], gen:'g_eigen2' },

/* ================= vz ================= */
{ id:'vz.scatter', dom:'vz', title:'散点图', en:'scatter',
  gut:'两个连续量先画散点；颜色/大小是第 3、4 维',
  see:'一团点：斜着拉长=相关，圆团=无关，两团=有类别在藏着',
  why:'第一性：每个样本是平面一个位置，位置最准确地传达数量。看形状（线性/弯曲）、看离散（噪声）、看群（聚类）、看孤点（异常）。',
  formula:'plt.scatter(x, y, c=label, s=20, alpha=.6)   sns.scatterplot(data=df, x="a", y="b", hue="cls")',
  trap:'点太多叠成一坨：加 alpha、缩小 s、或改 hexbin。相关≠因果，先查混杂变量。',
  anim:'vz_scatter', bridge:['pr.covariance','ge.vector'], links:['vz.color','vz.line','ml.linear_reg'],
  book:'Book2 ch10 散点图',
  drills:[
    {q:'x 增 y 减、点很紧，相关系数大约?', a:'接近 -1', how:'方向负、离散小'},
    {q:'1000 个点堆成黑团，改什么?', a:'alpha=0.2 或 hexbin', how:'透明度显密度'},
    {q:'同时显示细胞类型和表达量，怎么编码?', a:'c=类型（颜色），s=表达量（大小）', how:'类别→色相，数量→大小'},
    {q:'散点呈 U 形，皮尔逊 r 大约?', a:'接近 0', how:'线性相关抓不到非线性'}
  ], gen:'' },

{ id:'vz.line', dom:'vz', title:'折线与函数图', en:'line plot',
  gut:'横轴有顺序才用折线；先 linspace 再算 y',
  see:'从左到右读故事：训练 loss 该下坡，x² 是碗，e^x 是墙',
  why:'第一性：折线连接相邻点，隐含"中间是连续的"。画函数=密采样 linspace + 逐点算 + 连线。多条线对比要同一坐标系。',
  formula:'x=np.linspace(-3,3,200); plt.plot(x, np.exp(x), label="e^x"); plt.legend()',
  trap:'类别之间（对照/药A/药B）连线没意义，用柱或点。采样太稀曲线变折线段：至少 100 点。',
  anim:'vz_line', bridge:['al.function_zoo','ca.derivative_slope'], links:['vz.scatter','vz.subplot','vz.log_axis','ml.gradient_descent'],
  book:'Book2 ch6 线图',
  drills:[
    {q:'np.linspace(0,1,5) 输出?', a:'[0, 0.25, 0.5, 0.75, 1]', how:'含两端，5 个点 4 段'},
    {q:'训练/验证 loss 两条线，验证线开始上翘说明?', a:'过拟合开始', how:'训练继续降，验证反升'},
    {q:'用 linspace(0,2π,5) 画 sin 会怎样?', a:'5 个点连成折线，不像正弦', how:'加密到 200'},
    {q:'x 轴是 3 个药物名，该用折线吗?', a:'不该', how:'无顺序，用柱状/箱线'}
  ], gen:'' },

{ id:'vz.heatmap', dom:'vz', title:'热图', en:'heatmap',
  gut:'矩阵直接变色块；先看 colorbar 范围和 0 在哪',
  see:'基因×样本表达矩阵：行列聚类后出现色块=共表达模块',
  why:'第一性：把 2D 数组每个数映射到一个颜色。相关矩阵、混淆矩阵、注意力权重都是矩阵。有正负用发散色（0=白），只正用顺序色。',
  formula:'plt.imshow(M, cmap="RdBu_r", vmin=-1, vmax=1); plt.colorbar()   sns.heatmap(df.corr(), annot=True)',
  trap:'imshow 原点默认左上、行向下，与数学坐标反；origin="lower" 翻回。不设 vmin/vmax 每张图色标不同无法对比。',
  anim:'vz_heatmap', bridge:['pr.covariance','la.matrix_transform'], links:['vz.color','ml.metrics','dl.attention'],
  book:'Book2 ch12 热图',
  drills:[
    {q:'相关矩阵热图选什么 cmap?', a:'发散 RdBu_r，vmin=-1, vmax=1', how:'0 对中性色'},
    {q:'(3,3) 混淆矩阵热图对角线亮说明?', a:'分类正确多', how:'对角=预测等于真值'},
    {q:'imshow 一个 (100,200) 数组，图是宽还是高?', a:'宽', how:'100 行 200 列'},
    {q:'两张热图要对比，必须统一什么?', a:'vmin/vmax', how:'同一把颜色尺'}
  ], gen:'' },

{ id:'vz.contour', dom:'vz', title:'等高线', en:'contour',
  gut:'z=f(x,y) 压到平面：线密=陡，圈心=极值',
  see:'登山地图：梯度下降就是垂直等高线往圈心走',
  why:'第一性：三维曲面用"同高连线"压成二维。需要网格：meshgrid 生成所有 (x,y) 组合再算 z。线越密梯度越大；梯度永远垂直等高线。',
  formula:'X,Y=np.meshgrid(x,y); Z=f(X,Y); plt.contour(X,Y,Z,levels=20); plt.contourf(...)',
  trap:'meshgrid 默认 X.shape=(len(y),len(x))，行对应 y。损失等高线细长椭圆=特征尺度不一致=要标准化。',
  anim:'vz_contour', bridge:['ca.gradient','ca.optimization'], links:['vz.3d','ml.gradient_descent','da.normalize'],
  book:'Book2 ch14 等高线',
  drills:[
    {q:'x 有 50 点 y 有 30 点，meshgrid 后 X.shape?', a:'(30, 50)', how:'行=y，列=x'},
    {q:'z=x²+y² 的等高线什么形状?', a:'同心圆', how:'等距离点集'},
    {q:'某处等高线很密，梯度大小?', a:'大', how:'单位距离高度变化多'},
    {q:'z=x²+10y² 等高线什么形状，对 GD 有何影响?', a:'沿 x 拉长的椭圆；GD 在 y 方向震荡', how:'y 方向陡，步子容易过头'}
  ], gen:'' },

{ id:'vz.hist', dom:'vz', title:'直方图与分布', en:'histogram',
  gut:'一个变量看分布画直方图；bin 数会改形状',
  see:'数轴切成桶，每个数掉进一个桶，桶高=个数',
  why:'第一性：分布=数值在哪里堆得多。直方图是密度的粗估：bin 太宽抹平细节，太窄全是噪声。density=True 让面积=1 才能和 pdf 叠。',
  formula:'plt.hist(x, bins=30, density=True); sns.kdeplot(x)',
  trap:'两组对比要同 bins 且 alpha<1。长尾数据（表达量/浓度）先 log 再画。bins="auto" 比拍脑袋好。',
  anim:'vz_hist', bridge:['pr.distribution','pr.clt'], links:['np.random','vz.subplot','vz.log_axis','da.clean'],
  book:'Book2 ch8 直方图 / Book6 ch3',
  drills:[
    {q:'1000 个正态样本 bins=3 会看到什么?', a:'三根柱，钟形看不出来', how:'bin 太宽'},
    {q:'直方图右边一条长尾，怎么处理?', a:'log 变换', how:'倍数变距离'},
    {q:'density=True 后柱面积之和?', a:'1', how:'归一化成密度'},
    {q:'两组分布对比要注意?', a:'相同 bins 边界、alpha 透明，或改 KDE', how:'同尺才可比'}
  ], gen:'' },

{ id:'vz.3d', dom:'vz', title:'三维图', en:'3D plot',
  gut:'三维给直觉不给读数；能用等高线就别 3D',
  see:'曲面 z=f(x,y) 像一张布被撑起，view_init 换视角转着看',
  why:'第一性：屏幕是二维，第三维靠透视欺骗大脑，读数不准且遮挡。用途：看全局形状（碗/鞍/多峰）。数据同样来自 meshgrid。',
  formula:'ax=plt.axes(projection="3d"); ax.plot_surface(X,Y,Z,cmap="viridis"); ax.view_init(30,45)',
  trap:'3D 柱状图和 3D 饼图几乎永远是错的。超过 3 个特征别硬画 3D，先 PCA 降到 2D。',
  anim:'vz_3d', bridge:['ge.transform','ca.gradient'], links:['vz.contour','ml.pca','vz.color'],
  book:'Book2 ch15 三维图',
  drills:[
    {q:'z=x²-y² 曲面什么形状?', a:'马鞍', how:'一个方向凹一个方向凸'},
    {q:'4 维数据想画 3D 散点，先做什么?', a:'PCA 到 3 维或 2 维', how:'降维再看'},
    {q:'3D 图上两点哪个 z 更高看不清，怎么办?', a:'改热图/等高线读数', how:'2D 无遮挡'},
    {q:'view_init(elev=90, azim=0) 看到的是?', a:'俯视图，等价热图', how:'从正上往下看'}
  ], gen:'' },

{ id:'vz.color', dom:'vz', title:'颜色映射', en:'colormap',
  gut:'顺序用 viridis，正负用 RdBu，类别用 tab10',
  see:'颜色是第三根轴：亮度单调变化眼睛才能排大小；jet 亮度乱跳会骗人',
  why:'第一性：人眼对亮度差最敏感、对色相排序不敏感。顺序数据靠亮度单调；发散数据中点要中性色；类别用色相且不超过 8 类。色盲安全优先。',
  formula:'cmap="viridis"（顺序）  "RdBu_r"（发散，vmin=-v, vmax=v）  "tab10"（类别）',
  trap:'jet/rainbow 在中间产生假边界。发散色不设对称 vmin/vmax，0 就不在白色。红绿对比 8% 男性看不清。',
  anim:'vz_color', bridge:['ns.log_scale'], links:['vz.heatmap','vz.scatter','vz.3d'],
  book:'Book2 ch3 色彩',
  drills:[
    {q:'画 log2 fold change 用什么 cmap?', a:'发散 RdBu_r，vmin=-3, vmax=3 对称', how:'0 变化对白'},
    {q:'12 个细胞类型的散点，颜色怎么办?', a:'tab20，但 >8 类难辨，考虑分面', how:'色相可分辨数有限'},
    {q:'画温度 0-100°C 热图用什么?', a:'顺序色 viridis/magma', how:'只有大小没有正负'},
    {q:'为什么不用 jet?', a:'亮度不单调，出现假边界；色盲不友好', how:'眼睛按亮度排序'}
  ], gen:'' },

{ id:'vz.subplot', dom:'vz', title:'子图与分面', en:'subplot & facet',
  gut:'subplots 给 axes；画在 ax 上，不在 plt',
  see:'一面墙分成格子，每格一张图，共享坐标轴才好比',
  why:'第一性：多组放同一张图会乱，分开放又不好比。子图=同一画布多个坐标系；sharex/sharey 让尺度一致。ax 接口可控可复现。',
  formula:'fig,axes=plt.subplots(2,3,figsize=(12,6),sharey=True); axes[0,1].plot(x,y); fig.tight_layout()',
  trap:'subplots(1,3) 的 axes 是一维 (3,)；(2,3) 是二维；(1,1) 返回单个 ax 不是数组。axes.flat 统一处理。',
  anim:'vz_subplot', bridge:[], links:['vz.line','vz.hist','vz.annotate','da.groupby'],
  book:'Book2 ch2 图形布局',
  drills:[
    {q:'plt.subplots(2,3) 的 axes.shape?', a:'(2, 3)', how:'二维数组'},
    {q:'6 个基因各画一张直方图，怎么排?', a:'subplots(2,3, sharex=True)，zip(axes.flat, genes)', how:'flat 拉平遍历'},
    {q:'axes[1,2] 是第几行第几列?', a:'第 2 行第 3 列（0 起）', how:'下标从 0'},
    {q:'为什么用 ax.plot 不用 plt.plot?', a:'明确画到哪个子图', how:'plt 只画当前活动轴'}
  ], gen:'' },

{ id:'vz.log_axis', dom:'vz', title:'对数坐标', en:'log axis',
  gut:'跨数量级就 log 轴；log-log 直线=幂律',
  see:'1、10、100、1000 在 log 轴上等距；指数增长变直线',
  why:'第一性：线性轴上 1 和 1000 挤一起看不到 1 和 10 的差别。log 轴把"倍数"变成"距离"。semilogy：指数→直线；loglog：y=x^k→斜率 k 的直线。',
  formula:'ax.set_yscale("log")   plt.loglog(x,y)   剂量反应 x 轴 log10(浓度)',
  trap:'log 轴不能有 0 或负数（浓度 0 的对照要单独处理或用 symlog）。log 轴上误差棒不对称是正常的。',
  anim:'vz_line', bridge:['ns.log_scale','al.exp_log'], links:['vz.line','vz.hist','bm.dose_response'],
  book:'Book2 ch6 线图 / 坐标变换',
  drills:[
    {q:'y=2^x 在 semilogy 上是什么?', a:'直线，斜率 log10(2)≈0.30', how:'log y = x·log 2'},
    {q:'y=x³ 在 loglog 上斜率?', a:'3', how:'log y = 3 log x'},
    {q:'细胞数 10²→10⁸ 随时间，用什么轴?', a:'y 对数轴', how:'跨 6 个数量级'},
    {q:'浓度 0 的对照点 log 轴怎么画?', a:'单独标在最左或用 symlog', how:'log(0) 不存在'}
  ], gen:'g_log_scale' },

{ id:'vz.annotate', dom:'vz', title:'标注与整洁', en:'annotate & clean',
  gut:'一图一结论：标题说结论，标签带单位，去掉多余框线',
  see:'读者眼睛路径：标题→关键点标注→坐标轴；其余是噪声',
  why:'第一性：图是给人看的论证。每一滴墨都该传信息。必须有：轴标签+单位、图例、关键点 annotate；应去掉：上右边框、过密网格、3D 效果。',
  formula:'ax.set(xlabel="Dose (µM)", ylabel="Viability (%)", title="IC50 = 3.2 µM"); ax.annotate("IC50",(3.2,50),xytext=(6,70),arrowprops={})',
  trap:'savefig 要在 show() 之前，否则存空图。投稿 dpi=300；bbox_inches="tight" 防标签被裁。',
  anim:'vz_subplot', bridge:[], links:['vz.subplot','vz.line','vz.color'],
  book:'Book2 ch1-2 图形要素',
  drills:[
    {q:'标题写 "Figure 1" 还是 "Drug A halves viability at 10 µM"?', a:'后者', how:'标题说结论'},
    {q:'savefig 后图是空的，为什么?', a:'show() 之后才存', how:'savefig 放前面'},
    {q:'y 轴写 "Value" 够吗?', a:'不够', how:'要量名+单位'},
    {q:'去掉上、右边框的调用?', a:'ax.spines[["top","right"]].set_visible(False)', how:'减少非数据墨水'}
  ], gen:'' },

/* ================= da ================= */
{ id:'da.dataframe', dom:'da', title:'DataFrame 心智模型', en:'DataFrame',
  gut:'行=样本，列=特征；loc 按标签，iloc 按位置',
  see:'一张 Excel：列名是表头，index 是行号，一列一种 dtype',
  why:'第一性：DataFrame=带标签的二维数组+每列独立 dtype。df["col"] 拿列（Series），df.loc[行标签,列标签]，df.iloc[行号,列号]。新表先 shape/dtypes/head/describe。',
  formula:'df.shape→(n_rows, n_cols)   df.loc[df.age>30, ["id","age"]]   df.iloc[:5, 0]',
  trap:'df[0] 拿的是列名为 0 的列，不是第一行。loc[0:2] 含尾（标签），iloc[0:2] 不含尾（位置）。',
  anim:'da_dataframe', bridge:['la.matrix_transform'], links:['np.array_shape','da.groupby','da.clean','da.tidy','da.apply'],
  book:'Book6 ch2 pandas 基础',
  drills:[
    {q:'df 有 200 行 5 列，df.shape?', a:'(200, 5)', how:'(行, 列)'},
    {q:'取所有 age>30 的行的 name 列?', a:'df.loc[df.age>30, "name"]', how:'loc[行条件, 列名]'},
    {q:'df.iloc[0:3] 和 df.loc[0:3] 各几行（默认 index）?', a:'3 行和 4 行', how:'iloc 不含尾，loc 含尾'},
    {q:'df["conc"] 的类型?', a:'Series', how:'单列=一维带标签数组'}
  ], gen:'' },

{ id:'da.groupby', dom:'da', title:'分组聚合', en:'groupby',
  gut:'每个 X 的 Y=groupby(X)[Y]：拆、算、拼',
  see:'按细胞类型把表切成几摞，每摞算均值，再摞成一张小表',
  why:'第一性：split-apply-combine。题目里的"每个/按/分组"是 groupby 的键，"平均/最大/计数"是 agg。结果 index 是分组键；多键得 MultiIndex。',
  formula:'df.groupby("cell_type")["expr"].mean()   df.groupby(["drug","dose"]).agg(n=("id","count"), m=("y","mean"))',
  trap:'不指定列会对所有数值列聚合。transform 保持原行数（组内标准化用），agg 压缩行数。as_index=False 让键回到列。',
  anim:'da_groupby', bridge:['pr.expectation','co.perm_comb'], links:['da.dataframe','np.axis','da.merge','da.tidy'],
  book:'Book6 ch5 分组聚合',
  drills:[
    {q:'"每种药物的平均存活率"怎么写?', a:'df.groupby("drug")["viability"].mean()', how:'每个→键，平均→agg'},
    {q:'"每个病人每次访视的最大心率"?', a:'df.groupby(["patient","visit"])["hr"].max()', how:'两个"每"=两个键'},
    {q:'3 种药 × 4 个剂量分组后最多几行?', a:'12', how:'键组合数'},
    {q:'组内 z-score 用 agg 还是 transform?', a:'transform', how:'行数不变，每行减自己组的均值'}
  ], gen:'g_groupby' },

{ id:'da.merge', dom:'da', title:'表连接', en:'merge / join',
  gut:'两表靠共同键拼；inner 取交集，left 保左表全部',
  see:'病人表 + 化验表按 patient_id 对齐；没化验的病人 left 后化验列全 NaN',
  why:'第一性：不同实体分开存，用键关联。how 决定没配上的行去留；on 决定按什么配。合并前检查键是否唯一，否则行数膨胀。',
  formula:'pd.merge(a, b, on="id", how="inner"|"left"|"outer")   pd.concat([a,b], axis=0) 上下堆',
  trap:'一对多 merge 行数变多，多对多会爆炸。键 dtype 不同（int vs str）配不上得全 NaN 且不报错。',
  anim:'da_merge', bridge:['di.logic'], links:['da.dataframe','da.groupby','da.pipeline'],
  book:'Book6 ch4 数据合并',
  drills:[
    {q:'a 有 id 1,2,3；b 有 id 2,3,4；inner 后几行?', a:'2 行（2,3）', how:'交集'},
    {q:'同上 outer 后几行?', a:'4 行（1,2,3,4）', how:'并集'},
    {q:'a 有 100 个病人；b 每人 3 次化验（300 行）；a.merge(b, how="left") 后几行?', a:'300', how:'一对多，每个病人展开 3 行'},
    {q:'两张同结构表上下堆叠用?', a:'pd.concat([a,b], axis=0, ignore_index=True)', how:'axis=0 加行'}
  ], gen:'' },

{ id:'da.clean', dom:'da', title:'清洗与缺失', en:'clean & missing',
  gut:'先 isna().sum()，再问为什么缺，再决定删或填',
  see:'表上的洞：整列洞→删列；零星洞→填中位数；有规律的洞→它本身是信息',
  why:'第一性：缺失=没测/没记/不适用，原因不同处理不同。数值填中位数（抗离群），类别填众数或 unknown。异常值先画图再决定，别机械 3σ。',
  formula:'df.isna().sum()   df.dropna(subset=["y"])   df["x"].fillna(df["x"].median())   df.duplicated().sum()',
  trap:'用全表统计量 fillna 再划分=泄漏，填充值只能从训练集算。-999、0、"NA"、空串都可能是伪装的缺失。',
  anim:'da_clean', bridge:['pr.expectation'], links:['da.dataframe','da.leak','da.normalize','np.mask'],
  book:'Book6 ch3 数据清洗',
  drills:[
    {q:'某列 95% 缺失，怎么办?', a:'大概率删列，或只留"是否缺失"一位', how:'信息量太少'},
    {q:'标签 y 缺失的行怎么办?', a:'删行 dropna(subset=["y"])', how:'不能造标签'},
    {q:'浓度列出现 -1 但浓度不可能为负，是什么?', a:'伪装缺失', how:'replace(-1, np.nan)'},
    {q:'填充中位数应该从哪算?', a:'只从训练集', how:'再 apply 到测试集'}
  ], gen:'' },

{ id:'da.normalize', dom:'da', title:'标准化与缩放', en:'normalize / scale',
  gut:'尺度不同先缩放；scaler 只 fit 训练集',
  see:'身高(cm)和体重(kg)混算距离，cm 那维压倒一切；缩放后两维等权',
  why:'第一性：距离/梯度类模型（kNN、SVM、神经网络、PCA、正则回归）对尺度敏感，树模型不敏感。z-score 变均值 0 方差 1；min-max 压到 [0,1]；log 处理长尾。',
  formula:'z=(x-x.mean(axis=0))/x.std(axis=0)   scaler.fit(X_train); scaler.transform(X_test)',
  trap:'scaler.fit(X_all) 再划分=泄漏。one-hot 列不用缩放。有离群值 min-max 会被压扁，用 RobustScaler。',
  anim:'da_normalize', bridge:['pr.variance','pr.expectation'], links:['np.broadcast','np.axis','da.leak','ml.knn'],
  book:'Book6 ch6 特征缩放',
  drills:[
    {q:'x=[2,4,6]，z-score（总体 σ）后?', a:'[-1.22, 0, 1.22]', how:'μ=4, σ=√(8/3)=1.633'},
    {q:'X (100,5) 做 z-score，均值沿哪个 axis?', a:'axis=0', how:'每列一个均值 (5,)'},
    {q:'随机森林要标准化吗?', a:'不必要', how:'按阈值切分，与尺度无关'},
    {q:'min-max 把 [10,20,30] 变成?', a:'[0, 0.5, 1]', how:'(x-10)/20'}
  ], gen:'' },

{ id:'da.split', dom:'da', title:'训练/验证/测试划分', en:'train/val/test split',
  gut:'测试集只碰一次；调参用验证集；同一病人不跨集',
  see:'三个抽屉：训练（学）、验证（选）、测试（封条，最后打开一次）',
  why:'第一性：泛化=没见过的数据上的表现。测试集必须模拟"没见过"：分层保证类别比例，分组保证同病人/同批次不跨集，时间序列按时间切。',
  formula:'train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)   GroupKFold(groups=patient_id)',
  trap:'一个病人 10 张切片随机划分→同病人切片同时在训练和测试=作弊。类别 1:99 不分层，测试集可能没正例。',
  anim:'da_split', bridge:['pr.distribution','pr.clt'], links:['np.random','da.leak','ml.metrics'],
  book:'Book6 ch9 划分与交叉验证',
  drills:[
    {q:'1000 样本 test_size=0.2，训练几个?', a:'800', how:'1000×0.8'},
    {q:'50 病人各 20 张图，按什么划分?', a:'按病人 GroupKFold / GroupShuffleSplit', how:'组不跨集'},
    {q:'阳性率 2%，划分要加什么?', a:'stratify=y', how:'保证两边都有正例'},
    {q:'5 折交叉验证每折验证集占?', a:'20%', how:'每个样本恰好当 1 次验证'}
  ], gen:'g_split_leak' },

{ id:'da.pipeline', dom:'da', title:'Pipeline 与可复现', en:'pipeline',
  gut:'预处理+模型串成 Pipeline，一个 fit 不泄漏',
  see:'流水线：原始表→填缺→缩放→编码→模型，一个 fit 从头到尾',
  why:'第一性：每一步 fit 都学了训练集的统计量，手工分步很容易在划分前 fit。Pipeline 把步骤封成一个 estimator，交叉验证每折内部重新 fit 每一步。',
  formula:'pipe=make_pipeline(SimpleImputer(), StandardScaler(), LogisticRegression()); cross_val_score(pipe, X, y, cv=5)',
  trap:'Pipeline 外面先 scaler.fit_transform(X) 再传进去=白搭。类别列和数值列不同处理用 ColumnTransformer。',
  anim:'da_pipeline', bridge:[], links:['da.normalize','da.clean','da.split','da.leak'],
  book:'Book6 ch10 建模流程',
  drills:[
    {q:'填缺→缩放→逻辑回归，哪几步有 fit?', a:'三步都有', how:'学中位数、学 μσ、学权重'},
    {q:'pipe.fit(X_train,y_train); pipe.predict(X_test)，测试集会被 fit 吗?', a:'不会', how:'predict 只 transform'},
    {q:'数值列缩放、类别列 one-hot，用什么?', a:'ColumnTransformer', how:'按列分派不同步骤'},
    {q:'为什么 cross_val_score(pipe) 比手工先缩放再 cv 可靠?', a:'每折内重新 fit 预处理', how:'无泄漏'}
  ], gen:'' },

{ id:'da.leak', dom:'da', title:'数据泄漏', en:'data leakage',
  gut:'测试集/未来/标签的信息进了训练=泄漏',
  see:'考试前偷看答案：训练分 99，上线崩',
  why:'第一性：模型部署时只有当时可得的信息。泄漏三种：预处理在划分前 fit（统计泄漏）、特征含标签衍生量（目标泄漏）、同组样本跨集（组泄漏）。指标好得离谱先怀疑它。',
  formula:'检查清单：划分先于 fit？特征在预测时刻可得？同病人/同批次在同一侧？',
  trap:'SMOTE 在划分前做→合成样本泄漏到测试。时间序列随机划分→用未来预测过去。',
  anim:'da_leak', bridge:['pr.bayes'], links:['da.split','da.normalize','da.pipeline','ml.metrics'],
  book:'Book6 ch9 划分与交叉验证',
  drills:[
    {q:'先对全表 StandardScaler.fit 再 split，泄漏了什么?', a:'测试集的 μ 和 σ', how:'统计泄漏'},
    {q:'预测住院死亡，特征里有"出院诊断"，问题?', a:'目标泄漏', how:'预测时刻不可得'},
    {q:'AUC=0.99 的病理切片模型，第一件事查什么?', a:'同病人切片是否跨集', how:'组泄漏最常见'},
    {q:'SMOTE 该在划分前还是后?', a:'后，只对训练集', how:'合成样本不能进测试'}
  ], gen:'g_split_leak' },

{ id:'da.tidy', dom:'da', title:'长表与宽表', en:'long vs wide',
  gut:'长表一行一观测给绘图；宽表一行一样本给模型',
  see:'宽表：病人×基因矩阵；长表：三列 (病人, 基因, 值)。melt 拉长，pivot 压宽',
  why:'第一性：同一份数据两种排法。长表每行一个测量，方便分组和分面绘图；宽表每行一个样本，方便直接喂矩阵。melt/pivot 互逆。',
  formula:'long=df.melt(id_vars="id", var_name="gene", value_name="expr")   wide=long.pivot(index="id", columns="gene", values="expr")',
  trap:'pivot 遇到重复 (index, columns) 组合报错，用 pivot_table 指定 aggfunc。melt 后混着字符串会全变 object。',
  anim:'da_dataframe', bridge:[], links:['da.dataframe','da.groupby','vz.subplot'],
  book:'Book6 ch4 数据重塑',
  drills:[
    {q:'宽表 100 病人 × 50 基因 melt 后几行?', a:'5000', how:'每个格子变一行'},
    {q:'"每个基因一张箱线图"用长表还是宽表方便?', a:'长表', how:'sns.boxplot(x="gene", y="expr")'},
    {q:'喂 sklearn 用长表还是宽表?', a:'宽表', how:'(n_samples, n_features)'},
    {q:'pivot 报 Index contains duplicate entries，怎么办?', a:'pivot_table(aggfunc="mean")', how:'重复格子要先聚合'}
  ], gen:'' },

{ id:'da.apply', dom:'da', title:'apply 与向量化', en:'apply vs vectorized',
  gut:'能用列运算就别 apply；apply 是慢速兜底',
  see:'列运算=整列下沉 C；apply=Python 一行行调函数',
  why:'第一性：df.a*df.b、np.where、.str.、.dt. 都是向量化。apply(axis=1) 每行调一次 Python 函数，10 万行慢 100 倍。map 用于单列字典映射。',
  formula:'df["bmi"]=df.w/df.h**2   df["grp"]=np.where(df.age>65,"old","young")   df["sex"].map({"M":0,"F":1})',
  trap:'链式 df[df.a>0]["b"]=1 不生效（作用在副本），用 df.loc[df.a>0,"b"]=1。',
  anim:'da_dataframe', bridge:[], links:['np.vectorize','da.dataframe','da.clean'],
  book:'Book6 ch2 pandas 基础',
  drills:[
    {q:'df["x"].apply(lambda v: v*2) 更快的写法?', a:'df["x"]*2', how:'整列运算'},
    {q:'把 "M"/"F" 映射成 0/1?', a:'df.sex.map({"M":0,"F":1})', how:'单列字典映射'},
    {q:'按 age>65 打标签 old/young?', a:'np.where(df.age>65,"old","young")', how:'向量化 if'},
    {q:'df[df.a>0]["b"]=1 为什么没改?', a:'链式索引作用在副本', how:'用 df.loc[df.a>0,"b"]=1'}
  ], gen:'' }
]
});
