// data/derive_la.js —— 线性代数大陆 · 推导层（12 节点）
// 契约：CONTRACT3.md。旁挂，不改 v1/v2 文件。scratch 全部用 python3 + numpy 2.3 实际跑过。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

/* ================================================================== */
'la.matrix_transform': {
  layers:{
    alg:`矩阵是线性映射 T 的编码：第 j 列 = T(eⱼ)。Ax = Σ xⱼ·(第 j 列)，是"列的加权和"，权重是 x 的分量。`,
    geo:`整张方格纸被拉成平行四边形网格：e₁ 落到第一列，e₂ 落到第二列，原点不动、直线仍直、平行仍平行。`,
    comp:`机器算的是 m 次点积：第 i 行与 x 点一次得到输出第 i 分量。BLAS 把这 m×n 次乘加向量化，一层神经网络就是一次 X@W。`
  },
  proof:{
    from:`线性映射的定义：T(x+y)=T(x)+T(y)，T(cx)=cT(x)；标准基 e₁…eₙ`,
    to:`矩阵乘法公式 C_ij=Σ_k A_ik B_kj 是"映射复合"的必然结果，不是人为规定`,
    steps:[
      [`任意 x=Σ xⱼeⱼ，套线性：T(x)=Σ xⱼT(eⱼ)`,`两条公理允许把 T 拆进求和、提出系数。于是 T 被 n 个像 T(eⱼ) 完全决定`],
      [`把 T(eⱼ) 竖着排成第 j 列，得矩阵 A；上一步就是 Ax=Σ xⱼ·aⱼ`,`这是矩阵的定义：它只是 n 个像的登记表。矩阵乘向量 = 列的加权和`],
      [`取 S:Rⁿ→Rᵐ（矩阵 A，m×n）和 T:Rᵖ→Rⁿ（矩阵 B，n×p），复合 S∘T 仍线性`,`直接验：S(T(x+y))=S(T(x)+T(y))=S(T(x))+S(T(y))，数乘同理。线性映射的复合必线性，所以它也有一张矩阵，记 C（m×p）`],
      [`C 的第 j 列 = (S∘T)(eⱼ) = S(T(eⱼ)) = S(bⱼ) = A·bⱼ = Σ_k B_kj·a_k`,`第 2 步：矩阵的列就是基向量的像；bⱼ 是 B 第 j 列；A 作用于 bⱼ 又是列的加权和`],
      [`取第 i 个分量：C_ij = Σ_k A_ik B_kj`,`上一步逐分量写开就是它。矩阵乘法公式被推出来了：它是"先 B 后 A"这一复合的唯一编码`],
      [`推论：(AB)x=A(Bx)；(AB)C=A(BC)；AB≠BA；内维必须相等`,`复合本身满足这些：函数复合有结合律、一般不交换；内维 n 就是两个映射衔接处的那个空间 Rⁿ 的维数`],
      [`"行点积列"只是第 5 步的计算顺序`,`C_ij 的求和恰好是 A 第 i 行与 B 第 j 列的点积。它是算法，不是意义；意义在第 2、4 步`]
    ],
    end:`矩阵乘法 = 线性映射的复合。记住这一句，形状规则、结合律、不交换、先右后左全部不用背；神经网络多层无激活等于一个矩阵也由此立刻可见。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
# 两个"黑盒"线性映射：只告诉你怎么作用，不告诉你矩阵
S = lambda v: np.array([2*v[0]+v[1]-v[2], v[2]-3*v[0]])      # R3->R2
T = lambda v: np.array([v[0]+v[1], 2*v[1], v[0]-v[1]])         # R2->R3
def to_matrix(f, n):                # 第2步：列 = 基向量的像
    return np.column_stack([f(np.eye(n)[j]) for j in range(n)])
A, B = to_matrix(S,3), to_matrix(T,2)
C_compose = to_matrix(lambda v: S(T(v)), 2)   # 第4步：复合映射的矩阵
def matmul(A,B):                    # 第5步：C_ij = sum_k A_ik B_kj
    m,n = A.shape; n2,p = B.shape; assert n==n2
    C = np.zeros((m,p))
    for i in range(m):
        for j in range(p):
            for k in range(n): C[i,j] += A[i,k]*B[k,j]
    return C
print('A (2x3) =\\n', A); print('B (3x2) =\\n', B)
print('复合映射的矩阵 =\\n', C_compose)
print('手写 AB      =\\n', matmul(A,B))
print('复合==手写AB ==numpy@ :', np.allclose(C_compose, matmul(A,B)), np.allclose(C_compose, A@B))
x = np.random.randn(2)
print('(AB)x == A(Bx):', np.allclose((A@B)@x, A@(B@x)))
P, Q = np.array([[0,-1],[1,0]]), np.array([[1,1],[0,1]])   # 旋转90度, 剪切
print('PQ==QP ?', np.allclose(P@Q, Q@P), '  PQ=', (P@Q).tolist(), ' QP=', (Q@P).tolist())`,
    out:`A (2x3) =
 [[ 2.  1. -1.]
 [-3.  0.  1.]]
B (3x2) =
 [[ 1.  1.]
 [ 0.  2.]
 [ 1. -1.]]
复合映射的矩阵 =
 [[ 1.  5.]
 [-2. -4.]]
手写 AB      =
 [[ 1.  5.]
 [-2. -4.]]
复合==手写AB ==numpy@ : True True
(AB)x == A(Bx): True
PQ==QP ? False   PQ= [[0, -1], [1, 1]]  QP= [[1, -1], [1, 0]]`,
    note:`to_matrix 是第 2 步（列=基向量的像）；C_compose 是第 4 步（复合映射也有矩阵）；matmul 三重循环是第 5 步的公式。三者相等就是"矩阵乘法=复合"的数值证据；最后一行是不交换。`
  },
  contrast:[
    {vs:`仿射变换 Wx+b`,same:`都把直线送成直线、平行送成平行`,diff:`线性必过原点 T(0)=0；b≠0 就不是线性，不能只用一个矩阵`,when:`神经网络一层写成矩阵乘加偏置；图形学用齐次坐标把 b 塞进 (n+1)×(n+1) 矩阵变回纯线性`},
    {vs:`逐元素乘 A*B（Hadamard）`,same:`都是两个同类对象相乘得到矩阵`,diff:`A*B 是对应格子相乘，无复合意义；A@B 是映射复合`,when:`掩码、门控（LSTM 的门）用 *；变换、层的前向用 @`},
    {vs:`列向量约定 Ax 与行向量约定 x@W`,same:`同一个线性映射`,diff:`两套约定的矩阵互为转置：Ax=(xᵀAᵀ)ᵀ；numpy 里样本是行，所以 X@W，W=Aᵀ`,when:`抄课本公式用 Ax；写 numpy/torch 前先写清样本是行还是列，公式跟着转置一次`}
  ],
  ext:[
    {t:`多层矩阵连乘 W₂W₁ 仍是一个矩阵，所以深度网络必须插非线性激活`,go:`dl.mlp`},
    {t:`旋转、缩放、剪切、反射都是特殊矩阵，复合顺序=矩阵乘法顺序`,go:`ge.transform`},
    {t:`形状规则与向量化：一次 X@W 算完 n 个样本`,go:`la.matmul_shape`}
  ]
},

/* ================================================================== */
'la.eigen': {
  layers:{
    alg:`Av=λv 的非零解 v。等价于 det(A−λI)=0 的根 λ，再解 (A−λI)v=0。对角化 A=PΛP⁻¹ 把 A 变成"换基→逐轴缩放→换回"。`,
    geo:`网格被拉扯后，绝大多数箭头都转向了，只有几条直线上的箭头还躺在原直线上，仅仅变长变短（λ<0 掉头）。这些直线就是特征方向。`,
    comp:`机器不解多项式。对称阵用 Jacobi/QR 迭代；只要最大的那个就用幂迭代：反复乘 A 再归一，向量自动倒向主特征方向，收敛快慢看 |λ₂/λ₁|。`
  },
  proof:{
    from:`定义 Av=λv，v≠0；行列式=0 ⟺ 矩阵奇异（见行列式节点）`,
    to:`特征方程 det(A−λI)=0；Σλ=tr，∏λ=det；对称阵特征值全实、不同特征值的特征向量正交；幂迭代为什么收敛`,
    steps:[
      [`Av=λv 改写为 (A−λI)v=0，且 v≠0`,`λv=λIv，移项合并。它说 A−λI 把一个非零向量压成 0，即 A−λI 的零空间非平凡`],
      [`零空间非平凡 ⟹ A−λI 不可逆 ⟹ det(A−λI)=0`,`可逆矩阵零空间只有 0（x=A⁻¹·0）；而不可逆 ⟺ det=0（行列式节点第 4-5 步）。这就是特征方程`],
      [`det(A−λI) 是 λ 的 n 次多项式，首项 (−λ)ⁿ`,`Leibniz 展开里只有主对角线那一项含 n 个 (a_ii−λ)，其它项 λ 次数 ≤ n−2。代数基本定理：在复数域恰有 n 个根（计重数）`],
      [`反之每个根 λ 都给出特征向量`,`det=0 ⟹ 奇异 ⟹ 零空间非平凡 ⟹ 取任一非零 v 即得 Av=λv。存在性和第 2 步是双向的`],
      [`λⁿ⁻¹ 系数 = −tr A，常数项 = det A，所以 Σλᵢ=tr，∏λᵢ=det`,`常数项是 λ=0 时的值 det(A)；λⁿ⁻¹ 只能来自主对角项 ∏(a_ii−λ) 展开，系数 −Σa_ii。再用韦达定理`],
      [`对称阵：λ₁≠λ₂ 的特征向量正交`,`λ₁(v₁·v₂) = (Av₁)·v₂ = v₁ᵀAᵀv₂ = v₁·(Av₂) = λ₂(v₁·v₂)，中间用了 A=Aᵀ。于是 (λ₁−λ₂)(v₁·v₂)=0，λ₁≠λ₂ 逼出 v₁·v₂=0`],
      [`对称阵特征值全实`,`取复向量 v，v̄ᵀAv=λ‖v‖²；同一个量的共轭转置（A 实对称）= λ̄‖v‖²，故 λ=λ̄`],
      [`幂迭代：x₀=Σcᵢvᵢ，Aᵏx₀=Σcᵢλᵢᵏvᵢ=λ₁ᵏ[c₁v₁+Σ_{i>1}cᵢ(λᵢ/λ₁)ᵏvᵢ]`,`A 对每个特征向量只做缩放，线性叠加。|λᵢ/λ₁|<1 的项指数衰减，归一化后 x_k→v₁，误差按 |λ₂/λ₁|ᵏ 收缩`]
    ],
    end:`特征方程不是定义而是推论：A−λI 必须压扁某个方向。对称阵有一整套正交特征基（谱定理），这是 PCA、Hessian 判凸、拉普拉斯谱聚类能成立的根基；幂迭代是 PageRank 和大规模 PCA 的算法内核。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(1)
M = np.random.randn(5,5); A = M@M.T + np.eye(5)   # 对称正定，保证实特征值
def power_iter(A, iters=500):        # 第8步：反复乘再归一
    x = np.random.randn(A.shape[0]); x /= np.linalg.norm(x)
    for _ in range(iters):
        y = A@x; x = y/np.linalg.norm(y)
    return x, x@A@x                  # Rayleigh 商给 lambda
v1, lam1 = power_iter(A)
w, V = np.linalg.eigh(A)             # 升序
print('幂迭代 lambda_max =', round(lam1,10))
print('eigh   lambda_max =', round(w[-1],10))
print('方向一致 |v1 . v_eigh| =', round(abs(v1@V[:,-1]),10))
print('Av=lambda v 残差     =', '%.2e' % np.linalg.norm(A@v1-lam1*v1))
print('sum(lambda)==tr :', np.isclose(w.sum(), np.trace(A)), '  prod(lambda)==det :', np.isclose(np.prod(w), np.linalg.det(A)))
print('特征向量两两正交 V^T V==I :', np.allclose(V.T@V, np.eye(5)))
# 收敛率 = |lambda2/lambda1|：跑 k 步看误差
x = np.random.randn(5); x/=np.linalg.norm(x); errs=[]
for k in range(1,41):
    x = A@x; x/=np.linalg.norm(x)
    if k in (10,20,40): errs.append(np.sqrt(1-(x@V[:,-1])**2))
print('|lambda2/lambda1| =', round(w[-2]/w[-1],4), '  第10/20/40步方向误差 =', ['%.1e'%e for e in errs])
R = np.array([[0,-1],[1,0]]); print('旋转90度的特征值 =', np.round(np.linalg.eigvals(R),6))`,
    out:`幂迭代 lambda_max = 22.5938345692
eigh   lambda_max = 22.5938345692
方向一致 |v1 . v_eigh| = 1.0
Av=lambda v 残差     = 3.23e-15
sum(lambda)==tr : True   prod(lambda)==det : True
特征向量两两正交 V^T V==I : True
|lambda2/lambda1| = 0.2   第10/20/40步方向误差 = ['1.1e-06', '2.1e-08', '2.6e-08']
旋转90度的特征值 = [0.+1.j 0.-1.j]`,
    note:`power_iter 的循环是第 8 步；Rayleigh 商 x·Ax 是把 Av=λv 两边点 v。sum/prod 两行是第 5 步；V^T V=I 是第 6 步；最后一行验证"旋转没有实特征向量"（复根，第 3 步）。`
  },
  contrast:[
    {vs:`奇异值分解 SVD`,same:`都是"找特殊方向把矩阵拆成缩放"，对称半正定阵上 σ=λ、U=V=特征向量`,diff:`特征值问同一空间里谁不转向，要方阵、可能复数、可能不可对角化；SVD 用两组不同正交基，任何形状都存在，σ≥0 有序`,when:`方阵看长期行为、稳定性、二次型用特征值；非方阵、降维、条件数、最小二乘用 SVD`},
    {vs:`奇异 / 不可逆`,same:`都由 det=0 判定`,diff:`不可逆是 A 自己的 det=0；特征值是 A−λI 的 det=0。λ=0 是特征值 ⟺ A 不可逆`,when:`问"能撤销吗"看 det A；问"哪个方向不转"看 det(A−λI)`},
    {vs:`奇异值 σ 与特征值 λ 的模`,same:`都衡量放大倍数`,diff:`σ₁=‖A‖₂≥|λ|max，一般不等；非正规矩阵可以所有 |λ|<1 但 σ₁≫1（瞬态放大）`,when:`长期 Aⁿ 看 |λ|；单步最坏放大看 σ₁`}
  ],
  ext:[
    {t:`协方差矩阵的特征分解 = PCA：最大特征向量是方差最大方向`,go:`ml.pca`},
    {t:`Hessian 特征值符号判断临界点是极小、极大还是鞍点`,go:`ca.partial_hessian`},
    {t:`RNN 反复乘同一权重：谱半径>1 梯度爆炸，<1 消失`,go:`dl.rnn`},
    {t:`微分算子的"特征函数"是正弦，傅里叶变换就是在这组基下对角化`,go:`fo.eigenfunction`}
  ]
},

