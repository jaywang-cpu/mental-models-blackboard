// 数理宇宙 v3 · 推导层：pt PyTorch 大陆（11 节点）
// 只 push 到 window.DERIVE，不改动 v1/v2 任何文件。scratch 全部用 python3 + numpy 实跑，out 为真实输出。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

'pt.tensor': {
  layers:{
    alg:"tensor = (storage 指针, shape, stride, dtype) + device + grad_fn。前四项 ndarray 也有；后两项是 PyTorch 独有：数据住在哪块内存、它是被哪个运算生出来的。",
    geo:"一块数据方砖。ndarray 只贴两张标签(形状、类型)；tensor 再贴两张(住哪块卡、要不要记账)。from_numpy 不是搬砖，是给同一块砖再贴一张标签。",
    comp:"from_numpy 复用 numpy 的缓冲区指针，O(1) 不拷贝；torch.tensor(a) 走 memcpy O(n)。.numpy() 只在 CPU 且无梯度边时允许，因为 numpy 既不认 CUDA 指针也不认 grad_fn。"
  },
  proof:{
    from:"ndarray 的内存模型：连续缓冲区 + shape + stride；深度学习的两个额外需求：设备位置、计算来源",
    to:"为什么 tensor 比 ndarray 多恰好两种失败方式，以及 from_numpy 为什么共享内存",
    steps:[
      ["把 ndarray 定义为 (buffer, shape, stride, dtype)；索引 a[i,j] = buffer[i*stride0 + j*stride1]","这就是 numpy 的实际实现；view/reshape/切片只改 shape 与 stride，不动 buffer"],
      ["反向传播需要每个中间量记住\"我从哪个运算来\"(grad_fn)，否则链式法则无法回溯","链式法则的每一项是局部雅可比乘上游梯度，上游必须能找到"],
      ["GPU 计算需要数据在显存里；显存指针与主存指针不互通","CUDA kernel 只能读设备内存，CPU 只能读主存，两套地址空间"],
      ["于是 tensor = ndarray 四元组 + device + grad_fn，多的只有这两项","其余字段与 numpy 一一对应，所以 numpy 的所有形状/dtype 坑原样继承"],
      ["from_numpy 只把 numpy 的 buffer 指针包一层 tensor 头，不复制","复制是 O(n) 且多占一倍内存；零拷贝只要求两边内存布局兼容(numpy 与 CPU tensor 都是 strided 布局)"],
      ["共享 buffer ⇒ 任一方原地写另一方立刻可见；要独立就必须显式拷贝(torch.tensor / .clone())","同一块内存只有一份，没有第二份可以不同步"],
      [".numpy() 要求 CPU + 无 grad_fn：numpy 读不了显存，也没有位置存放梯度边","两个多出来的字段各自对应一种 numpy 不认识的状态，因此各有一种报错"]
    ],
    end:"tensor 的两种额外失败(设备、梯度)正好来自它比 ndarray 多的两张标签；而共享内存的坑来自 from_numpy 是零拷贝而非复制。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\na = np.arange(6.0)\nv = a.reshape(2, 3)          # 类比 from_numpy / view：只改 shape/stride\nc = a.copy()                 # 类比 torch.tensor(a) / clone\na[0] = 99\nprint('shares_memory(a,v)=', np.shares_memory(a, v), ' v[0,0]=', v[0, 0], ' | copy c[0]=', c[0])\nprint('view 的 strides=', v.strides, ' 转置 strides=', v.T.strides, '(同一块 buffer 换尺子)')\n# 一个最小 tensor：ndarray 四元组 + device + grad_fn 两张标签\nclass T:\n    def __init__(s, d, device='cpu', grad_fn=None): s.d, s.device, s.grad_fn = d, device, grad_fn\n    def numpy(s):\n        if s.grad_fn is not None: raise RuntimeError(\"Can't call numpy() on Tensor that requires grad. Use .detach()\")\n        if s.device != 'cpu': raise TypeError(\"can't convert cuda tensor to numpy. Use .cpu()\")\n        return s.d\n    def detach(s): return T(s.d, s.device, None)\n    def cpu(s): return T(s.d, 'cpu', s.grad_fn)\nx = T(np.ones(2), device='cuda:0', grad_fn='MulBackward')\nfor f in (lambda: x.numpy(), lambda: x.detach().numpy(), lambda: x.detach().cpu().numpy()):\n    try: print('ok ->', f())\n    except Exception as e: print(type(e).__name__, '->', e)\nprint('arange(6) dtype=', np.arange(6).dtype, ' arange(6.0) dtype=', np.arange(6.0).dtype)", out:"shares_memory(a,v)= True  v[0,0]= 99.0  | copy c[0]= 0.0\nview 的 strides= (24, 8)  转置 strides= (8, 24) (同一块 buffer 换尺子)\nRuntimeError -> Can't call numpy() on Tensor that requires grad. Use .detach()\nTypeError -> can't convert cuda tensor to numpy. Use .cpu()\nok -> [1. 1.]\narange(6) dtype= int64  arange(6.0) dtype= float64",
    note:"shares_memory 那行对应第 5–6 步(零拷贝所以同步改)；类 T 的两个异常对应第 7 步(两张标签各一种报错)；strides 那行对应第 1 步(view 只换尺子不搬砖)。" },
  contrast:[
    {vs:"numpy ndarray", same:"同样的 shape/stride/dtype 内存模型，广播规则一致", diff:"ndarray 没有 device 与 grad_fn，所以既上不了 GPU 也进不了反向传播", when:"预处理、画图、存表用 numpy；进模型前一刻转 tensor"},
    {vs:"torch.tensor(a) 与 torch.from_numpy(a)", same:"都从 ndarray 得到 tensor，值相同", diff:"前者复制，后者共享 buffer", when:"数据后面还会被 numpy 原地改就用 tensor()；只读大数组用 from_numpy 省一倍内存"},
    {vs:"x.view 与 x.reshape", same:"都改形状", diff:"view 要求连续内存否则报错；reshape 不连续时静默复制", when:"要确定是零拷贝用 view，图省事用 reshape"},
    {vs:"Python list", same:"都能装一串数", diff:"list 是指针数组，元素散在堆上，无向量化、无 dtype", when:"list 只用来收集 .item() 后的标量日志"}
  ],
  ext:[
    {t:"device 标签展开就是显存核算与 .to(device) 的全部规则", go:'pt.device'},
    {t:"grad_fn 标签展开就是动态计算图", go:'pt.autograd'},
    {t:"shape/stride 那部分与 numpy 完全同构", go:'np.array_shape'}
  ]
},

