(() => {
  'use strict';

  const MEET_URL = 'https://meet.google.com/bmd-ixmc-mkv';
  const PHOTO_COUNT = 7;          // assets/img/photos/photo-1..7.jpg
  const BAKU_OFFSET_H = 4;        // Bakı: UTC+4, без перехода на летнее время
  const START_HOUR = 10;
  const LIVE_MINUTES = 120;       // сколько длится служение (для статуса «идёт сейчас»)
  const EARLY_MINUTES = 15;       // за сколько минут показывать «скоро начнётся»

  // ---------- случайная картинка в hero ----------
  const photo = document.getElementById('hero-photo');
  if (photo) {
    const n = 1 + Math.floor(Math.random() * PHOTO_COUNT);
    photo.src = `assets/img/photos/photo-${n}.jpg`;
  }

  // ---------- статус: следующее служение / идёт сейчас ----------
  const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  const status = document.getElementById('status');
  const statusText = document.getElementById('status-text');

  function bakuNow() {
    // «Бакинские» часы как UTC-поля объекта Date
    return new Date(Date.now() + BAKU_OFFSET_H * 3600e3);
  }

  function plural(n, word) { return `${n} ${word}`; } // в азербайджанском множественное число после цифры не меняется

  function updateStatus() {
    if (!status) return;
    const now = bakuNow();
    const day = now.getUTCDay(); // 6 = şənbə
    const minutesToday = now.getUTCHours() * 60 + now.getUTCMinutes();
    const start = START_HOUR * 60;

    let live = false;
    let text;

    if (day === 6 && minutesToday >= start && minutesToday < start + LIVE_MINUTES) {
      live = true;
      text = 'İbadət indi davam edir — qoşulun!';
    } else if (day === 6 && minutesToday >= start - EARLY_MINUTES && minutesToday < start) {
      live = true;
      text = `İbadət ${start - minutesToday} dəqiqəyə başlayır`;
    } else {
      let daysAhead = (6 - day + 7) % 7;
      if (daysAhead === 0 && minutesToday >= start) daysAhead = 7;
      const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysAhead, START_HOUR));
      const diffMin = Math.max(0, Math.round((next - now) / 60000));
      const d = Math.floor(diffMin / 1440);
      const h = Math.floor((diffMin % 1440) / 60);
      const m = diffMin % 60;
      const left = d > 0 ? `${plural(d, 'gün')} ${plural(h, 'saat')}` : h > 0 ? `${plural(h, 'saat')} ${plural(m, 'dəq.')}` : plural(m, 'dəq.');
      text = `Növbəti ibadət: şənbə, ${next.getUTCDate()} ${MONTHS[next.getUTCMonth()]}, 10:00 · ${left} qalıb`;
    }

    status.classList.toggle('is-live', live);
    statusText.textContent = text;
  }
  updateStatus();
  setInterval(updateStatus, 30000);

  // ---------- toast ----------
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-shown'), 2600);
  }

  // ---------- поделиться ----------
  const shareBtn = document.getElementById('share-btn');
  const pageUrl = location.href.split('#')[0];
  const shareText = 'Hər şənbə saat 10:00-da onlayn ibadətə dəvət edirik! Qoşulmaq üçün linkə toxunun:';

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  }

  shareBtn?.addEventListener('click', async () => {
    // Делимся адресом этой страницы (у неё красивое превью); если страница открыта как файл — ссылкой на Meet.
    const url = /^https?:/.test(pageUrl) ? pageUrl : MEET_URL;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Onlayn Şənbə İbadəti', text: shareText, url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    const ok = await copy(`${shareText} ${url}`);
    showToast(ok ? 'Dəvət linki kopyalandı ✓' : 'Kopyalamaq alınmadı');
  });

  // ---------- липкая кнопка на мобильных ----------
  const sticky = document.getElementById('sticky-cta');
  const joinBtn = document.getElementById('join-btn');
  if (sticky && joinBtn && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      sticky.classList.toggle('is-visible', !entry.isIntersecting);
    }).observe(joinBtn);
  }
})();
