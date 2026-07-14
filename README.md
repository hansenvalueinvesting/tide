# Tide

A private, on-device period and cycle tracker.

Tide is a single, self-contained web app (`index.html`) that helps you track your
menstrual cycle — periods, phases, hormones, symptoms, mood, energy, and more — and turns
those logs into clear, personal insights about your body. It installs to your home screen,
works fully offline, and keeps **every byte of your data on your own device**.

---

## Why Tide exists

Most cycle-tracking apps run on someone else's servers. Your period dates, your sex life,
your moods, your symptoms — some of the most sensitive data a person has — get uploaded to
a company, tied to an account, mined for analytics, and, in too many cases, sold or handed
over. Tide is built on the opposite premise: **you should not have to trust a company with
this data at all.**

So Tide has:

- **No account.** There's nothing to sign up for.
- **No server.** There is no backend that could store, leak, or be subpoenaed for your data.
- **No analytics, no tracking, no telemetry.** Nothing watches how you use the app.
- **No data ever leaves your device** — unless *you* deliberately export it to a file.

Everything you log lives in your browser's local storage on the one device you logged it on.
You have full possession and full control: you can export it, move it, or erase it entirely
at any time, and none of that involves anyone but you.

> The only network request Tide ever makes is to load its two typefaces from Google Fonts on
> first open. That request carries none of your data, and if you're offline Tide simply falls
> back to a system font. Once installed, the app shell is cached and runs with no network at
> all.

---

## Getting started

1. Open `index.html` in any modern browser (or host the folder — `index.html` + `sw.js` — on
   any static web server or `https://` URL).
2. Tap **Daily check-in** and mark the first day of your period. That single fact is enough
   for Tide to start predicting your cycle; everything else sharpens the picture.
3. Optionally, **Add Tide to your home screen** (the install button, top-right) for a
   full-screen, offline app.

The more you log, the more personal and accurate Tide's predictions and insights become.

---

## The three pages

Tide has three tabs along the bottom: **Today**, **Your Body**, and **Settings**.

### Today — day-to-day logging and your body right now

The home screen. It answers *"where am I in my cycle, and what's going on with my body
today?"*

- **Cycle ring.** A circular map of your whole cycle, each day coloured by its phase
  (period, follicular, fertile, ovulation, luteal). A marker sits on today, and the centre
  shows your current cycle day and phase.
- **Header.** Restates your position in plain language — e.g. *"Day 3 of Luteal · Day 17 of
  this cycle."*
- **Daily check-in.** The primary action. Opens a sheet where you log **today** (or any day
  you tap in the calendar): whether it's a period day, whether you had sex, your **mood**
  (1–5), your **energy** (1–5), your **cervical discharge**, any **symptoms**, and a free-text
  **note**.
- **Hormones right now.** A compact meter for each of the four key hormones — **estrogen,
  progesterone, LH, FSH** — showing where each stands today and which way it's heading (e.g.
  *"High · falling," "At its peak"*). These are idealised curves scaled to *your* cycle, the
  same model behind "See the science."
- **What to expect.** A plain-language read of how you may feel in your current phase, plus
  symptom chips. Once you've logged enough, the chips become **your own** most-common symptoms
  for this phase; until then they're the typical ones for the phase.
- **This month (calendar).** A month grid with each day colour-coded by phase, projected
  future periods shown as a hatched pattern, a dot on any day you've logged, and a heart on
  any day you logged sex. Tap any day to log or edit it.
- **See the science.** Opens a detailed chart of the hormone cycle, the ovary's follicle, and
  the uterine lining — all aligned on one timeline and scaled to your data.

Today is about the **present and the immediate**. Long-run averages and predictions live on
the next tab.

### Your Body — your history and what's typical for you

The analytics tab. It answers *"what do my cycles look like over time?"*

- **Insights**
  - **What's coming** — your next predicted period and your fertile window, with countdowns.
  - **Cycle regularity** — a friendly verdict (*very regular → varies quite a bit*) based on
    how much your cycle length swings, with the actual range.
  - **Headline averages** — your average cycle length, average period length, and how many
    cycles you've logged.
  - **A typical cycle** — a colour-coded bar and breakdown of what an average cycle looks like
    for you, phase by phase.
- **Cycle history** — every cycle you've logged as an expandable card. Each shows its start
  (and end), its period and cycle length, and a phase-by-phase breakdown. Completed cycles use
  their real measured lengths; the current, in-progress cycle is projected from your averages.

