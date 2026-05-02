import asyncio
import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime
from html import unescape
from typing import Optional

import httpx
from bs4 import BeautifulSoup, Tag

try:
    from playwright.async_api import async_playwright
except Exception:  # pragma: no cover - optional dependency
    async_playwright = None


ASYNC_CONCURRENCY = 5
HTTP_TIMEOUT_SEC = 15
MIN_PRICE_VND = 100
PLAYWRIGHT_TIMEOUT_MS = 25000

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
}

PLAYWRIGHT_FALLBACK_ENABLED = True

PACKAGING_UNITS = [
    "Băng", "Bịch", "Bình xịt", "Bộ", "Cái", "Cây", "Chai",
    "Cuộn", "Dây", "Đai", "Gói", "Hộp", "Hộp 2 bút", "Hộp 25 ống",
    "Hộp lớn", "Hộp to", "Hũ", "Kít", "Liều", "Lọ", "Lọ 5 ml", "Lốc",
    "Lốc 6 hộp", "Nẹp", "Ống", "Que", "Thùng", "Tube", "Túi", "Tuýp",
    "Vỉ", "Vỉ 12", "Viên",
]

PACKAGING_NORMALIZE = {
    'bịch': 'Bịch', 'bich': 'Bịch',
    'bình xịt': 'Bình xịt', 'binh xit': 'Bình xịt',
    'bộ': 'Bộ', 'bo': 'Bộ',
    'cái': 'Cái', 'cai': 'Cái',
    'chai': 'Chai',
    'gói': 'Gói', 'goi': 'Gói',
    'hộp': 'Hộp', 'hop': 'Hộp',
    'hộp 2 bút': 'Hộp 2 bút', 'hop 2 but': 'Hộp 2 bút',
    'hộp 25 ống': 'Hộp 25 ống', 'hop 25 ong': 'Hộp 25 ống',
    'hộp lớn': 'Hộp lớn', 'hop lon': 'Hộp lớn',
    'hộp to': 'Hộp to', 'hop to': 'Hộp to',
    'hũ': 'Hũ', 'hu': 'Hũ',
    'lọ': 'Lọ', 'lo': 'Lọ',
    'lọ 5 ml': 'Lọ 5 ml', 'lo 5 ml': 'Lọ 5 ml',
    'lốc': 'Lốc', 'loc': 'Lốc',
    'lốc 6 hộp': 'Lốc 6 hộp', 'loc 6 hop': 'Lốc 6 hộp',
    'que': 'Que',
    'thùng': 'Thùng', 'thung': 'Thùng',
    'tube': 'Tube',
    'túi': 'Túi', 'tui': 'Túi',
    'tuýp': 'Tuýp', 'tuyp': 'Tuýp',
    'vỉ': 'Vỉ', 'vi': 'Vỉ',
    'vỉ 12': 'Vỉ 12', 'vi 12': 'Vỉ 12',
    'viên': 'Viên', 'vien': 'Viên',
    'cây': 'Cây', 'cay': 'Cây',
    'cuộn': 'Cuộn', 'cuon': 'Cuộn',
    'dây': 'Dây', 'day': 'Dây',
    'kít': 'Kít', 'kit': 'Kít',
    'nẹp': 'Nẹp', 'nep': 'Nẹp',
    'băng': 'Băng', 'bang': 'Băng',
    'đai': 'Đai', 'dai': 'Đai',
    'liều': 'Liều', 'lieu': 'Liều',
    'ống': 'Ống', 'ong': 'Ống',
}

_VALID_UNIT_KEYS = set(PACKAGING_NORMALIZE.keys())

# Internal unit code fallback (Long Chau backend mapping)
UNIT_CODE_MAP = {
    1: 'Hộp', 2: 'Tuýp', 4: 'Chai', 8: 'Viên', 13: 'Vỉ', 15: 'Ống',
}

# ─── Compiled Regex ───────────────────────────────────────────────────
# Matches: 148,500 ₫/hộp | 168,000 ₫/ hộp. | 1.100.000đ/chai | 122,000 ₫/Hộp,
#           209,00đ/Hộp | 490,000 ₫/ 2 cây | 105.₫/hộp (dot-only thousands)
#           148.000đ/ hộp | 390.000 đồng/túi | 254,000 đ/hộp | 380.000đ/ Hộp
# Slash may touch đ: ...đ/chai. Optional qty between / and unit.
# Currency: prefer đ[ồo]ng before [₫đd] so "đồng" is not split.

_RE_PRICE_UNIT = re.compile(
    r'([\d]+(?:[.,]\d+)*(?:\s*(?:k|ngàn|ngan|nghìn|nghin|triệu|trieu))?)'
    r'(?:\s*[.,]\s*)?'
    r'\s*'
    r'(?:đ[ồo]ng|dong|vn[đd]|[₫đd])?'
    r'\s*'
    r'(?:/\s*|\s*/\s*|\s+cho\s+|\s+mỗi\s+|\s+per\s+|\s+1\s+)'
    r'(?:(\d+)\s+)?'
    r'([a-zA-ZÀ-ỹ]+'
    r'(?:\s+\d+(?:\s+[a-zA-ZÀ-ỹ]+)?'
    r'|\s+[a-zA-ZÀ-ỹ]+(?:\s+\d+\s+[a-zA-ZÀ-ỹ]+)?)?)',
    re.IGNORECASE,
)

_RE_PRICE_DOT_CURRENCY = re.compile(
    r'(\d{1,4})\.\s*(?:[₫đd]|vn[đd])\s*/\s*(?:(\d+)\s+)?([a-zA-ZÀ-ỹ]+)',
    re.IGNORECASE,
)

# "giá X ₫" without unit — also "giá là 22.000", "đang có giá: 330.000đ", "Hiện tại ... có giá 259,000 ₫."
_RE_GIA_ONLY = re.compile(
    r'(?:đang\s+)?(?:có\s+)?giá\s*(?:là\s*)?:?\s*([\d]+(?:[.,]\d+)*(?:\s*(?:k|ngàn|ngan|nghìn|nghin|triệu|trieu))?)'
    r'[.\s]*(?:đ[ồo]ng|dong|vn[đd]|[₫đd])?',
    re.IGNORECASE,
)

# "có giá 201.000đ/ hộp", "có giá là 181,500 đ/ Hộp"
_RE_CO_GIA_SLASH_UNIT = re.compile(
    r'có\s+giá\s*(?:là\s*)?\s*'
    r'([\d]{1,3}(?:[.,]\d{3})+|\d{4,7})\s*'
    r'(?:đ[ồo]ng|dong|vn\s*đ|vn[đd]|[₫đd])?\s*/\s*(?:(\d+)\s+)?([a-zA-ZÀ-ỹ]+)',
    re.IGNORECASE,
)

# "105000 /vỉ", "181.500 đ / Hộp" (Q&A / text thường)
_RE_LOOSE_PRICE_SLASH_UNIT = re.compile(
    r'([\d]{1,3}(?:[.,]\d{3})+|\d{4,7})\s*'
    r'(?:đ[ồo]ng|dong|vn\s*đ|vn[đd]|[₫đd])?\s*/\s*(?:(\d+)\s+)?([a-zA-ZÀ-ỹ]+)',
    re.IGNORECASE,
)

# "Dạ sản phẩm có giá 105,000 ₫/ hộp" (không có "Hiện tại")
_RE_DA_SANPHAM_CO_GIA = re.compile(
    r'(?:dạ|da)\s+sản\s+phẩm\s+có\s+giá\s*'
    r'([\d]{1,3}(?:[.,]\d{3})+|\d{4,7})\s*'
    r'(?:đ[ồo]ng|dong|vn\s*đ|vn[đd]|[₫đd])?\s*/\s*(?:(\d+)\s+)?([a-zA-ZÀ-ỹ]+)',
    re.IGNORECASE,
)

# Detect "N hộp X có giá Y" → need to divide Y by N
_RE_MULTI_BOX = re.compile(
    r'(\d+)\s+(hộp|hop|vỉ|vi|chai|lọ|lo|tuýp|tuyp|ống|ong)\s+([^0-9\n]{0,35}?)(?:có\s+)?giá\s+([\d]+(?:[.,]\d+)*)[.\s]*(?:đ[ồo]ng|dong|vn[đd]|[₫đd])?',
    re.IGNORECASE,
)

# "1 hộp có giá 399,000 ₫" / "15 viên có giá 199,500₫" → divide by N
_RE_N_UNIT_CO_GIA = re.compile(
    r'(\d+)\s+(hộp|hop|vỉ|vi|viên|vien|chai|lọ|lo|tuýp|tuyp|ống|ong|gói|goi|túi|tui|tube)\s+'
    r'(?:có\s+)?giá\s*(?:là\s*)?\s*'
    r'([\d]{1,3}(?:[.,]\d{3})+|\d{4,7})\s*'
    r'(?:đ[ồo]ng|dong|vn\s*đ|vn[đd]|[₫đd])?',
    re.IGNORECASE,
)


def _strip_html_tags(text: str) -> str:
    """Remove HTML tags from Q&A text, preserving text content."""
    if not text or '<' not in text:
        return text
    try:
        soup = BeautifulSoup(text, 'html.parser')
        return soup.get_text(' ', strip=False).strip()
    except Exception:
        return re.sub(r'<[^>]+>', ' ', text).strip()


