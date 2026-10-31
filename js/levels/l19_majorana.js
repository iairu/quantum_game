'use strict';
// LEVEL 19 (poradie 17) — Majoranove hradlá (mentor: Ettore Majorana)
// Ľahší level: Majoranove nulové módy, topologický qubit, pletenie (braiding), anyóny.
// Inline tr() + inline kvízy. Vizualizácia nanodrôtu s dvoma koncami a pletenie trajektórií.

class L19Majorana extends Level {
  get steps() { return [this.intro, this.zeromode, this.topqubit, this.braiding, this.anyons]; }

  setup() {
    this.cam = new OrbitCam([0, 0.4, 0], 10, 0.6, 0.3, 5, 18);
    this.phase = 'intro';
    this.braid = 0;     // priebeh pletenia (0..1)
  }

  intro() {
    this.phase = 'intro';
    this.quest(tr('Vypočuj si Majoranu', 'Listen to Majorana', 'Послухай Майорану'), { easy: tr('🔶 pol-častica', '🔶 half-particle', '🔶 пів-частинка'), hard: tr('častica = vlastná antičastica', 'particle = its own antiparticle', 'частинка = власна античастинка') });
    this.say([
      tr('Predpovedal som časticu, ktorá je svojou vlastnou antičasticou. V pevných látkach sa objavuje ako Majoranov NULOVÝ MÓD.',
        'I predicted a particle that is its own antiparticle. In solids it appears as a Majorana ZERO MODE.',
        'Я передбачив частинку, яка є власною античастинкою. У твердих тілах вона з’являється як майоранівський НУЛЬОВИЙ МОД.'),
      tr('Tieto módy sedia na KONCOCH špeciálneho nanodrôtu. A práve z nich sa dá postaviť nezvyčajne odolný qubit.',
        'These modes sit at the ENDS of a special nanowire. And from them one can build an unusually robust qubit.',
        'Ці моди сидять на КІНЦЯХ особливого нанодроту. І саме з них можна побудувати надзвичайно стійкий кубіт.'),
      tr('Jeho sila je v topológii: informácia nie je na jednom mieste, ale ROZLOŽENÁ — a tým chránená pred lokálnym šumom.',
        'Its strength is topology: the information is not in one place but DELOCALIZED — and thus protected from local noise.',
        'Його сила — у топології: інформація не в одному місці, а РОЗПОДІЛЕНА — і тим захищена від локального шуму.'),
    ], () => this.next());
  }

  zeromode() {
    this.phase = 'zeromode';
    this.quest(tr('Majoranove nulové módy', 'Majorana zero modes', 'Майоранівські нульові моди'), { easy: tr('pol qubitu na každom konci', 'half a qubit at each end', 'пів кубіта на кожному кінці'), hard: tr('dva módy = jeden nelokálny qubit', 'two modes = one non-local qubit', 'два моди = один нелокальний кубіт') });
    this.say([
      tr('Jeden qubit je uložený v DVOJICI Majoranových módov na opačných koncoch drôtu. Každý koniec drží len „polovicu“ informácie.',
        'One qubit is stored in a PAIR of Majorana modes at opposite ends of the wire. Each end holds only "half" of the information.',
        'Один кубіт зберігається в ПАРІ майоранівських модів на протилежних кінцях дроту. Кожен кінець тримає лише «половину» інформації.'),
    ], () => this.ask({
      q: tr('Kde je uložená informácia topologického qubitu z dvojice Majoranových módov?', 'Where is the information of a topological qubit from a pair of Majorana modes stored?', 'Де зберігається інформація топологічного кубіта з пари майоранівських модів?'),
      options: [
        tr('Nelokálne — rozdelená medzi oba vzdialené konce naraz.', 'Non-locally — split between both distant ends at once.', 'Нелокально — розподілена між обома віддаленими кінцями одразу.'),
        tr('Na jednom konci drôtu.', 'At one end of the wire.', 'На одному кінці дроту.'),
        tr('V strede drôtu.', 'In the middle of the wire.', 'У середині дроту.'),
        tr('V magnetickom poli okolo drôtu.', 'In the magnetic field around the wire.', 'У магнітному полі навколо дроту.'),
      ],
      correct: 0, weak: 3,
      why: tr('Práve nelokálnosť je kľúč: lokálny šum na jednom konci nevie prečítať ani pokaziť celý qubit, lebo informáciu nesie dvojica spolu.',
        'Non-locality is the key: local noise at one end cannot read or corrupt the whole qubit, because the information is carried by the pair together.',
        'Саме нелокальність — ключ: локальний шум на одному кінці не може ні прочитати, ні зіпсувати весь кубіт, бо інформацію несе пара разом.'),
      whyWrong: { 1: tr('Ak by informácia sedela na jednom konci, stratili by sme práve topologickú ochranu.', 'If the information sat at one end, we would lose precisely the topological protection.', 'Якби інформація сиділа на одному кінці, ми б утратили саме топологічний захист.') },
    }, () => { this.grant(['majoranap', 'zeromode']); this.next(); }));
  }

