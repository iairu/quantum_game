'use strict';
// LEVEL 21 (poradie 19) — Bellov stav na SpinQ (mentor: Isaac Chuang)
// Prednáška 7: „Previazanosť ako výpočtový zdroj“ (SpinQ Gemini) — ρ_Φ⁺ vs. klasická zmes, korelátory XX/YY/ZZ,
// J-väzba → CZ → CNOT, pseudo-čistý stav a hranica ε > 1/3, tomografia 15 parametrov, experimenty I–III,
// fázová rotácia oneskorením, triplet/singlet, ρ_eff vs. ρ_phys.
// Interaktívne: posuvník oneskorenia τ → fáza φ koherencie ρ₀₀,₁₁ (experiment II).

const SPQ_DNU = 126; // Hz — efektívny rozdiel frekvencií, ktorý točí fázu koherencie počas oneskorenia

class L21SpinqBell extends Level {
  get steps() { return [this.intro, this.matrix, this.pulses, this.pps, this.tomo, this.spin]; }

  setup() {
    this.cam = new OrbitCam([0, 0.4, 0], 11, 0.6, 0.35, 5, 20);
    this.phase = 'intro';
    this.mix = false;   // zobraz klasickú zmes namiesto Φ⁺
    this.tau = 0;       // oneskorenie v ms
    this.eps = 1;       // polarizácia pseudo-čistého stavu
  }

  phi() { return -2 * Math.PI * SPQ_DNU * this.tau / 1000; }

  intro() {
    this.phase = 'intro';
    this.quest(tr('Vypočuj si Chuanga', 'Listen to Chuang', 'Послухай Чуанга'), { easy: tr('📡 Bellov stav v molekule', '📡 a Bell state in a molecule', '📡 стан Белла в молекулі'), hard: tr('¹H + ³¹P v dimetylfosfite, H<sub>AB</sub> = H<sub>A</sub> ⊗ H<sub>B</sub>', '¹H + ³¹P in dimethyl phosphite, H<sub>AB</sub> = H<sub>A</sub> ⊗ H<sub>B</sub>', '¹H + ³¹P у диметилфосфіті, H<sub>AB</sub> = H<sub>A</sub> ⊗ H<sub>B</sub>') });
    this.say([
      tr('V roku 1998 sme s Gershenfeldom a Kubinecom spustili prvé kvantové algoritmy na jadrách v molekule. Dnes to isté zvládne stolový SpinQ Gemini.',
        'In 1998, with Gershenfeld and Kubinec, we ran the first quantum algorithms on nuclei in a molecule. Today a desktop SpinQ Gemini does the same.',
        'У 1998 році з Ґершенфельдом і Кубінцем ми запустили перші квантові алгоритми на ядрах у молекулі. Сьогодні те саме вміє настільний SpinQ Gemini.'),
      tr('Dva qubity sú jadrá ¹H (f ≈ 27,19 MHz) a ³¹P (f ≈ 11,01 MHz) v dimetylfosfite. Spolu tvoria priestor H<sub>AB</sub> = H<sub>A</sub> ⊗ H<sub>B</sub> s rozmerom 4.',
        'The two qubits are the nuclei ¹H (f ≈ 27.19 MHz) and ³¹P (f ≈ 11.01 MHz) in dimethyl phosphite. Together they form the space H<sub>AB</sub> = H<sub>A</sub> ⊗ H<sub>B</sub> of dimension 4.',
        'Два кубіти — ядра ¹H (f ≈ 27,19 МГц) і ³¹P (f ≈ 11,01 МГц) у диметилфосфіті. Разом вони утворюють простір H<sub>AB</sub> = H<sub>A</sub> ⊗ H<sub>B</sub> розмірності 4.'),
      tr('V ňom žijú štyri Bellove stavy: Φ± = (|00⟩ ± |11⟩)/√2 a Ψ± = (|01⟩ ± |10⟩)/√2. Dnes pripravíme Φ⁺ — a overíme, či je naozaj previazaný.',
        'There live the four Bell states: Φ± = (|00⟩ ± |11⟩)/√2 and Ψ± = (|01⟩ ± |10⟩)/√2. Today we prepare Φ⁺ — and check whether it is truly entangled.',
        'Там живуть чотири стани Белла: Φ± = (|00⟩ ± |11⟩)/√2 і Ψ± = (|01⟩ ± |10⟩)/√2. Сьогодні приготуємо Φ⁺ — і перевіримо, чи він справді заплутаний.'),
    ], () => { this.grant(['chuangp', 'bellfour']); this.next(); });
  }

