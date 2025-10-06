// Ждём загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  // Загрузка настроек из хранилища
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['blockMessage', 'pageTitle', 'imageData', 'audioData', 'fontFamily'], function(data) {
      console.log('Загруженные данные:', {
        hasMessage: !!data.blockMessage,
        hasTitle: !!data.pageTitle,
        hasImage: !!data.imageData,
        hasAudio: !!data.audioData,
        fontFamily: data.fontFamily,
        imageSize: data.imageData ? data.imageData.length : 0,
        audioSize: data.audioData ? data.audioData.length : 0
      });
      
      // Устанавливаем название вкладки
      if (data.pageTitle) {
        document.title = data.pageTitle;
      }
      
      const messageEl = document.getElementById('message');
      
      // Устанавливаем текст сообщения
      if (data.blockMessage) {
        messageEl.textContent = data.blockMessage;
      }
      
      // Устанавливаем шрифт
      if (data.fontFamily) {
        messageEl.style.fontFamily = data.fontFamily;
      }

      // Устанавливаем изображение из Base64
      if (data.imageData) {
        const img = document.getElementById('backgroundImage');
        img.onload = function() {
          console.log('Изображение загружено успешно');
        };
        img.onerror = function() {
          console.error('Ошибка загрузки изображения');
        };
        img.src = data.imageData;
        img.style.display = 'block';
        const placeholder = document.querySelector('.no-image-placeholder');
        if (placeholder) {
          placeholder.style.display = 'none';
        }
      } else {
        console.warn('Изображение не найдено в хранилище');
      }

      // Устанавливаем аудио из Base64 (скрыто)
      if (data.audioData) {
        const audio = document.getElementById('customAudio');
        audio.onloadeddata = function() {
          console.log('Аудио загружено успешно');
        };
        audio.onerror = function() {
          console.error('Ошибка загрузки аудио');
        };
        audio.src = data.audioData;
        // Автоматически запускаем аудио
        audio.play().catch(function(error) {
          console.log('Автозапуск аудио заблокирован браузером:', error);
        });
      } else {
        console.warn('Аудио не найдено в хранилище');
      }
    });
  } else {
    console.error('Chrome storage API недоступен');
  }
});