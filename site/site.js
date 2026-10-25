(function(){
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// header dropdown + mobile menu
const ddb=$('#ddb'),ddm=$('#ddm');
if(ddb){ddb.addEventListener('click',()=>{const o=ddm.hidden;ddm.hidden=!o;ddb.setAttribute('aria-expanded',o)});
 document.addEventListener('click',e=>{if(!e.target.closest('.dd')){ddm.hidden=true;ddb.setAttribute('aria-expanded','false')}})}
const mnb=$('#mnb'),mnm=$('#mnm');
if(mnb){mnb.addEventListener('click',()=>{const o=mnm.hidden;mnm.hidden=!o;mnb.setAttribute('aria-expanded',o)})}
// join modal + newsletter
const modal=$('#modal');let lastFocus=null;
function openM(){lastFocus=document.activeElement;modal.hidden=false;$('#mform').hidden=false;$('#mdone').hidden=true;setTimeout(()=>$('#fn').focus(),30)}
function closeM(){modal.hidden=true;if(lastFocus)lastFocus.focus()}
$$('.js-join').forEach(b=>b.addEventListener('click',openM));
$('#mx').addEventListener('click',closeM);modal.addEventListener('click',e=>{if(e.target===modal)closeM()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeM()});
$('#jf').addEventListener('submit',async e=>{e.preventDefault();const err=$('#jerr'),em=$('#em').value.trim(),fn=$('#fn').value.trim();
 if($('#hp').value)return;
 if(!fn){err.textContent='Enter your first name.';$('#fn').focus();return}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){err.textContent='Enter a valid email address, like you@example.com.';$('#em').focus();return}
 err.textContent='';const go=$('#jgo');go.disabled=true;go.textContent='Sending…';
 try{const r=await fetch('/api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:em,first:fn,last:$('#ln').value.trim(),company:$('#hp').value})});
  const j=await r.json().catch(()=>({}));
  if(r.ok&&j.ok){$('#mform').hidden=true;$('#mdone').hidden=false;$('#mdmsg').textContent=j.message||'Check your inbox to confirm, then the guide is on its way.'}
  else{err.textContent=j.message||'Sign-up is not open yet. Join us on Telegram for now.'}}
 catch(x){err.textContent='Could not connect. Check your internet and try again.'}
 go.disabled=false;go.textContent='Send me the guide'});
['fn','em'].forEach(id=>$('#'+id).addEventListener('input',()=>{$('#jerr').textContent=''}));
// AI finder
const aif=$('#aif');
if(aif){const A={f:'0',p:'ig',e:'film'};
 $$('#aif .pills').forEach(g=>g.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');A[g.dataset.k]=b.dataset.v}));
 let DB=null;const loadDB=async()=>DB||(DB=await fetch('/static/finder.json').then(r=>r.json()));
 function local(db,text){const f=+A.f;const nb=/cook|food|beauty|skin|tech|home|fitness|fashion|travel|pet/i.test(text)?5:0;
  return db.filter(x=>!(x.min&&f<x.min)).map(x=>{let v=55+(x.enjoy.includes(A.e)?30:0)+(x.plat.includes(A.p)?5:0)+nb;return{slug:x.slug,name:x.name,score:Math.min(96,v),why:x.why,pay:x.pay,first:x.first}}).sort((a,b)=>b.score-a.score).slice(0,3)}
 aif.addEventListener('submit',async e=>{e.preventDefault();const t=$('#prof').value.trim(),err=$('#aierr'),out=$('#aiout');
  if($('#aihp').value)return;
  if(t.length<3){err.textContent='Paste your profile link or write a few words about your account.';$('#prof').focus();return}
  err.textContent='';const go=$('#aigo');go.disabled=true;out.textContent='';
  const th=document.createElement('div');th.className='think';out.appendChild(th);
  const steps=['Reading your account','Matching your niche and audience size','Checking verified income streams','Writing your first steps'];
  const fast=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const req=fetch('/api/finder',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:t,followers:A.f,platform:A.p,enjoy:A.e,website:$('#aihp').value})}).then(r=>r.ok?r.json():null).catch(()=>null);
  for(const st of steps){const d=document.createElement('div');d.className='run';d.textContent=st;th.appendChild(d);await new Promise(r=>setTimeout(r,fast?50:450));d.className='done'}
  let data=await req;let list=data&&data.matches;
  if(!list||!list.length){list=local(await loadDB(),t)}
  const res=document.createElement('div');res.className='res';
  if(data&&data.summary){const p=document.createElement('p');p.style.cssText='font-weight:600';p.textContent=data.summary;res.appendChild(p)}
  list.forEach(x=>{const c=document.createElement('a');c.className='rc';c.href='/streams/'+x.slug+'/';
   c.innerHTML='<div class="top"><b></b><span class="pc"></span></div><div class="bar"><i></i></div><p class="why"></p><p class="first"></p>';
   c.querySelector('b').textContent=x.name;c.querySelector('.pc').textContent=x.score+'% match';c.querySelector('.bar i').style.width=x.score+'%';
   c.querySelector('.why').textContent=x.why+' Typical pay: '+x.pay;c.querySelector('.first').textContent='First step: '+x.first;res.appendChild(c)});
  const cta=document.createElement('div');cta.style.cssText='display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:4px';
  const b=document.createElement('button');b.type='button';b.className='btn dark';b.textContent='Email me my full plan';b.addEventListener('click',openM);
  const h=document.createElement('span');h.className='hint';h.textContent='Matches only use income streams we have verified.';cta.append(b,h);res.appendChild(cta);out.appendChild(res);go.disabled=false});
 $('#prof').addEventListener('input',()=>{$('#aierr').textContent=''})}
