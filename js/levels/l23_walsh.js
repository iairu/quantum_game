'use strict';
// LEVEL 23 (poradie 21) — Walshova–Hadamardova dielňa (mentori: Ethan Bernstein & Umesh Vazirani)
// Prednáška 8 (2. časť): kostra |0ⁿ⟩ → H⊗ⁿ → O_f → H⊗ⁿ, A_f(y) = 2⁻ⁿ Σ (−1)^{f(x)+x·y} (Walshova–Hadamardova
// transformácia), Deutsch–Jozsa (sľub, 2ⁿ⁻¹+1 vs. 1 dotaz, náhodný klasický algoritmus), Bernstein–Vazirani
// (f_s(x) = s·x, n vs. 1 dotaz), príklad x₁⊕x₂ → |11⟩, dotazová vs. výpočtová zložitosť, SpinQ: H_RF, ρ_phys,
// optimálne riadenie a spoločný návrh (co-design).
// Interaktívne: hľadanie skrytého reťazca s — klasické dotazy vs. jeden kvantový beh.

const WH_N = 3;
const dotm2 = (a, b) => { let v = a & b, c = 0; while (v) { c ^= v & 1; v >>= 1; } return c; };

class L23Walsh extends Level {
  get steps() { return [this.intro, this.dj, this.bv, this.cost, this.hardware]; }

  setup() {
    this.cam = new OrbitCam([0, 0.5, 0], 11, 0.5, 0.32, 5, 20);
    this.phase = 'intro';
    this.fx = (x) => 0;   // aktuálna funkcia na 3 bitoch (pre stĺpce znamienok)
    this.label = 'f = 0';
    this.s = 0b101;       // skrytý reťazec v BV (náhodný pri vstupe do kroku)
    this.known = null;    // čo hráč o s už vie
  }

