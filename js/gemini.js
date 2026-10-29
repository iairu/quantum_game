'use strict';
// SpinQ Gemini — voľná dielňa pre DVA qubity (2-spinový NMR), podľa prednášky 7
// „Previazanosť ako výpočtový zdroj: Bellov stav a jeho fyzikálna realizácia na SpinQ Gemini“ (P. Ballo).
// Qubity = jadrá ¹H (A) a ³¹P (B) v molekule dimetylfosfitu, spojené skalárnou J-väzbou.
// Interaktívne: priprav Bellov stav H→CNOT, vlož oneskorenie (podmienená fázová evolúcia),
// vyskúšaj alternatívnu prípravu √X·√Y·√Z a pozeraj maticu hustoty ρ, vernosť F a koherenciu ρ₀₀,₁₁.
// Tri tlačidlá „Experiment I/II/III“ prehrajú ideálny obvod a ukážu reálne NAMERANÉ hodnoty z prednášky.

const Gemini = {
  num: 'gemini', // nečíselné id scény — Hub, mapa a uloženie pozície ho (ako pri SpinQ) ignorujú
  title: tr('🧫 SpinQ Gemini — dva qubity', '🧫 SpinQ Gemini — two qubits', '🧫 SpinQ Gemini — два кубіти'),
  request() {}, // dielňa sa neriadi obťažnosťou ani typom hry

  // približné parametre zariadenia z prednášky (SpinQ Gemini, ¹H + ³¹P)
  fH: 27.19, fP: 11.01, // rezonančné frekvencie (MHz)
  Jhz: 126, // hrubý prevod fázového posunu z experimentu II na frekvenciu (Hz) — nie priamo J-väzba
  phiplus: () => [C.of(s2), C.of(0), C.of(0), C.of(s2)], // cieľ |Φ⁺⟩ = (|00⟩ + |11⟩)/√2

  enter() {
    this.cam = new OrbitCam([0, 2.1, 0], 12, 0.5, 0.26, 6, 24);
    this.psi = Q2.zero();
    this.rA = [0, 0, 1]; this.rB = [0, 0, 1];
    this.seq = []; this.pulsing = 0; this.t = 0; this.tau = 2000; this.exp = null;
    UI.setHud(this.title, tr('Voľná hra pre dva NMR qubity — priprav Bellov stav a skús tri experimenty z prednášky.',
      'Free play with two NMR qubits — prepare a Bell state and try the three experiments from the lecture.',
      'Вільна гра з двома ЯМР-кубітами — створи стан Белла й спробуй три експерименти з лекції.'));
    this.buildPanel();
  },
  exit() { UI.panelHide(); },

  // ---------- operácie na stave ----------
  apply(fn, label, exp) {
    this.psi = fn(this.psi);
    if (label) this.seq.push(label);
    this.pulsing = 1; Sound.sfx('cast');
    this.exp = exp || null; // ručná úprava zruší označenie experimentu, preset ho nastaví
    this.refresh();
  },
  gA(U, label) { this.apply((p) => Q2.apply1(U, 0, p), label); },
  gB(U, label) { this.apply((p) => Q2.apply1(U, 1, p), label); },
  cnot() { this.apply((p) => Q2.cnot(p), 'CNOT'); },
  reset() { this.psi = Q2.zero(); this.seq = []; this.exp = null; this.pulsing = 0; this.refresh(); },
  // oneskorenie: počas voľného vývoja pribudne qubitu A relatívna fáza φ (znamienko je konvenčné;
  // veľkosť zodpovedá hrubému prevodu ~126 Hz z experimentu II: 2000 µs → ≈ štvrťotáčka)
  delay(tau) {
    const phi = -2 * Math.PI * this.Jhz * tau * 1e-6;
    this.apply((p) => Q2.apply1(Gate.Rz(phi), 0, p), tr(`δt ${Fmt.num(tau, 0)} µs`, `δt ${Fmt.num(tau, 0)} µs`, `δt ${Fmt.num(tau, 0)} мкс`));
  },

  // tri experimenty z prednášky: ideálny obvod + reálne namerané čísla (efektívna matica hustoty)
  experiments() {
    return [
      { id: 'I', name: tr('Experiment I — štandardná príprava', 'Experiment I — standard preparation', 'Експеримент I — стандартна підготовка'),
        run: () => { this.reset(); this.gA(Gate.Ry(Math.PI / 2), '90°y·A'); this.cnot(); this.exp = 'I'; this.refresh(); },
        meas: 'ρ₀₀,₀₀ ≈ 0,50 · ρ₁₁,₁₁ ≈ 0,49 · ρ₀₀,₁₁ ≈ 0,44 − 0,03i', F: 0.94, pt: [0.44, -0.03],
        note: tr('Obvod H → CNOT. Nameraná efektívna matica je takmer dokonalý |Φ⁺⟩ — koherentný rohový člen ρ₀₀,₁₁ je priamo viditeľný.',
          'Circuit H → CNOT. The measured effective matrix is almost a perfect |Φ⁺⟩ — the coherent corner term ρ₀₀,₁₁ is directly visible.',
          'Схема H → CNOT. Виміряна ефективна матриця — майже ідеальний |Φ⁺⟩; когерентний кутовий член ρ₀₀,₁₁ видно прямо.') },
      { id: 'II', name: tr('Experiment II — oneskorenie 2000 µs', 'Experiment II — 2000 µs delay', 'Експеримент II — затримка 2000 мкс'),
        run: () => { this.reset(); this.gA(Gate.Ry(Math.PI / 2), '90°y·A'); this.delay(2000); this.cnot(); this.exp = 'II'; this.refresh(); },
        meas: 'ρ₀₀,₁₁ ≈ 0,02 + 0,35i · |ρ₀₀,₁₁| ≈ 0,35 · arg ≈ 86,7°', F: null, pt: [0.02, 0.35],
        note: tr('Medzi H a CNOT je vložené oneskorenie 2000 µs. Stav voľne evolvuje → rohová koherencia sa v komplexnej rovine otočí o ≈ štvrťotáčku na ≈ (|00⟩ − i|11⟩)/√2 a mierne zoslabne.',
          'A 2000 µs delay sits between H and CNOT. The state evolves freely → the corner coherence rotates by ≈ a quarter turn in the complex plane to ≈ (|00⟩ − i|11⟩)/√2 and weakens slightly.',
          'Між H і CNOT вставлено затримку 2000 мкс. Стан вільно еволюціонує → кутова когерентність повертається на ≈ чверть оберту в комплексній площині до ≈ (|00⟩ − i|11⟩)/√2 і трохи слабшає.') },
      { id: 'III', name: tr('Experiment III — príprava √X·√Y·√Z', 'Experiment III — √X·√Y·√Z preparation', 'Експеримент III — підготовка √X·√Y·√Z'),
        run: () => { this.reset(); this.gA(Gate.Rx(Math.PI / 2), '√X·A'); this.gA(Gate.Ry(Math.PI / 2), '√Y·A'); this.gA(Gate.Rz(Math.PI / 2), '√Z·A'); this.cnot(); this.exp = 'III'; this.refresh(); },
        meas: 'ρ₀₀,₁₁ ≈ 0,43 − 0,08i', F: 0.93, pt: [0.43, -0.08],
        note: tr('Hadamardova príprava je nahradená sledom √X·√Y·√Z (poradie rotácií je dôležité: RₓRᵧ ≠ RᵧRₓ). Iný sled fyzikálnych rotácií dáva z |0⟩ podobnú cieľovú koherenciu.',
          'The Hadamard preparation is replaced by the sequence √X·√Y·√Z (the order matters: RₓRᵧ ≠ RᵧRₓ). A different sequence of physical rotations produces a similar target coherence from |0⟩.',
          'Підготовку Адамара замінено послідовністю √X·√Y·√Z (порядок обертань важливий: RₓRᵧ ≠ RᵧRₓ). Інша послідовність фізичних обертань дає з |0⟩ подібну цільову когерентність.') },
    ];
  },

  // ---------- panel ----------
  buildPanel() {
    this.read = UI.info('');
    this.mat = el('div', 'rho-mat');
    this.chart = UI.chart(300, 150);
    const eB = this.experiments();
    UI.panelSet(this.title, [
      UI.info(tr('SpinQ Gemini je stolový 2-qubitový NMR počítač. Qubity sú jadrá ¹H (A) a ³¹P (B) v molekule dimetylfosfitu (f<sub>H</sub> ≈ 27,19 MHz, f<sub>P</sub> ≈ 11,01 MHz), prepojené skalárnou J-väzbou.',
        'SpinQ Gemini is a benchtop 2-qubit NMR computer. The qubits are the nuclei ¹H (A) and ³¹P (B) in a dimethyl phosphite molecule (f<sub>H</sub> ≈ 27.19 MHz, f<sub>P</sub> ≈ 11.01 MHz), linked by a scalar J-coupling.',
        'SpinQ Gemini — настільний 2-кубітний ЯМР-комп’ютер. Кубіти — ядра ¹H (A) та ³¹P (B) у молекулі диметилфосфіту (f<sub>H</sub> ≈ 27,19 МГц, f<sub>P</sub> ≈ 11,01 МГц), з’єднані скалярним J-зв’язком.'), 'tip'),
      el('h4', null, tr('Qubit A — ¹H (RF impulzy)', 'Qubit A — ¹H (RF pulses)', 'Кубіт A — ¹H (РЧ-імпульси)')),
      UI.row(UI.button('90°y', () => this.gA(Gate.Ry(Math.PI / 2), '90°y·A')), UI.button('90°x', () => this.gA(Gate.Rx(Math.PI / 2), '90°x·A')), UI.button('X', () => this.gA(Gate.X, 'X·A')), UI.button('Z', () => this.gA(Gate.Z, 'Z·A'))),
      el('h4', null, tr('Qubit B — ³¹P (RF impulzy)', 'Qubit B — ³¹P (RF pulses)', 'Кубіт B — ³¹P (РЧ-імпульси)')),
      UI.row(UI.button('90°y', () => this.gB(Gate.Ry(Math.PI / 2), '90°y·B')), UI.button('90°x', () => this.gB(Gate.Rx(Math.PI / 2), '90°x·B')), UI.button('X', () => this.gB(Gate.X, 'X·B')), UI.button('Z', () => this.gB(Gate.Z, 'Z·B'))),
      el('h4', null, tr('Dvojqubitová operácia', 'Two-qubit operation', 'Двокубітна операція')),
      UI.row(UI.button(tr('CNOT (A → B cez J-väzbu)', 'CNOT (A → B via J-coupling)', 'CNOT (A → B через J-зв’язок)'), () => this.cnot(), 'big'), UI.button('Reset |00⟩', () => this.reset())),
      UI.info(tr('CNOT nie je samostatná matica: zariadenie ho zloží z lokálnych RF rotácií a podmienenej fázy z J-väzby (U<sub>J</sub> pri t = 1/2J + lokálne Z-korekcie → CZ, potom H na B).',
        'CNOT is not a standalone matrix: the device builds it from local RF rotations and the conditional phase of the J-coupling (U<sub>J</sub> at t = 1/2J + local Z corrections → CZ, then H on B).',
        'CNOT — не окрема матриця: пристрій складає його з локальних РЧ-обертань і умовної фази J-зв’язку (U<sub>J</sub> при t = 1/2J + локальні Z-корекції → CZ, потім H на B).'), 'tip'),
      el('h4', null, tr('Oneskorenie medzi hradlami', 'Delay between gates', 'Затримка між гейтами')),
      this.slTau = UI.slider(tr('oneskorenie δt (µs)', 'delay δt (µs)', 'затримка δt (мкс)'), 0, 3000, 50, this.tau, (v) => { this.tau = v; return Fmt.num(v, 0) + ' µs'; }),
      UI.row(UI.button(tr('⏱ Vlož voľný vývoj δt', '⏱ Insert free evolution δt', '⏱ Вставити вільну еволюцію δt'), () => this.delay(this.tau))),
      this.read,
      this.mat,
      el('h4', null, tr('Rohová koherencia ρ₀₀,₁₁ v komplexnej rovine', 'Corner coherence ρ₀₀,₁₁ in the complex plane', 'Кутова когерентність ρ₀₀,₁₁ у комплексній площині')),
      this.chart,
      el('h4', null, tr('Experimenty z prednášky', 'Experiments from the lecture', 'Експерименти з лекції')),
      UI.row(...eB.map((e) => UI.button(e.id, () => e.run()))),
      this.expNote = UI.info(tr('Vyber experiment I, II alebo III — obvod sa prehrá a zobrazia sa reálne namerané hodnoty.', 'Pick experiment I, II or III — the circuit plays and the real measured values appear.', 'Обери експеримент I, II чи III — схема відтвориться й покажуться реальні виміряні значення.'), 'tip'),
      UI.info(tr('⚠ Pseudo-čistý stav: pri izbovej teplote je vzorka silne zmiešaná. „Pripravili sme Bellov stav“ znamená, že Bellovu koherentnú štruktúru má odchýlková časť ρ = (1−ε)I/4 + ε|Φ⁺⟩⟨Φ⁺|, nie celý fyzikálny ansámbel (previazaný je až pre ε > 1/3).',
        '⚠ Pseudo-pure state: at room temperature the sample is strongly mixed. “We prepared a Bell state” means the Bell coherent structure lives in the deviation part ρ = (1−ε)I/4 + ε|Φ⁺⟩⟨Φ⁺|, not the whole physical ensemble (entangled only for ε > 1/3).',
        '⚠ Псевдочистий стан: за кімнатної температури зразок сильно змішаний. «Ми створили стан Белла» означає, що беллівську когерентну структуру має відхилкова частина ρ = (1−ε)I/4 + ε|Φ⁺⟩⟨Φ⁺|, а не весь фізичний ансамбль (сплутаний лише при ε > 1/3).'), 'tip'),
      UI.info(tr('Tomografia: všeobecná 2-qubitová ρ má 15 reálnych parametrov (3 + 3 lokálne, 9 korelácií). Protokol Gemini ich získa zo 6 typov záznamu (rôzne readout impulzy a detekcia na ¹H / ³¹P).',
        'Tomography: a general 2-qubit ρ has 15 real parameters (3 + 3 local, 9 correlations). The Gemini protocol reconstructs them from 6 record types (different readout pulses and detection on ¹H / ³¹P).',
        'Томографія: загальна 2-кубітна ρ має 15 дійсних параметрів (3 + 3 локальні, 9 кореляцій). Протокол Gemini відновлює їх із 6 типів запису (різні readout-імпульси й детекція на ¹H / ³¹P).'), 'tip'),
    ]);
    this.refresh();
  },

  // matica hustoty efektívneho stavu ρ = |ψ⟩⟨ψ| (4×4) ako malá tabuľka s vyznačenou koherenciou
  matHtml() {
    const psi = this.psi, kets = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
    let h = '<table class="rho"><tr><td></td>' + kets.map((k) => `<th>⟨${k.slice(1)}</th>`).join('') + '</tr>';
    for (let i = 0; i < 4; i++) {
      h += `<tr><th>${kets[i]}</th>`;
      for (let j = 0; j < 4; j++) {
        const e = C.mul(psi[i], C.conj(psi[j])), corner = (i === 0 && j === 3) || (i === 3 && j === 0), diag = i === j;
        const cls = corner ? ' class="coh"' : diag ? ' class="pop"' : '';
        h += `<td${cls}>${Fmt.complex(e, 2)}</td>`;
      }
      h += '</tr>';
    }
    return h + '</table>';
  },

  refresh() {
    if (!this.read) return;
    const psi = this.psi, coh = C.mul(psi[0], C.conj(psi[3])), mag = C.abs(coh), ar = C.arg(coh) * 180 / Math.PI;
    const F = C.abs2(C.scale(C.add(psi[0], psi[3]), s2)), ent = Q2.entangled(psi);
    this.read.innerHTML = `<b>|ψ⟩ = ${Q2.ketString(psi)}</b>`
      + `<br>P(00) = ${Fmt.pct(C.abs2(psi[0]))} · P(01) = ${Fmt.pct(C.abs2(psi[1]))} · P(10) = ${Fmt.pct(C.abs2(psi[2]))} · P(11) = ${Fmt.pct(C.abs2(psi[3]))}`
      + `<br>ρ₀₀,₁₁ = ${Fmt.complex(coh, 2)} · |ρ₀₀,₁₁| = ${Fmt.num(mag, 2)} · arg = ${Fmt.num(ar, 0)}°`
      + `<br>${tr('vernosť s |Φ⁺⟩', 'fidelity with |Φ⁺⟩', 'вірність з |Φ⁺⟩')} F = <b>${Fmt.num(F, 2)}</b>`
      + (ent ? tr(' · 🔗 <b>previazané</b>', ' · 🔗 <b>entangled</b>', ' · 🔗 <b>сплутані</b>') : tr(' · produktový stav', ' · product state', ' · добутковий стан'))
      + (this.seq.length ? `<br><span class="muted">${this.seq.join(' → ')}</span>` : '');
    this.mat.innerHTML = this.matHtml();
    if (this.expNote) {
      const e = this.exp && this.experiments().find((x) => x.id === this.exp);
      this.expNote.innerHTML = e
        ? `<b>${e.name}</b><br>${tr('Namerané', 'Measured', 'Виміряно')}: ${e.meas}${e.F != null ? ` → F ≈ ${Fmt.num(e.F, 2)}` : ''}<br>${e.note}`
        : tr('Vyber experiment I, II alebo III — obvod sa prehrá a zobrazia sa reálne namerané hodnoty.', 'Pick experiment I, II or III — the circuit plays and the real measured values appear.', 'Обери експеримент I, II чи III — схема відтвориться й покажуться реальні виміряні значення.');
    }
    this.drawPhasor();
  },
  drawPhasor() {
    if (!this.chart) return;
    const coh = C.mul(this.psi[0], C.conj(this.psi[3])), R = 0.5;
    const eB = this.experiments(), col = { I: '#4f8cff', II: '#ff7da8', III: '#4fe0b0' };
    UI.drawChart(this.chart, {
      x0: -0.6, x1: 0.6, y0: -0.6, y1: 0.6,
      xticks: [[-0.5, '−½'], [0, 'Re'], [0.5, '½']], yticks: [[-0.5, '−½'], [0, 'Im'], [0.5, '½']],
      hlines: [{ y: 0, color: '#2a3356' }], vlines: [{ x: 0, color: '#2a3356' }],
      curves: [{ f: (x) => (Math.abs(x) < R ? Math.sqrt(R * R - x * x) : 0), color: '#39436e', width: 1 },
               { f: (x) => (Math.abs(x) < R ? -Math.sqrt(R * R - x * x) : 0), color: '#39436e', width: 1 }],
      points: [
        ...eB.map((e) => ({ x: e.pt[0], y: e.pt[1], r: 5, color: col[e.id] })),
        { x: coh[0], y: coh[1], r: 6, color: '#ffd25a' },
      ],
      legend: [['#ffd25a', tr('teraz', 'now', 'зараз')], ['#4f8cff', 'I'], ['#ff7da8', 'II'], ['#4fe0b0', 'III']],
    });
  },

  update(dt) {
    this.t += dt;
    this.pulsing = Math.max(0, this.pulsing - dt * 1.2);
    const k = Math.min(1, dt * 5);
    this.rA = V3.lerp(this.rA, Q2.reducedBloch(this.psi, 0), k);
    this.rB = V3.lerp(this.rB, Q2.reducedBloch(this.psi, 1), k);
  },

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.0, 0], 0, 60), [0.06, 0.16, 0.35], { pattern: 2 });
    const pulse = this.pulsing > 0.25, ent = Q2.entangled(this.psi);
    const sides = [
      [-3.6, [-3.6, -0.9, -1.9], this.rA, 'ga', tr('¹H (A)', '¹H (A)', '¹H (A)'), '¹H'],
      [3.6, [3.6, -0.9, -1.9], this.rB, 'gb', tr('³¹P (B)', '³¹P (B)', '³¹P (B)'), '³¹P'],
    ];
    for (const [x, base, vec, key, name, nuc] of sides) {
      const c = [x, 2.3, 0.6];
      Bloch.draw(r, c, 1.2, vec, { labelFn: UI.label.bind(UI), key, labels: true, bars: true });
      UI.label('n' + key, [x, 3.9, 0.6], name, 'ket');
      Machine.nmr(r, base, 1.0, vec, { key, labelFn: UI.label.bind(UI), rf: pulse, note: nuc });
    }
    // J-väzba medzi jadrami: stály tenký spoj; pri previazaní sa rozžiari ako korelačné puto
    const a = [-2.4, 2.3, 0.6], b = [2.4, 2.3, 0.6];
    if (ent) {
      const p = 0.3 + 0.2 * Math.sin(this.t * 4);
      r.rod(a, b, [1, 0.45, 0.75], 0.07, { alpha: p, emissive: 1 });
      UI.label('glink', [0, 2.9, 0.6], tr('🔗 korelácie (nie signál!)', '🔗 correlations (not a signal!)', '🔗 кореляції (а не сигнал!)'), 'prompt');
      UI.hot([0, 2.3, 0.6], tr('<b>Korelácie, nie signál.</b> Previazanie neprenáša informáciu — reduktovaný stav každého jadra ostáva I/2. Žiadne lokálne meranie na ¹H neprezradí, čo sa deje na ³¹P.',
        '<b>Correlations, not a signal.</b> Entanglement carries no information — each nucleus’s reduced state stays I/2. No local measurement on ¹H reveals anything about ³¹P.',
        '<b>Кореляції, а не сигнал.</b> Сплутаність не переносить інформацію — редукований стан кожного ядра лишається I/2. Жодне локальне вимірювання на ¹H не викаже, що з ³¹P.'), 40);
    } else {
      r.rod(a, b, [0.55, 0.6, 0.85], 0.03, { alpha: 0.5 });
      UI.label('glink', [0, 2.6, 0.6], tr('J-väzba', 'J-coupling', 'J-зв’язок'), 'axis');
      UI.hot([0, 2.3, 0.6], tr('<b>Skalárna J-väzba</b> medzi ¹H a ³¹P: rezonancia jedného jadra závisí od stavu druhého (v spektre dublet ±J/2). Práve z nej zariadenie zloží dvojqubitové hradlo.',
        '<b>Scalar J-coupling</b> between ¹H and ³¹P: one nucleus’s resonance depends on the other’s state (a doublet ±J/2 in the spectrum). From it the device builds the two-qubit gate.',
        '<b>Скалярний J-зв’язок</b> між ¹H і ³¹P: резонанс одного ядра залежить від стану іншого (у спектрі дублет ±J/2). Саме з нього пристрій складає двокубітний гейт.'), 40);
    }
  },
};
