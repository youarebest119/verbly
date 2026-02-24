const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
script.type = "text/javascript";
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);


chrome.runtime.onMessage.addListener((data) => {
    if (data.type === "FROM_BACKGROUND") {
        window.postMessage({
            type: "FROM_EXTENSION",
            payload: data.payload,
            responseFor: data.responseFor,
        }, "*");
    }
});

window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data.type !== "FROM_PAGE") return;

    chrome.runtime.sendMessage({
        type: "FROM_CONTENT",
        payload: event.data.payload,
        requestFor: event.data.requestFor,
    });
});


async function loadShortcutAndSend() {
    const hostname = window.location.hostname;

    const data = await chrome.storage.sync.get([
        "globalShortcut",
        "siteShortcuts",
    ]);

    let activeShortcut = null;

    if (data.siteShortcuts && data.siteShortcuts[hostname]) {
        activeShortcut = data.siteShortcuts[hostname];
    } else {
        activeShortcut = data.globalShortcut;
    }

    window.postMessage({
        type: "FROM_EXTENSION",
        payload: activeShortcut,
        responseFor: "SHORTCUT_UPDATE",
    }, "*");
}

loadShortcutAndSend();

// // 🔥 Listen for live updates
chrome.storage.onChanged.addListener(() => {
    loadShortcutAndSend();
});

const saveInitialShortcuts = async () => {
    const shortcutConfig = {
        ctrl: true,
        shift: false,
        alt: false,
        key: "i",
    };
    await chrome.storage.sync.set({
        globalShortcut: shortcutConfig,
    });
};
saveInitialShortcuts();