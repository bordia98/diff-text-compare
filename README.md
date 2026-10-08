<div align="center">

# ⇄ Diff Compare

**A fast, free, side-by-side text & code comparison tool — 100% client-side.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bordia98.github.io-7C3AED?style=for-the-badge&logo=github)](https://bordia98.github.io/diff-text-compare/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![HTML](https://img.shields.io/badge/Built%20with-HTML%20%2F%20CSS%20%2F%20JS-orange?style=for-the-badge&logo=html5)](index.html)
[![No dependencies](https://img.shields.io/badge/Dependencies-None-blue?style=for-the-badge)](index.html)

[**→ Open Live App**](https://bordia98.github.io/diff-text-compare/)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Line-by-Line Diff** | Compare texts line by line using an LCS-based algorithm |
| 🔤 **Word-Level Diff** | Highlight exactly which words changed within a line |
| 🔡 **Character Diff** | Drill down to individual character-level changes |
| ↔️ **Split View** | Side-by-side original vs modified with synchronized scrolling |
| 📋 **Unified View** | Standard unified diff format with `+` / `−` line markers |
| ✨ **Inline Highlights** | Word-level green/red highlights inside changed lines |
| ⚙️ **Ignore Whitespace** | Strip leading/trailing whitespace before comparison |
| 🔠 **Ignore Case** | Case-insensitive comparison mode |
| 🖱️ **Drag & Drop** | Drop any text file directly onto either panel |
| 📤 **File Upload** | Load `.txt`, `.json`, `.js`, `.py`, `.md`, `.sql` and more |
| 📊 **Diff Stats** | Added, removed, unchanged count + similarity percentage |
| 📋 **Copy Diff** | Export the unified diff to clipboard |
| 🌙☀️ **Dark / Light Theme** | Toggles with a single click; preference is saved |
| 🔒 **100% Private** | Nothing is ever sent to a server or stored anywhere |

---

## 🚀 Getting Started

No build step, no dependencies, no server needed.

```bash
# Clone the repo
git clone https://github.com/bordia98/diff-text-compare.git
cd diff-text-compare

# Open directly in your browser
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or visit the live site: **[bordia98.github.io/diff-text-compare](https://bordia98.github.io/diff-text-compare/)**

---

## 🗂️ Project Structure

```
diff-text-compare/
├── index.html      # App shell — semantic HTML, all SEO meta tags
├── style.css       # Design system — dark/light themes, animations, responsive
├── app.js          # All logic — LCS diff engine, rendering, interactions
├── robots.txt      # Search engine crawl rules
├── sitemap.xml     # XML sitemap for discoverability
└── LICENSE         # MIT License
```

---

## 🛠️ How It Works

The diff engine uses a **Longest Common Subsequence (LCS)** algorithm — the same approach as Unix `diff` and Git.

```
Original text            Modified text
      │                        │
      ▼                        ▼
   Tokenize (line / word / char)
              │
              ▼
      LCS(original, modified)
              │
              ▼
   Generate diff ops: equal | add | remove
              │
         ┌────┴────┐
         ▼          ▼
   Split view   Unified view
  (2 columns)  (1 column +/-)
```

For word-level diffs, a second pass runs LCS on adjacent changed lines to produce inline `<mark>` highlights. Everything runs in the browser with **zero network requests**.

---

## 🌐 Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under *Branch*, choose `main` and folder `/ (root)`.
4. Click **Save** — your site will be live at `https://bordia98.github.io/diff-text-compare/` in ~1 minute.

No CI/CD needed — it's just static files.

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Open a Pull Request

Please keep the code vanilla HTML/CSS/JS — no frameworks or build tools.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Made with ❤️ by [bordia98](https://github.com/bordia98) · No data is ever stored or sent anywhere

</div>
