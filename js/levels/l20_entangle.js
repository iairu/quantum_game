'use strict';
// LEVEL 20 (poradie 18) — Dielňa previazanosti (mentor: Erhard Schmidt)
// Prednáška 7: „Previazanosť ako vzťahová geometria“ — súčinový vs. previazaný stav, H + CNOT → Φ⁺,
// čiastočná stopa ρ_A = I/2, Schmidtov rozklad a entropia previazanosti, CP³ vs. CP¹×CP¹,
// no-signalling, obálky vs. kvantové korelácie, teleportácia a superhusté kódovanie.
// Interaktívne: posuvník Schmidtovho koeficientu λ₁ → entropia S(ρ_A).

const ent2 = (x) => (x <= 0 || x >= 1 ? 0 : -x * Math.log2(x) - (1 - x) * Math.log2(1 - x));

class L20Entangle extends Level {
  get steps() { return [this.intro, this.product, this.cnot, this.schmidt, this.relation, this.protocols]; }

  setup() {
    this.cam = new OrbitCam([0, 0.6, 0], 11, 0.5, 0.3, 5, 20);
    this.phase = 'intro';
    this.lam = 1;        // Schmidtov koeficient λ₁ (λ₂ = 1 − λ₁)
    this.circ = 0;       // 0 = |00⟩, 1 = po H, 2 = po CNOT
  }

  intro() {
    this.phase = 'intro'; this.lam = 1; this.circ = 0;
    this.quest(tr('Vypočuj si Schmidta', 'Listen to Schmidt', 'Послухай Шмідта'), { easy: tr('🪞 vzťah medzi časťami', '🪞 the relation between parts', '🪞 зв’язок між частинами'), hard: tr('previazanosť = vzťahová geometria', 'entanglement = relational geometry', 'заплутаність = геометрія зв’язку') });
    this.say([
      tr('Vitaj v dielni previazanosti. Ja som rozkladal funkcie dvoch premenných na súčty súčinov — dnes sa tomu hovorí SCHMIDTOV ROZKLAD.',
        'Welcome to the entanglement workshop. I decomposed functions of two variables into sums of products — today it is called the SCHMIDT DECOMPOSITION.',
        'Ласкаво просимо до майстерні заплутаності. Я розкладав функції двох змінних на суми добутків — сьогодні це називають РОЗКЛАДОМ ШМІДТА.'),
      tr('Previazanosť nie je tajná šnúrka medzi časticami ani „strašidelný signál“ (Einsteinovo strašidlo z Fischerovej knihy). Je to GEOMETRIA VZŤAHU: celok má presný stav, časti samé osebe nie.',
        'Entanglement is not a secret string between particles nor a "spooky signal" (Einstein’s spook from Fischer’s book). It is a GEOMETRY OF RELATION: the whole has a definite state, the parts on their own do not.',
        'Заплутаність — не таємна нитка між частинками і не «моторошний сигнал» (Ейнштейнів привид із книжки Фішера). Це ГЕОМЕТРІЯ ЗВ’ЯЗКУ: ціле має точний стан, а частини самі по собі — ні.'),
      tr('Previazanosť žije „medzi“ — v tom, čo sa nedá rozdeliť na dve samostatné vlastnosti.',
        'Entanglement lives "in between" — in what cannot be split into two separate properties.',
        'Заплутаність живе «між» — у тому, що не можна розділити на дві окремі властивості.'),
    ], () => this.next());
  }

