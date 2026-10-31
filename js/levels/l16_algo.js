'use strict';
// LEVEL 16 (poradie 14) — Sieň algoritmov (mentor: David Deutsch)
// Štyri stanice: Deutsch, Bernstein–Vazirani, Grover, Shor. Vizualizácia orákula a zrýchlenia.
// Ľahší level: dialóg + 3D sieň so 4 stanicami + inline kvízy. Žiadne CSV.

class L16Algo extends Level {
  get steps() { return [this.intro, this.deutsch, this.bv, this.grover, this.shor]; }

  setup() {
    this.cam = new OrbitCam([0, 0.6, 0], 11, 0.5, 0.3, 5, 20);
    this.active = -1;    // zvýraznená stanica (0..3)
    this.mark = 5;       // „označený“ prvok pre Grovera (animácia)
  }

  intro() {
    this.active = -1;
    this.quest(tr('Vstúp do Siene algoritmov', 'Enter the Hall of Algorithms', 'Увійди до Зали алгоритмів'), { easy: tr('⚙ 4 stanice', '⚙ 4 stations', '⚙ 4 станції'), hard: tr('orákulum = čierna skrinka', 'oracle = black box', 'оракул = чорна скринька') });
    this.say([
      tr('Vitaj. Táto sieň má štyri stanice — štyri slávne kvantové algoritmy. Každý sa pýta orákula (čiernej skrinky).',
        'Welcome. This hall has four stations — four famous quantum algorithms. Each queries an oracle (a black box).',
        'Вітаю. Ця зала має чотири станції — чотири славетні квантові алгоритми. Кожен запитує оракул (чорну скриньку).'),
      tr('Kvantový trik: namiesto toho, aby sme sa pýtali po jednom, pýtame sa na superpozíciu vstupov a šikovne vyťažíme interferenciu.',
        'The quantum trick: instead of asking one at a time, we query a superposition of inputs and cleverly exploit interference.',
        'Квантовий трюк: замість того, щоб питати по одному, ми запитуємо суперпозицію входів і хитро використовуємо інтерференцію.'),
    ], () => this.next());
  }

  deutsch() {
    this.active = 0;
    this.quest(tr('Stanica 1 — Deutsch', 'Station 1 — Deutsch', 'Станція 1 — Дойч'), { easy: tr('konštantná vs. vyvážená', 'constant vs. balanced', 'стала vs. збалансована'), hard: tr('1 dotaz namiesto 2', '1 query instead of 2', '1 запит замість 2') });
    this.say([
      tr('Deutschova úloha: funkcia f(x) na 1 bite je buď KONŠTANTNÁ (rovnaký výstup), alebo VYVÁŽENÁ (rôzny). Ktorá?',
        'Deutsch\'s task: a 1-bit function f(x) is either CONSTANT (same output) or BALANCED (different). Which is it?',
        'Задача Дойча: функція f(x) на 1 біті або СТАЛА (однаковий вихід), або ЗБАЛАНСОВАНА (різний). Яка?'),
      tr('Klasicky musíš skúsiť OBA vstupy (f(0) aj f(1)). Kvantovo stačí JEDEN dotaz vďaka interferencii.',
        'Classically you must try BOTH inputs (f(0) and f(1)). Quantumly ONE query suffices thanks to interference.',
        'Класично треба спробувати ОБА входи (f(0) і f(1)). Квантово досить ОДНОГО запиту завдяки інтерференції.'),
    ], () => this.ask({
      q: tr('Koľko dotazov na orákulum potrebuje Deutschov algoritmus, aby rozhodol konštantná/vyvážená?', 'How many oracle queries does Deutsch\'s algorithm need to decide constant/balanced?', 'Скільки запитів до оракула потрібно алгоритму Дойча, щоб вирішити стала/збалансована?'),
      options: [
        tr('1 (klasicky treba 2)', '1 (classically you need 2)', '1 (класично потрібно 2)'),
        tr('2 (rovnako ako klasicky)', '2 (same as classically)', '2 (так само, як класично)'),
        tr('0 — netreba sa pýtať vôbec', '0 — no query needed at all', '0 — запит узагалі не потрібен'),
        tr('4', '4', '4'),
      ],
      correct: 0, weak: 2,
      why: tr('Vďaka superpozícii a interferencii jediný dotaz odhalí globálnu vlastnosť f. Klasika potrebuje dva.',
        'Thanks to superposition and interference a single query reveals the global property of f. Classical needs two.',
        'Завдяки суперпозиції та інтерференції один запит розкриває глобальну властивість f. Класика потребує двох.'),
      whyWrong: { 2: tr('Bez jediného dotazu nič nevieš — orákulum treba osloviť aspoň raz.', 'Without any query you know nothing — the oracle must be consulted at least once.', 'Без жодного запиту ти нічого не знаєш — оракул треба опитати принаймні раз.') },
    }, () => { this.grant(['deutschp']); this.next(); }));
  }

