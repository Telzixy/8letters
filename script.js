/**
 * 8 Letters — I Love You Interactive Web Experience
 * Pure HTML5, CSS3, and JavaScript
 */

// --- Default Configuration ---
const DEFAULT_CONFIG = {
  recipient: 'Kamu',
  sender: 'Aku',
  letter: `Dari jutaan detik yang berlalu dalam hidupku, saat bersamamu adalah yang paling berharga.\n\nKehadiranmu selalu berhasil membawa kehangatan, tawa, dan ketenangan di setiap hariku. Terima kasih sudah menjadi alasan di balik senyumanku.`,
  waNumber: '6285349389548'
};

// State
let config = { ...DEFAULT_CONFIG };
let isAudioPlaying = false;
let audioContext = null;
let musicInterval = null;
let typewriterTimeout = null;

// DOM Elements
const bgCanvas = document.getElementById('bgCanvas');
const sealButton = document.getElementById('sealButton');
const envelope = document.getElementById('envelope');
const envelopeWrapper = document.getElementById('envelopeWrapper');
const previewRecipient = document.getElementById('previewRecipient');

const stepEnvelope = document.getElementById('step-envelope');
const stepLetter = document.getElementById('step-letter');
const stepQuestion = document.getElementById('step-question');
const stepCelebration = document.getElementById('step-celebration');

const letterGreeting = document.getElementById('letterGreeting');
const typewriterText = document.getElementById('typewriterText');
const reasonDetailBox = document.getElementById('reasonDetailBox');
const reasonItems = document.querySelectorAll('.reason-item');
const toQuestionBtn = document.getElementById('toQuestionBtn');

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const buttonsArea = document.getElementById('buttonsArea');
const waShareBtn = document.getElementById('waShareBtn');
const replayBtn = document.getElementById('replayBtn');

const musicToggleBtn = document.getElementById('musicToggleBtn');
const customizeBtn = document.getElementById('customizeBtn');
const customizeModal = document.getElementById('customizeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveChangesBtn = document.getElementById('saveChangesBtn');
const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
const copyUrlBtn = document.getElementById('copyUrlBtn');
const shareUrlInput = document.getElementById('shareUrlInput');
const copyNotice = document.getElementById('copyNotice');

const inputRecipient = document.getElementById('inputRecipient');
const inputSender = document.getElementById('inputSender');
const inputLetter = document.getElementById('inputLetter');
const inputWa = document.getElementById('inputWa');

// ==========================================================
// 1. INITIALIZATION & URL / STORAGE PARSING
// ==========================================================
function initApp() {
  loadConfig();
  applyConfigToUI();
  initBackgroundCanvas();
  setupEventListeners();
  updateShareUrlPreview();
}

function loadConfig() {
  const urlParams = new URLSearchParams(window.location.search);
  const toParam = urlParams.get('to');
  const fromParam = urlParams.get('from');
  const msgParam = urlParams.get('msg');
  const waParam = urlParams.get('wa');

  if (toParam || fromParam || msgParam || waParam) {
    if (toParam) config.recipient = decodeURIComponent(toParam);
    if (fromParam) config.sender = decodeURIComponent(fromParam);
    if (msgParam) config.letter = decodeURIComponent(msgParam);
    if (waParam) config.waNumber = decodeURIComponent(waParam);
  } else {
    const saved = localStorage.getItem('8letters_config');
    if (saved) {
      try {
        config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Failed to parse localStorage config');
      }
    }
  }
}

function applyConfigToUI() {
  previewRecipient.textContent = config.recipient;
  letterGreeting.textContent = `Hai ${config.recipient} ❤️`;

  // WhatsApp Button URL (Auto format 08xx -> 628xx)
  let cleanPhone = config.waNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  const messageText = encodeURIComponent(
    `Hai ${config.sender}! Aku udah buka web "8 Letters" darimu... Dan jawabanku: Aku juga sayang banget sama kamu! ❤️🥰`
  );
  waShareBtn.href = `https://wa.me/${cleanPhone}?text=${messageText}`;

  // Populate Modal Fields
  inputRecipient.value = config.recipient;
  inputSender.value = config.sender;
  inputLetter.value = config.letter;
  inputWa.value = config.waNumber;
}

function updateShareUrlPreview() {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('to', config.recipient);
  url.searchParams.set('from', config.sender);
  url.searchParams.set('msg', config.letter);
  if (config.waNumber) {
    url.searchParams.set('wa', config.waNumber);
  }
  shareUrlInput.value = url.toString();
}

// ==========================================================
// 2. BACKGROUND CANVAS PARTICLES (Floating Hearts & Sparkles)
// ==========================================================
function initBackgroundCanvas() {
  const ctx = bgCanvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 20;
      this.size = Math.random() * 14 + 8;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.type = Math.random() > 0.45 ? 'heart' : 'sparkle';
      this.color = Math.random() > 0.5 ? '#ff3366' : '#ff85a2';
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;
      if (this.y < -30 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      if (this.type === 'heart') {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
        ctx.bezierCurveTo(0, this.size, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ff6b8b';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  const particleCount = Math.min(35, Math.floor(window.innerWidth / 25));
  for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.y = Math.random() * height;
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================================
// 3. SYNTHESIZED ROMANTIC SOUNDS & MUSIC (Web Audio API)
// ==========================================================
function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Sound FX: Gentle Chime / Pop
function playChime(freq = 523.25, duration = 0.5) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio autoplay restrictions or unsupported
  }
}

// Romantic chord progression generator using mellow soft sines
function toggleRomanticMusic() {
  if (isAudioPlaying) {
    stopRomanticMusic();
  } else {
    startRomanticMusic();
  }
}

function startRomanticMusic() {
  try {
    const ctx = getAudioContext();
    isAudioPlaying = true;
    musicToggleBtn.classList.add('active');
    musicToggleBtn.querySelector('.btn-text').textContent = 'Musik: On 🎶';

    // Romantic Pentatonic notes (C4, D4, E4, G4, A4, C5, E5)
    const melodyNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];
    let step = 0;

    musicInterval = setInterval(() => {
      if (!isAudioPlaying) return;
      const note = melodyNotes[step % melodyNotes.length];
      playSoftNote(note, 0.9);
      if (step % 2 === 0) {
        // Soft bass note
        playSoftNote(note / 2, 1.4, 0.08);
      }
      step = (step + Math.floor(Math.random() * 2) + 1);
    }, 600);
  } catch (e) {
    console.warn('Audio init error:', e);
  }
}

function playSoftNote(freq, dur = 0.8, volume = 0.09) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) {}
}

