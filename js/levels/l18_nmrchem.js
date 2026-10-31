'use strict';
// LEVEL 18 (poradie 16) — Chémia za NMR kvantovým počítačom (mentor: Linus Pauling)
// Ľahší level: chemický posun, J-väzba (spin–spin), molekula ako register, spektrum ako čítanie.
// Nadväzuje na voľný NMR workshop (num12). Inline tr() + inline kvízy.

class L18NmrChem extends Level {
  get steps() { return [this.intro, this.shift, this.jcoupling, this.register, this.spectrum]; }

  setup() {
    this.cam = new OrbitCam([0, 0.4, 0], 9, 0.6, 0.3, 4, 16);
    this.phase = 'intro';
    this.sel = -1;      // zvýraznené jadro
  }

  intro() {
    this.phase = 'intro'; this.sel = -1;
    this.quest(tr('Vypočuj si Paulinga', 'Listen to Pauling', 'Послухай Полінга'), { easy: tr('🧪 molekula = počítač', '🧪 molecule = computer', '🧪 молекула = комп’ютер'), hard: tr('jadrové spiny ako qubity', 'nuclear spins as qubits', 'ядерні спіни як кубіти') });
    this.say([
      tr('Prvé kvantové algoritmy nebežali v čipe, ale v MOLEKULE — v kvapaline v NMR prístroji.',
        'The first quantum algorithms did not run in a chip but in a MOLECULE — a liquid in an NMR machine.',
        'Перші квантові алгоритми працювали не в чипі, а в МОЛЕКУЛІ — рідині в ЯМР-приладі.'),
      tr('Qubitmi sú jadrové spiny atómov. A to, ako sa správajú, určuje chémia — väzby a susedia každého jadra.',
        'The qubits are the nuclear spins of atoms. And how they behave is set by chemistry — the bonds and neighbours of each nucleus.',
        'Кубітами є ядерні спіни атомів. А те, як вони поводяться, визначає хімія — зв’язки й сусіди кожного ядра.'),
      tr('Poďme sa pozrieť, prečo je každý qubit v molekule „adresovateľný“ práve vďaka svojmu chemickému okoliu.',
        'Let us see why each qubit in a molecule is "addressable" precisely thanks to its chemical environment.',
        'Погляньмо, чому кожен кубіт у молекулі «адресований» саме завдяки своєму хімічному оточенню.'),
    ], () => this.next());
  }

  shift() {
    this.phase = 'shift'; this.sel = 0;
    this.quest(tr('Chemický posun', 'Chemical shift', 'Хімічний зсув'), { easy: tr('okolie mení frekvenciu', 'environment shifts the frequency', 'оточення зсуває частоту'), hard: tr('tienenie elektrónmi → iná rezonancia', 'electron shielding → different resonance', 'екранування електронами → інший резонанс') });
    this.say([
      tr('Elektróny okolo jadra ho „tienia“ pred magnetickým poľom. Rôzne okolie → mierne iná rezonančná frekvencia.',
        'Electrons around a nucleus "shield" it from the magnetic field. A different environment → a slightly different resonance frequency.',
        'Електрони навколо ядра «екранують» його від магнітного поля. Інше оточення → трохи інша резонансна частота.'),
      tr('Práve tento CHEMICKÝ POSUN dáva každému jadru vlastnú „adresu“ — vieme ho osloviť samostatným pulzom.',
        'This CHEMICAL SHIFT gives each nucleus its own "address" — we can address it with a dedicated pulse.',
        'Саме цей ХІМІЧНИЙ ЗСУВ дає кожному ядру власну «адресу» — ми можемо звернутися до нього окремим імпульсом.'),
    ], () => this.ask({
      q: tr('Prečo vieme v molekule osloviť jeden konkrétny qubit (jadro) bez toho, aby sme hýbali ostatnými?', 'Why can we address one specific qubit (nucleus) in a molecule without disturbing the others?', 'Чому ми можемо звернутися до одного конкретного кубіта (ядра) в молекулі, не чіпаючи інших?'),
      options: [
        tr('Vďaka chemickému posunu má každé jadro inú rezonančnú frekvenciu.', 'Thanks to the chemical shift each nucleus has a different resonance frequency.', 'Завдяки хімічному зсуву кожне ядро має іншу резонансну частоту.'),
        tr('Každé jadro je iný chemický prvok.', 'Each nucleus is a different chemical element.', 'Кожне ядро — інший хімічний елемент.'),
        tr('Jadrá sú od seba veľmi ďaleko.', 'The nuclei are very far apart.', 'Ядра дуже далеко одне від одного.'),
        tr('Oslovujeme ich svetlom rôznej farby.', 'We address them with light of different colours.', 'Ми звертаємося до них світлом різного кольору.'),
      ],
      correct: 0, weak: 3,
      why: tr('Aj rovnaké prvky (napr. dva vodíky) majú vďaka inému elektrónovému okoliu mierne odlišnú frekvenciu — pulz na tej frekvencii osloví len ich.',
        'Even identical elements (e.g. two hydrogens) have slightly different frequencies due to different electron environments — a pulse at that frequency addresses only them.',
        'Навіть однакові елементи (напр. два водні) мають трохи різні частоти через різне електронне оточення — імпульс на цій частоті звертається лише до них.'),
      whyWrong: { 1: tr('Nie — rozlišujeme aj dve rovnaké jadrá, ak majú iné chemické okolie.', 'No — we can distinguish even two identical nuclei if their chemical environment differs.', 'Ні — ми розрізняємо навіть два однакові ядра, якщо їхнє хімічне оточення різне.') },
    }, () => { this.grant(['pauling', 'cshift']); this.next(); }));
  }

