// 代码宇宙 · 二级子区 SUBS（星环套星环）
// 每块大陆 2-4 个子区；每个节点只出现一次。子区划分呼应 routes.js 判型树第一层。
window.SUBS = window.SUBS || {};
Object.assign(window.SUBS, {

py:[
  {k:'store', name:'储物抽屉间', en:'STORAGE DRAWERS', one:'按位置还是按名字装数据',
   nodes:['py.list_dict','py.slice','py.string','py.mutable']},
  {k:'flow', name:'流程装配线', en:'ASSEMBLY LINE', one:'循环、函数、类，把逻辑拆开复用',
   nodes:['py.loop_comprehension','py.function','py.class','py.recursion']},
  {k:'fix', name:'故障排查台', en:'REPAIR BENCH', one:'读报错、数复杂度',
   nodes:['py.debug','py.bigo']}
],

np:[
  {k:'shape', name:'形状铸模间', en:'SHAPE FOUNDRY', one:'造数组、改形状、先问 shape',
   nodes:['np.array_shape','np.reshape','np.random']},
  {k:'align', name:'对齐车间', en:'ALIGNMENT WORKS', one:'两个数组怎么对上才能算',
   nodes:['np.broadcast','np.dot','np.overflow']},
  {k:'pick', name:'筛选归约台', en:'SIFT & REDUCE', one:'筛出一部分、压掉一维',
   nodes:['np.mask','np.axis']},
  {k:'speed', name:'提速引擎室', en:'SPEED ENGINE', one:'去掉 for，整块一起算',
   nodes:['np.vectorize','np.linalg']}
],

vz:[
  {k:'relation', name:'关系观测台', en:'RELATION DECK', one:'两个量之间有没有关系、怎么变',
   nodes:['vz.scatter','vz.line']},
  {k:'dist', name:'分布陈列室', en:'DISTRIBUTION HALL', one:'一堆数长什么样、跨数量级怎么办',
   nodes:['vz.hist','vz.log_axis']},
  {k:'field', name:'地形测绘室', en:'TERRAIN SURVEY', one:'平面上每点一个值怎么画',
   nodes:['vz.heatmap','vz.contour','vz.3d']},
  {k:'polish', name:'排版打磨间', en:'POLISH STUDIO', one:'颜色、分面、标注让图好读',
   nodes:['vz.color','vz.subplot','vz.annotate']}
],

da:[
  {k:'intake', name:'原料清洗池', en:'INTAKE & WASH', one:'刚拿到的脏表先理顺',
   nodes:['da.dataframe','da.clean','da.tidy']},
  {k:'combine', name:'汇总拼接车间', en:'MERGE WORKS', one:'分组汇总、两表拼接、逐行操作',
   nodes:['da.groupby','da.merge','da.apply']},
  {k:'feed', name:'防漏投喂间', en:'LEAK-PROOF FEED', one:'划分、缩放、管线，一滴不漏送进模型',
   nodes:['da.split','da.normalize','da.pipeline','da.leak']}
],

ml:[
  {k:'classic', name:'经典模型货架', en:'CLASSIC SHELF', one:'有标签：划线、查表、数数',
   nodes:['ml.linear_reg','ml.logistic','ml.svm','ml.knn','ml.naive_bayes']},
  {k:'trees', name:'树林车间', en:'TREE WORKS', one:'切分、投票、拟合残差',
   nodes:['ml.tree','ml.forest','ml.xgboost']},
  {k:'nolabel', name:'无标签分拣厂', en:'UNLABELED SORTER', one:'没标签：分组或降维',
   nodes:['ml.kmeans','ml.pca']},
  {k:'judge', name:'评审优化室', en:'JUDGE & TUNE', one:'训完好不好、训不动怎么办',
   nodes:['ml.metrics','ml.gradient_descent']}
],

dl:[
  {k:'engine', name:'基础动力舱', en:'CORE ENGINE', one:'层、激活、反传、损失',
   nodes:['dl.mlp','dl.activation','dl.backprop','dl.loss']},
  {k:'vision', name:'视觉工厂', en:'VISION PLANT', one:'图像进来：分类或逐像素',
   nodes:['dl.cnn','dl.resnet','dl.unet']},
  {k:'seq', name:'序列工坊', en:'SEQUENCE SHOP', one:'序列怎么记住远处的东西',
   nodes:['dl.rnn','dl.attention','dl.transformer']},
  {k:'gen', name:'造物车间', en:'GENERATOR SHOP', one:'生成新样本',
   nodes:['dl.vae','dl.gan']}
],

bm:[
  {k:'seqimg', name:'序列影像站', en:'SEQ & IMAGE', one:'分子序列和图像怎么进模型',
   nodes:['bm.sequence','bm.protein_embed','bm.image_seg']},
  {k:'cell', name:'细胞分选厅', en:'CELL SORTING HALL', one:'流式 gating、单细胞聚类',
   nodes:['bm.flow_gating','bm.cell_cluster']},
  {k:'dose', name:'剂量时间室', en:'DOSE & TIME', one:'浓度、时间、事件何时发生',
   nodes:['bm.dose_response','bm.pk_ode','bm.survival']},
  {k:'suspect', name:'可疑结果审讯室', en:'SUSPECT INTERROGATION', one:'结果好得可疑：先查批次和泄漏',
   nodes:['bm.batch_effect','bm.small_n']}
],

pt:[
  {k:'tensor', name:'张量记账所', en:'TENSOR LEDGER', one:'tensor 多出的三样：设备、梯度、账本',
   nodes:['pt.tensor','pt.autograd','pt.requires_grad']},
  {k:'loop', name:'训练流水线', en:'TRAINING LINE', one:'模型、优化器、数据、开关',
   nodes:['pt.module','pt.optimizer','pt.dataloader','pt.train_eval']},
  {k:'ops', name:'机房排错间', en:'GPU ROOM & TRIAGE', one:'显存、精度、存权重、三类报错',
   nodes:['pt.device','pt.amp','pt.save_load','pt.debug_shape']}
],

si:[
  {k:'infer', name:'推断法庭', en:'INFERENCE COURT', one:'差多大、能不能是运气',
   nodes:['si.estimate_vs_test','si.pvalue','si.confidence_interval','si.effect_size']},
  {k:'resample', name:'重抽样车间', en:'RESAMPLING WORKS', one:'不靠公式，靠重抽和打乱',
   nodes:['si.bootstrap','si.permutation','si.bayes_factor']},
  {k:'guard', name:'设计防错站', en:'DESIGN GUARD', one:'样本量、多重比较、前提、预注册',
   nodes:['si.power','si.multiple_testing','si.assumptions','si.preregistration']}
],

ex:[
  {k:'design', name:'实验设计台', en:'DESIGN BENCH', one:'随机化、对照、批次、重复',
   nodes:['ex.randomization','ex.control_blinding','ex.batch_design','ex.replicate_level']},
  {k:'causal', name:'因果绘图室', en:'CAUSAL DRAFTING', one:'混杂、DAG、后门怎么堵',
   nodes:['ex.confounder','ex.dag','ex.backdoor']},
  {k:'trap', name:'陷阱陈列馆', en:'TRAP GALLERY', one:'辛普森、选择偏倚、偷看停',
   nodes:['ex.simpson','ex.selection_bias','ex.ab_sequential']}
],

gm:[
  {k:'model', name:'造物模型厂', en:'MODEL FACTORY', one:'五种生成机制',
   nodes:['gm.autoregressive','gm.vae','gm.gan','gm.diffusion','gm.flow']},
  {k:'control', name:'采样控制室', en:'SAMPLING CONTROL', one:'温度、条件、潜空间怎么控',
   nodes:['gm.temperature','gm.conditional','gm.latent_space']},
  {k:'judge', name:'质检评估站', en:'QC STATION', one:'生成得好不好、值不值得验',
   nodes:['gm.fid','gm.protein_design']}
],

lm:[
  {k:'inside', name:'模型内部机房', en:'INNER WORKS', one:'token、向量、mask、cache',
   nodes:['lm.tokenization','lm.embedding','lm.causal_mask','lm.kv_cache']},
  {k:'context', name:'知识补给站', en:'KNOWLEDGE SUPPLY', one:'窗口、检索、微调怎么补知识',
   nodes:['lm.context_window','lm.rag','lm.finetune_vs_prompt']},
  {k:'trust', name:'可信审查室', en:'TRUST REVIEW', one:'幻觉、评测、科研怎么用',
   nodes:['lm.hallucination','lm.eval_align','lm.research_use']}
]

});