# ─── Price Parsing ────────────────────────────────────────────────────

def _resolve_separator(left, right):
    n = len(right)
    if n == 3:
        return left + right
    elif n == 2:
        return left + right + '0'
    elif n >= 4:
        return left + right[:3]
    else:
        return left + right


def parse_price_string(raw, assume_vnd_currency=False):
    if not raw:
        return None
    s_orig = raw.strip()
    s = s_orig.lower()

    multiplier = 1
    if any(x in s for x in ['triệu', 'trieu']):
        multiplier = 1000000
    elif any(x in s for x in ['k', 'ngàn', 'ngan', 'nghìn', 'nghin']):
        multiplier = 1000

    # "105.₫" / "105. đ" — dot marks thousands group, digits after dot omitted (site glitch)
    m_dot = re.search(r'(\d{1,4})\.\s*(?:[₫đd]|vn[đd])', s_orig, re.IGNORECASE)
    if m_dot:
        try:
            val = int(m_dot.group(1)) * 1000
            return str(val) if val >= MIN_PRICE_VND else None
        except ValueError:
            pass

    s_clean = re.sub(r'[a-zà-ỹ\s₫$]', '', s)
    s_clean = s_clean.rstrip('.,')

    m = re.search(r'\d[\d.,]*\d|\d', s_clean)
    if not m:
        return None
    num = m.group(0)

    dots, commas = num.count('.'), num.count(',')

    # "209,00" / "209,00đ" — typo for 209.000 đ (2-digit tail = hundreds in VN shorthand)
    if (assume_vnd_currency or re.search(r'[₫đ]|dong', raw, re.IGNORECASE)) and commas == 1 and dots == 0:
        left, right = num.split(',')
        if right.isdigit() and len(right) == 2 and left.isdigit() and 1 <= len(left) <= 4:
            try:
                val = int(left) * 1000 + int(right) * 10
                if val >= MIN_PRICE_VND:
                    return str(val)
            except ValueError:
                pass

    # "330.0000" — extra digit in thousands tail → 330000 (VN đồng listings)
    if (assume_vnd_currency or re.search(r'[₫đ]|dong', raw, re.IGNORECASE)) and dots == 1 and commas == 0:
        left, right = num.split('.')
        if right.isdigit() and len(right) == 4 and right.endswith('000'):
            try:
                val = int(left + right[:3])
                if val >= MIN_PRICE_VND:
                    return str(val)
            except ValueError:
                pass

    if dots + commas == 0:
        result = float(num)
    elif dots > 1:
        result = float(num.replace('.', ''))
    elif commas > 1:
        result = float(num.replace(',', ''))
    elif dots == 1 and commas == 1:
        dot_pos = num.index('.')
        comma_pos = num.index(',')
        if dot_pos < comma_pos:
            r_str = num[:comma_pos].replace('.', '')
            r_dec = num[comma_pos + 1:]
            result = float(r_str) + float("0." + r_dec) if r_dec else float(r_str)
        else:
            r_str = num[:dot_pos].replace(',', '')
            r_dec = num[dot_pos + 1:]
            result = float(r_str) + float("0." + r_dec) if r_dec else float(r_str)
    elif dots == 1:
        left, right = num.split('.')
        if multiplier > 1:
            result = float(num)
        else:
            result = float(_resolve_separator(left, right))
    else:
        left, right = num.split(',')
        if multiplier > 1:
            result = float(num.replace(',', '.'))
        else:
            result = float(_resolve_separator(left, right))

    try:
        val = int(result * multiplier)
        return str(val) if val >= MIN_PRICE_VND else None
    except Exception:
        return None


# ─── Packaging / Product helpers ──────────────────────────────────────

def normalize_packaging(unit_str):
    if not unit_str:
        return unit_str
    key = unit_str.lower().strip()
    return PACKAGING_NORMALIZE.get(key, unit_str.strip())


def normalize_product_name(name):
    if not name:
        return ""
    return re.sub(r'\s+', ' ', name.lower().strip())


EXCLUDE_PHRASES = [
    'sản phẩm tương tự', 'san pham tuong tu',
    'tham khảo sản phẩm', 'tham khao san pham',
    'thuốc thay thế', 'thuoc thay the',
    'sản phẩm thay thế', 'san pham thay the',
    'thay thế bằng', 'thay the bang',
    'tham khảo thêm', 'tham khao them',
    'tham khảo mẫu', 'tham khao mau',
]

# Reply nhân viên LC: không chỉ nhãn "Dược sĩ" (còn "Tư vấn viên", mẫu "Hiện tại… sản phẩm… có giá")
_RE_STAFF_PRICE_IN_TEXT = re.compile(
    r'(?:[\d]{1,3}(?:[.,]\d{3})+|\d{4,})\s*(?:[₫đ]|đ\s*/|vn\s*đ|\bđ\b)',
    re.I,
)


def _is_staff_price_reply_text(t: str) -> bool:
    """True nếu đoạn giống câu trả lời nhân viên báo giá (kể cả không có chữ 'Dược sĩ')."""
    t = (t or "").strip()
    if len(t) < 22:
        return False
    low = t.casefold()
    if not re.search(r"\d", t):
        return False
    has_price_signal = (
        _RE_STAFF_PRICE_IN_TEXT.search(t) is not None
        or (
            ("có giá" in low or "co gia" in low)
            and re.search(r"\d{3,}", t)
        )
    )
    if not has_price_signal:
        return False
    if any(
        x in low
        for x in (
            "dược sĩ",
            "duoc si",
            "tư vấn viên",
            "tu van vien",
            "nhà thuốc long châu",
            "nha thuoc long chau",
            "fpt long châu",
            "fpt long chau",
        )
    ):
        return True
    if ("hiện tại" in low or "hien tai" in low) and (
        "sản phẩm" in low or "san pham" in low
    ) and ("có giá" in low or "co gia" in low):
        return True
    if re.search(r"\bdạ\s+sản\s+phẩm\s+có\s+giá\s+[\d.,\s₫đ]+", low, re.I):
        return True
    if (low.startswith("chào ") or low.startswith("chao ")) and (
        "sản phẩm" in low or "san pham" in low
    ) and ("có giá" in low or "co gia" in low):
        return True
    return False


def is_comment_about_product(product_name, text):
    """Check if comment text is about the target product (not a different one)."""
    if not product_name or not text:
        return True

    lower_text = text.casefold()

    # Reply "sản phẩm tương tự" (giá SP khác) — nhưng vẫn nhận câu báo giá đúng SP: "Dạ sản phẩm có giá …"
    if any(p in lower_text for p in EXCLUDE_PHRASES):
        if re.search(r'dạ\s+sản\s+phẩm\s+có\s+giá\s+[\d.,\s]+', lower_text, re.IGNORECASE):
            pass
        else:
            return False

    # Generic pharmacist reply referencing "sản phẩm" without a link → likely about this product
    if ('sản phẩm' in lower_text or 'san pham' in lower_text) and 'href=' not in lower_text:
        return True

    prod = normalize_product_name(product_name)
    if prod in lower_text:
        return True
    # ASCII brand names (Adagrin / ADAGRIN / AdAgrin)
    prod_cf = re.sub(r'\s+', ' ', product_name).strip().casefold()
    if prod_cf and prod_cf in lower_text:
        return True

    # Check significant words from product name
    stop = {'thuốc', 'thuoc', 'viên', 'vien', 'hộp', 'hop', 'mg', 'g', 'ml',
            'điều', 'trị', 'dieu', 'tri', 'mạn', 'tính', 'man', 'tinh'}
    words = [w for w in prod.split() if len(w) > 2 and w not in stop]
    if words and any(w.casefold() in lower_text for w in words):
        return True

    # Short text without product reference → allow if < 100 chars (could be a curt pharmacist reply)
    return len(text) < 100


# ─── Extract prices from pharmacist comments ─────────────────────────

def _split_pharmacist_qa_chunks(text):
    """Tách khối Q&A dài (nhiều reply dính nhau) để không vứt cả cụm vì một đoạn 'sản phẩm tương tự'."""
    t = (text or '').strip()
    if len(t) < 15:
        return [t] if t else []
    parts = re.split(r'(?:\r?\n){2,}', t)
    parts = [p.strip() for p in parts if len(p.strip()) >= 12]
    if len(parts) >= 2:
        return parts
    sub = re.split(
        r'(?<=[\n\r])(?=[^\n]{5,120}(?:Dược\s*sĩ|Tư\s*vấn\s*viên))',
        t,
        flags=re.IGNORECASE,
    )
    sub = [s.strip() for s in sub if len(s.strip()) >= 12]
    if len(sub) >= 2:
        return sub
    sub2 = re.split(r'(?=\b[Dd]ạ\s+sản\s+phẩm\s+có\s+giá)', t)
    sub2 = [s.strip() for s in sub2 if len(s.strip()) >= 12]
    if len(sub2) >= 2:
        return sub2
    return [t]


