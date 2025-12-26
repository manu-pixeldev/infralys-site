# Template Engine – Professional Website Builder

Modular website template engine built with **Next.js** and **Tailwind CSS**, designed to generate professional service websites from a configurable structure.

This project focuses on **clean architecture**, **reusable sections**, and a **live configuration panel** to adjust layout, branding, and content in real time.

---

##  Features

-  Built with **Next.js (App Router)** and **React**
-  **Tailwind CSS** design system
-  Modular section-based architecture (Hero, Split, Services, Team, Galleries, Contact…)
-  Centralized **Template Engine**
-  Live **Studio Panel** for:
  - Theme selection
  - Layout density & container width
  - Radius & UI tokens
  - FX toggles (ambient, soft glow, etc.)
  -  Responsive & production-oriented layouts
  -  Scroll-aware navigation with active section tracking

---

##  Architecture Overview

# infralys-site
Reusable website templates for professional service companies, powered by a custom template engine. Includes Hero, Services, Proof, Team, Gallery, and Contact sections with live editing and theme customization.

app/
└─ components/
└─ template-engine/
├─ template-engine.tsx # Core engine
├─ variants.ts # Section → variant mapping
├─ theme.ts # Design tokens & utilities
├─ legacy.tsx # Stable section implementations
├─ studio-panel.tsx # Live editor UI


Each section:
- Is isolated
- Receives a normalized config
- Can have multiple variants
- Respects global layout tokens

---

##  Current Status

-  Functional and usable
-  Under active development
-  Some layout/FX interactions still being refined (header spacing, ambient effects)

This repository is **not a finished product**, but a **solid foundation** for:
- Professional websites
- Internal tools
- White-label template systems

---

##  Getting Started

```bash
npm install
npm run dev

