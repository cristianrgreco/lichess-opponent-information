chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message) => {
    if (message.action === "GET_PREFERENCES") {
      getPreferences(port);
    } else if (message.action === "SAVE_PREFERENCES") {
      savePreferences(port, message.payload);
    }
  });
});

async function getPreferences(port) {
  console.log("Fetching preferences from storage");

  const preferences = await chrome.storage.sync.get("preferences");
  if (!preferences || !preferences.preferences) {
    console.log("No preferences found");
    port.postMessage({ action: "GET_PREFERENCES", payload: undefined });
  } else {
    console.log("Returning preferences from storage");
    const parsedPreferences = JSON.parse(preferences.preferences);
    port.postMessage({ action: "GET_PREFERENCES", payload: parsedPreferences });
  }
}

async function savePreferences(port, preferences) {
  console.log("Saving preferences", preferences);
  chrome.storage.sync.set({ preferences: JSON.stringify(preferences) });
}
