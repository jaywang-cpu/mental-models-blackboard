// data/deep_da.js —— 代码宇宙 · 数据大陆（da）深化层。v2 旁挂，不改 v1。
window.DEEP = window.DEEP || {};
Object.assign(window.DEEP, {

'da.dataframe': {
  route:[
    {q:'拿到一张陌生的表，第一个问题问什么？', a:[
      {c:'一行 = 一个样本（一个病人 / 一只鼠）', to:'可以直接当 (n_samples, n_features) 用，n = 行数'},
      {c:'一行 = 一次测量（同一样本有多行）', to:'n ≠ 行数。先决定：聚合成一行，还是保留多行用混合模型 / 分组切分'},
      {c:'说不清', to:'停。回去问产生数据的人。这一步错了，后面切分、n、显著性全错'}]},
    {q:'宽表还是长表？', a:[
      {c:'一行一观测、一列一变量（长表）', to:'适合 groupby 和分面绘图；喂模型前 pivot 成宽表'},
      {c:'一列一个测量对象（基因/时间点/孔位）（宽表）', to:'适合直接喂 sklearn；画图前 melt 成长表'},
      {c:'两者都不像（列名里带值，如 expr_d0、expr_d7）', to:'这是脏宽表。列名里藏了变量 day，必须 melt 出来'}]},
    {q:'缺失是随机的吗？', a:[
      {c:'和任何变量都无关（MCAR）', to:'删行或填补都近似无偏。样本贵就填，样本多就删'},
      {c:'能被观测到的其他列解释（MAR）', to:'用带这些列的模型填（IterativeImputer / KNN），别用全局均值'},
      {c:'缺失取决于缺失值本身（MNAR，如低于检测限）', to:'不能凭空填。加 is_missing 列，或用检测限/2 并写进方法'}]},
    {q:'有没有重复？分组键唯一吗？', a:[
      {c:'df.duplicated().sum() > 0', to:'分两种：整行完全重复（删）；同键不同值（数据冲突，回源头查，别偷偷取均值）'},
      {c:'键唯一（df.groupby(k).size().max() == 1）', to:'可以放心 merge，行数不会变'},
      {c:'键不唯一', to:'merge 会一对多展开。先想清楚是否要展开，不要就先聚合成唯一键'}]},
    {q:'归一化该在切分前还是切分后？', a:[
      {c:'切分前（对全表 fit_transform）', to:'错。测试集的均值方差已经进了训练，指标虚高'},
      {c:'切分后，scaler 只 fit 训练集', to:'对。更稳的做法是放进 Pipeline，让交叉验证每折自动重来'}]}
  ],
  deep:'**DataFrame 不是 Excel，是一堆等长的列。** 物理上 pandas 按列存：每列是一个 numpy 数组，有自己的 dtype；行只是这些数组的同一个下标。这一条解释了三件事——按列取快、按行取慢；一列混进字符串就整列退化成 object，运算全走 Python 循环；新增一行要重建所有列，所以在循环里 append 是灾难（O(n²)）。\n\n**三种等价理解。** 代数式：df = {列名 → Series}，Series = (values, index)。几何：一张 n×p 的矩阵，外挂了行标签 index 和列标签 columns。计算过程：任何二元运算**先按 index 对齐、再逐元素算**。最后这条最容易被忽略——a + b 不是按位置加，是按标签加，标签对不上的位置直接出 NaN，而且不报错。\n\n**index 是主键，不是行号。** loc 走标签、切片含尾（标签的"下一个"无定义，只能含尾）；iloc 走位置、不含尾（和 Python 切片一致）。默认 RangeIndex 时两者看着一样，一旦筛选或排序过就分道扬镳——这是绝大多数 loc/iloc bug 的来源。养成筛选后 reset_index(drop=True) 的习惯，或者干脆全程用 loc。\n\n**边界：什么时候不该用 DataFrame。** 列数上万（单细胞表达矩阵）时每列的元数据开销开始压过数据本身，退回 numpy 或稀疏矩阵；数据本质上多于二维（样本 × 基因 × 时间）时用 xarray 或长表；数据大于内存时用 polars / duckdb / 分块。DataFrame 的甜区是"列不多、列的语义各不相同、要按标签操作"。\n\n**和相邻概念的分界线。** 和 numpy 数组的分界：列有名字，且各列 dtype 可以不同。和 SQL 表的分界：DataFrame 有行顺序、有 index，SQL 表没有。和"矩阵"的分界：矩阵的行列可以互换语义，DataFrame 不行——行是观测，列是变量，这个不对称是 tidy data 的地基。',
  worked:[
    {q:'实验室甩给你一个 plate_readout.csv，你在写任何分析之前先跑哪几行？为什么？',
     steps:[
       ['df.shape','先知道体量。行数和你记忆里的样本数对不上，说明有重复读数或多个时间点混在一起，此时立刻停下来问'],
       ['df.dtypes','找 object 列。浓度、OD 值应该是 float，若是 object 说明列里混了 "N/A"、"<LOD"、">3.0" 这类字符串，后面所有数值运算都会静默出错'],
       ['df.head(10) 和 df.tail(10)','看头也要看尾。Excel 导出的表经常最后几行是合计、备注、空行'],
       ['df.isna().sum()','缺失的分布比总量重要：集中在一列 → 考虑删列；集中在几行 → 那几行可能是坏板'],
       ['df.duplicated().sum() 和 df.groupby(key).size().value_counts()','前者查整行重复，后者查"一行是什么单位"——如果每个 sample_id 出现 3 次，说明这是技术重复，n 不是行数'],
       ['df.describe()','看 min/max 有没有物理上不可能的值：负浓度、活率 >100%、年龄 200。这些是伪装的缺失码']],
     a:'shape → dtypes → head/tail → isna → duplicated/键计数 → describe，六行，五分钟，能挡掉后面 80% 的返工',
     meta:'任何分析的第一步不是画图也不是建模，是搞清楚"一行是什么"和"哪些值是假的"'},
    {q:'df 有 1000 行，筛出 age>60 得到 sub（200 行）。sub.iloc[0:3] 和 sub.loc[0:3] 各返回几行？',
     steps:[
       ['筛选不会重排 index','sub 的 index 还是原表的行号，可能是 [7, 12, 45, 46, ...]，不是 0,1,2'],
       ['sub.iloc[0:3]','按位置，取第 0/1/2 行，不含尾 → 3 行，永远是 3 行'],
       ['sub.loc[0:3]','按标签，找标签 0 到标签 3 之间的行。若原表行 0 的 age≤60，标签 0 根本不在 sub 里 → 报 KeyError（index 无序时）或返回 0 行（index 单调时）'],
       ['正确做法','要前三行就 sub.head(3) 或 sub.iloc[:3]；要按条件就直接 df.loc[df.age>60].head(3)']],
     a:'iloc 恒为 3 行；loc 结果取决于原 index 里有没有标签 0..3，很可能报错或返回 0 行',
     meta:'筛选之后 index 不连续。loc 和 iloc 的区别在这一刻才显形'}
  ],
  feyn:['为什么 pandas 按列取比按行取快？这和"一列一个 dtype"是同一件事吗？',
        '两个长度相同的 Series 相加，为什么可能全是 NaN？',
        '不看文档，说清楚 loc[0:3] 为什么含尾而 iloc[0:3] 不含尾。',
        '什么时候该放弃 DataFrame 改用 numpy？给一个你实验室会遇到的具体例子。'],
  exam:'湿实验转计算的第一道坎就在这里。你从酶标仪导出的 96 孔板数据，天然是"宽表 + 板位坐标"（A1..H12），一行是一块板不是一个样本。直接 df.shape 得到的行数是板数，不是 n。做流式导出的 FCS 汇总表时，一行常常是"一个门控群体在一个样本上的百分比"，同一个样本会出现十几行——此时 n 是样本数，不是行数。凡是写进论文的 n，都必须能追溯到"一行是什么单位"这个问题的答案。',
  pit:[
    {t:'df[0] 想取第一行', why:'方括号对 DataFrame 是取列，0 被当成列名', fix:'第一行用 df.iloc[0]，第一列用 df.iloc[:,0]'},
    {t:'循环里 df = df.append(row)', why:'每次都重建整张表，1 万行就是 O(n²)；且 append 在 pandas 2.0 已删除', fix:'把 dict 收集进 list，最后 pd.DataFrame(rows) 或 pd.concat 一次'},
    {t:'两张表长度一样就直接相加/赋值', why:'pandas 按 index 对齐不按位置，index 不同则全 NaN 且不报错', fix:'先 reset_index(drop=True)，或用 .values / .to_numpy() 退到位置语义'},
    {t:'看到 SettingWithCopyWarning 就加 .copy() 压掉', why:'警告在提示你可能写到了副本，加 copy 只是让它闭嘴，赋值仍然没生效', fix:'一律用 df.loc[行条件, 列] = 值 的单次索引写法'},
    {t:'describe() 一看没问题就往下做', why:'describe 只看数值列，object 列的脏数据完全隐身', fix:'对每个 object 列跑 value_counts(dropna=False)，脏值一眼看见'}
  ]
},

'da.tidy': {
  route:[
    {q:'这张表的每一行是一个观测吗？', a:[
      {c:'是，且每列是一个变量', to:'已经是 tidy，直接进 groupby / seaborn'},
      {c:'不是，一行里横着好几次测量（d0 d3 d7）', to:'列名里藏了变量。melt 出来：id_vars 留身份列，var_name 就是那个隐藏变量'},
      {c:'不是，一列里混了两个变量（"male_treated"）', to:'先 str.split 拆成两列，再判'}]},
    {q:'我要拿它干什么？', a:[
      {c:'画图 / 分组统计 / 分面', to:'要长表。seaborn 的 x= hue= col= 全部吃列名'},
      {c:'喂 sklearn / 算相关矩阵 / 做 PCA', to:'要宽表 (n_samples, n_features)，pivot 回去'},
      {c:'存盘和交换', to:'长表更稳：加一个基因不用改表结构'}]},
    {q:'pivot 报 duplicate entries 怎么办？', a:[
      {c:'重复来自技术重复（同一样本测了三次）', to:'pivot_table(aggfunc="mean")，但要在方法里写清楚是对技术重复取均值，且 n 仍按生物重复算'},
      {c:'重复来自数据错误（同一格两个不同值）', to:'不要聚合掩盖。回源头查，或先 duplicated(subset=[...], keep=False) 把冲突行捞出来看'},
      {c:'重复是因为漏了一个身份列（如批次）', to:'把那列加进 index，重复就消失了'}]}
  ],
  deep:'**Tidy data 三条，是 Hadley Wickham 的定义，也是所有数据工具的隐含假设：** 一、每一行是一个观测（one row = one observation）；二、每一列是一个变量（one column = one variable）；三、每一张表是一个观测层级（one table = one observational unit）。第三条最常被忘：病人的人口学信息和病人的每次化验，是两个层级，应该是两张表，用 patient_id 关联；硬塞进一张表，人口学信息就会被复制 N 遍，任何按行的统计都被重复计数污染。\n\n**为什么这三条不是审美是数学。** 因为几乎所有分析工具的接口都写成"给我列名"：groupby("gene")、sns.boxplot(x="gene")、model ~ dose + batch。只有当变量是列，你才能用一个名字指代它。列名里藏着变量（expr_d0, expr_d3）时，"天数"这个变量没有名字，你就没法对它做任何统计——只能手写三份重复代码。melt 的本质是**给隐藏变量起个名字**。\n\n**长表和宽表是同一份数据的两种排法，melt 和 pivot 互逆。** 长表：三列 (id, gene, expr)，n_row = n_id × n_gene。宽表：id 为行、gene 为列，n_row = n_id。长表的优势是可扩展（加一个基因只是多几行，表结构不变）和天然处理缺失（没测就没这行）；宽表的优势是矩阵形状能直接进线性代数。**喂模型一定要宽表**，因为 sklearn 的契约是 (n_samples, n_features)。\n\n**边界：tidy 不总是最优。** 单细胞表达矩阵 2 万基因 × 50 万细胞，长表就是一百亿行，必须用宽的稀疏矩阵。时间序列的滞后特征、图像张量，也都不 tidy。规则是：**分析阶段 tidy，计算阶段随便**。\n\n**和相邻概念的分界线。** tidy vs 数据库范式：范式是为了写入不冲突，tidy 是为了分析方便，方向不同但第三条（一表一层级）几乎等价于 3NF。tidy vs "干净"：干净是没有错值、没有缺失码；tidy 是形状对。一张表可以很干净但完全不 tidy。',
  worked:[
    {q:'表是：patient_id, sex, age, il6_d0, il6_d3, il6_d7, tnf_d0, tnf_d3, tnf_d7。要画"每个细胞因子随天数变化、按性别分色"的折线图，怎么整？',
     steps:[
       ['先数隐藏变量','列名 il6_d0 里挤了两个变量：cytokine（il6/tnf）和 day（0/3/7）。图里要用到的 x=day、hue=sex、col=cytokine，其中 day 和 cytokine 现在都没有列名，所以画不出来'],
       ['melt 把所有测量列拉长','long = df.melt(id_vars=["patient_id","sex","age"], var_name="key", value_name="value")。id_vars 是身份列，必须全列出来，漏一个就会被当成测量值拉进去'],
       ['拆 key 成两列','long[["cytokine","day"]] = long["key"].str.split("_d", expand=True)。此时 day 是字符串 "0"/"3"/"7"'],
       ['day 转成数值','long["day"] = long["day"].astype(int)。折线图的 x 轴必须是数值，否则 0/3/7 会被当成等距的分类，斜率是错的'],
       ['画图','sns.relplot(data=long, x="day", y="value", hue="sex", col="cytokine", kind="line")。一行代码，因为每个视觉通道都对应一个真列名']],
     a:'melt(id_vars=身份列) → str.split 拆隐藏变量 → 类型转对 → relplot 一行出图',
     meta:'画不出来的图，九成不是绘图库不会用，是表的形状不对：图里要用的每个维度必须先是一个列'},
    {q:'长表 (sample_id, gene, expr) 共 5000 行（100 样本 × 50 基因），要做 PCA，怎么办？pivot 报 "Index contains duplicate entries" 又是怎么回事？',
     steps:[
       ['PCA 要 (n_samples, n_features)','所以必须 pivot 成 100×50 的宽表：wide = long.pivot(index="sample_id", columns="gene", values="expr")'],
       ['报 duplicate 说明 (sample_id, gene) 不唯一','先查：long.duplicated(subset=["sample_id","gene"]).sum()。假设得到 5000 说明每个组合正好出现两次'],
       ['查清楚重复的来源，不要直接聚合','long.groupby(["sample_id","gene"]).size().value_counts() 看重复模式；再看重复的两行值差多少：若差 <5% 是技术重复，若差一个数量级是数据错误'],
       ['确认是技术重复后再聚合','wide = long.pivot_table(index="sample_id", columns="gene", values="expr", aggfunc="mean")。此时 n 仍然是 100（生物重复），不是 200'],
       ['pivot 后检查形状和缺失','wide.shape 应该是 (100,50)；wide.isna().sum().sum() 若不为 0，说明某些样本缺某些基因，PCA 前必须处理（sklearn 的 PCA 不吃 NaN）']],
     a:'pivot_table + aggfunc 能跑通，但真正的动作是先查清重复是技术重复还是错误；n 永远按生物重复算',
     meta:'"重复导致 pivot 失败"是一个免费的数据质量报警器，别用 aggfunc 一键消音'}
  ],
  feyn:['用一句话说清 tidy 的三条，并各举一个违反它的真实例子。',
        '为什么"列名里带着值"是个问题？不 melt 会导致什么具体的做不到？',
        'melt 和 pivot 互逆——什么情况下 pivot(melt(df)) 拿不回原表？',
        '同一份数据，画图要长表、建模要宽表，这个矛盾说明了什么？'],
  exam:'BME 里最典型的不 tidy 数据就是酶标板导出：8×12 的矩阵，行是 A-H，列是 1-12，一格一个 OD 值。它既不是长表也不是宽表，是"板位坐标"。标准动作是 melt 成 (row, col, od)，再 merge 上你的板布局表（哪个孔是哪个样本、哪个浓度、是不是对照），才算变成可分析的数据。流式的门控汇总、qPCR 的 Ct 表、Western 的定量表，全是同一个模式：**仪器给的是给人看的形状，分析要的是给列名用的形状**，中间那一步 melt + merge 布局表，是每个湿实验转计算的人要先写熟的。',
  pit:[
    {t:'melt 时 id_vars 漏了一列', why:'漏掉的身份列被当成测量列拉进 value 里，字符串和数值混在一起，整列变 object', fix:'melt 前先明确列出所有身份列；melt 后立刻检查 long["value"].dtype'},
    {t:'pivot 报错就换 pivot_table', why:'aggfunc 默认 mean，把数据冲突静默平均掉了，你永远不知道有过冲突', fix:'先 duplicated(subset=[...], keep=False) 看冲突行，确认性质再决定聚不聚合'},
    {t:'把技术重复当独立样本算 n', why:'技术重复之间的相关性接近 1，n 虚增导致 p 值虚小，是最常见的伪重复（pseudoreplication）', fix:'先对技术重复取均值压成一行，n 按生物重复算；或用混合效应模型带随机截距'},
    {t:'把 day 留成字符串画折线图', why:'"0","3","7" 被当成三个等距的分类，横轴间距是错的，趋势看起来不一样', fix:'melt 拆出来后立刻 astype(int/float)'},
    {t:'人口学信息和纵向化验塞进一张表', why:'违反"一表一层级"。按行算年龄均值时，随访次数多的病人被重复计数', fix:'拆成两张表用 id 关联；确实要算病人层的统计就先 drop_duplicates("patient_id")'}
  ]
},

'da.groupby': {
  route:[
    {q:'题目里的"每个/按……分别"后面跟的是什么？', a:[
      {c:'一个词（每种药）', to:'单键：df.groupby("drug")'},
      {c:'两个词（每种药每个剂量）', to:'双键：df.groupby(["drug","dose"])，结果是 MultiIndex'},
      {c:'连续变量（每个年龄段）', to:'先 pd.cut 分箱成类别列，再 groupby。别直接对连续值分组'}]},
    {q:'输出应该有几行？', a:[
      {c:'每组一行（要摘要）', to:'agg / mean / size。行数 = 组数，键跑到 index 上，接下来大概率要 reset_index()'},
      {c:'和原表一样多行（要把组统计量贴回每一行）', to:'transform。组内 z-score、组内填缺、减组基线，全是 transform'},
      {c:'原表的子集（只留满足条件的组）', to:'filter(lambda d: ...)。如"只留 n≥3 的组"'}]},
    {q:'要聚合的是一列还是多列？', a:[
      {c:'一列一个函数', to:'df.groupby(k)["y"].mean()，返回 Series'},
      {c:'多列多个函数、还要自定义列名', to:'df.groupby(k).agg(n=("id","count"), m=("y","mean"), s=("y","std"))，命名聚合最清楚'},
      {c:'没指定列', to:'危险：会对所有数值列聚合，patient_id 这种 id 列也被平均。永远显式选列'}]}
  ],
  deep:'**groupby 只做一件事：split-apply-combine。** split 按键把表切成若干块；apply 对每块独立算；combine 把结果拼回来。三步里唯一有自由度的是 apply 返回什么，而它决定了整个操作的类型：返回**标量** → 每组一行，这是 agg；返回**和组等长的序列** → 行数不变，这是 transform；返回**布尔** → 决定整组留不留，这是 filter。记住这个三分法，就不用再靠试错猜该用哪个。\n\n**为什么这个抽象值钱。** 因为"每个 X 的 Y"这句中文，在 SQL 里是 GROUP BY，在 pandas 里是 groupby，在 numpy 里是 np.add.reduceat，在 MapReduce 里就是 map 和 reduce 本身。它是把"对整体的一个问题"拆成"对每个子集的同一个问题"的通用武器——分治的数据版本。你在实验室问的绝大多数问题（每个剂量的平均抑制率、每个批次的变异系数、每个病人的最差指标）都是它。\n\n**键去哪了。** agg 之后分组键变成 index（多键变 MultiIndex），不再是列。这导致后面 merge 找不到键、to_csv 出来的列对不上、画图时 x= 那个名字不存在。两种解法：as_index=False，或者 .reset_index()。**养成 groupby(...).agg(...).reset_index() 一口气写完的肌肉记忆**，能省掉大量莫名其妙的 KeyError。\n\n**默认跳 NaN 的暗坑。** mean/sum 默认 skipna=True，所以不同组的分母其实不同。count() 数非空、size() 数总行数，两者的差就是缺失数——聚合时永远同时输出 n=("y","count")，让每组的有效样本量摆在脸上。\n\n**边界与相邻概念。** groupby.apply(自定义函数) 能干任何事但每组一次 Python 调用，几万组就慢到不可用；能用内建 agg 就别 apply。和 pivot_table 的分界：pivot_table 是 groupby + unstack 的语法糖，要交叉表就用它。和窗口函数（rolling / expanding）的分界：groupby 按键切，窗口按位置切，两者可以组合成 df.groupby(k)["y"].rolling(3).mean()——每个病人各自的滑动均值。',
  worked:[
    {q:'表：patient_id, visit, drug, dose, response。求"每种药每个剂量的平均反应、标准差和样本数"，并且要能直接拿去画图和 merge。',
     steps:[
       ['识别键','"每种药每个剂量"= 两个"每"= 两个键 ["drug","dose"]'],
       ['用命名聚合而不是 .agg(["mean","std"])','g = df.groupby(["drug","dose"]).agg(n=("response","count"), m=("response","mean"), s=("response","std"))。命名聚合直接给出干净的一层列名；用列表形式会得到 MultiIndex 列，后面处处别扭'],
       ['必须带上 n','没有 n 的均值是不可解释的：某个剂量只有 2 个点的均值，和有 30 个点的均值，不能画在同一张图上不加区分'],
       ['reset_index','g = g.reset_index()。此刻 drug 和 dose 从 index 变回列，才能 sns.lineplot(data=g, x="dose", y="m", hue="drug")'],
       ['检查组数','len(g) 应该等于实际出现过的 (drug,dose) 组合数。若 3 种药 × 4 剂量却只有 10 行，说明有两个组合根本没做实验——这本身是重要信息'],
       ['std 的自由度','pandas 的 std 默认 ddof=1（样本标准差），numpy 的 std 默认 ddof=0。n=1 的组 std 是 NaN，不是 0']],
     a:'df.groupby(["drug","dose"]).agg(n=("response","count"), m=("response","mean"), s=("response","std")).reset_index()',
     meta:'聚合永远同时输出 n；聚合完永远 reset_index'},
    {q:'每个批次（batch）的荧光强度基线不同，想做批次内中心化，再看药物效应。用 agg 还是 transform？',
     steps:[
       ['问输出几行','中心化后每个样本还要保留，行数必须不变 → transform，不是 agg'],
       ['写法','df["mfi_c"] = df["mfi"] - df.groupby("batch")["mfi"].transform("mean")。transform 把每组的均值广播回该组的每一行，长度和 df 一致，可以直接赋值'],
       ['为什么不能用 agg 再 merge','能，但要多写两步且容易在键上出错；transform 就是为这件事设计的'],
       ['要不要连方差一起标准化','看批次效应是加性还是乘性。荧光强度常是乘性的（增益不同），此时应该先 log 再减均值，等价于除以批次的几何均值'],
       ['致命前提：批次和处理不能共线','如果批次 1 全是对照、批次 2 全是给药，那么减掉批次均值的同时就把药物效应也减没了。此时任何批次校正都救不了，只能重做实验（每个批次内都要有对照）'],
       ['泄漏检查','批次均值是从全部数据算的。做预测模型时，测试样本所在批次的均值不能用训练集之外的信息——严格做法是把批次校正放进 Pipeline，或者干脆把 batch 当协变量交给模型']],
     a:'df.groupby("batch")["mfi"].transform("mean") 做减法；但先确认批次与处理不共线，否则校正即抹杀效应',
     meta:'行数不变 → transform；批次校正之前先查设计矩阵有没有共线'}
  ],
  feyn:['agg / transform / filter 的区别，只用"返回值是什么形状"这一句话解释。',
        '为什么 groupby 之后经常要 reset_index？不 reset 会在哪一步炸？',
        'count 和 size 差在哪？这个差值本身告诉你什么？',
        '"每个病人的最差血氧"和"每个病人减去自己基线后的血氧"，分别该用什么？为什么？'],
  exam:'BME 场景里 groupby 最常见的用法是把技术重复压成生物重复：同一只小鼠切三片、同一个样本上机三次，先 df.groupby("mouse_id")["y"].mean().reset_index()，这一步之后行数才等于 n。做剂量反应时，groupby(["drug","dose"]).agg(n=..., m=..., s=...) 是拟合 IC50 之前的标准动作，n 会暴露哪些剂量点其实只有一两个重复、拟合不可信。批次效应校正用 groupby("batch").transform("mean")；板内对照归一用 groupby("plate")，把每块板的阳性/阴性对照拿来把该板所有孔缩放到 0-100%——这一步必须按板做，不能全局做，否则板间漂移全留在数据里。',
  pit:[
    {t:'groupby 后忘了 reset_index', why:'分组键跑到 index 上，后面 merge 找不到键、画图找不到列名、to_csv 出来多一层表头', fix:'固定写成 .agg(...).reset_index()，或者用 as_index=False'},
    {t:'groupby 不指定列', why:'对所有数值列聚合，patient_id、plate_number 这些 id 列也被平均，得到一堆无意义的列且不报错', fix:'永远显式写 [["y1","y2"]] 或用命名聚合'},
    {t:'只报均值不报 n', why:'n=2 的组和 n=50 的组的均值被同等对待，误差棒和显著性全错', fix:'agg 里永远带 n=("y","count")'},
    {t:'用 agg 做组内标准化', why:'agg 压缩行数，结果没法贴回原表，只能再 merge，多一步就多一个键对不上的机会', fix:'行数不变的操作一律用 transform'},
    {t:'对连续变量直接 groupby', why:'每个浮点值自成一组，得到几千个 n=1 的组', fix:'先 pd.cut / pd.qcut 分箱，箱的边界要写进方法'},
    {t:'groupby.apply 里做重活', why:'每组一次 Python 调用，几万组直接卡死；且 apply 的返回形状不稳定，pandas 版本间行为有差异', fix:'能用内建 agg/transform 就用；确实要自定义，考虑先 numpy 化或用 numba'}
  ]
},

'da.merge': {
  route:[
    {q:'两张表的关系是什么？', a:[
      {c:'同样的实体、同样的列，只是分批采集', to:'不是 merge，是 pd.concat([a,b], axis=0, ignore_index=True) 上下堆'},
      {c:'同样的实体、不同的列（病人表 + 化验表）', to:'merge，按实体键 on="patient_id"'},
      {c:'一对多（病人 → 多次化验）', to:'merge 会展开成多次化验那么多行。确认你要的就是展开；不要就先聚合右表'}]},
    {q:'没配上的行怎么办？', a:[
      {c:'只要两边都有的（严格分析集）', to:'how="inner"。但必须报告丢了多少行，这个数字要能解释'},
      {c:'左表一行都不能少（主表补充信息）', to:'how="left"。补不上的列是 NaN，后面所有均值的分母都受影响'},
      {c:'两边都要，做数据审计', to:'how="outer" + indicator=True，看 _merge 列里 left_only / right_only 各多少'}]},
    {q:'merge 之前先验什么？', a:[
      {c:'键的 dtype', to:'a.id 是 int64、b.id 是 object 会一行都配不上且不报错。统一 astype，注意 "007" 这种零填充'},
      {c:'键的唯一性', to:'b.duplicated("id").sum()。不为 0 就会一对多展开'},
      {c:'键的取值集合', to:'set(a.id) - set(b.id) 看差集，抽几个出来肉眼看是真缺还是格式不一致（大小写、空格、全半角）'}]},
    {q:'merge 之后先验什么？', a:[
      {c:'行数', to:'assert len(out) == len(a)（left 且右键唯一时）。行数变了就停下来查'},
      {c:'缺失', to:'out[新列].isna().sum()，等于没配上的行数'},
      {c:'列名', to:'同名列变成了 _x/_y。用 suffixes 显式命名，别让下游代码猜'}]}
  ],
  deep:'**join 的四种，只有一句话的区别：没配上的行留不留。** inner 两边都配上才留（交集）；left 左表全留（右表补 NaN）；right 反过来；outer 两边都留（并集）。cross 是第五种，笛卡尔积，很少用但在生成全部条件组合（所有药 × 所有剂量的空模板）时非常好使。\n\n**行数爆炸的机制，是 join 唯一需要真正理解的东西。** 结果行数 = 对每个键值，左表匹配数 × 右表匹配数，再对所有键求和。所以：1:1 → 行数不变；1:m → 行数变成 m 侧那么多；m:m → 每个键上做笛卡尔积，两边各 10 行的键会产出 100 行。**m:m 几乎永远是 bug**，通常是你以为唯一的键其实不唯一。pandas 给了直接的护栏：pd.merge(..., validate="one_to_one" / "one_to_many" / "many_to_one")，配不上就抛异常。写一次 validate，省掉一整晚的调试。\n\n**静默失败的三个来源。** 一、dtype 不同：int64 的 12345 和 object 的 "12345" 永远不相等，inner 得 0 行，pandas 不会提醒你。二、脏字符串：前后空格、大小写、全角半角、Excel 把 "007" 变成 7。三、NaN 键：NaN != NaN，键为空的行永远配不上，而且悄悄消失在 inner 里。**merge 前 strip + 统一大小写 + 检查 dtype，是三条不需要思考的例行公事。**\n\n**join 和 concat 的分界线。** concat 是形状操作：axis=0 上下堆（要求列名一致），axis=1 左右并（按 index 对齐，不是按位置！）。merge 是关系操作：按值配对。想"把两张表并排放"的时候用 concat(axis=1) 是危险的——它按 index 对齐，index 稍有不同就错位或产生 NaN；有共同键就老老实实 merge。\n\n**和 SQL 的分界线。** 概念一模一样，但 pandas 的 merge 默认保留左表行顺序、SQL 不保证顺序；pandas 的 index 在 merge 后被丢弃（除非用 join 方法）；pandas 没有 SQL 的 ON 复杂条件，只能等值连接，非等值连接（区间匹配，如"化验时间落在住院期间"）要用 merge_asof 或 IntervalIndex。',
  worked:[
    {q:'a = 100 个病人的基线表（patient_id 唯一）；b = 化验记录，每人 0-5 条，共 320 行。left merge 之后你期望几行？实际得到 340 行，怎么查？',
     steps:[
       ['先算期望','left merge 的行数 = 对左表每一行，右表匹配数求和。b 里每个 patient_id 出现几次，结果就展开几行；b 里没有的病人贡献 1 行（全 NaN）。所以期望行数 = 320 + (a 里但 b 里没有的病人数)'],
       ['算那个差','missing = a[~a.patient_id.isin(b.patient_id)]，假设是 15 个。期望 = 320 + 15 = 335。实际 340，多了 5 行'],
       ['多出来的 5 行只能来自左表键不唯一','a.duplicated("patient_id").sum()。若 a 里有病人重复登记了一次，且他在 b 里有 5 条化验，就会多出 5 行'],
       ['定位','dup_ids = a.patient_id[a.patient_id.duplicated(keep=False)]，把这些 id 的原始行捞出来肉眼看：是完全重复（删一条）还是同一个 id 两个人（数据错误，回源头）'],
       ['修完加护栏','pd.merge(a, b, on="patient_id", how="left", validate="one_to_many")。以后 a 再出现重复键会直接抛异常，而不是悄悄多几行'],
       ['最后再验一遍','assert out.patient_id.nunique() == a.patient_id.nunique()，且 out.groupby("patient_id").size() 的分布应该等于 b 的记录数分布 + 缺失者的 1']],
     a:'期望 335，实际 340 → 左表键有重复。用 duplicated 定位，用 validate= 加护栏',
     meta:'merge 前算出期望行数，merge 后 assert 一下。这两行代码的性价比是全 pandas 最高的'},
    {q:'a.sample_id 是 int64（1,2,3...），b.sample_id 是 object（"S001","S002"...）。inner merge 得 0 行，程序不报错就往下跑了。怎么发现、怎么修？',
     steps:[
       ['发现机制不能靠眼睛','靠断言：merge 之后立刻 assert len(out) > 0，或者更好，assert len(out) >= 0.9*len(a)。0 行会被当场抓住'],
       ['诊断第一步看 dtype','a.sample_id.dtype 是 int64，b.sample_id.dtype 是 object。类型不同 → 值永远不相等 → 交集为空'],
       ['诊断第二步看实际取值','a.sample_id.head() 是 1,2,3；b.sample_id.head() 是 "S001","S002"。不只是类型不同，编码规则也不同：右表带前缀 S 和零填充'],
       ['修：把两边规整成同一个规范形式','b["sid"] = b.sample_id.str.removeprefix("S").astype(int)，然后 on="sid"。反向也行（给 a 补前缀），但转成 int 更不容易再出格式问题'],
       ['修完验差集','miss = set(a.sid) - set(b.sid)，len(miss) 应该很小且能解释（那几个样本确实没上机）'],
       ['防复发','把 id 规整写成一个函数 normalize_id()，两边都调它。字符串键还要顺手 .str.strip().str.upper()——Excel 里手打的 id 有一半带看不见的空格']],
     a:'dtype 不同导致 0 行且不报错。规整成同一编码后 merge，并用 assert 行数 + 差集检查兜底',
     meta:'键的类型和编码规则必须先统一。merge 返回 0 行是最容易被忽略的失败，因为它不抛异常'}
  ],
  feyn:['不看文档说出 inner/left/right/outer 的区别，只用"没配上的行"这一个概念。',
        '一对多 merge 之后，为什么左表的数值列不能再直接求均值？',
        '什么情况下 merge 一行都配不上却不报错？至少说三个原因。',
        'concat(axis=1) 和 merge 都能"把两张表并排"，什么时候用哪个？'],
  exam:'BME 里 merge 的经典场景是"数据表 + 布局表"：酶标仪只给你孔位和读数，样本身份在另一张 plate map 里，必须按 (plate_id, well) 两个键 merge 才知道每个数字是什么。这里最容易出的错是键不完整——只按 well 而忘了 plate_id，于是每块板的 A1 都互相配对，行数瞬间乘以板数。临床数据的经典场景是把 EHR 的诊断表 join 到病人表：一个病人有多个诊断码，一对多展开后再算"平均年龄"就把多病的病人算了好几遍。规则：**merge 之后，任何按行的统计都要先想清楚现在一行是什么单位**。',
  pit:[
    {t:'merge 后行数变了没检查', why:'一对多默默展开，后续所有均值、计数、显著性检验全建立在被重复计数的数据上', fix:'merge 前算期望行数，merge 后 assert；或直接用 validate= 参数'},
    {t:'键的 dtype 不一致', why:'int 与 str 永远不相等，结果 0 行或大量 NaN，且不抛任何异常', fix:'merge 前统一 astype，字符串键再加 .str.strip().str.upper()'},
    {t:'复合键只写了一半', why:'如只按 well 而漏了 plate，跨板错配，行数爆炸且数据完全错乱', fix:'问自己"这个键唯一确定一行吗"，不唯一就补键'},
    {t:'同名列 merge 后变 _x/_y 没管', why:'下游代码继续写 df["value"] 直接 KeyError，或者更糟——用了错的那一列', fix:'merge 前只选需要的列，或显式给 suffixes=("_base","_lab")'},
    {t:'用 concat(axis=1) 拼两张表', why:'按 index 对齐不是按位置，index 不同就错位，长度不同还会补 NaN', fix:'有共同键就 merge；确实要按位置拼先 reset_index(drop=True)'},
    {t:'键里有 NaN', why:'NaN 不等于 NaN，这些行永远配不上，在 inner 里悄悄消失', fix:'merge 前 df[key].isna().sum() 检查，并决定这些行的去向'}
  ]
},

'da.clean': {
  route:[
    {q:'这个缺失是怎么产生的？（决定能不能填）', a:[
      {c:'完全随机，和任何变量无关（MCAR：管子掉了、文件传输丢了）', to:'删行和填补都近似无偏。样本贵就填（均值/中位数/多重插补），样本多就直接删'},
      {c:'和观测到的其他列有关（MAR：老年病人更容易漏做某项检查）', to:'能填，但必须用带上那些列的模型填（IterativeImputer / KNNImputer / 多重插补），全局均值会引入偏倚'},
      {c:'和缺失值本身有关（MNAR：低于检测限、病太重没法测）', to:'不能凭空填。加一列 is_missing 当特征，或用 LOD/2 代入并在方法里写明，或用生存分析/删失模型'}]},
    {q:'这个"值"是真的吗？', a:[
      {c:'-999 / -1 / 0 / 9999 / "NA" / "" / "N/A"', to:'伪装的缺失码。replace 成 np.nan，否则它们会被当成真数值参与均值'},
      {c:'物理上不可能（负浓度、活率 120%、年龄 200）', to:'录入错误或单位错误。查原始记录；别直接删，先看是不是整批都错了单位（ng/mL vs μg/mL）'},
      {c:'"<LOD" / ">3.0" 这类带符号的', to:'删失数据不是缺失。整列会因此变 object，先决定处理规则再转数值'}]},
    {q:'重复行怎么处理？', a:[
      {c:'整行完全一样', to:'多半是导出两次。drop_duplicates() 删掉，但记录删了几行'},
      {c:'键相同但值不同', to:'数据冲突，不要静默取均值。duplicated(subset=key, keep=False) 捞出来看，回源头'},
      {c:'键相同且本来就该多行（技术重复）', to:'不是重复是设计。按 groupby(key).mean() 压成一行，n 按生物重复算'}]},
    {q:'离群值删不删？', a:[
      {c:'能确认是仪器/录入错误', to:'删，并在方法里写明删了几个、依据是什么'},
      {c:'只是极端但真实（分布右偏）', to:'不删。改用 log 变换、稳健统计（中位数/IQR）或稳健模型'},
      {c:'不确定', to:'保留 + 做敏感性分析：带和不带各跑一遍，结论一致就没事，不一致就是真正的发现或真正的问题'}]}
  ],
  deep:'**缺失值的三种机制（Rubin 的分类）决定了你能不能填，这是清洗里唯一真正有理论的部分。** MCAR（完全随机缺失）：缺不缺和任何变量都无关，缺失的那部分是全体的一个随机子样本，所以删掉只损失样本量不引入偏倚。MAR（随机缺失）：给定观测到的其他变量后，缺失是随机的——比如老年人更常漏做某项检查，但在同年龄内漏不漏是随机的。此时**用其他变量做条件的填补是无偏的**，全局均值填补则不是。MNAR（非随机缺失）：缺失概率取决于那个没被观测到的值本身——浓度低于检测限所以测不出，病人太重所以没做核磁。**MNAR 无法从数据本身检验出来，也无法靠填补修好**，只能靠领域知识建模（删失模型、选择模型）或诚实地报告。\n\n**残酷的推论：你没法从数据里判断是 MCAR 还是 MAR 还是 MNAR。** 数据只能否定 MCAR（比较缺失组和非缺失组的其他变量，有系统差异就不是 MCAR），不能区分 MAR 和 MNAR。所以判断机制靠的是**你对数据怎么产生的理解**，这恰恰是湿实验背景的人的优势——你知道那个孔为什么是空的。\n\n**用均值填缺的三宗罪。** 一、把方差压小了：n 个值里填了 k 个均值，样本方差被低估约 (n-k)/n 倍，置信区间假窄，p 值假小。二、把相关性搞乱：填进去的点全落在均值那条线上，和其他变量的相关系数被稀释。三、造出了不存在的众数：直方图上均值处凭空长出一根柱子。**中位数填补同理，只是对离群更稳。** 真要填就用多重插补（MICE）：填多份、各自分析、按 Rubin 规则合并，方差才算对。\n\n**填补的泄漏面。** 填充值（均值/中位数/模型）是一个从数据里学来的统计量，所以**只能从训练集学**。df.fillna(df.mean()) 写在 train_test_split 之前，测试集的信息就进了训练集。正解是 SimpleImputer 放进 Pipeline，交叉验证每折自己重新学。\n\n**边界与相邻概念。** 清洗 vs tidy：清洗管值对不对，tidy 管形状对不对，两件事。清洗 vs 特征工程：把 -999 变成 NaN 是清洗，把"是否缺失"变成一个特征是特征工程——而且这一列常常很有预测力（做了这项检查本身说明医生怀疑什么）。清洗 vs 造假：**任何删除和替换都必须可追溯、可复现、写进方法**，一个删了 30% 数据却没说的分析和编数据没有本质区别。',
  worked:[
    {q:'ELISA 数据里，浓度列有 12% 的值是 "<LOD"（低于检测限，LOD=0.5 pg/mL），整列 dtype 是 object。怎么处理？',
     steps:[
       ['先分类：这不是缺失，是左删失','"<LOD" 说明测了，而且知道它小于 0.5。缺失是"不知道"，删失是"知道在某个区间"。信息量完全不同'],
       ['判机制','删失概率取决于真值本身（值越小越容易 <LOD）→ 这是标准的 MNAR。任何"用均值填"的做法都会系统性地高估这些样本'],
       ['方案一：LOD/2 代入','df.conc = df.conc.replace("<LOD", 0.25).astype(float)。这是免疫学文献里的惯例做法，简单、可复现，但会低估方差；必须在方法里写明'],
       ['方案二：留成删失，用生存分析','把它当左删失数据用 Tobit 回归或 lifelines 处理。统计上更正确，但审稿人和合作者的理解成本高'],
       ['方案三：加一列','df["below_lod"] = (df.conc_raw == "<LOD").astype(int)。做预测模型时这一列本身常常很有用'],
       ['绝对不能做的','df.conc = pd.to_numeric(df.conc, errors="coerce") 然后 dropna()。这会把所有低浓度样本整体删掉，剩下的是"浓度偏高"的有偏子集，组间比较直接失效'],
       ['最后检查组间删失率','df.groupby("group")["below_lod"].mean()。如果对照组 40% 删失、给药组 2%，那么任何填补方式下的组间比较都是脆弱的，这件事本身应该报告']],
     a:'先认出是 MNAR 左删失；LOD/2 代入 + 加 below_lod 列 + 报告各组删失率；绝不 coerce 后 dropna',
     meta:'"低于检测限"是 MNAR 的教科书案例：删掉它等于按结果筛样本'},
    {q:'df 有 8 列，每列独立缺失约 8%。同事写了 df = df.dropna()，剩下 55% 的行。这里有几个问题？',
     steps:[
       ['先算数看合不合理','8 列各缺 8% 且独立，全不缺的概率 = 0.92^8 ≈ 0.51。剩 55% 符合独立假设，说明缺失大致互相独立'],
       ['问题一：损失量惊人','为了 8% 的缺失丢了 45% 的样本。功效（power）掉一半，很多本来能看出来的效应就看不出来了'],
       ['问题二：可能引入选择偏倚','完整病例分析（complete case analysis）只在 MCAR 下无偏。先检验：对比被删和被留的行在其他变量上的分布（t 检验/卡方，或直接看均值差），有系统差异就不是 MCAR，dropna 的结果有偏'],
       ['问题三：一刀切忽略了列的重要性差异','标签 y 缺失只能删行；某个次要特征缺失完全可以填甚至整列不要。正确做法是分列决策：dropna(subset=["y"]) 只对必需列'],
       ['问题四：无法复现的隐式决策','dropna() 没说明删了什么。至少要打印 before/after 行数并存下被删的 id'],
       ['更好的方案','必需列 dropna(subset=[...]) → 其余列用 Pipeline 里的 SimpleImputer/IterativeImputer → 加 add_indicator=True 保留"曾经缺失"这个信息 → 敏感性分析：完整病例 vs 填补两条路各跑一遍看结论稳不稳']],
     a:'四个问题：损失 45% 样本、可能非 MCAR 引入偏倚、不分列一刀切、决策不可追溯。改成分列策略 + Pipeline 内填补 + 敏感性分析',
     meta:'dropna() 是一个看不见代价的操作。先算"这一行删掉多少"，再决定'}
  ],
  feyn:['MCAR / MAR / MNAR 各举一个你实验室会遇到的真例子，并说清各自能不能填。',
        '为什么用均值填缺会让 p 值变小？把这句话讲给完全不懂统计的人听。',
        '缺失和"低于检测限"有什么本质区别？',
        '为什么填充值只能从训练集算？如果从全表算，具体泄漏了什么？'],
  exam:'BME 的数据脏在几个固定的地方。技术重复 vs 生物重复：同一个样本上机三次是技术重复（反映仪器噪声），三只不同小鼠是生物重复（反映生物学变异）——技术重复必须先压成一个值，否则 n 虚增、p 值假小，这是审稿人最常抓的伪重复（pseudoreplication）。板内板间对照：每块板都要有阳性和阴性对照，清洗时先用板内对照把该板归一化，再跨板比较；如果某块板的对照本身就漂了，整块板的数据要标记甚至弃用。检测限：ELISA、qPCR（Ct>35）、流式（事件数太少）都有各自的"不可信下界"，这些值是 MNAR，处理规则必须在看结果之前定好并写进方法。',
  pit:[
    {t:'用均值填缺', why:'方差被系统性压小，置信区间假窄、p 值假小；和其他变量的相关性被稀释；直方图上凭空多一根柱子', fix:'样本够就删；要填用多重插补或模型填补，并加 add_indicator 保留缺失信息'},
    {t:'df.fillna(df.mean()) 写在 split 之前', why:'填充值含有测试集的信息，是最常见的统计泄漏', fix:'SimpleImputer 放进 Pipeline，让每折自己 fit'},
    {t:'dropna() 一把梭', why:'任一列缺就整行删，多列小比例缺失叠加起来能删掉一半样本；且只有 MCAR 下无偏', fix:'分列决策：必需列 dropna(subset=)，其余列填补；并检验被删组和保留组有无系统差异'},
    {t:'把 -999 / 0 当成真数值', why:'伪装的缺失码直接参与均值和回归，结果可以离谱到肉眼看不出来（比如均值被拉到 -50）', fix:'describe() 看 min/max，对每列 value_counts() 扫一眼，replace 成 np.nan'},
    {t:'3σ 一刀切删离群', why:'3σ 假设正态。浓度、计数、时间这些右偏分布下，尾部的真实数据会被大批误删，均值被系统性拉低', fix:'先画直方图；右偏就 log 变换后再看，或用 IQR / 稳健方法；删之前先做敏感性分析'},
    {t:'drop_duplicates() 不指定 subset', why:'默认按所有列判重，"同一个样本两条不同读数"这种真正的数据冲突不会被发现', fix:'用 subset=业务键 + keep=False 先把冲突行捞出来人工看'}
  ]
},

'da.normalize': {
  route:[
    {q:'这个模型对尺度敏感吗？', a:[
      {c:'距离/内积/梯度类（kNN、SVM、PCA、k-means、神经网络、带正则的线性模型）', to:'必须缩放。不缩放等于给量纲大的特征偷偷加权'},
      {c:'树类（决策树、随机森林、XGBoost）', to:'不需要。它们只看单列的排序和阈值，单调变换不改变结果'},
      {c:'不带正则的普通线性回归', to:'系数会自动吸收尺度，预测不变；但一旦加 L1/L2 惩罚，就必须缩放，否则惩罚在不同量纲的系数上不公平'}]},
    {q:'数据长什么样？', a:[
      {c:'大致对称、无极端离群', to:'StandardScaler（z-score）'},
      {c:'有强离群值', to:'RobustScaler（减中位数除 IQR）。min-max 会被单个极端值压扁所有其他点'},
      {c:'右偏、跨几个数量级（浓度、计数、荧光强度）', to:'先 log1p 再 z-score。先把分布拉正，缩放才有意义'},
      {c:'已经是 0/1（one-hot、指示变量）', to:'不缩放。缩放会破坏稀疏性和可解释性'}]},
    {q:'缩放该在哪一步做？', a:[
      {c:'对全表 fit_transform，然后 split', to:'错。测试集的均值方差进了训练'},
      {c:'split 之后，scaler.fit(X_train) 再 transform 两边', to:'对，但手工做在交叉验证里还是会漏'},
      {c:'放进 Pipeline，把 pipe 交给 cross_val_score / GridSearchCV', to:'最稳。每折自动重新 fit，不可能写错'}]}
  ],
  deep:'**为什么要缩放：一句话，因为距离和梯度不认量纲。** 身高 170 cm、体重 65 kg，算欧氏距离时把 cm 换成 m，这一维的贡献瞬间缩小一万倍——同一份数据，换个单位，kNN 的邻居就变了。这说明**未缩放时，模型的行为依赖于你恰好用了什么单位**，这显然不是我们想要的。z-score 把每一维都变成"离本维均值几个本维标准差"，量纲被消掉，各维等权。\n\n**三种等价理解。** 代数：z = (x − μ) / σ，仿射变换，线性关系不变。几何：把点云平移到原点、再把每个坐标轴按自身伸展程度压缩成单位长度——椭球变成球。优化：梯度下降的等高线从狭长椭圆变成接近正圆，最陡下降方向直指最优点，收敛快好几个量级。这就是神经网络必须做输入标准化、以及 BatchNorm 存在的理由。\n\n**「只用训练集的均值方差」为什么是硬规矩。** 缩放不是一个"格式转换"，它是一个**从数据里估计参数（μ, σ）的模型**。你在测试集上做的每一件事都必须只依赖训练时可得的信息，否则你测的就不是泛化性能。用全表算 μ 和 σ，测试集的分布信息就通过这两个数字漏进了训练——数据量大时泄漏很小（μ 的估计几乎不变），但样本少、特征多、或有离群值时可以显著抬高指标。更要命的是**这个错误在交叉验证里被放大 k 次**且完全不报错。\n\n**推论：测试集也不能用自己的 μσ。** scaler.fit(X_test) 是另一个方向的错误——那等于给测试集换了一套坐标系，训练好的模型在一个它没见过的空间里做预测，指标会莫名其妙地差或好，而且不可解释。**训练学参数，测试只 transform，这是不对称的，而且必须不对称。**\n\n**边界。** 缩放不能修好分布形状：右偏数据 z-score 之后还是右偏，只是均值 0。要处理形状得用 log / Box-Cox / QuantileTransformer。缩放也不能处理协变量漂移：如果测试集真的来自另一个分布（另一台仪器、另一个中心），用训练集的 μσ 转换会得到一堆离群的 z 值——**这时候该做的是发现漂移并处理它，而不是偷偷用测试集的 μσ 把它掩盖掉**。\n\n**和相邻概念的分界线。** 缩放 vs 归一化到单位长度（L2 normalize）：前者按列（每个特征）做，后者按行（每个样本）做，文本 TF-IDF 常用后者。缩放 vs 白化：白化还要去掉特征间相关性（除以协方差矩阵的平方根），PCA 里的 whiten=True 就是它。缩放 vs 批次校正：前者消的是量纲，后者消的是实验批次带来的系统偏移，两件事，都要做。',
  worked:[
    {q:'这段代码哪里泄漏了？\nX = StandardScaler().fit_transform(X)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2)\nmodel.fit(X_tr, y_tr); print(model.score(X_te, y_te))',
     steps:[
       ['定位','第一行。fit_transform 在 X 全体上算 μ 和 σ，而 X 此刻还包含了将来要当测试集的那 20%'],
       ['泄漏的是什么，具体点','μ 和 σ 这两个数字。测试集的 20% 样本参与了它们的估计，于是"训练时不该知道的分布信息"进了特征变换'],
       ['为什么这算作弊','评估泛化的前提是测试集完全没参与过任何拟合。哪怕只是两个统计量，它也让模型间接看到了测试集的位置和尺度'],
       ['影响有多大','n 大、特征少时几乎看不出来（μ 的估计本来就稳）；n 小（几十个样本）、特征多、或有离群值时，指标能虚高好几个点。危险在于它永远只让结果变好，你永远不会因为结果太差去查它'],
       ['正确写法一（手工）','先 split，再 sc = StandardScaler().fit(X_tr)，然后 X_tr = sc.transform(X_tr); X_te = sc.transform(X_te)'],
       ['正确写法二（推荐）','pipe = make_pipeline(StandardScaler(), model)；pipe.fit(X_tr, y_tr)；pipe.score(X_te, y_te)。做交叉验证时直接 cross_val_score(pipe, X, y, cv=5)，每一折内部自动重新 fit scaler'],
       ['为什么推荐第二种','手工写法在单次划分下不会错，但一旦上交叉验证，人几乎必然会把 scaler 写在循环外面，泄漏 k 次']],
     a:'泄漏点是 fit_transform 在 split 之前，泄漏了全体的 μ 和 σ。改成 Pipeline，让缩放跟着每一折走',
     meta:'凡是带 fit 的对象，它的 fit 必须发生在划分之后、且只见训练集'},
    {q:'这段代码哪里泄漏了？（比上一题隐蔽）\nsel = SelectKBest(f_classif, k=20).fit(X, y)\nX2 = sel.transform(X)\nprint(cross_val_score(LogisticRegression(), X2, y, cv=5).mean())',
     steps:[
       ['先看哪里有 fit','SelectKBest.fit(X, y) —— 注意它用了 y。这是**有监督**的特征选择'],
       ['泄漏的是什么','每一折的验证集，其标签 y 已经参与了"哪 20 个特征最相关"这个决定。于是被选出来的特征天生就在验证集上表现好'],
       ['为什么比标准化泄漏严重得多','标准化只漏了两个统计量；特征选择漏的是标签本身，而且是在成千上万个候选特征里挑最像标签的那些。当 p >> n（基因表达、影像组学）时，纯噪声特征也能被挑出来，交叉验证的 AUC 可以从 0.5 虚高到 0.9 以上'],
       ['经典实证','Ambroise & McLachlan 2002 用随机标签重做基因表达分类：先选特征再交叉验证得到接近 0 的错误率，把选择放进折内则回到 50%——完全是泄漏造出来的性能'],
       ['正确写法','pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())；cross_val_score(pipe, X, y, cv=5)。这样每一折只用该折的训练数据重新选一遍特征，不同折选出的特征可以不同（这本身就说明了选择的不稳定性）'],
       ['同类陷阱','用全量数据做 PCA、做过采样 SMOTE、做 target encoding、按方差过滤特征、甚至只是"看了一眼全表的相关矩阵才决定用哪些列"——都属于同一族']],
     a:'泄漏点是特征选择用了全部的 y。改成把 SelectKBest 放进 Pipeline，选择在每折内部完成',
     meta:'p >> n 时，折外的特征选择能把纯噪声变成 0.9 的 AUC。这是生物医学数据分析最贵的一个坑'}
  ],
  feyn:['把身高从 cm 换成 m，kNN 的结果会变吗？为什么？这说明了什么？',
        '为什么随机森林不用标准化，而带 L2 的逻辑回归必须标准化？',
        '"scaler 只 fit 训练集"——如果我用全表 fit，具体是哪个数字泄漏了？',
        '测试集的分布明显和训练集不一样，我该用测试集自己的均值方差吗？为什么不？'],
  exam:'BME 里缩放之前通常先要做两件事。一是 log：流式的荧光强度、qPCR 的拷贝数、细胞因子浓度都跨好几个数量级且右偏，直接 z-score 会让少数高表达样本主导整个空间，标准流程是 log10 或 arcsinh（流式惯用，能处理接近 0 和负的补偿值）之后再标准化。二是批次校正：不同天、不同板、不同批试剂造成的系统偏移必须在缩放前处理（板内对照归一、ComBat、或把 batch 当协变量），否则你标准化掉的是批次方差不是生物学方差。做分类模型时，这两步和 scaler 一样都是"从数据学参数"的步骤，都必须放进 Pipeline，都只能 fit 训练集。',
  pit:[
    {t:'先归一化再切分', why:'μ 和 σ 从全体算，测试集信息进了训练；且在交叉验证里会重复泄漏 k 次', fix:'先切分；更稳的是把 scaler 放进 Pipeline，让 cross_val 每折自己 fit'},
    {t:'scaler.fit_transform(X_test)', why:'测试集用了自己的坐标系，模型在没见过的空间里预测，指标不可解释也不可比', fix:'测试集只能 transform，永远不 fit'},
    {t:'对 one-hot 列也做 z-score', why:'破坏稀疏性、系数不再可解释、稀有类别被放大成巨大的 z 值', fix:'用 ColumnTransformer 只对连续列缩放'},
    {t:'右偏数据直接 z-score', why:'z-score 是仿射变换，不改变形状；少数高值样本仍然主导距离和 PCA 的第一主成分', fix:'先 log1p / Box-Cox / arcsinh 把形状拉正，再标准化'},
    {t:'有离群值时用 min-max', why:'一个极端值把其他所有点压到 [0, 0.01] 区间，等于丢掉了全部分辨率', fix:'用 RobustScaler；或先处理离群值'},
    {t:'训练时缩放了，上线推理时忘了', why:'模型收到的是原始量纲的输入，输出完全无意义但不报错', fix:'把 scaler 和模型一起 joblib.dump 成一个 Pipeline 对象，推理只调 pipe.predict'}
  ]
},

'da.split': {
  route:[
    {q:'样本之间独立吗？', a:[
      {c:'独立（一个病人一行）', to:'普通 train_test_split 即可'},
      {c:'有分组（同一病人多张切片、同一只鼠多个视野、同一块板多个孔）', to:'必须按组切：GroupShuffleSplit / GroupKFold(groups=...)。组不能跨集'},
      {c:'有时间顺序（纵向随访、连续监测）', to:'按时间切：TimeSeriesSplit。训练永远在验证之前，不许 shuffle'}]},
    {q:'类别平衡吗？', a:[
      {c:'大致平衡', to:'随机划分就行'},
      {c:'不平衡（阳性率 <10%）', to:'stratify=y，否则某一折可能一个正例都没有，指标直接 NaN'},
      {c:'既不平衡又有分组', to:'StratifiedGroupKFold。注意它只能近似同时满足两个约束'}]},
    {q:'要划几份？', a:[
      {c:'只训练一个模型、不调参', to:'train/test 两分就够'},
      {c:'要调超参', to:'train/val/test 三分，或者 train 上做交叉验证选参、test 只开一次'},
      {c:'样本很少（<200）且要调参', to:'嵌套交叉验证：外层评估、内层选参。别用同一份数据既选又评'}]},
    {q:'n 到底是几？', a:[
      {c:'行数 = 独立样本数', to:'n = 行数'},
      {c:'一个样本多行（技术重复/多切片）', to:'n = 独立单位的个数，不是行数。切分和统计都按这个数走'},
      {c:'多层嵌套（小鼠里的切片里的细胞）', to:'最高层的独立单位才是 n；细胞数是伪重复。要用全部信息就上混合效应模型'}]}
  ],
  deep:'**划分的唯一目的：造一个诚实的"没见过"。** 泛化性能定义为模型在与训练数据独立同分布的新样本上的表现。测试集必须同时满足两条——**独立**（和训练样本没有共享的信息源）和**同分布**（来自你真正关心的那个总体）。所有划分策略的花样，都是在修补"独立"这一条被现实破坏的地方。\n\n**三种独立性被破坏的方式，对应三种划分。** 一、分组相关：同一个病人的 10 张切片高度相似，随机划分后模型只要记住"这个病人的染色风格"就能在测试集拿高分——GroupKFold 修它。二、时间相关：明天的数据和今天的相关，随机划分等于用未来预测过去，而部署时你永远只有过去——TimeSeriesSplit 修它。三、类别极不平衡：随机划分下小类可能整个落在一边，估计方差巨大——stratify 修它。\n\n**三个抽屉的分工。** 训练集：学参数。验证集：选超参和模型（选择本身是一种拟合，选了 100 组超参就相当于在验证集上做了 100 次实验，最优那个的分数必然偏乐观）。测试集：只在最后打开一次，报告一次。**每多看测试集一次，它就多退化一分**，看够多次它就变成了另一个验证集。这也是 Kaggle 上 public LB 和 private LB 会分家的原因。\n\n**交叉验证不是更好的划分，是更省样本的评估。** k 折让每个样本都当过一次验证，评估的方差更小，代价是训练 k 次、且各折的模型不是同一个。样本少时它几乎是必须的。但注意：**交叉验证给的是"这个流程的期望性能"，不是"某个具体模型的性能"**；最后交付的模型通常还要在全部训练数据上重训一次。\n\n**n 到底是几：这是划分之前必须回答的问题。** 统计意义上的 n 是**独立单位的个数**。三只小鼠各切 100 片，n=3 不是 300；一个病人扫 200 层 CT，n=1 不是 200。把伪重复当独立样本，标准误会缩小约 √(每单位重复数) 倍，p 值可以从 0.3 掉到 0.001——这是生物医学论文里最常见、也最容易被审稿人抓住的统计错误。**划分时 groups 参数填的就是这个独立单位的 id。**\n\n**边界与相邻概念。** 划分 vs 重采样（bootstrap）：前者估泛化，后者估统计量的不确定性。划分 vs 外部验证：另一个中心、另一台仪器的数据，是比任何内部划分都强的证据，因为它同时检验了"同分布"这个假设本身。随机种子：固定 random_state 是为了可复现，不是为了"结果更好"——**如果换个种子结论就变了，那说明你的样本量不足以支撑这个结论**，该报告的是多个种子下的分布而不是最好的那个。',
  worked:[
    {q:'这个 pipeline 哪里泄漏了？\nX_res, y_res = SMOTE().fit_resample(X, y)\nX_tr, X_te, y_tr, y_te = train_test_split(X_res, y_res, stratify=y_res)\npipe.fit(X_tr, y_tr); print(roc_auc_score(y_te, pipe.predict_proba(X_te)[:,1]))',
     steps:[
       ['先找 fit','SMOTE().fit_resample(X, y) 在划分之前，用了全部数据'],
       ['SMOTE 干了什么','对少数类，找每个样本的 k 近邻，在连线上随机插值造新样本。所以每个合成样本都是若干真实样本的线性组合'],
       ['泄漏的机制','假设真实样本 A 和 B 是近邻，SMOTE 造出 C = 0.6A + 0.4B。划分后 A 进了训练集、C 进了测试集——模型在训练时见过 A，测试时遇到的 C 是 A 的一个"近亲"。测试集里混进了训练样本的影子'],
       ['后果','少数类的召回和 AUC 都会虚高，而且不平衡越严重、SMOTE 造得越多，虚高越离谱。见过 AUC 从真实的 0.68 虚高到 0.95 的案例'],
       ['正确顺序','先划分，再只对训练集做 SMOTE：X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y)；然后 SMOTE 只见 X_tr'],
       ['更稳的写法','用 imblearn 的 Pipeline（不是 sklearn 的）：pipe = imblearn.pipeline.make_pipeline(SMOTE(), LogisticRegression())。它保证 SMOTE 只在 fit 时对训练折生效，predict 时完全跳过'],
       ['还要问一句：真的需要 SMOTE 吗','不平衡问题常常用 class_weight="balanced"、调阈值、或换指标（PR-AUC 而不是 accuracy）就够了，合成样本引入的假设未必成立']],
     a:'泄漏点是 SMOTE 在划分之前。合成样本的"父母"跨了集，测试集里有训练样本的插值影子。改用 imblearn Pipeline',
     meta:'任何"造样本 / 改样本集"的操作都必须在划分之后、只对训练集做'},
    {q:'50 只小鼠，每只取 6 张组织切片，共 300 张图，做二分类（给药 vs 对照）。同事用 train_test_split(X, y, test_size=0.2) 得到测试 AUC=0.97，但换一批小鼠验证只有 0.61。发生了什么？',
     steps:[
       ['算一下测试集的构成','随机划分 300 张图，测试集 60 张。这 60 张来自哪些小鼠？几乎必然每只小鼠都有图落在训练集里——因为每只鼠 6 张图随机分到两边，一只鼠的 6 张全落在测试集的概率是 0.2^6 ≈ 0.006%'],
       ['所以模型见过每一只测试小鼠','同一只鼠的切片共享染色批次、切片厚度、包埋方向、扫描仪设置、以及这只鼠的个体特征。模型完全可以学"认鼠"而不是"认药效"'],
       ['这就是组泄漏','n 不是 300，是 50。切片是伪重复'],
       ['0.97 → 0.61 正好是这个故事的证据','新的一批小鼠里没有它认识的个体，性能塌回真实水平'],
       ['正确划分','gss = GroupShuffleSplit(test_size=0.2, random_state=0); tr, te = next(gss.split(X, y, groups=mouse_id))。或者交叉验证用 GroupKFold(n_splits=5)，groups=mouse_id'],
       ['还要看清 n 有多小','按小鼠算，训练 40 只、测试 10 只。10 只鼠的 AUC 置信区间非常宽——一个更诚实的报告是给出置信区间或多次重复划分的分布，而不是一个点估计'],
       ['如果给药和批次共线，还有第二层问题','若对照组的鼠都在第 1 批做、给药组都在第 2 批，那么即使按鼠划分，模型仍然可能在学批次而不是药效。这不是划分能修的，是实验设计的问题']],
     a:'组泄漏：同一只鼠的切片跨了 train/test，n 其实是 50 不是 300。改用 GroupShuffleSplit/GroupKFold，groups=mouse_id',
     meta:'"内部测试很高、外部验证塌掉"这个模式，第一嫌疑永远是组泄漏'}
  ],
  feyn:['为什么测试集只能开一次？开两次会怎样，具体点。',
        '同一个病人的 10 张切片随机划分，模型可能学到了什么捷径？',
        '时间序列为什么不能随机划分？用一句话讲给不懂机器学习的人听。',
        '三只小鼠各取 100 个细胞，n 是 3 还是 300？为什么这个数字能把 p 值从 0.3 变成 0.001？'],
  exam:'BME 的划分几乎从来不是简单随机。同一只小鼠的多个切片、同一个病人的多次扫描、同一块板的多个孔、同一个供体的多批细胞——这些全是分组单位，groups 参数必须填对，n 也必须按它算。批次效应是第二层陷阱：如果给药组和对照组恰好在不同天做，那么模型学到的可能是"哪天做的"，任何划分都救不了，只能靠实验设计（每批内都放对照、随机化上机顺序、盲法读片）。技术重复 vs 生物重复的区分决定了 n：技术重复反映仪器噪声，先取均值压成一行；生物重复才是 n。写论文报告时，"n=300 切片（来自 50 只小鼠）"是正确写法，只写 n=300 是错的。',
  pit:[
    {t:'用测试集调超参', why:'测试集变成了验证集。被选出来的超参在这份测试集上的分数天然偏乐观，报告的泛化性能是虚的', fix:'三分数据集，或在训练集内部做交叉验证选参；测试集全程只开一次'},
    {t:'时间序列随机切分', why:'训练集里有验证集之后的时间点，等于用未来预测过去；部署时你没有未来', fix:'TimeSeriesSplit 或按一个时间点硬切；特征里的滑动统计量也只能用过去的窗口'},
    {t:'按样本切分但同一个病人跨了组', why:'同病人的样本高度相关，模型认人不认病，内部指标虚高、外部验证塌掉', fix:'GroupKFold / GroupShuffleSplit，groups 填独立单位 id'},
    {t:'极不平衡时不分层', why:'某一折可能零个正例，AUC/召回直接 NaN 或方差极大', fix:'stratify=y；同时有分组就用 StratifiedGroupKFold'},
    {t:'换随机种子结论就变，只报最好的那个', why:'这是在种子上做了超参搜索，等于用测试集调参', fix:'固定一个事先声明的种子，并报告多次重复划分下的均值和区间'},
    {t:'把技术重复当独立样本算 n', why:'标准误被低估约 √k 倍，p 值假小，是审稿最常抓的伪重复', fix:'先按独立单位聚合，或用混合效应模型带随机截距'},
    {t:'先做特征选择/PCA 再划分', why:'无监督也算泄漏（用了测试集分布），有监督特征选择在 p>>n 时能把噪声变成 0.9 的 AUC', fix:'一切 fit 都放进 Pipeline，跟着折走'}
  ]
},

'da.pipeline': {
  route:[
    {q:'这一步有没有 fit？', a:[
      {c:'有（填补、缩放、编码、特征选择、降维、重采样、目标编码）', to:'必须进 Pipeline，让它跟着训练折走'},
      {c:'没有（改列名、改 dtype、单位换算、按固定规则删列）', to:'可以在 Pipeline 之外做，因为它不从数据里学任何参数'},
      {c:'不确定', to:'问：这一步的行为会不会因为换一批数据而不同？会 → 它在 fit'}]},
    {q:'不同列要不同处理吗？', a:[
      {c:'全是连续列', to:'直接 make_pipeline(imputer, scaler, model)'},
      {c:'连续 + 类别混合', to:'ColumnTransformer：连续列走 imputer+scaler，类别列走 imputer+OneHotEncoder'},
      {c:'还有文本/日期', to:'ColumnTransformer 再加一路，各自的 transformer 独立 fit'}]},
    {q:'要调超参吗？', a:[
      {c:'不调', to:'pipe.fit(X_tr, y_tr) → pipe.score(X_te, y_te)'},
      {c:'调，样本充足', to:'GridSearchCV(pipe, param_grid) 在训练集上跑，最后 test 开一次。参数名写 步骤名__参数名'},
      {c:'调，样本很少', to:'嵌套交叉验证：cross_val_score(GridSearchCV(pipe, grid, cv=inner), X, y, cv=outer)'}]}
  ],
  deep:'**Pipeline 的价值不是少写几行，是把"顺序"这件事从人的纪律变成代码的结构。** 泄漏几乎全部源于同一个错误：某个带 fit 的步骤在划分之前、或在交叉验证的循环之外执行了。人靠自觉是防不住的——单次划分时你能记得，一上交叉验证，把 scaler 写在循环外面几乎是本能。Pipeline 把整条链封成一个 estimator，它只暴露 fit 和 predict 两个动作：**fit 时每一步依次 fit_transform，predict 时每一步只 transform**。于是"训练学参数、预测只应用"这条规矩被类型系统强制了。\n\n**三种等价理解。** 代数：Pipeline 是函数复合 f = model ∘ t3 ∘ t2 ∘ t1，其中每个 ti 的参数都只由训练数据决定。工程：它是一个不可分割的原子操作，交给 cross_val_score 时，k 折循环在 Pipeline 外面，所以每折内部所有步骤全部重新 fit 一遍。契约：它把"预处理"从"数据的属性"变成"模型的一部分"——这也是部署时唯一正确的心智模型，因为线上来的原始数据必须经过和训练时完全相同的变换。\n\n**ColumnTransformer 解决的是列的异质性。** 数值列要填中位数 + 缩放，类别列要填众数 + one-hot，文本列要 TF-IDF。它按列名（**永远用列名，不要用位置索引**——上游一个 merge 改了列顺序，用位置索引会把错的列送进错的步骤，且完全不报错）把各路分派出去，各自独立 fit，最后横向拼起来。remainder="drop"（默认）会静默丢掉没点名的列，这既是护栏也是坑，显式写出来。\n\n**Pipeline 挡不住的两类泄漏。** 一、**特征构造阶段的泄漏**：如果你在建 X 之前就用全表算了"每家医院的平均死亡率"当特征，Pipeline 无能为力，因为那一步发生在它上游。二、**组泄漏和时间泄漏**：Pipeline 管的是"步骤顺序"，管不了"谁和谁分到一边"。这两件事靠 cv=GroupKFold(...) / TimeSeriesSplit 传给 cross_val_score 来管。**Pipeline 修的是纵向（步骤），CV splitter 修的是横向（样本）**，两者缺一不可。\n\n**可复现的完整清单。** 固定 random_state（划分、模型、重采样各一个）；锁版本（sklearn 的默认值在版本间会变，requirements.txt + pip freeze）；把整个 fit 好的 Pipeline 用 joblib 存下来（模型和预处理必须一起走，分开存迟早对不上）；记录数据快照的哈希；把"从原始文件到最终数字"写成一个能一键跑通的脚本，而不是 notebook 里跳着执行的若干 cell。**判断标准很简单：删掉所有中间文件，重跑一遍，能不能得到完全一样的数字。**',
  worked:[
    {q:'这个 pipeline 哪里泄漏了？找全。\nX = X.fillna(X.median())\nX = pd.get_dummies(X)\nsel = VarianceThreshold(0.01).fit_transform(X)\nscores = cross_val_score(SVC(), sel, y, cv=5)\nprint(scores.mean())',
     steps:[
       ['第 1 行：填补泄漏','X.median() 在全体上算。cross_val_score 的每一折里，验证集的中位数已经参与了训练折的填补。这是统计泄漏'],
       ['第 2 行：编码泄漏（隐蔽）','pd.get_dummies 在全体上决定了有哪些类别。若某个类别只出现在验证折里，它也会得到一列——训练时模型就知道了"存在这个类别"。更实际的危害是：真实部署时来了新类别，列数对不上直接崩。应该用 OneHotEncoder(handle_unknown="ignore")'],
       ['第 3 行：特征过滤泄漏','VarianceThreshold 用全体数据算方差来决定留哪些列。虽然它不用 y（无监督），但仍然用了验证集的分布信息'],
       ['第 4 行：SVC 没缩放','这不是泄漏，是另一个 bug。SVC 的 RBF 核对尺度极度敏感，未缩放时量纲大的特征完全主导，性能会莫名其妙地差'],
       ['第 5 行：cv=5 默认 KFold','如果 y 不平衡，某折可能没有正例；如果样本有分组，还有组泄漏。至少要 StratifiedKFold，有分组就 GroupKFold'],
       ['统一改写','pre = ColumnTransformer([("num", make_pipeline(SimpleImputer(strategy="median"), StandardScaler()), num_cols), ("cat", make_pipeline(SimpleImputer(strategy="most_frequent"), OneHotEncoder(handle_unknown="ignore")), cat_cols)])；pipe = make_pipeline(pre, VarianceThreshold(0.01), SVC())；cross_val_score(pipe, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0))'],
       ['验证改对了没','对比改前改后的分数。改完通常会掉几个点——那个掉下去的差额，就是原来泄漏偷来的性能']],
     a:'三处泄漏（填补、独热编码的类别集合、方差过滤）+ 两个 bug（SVC 未缩放、cv 未分层）。全部收进 Pipeline + 换 CV splitter',
     meta:'凡是出现在 cross_val_score 上面的、带 fit 或 fit_transform 的行，都是嫌疑犯'},
    {q:'GridSearchCV 选出 best_score_=0.91，能不能把 0.91 写进论文当泛化性能？',
     steps:[
       ['best_score_ 是什么','它是所有超参组合中，交叉验证平均分最高的那一个。注意"最高"这两个字'],
       ['最大值是有偏的','假设你试了 100 组超参，每组的 CV 分数 = 真实性能 + 噪声。取最大值时，你倾向于选中噪声恰好为正的那一组。组合越多、每折样本越少、噪声越大，这个乐观偏差越大。样本几百、试上千组超参时，虚高几个点很常见'],
       ['本质上这是"用验证集调参又用验证集评估"','和用测试集调参是同一类错误，只是隔了一层交叉验证所以不容易被察觉'],
       ['正解一：留出独立测试集','X_tr, X_te = split(...)；gs = GridSearchCV(pipe, grid, cv=5).fit(X_tr, y_tr)；报告 gs.score(X_te, y_te)，不是 gs.best_score_'],
       ['正解二：样本少就嵌套 CV','outer = cross_val_score(GridSearchCV(pipe, grid, cv=inner_cv), X, y, cv=outer_cv)。内层选参、外层评估，两层互不看对方的数据。代价是训练次数 = 外层折数 × 内层折数 × 超参组合数'],
       ['嵌套 CV 给的是什么','是"这整套选参流程"的期望泛化性能，不是某一组具体超参的性能。这恰恰是你该报告的东西——因为部署时你也是跑这套流程'],
       ['报告怎么写','"内层 5 折选参、外层 5 折评估的嵌套交叉验证 AUC = 0.86 (95% CI ...)"，而不是 "交叉验证 AUC = 0.91"']],
     a:'不能。best_score_ 是被挑出来的最大值，带选择偏差。要么留独立测试集报告，要么用嵌套交叉验证',
     meta:'任何"选出来的最好成绩"都不是无偏的性能估计。选和评必须用不同的数据'}
  ],
  feyn:['Pipeline 到底防住了什么？用"fit 发生在什么时候"这一句话解释。',
        '为什么把 scaler 写在 for 循环外面是交叉验证里最常见的错？',
        'Pipeline 防不住哪两类泄漏？它们该由什么来防？',
        '"删掉所有中间文件重跑一遍能得到同样的数字"——你现在的分析能过这一关吗？哪一步会先崩？'],
  exam:'BME 的分析流程天然有很多"从数据学参数"的步骤，全都得进 Pipeline：板内对照归一（每块板的缩放因子是从该板的对照孔学来的）、批次校正（ComBat 的参数从批次分布学来）、检测限填补（LOD 是仪器常数可以放外面，但"用训练集中位数填"就必须在里面）、特征选择（基因表达 p>>n 时尤其致命）。板内板间对照的正确处理是：归一化因子只能来自训练集所在板的对照孔；如果测试集来自完全新的板，就必须用该板自己的对照孔（这不算泄漏，因为对照孔是设计好的、部署时也有的）——区分标准始终是"部署那一刻这个信息拿不拿得到"。',
  pit:[
    {t:'Pipeline 外面先 fit_transform 再传进去', why:'Pipeline 只能管住它内部的步骤，上游做过的 fit 完全在它视野之外', fix:'把所有带 fit 的步骤搬进去；Pipeline 外面只留不学参数的操作'},
    {t:'ColumnTransformer 用列位置索引', why:'上游一次 merge 或 reindex 改了列顺序，错的列进了错的步骤，结果全错却不报任何错', fix:'一律用列名列表，或用 make_column_selector(dtype_include=...)'},
    {t:'用 pd.get_dummies 而不是 OneHotEncoder', why:'get_dummies 不记住类别集合，训练和推理列数可能不同；新类别直接崩', fix:'OneHotEncoder(handle_unknown="ignore") 放进 Pipeline'},
    {t:'把 GridSearchCV 的 best_score_ 当泛化性能报告', why:'它是上百个候选里的最大值，有选择偏差，系统性偏乐观', fix:'留独立测试集，或用嵌套交叉验证'},
    {t:'只把 Pipeline 存了，没存 random_state 和版本', why:'sklearn 默认值跨版本会变，半年后重跑得到不同的数', fix:'joblib 存 Pipeline + pip freeze + 记录种子和数据哈希'},
    {t:'以为有了 Pipeline 就不会泄漏', why:'Pipeline 管步骤顺序，不管样本怎么分组。组泄漏和时间泄漏它完全看不见', fix:'cv 参数传 GroupKFold / TimeSeriesSplit'}
  ]
},

'da.leak': {
  route:[
    {q:'指标好得离谱（AUC>0.95、准确率接近 100%），先查哪一条？', a:[
      {c:'样本有天然分组（病人/小鼠/板/中心）', to:'查组泄漏：同组样本是否跨了 train/test。这是第一嫌疑'},
      {c:'特征是从数据库或病历里拉出来的', to:'查目标泄漏：有没有列是结局的下游产物（出院诊断、住院天数、处置代码）'},
      {c:'流程里有预处理', to:'查统计泄漏：填补、缩放、编码、特征选择、PCA、重采样，是不是都在划分之后且只见训练集'}]},
    {q:'这个特征在预测的那一刻拿得到吗？', a:[
      {c:'拿得到', to:'合法'},
      {c:'拿不到（结局之后才产生）', to:'目标泄漏，删掉'},
      {c:'拿得到但取值受结局影响（如"住院天数"）', to:'也是泄漏。判据不是时间戳，是因果方向：它是结局的下游还是上游'}]},
    {q:'这一步用了哪些行的信息？', a:[
      {c:'只用训练折的行', to:'安全'},
      {c:'用了全部行（含验证/测试）', to:'泄漏。哪怕只是算了一个均值、一个方差、一个类别列表'},
      {c:'用了 y', to:'最危险的一类（有监督特征选择、target encoding）。p>>n 时能把纯噪声变成 0.9 的 AUC'}]},
    {q:'上线后掉点了，怎么定位？', a:[
      {c:'掉得很多且突然', to:'先查有没有某个特征在线上拿不到或含义变了'},
      {c:'内部测试高、外部数据低', to:'组泄漏或中心特异的捷径（扫描仪型号、染色批次、图像水印）'},
      {c:'随时间缓慢下降', to:'不是泄漏，是分布漂移。要监控和重训，不是修代码'}]}
  ],
  deep:'**泄漏的定义只有一句：训练时用到了部署那一刻拿不到的信息。** 所有花样都是这句话的特例。记住"部署那一刻"这个时间锚点，比背任何清单都管用。\n\n**入口一：统计泄漏（预处理跨越了划分线）。** 填补的中位数、缩放的 μσ、独热编码的类别集合、方差/相关性过滤的阈值、PCA 的主成分、目标编码的组均值、重采样（SMOTE）的近邻——每一个都是"从数据学来的参数"。任何一个在 split 之前或 cv 循环之外 fit，就漏了。修法统一：全部塞进 Pipeline。\n\n**入口二：目标泄漏（特征含结局的信息）。** 预测住院死亡却用了"出院诊断"；预测客户流失却用了"注销日期"；预测肿瘤良恶却用了"手术方式"（恶性才做根治术）。这类特征的共同点是**它在因果图上是结局的下游**。最隐蔽的版本是间接的：住院天数、用药总量、检查次数，都是被结局反向决定的。识别方法是对每个特征问"这个数字是在结局发生之前就定下来的吗"，而不只是问时间戳。\n\n**入口三：组泄漏（同一个体跨集）。** 病人的多张切片、小鼠的多个视野、同一块板的多个孔、同一个供体的多批细胞、同一篇文档的多个段落。模型学会认个体而不是认标签，内部指标飞起、外部验证塌掉。修法：GroupKFold，groups 填独立单位 id。\n\n**入口四：时间泄漏。** 随机划分纵向数据 = 用未来预测过去。更隐蔽的是**特征里的未来**：滑动均值的窗口包含了未来点、用整段数据算的标准化、把"最终诊断"回填到早期时间点。修法：TimeSeriesSplit + 所有窗口特征只用过去。\n\n**入口五：重复样本。** 数据集里有完全重复或近乎重复的行（导出两次、同一图像的不同增强、爬来的重复文档），随机划分后同一个样本同时在两边。修法：划分前先去重或做近重复检测。\n\n**入口六：多次窥视测试集。** 试了 50 个想法、每次都在测试集上看一眼分数、最后报告最好的那个。测试集已经变成了验证集，你在它上面做了 50 次超参搜索。修法：测试集只开一次，其余都在验证集上做。\n\n**入口七：捷径特征（shortcut / Clever Hans）。** 不违反上面任何一条，但模型学的是数据采集过程的副产品：不同医院的扫描仪型号、图像角落的日期水印、阳性样本恰好都在第二批做。这类最难查，因为它同时存在于训练和测试集里，只有换一个中心的外部数据才暴露。\n\n**统一的检查动作。** 一、指标好得离谱先怀疑自己不要庆祝。二、把 y 随机打乱重跑一遍——**如果打乱标签后性能还明显高于随机，那么泄漏是确定的**，这是最强的一个测试。三、看特征重要性排名，第一名如果是个你没想到的列，去查它是什么。四、留一个完全独立来源的外部测试集。',
  worked:[
    {q:'这个 pipeline 哪里泄漏了？找全并排序严重程度。\ndf["hosp_rate"] = df.groupby("hospital")["died"].transform("mean")\nX = df.drop(columns=["died"]); y = df["died"]\nX = pd.DataFrame(StandardScaler().fit_transform(X), columns=X.columns)\nsel = SelectKBest(f_classif, k=30).fit(X, y); X = sel.transform(X)\ncv = KFold(5, shuffle=True)\nprint(cross_val_score(LogisticRegression(), X, y, cv=cv).mean())',
     steps:[
       ['第 1 行，最严重：目标编码泄漏','hosp_rate 是用**包含该行自己的 y** 算出来的组均值。小医院尤其致命：一家医院只有 3 个病人，这个特征几乎直接编码了这个病人的标签。这一条能单独把 AUC 推到 0.9+'],
       ['第 4 行，次严重：有监督特征选择在折外','f_classif 用了全部的 y 来挑 30 个特征。p 大时纯噪声也能被挑中，交叉验证完全无法察觉——因为每一折的验证集，其标签早就参与了选择'],
       ['第 3 行：标准化泄漏','μσ 用全体算，是三者里最轻的，但仍然让每折的验证集信息进了训练'],
       ['第 5 行：KFold 没分层也没分组','死亡是罕见结局，不分层某折可能极少正例；同一家医院的病人高度相关，理想情况应该考虑按医院分组或至少把 hospital 当协变量'],
       ['排序理由','按"能虚高多少"排：目标编码 > 有监督特征选择 > 标准化 > 划分策略。前两个能造出完全虚假的结论，后两个只是让数字偏乐观'],
       ['修法','hosp_rate 要么删掉，要么用留一法/折内计算的 target encoding（category_encoders 的 TargetEncoder 放进 Pipeline，且必须带平滑）；SelectKBest 和 StandardScaler 全部进 Pipeline；cv 换 StratifiedGroupKFold(groups=hospital)'],
       ['验一下修没修干净','把 y 随机 shuffle 后重跑整条修好的流程，AUC 应该回到 0.5 左右。如果还明显高于 0.5，说明还有泄漏没找到']],
     a:'四处：目标编码用了自身的 y（最重）、有监督特征选择在折外、标准化在折外、CV 未分层未分组。修完用 shuffle-y 测试验证',
     meta:'target encoding 是最贵的一个坑：它看起来只是个"特征工程"，实际上是把标签直接抄进了特征'},
    {q:'这个 pipeline 哪里泄漏了？\ndf = df.sort_values("date")\ndf["y7"] = df["glucose"].rolling(7, center=True).mean()\ndf["target"] = (df["glucose"].shift(-1) > 180).astype(int)\nX = df[["y7","age","bmi"]]; y = df["target"]\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, shuffle=True)',
     steps:[
       ['先看任务','用今天及之前的信息，预测明天血糖是否 >180。这是时间序列预测'],
       ['第 2 行：特征里含未来','rolling(7, center=True) 是**居中窗口**，它包含了当前点之后 3 天的数据。预测明天时你手上没有后天的血糖。改成 rolling(7).mean()（默认右对齐，只看过去）'],
       ['更细一层：右对齐窗口也含今天','rolling(7) 的窗口是 t-6..t，包含 t。若 target 是 t+1，这没问题；但如果 target 是 t 本身，就要 .shift(1) 把当前值排除'],
       ['最后一行：随机划分时间序列','shuffle=True 让训练集里出现了测试集之后的日期。模型可以"记住"未来那一段的血糖水平。部署时你只有过去，所以这个评估毫无意义'],
       ['还有第三处：同一个病人的多天记录','如果这张表是多病人纵向数据，随机划分同时构成组泄漏——同一个病人的第 10 天在训练、第 11 天在测试，两天血糖几乎一样'],
       ['正确划分','按时间硬切：cut = df.date.quantile(0.8)；train = df[df.date <= cut]；test = df[df.date > cut]。多病人时更严格的做法是既按时间又按病人切，或用 TimeSeriesSplit 配合按病人分组'],
       ['最后检查','所有特征都问一遍："算这个数字时，我用到了 t 之后的任何数据吗？"包括标准化的 μσ——它也应该只用训练时间段算']],
     a:'三处：居中滑动窗口含未来、随机划分时间序列、多病人纵向数据同时有组泄漏。改右对齐窗口 + 按时间切 + 按病人分组',
     meta:'时间序列里，"特征算出来的那一刻用了哪些行"和"划分怎么切"要分开各查一遍'}
  ],
  feyn:['泄漏的定义只有一句话，是哪一句？用它解释 target encoding 为什么危险。',
        '为什么"把 y 随机打乱后重跑"是检测泄漏最强的测试？',
        '"住院天数"预测"是否死亡"，时间戳上它明明在结局之前，为什么还是泄漏？',
        '组泄漏、时间泄漏、统计泄漏，Pipeline 能挡住哪几个？剩下的靠什么挡？'],
  exam:'BME 里泄漏的高发区：一、病理/影像的组泄漏，同病人切片跨集，这是最常见的。二、批次效应当捷径——如果阳性样本恰好都在第二批做，模型学的是批次不是生物学，而且这个捷径同时存在于训练和测试集里，只有换个中心的外部数据才暴露；防它靠实验设计（每批内都有对照、随机化上机顺序），不是靠代码。三、图像的元数据泄漏：DICOM 头里的扫描仪型号、图像角落的日期和医院水印，CNN 都能读出来。四、临床特征的目标泄漏：出院诊断、用药总量、ICU 天数，全是结局的下游。五、板内对照的边界——用测试样本所在板的对照孔归一是**合法**的（部署时那块板也有对照孔），用全数据集的均值归一是**泄漏**。判据永远回到那一句：部署那一刻，这个信息拿不拿得到。',
  pit:[
    {t:'target encoding 用全表算组均值', why:'该行自己的 y 参与了自己特征的计算，小组尤其等于直接抄标签', fix:'折内计算 + 留一法 + 平滑，或干脆改用 one-hot / 频数编码'},
    {t:'有监督特征选择在交叉验证之外', why:'p>>n 时能把纯噪声挑成"强特征"，CV 完全看不出来，AUC 可以从 0.5 虚高到 0.9', fix:'SelectKBest 放进 Pipeline，跟着每折重新选'},
    {t:'把 id 类列留在特征里', why:'patient_id、accession number 常和标签相关（比如按病种编号），树模型能直接背下来', fix:'建模前显式列出并删除所有 id、时间戳、文件路径类列'},
    {t:'用全量数据做 PCA 或方差过滤', why:'无监督也是泄漏，用了测试集的分布信息', fix:'一切 fit 都进 Pipeline'},
    {t:'反复在测试集上试想法', why:'测试集退化成验证集，报告的是被挑出来的最好成绩', fix:'测试集只开一次；把试错全放在验证集或交叉验证上'},
    {t:'看到高分先庆祝', why:'泄漏只会让结果变好，所以它永远不会因为"结果太差"被发现', fix:'AUC>0.95 时先做 shuffle-y 测试和特征重要性排查，再谈结论'}
  ]
},

'da.apply': {
  route:[
    {q:'这个操作能不能写成整列表达式？', a:[
      {c:'能（四则运算、比较、np.where、.str.、.dt.、.clip）', to:'直接写列运算。整列下沉到 C，比 apply 快 10-100 倍'},
      {c:'单列的取值映射', to:'.map(字典)。比 apply(lambda) 快且意图更清楚'},
      {c:'多条互斥规则', to:'np.select([cond1, cond2], [val1, val2], default=...)，别写嵌套 apply'},
      {c:'确实写不成（要调外部 API、要复杂状态机）', to:'才用 apply。并且先想想能不能只对去重后的取值算一遍再 map 回去'}]},
    {q:'要修改原表还是新建列？', a:[
      {c:'按条件给部分行赋值', to:'df.loc[条件, "列"] = 值。单次索引，一定生效'},
      {c:'df[条件]["列"] = 值', to:'错。链式索引作用在副本上，原表不变，只给一个 Warning'},
      {c:'在 iterrows 里改 row', to:'错。row 是副本，改了等于没改'}]},
    {q:'apply 慢到不能忍怎么办？', a:[
      {c:'取值种类很少（如 1000 万行但只有 50 种字符串）', to:'对 unique 值算一遍做成字典，再 .map。复杂度从行数降到取值数'},
      {c:'是纯数值逐元素运算', to:'改 numpy 向量化，或 np.vectorize（只是语法糖，不快）、numba @njit（真快）'},
      {c:'确实要逐行且行数巨大', to:'考虑 polars / duckdb，或者先问一句这个计算是不是本来就该在数据库里做'}]}
  ],
  deep:'**向量化不是"写得短"，是"把循环从 Python 搬到 C"。** df["a"] * df["b"] 这一行，pandas 直接调 numpy 对两块连续内存做逐元素乘法：一次函数调用、循环在 C 里跑、还能用上 SIMD。df.apply(lambda r: r.a*r.b, axis=1) 则是：为每一行构造一个 Series 对象（分配内存、建 index）、调用一次 Python 函数、解释器走一遍字节码、再把结果收集起来。差距通常是 10-100 倍，而且行数越多差得越远。\n\n**三种等价理解。** 计算机层面：一次调用处理 n 个数 vs n 次调用各处理一个数，Python 的每次函数调用有约百纳秒的固定开销，乘以一千万行就是一秒起步。代数层面：向量化是把标量函数提升为作用在整个数组上的算子，和数学里"逐点定义的函数自然作用于函数空间"是同一件事。API 层面：pandas/numpy 的设计哲学是"你描述要什么，不描述怎么循环"——这和 SQL 是同一个思路。\n\n**apply 的三个变体要分清。** Series.map(字典或函数)：逐元素，用于取值映射。Series.apply(函数)：逐元素，和 map 差不多。DataFrame.apply(函数, axis=0)：逐列，函数收到的是一整列 Series，**这个其实很快**（只调用 n_cols 次）。DataFrame.apply(函数, axis=1)：逐行，调用 n_rows 次，**这个是慢的元凶**。看到 axis=1 就要警觉。\n\n**链式索引：为什么 df[df.a>0]["b"] = 1 不生效。** df[df.a>0] 是布尔索引，返回的是一个**新对象**（副本，因为布尔选择的结果在内存里不连续，没法做视图）。对这个临时副本的 ["b"] 赋值改的是副本，副本随即被丢弃，原表纹丝不动。pandas 只能给你一个 SettingWithCopyWarning，因为它自己也不确定那是视图还是副本。**唯一正确的写法是单次索引：df.loc[df.a>0, "b"] = 1**，一次 __setitem__ 调用直接写回原对象。pandas 3.0 的 Copy-on-Write 会让这件事从"有时生效"变成"永远不生效"，反而更好——错误变得确定了。\n\n**边界：什么时候 apply 是对的。** 一、要调外部服务或不可向量化的库。二、每行的计算依赖复杂分支且取值组合很多。三、行数很少（几千行），可读性比速度重要——过早向量化写出的天书也是成本。**但即使要用 apply，先问一句：这个函数的输入只有几种取值吗？** 一千万行只有 50 种药名，那就对 50 种算一遍存成字典再 map，速度差六个数量级。\n\n**和相邻概念的分界线。** 向量化 vs 并行：向量化是单核内把循环下沉，并行是多核分工，两者正交且应该先做向量化。np.vectorize 名字骗人，它内部还是 Python 循环，只提供广播语义不提供速度。真正要给逐元素的复杂逻辑提速，用 numba 的 @njit 或者改写成 numpy 的组合运算。',
  worked:[
    {q:'一千万行的用药表，要按 drug 名字查一个剂量换算系数（外部字典 factor 有 80 个键），算 dose_mg = dose_unit * factor[drug]。同事写了 df.apply(lambda r: r.dose_unit * factor[r.drug], axis=1)，跑了 40 分钟。怎么优化？',
     steps:[
       ['诊断','axis=1 的 apply，一千万次 Python 函数调用，每次还要构造一个 Series 对象。40 分钟完全符合预期'],
       ['关键观察：drug 只有 80 种','所以"查表"这件事的本质复杂度是 80 次，不是一千万次。剩下的一千万次是纯粹的浪费'],
       ['第一步把查表向量化','df["f"] = df["drug"].map(factor)。map 在 C 层做哈希查找，一千万行大约几百毫秒'],
       ['第二步把乘法向量化','df["dose_mg"] = df["dose_unit"] * df["f"]。两块连续内存的逐元素乘法，几十毫秒'],
       ['第三步处理没配上的','没在 factor 里的 drug 会得到 NaN。df["f"].isna().sum() 检查有多少，然后决定：是补字典、还是这些行本来就该丢掉。**原来的 apply 版本遇到未知 drug 会直接抛 KeyError**，现在变成静默 NaN，所以这个检查是必须补上的'],
       ['如果 drug 是分类变量还能更快','df["drug"] = df["drug"].astype("category")，之后 map 只对 80 个 category 做一次，速度再上一个台阶，内存也从一千万个字符串降到一千万个 int8'],
       ['结果','40 分钟 → 不到 1 秒，三个数量级']],
     a:'df["dose_mg"] = df["dose_unit"] * df["drug"].map(factor)，再补一句 isna 检查未知药名',
     meta:'apply 里如果只依赖少数几种取值，就把计算搬到取值上（map），别搬到行上'},
    {q:'这段代码有什么问题？\nfor idx, row in df.iterrows():\n    if row["conc"] < 0:\n        row["conc"] = 0\n    row["log_conc"] = np.log(row["conc"] + 1)\nprint(df["log_conc"].mean())',
     steps:[
       ['问题一：iterrows 给的是副本','row 是从这一行现造出来的 Series，改它对 df 毫无影响。循环跑完 df 一个字节都没变'],
       ['问题二：df["log_conc"] 根本不存在','循环里给 row 加了列不会加到 df 上，最后一行直接 KeyError'],
       ['问题三：iterrows 还有一个隐蔽陷阱','它把每一行转成 Series，而 Series 只有一个 dtype——所以整数列会被提升成 float，混合类型的行全变 object。即使你用 .loc 写回去，类型也可能悄悄变了'],
       ['问题四：慢','一千万行的 iterrows 是分钟级到小时级'],
       ['向量化改写','df["conc"] = df["conc"].clip(lower=0)；df["log_conc"] = np.log1p(df["conc"])。两行，毫秒级'],
       ['np.log1p 而不是 np.log(x+1)','log1p 在 x 接近 0 时数值精度更高，而且少一次数组分配'],
       ['顺便质疑一下业务逻辑','把负浓度截断成 0 是对的吗？负浓度通常意味着标准曲线外推或基线扣减过头。更稳的做法是标记出来（df["conc_neg"] = df.conc < 0）再决定，而不是静默改成 0——静默截断会让分布在 0 处堆一根柱子，后续统计全被影响']],
     a:'iterrows 改的是副本所以完全无效，最后一行 KeyError。改成 df["conc"].clip(lower=0) + np.log1p，并且不要静默截断负值',
     meta:'iterrows 里的任何赋值都是无效的。看见 iterrows 就先想能不能删掉它'}
  ],
  feyn:['为什么 df.a*df.b 比 df.apply(..., axis=1) 快 100 倍？慢在哪一个具体动作上？',
        'DataFrame.apply 的 axis=0 和 axis=1，哪个慢？为什么？',
        'df[df.a>0]["b"] = 1 为什么不生效？用"副本"和"视图"讲清楚。',
        '如果一定要 apply，什么情况下可以把它的调用次数从"行数"降到"取值种数"？'],
  exam:'湿实验转计算的人最容易在这里写出能跑但慢一千倍的代码，因为 for 循环是最直觉的表达。BME 场景里的典型：给每个孔按板布局查样本身份（应该 merge，不是 apply）；给每个基因名查通路注释（应该 map 字典）；对每行做单位换算（应该整列乘系数）；按阈值给荧光强度分门（应该 pd.cut 或 np.select）。经验法则：**只要你在写 for row in df 或 apply(axis=1)，先停三秒，问问这件事能不能用 merge / map / where / cut 表达。** 九成的情况能。',
  pit:[
    {t:'df.apply(f, axis=1)', why:'每行构造一个 Series 并调用一次 Python 函数，十万行以上就是数量级的浪费', fix:'拆成整列运算；多分支用 np.select；查表用 map 或 merge'},
    {t:'df[df.a>0]["b"] = 1', why:'布尔索引返回副本，赋值写在副本上，原表不变，只给一个容易被忽略的 Warning', fix:'df.loc[df.a>0, "b"] = 1，单次索引'},
    {t:'在 iterrows 里改 row', why:'row 是新造的副本，改它对原表完全没有影响，而且整行被统一成一个 dtype，类型可能悄悄变了', fix:'向量化；实在要逐行就用 df.loc[idx, col] = v 写回（但通常说明你该换个思路）'},
    {t:'np.log(x) 而 x 可能是 0', why:'得到 -inf 且不报错，后面 mean/std 全变 -inf 或 NaN，而且很晚才被发现', fix:'np.log1p，或先 clip/mask，并显式决定 0 值怎么处理'},
    {t:'用 np.vectorize 提速', why:'它只提供广播语义，内部仍是 Python 循环，几乎不比 apply 快', fix:'改写成真正的数组运算，或用 numba @njit'},
    {t:'apply 返回 Series 展开成多列', why:'每行构造一个 Series 再拼接，是最慢的一类用法', fix:'每个输出列各自向量化算一遍；或先算成 numpy 数组再一次性赋值'}
  ]
}

});
