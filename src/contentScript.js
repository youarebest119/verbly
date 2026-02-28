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


// async function loadTone() {
//     const { tone } = await chrome.storage.local.get([
//         "tone",
//     ]);

//     console.log('tone: ', tone);
// }

// loadTone();

// // // 🔥 Listen for live updates
// chrome.storage.onChanged.addListener(() => {
//     loadTone();
// });

// const saveInitialTone = async () => {
//     await chrome.storage.local.set({
//         tone: "normal",
//     });
// };
// saveInitialTone();