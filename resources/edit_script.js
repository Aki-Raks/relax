let allData = [];
let selectedItem = null;

const themeSelect = document.getElementById('theme-select');
const editContent = document.getElementById('edit-content');
const themeInput = document.getElementById('theme-input');
const todosContainer = document.getElementById('todos-container');
const saveBtn = document.getElementById('save-btn');

// 1. При загрузке страницы читаем data.json
async function loadThemesForEdit() {
  try {
    const response = await fetch('data.json');
    if (response.ok) {
      allData = await response.json();
      initDropdown();
    } else {
      alert('Не удалось загрузить data.json');
    }
  } catch (e) {
    console.error('Ошибка:', e);
    alert('Ошибка чтения data.json');
  }
}

// Заполняем селект с дефолтным прочерком
function initDropdown() {
  themeSelect.innerHTML = '';

  // Обязательный дефолтный пункт с прочерком, чтобы случайно ничего не задеть
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '— Выберите тему —';
  defaultOption.selected = true;
  defaultOption.disabled = true;
  themeSelect.appendChild(defaultOption);

  allData.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index; // Сохраняем индекс в массиве
    option.textContent = item.theme;
    themeSelect.appendChild(option);
  });
}

// Проверка валидности формы редактирования
function validateForm() {
  const themeValue = themeInput.value.trim();
  const todoInputs = todosContainer.querySelectorAll('.todo-input');
  
  let hasValidTodo = false;
  todoInputs.forEach(input => {
    if (input.value.trim() !== '') {
      hasValidTodo = true;
    }
  });

  if (themeValue !== '' && hasValidTodo) {
    saveBtn.classList.add('active');
    saveBtn.removeAttribute('disabled');
  } else {
    saveBtn.classList.remove('active');
    saveBtn.setAttribute('disabled', 'true');
  }
}

// При выборе конкретной темы из селекта
themeSelect.addEventListener('change', () => {
  const index = themeSelect.value;
  if (index === '') return;

  selectedItem = allData[index]; // Находим объект

  // Заполняем поле темы текущим значением
  themeInput.value = selectedItem.theme;

  // Очищаем и заполняем поля to_do
  todosContainer.innerHTML = '';
  
  selectedItem.to_do.forEach(todoText => {
    addTodoRow(todoText);
  });

  // Показываем блок редактирования
  editContent.classList.add('visible');
  validateForm();
});

// Функция добавления строки с пунктом (с возможностью удаления)
function addTodoRow(text = '') {
  const row = document.createElement('div');
  row.className = 'todo-row';
  
  row.innerHTML = `
    <input type="text" class="input-box todo-input" value="${text}" placeholder="Пункт...">
    <button type="button" class="btn-add btn-remove" style="font-size: 1rem;">✕</button>
  `;
  
  todosContainer.appendChild(row);

  const newInput = row.querySelector('.todo-input');
  newInput.addEventListener('input', validateForm);

  const removeBtn = row.querySelector('.btn-remove');
  removeBtn.addEventListener('click', () => {
    // Не даем удалить последний оставшийся пункт, чтобы список не остался пустым
    if (todosContainer.querySelectorAll('.todo-row').length > 1) {
      row.remove();
      validateForm();
    } else {
      alert('В списке должен остаться хотя бы один пункт!');
    }
  });
}

// Обработка кнопки "+" для добавления пустой строки
// Создадим её программно или привяжемся, если вынесем в HTML. 
// Давай добавим кнопку плюса динамически под списком дел или вставим в разметку.
// Удобнее сделать кнопку плюса прямо под контейнером дел в JS:
let addMoreBtn = document.getElementById('add-more-btn');
if (!addMoreBtn) {
  addMoreBtn = document.createElement('button');
  addMoreBtn.type = 'button';
  addMoreBtn.className = 'btn-add';
  addMoreBtn.id = 'add-more-btn';
  addMoreBtn.textContent = '+';
  addMoreBtn.style.width = '100%';
  addMoreBtn.style.marginTop = '10px';
  todosContainer.after(addMoreBtn);
}

addMoreBtn.addEventListener('click', () => {
  addTodoRow('');
  validateForm();
});

themeInput.addEventListener('input', validateForm);

// Сохранение изменений по ID
saveBtn.addEventListener('click', () => {
  if (!saveBtn.classList.contains('active') || !selectedItem) return;

  const newThemeName = themeInput.value.trim();
  const todoInputs = todosContainer.querySelectorAll('.todo-input');
  
  const newTodos = [];
  todoInputs.forEach(input => {
    const val = input.value.trim();
    if (val !== '') {
      newTodos.push(val);
    }
  });

  // Находим нужный элемент в общем массиве allData по его id и обновляем
  const itemIndex = allData.findIndex(item => item.id === selectedItem.id);
  if (itemIndex !== -1) {
    allData[itemIndex].theme = newThemeName;
    allData[itemIndex].to_do = newTodos;
  }

  // Формируем и скачиваем обновленный файл data.json
  const jsonString = JSON.stringify(allData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'data.json';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  alert(`Список с ID ${selectedItem.id} успешно обновлен! Файл data.json скачан. Замени им старый файл в папке.`);
  window.location.href = 'index.html';
});

// Запускаем загрузку тем при старте страницы
loadThemesForEdit();