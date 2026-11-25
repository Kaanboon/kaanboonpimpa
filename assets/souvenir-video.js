(() => {
  'use strict';

  const width = 720;
  const height = 1280;
  const intro = 0.8;
  const outro = 2;
  const defaultDuration = 34.0375;
  const $ = id => document.getElementById(id);
  const button = $('createMeritVideo');
  const cancel = $('cancelMeritVideo');
  const progress = $('videoProgress');
  const download = $('downloadMeritVideo');
  const share = $('shareMeritVideo');
  let activeJob;
  let resultFile;
  let resultURL;

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(Error('โหลดภาพสำหรับทำคลิปไม่สำเร็จ กรุณาลองใหม่'));
      image.src = src;
    });
  }

  function cover(context, image, zoom) {
    const scale = Math.max(width / image.width, height / image.height) * zoom;
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    context.drawImage(image, (image.width - sourceWidth) / 2, (image.height - sourceHeight) / 2,
      sourceWidth, sourceHeight, 0, 0, width, height);
  }

  function random(index) {
    const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  }

  function sparkle(context, x, y, size, opacity) {
    context.globalAlpha = opacity;
    context.fillStyle = '#fff5b9';
    context.beginPath();
    context.moveTo(x, y - size);
    context.quadraticCurveTo(x + size * .2, y - size * .2, x + size * .62, y);
    context.quadraticCurveTo(x + size * .2, y + size * .2, x, y + size);
    context.quadraticCurveTo(x - size * .2, y + size * .2, x - size * .62, y);
    context.quadraticCurveTo(x - size * .2, y - size * .2, x, y - size);
    context.fill();
  }

  function drawGold(context, seconds, blessingDuration) {
    const closing = Math.max(0, 1 - Math.abs(seconds - (intro + blessingDuration - .5)) / 2.3);
    context.save();
    for (let i = 0; i < 40; i++) {
      const right = i % 2 === 0;
      const x = (right ? width - 105 : 105) + (random(i + 10) - .5) * 145;
      const y = 1140 - (random(i + 90) * 820 + seconds * (18 + i % 14)) % 890;
      const pulse = .5 + .5 * Math.sin(seconds * (1 + i % 4 * .15) + i);
      sparkle(context, x, y, 2.8 + random(i + 42) * 7 + closing * 4, .14 + pulse * .52 + closing * .16);
    }
    context.restore();
  }

  function drawWater(context, voiceTime, duration, tipX, tipY) {
    // Each spray starts at the visible end of the brush. Gravity and several
    // speeds give the droplets an arc and a little depth without hiding the face.
    if (voiceTime < .27 || voiceTime > duration + 1.1) return;
    const interval = 2.7;
    const wave = Math.floor((voiceTime - .27) / interval);
    const sprayTime = .27 + wave * interval;
    if (sprayTime > duration - .2) return;
    context.save();
    for (let i = 0; i < 33; i++) {
      const seed = i + 41 * wave;
      const age = voiceTime - sprayTime - random(seed + 30) * .32;
      const life = .51 + random(seed + 60) * .61;
      if (age < 0 || age >= life) continue;
      const depth = random(seed + 90);
      const x = tipX - (24 + random(seed + 120) * 216) * age + (depth - .22) * 142 * age ** 2;
      const y = tipY - (66 + random(seed + 150) * 192) * age + (185 + depth * 155) * age ** 2;
      const size = (1 + depth * 3.2) * (.65 + age * 1.15);
      const fade = Math.min(1, (life - age) * 6, age * 24);
      context.globalAlpha = fade * (.35 + depth * .6);
      context.fillStyle = '#d9f4ff';
      context.strokeStyle = '#648c9e';
      context.lineWidth = .65;
      context.beginPath();
      context.ellipse(x, y, size * .63, size * 1.55, -.62 + age * .9, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = '#fffdf3';
      context.beginPath();
      context.arc(x - size * .21, y - size * .47, size * .28, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function draw(context, images, data, progress, showName, voiceDuration = defaultDuration) {
    const seconds = progress * (intro + voiceDuration + outro);
    const center = (text, y, maxWidth) => window.KBMeritCard.centerText(context, text, width / 2, y, maxWidth);
    context.save();
    cover(context, images.bridge, 1 + progress * .06);
    const wash = context.createLinearGradient(0, 0, 0, height);
    wash.addColorStop(0, '#382015ed');
    wash.addColorStop(.32, '#4d2a1692');
    wash.addColorStop(.64, '#422211b0');
    wash.addColorStop(1, '#2c180ff8');
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);
    window.KBFestival?.paint(context, width, height, data.festival, progress);

    context.strokeStyle = '#ffe3a4ab';
    context.lineWidth = 2;
    context.strokeRect(27, 29, 666, 1222);
    context.strokeStyle = '#ffe3a44c';
    context.lineWidth = 1;
    context.strokeRect(36, 38, 648, 1204);

    const aura = context.createRadialGradient(426, 539, 36, 426, 539, 365);
    aura.addColorStop(0, '#ffda84db');
    aura.addColorStop(.65, '#ffbd534e');
    aura.addColorStop(1, '#ffbd5300');
    context.fillStyle = aura;
    context.fillRect(0, 0, width, height);
    drawGold(context, seconds, voiceDuration);

    context.save();
    context.globalAlpha = Math.min(1, seconds / .64);
    const size = 512 + 12 * progress;
    const monkX = (width - size) / 2 + 36;
    const monkY = 338 + 10 * (1 - context.globalAlpha);
    context.drawImage(images.monk, monkX, monkY, size, size);
    context.restore();
    drawWater(context, seconds - intro, voiceDuration, monkX + size * .079, monkY + size * .201);

    context.save();
    context.beginPath();
    context.arc(360, 123, 59, 0, Math.PI * 2);
    context.clip();
    context.fillStyle = '#fff4dd';
    context.fillRect(300, 63, 120, 120);
    context.globalCompositeOperation = 'multiply';
    context.drawImage(images.logo, 300, 63, 120, 120);
    context.restore();
    context.strokeStyle = '#ffdea0';
    context.lineWidth = 1.5;
    context.stroke();
    context.textBaseline = 'alphabetic';
    context.font = '500 23px "KB Prompt"';
    context.fillStyle = '#fff4d9';
    center('ก้านบุญ พิมพา สุพรรณบุรี', 208, 605);
    context.font = '500 53px "KB Maitree"';
    context.fillStyle = '#ffdda2';
    center('ขออนุโมทนาบุญ', 281, 604);
    window.KBFestival?.caption(context, width, 317, data.festival);

    context.fillStyle = '#fff4dd';
    if (showName && data.name) {
      const name = String(data.name).trim();
      let size = 38;
      let lines;
      do {
        context.font = `500 ${size}px "KB Maitree"`;
        lines = window.KBMeritCard.wrap(context, name, 548);
        if (lines.length * size * 1.28 <= 150) break;
        size -= 2;
      } while (size >= 16);
      const visibleLines = lines.slice(0, 7);
      visibleLines.forEach((line, i) => center(line, 936 + (i - (visibleLines.length - 1) / 2) * size * 1.28, 550));
    } else {
      context.font = '500 34px "KB Maitree"';
      center('ทุกความตั้งใจ มีเส้นทางส่งต่อ', 936, 560);
    }

    context.strokeStyle = '#ffda947d';
    context.beginPath();
    context.moveTo(168, 1032);
    context.lineTo(552, 1032);
    context.stroke();
    context.font = '400 19px "KB Prompt"';
    context.fillStyle = '#ffe7bc';
    window.KBMeritCard.wrap(context, data.items || '', 565).slice(0, 3)
      .forEach((line, i) => center(line, 1066 + i * 27, 565));
    center('ธูปรวม ' + data.incense.toLocaleString('th-TH') + ' ชุด', 1164, 560);
    context.font = '400 16px "KB Prompt"';
    center('kaanboon.github.io/kaanboonpimpa', 1202, 560);
    if (data.preview) {
      context.font = '400 13px "KB Prompt"';
      center('ตัวอย่างประสบการณ์ร่วมถวายออนไลน์', 1228, 560);
    }
    context.restore();
  }

  function clearResult() {
    if (resultURL) URL.revokeObjectURL(resultURL);
    resultURL = resultFile = null;
    download.removeAttribute('href');
    download.hidden = share.hidden = true;
  }

  async function fetchVoice(audio, signal) {
    const response = await fetch('assets/blessing-video-voice.mp3', { signal });
    if (!response.ok) throw Error('โหลดเสียงพรไม่สำเร็จ กรุณาลองใหม่');
    const bytes = await response.arrayBuffer();
    return audio.decodeAudioData(bytes);
  }

  async function startRecorder(stream, types, signal, drawFirstFrame) {
    for (const mimeType of types) {
      if (signal.aborted) return null;
      let recorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3000000, audioBitsPerSecond: 128000 });
        const chunks = [];
        let resolveStart;
        const started = new Promise(resolve => { resolveStart = resolve; });
        const stopped = new Promise(resolve => {
          recorder.onstart = () => resolveStart(true);
          recorder.ondataavailable = event => {
            if (event.data.size) chunks.push(event.data);
          };
          recorder.onstop = () => {
            resolveStart(false);
            resolve(null);
          };
          recorder.onerror = () => {
            resolveStart(false);
            resolve(Error('บันทึกวิดีโอพร้อมเสียงไม่สำเร็จ'));
          };
        });
        recorder.start(250);
        let frame;
        const paint = () => {
          drawFirstFrame(0);
          frame = requestAnimationFrame(paint);
        };
        const abort = () => resolveStart(false);
        signal.addEventListener('abort', abort, { once: true });
        const timeout = setTimeout(abort, 2000);
        frame = requestAnimationFrame(paint);
        let ready;
        try {
          ready = await started;
        } finally {
          clearTimeout(timeout);
          cancelAnimationFrame(frame);
          signal.removeEventListener('abort', abort);
        }
        if (ready) return { recorder, chunks, stopped, mimeType };
      } catch {
        // A codec can be advertised even when the device cannot start its encoder.
      }
      if (recorder?.state === 'recording') recorder.stop();
    }
    if (signal.aborted) return null;
    throw Error('เบราว์เซอร์นี้เริ่มบันทึกวิดีโอพร้อมเสียงไม่สำเร็จ');
  }

  function animate(audio, start, duration, signal, render) {
    return new Promise((resolve, reject) => {
      let frame;
      let lastPercent = -1;
      function stop() {
        cancelAnimationFrame(frame);
        signal.removeEventListener('abort', stop);
        resolve();
      }
      function tick() {
        try {
          const fraction = Math.min(1, Math.max(0, (audio.currentTime - start) / duration));
          render(fraction);
          const percent = Math.floor(fraction * 100);
          if (percent !== lastPercent) {
            progress.textContent = 'กำลังสร้างวิดีโอ ' + percent + '% · เปิดหน้านี้ไว้';
            lastPercent = percent;
          }
          if (fraction === 1) stop();
          else frame = requestAnimationFrame(tick);
        } catch (error) {
          signal.removeEventListener('abort', stop);
          reject(error);
        }
      }
      signal.addEventListener('abort', stop, { once: true });
      frame = requestAnimationFrame(tick);
    });
  }

  async function exportVideo() {
    if (activeJob) return;
    const job = new AbortController();
    activeJob = job;
    const { signal } = job;
    button.disabled = true;
    cancel.hidden = false;
    clearResult();
    progress.textContent = 'กำลังเตรียมภาพและเสียงพร…';
    let audio;
    let stream;
    let recorder;

    function onVisibility() {
      if (document.hidden) job.abort('หยุดสร้างวิดีโอเมื่อสลับหน้า กรุณากดสร้างใหม่');
    }
    document.addEventListener('visibilitychange', onVisibility);
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio || !window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
        throw Error('เบราว์เซอร์นี้ยังบันทึกวิดีโอพร้อมเสียงไม่ได้');
      }
      const recordingTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4;codecs=avc1.42001f,mp4a.40.2',
        'video/mp4'
      ].filter(type => MediaRecorder.isTypeSupported(type));
      if (!recordingTypes.length) throw Error('เบราว์เซอร์นี้ไม่รองรับชนิดไฟล์วิดีโอ');
      audio = new Audio();
      const [voice, bridge, logo, monk] = await Promise.all([
        fetchVoice(audio, signal),
        loadImage('assets/golden-merit-bridge.png'),
        loadImage('assets/brand-logo.png'),
        loadImage('assets/blessing-video-monk.png'),
        window.KBMeritCard.readyFonts(),
        audio.resume()
      ]);
      if (signal.aborted) return;
      const data = { ...window.KBBridge.snapshot(), festival: window.KBFestival?.current() };
      const showName = $('shareShowName').checked;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      const drawFrame = fraction => draw(context, { bridge, logo, monk }, data, fraction, showName, voice.duration);
      drawFrame(0);
      const destination = audio.createMediaStreamDestination();
      const silence = audio.createConstantSource();
      silence.offset.value = 0;
      silence.connect(destination);
      silence.start();
      const source = audio.createBufferSource();
      source.buffer = voice;
      source.connect(destination);
      stream = canvas.captureStream(24);
      destination.stream.getAudioTracks().forEach(track => stream.addTrack(track));

      const recording = await startRecorder(stream, recordingTypes, signal, drawFrame);
      if (!recording) return;
      ({ recorder } = recording);
      if (signal.aborted) return;
      const { chunks, stopped, mimeType } = recording;
      const start = audio.currentTime + .07;
      source.start(start + intro);
      const rendering = animate(audio, start, intro + voice.duration + outro, signal, drawFrame);
      const error = await Promise.race([rendering.then(() => null), stopped]);
      if (error) {
        job.abort();
        throw error;
      }
      if (recorder.state === 'recording') recorder.stop();
      const finalError = await stopped;
      if (finalError) throw finalError;
      if (signal.aborted) return;

      const type = (recorder.mimeType || mimeType).split(';')[0];
      const extension = type === 'video/mp4' ? 'mp4' : 'webm';
      resultFile = new File(chunks, 'สะพานบุญ-ก้านบุญพิมพา.' + extension, { type });
      if (!resultFile.size) throw Error('บันทึกวิดีโอไม่สำเร็จ กรุณาลองใหม่');
      resultURL = URL.createObjectURL(resultFile);
      download.href = resultURL;
      download.download = resultFile.name;
      download.hidden = false;
      share.hidden = !(navigator.canShare && navigator.canShare({ files: [resultFile] }));
      progress.textContent = 'วิดีโอรับพรพร้อมแล้ว · ' + extension.toUpperCase();
    } catch (error) {
      if (!signal.aborted || signal.reason?.name === 'AbortError') {
        progress.textContent = error.message || 'สร้างวิดีโอไม่สำเร็จ กรุณาลองใหม่';
      }
    } finally {
      if (typeof signal.reason === 'string') progress.textContent = signal.reason;
      if (recorder?.state === 'recording') recorder.stop();
      stream?.getTracks().forEach(track => track.stop());
      if (audio && audio.state !== 'closed') audio.close().catch(() => {});
      document.removeEventListener('visibilitychange', onVisibility);
      activeJob = null;
      button.disabled = false;
      cancel.hidden = true;
    }
  }

  button.addEventListener('click', exportVideo);
  cancel.addEventListener('click', () => activeJob?.abort('ยกเลิกการสร้างวิดีโอแล้ว'));
  share.addEventListener('click', async () => {
    if (!resultFile) return;
    try {
      await navigator.share({ files: [resultFile], title: 'สะพานบุญ · ก้านบุญ พิมพา', text: 'ขออนุโมทนาในทุกความตั้งใจดี ๆ' });
    } catch (error) {
      if (error.name !== 'AbortError') progress.textContent = 'แชร์ไม่สำเร็จ กดดาวน์โหลดแล้วเลือกส่งจากเครื่องได้';
    }
  });
  window.addEventListener('kb:order-saved', () => {
    activeJob?.abort('');
    clearResult();
    progress.textContent = '';
  });

  window.KBSouvenirVideo = { draw };
})();
