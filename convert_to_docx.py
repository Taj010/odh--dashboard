#!/usr/bin/env python3
"""Convert QA test-case markdown to a Roboto-styled DOCX per the QA skill spec."""

from __future__ import annotations

import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_COLOR_INDEX
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
HYPERLINK_COLOR = RGBColor(0x05, 0x63, 0xC1)


def set_run_font(run, bold: bool = False, size_pt: float | None = None) -> None:
    run.bold = bold
    run.font.name = "Roboto"
    if size_pt is not None:
        run.font.size = Pt(size_pt)
    r_pr = run._element.get_or_add_rPr()
    r_fonts = r_pr.find(qn("w:rFonts"))
    if r_fonts is None:
        r_fonts = OxmlElement("w:rFonts")
        r_pr.insert(0, r_fonts)
    r_fonts.set(qn("w:ascii"), "Roboto")
    r_fonts.set(qn("w:hAnsi"), "Roboto")
    r_fonts.set(qn("w:cs"), "Roboto")


def set_paragraph_style_font(paragraph, size_pt: float, bold: bool = True) -> None:
    style = paragraph.style
    if style is not None and style.font is not None:
        style.font.name = "Roboto"
        style.font.size = Pt(size_pt)
        style.font.bold = bold
    for run in paragraph.runs:
        set_run_font(run, bold=bold, size_pt=size_pt)


def add_hyperlink(paragraph, text: str, url: str) -> None:
    part = paragraph.part
    r_id = part.relate_to(
        url,
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
        is_external=True,
    )
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), r_id)

    new_run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")

    r_fonts = OxmlElement("w:rFonts")
    r_fonts.set(qn("w:ascii"), "Roboto")
    r_fonts.set(qn("w:hAnsi"), "Roboto")
    r_fonts.set(qn("w:cs"), "Roboto")
    r_pr.append(r_fonts)

    color = OxmlElement("w:color")
    color.set(qn("w:val"), "0563C1")
    r_pr.append(color)

    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    r_pr.append(underline)

    new_run.append(r_pr)
    text_elem = OxmlElement("w:t")
    text_elem.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    text_elem.text = text
    new_run.append(text_elem)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def add_inline_markdown(paragraph, text: str, *, bold_default: bool = False, size_pt: float | None = None) -> None:
    """Parse **bold** and [label](url) sequentially into runs/hyperlinks."""
    i = 0
    n = len(text)
    while i < n:
        if text.startswith("**", i):
            end = text.find("**", i + 2)
            if end == -1:
                run = paragraph.add_run(text[i:])
                set_run_font(run, bold=bold_default, size_pt=size_pt)
                break
            run = paragraph.add_run(text[i + 2 : end])
            set_run_font(run, bold=True, size_pt=size_pt)
            i = end + 2
            continue

        link_match = LINK_RE.match(text, i)
        if link_match:
            add_hyperlink(paragraph, link_match.group(1), link_match.group(2))
            # Ensure hyperlink run uses Roboto via surrounding style; also add empty run sizing baseline
            i = link_match.end()
            continue

        next_bold = text.find("**", i)
        next_link = text.find("[", i)
        candidates = [x for x in (next_bold, next_link) if x != -1]
        end = min(candidates) if candidates else n
        if end > i:
            run = paragraph.add_run(text[i:end])
            set_run_font(run, bold=bold_default, size_pt=size_pt)
        i = end if candidates else n


def add_body_paragraph(doc: Document, text: str, *, indent_in: float = 0.0) -> None:
    p = doc.add_paragraph()
    if indent_in:
        p.paragraph_format.left_indent = Inches(indent_in)
    add_inline_markdown(p, text)


def add_bullet(doc: Document, text: str, *, level: int = 0, checkbox: bool = False) -> None:
    p = doc.add_paragraph()
    indent = 0.25 if level == 0 else 0.5
    p.paragraph_format.left_indent = Inches(indent)
    prefix = "☐ " if checkbox else ("• " if level == 0 else "◦ ")
    run = p.add_run(prefix)
    set_run_font(run)
    add_inline_markdown(p, text)