function stopRomanticMusic() {
  isAudioPlaying = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  musicToggleBtn.classList.remove('active');
  musicToggleBtn.querySelector('.btn-text').textContent = 'Musik: Off';
}

// ==========================================================
// 4. STEP TRANSITIONS & TYPEWRITER EFFECT
// ==========================================================
function switchStep(fromStep, toStep) {
  fromStep.classList.remove('active');
  toStep.classList.add('active');
}

// Step 1: Open Envelope
function openEnvelope() {
  if (navigator.vibrate) {
    try { navigator.vibrate([40, 60, 40]); } catch (err) {}
  }
  playChime(659.25, 0.6);
  envelope.classList.add('open');

  // Trigger audio on first interaction if not yet started
  if (!isAudioPlaying) {
    startRomanticMusic();
  }

  // Confetti mini burst around seal
  if (window.confetti) {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ff3366', '#ff85a2', '#ffffff']
    });
  }

  setTimeout(() => {
    switchStep(stepEnvelope, stepLetter);
    startTypewriter(config.letter);
  }, 1000);
}

// Step 2: Typewriter
function startTypewriter(text) {
  typewriterText.textContent = '';
  clearTimeout(typewriterTimeout);
  let index = 0;

  function typeNextChar() {
    if (index < text.length) {
      typewriterText.textContent += text.charAt(index);
      index++;
      typewriterTimeout = setTimeout(typeNextChar, 32);
    }
  }
  typeNextChar();
}

// Interactive Reasons Click
function setupReasons() {
  reasonItems.forEach(item => {
    item.addEventListener('click', () => {
      reasonItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      const text = item.getAttribute('data-text');
      reasonDetailBox.innerHTML = `<p>${text}</p>`;
      playChime(587.33, 0.3);
    });
  });
}