'pt.autograd': {
  layers:{
    alg:"L = f_n∘…∘f_1(θ)。反向模式：v_n = 1，v_{k-1} = J_k^T v_k 从后往前；一次扫描得到 ∂L/∂θ 全部分量。前向模式一次只能得到 J·e_i 一个方向导数。",
    geo:"前向执行时每个新张量拖一根线连回生它的运算，线上写着局部导数；loss 是根，参数是叶。backward 从根沿线倒流，分叉处相加，到叶子就把值加进 .grad。",
    comp:"define-by-run：每个算子在前向时顺手把 (输入引用, 反向函数) 压进 grad_fn；backward 对图做拓扑逆序遍历，每个节点调一次反向函数；默认遍历完就释放保存的中间量。"
  },
  proof:{
    from:"多元链式法则 ∂L/∂x = (∂y/∂x)^T ∂L/∂y；矩阵乘法结合律；一次 GEMM 的代价与形状",
    to:"为什么深度学习用反向模式而不是前向模式，以及为什么图要\"用完即释放\"与梯度要\"累加\"",
    steps:[
      ["写 L(θ) = f_n(…f_1(θ))，θ∈R^p，L∈R。总导数 ∂L/∂θ = J_n J_{n-1} … J_1，J_k 是第 k 层雅可比","链式法则对复合函数逐层展开，雅可比按复合顺序相乘"],
      ["这串乘积可以从左算(反向: 先 J_n J_{n-1})或从右算(前向: 先 J_2 J_1)，结果相同","矩阵乘法结合律，括号怎么加都一样，但代价不同"],
      ["从右算：J_2 J_1 是 (d_2×d_1)(d_1×p) 的满矩阵，每一步都要拖着宽度 p；总代价 ≈ p 倍前向","J_1 有 p 列，之后每个乘积都保留 p 列，相当于对每个参数方向各做一次前向"],
      ["从左算：L 是标量所以 J_n 只有 1 行，J_n J_{n-1} 仍是 1 行，每步是\"向量 × 矩阵\"，总代价 ≈ 1 倍前向","行数 = 输出维数 = 1，永远不膨胀；深度学习输出恰是一个标量 loss，参数 p 极大，所以反向完胜"],
      ["向量-雅可比积 v^T J_k 不需要显式 J_k：对 y=Wx，v^T ∂y/∂W = v x^T，v^T ∂y/∂x = W^T v","每个基本算子的 VJP 都能直接写成与前向同阶的运算，避免了 O(d²) 的雅可比矩阵"],
      ["VJP 需要前向的中间值(如 x、W、relu 掩码)，所以前向必须把它们存下来 → 激活显存","导数公式里出现了前向量，不存就得重算"],
      ["backward 走完一次后把这些保存量释放：图是一次性的，第二次 backward 找不到中间值就报错","define-by-run 下一个 batch 会建新图，保留旧图是纯浪费；retain_graph 只是推迟释放"],
      ["多条路径汇到同一叶子时梯度相加(多元链式法则的求和项)，实现上就是 .grad += ，于是跨 backward 调用也累加","把\"同一次 backward 内的求和\"和\"跨次 backward 的求和\"用同一个 += 实现，代价是用户必须显式清零"]
    ],
    end:"反向模式的代价与输出维数成正比，而深度学习输出是 1 维、参数是百万维，这个不对称就是 autograd 设计的全部理由；图释放与梯度累加都是 VJP 实现的直接后果。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nclass Tensor:\n    def __init__(s, d, parents=(), back=None, rg=False):\n        s.d = np.asarray(d, float); s.grad = None; s.parents = parents; s.back = back\n        s.rg = rg or any(p.rg for p in parents)\n    def _mk(s, d, parents, back): return Tensor(d, parents, back)\n    def __add__(s, o): return s._mk(s.d + o.d, (s, o), lambda g: (g, g))\n    def __mul__(s, o): return s._mk(s.d * o.d, (s, o), lambda g: (g * o.d, g * s.d))\n    def matmul(s, o): return s._mk(s.d @ o.d, (s, o), lambda g: (g @ o.d.T, s.d.T @ g))\n    def relu(s): return s._mk(np.maximum(s.d, 0), (s,), lambda g: (g * (s.d > 0),))\n    def sum(s): return s._mk(s.d.sum(), (s,), lambda g: (g * np.ones_like(s.d),))\n    def backward(s):\n        if s.parents and s.back is None: raise RuntimeError('Trying to backward through the graph a second time')\n        order, seen = [], set()\n        def topo(t):\n            if id(t) in seen: return\n            seen.add(id(t)); [topo(p) for p in t.parents]; order.append(t)\n        topo(s); s.grad = np.ones_like(s.d)\n        for t in reversed(order):\n            if t.back is None: continue\n            for p, g in zip(t.parents, t.back(t.grad)):\n                if p.rg: p.grad = g if p.grad is None else p.grad + g   # 累加语义\n            t.back = None                                                # 用完即释放\nW1 = Tensor(np.random.randn(3, 4) * 0.5, rg=True); W2 = Tensor(np.random.randn(4, 1) * 0.5, rg=True)\nx = Tensor(np.random.randn(5, 3))\ndef loss(W1d, W2d):\n    h = np.maximum(x.d @ W1d, 0); return (h @ W2d).sum()\nL = x.matmul(W1).relu().matmul(W2).sum(); L.backward()\ndef num_grad(W, i):\n    Ws = [W1.d.copy(), W2.d.copy()]; g = np.zeros_like(W)\n    for idx in np.ndindex(W.shape):\n        e = np.zeros_like(W); e[idx] = 1e-6\n        Wp = list(Ws); Wp[i] = W + e; Wm = list(Ws); Wm[i] = W - e\n        g[idx] = (loss(*Wp) - loss(*Wm)) / 2e-6\n    return g\nprint('max|autograd - numeric| W1:', f'{np.abs(W1.grad - num_grad(W1.d, 0)).max():.2e}', ' W2:', f'{np.abs(W2.grad - num_grad(W2.d, 1)).max():.2e}')\ntry: L.backward()\nexcept Exception as e: print('second backward ->', type(e).__name__, '(图已释放)')\ng1 = W1.grad.copy(); L2 = x.matmul(W1).relu().matmul(W2).sum(); L2.backward()\nprint('不清零再 backward 一次, W1.grad/第一次 =', np.round((W1.grad / g1)[0, 0], 3), '(累加)')\np = W1.d.size + W2.d.size\nprint(f'参数 p={p}, 输出 1 维: 反向模式 1 次扫描 vs 前向模式 {p} 次扫描')", out:"max|autograd - numeric| W1: 2.99e-10  W2: 2.28e-10\nsecond backward -> RuntimeError (图已释放)\n不清零再 backward 一次, W1.grad/第一次 = 2.0 (累加)\n参数 p=16, 输出 1 维: 反向模式 1 次扫描 vs 前向模式 16 次扫描",
    note:"Tensor 类里每个 lambda 就是第 5 步的 VJP；数值梯度对比到 1e-6 量级验证第 1–2 步的链式法则；t.back=None 对应第 7 步释放；p.grad + g 对应第 8 步累加；最后一行是第 3–4 步的代价对比。" },
  contrast:[
    {vs:"前向模式自动微分 / 对偶数", same:"都是精确的链式法则，都不是数值差分", diff:"前向一次只得到一个输入方向的导数，代价 ∝ 输入维 p；反向代价 ∝ 输出维", when:"输入少输出多(如 Jacobian 的列)用前向；标量 loss 对百万参数用反向"},
    {vs:"数值差分 (f(θ+ε)−f(θ−ε))/2ε", same:"都给出梯度的数值", diff:"差分要 2p 次前向且有截断/舍入误差；autograd 一次反向且精确到浮点", when:"差分只用来做单元测试校验 autograd"},
    {vs:"符号微分 (sympy)", same:"都是精确导数", diff:"符号微分展开表达式会指数膨胀；autograd 只在数值上传播，从不写出表达式", when:"需要闭式公式用符号；需要数值梯度用 autograd"},
    {vs:"静态图 (TF1 / JAX jit)", same:"同样的 VJP 规则", diff:"静态图先声明后执行，可全局优化但控制流受限；define-by-run 每个 batch 现建图，可用 Python if/for", when:"研究与调试用动态图；部署与极致性能再编译"}
  ],
  ext:[
    {t:"是否记账、何处剪线由 requires_grad / detach / no_grad 控制", go:'pt.requires_grad'},
    {t:".grad 累加的直接后果是 optimizer.zero_grad", go:'pt.optimizer'},
    {t:"数学上就是逐层 VJP 的反向传播", go:'dl.backprop'},
    {t:"每根线上写的局部导数就是链式法则的一个因子", go:'ca.chain_rule'}
  ]
},

'pt.requires_grad': {
  layers:{
    alg:"传播规则：out.requires_grad = OR(inputs.requires_grad)。detach(x) 返回与 x 共享 storage、requires_grad=False、无 grad_fn 的新张量。no_grad 是一个全局开关：块内所有算子的输出都不记 grad_fn。",
    geo:"线路图上每根线有颜色：黑=记账，灰=不记。任一输入黑则输出黑。detach 是在某一根线上剪一刀，下游从灰开始；no_grad 是把整块区域涂灰。",
    comp:"requires_grad 是张量头上的一个 bool；算子前向时扫一遍输入的 bool 做 OR，为真才分配 grad_fn 并保存中间量。no_grad 把线程局部的 GradMode 置 False，算子看到它就跳过这一步，省的是保存中间量的显存与建图的时间。"
  },
  proof:{
    from:"链式法则里 ∂L/∂θ 只依赖 θ 到 L 的路径；VJP 需要保存前向中间量",
    to:"requires_grad 为什么是 OR 传播；detach 与 no_grad 为什么分别是\"点\"与\"面\"两种操作",
    steps:[
      ["梯度只需要流到要更新的叶子。若某算子的所有输入都不需要梯度，它的输出的任何下游梯度都无处可去","链式法则中 ∂L/∂θ 的每一项都要经过从 θ 到 L 的路径，没有需要梯度的输入就没有路径"],
      ["反之只要有一个输入需要梯度，输出就必须记 grad_fn，否则那条路径断了","丢掉任一条路径就漏掉多元链式法则里的一个求和项，梯度错"],
      ["因此传播规则只能是 OR：这是\"不漏路径\"的最弱充分条件","AND 会漏路径，恒 True 会浪费；OR 恰好"],
      ["记账的代价 = 保存 VJP 需要的中间量。验证/推理阶段没有人调用 backward，保存的东西永远不会被读","没有 backward 就没有释放时机，每个 batch 的中间量一直堆着，这就是\"忘 no_grad 显存持续增长\""],
      ["no_grad 把 GradMode 关掉，块内所有算子输出的 requires_grad=False，中间量不保存","这是对一段代码区域的操作，粒度是\"面\"，适合整个 eval 循环"],
      ["detach 只对一个张量动手：新头指向同一 storage，但 grad_fn=None、requires_grad=False，下游从这里重新开始 OR 传播","粒度是\"点\"，适合\"这一支不要回传梯度但其他支要\"，如 target 网络、停止梯度的 teacher 输出"],
      ["detach 共享 storage 所以零拷贝；原地写会同时改到原张量，而原张量的 VJP 可能还要用旧值 → autograd 用版本号检查并报错","保存的中间量是引用不是快照；版本计数器是发现\"引用被改\"的唯一办法"],
      ["冻结骨干 = 把叶子的 requires_grad 设 False，OR 传播使骨干内部全部灰化；但优化器若仍持有这些参数，动量项会继续推它们","优化器更新 = f(grad, state)，grad 为 None 时多数实现跳过，但 weight decay / 动量的实现差异可能仍然动参数，所以要同时从优化器里剔除"]
    ],
    end:"requires_grad 的 OR 传播是链式法则不漏项的最小规则；no_grad 关掉整块的记账，detach 剪断一根线，两者作用域不同、不能互相替代。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nGRAD = [True]                                  # 全局 GradMode，类比 torch.no_grad\nclass T:\n    def __init__(s, d, rg=False, parents=(), back=None, saved=0):\n        s.d = d; s.rg = rg; s.parents = parents; s.back = back; s.saved = saved; s.grad = None\n    def op(s, o, d, back):\n        rg = GRAD[0] and (s.rg or o.rg)        # OR 传播，且受 GradMode 开关控制\n        return T(d, rg, (s, o) if rg else (), back if rg else None, saved=(s.d.nbytes + o.d.nbytes) if rg else 0)\n    def matmul(s, o): return s.op(o, s.d @ o.d, lambda g: (g @ o.d.T, s.d.T @ g))\n    def detach(s): return T(s.d, False)         # 同一份 d，剪断 grad_fn\n    def total_saved(s):\n        seen, st, tot = set(), [s], 0\n        while st:\n            t = st.pop()\n            if id(t) in seen: continue\n            seen.add(id(t)); tot += t.saved; st += list(t.parents)\n        return tot\n    def backward(s, g=None):\n        g = np.ones_like(s.d) if g is None else g\n        if s.back is None:\n            if s.rg: s.grad = g if s.grad is None else s.grad + g\n            return\n        for p, gp in zip(s.parents, s.back(g)): p.backward(gp)\nWb = T(np.random.randn(8, 8), rg=True); Wh = T(np.random.randn(8, 2), rg=True); x = T(np.random.randn(4, 8))\ny = x.matmul(Wb).matmul(Wh); print('x(False) @ Wb(True) -> rg =', x.matmul(Wb).rg, '| x @ x2(False) -> rg =', x.matmul(T(np.random.randn(8, 8))).rg, '(OR 传播)')\nprint('训练图保存中间量 bytes =', y.total_saved())\nGRAD[0] = False; y2 = x.matmul(Wb).matmul(Wh); GRAD[0] = True\nprint('no_grad 块内同样前向: rg =', y2.rg, ' 保存 bytes =', y2.total_saved(), '(整块不记账)')\nh0 = x.matmul(Wb); h = h0.detach(); y3 = h.matmul(Wh); y3.backward()\nprint('detach 后 Wb.grad =', Wb.grad, ' Wh.grad 形状 =', Wh.grad.shape, '(只剪一根线)')\nprint('detach 与原张量共享同一份数据:', h.d is h0.d, ' rg =', h.rg, ' grad_fn =', h.back)\nWb.rg = False; y4 = x.matmul(Wb).matmul(Wh); y4.backward()\nprint('冻结 Wb 后再 backward: Wb.grad =', Wb.grad, '| 图里保存 bytes =', y4.total_saved(), '(骨干那段被 OR 规则灰化)')", out:"x(False) @ Wb(True) -> rg = True | x @ x2(False) -> rg = False (OR 传播)\n训练图保存中间量 bytes = 1152\nno_grad 块内同样前向: rg = False  保存 bytes = 0 (整块不记账)\ndetach 后 Wb.grad = None  Wh.grad 形状 = (8, 2) (只剪一根线)\ndetach 与原张量共享同一份数据: True  rg = False  grad_fn = None\n冻结 Wb 后再 backward: Wb.grad = None | 图里保存 bytes = 384 (骨干那段被 OR 规则灰化)",
    note:"op 里的 `GRAD[0] and (s.rg or o.rg)` 就是第 3 步的 OR 规则与第 5 步的全局开关；total_saved 量化第 4 步\"记账 = 存中间量\"；detach 那段对应第 6 步；最后一行对应第 8 步冻结骨干。" },
  contrast:[
    {vs:"torch.no_grad()", same:"都能让后面的运算不产生梯度", diff:"no_grad 是对代码块的全局开关(面)；detach 是对一个张量剪线(点)，块外其余分支照常记账", when:"整个 eval / 推理循环用 no_grad；训练中某一支不回传(如 target、teacher 输出)用 detach"},
    {vs:"model.eval()", same:"都是\"推理时要做的事\"", diff:"eval 只切 Dropout/BN 的前向行为，完全不碰梯度记账", when:"两个都要：eval() 改层行为 + no_grad() 关记账"},
    {vs:"x.data", same:"都得到无梯度、共享 storage 的张量", diff:".data 绕过版本计数，原地改后 autograd 静默算错；detach 会检测并报错", when:"新代码一律 detach，.data 只在读老代码时认识它"},
    {vs:"requires_grad_(False) 冻结参数", same:"都让梯度不流到某处", diff:"冻结改的是叶子节点的标签，通过 OR 规则让整段变灰；detach 只切一个中间张量", when:"长期不训的骨干用冻结；某一次前向的某一支用 detach"}
  ],
  ext:[
    {t:"OR 传播依赖的是动态建图机制", go:'pt.autograd'},
    {t:"eval 与 no_grad 正交，各管一件事", go:'pt.train_eval'},
    {t:"不记账省下的正是激活显存那一层货架", go:'pt.device'}
  ]
},

