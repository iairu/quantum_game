'use strict';
// LEVEL 15 (poradie 13) — Fourierova transformácia a QFT (mentor: Joseph Fourier)
// Ľahší vizualizačný level: DFT rozloží signál na frekvencie, QFT to robí na amplitúdach,
// hľadanie periódy je srdcom Shorovho algoritmu. Inline tr() + inline kvízy.

class L15Fourier extends Level {
  get steps() { return [this.intro, this.dft, this.qft, this.period, this.inverse]; }

  setup() {
    this.cam = new OrbitCam([0, 0.4, 0], 10, 0.6, 0.28, 5, 18);
    this.phase = 'intro';
    this.freq = 3;      // dominantná frekvencia zobrazeného signálu
    this.period = 4;    // perióda pre krok hľadania periódy
  }

  intro() {
    this.phase = 'intro';
    this.quest(tr('Vypočuj si Fouriera', 'Listen to Fourier', 'Послухай Фур’є'), { easy: tr('🌊 čas ↔ frekvencia', '🌊 time ↔ frequency', '🌊 час ↔ частота'), hard: tr('rozklad na sínusy', 'decomposition into sines', 'розклад на синуси') });
    this.say([
      tr('Každý zložitý signál sa dá rozložiť na čisté sínusy rôznych frekvencií. To je moja transformácia.',
        'Every complicated signal can be decomposed into pure sines of different frequencies. That is my transform.',
        'Будь-який складний сигнал можна розкласти на чисті синуси різних частот. Це моє перетворення.'),
      tr('Prejdeme z pohľadu „čas“ do pohľadu „frekvencia“. To, čo je v čase zamotané, býva vo frekvencii jednoduché.',
        'We move from the "time" view to the "frequency" view. What is tangled in time is often simple in frequency.',
        'Переходимо від погляду «час» до погляду «частота». Те, що заплутане в часі, часто просте в частоті.'),
      tr('Kvantová verzia — QFT — robí to isté s amplitúdami qubitov a je kľúčom k Shorovmu algoritmu.',
        'The quantum version — QFT — does the same to qubit amplitudes and is the key to Shor\'s algorithm.',
        'Квантова версія — QFT — робить те саме з амплітудами кубітів і є ключем до алгоритму Шора.'),
    ], () => this.next());
  }

  dft() {
    this.phase = 'dft';
    this.freq = 3;
    this.quest(tr('Rozlož signál na frekvencie', 'Decompose the signal into frequencies', 'Розклади сигнал на частоти'), { easy: tr('vrchol = frekvencia', 'peak = frequency', 'пік = частота'), hard: tr('DFT: X_k = Σ xₙ e^(−2πikn/N)', 'DFT: X_k = Σ xₙ e^(−2πikn/N)', 'DFT: X_k = Σ xₙ e^(−2πikn/N)') });
    this.say([
      tr('Dole vidíš signál v čase (vlnka). Hore je jeho spektrum — jeden vrchol pri frekvencii, ktorá v signáli dominuje.',
        'Below you see a signal in time (a wave). Above is its spectrum — a single peak at the frequency that dominates the signal.',
        'Унизу бачиш сигнал у часі (хвиля). Угорі — його спектр: один пік на частоті, що домінує в сигналі.'),
    ], () => this.ask({
      q: tr('Signál je čistý sínus s 3 periódami v okne. Ako vyzerá jeho spektrum (DFT)?', 'The signal is a pure sine with 3 periods in the window. What does its spectrum (DFT) look like?', 'Сигнал — чистий синус із 3 періодами у вікні. Який його спектр (DFT)?'),
      options: [
        tr('Jeden ostrý vrchol pri frekvencii 3.', 'A single sharp peak at frequency 3.', 'Один гострий пік на частоті 3.'),
        tr('Rovnomerné spektrum — všetky frekvencie rovnako.', 'A flat spectrum — all frequencies equal.', 'Рівномірний спектр — усі частоти однакові.'),
        tr('Vrchol pri frekvencii 0 (jednosmerná zložka).', 'A peak at frequency 0 (the DC component).', 'Пік на частоті 0 (постійна складова).'),
        tr('Tri vrcholy pri 1, 2 a 3.', 'Three peaks at 1, 2 and 3.', 'Три піки на 1, 2 і 3.'),
      ],
      correct: 0, weak: 1,
      why: tr('Čistý sínus má jedinú frekvenciu, takže DFT dá jeden ostrý vrchol práve pri nej (tu 3).',
        'A pure sine has a single frequency, so the DFT gives one sharp peak exactly there (here 3).',
        'Чистий синус має одну частоту, тож DFT дає один гострий пік саме там (тут 3).'),
      whyWrong: { 1: tr('Rovnomerné spektrum zodpovedá šumu alebo impulzu, nie čistému sínusu.', 'A flat spectrum corresponds to noise or an impulse, not a pure sine.', 'Рівномірний спектр відповідає шуму чи імпульсу, а не чистому синусу.') },
    }, () => { this.grant(['fourierp', 'dft']); this.next(); }));
  }