  intro() {
    this.phase = 'intro'; this.fx = (x) => dotm2(x, 0b110); this.label = 'f = x₁ ⊕ x₂';
    this.quest(tr('Vypočuj si Bernsteina a Vaziraniho', 'Listen to Bernstein and Vazirani', 'Послухай Бернштейна і Вазірані'), { easy: tr('🎛 jedna kostra pre všetky algoritmy', '🎛 one skeleton for all algorithms', '🎛 один кістяк для всіх алгоритмів'), hard: tr('A<sub>f</sub>(y) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x)+x·y</sup>', 'A<sub>f</sub>(y) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x)+x·y</sup>', 'A<sub>f</sub>(y) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x)+x·y</sup>') });
    this.say([
      tr('V roku 1993 sme zaviedli kvantovú zložitosť a úlohu so skrytým reťazcom. Všetky orákulové algoritmy tu majú jednu KOSTRU: |0ⁿ⟩ → H⊗ⁿ → O<sub>f</sub> → H⊗ⁿ → meranie.',
        'In 1993 we introduced quantum complexity and the hidden-string problem. All oracle algorithms here share one SKELETON: |0ⁿ⟩ → H⊗ⁿ → O<sub>f</sub> → H⊗ⁿ → measure.',
        'У 1993 році ми запровадили квантову складність і задачу прихованого рядка. Усі оракульні алгоритми тут мають один КІСТЯК: |0ⁿ⟩ → H⊗ⁿ → O<sub>f</sub> → H⊗ⁿ → вимірювання.'),
      tr('H⊗ⁿ|x⟩ = 2<sup>−n/2</sup> Σ<sub>y</sub> (−1)<sup>x·y</sup>|y⟩. Po celej kostre je amplitúda výsledku y: A<sub>f</sub>(y) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x) + x·y</sup>. To je WALSHOVA–HADAMARDOVA transformácia znamienok (−1)<sup>f(x)</sup>.',
        'H⊗ⁿ|x⟩ = 2<sup>−n/2</sup> Σ<sub>y</sub> (−1)<sup>x·y</sup>|y⟩. After the whole skeleton the amplitude of outcome y is A<sub>f</sub>(y) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x) + x·y</sup>. That is the WALSH–HADAMARD transform of the signs (−1)<sup>f(x)</sup>.',
        'H⊗ⁿ|x⟩ = 2<sup>−n/2</sup> Σ<sub>y</sub> (−1)<sup>x·y</sup>|y⟩. Після всього кістяка амплітуда результату y: A<sub>f</sub>(y) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x) + x·y</sup>. Це перетворення УОЛША–АДАМАРА знаків (−1)<sup>f(x)</sup>.'),
      tr('Príklad pre n = 2: f = x₁ ⊕ x₂ dá po orákule ½(|00⟩ − |01⟩ − |10⟩ + |11⟩) a H⊗² ho zloží do jediného |11⟩.',
        'Example for n = 2: f = x₁ ⊕ x₂ gives after the oracle ½(|00⟩ − |01⟩ − |10⟩ + |11⟩), and H⊗² folds it into a single |11⟩.',
        'Приклад для n = 2: f = x₁ ⊕ x₂ після оракула дає ½(|00⟩ − |01⟩ − |10⟩ + |11⟩), а H⊗² згортає його в єдиний |11⟩.'),
    ], () => this.ask({
      q: tr('Po kostre H⊗² O<sub>f</sub> H⊗² s f = x₁ ⊕ x₂ meriame. Čo dostaneme?', 'After the skeleton H⊗² O<sub>f</sub> H⊗² with f = x₁ ⊕ x₂ we measure. What do we get?', 'Після кістяка H⊗² O<sub>f</sub> H⊗² з f = x₁ ⊕ x₂ вимірюємо. Що отримаємо?'),
      options: [
        tr('Vždy |11⟩ — vzor znamienok (+ − − +) je presne Walshova funkcia pre y = 11.', 'Always |11⟩ — the sign pattern (+ − − +) is exactly the Walsh function for y = 11.', 'Завжди |11⟩ — візерунок знаків (+ − − +) — це саме функція Уолша для y = 11.'),
        tr('Každý výsledok s pravdepodobnosťou ¼.', 'Each outcome with probability ¼.', 'Кожен результат з імовірністю ¼.'),
        tr('Vždy |00⟩.', 'Always |00⟩.', 'Завжди |00⟩.'),
        tr('|01⟩ alebo |10⟩ náhodne.', '|01⟩ or |10⟩ at random.', '|01⟩ або |10⟩ випадково.'),
      ],
      correct: 0, weak: 1,
      why: tr('A<sub>f</sub>(y) zmeria „zhodu“ vzoru znamienok s Walshovou funkciou (−1)<sup>x·y</sup>. Pre y = 11 je zhoda úplná (A = 1), pre ostatné y sa členy vyrušia.',
        'A<sub>f</sub>(y) measures how well the sign pattern "matches" the Walsh function (−1)<sup>x·y</sup>. For y = 11 the match is complete (A = 1); for other y the terms cancel.',
        'A<sub>f</sub>(y) вимірює «збіг» візерунка знаків із функцією Уолша (−1)<sup>x·y</sup>. Для y = 11 збіг повний (A = 1), для інших y члени взаємно знищуються.'),
      whyWrong: { 1: tr('Rovnomerné rozdelenie by bolo po jednom H⊗²; druhý H⊗² po orákule spôsobí interferenciu do jedného výsledku.', 'A uniform distribution would follow one H⊗²; the second H⊗² after the oracle makes everything interfere into one outcome.', 'Рівномірний розподіл був би після одного H⊗²; другий H⊗² після оракула спричиняє інтерференцію в один результат.') },
    }, () => { this.grant(['bvp', 'walsh']); this.next(); }));
  }

