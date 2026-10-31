'use strict';
// LEVEL 14 (poradie 12) — Reťaz superpozícií (mentor: Jurij Manin)
// Ľahší vizualizačný level (prednáška 7): tenzorový súčin, rast 2ⁿ, GHZ reťaz, lokálne hradlo na celý register.
// Dialógy aj kvízy sú inline cez tr() — nepotrebuje úpravy lang/*.csv.

// Spoločné ľahké zakončenie pre nové vizualizačné levely (bez plnej hodnotenej skúšky s pascami).
// Definované tu, lebo l14 sa načíta ako prvý z nových levelov; ostatné ho používajú za behu.
function finishLight(L, closing) {
  UI.panelHide();
  const k = L.mistakes;
  const stars = byDiff(k <= 1 ? 3 : k <= 3 ? 2 : 1, k === 0 ? 3 : k <= 2 ? 2 : 1, k === 0 ? 3 : k <= 1 ? 2 : 1);
  const res = Learn.finish(L, stars);
  const rating = res.reviewed ? '📖' : '★'.repeat(res.stars) + '☆'.repeat(3 - res.stars);
  const head = { who: `🎯 ${L.mentor}`, face: L.face, text: tr(`Hodnotenie: ${rating} · chýb: ${L.mistakes}. Toto slovo moci máš.`, `Rating: ${rating} · mistakes: ${L.mistakes}. This Word of Power is yours.`, `Оцінка: ${rating} · помилок: ${L.mistakes}. Це слово сили — твоє.`) };
  L.say([...closing, head, res.card].filter(Boolean), () => Game.backToHub());
}

class L14Chain extends Level {
  get steps() { return [this.intro, this.tensor, this.growth, this.ghz, this.local]; }

  setup() {
    this.cam = new OrbitCam([0, 0.6, 0], 9, 0.5, 0.3, 4, 16);
    this.n = 2;        // počet qubitov v reťazi
    this.phase = 'intro';
    this.flip = -1;    // ktorý qubit práve „preklopí“ lokálne hradlo (animácia)
  }

  intro() {
    this.phase = 'intro';
    this.quest(tr('Vypočuj si Manina', 'Listen to Manin', 'Послухай Маніна'), { easy: tr('🪢 reťaz qubitov', '🪢 chain of qubits', '🪢 ланцюг кубітів'), hard: tr('|q₁⟩⊗|q₂⟩⊗… ', '|q₁⟩⊗|q₂⟩⊗…', '|q₁⟩⊗|q₂⟩⊗…') });
    this.say([
      tr('Jeden qubit je šípka v guli. Ale sila kvantového počítača začína až vtedy, keď ich spojíme do reťaze.',
        'A single qubit is an arrow in a ball. But the power of a quantum computer begins only when we chain them together.',
        'Один кубіт — це стрілка в кулі. Але сила квантового комп’ютера починається аж тоді, коли ми їх з’єднаємо в ланцюг.'),
      tr('Reťaz skladáme tenzorovým súčinom ⊗. Dva qubity majú štyri bázové stavy: |00⟩, |01⟩, |10⟩, |11⟩.',
        'We chain them with the tensor product ⊗. Two qubits have four basis states: |00⟩, |01⟩, |10⟩, |11⟩.',
        'З’єднуємо тензорним добутком ⊗. Два кубіти мають чотири базові стани: |00⟩, |01⟩, |10⟩, |11⟩.'),
      tr('Každému zodpovedá vlastná komplexná amplitúda. Poďme sa pozrieť, ako rýchlo ich pribúda.',
        'Each has its own complex amplitude. Let us see how fast their number grows.',
        'Кожному відповідає власна комплексна амплітуда. Погляньмо, як швидко їх більшає.'),
    ], () => this.next());
  }

