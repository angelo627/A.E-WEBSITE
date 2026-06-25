const fs = require('fs');
const path = require('path');

const adminDir = path.join(process.cwd(), 'frontend/src/pages/admin');
const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.tsx'));

const replacements = [
  // Page wrapper
  { regex: /ae-brand-page text-white overflow-hidden relative/g, replacement: 'bg-slate-50 text-slate-900 pb-20 overflow-hidden relative' },
  { regex: /<div className="absolute top-\[-10%\] right-\[-10%\].*?\/>\n\s*<div className="absolute bottom-\[-10%\].*?\/>/g, replacement: '' },
  
  // Cards and panels
  { regex: /bg-white\/\[0\.04\] backdrop-blur-xl border border-white\/\[0\.08\] shadow-2xl/g, replacement: 'bg-white border border-slate-200 shadow-sm' },
  { regex: /ae-brand-card backdrop-blur-xl border border-white\/\[0\.05\]/g, replacement: 'bg-white border border-slate-200 shadow-sm' },
  { regex: /ae-brand-card border border-white\/\[0\.08\]/g, replacement: 'bg-white border border-slate-200 shadow-sm' },
  { regex: /ae-brand-card/g, replacement: 'bg-white border border-slate-200 shadow-sm' },
  
  // Errors
  { regex: /bg-rose-500\/10 border border-rose-500\/20/g, replacement: 'bg-red-50 border border-red-200' },
  { regex: /shadow-lg shadow-rose-500\/5/g, replacement: 'shadow-sm' },
  { regex: /text-rose-400/g, replacement: 'text-red-500 font-bold' },
  { regex: /text-rose-300\/70/g, replacement: 'text-red-700 font-medium' },
  { regex: /text-rose-300/g, replacement: 'text-red-700 font-medium' },
  { regex: /text-rose-200/g, replacement: 'text-red-800 font-bold' },
  { regex: /bg-rose-500 hover:bg-rose-400/g, replacement: 'bg-red-500 hover:bg-red-600' },
  { regex: /text-rose-400 hover:bg-rose-500/g, replacement: 'text-red-600 hover:bg-red-500' },
  { regex: /disabled:hover:bg-rose-500\/10 disabled:hover:text-rose-400/g, replacement: 'disabled:hover:bg-red-50 disabled:hover:text-red-600' },

  { regex: /bg-emerald-500\/10 border border-emerald-500\/20/g, replacement: 'bg-emerald-50 border border-emerald-200' },
  { regex: /shadow-lg shadow-emerald-500\/5/g, replacement: 'shadow-sm' },
  { regex: /text-emerald-400/g, replacement: 'text-emerald-600 font-bold' },
  { regex: /text-emerald-200/g, replacement: 'text-emerald-800 font-bold' },

  // Typography
  { regex: /text-gray-400/g, replacement: 'text-slate-500 font-medium' },
  { regex: /text-gray-300/g, replacement: 'text-slate-600 font-medium' },
  { regex: /text-gray-600/g, replacement: 'text-slate-400' },
  { regex: /text-gray-500/g, replacement: 'text-slate-500 font-medium' },
  { regex: /text-white/g, replacement: 'text-slate-900 font-bold' },
  { regex: /group-hover:text-white/g, replacement: 'group-hover:text-[var(--ae-plum-deep)]' },

  // Subtext etc
  { regex: /bg-blue-500\/20 rounded-xl shadow-\[0_0_30px_rgba\(59,130,246,0\.3\)\] border border-blue-500\/30/g, replacement: 'bg-blue-50 rounded-xl shadow-sm border border-blue-100' },
  { regex: /text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent/g, replacement: 'text-3xl md:text-4xl font-black text-[var(--ae-plum-deep)]' },

  // Primary buttons and links
  { regex: /bg-blue-600 hover:bg-blue-500/g, replacement: 'bg-[var(--ae-blue)] hover:bg-[var(--ae-blue)]/90' },
  { regex: /bg-white\/5 hover:bg-white\/10 border border-white\/10 hover:border-white\/20 transition-all font-medium/g, replacement: 'bg-white hover:bg-slate-50 border border-slate-200 transition-all font-bold text-slate-700' },
  { regex: /bg-blue-500\/10 text-blue-400 hover:bg-blue-500 hover:text-white/g, replacement: 'bg-blue-50 text-blue-600 hover:bg-[var(--ae-blue)] hover:text-white' },
  { regex: /bg-blue-500\/20 text-blue-400/g, replacement: 'bg-blue-50 text-blue-600' },
  { regex: /hover:shadow-\[0_0_15px_rgba\(59,130,246,0\.3\)\]/g, replacement: 'hover:shadow-md' },

  // Inputs
  { regex: /w-full rounded-xl bg-white\/5 border border-white\/10 focus:border-blue-500\/50 focus:bg-white\/10 outline-none px-4/g, replacement: 'w-full rounded-xl bg-white border border-slate-200 focus:border-[var(--ae-blue)] focus:ring-[var(--ae-blue)]/20 outline-none px-4 text-slate-900 font-medium' },
  { regex: /rounded-xl bg-white\/5 border border-white\/10 focus:border-blue-500\/50 outline-none px-4/g, replacement: 'rounded-xl bg-white border border-slate-200 focus:border-[var(--ae-blue)] focus:ring-[var(--ae-blue)]/20 outline-none px-4 text-slate-900 font-medium' },
  { regex: /flex-1 rounded-xl bg-white\/5 border border-white\/10 focus:border-blue-500\/50 outline-none px-4/g, replacement: 'flex-1 rounded-xl bg-white border border-slate-200 focus:border-[var(--ae-blue)] focus:ring-[var(--ae-blue)]/20 outline-none px-4 text-slate-900 font-medium' },
  { regex: /bg-[^ ]* peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500\/50/g, replacement: 'bg-slate-200 peer-focus:outline-none' },

  { regex: /bg-white\/10 text-white px-3/g, replacement: 'bg-slate-100 text-slate-700 border border-slate-200 px-3' },

  { regex: /bg-white\/5/g, replacement: 'bg-white' },
  { regex: /border-white\/10/g, replacement: 'border-slate-200' },
  { regex: /hover:bg-white\/10/g, replacement: 'hover:bg-slate-50' },
  { regex: /border border-white\/5/g, replacement: 'border border-slate-100' },
];

files.forEach(file => {
  const filePath = path.join(adminDir, file);
  // Do not rewrite AdminDashboard.tsx because we just did.
  if (file === 'AdminDashboard.tsx') return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed ${file}`);
});