  matrix() {
    this.phase = 'matrix'; this.mix = false;
    this.quest(tr('Matica hustoty: Φ⁺ vs. zmes', 'Density matrix: Φ⁺ vs. mixture', 'Матриця густини: Φ⁺ vs. суміш'), { easy: tr('rohové prvky = koherencia', 'corner entries = coherence', 'кутові елементи = когерентність'), hard: tr('ρ_Φ⁺ = ¼(II + XX − YY + ZZ)', 'ρ_Φ⁺ = ¼(II + XX − YY + ZZ)', 'ρ_Φ⁺ = ¼(II + XX − YY + ZZ)') });
    this.say([
      tr('Pozri na mriežku 4×4: ρ_Φ⁺ má štyri prvky ½ — dva na diagonále (|00⟩, |11⟩) a dva v ROHOCH. Rohový prvok ρ₀₀,₁₁ = ½ je koherencia medzi |00⟩ a |11⟩.',
        'Look at the 4×4 grid: ρ_Φ⁺ has four entries ½ — two on the diagonal (|00⟩, |11⟩) and two in the CORNERS. The corner entry ρ₀₀,₁₁ = ½ is the coherence between |00⟩ and |11⟩.',
        'Подивись на сітку 4×4: ρ_Φ⁺ має чотири елементи ½ — два на діагоналі (|00⟩, |11⟩) і два в КУТАХ. Кутовий елемент ρ₀₀,₁₁ = ½ — когерентність між |00⟩ і |11⟩.'),
      () => { this.mix = true; return tr('Teraz klasická zmes ρ<sub>mix</sub> = ½|00⟩⟨00| + ½|11⟩⟨11|. Diagonála rovnaká, rohy PRÁZDNE. V Z-meraní ich nerozlíšiš: obe dajú ⟨ZZ⟩ = 1.',
        'Now the classical mixture ρ<sub>mix</sub> = ½|00⟩⟨00| + ½|11⟩⟨11|. The diagonal is the same, the corners EMPTY. A Z measurement cannot tell them apart: both give ⟨ZZ⟩ = 1.',
        'Тепер класична суміш ρ<sub>mix</sub> = ½|00⟩⟨00| + ½|11⟩⟨11|. Діагональ та сама, кути ПОРОЖНІ. Z-вимірювання їх не розрізнить: обидва дають ⟨ZZ⟩ = 1.'); },
      tr('V Pauliho rozklade ρ_Φ⁺ = ¼(II + XX − YY + ZZ): ⟨XX⟩ = 1, ⟨YY⟩ = −1, ⟨ZZ⟩ = 1. Zmes má len ZZ; ⟨XX⟩ = ⟨YY⟩ = 0.',
        'In the Pauli decomposition ρ_Φ⁺ = ¼(II + XX − YY + ZZ): ⟨XX⟩ = 1, ⟨YY⟩ = −1, ⟨ZZ⟩ = 1. The mixture has only ZZ; ⟨XX⟩ = ⟨YY⟩ = 0.',
        'У розкладі Паулі ρ_Φ⁺ = ¼(II + XX − YY + ZZ): ⟨XX⟩ = 1, ⟨YY⟩ = −1, ⟨ZZ⟩ = 1. Суміш має лише ZZ; ⟨XX⟩ = ⟨YY⟩ = 0.'),
      tr('Entropia: S(A) = S(B) = ln 2, no S(AB) = 0. Vzájomná informácia I = S(A) + S(B) − S(AB) = 2 ln 2 — dvakrát viac, než dovolí klasika.',
        'Entropy: S(A) = S(B) = ln 2, but S(AB) = 0. Mutual information I = S(A) + S(B) − S(AB) = 2 ln 2 — twice what classics allows.',
        'Ентропія: S(A) = S(B) = ln 2, але S(AB) = 0. Взаємна інформація I = S(A) + S(B) − S(AB) = 2 ln 2 — удвічі більше, ніж дозволяє класика.'),
    ], () => this.ask({
      q: tr('Ktoré meranie odlíši Φ⁺ od klasickej zmesi ½|00⟩⟨00| + ½|11⟩⟨11|?', 'Which measurement distinguishes Φ⁺ from the classical mixture ½|00⟩⟨00| + ½|11⟩⟨11|?', 'Яке вимірювання відрізнить Φ⁺ від класичної суміші ½|00⟩⟨00| + ½|11⟩⟨11|?'),
      options: [
        tr('Korelátor ⟨XX⟩ (alebo ⟨YY⟩): pre Φ⁺ je 1, pre zmes 0.', 'The correlator ⟨XX⟩ (or ⟨YY⟩): it is 1 for Φ⁺ and 0 for the mixture.', 'Корелятор ⟨XX⟩ (або ⟨YY⟩): для Φ⁺ він 1, для суміші 0.'),
        tr('Korelátor ⟨ZZ⟩: pre Φ⁺ je 1, pre zmes −1.', 'The correlator ⟨ZZ⟩: it is 1 for Φ⁺ and −1 for the mixture.', 'Корелятор ⟨ZZ⟩: для Φ⁺ він 1, для суміші −1.'),
        tr('Pravdepodobnosť P(00) v Z-báze.', 'The probability P(00) in the Z basis.', 'Імовірність P(00) у базисі Z.'),
        tr('Žiadne — sú to rovnaké stavy.', 'None — they are the same states.', 'Жодне — це однакові стани.'),
      ],
      correct: 0, weak: 2,
      why: tr('Rohové koherencie sa prejavia až v X- a Y-meraniach. Preto tomografia musí merať vo viacerých bázach — samotná Z-báza vidí len diagonálu.',
        'The corner coherences show only in X and Y measurements. That is why tomography must measure in several bases — the Z basis alone sees only the diagonal.',
        'Кутові когерентності проявляються лише у X- та Y-вимірюваннях. Тому томографія мусить вимірювати в кількох базисах — сам базис Z бачить лише діагональ.'),
      whyWrong: { 1: tr('Obe majú ⟨ZZ⟩ = 1 — výsledky v Z sú rovnako zviazané. Rozdiel je v koherencii, nie v Z-štatistike.', 'Both have ⟨ZZ⟩ = 1 — the Z outcomes are equally tied. The difference is in coherence, not in Z statistics.', 'Обидва мають ⟨ZZ⟩ = 1 — Z-результати однаково пов’язані. Різниця в когерентності, а не в Z-статистиці.'), 2: tr('P(00) = ½ v oboch prípadoch — diagonála je rovnaká.', 'P(00) = ½ in both cases — the diagonal is the same.', 'P(00) = ½ в обох випадках — діагональ однакова.') },
    }, () => { this.grant(['paulicorr', 'mix']); this.next(); }));
  }