  tensor() {
    this.phase = 'tensor';
    this.n = 2;
    this.quest(tr('Zlož dva qubity tenzorovým súčinom', 'Combine two qubits with the tensor product', 'Склади два кубіти тензорним добутком'), { easy: tr('⊗ dvoch qubitov', '⊗ of two qubits', '⊗ двох кубітів'), hard: tr('|+⟩⊗|0⟩ = (|00⟩+|10⟩)/√2', '|+⟩⊗|0⟩ = (|00⟩+|10⟩)/√2', '|+⟩⊗|0⟩ = (|00⟩+|10⟩)/√2') });
    this.say([
      tr('Prvý qubit je v superpozícii |+⟩ = (|0⟩+|1⟩)/√2, druhý je čisté |0⟩.',
        'The first qubit is in the superposition |+⟩ = (|0⟩+|1⟩)/√2, the second is a plain |0⟩.',
        'Перший кубіт у суперпозиції |+⟩ = (|0⟩+|1⟩)/√2, другий — чисте |0⟩.'),
    ], () => this.ask({
      q: tr('Čo dá tenzorový súčin |+⟩ ⊗ |0⟩?', 'What does the tensor product |+⟩ ⊗ |0⟩ give?', 'Що дає тензорний добуток |+⟩ ⊗ |0⟩?'),
      options: [
        tr('(|00⟩ + |10⟩)/√2', '(|00⟩ + |10⟩)/√2', '(|00⟩ + |10⟩)/√2'),
        tr('(|00⟩ + |11⟩)/√2', '(|00⟩ + |11⟩)/√2', '(|00⟩ + |11⟩)/√2'),
        tr('|0⟩ + |0⟩', '|0⟩ + |0⟩', '|0⟩ + |0⟩'),
        tr('(|01⟩ + |10⟩)/√2', '(|01⟩ + |10⟩)/√2', '(|01⟩ + |10⟩)/√2'),
      ],
      correct: 0, weak: 2,
      why: tr('Roznásobíme člen po člene: (|0⟩+|1⟩)/√2 ⊗ |0⟩ = (|0⟩|0⟩ + |1⟩|0⟩)/√2 = (|00⟩+|10⟩)/√2.',
        'Expand term by term: (|0⟩+|1⟩)/√2 ⊗ |0⟩ = (|0⟩|0⟩ + |1⟩|0⟩)/√2 = (|00⟩+|10⟩)/√2.',
        'Розкриваємо почленно: (|0⟩+|1⟩)/√2 ⊗ |0⟩ = (|0⟩|0⟩ + |1⟩|0⟩)/√2 = (|00⟩+|10⟩)/√2.'),
      whyWrong: { 1: tr('To by bol previazaný (Bellov) stav — ten sa NEDÁ zapísať ako jeden tenzorový súčin.', 'That would be an entangled (Bell) state — it CANNOT be written as a single tensor product.', 'Це був би сплутаний (Белла) стан — його НЕ можна записати як один тензорний добуток.') },
    }, () => { this.grant(['tensorn']); this.next(); }));
  }

  growth() {
    this.phase = 'growth';
    this.quest(tr('Sleduj rast stavového priestoru', 'Watch the state space grow', 'Спостерігай зростання простору станів'), { easy: tr('2ⁿ amplitúd', '2ⁿ amplitudes', '2ⁿ амплітуд'), hard: tr('n qubitov → 2ⁿ amplitúd', 'n qubits → 2ⁿ amplitudes', 'n кубітів → 2ⁿ амплітуд') });
    this.say([
      tr('Každý ďalší qubit ZDVOJNÁSOBÍ počet amplitúd: 1 qubit → 2, 2 → 4, 3 → 8, 10 → 1024…',
        'Each extra qubit DOUBLES the number of amplitudes: 1 qubit → 2, 2 → 4, 3 → 8, 10 → 1024…',
        'Кожен додатковий кубіт ПОДВОЮЄ кількість амплітуд: 1 кубіт → 2, 2 → 4, 3 → 8, 10 → 1024…'),
      tr('Pri 300 qubitoch je amplitúd viac než atómov vo vesmíre. Odtiaľ pochádza kvantová sila.',
        'At 300 qubits there are more amplitudes than atoms in the universe. This is where quantum power comes from.',
        'За 300 кубітів амплітуд більше, ніж атомів у Всесвіті. Звідси квантова сила.'),
    ], () => {
      this.n = 5; this.flip = -1;
      this.ask({
        q: tr('Koľko komplexných amplitúd opisuje stav 10 qubitov?', 'How many complex amplitudes describe the state of 10 qubits?', 'Скільки комплексних амплітуд описують стан 10 кубітів?'),
        options: [
          tr('2¹⁰ = 1024', '2¹⁰ = 1024', '2¹⁰ = 1024'),
          tr('10', '10', '10'),
          tr('100', '100', '100'),
          tr('20', '20', '20'),
        ],
        correct: 0, weak: 3,
        why: tr('n qubitov má 2ⁿ bázových stavov, teda 2ⁿ amplitúd. Pre n = 10 je to 1024.',
          'n qubits have 2ⁿ basis states, hence 2ⁿ amplitudes. For n = 10 that is 1024.',
          'n кубітів мають 2ⁿ базових станів, отже 2ⁿ амплітуд. Для n = 10 це 1024.'),
        whyWrong: { 3: tr('2·10 = 20 by bolo, keby qubity rástli lineárne — rastú však exponenciálne (2ⁿ).', '2·10 = 20 would be linear growth — but the growth is exponential (2ⁿ).', '2·10 = 20 було б за лінійного зростання — але воно експоненційне (2ⁿ).') },
      }, () => { this.grant(['dimgrow']); this.next(); });
    });
  }

