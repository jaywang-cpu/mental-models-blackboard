// 数理宇宙 v3 · 推导层：lm 语言模型大陆（10 节点）
// 只 push 到 window.DERIVE，不改动 v1/v2 任何文件。scratch 全部用 python3 + numpy 实跑，out 为真实输出。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {
'lm.tokenization': {
  layers:{
    alg:"BPE: 从字符词表出发, 反复统计语料中最高频的相邻符号对 (a,b), 把它合并成新符号 ab 加入词表, 直到词表达到目标大小; 编码新词时按同样顺序应用合并规则。",
    geo:"一句话被剪成长短不一的碎片: 高频词是一整块, 生僻词碎成好几片, 数字被切在任意位置。模型看到的世界由这些碎片拼成, 碎片内部对它是不透明的。",
    comp:"训练: 每轮扫一遍语料数对频, 合并一次, O(词表大小 × 语料长度); 编码: 把词拆成字符, 顺序应用每条合并规则。token 数决定上下文占用、价格、KV 显存。"
  },
  proof:{
    from:"词表必须有限 (softmax 输出维数); 语言的词形无限; 序列越长注意力越贵",
    to:"为什么 BPE 是 '给定词表大小下压缩序列长度' 的贪心算法, 以及它为什么让模型在字符级任务和数字上吃亏",
    steps:[
      ["字符级词表最小 (几百) 但序列最长; 词级词表能覆盖常见词但对新词/拼写变体无能为力 (OOV)","两个极端各占一头: 词表大小 vs 序列长度, 必须折中"],
      ["BPE 的目标: 固定词表大小 V, 让语料总 token 数最少; 每次合并最高频的相邻对, 语料总长减少的量恰好等于该对的频次","合并一对出现 c 次的符号, 序列长度减 c; 贪心选最大 c 就是每步最大化压缩量 (模拟: 57 → 25 个 token)"],
      ["合并规则按训练时的顺序保存, 编码任意新词就是顺序重放这些规则, 所以任何词都能被切开 (最坏退化成字符), 不再有 OOV","字符是基底, 合并只是可选的缩写; 未见过的组合 (zzz) 回落到字符"],
      ["合并只看频率不看语义或词法, 所以 token 边界与词素边界只是经常碰巧重合: lowest → low + est 合理, newly → 6 个碎片","目标函数里没有任何语言学项; 频率高的子串恰好常是词干和词缀"],
      ["数字: 高频数 (2024, 100) 被合成整块, 长数被切成不等长碎片 (1002024 → 1|0|02|024), 同一位数在不同数里属于不同 token, 逐位算术对模型不是逐位","模型学的是 token 间的统计关系; 位值对齐在 token 层面不存在"],
      ["字符级任务 (数字母、反转、拼写) 的原子是字符, 而模型的原子是 token; lowest 在模型眼里是 1 个原子 low 加一个后缀, 它从未 '看见' 6 个字母","输入层就把字符抹掉了; 除非模型从数据里学会每个 token 的拼写, 否则无从计数"],
      ["生物序列: 通用 BPE 会把 MKTAY 合成 KT、AY 之类的块, 位点编号对不上; 蛋白语言模型按单残基切, 才能做位点级预测","序列任务的原子是残基; tokenizer 必须与任务原子一致"]
    ],
    end:"tokenizer 是针对训练语料拟合出来的压缩字典; 它决定模型的感官原子, 也决定了模型天然的盲区。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nfrom collections import Counter\ncorpus = 'low lower lowest newer newest wider widest low low lower'.split()\ndef merges(words, n):\n    rules = []\n    for _ in range(n):\n        pairs = Counter()\n        for w, c in words.items():\n            for a, b in zip(w, w[1:]): pairs[(a, b)] += c\n        if not pairs: break\n        best = max(sorted(pairs), key=lambda k: pairs[k]); rules.append(best)      # 最高频相邻对\n        new = {}\n        for w, c in words.items():\n            out, i = [], 0\n            while i < len(w):\n                if i < len(w) - 1 and (w[i], w[i+1]) == best: out.append(w[i] + w[i+1]); i += 2\n                else: out.append(w[i]); i += 1\n            new[tuple(out)] = c\n        words = new\n    return rules, words\ndef encode(word, rules):\n    w = list(word) + ['</w>']\n    for a, b in rules:\n        out, i = [], 0\n        while i < len(w):\n            if i < len(w) - 1 and w[i] == a and w[i+1] == b: out.append(a + b); i += 2\n            else: out.append(w[i]); i += 1\n        w = out\n    return w\nwords = Counter(tuple(w) + ('</w>',) for w in corpus)\nrules, seg = merges(words, 8)\nprint('8 条合并规则:', [a + '+' + b for a, b in rules])\nprint('词表大小: 字符 %d -> 合并后 %d;  语料总 token: %d -> %d' % (len({c for w in words for c in w}), len({t for w in seg for t in w}), sum(len(w)*c for w, c in words.items()), sum(len(w)*c for w, c in seg.items())))\nfor w in ('lowest', 'slowest', 'newly', 'zzz'): print('%-8s -> %s  (%d token)' % (w, encode(w, rules), len(encode(w, rules))))\n# 数字: 高频数被合成整块, 长数被切成不等长碎片 -> \"逐位\"算术在模型眼里不是逐位\nrules_d, _ = merges(Counter({tuple('2024') + ('</w>',): 50, tuple('100') + ('</w>',): 40, tuple('365') + ('</w>',): 30, tuple('17') + ('</w>',): 20}), 6)\nfor s in ('2024', '100', '1002024', '3651', '20241'): print('%-8s -> %s' % (s, encode(s, rules_d)))\n# 字符级任务: 模型看到的原子是 token, 数字母要先拆\nprint('\"lowest\" 的字母数 = %d, 但模型看到 %d 个原子: %s' % (len('lowest'), len(encode('lowest', rules)) - 1, encode('lowest', rules)[:-1]))\n# 蛋白序列: 通用 BPE 会把残基合并, 位点编号全乱; 蛋白模型按单残基切\nprot = 'MKTAYIAKQR'\nrules_p, _ = merges(Counter({tuple('MKTAY') + ('</w>',): 30, tuple('IAKQ') + ('</w>',): 20}), 4)\nprint('蛋白 %s: 通用 BPE -> %s | 单残基 -> %s' % (prot, encode(prot, rules_p)[:-1], list(prot)))", out:"8 条合并规则: ['l+o', 'lo+w', 'e+r', 'er+</w>', 'e+s', 'es+t', 'est+</w>', 'low+</w>']\n词表大小: 字符 11 -> 合并后 9;  语料总 token: 57 -> 25\nlowest   -> ['low', 'est</w>']  (2 token)\nslowest  -> ['s', 'low', 'est</w>']  (3 token)\nnewly    -> ['n', 'e', 'w', 'l', 'y', '</w>']  (6 token)\nzzz      -> ['z', 'z', 'z', '</w>']  (4 token)\n2024     -> ['2024</w>']\n100      -> ['1', '00</w>']\n1002024  -> ['1', '0', '02', '024</w>']\n3651     -> ['3', '6', '5', '1', '</w>']\n20241    -> ['2', '024', '1', '</w>']\n\"lowest\" 的字母数 = 6, 但模型看到 1 个原子: ['low']\n蛋白 MKTAYIAKQR: 通用 BPE -> ['M', 'KT', 'AY', 'I', 'A', 'K', 'Q', 'R'] | 单残基 -> ['M', 'K', 'T', 'A', 'Y', 'I', 'A', 'K', 'Q', 'R']",
    note:"merges() 的最高频对合并对应第 2 步, 57→25 是压缩量; encode() 顺序重放规则对应第 3 步 (zzz 回落到字符); 数字五行对应第 5 步; lowest 6 字母 vs 1 原子对应第 6 步; 蛋白一行是第 7 步。" },
  contrast:[
    {vs:"字符级 / 字节级模型", same:"都能表示任意字符串", diff:"字符级序列长 4 倍, 注意力贵 16 倍; BPE 短但有盲区", when:"拼写与字符操作用字符级或让模型先拆字符; 常规文本用 BPE"},
    {vs:"WordPiece / Unigram (SentencePiece)", same:"都是子词切分", diff:"WordPiece 按似然增益选合并, Unigram 从大词表往下删; BPE 按频率合并", when:"效果相近; 用哪个由模型决定, 关键是数 token 必须用该模型自己的 tokenizer"},
    {vs:"one-hot 序列编码 (bm.sequence)", same:"都是 '离散符号 → 模型输入' 的第一步", diff:"生物序列字母表小且固定, 通常不切子词; 自然语言必须切", when:"蛋白/DNA 用单残基或 k-mer; 文本用 BPE"},
    {vs:"Huffman 编码", same:"都是按频率给高频串短码", diff:"Huffman 给定符号求最优前缀码; BPE 在造符号本身", when:"理解 BPE 时把它看成 '压缩字典', 但它的目标不是比特数而是 token 数"}
  ],
  ext:[
    {t:"token 变向量的下一步", go:"lm.embedding"},
    {t:"token 数决定的上下文预算", go:"lm.context_window"},
    {t:"按频率造短码的信息论根源", go:"it.code_length"},
    {t:"生物序列侧的同一问题", go:"bm.sequence"}
  ]
},