'pt.module': {
  layers:{
    alg:"Module = 一棵树：节点持有 _parameters(dict) 与 _modules(dict)。parameters() = 先序遍历整棵树把所有 _parameters 摊平。Linear(in,out) 贡献 in·out + out 个标量。",
    geo:"一个盒子套盒子。给盒子贴属性时，若贴的是 Parameter 就登记到\"参数抽屉\"，若是 Module 就登记到\"子盒子抽屉\"；塞进普通 list 里的层等于放在盒子外面，遍历时看不见。",
    comp:"__setattr__ 被重载：按 value 的类型分派到三个 dict 之一(参数/子模块/普通属性)。parameters()、to(device)、state_dict()、train()/eval() 全部靠递归这两个 dict，所以没登记 = 全部功能同时失效。"
  },
  proof:{
    from:"训练循环需要一个\"可枚举全部可训练参数\"的接口；Python 的属性赋值可以被 __setattr__ 拦截",
    to:"为什么 Module 用属性赋值自动登记，为什么 list 里的层不被看见，以及 model(x) 与 model.forward(x) 的差别",
    steps:[
      ["优化器、to(device)、保存加载都需要同一份\"全部参数\"清单；手工维护清单在深层嵌套时必然漏","清单的正确性取决于每一次结构改动都同步更新，人工做不到"],
      ["Python 允许重载 __setattr__，于是可以在 self.fc = nn.Linear(...) 这一刻自动登记","属性赋值是构造层时必经的动作，拦截它就能零成本收集"],
      ["登记按类型分派：Parameter → _parameters，Module → _modules，其他 → __dict__","三种东西的处理不同(参数要更新，子模块要递归，普通属性不动)，所以要分抽屉"],
      ["parameters() 递归 _modules 并 yield 每层的 _parameters，得到一棵树的先序摊平","树的遍历只需要每个节点知道自己的孩子，这正是 _modules 提供的"],
      ["self.layers = [Linear, Linear] 赋值的 value 类型是 list，进了 __dict__，_modules 里没有它","分派只看最外层类型；list 不是 Module，登记逻辑不会往里看"],
      ["因此这些层不在 parameters() 里 → 优化器不更新；不在 _modules 里 → to(device)/state_dict/eval 也全部漏","四个功能共用同一棵树，树上没有就四个一起失效，而不是只坏一个"],
      ["ModuleList/ModuleDict 本身是 Module，把元素登记进自己的 _modules，于是被递归到","用一个 Module 包装容器，让\"容器\"重新回到树上"],
      ["model(x) 调用 __call__：前 hook → forward → 后 hook，还处理 backward hook 注册；直接 forward 跳过全部 hook","hook 是挂在 __call__ 上的，forward 只是用户写的纯函数"]
    ],
    end:"Module 的全部魔法就是\"属性赋值即登记 + 递归摊平\"，所以任何绕过属性赋值的存放方式都会让层从树上消失。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nclass Module:\n    def __init__(s): object.__setattr__(s, '_p', {}); object.__setattr__(s, '_m', {})\n    def __setattr__(s, k, v):                      # 按类型分派到三个抽屉\n        if isinstance(v, np.ndarray): s._p[k] = v\n        elif isinstance(v, Module): s._m[k] = v\n        else: object.__setattr__(s, k, v)\n    def __getattr__(s, k):\n        for d in ('_p', '_m'):\n            if k in s.__dict__[d]: return s.__dict__[d][k]\n        raise AttributeError(k)\n    def parameters(s, prefix=''):\n        for k, v in s._p.items(): yield prefix + k, v\n        for k, m in s._m.items(): yield from m.parameters(prefix + k + '.')\n    def __call__(s, x): s.calls = getattr(s, 'calls', 0) + 1; return s.forward(x)   # hook 位\nclass Linear(Module):\n    def __init__(s, i, o): super().__init__(); s.W = np.random.randn(i, o) * 0.1; s.b = np.zeros(o)\n    def forward(s, x): return x @ s.W + s.b\nclass ModuleList(Module):\n    def __init__(s, ms): super().__init__(); [setattr(s, str(i), m) for i, m in enumerate(ms)]\nclass Net(Module):\n    def __init__(s, use_mlist):\n        super().__init__(); s.fc = Linear(128, 64)\n        s.hidden = ModuleList([Linear(64, 64), Linear(64, 64)]) if use_mlist else [Linear(64, 64), Linear(64, 64)]\n    def forward(s, x): return s.fc(x)\ncount = lambda net: sum(v.size for _, v in net.parameters())\nprint('Linear(128,64) 参数量 =', count(Linear(128, 64)), '(128*64+64)')\nbad, good = Net(False), Net(True)\nprint('python list 装层:  登记到的参数名 =', [k for k, _ in bad.parameters()], ' 总量 =', count(bad))\nprint('ModuleList 装层:  登记到的参数名 =', [k for k, _ in good.parameters()], ' 总量 =', count(good))\nx = np.random.randn(2, 128); good(x); good.forward(x)\nprint('model(x) 走 __call__ 计数 =', good.calls, '；直接 forward 不计数(绕过 hook)')", out:"Linear(128,64) 参数量 = 8256 (128*64+64)\npython list 装层:  登记到的参数名 = ['fc.W', 'fc.b']  总量 = 8256\nModuleList 装层:  登记到的参数名 = ['fc.W', 'fc.b', 'hidden.0.W', 'hidden.0.b', 'hidden.1.W', 'hidden.1.b']  总量 = 16576\nmodel(x) 走 __call__ 计数 = 1 ；直接 forward 不计数(绕过 hook)",
    note:"__setattr__ 三分支对应第 3 步；parameters 的递归 yield 对应第 4 步；bad 网络参数名里没有 hidden 对应第 5–6 步；ModuleList 对应第 7 步；calls 计数对应第 8 步。" },
  contrast:[
    {vs:"普通 Python 类 + 手写参数列表", same:"都能定义 forward", diff:"手写列表要在每次改结构时同步，Module 用赋值即登记消除这个同步", when:"任何会被优化器训练的东西都继承 Module"},
    {vs:"nn.Sequential", same:"也是 Module，也自动登记", diff:"Sequential 固定了\"按顺序逐层调用\"的 forward；自定义 Module 的 forward 可任意分支", when:"纯链式堆叠用 Sequential；有残差/多输入用自定义"},
    {vs:"nn.Parameter 与普通 tensor 属性", same:"都是张量", diff:"只有 Parameter 类型会进 _parameters；普通 tensor 属性既不训练也不随 to(device) 搬(要用 register_buffer)", when:"要训练的用 Parameter；BN 的 running_mean 这种\"要保存不训练\"的用 buffer"},
    {vs:"函数式接口 torch.nn.functional", same:"算的东西一样(F.linear 与 nn.Linear)", diff:"functional 无状态，参数由你自己持有；Module 替你持有并登记", when:"有参数的层用 Module，无参数的操作(relu、softmax)用 F"}
  ],
  ext:[
    {t:"parameters() 的输出就是优化器接收的清单", go:'pt.optimizer'},
    {t:"同一棵树摊平成名字→张量的字典就是 state_dict", go:'pt.save_load'},
    {t:"一层 Linear 的 in·out+out 参数量对应一次矩阵变换", go:'la.matmul_shape'}
  ]
},

