/* Shared entrance playback for the website and local scene preview. Only composited transforms/opacity animate. */
(()=>{'use strict';
  let ready;
  function prepareImages(){
    if(!ready)ready=Promise.allSettled(['assets/chapel-full-building.webp','assets/chapel-door-pair.webp','assets/golden-merit-bridge.png'].map(src=>new Promise(resolve=>{
      const img=new Image();img.decoding='async';img.onload=()=>{if(img.decode)img.decode().catch(()=>{}).then(resolve);else resolve()};img.onerror=resolve;img.src=src;
    })));
    return ready;
  }
  function create(portal,{reduced=matchMedia('(prefers-reduced-motion: reduce)').matches}={}){
    let active=false,timer=null,frame=null,run=0,focusTarget=null;
    const motionMs=5400;
    if(!reduced)prepareImages();
    function finish(){
      if(!active)return;active=false;run++;clearTimeout(timer);cancelAnimationFrame(frame);
      portal.classList.remove('entering');if(portal.open)portal.close();
      if(focusTarget?.isConnected)focusTarget.focus({preventScroll:true});focusTarget=null;
    }
    async function travel(callback){
      if(active||portal.open)return;if(reduced){callback();return}
      active=true;const cycle=++run;
      // Prepare the destination underneath the dialog, in the same task, so the final dissolve never exposes an old page.
      try{callback();focusTarget=document.activeElement;portal.showModal()}catch(error){active=false;throw error}
      let loadTimer;
      await Promise.race([prepareImages(),new Promise(resolve=>{loadTimer=setTimeout(resolve,700)})]);clearTimeout(loadTimer);
      if(!active||cycle!==run)return;
      frame=requestAnimationFrame(()=>{
        frame=null;if(!active||cycle!==run)return;
        const aperture=portal.querySelector('.grand-aperture'),box=aperture.getBoundingClientRect(),center=box.top+box.height/2;
        portal.style.setProperty('--portal-origin-y',center+'px');portal.style.setProperty('--portal-pan-y',(innerHeight/2-center)+'px');
        portal.classList.add('entering');timer=setTimeout(finish,motionMs+250);
      });
    }
    portal.querySelector('.portal-skip').addEventListener('click',finish);
    portal.addEventListener('cancel',event=>{event.preventDefault();finish()});
    portal.addEventListener('animationend',event=>{if(event.target===portal&&event.animationName==='portalDissolve')finish()});
    return{travel,finish};
  }
  window.KBPortalMotion={create};
})();