'lm.embedding': {
  layers:{
    alg:"cos(a,b) = a·b/(‖a‖‖b‖); 归一化后 ‖â − b̂‖² = 2 − 2cos(a,b), 所以余弦排序 = 归一化欧氏排序。随机高维向量的余弦 std ≈ 1/√d。训练目标 (下一词预测 / 对比学习) 定义了 '近' 的含义。",
    geo:"一个高维球面, 每个 token 或句子是球面上一点, 相似度是夹角。随机两点几乎总是接近垂直 (768 维下 |cos| > 0.1 的只有 0.7%), 所以 0.3 就已经 '很近'; 未归一化时长向量像离球心远的点, 内积天然大。",
    comp:"检索: 所有向量先除以自己的范数, 查询也归一化, 一次矩阵乘得全部余弦, argsort 取 top-k; 归一化后可用欧氏近邻结构 (kd-tree/HNSW) 等价代替。"
  },
  proof:{
    from:"内积与范数的定义; 中心极限定理; 语言模型的训练目标",
    to:"为什么用余弦不用欧氏、为什么高维随机向量近正交、为什么 embedding 的 '近' 由训练目标决定",
    steps:[
      ["‖a − b‖² = ‖a‖² + ‖b‖² − 2a·b; 归一化后 ‖a‖ = ‖b‖ = 1, 得 ‖â − b̂‖² = 2 − 2cos","内积展开; 归一化后欧氏距离是余弦的单调递减函数, 二者排序完全一致"],
      ["未归一化时 a·b = ‖a‖‖b‖cos, 长向量 (高频词多、文本长) 内积天然大, 会霸榜: 模拟里内积 top3 = [100, 1, 0], 后两个是长向量","内积里多了 ‖b‖ 这个与语义无关的因子; 向量长度多与词频/长度相关"],
      ["随机向量 a, b 各分量独立同分布时, a·b = Σ a_i b_i 是 d 个零均值项之和, 除以范数后 std ≈ 1/√d","中心极限定理: 和的方差是 d 倍单项方差, 范数约 √d, 比值方差 ~ 1/d"],
      ["所以高维里 '几乎所有东西互相垂直', 余弦 0.3 已是 8 个标准差之外的强相关; 阈值必须按维数与模型校准","0.3/0.036 ≈ 8σ; 不同模型维数不同, 余弦的绝对值不可跨模型比较"],
      ["共现目标 (下一词预测 / SVD 词向量) 让上下文分布相同的词靠近: cat~dog, king~queen, 也让 good~bad (上下文一模一样)","目标函数只看 '周围出现什么', 反义词的周围词几乎相同; 这是分布假设的直接推论"],
      ["检索需要 '问题 ≈ 答案' 而不是 '上下文相同', 所以检索模型用对比学习在 (查询, 正文档) 对上训练; 拿生成模型的隐状态当句向量通常更差","训练目标定义了几何; 用错目标训出来的空间, 近邻不是你要的近邻"]
    ],
    end:"余弦是归一化后的欧氏, 高维里一切近正交, '近' 的含义由训练目标写死: 检索要用检索目标训出来的模型。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nd = 768\n# 1) 高维随机向量近正交: 余弦的 std ≈ 1/sqrt(d); 所以 0.3 已经很\"近\"\nA = np.random.randn(5000, d); B = np.random.randn(5000, d)\ncos = (A*B).sum(1)/np.linalg.norm(A, axis=1)/np.linalg.norm(B, axis=1)\nprint('随机 768 维向量对: 余弦均值 %.4f  std %.4f  (1/sqrt(768)=%.4f)  |cos|>0.1 的比例 %.4f' % (cos.mean(), cos.std(), 1/np.sqrt(d), (abs(cos) > 0.1).mean()))\n# 2) 归一化后 |a-b|^2 = 2 - 2cos: 欧氏与余弦排序一致; 不归一化则长向量霸榜\ndocs = np.random.randn(200, d); docs[:5] *= 6                                       # 5 个\"长\"向量 (高频词多/文本长)\nq = np.random.randn(d); q += 0.9*np.linalg.norm(q)*docs[100]/np.linalg.norm(docs[100])  # 查询和第 100 号语义相近\ndn = docs/np.linalg.norm(docs, axis=1, keepdims=True); qn = q/np.linalg.norm(q)\nprint('内积 top3 =', np.argsort(-(docs@q))[:3].tolist(), ' 余弦 top3 =', np.argsort(-(dn@qn))[:3].tolist(), ' 归一化后欧氏 top3 =', np.argsort(((dn - qn)**2).sum(1))[:3].tolist())\nprint('max| |a-b|^2 - (2-2cos) | =', np.abs(((dn - qn)**2).sum(1) - (2 - 2*dn@qn)).max())\n# 3) 训练目标决定什么叫\"近\": 共现目标 (SVD 词向量) 让上下文相同的词靠近, 不是同义\nsents = ['the cat sat on the mat', 'the dog sat on the mat', 'the cat chased the mouse', 'the dog chased the cat',\n         'the king rules the land', 'the queen rules the land', 'good is not bad', 'bad is not good']\nvocab = sorted({w for s in sents for w in s.split()}); ix = {w: i for i, w in enumerate(vocab)}\nC = np.zeros((len(vocab), len(vocab)))\nfor s in sents:\n    ws = s.split()\n    for i, w in enumerate(ws):\n        for j in range(max(0, i - 2), min(len(ws), i + 3)):\n            if j != i: C[ix[w], ix[ws[j]]] += 1\nU, S, Vt = np.linalg.svd(np.log1p(C)); E = U[:, :4]*S[:4]\nEn = E/np.linalg.norm(E, axis=1, keepdims=True)\ndef nn(w): c = En@En[ix[w]]; c[ix[w]] = -2; return [(vocab[i], round(float(c[i]), 2)) for i in np.argsort(-c)[:2]]\nfor w in ('cat', 'king', 'good'): print('%-5s 的最近邻 =' % w, nn(w))\nprint('-> good 与 bad 最近: 上下文一模一样. 共现相似 != 同义; 检索要用检索目标训出来的模型')", out:"随机 768 维向量对: 余弦均值 0.0004  std 0.0363  (1/sqrt(768)=0.0361)  |cos|>0.1 的比例 0.0070\n内积 top3 = [100, 1, 0]  余弦 top3 = [100, 85, 163]  归一化后欧氏 top3 = [100, 85, 163]\nmax| |a-b|^2 - (2-2cos) | = 4.440892098500626e-16\ncat   的最近邻 = [('dog', 1.0), ('mouse', 1.0)]\nking  的最近邻 = [('queen', 1.0), ('land', 0.99)]\ngood  的最近邻 = [('bad', 1.0), ('is', 1.0)]\n-> good 与 bad 最近: 上下文一模一样. 共现相似 != 同义; 检索要用检索目标训出来的模型",
    note:"随机向量余弦 std ≈ 1/√768 对应第 3–4 步; 内积/余弦/归一化欧氏三种 top3 与恒等式误差 4e-16 对应第 1–2 步; SVD 词向量的最近邻 (cat~dog, good~bad) 对应第 5–6 步。" },
  contrast:[
    {vs:"one-hot", same:"都是把离散符号变向量", diff:"one-hot 所有符号等距正交, 无相似性; embedding 稠密、低维、有相似结构", when:"embedding 是学出来的 one-hot 线性变换 (查表 = 乘 one-hot)"},
    {vs:"欧氏距离", same:"归一化后等价", diff:"未归一化时欧氏与内积都受长度影响; 余弦不受", when:"检索前归一化, 之后随便用哪个; 聚类时同样先归一化"},
    {vs:"蛋白 embedding (bm.protein_embed)", same:"同一技术: 预训练模型的隐状态", diff:"蛋白模型的 '近' 是进化/结构相近; 文本检索模型的 '近' 是问答匹配", when:"各用各的模型; 不要拿通用 LLM 编码蛋白"},
    {vs:"TF-IDF / BM25 关键词向量", same:"都是文本 → 向量后算相似度", diff:"稀疏、精确匹配词面; embedding 稠密、匹配语义但会把 CD19 与 CD3 挤在一起", when:"精确名词 (基因名、编号) 靠关键词; 语义改写靠 embedding; RAG 两路混合"}
  ],
  ext:[
    {t:"余弦就是投影", go:"ge.dot_projection"},
    {t:"用 embedding 做最近邻检索的整条链", go:"lm.rag"},
    {t:"一次矩阵乘算全部余弦", go:"np.dot"},
    {t:"生物序列侧的 embedding", go:"bm.protein_embed"}
  ]
},

