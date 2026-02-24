(() => {
    console.log("Injected Verbly");

    let rangeData = null;
    let activeShortcut = null;

    window.addEventListener("message", (event) => {
        if (event.source !== window) return;
        if (event.data.type !== "FROM_EXTENSION") return;

        // console.log("Reply from background:", event.data);

        if (event.data.responseFor === "FIX_SENTENCE") {
            const loadingElement = document.querySelector("#verbly-popup");

            loadingElement?.remove();


            let response = event.data.payload; // {result: {original: "", corrected: "", tone: ""}}
            console.log('response: ', response);

            const activeElement = document.activeElement;

            if (
                activeElement &&
                (activeElement.tagName === "INPUT" ||
                    activeElement.tagName === "TEXTAREA")
            ) {

                const start = activeElement.selectionStart;
                const end = activeElement.selectionEnd;
                const value = activeElement.value;

                const correctedText = response.result.corrected;

                activeElement.value =
                    value.slice(0, start) +
                    correctedText +
                    value.slice(end);
                // Move caret to end of inserted text
                const newCaretPosition = start + correctedText.length;
                activeElement.selectionStart = newCaretPosition;
                activeElement.selectionEnd = newCaretPosition;
            } else {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;

                const range = selection.getRangeAt(0);
                range.deleteContents();

                const newText = document.createTextNode(response.result.corrected);
                range.insertNode(newText);

                // Move caret after inserted text
                range.setStartAfter(newText);
                range.collapse(true);

                selection.removeAllRanges();
                selection.addRange(range);

                // if (!rangeData) return; // the below code was not working well in menu click case

                // let newRange = document.createRange();
                // newRange.setStart(rangeData.startContainer, rangeData.startOffset);
                // newRange.setEnd(rangeData.endContainer, rangeData.endOffset);

                // newRange.deleteContents();

                // const newText = document.createTextNode(response.result.corrected);
                // newRange.insertNode(newText);



                // // Move caret after inserted text .. isn't working currently idk why
                // newRange.setStartAfter(newText);
                // newRange.collapse(true);

                // const sel = window.getSelection();
                // sel.removeAllRanges();
                // sel.addRange(newRange);
            }
        }

        if (event.data.responseFor === "SHORTCUT_UPDATE") {
            activeShortcut = event.data.payload;
            console.log("Updated shortcut:", activeShortcut);
        }

        // show popup / inject UI here
    });

    window.addEventListener("keydown", handleKeyDown, true);

    function handleKeyDown(event) {
        let ctrl = event.ctrlKey;
        let shift = event.shiftKey;
        let alt = event.altKey;
        let key = event.key?.toUpperCase();
        console.log('key: ', key);
        let condition =
            // ctrl && key === "i"
            alt && shift && key === "I"
            ;
        if (condition) {

            console.log(activeShortcut);

            let selection = window.getSelection();
            if (!selection.rangeCount) return;

            let range = selection.getRangeAt(0);

            rangeData = {
                startContainer: range.startContainer,
                startOffset: range.startOffset,
                endContainer: range.endContainer,
                endOffset: range.endOffset
            };


            const rect = range.getBoundingClientRect();

            let top = rect.top;
            let left = rect.left;
            let width = rect.width;
            let height = rect.height;

            const popup = document.createElement("div");
            popup.id = "verbly-popup";
            popup.style.position = "absolute";
            popup.style.top = `${top + height + window.scrollY}px`;
            popup.style.left = `${left + window.scrollX}px`;
            popup.style.width = `${width}px`;
            popup.style.height = `${height}px`;
            popup.style.backgroundColor = "#0f0b0bff";
            popup.style.color = "white";
            popup.style.zIndex = "9999";
            popup.textContent = "Loading...";

            document.body.appendChild(popup);

            window.postMessage({
                type: "FROM_PAGE",
                requestFor: "FIX_SENTENCE",
                payload: {
                    text: selection.toString()
                }
            }, "*");

        }
    }
})();