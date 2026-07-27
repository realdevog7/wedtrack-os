# 💖 WedTrack OS — Master MVP Documentation & Architecture Guide

**WedTrack OS** is an enterprise-grade, all-in-one digital wedding planning operating system designed to replace fragmented spreadsheets, generic note apps, and endless email chains. Built for modern couples, professional wedding planners, and digital product creators (such as Etsy shop owners), WedTrack OS delivers a stunning, responsive, and real-time interactive web suite that streamlines every phase of the wedding journey.

---

## 🌟 1. Executive Summary & Value Proposition

Wedding planning traditionally involves juggling dozens of vendor contracts, guest lists, seating charts, dietary restrictions, budgets, and RSVP tracking across disconnected tools. **WedTrack OS** solves this by unifying the entire planning workflow into a single, beautifully designed application.

### Key Highlights:
- **Offline-First & Cloud-Synced Architecture**: Built on a hybrid `localStorage` + Firebase Firestore synchronization engine, ensuring instantaneous UI rendering with zero latency, while seamlessly backing up data to the cloud.
- **Etsy & Digital Creator Ready**: Features a built-in whitelisted authentication suite and standalone seller tools that allow digital shop owners to securely sell access to the platform without managing complex backend servers.
- **Universal Multi-Currency Support**: Dynamic currency formatting supporting over 40 global currencies (USD, EUR, GBP, INR, JPY, AUD, CAD, AED, and more), automatically formatting symbols across all dashboards, budget calculators, vendor quotes, and PDF exports.
- **Modern Aesthetics & Ergonomics**: Utilizes curated glassmorphism, responsive mobile layouts, smooth micro-animations, and intuitive drag-and-drop interfaces.

---

## 🔐 2. Authentication & Access Architecture (The Etsy Seller Suite)

WedTrack OS includes a proprietary authentication and licensing system designed specifically for digital product distribution.

### 🛡️ Whitelisted Email & Auto-Password System
- **Automated Credential Generation**: Instead of requiring manual signup and database provisioning, the system generates unique, deterministic passwords (e.g., `Sarah#2027`, `42-Sarah!`, `Wed@sarah85`) based on the buyer's email address hash using `generateAutoPassword()`.
- **Multi-Layer Verification**: When a user attempts to log in on Step 0 (Account Access), the system validates credentials against:
  1. Default developer/testing whitelists.
  2. Local browser storage cache for rapid offline authentication.
  3. Live Firebase Firestore `whitelisted_users` collections populated by Google Forms or Etsy Apps Script webhooks.
- **Seamless Session Recovery & Relogin**: Users who have already configured their wedding can log out and log back in (or click *"Already configured your wedding? Skip directly to Dashboard"*) without overwriting custom guest lists, budgets, or timeline details.

### 🔑 Admin Test Panel & Overrides
- Includes a hidden Admin testing portal accessible via PIN (`etsy2026`) that allows store owners or planners to simulate buyer logins, bulk-add email whitelists via text/CSV paste, and revoke user access in real time.

---

## 🚀 3. Core Modules & Basic Features

### 🎯 Interactive Onboarding Wizard
A 5-step guided setup that tailors the application to the couple's specific event:
1. **Account Access**: Credential verification against the buyer whitelist.
2. **The Couple**: Captures Partner 1 and Partner 2 names and contact details.
3. **Wedding Date & Venue**: Sets the countdown target date, venue name, address, and seasonal styling (Spring, Summer, Autumn, Winter).
4. **Budget & Priorities**: Defines initial budget targets, financial flexibility (Strict, Moderate, Flexible), and top priorities (Photography, Catering, Venue, etc.).
5. **Collaborators**: Assigns planning roles (Owner, Editor, Viewer) to partners, planners, or family members.

