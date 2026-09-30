const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),context={window:{}};
vm.createContext(context);
for(const file of ['english-flow-data.js','english-flow-core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const D=context.window.EnglishFlowData,C=context.window.EnglishFlowCore;

test('the library has complete lessons, valid choices, and valid scene references',()=>{
  assert.equal(C.validateData(D).length,0);
  assert.equal(D.modules.length,7);assert.equal(D.bricks.length,28);assert.equal(D.scenes.length,9);
  for(const m of D.modules)assert.equal(D.bricks.filter(b=>b.module===m.id).length,4);
});

const fixtures=[
  ['Does this makes sense?','do-question','Does this make'],
  ['Did the model predicted the result?','do-question','Did the model predict'],
  ["It doesn't necessarily means the model is better.",'do-base',"doesn't necessarily mean"],
  ["We didn't checked the results.",'do-base',"didn't check"],
  ['The model can learns from new data.','modal-base','The model can learn'],
  ['Could you explains this?','modal-question','Could you explain'],
  ["I'm trying to understanding this.",'want-to','trying to understand'],
  ["I'm looking forward to see you.",'look-forward','looking forward to seeing'],
  ['We ended up to repeat the experiment.','end-up','ended up repeating'],
  ['Let me to explain.','let-base','Let me explain'],
  ['Although the results look promising, but we need more evidence.','concession','Although the results look promising,'],
  ["I don't know why did it fail.",'embedded','why + 主语 + 动词（陈述语序）'],
  ['I am not really understand this.','be-understand','I do not really understand']
];
for(const [text,id,suggestion] of fixtures)test('targeted feedback: '+text,()=>{
  const result=C.checkDraft(text),issue=result.issues.find(i=>i.id===id);
  assert.ok(issue,'Expected '+id);assert.equal(issue.suggestion,suggestion);
  if(id!=='embedded'){
    const revised=text.slice(0,issue.start)+issue.suggestion+text.slice(issue.end);
    assert.equal(C.checkDraft(revised).issues.length,0,revised);
  }
});

const correct=[
  'Does this make sense?', 'Did the model predict the result?', 'The model can learn from new data.',
  'Can you explain this?', 'I am not sure whether this model works.', 'Could you tell me how it works?',
  'Who changed the settings?', 'Who did you call yesterday?', 'Although I was tired, I still went.',
  "I'm looking forward to seeing you.", 'I look forward to work.', 'I am used to working late.',
  "I'm trying to understand this.", 'I have a model that works.', 'The can works as a container.',
  'This can works as a container.', 'I know the answer.', 'I have known her for years.',
  'I want to work on my writing.', 'Let me explain.', 'I ended up staying late.',
  'He does work here.', 'She has to work late.', 'I noticed that she works here.',
  'This result alone may not be enough.', 'The model can be improved.',
  "That doesn't necessarily mean the model is better."
];
for(const text of correct)test('do not flag valid or ambiguous English: '+text,()=>assert.equal(C.checkDraft(text).issues.length,0));

test('the detector never represents lack of findings as full grammatical approval',()=>{
  const r=C.checkDraft('Some arbitrary words here.');assert.equal(r.scope,'targeted-rules');assert.equal('correct' in r,false);assert.equal('grammaticallyCorrect' in r,false);
});
test('mixed-language placeholders are preserved and reported separately',()=>{
  const r=C.checkDraft('I want to 理解 this model.');assert.equal(r.hasChinese,true);assert.equal(r.issues.length,0);assert.equal(r.wordCount,5);
});
test('all authored references and correct quiz answers pass the scoped checks',()=>{
  for(const b of D.bricks){
    assert.equal(C.checkDraft(b.example).issues.length,0,b.example);
    assert.equal(C.checkDraft(b.fix).issues.length,0,b.fix);
    for(const q of b.quizzes)assert.equal(C.checkDraft(q.options[q.answer]).issues.length,0,q.options[q.answer]);
  }
});
test('all 72 offered paragraph combinations compose without rule violations or missing text',()=>{
  let count=0;
  for(const s of D.scenes)for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++){
    const text=C.compose(s,[a,b,c]);assert.equal(text.includes('undefined'),false);assert.equal(C.checkDraft(text).issues.length,0,text);assert.equal(/[.!?]$/.test(text),true);count++;
  }
  assert.equal(count,72);
});
test('invalid builder selections fall back to a complete authored option',()=>{
  const s=D.scenes[0];assert.equal(C.compose(s,[-1,99,NaN]),s.parts.map(p=>p.options[0]).join(' '));
});
test('curly contractions are supported and repeated checks do not retain regex state',()=>{
  const text='It doesn’t works. We should tested it.';
  assert.equal(C.checkDraft(text).issues.length,2);assert.equal(C.checkDraft(text).issues.length,2);
});
test('the new page, its entry points, and offline assets agree',()=>{
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const file of ['english-flow.html','english-flow.css','english-flow-data.js','english-flow-core.js','english-flow.js']){
    assert.ok(fs.existsSync(path.join(root,file)));assert.ok(sw.includes('./'+file));
  }
  for(const file of ['index.html','english.html'])assert.ok(fs.readFileSync(path.join(root,file),'utf8').includes('href="english-flow.html"'));
});
