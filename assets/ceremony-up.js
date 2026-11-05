(()=>{
  const find=id=>document.getElementById(id),stage=find('ceremonyStage'),pack=find('offeringObject'),monk=stage.querySelector('.monk-art'),slider=find('offeringSlider');
  const soundButton=find('ceremonySound'),giveButton=find('ceremonyGive'),progressFill=find('offeringProgressFill');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let amount=0,completed=false,drag=null,frame=0,audio=null,voices=[],soundOn=true;
  let blessingSource=null,blessingBuffer=null,blessingLoad=null,blessingTimer=null,soundCycle=0;
  const blessingUrl=window.KB_BLESSING_AUDIO||'assets/blessing-somchai-long-sathu-v8.mp3';
  const replay=document.createElement('button');replay.type='button';replay.className='sound-toggle blessing-replay';replay.textContent='ฟังพรอีกครั้ง';replay.setAttribute('aria-label','ฟังเสียงพรอีกครั้ง');find('monkBlessing').appendChild(replay);
  try{soundOn=localStorage.getItem('kb-ceremony-sound')!=='off'}catch(_){}
  function soundLabel(){soundButton.setAttribute('aria-pressed',String(soundOn));soundButton.textContent=soundOn?'เสียงระฆังและพร: เปิด':'เสียงระฆังและพร: ปิด'}
  function unlockAudio(){if(!soundOn)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();if(audio.state==='suspended')audio.resume().catch(()=>{});loadBlessing().catch(()=>{})}catch(_){} }
  function loadBlessing(){if(blessingBuffer)return Promise.resolve(blessingBuffer);if(!audio)return Promise.resolve(null);if(!blessingLoad)blessingLoad=fetch(blessingUrl).then(response=>{if(!response.ok)throw new Error('Cannot load blessing audio');return response.arrayBuffer()}).then(bytes=>audio.decodeAudioData(bytes)).then(buffer=>blessingBuffer=buffer).catch(error=>{blessingLoad=null;throw error});return blessingLoad}
  function stopSound(){soundCycle++;clearTimeout(blessingTimer);if(blessingSource){try{blessingSource.stop()}catch(_){}blessingSource=null}replay.textContent='ฟังพรอีกครั้ง';voices.forEach(node=>{try{node.stop()}catch(_){}});voices=[]}
  async function playBlessing(cycle=soundCycle){if(!soundOn)return;try{unlockAudio();const buffer=await loadBlessing();if(!buffer||!soundOn||cycle!==soundCycle)return;if(blessingSource){try{blessingSource.stop()}catch(_){}}const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=buffer;gain.gain.value=.9;source.connect(gain);gain.connect(audio.destination);blessingSource=source;replay.textContent='กำลังกล่าวพร…';source.onended=()=>{source.disconnect();gain.disconnect();if(blessingSource===source){blessingSource=null;replay.textContent='ฟังพรอีกครั้ง'}};source.start()}catch(_){replay.textContent='กดเพื่อฟังพรอีกครั้ง'}}
  function ringBell(){
    if(!soundOn)return;unlockAudio();if(!audio)return;stopSound();const now=audio.currentTime;
    // Inharmonic sine partials and long soft decay produce a warm struck bell.
    const master=audio.createGain(),filter=audio.createBiquadFilter();master.gain.value=.28;filter.type='lowpass';filter.frequency.value=3500;filter.connect(master);master.connect(audio.destination);
    const partials=[[1,.55,5.5],[2.01,.20,4],[2.74,.12,3],[4.07,.055,1.8],[5.43,.025,1.1]];
    partials.forEach(([ratio,volume,decay])=>{const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=256*ratio;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(volume,now+.018);gain.gain.exponentialRampToValueAtTime(.0001,now+decay);osc.connect(gain);gain.connect(filter);osc.start(now);osc.stop(now+decay+.1);voices.push(osc);osc.onended=()=>{osc.disconnect();gain.disconnect()}});
    setTimeout(()=>{master.disconnect();filter.disconnect()},5800);
    const cycle=soundCycle;blessingTimer=setTimeout(()=>playBlessing(cycle),1600);
  }
  function layout(){
    pack.style.width=Math.max(110,Math.min(175,stage.clientHeight*.34))+'px';
    const h=pack.offsetHeight,start=Math.max(0,stage.clientHeight-h-12),handY=monk.offsetTop+monk.clientHeight*.74;
    const target=Math.max(10,handY-h*.46*.50),travel=Math.max(0,start-target);
    pack.style.top=start+'px';pack.style.setProperty('--offering-y',(-travel*amount)+'px');pack.style.setProperty('--offering-scale',String(1-.54*amount));
  }
  function setProgress(value){
    amount=Math.min(1,Math.max(0,Number(value)||0));slider.value=String(Math.round(amount*100));pack.setAttribute('aria-valuenow',slider.value);pack.setAttribute('aria-valuetext',amount===1?'ถึงจุดถวายแล้ว':'ความคืบหน้า '+slider.value+' เปอร์เซ็นต์');progressFill.style.width=slider.value+'%';layout();
    const done=amount>=1;stage.classList.toggle('complete',done);find('ceremonyFinish').disabled=!done;giveButton.disabled=done;
    find('simulationTitle').textContent=done?'ขออนุโมทนาบุญ':'ร่วมถวายด้วยใจ';find('simulationMessage').textContent=done?'ขออนุโมทนาในความตั้งใจของท่าน':'ปัดชุดธูปขึ้น เพื่อยื่นถวายตรงหน้า';find('ceremonyPrompt').textContent=done?'สาธุ ขอให้ท่านและครอบครัวพบความสุขและความเป็นสิริมงคล':'แตะที่ชุดธูปแล้วปัดขึ้น หรือกดปุ่มยื่นถวาย';
    if(done&&!completed)ringBell();completed=done;
  }
  function animateTo(end){cancelAnimationFrame(frame);const from=amount,start=performance.now(),duration=reduced?0:850;function tick(now){const t=duration?Math.min(1,(now-start)/duration):1;setProgress(from+(end-from)*(1-Math.pow(1-t,3)));if(t<1)frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick)}
  pack.addEventListener('pointerdown',event=>{if(completed||event.isPrimary===false||(event.pointerType==='mouse'&&event.button!==0))return;cancelAnimationFrame(frame);unlockAudio();drag={id:event.pointerId,y:event.clientY,start:amount};pack.setPointerCapture(event.pointerId)});
  pack.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const distance=Math.max(110,stage.clientHeight*.36);setProgress(drag.start+(drag.y-event.clientY)/distance)});
  function endDrag(event){if(!drag||drag.id!==event.pointerId)return;drag=null;if(pack.hasPointerCapture(event.pointerId))pack.releasePointerCapture(event.pointerId);if(amount>=.78&&!completed)animateTo(1)}
  pack.addEventListener('pointerup',endDrag);pack.addEventListener('pointercancel',event=>{if(drag?.id===event.pointerId)drag=null});pack.addEventListener('lostpointercapture',()=>{drag=null});
  pack.addEventListener('keydown',event=>{if(completed)return;if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft','Home','End','Enter',' '].includes(event.key)){event.preventDefault();unlockAudio();if(['Enter',' ','End'].includes(event.key))animateTo(1);else setProgress(event.key==='Home'?0:amount+(['ArrowUp','ArrowRight'].includes(event.key)?.1:-.1))}});
  giveButton.addEventListener('click',()=>{unlockAudio();animateTo(1)});soundButton.addEventListener('click',()=>{soundOn=!soundOn;try{localStorage.setItem('kb-ceremony-sound',soundOn?'on':'off')}catch(_){}if(soundOn)unlockAudio();else stopSound();soundLabel()});
  replay.addEventListener('click',()=>{soundOn=true;soundLabel();try{localStorage.setItem('kb-ceremony-sound','on')}catch(_){}stopSound();unlockAudio();playBlessing()});
  const ground=document.createElement('div');ground.className='monk-ground';ground.setAttribute('aria-hidden','true');stage.appendChild(ground);
  const aura=document.createElement('div');aura.className='monk-aura';aura.setAttribute('aria-hidden','true');stage.appendChild(aura);
  const lotuses=document.createElement('div');lotuses.className='rising-lotuses';lotuses.setAttribute('aria-hidden','true');
  const lotusArt='<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M32 38C17 30 18 15 32 3c14 12 15 27 0 35Z"/><path d="M31 40C14 42 4 29 5 14c18 1 26 12 26 26Zm2 0c17 2 27-11 26-26-18 1-26 12-26 26Z"/><path d="M32 43C17 48 6 42 1 31c15-5 25-1 31 12Zm0 0c15 5 26-1 31-12-15-5-25-1-31 12Z"/></svg>';
  for(let i=0;i<14;i++){const flower=document.createElement('i');flower.className='rising-lotus';flower.innerHTML=lotusArt;flower.style.setProperty('--lotus-x',(3+(i*29)%84)+'%');flower.style.setProperty('--lotus-size',(48+(i*13)%38)+'px');flower.style.setProperty('--lotus-time',(4.5+(i%4)*.4)+'s');flower.style.setProperty('--lotus-delay',((i%7)*.38)+'s');flower.style.setProperty('--lotus-drift',((i%2?1:-1)*(15+i%5*5))+'px');flower.style.setProperty('--lotus-rise',(230+i%5*30)+'px');lotuses.appendChild(flower)}stage.appendChild(lotuses);
  for(let i=0;i<16;i++){const spark=document.createElement('i');spark.className='merit-spark';spark.setAttribute('aria-hidden','true');spark.style.setProperty('--x',(12+(i*37)%77)+'%');spark.style.setProperty('--y',(16+(i*23)%70)+'%');spark.style.setProperty('--duration',(2+i%4)+'s');stage.appendChild(spark)}
  monk.addEventListener('load',layout);pack.querySelector('.package-photo').addEventListener('load',layout);
  window.addEventListener?.('resize',layout);
  if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(layout);observer.observe(stage);observer.observe(monk)}
  window.kbCeremony={setProgress,stopSound,reset(){cancelAnimationFrame(frame);drag=null;stopSound();completed=false;setProgress(0)}};soundLabel();
})();
