// 数理宇宙 · 二级子区 SUBS（星环套星环）— math 页 13 块大陆
// 每块大陆 2-4 个子区；每个节点只出现一次。子区划分呼应 routes.js 判型树第一层。
window.SUBS = window.SUBS || {};
Object.assign(window.SUBS, {

ns:[
  {k:'scale', name:'数量级瞭望塔', en:'MAGNITUDE TOWER', one:'先问几个零，再决定要不要细算',
   nodes:['ns.magnitude','ns.max_digits','ns.log_scale','ns.estimate']},
  {k:'mental', name:'心算速算车间', en:'MENTAL ARITHMETIC SHOP', one:'把难算的拆成好算的块',
   nodes:['ns.square_trick','ns.mental_mult','ns.abacus','ns.percent']},
  {k:'sieve', name:'整除筛选站', en:'DIVISIBILITY SIEVE', one:'能不能整除、怎么拆成因子',
   nodes:['ns.divisibility','ns.factor']},
  {k:'sumup', name:'拼数与代表值', en:'SUM UP & MAKE UP', one:'一堆数怎么总结、怎么凑目标',
   nodes:['ns.average_trap','ns.make24']},
  {k:'bench', name:'计算台', en:'CALC BENCH', fold:true, one:'把数感落到台面上：换算、稀释、细胞数、颗粒数、比例、结合',
   nodes:['ns.units','ns.dilution','ns.serial','ns.molar','ns.percent_wv','ns.cellcount',
          'ns.seeding','ns.bioratio','ns.rcf','ns.beer','ns.nucleic','ns.nanoparticle',
          'ns.binding','ns.dosing']}
],

al:[
  {k:'faces', name:'函数脸谱馆', en:'FUNCTION GALLERY', one:'先认出式子是哪张脸',
   nodes:['al.function_zoo','al.quadratic','al.exp_log','al.trig','al.polynomial']},
  {k:'solve', name:'解方程作坊', en:'EQUATION WORKSHOP', one:'把未知数逼出来，或卡住它的范围',
   nodes:['al.vieta','al.abs_ineq','al.substitution','al.system_eq','al.inequality_amgm']},
  {k:'growth', name:'增长与对数', en:'GROWTH & LOGS', one:'一串数翻倍累加会到哪，log 别乱拆',
   nodes:['al.sequence','al.doubling','al.log_trap']}
],

ge:[
  {k:'vec', name:'向量测量站', en:'VECTOR STATION', one:'用坐标算长度、角度、面积、直线',
   nodes:['ge.vector','ge.dot_projection','ge.area_cross','ge.distance','ge.normal_line']},
  {k:'shape', name:'三角与圆', en:'TRIANGLES & CIRCLES', one:'纯图形里找直角、圆、比例',
   nodes:['ge.pythagoras','ge.inscribed_angle','ge.similar','ge.conic']},
  {k:'turn', name:'旋转转盘', en:'ROTATION WHEEL', one:'把图形挪、转、缩，角度当位置看',
   nodes:['ge.unit_circle','ge.polar','ge.transform']}
],

la:[
  {k:'act', name:'变形观察台', en:'WHAT IT DOES', one:'看矩阵把空间怎么了、哪些方向不变',
   nodes:['la.matrix_transform','la.determinant','la.orthogonal','la.eigen','la.svd']},
  {k:'solve', name:'解方程车间', en:'SOLVE & FIT', one:'解得出就撤销，解不出就找最近的',
   nodes:['la.inverse','la.least_squares','la.null_space','la.projection']},
  {k:'space', name:'基与维数', en:'BASIS & RANK', one:'数清几个独立方向，形状对不对',
   nodes:['la.basis','la.rank','la.matmul_shape']}
],

ca:[
  {k:'diff', name:'求导流水线', en:'DIFFERENTIATION LINE', one:'算变化多快，一层层剥',
   nodes:['ca.derivative_slope','ca.chain_rule','ca.product_quotient','ca.gradient','ca.partial_hessian','ca.log_trick']},
  {k:'int', name:'积分堆料场', en:'INTEGRATION YARD', one:'把无穷多细条加起来',
   nodes:['ca.integral_area','ca.integration_tricks']},
  {k:'opt', name:'极值搜索队', en:'OPTIMUM SEARCH', one:'找最好的那个点，有没有约束',
   nodes:['ca.optimization','ca.lagrange']},
  {k:'approx', name:'近似与演化', en:'LIMITS & DYNAMICS', one:'趋向哪、附近像什么、未来怎么走',
   nodes:['ca.limit','ca.taylor','ca.ode']}
],

pr:[
  {k:'dist', name:'分布认脸馆', en:'DISTRIBUTION GALLERY', one:'先认出随机机制是哪个分布',
   nodes:['pr.distribution','pr.binomial_poisson','pr.gaussian']},
  {k:'cond', name:'条件更新室', en:'CONDITIONING ROOM', one:'已知发生了什么，概率怎么改',
   nodes:['pr.conditional','pr.bayes']},
  {k:'moments', name:'数据总结台', en:'SUMMARY DESK', one:'中心、波动、关系、均值的抖动',
   nodes:['pr.expectation','pr.variance','pr.covariance','pr.clt']},
  {k:'infer', name:'推断法庭', en:'INFERENCE COURT', one:'从数据估参数、下结论、量信息',
   nodes:['pr.mle','pr.map_prior','pr.hypothesis','pr.entropy']}
],

co:[
  {k:'count', name:'排列组合柜台', en:'COUNTING COUNTER', one:'该乘该加、排法选法直接数',
   nodes:['co.multiplication_rule','co.perm_comb','co.circular_repeat','co.stars_bars']},
  {k:'indirect', name:'反面与必然', en:'COMPLEMENT & CERTAINTY', one:'正面难数就从反面、重叠、必然入手',
   nodes:['co.complement','co.inclusion_exclusion','co.pigeonhole']},
  {k:'model', name:'模型改造车间', en:'MODEL SHOP', one:'太怪的对象换成好数的结构',
   nodes:['co.bijection','co.recursion','co.catalan','co.graph_count']},
  {k:'coef', name:'系数保险库', en:'COEFFICIENT VAULT', one:'把计数变成多项式，看系数',
   nodes:['co.binomial','co.generating']}
],

di:[
  {k:'int', name:'余数与因子', en:'REMAINDERS & FACTORS', one:'整数取余怎么算、因子怎么拆',
   nodes:['di.modular','di.fermat_fastpow','di.crt','di.divisibility','di.prime','di.gcd']},
  {k:'proof', name:'证明工坊', en:'PROOF WORKSHOP', one:'命题怎么推、集合怎么对应',
   nodes:['di.induction','di.logic','di.set_function']},
  {k:'struct', name:'结构与效率', en:'STRUCTURE & COST', one:'谁连着谁、要跑多久',
   nodes:['di.graph','di.big_o']},
  {k:'bits', name:'二进制机房', en:'BINARY ROOM', one:'数在计算机里的样子',
   nodes:['di.base_convert','di.bits']}
],

op:[
  {k:'terrain', name:'地形勘探站', en:'TERRAIN SURVEY', one:'先看是不是碗、弯得多厉害',
   nodes:['op.convex','op.second_order']},
  {k:'descent', name:'下山步法', en:'DESCENT MOVES', one:'往哪走、走多大步、要不要抖',
   nodes:['op.gradient_descent','op.learning_rate','op.stochastic','op.coordinate_descent']},
  {k:'fence', name:'约束边界哨', en:'CONSTRAINT POST', one:'有墙时最优点贴在哪',
   nodes:['op.constraint_lagrange','op.kkt']},
  {k:'reg', name:'正则化闸门', en:'REGULARIZATION GATE', one:'防止贴合噪声的两道闸',
   nodes:['op.regularization','op.early_stop']}
],

it:[
  {k:'meter', name:'惊讶度计量所', en:'SURPRISE METER', one:'一件事值几个 bit，码要多长',
   nodes:['it.surprisal','it.entropy','it.code_length']},
  {k:'ledger', name:'两个分布的账本', en:'TWO-DISTRIBUTION LEDGER', one:'用错分布、知道另一变量差几个 bit',
   nodes:['it.cross_entropy','it.kl','it.mutual_info']},
  {k:'limits', name:'极限与原则', en:'LIMITS & PRINCIPLES', one:'能传多少、该假设多少、压缩即学习',
   nodes:['it.channel','it.max_entropy','it.compression']}
],

fo:[
  {k:'basis', name:'频域换基站', en:'FREQUENCY BASIS', one:'为什么正弦特殊、怎么快速换过去',
   nodes:['fo.eigenfunction','fo.basis','fo.fft']},
  {k:'ops', name:'频域操作台', en:'FREQUENCY OPS', one:'到频域去做乘法、挑频率、定采样率',
   nodes:['fo.convolution','fo.filter','fo.sampling']},
  {k:'timefreq', name:'时频取景框', en:'TIME-FREQUENCY', one:'频率随时间变时怎么看清',
   nodes:['fo.window','fo.spectrogram','fo.wavelet']}
],

cx:[
  {k:'rot', name:'旋转发动机', en:'ROTATION ENGINE', one:'复数就是缩放加旋转',
   nodes:['cx.i_rotation','cx.multiply','cx.polar','cx.conjugate']},
  {k:'euler', name:'欧拉圆环', en:'EULER RING', one:'转与增长写成一个式子',
   nodes:['cx.euler','cx.roots_unity','cx.oscillation']},
  {k:'poles', name:'根与极点', en:'ROOTS & POLES', one:'根摆在平面哪里，系统就长什么样',
   nodes:['cx.poly_roots','cx.pole_zero']}
],

vd:[
  {k:'mult', name:'乘法速算坊', en:'MULTIPLICATION SHOP', one:'靠近基数或交叉乘，一步出结果',
   nodes:['vd.nikhilam','vd.urdhva','vd.ekanyunena','vd.anurupyena','vd.adyamadyena','vd.antyayor_dasake']},
  {k:'sqdiv', name:'平方与除法', en:'SQUARES & DIVISION', one:'特殊形平方直接写，除法变号乘加',
   nodes:['vd.ekadhikena','vd.yavadunam','vd.paravartya']},
  {k:'eq', name:'方程秒解室', en:'EQUATION SHORTCUTS', one:'看结构直接令零、看比例、一加一减',
   nodes:['vd.sunyam','vd.anurupye','vd.sankalana','vd.purana','vd.antyayoreva']},
  {k:'factor', name:'因式分解台', en:'FACTOR BENCH', one:'借导数看重根，轮流置零拆因式',
   nodes:['vd.calana','vd.lopana']}
]

});
