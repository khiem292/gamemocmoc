/* Firebase social login (Google/Facebook), user-initiated only.
   Requires firebase-config.js with a real Firebase Web App configuration.
   Personal farm progress stays in localStorage until server sync is implemented. */
(function () {
  'use strict';
  let cached = null;
  let pending = null;
  let unsub = null;
  let attemptedBoot = false;

  function configured() {
    const c = window.MOCMOC_FIREBASE_CONFIG || {};
    return ['apiKey','authDomain','projectId','appId'].every(k => typeof c[k] === 'string' && c[k].trim().length > 0);
  }
  function report(message) {
    const node = document.getElementById('social-login-status');
    if (node) node.textContent = message;
  }
  function humanError(e) {
    const code = e?.code || '';
    const messages = {
      'auth/unauthorized-domain': 'Tên miền website chưa được thêm trong Firebase Authentication → Authorized domains.',
      'auth/operation-not-allowed': 'Bạn chưa bật Google hoặc Facebook trong Firebase Authentication.',
      'auth/popup-blocked': 'Trình duyệt chặn cửa sổ đăng nhập. Hãy mở game bằng Safari/Chrome, không dùng bản HTML tải về.',
      'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập.',
      'auth/cancelled-popup-request': 'Yêu cầu đăng nhập khác đã được mở.',
      'auth/account-exists-with-different-credential': 'Email này đang dùng một phương thức đăng nhập khác. Hãy đăng nhập bằng phương thức đó.',
      'auth/network-request-failed': 'Không kết nối được tới dịch vụ đăng nhập. Hãy kiểm tra Internet.',
      'auth/invalid-api-key': 'Cấu hình apiKey Firebase chưa hợp lệ.',
      'auth/internal-error': 'Có lỗi kết nối xác thực. Kiểm tra cấu hình Firebase và thử lại.'
    };
    return messages[code] || 'Không thể đăng nhập mạng xã hội. Kiểm tra Firebase, Facebook Login và thử lại.';
  }
  async function sdk() {
    if (!configured()) throw new Error('not-configured');
    if (location.protocol === 'file:') throw new Error('file-protocol');
    if (!pending) {
      pending = Promise.all([
        import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js')
      ]).then(async ([apps, authSdk]) => {
        const config = window.MOCMOC_FIREBASE_CONFIG;
        const app = apps.getApps().length ? apps.getApp() : apps.initializeApp(config);
        const auth = authSdk.getAuth(app);
        auth.languageCode = 'vi';
        await authSdk.setPersistence(auth, authSdk.browserLocalPersistence);
        return cached = { auth, authSdk };
      }).catch(err => { pending = null; throw err; });
    }
    return pending;
  }
  async function signIn(providerName) {
    if (providerName !== 'google' && providerName !== 'facebook') return;
    if (!configured()) {
      report('⚠️ Chưa cấu hình Firebase. Mở firebase-config.js và làm theo README để kích hoạt đăng nhập thật.');
      return;
    }
    if (location.protocol === 'file:') {
      report('⚠️ Hãy chạy website qua HTTPS/GitHub Pages. Đăng nhập mạng xã hội không dùng được trong file HTML mở trực tiếp.');
      return;
    }
    const buttons = [...document.querySelectorAll('[data-action="social-login"]')];
    buttons.forEach(b => { b.disabled = true; });
    report('⏳ Đang kết nối dịch vụ đăng nhập...');
    try {
      const { auth, authSdk } = await sdk();
      const provider = providerName === 'google' ? new authSdk.GoogleAuthProvider() : new authSdk.FacebookAuthProvider();
      // Popup works on most desktop browsers. For iPhone PWA test using Safari first.
      const result = await authSdk.signInWithPopup(auth, provider);
      window.MocMocEnterSocial?.(result.user);
    } catch (e) {
      report('⚠️ ' + humanError(e));
    } finally {
      buttons.forEach(b => { if (b.isConnected) b.disabled = false; });
    }
  }
  function boot() {
    if (attemptedBoot || !configured() || location.protocol === 'file:') return;
    attemptedBoot = true;
    // Restore authenticated Firebase users only if prior active game account was OAuth,
    // to avoid silently replacing a previously selected PIN account.
    sdk().then(({ auth, authSdk }) => {
      unsub = authSdk.onAuthStateChanged(auth, user => {
        const active = localStorage.getItem('mocmoc.active.v1') || '';
        if (!active.startsWith('oauth:')) return;
        if (user && active === `oauth:${user.uid}`) window.MocMocEnterSocial?.(user);
        else window.MocMocSocialSessionGone?.();
      }, err => report('⚠️ ' + humanError(err)));
    }).catch(err => report('⚠️ ' + humanError(err)));
  }
  async function signOut() {
    try { const ctx = cached || await sdk(); await ctx.authSdk.signOut(ctx.auth); }
    catch (err) { report('⚠️ ' + humanError(err)); }
  }
  window.MocMocSocial = { configured, boot, signIn, signOut };
})();
