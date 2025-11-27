'use client'
import { motion } from 'framer-motion';
import ParticleField from './Components/ParticleField';
import React, { useEffect, useState } from 'react';
import "./globals.css";

// ============ Types ============
type Lang = 'ru' | 'en';

type ThemeKey = 'light' | 'dark' | 'liquidLight' | 'liquidDark';

type Player = { id: string; name: string };

// ============ i18n (simple) ============
const DICT: Record<Lang, Record<string, string>> = {
  ru: {
    title: 'Найдите Предателя!',
    play: 'Играть',
    multiplayer: 'Мультиплеер',
    settings: 'Настройки',
    about: 'Обо мне',
    startGame: 'Начать игру',
    back: 'Назад',
    player: 'Игрок',
    players: 'Игроки',
    addPlayer: 'Добавить игрока',
    traitors: 'Предатели',
    hintForImpostor: 'Подсказка предателю',
    chooseThemes: 'Выберите темы',
    readyPlayer: 'Игрок {n}, приготовьтесь! Нажмите и удерживайте, чтобы увидеть роль',
    youAreTraitor: 'ВЫ ПРЕДАТЕЛЬ!',
    youAreNormal: 'Слово: {word}',
    endGame: 'Закончить игру',
    revealWord: 'Загаданное слово',
    newGame: 'Новая игра',
    hinte: 'Подсказка',
    holdToReveal: 'Удерживайте, чтобы увидеть роль',
    tractors: 'Предатель(ли)',
      howToPlay: "Как играть",
  howToPlayText: "Игрокам даётся одно слово, но один (или несколько) игрок не видит слово. Игроки по очереди говорят ассоциации. После круга обсуждений все голосуют за предполагаемого предателя.",
  },
  en: {
    title: 'Find The Impostor!',
    play: 'Play',
    multiplayer: 'Multiplayer',
    settings: 'Settings',
    about: 'About me',
    startGame: 'Start game',
    back: 'Back',
    player: 'Player',
    players: 'Players',
    addPlayer: 'Add player',
    traitors: 'Traitors',
    hintForImpostor: 'Hint for impostor',
    chooseThemes: 'Choose topics',
    readyPlayer: 'Player {n}, get ready! Press & hold to view role',
    youAreTraitor: 'YOU ARE THE IMPOSTOR!',
    youAreNormal: 'Word: {word}',
    endGame: 'End game',
    revealWord: 'Revealed word',
    newGame: 'New game',
    hinte: 'Hint',
    holdToReveal: 'Hold to reveal your role',
    tractors: 'Traitor(s)',
    howToPlay: "How to play",
    howToPlayText: "Players get a secret word, except one (or more) impostor. Players give associations one by one. After discussion, everyone votes who the impostor is.",
  },
};

// ============ Helpers ============
const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 9);

function t(lang: Lang, key: string, vars?: Record<string, string | number>) {
  const s = DICT[lang][key] ?? key;
  if (!vars) return s;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, String(v)), s);
}

// ============ Local Storage Hook ============
function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [state]);

  return [state, setState] as const;
}