  product() {
    this.phase = 'product'; this.circ = 0; this.lam = 1;
    this.quest(tr('Súčinový alebo previazaný?', 'Product or entangled?', 'Добуток чи заплутаний?'), { easy: tr('dá sa rozdeliť na A ⊗ B?', 'can it be split into A ⊗ B?', 'чи можна розділити на A ⊗ B?'), hard: tr('|ψ⟩<sub>A</sub>⊗|ϕ⟩<sub>B</sub> vs. Φ⁺ = (|00⟩+|11⟩)/√2', '|ψ⟩<sub>A</sub>⊗|ϕ⟩<sub>B</sub> vs. Φ⁺ = (|00⟩+|11⟩)/√2', '|ψ⟩<sub>A</sub>⊗|ϕ⟩<sub>B</sub> vs. Φ⁺ = (|00⟩+|11⟩)/√2') });
    this.say([
      tr('SÚČINOVÝ stav |ψ⟩<sub>A</sub> ⊗ |ϕ⟩<sub>B</sub>: každá časť má vlastný stav a celok je len ich dvojica.',
        'A PRODUCT state |ψ⟩<sub>A</sub> ⊗ |ϕ⟩<sub>B</sub>: each part has its own state and the whole is just their pair.',
        'СТАН-ДОБУТОК |ψ⟩<sub>A</sub> ⊗ |ϕ⟩<sub>B</sub>: кожна частина має власний стан, а ціле — лише їхня пара.'),
      tr('Bellov stav Φ⁺ = (|00⟩ + |11⟩)/√2 tak rozložiť NEJDE. Pri meraní v Z: P(00) = P(11) = ½ a P(01) = P(10) = 0 — výsledky sú dokonale zviazané.',
        'The Bell state Φ⁺ = (|00⟩ + |11⟩)/√2 CANNOT be split that way. Measuring in Z: P(00) = P(11) = ½ and P(01) = P(10) = 0 — the outcomes are perfectly tied.',
        'Стан Белла Φ⁺ = (|00⟩ + |11⟩)/√2 так розкласти НЕ МОЖНА. Вимірюючи в Z: P(00) = P(11) = ½, а P(01) = P(10) = 0 — результати ідеально пов’язані.'),
      tr('Celok je čistý: ρ<sub>AB</sub> = |Φ⁺⟩⟨Φ⁺|. No časť A sama je ρ<sub>A</sub> = Tr<sub>B</sub> ρ<sub>AB</sub> = I/2 — úplne neurčitá. Najviac vieme o celku, najmenej o časti.',
        'The whole is pure: ρ<sub>AB</sub> = |Φ⁺⟩⟨Φ⁺|. But part A alone is ρ<sub>A</sub> = Tr<sub>B</sub> ρ<sub>AB</sub> = I/2 — completely undetermined. Maximal knowledge of the whole, minimal of the part.',
        'Ціле чисте: ρ<sub>AB</sub> = |Φ⁺⟩⟨Φ⁺|. Але частина A сама — ρ<sub>A</sub> = Tr<sub>B</sub> ρ<sub>AB</sub> = I/2, повністю невизначена. Максимум знання про ціле, мінімум — про частину.'),
    ], () => this.ask({
      q: tr('Aký je redukovaný stav ρ<sub>A</sub> = Tr<sub>B</sub> |Φ⁺⟩⟨Φ⁺| jedného qubitu Bellovho páru?', 'What is the reduced state ρ<sub>A</sub> = Tr<sub>B</sub> |Φ⁺⟩⟨Φ⁺| of one qubit of a Bell pair?', 'Який редукований стан ρ<sub>A</sub> = Tr<sub>B</sub> |Φ⁺⟩⟨Φ⁺| одного кубіта пари Белла?'),
      options: [
        tr('I/2 — maximálne zmiešaný stav, hoci celok je čistý.', 'I/2 — the maximally mixed state, although the whole is pure.', 'I/2 — максимально змішаний стан, хоча ціле чисте.'),
        tr('|0⟩⟨0| — qubit A je určite v |0⟩.', '|0⟩⟨0| — qubit A is surely in |0⟩.', '|0⟩⟨0| — кубіт A напевно в |0⟩.'),
        tr('|+⟩⟨+| — čistá superpozícia.', '|+⟩⟨+| — a pure superposition.', '|+⟩⟨+| — чиста суперпозиція.'),
        tr('Nedá sa definovať, lebo A nemá žiadny stav.', 'It cannot be defined, because A has no state at all.', 'Його не можна визначити, бо A взагалі не має стану.'),
      ],
      correct: 0, weak: 2,
      why: tr('Po stope cez B ostanú diagonálne prvky ½ a ½ a koherencie zmiznú: ρ<sub>A</sub> = I/2. Informácia nie je v častiach, ale vo vzťahu medzi nimi.',
        'Tracing over B leaves diagonal entries ½ and ½ and the coherences vanish: ρ<sub>A</sub> = I/2. The information is not in the parts but in their relation.',
        'Після сліду по B лишаються діагональні елементи ½ і ½, а когерентності зникають: ρ<sub>A</sub> = I/2. Інформація не в частинах, а у зв’язку між ними.'),
      whyWrong: { 2: tr('|+⟩ je čistý stav s koherenciou. Čiastočná stopa Bellovho stavu koherenciu zničí — ostane zmes I/2.', '|+⟩ is a pure state with coherence. The partial trace of a Bell state destroys coherence — the mixture I/2 remains.', '|+⟩ — чистий стан із когерентністю. Частковий слід стану Белла знищує когерентність — лишається суміш I/2.') },
    }, () => { this.grant(['schmidtp', 'prodstate', 'ptrace']); this.next(); }));
  }