  bv() {
    this.active = 1;
    this.quest(tr('Stanica 2 — Bernstein–Vazirani', 'Station 2 — Bernstein–Vazirani', 'Станція 2 — Бернштейн–Вазірані'), { easy: tr('skrytý reťazec s', 'hidden string s', 'прихований рядок s'), hard: tr('n bitov → 1 dotaz', 'n bits → 1 query', 'n бітів → 1 запит') });
    this.say([
      tr('Orákulum skrýva tajný reťazec s. Vracia skalárny súčin s·x (mod 2). Úloha: zisti celé s.',
        'The oracle hides a secret string s. It returns the dot product s·x (mod 2). Task: recover all of s.',
        'Оракул приховує таємний рядок s. Повертає скалярний добуток s·x (mod 2). Завдання: відновити весь s.'),
      tr('Klasicky musíš orákulum osloviť n-krát (bit po bite). Bernstein–Vazirani to spraví JEDINÝM dotazom.',
        'Classically you must query the oracle n times (bit by bit). Bernstein–Vazirani does it in a SINGLE query.',
        'Класично треба опитати оракул n разів (біт за бітом). Бернштейн–Вазірані робить це ОДНИМ запитом.'),
    ], () => this.ask({
      q: tr('Tajný reťazec s má 8 bitov. Koľko dotazov potrebuje Bernstein–Vaziraniho algoritmus?', 'The secret string s has 8 bits. How many queries does the Bernstein–Vazirani algorithm need?', 'Таємний рядок s має 8 бітів. Скільки запитів потрібно алгоритму Бернштейна–Вазірані?'),
      options: [
        tr('1 dotaz (klasicky by trebalo 8)', '1 query (classically you would need 8)', '1 запит (класично потрібно було б 8)'),
        tr('8 dotazov', '8 queries', '8 запитів'),
        tr('256 dotazov', '256 queries', '256 запитів'),
        tr('3 dotazy', '3 queries', '3 запити'),
      ],
      correct: 0, weak: 2,
      why: tr('Hadamard–orákulum–Hadamard zakóduje celý reťazec s do výsledku jediného merania. Klasika potrebuje n dotazov.',
        'Hadamard–oracle–Hadamard encodes the whole string s into one measurement. Classical needs n queries.',
        'Адамар–оракул–Адамар кодує весь рядок s в одне вимірювання. Класика потребує n запитів.'),
      whyWrong: { 2: tr('256 = 2⁸ je počet možných reťazcov, nie počet potrebných dotazov.', '256 = 2⁸ is the number of possible strings, not the number of queries needed.', '256 = 2⁸ — це кількість можливих рядків, а не кількість потрібних запитів.') },
    }, () => { this.grant(['oracle']); this.next(); }));
  }

