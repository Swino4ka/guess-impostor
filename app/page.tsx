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
    { id: 'food-2', word: 'Хлеб', hint: 'Пшено' },
    { id: 'food-3', word: 'Дуршлаг', hint: 'Кухня' },
    { id: 'food-4', word: 'Суп', hint: 'Кастрюля' },
    { id: 'food-5', word: 'Пицца', hint: 'Италия' },
    { id: 'food-6', word: 'Буррито', hint: 'Мексика' },
    { id: 'food-7', word: 'Суши', hint: 'Рис' },
    { id: 'food-8', word: 'Кебаб', hint: 'Мангал' },
    { id: 'food-9', word: 'Вафля', hint: 'Хруст' },
    { id: 'food-10', word: 'Омлет', hint: 'Завтрак' },
    { id: 'food-11', word: 'Мороженое', hint: 'Лето' },
    { id: 'food-12', word: 'Банан', hint: 'Жёлтый' },
    { id: 'food-13', word: 'Каша', hint: 'Гречка' },
    { id: 'food-14', word: 'Шоколад', hint: 'Сладость' },
    { id: 'food-15', word: 'Салат', hint: 'Овощи' },
    { id: 'food-16', word: 'Пельмени', hint: 'Варёные' },
    { id: 'food-17', word: 'Лазанья', hint: 'Италия' },
    { id: 'food-18', word: 'Хот-дог', hint: 'Булочка' },
    { id: 'food-19', word: 'Чипсы', hint: 'Хруст' },
    { id: 'food-20', word: 'Кофе', hint: 'Напиток' }
  ],

  'Бытовая техника': [
    { id: 'ap-1', word: 'Холодильник', hint: 'Лед' },
    { id: 'ap-2', word: 'Стиралка', hint: 'Порошок' },
    { id: 'ap-3', word: 'Микроволновка', hint: 'Разогрев' },
    { id: 'ap-4', word: 'Пылесос', hint: 'Пыль' },
    { id: 'ap-5', word: 'Тостер', hint: 'Поджарка' },
    { id: 'ap-6', word: 'Утюг', hint: 'Гладить' },
    { id: 'ap-7', word: 'Фен', hint: 'Волосы' },
    { id: 'ap-8', word: 'Электрочайник', hint: 'Кипяток' },
    { id: 'ap-9', word: 'Кофемашина', hint: 'Кофе' },
    { id: 'ap-10', word: 'Морозилка', hint: 'Лёд' },
    { id: 'ap-11', word: 'Блендер', hint: 'Смузи' },
    { id: 'ap-12', word: 'Миксер', hint: 'Взбивать' },
    { id: 'ap-13', word: 'Соковыжималка', hint: 'Фрукты' },
    { id: 'ap-14', word: 'Посудомойка', hint: 'Тарелки' },
    { id: 'ap-15', word: 'Водонагреватель', hint: 'Кипяток' }
  ],
  
    'Фильмы': [
      { id: 'movie-1', word: 'Титаник', hint: 'Корабль' },
      { id: 'movie-2', word: 'Матрица', hint: 'Зелёный' },
      { id: 'movie-3', word: 'Интерстеллар', hint: 'Космос' },
      { id: 'movie-4', word: 'Шрек', hint: 'Болото' },
      { id: 'movie-5', word: 'Такси', hint: 'Марсель' },
      { id: 'movie-6', word: 'Декстер', hint: 'Лодка' },
      { id: 'movie-7', word: 'Во все тяжкие', hint: 'Семья' },
      { id: 'movie-8', word: 'Миротворец', hint: 'США' },
      { id: 'movie-9', word: 'Мстители', hint: 'Герои' },
      { id: 'movie-10', word: 'Пираты Карибского моря', hint: 'Корабль' },
      { id: 'movie-11', word: 'Форрест Гамп', hint: 'Бег' },
      { id: 'movie-12', word: 'Аватар', hint: 'Планета' },
      { id: 'movie-13', word: 'Начало', hint: 'Сны' },
      { id: 'movie-14', word: 'Дэдпул', hint: 'Комедия' },
      { id: 'movie-15', word: 'Терминатор', hint: 'Робот' },
      { id: 'movie-16', word: 'Бэтмэн', hint: 'Ночь' },
      { id: 'movie-17', word: 'Джокер', hint: 'Улыбка' },
    ],
  
    'Игры': [
      { id: 'game-1', word: 'Майнкрафт', hint: 'Кубы' },
      { id: 'game-2', word: 'Скайрим', hint: 'Дракон' },
      { id: 'game-3', word: 'Дота', hint: 'Антимаг' },
      { id: 'game-4', word: 'КС', hint: 'Бомба' },
      { id: 'game-5', word: 'ГТА', hint: 'Ограбление' },
      { id: 'game-6', word: 'Фортнайт', hint: 'Строить' },
      { id: 'game-7', word: 'Лига Легенд', hint: 'Мобы' },
      { id: 'game-8', word: 'Варкрафт', hint: 'Орки' },
      { id: 'game-9', word: 'Among Us', hint: 'Предатель' },
      { id: 'game-10', word: 'Тетрис', hint: 'Блоки' },
      { id: 'game-11', word: 'Симс', hint: 'Жизнь' },
      { id: 'game-12', word: 'Fall Guys', hint: 'Болото' },
      { id: 'game-13', word: 'PUBG', hint: 'Выживание' },
      { id: 'game-14', word: 'РПГ', hint: 'Квест' },
      { id: 'game-15', word: 'Контра Сити', hint: 'Битва' }
    ],
  
    'Политика': [
      { id: 'pol-1', word: 'Президент', hint: 'Выборы' },
      { id: 'pol-2', word: 'Парламент', hint: 'Законы' },
      { id: 'pol-3', word: 'Санкции', hint: 'Ограничения' },
      { id: 'pol-4', word: 'Бюрократия', hint: 'Очередь' },
      { id: 'pol-5', word: 'Дипломатия', hint: 'Переговоры' },
      { id: 'pol-6', word: 'Референдум', hint: 'Голосование' },
      { id: 'pol-7', word: 'Министр', hint: 'Кабинет' },
      { id: 'pol-8', word: 'Выборы', hint: 'Участок' },
      { id: 'pol-9', word: 'Конституция', hint: 'Документ' },
      { id: 'pol-10', word: 'Революция', hint: 'Протест' },
      { id: 'pol-11', word: 'Кампания', hint: 'Агитация' },
      { id: 'pol-12', word: 'Партия', hint: 'Фракция' },
      { id: 'pol-13', word: 'Импичмент', hint: 'Снятие' },
      { id: 'pol-14', word: 'Голосование', hint: 'Бюллетень' },
      { id: 'pol-15', word: 'Фракция', hint: 'Группа' }
    ],
  
    'Животные': [
      { id: 'ani-1', word: 'Кот', hint: 'Пушистый' },
      { id: 'ani-2', word: 'Собака', hint: 'Пушистый' },
      { id: 'ani-3', word: 'Акула', hint: 'Батискаф' },
      { id: 'ani-4', word: 'Панда', hint: 'Джунгли' },
      { id: 'ani-5', word: 'Орёл', hint: 'Крылья' },
      { id: 'ani-6', word: 'Лев', hint: 'Царь' },
      { id: 'ani-7', word: 'Тигр', hint: 'Полоски' },
      { id: 'ani-8', word: 'Слон', hint: 'Хобот' },
      { id: 'ani-9', word: 'Жираф', hint: 'Шея' },
      { id: 'ani-10', word: 'Обезьяна', hint: 'Ловкий' },
      { id: 'ani-11', word: 'Кролик', hint: 'Уши' },
      { id: 'ani-12', word: 'Лиса', hint: 'Хитрый' },
      { id: 'ani-13', word: 'Волк', hint: 'Стая' },
      { id: 'ani-14', word: 'Медведь', hint: 'Лес' },
      { id: 'ani-15', word: 'Пингвин', hint: 'Антарктида' }
    ],
  
    'Музыка': [
      { id: 'music-1', word: 'Рок', hint: 'Гитара' },
      { id: 'music-2', word: 'Рэп', hint: 'Бит' },
      { id: 'music-3', word: 'Опера', hint: 'Ария' },
      { id: 'music-4', word: 'Джаз', hint: 'Импровизация' },
      { id: 'music-5', word: 'Техно', hint: 'Рейв' },
      { id: 'music-6', word: 'Поп', hint: 'Хит' },
      { id: 'music-7', word: 'Металл', hint: 'Громко' },
      { id: 'music-8', word: 'Классика', hint: 'Оркестр' },
      { id: 'music-9', word: 'Регги', hint: 'Ямайка' },
      { id: 'music-10', word: 'Блюз', hint: 'Скучно' },
      { id: 'music-11', word: 'Фолк', hint: 'Народный' },
      { id: 'music-12', word: 'Ска', hint: 'Танцы' },
      { id: 'music-13', word: 'EDM', hint: 'Фестиваль' },
      { id: 'music-14', word: 'Хип-хоп', hint: 'Улица' },
      { id: 'music-15', word: 'Инди', hint: 'Независимый' }
    ],
  
    'Страны': [
      { id: 'country-1', word: 'Япония', hint: 'Самураи' },
      { id: 'country-2', word: 'США', hint: 'Орёл' },
      { id: 'country-3', word: 'Польша', hint: 'Пироги' },
      { id: 'country-4', word: 'Канада', hint: 'Клен' },
      { id: 'country-5', word: 'Египет', hint: 'Пирамиды' },
      { id: 'country-6', word: 'Украина', hint: 'Пирамиды' }
    ],
  
    'Мемы': [
      { id: 'meme-1', word: '67', hint: 'Числа' },
      { id: 'meme-2', word: 'Birdgame3', hint: 'Птички' },
      { id: 'meme-3', word: 'Троллфейс', hint: 'Заезженное' },
      { id: 'meme-4', word: 'Рикролл', hint: 'Песня' },
      { id: 'meme-5', word: 'Кринж', hint: 'Фейспалм' }
    ],
  
    'Рандомная хрень': [
      { id: 'rnd-1', word: 'Ядерное вооружение', hint: 'Взрыв' },
      { id: 'rnd-2', word: 'Госдолг США', hint: 'Деньги' },
      { id: 'rnd-3', word: 'Тарифы ЖКХ', hint: 'Квитанция' },
      { id: 'rnd-4', word: 'Скумбрия', hint: 'Рыба' },
      { id: 'rnd-5', word: 'Робот-пылесос', hint: 'Кругляш' },
      { id: 'rnd-6', word: 'Часы', hint: 'Время' },
      { id: 'rnd-7', word: 'Зонт', hint: 'Дождь' },
      { id: 'rnd-8', word: 'Печенье', hint: 'Сладкое' },
      { id: 'rnd-9', word: 'Календарь', hint: 'Дни' },
      { id: 'rnd-10', word: 'Лампа', hint: 'Свет' },
      { id: 'rnd-11', word: 'Карта', hint: 'Путешествие' },
      { id: 'rnd-12', word: 'Рюкзак', hint: 'Сумка' },
      { id: 'rnd-13', word: 'Пульт', hint: 'ТВ' },
      { id: 'rnd-14', word: 'Платформа', hint: 'Железная дорога' },
      { id: 'rnd-15', word: 'Очки', hint: 'Зрение' },
      { id: 'rnd-16', word: 'Атом', hint: 'Маленький' },
      { id: 'rnd-17', word: 'Гравитация', hint: 'Тянет' },
      { id: 'rnd-18', word: 'Прохожий', hint: 'Куртка' },
      { id: 'rnd-19', word: 'Пчела', hint: 'Жужжание' },
      { id: 'rnd-20', word: 'Черная дыра', hint: 'Всасывает' },
      { id: 'rnd-21', word: 'Лунатик', hint: 'Луна' },
      { id: 'rnd-22', word: 'Пинг-понг мяч', hint: 'Бац' },
      { id: 'rnd-23', word: 'Электрон', hint: 'Заряд' },
      { id: 'rnd-24', word: 'Тролль под мостом', hint: 'Мост' },
      { id: 'rnd-25', word: 'Звезда', hint: 'Светит' },
      { id: 'rnd-26', word: 'Глобус', hint: 'Мир' },
      { id: 'rnd-27', word: 'Взрывчатка', hint: 'Бах' },
      { id: 'rnd-28', word: 'Шаровая молния', hint: 'Электричество' },
      { id: 'rnd-29', word: 'Сосед сверху', hint: 'Топот' },
      { id: 'rnd-30', word: 'Секретный агент', hint: 'Очки' },
      { id: 'rnd-31', word: 'Телепорт', hint: 'Перемещение' },
      { id: 'rnd-32', word: 'Пылевой червь', hint: 'Почва' },
      { id: 'rnd-33', word: 'Космический корабль', hint: 'Полёт' },
      { id: 'rnd-34', word: 'Параллельная вселенная', hint: 'Другой мир' },
      { id: 'rnd-35', word: 'Говорящий кактус', hint: 'Колючий' },
      { id: 'rnd-36', word: 'Летающий тост', hint: 'Хруст' },
      { id: 'rnd-37', word: 'Магнитная буря', hint: 'Компас' },
      { id: 'rnd-38', word: 'Спам', hint: 'Интернет' },
      { id: 'rnd-39', word: 'ИИ', hint: 'Разговор' },
      { id: 'rnd-40', word: 'Вооружение США', hint: 'Стратегия' },
      { id: 'rnd-41', word: 'Кофейная капля', hint: 'Утро' },
      { id: 'rnd-42', word: 'Огромный кактус', hint: 'Пустыня' },
      { id: 'rnd-43', word: 'Глаза', hint: 'Смотрят' },
      { id: 'rnd-44', word: 'Ниндзя', hint: 'Тень' },
      { id: 'rnd-45', word: 'Солнечный зайчик', hint: 'Пол' },
      { id: 'rnd-46', word: 'Чайок', hint: 'Пар' },
      { id: 'rnd-47', word: 'Монета', hint: 'Блеск' },
      { id: 'rnd-48', word: 'Спутник', hint: 'Космос' },
      { id: 'rnd-49', word: 'Краска', hint: 'Цвет' },
      { id: 'rnd-50', word: 'Невидимый слон', hint: 'Толстый' },
      { id: 'rnd-51', word: 'Молния', hint: 'Гроза' },
      { id: 'rnd-52', word: 'Вулкан', hint: 'Лава' },
      { id: 'rnd-53', word: 'Океан', hint: 'Вода' },
      { id: 'rnd-54', word: 'Медуза', hint: 'Жгучая' },
      { id: 'rnd-55', word: 'Корабль', hint: 'Плавание' },
      { id: 'rnd-56', word: 'Айсберг', hint: 'Холод' },
      { id: 'rnd-57', word: 'Экватор', hint: 'Равнина' },
      { id: 'rnd-58', word: 'Каньон', hint: 'Утёс' },
      { id: 'rnd-59', word: 'Гейзер', hint: 'Пар' },
      { id: 'rnd-60', word: 'Тайфун', hint: 'Ветер' },
      { id: 'rnd-61', word: 'Полюс', hint: 'Лед' },
      { id: 'rnd-62', word: 'Пустыня', hint: 'Песок' },
      { id: 'rnd-63', word: 'Оазис', hint: 'Вода' },
      { id: 'rnd-64', word: 'Лагуна', hint: 'Бухта' },
      { id: 'rnd-65', word: 'Риф', hint: 'Кораллы' },
      { id: 'rnd-66', word: 'Тундра', hint: 'Холод' },
      { id: 'rnd-67', word: 'Саванна', hint: 'Трава' },
      { id: 'rnd-68', word: 'Дельта', hint: 'Река' },
      { id: 'rnd-69', word: 'Озеро', hint: 'Берег' },
      { id: 'rnd-70', word: 'Река', hint: 'Течение' },
      { id: 'rnd-71', word: 'Водопад', hint: 'Падение' },
      { id: 'rnd-72', word: 'Болото', hint: 'Тростник' },
      { id: 'rnd-73', word: 'Лес', hint: 'Деревья' },
      { id: 'rnd-74', word: 'Байкал', hint: 'Глубина' },
      { id: 'rnd-75', word: 'Эверест', hint: 'Вершина' },
      { id: 'rnd-76', word: 'Климат', hint: 'Погода' },
      { id: 'rnd-77', word: 'Сезон', hint: 'Время' },
      { id: 'rnd-78', word: 'Луна', hint: 'Ночь' },
      { id: 'rnd-79', word: 'Солнце', hint: 'Тепло' },
      { id: 'rnd-80', word: 'Земля', hint: 'Планета' },
      { id: 'rnd-81', word: 'Млечный путь', hint: 'Галактика' },
      { id: 'rnd-82', word: 'Комета', hint: 'Хвост' },
      { id: 'rnd-83', word: 'Метеорит', hint: 'Камень' },
      { id: 'rnd-84', word: 'Атмосфера', hint: 'Воздух' },
      { id: 'rnd-85', word: 'Гидросфера', hint: 'Вода' },
      { id: 'rnd-86', word: 'Литосфера', hint: 'Земля' },
      { id: 'rnd-87', word: 'Сейсмичность', hint: 'Дрожь' },
      { id: 'rnd-88', word: 'Цунами', hint: 'Волна' },
      { id: 'rnd-89', word: 'Землетрясение', hint: 'Толчок' },
      { id: 'rnd-90', word: 'Пыльная буря', hint: 'Пыль' },
      { id: 'rnd-91', word: 'Радуга', hint: 'Цвета' },
      { id: 'rnd-92', word: 'Туман', hint: 'Мгла' },
      { id: 'rnd-93', word: 'Гроза', hint: 'Удары' },
      { id: 'rnd-94', word: 'Град', hint: 'Шарики' },
      { id: 'rnd-95', word: 'Молекула', hint: 'Состав' },
      { id: 'rnd-96', word: 'Атом', hint: 'Частица' },
      { id: 'rnd-97', word: 'Кислород', hint: 'Дыхание' },
      { id: 'rnd-98', word: 'Водород', hint: 'Газ' },
      { id: 'rnd-99', word: 'Углерод', hint: 'Алмаз' },
      { id: 'rnd-100', word: 'Плазма', hint: 'Ионизация' },
      { id: 'rnd-101', word: 'Электричество', hint: 'Ток' },
      { id: 'rnd-102', word: 'Магнетизм', hint: 'Полюс' },
      { id: 'rnd-103', word: 'Радиоактивность', hint: 'Излучение' },
      { id: 'rnd-104', word: 'Эволюция', hint: 'Изменение' },
      { id: 'rnd-105', word: 'Фотосинтез', hint: 'Растение' },
      { id: 'rnd-106', word: 'Клетка', hint: 'Организм' },
      { id: 'rnd-107', word: 'ДНК', hint: 'Ген' },
      { id: 'rnd-108', word: 'Иммунитет', hint: 'Защита' },
      { id: 'rnd-109', word: 'Вакцина', hint: 'Прививка' },
      { id: 'rnd-110', word: 'Инфекция', hint: 'Болезнь' },
      { id: 'rnd-111', word: 'Бактерия', hint: 'Микроб' },
      { id: 'rnd-112', word: 'Вирус', hint: 'Зараза' },
      { id: 'rnd-113', word: 'Промышленность', hint: 'Фабрика' },
      { id: 'rnd-114', word: 'Энергетика', hint: 'Завод' },
      { id: 'rnd-115', word: 'Технология', hint: 'Изобретение' },
      { id: 'rnd-116', word: 'Интернет', hint: 'Сеть' },
      { id: 'rnd-117', word: 'Робот', hint: 'Механизм' },
      { id: 'rnd-118', word: 'Космос', hint: 'Бесконечность' },
      { id: 'rnd-119', word: 'Спутник', hint: 'Орбита' },
      { id: 'rnd-120', word: 'Телескоп', hint: 'Зрение' },
      { id: 'rnd-121', word: 'Радар', hint: 'Обнаружение' },
      { id: 'rnd-122', word: 'Навигация', hint: 'Путь' },
      { id: 'rnd-123', word: 'Пилот', hint: 'Самолёт' },
      { id: 'rnd-124', word: 'Аэропорт', hint: 'Вылет' },
      { id: 'rnd-125', word: 'Поезд', hint: 'Рельсы' },
      { id: 'rnd-126', word: 'Мотоцикл', hint: 'Колёса' },
      { id: 'rnd-127', word: 'Автомобиль', hint: 'Дорога' },
      { id: 'rnd-128', word: 'Троллейбус', hint: 'Электро' },
      { id: 'rnd-129', word: 'Метро', hint: 'Подземка' },
      { id: 'rnd-130', word: 'Мост', hint: 'Переправа' },
      { id: 'rnd-131', word: 'Тоннель', hint: 'Проход' },
      { id: 'rnd-132', word: 'Шоссе', hint: 'Трафик' },
      { id: 'rnd-133', word: 'Яхта', hint: 'Парус' },
      { id: 'rnd-134', word: 'Порт', hint: 'Груз' },
      { id: 'rnd-135', word: 'Маяк', hint: 'Свет' },
      { id: 'rnd-136', word: 'Фабрика', hint: 'Производство' },
      { id: 'rnd-137', word: 'Склад', hint: 'Товар' },
      { id: 'rnd-138', word: 'Рынок', hint: 'Покупка' },
      { id: 'rnd-139', word: 'Банк', hint: 'Деньги' },
      { id: 'rnd-140', word: 'Акция', hint: 'Биржа' },
      { id: 'rnd-141', word: 'Инвестиция', hint: 'Капитал' },
      { id: 'rnd-142', word: 'Кредит', hint: 'Займ' },
      { id: 'rnd-143', word: 'Налоги', hint: 'Платёж' },
      { id: 'rnd-144', word: 'Зарплата', hint: 'Оплата' },
      { id: 'rnd-145', word: 'Образование', hint: 'Школа' },
      { id: 'rnd-146', word: 'Университет', hint: 'Студент' },
      { id: 'rnd-147', word: 'Кафедра', hint: 'Преподаватель' },
      { id: 'rnd-148', word: 'Экзамен', hint: 'Тест' },
      { id: 'rnd-149', word: 'Диплом', hint: 'Сертификат' },
      { id: 'rnd-150', word: 'Библиотека', hint: 'Книги' },

    ]
  };

  const WORDS_EN: Record<string, WordEntry[]> = {
    'Food': [
      { id: 'food-1', word: 'Apple', hint: 'Fruit' },
      { id: 'food-2', word: 'Bread', hint: 'Loaf' },
      { id: 'food-3', word: 'Colander', hint: 'Rain' },
      { id: 'food-4', word: 'Soup', hint: 'Spoon' },
      { id: 'food-5', word: 'Pizza', hint: 'Italy' },
      { id: 'food-6', word: 'Burrito', hint: 'Mexico' },
      { id: 'food-7', word: 'Sushi', hint: 'Rice' },
      { id: 'food-8', word: 'Kebab', hint: 'Grill' },
      { id: 'food-9', word: 'Waffle', hint: 'Crunch' },
      { id: 'food-10', word: 'Omelette', hint: 'Breakfast' }
    ],

    'Appliances': [
      { id: 'ap-1', word: 'Fridge', hint: 'Cold' },
      { id: 'ap-2', word: 'Washer', hint: 'Detergent' },
      { id: 'ap-3', word: 'Microwave', hint: 'Heat' },
      { id: 'ap-4', word: 'Vacuum', hint: 'Noise' },
      { id: 'ap-5', word: 'Toaster', hint: 'Toast' }
    ],

    'Movies': [
      { id: 'movie-1', word: 'Titanic', hint: 'Ship' },
      { id: 'movie-2', word: 'Matrix', hint: 'Green' },
      { id: 'movie-3', word: 'Interstellar', hint: 'Space' },
      { id: 'movie-4', word: 'Shrek', hint: 'Swamp' },
      { id: 'movie-5', word: 'Taxi', hint: 'Marseille' },
      { id: 'movie-4', word: 'Dexter', hint: 'Boat' },
    ],

    'Games': [
      { id: 'game-1', word: 'Minecraft', hint: 'Blocks' },
      { id: 'game-2', word: 'Skyrim', hint: 'Dragon' },
      { id: 'game-3', word: 'Dota', hint: 'Anti-Mage' },
      { id: 'game-4', word: 'CS', hint: 'Bomb' },
      { id: 'game-5', word: 'GTA', hint: 'Heist' }
    ],

    'Politics': [
      { id: 'pol-1', word: 'President', hint: 'Elections' },
      { id: 'pol-2', word: 'Parliament', hint: 'Laws' },
      { id: 'pol-3', word: 'Sanctions', hint: 'Restrictions' },
      { id: 'pol-4', word: 'Bureaucracy', hint: 'Queue' },
      { id: 'pol-5', word: 'Diplomacy', hint: 'Negotiations' }
    ],

    'Animals': [
      { id: 'ani-1', word: 'Cat', hint: 'Purr' },
      { id: 'ani-2', word: 'Dog', hint: 'Bark' },
      { id: 'ani-3', word: 'Shark', hint: 'Fin' },
      { id: 'ani-4', word: 'Panda', hint: 'Bamboo' },
      { id: 'ani-5', word: 'Eagle', hint: 'Wings' }
    ],

    'Music': [
      { id: 'music-1', word: 'Rock', hint: 'Guitar' },
      { id: 'music-2', word: 'Rap', hint: 'Beat' },
      { id: 'music-3', word: 'Opera', hint: 'Aria' },
      { id: 'music-4', word: 'Jazz', hint: 'Improv' },
      { id: 'music-5', word: 'Techno', hint: 'Rave' }
    ],

    'Countries': [
      { id: 'country-1', word: 'Japan', hint: 'Samurai' },
      { id: 'country-2', word: 'USA', hint: 'Eagle' },
      { id: 'country-3', word: 'Poland', hint: 'Pierogi' },
      { id: 'country-4', word: 'Canada', hint: 'Maple' },
      { id: 'country-5', word: 'Egypt', hint: 'Pyramids' }
    ],

    'Memes': [
      { id: 'meme-1', word: 'Doge', hint: 'Wow' },
      { id: 'meme-2', word: 'Shrek-meme', hint: 'Onions' },
      { id: 'meme-3', word: 'Trollface', hint: 'Grin' },
      { id: 'meme-4', word: 'Rickroll', hint: 'Song' },
      { id: 'meme-5', word: 'Cringe', hint: 'Facepalm' }
    ],

    'Random Stuff': [
      { id: 'rnd-1', word: 'Nuclear arsenal', hint: 'Boom' },
      { id: 'rnd-2', word: 'US national debt', hint: 'Trillions' },
      { id: 'rnd-3', word: 'Utility tariffs', hint: 'Bills' },
      { id: 'rnd-4', word: 'Mackerel', hint: 'Fish' },
      { id: 'rnd-5', word: 'Robot vacuum', hint: 'Round' }
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