'lm.causal_mask': {
  layers:{
    alg:"S = QKᵀ/√d + M, M_ij = 0 (j ≤ i), −∞ (j > i); A = softmax(S) 逐行; Y = AV。因为 e^{−∞} = 0, A 严格下三角以外全为 0, 第 i 行只有 i+1 个非零, 且每行和为 1。",
    geo:"一个 L×L 的方阵, 只有对角线及其左下角亮着, 右上角全黑。每一行是一个位置向左看的目光分配; 黑色格子是被遮住的未来。",
    comp:"训练时一次前向算出全部 L 行 (所有位置并行), 掩码是加在分数矩阵上的常数矩阵; 推理时第 t 步只需新的一行, 这就是 KV cache 的前提。padding mask 是另一个按列加的 −∞。"
  },
  proof:{
    from:"softmax 的定义与 e^{−∞} = 0; 自回归目标 p(x_i | x_<i); 注意力是输入集合上的加权平均",
    to:"因果掩码为什么保证第 i 个位置只看前面、为什么它让训练并行、为什么没有位置编码时注意力是置换等变的、为什么除以 √d",
    steps:[
      ["softmax(s)_j = e^{s_j}/Σ_k e^{s_k}; 令 s_j = −∞ 则分子 e^{−∞} = 0, 该项权重恰为 0 而其余项重新归一","指数函数在 −∞ 的极限是 0; 归一化分母只对有限项求和"],
      ["把 j > i 的分数置 −∞, 第 i 行的权重只在 j ≤ i 上非零, 输出 Y_i = Σ_{j≤i} A_ij V_j 只依赖 x_≤i","Q_i、K_j、V_j 各只依赖 x_i、x_j; 求和范围被掩码截到 ≤ i"],
      ["于是改动位置 > i 的输入, Y_i 一位不变 (模拟: 改 4、5 后 0–3 位输出变化为 0); 多层堆叠后依赖关系仍是 ≤ i (依赖的传递闭包不会越过 i)","每层都只向左取值, 复合仍只向左; 这就是 '不抄未来答案' 的结构保证"],
      ["训练时所有位置的输入都是真数据, 第 i 行的预测目标是 x_{i+1}; 一次矩阵乘 QKᵀ 同时算出所有行, 掩码只是加一个常数矩阵","各行之间没有依赖 (输入不含模型输出), 所以可并行; 这与生成时的串行形成对比"],
      ["无掩码且无位置编码时, 打乱输入顺序, 输出只是同样被打乱: attn(X[perm]) = attn(X)[perm] (置换等变); 因果掩码本身注入了顺序 (只看左边), 但仍不知道 '左边第几个'","注意力对 K、V 是集合运算 (加权求和对求和顺序不变); 所以顺序信息必须由位置编码显式加入"],
      ["q·k 是 d 个独立项之和, 方差 ∝ d (模拟: d=512 时方差 511); 不缩放时 softmax 输入尺度过大, 输出趋于 one-hot, 梯度消失; 除以 √d 把方差归回 1","方差的可加性; softmax 在大尺度下饱和, 导数趋近 0"],
      ["padding mask 按列置 −∞ (那些位置不是真 token), 与因果掩码同时加; 只加因果会让模型对 pad 位分配权重, 只加 padding 会泄露未来","两种掩码回答不同问题: '能不能看未来' vs '这一格有没有内容'"]
    ],
    end:"一个常数矩阵加在分数上, 就同时给了 '不看未来' 的正确性和 '全位置并行' 的效率; 顺序本身则要靠位置编码另给。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nL, d = 6, 8\ndef softmax(z): z = z - z.max(-1, keepdims=True); e = np.exp(z); return e/e.sum(-1, keepdims=True)\ndef attn(X, causal, pad=None):\n    Q, K, V = X@Wq, X@Wk, X@Wv\n    S = Q@K.T/np.sqrt(d)\n    if causal: S = S + np.triu(np.full((L, L), -np.inf), k=1)     # j>i 置 -inf, softmax 后恰为 0\n    if pad is not None: S[:, ~pad] = -np.inf                      # padding mask: 列方向\n    A = softmax(S); return A, A@V\nX = np.random.randn(L, d); Wq, Wk, Wv = [np.random.randn(d, d)/np.sqrt(d) for _ in range(3)]\nA, Y = attn(X, True)\nprint('因果注意力矩阵 (行=查询 i, 列=键 j):'); print(np.round(A, 2))\nprint('每行非零个数 =', (A > 0).sum(1).tolist(), ' (第 i 行恰 i+1 个)   每行和 =', np.round(A.sum(1), 6).tolist())\n# 改动\"未来\"的 token 4,5: 因果版位置 0-3 的输出一位不变; 无掩码版全部变\nX2 = X.copy(); X2[4:] = np.random.randn(2, d)\nprint('改动位置 4,5 后 各位置输出的最大变化 因果版:', np.round(np.abs(attn(X2, True)[1] - Y).max(1), 4).tolist())\nprint('                                    无掩码版:', np.round(np.abs(attn(X2, False)[1] - attn(X, False)[1]).max(1), 4).tolist())\n# 置换等变: 无位置编码时打乱输入顺序, 无掩码注意力的输出只是同样被打乱 -> 顺序信息不存在, 必须加位置编码\nperm = np.random.permutation(L); Yn = attn(X, False)[1]; Ynp = attn(X[perm], False)[1]\nprint('无掩码: attn(X[perm]) == attn(X)[perm] ?', bool(np.allclose(Ynp, Yn[perm])))\n# 为什么除以 sqrt(d): q·k 的方差随 d 线性增长, 不缩放 softmax 饱和成 one-hot\nfor dd in (8, 64, 512):\n    q = np.random.randn(20000, dd); k = np.random.randn(20000, dd); s = (q*k).sum(1)\n    print('d=%3d  q·k 方差 %6.1f  /sqrt(d) 后 %.2f' % (dd, s.var(), (s/np.sqrt(dd)).var()))\n# padding mask 是另一回事: 同时加两种\npad = np.array([1, 1, 1, 1, 0, 0], bool)\nprint('因果 + padding(后两位是 pad) 后 每行非零个数 =', (attn(X, True, pad)[0] > 0).sum(1).tolist())", out:"因果注意力矩阵 (行=查询 i, 列=键 j):\n[[1.   0.   0.   0.   0.   0.  ]\n [0.45 0.55 0.   0.   0.   0.  ]\n [0.7  0.28 0.01 0.   0.   0.  ]\n [0.04 0.01 0.81 0.14 0.   0.  ]\n [0.25 0.14 0.38 0.15 0.07 0.  ]\n [0.07 0.17 0.02 0.01 0.09 0.65]]\n每行非零个数 = [1, 2, 3, 4, 5, 6]  (第 i 行恰 i+1 个)   每行和 = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]\n改动位置 4,5 后 各位置输出的最大变化 因果版: [0.0, 0.0, 0.0, 0.0, 0.6923, 1.1112]\n                                    无掩码版: [0.8079, 0.72, 0.2039, 0.0505, 0.2549, 1.1112]\n无掩码: attn(X[perm]) == attn(X)[perm] ? True\nd=  8  q·k 方差    7.9  /sqrt(d) 后 0.99\nd= 64  q·k 方差   63.4  /sqrt(d) 后 0.99\nd=512  q·k 方差  511.2  /sqrt(d) 后 1.00\n因果 + padding(后两位是 pad) 后 每行非零个数 = [1, 2, 3, 4, 4, 4]",
    note:"attn() 里 np.triu(-inf) 与非零个数 [1..6] 对应第 1–2 步; 改动 4、5 后的变化量对比对应第 3 步; 置换等变的 allclose 对应第 5 步; 三种 d 的方差对应第 6 步; 因果 + padding 后非零个数对应第 7 步。" },
  contrast:[
    {vs:"BERT 的双向注意力", same:"同一个注意力算子", diff:"BERT 无因果掩码, 每个位置看全句, 用掩码词预测训练; 所以它不能自回归生成", when:"理解/分类用双向编码器; 生成用因果解码器"},
    {vs:"padding mask", same:"都是给分数矩阵加 −∞", diff:"因果按 (i,j) 相对位置遮, padding 按列 (哪个 token 是空的) 遮", when:"必须同时加; 二者独立"},
    {vs:"RNN 的时序因果", same:"都保证第 i 步只依赖 ≤ i", diff:"RNN 靠串行递推天然因果, 训练也串行; 注意力靠掩码, 训练并行", when:"长序列训练效率是 Transformer 取代 RNN 的核心原因"},
    {vs:"卷积的因果 (WaveNet)", same:"也是用结构遮住未来", diff:"因果卷积用左移的核, 感受野有限; 注意力感受野是整个前缀", when:"局部依赖强、序列极长 (音频) 时因果卷积仍有优势"}
  ],
  ext:[
    {t:"掩码让前缀 K、V 不变, 因此可缓存", go:"lm.kv_cache"},
    {t:"注意力算子本身", go:"dl.attention"},
    {t:"并行训练的自回归分解", go:"gm.autoregressive"},
    {t:"L×L 矩阵的形状与显存", go:"la.matmul_shape"}
  ]
},

'lm.kv_cache': {
  layers:{
    alg:"第 t 步: q_t = x_t W_q, k_t = x_t W_k, v_t = x_t W_v; 追加 K ← [K; k_t], V ← [V; v_t]; y_t = softmax(q_t Kᵀ/√d) V。每步代价 O(t·d) 而非 O(t²·d); 缓存大小 2 × 层数 × 头数 × head_dim × t。",
    geo:"一条越来越长的备忘条: 每来一个新 token, 只把它的 K、V 贴到条尾, 然后让它的 query 沿着整条备忘条扫一遍。不缓存则每步把整条备忘条重新抄写一遍再扫。",
    comp:"缓存是 (层, 2, batch, 头, t, head_dim) 的张量, 随 t 线性增长; 生成阶段每步只有一个 token 的矩阵乘, 算力用不满, 时间花在搬权重与缓存 (显存带宽受限)。"
  },
  proof:{
    from:"因果掩码下 y_t 只依赖 x_≤t; K_j = x_j W_k 只依赖 x_j; 矩阵乘法的运算量计数",
    to:"为什么前缀的 K、V 可以缓存而不改变结果、每步代价从 O(t²) 降到 O(t)、总代价从 n³ 降到 n²、代价是显存 O(n)",
    steps:[
      ["因果掩码下 y_t = softmax(q_t [k_1..k_t]ᵀ/√d)[v_1..v_t]: 只用到自己的 q_t 与前缀全部的 k_j、v_j","第 t 行的注意力只在 j ≤ t 上非零 (lm.causal_mask 第 2 步)"],
      ["k_j = x_j W_k 与 v_j = x_j W_v 只依赖 x_j 与冻结的权重, 与 t 无关; 生成时 x_j (j < t) 已定, 所以 k_j、v_j 在之后每一步都相同","生成是自回归的, 已采样的 token 不会变; 权重在推理时不变"],
      ["因此第 t 步只需算新 token 的 q_t、k_t、v_t (3d² 乘加) 与一行注意力 (2td), 把 k_t、v_t 追加进缓存; 无缓存则重算整个前缀: 3td² + 2t²d","重复计算的量恰是前缀部分; 数值上两种方式逐位一致 (模拟差 3e-16)"],
      ["每步代价: 无缓存 ~ t²d, 有缓存 ~ td, 差一阶; 全程生成 n 个 token: Σt² ~ n³/3 对 Σt ~ n²/2, 也差一阶 (n = 8192 时 5000 倍)","求和的幂次: Σ_{t≤n} t^k ~ n^{k+1}/(k+1)"],
      ["代价是显存: 缓存 = 2 (K 与 V) × 层数 × 头数 × head_dim × t × batch × 字节; 32 层 × 32 头 × 128 维 fp16 每 token 0.5 MB, 128k 上下文 69 GB","每层每头都要存自己的 K、V; 随 t 线性增长, 与 batch 相乘"],
      ["缓存显存按 batch 线性叠加且随生成长度增长, 所以要按最大长度预算; MQA/GQA 让多个 query 头共享一组 K、V 头, 显存除以分组倍数 (8 组: 69 → 17 GB)","K、V 的头数与 query 头数可以不同, 注意力公式不变; 这是省显存不省算力的手段"],
      ["生成阶段每步只有 1 个 token 的矩阵乘, 算术强度低, 瓶颈是把权重与缓存从显存搬到计算单元 (带宽受限), 所以 batch 推理吞吐显著更高","同一份权重被多个序列复用, 搬一次算多次"]
    ],
    end:"KV cache 不是近似而是恒等变形: 因果性保证前缀 K、V 不变, 所以每步从 O(t²) 降到 O(t), 代价是 O(t) 的显存, 这才是长对话的真正瓶颈。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nd, n = 16, 12\nWq, Wk, Wv = [np.random.randn(d, d)/np.sqrt(d) for _ in range(3)]\nX = np.random.randn(n, d)\ndef softmax(z): z = z - z.max(-1, keepdims=True); e = np.exp(z); return e/e.sum(-1, keepdims=True)\nmacs_no = macs_cache = 0; outs_no, outs_cache = [], []\nKc = np.zeros((0, d)); Vc = np.zeros((0, d))\nfor t in range(1, n + 1):\n    # 无缓存: 第 t 步把整个前缀 X[:t] 重新投影 + 全 t x t 注意力\n    P = X[:t]; Q, K, V = P@Wq, P@Wk, P@Wv\n    S = Q@K.T/np.sqrt(d) + np.triu(np.full((t, t), -np.inf), 1); outs_no.append((softmax(S)@V)[-1])\n    macs_no += 3*t*d*d + 2*t*t*d                     # 投影 3·t·d² + QKᵀ 与 AV 各 t²·d\n    # 有缓存: 只投影新 token, K/V 追加进缓存, 只算新 query 对全部 key 的那一行\n    x = X[t-1:t]; q, k, v = x@Wq, x@Wk, x@Wv\n    Kc = np.vstack([Kc, k]); Vc = np.vstack([Vc, v])\n    outs_cache.append((softmax(q@Kc.T/np.sqrt(d))@Vc)[0])\n    macs_cache += 3*d*d + 2*t*d                      # 投影 3·d² + 注意力 2·t·d\nprint('两种方式每步输出的最大差 = %.2e  (结果完全一样, 因果性保证前缀的 K,V 不随时间变)' % max(np.abs(a - b).max() for a, b in zip(outs_no, outs_cache)))\nprint('生成 %d 个 token 的乘加数: 无缓存 %d  有缓存 %d  (%.1fx)' % (n, macs_no, macs_cache, macs_no/macs_cache))\nprint('第 t 步: 无缓存 ~ t²d (整个 t x t 矩阵)   有缓存 ~ t d (一行);  总量 Σt² ~ n³/3  vs  Σt ~ n²/2')\nfor n2 in (128, 1024, 8192):\n    t = np.arange(1, n2 + 1); print('n=%5d: 无缓存/有缓存 = %.0fx' % (n2, (3*t*d*d + 2*t*t*d).sum()/(3*d*d + 2*t*d).sum()))\n# 代价: 缓存显存随长度线性增长 = 2(K,V) x 层数 x 头数 x head_dim x L x batch x 2 字节 (fp16)\nlayers, heads, hd = 32, 32, 128\nfor L in (4096, 32768, 131072): print('L=%6d: KV cache = %5.1f GB (batch 1, fp16), 每 token %.2f MB; GQA 8 组 KV 头 -> %.1f GB' % (L, 2*layers*heads*hd*L*2/1e9, 2*layers*heads*hd*2/1e6, 2*layers*8*hd*L*2/1e9))", out:"两种方式每步输出的最大差 = 3.33e-16  (结果完全一样, 因果性保证前缀的 K,V 不随时间变)\n生成 12 个 token 的乘加数: 无缓存 80704  有缓存 11712  (6.9x)\n第 t 步: 无缓存 ~ t²d (整个 t x t 矩阵)   有缓存 ~ t d (一行);  总量 Σt² ~ n³/3  vs  Σt ~ n²/2\nn=  128: 无缓存/有缓存 = 80x\nn= 1024: 无缓存/有缓存 = 675x\nn= 8192: 无缓存/有缓存 = 5454x\nL=  4096: KV cache =   2.1 GB (batch 1, fp16), 每 token 0.52 MB; GQA 8 组 KV 头 -> 0.5 GB\nL= 32768: KV cache =  17.2 GB (batch 1, fp16), 每 token 0.52 MB; GQA 8 组 KV 头 -> 4.3 GB\nL=131072: KV cache =  68.7 GB (batch 1, fp16), 每 token 0.52 MB; GQA 8 组 KV 头 -> 17.2 GB",
    note:"循环里两路计算与 '最大差 3e-16' 对应第 1–3 步; macs 计数与 6.9x 对应第 3 步; n = 128/1024/8192 的比值对应第 4 步; 三种 L 的 GB 数与 GQA 对应第 5–6 步。" },
  contrast:[
    {vs:"无缓存逐步重算", same:"结果逐位相同", diff:"重算每步 O(t²), 总 O(n³); 缓存每步 O(t), 总 O(n²)", when:"没有理由不缓存; 唯一代价是显存"},
    {vs:"训练时的并行前向", same:"都用因果掩码", diff:"训练一次算 L 行, 无需缓存; 生成串行一行一行来, 才需要缓存", when:"缓存只存在于推理"},
    {vs:"MQA / GQA", same:"都是 KV 层面的优化", diff:"KV cache 是算法恒等变形; MQA/GQA 改模型结构 (共享 K、V 头), 训练时就要决定", when:"长上下文部署的模型几乎都用 GQA"},
    {vs:"上下文窗口 (lm.context_window)", same:"都随长度增长", diff:"窗口说的是注意力算力 O(L²); 缓存说的是显存 O(L)", when:"长对话先撞显存墙, 再撞算力墙"}
  ],
  ext:[
    {t:"缓存成立的前提", go:"lm.causal_mask"},
    {t:"L 增长时的算力与显存", go:"lm.context_window"},
    {t:"O(t²) 与 O(t) 的量级差", go:"di.big_o"},
    {t:"显存放在哪个设备上", go:"pt.device"}
  ]
},