  ghz() {
    this.phase = 'ghz';
    this.n = 5;
    this.quest(tr('Spleť reťaz GHZ', 'Weave the GHZ chain', 'Сплети ланцюг GHZ'), { easy: tr('(|0…0⟩+|1…1⟩)/√2', '(|0…0⟩+|1…1⟩)/√2', '(|0…0⟩+|1…1⟩)/√2'), hard: tr('GHZ: maximálne previazaná reťaz', 'GHZ: maximally entangled chain', 'GHZ: максимально сплутаний ланцюг') });
    this.say([
      tr('Reťaz GHZ je (|00…0⟩ + |11…1⟩)/√2 — buď sú VŠETKY qubity 0, alebo VŠETKY 1, nič medzi tým.',
        'The GHZ chain is (|00…0⟩ + |11…1⟩)/√2 — either ALL qubits are 0, or ALL are 1, nothing in between.',
        'Ланцюг GHZ — це (|00…0⟩ + |11…1⟩)/√2 — або ВСІ кубіти 0, або ВСІ 1, нічого поміж.'),
    ], () => this.ask({
      q: tr('V GHZ reťazi zmeriaš prvý qubit a dostaneš 1. Čo vieš o ostatných?', 'In a GHZ chain you measure the first qubit and get 1. What do you know about the rest?', 'У ланцюгу GHZ ти вимірюєш перший кубіт і отримуєш 1. Що знаєш про інші?'),
      options: [
        tr('Všetky ostatné sú tiež 1 — okamžite a s istotou.', 'All the others are also 1 — instantly and with certainty.', 'Усі інші теж 1 — миттєво й напевно.'),
        tr('Každý ostatný je stále 50/50 nezávisle.', 'Each of the others is still 50/50 independently.', 'Кожен інший досі 50/50 незалежно.'),
        tr('Polovica bude 0 a polovica 1.', 'Half will be 0 and half 1.', 'Половина буде 0, половина 1.'),
        tr('Nič — meranie jedného qubitu neovplyvní ostatné.', 'Nothing — measuring one qubit does not affect the others.', 'Нічого — вимірювання одного кубіта не впливає на інші.'),
      ],
      correct: 0, weak: 3,
      why: tr('GHZ pripúšťa len |00…0⟩ a |11…1⟩. Výsledok 1 na prvom vylúči vetvu samých núl, takže všetky ostatné sú 1.',
        'GHZ allows only |00…0⟩ and |11…1⟩. A 1 on the first rules out the all-zeros branch, so all the rest are 1.',
        'GHZ допускає лише |00…0⟩ і |11…1⟩. Результат 1 на першому виключає гілку самих нулів, тож усі інші — 1.'),
      whyWrong: { 1: tr('Boli by nezávislé len keby šlo o súčin; GHZ je však previazaný stav.', 'They would be independent only for a product state; GHZ is entangled.', 'Вони були б незалежні лише для добутку станів; GHZ — сплутаний.') },
    }, () => { this.grant(['ghz']); this.next(); }));
  }

