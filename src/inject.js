(() => {
    // let rangeData = null;
    let activeShortcut = null;

    window.addEventListener("message", (event) => {
        if (event.source !== window) return;
        if (event.data.type !== "FROM_EXTENSION") return;

        // console.log("Reply from background:", event.data);

        if (event.data.responseFor === "FIX_SENTENCE") {
            const loadingElement = document.querySelector("#verbly-popup");

            loadingElement?.remove();

            let response = event.data.payload; // {result: {original: "", corrected: "", tone: ""}}

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
            }
        }

        if (event.data.responseFor === "SHORTCUT_UPDATE") {
            activeShortcut = event.data.payload;
            console.log("Updated shortcut:", activeShortcut);
        }

        if (event.data.responseFor === "CONTEXT_MENU_CLICK") {
            sendSelectionToBackground(event.data.payload.text);
        }

        // show popup / inject UI here
    });

    window.addEventListener("keydown", handleKeyDown, true);

    function handleKeyDown(event) {
        let ctrl = event.ctrlKey;
        let shift = event.shiftKey;
        let alt = event.altKey;
        let key = event.key?.toUpperCase();
        let condition = alt && shift && key === "G";
        if (!condition) return;

        sendSelectionToBackground();
    }

    function sendSelectionToBackground() {

        const activeElement = document.activeElement;

        // ✅ CASE 1: INPUT or TEXTAREA
        if (
            activeElement &&
            (activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA")
        ) {
            const start = activeElement.selectionStart;
            const end = activeElement.selectionEnd;

            if (start === end) return; // no selection

            const selectedText = activeElement.value.slice(start, end);

            // Create popup near the input element
            const rect = activeElement.getBoundingClientRect();

            showPopup(rect);

            window.postMessage({
                type: "FROM_PAGE",
                requestFor: "FIX_SENTENCE",
                payload: { text: selectedText }
            }, "*");

            return;
        }

        // ✅ CASE 2: Normal DOM selection (contenteditable, div, etc.)
        let selection = window.getSelection();
        if (!selection.rangeCount) return;
        let range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        showPopup(rect);
        window.postMessage({
            type: "FROM_PAGE",
            requestFor: "FIX_SENTENCE",
            payload: {
                text: selection.toString()
            }
        }, "*");
    }


    function showPopup(rect) {
        // Prevent duplicate popup
        const existing = document.querySelector("#verbly-popup");
        if (existing) existing.remove();

        const popup = document.createElement("div");
        popup.id = "verbly-popup";
        popup.style.position = "absolute";
        popup.style.top = `${rect.bottom + window.scrollY}px`;
        popup.style.left = `${rect.left + window.scrollX}px`;
        popup.style.fontFamily = "inherit";
        popup.style.backgroundColor = "#0F172A";
        popup.style.color = "#f4f6fb";
        popup.style.zIndex = "9999";
        popup.style.fontSize = "14px";
        popup.style.padding = "10px";
        popup.style.borderRadius = "8px";

        // Create children explicitly
        const spanLoading = document.createElement("span");
        spanLoading.textContent = "Loading";

        const spanDots = document.createElement("span");
        spanDots.className = "verbly-dots";

        popup.appendChild(spanLoading);
        popup.appendChild(spanDots);

        document.body.appendChild(popup);

        injectLoadingStyles();
    }

    function injectLoadingStyles() {
        if (document.querySelector("#verbly-loading-style")) return;

        const style = document.createElement("style");
        style.id = "verbly-loading-style";

        style.textContent = `
        .verbly-dots::after {
            content: '.';
            animation: verblyDots 1.2s steps(3, end) infinite;
        }

        @keyframes verblyDots {
            0%   { content: ''; }
            33%  { content: '.'; }
            66%  { content: '..'; }
            100% { content: '...'; }
        }
    `;

        document.head.appendChild(style);
    }

})();