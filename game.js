/* MỘC MỘC FARM · Game trồng cây 2D dành cho trình duyệt iOS.
   Phiên bản này chạy 100% trên thiết bị, không gửi tài khoản hay tiến trình lên máy chủ.
   Dữ liệu được lưu trong localStorage của đúng trình duyệt/tên miền đang mở.
*/
'use strict';
const KEY_ACCOUNTS = 'mocmoc.accounts.v1';
const KEY_ACTIVE = 'mocmoc.active.v1';
const STATE_PREFIX = 'mocmoc.farm.v1.';
const CROPS = {
  carrot: { name: 'Cà rốt', emoji: '🥕', seed: 12, sell: 36, seconds: 55, season: 'thu', xp: 12, desc: 'Dễ trồng, lớn nhanh' },
  tomato: { name: 'Cà chua', emoji: '🍅', seed: 24, sell: 65, seconds: 110, season: 'ha', xp: 19, desc: 'Trái mọng ngọt lành' },
  corn: { name: 'Bắp ngô', emoji: '🌽', seed: 38, sell: 98, seconds: 170, season: 'ha', xp: 25, desc: 'Nông sản có giá trị' },
  strawberry: { name: 'Dâu tây', emoji: '🍓', seed: 52, sell: 142, seconds: 230, season: 'xuan', xp: 34, desc: 'Hương vị mùa xuân' },
  pumpkin: { name: 'Bí ngô', emoji: '🎃', seed: 75, sell: 205, seconds: 320, season: 'dong', xp: 45, desc: 'Thu hoạch cực thích' }
};
const PESTS = {
  worm: { name: 'Sâu ăn lá', emoji: '🐛', tool: 'spray', toolName: 'Bình xịt sinh học' },
  bird: { name: 'Chim ăn hạt', emoji: '🐦', tool: 'scarecrow', toolName: 'Bù nhìn nhỏ' },
  rabbit: { name: 'Thỏ phá vườn', emoji: '🐰', tool: 'net', toolName: 'Lưới bảo vệ' }
};
const TOOLS = {
  spray: { name: 'Bình xịt sinh học', emoji: '🧴', price: 35, desc: 'Đuổi sâu ăn lá · dùng 1 lần' },
  scarecrow: { name: 'Bù nhìn nhỏ', emoji: '🎎', price: 60, desc: 'Đuổi chim ăn hạt · dùng 1 lần' },
  net: { name: 'Lưới bảo vệ', emoji: '🥅', price: 65, desc: 'Đuổi thỏ phá vườn · dùng 1 lần' },
  fertilizer: { name: 'Phân hữu cơ', emoji: '🧺', price: 29, desc: 'Cây lớn nhanh, thu thêm sản phẩm' }
};
const QUESTS = [
  { id: 'plant', emoji: '🌱', name: 'Người gieo mầm', target: 3, desc: 'Trồng 3 cây bất kỳ', coins: 70 },
  { id: 'water', emoji: '💧', name: 'Bàn tay chăm chỉ', target: 3, desc: 'Tưới nước 3 lần', coins: 55 },
  { id: 'harvest', emoji: '🧺', name: 'Mùa màng bội thu', target: 2, desc: 'Thu hoạch 2 lần', coins: 90 },
  { id: 'sell', emoji: '🪙', name: 'Thương nhân nhí', target: 3, desc: 'Bán 3 nông sản', coins: 100 },
  { id: 'chase', emoji: '🛡️', name: 'Người gác vườn', target: 1, desc: 'Đuổi một con vật gây hại', coins: 85 }
];
const SKINS = ['#f0c3a0', '#dca178', '#bd7958', '#80533e'];
const HAIRS = ['#49362b', '#8a5738', '#c18a4c', '#353f57'];
const SHIRTS = ['#e78f73', '#6ab6b3', '#a48ad8', '#e6b559'];
const $ = (id) => document.getElementById(id);
const app = $('app');
const overlay = $('overlay');
let activeUser = null;
let state = null;
let screen = 'farm';
let shopTab = 'seed';
let accountMode = 'register';
let modal = null;
let tutorialStep = 0;
let selectedPlot = -1;
let nextRefresh = 0;
let lastClockLabel = '';
let navMenuOpen = false;
let seedDockOpen = true;