  local() {
    this.phase = 'local';
    this.n = 5;
    this.quest(tr('Lokálne hradlo mení celý register', 'A local gate reshapes the whole register', 'Локальний гейт змінює весь регістр'), { easy: tr('U⊗I⊗…', 'U⊗I⊗…', 'U⊗I⊗…'), hard: tr('X na 1. qubite: |0…0⟩ → |10…0⟩', 'X on qubit 1: |0…0⟩ → |10…0⟩', 'X на 1-му кубіті: |0…0⟩ → |10…0⟩') });
    this.flip = 0;
    this.say([
      tr('Hradlo pôsobiace na jediný qubit (napr. X na prvý) matematicky pôsobí na CELÝ register ako U⊗I⊗I⊗…',
        'A gate acting on a single qubit (say X on the first) mathematically acts on the WHOLE register as U⊗I⊗I⊗…',
        'Гейт, що діє на один кубіт (напр. X на перший), математично діє на ВЕСЬ регістр як U⊗I⊗I⊗…'),
    ], () => this.ask({
      q: tr('Na reťaz |000⟩ aplikuješ hradlo X iba na prostredný qubit. Čo dostaneš?', 'You apply the gate X to only the middle qubit of the chain |000⟩. What do you get?', 'До ланцюга |000⟩ ти застосовуєш гейт X лише до середнього кубіта. Що отримаєш?'),
      options: [
        tr('|010⟩', '|010⟩', '|010⟩'),
        tr('|111⟩', '|111⟩', '|111⟩'),
        tr('|100⟩', '|100⟩', '|100⟩'),
        tr('|000⟩ (nič sa nezmení)', '|000⟩ (nothing changes)', '|000⟩ (нічого не зміниться)'),
      ],
      correct: 0, weak: 3,
      why: tr('X preklopí len svoj qubit (0↔1), ostatné nechá cez I. Prostredná pozícia: |000⟩ → |010⟩.',
        'X flips only its own qubit (0↔1), leaving the rest via I. Middle position: |000⟩ → |010⟩.',
        'X перевертає лише свій кубіт (0↔1), інші лишає через I. Середня позиція: |000⟩ → |010⟩.'),
      whyWrong: { 1: tr('X je lokálne — nepreklopí všetky tri qubity naraz.', 'X is local — it does not flip all three qubits at once.', 'X локальний — не перевертає всі три кубіти одразу.') },
    }, () => { this.grant(['manin']); this.next(); }));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Výborne. Pochopil(a) si, že reťazenie superpozícií je zdrojom exponenciálnej sily — aj jej úskalí.',
        'Well done. You have grasped that chaining superpositions is the source of exponential power — and of its pitfalls.',
        'Чудово. Ти зрозумів(-ла), що ланцюг суперпозицій — джерело експоненційної сили, а також її пасток.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // reťaz qubitov ako prstence superpozície spojené väzbami; GHZ a lokálne hradlo zvýraznia stav
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.2, 0], 0, 11), [0.18, 0.22, 0.26], { pattern: 1 });
    const n = this.n, span = Math.min(n - 1, 6) * 2.2, x0 = -span / 2;
    const ghz = this.phase === 'ghz', both = (0.5 + 0.5 * Math.sin(this.t * 1.5));
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? 0 : x0 + i / (n - 1) * span, c = [x, 0, 0];
      // väzba na suseda (tenzorový súčin / previazanie)
      if (i > 0) {
        const px = n === 1 ? 0 : x0 + (i - 1) / (n - 1) * span;
        r.rod([px, 0, 0], [x, 0, 0], ghz ? [0.5, 0.85, 1] : [0.45, 0.5, 0.6], 0.04, { emissive: ghz ? 0.4 : 0.1 });
      }
      // guľa qubitu (priehľadná) a jeho šípka
      r.sphere(c, 0.7, [0.4, 0.55, 1], { alpha: 0.14 });
      r.draw('circle', M4.trs(c, 0, 0.7), [0.5, 0.7, 1], { alpha: 0.6 });
      let dir;
      if (this.phase === 'local' && i === this.flip) dir = [0, -1, 0];           // práve preklopený (X)
      else if (ghz) dir = [0, both > 0.5 ? 0.9 : -0.9, 0];                        // GHZ: všetky hore alebo všetky dole naraz
      else { const a = this.t * 0.9 + i * 0.6; dir = [Math.cos(a) * 0.9, 0.1, Math.sin(a) * 0.9]; } // nezávislé superpozície
      const tip = V3.add(c, V3.scale(V3.norm(dir), 0.7));
      r.arrow(c, tip, i === this.flip && this.phase === 'local' ? [1, 0.45, 0.35] : [1, 0.85, 0.3], 0.05, { emissive: 0.5 });
      UI.label('q' + i, V3.add(c, [0, 1.15, 0]), `q${i + 1}`, 'npc small');
    }
    // počítadlo amplitúd
    const amps = Math.pow(2, Math.min(n, 12));
    UI.hot([0, -0.9, 0], tr(`<b>${n} qubitov</b> → 2<sup>${n}</sup> = ${amps} amplitúd`, `<b>${n} qubits</b> → 2<sup>${n}</sup> = ${amps} amplitudes`, `<b>${n} кубітів</b> → 2<sup>${n}</sup> = ${amps} амплітуд`), 50);
    // Manin
    const mp = [x0 - 2.4, 0.2, 1.5];
    r.sphere(V3.add(mp, [0, 1.6, 0]), 0.32, [0.95, 0.85, 0.75], { emissive: 0.1 });
    r.draw('cylinder', M4.trs(mp, 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [0.5, 0.82, 0.72], 0.8));
    UI.label('manin', V3.add(mp, [0, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', CODEX.find((c) => c.id === 'manin') ? CODEX.find((c) => c.id === 'manin').text : null);
  }
}
