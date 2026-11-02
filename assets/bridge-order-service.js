/* Uses the existing Apps Script form/postMessage contract; no automatic write retries. */
(()=>{
  const endpoint='https://script.google.com/macros/s/AKfycbz7tHc5Nd-1hpcA2cOROLnfT9zst7IuI7Jbfk0v41v2zyTMZG9c2ucHJlvUN03q4Oc0/exec';
  let queue=Promise.resolve();
  function request(payload){return new Promise((resolve,reject)=>{
    const frame=document.createElement('iframe'),form=document.createElement('form'),input=document.createElement('input');
    frame.name='kb-sheet-'+Date.now()+'-'+Math.random().toString(36).slice(2);frame.title='รับส่งข้อมูลคำสั่งซื้อ';frame.hidden=true;
    form.method='POST';form.action=endpoint;form.target=frame.name;form.hidden=true;input.type='hidden';input.name='payload';input.value=JSON.stringify(payload);form.appendChild(input);
    let settled=false;
    function finish(fn,value){if(settled)return;settled=true;clearTimeout(timer);window.removeEventListener('message',onMessage);form.remove();frame.remove();fn(value)}
    function onMessage(event){let host='';try{host=new URL(event.origin).hostname}catch(_){return}
      if(!(host==='script.google.com'||host==='script.googleusercontent.com'||host.endsWith('.googleusercontent.com')))return;
      if(event.data?.source!=='kaanboon-sheets'||typeof event.data.ok!=='boolean')return;
      const result=event.data;
      // Tracking and saving share one endpoint. Serialize requests and accept only the expected response shape.
      if(payload.action==='track'&&result.ok&&!('found' in result))return;
      if(payload.action!=='track'&&result.ok&&(!result.orderId||typeof result.orderId!=='string'))return;
      finish(resolve,result);
    }
    const timer=setTimeout(()=>finish(reject,new Error('ยังไม่ได้รับการยืนยันการบันทึก กรุณาค้นหาสถานะด้วยเบอร์โทรศัพท์ก่อนทำรายการซ้ำ หรือติดต่อ 082-3833356')),60000);
    window.addEventListener('message',onMessage);document.body.append(frame,form);
    try{form.submit()}catch(err){finish(reject,err)}
  })}
  function send(payload){const next=queue.then(()=>request(payload));queue=next.catch(()=>{});return next}
  function readSlip(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(new Error('อ่านไฟล์สลิปไม่สำเร็จ'));reader.readAsDataURL(file)})}
  window.KBSheets={send};
  window.KBOrderService={async save(data,file){
    if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('กรุณาแนบสลิป JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB');
    const slip={name:file.name,mimeType:file.type,base64:await readSlip(file)};
    const result=await send({...data,slip});
    if(!result.ok)throw new Error(result.message||'บันทึกคำสั่งซื้อไม่สำเร็จ');
    const phone=document.getElementById('trackPhone');if(phone)phone.value=data.phone;
    const status=document.getElementById('trackResult');if(status)status.textContent='รับคำสั่งซื้อแล้ว: '+result.orderId+' · รอตรวจสอบสลิป กดค้นหาเพื่อตรวจสอบความคืบหน้า';
    return result;
  }};
})();
