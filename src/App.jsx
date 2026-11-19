import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Play, Square, RotateCcw, Download, Copy, Check, ChevronDown,
  FileCode2, Folder, Search, Settings2, Terminal, PanelBottom,
  Maximize2, Moon, Sun, Keyboard, CircleHelp, Code2, Zap,
  Braces, Clock3, AlertCircle, CheckCircle2, X, Plus, LayoutGrid
} from "lucide-react";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript", piston: "javascript", version: "18.15.0", ext: "js" },
  { label: "Python", value: "python", piston: "python", version: "3.10.0", ext: "py" },
  { label: "C++", value: "cpp", piston: "c++", version: "10.2.0", ext: "cpp" },
  { label: "C", value: "c", piston: "c", version: "10.2.0", ext: "c" },
  { label: "Java", value: "java", piston: "java", version: "15.0.2", ext: "java" },
  { label: "TypeScript", value: "typescript", piston: "typescript", version: "5.0.3", ext: "ts" },
  { label: "C#", value: "csharp", piston: "csharp", version: "6.12.0", ext: "cs" },
  { label: "Go", value: "go", piston: "go", version: "1.16.2", ext: "go" },
  { label: "Rust", value: "rust", piston: "rust", version: "1.68.2", ext: "rs" },
  { label: "PHP", value: "php", piston: "php", version: "8.2.3", ext: "php" },
  { label: "Ruby", value: "ruby", piston: "ruby", version: "3.0.1", ext: "rb" },
  { label: "Kotlin", value: "kotlin", piston: "kotlin", version: "1.8.20", ext: "kt" }
];

const STARTERS = {
  javascript: `// Welcome to CodeForge
// Write your code and press Run.

function greet(name) {
  return \`Hello, \${name}! Welcome to CodeForge.\`;
}

console.log(greet("Developer"));`,
  python: `# Welcome to CodeForge
def greet(name):
    return f"Hello, {name}! Welcome to CodeForge."

print(greet("Developer"))`,
  cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Developer";
    cout << "Hello, " << name << "! Welcome to CodeForge." << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, Developer! Welcome to CodeForge.\\n");
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Developer! Welcome to CodeForge.");
    }
}`,
  typescript: `const greet = (name: string): string => {
  return \`Hello, \${name}! Welcome to CodeForge.\`;
};

console.log(greet("Developer"));`,
  csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, Developer! Welcome to CodeForge.");
    }
}`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, Developer! Welcome to CodeForge.")
}`,
  rust: `fn main() {
    println!("Hello, Developer! Welcome to CodeForge.");
}`,
  php: `<?php
$name = "Developer";
echo "Hello, $name! Welcome to CodeForge.\\n";
?>`,
  ruby: `name = "Developer"
puts "Hello, #{name}! Welcome to CodeForge."`,
  kotlin: `fun main() {
    println("Hello, Developer! Welcome to CodeForge.")
}`
};

