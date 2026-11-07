'use strict';
// LEVEL 24 (poradie 22) — Mačací qubit (mentor: Mazyar Mirrahimi)
// Prednáška 8: „Mačacie qubity“ — Shor na mačacích qubitoch (RSA-2048: 22 593 fyzických, 1 433 logických, 3,14 dňa),
// |0_L⟩ ≃ |α⟩, |1_L⟩ ≃ |−α⟩, prekryv e^{−2|α|²}, dvojfotónová disipácia (Lindblad, L = a² − α²),
// Γ_bit ~ e^{−2n̄} vs. Γ_phase ~ n̄, mačacie stavy C±, a|C±⟩ ∝ |C∓⟩, kvantový Zenónov jav a Zenónovo hradlo,
// pamäťový + bufferový rezonátor (κ₂ ≈ 4|g₂|²/κ_b), dekoherencia vs. disipácia vs. strata informácie, porovnanie s Majoranou.
// Interaktívne: posuvník |α| → prekryv koherentných stavov a pomer chýb.

class L24Cat extends Level {
  get steps() { return [this.intro, this.blobs, this.lindblad, this.bias, this.zeno, this.buffer]; }

  setup() {
    this.cam = new OrbitCam([0, 0.3, 0], 11, 0.6, 0.38, 5, 20);
    this.phase = 'intro';
    this.alpha = 1;    // |α|
    this.cat = 0;      // 0 = |±α⟩, 1 = mačacie stavy C±
  }

  intro() {
    this.phase = 'intro'; this.alpha = 1.5;
    this.quest(tr('Vypočuj si Mirrahimiho', 'Listen to Mirrahimi', 'Послухай Міррахімі'), { easy: tr('🐈 qubit z mačky', '🐈 a qubit from a cat', '🐈 кубіт із кішки'), hard: tr('RSA-2048: 22 593 fyz. / 1 433 log. qubitov, 3,14 dňa', 'RSA-2048: 22 593 phys. / 1 433 log. qubits, 3.14 days', 'RSA-2048: 22 593 фіз. / 1 433 лог. кубітів, 3,14 доби') });
    this.say([
      tr('Schrödingerova mačka (prvá kapitola Fischerovej knihy) bola myšlienkový experiment. My z nej robíme QUBIT: dva koherentné stavy svetla v mikrovlnnom rezonátore, |0<sub>L</sub>⟩ ≃ |α⟩ a |1<sub>L</sub>⟩ ≃ |−α⟩.',
        'Schrödinger’s cat (the first chapter of Fischer’s book) was a thought experiment. We turn it into a QUBIT: two coherent states of light in a microwave resonator, |0<sub>L</sub>⟩ ≃ |α⟩ and |1<sub>L</sub>⟩ ≃ |−α⟩.',
        'Кіт Шредінгера (перший розділ книжки Фішера) був мисленнєвим експериментом. Ми робимо з нього КУБІТ: два когерентні стани світла в мікрохвильовому резонаторі, |0<sub>L</sub>⟩ ≃ |α⟩ і |1<sub>L</sub>⟩ ≃ |−α⟩.'),
      tr('Odhad Pappalardo a kol. (2026): Shor pre RSA-2048 na mačacích qubitoch potrebuje 22 593 fyzických qubitov (1 433 logických, ~16 na logický) a 3,14 dňa — asi o 5 rádov menší „objem“ než skoršie odhady.',
        'The estimate by Pappalardo et al. (2026): Shor for RSA-2048 on cat qubits needs 22 593 physical qubits (1 433 logical, ~16 per logical) and 3.14 days — about 5 orders of magnitude less "volume" than earlier estimates.',
        'Оцінка Паппалардо та ін. (2026): Шор для RSA-2048 на котячих кубітах потребує 22 593 фізичних кубітів (1 433 логічних, ~16 на логічний) і 3,14 доби — приблизно на 5 порядків менший «об’єм», ніж попередні оцінки.'),
      tr('Predpoklady: chyba p<sub>Z</sub> = 5×10⁻⁴, cyklus 1 µs, reakcia dekodéra 10 µs a čas bit-flipu ~100 rokov. Experimenty dnes dosahujú sekundy — odhad je podmienený, nie hotový stroj.',
        'Assumptions: error p<sub>Z</sub> = 5×10⁻⁴, a 1 µs cycle, 10 µs decoder reaction and a bit-flip time of ~100 years. Experiments today reach seconds — the estimate is conditional, not a finished machine.',
        'Припущення: помилка p<sub>Z</sub> = 5×10⁻⁴, цикл 1 мкс, реакція декодера 10 мкс і час bit-flip ~100 років. Експерименти сьогодні сягають секунд — оцінка умовна, а не готова машина.'),
    ], () => this.ask({
      q: tr('Prečo treba čísla „22 593 qubitov, 3,14 dňa“ čítať opatrne?', 'Why must the numbers "22 593 qubits, 3.14 days" be read carefully?', 'Чому числа «22 593 кубітів, 3,14 доби» треба читати обережно?'),
      options: [
        tr('Stoja na predpokladoch (napr. bit-flip ~100 rokov), ktoré experimenty zatiaľ nedosahujú — pri sekundách by bolo treba ~45 000 qubitov s korekciou bit-flipov.', 'They rest on assumptions (e.g. a bit-flip time of ~100 years) that experiments do not yet reach — at seconds about 45 000 qubits with bit-flip correction would be needed.', 'Вони спираються на припущення (напр. bit-flip ~100 років), яких експерименти поки не досягають — при секундах знадобилося б ~45 000 кубітів із корекцією bit-flip.'),
        tr('Lebo RSA-2048 sa už prelomilo.', 'Because RSA-2048 has already been broken.', 'Бо RSA-2048 уже зламано.'),
        tr('Lebo mačacie qubity nerobia žiadne chyby.', 'Because cat qubits make no errors.', 'Бо котячі кубіти не роблять помилок.'),
        tr('Lebo Shorov algoritmus na mačacích qubitoch nefunguje.', 'Because Shor’s algorithm does not work on cat qubits.', 'Бо алгоритм Шора на котячих кубітах не працює.'),
      ],
      correct: 0, weak: 2,
      why: tr('Ide o architektonický odhad. Rozhodujú parametre hardvéru — ak sú horšie, rastie počet qubitov aj čas (rádovo ~45 000 qubitov a ~1 h v alternatívnom scenári).',
        'It is an architectural estimate. Hardware parameters decide — if they are worse, both the qubit count and the time grow (around ~45 000 qubits and ~1 h in an alternative scenario).',
        'Це архітектурна оцінка. Вирішують параметри обладнання — якщо вони гірші, зростає і кількість кубітів, і час (близько ~45 000 кубітів і ~1 год в альтернативному сценарії).'),
      whyWrong: { 2: tr('Robia — fázové chyby (Z) dokonca s n̄ rastú. Výhoda je v tom, že bit-flipy sú exponenciálne potlačené.', 'They do — phase errors (Z) even grow with n̄. The advantage is that bit-flips are exponentially suppressed.', 'Роблять — фазові помилки (Z) навіть зростають із n̄. Перевага в тому, що bit-flip експоненційно придушені.') },
    }, () => { this.grant(['mirrahimip', 'catqubit']); this.next(); }));
  }