function safeJSON(text, fallback) { try { return JSON.parse(text) ?? fallback; } catch (_) { return fallback; } }
function getLocal(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
function setLocal(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { toast('Không thể lưu dữ liệu. Kiểm tra chế độ duyệt riêng hoặc dung lượng.'); return false; } }
function esc(text) { return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function formatCoins(v) { return Number(v || 0).toLocaleString('vi-VN'); }
function vnDateParts(date = new Date()) {
  const pts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const out = Object.fromEntries(pts.filter(x => x.type !== 'literal').map(x => [x.type, +x.value]));
  return { year: out.year, month: out.month, day: out.day, hour: out.hour, minute: out.minute };
}
function seasonInfo(date = new Date()) {
  const t = vnDateParts(date);
  let season = 'dong';
  if (t.month >= 2 && t.month <= 4) season = 'xuan';
  else if (t.month >= 5 && t.month <= 7) season = 'ha';
  else if (t.month >= 8 && t.month <= 10) season = 'thu';
  const seasons = { xuan: ['Mùa xuân', '🌸'], ha: ['Mùa hạ', '☀️'], thu: ['Mùa thu', '🍂'], dong: ['Mùa đông', '❄️'] };
  const score = ((t.year * 13 + t.month * 17 + t.day * 31) % 20);
  let weather = { id: 'sun', icon: '☀️', label: 'Trời nắng', hint: 'Ánh nắng nuôi cây lớn' };
  if (score < (season === 'ha' ? 8 : 5)) weather = { id: 'rain', icon: '🌧️', label: 'Mưa nhẹ', hint: 'Mưa giúp cây tươi tốt' };
  else if (score < 12) weather = { id: 'cloud', icon: '⛅', label: 'Mây dịu', hint: 'Thời tiết lý tưởng cho vườn' };
  else if (score < 15) weather = { id: 'wind', icon: '🍃', label: 'Gió mát', hint: 'Có gió thoảng qua cánh đồng' };
  const night = t.hour < 6 || t.hour >= 18;
  return { ...t, season, seasonName: seasons[season][0], seasonIcon: seasons[season][1], weather, night, dateKey: `${t.year}-${t.month}-${t.day}` };
}
function durationFor(key) {
  const c = CROPS[key];
  const si = seasonInfo();
  let mult = c.season === si.season ? .83 : 1;
  if (si.weather.id === 'rain') mult *= .94;
  return Math.max(25, Math.round(c.seconds * mult));
}
function newState(name) {
  return {
    name, coins: 250, xp: 0, plots: Array.from({ length: 12 }, () => null),
    seeds: { carrot: 4, tomato: 2, corn: 1, strawberry: 0, pumpkin: 0 },
    produce: { carrot: 0, tomato: 0, corn: 0, strawberry: 0, pumpkin: 0 },
    tools: { spray: 2, scarecrow: 1, net: 1, fertilizer: 2 },
    water: 10, lastWell: 0, selectedSeed: 'carrot',
    stats: { plant: 0, water: 0, harvest: 0, sell: 0, chase: 0 }, claimed: [],
    avatar: { skin: 1, hair: 0, hairStyle: 'short', shirt: 0, hat: true },
    tutorialDone: false, lastPestRoll: Date.now(), lastRainDay: ''
  };
}
function normalizeState(s, name) {
  if (!s || typeof s !== 'object' || !Array.isArray(s.plots)) return newState(name);
  const blank = newState(name);
  return { ...blank, ...s, name, plots: Array.from({ length: 12 }, (_, i) => s.plots[i] || null),
    seeds: { ...blank.seeds, ...(s.seeds || {}) }, produce: { ...blank.produce, ...(s.produce || {}) },
    tools: { ...blank.tools, ...(s.tools || {}) }, stats: { ...blank.stats, ...(s.stats || {}) },
    avatar: { ...blank.avatar, ...(s.avatar || {}) }, claimed: Array.isArray(s.claimed) ? s.claimed : [] };
}
function save() { if (state && activeUser) setLocal(STATE_PREFIX + activeUser, JSON.stringify(state)); }
function level() { return Math.floor(state.xp / 140) + 1; }
function toast(message) {
  const parent = $('toasts'); if (!parent) return;
  const node = document.createElement('div'); node.className = 'toast'; node.textContent = message;
  parent.appendChild(node); setTimeout(() => node.remove(), 3100);
}
function doll(avatar = state?.avatar, cl = '') {
  const a = avatar || { skin: 1, hair: 0, hairStyle: 'short', shirt: 0, hat: true };
  return `<span class="doll ${cl} ${a.hat ? '' : 'no-hat'}" style="--skin:${SKINS[a.skin] || SKINS[1]};--hair:${HAIRS[a.hair] || HAIRS[0]};--shirt:${SHIRTS[a.shirt] || SHIRTS[0]}"><span class="hair ${['short', 'long', 'spiky'].includes(a.hairStyle) ? a.hairStyle : 'short'}"></span><span class="head"><span class="eyes"><span>•</span><span>•</span></span></span><span class="body"></span><span class="legs"></span><span class="hat"></span></span>`;
}
function loginScreen() {
  document.body.classList.remove('mocmoc-playing');
  app.innerHTML = `<main class="auth-screen pixel-auth-screen">
    <div class="auth-pixel-horizon" aria-hidden="true"><span class="auth-pixel-sun"></span><span class="auth-pixel-cloud cloud-one"></span><span class="auth-pixel-cloud cloud-two"></span><span class="auth-pixel-mountain mountain-one"></span><span class="auth-pixel-mountain mountain-two"></span><span class="auth-pixel-barn">🏡</span><span class="auth-pixel-tree tree-one">🌳</span><span class="auth-pixel-tree tree-two">🌲</span><span class="auth-pixel-crops">🌱 🌻 🌾 🌿 🌱 🌾</span></div>
    <section class="auth-card pixel-auth-card" aria-label="Đăng nhập Mộc Mộc Farm">
      <div class="auth-pixel-ribbon">✦ MỘC MỘC VALLEY ✦</div>
      <div class="logo-orb pixel-auth-logo">🌿</div>
      <h1 class="brand pixel-auth-brand">Mộc Mộc Farm</h1>
      <p class="tagline pixel-auth-subtitle">🌻 Nông trại nhỏ · Niềm vui lớn 🌻</p>
      <div class="auth-tabs" role="group" aria-label="Chọn chế độ tài khoản"><button type="button" data-action="auth-tab" data-mode="login" class="auth-tab ${accountMode === 'login' ? 'active' : ''}" aria-pressed="${accountMode === 'login'}">🏡 Đăng nhập</button><button type="button" data-action="auth-tab" data-mode="register" class="auth-tab ${accountMode === 'register' ? 'active' : ''}" aria-pressed="${accountMode === 'register'}">🌱 Tạo tài khoản</button></div>
      <form id="auth-form">
        <div class="field"><label for="username">👩‍🌾 Tên người chơi</label><input id="username" name="username" autocomplete="username" maxlength="18" placeholder="Ví dụ: NongDanXanh" required></div>
        <div class="field"><label for="pin">🔒 Mã PIN (4–8 chữ số)</label><input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="${accountMode === 'register' ? 'new-password' : 'current-password'}" minlength="4" maxlength="8" pattern="[0-9]{4,8}" placeholder="Nhập mã PIN" required></div>
        <p class="auth-error" id="auth-error" role="alert"></p>
        <button type="submit" class="btn btn-primary btn-block auth-submit">${accountMode === 'register' ? '✨ Bắt đầu nông trại mới' : '🌻 Vào nông trại'}</button>
      </form>
      <div class="auth-separator"><span>hoặc tiếp tục bằng</span></div>
      <div class="social-buttons">
        <button type="button" class="social-btn social-google" data-action="social-login" data-provider="google"><span class="social-google-g" aria-hidden="true">G</span><span>Tiếp tục với Google</span></button>
        <button type="button" class="social-btn social-facebook" data-action="social-login" data-provider="facebook"><span class="social-facebook-f" aria-hidden="true">f</span><span>Tiếp tục với Facebook</span></button>
      </div>
      <p class="auth-social-status" id="social-login-status" role="status">${window.MocMocSocial?.configured() ? '🔐 Đăng nhập an toàn thông qua Firebase.' : '🔧 Chức năng Google/Facebook cần thiết lập Firebase trước khi sử dụng.'}</p>
      <p class="auth-info">🌾 Bản chơi thử lưu nông trại trên thiết bị này. Đăng nhập Google/Facebook không tự đồng bộ tiến trình giữa các máy. Không dùng mã PIN quan trọng.</p>
    </section>
  </main>`;
  if (overlay) overlay.classList.add('hidden');
}
async function pinHash(user, pin) {
  const input = `mocmoc-local-v1|${user.toLocaleLowerCase('vi-VN')}|${pin}`;
  if (window.crypto?.subtle && window.TextEncoder) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return 'sha:' + Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback only for offline/file:// demos. This is NOT production authentication.
  let h = 2166136261; for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  return 'local:' + (h >>> 0).toString(16);
}
async function submitAuth(event) {
  event.preventDefault();
  const name = $('username')?.value.trim() || '';
  const pin = $('pin')?.value || '';
  const error = $('auth-error');
  if (name.length < 2 || name.length > 18) { if (error) error.textContent = 'Tên cần từ 2 đến 18 ký tự.'; return; }
  if (!/^\d{4,8}$/.test(pin)) { if (error) error.textContent = 'Mã PIN phải gồm 4 đến 8 chữ số.'; return; }
  const users = safeJSON(getLocal(KEY_ACCOUNTS), []);
  const existing = users.find(u => u.id === name.toLocaleLowerCase('vi-VN'));
  const fingerprint = await pinHash(name, pin);
  if (accountMode === 'register') {
    if (existing) { if (error) error.textContent = 'Tên đã có trên thiết bị này. Hãy đăng nhập hoặc chọn tên khác.'; return; }
    const user = { id: name.toLocaleLowerCase('vi-VN'), name, passHash: fingerprint };
    users.push(user);
    if (!setLocal(KEY_ACCOUNTS, JSON.stringify(users))) return;
    activeUser = user.id; state = newState(name); save();
    setLocal(KEY_ACTIVE, user.id); screen = 'farm'; window.MocMocAudio.effect('login'); render(); openTutorial(0);
  } else {
    if (!existing || existing.passHash !== fingerprint) { if (error) error.textContent = 'Tên hoặc mã PIN không đúng trên thiết bị này.'; return; }
    activeUser = existing.id; state = normalizeState(safeJSON(getLocal(STATE_PREFIX + activeUser), null), existing.name);
    setLocal(KEY_ACTIVE, activeUser); screen = 'farm'; processWorld(); window.MocMocAudio.effect('login'); render();
  }
}
// Cầu nối tài khoản Firebase thật -> dữ liệu game cục bộ, phân tách khỏi tài khoản PIN.
window.MocMocEnterSocial = function(user) {
  if (!user || !user.uid) return;
  const id = `oauth:${user.uid}`;
  if (activeUser === id && state) return;
  const name = String(user.displayName || user.email?.split('@')[0] || 'Nông dân').trim().slice(0, 18) || 'Nông dân';
  const saved = safeJSON(getLocal(STATE_PREFIX + id), null);
  activeUser = id;
  state = normalizeState(saved, name);
  setLocal(KEY_ACTIVE, id);
  screen = 'farm';
  navMenuOpen = false;
  processWorld();
  save();
  window.MocMocAudio?.effect('login');
  render();
  if (!saved || !state.tutorialDone) openTutorial(0);
};
window.MocMocSocialSessionGone = function() {
  if (!String(getLocal(KEY_ACTIVE) || '').startsWith('oauth:')) return;
  activeUser = null; state = null; setLocal(KEY_ACTIVE, '');
  accountMode = 'login'; loginScreen();
};
function restore() {
  const id = getLocal(KEY_ACTIVE);
  if (String(id || '').startsWith('oauth:')) { loginScreen(); return; }
  const user = safeJSON(getLocal(KEY_ACCOUNTS), []).find(u => u.id === id);
  if (id && user) {
    activeUser = id;
    state = normalizeState(safeJSON(getLocal(STATE_PREFIX + id), null), user.name);
    processWorld(); render();
    if (!state.tutorialDone) openTutorial(0);
  } else loginScreen();
}
function getProgress(p, now = Date.now()) {
  if (!p) return 0;
  return Math.min(1, Math.max(0, ((now - p.plantedAt) / 1000 + (p.bonus || 0)) / p.duration));
}
function remaining(p) { return Math.max(0, Math.ceil((p.duration * (1 - getProgress(p))))); }
function durationText(sec) {
  if (sec <= 0) return 'Sẵn sàng!';
  const min = Math.floor(sec / 60); const s = sec % 60;
  return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
function processWorld() {
  if (!state) return;
  const now = Date.now();
  const si = seasonInfo();
  let changed = false;
  if (si.weather.id === 'rain' && state.lastRainDay !== si.dateKey) {
    const planted = state.plots.filter(Boolean);
    planted.forEach(p => { if (p.hp > 0) { p.bonus = (p.bonus || 0) + 9; p.hp = Math.min(100, (p.hp ?? 100) + 7); } });
    state.lastRainDay = si.dateKey; changed = true;
    if (planted.length) toast('🌧️ Mưa giúp cây tăng trưởng và khỏe hơn!');
  }
  for (const p of state.plots) {
    if (!p || !p.pest || p.hp <= 0) continue;
    const elapsed = now - (p.lastDamage || now);
    if (elapsed >= 25000) {
      const drops = Math.min(6, Math.floor(elapsed / 25000));
      p.hp = Math.max(0, (p.hp ?? 100) - drops * 7);
      p.lastDamage = now; changed = true;
      if (p.hp === 0) toast('🥀 Một luống cây đã héo. Hãy dọn đất để trồng lại.');
    }
  }
  if (now - (state.lastPestRoll || now) >= 38000) {
    state.lastPestRoll = now; changed = true;
    const candidates = state.plots.map((p, index) => ({ p, index })).filter(x => x.p && x.p.hp > 0 && !x.p.pest && getProgress(x.p) < 1);
    if (candidates.length && Math.random() < .42) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      chosen.p.pest = Object.keys(PESTS)[Math.floor(Math.random() * 3)];
      chosen.p.lastDamage = now;
      toast(`${PESTS[chosen.p.pest].emoji} ${PESTS[chosen.p.pest].name} xuất hiện ở ô ${chosen.index + 1}!`);
    }
  }
  if (changed) save();
}
function render() {
  if (!state) { loginScreen(); return; }
  document.body.classList.add('mocmoc-playing');
  const priorScroll = $('game-content')?.scrollTop || 0;
  const priorSeedScroll = $('seed-strip')?.scrollLeft || 0;
  const si = seasonInfo();
  const audioPrefs = window.MocMocAudio.snapshot();
  app.innerHTML = `<div class="game ${screen === 'farm' ? 'pixel-game' : ''}">
    <header class="hud"><div class="hud-top"><div><h1 class="hud-brand">🌿 Mộc Mộc Farm</h1><div class="hud-lvl">NÔNG TRẠI BÌNH YÊN · CẤP ${level()}</div></div>
    ${profileMenuMarkup()}</div>
    <div class="hud-middle"><span class="pill">🪙 <span id="money-value">${formatCoins(state.coins)}</span></span><span class="pill">💧 <span id="water-value">${state.water}</span>/20</span><span class="pill season-chip">${si.seasonIcon} ${si.seasonName}</span><span class="pill clock-chip">🕒 <span id="clock-compact">${String(si.hour).padStart(2,'0')}:${String(si.minute).padStart(2,'0')}</span><span class="clock-full" id="clock-label"> · ${timeLabel(si)}</span></span><button type="button" class="pill audio-hud-button" data-action="open-sound" title="Cài đặt âm thanh" aria-label="Cài đặt âm thanh">${audioPrefs.music ? '🎵' : '🔇'} Âm thanh</button></div></header>
    <main class="game-content ${screen === 'farm' ? 'farm-content' : ''}" id="game-content">${screen === 'farm' ? farmMarkup(si) : screen === 'shop' ? shopMarkup() : screen === 'inventory' ? inventoryMarkup() : screen === 'character' ? characterMarkup() : questsMarkup()}</main>
    ${screen === 'farm' ? seedToolbarMarkup() : ''}

    </div>`;
  const content = $('game-content');
  if (content) content.scrollTop = priorScroll;
  const seedStrip = $('seed-strip');
  if (seedStrip) seedStrip.scrollLeft = priorSeedScroll;
  if (modal) drawModal();
  if (screen === 'farm') requestAnimationFrame(() => window.MocMocPixel?.mount());
}
function profileMenuMarkup() {
  const items = [
    ['farm','🏡','Vườn'],
    ['shop','🛒','Cửa hàng'],
    ['inventory','🎒','Kho đồ'],
    ['character','🧑‍🌾','Nhân vật'],
    ['quests','📜','Nhiệm vụ']
  ];
  return `<div class="profile-area" id="profile-area">
    <div class="hud-player-meta"><div class="hud-player-title">${esc(state.name)}</div><div class="small muted">⭐ ${state.xp} XP</div></div>
    <button type="button" id="profile-menu-trigger" class="profile-trigger" data-action="toggle-profile-menu"
      aria-controls="profile-menu-panel" aria-haspopup="true" aria-expanded="${navMenuOpen}"
      aria-label="${navMenuOpen ? 'Đóng menu hồ sơ' : 'Mở menu hồ sơ'}" title="Mở menu từ ảnh đại diện">
      <span class="avatar-button">${doll(state.avatar,'small')}</span><span class="profile-menu-chevron" aria-hidden="true">⌄</span>
    </button>
    <nav class="profile-menu-panel ${navMenuOpen ? 'open' : ''}" id="profile-menu-panel" aria-label="Điều hướng từ hồ sơ" ${navMenuOpen ? '' : 'hidden'}>
      <div class="profile-menu-title">🌿 Menu nông trại</div>
      ${items.map(([id, icon, label]) => `<button type="button" data-action="nav" data-screen="${id}" class="menu-item ${screen === id ? 'active' : ''}" ${screen === id ? 'aria-current="page"' : ''}><span class="menu-icon">${icon}</span><span>${label}</span></button>`).join('')}
      <div class="profile-menu-separator"></div>
      <button type="button" data-action="open-sound" class="menu-item"><span class="menu-icon">🎵</span><span>Âm thanh</span></button>
    </nav>
  </div>`;
}
function setProfileMenuOpen(open) {
  navMenuOpen = Boolean(open);
  const trigger = $('profile-menu-trigger');
  const panel = $('profile-menu-panel');
  if (trigger) {
    trigger.setAttribute('aria-expanded', String(navMenuOpen));
    trigger.setAttribute('aria-label', navMenuOpen ? 'Đóng menu hồ sơ' : 'Mở menu hồ sơ');
  }
  if (panel) { panel.hidden = !navMenuOpen; panel.classList.toggle('open', navMenuOpen); }
}

function seedToolbarMarkup() {
  const chosen = CROPS[state.selectedSeed] ? state.selectedSeed : 'carrot';
  const crop = CROPS[chosen];
  const qty = state.seeds[chosen] || 0;
  return `<section id="seed-dock" class="seed-dock ${seedDockOpen ? '' : 'collapsed'}" aria-label="Khay hạt giống thu gọn">
    <button class="seed-collapsed-trigger" type="button" data-action="toggle-seeds" aria-expanded="${seedDockOpen}" aria-label="Mở khay hạt giống">🌱 <span id="seed-collapsed-name">${crop.emoji} ${crop.name} ×${qty}</span> <span aria-hidden="true">⌃</span></button>
    <div class="seed-dock-head"><span><b>🌱 HẠT GIỐNG</b> <span class="seed-instruction">· chạm vào đất để gieo</span></span>
      <span class="seed-current" id="seed-current">${qty > 0 ? `${crop.emoji} ${crop.name} ×${qty}` : `⚠️ Hết ${crop.name}`}</span>
      <button class="seed-minimize" type="button" data-action="toggle-seeds" aria-expanded="${seedDockOpen}" aria-label="Thu gọn khay hạt giống">⌄</button></div>
    <div class="seed-strip" id="seed-strip" role="group" aria-label="Chọn loại hạt">
      ${Object.entries(CROPS).map(([id,c]) => { const n = state.seeds[id] || 0; return `<button type="button" class="seed-item ${chosen === id ? 'selected' : ''} ${n < 1 ? 'sold-out' : ''}" data-action="select-seed" data-id="${id}" aria-label="${c.name}, còn ${n} hạt" aria-pressed="${chosen === id}"><span class="seed-emoji">${c.emoji}</span><span class="seed-name">${c.name}</span><span class="seed-count">×${n} ${n === 0 ? '· Hết' : ''}</span></button>`; }).join('')}
      <button type="button" class="seed-item seed-buy" data-action="open-shop" data-shop="seed" aria-label="Đến Cô Mây mua thêm hạt giống"><span class="seed-emoji">🛒</span><span class="seed-name">Mua hạt</span><span class="seed-count">Cô Mây</span></button>
    </div></section>`;
}
function selectSeed(id) {
  if (!CROPS[id]) return;
  state.selectedSeed = id; save();
  document.querySelectorAll('.seed-item[data-action="select-seed"]').forEach(btn => {
    const selected = btn.dataset.id === id;
    btn.classList.toggle('selected', selected);
    btn.setAttribute('aria-pressed', String(selected));
  });
  const available = state.seeds[id] || 0;
  const label = $('seed-current');
  if (label) label.textContent = available ? `${CROPS[id].emoji} ${CROPS[id].name} ×${available}` : `⚠️ Hết ${CROPS[id].name}`;
  const mini = $('seed-collapsed-name');
  if (mini) mini.textContent = `${CROPS[id].emoji} ${CROPS[id].name} ×${available}`;
  if (!available) toast(`Bạn đã hết hạt ${CROPS[id].name}. Ghé Cô Mây mua thêm nhé!`);
}
function timeLabel(si) { return `${String(si.day).padStart(2,'0')}/${String(si.month).padStart(2,'0')}/${si.year} · ${String(si.hour).padStart(2,'0')}:${String(si.minute).padStart(2,'0')}`; }
function cropAppearance(p) {
  if (!p) return '<span class="plot-plus">＋</span><span class="plot-label">Gieo hạt</span>';
  if (p.hp <= 0) return `<span class="plot-plant">🥀</span><span class="plot-label">Cây héo</span>`;
  const progress = getProgress(p);
  const phase = progress >= .57 ? CROPS[p.crop].emoji : progress >= .25 ? '🌿' : '🌱';
  return `<span class="plot-plant ${progress < 1 ? 'growing' : ''}">${phase}</span><span class="plot-label">${progress >= 1 ? 'Thu hoạch!' : durationText(remaining(p))}</span>
    ${progress < 1 ? `<span class="plot-track"><span class="plot-track-fill" style="width:${Math.floor(progress * 100)}%"></span></span>` : ''}
    ${p.pest ? `<span class="pest-alert">${PESTS[p.pest]?.emoji || '🐛'}</span>` : ''}`;
}
function farmMarkup(si) {
  return `<section class="pixel-shell" aria-label="Bản đồ nông trại pixel art">
      <canvas id="pixel-world" class="pixel-canvas" aria-label="Bản đồ: chạm vào ô đất để trồng hoặc thu hoạch; chạm NPC để mua bán"></canvas>
      <div class="pixel-scene-label"><b>🌻 MỘC MỘC VALLEY</b><span>${si.weather.icon} ${si.weather.label} · ${si.seasonName}</span></div>
      <button class="pixel-help" data-action="tutorial" title="Xem hướng dẫn">?</button>
      <div class="pixel-tip">${si.night ? '🌙 Đêm yên bình' : '🍃 Ngày mới trên nông trại'} · Chạm luống đất để gieo / thu hoạch</div>
      <div class="pixel-pad" aria-label="Điều khiển nhân vật">
        <button type="button" class="pixel-move up" data-move="up" aria-label="Đi lên">▲</button>
        <button type="button" class="pixel-move left" data-move="left" aria-label="Sang trái">◀</button>
        <button type="button" class="pixel-move down" data-move="down" aria-label="Đi xuống">▼</button>
        <button type="button" class="pixel-move right" data-move="right" aria-label="Sang phải">▶</button>
      </div>
      <button class="pixel-action" type="button" data-action="nearby" title="Tương tác với đối tượng gần nhất">✋ <span>Tương tác</span></button>
    </section>`;
}
function shopMarkup() {
  const people = { seed: ['👩‍🌾', 'Cô Mây', 'Chuyên bán hạt giống tốt nhất làng'], sell: ['👨‍🌾', 'Chú Tư', 'Thu mua nông sản với giá rõ ràng'], tool: ['👨‍🔧', 'Bác Nâu', 'Dụng cụ bảo vệ & phân bón'] };
  const p = people[shopTab];
  let cards = '';
  if (shopTab === 'seed') cards = Object.entries(CROPS).map(([id, c]) => `<article class="item-card"><div class="item-pic">${c.emoji}</div><h3 class="item-title">${c.name}</h3><p class="item-desc">${c.desc}<br>⏳ ~${Math.ceil(c.seconds / 60)} phút</p><div class="item-price">🪙 ${c.seed} / hạt</div><button class="btn btn-primary" data-action="buy" data-kind="seed" data-id="${id}">＋ Mua hạt</button></article>`).join('');
  else if (shopTab === 'tool') cards = Object.entries(TOOLS).map(([id, t]) => `<article class="item-card"><div class="item-pic">${t.emoji}</div><h3 class="item-title">${t.name}</h3><p class="item-desc">${t.desc}</p><div class="item-price">🪙 ${t.price}</div><button class="btn btn-primary" data-action="buy" data-kind="tool" data-id="${id}">＋ Mua ngay</button></article>`).join('');
  else cards = Object.entries(CROPS).map(([id, c]) => `<article class="item-card"><div class="item-pic">${c.emoji}</div><h3 class="item-title">${c.name}</h3><p class="item-desc">Đang có: ${state.produce[id] || 0} nông sản<br>Chú Tư mua mỗi sản phẩm</p><div class="item-price">🪙 +${c.sell} / quả</div><button class="btn btn-amber" data-action="sell" data-id="${id}" ${!(state.produce[id] > 0) ? 'disabled' : ''}>Bán 1</button><button style="margin-top:6px;background:#ecf2db;color:#47735b" class="btn" data-action="sell-all" data-id="${id}" ${!(state.produce[id] > 0) ? 'disabled' : ''}>Bán hết</button></article>`).join('');
  return `<div class="section-head"><div><h2>🛍️ Khu chợ nhỏ</h2><p class="muted">Gặp gỡ các NPC tại nông trại</p></div><span class="pill">🪙 ${formatCoins(state.coins)}</span></div>
    <div class="tabs"><button class="${shopTab === 'seed' ? 'active' : ''}" data-action="shop-tab" data-shop="seed">🌱 Hạt giống</button><button class="${shopTab === 'sell' ? 'active' : ''}" data-action="shop-tab" data-shop="sell">🧺 Bán nông sản</button><button class="${shopTab === 'tool' ? 'active' : ''}" data-action="shop-tab" data-shop="tool">🛠️ Công cụ</button></div>
    <div class="npc-banner"><span class="emoji">${p[0]}</span><div><h3>${p[1]}</h3><p>${p[2]}</p></div></div><div class="page-pad"><div class="shop-grid">${cards}</div></div>`;
}
function inventoryMarkup() {
  const hasProduce = Object.values(state.produce).some(x => x > 0);
  return `<div class="section-head"><div><h2>🎒 Nhà kho</h2><p class="muted">Tất cả vật phẩm của bạn</p></div></div><div class="page-pad">
    <h3 class="subhead">🌱 Túi hạt giống</h3><div class="inventory-grid">${Object.entries(CROPS).map(([id,c]) => `<div class="inventory-item"><span class="symbol">${c.emoji}</span><span class="small strong">${c.name}</span><span class="qty">×${state.seeds[id] || 0}</span></div>`).join('')}</div>
    <h3 class="subhead">🧺 Nông sản thu hoạch</h3>${hasProduce ? `<div class="inventory-grid">${Object.entries(CROPS).filter(([id]) => state.produce[id] > 0).map(([id,c]) => `<div class="inventory-item"><span class="symbol">${c.emoji}</span><span class="small strong">${c.name}</span><span class="qty">×${state.produce[id]}</span></div>`).join('')}</div>` : '<div class="empty-state">🌻 Chưa có nông sản. Trồng và thu hoạch cây để lấp đầy kho nhé!</div>'}
    <h3 class="subhead">🛠️ Dụng cụ & vật tư</h3><div class="inventory-grid">${Object.entries(TOOLS).map(([id,t]) => `<div class="inventory-item"><span class="symbol">${t.emoji}</span><span class="small strong">${t.name}</span><span class="qty">×${state.tools[id] || 0}</span></div>`).join('')}</div>
    <div class="notice">💧 Bình tưới còn <b>${state.water}/20</b> nước. Đến giếng trong vườn để lấy thêm nước miễn phí.</div>
    <button class="btn btn-primary btn-block" data-action="nav" data-screen="shop">🛒 Ghé cửa hàng NPC</button></div>`;
}
function optionColors(key, colors, selected) { return colors.map((c,i) => `<button data-action="avatar" data-key="${key}" data-value="${i}" class="color-opt ${selected === i ? 'selected' : ''}" style="background:${c}" aria-label="Chọn màu ${i + 1}"></button>`).join(''); }
function characterMarkup() {
  const a = state.avatar;
  return `<div class="section-head"><div><h2>🧑‍🌾 Nhân vật của tôi</h2><p class="muted">Tự tạo phong cách riêng cho mình</p></div></div>
    <div class="character-card"><h3>${esc(state.name)} · Cấp ${level()}</h3><div class="character-stage">${doll(a,'big')}</div><span class="pill">⭐ ${state.xp} XP · ${140-(state.xp%140)} XP để lên cấp</span></div>
    <div class="page-pad"><h3 class="subhead">🎨 Màu da</h3><div class="option-row">${optionColors('skin',SKINS,a.skin)}</div>
    <h3 class="subhead">💇 Kiểu tóc</h3><div class="option-row">${[['short','Tóc ngắn'],['long','Tóc dài'],['spiky','Tóc nhọn']].map(([v,n])=>`<button class="choice ${a.hairStyle === v ? 'selected' : ''}" data-action="avatar" data-key="hairStyle" data-value="${v}">${n}</button>`).join('')}</div>
    <h3 class="subhead">🌰 Màu tóc</h3><div class="option-row">${optionColors('hair',HAIRS,a.hair)}</div>
    <h3 class="subhead">👕 Màu áo</h3><div class="option-row">${optionColors('shirt',SHIRTS,a.shirt)}</div>
    <h3 class="subhead">👒 Phụ kiện</h3><div class="option-row"><button class="choice ${a.hat ? 'selected' : ''}" data-action="avatar" data-key="hat" data-value="yes">Đội nón rơm 👒</button><button class="choice ${!a.hat ? 'selected' : ''}" data-action="avatar" data-key="hat" data-value="no">Không đội nón</button></div>
    <button class="btn btn-primary btn-block" data-action="avatar-save">💾 Lưu diện mạo</button><div style="height:12px"></div><button class="btn btn-danger btn-block" data-action="logout">🚪 Đăng xuất</button>
    <p class="footnote">Mã PIN và tiến trình chỉ lưu trên trình duyệt hiện tại. Xóa dữ liệu trình duyệt sẽ xóa nông trại. Đây là bản game thử nghiệm, chưa có máy chủ tài khoản.</p></div>`;
}
function questsMarkup() {
  return `<div class="section-head"><div><h2>📜 Nhiệm vụ</h2><p class="muted">Làm việc nhỏ, nhận thưởng lớn!</p></div></div><div class="page-pad">
    ${QUESTS.map(q => { const n = Math.min(q.target,state.stats[q.id] || 0);const done=state.claimed.includes(q.id);return `<div class="quest"><span class="quest-icon">${q.emoji}</span><div class="quest-desc"><h3>${q.name}</h3><p>${q.desc} · ${n}/${q.target}</p><div class="progressbar"><span style="width:${Math.floor(n/q.target*100)}%"></span></div></div><button class="btn ${done ? 'btn-light' : 'btn-amber'}" data-action="quest-claim" data-id="${q.id}" ${done || n < q.target ? 'disabled' : ''}>${done ? '✓ Xong' : `+${q.coins} 🪙`}</button></div>`;}).join('')}
    <div class="notice">⭐ Mỗi lần thu hoạch cây, bạn nhận kinh nghiệm để nâng cấp nhân vật. Các nhiệm vụ hoàn thành được nhận thưởng một lần.</div></div>`;
}
function openTutorial(step = 0) { tutorialStep = step; modal = { type:'tutorial' }; drawModal(); }
function showPlot(index) { if (!state?.plots[index]) return; selectedPlot = index; modal = { type:'plot', index }; drawModal(); }
function closeModal() { modal = null; overlay.classList.add('hidden'); overlay.innerHTML = ''; }
function drawModal() {
  if (!modal) { overlay.classList.add('hidden'); return; }
  overlay.classList.remove('hidden');
  let body = '';
  if (modal.type === 'sound') {
    const a = window.MocMocAudio.snapshot();
    body = `<div class="modal-head"><h2>🎵 Âm thanh nông trại</h2><button class="close" data-action="close" aria-label="Đóng">×</button></div>
      <p class="modal-copy">Giai điệu êm dịu và hiệu ứng nhẹ nhàng, giúp bạn chăm sóc khu vườn thư giãn hơn.</p>
      <div class="sound-panel">
        <button type="button" class="sound-toggle" data-action="sound-music" aria-pressed="${a.music}"><span class="sound-toggle-icon">🎶</span><span class="sound-toggle-text"><b>Nhạc nền</b><small>Giai điệu Mộc Mộc Farm · phát lặp lại</small></span><span class="sound-switch ${a.music ? 'on' : ''}">${a.music ? 'Bật' : 'Tắt'}</span></button>
        <button type="button" class="sound-toggle" data-action="sound-effects" aria-pressed="${a.effects}"><span class="sound-toggle-icon">🔔</span><span class="sound-toggle-text"><b>Hiệu ứng</b><small>Gieo hạt, tưới cây, thu hoạch, mua bán</small></span><span class="sound-switch ${a.effects ? 'on' : ''}">${a.effects ? 'Bật' : 'Tắt'}</span></button>
        <label class="sound-volume-label" for="music-volume">🔊 Âm lượng chung <b id="music-volume-label">${a.volume}%</b></label>
        <input class="sound-volume" id="music-volume" type="range" min="0" max="100" step="5" value="${a.volume}" data-action="sound-volume" aria-label="Âm lượng từ 0 đến 100 phần trăm">
        <div class="sound-volume-ends"><span>Nhỏ nhẹ</span><span>To hơn</span></div>
        <button type="button" class="btn btn-light btn-block" data-action="sound-preview">🔔 Nghe thử hiệu ứng</button>
      </div>
      <p class="small muted" style="text-align:center;margin-top:12px">Trên iPhone, nhạc bắt đầu sau thao tác đầu tiên của bạn. Cài đặt được ghi nhớ cho lần chơi sau.</p>`;
  } else if (modal.type === 'tutorial') {
    const slides = [
      ['🌈','Chào mừng tới Mộc Mộc Farm!','Chào mừng đến Mộc Mộc Valley! Đi lại bằng WASD hoặc phím mũi tên trên laptop, dùng các nút ▲ ◀ ▼ ▶ trên điện thoại. Chạm vào bản đồ để nhân vật đi đến đó.'],
      ['🌱','Bắt đầu trồng cây','Chọn hạt ở thanh dưới màn hình rồi chạm vào ô đất trên bản đồ pixel để gieo. Chạm cây đã chín để thu hoạch ngay trong một lần chạm!'],
      ['💧','Tưới nước & bón phân','Chạm vào cây đang lớn để tưới nước hoặc bón phân. Cây sẽ lớn nhanh hơn; phân hữu cơ còn tăng sản lượng thu hoạch.'],
      ['🐛','Bảo vệ khu vườn','Sâu, chim và thỏ có thể ghé thăm! Mua đúng công cụ từ Bác Nâu để đuổi chúng. Giếng nước cho bạn lấy thêm nước miễn phí.'],
      ['🧺','Thu hoạch, bán và làm nhiệm vụ','Khi cây chín, chạm ô đất để thu hoạch. Đến Chú Tư bán nông sản, mua thêm hạt từ Cô Mây và hoàn thành nhiệm vụ để nhận xu.']
    ];
    const [emoji, title, content] = slides[tutorialStep];
    body = `<div class="modal-head"><h2>Hướng dẫn tân thủ</h2><button class="close" data-action="tutorial-skip" title="Bỏ qua">×</button></div>
      <div class="tutorial-art">${emoji}</div><h2 style="text-align:center;color:#3c7a57;margin:8px 0">${title}</h2><p class="modal-copy" style="text-align:center">${content}</p>
      <div class="tutorial-steps">${slides.map((_, i) => `<i class="${i === tutorialStep ? 'active' : ''}"></i>`).join('')}</div>
      <button class="btn btn-primary btn-block" data-action="tutorial-next">${tutorialStep === slides.length - 1 ? '🎉 Bắt đầu làm nông!' : 'Tiếp tục →'}</button><button class="btn btn-light btn-block" data-action="tutorial-skip">Bỏ qua hướng dẫn</button>`;
  } else if (modal.type === 'plot') {
    const index = modal.index; const p = state.plots[index];
    if (p) {
      const crop = CROPS[p.crop] || CROPS.carrot;
      const done = getProgress(p) >= 1;
      const dead = p.hp <= 0;
      const pest = p.pest ? PESTS[p.pest] : null;
      body = `<div class="modal-head"><h2>${crop.emoji} ${crop.name} · Ô ${index+1}</h2><button class="close" data-action="close">×</button></div>
      <div class="detail-hero"><div class="detail-emoji">${dead ? '🥀' : done ? crop.emoji : getProgress(p) > .4 ? '🌿' : '🌱'}</div><b>${dead ? 'Cây đã héo' : done ? '✨ Sẵn sàng thu hoạch!' : '🌿 Đang phát triển'}</b></div>
      <div class="detail-grid"><div class="detail-chip">Thời gian còn lại<b>${dead ? 'Đã héo' : durationText(remaining(p))}</b></div><div class="detail-chip">Sức khỏe<b>${p.hp ?? 100}/100 ❤️</b></div><div class="detail-chip">Đã tưới gần đây<b>${p.lastWater ? 'Rồi 💧' : 'Chưa'}</b></div><div class="detail-chip">Phân hữu cơ<b>${p.fertilized ? 'Đã bón ✅' : 'Chưa bón'}</b></div></div>
      ${pest && !dead ? `<p class="notice" style="margin:4px 0 12px;background:#fff0dd">⚠️ ${pest.emoji} ${pest.name} đang phá cây! Dùng ${pest.toolName} để đuổi.</p>` : ''}
      ${dead ? `<button class="btn btn-amber btn-block" data-action="clear" data-index="${index}">🧹 Dọn luống cây héo</button>` : done ? `<button class="btn btn-primary btn-block" data-action="harvest" data-index="${index}">🧺 Thu hoạch ${p.fertilized ? '2' : '1'} ${crop.name}</button>` :
      `<div class="modal-actions"><button class="btn btn-primary" data-action="water" data-index="${index}">💧 Tưới (${state.water})</button><button class="btn btn-amber" data-action="fertilize" data-index="${index}" ${p.fertilized ? 'disabled' : ''}>🧺 Bón phân (${state.tools.fertilizer})</button></div>`}
      ${pest && !dead ? `<div class="modal-actions" style="margin-top:10px"><button class="btn btn-danger" data-action="defend" data-index="${index}">🛡️ Đuổi bằng công cụ (${state.tools[pest.tool] || 0})</button><button class="btn btn-light" data-action="shoo" data-index="${index}">👏 Xua tay</button></div>` : ''}
      ${!dead ? `<p class="small muted" style="text-align:center;margin-top:12px">Cây tiếp tục lớn theo giờ thực tế, kể cả khi bạn thoát game.</p>` : ''}`;
    }
  }
  overlay.innerHTML = `<section role="dialog" aria-modal="true" class="modal">${body}</section>`;
}
function navigate(to) { if (!['farm','shop','inventory','character','quests'].includes(to)) return; screen = to; navMenuOpen = false; closeModal(); const content = $('game-content'); if (content) content.scrollTop = 0; render(); }
function plant(index, id) {
  if (!CROPS[id] || !Number.isInteger(index) || index < 0 || index >= state.plots.length || state.plots[index]) { toast('Không thể gieo ở ô đất này.'); return; }
  if (!(state.seeds[id] > 0)) { toast(`🌰 Đã hết hạt ${CROPS[id].name}! Chọn hạt khác ở thanh dưới hoặc mua thêm từ Cô Mây.`); return; }
  state.seeds[id]--;
  state.plots[index] = { crop: id, plantedAt: Date.now(), duration: durationFor(id), bonus: 0, hp: 100, fertilized: false, lastWater: 0, pest: null, lastDamage: 0 };
  state.stats.plant++;
  save(); closeModal(); render(); window.MocMocAudio.effect('plant'); toast(`🌱 Đã trồng ${CROPS[id].name}!`);
}
function waterPlant(index) {
  const p = state.plots[index];
  if (!p || p.hp <= 0 || getProgress(p) >= 1) return;
  if (state.water <= 0) { toast('💧 Hết nước! Hãy lấy nước ở giếng trong vườn.'); return; }
  if (Date.now() - (p.lastWater || 0) < 20000) { toast('⏳ Cây vừa được tưới. Hãy đợi khoảng 20 giây.'); return; }
  state.water--;
  p.bonus += 19; p.lastWater = Date.now(); p.hp = Math.min(100, p.hp + 10);
  state.stats.water++; save(); render(); showPlot(index); window.MocMocAudio.effect('water'); toast('💧 Cây được tưới nước và lớn nhanh hơn!');
}
function fertilizePlant(index) {
  const p = state.plots[index];
  if (!p || p.hp <= 0 || getProgress(p) >= 1) return;
  if (p.fertilized) { toast('Cây này đã được bón phân.'); return; }
  if (state.tools.fertilizer <= 0) { toast('🧺 Hết phân bón! Mua thêm từ Bác Nâu.'); return; }
  state.tools.fertilizer--; p.fertilized = true; p.bonus += 27; p.hp = Math.min(100, p.hp+8);
  save(); render(); showPlot(index); window.MocMocAudio.effect('fertilizer'); toast('🌿 Cây được bón phân, thu hoạch sẽ được x2!');
}
function harvestPlant(index) {
  const p = state.plots[index];
  if (!p || p.hp <= 0 || getProgress(p) < 1) { toast('Cây chưa sẵn sàng thu hoạch.'); return; }
  const c = CROPS[p.crop];
  const amount = p.fertilized ? 2 : 1;
  state.produce[p.crop] += amount; state.xp += c.xp; state.stats.harvest++;
  state.plots[index] = null; save(); closeModal(); render(); window.MocMocAudio.effect('harvest'); toast(`🧺 Thu hoạch ${amount} ${c.name}! +${c.xp} XP`);
}
function chasePest(index, free) {
  const p = state.plots[index];
  if (!p || !p.pest || p.hp <= 0) return;
  const pest = PESTS[p.pest];
  if (free) {
    if (Math.random() < .6) { p.pest = null; state.stats.chase++; toast('👏 Bạn xua đuổi con vật thành công!'); }
    else { p.hp = Math.max(0,p.hp - 12); toast('😮 Nó vẫn ở lại, cây bị giảm 12 sức khỏe!'); }
  } else {
    if (!(state.tools[pest.tool] > 0)) { toast(`Thiếu ${pest.toolName}. Hãy đến Bác Nâu!`); return; }
    state.tools[pest.tool]--; p.pest = null; state.stats.chase++; toast(`🛡️ Đã đuổi ${pest.name}!`);
  }
  save(); render(); showPlot(index); window.MocMocAudio.effect('pest');
}
function buy(kind, id) {
  const item = kind === 'seed' ? CROPS[id] : TOOLS[id];
  const price = kind === 'seed' ? item?.seed : item?.price;
  if (!item) return;
  if (state.coins < price) { toast('🪙 Không đủ xu! Thu hoạch và bán nông sản để kiếm thêm.'); return; }
  state.coins -= price;
  if (kind === 'seed') state.seeds[id] = (state.seeds[id] || 0) + 1;
  else state.tools[id] = (state.tools[id] || 0) + 1;
  save(); render(); window.MocMocAudio.effect('coins'); toast(`🛍️ Đã mua ${item.name} với ${price} xu!`);
}
function sellProduce(id, all) {
  const crop = CROPS[id]; if (!crop) return;
  const owned = state.produce[id] || 0;
  if (!owned) { toast('Bạn chưa có nông sản để bán.'); return; }
  const amount = all ? owned : 1;
  state.produce[id] -= amount; state.coins += crop.sell * amount; state.stats.sell += amount;
  save(); render(); window.MocMocAudio.effect('sell'); toast(`🪙 Chú Tư đã mua ${amount} ${crop.name}: +${formatCoins(crop.sell*amount)} xu!`);
}
function fetchWater() {
  const now=Date.now();
  if (now - (state.lastWell || 0) < 12000) { toast('⏳ Giếng đang hồi nước. Thử lại sau 12 giây!'); return; }
  if (state.water >= 20) { toast('💧 Bình nước đã đầy (20/20)!'); return; }
  state.water = Math.min(20, state.water + 6); state.lastWell = now; save(); render(); window.MocMocAudio.effect('water'); toast('🪣 Lấy nước thành công! +6 💧');
}
function claimQuest(id) {
  const q = QUESTS.find(v => v.id === id); if (!q || state.claimed.includes(id) || state.stats[id] < q.target) return;
  state.claimed.push(id); state.coins += q.coins; save(); render(); window.MocMocAudio.effect('quest'); toast(`🎉 Hoàn thành ${q.name}! +${q.coins} xu`);
}
function customize(key, value) {
  if (!['skin','hair','shirt','hairStyle','hat'].includes(key)) return;
  if (key === 'hat') state.avatar.hat = value === 'yes';
  else if (key === 'hairStyle') { if (['short','long','spiky'].includes(value)) state.avatar.hairStyle = value; }
  else { const arr = key === 'skin' ? SKINS : key === 'hair' ? HAIRS : SHIRTS; const n = Number(value); if (Number.isInteger(n) && n >= 0 && n < arr.length) state.avatar[key] = n; }
  save(); render(); window.MocMocAudio.effect('avatar');
}
function finishTutorial() {
  if (!state.tutorialDone) { state.tutorialDone = true; state.coins += 50; save(); window.MocMocAudio.effect('quest'); toast('🎁 Hoàn thành hướng dẫn! Tặng bạn 50 xu.'); }
  closeModal(); render();
}
function onAction(btn) {
  const action = btn.dataset.action;
  const idx = Number(btn.dataset.index);
  const id = btn.dataset.id;
  if (action === 'auth-tab') { accountMode = btn.dataset.mode === 'login' ? 'login' : 'register'; loginScreen(); }
  else if (action === 'social-login') { window.MocMocSocial?.signIn(btn.dataset.provider); }
  else if (!state) return;
  else if (action === 'close') closeModal();
  else if (action === 'open-sound') { navMenuOpen = false; modal = { type:'sound' }; render(); }
  else if (action === 'sound-music') { const audio = window.MocMocAudio; audio.setMusic(!audio.snapshot().music); render(); }
  else if (action === 'sound-effects') { const audio = window.MocMocAudio; audio.setEffects(!audio.snapshot().effects); render(); }
  else if (action === 'sound-preview') window.MocMocAudio.effect('harvest');
  else if (action === 'tutorial') openTutorial(0);
  else if (action === 'tutorial-next') { if (tutorialStep < 4) openTutorial(tutorialStep + 1); else finishTutorial(); }
  else if (action === 'tutorial-skip') { state.tutorialDone = true; save(); closeModal(); }
  else if (action === 'nav') navigate(btn.dataset.screen);
  else if (action === 'open-shop') { shopTab = btn.dataset.shop; navigate('shop'); }
  else if (action === 'shop-tab') { shopTab = btn.dataset.shop; render(); }
  else if (action === 'select-seed') selectSeed(id);
  else if (action === 'toggle-seeds') {
    seedDockOpen = !seedDockOpen;
    const dock = $('seed-dock');
    dock?.classList.toggle('collapsed', !seedDockOpen);
    dock?.querySelectorAll('[data-action="toggle-seeds"]').forEach(button => button.setAttribute('aria-expanded', String(seedDockOpen)));
    window.MocMocAudio?.effect('tap');
  }
  else if (action === 'toggle-profile-menu') setProfileMenuOpen(!navMenuOpen);
  else if (action === 'plot') {
    const plot = state.plots[idx];
    if (!plot) plant(idx, CROPS[state.selectedSeed] ? state.selectedSeed : 'carrot');
    else if (plot.hp > 0 && getProgress(plot) >= 1) harvestPlant(idx);
    else showPlot(idx);
  }
  else if (action === 'plant') plant(idx,id);
  else if (action === 'water') waterPlant(idx);
  else if (action === 'fertilize') fertilizePlant(idx);
  else if (action === 'harvest') harvestPlant(idx);
  else if (action === 'clear') { if (state.plots[idx]?.hp <= 0) { state.plots[idx] = null; save(); closeModal(); render(); window.MocMocAudio.effect('plant'); toast('🧹 Đã dọn sạch ô đất.'); } }
  else if (action === 'defend') chasePest(idx,false);
  else if (action === 'shoo') chasePest(idx,true);
  else if (action === 'well') fetchWater();
  else if (action === 'nearby') window.MocMocPixel?.nearby();
  else if (action === 'buy') buy(btn.dataset.kind,id);
  else if (action === 'sell') sellProduce(id,false);
  else if (action === 'sell-all') sellProduce(id,true);
  else if (action === 'quest-claim') claimQuest(id);
  else if (action === 'avatar') customize(btn.dataset.key,btn.dataset.value);
  else if (action === 'avatar-save') toast('💾 Diện mạo đã được lưu tự động!');
  else if (action === 'logout') {
    const wasSocial = String(activeUser || '').startsWith('oauth:');
    closeModal(); setLocal(KEY_ACTIVE, ''); activeUser = null; state = null;
    accountMode = 'login'; loginScreen();
    if (wasSocial) window.MocMocSocial?.signOut();
    toast('Bạn đã đăng xuất. Nông trại vẫn được lưu trên thiết bị.');
  }
}
// Một số trình duyệt yêu cầu gesture trực tiếp để phát âm thanh lần đầu.
document.addEventListener('pointerdown', () => window.MocMocAudio.unlock(), { passive: true });
document.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') window.MocMocAudio.unlock(); });
document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  // Chạm là hành động người chơi: mở quyền phát nhạc trên Safari iOS.
  window.MocMocAudio.unlock();
  // Nhấn ra ngoài ảnh đại diện/menu thì tự đóng, không làm gián đoạn thao tác chơi.
  if (navMenuOpen && !event.target.closest('.profile-area')) setProfileMenuOpen(false);
  if (target && !target.disabled) {
    if (['auth-tab','close','tutorial','tutorial-next','tutorial-skip','nav','open-shop','shop-tab','toggle-profile-menu','open-sound','sound-music','sound-effects','select-seed'].includes(target.dataset.action)) {
      window.MocMocAudio.effect(target.dataset.action === 'select-seed' ? 'seed' : 'tap');
    }
    onAction(target);
  }
  else if (event.target === overlay && modal?.type !== 'tutorial') closeModal();
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && navMenuOpen) { setProfileMenuOpen(false); $('profile-menu-trigger')?.focus(); } });
document.addEventListener('submit', (event) => { if (event.target.id === 'auth-form') { window.MocMocAudio.unlock(); submitAuth(event); } });
document.addEventListener('input', (event) => {
  if (event.target.matches('[data-action="sound-volume"]')) {
    window.MocMocAudio.setVolume(event.target.value);
    const label = $('music-volume-label');
    if (label) label.textContent = `${window.MocMocAudio.snapshot().volume}%`;
  }
});