// stream filters
const sc=$('#scards');
if(sc){$$('.filters .chip').forEach(c=>c.addEventListener('click',()=>{$$('.filters .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');const f=c.dataset.f;let n=0;
 sc.querySelectorAll('.stream').forEach(a=>{const show=f==='all'||(f==='zero'?a.dataset.zero==='1':a.dataset.cat===f);a.hidden=!show;if(show)n++});$('#noneleft').hidden=n>0}))}
// step rail
const cards=$$('.stepcard'),rl=$$('#rail div');
if(cards.length&&'IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){const i=+en.target.dataset.i;cards.forEach((c,j)=>c.classList.toggle('on',j<=i));rl.forEach((c,j)=>c.classList.toggle('on',j<=i))}}),{rootMargin:'-40% 0px -40% 0px'});cards.forEach(c=>io.observe(c))}
// income tracker (this device only)
const tt=$('#tt');
if(tt){const K='scp-tracker-v1';let rows=[];try{rows=JSON.parse(localStorage.getItem(K)||'[]')}catch(x){rows=[]}
 const save=()=>{try{localStorage.setItem(K,JSON.stringify(rows))}catch(x){}};
 function draw(){const tb=tt.querySelector('tbody');tb.textContent='';let tot=0;rows.forEach((r,i)=>{tot+=+r.a||0;const tr=document.createElement('tr');
  [r.p,r.s,(+r.a||0).toFixed(2)].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)});
  const td=document.createElement('td');const b=document.createElement('button');b.className='btn sm';b.type='button';b.textContent='Remove';b.onclick=()=>{rows.splice(i,1);save();draw()};td.appendChild(b);tr.appendChild(td);tb.appendChild(tr)});
  $('#ttot').textContent=tot.toFixed(2)}
 $('#tadd').addEventListener('click',()=>{const p=$('#tprog').value;if(!p){$('#terr').textContent='Choose a program first.';return}$('#terr').textContent='';
  rows.push({p,s:$('#tstat').value,a:$('#tamt').value||0});$('#tamt').value='';save();draw()});draw()}
})();