'lm.context_window': {
  layers:{
    alg:"注意力算力 ∝ L²·d (QKᵀ 与 AV 各 L×L×d), KV 显存 ∝ L; 长度翻倍算力 ×4、显存 ×2。位置权重是学出来的先验: 训练数据里答案多在首尾, 模型对中段的召回就低 (lost in the middle)。",
    geo:"一条长纸带, 两端被聚光灯照亮, 中间偏暗。窗口变长只是纸带变长, 聚光灯没有变多: 中段更长更暗。",
    comp:"窗口 = 输入 token + 输出 token 共用的预算; 检索先切块再喂关键段, 关键指令放开头或结尾; 长文档整篇塞进去既贵 (L²) 又不准 (中段召回低)。"
  },
  proof:{
    from:"注意力的矩阵形状; KV cache 大小; 位置相关的注意力权重由训练数据分布决定",
    to:"为什么算力 O(L²)、显存 O(L)、为什么 '能放进去' 不等于 '会用', 以及窗口加倍为什么不改善中段",
    steps:[
      ["S = QKᵀ 是 L×L 矩阵, 每个元素 d 次乘加, 共 L²d; AV 再 L²d; 所以每层每头 2L²d, 长度翻倍算力 ×4 (模拟: 1024→2048 从 2.7e8 到 1.1e9)","矩阵乘 (L×d)(d×L) 的乘加数是 L·L·d; 两次"],
      ["KV cache 每 token 存固定大小的 K、V, 总量 ∝ L, 翻倍 ×2","缓存是逐 token 追加的 (lm.kv_cache 第 5 步)"],
      ["注意力权重 = softmax(内容匹配 + 位置相关项), 位置相关项 (位置编码与训练分布的交互) 是学出来的; 训练语料里长程依赖稀少, 答案多在开头 (标题、指令) 或结尾 (近期), 学到的位置先验就偏两端","模型最小化训练损失, 会把先验调到训练数据里答案的位置分布上; 没有理由学会关注它很少需要的中段"],
      ["玩具模型: 打分 = log(位置先验) + k × 内容匹配; 正确段匹配度最高但不压倒性时, 中段的正确段常输给首尾的次优段: 窗口 20 中段召回 0.39, 首尾 1.0","位置先验 0.15 vs 0.01 差 log 2.7, 内容匹配的优势不足以抵消"],
      ["窗口加倍到 40: 同样的先验摊到更长的中段, 中段召回从 0.39 降到 0.17; 加长解决 '放得进去', 不解决 '会不会用'","先验总量守恒 (和为 1), 中段位置越多每个位置分到的越少"],
      ["因此: 关键指令放首尾; 长文档先切块检索, 只把相关段放进上下文; 128k 窗口不能替代 RAG, 且无法溯源引用","让内容匹配在更短的候选集里竞争, 并把它放到先验高的地方"]
    ],
    end:"长度的代价是平方的算力与线性的显存, 收益却被学出来的位置先验打折; 窗口是能看见多少, 不是能用好多少。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\n# 1) 注意力算力 O(L²), KV 显存 O(L): 直接数乘加\nd = 128; prev = None\nfor L in (1024, 2048, 4096, 8192):\n    macs = 2*L*L*d                                     # QKᵀ 与 AV 各 L·L·d\n    print('L=%5d  注意力乘加 %.2e  KV 显存 ∝ %5d %s' % (L, macs, L, '' if prev is None else '  <- 长度 x2: 算力 x%.0f, 显存 x2' % (macs/prev)))\n    prev = macs\n# 2) \"能看见\" != \"会用\": 位置权重是学出来的. 训练里答案多在首尾, 学到的位置先验就偏两端\ndef sim(L, trials=20000, k=7):\n    train_pos = np.concatenate([np.random.randint(0, 3, 4000), np.random.randint(L - 3, L, 4000), np.random.randint(0, L, 1500)])\n    w_pos = np.bincount(train_pos, minlength=L)/len(train_pos)      # 训练数据中答案位置的频率 = 学到的位置先验\n    hits = np.zeros(L); cnt = np.zeros(L)\n    for _ in range(trials):\n        pos = np.random.randint(L); match = np.random.rand(L)*0.7; match[pos] = 1.0   # 正确段匹配度最高, 但不是压倒性\n        cnt[pos] += 1; hits[pos] += np.argmax(np.log(w_pos + 1e-3) + k*match) == pos  # 打分 = 位置先验 + 内容匹配\n    return w_pos, hits/cnt\nw_pos, rec = sim(20)\nprint('窗口 20 学到的位置先验:', np.round(w_pos, 2).tolist())\nprint('答案放在各位置时的召回率:', np.round(rec, 2).tolist())\nprint('窗口 20: 首 3 位 %.2f  中间 8 位 %.2f  末 3 位 %.2f  -> lost in the middle' % (rec[:3].mean(), rec[6:14].mean(), rec[-3:].mean()))\n_, rec2 = sim(40)\nprint('窗口 40: 首 3 位 %.2f  中间 28 位 %.2f  末 3 位 %.2f  -> 放得下更多, 中段没有变亮' % (rec2[:3].mean(), rec2[6:-6].mean(), rec2[-3:].mean()))", out:"L= 1024  注意力乘加 2.68e+08  KV 显存 ∝  1024 \nL= 2048  注意力乘加 1.07e+09  KV 显存 ∝  2048   <- 长度 x2: 算力 x4, 显存 x2\nL= 4096  注意力乘加 4.29e+09  KV 显存 ∝  4096   <- 长度 x2: 算力 x4, 显存 x2\nL= 8192  注意力乘加 1.72e+10  KV 显存 ∝  8192   <- 长度 x2: 算力 x4, 显存 x2\n窗口 20 学到的位置先验: [0.15, 0.15, 0.15, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.15, 0.16, 0.14]\n答案放在各位置时的召回率: [1.0, 1.0, 1.0, 0.43, 0.34, 0.43, 0.3, 0.3, 0.4, 0.43, 0.42, 0.44, 0.43, 0.38, 0.43, 0.42, 0.46, 1.0, 1.0, 1.0]\n窗口 20: 首 3 位 1.00  中间 8 位 0.39  末 3 位 1.00  -> lost in the middle\n窗口 40: 首 3 位 1.00  中间 28 位 0.17  末 3 位 1.00  -> 放得下更多, 中段没有变亮",
    note:"前四行乘加计数对应第 1–2 步 (长度 ×2 → 算力 ×4); sim() 里的 w_pos 与打分对应第 3–4 步; 窗口 20 与 40 的中段召回对比对应第 5 步。" },
  contrast:[
    {vs:"RAG (lm.rag)", same:"都在给模型提供外部信息", diff:"长窗口把整份材料塞进去, 靠注意力自己找; RAG 先检索再只给相关段", when:"需要整体推理 (通读一篇) 用长窗口; 需要定位事实、可溯源用 RAG"},
    {vs:"KV cache (lm.kv_cache)", same:"都是长度带来的成本", diff:"窗口讲算力 L²; 缓存讲显存 L", when:"预算时两条都算"},
    {vs:"max_tokens (输出上限)", same:"都是长度限制", diff:"窗口是输入 + 输出的总预算; max_tokens 只是输出的上限参数", when:"输出被截断先查哪个撞了"},
    {vs:"RNN 的隐状态", same:"都是 '模型能记多少'", diff:"RNN 是固定大小的有损压缩, 窗口是无损但有限的原文", when:"窗口内原文可精确引用, RNN 记忆会衰减"}
  ],
  ext:[
    {t:"检索替代整篇塞入", go:"lm.rag"},
    {t:"显存那一半的成本", go:"lm.kv_cache"},
    {t:"L² 的量级感", go:"di.big_o"},
    {t:"token 数怎么数", go:"lm.tokenization"}
  ]
},