  dj() {
    this.phase = 'dj'; this.fx = (x) => (x >> 2) & 1; this.label = tr('vyvážená f = x₁', 'balanced f = x₁', 'збалансована f = x₁');
    this.quest(tr('Deutsch–Jozsa: konštantná alebo vyvážená?', 'Deutsch–Jozsa: constant or balanced?', 'Дойч–Йожа: стала чи збалансована?'), { easy: tr('sčítaj 8 znamienok', 'add up 8 signs', 'додай 8 знаків'), hard: tr('A<sub>f</sub>(0ⁿ) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x)</sup> = ±1 alebo 0', 'A<sub>f</sub>(0ⁿ) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x)</sup> = ±1 or 0', 'A<sub>f</sub>(0ⁿ) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x)</sup> = ±1 або 0') });
    this.say([
      tr('SĽUB: f na n bitoch je buď KONŠTANTNÁ, alebo VYVÁŽENÁ (polovica núl, polovica jednotiek). Úloha: ktorá to je?',
        'The PROMISE: f on n bits is either CONSTANT or BALANCED (half zeros, half ones). Task: which one?',
        'ОБІЦЯНКА: f на n бітах або СТАЛА, або ЗБАЛАНСОВАНА (половина нулів, половина одиниць). Задача: яка саме?'),
      tr('Amplitúda výsledku 0ⁿ je A<sub>f</sub>(0ⁿ) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x)</sup> — priemer ôsmich znamienok na stĺpcoch. Konštantná → ±1, vyvážená → 0 (výsledok 0ⁿ NIKDY nepadne).',
        'The amplitude of outcome 0ⁿ is A<sub>f</sub>(0ⁿ) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x)</sup> — the average of the eight signs on the columns. Constant → ±1, balanced → 0 (outcome 0ⁿ NEVER appears).',
        'Амплітуда результату 0ⁿ: A<sub>f</sub>(0ⁿ) = 2⁻ⁿ Σ<sub>x</sub> (−1)<sup>f(x)</sup> — середнє восьми знаків на стовпцях. Стала → ±1, збалансована → 0 (результат 0ⁿ НІКОЛИ не випадає).'),
      tr('Deterministický klasický algoritmus potrebuje v najhoršom prípade 2ⁿ⁻¹ + 1 dotazov. Kvantový jeden. No pozor: náhodný klasický s 3 dotazmi sa mýli len s pravdepodobnosťou ¼ — výhoda je presnosť, nie zázrak.',
        'A deterministic classical algorithm needs 2ⁿ⁻¹ + 1 queries in the worst case. The quantum one needs one. But beware: a randomised classical one with 3 queries errs with probability only ¼ — the advantage is exactness, not a miracle.',
        'Детермінованому класичному алгоритму в найгіршому разі потрібно 2ⁿ⁻¹ + 1 запитів. Квантовому — один. Але обережно: випадковий класичний із 3 запитами помиляється лише з імовірністю ¼ — перевага в точності, а не диво.'),
    ], () => this.ask({
      q: tr('Pre n = 3 a vyváženú f: koľko je A<sub>f</sub>(000) a aká je pravdepodobnosť výsledku 000?', 'For n = 3 and a balanced f: what is A<sub>f</sub>(000) and the probability of outcome 000?', 'Для n = 3 і збалансованої f: чому дорівнює A<sub>f</sub>(000) та ймовірність результату 000?'),
      options: [
        tr('A = (4 − 4)/8 = 0, takže P(000) = 0.', 'A = (4 − 4)/8 = 0, so P(000) = 0.', 'A = (4 − 4)/8 = 0, тож P(000) = 0.'),
        tr('A = ½, takže P(000) = ¼.', 'A = ½, so P(000) = ¼.', 'A = ½, тож P(000) = ¼.'),
        tr('A = 1, takže P(000) = 1.', 'A = 1, so P(000) = 1.', 'A = 1, тож P(000) = 1.'),
        tr('A = 1/8 ako pri rovnomernom rozdelení.', 'A = 1/8 as for a uniform distribution.', 'A = 1/8, як для рівномірного розподілу.'),
      ],
      correct: 0, weak: 3,
      why: tr('Štyri +1 a štyri −1 sa presne vyrušia. Ak teda nameriame čokoľvek iné než 000, f je určite vyvážená; ak 000, je konštantná — s istotou, jedným dotazom.',
        'Four +1 and four −1 cancel exactly. So if we measure anything other than 000, f is surely balanced; if 000, it is constant — with certainty, in one query.',
        'Чотири +1 і чотири −1 точно взаємно знищуються. Тож якщо виміряли щось інше, ніж 000, f напевно збалансована; якщо 000 — стала. З певністю, одним запитом.'),
      whyWrong: { 3: tr('Amplitúda nie je pravdepodobnosť a znamienka sa sčítavajú so znamienkom — nie každý člen prispieva kladne.', 'An amplitude is not a probability, and the signs add with their signs — not every term contributes positively.', 'Амплітуда — не ймовірність, і знаки додаються зі своїми знаками — не кожен член дає додатний внесок.') },
    }, () => { this.grant(['djalg']); this.next(); }));
  }