  // interaktívne: |α| → prekryv ⟨α|−α⟩ = e^{−2|α|²}
  blobs() {
    this.phase = 'blobs'; this.alpha = 0.6; this.cat = 0;
    this.quest(tr('Fázový priestor: oddeľ dve mačky', 'Phase space: separate the two cats', 'Фазовий простір: розведи двох котів'), { easy: tr('posuň |α|, kým sa obláčiky neprekrývajú', 'slide |α| until the blobs no longer overlap', 'посунь |α|, доки хмаринки не перестануть перекриватися'), hard: tr('|⟨α|−α⟩|² = e<sup>−4|α|²</sup>, ⟨α|−α⟩ = e<sup>−2|α|²</sup>, n̄ = |α|²', '|⟨α|−α⟩|² = e<sup>−4|α|²</sup>, ⟨α|−α⟩ = e<sup>−2|α|²</sup>, n̄ = |α|²', '|⟨α|−α⟩|² = e<sup>−4|α|²</sup>, ⟨α|−α⟩ = e<sup>−2|α|²</sup>, n̄ = |α|²') });
    this.say([
      tr('Vo fázovom priestore (X, P) je koherentný stav |α⟩ obláčik okolo bodu α a |−α⟩ obláčik na opačnej strane. Priemerný počet fotónov je n̄ = |α|².',
        'In phase space (X, P) the coherent state |α⟩ is a blob around the point α and |−α⟩ a blob on the opposite side. The mean photon number is n̄ = |α|².',
        'У фазовому просторі (X, P) когерентний стан |α⟩ — хмаринка навколо точки α, а |−α⟩ — хмаринка з протилежного боку. Середня кількість фотонів n̄ = |α|².'),
      tr('Ich prekryv ⟨α|−α⟩ = e<sup>−2|α|²</sup> hovorí, ako veľmi sú „0“ a „1“ zameniteľné. Zväčši |α| tak, aby bol prekryv menší ako 10⁻³.',
        'Their overlap ⟨α|−α⟩ = e<sup>−2|α|²</sup> says how confusable "0" and "1" are. Increase |α| so that the overlap is below 10⁻³.',
        'Їхнє перекриття ⟨α|−α⟩ = e<sup>−2|α|²</sup> показує, наскільки «0» і «1» можна сплутати. Збільш |α| так, щоб перекриття було менше за 10⁻³.'),
    ], () => {
      let done = false;
      const out = UI.info('');
      const upd = () => {
        const a = this.alpha, n = a * a, ov = Math.exp(-2 * n);
        out.innerHTML = `n̄ = |α|² = ${n.toFixed(2)} · ⟨α|−α⟩ = <b>${ov < 1e-3 ? ov.toExponential(1) : ov.toFixed(3)}</b><br>Γ<sub>bit</sub> ∝ e<sup>−2n̄</sup> = ${ov.toExponential(1)} · Γ<sub>phase</sub> ∝ n̄ = ${n.toFixed(2)}`;
      };
      const sl = UI.slider('|α|', 0, 3, 0.05, this.alpha, (v) => {
        this.alpha = v; upd();
        if (!done && Math.exp(-2 * v * v) < 1e-3) {
          done = true; UI.panelHide();
          this.ask({
            q: tr('Čo sa stane s chybami mačacieho qubitu, keď zväčšíme n̄ = |α|²?', 'What happens to a cat qubit’s errors when we increase n̄ = |α|²?', 'Що стається з помилками котячого кубіта, коли збільшуємо n̄ = |α|²?'),
            options: [
              tr('Bit-flipy klesajú exponenciálne (~e<sup>−2n̄</sup>), fázové chyby rastú len približne lineárne (~n̄).', 'Bit-flips fall exponentially (~e<sup>−2n̄</sup>), phase errors grow only roughly linearly (~n̄).', 'Bit-flip спадають експоненційно (~e<sup>−2n̄</sup>), фазові помилки зростають лише приблизно лінійно (~n̄).'),
              tr('Všetky chyby zmiznú.', 'All errors vanish.', 'Усі помилки зникають.'),
              tr('Všetky chyby rastú exponenciálne.', 'All errors grow exponentially.', 'Усі помилки зростають експоненційно.'),
              tr('Nič — n̄ chyby neovplyvňuje.', 'Nothing — n̄ does not affect errors.', 'Нічого — n̄ на помилки не впливає.'),
            ],
            correct: 0, weak: 1,
            why: tr('Šum je silne ASYMETRICKÝ (biased): exponenciálny zisk v bit-flipoch za lineárnu cenu vo fázových chybách. Fázové chyby potom stačí opravovať 1D opakovacím alebo LDPC-mačacím kódom.',
              'The noise is strongly ASYMMETRIC (biased): an exponential gain in bit-flips for a linear price in phase errors. The phase errors are then corrected by a 1D repetition or LDPC-cat code alone.',
              'Шум сильно АСИМЕТРИЧНИЙ (biased): експоненційний виграш у bit-flip за лінійну ціну у фазових помилках. Фазові помилки тоді досить виправляти 1D кодом повторення або LDPC-котячим кодом.'),
            whyWrong: { 1: tr('Fázové chyby s n̄ dokonca mierne rastú (viac fotónov = viac strát). Zadarmo nie je nič.', 'Phase errors even grow a little with n̄ (more photons = more losses). Nothing is free.', 'Фазові помилки з n̄ навіть трохи зростають (більше фотонів = більше втрат). Безкоштовно нічого немає.') },
          }, () => { this.grant(['biasnoise']); this.next(); });
        }
        return v.toFixed(2);
      });
      UI.panelSet(tr('Dve mačky vo fázovom priestore', 'Two cats in phase space', 'Два коти у фазовому просторі'), [sl, out]);
      upd();
    });
  }