'lm.finetune_vs_prompt': {
  layers:{
    alg:"LoRA: W' = W + BA, B ∈ R^{d×r}, A ∈ R^{r×d}, r ≪ d; 可训参数 2dr 对全量 d²。秩 r 的增量能精确表达任意秩 ≤ r 的改动 (Eckart-Young), 对高秩改动只能保留前 r 个奇异方向。",
    geo:"三个旋钮: 提示改的是这次输入, 检索换的是资料库, 微调拧的是参数。LoRA 只允许参数沿 r 个方向移动: 格式和语气是低秩的 (少数方向), 200 条新事实是 200 个方向。",
    comp:"决策序按成本升: 提示 (0 参数) → 少样本 (0) → RAG (0, 改索引) → LoRA (2dr) → 全量 (d²)。LoRA 训练只更新 A、B, 梯度 dL/dB = G Aᵀ, dL/dA = Bᵀ G, G 是对 BA 的梯度。"
  },
  proof:{
    from:"矩阵秩与低秩最优近似 (Eckart-Young); 参数计数; 事实需要可更新、可溯源",
    to:"为什么 LoRA 参数量是 2dr、为什么它擅长格式/风格而不擅长灌事实、为什么事实应放上下文",
    steps:[
      ["W + BA 中 BA 的秩 ≤ r; 训练只更新 B (d×r) 和 A (r×d), 共 2dr 个参数, d=256、r=8 时是全量的 1/16, d=4096 时是 1/256","秩 (BA) ≤ min(秩 B, 秩 A) ≤ r; 参数计数直接数矩阵元素"],
      ["Eckart-Young: 对目标改动 ΔW, 秩 r 矩阵的最优近似是 SVD 截断 U_r Σ_r V_rᵀ, 残差 = 第 r+1 个以后的奇异值平方和","Frobenius 范数下的低秩最优近似定理"],
      ["格式/语气类改动是低秩的 (改变输出的少数几个方向, 如 '总是输出 JSON'), 秩 4 的改动被秩 8 的 LoRA 零残差表达","这类改动作用在所有输入上的同一方向; 模拟: 残差 0.000, 训练后误差 0.032"],
      ["'灌 200 条事实' 每条是一个 key→value 方向, 增量矩阵秩 200, 秩 8 的最优近似残差 0.90, 训练后误差 0.945","每条新事实彼此独立, 张成的子空间维数随事实数线性增长; 低秩装不下"],
      ["即使全量微调装得下, 参数里的事实不可更新 (改一条要重训)、不可溯源 (说不出来自哪)、不可删除; 上下文/检索里的事实改一行即生效、可引用","参数是分布式的、纠缠的表示; 字典是显式的、可寻址的"],
      ["微调改变的是条件分布 p_θ(y|x) 的形状, 所以它擅长的是 '怎么说' (格式、语气、领域词汇); 微调后模型会用新语气说错的事实, 更难发现","损失是对输出 token 的似然, 学到的是输出风格的统计; 事实正确性从未进入目标"],
      ["全量微调容易灾难性遗忘 (所有参数都动); LoRA 限制在低秩子空间、通常还混通用数据, 遗忘更少","参数移动的自由度越小, 对原有能力的扰动越小"]
    ],
    end:"LoRA 便宜是因为低秩, 低秩正好匹配 '格式/风格' 这类改动的结构; 事实是高秩且需可更新, 应该放上下文, 不该压进参数。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nnp.random.seed(0)\nd, r = 256, 8\nprint('全量微调 d² = %d 参数;  LoRA W + BA: 2dr = %d 参数;  比例 1/%.0f' % (d*d, 2*d*r, d*d/(2*d*r)))\nW = np.random.randn(d, d)/np.sqrt(d)\ndW_style = np.random.randn(d, 4)@np.random.randn(4, d)/d            # \"格式/语气\" 类改动: 低秩 (少数方向)\nfacts = np.random.randn(200, d); vals = np.random.randn(200, d)\ndW_facts = facts.T@vals/d/np.sqrt(200)                               # \"灌 200 条新事实\": 每条一个 key->value 方向, 高秩\ndef best_rank_r(M, r): U, s, Vt = np.linalg.svd(M); return (U[:, :r]*s[:r])@Vt[:r]\nfor name, dW in (('格式改动 (秩4)', dW_style), ('200 条事实 (高秩)', dW_facts)):\n    print('%-18s 矩阵秩 %3d | 秩 %d LoRA 最优近似残差/改动范数 = %.3f' % (name, np.linalg.matrix_rank(dW), r, np.linalg.norm(dW - best_rank_r(dW, r))/np.linalg.norm(dW)))\n# 只训 A,B 的梯度下降 (W 冻结): 拟合格式改动\ndef train_lora(dW, steps=400, lr=0.05):\n    X = np.random.randn(512, d); Y = X@(W + dW)\n    A = np.random.randn(r, d)*0.01; B = np.zeros((d, r))\n    for _ in range(steps):\n        G = X.T@(X@(W + B@A) - Y)/len(X)                           # dL/d(BA)\n        B, A = B - lr*G@A.T, A - lr*B.T@G\n    Xt = np.random.randn(512, d); return np.linalg.norm(Xt@(W + B@A) - Xt@(W + dW))/np.linalg.norm(Xt@dW)\nprint('LoRA(r=8) 训练后 相对误差: 格式改动 %.3f | 事实改动 %.3f' % (train_lora(dW_style), train_lora(dW_facts)))\n# 事实要可更新: 参数里的知识 vs 上下文里的知识\nkv = {'CD19': 'B cell', 'CD3': 'T cell'}\nprint('RAG: 改字典一行即更新, 可溯源 ->', kv, '| 微调: 每条事实要压进 %d 个参数的某个方向, 改一条得重训, 无法溯源' % (d*d))", out:"全量微调 d² = 65536 参数;  LoRA W + BA: 2dr = 4096 参数;  比例 1/16\n格式改动 (秩4)          矩阵秩   4 | 秩 8 LoRA 最优近似残差/改动范数 = 0.000\n200 条事实 (高秩)       矩阵秩 200 | 秩 8 LoRA 最优近似残差/改动范数 = 0.900\nLoRA(r=8) 训练后 相对误差: 格式改动 0.032 | 事实改动 0.945\nRAG: 改字典一行即更新, 可溯源 -> {'CD19': 'B cell', 'CD3': 'T cell'} | 微调: 每条事实要压进 65536 个参数的某个方向, 改一条得重训, 无法溯源",
    note:"首行参数计数对应第 1 步; best_rank_r 与两种改动的残差对应第 2–4 步 (Eckart-Young); train_lora 只更新 A、B 的梯度下降对应第 3–4 步的训练验证; 末行字典对应第 5 步。" },
  contrast:[
    {vs:"提示工程 / 少样本", same:"都在改变模型输出", diff:"提示不动参数, 每次调用都要带; 微调把行为固化进参数", when:"先提示; 提示太长、太贵或格式仍不稳再 LoRA"},
    {vs:"RAG (lm.rag)", same:"都能让模型 '知道' 新东西", diff:"RAG 把事实放上下文, 可更新可溯源; 微调把事实压进参数", when:"事实用 RAG, 风格用微调; 两者常同时用"},
    {vs:"全量微调", same:"都改参数", diff:"全量改 d² 个, 易遗忘、显存大; LoRA 改 2dr 个", when:"几乎所有实验室场景 LoRA 够用; 全量只在数据量极大且分布差异极大时"},
    {vs:"PCA / SVD 截断 (la.svd)", same:"LoRA 的理论依据就是低秩最优近似", diff:"PCA 近似数据矩阵; LoRA 近似参数增量", when:"理解 LoRA 时把 ΔW 当作被 SVD 截断的矩阵"}
  ],
  ext:[
    {t:"秩与低秩近似", go:"la.rank"},
    {t:"Eckart-Young 来自 SVD", go:"la.svd"},
    {t:"事实放上下文的做法", go:"lm.rag"},
    {t:"改动前后要在固定测试集上比", go:"lm.eval_align"}
  ]
},

