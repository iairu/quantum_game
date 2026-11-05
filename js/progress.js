'use strict';
// 🏅 Progres a herný pocit: skúsenosti (XP), hodnosti, úspechy, denná výzva so sériou dní,
// opakovanie naprieč levelmi a prehľad „Cesta“. Všetko sa ukladá do Game.progress, takže
// staré uložené hry fungujú ďalej — chýbajúce polia sa doplnia a XP sa dopočíta z hviezdičiek.
//
// Nič tu nezasahuje do fyziky levelov: iba počúva hotové udalosti (odpoveď, level, Kódex,
// hlbšie vysvetlenie) a pridáva odmeny, prehľady a oslavy.

const RANK_TIERS = [
  { xp: 0, icon: '🌱', name: tr('Nováčik', 'Novice', 'Новачок') },
  { xp: 100, icon: '🔭', name: tr('Pozorovateľ', 'Observer', 'Спостерігач') },
  { xp: 280, icon: '🧭', name: tr('Vykladač', 'Interpreter', 'Тлумач') },
  { xp: 560, icon: '⚛', name: tr('Adept', 'Adept', 'Адепт') },
  { xp: 1000, icon: '🌀', name: tr('Majster', 'Master', 'Майстер') },
  { xp: 1600, icon: '✨', name: tr('Kvantový mág', 'Quantum Mage', 'Квантовий маг') },
  { xp: 2600, icon: '👑', name: tr('Architekt', 'Architect', 'Архітектор') },
];

