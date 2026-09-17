// 数理宇宙 v2 · 深化层：pt PyTorch 大陆（11 节点）
// 只 push 到 window.DEEP，不改动 v1 任何文件。
window.DEEP = window.DEEP || {};
Object.assign(window.DEEP, {

'pt.tensor': {
  route: [
    {q:'报错先过四道筛：shape / device / dtype / 计算图。这次是哪一道？', a:[
      {c:'shapes cannot be multiplied、size mismatch、stack expects equal size', to:'shape 筛。在出错行前打印 x.shape，逐维核对，走 pt.debug_shape'},
      {c:'found at least two devices, cuda:0 and cpu', to:'device 筛。数据搬了没有，模型搬了没有，两者是不是同一次 .to 出来的'},
      {c:'expected scalar type Long but found Float、result type Float can not be cast', to:'dtype 筛。label 要 long，输入要 float32，from_numpy 会原样带进 float64'},
      {c:'does not have a grad_fn、backward a second time', to:'计算图筛，走 pt.autograd'}]},
    {q:'这个张量是从哪来的？决定了它有没有共享内存', a:[
      {c:'torch.from_numpy(a) / a.numpy() / x.view / x[1:3] / x.T', to:'共享底层 storage。改一头另一头跟着变，改完再排错会查不出来'},
      {c:'torch.tensor(a) / x.clone() / x.contiguous() 在非连续时', to:'真拷贝，独立'}]},
    {q:'要把张量转成 numpy 画图或存表，报了错？', a:[
      {c:'Can not call numpy() on Tensor that requires grad', to:'先 .detach()'},
      {c:'can not convert cuda tensor to numpy', to:'再 .cpu()。标准写法 x.detach().cpu().numpy()'},
      {c:'只是要一个数写日志', to:'x.item()。append(loss) 会把整张图钉在显存里'}]}
  ],
  deep:`**张量不是数组，是「一块 storage + 一副读法 + 三张标签」。** storage 是一段连续的一维内存；shape 和 stride 告诉你怎么把这段一维内存读成多维；device 说它住在哪块内存；dtype 说每个格子几个字节怎么解释；requires_grad/grad_fn 说这块数据是不是账本上的一个节点。ndarray 只有前两样，多出来的两样正是 PyTorch 特有的两类失败。

**view 与 copy 的分界线，就在 stride 能不能表达。** x.view / x[::2] / x.T / x.permute 都不动一个字节，只改 shape 与 stride，所以它们零成本且共享内存。x.T 之后 stride 变成非递减，张量不再 contiguous，于是 view 报错要你先 .contiguous()（这一步才真拷贝），而 reshape 会自动替你在必要时拷贝——这就是 view 和 reshape 唯一实质区别：view 拒绝隐式拷贝，reshape 接受。

**三种等价理解。** 代数上，读取 x[i,j,k] 就是 storage[offset + i·s0 + j·s1 + k·s2]，多维索引只是一个线性映射。几何上，张量是一块方砖，view 是换一种切法看同一块砖，permute 是转个角度看，clone 才是再刻一块。计算上，逐元素运算受访存带宽限制，矩阵乘受算力限制——所以 100 个小 op 常常比 1 个大 matmul 还慢。

**dtype 的两条硬边界。** 一，索引类张量（CrossEntropyLoss 的 target、gather 的 index、mask 之外的下标）必须是 int64，浮点索引一律报错。二，numpy 的默认浮点是 float64，torch.from_numpy 会忠实带进来，然后和 float32 的权重相乘时报 dtype 不匹配；把一整张 flow cytometry 特征表按 float64 送进 GPU 还会白占一倍显存。入口处统一写 .astype(np.float32) 是最省事的做法。

**边界。** .numpy() 只在 CPU、非 requires_grad 时成立，因为它要求共享同一段内存；GPU 上根本不是同一块物理内存，梯度记录也无法用 ndarray 表达。`,
  worked:[
    {q:'RuntimeError: expected scalar type Long but found Float，出现在 loss = F.cross_entropy(logits, y)。定位并修。',
     steps:[
      ['先看是谁的 dtype 不对','cross_entropy 的两个入参角色不同：logits 必须浮点，target 必须是 int64 的类别索引。报 Long 但拿到 Float，说明 y 是浮点'],
      ['回溯 y 的来源','y 多半来自 pandas 的一列或 np.array 的默认 float64，经 torch.from_numpy 原样带进来'],
      ['确认 y 的语义','打印 y[:5]。如果是 0/1/2 这类整数值，就是索引，只是类型错；如果是 one-hot 的 (N,C)，那是形状也错了'],
      ['修','索引情形写 y = y.long()；one-hot 情形写 y = y.argmax(1).long()，或换 BCEWithLogitsLoss 做多标签']],
     a:'target 被当成浮点。y = y.long()（若是 one-hot 先 argmax(1)）',
     meta:'凡是「类别、下标、索引」的张量，dtype 一律 int64。'},
    {q:'训练脚本每个 epoch 显存涨一点，20 个 epoch 后 CUDA out of memory。代码里 losses.append(loss) 用来画曲线。',
     steps:[
      ['先分清是什么在涨','参数、梯度、优化器状态都是固定大小，涨的只可能是被引用住的中间量'],
      ['loss 是一个带 grad_fn 的张量','把它 append 进 list 等于持有这张计算图的根，整条前向的全部激活都无法释放'],
      ['估一下量级','ResNet 级模型一个 batch 的激活是几百 MB；留 20 个就是十几 GB'],
      ['修','append(loss.item()) 或 append(loss.detach().cpu())。item() 只取一个 python 数，图立刻可回收']],
     a:'loss 张量把计算图钉住了。改成 losses.append(loss.item())',
     meta:'任何跨 step 保存的东西都要先脱离图：.item() / .detach()。'},
    {q:'a = np.random.rand(3); x = torch.from_numpy(a); a[0] = 99。x[0] 是多少？把 x 换成 torch.tensor(a) 呢？',
     steps:[
      ['from_numpy 的语义','共享 storage，不拷贝，只是给同一段内存套一副 torch 的读法'],
      ['所以 a 的写入对 x 可见','x[0] 变成 99.0'],
      ['torch.tensor(a) 的语义','构造函数总是拷贝（还会给一条 UserWarning 建议用 clone().detach()）'],
      ['结论','torch.tensor 情形 x[0] 保持原值不变']],
     a:'from_numpy 时 x[0]=99.0；torch.tensor(a) 时 x[0] 不变',
     meta:'共享还是拷贝，看这个 op 有没有可能只改 stride。'}
  ],
  feyn:['同一段内存怎么会同时是 (2,6) 和 (3,4)？stride 在这里做了什么？',
        'x.T 之后为什么 view 会报错而 reshape 不会？',
        '为什么 GPU 上的张量不能直接 .numpy()，而 CPU 上可以？',
        'losses.append(loss) 为什么会 OOM，append(loss.item()) 为什么不会？'],
  exam:'flow cytometry 导出的表用 pandas 读进来默认是 float64，直接 from_numpy 会得到 float64 张量，和 float32 的 Linear 相乘立刻报 dtype 错，即使不报也白占一倍显存。固定入口写法：df.values.astype(np.float32) → torch.from_numpy → .clone() 断开共享。门控标签一列单独走 .astype(np.int64)。tetramer+ 比例这类要画图的中间量，一律 .detach().cpu().numpy() 之后再交给 matplotlib，否则在跑通训练之前先被 OOM 拦住。',
  pit:[
    {t:'用 torch.tensor(x) 去拷贝一个已经是张量的东西', why:'会触发警告并且切断了梯度语义，容易在别处引出 does not require grad', fix:'张量到张量用 x.clone()（要保梯度）或 x.detach().clone()（要断）'},
    {t:'from_numpy 之后继续在 numpy 侧做 in-place 数据增强', why:'共享内存，模型输入被悄悄改掉，指标怪但不报错', fix:'from_numpy(...).clone()，或增强全部在 torch 侧做'},
    {t:'把整张特征表按 float64 送上 GPU', why:'显存翻倍，且大量 kernel 对 float64 的吞吐只有 float32 的 1/32', fix:'入口统一 float32；只有数值敏感的统计量才留 float64 且留在 CPU'},
    {t:'用 x.data 去取数据绕开梯度', why:'.data 绕过版本计数检查，in-place 改动不会报错而是静默给出错梯度', fix:'一律用 .detach()'},
    {t:'shape 打印用 len(x) 或 x.size()[0]', why:'只看了第一维，真正错的常常是最后一维', fix:'print(x.shape, x.dtype, x.device) 三样一起打，养成条件反射'}
  ]
},

'pt.autograd': {
  route: [
    {q:'backward 相关报错，先分四类', a:[
      {c:'element 0 of tensors does not require grad and does not have a grad_fn', to:'图断了。往上找：是不是在 no_grad 里做的前向、是不是中途 .detach()/.item()/.numpy() 过、参数是不是被 requires_grad=False 冻了'},
      {c:'Trying to backward through the graph a second time', to:'同一张图被求了两次导。先问是不是忘了在循环里重新 forward，其次才考虑 retain_graph=True'},
      {c:'grad can be implicitly created only for scalar outputs', to:'loss 不是标量。写 loss.mean().backward()，或显式给 backward(torch.ones_like(loss))'},
      {c:'one of the variables needed for gradient computation has been modified by an inplace operation', to:'版本计数对不上。把 x += 改成 x = x + ，或把 relu_(inplace=True) 关掉'}]},
    {q:'不报错但梯度是 None 或全 0', a:[
      {c:'p.grad is None', to:'这个参数从没参与过 loss，或者从没 backward 过。打印 loss.grad_fn 看图是否存在'},
      {c:'p.grad 全 0', to:'确实进了图但上游梯度是 0：ReLU 死区、饱和的 sigmoid、被 mask 掉的位置、或 loss 里这一项系数为 0'},
      {c:'p.grad 是 nan', to:'查 log(0)、除 0、sqrt(0) 的导数、以及输入里的 nan。用 torch.autograd.set_detect_anomaly(True) 定位到具体 op'}]},
    {q:'图该不该保留？', a:[
      {c:'训练循环里每个 batch 重新前向', to:'不保留。默认释放就是对的，不要加 retain_graph'},
      {c:'两个 loss 共享同一段前向（GAN、多任务）', to:'要么 (l1+l2).backward() 一次搞定，要么第一次 retain_graph=True'},
      {c:'验证 / 推理 / 算指标', to:'整块包 with torch.no_grad()，根本不建图'}]}
  ],
  deep:`**动态图是「前向执行时顺手记下的一条反向指令流」。** 每做一次运算，若输入里有任何一个 requires_grad=True 的张量，autograd 就新建一个 Node（比如 MulBackward0、AddmmBackward0），把它挂到输出张量的 .grad_fn 上，并把这个 Node 的 next_functions 指向各个输入的 grad_fn（叶子则指向 AccumulateGrad）。于是前向跑完，你手里的 loss 就是一张有向无环图的根。define-by-run 的含义是：图是 python 控制流跑出来的副产品，if/for/while 写什么它就长什么，所以每个 batch 的图可以完全不同——变长序列、动态早退都是免费的。

**backward 做的三件事。** 一，从 loss 出发按拓扑序倒着走；二，每个 Node 把上游传来的 grad_output 乘上自己的局部雅可比（实际是 VJP，向量-雅可比积，从不显式构造雅可比矩阵）；三，走到 AccumulateGrad 就把结果加到叶子的 .grad 上。三个关键词：倒序、VJP、累加。累加是设计而非 bug，它让梯度累积和多路 loss 成为可能，代价是必须显式 zero_grad。

**为什么只有标量能直接 backward。** 反向的起点是 dL/dL = 1，只有 loss 是标量时这个 1 才是唯一确定的。输出是向量时，你得自己指定「用哪个方向的向量去点乘雅可比」，那就是 backward(gradient=v)。写 .mean() 等价于给了 v = 1/N 的全一向量。

**图为什么默认被释放。** 每个 Node 里存着反向需要的中间量（addmm 要存输入和权重，conv 要存输入，relu 要存 mask）。这些正是显存的大头。backward 一走完就释放，是让显存回落的默认策略。retain_graph=True 意味着你决定把这几百 MB 留着——只有在真的要对同一张图求两次导时才值得。九成的 backward a second time，真实原因是把 forward 写在了循环外面。

**边界。** autograd 只跟踪张量上的 torch 运算。数值一旦经过 .item()、.numpy()、python float、或任何 no_grad 块，就永久离开了图，后面再怎么算都接不回来。**与相邻概念的分界线：** 反向传播（dl.backprop）是数学，autograd 是它的一套运行时实现；jacobian/hessian 是 autograd 之上的二阶封装；torch.compile 把动态图在不改语义的前提下捕获成静态图来提速。`,
  worked:[
    {q:'RuntimeError: element 0 of tensors does not require grad and does not have a grad_fn。代码里 loss.backward() 就在 forward 之后。',
     steps:[
      ['先确认 loss 到底有没有图','打印 loss.requires_grad 和 loss.grad_fn。若是 False / None，图确实不存在'],
      ['往上游二分','逐个打印中间张量的 requires_grad，找到第一个变成 False 的位置——图就断在它的上一步'],
      ['列断点的四种常见写法','外层套了 with torch.no_grad()（最常见，验证循环的代码被复制到训练里）；中途 .detach()；用了 .item() 或 .numpy() 再转回来；整个模型的参数被 requires_grad_(False) 冻住了'],
      ['特判：预测值来自 argmax','argmax/round/floor 这类离散化 op 导数处处为 0 且不建图，loss 若从它算起，天然无梯度'],
      ['修','训练前向拿掉 no_grad；离散化只在算准确率时用，loss 要建在 logits 上']],
     a:'loss 不在图里。逐层打印 requires_grad 找到断点，通常是误套 no_grad 或对 argmax 求导',
     meta:'梯度不动先看 loss.grad_fn 是不是 None——这一句能砍掉一半排错时间。'},
    {q:'RuntimeError: Trying to backward through the graph a second time。代码结构是：out = model(x) 写在 for 循环之外，循环里反复 loss = crit(out, y); loss.backward()。',
     steps:[
      ['读报错的字面意思','这张图的中间量在第一次 backward 后已被释放，第二次找不到'],
      ['问自己：我需要同一张图两次吗','这里显然不需要，每一步本该用新的前向结果'],
      ['诊断根因','forward 被提到循环外，等于所有 step 都在对同一次前向求导，即使加了 retain_graph 也是错的——参数更新后 out 早就过期了'],
      ['修','把 out = model(x) 挪进循环'],
      ['对照什么时候才该 retain_graph','GAN 的 D 和 G 共享一次生成器前向、多任务两个 loss 分开 backward，这两种情形第一次调用写 retain_graph=True，或者干脆 (l1+l2).backward()']],
     a:'forward 写在了循环外。把前向挪进循环，不要用 retain_graph 掩盖',
     meta:'看到 backward a second time，先怀疑前向的位置，最后才怀疑要不要保图。'},
    {q:'x = torch.tensor(2.0, requires_grad=True)，y = x**3，y.backward()，x.grad = ？不清零再跑一次同样两行，x.grad = ？',
     steps:[
      ['求导','dy/dx = 3x² = 3×4 = 12'],
      ['第一次 backward','x.grad = 12.0'],
      ['第二次是新的前向','y = x**3 重新建了一张新图，backward 合法，不会报 second time'],
      ['累加','AccumulateGrad 把新的 12 加到旧的 12 上，x.grad = 24.0']],
     a:'第一次 12.0，第二次 24.0',
     meta:'重新 forward = 新图（合法）；不 zero_grad = 梯度累加（会翻倍）。两件事要分开想。'}
  ],
  feyn:['「动态图」到底动在哪？同一段代码怎么可能每个 batch 建出不同的图？',
        '为什么向量 loss 不能直接 backward，而 loss.mean() 就可以？',
        'backward 之后图被释放，释放掉的具体是什么东西？',
        '为什么 .item() 之后就再也接不回梯度了？',
        'retain_graph=True 在什么情况下是对的，什么情况下只是在掩盖 bug？'],
  exam:'跑 T 细胞 scRNA-seq 编码器时最容易撞的是「图断了」：想加一个基于聚类标签的辅助 loss，聚类是用 numpy 的 KMeans 算的，标签再转回张量——这条支路天然没有梯度，只能当监督信号不能当可导路径。另一类是 tetramer 阳性率这种指标，写在训练循环里忘了包 no_grad，几十个 batch 之后 OOM。审论文代码时看两处：训练前向有没有被 no_grad 污染，以及有没有为了压住 backward-a-second-time 而到处撒 retain_graph——后者几乎总是掩盖了前向位置写错。',
  pit:[
    {t:'用 retain_graph=True 压住 backward a second time', why:'九成情况真实原因是前向没在循环里重跑，保图只是把错误从报错变成静默慢+涨显存', fix:'先把 forward 挪进循环；确认真的需要两次求导，再谈 retain_graph'},
    {t:'验证循环没包 no_grad 就跑几十个 batch', why:'每个 batch 都建图且没人 backward 去释放，显存单调上涨', fix:'with torch.no_grad(): 包住整个 eval 循环，或用 @torch.inference_mode()'},
    {t:'把中间量存进 list 做后处理', why:'存的是带 grad_fn 的张量，等于把每一步的整张图都留着', fix:'存 .detach() 或 .item()'},
    {t:'对 argmax / 阈值化后的预测算 loss', why:'离散化 op 不建图，梯度恒为 0，loss 会降不下去且不报错', fix:'loss 建在 logits 上；离散化只用于算准确率、混淆矩阵这类不求导的指标'},
    {t:'in-place 修改了反向还要用的中间量（x += 、relu(inplace=True) 接在需要保存输入的 op 后）', why:'版本计数变了，autograd 拒绝用一个已被改写的值算梯度', fix:'改成 x = x + ；把出错那一处的 inplace=True 关掉'},
    {t:'以为 zero_grad 和图释放是一回事', why:'zero_grad 清的是叶子的 .grad，图的释放发生在 backward 内部，两者互不相干', fix:'分开记：清账本 = zero_grad，拆脚手架 = backward 自动做'}
  ]
},

'pt.requires_grad': {
  route: [
    {q:'我想让某段不产生梯度，选哪个工具？', a:[
      {c:'一整块代码（验证、推理、算指标、生成伪标签）', to:'with torch.no_grad()。作用范围是块，块内所有新张量都不建图'},
      {c:'图上的某一个点要剪断（stop-gradient、target 网络、teacher 输出）', to:'y = x.detach()。作用范围是这一个张量，其它支路照常记账'},
      {c:'某些参数永远不训练（冻结骨干）', to:'p.requires_grad_(False)，并且优化器只收 requires_grad 为 True 的参数'},
      {c:'只想省显存跑推理，且保证不会误用', to:'torch.inference_mode()，比 no_grad 更狠，连版本计数都不记'}]},
    {q:'冻结了却发现参数还在变', a:[
      {c:'优化器是用 model.parameters() 建的', to:'Adam/SGD 带 weight decay 或动量时，即使 grad 是 None 也可能被跳过或被 decay 动到。改成 filter(lambda p: p.requires_grad, model.parameters())'},
      {c:'变的是 BatchNorm 的 running_mean/var', to:'它们是 buffer 不是 parameter，requires_grad 管不着。要冻必须 bn.eval()'},
      {c:'变的是被冻层的输出而不是权重', to:'那是正常的，输入变了输出当然变'}]},
    {q:'detach 之后又出问题', a:[
      {c:'改了 detach 出来的张量，原张量也变了', to:'detach 共享 storage。要独立写 x.detach().clone()'},
      {c:'报 modified by an inplace operation', to:'detach 出来的张量仍与原张量共用版本计数，对它 in-place 会让原图失效。同样用 .clone()'},
      {c:'下游 loss 报 does not require grad', to:'剪断点选错了，整条路径都被切了。detach 只该用在你确实不想回传的那一支'}]}
  ],
  deep:`**一条规则就够：只要一个输入的 requires_grad 是 True，输出就是 True。** autograd 对每个 op 做的是逻辑或——所以一个叶子打开开关，整条下游全部被点亮，无论中间隔了多少层、经过多少个 requires_grad=False 的常量。这就是为什么冻结骨干时，骨干的输出仍然 requires_grad=True（因为下游 head 的参数是 True，图必须一路连回来才能把梯度送到 head）；也是为什么只要输入图片本身 requires_grad=True，整个网络的每个中间量都会记账（对抗样本生成正是靠这条）。

**no_grad 与 detach 的三条区别。** 一，作用范围：no_grad 是上下文，块内每一次运算都不建图；detach 是一次性操作，只在图上剪一个口子，块外/支路外的记账照常。二，可组合性：no_grad 里做完前向，输出彻底没有 grad_fn，想再接可导支路是接不回来的；detach 允许你在一张大图上精确地只切一支（比如 GAN 里 D 看到的假样本要 detach，G 看到的不能）。三，版本计数：detach 出来的张量和原张量**共享 storage 也共享版本计数**，对它做 in-place 会让依赖原张量的反向直接报错；no_grad 块里的 in-place 则不会被记录成图上的修改，反而更容易悄悄改坏别人的中间量。**一句话记：no_grad 关的是记账这个动作，detach 断的是一根线，两者都不复制数据。**

**冻结的三层含义要分清。** 第一层，requires_grad=False：不给这个参数算梯度，省的是反向的计算和梯度显存。第二层，优化器不收它：否则 weight decay 和动量仍可能改动它。第三层，模块 .eval()：BatchNorm 的 running stats 是 buffer，跟 requires_grad 完全无关，只有 eval() 能冻住它——迁移学习里「我明明冻了骨干，指标还是每个 epoch 在漂」十有八九是这一条。

**省下的到底是什么。** requires_grad=False 让这些参数不再有 .grad（省 1 份参数大小）也不再有优化器状态（Adam 省 2 份）。但只要下游还要梯度，前向激活照样得留着——所以冻结骨干省的是参数侧的显存，不是激活侧的。真要省激活，得让整条前向都不建图，那就是 no_grad（对应「特征抽取一次性算好再训 head」这种两段式做法）。

**边界。** requires_grad 只能设在叶子张量上；对一个由运算产生的非叶子张量写 .requires_grad_(True) 会报错。想拿非叶子的梯度用 .retain_grad()。`,
  worked:[
    {q:'迁移学习：冻住 backbone 只训 head，写了 for p in model.backbone.parameters(): p.requires_grad = False，优化器仍是 Adam(model.parameters())。跑起来 backbone 的权重在变，验证指标每个 epoch 漂。查两件事。',
     steps:[
      ['第一件：优化器收了谁','Adam(model.parameters()) 把冻结参数也收进了 param_group。虽然 grad 是 None 时 Adam 会跳过，但只要有 weight_decay 且实现走的是 decoupled 路径，或者之前残留过 .grad，参数就会动'],
      ['修一','opt = Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)。同时确认冻结之前先 opt.zero_grad(set_to_none=True) 清掉残留梯度'],
      ['第二件：BatchNorm 的 running stats','它们是 buffer，requires_grad 管不到。只要 model.train()，每个 batch 都会更新 running_mean/var，等于骨干的前向行为一直在变'],
      ['修二','model.backbone.eval()，并且在每个 epoch 调完 model.train() 之后再补一次 backbone.eval()——train() 会递归把子模块全打回训练态'],
      ['验证','训练前存一份 backbone 的 state_dict，训完做逐键 allclose 比对，包含 buffer']],
     a:'优化器要 filter 掉冻结参数；BatchNorm 要 backbone.eval() 才真冻。两处都改后 state_dict 逐键 allclose 应为 True',
     meta:'冻结 = requires_grad + 优化器不收 + eval()，三件事缺一不可。'},
    {q:'GAN 训判别器：loss_D = crit(D(real),1) + crit(D(G(z)),0)。为什么 G(z) 必须 detach？不 detach 会发生什么？',
     steps:[
      ['看图的形状','D(G(z)) 的图从 D 一路连回 G 的所有参数，因为 G 的参数 requires_grad=True，按传播规则整条路都是 True'],
      ['不 detach 的后果一','loss_D.backward() 会把梯度一直送到 G 的参数上，G 的 .grad 被写脏。下一步训 G 时若没 zero_grad，用的就是被污染的梯度'],
      ['不 detach 的后果二','反向要穿过整个 G，计算量和显存都白花一倍'],
      ['detach 的位置','fake = G(z).detach()。这一刀切在 G 的输出上：D 侧照常建图（D 的参数还要更新），G 侧彻底不参与'],
      ['对照训 G 时','loss_G = crit(D(fake_not_detached), 1)，这时反而必须不 detach，梯度要穿过 D 才能到 G。此时 D 的参数用 requires_grad=False 临时关掉，或训完 D 再 zero_grad']],
     a:'不 detach 会把 D 的梯度送进 G 并污染 G 的 .grad，还白算一倍反向。fake = G(z).detach()',
     meta:'detach 用来精确控制「这一支的梯度要不要往回走」，no_grad 做不到这种一支一支的粒度。'},
    {q:'x = torch.tensor([1.,2.,3.], requires_grad=True); y = x.detach(); y[0] = 99。接着 (x**2).sum().backward() 会怎样？改成 y = x.detach().clone() 呢？',
     steps:[
      ['detach 共享 storage','y[0]=99 同时把 x[0] 改成了 99，x 的版本计数从 0 变成 1'],
      ['x**2 的反向需要 x 本身','平方的导数是 2x，autograd 保存了前向时的 x 并记下版本号'],
      ['版本对不上','backward 时发现 x 的版本已是 1，抛 RuntimeError: one of the variables needed for gradient computation has been modified by an inplace operation'],
      ['特判顺序','若先 backward 再改 y，则不报错但 x 的值已被改脏，下一步训练的输入不是你以为的那个'],
      ['clone 版本','y 有独立 storage 和独立版本计数，改 y 与 x 无关，backward 正常给出 [2,4,6]']],
     a:'detach 版本报 inplace 修改错误；clone 版本正常，x.grad = [2., 4., 6.]',
     meta:'detach 断的是梯度边，不是数据。要真正的独立副本一律 .detach().clone()。'}
  ],
  feyn:['为什么冻结了骨干，骨干的输出张量 requires_grad 还是 True？',
        'no_grad 和 detach 都让梯度不回传，它们的作用范围差在哪？',
        '为什么 detach 出来的张量做 in-place 会让原来的 backward 报错？',
        '冻结骨干省下的显存是哪一部分？哪一部分一点都没省？',
        'BatchNorm 的 running_mean 为什么设 requires_grad=False 也冻不住？'],
  exam:'aAPC 实验里常见的两段式：先用一个预训练的图像编码器把 T 细胞形态图抽成 512 维特征，再训一个小 head 预测扩增倍数。正确做法不是「冻结骨干一起训」，而是 with torch.no_grad() 把特征一次性算好存成一张表——这样每个 epoch 只跑 head，速度快一到两个数量级，激活显存几乎为零，还能反复换 head 做消融。只有当你要微调骨干时才回到冻结路线，那时记得 backbone.eval() 把 BN 也一起冻，否则小样本免疫数据上 running stats 每个 epoch 都在漂，跑两遍结果不一样，可复现性直接崩掉。',
  pit:[
    {t:'只写 requires_grad=False 就认为冻住了', why:'优化器仍持有它，BN 的 running stats 也照常更新', fix:'三件套：requires_grad_(False) + 优化器 filter + 该模块 .eval()'},
    {t:'用 no_grad 包住训练前向', why:'整张图不存在，backward 直接报 does not have a grad_fn', fix:'no_grad 只包 eval / 指标 / 伪标签生成；训练前向绝不能进'},
    {t:'detach 之后 in-place 改数据', why:'共享 storage 与版本计数，原图的反向会报错或算错', fix:'.detach().clone()'},
    {t:'在非叶子张量上调 requires_grad_(True)', why:'只有叶子能设这个开关，运算产生的张量由传播规则决定', fix:'要看中间梯度用 h.retain_grad()，或用 hook'},
    {t:'以为 model.eval() 会关掉梯度', why:'eval 只改 Dropout 和 BN 的行为，图照建、显存照涨', fix:'eval() 和 no_grad() 一起写，两件正交的事'},
    {t:'解冻时忘了把参数加进优化器', why:'优化器的 param_groups 是建的时候固定的，后加的 requires_grad=True 参数它看不见', fix:'解冻后重建优化器，或 opt.add_param_group({params: ...})'}
  ]
},

'pt.module': {
  route: [
    {q:'某层不更新 / .to(device) 搬不动它，先查登记', a:[
      {c:'层被放在 python list 或 dict 里', to:'没被注册。换 nn.ModuleList / nn.ModuleDict'},
      {c:'张量用 self.w = torch.randn(...) 直接赋值', to:'不是 Parameter，优化器看不见也不会被 to() 搬。用 nn.Parameter 包起来'},
      {c:'是不该训练但要跟着模型走的常量（mask、归一化均值、位置编码）', to:'register_buffer。它进 state_dict、跟着 to()，但不进 parameters()'},
      {c:'都不是', to:'打印 sum(p.numel() for p in model.parameters()) 和期望值对一下，差多少就知道漏了谁'}]},
    {q:'shape 在模型内部炸了，定位在哪一层', a:[
      {c:'不知道在哪层', to:'在 forward 里逐行 print(x.shape)，或注册 forward hook 一次性打印所有子模块的输入输出'},
      {c:'卡在 flatten 到 Linear 的接缝', to:'最常见。用 nn.LazyLinear 或先跑一次 dummy 前向把 in_features 打出来'},
      {c:'卡在 (B,T,C) 与 (B,C,T) 之间', to:'Conv1d 要 (B,C,T)，Linear/Transformer 要 (B,T,C)。接缝处补 transpose(1,2)'}]},
    {q:'加载 checkpoint 报键不匹配', a:[
      {c:'unexpected keys 全带 module. 前缀', to:'DataParallel 存的。剥前缀，或存的时候写 model.module.state_dict()'},
      {c:'missing keys', to:'模型现在有的层 checkpoint 里没有，结构改过。打印两边键集合做差'},
      {c:'shape mismatch 在最后一层', to:'类别数变了。有意迁移就 strict=False 并手动跳过 head'}]}
  ],
  deep:`**Module 的全部魔法就在 __setattr__ 里。** 当你写 self.fc = nn.Linear(10,2)，Module 重载的 __setattr__ 检查右边的类型：是 Module 就存进 _modules，是 Parameter 就存进 _parameters，是普通张量就当普通属性放着。parameters() 做的是递归遍历 _modules 这棵树、把每个节点的 _parameters 摊平吐出来。所以「注册」不是什么额外动作，而是赋值那一刻的类型判断——这也解释了为什么 self.layers = [nn.Linear(4,4)] 什么也不会发生：右边是 list，三个桶都不进。

**三个桶要分清。** _parameters：要训练的，进 parameters()、进 state_dict、跟着 to()。_buffers（register_buffer 注册）：不训练但属于模型状态，不进 parameters()、进 state_dict、跟着 to()——BatchNorm 的 running_mean/var、位置编码表、归一化常数都在这里。普通属性：只是个 python 字段，什么都不进，to() 也搬不动它，于是 forward 里用到它就报 device 不一致。**判据：要不要梯度 → parameters；要不要存进 checkpoint 和跟着搬卡 → buffer；两者都不要 → 普通属性。**

**forward 与 __call__ 的分界线。** 永远写 model(x) 而不是 model.forward(x)。__call__ 在调 forward 前后要跑 forward_pre_hook、forward_hook，torch.compile、量化、FSDP、profiler 全都挂在这些 hook 上。直接调 forward 会绕过它们，症状是「加了 hook 没生效」「compile 之后没变快」这类查不出原因的问题。

**shape 的心智模型。** nn.Linear 只作用在最后一维：(…, in) → (…, out)，前面所有维当成独立样本，参数量 in×out+out，与 batch 无关。Conv2d 作用在 (B,C,H,W) 的 C/H/W 上，参数量 C_out×C_in×k×k + C_out，与 H/W 无关。整个模型里唯一需要你手算的接缝就是「空间维展平之后 Linear 的 in_features 是多少」——H×W×C，跑一次 dummy 前向打出来最省事。

**边界与相邻概念。** nn.Module 管的是状态与结构，不管训练循环——PyTorch 不像 Keras 有 .fit()，循环是你自己的。nn.Sequential 是 Module 的一个特例，只能表达线性串联，有分支/残差就得自己写 forward。nn.functional 里的同名函数是无状态版本：F.relu 和 nn.ReLU 数学完全一样，区别只在前者不是 Module（不进 state_dict、不能被 hook）；而 F.linear 需要你自己传权重，因为权重本来就属于状态那一侧。`,
  worked:[
    {q:'自定义模型里写了 self.heads = [nn.Linear(64,2) for _ in range(3)]，训练时这三个 head 的权重一动不动，且 model.cuda() 之后前向报 Expected all tensors to be on the same device。一次解释两个现象。',
     steps:[
      ['查登记','print(len(list(model.parameters())))，会发现比预期少 6 个（3 个 head 各有 W 和 b）'],
      ['解释不更新','list 不是三个桶里的任何一个，_modules 里没有它们，parameters() 摊不到，优化器根本没收到这些参数'],
      ['解释 device 报错','to()/cuda() 也是遍历 _modules 和 _parameters 递归搬运，list 里的层留在 CPU，而输入已经在 cuda:0'],
      ['修','self.heads = nn.ModuleList([nn.Linear(64,2) for _ in range(3)])'],
      ['验证','再打印参数总数，并 print(next(model.heads[0].parameters()).device) 确认在 cuda:0']],
     a:'两个现象同源：list 里的层没被注册。改成 nn.ModuleList',
     meta:'「不更新」和「搬不动卡」同时出现，一定是注册问题，不是训练问题。'},
    {q:'CNN 接 Linear：输入 (B,3,224,224)，经 Conv(3→64,k=7,s=2,p=3) 与 MaxPool(k=2) 之后 flatten 接 Linear(?,10)。in_features 是多少？直接写 Linear(64,10) 会报什么？',
     steps:[
      ['算卷积输出边长','(224 + 2×3 − 7)/2 + 1 = (224+6−7)//2 + 1 = 111 + 1 = 112'],
      ['算池化后','112 / 2 = 56。此时 shape 是 (B, 64, 56, 56)'],
      ['flatten','64×56×56 = 200704。所以 in_features = 200704'],
      ['写错成 64 会报什么','RuntimeError: mat1 and mat2 shapes cannot be multiplied (Bx200704 and 64x10)——报错里的第一个数就是真实的 in_features，直接抄下来即可'],
      ['更稳的做法','用 nn.LazyLinear(10) 让它第一次前向时自动推断，或写一个 dummy 前向 print(x.shape) 一次']],
     a:'in_features = 200704；写成 64 会报 mat1 and mat2 shapes cannot be multiplied (Bx200704 and 64x10)',
     meta:'shape 报错里的两个矩阵尺寸就是答案本身，不用推，抄第一个的第二维。'},
    {q:'模型里需要一张固定的通道均值 (3,) 做归一化。self.mean = torch.tensor([...]) 与 self.register_buffer("mean", torch.tensor([...])) 差在哪三处？',
     steps:[
      ['差别一：to(device)','普通属性不在 _buffers 里，model.cuda() 搬不动它，前向做 x - self.mean 时报两个设备'],
      ['差别二：state_dict','普通属性不进 checkpoint。换台机器重建模型时若构造函数里的常数写错，权重能加载但归一化悄悄变了'],
      ['差别三：parameters()','两者都不进 parameters()，所以都不会被训练——这一处是相同的'],
      ['选择依据','不训练但属于模型状态 → buffer；纯粹的超参标量 → 普通属性也行，因为标量运算会自动广播且不涉及 device']],
     a:'buffer 会跟着 to(device) 搬、会进 state_dict；两者都不进 parameters()。张量常量一律用 register_buffer',
     meta:'只要是张量且不训练，就 register_buffer，不要用普通属性。'}
  ],
  feyn:['self.fc = nn.Linear(...) 这一行赋值，PyTorch 在背后做了什么？',
        'parameter、buffer、普通属性三者，分别进不进 parameters() / state_dict / to(device)？',
        '为什么放进 python list 的层既不更新也搬不动卡？这两件事为什么是同一个原因？',
        '为什么要写 model(x) 而不是 model.forward(x)？',
        'F.relu 和 nn.ReLU 有什么实质区别？什么时候必须用后者？'],
  exam:'做显微图像分割时最常写的自定义 Module 是「编码器 + 若干 skip 连接 + 解码器」，skip 那几层几乎一定要放 nn.ModuleList，写成 list 的话训出来的模型解码器全是随机初始值而 loss 照样在降（因为编码器和最后一层还在学），指标不高但不报错，这是最耗时的一类 bug。交付前跑一句自检：把 sum(p.numel() for p in model.parameters()) 和手算的参数量对一遍，差多少直接告诉你漏注册了哪一块。论文复现同理，Methods 里给的参数量对不上就说明结构读错了。',
  pit:[
    {t:'层放进 python list 或 dict', why:'__setattr__ 的类型判断走不到，三个桶都不进', fix:'nn.ModuleList / nn.ModuleDict'},
    {t:'可训练张量用 self.w = torch.randn(...)', why:'不是 Parameter，优化器看不见，也不跟着 to()', fix:'self.w = nn.Parameter(torch.randn(...))'},
    {t:'张量常量用普通属性', why:'to(device) 搬不动，前向报设备不一致；也不进 checkpoint', fix:'register_buffer'},
    {t:'调用写 model.forward(x)', why:'绕过 hook，profiler / compile / 量化 全部失效', fix:'一律 model(x)'},
    {t:'flatten 后的 in_features 靠猜', why:'猜错就是 mat1 and mat2 shapes cannot be multiplied，反复试很浪费', fix:'跑一次 dummy 前向打印 shape，或用 nn.LazyLinear'},
    {t:'同一个 Module 实例被复用在多处却以为是两层', why:'权重是共享的（这有时是刻意的，比如 tied embedding），参数量会比预期少一半', fix:'要独立就各 new 一个；要共享就在注释里写清楚'}
  ]
},

'pt.optimizer': {
  route: [
    {q:'参数完全不动，先按顺序排四条', a:[
      {c:'p.grad is None', to:'梯度没算出来。走 pt.autograd：是不是图断了、是不是 loss 没 backward'},
      {c:'p.grad 有值但参数不变', to:'看 step 的调用顺序和优化器收了谁。zero_grad 写在 backward 之后就是这个症状'},
      {c:'优化器是在 model.to(device) 之前建的', to:'旧写法下可能持有旧张量的引用。规矩：先 to(device)，再建优化器'},
      {c:'lr 是 0 或被 scheduler 调成了 0', to:'打印 opt.param_groups[0][lr]，别信配置文件'}]},
    {q:'loss 先降后炸 / 数值发散', a:[
      {c:'漏了 zero_grad', to:'第 n 步用的是前 n 步梯度之和，等效学习率被放大 n 倍'},
      {c:'梯度累积忘了除以 k', to:'等于把 lr 乘了 k'},
      {c:'lr 本身过大', to:'先把 lr 除以 10 复跑，能稳就是 lr 问题；加 clip_grad_norm_(params, 1.0) 兜底'},
      {c:'只在混合精度下炸', to:'走 pt.amp，先看 GradScaler 是不是在 unscale 之前就做了 clip'}]},
    {q:'CUDA out of memory，且发生在第一次 optimizer.step() 时', a:[
      {c:'用的是 Adam / AdamW', to:'step 那一刻才第一次分配 m 和 v，各占一份参数大小。总账 = 参数 + 梯度 + 2×参数'},
      {c:'换 SGD 无动量就够了', to:'状态为 0，总账降到 参数 + 梯度，直接省一半'},
      {c:'必须用 Adam 又装不下', to:'8-bit Adam、或把优化器状态放 CPU（offload）、或梯度累积配小 batch'}]}
  ],
  deep:`**优化器 = 一份参数引用 + 一份 per-parameter 的状态 + 一条更新规则。** 建的时候你把参数列表交给它，它存的是引用不是拷贝，所以 step() 里对 p.data 的原地修改直接改动了模型。state 是一个以参数张量为键的字典：SGD 无动量时是空的；SGD 带 momentum 时每个参数多存一份动量缓冲；Adam 每个参数存 m（一阶矩）和 v（二阶矩）两份。

**这份状态就是显存预算，换优化器等于换预算。** 以 float32、参数量 N 计：参数 4N 字节，梯度 4N，SGD 无动量 +0，SGD 带动量 +4N，Adam/AdamW +8N。于是每个参数的总账分别是 8、12、16 字节。1 亿参数的模型：SGD 无动量 0.8 GB，Adam 1.6 GB——这还一个激活都没算。「我把 batch 降到 1 还是 OOM」多半就是这一块，而它跟 batch 完全无关，降 batch 一点用没有。反过来，OOM 恰好发生在第一次 step() 是个强特征：m 和 v 是惰性分配的，前向反向都过了、step 一调就炸，说明差的正是这 8N。

**zero_grad 为什么必须显式写。** backward 的最后一步是 AccumulateGrad，语义是 p.grad += new_grad 而不是赋值。这个设计让两件事变得免费：梯度累积（小卡模拟大 batch）、多个 loss 分别 backward。代价是你要负责清账。三行的正确顺序是 zero_grad → backward → step；写成 backward → zero_grad → step 会把刚算好的梯度清掉，参数一动不动而 loss 照常打印，是最难发现的一类 bug。set_to_none=True 是现在的默认，它把 .grad 置为 None 而不是填 0，省一次写显存，代价是你不能再假设 .grad 一定是个张量。

**Adam 与 SGD 的分界线。** Adam 的更新量约为 m/(sqrt(v)+eps)，量纲上被归一化到 O(1)，所以实际步长 ≈ lr，与梯度大小基本无关——这就是 Adam 的 lr 通常取 1e-3 而 SGD 取 1e-2~1e-1 的原因，两者的 lr 根本不是同一个量纲的东西，换优化器时照抄 lr 必错。AdamW 与 Adam 的差别只在 weight decay：Adam 把 decay 加进梯度（于是也被 v 归一化，等效强度随梯度大小漂移），AdamW 直接从参数里减，这才是「权重衰减」本来的意思。用 Adam 时把 L2 写进 loss 和写进 weight_decay 不等价。

**param_groups 是分层学习率的入口。** 优化器内部把参数分组，每组有自己的 lr / weight_decay。微调时典型写法是骨干 lr=1e-5、head lr=1e-3 两组；scheduler 改的也是 param_groups 里的 lr，所以调试 lr 一律打印 opt.param_groups[0] 而不是读配置。注意 param_groups 在构造时固定，之后解冻的参数不会自动进来。`,
  worked:[
    {q:'训练日志显示 loss 稳步下降，但训完 torch.allclose(w_before, w_after) 为 True——参数一个都没变。代码三行是 loss.backward(); opt.zero_grad(); opt.step()。定位。',
     steps:[
      ['先确认梯度存不存在','在 zero_grad 前打印某个参数的 p.grad.norm()。有值，说明 autograd 没问题，图是通的'],
      ['再在 step 前打印一次','这时 p.grad 是 None（或全 0）——zero_grad 刚刚把它清了'],
      ['解释 loss 为什么还在降','loss 降的是同一批数据在不同随机性下的波动，或者 Dropout/BN 带来的抖动；跑几个 epoch 看会发现它其实卡在一个平台上不再下降'],
      ['修','顺序改成 opt.zero_grad(); loss.backward(); opt.step()'],
      ['加一条永久性自检','训练前存 p0 = next(model.parameters()).detach().clone()，第 10 步比一次 allclose，不同则通过']],
     a:'zero_grad 写在了 backward 和 step 之间，把梯度清光了。改回 zero_grad → backward → step',
     meta:'loss 在降不等于参数在动。第一次跑通任何训练脚本，都做一次「权重真的变了吗」的 allclose 自检。'},
    {q:'CUDA out of memory. Tried to allocate 392.00 MiB。报错发生在第一次 optimizer.step()，前向和反向都跑过去了。模型 2500 万参数，用 AdamW。说明根因并给三档解法。',
     steps:[
      ['抓住时点','前向反向都过了说明激活和梯度都装得下。step 那一刻新增的分配只能是优化器状态'],
      ['算这笔账','AdamW 每参数存 m 和 v 两份 float32：2.5e7 × 4 × 2 = 2×10^8 字节 = 200 MB。惰性分配时 m 和 v 分两次申请，每次约 100 MB；报错里的 392 MiB 是分配器在这一刻还要连带申请的连续块，量级对得上'],
      ['算完整总账','参数 100 MB + 梯度 100 MB + m 100 MB + v 100 MB = 400 MB，即 每参数 16 字节'],
      ['第一档：换优化器','SGD+momentum 每参数 12 字节，省 100 MB；SGD 无动量 8 字节，省 200 MB。代价是要重调 lr（从 1e-3 量级换到 1e-2 量级）'],
      ['第二档：换实现','bitsandbytes 的 8-bit AdamW 把 m/v 压到 1 字节，200 MB 降到 50 MB，精度影响通常可忽略'],
      ['第三档：不动优化器','把 batch 降下来对这一项完全无效（优化器状态与 batch 无关），只有 offload 到 CPU 或换更小的模型才有用']],
     a:'差的是优化器状态。AdamW 的 m+v = 2.5e7×4×2 = 200 MB，总账 400 MB。换 SGD 省 200 MB，或用 8-bit AdamW',
     meta:'OOM 发生在 step 的那一刻 = 优化器状态装不下，降 batch 一点用都没有。'},
    {q:'显存只够 batch=8，但论文用 batch=32。写出梯度累积的完整循环，并说明为什么 loss 要除以 4。',
     steps:[
      ['循环骨架','opt.zero_grad() 放在累积开始处，累积 4 个小 batch 再 step 一次'],
      ['为什么除以 4','backward 是累加：4 次不除的话 p.grad 是 4 个 batch 梯度之和；而 batch=32 的真梯度是 32 个样本的平均，等于这 4 份的平均。不除 4 就等于把 lr 乘了 4'],
      ['写法','for i, (x,y) in enumerate(loader): loss = crit(model(x), y) / 4; loss.backward(); if (i+1) % 4 == 0: opt.step(); opt.zero_grad()'],
      ['两个和真 batch=32 不等价的地方','BatchNorm 的统计量仍然只在 8 个样本上算（要真等价得换 GroupNorm 或 SyncBN）；drop_last 与 loader 长度不是 4 的倍数时最后一截会少累积，需要在 epoch 末补一次 step'],
      ['显存收益','激活峰值仍是 batch=8 的水平，优化器状态不变，所以省的是激活那一块']],
     a:'loss 除以 4 是因为 backward 累加的是和而不是平均；不除等价于 lr×4。BN 统计量仍按 8 算，不完全等价',
     meta:'梯度累积换的是激活显存，换不来 BatchNorm 的大 batch 统计。'}
  ],
  feyn:['为什么 PyTorch 要把梯度设计成累加而不是覆盖？这个设计买到了什么？',
        'Adam 的 lr=1e-3 和 SGD 的 lr=1e-2 为什么不是同一个量纲的数？',
        '一个参数在 SGD、SGD+momentum、Adam 下分别占多少字节？',
        '为什么 OOM 恰好发生在第一次 step() 是个很强的线索？',
        '梯度累积里的 loss/4，去掉会发生什么？'],
  exam:'小样本免疫数据上做超参搜索时，优化器状态是最容易被忽略的显存项：换个 Adam 就是每参数多 8 字节，跟 batch 无关，所以「batch 降到 1 还 OOM」直接指向这里。另一个真实场景是微调预训练编码器做 TCR-seq 表示：骨干和 head 必须用两个 param_group（骨干 1e-5、head 1e-3），照抄单一 lr 会把骨干的预训练表示冲掉，表现为前几百步指标反而下跌。做消融实验时把 opt.param_groups 里的 lr 和 weight_decay 一起打进日志，比记在 README 里可靠得多。',
  pit:[
    {t:'zero_grad / backward / step 顺序写反', why:'梯度被清掉或被重复累加，参数不动或等效 lr 被放大', fix:'固定 zero_grad → backward → step，并在第 10 步做一次权重 allclose 自检'},
    {t:'换优化器时照抄学习率', why:'Adam 的更新量已被二阶矩归一化到 O(1)，SGD 没有，两者 lr 差一到两个数量级', fix:'Adam 1e-3 起，SGD 1e-2~1e-1 起，换完必须重扫 lr'},
    {t:'用 Adam 时把 L2 写进 loss 当作 weight decay', why:'加进梯度的那一项也会被 v 归一化，等效衰减强度随梯度漂移', fix:'用 AdamW 的 weight_decay 参数'},
    {t:'解冻参数后没重建优化器', why:'param_groups 在构造时固定，新解冻的参数从不被更新', fix:'重建优化器或 add_param_group'},
    {t:'先建优化器再 model.to(device)', why:'优化器可能持有搬卡前的张量引用', fix:'规矩：to(device) → 建优化器 → 训练'},
    {t:'梯度累积不除以累积步数', why:'累加的是梯度之和而非平均，等价于 lr 乘 k', fix:'loss = loss / k，或用 reduction=sum 时自己算好归一化'}
  ]
},

'pt.dataloader': {
  route: [
    {q:'DataLoader 报错，先看是哪一段', a:[
      {c:'stack expects each tensor to be equal size', to:'collate 阶段。样本长度/尺寸不一，默认 collate 只会 stack。写 collate_fn 做 padding 并回传 mask'},
      {c:'报错栈里出现 _MapDatasetFetcher 或 worker process ... exited unexpectedly', to:'在 __getitem__ 里。把 num_workers=0 复跑，报错就会指到真正那一行'},
      {c:'DataLoader worker killed by signal', to:'子进程 OOM（内存不是显存）。降 num_workers、别在 Dataset 里持有大对象'},
      {c:'expected scalar type / device 不一致', to:'Dataset 里返回的 dtype 不对，或 batch 忘了 .to(device)。走 pt.debug_shape'}]},
    {q:'训练能跑但指标不对劲', a:[
      {c:'训练集忘了 shuffle=True', to:'模型学到样本顺序；若数据按类别排序，每个 batch 只有一类，BN 统计量彻底失真'},
      {c:'指标高得离谱', to:'查划分泄漏：同一个病人/同一张大图切出来的 patch 被分到了训练和验证两边'},
      {c:'每次跑结果不一样', to:'num_workers>0 时每个子进程各自复制随机状态。用 worker_init_fn + generator 固定'},
      {c:'最后一个 batch 让 BN 报错或指标跳变', to:'drop_last=True（训练），验证集则保留但要按样本数加权平均'}]},
    {q:'GPU 利用率忽高忽低（数据受限）', a:[
      {c:'num_workers=0', to:'主进程串行读数据，GPU 一直在等。设成 4~8 起步'},
      {c:'每步都在做重的 CPU 预处理', to:'能预计算的先算好存盘（如把 scRNA-seq 的归一化结果存成 memmap）'},
      {c:'CPU 到 GPU 拷贝慢', to:'pin_memory=True + .to(device, non_blocking=True)'},
      {c:'worker 起停开销大', to:'persistent_workers=True，配合 prefetch_factor'}]}
  ],
  deep:`**DataLoader 是三件事的组合：采样谁、怎么取一条、怎么把一堆拼成一批。** Sampler 产出索引序列（shuffle=True 就是 RandomSampler，不平衡数据可换 WeightedRandomSampler）；Dataset.__getitem__ 按索引返回一条样本；collate_fn 把 batch_size 条拼成张量。默认 collate 的规则很朴素：遇到张量就 torch.stack（要求形状完全一致），遇到 tuple/dict 就递归进去分别拼，遇到 python 数值就转成张量。变长数据必然在第一条上撞墙，这是 stack expects each tensor to be equal size 的全部来历。

**num_workers>0 意味着多进程，不是多线程。** 每个 worker 是 fork/spawn 出来的独立进程，它复制一份 Dataset 对象。三个后果：一，Dataset 里持有的大对象（整张读进内存的表、打开的 h5 句柄）会被复制 num_workers 份，内存乘以 workers 数，worker 被 OOM killer 杀掉就是这么来的；二，worker 里的报错栈会被包一层，看不清真正出错的行，所以调试第一步永远是 num_workers=0；三，随机状态各自独立，不设 worker_init_fn 时随机增强的可复现性无从谈起。

**shuffle 的三个层次。** 训练集必须 shuffle，否则 SGD 的无偏梯度假设不成立，而且数据若按类别排序，每个 batch 只含一类，BatchNorm 的批统计量会彻底失真（这是「训练 loss 正常、eval 崩掉」的经典成因）。验证/测试集不需要 shuffle，且不 shuffle 才方便逐样本对照。shuffle 与 Sampler 互斥，指定了 sampler 就不能再传 shuffle。

**drop_last 的两面。** 训练时设 True：最后一个残缺 batch 若只有 1~2 个样本，BatchNorm 的方差近乎 0，会给出一个异常大的梯度。7500 个样本、batch=64 时，drop_last=True 得 117 个 batch（丢掉 7500 − 117×64 = 12 个样本），False 得 118 个。验证时必须 False（不能丢样本），但算总指标要按每个 batch 的真实样本数加权，直接对 batch 的 loss 取平均会让最后那个小 batch 权重偏大。

**边界与相邻概念。** DataLoader 不负责划分——train/val/test 的切分是 Dataset 层面的事，而且免疫数据里必须按病人/小鼠/实验批次切，不能按样本随机切（走 da.split）。DataLoader 也不负责标准化：scaler 只能在训练集上 fit，放进 Dataset 时要把 fit 好的参数传进去，不能让每个 worker 各自 fit。IterableDataset 是另一条路，用于流式/超大数据，此时 shuffle 和 len() 都要你自己实现。`,
  worked:[
    {q:'RuntimeError: stack expects each tensor to be equal size, but got [147] at entry 0 and [203] at entry 1。TCR CDR3 序列长度不一。写出修法并说明 mask 为什么必须一起返回。',
     steps:[
      ['读报错','entry 0 和 entry 1 是同一个 batch 里的两条样本，147 与 203 是它们的长度。确认瓶颈在 collate 而不是模型'],
      ['选 padding 长度','按 batch 内最大长度 pad（动态 padding）比按全局最大长度省算力，尤其长度分布长尾时'],
      ['写 collate_fn','def collate(batch): xs, ys = zip(*batch); lens = torch.tensor([len(x) for x in xs]); xp = nn.utils.rnn.pad_sequence(xs, batch_first=True); mask = torch.arange(xp.size(1))[None,:] < lens[:,None]; return xp, mask, torch.stack(ys)'],
      ['为什么必须回传 mask','pad 出来的 0 在数学上不是「没有」而是「值为 0 的 token」。不给 mask 的话：attention 会去关注 padding、mean pooling 会把 0 算进分母、loss 会对 padding 位置计分。这三处都会让长序列样本被系统性地稀释'],
      ['接上模型','pooled = (h * mask.unsqueeze(-1)).sum(1) / mask.sum(1, keepdim=True)，分母用真实长度而不是 pad 后长度']],
     a:'写 collate_fn 用 pad_sequence 并回传 mask；pooling 与 loss 都要按 mask 排除 padding',
     meta:'padding 只解决了 shape，mask 才解决语义。两者必须成对出现。'},
    {q:'7500 张显微图，batch_size=64。drop_last 为 True 和 False 时各有几个 batch？验证集算平均 loss 时为什么不能直接对 batch loss 取平均？',
     steps:[
      ['drop_last=True','7500 // 64 = 117 个 batch，用掉 117×64 = 7488 张，丢掉 12 张'],
      ['drop_last=False','ceil(7500/64) = 118 个 batch，最后一个只有 12 张'],
      ['直接平均的偏差','对 118 个 batch loss 取算术平均，等于给最后那 12 张样本每张的权重是别人的 64/12 ≈ 5.33 倍'],
      ['正确写法','total = 0.0; n = 0; 每个 batch 做 total += loss.item() * x.size(0); n += x.size(0); 最后 total / n'],
      ['训练侧的选择','训练用 drop_last=True，避免 12 张样本的 batch 让 BatchNorm 的方差估计失真']],
     a:'True 得 117 个，False 得 118 个（末批 12 张）。验证要按样本数加权：sum(loss×bs)/N',
     meta:'凡是「对 batch 取平均」的地方，先问最后一个 batch 是不是满的。'},
    {q:'同一份代码同一个种子跑两次，验证 AUC 差 0.03。num_workers=8，Dataset 里有随机裁剪和随机翻转。定位不可复现的来源。',
     steps:[
      ['先排除模型侧','固定 torch.manual_seed / np.random.seed / random.seed，并设 torch.backends.cudnn.deterministic=True。若还是不一致，问题在数据侧'],
      ['关键实验','num_workers=0 再跑两次。若结果一致，就确认是子进程的随机状态'],
      ['解释','每个 worker 是独立进程，fork 时复制了主进程的随机状态，但之后各自演进；worker 的调度顺序又不确定，于是同一个索引在两次运行里拿到的增强不同'],
      ['修','给 DataLoader 传 generator=torch.Generator().manual_seed(seed)（控制 sampler 的顺序），并写 worker_init_fn 给每个 worker 按 base_seed + worker_id 设种子（控制增强）'],
      ['小样本场景的补充','n 只有几百时，单个种子的 AUC 波动本来就可能有 0.03。可复现性修好之后，仍要报 5 个种子的均值±标准差，而不是单次最好值']],
     a:'来源是 worker 子进程各自的随机状态。传 generator + worker_init_fn；同时改为报多种子均值±标准差',
     meta:'不可复现先二分：num_workers=0 能复现，就锁定在数据侧的多进程随机性。'}
  ],
  feyn:['默认 collate 到底做了什么，为什么变长数据一定会在它这里报错？',
        'padding 之后为什么还必须传 mask？不传会在哪三个地方出错？',
        'num_workers>0 是多进程还是多线程？这个区别造成了哪些具体后果？',
        '训练集不 shuffle，BatchNorm 会发生什么？',
        '验证集算平均 loss 为什么不能直接对 batch 取平均？'],
  exam:'显微图像分割里最贵的一类错误是划分泄漏：同一张全片切出来的 patch 落到训练和验证两边，AUC 能虚高十几个点，而 DataLoader 一句话都不会报。规矩是先按样本来源（病人、小鼠、成像批次）分组，再切分，切完打印两边的来源集合确认交集为空。第二个高频场景是 TCR-seq 的变长 CDR3：必须写 collate_fn 做动态 padding 并返回 mask，pooling 的分母用真实长度。第三，小样本免疫数据的可复现性靠 generator + worker_init_fn 锁住数据侧随机性，再报 5 个种子的均值±标准差。',
  pit:[
    {t:'调试时保持 num_workers=8', why:'真实报错被 worker 的包装栈盖住，看不到出错的那一行', fix:'排错第一步一律 num_workers=0'},
    {t:'在 Dataset.__init__ 里把整份数据读进内存', why:'每个 worker 复制一份，内存乘以 workers 数，进程被 OOM killer 杀掉', fix:'用 memmap / h5 惰性读取，句柄在 __getitem__ 里按 worker 打开'},
    {t:'标准化的 scaler 在 Dataset 里对当前样本 fit', why:'每条样本各自归一化，等于泄漏也等于改变了任务', fix:'scaler 只在训练集上 fit 一次，参数传进 Dataset'},
    {t:'验证集直接对 batch loss 取算术平均', why:'最后一个不满的 batch 被过度加权', fix:'按样本数加权：sum(loss×bs)/N'},
    {t:'随机划分 patch 而不是按病人划分', why:'同一张片子的相邻 patch 高度相关，指标虚高', fix:'GroupShuffleSplit 或 GroupKFold，group 用病人/小鼠 ID'},
    {t:'指定了 sampler 还传 shuffle=True', why:'两者互斥，直接报错', fix:'用 sampler 时删掉 shuffle'}
  ]
},

'pt.train_eval': {
  route: [
    {q:'训练指标好、验证/推理崩，先查这两个开关', a:[
      {c:'验证前没写 model.eval()', to:'Dropout 还在随机丢、BN 还在用当前 batch 统计，结果随批次抖动。且 BN 的 running stats 会被验证数据污染'},
      {c:'验证后没写回 model.train()', to:'Dropout 全程失效，正则消失，表现为训练曲线异常平滑而验证越来越差'},
      {c:'两个都写了还是崩', to:'查 BN 的 running stats 是不是没训熟（momentum 太小、步数太少）或被极端 batch 带偏'},
      {c:'推理时 batch_size=1 输出爆炸或全零', to:'确实忘了 eval()：BN 在单样本上方差为 0'}]},
    {q:'显存还是涨', a:[
      {c:'以为 eval() 关了梯度', to:'没关。eval 只改层行为，图照建。必须再包 with torch.no_grad()'},
      {c:'两个都写了还涨', to:'查有没有把带 grad_fn 的张量存进 list，走 pt.autograd'}]},
    {q:'BatchNorm 本身不稳', a:[
      {c:'batch 很小（分割任务 batch=2~4）', to:'批统计量方差大。换 GroupNorm / LayerNorm，它们在样本内归一化，与 batch 无关'},
      {c:'微调时冻了骨干但指标还在漂', to:'BN 的 running stats 是 buffer，requires_grad 冻不住。要 backbone.eval()'},
      {c:'训练/测试分布差异大', to:'考虑用测试集重估 running stats（BN recalibration），但要说明清楚，这算一种 transductive 做法'}]}
  ],
  deep:`**只有两类层在乎 train/eval，但它们的前向在两种模式下是不同的数学函数。**

**BatchNorm。** 训练时对当前 batch 沿 (N,H,W) 求均值方差，用它们归一化，同时以 running = (1−m)·running + m·batch_stat 的方式更新 running_mean/running_var（PyTorch 的 momentum 默认 0.1，注意它的含义与别的框架相反，是新值的权重）。eval 时不看当前 batch 一眼，直接用累计的 running stats。这个切换是必须的：训练时用 batch 统计带来的噪声本身是一种正则，但推理时若还用它，同一个样本放进不同的 batch 会得到不同的预测——这在临床/实验语境下直接不可接受。batch=1 时 eval 忘写的症状最典型：方差为 0，除以 sqrt(0+eps) 让输出爆炸或全零。另外，running stats 是 buffer 不是 parameter，所以 requires_grad=False 冻不住它，只有 .eval() 能。

**Dropout。** 训练时以概率 p 独立地把每个元素置零，并把留下来的元素除以 (1−p)——这叫 inverted dropout，目的是让输出的期望保持不变：E[x/(1−p) · Bernoulli(1−p)] = x。eval 时做的是两件事：不再丢弃，也不再除以 (1−p)，直接恒等通过。很多人以为「eval 时要乘 1−p 补偿」，那是旧式实现；现在的补偿在训练侧就做完了，所以 eval 是纯粹的恒等。理解这一点就明白为什么忘记 model.train() 的症状是「训练 loss 掉得异常快、曲线异常平滑」——正则被关掉了。

**eval() 与 no_grad() 完全正交。** eval() 改的是层的前向行为，一个字节的显存都不省；no_grad() 关的是记账，不改变任何层的行为。验证循环两个都要写。inference_mode() 比 no_grad 更彻底（连版本计数都不记，输出张量不能再进任何图），纯推理服务用它。

**model.train() 是递归的。** 它会把所有子模块都设成训练态，所以「微调时冻结骨干的 BN」这件事必须在每个 epoch 调完 model.train() 之后再补一次 backbone.eval()，否则前一次的冻结被 train() 覆盖掉。这是迁移学习里最隐蔽的一个 bug。

**边界。** 除了 BN 和 Dropout，别的层（Linear、Conv、ReLU、LayerNorm）在两种模式下行为完全一致——LayerNorm 没有 running stats，永远用当前样本自己的统计量，这正是它在小 batch 和变长序列上更稳的原因。`,
  worked:[
    {q:'分割模型训练 Dice 0.89，推理时按单张图跑（batch=1）Dice 掉到 0.31，输出图几乎全是一种颜色。定位并修。',
     steps:[
      ['抓住 batch=1 这个特征','单样本时 BatchNorm 的批方差在每个通道上都接近 0（只有一个样本，沿 H,W 还有空间维，但若是 BatchNorm1d 或空间尺寸小就更极端）'],
      ['推断模式','若忘了 model.eval()，BN 会用这一张图自己的统计量归一化，等于把每张图各自拉到零均值单位方差，图与图之间的绝对强度信息全丢，输出自然趋同'],
      ['验证假设','把推理 batch 改成 16，若 Dice 明显回升，就确认是 BN 在用批统计量'],
      ['修一','推理前 model.eval()，让 BN 走 running stats，与 batch 大小无关'],
      ['修二（若 eval 已写但仍不稳）','说明 running stats 本身没训熟或被小 batch 训练带偏。分割任务 batch 常只有 2~4，改用 GroupNorm(num_groups=8) 从根上去掉对 batch 的依赖'],
      ['顺带','推理循环外层包 with torch.no_grad()，这与 eval 是两件事，都要写']],
     a:'忘了 model.eval()，BN 在用单样本统计量。加 eval()；若训练 batch 本就很小，进一步换 GroupNorm',
     meta:'推理结果随 batch 大小变化 = BatchNorm 没进 eval，这是一个确定性判据。'},
    {q:'训练曲线异常平滑、train loss 掉得比以往快，验证却持续变差。代码里验证函数最后没有 model.train()。解释 Dropout 在两种模式下的具体差别，并说明这如何造成上述现象。',
     steps:[
      ['定位','第一个 epoch 结束跑完验证后，模型停在 eval 态；第二个 epoch 开始时没人调 model.train()，于是之后所有训练步的 Dropout 都是关的'],
      ['train 态的 Dropout','以概率 p 置零，留下的元素乘 1/(1−p)。p=0.5 时留下的元素被放大一倍，保证 E[输出] = 输入'],
      ['eval 态的 Dropout','恒等映射。既不丢也不缩放——因为缩放已经在训练侧做完了'],
      ['解释平滑','Dropout 每步的随机掩码是 loss 抖动的一大来源，关掉后曲线自然变平滑'],
      ['解释过拟合','Dropout 是主要正则项之一，关掉等于容量突然放大，训练集拟合得更快，验证随之变差'],
      ['修与自检','验证函数结尾写 model.train()，或用 try/finally 保证恢复。自检：训练循环里断言 model.training is True']],
     a:'验证后停在 eval 态，之后 Dropout 全程关闭。train 态要丢弃并除以 1−p，eval 态是恒等。补 model.train()',
     meta:'训练曲线突然变平滑 + 验证变差 = 正则被意外关掉，先查 model.training。'},
    {q:'Dropout(p=0.4)，某个隐藏单元训练时前向值为 2.0 且未被丢弃。它进入下一层的实际数值是多少？eval 时呢？',
     steps:[
      ['inverted dropout 的训练规则','未丢弃的元素要除以 (1−p) = 0.6'],
      ['算','2.0 / 0.6 = 3.3333…'],
      ['eval 规则','不丢弃也不缩放，恒等'],
      ['所以 eval 时是 2.0','两种模式下同一个单元的数值不同，但训练时的期望 E = 0.6 × 3.333 + 0.4 × 0 = 2.0，与 eval 一致——这正是缩放的目的']],
     a:'训练时 3.3333（=2.0/0.6），eval 时 2.0。两者期望相等',
     meta:'inverted dropout 把补偿放在训练侧，所以推理是纯恒等，不要再手动乘 1−p。'}
  ],
  feyn:['BatchNorm 在 train 和 eval 下分别用哪一组统计量？为什么推理必须换？',
        'Dropout 训练时为什么要除以 1−p？eval 时为什么什么都不做？',
        'model.eval() 能省显存吗？为什么？',
        '为什么 requires_grad=False 冻不住 BatchNorm？',
        '为什么 LayerNorm / GroupNorm 不在乎 train/eval？'],
  exam:'显微图像分割的 batch 常常只有 2~4，BatchNorm 的批统计量方差极大，训练能跑但换台机器、换个 batch 结果就飘——这类任务默认应该用 GroupNorm。微调预训练编码器做 flow cytometry 特征分类时，冻结骨干必须写 backbone.eval() 且要在每个 epoch 的 model.train() 之后补一次，否则 running stats 每个 epoch 都在动，小样本上直接体现为跑两遍差好几个点。交付脚本里加两句断言：训练循环断言 model.training is True，验证循环断言为 False，这一条能挡掉这个大陆里最贵的两类 bug。',
  pit:[
    {t:'验证完忘了 model.train()', why:'之后所有训练步的 Dropout 都关着，BN 也不再更新 running stats', fix:'验证函数用 try/finally 恢复，或训练循环开头无条件 model.train()'},
    {t:'把 model.eval() 当成关梯度', why:'两件正交的事，eval 一个字节都不省', fix:'eval() 与 no_grad() 一起写'},
    {t:'小 batch 任务硬用 BatchNorm', why:'批统计量方差大，训练不稳且推理结果随 batch 漂', fix:'batch < 8 时用 GroupNorm 或 LayerNorm'},
    {t:'冻结骨干只写 requires_grad=False', why:'running stats 是 buffer，照常更新，等于骨干的前向一直在变', fix:'backbone.eval()，且在 model.train() 之后补调'},
    {t:'验证时没 eval，BN 吃了验证集的统计量', why:'running stats 被验证数据更新，等于信息泄漏', fix:'验证前 model.eval()，这也是防泄漏的一环'},
    {t:'以为 eval 时要手动乘 (1−p) 补偿 Dropout', why:'现代实现是 inverted dropout，补偿在训练侧已完成', fix:'eval 就是恒等，什么都不做'}
  ]
},

'pt.device': {
  route: [
    {q:'Expected all tensors to be on the same device, but found at least two devices, cuda:0 and cpu!', a:[
      {c:'模型搬了、数据没搬', to:'训练循环里每个 batch 都要 x = x.to(device); y = y.to(device)。搬模型是一次性的，搬数据是每步的'},
      {c:'模型里有层在 python list 里', to:'to() 递归不到它。走 pt.module，换 nn.ModuleList'},
      {c:'模型里有普通属性张量（mask、均值常量）', to:'to() 也搬不动。改成 register_buffer'},
      {c:'新造的张量没指定 device', to:'torch.zeros(n) 默认在 CPU。写 torch.zeros(n, device=x.device) 或 torch.zeros_like(x)'}]},
    {q:'CUDA out of memory，按这个顺序判', a:[
      {c:'OOM 在第一次 optimizer.step()', to:'优化器状态装不下。Adam 每参数 8 字节的 m+v，与 batch 无关，降 batch 无效。走 pt.optimizer'},
      {c:'OOM 在 backward', to:'激活是大头。降 batch、gradient checkpointing、AMP。走 pt.amp'},
      {c:'OOM 随 epoch 缓慢增长', to:'有东西被引用住了。查 list 里存的带 grad_fn 张量、验证循环缺 no_grad'},
      {c:'nvidia-smi 显示占用很高但 torch 报的分配量很小', to:'是分配器的缓存碎片。torch.cuda.empty_cache() 只还给驱动，不解决碎片；改成固定 batch 形状能显著减少碎片'}]},
    {q:'速度不对劲', a:[
      {c:'GPU 利用率长期低于 50%', to:'数据受限。走 pt.dataloader：num_workers、pin_memory、预计算'},
      {c:'计时结果每次差很多', to:'CUDA 是异步的。计时前后都要 torch.cuda.synchronize()，否则你量的是入队时间'},
      {c:'每步都在 .item() / .cpu()', to:'每一次都强制同步，把异步流水线打断。日志改成每 N 步取一次'}]}
  ],
  deep:`**显存是四本账，只有一本随 batch 变。** 参数 4N 字节、梯度 4N、优化器状态 0/4N/8N（SGD / SGD+momentum / Adam），这三本只跟参数量有关，与 batch 完全无关；第四本是激活，反向传播需要保留前向的每一层中间结果，它随 batch × 深度线性增长，注意力还随序列长度平方增长。判断 OOM 属于哪一本，最省事的判据就是「降 batch 有没有用」和「OOM 发生在前向、反向还是 step」。ResNet-50（2560 万参数）配 Adam 的固定开销是 2.56e7 × 16 = 4.1×10^8 字节 ≈ 410 MB；同一个模型 batch=32 的 (3,512,512) 输入光第一层激活就 32×3×512×512×4 ≈ 100 MB，全网累计常常是固定开销的好几倍——所以图像任务里激活几乎总是大头。

**CUDA 是异步的，这件事影响两处。** 一，计时：kernel 的启动只是入队，CPU 立刻返回。time.time() 夹住一段 GPU 代码量到的是入队时间，要么前后加 torch.cuda.synchronize()，要么用 torch.cuda.Event。二，报错位置：CUDA 的错误往往在后续某个同步点才抛出，报错行与真正出错的行对不上。定位时设 CUDA_LAUNCH_BLOCKING=1 让它同步执行，报错行就准了。反过来，.item()、.cpu()、print(tensor) 都是隐式同步点，写在每步的循环里会把流水线打断。

**caching allocator 决定了 nvidia-smi 不可信。** PyTorch 向驱动申请大块显存后自己切分复用，释放的张量只是还给这个缓存池，不还给驱动。所以 nvidia-smi 显示的是缓存池大小（只涨不落），要看真实占用得用 torch.cuda.memory_allocated()（当前张量占用）和 max_memory_allocated()（峰值）。empty_cache() 把空闲块还给驱动，能让 nvidia-smi 的数字降下来，但不会让你的程序装下更多东西，反而增加后续的分配开销——它唯一的正当用途是和别的进程共享一张卡。真正麻烦的是碎片：形状每步都变（变长序列）会让缓存池被切得七零八落，于是「明明还有 2 GB 空闲却分配不出 300 MB」。对策是把形状规整化（分桶 padding、固定 batch）。

**搬运的成本与规矩。** CPU 到 GPU 的拷贝走 PCIe，带宽比显存内部低一到两个数量级。pin_memory=True 让 DataLoader 把 batch 放进锁页内存，配合 .to(device, non_blocking=True) 才能与计算重叠。规矩：模型搬一次（在建优化器之前），数据每个 batch 搬一次，新造的张量一律用 device=x.device 或 torch.zeros_like(x) 而不是硬写 cuda。

**边界。** 显存和内存是两套东西：worker 进程被杀是内存不足，报 CUDA out of memory 才是显存。多卡时还要区分 DataParallel（单进程多卡，主卡负担重，已不推荐）与 DistributedDataParallel（每卡一进程，是现在的默认做法）。`,
  worked:[
    {q:'RuntimeError: Expected all tensors to be on the same device, but found at least two devices, cuda:0 and cpu!。代码里已经写了 model.to(device)。按顺序排查。',
     steps:[
      ['第一嫌疑：数据没搬','搬模型是一次性的，搬数据是每步的。训练循环里必须 x = x.to(device); y = y.to(device)。忘了 y 的情况尤其常见——前向能跑，报错发生在算 loss 那一行'],
      ['第二嫌疑：模型里有没被注册的层','print(next(model.parameters()).device) 是 cuda:0 不代表全部都在。逐子模块检查：for n, p in model.named_parameters(): print(n, p.device)。若某几层缺席，就是 python list 的问题'],
      ['第三嫌疑：普通属性里的张量常量','self.mean = torch.tensor([...]) 不在 _buffers 里，to() 搬不动。改 register_buffer'],
      ['第四嫌疑：forward 里现造的张量','torch.zeros(B, n) 默认在 CPU。改成 torch.zeros(B, n, device=x.device)'],
      ['一句话定位法','在报错行前面打印涉及的每个张量的 .device。报错信息只告诉你有两个设备，不告诉你是谁']],
     a:'四个嫌疑按序查：数据没搬 → list 里的层 → 普通属性张量 → forward 里现造的张量。用 named_parameters 逐个打 device',
     meta:'device 报错只有两类根因：该搬的没搬，或该注册的没注册。'},
    {q:'CUDA out of memory. Tried to allocate 2.00 GiB (GPU 0; 23.70 GiB total capacity; 19.31 GiB already allocated; 1.42 GiB free; 21.02 GiB reserved in total by PyTorch)。解读这几个数字，并说明为什么 empty_cache 大概率没用。',
     steps:[
      ['reserved 21.02 vs allocated 19.31','reserved 是 PyTorch 向驱动要来的缓存池总量，allocated 是当前活着的张量。差值 1.71 GB 是池子里的空闲块'],
      ['free 1.42 GiB 是驱动侧还没被 PyTorch 要走的','池内空闲 1.71 + 池外空闲 1.42 = 3.13 GB，看上去够放 2 GB'],
      ['为什么还是失败','分配要的是一块 2 GB 的连续空间。池内那 1.71 GB 是碎成好几块的，池外只有 1.42 GB，都凑不出连续 2 GB'],
      ['empty_cache 的效果','它把池内空闲块还给驱动，free 会变成约 3.13 GB，这一次分配可能就过了。但代价是之后每次都要重新向驱动申请，慢；而且只要形状还在变，几步之后碎片重新出现'],
      ['真正的对策','按大小分档：一，把形状规整化（序列分桶 padding、固定 batch），碎片从源头减少；二，降 batch 直接降低激活峰值；三，AMP 把激活砍半；四，gradient checkpointing 用算力换显存'],
      ['诊断工具','print(torch.cuda.max_memory_allocated()/1e9) 看真实峰值，比 nvidia-smi 可信']],
     a:'reserved 是缓存池、allocated 是活张量、free 是驱动侧剩余；失败是因为凑不出 2 GB 连续块。empty_cache 只临时缓解碎片，正解是规整形状 + 降 batch + AMP',
     meta:'看 OOM 先看 reserved 与 allocated 的差：差大就是碎片问题，差小就是真的装不下。'},
    {q:'一个 1 亿参数的模型，float32，用 AdamW。写出固定显存开销；若换成 SGD（无动量）省多少？batch 从 32 降到 8 对这部分有影响吗？',
     steps:[
      ['逐项列','参数 1e8 × 4 = 4×10^8 字节 = 400 MB；梯度同样 400 MB'],
      ['AdamW 的状态','m 和 v 各 400 MB，合计 800 MB'],
      ['总固定开销','400 + 400 + 800 = 1600 MB = 1.6 GB，即每参数 16 字节'],
      ['SGD 无动量','状态为 0，总账 800 MB，省下 800 MB（正好一半）'],
      ['batch 的影响','这四项里没有一项含 batch。降 batch 只影响激活那本账，对这 1.6 GB 一点用都没有'],
      ['所以判据成立','若 batch=1 仍 OOM，问题一定在固定开销，方向是换优化器 / 8-bit 优化器 / 换小模型 / offload']],
     a:'AdamW 固定开销 1.6 GB（每参数 16 字节）；换 SGD 无动量降到 0.8 GB，省 800 MB。降 batch 对这部分完全无效',
     meta:'把显存拆成「跟参数量走」和「跟 batch 走」两本账，OOM 的方向就自动确定了。'}
  ],
  feyn:['显存的四本账分别是什么？哪几本跟 batch 无关？',
        '为什么 nvidia-smi 的数字不能用来判断你还剩多少可用显存？',
        'empty_cache() 到底做了什么？它为什么通常帮不上忙？',
        'CUDA 异步会让你的计时和报错行分别出什么问题？',
        '为什么搬模型是一次性的，搬数据却要每个 batch 都做？'],
  exam:'跑 scRNA-seq 的自编码器时，细胞数十万但每个细胞的特征维度固定，激活开销可控，瓶颈往往在优化器状态——这时先算「每参数 16 字节」就能提前判断卡够不够，而不是撞了 OOM 再调。显微图像分割相反，(3,512,512) 的输入配 U-Net，激活是压倒性大头，第一手段是 AMP 加 gradient checkpointing。写论文的 Methods 时把峰值显存用 torch.cuda.max_memory_allocated() 报出来，比写「在一张 A100 上训练」有用得多，别人复现时能直接判断自己的卡行不行。',
  pit:[
    {t:'只 model.to(device) 不搬数据', why:'搬模型一次、搬数据每步，两件事', fix:'训练循环里 x, y 都 .to(device, non_blocking=True)'},
    {t:'在 forward 里写 torch.zeros(n).cuda()', why:'硬编码设备，单卡能跑多卡就崩；且多一次不必要的拷贝', fix:'torch.zeros(n, device=x.device) 或 torch.zeros_like(x)'},
    {t:'用 nvidia-smi 判断剩余显存', why:'看到的是只涨不落的缓存池，不是真实占用', fix:'torch.cuda.memory_allocated() 与 max_memory_allocated()'},
    {t:'撞 OOM 就撒 empty_cache()', why:'不解决碎片的根因，还拖慢后续分配', fix:'规整形状、降 batch、AMP、checkpointing，按这个顺序'},
    {t:'用 time.time() 给 GPU 代码计时', why:'CUDA 异步，量到的是入队时间', fix:'前后 torch.cuda.synchronize()，或用 torch.cuda.Event'},
    {t:'每一步都 print(loss) 或 loss.item()', why:'每次都是隐式同步点，打断异步流水线', fix:'每 50 步记一次；需要累计就在 GPU 上累加，最后一次性取回'}
  ]
},

'pt.save_load': {
  route: [
    {q:'load_state_dict 报错，按键名的形态分类', a:[
      {c:'unexpected keys 全带 module. 前缀', to:'DataParallel/DDP 存的。存的时候写 model.module.state_dict()，或加载前剥前缀'},
      {c:'missing keys', to:'当前模型有而 checkpoint 没有的层，结构改过。打印两边键集合做差找出改动'},
      {c:'size mismatch for fc.weight: copying a param with shape [10,512] from checkpoint, current model is [3,512]', to:'类别数变了。有意迁移就 strict=False 并手动删掉 head 的键'},
      {c:'键完全对上但加载后指标不对', to:'查 buffer 有没有一起存（BN 的 running stats 在 state_dict 里，但自定义的普通属性张量不在）'}]},
    {q:'恢复训练之后 loss 跳了一下', a:[
      {c:'只存了模型权重', to:'优化器状态丢了，Adam 的 m/v 从零重启，前几百步等于在重新预热'},
      {c:'优化器也存了但 lr 不对', to:'scheduler 的 state_dict 没存，学习率回到了初始值'},
      {c:'数据顺序不一样', to:'DataLoader 的随机状态没存。小数据上会造成可见差异'},
      {c:'BN 统计量对不上', to:'确认存的是 state_dict 而不是只有 named_parameters'}]},
    {q:'加载别人的 checkpoint', a:[
      {c:'报 pickle 相关错误 / 找不到某个类', to:'对方存的是整个 model 对象，依赖它的代码结构。要么补齐同名模块，要么找作者要 state_dict'},
      {c:'torch.load 报 weights_only 相关警告或错误', to:'新版默认 weights_only=True。可信来源才显式传 False；不可信的 checkpoint 本身可以执行任意代码'},
      {c:'只想要骨干', to:'ckpt = {k: v for k, v in ckpt.items() if not k.startswith(head)}，再 strict=False'}]}
  ],
  deep:`**state_dict 只是一个 OrderedDict：键是模块路径拼出来的字符串，值是张量。** 它包含 parameters 和 buffers 两类——所以 BatchNorm 的 running_mean/running_var 在里面，而你用普通属性存的张量常量不在（这是「权重加载成功但结果不对」的一个隐蔽来源，见 pt.module）。键名由属性名递归拼接：self.encoder.layers.0.weight。这意味着重命名一个属性就会让老 checkpoint 加载失败，而改内部实现（比如把 forward 写法换了）却完全不影响。

**为什么不存整个模型对象。** torch.save(model) 走 pickle，序列化的是「到某个类的引用 + 它的属性」。反序列化时 python 必须能按原路径 import 到那个类，于是你的目录结构、模块名、甚至类所在的文件名都成了 checkpoint 的一部分。重构一次代码，一年前的模型就再也打不开了。state_dict 只依赖键名这一个约定，跨版本跨重构都稳。**分界线：代码归代码，权重归权重；checkpoint 里应该只有数字。**

**恢复训练要存的不只是权重。** 完整的一份 checkpoint 至少包含五样：model.state_dict()、optimizer.state_dict()（Adam 的 m/v，丢了会让恢复后的前几百步等于重新预热，表现为 loss 跳一下）、scheduler.state_dict()（否则 lr 回到初始值）、epoch/global_step、以及随机状态（torch/numpy/python 三处，小数据上影响可见）。再加两样元数据能省掉很多考古：代码的 git commit hash 和完整的超参 dict。

**strict 的语义。** strict=True（默认）要求两边键集合完全相同，任何 missing 或 unexpected 都报错——这是训练脚本里应该保持的设置，它是你的安全网。strict=False 让它跳过对不上的键并返回一个 (missing_keys, unexpected_keys) 具名元组——**关键是要把这个返回值打印出来看**，否则一个拼错的前缀会让整个骨干静默地没被加载，模型从随机初始化开始训，而你以为在做迁移学习。

**map_location 决定权重落在哪。** 在 GPU 上存的 checkpoint 默认会尝试加载回原来的 cuda 设备，换到只有 CPU 的机器上就报错。规矩是一律写 torch.load(path, map_location=cpu) 再 model.to(device)，跨机器最稳。另外新版 torch.load 默认 weights_only=True，因为 pickle 反序列化可以执行任意代码——从网上下的 checkpoint 就是可执行文件，不要随手把它设成 False。`,
  worked:[
    {q:'多卡训练存的 checkpoint，单卡加载报：Unexpected key(s) in state_dict: "module.conv1.weight", "module.bn1.weight", ... Missing key(s): "conv1.weight", "bn1.weight", ...。给两种修法并说明哪种更好。',
     steps:[
      ['读键名','unexpected 的键比 missing 的键多一个 module. 前缀，一一对应。这是 DataParallel/DDP 包装后的命名'],
      ['原因','DataParallel(model) 返回一个新的 Module，原模型被放在它的 .module 属性下，于是 state_dict 的键全部多一层前缀'],
      ['修法一（加载侧剥前缀）','sd = {k.replace("module.", "", 1): v for k, v in ckpt.items()}；用 replace 的第三个参数只替换第一次，避免误伤名字里含 module 的层'],
      ['修法二（保存侧不加前缀）','存的时候写 torch.save(model.module.state_dict(), path)。这样 checkpoint 与卡数解耦，单卡多卡都能直接加载'],
      ['哪种更好','修法二。checkpoint 是长期产物，不应该记住你当时用了几张卡；修法一每个下游脚本都要写一遍'],
      ['通用写法','存的时候统一 sd = model.module.state_dict() if hasattr(model, "module") else model.state_dict()']],
     a:'DataParallel 的 module. 前缀。首选保存侧写 model.module.state_dict()；临时补救可在加载侧剥前缀',
     meta:'checkpoint 里不应出现训练时的并行方式，它只该有层名和数字。'},
    {q:'迁移学习：预训练模型 10 类，新任务 3 类。直接 load_state_dict 报 size mismatch for fc.weight: copying a param with shape torch.Size([10, 512]) from checkpoint, the shape in current model is torch.Size([3, 512])。写正确流程，并说明为什么不能只写 strict=False。',
     steps:[
      ['理解报错','骨干的键全部对得上，只有分类头因为类别数不同而形状不符'],
      ['为什么 strict=False 不够','strict=False 只跳过 missing/unexpected 的键，形状不匹配的同名键仍然会报错。必须先把 head 的键删掉'],
      ['正确流程一：过滤','sd = {k: v for k, v in ckpt.items() if not k.startswith("fc.")}'],
      ['正确流程二：加载并检查返回值','res = model.load_state_dict(sd, strict=False); print(res.missing_keys, res.unexpected_keys)。missing 应该恰好是 fc.weight 和 fc.bias，unexpected 应该为空'],
      ['为什么必须打印','若前缀写错（比如实际叫 classifier. 而你过滤的是 fc.），strict=False 会静默跳过整个骨干，模型从随机初始化开始训，训练曲线看上去正常但性能莫名其妙差'],
      ['最后','新 head 单独初始化，且用更大的 lr（骨干 1e-5、head 1e-3 两个 param_group）']],
     a:'先按前缀过滤掉 head 的键，再 strict=False 加载，并打印 missing/unexpected 核对。只写 strict=False 不能解决形状冲突',
     meta:'strict=False 必须配一句 print(返回值)，否则它是个静默失败的开关。'},
    {q:'从 epoch 20 的 checkpoint 恢复训练，loss 从 0.31 跳到 0.48 然后花了两百多步才回来。checkpoint 里只有 model.state_dict()。逐项说明丢了什么。',
     steps:[
      ['丢的第一样：优化器状态','Adam 的 m 和 v 从零开始。前几十步 v 很小，更新量 m/(sqrt(v)+eps) 会异常大——这正是 loss 跳一下的直接原因'],
      ['丢的第二样：scheduler 状态','若用了 cosine 或 step 衰减，lr 回到初始值，相当于突然把学习率调大'],
      ['丢的第三样：epoch/step','日志和 scheduler 的进度对不上，续训的曲线无法和原来拼接'],
      ['丢的第四样：随机状态','数据顺序和增强序列都变了。大数据上无所谓，小样本免疫数据上会造成可见差异'],
      ['丢的第五样：AMP 的 GradScaler','scale 因子从初始值重新摸索，头几十步可能连着 skip 掉几个 step'],
      ['正确的存法','torch.save({model: model.state_dict(), opt: opt.state_dict(), sched: sched.state_dict(), scaler: scaler.state_dict(), epoch: ep, rng: torch.get_rng_state(), git: commit_hash, cfg: cfg}, path)']],
     a:'丢了优化器状态（主因）、scheduler、epoch、随机状态、GradScaler。恢复训练的 checkpoint 要存这一整套',
     meta:'恢复后 loss 跳一下，第一嫌疑永远是优化器状态没存。'}
  ],
  feyn:['state_dict 里有什么、没有什么？BN 的 running_mean 在不在里面？',
        '为什么 torch.save(model) 在重构代码之后就打不开了？',
        'strict=False 为什么是个危险的开关？怎么用才安全？',
        '恢复训练只存权重，为什么 loss 会跳一下？',
        'map_location 解决的是什么问题？'],
  exam:'免疫方向的模型往往要在几个月里反复复用：先在公开的 scRNA-seq 上预训一个编码器，再迁到自己实验室的 T 细胞数据上。这条链路上 checkpoint 必须是纯 state_dict 加一份超参 dict 加 git commit hash，因为半年后代码一定改过。迁移时的标准动作是过滤掉 head 的键、strict=False、打印 missing/unexpected 核对——省掉这一句 print 就可能整个骨干没加载而毫不知情。投稿时审稿人越来越常要 checkpoint 和复现脚本，把随机种子和随机状态一起存进去，是可复现性最便宜的一笔投资。',
  pit:[
    {t:'torch.save(model) 存整个对象', why:'pickle 绑定了类的导入路径，重构代码后加载不了', fix:'一律存 state_dict'},
    {t:'strict=False 之后不看返回值', why:'前缀写错会让整个骨干静默不加载，模型其实是随机初始化', fix:'print(res.missing_keys, res.unexpected_keys) 并人工核对'},
    {t:'恢复训练只存权重', why:'优化器状态、scheduler、GradScaler 全丢，loss 会跳', fix:'存完整的一套并在加载时逐项恢复'},
    {t:'torch.load 不写 map_location', why:'GPU 上存的 checkpoint 在无卡机器上直接报错', fix:'map_location=cpu 之后再 model.to(device)'},
    {t:'对来路不明的 checkpoint 设 weights_only=False', why:'pickle 反序列化可以执行任意代码', fix:'保持默认 weights_only=True；确需要完整对象时先确认来源'},
    {t:'checkpoint 只有权重没有超参', why:'半年后不知道这份权重对应哪套结构和哪个 lr', fix:'把 cfg dict 和 git commit hash 一起存进去'}
  ]
},

'pt.amp': {
  route: [
    {q:'开 AMP 之后出现 NaN 或 Inf，按位置分', a:[
      {c:'loss 一开始就是 nan', to:'查前向里的手写数值操作：exp、log、除法、pow、norm。这些在 autocast 下会被降到 fp16，指数一大就溢出。用 with autocast(enabled=False) 局部包住并转 float32'},
      {c:'训练几百步后变 nan', to:'多半是梯度爆炸而非精度。先看 grad norm，加 clip_grad_norm_（注意必须在 scaler.unscale_(opt) 之后 clip）'},
      {c:'只在某个 loss 项上出现', to:'那一项里有 log(0) 或除以近 0 的量。加 eps 或换用带 logits 的稳定实现（BCEWithLogitsLoss、log_softmax）'},
      {c:'换 bf16 就好了', to:'确认是 fp16 的动态范围问题。有 Ampere 以上的卡就直接用 bf16'}]},
    {q:'开了 AMP 但没变快', a:[
      {c:'瓶颈在数据加载', to:'AMP 只加速计算。先看 GPU 利用率，走 pt.dataloader'},
      {c:'模型很小或全是逐元素 op', to:'AMP 加速的是 Tensor Core 上的矩阵乘/卷积。访存受限的部分基本没提升'},
      {c:'维度不是 8 的倍数', to:'Tensor Core 要求通道数/隐藏维对齐（fp16 通常是 8 的倍数）。把 hidden 从 250 改成 256 常常直接快一截'},
      {c:'只想省显存不图快', to:'那是合理目标：激活减半是最稳的收益'}]},
    {q:'AMP 的三行没写对', a:[
      {c:'忘了 scaler.scale(loss)', to:'小梯度在 fp16 下下溢成 0，训练悄悄不动'},
      {c:'在 unscale 之前做了 clip 或看 grad', to:'看到的是被放大过的梯度，clip 阈值失效。先 scaler.unscale_(opt) 再 clip'},
      {c:'忘了 scaler.update()', to:'scale 因子不再自适应，遇到 inf 后不会回退'},
      {c:'把 backward 也包进 autocast', to:'不需要也不该。autocast 只包前向和 loss 计算'}]}
  ],
  deep:`**AMP 的全部前提是 fp16 的动态范围很窄。** fp16 有 5 位指数，最小正规数约 6.1×10^−5，最大约 65504。而反向传播里的梯度经常落在 1e−7 到 1e−9，直接用 fp16 存就被截成 0——不是精度损失，是整片梯度归零，训练看上去在跑但参数几乎不动。GradScaler 的做法极其朴素：backward 之前把 loss 乘一个大系数 S（初值 65536），链式法则保证所有梯度同比放大 S 倍，于是它们进入 fp16 的可表示区间；step 之前再把梯度除回 S。这就是「损失缩放」。

**scaler 是自适应的，这解释了它的两个行为。** 每一步 step 前 scaler 检查梯度里有没有 inf/nan：有，就跳过这一步的 step 并把 S 减半（所以训练开头几步的 lr 曲线可能显示「跳过了 step」，是正常的）；连续若干步都没问题，就把 S 翻倍去试探更大的缩放。所以 scaler.update() 不能省——省了它就退化成固定缩放，遇到溢出不会回退。

**混合精度的「混合」在哪。** autocast 维护一张 op 白名单：matmul、conv 这类算力受限且对精度不敏感的走 fp16；而 sum、mean、softmax、layer_norm、log、exp 这类涉及累加或指数的，会被自动保持在 fp32——因为大量小数在 fp16 下累加会严重损失有效位。参数本身始终是 fp32（这叫 master weights），只在前向时临时转成 fp16 做计算。所以显存的节省来自激活（大约减半），不来自参数。

**bf16 与 fp16 的分界线。** bf16 有 8 位指数，与 fp32 完全相同，动态范围一样宽，只是尾数少（精度低）。因为不会下溢，用 bf16 通常根本不需要 GradScaler，三行代码变一行，调试成本骤降。代价是数值精度更粗，某些对精度敏感的任务（小学习率的微调）表现会略差。判据很简单：卡是 Ampere（A100/RTX 30 系）以上就默认 bf16，更老的卡（V100/T4）只有 fp16，那就老老实实用 GradScaler。

**收益的现实估计。** 算力受限的大矩阵乘/卷积可以快 1.5~2 倍；显存上激活减半是最可靠的收益，常常能把 batch 翻倍。但如果 GPU 利用率本来就只有 40%（数据受限），AMP 一点都不会快——先解决数据管线再谈精度。另外维度对齐很关键：Tensor Core 要求通道数/隐藏维是 8 的倍数，把 hidden 从 250 改成 256 这种小改动有时比开 AMP 本身收益还大。`,
  worked:[
    {q:'开 AMP 后 loss 立刻变 nan。前向里有一行自定义的 KL 项：kl = (p * (p.log() - q.log())).sum()。定位并修。',
     steps:[
      ['先分清是范围问题还是爆炸问题','第一步就 nan，不是训练发散，是前向的数值问题'],
      ['找 autocast 会降精度的危险 op','log 的输入若接近 0，fp16 下 p 可能直接被舍成 0，log(0) = −inf，再乘 p（=0）得到 0 × inf = nan'],
      ['确认','把这一行前后打印 p.dtype 和 p.min()，会看到 dtype 是 float16 且最小值是 0'],
      ['修法一（局部关 autocast）','with torch.autocast(device_type=cuda, enabled=False): kl = (p.float() * (p.float().log() - q.float().log())).sum()'],
      ['修法二（换稳定实现）','用 F.kl_div(q.log_softmax(-1), p.log_softmax(-1), log_target=True)，让框架在 log 空间里算，从根上避免 log(0)'],
      ['一条通用规矩','所有手写的 log / exp / 除法 / sqrt 都应该在 fp32 里做，或者换成框架提供的带 logits 的稳定版本']],
     a:'fp16 下 p 被舍成 0 导致 log(0) 与 0×inf。局部 enabled=False 转 fp32，或改用 F.kl_div 的 log 空间实现',
     meta:'AMP 出 nan，先在前向里找手写的 log/exp/除法，那里几乎总是根因。'},
    {q:'AMP 的标准四行是什么？为什么 clip_grad_norm_ 必须写在 scaler.unscale_(opt) 之后？',
     steps:[
      ['标准写法','with autocast(): out = model(x); loss = crit(out, y)  →  scaler.scale(loss).backward()  →  scaler.step(opt)  →  scaler.update()'],
      ['scale 之后梯度是什么','loss 被乘了 S（初值 65536），链式法则让所有参数的 .grad 也被乘了 S'],
      ['直接 clip 会怎样','clip_grad_norm_(params, 1.0) 看到的 norm 是真实 norm 的 S 倍，几乎必然远大于 1，于是每一步都被裁到 1/S 的比例——等价于把学习率砍到几乎为 0，训练看似在跑其实不动'],
      ['正确顺序','scaler.scale(loss).backward(); scaler.unscale_(opt); clip_grad_norm_(model.parameters(), 1.0); scaler.step(opt); scaler.update()'],
      ['unscale_ 的额外语义','它保证这一步只会被调用一次，之后 scaler.step 知道梯度已经还原，不会再除一遍']],
     a:'四行是 autocast 包前向 → scale(loss).backward → step → update；clip 前必须 unscale_，否则裁的是放大 S 倍后的梯度，等价于把 lr 砍到接近 0',
     meta:'凡是要在 backward 和 step 之间「看一眼梯度」的操作（clip、打印 norm、手动改梯度），都必须先 unscale_。'},
    {q:'某段梯度的真实量级是 3×10^−8。用 fp16 直接存会怎样？scale=65536 之后呢？为什么 bf16 不需要这一步？',
     steps:[
      ['fp16 的下界','最小正规数约 6.1×10^−5，次正规数最小约 6×10^−8。3e−8 落在次正规区甚至更低，有效位只剩一两位，实际上大概率被舍成 0'],
      ['放大后','3e−8 × 65536 ≈ 1.97e−3。这个数在 fp16 里表示得很精确，梯度信息完整保留'],
      ['step 前还原','除回 65536 得到 3e−8，此时是在 fp32 的 master weights 上做更新，不再受 fp16 范围限制'],
      ['bf16 的情况','bf16 的指数位和 fp32 一样是 8 位，最小正规数约 1.2e−38，3e−8 完全在正常范围内，根本不会下溢'],
      ['代价','bf16 尾数只有 7 位（fp16 有 10 位），相对精度更差。但训练对范围的敏感度远高于对精度的敏感度，所以实践中 bf16 更省心']],
     a:'fp16 下 3e−8 基本被舍成 0；乘 65536 后约 1.97e−3 可精确表示。bf16 指数位与 fp32 相同，不会下溢，故不需要 GradScaler',
     meta:'fp16 缺的是范围不是精度，所以解法是缩放而不是提高位数。'}
  ],
  feyn:['fp16 的哪个特性导致梯度归零？是精度还是范围？',
        'GradScaler 乘上去的那个系数，为什么能靠链式法则同比放大所有梯度？',
        '为什么 scaler 会跳过某些 step？这正常吗？',
        'clip_grad_norm_ 写在 unscale_ 之前会发生什么？',
        'bf16 为什么通常不需要 GradScaler？它的代价是什么？'],
  exam:'显微图像分割是 AMP 收益最大的场景：(3,512,512) 的输入配 U-Net，激活占绝对大头，开 AMP 后 batch 常能从 4 翻到 8，而 batch 翻倍对 BatchNorm 的统计质量是实打实的改善。反过来，flow cytometry 特征表这种小 MLP 任务，瓶颈在数据加载，开 AMP 几乎没有收益还多了一层调试成本，不值得。写自定义 loss（比如带 log 的 Dice、KL 散度、对比学习的 InfoNCE）时一律先想 fp16 会不会溢出，能用框架的 logits 版本就不要手写 log。报告里注明用了 AMP 及 fp16/bf16，因为它会影响可复现性。',
  pit:[
    {t:'忘了 scaler.scale(loss)，直接 loss.backward()', why:'小梯度在 fp16 下溢成 0，训练悄悄停滞而不报错', fix:'四行一起写，不要拆'},
    {t:'clip 或打印 grad norm 写在 unscale_ 之前', why:'看到的是放大 S 倍的梯度，clip 阈值失效等价于把 lr 砍到接近 0', fix:'scaler.unscale_(opt) 之后再做任何梯度侧操作'},
    {t:'把 backward 包进 autocast', why:'没有必要，autocast 只管前向的 op 派发；包进去反而容易掩盖问题', fix:'autocast 只包前向和 loss 计算'},
    {t:'手写 log / exp / 除法不做保护', why:'fp16 范围窄，log(0) 与溢出直接产生 nan', fix:'局部 autocast(enabled=False) 转 fp32，或改用 log_softmax / BCEWithLogitsLoss 这类稳定实现'},
    {t:'在老卡（V100/T4）上用 bf16', why:'硬件不支持会退化成软件模拟，反而更慢', fix:'先查卡的算力等级；Ampere 以下用 fp16 + GradScaler'},
    {t:'指望 AMP 解决数据受限的慢', why:'AMP 只加速计算，GPU 在等数据时精度改不改都一样', fix:'先看 GPU 利用率，低于 60% 先修 DataLoader'}
  ]
},

'pt.debug_shape': {
  route: [
    {q:'四道筛按顺序过：shape → device → dtype → 计算图。报错原文属于哪一道？', a:[
      {c:'mat1 and mat2 shapes cannot be multiplied / size mismatch / stack expects equal size / dimension out of range', to:'shape 筛。报错里给出的两个尺寸就是答案本身，抄下来对齐'},
      {c:'Expected all tensors to be on the same device, but found at least two devices', to:'device 筛。走 pt.device 的四嫌疑：数据没搬 / list 里的层 / 普通属性张量 / forward 里现造的张量'},
      {c:'expected scalar type Long but found Float / result type Float can not be cast to Long', to:'dtype 筛。索引与 target 要 int64，输入与权重要 float32'},
      {c:'does not have a grad_fn / backward a second time / modified by an inplace operation', to:'计算图筛。走 pt.autograd'}]},
    {q:'shape 筛内部再细分', a:[
      {c:'(a,k) @ (m,b) 内侧不等', to:'k ≠ m。找 flatten 之后的 in_features 或忘了 transpose 的那一处'},
      {c:'广播规则不满足', to:'从最后一维往前对齐，每一维要么相等要么其中一个为 1。打印两边 shape 右对齐写下来'},
      {c:'CrossEntropyLoss 报维度错', to:'它要 logits (N,C) 与 target (N,)；分割任务要 (N,C,H,W) 与 (N,H,W)。多一个维通常是没 squeeze 掉通道'},
      {c:'序列任务在 (B,T,C) 与 (B,C,T) 之间打架', to:'Conv1d 要 (B,C,T)，Linear/Transformer 要 (B,T,C)，接缝处 transpose(1,2)'}]},
    {q:'不报错但结果不对，做四个断言', a:[
      {c:'loss 不降', to:'断言权重真的在变：训练前存 p0.clone()，10 步后 assert not torch.allclose(p0, p)'},
      {c:'指标高得离谱', to:'断言训练/验证的样本来源集合无交集'},
      {c:'验证结果随 batch 大小变化', to:'断言 model.training is False，这是 BatchNorm 没进 eval 的确定性判据'},
      {c:'跑两遍结果不同', to:'固定三处种子 + DataLoader 的 generator 与 worker_init_fn，再看是否稳定'}]}
  ],
  deep:`**九成 PyTorch 报错只有四类，且报错原文已经把答案写在里面了。** 排错的效率不来自读框架源码，而来自「把报错映射到四道筛之一，然后在出错行前打印三样东西」这个固定动作：print(x.shape, x.dtype, x.device)。

**第一道筛 shape。** RuntimeError: mat1 and mat2 shapes cannot be multiplied (64x784 and 256x128) —— 括号里就是全部信息：第一个矩阵 64×784，第二个 256×128，内侧 784 ≠ 256。你甚至不需要看代码就知道该把那个 Linear 的 in_features 从 256 改成 784。这个例子的典型来源是 MNIST 展平后 784 维直接喂给了第二层的 Linear(256,128)，也就是模型定义里少写了第一层或者顺序接错。分割任务里最常见的是通道维和空间维搞混，序列任务里最常见的是 (B,T,C) 与 (B,C,T)。

**第二道筛 device。** 报错原文会直接说 found at least two devices, cuda:0 and cpu。它告诉你有两块设备，但不告诉你是哪个张量。四个嫌疑按概率排序：数据没 .to(device)（最常见，且往往是忘了搬 y，所以前向能跑、报错发生在 loss 那一行）；模型里的层放进了 python list；张量常量用普通属性而不是 register_buffer；forward 里 torch.zeros(n) 没指定 device。

**第三道筛 dtype。** expected scalar type Long but found Float 几乎总是 CrossEntropyLoss 的 target：它要的是类别索引（int64），不是 one-hot，也不是浮点。反过来 expected scalar type Float but found Double 则是 numpy 的 float64 被 from_numpy 带了进来。一条规矩解决大半：所有「下标、类别、索引」用 int64，所有「特征、权重、图像」用 float32，在数据入口处一次性转好。

**第四道筛 计算图。** does not have a grad_fn 说明 loss 根本不在图上；backward a second time 说明前向被复用了；modified by an inplace operation 说明版本计数对不上。这三条的诊断在 pt.autograd。

**不报错的错才最贵。** 上面四类至少会停下来告诉你。真正吃时间的是「跑得通但结果不对」：权重没在动（zero_grad 顺序写反、层没注册）、划分泄漏、忘了 model.eval()、随机性没锁。这四件事对应四个断言，写进训练脚本一次，之后每次都自动检查——这比事后调试便宜一个数量级。

**广播是 shape 筛里最容易出静默错误的地方。** (N,1) 和 (N,) 相减会广播成 (N,N)，不报错，但你的 loss 从此算的是一个 N×N 矩阵的平均。规矩：写减法/比较之前，把两边 shape 打出来右对齐看一眼；用 keepdim=True 保持维数，或显式 squeeze/unsqueeze，不要依赖广播来「碰巧对上」。`,
  worked:[
    {q:'RuntimeError: mat1 and mat2 shapes cannot be multiplied (64x784 and 256x128)。给出定位链条与修法。',
     steps:[
      ['解读括号','mat1 是 64×784（batch=64，特征 784），mat2 是 256×128（某个 Linear 的权重，in=256, out=128）'],
      ['判据','矩阵乘要求 mat1 的列数等于 mat2 的行数：784 ≠ 256'],
      ['反推来源','784 = 28×28，是 MNIST 展平后的维度。说明展平之后第一个碰到的 Linear 的 in_features 是 256，也就是模型里第一层 Linear(784,256) 没被调用到，或者层的顺序接反了'],
      ['两种可能的具体 bug','一，nn.Sequential 里少写了 Linear(784,256)；二，层放在 python list 里没注册，forward 里手动调用时跳过了第一层'],
      ['修','补上 Linear(784,256)，或把 in_features 改成 784。验证方式是把 batch 换成 7 再跑一次——报错里的第一个数应该跟着变成 7，确认那一维确实是 batch']],
     a:'内侧维不等：784 ≠ 256。补回 Linear(784,256) 或把该层 in_features 改成 784',
     meta:'shape 报错里的四个数字就是完整线索：改 batch 看哪个数字跟着变，就知道哪一维是 batch。'},
    {q:'一段代码同时踩了两个错。第一次报 Expected all tensors to be on the same device, but found at least two devices, cuda:0 and cpu!；修完再报 expected scalar type Long but found Float。写出两次定位。',
     steps:[
      ['第一次：device','训练循环里写了 x = x.to(device) 但没写 y。前向 model(x) 正常跑完（都在 cuda:0），报错发生在 crit(out, y) 这一行——因为 out 在 cuda:0 而 y 还在 cpu'],
      ['修一','y = y.to(device)。或者一次搬两个：x, y = x.to(device), y.to(device)'],
      ['第二次：dtype','device 对上之后，CrossEntropyLoss 开始检查 target 类型，发现 y 是 float。因为标签是从 pandas 的一列读出来的，默认 float64，from_numpy 原样带进来'],
      ['确认是索引不是 one-hot','print(y.shape, y[:5])。若是 (N,) 且值为 0/1/2，就只是类型问题'],
      ['修二','y = y.long()。更好的做法是在 Dataset 的 __getitem__ 里就 torch.as_tensor(label, dtype=torch.long)，让类型在入口处一次性确定'],
      ['为什么两个错会接连出现','四道筛是有顺序的：框架先检查 device 再检查 dtype。同一个 y 同时错了两处，就会一个一个报出来']],
     a:'两个错同源于 y 的处理：先补 y.to(device)，再补 y.long()。根治办法是在 Dataset 里就把 dtype 定好',
     meta:'连着报两个不同的错，先想是不是同一个张量同时错了两处属性。'},
    {q:'代码不报错但 loss 在 0.69 附近纹丝不动（二分类）。给出四个断言，逐个说明它能排除什么。',
     steps:[
      ['先读 0.69 这个数','ln(2) ≈ 0.693。二分类的 loss 停在这里 = 模型输出恒等于 0.5，等于完全没学到东西'],
      ['断言一：权重在动','p0 = next(model.parameters()).detach().clone()；10 步后 assert not torch.allclose(p0, next(model.parameters()))。失败则问题在 zero_grad 顺序、层没注册、或 lr=0'],
      ['断言二：梯度存在且非零','assert p.grad is not None and p.grad.abs().sum() > 0。失败则图断了，走 pt.autograd 查 no_grad / detach / argmax'],
      ['断言三：模式正确','训练循环 assert model.training；验证循环 assert not model.training。排除 Dropout 全程关闭或 BN 用错统计量'],
      ['断言四：输入不是常数','assert x.std() > 0 且 y 的类别分布不是单一类。标准化写错（除以了 0 或全局同一个数）会让输入退化成常数，模型只能输出先验'],
      ['若四条都过','那就是任务本身或 lr 的问题：把 lr 扫一遍，并做过拟合小批测试——取 16 个样本反复训，若 loss 不能压到接近 0，说明模型或 loss 定义有结构性错误']],
     a:'0.69 = ln2 说明输出恒为 0.5。四个断言依次排除：权重没动 / 图断了 / 模式错 / 输入退化；全过就做 16 样本过拟合测试',
     meta:'loss 卡在 ln(类别数) 就是「模型什么都没学到」，先证明权重在动，再谈调参。'}
  ],
  feyn:['mat1 and mat2 shapes cannot be multiplied (64x784 and 256x128) 这一行报错，哪几个数字是 batch，哪几个是层的定义？',
        'device 报错只说有两块设备，你用什么办法在三十秒内找到是哪个张量？',
        'expected scalar type Long but found Float 最常见的根因是什么？',
        '为什么二分类的 loss 卡在 0.69 是一个很强的信号？',
        '哪四个断言写进训练脚本，能挡掉「跑得通但结果不对」的大部分情形？'],
  exam:'带一个新学生上手你的 flow cytometry 分类脚本时，最高效的交付不是文档而是四个断言：权重在动、梯度非零、model.training 与循环匹配、训练与验证的病人 ID 集合无交集。这四条能挡掉这个大陆里最贵的错误。另外给自己定一条规矩：任何新模型上手先做「16 个样本过拟合测试」——取一小批数据反复训，loss 必须能压到接近 0；压不下去说明模型结构或 loss 定义有问题，这时候去调学习率纯属浪费时间。小样本免疫数据尤其要这一步，因为真实指标本来就低，你没法靠指标判断代码对不对。',
  pit:[
    {t:'看到报错就去搜引擎，不看报错里的数字', why:'shape 报错的括号里已经写着两个矩阵的确切尺寸，答案就在原文里', fix:'先把报错原文里的数字对上代码，再考虑搜索'},
    {t:'只打印 x.shape', why:'device 和 dtype 的错同样高频，分三次试等于三倍时间', fix:'固定打印 print(x.shape, x.dtype, x.device) 三样'},
    {t:'依赖广播让形状「碰巧对上」', why:'(N,1) 与 (N,) 会广播成 (N,N) 且不报错，loss 从此算错', fix:'用 keepdim=True 或显式 unsqueeze/squeeze，写之前右对齐核一遍 shape'},
    {t:'CUDA 报错时直接读报错行', why:'CUDA 异步，报错行常常不是真正出错的行', fix:'设 CUDA_LAUNCH_BLOCKING=1 复跑一次再看'},
    {t:'没跑过拟合小批测试就开始调超参', why:'结构或 loss 定义有错时，调参永远不会有效果', fix:'先用 16 个样本把 loss 压到接近 0，证明这条链路是通的'},
    {t:'把断言只写在脑子里', why:'每次手动检查一定会漏', fix:'四个断言写进训练脚本，每次自动跑'}
  ]
}

});
