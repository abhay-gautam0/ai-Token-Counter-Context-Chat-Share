(function () {
    "use strict";

    if (document.getElementById("ai-token-tally")) {
        return;
    }

    // =========================================================
    // CONFIG
    // =========================================================

    const CONFIG = {
        // Keep 9000 temporarily while testing.
        // Change back to 400000 after testing.
        maxTokens: 400000,

        warningPercent: 70,
        highPercent: 85,
        criticalPercent: 95
    };


    // =========================================================
    // MAIN TOKEN BAR
    // =========================================================

    const container = document.createElement("div");

    container.id = "ai-token-tally";

    container.innerHTML = `
        <div class="att-left">
            <span class="att-icon">⚡</span>

            <span class="att-title">
                SESSION
            </span>

            <span class="att-percent">
                0%
            </span>
        </div>

        <div class="att-progress">
            <div class="att-dot"></div>
            <div class="att-line"></div>
        </div>

        <div class="att-tokens">
            ~0 tokens
        </div>

        <button
            class="att-settings"
            title="Token Tally settings">
            ⚙
        </button>
    `;

    document.body.appendChild(container);


    // =========================================================
    // CONTINUE BUTTON
    // =========================================================

    const continueButton =
        document.createElement("button");

    continueButton.id =
        "att-continue-button";

    continueButton.innerHTML =
        "→ Continue";

    continueButton.style.display =
        "block";

    document.body.appendChild(
        continueButton
    );


    // =========================================================
    // CONTINUE PANEL
    // =========================================================

    const panel =
        document.createElement("div");

    panel.id =
        "att-continue-panel";

    panel.style.display =
        "none";

    panel.innerHTML = `
        <div class="att-panel-header">

            <div>
                <div class="att-panel-title">
                    CONTINUE THIS CHAT IN
                </div>

                <div class="att-panel-subtitle">
                    Continue this conversation whenever you want.
                </div>
            </div>

            <button
                class="att-panel-close"
                title="Close">
                ×
            </button>

        </div>


        <div class="att-platforms">

            <button
                class="att-platform"
                data-platform="claude">
                <span>◈</span>
                Claude
            </button>

            <button
                class="att-platform"
                data-platform="chatgpt">
                <span>✦</span>
                ChatGPT
            </button>

            <button
                class="att-platform"
                data-platform="gemini">
                <span>✦</span>
                Gemini
            </button>

            <button
                class="att-platform"
                data-platform="grok">
                <span>𝕏</span>
                Grok
            </button>

        </div>


        <div class="att-panel-divider"></div>


        <div class="att-panel-actions">

    <button
        class="att-action"
        id="att-copy">
        📋 Copy conversation
    </button>

   <button
    class="att-action"
    id="att-copy-prompt">
    ✨ Copy continuation prompt
</button>

<button
    class="att-action"
    id="att-ai-summary">
    🧠 AI summary prompt
</button>

<button
    class="att-action"
    id="att-download">
    ↓ Download
</button>

</div>


        <div
            id="att-copy-status"
            class="att-copy-status">
        </div>
    `;

    document.body.appendChild(
        panel
    );

// =========================================================
// GET CONVERSATION
// =========================================================

// Prevent multiple conversation scans from running at once
let isGettingConversation = false;
let ignoreMutationsUntil = 0;


async function getConversationText() {

    if (isGettingConversation) {
        console.log("AI Token Tally: Conversation scan already running.");
        return null;
    }

    isGettingConversation = true;

    // Stop MutationObserver while scanning/scrolling
    observer.disconnect();

    try {

        const collectedMessages = new Map();

        // ---------------------------------------------------------
        // FIND SCROLLABLE CONTAINER
        // ---------------------------------------------------------

        function findScrollContainer() {

            let element =
                document.querySelector(
                    '[data-message-author-role]'
                );

            if (!element) {
                return document.scrollingElement;
            }

            while (
                element &&
                element !== document.body &&
                element !== document.documentElement
            ) {

                const style =
                    window.getComputedStyle(element);

                const canScroll =
                    (
                        style.overflowY === "auto" ||
                        style.overflowY === "scroll"
                    ) &&
                    element.scrollHeight >
                    element.clientHeight;

                if (canScroll) {
                    return element;
                }

                element =
                    element.parentElement;
            }

            return document.scrollingElement;
        }

        // ---------------------------------------------------------
        // COLLECT MESSAGES
        // ---------------------------------------------------------

        function collectMessages() {

            const messages =
                document.querySelectorAll(
                    '[data-message-author-role]'
                );

            messages.forEach((message) => {

                if (
                    message.closest &&
                    message.closest(
                        "#ai-token-tally, #att-continue-button, #att-continue-panel"
                    )
                ) {
                    return;
                }

                const role =
                    message.getAttribute(
                        "data-message-author-role"
                    );

                const text =
                    message.innerText.trim();

                if (!text) {
                    return;
                }

                const key =
                    role + "::" + text;

                if (!collectedMessages.has(key)) {

                    collectedMessages.set(
                        key,
                        {
                            role,
                            text
                        }
                    );
                }
            });
        }


        // ---------------------------------------------------------
        // FIND SCROLL CONTAINER
        // ---------------------------------------------------------

        const scrollContainer =
            findScrollContainer();


        console.log(
            "AI Token Tally DEBUG:",
            "Scroll container:",
            scrollContainer
        );


        console.log(
            "AI Token Tally DEBUG:",
            "Initial scrollHeight:",
            scrollContainer.scrollHeight,
            "clientHeight:",
            scrollContainer.clientHeight,
            "scrollTop:",
            scrollContainer.scrollTop
        );


    // ---------------------------------------------------------
    // INITIAL COLLECTION
    // ---------------------------------------------------------

    collectMessages();

    console.log(
        "AI Token Tally DEBUG:",
        "Initial messages:",
        collectedMessages.size
    );


    // ---------------------------------------------------------
    // REMEMBER POSITION
    // ---------------------------------------------------------

    const originalPosition =
        scrollContainer.scrollTop;


    // ---------------------------------------------------------
    // SCROLL UP THROUGH CONVERSATION
    // ---------------------------------------------------------

    for (let i = 0; i < 200; i++) {

        scrollContainer.scrollTop =
            Math.max(
                0,
                scrollContainer.scrollTop - 1200
            );


        await new Promise(
            resolve =>
                setTimeout(resolve, 300)
        );


        collectMessages();


        console.log(
            "AI Token Tally DEBUG:",
            `Scroll ${i + 1}/200`,
            "| Messages:",
            collectedMessages.size,
            "| scrollTop:",
            scrollContainer.scrollTop
        );


        // Stop when we reach the top

        if (
            scrollContainer.scrollTop <= 0
        ) {
            break;
        }
    }


    // ---------------------------------------------------------
    // RESTORE POSITION
    // ---------------------------------------------------------

    scrollContainer.scrollTop =
        originalPosition;


    await new Promise(
        resolve =>
            setTimeout(resolve, 500)
    );


    // Collect once more
    collectMessages();


    // ---------------------------------------------------------
    // BUILD CONVERSATION
    // ---------------------------------------------------------

    let conversation = "";


    collectedMessages.forEach(
        ({ role, text }) => {

            conversation +=
                `${role.toUpperCase()}:\n`;

            conversation +=
                `${text}\n\n`;

            conversation +=
                "--------------------------------\n\n";
        }
    );


    console.log(
        "AI Token Tally DEBUG:",
        "FINAL messages:",
        collectedMessages.size,
        "| Characters:",
        conversation.length
    );

return conversation.trim();

} finally {

    // Ignore DOM mutations caused by restoring the scroll position
    ignoreMutationsUntil =
        Date.now() + 3000;

    // Remove any mutations that happened during the scan
    observer.takeRecords();

    // Start observing again
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    isGettingConversation = false;
}

}


    // =========================================================
    // TOKENIZER
    // =========================================================

    function countTokens(text) {

        if (
            !globalThis.AITokenizer ||
            typeof globalThis.AITokenizer.count !==
                "function"
        ) {
            console.warn(
                "AI Token Tally: tokenizer unavailable"
            );

            return null;
        }

        return globalThis.AITokenizer.count(
            text
        );
    }


    // =========================================================
    // FORMAT TOKEN NUMBER
    // =========================================================

    function formatTokens(tokens) {

        if (tokens >= 1000000) {

            return (
                tokens / 1000000
            ).toFixed(1) + "M";
        }

        if (tokens >= 1000) {

            return (
                tokens / 1000
            ).toFixed(1) + "k";
        }

        return tokens.toString();
    }


    // =========================================================
    // STATUS
    // =========================================================

    function getStatus(percent) {

        if (
            percent >=
            CONFIG.criticalPercent
        ) {
            return "critical";
        }

        if (
            percent >=
            CONFIG.highPercent
        ) {
            return "high";
        }

        if (
            percent >=
            CONFIG.warningPercent
        ) {
            return "warning";
        }

        return "normal";
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    function updateStatus(status) {

        container.classList.remove(
            "att-normal",
            "att-warning",
            "att-high",
            "att-critical"
        );

        container.classList.add(
            `att-${status}`
        );
    }


    // =========================================================
    // UPDATE CONTINUE BUTTON
    // =========================================================
function updateContinueButton(percent) {

    // Continue button is always available manually
    continueButton.style.display = "block";

    if (percent >= CONFIG.criticalPercent) {

        continueButton.innerHTML =
            "🔴 Context critical &nbsp; → Continue";

    } else if (percent >= CONFIG.highPercent) {

        continueButton.innerHTML =
            "⚠ Context high &nbsp; → Continue";

    } else if (percent >= CONFIG.warningPercent) {

        continueButton.innerHTML =
            "⚠ Context warning &nbsp; → Continue";

    } else {

        continueButton.innerHTML =
            "→ Continue";
    }
}


// =========================================================
// UPDATE COUNTER
// =========================================================

async function updateCounter() {

    // ---------------------------------------------------------
    // PREVENT MULTIPLE SCANS
    // ---------------------------------------------------------

    if (isGettingConversation) {
        return;
    }


    // ---------------------------------------------------------
    // GET CONVERSATION
    // ---------------------------------------------------------

    const text =
        await getConversationText();


    // If no conversation was returned
    if (!text) {
        return;
    }


    // ---------------------------------------------------------
    // COUNT TOKENS
    // ---------------------------------------------------------

    const tokens =
        countTokens(text);


    if (tokens === null) {
        return;
    }


    // ---------------------------------------------------------
    // CALCULATE PERCENTAGE
    // ---------------------------------------------------------

    let percentage =
        (tokens /
            CONFIG.maxTokens) *
        100;


    percentage =
        Math.min(
            percentage,
            100
        );


    // ---------------------------------------------------------
    // UPDATE STATUS
    // ---------------------------------------------------------

    const status =
        getStatus(
            percentage
        );


    updateStatus(
        status
    );


    // ---------------------------------------------------------
    // TOKEN COUNT
    // ---------------------------------------------------------

    const tokenElement =
        container.querySelector(
            ".att-tokens"
        );


    if (tokenElement) {

        tokenElement.textContent =
            `~${formatTokens(tokens)} tokens`;
    }


    // ---------------------------------------------------------
    // PERCENTAGE
    // ---------------------------------------------------------

    const percentElement =
        container.querySelector(
            ".att-percent"
        );


    if (percentElement) {

        let displayPercentage;


        if (percentage < 10) {

            displayPercentage =
                percentage.toFixed(1);

        } else {

            displayPercentage =
                Math.round(
                    percentage
                );
        }


        percentElement.textContent =
            `${displayPercentage}%`;
    }


    // ---------------------------------------------------------
    // PROGRESS DOT
    // ---------------------------------------------------------

    const progress =
        container.querySelector(
            ".att-progress"
        );


    const dot =
        container.querySelector(
            ".att-dot"
        );


    if (
        progress &&
        dot
    ) {

        const width =
            progress.clientWidth;


        const position =
            (percentage / 100) *
            width;


        dot.style.left =
            `${Math.max(
                0,
                Math.min(
                    position,
                    width - 9
                )
            )}px`;
    }


    // ---------------------------------------------------------
    // CONTINUE BUTTON
    // ---------------------------------------------------------

    updateContinueButton(
        percentage
    );


    // ---------------------------------------------------------
    // DEBUG
    // ---------------------------------------------------------

    console.log(
        "AI Token Tally:",
        tokens,
        "real o200k_base tokens |",
        percentage.toFixed(2),
        "%"
    );
}

        // =========================================================
        // COPY CONVERSATION
        // =========================================================

        async function copyConversation() {

            const text =
            await getConversationText();

            if (!text) {

                showCopyStatus(
                    "No conversation found."
                );

                return;
            }


            try {

                await navigator.clipboard.writeText(
                    text
                );

                showCopyStatus(
                    "✓ Conversation copied!"
                );

            } catch (error) {

                // Fallback
                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.value =
                    text;

                textarea.style.position =
                    "fixed";

                textarea.style.opacity =
                    "0";

                document.body.appendChild(
                    textarea
                );

                textarea.select();

                document.execCommand(
                    "copy"
                );

                textarea.remove();

                showCopyStatus(
                    "✓ Conversation copied!"
                );
            }
        }

// =========================================================
// SMART LOCAL CONVERSATION COMPRESSOR
// =========================================================

function smartCompressConversation() {

    const messages = document.querySelectorAll(
        '[data-message-author-role]'
    );

    if (!messages.length) {
        return "";
    }

    const parsed = [];

    messages.forEach((message) => {

        const role =
            message.getAttribute(
                "data-message-author-role"
            );

        const text =
            message.innerText.trim();

        if (!text) {
            return;
        }

        parsed.push({
            role: role,
            text: text
        });
    });


    if (!parsed.length) {
        return "";
    }


    // ---------------------------------------------------------
    // SETTINGS
    // ---------------------------------------------------------

    // Approximately 2,500–3,000 tokens worth of text.
    const MAX_CHARS = 10000;

    const important = [];

    const recent = [];


    // ---------------------------------------------------------
    // KEEP USER REQUESTS
    // ---------------------------------------------------------

    parsed.forEach((message, index) => {

        if (message.role === "user") {

            let text = message.text;

            // Keep user messages, but prevent one huge
            // message from consuming the whole context.
            if (text.length > 1800) {

                text =
                    text.substring(
                        0,
                        1800
                    ) +
                    "\n[User message truncated]";
            }

            important.push({
                index: index,
                role: "USER",
                text: text
            });
        }
    });


    // ---------------------------------------------------------
    // KEEP RECENT MESSAGES
    // ---------------------------------------------------------

    const RECENT_MESSAGES = 8;

    const start =
        Math.max(
            0,
            parsed.length - RECENT_MESSAGES
        );


    for (
        let i = start;
        i < parsed.length;
        i++
    ) {

        let text =
            parsed[i].text;

        if (text.length > 2500) {

            text =
                text.substring(
                    0,
                    2500
                ) +
                "\n[Message truncated]";
        }

        recent.push({
            index: i,
            role:
                parsed[i].role.toUpperCase(),
            text: text
        });
    }


    // ---------------------------------------------------------
    // REMOVE DUPLICATES
    // ---------------------------------------------------------

    const selected =
        new Map();


    important.forEach((message) => {

        selected.set(
            message.index,
            message
        );
    });


    recent.forEach((message) => {

        selected.set(
            message.index,
            message
        );
    });


    // ---------------------------------------------------------
    // SORT BY ORIGINAL ORDER
    // ---------------------------------------------------------

    const ordered =
        Array.from(
            selected.values()
        ).sort(
            (a, b) =>
                a.index - b.index
        );


    // ---------------------------------------------------------
    // BUILD COMPRESSED CONTEXT
    // ---------------------------------------------------------

    let context = "";

    ordered.forEach((message) => {

        context +=
            `${message.role}:\n`;

        context +=
            `${message.text}\n\n`;

        context +=
            "--------------------------------\n\n";
    });


    // ---------------------------------------------------------
    // FINAL CHARACTER LIMIT
    // ---------------------------------------------------------

    if (
        context.length >
        MAX_CHARS
    ) {

        context =
            context.substring(
                context.length -
                MAX_CHARS
            );

        context =
            "[Earlier context compressed/removed]\n\n" +
            context;
    }


    return context.trim();
}


/// =========================================================
// SMART LOCAL CONVERSATION COMPRESSOR
// =========================================================

function smartCompressConversation() {

    const messages = document.querySelectorAll(
        '[data-message-author-role]'
    );

    if (!messages.length) {
        return "";
    }

    const parsed = [];

    messages.forEach((message) => {

        const role = message.getAttribute(
            "data-message-author-role"
        );

        const text = message.innerText.trim();

        if (!text) return;

        parsed.push({
            role: role,
            text: text
        });
    });

    if (!parsed.length) {
        return "";
    }

    // Maximum size of compressed context
    const MAX_CHARS = 12000;

    const selected = new Map();

    // ---------------------------------------------------------
    // IMPORTANT KEYWORDS
    // ---------------------------------------------------------

    const importantWords = [
        "error",
        "failed",
        "problem",
        "issue",
        "important",
        "need",
        "want",
        "must",
        "require",
        "requirement",
        "fix",
        "fixed",
        "doesn't work",
        "not working",
        "working",
        "code",
        "javascript",
        "python",
        "npm",
        "github",
        "http",
        "https://",
        "localhost",
        "terminal",
        "console",
        "exception",
        "warning"
    ];

    // ---------------------------------------------------------
    // SCORE EACH MESSAGE
    // ---------------------------------------------------------

    parsed.forEach((message, index) => {

        let score = 0;

        const lower =
            message.text.toLowerCase();

        // User messages are important
        if (message.role === "user") {
            score += 5;
        }

        // Recent messages are important
        const distance =
            parsed.length - index;

        if (distance <= 8) {
            score += 10;
        } else if (distance <= 15) {
            score += 5;
        }

        // Important keywords
        importantWords.forEach((word) => {

            if (lower.includes(word)) {
                score += 2;
            }

        });

        // Code-like content
        if (
            lower.includes("```") ||
            lower.includes("function ") ||
            lower.includes("const ") ||
            lower.includes("let ") ||
            lower.includes("npm install") ||
            lower.includes("powershell")
        ) {
            score += 4;
        }

        selected.set(index, {
            index,
            role: message.role.toUpperCase(),
            text: message.text,
            score
        });

    });


    // ---------------------------------------------------------
    // ALWAYS KEEP LAST 8 MESSAGES
    // ---------------------------------------------------------

    const recentStart =
        Math.max(
            0,
            parsed.length - 8
        );

    for (
        let i = recentStart;
        i < parsed.length;
        i++
    ) {

        const item = selected.get(i);

        if (item) {
            item.score += 100;
        }
    }


    // ---------------------------------------------------------
    // SORT BY IMPORTANCE
    // ---------------------------------------------------------

    const ranked =
        Array.from(
            selected.values()
        ).sort(
            (a, b) =>
                b.score - a.score
        );


    // ---------------------------------------------------------
    // SELECT UNTIL SIZE LIMIT
    // ---------------------------------------------------------

    const chosen = [];

    let totalChars = 0;

    for (const item of ranked) {

        let text = item.text;

        // Limit individual huge messages
        if (text.length > 3000) {

            const firstPart =
                text.substring(
                    0,
                    1800
                );

            const lastPart =
                text.substring(
                    text.length - 900
                );

            text =
                firstPart +
                "\n\n[...middle truncated...]\n\n" +
                lastPart;
        }

        const block =
            `${item.role}:\n${text}\n\n` +
            "--------------------------------\n\n";

        if (
            totalChars + block.length >
            MAX_CHARS
        ) {
            continue;
        }

        chosen.push({
            index: item.index,
            block: block
        });

        totalChars += block.length;
    }


    // ---------------------------------------------------------
    // RESTORE ORIGINAL CONVERSATION ORDER
    // ---------------------------------------------------------

    chosen.sort(
        (a, b) =>
            a.index - b.index
    );


    let context = "";

    chosen.forEach((item) => {
        context += item.block;
    });


    return context.trim();
}


// =========================================================
// SMART LOCAL CONVERSATION COMPRESSOR
// =========================================================

function smartCompressConversation() {

    const messages = document.querySelectorAll(
        '[data-message-author-role]'
    );

    if (!messages.length) {
        return "";
    }

    const parsed = [];

    messages.forEach((message) => {

        const role = message.getAttribute(
            "data-message-author-role"
        );

        const text = message.innerText.trim();

        if (!text) return;

        parsed.push({
            role: role,
            text: text
        });
    });

    if (!parsed.length) {
        return "";
    }

    // Maximum size of compressed context
    const MAX_CHARS = 12000;

    const selected = new Map();

    // ---------------------------------------------------------
    // IMPORTANT KEYWORDS
    // ---------------------------------------------------------

    const importantWords = [
        "error",
        "failed",
        "problem",
        "issue",
        "important",
        "need",
        "want",
        "must",
        "require",
        "requirement",
        "fix",
        "fixed",
        "doesn't work",
        "not working",
        "working",
        "code",
        "javascript",
        "python",
        "npm",
        "github",
        "http",
        "https://",
        "localhost",
        "terminal",
        "console",
        "exception",
        "warning"
    ];

    // ---------------------------------------------------------
    // SCORE EACH MESSAGE
    // ---------------------------------------------------------

    parsed.forEach((message, index) => {

        let score = 0;

        const lower =
            message.text.toLowerCase();

        // User messages are important
        if (message.role === "user") {
            score += 5;
        }

        // Recent messages are important
        const distance =
            parsed.length - index;

        if (distance <= 8) {
            score += 10;
        } else if (distance <= 15) {
            score += 5;
        }

        // Important keywords
        importantWords.forEach((word) => {

            if (lower.includes(word)) {
                score += 2;
            }

        });

        // Code-like content
        if (
            lower.includes("```") ||
            lower.includes("function ") ||
            lower.includes("const ") ||
            lower.includes("let ") ||
            lower.includes("npm install") ||
            lower.includes("powershell")
        ) {
            score += 4;
        }

        selected.set(index, {
            index,
            role: message.role.toUpperCase(),
            text: message.text,
            score
        });

    });


    // ---------------------------------------------------------
    // ALWAYS KEEP LAST 8 MESSAGES
    // ---------------------------------------------------------

    const recentStart =
        Math.max(
            0,
            parsed.length - 8
        );

    for (
        let i = recentStart;
        i < parsed.length;
        i++
    ) {

        const item = selected.get(i);

        if (item) {
            item.score += 100;
        }
    }


    // ---------------------------------------------------------
    // SORT BY IMPORTANCE
    // ---------------------------------------------------------

    const ranked =
        Array.from(
            selected.values()
        ).sort(
            (a, b) =>
                b.score - a.score
        );


    // ---------------------------------------------------------
    // SELECT UNTIL SIZE LIMIT
    // ---------------------------------------------------------

    const chosen = [];

    let totalChars = 0;

    for (const item of ranked) {

        let text = item.text;

        // Limit individual huge messages
        if (text.length > 3000) {

            const firstPart =
                text.substring(
                    0,
                    1800
                );

            const lastPart =
                text.substring(
                    text.length - 900
                );

            text =
                firstPart +
                "\n\n[...middle truncated...]\n\n" +
                lastPart;
        }

        const block =
            `${item.role}:\n${text}\n\n` +
            "--------------------------------\n\n";

        if (
            totalChars + block.length >
            MAX_CHARS
        ) {
            continue;
        }

        chosen.push({
            index: item.index,
            block: block
        });

        totalChars += block.length;
    }


    // ---------------------------------------------------------
    // RESTORE ORIGINAL CONVERSATION ORDER
    // ---------------------------------------------------------

    chosen.sort(
        (a, b) =>
            a.index - b.index
    );


    let context = "";

    chosen.forEach((item) => {
        context += item.block;
    });


    return context.trim();
}


// =========================================================
// SMART LOCAL CONVERSATION COMPRESSOR
// =========================================================

function smartCompressConversation() {

    const messages = document.querySelectorAll(
        '[data-message-author-role]'
    );

    if (!messages.length) {
        return "";
    }

    const parsed = [];

    messages.forEach((message) => {

        const role = message.getAttribute(
            "data-message-author-role"
        );

        const text = message.innerText.trim();

        if (!text) return;

        parsed.push({
            role: role,
            text: text
        });
    });

    if (!parsed.length) {
        return "";
    }

    // Maximum size of compressed context
    const MAX_CHARS = 12000;

    const selected = new Map();

    // ---------------------------------------------------------
    // IMPORTANT KEYWORDS
    // ---------------------------------------------------------

    const importantWords = [
        "error",
        "failed",
        "problem",
        "issue",
        "important",
        "need",
        "want",
        "must",
        "require",
        "requirement",
        "fix",
        "fixed",
        "doesn't work",
        "not working",
        "working",
        "code",
        "javascript",
        "python",
        "npm",
        "github",
        "http",
        "https://",
        "localhost",
        "terminal",
        "console",
        "exception",
        "warning"
    ];

    // ---------------------------------------------------------
    // SCORE EACH MESSAGE
    // ---------------------------------------------------------

    parsed.forEach((message, index) => {

        let score = 0;

        const lower =
            message.text.toLowerCase();

        // User messages are important
        if (message.role === "user") {
            score += 5;
        }

        // Recent messages are important
        const distance =
            parsed.length - index;

        if (distance <= 8) {
            score += 10;
        } else if (distance <= 15) {
            score += 5;
        }

        // Important keywords
        importantWords.forEach((word) => {

            if (lower.includes(word)) {
                score += 2;
            }

        });

        // Code-like content
        if (
            lower.includes("```") ||
            lower.includes("function ") ||
            lower.includes("const ") ||
            lower.includes("let ") ||
            lower.includes("npm install") ||
            lower.includes("powershell")
        ) {
            score += 4;
        }

        selected.set(index, {
            index,
            role: message.role.toUpperCase(),
            text: message.text,
            score
        });

    });


    // ---------------------------------------------------------
    // ALWAYS KEEP LAST 8 MESSAGES
    // ---------------------------------------------------------

    const recentStart =
        Math.max(
            0,
            parsed.length - 8
        );

    for (
        let i = recentStart;
        i < parsed.length;
        i++
    ) {

        const item = selected.get(i);

        if (item) {
            item.score += 100;
        }
    }


    // ---------------------------------------------------------
    // SORT BY IMPORTANCE
    // ---------------------------------------------------------

    const ranked =
        Array.from(
            selected.values()
        ).sort(
            (a, b) =>
                b.score - a.score
        );


    // ---------------------------------------------------------
    // SELECT UNTIL SIZE LIMIT
    // ---------------------------------------------------------

    const chosen = [];

    let totalChars = 0;

    for (const item of ranked) {

        let text = item.text;

        // Limit individual huge messages
        if (text.length > 3000) {

            const firstPart =
                text.substring(
                    0,
                    1800
                );

            const lastPart =
                text.substring(
                    text.length - 900
                );

            text =
                firstPart +
                "\n\n[...middle truncated...]\n\n" +
                lastPart;
        }

        const block =
            `${item.role}:\n${text}\n\n` +
            "--------------------------------\n\n";

        if (
            totalChars + block.length >
            MAX_CHARS
        ) {
            continue;
        }

        chosen.push({
            index: item.index,
            block: block
        });

        totalChars += block.length;
    }


    // ---------------------------------------------------------
    // RESTORE ORIGINAL CONVERSATION ORDER
    // ---------------------------------------------------------

    chosen.sort(
        (a, b) =>
            a.index - b.index
    );


    let context = "";

    chosen.forEach((item) => {
        context += item.block;
    });


    return context.trim();
}


// =========================================================
// SMART LOCAL CONVERSATION COMPRESSOR
// =========================================================

function smartCompressConversation() {

    const messages = document.querySelectorAll(
        '[data-message-author-role]'
    );

    if (!messages.length) {
        return "";
    }

    const parsed = [];

    messages.forEach((message) => {

        const role = message.getAttribute(
            "data-message-author-role"
        );

        const text = message.innerText.trim();

        if (!text) return;

        parsed.push({
            role: role,
            text: text
        });
    });

    if (!parsed.length) {
        return "";
    }

    // Maximum size of compressed context
    const MAX_CHARS = 12000;

    const selected = new Map();

    // ---------------------------------------------------------
    // IMPORTANT KEYWORDS
    // ---------------------------------------------------------

    const importantWords = [
        "error",
        "failed",
        "problem",
        "issue",
        "important",
        "need",
        "want",
        "must",
        "require",
        "requirement",
        "fix",
        "fixed",
        "doesn't work",
        "not working",
        "working",
        "code",
        "javascript",
        "python",
        "npm",
        "github",
        "http",
        "https://",
        "localhost",
        "terminal",
        "console",
        "exception",
        "warning"
    ];

    // ---------------------------------------------------------
    // SCORE EACH MESSAGE
    // ---------------------------------------------------------

    parsed.forEach((message, index) => {

        let score = 0;

        const lower =
            message.text.toLowerCase();

        // User messages are important
        if (message.role === "user") {
            score += 5;
        }

        // Recent messages are important
        const distance =
            parsed.length - index;

        if (distance <= 8) {
            score += 10;
        } else if (distance <= 15) {
            score += 5;
        }

        // Important keywords
        importantWords.forEach((word) => {

            if (lower.includes(word)) {
                score += 2;
            }

        });

        // Code-like content
        if (
            lower.includes("```") ||
            lower.includes("function ") ||
            lower.includes("const ") ||
            lower.includes("let ") ||
            lower.includes("npm install") ||
            lower.includes("powershell")
        ) {
            score += 4;
        }

        selected.set(index, {
            index,
            role: message.role.toUpperCase(),
            text: message.text,
            score
        });

    });


    // ---------------------------------------------------------
    // ALWAYS KEEP LAST 8 MESSAGES
    // ---------------------------------------------------------

    const recentStart =
        Math.max(
            0,
            parsed.length - 8
        );

    for (
        let i = recentStart;
        i < parsed.length;
        i++
    ) {

        const item = selected.get(i);

        if (item) {
            item.score += 100;
        }
    }


    // ---------------------------------------------------------
    // SORT BY IMPORTANCE
    // ---------------------------------------------------------

    const ranked =
        Array.from(
            selected.values()
        ).sort(
            (a, b) =>
                b.score - a.score
        );


    // ---------------------------------------------------------
    // SELECT UNTIL SIZE LIMIT
    // ---------------------------------------------------------

    const chosen = [];

    let totalChars = 0;

    for (const item of ranked) {

        let text = item.text;

        // Limit individual huge messages
        if (text.length > 3000) {

            const firstPart =
                text.substring(
                    0,
                    1800
                );

            const lastPart =
                text.substring(
                    text.length - 900
                );

            text =
                firstPart +
                "\n\n[...middle truncated...]\n\n" +
                lastPart;
        }

        const block =
            `${item.role}:\n${text}\n\n` +
            "--------------------------------\n\n";

        if (
            totalChars + block.length >
            MAX_CHARS
        ) {
            continue;
        }

        chosen.push({
            index: item.index,
            block: block
        });

        totalChars += block.length;
    }


    // ---------------------------------------------------------
    // RESTORE ORIGINAL CONVERSATION ORDER
    // ---------------------------------------------------------

    chosen.sort(
        (a, b) =>
            a.index - b.index
    );


    let context = "";

    chosen.forEach((item) => {
        context += item.block;
    });


    return context.trim();
}


// =========================================================
// SMART LOCAL CONVERSATION COMPRESSOR
// =========================================================

function smartCompressConversation() {

    const messages = document.querySelectorAll(
        '[data-message-author-role]'
    );

    if (!messages.length) {
        return "";
    }

    const parsed = [];

    messages.forEach((message) => {

        const role = message.getAttribute(
            "data-message-author-role"
        );

        const text = message.innerText.trim();

        if (!text) return;

        parsed.push({
            role: role,
            text: text
        });
    });

    if (!parsed.length) {
        return "";
    }

    // Maximum size of compressed context
    const MAX_CHARS = 12000;

    const selected = new Map();

    // ---------------------------------------------------------
    // IMPORTANT KEYWORDS
    // ---------------------------------------------------------
  const importantWords = [
        "error",
        "failed",
        "problem",
        "issue",
        "important",
        "need",
        "want",
        "must",
        "require",
        "requirement",
        "fix",
        "fixed",
        "doesn't work",
        "not working",
        "working",
        "code",
        "javascript",
        "python",
        "npm",
        "github",
        "http",
        "https://",
        "localhost",
        "terminal",
        "console",
        "exception",
        "warning"
    ];

    // ---------------------------------------------------------
    // SCORE EACH MESSAGE
    // ---------------------------------------------------------

    parsed.forEach((message, index) => {

        let score = 0;

        const lower =
            message.text.toLowerCase();

        // User messages are important
        if (message.role === "user") {
            score += 5;
        }

        // Recent messages are important
        const distance =
            parsed.length - index;

        if (distance <= 8) {
            score += 10;
        } else if (distance <= 15) {
            score += 5;
        }

        // Important keywords
        importantWords.forEach((word) => {

            if (lower.includes(word)) {
                score += 2;
            }

        });

        // Code-like content
        if (
            lower.includes("```") ||
            lower.includes("function ") ||
            lower.includes("const ") ||
            lower.includes("let ") ||
            lower.includes("npm install") ||
            lower.includes("powershell")
        ) {
            score += 4;
        }

        selected.set(index, {
            index,
            role: message.role.toUpperCase(),
            text: message.text,
            score
        });

    });


    // ---------------------------------------------------------
    // ALWAYS KEEP LAST 8 MESSAGES
    // ---------------------------------------------------------

    const recentStart =
        Math.max(
            0,
            parsed.length - 8
        );

    for (
        let i = recentStart;
        i < parsed.length;
        i++
    ) {

        const item = selected.get(i);

        if (item) {
            item.score += 100;
        }
    }


    // ---------------------------------------------------------
    // SORT BY IMPORTANCE
    // ---------------------------------------------------------

    const ranked =
        Array.from(
            selected.values()
        ).sort(
            (a, b) =>
                b.score - a.score
        );


    // ---------------------------------------------------------
    // SELECT UNTIL SIZE LIMIT
    // ---------------------------------------------------------

    const chosen = [];

    let totalChars = 0;

    for (const item of ranked) {

        let text = item.text;

        // Limit individual huge messages
        if (text.length > 3000) {

            const firstPart =
                text.substring(
                    0,
                    1800
                );

            const lastPart =
                text.substring(
                    text.length - 900
                );

            text =
                firstPart +
                "\n\n[...middle truncated...]\n\n" +
                lastPart;
        }

        const block =
            `${item.role}:\n${text}\n\n` +
            "--------------------------------\n\n";

        if (
            totalChars + block.length >
            MAX_CHARS
        ) {
            continue;
        }

        chosen.push({
            index: item.index,
            block: block
        });

        totalChars += block.length;
    }

 // ---------------------------------------------------------
    // RESTORE ORIGINAL CONVERSATION ORDER
    // ---------------------------------------------------------

    chosen.sort(
        (a, b) =>
            a.index - b.index
    );


    let context = "";

    chosen.forEach((item) => {
        context += item.block;
    });


    return context.trim();
}


// =========================================================
// CREATE SMART CONTINUATION PROMPT
// =========================================================

function createContinuationPrompt() {

    const compressedConversation =
        smartCompressConversation();

    if (!compressedConversation) {
        return "";
    }


    return `You are continuing an existing conversation from another AI chat.

IMPORTANT INSTRUCTIONS:

- Continue naturally from the previous conversation.
- Preserve the user's requirements, decisions, preferences, and technical context.
- Do not restart the conversation unnecessarily.
- Do not ask the user to repeat information already present below.
- Treat the context below as a conversation that has already happened.
- Pay particular attention to recent USER messages.
- Preserve important code, errors, commands, file paths, URLs, and technical details.
- Do not mention that the conversation was transferred unless the user asks.
- Answer the user's next message normally.

The previous conversation was locally compressed to remove unnecessary repetition while preserving important context.

================ IMPORTANT CONTEXT ================

${compressedConversation}

================ END CONTEXT ================

Continue the conversation naturally from this point.`;
}


// =========================================================
// AI SUMMARY PROMPT
// =========================================================

async function copyAISummaryPrompt() {

    const conversation =
    await getConversationText();

    if (!conversation) {

        showCopyStatus(
            "No conversation found."
        );

        return;
    }

    const prompt =
`You are continuing an existing conversation.

Create a concise but complete handoff summary for another AI.

IMPORTANT:
- Preserve the user's main goal.
- Preserve important requirements and preferences.
- Preserve decisions that have already been made.
- Preserve technical details, code, commands, filenames, settings and values when relevant.
- Preserve errors and failed attempts.
- Do not include greetings or unnecessary conversation.
- Do not invent information.
- Do not remove important context simply to make the summary shorter.

Return ONLY:

MAIN GOAL:
IMPORTANT DECISIONS:
USER REQUIREMENTS:
CURRENT STATE:
TECHNICAL DETAILS:
ERRORS / FAILED ATTEMPTS:
NEXT ACTION:

Here is the conversation:

================ CONVERSATION ================

${conversation}

================ END CONVERSATION ================

Now create the handoff summary.`;

    try {

        await navigator.clipboard.writeText(
            prompt
        );

        showCopyStatus(
            "✓ AI summary prompt copied!"
        );

    } catch (error) {

        console.error(
            "AI Token Tally:",
            error
        );

        showCopyStatus(
            "Copy failed."
        );
    }
}
    // =========================================================
    // COPY STATUS
    // =========================================================

    function showCopyStatus(
        message
    ) {

        const status =
            document.getElementById(
                "att-copy-status"
            );

        if (!status) {
            return;
        }

        status.textContent =
            message;

        setTimeout(() => {

            status.textContent =
                "";

        }, 2500);
    }


    // =========================================================
    // DOWNLOAD
    // =========================================================

   async function downloadConversation() {

        const text =
        await getConversationText();

        if (!text) {

            showCopyStatus(
                "No conversation found."
            );

            return;
        }


        const blob =
            new Blob(
                [text],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            "chatgpt-conversation.txt";


        document.body.appendChild(
            link
        );

        link.click();

        link.remove();


        URL.revokeObjectURL(
            url
        );


        showCopyStatus(
            "✓ Conversation downloaded!"
        );
    }


    // =========================================================
    // OPEN AI PLATFORM
    // =========================================================

  async  function openPlatform(
        platform
    ) {

        const conversation =
        await getConversationText();


        // Copy conversation first
        if (conversation) {

            navigator.clipboard
                .writeText(
                    conversation
                )
                .catch(() => {});
        }


        let url;


        switch (platform) {

            case "claude":

                url =
                    "https://claude.ai/new";

                break;


            case "gemini":

                url =
                    "https://gemini.google.com/app";

                break;


            case "chatgpt":

                url =
                    "https://chatgpt.com/";

                break;


            case "grok":

                url =
                    "https://grok.com/";

                break;


            default:

                return;
        }


        window.open(
            url,
            "_blank"
        );


        showCopyStatus(
            "✓ Conversation copied. Paste it into the new chat."
        );
    }


    // =========================================================
    // CONTINUE BUTTON CLICK
    // =========================================================

    continueButton.addEventListener(
        "click",
        () => {

            panel.style.display =
                "block";
        }
    );


    // =========================================================
    // CLOSE PANEL
    // =========================================================

    panel.querySelector(
        ".att-panel-close"
    ).addEventListener(
        "click",
        () => {

            panel.style.display =
                "none";
        }
    );


    // =========================================================
    // PLATFORM BUTTONS
    // =========================================================

    panel.querySelectorAll(
        ".att-platform"
    ).forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const platform =
                    button.dataset.platform;

                openPlatform(
                    platform
                );
            }
        );
    });


    // =========================================================
    // COPY BUTTON
    // =========================================================

    document.getElementById(
        "att-copy"
    ).addEventListener(
        "click",
        copyConversation
    );