// ==========================================================
// 5. RUNAWAY "NO" BUTTON (Mouse & Touch Friendly)
// ==========================================================
function moveNoButton(e) {
  if (e) {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
  }

  // Trigger mobile haptic feedback if supported
  if (navigator.vibrate) {
    try { navigator.vibrate(25); } catch (err) {}
  }

  playChime(329.63, 0.2);

  const containerRect = buttonsArea.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const windowWidth = window.innerWidth;

  // Ensure button remains safely visible inside phone screens
  const maxSafeX = Math.max(20, Math.min((containerRect.width - btnRect.width) / 2, (windowWidth - btnRect.width - 40) / 2));
  const randomX = (Math.random() - 0.5) * maxSafeX * 1.8;
  const randomY = (Math.random() - 0.5) * 80;

  noBtn.style.position = 'relative';
  noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;

  // Change text playfully each time
  const playfulTexts = ['Nggak bisa 😜', 'Eits kabur! 🏃', 'Kejar dong 😝', 'Coba lagi 😋', 'Pilih Hijau aja! ❤️', 'Gak kena 😜'];
  const randomText = playfulTexts[Math.floor(Math.random() * playfulTexts.length)];
  noBtn.textContent = randomText;
}

// Step 3 -> Step 4: Celebration ("Yes" Clicked)
function onYesClicked() {
  if (navigator.vibrate) {
    try { navigator.vibrate([60, 50, 100]); } catch (err) {}
  }
  playChime(880, 0.8);
  switchStep(stepQuestion, stepCelebration);

  // Big Confetti Celebration
  if (window.confetti) {
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }
}

// ==========================================================
// 6. EVENT LISTENERS SETUP
// ==========================================================
function setupEventListeners() {
  // Envelope open triggers
  sealButton.addEventListener('click', openEnvelope);
  envelopeWrapper.addEventListener('click', (e) => {
    if (!envelope.classList.contains('open')) {
      openEnvelope();
    }
  });

  // Step 2 Next button
  toQuestionBtn.addEventListener('click', () => {
    playChime(523.25, 0.3);
    switchStep(stepLetter, stepQuestion);
  });

  // Runaway button triggers (Desktop & Mobile Touch)
  noBtn.addEventListener('mouseenter', moveNoButton);
  noBtn.addEventListener('pointerdown', moveNoButton);
  noBtn.addEventListener('touchstart', moveNoButton, { passive: false });
  noBtn.addEventListener('click', moveNoButton);

  // Yes button
  yesBtn.addEventListener('click', onYesClicked);

  // Replay
  replayBtn.addEventListener('click', () => {
    envelope.classList.remove('open');
    noBtn.style.transform = 'none';
    noBtn.textContent = 'Nggak 😜';
    switchStep(stepCelebration, stepEnvelope);
  });

  // Audio Toggle
  musicToggleBtn.addEventListener('click', toggleRomanticMusic);

  // Modal Open/Close
  customizeBtn.addEventListener('click', () => {
    updateShareUrlPreview();
    customizeModal.classList.add('show');
  });

  closeModalBtn.addEventListener('click', () => {
    customizeModal.classList.remove('show');
  });

  customizeModal.addEventListener('click', (e) => {
    if (e.target === customizeModal) {
      customizeModal.classList.remove('show');
    }
  });

  // Save Modal Changes
  saveChangesBtn.addEventListener('click', () => {
    config.recipient = inputRecipient.value.trim() || DEFAULT_CONFIG.recipient;
    config.sender = inputSender.value.trim() || DEFAULT_CONFIG.sender;
    config.letter = inputLetter.value.trim() || DEFAULT_CONFIG.letter;
    config.waNumber = inputWa.value.trim() || DEFAULT_CONFIG.waNumber;

    localStorage.setItem('8letters_config', JSON.stringify(config));
    applyConfigToUI();
    updateShareUrlPreview();
    customizeModal.classList.remove('show');

    // If currently on letter step, refresh typewriter
    if (stepLetter.classList.contains('active')) {
      startTypewriter(config.letter);
    }
  });

  // Reset to Defaults
  resetDefaultsBtn.addEventListener('click', () => {
    if (confirm('Kembalikan ke pesan bawaan?')) {
      config = { ...DEFAULT_CONFIG };
      localStorage.removeItem('8letters_config');
      applyConfigToUI();
      updateShareUrlPreview();
      customizeModal.classList.remove('show');
    }
  });

  // Copy Link Button
  copyUrlBtn.addEventListener('click', () => {
    updateShareUrlPreview();
    shareUrlInput.select();
    shareUrlInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(shareUrlInput.value).then(() => {
      copyNotice.style.display = 'block';
      setTimeout(() => {
        copyNotice.style.display = 'none';
      }, 3000);
    }).catch(() => {
      document.execCommand('copy');
      copyNotice.style.display = 'block';
    });
  });

  setupReasons();
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
