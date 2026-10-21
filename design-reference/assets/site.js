const menuButton=document.querySelector('.menu-toggle');
const nav=document.getElementById('navigation');
function setMenu(open){if(!menuButton||!nav)return;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open);menuButton.innerHTML=open?'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
nav?.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus()}});
document.addEventListener('submit',e=>{if(e.target.matches('[data-prototype-form]'))e.preventDefault()});