  cnot() {
    this.phase = 'cnot'; this.circ = 1;
    this.quest(tr('Dva kroky k Φ⁺', 'Two steps to Φ⁺', 'Два кроки до Φ⁺'), { easy: tr('H, potom CNOT', 'H, then CNOT', 'H, потім CNOT'), hard: tr('CNOT (H⊗I)|00⟩ = Φ⁺', 'CNOT (H⊗I)|00⟩ = Φ⁺', 'CNOT (H⊗I)|00⟩ = Φ⁺') });
    this.say([
      tr('Začneme v |00⟩. Hadamard na prvý qubit: (H⊗I)|00⟩ = (|0⟩+|1⟩)/√2 ⊗ |0⟩. Pozri — stále SÚČINOVÝ stav. Superpozícia jedného qubitu ešte nie je previazanosť.',
        'We start in |00⟩. Hadamard on the first qubit: (H⊗I)|00⟩ = (|0⟩+|1⟩)/√2 ⊗ |0⟩. Look — still a PRODUCT state. A superposition of one qubit is not yet entanglement.',
        'Починаємо з |00⟩. Адамар на перший кубіт: (H⊗I)|00⟩ = (|0⟩+|1⟩)/√2 ⊗ |0⟩. Дивись — усе ще СТАН-ДОБУТОК. Суперпозиція одного кубіта — ще не заплутаність.'),
      () => { this.circ = 2; return tr('Až CNOT, ktorý podmieni druhý qubit prvým, vytvorí (|00⟩ + |11⟩)/√2. Previazanosť vzniká INTERAKCIOU.',
        'Only the CNOT, which conditions the second qubit on the first, creates (|00⟩ + |11⟩)/√2. Entanglement arises from INTERACTION.',
        'Лише CNOT, що обумовлює другий кубіт першим, створює (|00⟩ + |11⟩)/√2. Заплутаність виникає з ВЗАЄМОДІЇ.'); },
    ], () => this.ask({
      q: tr('Je stav (H⊗I)|00⟩ previazaný?', 'Is the state (H⊗I)|00⟩ entangled?', 'Чи заплутаний стан (H⊗I)|00⟩?'),
      options: [
        tr('Nie — je to |+⟩⊗|0⟩; previazanosť vytvorí až dvojqubitové hradlo (CNOT).', 'No — it is |+⟩⊗|0⟩; only a two-qubit gate (CNOT) creates entanglement.', 'Ні — це |+⟩⊗|0⟩; заплутаність створює лише двокубітний гейт (CNOT).'),
        tr('Áno — každá superpozícia je previazanosť.', 'Yes — every superposition is entanglement.', 'Так — будь-яка суперпозиція є заплутаністю.'),
        tr('Áno, lebo má dva qubity.', 'Yes, because it has two qubits.', 'Так, бо має два кубіти.'),
        tr('Záleží od toho, kto ho meria.', 'It depends on who measures it.', 'Залежить від того, хто його вимірює.'),
      ],
      correct: 0, weak: 1,
      why: tr('Lokálne hradlá (pôsobiace na jeden qubit) nikdy nevytvoria previazanosť. Treba interakciu medzi qubitmi — CNOT, CZ alebo J-väzbu.',
        'Local gates (acting on one qubit) never create entanglement. An interaction between the qubits is needed — CNOT, CZ or J-coupling.',
        'Локальні гейти (на один кубіт) ніколи не створюють заплутаності. Потрібна взаємодія між кубітами — CNOT, CZ чи J-зв’язок.'),
      whyWrong: { 1: tr('Superpozícia je vlastnosť jedného systému v danej báze; previazanosť je nerozložiteľnosť celku na časti.', 'Superposition is a property of one system in a given basis; entanglement is the non-factorisability of a whole into parts.', 'Суперпозиція — властивість однієї системи в певному базисі; заплутаність — нерозкладність цілого на частини.') },
    }, () => { this.grant(['cnot']); this.next(); }));
  }

