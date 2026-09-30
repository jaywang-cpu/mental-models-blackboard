(function () {
  'use strict';
  const D=window.EnglishFlowData,C=window.EnglishFlowCore,KEY='english-writing-flow-v1';
  const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const brickById=new Map(D.bricks.map(b=>[b.id,b])),sceneById=new Map(D.scenes.map(s=>[s.id,s])),moduleById=new Map(D.modules.map(m=>[m.id,m]));
  let storageWarning=false,db=load(),view='flow',libraryFilter='all',search='',lesson=null;
  let currentScene=sceneById.has(db.lastScene)||db.lastScene==='custom'?db.lastScene:'research';
  let hints=0,showReference=false,lastCheck=null,chosenBrick=null,builderScene=D.scenes[0].id,choices=[0,0,0],toastTimer;
  function blank(){return {version:1,drafts:{},practice:{},sessions:[],lastScene:'research'};}
  function load(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY));if(!raw||raw.version!==1)return blank();
      const clean=blank();
      for(const id of [...sceneById.keys(),'custom']){
        const d=raw.drafts?.[id];
        if(d&&typeof d.text==='string')clean.drafts[id]={text:d.text.slice(0,30000),idea:typeof d.idea==='string'?d.idea.slice(0,3000):'',updated:Number(d.updated)||0};
      }
      for(const id of brickById.keys()){
        const p=raw.practice?.[id];
        if(p&&typeof p==='object')clean.practice[id]={attempts:Math.max(0,Number(p.attempts)||0),review:!!p.review,last:Number(p.last)||0};
      }
      clean.sessions=Array.isArray(raw.sessions)?raw.sessions.filter(s=>s&&typeof s.text==='string'&&(sceneById.has(s.scene)||s.scene==='custom')&&Number.isFinite(s.time)).slice(-60).map(s=>({scene:s.scene,text:s.text.slice(0,30000),time:s.time})):[];
      if(sceneById.has(raw.lastScene)||raw.lastScene==='custom')clean.lastScene=raw.lastScene;
      return clean;
    }catch(e){storageWarning=true;return blank();}
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(db));return true;}catch(e){storageWarning=true;toast('浏览器无法保存记录，请用页面底部的「导出记录」备份。');return false;}}
  function draft(){return db.drafts[currentScene]||(db.drafts[currentScene]={text:'',idea:'',updated:Date.now()});}
  function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4300);}
  function heading(title,sub,right=''){return `<div class="section-heading"><div><h2>${title}</h2><p>${sub}</p></div>${right}</div>`;}
  function scene(){return sceneById.get(currentScene)||{id:'custom',title:'自己的写作',tag:'自由草稿 · 先保留想法',prompt:'写下你现在想表达的一件事。可以是文书、邮件，或今天的一个想法。',context:'先写一句，再接下一句。暂时不会的英文可以先用中文占位。',bricks:chosenBrick?[chosenBrick]:['notice','trying','contrast'],parts:[]};}
  function changeScene(id){if(!sceneById.has(id)&&id!=='custom')return;currentScene=id;db.lastScene=id;hints=0;lastCheck=null;showReference=false;save();renderFlow();}
  function render(){
    const route=location.hash.slice(1);view=['flow','library','build','review'].includes(route)?route:'flow';
    for(const a of document.querySelectorAll('[data-view]')){const active=a.dataset.view===view;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
    ({flow:renderFlow,library:renderLibrary,build:renderBuild,review:renderReview}[view])();
  }
  function navigate(to){if(location.hash==='#'+to){view=to;render();}else location.hash=to;}
  function renderFlow(){
    const s=scene(),d=draft(),stats=C.checkDraft(d.text);
    $('#main').innerHTML=heading('把想法，一句一句写出来','先写，再检查接法。卡住时，只拿下一块。',`<span class="count">${D.scenes.length} 个写作场景</span>`)+`
      <div class="scene-layout"><aside class="scene-list" aria-label="写作场景">${D.scenes.map((x,i)=>`<button class="scene-choice ${x.id===currentScene?'active':''}" data-action="scene" data-id="${x.id}" aria-pressed="${x.id===currentScene}"><span>${String(i+1).padStart(2,'0')}</span><span><b>${esc(x.title)}</b><small>${esc(x.tag)}</small></span><span class="arrow" aria-hidden="true">↗</span></button>`).join('')}<button class="scene-choice ${currentScene==='custom'?'active':''}" data-action="scene" data-id="custom" aria-pressed="${currentScene==='custom'}"><span>＋</span><span><b>自己的写作</b><small>文书 · 邮件 · 我的想法</small></span></button></aside>
      <section class="practice-card writing-card" aria-label="写作区"><div class="card-topline"><span class="pill">IDEA → SENTENCE → PARAGRAPH</span><span class="mini-label">WRITING DESK</span></div>
      <h3>${esc(s.title)}</h3><p class="writing-intent">${esc(s.prompt)}</p>
      ${currentScene==='custom'?`<label class="field-label" for="idea">先记下想法 · 中英文都可以</label><textarea id="idea" class="idea-input" rows="2" maxlength="3000" placeholder="我真正想表达的是……">${esc(d.idea)}</textarea>`:`<div class="idea-route">${s.parts.map((p,i)=>`${i?'<i aria-hidden="true">→</i>':''}<span>${esc(p.label)}</span>`).join('')}</div>`}
      <div class="draft-label"><label for="draft">你的英文草稿</label><span id="wordcount">${stats.wordCount} words</span></div>
      <textarea id="draft" class="draft-input" rows="7" maxlength="30000" lang="en-US" spellcheck="true" placeholder="先写第一句。还没想好下一句，也可以先开始。">${esc(d.text)}</textarea>
      <div class="draft-status"><span id="save-status">${storageWarning?'本地保存不可用，请导出备份':'草稿自动保存在当前浏览器'}</span><button class="text-button" data-action="save-version">保留这一版</button></div>
      <div class="actions"><button class="btn primary" data-action="check">检查这段的接法 <span aria-hidden="true">→</span></button><button class="btn" data-action="hint">给我下一块</button><button class="btn" data-action="reference">${showReference?'收起参考':'看看参考写法'}</button><button class="btn small" data-action="copy-draft">复制草稿</button></div>
      <div id="writing-hints" aria-live="polite"></div><div id="checks" aria-live="polite"></div><div id="reference"></div>
      <p class="help-line">写自己的意思即可。参考写法提供接法，不要求逐字照搬。</p>
      <div class="related">${s.bricks.map(id=>`<button class="small-chip" data-action="lesson" data-id="${id}">${esc(brickById.get(id).title)} ↗</button>`).join('')}</div></section></div>
      <div class="how-it-works"><div><span>01</span><b>先写一个意思</b><p>事实、发现、问题，选一点起步。</p></div><div><span>02</span><b>再接下一块</b><p>补原因、转折、例子或下一步。</p></div><div><span>03</span><b>检查，再精简</b><p>先核对接法，再看整段意思是否连贯。</p></div></div>`;
    renderHints();renderChecks();renderReference();
  }
  function renderHints(){
    const el=$('#writing-hints');if(!el)return;
    if(!hints){el.innerHTML='';return;}
    const s=scene();
    if(s.parts.length){el.innerHTML=`<div class="hint-stack">${s.parts.slice(0,hints).map(p=>`<div class="hint-row"><small>${esc(p.label)}</small><span>${esc(p.cue)}</span></div>`).join('')}</div><p class="muted">借用起步块，后面的事实由你来写。</p>`;}
    else{
      const b=brickById.get(chosenBrick)||brickById.get('notice');
      el.innerHTML=`<div class="hint-row"><small>试一块</small><span>${esc(b.frame)}</span></div><p class="help-line">${esc(b.rule)} <button class="text-button" data-action="lesson" data-id="${b.id}">练这块 ↗</button></p>`;
    }
  }
  function renderChecks(){
    const el=$('#checks');if(!el)return;if(!lastCheck){el.innerHTML='';return;}
    const result=lastCheck;
    el.innerHTML=`<section class="check-panel"><div class="check-heading"><h4>接法检查</h4><span>${result.issues.length?result.issues.length+' 处值得修改':'已检查覆盖的规则'}</span></div>
      ${result.issues.length?result.issues.map((issue,i)=>`<article class="issue"><p class="issue-label">${esc(issue.label)}</p><p class="issue-before">${esc(issue.fragment)}</p><p class="issue-after">→ ${esc(issue.suggestion)}</p><p class="muted">${esc(issue.reason)}</p><div class="related">${issue.id!=='embedded'?`<button class="small-chip" data-action="fix" data-index="${i}">采用这处修改</button>`:''}<button class="small-chip" data-action="lesson" data-id="${issue.brick}">练一下对应积木 ↗</button></div></article>`).join(''):'<p class="muted">在当前覆盖的接法中，没有发现问题。</p>'}
      ${result.hasChinese?'<p class="placeholder-note">草稿里还有中文占位。意思可以先留下，再逐块补成英文。</p>':''}
      <p class="scope-note">检查范围：部分助动词、动词形式、固定搭配及问句语序。没有提示不等于全文语法已通过。</p></section>`;
  }
  function renderReference(){
    const el=$('#reference');if(!el)return;if(!showReference){el.innerHTML='';return;}
    const s=scene();
    if(s.parts.length){el.innerHTML=`<section class="reference-panel"><p class="mini-label">一种参考写法 · 核对自己的事实再使用</p><div class="reference">${s.parts.map(p=>`<div class="reference-line"><small>${esc(p.label)}</small><p>${esc(p.options[0])}</p></div>`).join('')}</div><div class="actions"><button class="btn small" data-action="copy-reference">复制参考</button><button class="btn small" data-action="build-this" data-id="${s.id}">换积木，看看其他写法 ↗</button></div></section>`;}
    else{const b=brickById.get(chosenBrick)||brickById.get('notice');el.innerHTML=`<section class="reference-panel"><p class="mini-label">这块的完整例句</p><p class="lesson-example">${esc(b.example)}</p><p class="muted">${esc(b.join)}</p></section>`;}
  }
  function storeInput(){
    const d=draft();if($('#draft'))d.text=$('#draft').value;if($('#idea'))d.idea=$('#idea').value;d.updated=Date.now();
    const saved=save();if($('#save-status'))$('#save-status').textContent=saved?'草稿已保存':'保存失败，请导出备份';
    if($('#wordcount'))$('#wordcount').textContent=C.checkDraft(d.text).wordCount+' words';
  }
  function runCheck(){storeInput();if(!draft().text.trim()){toast('先写一句，再来检查接法。');$('#draft').focus();return;}lastCheck=C.checkDraft(draft().text);renderChecks();}
  function saveVersion(){
    storeInput();const text=draft().text.trim();if(!text){toast('先写一点内容，再保留这一版。');return;}
    const last=db.sessions.filter(x=>x.scene===currentScene).at(-1);
    if(last?.text===text){toast('这一版已经保留。');return;}
    db.sessions.push({scene:currentScene,text,time:Date.now()});db.sessions=db.sessions.slice(-60);save();toast('已保留这一版，可以继续修改。');
  }
  function renderLibrary(){
    $('#main').innerHTML=heading('每一块，都带着接法',`${D.bricks.length} 组积木 · ${D.modules.length} 个板块 · ${D.bricks.reduce((n,b)=>n+b.quizzes.length,0)} 道接法练习`,`<label class="sr-only" for="library-search">搜索积木</label><input id="library-search" class="search" type="search" placeholder="搜索：does、转折、完成时…" value="${esc(search)}">`)+`<div class="filters" aria-label="积木板块">${[{id:'all',name:'全部'},...D.modules].map(m=>`<button class="filter ${libraryFilter===m.id?'active':''}" data-action="filter" data-id="${m.id}" aria-pressed="${libraryFilter===m.id}">${m.name}</button>`).join('')}</div><div id="library-grid" class="library-grid"></div>`;
    renderCards();
  }
  function renderCards(){
    const term=search.toLowerCase().trim();const list=D.bricks.filter(b=>(libraryFilter==='all'||b.module===libraryFilter)&&(!term||[b.title,b.frame,b.intent,b.rule,b.join,b.example].join(' ').toLowerCase().includes(term)));
    $('#library-grid').innerHTML=list.map(b=>{const p=db.practice[b.id];return `<button class="brick-card" data-action="lesson" data-id="${b.id}"><div class="brick-top"><span>${esc(moduleById.get(b.module).name)}</span><span>↗</span></div><h3>${esc(b.title)}</h3><div class="brick-frame" lang="en">${esc(b.frame)}</div><p>${esc(b.intent)}</p><div class="brick-bottom"><span>用法 · 接法 · 练习</span>${p?.review?'<strong>值得再练</strong>':p?.attempts?'<span>已练 '+p.attempts+' 次</span>':'<span>打开练一块</span>'}</div></button>`;}).join('')||'<div class="empty">没有找到这块。试试搜索一个英文词或中文意思。</div>';
  }
  function openLesson(id){
    const b=brickById.get(id);if(!b)return;
    lesson={id,index:0,selected:null,correct:false,misses:0,tried:new Set(),done:false};renderLesson();
    if(!$('#lesson').open)$('#lesson').showModal();
  }
  function renderLesson(){
    const b=brickById.get(lesson.id),q=b.quizzes[lesson.index];
    $('#lesson-body').innerHTML=`<div class="dialog-head"><div><p class="mini-label">${esc(moduleById.get(b.module).name)} · 一次练一块</p><h2 id="lesson-title">${esc(b.title)}</h2></div><button class="close" data-action="close-lesson" aria-label="关闭积木练习">×</button></div><p class="lesson-meta">${esc(b.intent)}</p><div class="lesson-frame" lang="en">${esc(b.frame)}</div><p class="lesson-meta"><b>接法</b>${esc(b.rule)}</p><p class="lesson-example" lang="en">${esc(b.example)}</p><p class="lesson-meta"><b>接下去</b>${esc(b.join)}</p><details class="lesson-extras"><summary>容易放错的那一块</summary><p class="wrong">× ${esc(b.trap)}</p><p>✓ ${esc(b.fix)}</p><p>${esc(b.tip)}</p></details>
      <section class="drill">${lesson.done?`<p class="mini-label">本轮完成</p><h3>把这块带进你自己的句子。</h3><p class="drill-prompt">${lesson.misses?'这轮有接法需要再练，已加入复习。':'两题都完成了。换个意思再写一次，看看能不能独立用上。'}</p><div class="actions"><button class="btn primary" data-action="use-brick" data-id="${b.id}">带这块去写 →</button><button class="btn" data-action="lesson" data-id="${b.id}">再练一轮</button></div>`:`<p class="mini-label">接法练习 ${lesson.index+1} / ${b.quizzes.length}</p><h3>选出能接上的一块</h3><p class="drill-prompt">${esc(q.prompt)}</p><div class="quiz-options">${q.options.map((o,i)=>`<button class="quiz-option ${lesson.tried.has(i)?(i===q.answer?'correct':'incorrect'):''}" data-action="answer" data-index="${i}" ${lesson.correct||lesson.tried.has(i)?'disabled':''}><small>${String.fromCharCode(65+i)}</small><span>${esc(o)}</span></button>`).join('')}</div><div class="feedback ${lesson.selected!==null?(lesson.correct?'good':'bad'):''}" aria-live="polite">${lesson.selected!==null?`${lesson.correct?'这块接对了。':'这一块需要调整。'} ${esc(q.note)}`:'先看当前这块要求什么，再选后面的形式。'}</div>${lesson.correct?`<button class="btn primary" data-action="next-question">${lesson.index===b.quizzes.length-1?'完成这轮练习':'换个意思，再试一次'} →</button>`:''}`}</section>`;
  }
  function answer(index){
    if(!lesson||lesson.done||lesson.correct||lesson.tried.has(index))return;
    const b=brickById.get(lesson.id),q=b.quizzes[lesson.index];if(!q.options[index])return;
    lesson.selected=index;lesson.tried.add(index);lesson.correct=index===q.answer;
    if(!lesson.correct){lesson.misses++;const p=db.practice[b.id]||(db.practice[b.id]={attempts:0,review:false,last:0});p.review=true;p.last=Date.now();save();}
    renderLesson();const focus=lesson.correct?$('#lesson [data-action="next-question"]'):$('#lesson .quiz-option:not(:disabled)');focus?.focus({preventScroll:true});
  }
  function nextQuestion(){
    if(!lesson?.correct)return;const b=brickById.get(lesson.id);
    if(lesson.index<b.quizzes.length-1){lesson.index++;lesson.selected=null;lesson.correct=false;lesson.tried=new Set();}
    else if(!lesson.done){lesson.done=true;const p=db.practice[b.id]||(db.practice[b.id]={attempts:0});p.attempts++;p.review=lesson.misses>0;p.last=Date.now();save();}
    renderLesson();($('#lesson .quiz-option')||$('#lesson [data-action="use-brick"]'))?.focus({preventScroll:true});
  }
  function renderBuild(){
    const s=sceneById.get(builderScene);if(!s)return;
    $('#main').innerHTML=heading('积木熟了，把它们接起来','每次替换一块，看看整个段落怎样继续。')+`<div class="build-controls"><label class="muted" for="build-scene">要表达的意思</label><select class="select" id="build-scene">${D.scenes.map(x=>`<option value="${x.id}" ${x.id===s.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select></div><p class="build-intent">${esc(s.prompt)}</p><div class="build-layout"><section class="builder" aria-label="选择句块">${s.parts.map((p,i)=>`<div class="build-slot"><p class="slot-label"><b>0${i+1}</b>${esc(p.label)} · 选一块</p><div class="slot-options">${p.options.map((o,j)=>`<button class="slot-option ${choices[i]===j?'active':''}" data-action="choose" data-slot="${i}" data-index="${j}" aria-pressed="${choices[i]===j}">${esc(o)}</button>`).join('')}</div></div>`).join('')}</section><section class="built-card" aria-label="组好的段落"><p class="mini-label">你的组合 · 完整句块</p><div class="built-sentence" id="built-output" lang="en" aria-live="polite">${esc(C.compose(s,choices))}</div><div class="connection-notes"><p><b>为什么能接起来</b></p>${s.parts.map(p=>`<p>${esc(p.label)}：${esc(p.note)}</p>`).join('')}<p class="scope-note">这些选项按当前场景配好。自由替换内容后，需要重新核对语法和意思。</p></div><div class="actions"><button class="btn primary" data-action="write-built">带到草稿，写自己的版本 →</button><button class="btn" data-action="copy-built">复制</button></div></section></div>`;
  }
  function renderReview(){
    const practiced=Object.values(db.practice).filter(x=>x.attempts>0).length,review=D.bricks.filter(b=>db.practice[b.id]?.review),draftCount=Object.values(db.drafts).filter(d=>d.text.trim()).length;
    $('#main').innerHTML=heading('看见练过的，再往前写','记录练习与草稿，不把做对一道题当成已经掌握。')+`<div class="review-stats"><div class="stat"><strong>${practiced}<small> / ${D.bricks.length}</small></strong><span>练过的积木</span></div><div class="stat"><strong>${draftCount}</strong><span>正在写的草稿</span></div><div class="stat"><strong>${db.sessions.length}</strong><span>保留的写作版本</span></div></div><div class="review-columns"><section class="review-panel"><h3>值得再练的接法</h3>${review.length?review.map(b=>`<div class="review-row"><span>${esc(b.title)}<small>${esc(b.frame)}</small></span><button class="btn small" data-action="lesson" data-id="${b.id}">再练一块</button></div>`).join(''):'<p class="muted">这里会收集练习中放错的积木。先去写一点，或选一块练起。</p><p class="related"><a class="btn small" href="#library">去积木库 →</a></p>'}</section><section class="review-panel"><h3>继续你的草稿</h3>${Object.entries(db.drafts).filter(([,d])=>d.text.trim()).sort((a,b)=>b[1].updated-a[1].updated).map(([id,d])=>`<div class="review-row"><span>${esc(sceneById.get(id)?.title||'自己的写作')}<small>${C.checkDraft(d.text).wordCount} words · ${formatDate(d.updated)}</small></span><button class="btn small" data-action="resume" data-id="${id}">继续写</button></div>`).join('')||'<p class="muted">从第一句开始。写作区会自动保存你的草稿。</p>'}</section></div><section class="review-panel version-panel"><h3>保留的版本 <small>最近 ${db.sessions.length} 版 · 最多保留 60 版</small></h3>${db.sessions.slice().reverse().map((s,i)=>`<details class="saved-version"><summary>${esc(sceneById.get(s.scene)?.title||'自己的写作')} <span>${formatDate(s.time)}</span></summary><p lang="en">${esc(s.text)}</p><button class="text-button" data-action="copy-version" data-index="${db.sessions.length-1-i}">复制这一版</button></details>`).join('')||'<p class="muted">在写作区点击「保留这一版」，就能留下修改前的版本。</p>'}</section>`;
  }
  function formatDate(t){return new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(t||Date.now()));}
  async function copy(text){if(!text.trim()){toast('还没有可复制的内容。');return;}try{await navigator.clipboard.writeText(text);toast('已复制。');}catch(e){toast('复制不可用，可以选中文本后手动复制。');}}
  function exportData(){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}));a.href=url;a.download='english-writing-gym-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('练习与草稿已导出。');}
  document.addEventListener('input',e=>{
    if(e.target.id==='draft'||e.target.id==='idea'){storeInput();lastCheck=null;renderChecks();}
    if(e.target.id==='library-search'){search=e.target.value;renderCards();}
  });
  document.addEventListener('change',e=>{if(e.target.id==='build-scene'&&sceneById.has(e.target.value)){builderScene=e.target.value;choices=[0,0,0];renderBuild();}});
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el||el.disabled)return;
    const action=el.dataset.action,id=el.dataset.id,index=Number(el.dataset.index);
    if(action==='scene')changeScene(id);
    else if(action==='hint'){hints=Math.min(hints+1,scene().parts.length||1);renderHints();}
    else if(action==='reference'){showReference=!showReference;el.textContent=showReference?'收起参考':'看看参考写法';renderReference();}
    else if(action==='check')runCheck();
    else if(action==='fix'){
      const issue=lastCheck?.issues[index];if(!issue||issue.id==='embedded')return;
      const field=$('#draft');field.value=field.value.slice(0,issue.start)+issue.suggestion+field.value.slice(issue.end);storeInput();lastCheck=C.checkDraft(field.value);renderChecks();toast('已修改这一处。请再读一遍，核对是否保留你的意思。');
    }
    else if(action==='save-version')saveVersion();
    else if(action==='copy-draft')copy(draft().text);
    else if(action==='copy-reference')copy(C.compose(scene(),[0,0,0]));
    else if(action==='filter'){libraryFilter=id;renderLibrary();}
    else if(action==='lesson')openLesson(id);
    else if(action==='close-lesson')$('#lesson').close();
    else if(action==='answer')answer(index);
    else if(action==='next-question')nextQuestion();
    else if(action==='use-brick'){
      chosenBrick=id;currentScene='custom';db.lastScene='custom';hints=1;lastCheck=null;showReference=false;save();$('#lesson').close();navigate('flow');setTimeout(()=>$('#draft')?.focus(),0);
    }
    else if(action==='build-this'){builderScene=id;choices=[0,0,0];navigate('build');}
    else if(action==='choose'){
      const slot=Number(el.dataset.slot),s=sceneById.get(builderScene);if(!s.parts[slot]?.options[index])return;choices[slot]=index;renderBuild();document.querySelector(`[data-action="choose"][data-slot="${slot}"][data-index="${index}"]`)?.focus({preventScroll:true});
    }
    else if(action==='copy-built')copy(C.compose(sceneById.get(builderScene),choices));
    else if(action==='write-built'){
      const s=sceneById.get(builderScene),text=C.compose(s,choices);currentScene=s.id;db.lastScene=s.id;
      const d=draft();if(d.text.trim()&&!d.text.includes(text))d.text+='\n\n'+text;else if(!d.text.trim())d.text=text;
      d.updated=Date.now();lastCheck=null;hints=0;showReference=false;save();navigate('flow');toast('参考组合已加入草稿。换入你的事实，再写自己的版本。');
    }
    else if(action==='resume'){currentScene=id;db.lastScene=id;hints=0;lastCheck=null;showReference=false;save();navigate('flow');}
    else if(action==='copy-version'){const s=db.sessions[index];if(s)copy(s.text);}
    else if(action==='export')exportData();
  });
  $('#lesson').addEventListener('close',()=>{if(view==='library')renderCards();if(view==='review')renderReview();});
  window.addEventListener('hashchange',render);
  render();
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}());
