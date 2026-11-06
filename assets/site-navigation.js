(()=>{'use strict';
 const home=document.getElementById('originalHomepage'),header=home?.querySelector(':scope > header');if(!home||!header)return;
 const nav=document.createElement('nav');nav.className='site-quick-nav';nav.hidden=true;nav.setAttribute('aria-label','เมนูติดตามขณะเลื่อนหน้า');
 const inner=document.createElement('div');inner.className='site-quick-inner';
 const brand=document.createElement('a');brand.className='site-quick-brand';brand.href='#top';brand.innerHTML='<img src="assets/brand-logo.png" alt=""><span><strong>ก้านบุญ พิมพา</strong><small>สุพรรณบุรี</small></span>';
 const links=document.createElement('div');links.className='site-quick-links';const sections=[['order','เลือกชุด'],['news','ข่าวสาร'],['track','ติดตาม'],['lotusGarden','สวนดอกบัว'],['gallery','ตัวอย่าง']];
 for(const [id,label] of sections){if(!document.getElementById(id))continue;const a=document.createElement('a');a.href='#'+id;a.textContent=label;links.appendChild(a)}
 const start=document.createElement('a');start.className='site-quick-start';start.href='#order';start.textContent='เริ่มฝากถวาย';start.addEventListener('click',event=>{const original=header.querySelector('.nav-cta');if(original){event.preventDefault();original.click()}});
 inner.append(brand,links,start);nav.appendChild(inner);home.prepend(nav);
 const top=document.createElement('a');top.className='site-back-top';top.href='#top';top.hidden=true;top.setAttribute('aria-label','กลับขึ้นด้านบน');top.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v14"/></svg><span>ขึ้นด้านบน</span>';home.appendChild(top);
 // Read layout only once per animation frame; there is no continuous animation loop.
 function toTop(event){event.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});header.querySelector('a')?.focus({preventScroll:true})}top.addEventListener('click',toTop);brand.addEventListener('click',toTop);
 let frame=0;function update(){frame=0;const inHome=document.body.dataset.view==='home',shown=inHome&&header.getBoundingClientRect().bottom<=0;nav.hidden=!shown;top.hidden=!(inHome&&window.scrollY>500);document.documentElement.style.setProperty('--site-nav-offset',(shown?nav.offsetHeight+16:20)+'px');if(shown){let active='',nearest=-Infinity;for(const [id]of sections){const n=document.getElementById(id),y=n?.getBoundingClientRect().top;if(n&&y<=nav.offsetHeight+80&&y>nearest){active=id;nearest=y}}for(const a of links.children){if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}}}
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('pageshow',schedule);
 new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['data-view']});
 if(window.ResizeObserver)new ResizeObserver(schedule).observe(nav);
 update();
})();
