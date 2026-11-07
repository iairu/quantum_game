'use strict';
// LEVEL 22 (poradie 20) — Orákulum fáz (mentor: Richard Jozsa)
// Prednáška 8 (1. časť): „Interferencia, orákulum a fázová informácia“ — |+⟩ vs. |−⟩, interferencia
// P = (1 + cos ϕ)/2, H² = I, fázové orákulum O_f|x⟩ = (−1)^f(x)|x⟩ (Turingove orákulové stroje, 1939),
// U_f a phase kickback, globálna vs. relatívna fáza, Deutschov algoritmus.
// Interaktívne: posuvník fázy ϕ (interferencia) a výber funkcie f₀…f₃ (Deutsch).

const DEUTSCH_F = [[0, 0], [1, 1], [0, 1], [1, 0]]; // f₀, f₁ konštantné; f₂ = x, f₃ = ¬x vyvážené

class L22Oracle extends Level {
  get steps() { return [this.intro, this.interfere, this.oracle, this.kickback, this.deutsch]; }

  setup() {
    this.cam = new OrbitCam([0, 0.5, 0], 11, 0.5, 0.3, 5, 20);
    this.phase = 'intro';
    this.ph = 0;      // relatívna fáza druhej cesty (rad)
    this.f = -1;      // zvolená funkcia v Deutschovi
    this.tried = new Set();
  }

  intro() {
    this.phase = 'intro';
    this.quest(tr('Vypočuj si Jozsu', 'Listen to Jozsa', 'Послухай Йожу'), { easy: tr('🔮 informácia vo fáze', '🔮 information in the phase', '🔮 інформація у фазі'), hard: tr('|±⟩: rovnaká Z-štatistika, ⟨+|−⟩ = 0', '|±⟩: the same Z statistics, ⟨+|−⟩ = 0', '|±⟩: однакова Z-статистика, ⟨+|−⟩ = 0') });
    this.say([
      tr('S Davidom Deutschom sme v roku 1992 ukázali úlohu, ktorú kvantový počítač rieši jedinou otázkou. Tajomstvo? Informácia sa skrýva vo FÁZE.',
        'In 1992, with David Deutsch, we showed a task a quantum computer solves with a single question. The secret? The information hides in the PHASE.',
        'У 1992 році з Девідом Дойчем ми показали задачу, яку квантовий комп’ютер розв’язує одним запитанням. Секрет? Інформація ховається у ФАЗІ.'),
      tr('Pozri na |+⟩ = (|0⟩+|1⟩)/√2 a |−⟩ = (|0⟩−|1⟩)/√2. V Z-meraní dávajú rovnako ½ a ½ — a predsa sú ORTOGONÁLNE. Líšia sa len znamienkom.',
        'Look at |+⟩ = (|0⟩+|1⟩)/√2 and |−⟩ = (|0⟩−|1⟩)/√2. In a Z measurement they give the same ½ and ½ — and yet they are ORTHOGONAL. They differ only by a sign.',
        'Подивись на |+⟩ = (|0⟩+|1⟩)/√2 і |−⟩ = (|0⟩−|1⟩)/√2. У Z-вимірюванні вони дають однаково ½ і ½ — і все ж вони ОРТОГОНАЛЬНІ. Відрізняються лише знаком.'),
      tr('Hadamard ich rozlíši: H|+⟩ = |0⟩, H|−⟩ = |1⟩. Fázu nevidno priamo, ale interferencia ju premení na výsledok merania.',
        'A Hadamard tells them apart: H|+⟩ = |0⟩, H|−⟩ = |1⟩. The phase is not visible directly, but interference turns it into a measurement outcome.',
        'Адамар їх розрізняє: H|+⟩ = |0⟩, H|−⟩ = |1⟩. Фазу не видно напряму, але інтерференція перетворює її на результат вимірювання.'),
    ], () => this.ask({
      q: tr('Ako rozlíšiš |+⟩ od |−⟩, keď v Z-meraní dávajú rovnakú štatistiku?', 'How do you tell |+⟩ from |−⟩ when they give the same statistics in a Z measurement?', 'Як розрізнити |+⟩ і |−⟩, коли в Z-вимірюванні вони дають однакову статистику?'),
      options: [
        tr('Pred meraním použijem H: |+⟩ → |0⟩ a |−⟩ → |1⟩.', 'Apply H before measuring: |+⟩ → |0⟩ and |−⟩ → |1⟩.', 'Перед вимірюванням застосую H: |+⟩ → |0⟩ і |−⟩ → |1⟩.'),
        tr('Zmeriam Z veľakrát a porovnám priemery.', 'Measure Z many times and compare the averages.', 'Виміряю Z багато разів і порівняю середні.'),
        tr('Nedajú sa rozlíšiť — sú to rovnaké stavy.', 'They cannot be told apart — they are the same state.', 'Їх не можна розрізнити — це той самий стан.'),
        tr('Zmeriam ich celkovú (globálnu) fázu.', 'Measure their overall (global) phase.', 'Виміряю їхню загальну (глобальну) фазу.'),
      ],
      correct: 0, weak: 1,
      why: tr('Relatívna fáza sa v Z nevidí, no H ju premení na rozdiel v populáciách. Preto sú ortogonálne a dokonale rozlíšiteľné — v správnej báze.',
        'The relative phase is invisible in Z, but H turns it into a difference in populations. That is why they are orthogonal and perfectly distinguishable — in the right basis.',
        'Відносна фаза в Z невидима, але H перетворює її на різницю заселеностей. Тому вони ортогональні й ідеально розрізнювані — у правильному базисі.'),
      whyWrong: { 1: tr('Z-štatistika je pre oba stavy presne ½ / ½ — žiadne množstvo Z-meraní ich neodlíši.', 'The Z statistics are exactly ½ / ½ for both — no amount of Z measurements will separate them.', 'Z-статистика для обох точно ½ / ½ — жодна кількість Z-вимірювань їх не розрізнить.') },
    }, () => { this.grant(['jozsap', 'plusminus']); this.next(); }));
  }