document.addEventListener('visibilitychange', () => { if (!document.hidden && state) { processWorld(); render(); } });
setInterval(() => {
  if (!state || document.hidden) return;
  processWorld();
  const now = Date.now();
  const si = seasonInfo();
  const label = timeLabel(si);
  if (label !== lastClockLabel) { lastClockLabel = label; const clock = $('clock-label'); if (clock) clock.textContent = ` · ${label}`; const compact = $('clock-compact'); if (compact) compact.textContent = `${String(si.hour).padStart(2,'0')}:${String(si.minute).padStart(2,'0')}`; }
  if (now > nextRefresh && screen === 'farm') {
    nextRefresh = now + 3000;
    // Canvas tự vẽ lại mỗi khung hình, tránh thay canvas làm ngắt điều khiển nhân vật.
    if (!document.getElementById('pixel-world')) window.MocMocPixel?.mount();
    if (modal?.type === 'plot' && state.plots[modal.index]) drawModal();
  }
}, 1000);
// Kiểm tra phiên bản mới trên cùng địa chỉ GitHub Pages và giữ tiến trình trong localStorage.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  let refreshingForUpdate = false;
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshingForUpdate) return;
      refreshingForUpdate = true;
      window.location.reload();
    });
  }
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
      const check = () => { if (navigator.onLine) registration.update().catch(() => {}); };
      check();
      window.addEventListener('pageshow', check);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
      window.addEventListener('online', check);
    } catch (_) { /* Vẫn chơi online được nếu trình duyệt không hỗ trợ worker. */ }
  });
}
restore();
window.MocMocSocial?.boot();
