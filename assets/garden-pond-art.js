(function(root){'use strict';
 function seed(i,j){const v=Math.sin(i*78.233+j*37.719)*43758.5453;return v-Math.floor(v)}
 function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
 function draw(c,w,h,o){
  const night=o.night,time=o.reduced?0:o.time,water=c.createLinearGradient(0,0,0,h);water.addColorStop(0,night?'#183d43':'#5e9381');water.addColorStop(.35,night?'#102e39':'#345f56');water.addColorStop(1,night?'#071f2b':'#153d40');c.fillStyle=water;c.fillRect(0,0,w,h);
  const sky=c.createLinearGradient(0,0,0,h*.3);sky.addColorStop(0,night?'#0c1b30':'#b4d3bc');sky.addColorStop(1,night?'#1b4149':'#688d71');c.fillStyle=sky;c.fillRect(0,0,w,h*.24);
  if(night){ellipse(c,w*.77,h*.09,Math.min(w,h)*.035,Math.min(w,h)*.035,'#fff1c9');const halo=c.createRadialGradient(w*.77,h*.09,0,w*.77,h*.09,w*.19);halo.addColorStop(0,'#f6ebc136');halo.addColorStop(1,'#f6ebc100');c.fillStyle=halo;c.fillRect(w*.5,0,w*.5,h*.35)}
  // A planted far bank gives the pond a horizon and a sense of depth.
  c.fillStyle=night?'#152e2b':'#45674d';c.beginPath();c.moveTo(0,h*.24);for(let i=0;i<=18;i++)c.lineTo(w*i/18,h*(.185+seed(i,2)*.04));c.lineTo(w,h*.29);c.lineTo(0,h*.29);c.fill();
  for(let i=0;i<22;i++){const x=i*w/21,y=h*.22,r=14+seed(i,4)*22;ellipse(c,x,y-r*.1,r,r*.7,night?'#17382e':'#5c7b50');ellipse(c,x+r*.35,y-r*.38,r*.7,r*.55,night?'#214334':'#73905b')}
  // Reflections and soft ripples stay below the planted horizon.
  for(let i=0;i<17;i++){const p=(i/17+time/180000)%1,y=h*(.27+p*.7);c.strokeStyle=night?'#d8e8c018':'#c4dfba32';c.lineWidth=.7;c.beginPath();c.ellipse(w*.53,y,w*(.07+p*.42),2+p*11,0,0,Math.PI*2);c.stroke()}
  for(let i=0;i<22;i++){const phase=(time/9000+seed(i,6))%1;c.globalAlpha=(night?.65:.3)*Math.sin(phase*Math.PI);ellipse(c,seed(i,7)*w,h*(.16+seed(i,8)*.57)-phase*8,1+i%2,1+i%2,'#fbe6a4')}c.globalAlpha=1;
  // Crescent banks frame the water without hiding interactive flowers.
  for(const side of [0,1]){c.save();if(side){c.translate(w,0);c.scale(-1,1)}c.fillStyle=night?'#14382e':'#436842';c.beginPath();c.moveTo(0,h*.28);c.bezierCurveTo(w*.11,h*.4,w*.04,h*.7,w*.17,h);c.lineTo(0,h);c.closePath();c.fill();for(let i=0;i<20;i++){const x=seed(i,10)*w*.065,y=h*(.33+seed(i,11)*.65),size=15+seed(i,12)*25;c.strokeStyle=i%2?(night?'#396044':'#81a266'):(night?'#274c3c':'#638a53');c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+size*.4,y-size*.6,x+size*.15,y-size);c.stroke();c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+size*.7,y-size*.3,x+size,y-size*.6);c.stroke()}for(let i=0;i<7;i++)ellipse(c,w*(.02+seed(i,13)*.045),h*(.43+i*.08),8+seed(i,14)*10,5+seed(i,15)*6,night?'#45534c':'#9caa8c');c.restore()}
  // Leaf pads appear even while no orders exist; blossoms always come from data.
  function pad(x,y,size){ellipse(c,x,y,size,size*.27,night?'#235444':'#4d8156');c.strokeStyle=night?'#426d4e':'#83a56b';c.lineWidth=.7;c.beginPath();c.moveTo(x,y);c.lineTo(x+size*.9,y-size*.1);c.stroke()}
  for(let i=0;i<22;i++){const depth=seed(i,16);pad(w*(.13+seed(i,17)*.73),h*(.34+depth*.56),9+depth*16)}
  const points=o.flowers.map((f,i)=>{const x=seed(f.index,1)*2-1,z=seed(f.index,2)*2-1,rx=x*Math.cos(o.angle)-z*Math.sin(o.angle),rz=x*Math.sin(o.angle)+z*Math.cos(o.angle),depth=(rz+1.42)/2.84;return{flower:f,ordinal:i,x:w*.5+rx*w*.37*(.65+depth*.35),y:h*(o.high?.29:.32)+depth*h*(o.high?.6:.55),size:(w<500?11:14)+depth*(w<500?17:31),depth}}).sort((a,b)=>a.depth-b.depth),hits=[];
  for(const point of points){const {x,y,size,flower,ordinal}=point,memory=flower.group.kind==='memory',reveal=o.reveal==null||o.reduced?1:Math.max(0,Math.min(1,(o.reveal-ordinal*.045)/.9));if(!reveal)continue;c.save();c.globalAlpha=reveal;pad(x,y+size*.12,size*.72);ellipse(c,x,y+size*.19,size*.57,size*.13,night?'#ead19d14':'#c6d4a723');if(night||flower.index===o.selected){const glow=c.createRadialGradient(x,y-size*.3,1,x,y-size*.3,size*1.25);glow.addColorStop(0,memory?'#d5b8ff38':'#ffdb9d38');glow.addColorStop(1,memory?'#d5b8ff00':'#ffdb9d00');c.fillStyle=glow;c.fillRect(x-size*1.8,y-size*2,size*3.6,size*3.6)}root.KBMeritCard.lotus(c,x,y,size,reveal,undefined,memory?{petal:'#ceb6e4',edge:'#9d83bb',base:'#eee0fa'}:null);if(flower.index===o.selected){c.strokeStyle=memory?'#e8caff':'#ffe4a7';c.lineWidth=1.2;c.beginPath();c.ellipse(x,y+size*.12,size*.85,size*.24,0,0,Math.PI*2);c.stroke()}c.restore();hits.push({...point,radius:Math.max(20,size*.7)})}
  return hits;
 }
 const api={draw};if(typeof module!=='undefined')module.exports=api;else root.KBGardenArt=api;
})(typeof window!=='undefined'?window:this);
