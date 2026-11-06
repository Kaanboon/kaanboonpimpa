/* Optional, browser-only experience. Open only after the order save resolves. */
(()=>{'use strict';
  const root=document.getElementById('meritPath');
  if(!root)return;
  const find=id=>document.getElementById(id),svg=find('meritPathCanvas');
  const panels=[...root.querySelectorAll('[data-path-panel]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let enter=null,state='closed',pointer=null,points=[],timer=null,frame=0,completion=0;
  const route=[[450,620],[401,607],[375,582],[389,560],[454,540],[491,516],[480,494],[450,474]];
  function focus(id){find(id)?.focus({preventScroll:true})}
  function panel(name){state=name;root.dataset.state=name;panels.forEach(el=>el.hidden=el.dataset.pathPanel!==name&&!(name==='cross'&&el.dataset.pathPanel==='draw'))}
  function clearPointer(){if(pointer!==null&&svg.hasPointerCapture?.(pointer))svg.releasePointerCapture(pointer);pointer=null}
  function clearTimers(){clearTimeout(timer);cancelAnimationFrame(frame);timer=null;frame=0;clearPointer()}
  function close(){clearTimers();enter=null;state='closed';root.hidden=true;root.removeAttribute('aria-busy')}
  function finish(){if(!enter)return;const callback=enter;close();callback()}
  function showChoice(){clearTimers();panel('choice');focus('meritPathTitle')}
  function paint(){
    // Tapered path deck and two rails follow the visitor's actual stroke.
    const left=[],right=[];
    points.forEach(([x,y],i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,w=8+Math.max(0,Math.min(1,(y-474)/146))*26;left.push([x-dy/len*w,y+dx/len*w]);right.push([x+dy/len*w,y-dx/len*w])});
    const path=list=>list.map(([x,y],i)=>(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)).join(' ');
    find('meritDrawnThread').setAttribute('d',path(points));
    find('meritDrawnDeck').setAttribute('d',points.length>1?path(left)+' '+path([...right].reverse()).replace(/^M/,'L')+' Z':'');
    find('meritRailLeft').setAttribute('d',path(left));find('meritRailRight').setAttribute('d',path(right));
    const last=points.at(-1)||[450,620];find('meritBrushLight').setAttribute('cx',last[0]);find('meritBrushLight').setAttribute('cy',last[1]);
  }
  function setProgress(value){completion=Math.round(Math.max(0,Math.min(1,value))*100);find('meritPathProgress').value=completion;find('meritPathProgress').textContent=completion+'%'}
  function resetDrawing(){if(state!=='draw')return;clearTimers();points=[];setProgress(0);svg.removeAttribute('aria-disabled');root.classList.remove('path-drawn');find('meritWalk').disabled=true;find('meritPathHint').textContent='เริ่มจากแสงด้านล่าง ลากขึ้นไปยังบันไดโบสถ์';find('meritPathStatus').textContent='วาดด้วยนิ้วหรือเมาส์ หรือกด “สร้างสะพานให้ฉัน” ได้เลย';paint()}
  function draw(){panel('draw');resetDrawing();focus('meritDrawTitle');root.scrollIntoView?.({block:'start',behavior:'instant'})}
  function complete(){
    if(state!=='draw'||root.classList.contains('path-drawn'))return;
    clearPointer();setProgress(1);root.classList.add('path-drawn');find('meritWalk').disabled=false;
    find('meritPathHint').textContent='สะพานแห่งความตั้งใจของคุณพร้อมแล้ว';
    svg.setAttribute('aria-disabled','true');find('meritPathStatus').textContent='กำลังพาคุณผ่านประตูโบสถ์เข้าสู่ฉากถวาย';timer=setTimeout(walk,reduced.matches?350:850);
  }
  function makeBridge(){if(state!=='draw')return;clearTimers();points=route.map(p=>[...p]);paint();complete()}
  function location(event){const rect=svg.getBoundingClientRect();return[(event.clientX-rect.left)*900/rect.width,(event.clientY-rect.top)*675/rect.height]}
  svg.addEventListener('pointerdown',event=>{
    if(state!=='draw'||root.classList.contains('path-drawn')||event.isPrimary===false||(event.pointerType==='mouse'&&event.button!==0))return;
    const point=location(event);if(point[1]<560||Math.abs(point[0]-450)>150){find('meritPathStatus').textContent='เริ่มวาดจากแสงสีทองด้านล่าง หรือกดสร้างสะพานให้ฉัน';return}
    clearTimers();points=[[450,620],point];pointer=event.pointerId;svg.setPointerCapture(pointer);paint();find('meritPathStatus').textContent='ลากเส้นแสงของคุณขึ้นไปยังบันไดโบสถ์';
  });
  svg.addEventListener('pointermove',event=>{
    if(pointer!==event.pointerId||state!=='draw')return;
    const point=location(event);point[0]=Math.max(70,Math.min(830,point[0]));point[1]=Math.max(450,Math.min(640,point[1]));
    const last=points.at(-1);if(Math.hypot(point[0]-last[0],point[1]-last[1])<5)return;
    if(points.length<650)points.push(point);else points[points.length-1]=point;
    setProgress(Math.min(.95,(620-point[1])/146));if(!frame)frame=requestAnimationFrame(()=>{frame=0;paint()});
    if(point[1]<=494&&Math.hypot(point[0]-450,point[1]-474)<65){cancelAnimationFrame(frame);frame=0;points.push([450,474]);paint();complete()}
  });
  function end(event){if(pointer!==event.pointerId)return;clearPointer();find('meritPathStatus').textContent='วาดต่อใหม่ได้จากแสงด้านล่าง หรือกด “สร้างสะพานให้ฉัน”'}
  svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('lostpointercapture',()=>{pointer=null});
  function walk(){if(state!=='draw'||!root.classList.contains('path-drawn'))return;clearTimers();if(reduced.matches){finish();return}panel('cross');root.setAttribute('aria-busy','true');focus('meritCrossTitle');timer=setTimeout(finish,2300)}
  find('meritChooseDraw').addEventListener('click',draw);find('meritChooseDirect').addEventListener('click',finish);
  find('meritAutoBridge').addEventListener('click',makeBridge);find('meritResetBridge').addEventListener('click',resetDrawing);
  find('meritWalk').addEventListener('click',walk);find('meritSkipDraw').addEventListener('click',finish);
  find('meritSkipCross').addEventListener('click',finish);find('meritBackChoice').addEventListener('click',showChoice);
  window.KBMeritPath={open(callback,{preview=false}={}){close();enter=callback;root.hidden=false;find('meritSaveLabel').textContent=preview?'ตัวอย่างประสบการณ์ · ยังไม่ได้บันทึกคำสั่งซื้อ':'บันทึกคำสั่งซื้อเรียบร้อยแล้ว · รอทางร้านตรวจสอบสลิป';showChoice()},close};
})();
