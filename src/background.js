
import { fixSentence } from "./utils/ai";

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "FIX_SENTENCE",
        title: "Fix sentence with Verbly",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "FIX_SENTENCE") {

        // simply send the context menu click instead of sending the fixed response
        chrome.tabs.sendMessage(tab.id, {
            type: "FROM_BACKGROUND",
            responseFor: "CONTEXT_MENU_CLICK",
            payload: {
                result: info.selectionText,
            },
        });

        // (async () => {
        //     let response = await fixSentence(info.selectionText);
        //     chrome.tabs.sendMessage(tab.id, {
        //         type: "FROM_BACKGROUND",
        //         responseFor: "FIX_SENTENCE",
        //         payload: {
        //             result: response,
        //         },
        //     });
        // })()
        // return;

        // let fixedResponse = {
        //     corrected: "Please send me the file as soon as possible.",
        //     original: "pls send me the file asap",
        //     tone: "normal",
        // }
        // chrome.tabs.sendMessage(tab.id, {
        //     type: "FROM_BACKGROUND",
        //     responseFor: "FIX_SENTENCE",
        //     payload: {
        //         result: fixedResponse,
        //     },
        // });
    }
});

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    if (data.type === "FROM_CONTENT") {
        console.log('data.type: ', data);

        if (data.requestFor === "FIX_SENTENCE") {
            (async () => {

                // const { tone } = await chrome.storage.local.get([
                //     "tone",
                // ]);
                // console.log('tone: ', tone);
                const tone = "normal"
                let response = await fixSentence(data.payload.text, tone);
                console.log('response: ', response);
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "FROM_BACKGROUND",
                    responseFor: "FIX_SENTENCE",
                    payload: {
                        result: response,
                    },
                });
                return;


                let fixedResponse = {
                    corrected: "Please send me the file as soon as possible.",
                    original: "pls send me the file asap",
                    tone: "normal",
                }
                setTimeout(() => {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "FROM_BACKGROUND",
                        responseFor: "FIX_SENTENCE",
                        payload: {
                            result: fixedResponse,
                        },
                    });
                }, 1000);

            })()
        }


        return true; // 🔥 REQUIRED for async
    }
});
