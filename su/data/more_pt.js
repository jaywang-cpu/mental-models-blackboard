/* 数理宇宙 v2 · 加题：pt PyTorch 大陆（11 节点 × 8 题，一半秒答一半推演） */
window.MORE = window.MORE || {};
Object.assign(window.MORE, {

'pt.tensor':[
  {q:'torch.zeros(3,4).sum(dim=0) 的形状', a:'(4,)', how:'对 dim=0 归约就是把这一维去掉'},
  {q:'torch.randn(2,3,4).transpose(0,1) 的形状，搬了多少数据', a:'(3,2,4)，一个字节都没搬', how:'transpose 只交换 stride，是元信息操作'},
  {q:'torch.tensor([1,2,3]).dtype 和 torch.tensor([1.,2.,3.]).dtype', a:'int64 和 float32', how:'整数列表给 int64，小数列表给 float32'},
  {q:'一个 (64,3,224,224) 的 float32 张量占多少内存', a:'约 38.5 MB（36.75 MiB）', how:'64×3×224×224 = 9633792 个元素，×4 字节 = 38535168'},
  {q:'x 形状 (5,3)，x[0] 和 x[0:1] 的形状分别是什么', a:'(3,) 和 (1,3)', how:'整数索引降维，切片保维'},
  {q:'y = x.transpose(0,1) 之后 y.view(-1) 报错，两种改法及其代价', a:'y.reshape(-1) 会按需拷贝；y.contiguous().view(-1) 是显式拷贝。代价相同，后者意图更清楚', how:'非连续张量无法用单一 stride 重新解释'},
  {q:'df.values 得到的数组 from_numpy 后进 nn.Linear，报什么，为什么不能把模型 .double()', a:'expected scalar type Float but found Double；改模型会让显存翻倍、速度腰斩且 amp 失效', how:'pandas 默认 float64，永远把数据降到 float32'},
  {q:'怎么判断两个张量是不是同一份底层数据', a:'比较 x.data_ptr() == y.data_ptr()', how:'长得一样不代表是同一份，视图和拷贝要靠地址区分'}
],

'pt.autograd':[
  {q:'x=torch.tensor(2.0,requires_grad=True)，y=3*x**2+2*x，backward 后 x.grad', a:'14.0', how:'dy/dx=6x+2，x=2 代入'},
  {q:'x=[1.,2.,3.] requires_grad，y=(x**2).sum()，backward 后 x.grad', a:'[2., 4., 6.]', how:'每个分量独立，导数是 2x'},
  {q:'h = x*2 是中间变量，backward 之后 h.grad 是多少', a:'None', how:'非叶子默认不保存梯度，调试要 h.retain_grad()'},
  {q:'x 的 requires_grad 是 False，loss.backward() 之后 x.grad 是什么', a:'None，而且不报错', how:'反向只往 requires_grad 的叶子上写'},
  {q:'torch.autograd.grad 和 loss.backward() 有什么区别', a:'grad 返回梯度元组，不写入 .grad 也不累加；backward 写进 .grad 并累加', how:'要分别查看多个 loss 的梯度就用 grad'},
  {q:'y=x**3，x=2，要拿到二阶导要怎么写，结果是多少', a:'一阶 backward 加 create_graph=True，再对 x.grad 求导；二阶是 6x=12', how:'不建二阶图就没法对梯度再求导'},
  {q:'ReLU 在 0 处 PyTorch 给的梯度是多少，这是数学结论吗', a:'0；不是数学结论，是工程约定', how:'不可导点框架自己选一个次梯度，不会报错'},
  {q:'训练循环里 total += loss（loss 未 detach），第二个 batch 报什么，根因是什么', a:'trying to backward through the graph a second time；根因是把跨 batch 的计算图连了起来', how:'统计量一律 .item()，梯度累积靠每步 backward'}
],

'pt.requires_grad':[
  {q:'with torch.no_grad() 块里新建的张量 requires_grad 是什么', a:'False', how:'块内一切不建图'},
  {q:'x.detach() 出来的张量，数据和内存分别是共享还是独立', a:'数据共享同一块存储，只是在图上断开', how:'要独立必须 detach().clone()'},
  {q:'对一个 int64 张量调 requires_grad_(True) 会怎样', a:'报错，只有浮点和复数张量可以求导', how:'整数不可导'},
  {q:'model.eval() 会不会把参数的 requires_grad 设成 False', a:'不会，两者完全无关', how:'eval 只改 Dropout 和 BN 的前向行为'},
  {q:'只把骨干 requires_grad 设 False，显存大概能省多少', a:'几乎不省（只省了这些参数自己的 .grad）；激活照旧保留', how:'省显存唯一有效手段是 no_grad'},
  {q:'ResNet18 冻结骨干只训 fc(512,10)，可训练参数是多少，占比多少', a:'5130 个，约占 1170 万的 0.044%', how:'512×10+10=5130；11.7e6 分之 5130'},
  {q:'手写更新写成 p = p - lr*p.grad，下一步为什么 p.grad 变成 None', a:'这句造出了一个新的非叶子张量，原 Parameter 根本没被改', how:'必须写 with torch.no_grad(): p -= lr*p.grad'},
  {q:'冻结骨干后 BN 的 running_mean 还会变吗，为什么', a:'会。它是 buffer，在 train 模式下前向就更新，requires_grad 管不着', how:'要真冻住必须把 BN 模块 .eval()'}
],

'pt.module':[
  {q:'nn.Conv2d(3,64,3) 的参数量', a:'1792', how:'3×64×3×3 = 1728 权重，加 64 偏置'},
  {q:'nn.Conv2d(64,64,3,bias=False) 的参数量', a:'36864', how:'64×64×9，无偏置'},
  {q:'nn.LayerNorm(768) 的参数量', a:'1536', how:'gamma 和 beta 各 768'},
  {q:'nn.BatchNorm2d(64) 有几个可学习参数，几个 buffer 元素', a:'128 个参数（gamma+beta），128 个 buffer 元素（running_mean+running_var），另有一个 num_batches_tracked', how:'buffer 进 state_dict 但不进 parameters'},
  {q:'Linear(784,256)+ReLU+Linear(256,64)+ReLU+Linear(64,10) 总参数量', a:'218058', how:'200960 + 16448 + 650，ReLU 无参数'},
  {q:'nn.Sequential 和 nn.ModuleList 该怎么选', a:'顺序执行选 Sequential（自带 forward）；forward 里要写循环或条件选 ModuleList', how:'ModuleList 只负责注册，不能直接调用'},
  {q:'register_buffer 和普通属性张量的三个区别', a:'buffer 会随 to(device) 搬、进 state_dict、被 eval/train 遍历到；普通张量三样全无', how:'凡是要跟着模型走但不训练的常量都用 buffer'},
  {q:'self.a = self.b = nn.Linear(4,4)，parameters() 里算几份', a:'一份（按对象 id 去重）', how:'共享权重靠对象同一性，deepcopy 一份就变两组独立参数'}
],

'pt.optimizer':[
  {q:'Adam 的 betas 默认值', a:'(0.9, 0.999)', how:'一阶矩衰减 0.9，二阶矩 0.999'},
  {q:'SGD momentum 从 0 改成 0.9，学习率大致要怎么调', a:'除以约 10', how:'稳态位移被放大 1/(1-0.9)=10 倍'},
  {q:'zero_grad(set_to_none=True) 和默认写法差在哪', a:'把 grad 置为 None 而不是全 0：省一份显存，且未参与前向的参数不会被动量继续更新', how:'新版本默认就是 True'},
  {q:'AdamW 和 Adam+weight_decay 的本质差别', a:'Adam 把 L2 项加进梯度，会被二阶矩缩放，衰减强度与梯度大小反相关；AdamW 把衰减解耦，直接作用在参数上', how:'新代码一律 AdamW'},
  {q:'weight_decay 该不该给 bias 和 LayerNorm 的参数', a:'不该，这两类的 weight_decay 设 0', how:'按 p.dim() 分组，dim>=2 才 decay'},
  {q:'batch=8 想模拟 batch=64，除以几，几步 step 一次', a:'loss 除以 8，每 8 步 step 并 zero_grad 一次', how:'不除就等于把 lr 乘 8'},
  {q:'先建 optimizer 再 model.to("cuda")，能正常训练吗', a:'能。Module.to 对参数是原地改 data，优化器持有的还是同一个 Parameter 对象', how:'但结构改过之后必须重建优化器，因为状态按下标绑定'},
  {q:'amp 下梯度裁剪的正确顺序', a:'scale(loss).backward → scaler.unscale_(opt) → clip_grad_norm_ → scaler.step → scaler.update', how:'不 unscale 就是在裁被放大几万倍的梯度'}
],

'pt.dataloader':[
  {q:'10000 个样本 batch_size=64 drop_last=False，一个 epoch 几个 batch', a:'157', how:'156 个满 batch 加最后 16 个样本一批'},
  {q:'同样条件 drop_last=True 呢，丢了几个样本', a:'156 个 batch，丢 16 个', how:'10000//64=156，余 16'},
  {q:'shuffle=True 和 sampler 同时传会怎样', a:'报错，两者互斥', how:'shuffle 本身就是 RandomSampler 的语法糖'},
  {q:'pin_memory 要配什么才真的异步', a:'配 .to(device, non_blocking=True)', how:'只有锁页内存才能异步 DMA'},
  {q:'IterableDataset 开 8 个 worker 不做处理会怎样', a:'每个 worker 拿到完整数据流，样本被重复 8 遍，等于 epoch 数偷偷乘 8', how:'用 get_worker_info() 按 worker_id 分片'},
  {q:'数据增强写在 Dataset.__init__ 里预先算好，有什么问题', a:'整个训练过程用的是同一份增强结果，随机性完全失效', how:'增强必须写在 __getitem__ 里，每次取都重新采样'},
  {q:'num_workers=1 就卡死和 num_workers=8 才卡死，分别指向什么', a:'1 就卡指向不可 pickle 的对象或跨进程失效的句柄；8 才卡多半是共享内存不够或 cv2 线程冲突', how:'用 num_workers=1 做二分'},
  {q:'训练集 drop_last 常设 True 而验证集设 False，理由是什么', a:'训练时最后一个小 batch 会让 BN 统计不稳（极端时 batch=1 崩）；验证要覆盖全部样本', how:'BN 依赖 batch 内统计'}
],

'pt.train_eval':[
  {q:'内置层里真正会读 training 标志的是哪两类', a:'Dropout 系和 BatchNorm 系', how:'Linear/Conv/ReLU/LayerNorm/GroupNorm 在两种模式下前向完全相同'},
  {q:'Dropout p=0.5，训练时保留下来的值被乘了多少', a:'乘 2，即除以 (1-p)', how:'inverted dropout，让期望在两种模式下一致，推理时什么都不用做'},
  {q:'BatchNorm 的 momentum=0.1 是什么意思', a:'running = 0.9×running + 0.1×当前 batch 统计', how:'和优化器的 momentum 含义相反，这里是新值的权重'},
  {q:'model.eval() 是只改这一层还是递归全树', a:'递归全树', how:'所以之后再调 model.train() 会把单独冻的 BN 全部打开'},
  {q:'eval 模式加 requires_grad=True 这个组合有什么真实用途', a:'对抗样本生成、grad-CAM、输入梯度归因', how:'要确定的前向但要对输入求导'},
  {q:'batch_size 只能开到 2，归一化层该怎么选', a:'换 GroupNorm 或 LayerNorm', how:'2 个样本估均值方差噪声极大，且 running stats 不可靠'},
  {q:'同一张图单独推理和放进 16 张的 batch 里推理结果不同，确诊什么', a:'BN 处在 train 模式，用了当前 batch 统计', how:'这是一个决定性实验，出现即确诊'},
  {q:'训练循环每个 epoch 开头写 model.train()，之前设的 BN eval 还在吗，怎么修', a:'不在了；用 model.apply 在每次 train() 之后重设，或重写模块的 train 方法', how:'train 是递归覆盖的'}
],

'pt.device':[
  {q:'一个 P 参数的模型用 AdamW 做 fp32 训练，固定开销是多少字节', a:'P×16（参数 4 + 梯度 4 + m 4 + v 4）', how:'这四项与 batch 无关，可以纸上先算'},
  {q:'1.5B 参数 AdamW fp32 的固定开销是多少 GB，24 GB 卡够吗', a:'24 GB，正好占满，一个样本都放不下', how:'1.5e9×16 = 2.4e10 字节'},
  {q:'7B 模型 fp16 纯推理，权重占多少显存', a:'14 GB', how:'7e9×2 字节'},
  {q:'(64,64,256,256) 的 float32 特征图占多少显存', a:'1 GiB', how:'64×64×65536 = 268435456 个元素，×4 字节'},
  {q:'torch.cuda.empty_cache() 能不能解决 OOM', a:'不能，它只把缓存还给驱动，对本进程下次分配没帮助还更慢', how:'看真实占用要用 torch.cuda.memory_allocated()'},
  {q:'序列长度从 512 涨到 2048，注意力矩阵的显存涨几倍', a:'16 倍', how:'随 L 平方增长，(2048/512)²'},
  {q:'OOM 时的处理顺序（四档）', a:'降 batch → 梯度累积 → 混合精度 → gradient checkpointing', how:'从最便宜且不改结果的那一档动起'},
  {q:'每步都打印 loss.item() 为什么会拖慢训练', a:'item 是同步点，强制等 GPU 算完，打断异步流水线', how:'累加在 GPU 上，每 N 步同步一次'}
],

'pt.save_load':[
  {q:'完整的训练状态由哪五样组成', a:'模型权重（含 buffer）、优化器状态、scheduler 状态、随机数状态、epoch/step', how:'用了 amp 还要加 GradScaler 的 state_dict'},
  {q:'BN 的 running_mean 在不在 state_dict 里', a:'在。它是 buffer', how:'所以通道数一改就报 size mismatch'},
  {q:'torch.load 不写 map_location，在没有 GPU 的机器上加载会怎样', a:'报错，因为它默认还原到保存时的设备', how:'固定写 map_location="cpu" 再自己 to(device)'},
  {q:'恢复训练后 loss 大跳，最可能是哪一项没存', a:'学习率调度器：cosine 训到后期 lr 可能只有初始的百分之一，不恢复就等于放大上百倍', how:'其次是优化器的 m/v'},
  {q:'DDP 存出来的 checkpoint 键名带什么前缀，两种修法', a:'module. 前缀；保存时用 model.module.state_dict()，或加载时条件性剥前缀', how:'DDP 把模型包在 self.module 里'},
  {q:'optimizer.state_dict 的键是名字还是下标，带来什么风险', a:'整数下标；模型结构一变状态就错位到别的参数上，且不报错', how:'结构改了必须重建优化器'},
  {q:'用 strict=False 加载，最必须做的一步检查是什么', a:'打印返回值的 missing_keys 和 unexpected_keys 的长度并核对', how:'键名全对不上时它静默地一个都不加载'},
  {q:'sd = model.state_dict() 存在内存里当快照，继续训练后它会变吗', a:'会。state_dict 里是张量引用不是拷贝', how:'要快照写 {k: v.detach().cpu().clone() for k,v in sd.items()}'}
],

'pt.amp':[
  {q:'fp16 能表示的最大值', a:'65504', how:'5 位指数，所以 -1e9 这种常数会直接溢出成 -inf'},
  {q:'fp16、bf16、fp32 的尾数位分别是几位', a:'10、7、23', how:'bf16 精度更低但指数位和 fp32 一样是 8 位'},
  {q:'为什么 bf16 通常不需要 GradScaler', a:'它的动态范围和 fp32 相同，梯度不会下溢', how:'fp16 的问题是范围不是精度'},
  {q:'GradScaler 检测到梯度里有 inf 会做什么', a:'跳过这一步的 step，并把 scale 减半', how:'连续若干步正常则把 scale 翻倍，永远贴着上限跑'},
  {q:'amp 下 attention mask 的填充值该怎么写', a:'torch.finfo(scores.dtype).min，不要写 -1e9', how:'-1e9 在 fp16 下变 -inf，softmax 出 nan'},
  {q:'开 amp 后显存省在哪一本账上，哪几本一点不省', a:'只省激活；参数的 fp32 主副本和 Adam 的 m/v 一点不省', how:'要省状态得用 8-bit 优化器或 LoRA'},
  {q:'为什么参数主副本必须留 fp32', a:'更新量相对参数常在 1e-3 到 1e-6，而 fp16 相对精度只有 1e-3，小更新会被大数吃掉', how:'这也是 amp 省不了优化器显存的原因'},
  {q:'开了 amp 完全没变快，最可能的两个原因', a:'模型或 batch 太小（瓶颈在 kernel 启动和访存）；瓶颈本来就在数据加载', how:'先看 GPU 利用率再判断'}
],

'pt.debug_shape':[
  {q:'输入 224，卷积 k=3 s=2 p=1，输出边长', a:'112', how:'floor((224+2-3)/2)+1 = 111+1'},
  {q:'输入 32，卷积 k=5 s=1 p=0，输出边长', a:'28', how:'32-5+1'},
  {q:'(3,1) 和 (1,4) 相加得到什么形状；(3,) 和 (4,) 呢', a:'(3,4)；后者报错', how:'从最后一维对齐，要么相等要么有一个是 1'},
  {q:'预测 (64,1) 和标签 (64,) 送进 MSELoss，算的是几项，为什么不报错', a:'广播成 (64,64)，算了 4096 项；形状合法所以不报错', how:'这是唯一一类不报错却算错的形状 bug'},
  {q:'语义分割的 CrossEntropyLoss，logits 和 target 的形状与 dtype', a:'logits (N,C,H,W) float，target (N,H,W) long', how:'不需要任何 reshape，也不要自己再 softmax'},
  {q:'conv 输出 (32,128,7,7)，接 Linear 时 in_features 该是多少，更稳的写法是什么', a:'6272；更稳的是先 AdaptiveAvgPool2d(1) 再 Linear(128,...)', how:'自适应池化让模型与输入尺寸无关'},
  {q:'报 device-side assert triggered，最可能的根因和第一动作', a:'索引越界（label 超出 [0,C-1] 或 embedding id 越界）；第一动作是 CUDA_LAUNCH_BLOCKING=1 重跑', how:'CUDA 异步导致报错行不可信，能在 CPU 复现更好'},
  {q:'分割数据集用 255 标记 ignore 区域，直接训会怎样，怎么修', a:'label 越界触发 device-side assert；设 ignore_index=255 或把 255 映射掉', how:'CrossEntropyLoss 要求 target 在 [0,C-1] 或等于 ignore_index'}
]

});