### Settings — full control of your data

The data-ownership tab. Everything here is about *your* possession of *your* data.

- **Export a backup** — saves everything to a `.json` file on your device. This is the only
  copy that exists off the app, so keep it somewhere safe. It's also how you move your history
  to a new phone.
- **Import a backup** — restores from an exported file (this replaces the current data).
- **Erase everything** — permanently deletes all data on the device. Double-confirmed and
  irreversible.
- A standing **privacy note** restating that Tide stores everything on-device only, with no
  account, server, or analytics.

---

## How the calculations work

This is the heart of Tide. Everything below is derived **entirely from your logs** — there is
no external data and no server-side computation. If you've logged nothing, Tide falls back to
textbook defaults and says so; every number sharpens as you log more.

### What a log is

Each day you log is stored as one record, keyed by its date:

```
{ date, period, sex[], mood, energy, discharge, symptoms[], note }
```

- `period` — boolean, was this a bleeding day.
- `sex` — logged intimacy for the day.
- `mood`, `energy` — integers 1–5 (Awful→Great / Drained→Energized).
- `discharge` — one of `None · Sticky · Creamy · Egg-white · Watery` (a fertility signal).
- `symptoms` — any of `Cramps, Headache, Bloating, Tender breasts, Backache, Nausea, Fatigue,
  Cravings, Acne`.
- `note` — free text.

### The constants everything is anchored to

| Constant | Value | Meaning |
|---|---|---|
| `DEFAULT_CYCLE` | 28 | Assumed cycle length before you've logged two periods. |
| `DEFAULT_PERIOD` | 5 | Assumed period length before you've finished a period. |
| `LUTEAL` | 14 | Luteal-phase length — the stable gap from ovulation to the next period. |
| `FERTILE_PRE` | 5 | Fertile-window days **before** ovulation (sperm survival). |
| `FERTILE_POST` | 1 | Fertile-window days **after** ovulation (egg survival). |
| `FERTILE_MUCUS` | Egg-white, Watery | Discharge types that signal peak fertility. |

### Step 1 — Finding your periods

- **Period starts** are found by scanning every day you marked as a period and keeping those
  whose *previous* day was **not** a period day. Each such day is the first day of a period.
- **Period lengths** are counted by walking forward from each start over consecutive period
  days.
- **Completed period lengths** exclude the period you're currently in (it's still growing, so
  counting it would drag your average down).
- A period is considered **ended** once you log the day *after* its last bleeding day as a
  non-period day — so Tide knows the bleeding stopped without you pressing an "end" button.
