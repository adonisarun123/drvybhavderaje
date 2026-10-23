"""
One-off: change contact@drvybhavderaje.com -> connect@drvybhavderaje.com in the patient-information PDFs.

The PDFs are Word exports: WinAnsi TrueType subsets, and every text run is its own BT…ET block placed at an
absolute Tm position, with the address often split across several runs ("cont" | "act@drv…"). We swap only
the two differing characters ('t','a' -> 'n','e') inside the literal strings, keep the kerning, and then push
every later run on the same baseline right by the extra glyph width so nothing overlaps. Finally the mailto:
link annotations are updated. Run on pristine files (git checkout) — it is not idempotent by design.

Usage: python3 scripts/pdf-replace-email.py public/images/pdf
"""
import glob
import os
import re
import sys

import pymupdf as fz

OLD, NEW = "contact@drvybhavderaje.com", "connect@drvybhavderaje.com"
LIT = re.compile(rb"\((?:\\.|[^\\)])*\)", re.S)
BLOCK = re.compile(rb"BT\b(.*?)\bET", re.S)
TF = re.compile(rb"/(\S+)\s+([\d.]+)\s+Tf")
TM = re.compile(rb"([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm")


def chars_of(lit: bytes, base: int):
    """Yield (decoded_char, absolute_byte_offset or None) for a PDF literal string token starting at base."""
    i = 1
    while i < len(lit) - 1:
        c = lit[i : i + 1]
        if c == b"\\":
            m = re.match(rb"[0-7]{1,3}", lit[i + 1 : i + 4])
            if m:
                yield chr(int(m.group(), 8)), None
                i += 1 + len(m.group())
                continue
            yield lit[i + 1 : i + 2].decode("latin-1"), None
            i += 2
            continue
        yield c.decode("latin-1"), base + i
        i += 1


def font_widths(doc, page):
    out = {}
    for xref, _ext, _type, _base, name, _enc in page.get_fonts():
        kind, first = doc.xref_get_key(xref, "FirstChar")
        kind2, arr = doc.xref_get_key(xref, "Widths")
        if kind2 == "xref":
            arr = doc.xref_object(int(arr.split()[0]), compressed=True)
            kind2 = "array"
        if kind == "int" and kind2 == "array":
            out[name] = (int(first), [float(v) for v in arr.strip("[]").split()])
    return out


def width(widths, font, ch):
    first, ws = widths[font]
    return ws[ord(ch) - first]


def fix_stream(s: bytes, widths):
    blocks = []
    text, offs, owner = [], [], []
    for bi, bm in enumerate(BLOCK.finditer(s)):
        body_start, body = bm.start(1), bm.group(1)
        tf, tm = TF.search(body), TM.search(body)
        blocks.append({
            "font": tf.group(1).decode() if tf else None,
            "size": float(tf.group(2)) if tf else 0.0,
            "x": float(tm.group(5)) if tm else None,
            "y": float(tm.group(6)) if tm else None,
            "xspan": (body_start + tm.start(5), body_start + tm.end(5)) if tm else None,
            "delta": 0.0,
        })
        for lm in LIT.finditer(body):
            for ch, off in chars_of(lm.group(), body_start + lm.start()):
                text.append(ch)
                offs.append(off)
                owner.append(bi)
    joined = "".join(text)
    buf = bytearray(s)
    n = 0
    for m in re.finditer(re.escape(OLD), joined):
        for k, (a, b) in enumerate(zip(OLD, NEW)):
            if a == b:
                continue
            idx = m.start() + k
            off = offs[idx]
            assert off is not None and buf[off : off + 1] == a.encode()
            buf[off : off + 1] = b.encode()
            blk = blocks[owner[idx]]
            blk["delta"] += (width(widths, blk["font"], b) - width(widths, blk["font"], a)) * blk["size"] / 1000
        n += 1
    if not n:
        return s, 0
    edits = []
    for i, blk in enumerate(blocks):
        if blk["xspan"] is None:
            continue
        shift = sum(p["delta"] for p in blocks[:i] if p["y"] is not None and abs(p["y"] - blk["y"]) < 0.5 and p["x"] <= blk["x"])
        if shift:
            edits.append((blk["xspan"], f"{blk['x'] + shift:.3f}".encode()))
    for (a, b), val in sorted(edits, reverse=True):
        buf[a:b] = val
    return bytes(buf), n


def main(root: str):
    for f in sorted(glob.glob(f"{root}/**/*.pdf", recursive=True)):
        d = fz.open(f)
        total = 0
        for page in d:
            widths = font_widths(d, page)
            for x in page.get_contents():
                new, n = fix_stream(d.xref_stream(x), widths)
                if n:
                    d.update_stream(x, new)
                    total += n
            for link in page.get_links():
                if link.get("uri", "").lower() == f"mailto:{OLD}":
                    link["uri"] = f"mailto:{NEW}"
                    page.update_link(link)
        d.save(f + ".tmp", garbage=3, deflate=True)
        d.close()
        os.replace(f + ".tmp", f)
        print(f"{total:2d} replaced  {f}")


if __name__ == "__main__":
    main(sys.argv[1])