  // interaktívne: skrytý reťazec s — klasické dotazy e_i vs. jeden kvantový beh
  bv() {
    this.phase = 'bv';
    this.s = 1 + Math.floor(Math.random() * 7); this.known = [null, null, null];
    this.fx = (x) => dotm2(x, this.s); this.label = 'f(x) = s · x';
    this.quest(tr('Bernstein–Vazirani: nájdi skrytý reťazec s', 'Bernstein–Vazirani: find the hidden string s', 'Бернштейн–Вазірані: знайди прихований рядок s'), { easy: tr('klasicky po bitoch, kvantovo naraz', 'classically bit by bit, quantumly at once', 'класично побітно, квантово одразу'), hard: tr('f<sub>s</sub>(x) = s·x mod 2; H⊗ⁿ|ψ<sub>s</sub>⟩ = |s⟩', 'f<sub>s</sub>(x) = s·x mod 2; H⊗ⁿ|ψ<sub>s</sub>⟩ = |s⟩', 'f<sub>s</sub>(x) = s·x mod 2; H⊗ⁿ|ψ<sub>s</sub>⟩ = |s⟩') });
    this.say([
      tr('Orákulum skrýva reťazec s a počíta f<sub>s</sub>(x) = s·x mod 2. Napr. pre s = 1011 je f = x₁ ⊕ x₃ ⊕ x₄. Klasicky sa pýtaš x = 100, 010, 001 … — jeden bit s na dotaz, spolu n dotazov.',
        'The oracle hides a string s and computes f<sub>s</sub>(x) = s·x mod 2. E.g. for s = 1011, f = x₁ ⊕ x₃ ⊕ x₄. Classically you ask x = 100, 010, 001 … — one bit of s per query, n queries in total.',
        'Оракул приховує рядок s і обчислює f<sub>s</sub>(x) = s·x mod 2. Напр. для s = 1011 f = x₁ ⊕ x₃ ⊕ x₄. Класично питаєш x = 100, 010, 001 … — один біт s на запит, разом n запитів.'),
      tr('Kvantovo: po orákule je stav |ψ<sub>s</sub>⟩ = 2<sup>−n/2</sup> Σ<sub>x</sub> (−1)<sup>s·x</sup>|x⟩ a H⊗ⁿ|ψ<sub>s</sub>⟩ = |s⟩. Vyskúšaj obe cesty na 3 bitoch.',
        'Quantumly: after the oracle the state is |ψ<sub>s</sub>⟩ = 2<sup>−n/2</sup> Σ<sub>x</sub> (−1)<sup>s·x</sup>|x⟩, and H⊗ⁿ|ψ<sub>s</sub>⟩ = |s⟩. Try both ways on 3 bits.',
        'Квантово: після оракула стан |ψ<sub>s</sub>⟩ = 2<sup>−n/2</sup> Σ<sub>x</sub> (−1)<sup>s·x</sup>|x⟩, і H⊗ⁿ|ψ<sub>s</sub>⟩ = |s⟩. Спробуй обидва шляхи на 3 бітах.'),
    ], () => {
      let cq = 0, qDone = false;
      const out = UI.info('');
      const bits = () => this.known.map((b) => (b === null ? '?' : b)).join('');
      const upd = (extra = '') => { out.innerHTML = `s = <b>${bits()}</b> · ${tr('klasické dotazy', 'classical queries', 'класичні запити')}: ${cq}${extra}`; };
      const finish = () => {
        UI.panelHide();
        this.ask({
          q: tr('Koľko dotazov potrebuje na n-bitový reťazec s klasický a koľko kvantový algoritmus?', 'How many queries do the classical and the quantum algorithm need for an n-bit string s?', 'Скільки запитів потрібно класичному і квантовому алгоритму для n-бітового рядка s?'),
          options: [
            tr('Klasicky n (každý dotaz dá jeden bit), kvantovo 1.', 'Classically n (each query gives one bit), quantumly 1.', 'Класично n (кожен запит дає один біт), квантово 1.'),
            tr('Klasicky 2ⁿ, kvantovo n.', 'Classically 2ⁿ, quantumly n.', 'Класично 2ⁿ, квантово n.'),
            tr('Obe potrebujú n.', 'Both need n.', 'Обом потрібно n.'),
            tr('Klasicky 1, kvantovo 1.', 'Classically 1, quantumly 1.', 'Класично 1, квантово 1.'),
          ],
          correct: 0, weak: 1,
          why: tr('Klasický dotaz vráti jeden bit f(x), teda najviac jeden bit informácie o s. Kvantový dotaz v superpozícii zapíše VŠETKY bity s do fáz naraz a H⊗ⁿ ich prečíta.',
            'A classical query returns one bit f(x), hence at most one bit of information about s. A quantum query in superposition writes ALL bits of s into phases at once, and H⊗ⁿ reads them out.',
            'Класичний запит повертає один біт f(x), тобто щонайбільше один біт інформації про s. Квантовий запит у суперпозиції записує ВСІ біти s у фази одразу, а H⊗ⁿ їх зчитує.'),
          whyWrong: { 1: tr('Na s netreba skúšať všetkých 2ⁿ vstupov: stačia jednotkové vektory e<sub>i</sub>, teda n dotazov.', 'You need not try all 2ⁿ inputs for s: the unit vectors e<sub>i</sub> suffice, i.e. n queries.', 'Для s не потрібно пробувати всі 2ⁿ входів: досить одиничних векторів e<sub>i</sub>, тобто n запитів.') },
        }, () => { this.grant(['bvalg', 'querycost']); this.next(); });
      };
      const ask = (i) => {
        if (this.known[i] !== null && !qDone) return;
        cq++; this.known[i] = dotm2(1 << (2 - i), this.s); upd();
      };
      const btns = [0, 1, 2].map((i) => UI.button(`x = ${['100', '010', '001'][i]}`, () => ask(i)));
      UI.panelSet(tr('Skrytý reťazec s (3 bity)', 'Hidden string s (3 bits)', 'Прихований рядок s (3 біти)'), [
        UI.row(...btns),
        UI.row(UI.button(tr('⚛ 1 kvantový beh: H⊗³ O<sub>f</sub> H⊗³', '⚛ 1 quantum run: H⊗³ O<sub>f</sub> H⊗³', '⚛ 1 квантовий запуск: H⊗³ O<sub>f</sub> H⊗³'), () => {
          if (qDone) return;
          qDone = true; this.known = [2, 1, 0].map((k) => (this.s >> k) & 1); upd(` · ${tr('kvantové', 'quantum', 'квантових')}: 1`);
          setTimeout(finish, 900);
        }, 'big')),
        out,
      ]);
      upd();
    });
  }