  lindblad() {
    this.phase = 'lindblad'; this.alpha = 2; this.cat = 0;
    this.quest(tr('Dvojfotónová disipácia', 'Two-photon dissipation', 'Двофотонна дисипація'), { easy: tr('prostredie, ktoré mačky stráži', 'an environment that guards the cats', 'середовище, що стереже котів'), hard: tr('dρ/dt = κ₂ D[a² − α²]ρ + κ₁ D[a]ρ', 'dρ/dt = κ₂ D[a² − α²]ρ + κ₁ D[a]ρ', 'dρ/dt = κ₂ D[a² − α²]ρ + κ₁ D[a]ρ') });
    this.say([
      tr('Kľúčový trik: prostredie nepriateľa urobíme strážcom. Lindbladova rovnica dρ/dt = κ₂ D[a² − α²]ρ + κ₁ D[a]ρ, kde D[L]ρ = LρL† − ½{L†L, ρ}.',
        'The key trick: we turn the hostile environment into a guard. The Lindblad equation dρ/dt = κ₂ D[a² − α²]ρ + κ₁ D[a]ρ, where D[L]ρ = LρL† − ½{L†L, ρ}.',
        'Ключовий трюк: вороже середовище робимо вартовим. Рівняння Ліндблада dρ/dt = κ₂ D[a² − α²]ρ + κ₁ D[a]ρ, де D[L]ρ = LρL† − ½{L†L, ρ}.'),
      tr('Člen κ₂ odoberá fotóny PO DVOJICIACH a zároveň pumpuje — tlačí každý stav späť k |±α⟩. Platí (a² − α²)|±α⟩ = 0: oba stavy sú „neviditeľné“ pre túto disipáciu.',
        'The κ₂ term removes photons IN PAIRS and pumps at the same time — pushing every state back towards |±α⟩. We have (a² − α²)|±α⟩ = 0: both states are "invisible" to this dissipation.',
        'Член κ₂ забирає фотони ПАРАМИ й водночас накачує — штовхає кожен стан назад до |±α⟩. Маємо (a² − α²)|±α⟩ = 0: обидва стани «невидимі» для цієї дисипації.'),
      tr('Ich lineárny obal je PODPRIESTOR BEZ DEKOHERENCIE (decoherence-free subspace) = jadro ker(a² − α²). To je REZERVOÁROVÉ INŽINIERSTVO.',
        'Their linear span is a DECOHERENCE-FREE SUBSPACE = the kernel ker(a² − α²). That is RESERVOIR ENGINEERING.',
        'Їхня лінійна оболонка — ПІДПРОСТІР БЕЗ ДЕКОГЕРЕНЦІЇ (decoherence-free subspace) = ядро ker(a² − α²). Це РЕЗЕРВУАРНА ІНЖЕНЕРІЯ.'),
    ], () => this.ask({
      q: tr('Prečo dvojfotónová disipácia s L = a² − α² chráni mačací qubit?', 'Why does two-photon dissipation with L = a² − α² protect the cat qubit?', 'Чому двофотонна дисипація з L = a² − α² захищає котячий кубіт?'),
      options: [
        tr('|±α⟩ sú jej stacionárne stavy ((a² − α²)|±α⟩ = 0), takže stav sa po poruche vracia do kódového podpriestoru.', '|±α⟩ are its steady states ((a² − α²)|±α⟩ = 0), so after a disturbance the state returns to the code subspace.', '|±α⟩ — її стаціонарні стани ((a² − α²)|±α⟩ = 0), тож після збурення стан повертається в кодовий підпростір.'),
        tr('Odstráni všetky fotóny, takže nie je čo pokaziť.', 'It removes all photons, so there is nothing to spoil.', 'Вона прибирає всі фотони, тож нічого псувати.'),
        tr('Zmeria qubit a opraví ho podľa výsledku.', 'It measures the qubit and corrects it from the result.', 'Вона вимірює кубіт і виправляє його за результатом.'),
        tr('Zahreje rezonátor, aby bol stabilnejší.', 'It heats the resonator so it is more stable.', 'Вона нагріває резонатор, щоб він був стабільнішим.'),
      ],
      correct: 0, weak: 2,
      why: tr('Ochrana je autonómna — žiadne meranie ani spätná väzba. Disipácia odvádza energiu, ale NEČÍTA, či je stav |α⟩ alebo |−α⟩, preto superpozíciu nezničí.',
        'The protection is autonomous — no measurement and no feedback. The dissipation carries away energy but does NOT read whether the state is |α⟩ or |−α⟩, so it does not destroy the superposition.',
        'Захист автономний — без вимірювання й зворотного зв’язку. Дисипація відводить енергію, але НЕ ЧИТАЄ, чи стан |α⟩ чи |−α⟩, тому суперпозицію не руйнує.'),
      whyWrong: { 2: tr('Meranie by zničilo superpozíciu. Tu disipácia rozlišuje len „v kóde / mimo kódu“, nie 0 / 1.', 'A measurement would destroy the superposition. Here the dissipation only distinguishes "in the code / outside", not 0 / 1.', 'Вимірювання зруйнувало б суперпозицію. Тут дисипація розрізняє лише «в коді / поза кодом», а не 0 / 1.') },
    }, () => { this.grant(['twophoton']); this.next(); }));
  }

