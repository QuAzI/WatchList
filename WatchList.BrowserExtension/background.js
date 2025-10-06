// URL вашего API:
const API_URL = "http://localhost:5165/api/links";

// Кэш, чтобы не спамить запросами при переключении вкладок
const cache = new Map();

// Проверка URL
async function checkUrl(url) {
  if (!url || !url.startsWith("http")) return null;

  // Проверка кэша (10 мин)
  const cached = cache.get(url);
  if (cached && (Date.now() - cached.time < 10 * 60 * 1000)) {
    return cached.result;
  }

  try {
    const res = await fetch(API_URL + '/check?url=' + encodeURIComponent(url));
    const data = await res.json();
    const exists = data.status === 'exists';

    cache.set(url, { result: exists, time: Date.now() });
    return exists;
  } catch (err) {
    console.error("Ошибка при запросе:", err);
    return null;
  }
}

// Обновление иконки
function updateIcon(tabId, exists) {
  const path = exists
    ? "icons/icon-green.png"
    : "icons/icon-gray.png";

  chrome.action.setIcon({ tabId, path });
  chrome.action.setTitle({
    tabId,
    title: exists ? "✅ Найдено в сервисе" : "❌ Не найдено"
  });
}

// Проверка текущей вкладки
async function checkActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;

  const exists = await checkUrl(tab.url);
  if (exists !== null) updateIcon(tab.id, exists);
}

// События — при загрузке или переключении вкладок
chrome.tabs.onActivated.addListener(checkActiveTab);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    checkActiveTab();
  }
});

// Слушатель сообщений от popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "add-url") {
    addUrl(message.url).then((exists) => {
      sendResponse({ exists });
      updateIcon(message.tab_id, exists);
    });

    // ВАЖНО: вернуть true, чтобы оставить канал ответа открытым
    return true;
  }
});

async function addUrl(url) {
  if (!url || !url.startsWith("http")) return null;

  try {
      const postData = {
        url
      };
      const response = await fetch(API_URL + '/add', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });
      const data = await response.json();

      if (data.status === 'saved' || data.status === 'exists') {
        cache.set(url, { result: true, time: Date.now() });
        return true;
      } else {
        console.warn(`Can't add url: `, data);
      }
    } catch (e) {
      console.error(e);
    }

    return false;
}