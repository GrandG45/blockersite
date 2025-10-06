// Проверка URL на соответствие заблокированным сайтам
function isBlocked(url, blockedSites) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');
    
    return blockedSites.some(site => {
      const cleanSite = site.replace(/^www\./, '').trim();
      return hostname === cleanSite || hostname.endsWith('.' + cleanSite);
    });
  } catch (e) {
    return false;
  }
}

// Слушаем навигацию по вкладкам
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Только главный фрейм
  
  const { blockedSites = [], enabled = true } = await chrome.storage.local.get(['blockedSites', 'enabled']);
  
  if (!enabled || blockedSites.length === 0) return;
  
  if (isBlocked(details.url, blockedSites)) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('blocked.html')
    });
  }
});

// Проверка уже открытых вкладок при изменении настроек
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.enabled || changes.blockedSites) {
    const { blockedSites = [], enabled = true } = await chrome.storage.local.get(['blockedSites', 'enabled']);
    
    if (!enabled) return;
    
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.url && isBlocked(tab.url, blockedSites)) {
        chrome.tabs.update(tab.id, {
          url: chrome.runtime.getURL('blocked.html')
        });
      }
    });
  }
});