  qft() {
    this.phase = 'qft';
    this.freq = 2;
    this.quest(tr('Kvantová Fourierova transformácia', 'Quantum Fourier Transform', 'Квантове перетворення Фур’є'), { easy: tr('QFT na amplitúdach', 'QFT on amplitudes', 'QFT на амплітудах'), hard: tr('O(n²) hradiel, exponenciálny vstup', 'O(n²) gates, exponential input', 'O(n²) гейтів, експоненційний вхід') });
    this.say([
      tr('QFT urobí Fourierovu transformáciu nad 2ⁿ amplitúdami naraz — a stačí jej len O(n²) hradiel.',
        'QFT performs a Fourier transform over 2ⁿ amplitudes at once — and it needs only O(n²) gates.',
        'QFT виконує перетворення Фур’є над 2ⁿ амплітудами одразу — і потребує лише O(n²) гейтів.'),
      tr('Pozor: výsledok NEVIEME celý prečítať. Meranie dá len jedno číslo. QFT je silná preto, že frekvencie zosilní pred meraním.',
        'Careful: we cannot read the whole result. A measurement gives only one number. QFT is powerful because it amplifies frequencies before the measurement.',
        'Увага: весь результат прочитати не можна. Вимірювання дає лише одне число. QFT сильна тим, що підсилює частоти перед вимірюванням.'),
    ], () => this.ask({
      q: tr('Prečo je QFT rýchla, no napriek tomu nie je to „zadarmo zrýchlenie všetkého“?', 'Why is QFT fast, yet it is not a "free speed-up for everything"?', 'Чому QFT швидка, але це не «безкоштовне прискорення всього»?'),
      options: [
        tr('Transformuje exponenciálne veľa amplitúd, ale meraním z nich prečítame iba jednu hodnotu.', 'It transforms exponentially many amplitudes, but a measurement reads out only one value.', 'Вона перетворює експоненційно багато амплітуд, але вимірювання зчитує лише одне значення.'),
        tr('QFT je v skutočnosti pomalšia než klasická FFT.', 'QFT is actually slower than the classical FFT.', 'QFT насправді повільніша за класичну FFT.'),
        tr('QFT funguje len na jednom qubite.', 'QFT works on only one qubit.', 'QFT працює лише на одному кубіті.'),
        tr('QFT vracia všetky frekvencie naraz ako čísla na displeji.', 'QFT returns all frequencies at once as numbers on a display.', 'QFT повертає всі частоти одразу як числа на дисплеї.'),
      ],
      correct: 0, weak: 2,
      why: tr('QFT pracuje s 2ⁿ amplitúdami lacno, ale meranie skolabuje stav na jediný výsledok — preto treba šikovný algoritmus (napr. hľadanie periódy).',
        'QFT handles 2ⁿ amplitudes cheaply, but measurement collapses the state to a single result — hence we need a clever algorithm (e.g. period finding).',
        'QFT дешево опрацьовує 2ⁿ амплітуд, але вимірювання колапсує стан до одного результату — тому потрібен хитрий алгоритм (напр. пошук періоду).'),
      whyWrong: { 3: tr('Práve naopak — meraním dostaneš jedno číslo, nie celý displej frekvencií.', 'Quite the opposite — measurement gives you one number, not a whole display of frequencies.', 'Якраз навпаки — вимірювання дає одне число, а не весь дисплей частот.') },
    }, () => { this.grant(['qft']); this.next(); }));
  }