/* ================================================================== */
'la.svd': {
  layers:{
    alg:`A=UΣVᵀ：V 是 AᵀA 的正交特征基，σᵢ=√λᵢ(AᵀA)，uᵢ=Avᵢ/σᵢ。等价写法 A=Σσᵢuᵢvᵢᵀ，秩 1 块按重要性排队。`,
    geo:`单位球被 A 送成椭球：Vᵀ 先转正，Σ 沿坐标轴拉伸成椭球，U 再把椭球转到最终姿势。半轴长 = σᵢ，半轴方向 = uᵢ。`,
    comp:`不显式算 AᵀA（条件数平方）。Golub–Kahan：先用 Householder 把 A 双对角化，再 QR 迭代把双对角阵的奇异值挤出来。大矩阵用随机化 SVD 只算前 k 个。`
  },
  proof:{
    from:`谱定理：实对称阵有正交特征基、实特征值（特征值节点第 6-7 步）`,
    to:`任意 m×n 矩阵 A 都能写成 A=UΣVᵀ（U、V 正交，Σ 对角非负）；‖A‖₂=σ₁；秩=非零 σ 个数；截断最优`,
    steps:[
      [`AᵀA 是 n×n 对称半正定阵`,`(AᵀA)ᵀ=AᵀA；xᵀAᵀAx=‖Ax‖²≥0。半正定就是"所有特征值 ≥0"，因为 λ=vᵀAᵀAv/‖v‖²=‖Av‖²/‖v‖²`],
      [`谱定理给出正交特征基 v₁…vₙ 和特征值 λ₁≥…≥λₙ≥0；令 σᵢ=√λᵢ`,`第 1 步保证可以开方；排序是为了后面截断按重要性`],
      [`对 σᵢ>0 定义 uᵢ=Avᵢ/σᵢ，则 uᵢ·uⱼ=δᵢⱼ`,`uᵢ·uⱼ = vᵢᵀAᵀAvⱼ/(σᵢσⱼ) = λⱼ(vᵢ·vⱼ)/(σᵢσⱼ)；i≠j 时 vᵢ·vⱼ=0，i=j 时 =λᵢ/σᵢ²=1。正交性是"白送"的，不用再正交化`],
      [`σᵢ=0 时 Avᵢ=0`,`‖Avᵢ‖²=vᵢᵀAᵀAvᵢ=λᵢ=0。所以 Avᵢ=σᵢuᵢ 对所有 i 成立（零 σ 配任意 uᵢ）`],
      [`把 r 个 uᵢ 用 Gram–Schmidt 补成 Rᵐ 的标准正交基 U；把 Avᵢ=σᵢuᵢ 叠成 AV=UΣ`,`前 r 个已正交，补齐总能做到（正交矩阵节点）。Σ 是 m×n，对角放 σ，其余 0`],
      [`V 正交 ⟹ V⁻¹=Vᵀ ⟹ A=UΣVᵀ。存在性证毕`,`右乘 Vᵀ。整个构造只用了谱定理，所以 SVD 的存在性 = 对称阵可正交对角化的推论`],
      [`‖A‖₂=σ₁：‖Ax‖²=‖UΣVᵀx‖²=‖Σc‖²=Σσᵢ²cᵢ²≤σ₁²，c=Vᵀx，‖c‖=‖x‖=1`,`U、V 保长度。最大在 c=e₁ 即 x=v₁ 取到：v₁ 是被拉得最狠的方向`],
      [`rank A = #{σᵢ>0}；A=Σσᵢuᵢvᵢᵀ 截断到 k 项误差 ‖A−A_k‖₂=σ_{k+1}（Eckart–Young）`,`col(A)=span{uᵢ:σᵢ>0}，正交向量独立。A−A_k=Σ_{i>k}σᵢuᵢvᵢᵀ 仍是 SVD 形式，其最大奇异值是 σ_{k+1}，由第 7 步得范数`]
    ],
    end:`SVD 对任何矩阵存在，因为 AᵀA 永远对称半正定。它把"矩阵能放大多少、丢掉多少、还剩几维"一次讲清，是 PCA、低秩压缩、伪逆、条件数的共同源头。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(2)
A = np.random.randn(6,4)
lam, V = np.linalg.eigh(A.T@A)            # 第1-2步：A^T A 的正交特征基
idx = np.argsort(lam)[::-1]; lam, V = lam[idx], V[:,idx]
sig = np.sqrt(np.clip(lam,0,None))
U = np.column_stack([A@V[:,i]/sig[i] for i in range(4)])   # 第3步：u_i = A v_i / sigma_i
print('U^T U == I (第3步正交性白送):', np.allclose(U.T@U, np.eye(4)))
print('手工 sigma =', np.round(sig,6))
print('numpy sigma=', np.round(np.linalg.svd(A, compute_uv=False),6))
print('重建 U diag(sigma) V^T == A :', np.allclose(U@np.diag(sig)@V.T, A))
# 第7步：||A||_2 = sigma_1，随机单位向量放大倍数不超过它
xs = np.random.randn(4,20000); xs /= np.linalg.norm(xs,axis=0)
print('max ||Ax|| over 20000 unit x =', round(np.linalg.norm(A@xs,axis=0).max(),4), ' sigma_1 =', round(sig[0],4))
# 第8步：截断误差 = sigma_{k+1}
for k in (1,2,3):
    Ak = sum(sig[i]*np.outer(U[:,i],V[:,i]) for i in range(k))
    print('k=%d  ||A-A_k||_2 = %.6f   sigma_%d = %.6f' % (k, np.linalg.norm(A-Ak,2), k+1, sig[k]))
B = np.outer([1,2,3],[1,0,-1]) + np.outer([0,1,1],[2,2,2])      # 两个秩1块之和
print('秩2矩阵的 sigma =', np.round(np.linalg.svd(B,compute_uv=False),6), ' -> rank =', np.linalg.matrix_rank(B))`,
    out:`U^T U == I (第3步正交性白送): True
手工 sigma = [3.573828 2.865983 1.99468  1.172687]
numpy sigma= [3.573828 2.865983 1.99468  1.172687]
重建 U diag(sigma) V^T == A : True
max ||Ax|| over 20000 unit x = 3.5724  sigma_1 = 3.5738
k=1  ||A-A_k||_2 = 2.865983   sigma_2 = 2.865983
k=2  ||A-A_k||_2 = 1.994680   sigma_3 = 1.994680
k=3  ||A-A_k||_2 = 1.172687   sigma_4 = 1.172687
秩2矩阵的 sigma = [7.111709 1.193142 0.      ]  -> rank = 2`,
    note:`eigh(AᵀA) 是第 1-2 步，U 的构造是第 3 步（正交性不用再做），重建那行是第 6 步的等式；20000 个随机单位向量那行是第 7 步；k 循环是第 8 步 Eckart–Young。`
  },
  contrast:[
    {vs:`特征分解 A=PΛP⁻¹`,same:`都拆成"换基-缩放-换回"`,diff:`特征分解用同一组基、要方阵、P 不一定正交、λ 可负可复；SVD 用两组正交基、任意形状、σ 非负降序`,when:`对称半正定阵两者一样随便用；其它一律 SVD`},
    {vs:`PCA`,same:`PCA 的主成分 = 中心化数据矩阵的右奇异向量 V`,diff:`PCA 是统计问题（方差最大方向），SVD 是矩阵分解工具；不中心化的 SVD 第一分量指向均值`,when:`做 PCA 先减均值再 SVD；SVD 本身不管你数据的均值`},
    {vs:`QR 分解`,same:`都含正交矩阵、都能判秩、都用于最小二乘`,diff:`QR 是 A=Q·上三角，只一侧正交，不给放大倍数；SVD 两侧正交并给出 σ`,when:`解满秩最小二乘用 QR（便宜）；病态、秩亏、要截断用 SVD`}
  ],
  ext:[
    {t:`中心化数据矩阵做 SVD 就是 PCA，σ²/(n−1) 是各主成分方差`,go:`ml.pca`},
    {t:`伪逆 A⁺=VΣ⁺Uᵀ：把 1/σ 里太大的截掉，解病态最小二乘`,go:`la.least_squares`},
    {t:`注意力权重矩阵、LoRA 低秩适配都是"矩阵近似低秩"这一句的应用`,go:`dl.attention`},
    {t:`np.linalg.svd / pinv / cond 的底层就是它`,go:`np.linalg`}
  ]
},