  // interaktívne: posuvník λ₁ → entropia previazanosti S(ρ_A)
  schmidt() {
    this.phase = 'schmidt'; this.circ = 2; this.lam = 0.9;
    this.quest(tr('Schmidtov rozklad: nastav maximálnu previazanosť', 'Schmidt decomposition: set maximal entanglement', 'Розклад Шмідта: налаштуй максимальну заплутаність'), { easy: tr('posuň λ₁, kým S = 1', 'slide λ₁ until S = 1', 'посунь λ₁, доки S = 1'), hard: tr('|ψ⟩ = √λ₁|u₁v₁⟩ + √λ₂|u₂v₂⟩, S = −Σλ log₂λ', '|ψ⟩ = √λ₁|u₁v₁⟩ + √λ₂|u₂v₂⟩, S = −Σλ log₂λ', '|ψ⟩ = √λ₁|u₁v₁⟩ + √λ₂|u₂v₂⟩, S = −Σλ log₂λ') });
    this.say([
      tr('Každý čistý stav dvoch qubitov sa dá zapísať ako |ψ⟩ = √λ₁ |u₁⟩|v₁⟩ + √λ₂ |u₂⟩|v₂⟩, kde λ₁ + λ₂ = 1. Toto sú SCHMIDTOVE koeficienty.',
        'Every pure two-qubit state can be written as |ψ⟩ = √λ₁ |u₁⟩|v₁⟩ + √λ₂ |u₂⟩|v₂⟩, with λ₁ + λ₂ = 1. These are the SCHMIDT coefficients.',
        'Будь-який чистий стан двох кубітів можна записати як |ψ⟩ = √λ₁ |u₁⟩|v₁⟩ + √λ₂ |u₂⟩|v₂⟩, де λ₁ + λ₂ = 1. Це коефіцієнти ШМІДТА.'),
      tr('Ak je nenulový len jeden λ, stav je súčinový. Mierou previazanosti je entropia S(ρ<sub>A</sub>) = −λ₁log₂λ₁ − λ₂log₂λ₂. Nastav posuvník tak, aby S = 1.',
        'If only one λ is non-zero, the state is a product. The measure of entanglement is the entropy S(ρ<sub>A</sub>) = −λ₁log₂λ₁ − λ₂log₂λ₂. Set the slider so that S = 1.',
        'Якщо ненульовий лише один λ, стан — добуток. Міра заплутаності — ентропія S(ρ<sub>A</sub>) = −λ₁log₂λ₁ − λ₂log₂λ₂. Встанови повзунок так, щоб S = 1.'),
    ], () => {
      let done = false;
      const out = UI.info('');
      const upd = () => { out.innerHTML = `λ₁ = ${this.lam.toFixed(2)} · λ₂ = ${(1 - this.lam).toFixed(2)}<br>S(ρ<sub>A</sub>) = <b>${ent2(this.lam).toFixed(3)}</b> bit · S(ρ<sub>AB</sub>) = 0`; };
      const sl = UI.slider('λ₁', 0.5, 1, 0.01, this.lam, (v) => {
        this.lam = v; upd();
        if (!done && Math.abs(v - 0.5) < 0.005) {
          done = true; UI.panelHide();
          this.ask({
            q: tr('Pri λ₁ = λ₂ = ½ je S(ρ<sub>A</sub>) = 1 bit, no S(ρ<sub>AB</sub>) = 0. Čo to hovorí?', 'At λ₁ = λ₂ = ½, S(ρ<sub>A</sub>) = 1 bit but S(ρ<sub>AB</sub>) = 0. What does that say?', 'При λ₁ = λ₂ = ½, S(ρ<sub>A</sub>) = 1 біт, але S(ρ<sub>AB</sub>) = 0. Що це означає?'),
            options: [
              tr('Celok je čistý (presne známy), ale každá časť je maximálne neurčitá — to je Bellov stav.', 'The whole is pure (exactly known) but each part is maximally uncertain — that is the Bell state.', 'Ціле чисте (точно відоме), а кожна частина максимально невизначена — це стан Белла.'),
              tr('Entropia celku je vždy súčtom entropií častí.', 'The entropy of the whole is always the sum of the entropies of the parts.', 'Ентропія цілого завжди дорівнює сумі ентропій частин.'),
              tr('Stav je súčinový, lebo λ₁ = λ₂.', 'The state is a product, because λ₁ = λ₂.', 'Стан — добуток, бо λ₁ = λ₂.'),
              tr('Qubit A obsahuje 1 bit správy pre B.', 'Qubit A contains 1 bit of message for B.', 'Кубіт A містить 1 біт повідомлення для B.'),
            ],
            correct: 0, weak: 1,
            why: tr('V kvantovom svete môže byť časť „neurčitejšia“ než celok: S(A) = 1 > S(AB) = 0. Klasicky by to nešlo — entropia celku je aspoň entropia časti.',
              'In the quantum world a part can be "more uncertain" than the whole: S(A) = 1 > S(AB) = 0. Classically this is impossible — the entropy of the whole is at least that of a part.',
              'У квантовому світі частина може бути «невизначенішою» за ціле: S(A) = 1 > S(AB) = 0. Класично це неможливо — ентропія цілого не менша за ентропію частини.'),
            whyWrong: { 2: tr('Súčinový stav má jediný nenulový λ (λ₁ = 1). Rovnaké λ = ½ je naopak MAXIMÁLNA previazanosť.', 'A product state has a single non-zero λ (λ₁ = 1). Equal λ = ½ is on the contrary MAXIMAL entanglement.', 'Добуток має єдиний ненульовий λ (λ₁ = 1). Рівні λ = ½ — навпаки, МАКСИМАЛЬНА заплутаність.') },
          }, () => { this.grant(['schmidt', 'entent']); this.next(); });
        }
        return v.toFixed(2);
      });
      UI.panelSet(tr('Schmidtove koeficienty', 'Schmidt coefficients', 'Коефіцієнти Шмідта'), [sl, out,
        UI.info(tr('λ₁ = 1 → súčinový stav (S = 0). λ₁ = ½ → Bellov stav (S = 1).', 'λ₁ = 1 → product state (S = 0). λ₁ = ½ → Bell state (S = 1).', 'λ₁ = 1 → стан-добуток (S = 0). λ₁ = ½ → стан Белла (S = 1).'))]);
      upd();
    });
  }

