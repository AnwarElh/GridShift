#!/usr/bin/env python3
"""Pull the five Gridshift source feeds. Stdlib only — runs anywhere.

    python3 feeds.py [n_per_feed]   # default 25

Prints TSV: outlet, date, title, link. A feed that dies prints ERR and the
others still come through; a run with fewer than three healthy feeds is not
enough to write from.
"""
import sys, urllib.request, xml.etree.ElementTree as ET

FEEDS = {
    'PushSquare':  'https://www.pushsquare.com/feeds/latest',
    'GAMINGbible': 'https://www.gamingbible.com/index.rss',   # Atom
    'Kotaku':      'https://kotaku.com/rss',
    'GameSpot':    'https://www.gamespot.com/feeds/news/',
    'VG247':       'https://www.vg247.com/feed',
}
A = '{http://www.w3.org/2005/Atom}'


def entries(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    root = ET.fromstring(urllib.request.urlopen(req, timeout=25).read())
    # RSS keeps <item>/<link>; Atom keeps <entry> and hides the url in an attribute
    for it in root.findall('.//item') or root.findall(f'.//{A}entry'):
        link = it.findtext('link')
        if not link:
            el = it.find(f'{A}link')
            link = el.get('href') if el is not None else ''
        date = it.findtext('pubDate') or it.findtext(f'{A}updated') or ''
        yield date, (it.findtext('title') or it.findtext(f'{A}title') or ''), link


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 25
    ok = 0
    for name, url in FEEDS.items():
        try:
            rows = list(entries(url))[:n]
        except Exception as e:
            print(f'{name}\tERR\t{e}', file=sys.stderr)
            continue
        ok += bool(rows)
        for date, title, link in rows:
            print(f'{name}\t{date}\t{title}\t{link}')
    print(f'-- {ok}/{len(FEEDS)} feeds healthy', file=sys.stderr)
    return 0 if ok >= 3 else 1


if __name__ == '__main__':
    sys.exit(main())