def _qa_normalize_unit_key(unit_raw: str, expected_units=None) -> Optional[str]:
    unit_key = (unit_raw or "").strip().rstrip(".,;:!?)").lower()
    unit_key = re.sub(r"\s+ạ$", "", unit_key).strip()
    if not unit_key:
        return None
    unit_key = re.sub(r"[/|]+", " ", unit_key)
    unit_key = re.sub(r"\s+", " ", unit_key).strip()

    candidates = [unit_key]
    no_qty = re.sub(r"^\d+\s*", "", unit_key).strip()
    if no_qty and no_qty not in candidates:
        candidates.append(no_qty)
    if " " in unit_key:
        first_word = unit_key.split()[0]
        if first_word and first_word not in candidates:
            candidates.append(first_word)

    for c in candidates:
        if c in _VALID_UNIT_KEYS:
            return normalize_packaging(c)

    if expected_units:
        expected_norm = [normalize_packaging(u) for u in expected_units if u]
        expected_lc = {e.lower(): e for e in expected_norm}
        for c in candidates:
            if c in expected_lc:
                return expected_lc[c]
        for c in candidates:
            for e_lc, e in expected_lc.items():
                if c and (c.startswith(e_lc) or e_lc.startswith(c)):
                    return e

    return None


def _qa_chunk_unit_prices(chunk: str, expected_units=None) -> dict:
    """Một chunk Q&A → {ĐVT: giá}; trong chunk giữ LEFTMOST (first) mỗi ĐVT — giá đầu tiên là mới nhất."""
    out = {}
    found_in_comment = set()

    # ── "N unit có giá X" — highest priority, handles "1 hộp có giá 399,000₫" ──
    for m in _RE_N_UNIT_CO_GIA.finditer(chunk):
        qty_raw, unit_raw, price_raw = m.group(1), m.group(2), m.group(3)
        unit = _qa_normalize_unit_key(unit_raw or "", expected_units=expected_units)
        if not unit:
            continue
        price = parse_price_string(price_raw, assume_vnd_currency=True)
        if not price:
            continue
        qty = max(int(qty_raw), 1)
        if qty > 1:
            price = str(int(int(price) // qty))
        if unit not in out:
            out[unit] = price
            found_in_comment.add(unit)

    for m in _RE_DA_SANPHAM_CO_GIA.finditer(chunk):
        price_raw, qty_raw, unit_raw = m.group(1), m.group(2), m.group(3)
        unit = _qa_normalize_unit_key(unit_raw or "", expected_units=expected_units)
        if not unit:
            continue
        price = parse_price_string(price_raw, assume_vnd_currency=True)
        if not price:
            snippet = chunk[max(0, m.start() - 2) : m.end() + 2]
            price = parse_price_string(snippet, assume_vnd_currency=True)
        if not price:
            continue
        qty = 1
        if qty_raw and qty_raw.isdigit():
            qty = max(int(qty_raw), 1)
        if qty > 1:
            price = str(int(int(price) // qty))
        if unit not in out:
            out[unit] = price
            found_in_comment.add(unit)

    _pu_candidates = []
    for m in _RE_PRICE_UNIT.finditer(chunk):
        price_raw, qty_raw, unit_raw = m.group(1), m.group(2), m.group(3)
        unit = _qa_normalize_unit_key(unit_raw or "", expected_units=expected_units)
        if not unit:
            continue
        snippet = chunk[max(0, m.start() - 2) : m.end() + 2]
        price = parse_price_string(snippet, assume_vnd_currency=True)
        if not price:
            price = parse_price_string(price_raw, assume_vnd_currency=True)
        if not price:
            continue
        qty = 1
        if qty_raw and qty_raw.isdigit():
            qty = max(int(qty_raw), 1)
        if qty > 1:
            price = str(int(int(price) // qty))
        _pu_candidates.append((m.start(), unit, price))

    # Keep FIRST (leftmost) match per unit — first answer = most recent price
    _pu_best = {}
    for _pos, _unit, _price in sorted(_pu_candidates, key=lambda t: t[0]):
        if _unit not in _pu_best:
            _pu_best[_unit] = _price
    for _unit, _price in _pu_best.items():
        if _unit not in out:  # Don't overwrite higher-priority regex matches
            out[_unit] = _price
            found_in_comment.add(_unit)

    for m in _RE_PRICE_DOT_CURRENCY.finditer(chunk):
        qty_raw, unit_raw = m.group(2), m.group(3)
        unit = _qa_normalize_unit_key(unit_raw or "", expected_units=expected_units)
        if not unit or unit in found_in_comment:
            continue
        price = parse_price_string(m.group(0), assume_vnd_currency=True)
        if not price:
            continue
        qty = 1
        if qty_raw and qty_raw.isdigit():
            qty = max(int(qty_raw), 1)
        if qty > 1:
            price = str(int(int(price) // qty))
        out[unit] = price
        found_in_comment.add(unit)

    for mm in _RE_MULTI_BOX.finditer(chunk):
        qty = max(int(mm.group(1)), 1)
        unit = normalize_packaging(mm.group(2).lower().strip())
        if unit in found_in_comment:
            continue
        price = parse_price_string(mm.group(4), assume_vnd_currency=True)
        if price and qty > 1:
            price = str(int(price) // qty)
        if price:
            out[unit] = price
            found_in_comment.add(unit)

    for m in _RE_CO_GIA_SLASH_UNIT.finditer(chunk):
        price_raw, qty_raw, unit_raw = m.group(1), m.group(2), m.group(3)
        unit = _qa_normalize_unit_key(unit_raw or "", expected_units=expected_units)
        if not unit or unit in out:
            continue
        price = parse_price_string(price_raw, assume_vnd_currency=True)
        if not price:
            continue
        qty = 1
        if qty_raw and qty_raw.isdigit():
            qty = max(int(qty_raw), 1)
        if qty > 1:
            price = str(int(int(price) // qty))
        out[unit] = price
        found_in_comment.add(unit)

    for m in _RE_LOOSE_PRICE_SLASH_UNIT.finditer(chunk):
        price_raw, qty_raw, unit_raw = m.group(1), m.group(2), m.group(3)
        unit = _qa_normalize_unit_key(unit_raw or "", expected_units=expected_units)
        if not unit or unit in out:
            continue
        snippet = chunk[max(0, m.start() - 2) : m.end() + 2]
        price = parse_price_string(snippet, assume_vnd_currency=True)
        if not price:
            price = parse_price_string(price_raw, assume_vnd_currency=True)
        if not price:
            continue
        qty = 1
        if qty_raw and qty_raw.isdigit():
            qty = max(int(qty_raw), 1)
        if qty > 1:
            price = str(int(int(price) // qty))
        out[unit] = price
        found_in_comment.add(unit)

    if not found_in_comment:
        fm = _RE_GIA_ONLY.search(chunk)
        if fm:
            price = parse_price_string(fm.group(0), assume_vnd_currency=True)
            if not price:
                price = parse_price_string(fm.group(1), assume_vnd_currency=True)
            if price:
                # Check for preceding "N unit" context before the "giá" match
                prefix = chunk[:fm.start()]
                m_ctx = re.search(
                    r'(\d+)\s+(hộp|hop|vỉ|vi|viên|vien|chai|lọ|lo|tuýp|tuyp|ống|ong|gói|goi|túi|tui|tube)\s*$',
                    prefix, re.IGNORECASE,
                )
                if m_ctx:
                    ctx_unit = _qa_normalize_unit_key(m_ctx.group(2), expected_units=expected_units)
                    ctx_qty = max(int(m_ctx.group(1)), 1)
                    if ctx_unit:
                        if ctx_qty > 1:
                            price = str(int(int(price) // ctx_qty))
                        out[ctx_unit] = price
                    else:
                        out["Hộp"] = price
                else:
                    out["Hộp"] = price

    return out


def extract_prices_from_pharmacist_texts(texts, product_name, _expected_units=None):
    """Parse toàn bộ comment/chunk Q&A; gộp theo ĐVT.

    Ưu tiên: (1) chunk có 'Hiện tại' → lấy giá ĐẦU TIÊN gặp,
             (2) không có 'Hiện tại' → lấy giá ĐẦU TIÊN (= comment mới nhất, API trả DESC).
    Giá ở đằng trước (first) là giá mới nhất trong Q&A.
    """
    expected_units = _expected_units or []
    # first_price[unit] = (price, is_hien_tai) — chỉ lấy lần gặp ĐẦU TIÊN mỗi ĐVT
    first_price = {}       # unit -> price (from first non-hien-tai chunk)
    first_price_ht = {}    # unit -> price (from first hien-tai chunk)

    for text in texts:
        if not text or not text.strip():
            continue
        for chunk in _split_pharmacist_qa_chunks(text):
            lower_c = chunk.lower()
            if any(p in lower_c for p in EXCLUDE_PHRASES):
                continue
            if product_name and not is_comment_about_product(product_name, chunk):
                continue
            hien_tai = (
                "hiện tại" in lower_c
                or "hien tai" in lower_c
                or bool(
                    re.search(r"\bdạ\s+sản\s+phẩm\s+có\s+giá", lower_c, re.I)
                )
            )
            part = _qa_chunk_unit_prices(chunk, expected_units=expected_units)
            for u, p in part.items():
                if hien_tai and u not in first_price_ht:
                    first_price_ht[u] = p
                elif not hien_tai and u not in first_price:
                    first_price[u] = p

    # Merge: hien_tai wins over non-hien_tai; within each, first occurrence wins
    all_units = set(first_price_ht.keys()) | set(first_price.keys())
    prices = []
    for u in all_units:
        if u in first_price_ht:
            pick = first_price_ht[u]
        else:
            pick = first_price[u]
        prices.append({"unit": u, "price": pick})
    return sorted(prices, key=lambda x: x["unit"])


# ─── Packaging hierarchy extraction ───────────────────────────────────

def extract_packaging_hierarchy(prices_array):
    """Parse productSpecs from __NEXT_DATA__ prices array to build a hierarchy.

    Returns a dict with:
      - 'units': ordered list of {'name': str, 'level': int, 'isSellDefault': bool}
      - 'multipliers': dict mapping (parent_unit, child_unit) -> int multiplier
      - 'sell_default': name of the isSellDefault unit (the unit pharmacists typically quote)
      - 'total_smallest': dict mapping each unit -> how many of the smallest unit it contains

    Example for "Hộp 10 Vỉ x 10 Viên":
      multipliers = {('Hộp','Vỉ'): 10, ('Vỉ','Viên'): 10}
      total_smallest = {'Hộp': 100, 'Vỉ': 10, 'Viên': 1}
    """
    if not prices_array or not isinstance(prices_array, list):
        return None

    units = []
    sell_default = None

    # Sort by level (1=largest, 3=smallest)
    sorted_entries = sorted(
        [e for e in prices_array if isinstance(e, dict) and e.get('measureUnitName')],
        key=lambda e: e.get('level', 99)
    )

    if not sorted_entries:
        return None

    for entry in sorted_entries:
        u_name = normalize_packaging(entry['measureUnitName'])
        units.append({
            'name': u_name,
            'level': entry.get('level', 99),
            'isSellDefault': entry.get('isSellDefault', False),
            'specs': entry.get('productSpecs', ''),
        })
        if entry.get('isSellDefault'):
            sell_default = u_name

    if not sell_default and units:
        # Fallback: highest level number = smallest unit = likely sell default
        sell_default = units[-1]['name']

    # Parse multipliers from the level-1 (Hộp) specs
    # e.g. "Hộp 10 Vỉ x 10 Viên" → Hộp has 10 Vỉ, each Vỉ has 10 Viên
    # e.g. "Hộp 20 Ống x 10ml" → Hộp has 20 Ống
    multipliers = {}  # (parent, child) -> qty
    total_smallest = {}

    # Use the top-level (Hộp) specs to extract quantities
    top_specs = units[0]['specs'] if units else ''
    # Find all "N UnitName" pairs
    qty_unit_pairs = re.findall(r'(\d+)\s+([A-ZÀ-Ỹa-zà-ỹ]+)', top_specs)

    # Build chain: Hộp -> qty1 -> Unit1 -> qty2 -> Unit2 ...
    unit_names = [u['name'] for u in units]
    parsed_chain = []  # [(qty, unit_name), ...]
    for qty_str, u_raw in qty_unit_pairs:
        u_norm = normalize_packaging(u_raw)
        if u_norm in unit_names:
            parsed_chain.append((int(qty_str), u_norm))

    # Build multipliers between adjacent levels
    if parsed_chain:
        prev_unit = units[0]['name']  # Hộp
        for qty, child_unit in parsed_chain:
            if child_unit != prev_unit:
                multipliers[(prev_unit, child_unit)] = qty
                prev_unit = child_unit

    # Calculate total_smallest (how many of the smallest unit each unit contains)
    if units:
        smallest = units[-1]['name']
        total_smallest[smallest] = 1

        # Walk from smallest to largest
        for i in range(len(units) - 2, -1, -1):
            parent = units[i]['name']
            child = units[i + 1]['name']
            mult = multipliers.get((parent, child), 1)
            total_smallest[parent] = mult * total_smallest.get(child, 1)

    return {
        'units': units,
        'multipliers': multipliers,
        'sell_default': sell_default,
        'total_smallest': total_smallest,
    }


# ─── __NEXT_DATA__ extraction (primary, fastest) ─────────────────────

def load_next_data_document(html: str):
    """Parse toàn bộ JSON ``__NEXT_DATA__`` hoặc None nếu không có / lỗi."""
    try:
        m = re.search(
            r'<script[^>]*\bid=["\']__NEXT_DATA__["\'][^>]*>([\s\S]*?)</script>',
            html,
            re.IGNORECASE,
        )
        if not m:
            return None
        script_text = unescape(m.group(1).strip())
        if not script_text:
            return None
        return json.loads(script_text)
    except Exception:
        return None


def extract_qa_text_candidates_from_next_data(html: str):
    """Lấy chuỗi reply báo giá nằm trong JSON (kể cả khi HTML chưa render hết / cần 'Xem thêm')."""
    out = []
    seen = set()
    data = load_next_data_document(html)
    if not data:
        return out

    def walk(obj, depth=0):
        if depth > 35:
            return
        if isinstance(obj, str):
            s = obj.strip()
            if len(s) < 18 or len(s) > 12000 or s in seen:
                return
            if _is_staff_price_reply_text(s):
                seen.add(s)
                out.append(_strip_html_tags(s))
            return
        if isinstance(obj, dict):
            for v in obj.values():
                walk(v, depth + 1)
        elif isinstance(obj, list):
            for v in obj:
                walk(v, depth + 1)

    walk(data)
    return out


def extract_prices_from_next_data(html: str):
    """Extract prices from Next.js __NEXT_DATA__ JSON embedded in page (HTML tĩnh).
    Returns tuple: (prices_dict, hierarchy_info)
      - prices_dict: {unit_name: int_price}
      - hierarchy_info: packaging hierarchy from extract_packaging_hierarchy() or None
    """
    prices = {}
    hierarchy = None
    try:
        data = load_next_data_document(html)
        if not data:
            return prices, hierarchy
        page_props = data.get('props', {}).get('pageProps', {})

        # Target the MAIN product only — avoids similar product contamination
        product_data = (
            page_props.get('product')
            or page_props.get('productData')
            or page_props.get('initialState', {}).get('product', {}).get('productDetail')
        )

        if not product_data or not isinstance(product_data, dict):
            return prices, hierarchy

        # 1. Multi-unit prices array (best coverage)
        prices_array = product_data.get('prices', [])

        # Always extract hierarchy (even if prices are null — needed for Rx drugs)
        if isinstance(prices_array, list) and prices_array:
            hierarchy = extract_packaging_hierarchy(prices_array)

            for entry in prices_array:
                if not isinstance(entry, dict):
                    continue
                p_val = entry.get('price')
                if not p_val or not isinstance(p_val, (int, float)) or p_val < MIN_PRICE_VND:
                    continue

                # Unit name with fallback to code map
                u_name = entry.get('measureUnitName')
                if not u_name:
                    code = entry.get('measureUnitCode')
                    if isinstance(code, int):
                        u_name = UNIT_CODE_MAP.get(code)
                u_name = normalize_packaging(u_name) if u_name else 'Hộp'
                prices[u_name] = int(p_val)

        # 2. Fallback to single price property
        if not prices:
            p = product_data.get('price')
            if p and isinstance(p, (int, float)) and p >= MIN_PRICE_VND:
                unit = product_data.get('unitName') or 'Hộp'
                unit = normalize_packaging(unit)
                prices[unit] = int(p)

    except Exception:
        pass
    return prices, hierarchy


# ─── JSON-LD extraction (secondary) ──────────────────────────────────

def extract_prices_from_json_ld(soup: BeautifulSoup):
    """Extract price from JSON-LD structured data (Product/Drug schema)."""
    prices = {}
    try:
        scripts = [
            s.string or s.get_text() or ""
            for s in soup.find_all("script", type=lambda v: v and "ld+json" in v)
        ]
        if not scripts:
            return prices

        for script_text in scripts:
            if not script_text:
                continue
            try:
                data = json.loads(script_text)
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    if item.get('@type') not in ('Product', 'Drug'):
                        continue
                    offers = item.get('offers')
                    if not offers:
                        continue
                    offer_list = offers if isinstance(offers, list) else [offers]
                    for o in offer_list:
                        if isinstance(o, dict) and o.get('price'):
                            p = int(float(o['price']))
                            if p >= MIN_PRICE_VND:
                                prices['Hộp'] = p
            except (json.JSONDecodeError, ValueError):
                continue
    except Exception:
        pass
    return prices


# ─── Direct DOM extraction (latest updated price) ──────────────────────

def _dom_inside_strike_price(tag: Tag) -> bool:
    for p in tag.parents:
        if not isinstance(p, Tag):
            continue
        if p.get("data-test") == "strike_price":
            return True
    return False


def extract_prices_from_dom_direct(soup: BeautifulSoup):
    """Mọi cặp (giá, ĐVT) trong HTML tĩnh (data-test); mỗi ĐVT lấy lần gặp đầu (bỏ strike)."""
    by_unit = {}
    try:
        for p_elem in soup.select("span[data-test='price']"):
            if _dom_inside_strike_price(p_elem):
                continue
            p_val = parse_price_string(p_elem.get_text(strip=True), assume_vnd_currency=True)
            if not p_val:
                continue
            unit = "Hộp"
            flex = p_elem.find_parent(
                "div", class_=lambda c: c and "inline-flex" in " ".join(c)
            )
            if flex:
                u_elem = flex.select_one("span[data-test='unit']")
                if u_elem:
                    unit = normalize_packaging(u_elem.get_text(strip=True))
            else:
                u0 = soup.select_one("span[data-test='unit']")
                if u0:
                    unit = normalize_packaging(u0.get_text(strip=True))
            if unit not in by_unit:
                by_unit[unit] = p_val
    except Exception:
        pass
    return [{"unit": u, "price": p} for u, p in sorted(by_unit.items(), key=lambda x: x[0])]


# ─── Unit button extraction (clicks each packaging tab) ──────────────

def extract_prices_from_unit_buttons(_soup: BeautifulSoup):
    """Không có JS: không click được tab ĐVT. Giá đa đơn vị lấy từ __NEXT_DATA__ / merge_packaging_prices."""
    return []


# ─── Q&A / Review pharmacist comment extraction (HTML tĩnh, không click / không lazy-load) ──

def _class_str(tag: Tag) -> str:
    c = tag.get("class")
    if not c:
        return ""
    return " ".join(c) if isinstance(c, list) else str(c)


def _find_ancestor_comment_block(node: Tag) -> Optional[Tag]:
    for p in node.parents:
        if not isinstance(p, Tag):
            continue
        cs = _class_str(p)
        if any(
            k in cs
            for k in (
                "comment-block",
                "lc-comment",
                "user-comment",
                "comment",
                "reply",
            )
        ):
            return p
    return None


def _collect_pharmacist_texts_soup(container: Tag):
    """Gom mọi đoạn giống reply nhân viên báo giá trong khối (HTML SSR).

    Không còn bắt buộc chữ "Dược sĩ"; nhận mẫu "Hiện tại… sản phẩm… có giá", "Tư vấn viên…", v.v.
    Các đoạn trùng nội dung được loại bằng _add.
    """
    pharmacist_texts = []
    seen = set()

    def _add(txt):
        txt = _strip_html_tags((txt or "").strip())
        if len(txt) < 12:
            return
        key = txt[:4500]
        if key in seen:
            return
        seen.add(key)
        pharmacist_texts.append(txt)

    # 0) user-comment / font-comment: mẫu nhân viên (rộng)
    try:
        for el in container.select(
            "div.user-comment, span.font-comment-rating, .user-comment"
        ):
            t = el.get_text(" ", strip=True)
            if _is_staff_price_reply_text(t):
                _add(t)
    except Exception:
        pass

    # 1) Nhánh có "Dược sĩ" (hành vi cũ, bổ sung)
    for node in container.find_all(string=re.compile(r"Dược\s*sĩ", re.I)):
        if not node.parent:
            continue
        el = node.parent
        for ax in (el,) + tuple(el.parents):
            if not isinstance(ax, Tag):
                continue
            cs = _class_str(ax)
            if not any(
                x in cs
                for x in (
                    "comment-block",
                    "comment",
                    "reply",
                    "lc-comment",
                    "user-comment",
                )
            ):
                continue
            txt = ax.get_text(" ", strip=True)
            if "Dược sĩ" in txt and len(txt) > 15:
                _add(txt)
                break

    # 2) user-comment có Dược sĩ ở tổ tiên
    try:
        for el in container.find_all(
            class_=re.compile(r"user-comment|font-comment", re.I)
        ):
            branch_has_ds = any(
                isinstance(blk, Tag) and "Dược sĩ" in blk.get_text(" ", strip=True)
                for blk in el.parents
            )
            if not branch_has_ds:
                continue
            et = el.get_text(" ", strip=True)
            if "Dược sĩ" in et:
                _add(et)
                continue
            for blk in el.parents:
                if not isinstance(blk, Tag):
                    continue
                cs = _class_str(blk)
                if not any(x in cs for x in ("comment", "reply", "flex")):
                    continue
                tx = blk.get_text(" ", strip=True)
                if "Dược sĩ" in tx:
                    _add(tx)
                    break
    except Exception:
        pass

    # 3) span "Dược sĩ"
    for badge in container.find_all("span", string=re.compile(r"Dược\s*sĩ")):
        blk = _find_ancestor_comment_block(badge)
        if blk:
            txt = blk.get_text(" ", strip=True)
            if len(txt) < 20 and blk.parent and isinstance(blk.parent, Tag):
                txt = blk.parent.get_text(" ", strip=True)
            if txt and len(txt) > 10:
                _add(txt)

    # 4) comment-block / item có Dược sĩ
    for b in container.select(
        "div.user-comment, div.comment-block, div[class*='comment-item']"
    ):
        txt = b.get_text(" ", strip=True)
        if txt and "Dược sĩ" in txt:
            _add(txt)

    # 5) fallback chỉ khi vẫn chưa thu được đoạn nào
    if not pharmacist_texts:
        full = container.get_text(" ", strip=True)
        if full and "Dược sĩ" in full and len(full) < 80000:
            _add(full)

    return pharmacist_texts


def _h2_hoi_dap(tag: Tag) -> bool:
    t = tag.get_text(" ", strip=True)
    return bool(t and re.search(r"Hỏi\s*đáp", t, re.I))


def _find_qa_section_container_soup(soup: BeautifulSoup) -> Optional[Tag]:
    el = soup.select_one("div.lc-comment")
    if el and el.select_one("div.user-comment, .user-comment"):
        return el
    for div in soup.find_all("div", class_=re.compile(r"lc-comment", re.I)):
        if div.select_one("div.user-comment, .user-comment"):
            return div
    for sec in soup.find_all(["div", "section"]):
        h2 = sec.find("h2")
        if h2 and _h2_hoi_dap(h2) and sec.select_one("div.user-comment, .user-comment"):
            return sec
    for h2 in soup.find_all("h2"):
        if not _h2_hoi_dap(h2):
            continue
        for p in (
            h2.find_parent("div", class_=re.compile(r"border", re.I)),
            h2.find_next_sibling("div"),
        ):
            if p and isinstance(p, Tag) and p.select_one("div.user-comment, .user-comment"):
                return p
    return None


def _find_preview_container_soup(soup: BeautifulSoup) -> Optional[Tag]:
    for h in soup.select(".text-heading3.text-text-primary.mr-1.inline-block.font-bold"):
        if "Đánh giá sản phẩm" not in (h.get_text() or ""):
            continue
        for anc in h.parents:
            if not isinstance(anc, Tag):
                continue
            cs = _class_str(anc)
            if "lc-preview" in cs or "review" in cs:
                return anc
    el = soup.select_one("div.lc-preview")
    return el if isinstance(el, Tag) else None


def get_price_from_qa_section(
    soup: BeautifulSoup,
    product_name=None,
    html: Optional[str] = None,
    _expected_units=None,
):
    """Parse Q&A / đánh giá: HTML + toàn bộ chuỗi báo giá trong ``__NEXT_DATA__`` (bù lazy 'Xem thêm')."""
    expected_units = _expected_units or []
    try:
        if not product_name:
            h1 = soup.find("h1")
            if h1:
                product_name = h1.get_text(strip=True)

        collected = []
        seen_text = set()

        def add_texts(texts):
            for t in texts or []:
                t = (t or "").strip()
                if len(t) < 12:
                    continue
                key = t[:4000]
                if key in seen_text:
                    continue
                seen_text.add(key)
                collected.append(t)

        qa = _find_qa_section_container_soup(soup)
        if qa:
            add_texts(_collect_pharmacist_texts_soup(qa))

        preview = _find_preview_container_soup(soup)
        if preview is not None:
            add_texts(_collect_pharmacist_texts_soup(preview))

        # Mọi user-comment trên trang (đôi khi nằm ngoài khối lc-comment đã chọn)
        for uc in soup.select("div.user-comment"):
            t = uc.get_text(" ", strip=True)
            if _is_staff_price_reply_text(t):
                add_texts([t])

        if html:
            add_texts(extract_qa_text_candidates_from_next_data(html))

        if collected:
            return extract_prices_from_pharmacist_texts(
                collected, product_name, _expected_units=expected_units
            )
        return None
    except Exception:
        return None


# ─── Crawl single drug ───────────────────────────────────────────────

def _scale_prices_with_hierarchy(qa_prices, hierarchy):
    """Use packaging hierarchy to calculate ALL unit prices from Q&A findings.

    Strategy:
      1. If Q&A found a price with an explicit unit that matches hierarchy → use directly.
      2. If Q&A price is tagged as 'Hộp' (default from "giá X đ" without unit),
         test each possible unit assignment and pick the most reasonable one.
    """
    if not hierarchy or not qa_prices:
        return qa_prices

    total_map = hierarchy.get('total_smallest', {})
    all_units = [u['name'] for u in hierarchy.get('units', [])]

    if not total_map or len(total_map) < 2:
        return qa_prices

    # Separate Q&A prices into explicit-unit matches vs default-Hộp
    explicit_matches = []
    default_hop_prices = []

    for qp in qa_prices:
        unit = qp['unit']
        price = int(qp['price'])
        if unit in total_map and unit != 'Hộp':
            # Explicitly matched a sub-unit → trust it
            explicit_matches.append((unit, price))
        else:
            default_hop_prices.append(price)

    # If we have an explicit match, use it as anchor
    if explicit_matches:
        anchor_unit, anchor_price = explicit_matches[0]
        return _compute_all_prices(anchor_unit, anchor_price, all_units, total_map, qa_prices)

    # All prices are default-Hộp. Try each possible unit assignment
    # and pick the one that produces the most reasonable price set.
    if not default_hop_prices:
        return qa_prices

    price_val = default_hop_prices[0]
    best_result = None
    best_score = -1

    for candidate_unit in all_units:
        candidate_total = total_map.get(candidate_unit, 1)
        if candidate_total <= 0:
            continue

        # Calculate what Hộp price would be if price_val belongs to candidate_unit
        hop_total = total_map.get('Hộp', total_map.get(all_units[0], 1))
        hop_price = int(price_val * hop_total / candidate_total)

        # Calculate smallest unit price
        smallest_unit = all_units[-1]
        smallest_total = total_map.get(smallest_unit, 1)
        smallest_price = int(price_val * smallest_total / candidate_total)

        # Score this assignment based on price reasonableness
        score = _price_reasonableness_score(hop_price, smallest_price)

        if score > best_score:
            best_score = score
            best_result = _compute_all_prices(candidate_unit, price_val, all_units, total_map, qa_prices)

    return best_result if best_result else qa_prices


def _compute_all_prices(anchor_unit, anchor_price, all_units, total_map, qa_prices):
    """Compute prices for ALL units in the hierarchy using the anchor price.
    Uses originally crawled prices if available to prevent math rounding issues.
    """
    anchor_total = total_map.get(anchor_unit, 1)
    result = []

    qa_map = {qp['unit']: int(qp['price']) for qp in qa_prices}

    for u_name in all_units:
        # If Q&A precisely found a price for this unit, trust it over calculation
        if u_name in qa_map:
            result.append({'unit': u_name, 'price': str(qa_map[u_name])})
            continue

        u_total = total_map.get(u_name, 1)
        if u_total > 0 and anchor_total > 0:
            calculated_price = int(anchor_price * u_total / anchor_total)
            if calculated_price >= MIN_PRICE_VND:
                result.append({'unit': u_name, 'price': str(calculated_price)})
    return result


def _price_reasonableness_score(hop_price, smallest_price):
    """Score how reasonable a price assignment is.

    Vietnamese drug prices typically:
      - Hộp: 5,000 - 5,000,000 (most common 10,000 - 500,000)
      - Viên/Ống: 200 - 50,000 (most common 500 - 10,000)
    """
    score = 0

    # Hộp price in sweet spot
    if 5000 <= hop_price <= 5000000:
        score += 10
    if 10000 <= hop_price <= 500000:
        score += 20
    if 20000 <= hop_price <= 300000:
        score += 10

    # Smallest unit price in sweet spot
    if 100 <= smallest_price <= 50000:
        score += 10
    if 200 <= smallest_price <= 15000:
        score += 20
    if 500 <= smallest_price <= 5000:
        score += 10

    # Penalize extreme prices
    if hop_price > 10000000 or hop_price < 1000:
        score -= 50
    if smallest_price < 50 or smallest_price > 100000:
        score -= 50

    return score


def expected_units_from_hierarchy(hierarchy):
    """ĐVT từ ``__NEXT_DATA__`` / productSpecs — nên đọc trước khi gộp giá (hierarchy đã parse)."""
    if not hierarchy:
        return []
    return [u['name'] for u in hierarchy.get('units', []) if u.get('name')]


def filter_duplicate_next_prices(next_prices, hierarchy):
    """Giữ nguyên từng ĐVT từ API; kể cả Hộp/Vỉ/Viên cùng một số (web vẫn hiển thị từng tab).

    Trước đây gộp còn một ĐVT khiến ``apply_hierarchy_unit_rows`` thêm các ĐVT khác toàn N/A."""
    _ = hierarchy
    return dict(next_prices) if next_prices else {}


def _normalize_price_cell(p) -> str:
    if p is None:
        return ""
    s = str(p).strip().replace(",", "").replace(" ", "")
    try:
        return str(int(float(s)))
    except (TypeError, ValueError):
        return str(p).strip()


def merge_packaging_prices(next_prices, dom_rows, btn_rows, hierarchy):
    """DOM inline giá ưu tiên hơn ``__NEXT_DATA__`` vì API trả giá gốc (chưa KM),
    còn DOM hiển thị giá bán thực tế (sau khuyến mãi/giảm giá).

    Flow: bắt đầu từ __NEXT_DATA__ → DOM inline ghi đè → btn bổ sung."""
    np_f = filter_duplicate_next_prices(next_prices or {}, hierarchy)
    merged = {
        normalize_packaging(u): _normalize_price_cell(p)
        for u, p in np_f.items()
        if p is not None
    }

    # DOM inline prices OVERRIDE __NEXT_DATA__ (API has original price,
    # DOM shows actual selling price after promotions/discounts)
    for row in dom_rows or []:
        u = normalize_packaging(row.get("unit", "") or "")
        p = row.get("price")
        if u and p:
            merged[u] = _normalize_price_cell(p)

    for row in btn_rows or []:
        u = normalize_packaging(row.get("unit", "") or "")
        p = row.get("price")
        if u and p and u not in merged:
            merged[u] = _normalize_price_cell(p)

    if merged:
        return [{"unit": u, "price": p} for u, p in sorted(merged.items(), key=lambda x: x[0])]

    merged2 = {}
    for row in btn_rows or []:
        u = normalize_packaging(row.get("unit", "") or "")
        p = row.get("price")
        if u and p:
            merged2[u] = _normalize_price_cell(p)
    for row in dom_rows or []:
        u = normalize_packaging(row.get("unit", "") or "")
        p = row.get("price")
        if u and p and u not in merged2:
            merged2[u] = _normalize_price_cell(p)
    if merged2:
        return [{"unit": u, "price": p} for u, p in sorted(merged2.items(), key=lambda x: x[0])]
    return []


def _prices_have_numeric(prices_data):
    """True nếu có ít nhất một dòng giá parse được thành số >= MIN_PRICE_VND (không phải N/A)."""
    if not prices_data:
        return False
    for p in prices_data:
        pr = p.get('price')
        if pr in (None, '', 'N/A'):
            continue
        try:
            v = int(str(pr).replace(',', '').replace(' ', '').strip())
            if v >= MIN_PRICE_VND:
                return True
        except (TypeError, ValueError):
            continue
    return False


def apply_hierarchy_unit_rows(prices_data, hierarchy):
    """Sắp xếp ĐVT theo hierarchy, chỉ giữ ĐVT đã có giá. KHÔNG thêm N/A cho ĐVT thiếu giá.

    Chỉ giữ các đơn vị tính mà crawl thực sự tìm thấy giá trên trang."""
    if not hierarchy or not hierarchy.get('units'):
        return prices_data or []
    by_unit = {}
    for p in (prices_data or []):
        un = normalize_packaging(p['unit'])
        pr = p.get('price', 'N/A')
        # Only keep units that have actual numeric prices
        if _parse_price_int(pr) is not None:
            by_unit[un] = pr
    ordered = []
    seen = set()
    # First: hierarchy units that have prices, in hierarchy order
    for u in hierarchy['units']:
        un = normalize_packaging(u['name'])
        if un in by_unit:
            seen.add(un)
            ordered.append({'unit': un, 'price': by_unit[un]})
    # Then: any extra units from crawl that aren't in hierarchy
    for p in prices_data or []:
        un = normalize_packaging(p['unit'])
        if un not in seen and _parse_price_int(p.get('price', 'N/A')) is not None:
            seen.add(un)
            ordered.append({'unit': un, 'price': p.get('price', 'N/A')})
    return ordered


def _parse_price_int(pr) -> Optional[int]:
    if pr in (None, '', 'N/A'):
        return None
    try:
        v = int(str(pr).replace(',', '').replace(' ', '').strip())
        return v if v >= MIN_PRICE_VND else None
    except (TypeError, ValueError):
        return None


def merge_qa_into_prices(prices_data, qa_prices):
    """Gộp giá Q&A chỉ vào các ĐVT chưa có số (N/A / thiếu); không ghi đè API/DOM đã parse được."""
    if not qa_prices:
        return prices_data or []
    by_u = {}
    for r in prices_data or []:
        u = normalize_packaging(r["unit"])
        v = _parse_price_int(r.get("price"))
        if v is not None:
            by_u[u] = str(v)
        elif u not in by_u:
            by_u[u] = r.get("price", "N/A")
    for q in qa_prices:
        u = normalize_packaging(q["unit"])
        v = _parse_price_int(q.get("price"))
        if v is None:
            continue
        if _parse_price_int(by_u.get(u, "N/A")) is None:
            by_u[u] = str(v)
    return [{"unit": u, "price": p} for u, p in sorted(by_u.items(), key=lambda x: x[0])]


def backfill_hierarchy_na_if_single_list_price(prices_data, hierarchy):
    """Chỉ còn một mức giá số trên toàn dòng nhưng vài ĐVT hierarchy vẫn N/A → gán cùng mức (giống list LC một giá mọi tab).

    Không nhân/chia; không áp khi có từ hai mức giá khác nhau."""
    if not prices_data or not hierarchy or not hierarchy.get('units'):
        return prices_data
    distinct = set()
    for r in prices_data:
        v = _parse_price_int(r.get('price'))
        if v is not None:
            distinct.add(v)
    if len(distinct) != 1:
        return prices_data
    only = str(distinct.pop())
    hier_units = {normalize_packaging(u['name']) for u in hierarchy['units']}
    out = []
    for r in prices_data:
        u = normalize_packaging(r['unit'])
        pr = r.get('price')
        if u in hier_units and (pr in (None, '', 'N/A') or str(pr).strip() == 'N/A'):
            out.append({'unit': u, 'price': only})
        else:
            out.append({'unit': u, 'price': pr})
    return out


def sanitize_adjacent_packaging_prices(prices_data, hierarchy):
    """Theo hierarchy (cha lớn → con nhỏ): nếu giá con > giá cha (cùng có số) → gán con = cha.

    Tránh bản ghi Vỉ > Hộp do trộn nguồn; không sửa khi thiếu một trong hai mức."""
    if not prices_data or not hierarchy or not hierarchy.get("units"):
        return prices_data
    order = [normalize_packaging(u["name"]) for u in hierarchy["units"]]
    by_u = {}
    for r in prices_data:
        u = normalize_packaging(r["unit"])
        v = _parse_price_int(r.get("price"))
        if v is not None:
            by_u[u] = v
    for i in range(len(order) - 1):
        pa, ch = order[i], order[i + 1]
        vp, vc = by_u.get(pa), by_u.get(ch)
        if vp is not None and vc is not None and vc > vp:
            by_u[ch] = vp
    out = []
    for r in prices_data:
        u = normalize_packaging(r["unit"])
        pr = r.get("price")
        if _parse_price_int(pr) is not None and u in by_u:
            out.append({"unit": u, "price": str(by_u[u])})
        else:
            out.append({"unit": u, "price": pr})
    return out


def _extract_result_from_html(drug_url: str, html: str):
    """Parse một HTML snapshot thành payload kết quả crawl."""
    try:
        soup = BeautifulSoup(html, "lxml")
    except Exception:
        soup = BeautifulSoup(html, "html.parser")

    product_name = "Unknown"
    h1 = soup.find("h1")
    if h1:
        product_name = h1.get_text(strip=True)

    img_url = ""
    meta_img = soup.find("meta", property="og:image")
    if meta_img and meta_img.get("content"):
        img_url = meta_img.get("content")

    prices_data = []
    hierarchy = None

    next_prices, hierarchy = extract_prices_from_next_data(html)
    mapping_units = expected_units_from_hierarchy(hierarchy)

    dom_prices = extract_prices_from_dom_direct(soup)
    btn_prices = extract_prices_from_unit_buttons(soup)
    prices_data = merge_packaging_prices(next_prices, dom_prices, btn_prices, hierarchy)

    if not prices_data:
        ld_prices = extract_prices_from_json_ld(soup)
        if ld_prices:
            for unit, price in ld_prices.items():
                prices_data.append({"unit": unit, "price": str(price)})

    qa_prices = get_price_from_qa_section(
        soup,
        product_name,
        html=html,
        _expected_units=mapping_units,
    )
    if qa_prices:
        qa_prices = _scale_prices_with_hierarchy(qa_prices, hierarchy)
        prices_data = merge_qa_into_prices(prices_data, qa_prices)

    if _prices_have_numeric(prices_data):
        prices_data = apply_hierarchy_unit_rows(prices_data, hierarchy)
        # NOTE: Removed backfill_hierarchy_na_if_single_list_price — it was
        # incorrectly spreading a single unit price (e.g. Hộp) to ALL hierarchy
        # units (Vỉ, Viên) even when only Hộp has a price on the page.
        prices_data = sanitize_adjacent_packaging_prices(
            prices_data, hierarchy
        )
        # Final filter: remove any row without a numeric price
        prices_data = [p for p in prices_data if _parse_price_int(p.get('price')) is not None]
        if not prices_data:
            prices_data = [{"unit": "N/A", "price": "N/A"}]
    else:
        prices_data = [{"unit": "N/A", "price": "N/A"}]

    return {"name": product_name, "url": drug_url, "img": img_url, "prices": prices_data}


def _extract_product_sku_from_html(html: str) -> Optional[str]:
    """Lấy sku sản phẩm chính từ __NEXT_DATA__."""
    try:
        data = load_next_data_document(html)
        if not data:
            return None
        page_props = data.get("props", {}).get("pageProps", {})
        product_data = (
            page_props.get("product")
            or page_props.get("productData")
            or page_props.get("initialState", {}).get("product", {}).get("productDetail")
        )
        if not isinstance(product_data, dict):
            return None
        sku = (product_data.get("sku") or "").strip()
        return sku or None
    except Exception:
        return None


async def _fetch_prices_from_comments_api(
    client: httpx.AsyncClient,
    sku: str,
    product_name: str,
    expected_units=None,
):
    """Đọc reply từ API comments (bao gồm phần ẩn sau 'Xem thêm') rồi parse giá."""
    if not sku:
        return []
    try:
        url = (
            "https://api.nhathuoclongchau.com.vn/lccus/ecom-prod/store-front/v3/comments"
            f"?maxResultCount=100&maxReplies=20&skipCount=0"
            f"&sortBy=createdAt,DESC&filterType=PRODUCT&targetId={sku}"
        )
        r = await client.get(url)
        if r.status_code != 200:
            return []
        payload = r.json()
    except Exception:
        return []

    texts = []
    seen = set()

    def _add_text(t: str):
        s = (t or "").strip()
        if len(s) < 12:
            return
        k = s[:4000]
        if k in seen:
            return
        seen.add(k)
        texts.append(s)

    def _walk_comment(obj):
        if isinstance(obj, dict):
            # Only process replies (staff answers), not the top-level question
            reps = obj.get("replies")
            if isinstance(reps, list):
                for rp in reps:
                    if isinstance(rp, dict):
                        c = rp.get("content")
                        if isinstance(c, str):
                            cleaned = _strip_html_tags(c)
                            if _is_staff_price_reply_text(cleaned):
                                _add_text(cleaned)
                        # Recurse into nested replies
                        _walk_comment(rp)
        elif isinstance(obj, list):
            for x in obj:
                _walk_comment(x)

    _walk_comment(payload.get("items", []))
    if not texts:
        return []
    return extract_prices_from_pharmacist_texts(
        texts, product_name, _expected_units=expected_units or []
    )


async def _fetch_html_with_playwright(drug_url: str) -> Optional[str]:
    """Render trang bằng Playwright để lấy HTML sau khi JS chạy + mở rộng comment."""
    if not PLAYWRIGHT_FALLBACK_ENABLED or async_playwright is None:
        return None
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=DEFAULT_HEADERS.get("User-Agent"),
                locale="vi-VN",
            )
            page = await context.new_page()
            await page.goto(drug_url, wait_until="networkidle", timeout=PLAYWRIGHT_TIMEOUT_MS)

            # Mở thêm bình luận nếu có để lộ các reply báo giá.
            for label in ("Xem thêm", "xem thêm"):
                for _ in range(8):
                    btn = page.get_by_text(label, exact=False).first
                    if not await btn.is_visible():
                        break
                    try:
                        await btn.click(timeout=1200)
                        await page.wait_for_timeout(300)
                    except Exception:
                        break

            html = await page.content()
            await context.close()
            await browser.close()
            return html
    except Exception:
        return None


async def crawl_drug_from_url(client: httpx.AsyncClient, drug_url: str):
    """GET một URL; parse bằng httpx trước, thiếu giá thì thử API comments, cuối cùng Playwright."""

    def _cleanup_result(result):
        """Remove N/A rows from final result; keep only rows with numeric prices."""
        if not result or not result.get("prices"):
            return result
        cleaned = [p for p in result["prices"] if _parse_price_int(p.get("price")) is not None]
        if cleaned:
            result["prices"] = cleaned
        else:
            result["prices"] = [{"unit": "N/A", "price": "N/A"}]
        return result

    def _apply_api_prices_to_result(result, qa_api, hierarchy):
        """Merge API comment prices into result, handling N/A base case."""
        if not qa_api:
            return result

        # Remap default 'Hộp' to the actual hierarchy unit when hierarchy has
        # only 1 unit and it's not 'Hộp' (e.g., Tuýp for creams, Chai for liquids)
        if hierarchy and hierarchy.get('units'):
            hier_units = [u['name'] for u in hierarchy['units']]
            if len(hier_units) == 1 and hier_units[0] != 'Hộp':
                actual_unit = hier_units[0]
                remapped = []
                for qp in qa_api:
                    if qp['unit'] == 'Hộp':
                        remapped.append({'unit': actual_unit, 'price': qp['price']})
                    else:
                        remapped.append(qp)
                qa_api = remapped

        base_prices = result.get("prices") or []
        if _prices_have_numeric(base_prices):
            # Merge: only fill in units that don't have numeric prices yet
            merged = merge_qa_into_prices(base_prices, qa_api)
        else:
            # Base has no numeric prices → use API prices directly
            merged = qa_api
        # Scale with hierarchy and sanitize
        if hierarchy:
            merged = _scale_prices_with_hierarchy(merged, hierarchy)
            merged = apply_hierarchy_unit_rows(merged, hierarchy)
            merged = sanitize_adjacent_packaging_prices(merged, hierarchy)
        # Final filter
        merged = [p for p in merged if _parse_price_int(p.get('price')) is not None]
        if merged:
            result["prices"] = merged
        return result

    try:
        r = await client.get(drug_url)
        r.raise_for_status()
        html = r.text
    except Exception:
        html = None

    try:
        if html:
            result = _extract_result_from_html(drug_url, html)
            if result and _prices_have_numeric(result.get("prices")):
                return _cleanup_result(result)

            # HTML extraction didn't find prices → try comments API immediately
            # (faster than Playwright, works for Rx drugs with null prices)
            sku = _extract_product_sku_from_html(html)
            _nd, hierarchy = extract_prices_from_next_data(html)
            exp_units = expected_units_from_hierarchy(hierarchy)
            qa_api = await _fetch_prices_from_comments_api(
                client,
                sku or "",
                (result.get("name") if result else None) or "Unknown",
                expected_units=exp_units,
            )
            if qa_api:
                if not result:
                    result = {"name": "Unknown", "url": drug_url, "img": "", "prices": []}
                _apply_api_prices_to_result(result, qa_api, hierarchy)
                if _prices_have_numeric(result.get("prices")):
                    return _cleanup_result(result)

        # Fallback: render JS nếu httpx + API chưa lấy được giá.
        html_pw = await _fetch_html_with_playwright(drug_url)
        if html_pw:
            result_pw = _extract_result_from_html(drug_url, html_pw)
            if result_pw:
                if _prices_have_numeric(result_pw.get("prices")):
                    return _cleanup_result(result_pw)
                # Playwright xong mà vẫn chưa có giá số -> thử API comments theo sku.
                sku_pw = _extract_product_sku_from_html(html_pw)
                _nd_pw, hier_pw = extract_prices_from_next_data(html_pw)
                exp_pw = expected_units_from_hierarchy(hier_pw)
                qa_api_pw = await _fetch_prices_from_comments_api(
                    client,
                    sku_pw or "",
                    result_pw.get("name") or "Unknown",
                    expected_units=exp_pw,
                )
                if qa_api_pw:
                    _apply_api_prices_to_result(result_pw, qa_api_pw, hier_pw)
                    if _prices_have_numeric(result_pw.get("prices")):
                        return _cleanup_result(result_pw)
                return _cleanup_result(result_pw)

        # Trả kết quả cuối cùng (có thể N/A)
        if html and result:
            return _cleanup_result(result)
        return None
    except Exception:
        return None


# ─── Crawl all URLs from JSON ────────────────────────────────────────

def _clean_url_entry(u):
    if not isinstance(u, str):
        return None
    s = u.strip().strip('"').strip("'")
    while s.startswith('['):
        s = s[1:].lstrip()
    if not s.startswith('http'):
        return None
    if '"' in s:
        s = s.split('"', 1)[0]
    return s.strip()


def _result_to_rows(url: str, result: Optional[dict]):
    items = []
    if not result:
        return items
    if result.get("prices"):
        for pi in result["prices"]:
            items.append(
                {
                    "name": result["name"],
                    "url": url,
                    "img": result.get("img", ""),
                    "packaging": pi["unit"],
                    "price": pi["price"],
                }
            )
    else:
        items.append(
            {
                "name": result["name"],
                "url": url,
                "img": result.get("img", ""),
                "packaging": "N/A",
                "price": "N/A",
            }
        )
    return items


async def _crawl_from_json_links_async(json_paths=None):
    paths = json_paths or ("c:/Dự án công ty/crawl/json1.json", "c:/crawl/json1.json")
    drug_urls = []
    for path in paths:
        if not os.path.isfile(path):
            continue
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                content = f.read().strip()
            try:
                data = json.loads(content)
                if isinstance(data, list):
                    drug_urls.extend(data)
                elif isinstance(data, dict):
                    drug_urls.extend(data.get("drug_urls", []))
            except json.JSONDecodeError:
                drug_urls.extend(
                    l.strip() for l in content.splitlines() if "http" in l
                )
        except Exception as e:
            print(f"Loi doc file {path}: {e}")

    seen = set()
    cleaned = []
    for u in drug_urls:
        c = _clean_url_entry(u)
        if c and c not in seen:
            seen.add(c)
            cleaned.append(c)
    drug_urls = cleaned

    total = len(drug_urls)
    if total == 0:
        print("Khong tim thay URL!")
        return []
    print(f"Tong so URL: {total} (httpx async, concurrency={ASYNC_CONCURRENCY})")

    all_drugs = []
    lock = asyncio.Lock()
    done = 0
    sem = asyncio.Semaphore(ASYNC_CONCURRENCY)
    timeout = httpx.Timeout(HTTP_TIMEOUT_SEC, connect=10.0)
    limits = httpx.Limits(
        max_keepalive_connections=ASYNC_CONCURRENCY + 2,
        max_connections=ASYNC_CONCURRENCY + 4,
    )

    async with httpx.AsyncClient(
        headers=DEFAULT_HEADERS,
        timeout=timeout,
        follow_redirects=True,
        limits=limits,
    ) as client:

        async def fetch_and_pack(url: str):
            async with sem:
                res = await crawl_drug_from_url(client, url)
            return url, res

        tasks = [asyncio.create_task(fetch_and_pack(u)) for u in drug_urls]
        for coro in asyncio.as_completed(tasks):
            try:
                url, result = await coro
                rows = _result_to_rows(url, result)
            except Exception:
                rows = []
            async with lock:
                all_drugs.extend(rows)
                done += 1
                if done % 10 == 0:
                    print(f"[{done}/{total}]")
                if done % 50 == 0:
                    save_results(all_drugs, "progress")

    print(f"\nTong cong: {len(all_drugs)} san pham")
    save_results(all_drugs, "final")
    return all_drugs


def crawl_from_json_links(json_paths=None):
    """Đồng bộ wrapper: chạy asyncio loop (httpx + semaphore)."""
    return asyncio.run(_crawl_from_json_links_async(json_paths))


# ─── Save results ────────────────────────────────────────────────────

def _row_has_numeric_price(row: dict) -> bool:
    pr = row.get("price")
    if pr is None or str(pr).strip() in ("", "N/A"):
        return False
    try:
        return int(str(pr).replace(",", "").replace(" ", "").strip()) >= MIN_PRICE_VND
    except (TypeError, ValueError):
        return False


def split_drugs_by_price(drugs):
    """Chia theo DÒNG (mỗi ĐVT một dòng): có giá số vs N/A / rỗng."""
    with_p = [d for d in drugs if _row_has_numeric_price(d)]
    without_p = [d for d in drugs if not _row_has_numeric_price(d)]
    return with_p, without_p


def products_without_any_numeric_price(drugs):
    """Các URL không có bất kỳ ĐVT nào có giá số (đúng nghĩa 'sản phẩm không giá')."""
    by_url = {}
    for d in drugs:
        url = d.get("url") or ""
        if url not in by_url:
            by_url[url] = {"name": d.get("name"), "has_numeric": False}
        if _row_has_numeric_price(d):
            by_url[url]["has_numeric"] = True
    out = []
    for url, info in by_url.items():
        if not url or info["has_numeric"]:
            continue
        out.append({"name": info.get("name"), "url": url})
    return out


def save_results(drugs, stage):
    with_p, without_p = split_drugs_by_price(drugs)
    no_price_products = products_without_any_numeric_price(drugs)

    payload = {
        "source": "Nha thuoc Long Chau",
        "crawl_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_rows": len(drugs),
        "rows_with_numeric_price": len(with_p),
        "rows_price_na": len(without_p),
        "products_without_any_numeric_price": len(no_price_products),
        # Tương thích tên cũ: total_drugs = số dòng; drugs_without_price = SP (URL) hoàn toàn không giá
        "total_drugs": len(drugs),
        "drugs_with_price": len(with_p),
        "drugs_without_price": len(no_price_products),
        "drugs": drugs,
    }

    with open(f"c:/Dự án công ty/crawl/crawl_test_{stage}.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    if with_p:
        with open(
            f"c:/Dự án công ty/crawl/crawl_test_{stage}_with_price.json", "w", encoding="utf-8"
        ) as f:
            json.dump({"drugs": with_p}, f, indent=2, ensure_ascii=False)
    with open(
        f"c:/Dự án công ty/crawl/crawl_test_{stage}_without_price.json", "w", encoding="utf-8"
    ) as f:
        json.dump(
            {
                "note": (
                    "Mỗi phần tử là một URL: không có bất kỳ ĐVT nào có giá số. "
                    "Khác với file *_rows_na_packaging.json (từng dòng N/A, có thể cùng SP vẫn có giá ĐVT khác)."
                ),
                "count": len(no_price_products),
                "products": no_price_products,
            },
            f,
            indent=2,
            ensure_ascii=False,
        )
    if without_p:
        with open(
            f"c:/Dự án công ty/crawl/crawl_test_{stage}_rows_na_packaging.json",
            "w",
            encoding="utf-8",
        ) as f:
            json.dump(
                {
                    "note": (
                        "Các dòng packaging có giá N/A (kể cả khi cùng URL vẫn có ĐVT khác có giá)."
                    ),
                    "count": len(without_p),
                    "drugs": without_p,
                },
                f,
                indent=2,
                ensure_ascii=False,
            )

    print(
        f"Da luu: {len(with_p)} dong co gia, {len(without_p)} dong N/A, "
        f"{len(no_price_products)} san pham (URL) khong co bat ky gia"
    )


if __name__ == "__main__":
    import sys

    if sys.platform == "win32":
        os.system("chcp 65001 >nul")
    print("Bat dau crawl (httpx async)...")
    crawl_from_json_links()
