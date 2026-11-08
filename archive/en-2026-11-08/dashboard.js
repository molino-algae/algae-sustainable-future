'use strict';
(() => {
  const params = new URLSearchParams(location.search);
  const room = (params.get('dashboard') || '5DHYXTGV').toUpperCase();
  const local = ['localhost','127.0.0.1'].includes(location.hostname);
  const service = local ? location.origin : 'https://justlab-live-commute.pairedmalt.chatgpt.site';
  const byId = id => document.getElementById(id);
  const number = (n,digits=2) => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:digits}).format(n);
  const carbon = n => number(n,n>0 && n<.001?6:n>0 && n<.1?4:2);
  const groups = [
    ['Carro',['car'],'#b65c45'],['Ônibus',['bus'],'#547c8d'],['Uber / táxi',['uber'],'#899696'],
    ['Bicicleta',['bike'],'#4c7753'],['Carona',['carpool2','carpool3','carpool4','carpool5'],'#b99956'],
    ['A pé',['walk'],'#8aa98a'],['Moto',['motorcycle'],'#a17d69'],['Outro / combinado',['other'],'#a0a595']
  ];
  const rows = groups.map(([label,keys,color]) => {
    const row=document.createElement('div');row.className='row';
    const name=document.createElement('span');name.textContent=label;
    const track=document.createElement('div');track.className='track';track.setAttribute('aria-hidden','true');
    const bar=document.createElement('div');bar.className='bar';bar.style.background=color;track.append(bar);
    const value=document.createElement('span');value.className='value';value.textContent='—';
    row.append(name,track,value);byId('bars').append(row);return {keys,row,bar,value};
  });
  let timer=null, inFlight=false, lastSuccess=0;
  function status(text,offline){byId('status').textContent=text;byId('status').classList.toggle('offline',offline);document.body.classList.toggle('offline',offline);}
  function show(data){
    const {stats,collection}=data;const e=stats.emissions;
    if(!e || !Array.isArray(e.byMode) || !Number.isFinite(e.weeklyKg) || !Number.isFinite(stats.respondents))throw new Error('Formato de resposta inesperado.');
    const km=e.totalKm??stats.weeklyKm,flight=km*.225;
    byId('distance').textContent=number(km,1);byId('flight-total').textContent=carbon(flight);
    byId('flight-ratio').textContent=!stats.respondents||!km?'Aguardando as distâncias da turma.':!e.complete?'Turma com estimativa parcial: razão não calculada.':e.weeklyKg===0?'A estimativa da turma é zero; razão não aplicável.':`${number(flight/e.weeklyKg)}× a pegada da turma · ${carbon(Math.abs(flight-e.weeklyKg))} kg ${flight>=e.weeklyKg?'a mais':'a menos'}.`;
    byId('people').textContent=number(stats.respondents,0);byId('total').textContent=carbon(e.weeklyKg);byId('average').textContent=carbon(e.averageWeeklyKg);
    byId('date').textContent='Coleta '+collection.date.split('-').reverse().join('/');
    const totals=rows.map(r=>{const matches=e.byMode.filter(m=>r.keys.includes(m.key));return matches.some(m=>m.kg===null)?null:matches.reduce((s,m)=>s+m.kg,0);});
    const max=Math.max(0,...totals.filter(v=>v!==null));
    rows.forEach((r,i)=>{const value=totals[i];r.row.classList.toggle('unknown',value===null);r.value.textContent=value===null?'Sem fator':carbon(value);r.bar.style.width=value===null || max===0?'0%':`${value/max*100}%`;});
    byId('empty').hidden=stats.respondents!==0;
    byId('coverage').hidden=e.complete;
    byId('coverage').textContent=e.complete?'':`Estimativa parcial: ${number(e.coverage*100,1)}% da distância tem fator de emissão. “Outro / combinado” fica sem estimativa.`;
    byId('problem').hidden=true;
    const time=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());
    byId('updated').textContent='Atualizado '+time;
    status(data.room.open?'Ao vivo':'Coleta encerrada',false);lastSuccess=Date.now();
  }
  async function refresh(){
    if(inFlight)return;inFlight=true;clearTimeout(timer);const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
    try{if(!/^[A-Z0-9]{8}$/.test(room))throw new Error('Código de turma inválido.');const response=await fetch(`${service}/api/rooms/${room}`,{cache:'no-store',signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(data.error || 'Não foi possível abrir a turma.');show(data);}
    catch(error){status('Sem conexão',true);byId('problem').textContent=lastSuccess?'A conexão caiu. Os números exibidos são da última atualização; tentando reconectar…':`Não foi possível carregar os resultados. Verifique a internet. ${error.name==='AbortError'?'':error.message}`;byId('problem').hidden=false;}
    finally{clearTimeout(timeout);inFlight=false;timer=setTimeout(refresh,3000);}
  }
  window.addEventListener('focus',()=>void refresh());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void refresh();});
  void refresh();
})();
