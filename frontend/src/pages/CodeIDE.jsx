import { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Save,
  RotateCcw,
  Sun,
  Moon,
  Maximize,
  Minimize,
  Copy,
  Trash2,
  Terminal,
  Code2,
  ChevronDown,
  GripVertical,
  WrapText,
  BookOpen,
  X,
  Keyboard,
  Minus,
  Plus,
  FileCode2,
  Check,
} from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";

/* ─── Language Templates ─── */
const TEMPLATES = {
  javascript: `// 🟡 JavaScript – Hello World + Array Ops
function greet(name) {
  console.log(\`Hello, \${name}! Welcome to CodingHub 🚀\`);
}

greet("Developer");

// Array operations
const nums = [5, 3, 8, 1, 9, 2, 7];
console.log("Original:", nums);
console.log("Sorted:", [...nums].sort((a, b) => a - b));
console.log("Sum:", nums.reduce((a, b) => a + b, 0));
console.log("Even:", nums.filter(n => n % 2 === 0));
console.log("Doubled:", nums.map(n => n * 2));
`,
  python: `# 🐍 Python – FizzBuzz
def fizzbuzz(n):
    """Classic FizzBuzz implementation."""
    for i in range(1, n + 1):
        if i % 15 == 0:
            print("FizzBuzz")
        elif i % 3 == 0:
            print("Fizz")
        elif i % 5 == 0:
            print("Buzz")
        else:
            print(i)

print("FizzBuzz from 1 to 20:")
print("-" * 20)
fizzbuzz(20)
`,
  cpp: `// 🔵 C++ – Hello World
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    cout << "Hello, CodingHub! 🚀" << endl;

    vector<int> nums = {5, 3, 8, 1, 9, 2, 7};

    sort(nums.begin(), nums.end());

    cout << "Sorted: ";
    for (int n : nums) {
        cout << n << " ";
    }
    cout << endl;

    return 0;
}
`,
  java: `// ☕ Java – Hello World Class
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodingHub! 🚀");

        int[] nums = {5, 3, 8, 1, 9, 2, 7};

        // Bubble sort
        for (int i = 0; i < nums.length - 1; i++) {
            for (int j = 0; j < nums.length - i - 1; j++) {
                if (nums[j] > nums[j + 1]) {
                    int temp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = temp;
                }
            }
        }

        System.out.print("Sorted: ");
        for (int n : nums) {
            System.out.print(n + " ");
        }
        System.out.println();
    }
}
`,
  html: `<!-- 🌐 HTML – Basic Page Template -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CodingHub Page</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: system-ui, sans-serif;
            background: #FFFBF5;
            color: #171717;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .card {
            background: white;
            border-radius: 1.5rem;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            text-align: center;
            max-width: 400px;
        }
        h1 { color: #FF7378; margin-bottom: 0.5rem; }
        p { color: #5F5F5F; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Hello, CodingHub! 🚀</h1>
        <p>This is a basic HTML page template.</p>
    </div>
</body>
</html>
`,
  css: `/* 🎨 CSS – Flexbox Layout Example */
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 2rem;
  max-width: 960px;
  margin: 0 auto;
}

.card {
  flex: 1 1 280px;
  background: #FFFBF5;
  border: 1px solid #E9E2D8;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card h3 {
  font-size: 1.125rem;
  font-weight: 800;
  color: #171717;
  margin-bottom: 0.5rem;
}

.card p {
  font-size: 0.875rem;
  color: #5F5F5F;
  line-height: 1.6;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  background: #FFD05A;
  color: #171717;
  font-weight: 700;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn:hover {
  background: #FFA057;
}
`,
};

const LANGUAGE_META = {
  javascript: { label: "JavaScript", ext: ".js", color: "#FFD05A" },
  python: { label: "Python", ext: ".py", color: "#3776AB" },
  cpp: { label: "C++", ext: ".cpp", color: "#00599C" },
  java: { label: "Java", ext: ".java", color: "#ED8B00" },
  html: { label: "HTML", ext: ".html", color: "#E34F26" },
  css: { label: "CSS", ext: ".css", color: "#1572B6" },
};

