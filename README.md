# Rubber Manager 🌿

A mobile-first web app and Progressive Web App (PWA) designed specifically for managing finances, expenses, and worker payments for a rubber plantation business.

---

## 🌟 Key Features

- **📱 Mobile-First PWA**: Installable directly on Android, iPhone, and desktop with offline support.
- **💰 Financial Tracking**:
  - **Business Income**: Record sales of rubber sheets (RSS-1 to RSS-4), centrifuged field latex, scrap rubber, and cup lumps.
  - **Employee Expenses**: No fixed salary system — record actual task-based payments to tapping and smoke house workers.
  - **Travel Expenses**: Track person, date, route/road (e.g. *Alanallur → Mannarkkad*), purpose, and fuel/fares.
  - **Goods / Purchases**: Expense tracking for rubber acid, tapping knives, latex collection cups, and packing supplies.
  - **Other Expenses**: Track refreshments (tea/coffee/sugar), LED bulbs, repairs, cleaning, utilities, and communication.
- **📊 Reports & Breakdown**:
  - Net Balance calculation (`Income - Expenses`).
  - Category distribution bars with percentages.
  - Employee-wise payment rankings with individual payment history profiles.
- **⚡ 100% Offline & Local**: All data is securely stored in `LocalStorage` with JSON backup export and import. Zero external CDN icon dependencies (all inline SVGs).

---

## 🚀 Live Demo on GitHub Pages

This repository is ready to be hosted directly on **GitHub Pages**:
1. Go to your repository settings on GitHub: `Settings` $\rightarrow$ `Pages`.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
3. Select branch `main` and folder `/ (root)`, then click **Save**.
4. GitHub will give you a free **HTTPS** link (e.g. `https://hanan-kzzz.github.io/rubber-app/`).
5. Open that HTTPS link on your mobile phone to get the native 1-tap **"Install App"** prompt!

---

## 💻 Tech Stack

- HTML5
- CSS3 (Modern dynamic viewport `100dvh`, CSS Variables, Glassmorphism, Responsive Mobile Shell)
- Vanilla JavaScript (ES6+, Service Worker, LocalStorage, PWA Web Manifest)
- Inline SVG Icons (Zero external font or icon libraries)