  pulses() {
    this.phase = 'pulses'; this.mix = false;
    this.quest(tr('Od J-väzby k CNOT', 'From J-coupling to CNOT', 'Від J-зв’язку до CNOT'), { easy: tr('čakanie = previazanie', 'waiting = entangling', 'чекання = заплутування'), hard: tr('U<sub>J</sub>(1/2J) → CZ → CNOT = (I⊗H) CZ (I⊗H)', 'U<sub>J</sub>(1/2J) → CZ → CNOT = (I⊗H) CZ (I⊗H)', 'U<sub>J</sub>(1/2J) → CZ → CNOT = (I⊗H) CZ (I⊗H)') });
    this.say([
      tr('Hamiltonián v rotujúcej sústave: H₀ = −ω<sub>A</sub> I<sub>z</sub>^A − ω<sub>B</sub> I<sub>z</sub>^B + 2πJ I<sub>z</sub>^A I<sub>z</sub>^B. J-väzba štiepi každú čiaru na dublet ν<sub>A</sub> ± J/2.',
        'The Hamiltonian in the rotating frame: H₀ = −ω<sub>A</sub> I<sub>z</sub>^A − ω<sub>B</sub> I<sub>z</sub>^B + 2πJ I<sub>z</sub>^A I<sub>z</sub>^B. J-coupling splits each line into a doublet ν<sub>A</sub> ± J/2.',
        'Гамільтоніан в обертовій системі: H₀ = −ω<sub>A</sub> I<sub>z</sub>^A − ω<sub>B</sub> I<sub>z</sub>^B + 2πJ I<sub>z</sub>^A I<sub>z</sub>^B. J-зв’язок розщеплює кожну лінію на дублет ν<sub>A</sub> ± J/2.'),
      tr('Voľný vývoj s J: U<sub>J</sub>(t) = exp(−iπJt/2 · σ<sub>zσ</sub><sub>z</sub>). Po čase t = 1/(2J) je to diag(e^−iπ/4, e^iπ/4, e^iπ/4, e^−iπ/4) — hradlo, ktoré podmieňuje fázu.',
        'Free evolution with J: U<sub>J</sub>(t) = exp(−iπJt/2 · σ<sub>zσ</sub><sub>z</sub>). After time t = 1/(2J) it is diag(e^−iπ/4, e^iπ/4, e^iπ/4, e^−iπ/4) — a gate that conditions the phase.',
        'Вільна еволюція з J: U<sub>J</sub>(t) = exp(−iπJt/2 · σ<sub>zσ</sub><sub>z</sub>). Після часу t = 1/(2J) це diag(e^−iπ/4, e^iπ/4, e^iπ/4, e^−iπ/4) — гейт, що обумовлює фазу.'),
      tr('S lokálnymi Rz(−π/2) na oba qubity a globálnou fázou dostaneme CZ = diag(1,1,1,−1). Dva Hadamardy na cieľ urobia z CZ CNOT. Na začiatku Ry(π/2)|0⟩ = |+⟩ na riadiaci qubit.',
        'With local Rz(−π/2) on both qubits and a global phase we get CZ = diag(1,1,1,−1). Two Hadamards on the target turn CZ into CNOT. At the start Ry(π/2)|0⟩ = |+⟩ on the control.',
        'З локальними Rz(−π/2) на обидва кубіти та глобальною фазою отримуємо CZ = diag(1,1,1,−1). Два Адамари на цілі перетворюють CZ на CNOT. На початку Ry(π/2)|0⟩ = |+⟩ на керуючий кубіт.'),
    ], () => this.ask({
      q: tr('Čo v NMR fyzicky „vykoná“ previazanie dvoch jadier?', 'What in NMR physically "performs" the entangling of two nuclei?', 'Що в ЯМР фізично «виконує» заплутування двох ядер?'),
      options: [
        tr('Voľný vývoj pod J-väzbou počas oneskorenia t = 1/(2J); RF impulzy ho len doladia na CZ/CNOT.', 'Free evolution under J-coupling during a delay t = 1/(2J); the RF pulses only tune it into CZ/CNOT.', 'Вільна еволюція під J-зв’язком протягом затримки t = 1/(2J); РЧ-імпульси лише налаштовують її на CZ/CNOT.'),
        tr('Jeden silný RF impulz na protón.', 'A single strong RF pulse on the proton.', 'Один сильний РЧ-імпульс на протон.'),
        tr('Meranie FID signálu.', 'Measuring the FID signal.', 'Вимірювання сигналу FID.'),
        tr('Zmena teploty vzorky.', 'Changing the sample’s temperature.', 'Зміна температури зразка.'),
      ],
      correct: 0, weak: 1,
      why: tr('Lokálne RF rotácie samy previazanosť nevytvoria. Interakciu dodáva J-väzba cez väzby molekuly — „čakanie“ je dvojqubitové hradlo.',
        'Local RF rotations alone cannot create entanglement. The interaction is supplied by J-coupling through the molecule’s bonds — "waiting" is the two-qubit gate.',
        'Самі локальні РЧ-повороти заплутаності не створять. Взаємодію дає J-зв’язок через зв’язки молекули — «чекання» і є двокубітним гейтом.'),
      whyWrong: { 1: tr('Impulz na jedno jadro je lokálna rotácia (jednoqubitové hradlo) — nepreviaže.', 'A pulse on one nucleus is a local rotation (a single-qubit gate) — it does not entangle.', 'Імпульс на одне ядро — локальний поворот (однокубітний гейт), він не заплутує.') },
    }, () => { this.grant(['jgate', 'jcoupling']); this.next(); }));
  }