export default function App() {
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState(STARTERS.javascript);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("Your program output will appear here.");
  const [status, setStatus] = useState("Ready");
  const [running, setRunning] = useState(false);
  const [dark, setDark] = useState(true);
  const [activePanel, setActivePanel] = useState("output");
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [fileName, setFileName] = useState("main.js");
  const [showSettings, setShowSettings] = useState(false);
  const [wordWrap, setWordWrap] = useState("on");
  const [lineNumbers, setLineNumbers] = useState("on");

  const current = useMemo(() => LANGUAGES.find(x => x.value === lang), [lang]);

  useEffect(() => {
    setCode(STARTERS[lang]);
    setFileName(`main.${current.ext}`);
    setOutput("Your program output will appear here.");
    setStatus("Ready");
  }, [lang]);

  async function runCode() {
    setRunning(true);
    setStatus("Running");
    setActivePanel("output");
    setOutput("Compiling and running your code…");
    const started = performance.now();
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: current.piston,
          version: current.version,
          files: [{ name: fileName, content: code }],
          stdin
        })
      });
      if (!response.ok) throw new Error(`Execution service returned ${response.status}.`);
      const data = await response.json();
      const text = [data.run?.stdout, data.run?.stderr, data.compile?.output]
        .filter(Boolean).join("\n").trim();
      setOutput(text || (data.run?.code === 0 ? "✓ Program executed successfully (no output)." : "Program finished with no output."));
      setStatus(data.run?.code === 0 ? "Finished" : "Error");
      if (data.run?.signal) setOutput(prev => `${prev}\nProcess signal: ${data.run.signal}`);
    } catch (err) {
      setOutput(`Unable to execute code.\n\n${err.message}\n\nCheck your internet connection and try again. The online runner may also be temporarily unavailable.`);
      setStatus("Failed");
    } finally {
      setRunning(false);
      const elapsed = ((performance.now() - started) / 1000).toFixed(2);
      setOutput(prev => `${prev}\n\n— Completed in ${elapsed}s`);
    }
  }

  function changeLanguage(value) {
    setLang(value);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setOutput("Clipboard access was blocked by the browser.");
      setActivePanel("output");
    }
  }

  function downloadCode() {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetCode() {
    setCode(STARTERS[lang]);
    setOutput("Editor restored to the starter template.");
    setStatus("Ready");
  }

  return (
    <div className={`app ${dark ? "dark" : "light"}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Code2 size={21} /></div>
          <div><div className="brand-name">codeforge<span>.</span></div><div className="brand-sub">ONLINE DEVELOPMENT STUDIO</div></div>
        </div>
        <div className="top-center"><span className="workspace-dot" /> Personal workspace <ChevronDown size={14} /></div>
        <div className="top-actions">
          <div className="save-state"><span className="save-dot" /> Local session</div>
          <button className="icon-btn" title="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={17}/> : <Moon size={17}/>}</button>
          <button className="icon-btn" title="Settings" onClick={() => setShowSettings(!showSettings)}><Settings2 size={17}/></button>
          <div className="avatar">D</div>
        </div>
      </header>

      <div className="subbar">
        <div className="breadcrumb"><span>Workspace</span><span className="slash">/</span><strong>{fileName}</strong><span className="edited-dot" /></div>
        <div className="sub-actions">
          <button className="sub-btn" onClick={copyCode}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Copied" : "Copy"}</button>
          <button className="sub-btn" onClick={downloadCode}><Download size={14}/> Export</button>
          <button className="run-btn" onClick={runCode} disabled={running}>{running ? <span className="spinner"/> : <Play size={15} fill="currentColor"/>}{running ? "Running..." : "Run code"} <kbd>Ctrl ↵</kbd></button>
        </div>
      </div>

      <main className="workspace">
        <aside className="activity-rail">
          <button className="rail-btn active" title="Explorer"><FilesIcon /></button>
          <button className="rail-btn" title="Search"><Search size={19}/></button>
          <button className="rail-btn" title="Extensions"><LayoutGrid size={19}/></button>
          <div className="rail-spacer"/>
          <button className="rail-btn" title="Keyboard shortcuts"><Keyboard size={18}/></button>
          <button className="rail-btn" title="Help"><CircleHelp size={18}/></button>
        </aside>

        <aside className="sidebar">
          <div className="side-heading"><span>EXPLORER</span><MoreDots /></div>
          <div className="project-label"><ChevronDown size={14}/><Folder size={15} className="folder-icon"/> CODEFORGE-WORKSPACE</div>
          <div className="file-row selected"><FileCode2 size={15} className="js-icon"/><span>{fileName}</span><span className="file-status">M</span></div>
          <div className="side-divider"/>
          <div className="side-info"><div className="info-icon"><Zap size={16}/></div><div><strong>Ready to build?</strong><p>Choose a language, write code and run it instantly.</p></div></div>
          <div className="side-bottom"><span className="online-indicator"/> All systems operational</div>
        </aside>

        <section className="main-area">
          <div className="editor-toolbar">
            <div className="tab active-tab"><FileCode2 size={14} className="js-icon"/>{fileName}<X size={13} className="tab-close"/></div>
            <div className="editor-tools">
              <span className="language-label">LANGUAGE</span>
              <div className="select-wrap">
                <Braces size={15}/>
                <select value={lang} onChange={e => changeLanguage(e.target.value)} aria-label="Select programming language">
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <ChevronDown size={13}/>
              </div>
              <button className="tool-btn" onClick={resetCode} title="Reset starter code"><RotateCcw size={15}/></button>
              <button className="tool-btn" onClick={() => setFontSize(s => Math.max(11, s - 1))} title="Decrease font size">A−</button>
              <button className="tool-btn" onClick={() => setFontSize(s => Math.min(22, s + 1))} title="Increase font size">A+</button>
            </div>
          </div>

          <div className="editor-wrap">
            <Editor
              height="100%"
              language={lang}
              theme={dark ? "vs-dark" : "light"}
              value={code}
              onChange={value => setCode(value ?? "")}
              options={{
                fontSize, fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                minimap: { enabled: true }, automaticLayout: true,
                scrollBeyondLastLine: false, smoothScrolling: true,
                cursorBlinking: "smooth", cursorSmoothCaretAnimation: "on",
                wordWrap, lineNumbers, renderLineHighlight: "all",
                padding: { top: 18, bottom: 18 }, tabSize: 4,
                suggestOnTriggerCharacters: true, quickSuggestions: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true, indentation: true }
              }}
            />
          </div>

          <section className="bottom-panel">
            <div className="panel-header">
              <div className="panel-tabs">
                <button className={activePanel === "output" ? "panel-tab selected-panel" : "panel-tab"} onClick={() => setActivePanel("output")}><Terminal size={14}/> OUTPUT</button>
                <button className={activePanel === "input" ? "panel-tab selected-panel" : "panel-tab"} onClick={() => setActivePanel("input")}><PanelBottom size={14}/> STDIN</button>
              </div>
              <div className="panel-actions">
                <span className={`run-status ${status.toLowerCase()}`}>{status === "Finished" ? <CheckCircle2 size={13}/> : status === "Failed" || status === "Error" ? <AlertCircle size={13}/> : <span className="status-dot"/>}{status}</span>
                <button className="tool-btn" title="Clear output" onClick={() => setOutput("")}><RotateCcw size={14}/></button>
                <button className="tool-btn" title="Expand panel"><Maximize2 size={14}/></button>
              </div>
            </div>
            {activePanel === "output" ? (
              <div className="output-area"><pre className={status === "Failed" || status === "Error" ? "output-error" : ""}>{output}</pre></div>
            ) : (
              <div className="stdin-area"><label htmlFor="stdin">STANDARD INPUT <span>Provide input for programs that read from stdin.</span></label><textarea id="stdin" value={stdin} onChange={e => setStdin(e.target.value)} placeholder={"Enter input here...\nExample: 5"} /></div>
            )}
          </section>
        </section>
      </main>

      <footer className="statusbar">
        <div className="status-left"><span><Code2 size={13}/> {current.label}</span><span>UTF-8</span><span>LF</span><span>Spaces: 4</span></div>
        <div className="status-right"><span><Clock3 size={13}/> {status}</span><span>Ln {code.split("\n").length}, Col 1</span><span>CodeForge v1.0</span></div>
      </footer>

      {showSettings && <div className="settings-popover">
        <div className="settings-title">Editor settings <button onClick={() => setShowSettings(false)}><X size={14}/></button></div>
        <label>Word wrap<select value={wordWrap} onChange={e => setWordWrap(e.target.value)}><option value="on">On</option><option value="off">Off</option></select></label>
        <label>Line numbers<select value={lineNumbers} onChange={e => setLineNumbers(e.target.value)}><option value="on">On</option><option value="off">Off</option></select></label>
        <div className="settings-note">Changes apply immediately to the editor.</div>
      </div>}
    </div>
  );
}

function FilesIcon() { return <Folder size={19}/>; }
function MoreDots() { return <span className="more-dots">•••</span>; }