/* ================================================================== */
'la.rank': {
  layers:{
    alg:`rank A = dim col(A) = 独立列数 = 独立行数 = 消元后非零主元个数 = 非零奇异值个数。rank + nullity = n。`,
    geo:`n 维输入空间被 A 拍成一个 r 维的像；被压掉的 n−r 维就是零空间。三支箭若共面只撑起平面：秩 2。`,
    comp:`不要数"哪些列看起来独立"。数值上用 SVD：σᵢ>tol·σ₁ 的个数；np.linalg.matrix_rank 就这么算。消元数主元在浮点下会被舍入误差骗。`
  },
  proof:{
    from:`rank A := dim col(A)（像空间维数）；null(A)={x:Ax=0}；基的扩充定理`,
    to:`秩-零化度定理 rank+nullity=n；行秩=列秩`,
    steps:[
      [`null(A) 是子空间，取它的一组基 n₁…n_k，k=nullity`,`Ax=0，Ay=0 ⟹ A(αx+βy)=0，对加法和数乘封闭；子空间必有基`],
      [`把它扩充成 Rⁿ 的基：n₁…n_k, w₁…w_r，r=n−k`,`基的扩充定理：任何独立组都能补成全空间的基，补的个数正好是维数差`],
      [`Aw₁…Aw_r 张成 col(A)`,`任意 x=Σaᵢnᵢ+Σbⱼwⱼ，Ax=Σaᵢ·0+ΣbⱼAwⱼ。像空间里每个向量都是这 r 个的组合`],
      [`Aw₁…Aw_r 线性无关`,`若 ΣbⱼAwⱼ=0，则 A(Σbⱼwⱼ)=0，即 Σbⱼwⱼ∈null(A)=span{nᵢ}；但 w 和 n 一起是基，w 的组合落进 n 的张成只能是 0，故全部 bⱼ=0`],
      [`所以 dim col(A)=r=n−k，即 rank+nullity=n`,`第 3、4 步合起来说 Aw₁…Aw_r 是 col(A) 的基`],
      [`行变换不改变行空间、也不改变零空间`,`每个新行是旧行的组合（且可逆），张成不变；Ax=0 ⟺ 每行·x=0，行组合仍·x=0，反之亦然`],
      [`化到行阶梯形：r 个主元行独立 ⟹ 行秩=r；n−r 个自由变量 ⟹ nullity=n−r`,`阶梯形的非零行有各自的首个 1 位置，不可能互相组合；每个自由变量给出零空间一个独立向量`],
      [`列秩 = n − nullity = r = 行秩`,`第 5 步对 A 用一次；零空间没变（第 6 步），所以 A 的列秩和阶梯形一样是 r`]
    ],
    end:`输入的 n 维守恒：要么活着进入像（rank），要么死在零空间（nullity）。行秩=列秩说明"矩阵压掉了几维"是矩阵本身的性质，横看竖看一致。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(3)
def rref_rank(A, tol=1e-10):          # 第6-7步：消元数主元
    A = A.astype(float).copy(); m,n = A.shape; r = 0
    for c in range(n):
        if r>=m: break
        p = r + np.argmax(abs(A[r:,c]))
        if abs(A[p,c]) < tol: continue
        A[[r,p]] = A[[p,r]]; A[r] /= A[r,c]
        for i in range(m):
            if i!=r: A[i] -= A[i,c]*A[r]
        r += 1
    return r
def null_basis(A, tol=1e-10):        # 零空间：SVD 里 sigma≈0 的右奇异向量
    U,s,Vt = np.linalg.svd(A); r = (s>tol).sum(); return Vt[r:].T
# 构造 6x5、秩 3：3 个独立列 + 2 个组合列
B = np.random.randn(6,3); A = np.column_stack([B, B@[1,2,3], B@[-1,0,4]])
r = rref_rank(A); N = null_basis(A)
print('消元主元数 =', r, ' matrix_rank =', np.linalg.matrix_rank(A), ' 行秩(对A^T消元) =', rref_rank(A.T))
print('nullity =', N.shape[1], '  rank+nullity =', r+N.shape[1], ' = n =', A.shape[1])
print('A @ null_basis ≈ 0 :', '%.1e' % abs(A@N).max())
# 第3-4步：A 作用在"补基" w 上的像独立且张成 col(A)
W = np.linalg.qr(np.column_stack([N, np.random.randn(5,2)]))[0][:,2:]   # 补出与 N 正交的 3 个方向
print('rank(A W) =', np.linalg.matrix_rank(A@W), ' rank[A | AW] =', np.linalg.matrix_rank(np.column_stack([A, A@W])))
print('rank(AB) <= min :', np.linalg.matrix_rank(A@np.random.randn(5,7)), '<=', min(3,5))
C = np.array([[1,2],[2,4.0000001]])
print('几乎共线：rank =', np.linalg.matrix_rank(C), ' cond =', '%.1e' % np.linalg.cond(C))`,
    out:`消元主元数 = 3  matrix_rank = 3  行秩(对A^T消元) = 3
nullity = 2   rank+nullity = 5  = n = 5
A @ null_basis ≈ 0 : 6.0e-16
rank(A W) = 2  rank[A | AW] = 3
rank(AB) <= min : 3 <= 3
几乎共线：rank = 2  cond = 2.5e+08`,
    note:`rref_rank 是第 6-7 步（行变换后数主元）；null_basis + 打印那行是第 5 步 rank+nullity=n；W 那两行是第 3-4 步（补基的像独立且张满列空间）；最后一行是"秩满但条件数爆炸"的陷阱。`
  },
  contrast:[
    {vs:`矩阵大小 m×n`,same:`都描述矩阵的"尺寸"`,diff:`大小是容器，秩是真正装了几维信息；1000×1000 可以秩 1`,when:`存储看大小；信息量、可逆性、解的唯一性看秩`},
    {vs:`条件数 σ₁/σ_min`,same:`都在说"矩阵有没有把某个方向压扁"`,diff:`秩是离散的（σ 是否严格为 0），条件数是连续的（σ_min 多接近 0）`,when:`理论判可逆看秩；数值稳定性看条件数：秩满但 cond=1e12 等于实际奇异`},
    {vs:`零化度 nullity`,same:`一枚硬币两面，rank+nullity=n`,diff:`秩数活下来的维度（输出侧），零化度数死掉的维度（输入侧）`,when:`问"输出还剩几维"用秩；问"解有几个自由参数"用零化度`}
  ],
  ext:[
    {t:`回归特征共线 = 设计矩阵秩亏，系数不唯一，要正则化`,go:`ml.linear_reg`},
    {t:`低秩近似：数据矩阵"有效秩"远小于列数是 PCA 降维的前提`,go:`ml.pca`},
    {t:`零空间的基和通解结构`,go:`la.null_space`}
  ]
},

