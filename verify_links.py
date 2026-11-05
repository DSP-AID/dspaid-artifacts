# Verify all dossier links resolve (GET, browser UA); writes validation.json with per-link status
import json, time, urllib.request, sys, os

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) dspaid-outreach-verify/1.0",
      "Accept": "text/html,application/xhtml+xml"}
BASE = os.path.dirname(os.path.abspath(__file__))  # dossier.json / validation.json sit next to this script

def check(url, timeout=25):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read(4000).decode("utf-8", "replace")
            return {"url": url, "status": r.status, "ok": 200 <= r.status < 300,
                    "bytes_probe": len(body)}
    except Exception as e:
        return {"url": url, "status": None, "ok": False, "error": str(e)[:120]}

entries = json.load(open(os.path.join(BASE, "dossier.json"), encoding="utf-8"))["entries"]
results = []
for e in entries:
    r = check(e["url"])
    results.append(r)
    print(("OK  " if r["ok"] else "FAIL"), r.get("status"), r["url"][:90], flush=True)
    time.sleep(1)

out = {"verified_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
       "verifier": "dspaid (DSP-AID)", "method": "HTTP GET, browser UA, follow redirects",
       "all_ok": all(r["ok"] for r in results), "results": results}
json.dump(out, open(os.path.join(BASE, "validation.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("ALL_OK", out["all_ok"], "count", len(results))
sys.exit(0 if out["all_ok"] else 1)
