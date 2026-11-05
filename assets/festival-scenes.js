(function(root){'use strict';
  const editions={
    none:{label:'',caption:'',petal:'#e7a1bc',edge:'#c67b9c',base:'#f9d5df'},
    visakha:{label:'คืนวิสาขบูชา',caption:'แสงแห่งความตั้งใจ ในคืนวิสาขบูชา',petal:'#ead2c4',edge:'#c4a67e',base:'#fff0d8'},
    mother:{label:'วันแม่แห่งชาติ',caption:'บุญครั้งนี้ แทนความรักและความกตัญญู',petal:'#b5ddeb',edge:'#79adcb',base:'#e5f5fc'},
    loy:{label:'คืนลอยกระทง',caption:'ฝากความตั้งใจ ให้ลอยไปกับแสงจันทร์',petal:'#f0bfce',edge:'#b788a7',base:'#ffe8eb'},
    father:{label:'วันพ่อแห่งชาติ',caption:'บุญครั้งนี้ ตั้งใจมอบให้พ่อ',petal:'#f4cf76',edge:'#bb903e',base:'#fff0bc'},
    newyear:{label:'ส่งท้ายปี–ต้อนรับปีใหม่',caption:'เริ่มต้นปีใหม่ ด้วยแสงแห่งความตั้งใจ',petal:'#f4e6c2',edge:'#c4a870',base:'#fff8e6'}
  };
  // Lunar festivals MUST have an explicit date for each year. Do not repeat
  // last year's Gregorian date. Sources and extension steps are in the handoff.
  const calendar={visakha:['2026-05-31','2027-05-20'],loy:['2026-11-24'],motherMonthDay:'08-12',fatherMonthDay:'12-05',newYearMonthDays:['12-31','01-01']};
  function dateKey(date=new Date()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date),get=type=>parts.find(p=>p.type===type).value;return get('year')+'-'+get('month')+'-'+get('day')}
  function code(value){return Object.hasOwn(editions,value)?value:'none'}
  function at(date=new Date()){const key=dateKey(date),day=key.slice(5);if(calendar.visakha.includes(key))return'visakha';if(calendar.loy.includes(key))return'loy';if(day===calendar.motherMonthDay)return'mother';if(day===calendar.fatherMonthDay)return'father';return calendar.newYearMonthDays.includes(day)?'newyear':'none'}
  let selected='auto',active=at();
  function current(){return active}
  function palette(value=current()){return editions[code(value)]}
  function moon(c,x,y,r){c.save();const halo=c.createRadialGradient(x,y,r*.4,x,y,r*2);halo.addColorStop(0,'#fff8d26b');halo.addColorStop(1,'#fff8d200');c.fillStyle=halo;c.fillRect(x-r*2,y-r*2,r*4,r*4);c.fillStyle='#fff4cf';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.fillStyle='#dccda22e';for(const [dx,dy,size]of [[-.3,-.2,.22],[.3,.25,.15],[-.1,.4,.1]]){c.beginPath();c.arc(x+dx*r,y+dy*r,size*r,0,Math.PI*2);c.fill()}c.restore()}
  function candle(c,x,y,size){c.save();const glow=c.createRadialGradient(x,y-size,1,x,y-size,size*1.2);glow.addColorStop(0,'#ffe296aa');glow.addColorStop(1,'#ffe29600');c.fillStyle=glow;c.fillRect(x-size*1.2,y-size*2.2,size*2.4,size*2.4);c.fillStyle='#f3d28c';c.fillRect(x-size*.12,y-size*.75,size*.24,size*.75);c.fillStyle='#fff7c9';c.beginPath();c.ellipse(x,y-size*.93,size*.09,size*.18,0,0,Math.PI*2);c.fill();c.restore()}
  function canna(c,x,y,size){c.save();c.translate(x,y);c.scale(size/100,size/100);c.strokeStyle='#87935d';c.lineWidth=2;c.beginPath();c.moveTo(0,10);c.quadraticCurveTo(-8,-45,0,-98);c.stroke();c.fillStyle='#a6ad6a';c.beginPath();c.moveTo(-2,-15);c.bezierCurveTo(-35,-24,-32,-57,-11,-42);c.quadraticCurveTo(0,-29,-2,-15);c.fill();c.beginPath();c.moveTo(0,-38);c.bezierCurveTo(38,-48,34,-80,13,-66);c.quadraticCurveTo(2,-53,0,-38);c.fill();for(const [dx,dy,angle]of [[-9,-91,-.7],[8,-101,.5],[0,-81,.1]]){c.save();c.translate(dx,dy);c.rotate(angle);c.fillStyle='#f4ce68';c.beginPath();c.moveTo(0,10);c.bezierCurveTo(-25,-5,-16,-25,-3,-19);c.bezierCurveTo(5,-39,21,-22,10,-4);c.quadraticCurveTo(19,10,0,10);c.fill();c.strokeStyle='#d6a841';c.lineWidth=.7;c.stroke();c.restore()}c.restore()}
  function water(c,w,h,time=0){c.save();c.strokeStyle='#d4e3ed4a';c.lineWidth=1;for(let i=0;i<9;i++){const y=h*(.76+i*.024);c.beginPath();c.ellipse(w*.77+Math.sin(time*3+i)*w*.006,y,w*(.012+i*.009),1.5+i*.5,0,0,Math.PI*2);c.stroke()}c.restore()}
  function paint(c,w,h,value=current(),progress=1){
    value=code(value);if(value==='none')return;c.save();
    const colors={visakha:['#1a2c5a88','#45537418','#eecf8c20'],mother:['#bfe7fb88','#d7f0ff20','#e5f7ff50'],loy:['#142e568f','#395a6d20','#2a4c6970'],father:['#f4d88266','#f8dfa910','#f4d08433'],newyear:['#30375f88','#f1c48c25','#efc98440']}[value];
    const wash=c.createLinearGradient(0,0,0,h);wash.addColorStop(0,colors[0]);wash.addColorStop(.38,colors[1]);wash.addColorStop(1,colors[2]);c.fillStyle=wash;c.fillRect(0,0,w,h);
    if(value==='visakha'){moon(c,w*(w>h?.11:.85),h*.1,Math.min(w,h)*.045);[.045,.955].forEach(x=>candle(c,w*x,h*.91,Math.min(w,h)*.08))}
    if(value==='loy'){moon(c,w*(w>h?.11:.85),h*.1,Math.min(w,h)*.045);water(c,w,h);[.05,.95].forEach(x=>candle(c,w*x,h*.93,Math.min(w,h)*.065))}
    if(value==='father'){canna(c,w*.075,h*.3,Math.min(w,h)*.14);canna(c,w*.94,h*.89,Math.min(w,h)*.13)}
    if(value==='newyear'){const dawn=c.createRadialGradient(w*.5,h*.66,0,w*.5,h*.66,h*.8);dawn.addColorStop(0,'#fff0b2aa');dawn.addColorStop(1,'#ffd59000');c.globalAlpha=Math.max(0,Math.min(1,progress));c.fillStyle=dawn;c.fillRect(0,0,w,h);c.globalAlpha=1-Math.max(0,Math.min(1,progress))*.6;for(let i=0;i<24;i++){c.fillStyle='#fff5cfa0';c.beginPath();c.arc(w*(.025+(i*137%950)/1000),h*(.02+(i*59%280)/1000),1+i%3,0,Math.PI*2);c.fill()}}
    c.restore();
  }
  function caption(c,w,y,value=current()){value=code(value);if(value==='none')return;c.save();c.font='500 '+Math.round(w*.018)+'px "KB Prompt"';c.fillStyle=value==='mother'?'#527e9b':'#85692f';root.KBMeritCard.centerText(c,palette(value).caption,w/2,y,w*.74);c.restore()}
  const api={calendar,dateKey,at,code,current,palette,paint,caption};
  if(typeof module!=='undefined')module.exports=api;else root.KBFestival=api;
  if(!root.document)return;
  document.addEventListener('DOMContentLoaded',()=>{
    const controls=document.createElement('div');controls.className='festival-controls';controls.innerHTML='<label for="festivalEdition">ฉากเทศกาล</label><select id="festivalEdition"><option value="auto">ตามวันจริงอัตโนมัติ</option><option value="none">บรรยากาศปกติ</option>'+Object.entries(editions).filter(([key])=>key!=='none').map(([key,edition])=>'<option value="'+key+'">ชมฉาก'+edition.label+'</option>').join('')+'</select><span id="festivalStatus" role="status"></span>';document.querySelector('.time-atmosphere').after(controls);
    const cannaSvg='<svg viewBox="0 0 100 160"><path d="M48 155Q35 92 49 35" fill="none" stroke="#8e9c60" stroke-width="3"/><path d="M45 122Q4 113 14 69Q51 80 45 122ZM45 86Q91 86 90 38Q53 47 45 86" fill="#a0a86b"/><g fill="#f4cd68" stroke="#d4a648" stroke-width="1"><path d="M45 58C8 56 9 26 31 31C23 4 54 2 55 30C81 10 89 41 64 48Q68 72 45 58Z"/><path d="M57 31C39 15 51 0 63 10C75 -5 89 12 75 24Q86 42 57 31Z"/></g></svg>';
    const art='<div class="festival-dawn"></div><div class="festival-stars">'+Array.from({length:18},(_,i)=>'<i style="--star-x:'+((i*37+7)%97)+'%;--star-y:'+((i*19+4)%64)+'%;--star-delay:'+(-i*.63)+'s"></i>').join('')+'</div><div class="festival-moon"></div><div class="festival-lights">'+Array.from({length:9},(_,i)=>'<i style="--candle-x:'+(5+i*11)+'%;--flicker:'+(-i*.37)+'s"></i>').join('')+'</div><div class="festival-river">'+Array.from({length:5},(_,i)=>'<span class="festival-krathong" style="--float-x:'+(8+i*21)+'%;--float-y:'+(22+(i%3)*18)+'%;--float-delay:'+(-i*1.6)+'s"><i></i></span>').join('')+'</div><div class="festival-canna canna-left">'+cannaSvg+'</div><div class="festival-canna canna-right">'+cannaSvg+'</div>';
    for(const host of document.querySelectorAll('.home-atmosphere,.journey-world,.grand-sky')){const sky=document.createElement('div');sky.className='festival-sky';sky.setAttribute('aria-hidden','true');sky.innerHTML=art;host.appendChild(sky)}
    const badge=document.createElement('span');badge.className='festival-card-badge';badge.hidden=true;document.querySelector('.receipt-artwork').prepend(badge);
    function apply(){active=selected==='auto'?at():code(selected);document.body.dataset.festival=active;const p=palette(active);document.body.style.setProperty('--festival-petal',p.petal);document.body.style.setProperty('--festival-edge',p.edge);document.body.style.setProperty('--festival-base',p.base);document.getElementById('festivalStatus').textContent=selected==='auto'?(active==='none'?'วันนี้ใช้บรรยากาศปกติ':p.label+' · ตามวันที่ประเทศไทย'):(active==='none'?'บรรยากาศปกติ':'กำลังชมตัวอย่างฉาก · '+p.label);badge.textContent=p.caption;badge.hidden=active==='none';document.dispatchEvent(new CustomEvent('kb:festival',{detail:active}))}
    document.getElementById('festivalEdition').addEventListener('change',e=>{selected=e.target.value;apply()});apply();setInterval(()=>{if(selected==='auto'&&!document.hidden&&active!==at())apply()},60000);
  });
})(typeof window!=='undefined'?window:this);