  bias() {
    this.phase = 'bias'; this.cat = 1; this.alpha = 2;
    this.quest(tr('Mačacie stavy a strata fotónu', 'Cat states and photon loss', 'Котячі стани і втрата фотона'), { easy: tr('strata fotónu = fázová chyba', 'photon loss = phase error', 'втрата фотона = фазова помилка'), hard: tr('|C±⟩ = N±(|α⟩ ± |−α⟩), a|C±⟩ ∝ |C∓⟩', '|C±⟩ = N±(|α⟩ ± |−α⟩), a|C±⟩ ∝ |C∓⟩', '|C±⟩ = N±(|α⟩ ± |−α⟩), a|C±⟩ ∝ |C∓⟩') });
    this.say([
      tr('Mačacie stavy |C±⟩ = N±(|α⟩ ± |−α⟩), N± = 1/√(2(1 ± e<sup>−2|α|²</sup>)). |C+⟩ má len PÁRNY počet fotónov, |C−⟩ NEPÁRNY. Vo fázovom priestore medzi obláčikmi vidno interferenčné prúžky.',
        'Cat states |C±⟩ = N±(|α⟩ ± |−α⟩), N± = 1/√(2(1 ± e<sup>−2|α|²</sup>)). |C+⟩ has only an EVEN number of photons, |C−⟩ an ODD one. In phase space interference fringes show between the blobs.',
        'Котячі стани |C±⟩ = N±(|α⟩ ± |−α⟩), N± = 1/√(2(1 ± e<sup>−2|α|²</sup>)). |C+⟩ має лише ПАРНУ кількість фотонів, |C−⟩ — НЕПАРНУ. У фазовому просторі між хмаринками видно інтерференційні смуги.'),
      tr('Strata jedného fotónu (anihilácia a) mení paritu: a|C±⟩ ∝ |C∓⟩. V báze C± je to chyba X, v báze |±α⟩ chyba Z. A pretože a|±α⟩ = ±α|±α⟩, |α⟩ sa na |−α⟩ stratou fotónu NEPREKLOPÍ.',
        'Losing one photon (annihilation a) flips the parity: a|C±⟩ ∝ |C∓⟩. In the C± basis that is an X error, in the |±α⟩ basis a Z error. And since a|±α⟩ = ±α|±α⟩, photon loss does NOT flip |α⟩ into |−α⟩.',
        'Втрата одного фотона (знищення a) змінює парність: a|C±⟩ ∝ |C∓⟩. У базисі C± це помилка X, у базисі |±α⟩ — помилка Z. А оскільки a|±α⟩ = ±α|±α⟩, втрата фотона НЕ перевертає |α⟩ на |−α⟩.'),
      tr('Rozlišuj: DISIPÁCIA = odtok energie, DEKOHERENCIA = prostredie získa informáciu „ktorý stav“ (⟨E₁′|E₀′⟩ → 0), STRATA INFORMÁCIE = nevratné zabudnutie kódovaného stavu. Nie sú to synonymá.',
        'Distinguish: DISSIPATION = energy flowing away, DECOHERENCE = the environment gaining "which-state" information (⟨E₁′|E₀′⟩ → 0), INFORMATION LOSS = irreversibly forgetting the encoded state. They are not synonyms.',
        'Розрізняй: ДИСИПАЦІЯ = відтік енергії, ДЕКОГЕРЕНЦІЯ = середовище отримує інформацію «який стан» (⟨E₁′|E₀′⟩ → 0), ВТРАТА ІНФОРМАЦІЇ = незворотне забуття закодованого стану. Це не синоніми.'),
    ], () => this.ask({
      q: tr('Aký typ chyby spôsobí strata jedného fotónu na qubite kódovanom v |±α⟩?', 'What type of error does the loss of one photon cause on a qubit encoded in |±α⟩?', 'Який тип помилки спричиняє втрата одного фотона на кубіті, закодованому в |±α⟩?'),
      options: [
        tr('Fázovú chybu Z (v báze C± je to X) — bit |α⟩ ↔ |−α⟩ sa nepreklopí.', 'A phase error Z (in the C± basis it is X) — the bit |α⟩ ↔ |−α⟩ does not flip.', 'Фазову помилку Z (у базисі C± це X) — біт |α⟩ ↔ |−α⟩ не перевертається.'),
        tr('Bit-flip |α⟩ → |−α⟩.', 'A bit-flip |α⟩ → |−α⟩.', 'Bit-flip |α⟩ → |−α⟩.'),
        tr('Žiadnu chybu.', 'No error at all.', 'Жодної помилки.'),
        tr('Zničí celý rezonátor.', 'It destroys the whole resonator.', 'Руйнує весь резонатор.'),
      ],
      correct: 0, weak: 1,
      why: tr('Koherentné stavy sú vlastné stavy a, takže strata fotónu pridá len znamienko medzi |α⟩ a |−α⟩. Preto sú bit-flipy vzácne a dominujú fázové chyby — šum je biasovaný.',
        'Coherent states are eigenstates of a, so photon loss only adds a sign between |α⟩ and |−α⟩. That is why bit-flips are rare and phase errors dominate — the noise is biased.',
        'Когерентні стани — власні стани a, тож втрата фотона лише додає знак між |α⟩ і |−α⟩. Тому bit-flip рідкісні, а домінують фазові помилки — шум зміщений.'),
      whyWrong: { 1: tr('Na preklopenie |α⟩ → |−α⟩ by šum musel „prejsť“ celý fázový priestor — to je exponenciálne nepravdepodobné.', 'To flip |α⟩ → |−α⟩ the noise would have to "cross" the whole phase space — that is exponentially unlikely.', 'Щоб перевернути |α⟩ → |−α⟩, шум мав би «перетнути» весь фазовий простір — це експоненційно малоймовірно.') },
    }, () => { this.grant(['catstate', 'deco']); this.next(); }));
  }