// test() rozhoduje o odomknutí; prog() je len displej [hotovo, cieľ]
const ACHIEVEMENTS = [
  { id: 'first_correct', icon: '✅', xp: 20,
    name: tr('Prvá iskra', 'First spark', 'Перша іскра'),
    desc: tr('Odpovedz správne na prvú otázku.', 'Answer your first question correctly.', 'Дай правильну відповідь на перше питання.'),
    test: (P) => Object.values(P.stats || {}).some((s) => s.ok > 0) },
  { id: 'correct_10', icon: '🎯', xp: 25,
    name: tr('Desať zásahov', 'Ten hits', 'Десять влучень'),
    desc: tr('Desať správnych odpovedí.', 'Ten correct answers.', 'Десять правильних відповідей.'),
    test: (P) => (P.counters.correct || 0) >= 10, prog: (P) => [P.counters.correct || 0, 10] },
  { id: 'correct_50', icon: '🏹', xp: 60,
    name: tr('Päťdesiat zásahov', 'Fifty hits', 'П’ятдесят влучень'),
    desc: tr('Päťdesiat správnych odpovedí.', 'Fifty correct answers.', 'П’ятдесят правильних відповідей.'),
    test: (P) => (P.counters.correct || 0) >= 50, prog: (P) => [P.counters.correct || 0, 50] },
  { id: 'first_level', icon: '🚪', xp: 30,
    name: tr('Prvý portál', 'First portal', 'Перший портал'),
    desc: tr('Dokonči svoj prvý level.', 'Complete your first level.', 'Заверши свій перший рівень.'),
    test: (P) => Object.keys(P.stars || {}).length > 0 },
  { id: 'five_levels', icon: '🧱', xp: 80,
    name: tr('Päť brán', 'Five gates', 'П’ять брам'),
    desc: tr('Dokonči päť levelov.', 'Complete five levels.', 'Заверши п’ять рівнів.'),
    test: (P) => Object.keys(P.stars || {}).length >= 5, prog: (P) => [Object.keys(P.stars || {}).length, 5] },
  { id: 'three_star', icon: '🌟', xp: 50,
    name: tr('Bez zaváhania', 'Without a stumble', 'Без вагань'),
    desc: tr('Získaj aspoň jeden level na ★★★.', 'Earn ★★★ on at least one level.', 'Отримай ★★★ хоча б на одному рівні.'),
    test: (P) => Object.values(P.stars || {}).some((s) => s >= 3) },
  { id: 'half_stars', icon: '✨', xp: 70,
    name: tr('Zbierka hviezd', 'Star collector', 'Колекціонер зірок'),
    desc: tr('Nazbieraj 15 hviezdičiek.', 'Collect 15 stars.', 'Збери 15 зірок.'),
    test: (P) => Progress.totalStars() >= 15, prog: () => [Progress.totalStars(), 15] },
  { id: 'all_levels', icon: '🏝', xp: 200,
    name: tr('Celý ostrov', 'The whole island', 'Увесь острів'),
    desc: tr('Dokonči všetky hlavné levely.', 'Complete all main levels.', 'Заверши всі основні рівні.'),
    test: (P) => Progress.mainLevels().every((L) => P.stars[L.num] !== undefined), prog: (P) => [Progress.mainLevels().filter((L) => P.stars?.[L.num] !== undefined).length, Progress.mainLevels().length] },
  { id: 'codex_10', icon: '📖', xp: 20,
    name: tr('Prvé stránky', 'First pages', 'Перші сторінки'),
    desc: tr('Odomkni 10 kariet Kódexu.', 'Unlock 10 Codex cards.', 'Відкрий 10 карток Кодексу.'),
    test: (P) => P.codex.size >= 10, prog: (P) => [P.codex.size, 10] },
  { id: 'codex_25', icon: '📚', xp: 50,
    name: tr('Čitateľ Kódexu', 'Codex reader', 'Читач Кодексу'),
    desc: tr('Odomkni 25 kariet Kódexu.', 'Unlock 25 Codex cards.', 'Відкрий 25 карток Кодексу.'),
    test: (P) => P.codex.size >= 25, prog: (P) => [P.codex.size, 25] },
  { id: 'codex_all', icon: '🗂', xp: 150,
    name: tr('Celý Kódex', 'The whole Codex', 'Увесь Кодекс'),
    desc: tr('Odomkni všetky karty Kódexu.', 'Unlock every Codex card.', 'Відкрий усі картки Кодексу.'),
    test: (P) => P.codex.size >= CODEX.length, prog: (P) => [P.codex.size, CODEX.length] },
  { id: 'deep_5', icon: '🔎', xp: 25,
    name: tr('Hlbší pohľad', 'A deeper look', 'Глибший погляд'),
    desc: tr('Otvor 5 hlbších vysvetlení.', 'Open 5 deep dives.', 'Відкрий 5 глибших пояснень.'),
    test: (P) => Progress.deepCount() >= 5, prog: () => [Progress.deepCount(), 5] },
  { id: 'deep_15', icon: '🔬', xp: 70,
    name: tr('Pod povrch', 'Beneath the surface', 'Під поверхнею'),
    desc: tr('Otvor 15 hlbších vysvetlení.', 'Open 15 deep dives.', 'Відкрий 15 глибших пояснень.'),
    test: (P) => Progress.deepCount() >= 15, prog: () => [Progress.deepCount(), 15] },
  { id: 'review_10', icon: '↻', xp: 40,
    name: tr('Opakovanie sa vypláca', 'Review pays off', 'Повторення окупається'),
    desc: tr('Správne odpovedz na 10 otázok v opakovaní.', 'Answer 10 review questions correctly.', 'Правильно відповідай на 10 питань у повторенні.'),
    test: (P) => (P.counters.reviewOk || 0) >= 10, prog: (P) => [P.counters.reviewOk || 0, 10] },
  { id: 'streak_3', icon: '🔥', xp: 50,
    name: tr('Tri dni v rade', 'Three days in a row', 'Три дні поспіль'),
    desc: tr('Dokonči dennú výzvu tri dni po sebe.', 'Complete the daily challenge three days in a row.', 'Заверши денний виклик три дні поспіль.'),
    test: (P) => (P.counters.bestStreak || 0) >= 3, prog: (P) => [P.counters.bestStreak || 0, 3] },
  { id: 'streak_7', icon: '🌋', xp: 120,
    name: tr('Týždeň s kvantami', 'A week of quanta', 'Тиждень із квантами'),
    desc: tr('Dokonči dennú výzvu sedem dní po sebe.', 'Complete the daily challenge seven days in a row.', 'Заверши денний виклик сім днів поспіль.'),
    test: (P) => (P.counters.bestStreak || 0) >= 7, prog: (P) => [P.counters.bestStreak || 0, 7] },
  { id: 'daily_1', icon: '🗓', xp: 30,
    name: tr('Dnešná dávka', 'Today’s dose', 'Сьогоднішня доза'),
    desc: tr('Dokonči prvú dennú výzvu.', 'Complete your first daily challenge.', 'Заверши перший денний виклик.'),
    test: (P) => (P.counters.daily || 0) >= 1 },
  { id: 'daily_5', icon: '📅', xp: 80,
    name: tr('Päť dávok', 'Five doses', 'П’ять доз'),
    desc: tr('Dokonči päť denných výziev.', 'Complete five daily challenges.', 'Заверши п’ять денних викликів.'),
    test: (P) => (P.counters.daily || 0) >= 5, prog: (P) => [P.counters.daily || 0, 5] },
  { id: 'master_5', icon: '🎓', xp: 60,
    name: tr('Päť cieľov', 'Five goals', 'П’ять цілей'),
    desc: tr('Zvládni všetky ciele v piatich leveloch.', 'Master every goal in five levels.', 'Опануй усі цілі в п’яти рівнях.'),
    test: () => Progress.masteredLevels() >= 5, prog: () => [Progress.masteredLevels(), 5] },
  { id: 'dragon', icon: '🐉', xp: 200,
    name: tr('Krotiteľ Ketvarra', 'Ketvarr tamer', 'Приборкувач Кетварра'),
    desc: tr('Poraz draka Ketvarra na Dračom štíte.', 'Defeat Ketvarr on Dragon’s Peak.', 'Переможи Кетварра на Драконовому піку.'),
    test: (P) => P.stars[13] !== undefined },
];

