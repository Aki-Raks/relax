document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('pinterest-grid');
  const searchInput = document.getElementById('search-input');

  let allThemes = [];

  // Ключ, под которым данные будут храниться в памяти браузера / приложения
  const STORAGE_KEY = 'my_chill_themes';

  // Загружаем данные: сначала проверяем localStorage, если там пусто — берем data.json и сохраняем
  async function loadThemes() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      
      if (savedData) {
        allThemes = JSON.parse(savedData);
      } else {
        const response = await fetch('data.json');
        allThemes = await response.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allThemes));
      }
      
      renderCards(allThemes);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      gridContainer.innerHTML = '<p style="color:white; text-align:center;">Не удалось загрузить данные.</p>';
    }
  }

  // Вспомогательная функция для сохранения текущего массива в localStorage
  function saveThemes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allThemes));
  }

  // Отрисовка карточек
  function renderCards(themesToRender) {
    gridContainer.innerHTML = '';

    if (themesToRender.length === 0) {
      gridContainer.innerHTML = '<p style="color:white; text-align:center; grid-column: 1/-1;">Ничего не найдено</p>';
      return;
    }

    themesToRender.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';

      // Формируем список пунктов
      const itemsListHTML = item.to_do && item.to_do.length > 0
        ? `<ul>${item.to_do.map(todo => `<li>${todo}</li>`).join('')}</ul>`
        : `<p style="opacity: 0.7; font-size: 0.9rem;">Пусто</p>`;

      card.innerHTML = `
        <h3>${item.theme}</h3>
        ${itemsListHTML}
        <button class="btn-delete-card" data-index="${index}">Удалить</button>
      `;

      gridContainer.appendChild(card);
    });

    // Навешиваем слушатели на кнопки удаления
    document.querySelectorAll('.btn-delete-card').forEach(button => {
      button.addEventListener('click', (e) => {
        const indexToDelete = e.target.getAttribute('data-index');
        deleteTheme(indexToDelete);
      });
    });
  }

  // Живой поиск по названию темы
  searchInput.addEventListener('input', (e) => {
    const searchText = e.target.value.toLowerCase().trim();
    const filtered = allThemes.filter(item => 
      item.theme.toLowerCase().includes(searchText)
    );
    renderCards(filtered);
  });

  // Функция удаления с сохранением в localStorage
  function deleteTheme(index) {
    if (confirm('Точно удалить эту тему?')) {
      // 1. Удаляем элемент из общего массива
      allThemes.splice(index, 1);

      // 2. Сохраняем изменения прямо в память устройства (без скачивания файлов)
      saveThemes();

      // 3. Перерисовываем сетку карточек на странице
      renderCards(allThemes);

      console.log('Тема успешно удалена и сохранена в localStorage.');
    }
  }

  loadThemes();
});