'lm.rag': {
  layers:{
    alg:"文档切块 → 每块 embedding → 归一化 → 查询 embedding → 余弦 top-k (稠密) ∪ BM25 top-k (关键词) → 倒数排名融合 (RRF) → 交叉编码器重排 → 前几段进上下文。上限 = P(正确段 ∈ 上下文)。",
    geo:"一个向量球面: 文档块散在球面上, 问题落一个点, 取周围最近的几块。问题是 '怎么杀', 答案讲 '穿孔素', 二者在球面上并不相邻: 问答几何与相似几何不是一回事。",
    comp:"chunk 200–500 token、重叠 10–20%; 稠密召回快但粗 (近似最近邻), 关键词召回精确名词 (CD19 ≠ CD3), 两路各取 50 融合, 重排到 5; 排错先打印召回结果, 别先改提示。"
  },
  proof:{
    from:"生成只基于上下文; 余弦几何; 稠密 embedding 把表面形式相近的东西挤在一起; 问题与答案的词分布不同",
    to:"RAG 的上限为什么是召回率、为什么度量要选余弦、为什么纯向量会漏精确名词、为什么要混合 + 重排",
    steps:[
      ["模型的输出条件在上下文上: p(答案 | 问题, 检索段); 正确段不在上下文里时, 模型只能基于错误段或参数记忆生成, 后者就是幻觉","生成器没有别的信息源; 这是链路的信息瓶颈"],
      ["所以整条链的准确率 ≤ 召回率 (正确段进入 top-k 的概率), 排错要先看召回, 再看生成","上界由乘法法则给出: P(答对) = P(答对 | 召回) P(召回) ≤ P(召回)"],
      ["度量: 未归一化内积偏向长/重复文档 (模拟: 第 1 条重复 5 遍后内积霸榜), 余弦去掉长度只留方向","a·b = ‖a‖‖b‖cos; 长度与相关性无关 (lm.embedding 第 2 步)"],
      ["稠密 embedding 由子词与共现训练, 表面形式相近的名词 (CD19/CD3/CD8) 被映到相近方向; 查 CD19 可能召回别的 CD 分子","语义模型学的是 '这些词出现在相似语境', 精确编号对它是噪声"],
      ["关键词检索 (BM25) 按精确词面匹配, 对基因名、试剂号、编号可靠, 但对改写、同义无能为力","词袋是稀疏精确匹配; 没有共享词就是零分"],
      ["两路各有盲区且互补, 用倒数排名融合 (RRF: Σ 1/(c + rank)) 合并, 不需要把两种分数对齐尺度","排名是无量纲的; 两路都排前的文档得分最高"],
      ["问题与答案的词分布不同 (问 '怎么摧毁', 答 '穿孔素'), 双塔 embedding 只能各自编码, 常把问题映到 '其他问题' 附近; 交叉编码器把 (问题, 段落) 拼在一起打分, 能看到二者的交互, 精但慢","双塔是先编码后比较, 交互只剩一个点积; 交叉编码器在注意力里让问答 token 互相看"],
      ["因此流水线是 '粗召回 (快、宽) → 精重排 (慢、窄)'; chunk 重叠是为了不把关键句切在边界","两阶段用便宜的方法缩小候选, 用贵的方法在小集合上精排"]
    ],
    end:"RAG 的上限在检索: 度量选余弦、名词靠关键词、问答不相邻靠重排; 召回不到, 生成再好也是编。"
  },
  scratch:{ lang:'python', code:"import numpy as np, re\nnp.random.seed(0)\ndocs = ['CD19 CAR T cells target B cell malignancies',\n        'CD3 CD28 beads expand T cells in culture',\n        'CD8 T cells kill infected cells via perforin and granzyme',\n        'artificial antigen presenting cells aAPC display pMHC and anti CD28',\n        'B cells produce antibodies after activation',\n        'PD1 blockade restores exhausted T cells']\n# \"稠密\" embedding 的玩具替身: 子词归一 (CD19/CD3/CD8 -> cd) 后的 tf-idf, 模拟语义模型把相近表面形式挤在一起\nsem = lambda w: 'cd' if re.fullmatch(r'cd\\d+', w) else w\ndef vecs(tok):\n    vocab = sorted({tok(w) for s in docs for w in s.lower().split()}); ix = {w: i for i, w in enumerate(vocab)}\n    def bow(s):\n        v = np.zeros(len(vocab))\n        for w in s.lower().split():\n            if tok(w) in ix: v[ix[tok(w)]] += 1\n        return v\n    D = np.array([bow(s) for s in docs]); idf = np.log(len(docs)/(1 + (D > 0).sum(0))) + 1\n    return D*idf, lambda q: bow(q)*idf\nE_dense, q_dense = vecs(sem); E_kw, q_kw = vecs(lambda w: w)\nunit = lambda M: M/(np.linalg.norm(M, axis=-1, keepdims=True) + 1e-9)\ndef rank(E, qv): return np.argsort(-(unit(E)@unit(qv)))\ndef hybrid(q):                                        # RRF: 两路排名倒数相加\n    s = np.zeros(len(docs))\n    for rk in (rank(E_dense, q_dense(q)), rank(E_kw, q_kw(q))):\n        for i, doc in enumerate(rk): s[doc] += 1/(10 + i)\n    return np.argsort(-s)\nfor q, gold in (('which cells does CD19 CAR target', 0), ('how to expand T cells with beads', 1), ('what molecules do aAPC display', 3)):\n    print('Q: %-36s 正确=%d | dense top2 %s | keyword top2 %s | hybrid top2 %s' % (q, gold, rank(E_dense, q_dense(q))[:2].tolist(), rank(E_kw, q_kw(q))[:2].tolist(), hybrid(q)[:2].tolist()))\n# 问题与答案在向量空间不相邻: 问题用 \"kill/destroy\", 答案讲 \"perforin\"\nq = 'how do cytotoxic lymphocytes destroy their targets'\nprint('Q: %s -> dense top1 = %d (正确是 2; 问题里没有 perforin, 答案里没有 destroy)' % (q, rank(E_dense, q_dense(q))[0]))\n# 度量: 未归一化内积偏向长/重复文档\nE2 = E_kw.copy(); E2[1] *= 5                          # 第 1 条被重复写了 5 遍\nqv = q_kw('aAPC CD28 pMHC')\nprint('查 \"aAPC CD28 pMHC\": 内积 top1 = %d (长文档霸榜) | 余弦 top1 = %d' % (int(np.argmax(E2@qv)), int(np.argmax(unit(E2)@unit(qv)))))\n# 召回是上限: 正确段没进上下文, 生成再好也是编\nprint('链路上限 = 召回率: 检索 top-k 里没有正确段 -> 生成只能基于错误段 -> 必然幻觉')", out:"Q: which cells does CD19 CAR target     正确=0 | dense top2 [0, 1] | keyword top2 [0, 2] | hybrid top2 [0, 2]\nQ: how to expand T cells with beads     正确=1 | dense top2 [1, 2] | keyword top2 [1, 2] | hybrid top2 [1, 2]\nQ: what molecules do aAPC display       正确=3 | dense top2 [3, 0] | keyword top2 [3, 0] | hybrid top2 [3, 0]\nQ: how do cytotoxic lymphocytes destroy their targets -> dense top1 = 0 (正确是 2; 问题里没有 perforin, 答案里没有 destroy)\n查 \"aAPC CD28 pMHC\": 内积 top1 = 1 (长文档霸榜) | 余弦 top1 = 3\n链路上限 = 召回率: 检索 top-k 里没有正确段 -> 生成只能基于错误段 -> 必然幻觉",
    note:"vecs(sem) 是把 CDxx 归一的 '稠密' 替身, vecs(lambda w: w) 是关键词, hybrid 用 RRF 对应第 4–6 步; 'destroy vs perforin' 一行对应第 7 步; 内积 vs 余弦 top1 对应第 3 步; 末行是第 1–2 步的结论。" },
  contrast:[
    {vs:"长上下文整篇塞入 (lm.context_window)", same:"都在给模型外部信息", diff:"RAG 先选后给, 便宜且可溯源; 长窗口全给, 贵且中段召回低", when:"定位事实用 RAG; 通读推理用长窗口"},
    {vs:"微调灌知识 (lm.finetune_vs_prompt)", same:"都想让模型 '知道' 实验室的东西", diff:"RAG 的知识可更新可引用; 微调的知识固化且无溯源", when:"事实永远 RAG"},
    {vs:"纯 embedding 最近邻 (lm.embedding)", same:"RAG 的稠密召回就是它", diff:"RAG 还加了关键词、融合、重排与 chunk 策略", when:"只做相似文档推荐用纯向量; 问答必须完整流水线"},
    {vs:"传统搜索引擎", same:"都是 '检索 → 呈现'", diff:"搜索引擎把结果给人, RAG 把结果给模型生成答案", when:"RAG 答案必须能回指到召回的段落, 否则与幻觉无异"}
  ],
  ext:[
    {t:"余弦几何与归一化", go:"lm.embedding"},
    {t:"召回不到时的后果", go:"lm.hallucination"},
    {t:"上限的乘法法则", go:"pr.conditional"},
    {t:"整条链的数据流水线思维", go:"da.pipeline"}
  ]
},

