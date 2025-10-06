// Загрузка настроек при открытии popup
document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.local.get([
    'blockedSites',
    'enabled',
    'blockMessage',
    'pageTitle',
    'imageData',
    'audioData',
    'imageName',
    'audioName',
    'fontFamily'
  ]);

  document.getElementById('enableToggle').checked = data.enabled !== false;
  document.getElementById('blockMessage').value = data.blockMessage || 'Этот сайт заблокирован для вашей продуктивности';
  document.getElementById('pageTitle').value = data.pageTitle || 'Сайт заблокирован';
  document.getElementById('fontFamily').value = data.fontFamily || "'Segoe UI', Arial, sans-serif";
  
  // Показываем имена файлов если они есть
  if (data.imageName) {
    document.getElementById('imageName').textContent = '✓ ' + data.imageName;
  }
  if (data.audioName) {
    document.getElementById('audioName').textContent = '✓ ' + data.audioName;
  }
  
  // Показываем превью изображения
  if (data.imageData) {
    const preview = document.getElementById('imagePreview');
    preview.src = data.imageData;
    preview.classList.add('show');
  }

  renderSiteList(data.blockedSites || []);
});

// Отображение списка заблокированных сайтов
function renderSiteList(sites) {
  const list = document.getElementById('siteList');
  list.innerHTML = '';

  if (sites.length === 0) {
    list.innerHTML = '<div style="color: #999;">Нет заблокированных сайтов</div>';
    return;
  }

  sites.forEach((site, index) => {
    const div = document.createElement('div');
    div.className = 'site-item';
    div.innerHTML = `
      <span>${site}</span>
      <button class="remove" data-index="${index}">Удалить</button>
    `;
    list.appendChild(div);
  });

  // Добавляем обработчики удаления
  document.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', removeSite);
  });
}

// Добавление сайта
document.getElementById('addSite').addEventListener('click', async () => {
  const input = document.getElementById('siteInput');
  const site = input.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!site) return;

  const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');

  if (!blockedSites.includes(site)) {
    blockedSites.push(site);
    await chrome.storage.local.set({ blockedSites });
    renderSiteList(blockedSites);
  }

  input.value = '';
});

// Удаление сайта
async function removeSite(e) {
  const index = parseInt(e.target.dataset.index);
  const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
  
  blockedSites.splice(index, 1);
  await chrome.storage.local.set({ blockedSites });
  renderSiteList(blockedSites);
}

// Переключатель включения/выключения
document.getElementById('enableToggle').addEventListener('change', async (e) => {
  await chrome.storage.local.set({ enabled: e.target.checked });
});

// Обработка выбора изображения
document.getElementById('imageFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    document.getElementById('imageName').textContent = '⏳ Загрузка: ' + file.name;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const imageData = event.target.result;
      document.getElementById('imageName').textContent = '✓ ' + file.name;
      
      // Показываем превью
      const preview = document.getElementById('imagePreview');
      preview.src = imageData;
      preview.classList.add('show');
      
      // Сохраняем временно для кнопки "Сохранить"
      window.tempImageData = imageData;
      window.tempImageName = file.name;
    };
    reader.readAsDataURL(file);
  }
});

// Обработка выбора аудио
document.getElementById('audioFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    document.getElementById('audioName').textContent = '⏳ Загрузка: ' + file.name;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const audioData = event.target.result;
      document.getElementById('audioName').textContent = '✓ ' + file.name;
      
      // Сохраняем временно для кнопки "Сохранить"
      window.tempAudioData = audioData;
      window.tempAudioName = file.name;
    };
    reader.readAsDataURL(file);
  }
});

// Сохранение настроек страницы блокировки
document.getElementById('saveSettings').addEventListener('click', async () => {
  const blockMessage = document.getElementById('blockMessage').value;
  const pageTitle = document.getElementById('pageTitle').value;
  const fontFamily = document.getElementById('fontFamily').value;
  
  const dataToSave = {
    blockMessage: blockMessage,
    pageTitle: pageTitle,
    fontFamily: fontFamily
  };
  
  // Сохраняем изображение если оно было выбрано
  if (window.tempImageData) {
    dataToSave.imageData = window.tempImageData;
    dataToSave.imageName = window.tempImageName;
  }
  
  // Сохраняем аудио если оно было выбрано
  if (window.tempAudioData) {
    dataToSave.audioData = window.tempAudioData;
    dataToSave.audioName = window.tempAudioName;
  }

  try {
    await chrome.storage.local.set(dataToSave);
    
    // Проверяем что данные действительно сохранились
    const saved = await chrome.storage.local.get(['imageData', 'audioData', 'blockMessage', 'pageTitle', 'fontFamily']);
    console.log('Сохраненные данные:', {
      hasImage: !!saved.imageData,
      hasAudio: !!saved.audioData,
      message: saved.blockMessage,
      title: saved.pageTitle,
      font: saved.fontFamily
    });
    
    alert('Настройки сохранены!\n' + 
          (saved.imageData ? '✓ Изображение сохранено\n' : '') +
          (saved.audioData ? '✓ Музыка сохранена\n' : '') +
          '✓ Текст, название и шрифт сохранены');
  } catch (error) {
    alert('Ошибка сохранения: ' + error.message + '\nПопробуйте выбрать файлы меньшего размера.');
    console.error('Ошибка:', error);
  }
});

// Добавление по Enter
document.getElementById('siteInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('addSite').click();
  }
});