  // interaktívne: dve cesty s fázovým rozdielom ϕ → P(0) = (1 + cos ϕ)/2
  interfere() {
    this.phase = 'interfere'; this.ph = 0;
    this.quest(tr('Interferencia: zhasni výstup |0⟩', 'Interference: switch off the |0⟩ output', 'Інтерференція: погаси вихід |0⟩'), { easy: tr('posuň ϕ, kým P(0) = 0', 'slide ϕ until P(0) = 0', 'посунь ϕ, доки P(0) = 0'), hard: tr('P = |a₁+a₂|² = |a₁|²+|a₂|²+2Re(a₁*a₂) = (1+cos ϕ)/2', 'P = |a₁+a₂|² = |a₁|²+|a₂|²+2Re(a₁*a₂) = (1+cos ϕ)/2', 'P = |a₁+a₂|² = |a₁|²+|a₂|²+2Re(a₁*a₂) = (1+cos ϕ)/2') });
    this.say([
      tr('Dve cesty k výstupu |0⟩ s amplitúdami a₁ = ½ a a₂ = e<sup>iϕ</sup>/2. Kvantovo sčítame AMPLITÚDY: P = |a₁ + a₂|² = |a₁|² + |a₂|² + 2Re(a₁*a₂) = (1 + cos ϕ)/2.',
        'Two paths to the |0⟩ output with amplitudes a₁ = ½ and a₂ = e<sup>iϕ</sup>/2. Quantumly we add AMPLITUDES: P = |a₁ + a₂|² = |a₁|² + |a₂|² + 2Re(a₁*a₂) = (1 + cos ϕ)/2.',
        'Два шляхи до виходу |0⟩ з амплітудами a₁ = ½ і a₂ = e<sup>iϕ</sup>/2. Квантово додаємо АМПЛІТУДИ: P = |a₁ + a₂|² = |a₁|² + |a₂|² + 2Re(a₁*a₂) = (1 + cos ϕ)/2.'),
      tr('Člen 2Re(a₁*a₂) je interferencia. Nastav ϕ tak, aby sa cesty úplne vyrušili.', 'The term 2Re(a₁*a₂) is interference. Set ϕ so that the paths cancel completely.', 'Член 2Re(a₁*a₂) — це інтерференція. Встанови ϕ так, щоб шляхи повністю погасили одне одного.'),
    ], () => {
      let done = false;
      const out = UI.info('');
      const upd = () => { const P = (1 + Math.cos(this.ph)) / 2; out.innerHTML = `P(0) = (1 + cos ϕ)/2 = <b>${P.toFixed(3)}</b> · ${tr('klasicky by bolo', 'classically it would be', 'класично було б')} ½`; };
      const sl = UI.slider('ϕ', 0, 360, 5, 0, (v) => {
        this.ph = v * Math.PI / 180; upd();
        if (!done && Math.abs(v - 180) < 1) {
          done = true; UI.panelHide();
          this.ask({
            q: tr('Prečo pri ϕ = π dve cesty, každá s pravdepodobnosťou ¼, dajú spolu P = 0?', 'Why at ϕ = π do two paths, each with probability ¼, together give P = 0?', 'Чому при ϕ = π два шляхи, кожен з імовірністю ¼, разом дають P = 0?'),
            options: [
              tr('Sčítavajú sa amplitúdy ½ a −½, nie pravdepodobnosti; interferenčný člen 2Re(a₁*a₂) = −½.', 'Amplitudes ½ and −½ add, not probabilities; the interference term 2Re(a₁*a₂) = −½.', 'Додаються амплітуди ½ і −½, а не ймовірності; інтерференційний член 2Re(a₁*a₂) = −½.'),
              tr('Častica sa pri ϕ = π stratí.', 'The particle is lost at ϕ = π.', 'Частинка при ϕ = π губиться.'),
              tr('Pravdepodobnosti sa odčítajú: ¼ − ¼ = 0.', 'Probabilities subtract: ¼ − ¼ = 0.', 'Імовірності віднімаються: ¼ − ¼ = 0.'),
              tr('Je to chyba merania.', 'It is a measurement error.', 'Це помилка вимірювання.'),
            ],
            correct: 0, weak: 2,
            why: tr('Pravdepodobnosti sú vždy nezáporné a nikdy sa neodčítajú. Ruší sa až na úrovni amplitúd — pravdepodobnosť sa „presunie“ do druhého výstupu |1⟩.',
              'Probabilities are always non-negative and never subtract. Cancellation happens at the level of amplitudes — the probability "moves" to the other output |1⟩.',
              'Імовірності завжди невід’ємні й ніколи не віднімаються. Скасування відбувається на рівні амплітуд — імовірність «переходить» у другий вихід |1⟩.'),
            whyWrong: { 2: tr('Pravdepodobnosti sa neodčítavajú. Záporné môže byť len znamienko amplitúdy.', 'Probabilities do not subtract. Only an amplitude’s sign can be negative.', 'Імовірності не віднімаються. Від’ємним може бути лише знак амплітуди.') },
          }, () => { this.grant(['interf']); this.next(); });
        }
        return v + '°';
      });
      UI.panelSet(tr('Dve cesty, jedna fáza', 'Two paths, one phase', 'Два шляхи, одна фаза'), [sl, out,
        UI.info(tr('H = (1/√2)[[1, 1], [1, −1]] a H² = I: druhý Hadamard „zloží“ cesty späť.', 'H = (1/√2)[[1, 1], [1, −1]] and H² = I: a second Hadamard "folds" the paths back.', 'H = (1/√2)[[1, 1], [1, −1]] і H² = I: другий Адамар «складає» шляхи назад.'))]);
      upd();
    });
  }

