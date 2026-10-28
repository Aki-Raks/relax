let themesData = [];

// Ключ для хранения данных в памяти приложения / браузера
const STORAGE_KEY = 'my_chill_themes';

// Функция загрузки данных (читаем из localStorage, при первом запуске — из data.json)
async function loadData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
      themesData = JSON.parse(savedData);
      initSelect();
    } else {
      const response = await fetch('data.json');
      if (response.ok) {
        themesData = await response.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(themesData));
        initSelect();
      } else {
        throw new Error('Не удалось загрузить data.json');
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    document.getElementById('result-container').textContent = 'Не удалось загрузить данные :(';
  }
}

// Функция заполнения селекта темами
function initSelect() {
  const select = document.getElementById('theme-select');
  select.innerHTML = '';

  if (themesData.length === 0) {
    const option = document.createElement('option');
    option.textContent = 'Нет доступных тем';
    select.appendChild(option);
    return;
  }

  themesData.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.theme;
    select.appendChild(option);
  });

  select.selectedIndex = 0;
}

// 1. Обработка обычной кнопки «Доверься случайности» (в рамках выбранной темы)
document.getElementById('random-btn').addEventListener('click', () => {
  if (themesData.length === 0) return;

  const select = document.getElementById('theme-select');
  const selectedIndex = select.value;
  const selectedThemeObj = themesData[selectedIndex];

  if (selectedThemeObj && selectedThemeObj.to_do && selectedThemeObj.to_do.length > 0) {
    const toDoList = selectedThemeObj.to_do;
    const randomIndex = Math.floor(Math.random() * toDoList.length);
    document.getElementById('result-container').textContent = toDoList[randomIndex];
  } else {
    document.getElementById('result-container').textContent = 'В этой теме пока пусто!';
  }
});

// 2. НОВАЯ КНОПКА: «Вообще не понимаю что делать» (случайный выбор по ВСЕМ темам)
document.getElementById('mega-random-btn').addEventListener('click', () => {
  if (themesData.length === 0) return;

  // Собираем вообще все to_do из всех объектов в один общий массив
  let allToDos = [];
  themesData.forEach(themeObj => {
    if (themeObj.to_do && Array.isArray(themeObj.to_do)) {
      allToDos = allToDos.concat(themeObj.to_do);
    }
  });

  if (allToDos.length > 0) {
    const randomIndex = Math.floor(Math.random() * allToDos.length);
    document.getElementById('result-container').textContent = allToDos[randomIndex];
  } else {
    document.getElementById('result-container').textContent = 'Во всех темах вообще пусто!';
  }
});

// Запускаем загрузку данных при открытии страницы
loadData();