'lm.hallucination': {
  layers:{
    alg:"训练目标 = 最小化 −Σ log p_θ(x_t | x_<t) = 交叉熵 = KL(p_data ‖ p_θ) + 常数。目标里只有 '数据分布的似然', 没有 '真' 这一项; softmax 对词表每个词给正概率; '我不知道' 在数据里几乎不出现, 概率 ≈ 0。",
    geo:"一条概率最高的路径穿过词的海洋, 路上没有真假标记牌。作者 '张' 是真的, 下一步却被 300 条 '史密斯 2019 doi 10.1016…' 的高频模板拽走: 路径流畅, 落点是编的。",
    comp:"解码取 argmax 或采样; 罕见上下文的条件分布由平滑/泛化主导 (熵高), 但 argmax 依然给出一个确定的词, 且平均置信度与正确率无关。对策: 把权威材料放上下文, 要求逐句引用, 交叉验证。"
  },
  proof:{
    from:"最大似然 = 最小化交叉熵; softmax 的严格正性; 训练语料的统计 (模板多、'不知道' 少)",
    to:"为什么幻觉是目标函数的必然产物而不是能力不足、为什么伪造引用格式完美、为什么自信与正确无关",
    steps:[
      ["MLE: θ* = argmax Σ log p_θ(x_t | x_<t); 对数据分布取期望等价于最小化 KL(p_data ‖ p_θ); 目标只衡量 '像不像训练数据'","交叉熵 = 熵 + KL; 熵与 θ 无关; 目标函数里不存在 '与世界一致' 的项"],
      ["softmax 输出对每个词都是正数, 所以模型对任何续写 (包括从未见过的组合) 都给非零概率; 编造的句子是这些正概率的乘积","e^z > 0; 平滑/泛化是模型存在的意义, 也是编造的来源"],
      ["模板句占语料 300/301, 所以 p(2019 | al)、p(10.1016/… | doi) 极高; 从真作者 'zhang' 出发, 贪心解码被拽进模板: 'zhang et al 2019 doi 10.1016/j.cell.2019.000'","每一步取条件概率最大的词, 最大的词来自高频模板; 整句的 log p 编造 −7.8 > 真实 −17.5"],
      ["伪造引用因此格式完美: 格式是高频模式, 学得最好; 具体的 DOI 数字是罕见细节, 学得最差, 就被最像的模式补全","模式的频率决定它被复现的保真度; 实体细节是长尾"],
      ["'我不知道' 在训练文本里几乎不出现 (人写文章时不会写不知道的东西), 其条件概率 ≈ 平滑项 (3e-5), 比任何流畅的错误答案低几个数量级","MLE 把概率分配给数据里出现过的东西; 沉默没有数据"],
      ["罕见上下文 ('zhang' 只见过 1 次) 的条件分布熵更高 (1.12 bit vs 0.01), 但 argmax 依然给出一个词, 且贪心置信度 0.77 与正确率 0.60 之间没有校准关系","解码总会输出一个 token; 语气 (置信度) 来自局部条件分布的尖锐程度, 与全局真伪无关"],
      ["对策全部在改变条件: 把权威材料放进上下文 (让正确续写成为高似然), 要求引用 (让可验证性进入输出), 交叉验证 (在模型之外判真)","既然目标函数不含真, 真只能从外部注入或外部检验"]
    ],
    end:"幻觉 = 最大似然 + 严格正的 softmax + 没有 '不知道' 的语料; 它是目标函数的性质, 所以检索与验证比调温度有效。"
  },
  scratch:{ lang:'python', code:"import numpy as np\nfrom collections import Counter, defaultdict\nnp.random.seed(0)\n# 语料: 300 条 \"smith et al 2019 doi 10.1016/j.cell.2019.00N\" 模板句 + 1 条 zhang 的真引用\ncorpus = ['smith et al 2019 doi 10.1016/j.cell.2019.%03d' % (i % 7) for i in range(300)]\ncorpus.append('zhang et al 2021 doi 10.1038/s41586-021-999')\nbig = defaultdict(Counter); uni = Counter()\nfor s in corpus:\n    ws = s.split() + ['<eos>']\n    for a, b in zip(['<s>'] + ws, ws): big[a][b] += 1; uni[a] += 1\nV = sorted(set(uni) | {'<eos>'}); eps = 0.01\np = lambda b, a: (big[a][b] + eps)/(uni[a] + eps*len(V))            # 最大似然 bigram + 平滑 (softmax 永不为 0 的替身)\ndef greedy(prefix, n=8):\n    ws = prefix.split()\n    for _ in range(n):\n        ws.append(max(V, key=lambda w: p(w, ws[-1])))\n        if ws[-1] == '<eos>': break\n    return ' '.join(ws)\nprint('续写 \"zhang et al\" ->', greedy('zhang et al'))\nprint('-> 作者是真的, 年份和 DOI 被高频模板带走: 格式完美的假引用. 训练只奖励 p(下一词|前文) 高, 从未奖励\"真\"')\n# 1) 概率最高的整句 vs 真句: 编出来的比真的更\"像话\"\ndef logp(s):\n    ws = s.split() + ['<eos>']; return sum(np.log(p(b, a)) for a, b in zip(['<s>'] + ws, ws))\nfake = 'zhang et al 2019 doi 10.1016/j.cell.2019.000'; real = corpus[-1]\nprint('log p(编造句) = %.2f  >  log p(真句) = %.2f' % (logp(fake), logp(real)))\n# 2) \"不知道\" 从未出现 -> 概率 ≈ 0; 任何流畅错误答案都比它高几个量级\nprint('p(任何未见词 | doi) = %.5f   vs   p(10.1016/j.cell.2019.000 | doi) = %.3f' % (p('idk', 'doi'), p('10.1016/j.cell.2019.000', 'doi')))\n# 3) 罕见上下文: 条件分布由平滑 (=模式补全) 主导, 但 argmax 依然给出一个\"确定\"的词\nH = lambda a: -sum(p(w, a)*np.log2(p(w, a)) for w in V)\nfor a in ('smith', 'zhang', '2021'): print('上下文 %-6s 见过 %3d 次  下一词熵 %.2f bit  argmax 概率 %.3f  argmax = %s' % (a, uni[a], H(a), max(p(w, a) for w in V), max(V, key=lambda w: p(w, a))))\n# 4) 自信 != 正确: 在真句上逐词看 argmax 对不对\nfor s in (real, corpus[3]):\n    ws = s.split(); ok = [max(V, key=lambda w: p(w, a)) == b for a, b in zip(ws, ws[1:])]\n    print('%-44s 贪心逐词正确率 %.2f  (平均 argmax 概率 %.2f)' % (s, np.mean(ok), np.mean([max(p(w, a) for w in V) for a in ws[:-1]])))", out:"续写 \"zhang et al\" -> zhang et al 2019 doi 10.1016/j.cell.2019.000 <eos>\n-> 作者是真的, 年份和 DOI 被高频模板带走: 格式完美的假引用. 训练只奖励 p(下一词|前文) 高, 从未奖励\"真\"\nlog p(编造句) = -7.80  >  log p(真句) = -17.53\np(任何未见词 | doi) = 0.00003   vs   p(10.1016/j.cell.2019.000 | doi) = 0.143\n上下文 smith  见过 300 次  下一词熵 0.01 bit  argmax 概率 0.999  argmax = et\n上下文 zhang  见过   1 次  下一词熵 1.12 bit  argmax 概率 0.863  argmax = et\n上下文 2021   见过   1 次  下一词熵 1.12 bit  argmax 概率 0.863  argmax = doi\nzhang et al 2021 doi 10.1038/s41586-021-999  贪心逐词正确率 0.60  (平均 argmax 概率 0.77)\nsmith et al 2019 doi 10.1016/j.cell.2019.003 贪心逐词正确率 0.80  (平均 argmax 概率 0.83)",
    note:"bigram 计数 + 平滑就是第 1–2 步的 MLE 与严格正性; greedy('zhang et al') 与 log p 对比对应第 3–4 步; p(未见词 | doi) 对应第 5 步; 三种上下文的熵与 argmax 概率、贪心正确率对应第 6 步。" },
  contrast:[
    {vs:"过拟合", same:"都是 '训练分布 vs 现实' 的错位", diff:"过拟合是记住训练噪声; 幻觉是在训练分布内生成了流畅但与世界不符的内容, 训练数据本身可能全对", when:"幻觉不能靠加数据/正则消除, 要改变条件 (上下文) 或加外部验证"},
    {vs:"采样温度 (gm.temperature)", same:"都影响输出是否离谱", diff:"温度只改变同一分布的尖锐度; 低温也会自信地输出高概率的错误 (贪心就是 T→0)", when:"调温度治不了幻觉; 事实类任务用低温 + 上下文"},
    {vs:"RAG (lm.rag)", same:"RAG 是最有效的单一对策", diff:"RAG 改变条件分布的条件, 让正确内容成为高似然", when:"召回不到时 RAG 也会编: 它只是把问题移到了检索"},
    {vs:"迎合 (lm.eval_align)", same:"都是目标函数副作用", diff:"幻觉来自似然目标, 迎合来自偏好目标", when:"两者叠加: 模型会自信地迎合你说出编造的事实"}
  ],
  ext:[
    {t:"最大似然与交叉熵", go:"pr.mle"},
    {t:"条件分布的熵", go:"pr.entropy"},
    {t:"改变条件: 把材料放上下文", go:"lm.rag"},
    {t:"解码温度改变什么", go:"gm.temperature"}
  ]
},

'lm.eval_align': {
  layers:{
    alg:"固定测试集 n 条, 胜率 p̂ 的标准误 √(p(1−p)/n): n = 1 时区间 [0, 1], n = 50 时 ±0.14。裁判模型 J(A, B) 有位置项 (先出现的 +) 与长度项 (长的 +); 交换顺序取平均消位置项。偏好优化: max E[log σ(r_w − r_l)], 只对齐偏好。",
    geo:"先做一把尺子 (测试集), 再谈调模型。没有尺子时每次改动只能凭单条印象, 而单条的方差大到区间是 [0, 1]。裁判是一把有系统偏差的尺: 总往先出现的、更长的那边偏。",
    comp:"30–50 条固定输入 + 判分规则, 每次改动全跑一遍; LLM 裁判固定评分标准、随机化 A/B 位置各跑一次、抽样人工复核; 裁判模型与被测模型不同。"
  },
  proof:{
    from:"二项比例的方差; 加性偏差模型; 偏好优化的目标函数",
    to:"为什么单条对比不可靠、位置/长度偏差从哪来怎么消、为什么对齐调的是偏好不是正确",
    steps:[
      ["观测胜率 p̂ ~ Binomial(n, p)/n, 方差 p(1−p)/n; 真实胜率 0.6 时 n = 1 的 95% 区间是 [0, 1], 有 39% 概率看到 '没变好'; n = 200 才把区间压到 [0.53, 0.67]","方差随 1/n 缩小; 单条观测的信息量是 1 个比特"],
      ["所以先建固定测试集再改动: 同一批输入前后各跑一遍, 比较的是配对差异, 方差更小且不受输入分布变化影响","配对设计消掉输入本身的方差; 固定集让改动之间可比"],
      ["裁判模型的判决可写成 s = 真实优劣 + 位置偏差 + 长度偏差 + 噪声; 位置偏差是常数项, 只与谁先出现有关","这是加性模型的假设; 模拟里 A 先出现时判 A 胜 0.61 而真实 0.50"],
      ["把 A/B 交换再判一次, 位置项符号相反, 两次平均后抵消 (0.505); 只保留两次一致的样本, 准确率从 0.74 升到 0.88","对称化: f(A,B) 与 −f(B,A) 的平均消掉不随交换变号的项"],
      ["长度偏差不随交换变号 (A 更长时判 A 胜 0.73, 更短时 0.50), 交换消不掉; 只能控制长度或在评分标准里明确不奖励长度","长度是内容属性不是位置属性; 需要不同的对策"],
      ["同一个模型给自己打分, 偏差与被测模型的偏差相关 (同样的风格偏好), 系统性偏高; 裁判要用不同模型并抽样人工核对","相关的误差不会在平均中抵消"],
      ["偏好优化 (RLHF/DPO) 最大化 '人类更喜欢的那个' 的概率; 若人类 60% 偏好迎合且长的答案, 优化后模型选它的概率收敛到 0.60, 与它是否正确无关","目标函数里的信号是偏好标签, 不是正确性标签; 迎合 (sycophancy) 是这个目标的直接后果"]
    ],
    end:"评测先于改动, 尺子要够长 (n) 且要校直 (交换位置、换裁判); 对齐让模型更像人喜欢的样子, 不让它更对。"
  },
  scratch:{ lang:'python', code:"import numpy as np, math\nnp.random.seed(0)\n# 1) 单条对比 vs 固定测试集: 真实胜率 0.6 的改动, n 条能不能分辨\nfor n in (1, 5, 30, 50, 200):\n    w = np.random.binomial(n, 0.6, 20000)/n\n    print('n=%3d  观测胜率 95%% 区间 [%.2f, %.2f]   误判为\"变差或持平\"的概率 %.2f' % (n, np.percentile(w, 2.5), np.percentile(w, 97.5), (w <= 0.5).mean()))\n# 2) 有偏裁判: 位置偏差 + 长度偏差; 交换顺序各判一次可消位置偏差, 消不掉长度偏差\ndef judge(la, lb, a_better, pos_bias=0.3, len_bias=0.003):\n    s = 0.6*(1 if a_better else -1) + pos_bias + len_bias*(la - lb) + 0.8*np.random.randn(); return s > 0   # True = 判 A 胜\nN = 5000; a_better = np.random.rand(N) < 0.5; la = np.random.randint(50, 400, N); lb = np.random.randint(50, 400, N)\none = np.array([judge(la[i], lb[i], a_better[i]) for i in range(N)])\nswap = np.array([not judge(lb[i], la[i], not a_better[i]) for i in range(N)])      # 交换 A/B 再判, 取反回到 A 视角\nprint('真实 A 更好比例 %.3f | 单次裁判判 A 胜 %.3f (位置偏差) | 交换后平均 %.3f' % (a_better.mean(), one.mean(), (one.mean() + swap.mean())/2))\nagree = one == swap\nprint('裁判准确率: 单次 %.3f | 只保留两次判断一致的样本 %.3f (保留 %.0f%%)' % ((one == a_better).mean(), (one[agree] == a_better[agree]).mean(), 100*agree.mean()))\nlonger = la > lb; print('与真实无关的长度效应: A 更长时判 A 胜 %.3f, A 更短时 %.3f' % (one[longer].mean(), one[~longer].mean()))\n# 3) 偏好优化调的是偏好: 正确但短 (人类偏好 0.4) vs 迎合且长 (偏好 0.6), 优化后模型概率跟着偏好走\npref, logit = 0.6, 0.0\nfor _ in range(500):\n    q = 1/(1 + math.exp(-logit)); logit += 0.1*(pref*(1 - q) - (1 - pref)*q)      # 最大化 E[log p(被偏好的那个)]\nprint('偏好优化后 模型选\"迎合长答案\"的概率 = %.2f = 人类偏好率 %.2f;  目标里没有\"正确\"这一项' % (1/(1 + math.exp(-logit)), pref))", out:"n=  1  观测胜率 95% 区间 [0.00, 1.00]   误判为\"变差或持平\"的概率 0.39\nn=  5  观测胜率 95% 区间 [0.20, 1.00]   误判为\"变差或持平\"的概率 0.31\nn= 30  观测胜率 95% 区间 [0.43, 0.77]   误判为\"变差或持平\"的概率 0.17\nn= 50  观测胜率 95% 区间 [0.46, 0.74]   误判为\"变差或持平\"的概率 0.10\nn=200  观测胜率 95% 区间 [0.53, 0.67]   误判为\"变差或持平\"的概率 0.00\n真实 A 更好比例 0.497 | 单次裁判判 A 胜 0.614 (位置偏差) | 交换后平均 0.505\n裁判准确率: 单次 0.735 | 只保留两次判断一致的样本 0.876 (保留 62%)\n与真实无关的长度效应: A 更长时判 A 胜 0.725, A 更短时 0.499\n偏好优化后 模型选\"迎合长答案\"的概率 = 0.60 = 人类偏好率 0.60;  目标里没有\"正确\"这一项",
    note:"首段五个 n 的区间对应第 1 步; judge() 的加性模型与交换后平均 0.505 对应第 3–4 步; 长度效应两行对应第 5 步; 末段 logit 迭代收敛到 0.60 对应第 7 步。" },
  contrast:[
    {vs:"传统 ML 指标 (ml.metrics)", same:"都要固定测试集", diff:"分类有唯一标签, 语言输出没有, 所以评测集要自己造判分规则或用裁判", when:"能写成确定性检查 (JSON 合法、数字对) 的先写成检查, 剩下的再用裁判"},
    {vs:"多重检验 (si.multiple_testing)", same:"改动很多次、每次看一眼, 就是多重比较", diff:"评测集小 + 反复改动 = 对测试集过拟合", when:"留一个从不看的最终集"},
    {vs:"A/B 测试", same:"都是配对/随机化对比", diff:"A/B 在真实流量上, 评测集在固定输入上", when:"上线前评测集, 上线后 A/B"},
    {vs:"幻觉 (lm.hallucination)", same:"都是目标函数的副作用", diff:"幻觉来自似然, 迎合来自偏好", when:"评测时故意反驳一次测迎合, 故意问冷门事实测幻觉"}
  ],
  ext:[
    {t:"固定集上的配对比较是假设检验", go:"pr.hypothesis"},
    {t:"反复改动反复看就是多重比较", go:"si.multiple_testing"},
    {t:"迎合与幻觉的共同根源", go:"lm.hallucination"},
    {t:"通用分类指标", go:"ml.metrics"}
  ]
},