const Progress = {
  tab: 'overview',
  codexQuery: '',
  celebrations: [],
  _checking: false,
  _celebrateTimer: null,
  get P() { return Game.progress; },

  // ---------- XP a hodnosti ----------
  rankIndex(xp) {
    const n = xp == null ? (this.P.xp || 0) : xp;
    let i = 0;
    for (let k = 0; k < RANK_TIERS.length; k++) if (n >= RANK_TIERS[k].xp) i = k;
    return i;
  },
  rank() { return RANK_TIERS[this.rankIndex()]; },
  nextRank() { return RANK_TIERS[this.rankIndex() + 1] || null; },
  rankProgress() {
    const i = this.rankIndex(), a = RANK_TIERS[i], b = RANK_TIERS[i + 1];
    if (!b) return 1;
    return Math.max(0, Math.min(1, ((this.P.xp || 0) - a.xp) / (b.xp - a.xp)));
  },
  totalStars() { return Object.values(this.P.stars || {}).reduce((n, s) => n + (s || 0), 0); },
  mainLevels() { return LEVELS.filter((L) => !L.free && !L.boss); },
  masteredLevels() {
    return LEVELS.filter((L) => typeof Learn !== 'undefined' && Learn.mastered(L.num)).length;
  },
  deepCount() { return Object.keys(this.P.deep || {}).length; },
  allDeepCount() { return typeof EXPLAIN !== 'undefined' ? EXPLAIN.length : 0; },

  // každá odmena prejde sem; hodnosť sa oslavuje len raz za prechod na vyšší stupeň
  addXp(n, reason, opts = {}) {
    if (!n || !this.P) return;
    const P = this.P, before = this.rankIndex();
    P.xp = Math.max(0, (P.xp || 0) + Math.round(n));
    const after = this.rankIndex();
    this.hud();
    const chip = document.getElementById('hud-rank');
    if (chip && !opts.silent) {
      const f = document.createElement('span');
      f.className = 'xpfloat';
      f.textContent = `+${Math.round(n)} XP`;
      chip.appendChild(f);
      setTimeout(() => f.remove(), 1100);
    }
    if (!opts.silent && after > before) {
      this.celebrate({ kind: 'rank', icon: this.rank().icon, title: tr('Nová hodnosť!', 'New rank!', 'Новий ранг!'), sub: this.rank().name, xp: 0 });
    }
    if (!opts.noSave && Game.save) Game.save();
    if (!opts.noCheck) this.check();
  },

  // skontroluje úspechy; volá sa po každej odpovedi/leveli (bez rekurzie)
  check(silent = false) {
    if (this._checking || !this.P) return;
    this._checking = true;
    const P = this.P, got = [], before = this.rankIndex();
    for (const a of ACHIEVEMENTS) {
      if (P.ach[a.id]) continue;
      let ok = false;
      try { ok = !!a.test(P); } catch (e) { ok = false; }
      if (ok) { P.ach[a.id] = Date.now(); P.xp = (P.xp || 0) + (a.xp || 0); got.push(a); }
    }
    this._checking = false;
    if (got.length) {
      this.hud();
      if (!silent) {
        for (const a of got) UI.toast(`<b>${a.icon} ${a.name}</b> — ${a.desc} <span class="xpg">+${a.xp} XP</span>`, 4200);
        Sound.sfx('loot');
      }
      Game.save && Game.save();
    }
    if (!silent && got.some((a) => a.id === 'all_levels' || a.id === 'dragon')) {
      UI.toast(tr('🏆 Ostrov je tvoj! Pozri si Cestu (P).', '🏆 The island is yours! Open the Journey (P).', '🏆 Острів твій! Відкрий Шлях (P).'), 4200);
    }
    if (!silent && this.rankIndex() > before) {
      this.celebrate({ kind: 'rank', icon: this.rank().icon, title: tr('Nová hodnosť!', 'New rank!', 'Новий ранг!'), sub: this.rank().name, xp: 0 });
    }
  },

  // ---------- migrácia starých uložených hier ----------
  migrate() {
    const P = this.P;
    if (!P) return;
    P.xp = P.xp | 0;
    P.ach = P.ach || {};
    P.deep = P.deep || {};
    P.counters = P.counters || {};
    P.streak = P.streak | 0;
    P.lastDay = P.lastDay || '';
    if (!P.xp) { // stará hra: dopočítaj XP z toho, čo už hráč dokázal
      let xp = 0;
      for (const [n, s] of Object.entries(P.stars || {})) xp += 50 + (s || 0) * 30 + (n === '0' ? 0 : 10);
      xp += (P.codex.size || 0) * 8;
      xp += this.deepCount() * 6;
      for (const s of Object.values(P.stats || {})) if (s.ok > 0) xp += 8;
      P.counters.correct = P.counters.correct || Object.values(P.stats || {}).reduce((n, s) => n + (s.ok || 0), 0);
      P.xp = xp;
    }
    this.ensureDay(true);
    this.check(true);
    this.hud();
  },

  // ---------- denná výzva a séria dní ----------
  dayKey(d = new Date()) {
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  },
  dailyTarget() { return Math.min(8, 4 + Math.floor((this.P.xp || 0) / 700)); },
  ensureDay(silent = false) {
    const P = this.P, today = this.dayKey();
    if (!P.daily || P.daily.day !== today) {
      P.daily = { day: today, n: this.dailyTarget(), done: 0, ok: 0, complete: false };
      if (!silent) Game.save && Game.save();
    }
  },
  liveStreak() {
    const P = this.P;
    if (!P.lastDay || !P.streak) return 0;
    const days = Math.round((Date.parse(this.dayKey()) - Date.parse(P.lastDay)) / 86400000);
    return days <= 1 ? P.streak : 0;
  },
  bumpStreak() {
    const P = this.P, today = this.dayKey(), y = new Date();
    y.setDate(y.getDate() - 1);
    if (P.lastDay === today) return P.streak || 1;
    P.streak = P.lastDay === this.dayKey(y) ? (P.streak || 0) + 1 : 1;
    P.lastDay = today;
    P.counters.bestStreak = Math.max(P.counters.bestStreak || 0, P.streak);
    return P.streak;
  },
  startDaily() {
    if (UI.busy) return UI.toast(tr('Najprv dokonči rozhovor.', 'Finish the conversation first.', 'Спершу заверши розмову.'));
    this.ensureDay();
    const d = this.P.daily;
    if (d.complete) return UI.toast(tr('✨ Dnešná výzva je hotová. Vráť sa zajtra!', '✨ Today’s challenge is done. Come back tomorrow!', '✨ Сьогоднішній виклик виконано. Повернися завтра!'), 3600);
    let list = [];
    if (typeof Learn !== 'undefined') {
      list = Learn.mixed(0, d.n);
      if (list.length < d.n) {
        const done = LEVELS.filter((L) => this.P.stars[L.num] !== undefined && TRANSFER[L.num]).sort(() => rand() - 0.5);
        for (const L of done) {
          if (list.length >= d.n) break;
          list.push(...Learn.transfer(L.num, d.n - list.length, { practice: true, tag: `↻ L${L.num}` }));
        }
      }
      if (list.length < d.n) list.push(...Learn.transfer(1, d.n - list.length, { practice: true, tag: tr('✨ rozcvička', '✨ warm-up', '✨ розминка') }));
    }
    if (!list.length) return UI.toast(tr('Zatiaľ nie je z čoho vyberať — dokonči aspoň jednu úlohu.', 'Nothing to draw from yet — finish at least one task.', 'Ще немає з чого вибирати — заверши хоча б одне завдання.'));
    d.done = 0; d.ok = 0;
    const tag = tr('✨ denná výzva', '✨ daily challenge', '✨ денний виклик');
    list = list.slice(0, d.n).map((q) => ({ ...q, daily: true, inReview: true, tag }));
    this.close();
    Learn.series(Game.scene, list, (k) => this.finishDaily(k, list.length));
  },
  answerDaily(ok) {
    this.ensureDay();
    const d = this.P.daily;
    if (d.complete) return;
    d.done = Math.min(d.n, (d.done || 0) + 1);
    if (ok) d.ok = (d.ok || 0) + 1;
  },
  finishDaily(ok, total) {
    this.ensureDay();
    const P = this.P, d = P.daily;
    if (d.complete) return;
    d.complete = true; d.done = total; d.ok = ok;
    P.counters.daily = (P.counters.daily || 0) + 1;
    const streak = this.bumpStreak();
    const xp = 40 + Math.min(30, streak * 5) + ok * 3;
    const dw = streak === 1 ? 'deň' : streak < 5 ? 'dni' : 'dní';
    const dwUk = streak === 1 ? 'день' : streak < 5 ? 'дні' : 'днів';
    this.addXp(xp, 'daily', { noCheck: true });
    this.celebrate({ kind: 'daily', icon: '✨', title: tr('Denná výzva hotová!', 'Daily challenge complete!', 'Денний виклик виконано!'), sub: tr(`${ok}/${total} správne · séria ${streak} ${dw}`, `${ok}/${total} correct · streak ${streak} ${streak === 1 ? 'day' : 'days'}`, `${ok}/${total} правильно · серія ${streak} ${dwUk}`), xp });
    this.check();
  },

  // ---------- opakovanie naprieč levelmi ----------
  dueMap() {
    const P = this.P, out = {};
    for (const e of Object.values(P.review || {})) if (e.snap && e.due <= P.clock) out[e.lvl] = (out[e.lvl] || 0) + 1;
    return out;
  },
  reviewCount() { return Object.values(this.dueMap()).reduce((n, x) => n + x, 0); },
  reviewQuestions(lvl, n = 8) {
    const P = this.P;
    return Object.entries(P.review || {})
      .filter(([, e]) => e.snap && e.due <= P.clock && (lvl == null || e.lvl === lvl))
      .sort((a, b) => a[1].due - b[1].due || a[1].box - b[1].box)
      .slice(0, n)
      .map(([, e]) => ({ ...Learn.rebuild(e.snap, { inReview: true, tag: `↻ L${e.lvl}` }), ...Learn.spark() }));
  },
  startReview(lvl) {
    if (UI.busy) return UI.toast(tr('Najprv dokonči rozhovor.', 'Finish the conversation first.', 'Спершу заверши розмову.'));
    const list = this.reviewQuestions(lvl, lvl == null ? 10 : 8);
    if (!list.length) return UI.toast(tr('Žiadne otázky na opakovanie — všetko je zvládnuté.', 'Nothing due for review — everything is mastered.', 'Немає питань на повторення — усе опановано.'), 3600);
    this.close();
    const label = lvl == null ? tr('Zmiešané opakovanie', 'Mixed review', 'Змішане повторення') : tr(`Opakovanie levelu ${lvl}`, `Level ${lvl} review`, `Повторення рівня ${lvl}`);
    Learn.series(Game.scene, list, (k) => UI.toast(`↻ ${label}: ${k}/${list.length}`, 3600));
  },

  // ---------- udalosti hry ----------
  onAnswer(q, ok, info = {}) {
    const P = this.P;
    P.counters = P.counters || {};
    if (q.daily) this.answerDaily(ok);
    if (ok) P.counters.correct = (P.counters.correct || 0) + 1;
    else P.counters.wrong = (P.counters.wrong || 0) + 1;
    if (ok && (q.inReview || q.practice)) P.counters.reviewOk = (P.counters.reviewOk || 0) + 1;
    let xp = 0;
    if (q.drill) xp = ok ? 4 : 1;
    else if (ok) {
      const base = Settings.hard ? 14 : Settings.easy ? 8 : 10;
      xp = q.inReview || q.practice ? 6 : base;
      if (!q.inReview && !q.practice && P.stats[q.id] && P.stats[q.id].n === 1) xp += 4; // prvá správna odpoveď na otázku
      if (q.daily) xp += 2;
    }
    if (xp) this.addXp(xp, 'answer');
    else this.check();
  },
  onExplain(ex) {
    if (!ex || !ex.id) return;
    const P = this.P;
    P.deep = P.deep || {};
    if (!P.deep[ex.id]) {
      P.deep[ex.id] = 1;
      this.addXp(6, 'explain');
      this.check();
    }
  },
  onCodex(ids) {
    if (!ids || !ids.length) return;
    this.addXp(ids.length * 8, 'codex', { noCheck: true });
    this.check();
  },
  onScroll() { this.addXp(4, 'scroll'); },
  onLevel(n, stars, prev) {
    const fresh = prev === undefined, better = fresh || stars > prev;
    const gain = 50 + (stars || 0) * 30 + (fresh ? 20 : 0);
    this.addXp(gain, 'level', { noCheck: true });
    this.check();
    if (!better) return;
    const L = LEVELS.find((x) => x.num === n);
    const title = L ? L.title : tr('Level', 'Level', 'Рівень');
    this.celebrate({
      kind: 'level', icon: stars >= 3 ? '🏆' : '🌟', title: tr('Level dokončený!', 'Level complete!', 'Рівень завершено!'),
      sub: `${dnum(n)} · ${title}`, stars: stars || 0, xp: gain,
    });
  },

  // ---------- oslavy (radia sa, aby sa neprekryli) ----------
  celebrate(data) {
    this.celebrations.push(data);
    if (Game.scene === Hub) this.flushCelebrations();
  },
  flushCelebrations() {
    if (this._showing || !this.celebrations.length) return;
    const box = $('#celebrate');
    if (!box) { const d = this.celebrations.shift(); UI.toast(`<b>${d.icon || '✨'} ${d.title}</b> ${d.sub || ''}`, 3600); return; }
    const d = this.celebrations.shift();
    this._showing = true;
    const stars = d.stars != null ? `<div class="cel-stars">${'★'.repeat(d.stars)}${'☆'.repeat(Math.max(0, 3 - d.stars))}</div>` : '';
    const xp = d.xp ? `<div class="cel-xp">+${d.xp} XP</div>` : '';
    box.innerHTML = `<div class="cel-card ${d.kind || ''}"><div class="cel-ico">${d.icon || '✨'}</div><h2>${d.title}</h2><div class="cel-sub">${d.sub || ''}</div>${stars}${xp}</div>`;
    box.classList.add('show');
    Sound.sfx(d.kind === 'rank' ? 'levelup' : 'fanfare');
    clearTimeout(this._celebrateTimer);
    this._celebrateTimer = setTimeout(() => {
      box.classList.remove('show');
      this._showing = false;
      setTimeout(() => this.flushCelebrations(), 260);
    }, Settings.reducedMotion ? 2200 : 3200);
  },

  // ---------- HUD čip ----------
  hud() {
    const chip = document.getElementById('hud-rank');
    if (!chip || !this.P) return;
    const r = this.rank(), nx = this.nextRank();
    chip.innerHTML = `<span class="hr-icon">${r.icon}</span><span class="hr-rank">${r.name}</span><span class="hr-xp">${this.P.xp || 0} XP</span>`;
    chip.dataset.tip = `<b>${r.icon} ${r.name}</b> — ${this.P.xp || 0} XP`
      + (nx ? `<br>${tr('Do hodnosti', 'To rank', 'До рангу')} <b>${nx.name}</b>: ${Math.max(0, nx.xp - (this.P.xp || 0))} XP` : `<br>${tr('Najvyššia hodnosť.', 'Highest rank.', 'Найвищий ранг.')}`)
      + `<br>${tr('Cesta, opakovanie a úspechy: P', 'Journey, review and achievements: P', 'Шлях, повторення й досягнення: P')}`;
  },
  open(tab) {
    if (!this.P) return;
    this.ensureDay();
    if (tab) this.tab = tab;
    this.render();
    const o = $('#journey');
    if (!o) return;
    if (!o.classList.contains('show')) { Sound.sfx('journal'); o.classList.add('show'); }
  },
  close() {
    const o = $('#journey');
    if (o && o.classList.contains('show')) { o.classList.remove('show'); Sound.sfx('close'); }
  },

  // ---------- prehľad „Cesta“ (P) ----------
  render() {
    const box = $('#journey .box');
    if (!box || !this.P) return;
    const P = this.P, r = this.rank(), nx = this.nextRank(), due = this.reviewCount();
    const pct = Math.round(this.rankProgress() * 100);
    const got = Object.keys(P.ach || {}).length;
    const tab = this.tab || 'overview';
    box.innerHTML = `<button class="close" aria-label="${tr('Zavrieť', 'Close', 'Закрити')}">✕</button>
      <div class="jr-head">
        <div class="jr-badge">${r.icon}</div>
        <div class="jr-id"><h2>${r.name}</h2><div class="jr-sub">${tr('Hodnosť', 'Rank', 'Ранг')} · ${P.xp || 0} XP</div></div>
        <div class="jr-flame" data-tip="${tr('Séria dní s dokončenou dennou výzvou.', 'Your streak of completed daily challenges.', 'Серія днів із виконаним денним викликом.')}">🔥 <b>${this.liveStreak()}</b><small>${tr('dní', 'days', 'днів')}</small></div>
      </div>
      <div class="jr-bar"><i style="width:${pct}%"></i></div>
      <div class="jr-next">${nx ? tr(`Do hodnosti <b>${nx.name}</b> ešte ${Math.max(0, nx.xp - (P.xp || 0))} XP`, `To <b>${nx.name}</b>: ${Math.max(0, nx.xp - (P.xp || 0))} XP to go`, `До <b>${nx.name}</b>: ще ${Math.max(0, nx.xp - (P.xp || 0))} XP`) : tr('Najvyššia hodnosť — ostrov ti leží pri nohách.', 'Highest rank — the island lies at your feet.', 'Найвищий ранг — острів лежить у тебе під ногами.')}</div>
      <div class="journey-tabs tabs"></div>
      <div class="journey-body"></div>`;
    box.querySelector('.close').onclick = () => this.close();
    const tabs = box.querySelector('.journey-tabs');
    for (const [k, label, badge] of [
      ['overview', tr('🧭 Prehľad', '🧭 Overview', '🧭 Огляд'), ''],
      ['review', tr('↻ Opakovanie', '↻ Review', '↻ Повторення'), due ? ` · ${due}` : ''],
      ['ach', tr('🏅 Úspechy', '🏅 Achievements', '🏅 Досягнення'), ` · ${got}/${ACHIEVEMENTS.length}`],
      ['deep', tr('📚 Hlbšie', '📚 Deep dives', '📚 Глибше'), ''],
    ]) {
      const b = el('button', k === tab ? 'on' : '', label + badge);
      b.onclick = () => { this.tab = k; this.render(); };
      tabs.appendChild(b);
    }
    const body = box.querySelector('.journey-body');
    if (tab === 'review') return this.renderReview(body);
    if (tab === 'ach') return this.renderAchievements(body);
    if (tab === 'deep') return this.renderDeep(body);
    return this.renderOverview(body);
  },

  renderOverview(body) {
    const P = this.P;
    this.ensureDay();
    const d = P.daily, n = d.n || 5, done = Math.min(d.done || 0, n);
    const daily = el('div', 'jr-card daily');
    daily.innerHTML = `<div class="jr-card-head"><span>✨ ${tr('Denná výzva', 'Daily challenge', 'Денний виклик')}</span><b>${done}/${n}</b></div>
      <div class="jr-dots">${Array.from({ length: n }, (_, i) => `<i class="${i < done ? 'on' : ''}"></i>`).join('')}</div>
      <p>${d.complete ? tr('Dnes hotovo — pekná práca. Nová výzva príde zajtra.', 'Done for today — nice work. A new challenge arrives tomorrow.', 'На сьогодні готово — гарна робота. Новий виклик прийде завтра.') : tr('Krátka zmes otázok naprieč levelmi. Dokončením udržíš sériu dní a získaš XP.', 'A short mix of questions across levels. Finish it to keep your streak and earn XP.', 'Коротка суміш питань із різних рівнів. Заверши, щоб зберегти серію й отримати XP.')}</p>`;
    const db = el('button', d.complete ? '' : 'primary', d.complete ? tr('✓ Hotovo', '✓ Done', '✓ Готово') : tr('▶ Spustiť výzvu', '▶ Start challenge', '▶ Почати виклик'));
    db.disabled = d.complete;
    db.onclick = () => this.startDaily();
    daily.appendChild(db);
    body.appendChild(daily);

    const due = this.reviewCount(), map = this.dueMap();
    const rev = el('div', 'jr-card');
    rev.innerHTML = `<div class="jr-card-head"><span>↻ ${tr('Opakovanie', 'Review', 'Повторення')}</span><b>${due}</b></div>
      <p>${due ? tr('Otázky, ktoré sa ti vracajú podľa Leitnerovho opakovania. Najviac ich čaká v leveloch:', 'Questions coming back through Leitner review. Most are waiting in these levels:', 'Питання, що повертаються за повторенням Лейтнера. Найбільше їх чекає в рівнях:')
        : tr('Všetko je zopakované. Môžeš si však precvičiť ľubovoľný dokončený level.', 'Everything is reviewed. You can still practise any completed level.', 'Усе повторено. Можна ще потренувати будь-який завершений рівень.')}</p>`;
    if (due) {
      const row = el('div', 'jr-chips');
      for (const lvl of Object.keys(map).map(Number).sort((a, b) => a - b)) {
        const L = LEVELS.find((x) => x.num === lvl);
        const b = el('button', 'chip', `${lvl} · ${L ? L.title : tr('Level', 'Level', 'Рівень')} (${map[lvl]})`);
        b.onclick = () => this.startReview(lvl);
        row.appendChild(b);
      }
      rev.appendChild(row);
      const all = el('button', 'primary', tr(`▶ Zmiešané opakovanie (${due})`, `▶ Mixed review (${due})`, `▶ Змішане повторення (${due})`));
      all.onclick = () => this.startReview(null);
      rev.appendChild(all);
    } else {
      const row = el('div', 'jr-chips');
      for (const L of LEVELS.filter((x) => P.stars[x.num] !== undefined && !x.free).slice(0, 4)) {
        const b = el('button', 'chip', `${dnum(L.num)} · ${L.title}`);
        b.onclick = () => { this.close(); Learn.testMe(L.num); };
        row.appendChild(b);
      }
      rev.appendChild(row);
    }
    body.appendChild(rev);

    const stats = el('div', 'jr-stats');
    for (const [icon, value, label] of [
      ['★', `${this.totalStars()}`, tr('hviezdičiek', 'stars', 'зірок')],
      ['🚪', `${Object.keys(P.stars || {}).length}/${LEVELS.length}`, tr('levelov', 'levels', 'рівнів')],
      ['🎓', `${this.masteredLevels()}`, tr('zvládnutých cieľov', 'mastered goals', 'опанованих цілей')],
      ['📖', `${P.codex.size}/${CODEX.length}`, tr('Kódex', 'Codex', 'Кодекс')],
      ['📚', `${this.deepCount()}/${this.allDeepCount()}`, tr('hlbších vysvetlení', 'deep dives', 'глибших пояснень')],
      ['🔥', `${P.counters.bestStreak || 0}`, tr('najdlhšia séria', 'best streak', 'найдовша серія')],
    ]) {
      const s = el('div', 'jr-stat');
      s.innerHTML = `<div class="js-ico">${icon}</div><div class="js-v">${value}</div><div class="js-l">${label}</div>`;
      stats.appendChild(s);
    }
    body.appendChild(stats);

    const help = el('div', 'jr-card xpguide');
    help.innerHTML = `<div class="jr-card-head"><span>💡 ${tr('Ako rásť', 'How to grow', 'Як зростати')}</span></div>
      <ul>
        <li>${tr('správna odpoveď — podľa obťažnosti 8–14 XP (prvá správna +4)', 'a correct answer — 8–14 XP by difficulty (first correct +4)', 'правильна відповідь — 8–14 XP за складністю (перша правильна +4)')}</li>
        <li>${tr('nová karta Kódexu +8 XP · hlbšie vysvetlenie +6 XP', 'a new Codex card +8 XP · a deep dive +6 XP', 'нова картка Кодексу +8 XP · глибше пояснення +6 XP')}</li>
        <li>${tr('dokončený level +50 XP a viac za hviezdičky', 'a completed level +50 XP and more for stars', 'завершений рівень +50 XP і більше за зірки')}</li>
        <li>${tr('denná výzva +40 XP, bonus za sériu dní a správne odpovede', 'the daily challenge +40 XP, plus a streak and accuracy bonus', 'денний виклик +40 XP, плюс бонус за серію й точність')}</li>
      </ul>`;
    body.appendChild(help);
    const links = el('div', 'row jr-links');
    const y = el('button', null, tr('📖 Kódex', '📖 Codex', '📖 Кодекс'));
    y.onclick = () => { this.close(); UI.toggleCodex(true); };
    const h = el('button', null, tr('⚙ Nastavenia', '⚙ Settings', '⚙ Налаштування'));
    h.onclick = () => { this.close(); UI.toggleSettings(true); };
    links.append(y, h);
    body.appendChild(links);
  },

  renderReview(body) {
    const due = this.reviewCount(), map = this.dueMap();
    const intro = el('div', 'jr-card');
    intro.innerHTML = `<div class="jr-card-head"><span>↻ ${tr('Opakovanie naprieč levelmi', 'Cross-level review', 'Повторення між рівнями')}</span><b>${due}</b></div>
      <p>${tr('Otázky sa vracajú podľa toho, ako ti išli: istý omyl skôr, správne odpovede neskôr. Každé správne zopakovanie predlžuje interval.', 'Questions return based on how you did: a confident mistake sooner, correct answers later. Each correct review lengthens the interval.', 'Питання повертаються залежно від результату: упевнена помилка раніше, правильні відповіді пізніше. Кожне правильне повторення подовжує інтервал.')}</p>`;
    if (due) {
      const all = el('button', 'primary', tr(`▶ Zmiešane všetko (${due})`, `▶ Mix everything (${due})`, `▶ Змішати все (${due})`));
      all.onclick = () => this.startReview(null);
      intro.appendChild(all);
    }
    body.appendChild(intro);
    if (!due) {
      const empty = el('div', 'jr-empty');
      empty.innerHTML = `<div class="je-ico">🌤</div><h3>${tr('Nič nie je na rade', 'Nothing is due', 'Нічого не чекає')}</h3>
        <p>${tr('Opakovanie sa naplní, keď v leveloch odpovieš na otázky. Medzitým si môžeš precvičiť hotové levely:', 'Review fills up as you answer questions in levels. Meanwhile you can practise completed levels:', 'Повторення наповниться, коли відповідатимеш на питання в рівнях. Тим часом потренуй завершені рівні:')}</p>`;
      const row = el('div', 'jr-chips');
      const done = LEVELS.filter((x) => this.P.stars[x.num] !== undefined && !x.free);
      if (!done.length) empty.appendChild(el('p', 'muted', tr('Zatiaľ nemáš dokončený žiadny level.', 'You have not completed a level yet.', 'Ти ще не завершив(-ла) жодного рівня.')));
      for (const L of done.slice(0, 8)) {
        const b = el('button', 'chip', `${dnum(L.num)} · ${L.title}`);
        b.onclick = () => { this.close(); Learn.testMe(L.num); };
        row.appendChild(b);
      }
      empty.appendChild(row);
      body.appendChild(empty);
      return;
    }
    for (const lvl of Object.keys(map).map(Number).sort((a, b) => a - b)) {
      const L = LEVELS.find((x) => x.num === lvl);
      const card = el('div', 'jr-card revrow');
      const total = Object.values(this.P.review || {}).filter((e) => e.lvl === lvl && e.snap).length;
      card.innerHTML = `<div class="jr-card-head"><span>${lvl} · ${L ? L.title : tr('Level', 'Level', 'Рівень')}</span><b>${map[lvl]}</b></div>
        <p>${tr(`Na opakovanie: ${map[lvl]} z ${total} otázok tohto levelu.`, `${map[lvl]} of this level’s ${total} questions are due.`, `На повторення: ${map[lvl]} з ${total} питань цього рівня.`)}</p>`;
      const b = el('button', 'primary', tr('▶ Zopakovať level', '▶ Review this level', '▶ Повторити рівень'));
      b.onclick = () => this.startReview(lvl);
      card.appendChild(b);
      body.appendChild(card);
    }
  },

  renderAchievements(body) {
    const P = this.P, got = Object.keys(P.ach || {}).length;
    const head = el('div', 'jr-card');
    head.innerHTML = `<div class="jr-card-head"><span>🏅 ${tr('Úspechy', 'Achievements', 'Досягнення')}</span><b>${got}/${ACHIEVEMENTS.length}</b></div>
      <div class="jr-bar"><i style="width:${Math.round(got / ACHIEVEMENTS.length * 100)}%"></i></div>
      <p>${tr('Za každý úspech dostaneš XP. Niektoré prídu samy, iné si treba zaslúžiť opakovaním alebo dennou výzvou.', 'Every achievement grants XP. Some come by themselves, others need review or a daily challenge.', 'Кожне досягнення дає XP. Деякі приходять самі, інші — за повторення чи денний виклик.')}</p>`;
    body.appendChild(head);
    const grid = el('div', 'ach-grid');
    for (const a of ACHIEVEMENTS) {
      const has = !!P.ach[a.id], pr = typeof a.prog === 'function' ? a.prog(P) : null;
      const card = el('div', 'ach ' + (has ? 'got' : ''));
      card.innerHTML = `<div class="ach-ico">${has ? a.icon : '🔒'}</div><div class="ach-main"><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div>`
        + (pr && !has ? `<div class="ach-bar"><i style="width:${Math.min(100, Math.round(pr[0] / Math.max(1, pr[1]) * 100))}%"></i></div><small>${pr[0]} / ${pr[1]}</small>` : '')
        + `</div><div class="ach-xp">${has ? '✓' : `+${a.xp} XP`}</div>`;
      grid.appendChild(card);
    }
    body.appendChild(grid);
  },

  renderDeep(body) {
    const P = this.P, all = typeof Explain !== 'undefined' ? Explain.all() : [];
    const head = el('div', 'jr-card');
    head.innerHTML = `<div class="jr-card-head"><span>📚 ${tr('Hlbšie vysvetlenia', 'Deep dives', 'Глибші пояснення')}</span><b>${this.deepCount()}/${all.length}</b></div>
      <p>${tr('Krátke eseje k pojmom z levelov. Otvoríš ich aj kliknutím na podčiarknutý pojem alebo tlačidlom 📚 Hlbšie v rozhovore a kvíze.', 'Short essays on the concepts of each level. You can also open them by clicking an underlined term or with 📚 Go deeper in a dialogue or quiz.', 'Короткі есеї про поняття рівнів. Їх можна відкрити й кліком на підкреслене поняття або кнопкою 📚 Глибше в розмові чи вікторині.')}</p>`;
    body.appendChild(head);
    if (!all.length) return;
    const list = el('div', 'deep-list');
    for (const e of all.slice().sort((a, b) => (a.level || 0) - (b.level || 0))) {
      const b = el('button', 'deep-item' + (P.deep[e.id] ? ' seen' : ''));
      b.innerHTML = `<span class="di-ico">${e.icon || '📚'}</span><span class="di-main"><b>${e.title}</b><small>${e.short || ''}</small></span><span class="di-lvl">${e.level ? tr('L', 'L', 'Р') + e.level : ''}</span>`;
      b.onclick = () => Explain.open(e.id);
      list.appendChild(b);
    }
    body.appendChild(list);
  },
};