'pt.optimizer': {
  layers:{
    alg:"SGD: θ ← θ − η g。Adam: m ← β₁m + (1−β₁)g；v ← β₂v + (1−β₂)g²；m̂ = m/(1−β₁ᵗ)；v̂ = v/(1−β₂ᵗ)；θ ← θ − η m̂/(√v̂+ε)。zero_grad 把 .grad 置零，因为 backward 是 +=。",
    geo:"SGD 沿当前坡度走固定比例的一步，陡处大步缓处小步。Adam 每个坐标各有一把尺子(√v̂)，把步长归一化到 O(η)，所以在陡缓不一的峡谷里各方向步子一样长。",
    comp:"step() 遍历 param_groups，对每个 p 用 p.grad 与 state[p] 里的 m、v 原地更新；zero_grad 遍历同一清单把 grad 清空。梯度累积 = 连续 k 次 backward 不清零，让 += 替你求和。"
  },
  proof:{
    from:"梯度下降 θ ← θ − ηg；指数滑动平均 EMA 的定义与初值为 0 的偏差；autograd 的 .grad 累加语义",
    to:"Adam 的一阶/二阶矩更新与偏差校正公式，以及 zero_grad 为什么必须存在",
    steps:[
      ["把 g 的 EMA 写成 m_t = β₁m_{t−1} + (1−β₁)g_t，m_0 = 0。展开得 m_t = (1−β₁)Σ_{i≤t} β₁^{t−i} g_i","递推逐层代入，权重是几何级数，这是 EMA 的定义"],
      ["若 g 的均值为 μ，则 E[m_t] = (1−β₁)μ Σ β₁^{t−i} = μ(1−β₁ᵗ)，早期偏小","几何级数求和 Σ_{i=1}^t β^{t−i} = (1−βᵗ)/(1−β)；m_0=0 拉低了平均"],
      ["所以 m̂_t = m_t/(1−β₁ᵗ) 是 μ 的无偏估计；t=1 时 m̂₁ = g₁ 恰好","除以那个缩小系数就抵消偏差；t→∞ 时系数→1，校正自动消失"],
      ["同理对 g² 做 EMA 得 v_t，v̂_t = v_t/(1−β₂ᵗ) 估计 E[g²]；β₂=0.999 时 v 偏差消得慢，校正更关键","g² 的 EMA 和 g 的 EMA 是同一个推导，只是被平均的量换成 g²"],
      ["更新 θ ← θ − η m̂/(√v̂+ε)：分子分母同为梯度量纲，比值无量纲，每坐标步长 ≈ η·(信噪比)","用二阶矩开方做尺度归一化，梯度大的坐标被除得多，各方向步长自动均衡；ε 防止 v̂≈0 时除零"],
      ["反向传播中同一叶子被多条路径到达时梯度相加，autograd 用 .grad += 实现，且不区分是否同一次 backward","用一个 += 覆盖两种情形是实现上最简单的选择，代价转嫁给用户"],
      ["于是不 zero_grad 时第 n 步的 .grad = Σ_{i≤n} g_i，等效学习率放大约 n 倍，训练先降后炸","+= 从不自动归零，累计和随步数线性增长"],
      ["反过来利用它：k 个小 batch 各 backward(loss/k) 再 step 一次，.grad 恰是大 batch 的平均梯度","均值的线性性：k 个 1/k 加权的小 batch 均值之和 = 合并 batch 的均值"]
    ],
    end:"Adam = 两条 EMA + 除以(1−βᵗ)修正零初值 + 按 √v̂ 归一化步长；zero_grad 不是设计瑕疵而是\"+= 既服务链式法则又服务梯度累积\"的必然代价。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nf = lambda w: 0.5 * (100 * w[0] ** 2 + w[1] ** 2)          # 条件数 100 的峡谷\ngrad = lambda w: np.array([100 * w[0], w[1]])\ndef sgd(w, lr=0.01, T=200):\n    for _ in range(T): w = w - lr * grad(w)\n    return w\ndef adam(w, lr=0.1, b1=0.9, b2=0.999, eps=1e-8, T=200, correct=True):\n    m = np.zeros(2); v = np.zeros(2); log = []\n    for t in range(1, T + 1):\n        g = grad(w); m = b1 * m + (1 - b1) * g; v = b2 * v + (1 - b2) * g * g\n        mh, vh = (m / (1 - b1 ** t), v / (1 - b2 ** t)) if correct else (m, v)\n        step = lr * mh / (np.sqrt(vh) + eps); w = w - step\n        if t == 1: log.append(np.abs(step).round(3))\n    return w, log[0]\nw0 = np.array([1.0, 1.0])\nprint('SGD  lr=0.01 200 步 f =', f'{f(sgd(w0.copy())):.4f}', ' (慢方向 w1 只走了到', round(sgd(w0.copy())[1], 3), ')')\nwa, s1 = adam(w0.copy()); print('Adam lr=0.1  200 步 f =', f'{f(wa):.2e}', ' 第 1 步各坐标步长 =', s1, '= lr (梯度 100 vs 1 被归一化)')\nwn, s1n = adam(w0.copy(), correct=False); print('Adam 无偏差校正 第 1 步步长 =', s1n, '(缩到 (1-b1)/sqrt(1-b2)=', round(0.1 / np.sqrt(0.001), 3), '倍 lr)')\n# 偏差校正推导数值验证：常数梯度 mu=1 下 E[m_t] = 1 - b1^t\nm = 0; b1 = 0.9\nfor t in range(1, 4): m = b1 * m + (1 - b1) * 1.0; print(f'  t={t}: m={m:.3f}  1-b1^t={1 - b1 ** t:.3f}  m_hat={m / (1 - b1 ** t):.3f}')\n# zero_grad 来自累加语义\ng_acc = 0.0\nfor step in range(1, 6): g_acc += 1.0                      # 每步 backward += 同一梯度 1\nprint('漏 zero_grad, 第 5 步 .grad =', g_acc, '(等效 lr x5)')\nbig = np.random.randn(32); parts = big.reshape(4, 8)\nprint('梯度累积: 4 个小 batch mean/4 求和 =', round(sum(p.mean() / 4 for p in parts), 6), ' 大 batch mean =', round(big.mean(), 6))", out:"SGD  lr=0.01 200 步 f = 0.0090  (慢方向 w1 只走了到 0.134 )\nAdam lr=0.1  200 步 f = 2.63e-09  第 1 步各坐标步长 = [0.1 0.1] = lr (梯度 100 vs 1 被归一化)\nAdam 无偏差校正 第 1 步步长 = [0.316 0.316] (缩到 (1-b1)/sqrt(1-b2)= 3.162 倍 lr)\n  t=1: m=0.100  1-b1^t=0.100  m_hat=1.000\n  t=2: m=0.190  1-b1^t=0.190  m_hat=1.000\n  t=3: m=0.271  1-b1^t=0.271  m_hat=1.000\n漏 zero_grad, 第 5 步 .grad = 5.0 (等效 lr x5)\n梯度累积: 4 个小 batch mean/4 求和 = 0.431838  大 batch mean = 0.431838",
    note:"adam() 里 m、v 两行是第 1、4 步，mh/vh 是第 3–4 步的偏差校正，step 那行是第 5 步；t=1..3 的表格直接验证第 2 步的 1−β₁ᵗ；g_acc 与梯度累积两段对应第 6–8 步。" },
  contrast:[
    {vs:"SGD 与 SGD+momentum", same:"都沿负梯度方向更新，都要 zero_grad", diff:"SGD 步长 ∝ 梯度大小，Adam 把每坐标步长归一化到 O(lr)；momentum 只是 Adam 的分子(m)没有分母(v)", when:"CV 大 batch 常 SGD+momentum 泛化好；Transformer/稀疏梯度/快速原型默认 Adam(W)"},
    {vs:"AdamW", same:"同样的 m、v、偏差校正", diff:"Adam 把 L2 惩罚加进梯度后被 √v̂ 归一化掉了；AdamW 把权重衰减直接加在参数更新上，与自适应尺度解耦", when:"要正则化就用 AdamW，Adam+weight_decay 基本等于没正则"},
    {vs:"RMSProp", same:"都有二阶矩 v 做归一化", diff:"RMSProp 没有一阶矩 EMA 也没有偏差校正", when:"RMSProp 只在老 RL 代码里见到"},
    {vs:"学习率调度器 (scheduler)", same:"都影响每步走多远", diff:"优化器决定方向与相对尺度，调度器只随时间缩放 η", when:"两者叠加：Adam + warmup/cosine 是默认组合"}
  ],
  ext:[
    {t:".grad += 的来源是 autograd 的累加实现", go:'pt.autograd'},
    {t:"m、v 各占一份参数大小的显存，这是 Adam 显存 ×4 的来源", go:'pt.device'},
    {t:"更新公式的数学骨架就是梯度下降", go:'ml.gradient_descent'}
  ]
},

