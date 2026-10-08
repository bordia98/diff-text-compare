# Contributing to Diff / Text Compare

Thank you for your interest in contributing to **Diff / Text Compare**! We welcome bug reports, feature suggestions, documentation improvements, and code contributions from everyone.

---

## 🌟 Guiding Principles

1. **100% Client-Side & Private**: All computation must run strictly inside the user's browser. Never introduce remote endpoints, tracking scripts, third-party analytics, or external data transmission.
2. **Zero Dependencies**: Keep the application lightweight, fast, and static. Use modern vanilla HTML5, CSS3, and ES6+ JavaScript.
3. **Accessibility & Polish**: Ensure smooth UX, keyboard navigability, responsive layouts across devices, and clean visual themes (light by default with dark mode support).

---

## 🛠️ Local Development

No package managers, compilers, or build steps are required.

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/bordia98/diff-text-compare.git
   cd diff-text-compare
   ```

2. **Open locally in your browser:**
   - Double-click `index.html`, or
   - Start a local server:
     ```bash
     # Python 3
     python3 -m http.server 8000

     # Node.js
     npx serve .
     ```

3. **Navigate to:** `http://localhost:8000`

---

## 🚀 Submitting Contributions

1. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit Your Changes:**
   Write clear, concise commit messages following standard conventions:
   ```bash
   git commit -m "Add feature: support XYZ formatting option"
   ```
3. **Push to Your Fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
4. **Open a Pull Request:**
   Submit a PR against the `main` branch with a description of the changes and testing steps.

---

## 🐛 Reporting Bugs

If you find a bug:
- Check existing GitHub Issues to see if it has already been reported.
- If not, create a new issue detailing:
  - Browser and OS version.
  - Steps to reproduce the problem.
  - Expected vs actual behavior.
  - Console error messages or screenshots (if applicable).

---

## 📄 License

By contributing to this repository, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
