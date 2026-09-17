// data/derive_fo.js —— 傅里叶与信号大陆 · 推导层（9 节点）
// 契约：CONTRACT3.md。旁挂，不改 v1/v2 文件。scratch 全部用 python3 + numpy 2.3 实际跑过。
window.DERIVE = window.DERIVE || {};
Object.assign(window.DERIVE, {

/* ================================================================== */
'fo.eigenfunction': {
  layers:{
    alg:`LTI 系统 = 卷积算子 T[x](t)=∫h(τ)x(t−τ)dτ。喂 x=e^{jωt}，得 T[x]=H(ω)·e^{jωt}，H(ω)=∫h(τ)e^{−jωτ}dτ。这是特征方程 Tv=λv，v 是复指数，λ 是 H(ω)。`,
    geo:`把复指数想成匀速转动的指针。任何延迟只让指针"晚出发"一个固定角度——形状完全不变。卷积是无数个延迟副本的加权叠加，一堆同频指针相加还是同频指针，只是长度和起始角变了。`,
    comp:`循环卷积是一个循环矩阵 C。机器算 F·C·F⁻¹ 会得到对角阵，对角线就是 fft(h)。所以"过 LTI 系统"= fft → 逐点乘 H → ifft，三步，中间那步没有任何频率间的串扰。`
  },
  proof:{
    from:`线性（叠加原理）+ 时不变（输入延迟 τ ⇒ 输出延迟 τ）+ 卷积表示 y=h*x；指数律 e^{a+b}=e^a e^b`,
    to:`e^{jωt} 是所有 LTI 系统的公共特征函数，特征值 H(ω)=∫h(τ)e^{−jωτ}dτ；且时移只贡献相位因子`,
    steps:[
      [`把任意输入写成冲激的叠加 x(t)=∫x(τ)δ(t−τ)dτ`,`δ 的筛选性质；这是"把信号拆成一堆尖峰"的严格写法`],
      [`线性 + 时不变 ⇒ 每个 x(τ)δ(t−τ) 的响应是 x(τ)h(t−τ)，叠加得 y(t)=∫x(τ)h(t−τ)dτ=(h*x)(t)`,`时不变保证 δ(t−τ) 的响应是 h 平移 τ；线性保证权重 x(τ) 可以提出来并把积分（无穷求和）搬到系统外`],
      [`令 x(t)=e^{jωt}，换元写成 y(t)=∫h(τ)e^{jω(t−τ)}dτ`,`卷积可交换 h*x=x*h，选把 h 放在积分变量上，方便下一步分离`],
      [`利用 e^{jω(t−τ)}=e^{jωt}·e^{−jωτ}，把与 τ 无关的 e^{jωt} 提出积分号：y(t)=e^{jωt}·∫h(τ)e^{−jωτ}dτ`,`指数律。这一步是全部关键：只有指数函数满足 f(t−τ)=f(t)·g(τ)（柯西函数方程的连续解），多项式、方波都不满足，所以提不出来`],
      [`剩下的积分与 t 无关，记 H(ω)=∫h(τ)e^{−jωτ}dτ，于是 y=H(ω)·x`,`输入 × 常数 = 输出，正是特征向量定义 Tv=λv；H(ω) 是 h 的傅里叶变换，对每个 ω 是一个复数`],
      [`|H| 改幅度、∠H 改相位：H e^{jωt}=|H|e^{j(ωt+∠H)}`,`复数极坐标形式；频率 ω 原封不动，因为 t 的系数没变`],
      [`推论（时移定理）：若 x(t) 的谱是 X(ω)，则 x(t−d) 的谱是 e^{−jωd}X(ω)`,`x(t−d)=∫X(ω)e^{jω(t−d)}dω/2π，同样把 e^{−jωd} 拆出来；模 |X| 不变，只加线性相位 −ωd`],
      [`反面：非线性（如 ReLU）不满足叠加，第 2 步失效，输出会含 2ω、3ω 等新频率`,`特征函数性质是从线性 + 时不变两条推出来的，缺一条整条链断掉；谐波族是"系统非线性"的指纹`]
    ],
    end:`复指数在"延迟"下只差一个常数因子，而 LTI 系统只做延迟 + 加权求和，所以复指数穿过任何 LTI 系统都只被乘一个复数 H(ω)。这就是频域存在的理由：在这组基下所有 LTI 系统同时对角化。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
N = 256; n = np.arange(N)
h = np.random.randn(9); h /= np.abs(h).sum()            # 随机 9 抽头 LTI 系统（循环卷积）
def lti(x): return np.array([sum(h[m]*x[(t-m)%N] for m in range(len(h))) for t in range(N)])
# 1) 复指数输入：输出 / 输入 应是与 t 无关的常数 H(k)
for k in [3, 20]:
    x = np.exp(2j*np.pi*k*n/N); y = lti(x); ratio = y/x
    Hk = sum(h[m]*np.exp(-2j*np.pi*k*m/N) for m in range(len(h)))
    print(f'k={k:2d}  ratio 波动 {np.abs(ratio-ratio[0]).max():.2e}  ratio[0]={ratio[0]:.6f}  H(k)={Hk:.6f}')
# 2) 时移只带相位因子：x 延迟 d 后，谱逐点乘 e^{-j2πkd/N}，模不变
x = np.random.randn(N); d = 7
Xs = np.fft.fft(np.roll(x, d)); X = np.fft.fft(x)
print('时移后 |X| 最大变化:', f'{np.abs(np.abs(Xs)-np.abs(X)).max():.2e}', ' 与 X·e^{-j2πkd/N} 最大差:', f'{np.abs(Xs - X*np.exp(-2j*np.pi*n*d/N)).max():.2e}')
# 3) 非线性系统会长出新频率
k = 10; x = np.cos(2*np.pi*k*n/N); y = np.maximum(x, 0)          # ReLU
mag = np.abs(np.fft.fft(y))[:N//2]; peaks = np.where(mag > 1e-9)[0]
print('ReLU 后非零频率 bin:', peaks[:6].tolist(), '...  (输入只有 bin 10)')`,
    out:`k= 3  ratio 波动 1.18e-15  ratio[0]=0.724496-0.119650j  H(k)=0.724496-0.119650j
k=20  ratio 波动 4.59e-15  ratio[0]=0.233970-0.491896j  H(k)=0.233970-0.491896j
时移后 |X| 最大变化: 1.42e-14  与 X·e^{-j2πkd/N} 最大差: 1.63e-13
ReLU 后非零频率 bin: [0, 4, 8, 10, 12, 16] ...  (输入只有 bin 10)`,
    note:`ratio 波动 ~1e-15 是第 5 步（输出/输入 = 与 t 无关的常数），ratio[0] 与手算 H(k) 一致是 H 的定义式；时移段是第 7 步；ReLU 段是第 8 步的反例。`
  },
  contrast:[
    {vs:`矩阵特征向量 Av=λv（la.eigen）`,same:`同一个定义：算子作用后只被缩放`,diff:`矩阵的特征向量随矩阵而变；复指数是所有 LTI 算子的公共特征函数，与 h 无关（循环矩阵都被同一个 F 对角化）`,when:`一般线性变换要各自求特征向量；只要系统是 LTI，不用算，直接用 FFT`},
    {vs:`实正弦 cos(ωt)`,same:`都是"频率 ω 的信号"`,diff:`cos 过 LTI 系统会变成 A·cos(ωt+φ)，本身不是特征函数（sin 与 cos 会耦合）；e^{jωt} 才是。cos 是两个特征函数 (e^{jωt}+e^{−jωt})/2 的叠加`,when:`推导用复指数，读数据取实部`},
    {vs:`时变线性系统（增益漂移、荧光漂白）`,same:`都满足叠加原理`,diff:`时不变不成立时第 2 步的 h(t−τ) 变成 h(t,τ)，e^{jωt} 提不出来，系统会产生新频率`,when:`慢时变用短时分析分段近似 LTI；快时变放弃频域求解`},
    {vs:`拉普拉斯变换的 e^{st}, s=σ+jω`,same:`e^{st} 同样是 LTI 系统的特征函数，H(s) 是特征值`,diff:`傅里叶只看 σ=0 的虚轴；拉普拉斯多一维 σ，能处理不衰减/发散信号并直接读稳定性`,when:`稳态频响用傅里叶；瞬态、稳定性、极点用拉普拉斯`}
  ],
  ext:[
    {t:`把这组特征函数当基，DFT 就是换基矩阵`,go:`fo.basis`},
    {t:`特征值逐点相乘 ⇒ 卷积定理`,go:`fo.convolution`},
    {t:`H(ω) 的模与相位就是滤波器`,go:`fo.filter`},
    {t:`一般线性算子的特征向量`,go:`la.eigen`}
  ]
},

/* ================================================================== */
'fo.basis': {
  layers:{
    alg:`DFT 矩阵 F[k,n]=e^{−j2πkn/N}，X=Fx。列（也是行）两两正交：F*F=N·I，所以 x=F*X/N。X[k] 是 x 在第 k 个复指数上的投影系数（乘了 N）。Parseval 是"酉矩阵保长度"。`,
    geo:`同一个向量，坐标轴换了。时域基是 N 个单位冲激（每个时刻一根轴），频域基是 N 个转速不同的指针。向量没动，读数变了；长度当然不变。`,
    comp:`np.fft.fft(x) 数值上等于 F @ x，O(N²) 矩阵乘的快速版。逆变换 np.fft.ifft 用的是 F 的共轭再除 N；numpy 把 1/N 全放在 ifft 里，不同库约定不同。`
  },
  proof:{
    from:`复指数向量 e_k[n]=e^{j2πkn/N}，k,n=0..N−1；等比数列求和；内积 <u,v>=Σ conj(u[n]) v[n]`,
    to:`{e_k} 是 C^N 的正交基；DFT 系数是正交投影；F*F=N·I；Parseval Σ|x|²=(1/N)Σ|X|²`,
    steps:[
      [`算两根基向量的内积 <e_k,e_m>=Σₙ e^{j2π(m−k)n/N}`,`按内积定义，第一项取共轭把 e^{j2πkn/N} 变成 e^{−j2πkn/N}，两个指数合并`],
      [`若 k=m，每项都是 1，和为 N；若 k≠m，令 r=e^{j2π(m−k)/N}≠1，等比和 (r^N−1)/(r−1)=(1−1)/(r−1)=0`,`r^N=e^{j2π(m−k)}=1 因为 m−k 是整数；r≠1 因为 0<|m−k|<N。分母不为零，分子为零`],
      [`所以 <e_k,e_m>=N·δ_km：N 个向量两两正交，非零，故线性无关，在 N 维空间里构成一组基`,`N 个两两正交的非零向量必线性无关（对线性组合与每个 e_k 做内积即知系数全零）；N 维空间里 N 个无关向量张成全空间`],
      [`任意 x 展开 x=Σₖ c_k e_k，两边与 e_k 做内积：<e_k,x>=c_k·N，故 c_k=<e_k,x>/N=(1/N)Σₙ x[n]e^{−j2πkn/N}`,`正交性让交叉项全部消失，系数只需一次内积——这就是正交投影公式 c=<e,x>/<e,e>`],
      [`定义 X[k]=Σₙ x[n]e^{−j2πkn/N}=N·c_k，写成矩阵 X=Fx，F[k,n]=e^{−j2πkn/N}；逆变换 x[n]=(1/N)ΣₖX[k]e^{j2πkn/N}`,`X 只是投影系数省掉 1/N；逆变换就是第 4 步的展开式`],
      [`第 3 步用矩阵写就是 F*F=N·I，即 F/√N 是酉矩阵，F⁻¹=F*/N`,`F 的第 k 行是 conj(e_k)ᵀ，F*F 的 (k,m) 元恰是 <e_k,e_m>`],
      [`Parseval：‖X‖²=X*X=x*F*Fx=N·x*x，即 Σ|X[k]|²=N·Σ|x[n]|²`,`酉矩阵保内积；1/N 的位置取决于归一化约定，numpy 下是 Σ|x|²=(1/N)Σ|X|²`],
      [`隐含假设：e_k 以 N 为周期，所以 DFT 把 x 看成周期延拓。首尾不连续 ⇒ 延拓信号有跳变 ⇒ 谱里出现宽带泄漏`,`基向量本身周期为 N，任何用它们表示的信号都被当作周期信号；这是窗函数（fo.window）存在的根源`]
    ],
    end:`DFT 不是"算法"，是换到一组正交基下的坐标。正交让系数可以各自独立地用一次内积算出来，可逆保证不丢信息，酉保证不改长度。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
N = 64; n = np.arange(N)
F = np.exp(-2j*np.pi*np.outer(n, n)/N)                    # DFT 矩阵 F[k,n]
x = np.random.randn(N) + 1j*np.random.randn(N)
X = F @ x                                                 # 手写 DFT = 矩阵乘
print('手写 DFT vs np.fft.fft 最大差:', f'{np.abs(X - np.fft.fft(x)).max():.2e}')
G = F.conj().T @ F                                        # 正交性：F*F = N·I
print('F*F 与 N·I 最大差:', f'{np.abs(G - N*np.eye(N)).max():.2e}')
x_back = F.conj().T @ X / N                               # 逆变换 = 共轭转置 / N
print('逆变换还原误差:', f'{np.abs(x_back - x).max():.2e}')
print('Parseval  Σ|x|² =', round(np.sum(np.abs(x)**2), 6), '  (1/N)Σ|X|² =', round(np.sum(np.abs(X)**2)/N, 6))
# 系数就是投影：X[k]/N 等于 x 在单位基向量 e_k 上的坐标
k = 5; e_k = np.exp(2j*np.pi*k*n/N)
print('投影系数 <x,e_k>/<e_k,e_k> =', np.round(np.vdot(e_k, x)/np.vdot(e_k, e_k), 6), '  X[k]/N =', np.round(X[k]/N, 6))`,
    out:`手写 DFT vs np.fft.fft 最大差: 3.81e-13
F*F 与 N·I 最大差: 3.15e-13
逆变换还原误差: 2.64e-14
Parseval  Σ|x|² = 140.506176   (1/N)Σ|X|² = 140.506176
投影系数 <x,e_k>/<e_k,e_k> = (0.043471-0.286569j)   X[k]/N = (0.043471-0.286569j)`,
    note:`F@x vs fft 是第 5 步；F*F=N·I 是第 3、6 步；F*X/N 还原是逆变换；Parseval 是第 7 步；最后一行直接验证第 4 步"系数 = 投影 <e_k,x>/<e_k,e_k>"。`
  },
  contrast:[
    {vs:`一般换基 P⁻¹x（la.basis）`,same:`都是同一向量在另一组基下的坐标`,diff:`一般基要解线性方程组求坐标（O(N³)）；正交基每个系数一次内积即可（O(N²)，FFT 后 O(N log N)），且不放大误差`,when:`基能选正交就选正交；正弦基额外附赠"卷积对角化"`},
    {vs:`连续傅里叶变换 X(ω)=∫x(t)e^{−jωt}dt`,same:`同一个投影思想，内积换成积分`,diff:`DFT 只有 N 个离散频率、隐含周期延拓、频率分辨率 fs/N；连续变换频率连续、无周期假设`,when:`推公式用连续；算数据只能 DFT，并记住它在看周期延拓后的信号`},
    {vs:`PCA/SVD 的主成分基（ml.pca）`,same:`都是正交基下的投影系数`,diff:`PCA 的基由数据协方差决定，随数据变；傅里叶基是固定的，与数据无关`,when:`平稳信号/LTI 系统用固定的傅里叶基；想找数据自己的主方向用 PCA`},
    {vs:`逆 DFT 的归一化`,same:`正逆变换都是矩阵乘 F 或 F*`,diff:`1/N 放正变换、逆变换或两边各 1/√N 三种约定，幅值差 N 或 √N 倍`,when:`跨库比幅值前先查 norm 参数；只看形状不看绝对值时无所谓`}
  ],
  ext:[
    {t:`利用 F 的对称性把 N² 砍到 N log N`,go:`fo.fft`},
    {t:`基向量周期延拓带来的泄漏 ⇒ 窗函数`,go:`fo.window`},
    {t:`旋转因子就是 n 次单位根`,go:`cx.roots_unity`},
    {t:`正交投影的一般理论`,go:`la.projection`}
  ]
},

/* ================================================================== */
'fo.fft': {
  layers:{
    alg:`把 X[k]=Σₙx[n]W^{kn} 按 n 奇偶拆成 E[k]+W^k·O[k]，E、O 是两个长 N/2 的 DFT。对称性 W^{k+N/2}=−W^k 给出 X[k+N/2]=E[k]−W^k·O[k]：一次算两个输出。T(N)=2T(N/2)+N/2 ⇒ (N/2)log₂N 次复乘。`,
    geo:`N 次单位根在圆上均匀分布；平方一次它们变成 N/2 次单位根（两两重合）。所以偶数项和奇数项各自只需要 N/2 个方向——递归下去每层都是"把圆对折"。`,
    comp:`递归到长度 1 直接返回；每层合并做 N/2 次乘加（蝶形）；log₂N 层。numpy 的 pocketfft 对小素因子也做类似分解，但 N 是大素数时只能退回 O(N²) 或 Bluestein。`
  },
  proof:{
    from:`DFT 定义 X[k]=Σₙ x[n]W_N^{kn}，W_N=e^{−j2π/N}；N=2^m；单位根性质 W_N²=W_{N/2}，W_N^{N/2}=−1`,
    to:`FFT 是精确同一个 DFT，复乘次数 (N/2)log₂N`,
    steps:[
      [`把求和按 n 的奇偶拆开：X[k]=Σ_{m}x[2m]W_N^{2mk}+Σ_{m}x[2m+1]W_N^{(2m+1)k}，m=0..N/2−1`,`有限和可任意重排；N 是偶数保证奇偶两半等长`],
      [`W_N^{2mk}=(W_N²)^{mk}=W_{N/2}^{mk}，于是第一项是 x 偶数项的长 N/2 DFT，记 E[k]；第二项提出 W_N^k 后是奇数项的 DFT，记 O[k]`,`W_N²=e^{−j4π/N}=e^{−j2π/(N/2)}=W_{N/2}。这一步把一个长 N 的问题化成两个长 N/2 的同类问题——分治成立的前提`],
      [`得 X[k]=E[k]+W_N^k·O[k]，k=0..N/2−1`,`直接代回。这样只算出前一半输出`],
      [`对 k+N/2：E、O 周期为 N/2，所以 E[k+N/2]=E[k]，O[k+N/2]=O[k]；而 W_N^{k+N/2}=W_N^k·W_N^{N/2}=−W_N^k`,`W_N^{N/2}=e^{−jπ}=−1（单位根转半圈）。周期性 + 对称性使后一半输出可以复用前一半的 E、O`],
      [`故 X[k+N/2]=E[k]−W_N^k·O[k]。一个乘积 W_N^k·O[k] 同时服务两个输出：蝶形`,`同一个乘积一加一减，乘法次数减半。没有这条对称性就只能省重排、省不了乘法`],
      [`复乘计数 T(N)=2T(N/2)+N/2，T(1)=0。展开：T(N)=N/2·log₂N`,`每层合并 N/2 次乘，递归 log₂N 层；每层总长度都是 N，所以每层代价恒为 N/2。主定理 case 2`],
      [`对比朴素 DFT 的 N² 次复乘：N=4096 时 16777216 vs 24576，快 683 倍`,`两者算的是同一个矩阵乘 Fx，只是利用 F 的结构避免重复；结果在浮点误差内相同，且 FFT 误差更小（累加次数少）`],
      [`边界：N 非 2 的幂时按其他素因子分解（混合基）；N 是大素数时无分解可用，退化为 O(N²)。补零到 2 的幂只是对同一谱插值，不增加分辨率`,`分辨率 fs/N 由真实采样点数决定；补零等于把周期延拓信号加了一段零再做 DFT，只是在原谱的 sinc 插值上多采了几个点`]
    ],
    end:`FFT 快的全部原因是单位根的两条性质：平方后还是单位根（分治成立）、转半圈变号（一次乘法服务两个输出）。它不是近似，是同一个 DFT 的更少重复的算法。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
ops = {'dft':0, 'fft':0}
def dft(x):
    N = len(x); n = np.arange(N)
    ops['dft'] += N*N                                     # N² 次复乘
    return np.exp(-2j*np.pi*np.outer(n, n)/N) @ x
def fft(x):
    N = len(x)
    if N == 1: return x.copy()
    E, O = fft(x[0::2]), fft(x[1::2])                     # 分治：偶数项、奇数项
    W = np.exp(-2j*np.pi*np.arange(N//2)/N)               # 旋转因子
    ops['fft'] += N//2                                    # 每层 N/2 次复乘
    return np.concatenate([E + W*O, E - W*O])             # 蝶形：对称性 W^{k+N/2} = -W^k
for N in [64, 1024, 4096]:
    ops['dft'] = ops['fft'] = 0
    x = np.random.randn(N) + 1j*np.random.randn(N)
    a, b, c = dft(x), fft(x), np.fft.fft(x)
    print(f'N={N:5d}  递归FFT vs numpy {np.abs(b-c).max():.1e}  朴素DFT vs numpy {np.abs(a-c).max():.1e}  复乘数 DFT={ops["dft"]:>9d}  FFT={ops["fft"]:>6d}  (N/2·log2N={N//2*int(np.log2(N))})')`,
    out:`N=   64  递归FFT vs numpy 8.9e-15  朴素DFT vs numpy 3.8e-13  复乘数 DFT=     4096  FFT=   192  (N/2·log2N=192)
N= 1024  递归FFT vs numpy 7.1e-14  朴素DFT vs numpy 2.2e-11  复乘数 DFT=  1048576  FFT=  5120  (N/2·log2N=5120)
N= 4096  递归FFT vs numpy 1.6e-13  朴素DFT vs numpy 2.2e-10  复乘数 DFT= 16777216  FFT= 24576  (N/2·log2N=24576)`,
    note:`fft() 里 x[0::2]/x[1::2] 是第 1、2 步的奇偶分治；concatenate([E+W*O, E−W*O]) 是第 3～5 步的蝶形；ops 计数验证第 6、7 步的 N/2·log₂N vs N²。`
  },
  contrast:[
    {vs:`朴素 DFT（矩阵乘 F@x）`,same:`输出完全相同（误差 ~1e-13）`,diff:`DFT 做 N² 次乘；FFT 利用对称性做 (N/2)log₂N 次；N=4096 差 683 倍`,when:`N<32 或只要几个频率点时朴素/Goertzel 更简单；否则永远 FFT`},
    {vs:`补零（zero-padding）`,same:`都能让频谱看起来更"细"`,diff:`补零只在原谱的 sinc 插值上多取点，分辨率仍是 fs/N_真实；只有真的采更长才提高分辨率`,when:`补零用于凑 2 的幂或让峰位读数更平滑；分辨两个近频率必须加长采样`},
    {vs:`快速卷积（fo.convolution）`,same:`都靠 FFT 拿到 N log N`,diff:`FFT 是换基本身；快速卷积是"换基 → 逐点乘 → 换回"三步，核心是卷积定理而不是 FFT 本身`,when:`核长 > ~64 用 FFT 卷积；短核直接卷更快`},
    {vs:`分治通用框架（co.recursion / di.big_o）`,same:`T(N)=2T(N/2)+O(N) 的标准形式`,diff:`归并排序的合并是比较，FFT 的合并是蝶形复乘；FFT 额外要求 N 可分解`,when:`分析复杂度用主定理；理解为什么能分治要看单位根的平方性质`}
  ],
  ext:[
    {t:`旋转因子 W_N^k 就是 N 次单位根`,go:`cx.roots_unity`},
    {t:`用 FFT 做 O(N log N) 卷积`,go:`fo.convolution`},
    {t:`滑动窗上反复 FFT ⇒ 频谱图`,go:`fo.spectrogram`},
    {t:`T(N)=2T(N/2)+O(N) 的主定理`,go:`di.big_o`}
  ]
},

/* ================================================================== */
'fo.convolution': {
  layers:{
    alg:`(x⊛h)[n]=Σₘ x[m]h[(n−m) mod N]。取 DFT：Σₙ Σₘ x[m]h[n−m]W^{kn}，换元 n=m+l 得 (Σₘx[m]W^{km})(Σₗh[l]W^{kl})=X[k]H[k]。逐点乘。对偶：x·w ⟺ (X⊛W)/N。`,
    geo:`时域里 h 是一把"刷子"，卷积把它在 x 的每个位置刷一遍再叠加；频域里每个频率成分只被各自缩放旋转，互不干扰，所以整个刷子操作退化成逐频率乘一个复数。`,
    comp:`直接卷积 O(NM)；FFT 路线 fft(x,L)·fft(h,L) 再 ifft，L≥N+M−1 补零，O(L log L)。补不够零，尾巴绕回开头（循环卷积的本质）。`
  },
  proof:{
    from:`循环卷积定义 (x⊛h)[n]=Σₘ x[m]h[(n−m) mod N]；DFT 定义；W_N^{kn} 以 N 为周期`,
    to:`DFT(x⊛h)=X·H（逐点）；线性卷积可用补零后的循环卷积精确得到；对偶 DFT(x·w)=(X⊛W)/N`,
    steps:[
      [`对循环卷积取 DFT：Y[k]=Σₙ Σₘ x[m]h[(n−m) mod N]·W^{kn}`,`把定义代入 DFT 定义，双重有限和`],
      [`交换求和顺序，固定 m，令 l=(n−m) mod N，n 跑遍 0..N−1 时 l 也跑遍 0..N−1`,`模 N 平移是 {0..N−1} 上的双射，所以换元不漏不重——这是必须用循环卷积的原因`],
      [`W^{kn}=W^{k(m+l)}=W^{km}W^{kl}（mod N 不影响，因 W^{kN}=1）`,`指数律 + 单位根周期性；正是复指数"平移只差常数因子"的离散版（fo.eigenfunction）`],
      [`Y[k]=(Σₘ x[m]W^{km})(Σₗ h[l]W^{kl})=X[k]·H[k]`,`两个和的变量已完全分离，双重和 = 两个单和之积`],
      [`线性卷积长度 N+M−1；把 x、h 都补零到 L≥N+M−1 再做循环卷积，则 (n−m) mod L 在有效范围内永远不用绕`,`线性卷积的非零下标最大是 N+M−2 < L，模 L 不起作用，循环 = 线性`],
      [`若 L<N+M−1，超出 L 的尾巴按 mod L 折回下标 0..(N+M−1−L−1)，与开头相加：时域混叠`,`这就是第 2 步的 mod 在起作用；折回量恰是线性卷积被截掉的那段（scratch 里验证 wrap[:4]−lin[:4]=lin[12:16]）`],
      [`对偶：对 DFT(x·w) 做同样推导，或直接用逆变换代入：x[n]w[n]=(1/N²)ΣₖΣₗ X[k]W[l]W^{−(k+l)n}，取 DFT 得 (1/N)Σₖ X[k]W[m−k]=(X⊛W)[m]/N`,`正反变换对称（只差符号与 1/N），所以时域乘 ⇔ 频域卷，多出一个 1/N 来自逆变换的归一化`],
      [`推论：加窗 = 时域乘 ⇒ 频域被窗谱卷积展宽；采样 = 乘冲激串 ⇒ 频谱周期复制`,`都是第 7 步对偶形式的直接应用；分别是 fo.window 与 fo.sampling 的起点`]
    ],
    end:`卷积定理是"复指数是特征函数"的集体版：每个频率各自被 H[k] 缩放，频率之间不串扰，所以整个卷积退化成逐点乘。用它可以把 O(NM) 卷积变成 O(L log L)，代价是必须补零防绕回。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
a = np.random.randn(12); b = np.random.randn(5)
lin = np.convolve(a, b)                                   # 线性卷积，长度 12+5-1 = 16
def circ_conv(x, h, N):                                   # 手写循环卷积（定义式）
    x = np.pad(x, (0, N-len(x))); h = np.pad(h, (0, N-len(h)))
    return np.array([sum(x[m]*h[(t-m)%N] for m in range(N)) for t in range(N)])
# 1) 卷积定理：循环卷积 = ifft(fft·fft)
N = 16
via_fft = np.fft.ifft(np.fft.fft(a, N)*np.fft.fft(b, N)).real
print('补零到16: 手写循环卷积 vs ifft(FA·FB) 差', f'{np.abs(circ_conv(a,b,N)-via_fft).max():.1e}', ' vs 线性卷积 差', f'{np.abs(lin-via_fft).max():.1e}')
# 2) 不补够零：尾巴绕回头
N = 12
wrap = np.fft.ifft(np.fft.fft(a, N)*np.fft.fft(b, N)).real
print('只到12: 前4项与线性卷积差', np.round(np.abs(wrap[:4]-lin[:4]), 3).tolist(), ' 后8项差', f'{np.abs(wrap[4:]-lin[4:12]).max():.1e}')
print('   绕回量正好等于线性卷积的尾巴:', np.allclose(wrap[:4]-lin[:4], lin[12:16]))
# 3) 对偶：时域乘 = 频域循环卷积 / N
x = np.random.randn(N); w = np.random.randn(N)
lhs = np.fft.fft(x*w); rhs = circ_conv(np.fft.fft(x), np.fft.fft(w), N)/N
print('fft(x·w) vs (X ⊛ W)/N 差', f'{np.abs(lhs-rhs).max():.1e}')`,
    out:`补零到16: 手写循环卷积 vs ifft(FA·FB) 差 7.2e-16  vs 线性卷积 差 6.9e-16
只到12: 前4项与线性卷积差 [0.224, 1.307, 0.7, 2.173]  后8项差 1.8e-15
   绕回量正好等于线性卷积的尾巴: True
fft(x·w) vs (X ⊛ W)/N 差 2.0e-15`,
    note:`circ_conv 是第 1 步定义式；补零到 16 与 np.convolve 相等是第 5 步；只到 12 时前 4 项差恰等于 lin[12:16] 是第 6 步的绕回；最后一行是第 7 步对偶。`
  },
  contrast:[
    {vs:`互相关 Σ x[m]h[m+n]`,same:`都是滑动相乘求和`,diff:`卷积翻转核，相关不翻；频域相关是 X·conj(H)。对称核两者相同，非对称核差一个镜像`,when:`系统响应/滤波用卷积；模板匹配、找延迟用相关。深度学习的 conv 层其实是相关`},
    {vs:`循环卷积 vs 线性卷积`,same:`定义式只差下标要不要 mod N`,diff:`FFT 天然算循环卷积；线性卷积要补零到 ≥N+M−1 才等价`,when:`周期信号、循环边界直接用循环卷积；有限长信号一定补零`},
    {vs:`逐点乘法 x·w`,same:`都是双线性运算`,diff:`在两个域里恰好互换：时域卷 ⟺ 频域乘，时域乘 ⟺ 频域卷（除 N）`,when:`看到哪边的运算简单就切到哪个域去做`},
    {vs:`多项式乘法`,same:`系数卷积 = 多项式相乘（al.polynomial）`,diff:`多项式乘法天然是线性卷积，无循环；FFT 乘大数/大多项式就是补零后的这套`,when:`大整数乘法、生成函数系数用 FFT 卷积`}
  ],
  ext:[
    {t:`卷积定理的前提：复指数是特征函数`,go:`fo.eigenfunction`},
    {t:`频域逐点乘就是滤波器 H(ω)`,go:`fo.filter`},
    {t:`时域乘窗 ⇒ 频域卷窗谱`,go:`fo.window`},
    {t:`时域乘冲激串 ⇒ 频谱周期复制 ⇒ 采样定理`,go:`fo.sampling`}
  ]
},

/* ================================================================== */
'fo.sampling': {
  layers:{
    alg:`采样 x_s(t)=x(t)·Σₙδ(t−nT)。冲激串的谱仍是冲激串（间距 fs=1/T）。由对偶卷积定理 X_s(f)=fs·Σₖ X(f−k·fs)：原谱以 fs 为周期无限复制。不重叠 ⇔ fs>2f_max。重叠时频率 f 表现为 f_a=|f−k·fs|，k 取使结果落在 [0,fs/2] 的整数。`,
    geo:`频谱是一张图案，采样把它印在一条无限长的胶带上、每隔 fs 印一份。图案宽度 <fs 时互不相碰；太宽就叠印，叠印处两份墨迹分不开——那就是混叠，且叠印后的图案与"原本就长这样"的图案没有任何区别。`,
    comp:`离散序列 cos(2π·f·n/fs) 与 cos(2π·(fs−f)·n/fs) 逐点相等（cos 偶函数 + 周期 2π），机器根本区分不了。所以只能在采样之前用模拟滤波器把 >fs/2 的成分物理去掉。`
  },
  proof:{
    from:`采样 = 乘周期冲激串；对偶卷积定理（时域乘 ⇒ 频域卷）；周期冲激串的傅里叶级数；cos 的偶性与周期性`,
    to:`采样后频谱周期化；奈奎斯特条件 fs>2f_max；混叠公式 f_a=|f−k·fs|`,
    steps:[
      [`冲激串 p(t)=Σₙδ(t−nT) 以 T 为周期，展开成傅里叶级数 p(t)=(1/T)Σₖ e^{j2πkt/T}`,`周期函数可展成傅里叶级数；系数 c_k=(1/T)∫_{−T/2}^{T/2}δ(t)e^{−j2πkt/T}dt=1/T，对所有 k 相同`],
      [`采样信号 x_s(t)=x(t)p(t)=(1/T)Σₖ x(t)e^{j2πkt/T}`,`逐项相乘；p 的级数是有限能量意义下的分布展开，与 x 相乘逐项成立`],
      [`频移性质：x(t)e^{j2πf₀t} 的谱是 X(f−f₀)。故 X_s(f)=(1/T)Σₖ X(f−k·fs)，fs=1/T`,`∫x(t)e^{j2πf₀t}e^{−j2πft}dt=X(f−f₀)，指数合并。这就是"频谱以 fs 为周期复制"`],
      [`若 X(f) 在 |f|>f_max 处为零，第 k 份副本占据 [k·fs−f_max, k·fs+f_max]。相邻副本不重叠 ⇔ fs−f_max>f_max ⇔ fs>2f_max`,`副本 0 的右端 f_max 与副本 1 的左端 fs−f_max 不相碰的代数条件`],
      [`不重叠时，用理想低通 [−fs/2, fs/2] 乘 T 就精确取回 X(f)，即 x(t) 可由样本完全重建（时域 = sinc 插值）`,`副本互不接触，矩形窗恰好切出原谱；矩形的逆变换是 sinc，乘 ⇒ 卷，得 x(t)=Σₙx[nT]sinc((t−nT)/T)`],
      [`重叠时，落在 [−fs/2, fs/2] 内的谱是多份副本之和，原 X 无法从和里分离：信息不可逆丢失`,`已知 a+b 求不出 a、b；滤波只能作用在"和"上。所以抗混叠必须在采样前用模拟滤波器`],
      [`离散视角：频率 f 的样本 cos(2πfn/fs)。令 f=k·fs±f_a，则 cos(2π(k·fs±f_a)n/fs)=cos(2πkn±2πf_a n/fs)=cos(2πf_a n/fs)`,`2πkn 是 2π 的整数倍可丢；cos 偶函数把 ± 吸收。故任何 f 与 f_a=|f−k·fs| 的样本逐点相同`],
      [`取 k=round(f/fs) 使 f_a∈[0, fs/2]：这就是表观频率公式`,`最靠近 f 的 fs 整数倍使 |f−k·fs|≤fs/2，唯一落在第一奈奎斯特区间`]
    ],
    end:`采样 = 时域乘冲激串 = 频域周期复制。复制不撞车的条件是 fs>2f_max；撞车后得到的是若干副本之和，从和里分不出原件，所以抗混叠只能在采样之前做。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
fs = 100; N = 400; t = np.arange(N)/fs                    # 采样 100 Hz，4 秒
def alias(f, fs):
    k = round(f/fs); return abs(f - k*fs)                 # 折叠公式 f_a = |f − k·fs|
def peak_hz(x):
    X = np.abs(np.fft.rfft(x)); return np.fft.rfftfreq(N, 1/fs)[np.argmax(X)]
for f in [10, 60, 110, 175, 240]:
    x = np.cos(2*np.pi*f*t)
    print(f'真实 {f:3d} Hz  FFT 峰 {peak_hz(x):5.1f} Hz  折叠公式 {alias(f,fs):5.1f} Hz')
# 60 Hz 与 40 Hz 采样后逐点几乎相同：混叠不可逆
x60 = np.cos(2*np.pi*60*t); x40 = np.cos(2*np.pi*40*t)
print('cos(60Hz) 与 cos(40Hz) 采样序列最大差:', f'{np.abs(x60-x40).max():.1e}')
# 频谱周期化：把 fs 加大一倍，110 Hz 就不再折
fs2 = 250; t2 = np.arange(N)/fs2
X = np.abs(np.fft.rfft(np.cos(2*np.pi*110*t2)))
print('fs=250 时 110 Hz 的峰:', np.fft.rfftfreq(N, 1/fs2)[np.argmax(X)], 'Hz  (250 > 2·110，不混叠)')`,
    out:`真实  10 Hz  FFT 峰  10.0 Hz  折叠公式  10.0 Hz
真实  60 Hz  FFT 峰  40.0 Hz  折叠公式  40.0 Hz
真实 110 Hz  FFT 峰  10.0 Hz  折叠公式  10.0 Hz
真实 175 Hz  FFT 峰  25.0 Hz  折叠公式  25.0 Hz
真实 240 Hz  FFT 峰  40.0 Hz  折叠公式  40.0 Hz
cos(60Hz) 与 cos(40Hz) 采样序列最大差: 4.0e-13
fs=250 时 110 Hz 的峰: 110.0 Hz  (250 > 2·110，不混叠)`,
    note:`alias() 是第 8 步公式，FFT 峰值逐条与之相符是第 7 步；cos(60) 与 cos(40) 采样序列逐点相等（4e-13）是第 7 步等式与第 6 步"不可逆"；最后一行是第 4 步的奈奎斯特条件。`
  },
  contrast:[
    {vs:`频率泄漏（fo.window）`,same:`都让频谱出现"不该有"的成分`,diff:`泄漏来自有限长截断，是主瓣旁瓣的展宽，能靠加窗压低；混叠来自采样率不足，是高频折成低频，采完就救不回`,when:`峰变宽变胖查窗；出现莫名低频峰查混叠`},
    {vs:`量化误差`,same:`都是模拟→数字的信息损失`,diff:`量化损失幅度精度（噪声地板）；采样损失时间/频率信息（混叠）`,when:`位深决定动态范围；采样率决定能表示的最高频率`},
    {vs:`图像下采样直接抽像素`,same:`就是二维的欠采样`,diff:`直接抽像素 = 没有抗混叠，产生摩尔纹；先高斯模糊再抽 = 模拟低通`,when:`缩小图像永远先模糊/用 area 插值再抽`},
    {vs:`带通采样`,same:`都是 fs 与信号频带的关系`,diff:`奈奎斯特 fs>2f_max 是对基带信号；窄带高频信号可以用远低于 2f_max 的 fs，只要副本恰好不重叠`,when:`射频/超声中频采样用带通采样；生理信号都是基带，用 2f_max`}
  ],
  ext:[
    {t:`"乘冲激串 = 频谱卷冲激串"来自对偶卷积定理`,go:`fo.convolution`},
    {t:`抗混叠滤波器如何设计`,go:`fo.filter`},
    {t:`采样后的短时分析`,go:`fo.spectrogram`},
    {t:`带宽与信道容量的关系`,go:`it.channel`}
  ]
},

/* ================================================================== */
'fo.filter': {
  layers:{
    alg:`Y(ω)=H(ω)X(ω) ⟺ y=h*x。理想低通 H=rect(ω/2ω_c) 的 h(t)=(ω_c/π)sinc(ω_c t/π)，无限长非因果。FIR = 截断 sinc 并加窗；对称核 h[n]=h[M−1−n] ⇒ H(ω)=e^{−jω(M−1)/2}·A(ω)，A 实：线性相位、群延迟恒为 (M−1)/2。`,
    geo:`频域里画一条想要的增益曲线；时域里它对应一把有形状的刷子。曲线越陡，刷子越长、两侧振铃越多（sinc 的尾巴）。对称的刷子只让整个波形平移，不歪；不对称的刷子让不同频率走不同延迟，把 QRS 撕变形。`,
    comp:`设计：fc→sinc 核→乘窗→归一化 sum=1。应用：np.convolve(x,h) 或 fft 路线，两者相同。零相位：正向滤一遍、翻转再滤一遍（filtfilt），H 变成 |H|²，相位归零，代价是非因果。`
  },
  proof:{
    from:`卷积定理 y=h*x ⟺ Y=HX；矩形函数与 sinc 互为傅里叶对；DFT 的时移定理`,
    to:`理想滤波器不可实现；FIR 截断 + 加窗的原理；对称核 ⇒ 线性相位 ⇒ 波形不变形`,
    steps:[
      [`滤波目标是指定每个频率的增益 H(ω)。由卷积定理，实现它的时域操作唯一：y=h*x，h=IFT(H)`,`LTI 系统完全由 h 决定（fo.eigenfunction），指定 H 就指定了 h`],
      [`理想低通 H(ω)=1（|ω|<ω_c），0（其他）。逆变换 h(t)=(1/2π)∫_{−ω_c}^{ω_c}e^{jωt}dω=sin(ω_c t)/(πt)`,`直接积分 e^{jωt}，上下限代入得 (e^{jω_c t}−e^{−jω_c t})/(2πjt)=sin(ω_c t)/(πt)`],
      [`这个 h 在 t<0 非零（非因果）且以 1/t 衰减、无限长：物理不可实现`,`因果系统 h(t)=0 (t<0)；sinc 两侧对称延伸到无穷。Paley–Wiener 定理更一般地说明频响在一段区间上恒为零的因果滤波器不存在`],
      [`可实现方案：取 M 个样本截断 h 并平移使其因果，h_M[n]=h[n−(M−1)/2]·w[n]。截断 = 乘窗 ⇒ 频域 H 与窗谱 W 卷积`,`对偶卷积定理（fo.convolution 第 7 步）。矩形窗谱是 sinc，卷积后理想的陡沿变成有过渡带、阻带有旁瓣（吉布斯振铃）`],
      [`矩形窗旁瓣 −13 dB，汉宁 −31 dB：换平滑窗压低阻带泄漏，代价是过渡带变宽（主瓣宽一倍）`,`窗谱主瓣决定过渡带宽度，旁瓣决定阻带抑制，两者由时频不确定性绑定（fo.window）`],
      [`对称核 h[n]=h[M−1−n] 时，H(ω)=Σh[n]e^{−jωn}=e^{−jω(M−1)/2}·Σ h[n]cos(ω(n−(M−1)/2))=e^{−jωD}A(ω)，D=(M−1)/2，A 实`,`把 n 对称配对，e^{−jωn}+e^{−jω(M−1−n)}=e^{−jωD}·2cos(ω(n−D))，虚部相消。相位 −ωD 是 ω 的线性函数`],
      [`线性相位 ⇒ 群延迟 −d∠H/dω=D 对所有频率相同 ⇒ 输出只是输入整体延迟 D 个样本，波形不变形`,`时移定理：每个频率成分延迟 D 就是整个信号延迟 D。IIR 的相位非线性，不同频率延迟不同，QRS 尖峰的高频分量与低频分量错开 ⇒ 变形`],
      [`零相位：y=flip(h*flip(h*x))，总频响 H·conj(H)=|H|²，相位为 0，延迟为 0`,`时间翻转把 H 变成 conj(H)；两次滤波相乘。代价：需要未来样本，只能离线做`]
    ],
    end:`滤波 = 频域指定增益 = 时域卷积一个核。理想核无限长非因果，所以必须截断，截断的代价用窗来管理；核对称就能保证不歪波形。四样东西（过渡带、阻带、核长、相位）互相换，没有免费的。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
np.random.seed(0)
fs = 500; N = 2000; t = np.arange(N)/fs
x = np.sin(2*np.pi*5*t) + 0.5*np.sin(2*np.pi*60*t)       # 5 Hz 信号 + 60 Hz 干扰
# 1) 理想低通的时域核是 sinc；截断 + 汉宁窗得到 FIR
fc = 20; M = 101; m = np.arange(M) - (M-1)/2
h = 2*fc/fs*np.sinc(2*fc/fs*m) * np.hanning(M); h /= h.sum()
H = np.fft.rfft(h, 4096); f = np.fft.rfftfreq(4096, 1/fs)
g = lambda hz: 20*np.log10(np.abs(H[np.argmin(np.abs(f-hz))]))
print(f'FIR 增益  5Hz {g(5):6.2f} dB   60Hz {g(60):7.2f} dB')
# 2) 对称核 ⇒ 线性相位 ⇒ 恒定群延迟 (M-1)/2
ph = np.unwrap(np.angle(H[:200])); slope = np.polyfit(2*np.pi*f[:200]/fs, ph, 1)[0]
print('相位斜率给出的群延迟:', round(-slope, 3), ' 样本   理论 (M-1)/2 =', (M-1)/2)
# 3) 时域卷积 vs 频域相乘 是同一件事
y1 = np.convolve(x, h, mode='same')
L = N + M - 1; y2 = np.fft.irfft(np.fft.rfft(x, L)*np.fft.rfft(h, L), L)[(M-1)//2:(M-1)//2+N]
print('时域卷积 vs 频域相乘 最大差:', f'{np.abs(y1-y2).max():.1e}')
amp = lambda y, hz: 2*np.abs(np.fft.rfft(y))[int(hz*N/fs)]/N
print(f'滤波后幅值  5Hz {amp(y1,5):.3f} (原1.0)   60Hz {amp(y1,60):.4f} (原0.5)')
# 4) 矩形截断 sinc（不加窗）的旁瓣 vs 加汉宁窗
h_rect = 2*fc/fs*np.sinc(2*fc/fs*m); h_rect /= h_rect.sum()
Hr = np.abs(np.fft.rfft(h_rect, 4096))
print(f'阻带最大泄漏  矩形截断 {20*np.log10(Hr[f>40].max()):.1f} dB   汉宁截断 {20*np.log10(np.abs(H[f>40]).max()):.1f} dB')`,
    out:`FIR 增益  5Hz  -0.03 dB   60Hz  -81.30 dB
相位斜率给出的群延迟: 50.0  样本   理论 (M-1)/2 = 50.0
时域卷积 vs 频域相乘 最大差: 6.7e-16
滤波后幅值  5Hz 0.996 (原1.0)   60Hz 0.0003 (原0.5)
阻带最大泄漏  矩形截断 -35.0 dB   汉宁截断 -62.4 dB`,
    note:`h = sinc·hanning 是第 2、4 步；群延迟 50 = (M−1)/2 是第 6、7 步；时域卷积 vs 频域相乘相等是第 1 步；最后一行矩形 −35 dB vs 汉宁 −62 dB 是第 5 步。`
  },
  contrast:[
    {vs:`IIR 滤波器（巴特沃斯、切比雪夫）`,same:`都是 LTI，都由 H(ω) 描述`,diff:`IIR 有反馈，阶数低就能陡，但相位非线性、可能不稳定；FIR 无反馈，永远稳定，可做线性相位，但核长`,when:`实时 + 资源紧用 IIR；波形形态要紧（ECG/EEG）用 FIR 或 filtfilt`},
    {vs:`窗函数（fo.window）`,same:`都是"乘一个窗"，都要在主瓣宽度和旁瓣高度之间换`,diff:`窗函数是对信号加窗以看谱；这里是对滤波器核加窗以控制通带纹波和阻带泄漏`,when:`分析信号选窗看 fo.window；设计 FIR 选窗看过渡带/阻带要求`},
    {vs:`平滑（滑动平均、高斯平滑）`,same:`滑动平均就是矩形核的 FIR 低通`,diff:`滑动平均的频响是 sinc，阻带旁瓣只有 −13 dB 且有零点；专门设计的低通阻带干净得多`,when:`只想去点毛刺用平滑；要把某频带干净切掉用设计过的滤波器`},
    {vs:`频域直接置零（把 FFT 某些 bin 清零再 ifft）`,same:`都是在频域乘一个 H`,diff:`矩形 H 对应无限长 sinc 核，且隐含循环卷积 ⇒ 严重振铃、首尾绕回`,when:`快速试探可以；正式处理用有限长核`}
  ],
  ext:[
    {t:`滤波的数学基础：卷积定理`,go:`fo.convolution`},
    {t:`H(ω) 是复指数的特征值`,go:`fo.eigenfunction`},
    {t:`截断核 = 加窗，代价在这里`,go:`fo.window`},
    {t:`IIR 稳定性由极点位置决定`,go:`cx.pole_zero`}
  ]
},

/* ================================================================== */
'fo.window': {
  layers:{
    alg:`观测 N 点 = x·w。对偶卷积定理：X_w=X⊛W/N。矩形窗 W(f)=sin(πfN/fs)/sin(πf/fs)（Dirichlet 核），主瓣全宽 2fs/N，第一旁瓣 −13 dB。汉宁 w=0.5(1−cos(2πn/(N−1)))=矩形 − 两个频移矩形/2，三个 sinc 错位相加抵消旁瓣，主瓣变 4fs/N。`,
    geo:`一根纯正弦的谱本是一根针。乘上有限长的窗，针被"刷"成窗谱的形状：中间一个包（主瓣），两侧一串衰减的小包（旁瓣）。矩形窗两头齐刷刷切断，小包高；平滑收尾的窗小包低，但中间的包胖一倍。`,
    comp:`np.fft.rfft(x*w, NF) 补零到大 NF 看窗谱的细节；主瓣宽度用第一个零点度量（导数由负变正处）；相干增益 w.mean() 用来校正幅值（汉宁 0.5）。`
  },
  proof:{
    from:`有限长观测 = 无限长信号乘窗；对偶卷积定理；有限等比和；时频不确定性`,
    to:`窗决定谱的主瓣宽度（分辨率）与旁瓣高度（动态范围）；主瓣宽 ∝ 1/N；平滑窗压旁瓣的代价是主瓣加倍`,
    steps:[
      [`观测 N 个样本等价于 x_w[n]=x[n]·w[n]，w 在 0..N−1 之外为零。由对偶卷积定理 X_w=(X⊛W)/N`,`任何有限长记录都隐含一个矩形窗；时域乘 ⇒ 频域卷（fo.convolution 第 7 步）`],
      [`纯正弦 X 是一根冲激，卷积后 X_w 就是 W 平移到该频率：看到的"峰"其实是窗谱的形状`,`冲激与任何函数卷积 = 该函数平移。所以谱的形状由窗决定，与信号无关`],
      [`矩形窗谱：W(f)=Σ_{n=0}^{N−1}e^{−j2πfn/fs}=e^{−jπf(N−1)/fs}·sin(πfN/fs)/sin(πf/fs)`,`等比和公式；模是 Dirichlet 核。分子零点在 f=k·fs/N，第一个零点 fs/N ⇒ 主瓣全宽 2fs/N`],
      [`主瓣宽 ∝ 1/N：截断越短，主瓣越宽 ⇒ 频率分辨率 Δf≈fs/N。这就是时频不确定性：Δt=N/fs，Δt·Δf≈1`,`零点位置 fs/N 直接给出；两个频率差小于 fs/N 时主瓣重叠分不开`],
      [`矩形窗第一旁瓣：在 f≈1.5fs/N 处 |W|≈N/(π·1.5)，相对主瓣 N 是 2/(3π)≈−13.3 dB`,`分母 sin(πf/fs)≈πf/fs 小角近似，分子 sin 取到 1；旁瓣只按 1/f 衰减（6 dB/倍频程），因为时域有跳变`],
      [`汉宁 w[n]=0.5−0.5cos(2πn/(N−1))=0.5−0.25e^{j2πn/(N−1)}−0.25e^{−j2πn/(N−1)}：三个频移的矩形窗谱按 0.5、−0.25、−0.25 叠加，相邻错开一个 bin`,`频移性质；旁瓣正负交错，错位一个 bin 后相邻 sinc 旁瓣反号相加大部分抵消 ⇒ 旁瓣 −31 dB，按 1/f³ 衰减；但三个主瓣拼在一起 ⇒ 主瓣 4fs/N`],
      [`相干增益 = w.mean()：正弦峰值被乘以 Σw/N。汉宁 0.5，故绝对幅值要除以 0.5`,`在频率 f₀ 处 X_w(f₀)=Σx[n]w[n]e^{−j2πf₀n/fs}=A·Σw[n]/2（正弦振幅 A），矩形 Σw=N，汉宁 Σw≈N/2`],
      [`取舍：两个近频等幅 ⇒ 要窄主瓣，用矩形；一强一弱相差 >30 dB ⇒ 要低旁瓣，用汉宁/布莱克曼`,`矩形的 −13 dB 旁瓣会把 −30 dB 的弱分量淹没（scratch：矩形窗下 160 Hz 峰 −31 dB 低于泄漏地板 −27.5 dB）；汉宁把地板压到 −64 dB 才露出来`]
    ],
    end:`窗不是可选项，有限观测就自带一个矩形窗。窗的谱决定你看到的每个峰长什么样：主瓣宽度 ∝ 1/N 是分辨率的硬上限，旁瓣高度是动态范围的硬上限，压一个必然放另一个。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
fs = 1000; N = 256; n = np.arange(N); NF = 65536
def spectrum_db(w):
    W = np.abs(np.fft.rfft(w, NF)); W /= W.max(); return 20*np.log10(W + 1e-300)
def mainlobe_bins(db):                                    # 主瓣半宽（到第一个零点），单位：DFT bin (fs/N)
    i = np.argmax(np.diff(db) > 0); return i * N / NF
def sidelobe_db(db):
    i = np.argmax(np.diff(db) > 0); return db[i:].max()
for name, w in [('矩形', np.ones(N)), ('汉宁', np.hanning(N)), ('布莱克曼', np.blackman(N))]:
    db = spectrum_db(w)
    print(f'{name:4s} 主瓣全宽 {2*mainlobe_bins(db):.1f} bin   最高旁瓣 {sidelobe_db(db):6.1f} dB   相干增益 {w.mean():.3f}')
# 截断越短主瓣越宽：Δf ∝ 1/N（时频不确定性）
for L in [64, 256, 1024]:
    db = spectrum_db(np.ones(L)); i = np.argmax(np.diff(db) > 0)
    print(f'矩形窗长 {L:4d}  主瓣半宽 {i*fs/NF:7.2f} Hz   fs/L = {fs/L:.2f} Hz')
# 强弱信号：矩形窗把 -50 dB 的弱分量淹掉，汉宁窗能看到
t = n/fs; x = np.cos(2*np.pi*100*t) + 10**(-50/20)*np.cos(2*np.pi*160*t)
for name, w in [('矩形', np.ones(N)), ('汉宁', np.hanning(N))]:
    X = np.abs(np.fft.rfft(x*w, NF)); X /= X.max(); f = np.fft.rfftfreq(NF, 1/fs)
    band = (f > 150) & (f < 170); floor = 20*np.log10(X[(f > 130) & (f < 145)].max())
    print(f'{name} 窗: 160Hz 处峰 {20*np.log10(X[band].max()):6.1f} dB   130-145Hz 泄漏地板 {floor:6.1f} dB')`,
    out:`矩形   主瓣全宽 2.0 bin   最高旁瓣  -13.3 dB   相干增益 1.000
汉宁   主瓣全宽 4.0 bin   最高旁瓣  -31.5 dB   相干增益 0.498
布莱克曼 主瓣全宽 6.0 bin   最高旁瓣  -58.1 dB   相干增益 0.418
矩形窗长   64  主瓣半宽   15.62 Hz   fs/L = 15.62 Hz
矩形窗长  256  主瓣半宽    3.91 Hz   fs/L = 3.91 Hz
矩形窗长 1024  主瓣半宽    0.98 Hz   fs/L = 0.98 Hz
矩形 窗: 160Hz 处峰  -31.0 dB   130-145Hz 泄漏地板  -27.5 dB
汉宁 窗: 160Hz 处峰  -50.1 dB   130-145Hz 泄漏地板  -63.8 dB`,
    note:`第一段三种窗的主瓣 2/4/6 bin、旁瓣 −13/−31/−58 dB、相干增益 1/0.5/0.42 对应第 3、5、6、7 步；第二段主瓣半宽 = fs/L 是第 4 步；第三段是第 8 步的强弱信号取舍。`
  },
  contrast:[
    {vs:`补零（zero-padding）`,same:`都改变谱的外观`,diff:`补零只是对同一窗谱插更多点，主瓣宽度（分辨率）不变；换更长的窗才把主瓣变窄`,when:`补零用来读峰更平滑；提高分辨率只能多采`},
    {vs:`混叠（fo.sampling）`,same:`都产生"假"频谱成分`,diff:`泄漏是旁瓣，分布在真峰两侧且随距离衰减，加窗能压；混叠是高频折成一个确定的低频峰，采样后无法区分`,when:`真峰两侧一圈裙边是泄漏；孤立的意外峰先查混叠`},
    {vs:`FIR 设计中的窗（fo.filter）`,same:`同一批窗函数、同一个主瓣/旁瓣取舍`,diff:`这里窗乘在信号上决定谱分析质量；那里窗乘在 sinc 核上决定滤波器过渡带与阻带`,when:`看谱选窗按信号动态范围；设计滤波器选窗按阻带要求`},
    {vs:`STFT 窗长（fo.spectrogram）`,same:`窗长 N 同样决定 Δf=fs/N`,diff:`这里讨论窗的形状（主瓣旁瓣）；那里讨论窗的长度在时间与频率分辨率间的分配`,when:`形状管动态范围，长度管时频分配，两者独立选择`}
  ],
  ext:[
    {t:`"时域乘 ⇒ 频域卷"的来源`,go:`fo.convolution`},
    {t:`窗滑动起来就是频谱图`,go:`fo.spectrogram`},
    {t:`同一批窗用于 FIR 截断`,go:`fo.filter`},
    {t:`DFT 隐含周期延拓是泄漏的根源`,go:`fo.basis`}
  ]
},

/* ================================================================== */
'fo.spectrogram': {
  layers:{
    alg:`STFT(m,k)=Σₙ x[n]w[n−mH]e^{−j2πkn/L}：窗长 L，跳步 H。每帧一个长 L 的 DFT，频率分辨率 Δf=fs/L，时间分辨率 Δt=L/fs，乘积 Δt·Δf=1 与 L 无关。`,
    geo:`时间轴上滑一扇窗，每停一次拍一张频谱快照，把快照竖着排成一张图：横轴时间、纵轴频率、颜色能量。窗越长每张照片频率越清楚，但快门越慢，事件在时间上糊成一片。`,
    comp:`frames = 切片 × 汉宁窗，np.fft.rfft(frames, axis=1) 一次算完；hop 取 L/4 保证相邻帧重叠 75%，避免时间轴闪烁；显示前取 20·log10 否则弱成分全黑。`
  },
  proof:{
    from:`DFT 的频率分辨率 fs/L（fo.window 第 4 步）；加窗 = 时域乘；不确定性原理 σ_t·σ_ω ≥ 1/2`,
    to:`整段 FFT 丢失时间信息；STFT 用窗换回时间轴；窗长 L 同时决定 Δf=fs/L 与 Δt=L/fs，乘积恒定不可同时缩小`,
    steps:[
      [`整段 DFT 的 |X[k]| 只依赖各频率的总能量，与成分出现的先后无关：把 x 的两段互换，|X| 不变（只有相位变）`,`时移定理：平移只改相位 e^{−j2πkd/N}，模不变。所以模谱看不见"什么时候"`],
      [`在时刻 t=mH 处乘一个长 L 的窗 w[n−mH]，只留下附近的信号，再做 DFT：得到该时刻附近的局部谱`,`窗外为零，DFT 只看到窗内；窗中心就是这帧的时间戳`],
      [`帧内频率分辨率：长 L 的记录主瓣宽 fs/L，两个频率差 <fs/L 分不开 ⇒ Δf=fs/L`,`fo.window 第 3、4 步：矩形窗谱第一零点在 fs/L，汉宁再宽一倍`],
      [`帧的时间分辨率：一帧覆盖 L/fs 秒，帧内发生的事件被平均、无法定位 ⇒ Δt=L/fs`,`窗内所有样本被同一个 DFT 混在一起；事件在 L/fs 内的任何位置给出几乎相同的谱模`],
      [`乘积 Δt·Δf=(L/fs)(fs/L)=1，与 L 无关：调 L 只是在两者之间分配，不能同时变小`,`这是离散版不确定性；连续版 σ_t·σ_ω≥1/2 由柯西–施瓦茨对 x 与 x′ 推出，高斯窗取等`],
      [`频率突变处：窗跨越边界的那几帧同时含两个频率，两频"同现"的时段长度约等于窗长 L/fs`,`窗滑过边界的过程中窗内两段都非零，历时恰为一个窗长（scratch：64/256/1024 ms 窗对应 32/96/336 ms 同现，与 L 同量级）`],
      [`跳步 H：帧中心间隔 H/fs 只影响时间轴的采样密度，不改变 Δt；H>L 会漏掉窗间事件，H=L/4 常用`,`Δt 由窗长决定，H 只决定画多少列；重叠 ≥50% 才能让汉宁窗的加权和近似常数（COLA），否则时间轴出现周期性亮暗`],
      [`显示用 dB：功率跨 4～6 个数量级，线性色标只能显示最强成分`,`人眼与听觉都是对数的；10·log10 把倍数关系变成等间距`]
    ],
    end:`频谱图是"分段做傅里叶"，窗长 L 是唯一真正的旋钮：Δf=fs/L、Δt=L/fs，乘积恒为 1。看不清不是算法不好，是这个乘积不允许；要绕过它只能让窗长随频率变（小波）。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
fs = 1000; T = 2.0; N = int(fs*T); t = np.arange(N)/fs
x = np.where(t < 1.0, np.cos(2*np.pi*50*t), np.cos(2*np.pi*120*t))   # 前 1 秒 50 Hz，后 1 秒 120 Hz
def stft(x, L, hop):
    w = np.hanning(L); frames = [(x[i:i+L]*w) for i in range(0, len(x)-L+1, hop)]
    S = np.abs(np.fft.rfft(np.array(frames), axis=1))
    return S, np.arange(len(frames))*hop/fs + L/(2*fs), np.fft.rfftfreq(L, 1/fs)
# 整段 FFT 只告诉你"有 50 和 120"，不知道谁先谁后
X = np.abs(np.fft.rfft(x)); f = np.fft.rfftfreq(N, 1/fs)
print('整段 FFT 两个峰:', sorted(f[np.argsort(X)[-2:]].tolist()), 'Hz  (顺序信息丢失)')
for L in [64, 256, 1024]:
    S, tt, ff = stft(x, L, 16)
    ridge = ff[np.argmax(S, axis=1)]                      # 每帧主频
    both = (S[:, np.argmin(np.abs(ff-50))] > 0.2*S.max()) & (S[:, np.argmin(np.abs(ff-120))] > 0.2*S.max())
    blur = both.sum()*16/fs                               # 同时看到两个频率的时间段 = 时间模糊
    i5 = np.argmin(np.abs(tt-0.5))
    print(f'窗长 {L:4d} ms  Δf = fs/L = {fs/L:6.2f} Hz  t=0.5s 帧读到 {ridge[i5]:6.2f} Hz  切换处两频同现时长 {blur*1000:5.0f} ms  Δt·Δf = {L/fs*fs/L:.1f}')`,
    out:`整段 FFT 两个峰: [50.0, 120.0] Hz  (顺序信息丢失)
窗长   64 ms  Δf = fs/L =  15.62 Hz  t=0.5s 帧读到  46.88 Hz  切换处两频同现时长    32 ms  Δt·Δf = 1.0
窗长  256 ms  Δf = fs/L =   3.91 Hz  t=0.5s 帧读到  50.78 Hz  切换处两频同现时长    96 ms  Δt·Δf = 1.0
窗长 1024 ms  Δf = fs/L =   0.98 Hz  t=0.5s 帧读到  49.80 Hz  切换处两频同现时长   336 ms  Δt·Δf = 1.0`,
    note:`整段 FFT 一行是第 1 步；三种窗长的 Δf=fs/L 是第 3 步、t=0.5 s 读数精度随 L 提高；"两频同现时长"随 L 增长是第 4、6 步的时间模糊；末列乘积恒 1 是第 5 步。`
  },
  contrast:[
    {vs:`整段 FFT（fo.basis）`,same:`每一帧就是一次 FFT`,diff:`整段 FFT 假设平稳，给全局平均谱、无时间轴；STFT 给时间–频率二维图，代价是每帧分辨率只有 fs/L`,when:`稳态信号（校准音、稳定节律）用整段；任何随时间变化的信号用 STFT`},
    {vs:`小波变换（fo.wavelet）`,same:`都是时频表示`,diff:`STFT 窗长固定，所有频率同样的 Δt、Δf；小波窗长随频率缩放，高频 Δt 小、低频 Δf 小`,when:`成分频率范围窄且平稳段明确用 STFT；瞬态尖峰与慢节律共存用小波`},
    {vs:`窗函数形状（fo.window）`,same:`每帧都要加窗`,diff:`窗形决定旁瓣（动态范围）；窗长决定时频分配。两个独立旋钮`,when:`先按事件时间尺度定长度，再按动态范围定形状`},
    {vs:`带通滤波器组`,same:`STFT 数学上等价于一组中心频率不同、带宽相同的带通滤波器`,diff:`滤波器组可以每个通道不同带宽（如 Mel、恒 Q），STFT 所有通道等宽`,when:`听觉/生理感知相关分析用 Mel 或恒 Q 滤波器组`}
  ],
  ext:[
    {t:`让窗长随频率变：小波`,go:`fo.wavelet`},
    {t:`每帧的窗形状选择`,go:`fo.window`},
    {t:`每帧的 DFT 用 FFT 算`,go:`fo.fft`},
    {t:`帧内频率分辨率的根源`,go:`fo.basis`}
  ]
},

/* ================================================================== */
'fo.wavelet': {
  layers:{
    alg:`W(a,b)=(1/√a)∫x(t)ψ*((t−b)/a)dt。尺度 a 把母波在时间上拉长 a 倍，频谱就压缩 a 倍：中心频率 f_c/a，带宽 Δf/a，时宽 a·Δt。故 Δf/f=常数（恒 Q），Δt·Δf 仍是常数。`,
    geo:`一把伸缩尺。量高频时尺子短，能精确定位尖峰在哪一毫秒，但频率读得粗；量低频时尺子长，频率读得细，时间上糊。频谱图是所有格子等大的网格，小波是"高频处又窄又高、低频处又宽又矮"的瓦片，每块面积一样。`,
    comp:`离散实现就是一组卷积：对每个尺度 a 生成 ψ_a 并与信号卷积（或 FFT 卷积），|结果| 就是那一行尺度图；Morlet 的中心频率 ≈ w0/(2πa)。DWT 是二进尺度 + 高/低通递归分解的省算法版。`
  },
  proof:{
    from:`傅里叶变换的缩放性质 x(t/a) ⟺ a·X(af)；STFT 的固定 Δt、Δf；不确定性 Δt·Δf ≥ 常数`,
    to:`小波的 Δt ∝ a、Δf ∝ 1/a，Δf/f 恒定；面积 Δt·Δf 不变但形状随频率变，天然匹配"高频短促、低频缓慢"的信号`,
    steps:[
      [`母波 ψ 是带通的：中心频率 f₀、带宽 B₀、时宽 T₀，且 T₀·B₀≈常数`,`ψ 有限能量、均值为零（可容许条件 ∫ψ=0）保证它是带通而非低通；不确定性给出时宽带宽乘积的下界`],
      [`缩放 ψ_a(t)=ψ(t/a)/√a：时宽变 a·T₀`,`时间轴拉伸 a 倍，形状不变，宽度按比例放大；1/√a 只归一化能量不影响宽度`],
      [`缩放性质：ψ(t/a) 的谱是 a·Ψ(af)，故 ψ_a 的中心频率 f₀/a、带宽 B₀/a`,`∫ψ(t/a)e^{−j2πft}dt 换元 u=t/a 得 a∫ψ(u)e^{−j2π(af)u}du=a·Ψ(af)；频率轴压缩 a 倍`],
      [`所以 Δf/f=(B₀/a)/(f₀/a)=B₀/f₀ 与 a 无关：恒 Q；同时 Δt·Δf=(aT₀)(B₀/a)=T₀B₀ 不变`,`两个 a 相消。面积不变（不确定性守恒），但高频（小 a）时 Δt 小、低频（大 a）时 Δf 小`],
      [`W(a,b)=<x, ψ_{a,b}> 是 x 与"在 b 处、尺度 a 的模板"的内积，等于用 ψ_a 翻转后的核对 x 做卷积再在 b 处取值`,`内积 = 相关 = 翻核卷积；所以每个尺度一行就是一次卷积`],
      [`对比 STFT：窗长 L 固定 ⇒ 所有频率 Δt=L/fs、Δf=fs/L 相同；要看 3 ms 尖峰需 L≈3 ms，此时 Δf≈300 Hz 分不开 8 Hz 节律；要看 8 Hz 需 L≳125 ms，尖峰被糊掉`,`同一个 L 服务所有频率，而尖峰与节律对时频分辨率的要求相反，固定网格必然顾此失彼`],
      [`小波：小尺度（高频）Δt 只有几 ms 可定位尖峰，大尺度（低频）Δf 只有 ~1 Hz 可分辨节律，同一张图两者兼得`,`第 4 步：每个频率带自己选了合适的 Δt、Δf，只要"高频事件短、低频事件长"这个结构成立就匹配`],
      [`离散小波：a=2^j，b=k·2^j，Daubechies 等正交母波下 {ψ_{j,k}} 构成正交基，分解 = 递归高/低通 + 下采样，O(N)`,`二进网格恰好覆盖时频平面无冗余；Mallat 算法把每层分解写成一对共轭镜像滤波器，比 FFT 还省`]
    ],
    end:`小波 = 让窗长随频率反比变化。不确定性面积一分不少，只是把"高频处窄、低频处宽"的形状交给了信号的自然结构。它不是更好的傅里叶，是另一种分配同一预算的方式。`
  },
  scratch:{
    lang:`python`,
    code:`import numpy as np
fs = 1000; w0 = 6.0
def morlet(a):                                            # ψ((t−b)/a)/√a：同一母波按尺度 a 伸缩
    tau = np.arange(-4*a*fs, 4*a*fs+1)/fs
    return np.exp(1j*w0*tau/a)*np.exp(-0.5*(tau/a)**2)/np.sqrt(a)
def fwhm(v, dx):
    return np.sum(v > 0.5*v.max())*dx
NF = 2**16; f = np.fft.rfftfreq(NF, 1/fs)
print('尺度a(s)   中心频率   频域带宽Δf   Δf/f   时域宽度Δt   Δt·Δf')
for a in [0.005, 0.02, 0.08, 0.32]:
    psi = morlet(a); P = np.abs(np.fft.fft(psi, NF))[:NF//2+1]
    fc = f[np.argmax(P)]; df = fwhm(P, f[1]); dt = fwhm(np.abs(psi), 1/fs)
    print(f'{a:6.3f}   {fc:8.1f} Hz   {df:8.2f} Hz   {df/fc:.3f}   {dt*1000:8.1f} ms   {dt*df:.3f}')
# 同一个信号：8 Hz 节律 + 1 个 3 ms 尖峰。小尺度定位尖峰，大尺度分辨节律
N = 4000; t = np.arange(N)/fs
x = np.sin(2*np.pi*8*t); x[2000:2003] += 3.0
for a in [0.005, 0.32]:
    r = np.abs(np.convolve(x, morlet(a).conj(), mode='same'))
    bg = r[500:1500]                                       # 只有 8 Hz 的一段
    print(f'尺度 {a:.3f}s: 尖峰处响应/节律段平均响应 = {r[2000]/bg.mean():7.2f}   尖峰响应半高宽 {fwhm(r[1800:2200],1/fs)*1000:6.1f} ms')`,
    out:`尺度a(s)   中心频率   频域带宽Δf   Δf/f   时域宽度Δt   Δt·Δf
 0.005      191.0 Hz      74.95 Hz   0.392       11.0 ms   0.824
 0.020       47.7 Hz      18.74 Hz   0.392       47.0 ms   0.881
 0.080       11.9 Hz       4.68 Hz   0.393      189.0 ms   0.885
 0.320        3.0 Hz       1.16 Hz   0.388      753.0 ms   0.873
尺度 0.005s: 尖峰处响应/节律段平均响应 = 36323.15   尖峰响应半高宽   13.0 ms
尺度 0.320s: 尖峰处响应/节律段平均响应 =    5.99   尖峰响应半高宽  400.0 ms`,
    note:`表格：中心频率 ∝ 1/a、Δf ∝ 1/a、Δt ∝ a 是第 2、3 步；Δf/f 恒 0.39 与 Δt·Δf 恒 ~0.85 是第 4 步；最后两行小尺度尖峰响应尖锐（13 ms）、大尺度被节律稀释（400 ms）是第 6、7 步。`
  },
  contrast:[
    {vs:`短时傅里叶 STFT（fo.spectrogram）`,same:`都是把信号投到"局部化的振荡模板"上`,diff:`STFT 模板长度固定 ⇒ 等宽频带；小波模板长度 ∝ 1/f ⇒ 恒 Q 频带`,when:`稳态多音、需要精确读频率用 STFT；尖峰 + 慢节律共存、多尺度结构用小波`},
    {vs:`带通滤波器组`,same:`每个尺度的小波变换就是一次带通滤波`,diff:`小波滤波器组的带宽与中心频率成正比（恒 Q）；普通滤波器组带宽任意`,when:`把小波当"自动按倍频程排好的滤波器组"来理解最直观`},
    {vs:`傅里叶基（fo.basis）`,same:`离散正交小波也是一组正交基，也有 Parseval`,diff:`傅里叶基每个基函数全局无限长、频率单一；小波基每个基函数局部有限长、频带有宽度`,when:`平稳信号/LTI 分析用傅里叶；压缩、去噪、瞬态检测用小波（JPEG2000）`},
    {vs:`Morlet vs Daubechies vs Haar`,same:`都是母波`,diff:`Morlet 复值、频率选择性好但不正交；Daubechies 正交紧支、适合分段光滑；Haar 是阶跃、最简单最粗`,when:`节律分析选 Morlet；压缩与去噪选 Daubechies；边缘/阶跃检测选 Haar`}
  ],
  ext:[
    {t:`固定窗长版本：频谱图`,go:`fo.spectrogram`},
    {t:`时频不确定性的来源`,go:`fo.window`},
    {t:`正交基与投影系数`,go:`la.basis`},
    {t:`多尺度卷积核的学习版：CNN`,go:`dl.cnn`}
  ]
}

});
