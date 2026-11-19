# CodeForge — Online Code Editor

A responsive React + JavaScript online editor with Monaco Editor syntax highlighting and multi-language execution.

## Features
- Monaco editor with language-aware syntax highlighting, bracket matching, minimap, line numbers and suggestions.
- 12 languages: JavaScript, Python, C, C++, Java, TypeScript, C#, Go, Rust, PHP, Ruby and Kotlin.
- Run code through the Piston execution API.
- Standard input (stdin) and program output panels.
- Copy code, download source, reset starter template, light/dark theme.
- Adjustable font size, word wrap and line-number settings.
- Responsive layout for desktop and smaller screens.

## Run locally
1. Install Node.js 18 or later.
2. Extract this folder and open it in VS Code or a terminal.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

## Build
```bash
npm run build
npm run preview
```

## Execution note
Code execution is sent to the public Piston API (`https://emkc.org/api/v2/piston/execute`). An internet connection is required. Public execution services can have rate limits or temporary downtime. For a production deployment, route execution through your own backend, apply request limits and timeouts, and never expose private API credentials in frontend code.

## Main structure
```text
CodeForge_React_Editor/
├── index.html
├── package.json
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    └── styles.css
```