def convert(md_path: Path, docx_path: Path) -> None:
    lines = md_path.read_text(encoding="utf-8").splitlines()
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    normal = doc.styles["Normal"]
    normal.font.name = "Roboto"
    normal.font.size = Pt(11)
    r_pr = normal.element.get_or_add_rPr()
    r_fonts = r_pr.find(qn("w:rFonts"))
    if r_fonts is None:
        r_fonts = OxmlElement("w:rFonts")
        r_pr.insert(0, r_fonts)
    r_fonts.set(qn("w:ascii"), "Roboto")
    r_fonts.set(qn("w:hAnsi"), "Roboto")
    r_fonts.set(qn("w:cs"), "Roboto")

    # Ensure heading styles exist and use Roboto
    for style_name, size in (("Heading 1", 16), ("Heading 2", 14), ("Heading 3", 12)):
        style = doc.styles[style_name]
        style.font.name = "Roboto"
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor(0, 0, 0)
        # Clear theme highlight leftovers
        try:
            style.font.highlight_color = WD_COLOR_INDEX.AUTO
        except Exception:
            pass
        s_rpr = style.element.get_or_add_rPr()
        s_fonts = s_rpr.find(qn("w:rFonts"))
        if s_fonts is None:
            s_fonts = OxmlElement("w:rFonts")
            s_rpr.insert(0, s_fonts)
        s_fonts.set(qn("w:ascii"), "Roboto")
        s_fonts.set(qn("w:hAnsi"), "Roboto")
        s_fonts.set(qn("w:cs"), "Roboto")

    step_counter = 0

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            continue
        if line.strip() == "---":
            continue

        if line.startswith("# "):
            p = doc.add_paragraph(style="Heading 1")
            add_inline_markdown(p, line[2:].strip(), bold_default=True, size_pt=16)
            for run in p.runs:
                set_run_font(run, bold=True, size_pt=16)
            step_counter = 0
            continue

        if line.startswith("## "):
            p = doc.add_paragraph(style="Heading 2")
            add_inline_markdown(p, line[3:].strip(), bold_default=True, size_pt=14)
            for run in p.runs:
                set_run_font(run, bold=True, size_pt=14)
            step_counter = 0
            continue

        if line.startswith("### "):
            p = doc.add_paragraph(style="Heading 3")
            add_inline_markdown(p, line[4:].strip(), bold_default=True, size_pt=12)
            for run in p.runs:
                set_run_font(run, bold=True, size_pt=12)
            step_counter = 0
            continue

        if line.startswith("> "):
            add_body_paragraph(doc, line[2:].strip())
            continue

        checkbox = re.match(r"^(\s*)- \[ \] (.+)$", line)
        if checkbox:
            indent_level = 1 if len(checkbox.group(1)) >= 2 else 0
            add_bullet(doc, checkbox.group(2), level=indent_level, checkbox=True)
            continue

        bullet = re.match(r"^(\s*)- (.+)$", line)
        if bullet:
            indent_level = 1 if len(bullet.group(1)) >= 2 else 0
            add_bullet(doc, bullet.group(2), level=indent_level, checkbox=False)
            continue

        numbered = re.match(r"^(\d+)\.\s+(.*)$", line)
        if numbered:
            # Restart numbering visually per test case by always printing the markdown number
            # (Word auto-numbering is avoided so TC steps always start at 1)
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.25)
            add_inline_markdown(p, f"{numbered.group(1)}. {numbered.group(2)}")
            step_counter = int(numbered.group(1))
            continue

        add_body_paragraph(doc, line)

    docx_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(docx_path))
    print(f"Wrote {docx_path}")


def main() -> int:
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <input.md> <output.docx>", file=sys.stderr)
        return 2
    convert(Path(sys.argv[1]), Path(sys.argv[2]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