  oracle() {
    this.phase = 'oracle'; this.ph = Math.PI;
    this.quest(tr('Fázové orákulum', 'The phase oracle', 'Фазовий оракул'), { easy: tr('čierna skrinka pridá znamienko', 'a black box adds a sign', 'чорна скринька додає знак'), hard: tr('O<sub>f</sub>|x⟩ = (−1)<sup>f(x)</sup>|x⟩; U<sub>f</sub>|x⟩|y⟩ = |x⟩|y⊕f(x)⟩', 'O<sub>f</sub>|x⟩ = (−1)<sup>f(x)</sup>|x⟩; U<sub>f</sub>|x⟩|y⟩ = |x⟩|y⊕f(x)⟩', 'O<sub>f</sub>|x⟩ = (−1)<sup>f(x)</sup>|x⟩; U<sub>f</sub>|x⟩|y⟩ = |x⟩|y⊕f(x)⟩') });
    this.say([
      tr('ORÁKULUM je čierna skrinka, ktorá pozná funkciu f. Pojem pochádza od Alana Turinga (1939): stroj, ktorý sa smie pýtať „veštca“ (ako v kapitole o Turingovom stroji u Fischera).',
        'An ORACLE is a black box that knows a function f. The notion comes from Alan Turing (1939): a machine allowed to ask an "oracle" (as in the chapter on Turing’s machine in Fischer).',
        'ОРАКУЛ — чорна скринька, що знає функцію f. Поняття походить від Алана Тюрінга (1939): машина, якій дозволено питати «віщуна» (як у розділі про машину Тюрінга у Фішера).'),
      tr('Kvantové orákulum je unitárne: U<sub>f</sub>|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩. Jeho fázová verzia O<sub>f</sub>|x⟩ = (−1)<sup>f(x)</sup>|x⟩ neprepíše hodnotu, len pridá ZNAMIENKO.',
        'A quantum oracle is unitary: U<sub>f</sub>|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩. Its phase version O<sub>f</sub>|x⟩ = (−1)<sup>f(x)</sup>|x⟩ writes no value, it only adds a SIGN.',
        'Квантовий оракул унітарний: U<sub>f</sub>|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩. Його фазова версія O<sub>f</sub>|x⟩ = (−1)<sup>f(x)</sup>|x⟩ не записує значення, лише додає ЗНАК.'),
      tr('Pozor na mieru zložitosti: počítame DOTAZY na orákulum, nie celkový čas. T<sub>quant</sub> = T<sub>prep</sub> + N·T<sub>Uf</sub> + T<sub>other</sub> + T<sub>meas</sub>.',
        'Mind the complexity measure: we count QUERIES to the oracle, not total time. T<sub>quant</sub> = T<sub>prep</sub> + N·T<sub>Uf</sub> + T<sub>other</sub> + T<sub>meas</sub>.',
        'Зважай на міру складності: рахуємо ЗАПИТИ до оракула, а не загальний час. T<sub>quant</sub> = T<sub>prep</sub> + N·T<sub>Uf</sub> + T<sub>other</sub> + T<sub>meas</sub>.'),
    ], () => this.ask({
      q: tr('Čo urobí fázové orákulum O<sub>f</sub> so stavom |x⟩, keď f(x) = 1?', 'What does the phase oracle O<sub>f</sub> do to the state |x⟩ when f(x) = 1?', 'Що робить фазовий оракул O<sub>f</sub> зі станом |x⟩, коли f(x) = 1?'),
      options: [
        tr('Vynásobí ho −1: |x⟩ → −|x⟩.', 'Multiplies it by −1: |x⟩ → −|x⟩.', 'Множить його на −1: |x⟩ → −|x⟩.'),
        tr('Preklopí ho na |x ⊕ 1⟩.', 'Flips it to |x ⊕ 1⟩.', 'Перевертає його на |x ⊕ 1⟩.'),
        tr('Zmeria ho a vráti 1.', 'Measures it and returns 1.', 'Вимірює його й повертає 1.'),
        tr('Zmaže ho.', 'Erases it.', 'Стирає його.'),
      ],
      correct: 0, weak: 1,
      why: tr('Fázové orákulum zapíše f(x) do znamienka amplitúdy. Samotné znamienko sa nedá zmerať — ale v superpozícii sa stane RELATÍVNOU fázou a interferencia ho prečíta.',
        'The phase oracle writes f(x) into the sign of the amplitude. The sign alone cannot be measured — but in a superposition it becomes a RELATIVE phase and interference reads it.',
        'Фазовий оракул записує f(x) у знак амплітуди. Сам знак виміряти не можна — але в суперпозиції він стає ВІДНОСНОЮ фазою, і інтерференція його зчитує.'),
      whyWrong: { 1: tr('To robí bitové orákulum U<sub>f</sub> na pomocnom qubite y. Fázová verzia nemení bázový stav, len znamienko.', 'That is what the bit oracle U<sub>f</sub> does to the ancilla y. The phase version does not change the basis state, only the sign.', 'Це робить бітовий оракул U<sub>f</sub> з допоміжним кубітом y. Фазова версія не змінює базисний стан, лише знак.') },
    }, () => { this.grant(['phaseor', 'turingor', 'oracle']); this.next(); }));
  }

