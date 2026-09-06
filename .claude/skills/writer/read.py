#!/usr/bin/env python3
"""Read an article's prose. Stdlib only.

    python3 read.py <url>

Tries Jina Reader first (clean markdown, works for most outlets), falls back to
fetching the page and pulling <p> text. Push Square needs the fallback — Jina
returns its forum sidebar instead of the article. GAMINGbible defeats both when
its anti-bot is armed; that is a real limit, not a bug to work around.
"""
import html, re, sys, urllib.request

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36'


def get(url, timeout=45):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    return urllib.request.urlopen(req, timeout=timeout).read().decode('utf-8', 'replace')


def via_jina(url):
    txt = get('https://r.jina.ai/' + url)
    if txt.lstrip().startswith('{"data":null'):   # abuse-block JSON, not an article
        return []
    txt = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', txt)
    return [l for l in (x.strip() for x in txt.splitlines()) if is_prose(l)]


def is_prose(line):
    """A paragraph, not a nav row. Push Square's sidebar survives Jina as a list
    of long markdown links, and those read as 'long lines' unless we say otherwise."""
    if len(line) < 120 or line[:1] in '*-#|>':
        return False
    return '](' not in line and not line.startswith('URL Source')


def via_paragraphs(url):
    body = get(url)
    body = re.sub(r'<(script|style|figure|aside|nav)[^>]*>.*?</\1>', '', body, flags=re.S)
    out = []
    for p in re.findall(r'<p[^>]*>(.*?)</p>', body, re.S):
        s = html.unescape(re.sub(r'<[^>]+>', '', p)).strip()
        if len(s) > 90:
            out.append(s)
    return out


def read(url):
    for fn in (via_jina, via_paragraphs):
        try:
            lines = fn(url)
        except Exception:
            continue
        # a real article has several paragraphs; a nav dump has one or none
        if len(lines) >= 3:
            return lines
    return []


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    lines = read(sys.argv[1])
    if not lines:
        print('could not read this article (anti-bot, or not an article page)', file=sys.stderr)
        sys.exit(1)
    print('\n\n'.join(lines))
