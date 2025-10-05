// URL вашего API:
const API_URL = "http://localhost:5165/api/links/check?url=";

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
    const res = await fetch(API_URL + encodeURIComponent(url));
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
