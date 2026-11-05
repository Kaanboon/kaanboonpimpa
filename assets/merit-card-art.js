(function(root){
  // Use left-aligned glyphs at a measured origin. Older iOS WebKit can draw
  // complex Thai runs at x rather than x-width/2 when textAlign is center.
  function centerText(context,text,x,y,maxWidth=Infinity){
    text=String(text??'');context.save();context.textAlign='left';context.direction='ltr';
    const width=context.measureText(text).width,scale=width>maxWidth?maxWidth/width:1;
    context.translate(x-width*scale/2,y);context.scale(scale,1);context.fillText(text,0,0);context.restore();
    return {left:x-width*scale/2,right:x+width*scale/2,width:width*scale};
  }
  async function readyFonts(){if(!root.document?.fonts)return;const sample='ก้านบุญ พิมพา สุพรรณบุรี สาธุ ฿123';await Promise.all(['500 62px "KB Maitree"','400 24px "KB Prompt"','500 28px "KB Prompt"'].map(font=>root.document.fonts.load(font,sample)));await root.document.fonts.ready;}
  const congratulations=['ขออนุโมทนาในกุศลจิตครั้งนี้','ขอให้ท่านและครอบครัวมีความสุขและความเป็นสิริมงคล'];
  function graphemes(text){return typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('th',{granularity:'grapheme'}).segment(text)].map(s=>s.segment):Array.from(text).reduce((a,c)=>{if(/\p{Mark}/u.test(c)&&a.length)a[a.length-1]+=c;else a.push(c);return a},[])}
  function wrap(context,text,width){let line='',lines=[];for(const char of graphemes(String(text).replace(/\s+/gu,' ').trim())){if(line&&context.measureText(line+char).width>width){lines.push(line.trim());line=char.trimStart()}else line+=char}if(line)lines.push(line.trim());return lines.length?lines:['']}
  function nameLayout(context,text){let size=62,lines;do{context.font=`500 ${size}px "KB Maitree"`;lines=wrap(context,text,1060);if(lines.length*size*1.8<=170)break;size-=2}while(size>20);return{size,lines,lineHeight:size*1.8}}
  function rounded(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
  function cover(c,img,x,y,w,h){const scale=Math.max(w/img.width,h/img.height),sw=w/scale,sh=h/scale;c.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h)}
  function lotus(c,x,y,size,alpha=1,festival=root.KBFestival?.current(),customPalette=null){const palette=customPalette||root.KBFestival?.palette(festival);c.save();c.translate(x,y);c.scale(size/100,size/100);c.globalAlpha=alpha;c.fillStyle=palette?.petal||'#e7a1bc';c.strokeStyle=palette?.edge||'#c67b9c';c.lineWidth=.6;for(let i=-2;i<=2;i++){c.save();c.rotate(i*.38);c.beginPath();c.moveTo(0,10);c.bezierCurveTo(-36,-12,-18,-48,0,-67);c.bezierCurveTo(20,-48,35,-10,0,10);c.fill();c.stroke();c.restore()}c.fillStyle=palette?.base||'#f9d5df';c.beginPath();c.ellipse(0,10,45,12,0,0,Math.PI*2);c.fill();c.restore()}
  async function drawLuminous(canvas,options){await readyFonts();const decorLotus=(...args)=>lotus(...args,options.festival);canvas.width=1600;canvas.height=1200;const c=canvas.getContext('2d');c.fillStyle='#f7e6bf';c.fillRect(0,0,1600,1200);if(options.bridge)cover(c,options.bridge,0,0,1600,1200);const wash=c.createLinearGradient(0,0,0,1200);wash.addColorStop(0,'#fff7df9c');wash.addColorStop(.35,'#fff5d22b');wash.addColorStop(.8,'#fff2d7a6');wash.addColorStop(1,'#f4dfb8f5');c.fillStyle=wash;c.fillRect(0,0,1600,1200);
    root.KBFestival?.paint(c,1600,1200,options.festival);
    c.save();c.strokeStyle='#fff5cb9e';c.lineWidth=1.4;[360,430,510].forEach(r=>{c.beginPath();c.arc(800,300,r,0,Math.PI*2);c.stroke()});c.restore();for(let i=0;i<40;i++){c.fillStyle=i%3?'#fff8dabb':'#d1a145bb';c.beginPath();c.arc(55+(i*157)%1490,45+(i*83)%1080,2+i%3,0,Math.PI*2);c.fill()}
    c.strokeStyle='#fff5cd';c.lineWidth=3;rounded(c,24,24,1552,1152,40);c.stroke();c.strokeStyle='#b68835a6';c.lineWidth=1;rounded(c,39,39,1522,1122,31);c.stroke();
    c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle='#77501e';c.font='500 28px "KB Prompt"';centerText(c,'ก้านบุญ พิมพา สุพรรณบุรี',800,100);c.fillStyle='#916222';c.font='500 76px "KB Maitree"';centerText(c,'บุญที่ส่งต่อ เริ่มจากหัวใจ',800,218,1060);c.font='400 24px "KB Prompt"';centerText(c,'ทุกความตั้งใจ มีเส้นทางส่งต่อ',800,274);
    root.KBFestival?.caption(c,1600,324,options.festival);
    if(options.logo){c.save();c.globalCompositeOperation='multiply';c.drawImage(options.logo,1228,100,260,260);c.restore()}decorLotus(c,192,340,115,.85);decorLotus(c,122,390,73,.48);
    c.save();c.shadowColor='#8f5e2b33';c.shadowBlur=40;c.shadowOffsetY=15;c.fillStyle='#fffcf1ef';rounded(c,160,365,1280,665,38);c.fill();c.restore();c.strokeStyle='#d1a458a8';c.lineWidth=1;rounded(c,172,377,1256,641,29);c.stroke();
    c.fillStyle='#a4742e';c.font='500 39px "KB Maitree"';centerText(c,'ขออนุโมทนาบุญ',800,442);const layout=nameLayout(c,options.name||'ผู้มีจิตศรัทธา');c.font=`500 ${layout.size}px "KB Maitree"`;c.fillStyle='#60421f';const firstY=467+(170-layout.lines.length*layout.lineHeight)/2+layout.size*1.25;layout.lines.forEach((line,i)=>centerText(c,line,800,firstY+i*layout.lineHeight));
    c.strokeStyle='#d8b67180';c.beginPath();c.moveTo(370,662);c.lineTo(1230,662);c.stroke();c.fillStyle='#8d7045';c.font='400 24px "KB Prompt"';const items=options.items||[];items.slice(0,4).forEach((line,i)=>centerText(c,line,800,706+i*34));c.font='400 21px "KB Prompt"';centerText(c,options.summary||'',800,Math.max(790,715+items.length*34));
    c.fillStyle='#91652a';c.font='500 32px "KB Maitree"';congratulations.forEach((line,i)=>centerText(c,line,800,924+i*54,1060));decorLotus(c,1375,1037,160,.8);decorLotus(c,1466,1075,95,.4);decorLotus(c,233,1050,118,.72);
    c.fillStyle='#795c34';c.font='400 22px "KB Prompt"';centerText(c,'kaanboon.github.io/kaanboonpimpa',800,1090);c.font='400 17px "KB Prompt"';centerText(c,options.orderId?'เลขคำสั่งซื้อ '+options.orderId+' · ติดตามการถวายจริงได้บนเว็บไซต์':'ที่ระลึกจากการร่วมถวายด้วยใจ · ติดตามการถวายจริงได้บนเว็บไซต์',800,1133);return{name:layout,width:1600,height:1200};
  }
  const api={draw:drawLuminous,centerText,readyFonts,wrap,nameLayout,graphemes,congratulations,lotus};if(typeof module!=='undefined')module.exports=api;else root.KBMeritCard=api;
})(typeof window!=='undefined'?window:this);