  kickback() {
    this.phase = 'kickback';
    this.quest(tr('Phase kickback a globálna fáza', 'Phase kickback and global phase', 'Phase kickback і глобальна фаза'), { easy: tr('znamienko „skočí“ na vstup', 'the sign "jumps" onto the input', 'знак «перескакує» на вхід'), hard: tr('U<sub>f</sub>|x⟩|−⟩ = (−1)<sup>f(x)</sup>|x⟩|−⟩', 'U<sub>f</sub>|x⟩|−⟩ = (−1)<sup>f(x)</sup>|x⟩|−⟩', 'U<sub>f</sub>|x⟩|−⟩ = (−1)<sup>f(x)</sup>|x⟩|−⟩') });
    this.say([
      tr('Trik: pomocný qubit pripravíme do |−⟩. Potom U<sub>f</sub>|x⟩|−⟩ = |x⟩(|f(x)⟩ − |1⊕f(x)⟩)/√2 = (−1)<sup>f(x)</sup>|x⟩|−⟩. Cieľ sa nezmení — znamienko „odskočí“ na vstup. To je PHASE KICKBACK.',
        'The trick: prepare the ancilla in |−⟩. Then U<sub>f</sub>|x⟩|−⟩ = |x⟩(|f(x)⟩ − |1⊕f(x)⟩)/√2 = (−1)<sup>f(x)</sup>|x⟩|−⟩. The target is unchanged — the sign "kicks back" onto the input. That is PHASE KICKBACK.',
        'Трюк: допоміжний кубіт готуємо в |−⟩. Тоді U<sub>f</sub>|x⟩|−⟩ = |x⟩(|f(x)⟩ − |1⊕f(x)⟩)/√2 = (−1)<sup>f(x)</sup>|x⟩|−⟩. Ціль не змінюється — знак «відскакує» на вхід. Це PHASE KICKBACK.'),
      tr('Pozor: ak by f(x) = 1 pre VŠETKY x, znamienko −1 je GLOBÁLNA fáza. Pre g = f ⊕ 1 platí ψ<sub>g</sub> = −ψ<sub>f</sub> a ρ je rovnaká — nemerateľné. Informácia je len v RELATÍVNYCH fázach.',
        'Beware: if f(x) = 1 for ALL x, the sign −1 is a GLOBAL phase. For g = f ⊕ 1 we have ψ<sub>g</sub> = −ψ<sub>f</sub> and the same ρ — unmeasurable. Information is only in RELATIVE phases.',
        'Обережно: якщо f(x) = 1 для ВСІХ x, знак −1 — ГЛОБАЛЬНА фаза. Для g = f ⊕ 1 маємо ψ<sub>g</sub> = −ψ<sub>f</sub> і той самий ρ — невимірювано. Інформація лише у ВІДНОСНИХ фазах.'),
    ], () => this.ask({
      q: tr('Funkcie f a g = f ⊕ 1 dajú stavy ψ<sub>g</sub> = −ψ<sub>f</sub>. Dajú sa nejakým meraním rozlíšiť?', 'The functions f and g = f ⊕ 1 give states ψ<sub>g</sub> = −ψ<sub>f</sub>. Can any measurement tell them apart?', 'Функції f і g = f ⊕ 1 дають стани ψ<sub>g</sub> = −ψ<sub>f</sub>. Чи можна їх розрізнити якимось вимірюванням?'),
      options: [
        tr('Nie — líšia sa len globálnou fázou, majú rovnakú maticu hustoty ρ.', 'No — they differ only by a global phase and have the same density matrix ρ.', 'Ні — вони відрізняються лише глобальною фазою й мають ту саму матрицю густини ρ.'),
        tr('Áno — meraním v X-báze.', 'Yes — by measuring in the X basis.', 'Так — вимірюванням у базисі X.'),
        tr('Áno — stačí zmerať znamienko.', 'Yes — just measure the sign.', 'Так — досить виміряти знак.'),
        tr('Áno, ak opakujeme meranie dosť dlho.', 'Yes, if we repeat the measurement long enough.', 'Так, якщо повторювати вимірювання досить довго.'),
      ],
      correct: 0, weak: 2,
      why: tr('Globálna fáza vypadne z |ψ⟩⟨ψ|. Preto Deutschov algoritmus nezistí f(0) samé — zistí len f(0) ⊕ f(1), teda RELATÍVNU fázu.',
        'A global phase drops out of |ψ⟩⟨ψ|. That is why Deutsch’s algorithm does not find f(0) itself — only f(0) ⊕ f(1), the RELATIVE phase.',
        'Глобальна фаза випадає з |ψ⟩⟨ψ|. Тому алгоритм Дойча не з’ясовує саме f(0) — лише f(0) ⊕ f(1), тобто ВІДНОСНУ фазу.'),
      whyWrong: { 2: tr('Znamienko celého stavu nie je pozorovateľné — každá pravdepodobnosť |⟨φ|ψ⟩|² je preň slepá.', 'The sign of the whole state is not observable — every probability |⟨φ|ψ⟩|² is blind to it.', 'Знак усього стану не спостережуваний — кожна ймовірність |⟨φ|ψ⟩|² до нього сліпа.') },
    }, () => { this.grant(['kickback', 'globalph', 'relph']); this.next(); }));
  }

