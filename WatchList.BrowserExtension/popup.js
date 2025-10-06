document.getElementById("add").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  let statusElement = document.getElementById("status");
  statusElement.textContent = "Добавляю...";

  chrome.runtime.sendMessage({ 
    type: "add-url",
    url,
    tab_id: tab.id
  }, (response) => {
    if (!response) {
      statusElement.textContent = "⚠️ Ошибка связи с background";
      return;
    }

    if (response.exists) {
      statusElement.textContent = "✅ Добавлено";
    } else {
      statusElement.textContent = "❌ Ошибка добавления";
    }
  });
});
