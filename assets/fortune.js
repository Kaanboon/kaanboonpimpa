import { fortuneLeaves, birthDays, bangkokDay, readingFor } from './fortune-data.js?v=20261108';

const corner = document.querySelector('#fortuneCorner');
const get = (id) => corner.querySelector('#' + id);
const lots = get('fortuneLots');
const daily = get('fortuneDaily');
const drawButton = get('fortuneDraw');
const soundButton = get('fortuneSound');
const lotsStatus = get('fortuneLotsStatus');
const drawStage = get('fortuneStage');
const leaf = get('fortuneLeaf');
const leafActions = get('fortuneLeafActions');
const copyFallback = get('fortuneCopyFallback');
const leafTitle = get('fortuneLeafTitle');
const thaiNumber = new Intl.NumberFormat('th-TH-u-nu-thai');
const thaiDate = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'long' });
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const birthdayKey = 'kaanboon-fortune-birth-day';

let soundOn = false;
let audioContext;
let audioOutput;
let drawTimer = 0;
let selectedLeaf = null;
let dailyTimer = 0;
let renderedReading = '';
let selectedDay = readBirthDay();

function readBirthDay() {
  try {
    const value = localStorage.getItem(birthdayKey);
    if (/^[0-6]$/.test(value ?? '')) return Number(value);
  } catch {
    // The picker also works in browsers that disable local storage.
  }
  return null;
}

function rememberBirthDay(day) {
  try {
    localStorage.setItem(birthdayKey, String(day));
  } catch {
    corner.querySelector('.fortune-storage-note').hidden = true;
  }
}

async function prepareAudio() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  try {
    if (!audioContext) {
      audioContext = new Audio();
      audioOutput = audioContext.createGain();
      audioOutput.connect(audioContext.destination);
    }
    if (audioContext.state === 'suspended') await audioContext.resume();
  } catch {
    // Sound is optional. The draw continues if playback is unavailable.
  }
}

function playStickSound() {
  if (!soundOn || audioContext?.state !== 'running') return;
  const now = audioContext.currentTime;
  audioOutput.gain.cancelScheduledValues(now);
  audioOutput.gain.setValueAtTime(1, now);
  const tones = [
    { type: 'triangle', frequency: 740, volume: .16, duration: .09, delay: 0 },
    { type: 'sine', frequency: 525, volume: .045, duration: .52, delay: .035 },
    { type: 'sine', frequency: 790, volume: .019, duration: .38, delay: .035 },
  ];
  for (const { type, frequency, volume, duration, delay } of tones) {
    const start = now + delay;
    const tone = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    tone.type = type;
    tone.frequency.value = frequency;
    envelope.gain.setValueAtTime(.001, start);
    envelope.gain.exponentialRampToValueAtTime(volume, start + .01);
    envelope.gain.exponentialRampToValueAtTime(.001, start + duration);
    tone.connect(envelope).connect(audioOutput);
    tone.onended = () => { tone.disconnect(); envelope.disconnect(); };
    tone.start(start);
    tone.stop(start + duration + .015);
  }
}

function muteAudio() {
  if (audioOutput) audioOutput.gain.setValueAtTime(0, audioContext.currentTime);
}

function cancelDraw() {
  clearTimeout(drawTimer);
  drawTimer = 0;
  drawStage.classList.remove('is-drawing');
  drawButton.disabled = false;
  drawButton.textContent = 'เขย่ากระบอกเซียมซี';
}

function showLeaf() {
  cancelDraw();
  if (!lots.open) return;
  const index = Math.floor(Math.random() * fortuneLeaves.length);
  selectedLeaf = { number: index + 1, ...fortuneLeaves[index] };
  const { number, title, verse, reading, thought } = selectedLeaf;
  get('fortuneLeafNumber').textContent = 'ใบเซียมซีที่ ' + thaiNumber.format(number);
  leafTitle.textContent = title;
  get('fortuneVerse').replaceChildren(...verse.map((line) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    return paragraph;
  }));
  get('fortuneReading').textContent = reading;
  get('fortuneThought').textContent = thought;
  get('fortuneLotsPrompt').hidden = true;
  leaf.hidden = false;
  leafActions.hidden = false;
  leafTitle.focus({ preventScroll: true });
  lots.scrollTop = 0;
  lotsStatus.textContent = 'คุณได้ใบเซียมซีหมายเลข ' + number;
}

