---
version: "3.0"
name: "Framed Sheet · Slate & Teal"
description: "Enterprise HR & Payroll operating surface built on an L-shaped cool slate frame (#f4f6f8), an inset crisp white work sheet (#ffffff), Deep Petrol Teal (#1b6c80) data & action accents, and IBM Plex typography."
colors:
  ground-light: "#f4f6f8"
  surface-light: "#ffffff"
  raised-light: "#f8f9fb"
  active-light: "#ebedef"
  border-light: "#e6e8eb"
  rule-light: "#eef0f2"
  control-light: "#cdced1"
  ink-primary-light: "#131416"
  ink-secondary-light: "#5d5f60"
  ground-dark: "#0c0e10"
  surface-dark: "#121518"
  raised-dark: "#171b1f"
  border-dark: "#22262b"
  ink-primary-dark: "#f2f4f7"
  ink-secondary-dark: "#9ba3b0"
  accent-primary: "#1b6c80"
  accent-hover: "#155666"
  accent-tint: "#eaf4f7"
  status-positive: "#1e7b4f"
  status-warning: "#92400e"
  status-negative: "#c4242a"
  scrollbar-light: "#d4d4d8"
  scrollbar-dark: "#3f3f46"
  scrollbar-hover: "#52525b"
  print-ink: "#000000"
typography:
  font-sans: "IBM Plex Sans, -apple-system, BlinkMacSystemFont, sans-serif"
  font-mono: "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace"
  title-size: "1.375rem"
  section-size: "1rem"
  kpi-size: "1.75rem"
  body-size: "0.875rem"
  small-size: "0.75rem"
spacing:
  unit: "4px"
  sheet-inset: "8px"
  gap: "24px"
  pad: "24px"
rounded:
  control: "6px"
  card: "8px"
  squircle: "0.625rem"
  lg: "12px"
  sheet: "16px"
  pill: "9999px"
---

# NexusHR — Framed Sheet · Slate & Teal Design System

## Overview
NexusHR uses the **Framed Sheet** architecture distilled from real-world enterprise operations software (`references/app-screens.md` in `taste-skill v2`). The application chrome (Sidebar + 48px Topbar) forms one unified L-shaped slate frame (`#f4f6f8`) with no divider line between them. All operational work sits on a crisp white sheet (`#ffffff`) inset `8px` from the viewport's right and bottom edges with a `1px solid #e6e8eb` edge, `16px` corners, and zero rest shadow.

## Colors
- **Under 3% Chrome Budget:** The outer frame and navigation remain quiet slate/neutral grey (`#f4f6f8` ground, `#5d5f60` muted ink, `#131416` active ink).
- **Deep Petrol Accent (`#1b6c80`):** Replaces generic framework blue across primary buttons, active 2px indicators, and primary chart/data series.
- **Semantic Status Pills:** High-contrast, low-saturation pills for legal/operational states (`#dcfae5` / `#04250e` positive, `#fffbeb` / `#92400e` warning, `#ffedea` / `#831c1e` negative).

## Typography
- **Primary Voice (`IBM Plex Sans`):** Weights 400, 500, 600. Clear, editorial-grade legibility for Vietnamese diacritics, labor contract clauses, and financial tables.
- **KPI Figures:** Set at `28px–32px` with regular/medium weight (`400–500`) and `tabular-nums`, avoiding heavy bold cartoon numbers.
- **Literal Codes (`IBM Plex Mono`):** Reserved strictly for employee IDs, contract codes (`HDLD-...`), tax/insurance rates, and timestamps.

## Layout & Components
- **L-Shaped Frame + Inset Sheet:** `228px` sidebar and `48px` top bar share `#f4f6f8`; `<main>` is inset `8px` on right and bottom with `16px` border-radius.
- **Unified KPI Strip:** Related metrics sit inside a single horizontal container divided by `1px` vertical hairlines rather than scattered icon cards.
- **Sheet-Native Tables:** Tables sit directly on the white sheet with sentence-case `12px–13px` grey headers, `48px` row pitch, `1px` horizontal rules, and right-aligned tabular numerals.
