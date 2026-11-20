from __future__ import annotations
import pathlib
import re
import subprocess

ROOT=pathlib.Path(__file__).resolve().parents[2]
SKIP_PARTS={".git",".github","node_modules","dist","vendor","third_party","build",".next"}
SKIP_NAMES={"LICENSE","LICENSE.txt","LICENSE.md","COPYING","NOTICE","package-lock.json"}
TEXT_SUFFIX={".js",".mjs",".cjs",".css",".html",".htm",".svg",".md"}

def strip_js(source):
    out=[]
    i=0
    state="code"
    square=False
    prev=""
    n=0
    while i<len(source):
        c=source[i]
        nxt=source[i+1] if i+1<len(source) else ""
        if state!="code":
            out.append(c)
            if c=="\\":
                if i+1<len(source):
                    i+=1
                    out.append(source[i])
            elif state=="regex" and c=="[":
                square=True
            elif state=="regex" and c=="]":
                square=False
            elif (state=="single" and c=="'") or (state=="double" and c=='"') or (state=="template" and c==chr(96)) or (state=="regex" and c=="/" and not square):
                state="code"
            i+=1
            continue
        if c=="'":
            state="single"
        elif c=='"':
            state="double"
        elif c==chr(96):
            state="template"
        elif c=="/" and nxt=="/":
            end=source.find("\n",i+2)
            if end<0:
                end=len(source)
            i=end
            n+=1
            continue
        elif c=="/" and nxt=="*":
            end=source.find("*/",i+2)
            if end<0:
                raise RuntimeError("Unterminated block comment")
            block=source[i:end+2]
            out.append(" ")
            out.extend("\n" for x in block if x=="\n")
            i=end+2
            n+=1
            continue
        elif c=="/" and nxt not in {"/","*"} and (not prev or prev in "=(,:;[!{?&|+-*"):
            state="regex"
            square=False
        out.append(c)
        if not c.isspace():
            prev=c
        i+=1
    return "".join(out),n

def strip_css(source):
    matches=re.findall(r"/\*[\s\S]*?\*/",source)
    return re.sub(r"/\*[\s\S]*?\*/",lambda m:" "+"".join("\n" for x in m.group(0) if x=="\n"),source),len(matches)

def strip_html(source):
    count=0
    def unhtml(m):
        nonlocal count
        count+=1
        return ""
    source=re.sub(r"<!--[\s\S]*?-->",unhtml,source)
    def style_block(m):
        nonlocal count
        code,removed=strip_css(m.group(2))
        count+=removed
        return m.group(1)+code+m.group(3)
    source=re.sub(r"(<style\b[^>]*>)([\s\S]*?)(</style>)",style_block,source,flags=re.I)
    def script_block(m):
        nonlocal count
        if re.search(r"\bsrc\s*=|\btype\s*=\s*['\"]application/",m.group(1),re.I):
            return m.group(0)
        code,removed=strip_js(m.group(2))
        count+=removed
        return "<script"+m.group(1)+">"+code+"</script>"
    source=re.sub(r"<script([^>]*)>([\s\S]*?)</script>",script_block,source,flags=re.I)
    return source,count

def should_touch(path):
    rel=path.relative_to(ROOT)
    if any(part in SKIP_PARTS for part in rel.parts):
        return False
    if path.name in SKIP_NAMES:
        return False
    if path.suffix.lower() not in TEXT_SUFFIX:
        return False
    return True

def check_js(value,name):
    p=subprocess.run(["node","--input-type=module","--check"],input=value,text=True,capture_output=True)
    if p.returncode:
        raise RuntimeError(f"JS syntax invalid in {name}: {p.stderr[:1500]}")

def main():
    changed=[]
    checked=0
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or not should_touch(path):
            continue
        old=path.read_text(encoding="utf-8")
        typ=path.suffix.lower()
        if typ in {".js",".mjs",".cjs"}:
            new,n=strip_js(old)
            if n:
                check_js(new,path)
                checked+=1
        elif typ==".css":
            new,n=strip_css(old)
        elif typ in {".html",".htm"}:
            new,n=strip_html(old)
        else:
            new,n=re.subn(r"<!--[\s\S]*?-->","",old)
        if n and new!=old:
            path.write_text(new,encoding="utf-8")
            changed.append((str(path.relative_to(ROOT)),n))
    print("Removed comments in",len(changed),"first-party files; JS syntax-checked:",checked)
    for name,number in changed:
        print(name,number)

if __name__=="__main__":
    main()