- A period is considered **currently ongoing** only if it hasn't been ended *and* its last
  logged bleeding day is today or yesterday (an unlogged gap won't prematurely close it).

### Step 2 — Averages

- **Average cycle length** = the mean of the gaps between consecutive period starts. With
  fewer than two starts, it falls back to `DEFAULT_CYCLE` (28).
- **Average period length** = the mean of your *completed* period lengths, falling back to
  `DEFAULT_PERIOD` (5).

These two averages feed nearly every prediction below.

### Step 3 — Detecting ovulation

Ovulation is the anchor of the whole cycle, so Tide finds it two ways and prefers real
evidence over estimation:

1. **Observed (from your discharge logs).** Within the current cycle (after the period, up to
   today), Tide looks for days you logged **fertile mucus** (Egg-white or Watery). The **latest
   such day** is taken as ovulation, with **Egg-white winning over Watery** when both appear
   (egg-white is the peak-fertility sign).
2. **Estimated (from your cycle length).** If no fertile mucus is logged, ovulation is placed
   at `cycle length − LUTEAL` days after your last period start — i.e. Tide counts back the
   stable 14-day luteal phase from the predicted next period.

### Step 4 — Predictions

From your last period start (`ls`), average cycle (`cyc`), average period (`per`), and the
ovulation day above, Tide computes:

- **Ovulation day** — observed if available, otherwise estimated.
- **Fertile window** — from `FERTILE_PRE` (5) days before ovulation to `FERTILE_POST` (1) day
  after.
- **Next period** —
  - if ovulation was **observed**, it's fixed at `ovulation + LUTEAL` (14 days), because the
    luteal length is the reliable part of the cycle;
  - otherwise it's `last start + average cycle`.
- **Cycle day** — days since your last period start, plus one.

### Step 5 — Phases

Any date is classified into a phase in this order:

1. **Menstruation** — you logged it as a period day, *or* it's within the first `per` days of
   the cycle.
2. **Fertile window** — inside the fertile window (the ovulation day itself is labelled
   **Ovulation**).
3. **Luteal** — after ovulation.
4. **Follicular** — after the period but before the fertile window.

Phases genuinely overlap (the fertile window straddles the end of the follicular phase and the
start of the luteal phase), and the calendar draws such days as a diagonal split of both
colours. **Phase day** ("Day 2 of Luteal") is counted from the start of that phase, not the
start of the cycle.

### Step 6 — The cycle ring & calendar

- The **ring** draws one arc per day of your average-length cycle, colouring each by the phase
  that cycle-day falls in, and places a marker on today.
- The **calendar** colours each day by its phase blocks, and additionally projects **future
  periods**: the rest of the current period (unless you've marked it ended), plus up to three
  future cycles out, each drawn as a hatched "predicted" pattern. Logged days get a dot; days
  with sex get a heart.

### Step 7 — Hormones right now (Today)

Tide models four hormones as idealised curves over the cycle, each **scaled to your own cycle
length and ovulation day**:

- **Estrogen** — rises to a peak just before ovulation, with a smaller second rise mid-luteal.
- **LH** — a sharp surge right at ovulation.
- **FSH** — an early-cycle rise plus a small bump at ovulation.
- **Progesterone** — low until ovulation, then rises to a mid-luteal peak and falls before the
  period.

To render "Hormones right now," Tide samples each curve at **today's cycle day** and reports:

- a **level** (0–100%), bucketed into **Low / Moderate / High**, and
- a **trend** — comparing the day before and after — as **rising, falling, steady,** or
  **peaking** (a local maximum).

The same curves drive the "See the science" chart, alongside a modelled ovarian follicle and
uterine-lining thickness.

### Step 8 — What to expect (Today)

Two parts:

- **How you may feel** — a fixed, biology-based description for your current phase (e.g. luteal:
  progesterone dominates, energy tapers, PMS is common before the period).
- **Symptom chips** — Tide scans your **entire history**, classifies each past logged day into
  the phase it fell in *within its own cycle* (using that cycle's real length), and tallies the
  symptoms you logged during the current phase. Any symptom you've logged **twice or more** in
  this phase becomes a personalised chip ("You often log around now"). Until you have that
  history, Tide shows the **phase-typical** symptoms instead ("Common in this phase").

### Step 9 — Your Body insights

- **Regularity** compares your shortest and longest cycles. The spread (max − min) maps to a
  verdict: **≤2 days** very regular, **≤5** fairly regular, **≤9** a little irregular,
  **otherwise** varies quite a bit — reported as a range and a ± swing around your average.
- **Headline averages** surface average cycle length, average period length, and cycle count
  directly from Steps 1–2.
- **A typical cycle** and every **history card** lay out the phases proportionally for a given
  cycle length and period length: ovulation is placed at `cycle − LUTEAL` (bounded within the
  cycle), the fertile window `FERTILE_PRE` before to `FERTILE_POST` after it, menstruation over
  the first `per` days, follicular between the period and the fertile window, and luteal after
  ovulation. Completed cycles use their **measured** lengths; the current cycle uses your
  **averages**.

### Graceful degradation

- **Nothing logged:** Today invites you to check in and describes the general rhythm; the ring
  and predictions are empty; the science view shows a textbook 28-day cycle.
- **One period logged:** predictions begin (using default lengths); regularity waits for a
  second cycle.
- **Two or more periods:** real averages, regularity, and history kick in.
- **Discharge logged:** ovulation and the next-period prediction switch from estimated to
  observed, and get more accurate.

---

## Technical notes

- **One file.** The entire app is `index.html` — markup, styles, and logic. `sw.js` is the
  service worker used only for offline caching and desktop installability.
- **Storage.** Daily logs live in **IndexedDB** (`tide-db`, store `days`). A small amount of UI
  state (which "What's new" entries you've seen) lives in `localStorage`. Nothing else is
  persisted.
- **PWA.** The web manifest and app icons are generated in-browser at runtime; the service
  worker caches the app shell (network-first for the page so updates land when you're online,
  cache fallback when you're not). Google Fonts are fetched from the network and degrade to a
  system font offline.
- **No build step, no dependencies, no runtime libraries.** Open the file and it runs.

---

## Maintaining this README

This README is kept **in step with the app**. When a change alters what a page shows, how a
calculation works, the data model, or the privacy/storage behaviour, update the relevant
section here in the same change.