'pt.dataloader': {
  layers:{
    alg:"Dataset: i ↦ sample_i。Sampler: epoch ↦ 索引排列。collate: [sample]_B ↦ batch 张量。默认 collate = stack，要求 B 个样本形状全同；变长时需 pad 到 max_len 并返回 mask。",
    geo:"一条流水线：Dataset 是一个个托盘，Sampler 决定托盘的出场顺序，collate 是把 B 个托盘码成一箱的那只手。托盘高矮不一时要先垫平(pad)并记下哪格是垫的(mask)。",
    comp:"主进程按 Sampler 发索引给 num_workers 个子进程，子进程各自调 __getitem__ 再 collate，通过队列回传；shuffle 每个 epoch 重新生成一个随机排列；drop_last 决定最后一个不满的箱子扔不扔。"
  },
  proof:{
    from:"GPU 算子要求规整张量 (B, …)；真实样本长度不一；随机梯度需要样本顺序随机",
    to:"为什么必须有 collate 与 mask，以及 shuffle/drop_last 的语义",
    steps:[
      ["一次前向要处理 B 个样本，GEMM 要求它们排成一个 (B, d) 的矩阵","矩阵乘法只对矩形定义，没有\"参差不齐\"的矩阵"],
      ["等长样本直接 stack 即可；这就是默认 collate","stack 把 B 个同形状数组沿新轴摞起来，是最简单的\"码箱\""],
      ["不等长样本 stack 直接失败，所以必须先补到统一长度 L_max","矩形约束不可绕过，补齐是唯一办法；截断会丢信息"],
      ["补的位置不是数据，后续的 loss 与注意力必须忽略它们 → 需要一个 (B, L_max) 的布尔 mask 一起返回","模型分不清\"真 0\"和\"垫的 0\"，只有 collate 知道哪些是垫的，所以只能由它记下来"],
      ["pad 到当前 batch 的 max 而不是全局 max，可以省算力","浪费 ∝ Σ(L_max − L_i)，按 batch 取 max 让浪费最小；再把长度相近的样本分到一箱(bucketing)更省"],
      ["SGD 的收敛分析假设每个 batch 是近似独立同分布抽样；按原始顺序取 batch 会引入相关性(如按类排序的数据)","梯度估计的无偏性要求随机抽样；顺序数据会让连续 batch 梯度高度相关，等效 batch 变小"],
      ["所以 shuffle=True 每个 epoch 生成一个新排列，而验证集不需要 shuffle","验证只算指标不做梯度更新，顺序无所谓；固定顺序还便于对齐预测与标签"],
      ["最后一个 batch 可能只有几个样本，BN 统计不稳、loss 权重失衡 → drop_last=True 在训练时扔掉它","一个 batch 的 loss 是均值，样本数不同的 batch 在梯度里权重相同，小 batch 被过度加权；验证时不能扔，否则漏样本"]
    ],
    end:"DataLoader 的复杂度全部来自\"GPU 要矩形、数据不矩形、SGD 要随机\"三个约束的碰撞；collate + mask 解决前两个，shuffle 解决第三个。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nlengths = np.random.randint(3, 9, size=10)                       # 10 条变长序列\ndata = [np.random.randint(1, 20, size=L) for L in lengths]       # 0 留作 pad\ndef collate(batch):\n    Lmax = max(len(s) for s in batch)\n    x = np.zeros((len(batch), Lmax), int); mask = np.zeros((len(batch), Lmax), bool)\n    for i, s in enumerate(batch): x[i, :len(s)] = s; mask[i, :len(s)] = True\n    return x, mask\ndef loader(ds, bs, shuffle, drop_last, seed):\n    idx = np.random.RandomState(seed).permutation(len(ds)) if shuffle else np.arange(len(ds))\n    n = len(ds) // bs if drop_last else -(-len(ds) // bs)\n    for b in range(n): yield collate([ds[i] for i in idx[b * bs:(b + 1) * bs]])\ntry: np.stack(data[:4])\nexcept ValueError as e: print('默认 stack 变长 ->', 'ValueError:', str(e)[:40], '...')\nx, m = collate(data[:4]); print('pad 后 x.shape =', x.shape, ' 每行真实长度 =', m.sum(1), ' 原始 =', lengths[:4])\nprint('第 0 行:', x[0], ' mask:', m[0].astype(int))\ntot = lambda batches: sum(mk.size - mk.sum() for _, mk in batches)\nprint('按 batch pad 浪费格数 =', tot(loader(data, 4, False, False, 0)), ' vs 全局 pad 到 8 浪费 =', int((8 - lengths).sum()))\nprint('epoch0 顺序:', np.random.RandomState(0).permutation(10).tolist(), ' epoch1:', np.random.RandomState(1).permutation(10).tolist())\nprint('bs=4 drop_last=False batch 数 =', len(list(loader(data, 4, True, False, 0))), ' drop_last=True =', len(list(loader(data, 4, True, True, 0))))\nlm = np.random.randint(1, 20, size=(4, 5)); loss_all = (lm * 1.0).mean(); loss_mask = (lm * m[:, :5]).sum() / m[:, :5].sum()\nprint('忽略 mask 的 mean loss =', round(loss_all, 3), ' 用 mask 的 =', round(loss_mask, 3), '(pad 位置被算进去就偏)')", out:"默认 stack 变长 -> ValueError: all input arrays must have the same shap ...\npad 后 x.shape = (4, 8)  每行真实长度 = [7 8 3 6]  原始 = [7 8 3 6]\n第 0 行: [ 5  7 13  2  7  8 15  0]  mask: [1 1 1 1 1 1 1 0]\n按 batch pad 浪费格数 = 13  vs 全局 pad 到 8 浪费 = 21\nepoch0 顺序: [2, 8, 4, 9, 1, 6, 7, 3, 0, 5]  epoch1: [2, 9, 6, 4, 0, 3, 1, 7, 8, 5]\nbs=4 drop_last=False batch 数 = 3  drop_last=True = 2\n忽略 mask 的 mean loss = 9.9  用 mask 的 = 10.111 (pad 位置被算进去就偏)",
    note:"np.stack 报错对应第 3 步；collate 里 mask 那行对应第 4 步；浪费格数对比对应第 5 步；两个 epoch 不同排列对应第 6–7 步；drop_last 与 mask loss 对应第 8 步与第 4 步。" },
  contrast:[
    {vs:"直接把整个数据集变成一个大 tensor 切片", same:"都能喂 batch", diff:"大 tensor 要求所有样本等长且能全放进内存；DataLoader 逐条读取、按需拼装、多进程预取", when:"小而规整(如 MNIST)可以整块切；变长或读盘慢就 DataLoader"},
    {vs:"Dataset.__getitem__ 与 collate_fn", same:"都在\"取一个 batch\"的路径上", diff:"__getitem__ 处理单条(读文件、增强)，collate 处理跨样本(pad、stack)", when:"凡是需要看到其他样本才能决定的操作(max_len)只能放 collate"},
    {vs:"train shuffle 与 val 不 shuffle", same:"同一个 DataLoader 类", diff:"训练要打乱以保证梯度近似无偏；验证要固定顺序以对齐预测与标签", when:"val 用 shuffle=True 会让你的预测数组与标签错位"},
    {vs:"padding 与 packing (pack_padded_sequence)", same:"都处理变长", diff:"pad 用 mask 忽略垫位仍算它；packing 直接跳过不算", when:"RNN 用 packing 省算力；Transformer 只能 pad+mask"}
  ],
  ext:[
    {t:"mask 传进注意力后和因果掩码是同一个机制", go:'lm.causal_mask'},
    {t:"小 batch 尾巴对 BN 统计的影响", go:'pt.train_eval'},
    {t:"变长 pad 就是 numpy 广播失败时的手动对齐", go:'np.broadcast'}
  ]
},

'pt.train_eval': {
  layers:{
    alg:"BN train: y = γ(x−μ_B)/√(σ²_B+ε)+β，并 running ← (1−m)·running + m·batch。BN eval: 用 running_μ、running_σ²。Dropout train: y = x·Bernoulli(1−p)/(1−p)；eval: y = x。其余层两模式相同。",
    geo:"两块开关面板。训练时 dropout 随机灭一部分灯并把亮着的调亮 1/(1−p) 倍；BN 用当前这一批人的身高均值来标准化。推理时灯全亮不调亮；BN 用训练期间累计的\"人口身高\"来标准化。",
    comp:"model.train()/eval() 递归设置每个子模块的 self.training 布尔；只有 BN 与 Dropout 的 forward 读它。eval 不改 requires_grad、不省显存；省显存要另外 no_grad。"
  },
  proof:{
    from:"BN 与 Dropout 的前向定义；期望的线性性；一个样本的预测不应依赖同批其他样本",
    to:"为什么这两层在训练与推理时数学上必须不同，以及各自的差别具体是什么",
    steps:[
      ["BN 训练时用 batch 均值 μ_B、方差 σ²_B 标准化，目的是让每层输入分布稳定，便于优化","μ_B、σ²_B 是当前 batch 的统计量，是对总体统计的一个含噪估计，训练时这点噪声是可接受甚至有正则作用"],
      ["推理时若仍用 μ_B，则样本 x 的输出依赖同批其他样本；batch=1 时 σ²_B=0，输出变成 β(常数)","一个样本的方差按定义为 0，标准化后 x−μ_B=0；而且同一输入换个 batch 结果不同，预测不可复现"],
      ["所以推理必须用与 batch 无关的总体估计：训练过程中累计 running_μ、running_σ² 的 EMA","EMA 以 O(1) 内存跟踪训练分布的均值方差，训练结束时它就是总体统计的估计"],
      ["两个模式的前向公式因此不同：训练读 batch 统计并更新 running；推理只读 running 不更新","忘记 eval 会用 batch 统计(小 batch 时爆)；忘记 train 会用 running 且不更新(训练分布漂移跟不上)"],
      ["Dropout 训练时以概率 p 置零，剩下的乘 1/(1−p)：E[y] = (1−p)·x/(1−p) = x","期望的线性性；缩放 1/(1−p) 让训练时的期望输出与推理时相等，推理才能直接 y=x 不做任何事"],
      ["若训练不缩放，推理就得把权重乘 (1−p)(原始论文做法)；inverted dropout 把这一步搬到训练时，推理零开销","两种方式期望相同，选让推理更简单的那种"],
      ["Dropout 推理时若忘了 eval，每次前向输出随机不同，评估指标带噪声","训练模式下掩码每次重采样"],
      ["eval() 只切 self.training 标志，不碰 autograd；记账与否由 GradMode 决定，两者正交","一个是\"层算什么\"，一个是\"算的时候存不存中间量\"，不同的机制各自独立"]
    ],
    end:"train/eval 的差别只落在两层上：BN 是\"用哪套统计\"，Dropout 是\"缩放放哪边\"；两者都是为了让单样本推理确定、可复现且与训练期望一致。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nclass BN:\n    def __init__(s, d, mom=0.1): s.rm = np.zeros(d); s.rv = np.ones(d); s.mom = mom; s.training = True\n    def __call__(s, x):\n        if s.training:\n            mu, var = x.mean(0), x.var(0)\n            s.rm = (1 - s.mom) * s.rm + s.mom * mu; s.rv = (1 - s.mom) * s.rv + s.mom * var   # 更新 running\n        else: mu, var = s.rm, s.rv\n        return (x - mu) / np.sqrt(var + 1e-5)\ndef dropout(x, p, training):\n    if not training: return x\n    return x * (np.random.rand(*x.shape) > p) / (1 - p)      # inverted dropout\nbn = BN(2); X = np.random.randn(2000, 2) * np.array([3.0, 0.5]) + np.array([10.0, -2.0])\nfor i in range(0, 2000, 32): bn(X[i:i + 32])                  # 训练 ~60 步\nprint('running mean =', bn.rm.round(2), ' running var =', bn.rv.round(2), ' | 真值 mean [10,-2] var [9,0.25]')\nx1 = X[:1]; y_train = bn(x1); bn.training = False; y_eval = bn(x1)\nprint('batch=1 train 模式输出 =', y_train.round(3), '(方差 0 -> 全 0)   eval 模式输出 =', y_eval.round(3))\nsame = X[5:6]; bn.training = True; a = bn(np.vstack([same, X[10:20]]))[0]; b = bn(np.vstack([same, X[50:60]]))[0]\nprint('同一样本换 batch 伙伴 train 输出差 =', np.abs(a - b).max().round(3), '(依赖同批)')\nh = np.ones((100000, 1)) * 2.0\nprint('dropout p=0.5 train 输出均值 =', dropout(h, 0.5, True).mean().round(4), ' eval 输出 =', dropout(h, 0.5, False).mean(), '(期望一致)')\nprint('train 模式两次前向是否相同:', np.array_equal(dropout(h[:5], 0.5, True), dropout(h[:5], 0.5, True)))", out:"running mean = [ 9.97 -2.  ]  running var = [8.69 0.25]  | 真值 mean [10,-2] var [9,0.25]\nbatch=1 train 模式输出 = [[0. 0.]] (方差 0 -> 全 0)   eval 模式输出 = [[1.712 0.383]]\n同一样本换 batch 伙伴 train 输出差 = 0.581 (依赖同批)\ndropout p=0.5 train 输出均值 = 2.0007  eval 输出 = 2.0 (期望一致)\ntrain 模式两次前向是否相同: False",
    note:"BN 类 training 分支对应第 1、3、4 步；batch=1 输出全 0 对应第 2 步；换伙伴输出不同对应第 2 步的\"依赖同批\"；dropout 均值 2.0 对应第 5 步的期望一致；最后一行对应第 7 步。" },
  contrast:[
    {vs:"torch.no_grad()", same:"都是推理前要做的事", diff:"eval 改层的前向公式，no_grad 关梯度记账；eval 不省显存", when:"推理时两个都写；只写一个就各出一种 bug"},
    {vs:"LayerNorm / GroupNorm", same:"都做标准化", diff:"LN/GN 在单个样本内部沿特征归一化，不依赖 batch，因此没有 running 统计，train/eval 完全相同", when:"小 batch、变长序列、Transformer 用 LN；BN 只在大 batch CNN 里稳"},
    {vs:"原始 dropout (推理时权重乘 1−p)", same:"期望相同", diff:"inverted dropout 把缩放放训练侧，推理零改动", when:"现代框架全部是 inverted，看到旧论文公式别照抄"},
    {vs:"数据增强", same:"都是训练时注入随机性、推理时关掉", diff:"增强改输入，dropout 改中间激活；增强不是 Module 不受 eval 控制", when:"增强在 Dataset 里按 split 开关，别指望 model.eval() 关它"}
  ],
  ext:[
    {t:"eval 与梯度记账是两个正交开关", go:'pt.requires_grad'},
    {t:"BN 的 running 统计是均值方差的 EMA", go:'pr.variance'},
    {t:"小 batch 尾巴由 DataLoader 的 drop_last 决定", go:'pt.dataloader'}
  ]
},