  jcoupling() {
    this.phase = 'jcoupling'; this.sel = 1;
    this.quest(tr('J-väzba (spin–spin)', 'J-coupling (spin–spin)', 'J-зв’язок (спін–спін)'), { easy: tr('väzba prepája spiny', 'the bond couples spins', 'зв’язок поєднує спіни'), hard: tr('cez chemickú väzbu → dvojqubitové hradlá', 'through the chemical bond → two-qubit gates', 'через хімічний зв’язок → двокубітні гейти') });
    this.say([
      tr('Dve jadrá spojené chemickou väzbou na seba cítia spin suseda — to je J-väzba (spin–spinová interakcia).',
        'Two nuclei joined by a chemical bond feel each other\'s spin — this is J-coupling (the spin–spin interaction).',
        'Два ядра, з’єднані хімічним зв’язком, відчувають спін сусіда — це J-зв’язок (спін-спінова взаємодія).'),
      tr('Práve táto interakcia nám umožní spraviť DVOJQUBITOVÉ hradlo (napr. CNOT) — bez nej by qubity nevedeli „komunikovať“.',
        'This very interaction lets us build a TWO-QUBIT gate (e.g. CNOT) — without it the qubits could not "talk".',
        'Саме ця взаємодія дозволяє зробити ДВОКУБІТНИЙ гейт (напр. CNOT) — без неї кубіти не могли б «спілкуватися».'),
    ], () => this.ask({
      q: tr('Na čo je v NMR kvantovom počítači nevyhnutná J-väzba medzi jadrami?', 'What is the J-coupling between nuclei indispensable for in an NMR quantum computer?', 'Для чого в ЯМР квантовому комп’ютері необхідний J-зв’язок між ядрами?'),
      options: [
        tr('Na dvojqubitové hradlá — prepája spiny, aby sa mohli podmienene ovplyvniť.', 'For two-qubit gates — it links spins so they can conditionally affect each other.', 'Для двокубітних гейтів — поєднує спіни, щоб вони могли умовно впливати один на одного.'),
        tr('Na chladenie vzorky.', 'For cooling the sample.', 'Для охолодження зразка.'),
        tr('Na zvýšenie počtu atómov.', 'For increasing the number of atoms.', 'Для збільшення кількості атомів.'),
        tr('Na zobrazenie molekuly na displeji.', 'For showing the molecule on a display.', 'Для показу молекули на дисплеї.'),
      ],
      correct: 0, weak: 3,
      why: tr('Jednoqubitové hradlá robia pulzy; na previazanie dvoch qubitov (CNOT) treba interakciu medzi nimi — tou je práve J-väzba.',
        'Single-qubit gates come from pulses; to entangle two qubits (CNOT) you need an interaction between them — that is exactly the J-coupling.',
        'Однокубітні гейти роблять імпульси; щоб сплутати два кубіти (CNOT), потрібна взаємодія між ними — це саме J-зв’язок.'),
      whyWrong: { 1: tr('Chladenie rieši hardvér prístroja, nie chemická väzba medzi jadrami.', 'Cooling is handled by the instrument hardware, not by the chemical bond between nuclei.', 'Охолодження забезпечує апаратура приладу, а не хімічний зв’язок між ядрами.') },
    }, () => { this.grant(['jcoupling']); this.next(); }));
  }