  pps() {
    this.phase = 'pps'; this.eps = 1e-5;
    this.quest(tr('Pseudo-čistý stav a hranica 1/3', 'Pseudo-pure state and the 1/3 bound', 'Псевдочистий стан і межа 1/3'), { easy: tr('efektívny ≠ fyzický', 'effective ≠ physical', 'ефективний ≠ фізичний'), hard: tr('ρ = (1−ε)I/4 + ε|Φ⁺⟩⟨Φ⁺|, previazaný ⇔ ε > 1/3', 'ρ = (1−ε)I/4 + ε|Φ⁺⟩⟨Φ⁺|, entangled ⇔ ε > 1/3', 'ρ = (1−ε)I/4 + ε|Φ⁺⟩⟨Φ⁺|, заплутаний ⇔ ε > 1/3') });
    this.say([
      tr('Kvapalina pri izbovej teplote je takmer úplne zmiešaná. Pripravíme pseudo-čistý stav ρ = (1−ε) I/4 + ε|00⟩⟨00|; signál vidí len „odchýlku“ ε.',
        'A liquid at room temperature is almost completely mixed. We prepare a pseudo-pure state ρ = (1−ε) I/4 + ε|00⟩⟨00|; the signal sees only the "deviation" ε.',
        'Рідина за кімнатної температури майже повністю змішана. Готуємо псевдочистий стан ρ = (1−ε) I/4 + ε|00⟩⟨00|; сигнал бачить лише «відхилення» ε.'),
      tr('Po Bellovom obvode je ρ = (1−ε) I/4 + ε|Φ⁺⟩⟨Φ⁺|. Tento Wernerov stav je FYZICKY previazaný iba ak ε > 1/3. V NMR je ε ~ 10⁻⁵.',
        'After the Bell circuit ρ = (1−ε) I/4 + ε|Φ⁺⟩⟨Φ⁺|. This Werner state is PHYSICALLY entangled only if ε > 1/3. In NMR ε ~ 10⁻⁵.',
        'Після схеми Белла ρ = (1−ε) I/4 + ε|Φ⁺⟩⟨Φ⁺|. Цей стан Вернера ФІЗИЧНО заплутаний лише якщо ε > 1/3. У ЯМР ε ~ 10⁻⁵.'),
      tr('Preto rozlišujeme ρ<sub>eff</sub> (to, čo rekonštruujeme) a ρ<sub>phys</sub> (to, čo v skúmavke naozaj je). Braunstein a kol. (1999) ukázali, že také stavy sa dajú opísať aj separabilne. Kinematika ≠ dynamika.',
        'So we distinguish ρ<sub>eff</sub> (what we reconstruct) from ρ<sub>phys</sub> (what is really in the tube). Braunstein et al. (1999) showed such states can be described separably. Kinematics ≠ dynamics.',
        'Тому розрізняємо ρ<sub>eff</sub> (що реконструюємо) і ρ<sub>phys</sub> (що справді в пробірці). Браунштайн та ін. (1999) показали, що такі стани можна описати й сепарабельно. Кінематика ≠ динаміка.'),
    ], () => this.ask({
      q: tr('SpinQ ukáže „Bellov stav s vernosťou 0,94“. Je vzorka fyzicky previazaná?', 'SpinQ shows "a Bell state with fidelity 0.94". Is the sample physically entangled?', 'SpinQ показує «стан Белла з вірністю 0,94». Чи зразок фізично заплутаний?'),
      options: [
        tr('Nie — 0,94 je vernosť EFEKTÍVNEHO stavu; fyzický stav má ε ~ 10⁻⁵ ≪ 1/3, je separabilný.', 'No — 0.94 is the fidelity of the EFFECTIVE state; the physical state has ε ~ 10⁻⁵ ≪ 1/3 and is separable.', 'Ні — 0,94 — вірність ЕФЕКТИВНОГО стану; фізичний стан має ε ~ 10⁻⁵ ≪ 1/3 і сепарабельний.'),
        tr('Áno — vernosť nad 0,5 vždy znamená previazanosť.', 'Yes — fidelity above 0.5 always means entanglement.', 'Так — вірність понад 0,5 завжди означає заплутаність.'),
        tr('Áno, lebo sme použili CNOT.', 'Yes, because we used a CNOT.', 'Так, бо ми використали CNOT.'),
        tr('Nedá sa to vôbec posúdiť.', 'It cannot be judged at all.', 'Це взагалі неможливо оцінити.'),
      ],
      correct: 0, weak: 1,
      why: tr('NMR simuluje dynamiku previazaných stavov verne (logika obvodu je správna), no fyzický stav ansámblu je pod hranicou ε = 1/3. Výsledok je didakticky cenný, ale nie dôkaz previazanosti.',
        'NMR simulates the dynamics of entangled states faithfully (the circuit logic is right), but the physical ensemble state is below the ε = 1/3 bound. The result is didactically valuable, but not a proof of entanglement.',
        'ЯМР вірно імітує динаміку заплутаних станів (логіка схеми правильна), але фізичний стан ансамблю нижчий за межу ε = 1/3. Результат дидактично цінний, але не є доказом заплутаності.'),
      whyWrong: { 1: tr('Vernosť sa počíta voči ρ<sub>eff</sub> po odčítaní identity. Rozhoduje ε fyzického stavu.', 'Fidelity is computed against ρ<sub>eff</sub> after removing the identity part. What decides is the ε of the physical state.', 'Вірність рахують щодо ρ<sub>eff</sub> після вилучення одиничної частини. Вирішує ε фізичного стану.') },
    }, () => { this.grant(['ppseps', 'pps']); this.next(); }));
  }

