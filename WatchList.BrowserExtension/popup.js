document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url) {
    //document.getElementById("status").textContent = "⚠️ Нет активной вкладки";
    return;
  }

  chrome.runtime.sendMessage({ 
    type: "check-url",
    url: tab.url,
    tab_id: tab.id
  }, (response) => {
    if (!response) {
      statusElement.textContent = "⚠️ Ошибка связи с background";
      return;
    }

    console.log('check-url', response);
    updateElements(response.exists);
  });
});

function updateElements(linkSaved) {
  if (linkSaved === true) {
      document.getElementById("add").hidden = true;
      document.getElementById("remove").hidden = false;
    } else {
      document.getElementById("add").hidden = false;
      document.getElementById("remove").hidden = true;
    }
}

document.getElementById("add").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let statusElement = document.getElementById("status");
  statusElement.textContent = "Добавляю...";

  chrome.runtime.sendMessage({
    type: "add-url",
    url: tab.url,
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

    updateElements(response.exists);
  });
});

document.getElementById("remove").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let statusElement = document.getElementById("status");
  statusElement.textContent = "Удаляю...";

  chrome.runtime.sendMessage({
    type: "remove-url",
    url: tab.url,
    tab_id: tab.id
  }, (response) => {
    if (!response) {
      statusElement.textContent = "⚠️ Ошибка связи с background";
      return;
    }

    if (response.removed) {
      statusElement.textContent = "✅ Ссылка удалена";
    } else {
      statusElement.textContent = "❌ Ошибка удаления";
    }

    updateElements(!response.removed);
  });
});

