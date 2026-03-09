#!/usr/bin/env python3
"""
Soccer HQ — Build Script
Combines split source files into a single deployable index.html

Usage:
  python3 build.py

Edit these files:
  css/style.css       → all styles
  js/data.js          → constants, bible data, supabase config
  js/components.js    → every React component
  js/app.js           → App component + ReactDOM.render

Then run this script and upload index.html to GitHub Pages.
"""

import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))

def read(path):
    with open(os.path.join(ROOT, path)) as f:
        return f.read()

def write(path, content):
    with open(os.path.join(ROOT, path), "w") as f:
        f.write(content)

# Read source files
css   = read("css/style.css")
data  = read("js/data.js")
comps = read("js/components.js")
app   = read("js/app.js")

# Read the HTML shell (head tags, favicon, PWA meta)
shell = read("shell.html")

# Build combined HTML
combined = shell \
    .replace("<!-- INJECT:CSS -->", css) \
    .replace("<!-- INJECT:DATA -->", data) \
    .replace("<!-- INJECT:COMPONENTS -->", comps) \
    .replace("<!-- INJECT:APP -->", app)

write("index.html", combined)

# Validate
code = combined[combined.find('<script type="text/babel">'):combined.rfind('</script>')]
depth = sum(1 if c=='{' else -1 if c=='}' else 0 for c in code)
fns = [l.strip() for l in code.split('\n') if re.match(r'^function \w+\(', l)]
consts = re.findall(r'^const (\w+)\s*=', code, re.MULTILINE)
dupes = [c for c in set(consts) if consts.count(c) > 1]

print(f"✅ index.html built: {len(combined):,} chars")
print(f"   Brace depth : {depth} {'✅' if depth==0 else '❌ ERROR'}")
print(f"   Functions   : {len(fns)}")
print(f"   Dup consts  : {dupes or 'none'}")

if depth != 0 or dupes:
    print("\n⚠️  Errors detected — check your source files before deploying.")
else:
    print("\n🚀 Ready to deploy — upload index.html to GitHub Pages.")