  // interaktívne: oneskorenie τ otáča fázu koherencie (experiment II)
  tomo() {
    this.phase = 'tomo'; this.eps = 1; this.tau = 0;
    this.quest(tr('Tomografia: otoč fázu na −90°', 'Tomography: rotate the phase to −90°', 'Томографія: поверни фазу на −90°'), { easy: tr('posuň oneskorenie τ', 'slide the delay τ', 'посунь затримку τ'), hard: tr('|Φ<sub>φ</sub>⟩ = (|00⟩ + e<sup>iφ</sup>|11⟩)/√2, ρ₀₀,₁₁ = ½e<sup>−iφ</sup>', '|Φ<sub>φ</sub>⟩ = (|00⟩ + e<sup>iφ</sup>|11⟩)/√2, ρ₀₀,₁₁ = ½e<sup>−iφ</sup>', '|Φ<sub>φ</sub>⟩ = (|00⟩ + e<sup>iφ</sup>|11⟩)/√2, ρ₀₀,₁₁ = ½e<sup>−iφ</sup>') });
    this.say([
      tr('Run Circuit: PPS → impulzy → čítacie impulzy → FID s(t) ∝ M<sub>x</sub> + iM<sub>y</sub> → Fourier → tomografia. Matica 4×4 má 15 reálnych parametrov c<sub>ij</sub> = Tr[ρ σ<sub>i</sub>⊗σ<sub>j</sub>]: 3 + 3 lokálne a 9 korelácií.',
        'Run Circuit: PPS → pulses → readout pulses → FID s(t) ∝ M<sub>x</sub> + iM<sub>y</sub> → Fourier → tomography. The 4×4 matrix has 15 real parameters c<sub>ij</sub> = Tr[ρ σ<sub>i</sub>⊗σ<sub>j</sub>]: 3 + 3 local and 9 correlations.',
        'Run Circuit: PPS → імпульси → імпульси зчитування → FID s(t) ∝ M<sub>x</sub> + iM<sub>y</sub> → Фур’є → томографія. Матриця 4×4 має 15 дійсних параметрів c<sub>ij</sub> = Tr[ρ σ<sub>i</sub>⊗σ<sub>j</sub>]: 3 + 3 локальні та 9 кореляцій.'),
      tr('Experiment I dal ρ₀₀,₁₁ ≈ 0,44 − 0,03i (F ≈ 0,94). V experimente II vložíme pred čítanie oneskorenie τ: koherencia sa otáča, |Φ<sub>φ</sub>⟩ = (|00⟩ + e<sup>iφ</sup>|11⟩)/√2. Nastav τ tak, aby φ = −90°.',
        'Experiment I gave ρ₀₀,₁₁ ≈ 0.44 − 0.03i (F ≈ 0.94). In experiment II we insert a delay τ before readout: the coherence rotates, |Φ<sub>φ</sub>⟩ = (|00⟩ + e<sup>iφ</sup>|11⟩)/√2. Set τ so that φ = −90°.',
        'Експеримент I дав ρ₀₀,₁₁ ≈ 0,44 − 0,03i (F ≈ 0,94). В експерименті II перед зчитуванням вставляємо затримку τ: когерентність обертається, |Φ<sub>φ</sub>⟩ = (|00⟩ + e<sup>iφ</sup>|11⟩)/√2. Встанови τ так, щоб φ = −90°.'),
    ], () => {
      let done = false;
      const out = UI.info('');
      const upd = () => {
        const ph = this.phi(), deg = ((ph * 180 / Math.PI) % 360 + 540) % 360 - 180, re = 0.5 * Math.cos(-ph), im = 0.5 * Math.sin(-ph);
        out.innerHTML = `φ = ${deg.toFixed(1)}° · ρ<sub>00,11</sub> = ${re.toFixed(2)} ${im < 0 ? '−' : '+'} ${Math.abs(im).toFixed(2)}i`;
      };
      const sl = UI.slider(tr('oneskorenie τ', 'delay τ', 'затримка τ'), 0, 4, 0.05, this.tau, (v) => {
        this.tau = v; upd();
        if (!done && Math.abs(v - 2) < 0.03) {
          done = true; UI.panelHide();
          this.ask({
            q: tr('Namerané ρ₀₀,₁₁ ≈ 0,02 + 0,35i (arg ≈ 87°). Aký stav sme pripravili?', 'Measured ρ₀₀,₁₁ ≈ 0.02 + 0.35i (arg ≈ 87°). Which state did we prepare?', 'Виміряно ρ₀₀,₁₁ ≈ 0,02 + 0,35i (arg ≈ 87°). Який стан ми приготували?'),
            options: [
              tr('(|00⟩ − i|11⟩)/√2 — fáza φ ≈ −90°, lebo ρ₀₀,₁₁ = ½e<sup>−iφ</sup>.', '(|00⟩ − i|11⟩)/√2 — phase φ ≈ −90°, because ρ₀₀,₁₁ = ½e<sup>−iφ</sup>.', '(|00⟩ − i|11⟩)/√2 — фаза φ ≈ −90°, бо ρ₀₀,₁₁ = ½e<sup>−iφ</sup>.'),
              tr('(|00⟩ + i|11⟩)/√2 — fáza +90°.', '(|00⟩ + i|11⟩)/√2 — phase +90°.', '(|00⟩ + i|11⟩)/√2 — фаза +90°.'),
              tr('Klasickú zmes — koherencia zmizla.', 'A classical mixture — the coherence vanished.', 'Класичну суміш — когерентність зникла.'),
              tr('Ψ⁺ = (|01⟩ + |10⟩)/√2.', 'Ψ⁺ = (|01⟩ + |10⟩)/√2.', 'Ψ⁺ = (|01⟩ + |10⟩)/√2.'),
            ],
            correct: 0, weak: 1,
            why: tr('Rohový prvok je ⟨00|ρ|11⟩ = ½·e<sup>−iφ</sup>. Argument +87° teda znamená φ ≈ −90°. Veľkosť 0,35 < 0,5 hovorí o dekoherencii a nepresnostiach impulzov.',
              'The corner entry is ⟨00|ρ|11⟩ = ½·e<sup>−iφ</sup>. An argument of +87° therefore means φ ≈ −90°. The magnitude 0.35 < 0.5 tells of decoherence and pulse imperfections.',
              'Кутовий елемент ⟨00|ρ|11⟩ = ½·e<sup>−iφ</sup>. Аргумент +87° отже означає φ ≈ −90°. Модуль 0,35 < 0,5 свідчить про декогеренцію й неточності імпульсів.'),
            whyWrong: { 1: tr('Pozor na združenie: ρ₀₀,₁₁ = a₀₀·a₁₁*, takže fáza stavu má opačné znamienko než argument prvku.', 'Mind the conjugate: ρ₀₀,₁₁ = a₀₀·a₁₁*, so the state’s phase has the opposite sign to the entry’s argument.', 'Зважай на спряження: ρ₀₀,₁₁ = a₀₀·a₁₁*, тож фаза стану має протилежний знак до аргументу елемента.'), 2: tr('Koherencia |0,35| je stále veľká — zmes by mala rohy nulové.', 'The coherence |0.35| is still large — a mixture would have zero corners.', 'Когерентність |0,35| досі велика — суміш мала б нульові кути.') },
          }, () => { this.grant(['tomo15', 'tomography']); this.next(); });
        }
        return v.toFixed(2) + ' ms';
      });
      UI.panelSet(tr('Experiment II: oneskorenie pred čítaním', 'Experiment II: delay before readout', 'Експеримент II: затримка перед зчитуванням'), [sl, out,
        UI.info(tr(`Fáza sa točí rýchlosťou ≈ ${SPQ_DNU} Hz: φ = −2π·${SPQ_DNU} Hz·τ.`, `The phase turns at ≈ ${SPQ_DNU} Hz: φ = −2π·${SPQ_DNU} Hz·τ.`, `Фаза обертається з частотою ≈ ${SPQ_DNU} Гц: φ = −2π·${SPQ_DNU} Гц·τ.`))]);
      upd();
    });
  }