  register() {
    this.phase = 'register'; this.sel = 2;
    this.quest(tr('Molekula ako register', 'The molecule as a register', 'Молекула як регістр'), { easy: tr('každé jadro = 1 qubit', 'each nucleus = 1 qubit', 'кожне ядро = 1 кубіт'), hard: tr('škálovanie je limit NMR', 'scaling is the NMR limit', 'масштабування — межа ЯМР') });
    this.say([
      tr('Celá molekula je teda malý register: každé adresovateľné jadro je jeden qubit, väzby sú „drôty“ medzi nimi.',
        'The whole molecule is thus a small register: each addressable nucleus is one qubit, the bonds are the "wires" between them.',
        'Уся молекула, отже, є маленьким регістром: кожне адресоване ядро — один кубіт, зв’язки — «дроти» між ними.'),
      tr('Slabina: väčšia molekula = viac qubitov, ale signál slabne a jadrá sa prekrývajú. Preto NMR počítače ostali malé.',
        'Weakness: a bigger molecule = more qubits, but the signal weakens and nuclei overlap. That is why NMR computers stayed small.',
        'Слабкість: більша молекула = більше кубітів, але сигнал слабшає й ядра перекриваються. Тому ЯМР-комп’ютери лишилися малими.'),
    ], () => this.ask({
      q: tr('Prečo sa NMR kvantové počítače (napr. ten, čo rozložil 15) nedali ľahko zväčšiť na veľa qubitov?', 'Why could NMR quantum computers (e.g. the one that factored 15) not be easily scaled to many qubits?', 'Чому ЯМР квантові комп’ютери (напр. той, що розклав 15) не вдалося легко масштабувати на багато кубітів?'),
      options: [
        tr('S viac jadrami slabne signál a frekvencie sa prekrývajú — ťažko ich adresovať.', 'With more nuclei the signal weakens and frequencies overlap — hard to address them.', 'З більшою кількістю ядер сигнал слабшає, а частоти перекриваються — важко адресувати.'),
        tr('Molekuly s viac ako 3 atómami neexistujú.', 'Molecules with more than 3 atoms do not exist.', 'Молекул із понад 3 атомами не існує.'),
        tr('NMR nevie robiť žiadne hradlá.', 'NMR cannot perform any gates.', 'ЯМР не може виконувати жодних гейтів.'),
        tr('Chýbal vhodný softvér.', 'Suitable software was missing.', 'Бракувало придатного ПЗ.'),
      ],
      correct: 0, weak: 1,
      why: tr('Signál v NMR klesá exponenciálne s počtom qubitov a rozlíšenie frekvencií sa stráca — škálovanie je fyzikálne nevýhodné.',
        'The NMR signal drops exponentially with the number of qubits and frequency resolution is lost — scaling is physically unfavourable.',
        'Сигнал у ЯМР спадає експоненційно з кількістю кубітів, а роздільність частот губиться — масштабування фізично невигідне.'),
      whyWrong: { 1: tr('Veľké molekuly bežne existujú; problém je v signáli a rozlíšení, nie v existencii molekúl.', 'Large molecules are common; the problem is signal and resolution, not the existence of molecules.', 'Великі молекули поширені; проблема в сигналі й роздільності, а не в існуванні молекул.') },
    }, () => { this.grant(['molreg']); this.next(); }));
  }