  period() {
    this.phase = 'period';
    this.period = 4;
    this.quest(tr('Nájdi skrytú periódu', 'Find the hidden period', 'Знайди прихований період'), { easy: tr('opakovanie → perióda', 'repetition → period', 'повторення → період'), hard: tr('perióda r funkcie aˣ mod N', 'period r of aˣ mod N', 'період r функції aˣ mod N') });
    this.say([
      tr('Shorov algoritmus hľadá PERIÓDU opakujúcej sa funkcie. Vlnky dole sa pravidelne opakujú.',
        'Shor\'s algorithm looks for the PERIOD of a repeating function. The spikes below repeat regularly.',
        'Алгоритм Шора шукає ПЕРІОД повторюваної функції. Сплески внизу повторюються регулярно.'),
    ], () => this.ask({
      q: tr('Funkcia dáva nenulové hodnoty na pozíciách 0, 4, 8, 12… Akú periódu QFT odhalí?', 'A function is nonzero at positions 0, 4, 8, 12… What period will the QFT reveal?', 'Функція ненульова на позиціях 0, 4, 8, 12… Який період виявить QFT?'),
      options: [
        tr('4', '4', '4'),
        tr('2', '2', '2'),
        tr('12', '12', '12'),
        tr('8', '8', '8'),
      ],
      correct: 0, weak: 2,
      why: tr('Hodnoty sa opakujú každé 4 kroky, teda perióda r = 4. QFT premení toto opakovanie na ostrý vrchol v spektre.',
        'The values repeat every 4 steps, so the period r = 4. The QFT turns this repetition into a sharp peak in the spectrum.',
        'Значення повторюються кожні 4 кроки, тож період r = 4. QFT перетворює це повторення на гострий пік у спектрі.'),
      whyWrong: { 2: tr('12 je len jedna z pozícií, nie vzdialenosť medzi opakovaniami.', '12 is just one of the positions, not the spacing between repetitions.', '12 — лише одна з позицій, а не відстань між повтореннями.') },
    }, () => { this.grant(['periodfind']); this.next(); }));
  }

