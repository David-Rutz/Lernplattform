*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --teal: #1D9E75;
  --teal-dark: #0F6E56;
  --teal-light: #E1F5EE;
  --teal-text: #085041;
  --amber: #F59E0B;
  --amber-light: #FEF3C7;
  --red: #EF4444;
  --red-light: #FEE2E2;
  --bg: #F8F9FA;
  --surface: #FFFFFF;
  --border: rgba(0,0,0,0.08);
  --border-md: rgba(0,0,0,0.14);
  --text: #111827;
  --text-muted: #6B7280;
  --text-faint: #9CA3AF;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
}

body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

a { color: inherit; text-decoration: none; }

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

input, textarea {
  font-family: inherit;
  font-size: 14px;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 3px; }
