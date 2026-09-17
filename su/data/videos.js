// 视频挂载：每条 URL 均经 yt-dlp/YouTube 实际查证存在
window.VIDEOS = window.VIDEOS || {};
Object.assign(window.VIDEOS, {

  // ===== la 线性代数 =====
  'la.matrix_transform':[
    {n:'Linear transformations and matrices | Chapter 3', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=kYB8IZa5AuE', t:0,
     why:'看网格被矩阵拉扯，这就是牌子上那张图的原版'},
    {n:'1. The Geometry of Linear Equations', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=J7DzL2_Na80', t:0,
     why:'行视角与列视角，同一个方程组两张脸'},
  ],
  'la.basis':[
    {n:'Linear combinations, span, and basis vectors | Chapter 2', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=k7RM-ot2NWY', t:0,
     why:'张成空间是什么，为什么基不唯一'},
    {n:'Change of basis | Chapter 13', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=P2LTAUO1TdA', t:0,
     why:'同一个向量换套坐标语言怎么翻译'},
  ],
  'la.matmul_shape':[
    {n:'Matrix multiplication as composition | Chapter 4', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=XkY2DOUCWMU', t:0,
     why:'乘法=变换接力，右边先作用'},
    {n:'Essential Matrix Algebra for Neural Networks', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=ZTt9gsGcdDo', t:0,
     why:'形状怎么对齐，维度对不上时看哪里'},
  ],
  'la.determinant':[
    {n:'The determinant | Chapter 6', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=Ip3X9LOh2dk', t:0,
     why:'行列式=面积缩放倍数，负号=翻面'},
    {n:'18. Properties of Determinants', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=srxexLishgY', t:0,
     why:'三条性质推出全部公式'},
  ],
  'la.inverse':[
    {n:'Inverse matrices, column space and null space | Chapter 7', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=uQhTuRlWMxw', t:0,
     why:'逆=把变换倒放，行列式为零就倒不回来'},
    {n:'3. Multiplication and Inverse Matrices', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=FX4C-JpTFgY', t:0,
     why:'高斯消元怎么把逆算出来'},
  ],
  'la.null_space':[
    {n:'7. Solving Ax = 0: Pivot Variables, Special Solutions', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=VqP2tREMvt0', t:0,
     why:'被压扁的方向长什么样，自由变量哪来的'},
    {n:'6. Column Space and Nullspace', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=8o5Cmfpeo6g', t:0,
     why:'列空间管有没有解，零空间管解唯不唯一'},
  ],
  'la.rank':[
    {n:'Nonsquare matrices as transformations between dimensions | Chapter 8', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=v8VSDg_WQlA', t:0,
     why:'秩=输出还剩几维'},
    {n:'11. Matrix Spaces; Rank 1; Small World Graphs', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=2IdtqGM6KWU', t:0,
     why:'秩一矩阵是积木，任何矩阵是它们的和'},
  ],
  'la.eigen':[
    {n:'Eigenvectors and eigenvalues | Chapter 14', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=PFDu9oVAE-g', t:0,
     why:'变换里没被转歪的那几根轴'},
    {n:'A quick trick for computing eigenvalues | Chapter 15', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=e50Bj7jn9IQ', t:0,
     why:'2×2 用迹和行列式口算特征值'},
  ],
  'la.svd':[
    {n:'Singular Value Decomposition (SVD): Overview', by:'Steve Brunton · Data-Driven Science', u:'https://www.youtube.com/watch?v=gXbThCXjZFM', t:0,
     why:'任何矩阵都拆成：转一下、拉一下、再转一下'},
    {n:'Singular Value Decomposition (SVD): Mathematical Overview', by:'Steve Brunton · Data-Driven Science', u:'https://www.youtube.com/watch?v=nbBvuuNVfco', t:0,
     why:'奇异值排序=信息量排序，截断即压缩'},
  ],
  'la.projection':[
    {n:'15. Projections onto Subspaces', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=Y_Ac6KiQ1t0', t:0,
     why:'投影就是找子空间里离你最近的点'},
    {n:'Dot products and duality | Chapter 9', by:'3Blue1Brown · Essence of linear algebra', u:'https://www.youtube.com/watch?v=LyGKycYT2v0', t:0,
     why:'点积为什么等于影子长乘长度'},
  ],
  'la.orthogonal':[
    {n:'17. Orthogonal Matrices and Gram-Schmidt', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=0MtwqhIwdrI', t:0,
     why:'正交矩阵只转不拉，逆就是转置'},
    {n:'14. Orthogonal Vectors and Subspaces', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=YzZUIYRCE38', t:0,
     why:'垂直在高维是什么意思'},
  ],
  'la.least_squares':[
    {n:'16. Projection Matrices and Least Squares', by:'MIT OCW 18.06 · Gilbert Strang', u:'https://www.youtube.com/watch?v=osh80YCg_GM', t:0,
     why:'解不出来就投影：最小二乘的几何原因'},
    {n:'The Main Ideas of Fitting a Line to Data', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=PaFPbb66DxQ', t:0,
     why:'残差平方和为什么是那条线'},
  ],

  // ===== ca 微积分 =====
  'ca.derivative_slope':[
    {n:'The paradox of the derivative | Chapter 2', by:'3Blue1Brown · Essence of calculus', u:'https://www.youtube.com/watch?v=9vKqVkMQHKk', t:0,
     why:'瞬时变化率这个说法哪里自相矛盾'},
    {n:'Derivative formulas through geometry | Chapter 3', by:'3Blue1Brown · Essence of calculus', u:'https://www.youtube.com/watch?v=S0_qX4VJhMQ', t:0,
     why:'求导公式不用背，画个图就出来'},
  ],
  'ca.limit':[
    {n:"Limits, L'Hôpital's rule, and epsilon delta definitions | Chapter 7", by:'3Blue1Brown · Essence of calculus', u:'https://www.youtube.com/watch?v=kfF40MiS7zA', t:0,
     why:'ε-δ 到底在防什么'},
  ],
  'ca.chain_rule':[
    {n:'Visualizing the chain rule and product rule | Chapter 4', by:'3Blue1Brown · Essence of calculus', u:'https://www.youtube.com/watch?v=YG15m2VwSjA', t:0,
     why:'链式法则的乘号是从哪冒出来的'},
  ],
  'ca.integral_area':[
    {n:'Integration and the fundamental theorem of calculus | Chapter 8', by:'3Blue1Brown · Essence of calculus', u:'https://www.youtube.com/watch?v=rfG8ce4nNh0', t:0,
     why:'积分与导数互逆，这一集给出理由'},
    {n:'What does area have to do with slope? | Chapter 9', by:'3Blue1Brown · Essence of calculus', u:'https://www.youtube.com/watch?v=FnJqaIESC2s', t:0,
     why:'面积和斜率凭什么是一回事'},
  ],
  'ca.taylor':[
    {n:'Taylor series | Chapter 11', by:'3Blue1Brown · Essence of calculus', u:'https://www.youtube.com/watch?v=3d6DsjIBzJ4', t:0,
     why:'用多项式在一点上抄函数的所有导数'},
  ],
  'ca.optimization':[
    {n:'Higher order derivatives | Chapter 10', by:'3Blue1Brown · Essence of calculus', u:'https://www.youtube.com/watch?v=BLkz5LGWihw', t:0,
     why:'二阶导决定是山顶还是山谷'},
    {n:'Second partial derivative test intuition', by:'Khan Academy · Multivariable calculus', u:'https://www.youtube.com/watch?v=sJo7D74PAak', t:0,
     why:'多元情况怎么判极大极小和鞍点'},
  ],
  'ca.gradient':[
    {n:'Gradient', by:'Khan Academy · Multivariable calculus', u:'https://www.youtube.com/watch?v=tIpKfDc295M', t:0,
     why:'梯度为什么正好指最陡上坡'},
  ],
  'ca.partial_hessian':[
    {n:'The Hessian matrix', by:'Khan Academy · Multivariable calculus', u:'https://www.youtube.com/watch?v=LbBcuZukCAw', t:0,
     why:'二阶导在多元里装成一个矩阵'},
    {n:'The Jacobian matrix', by:'Khan Academy · Multivariable calculus', u:'https://www.youtube.com/watch?v=bohL918kXQk', t:0,
     why:'局部看，任何映射都是一个矩阵'},
  ],
  'ca.lagrange':[
    {n:'Lagrange multipliers, using tangency to solve constrained optimization', by:'Khan Academy · Multivariable calculus', u:'https://www.youtube.com/watch?v=yuqB-d5MjZA', t:0,
     why:'约束下的极值=两条等高线相切'},
    {n:'Meaning of Lagrange multiplier', by:'Khan Academy · Multivariable calculus', u:'https://www.youtube.com/watch?v=m-G3K2GPmEQ', t:0,
     why:'λ 本身有意义：放松约束的收益'},
  ],
  'ca.ode':[
    {n:"Differential equations, a tourist's guide | DE1", by:'3Blue1Brown · Differential equations', u:'https://www.youtube.com/watch?v=p_di4Zn4wz4', t:0,
     why:'方程给的是变化率，解是整条轨迹'},
    {n:'But what is a partial differential equation? | DE2', by:'3Blue1Brown · Differential equations', u:'https://www.youtube.com/watch?v=ly4S0oi3Yz8', t:0,
     why:'一维热传导，看温度自己抹平'},
  ],
  'ca.log_trick':[
    {n:"What's so special about Euler's number e? | Chapter 5", by:'3Blue1Brown · Essence of calculus', u:'https://www.youtube.com/watch?v=m2MIpDrF7Es', t:0,
     why:'e 和 ln 为什么在导数里最省事'},
  ],
  'ca.integration_tricks':[
    {n:'How To Integrate Using U-Substitution', by:'The Organic Chemistry Tutor', u:'https://www.youtube.com/watch?v=sdYdnpYn-1o', t:0,
     why:'换元就是把链式法则倒着用'},
  ],

  // ===== pr 概率 =====
  'pr.bayes':[
    {n:"The medical test paradox, and redesigning Bayes' rule", by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=lG4VkPoG3ko', t:0,
     why:'为什么阳性也常常是假的'},
    {n:"Bayes' Theorem, Clearly Explained!!!!", by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=9wCnvr7Xw4E', t:0,
     why:'公式逐项对上直觉'},
  ],
  'pr.clt':[
    {n:'But what is the Central Limit Theorem?', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=zeJD6dqJ5lo', t:0,
     why:'为什么什么东西一平均就变正态'},
    {n:'The Central Limit Theorem, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=YAlJCEDH2uY', t:0,
     why:'五分钟拿到能用的版本'},
  ],
  'pr.distribution':[
    {n:'The Main Ideas behind Probability Distributions', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=oI3hZJqXJuc', t:0,
     why:'直方图长大就是分布'},
  ],
  'pr.gaussian':[
    {n:'The Normal Distribution, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=rzFX5NWojp0', t:0,
     why:'均值定位置，标准差定胖瘦'},
    {n:'Why π is in the normal distribution (beyond integral tricks)', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=cy8r7WSuT1I', t:0,
     why:'那个 π 到底从哪来的'},
  ],
  'pr.binomial_poisson':[
    {n:'Binomial distributions | Probabilities of probabilities, part 1', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=8idr1WZ1A7Q', t:0,
     why:'n 次里成功 k 次的形状'},
    {n:'Maximum Likelihood for the Binomial Distribution', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=4KKV9yZCoM4', t:0,
     why:'从数据反推那个 p'},
  ],
  'pr.expectation':[
    {n:'Expected Values, Main Ideas!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=KLs_7b7SKi4', t:0,
     why:'期望=按概率加权的长期平均'},
  ],
  'pr.covariance':[
    {n:'Covariance, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=qtaqvPAeEJY', t:0,
     why:'协方差有量纲，相关是它的归一版'},
  ],
  'pr.mle':[
    {n:'Maximum Likelihood, clearly explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=XepXtl9YKwc', t:0,
     why:'找让这批数据最不意外的参数'},
    {n:'Maximum Likelihood For the Normal Distribution, step-by-step!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=Dn6b9fCIUpM', t:0,
     why:'亲手推一遍均值和方差的估计'},
  ],
  'pr.entropy':[
    {n:'Reinventing Entropy | Compression is Intelligence Part 1', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=l6DKRf-fAAM', t:0,
     why:'熵是压缩极限，不是玄学'},
    {n:'Entropy (for data science) Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=YtebGVx-Fxw', t:0,
     why:'决策树里那个熵就是这个'},
  ],
  'pr.conditional':[
    {n:'Bayes theorem, the geometry of changing beliefs', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=HZGCoVF3YvM', t:0,
     why:'条件概率=把样本空间切一块再看比例'},
  ],
  'pr.hypothesis':[
    {n:'p-values: What they are and how to interpret them', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=vemZtEM63GY', t:0,
     why:'p 值衡量的是数据不是假设'},
    {n:'Confidence Intervals, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=TqOeMYtOc1w', t:0,
     why:'区间在动，真值不动'},
  ],
  'pr.map_prior':[
    {n:'Regularization Part 1: Ridge (L2) Regression', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=Q81RR3yKn30', t:0,
     why:'正则项就是给参数加了个先验'},
  ],

  // ===== fo 傅里叶 =====
  'fo.eigenfunction':[
    {n:'Fourier Analysis: Overview', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=jNC0jxb0OxE', t:0,
     why:'为什么整个体系都围着正弦转'},
    {n:'The Fourier Transform and Derivatives', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=d5d0ORQHNYs', t:0,
     why:'求导在频域只是乘 iω'},
  ],
  'fo.basis':[
    {n:'But what is the Fourier Transform? A visual introduction.', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=spUNpyF58BY', t:0,
     why:'把信号缠在圆上，质心就是系数'},
    {n:'Fourier Series: Part 1', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=MB6XGQWLV04', t:0,
     why:'内积取系数，和向量投影一模一样'},
  ],
  'fo.fft':[
    {n:'The Fast Fourier Transform (FFT): Most Ingenious Algorithm Ever?', by:'Reducible', u:'https://www.youtube.com/watch?v=h7apO7q16V0', t:0,
     why:'分治怎么把 N² 砍成 N log N'},
    {n:'The Fast Fourier Transform (FFT)', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=E8HeD-MUrjY', t:0,
     why:'工程视角：什么时候真该用它'},
  ],
  'fo.convolution':[
    {n:'But what is a convolution?', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=KuXjwB4LzSA', t:0,
     why:'翻转滑动求和，动画一遍就懂'},
    {n:'The Fourier Transform and Convolution Integrals', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=mOiY1fOROOg', t:0,
     why:'时域卷积等于频域相乘的推导'},
  ],
  'fo.sampling':[
    {n:'Shannon Nyquist Sampling Theorem', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=FcXZ28BX-xE', t:0,
     why:'采样率不够，高频会伪装成低频'},
    {n:'The intuition behind the Nyquist-Shannon Sampling Theorem', by:'Zach Star', u:'https://www.youtube.com/watch?v=Jv5FU8oUWEY', t:0,
     why:'两倍这个数字是怎么来的'},
  ],
  'fo.filter':[
    {n:'Denoising Data with FFT [Python]', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=s2K1JfNR7Sc', t:0,
     why:'去噪=在频域上把小的那些抹掉'},
    {n:'Image Compression and the FFT', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=gGEBUdM0PVc', t:0,
     why:'JPEG 的本质就是这一步'},
  ],
  'fo.window':[
    {n:'Uncertainty Principles and the Fourier Transform', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=D1WfID6kk90', t:0,
     why:'时间切得越准，频率越糊'},
    {n:'Windows and Spectral Leakage', by:'Simcenter Physical Testing', u:'https://www.youtube.com/watch?v=pD7f6X9-_Kg', t:0,
     why:'不加窗会泄漏成什么样'},
  ],
  'fo.spectrogram':[
    {n:'The Spectrogram and the Gabor Transform', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=EfWnEldTyPA', t:0,
     why:'加窗滑过去，频率随时间画成图'},
    {n:'Spectrogram Examples [Python]', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=TJGlxdW7Fb4', t:0,
     why:'真信号跑一遍，参数怎么调'},
  ],
  'fo.wavelet':[
    {n:'Wavelets and Multiresolution Analysis', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=y7KLbd7n75g', t:0,
     why:'高频用短窗低频用长窗，自动分层'},
    {n:'Image Compression with Wavelets (Examples in Python)', by:'Steve Brunton · Fourier Analysis', u:'https://www.youtube.com/watch?v=eJLF9HeZA8I', t:0,
     why:'JPEG2000 为什么比 JPEG 顺眼'},
  ],

  // ===== cx 复数 =====
  'cx.i_rotation':[
    {n:'Imaginary Numbers Are Real [Part 1: Introduction]', by:'Welch Labs', u:'https://www.youtube.com/watch?v=T647CGsuOVU', t:0,
     why:'虚数不虚：它补上了缺失的那一维'},
    {n:'Imaginary Numbers Are Real [Part 5: Numbers are Two Dimensional]', by:'Welch Labs', u:'https://www.youtube.com/watch?v=65wYmy8Pf-Y', t:0,
     why:'乘 i 就是把平面转 90 度'},
  ],
  'cx.multiply':[
    {n:'Imaginary Numbers Are Real [Part 6: The Complex Plane]', by:'Welch Labs', u:'https://www.youtube.com/watch?v=z5IG_6_zPDo', t:0,
     why:'复数乘法=模相乘、角相加'},
    {n:'Complex Analysis L01: Overview & Motivation, Complex Arithmetic', by:'Steve Brunton · Complex Analysis', u:'https://www.youtube.com/watch?v=_mv0q7-WF4E', t:0,
     why:'极坐标一写出来，一切都变简单'},
  ],
  'cx.euler':[
    {n:"Euler's formula with introductory group theory", by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=mvmuCPvRoWQ', t:0,
     why:'转与增长是同一件事的两个视角'},
    {n:"Complex Analysis L02: Euler's formula", by:'Steve Brunton · Complex Analysis', u:'https://www.youtube.com/watch?v=Rp-smPZLESc', t:0,
     why:'规规矩矩推一遍，配合动画看'},
  ],
  'cx.roots_unity':[
    {n:'Complex Analysis L05: Roots of Unity and Rational Powers of z', by:'Steve Brunton · Complex Analysis', u:'https://www.youtube.com/watch?v=bzCDvK3NNuk', t:0,
     why:'开 n 次方=把圆等分成 n 份'},
  ],
  'cx.oscillation':[
    {n:"The Physics of Euler's Formula | Laplace Transform Prelude", by:'3Blue1Brown · Differential equations', u:'https://www.youtube.com/watch?v=-j8PzkZ70Lg', t:0,
     why:'复指数天生就是转圈和振荡'},
  ],
  'cx.poly_roots':[
    {n:'Newton’s fractal (which Newton knew nothing about)', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=-RdOwhmqP5s', t:0,
     why:'在复平面上找根，边界会变分形'},
    {n:'Beyond the Mandelbrot set, an intro to holomorphic dynamics', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=LqbZpur38nw', t:0,
     why:'反复迭代复函数会长出什么'},
  ],
  'cx.pole_zero':[
    {n:'Control Bootcamp: Laplace Transforms and the Transfer Function', by:'Steve Brunton · Control Bootcamp', u:'https://www.youtube.com/watch?v=0mnTByVKqLM', t:0,
     why:'极点在左半平面才稳定'},
    {n:'Control Bootcamp: Example Frequency Response (Bode Plot)', by:'Steve Brunton · Control Bootcamp', u:'https://www.youtube.com/watch?v=e-8y4MTT7NQ', t:0,
     why:'极点零点怎么变成频响曲线'},
  ],

  // ===== np NumPy =====
  'np.broadcast':[
    {n:'Numpy Array Broadcasting In Python Explained', by:'mCoding', u:'https://www.youtube.com/watch?v=oG1t3qlzq14', t:0,
     why:'形状从右往左对齐，1 会被拉开'},
  ],

  // ===== ml 机器学习 =====
  'ml.gradient_descent':[
    {n:'Gradient Descent, Step-by-Step', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=sDv4f4s2SB8', t:0,
     why:'手算一遍，看步长怎么影响收敛'},
    {n:'Stochastic Gradient Descent, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=vMh0zPT0tLI', t:0,
     why:'为什么少看几条数据反而更快'},
  ],
  'ml.linear_reg':[
    {n:'Linear Regression, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=nk2CQITm_eo', t:0,
     why:'拟合、R²、p 值三件套一次讲完'},
    {n:'The Essence of Linear Regression!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=aFDOzpTeg0s', t:0,
     why:'一句话版本，先建立骨架'},
  ],
  'ml.logistic':[
    {n:'StatQuest: Logistic Regression', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=yIYKR4sgzI8', t:0,
     why:'把直线掰成 S 形去预测概率'},
    {n:'Odds and Log(Odds), Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=ARfXDSkQf1Y', t:0,
     why:'先搞懂 log odds，系数才有意义'},
  ],
  'ml.svm':[
    {n:'Support Vector Machines Part 1 (of 3): Main Ideas!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=efR1C6CvhmE', t:0,
     why:'最大间隔和支持向量到底指什么'},
    {n:'Support Vector Machines Part 3: The Radial (RBF) Kernel', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=Qc5IyLW_hns', t:0,
     why:'核技巧升维但不真的升维'},
  ],
  'ml.tree':[
    {n:'Decision and Classification Trees, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=_L39rN6gz7Y', t:0,
     why:'每次切一刀，靠不纯度挑切法'},
    {n:'Regression Trees, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=g9c66TUylZ4', t:0,
     why:'回归树的叶子放的是平均值'},
  ],
  'ml.forest':[
    {n:'StatQuest: Random Forests Part 1 - Building, Using and Evaluating', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=J4Wdy0Wc_xQ', t:0,
     why:'自助采样加随机选特征，才叫随机'},
    {n:'StatQuest: Random Forests Part 2: Missing data and clustering', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=mIlw5j3WyVk', t:0,
     why:'邻近矩阵还能拿来补缺失值'},
  ],
  'ml.xgboost':[
    {n:'Gradient Boost Part 1 (of 4): Regression Main Ideas', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=3CC4N4z3GJc', t:0,
     why:'每棵新树都在拟合上一步的残差'},
    {n:'XGBoost Part 1 (of 4): Regression', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=OtD8wVaFm6E', t:0,
     why:'XGBoost 在梯度提升上多做了什么'},
  ],
  'ml.knn':[
    {n:'StatQuest: K-nearest neighbors, Clearly Explained', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=HVXime0nQeI', t:0,
     why:'没有训练，全靠 K 和距离度量'},
  ],
  'ml.kmeans':[
    {n:'StatQuest: K-means clustering', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=4b5d3muPQmA', t:0,
     why:'指派与更新交替，K 靠肘部图选'},
  ],
  'ml.pca':[
    {n:'StatQuest: Principal Component Analysis (PCA), Step-by-Step', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=FgakZw6K1QQ', t:0,
     why:'主成分就是方差最大的那几个方向'},
    {n:'StatQuest: PCA main ideas in only 5 minutes!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=HMOI_lkzW08', t:0,
     why:'没时间就看这版，五分钟拿走结论'},
  ],
  'ml.naive_bayes':[
    {n:'Naive Bayes, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=O2L2Uv9pdDA', t:0,
     why:'朴素在哪：假设特征互相独立'},
    {n:'Gaussian Naive Bayes, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=H3EjCKtlVog', t:0,
     why:'连续特征怎么套正态假设'},
  ],
  'ml.metrics':[
    {n:'Machine Learning Fundamentals: The Confusion Matrix', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=Kdsp6soqA7o', t:0,
     why:'所有指标都是从这四个格子长出来的'},
    {n:'ROC and AUC, Clearly Explained!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=4jRBRDbJemM', t:0,
     why:'阈值滑动画出的那条曲线'},
  ],

  // ===== dl 深度学习 =====
  'dl.mlp':[
    {n:'But what is a neural network? | Deep learning chapter 1', by:'3Blue1Brown · Neural networks', u:'https://www.youtube.com/watch?v=aircAruvnKk', t:0,
     why:'层与权重在图上到底长什么样'},
    {n:'The Essential Main Ideas of Neural Networks', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=CqOfi41LfDw', t:0,
     why:'两个神经元手工拼出一条曲线'},
  ],
  'dl.activation':[
    {n:'Neural Networks Pt. 3: ReLU In Action!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=68BZ5f7P94E', t:0,
     why:'非线性折一下，网络才不塌成一层'},
    {n:'Neural Networks Part 5: ArgMax and SoftMax', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=KpKog-L9veg', t:0,
     why:'输出层为什么用 SoftMax'},
  ],
  'dl.backprop':[
    {n:'Backpropagation, intuitively | Deep Learning Chapter 3', by:'3Blue1Brown · Neural networks', u:'https://www.youtube.com/watch?v=Ilg3gGewQ5U', t:0,
     why:'先看每个权重"想被怎么改"'},
    {n:'The spelled-out intro to neural networks and backpropagation: building micrograd', by:'Andrej Karpathy · Zero to Hero', u:'https://www.youtube.com/watch?v=VMj-3S1tku0', t:0,
     why:'从零手写自动求导，彻底不再是黑箱'},
  ],
  'dl.loss':[
    {n:'Neural Networks Part 6: Cross Entropy', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=6ArSys5qHAU', t:0,
     why:'分类为什么不用平方误差'},
    {n:'But what is cross-entropy? | Compression is Intelligence Part 2', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=GlYgs6v2YfU', t:0,
     why:'交叉熵=用错分布编码的额外代价'},
  ],
  'dl.cnn':[
    {n:'Neural Networks Part 8: Image Classification with Convolutional Neural Networks', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=HGwBXDKFk9I', t:0,
     why:'卷积核滑过去，权重共享省在哪'},
    {n:'But what is a convolution?', by:'3Blue1Brown', u:'https://www.youtube.com/watch?v=KuXjwB4LzSA', t:480,
     why:'先把卷积这个动作看明白'},
  ],
  'dl.rnn':[
    {n:'Recurrent Neural Networks (RNNs), Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=AsNTP8Kwu80', t:0,
     why:'同一组权重反复用，梯度会爆会消'},
    {n:'Long Short-Term Memory (LSTM), Clearly Explained', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=YCzL96nL7j0', t:0,
     why:'门控是怎么把长期记忆留住的'},
  ],
  'dl.attention':[
    {n:'Attention in transformers, step-by-step | Deep Learning Chapter 6', by:'3Blue1Brown · Neural networks', u:'https://www.youtube.com/watch?v=eMlx5fFNoYc', t:0,
     why:'QKV 三个矩阵各自在干嘛'},
    {n:'Attention for Neural Networks, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=PSs6nxngL6k', t:0,
     why:'从 seq2seq 的瓶颈讲起，动机最清楚'},
  ],
  'dl.transformer':[
    {n:'Transformers, the tech behind LLMs | Deep Learning Chapter 5', by:'3Blue1Brown · Neural networks', u:'https://www.youtube.com/watch?v=wjZofJX0v4M', t:0,
     why:'整条数据流从 token 走到输出'},
    {n:"Transformer Neural Networks, ChatGPT's foundation, Clearly Explained!!!", by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=zxQyTK8quyY', t:0,
     why:'位置编码和残差这些零件挨个拆'},
  ],
  'dl.resnet':[
    {n:'Residual Networks (ResNet) [Physics Informed Machine Learning]', by:'Steve Brunton', u:'https://www.youtube.com/watch?v=w1UsKanMatM', t:0,
     why:'跳连让网络去学"改动量"而不是全量'},
    {n:'[Classic] Deep Residual Learning for Image Recognition (Paper Explained)', by:'Yannic Kilcher', u:'https://www.youtube.com/watch?v=GWt6Fu05voI', t:0,
     why:'回到原论文，看它解决的是什么现象'},
  ],
  'dl.unet':[
    {n:'U-Net clearly explained | Image Segmentation with AI', by:'TileStats', u:'https://www.youtube.com/watch?v=oxcgx75k6yU', t:0,
     why:'下采样丢细节，跳连再把它接回来'},
    {n:'U-net Image Segmentation the basics (From Scratch!)', by:'Luke Ditria', u:'https://www.youtube.com/watch?v=ZoOuNv8TXLs', t:0,
     why:'PyTorch 里逐层敲一遍'},
  ],
  'dl.vae':[
    {n:'Variational Autoencoders | Generative AI Animated', by:'Deepia', u:'https://www.youtube.com/watch?v=qJeaCHQ1k2w', t:0,
     why:'潜空间为什么必须是分布不是点'},
    {n:'Understanding Variational Autoencoders (VAEs)', by:'DeepBean', u:'https://www.youtube.com/watch?v=HBYQvKlaE0A', t:0,
     why:'ELBO 和重参数化那一步的推导'},
  ],
  'dl.gan':[
    {n:'Generative Adversarial Networks (GANs) - Computerphile', by:'Computerphile', u:'https://www.youtube.com/watch?v=Sw9r8CL98N0', t:0,
     why:'造假者和鉴定者互相逼出来的图'},
    {n:'Diffusion Models: DDPM | Generative AI Animated', by:'Deepia', u:'https://www.youtube.com/watch?v=EhndHhIvWWw', t:0,
     why:'对照看：扩散怎么取代了对抗训练'},
  ],

  // ===== si 统计推断 =====
  'si.pvalue':[
    {n:'p-values: What they are and how to interpret them', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=vemZtEM63GY', t:0,
     why:'p 小不等于效应大，这里说清界线'},
    {n:'How to calculate p-values', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=JQc3yx0-Q9E', t:0,
     why:'亲手数一遍尾巴上的概率'},
  ],
  'si.estimate_vs_test':[
    {n:'Hypothesis Testing and The Null Hypothesis, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=0oc49DyA3hU', t:0,
     why:'零假设不是信念，是个对照标尺'},
  ],
  'si.confidence_interval':[
    {n:'Confidence Intervals, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=TqOeMYtOc1w', t:0,
     why:'95% 说的是造区间这套流程'},
  ],
  'si.power':[
    {n:'Power Analysis, Clearly Explained!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=VX_M3tIyiYk', t:0,
     why:'样本量不是拍脑袋，是算出来的'},
  ],
  'si.effect_size':[
    {n:"What Is And How To Calculate Cohen's d?", by:'Steven Bradburn', u:'https://www.youtube.com/watch?v=IetVSlrndpI', t:0,
     why:'差多少个标准差，才是真正的大小'},
  ],
  'si.multiple_testing':[
    {n:'False Discovery Rates, FDR, clearly explained', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=K8LQSvtjcEo', t:0,
     why:'控 FDR 比 Bonferroni 更实用'},
    {n:'The Bonferroni Correction - Clearly Explained', by:'Steven Bradburn', u:'https://www.youtube.com/watch?v=HLzS5wPqWR0', t:0,
     why:'最保守那一刀是怎么切的'},
  ],
  'si.bootstrap':[
    {n:'Bootstrapping Main Ideas!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=Xz0x-8-cgaQ', t:0,
     why:'把样本当总体，反复重抽'},
    {n:'Using Bootstrapping to Calculate p-values!!!', by:'StatQuest with Josh Starmer', u:'https://www.youtube.com/watch?v=N4ZQQqyIf6k', t:0,
     why:'不靠公式也能做检验'},
  ],
  'si.permutation':[
    {n:'How Does the Permutation Test Work?', by:'Joshua French', u:'https://www.youtube.com/watch?v=WoeL88mJPsw', t:0,
     why:'打乱标签，看真实差距排第几'},
  ],
  'si.preregistration':[
    {n:'P-Hacking: Crash Course Statistics #30', by:'CrashCourse', u:'https://www.youtube.com/watch?v=Gx0fAjNHb1M', t:0,
     why:'先看清 p-hacking 长什么样'},
  ],

});
