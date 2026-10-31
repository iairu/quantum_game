'use strict';
// LEVEL 17 (poradie 15) — Kvantová korekcia chýb (mentor: Peter Shor)
// Ľahší level: bit-flip kód, phase-flip kód, syndrómové meranie, Shorov 9-qubitový kód.
// Inline tr() + inline kvízy. Vizualizácia logického qubitu z fyzických qubitov.

class L17Qec extends Level {
  get steps() { return [this.intro, this.bitflip, this.phaseflip, this.syndrome, this.shor9]; }

  setup() {
    this.cam = new OrbitCam([0, 0.3, 0], 10, 0.5, 0.3, 5, 18);
    this.phase = 'intro';
    this.errAt = -1;     // qubit s chybou (animácia)
    this.kind = 'bit';   // 'bit' | 'phase'
  }

  intro() {
    this.phase = 'intro'; this.errAt = -1;
    this.quest(tr('Vypočuj si Shora', 'Listen to Shor', 'Послухай Шора'), { easy: tr('🛡 chrániť informáciu', '🛡 protect the information', '🛡 захистити інформацію'), hard: tr('logický qubit z viacerých fyzických', 'logical qubit from many physical', 'логічний кубіт з багатьох фізичних') });
    this.say([
      tr('Qubity sú krehké — šum ich preklopí alebo rozhádže fázu. Bez ochrany by dlhý výpočet nikdy nedobehol.',
        'Qubits are fragile — noise flips them or scrambles their phase. Without protection a long computation would never finish.',
        'Кубіти крихкі — шум перевертає їх або псує фазу. Без захисту довге обчислення ніколи не завершилося б.'),
      tr('Trik: jeden LOGICKÝ qubit zakódujeme do VIACERÝCH fyzických. Chybu potom odhalíme bez toho, aby sme zničili informáciu.',
        'The trick: we encode one LOGICAL qubit into SEVERAL physical ones. We then detect an error without destroying the information.',
        'Трюк: один ЛОГІЧНИЙ кубіт кодуємо в КІЛЬКА фізичних. Потім виявляємо помилку, не руйнуючи інформацію.'),
      tr('A pozor — kvantovo nemôžeme len „skopírovať“ qubit (zákaz klonovania). Musíme byť prefíkanejší.',
        'And beware — quantumly we cannot simply "copy" a qubit (no-cloning). We must be cleverer.',
        'І увага — квантово ми не можемо просто «скопіювати» кубіт (заборона клонування). Треба бути хитрішими.'),
    ], () => this.next());
  }

  bitflip() {
    this.phase = 'bitflip'; this.kind = 'bit'; this.errAt = 1;
    this.quest(tr('Kód proti preklopeniu bitu', 'The bit-flip code', 'Код проти перевороту біта'), { easy: tr('|0⟩→|000⟩, väčšina rozhodne', '|0⟩→|000⟩, majority wins', '|0⟩→|000⟩, вирішує більшість'), hard: tr('3 qubity, 1 chyba opraviteľná', '3 qubits, 1 error correctable', '3 кубіти, 1 помилка виправна') });
    this.say([
      tr('Najjednoduchší kód: |0⟩→|000⟩, |1⟩→|111⟩. Ak šum preklopí jeden qubit (napr. |010⟩), väčšina stále ukáže správny bit.',
        'The simplest code: |0⟩→|000⟩, |1⟩→|111⟩. If noise flips one qubit (say |010⟩), the majority still shows the right bit.',
        'Найпростіший код: |0⟩→|000⟩, |1⟩→|111⟩. Якщо шум перевертає один кубіт (напр. |010⟩), більшість усе ще показує правильний біт.'),
    ], () => this.ask({
      q: tr('Zakódovaný stav |000⟩ sa šumom zmení na |010⟩. Čo urobí korekcia?', 'The encoded state |000⟩ becomes |010⟩ due to noise. What does the correction do?', 'Закодований стан |000⟩ через шум стає |010⟩. Що робить корекція?'),
      options: [
        tr('Opraví prostredný qubit späť na 0 (väčšina je 0).', 'Fixes the middle qubit back to 0 (the majority is 0).', 'Виправляє середній кубіт назад на 0 (більшість — 0).'),
        tr('Zmeria všetky tri a zahodí stav.', 'Measures all three and discards the state.', 'Вимірює всі три й відкидає стан.'),
        tr('Preklopí všetky qubity na 1.', 'Flips all qubits to 1.', 'Перевертає всі кубіти на 1.'),
        tr('Nedá sa opraviť — informácia je stratená.', 'Cannot be fixed — the information is lost.', 'Не можна виправити — інформацію втрачено.'),
      ],
      correct: 0, weak: 3,
      why: tr('Syndrómové meranie zistí, ktorý qubit sa líši, a cielene ho preklopí späť. Logická informácia (0) zostane nedotknutá.',
        'A syndrome measurement finds which qubit differs and flips just that one back. The logical information (0) is untouched.',
        'Синдромне вимірювання визначає, який кубіт відрізняється, і перевертає саме його назад. Логічна інформація (0) лишається недоторканою.'),
      whyWrong: { 1: tr('Priame meranie všetkých qubitov by zničilo superpozíciu — práve tomu sa vyhýbame.', 'Measuring all qubits directly would destroy the superposition — exactly what we avoid.', 'Пряме вимірювання всіх кубітів зруйнувало б суперпозицію — саме цього ми уникаємо.') },
    }, () => { this.grant(['shorp', 'bitflip']); this.next(); }));
  }

