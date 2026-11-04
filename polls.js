'use strict';
(() => {
 const get=id=>document.getElementById(id),dialog=get('poll-dialog');
 const requested=new URLSearchParams(location.search).get('poll')||'5DHYXTGV';
 let root=/^[A-Z2-9]{8}$/.test(requested)?requested:'5DHYXTGV';
 const local=['127.0.0.1','localhost'].includes(location.hostname),service=local?location.origin:'https://justlab-live-commute.pairedmalt.chatgpt.site';
 const web='https://molino-algae.github.io/justlab-site/commute/';
 const read=k=>{try{return localStorage.getItem(k)||'';}catch{return '';}};
 const write=(k,v)=>{try{localStorage.setItem(k,v);}catch{/* The management link can be used again when browser storage is disabled. */}};
 const hash=location.hash.match(/(?:^#|[?&])manage=([a-f0-9]{64})(?:&|$)/i);
 let key=hash?.[1]||read('commute:admin:'+root),current=null,verified=false,busy=false,pending=null,sequence=0,applied=0;
 if(hash){write('commute:admin:'+root,key);history.replaceState(null,'',location.pathname+location.search+'#/1');}
 const qrLink=document.querySelector('.student-entry a'),qr=qrLink.querySelector('img'),code=document.querySelector('.student-entry .code'),frame=document.querySelector('.dashboard-frame'),dashboardLink=document.querySelector('.activity-link');
 qrLink.hidden=true;code.textContent='…';
 const number=n=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(n);
 const date=s=>s?s.split('-').reverse().join('/'):'—';
 const createdDate=s=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(s));
 function message(text,error=false){get('poll-message').textContent=text;get('poll-message').classList.toggle('error',error);get('poll-message').setAttribute('role',error?'alert':'status');}
 function privateLink(id){const u=new URL(web);u.searchParams.set('dashboard',id);u.hash='manage='+key;return u.href;}
 async function api(path,options={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{const r=await fetch(service+path,{cache:'no-store',...options,signal:controller.signal});const data=await r.json();if(!r.ok){const error=new Error(data.error||'Não foi possível conectar à enquete.');error.status=r.status;throw error;}return data;}
  finally{clearTimeout(timer);}
 }
 function active(room){
  const changed=current?.id!==room.id;current=room;
  code.textContent=room.id;qr.alt='QR code do formulário anônimo da enquete '+room.id;
  const target=new URL(web);target.searchParams.set('room',room.id);qrLink.href=target.href;
  if(changed){qr.src=service+'/api/rooms/'+room.id+'/qr';frame.dataset.src='dashboard.html?dashboard='+room.id;frame.src=frame.dataset.src;}
  qrLink.hidden=false;
  const dashboard=new URL(web);dashboard.searchParams.set('dashboard',room.id);dashboardLink.href=dashboard.href;
  get('poll-current-code').textContent=room.id;get('poll-current-title').textContent=room.title;
  if(changed||!get('poll-title').value)get('poll-title').value=room.title;
  get('poll-current-status').textContent=room.open?'Recebendo respostas':'Coleta encerrada';
 }
 async function csv(id,button){
  if(!verified||!key)return;button.disabled=true;
  try{const r=await fetch(service+'/api/rooms/'+id+'/export?all=true',{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('Não foi possível exportar a enquete.');const url=URL.createObjectURL(await r.blob()),a=document.createElement('a');a.href=url;a.download='enquete-'+id+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  catch(e){message(e.message,true);}finally{button.disabled=false;}
 }
 function archive(rows){
  const body=get('poll-history-body');body.replaceChildren();
  for(const poll of [...rows].reverse()){
   const latest=poll.collections.at(-1),tr=document.createElement('tr');
   const cells=[`Enquete ${poll.number}${poll.room.id===current.id?' · atual':''}`,latest?date(latest.date):createdDate(poll.room.createdAt),String(latest?.respondents||0),number(latest?.averageWeeklyKg||0),number(latest?.weeklyKg||0)];
   for(const value of cells){const td=document.createElement('td');td.textContent=value;tr.append(td);}
   tr.children[0].title=poll.room.title+' · '+poll.room.id;
   const actions=document.createElement('td'),view=document.createElement('a'),download=document.createElement('button');
   view.textContent='Ver painel';view.href=privateLink(poll.room.id);view.target='_blank';view.rel='noopener';view.setAttribute('aria-label','Ver painel da enquete '+poll.number);
   download.textContent='CSV';download.type='button';download.setAttribute('aria-label','Exportar CSV da enquete '+poll.number);download.addEventListener('click',()=>void csv(poll.room.id,download));
   actions.append(view,download);tr.append(actions);body.append(tr);
  }
 }
 async function refresh(manage=dialog.open&&!!key){
  const seq=++sequence,candidate=key;
  try{const data=await api('/api/rooms/'+root+'/polls',{headers:manage&&candidate?{Authorization:'Bearer '+candidate}:{}});if(seq<applied)return false;applied=seq;
   if(data.rootId!==root){root=data.rootId;if(candidate)write('commute:admin:'+root,candidate);}
   active(data.current);
   if(manage){verified=!!data.canManage;get('poll-unlock').hidden=verified;get('poll-management').hidden=!verified;if(verified)archive(data.archive||[]);}
   get('poll-new').disabled=!verified||busy;return true;
  }catch(e){
   if(seq<applied)return false;
   if(e.status===403&&manage){verified=false;get('poll-unlock').hidden=false;get('poll-management').hidden=true;get('poll-new').disabled=true;}
   message(e.name==='AbortError'?'A conexão demorou. Tente novamente.':e.message,true);return false;
  }
 }
 get('polls-button').addEventListener('click',()=>{dialog.showModal();message('');void refresh(!!key);});
 get('poll-unlock-form').addEventListener('submit',async e=>{
  e.preventDefault();const value=get('poll-management-link').value.trim();let candidate=value;
  if(!/^[a-f0-9]{64}$/i.test(candidate)){try{candidate=new URL(value).hash.match(/(?:^#|[?&])manage=([a-f0-9]{64})(?:&|$)/i)?.[1]||'';}catch{candidate='';}}
  if(!/^[a-f0-9]{64}$/i.test(candidate)){message('Cole seu link de gestão completo.',true);return;}
  key=candidate;message('Abrindo os controles do professor…');
  if(await refresh(true)){if(verified){write('commute:admin:'+root,key);get('poll-management-link').value='';message('Controles do professor ativados.');}}
 });
 get('poll-new-form').addEventListener('submit',async e=>{
  e.preventDefault();if(!verified||busy||!current)return;
  const title=get('poll-title').value.trim();if(!title||title.length>80){message('Use um nome com até 80 caracteres.',true);return;}
  busy=true;get('poll-new').disabled=true;get('poll-new').textContent='Salvando…';message('');
  pending??={requestId:crypto.randomUUID(),expectedRoomId:current.id,title};
  try{const result=await api('/api/rooms/'+root+'/polls',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(pending)});
   pending=null;applied=++sequence;write('commute:admin:'+result.current.id,key);active(result.current);await refresh(true);dialog.close();document.dispatchEvent(new CustomEvent('justlab:poll-started'));
   const toast=get('poll-toast');toast.textContent='Nova enquete pronta. O QR code foi atualizado.';toast.hidden=false;setTimeout(()=>{toast.hidden=true;},8000);
  }catch(e){if(e.status===409){pending=null;await refresh(true);}message(e.name==='AbortError'?'Não foi possível confirmar. Tente novamente; a operação não será duplicada.':e.message,true);}
  finally{busy=false;get('poll-new').textContent='Salvar e iniciar nova enquete';get('poll-new').disabled=!verified;}
 });
 void refresh(false);
 setInterval(()=>{if(!busy&&document.visibilityState==='visible')void refresh(dialog.open&&!!key);},3000);
 window.addEventListener('focus',()=>{if(!busy)void refresh(dialog.open&&!!key);});
})();