// =========================================================
// CONTINUATION PROMPT FUNCTION
// =========================================================

async function copyContinuationPrompt() {

    const conversation = await getConversationText();

    if (!conversation) {
        showCopyStatus("No conversation found.");
        return;
    }

    const prompt =
`You are continuing an existing conversation from another AI chat.

IMPORTANT INSTRUCTIONS:

- Continue naturally from the previous conversation.
- Preserve the user's requirements, decisions, preferences, and technical context.
- Do not restart the conversation unnecessarily.
- Do not ask the user to repeat information already present below.
- Treat the context below as a conversation that has already happened.
- Preserve important code, errors, commands, file paths, URLs, and technical details.
- Answer the user's next message normally.

Here is the previous conversation:

================ CONVERSATION ================

${conversation}

================ END CONVERSATION ================

Continue the conversation naturally from this point.`;

    try {

        await navigator.clipboard.writeText(prompt);

        showCopyStatus(
            "✓ Continuation prompt copied!"
        );

    } catch (error) {

        console.error(
            "AI Token Tally:",
            error
        );

        showCopyStatus(
            "Copy failed."
        );
    }
}


// =========================================================
// DOWNLOAD BUTTON
// =========================================================

document.getElementById(
    "att-download"
).addEventListener(
    "click",
    downloadConversation
);
    // =========================================================
    // DOWNLOAD BUTTON
    // =========================================================

    document.getElementById(
        "att-download"
    ).addEventListener(
        "click",
        downloadConversation
    );

    // =========================================================