  topqubit() {
    this.phase = 'topqubit';
    this.quest(tr('Topologický qubit', 'The topological qubit', 'Топологічний кубіт'), { easy: tr('odolný voči šumu', 'robust against noise', 'стійкий до шуму'), hard: tr('chyba vyžaduje globálnu zmenu', 'an error needs a global change', 'помилка потребує глобальної зміни') });
    this.say([
      tr('Prečo je taký odolný? Aby si zmenil stav qubitu, musel by šum pôsobiť na OBA konce koordinovane — to je veľmi nepravdepodobné.',
        'Why so robust? To change the qubit\'s state, noise would have to act on BOTH ends in a coordinated way — which is very unlikely.',
        'Чому такий стійкий? Щоб змінити стан кубіта, шум мав би подіяти на ОБИДВА кінці узгоджено — а це дуже малоймовірно.'),
    ], () => this.ask({
      q: tr('Prečo topologický qubit potrebuje menej aktívnej korekcie chýb než bežný qubit?', 'Why does a topological qubit need less active error correction than an ordinary qubit?', 'Чому топологічний кубіт потребує менше активної корекції помилок, ніж звичайний?'),
      options: [
        tr('Ochrana je zabudovaná vo fyzike — lokálny šum nestačí na zmenu nelokálne uloženej informácie.', 'Protection is built into the physics — local noise is not enough to change non-locally stored information.', 'Захист вбудований у фізику — локального шуму недостатньо, щоб змінити нелокально збережену інформацію.'),
        tr('Nikdy nerobí žiadne chyby.', 'It never makes any errors.', 'Він ніколи не робить помилок.'),
        tr('Beží pri izbovej teplote, takže šum neexistuje.', 'It runs at room temperature, so there is no noise.', 'Він працює за кімнатної температури, тож шуму немає.'),
        tr('Je to klasický bit, nie qubit.', 'It is a classical bit, not a qubit.', 'Це класичний біт, а не кубіт.'),
      ],
      correct: 0, weak: 1,
      why: tr('Topologická ochrana znižuje chybovosť na úrovni hardvéru, takže treba menej softvérovej korekcie — no nie je úplne bez chýb.',
        'Topological protection lowers the error rate at the hardware level, so less software correction is needed — but it is not entirely error-free.',
        'Топологічний захист знижує рівень помилок на рівні апаратури, тож потрібно менше програмної корекції — але він не зовсім безпомилковий.'),
      whyWrong: { 1: tr('Bezchybný nie je — len je odolnejší. Istú korekciu stále potrebuje.', 'It is not error-free — just more robust. It still needs some correction.', 'Він не безпомилковий — лише стійкіший. Певна корекція все одно потрібна.') },
    }, () => { this.grant(['topqubit']); this.next(); }));
  }