  cost() {
    this.phase = 'cost';
    this.quest(tr('Dotazy vs. celkový čas', 'Queries vs. total time', 'Запити vs. загальний час'), { easy: tr('dotaz nie je všetko', 'a query is not everything', 'запит — це не все'), hard: tr('T<sub>quant</sub> = T<sub>prep</sub> + N·T<sub>Uf</sub> + T<sub>other</sub> + T<sub>meas</sub>', 'T<sub>quant</sub> = T<sub>prep</sub> + N·T<sub>Uf</sub> + T<sub>other</sub> + T<sub>meas</sub>', 'T<sub>quant</sub> = T<sub>prep</sub> + N·T<sub>Uf</sub> + T<sub>other</sub> + T<sub>meas</sub>') });
    this.say([
      tr('Porovnanie: Deutsch 2 vs. 1, Deutsch–Jozsa 2ⁿ⁻¹+1 vs. 1, Bernstein–Vazirani n vs. 1 dotazov. To je DOTAZOVÁ zložitosť — počet otázok na čiernu skrinku.',
        'Comparison: Deutsch 2 vs. 1, Deutsch–Jozsa 2ⁿ⁻¹+1 vs. 1, Bernstein–Vazirani n vs. 1 queries. That is QUERY complexity — the number of questions to the black box.',
        'Порівняння: Дойч 2 vs. 1, Дойч–Йожа 2ⁿ⁻¹+1 vs. 1, Бернштейн–Вазірані n vs. 1 запитів. Це ЗАПИТОВА складність — кількість питань до чорної скриньки.'),
      tr('Skutočný čas je T<sub>quant</sub> = T<sub>prep</sub> + N·T<sub>Uf</sub> + T<sub>other</sub> + T<sub>meas</sub>. Ak je orákulum drahé na zostrojenie (veľa hradiel), alebo je príprava a čítanie pomalé, výhoda sa môže stratiť.',
        'The real time is T<sub>quant</sub> = T<sub>prep</sub> + N·T<sub>Uf</sub> + T<sub>other</sub> + T<sub>meas</sub>. If the oracle is expensive to build (many gates), or preparation and readout are slow, the advantage can vanish.',
        'Реальний час: T<sub>quant</sub> = T<sub>prep</sub> + N·T<sub>Uf</sub> + T<sub>other</sub> + T<sub>meas</sub>. Якщо оракул дорого побудувати (багато гейтів) або підготовка й зчитування повільні, перевага може зникнути.'),
      tr('Kde je informácia? Problém → orákulum → fázová štruktúra → interferencia → odpoveď. Nič sa „nepočíta paralelne a nečíta naraz“.',
        'Where is the information? Problem → oracle → phase structure → interference → answer. Nothing is "computed in parallel and read all at once".',
        'Де інформація? Задача → оракул → фазова структура → інтерференція → відповідь. Ніщо не «обчислюється паралельно й не зчитується одразу».'),
    ], () => this.ask({
      q: tr('Čo presne meria dotazová zložitosť orákulových algoritmov?', 'What exactly does the query complexity of oracle algorithms measure?', 'Що саме вимірює запитова складність оракульних алгоритмів?'),
      options: [
        tr('Počet volaní orákula — nie celkový čas behu so stavbou orákula, prípravou a meraním.', 'The number of oracle calls — not the total run time including building the oracle, preparation and measurement.', 'Кількість викликів оракула — а не загальний час виконання з побудовою оракула, підготовкою й вимірюванням.'),
        tr('Celkový počet hradiel v obvode.', 'The total number of gates in the circuit.', 'Загальну кількість гейтів у схемі.'),
        tr('Počet qubitov.', 'The number of qubits.', 'Кількість кубітів.'),
        tr('Čas v sekundách na skutočnom hardvéri.', 'The time in seconds on real hardware.', 'Час у секундах на реальному обладнанні.'),
      ],
      correct: 0, weak: 3,
      why: tr('Exponenciálny rozdiel v dotazoch (napr. DJ) nemusí znamenať exponenciálny rozdiel v čase. Preto sú tieto algoritmy hlavne ukážkou PRINCÍPU fázovej interferencie.',
        'An exponential gap in queries (e.g. DJ) need not mean an exponential gap in time. That is why these algorithms are mainly a demonstration of the PRINCIPLE of phase interference.',
        'Експоненційна різниця в запитах (напр. DJ) не обов’язково означає експоненційну різницю в часі. Тому ці алгоритми — передусім демонстрація ПРИНЦИПУ фазової інтерференції.'),
      whyWrong: { 1: tr('Počet hradiel je výpočtová zložitosť; orákulum sa v dotazovom modeli počíta ako jeden krok bez ohľadu na jeho vnútro.', 'The gate count is computational complexity; in the query model the oracle counts as one step regardless of its inside.', 'Кількість гейтів — це обчислювальна складність; у запитовій моделі оракул рахується як один крок незалежно від його нутрощів.') },
    }, () => this.next()));
  }