  spectrum() {
    this.phase = 'spectrum'; this.sel = -1;
    this.quest(tr('Spektrum ako čítanie', 'The spectrum as read-out', 'Спектр як зчитування'), { easy: tr('vrcholy = výsledok', 'peaks = the result', 'піки = результат'), hard: tr('merací signál → spektrálne čiary', 'measurement signal → spectral lines', 'сигнал вимірювання → спектральні лінії') });
    this.say([
      tr('Výsledok výpočtu čítame zo spektra: poloha vrcholov (chemický posun) a ich štiepenie (J-väzba) kódujú stav qubitov.',
        'We read the result from the spectrum: the peak positions (chemical shift) and their splitting (J-coupling) encode the qubit state.',
        'Результат обчислення зчитуємо зі спектра: положення піків (хімічний зсув) та їхнє розщеплення (J-зв’язок) кодують стан кубітів.'),
    ], () => this.ask({
      q: tr('Čo v NMR spektre prezrádza vzájomnú väzbu (J-väzbu) medzi dvoma qubitmi?', 'What in the NMR spectrum reveals the mutual coupling (J-coupling) between two qubits?', 'Що в ЯМР-спектрі виказує взаємний зв’язок (J-зв’язок) між двома кубітами?'),
      options: [
        tr('Rozštiepenie vrcholu na viac blízkych čiar.', 'The splitting of a peak into several nearby lines.', 'Розщеплення піка на кілька близьких ліній.'),
        tr('Celkový posun všetkých vrcholov doľava.', 'An overall shift of all peaks to the left.', 'Загальний зсув усіх піків ліворуч.'),
        tr('Zmiznutie všetkých vrcholov.', 'The disappearance of all peaks.', 'Зникнення всіх піків.'),
        tr('Farba spektra.', 'The colour of the spectrum.', 'Колір спектра.'),
      ],
      correct: 0, weak: 3,
      why: tr('J-väzba rozštiepi rezonanciu jadra na multiplet: susedný spin posunie frekvenciu hore aj dole, takže z jedného vrcholu vznikne viac čiar.',
        'J-coupling splits a nucleus\'s resonance into a multiplet: the neighbouring spin shifts the frequency up and down, so one peak becomes several lines.',
        'J-зв’язок розщеплює резонанс ядра на мультиплет: сусідній спін зсуває частоту вгору й вниз, тож один пік стає кількома лініями.'),
      whyWrong: { 3: tr('Farba so spektrálnymi čiarami NMR nesúvisí — čítame polohy a štiepenie.', 'Colour is unrelated to NMR spectral lines — we read positions and splitting.', 'Колір не пов’язаний зі спектральними лініями ЯМР — ми зчитуємо положення й розщеплення.') },
    }, () => this.next()));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Výborne. Vidíš, že za „qubitom“ v NMR počítači je naozajstná chémia — väzby, tienenie a spiny molekuly.',
        'Well done. You see that behind a "qubit" in an NMR computer lies real chemistry — the bonds, shielding and spins of a molecule.',
        'Чудово. Ти бачиш, що за «кубітом» у ЯМР-комп’ютері стоїть справжня хімія — зв’язки, екранування та спіни молекули.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // malá molekula: jadrá (gule) spojené väzbami (rody); vybrané jadro svieti; dole NMR spektrum
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.6, 0], 0, 8), [0.18, 0.2, 0.24], { pattern: 1 });
    // jadrá molekuly (reťazec H–C–C–H štýl)
    const atoms = [
      { p: [-2.4, 0.4, 0], c: [0.9, 0.9, 0.95], el: 'H' },
      { p: [-0.8, 0, 0], c: [0.4, 0.45, 0.5], el: 'C' },
      { p: [0.8, 0.2, 0], c: [0.4, 0.45, 0.5], el: 'C' },
      { p: [2.4, -0.2, 0], c: [0.9, 0.9, 0.95], el: 'H' },
    ];
    for (let i = 1; i < atoms.length; i++) {
      const hot = (this.phase === 'jcoupling' && (i === this.sel || i - 1 === this.sel));
      r.rod(atoms[i - 1].p, atoms[i].p, hot ? [0.95, 0.65, 0.4] : [0.5, 0.52, 0.58], hot ? 0.09 : 0.06, { emissive: hot ? 0.4 : 0.05 });
    }
    atoms.forEach((a, i) => {
      const sel = (i === this.sel);
      r.sphere(a.p, a.el === 'C' ? 0.5 : 0.36, sel ? [1, 0.75, 0.4] : a.c, { emissive: sel ? 0.5 : 0.12 });
      // spin (malá šípka)
      r.arrow(V3.add(a.p, [0, 0.5, 0]), V3.add(a.p, [0, 1.0 + 0.1 * Math.sin(this.t * 2 + i), 0]), [1, 0.85, 0.3], 0.04, { emissive: 0.4 });
      UI.label('at' + i, V3.add(a.p, [0, -0.6, 0]), a.el, 'npc small');
    });
    // NMR spektrum dole; v kroku 'spectrum' sa vrcholy štiepia (J-väzba)
    const split = (this.phase === 'spectrum');
    const peaks = split ? [-2.2, -2.0, 0.9, 1.1] : [-2.1, 1.0];
    peaks.forEach((px, i) => {
      const h = split ? 1.0 : 1.4;
      r.draw('box', M4.trs([px, -1.6 + h / 2, -2.2], 0, [0.16, h, 0.16]), [0.3, 0.8, 1], { emissive: 0.3 });
    });
    UI.hot([0, -0.4, -2.2], tr('NMR spektrum', 'NMR spectrum', 'ЯМР-спектр'), 70);
    // Pauling
    const mp = [-4.2, -1.4, 1.2];
    r.sphere(V3.add(mp, [0, 1.6, 0]), 0.32, [0.95, 0.85, 0.75], { emissive: 0.1 });
    r.draw('cylinder', M4.trs(mp, 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [0.9, 0.6, 0.4], 0.8));
    const cx = CODEX.find((c) => c.id === 'pauling');
    UI.label('pauling', V3.add(mp, [0, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}