/* ================================================================== */
'la.inverse': {
  layers:{
    alg:`A⁻¹ 是使 AX=XA=I 的唯一矩阵。存在 ⟺ det≠0 ⟺ rank=n ⟺ null={0}。公式 A⁻¹=adj(A)/det A；2×2 就是主对角互换、副对角变号、除 det。`,
    geo:`变换把网格拉成平行四边形，逆把它拉回来。压成一条线（det=0）就丢了一维，多个点落到同一处，无法分辨来自哪里：不可逆。`,
    comp:`几乎不显式求逆。解 Ax=b 用 LU 消元（n³/3），求逆要 n³ 且更不稳。Gauss–Jordan 对 [A|I] 做行变换到 [I|A⁻¹]，本质是把 A⁻¹=E_k…E₁ 记账。`
  },
  proof:{
    from:`可逆的定义 AX=XA=I；秩-零化度定理；行列式=±主元之积`,
    to:`A 可逆 ⟺ null(A)={0} ⟺ rank A=n ⟺ det A≠0；A·adj(A)=det(A)·I；(AB)⁻¹=B⁻¹A⁻¹`,
    steps:[
      [`可逆 ⟹ null(A)={0}`,`Ax=0 两边左乘 A⁻¹：x=A⁻¹Ax=A⁻¹0=0。逆把"被压成 0 的东西"只允许是 0`],
      [`null(A)={0} ⟹ rank A=n`,`秩-零化度：rank=n−nullity=n−0`],
      [`rank A=n ⟹ 存在 X 使 AX=I`,`n 个列独立 ⟹ 张成 Rⁿ ⟹ 每个 eⱼ 都是列的组合 Axⱼ=eⱼ。把 xⱼ 并排成 X`],
      [`AX=I ⟹ XA=I（右逆即左逆）`,`A(XA−I)=AXA−A=A−A=0，所以 XA−I 的每一列都在 null(A)={0} 里，XA=I。三条等价成环`],
      [`rank A=n ⟺ det A≠0`,`消元只用换行（det 变号）和倍加（det 不变）化成上三角 U，det A=±∏uᵢᵢ；满秩 ⟺ n 个主元全非零 ⟺ 乘积非零`],
      [`A·adj(A)=det(A)·I`,`adj 的 (j,i) 元是余子式 C_ij。(A·adj)_ii=Σ_j a_ij C_ij 正是按第 i 行的余子式展开 = det A；(A·adj)_ik（i≠k）=Σ_j a_ij C_kj 是"把第 k 行换成第 i 行"的矩阵的行列式，两行相同 ⟹ 0。故 A⁻¹=adj/det，2×2 时 adj=[[d,−b],[−c,a]]`],
      [`(AB)⁻¹=B⁻¹A⁻¹`,`(B⁻¹A⁻¹)(AB)=B⁻¹(A⁻¹A)B=B⁻¹B=I。先穿的后脱`],
      [`Gauss–Jordan 为什么给出逆`,`每步行变换 = 左乘一个可逆的初等矩阵 Eᵢ。E_k…E₁A=I ⟹ E_k…E₁=A⁻¹；同样的变换施加在 I 上得到的就是 E_k…E₁`]
    ],
    end:`可逆 = 没有信息丢失 = 没有方向被压扁 = 体积不为零，三种说法一件事。工程里用 solve 不用 inv：同一个消元，少做一次矩阵乘，稳定得多。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(4)
def gauss_jordan_inv(A):             # 第8步：[A|I] 行变换到 [I|A^-1]
    n = A.shape[0]; M = np.hstack([A.astype(float), np.eye(n)])
    for c in range(n):
        p = c + np.argmax(abs(M[c:,c]))
        if abs(M[p,c]) < 1e-12: raise ValueError('奇异：第%d列没有主元' % c)
        M[[c,p]] = M[[p,c]]; M[c] /= M[c,c]
        for i in range(n):
            if i!=c: M[i] -= M[i,c]*M[c]
    return M[:,n:]
A = np.random.randn(5,5); X = gauss_jordan_inv(A)
print('AX==I :', np.allclose(A@X, np.eye(5)), '  XA==I (第4步右逆即左逆):', np.allclose(X@A, np.eye(5)))
print('与 np.linalg.inv 最大差 = %.1e' % abs(X-np.linalg.inv(A)).max())
B = np.random.randn(5,5)
print('(AB)^-1 == B^-1 A^-1 :', np.allclose(gauss_jordan_inv(A@B), gauss_jordan_inv(B)@gauss_jordan_inv(A)),
      '   == A^-1 B^-1 ?', np.allclose(gauss_jordan_inv(A@B), gauss_jordan_inv(A)@gauss_jordan_inv(B)))
# 第6步：伴随矩阵公式，2x2
a,b,c,d = 2,1,1,1
adj = np.array([[d,-b],[-c,a]]); det = a*d-b*c
print('2x2: adj/det =', (adj/det).tolist(), ' 验 A@adj =', (np.array([[a,b],[c,d]])@adj).tolist(), '= det*I, det =', det)
S = np.array([[1,2],[2,4]])
print('det =', round(np.linalg.det(S),6), ' rank =', np.linalg.matrix_rank(S), end='  ')
try: gauss_jordan_inv(S)
except ValueError as e: print('->', e)
# solve 比 inv 稳：病态矩阵
H = np.array([[1/(i+j+1) for j in range(8)] for i in range(8)]); b = H@np.ones(8)
print('cond(H)=%.1e  inv 路线误差=%.1e  solve 路线误差=%.1e' % (np.linalg.cond(H), abs(np.linalg.inv(H)@b-1).max(), abs(np.linalg.solve(H,b)-1).max()))`,
    out:`AX==I : True   XA==I (第4步右逆即左逆): True
与 np.linalg.inv 最大差 = 4.4e-16
(AB)^-1 == B^-1 A^-1 : True    == A^-1 B^-1 ? False
2x2: adj/det = [[1.0, -1.0], [-1.0, 2.0]]  验 A@adj = [[1, 0], [0, 1]] = det*I, det = 1
det = 0.0  rank = 1  -> 奇异：第1列没有主元
cond(H)=1.5e+10  inv 路线误差=5.4e-06  solve 路线误差=4.8e-07`,
    note:`gauss_jordan_inv 是第 8 步；AX 与 XA 两个判断是第 4 步；(AB)⁻¹ 那行是第 7 步；adj 那行是第 6 步；奇异矩阵抛错对应第 5 步"没有主元 ⟺ det=0"。最后一行是工程结论：solve 优于 inv。`
  },
  contrast:[
    {vs:`伪逆 A⁺=(AᵀA)⁻¹Aᵀ 或 VΣ⁺Uᵀ`,same:`都在"撤销"A；A 可逆时 A⁺=A⁻¹`,diff:`逆要求方阵满秩且 AA⁻¹=A⁻¹A=I；伪逆对任何形状存在，只保证 AA⁺A=A，给的是最小二乘/最小范数解`,when:`方阵满秩且必须精确还原用逆；非方、秩亏、超定/欠定一律伪逆`},
    {vs:`转置 Aᵀ`,same:`正交矩阵时两者相等 Q⁻¹=Qᵀ`,diff:`转置只是翻转索引，永远存在、算不出撤销；逆是撤销，可能不存在`,when:`看到 QᵀQ=I 才能用转置代替逆；其它情况必须真的解`},
    {vs:`solve(A,b)`,same:`都能得到 x=A⁻¹b`,diff:`solve 做一次 LU 直接回代，不生成 A⁻¹；inv 再乘 b 多一层舍入且慢 3 倍`,when:`永远 solve；只有真需要 A⁻¹ 的每个元素（比如协方差逆的对角）才 inv`}
  ],
  ext:[
    {t:`线性方程组的解：唯一解 ⟺ 可逆，否则无解或无穷解`,go:`al.system_eq`},
    {t:`正规方程 (AᵀA)⁻¹Aᵀb 里的逆就是伪逆的前身`,go:`la.least_squares`},
    {t:`np.linalg.solve / inv / lstsq 的取舍`,go:`np.linalg`}
  ]
},

/* ================================================================== */
'la.basis': {
  layers:{
    alg:`v=Σcᵢbᵢ，系数 c 唯一。列成 P=[b₁…bₙ]，则 v=Pc，c=P⁻¹v；标准正交基下 cᵢ=bᵢ·v。换基后矩阵变成 P⁻¹AP。`,
    geo:`同一支箭，方格纸上读 (3,1)，斜格纸上读 (2,1)。箭没动，只是量它的尺子换了。换基=换尺子。`,
    comp:`求坐标就是解方程 Pc=v（一次 solve）；基正交时退化成 n 个点积。diagonalize、FFT、PCA 的 transform 本质都是"乘一个 P⁻¹"。`
  },
  proof:{
    from:`基的定义：线性无关 + 张成全空间；可逆矩阵节点`,
    to:`坐标唯一；c=P⁻¹v；正交基下坐标=点积；换基后矩阵 A′=P⁻¹AP 且特征值不变`,
    steps:[
      [`每个 v 都能写成 v=Σcᵢbᵢ，且 c 唯一`,`张成给存在；若 Σcᵢbᵢ=Σcᵢ′bᵢ 则 Σ(cᵢ−cᵢ′)bᵢ=0，线性无关逼出 cᵢ=cᵢ′。坐标是良定义的`],
      [`把基排成列 P=[b₁…bₙ]，v=Pc`,`矩阵乘向量=列的加权和（矩阵即变换节点第 2 步），权重正是坐标`],
      [`P 可逆，c=P⁻¹v`,`n 个独立列 ⟹ rank=n ⟹ 可逆（逆矩阵节点）。求坐标=解一个方程组`],
      [`标准正交基：PᵀP=I ⟹ P⁻¹=Pᵀ ⟹ cᵢ=bᵢ·v`,`bᵢ·bⱼ=δᵢⱼ 就是 PᵀP=I 的逐元素写法；转置一行乘 v 就是点积。非正交基没有这条捷径`],
      [`线性映射 T 在标准基下矩阵 A；在基 P 下矩阵 A′=P⁻¹AP`,`新坐标 c → 真向量 Pc → 作用 APc → 翻回新坐标 P⁻¹APc。三步串起来就是 A′。A 和 A′ 是同一个 T 的两种写法（相似）`],
      [`相似矩阵特征多项式相同：det(A′−λI)=det(A−λI)`,`A′−λI=P⁻¹(A−λI)P，det 可乘：det(P⁻¹)det(A−λI)det(P)=det(A−λI)。故特征值、迹、行列式都只属于 T，不属于坐标系`],
      [`取 P=特征向量，则 A′=Λ 对角`,`APeⱼ=Avⱼ=λⱼvⱼ=PΛeⱼ ⟹ AP=PΛ ⟹ P⁻¹AP=Λ。换到特征基，变换只剩各轴缩放：这就是"选对基问题变简单"`]
    ],
    end:`坐标是相对的，向量和变换是绝对的。特征基让矩阵对角化、傅里叶基让卷积变乘法、主成分基让数据去相关，全是第 5-7 步同一个 P⁻¹AP 的不同 P。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(5)
P = np.array([[1.,1.],[0.,1.]])       # 基 (1,0),(1,1)
v = np.array([3.,1.])
c = np.linalg.solve(P, v)             # 第3步：解 Pc=v
print('v=(3,1) 在基 (1,0),(1,1) 下坐标 =', c.tolist(), '  验 Pc==v:', np.allclose(P@c, v))
print('直接点积(错):', (P.T@v).tolist(), ' <- 基不正交，点积不是坐标')
Q = np.array([[1,1],[1,-1]])/np.sqrt(2)                       # 第4步：标准正交基
print('正交基下 点积坐标 =', np.round(Q.T@v,6).tolist(), ' solve坐标 =', np.round(np.linalg.solve(Q,v),6).tolist())
# 第5-6步：换基后的矩阵相似，特征值不变
A = np.random.randn(4,4); P = np.random.randn(4,4)
A2 = np.linalg.solve(P, A@P)           # P^-1 A P
print('A 与 P^-1AP 特征值相同:', np.allclose(np.sort(np.linalg.eigvals(A)), np.sort(np.linalg.eigvals(A2))),
      ' 迹相同:', np.isclose(np.trace(A), np.trace(A2)), ' det相同:', np.isclose(np.linalg.det(A), np.linalg.det(A2)))
x = np.random.randn(4)
print('同一向量两套坐标下作用结果一致:', np.allclose(P@(A2@np.linalg.solve(P,x)), A@x))
# 第7步：用特征向量当基，矩阵变对角
S = np.array([[2.,1.],[1.,2.]]); lam, V = np.linalg.eigh(S)
print('V^-1 S V =', np.round(V.T@S@V, 10).tolist(), '  lambda =', lam.tolist())`,
    out:`v=(3,1) 在基 (1,0),(1,1) 下坐标 = [2.0, 1.0]   验 Pc==v: True
直接点积(错): [3.0, 4.0]  <- 基不正交，点积不是坐标
正交基下 点积坐标 = [2.828427, 1.414214]  solve坐标 = [2.828427, 1.414214]
A 与 P^-1AP 特征值相同: True  迹相同: True  det相同: True
同一向量两套坐标下作用结果一致: True
V^-1 S V = [[1.0, 0.0], [-0.0, 3.0]]   lambda = [1.0, 3.0]`,
    note:`solve(P,v) 是第 3 步，"直接点积(错)"展示第 4 步的前提；A2=P⁻¹AP 与特征值比较是第 5-6 步；最后一行是第 7 步对角化。`
  },
  contrast:[
    {vs:`相似 P⁻¹AP 与合同 PᵀAP`,same:`都是"换基后 A 长什么样"，P 正交时两者重合`,diff:`相似描述线性映射换坐标（保特征值）；合同描述二次型/内积换坐标（保正定性和惯性指数，不保特征值）`,when:`A 是"作用"（动力学、马尔可夫）用相似；A 是"形状"（协方差、Hessian、度量）用合同`},
    {vs:`张成集 spanning set`,same:`都能表示出空间里每个向量`,diff:`张成集可能冗余、坐标不唯一；基恰好够用，坐标唯一`,when:`过完备字典（稀疏编码、小波帧）故意用冗余张成；要唯一坐标必须是基`},
    {vs:`正交基与一般基`,same:`都是基，都给唯一坐标`,diff:`正交基坐标=点积，各方向互不干扰；一般基要解方程，改一个分量牵动所有`,when:`能选正交就选正交（PCA、Fourier、QR 都在造正交基）`}
  ],
  ext:[
    {t:`主成分基：换到协方差特征基，坐标彼此不相关`,go:`ml.pca`},
    {t:`傅里叶基：正弦是微分/卷积的特征基，换过去卷积变乘法`,go:`fo.basis`},
    {t:`词嵌入就是给每个 token 一组坐标，语义在这组基下成了几何`,go:`lm.embedding`}
  ]
},