  hardware() {
    this.phase = 'hardware';
    this.quest(tr('Ako sa orákulum stane impulzom', 'How an oracle becomes a pulse', 'Як оракул стає імпульсом'), { easy: tr('RF impulz → hradlo', 'RF pulse → gate', 'РЧ-імпульс → гейт'), hard: tr('H<sub>RF</sub> = ħΩ/2 (cos ϕ σ<sub>x</sub> + sin ϕ σ<sub>y</sub>), U = T exp(−i/ħ ∫H dt)', 'H<sub>RF</sub> = ħΩ/2 (cos ϕ σ<sub>x</sub> + sin ϕ σ<sub>y</sub>), U = T exp(−i/ħ ∫H dt)', 'H<sub>RF</sub> = ħΩ/2 (cos ϕ σ<sub>x</sub> + sin ϕ σ<sub>y</sub>), U = T exp(−i/ħ ∫H dt)') });
    this.say([
      tr('Na SpinQ sa hradlo rodí z RF impulzu: H<sub>RF</sub> = ħΩ/2 (cos ϕ σ<sub>x</sub> + sin ϕ σ<sub>y</sub>). Unitár je U = T exp(−i/ħ ∫H dt); napr. R<sub>x</sub>(θ) = e<sup>−iθσ<sub>x</sub>/2</sup>. Reťazec: RF impulz → hamiltonián → unitár → hradlo.',
        'On SpinQ a gate is born from an RF pulse: H<sub>RF</sub> = ħΩ/2 (cos ϕ σ<sub>x</sub> + sin ϕ σ<sub>y</sub>). The unitary is U = T exp(−i/ħ ∫H dt); e.g. R<sub>x</sub>(θ) = e<sup>−iθσ<sub>x</sub>/2</sup>. The chain: RF pulse → Hamiltonian → unitary → gate.',
        'На SpinQ гейт народжується з РЧ-імпульсу: H<sub>RF</sub> = ħΩ/2 (cos ϕ σ<sub>x</sub> + sin ϕ σ<sub>y</sub>). Унітар U = T exp(−i/ħ ∫H dt); напр. R<sub>x</sub>(θ) = e<sup>−iθσ<sub>x</sub>/2</sup>. Ланцюжок: РЧ-імпульс → гамільтоніан → унітар → гейт.'),
      tr('Stav je opäť pseudo-čistý: ρ<sub>phys</sub> = (1−ε) I/2ⁿ + ε ρ<sub>eff</sub>. Orákulum treba „preložiť“ do impulzov — optimálne riadenie a spoločný návrh (co-design) algoritmu a hardvéru.',
        'The state is again pseudo-pure: ρ<sub>phys</sub> = (1−ε) I/2ⁿ + ε ρ<sub>eff</sub>. The oracle must be "translated" into pulses — optimal control and co-design of algorithm and hardware.',
        'Стан знову псевдочистий: ρ<sub>phys</sub> = (1−ε) I/2ⁿ + ε ρ<sub>eff</sub>. Оракул треба «перекласти» в імпульси — оптимальне керування та спільне проєктування (co-design) алгоритму й обладнання.'),
      tr('„Dá sa, ak sa budeš správne pýtať.“', '"It can be done, if you ask the right way."', '«Можна, якщо питатимеш правильно.»'),
    ], () => this.ask({
      q: tr('Čo na SpinQ určuje os rotácie jednoqubitového hradla?', 'What determines the rotation axis of a single-qubit gate on SpinQ?', 'Що на SpinQ визначає вісь повороту однокубітного гейта?'),
      options: [
        tr('Fáza ϕ RF impulzu (cos ϕ σ<sub>x</sub> + sin ϕ σ<sub>y</sub>); uhol dá plocha impulzu Ω·t.', 'The phase ϕ of the RF pulse (cos ϕ σ<sub>x</sub> + sin ϕ σ<sub>y</sub>); the angle is given by the pulse area Ω·t.', 'Фаза ϕ РЧ-імпульсу (cos ϕ σ<sub>x</sub> + sin ϕ σ<sub>y</sub>); кут дає площа імпульсу Ω·t.'),
        tr('Teplota vzorky.', 'The sample’s temperature.', 'Температура зразка.'),
        tr('Veľkosť statického poľa B₀.', 'The strength of the static field B₀.', 'Величина статичного поля B₀.'),
        tr('Počet opakovaní merania.', 'The number of measurement repetitions.', 'Кількість повторень вимірювання.'),
      ],
      correct: 0, weak: 2,
      why: tr('V rotujúcej sústave RF pole leží v rovine xy; jeho fáza ϕ volí os a dĺžka × amplitúda volí uhol θ = Ω·t. Tak sa z impulzov skladá H aj orákulum.',
        'In the rotating frame the RF field lies in the xy plane; its phase ϕ chooses the axis and length × amplitude chooses the angle θ = Ω·t. That is how H and the oracle are built from pulses.',
        'В обертовій системі РЧ-поле лежить у площині xy; його фаза ϕ вибирає вісь, а тривалість × амплітуда — кут θ = Ω·t. Так з імпульсів складають і H, і оракул.'),
      whyWrong: { 2: tr('B₀ určuje Larmorovu frekvenciu (rezonanciu), nie os rotácie v rotujúcej sústave.', 'B₀ sets the Larmor frequency (resonance), not the rotation axis in the rotating frame.', 'B₀ задає ларморову частоту (резонанс), а не вісь повороту в обертовій системі.') },
    }, () => { this.grant(['optctrl']); this.next(); }));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Výborne. Jedna kostra, tri algoritmy: znamienka (−1)<sup>f(x)</sup>, Walshova–Hadamardova transformácia a meranie. A vieš aj, kde sa výhoda končí — v cene orákula a v hardvéri.',
        'Well done. One skeleton, three algorithms: signs (−1)<sup>f(x)</sup>, the Walsh–Hadamard transform and measurement. And you also know where the advantage ends — in the cost of the oracle and in hardware.',
        'Чудово. Один кістяк, три алгоритми: знаки (−1)<sup>f(x)</sup>, перетворення Уолша–Адамара і вимірювання. І ти знаєш, де перевага закінчується — у ціні оракула та в обладнанні.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // 8 stĺpcov znamienok (−1)^{f(x)} pre x = 000…111 a pod nimi amplitúdy A_f(y) po H⊗³
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.4, 0], 0, 8), [0.16, 0.18, 0.26], { pattern: 1 });
    const N = 1 << WH_N, sg = [];
    for (let x = 0; x < N; x++) sg.push(this.fx(x) ? -1 : 1);
    const A = [];
    for (let y = 0; y < N; y++) { let s = 0; for (let x = 0; x < N; x++) s += sg[x] * (dotm2(x, y) ? -1 : 1); A.push(s / N); }
    const wob = 0.05 * Math.sin(this.t * 2);
    for (let x = 0; x < N; x++) {
      const px = -3.5 + x, h = 0.8 * sg[x];
      r.draw('box', M4.trs([px, 0.6 + h / 2, -1], 0, [0.6, Math.abs(h) + 0.02, 0.4]), sg[x] > 0 ? [0.4, 0.9, 0.6] : [1, 0.45, 0.4], { emissive: 0.3 });
      UI.label('wx' + x, [px, -0.5, -1], x.toString(2).padStart(WH_N, '0'), 'small');
    }
    UI.hot([0, 2, -1], `(−1)<sup>f(x)</sup> · ${this.label}`, 80);
    if (this.phase !== 'cost') {
      for (let y = 0; y < N; y++) {
        const px = -3.5 + y, a = A[y], h = 1.2 * a * a + 0.02;
        r.draw('box', M4.trs([px, -1.35 + h / 2, 1.4], 0, [0.6, h, 0.6]), [0.6, 0.7, 1], { emissive: 0.2 + 0.5 * a * a + wob });
      }
      UI.hot([0, -0.4, 1.4], tr('|A<sub>f</sub>(y)|² po H⊗³', '|A<sub>f</sub>(y)|² after H⊗³', '|A<sub>f</sub>(y)|² після H⊗³'), 80);
    }
    // mentori
    const mp = [-4.8, -1.2, 2.2];
    for (const dx of [0, 0.9]) {
      const p = V3.add(mp, [dx, 0, 0]);
      r.sphere(V3.add(p, [0, 1.6, 0]), 0.3, [0.95, 0.85, 0.75], { emissive: 0.1 });
      r.draw('cylinder', M4.trs(p, 0, [0.3, 1.4, 0.3]), V3.scale(this.color || [0.5, 0.9, 0.7], dx ? 0.65 : 0.8));
    }
    const cx = CODEX.find((c) => c.id === 'bvp');
    UI.label('bv', V3.add(mp, [0.45, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}