// CONTINUATION PROMPT BUTTON
// =========================================================

document.getElementById(
    "att-copy-prompt"
).addEventListener(
    "click",
    copyContinuationPrompt
);

    // =========================================================
// AI SUMMARY BUTTON
// =========================================================

document.getElementById(
    "att-ai-summary"
).addEventListener(
    "click",
    copyAISummaryPrompt
);

    // =========================================================
    // SETTINGS
    // =========================================================

    container.querySelector(
        ".att-settings"
    ).addEventListener(
        "click",
        () => {

            alert(
                "AI Token Tally\n\n" +
                `Context estimate: ${formatTokens(CONFIG.maxTokens)} tokens\n\n` +
                `Warning: ${CONFIG.warningPercent}%\n` +
                `High: ${CONFIG.highPercent}%\n` +
                `Critical: ${CONFIG.criticalPercent}%`
            );
        }
    );


    // =========================================================
    // INITIAL UPDATE
    // =========================================================

    setTimeout(
        updateCounter,
        2000
    );

// =========================================================
// MUTATION OBSERVER
// =========================================================

let updateTimeout = null;

const observer = new MutationObserver(() => {

    // Ignore mutations caused by our own conversation scanning
    if (
        isGettingConversation ||
        Date.now() < ignoreMutationsUntil
    ) {
        return;
    }

    clearTimeout(updateTimeout);

    updateTimeout = setTimeout(() => {

        if (
            isGettingConversation ||
            Date.now() < ignoreMutationsUntil
        ) {
            return;
        }

        updateCounter();

    }, 1000);

});
observer.observe(document.body, {
    childList: true,
    subtree: true
});
})();