function startDraw() {
  if (!lots.open || drawTimer || selectedLeaf) return;
  if (soundOn) void prepareAudio();
  drawButton.disabled = true;
  drawButton.textContent = 'กำลังเขย่ากระบอก…';
  lotsStatus.textContent = 'กำลังเสี่ยงเซียมซี';
  drawStage.classList.add('is-drawing');
  drawTimer = setTimeout(() => {
    if (lots.open) playStickSound();
    showLeaf();
  }, reduceMotion.matches ? 120 : 1330);
}

function resetLeaf() {
  selectedLeaf = null;
  lotsStatus.textContent = '';
  leaf.hidden = true;
  leafActions.hidden = true;
  copyFallback.hidden = true;
  get('fortuneLotsPrompt').hidden = false;
  drawButton.focus();
}

async function copyLeaf() {
  if (!selectedLeaf) return;
  const { number, title, verse, reading, thought } = selectedLeaf;
  const text = [
    'ก้านบุญ พิมพา · ใบเซียมซีที่ ' + thaiNumber.format(number),
    title, '', ...verse, '', 'คำทำนาย ' + reading, 'ข้อคิดจากใบนี้ ' + thought,
    '', 'https://kaanboon.github.io/kaanboonpimpa/#fortuneCorner',
  ].join('\n');
  try {
    await navigator.clipboard.writeText(text);
    copyFallback.hidden = true;
    lotsStatus.textContent = 'คัดลอกใบเซียมซีแล้ว';
  } catch {
    if (!lots.open) return;
    copyFallback.value = text;
    copyFallback.hidden = false;
    copyFallback.focus();
    copyFallback.select();
    lotsStatus.textContent = 'เลือกคัดลอกข้อความจากช่องด้านบนได้เลย';
  }
}

function renderDaily(now = new Date()) {
  const day = bangkokDay(now);
  const key = day + ':' + selectedDay;
  if (key === renderedReading) return;
  renderedReading = key;
  get('fortuneDate').textContent = thaiDate.format(now) + ' · เวลาไทย';
  if (selectedDay === null) return;
  const title = 'สำหรับคนเกิด' + birthDays[selectedDay];
  get('fortuneDayTitle').textContent = title;
  get('fortuneDailyReadings').replaceChildren(...readingFor(day, selectedDay).map(({ label, text }) => {
    const item = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = text;
    item.append(term, description);
    return item;
  }));
  get('fortuneDailyEmpty').hidden = true;
  get('fortuneDailyResult').hidden = false;
  get('fortuneDailyStatus').textContent = 'แสดงคำทำนาย ' + title + ' แล้ว';
}

for (const button of corner.querySelectorAll('[data-fortune-open]')) {
  const dialog = get(button.dataset.fortuneOpen);
  button.addEventListener('click', () => {
    if (dialog.open) return;
    if (dialog === daily) {
      renderDaily();
      dailyTimer = setInterval(renderDaily, 15000);
    }
    dialog.showModal();
    document.documentElement.classList.add('fortune-dialog-open');
  });
  dialog.querySelector('[data-fortune-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('fortune-dialog-open');
    button.focus({ preventScroll: true });
  });
}

drawButton.addEventListener('click', startDraw);
soundButton.addEventListener('click', () => {
  soundOn = !soundOn;
  soundButton.setAttribute('aria-pressed', String(soundOn));
  soundButton.textContent = soundOn ? 'เสียง: เปิด' : 'เสียง: ปิด';
  if (soundOn) void prepareAudio();
  else muteAudio();
});
get('fortuneAgain').addEventListener('click', resetLeaf);
get('fortuneCopy').addEventListener('click', copyLeaf);
lots.addEventListener('close', () => {
  cancelDraw();
  muteAudio();
  lotsStatus.textContent = '';
  copyFallback.hidden = true;
});

for (const radio of daily.querySelectorAll('input[name="fortune-day"]')) {
  const day = Number(radio.value);
  radio.checked = day === selectedDay;
  radio.addEventListener('change', () => {
    selectedDay = day;
    rememberBirthDay(day);
    renderDaily();
  });
}
daily.addEventListener('close', () => clearInterval(dailyTimer));
document.addEventListener('visibilitychange', () => {
  if (daily.open && !document.hidden) renderDaily();
});