'pt.device': {
  layers:{
    alg:"显存 ≈ 4·|θ|(参数) + 4·|θ|(梯度) + 8·|θ|(Adam m,v) + Σ_l B·d_l·4(激活) + 临时缓冲。前三项与 B 无关，激活项 ∝ B×深度，注意力还 ∝ L²。",
    geo:"一块卡里四层货架：参数、梯度、优化器状态三层高度固定；第四层\"激活\"随 batch 与序列长度伸缩，通常最高。OOM 时先压最高那层。",
    comp:".to(device) 对每个张量做一次主存→显存拷贝(走 PCIe，慢)；前向把每层输出留在显存等 backward 用；loss 不 .item() 直接 append 会把整张图钉在显存里；混合精度把激活的 4 字节变 2 字节。"
  },
  proof:{
    from:"反向传播需要前向中间量；float32 占 4 字节；Adam 维护 m、v 两个与参数同形的状态",
    to:"显存的四项构成、各自怎么随超参伸缩、以及 OOM 时的处理优先级",
    steps:[
      ["参数 θ 本身占 4|θ| 字节(float32)","每个标量 4 字节，是最底层的固定成本"],
      ["backward 要为每个 requires_grad 参数写一份 .grad，与 θ 同形 → 再 4|θ|","梯度与参数一一对应，形状必然相同"],
      ["Adam 的 m 与 v 各与 θ 同形 → 再 8|θ|；至此 16|θ| 字节，1e8 参数 = 1.6 GB，与 batch 无关","优化器状态按参数逐元素维护，SGD 无状态则省这 8|θ|"],
      ["VJP 需要前向中间量(Linear 存输入 x，ReLU 存掩码，注意力存 softmax 矩阵)，每层输出 (B, d_l) 都要留到 backward","不存就得重算(这正是 checkpointing 的做法：用算力换显存)"],
      ["所以激活显存 ≈ 4·B·Σ_l d_l，随 batch 线性增长；注意力的 softmax 矩阵是 (B, h, L, L)，随 L 平方增长","逐层求和是因为所有层的中间量要同时在显存里等 backward；L² 来自注意力矩阵的形状"],
      ["把 loss 张量 append 进 list 会持有它的 grad_fn，进而持有整张图的中间量，一步一张图，几十步 OOM","Python 的引用让图无法释放，.item() 取出纯标量就断开了引用"],
      ["OOM 优先级：降 batch(只压激活、不改数学) → 梯度累积(补回等效 batch) → 混合精度(激活减半) → checkpointing(用时间换) → 换小模型(改数学)","按\"改变结果的程度\"排序：前四项不改变模型与等效 batch，最后一项才改"]
    ],
    end:"显存 = 三层固定(16|θ| 字节 for Adam) + 一层随 B、L 伸缩的激活；因为伸缩层通常最高，所以 OOM 的第一反应是动 batch/序列长度而不是动模型。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nGB = 1024 ** 3\nn = int(2.5e7)\nprint('2500 万参数 Adam 固定显存 = %.0f MB (参数+梯度+m+v = 16 字节/参数)' % (n * 16 / 1e6))\nprint('1e8 参数 Adam 固定显存 = %.1f GB' % (1e8 * 16 / 1e9))\n# 一个 4 层 MLP 的激活显存，随 batch 线性\ndims = [1024, 4096, 4096, 4096, 10]\ndef act_bytes(B, dtype_bytes=4):\n    saved = 0; x = np.zeros((B, dims[0]), np.float32); saved += x.nbytes\n    for d_in, d_out in zip(dims[:-1], dims[1:]):\n        z = np.zeros((B, d_out), np.float32); saved += z.nbytes       # Linear 存输入, ReLU 存掩码(按同大小算)\n    return saved * dtype_bytes / 4\nparams = sum(a * b + b for a, b in zip(dims[:-1], dims[1:]))\nprint('MLP 参数 %.1f M -> 参数+梯度+Adam = %.0f MB (与 batch 无关)' % (params / 1e6, params * 16 / 1024 ** 2))\nfor B in (32, 256, 2048): print('  batch=%4d 激活 = %6.0f MB  fp16 = %6.0f MB' % (B, act_bytes(B) / 1024 ** 2, act_bytes(B, 2) / 1024 ** 2))\n# 注意力矩阵随 L 平方\nfor L in (1024, 4096, 16384): print('  注意力 softmax 矩阵 B=8 h=32 L=%5d: %.1f GB' % (L, 8 * 32 * L * L * 4 / GB))\n# append(loss) vs append(loss.item())\nclass Loss:\n    def __init__(s, graph): s.graph = graph; s.v = 0.5\n    def item(s): return s.v\ngraph_held = [Loss(np.zeros((1024, 1024), np.float32)) for _ in range(50)]\nscalars = [Loss(np.zeros((1024, 1024), np.float32)).item() for _ in range(50)]\nprint('append(loss) 50 步钉住 = %d MB 图; append(loss.item()) = %d 字节' % (sum(l.graph.nbytes for l in graph_held) / 1024 ** 2, 8 * len(scalars)))", out:"2500 万参数 Adam 固定显存 = 400 MB (参数+梯度+m+v = 16 字节/参数)\n1e8 参数 Adam 固定显存 = 1.6 GB\nMLP 参数 37.8 M -> 参数+梯度+Adam = 577 MB (与 batch 无关)\n  batch=  32 激活 =      2 MB  fp16 =      1 MB\n  batch= 256 激活 =     13 MB  fp16 =      7 MB\n  batch=2048 激活 =    104 MB  fp16 =     52 MB\n  注意力 softmax 矩阵 B=8 h=32 L= 1024: 1.0 GB\n  注意力 softmax 矩阵 B=8 h=32 L= 4096: 16.0 GB\n  注意力 softmax 矩阵 B=8 h=32 L=16384: 256.0 GB\nappend(loss) 50 步钉住 = 200 MB 图; append(loss.item()) = 400 字节",
    note:"前两行是第 1–3 步的 16 字节/参数；act_bytes 随 B 线性对应第 4–5 步；注意力 L² 那三行对应第 5 步；最后 graph_held 对应第 6 步的 append(loss) 陷阱。" },
  contrast:[
    {vs:"参数量 (model size)", same:"都用\"多少 M/B\"描述", diff:"参数量只决定固定的 16|θ| 那部分；激活显存与参数量无关而与 B、L、深度有关", when:"报 OOM 时别先算参数量，先看 batch 与序列长度"},
    {vs:"CPU 内存", same:"都是有限的存储", diff:"显存不能换页到磁盘，满了就是 OOM 立即报错；主存会先变慢再崩", when:"大数据集放主存分批 .to(device)，别整个搬上卡"},
    {vs:"混合精度 (amp)", same:"都是省显存手段", diff:"amp 只把激活与前向权重副本减半，Adam 状态与主权重仍是 fp32", when:"amp 能省的上限约是激活那一层的一半"},
    {vs:"梯度 checkpointing", same:"都是为了更大 batch", diff:"checkpointing 不存中间激活，backward 时重算，用 ~30% 算力换掉大部分激活显存", when:"降 batch 已到 1 还 OOM 时用"}
  ],
  ext:[
    {t:"激活减半的办法：混合精度", go:'pt.amp'},
    {t:"不记账就不存激活，这是 no_grad 省显存的原因", go:'pt.requires_grad'},
    {t:"数量级估算先行：1e8 参数 × 16 字节", go:'ns.magnitude'}
  ]
},