/* ================================================================== */
'la.projection': {
  layers:{
    alg:`P=A(AᵀA)⁻¹Aᵀ，p=Pb 是 b 在 col(A) 里的最近点；残差 e=b−p 满足 Aᵀe=0。P²=P、Pᵀ=P；列正交时 P=QQᵀ，单向量 P=aaᵀ/aᵀa。`,
    geo:`一个点悬在平面上方，垂直落下的影子就是投影；影子到点的线段垂直于平面，是所有连线中最短的一条。`,
    comp:`永远不要真的求 (AᵀA)⁻¹。先 QR：Q 的列是 col(A) 的正交基，p=Q(Qᵀb)，就是 r 个点积再加权求和。`
  },
  proof:{
    from:`子空间 S=col(A)，A 列独立；内积与勾股定理`,
    to:`正交投影是 S 中离 b 最近的点；P=A(AᵀA)⁻¹Aᵀ；P²=P，Pᵀ=P；特征值只有 0、1`,
    steps:[
      [`若 b=p+e，p∈S，e⊥S，这种分解至多一种`,`两种分解相减：(p−p′)=(e′−e) 既在 S 里又 ⊥S，与自己点积为 0 ⟹ 零向量`],
      [`这样的 p 是 S 中离 b 最近的点`,`任取 s∈S：‖b−s‖²=‖e+(p−s)‖²=‖e‖²+‖p−s‖²，交叉项 e·(p−s)=0 因为 p−s∈S。勾股定理直接给出 ≥‖e‖²，等号仅当 s=p`],
      [`写 p=Ax̂，e⊥S ⟺ Aᵀ(b−Ax̂)=0 ⟺ AᵀAx̂=Aᵀb`,`e ⊥ 每一列 aⱼ ⟺ aⱼᵀe=0 对所有 j ⟺ Aᵀe=0。正规方程从"垂直"一步推出`],
      [`AᵀA 可逆`,`AᵀAx=0 ⟹ xᵀAᵀAx=‖Ax‖²=0 ⟹ Ax=0 ⟹ x=0（列独立）。零空间平凡 ⟹ 可逆。这也给出第 1 步的存在性`],
      [`x̂=(AᵀA)⁻¹Aᵀb，p=A(AᵀA)⁻¹Aᵀb=Pb`,`把第 4 步代回第 3 步。P 是把任何 b 送到影子的固定矩阵`],
      [`P²=P；Pᵀ=P`,`P²=A(AᵀA)⁻¹(AᵀA)(AᵀA)⁻¹Aᵀ 中间抵消；转置：((AᵀA)⁻¹)ᵀ=((AᵀA)ᵀ)⁻¹=(AᵀA)⁻¹。影子的影子还是它；对称是"正交"投影的标志（斜投影只幂等不对称）`],
      [`特征值 ∈{0,1}；I−P 投影到 S⊥`,`Pv=λv ⟹ P²v=λ²v=λv ⟹ λ²=λ。(I−P)b=e，e⊥S；(I−P)²=I−2P+P²=I−P`],
      [`列正交 Q 时 P=QQᵀ；单向量 P=aaᵀ/(aᵀa)`,`QᵀQ=I 让逆消失；n=1 时 AᵀA 是标量 a·a。所以先 QR 再投影不用求逆`]
    ],
    end:`投影=最近点=丢掉垂直分量，三件事由勾股定理一次锁定。最小二乘、线性回归、Gram–Schmidt、正交补全是这一个 P。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(6)
A = np.random.randn(7,3); b = np.random.randn(7)
P = A@np.linalg.inv(A.T@A)@A.T          # 第5步
p = P@b; e = b-p
print('P^2==P :', np.allclose(P@P,P), '  P^T==P :', np.allclose(P.T,P))
print('残差 ⊥ 每一列  A^T e = %.1e' % abs(A.T@e).max())
print('P 的特征值 =', np.round(np.sort(np.linalg.eigvalsh(P)),8).tolist())
# 第2步：随机取 20000 个列空间里的点，没有一个比 p 更近
S = A@np.random.randn(3,20000)*3 + p[:,None]
d = np.linalg.norm(b[:,None]-S, axis=0)
print('min ||b-s|| over 20000 s in col(A) = %.6f   ||b-p|| = %.6f' % (d.min(), np.linalg.norm(e)))
print('勾股 ||b-s||^2 == ||e||^2 + ||p-s||^2 :', np.allclose(d**2, np.linalg.norm(e)**2 + np.linalg.norm(p[:,None]-S,axis=0)**2))
# 第8步：QR 路线不求逆
Q,_ = np.linalg.qr(A)
print('Q Q^T == P :', np.allclose(Q@Q.T, P), '  (I-P) 投到正交补: (I-P)b . p = %.1e' % ((b-P@b)@p))
a = np.array([1.,2.]); print('单向量 (1,1)->(1,2):', (np.outer(a,a)/(a@a)@np.array([1,1])).tolist())`,
    out:`P^2==P : True   P^T==P : True
残差 ⊥ 每一列  A^T e = 7.5e-16
P 的特征值 = [-0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0]
min ||b-s|| over 20000 s in col(A) = 2.719546   ||b-p|| = 2.701581
勾股 ||b-s||^2 == ||e||^2 + ||p-s||^2 : True
Q Q^T == P : True   (I-P) 投到正交补: (I-P)b . p = -4.4e-16
单向量 (1,1)->(1,2): [0.6000000000000001, 1.2000000000000002]`,
    note:`P 的构造是第 5 步；P²、Pᵀ 是第 6 步；特征值是第 7 步；20000 个随机点与勾股那两行是第 2 步的数值版本；QQᵀ 是第 8 步。`
  },
  contrast:[
    {vs:`最小二乘`,same:`同一件事的两种叙述：最小二乘的 Ax̂ 就是 b 的投影`,diff:`投影关心 p（子空间里的点），最小二乘关心 x̂（系数）；p 唯一，x̂ 在列相关时不唯一`,when:`要预测值/去噪看 p；要解释系数看 x̂`},
    {vs:`斜投影（幂等但不对称）`,same:`都满足 P²=P，投两次等于一次`,diff:`正交投影残差垂直子空间、是最近点；斜投影沿别的方向压过去，不是最近点`,when:`几何最近点、最小二乘只能用正交投影；斜投影出现在非正交分解（如 Petrov–Galerkin）`},
    {vs:`点积投影 (a·b/a·a)a`,same:`就是 n=1 的投影矩阵`,diff:`单向量投影是一条线；一般 P 是 r 维子空间；多列时不能逐列投影相加（除非列正交）`,when:`列正交（QR 后）可以逐列点积相加；否则必须走正规方程或 QR`}
  ],
  ext:[
    {t:`最小二乘的正规方程就是"残差垂直列空间"`,go:`la.least_squares`},
    {t:`线性回归 = 把 y 投影到特征张成的空间，帽子矩阵 H=P`,go:`ml.linear_reg`},
    {t:`Gram–Schmidt 每一步都是减去对已有方向的投影`,go:`la.orthogonal`}
  ]
},

/* ================================================================== */
'la.determinant': {
  layers:{
    alg:`det 是行（列）的多线性、交替、且 det(I)=1 的唯一函数。展开式 Σ sgn(π)∏a_{iπ(i)}；实际算 = 消元后主元之积乘 (−1)^换行次数。`,
    geo:`单位正方形被列向量张成的平行四边形替换，det 就是它的有向面积；三维是平行六面体体积；0 表示被压扁。`,
    comp:`不用展开式（n! 项）。LU 消元 O(n³)：det=±∏uᵢᵢ。数值上要用 slogdet 防溢出：100×100 的 det 轻易超过 1e300。`
  },
  proof:{
    from:`"有向体积"应满足的三条：对每条边线性（多线性）、两边重合体积为 0（交替）、单位立方体体积 1（归一）`,
    to:`这三条唯一确定 det；det(AB)=det A·det B；det=∏λ；det=0 ⟺ 奇异`,
    steps:[
      [`多线性 + 交替 ⟹ 换两行变号`,`0=det(…,a+b,…,a+b,…)=det(a,a)+det(a,b)+det(b,a)+det(b,b)=det(a,b)+det(b,a)。交替给等号左边为 0，多线性拆开`],
      [`把某行的倍数加到另一行，det 不变`,`det(…,a+cb,…,b,…)=det(a,b)+c·det(b,b)=det(a,b)+0。多线性拆开，第二项两行相同`],
      [`任何 A 经换行与倍加可化为上三角 U；det A=(−1)^s·det U`,`高斯消元只用这两种操作；第 1、2 步记录了每步对 det 的影响`],
      [`上三角 det U=∏uᵢᵢ`,`若某 uᵢᵢ=0，行相关，用倍加可造出零行，多线性（乘 0）给 det=0；否则逐行提出 uᵢᵢ（多线性）再用倍加消成 I，det I=1`],
      [`所以 det 被三条公理唯一确定：任何满足三条的函数在 A 上取值都是 (−1)^s∏uᵢᵢ`,`第 3、4 步的每一步都只用了三条公理。存在性：Leibniz 展开式可逐条验证满足三条（略）。唯一性是下一步的杠杆`],
      [`det(AB)=det A·det B`,`det B≠0 时定义 f(A)=det(AB)/det B。AB 的第 i 行=(A 第 i 行)·B，对 A 的行是线性的、两行相同则 AB 两行相同，f(I)=1。f 满足三条 ⟹ f=det（第 5 步）。det B=0 时 B 奇异 ⟹ AB 奇异 ⟹ 两边都 0`],
      [`det=0 ⟺ 奇异；det=∏λᵢ`,`第 4 步：det=0 ⟺ 某主元为 0 ⟺ 秩亏。特征多项式 det(A−λI)=∏(λᵢ−λ)，取 λ=0`],
      [`几何：det 是体积缩放因子`,`单位立方体的像是列向量张成的平行体，其"体积"就是满足三条公理的那个函数；det(AB)=det A det B 说的是复合变换的缩放倍数相乘`]
    ],
    end:`行列式不是公式，是"有向体积"这三条要求的唯一答案。乘法定理、可逆判据、det=∏λ 都从唯一性一步推出；换元积分的雅可比、概率密度变换（flow 模型）用的正是这个缩放倍数。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(7)
def det_elim(A):                       # 第3-4步：消元，(-1)^s * prod(主元)
    A = A.astype(float).copy(); n = len(A); sign = 1.0
    for c in range(n):
        p = c + np.argmax(abs(A[c:,c]))
        if abs(A[p,c]) < 1e-14: return 0.0
        if p!=c: A[[c,p]] = A[[p,c]]; sign = -sign     # 第1步：换行变号
        for i in range(c+1,n): A[i] -= A[i,c]/A[c,c]*A[c]   # 第2步：倍加不变
    return sign*np.prod(np.diag(A))
A = np.random.randn(5,5); B = np.random.randn(5,5)
print('手写 det = %.10f   numpy = %.10f' % (det_elim(A), np.linalg.det(A)))
# 三条公理
A2 = A.copy(); A2[1] *= 3;   print('第1行乘3 -> det 乘3 :', np.isclose(det_elim(A2), 3*det_elim(A)))
A3 = A.copy(); A3[[0,2]] = A3[[2,0]]; print('换两行 -> 变号   :', np.isclose(det_elim(A3), -det_elim(A)))
A4 = A.copy(); A4[3] += 5*A4[0];      print('倍加 -> 不变     :', np.isclose(det_elim(A4), det_elim(A)))
print('det(I) =', det_elim(np.eye(5)))
# 第6步：乘法定理，随机 1000 对 5x5，取相对误差最大值
worst = max(abs(np.linalg.det(X@Y)-np.linalg.det(X)*np.linalg.det(Y))/abs(np.linalg.det(X)*np.linalg.det(Y))
            for X,Y in (np.random.randn(2,5,5) for _ in range(1000)))
print('det(AB) vs det(A)det(B) 最大相对误差 = %.1e  (<1e-10: %s)' % (worst, worst<1e-10))
print('det(A) == prod(eig) :', np.isclose(det_elim(A), np.prod(np.linalg.eigvals(A)).real))
# 第8步：面积 = det，用蒙特卡洛数单位方格被 A 映射后的面积
M = np.array([[3.,1.],[2.,4.]]); pts = M@np.random.rand(2,400000)
box = (pts.max(1)-pts.min(1)); inside = np.linalg.solve(M, np.random.rand(2,400000)*box[:,None]+pts.min(1)[:,None])
area = box.prod()*((inside>=0)&(inside<=1)).all(0).mean()
print('平行四边形面积(蒙特卡洛) = %.2f   det = %.1f' % (area, det_elim(M)))
print('det(A+B) == det A + det B ?', np.isclose(det_elim(A+B), det_elim(A)+det_elim(B)))`,
    out:`手写 det = -4.0256526843   numpy = -4.0256526843
第1行乘3 -> det 乘3 : True
换两行 -> 变号   : True
倍加 -> 不变     : True
det(I) = 1.0
det(AB) vs det(A)det(B) 最大相对误差 = 5.7e-12  (<1e-10: True)
det(A) == prod(eig) : True
平行四边形面积(蒙特卡洛) = 10.01   det = 10.0
det(A+B) == det A + det B ? False`,
    note:`det_elim 里换行变号是第 1 步、倍加不变是第 2 步、主元乘积是第 3-4 步；三行公理检查对应"多线性、交替、归一"；1000 对随机矩阵是第 6 步乘法定理；蒙特卡洛面积是第 8 步几何意义。`
  },
  contrast:[
    {vs:`迹 tr A`,same:`都是相似不变量，都是特征值的对称函数（tr=Σλ，det=∏λ）`,diff:`迹是线性的（tr(A+B)=trA+trB），det 是 n 次的（det(kA)=kⁿdetA，det(A+B)≠…）`,when:`算总方差、总缩放率用迹；判可逆、算体积、换元雅可比用 det`},
    {vs:`范数 ‖A‖₂=σ₁`,same:`都是"矩阵有多大"的一个数`,diff:`det 是体积（所有方向缩放之积），范数是最大单方向缩放；diag(1e6,1e−6) det=1 但范数 1e6`,when:`问信息是否丢失看 det 是否为 0；问误差会被放大多少看范数/条件数`},
    {vs:`秩`,same:`det=0 ⟺ rank<n，两者都判奇异`,diff:`det 只对方阵定义、只区分"满/不满"；秩对任何形状定义、告诉你差几维`,when:`方阵快速判可逆用 det；非方阵或想知道"丢了几维"用秩`}
  ],
  ext:[
    {t:`二维 det 就是叉积的面积；三维是混合积`,go:`ge.area_cross`},
    {t:`多元换元积分的 |det J|：密度变换、normalizing flow 的对数行列式`,go:`gm.flow`},
    {t:`多元高斯的归一化常数 √det(2πΣ)`,go:`pr.gaussian`}
  ]
},

