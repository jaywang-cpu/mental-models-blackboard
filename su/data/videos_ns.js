/* 数感大陆的视频层：每条链接都用搜索查证过存在。吃饭时看的顺序：先看 ★ 那几条。 */
window.VIDEOS = window.VIDEOS || {};
Object.assign(window.VIDEOS, {
 'ns.magnitude':[
   {n:'★ Powers of Ten (1977) · 十的次方',by:'Charles & Ray Eames · 9 分钟',u:'https://www.youtube.com/watch?v=0fKBhvDjuy0',t:0,
    why:'从野餐毯每 10 秒拉远 10 倍，一路到 10^24 再钻进细胞。看完你对"一个量级"的体感会彻底不一样'},
   {n:'Powers of Ten 重访：1977 之后我们学到了什么',by:'Aeon Video',u:'https://aeon.co/videos/revisiting-powers-of-ten-what-weve-learned-about-the-universe-since-1977',t:0,
    why:'配着看，补上这四十多年宇宙尺度上的新东西'}
 ],
 'ns.log_scale':[
   {n:'★ Log Tables · 对数表是怎么用的',by:'Numberphile',u:'https://www.youtube.com/watch?v=VRzH4xB0GdM',t:0,
    why:'没有计算器的年代，人靠这张表把乘法做成加法 —— 对数尺度的原始动机'},
   {n:'Weber 定律 · 为什么人的感觉本身就是对数的',by:'Numberphile',u:'https://www.youtube.com/watch?v=hHG8io5qIU8',t:0,
    why:'亮度、响度、重量，人脑天生按比例感知。这解释了为什么 log 轴"看着舒服"'},
   {n:'对数尺度',by:'Khan Academy',u:'https://www.youtube.com/watch?v=sBhEi4L91Sg',t:0,
    why:'最短的一条：怎么读 log 轴上的刻度'}
 ],
 'ns.estimate':[
   {n:'★ 一个聪明办法估出巨大的数',by:'TED-Ed · Michael Mitchell',u:'https://www.youtube.com/watch?v=0YzvupOX8Is',t:0,
    why:'费米怎么用 10 的幂在几十秒里估出离谱的大数。这条最适合吃饭看'},
   {n:'芝加哥有多少调音师',by:'Fermi 问题经典例',u:'https://www.youtube.com/watch?v=05dogHLMTPw',t:0,
    why:'把一个看似没法回答的问题，拆成五个都能猜的小问题'},
   {n:'Fermi 问题实战：现场拆解',by:'Fermi problem challenge',u:'https://www.youtube.com/watch?v=X7vG-txKlWo',t:0,
    why:'看别人现场拆，比自己读方法有用'}
 ],
 'ns.square_trick':[
   {n:'★ 尾 5 平方为什么成立',by:'Why It Works',u:'https://www.youtube.com/watch?v=GTKH1Lg8x8E',t:0,
    why:'100x²+100x+25 = 100·x(x+1)+25 —— 跟站里那圈 L 形是同一件事'},
   {n:'心算的秘密',by:'Arthur Benjamin',u:'https://www.youtube.com/watch?v=1JW9BA57aR8',t:0,
    why:'Harvey Mudd 的数学魔术师，从平方到多位数乘法一路讲下来'},
   {n:'心算的魔法与数学',by:'Art Benjamin 讲座',u:'https://www.youtube.com/watch?v=0SwBohn7ELw',t:0,
    why:'长一点的完整讲座，边吃边看正好'}
 ],
 'ns.mental_mult':[
   {n:'★ 心算的秘密 · 乘法部分',by:'Arthur Benjamin',u:'https://www.youtube.com/watch?v=1JW9BA57aR8',t:0,
    why:'两位数乘法的拆块法，跟站里那个长方形四块是同一招'},
   {n:'心算加减法技巧',by:'Arthur Benjamin',u:'https://www.youtube.com/watch?v=Q2D8pp9lzgQ',t:0,
    why:'先把加减练顺，乘法才扛得住'}
 ],
 'ns.divisibility':[
   {n:'★ 被 11 整除的判定：用模运算证明',by:'Divisibility by 11 proof',u:'https://www.youtube.com/watch?v=nyLFAhjy20U',t:0,
    why:'10 ≡ −1 (mod 11) 为什么导出交替和 —— 站里那条权重塌缩的严格版'},
   {n:'被 3 整除怎么判，以及为什么',by:'Modular arithmetic Q4',u:'https://www.youtube.com/watch?v=ykp1MSriK2g',t:0,
    why:'数位和法则的来历，两分钟讲完'},
   {n:'一个一千年的老技巧：被 37 整除（含弃九法）',by:'Numberphile 风格',u:'https://www.youtube.com/watch?v=Vd6WJLKHqqk',t:0,
    why:'弃九法校验就是模 9 同态，做心算时用来自查'}
 ],
 'ns.abacus':[
   {n:'★ 珠算入门：日本算盘怎么用',by:'Soroban Part 1',u:'https://www.youtube.com/watch?v=pAAC75lheGE',t:0,
    why:'上珠 5 下珠 1，先把手上的盘拨顺，心像才立得起来'},
   {n:'Flash Anzan：心算比计算器还快',by:'Soroban 进阶',u:'https://www.youtube.com/watch?v=iKDL9qUE49U',t:0,
    why:'看闪算比赛，理解"数字变成位置"到底是什么状态'},
   {n:'把算盘当成看见数的工具',by:'Visualising Numbers with Soroban',u:'https://www.youtube.com/watch?v=-br2yp3tQ1M',t:0,
    why:'讲清楚它为什么对建立位值感有用，不只是快'}
 ],
 'ns.average_trap':[
   {n:'★ 平均速度与调和平均',by:'Thursday Tidbit',u:'https://www.youtube.com/watch?v=qvaODAB2izw',t:0,
    why:'去 60 回 40 平均不是 50，视频里把权重那一步讲透'},
   {n:'上坡 40 下坡 60，平均速度是多少',by:'Innk',u:'https://www.youtube.com/watch?v=BOk7-X-ILy4',t:0,
    why:'同一道题的另一种讲法，用来自查有没有真懂'}
 ]
});