'pt.save_load': {
  layers:{
    alg:"state_dict: OrderedDict[str → Tensor]，键是 Module 树上的路径名(如 backbone.layer1.0.weight)。load_state_dict(strict=True) 要求 keys(ckpt) == keys(model)；差集分别报 missing / unexpected。",
    geo:"一本字典：每一页写着一个层的地址和它的权重方块。加载 = 按地址把方块塞回同结构的空房子。地址体系变了(改类名、加 module. 前缀)方块就找不到门。",
    comp:"torch.save(obj) 用 pickle 序列化：存整个 model 时会存类的 import 路径，重构后 unpickle 找不到类；存 state_dict 只序列化字符串与张量数据，与代码无关。DataParallel 包一层 module，所以键全带 module. 前缀。"
  },
  proof:{
    from:"pickle 的语义(按 import 路径重建对象)；Module 树摊平成名字→张量的映射；恢复训练需要重建全部状态",
    to:"为什么存 state_dict 而不存模型对象，strict 的意义，以及恢复训练要存哪些东西",
    steps:[
      ["pickle 序列化对象时只存\"类在哪个模块的哪个名字\"+ 实例的 __dict__，不存类的代码","pickle 的设计假设加载方有同样的代码，因此只存引用"],
      ["所以 torch.save(model) 在加载时要能 import 到同名类；文件挪位置、类改名、重构目录都会 ModuleNotFoundError","按路径找类是 unpickle 的唯一机制，没有备选"],
      ["state_dict 是 Module 树的摊平：路径字符串 → 张量；它只含名字与数据，不含任何类引用","摊平递归 _modules 与 _parameters/_buffers，与 pt.module 的 parameters() 同源"],
      ["因此 state_dict 跨代码版本可加载，只要模型结构(键与形状)对得上","加载只做\"按名字塞张量\"，不依赖类的定义位置"],
      ["load_state_dict(strict=True) 检查 keys 双向差集：ckpt 有模型没有 → unexpected；模型有 ckpt 没有 → missing","严格检查能立即暴露结构不一致；strict=False 会静默跳过，只在有意做部分加载(迁移学习)时用"],
      ["DataParallel/DDP 把模型包成 .module 子模块，摊平后所有键多一个 module. 前缀，单卡模型的键没有它 → 全部 unexpected + 全部 missing","前缀来自包装层在树上多了一级，键是路径名所以逐级拼接"],
      ["恢复训练 = 恢复优化器状态(Adam 的 m、v、step)、调度器、epoch、RNG 状态；只存权重会让 Adam 从 m=v=0 重启，loss 跳一下","Adam 更新依赖历史 EMA，丢掉它等于换了优化器状态；偏差校正也从 t=1 重来"]
    ],
    end:"state_dict 把\"代码\"和\"权重\"解耦，pickle 整模型把两者绑死；strict 是结构一致性的断言；恢复训练要存的是完整训练状态而不只是权重。"
  },
  scratch:{ lang:'python', code:"import numpy as np, io, pickle\nnp.random.seed(0)\ndef linear(i, o): return {'weight': np.random.randn(o, i).astype(np.float32), 'bias': np.zeros(o, np.float32)}\nmodel = {'backbone.fc1': linear(8, 16), 'backbone.fc2': linear(16, 16), 'head': linear(16, 3)}\nstate_dict = {f'{m}.{k}': v for m, d in model.items() for k, v in d.items()}\nprint('state_dict keys:', list(state_dict)[:3], '... 共', len(state_dict))\nbuf = io.BytesIO(); np.savez(buf, **state_dict); buf.seek(0); ck = dict(np.load(buf))  # 内存里模拟 torch.save/load\nprint('round-trip 全部相等:', all(np.array_equal(ck[k], state_dict[k]) for k in state_dict))\ndef load_state_dict(model_keys, ckpt, strict=True):\n    missing = sorted(set(model_keys) - set(ckpt)); unexpected = sorted(set(ckpt) - set(model_keys))\n    if strict and (missing or unexpected): raise RuntimeError(f'missing={missing} unexpected={unexpected}')\n    return len(set(model_keys) & set(ckpt))\ndp_ckpt = {'module.' + k: v for k, v in ck.items()}                  # DataParallel 存出来的\ntry: load_state_dict(list(state_dict), dp_ckpt)\nexcept RuntimeError as e: print('单卡加载 DP 权重 ->', str(e)[:70], '...')\nstripped = {k[len('module.'):]: v for k, v in dp_ckpt.items()}\nprint('剥掉 module. 前缀后加载到的张量数 =', load_state_dict(list(state_dict), stripped))\nnew_model_keys = [k for k in state_dict if not k.startswith('head')] + ['head2.weight', 'head2.bias']\nprint('换新 head, strict=False 加载到 =', load_state_dict(new_model_keys, ck, strict=False), '个 (只加载骨干)')\nclass OldNet: pass\nblob = pickle.dumps(OldNet()); del OldNet                      # 模拟\"存整个模型后类被重构掉\"\ntry: pickle.loads(blob)\nexcept Exception as e: print('pickle 整个模型, 类没了 ->', type(e).__name__, ':', str(e)[:45])\nopt_state = {'step': 1200, 'm': np.random.randn(3), 'v': np.abs(np.random.randn(3))}\nprint('恢复训练还要存:', sorted(['model', 'opt', 'scheduler', 'epoch', 'rng']), '| 只存权重时 Adam step 从', opt_state['step'], '退回 1')", out:"state_dict keys: ['backbone.fc1.weight', 'backbone.fc1.bias', 'backbone.fc2.weight'] ... 共 6\nround-trip 全部相等: True\n单卡加载 DP 权重 -> missing=['backbone.fc1.bias', 'backbone.fc1.weight', 'backbone.fc2.bia ...\n剥掉 module. 前缀后加载到的张量数 = 6\n换新 head, strict=False 加载到 = 4 个 (只加载骨干)\npickle 整个模型, 类没了 -> AttributeError : Can't get attribute 'OldNet' on <module '__ma\n恢复训练还要存: ['epoch', 'model', 'opt', 'rng', 'scheduler'] | 只存权重时 Adam step 从 1200 退回 1",
    note:"state_dict 的键拼接对应第 3 步；load_state_dict 的双向差集对应第 5 步；module. 前缀报错与剥前缀对应第 6 步；pickle 类消失对应第 1–2 步；最后一行对应第 7 步。" },
  contrast:[
    {vs:"torch.save(model) 存整个对象", same:"都能把权重落盘", diff:"整对象 pickle 绑定类的 import 路径，重构即失效；state_dict 只有名字与数据", when:"永远存 state_dict；整对象只在一次性脚本里偷懒"},
    {vs:"ONNX / TorchScript 导出", same:"都产生一个可加载的模型文件", diff:"它们连计算图一起序列化，可脱离 Python 运行；state_dict 需要原模型代码来重建结构", when:"部署到其他运行时用导出；继续训练/研究用 state_dict"},
    {vs:"strict=True 与 strict=False", same:"同一个加载函数", diff:"True 把键不一致当错误；False 静默取交集", when:"默认 True；只有明确知道要部分加载(换 head)才 False，且加载后打印 missing 列表"},
    {vs:"只存 model 与存完整 checkpoint", same:"都含权重", diff:"完整 checkpoint 还含优化器/调度器/epoch/RNG，能无缝续训", when:"任何可能中断的长训练存完整 checkpoint"}
  ],
  ext:[
    {t:"state_dict 的键就是 Module 树摊平后的路径名", go:'pt.module'},
    {t:"优化器状态 m、v 为什么必须一起存", go:'pt.optimizer'},
    {t:"名字→张量的映射本质是一个 dict", go:'py.list_dict'}
  ]
},

'pt.amp': {
  layers:{
    alg:"fp16: 1 符号 + 5 指数 + 10 尾数，最小正规数 2⁻¹⁴ ≈ 6.1e-5，次正规到 2⁻²⁴ ≈ 6e-8，最大 65504。loss scaling: backward(S·L) 得 S·g，step 前除回 S；只要 S·g 落在可表示区间就不下溢。",
    geo:"fp16 是一把刻度只到 6e-5 的尺子，比它短的梯度量不出来读作 0。loss scaling 把整幅图先放大 S 倍再量，量完缩回去；bf16 是另一把尺子：刻度粗但量程与 fp32 一样长。",
    comp:"autocast 把 GEMM/卷积用 fp16 算(Tensor Core 快 2-8 倍、激活显存减半)，把 softmax/log/loss 等易溢出的算子留 fp32。GradScaler 维护 S：梯度出现 inf/NaN 就跳过这步并把 S 减半，连续正常 N 步就把 S 翻倍。主权重永远 fp32。"
  },
  proof:{
    from:"浮点数 = (−1)^s · 1.m · 2^e 的表示；fp16 指数位 5、bf16 指数位 8；梯度的典型量级",
    to:"为什么 fp16 训练必须 loss scaling，为什么 bf16 通常不必，以及主权重为什么留 fp32",
    steps:[
      ["fp16 指数 5 位，偏置 15，正规数指数范围 [−14, 15]，所以最小正规数 2⁻¹⁴ ≈ 6.1e-5，最大约 65504","指数位数直接决定量程；这是格式定义"],
      ["深网里激活梯度常在 1e-6 ~ 1e-8：比 6.1e-5 小的数进入次正规区丢精度，比 6e-8 小的直接变 0","低于最小可表示正数就四舍五入到 0，这叫下溢"],
      ["梯度变 0 的参数这一步不更新，且经过更多层连乘后更多梯度归零 → 训练停滞而不报错","0 乘任何数还是 0，下溢会沿反向传播链扩散"],
      ["链式法则是线性的：∂(S·L)/∂θ = S·∂L/∂θ。把 loss 乘 S 后所有梯度同乘 S，1e-8 × 1024 ≈ 1e-5 回到可表示区","标量乘法与求导可交换；乘常数不改变梯度方向，只改变量纲"],
      ["更新前 g = (S·g)/S 除回来，用 fp32 做这一步不损失","除法在 fp32 里进行，S·g 已经是安全量级"],
      ["S 太大会让大梯度溢出成 inf；所以 GradScaler 动态调整：见到 inf/NaN 就跳过并 S/=2，连续稳定就 S×=2","上界 65504 与下界 6e-8 之间只有约 12 个数量级，梯度分布会随训练漂移，固定 S 不可能一直合适"],
      ["bf16 指数 8 位与 fp32 相同，量程 ~1e-38 到 3e38，1e-7 的梯度直接可表示，不需要 scaling；代价是尾数只 7 位，精度约 3 位十进制","量程由指数位决定，精度由尾数位决定；bf16 用精度换量程"],
      ["主权重留 fp32：更新量 lr·g 常小于权重的 fp16 舍入间隔(1.0 附近间隔约 1e-3)，用 fp16 累加会把更新吃掉","浮点相邻数间隔 ∝ 数值大小 × 2^(−尾数位)，小更新加到大权重上会被舍入抵消"]
    ],
    end:"fp16 快是因为算得粗，粗的代价是量程短；loss scaling 用一次乘除把梯度搬进量程，主权重 fp32 保证小更新不被舍入吃掉；bf16 靠加宽指数把 scaling 省掉。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nfi = np.finfo(np.float16)\nprint('fp16 最小正规 = %.3g  最小次正规 = %.3g  最大 = %g  尾数位 = %d' % (fi.tiny, fi.smallest_subnormal, fi.max, fi.nmant))\ng = np.array([1e-8, 3e-6, 5e-5, 2e-3], np.float32)\nfmt = lambda a: '[' + ' '.join('%.3g' % v for v in a) + ']'\nprint('梯度 fp32 :', fmt(g))\nprint('直接转 fp16:', fmt(g.astype(np.float16)), ' <- 1e-8 下溢成 0, 3e-6 落在次正规区(精度掉)')\nS = 1024.0\nscaled = (g * S).astype(np.float16)\nprint('loss scaling x%d 后 fp16:' % S, fmt(scaled), ' 除回 fp32:', fmt(scaled.astype(np.float32) / S))\nprint('相对误差 =', fmt(np.abs(scaled.astype(np.float32) / S - g) / g), '(全部回到正规区)')\nbig = np.float32(70.0 * S)\nprint('S 太大: 70*1024 转 fp16 =', np.float16(big), ' -> GradScaler 见 inf 跳过这步并把 S 减半')\n# 主权重为什么留 fp32: 小更新被 fp16 舍入吃掉\nw16 = np.float16(1.0); w32 = np.float32(1.0); upd = 1e-4\nfor _ in range(100): w16 = np.float16(w16 - upd); w32 = np.float32(w32 - upd)\nprint('fp16 权重 1.0 减 100 次 1e-4 =', w16, ' (间隔 %.3g 吃掉更新)  fp32 =' % np.spacing(np.float16(1.0)), round(float(w32), 4))\n# 累加也要 fp32\nacc16 = np.float16(0); acc32 = np.float32(0)\nfor _ in range(10000): acc16 = np.float16(acc16 + np.float16(1e-4)); acc32 = np.float32(acc32 + np.float32(1e-4))\nprint('fp16 逐项累加 10000 个 1e-4 =', float(acc16), ' fp32 累加 =', round(float(acc32), 4), '(累加必须 fp32)')\n# bf16 手工模拟: 8 位指数, 7 位尾数 -> 量程同 fp32\ndef to_bf16(x): b = np.asarray(x, np.float32).view(np.uint32); return ((b + 0x8000) & 0xFFFF0000).view(np.float32)\nprint('bf16 表示 1e-7 =', to_bf16(1e-7), '(不下溢)  bf16 表示 1.2345678 =', to_bf16(1.2345678), '(精度只剩约 3 位)')", out:"fp16 最小正规 = 6.1e-05  最小次正规 = 5.96e-08  最大 = 65504  尾数位 = 10\n梯度 fp32 : [1e-08 3e-06 5e-05 0.002]\n直接转 fp16: [0 2.98e-06 5e-05 0.002]  <- 1e-8 下溢成 0, 3e-6 落在次正规区(精度掉)\nloss scaling x1024 后 fp16: [1.03e-05 0.00307 0.0512 2.05]  除回 fp32: [1e-08 3e-06 5e-05 0.002]\n相对误差 = [0.00117 0.00024 0.000166 0.000404] (全部回到正规区)\nS 太大: 70*1024 转 fp16 = inf  -> GradScaler 见 inf 跳过这步并把 S 减半\nfp16 权重 1.0 减 100 次 1e-4 = 1.0  (间隔 0.000977 吃掉更新)  fp32 = 0.99\nfp16 逐项累加 10000 个 1e-4 = 0.25  fp32 累加 = 1.0001 (累加必须 fp32)\nbf16 表示 1e-7 = 1.0011718e-07 (不下溢)  bf16 表示 1.2345678 = 1.234375 (精度只剩约 3 位)",
    note:"finfo 那行是第 1 步；直接转 fp16 下溢(1e-8→0)对应第 2 步；乘 1024 再除回对应第 4–5 步；70*1024 溢出对应第 6 步；w16 减 100 次不动对应第 8 步；to_bf16 对应第 7 步。" },
  contrast:[
    {vs:"bf16", same:"都是 16 位、都能省一半激活显存与带宽", diff:"fp16 尾数 10 位量程短(要 scaling)，bf16 尾数 7 位量程同 fp32(通常不要 scaling)", when:"Ampere 及以上优先 bf16；老卡或推理精度敏感用 fp16"},
    {vs:"纯 fp16 训练", same:"都用 fp16 做 GEMM", diff:"混合精度保留 fp32 主权重与 fp32 累加，纯 fp16 会让小更新被舍入吃掉", when:"永远用混合而不是纯半精度"},
    {vs:"int8 量化", same:"都是降精度提速", diff:"量化是推理时把权重映射到整数格点，不做梯度；amp 是训练时的浮点格式切换", when:"训练用 amp，部署用量化"},
    {vs:"学习率太小导致的\"不动\"", same:"症状都是 loss 停滞", diff:"下溢是梯度真的成了 0，lr 小是梯度在但步子小", when:"开 amp 后停滞先查 scaler 的 scale 值与梯度是否为 0"}
  ],
  ext:[
    {t:"激活占显存大头，所以 amp 省的主要是那一层", go:'pt.device'},
    {t:"浮点量程与舍入间隔的通用规律", go:'np.overflow'},
    {t:"梯度乘常数不变方向：链式法则的线性性", go:'ca.chain_rule'}
  ]
},