  spin() {
    this.phase = 'spin'; this.tau = 0;
    this.quest(tr('Triplet, singlet a poradie rotácií', 'Triplet, singlet and the order of rotations', 'Триплет, синглет і порядок поворотів'), { easy: tr('½ ⊗ ½ = 1 ⊕ 0', '½ ⊗ ½ = 1 ⊕ 0', '½ ⊗ ½ = 1 ⊕ 0'), hard: tr('|1,0⟩ = Ψ⁺, |0,0⟩ = Ψ⁻; R<sub>x</sub>R<sub>y</sub> ≠ R<sub>y</sub>R<sub>x</sub>', '|1,0⟩ = Ψ⁺, |0,0⟩ = Ψ⁻; R<sub>x</sub>R<sub>y</sub> ≠ R<sub>y</sub>R<sub>x</sub>', '|1,0⟩ = Ψ⁺, |0,0⟩ = Ψ⁻; R<sub>x</sub>R<sub>y</sub> ≠ R<sub>y</sub>R<sub>x</sub>') });
    this.say([
      tr('Experiment III: sekvencia √X, √Y, √Z dá Rz·Ry·Rx ∼ HZ a opäť Bellov stav, ρ₀₀,₁₁ ≈ 0,43 − 0,08i (F ≈ 0,93). Poradie je dôležité: R<sub>x</sub>R<sub>y</sub> ≠ R<sub>y</sub>R<sub>x</sub>.',
        'Experiment III: the sequence √X, √Y, √Z gives Rz·Ry·Rx ∼ HZ and again a Bell state, ρ₀₀,₁₁ ≈ 0.43 − 0.08i (F ≈ 0.93). Order matters: R<sub>x</sub>R<sub>y</sub> ≠ R<sub>y</sub>R<sub>x</sub>.',
        'Експеримент III: послідовність √X, √Y, √Z дає Rz·Ry·Rx ∼ HZ і знову стан Белла, ρ₀₀,₁₁ ≈ 0,43 − 0,08i (F ≈ 0,93). Порядок важливий: R<sub>x</sub>R<sub>y</sub> ≠ R<sub>y</sub>R<sub>x</sub>.'),
      tr('Skladanie spinov: ½ ⊗ ½ = 1 ⊕ 0. TRIPLET (S = 1): |1,1⟩ = |00⟩, |1,0⟩ = Ψ⁺ = (|01⟩+|10⟩)/√2, |1,−1⟩ = |11⟩. SINGLET (S = 0): Ψ⁻ = (|01⟩−|10⟩)/√2. Koeficienty 1/√2 sú Clebschove–Gordanove.',
        'Adding spins: ½ ⊗ ½ = 1 ⊕ 0. TRIPLET (S = 1): |1,1⟩ = |00⟩, |1,0⟩ = Ψ⁺ = (|01⟩+|10⟩)/√2, |1,−1⟩ = |11⟩. SINGLET (S = 0): Ψ⁻ = (|01⟩−|10⟩)/√2. The 1/√2 coefficients are Clebsch–Gordan.',
        'Додавання спінів: ½ ⊗ ½ = 1 ⊕ 0. ТРИПЛЕТ (S = 1): |1,1⟩ = |00⟩, |1,0⟩ = Ψ⁺ = (|01⟩+|10⟩)/√2, |1,−1⟩ = |11⟩. СИНГЛЕТ (S = 0): Ψ⁻ = (|01⟩−|10⟩)/√2. Коефіцієнти 1/√2 — Клебша–Ґордана.'),
    ], () => this.ask({
      q: tr('Ktorý Bellov stav je singlet s celkovým spinom S = 0?', 'Which Bell state is the singlet with total spin S = 0?', 'Який стан Белла є синглетом із повним спіном S = 0?'),
      options: [
        tr('Ψ⁻ = (|01⟩ − |10⟩)/√2 — jediný antisymetrický.', 'Ψ⁻ = (|01⟩ − |10⟩)/√2 — the only antisymmetric one.', 'Ψ⁻ = (|01⟩ − |10⟩)/√2 — єдиний антисиметричний.'),
        tr('Φ⁺ = (|00⟩ + |11⟩)/√2.', 'Φ⁺ = (|00⟩ + |11⟩)/√2.', 'Φ⁺ = (|00⟩ + |11⟩)/√2.'),
        tr('Ψ⁺ = (|01⟩ + |10⟩)/√2.', 'Ψ⁺ = (|01⟩ + |10⟩)/√2.', 'Ψ⁺ = (|01⟩ + |10⟩)/√2.'),
        tr('|00⟩.', '|00⟩.', '|00⟩.'),
      ],
      correct: 0, weak: 2,
      why: tr('Ψ⁺ je |1,0⟩ tripletu (symetrický, S = 1). Singlet Ψ⁻ mení znamienko pri výmene qubitov a je rotačne invariantný.',
        'Ψ⁺ is |1,0⟩ of the triplet (symmetric, S = 1). The singlet Ψ⁻ changes sign under exchange of the qubits and is rotation-invariant.',
        'Ψ⁺ — це |1,0⟩ триплету (симетричний, S = 1). Синглет Ψ⁻ змінює знак при обміні кубітів і інваріантний щодо поворотів.'),
      whyWrong: { 2: tr('Ψ⁺ má M = 0, ale patrí do tripletu (S = 1). Singlet je antisymetrická kombinácia.', 'Ψ⁺ has M = 0 but belongs to the triplet (S = 1). The singlet is the antisymmetric combination.', 'Ψ⁺ має M = 0, але належить до триплету (S = 1). Синглет — антисиметрична комбінація.') },
    }, () => { this.grant(['tripsing']); this.next(); }));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Výborne. Pripravil(a) si Bellov stav z J-väzby, prečítal(a) ho tomografiou, otočil(a) jeho fázu — a vieš, prečo ρ<sub>eff</sub> ešte nie je fyzická previazanosť.',
        'Well done. You prepared a Bell state from J-coupling, read it by tomography, turned its phase — and you know why ρ<sub>eff</sub> is not yet physical entanglement.',
        'Чудово. Ти приготував(-ла) стан Белла з J-зв’язку, прочитав(-ла) його томографією, повернув(-ла) його фазу — і знаєш, чому ρ<sub>eff</sub> ще не є фізичною заплутаністю.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // „mestská“ matica hustoty 4×4: výška = |ρ_ij|, farba = fáza; vedľa dve jadrá ¹H a ³¹P
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.4, 0], 0, 8), [0.16, 0.18, 0.26], { pattern: 1 });
    const ph = this.phase, showRho = ph !== 'intro';
    const eps = ph === 'pps' ? 0.5 + 0.5 * Math.sin(this.t * 0.8) : 1; // v kroku PPS „dýcha“ ε
    const coh = this.mix ? 0 : 0.5 * eps, phi = this.phi();
    if (showRho) {
      const lab = ['00', '01', '10', '11'];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let m = 0, a = 0;
        if (i === j) m = (i === 0 || i === 3) ? 0.5 * eps + (1 - eps) / 4 : (1 - eps) / 4;
        else if ((i === 0 && j === 3) || (i === 3 && j === 0)) { m = coh; a = i === 0 ? -phi : phi; }
        const x = -1.5 + j, z = -1.5 + i, h = Math.max(0.02, m * 3);
        const col = i === j ? [0.45, 0.7, 1] : (m > 0 ? phaseColor3(a) : [0.3, 0.3, 0.35]);
        r.draw('box', M4.trs([x, -1.35 + h / 2, z], 0, [0.7, h, 0.7]), col, { emissive: m > 0.1 ? 0.3 : 0 });
      }
      lab.forEach((s, k) => { UI.label('rc' + k, [-1.5 + k, -1.2, -2.4], `⟨${s}|`, 'small'); UI.label('rr' + k, [-2.5, -1.2, -1.5 + k], `|${s}⟩`, 'small'); });
      if (ph === 'matrix' || ph === 'tomo') UI.hot([1.5, -1.35 + coh * 3 + 0.2, -1.5], this.mix ? tr('roh = 0 (zmes)', 'corner = 0 (mixture)', 'кут = 0 (суміш)') : 'ρ<sub>00,11</sub>', 50);
      if (ph === 'pps') UI.hot([0, 1.2, 0], `ε = ${eps.toFixed(2)} ${eps > 1 / 3 ? '> 1/3' : '≤ 1/3'}`, 60);
    }
    // jadrá ¹H a ³¹P s J-väzbou
    const H = [2.8, 0.6, -0.6], Pn = [3.6, 0.2, 0.8];
    r.rod(H, Pn, [0.6, 0.6, 0.7], 0.05, { emissive: ph === 'pulses' ? 0.3 + 0.3 * Math.sin(this.t * 4) : 0 });
    r.sphere(H, 0.32, [0.95, 0.95, 1], { emissive: 0.2 });
    r.sphere(Pn, 0.45, [1, 0.6, 0.3], { emissive: 0.2 });
    r.arrow(H, V3.add(H, [0.4 * Math.cos(this.t * 3), 0.6, 0.4 * Math.sin(this.t * 3)]), [1, 0.85, 0.3], 0.03);
    r.arrow(Pn, V3.add(Pn, [0.4 * Math.cos(this.t * 2), 0.7, 0.4 * Math.sin(this.t * 2)]), [1, 0.85, 0.3], 0.03);
    UI.label('nH', V3.add(H, [0, 0.8, 0]), '¹H', 'npc small');
    UI.label('nP', V3.add(Pn, [0, 1.0, 0]), '³¹P', 'npc small');
    // Chuang
    const mp = [-4.4, -1.2, 1.4];
    r.sphere(V3.add(mp, [0, 1.6, 0]), 0.32, [0.95, 0.85, 0.75], { emissive: 0.1 });
    r.draw('cylinder', M4.trs(mp, 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [1, 0.6, 0.85], 0.8));
    const cx = CODEX.find((c) => c.id === 'chuangp');
    UI.label('chuang', V3.add(mp, [0, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}

// farba fázy pre 3D (kruh farieb ako v phaseColor, ale ako RGB pole)
function phaseColor3(a) {
  const h = ((a / (2 * Math.PI)) % 1 + 1) % 1, f = (n) => { const k = (n + h * 6) % 6; return 1 - Math.max(0, Math.min(1, Math.min(k, 4 - k))); };
  return [0.25 + 0.75 * f(5), 0.25 + 0.75 * f(3), 0.25 + 0.75 * f(1)];
}
