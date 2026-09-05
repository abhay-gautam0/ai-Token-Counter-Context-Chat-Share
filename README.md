# AI Token Counter & Chat Share

> **Count tokens. Track context. Share and continue AI conversations.**

A Chrome extension that helps users track AI conversation token usage, monitor estimated context usage, and easily copy, share, download, or continue conversations across different AI platforms.

Currently designed for **ChatGPT**, with support for continuing conversations through **ChatGPT, Claude, Gemini, and Grok**.

---

## 📸 Preview

![Token Counter](screenshots/photo.png)

![Continue Panel](screenshots/photo1.png)

## Overview

Long AI conversations can become difficult to manage as they grow.

As a conversation gets longer, it becomes useful to know approximately how many tokens are being used and how much of the configured context limit has been consumed.

**AI Token Counter & Chat Share** provides a simple interface directly inside ChatGPT to:

- Estimate conversation token usage
- Monitor estimated context usage
- Receive context warnings
- Copy the entire conversation
- Generate a continuation prompt
- Generate an AI handoff-summary prompt
- Download the conversation
- Continue the conversation on another AI platform

The goal is to make long AI conversations easier to **track, transfer, and continue** without manually rebuilding the context from scratch.

---

# ✨ Features

## 🔢 Token Counter

The extension estimates the number of tokens contained in the accessible conversation text.

Features include:

- Real-time token estimation
- `o200k_base` tokenization
- Token count displayed directly in ChatGPT
- Automatic updates when the conversation changes
- Handles dynamically loaded conversation messages

## 📊 Live Interface

The token counter appears directly inside the ChatGPT interface and updates automatically as the conversation grows.

> **Screenshots:** Replace these placeholders with your own images after uploading them to the repository.

| Token Counter | Continue Panel |
|---|---|
| ![Token Counter](screenshots/token-counter.png) | ![Continue Panel](screenshots/continue-panel.png) |

---

## 📈 Context Usage

Instead of only showing the total number of tokens, the extension also estimates how much of the available conversation context has been used.

### Visual Context Meter

- 🟢 **0–69%** → Normal
- 🟡 **70–84%** → Warning
- 🟠 **85–94%** → High
- 🔴 **95–100%** → Critical

The progress indicator updates in real time and helps you decide when it's a good time to continue the conversation in a new chat.

---

## 🔄 Continue Conversation

A dedicated **Continue** button is always available, allowing you to manually move the current conversation to another AI platform without waiting for the context to become full.

### Supported Platforms

- ChatGPT
- Claude
- Gemini
- Grok

When a platform is selected, the extension:

1. Collects the current conversation
2. Copies it to the clipboard
3. Opens the selected AI platform
4. Lets you paste and continue seamlessly

---

## 📋 Built-in Productivity Tools

Besides token counting, the extension includes several tools for managing long conversations:

       | Feature |                    | Purpose |
| 📋 Copy Conversation |        |Copy the entire chat |
| ✨ Continuation Prompt  |     |Generate a prompt for another AI |
| 🧠 AI Summary Prompt |        |Create a structured handoff summary |
| 💾 Download Chat |            |Save the conversation as a `.txt` file |

These tools make it easy to preserve context instead of starting over whenever you switch chats or AI platforms.

---

# Installation for Development

1. Install Node.js.
2. Open the project folder in VS Code.
3. Open the terminal.
4. Install dependencies:
   npm install
5. Build the tokenizer:
   npx esbuild tokenizer-entry.js --bundle --format=iife --outfile=tokenizer-bundle.js
6. Open Chrome.
7. Go to:
   chrome://extensions
8. Enable Developer mode.
9. Click "Load unpacked".
10. Select the project folder.
11. Open ChatGPT and test the extension.