/* Conservative checks for a documented subset of structures.
   No match is NOT a certificate that arbitrary English is grammatical. */
(function () {
  'use strict';
  const forms = {
    makes:'make',made:'make',works:'work',worked:'work',means:'mean',meant:'mean',
    shows:'show',showed:'show',shown:'show',helps:'help',helped:'help',
    improves:'improve',improved:'improve',goes:'go',went:'go',gone:'go',
    knows:'know',knew:'know',known:'know',uses:'use',used:'use',
    needs:'need',needed:'need',seems:'seem',seemed:'seem',looks:'look',looked:'look',
    learns:'learn',learned:'learn',takes:'take',took:'take',taken:'take',
    gets:'get',got:'get',tests:'test',tested:'test',predicts:'predict',predicted:'predict',
    explains:'explain',explained:'explain',checks:'check',checked:'check',
    chooses:'choose',chose:'choose',chosen:'choose',understands:'understand',understood:'understand',
    writes:'write',wrote:'write',written:'write',finds:'find',found:'find',
    repeats:'repeat',repeated:'repeat',starts:'start',started:'start',
    changes:'change',changed:'change',leaves:'leave',left:'leave',fails:'fail',failed:'fail',
    supports:'support',supported:'support',proves:'prove',proved:'prove'
  };
  const badForms=Object.keys(forms).join('|');
  const subject='(?:I|you|he|she|it|we|they|this|that|(?:this|that|the|our|your|my|their) (?:model|result|method|approach|system|experiment|idea|algorithm|code|plan|team|results|models))';
  // Bare "this can" / "that can" may describe a container; do not flag that ambiguity.
  const modalSubject=subject.replace('|this|that|','|');
  const adverbs='(?:(?:really|necessarily|actually|usually|always|often|already|just|ever|never)\\s+){0,2}';
  const rules=[
    {id:'do-base',label:'助动词后的原形',brick:'do-base',regex:new RegExp("\\b(?:doesn't|don't|didn't|does not|do not|did not)\\s+"+adverbs+'('+badForms+')\\b','gi'),reason:'这里的 do / does / did 已承担变化，主要动词使用原形。',fix:m=>m[0].slice(0,-m[1].length)+forms[m[1].toLowerCase()]},
    {id:'do-question',label:'问句中的动词形式',brick:'do-base',regex:new RegExp('\\b(?:does|do|did)\\s+'+subject+'\\s+'+adverbs+'('+badForms+')\\b','gi'),reason:'在这个直接问句中，主要动词跟随助动词使用原形。',fix:m=>m[0].slice(0,-m[1].length)+forms[m[1].toLowerCase()]},
    {id:'modal-base',label:'情态动词后的原形',brick:'modal-base',regex:new RegExp('\\b'+modalSubject+"\\s+(?:can|could|should|will|would|may|might|must|cannot|can't|couldn't|shouldn't|won't|wouldn't|mustn't)\\s+(?:not\\s+)?"+adverbs+'('+badForms+')\\b','gi'),reason:'这里的情态动词后接原形，不再加第三人称词尾或变过去式。',fix:m=>m[0].slice(0,-m[1].length)+forms[m[1].toLowerCase()]},
    {id:'modal-question',label:'情态问句的接法',brick:'modal-base',regex:new RegExp('(?:^|[.!?]\\s+)(?:can|could|should|will|would|may|might|must)\\s+'+subject+'\\s+'+adverbs+'('+badForms+')\\b','gi'),reason:'这个问句里的主要动词应使用原形。',fix:m=>m[0].slice(0,-m[1].length)+forms[m[1].toLowerCase()]},
    {id:'look-forward',label:'look forward to 的接法',brick:'look-forward',regex:/\b(?:look|looks|looked|looking)\s+forward\s+to\s+(see|hear|discuss)\b/gi,reason:'这里在表达期待一个动作。look forward to 的 to 是介词，动作使用 -ing 形式。',fix:m=>m[0].slice(0,-m[1].length)+({see:'seeing',hear:'hearing',discuss:'discussing'}[m[1].toLowerCase()])},
    {id:'want-to',label:'不定式的接法',brick:'want-to',regex:/\b(?:want|wants|wanted|need|needs|needed|plan|plans|planned|hope|hopes|hoped|trying|try|tries|tried|decided|decide|decides)\s+to\s+(going|doing|making|working|learning|understanding|explaining|testing|using|writing|improving)\b/gi,reason:'这个搭配中的 to 引导不定式，后面使用动词原形。',fix:m=>m[0].slice(0,-m[1].length)+({going:'go',doing:'do',making:'make',working:'work',learning:'learn',understanding:'understand',explaining:'explain',testing:'test',using:'use',writing:'write',improving:'improve'}[m[1].toLowerCase()])},
    {id:'end-up',label:'end up 的接法',brick:'end-up',regex:/\b(?:end|ends|ended|ending)\s+up\s+to\s+(stay|work|go|repeat|use|ask)\b/gi,reason:'end up 后接一个动作时，用 -ing 形式。',fix:m=>m[0].replace(/to\s+\w+$/i,({stay:'staying',work:'working',go:'going',repeat:'repeating',use:'using',ask:'asking'}[m[1].toLowerCase()]))},
    {id:'let-base',label:'let me 后的接法',brick:'rephrase',regex:/\blet\s+(?:me|us|him|her|them)\s+to\s+(explain|think|try|show|put|help|check)\b/gi,reason:'let + 人 后直接接动词原形，不加 to。',fix:m=>m[0].replace(/\s+to\s+/i,' ')},
    {id:'concession',label:'让步句的连接',brick:'contrast',regex:/\b(?:although|even though)\s+[^.!?;\n]{1,110},\s*but\b/gi,reason:'标准书面语里，这种结构不用 although / even though 和 but 同时连接同一对分句。still 可以保留。',fix:m=>m[0].replace(/,\s*but$/i,',')},
    {id:'embedded',label:'内嵌问句的语序',brick:'embedded',regex:new RegExp("\\b(?:I (?:don't|do not) know|I'm not sure|I am not sure|could you tell me|can you tell me)\\s+(why|how|when|where|whether|if)\\s+(?:do|does|did)\\s+"+subject+'\\s+\\w+','gi'),reason:'外层表达后接的是内嵌疑问分句，里面使用“主语 + 动词”的陈述语序；动词时态也要相应调整。',fix:m=>m[1]+' + 主语 + 动词（陈述语序）'},
    {id:'be-understand',label:'understand 的谓语结构',brick:'be-state',regex:/\bI\s+am\s+(?:not\s+)?(?:really\s+)?understand\b/gi,reason:'understand 在这里本身就是主要动词，不用 am。否定可用 I do not understand。',fix:m=>m[0].replace(/I\s+am\s+not/i,'I do not').replace(/I\s+am/i,'I')}
  ];
  function checkDraft(input) {
    const text=String(input||'').replace(/[’‘]/g,"'");
    const matches=[];
    for(const rule of rules){
      rule.regex.lastIndex=0;
      for(const m of text.matchAll(rule.regex)){
        const start=m.index,end=start+m[0].length;
        if(matches.some(x=>start<x.end&&end>x.start))continue;
        matches.push({id:rule.id,brick:rule.brick,label:rule.label,fragment:m[0].trim(),suggestion:rule.fix(m).trim(),reason:rule.reason,start,end});
      }
    }
    matches.sort((a,b)=>a.start-b.start);
    return {issues:matches,hasChinese:/[\u3400-\u9fff]/.test(text),wordCount:(text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[]).length,scope:'targeted-rules'};
  }
  function compose(scene,selections) {
    return scene.parts.map((part,i)=>part.options[Number.isInteger(selections[i])&&selections[i]>=0&&selections[i]<part.options.length?selections[i]:0]).join(' ');
  }
  function validateData(data){
    const errors=[],ids=new Set(),moduleIds=new Set(data.modules.map(m=>m.id));
    for(const b of data.bricks){
      if(ids.has(b.id))errors.push('Duplicate brick '+b.id);ids.add(b.id);
      if(!moduleIds.has(b.module))errors.push('Unknown module '+b.module);
      if(!b.example||!b.rule||!b.join||b.quizzes.length<2)errors.push('Incomplete brick '+b.id);
      for(const q of b.quizzes)if(!Number.isInteger(q.answer)||!q.options[q.answer]||new Set(q.options).size!==q.options.length||!q.note)errors.push('Invalid quiz '+b.id);
    }
    const sceneIds=new Set();
    for(const s of data.scenes){
      if(sceneIds.has(s.id))errors.push('Duplicate scene '+s.id);sceneIds.add(s.id);
      for(const id of s.bricks)if(!ids.has(id))errors.push('Unknown brick '+id);
      if(!s.parts.length||s.parts.some(p=>!p.options.length||!p.note||!p.cue))errors.push('Incomplete scene '+s.id);
    }
    return errors;
  }
  window.EnglishFlowCore={checkDraft,compose,validateData};
}());