  relation() {
    this.phase = 'relation'; this.lam = 0.5;
    this.quest(tr('Obálky, geometria a no-signalling', 'Envelopes, geometry and no-signalling', 'Конверти, геометрія і no-signalling'), { easy: tr('previazanosť ≠ správa', 'entanglement ≠ message', 'заплутаність ≠ повідомлення'), hard: tr('CP³ ⊃ CP¹×CP¹ (Segre); ρ<sub>B</sub> nezávisí od merania A', 'CP³ ⊃ CP¹×CP¹ (Segre); ρ<sub>B</sub> does not depend on A’s measurement', 'CP³ ⊃ CP¹×CP¹ (Сегре); ρ<sub>B</sub> не залежить від вимірювання A') });
    this.say([
      tr('Klasické OBÁLKY: do dvoch obálok vložím dve rovnaké karty a pošlem ich preč. Otvoríš jednu a vieš druhú. To je korelácia z minulosti — a pre Z-merania vyzerá ako Φ⁺.',
        'Classical ENVELOPES: I put two identical cards in two envelopes and send them away. Open one and you know the other. That is a correlation from the past — and for Z measurements it looks like Φ⁺.',
        'Класичні КОНВЕРТИ: я кладу дві однакові карти у два конверти й відсилаю. Відкриєш один — знаєш інший. Це кореляція з минулого — і для Z-вимірювань вона схожа на Φ⁺.'),
      tr('Rozdiel ukážu až merania v INÝCH bázach (X, Y): Φ⁺ je korelovaný vo všetkých, obálky nie. To je jadro Bellových nerovností.',
        'The difference shows only in measurements in OTHER bases (X, Y): Φ⁺ is correlated in all of them, envelopes are not. That is the core of Bell inequalities.',
        'Різницю покажуть лише вимірювання в ІНШИХ базисах (X, Y): Φ⁺ корельований у всіх, конверти — ні. У цьому суть нерівностей Белла.'),
      tr('Geometria: čisté stavy dvoch qubitov tvoria CP³ (6 reálnych rozmerov). Súčinové stavy sú len tenká podmnožina CP¹×CP¹ (4 rozmery). Typický stav je previazaný.',
        'Geometry: pure two-qubit states form CP³ (6 real dimensions). Product states are only a thin subset CP¹×CP¹ (4 dimensions). A typical state is entangled.',
        'Геометрія: чисті стани двох кубітів утворюють CP³ (6 дійсних вимірів). Стани-добутки — лише тонка підмножина CP¹×CP¹ (4 виміри). Типовий стан заплутаний.'),
      tr('A pozor: previazanosť nie je automatické zrýchlenie. Je to zdroj, ktorý treba vedieť použiť.',
        'And beware: entanglement is not an automatic speed-up. It is a resource you must know how to use.',
        'І обережно: заплутаність — не автоматичне прискорення. Це ресурс, яким треба вміти користуватися.'),
    ], () => this.ask({
      q: tr('Alica zmeria svoj qubit Bellovho páru. Čo sa zmení na štatistike Bobových vlastných meraní?', 'Alice measures her qubit of a Bell pair. What changes in the statistics of Bob’s own measurements?', 'Аліса вимірює свій кубіт пари Белла. Що зміниться у статистиці власних вимірювань Боба?'),
      options: [
        tr('Nič — ρ<sub>B</sub> ostane I/2; korelácie uvidia až pri porovnaní výsledkov (no-signalling).', 'Nothing — ρ<sub>B</sub> stays I/2; the correlations show only when they compare results (no-signalling).', 'Нічого — ρ<sub>B</sub> лишається I/2; кореляції видно лише при порівнянні результатів (no-signalling).'),
        tr('Bob okamžite uvidí, akú bázu Alica zvolila.', 'Bob instantly sees which basis Alice chose.', 'Боб миттєво бачить, який базис обрала Аліса.'),
        tr('Bobov qubit sa stane čistým |0⟩ pre všetkých pozorovateľov.', 'Bob’s qubit becomes a pure |0⟩ for all observers.', 'Кубіт Боба стає чистим |0⟩ для всіх спостерігачів.'),
        tr('Bob dostane 1 bit správy rýchlejšie než svetlo.', 'Bob receives 1 bit of message faster than light.', 'Боб отримує 1 біт повідомлення швидше за світло.'),
      ],
      correct: 0, weak: 3,
      why: tr('Bez klasickej správy od Alice Bob vidí stále I/2. Previazanosť je vzťah — prejaví sa až pri spojení oboch záznamov.',
        'Without a classical message from Alice, Bob still sees I/2. Entanglement is a relation — it shows only when both records are brought together.',
        'Без класичного повідомлення від Аліси Боб і далі бачить I/2. Заплутаність — це зв’язок, він проявляється лише при поєднанні обох записів.'),
      whyWrong: { 3: tr('No-signalling: lokálna štatistika B nezávisí od toho, čo robí A. Previazanosťou sa správy neposielajú.', 'No-signalling: B’s local statistics do not depend on what A does. Entanglement does not send messages.', 'No-signalling: локальна статистика B не залежить від дій A. Заплутаністю повідомлень не надсилають.') },
    }, () => { this.grant(['nosignal']); this.next(); }));
  }

