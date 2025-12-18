# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands
This repo is a Create React App (CRA) frontend using CRACO + Tailwind.

Package manager: `npm` (has `package-lock.json`).

- Install deps:
  - `npm ci`
  - or `npm install`
- Run dev server (CRA):
  - `npm start`
  - App will be served on http://localhost:3000
- Production build:
  - `npm run build`
  - Output: `build/`
- Tests (Jest via CRA):
  - `npm test`
- Run a single test file:
  - `npm test -- src/App.test.js`
- Run a single test by name (Jest pattern):
  - `npm test -- -t "<test name substring>"`
- Non-interactive tests (CI-style):
  - `npm test -- --watchAll=false`

Linting note: ESLint is the CRA default (`eslintConfig` in `package.json`). There is no dedicated `lint` script; linting runs during `npm start` (overlay) and typically during `npm run build`.

## Architecture overview (big picture)
### Entry points
- `src/index.js` bootstraps React and renders `src/App.js`.
- `src/App.js` is the app “shell”: it owns global state, the single Socket.IO connection, and page switching.

### UI/page structure (state-driven routing)
There is no React Router wiring right now; navigation is controlled by `currentPage` state in `src/App.js`.

Main screens live directly under `src/`:
- `HomePage.js`: landing/queue UI + notification bell + inbox entry point.
- `ChatPage.js`: chat UI for both random chats and friend chats.
- `InboxPage.js`: friends list + unread badges; selecting a friend opens a friend chat.

Components:
- `src/components/SignupForm.js`: “signup gate” (collects gender/country) shown until `currentUser` is set.
- `src/components/ProfileModal.js`: modal used from `ChatPage` to show user info.

Other pages exist but are not currently wired from `App.js`:
- `ProfilePage.js`, `FriendsInboxPage.js` (appear to be older/alternate implementations).

### Backend integration
Two channels are used:
1) REST API wrapper in `src/api.js` (fetch-based)
2) Realtime Socket.IO events (client created in `src/App.js`, passed down as `socket`)

Important: the backend base URL is hard-coded in multiple places:
- `src/api.js` (`API_BASE_URL`)
- `src/App.js` (`BACKEND_URL`)
- `src/FriendsInboxPage.js` also hard-codes the URL (if you ever re-enable it)

If you need to point to a local/staging backend, update those constants (or refactor to a single env-driven config).

### Chat flows
`src/ChatPage.js` supports two modes:
- Random chat (queue/matching):
  - UI triggers `api.joinQueue(userId)` / `api.leaveQueue(userId)`.
  - `App.js` listens for `chat-paired` and switches into `ChatPage` with `initialChatData`.
  - Messages are sent via socket event `send-message`; incoming messages come via `new-message`.
- Friend chat:
  - `InboxPage` computes a deterministic chat id: `friend_${sorted([currentUserId, friendId]).join('_')}` (same logic as `src/utils/chatUtils.js`).
  - `ChatPage` uses `api.getFriendChatMessages(chatId)` to load history and `api.sendFriendMessage(...)` for persistence.
  - `ChatPage` listens for `friend-message-received` to append realtime messages.

Unread counts:
- `App.js` maintains a global `unreadCount` badge used on Home/Chat.
- `InboxPage.js` shows per-friend unread counts via `api.getUnreadCount(...)` and updates counts on `friend-message-received`.

Friend requests/notifications:
- `HomePage.js` and `ChatPage.js` both poll `api.getFriendRequests(currentUserId)` and react to socket events.
- `App.js` also listens for `friend-request-accepted` and pushes a global notification.

### Styling/tooling
- CRA is customized via CRACO:
  - `craco.config.js` wires PostCSS plugins (`tailwindcss`, `autoprefixer`).
  - `tailwind.config.js` controls Tailwind content scanning.
  - Tailwind directives are in `src/index.css`.
- Note: `public/index.html` also includes the Tailwind CDN script and a CSP that allows it. If Tailwind behaves unexpectedly, check whether styles are coming from the compiled pipeline vs the CDN script.