/* ================================================================== */
'la.matmul_shape': {
  layers:{
    alg:`C_ij=Σ_k A_ik B_kj，k 同时跑遍 A 的列和 B 的行，所以内维必须相等，结果是 (A 的行)×(B 的列)。`,
    geo:`四种同一件事：格子=行·列；AB 的第 j 列=A 作用于 B 的第 j 列；AB 的第 i 行=A 的第 i 行右乘 B；AB=Σ_k(A 第 k 列)(B 第 k 行) 秩 1 块之和。`,
    comp:`mnp 次乘加。BLAS 分块让数据留在缓存里；GPU 把 m×p 个格子并行。链式乘法的加括号顺序改变总 flops 几个数量级。`
  },
  proof:{
    from:`矩阵乘法公式 C_ij=Σ_k A_ik B_kj（矩阵即变换节点已推出）`,
    to:`形状规则、(AB)ᵀ=BᵀAᵀ、结合律、不交换、四种等价视角、计算代价 mnp`,
    steps:[
      [`k 在 Σ 里同时作为 A 的列标和 B 的行标 ⟹ A 列数 = B 行数；i 跑 A 的行、j 跑 B 的列 ⟹ C 是 m×p`,`求和下标必须对同一个范围求和，这就是"内维相消"的全部理由`],
      [`(AB)ᵀ_ij=(AB)_ji=Σ_k A_jk B_ki=Σ_k (Bᵀ)_ik (Aᵀ)_kj=(BᵀAᵀ)_ij`,`转置只交换下标；把两个因子交换书写顺序不改变数的乘积，但矩阵位置就反了`],
      [`结合律 ((AB)C)_ij=Σ_l(Σ_k A_ik B_kl)C_lj=Σ_k A_ik(Σ_l B_kl C_lj)=(A(BC))_ij`,`有限双重求和可以交换次序。等价说法：函数复合天然结合`],
      [`不交换：AB 和 BA 形状可能不同；即使同形，例如剪切与旋转`,`复合次序改变几何。[[0,−1],[1,0]][[1,1],[0,1]]=[[0,−1],[1,1]] 而反过来 =[[1,−1],[1,0]]`],
      [`列视角：AB 的第 j 列 = A·bⱼ；行视角：第 i 行 = aᵢᵀ·B`,`固定 j，C_ij=Σ_k A_ik B_kj 就是 A 乘向量 bⱼ；固定 i 同理。所以 X@W 是"对每个样本行做同一变换"`],
      [`外积视角：AB=Σ_k a_k b_kᵀ（列 k 乘行 k）`,`(a_k b_kᵀ)_ij=A_ik B_kj，对 k 求和正是公式。每项秩 1 ⟹ rank(AB)≤n；SVD 的 Σσuvᵀ 就是这种写法`],
      [`代价：m·p 个格子，每个 n 次乘加 ⟹ mnp`,`直接数。链乘 (X W₁) W₂ 与 X (W₁ W₂) 结果相同（第 3 步），代价 mnh+mhk 对 nhk+mnk，差别可达数量级`]
    ],
    end:`形状规则、转置反序、结合律都是同一个求和式的直接读法。向量化 = 把 for 循环写进这个求和，交给 BLAS/GPU 并行。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(8)
def matmul(A,B):
    m,n = A.shape; n2,p = B.shape
    assert n==n2, '内维不等 %d != %d' % (n,n2)         # 第1步
    return np.array([[sum(A[i,k]*B[k,j] for k in range(n)) for j in range(p)] for i in range(m)])
A,B,C = np.random.randn(3,4), np.random.randn(4,5), np.random.randn(5,2)
print('(3x4)(4x5) ->', matmul(A,B).shape, ' 与 @ 一致:', np.allclose(matmul(A,B), A@B))
try: matmul(B,A)
except AssertionError as e: print('(4x5)(3x4):', e)
print('(AB)^T == B^T A^T :', np.allclose((A@B).T, B.T@A.T), '   == A^T B^T ? 形状', (A.T).shape, (B.T).shape, '-> 根本乘不了')
print('(AB)C == A(BC) :', np.allclose((A@B)@C, A@(B@C)))
# 第5-6步：列视角 / 行视角 / 外积视角
print('第2列 == A @ b_2 :', np.allclose((A@B)[:,2], A@B[:,2]), ' 第1行 == a_1 @ B :', np.allclose((A@B)[1], A[1]@B))
print('sum_k outer(a_k, b_k) == AB :', np.allclose(sum(np.outer(A[:,k],B[k]) for k in range(4)), A@B))
P,Q = np.array([[0,-1],[1,0]]), np.array([[1,1],[0,1]]); print('PQ =', (P@Q).tolist(), ' QP =', (Q@P).tolist())
# 第7步：链乘代价 mnp
m,n,h,k = 1000,512,256,1
print('X(1000x512) W1(512x256) w(256x1):  (XW1)w 代价 =', m*n*h+m*h*k, '  X(W1w) 代价 =', n*h*k+m*n*k)
print('Hadamard A*A 与 A@A 不同:', not np.allclose(np.ones((2,2))*np.ones((2,2)), np.ones((2,2))@np.ones((2,2))))`,
    out:`(3x4)(4x5) -> (3, 5)  与 @ 一致: True
(4x5)(3x4): 内维不等 5 != 3
(AB)^T == B^T A^T : True    == A^T B^T ? 形状 (4, 3) (5, 4) -> 根本乘不了
(AB)C == A(BC) : True
第2列 == A @ b_2 : True  第1行 == a_1 @ B : True
sum_k outer(a_k, b_k) == AB : True
PQ = [[0, -1], [1, 1]]  QP = [[1, -1], [1, 0]]
X(1000x512) W1(512x256) w(256x1):  (XW1)w 代价 = 131328000   X(W1w) 代价 = 643072
Hadamard A*A 与 A@A 不同: True`,
    note:`assert 那行是第 1 步；(AB)ᵀ 是第 2 步；结合律是第 3 步；PQ/QP 是第 4 步；列/行/外积三行是第 5-6 步；代价对比是第 7 步：同一结果 flops 差 200 倍。`
  },
  contrast:[
    {vs:`逐元素乘 *（Hadamard）`,same:`numpy 里都写成一个运算符`,diff:`* 要求同形（或可广播）、无复合意义；@ 要求内维相等、是映射复合`,when:`掩码、门控、注意力 mask 用 *；层的前向、坐标变换用 @`},
    {vs:`广播 broadcasting`,same:`都是"一次算完一批"`,diff:`广播是把小数组复制到大形状再逐元素算；矩阵乘是求和收缩一个维度`,when:`加偏置 b、按列归一化用广播；线性变换用 @；einsum 可以两者兼顾`},
    {vs:`点积 x·y`,same:`点积 = (1×n)(n×1) 矩阵乘`,diff:`点积输出标量；矩阵乘是 m×p 个点积排成表`,when:`两向量相似度用点积；批量相似度矩阵 XYᵀ 用矩阵乘`}
  ],
  ext:[
    {t:`np.dot / @ / einsum 的形状约定与 BLAS`,go:`np.dot`},
    {t:`广播规则：什么时候能不写循环`,go:`np.broadcast`},
    {t:`注意力 QKᵀ/√d 就是一次 (n×d)(d×n) 批量点积`,go:`dl.attention`}
  ]
},