  grover() {
    this.active = 2;
    this.quest(tr('Stanica 3 — Grover', 'Station 3 — Grover', 'Станція 3 — Ґровер'), { easy: tr('√N namiesto N', '√N instead of N', '√N замість N'), hard: tr('amplitúdová amplifikácia', 'amplitude amplification', 'амплітудне підсилення') });
    this.say([
      tr('Grover hľadá ihlu v kope sena — jeden označený prvok medzi N. Orákulum ho „označí“ obrátením fázy.',
        'Grover searches for a needle in a haystack — one marked item among N. The oracle "marks" it by flipping its phase.',
        'Ґровер шукає голку в копиці сіна — один позначений елемент серед N. Оракул «позначає» його зміною фази.'),
      tr('Opakovaným zrkadlením (amplitúdová amplifikácia) rastie amplitúda správneho prvku. Potrebných je len ~√N krokov.',
        'By repeated reflection (amplitude amplification) the amplitude of the correct item grows. Only ~√N steps are needed.',
        'Повторним віддзеркаленням (амплітудне підсилення) амплітуда правильного елемента зростає. Потрібно лише ~√N кроків.'),
    ], () => this.ask({
      q: tr('V neutriedenej databáze s N = 1 000 000 záznamov — koľko krokov zhruba potrebuje Grover?', 'In an unsorted database of N = 1,000,000 records — roughly how many steps does Grover need?', 'У невідсортованій базі з N = 1 000 000 записів — скільки приблизно кроків потрібно Ґроверу?'),
      options: [
        tr('~1000 (rádovo √N)', '~1000 (on the order of √N)', '~1000 (порядку √N)'),
        tr('~1 000 000 (ako klasické hľadanie)', '~1,000,000 (like classical search)', '~1 000 000 (як класичний пошук)'),
        tr('~1 (jediný krok)', '~1 (a single step)', '~1 (один крок)'),
        tr('~20', '~20', '~20'),
      ],
      correct: 0, weak: 2,
      why: tr('Grover dáva kvadratické zrýchlenie: √1 000 000 = 1000. Nie je to exponenciálne, ale stále veľa.',
        'Grover gives a quadratic speed-up: √1,000,000 = 1000. Not exponential, but still a lot.',
        'Ґровер дає квадратичне прискорення: √1 000 000 = 1000. Не експоненційне, але все одно багато.'),
      whyWrong: { 2: tr('Jeden krok nestačí — amplitúdu treba zosilňovať postupne, zhruba √N ráz.', 'A single step is not enough — the amplitude must be amplified gradually, about √N times.', 'Одного кроку замало — амплітуду треба підсилювати поступово, приблизно √N разів.') },
    }, () => { this.grant(['grover']); this.next(); }));
  }