  protocols() {
    this.phase = 'protocols';
    this.quest(tr('Previazanosť ako zdroj: protokoly', 'Entanglement as a resource: protocols', 'Заплутаність як ресурс: протоколи'), { easy: tr('teleportácia a superhusté kódovanie', 'teleportation and superdense coding', 'телепортація і надщільне кодування'), hard: tr('1 ebit + 2 bity → 1 qubit; 1 ebit + 1 qubit → 2 bity', '1 ebit + 2 bits → 1 qubit; 1 ebit + 1 qubit → 2 bits', '1 ебіт + 2 біти → 1 кубіт; 1 ебіт + 1 кубіт → 2 біти') });
    this.say([
      tr('TELEPORTÁCIA: Alica má neznámy qubit a polovicu páru Φ⁺. Urobí Bellovo meranie a pošle Bobovi 2 KLASICKÉ bity. Bob podľa nich otočí svoj qubit — a má pôvodný stav.',
        'TELEPORTATION: Alice has an unknown qubit and half of a Φ⁺ pair. She makes a Bell measurement and sends Bob 2 CLASSICAL bits. Bob rotates his qubit accordingly — and has the original state.',
        'ТЕЛЕПОРТАЦІЯ: Аліса має невідомий кубіт і половину пари Φ⁺. Вона робить вимірювання Белла й надсилає Бобові 2 КЛАСИЧНІ біти. Боб відповідно повертає свій кубіт — і має початковий стан.'),
      tr('SUPERHUSTÉ KÓDOVANIE: opačne. Alica pôsobí na svoju polovicu jedným zo štyroch hradiel (I, X, Z, XZ) a pošle Bobovi jediný qubit. Bob Bellovým meraním prečíta 2 bity.',
        'SUPERDENSE CODING: the reverse. Alice applies one of four gates (I, X, Z, XZ) to her half and sends Bob a single qubit. Bob reads 2 bits with a Bell measurement.',
        'НАДЩІЛЬНЕ КОДУВАННЯ: навпаки. Аліса діє на свою половину одним із чотирьох гейтів (I, X, Z, XZ) і надсилає Бобові один кубіт. Боб вимірюванням Белла зчитує 2 біти.'),
    ], () => this.ask({
      q: tr('Prečo teleportácia neprenáša informáciu rýchlejšie než svetlo?', 'Why does teleportation not transmit information faster than light?', 'Чому телепортація не передає інформацію швидше за світло?'),
      options: [
        tr('Bob potrebuje 2 klasické bity od Alice; bez nich je jeho qubit len I/2.', 'Bob needs 2 classical bits from Alice; without them his qubit is just I/2.', 'Бобові потрібні 2 класичні біти від Аліси; без них його кубіт — лише I/2.'),
        tr('Pretože previazanosť sa šíri rýchlosťou zvuku.', 'Because entanglement propagates at the speed of sound.', 'Бо заплутаність поширюється зі швидкістю звуку.'),
        tr('Pretože sa kopíruje pôvodný qubit a kópia letí pomaly.', 'Because the original qubit is copied and the copy travels slowly.', 'Бо оригінальний кубіт копіюється, а копія летить повільно.'),
        tr('Prenáša — teleportácia je nadsvetelná komunikácia.', 'It does — teleportation is faster-than-light communication.', 'Передає — телепортація є надсвітловим зв’язком.'),
      ],
      correct: 0, weak: 2,
      why: tr('Klasický kanál je nutný: až 2 bity povedia Bobovi, ktorú zo štyroch korekcií urobiť. Pôvodný stav Alice sa pritom meraním zničí — žiadne klonovanie.',
        'The classical channel is essential: only the 2 bits tell Bob which of four corrections to apply. Alice’s original state is destroyed by the measurement — no cloning.',
        'Класичний канал обов’язковий: лише 2 біти кажуть Бобові, яку з чотирьох корекцій зробити. Початковий стан Аліси вимірюванням руйнується — жодного клонування.'),
      whyWrong: { 2: tr('Kvantový stav sa skopírovať nedá (no-cloning). Pri teleportácii originál zanikne a objaví sa u Boba.', 'A quantum state cannot be copied (no-cloning). In teleportation the original disappears and reappears at Bob’s.', 'Квантовий стан не можна скопіювати (no-cloning). При телепортації оригінал зникає й з’являється в Боба.') },
    }, () => { this.grant(['teleport', 'superdense']); this.next(); }));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Výborne. Previazanosť je vzťah, ktorý sa nedá rozdeliť medzi časti: celok čistý, časti neurčité, žiadne signály — a predsa zdroj pre teleportáciu aj kódovanie.',
        'Well done. Entanglement is a relation that cannot be divided between the parts: the whole pure, the parts uncertain, no signals — and yet a resource for teleportation and coding.',
        'Чудово. Заплутаність — зв’язок, який не можна поділити між частинами: ціле чисте, частини невизначені, жодних сигналів — і все ж ресурс для телепортації й кодування.') },
    ]);
  }

  update(dt) { this.t += dt; }

  // dva qubity A a B; spojnica = previazanosť (hrúbka ~ S), stĺpce = Schmidtove koeficienty
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.4, 0], 0, 8), [0.16, 0.18, 0.26], { pattern: 1 });
    const A = [-2.4, 0.6, 0], B = [2.4, 0.6, 0], ph = this.phase;
    const ent = ph === 'intro' ? 0 : ph === 'product' ? 1 : ph === 'cnot' ? (this.circ >= 2 ? 1 : 0) : ent2(this.lam);
    const wob = Math.sin(this.t * 2);
    r.sphere(A, 0.7, [0.45, 0.65, 1], { alpha: 0.35 + 0.3 * (1 - ent) });
    r.sphere(B, 0.7, [1, 0.5, 0.6], { alpha: 0.35 + 0.3 * (1 - ent) });
    if (ent > 0.01) {
      r.rod(A, B, [0.85, 0.75, 1], 0.03 + 0.09 * ent, { emissive: 0.4 + 0.3 * wob * ent, alpha: 0.4 + 0.5 * ent });
      UI.hot([0, 1.1, 0], tr(`vzťah: S = ${ent.toFixed(2)}`, `relation: S = ${ent.toFixed(2)}`, `зв’язок: S = ${ent.toFixed(2)}`), 70);
    }
    UI.label('qa', V3.add(A, [0, 1.1, 0]), ent > 0.5 ? 'ρ<sub>A</sub> ≈ I/2' : 'A', 'npc small');
    UI.label('qb', V3.add(B, [0, 1.1, 0]), ent > 0.5 ? 'ρ<sub>B</sub> ≈ I/2' : 'B', 'npc small');
    // Schmidtove stĺpce
    if (this.phase === 'schmidt' || this.phase === 'relation') {
      [this.lam, 1 - this.lam].forEach((l, i) => {
        const x = -0.6 + i * 1.2;
        r.draw('box', M4.trs([x, -1.3 + l * 1.2, 1.8], 0, [0.4, l * 2.4 + 0.02, 0.4]), i ? [1, 0.6, 0.4] : [0.4, 0.8, 1], { emissive: 0.3 });
        UI.label('lam' + i, [x, -0.9 + l * 2.4, 1.8], `λ<sub>${i + 1}</sub>`, 'small');
      });
    }
    // protokoly: klasické bity letia od A k B
    if (this.phase === 'protocols') {
      for (let k = 0; k < 2; k++) {
        const s = (this.t * 0.5 + k * 0.5) % 1;
        r.draw('box', M4.trs(V3.add(V3.add(A, V3.scale(V3.sub(B, A), s)), [0, -1.1, 0]), this.t, 0.18), [1, 0.85, 0.3], { emissive: 0.5 });
      }
      UI.hot([0, -0.3, 0], tr('2 klasické bity', '2 classical bits', '2 класичні біти'), 60);
    }
    // Schmidt
    const mp = [-4.4, -1.2, 1.4];
    r.sphere(V3.add(mp, [0, 1.6, 0]), 0.32, [0.95, 0.85, 0.75], { emissive: 0.1 });
    r.draw('cylinder', M4.trs(mp, 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [0.6, 0.75, 1], 0.8));
    const cx = CODEX.find((c) => c.id === 'schmidtp');
    UI.label('schmidt', V3.add(mp, [0, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}