  phaseflip() {
    this.phase = 'phaseflip'; this.kind = 'phase'; this.errAt = 2;
    this.quest(tr('Kód proti preklopeniu fázy', 'The phase-flip code', 'Код проти перевороту фази'), { easy: tr('fáza v báze |+⟩/|−⟩', 'phase in the |+⟩/|−⟩ basis', 'фаза в базисі |+⟩/|−⟩'), hard: tr('Hadamard prevedie Z na X', 'Hadamard turns Z into X', 'Адамар перетворює Z на X') });
    this.say([
      tr('Horšia chyba: šum nezmení bit, ale otočí ZNAMIENKO (fázu): |+⟩↔|−⟩. V klasike nič také neexistuje.',
        'A nastier error: noise does not change the bit but flips the SIGN (phase): |+⟩↔|−⟩. Nothing like this exists classically.',
        'Підступніша помилка: шум не змінює біт, а перевертає ЗНАК (фазу): |+⟩↔|−⟩. У класиці такого немає.'),
      tr('Trik: Hadamardovými hradlami prejdeme do bázy |+⟩/|−⟩, kde sa fázová chyba tvári ako obyčajné preklopenie — a to už vieme opraviť.',
        'The trick: Hadamard gates move us to the |+⟩/|−⟩ basis, where a phase error looks like an ordinary flip — which we already know how to fix.',
        'Трюк: гейтами Адамара переходимо в базис |+⟩/|−⟩, де фазова помилка виглядає як звичайний переворот — а це ми вже вміємо виправити.'),
    ], () => this.ask({
      q: tr('Ako kód proti fázovej chybe využije kód proti bitovej chybe?', 'How does the phase-flip code reuse the bit-flip code?', 'Як код проти фазової помилки використовує код проти бітової?'),
      options: [
        tr('Hadamardom prevedie fázovú chybu na bitovú a použije rovnaký trik.', 'A Hadamard converts the phase error into a bit error and uses the same trick.', 'Адамар перетворює фазову помилку на бітову й застосовує той самий трюк.'),
        tr('Jednoducho ignoruje fázu — na tej nezáleží.', 'It simply ignores the phase — phase does not matter.', 'Він просто ігнорує фазу — вона не має значення.'),
        tr('Zmeria fázu priamo voltmetrom.', 'It measures the phase directly with a voltmeter.', 'Він вимірює фазу напряму вольтметром.'),
        tr('Nepotrebuje nič — fázové chyby nevznikajú.', 'It needs nothing — phase errors do not occur.', 'Йому нічого не треба — фазові помилки не виникають.'),
      ],
      correct: 0, weak: 1,
      why: tr('Hadamard premení Z (fázu) na X (bit). V otočenej báze je fázová chyba obyčajné preklopenie, takže funguje bit-flip kód.',
        'Hadamard turns Z (phase) into X (bit). In the rotated basis a phase error is an ordinary flip, so the bit-flip code works.',
        'Адамар перетворює Z (фазу) на X (біт). У повернутому базисі фазова помилка — звичайний переворот, тож працює bit-flip код.'),
      whyWrong: { 1: tr('Na fáze veľmi záleží — práve fázová interferencia robí kvantové výpočty silnými.', 'Phase matters greatly — phase interference is what makes quantum computing powerful.', 'Фаза дуже важлива — саме фазова інтерференція робить квантові обчислення потужними.') },
    }, () => { this.grant(['phaseflipc']); this.next(); }));
  }