### 📊 Executive Dashboard
The central mission control for day-to-day planning:
- **Live Countdown Timer**: Real-time days, hours, and minutes remaining until the wedding ceremony.
- **Budget Utilization Widget**: Quick visual progress bar comparing total quoted vendor costs against the master budget cap.
- **RSVP Pulse Chart**: Instant summary of Confirmed, Declined, and Pending guest invitations.
- **Priority Action Items**: Highlighted upcoming tasks and overdue milestones requiring immediate attention.
- **Activity Stream**: Chronological system log tracking guest additions, RSVP submissions, vendor updates, and budget modifications.

### 👥 Guest List & RSVP Management (`/guests`)
A complete CRM for wedding attendees:
- **Comprehensive Guest Profiles**: Track names, email addresses, phone numbers, party affiliations (Bride's Side, Groom's Side, Mutual), plus-one allowances, and attendance status.
- **Dietary & Meal Tracking**: Assign specific meal selections (Standard, Vegetarian, Vegan, Gluten-Free, Halal, Kosher) and record allergy notes for catering coordination.
- **Table Assignment Status**: Visual indicators showing whether a guest has been assigned a seat in the floor plan.
- **Bulk CSV Import & Export**: Import hundreds of guests instantly from Excel/CSV templates or export the clean guest list for calligraphers and coordinators.

### 🌐 Shareable Public RSVP Portal (`/rsvp`)
A dedicated, guest-facing web portal that couples can share via link or QR code:
- **Live Guest Search**: Guests type their name to instantly locate their invitation and attached plus-ones.
- **Interactive Submission Form**: Guests confirm attendance, select meal preferences, and submit custom dietary notes directly into the couple's live database.
- **Optional 4-Digit PIN Protection**: Couples can enable PIN security in Settings to prevent uninvited strangers from accessing the RSVP portal or submitting unauthorized responses.
- **Instant Link Generation**: Includes a one-click *"Copy Public RSVP Link"* button in the Guest header.

### 📅 Wedding Timeline & Checklist (`/timeline`)
An organized planning roadmap structured by timeframes:
- **Pre-Populated Milestones**: Includes industry-standard checklists organized from 12+ Months Out down to the Week Of and Wedding Day.
- **Priority & Status Tracking**: Tag tasks with Priority badges (High, Medium, Low), due dates, and completion checkboxes.
- **Custom Task Creation**: Add custom errands, assign responsibilities to specific collaborators, and filter tasks by category or completion status.

---

## 💎 4. Advanced & Enterprise Features

### 💰 Precision Budget Tracker & Multi-Currency Engine (`/budget`)
A financial controller designed to keep wedding spending strictly on track:
- **Universal Currency Formatting**: Fully integrated with over 40 international currencies. Selecting Indian Rupee (`₹`), Euros (`€`), British Pounds (`£`), or Japanese Yen (`¥`) instantly updates every form label, table header, input prefix, and summary card across the entire operating system.
- **Category Breakdown & Variance Analysis**: Track Estimated vs. Quoted vs. Actual Paid amounts across categories (Venue, Catering, Attire, Decor, Music, Photography, etc.).
- **Interactive Tip & Gratuity Calculator**: A built-in service calculator that estimates recommended tipping amounts for 15+ vendor categories (e.g., 15-20% for catering/bartenders, flat fees for delivery drivers) with customizable percentage toggles.
- **Visual Expense Distribution**: Colorful progress bars and pie charts illustrating exactly where the budget is allocated.

### 🪑 Automated AI-Style Table Seating Arranger (`/seating`)
An intuitive layout planner for reception dining:
- **Visual Floor Plan Builder**: Create custom round, rectangular, or head tables with configurable seat counts.
- **Interactive Drag-and-Drop**: Drag unassigned guests directly onto table seats with instant occupancy badges.
- **Smart Auto-Seating Algorithm**: Features a one-click *"Run Auto-Seating"* engine that intelligently groups guests by party affiliation (Bride's family, Groom's friends, Mutual colleagues) and automatically assigns them to optimal tables.