'lm.research_use': {
  layers:{
    alg:"净收益 = t_自己做 − t_验证 − 出错率 × (1 − 检出率) × 漏检代价。t_验证 ≪ t_自己做 且漏检代价可控时为正 (写代码、改句子); 事实、统计、临床判断的 t_验证 ≥ t_自己做 且漏检代价巨大, 为负。",
    geo:"一条分界线: 左边是你两分钟能看出对错的任务, 右边不是。只在左边用。右边最危险的一格是 '它给了一个听起来合理的统计方法', 因为它会忽略你实验的嵌套结构。",
    comp:"用它: 样板代码、debug 报错、改写自己写的句子、解释别人的代码、造测试数据。不用它: 查文献事实、替你选统计方法并直接采信、生成看起来像数据的数字。统计方法必须自己能讲清楚为什么。"
  },
  proof:{
    from:"期望值决策; LLM 的错误率非零且与语气无关 (lm.hallucination); 嵌套数据的独立性假设",
    to:"为什么 '可快速验证' 是唯一的使用准则、为什么统计建议是最危险的一类",
    steps:[
      ["把一次使用写成期望: 收益 = 省下的时间, 成本 = 验证时间 + 漏检错误的期望代价 = 出错率 × (1 − 检出率) × 代价","这是决策的期望效用; 三项都可以粗估"],
      ["代码、翻译、改写: 验证是 '跑一下/读一遍', 几分钟, 检出率高, 漏检代价小 (报错会暴露), 净收益为正 (+28、+9 分钟)","验证信号明确且即时; 错误不会潜伏"],
      ["文献事实、统计方法、临床判断: 验证 = 自己去查/自己去学, 时间 ≥ 自己做; 漏检代价是论文撤稿或错误结论; 净收益为负 (−35、−170 分钟)","错误不自曝, 检出率低; 代价延迟且巨大"],
      ["统计建议最危险的具体形态: 5 只鼠 × 40 个细胞, 它会说 '两组各 200 个细胞做 t 检验'; 组间无真实差异时假阳性率 0.75 而非 0.05","细胞不是独立样本, 共享鼠效应; 有效 n 是 5 不是 200, 标准误被低估 √40 倍"],
      ["正确做法以鼠为单位 (每鼠取均值再检验, 或混合模型), 假阳性率回到 0.04","独立性假设在鼠层面成立; 这需要你知道自己的实验结构, 模型不知道"],
      ["所以 '一句话准则': 我能在两分钟内验证它对不对吗? 能就用, 不能就自己做; 尤其是任何要写进论文的数字与方法","两分钟是 t_验证 ≪ t_自己做 的操作化; 论文里的东西漏检代价最大"]
    ],
    end:"LLM 的价值 = 省下的时间 − 验证它的时间; 验证便宜的事交给它, 验证昂贵的事 (事实、统计、临床) 自己做。"
  },
  scratch:{ lang:'python', code:"import numpy as np, math\nnp.random.seed(0)\n# 1) 净收益 = 省下的时间 - 验证时间 - 漏检错误的代价 x 出错率 x (1 - 检出率)\ndef net(t_self, t_verify, err, cost_miss, catch): return t_self - t_verify - err*(1 - catch)*cost_miss\ntasks = [('写样板代码 (跑一下就知道)', 30, 2, 0.3, 10, 0.95), ('改写自己写的英文句子', 10, 1, 0.1, 2, 0.9),\n         ('查一条文献事实', 15, 20, 0.3, 200, 0.5), ('选统计方法并直接采信', 60, 90, 0.4, 500, 0.3)]\nfor name, ts, tv, er, cm, ca in tasks: print('%-26s 自己做 %3d min  验证 %3d min  净收益 %+6.0f min' % (name, ts, tv, net(ts, tv, er, cm, ca)))\n# 2) 它最常给的统计错误: 忽略嵌套. 两组各 5 只鼠, 每鼠 40 个细胞, 组间无任何真实差异\ndef p_z(a, b): t = (a.mean() - b.mean())/math.sqrt(a.var(ddof=1)/len(a) + b.var(ddof=1)/len(b)); return math.erfc(abs(t)/math.sqrt(2))\ndef p_perm(a, b, n=1000):                              # 以鼠为单位的置换检验 (n 小, 不用 t 分布近似)\n    obs = abs(a.mean() - b.mean()); pool = np.concatenate([a, b]); hit = 0\n    for _ in range(n): np.random.shuffle(pool); hit += abs(pool[:len(a)].mean() - pool[len(a):].mean()) >= obs\n    return hit/n\nmice, cells, sims = 5, 40, 300; fp_cell = fp_mouse = 0\nfor _ in range(sims):\n    mu = np.random.randn(2, mice)                                         # 鼠间差异 (真实存在, 与处理无关)\n    X = mu[:, :, None] + 0.5*np.random.randn(2, mice, cells)              # 细胞级噪声\n    fp_cell += p_z(X[0].ravel(), X[1].ravel()) < 0.05                     # 200 vs 200 个细胞当独立样本\n    fp_mouse += p_perm(X[0].mean(1), X[1].mean(1)) < 0.05                 # 5 vs 5 只鼠\nprint('无真实差异时的假阳性率: 细胞当样本 %.2f | 鼠当样本 %.2f  (名义 0.05)' % (fp_cell/sims, fp_mouse/sims))\nprint('-> \"细胞 n=200, p<0.001\" 听起来合理, 却把 5 只鼠的差异当成了处理效应. 这类错误验证成本高, 必须自己懂')\n# 3) 两分钟准则的量化形式\nprint('该用 <=> t_verify << t_self 且 漏检代价可控;  代码/翻译/改写满足, 事实/统计/临床不满足')", out:"写样板代码 (跑一下就知道)             自己做  30 min  验证   2 min  净收益    +28 min\n改写自己写的英文句子                 自己做  10 min  验证   1 min  净收益     +9 min\n查一条文献事实                    自己做  15 min  验证  20 min  净收益    -35 min\n选统计方法并直接采信                 自己做  60 min  验证  90 min  净收益   -170 min\n无真实差异时的假阳性率: 细胞当样本 0.75 | 鼠当样本 0.04  (名义 0.05)\n-> \"细胞 n=200, p<0.001\" 听起来合理, 却把 5 只鼠的差异当成了处理效应. 这类错误验证成本高, 必须自己懂\n该用 <=> t_verify << t_self 且 漏检代价可控;  代码/翻译/改写满足, 事实/统计/临床不满足",
    note:"net() 与四类任务对应第 1–3 步; 嵌套模拟 (细胞当样本 0.75 vs 鼠当样本 0.04) 对应第 4–5 步; 末行是第 6 步的准则。" },
  contrast:[
    {vs:"幻觉 (lm.hallucination)", same:"都关于 '它会错'", diff:"幻觉讲为什么会错; 这里讲错的代价何时可承受", when:"先接受它会错, 再按验证成本分配任务"},
    {vs:"重复水平 / 伪重复 (ex.replicate_level)", same:"嵌套例子就是伪重复", diff:"那里讲统计原理; 这里讲为什么不能把这个判断外包", when:"设计与分析单位自己定, 模型只当候选清单"},
    {vs:"RAG 辅助文献查找 (lm.rag)", same:"都涉及文献", diff:"RAG 把原文放进上下文并要求引用, 把 '查事实' 变成 '核对引用', 验证成本降下来", when:"有 RAG 且能点开原文时文献任务可移到分界线左边"},
    {vs:"搜索引擎", same:"都能给答案", diff:"搜索引擎给来源, LLM 给综合; 综合没有来源就无法验证", when:"要来源用搜索/RAG, 要综合用 LLM 然后回查来源"}
  ],
  ext:[
    {t:"为什么它会自信地错", go:"lm.hallucination"},
    {t:"嵌套数据的分析单位", go:"ex.replicate_level"},
    {t:"统计假设要自己核对", go:"si.assumptions"},
    {t:"把文献任务变成核对任务", go:"lm.rag"}
  ]
},

});
