'use strict';
// SpinQ — voľná dielňa (bez hodnotenia, dostupná kedykoľvek z ostrova / mapy / nastavení, klávesom Q).
// Rovnaký fyzikálny model ako NMR dielňa (level 12): prúdový RF impulz θ = γB₁τ v priečnej cievke.
// Navyše: idealizované logické hradlá (X, Y, Z, H, S, T, √X, √Y) ako presné rotácie, presety stavov,
// operátor časového vývoja Û(t) = e^{−iĤt/ħ} (Larmorova precesia), odhalenie bežne neviditeľnej
// fázy (globálna aj relatívna) a projektívne meranie v bázach Z / X / Y.
// Okrem Blochovho vektora (ktorý globálnu fázu NEvie zobraziť) držíme aj skutočný stavový vektor |ψ⟩.

const SpinQ = {
  num: 'spinq', // nečíselné id scény — Hub, mapa a uloženie pozície ho jednoducho ignorujú
  title: tr('🧪 SpinQ — voľná dielňa', '🧪 SpinQ — free play', '🧪 SpinQ — вільна гра'),
  request() {}, // voláva Game pri zmene obťažnosti/typu hry — dielňa sa nimi neriadi

  enter() {
    this.cam = new OrbitCam([0, 1.6, 0], 9, 0.55, 0.28, 4, 18);
    this.psi = Q.ket0(); this.m = [0, 0, 1]; // |ψ⟩ (so skutočnou fázou) aj Blochov vektor (na vizualizáciu)
    this.anim = null; this.pulsing = 0; this.t = 0;
    this.I = 1; this.tau = 5; this.phase = 'x'; this.fid = null;
    this.showPhase = false; this.precess = false; this.evoDeg = 90; this.omega = 80; this.lastMeas = null;
    this.auto = null;
    UI.setHud(this.title, tr('Voľná hra, bez hodnotenia — hradlá, časový vývoj, fáza aj meranie.', 'Free play, no grading — gates, time evolution, phase and measurement.', 'Вільна гра, без оцінювання — гейти, часова еволюція, фаза та вимірювання.'));
    this.buildPanel();
    this.buildDock();
  },
  exit() { this.auto = null; UI.dockHide(); UI.panelHide(); },

  // ---------- fyzika impulzu (rovnaká ako NMR dielňa, level 12, bez rozladenia) ----------
  flip(I = this.I, tau = this.tau) { return 2 * Math.PI * NMR_GAMMA * 1e6 * NMR_K * I * tau * 1e-6; }, // θ = γB₁τ (rad)
  flipDeg(I, tau) { return this.flip(I, tau) * 180 / Math.PI; },

  disp() {
    const a = this.anim;
    if (!a) return this.m;
    return V3.rotate(a.v0, a.axis, a.ang * a.t);
  },
  // najkratšia rotácia z v0 do v1 (pre presety / meranie); pri protiľahlých vektoroch je os ľubovoľná priečna
  rotTo(v0, v1) {
    const ang = Math.acos(clamp(V3.dot(v0, v1), -1, 1));
    let axis = V3.cross(v0, v1);
    if (V3.len(axis) < 1e-6) axis = Math.abs(v0[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    return { axis: V3.norm(axis), ang };
  },

  // jadro: aplikuj unitárne hradlo U na |ψ⟩ a súčasne animuj zodpovedajúcu rotáciu Blochovho vektora (axis, ang)
  applyU(U, axis, ang, label, pulse) {
    if (this.anim) return;
    this.psi = Q.apply(U, this.psi);
    const v1 = Q.bloch(this.psi);
    this.anim = { v0: this.m, axis: V3.norm(axis), ang, t: 0, done: () => this.afterShot(label) };
    this.m = v1;
    if (pulse) this.pulsing = 1;
    this.lastMeas = null; Sound.sfx('cast');
  },
  preset(name) {
    if (this.anim) return;
    this.psi = Q.named(name);
    const v1 = Q.bloch(this.psi), { axis, ang } = this.rotTo(this.m, v1);
    this.anim = { v0: this.m, axis, ang: Math.max(ang, 1e-6), t: 0, done: () => this.afterShot(name) };
    this.m = v1; this.lastMeas = null; Sound.sfx('cast');
  },
  gate(U, axis, ang, label) { this.applyU(U, axis, ang, label, true); },

  // prúdový RF impulz: rotácia o θ = γB₁τ okolo osi vo fáze impulzu (priečna rovina)
  firePulse() {
    const th = this.flip(), axis = V3.norm(NMR_PHASES[this.phase]);
    this.applyU(Gate.R(axis, th), axis, th, `${Fmt.num(th * 180 / Math.PI, 0)}° (${this.phase})`, true);
  },
  // operátor časového vývoja: Ĥ = −½ħω σ_z ⇒ Û(t) = e^{−iĤt/ħ} = e^{−i(−½ω)σ_z t} = R_z(ωt) — Larmorova precesia okolo B₀
  evolve(deg) {
    const ang = deg * Math.PI / 180;
    this.applyU(Gate.Rz(ang), [0, 0, 1], ang, `Û(t): ${Fmt.num(deg, 0)}° ${tr('okolo z', 'about z', 'навколо z')}`, false);
  },
  togglePrecess() { this.precess = !this.precess; this.buildPanel(); },
  togglePhase() { this.showPhase = !this.showPhase; this.buildPanel(); },

  // projektívne meranie pozdĺž osi n (Blochov vektor): Bornova pravdepodobnosť (1 ± r·n)/2, potom kolaps na vlastný stav |±n⟩
  eigenstate(n, plus) {
    const v = plus ? n : V3.scale(n, -1), th = Math.acos(clamp(v[2], -1, 1)), ph = Math.atan2(v[1], v[0]);
    return Q.fromBloch(th, ph);
  },
  measure(n, label) {
    if (this.anim) return;
    this.precess = false;
    const r = Q.bloch(this.psi), pPlus = clamp((1 + V3.dot(V3.norm(n), r)) / 2, 0, 1), plus = rand() < pPlus;
    const nn = V3.norm(n), v1 = plus ? nn.slice() : V3.scale(nn, -1);
    this.psi = this.eigenstate(nn, plus);
    const { axis, ang } = this.rotTo(this.m, v1);
    this.anim = { v0: this.m, axis, ang: Math.max(ang, 1e-6), t: 0, done: () => this.afterShot(`${label} → ${plus ? '+1' : '−1'}`) };
    this.m = v1; this.lastMeas = { label, plus, p: plus ? pPlus : 1 - pPlus }; Sound.sfx('click');
  },

  // ---------- autoplay: riadené ukážky správnych postupov ----------
  // scenár = pomenovaná postupnosť krokov {say, do}; beží v update(), ďalší krok až keď doanimuje predchádzajúci
  autoScripts() {
    const H = () => this.gate(Gate.H, V3.norm([1, 0, 1]), Math.PI, 'H');
    return [
      { id: 'super', name: tr('Superpozícia a kolaps', 'Superposition & collapse', 'Суперпозиція і колапс'), steps: [
        { say: tr('Začíname v stave |0⟩ — isté meranie 0.', 'Start in |0⟩ — a certain measurement of 0.', 'Починаємо в |0⟩ — певне вимірювання 0.'), do: () => this.preset('0'), hold: 1.4 },
        { say: tr('Hradlo H → rovnomerná superpozícia |+⟩, P(0) = P(1) = 50 %.', 'Gate H → an even superposition |+⟩, P(0) = P(1) = 50 %.', 'Гейт H → рівна суперпозиція |+⟩, P(0) = P(1) = 50 %.'), do: H, hold: 1.7 },
        { say: tr('Meriame v báze Z — stav náhodne skolabuje na |0⟩ alebo |1⟩ (Bornovo pravidlo).', 'Measure in the Z basis — the state randomly collapses to |0⟩ or |1⟩ (Born rule).', 'Вимірюємо в базисі Z — стан випадково колапсує до |0⟩ чи |1⟩ (правило Борна).'), do: () => this.measure([0, 0, 1], 'Z'), hold: 1.7 },
      ] },
      { id: 'ramsey', name: tr('Ramsey: skrytá fáza sa prejaví', 'Ramsey: hidden phase shows up', 'Ремзі: прихована фаза проявляється'), steps: [
        { say: tr('Štart v |0⟩; odhalíme bežne neviditeľnú fázu.', 'Start in |0⟩; reveal the normally invisible phase.', 'Старт у |0⟩; відкриваємо зазвичай невидиму фазу.'), do: () => { this.preset('0'); if (!this.showPhase) this.togglePhase(); }, hold: 1.6 },
        { say: tr('Prvý H → |+⟩: šípka na rovníku, relatívna fáza φ = 0°.', 'First H → |+⟩: the arrow sits on the equator, relative phase φ = 0°.', 'Перший H → |+⟩: стрілка на екваторі, відносна фаза φ = 0°.'), do: H, hold: 1.7 },
        { say: tr('Voľný časový vývoj Û(t): relatívna fáza narastie o 180°.', 'Free evolution Û(t): the relative phase grows by 180°.', 'Вільна еволюція Û(t): відносна фаза зростає на 180°.'), do: () => this.evolve(180), hold: 1.8 },
        { say: tr('Druhý H premení fázu na populácie → stav je teraz |1⟩.', 'A second H turns phase into populations → the state is now |1⟩.', 'Другий H перетворює фазу на населеності → стан тепер |1⟩.'), do: H, hold: 1.7 },
        { say: tr('Meranie Z dá takmer isto 1 — fáza, ktorú sme „nevideli“, určila výsledok (pri 0° by vyšla 0).', 'A Z measurement gives 1 almost surely — the phase we “could not see” decided the outcome (at 0° it would be 0).', 'Вимірювання Z дає майже напевно 1 — фаза, яку ми «не бачили», визначила результат (при 0° було б 0).'), do: () => this.measure([0, 0, 1], 'Z'), hold: 1.8 },
      ] },
    ];
  },
  buildDock() {
    const scripts = this.autoScripts(), running = !!this.auto;
    this.autocap = el('div', 'autocap', running ? '' : tr('Vyber ukážku — Psíčko ju samo predvedie krok za krokom.', 'Pick a demo — Little Psi plays it step by step.', 'Обери демонстрацію — Псічко відтворить її крок за кроком.'));
    const nodes = scripts.map((s) => {
      const b = UI.plainButton((running && this.auto.id === s.id ? '▶ ' : '') + s.name, () => this.startAuto(s.id));
      if (running && this.auto.id === s.id) b.className = 'on';
      return UI.row(b);
    });
    nodes.push(this.autocap);
    if (running) nodes.push(UI.row(UI.plainButton(tr('⏹ Zastaviť', '⏹ Stop', '⏹ Зупинити'), () => this.stopAuto())));
    UI.dockSet(tr('▶ Ukážky (autoplay)', '▶ Demos (autoplay)', '▶ Демонстрації (autoplay)'), nodes);
  },
  startAuto(id) {
    const s = this.autoScripts().find((x) => x.id === id);
    if (!s) return;
    this.anim = null; this.precess = false;
    this.auto = { id, steps: s.steps, i: -1, wait: 0.2 };
    Sound.sfx('portal'); this.buildDock();
  },
  stopAuto() { this.auto = null; this.buildDock(); },
  autoNext() {
    const a = this.auto; if (!a) return;
    a.i++;
    if (a.i >= a.steps.length) {
      this.auto = null; this.buildDock();
      this.autocap.innerHTML = '<b>✅ ' + tr('Ukážka dokončená.', 'Demo complete.', 'Демонстрацію завершено.') + '</b>';
      Sound.sfx('toast'); return;
    }
    const st = a.steps[a.i];
    this.autocap.innerHTML = `<b>${a.i + 1}/${a.steps.length}</b> · ${st.say}`;
    st.do && st.do();
    a.wait = st.hold || 1.4;
  },

  // po skončení animácie: zapamätať priečnu magnetizáciu pre ilustračný graf FID
  afterShot(label) {
    const v = this.m;
    this.fid = { Mperp: Math.hypot(v[0], v[1]), phi0: Math.atan2(v[1], v[0]), label };
    this.updRead(); this.drawTrace();
  },

  update(dt) {
    this.t += dt;
    this.pulsing = Math.max(0, this.pulsing - dt * 1.2);
    if (this.anim) {
      this.anim.t = Math.min(1, this.anim.t + dt / 0.6);
      if (this.anim.t >= 1) { const d = this.anim.done; this.anim = null; d && d(); }
      this.updRead();
    } else if (this.auto) {
      this.auto.wait -= dt;
      if (this.auto.wait <= 0) this.autoNext();
    } else if (this.precess) {
      this.psi = Q.apply(Gate.Rz(this.omega * Math.PI / 180 * dt), this.psi); // spojitý časový vývoj Û(dt)
      this.m = Q.bloch(this.psi);
      this.updRead();
    }
  },

  // ---------- panel ----------
  buildPanel() {
    this.read = UI.info('');
    this.chart = UI.chart(300, 120);
    const presetBtn = (name) => UI.button(name, () => this.preset(name));
    const gateBtn = (label, U, axis, ang) => UI.button(label, () => this.gate(U, axis, ang, label));
    const Tdg = [[C.of(1), C.of(0)], [C.of(0), C.exp(-Math.PI / 4)]]; // T† = diag(1, e^{−iπ/4})
    const measBtn = (label, n) => UI.button('📡 ' + label, () => this.measure(n, label));
    UI.panelSet(this.title, [
      UI.info(tr('Voľná dielňa so spinom ½ — ako jadro v stolovom NMR počítači SpinQ. Žiadne ciele ani otázky, len skús, čo chceš.',
        'A free-play workshop with a spin-½ — like the nucleus in a benchtop NMR computer such as SpinQ. No goals or questions, just try whatever you like.',
        'Вільна майстерня зі спіном ½ — як ядро в настільному ЯМР-комп’ютері SpinQ. Без цілей і питань, просто пробуй, що хочеш.'), 'tip'),
      el('h4', null, tr('Presety', 'Presets', 'Заготовки')),
      UI.row(presetBtn('0'), presetBtn('1'), presetBtn('+'), presetBtn('-'), presetBtn('+i'), presetBtn('-i')),
      el('h4', null, tr('Idealizované hradlá', 'Idealized gates', 'Ідеалізовані гейти')),
      UI.row(gateBtn('X', Gate.X, [1, 0, 0], Math.PI), gateBtn('Y', Gate.Y, [0, 1, 0], Math.PI), gateBtn('Z', Gate.Z, [0, 0, 1], Math.PI), gateBtn('H', Gate.H, V3.norm([1, 0, 1]), Math.PI)),
      UI.row(gateBtn('S', Gate.S, [0, 0, 1], Math.PI / 2), gateBtn('S†', Gate.Sdg, [0, 0, 1], -Math.PI / 2), gateBtn('T', Gate.T, [0, 0, 1], Math.PI / 4), gateBtn('T†', Tdg, [0, 0, 1], -Math.PI / 4)),
      UI.row(gateBtn('√X', Gate.Rx(Math.PI / 2), [1, 0, 0], Math.PI / 2), gateBtn('√Y', Gate.Ry(Math.PI / 2), [0, 1, 0], Math.PI / 2)),
      this.read,
      el('h4', null, tr('🫥 Fáza (bežne skrytá)', '🫥 Phase (normally hidden)', '🫥 Фаза (зазвичай прихована)')),
      UI.row(UI.button((this.showPhase ? '● ' : '○ ') + tr('ukázať fázu α, β', 'show phase of α, β', 'показати фазу α, β'), () => this.togglePhase())),
      UI.info(tr('Blochova sféra ukáže len <b>relatívnu</b> fázu (uhol φ). <b>Globálnu</b> fázu e^{iγ} celého stavu nevidno — nemení žiadne P(…) ani Blochov vektor, preto je principiálne nemerateľná.',
        'The Bloch sphere shows only the <b>relative</b> phase (the angle φ). The <b>global</b> phase e^{iγ} of the whole state is invisible — it changes no P(…) and no Bloch vector, so it is fundamentally unmeasurable.',
        'Сфера Блоха показує лише <b>відносну</b> фазу (кут φ). <b>Глобальну</b> фазу e^{iγ} усього стану не видно — вона не змінює жодного P(…) ані вектора Блоха, тож принципово невимірна.'), 'tip'),
      el('h4', null, tr('⏱ Operátor časového vývoja Û(t)', '⏱ Time-evolution operator Û(t)', '⏱ Оператор часової еволюції Û(t)')),
      this.slEvo = UI.slider(tr('uhol precesie ωt', 'precession angle ωt', 'кут прецесії ωt'), 0, 360, 5, this.evoDeg, (v) => { this.evoDeg = v; return Fmt.num(v, 0) + '°'; }),
      UI.row(UI.button(tr('⏱ Û(t) = R_z(ωt)', '⏱ Û(t) = R_z(ωt)', '⏱ Û(t) = R_z(ωt)'), () => this.evolve(this.evoDeg)),
        UI.button((this.precess ? '⏸ ' : '▶ ') + tr('voľná precesia', 'free precession', 'вільна прецесія'), () => this.togglePrecess())),
      UI.info(tr('Û(t) = e^{−iĤt/ħ}. V stálom poli B₀ (Ĥ = −½ħω σ_z) je to R_z(ωt): Blochov vektor voľne precesuje okolo osi z, relatívna fáza rastie, ale P(0), P(1) sa nemenia.',
        'Û(t) = e^{−iĤt/ħ}. In a steady field B₀ (Ĥ = −½ħω σ_z) this is R_z(ωt): the Bloch vector freely precesses about z, the relative phase grows, but P(0), P(1) stay unchanged.',
        'Û(t) = e^{−iĤt/ħ}. У сталому полі B₀ (Ĥ = −½ħω σ_z) це R_z(ωt): вектор Блоха вільно прецесує навколо z, відносна фаза зростає, але P(0), P(1) не змінюються.'), 'tip'),
      el('h4', null, tr('📡 Meranie (kolaps)', '📡 Measurement (collapse)', '📡 Вимірювання (колапс)')),
      UI.row(measBtn('Z', [0, 0, 1]), measBtn('X', [1, 0, 0]), measBtn('Y', [0, 1, 0])),
      UI.info(tr('Meranie pozdĺž osi n dá „+1“ s pravdepodobnosťou (1 + r·n)/2 a stav skolabuje na |±n⟩. Globálna fáza tieto pravdepodobnosti nijako neovplyvní.',
        'Measuring along axis n gives “+1” with probability (1 + r·n)/2 and the state collapses to |±n⟩. The global phase has no effect on these probabilities.',
        'Вимірювання вздовж осі n дає «+1» з імовірністю (1 + r·n)/2, і стан колапсує до |±n⟩. Глобальна фаза ніяк не впливає на ці ймовірності.'), 'tip'),
      el('h4', null, tr('⚡ RF impulz (ako v NMR dielni)', '⚡ RF pulse (as in the NMR workshop)', '⚡ РЧ-імпульс (як у ЯМР-майстерні)')),
      this.slI = UI.slider(tr('prúd v cievke I (A)', 'coil current I (A)', 'струм у котушці I (А)'), 0, 2, 0.05, this.I, (v) => { this.I = v; this.updRead(); return Fmt.num(v, 2) + ' A'; }),
      this.slTau = UI.slider(tr('dĺžka impulzu τ (µs)', 'pulse length τ (µs)', 'тривалість імпульсу τ (мкс)'), 0, 40, 0.5, this.tau, (v) => { this.tau = v; this.updRead(); return Fmt.num(v, 1) + ' µs'; }),
      UI.row(...Object.keys(NMR_PHASES).map((k) => UI.button((this.phase === k ? '● ' : '○ ') + tr('fáza ', 'phase ', 'фаза ') + k, () => { this.phase = k; this.buildPanel(); }))),
      UI.row(UI.button(tr('⚡ Pustiť impulz', '⚡ Fire the pulse', '⚡ Подати імпульс'), () => this.firePulse(), 'big')),
      this.chart,
      UI.info(tr('Graf: priečny signál M<sub>⊥</sub>(t) po poslednom hradle alebo impulze (ilustračný rozpad T₂*).',
        'Chart: the transverse signal M<sub>⊥</sub>(t) after the last gate or pulse (an illustrative T₂* decay).',
        'Графік: поперечний сигнал M<sub>⊥</sub>(t) після останнього гейта чи імпульсу (ілюстративний розпад T₂*).'), 'tip'),
    ]);
    this.updRead(); this.drawTrace();
  },
  updRead() {
    if (!this.read) return;
    const r = this.anim ? this.disp() : Q.bloch(this.psi);
    const th = Math.acos(clamp(r[2], -1, 1)), phRaw = Math.atan2(r[1], r[0]), ph = phRaw < 0 ? phRaw + 2 * Math.PI : phRaw, p0 = clamp((1 + r[2]) / 2, 0, 1);
    let h = `|ψ⟩ = <b>${Q.ketString(this.psi)}</b>`
      + `<br>M = (${r.map((x) => Fmt.num(x, 2)).join(', ')}) · θ = ${Fmt.num(th * 180 / Math.PI, 0)}° · φ = ${Fmt.num(ph * 180 / Math.PI, 0)}°`
      + `<br>P(0) = ${Fmt.pct(p0)} · P(1) = ${Fmt.pct(1 - p0)}`;
    if (this.showPhase) {
      const a = this.psi[0], b = this.psi[1], norm = (x) => ((x * 180 / Math.PI) % 360 + 360) % 360;
      const ga = C.abs(a) > 1e-6 ? C.arg(a) : C.arg(b), rel = C.arg(b) - C.arg(a);
      h += `<br><span class="muted">${tr('fázy (bežne neviditeľné)', 'phases (normally invisible)', 'фази (зазвичай невидимі)')}:</span>`
        + `<br>α = ${Fmt.complex(a, 3)} · β = ${Fmt.complex(b, 3)}`
        + `<br>∠α = ${Fmt.num(norm(C.arg(a)), 0)}° · ∠β = ${Fmt.num(norm(C.arg(b)), 0)}°`
        + `<br>${tr('relatívna', 'relative', 'відносна')} Δφ = ${Fmt.num(norm(rel), 0)}° · ${tr('globálna', 'global', 'глобальна')} γ = ${Fmt.num(norm(ga), 0)}° ${tr('(skrytá)', '(hidden)', '(прихована)')}`;
    }
    h += `<br>B₁ = k·I = ${Fmt.num(NMR_K * this.I * 1000, 2)} mT · θ<sub>${tr('impulz', 'pulse', 'імпульс')}</sub> = γB₁τ = ${Fmt.num(this.flipDeg(), 1)}°`;
    if (this.lastMeas) h += `<br><span class="muted">${tr('posledné meranie', 'last measurement', 'останнє вимірювання')}: ${this.lastMeas.label} → ${this.lastMeas.plus ? '+1' : '−1'} (p = ${Fmt.pct(this.lastMeas.p)})</span>`;
    this.read.innerHTML = h;
  },
  drawTrace() {
    if (!this.chart) return;
    const f = this.fid;
    UI.drawChart(this.chart, { x0: 0, x1: 16, y0: -1.05, y1: 1.05, xlabel: tr('čas po poslednom hradle (ms)', 'time after the last gate (ms)', 'час після останнього гейта (мс)'),
      xticks: [[0, '0'], [4, '4'], [8, '8'], [12, '12'], [16, '16']], yticks: [[-1, '−1'], [0, '0'], [1, '1']],
      curves: f ? [{ f: (t) => f.Mperp * Math.exp(-t / 4) * Math.cos(2 * Math.PI * 0.4 * t + f.phi0), color: '#fb6' }] : [],
      legend: f ? [['#fb6', f.label]] : [] });
  },

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.06, 0], 0, [13, 0.1, 9]), [0.14, 0.17, 0.22], { pattern: 1 });
    const c = [0, 1.6, 0], pulse = this.pulsing > 0 || !!this.anim;
    for (const s of [-1, 1]) r.draw('cylinder', M4.trs([0, s > 0 ? 3.55 : -0.05, 0], 0, [1.9, 0.35, 1.9]), s > 0 ? [0.75, 0.3, 0.3] : [0.3, 0.4, 0.8], { pattern: 4 });
    for (const a of [0.8, 2.4, 4.0, 5.6]) r.draw('box', M4.trs([Math.cos(a) * 1.7, 1.75, Math.sin(a) * 1.7], 0, [0.25, 3.5, 0.25]), [0.4, 0.42, 0.48]);
    r.arrow([-2.4, 0.4, 0], [-2.4, 3.2, 0], [0.5, 0.8, 1], 0.06);
    UI.label('qB0', [-2.4, 3.55, 0], 'B₀', 'ket');
    UI.hot([0, 3.6, 0], tr('<b>Magnet</b> — stále pole B₀ (ako permanentný magnet v SpinQ, ≈ 1 T). Určuje os precesie aj os merania Z.', '<b>Magnet</b> — a steady field B₀ (like the permanent magnet in a SpinQ, ≈ 1 T). It sets the precession axis and the Z measurement axis.', '<b>Магніт</b> — стале поле B₀ (як постійний магніт у SpinQ, ≈ 1 Тл). Задає вісь прецесії та вісь вимірювання Z.'), 60);
    r.draw('cylinder', M4.trs([0, 0.4, 0], 0, [0.22, 2.6, 0.22]), [0.8, 0.9, 1], { alpha: 0.3 });
    for (const s of [-1, 1]) {
      const p = [s * 0.95, 1.6, 0];
      r.draw('torus', M4.orient(p, [1, 0, 0], 0.75), pulse ? [1, 0.75, 0.25] : [0.75, 0.5, 0.25], { emissive: pulse ? 1 : 0.1 });
      if (pulse) for (let k = 0; k < 6; k++) { const a = this.t * 9 + k * 1.05; r.sphere(V3.add(p, [0, Math.cos(a) * 0.75, Math.sin(a) * 0.75]), 0.05, [1, 0.95, 0.5], { emissive: 1, unlit: 1 }); }
    }
    r.arrow([1.9, 1.6, 0], [2.6, 1.6, 0], pulse ? [1, 0.85, 0.3] : [0.45, 0.4, 0.3], 0.04, { emissive: pulse ? 0.8 : 0 });
    UI.label('qB1', [2.95, 1.6, 0], pulse ? tr('B₁ (impulz!)', 'B₁ (pulse!)', 'B₁ (імпульс!)') : tr('RF cievka', 'RF coil', 'РЧ-котушка'), pulse ? 'prompt' : 'axis');
    UI.hot([0.95, 1.6, 0], tr('<b>RF cievka</b> — impulz vytvorí B₁ ⟂ B₀ a preklopí vektor o θ = γB₁τ.', '<b>RF coil</b> — a pulse creates B₁ ⟂ B₀ and tips the vector by θ = γB₁τ.', '<b>РЧ-котушка</b> — імпульс створює B₁ ⟂ B₀ і відхиляє вектор на θ = γB₁τ.'), 50);
    Bloch.draw(r, c, 1.15, this.disp(), { labelFn: UI.label.bind(UI), key: 'q', axisNames: true, bars: true });
  },
};