/* ================================================================== */
'la.orthogonal': {
  layers:{
    alg:`QᵀQ=I ⟺ 列两两垂直且长度 1。推论 Q⁻¹=Qᵀ、‖Qx‖=‖x‖、(Qx)·(Qy)=x·y、det=±1、|λ|=1。Gram–Schmidt 把任何独立列组变成 Q，副产品 A=QR。`,
    geo:`网格整体转动或翻面，每个格子仍是原大小的正方形。det=+1 是旋转，−1 是镜面反射。`,
    comp:`Householder 反射比 Gram–Schmidt 稳（经典 GS 会丢正交性，改进版 MGS 好些）。所有"数值稳定"算法（QR、SVD、Givens）都在用正交变换搬运误差而不放大。`
  },
  proof:{
    from:`QᵀQ=I 的定义；内积与投影`,
    to:`正交矩阵保内积、保长度；Q⁻¹=Qᵀ；det=±1；Gram–Schmidt 构造 Q 并给出 A=QR`,
    steps:[
      [`(QᵀQ)_ij=qᵢ·qⱼ，等于 δ_ij ⟺ 列标准正交`,`矩阵乘的格子=行·列，Qᵀ 的行就是 Q 的列。"正交矩阵"名字漏了"归一"，定义里有`],
      [`方阵时 QᵀQ=I ⟹ QQᵀ=I，Q⁻¹=Qᵀ`,`左逆存在 ⟹ 列独立 ⟹ 可逆 ⟹ 左逆=逆（逆矩阵节点第 4 步）。于是行也标准正交`],
      [`(Qx)·(Qy)=xᵀQᵀQy=x·y ⟹ ‖Qx‖=‖x‖，夹角不变`,`长度=√(x·x)，夹角由内积定。所以 Q 只能是旋转或反射，不能拉伸`],
      [`det Q=±1`,`det(QᵀQ)=det(Q)²=det I=1。+1 保持定向（旋转），−1 翻面（反射）`],
      [`特征值 |λ|=1`,`Qv=λv 取范数：‖v‖=|λ|‖v‖。实特征值只能 ±1，其余成对复数 e^{±iθ}（旋转角）`],
      [`Gram–Schmidt：q₁=a₁/‖a₁‖；q_k=(a_k−Σ_{j<k}(qⱼ·a_k)qⱼ)/‖·‖`,`减去的是 a_k 在已有 q₁…q_{k−1} 张成空间上的投影（投影节点第 8 步），剩下的自动垂直；a_k 独立于前面各列保证剩余非零可归一`],
      [`记 r_jk=qⱼ·a_k，r_kk=‖剩余‖，则 a_k=Σ_{j≤k} r_jk qⱼ，即 A=QR，R 上三角`,`把第 6 步的式子移项。每个 a_k 只用到 q₁…q_k，所以 R 在对角线下全 0`],
      [`为什么数值上值钱：cond(Q)=1；解 Ax=b ⟺ Rx=Qᵀb，cond(R)=cond(A)`,`σ 全为 1（第 3 步）。正规方程 AᵀA 的条件数是 cond(A)²，QR 避开了平方`]
    ],
    end:`正交矩阵是唯一不放大误差的变换，所以它是 QR、SVD、Householder 的通用零件。Gram–Schmidt 证明了任何独立列组都能被换成正交基而不丢信息（R 可逆记录换法）。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(9)
def gram_schmidt_qr(A):                 # 第6-7步（改进版 MGS）
    m,n = A.shape; Q = np.zeros((m,n)); R = np.zeros((n,n)); V = A.astype(float).copy()
    for k in range(n):
        for j in range(k):
            R[j,k] = Q[:,j]@V[:,k]; V[:,k] -= R[j,k]*Q[:,j]    # 减去对已有 q_j 的投影
        R[k,k] = np.linalg.norm(V[:,k]); Q[:,k] = V[:,k]/R[k,k]
    return Q,R
A = np.random.randn(6,4); Q,R = gram_schmidt_qr(A)
print('Q^T Q == I :', np.allclose(Q.T@Q, np.eye(4)), '  A == QR :', np.allclose(Q@R, A), '  R 上三角:', np.allclose(R, np.triu(R)))
print('|R 对角| 与 numpy qr 一致:', np.allclose(abs(np.diag(R)), abs(np.diag(np.linalg.qr(A)[1]))))
# 方阵正交矩阵的性质（第2-5步）
Qs,_ = gram_schmidt_qr(np.random.randn(5,5))
x,y = np.random.randn(5), np.random.randn(5)
print('Q Q^T == I :', np.allclose(Qs@Qs.T, np.eye(5)), '  ||Qx||==||x|| :', np.isclose(np.linalg.norm(Qs@x), np.linalg.norm(x)),
      '  (Qx).(Qy)==x.y :', np.isclose((Qs@x)@(Qs@y), x@y))
print('det Q = %.10f   |eig| =' % np.linalg.det(Qs), np.round(abs(np.linalg.eigvals(Qs)),8).tolist())
Rf = np.array([[1.,0],[0,-1]]); print('反射 det =', np.linalg.det(Rf), ' 旋转90 det =', np.linalg.det([[0,-1],[1,0]]))
# 第8步：条件数
Ab = np.random.randn(50,5)*np.array([1,1,1,1,1e-4])
print('cond(A)=%.1e  cond(A^T A)=%.1e  cond(R)=%.1e' % (np.linalg.cond(Ab), np.linalg.cond(Ab.T@Ab), np.linalg.cond(gram_schmidt_qr(Ab)[1])))
print('只垂直不归一:', np.allclose(np.array([[2,0],[0,3]]).T@np.array([[2,0],[0,3]]), np.eye(2)), '<- 不是正交矩阵')`,
    out:`Q^T Q == I : True   A == QR : True   R 上三角: True
|R 对角| 与 numpy qr 一致: True
Q Q^T == I : True   ||Qx||==||x|| : True   (Qx).(Qy)==x.y : True
det Q = 1.0000000000   |eig| = [1.0, 1.0, 1.0, 1.0, 1.0]
反射 det = -1.0  旋转90 det = 1.0
cond(A)=1.4e+04  cond(A^T A)=1.8e+08  cond(R)=1.4e+04
只垂直不归一: False <- 不是正交矩阵`,
    note:`gram_schmidt_qr 内层循环是第 6 步（减投影），R 的记录是第 7 步；方阵那三行是第 2-5 步；cond 那行是第 8 步：AᵀA 把条件数平方，R 不。最后一行是"正交≠归一"的陷阱。`
  },
  contrast:[
    {vs:`只正交不归一的矩阵（列垂直但长度≠1）`,same:`列两两垂直`,diff:`QᵀQ=D 对角而非 I，逆不是转置，会缩放长度`,when:`Gram–Schmidt 最后一步除以范数就是为了归一；忘了归一 Q⁻¹=Qᵀ 就错`},
    {vs:`对称矩阵 A=Aᵀ`,same:`都和转置有关系、都"长得整齐"`,diff:`对称说 A 等于自己的转置（形状/二次型）；正交说 A 的逆等于转置（旋转）。既对称又正交的只有反射类`,when:`协方差、Hessian 是对称；旋转、特征向量矩阵、QR 里的 Q 是正交`},
    {vs:`酉矩阵 U*U=I`,same:`复数版的正交矩阵，保复内积`,diff:`用共轭转置；特征值在单位圆上而不只是 ±1、e^{±iθ} 成对`,when:`DFT 矩阵、量子门用酉；实数据用正交`}
  ],
  ext:[
    {t:`SVD 的 U、V 都是正交矩阵：任何变换=正交·缩放·正交`,go:`la.svd`},
    {t:`QR 解最小二乘避免条件数平方`,go:`la.least_squares`},
    {t:`DFT 矩阵是酉矩阵：傅里叶变换保能量（Parseval）`,go:`fo.fft`}
  ]
},

/* ================================================================== */
'la.least_squares': {
  layers:{
    alg:`min ‖Ax−b‖²。展开成二次型，求导得正规方程 AᵀAx̂=Aᵀb；列独立时 x̂=(AᵀA)⁻¹Aᵀb。等价几何：残差 ⊥ col(A)。`,
    geo:`b 不在 A 的列空间里，找列空间中离 b 最近的点 Ax̂，残差是从 b 垂直落下的那根线。散点拟合直线就是这幅图投到 R^n。`,
    comp:`不解正规方程（条件数平方）。QR：Rx̂=Qᵀb 回代；病态或秩亏用 SVD 伪逆截断；超大规模用梯度下降/SGD 逼近同一个 x̂。`
  },
  proof:{
    from:`目标 f(x)=‖Ax−b‖²；梯度、凸性；投影节点`,
    to:`正规方程 AᵀAx̂=Aᵀb 是全局最优的充要条件；直线拟合公式；为什么工程上换 QR/SVD/岭回归`,
    steps:[
      [`f(x)=(Ax−b)ᵀ(Ax−b)=xᵀAᵀAx−2bᵀAx+bᵀb`,`展开内积；xᵀAᵀb 是标量等于自己的转置 bᵀAx，所以交叉项合并成 2 倍`],
      [`∇f=2AᵀAx−2Aᵀb`,`∇(xᵀMx)=2Mx（M 对称，这里 M=AᵀA），∇(cᵀx)=c（c=Aᵀb）。最小值处梯度为 0`],
      [`令 ∇f=0 ⟹ AᵀAx̂=Aᵀb`,`这是正规方程，来自微积分路线`],
      [`Hessian=2AᵀA ⪰ 0 ⟹ f 凸 ⟹ 驻点即全局最小；列独立时 AᵀA 正定 ⟹ 严格凸 ⟹ 唯一`,`xᵀAᵀAx=‖Ax‖²≥0；列独立时 Ax=0 只有 x=0，所以 >0。凸函数的驻点一定是全局最小，不会是鞍点`],
      [`几何路线：残差 r=b−Ax̂ ⊥ col(A) ⟺ Aᵀr=0 ⟺ 同一个正规方程`,`投影节点第 2-3 步：最近点的残差垂直子空间。两条独立路线汇到同一方程，互相印证`],
      [`直线拟合 y≈a x+c：A=[x 1]，正规方程是 2×2；先中心化 x̃=x−x̄ 则 AᵀA 对角，得 a=Sxy/Sxx，c=ȳ−a x̄`,`中心化让 Σx̃=0，交叉项消失，两个方程解耦。Sxy=Σx̃(y−ȳ)`],
      [`条件数：σ(AᵀA)=σ(A)² ⟹ cond(AᵀA)=cond(A)²`,`AᵀA=VΣ²Vᵀ（SVD 节点）。cond=1e4 的 A 变成 1e8 的方程，双精度丢一半有效数字。改用 QR（Rx̂=Qᵀb）或 SVD（x̂=VΣ⁺Uᵀb）`],
      [`列相关 ⟹ AᵀA 奇异 ⟹ x̂ 不唯一；加 λ‖x‖² 得 (AᵀA+λI)x̂=Aᵀb`,`对 f+λ‖x‖² 重做第 2 步多出 2λx；AᵀA+λI 的特征值 ≥λ>0 恒可逆。这就是岭回归，也是"最小范数解"的平滑版`]
    ],
    end:`最小二乘=投影=凸二次型的驻点，三条路线一条方程。线性回归、曲线拟合、校准、去卷积全是它；数值上永远 QR/SVD，共线就加正则。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(10)
x = np.linspace(0,5,30); y = 1.5*x + 2 + np.random.randn(30)*0.5
A = np.column_stack([x, np.ones(30)])
# 路线1：正规方程（第3步）
x_ne = np.linalg.solve(A.T@A, A.T@y)
# 路线2：中心化公式（第6步）
a = ((x-x.mean())*(y-y.mean())).sum()/((x-x.mean())**2).sum(); c = y.mean()-a*x.mean()
# 路线3：QR（第7步）
Q,R = np.linalg.qr(A); x_qr = np.linalg.solve(R, Q.T@y)
# 路线4：梯度下降（第2步的梯度）
w = np.zeros(2); lr = 0.01
for _ in range(20000): w -= lr*(2*A.T@(A@w-y))/30
x_np = np.linalg.lstsq(A, y, rcond=None)[0]
print('正规方程 =', np.round(x_ne,6).tolist()); print('中心化公式=', [round(a,6), round(c,6)])
print('QR       =', np.round(x_qr,6).tolist()); print('梯度下降  =', np.round(w,6).tolist()); print('np.lstsq =', np.round(x_np,6).tolist())
r = y - A@x_ne
print('残差 ⊥ 列空间 A^T r = %.1e' % abs(A.T@r).max(), '  Hessian 特征值 =', np.round(np.linalg.eigvalsh(2*A.T@A),3).tolist(), '(全正 -> 严格凸)')
print('扰动 x_hat 任意方向，损失只会变大:', all(np.linalg.norm(A@(x_ne+d)-y) > np.linalg.norm(r) for d in np.random.randn(1000,2)*0.1))
# 第7-8步：条件数平方 与 岭回归
B = np.column_stack([x, x+1e-4*np.random.randn(30)])      # 两列几乎共线
print('cond(B)=%.1e  cond(B^T B)=%.1e' % (np.linalg.cond(B), np.linalg.cond(B.T@B)))
print('岭 lambda=1 后 cond=%.1e' % np.linalg.cond(B.T@B + 1*np.eye(2)))`,
    out:`正规方程 = [1.54459, 1.98752]
中心化公式= [np.float64(1.54459), np.float64(1.98752)]
QR       = [1.54459, 1.98752]
梯度下降  = [1.54459, 1.98752]
np.lstsq = [1.54459, 1.98752]
残差 ⊥ 列空间 A^T r = 7.5e-14   Hessian 特征值 = [14.468, 554.153] (全正 -> 严格凸)
扰动 x_hat 任意方向，损失只会变大: True
cond(B)=6.3e+04  cond(B^T B)=4.0e+09
岭 lambda=1 后 cond=5.1e+02`,
    note:`四条路线分别是第 3 步（正规方程）、第 6 步（中心化公式）、第 7 步（QR）、第 2 步（梯度下降用的正是 ∇f）；残差和 Hessian 那行对应第 4-5 步；最后两行是第 7-8 步条件数平方与岭回归。`
  },
  contrast:[
    {vs:`投影`,same:`同一几何：Ax̂ 就是 b 的投影`,diff:`投影输出子空间里的点 p（唯一）；最小二乘输出系数 x̂（列相关时不唯一）`,when:`要拟合值/去噪看 p；要可解释的系数看 x̂，并检查共线`},
    {vs:`极大似然 MLE`,same:`高斯噪声下 MLE 就是最小二乘`,diff:`最小二乘是几何/优化陈述，不需要概率假设；MLE 需要噪声模型，噪声换成拉普拉斯就变成最小绝对值`,when:`只想拟合用最小二乘；要置信区间、检验、比较模型走 MLE`},
    {vs:`梯度下降`,same:`都在最小化同一个 ‖Ax−b‖²`,diff:`最小二乘有闭式解（一次 QR）；梯度下降是迭代逼近，用于数据太大装不下或加了非线性`,when:`n·d 能放进内存用 QR/SVD；否则 SGD；有非线性层只能梯度`}
  ],
  ext:[
    {t:`线性回归 = 最小二乘 + 统计解释`,go:`ml.linear_reg`},
    {t:`岭回归/正则化：加 λ‖x‖² 让奇异的 AᵀA 变可逆`,go:`op.regularization`},
    {t:`梯度下降在二次型上的收敛率由 cond(AᵀA) 决定`,go:`ml.gradient_descent`},
    {t:`高斯噪声下最小二乘就是极大似然`,go:`pr.mle`}
  ]
},