### 🤝 Vendor Hub & Quote Comparison Engine (`/vendors`)
A procurement suite for sourcing and managing wedding professionals:
- **Vendor Directory**: Organize contacts by category (Venue, Photographer, Videographer, Florist, DJ/Band, Cake, Officiant, Hair & Makeup).
- **Side-by-Side Quote Comparison**: Track quoted costs against budgeted estimates and monitor payment statuses (Unpaid, Deposit Paid, Fully Paid).
- **Interactive Communication Log**: Record detailed notes and timestamps of every vendor interaction, categorized by Email, Phone Call, or In-Person Meeting.
- **Contract & Website Linking**: Store direct URL links to vendor portfolios, price sheets, and signed contracts.

### ✉️ Email Automation & Campaign Engine (`/automation`)
A communication broadcast system for engaging guests:
- **Pre-Built Campaign Templates**: Design Save-the-Dates, RSVP Reminders, Venue Direction details, and Thank You notes.
- **Dynamic Merge Tags**: Automatically personalize outbound emails with tags like `{guest_name}`, `{wedding_date}`, `{venue_name}`, and `{rsvp_link}`.
- **Audience Targeting**: Filter recipients by RSVP status (e.g., send reminders *only* to guests with "Pending" RSVPs).

### 📈 Analytics & Master PDF Report Generator (`/analytics`)
Business intelligence and print-ready documentation for coordinators:
- **Visual Data Charts**: Deep-dive analytics into RSVP response rates, dietary restriction distributions, budget spending curves, and task completion velocity.
- **One-Click Master PDF Compilation**: Utilizes `jsPDF` and `html2canvas` to compile high-resolution, multi-page PDF documents:
  - **Master Wedding Report**: Covers project details, full guest lists, table arrangements, timeline checklists, and budget summaries.
  - **Standalone Vendor Sheet**: Print-ready contact lists and payment schedules for day-of coordinators.
  - **Budget & Expense Summary**: Clean financial audits with dynamically formatted currency symbols.

### 📁 Digital Document & Contract Vault (`/files`)
A centralized cloud file repository:
- Store and categorize important documents (Contracts, Invoices, Seating Floor Plans, Menu Proofs, Mood Boards).
- Filter files by tag, view file size and upload dates, and open direct download links.

---

## ⚙️ 5. Security, Settings & Data Governance (`/settings`)

The Settings module gives couples total control over their data and privacy:
- **Project Metadata Management**: Modify partner names, wedding date, venue locations, and timezones at any time.
- **Security & Privacy Shield**: Enable, disable, or change the 4-digit PIN required to access the Public RSVP portal.
- **Currency & Localization Standards**: Switch between global currency standards with instant system-wide reflection.
- **Account Session Management**: Includes prominent **Log Out** buttons in both the Settings Header and Security tab to safely terminate sessions without data loss.
- **Danger Zone (Global Data Reset)**: A safeguarded 2-step confirmation modal that allows users to wipe custom databases and restore the clean initial sample dataset for fresh testing or re-planning.

---

## 🛍️ 6. Seller & Creator Tooling (Etsy Ecosystem)

Located in `/seller-tools`, WedTrack OS provides standalone HTML/JS utilities for digital shop owners:
- **`Etsy-Seller-Dashboard.html`**: A plug-and-play offline portal for store owners to:
  - Generate instant buyer passwords and instructions for customer messages.
  - Generate automated Google Apps Script code to connect Google Forms directly to Firebase Firestore.
  - Manage whitelist records without needing a backend server or command-line tools.

---

## 🛠️ 7. Technology Stack Summary

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & UI Design** | Vanilla CSS, Glassmorphism, Dark Mode, Tailwind Utility Classes |
| **Icons & Typography** | Lucide React, Google Fonts (Inter, Serif headers) |
| **Data Synchronization** | Hybrid LocalStorage Cache + Firebase / Firestore Cloud Sync |
| **Data Export & Reports** | jsPDF (PDF generation), html2canvas (UI rendering), PapaParse (CSV processing) |
| **State Management** | React Context API (`WeddingContext`), Custom Hooks |

---
*Documented for WedTrack OS v1.0.0 — The Ultimate Agentic Wedding Planning Suite.*
