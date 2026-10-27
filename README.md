# BRAINCheck redesign (concept prototype)

An unofficial UI/UX exploration of the public **ABCDx BRAINCheck App Instructions for Use** (ABC-IFU-001 v1.0, July 2022).
It rebuilds the documented flow in React Native / Expo with a cleaner, glove-friendly interface.

> **Not a medical device.** Synthetic data only, simulated camera, no clinical claims.
> Not affiliated with or endorsed by ABCDx. The network glyph is an original drawing, not their logo.

## What it covers

| IFU section | Screen |
|---|---|
| 7.1 Tutorial | 4-slide onboarding with skip and "don't show again" |
| 7.2 Test instructions | New test (lot, patient ID, optional DOB) and 5 guided sample steps with illustrations |
| 7.3 Incubation and scanning | 15-minute timer, red warning in the last 2 minutes, 5-minute scan window, timed-out state, skip-timer confirmation |
| 7.3 Scan | Simulated alignment grid that turns green and scans automatically |
| 7.4 Reviewing results | Valid / Invalid / Incomplete, units, "<" and ">" display at range limits, 30-day auto-delete |
| 8 About | Support, privacy, terms and regulatory rows (inert in the prototype), plus an English / Español switch |

## Design decisions

- **Status is never colour alone.** Every state pairs an icon with text (Valid, Incomplete, Invalid).
- **Large touch targets** (58 px buttons, 56 px fields) for gloved use.
- **One task per screen** in the guided steps, with the critical warning (exact drop counts, wait for absorption) in a callout.
- **Timer as the primary object.** The ring drains, turns red in the last 2 minutes, then green for the scan window, with a timeline showing all three phases.
- **No interpretation.** Results show where a value sits in the measuring range. The prototype does not label values normal or abnormal, in line with the intended-use statement.
- **Deviation is visible.** A skipped timer is flagged on the result.
- **English and Spanish.** The language follows the device locale and can be switched in About. Strings live in one typed dictionary (`src/i18n.ts`), so a missing Spanish key fails the typecheck, and a test checks that placeholders match in both languages. The Spanish text is a draft and should be reviewed by a native clinical reviewer before any real use.

## Run it

```bash
npm install
npm run web        # browser, shown in a phone-sized frame
npm start          # Expo dev server for iOS / Android
npm test           # domain logic
npm run typecheck
```

The **Prototype controls** card on the home screen speeds up the timer (30x, 60x) and picks the simulated scan outcome (valid, out of range, incomplete, invalid).

## Architecture

```
src/domain/    pure, tested logic: timer phases, result classification, formatting, retention
src/state/     one reducer + context; a ticker advances the active test
src/components/ UI primitives, illustrations, timer ring, range gauge
src/screens/   one file per screen
```

Domain logic has no React or React Native imports, so it can be reused or verified on its own.

## Traceability (requirements to tests)

| ID | Requirement (source) | Test |
|---|---|---|
| REQ-TIMER-01 | Incubation is 15 minutes (IFU 7.3) | `timer.test.ts` incubating phase |
| REQ-TIMER-02 | Timer turns red 2 minutes before the end (IFU 7.3) | `timer.test.ts` warning phase |
| REQ-TIMER-03 | Scan is available for 5 minutes after incubation (IFU 7.3) | `timer.test.ts` scanReady phase |
| REQ-TIMER-04 | After 20 minutes the cassette must be discarded (IFU 7.3) | `timer.test.ts` expired phase |
| REQ-TIMER-05 | Timer can be skipped and the result flags it (IFU 7.3) | `timer.test.ts` skip unlocks scan |
| REQ-RESULT-01 | Valid: both markers valid (IFU 7.4) | `results.test.ts` classification |
| REQ-RESULT-02 | Incomplete: one marker valid (IFU 7.4) | `results.test.ts` classification |
| REQ-RESULT-03 | Invalid: neither marker valid (IFU 7.4) | `results.test.ts` classification |
| REQ-RESULT-04 | Values outside the measuring range show as "<min" / ">max" (IFU 11) | `results.test.ts` formatting |
| REQ-RESULT-05 | Results are deleted after 30 days (IFU 7.4) | `results.test.ts` retention |

## Not implemented (on purpose)

Real camera capture and image analysis, device allow-listing, audible alarm (a vibration pattern is used on devices), persistent storage (including the language choice), cloud sync, authentication, further languages, accessibility audit, and any regulated-software lifecycle work (risk file, verification and validation records).

## Source

All behaviour and numbers come from the public IFU. Reference values are shown as the IFU states them, with its note that each laboratory sets its own.
