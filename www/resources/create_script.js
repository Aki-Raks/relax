const themeInput = document.getElementById('theme-input');
const todosContainer = document.getElementById('todos-container');
const addTodoBtn = document.getElementById('add-todo-btn');
const saveBtn = document.getElementById('save-btn');

// Ключ для хранения данных в памяти приложения / браузера
const STORAGE_KEY = 'my_chill_themes';

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

addTodoBtn.addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'todo-row';
  
  row.innerHTML = `
    <input type="text" class="input-box todo-input" placeholder="Еще один пункт...">
    <button type="button" class="btn-add btn-remove" style="font-size: 1rem;">✕</button>
  `;
  
  todosContainer.appendChild(row);

  const newInput = row.querySelector('.todo-input');
  newInput.addEventListener('input', validateForm);

  const removeBtn = row.querySelector('.btn-remove');
  removeBtn.addEventListener('click', () => {
    row.remove();
    validateForm();
  });
  
  validateForm();
});

themeInput.addEventListener('input', validateForm);

const initialTodoInput = todosContainer.querySelector('.todo-input');
if (initialTodoInput) {
  initialTodoInput.addEventListener('input', validateForm);
}

// Сохранение с накоплением и порядковым ID в localStorage
saveBtn.addEventListener('click', async () => {
  if (!saveBtn.classList.contains('active')) return;

  const theme = themeInput.value.trim();
  const todoInputs = todosContainer.querySelectorAll('.todo-input');
  
  const todos = [];
  todoInputs.forEach(input => {
    const val = input.value.trim();
    if (val !== '') {
      todos.push(val);
    }
  });

  try {
    // 1. Читаем текущие данные из localStorage или из data.json при первом запуске
    let existingData = [];
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      existingData = JSON.parse(savedData);
    } else {
      try {
        const response = await fetch('data.json');
        if (response.ok) {
          existingData = await response.json();
        }
      } catch (e) {
        console.log('Файл data.json не найден, создаем с нуля.');
      }
    }

    // 2. Вычисляем порядковый ID (следующий номер)
    let nextId = 1;
    if (existingData.length > 0) {
      // Берем ID последнего элемента и прибавляем 1
      const lastItem = existingData[existingData.length - 1];
      const lastIdNum = parseInt(lastItem.id, 10);
      nextId = !isNaN(lastIdNum) ? lastIdNum + 1 : existingData.length + 1;
    }

    const newList = {
      id: nextId.toString(),
      theme: theme,
      to_do: todos
    };

    // 3. Добавляем новый список к уже имеющимся данным
    existingData.push(newList);

    // 4. Сохраняем обновленный массив в память устройства
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));

    alert(`Список «${theme}» успешно создан и сохранен (ID: ${nextId})!`);
    
    // Возвращаемся на главную
    window.location.href = 'index.html';

  } catch (error) {
    console.error('Ошибка при сохранении:', error);
    alert('Не удалось сохранить данные. Проверь консоль (F12).');
  }
});