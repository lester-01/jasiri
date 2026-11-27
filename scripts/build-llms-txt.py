#!/usr/bin/env python3
"""Build llms.txt from index.html, so the plain-text summary for AI assistants
always says what the home page says.

    python3 scripts/build-llms-txt.py           # write llms.txt
    python3 scripts/build-llms-txt.py --check   # exit 1 if llms.txt is out of date

Release numbers (version, size, hashes) are left out on purpose: they change with
every release and live on the home page and the Check page.
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://jasiri.benlester.me"


def text(fragment: str) -> str:
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", fragment))).strip()


def build() -> str:
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    desc = re.search(r'<meta name="description" content="([^"]*)"', page).group(1)
    h1 = text(re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S).group(1))
    title = text(re.search(r"<title>(.*?)</title>", page, re.S).group(1))

    # Short headed blocks: <h3>Heading</h3><p>Body</p>
    blocks = [(text(h), text(p)) for h, p in re.findall(r"<h3[^>]*>(.*?)</h3>\s*<p[^>]*>(.*?)</p>", page, re.S) if text(p)]
    faq = [(text(q), text(a)) for q, a in re.findall(r"<details[^>]*>\s*<summary[^>]*>(.*?)</summary>(.*?)</details>", page, re.S)]

    lines = [
        "# Jasiri",
        "",
        f"> {desc}",
        "",
        f"{title}. {h1}",
        "",
        f"- Site: {SITE}/",
        f"- Features: {SITE}/features/",
        f"- Marketplace: {SITE}/marketplace/",
        f"- Check the APK (SHA-256, signing fingerprint, scan report): {SITE}/check/",
        f"- Privacy: {SITE}/privacy/",
        f"- Terms and license: {SITE}/terms/",
        "- Linux packages for Jasiri: https://apt.benlester.me (repository details: https://github.com/lester-01/jasiri-apt)",
        "- Built by Ben Lester: https://benlester.me",
        "- More projects: https://projects.benlester.me",
        "",
        "## What it does and how to start",
        "",
    ]
    lines += [f"- {h.rstrip('.')}: {b}" for h, b in blocks]
    lines += ["", "## Questions and answers", ""]
    for q, a in faq:
        lines += [f"### {q}", "", a, ""]
    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    out = ROOT / "llms.txt"
    new = build()
    if "--check" in sys.argv:
        if not out.is_file() or out.read_text(encoding="utf-8") != new:
            print("llms.txt is out of date: run python3 scripts/build-llms-txt.py")
            return 1
        print("llms.txt matches index.html")
        return 0
    out.write_text(new, encoding="utf-8")
    print(f"wrote {out.name} ({len(new)} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
