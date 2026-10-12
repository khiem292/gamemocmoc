/* Mộc Mộc Farm · nhạc nền được sáng tác cho trò chơi và hiệu ứng Web Audio nhẹ nhàng.
   Trình duyệt iOS chỉ cho phát âm thanh sau thao tác đầu tiên của người chơi.
   Không tải thư viện hoặc dịch vụ âm thanh bên ngoài.
*/
(function () {
  'use strict';
  const KEY = 'mocmoc.audio.v1';
  const defaults = { music: true, effects: true, volume: 65 };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
  const prefs = {
    music: typeof saved.music === 'boolean' ? saved.music : defaults.music,
    effects: typeof saved.effects === 'boolean' ? saved.effects : defaults.effects,
    volume: Number.isFinite(Number(saved.volume)) ? Math.max(0, Math.min(100, Number(saved.volume))) : defaults.volume
  };
  let unlocked = false;
  let context = null;
  let starting = null;
  const music = new Audio(window.MOCMOC_EMBEDDED_THEME || './farm-theme.mp3');
  music.loop = true;
  music.preload = 'auto';
  music.setAttribute('playsinline', '');
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (_) {} }
  function adjust() { music.volume = prefs.music ? (prefs.volume / 100) * .42 : 0; }
  function playMusic() {
    adjust();
    if (!unlocked || !prefs.music || !prefs.volume || document.hidden) return;
    if (!music.paused || starting) return;
    try {
      starting = music.play();
      if (starting?.then) starting.catch(() => {}).finally(() => { starting = null; });
      else starting = null;
    } catch (_) { starting = null; }
  }
  function unlock() {
    unlocked = true;
    playMusic();
  }
  function tone(freq, offset, duration, gain, kind = 'sine', glide = 0) {
    if (!context) return;
    const t = context.currentTime + offset;
    const osc = context.createOscillator();
    const vol = context.createGain();
    osc.type = kind;
    osc.frequency.setValueAtTime(freq, t);
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + glide), t + duration);
    const master = (prefs.volume / 100) * .095;
    vol.gain.setValueAtTime(.0001, t);
    vol.gain.exponentialRampToValueAtTime(Math.max(.0002, gain * master), t + .012);
    vol.gain.exponentialRampToValueAtTime(.0001, t + duration);
    osc.connect(vol).connect(context.destination);
    osc.start(t);
    osc.stop(t + duration + .02);
  }
  const notes = {
    tap: [[523,0,.10,.30], [659,.045,.115,.19]],
    menu: [[392,0,.13,.28], [523,.08,.15,.31]],
    seed: [[587,0,.11,.28], [784,.065,.13,.25]],
    plant: [[392,0,.16,.48], [523,.12,.18,.40], [659,.22,.18,.32]],
    water: [[880,0,.16,.31], [698,.095,.18,.29], [523,.19,.2,.24]],
    fertilizer: [[523,0,.15,.36], [659,.1,.19,.38], [784,.20,.22,.32]],
    harvest: [[523,0,.16,.52], [659,.09,.16,.45], [784,.18,.18,.44], [1046,.30,.27,.39]],
    coins: [[659,0,.11,.43], [988,.10,.21,.46]],
    sell: [[784,0,.11,.32], [988,.08,.14,.36], [1175,.17,.18,.29]],
    quest: [[523,0,.13,.46], [659,.10,.13,.39], [784,.20,.13,.38], [1046,.30,.25,.40]],
    pest: [[355,0,.14,.25], [475,.085,.17,.22]],
    error: [[311,0,.16,.23]],
    avatar: [[784,0,.14,.23]],
    login: [[523,0,.14,.38], [784,.13,.18,.37], [1046,.25,.23,.35]]
  };
  function effect(name = 'tap') {
    if (!prefs.effects || !prefs.volume) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!context) context = new AudioCtx();
      if (context.state === 'suspended') context.resume().catch(() => {});
      const sequence = notes[name] || notes.tap;
      sequence.forEach(([f, at, seconds, amplitude]) => tone(f, at, seconds, amplitude, name === 'error' ? 'sine' : 'sine'));
    } catch (_) { /* âm thanh không được hỗ trợ vẫn chơi game bình thường */ }
  }
  function setMusic(next) {
    prefs.music = Boolean(next);
    persist();
    if (prefs.music) playMusic(); else music.pause();
    adjust();
  }
  function setEffects(next) { prefs.effects = Boolean(next); persist(); }
  function setVolume(next) {
    prefs.volume = Math.max(0, Math.min(100, Number(next) || 0));
    persist(); adjust();
    if (prefs.volume && prefs.music) playMusic();
    if (!prefs.volume) music.pause();
  }
  function snapshot() { return { ...prefs }; }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) music.pause(); else playMusic();
  });
  window.addEventListener('pagehide', () => music.pause());
  window.addEventListener('pageshow', () => playMusic());
  adjust();
  window.MocMocAudio = { unlock, effect, setMusic, setEffects, setVolume, snapshot };
})();