  syndrome() {
    this.phase = 'syndrome'; this.errAt = 1;
    this.quest(tr('Syndrómové meranie', 'Syndrome measurement', 'Синдромне вимірювання'), { easy: tr('zistí chybu, nie stav', 'detects the error, not the state', 'виявляє помилку, не стан'), hard: tr('merajú sa paritné operátory', 'parity operators are measured', 'вимірюються оператори парності') });
    this.say([
      tr('Kľúčový trik: nemeriame samotný qubit, ale PARITU dvojíc (napr. „sú qubity 1 a 2 rovnaké?“).',
        'The key trick: we do not measure the qubit itself, but the PARITY of pairs (e.g. "are qubits 1 and 2 the same?").',
        'Ключовий трюк: ми вимірюємо не сам кубіт, а ПАРНІСТЬ пар (напр. «чи однакові кубіти 1 і 2?»).'),
      tr('Výsledok (syndróm) nám povie, KDE je chyba, no neprezradí hodnotu logického qubitu. Superpozícia prežije.',
        'The result (syndrome) tells us WHERE the error is, without revealing the value of the logical qubit. The superposition survives.',
        'Результат (синдром) каже нам, ДЕ помилка, не розкриваючи значення логічного кубіта. Суперпозиція виживає.'),
    ], () => this.ask({
      q: tr('Prečo syndrómové meranie nezničí zakódovanú kvantovú informáciu?', 'Why does a syndrome measurement not destroy the encoded quantum information?', 'Чому синдромне вимірювання не руйнує закодовану квантову інформацію?'),
      options: [
        tr('Meria len paritu (vzťah medzi qubitmi), nie samotné hodnoty qubitov.', 'It measures only parity (the relation between qubits), not the qubit values themselves.', 'Воно вимірює лише парність (зв’язок між кубітами), а не самі значення кубітів.'),
        tr('Meranie sa robí veľmi rýchlo, takže nič nestihne skolabovať.', 'The measurement is done so fast that nothing collapses.', 'Вимірювання робиться так швидко, що нічого не встигає колапсувати.'),
        tr('Používa klasický voltmeter, ktorý kvantový stav nevidí.', 'It uses a classical voltmeter that cannot see the quantum state.', 'Воно використовує класичний вольтметр, який не бачить квантового стану.'),
        tr('Nezničí, lebo qubity sa predtým skopírujú.', 'It does not, because the qubits are copied beforehand.', 'Ні, бо кубіти перед цим копіюються.'),
      ],
      correct: 0, weak: 3,
      why: tr('Paritné operátory (napr. Z₁Z₂) komutujú s logickou informáciou. Dozvieš sa, či sú qubity rovnaké, ale nie akú konkrétnu hodnotu majú.',
        'Parity operators (e.g. Z₁Z₂) commute with the logical information. You learn whether qubits agree, but not their specific value.',
        'Оператори парності (напр. Z₁Z₂) комутують із логічною інформацією. Ти дізнаєшся, чи кубіти збігаються, але не їхнє конкретне значення.'),
      whyWrong: { 3: tr('Kopírovanie qubitov je zakázané (no-cloning) — korekcia naň nemôže stavať.', 'Copying qubits is forbidden (no-cloning) — correction cannot rely on it.', 'Копіювання кубітів заборонене (no-cloning) — корекція не може на нього спиратися.') },
    }, () => { this.grant(['syndrome']); this.next(); }));
  }

