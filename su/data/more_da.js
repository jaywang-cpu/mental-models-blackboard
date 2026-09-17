/* 数理宇宙 v2 · 加题：da 数据大陆（每节点 8 题，4 秒答"该用什么操作" + 4 推演"哪里有问题"） */
window.MORE = window.MORE || {};
Object.assign(window.MORE, {

'da.dataframe':[
  {q:'只想看每列的 dtype 和非空个数，一行代码？', a:'df.info()', how:'看表先看 info：行数、dtype、非空数三件事一次给全'},
  {q:'按标签取第 3 行第 "age" 列，和按位置取第 3 行第 2 列，各用什么？', a:'df.loc[3,"age"] 和 df.iloc[3,2]', how:'loc 认标签，iloc 认位置。混用是 pandas 报错的头号来源'},
  {q:'想知道 "batch" 这一列有几个不同取值、各多少行，用什么？', a:'df.batch.value_counts(dropna=False)', how:'看类别列的默认动作；dropna=False 才能看见 NaN 也是一档'},
  {q:'df 有 500 行但只有 87 只小鼠，要拿到"每只鼠一行"的表，第一步是什么？', a:'先 df.mouse_id.nunique() 确认 87，再 groupby("mouse_id").agg(...)', how:'行数不等于样本数时，先算独立单位个数，再聚合'},
  {q:'代码：sub = df[df.dose > 10]; sub["logdose"] = np.log(sub.dose)。跑出 SettingWithCopyWarning，问题在哪？', a:'sub 是切片视图还是副本不确定，赋值可能写不回也可能污染 df；改成 sub = df[df.dose > 10].copy()', how:'布尔筛选后要改值，先 .copy()。这个 warning 永远不要忽略'},
  {q:'代码：df["group"] = ["A","B"]*len(df)//2 报长度不匹配。更深的问题是什么？', a:'按位置硬塞标签，假设了行顺序有意义；分组信息应该 merge 进来或从已有列 map 出来', how:'凡是靠行顺序对齐的赋值都是定时炸弹，排序一变就全错'},
  {q:'df.mean() 得到的均值比手算大一截，df.shape 是 (1000, 12)。先怀疑什么？', a:'某列 dtype 是 object，被静默跳过了；或缺失值让分母不是 1000', how:'pandas 的 mean 默认 skipna=True，分母是非空个数，不是行数'},
  {q:'两位同事对同一份 csv 算出不同的样本数。最可能的分歧在哪一步？', a:'对"一行是什么"的定义不同：一个按行数、一个按病人去重后的个数', how:'先统一"一行 = 一个什么"，再谈任何统计量'}
],

'da.tidy':[
  {q:'一句话说清 tidy data 三条？', a:'一列一变量、一行一观测、一张表一类观测单位', how:'这三条是所有清洗动作的验收标准'},
  {q:'列名是 day1 day2 day3，要变成 day / value 两列，用什么？', a:'df.melt(id_vars=["mouse"], var_name="day", value_name="value")', how:'列名里藏着变量值 → melt 拉长'},
  {q:'长表 (mouse, gene, expr) 要变成"一行一只鼠、一列一个基因"，用什么？', a:'df.pivot(index="mouse", columns="gene", values="expr")', how:'喂 sklearn 前的标准动作：长表 → 宽表'},
  {q:'一列里存着 "M_2023_ctrl" 这种复合信息，先做什么？', a:'df.id.str.split("_", expand=True) 拆成三列再命名', how:'一格里塞多个变量 → 违反一列一变量，先拆'},
  {q:'表里有 mouse_id、slice_1_area、slice_2_area、slice_3_area。为什么这张表 tidy 不了？', a:'它混了两类观测单位（鼠和切片）；正确做法是拆成鼠表和切片表，切片表带 mouse_id 外键', how:'一张表一类观测单位。混在一起时任何聚合都会算错 n'},
  {q:'有人把宽表直接喂 groupby("day").mean() 却发现 day 不存在。根因？', a:'day 是列名不是列值，宽表里没有 day 这个变量；要先 melt', how:'groupby 只能按列值分组，列名里的变量必须先拉下来'},
  {q:'pivot 报 "Index contains duplicate entries"。说明数据里有什么？', a:'同一 (index, columns) 组合有多行，即同一只鼠同一基因有重复测量', how:'pivot 要求组合唯一；有重复就要么用 pivot_table 指定聚合，要么先想清楚重复是技术重复还是数据错误'},
  {q:'为了画图方便，同事把宽表和长表都存了一份，各自改。三个月后的问题是什么？', a:'两份会漂移且无法判断谁是真的；只留一份规范长表，宽表在用的时候现 pivot', how:'唯一真源。任何"两份同样的数据"最后都会不一样'}
],

'da.groupby':[
  {q:'split-apply-combine 三步各对应 pandas 的什么？', a:'groupby 切、agg/transform/apply 算、pandas 自动拼回', how:'所有分组操作都是这三步，区别只在中间那步返回什么形状'},
  {q:'要给每行减去它所在批次的均值，用 agg 还是 transform？', a:'transform，因为要保持原行数', how:'agg 每组塌成一行，transform 广播回原形状。选哪个只看你要几行'},
  {q:'一次算出每组的 n、均值、标准差，写法？', a:'df.groupby("g")["y"].agg(["count","mean","std"])', how:'报告里 mean 后面必须跟 n 和 sd，一次 agg 全拿到'},
  {q:'groupby 后有一组只有 1 行，std 是什么？', a:'NaN（ddof=1 时分母为 0）', how:'看到 std 全是 NaN，先查组大小而不是查公式'},
  {q:'代码：df.groupby("mouse").mean() 之后做 t 检验，n 用的是原始 5000 行的细胞数。错在哪？', a:'聚合后 n 已经是小鼠数（比如 12），细胞是伪重复；用 5000 会把 p 值压到假显著', how:'n 等于独立单位数。技术重复不增加 n，只减小测量噪声'},
  {q:'df.groupby("dose").mean() 返回几千行，dose 是浮点剂量。问题和修法？', a:'连续值每个自成一组；先 pd.cut 按预先定好的边界分箱', how:'连续变量不能直接分组，分箱边界必须写进方法学'},
  {q:'groupby("batch").apply(lambda g: expensive(g)) 在 8000 个组上跑了半小时。改法？', a:'能表达成内建 agg/transform 就换掉；不能就先转成 numpy 按组切片算', how:'apply 每组一次 Python 调用，组多就是灾难'},
  {q:'groupby("treat")["y"].mean() 结果里少了一个处理组，那组明明有数据。为什么？', a:'该组的 treat 值是 NaN，groupby 默认 dropna=True 把整组丢了', how:'groupby 会静默吞掉键为 NaN 的行，先 value_counts(dropna=False) 对一遍'}
],

'da.merge':[
  {q:'两批同样格式的数据上下堆，用什么？', a:'pd.concat([a,b], axis=0, ignore_index=True)', how:'同实体同列 = 形状操作 concat；不同列才是 merge'},
  {q:'要保证左表行数不变，merge 加哪个参数当护栏？', a:'validate="one_to_one" 或 "many_to_one"', how:'一行参数换掉一晚上调试，默认就写上'},
  {q:'想知道两边各有多少行没配上，怎么写？', a:'how="outer", indicator=True 之后看 _merge 列的 value_counts', how:'审计 join 的标准动作，先 outer 看清楚再决定用哪种 how'},
  {q:'merge 之后紧跟着的两行断言该写什么？', a:'assert len(out) == 期望行数；assert out[新列].isna().sum() == 未匹配数', how:'merge 前算期望、merge 后验实际'},
  {q:'a 有 100 行、b 有 320 行（每人 0-5 条），how="left" 得到 340 行。哪里出了问题？', a:'期望是 320 + a 中未匹配人数；多出来的行说明左表键有重复，查 a.duplicated("patient_id")', how:'行数 = 每个键上 左匹配数 × 右匹配数 求和'},
  {q:'inner merge 得 0 行且不报错。三个最常见根因？', a:'键 dtype 不同（int64 vs object）、字符串脏（空格/大小写/零填充）、键含 NaN', how:'NaN != NaN，键为空的行永远配不上且悄悄消失'},
  {q:'两张表各有 10 行同一个 sample_id，merge 后那个 id 变成 100 行。这叫什么，怎么办？', a:'多对多笛卡尔积；几乎永远是 bug，先确认哪一侧的键本该唯一', how:'m:m 出现就停下来，不要往下算'},
  {q:'同事用 pd.concat([a,b], axis=1) 把两张表并排放，结果一半是 NaN。为什么？', a:'concat(axis=1) 按 index 对齐而不是按位置；index 不同就错位', how:'有共同键就 merge，别指望 index 恰好对得上'}
],

'da.clean':[
  {q:'看整张表的缺失分布，一行代码？', a:'df.isna().sum().sort_values(ascending=False)', how:'清洗第一动作：先看缺在哪、缺多少'},
  {q:'MCAR / MAR / MNAR 的一句话区别？', a:'MCAR 缺失与任何变量无关；MAR 缺失可由已观测变量解释；MNAR 缺失取决于缺掉的那个值本身', how:'只有 MNAR 不能靠已有数据修，必须建模或报告'},
  {q:'仪器低于检测下限时留空，属于哪一类缺失？', a:'MNAR', how:'缺失本身携带信息（值太小）；直接删或填均值都会把分布往上拉'},
  {q:'想让模型知道"这里原本是缺的"，加什么？', a:'一列缺失指示 df["x_missing"] = df.x.isna().astype(int)，再填补', how:'填补丢掉的信息用指示列补回来，树模型尤其吃这一套'},
  {q:'代码：df.fillna(df.mean(), inplace=True) 在划分训练测试之前跑。两个问题各是什么？', a:'一、用了全量均值 → 测试集信息泄漏；二、均值填补压缩方差、削弱相关性', how:'任何用到统计量的填补都必须在训练集上 fit，再 transform 测试集'},
  {q:'df.dropna() 把 1000 行砍到 120 行。该怎么处理这个决定？', a:'先看是哪几列造成的（df.isna().sum()），可能一列缺 80% 应该整列删掉而不是删行', how:'删行前先看缺失的列分布，别让一根烂柱子拆掉整栋楼'},
  {q:'年龄列里有 -999 和 0，isna() 却是 0。问题在哪？', a:'哨兵值没被识别成缺失；先 df.age.replace([-999,0], np.nan)，再看分布', how:'读数据前问一句"缺失用什么编码"；-999、-1、0、空串、"NA" 都常见'},
  {q:'同一批样本的 ID 有 "M01" 和 "m01 "，去重后仍有重复。修法和顺序？', a:'先 str.strip().str.upper() 规范化，再 drop_duplicates；顺序反了会漏掉', how:'规范化永远在去重和 merge 之前'}
],

'da.normalize':[
  {q:'标准化和归一化各把数据变成什么？', a:'标准化 → 均值 0 方差 1；Min-Max 归一化 → 落到 [0,1]', how:'有离群点用标准化或 RobustScaler，要固定范围（图像/神经网络输入）用 Min-Max'},
  {q:'训练集上算，测试集上用。用 sklearn 该写哪两个方法？', a:'scaler.fit_transform(X_train) 和 scaler.transform(X_test)', how:'测试集永远只 transform，不 fit。这是最容易背也最容易忘的一条'},
  {q:'表达量数据跨了 5 个数量级，标准化之前先做什么？', a:'log1p 变换', how:'先修分布形状，再修尺度。标准化不改变偏态'},
  {q:'哪些模型对特征尺度敏感、哪些不敏感？', a:'敏感：KNN、SVM、PCA、任何带 L1/L2 正则的线性模型、梯度下降类；不敏感：决策树/随机森林/GBDT', how:'凡是算距离或加惩罚项的都要缩放'},
  {q:'代码：X = scaler.fit_transform(X); X_tr, X_te = train_test_split(X)。错在哪一行？', a:'第一行。scaler 见过了测试集的均值和方差，测试分数会偏乐观', how:'顺序永远是：先切，再在训练集上 fit'},
  {q:'交叉验证里手动先 scale 再 cross_val_score，分数比 Pipeline 版本高 3 个点。哪个可信？', a:'Pipeline 版本；手动版本每折的验证集都参与了 scaler 统计量', how:'把预处理放进 Pipeline，CV 才会在每折内部重新 fit'},
  {q:'RNA-seq 数据按样本做 Min-Max 归一化后，批次效应看起来消失了。该高兴吗？', a:'不该。按样本缩放会抹掉真实表达量差异；批次效应要用 ComBat 或把批次当协变量建模', how:'归一化解决尺度问题，不解决系统性偏倚，两者别混'},
  {q:'训练集 scaler 遇到测试集的极端值，标准化后是 8.3。要不要裁剪？', a:'不要偷偷裁；先确认是真实生理值还是录入错误，处理方式要写进方法', how:'测试集出现训练集没见过的范围，是分布漂移信号而不是数值问题'}
],

'da.split':[
  {q:'一只小鼠切了 20 张片，划分训练测试时按什么切？', a:'按 mouse_id 分组切（GroupShuffleSplit / GroupKFold），同一只鼠的所有切片必须在同一侧', how:'切分的单位 = 独立单位，不是行'},
  {q:'类别极不平衡（阳性 3%），用什么切分？', a:'stratify=y 的分层切分', how:'不分层时小类可能整块落进一侧，指标直接失真'},
  {q:'时间序列数据能用随机切分吗？', a:'不能，要按时间切（TimeSeriesSplit），训练集永远在测试集之前', how:'随机切等于用未来预测过去'},
  {q:'验证集和测试集各干什么？', a:'验证集选超参和早停，测试集只在全部定稿后跑一次', how:'测试集看几次就报几次乐观，看多了它就变成第二个验证集'},
  {q:'代码：train_test_split(X, y, random_state=42) 之后按 patient_id 发现同一病人两边都有。后果是什么？', a:'模型可以靠记住病人身份作弊，测试分数虚高，换新病人就崩', how:'凡是"同一实体多行"的数据，随机切分默认就是泄漏'},
  {q:'实验里对照组全在批次 1、处理组全在批次 2。此时任何切分都救不了什么？', a:'批次和处理完全混杂，模型学到的可能只是批次差异，无法归因', how:'这是设计问题不是切分问题，只能报告局限或重做实验'},
  {q:'跑了 40 组超参，报告的是测试集上最好的那组。问题是什么？', a:'用测试集选了模型，它已经是验证集；正确做法是嵌套 CV 或留一个从没看过的 holdout', how:'选择过程本身就是训练过程'},
  {q:'数据只有 30 只小鼠，切出 20% 测试集只有 6 只。更好的做法？', a:'用留一法或重复分组 K 折，报告分数的分布而不是单个数', how:'小样本时单次切分的方差比模型差异还大'}
],

'da.pipeline':[
  {q:'把标准化和模型绑成一个对象，用什么？', a:'sklearn.pipeline.Pipeline([("sc",StandardScaler()),("clf",LogReg())])', how:'Pipeline 的唯一目的就是让 fit 只发生在训练折上'},
  {q:'不同列做不同预处理（数值标准化、类别 one-hot），用什么？', a:'ColumnTransformer', how:'列级别的分支放进 ColumnTransformer，整体再进 Pipeline'},
  {q:'让别人一年后能复现结果，最低限度要固定哪三样？', a:'随机种子、包版本（requirements/lock）、原始数据的哈希', how:'代码相同不等于结果相同，种子和版本才是变量'},
  {q:'中间结果要不要提交进 git？', a:'不要；提交生成它的脚本和数据来源，中间产物走缓存目录', how:'能被重跑出来的东西不是源，只有脚本和原始数据是源'},
  {q:'notebook 里从上往下跑得到一个结果，重启内核后重跑结果不同。最可能的原因？', a:'单元格被乱序执行过，某个变量是旧状态残留；或者有未固定的随机性', how:'交付前必须 Restart & Run All 一次，跑不通的 notebook 等于没有结果'},
  {q:'GridSearchCV 直接搜 Pipeline 的参数，param_grid 的键该怎么写？', a:'用双下划线："clf__C":[0.1,1,10]', how:'步骤名__参数名，这个语法本身就是在提醒你参数属于哪一步'},
  {q:'脚本里写死了 /Users/me/Desktop/data.csv，同事跑不了。除了改成相对路径还该做什么？', a:'路径集中到一个 config，数据用脚本从确定来源下载并校验哈希', how:'可复现的第一步是"任何人一条命令拿到同一份输入"'},
  {q:'预处理代码在训练脚本和推理脚本里各写了一份。三个月后会发生什么？', a:'两份漂移，线上表现莫名下降；应该只有一份 Pipeline 对象被序列化后两边共用', how:'训练推理不一致是生产事故的第一大来源'}
],

'da.leak':[
  {q:'一句话定义数据泄漏？', a:'训练时用到了预测时拿不到的信息', how:'判断标准只有一条：这个信息在真实预测时刻存在吗'},
  {q:'最常见的三个泄漏入口？', a:'预处理统计量跨集、特征里含未来信息或标签衍生量、同一实体跨集', how:'背这三条，遇到高得离谱的分数先按这三条查'},
  {q:'交叉验证里防泄漏的标准手段？', a:'把所有 fit 类步骤塞进 Pipeline，交给 CV 在每折内部重新 fit', how:'凡是从数据里学参数的步骤都必须在折内'},
  {q:'训练集验证集测试集分数都是 0.99，先怀疑什么？', a:'泄漏，尤其是某个特征几乎等于标签', how:'好得不真实的第一解释永远是泄漏，不是模型好'},
  {q:'预测"病人是否会住院"，特征里有 "住院天数"。哪里错了？', a:'该特征是结果的衍生量，预测时刻不存在', how:'逐个特征问：这个字段是什么时候产生的'},
  {q:'先用全量数据做 SMOTE 过采样再切分。为什么是泄漏？', a:'测试集的样本参与合成了训练样本，模型见过测试集的插值副本', how:'重采样、特征选择、降维统统只能在训练折上做'},
  {q:'用全量数据跑 PCA 降到 50 维再做 CV，分数比 Pipeline 内做 PCA 高。哪个是真的？', a:'Pipeline 内的；PCA 的主成分方向用到了测试集的方差结构', how:'无监督步骤也会泄漏，"没用标签"不是免罪符'},
  {q:'样本 ID 有时序编号（早期采集编号小），把 ID 当特征后 AUC 飙升。这属于什么？', a:'泄漏（ID 编码了采集时间和分组），要删掉', how:'任何跟采集流程相关的元数据都可能是泄漏通道'}
],

'da.apply':[
  {q:'对一列做 x*2+1，正确写法？', a:'df.x*2+1（直接向量化），不要 apply', how:'能用算术符号表达的，永远不用 apply'},
  {q:'按条件二选一填值，用什么？', a:'np.where(df.x>0, "hi", "lo")', how:'两分支用 where，多分支用 np.select 或 pd.cut'},
  {q:'字符串列去空格转小写，用什么？', a:'df.s.str.strip().str.lower()', how:'.str 访问器是向量化的，比 apply(lambda s: s.strip()) 快一个量级'},
  {q:'把 code 列按字典映射成 label 列，用什么？', a:'df.code.map(mapping_dict)', how:'查表用 map；映射不到会变 NaN，记得检查'},
  {q:'代码：for i in range(len(df)): df.loc[i,"y"] = f(df.loc[i,"x"])。三个问题？', a:'逐行 loc 极慢、假设 index 是 0..n-1、边遍历边写入不安全；改成 df["y"] = f_vectorized(df.x)', how:'看到 for 循环遍历 DataFrame 就直接判定要重写'},
  {q:'df.apply(func, axis=1) 在 200 万行上跑不动。升级路径按什么顺序试？', a:'先找内建向量化写法 → 再 np.where/np.select → 再转 numpy 数组算 → 最后才 numba/多进程', how:'先换表达方式，再换执行引擎，别一上来就上并行'},
  {q:'df.apply(lambda r: r.a/r.b, axis=1) 和 df.a/df.b 结果不同，前者报错少。为什么？', a:'除零和 NaN 的处理路径不同；向量化版本给 inf/NaN，逐行版本可能被 lambda 里的 try 吞掉', how:'向量化让异常显式出现，这是优点不是缺点'},
  {q:'apply 返回 Series 想展开成多列，代码能跑但很慢。更好的写法？', a:'每个输出列各自向量化算一遍，或先算成 numpy 数组再一次性赋值', how:'每行构造一个 Series 再拼接，是 pandas 最慢的用法之一'}
]

});
