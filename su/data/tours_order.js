/* 巡游的逻辑顺序：四层递进 + 前置依赖。engine 用它把巡游页排成一条路，而不是一堆卡片。 */
window.TOUR_ORDER = {
  stages:[
    {k:'base', name:'第一层 · 打底', en:'FOUNDATION',
     why:'先把两页共用的底层语言装进脑子：量级与心算（数学侧）、shape 与内存（代码侧）。这两条不走，后面每条线都会卡在"看不懂在说什么"。'},
    {k:'trunk',name:'第二层 · 主干', en:'TRUNK',
     why:'四根主干柱子：空间（线代）、变化（微积分）、不确定（概率组合）、离散与信号。每根都从一个最小的东西出发，长到能接应用。'},
    {k:'method',name:'第三层 · 方法', en:'METHOD',
     why:'把主干拼成能干活的方法：网络怎么搭、生成模型在建模什么、一个结论怎么才站得住。'},
    {k:'field',name:'第四层 · 实战', en:'IN THE LAB',
     why:'你下周就要干的活。每条都是一整条链：从原始数据走到一张能发的图 / 一个能交的模型。'}
  ],
  tours:{
    sense2scale:    {stage:'base',  order:1, pre:[]},
    shape2tensor:   {stage:'base',  order:2, pre:[]},
    linear2pca:     {stage:'trunk', order:3, pre:['shape2tensor']},
    slope2backprop: {stage:'trunk', order:4, pre:['linear2pca']},
    count2bayes:    {stage:'trunk', order:5, pre:['sense2scale']},
    bit2complexity: {stage:'trunk', order:6, pre:['shape2tensor']},
    i2rotation:     {stage:'trunk', order:7, pre:['linear2pca']},
    wave2image:     {stage:'trunk', order:8, pre:['i2rotation']},
    mlp2transformer:{stage:'method',order:9, pre:['slope2backprop']},
    gen2protein:    {stage:'method',order:10,pre:['count2bayes','mlp2transformer']},
    stat2claim:     {stage:'method',order:11,pre:['count2bayes']},
    flow2fig:       {stage:'field', order:12,pre:['stat2claim']},
    dose2ec50:      {stage:'field', order:13,pre:['slope2backprop']},
    wet2model:      {stage:'field', order:14,pre:['stat2claim','linear2pca']},
    seg2metric:     {stage:'field', order:15,pre:['mlp2transformer']}
  }
};