  // interaktívne: vyber funkciu, sleduj stav po orákule a výsledok merania
  deutsch() {
    this.phase = 'deutsch'; this.f = -1; this.tried = new Set();
    this.quest(tr('Deutschov algoritmus: vyskúšaj všetky štyri funkcie', 'Deutsch’s algorithm: try all four functions', 'Алгоритм Дойча: спробуй усі чотири функції'), { easy: tr('jedna otázka: konštantná či vyvážená?', 'one question: constant or balanced?', 'одне питання: стала чи збалансована?'), hard: tr('|0⟩|1⟩ → H⊗H → U<sub>f</sub> → H⊗I → meraj f(0)⊕f(1)', '|0⟩|1⟩ → H⊗H → U<sub>f</sub> → H⊗I → measure f(0)⊕f(1)', '|0⟩|1⟩ → H⊗H → U<sub>f</sub> → H⊗I → вимір f(0)⊕f(1)') });
    this.say([
      tr('Funkcie f: {0,1} → {0,1} sú štyri: f₀ = 0, f₁ = 1 (KONŠTANTNÉ), f₂ = x, f₃ = ¬x (VYVÁŽENÉ). Klasicky potrebuješ dve otázky — f(0) aj f(1).',
        'There are four functions f: {0,1} → {0,1}: f₀ = 0, f₁ = 1 (CONSTANT), f₂ = x, f₃ = ¬x (BALANCED). Classically you need two questions — f(0) and f(1).',
        'Функцій f: {0,1} → {0,1} чотири: f₀ = 0, f₁ = 1 (СТАЛІ), f₂ = x, f₃ = ¬x (ЗБАЛАНСОВАНІ). Класично потрібні два запитання — f(0) і f(1).'),
      tr('Kvantovo: |0⟩|1⟩ → H⊗H → |+⟩|−⟩ → U<sub>f</sub> → ((−1)<sup>f(0)</sup>|0⟩ + (−1)<sup>f(1)</sup>|1⟩)/√2 ⊗ |−⟩ → H. Výstupné amplitúdy sú [(−1)<sup>f(0)</sup> ± (−1)<sup>f(1)</sup>]/2. Vyskúšaj všetky štyri f.',
        'Quantumly: |0⟩|1⟩ → H⊗H → |+⟩|−⟩ → U<sub>f</sub> → ((−1)<sup>f(0)</sup>|0⟩ + (−1)<sup>f(1)</sup>|1⟩)/√2 ⊗ |−⟩ → H. The output amplitudes are [(−1)<sup>f(0)</sup> ± (−1)<sup>f(1)</sup>]/2. Try all four f.',
        'Квантово: |0⟩|1⟩ → H⊗H → |+⟩|−⟩ → U<sub>f</sub> → ((−1)<sup>f(0)</sup>|0⟩ + (−1)<sup>f(1)</sup>|1⟩)/√2 ⊗ |−⟩ → H. Вихідні амплітуди [(−1)<sup>f(0)</sup> ± (−1)<sup>f(1)</sup>]/2. Спробуй усі чотири f.'),
    ], () => {
      const out = UI.info(tr('Vyber funkciu.', 'Choose a function.', 'Обери функцію.'));
      const name = ['f₀ = 0', 'f₁ = 1', 'f₂ = x', 'f₃ = ¬x'];
      const pick = (k) => {
        this.f = k; this.tried.add(k);
        const [a, b] = DEUTSCH_F[k], s0 = a ? -1 : 1, s1 = b ? -1 : 1, sg = (v) => (v < 0 ? '−' : '');
        const after = s0 === s1 ? `${sg(s0)}|+⟩` : `${sg(s0)}|−⟩`, m = a ^ b;
        out.innerHTML = `${name[k]}: O<sub>f</sub>|+⟩ = <b>${after}</b> → H → ${sg(s0)}|${m}⟩ · ${tr('meranie', 'measurement', 'вимірювання')}: <b>${m}</b> = f(0)⊕f(1) → ${m ? tr('VYVÁŽENÁ', 'BALANCED', 'ЗБАЛАНСОВАНА') : tr('KONŠTANTNÁ', 'CONSTANT', 'СТАЛА')}<br><small>${this.tried.size}/4</small>`;
        if (this.tried.size === 4) {
          UI.panelHide();
          this.ask({
            q: tr('Koľko dotazov na orákulum potrebuje Deutschov algoritmus a čo presne zistí?', 'How many oracle queries does Deutsch’s algorithm need, and what exactly does it find?', 'Скільки запитів до оракула потребує алгоритм Дойча і що саме він з’ясовує?'),
            options: [
              tr('Jeden dotaz; zistí f(0) ⊕ f(1), teda či je f konštantná alebo vyvážená — nie hodnoty samé.', 'One query; it finds f(0) ⊕ f(1), i.e. whether f is constant or balanced — not the values themselves.', 'Один запит; з’ясовує f(0) ⊕ f(1), тобто чи f стала чи збалансована — а не самі значення.'),
              tr('Jeden dotaz; zistí naraz f(0) aj f(1).', 'One query; it finds both f(0) and f(1) at once.', 'Один запит; з’ясовує одразу і f(0), і f(1).'),
              tr('Dva dotazy, rovnako ako klasicky.', 'Two queries, the same as classically.', 'Два запити, як і класично.'),
              tr('Žiadny dotaz — výsledok je náhodný.', 'No query — the outcome is random.', 'Жодного запиту — результат випадковий.'),
            ],
            correct: 0, weak: 1,
            why: tr('Paralelizmus nedáva všetky hodnoty — meranie vráti len jeden bit. Interferencia však zariadi, aby ten bit bol práve globálna vlastnosť f(0) ⊕ f(1). Napr. f₁ dá −|+⟩ a f₀ dá |+⟩ — rovnaký výsledok, lebo −1 je globálna fáza.',
              'Parallelism does not give all values — the measurement returns just one bit. Interference makes that bit exactly the global property f(0) ⊕ f(1). E.g. f₁ gives −|+⟩ and f₀ gives |+⟩ — the same outcome, since −1 is a global phase.',
              'Паралелізм не дає всіх значень — вимірювання повертає лише один біт. Але інтерференція робить цей біт саме глобальною властивістю f(0) ⊕ f(1). Напр. f₁ дає −|+⟩, а f₀ дає |+⟩ — той самий результат, бо −1 — глобальна фаза.'),
            whyWrong: { 1: tr('Z jedného merania dostaneš len jeden bit. f₀ a f₁ (aj f₂ a f₃) dajú rovnaký výsledok — hodnoty samé ostanú skryté.', 'One measurement gives only one bit. f₀ and f₁ (and f₂ and f₃) give the same outcome — the values themselves stay hidden.', 'Одне вимірювання дає лише один біт. f₀ і f₁ (а також f₂ і f₃) дають той самий результат — самі значення лишаються прихованими.') },
          }, () => { this.grant(['deutschalg', 'deutschp']); this.next(); });
        }
      };
      UI.panelSet(tr('Deutschovo orákulum', 'Deutsch’s oracle', 'Оракул Дойча'), [
        UI.row(...name.slice(0, 2).map((n, k) => UI.button(n, () => pick(k), 'big'))),
        UI.row(...name.slice(2).map((n, k) => UI.button(n, () => pick(k + 2), 'big'))),
        out,
      ]);
    });
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Výborne. Orákulum zapíše odpoveď do znamienka, kickback ho presunie na vstup a interferencia ho prečíta. Jedna správne položená otázka stačí.',
        'Well done. The oracle writes the answer into a sign, kickback moves it to the input and interference reads it. One well-posed question is enough.',
        'Чудово. Оракул записує відповідь у знак, kickback переносить його на вхід, а інтерференція зчитує. Досить одного правильно поставленого запитання.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // interferometer: dve cesty (horná s fázou ϕ), dva výstupy |0⟩ a |1⟩ so svietivosťou podľa pravdepodobnosti
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.4, 0], 0, 8), [0.16, 0.18, 0.26], { pattern: 1 });
    const ph = this.phase;
    let phi = this.ph;
    if (ph === 'deutsch' && this.f >= 0) { const [a, b] = DEUTSCH_F[this.f]; phi = (a ^ b) ? Math.PI : 0; }
    if (ph === 'intro') phi = (Math.sin(this.t * 0.6) > 0) ? 0 : Math.PI;
    const P0 = (1 + Math.cos(phi)) / 2;
    const L = [-3, 0.4, 0], U = [0, 0.4, -1.4], D = [0, 0.4, 1.4], R = [3, 0.4, 0];
    r.draw('box', M4.trs(L, Math.PI / 4, [0.7, 0.7, 0.08]), [0.6, 0.85, 1], { alpha: 0.6, emissive: 0.3 });
    r.draw('box', M4.trs(R, Math.PI / 4, [0.7, 0.7, 0.08]), [0.6, 0.85, 1], { alpha: 0.6, emissive: 0.3 });
    UI.label('h1', V3.add(L, [0, 0.8, 0]), 'H', 'small'); UI.label('h2', V3.add(R, [0, 0.8, 0]), 'H', 'small');
    r.rod(L, U, [0.85, 0.6, 1], 0.04); r.rod(U, R, [0.85, 0.6, 1], 0.04);
    r.rod(L, D, [0.85, 0.6, 1], 0.04); r.rod(D, R, [0.85, 0.6, 1], 0.04);
    // fázový posúvač / orákulum na hornej ceste
    r.draw('cylinder', M4.trs(U, 0, [0.35, 0.5, 0.35]), phaseColor3(phi), { emissive: 0.4 });
    UI.label('ora', V3.add(U, [0, 0.9, 0]), ph === 'interfere' ? 'e<sup>iϕ</sup>' : 'O<sub>f</sub>', 'npc small');
    // pohybujúce sa „vlny“ po oboch cestách
    for (let k = 0; k < 3; k++) {
      const s = (this.t * 0.5 + k / 3) % 1, seg = (a, b, x) => V3.add(a, V3.scale(V3.sub(b, a), x));
      const pu = s < 0.5 ? seg(L, U, s * 2) : seg(U, R, s * 2 - 1), pd = s < 0.5 ? seg(L, D, s * 2) : seg(D, R, s * 2 - 1);
      r.sphere(pu, 0.08, s < 0.5 ? [1, 1, 1] : phaseColor3(phi), { emissive: 0.6 });
      r.sphere(pd, 0.08, [1, 1, 1], { emissive: 0.6 });
    }
    // výstupy
    const O0 = [4.6, 0.4, -0.8], O1 = [4.6, 0.4, 0.8];
    r.rod(R, O0, [0.5, 0.5, 0.6], 0.02); r.rod(R, O1, [0.5, 0.5, 0.6], 0.02);
    r.sphere(O0, 0.25 + 0.3 * P0, [0.4, 1, 0.6], { emissive: 0.1 + 0.8 * P0, alpha: 0.3 + 0.7 * P0 });
    r.sphere(O1, 0.25 + 0.3 * (1 - P0), [1, 0.5, 0.4], { emissive: 0.1 + 0.8 * (1 - P0), alpha: 0.3 + 0.7 * (1 - P0) });
    UI.label('o0', V3.add(O0, [0, 0.8, 0]), `|0⟩ ${(P0 * 100).toFixed(0)} %`, 'small');
    UI.label('o1', V3.add(O1, [0, 0.8, 0]), `|1⟩ ${((1 - P0) * 100).toFixed(0)} %`, 'small');
    // Jozsa
    const mp = [-4.4, -1.2, 1.4];
    r.sphere(V3.add(mp, [0, 1.6, 0]), 0.32, [0.95, 0.85, 0.75], { emissive: 0.1 });
    r.draw('cylinder', M4.trs(mp, 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [0.85, 0.5, 1], 0.8));
    const cx = CODEX.find((c) => c.id === 'jozsap');
    UI.label('jozsa', V3.add(mp, [0, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}