// ============ App Component (preview single-file) ============
export default function ChameleonPreview() {
  const [lang, setLang] = useLocalStorage<Lang>('prefs.lang', 'ru');
  const [theme, setTheme] = useLocalStorage<ThemeKey>('prefs.theme', 'liquidLight');

const [screen, setScreen] = useState<'menu' | 'setup' | 'revealSequence' | 'end' | 'howto'>('menu');
  const [players, setPlayers] = useLocalStorage<Player[]>('game.players', [
    { id: uid('p-'), name: 'Игрок 1' },
    { id: uid('p-'), name: 'Игрок 2' },
    { id: uid('p-'), name: 'Игрок 3' },
  ]);
  const [traitorsCount, setTraitorsCount] = useLocalStorage<number>('game.traitors', 1);
  const [hintForImpostor, setHintForImpostor] = useLocalStorage<boolean>('game.hint', true);
  const [selectedThemes, setSelectedThemes] = useLocalStorage<string[]>('game.themes', ['Еда']);

  const [secretWord, setSecretWord] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

type WordEntry = { id: string; word: string; hint?: string };

  const WORDS_RU: Record<string, WordEntry[]> = {
  'Еда': [
    { id: 'food-1', word: 'Яблоко', hint: 'Фрукт' },
    { id: 'food-2', word: 'Хлеб', hint: 'Булка' },
    { id: 'food-3', word: 'Дуршлаг', hint: 'Дождь' },
    { id: 'food-4', word: 'Суп', hint: 'Ложка' },
    { id: 'food-5', word: 'Пицца', hint: 'Италия' },
    { id: 'food-6', word: 'Буррито', hint: 'Мексика' },
    { id: 'food-7', word: 'Суши', hint: 'Рис' },
    { id: 'food-8', word: 'Кебаб', hint: 'Мангал' },
    { id: 'food-9', word: 'Вафля', hint: 'Хруст' },
    { id: 'food-10', word: 'Омлет', hint: 'Завтрак' }
  ],

  'Бытовая техника': [
    { id: 'ap-1', word: 'Холодильник', hint: 'Холод' },
    { id: 'ap-2', word: 'Стиралка', hint: 'Порошок' },
    { id: 'ap-3', word: 'Микроволновка', hint: 'Разогрев' },
    { id: 'ap-4', word: 'Пылесос', hint: 'Шум' },
    { id: 'ap-5', word: 'Тостер', hint: 'Поджарка' }
  ],

  'Фильмы': [
    { id: 'movie-1', word: 'Титаник', hint: 'Корабль' },
    { id: 'movie-2', word: 'Матрица', hint: 'Зелёный' },
    { id: 'movie-3', word: 'Интерстеллар', hint: 'Космос' },
    { id: 'movie-4', word: 'Шрек', hint: 'Болото' },
    { id: 'movie-5', word: 'Такси', hint: 'Марсель' }
  ],

  'Игры': [
    { id: 'game-1', word: 'Майнкрафт', hint: 'Кубы' },
    { id: 'game-2', word: 'Скайрим', hint: 'Дракон' },
    { id: 'game-3', word: 'Дота', hint: 'Антимаг' },
    { id: 'game-4', word: 'КС', hint: 'Бомба' },
    { id: 'game-5', word: 'ГТА', hint: 'Ограбление' }
  ],

  'Политика': [
    { id: 'pol-1', word: 'Президент', hint: 'Выборы' },
    { id: 'pol-2', word: 'Парламент', hint: 'Законы' },
    { id: 'pol-3', word: 'Санкции', hint: 'Ограничения' },
    { id: 'pol-4', word: 'Бюрократия', hint: 'Очередь' },
    { id: 'pol-5', word: 'Дипломатия', hint: 'Переговоры' }
  ],

  'Животные': [
    { id: 'ani-1', word: 'Кот', hint: 'Мурр' },
    { id: 'ani-2', word: 'Собака', hint: 'Лай' },
    { id: 'ani-3', word: 'Акула', hint: 'Плавник' },
    { id: 'ani-4', word: 'Панда', hint: 'Бамбук' },
    { id: 'ani-5', word: 'Орёл', hint: 'Крылья' }
  ],

  'Музыка': [
    { id: 'music-1', word: 'Рок', hint: 'Гитара' },
    { id: 'music-2', word: 'Рэп', hint: 'Бит' },
    { id: 'music-3', word: 'Опера', hint: 'Ария' },
    { id: 'music-4', word: 'Джаз', hint: 'Импровизация' },
    { id: 'music-5', word: 'Техно', hint: 'Рейв' }
  ],

  'Страны': [
    { id: 'country-1', word: 'Япония', hint: 'Самураи' },
    { id: 'country-2', word: 'США', hint: 'Орёл' },
    { id: 'country-3', word: 'Польша', hint: 'Пироги' },
    { id: 'country-4', word: 'Канада', hint: 'Клен' },
    { id: 'country-5', word: 'Египет', hint: 'Пирамиды' }
  ],

  'Мемы': [
    { id: 'meme-1', word: 'Дoge', hint: 'Вау' },
    { id: 'meme-2', word: 'Шрекмем', hint: 'Луковицы' },
    { id: 'meme-3', word: 'Троллфейс', hint: 'Ухмылка' },
    { id: 'meme-4', word: 'Рикролл', hint: 'Песня' },
    { id: 'meme-5', word: 'Кринж', hint: 'Фейспалм' }
  ],

  'Рандомная хрень': [
    { id: 'rnd-1', word: 'Ядерное вооружение', hint: 'Бум' },
    { id: 'rnd-2', word: 'Госдолг США', hint: 'Триллионы' },
    { id: 'rnd-3', word: 'Тарифы ЖКХ', hint: 'Квитанция' },
    { id: 'rnd-4', word: 'Скумбрия', hint: 'Рыба' },
    { id: 'rnd-5', word: 'Робот-пылесос', hint: 'Кругляш' }
  ]
  };

  const WORDS_EN: Record<string, WordEntry[]> = {
    'Food': [
      { id: 'food-1', word: 'Apple', hint: 'Fruit' },
      { id: 'food-2', word: 'Bread', hint: 'Loaf' },
      { id: 'food-3', word: 'Colander', hint: 'Rain' },
      { id: 'food-4', word: 'Soup', hint: 'Spoon' },
      { id: 'food-5', word: 'Pizza', hint: 'Italy' },
    ],
    'Appliances': [
      { id: 'ap-1', word: 'Fridge', hint: 'Cold' },
      { id: 'ap-2', word: 'Washer', hint: 'Detergent' },
    ],
    'Celebrities': [
      { id: 'celeb-1', word: 'Beyonce', hint: 'Singer' },
      { id: 'celeb-2', word: 'Ronaldo', hint: 'Football' },
    ]
  };

  const pickExcept = (arr: string[], exclude?: string) => {
    const pool = arr.filter(x => x !== exclude);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : undefined;
  };
    type RoleInfo = { role: 'TRAITOR' | 'NORMAL'; entry?: WordEntry };

  const [rolesAssigned, setRolesAssigned] =
    useState<Record<string, RoleInfo>>({});


  // ============ Functions ============
function startGame() {
  const dict = lang === 'ru' ? WORDS_RU : WORDS_EN;
  const pool: WordEntry[] = [];
  for (const th of selectedThemes) {
    const arr = dict[th] ?? [];
    pool.push(...arr);
  }
  const chosenEntry = pool.length ? pool[Math.floor(Math.random() * pool.length)] : { id: 'fallback', word: lang === 'ru' ? 'ТЕЛЕВИЗОР' : 'TV', hint: undefined };

  // assign traitors
  const ids = players.map(p => p.id);
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  const traitors = shuffled.slice(0, Math.max(1, Math.min(traitorsCount, Math.floor(players.length/2))));

  const roles: Record<string, RoleInfo> = {};
  players.forEach(p => {
    if (traitors.includes(p.id)) {
      const hintEntry = hintForImpostor ? chosenEntry.hint ?? undefined : undefined;
      roles[p.id] = { role: 'TRAITOR', entry: hintEntry ? { ...chosenEntry, hint: hintEntry } : undefined };
    } else {
      roles[p.id] = { role: 'NORMAL', entry: chosenEntry };
    }
  });

  setSecretWord(chosenEntry.word);
  setRolesAssigned(roles as any);
  setCurrentIndex(0);
  setScreen('revealSequence');
}


  function resetToSetup() {
    setScreen('setup');
    setRolesAssigned({});
    setSecretWord(null);
  }

  // ============ UI subcomponents ============
const MainBlock: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div className="min-h-screen flex items-center justify-center bg-panel transition-all duration-300 p-6">
    {/* particles behind content */}
    <ParticleField count={30} />
    <div className="panel w-full max-w-3xl p-6 relative z-10">
      {children}
    </div>
  </div>
);

  
  function MenuScreen(){
    return (
      <MainBlock>
        <h1 className="text-3xl font-bold mb-6">{t(lang,'title')}</h1>
        <div className="flex flex-col gap-3">
          <button className="btn-primary" onClick={()=>setScreen('setup')}>{t(lang,'play')}</button>
          <button className="btn-disabled py-3 rounded-lg" disabled>{t(lang,'multiplayer')}</button>
          <button className="btn-ghost py-3 rounded-lg" onClick={()=>setScreen('setup')}>{t(lang,'settings')}</button>
          <button className="btn-soft py-3 rounded-lg" onClick={()=>setScreen('howto')}>
            {t(lang,'howToPlay')}
          </button>
        </div>
        <div className="mt-6 text-sm opacity-80">{t(lang,'about')}: <br/>Swino4ka - (<a href='https://github.com/Swino4ka'>Github</a> - <a href='linkedin.com/in/oleksandr-kvartiuk-b24171265'>LinkedIn</a> - <a href='https://swino4ka.github.io/Portfolio/'>Portfolio</a>)</div>
      </MainBlock>
    );
  }

  function HowToScreen() {
  return (
    <MainBlock>
      <button className="btn-soft" onClick={()=>setScreen('menu')}>
        {t(lang,'back')}
      </button>

      <h2 className="text-2xl font-semibold mb-4">
        {t(lang,'howToPlay')}
      </h2>

      <p className="opacity-90 leading-relaxed">
        {t(lang,'howToPlayText')}
      </p>
    </MainBlock>
  );
}


  function SetupScreen(){
    return (
      <MainBlock>
        <button className="btn-soft" onClick={()=>setScreen('menu')}>{t(lang,'back')}</button>
        <h2 className="text-2xl font-semibold mb-4">{t(lang,'startGame')}</h2>

        <section className="mb-4">
          <h3 className="font-medium">{t(lang,'players')}</h3>
          <div className="space-y-2 mt-2">
            {players.map((p, idx)=> (
              <div key={p.id} className="flex items-center gap-2">
                <input className="input flex-1" value={p.name}
                  onChange={e=> setPlayers(ps => ps.map(x => x.id===p.id ? {...x, name: e.target.value} : x))} />
                <button onClick={()=> setPlayers(ps => ps.filter(x=>x.id!==p.id))} className="icon-btn">🗑️</button>
                <button onClick={()=> setPlayers(ps => {
                  const copy = [...ps];
                  if (idx>0){ [copy[idx-1], copy[idx]] = [copy[idx], copy[idx-1]]; }
                  return copy;
                })} className="icon-btn">⬆️</button>
              </div>
            ))}
            <button className="mt-2 btn-soft" onClick={()=> setPlayers(ps => [...ps, {id: uid('p-'), name: `${ps.length+1}`}])}>{t(lang,'addPlayer')}</button>
          </div>
        </section>

        <section className="mb-4">
          <h3 className="font-medium">{t(lang,'traitors')}</h3>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={()=> setTraitorsCount(c=> Math.max(1, c-1))} className="icon-btn w-10 h-10 flex items-center justify-center text-xl">-</button>
            <div>{traitorsCount}</div>
            <button onClick={()=> setTraitorsCount(c=> Math.min(Math.floor(players.length/2), c+1))} className="icon-btn w-10 h-10 flex items-center justify-center text-xl">+</button>
            <label className="ml-4 inline-flex items-center gap-2"><input type="checkbox" checked={hintForImpostor} onChange={e=>setHintForImpostor(e.target.checked)} />{t(lang,'hintForImpostor')}</label>
          </div>
        </section>

        <section className="mb-4">
          <h3 className="font-medium">{t(lang,'chooseThemes')}</h3>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {Object.keys(WORDS_RU).map(th => (
              <button key={th} onClick={()=> setSelectedThemes(st => st.includes(th) ? st.filter(x=>x!==th) : [...st, th])}
                className={`card p-4 flex flex-col items-center justify-center ${selectedThemes.includes(th) ? 'bg-white/20 border-white/30 ring-2 ring-blue-400/40' : ''}`}>
                <div className="text-2xl">🍽️</div>
                <div className="mt-1 text-sm">{th}</div>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 flex justify-end">
          <button className="btn-primary" onClick={startGame}>{t(lang,'startGame')}</button>
        </div>
      </MainBlock>
    );
  }

  function RevealSequence() {
  const [revealed, setRevealed] = useState(false);

  const pid = players[currentIndex].id;
  const info: RoleInfo = (rolesAssigned as any)[pid];

  const showContent =
    <motion.div
  className={`
    reveal-card card-raise panel-border
    border border-white/8
  `}
  onPointerDown={() => setRevealed(true)}
  onPointerUp={() => setRevealed(false)}
  onPointerLeave={() => setRevealed(false)}
  initial={{ scale: 1, y: 0 }}
  animate={revealed ? { scale: 1.03, y: -6, boxShadow: "0 30px 60px rgba(2,6,23,0.24)" } : { scale: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
>
      {info?.role === 'TRAITOR' ? (
        <>
          <div className="font-bold text-red-400 text-xl">
            {t(lang,'youAreTraitor')}
          </div>
          {info.entry?.hint && (
            <div className="mt-3 opacity-90 text-lg">
              🔍 {t(lang,'hinte')}: {info.entry.hint}
            </div>
          )}
        </>
      ) : (
        <div className="text-xl">
          {t(lang,'youAreNormal', {word: info?.entry?.word ?? '—'})}
        </div>
      )}
    </motion.div>;

  return (
    <MainBlock>
      <div className="text-center">

        <div className="mb-4 text-lg">
          {t(lang,'readyPlayer', { n: currentIndex + 1 })}
        </div>

        {}
        <div
          className={`
            card w-full max-w-sm mx-auto p-6 select-none text-center
            border border-white/20 bg-white/5 backdrop-blur 
            transition-all duration-200 min-h-60
            ${revealed ? 'scale-105 shadow-2xl' : 'opacity-80'}
          `}
          onPointerDown={() => setRevealed(true)}
          onPointerUp={() => setRevealed(false)}
          onPointerLeave={() => setRevealed(false)}
        >
          <div className="text-2xl font-semibold mb-7">
            {players[currentIndex].name}
          </div>

          {!revealed ? (
            <div className="py-8 text-lg opacity-50">
              👆 {t(lang,'holdToReveal')}
            </div>
          ) : (
            showContent
          )}
        </div>

        {}
        <div className="mt-6 flex gap-3 justify-center">
          {currentIndex < players.length - 1 ? (
            <button
              onClick={() => { setRevealed(false); setCurrentIndex(i => i + 1); }}
              className="btn-soft"
            >
              Далее
            </button>
          ) : (
            <button
              onClick={() => setScreen('end')}
              className="btn-soft"
            >
              Завершить показ
            </button>
          )}
        </div>
      </div>
    </MainBlock>
  );
}



  function EndScreen(){
    return (
      <MainBlock>
        <h2 className="text-2xl font-semibold mb-4">{t(lang,'revealWord')}: {secretWord}</h2>
<div className="mb-4">
  {t(lang,'tractors')}: {
    Object.entries(rolesAssigned)
      .filter(([_, r]) => (r as RoleInfo).role === 'TRAITOR')
      .map(([id]) => players.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }
</div>
        <div className="flex mb-30 gap-2">
          <button onClick={()=> { resetToSetup(); }} className="px-4 py-2 rounded btn-soft">{t(lang,'newGame')}</button>
          <button onClick={()=> setScreen('menu')} className="px-4 py-2 rounded btn-soft">{t(lang,'back')}</button>
        </div>
      </MainBlock>
    );
  }

  // ============ Render by screen ============
  return (
    <div className={`app theme-${theme} transition-colors duration-300 ease-in-out`}>
      {screen === 'menu' && <MenuScreen />}
      {screen === 'setup' && <SetupScreen />}
      {screen === 'revealSequence' && <RevealSequence />}
      {screen === 'end' && <EndScreen />}
      {screen === 'howto' && <HowToScreen/>}

      {}
      <div className="fixed top-6 right-6 p-2 bg-white/5 rounded">
        <select value={lang} onChange={e => setLang(e.target.value as Lang)}>
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
        <select value={theme} onChange={e => setTheme(e.target.value as ThemeKey)} className="ml-2">
          <option value="liquidLight">Liquid Light</option>
          <option value="light">Light</option>
          <option value="liquidDark">Liquid Dark</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>
  );
}