  zeno() {
    this.phase = 'zeno'; this.cat = 0;
    this.quest(tr('Kvantový Zenónov jav', 'The quantum Zeno effect', 'Квантовий ефект Зенона'), { easy: tr('časté pozeranie zmrazí vývoj', 'frequent looking freezes evolution', 'часте спостереження заморожує еволюцію'), hard: tr('P<sub>N</sub>(t) ≃ (1 − (ΔH)²t²/(N²ħ²))^N → 1; H<sub>eff</sub> = 2ħεα Z<sub>L</sub>', 'P<sub>N</sub>(t) ≃ (1 − (ΔH)²t²/(N²ħ²))^N → 1; H<sub>eff</sub> = 2ħεα Z<sub>L</sub>', 'P<sub>N</sub>(t) ≃ (1 − (ΔH)²t²/(N²ħ²))^N → 1; H<sub>eff</sub> = 2ħεα Z<sub>L</sub>') });
    this.say([
      tr('Pre krátky čas je pravdepodobnosť prežitia P(τ) = 1 − (ΔH)²τ²/ħ² — kvadraticky. Ak stav N-krát skontrolujeme, P<sub>N</sub>(t) ≃ (1 − (ΔH)²t²/(N²ħ²))^N → 1. Časté „pozeranie“ vývoj zmrazí (Zenónov šíp).',
        'For a short time the survival probability is P(τ) = 1 − (ΔH)²τ²/ħ² — quadratic. If we check the state N times, P<sub>N</sub>(t) ≃ (1 − (ΔH)²t²/(N²ħ²))^N → 1. Frequent "looking" freezes the evolution (Zeno’s arrow).',
        'За короткий час імовірність виживання P(τ) = 1 − (ΔH)²τ²/ħ² — квадратично. Якщо перевірити стан N разів, P<sub>N</sub>(t) ≃ (1 − (ΔH)²t²/(N²ħ²))^N → 1. Часте «спостереження» заморожує еволюцію (стріла Зенона).'),
      tr('Zostane len vývoj VNÚTRI podpriestoru: H<sub>Z</sub> = PHP. Silná dvojfotónová disipácia funguje ako nepretržité meranie „si v kóde?“.',
        'Only evolution INSIDE the subspace remains: H<sub>Z</sub> = PHP. Strong two-photon dissipation acts as a continuous measurement "are you in the code?".',
        'Лишається лише еволюція ВСЕРЕДИНІ підпростору: H<sub>Z</sub> = PHP. Сильна двофотонна дисипація діє як неперервне вимірювання «чи ти в коді?».'),
      tr('ZENÓNOVO HRADLO: slabý pohon H₁ = ħε(a + a†). Projektovaný do kódu P(a + a†)P ≃ 2α Z<sub>L</sub>, teda H<sub>eff</sub> = 2ħεα Z<sub>L</sub> — rotácia o θ = 4εαt, ktorá nikdy neopustí kód.',
        'The ZENO GATE: a weak drive H₁ = ħε(a + a†). Projected into the code, P(a + a†)P ≃ 2α Z<sub>L</sub>, so H<sub>eff</sub> = 2ħεα Z<sub>L</sub> — a rotation by θ = 4εαt that never leaves the code.',
        'ГЕЙТ ЗЕНОНА: слабке накачування H₁ = ħε(a + a†). Спроєктоване в код P(a + a†)P ≃ 2α Z<sub>L</sub>, тож H<sub>eff</sub> = 2ħεα Z<sub>L</sub> — поворот на θ = 4εαt, що ніколи не залишає коду.'),
    ], () => this.ask({
      q: tr('Ako vznikne Zenónovo hradlo Z<sub>L</sub> na mačacom qubite?', 'How does the Zeno gate Z<sub>L</sub> on a cat qubit arise?', 'Як виникає гейт Зенона Z<sub>L</sub> на котячому кубіті?'),
      options: [
        tr('Slabý pohon ε(a + a†) sa silnou disipáciou premietne do kódu ako 2εα Z<sub>L</sub>, takže θ = 4εαt.', 'A weak drive ε(a + a†) is projected by the strong dissipation into the code as 2εα Z<sub>L</sub>, so θ = 4εαt.', 'Слабке накачування ε(a + a†) сильною дисипацією проєктується в код як 2εα Z<sub>L</sub>, тож θ = 4εαt.'),
        tr('Vypne sa disipácia a qubit sa voľne otáča.', 'The dissipation is switched off and the qubit rotates freely.', 'Дисипацію вимикають, і кубіт вільно обертається.'),
        tr('Zmeria sa parita a podľa nej sa preklopí stav.', 'The parity is measured and the state flipped accordingly.', 'Вимірюють парність і відповідно перевертають стан.'),
        tr('Zvýši sa teplota, aby sa fáza zmenila.', 'The temperature is raised to change the phase.', 'Підвищують температуру, щоб змінити фазу.'),
      ],
      correct: 0, weak: 1,
      why: tr('Zenónov jav „odreže“ časti pohonu, ktoré by vyviedli stav z kódu; zostane len PHP ∝ Z<sub>L</sub>. Hradlo je teda chránené tou istou disipáciou, ktorá chráni pamäť.',
        'The Zeno effect "cuts off" the parts of the drive that would lead the state out of the code; only PHP ∝ Z<sub>L</sub> remains. The gate is thus protected by the same dissipation that protects the memory.',
        'Ефект Зенона «відрізає» частини накачування, що вивели б стан із коду; лишається лише PHP ∝ Z<sub>L</sub>. Тож гейт захищений тією самою дисипацією, що захищає пам’ять.'),
      whyWrong: { 1: tr('Bez disipácie by pohon posunul stav mimo kód a stratila by sa ochrana proti bit-flipom.', 'Without the dissipation the drive would push the state out of the code and the bit-flip protection would be lost.', 'Без дисипації накачування виштовхнуло б стан із коду, і захист від bit-flip було б утрачено.') },
    }, () => { this.grant(['zeno']); this.next(); }));
  }