  braiding() {
    this.phase = 'braiding'; this.braid = 0;
    this.quest(tr('Pletenie (braiding) = hradlá', 'Braiding = gates', 'Плетіння (braiding) = гейти'), { easy: tr('vymeň polohy → hradlo', 'swap positions → gate', 'обмін позицій → гейт'), hard: tr('výsledok závisí len od poradia zámen', 'result depends only on the order of swaps', 'результат залежить лише від порядку обмінів') });
    this.say([
      tr('Hradlá tu nerobíme pulzami, ale POHYBOM: Majoranove módy navzájom „prepleteme“ — vymeníme ich polohy v priestore.',
        'Here we do gates not with pulses but with MOTION: we "braid" the Majorana modes — swap their positions in space.',
        'Гейти тут робимо не імпульсами, а РУХОМ: майоранівські моди «переплітаємо» — міняємо їхні позиції в просторі.'),
      tr('Výsledok závisí len od TOPOLÓGIE pohybu (ako sa trajektórie prepletú), nie od presného tvaru či rýchlosti — preto je odolný.',
        'The result depends only on the TOPOLOGY of the motion (how the paths braid), not on the exact shape or speed — hence it is robust.',
        'Результат залежить лише від ТОПОЛОГІЇ руху (як переплітаються траєкторії), а не від точної форми чи швидкості — тому він стійкий.'),
    ], () => this.ask({
      q: tr('Od čoho závisí hradlo vykonané prepletením (braidingom) Majoranových módov?', 'What does a gate performed by braiding Majorana modes depend on?', 'Від чого залежить гейт, виконаний плетінням майоранівських модів?'),
      options: [
        tr('Len od toho, ako sa trajektórie prepletú (ich topológie), nie od detailov pohybu.', 'Only on how the paths braid (their topology), not on the details of the motion.', 'Лише від того, як переплітаються траєкторії (їхньої топології), а не від деталей руху.'),
        tr('Od presnej rýchlosti a času pohybu.', 'On the exact speed and timing of the motion.', 'Від точної швидкості та часу руху.'),
        tr('Od farby nanodrôtu.', 'On the colour of the nanowire.', 'Від кольору нанодроту.'),
        tr('Od toho, kto sa na experiment pozerá.', 'On who is watching the experiment.', 'Від того, хто спостерігає за експериментом.'),
      ],
      correct: 0, weak: 3,
      why: tr('Topologická povaha znamená, že drobné chvenie či nepresná rýchlosť výsledok nezmenia — záleží iba na tom, koľkokrát a ako sa dráhy prekrížia.',
        'The topological nature means small jitter or imprecise speed do not change the result — only how many times and how the paths cross matters.',
        'Топологічна природа означає, що дрібне тремтіння чи неточна швидкість не змінюють результат — важливо лише, скільки разів і як перетинаються шляхи.'),
      whyWrong: { 1: tr('Práve nezávislosť od rýchlosti a času je zdrojom odolnosti — keby na nich záležalo, ochrana by zmizla.', 'Independence from speed and timing is the source of robustness — if they mattered, the protection would vanish.', 'Саме незалежність від швидкості й часу є джерелом стійкості — якби вони мали значення, захист зник би.') },
    }, () => { this.grant(['braiding']); this.next(); }));
  }

  anyons() {
    this.phase = 'anyons'; this.braid = 1;
    this.quest(tr('Anyóny a Majoranove hradlá', 'Anyons and Majorana gates', 'Еньйони та майоранівські гейти'), { easy: tr('nie fermión, nie bozón', 'not a fermion, not a boson', 'не ферміон, не бозон'), hard: tr('neabelovské anyóny → nekomutujúce hradlá', 'non-abelian anyons → non-commuting gates', 'неабелеві еньйони → некомутуючі гейти') });
    this.say([
      tr('V 2D svete žijú ANYÓNY — nie sú ani fermióny, ani bozóny. Majoranove módy sa správajú ako neabelovské anyóny.',
        'In the 2D world live ANYONS — neither fermions nor bosons. Majorana modes behave like non-abelian anyons.',
        'У 2D-світі живуть ЕНЬЙОНИ — ні ферміони, ні бозони. Майоранівські моди поводяться як неабелеві еньйони.'),
      tr('„Neabelovské“ znamená, že na PORADÍ prepletení záleží — iné poradie dá iné hradlo. To stačí na výpočty.',
        '"Non-abelian" means the ORDER of braids matters — a different order gives a different gate. That is enough to compute.',
        '«Неабелеві» означає, що ПОРЯДОК плетінь важливий — інший порядок дає інший гейт. Цього досить для обчислень.'),
      tr('Majoranove hradlá samé osebe nestačia na univerzálny počítač — treba ich doplniť (napr. T-hradlom). Ale základ je mimoriadne odolný.',
        'Majorana braiding alone is not enough for a universal computer — it must be supplemented (e.g. with a T-gate). But the foundation is extremely robust.',
        'Самого майоранівського плетіння недостатньо для універсального комп’ютера — його треба доповнити (напр. T-гейтом). Але основа надзвичайно стійка.'),
    ], () => this.ask({
      q: tr('Čo znamená, že Majoranove anyóny sú „neabelovské“?', 'What does it mean that Majorana anyons are "non-abelian"?', 'Що означає, що майоранівські еньйони «неабелеві»?'),
      options: [
        tr('Na poradí prepletení záleží — zámena poradia dá iný výsledný stav.', 'The order of braids matters — swapping the order gives a different final state.', 'Порядок плетінь важливий — зміна порядку дає інший кінцевий стан.'),
        tr('Nemajú žiadny náboj.', 'They have no charge.', 'Вони не мають заряду.'),
        tr('Správajú sa presne ako obyčajné elektróny.', 'They behave exactly like ordinary electrons.', 'Вони поводяться точно як звичайні електрони.'),
        tr('Dajú sa pliesť len v 3D.', 'They can only be braided in 3D.', 'Їх можна плести лише у 3D.'),
      ],
      correct: 0, weak: 2,
      why: tr('Neabelovské = operácie prepletenia nekomutujú. Práve preto rôzne poradia pletení počítajú rôzne veci — to je základ topologického počítania.',
        'Non-abelian = braiding operations do not commute. That is exactly why different braid orders compute different things — the basis of topological computing.',
        'Неабелеві = операції плетіння не комутують. Саме тому різні порядки плетінь обчислюють різне — основа топологічних обчислень.'),
      whyWrong: { 2: tr('Keby sa správali ako bežné elektróny (fermióny), nedali by sa použiť na topologické hradlá.', 'If they behaved like ordinary electrons (fermions), they could not be used for topological gates.', 'Якби вони поводилися як звичайні електрони (ферміони), їх не можна було б використати для топологічних гейтів.') },
    }, () => this.next()));
  }

