#!/usr/bin/env python3
"""Validate static site metadata, local links, images and sitemap."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
HOST = "weddingshedding.in"
errors = []
warnings = []
canonicals = {}
titles = {}

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs, self.ids, self.jsonld = [], set(), []
        self.canonical = self.robots = self.description = ""
        self.title = ""
        self.h1 = 0
        self.in_title = self.in_json = False
        self.json_buffer = ""
        self.missing_alt = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"): self.ids.add(a["id"])
        if tag == "title": self.in_title = True
        if tag == "h1": self.h1 += 1
        if tag == "meta":
            if a.get("name") == "robots": self.robots = a.get("content", "")
            if a.get("name") == "description": self.description = a.get("content", "")
        if tag == "link" and "canonical" in a.get("rel", "").split():
            self.canonical = a.get("href", "")
        if tag == "script" and a.get("type") == "application/ld+json":
            self.in_json = True
            self.json_buffer = ""
        if tag == "img" and "alt" not in a: self.missing_alt += 1
        for attr in ("href", "src", "poster"):
            if a.get(attr): self.refs.append(a[attr])
    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
        if tag == "script" and self.in_json:
            self.jsonld.append(self.json_buffer)
            self.in_json = False
    def handle_data(self, data):
        if self.in_title: self.title += data
        if self.in_json: self.json_buffer += data

def local_path(url, base):
    u = urlsplit(url)
    if u.scheme not in ("", "http", "https") or (u.netloc and u.netloc != HOST):
        return None
    if not u.path: return base
    path = unquote(u.path)
    p = (ROOT / path.lstrip("/")) if path.startswith("/") or u.netloc else (base.parent / path)
    if p.is_dir(): p /= "index.html"
    return p

for path in sorted(ROOT.glob("*.html")):
    p = Page()
    p.feed(path.read_text(encoding="utf-8"))
    for raw in p.jsonld:
        try: json.loads(raw)
        except ValueError as exc: errors.append(f"{path.name}: invalid JSON-LD: {exc}")
    for ref in set(p.refs):
        try: target = local_path(ref, path)
        except ValueError: warnings.append(f"{path.name}: malformed URL {ref}"); continue
        if target is not None and not target.is_file():
            errors.append(f"{path.name}: missing local resource {ref}")
    if p.missing_alt: warnings.append(f"{path.name}: {p.missing_alt} images without alt")
    if p.canonical:
        if p.canonical in canonicals: warnings.append(f"{path.name}: duplicate canonical {p.canonical}")
        canonicals[p.canonical] = path.name
    if p.title and "noindex" not in p.robots:
        if p.title in titles: warnings.append(f"{path.name}: duplicate title {p.title}")
        titles[p.title] = path.name
    if p.canonical and "noindex" not in p.robots:
        if p.h1 != 1: warnings.append(f"{path.name}: expected one H1, found {p.h1}")
        if not p.description: warnings.append(f"{path.name}: missing meta description")

try:
    tree = ET.parse(ROOT / "sitemap.xml")
    urls = [x.text for x in tree.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    if len(urls) != len(set(urls)): errors.append("sitemap: duplicate page URLs")
    for url in urls:
        target = local_path(url, ROOT / "index.html")
        if target is None or not target.is_file(): errors.append(f"sitemap: missing page {url}")
except (ET.ParseError, OSError) as exc:
    errors.append(f"sitemap: {exc}")
for item in warnings: print("WARNING:", item)
for item in errors: print("ERROR:", item)
print(f"Audit complete: {len(errors)} errors, {len(warnings)} warnings")
sys.exit(bool(errors))
