'use strict';
// Zoznam levelov v poradí (mapa ostrova). Farby sú portály.
// num = stabilný identifikátor (kľúč do uloženého postupu, Kódexu a máp) — nikdy sa nemení.
// seq = poradie na ostrove a v odomykaní (zobrazené číslo portálu). Nové levely 14–19 majú seq 12–17,
//       takže sa ukážu medzi 11. a praktickou NMR dielňou (seq 18) a drakom (seq 19) bez prečíslovania dát.
const LEVELS = [
  { num: 1, seq: 1, title: tr('Komplexný prístav', 'Complex Harbour', 'Комплексна гавань'), mentor: tr('Leonhard Euler', 'Leonhard Euler', 'Леонард Ейлер'), face: '🧮', color: [0.95, 0.6, 0.25], cls: L1Complex },
  { num: 2, seq: 2, title: tr('Sternova–Gerlachova pec', 'Stern–Gerlach Furnace', 'Піч Штерна–Ґерлаха'), mentor: tr('Stern & Gerlach', 'Stern & Gerlach', 'Штерн і Ґерлах'), face: '🧲', color: [0.95, 0.35, 0.35], cls: L2Stern },
  { num: 3, seq: 3, title: tr('Blochovo observatórium', 'Bloch Observatory', 'Обсерваторія Блоха'), mentor: tr('Felix Bloch', 'Felix Bloch', 'Фелікс Блох'), face: '🌐', color: [0.4, 0.6, 1], cls: L3Bloch },
  { num: 4, seq: 4, title: tr('Chrám interferencie', 'Temple of Interference', 'Храм інтерференції'), mentor: tr('Richard Feynman', 'Richard Feynman', 'Річард Фейнман'), face: '🥁', color: [0.75, 0.45, 1], cls: L4Interference },
  { num: 5, seq: 5, title: tr('Diracova knižnica', 'Dirac’s Library', 'Бібліотека Дірака'), mentor: tr('Paul Dirac', 'Paul Dirac', 'Поль Дірак'), face: '🎩', color: [0.3, 0.85, 0.7], cls: L5Dirac },
  { num: 6, seq: 6, title: tr('Rabiho rezonátor (NMR)', 'Rabi’s Resonator (NMR)', 'Резонатор Рабі (ЯМР)'), mentor: tr('I. I. Rabi', 'I. I. Rabi', 'І. І. Рабі'), face: '📻', color: [1, 0.8, 0.3], cls: L6Rabi },
  { num: 7, seq: 7, title: tr('Bellov most', 'Bell’s Bridge', 'Міст Белла'), mentor: tr('John Bell', 'John Bell', 'Джон Белл'), face: '🔔', color: [1, 0.45, 0.7], cls: L7Bell },
  { num: 8, seq: 8, title: tr('Sieň výkladov', 'Hall of Interpretations', 'Зала тлумачень'), mentor: tr('Niels Bohr', 'Niels Bohr', 'Нільс Бор'), face: '☯', color: [0.6, 0.9, 0.4], cls: L8Philo },
  { num: 9, seq: 9, title: tr('Pauliho rotačná dielňa', 'Pauli’s Rotation Workshop', 'Обертова майстерня Паулі'), mentor: tr('Wolfgang Pauli', 'Wolfgang Pauli', 'Вольфганг Паулі'), face: '🔄', color: [0.2, 0.95, 0.95], cls: L9Pauli },
  { num: 10, seq: 10, title: tr('Von Neumannova čistiareň', 'Von Neumann’s Purity Refinery', 'Очисна станція фон Неймана'), mentor: tr('John von Neumann', 'John von Neumann', 'Джон фон Нейман'), face: '⚗', color: [0.88, 0.88, 1], cls: L10Neumann },
  { num: 11, seq: 11, title: tr('Bornova meracia sieň', 'Born’s Readout Hall', 'Зала вимірювань Борна'), mentor: tr('Max Born', 'Max Born', 'Макс Борн'), face: '🎲', color: [0.95, 0.72, 0.5], cls: L11Born },
  // ---- nové levely (prednášky 5 a 7): ľahšie vizualizačné levely, počítajú sa medzi slová moci ----
  { num: 14, seq: 12, title: tr('Reťaz superpozícií', 'Chain of Superpositions', 'Ланцюг суперпозицій'), mentor: tr('Yuri Manin', 'Yuri Manin', 'Юрій Манін'), face: '🪢', color: [0.5, 0.82, 0.72], cls: L14Chain },
  { num: 15, seq: 13, title: tr('Fourierova veža', 'Fourier Tower', 'Вежа Фур’є'), mentor: tr('Joseph Fourier', 'Joseph Fourier', 'Жозеф Фур’є'), face: '🌊', color: [0.3, 0.7, 1], cls: L15Fourier },
  { num: 16, seq: 14, title: tr('Sieň algoritmov', 'Hall of Algorithms', 'Зала алгоритмів'), mentor: tr('David Deutsch', 'David Deutsch', 'Девід Дойч'), face: '⚙', color: [0.8, 0.5, 1], cls: L16Algo },
  { num: 17, seq: 15, title: tr('Štít korekcie chýb', 'Error-Correction Shield', 'Щит корекції помилок'), mentor: tr('Peter Shor', 'Peter Shor', 'Пітер Шор'), face: '🛡', color: [0.45, 0.85, 0.95], cls: L17Qec },
  { num: 18, seq: 16, title: tr('Chemická kúria NMR', 'NMR Chemistry Manor', 'Хімічна садиба ЯМР'), mentor: tr('Linus Pauling', 'Linus Pauling', 'Лайнус Полінг'), face: '🧪', color: [0.9, 0.6, 0.4], cls: L18NmrChem },
  { num: 19, seq: 17, title: tr('Majoranov maják', 'Majorana Lighthouse', 'Маяк Майорани'), mentor: tr('Ettore Majorana', 'Ettore Majorana', 'Етторе Майорана'), face: '🔶', color: [0.7, 0.7, 0.95], cls: L19Majorana },
  // špeciálny praktický level: odomknutý od začiatku (free), nepočíta sa medzi slová moci proti drakovi
  { num: 12, seq: 18, title: tr('NMR dielňa', 'NMR Workshop', 'ЯМР-майстерня'), mentor: tr('Edward Purcell', 'Edward Purcell', 'Едвард Перселл'), face: '🧫', color: [0.45, 1, 0.75], cls: L12Nmr, free: true },
  { num: 13, seq: 19, title: tr('Dračí štít', 'Dragon’s Peak', 'Драконів пік'), mentor: tr('Erwin Schrödinger', 'Erwin Schrödinger', 'Ервін Шредінгер'), face: '🐱', color: [1, 0.42, 0.15], cls: L13Dragon, boss: true },
].filter((L) => !L.boss || Settings.nordic || Settings.wow); // 13. level (drak) v severskej a MMO téme

// zobrazené číslo levelu (poradie na ostrove), resp. predchodca v poradí odomykania
const dnum = (L) => (L && L.seq) || (L && L.num) || 0;
const levelBySeq = (s) => LEVELS.find((L) => dnum(L) === s) || null;
