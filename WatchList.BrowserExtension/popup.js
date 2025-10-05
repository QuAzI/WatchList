document.getElementById("check").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  document.getElementById("status").textContent = "Проверяю...";

  try {
    const response = await fetch(`http://localhost:5165/api/links/check?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.exists) {
      document.getElementById("status").textContent = "✅ Найдено в сервисе!";
    } else {
      document.getElementById("status").textContent = "❌ Не найдено.";
    }
  } catch (e) {
    document.getElementById("status").textContent = "⚠️ Ошибка запроса.";
    console.error(e);
  }
});