  inverse() {
    this.phase = 'inverse';
    this.period = 3;
    this.quest(tr('Od periódy k výsledku', 'From period to answer', 'Від періоду до відповіді'), { easy: tr('perióda → rozklad', 'period → factoring', 'період → розклад'), hard: tr('r → gcd(a^(r/2)±1, N)', 'r → gcd(a^(r/2)±1, N)', 'r → gcd(a^(r/2)±1, N)') });
    this.say([
      tr('Keď poznáme periódu r, klasická matematika (najväčší spoločný deliteľ) z nej už ľahko vytiahne faktory čísla N.',
        'Once we know the period r, classical math (greatest common divisor) easily extracts the factors of N from it.',
        'Коли ми знаємо період r, класична математика (найбільший спільний дільник) легко дістає з нього множники числа N.'),
    ], () => this.ask({
      q: tr('Kde v tomto reťazci leží KVANTOVÁ časť Shorovho algoritmu?', 'Where in this chain does the QUANTUM part of Shor\'s algorithm sit?', 'Де в цьому ланцюгу розташована КВАНТОВА частина алгоритму Шора?'),
      options: [
        tr('V nájdení periódy r pomocou QFT; zvyšok je klasický.', 'In finding the period r with the QFT; the rest is classical.', 'У знаходженні періоду r за допомогою QFT; решта — класична.'),
        tr('V celom algoritme — všetko beží na qubitoch.', 'In the entire algorithm — everything runs on qubits.', 'У всьому алгоритмі — усе працює на кубітах.'),
        tr('Vo výpočte najväčšieho spoločného deliteľa.', 'In computing the greatest common divisor.', 'В обчисленні найбільшого спільного дільника.'),
        tr('Nikde — Shor je čisto klasický algoritmus.', 'Nowhere — Shor is a purely classical algorithm.', 'Ніде — Шор суто класичний алгоритм.'),
      ],
      correct: 0, weak: 3,
      why: tr('Kvantový počítač rýchlo nájde periódu (cez QFT). Prevod periódy na faktory robí klasický počítač — to je spojenie oboch svetov.',
        'The quantum computer quickly finds the period (via QFT). Turning the period into factors is done by a classical computer — a marriage of both worlds.',
        'Квантовий комп’ютер швидко знаходить період (через QFT). Перетворення періоду на множники робить класичний комп’ютер — поєднання двох світів.'),
      whyWrong: { 3: tr('Shor má zásadnú kvantovú časť — hľadanie periódy — inak by neprekonal klasiku.', 'Shor has an essential quantum part — period finding — otherwise it would not beat classical methods.', 'Шор має суттєву квантову частину — пошук періоду — інакше він не переважив би класику.') },
    }, () => this.next()));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Nádhera. Videl(a) si, ako frekvencia odhalí skrytú štruktúru — a prečo je QFT srdcom Shorovho algoritmu.',
        'Beautiful. You have seen how frequency reveals hidden structure — and why the QFT is the heart of Shor\'s algorithm.',
        'Чудово. Ти побачив(-ла), як частота розкриває приховану структуру — і чому QFT є серцем алгоритму Шора.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // dole: signál v čase (stĺpčeky), hore: spektrum (vrchol pri frekvencii / periodický hrebeň)
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.6, 0], 0, 12), [0.18, 0.22, 0.26], { pattern: 1 });
    const N = 16, w = 0.28, span = 9, x0 = -span / 2;
    const periodic = (this.phase === 'period' || this.phase === 'inverse');
    for (let i = 0; i < N; i++) {
      const x = x0 + i / (N - 1) * span;
      // signál v čase (modrý), dole
      let s;
      if (periodic) s = (i % this.period === 0) ? 1 : 0.04;
      else s = 0.5 + 0.5 * Math.sin((i / N) * this.freq * 2 * Math.PI + this.t * 0.6);
      const h = 0.1 + s * 1.6;
      r.draw('box', M4.trs([x, -1.6 + h / 2, 1.3], 0, [w, h, w]), [0.3, 0.6, 1], { emissive: 0.15 });
      // spektrum (oranžové), hore — vrchol pri this.freq, pri perióde hrebeň pri N/period
      let sp = 0.04;
      if (periodic) { const step = N / this.period; sp = (i % step === 0) ? 1 : 0.03; }
      else sp = (i === this.freq || i === N - this.freq) ? 1 : 0.03;
      const hh = 0.1 + sp * 1.8;
      r.draw('box', M4.trs([x, -1.6 + hh / 2, -1.3], 0, [w, hh, w]), sp > 0.5 ? [1, 0.6, 0.2] : [0.5, 0.4, 0.3], { emissive: sp > 0.5 ? 0.5 : 0.05 });
    }
    UI.hot([0, 0.4, 1.9], tr('čas (signál)', 'time (signal)', 'час (сигнал)'), 80);
    UI.hot([0, 0.4, -1.9], tr('frekvencia (spektrum)', 'frequency (spectrum)', 'частота (спектр)'), 80);
    // Fourier
    const mp = [x0 - 2.2, -1.4, 0];
    r.sphere(V3.add(mp, [0, 1.6, 0]), 0.32, [0.95, 0.88, 0.78], { emissive: 0.1 });
    r.draw('cylinder', M4.trs(mp, 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [0.3, 0.7, 1], 0.8));
    const cx = CODEX.find((c) => c.id === 'fourierp');
    UI.label('fourier', V3.add(mp, [0, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}