  buffer() {
    this.phase = 'buffer'; this.cat = 0;
    this.quest(tr('Pamäť a buffer: ako sa disipácia postaví', 'Memory and buffer: how the dissipation is built', 'Пам’ять і буфер: як будують дисипацію'), { easy: tr('dva rezonátory, jeden stratový', 'two resonators, one lossy', 'два резонатори, один втратний'), hard: tr('H<sub>int</sub> = ħg₂(a²b† + a†²b), κ₂ ≈ 4|g₂|²/κ<sub>b</sub>', 'H<sub>int</sub> = ħg₂(a²b† + a†²b), κ₂ ≈ 4|g₂|²/κ<sub>b</sub>', 'H<sub>int</sub> = ħg₂(a²b† + a†²b), κ₂ ≈ 4|g₂|²/κ<sub>b</sub>') });
    this.say([
      tr('Dva rezonátory: PAMÄŤ a (dlho žijúca, nesie mačku) a BUFFER b (rýchlo stráca fotóny, κ<sub>b</sub>). Nelineárny prvok s pumpou ω<sub>p</sub> = |2ω<sub>a</sub> − ω<sub>b</sub>| vytvorí výmenu H<sub>int</sub> = ħg₂(a²b† + a†²b).',
        'Two resonators: the MEMORY a (long-lived, holds the cat) and the BUFFER b (quickly loses photons, κ<sub>b</sub>). A nonlinear element with a pump at ω<sub>p</sub> = |2ω<sub>a</sub> − ω<sub>b</sub>| creates the exchange H<sub>int</sub> = ħg₂(a²b† + a†²b).',
        'Два резонатори: ПАМ’ЯТЬ a (довгоживуча, тримає кота) і БУФЕР b (швидко втрачає фотони, κ<sub>b</sub>). Нелінійний елемент із накачуванням ω<sub>p</sub> = |2ω<sub>a</sub> − ω<sub>b</sub>| створює обмін H<sub>int</sub> = ħg₂(a²b† + a†²b).'),
      tr('Dva fotóny pamäte sa menia na jeden fotón buffra, ktorý hneď unikne. S pohonom buffra ħ(ε<sub>b</sub> b† + ε<sub>b</sub>* b) a po adiabatickej eliminácii b dostaneme presne κ₂ D[a² − α²] s κ₂ ≈ 4|g₂|²/κ<sub>b</sub>.',
        'Two memory photons turn into one buffer photon, which leaks out at once. With a buffer drive ħ(ε<sub>b</sub> b† + ε<sub>b</sub>* b) and after adiabatically eliminating b we get exactly κ₂ D[a² − α²] with κ₂ ≈ 4|g₂|²/κ<sub>b</sub>.',
        'Два фотони пам’яті перетворюються на один фотон буфера, який одразу витікає. З накачуванням буфера ħ(ε<sub>b</sub> b† + ε<sub>b</sub>* b) і після адіабатичного виключення b отримуємо саме κ₂ D[a² − α²] з κ₂ ≈ 4|g₂|²/κ<sub>b</sub>.'),
      tr('Porovnanie s Majoranou (L19): oba smery chcú ochranu „z fyziky“. Mačky majú experimentálne overené potlačenie bit-flipov (so stláčaním až 160×) a benchmark FFDLP-512 za ~21 min so 6 656 qubitmi; Majorana 2 (2026) čelí námietkam k samotnému dôkazu topologickej fázy.',
        'Comparison with Majorana (L19): both aim for protection "from physics". Cats have experimentally verified bit-flip suppression (up to 160× with squeezing) and an FFDLP-512 benchmark in ~21 min with 6 656 qubits; Majorana 2 (2026) faces objections to the very proof of the topological phase.',
        'Порівняння з Майораною (L19): обидва напрями прагнуть захисту «з фізики». Коти мають експериментально підтверджене придушення bit-flip (зі стисканням до 160×) і бенчмарк FFDLP-512 за ~21 хв із 6 656 кубітами; Majorana 2 (2026) стикається із запереченнями щодо самого доказу топологічної фази.'),
    ], () => this.ask({
      q: tr('Akú úlohu má stratový bufferový rezonátor b?', 'What role does the lossy buffer resonator b play?', 'Яку роль відіграє втратний буферний резонатор b?'),
      options: [
        tr('Odvádza páry fotónov z pamäte do prostredia — tak vzniká riadená dvojfotónová disipácia κ₂ ≈ 4|g₂|²/κ<sub>b</sub>.', 'It carries photon pairs from the memory into the environment — that creates the engineered two-photon dissipation κ₂ ≈ 4|g₂|²/κ<sub>b</sub>.', 'Відводить пари фотонів із пам’яті в середовище — так виникає керована двофотонна дисипація κ₂ ≈ 4|g₂|²/κ<sub>b</sub>.'),
        tr('Ukladá kópiu qubitu pre prípad chyby.', 'It stores a copy of the qubit in case of an error.', 'Зберігає копію кубіта на випадок помилки.'),
        tr('Meria, či je v pamäti |α⟩ alebo |−α⟩.', 'It measures whether the memory holds |α⟩ or |−α⟩.', 'Вимірює, чи в пам’яті |α⟩ чи |−α⟩.'),
        tr('Chladí pamäť na absolútnu nulu.', 'It cools the memory to absolute zero.', 'Охолоджує пам’ять до абсолютного нуля.'),
      ],
      correct: 0, weak: 1,
      why: tr('Buffer je „kanál“ do prostredia, ktorý odnáša len PÁRY fotónov. Neodnáša informáciu o tom, či je mačka vľavo alebo vpravo — preto kódovaný qubit prežije.',
        'The buffer is a "channel" to the environment that carries away only PAIRS of photons. It carries no information about whether the cat is left or right — that is why the encoded qubit survives.',
        'Буфер — «канал» у середовище, що забирає лише ПАРИ фотонів. Він не забирає інформації, чи кіт ліворуч чи праворуч — тому закодований кубіт виживає.'),
      whyWrong: { 1: tr('Kvantový stav sa skopírovať nedá (no-cloning). Buffer nič nekopíruje, len odvádza energiu.', 'A quantum state cannot be copied (no-cloning). The buffer copies nothing, it only removes energy.', 'Квантовий стан не можна скопіювати (no-cloning). Буфер нічого не копіює, лише відводить енергію.') },
    }, () => { this.grant(['buffer']); this.next(); }));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Výborne. Mačka žije vo fázovom priestore, prostredie ju stráži namiesto toho, aby ju zabilo, a bit-flipy miznú exponenciálne. Stačí potom opravovať už len fázu.',
        'Well done. The cat lives in phase space, the environment guards it instead of killing it, and bit-flips vanish exponentially. Then only the phase needs correcting.',
        'Чудово. Кіт живе у фазовому просторі, середовище стереже його замість того, щоб убити, а bit-flip зникають експоненційно. Тоді досить виправляти лише фазу.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // fázový priestor (X, P): dva gaussovské obláčiky na ±α, pri mačacích stavoch interferenčné prúžky; v kroku buffer dva rezonátory
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.4, 0], 0, 8), [0.16, 0.18, 0.26], { pattern: 1 });
    const ph = this.phase, a = this.alpha, sc = 1.1;
    // osi X a P
    r.rod([-4, -1.3, 0], [4, -1.3, 0], [0.5, 0.5, 0.6], 0.02); r.rod([0, -1.3, -3], [0, -1.3, 3], [0.5, 0.5, 0.6], 0.02);
    UI.label('ax', [4.2, -1.2, 0], 'X', 'small'); UI.label('ap', [0, -1.2, -3.2], 'P', 'small');
    if (ph !== 'buffer') {
      for (let k = 0; k < 7; k++) {
        const rr = 0.15 + k * 0.12, al = 0.5 * Math.exp(-k * 0.45);
        for (const s of [-1, 1]) r.sphere([s * a * sc, -0.6, 0], rr, s > 0 ? [0.4, 0.75, 1] : [1, 0.55, 0.45], { alpha: al, emissive: 0.4 });
      }
      UI.label('pa', [a * sc, 0.4, 0], '|α⟩ = |0<sub>L</sub>⟩', 'small');
      UI.label('ma', [-a * sc, 0.4, 0], '|−α⟩ = |1<sub>L</sub>⟩', 'small');
      if (this.cat) {
        for (let k = -4; k <= 4; k++) {
          const z = k * 0.25, on = Math.cos(k * Math.PI / 2 + this.t) > 0;
          r.draw('box', M4.trs([0, -1.0, z], 0, [0.12, 0.05 + (on ? 0.5 : 0.1), 0.08]), on ? [0.9, 0.9, 1] : [0.3, 0.3, 0.45], { emissive: on ? 0.6 : 0 });
        }
        UI.hot([0, 0, 0], tr('prúžky = koherencia C±', 'fringes = coherence C±', 'смуги = когерентність C±'), 60);
      }
      // dvojfotónová disipácia: šípky tlačia späť k ±α
      if (ph === 'lindblad' || ph === 'zeno') {
        for (let k = 0; k < 6; k++) {
          const ang = k / 6 * Math.PI * 2 + this.t * 0.3, s = k % 2 ? 1 : -1, c = [s * a * sc, -0.6, 0];
          const from = V3.add(c, [Math.cos(ang) * 1.4, 0, Math.sin(ang) * 1.4]), to = V3.add(c, [Math.cos(ang) * 0.6, 0, Math.sin(ang) * 0.6]);
          r.arrow(from, to, [1, 0.85, 0.3], 0.03, { emissive: 0.5 });
        }
        if (ph === 'zeno') UI.hot([0, 0.8, 0], `θ = 4εαt`, 60);
      }
    } else {
      // pamäť a (veľký torus) + buffer b (menší, „vyteká“), dvojice fotónov idú z a do b
      r.draw('torus', M4.trs([-1.6, 0, 0], 0, 1.3), [0.4, 0.75, 1], { emissive: 0.3 });
      r.draw('torus', M4.trs([1.8, 0, 0], 0, 0.8), [1, 0.6, 0.4], { emissive: 0.3 });
      UI.label('mem', [-1.6, 1.2, 0], tr('pamäť a', 'memory a', 'пам’ять a'), 'npc small');
      UI.label('buf', [1.8, 1.0, 0], tr('buffer b (κ<sub>b</sub>)', 'buffer b (κ<sub>b</sub>)', 'буфер b (κ<sub>b</sub>)'), 'npc small');
      const s = (this.t * 0.6) % 1;
      for (const dz of [-0.12, 0.12]) r.sphere([-0.3 + s * 1.3, 0, dz], 0.1, [1, 1, 0.6], { emissive: 0.7 });
      const s2 = (this.t * 0.6 + 0.5) % 1;
      r.sphere([2.6 + s2 * 1.6, 0.2 + s2, 0], 0.12, [1, 0.8, 0.5], { emissive: 0.6, alpha: 1 - s2 });
      UI.hot([0.3, 0.6, 0], 'a²b† + a†²b', 60);
    }
    // Mirrahimi
    const mp = [-4.4, -1.2, 1.8];
    r.sphere(V3.add(mp, [0, 1.6, 0]), 0.32, [0.95, 0.85, 0.75], { emissive: 0.1 });
    r.draw('cylinder', M4.trs(mp, 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [1, 0.75, 0.4], 0.8));
    const cx = CODEX.find((c) => c.id === 'mirrahimip');
    UI.label('mirr', V3.add(mp, [0, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}
