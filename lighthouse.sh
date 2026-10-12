#!/usr/bin/env bash
# Lighthouse from the terminal, for anyone whose browser has no Lighthouse panel.
# A copy sits in each Day 2 project folder. Run it from inside that folder,
# with nothing else on port 5000:
#   bash lighthouse.sh
# It builds the app, serves the production preview on port 5000, runs Lighthouse
# against it with a headless Chrome on the lab VM, and prints the scores.
set -u
LOG=/tmp/lighthouse-run.log; : > "$LOG"

CH=""
for b in google-chrome google-chrome-stable chromium chromium-browser chrome; do
  command -v "$b" >/dev/null 2>&1 && { CH=$(command -v "$b"); break; }
done
if [ -z "$CH" ]; then
  CH=$(find ~/.cache/chs -type f -name chrome-headless-shell 2>/dev/null | head -1)
fi
if [ -z "$CH" ]; then
  echo "Fetching a headless Chrome into ~/.cache/chs (first run only)..."
  npx -y @puppeteer/browsers install chrome-headless-shell@stable --path ~/.cache/chs >>"$LOG" 2>&1
  CH=$(find ~/.cache/chs -type f -name chrome-headless-shell 2>/dev/null | head -1)
fi
[ -z "$CH" ] && { echo "Could not get a Chrome to run Lighthouse. Use npm test and npm run size instead, and tell your instructor."; exit 1; }

if (ss -ltn 2>/dev/null || netstat -ltn 2>/dev/null) | grep -q ':5000 '; then
  echo "Something is already using port 5000. Stop it (Ctrl+C in its terminal) and run this again."; exit 1
fi
rm -f /tmp/lighthouse.json

echo "Building..."; npm run build >>"$LOG" 2>&1 || { echo "Build failed (see $LOG)"; exit 1; }
setsid npx vite preview --port 5000 --strictPort >>"$LOG" 2>&1 & PREVIEW=$!
sleep 4
echo "Running Lighthouse (about 30 seconds)..."
CHROME_PATH="$CH" npx -y lighthouse@13 http://localhost:5000 --quiet \
  --chrome-flags="--headless=new --no-sandbox" \
  --only-categories=performance,accessibility \
  --output=json --output-path=/tmp/lighthouse.json >>"$LOG" 2>&1
kill -- -$PREVIEW 2>/dev/null   # stop the preview server and everything it started

python3 - <<'PY'
import json
try:
    r = json.load(open("/tmp/lighthouse.json"))
except Exception:
    print("Lighthouse did not produce a report. See /tmp/lighthouse-run.log"); raise SystemExit(1)
for k, v in r["categories"].items():
    print(f"{v['title']:>15}: {round(v['score'] * 100)}")
print("\nWhat to look at (anything scoring below 90%):")
for a in r["audits"].values():
    if a.get("score") is not None and a["score"] < 0.9 and a["scoreDisplayMode"] in ("binary", "numeric", "metricSavings"):
        print(f"  - {a['title']}  {a.get('displayValue', '')}")
PY