'pt.debug_shape': {
  layers:{
    alg:"任何二元张量算子的前置条件是三元组 (shape 可广播/内维相等, device 相同, dtype 相同或可提升)。报错信息就是这三元组中失败的那一项的两个操作数属性。",
    geo:"三个筛子串成一列：shape → device → dtype。张量对流过去，卡在哪个筛子就在那个筛子前打印两边的三元组。",
    comp:"定位不需要读源码：在出错行前 print(x.shape, x.device, x.dtype) 与另一操作数比对。matmul 看内维；广播看从右对齐的每一维是否相等或为 1；CrossEntropy 看 logits (N,C) float 与 target (N,) long。"
  },
  proof:{
    from:"张量算子的定义域：矩阵乘的形状条件、numpy 广播规则、同设备同类型要求",
    to:"为什么九成报错只有三类，以及为什么每类都能靠打印三元组定位",
    steps:[
      ["一个张量算子 f(a, b) 的输入合法性只依赖 a、b 的元数据(shape/device/dtype)，与数值无关","算子在启动 kernel 前只检查元数据；数值问题(NaN)不会在这一层报错"],
      ["元数据恰好三项，所以\"输入不合法\"的报错恰好三类","没有第四个元数据字段参与合法性检查(stride 只影响性能)"],
      ["shape 类：matmul 要求 (n,k)@(k,m) 的 k 相等；逐元素运算要求从右对齐的每一维相等或为 1(广播)","矩阵乘的定义是对内维求和，长度必须一致；广播是把 1 维复制到对方长度，其他情况无定义"],
      ["device 类：CPU 与 CUDA 是两套地址空间，kernel 不能跨读","这是硬件事实；修法只有把其中一个 .to 过去，且每个 batch 都要搬"],
      ["dtype 类：整数与浮点混算多数能提升，但索引类算子(CrossEntropy 的 target、embedding 的输入)必须是 long；float64 输入遇到 float32 权重会报 mismatch","索引要做数组下标，必须是整数；numpy 默认 float64 经 from_numpy 原样带入"],
      ["报错信息直接包含两个操作数的失败属性(如 mat1 (32x128) and mat2 (64x10))，所以打印三元组即可对上","框架在检查失败时把两边的元数据格式化进消息，这是可读性设计"],
      ["loss 为 NaN 不属于这三类：它是数值问题，要沿数据流从输入往前查 isnan、lr、log/除法里的 0","元数据全部合法但数值溢出，不同的故障层用不同的排查法"]
    ],
    end:"张量算子的合法性只看三个元数据，所以报错只有三类，而每类报错都把两边的元数据印给了你；NaN 是另一层的问题。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nclass T:                                                # 只带三元组的最小张量\n    def __init__(s, a, device='cpu'): s.a = np.asarray(a); s.device = device\n    shape = property(lambda s: s.a.shape); dtype = property(lambda s: s.a.dtype)\n    def check(s, o, op):\n        if s.device != o.device: raise RuntimeError(f'Expected all tensors to be on the same device, but found {s.device} and {o.device}')\n        if op == 'matmul' and s.shape[-1] != o.shape[0]: raise RuntimeError(f'mat1 and mat2 shapes cannot be multiplied ({s.shape[0]}x{s.shape[1]} and {o.shape[0]}x{o.shape[1]})')\n        if op == 'index' and o.dtype.kind != 'i': raise RuntimeError(f'expected scalar type Long but found {o.dtype}')\n    def __matmul__(s, o): s.check(o, 'matmul'); return T(s.a @ o.a, s.device)\n    def gather_ce(s, target): s.check(target, 'index'); p = np.exp(s.a - s.a.max(1, keepdims=True)); p /= p.sum(1, keepdims=True); return -np.log(p[np.arange(len(p)), target.a]).mean()\ndef sift(fn, label):\n    try: r = fn(); print(f'{label}: ok ->', r if np.ndim(r) == 0 else r.shape)\n    except RuntimeError as e: print(f'{label}: RuntimeError:', e)\nx = T(np.random.randn(32, 128)); W_bad = T(np.random.randn(64, 10)); W_ok = T(np.random.randn(128, 10))\nsift(lambda: x @ W_bad, '筛1 shape ')\nsift(lambda: x @ T(W_ok.a, 'cuda:0'), '筛2 device')\nlogits = x @ W_ok; y_onehot = T(np.eye(10)[np.random.randint(0, 10, 32)].astype(np.float32)); y_idx = T(np.random.randint(0, 10, 32))\nsift(lambda: logits.gather_ce(T(y_onehot.a.argmax(1).astype(np.float32))), '筛3 dtype ')\nsift(lambda: round(logits.gather_ce(y_idx), 4), '三筛全过  ')\nprint('打印三元组即可定位:', x.shape, x.device, x.dtype, '|', W_bad.shape, W_bad.device, W_bad.dtype)\nprint('广播 (32,1)+(1,10) ->', (np.zeros((32, 1)) + np.zeros((1, 10))).shape, ' (32,10)+(32,) ->', end=' ')\ntry: np.zeros((32, 10)) + np.zeros(32)\nexcept ValueError as e: print('ValueError (从右对齐 10 vs 32)')\nz = np.log(np.array([1.0, 0.0])); print('NaN/inf 不是三筛问题: log([1,0]) =', z, ' isnan/isinf 沿数据流往前查')", out:"筛1 shape : RuntimeError: mat1 and mat2 shapes cannot be multiplied (32x128 and 64x10)\n筛2 device: RuntimeError: Expected all tensors to be on the same device, but found cpu and cuda:0\n筛3 dtype : RuntimeError: expected scalar type Long but found float32\n三筛全过  : ok -> 18.7037\n打印三元组即可定位: (32, 128) cpu float64 | (64, 10) cpu float64\n广播 (32,1)+(1,10) -> (32, 10)  (32,10)+(32,) -> ValueError (从右对齐 10 vs 32)\nNaN/inf 不是三筛问题: log([1,0]) = [  0. -inf]  isnan/isinf 沿数据流往前查",
    note:"class T 的三个 check 分支对应第 3–5 步；四次 sift 依次演示三类报错与全过；打印三元组那行对应第 6 步；最后 log(0) 对应第 7 步的数值问题另算。" },
  contrast:[
    {vs:"数值错误 (NaN / inf)", same:"都让训练失败", diff:"三类报错在算子启动前由元数据检查抛出；NaN 是数值溢出，元数据全合法", when:"看到 RuntimeError 查三元组；看到 loss=nan 查数据与 lr"},
    {vs:"numpy 广播报错", same:"规则一样：从右对齐，相等或为 1", diff:"PyTorch 多了 device 与 requires_grad 两类 numpy 没有的失败", when:"形状问题先在 numpy 里复现最快"},
    {vs:"逻辑错误 (形状合法但语义错)", same:"都可能来自 reshape/transpose", diff:"(B,C,H,W) 误 reshape 成 (B,H,W,C) 不报错但结果全错", when:"合法但指标很差时用 permute 而不是 reshape/view 改轴序"},
    {vs:"CrossEntropyLoss 与 NLLLoss / BCE", same:"都是分类损失", diff:"CE 收 raw logits (N,C) + long 索引；NLL 收 log_softmax 后的；BCE 收 (N,) 概率与 float 标签", when:"多分类用 CE 且别提前 softmax；二分类用 BCEWithLogits"}
  ],
  ext:[
    {t:"device 那一筛的根源", go:'pt.device'},
    {t:"dtype 与共享内存问题从 tensor 的来源开始查", go:'pt.tensor'},
    {t:"shape 筛的数学就是矩阵乘法的内维条件", go:'la.matmul_shape'},
    {t:"广播规则与 numpy 完全一致", go:'np.broadcast'}
  ]
},

});