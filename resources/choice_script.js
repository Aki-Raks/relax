let themesData = [];

// Функция загрузки данных (читаем из data.json)
function loadData() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      themesData = data;
      initSelect();
    })
    .catch(error => {
      console.error('Ошибка загрузки JSON:', error);
      document.getElementById('result-container').textContent = 'Не удалось загрузить data.json :(';
    });
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