  shor9() {
    this.phase = 'shor9'; this.errAt = 4;
    this.quest(tr('Shorov 9-qubitový kód', 'Shor\'s 9-qubit code', '9-кубітний код Шора'), { easy: tr('bit + fáza naraz', 'bit + phase at once', 'біт + фаза разом'), hard: tr('3×3 = 9 fyzických qubitov', '3×3 = 9 physical qubits', '3×3 = 9 фізичних кубітів') });
    this.say([
      tr('Môj prvý úplný kód spojí oba triky: tri bloky po troch qubitoch. Vnútorná trojica rieši bit, vonkajšia fázu.',
        'My first complete code combines both tricks: three blocks of three qubits. The inner triple handles bit flips, the outer handles phase.',
        'Мій перший повний код поєднує обидва трюки: три блоки по три кубіти. Внутрішня трійка відповідає за біт, зовнішня — за фазу.'),
      tr('Spolu 9 fyzických qubitov nesie 1 logický a dokáže opraviť ľubovoľnú jednu chybu — bitovú aj fázovú.',
        'Together 9 physical qubits carry 1 logical one and can correct any single error — bit or phase.',
        'Разом 9 фізичних кубітів несуть 1 логічний і можуть виправити будь-яку одну помилку — бітову чи фазову.'),
    ], () => this.ask({
      q: tr('Prečo potreboval Shorov kód až 9 qubitov na jeden logický?', 'Why did Shor\'s code need as many as 9 qubits for a single logical one?', 'Чому коду Шора потрібно аж 9 кубітів на один логічний?'),
      options: [
        tr('Musí zvládnuť DVA typy chýb (bit aj fáza), preto 3 × 3.', 'It must handle TWO error types (bit and phase), hence 3 × 3.', 'Він має впоратися з ДВОМА типами помилок (біт і фаза), тому 3 × 3.'),
        tr('9 je najmenší počet qubitov v ľubovoľnom počítači.', '9 is the minimum qubit count in any computer.', '9 — мінімальна кількість кубітів у будь-якому комп’ютері.'),
        tr('Každý logický qubit vždy potrebuje presne 9 fyzických.', 'Every logical qubit always needs exactly 9 physical ones.', 'Кожен логічний кубіт завжди потребує рівно 9 фізичних.'),
        tr('Aby sa zmestil do 3D vizualizácie.', 'So it fits into a 3D visualization.', 'Щоб уміститися в 3D-візуалізацію.'),
      ],
      correct: 0, weak: 3,
      why: tr('Tri qubity chránia pred bitovou chybou; zreťazením troch takých blokov pridáme ochranu pred fázovou. 3×3 = 9.',
        'Three qubits protect against bit flips; nesting three such blocks adds phase protection. 3×3 = 9.',
        'Три кубіти захищають від бітової помилки; вкладення трьох таких блоків додає захист від фазової. 3×3 = 9.'),
      whyWrong: { 2: tr('Novšie kódy (napr. povrchové) používajú iný počet; 9 je špecifické pre tento prvý Shorov kód.', 'Newer codes (e.g. surface codes) use other counts; 9 is specific to this first Shor code.', 'Новіші коди (напр. поверхневі) використовують іншу кількість; 9 — специфічне для цього першого коду Шора.') },
    }, () => this.next()));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Výborne. Vieš, že chránime informáciu bez klonovania — paritou a redundanciou. Toto je cesta k spoľahlivým kvantovým počítačom.',
        'Well done. You know we protect information without cloning — through parity and redundancy. This is the road to reliable quantum computers.',
        'Чудово. Ти знаєш, що ми захищаємо інформацію без клонування — через парність і надмірність. Це шлях до надійних квантових комп’ютерів.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // logický qubit ako blok fyzických qubitov; chybný qubit svieti červeno, syndróm ukazuje paritné väzby
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.4, 0], 0, 8), [0.17, 0.2, 0.26], { pattern: 1 });
    const nine = (this.phase === 'shor9');
    const cols = nine ? 9 : 3, rows = nine ? 1 : 1;
    const span = 6, x0 = -span / 2;
    for (let i = 0; i < cols; i++) {
      const x = x0 + (cols === 1 ? span / 2 : i / (cols - 1) * span);
      const err = (i === this.errAt);
      const block = nine ? Math.floor(i / 3) : 0;
      const base = err ? [1, 0.35, 0.3] : (nine ? [[0.4, 0.8, 0.9], [0.5, 0.7, 1], [0.6, 0.6, 0.95]][block] : [0.45, 0.85, 0.95]);
      r.sphere([x, 0, 0], 0.45, base, { emissive: err ? 0.6 : 0.2 });
      // fázová vs bitová chyba: šípka alebo znamienko
      if (err) {
        if (this.kind === 'phase') UI.hot([x, 0.9, 0], '−', 44);
        else r.arrow([x, 0.4, 0], [x, -0.5, 0], [1, 0.6, 0.3], 0.05, { emissive: 0.4 });
      }
      // syndrómové paritné väzby medzi susedmi
      if (this.phase === 'syndrome' && i > 0) {
        const px = x0 + (i - 1) / (cols - 1) * span;
        r.rod([px, 0, 0], [x, 0, 0], [0.6, 1, 0.6], 0.04, { emissive: 0.3, pattern: 1 });
        UI.hot([(px + x) / 2, -0.7, 0], tr('parita', 'parity', 'парність'), 40);
      }
      // blokové zátvorky pre 9-qubitový kód
      if (nine && i % 3 === 0) UI.hot([x + 0.65, -0.9, 0], tr(`blok ${block + 1}`, `block ${block + 1}`, `блок ${block + 1}`), 40);
    }
    UI.hot([0, 1.4, 0], tr('1 logický qubit', '1 logical qubit', '1 логічний кубіт'), 70);
    // Shor
    const mp = [x0 - 2.2, -1.2, 1.2];
    r.sphere(V3.add(mp, [0, 1.6, 0]), 0.32, [0.95, 0.85, 0.75], { emissive: 0.1 });
    r.draw('cylinder', M4.trs(mp, 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [0.45, 0.85, 0.95], 0.8));
    const cx = CODEX.find((c) => c.id === 'shorp');
    UI.label('shorqec', V3.add(mp, [0, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}
