# Tide — working notes for Claude

Tide is a private, on-device period & cycle tracker. The **entire app is `index.html`**
(markup + CSS + JS in one file); `sw.js` is only the offline/install service worker.

## Keep the README in sync

`README.md` documents the app's goal, how each page works, and — exhaustively — how the
calculations turn logs into predictions and insights. **Whenever a change affects any of the
following, update the matching README section in the same change:**

- what a page (Today / Your Body / Settings) shows or does,
- the data model (the shape of a daily log record),
- any calculation (period detection, averages, ovulation, predictions, phases, hormones,
  symptom personalisation, regularity, calendar projection),
- the constants table (`DEFAULT_CYCLE`, `LUTEAL`, `FERTILE_PRE`/`POST`, etc.),
- privacy or storage behaviour (on-device only, IndexedDB, no network except Google Fonts).

## House style

- Privacy is the core promise: no account, no server, no analytics, no data leaves the device
  except a user-initiated export. Don't add anything that violates this without flagging it.
- User-facing changes get a new entry at the **top** of the `UPDATES` array in `index.html`
  (next `id` up, Boston/Eastern timestamp, tag `New` / `Improved` / `Fix`).