  shor() {
    this.active = 3;
    this.quest(tr('Stanica 4 — Shor', 'Station 4 — Shor', 'Станція 4 — Шор'), { easy: tr('rozklad na prvočísla', 'factoring into primes', 'розклад на прості'), hard: tr('perióda → faktory, exp. zrýchlenie', 'period → factors, exp. speed-up', 'період → множники, експ. прискорення') });
    this.say([
      tr('Shor rozkladá veľké čísla na prvočísla — to je základ bezpečnosti RSA. Jadrom je hľadanie periódy cez QFT.',
        'Shor factors large numbers into primes — the basis of RSA security. Its core is period finding via the QFT.',
        'Шор розкладає великі числа на прості — основа безпеки RSA. Його ядро — пошук періоду через QFT.'),
      tr('Na rozdiel od Grovera dáva EXPONENCIÁLNE zrýchlenie. Preto by veľký kvantový počítač ohrozil dnešné šifrovanie.',
        'Unlike Grover, it gives an EXPONENTIAL speed-up. That is why a large quantum computer would threaten today\'s encryption.',
        'На відміну від Ґровера, дає ЕКСПОНЕНЦІЙНЕ прискорення. Тому великий квантовий комп’ютер загрожував би сучасному шифруванню.'),
    ], () => this.ask({
      q: tr('Čím sa Shorovo zrýchlenie zásadne líši od Groverovho?', 'How does Shor\'s speed-up fundamentally differ from Grover\'s?', 'Чим прискорення Шора принципово відрізняється від Ґроверового?'),
      options: [
        tr('Shor je exponenciálny, Grover len kvadratický (√N).', 'Shor is exponential, Grover only quadratic (√N).', 'Шор експоненційний, Ґровер лише квадратичний (√N).'),
        tr('Obidva sú exponenciálne a rovnako rýchle.', 'Both are exponential and equally fast.', 'Обидва експоненційні й однаково швидкі.'),
        tr('Grover je rýchlejší než Shor.', 'Grover is faster than Shor.', 'Ґровер швидший за Шора.'),
        tr('Ani jeden neprekoná klasický počítač.', 'Neither beats a classical computer.', 'Жоден не переважає класичний комп’ютер.'),
      ],
      correct: 0, weak: 3,
      why: tr('Shor využíva skrytú periodicitu (štruktúru) a dá exponenciálne zrýchlenie; Grover pre neštruktúrované hľadanie dá len kvadratické.',
        'Shor exploits hidden periodicity (structure) for an exponential speed-up; Grover, for unstructured search, gives only quadratic.',
        'Шор використовує приховану періодичність (структуру) для експоненційного прискорення; Ґровер для неструктурованого пошуку дає лише квадратичне.'),
      whyWrong: { 3: tr('Oba prekonávajú klasiku — Shor dokonca exponenciálne.', 'Both beat classical — Shor even exponentially.', 'Обидва переважають класику — Шор навіть експоненційно.') },
    }, () => { this.grant(['shoralg']); this.next(); }));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Prešiel(a) si všetky štyri stanice. Rozumieš, čím a koľko každý algoritmus získa — a že nie všetko sa zrýchli.',
        'You have walked all four stations. You understand what each algorithm gains and by how much — and that not everything speeds up.',
        'Ти пройшов(-ла) всі чотири станції. Ти розумієш, що і наскільки виграє кожен алгоритм — і що не все прискорюється.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // kruhová sieň so 4 stanicami (piliere + orákulová skrinka); aktívna stanica svieti
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.2, 0], 0, 7), [0.17, 0.2, 0.26], { pattern: 1 });
    const names = ['Deutsch', 'B–V', 'Grover', 'Shor'], R = 4.2;
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * Math.PI * 2 + Math.PI / 4, p = [Math.cos(a) * R, 0, Math.sin(a) * R];
      const on = i === this.active;
      const col = on ? [1, 0.85, 0.35] : V3.scale(this.color || [0.8, 0.5, 1], 0.7);
      // pilier
      r.draw('cylinder', M4.trs([p[0], -0.4, p[2]], 0, [0.4, 0.8, 0.4]), [0.3, 0.33, 0.4]);
      // orákulová skrinka
      r.draw('box', M4.trs([p[0], 0.4, p[2]], a, [0.7, 0.7, 0.7]), col, { emissive: on ? 0.6 : 0.12 });
      if (on) {
        // lúč dotazu z vrcholu do skrinky + vylietajúca odpoveď
        r.sphere([p[0], 1.1 + 0.3 * Math.sin(this.t * 3), p[2]], 0.12, [0.6, 1, 0.8], { emissive: 0.8 });
        // Groverova amplitúda: zvýraznený označený prvok medzi ostatnými
        if (i === 2) {
          for (let k = 0; k < 8; k++) {
            const bx = p[0] + (k - 3.5) * 0.3, mk = (k === (this.mark % 8));
            const amp = mk ? 0.9 : 0.2 + 0.05 * Math.sin(this.t * 2 + k);
            r.draw('box', M4.trs([bx, -0.9 + amp / 2, p[2] + 1.4], 0, [0.18, amp, 0.18]), mk ? [1, 0.4, 0.4] : [0.4, 0.5, 0.7], { emissive: mk ? 0.5 : 0.05 });
          }
        }
      }
      UI.label('st' + i, [p[0], 1.1, p[2]], names[i], on ? 'npc' : 'npc small');
    }
    // Deutsch v strede
    r.sphere([0, 1.3, 0], 0.32, [0.95, 0.85, 0.75], { emissive: 0.1 });
    r.draw('cylinder', M4.trs([0, -0.1, 0], 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [0.8, 0.5, 1], 0.8));
    const cx = CODEX.find((c) => c.id === 'deutschp');
    UI.label('deutsch', [0, 2.1, 0], `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}