  finale() {
    finishLight(this, [
      { who: this.mentor, face: this.face, text: tr('Výborne. Pochopil(a) si topologickú cestu: informáciu ukrytú v dvojici módov a hradlá robené pletením. Odolnosť priamo z geometrie.',
        'Well done. You have grasped the topological path: information hidden in a pair of modes, gates made by braiding. Robustness straight from geometry.',
        'Чудово. Ти зрозумів(-ла) топологічний шлях: інформація, схована в парі модів, і гейти, зроблені плетінням. Стійкість прямо з геометрії.') },
    ]);
  }

  update(dt) {
    this.t += dt;
    if (this.phase === 'braiding') this.braid = (this.braid + dt * 0.4) % 1;
  }

  // nanodrôt s dvoma Majoranovými módmi na koncoch; v kroku braiding sa dva módy prepletajú
  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -1.4, 0], 0, 8), [0.16, 0.18, 0.26], { pattern: 1 });
    const braiding = (this.phase === 'braiding' || this.phase === 'anyons');
    if (!braiding) {
      // jeden nanodrôt, dva nulové módy na koncoch
      r.rod([-3, 0, 0], [3, 0, 0], [0.4, 0.45, 0.6], 0.12);
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 2);
      [[-3, 0, 0], [3, 0, 0]].forEach((p, i) => {
        r.sphere(p, 0.4, [1, 0.7, 0.3], { emissive: 0.4 + 0.3 * pulse });
        UI.label('mz' + i, V3.add(p, [0, 0.9, 0]), tr('Majoranov mód', 'Majorana mode', 'майоранівський мод'), 'npc small');
      });
      // „nelokálne“ spojenie medzi koncami (informácia rozložená)
      r.rod([-3, 0, 0], [3, 0, 0], [0.5, 0.9, 1], 0.03, { pattern: 1, emissive: 0.3, alpha: 0.5 });
      UI.hot([0, 0.7, 0], tr('1 nelokálny qubit', '1 non-local qubit', '1 нелокальний кубіт'), 70);
    } else {
      // dva páry anyónov; dva z nich sa prepletajú (braiding)
      const b = this.braid * Math.PI * 2;
      const pts = [
        [-3, 0, Math.sin(b) * 0.9],
        [-1, 0, -Math.sin(b) * 0.9],
        [1, 0, 0],
        [3, 0, 0],
      ];
      const cols = [[1, 0.5, 0.3], [0.4, 0.8, 1], [1, 0.85, 0.4], [0.7, 0.7, 0.95]];
      pts.forEach((p, i) => {
        const y = (i < 2) ? Math.cos(b) * 0.0 : 0;
        r.sphere([p[0], y, p[2]], 0.36, cols[i], { emissive: 0.4 });
      });
      // prepletené trajektórie prvých dvoch anyónov
      for (let s = 0; s <= 1; s += 0.05) {
        const a = s * Math.PI * 2;
        r.sphere([-3 + s * 2, 0, Math.sin(a) * 0.9], 0.05, [1, 0.5, 0.3], { alpha: 0.5 });
        r.sphere([-1 - s * 2 + 2, 0, -Math.sin(a) * 0.9], 0.05, [0.4, 0.8, 1], { alpha: 0.5 });
      }
      UI.hot([-2, 1.0, 0], tr('pletenie = hradlo', 'braiding = gate', 'плетіння = гейт'), 70);
      if (this.phase === 'anyons') UI.hot([2, 1.0, 0], tr('poradie záleží', 'order matters', 'порядок важливий'), 60);
    }
    // Majorana
    const mp = [-4.4, -1.2, 1.4];
    r.sphere(V3.add(mp, [0, 1.6, 0]), 0.32, [0.95, 0.85, 0.75], { emissive: 0.1 });
    r.draw('cylinder', M4.trs(mp, 0, [0.32, 1.4, 0.32]), V3.scale(this.color || [0.7, 0.7, 0.95], 0.8));
    const cx = CODEX.find((c) => c.id === 'majoranap');
    UI.label('majorana', V3.add(mp, [0, 2.4, 0]), `${this.face} ${this.mentor}`, 'npc', cx ? cx.text : null);
  }
}
