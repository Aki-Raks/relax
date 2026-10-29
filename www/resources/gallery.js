document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('pinterest-grid');
  const searchInput = document.getElementById('search-input');

  let allThemes = [];

  // Ключ, под которым данные хранятся в localStorage приложения
  const STORAGE_KEY = 'my_chill_themes';

  // Загружаем данные: сначала проверяем localStorage, если пусто — берем из data.json
  async function loadThemes() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      
      if (savedData) {
        allThemes = JSON.parse(savedData);
      } else {
        const response = await fetch('data.json');
        allThemes = await response.json();
        saveThemes();
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
        <button type="button" class="btn-take" data-index="${index}">Взять</button>
        <button type="button" class="btn-delete-card" data-index="${index}">Удалить</button>
      `;

      gridContainer.appendChild(card);
    });
  }

  // Единый глобальный слушатель на контейнер (делегирование событий для кнопок)
  gridContainer.addEventListener('click', (e) => {
    
    // 1. Клик по кнопке «Взять» (копирование)
    const takeBtn = e.target.closest('.btn-take');
    if (takeBtn) {
      const index = takeBtn.getAttribute('data-index');
      const targetItem = allThemes[index];

      if (targetItem) {
        let textToCopy = `Тема: ${targetItem.theme}\n`;
        if (targetItem.to_do && targetItem.to_do.length > 0) {
          targetItem.to_do.forEach(todo => {
            textToCopy += `- ${todo}\n`;
          });
        }

        const cleanText = textToCopy.trim();

        // Надежный метод копирования через временный textarea (отлично работает в Android WebView)
        const textarea = document.createElement('textarea');
        textarea.value = cleanText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            const originalText = takeBtn.textContent;
            takeBtn.textContent = 'Взято! ✓';
            takeBtn.classList.add('copied');

            setTimeout(() => {
              takeBtn.textContent = originalText;
              takeBtn.classList.remove('copied');
            }, 1500);
          } else {
            alert('Не удалось скопировать текст');
          }
        } catch (err) {
          console.error('Ошибка копирования:', err);
          alert('Ошибка при копировании');
        }

        document.body.removeChild(textarea);
      }
      return;
    }

    // 2. Клик по кнопке «Удалить»
    const deleteBtn = e.target.closest('.btn-delete-card');
    if (deleteBtn) {
      const indexToDelete = deleteBtn.getAttribute('data-index');
      deleteTheme(indexToDelete);
    }
  });

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

      // 2. Сохраняем изменения в память устройства
      saveThemes();

      // 3. Перерисовываем сетку с учетом текущего поиска
      const searchText = searchInput.value.toLowerCase().trim();
      const filtered = allThemes.filter(item => 
        item.theme.toLowerCase().includes(searchText)
      );
      renderCards(filtered);

      console.log('Тема успешно удалена и сохранена в localStorage.');
    }
  }

  loadThemes();
});