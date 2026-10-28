document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('pinterest-grid');
  const searchInput = document.getElementById('search-input');

  let allThemes = [];

  // Загружаем данные (замени на свою логику загрузки, если у тебя хранение в другом виде)
  async function loadThemes() {
    try {
      const response = await fetch('data.json');
      allThemes = await response.json();
      renderCards(allThemes);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      gridContainer.innerHTML = '<p style="color:white; text-align:center;">Не удалось загрузить данные.</p>';
    }
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

    // Навешиваем слушатьли на кнопки удаления
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

  // Функция удаления (пример для логики)
  function deleteTheme(index) {
    if (confirm('Точно удалить эту тему?')) {
      // 1. Удаляем элемент из общего массива
      allThemes.splice(index, 1);

      // 2. Перерисовываем сетку карточек на странице
      renderCards(allThemes);

      // 3. Создаем Blob из обновленного массива данных
      const dataStr = JSON.stringify(allThemes, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      
      // 4. Создаем временную ссылку для скачивания и «кликаем» по ней программно
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = 'data.json'; // Имя файла для сохранения
      
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      
      // 5. Убираем за собой мусор в памяти
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);

      // Уведомление (опционально)
      console.log('Тема удалена, новый data.json сгенерирован и скачан.');
    }
  }

  loadThemes();
});