const SNIPPETS = [
  { name: "For Loop", lang: "javascript", code: `for (let i = 0; i < n; i++) {\n  // ...\n}` },
  { name: "Arrow Function", lang: "javascript", code: `const fn = (x) => {\n  return x;\n};` },
  { name: "Async/Await", lang: "javascript", code: `async function fetchData() {\n  try {\n    const res = await fetch(url);\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error(err);\n  }\n}` },
  { name: "Array Methods", lang: "javascript", code: `const result = arr\n  .filter(x => x > 0)\n  .map(x => x * 2)\n  .reduce((a, b) => a + b, 0);` },
  { name: "Class", lang: "javascript", code: `class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n\n  speak() {\n    console.log(\`\${this.name} speaks.\`);\n  }\n}` },
  { name: "Binary Search", lang: "javascript", code: `function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}` },
];

/* ─── Component ─── */
const CodeIDE = () => {
  const [code, setCode] = useState(TEMPLATES.javascript);
  const [language, setLanguage] = useState("javascript");
  const [fileName, setFileName] = useState("main");
  const [fontSize, setFontSize] = useState(14);
  const [darkEditor, setDarkEditor] = useState(true);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [stdinInput, setStdinInput] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(60);
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef(false);

  const meta = LANGUAGE_META[language];
  const lineCount = code.split("\n").length;
  const charCount = code.length;

  /* ─── Language Change ─── */
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    setCode(TEMPLATES[lang]);
    setOutput([]);
    setExecutionTime(null);
    setLangDropdownOpen(false);
  }, []);

  /* ─── Run Code ─── */
  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput([]);
    setExecutionTime(null);

    setTimeout(() => {
      if (language === "javascript") {
        const logs = [];
        const fakeConsole = {
          log: (...args) => logs.push({ type: "log", text: args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ") }),
          error: (...args) => logs.push({ type: "error", text: args.map(a => String(a)).join(" ") }),
          warn: (...args) => logs.push({ type: "warn", text: args.map(a => String(a)).join(" ") }),
          info: (...args) => logs.push({ type: "log", text: args.map(a => String(a)).join(" ") }),
        };

        const start = performance.now();
        try {
          const wrappedCode = `(function(console, stdin) { ${code} })`;
          const fn = new Function("console", "stdin", `return ${wrappedCode}(console, stdin);`);
          fn(fakeConsole, stdinInput);
        } catch (err) {
          logs.push({ type: "error", text: `Error: ${err.message}` });
        }
        const elapsed = performance.now() - start;
        setExecutionTime(elapsed.toFixed(2));
        setOutput(logs.length > 0 ? logs : [{ type: "log", text: "✓ Code executed successfully (no output)" }]);
      } else {
        const simulated = [
          { type: "log", text: `▶ Compiling ${meta.label} code...` },
          { type: "log", text: `✓ ${meta.label} code compiled successfully!` },
          { type: "warn", text: `⚠ Note: ${meta.label} execution is simulated in-browser.` },
          { type: "log", text: "  Use a local compiler/interpreter for actual output." },
        ];
        setOutput(simulated);
        setExecutionTime("N/A");
      }
      setIsRunning(false);
    }, 300);
  }, [code, language, meta.label, stdinInput]);

  /* ─── Save / Download ─── */
  const saveCode = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}${meta.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, fileName, meta.ext]);

  /* ─── Reset ─── */
  const resetCode = useCallback(() => {
    setCode(TEMPLATES[language]);
    setOutput([]);
    setExecutionTime(null);
  }, [language]);

  /* ─── Copy Output ─── */
  const copyOutput = useCallback(() => {
    const text = output.map((o) => o.text).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  /* ─── Keyboard Shortcuts ─── */
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runCode, saveCode]);

  /* ─── Tab & Auto-indent in Textarea ─── */
  const handleKeyDown = (e) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = "  ";
      const updated = code.substring(0, start) + indent + code.substring(end);
      setCode(updated);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indent.length;
      });
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const lineStart = code.lastIndexOf("\n", start - 1) + 1;
      const currentLine = code.substring(lineStart, start);
      const leadingSpaces = currentLine.match(/^(\s*)/)[1];
      const extra = currentLine.trimEnd().endsWith("{") || currentLine.trimEnd().endsWith(":") ? "  " : "";
      const insert = "\n" + leadingSpaces + extra;
      const updated = code.substring(0, start) + insert + code.substring(start);
      setCode(updated);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insert.length;
      });
    }
  };

  /* ─── Resizable Panels ─── */
  const handleMouseDown = () => {
    dragRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setPanelWidth(Math.max(30, Math.min(80, pct)));
    };
    const handleMouseUp = () => {
      dragRef.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  /* ─── Fullscreen Toggle ─── */
  const toggleFullscreen = useCallback(() => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen((f) => !f);
  }, [fullscreen]);

  /* ─── Insert Snippet ─── */
  const insertSnippet = useCallback((snippet) => {
    setCode((prev) => prev + "\n\n" + snippet.code + "\n");
    setCopiedSnippet(snippet.name);
    setTimeout(() => setCopiedSnippet(null), 1500);
  }, []);

  /* ─── Theming ─── */
  const editorBg = darkEditor ? "#1E1E2E" : "#FFFFFF";
  const editorText = darkEditor ? "#CDD6F4" : "#171717";
  const gutterBg = darkEditor ? "#181825" : "#F5F0E8";
  const gutterText = darkEditor ? "#585B70" : "#A8A29E";
  const outputBg = darkEditor ? "#11111B" : "#FFFBF5";
  const outputText = darkEditor ? "#CDD6F4" : "#171717";

  /* ─── Line Numbers ─── */
  const lines = code.split("\n");

  const content = (
    <div className={`flex flex-col ${fullscreen ? "h-screen" : "h-[calc(100vh-8rem)]"} min-h-[500px]`} ref={containerRef}>
      {/* ─── Top Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-2 rounded-t-2xl border border-[#E9E2D8] bg-white px-3 py-2 shadow-xs">
        {/* Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-[#FFF0BE] transition"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
            {meta.label}
            <ChevronDown size={14} />
          </button>
          {langDropdownOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-44 rounded-xl border border-[#E9E2D8] bg-white py-1 shadow-lg">
              {Object.entries(LANGUAGE_META).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleLanguageChange(key)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition hover:bg-[#FFF0BE] ${language === key ? "bg-[#FFF0BE] font-bold" : "text-[#5F5F5F]"}`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: val.color }} />
                  {val.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* File Name */}
        <div className="flex items-center gap-1 rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] px-2 py-1.5">
          <FileCode2 size={14} className="text-[#5F5F5F]" />
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-24 bg-transparent text-xs font-medium text-[#171717] outline-none"
            placeholder="filename"
          />
          <span className="text-xs text-[#5F5F5F]">{meta.ext}</span>
        </div>

        <div className="mx-1 h-5 w-px bg-[#E9E2D8]" />

        {/* Run Button */}
        <button
          type="button"
          onClick={runCode}
          disabled={isRunning}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#16A34A] disabled:opacity-60 shadow-xs"
        >
          <Play size={14} fill="white" />
          {isRunning ? "Running…" : "Run"}
        </button>

        {/* Save */}
        <button type="button" onClick={saveCode} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9E2D8] bg-white px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-[#FFF0BE] transition" title="Save (Ctrl+S)">
          <Save size={14} />
          Save
        </button>

        {/* Reset */}
        <button type="button" onClick={resetCode} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9E2D8] bg-white px-3 py-2 text-xs font-semibold text-[#5F5F5F] hover:bg-[#FFF0BE] transition" title="Reset code">
          <RotateCcw size={14} />
        </button>

        <div className="flex-1" />

        {/* Font Size */}
        <div className="hidden items-center gap-1 sm:flex">
          <button type="button" onClick={() => setFontSize((s) => Math.max(10, s - 1))} className="rounded-lg p-1 text-[#5F5F5F] hover:bg-[#FFF0BE] transition"><Minus size={14} /></button>
          <span className="text-xs font-semibold text-[#5F5F5F] w-6 text-center">{fontSize}</span>
          <button type="button" onClick={() => setFontSize((s) => Math.min(24, s + 1))} className="rounded-lg p-1 text-[#5F5F5F] hover:bg-[#FFF0BE] transition"><Plus size={14} /></button>
        </div>

        {/* Word Wrap */}
        <button type="button" onClick={() => setWordWrap((w) => !w)} className={`rounded-xl p-2 transition ${wordWrap ? "bg-[#FFF0BE] text-[#171717]" : "text-[#5F5F5F] hover:bg-[#FFF0BE]"}`} title="Toggle word wrap">
          <WrapText size={14} />
        </button>

        {/* Theme Toggle */}
        <button type="button" onClick={() => setDarkEditor((d) => !d)} className="rounded-xl p-2 text-[#5F5F5F] hover:bg-[#FFF0BE] transition" title="Toggle editor theme">
          {darkEditor ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Snippets */}
        <button type="button" onClick={() => { setShowSnippets((s) => !s); setShowShortcuts(false); }} className={`rounded-xl p-2 transition ${showSnippets ? "bg-[#FFF0BE] text-[#171717]" : "text-[#5F5F5F] hover:bg-[#FFF0BE]"}`} title="Code snippets">
          <BookOpen size={14} />
        </button>

        {/* Shortcuts */}
        <button type="button" onClick={() => { setShowShortcuts((s) => !s); setShowSnippets(false); }} className={`rounded-xl p-2 transition ${showShortcuts ? "bg-[#FFF0BE] text-[#171717]" : "text-[#5F5F5F] hover:bg-[#FFF0BE]"}`} title="Keyboard shortcuts">
          <Keyboard size={14} />
        </button>

        {/* Fullscreen */}
        <button type="button" onClick={toggleFullscreen} className="rounded-xl p-2 text-[#5F5F5F] hover:bg-[#FFF0BE] transition" title="Toggle fullscreen">
          {fullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>

      {/* ─── Main Area ─── */}
      <div className="relative flex flex-1 overflow-hidden border-x border-[#E9E2D8]">

        {/* ─── Snippets Sidebar ─── */}
        {showSnippets && (
          <div className="w-64 shrink-0 overflow-y-auto border-r border-[#E9E2D8] bg-white p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#171717]">Snippets</h3>
              <button type="button" onClick={() => setShowSnippets(false)} className="rounded-lg p-1 text-[#5F5F5F] hover:bg-[#FFF0BE]"><X size={14} /></button>
            </div>
            <div className="space-y-2">
              {SNIPPETS.map((snippet) => (
                <button
                  key={snippet.name}
                  type="button"
                  onClick={() => insertSnippet(snippet)}
                  className="w-full rounded-xl border border-[#E9E2D8] p-2.5 text-left transition hover:bg-[#FFF0BE] hover:border-[#FFD05A]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#171717]">{snippet.name}</span>
                    {copiedSnippet === snippet.name ? (
                      <Check size={12} className="text-green-500" />
                    ) : (
                      <Copy size={12} className="text-[#5F5F5F]" />
                    )}
                  </div>
                  <pre className="mt-1.5 text-[10px] text-[#5F5F5F] overflow-hidden max-h-12 leading-relaxed">
                    {snippet.code.slice(0, 80)}…
                  </pre>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Shortcuts Panel ─── */}
        {showShortcuts && (
          <div className="w-56 shrink-0 overflow-y-auto border-r border-[#E9E2D8] bg-white p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#171717]">Shortcuts</h3>
              <button type="button" onClick={() => setShowShortcuts(false)} className="rounded-lg p-1 text-[#5F5F5F] hover:bg-[#FFF0BE]"><X size={14} /></button>
            </div>
            <div className="space-y-2">
              {[
                { keys: "Ctrl + Enter", action: "Run code" },
                { keys: "Ctrl + S", action: "Save / download" },
                { keys: "Tab", action: "Insert indent" },
                { keys: "Enter", action: "Auto-indent new line" },
              ].map((s) => (
                <div key={s.keys} className="flex items-center justify-between rounded-xl bg-[#FFFBF5] border border-[#E9E2D8] px-3 py-2">
                  <kbd className="rounded-lg bg-[#FFF0BE] px-2 py-0.5 text-[10px] font-bold text-[#171717]">{s.keys}</kbd>
                  <span className="text-[10px] text-[#5F5F5F]">{s.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Editor Panel ─── */}
        <div className="flex min-w-0 overflow-hidden" style={{ width: `${panelWidth}%` }}>
          {/* Line Gutter */}
          <div
            className="shrink-0 overflow-hidden select-none px-2 py-3 text-right font-mono"
            style={{ background: gutterBg, color: gutterText, fontSize: `${fontSize}px`, lineHeight: "1.6" }}
            aria-hidden="true"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Textarea */}
          <div className="relative flex-1 min-w-0 overflow-auto">
            <textarea
              ref={editorRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="absolute inset-0 w-full h-full resize-none border-none outline-none p-3 font-mono"
              style={{
                background: editorBg,
                color: editorText,
                fontSize: `${fontSize}px`,
                lineHeight: "1.6",
                whiteSpace: wordWrap ? "pre-wrap" : "pre",
                overflowWrap: wordWrap ? "break-word" : "normal",
                caretColor: darkEditor ? "#F5E0DC" : "#171717",
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* ─── Resize Handle ─── */}
        <div
          onMouseDown={handleMouseDown}
          className="group z-10 flex w-2 cursor-col-resize items-center justify-center border-x border-[#E9E2D8] bg-[#F5F0E8] hover:bg-[#FFD05A] transition-colors"
          title="Drag to resize"
        >
          <GripVertical size={12} className="text-[#A8A29E] group-hover:text-[#171717]" />
        </div>

        {/* ─── Output Panel ─── */}
        <div className="flex min-w-0 flex-1 flex-col" style={{ width: `${100 - panelWidth}%` }}>
          {/* Output Header */}
          <div className="flex items-center gap-2 border-b border-[#E9E2D8] px-3 py-2" style={{ background: darkEditor ? "#181825" : "#FFFFFF" }}>
            <Terminal size={14} className="text-[#5F5F5F]" />
            <span className="text-xs font-bold" style={{ color: darkEditor ? "#CDD6F4" : "#171717" }}>Console Output</span>
            <div className="flex-1" />
            <button type="button" onClick={copyOutput} className="rounded-lg p-1 text-[#5F5F5F] hover:bg-[#FFF0BE] transition" title="Copy output" disabled={output.length === 0}>
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            </button>
            <button type="button" onClick={() => { setOutput([]); setExecutionTime(null); }} className="rounded-lg p-1 text-[#5F5F5F] hover:bg-[#FFF0BE] transition" title="Clear output">
              <Trash2 size={13} />
            </button>
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-y-auto p-3 font-mono" style={{ background: outputBg, color: outputText, fontSize: `${fontSize - 1}px`, lineHeight: "1.7" }}>
            {output.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Code2 size={32} className="text-[#5F5F5F] opacity-30 mb-2" />
                <p className="text-xs text-[#5F5F5F]">Click <strong>Run</strong> or press <kbd className="rounded bg-[#FFF0BE] px-1.5 py-0.5 text-[10px] font-bold">Ctrl+Enter</kbd> to execute</p>
              </div>
            ) : (
              output.map((line, i) => (
                <div
                  key={i}
                  className={`whitespace-pre-wrap ${
                    line.type === "error" ? "text-[#FF7378]" : line.type === "warn" ? "text-[#FFD05A]" : ""
                  }`}
                >
                  {line.text}
                </div>
              ))
            )}
          </div>

          {/* Stdin Input */}
          <div className="border-t border-[#E9E2D8] p-2" style={{ background: darkEditor ? "#181825" : "#FFFFFF" }}>
            <label className="mb-1 block text-[10px] font-semibold text-[#5F5F5F]">Standard Input (stdin)</label>
            <textarea
              value={stdinInput}
              onChange={(e) => setStdinInput(e.target.value)}
              placeholder="Enter input values here..."
              rows={2}
              className="w-full resize-none rounded-lg border border-[#E9E2D8] p-2 font-mono text-xs outline-none focus:border-[#FFD05A] transition"
              style={{ background: darkEditor ? "#1E1E2E" : "#FFFBF5", color: darkEditor ? "#CDD6F4" : "#171717" }}
            />
          </div>
        </div>
      </div>

      {/* ─── Status Bar ─── */}
      <div className="flex flex-wrap items-center gap-3 rounded-b-2xl border border-t-0 border-[#E9E2D8] bg-white px-4 py-1.5 text-[10px] font-medium text-[#5F5F5F] shadow-xs">
        <span>Lines: <strong className="text-[#171717]">{lineCount}</strong></span>
        <span className="h-3 w-px bg-[#E9E2D8]" />
        <span>Characters: <strong className="text-[#171717]">{charCount}</strong></span>
        <span className="h-3 w-px bg-[#E9E2D8]" />
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </span>
        <span className="h-3 w-px bg-[#E9E2D8]" />
        <span>UTF-8</span>
        <div className="flex-1" />
        {executionTime !== null && (
          <span>
            Execution: <strong className="text-[#171717]">{executionTime === "N/A" ? "N/A" : `${executionTime}ms`}</strong>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 -my-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4">
          {/* Page Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#FF7378]">CODE EDITOR</p>
              <h1 className="text-2xl font-black text-[#171717]">CodingHub IDE</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-bold shadow-xs" style={{ background: meta.color + "22", color: meta.color, border: `1px solid ${meta.color}44` }}>
                {meta.label}
              </span>
            </div>
          </div>

          {content}
        </div>
      </div>
    </AppLayout>
  );
};

export default CodeIDE;