/* ================================================================== */
'la.null_space': {
  layers:{
    alg:`null(A)={x:Ax=0}，是子空间。dim=n−rank。null(A)=row(A)⊥。Ax=b 的通解=特解+null(A)，唯一 ⟺ null={0}。`,
    geo:`三维空间被拍扁到一个平面，与平面垂直的那整条直线全落到原点。零空间就是"被压没"的方向，垂直于行空间。`,
    comp:`不用消元找自由变量（舍入不稳）。SVD：σᵢ≈0 对应的 vᵢ 就是零空间的正交基；scipy 的 null_space 也这么做。`
  },
  proof:{
    from:`定义 null(A)={x:Ax=0}；秩-零化度；SVD`,
    to:`null(A) 是子空间；null(A)=row(A)⊥；dim=n−rank；通解=特解+零空间；SVD 直接给出基`,
    steps:[
      [`null(A) 对加法数乘封闭，是子空间`,`Ax=0，Ay=0 ⟹ A(αx+βy)=αAx+βAy=0。所以有维数、有基`],
      [`x∈null(A) ⟺ x ⊥ A 的每一行`,`(Ax)_i = 第 i 行·x。Ax=0 就是 n 个点积全为 0`],
      [`⟹ null(A)=row(A)⊥`,`垂直于每一行 ⟹ 垂直于行的任何线性组合（内积线性），即垂直整个行空间；反过来行空间的正交补自然满足每行·x=0`],
      [`Rⁿ=row(A)⊕row(A)⊥ ⟹ dim null=n−dim row=n−rank`,`任何子空间与其正交补直和为全空间（投影节点：x=Px+(I−P)x）；行秩=列秩=rank（秩节点第 8 步）`],
      [`若 Ax_p=b，则 Ax=b ⟺ x−x_p∈null(A)`,`A(x−x_p)=Ax−Ax_p=b−b=0。解集是 x_p 平移零空间得到的仿射子空间，不再是子空间（不过原点）`],
      [`解唯一 ⟺ null(A)={0} ⟺ 列独立`,`第 5 步：解集大小=零空间大小。列独立 ⟺ Ax=0 只有零解`],
      [`SVD A=UΣVᵀ：σᵢ=0 ⟹ Avᵢ=σᵢuᵢ=0，故 v_{r+1}…vₙ 是 null(A) 的正交基；v₁…v_r 是 row(A) 的正交基`,`Avᵢ=σᵢuᵢ 是 SVD 的定义式；n−r 个正交向量恰好凑够第 4 步的维数；V 正交所以两组互相垂直，正是第 3 步`],
      [`四个子空间：null(Aᵀ)=col(A)⊥，Ax=b 有解 ⟺ b ⊥ null(Aᵀ)`,`对 Aᵀ 重复第 3 步。b∈col(A) ⟺ b 垂直 col(A) 的正交补。这是 Fredholm 择一`]
    ],
    end:`零空间是"输入侧被抹掉的信息"，永远垂直于行空间，维数由 n−rank 守恒给出。解方程是否唯一、回归系数是否可辨识、网络有没有冗余方向，都是在问零空间是不是 {0}。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(11)
def null_space(A, tol=1e-10):           # 第7步
    U,s,Vt = np.linalg.svd(A); r = int((s>tol).sum()); return Vt[r:].T, Vt[:r].T, r
B = np.random.randn(4,3); A = np.column_stack([B, B@[1,-1,2], B@[0,3,1]])   # 4x5，秩 3
N, Rw, r = null_space(A)
print('rank =', r, ' nullity =', N.shape[1], ' n =', A.shape[1], ' rank+nullity==n:', r+N.shape[1]==A.shape[1])
print('A @ N ≈ 0 : %.1e' % abs(A@N).max())
print('N ⊥ 每一行  A rows . N = %.1e' % abs(A@N).max(), '  N ⊥ 行空间基 = %.1e' % abs(Rw.T@N).max())
# 第1步：零空间对组合封闭
z = N@np.random.randn(2); print('零空间任意组合仍映到0: %.1e' % abs(A@z).max())
# 第5步：通解 = 特解 + 零空间
b = A@np.array([1,2,3,4,5.]); xp = np.linalg.lstsq(A, b, rcond=None)[0]
print('特解 A x_p == b :', np.allclose(A@xp, b))
for t in np.random.randn(3,2): print('  x_p + N t 也解 Ax=b :', np.allclose(A@(xp+N@t), b), ' 与 x_p 相差 %.3f' % np.linalg.norm(N@t))
# 第8步：b 不在列空间时无解，且 b 不垂直 null(A^T)
LN,_,_ = null_space(A.T); b2 = b + LN[:,0]
print('dim null(A^T) =', LN.shape[1], ' b2 . null(A^T) = %.3f -> 残差 %.3f (无解)' % (b2@LN[:,0], np.linalg.norm(A@np.linalg.lstsq(A,b2,rcond=None)[0]-b2)))
print('[[1,2],[2,4]] 的零空间 ∝', np.round(null_space(np.array([[1.,2],[2,4]]))[0][:,0]/null_space(np.array([[1.,2],[2,4]]))[0][0,0],6).tolist())`,
    out:`rank = 3  nullity = 2  n = 5  rank+nullity==n: True
A @ N ≈ 0 : 6.2e-16
N ⊥ 每一行  A rows . N = 6.2e-16   N ⊥ 行空间基 = 1.1e-16
零空间任意组合仍映到0: 2.0e-16
特解 A x_p == b : True
  x_p + N t 也解 Ax=b : True  与 x_p 相差 1.720
  x_p + N t 也解 Ax=b : True  与 x_p 相差 1.739
  x_p + N t 也解 Ax=b : True  与 x_p 相差 0.684
dim null(A^T) = 1  b2 . null(A^T) = 1.000 -> 残差 1.000 (无解)
[[1,2],[2,4]] 的零空间 ∝ [1.0, -0.5]`,
    note:`null_space 用 SVD 是第 7 步；rank+nullity 是第 4 步；N⊥行 是第 2-3 步；组合封闭是第 1 步；x_p+Nt 三行是第 5 步；b2 那行是第 8 步 Fredholm 择一（b 不垂直 null(Aᵀ) 就无解）。`
  },
  contrast:[
    {vs:`行空间 row(A) 与列空间 col(A)`,same:`维数都等于 rank`,diff:`行空间在输入侧 Rⁿ，是零空间的正交补；列空间在输出侧 Rᵐ，是 b 能取到的集合。它们住在不同空间里`,when:`问"哪些输入有区别/被抹掉"看行空间/零空间；问"哪些 b 能达到"看列空间/左零空间`},
    {vs:`左零空间 null(Aᵀ)`,same:`都是"被送到 0 的方向"`,diff:`null(A) 是输入被压没；null(Aᵀ)=col(A)⊥ 是输出侧够不着的方向`,when:`解是否唯一看 null(A)；解是否存在看 b 是否 ⊥ null(Aᵀ)`},
    {vs:`核 kernel（抽象代数）`,same:`同一个东西：线性映射的核=矩阵的零空间`,diff:`只是叫法，核用于一般线性映射/群同态，零空间指具体矩阵`,when:`读抽象代数或泛函看 kernel；算矩阵时说 null space`}
  ],
  ext:[
    {t:`方程组解的结构：唯一/无穷/无解由零空间和列空间决定`,go:`al.system_eq`},
    {t:`回归特征共线 = 设计矩阵零空间非零，系数不可辨识`,go:`ml.linear_reg`},
    {t:`秩-零化度：维数守恒`,go:`la.rank`}
  ]
}

});
