# Contributing to ATS Resume Builder

Welcome, and thank you for your interest in contributing! Whether you are fixing a typo, correcting a bug, or adding a new feature, your help is greatly appreciated. 

If you are new to open-source development or Git, don't worry! This guide will walk you through the process step-by-step.

---

## 1. Prerequisites (Tools You Need)
Before you begin, make sure you have the following installed on your computer:
* **Node.js** (which includes `npm` for managing project packages): [Download Node.js](https://nodejs.org/)
* **Git**: [Download Git](https://git-scm.com/)
* **A Code Editor**: [Visual Studio Code (VS Code)](https://code.visualstudio.com/) is recommended.

---

## 2. Setting Up Your Local Workspace

To work on the project on your own computer, follow these steps:

1. **Fork the Repository:** 
   Go to the top right of the main [ATS Resume Builder GitHub page](https://github.com/P-Chatz/ats-resume-builder) and click the **Fork** button. This creates your own personal copy of the project on GitHub.
2. **Clone Your Fork:**
   Open your terminal (or command prompt) and clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/P-Chatz/ats-resume-builder.git
   cd ats-resume-builder
   ```
3. **Install Dependencies:**
    Install the required libraries (like `JSZip`, `PapaParse`, and `@react-pdf/renderer`) by running:
    ```bash
    npm install
    ```
4. **Run the Development Server:**
    Start the local preview server so you can test your changes live in your browser:
    ```bash
    npm run dev
    ```

*(The terminal will give you a local URL, usually `http://localhost:5173`, which you can open in your browser).*

---

## 3. Making Your Changes

1. **Create a New Branch:**
    Never make changes directly on the `main` branch. Create a descriptive branch for what you are working on (e.g., `fix-csv-parser` or `update-readme`):
    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Edit the Code:**
    Most of the application logic lives inside `src/App.tsx`. Make your edits using VS Code.
3. **Test Locally:**
    As you code, `npm run dev` will automatically update your browser preview. Test your changes to make sure nothing breaks!

---

## 4. Submitting Your Contribution

1. **Save (Stage and Commit) Your Changes:**
    In your terminal, check which files you changed (`git status`), add them, and write a short, clear message explaining what you did:
    ```bash
    git add .
    git commit -m "Add short description of what you fixed or changed"
    ```


2. **Push to GitHub:**
    Send your branch up to your forked repository on GitHub:
    ```bash
    git push origin feature/your-feature-name

    ```


3. **Open a Pull Request (PR):**
    Go back to your repository page on GitHub. You will see a banner prompting you to **Compare & pull request**. Click it, write a short explanation of your changes, and submit your pull request!

---

## Core Guidelines & Rules

* **100% Client-Side Privacy:** This is the core rule of the project. Any features or modifications you add must execute entirely in the user's browser. **No user data, files, or parsed resumes may ever be sent to an external server.**