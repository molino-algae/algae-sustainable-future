'use strict';
(() => {
 const slideNodes=[...document.querySelectorAll('.slides>section')];
 const deck=new Reveal(document.querySelector('.reveal'),{width:1280,height:720,margin:.02,hash:true,controls:false,progress:false,center:false,transition:'fade',backgroundTransition:'none',viewDistance:1,embedded:false,keyboard:true,touch:true,disableLayout:false,pdfMaxPagesPerSlide:1,pdfSeparateFragments:false,plugins:[RevealNotes]});
 const previous=document.getElementById('previous'),next=document.getElementById('next');
 const dialog=document.getElementById('slides-dialog'),notesDialog=document.getElementById('notes-dialog');
 const list=document.getElementById('slide-list');
 slideNodes.forEach((slide,index)=>{const li=document.createElement('li');const b=document.createElement('button');const n=document.createElement('span');n.textContent=String(index+1).padStart(2,'0');b.append(n,document.createTextNode(slide.dataset.title));b.addEventListener('click',()=>{dialog.close();deck.slide(index);});li.append(b);list.append(li);});
 function sync(){const i=deck.getIndices().h;document.getElementById('counter').textContent=`${i+1} / ${slideNodes.length}`;document.getElementById('current-title').textContent=slideNodes[i].dataset.title;previous.disabled=i===0;next.disabled=i===slideNodes.length-1;[...list.querySelectorAll('button')].forEach((b,j)=>b.setAttribute('aria-current',String(i===j)));document.title=slideNodes[i].dataset.title+' · Algae: Fuels and Materials';}
 previous.addEventListener('click',()=>deck.prev());next.addEventListener('click',()=>deck.next());
 document.getElementById('slides-button').addEventListener('click',()=>dialog.showModal());
 document.getElementById('notes-button').addEventListener('click',()=>{const slide=slideNodes[deck.getIndices().h];document.getElementById('notes-title').textContent=slide.dataset.title;document.getElementById('notes-text').textContent=slide.querySelector('aside.notes')?.textContent.trim()||'';notesDialog.showModal();});
 document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')){e.stopImmediatePropagation();if(e.key==='Escape')document.querySelector('dialog[open]').close();}},true);
 document.getElementById('fullscreen-button').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{document.getElementById('fullscreen-button').title='Use F11 para tela cheia';}});
 const gameFrame=document.getElementById('game-frame'),cover=document.getElementById('game-cover'),load=document.getElementById('load-game');
 load.addEventListener('click',()=>{load.textContent='Carregando…';load.disabled=true;gameFrame.addEventListener('load',()=>{cover.hidden=true;gameFrame.focus();},{once:true});gameFrame.src=gameFrame.dataset.gameUrl;gameFrame.hidden=false;});
 document.getElementById('game-qr-button').addEventListener('click',()=>document.getElementById('game-qr-dialog').showModal());
 document.addEventListener('justlab:poll-started',()=>deck.slide(1));
 deck.on('ready',sync);deck.on('slidechanged',sync);deck.initialize();
})();
