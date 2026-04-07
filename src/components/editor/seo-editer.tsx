"use client";

import { getNewPageContent, getPageContent, insertPost } from "@/actions/dbAction";
import { dark, EMOJI_CATS, I, light, ROW1, ROW2 } from "@/utils/consitants/consitaint";
import { EditorData } from "@/utils/types/uiTypes";
import { useSearchParams } from "next/navigation";
import React, { useState, useRef, useCallback, useEffect, DragEvent } from "react";
import { AnchorModal, BtnP, BtnS, CodeModal, EmojiModal, Field, FindModal, ImageModal, LinkModal, mkInput, ModalWrap, PreviewModal, SpecialModal, TableModal, VideoModal } from "./modal";
import { ToastContainer, useToast } from "./toast";

interface TBtn {
  command?: string;
  value?: string;
  icon?: React.ReactNode;
  title?: string;
  type?: "sep" | "btn";
}


// ═══════════════════════════════════════════════════════════
// DARK MODE CONTEXT
// ═══════════════════════════════════════════════════════════
const useDarkMode = () => {
  const [dark, setDark] = useState(false);
  const toggle = () => setDark(d => !d);
  return { dark, toggle };
};


// ═══════════════════════════════════════════════════════════
// MYSQL SAVE SIMULATION
// ═══════════════════════════════════════════════════════════
const saveToDB = async (table: string, id:string, data: EditorData, action: "draft"|"publish"): Promise<{ok:boolean;id?:number;error?:string}> => {
  // Replace this with your actual API endpoint
  // Example: POST /api/posts with the data object
  // The server should run: INSERT INTO posts SET ? (using mysql2 or Sequelize)
  try {
    const res = await insertPost(table, id, data);
    console.log("DB response:", res);
    if (!res.success) throw new Error(`HTTP ${res.message}`);
      return { ok: true, id: res.id };
  } catch(e: unknown) {
    // MOCK: Simulate success for demo (remove this in production)
    console.group(`📦 MySQL ${action === "publish" ? "PUBLISH" : "SAVE DRAFT"}`);
    console.table({ title: data.title, slug: data.slug, status: data.status, words: data.wordCount });
    console.log("Full payload:", data);
    console.groupEnd();
    await new Promise(r => setTimeout(r, 1200)); // simulate network
    return { ok: true, id: Math.floor(Math.random() * 10000) };
  }
};

// ═══════════════════════════════════════════════════════════
// MAIN EDITOR
// ═══════════════════════════════════════════════════════════
interface ClassicEditorProps {
  initialTitle?:   string;
  initialContent?: string;
  onSave?:    (data: EditorData) => void;
  onPublish?: (data: EditorData) => void;
  onPreview?: (data: EditorData) => void;
}

const ClassicEditor: React.FC<ClassicEditorProps> = ({
  initialTitle   = "",
  initialContent = "",
  onSave,
  onPublish,
  onPreview,
}) => {
  const { dark: isDark, toggle: toggleDark } = useDarkMode();
  const { toasts, add: addToast, dismiss: dismissToast, update: updateToast } = useToast();
  const t = isDark ? dark : light;

  // ── editor state ──────────────────────────────
  const [title,         setTitle]         = useState(initialTitle);
  const [description,   setDescription]   = useState("");
  const [faqs, setFaqs] = useState<{question:string;answer:string}[]>([
  { question: "", answer: "" }
]);
  const [activeTab,     setActiveTab]     = useState<"visual"|"text">("visual");
  const [htmlContent,   setHtmlContent]   = useState(initialContent);
  const [excerpt,       setExcerpt]       = useState("");
  const [slug,          setSlug]          = useState("");
  const [wordCount,     setWordCount]     = useState(0);
  const [charCount,     setCharCount]     = useState(0);
  const [readingTime,   setReadingTime]   = useState(0);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [isFullscreen,  setIsFullscreen]  = useState(false);
  const [savedRange,    setSavedRange]    = useState<Range|null>(null);
  const [showRow2,      setShowRow2]      = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);
  const [lastSaved,     setLastSaved]     = useState<string>("Never");
  const [showPreview,   setShowPreview]   = useState(false);
  const [editorDragging,setEditorDragging]= useState(false);

  // ── publish state ─────────────────────────────
  const [status,       setStatus]       = useState("draft");
  const [visibility,   setVisibility]   = useState("public");
  const [password,     setPassword]     = useState("");
  const [publishDate,  setPublishDate]  = useState("");
  const [format,       setFormat]       = useState("standard");
  const [author,       setAuthor]       = useState("Admin");
  const [template,     setTemplate]     = useState("default");
  const [allowComments,setAllowComments]= useState(true);
  const [allowPingbacks,setAllowPingbacks]=useState(true);

  // ── taxonomy ──────────────────────────────────
  const [categories,   setCategories]   = useState<string[]>(["Uncategorized"]);
  const [newCat,       setNewCat]       = useState("");
  const [tagInput,     setTagInput]     = useState("");
  const [tags,         setTags]         = useState<string[]>([]);

  // ── SEO ───────────────────────────────────────
  const [seoTitle,     setSeoTitle]     = useState("");
  const [seoDesc,      setSeoDesc]      = useState("");
  const [seoKeywords,  setSeoKeywords]  = useState("");
  const [ogTitle,      setOgTitle]      = useState("");
  const [ogDesc,       setOgDesc]       = useState("");
  const [ogImage,      setOgImage]      = useState("");
  const [twitterCard,  setTwitterCard]  = useState("summary_large_image");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [showAdvSeo,   setShowAdvSeo]   = useState(false);

  // ── featured image ────────────────────────────
  const [featuredImage,setFeaturedImage]= useState("");
  const [featuredInput,setFeaturedInput]= useState("");
  const [featDragging, setFeatDragging] = useState(false);

  // ── custom fields ─────────────────────────────
  const [customFields,setCustomFields] = useState<{name:string;value:string}[]>([{name:"",value:""}]);

  // ── modal state ───────────────────────────────
  const [modal, setModal] = useState<string|null>(null);

  const editorRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const featImgRef  = useRef<HTMLInputElement>(null);

const searchParams = useSearchParams();

const id = searchParams.get('id') ?? "";
const table = searchParams.get('table') ?? "posts";
  // ── auto-slug ─────────────────────────────────
  // useEffect(()=>{ setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")); },[title]);
  // useEffect(()=>{ setSeoTitle(title); },[title]);

const fetchdata = async () => {
  try {
    const res = await getNewPageContent(id);
    const data = res?.data || {};

    console.log("✅ FULL DATA:", data);

    // 🧠 Handle snake_case + camelCase दोनों
    const getVal = (snake: string, camel: string) =>
      data[snake] ?? data[camel] ?? "";

    // 📝 Basic
    setTitle(getVal("title", "title"));
    setDescription(getVal("description", "description"));
    setFaqs(JSON.parse(getVal("faqs", "faqs")) || []);
    
    setHtmlContent(getVal("content", "content") || ""); // ❌ "null" removed
    setExcerpt(getVal("excerpt", "excerpt"));
    setSlug(getVal("slug", "slug"));

    // 🚀 Publish
    setStatus(getVal("status", "status") || "draft");
    setVisibility(getVal("visibility", "visibility") || "public");
    setPassword(getVal("password", "password"));

    // 📅 Date fix (snake_case support)
    const rawDate = getVal("publish_date", "publishDate");
    setPublishDate(
      rawDate ? new Date(rawDate).toISOString().slice(0, 16) : ""
    );

    setFormat(getVal("post_format", "format") || "standard");
    setAuthor(getVal("author", "author") || "Admin");
    setTemplate(getVal("template", "template") || "default");

    // 💬 Discussion (handle 0/1)
    setAllowComments(
      data.allow_comments ?? data.allowComments ?? true
    );
    setAllowPingbacks(
      data.allow_pingbacks ?? data.allowPingbacks ?? true
    );

    // 🏷️ Categories
    const cats = getVal("categories", "categories");
    setCategories(
      typeof cats === "string" ? cats.split(",") : cats || ["Uncategorized"]
    );

    // 🏷️ Tags FIX (string → array)
    const rawTags = getVal("tags", "tags");
    const tagArray =
      typeof rawTags === "string"
        ? rawTags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : Array.isArray(rawTags)
        ? rawTags
        : [];

    setTags(tagArray);
    setTagInput(tagArray.join(", "));

    // 🖼️ Featured Image
    setFeaturedImage(getVal("featured_image", "featuredImage"));

    // 🔍 SEO
    setSeoTitle(getVal("seo_title", "seoTitle"));
    setSeoDesc(getVal("seo_description", "seoDescription"));
    setSeoKeywords(getVal("seo_keywords", "seoKeywords"));

    // 🌐 OG
    setOgTitle(getVal("og_title", "ogTitle"));
    setOgDesc(getVal("og_description", "ogDescription"));
    setOgImage(getVal("og_image", "ogImage"));

    // 🐦 Twitter
    setTwitterCard(getVal("twitter_card", "twitterCard") || "summary_large_image");

    // 🔗 Canonical
    setCanonicalUrl(getVal("canonical_url", "canonicalUrl"));

    // ⚙️ Advanced SEO
    setShowAdvSeo(data.show_adv_seo ?? data.showAdvSeo ?? false);

    // 🧩 Custom Fields
    setCustomFields(data.customFields || []);

  } catch (err) {
    console.error("❌ Fetch error:", err);
  }
};

  useEffect(()=>{
    fetchdata();
  },[]);
  console.log("Initial content:", seoTitle);
useEffect(() => {
  if (editorRef.current) {
    editorRef.current.innerHTML = htmlContent || "";
  }
}, [htmlContent]);

  // ── seed content ──────────────────────────────
  useEffect(()=>{
    if(editorRef.current && initialContent){
      editorRef.current.innerHTML = initialContent;
      updateCounts(initialContent);
    }
  },[]);

  // ── auto-save every 60s ───────────────────────
  useEffect(()=>{
    const t = setInterval(()=>{
      if(title||htmlContent){
        const data=buildData(); data.status="draft";
        console.log("Auto-save:", data.title);
        setLastSaved(new Date().toLocaleTimeString());
      }
    }, 60000);
    return ()=>clearInterval(t);
  },[title, htmlContent]);
console.log(featuredImage)
  // ── helpers ───────────────────────────────────
  const updateCounts = useCallback((html: string) => {
    const text = html.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
    const wc = text ? text.split(" ").filter(w=>w.length>0).length : 0;
    setWordCount(wc);
    setCharCount(text.length);
    setReadingTime(Math.max(1, Math.ceil(wc / 200)));
  }, []);

  const refreshFormats = useCallback(() => {
    const cmds=["bold","italic","underline","strikeThrough","insertOrderedList","insertUnorderedList","justifyLeft","justifyCenter","justifyRight","justifyFull","subscript","superscript"];
    const next=new Set<string>();
    cmds.forEach(c=>{ try{ if(document.queryCommandState(c)) next.add(c); }catch{} });
    setActiveFormats(next);
  }, []);

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    refreshFormats();
    const html = editorRef.current?.innerHTML ?? "";
    setHtmlContent(html);
    updateCounts(html);
  }, [refreshFormats, updateCounts]);

  const saveSelection = () => {
    const sel=window.getSelection();
    if(sel?.rangeCount) setSavedRange(sel.getRangeAt(0).cloneRange());
  };
  const restoreSelection = () => {
    if(!savedRange) return;
    const sel=window.getSelection();
    sel?.removeAllRanges(); sel?.addRange(savedRange);
  };

  const switchToText = () => { if(editorRef.current) setHtmlContent(editorRef.current.innerHTML); setActiveTab("text"); };
  const switchToVisual = () => {
    if(textareaRef.current && editorRef.current){ const v=textareaRef.current.value; editorRef.current.innerHTML=v; setHtmlContent(v); }
    setActiveTab("visual");
  };

  const buildData = useCallback((): EditorData => {
    const content = activeTab==="visual" ? (editorRef.current?.innerHTML ?? htmlContent) : (textareaRef.current?.value ?? htmlContent);
    return { title, content, excerpt, slug, status, visibility, password, publishDate,
      categories, tags, featuredImage, allowComments, allowPingbacks,
      seoTitle, seoDescription: seoDesc, seoKeywords, wordCount, charCount, readingTime,
      format, author, template, customFields, ogTitle, ogDescription: ogDesc,
      ogImage, twitterCard, canonicalUrl ,description, faqs};
  },[title, htmlContent, excerpt, slug, status, visibility, password, publishDate,
     categories, tags, featuredImage, allowComments, allowPingbacks, seoTitle, seoDesc,
     seoKeywords, wordCount, charCount, readingTime, activeTab, format, author, template,
     customFields, ogTitle, ogDesc, ogImage, twitterCard, canonicalUrl ,description ,faqs]);

  // ── toolbar handler ───────────────────────────
  const handleBtn = (btn: TBtn) => {
    if(btn.type==="sep" || !btn.command) return;
    const specials: Record<string,string> = {
      __link__:"link", __image__:"image", __table__:"table", __video__:"video",
      __emoji__:"emoji", __special__:"special", __find__:"find",
      __paste__:"paste", __code__:"code", __anchor__:"anchor",
    };
    if(specials[btn.command]){ saveSelection(); setModal(specials[btn.command]); return; }
    if(btn.command==="print"){ window.print(); return; }
    exec(btn.command, btn.value);
  };

  // ── modal insert handlers ─────────────────────
  const insertLink = (url:string, text:string, newTab:boolean, rel:string, title:string) => {
    restoreSelection();
    const t=newTab?' target="_blank" rel="noopener noreferrer"':'';
    const r=rel?` rel="${rel}"`:'';
    const ti=title?` title="${title}"`:'';
    exec("insertHTML", `<a href="${url}"${t}${r}${ti}>${text||url}</a>`);
    setModal(null);
  };

  const insertAnchor = (id: string) => {
    restoreSelection();
    exec("insertHTML", `<span id="${id}" class="anchor-point">&nbsp;</span>`);
    setModal(null);
  };

  const insertImage = (src:string, alt:string, align:string, w:string, h:string, caption:string, link:string) => {
    restoreSelection();
    const style=[w?`width:${w}px`:"",h?`height:${h}px`:"","max-width:100%"].filter(Boolean).join(";");
    const floatStyle=align==="left"?"float:left;margin-right:10px":align==="right"?"float:right;margin-left:10px":align==="center"?"display:block;margin:0 auto":"";
    let imgHtml=`<img src="${src}" alt="${alt}" style="${style};${floatStyle}"/>`;
    if(link) imgHtml=`<a href="${link}">${imgHtml}</a>`;
    const html=caption ? `<figure style="margin:0 0 1em">${imgHtml}<figcaption style="text-align:center;font-size:0.85em;color:#666;margin-top:4px">${caption}</figcaption></figure>` : imgHtml;
    exec("insertHTML", html);
    setModal(null);
  };

  const insertTable = (rows:number, cols:number, header:boolean, border:boolean, striped:boolean, caption:string) => {
    restoreSelection();
    const borderAttr=border?` border="1" style="border-collapse:collapse;width:100%"`:' style="width:100%"';
    const cellStyle=border?' style="border:1px solid #ccc;padding:8px 12px"':' style="padding:8px 12px"';
    let html=`<table${borderAttr}>`;
    if(caption) html+=`<caption style="caption-side:top;text-align:center;font-weight:bold;padding:6px">${caption}</caption>`;
    if(header){ html+=`<thead><tr>`; for(let c=0;c<cols;c++) html+=`<th${cellStyle} style="${border?"border:1px solid #ccc;":""}padding:8px 12px;background:#f0f0f0;font-weight:600">Header ${c+1}</th>`; html+=`</tr></thead>`; }
    html+=`<tbody>`;
    for(let r=0;r<rows-(header?1:0);r++){
      const rowStyle=striped&&r%2===1?' style="background:#f9f9f9"':'';
      html+=`<tr${rowStyle}>`; for(let c=0;c<cols;c++) html+=`<td${cellStyle}>Cell ${r+1},${c+1}</td>`; html+=`</tr>`;
    }
    html+=`</tbody></table><p><br/></p>`;
    exec("insertHTML", html);
    setModal(null);
  };

  const insertVideo = (html:string) => { restoreSelection(); exec("insertHTML", html+`<p><br/></p>`); setModal(null); };
  const insertEmoji = (e:string) => { restoreSelection(); exec("insertText", e); };
  const insertSpecial = (c:string) => { restoreSelection(); exec("insertHTML", c); };
  const insertCode = (code:string, lang:string) => {
    restoreSelection();
    exec("insertHTML", `<pre data-lang="${lang}" style="background:#1e1e1e;color:#d4d4d4;padding:20px;border-radius:8px;overflow:auto;font-size:13px;line-height:1.7;font-family:monospace"><code class="language-${lang}">${code.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre><p><br/></p>`);
    setModal(null);
  };

  // ── editor drag-drop images ───────────────────
  const handleEditorDrop = (e: DragEvent<HTMLDivElement>) => {
    const files = Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith("image/"));
    if(files.length){
      e.preventDefault();
      setEditorDragging(false);
      files.forEach(file=>{
        const reader=new FileReader();
        reader.onload=(ev)=>{
          const src=ev.target?.result as string;
          exec("insertHTML", `<img src="${src}" alt="${file.name}" style="max-width:100%;display:block;margin:8px 0"/>`);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // ── featured image drag-drop ──────────────────
  const handleFeatDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setFeatDragging(false);
    const file=e.dataTransfer.files[0];
    if(file?.type.startsWith("image/")){
      const reader=new FileReader();
      reader.onload=ev=>setFeaturedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleFeatFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0];
    if(file){ const reader=new FileReader(); reader.onload=ev=>setFeaturedImage(ev.target?.result as string); reader.readAsDataURL(file); }
  };

  // ── save/publish ──────────────────────────────
  const handleSave = async () => {
    if(isSaving) return;
    setIsSaving(true);
    const toastId = addToast("Saving draft...", "loading");
    try {
      const data=buildData(); data.status="draft";
      const result = await saveToDB(table, id, data, "draft");
      if(result.ok){
        setLastSaved(new Date().toLocaleTimeString());
        updateToast(toastId, `Draft saved! (ID: ${result.id})`, "success");
        onSave?.(data);
      } else { updateToast(toastId, result.error||"Save failed", "error"); }
    } catch(e) { updateToast(toastId, "Network error — save failed", "error"); }
    finally { setIsSaving(false); }
  };

  const handlePublish = async () => {
    if(!title.trim()){ addToast("Please add a title before publishing", "error"); return; }
    if(isSaving) return;
    setIsSaving(true);
    const toastId = addToast("Publishing post...", "loading");
    try {
      if (!table || !id) {
        updateToast(toastId, "Missing table or id (cannot publish)", "error");
        return;
      }
      const data = buildData(); data.status = "published";
      console.log("Publishing data:", data);
      const result = await saveToDB(table, id, data, "publish");
      if(result.ok){
        setStatus("published");
        setLastSaved(new Date().toLocaleTimeString());
        updateToast(toastId, `Post published! (ID: ${result.id})`, "success");
        onPublish?.(data);
      } else { updateToast(toastId, result.error||"Publish failed", "error"); }
    } catch(e) { updateToast(toastId, "Network error — publish failed", "error"); }
    finally { setIsSaving(false); }
  };

  const handlePreview = () => {
    const data = buildData();
    setShowPreview(true);
    onPreview?.(data);
  };

  // ── tag/category helpers ──────────────────────
  const addTag = () => {
    const parts=tagInput.split(",").map(s=>s.trim()).filter(s=>s&&!tags.includes(s));
    if(parts.length) setTags(p=>[...p,...parts]);
    setTagInput("");
  };
  const addCategory = () => {
    const c=newCat.trim();
    if(c&&!categories.includes(c)) setCategories(p=>[...p,c]);
    setNewCat("");
  };

  const isActive = (cmd:string) => activeFormats.has(cmd);
  const selCls = `h-[28px] text-xs border rounded transition-colors outline-none cursor-pointer px-1.5 ${t.selectCls} ${t.inputBorder} ${t.inputFocus}`;
  const inputCls = `w-full border rounded-lg px-2.5 py-1.5 text-sm outline-none transition ${t.card} ${t.text} ${t.inputBorder} ${t.inputFocus}`;

  const ALL_CATS = ["Uncategorized","Technology","Design","Business","Lifestyle","Health","Travel","Food","Sports","Entertainment"];

  // ─────────────────────────────────────────────
  return (
    <div className={`font-sans ${t.text} ${t.bg} p-5 pb-20 min-h-screen transition-colors duration-200
      ${isFullscreen?"fixed inset-0 z-[9998] overflow-y-auto":""}`}>

      <ToastContainer toasts={toasts} onDismiss={dismissToast}/>
      {showPreview && <PreviewModal data={buildData()} onClose={()=>setShowPreview(false)} isDark={isDark}/>}

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold">Add New Post</h1>
          <p className={`text-xs ${t.muted} mt-0.5`}>
            Last saved: <strong>{lastSaved}</strong>
            {status==="published" && <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs">Published</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleDark}
            className={`p-2 rounded-lg border transition-colors ${t.card} ${t.border} ${t.muted} hover:${t.text}`}
            title={isDark?"Switch to Light Mode":"Switch to Dark Mode"}>
            {isDark ? <I.Sun/> : <I.Moon/>}
          </button>
          <button onClick={handlePreview}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors ${t.card} ${t.border} ${t.muted}`}>
            <I.Eye/> Preview
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* ══ LEFT COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Title */}
          <div>
            <input type="text" placeholder="Enter title here" value={title} onChange={e=>setTitle(e.target.value)}
              className={`w-full text-[22px] font-light border px-3 py-2.5 rounded-lg shadow-sm outline-none transition
                ${t.card} ${t.text} ${t.inputBorder} ${t.inputFocus} placeholder:opacity-30`}/>
            
          </div>


          {/* Editor Box */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>

            {/* Tab row */}
            <div className={`flex items-center ${t.tabBar} border-b ${t.border}`}>
              {(["visual","text"] as const).map(tab=>(
                <button key={tab} onClick={tab==="visual"?switchToVisual:switchToText}
                  className={`px-4 py-2.5 text-[13px] border-r ${t.border} capitalize transition-colors
                    ${activeTab===tab?`${t.activeTab} ${t.text} font-semibold border-b-2 border-b-[#0073aa] -mb-px`:`${t.muted} hover:${t.text}`}`}>
                  {tab}
                </button>
              ))}
              <button title={isFullscreen?"Exit Fullscreen":"Distraction-free writing"} onClick={()=>setIsFullscreen(f=>!f)}
                className={`ml-auto px-3 py-2 ${t.muted} hover:${t.text} transition-colors`}>
                {isFullscreen ? <I.ExitFull/> : <I.Fullscreen/>}
              </button>
            </div>

            {/* Toolbar */}
            {activeTab==="visual" && (
              <div className={`border-b ${t.border} ${t.toolbar} px-2 pt-2 pb-1.5 space-y-1`}>

                {/* Row 0: selects + colors */}
                <div className="flex flex-wrap items-center gap-1">
                  <select defaultValue="p" onChange={e=>exec("formatBlock",e.target.value)} className={selCls}>
                    <option value="p">Paragraph</option>
                    {["h1","h2","h3","h4","h5","h6"].map(h=><option key={h} value={h}>{h.toUpperCase()}</option>)}
                    <option value="pre">Preformatted</option>
                  </select>
                  <select defaultValue="default" onChange={e=>exec("fontName",e.target.value==="default"?"serif":e.target.value)} className={`${selCls} w-28`}>
                    <option value="default">Default Font</option>
                    {["Arial","Georgia","Courier New","Times New Roman","Verdana","Trebuchet MS","Tahoma","Impact","Palatino"].map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                  <select defaultValue="3" onChange={e=>exec("fontSize",e.target.value)} className={`${selCls} w-14`}>
                    {[["1","8pt"],["2","10pt"],["3","12pt"],["4","14pt"],["5","18pt"],["6","24pt"],["7","36pt"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                  <label title="Text Color" className={`relative w-[28px] h-[28px] flex items-center justify-center border ${t.inputBorder} rounded ${t.card} cursor-pointer hover:${t.border} overflow-hidden font-bold text-[13px] transition-colors`}>
                    <span className="text-red-500">A</span>
                    <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" onChange={e=>exec("foreColor",e.target.value)}/>
                  </label>
                  <label title="Highlight Color" className={`relative w-[28px] h-[28px] flex items-center justify-center border ${t.inputBorder} rounded ${t.card} cursor-pointer hover:${t.border} overflow-hidden transition-colors`}>
                    <span className="text-[13px] font-bold bg-yellow-300 px-0.5 leading-tight text-black">A</span>
                    <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" onChange={e=>exec("hiliteColor",e.target.value)}/>
                  </label>
                  <span className={`inline-block w-px h-[22px] ${isDark?"bg-[#444]":"bg-[#ddd]"} mx-0.5 self-center`}/>
                  <button onClick={()=>setShowRow2(r=>!r)}
                    className={`h-[28px] px-2 text-xs border rounded transition-colors ${showRow2?`${t.btnActive} border`:`${t.inputBorder} border ${t.muted} ${t.btnHover}`}`}>
                    {showRow2?"▲ Less":"▼ More"}
                  </button>
                </div>

                {/* Row 1 */}
                <div className="flex flex-wrap items-center gap-0.5">
                  {ROW1.map((btn,i)=>{
                    if(btn.type==="sep") return <span key={i} className={`inline-block w-px h-[22px] ${isDark?"bg-[#444]":"bg-[#ddd]"} mx-1 self-center shrink-0`}/>;
                    const active=btn.command?isActive(btn.command):false;
                      return (
                      <button key={i} title={btn.title}
                        onMouseDown={e=>{e.preventDefault();handleBtn(btn as TBtn);}}
                        className={`w-[28px] h-[28px] flex items-center justify-center rounded border transition-colors
                          ${active?`${t.btnActive} border`:`border-transparent ${t.muted} ${t.btnHover}`}`}>
                        {btn.icon}
                      </button>
                    );
                  })}
                </div>

                {/* Row 2 */}
                {showRow2 && (
                  <div className={`flex flex-wrap items-center gap-0.5 border-t ${t.border} pt-1.5`}>
                    {ROW2.map((btn,i)=>{
                      if(btn.type==="sep") return <span key={i} className={`inline-block w-px h-[22px] ${isDark?"bg-[#444]":"bg-[#ddd]"} mx-1 self-center shrink-0`}/>;
                      return (
                        <button key={i} title={btn.title}
                          onMouseDown={e=>{e.preventDefault();handleBtn(btn as TBtn);}}
                          className={`w-[28px] h-[28px] flex items-center justify-center rounded border border-transparent ${t.muted} ${t.btnHover} transition-colors`}>
                          {btn.icon}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Content Area */}
            {activeTab==="visual" ? (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onDragOver={e=>{e.preventDefault();setEditorDragging(true);}}
                onDragLeave={()=>setEditorDragging(false)}
                onDrop={handleEditorDrop}
                className={`min-h-[400px] px-6 py-5 outline-none text-sm leading-7 transition-colors
                  ${isDark?"bg-[#252525] text-[#e8e8e8]":"bg-white text-[#23282d]"}
                  ${editorDragging?(isDark?"ring-2 ring-[#4a9eff] ring-inset":"ring-2 ring-[#0073aa] ring-inset"):""}
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#0073aa] [&_blockquote]:pl-4
                  [&_blockquote]:opacity-80 [&_blockquote]:italic [&_blockquote]:my-3
                  [&_a]:text-[#0073aa] [&_a]:underline
                  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-3
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2
                  [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2
                  [&_h4]:text-base [&_h4]:font-bold [&_h4]:my-2
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
                  [&_hr]:my-4 [&_hr]:opacity-30
                  [&_pre]:bg-[#1e1e1e] [&_pre]:text-[#d4d4d4] [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-xs [&_pre]:overflow-auto
                  [&_table]:border-collapse [&_table]:w-full [&_table]:my-3
                  [&_td]:border [&_td]:border-[#ccc] [&_td]:px-3 [&_td]:py-2
                  [&_th]:border [&_th]:border-[#ccc] [&_th]:px-3 [&_th]:py-2 [&_th]:bg-[#f0f0f0] [&_th]:font-semibold
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded
                  [&_figure]:my-3 [&_figcaption]:text-xs [&_figcaption]:text-center [&_figcaption]:opacity-60
                  empty:before:content-['Start_typing_or_drop_images_here...'] empty:before:opacity-30`}
                onInput={e=>{ const html=(e.target as HTMLDivElement).innerHTML; setHtmlContent(html); updateCounts(html); }}
                onKeyUp={refreshFormats} onMouseUp={refreshFormats}
              />
            ) : (
              <textarea ref={textareaRef} defaultValue={htmlContent}
                onChange={e=>updateCounts(e.target.value)} spellCheck={false}
                className={`w-full min-h-[400px] px-6 py-5 font-mono text-[13px] leading-relaxed border-none outline-none resize-y ${isDark?"bg-[#252525] text-[#e8e8e8]":"bg-white text-[#23282d]"}`}/>
            )}

            {/* Status bar */}
            <div className={`flex items-center justify-between px-4 py-2 border-t ${t.border} ${t.statusBar} text-xs ${t.muted}`}>
              <span className="flex items-center gap-3">
                <span>Words: <strong className={t.text}>{wordCount}</strong></span>
                <span>Chars: <strong className={t.text}>{charCount}</strong></span>
                <span>~{readingTime} min read</span>
              </span>
              {activeTab==="visual" && <span className={`text-xs ${t.muted}`}>Tip: Drop images directly into the editor</span>}
            </div>
          </div>
 {/* description */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader}`}>
              <span className="font-semibold text-[13px]">Description (top show)</span>
            </div>
            <div className="p-4">
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3}
                placeholder="please enter description show in top."
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none resize-y transition ${t.card} ${t.text} ${t.inputBorder} ${t.inputFocus} placeholder:opacity-40`}/>
            </div>
          </div>

          {/* Excerpt */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader}`}>
              <span className="font-semibold text-[13px]">Excerpt</span>
            </div>
            <div className="p-4">
              <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} rows={3}
                placeholder="Hand-crafted summary of your content. Leave blank to auto-generate."
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none resize-y transition ${t.card} ${t.text} ${t.inputBorder} ${t.inputFocus} placeholder:opacity-40`}/>
            </div>
          </div>

          {/* Discussion */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader}`}><span className="font-semibold text-[13px]">Discussion</span></div>
            <div className="p-4 space-y-3">
              {[{v:allowComments,s:setAllowComments,l:"Allow comments"},{v:allowPingbacks,s:setAllowPingbacks,l:"Allow trackbacks and pingbacks"}].map(({v,s,l})=>(
                <label key={l} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                  <input type="checkbox" checked={v} onChange={e=>s(e.target.checked)} className="accent-[#0073aa] w-4 h-4"/>{l}
                </label>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader} flex items-center justify-between`}>
              <span className="font-semibold text-[13px]">SEO Settings</span>
              <button onClick={()=>setShowAdvSeo(s=>!s)} className={`text-xs ${t.muted} hover:${t.text}`}>{showAdvSeo?"Hide Advanced ▲":"Advanced ▼"}</button>
            </div>
            <div className="p-4 space-y-4">
              {/* SEO Title */}
              <div>
                <label className={`block text-xs font-semibold ${t.text} mb-1.5`}>SEO Title</label>
                <input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} className={inputCls} placeholder="SEO optimized title"/>
                <div className={`flex justify-between text-xs ${t.muted} mt-1`}>
                  <span>{seoTitle.length}/60 chars</span>
                  <span className={seoTitle.length>60?"text-red-500":seoTitle.length>=50?"text-green-500":""}>
                    {seoTitle.length>=50&&seoTitle.length<=60?"✓ Good":seoTitle.length>60?"Too long":""}
                  </span>
                </div>
              </div>
              {/* SEO Desc */}
              <div>
                <label className={`block text-xs font-semibold ${t.text} mb-1.5`}>Meta Description</label>
                <textarea value={seoDesc} onChange={e=>setSeoDesc(e.target.value)} rows={2}
                  className={`${inputCls} resize-none`} placeholder="Brief description for search engines (130-160 chars)"/>
                <div className={`flex justify-between text-xs ${t.muted} mt-1`}>
                  <span>{seoDesc.length}/160 chars</span>
                  <span className={seoDesc.length>160?"text-red-500":seoDesc.length>=130?"text-green-500":""}>
                    {seoDesc.length>=130&&seoDesc.length<=160?"✓ Good":seoDesc.length>160?"Too long":""}
                  </span>
                </div>
              </div>
              {/* Keywords */}
              <div>
                <label className={`block text-xs font-semibold ${t.text} mb-1.5`}>Meta Keywords</label>
                <input value={seoKeywords} onChange={e=>setSeoKeywords(e.target.value)} className={inputCls} placeholder="keyword1, keyword2, keyword3"/>
              </div>
              {/* Canonical */}
              <div>
                <label className={`block text-xs font-semibold ${t.text} mb-1.5`}>Canonical URL</label>
                <input value={canonicalUrl} onChange={e=>setCanonicalUrl(e.target.value)} className={inputCls} placeholder="https://yoursite.com/canonical-page/"/>
              </div>

              {/* Advanced SEO */}
              {showAdvSeo && (
                <div className={`pt-4 border-t ${t.border} space-y-4`}>
                  <p className={`text-xs font-semibold ${t.muted} uppercase tracking-wide`}>Open Graph / Social</p>
                  <div>
                    <label className={`block text-xs font-semibold ${t.text} mb-1.5`}>OG Title</label>
                    <input value={ogTitle} onChange={e=>setOgTitle(e.target.value)} className={inputCls} placeholder="Social share title"/>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${t.text} mb-1.5`}>OG Description</label>
                    <textarea value={ogDesc} onChange={e=>setOgDesc(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Social share description"/>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${t.text} mb-1.5`}>OG Image URL</label>
                    <input value={ogImage} onChange={e=>setOgImage(e.target.value)} className={inputCls} placeholder="https://..."/>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${t.text} mb-1.5`}>Twitter Card</label>
                    <select value={twitterCard} onChange={e=>setTwitterCard(e.target.value)} className={`${inputCls} cursor-pointer`}>
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                      <option value="app">App</option>
                      <option value="player">Player</option>
                    </select>
                  </div>
                </div>
              )}
  {/* FAQs */}
<div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
  <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader} flex items-center justify-between`}>
    <span className="font-semibold text-[13px]">FAQs</span>
    <button
      onClick={() => setFaqs(f => [...f, { question: "", answer: "" }])}
      className="text-[#0073aa] text-xs flex items-center gap-1 hover:underline"
    >
      + Add FAQ
    </button>
  </div>

  <div className="p-4 space-y-3">
    {faqs.map((faq, i) => (
      <div key={i} className={`border ${t.border} rounded-lg p-3 space-y-2`}>
        
        {/* Question */}
        <input
          type="text"
          placeholder="Enter question..."
          value={faq.question}
          onChange={e =>
            setFaqs(f =>
              f.map((x, j) =>
                j === i ? { ...x, question: e.target.value } : x
              )
            )
          }
          className={`w-full border rounded-lg px-2 py-1.5 text-sm outline-none ${t.card} ${t.text} ${t.inputBorder}`}
        />

        {/* Answer */}
        <textarea
          rows={2}
          placeholder="Enter answer..."
          value={faq.answer}
          onChange={e =>
            setFaqs(f =>
              f.map((x, j) =>
                j === i ? { ...x, answer: e.target.value } : x
              )
            )
          }
          className={`w-full border rounded-lg px-2 py-1.5 text-sm outline-none ${t.card} ${t.text} ${t.inputBorder}`}
        />

        {/* Remove */}
        <div className="flex justify-end">
          <button
            onClick={() => setFaqs(f => f.filter((_, j) => j !== i))}
            className="text-xs text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>

      </div>
    ))}

    {faqs.length === 0 && (
      <p className={`text-xs ${t.muted}`}>No FAQs added.</p>
    )}
  </div>
</div>
              {/* SERP Preview */}
              {(seoTitle||seoDesc) && (
                <div className={`border ${t.border} rounded-xl p-4 ${isDark?"bg-[#1a1a1a]":"bg-[#fafafa]"}`}>
                  <p className={`text-[10px] ${t.muted} mb-2 uppercase tracking-wide`}>Google Preview</p>
                  <p className="text-[#1a0dab] text-base hover:underline cursor-pointer truncate">{seoTitle||title}</p>
                  <p className="text-green-700 text-xs">{process.env.NEXT_PUBLIC_SITE_URL}/{`${slug}`}</p>
                  <p className={`text-sm mt-0.5 ${isDark?"text-[#bbb]":"text-[#545454]"} line-clamp-2`}>{seoDesc||excerpt||"No description set."}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="w-[280px] shrink-0 space-y-4">

          {/* Publish Box */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`flex items-center justify-between px-4 py-3 ${isDark?"bg-[#111]":"bg-[#23282d]"}`}>
              <span className="text-white text-[13px] font-semibold">Publish</span>
              <button onClick={handlePreview} className="flex items-center gap-1 text-white/60 hover:text-white text-xs transition-colors"><I.Eye/> Preview</button>
            </div>
            <div className={`px-4 py-3 space-y-3 text-[13px] border-b ${t.border}`}>
              {[
                {label:"Status",el:<select value={status} onChange={e=>setStatus(e.target.value)} className={`w-36 h-[28px] text-xs border rounded ${t.selectCls} ${t.inputBorder} outline-none focus:${t.inputBorder} px-1.5 cursor-pointer`}><option value="draft">Draft</option><option value="published">Published</option><option value="pending">Pending Review</option><option value="private">Private</option></select>},
                {label:"Visibility",el:<select value={visibility} onChange={e=>setVisibility(e.target.value)} className={`w-36 h-[28px] text-xs border rounded ${t.selectCls} ${t.inputBorder} outline-none px-1.5 cursor-pointer`}><option value="public">Public</option><option value="password">Password Protected</option><option value="private">Private</option></select>},
                {label:"Author",el:<select value={author} onChange={e=>setAuthor(e.target.value)} className={`w-36 h-[28px] text-xs border rounded ${t.selectCls} ${t.inputBorder} outline-none px-1.5 cursor-pointer`}><option>Admin</option><option>Editor</option><option>Author</option></select>},
                {label:"Format",el:<select value={format} onChange={e=>setFormat(e.target.value)} className={`w-36 h-[28px] text-xs border rounded ${t.selectCls} ${t.inputBorder} outline-none px-1.5 cursor-pointer`}>{["standard","aside","gallery","link","image","quote","status","video","audio","chat"].map(f=><option key={f} value={f}>{f}</option>)}</select>},
              ].map(({label,el})=>(
                <div key={label} className="flex items-center justify-between">
                  <span className={t.muted}>{label}:</span>{el}
                </div>
              ))}
              {visibility==="password" && (
                <div className="flex items-center justify-between">
                  <span className={t.muted}>Password:</span>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                    className={`w-36 h-[28px] text-xs border rounded px-1.5 outline-none ${t.card} ${t.text} ${t.inputBorder}`} placeholder="Enter password"/>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={t.muted}>Publish:</span>
                <input type="datetime-local" value={publishDate} onChange={e=>setPublishDate(e.target.value)}
                  className={`w-36 h-[28px] text-xs border rounded px-1 outline-none ${t.card} ${t.text} ${t.inputBorder}`}/>
              </div>
            </div>
            <div className={`flex items-center justify-between px-4 py-3 ${t.publishFooter}`}>
              <button className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors">Move to Trash</button>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={isSaving}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors disabled:opacity-50
                    ${isDark?"bg-[#333] border-[#555] text-[#ccc] hover:bg-[#3a3a3a]":"bg-[#f7f7f7] border-[#ccc] text-[#555] hover:bg-[#eee]"}`}>
                  {isSaving ? <I.Spin/> : <I.Save/>} Save
                </button>
                <button onClick={handlePublish} disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#0073aa] hover:bg-[#006799] disabled:opacity-50 border border-[#006799] rounded-lg transition-colors">
                  {isSaving ? <I.Spin/> : <I.Check/>} Publish
                </button>
              </div>
            </div>
          </div>

          {/* Post Format */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader}`}><span className="font-semibold text-[13px]">Format</span></div>
            <div className="p-3 space-y-1 grid grid-cols-2">
              {["standard","aside","gallery","link","image","quote","status","video","audio","chat"].map(f=>(
                <label key={f} className={`flex items-center gap-2 text-sm capitalize cursor-pointer select-none rounded-lg px-2 py-1 transition-colors ${format===f?(isDark?"bg-[#1a3a5c]":"bg-[#e5f3fb]"):t.btnHover}`}>
                  <input type="radio" name="post_format" value={f} checked={format===f} onChange={()=>setFormat(f)} className="accent-[#0073aa]"/>{f}
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader}`}><span className="font-semibold text-[13px]">Categories</span></div>
            <div className="p-3">
              <div className={`max-h-40 overflow-y-auto space-y-1 mb-3 border ${t.border} rounded-lg p-2 ${isDark?"bg-[#1e1e1e]":"bg-[#fafafa]"}`}>
                {ALL_CATS.map(c=>(
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="checkbox" checked={categories.includes(c)} onChange={e=>setCategories(prev=>e.target.checked?[...prev,c]:prev.filter(x=>x!==c))} className="accent-[#0073aa] w-4 h-4"/>{c}
                  </label>
                ))}
              </div>
              <details className="text-xs">
                <summary className={`text-[#0073aa] cursor-pointer hover:underline`}>+ Add New Category</summary>
                <div className="mt-2 space-y-2">
                  <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCategory()} placeholder="Category name"
                    className={`w-full border rounded-lg px-2 py-1.5 text-xs outline-none ${t.card} ${t.text} ${t.inputBorder} ${t.inputFocus}`}/>
                  <button onClick={addCategory} className="px-3 py-1 text-xs text-white bg-[#0073aa] hover:bg-[#006799] rounded-lg transition-colors">Add</button>
                </div>
              </details>
            </div>
          </div>

          {/* Tags */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader}`}><span className="font-semibold text-[13px]">Tags</span></div>
            <div className="p-3">
              <div className="flex gap-1.5 mb-2">
                <input value={tagInput} onChange={e=>setTagInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter"||e.key===","){ e.preventDefault(); addTag(); } }}
                  placeholder="Add tags (comma-separated)..."
                  className={`flex-1 border rounded-lg px-2 py-1.5 text-xs outline-none ${t.card} ${t.text} ${t.inputBorder} ${t.inputFocus}`}/>
                <button onClick={addTag} className="px-3 py-1.5 text-xs text-white bg-[#0073aa] hover:bg-[#006799] rounded-lg transition-colors flex items-center gap-1"><I.Plus/>Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag=>(
                  <span key={tag} className={`inline-flex items-center gap-1 px-2.5 py-1 text-[#0073aa] text-xs rounded-full border transition-colors ${isDark?"bg-[#1a3a5c] border-[#2a5a8c]":"bg-[#e5f3fb] border-[#b3d7ed]"}`}>
                    #{tag}
                    <button onClick={()=>setTags(p=>p.filter(x=>x!==tag))} className="hover:text-red-500 transition-colors ml-0.5"><I.X/></button>
                  </span>
                ))}
                {tags.length===0 && <span className={`text-xs ${t.muted}`}>No tags yet.</span>}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader}`}><span className="font-semibold text-[13px]">Featured Image</span></div>
            <div className="p-3">
              <input ref={featImgRef} type="file" accept="image/*" className="hidden" onChange={handleFeatFile}/>
              {featuredImage ? (
                <div className="space-y-2">
                  <div className="relative group rounded-lg overflow-hidden">
                    <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover"/>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={()=>featImgRef.current?.click()} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg backdrop-blur-sm transition-colors">Replace</button>
                      <button onClick={()=>setFeaturedImage("")} className="px-3 py-1 bg-red-500/70 hover:bg-red-500/90 text-white text-xs rounded-lg backdrop-blur-sm transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={e=>{e.preventDefault();setFeatDragging(true);}}
                  onDragLeave={()=>setFeatDragging(false)}
                  onDrop={handleFeatDrop}
                  onClick={()=>featImgRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
                    ${featDragging?(isDark?"border-[#4a9eff] bg-[#1a3a5c]/30":"border-[#0073aa] bg-[#0073aa]/5 scale-[1.01]"):
                      `${isDark?"border-[#444] hover:border-[#666]":"border-[#ddd] hover:border-[#aaa]"}`}`}>
                  <div className={`flex justify-center mb-2 ${t.muted}`}><I.Upload/></div>
                  <p className={`text-xs font-medium ${t.muted}`}>{featDragging?"Drop to set as featured!":"Drag & drop or click"}</p>
                </div>
              )}
              <div className="mt-2 flex gap-1.5">
                <input value={featuredInput} onChange={e=>setFeaturedInput(e.target.value)}
                  placeholder="Or paste image URL..." className={`flex-1 border rounded-lg px-2 py-1.5 text-xs outline-none ${t.card} ${t.text} ${t.inputBorder} ${t.inputFocus}`}/>
                <button onClick={()=>{ if(featuredInput){ setFeaturedImage(featuredInput); setFeaturedInput(""); } }}
                  className="px-2 py-1.5 text-xs text-white bg-[#0073aa] hover:bg-[#006799] rounded-lg transition-colors">Set</button>
              </div>
            </div>
          </div>

          {/* Page Attributes */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader}`}><span className="font-semibold text-[13px]">Page Attributes</span></div>
            <div className="p-3 space-y-3">
              {[{label:"Parent",opts:["(no parent)","Home","About","Blog","Services","Contact"]},{label:"Template",opts:["Default Template","Full Width","Sidebar Left","Blank","Landing Page"]}].map(({label,opts})=>(
                <div key={label}>
                  <label className={`block text-xs font-semibold ${t.text} mb-1`}>{label}</label>
                  <select className={`w-full h-[28px] text-xs border rounded-lg ${t.selectCls} ${t.inputBorder} outline-none px-1.5 cursor-pointer`}>
                    {opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className={`block text-xs font-semibold ${t.text} mb-1`}>Order</label>
                <input type="number" defaultValue={0} className={`w-full h-[28px] border rounded-lg text-xs px-2 outline-none ${t.card} ${t.text} ${t.inputBorder}`}/>
              </div>
            </div>
          </div>
          {/* Custom Fields */}
          <div className={`${t.card} border ${t.border} shadow-sm rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${t.border} ${t.panelHeader} flex items-center justify-between`}>
              <span className="font-semibold text-[13px]">Custom Fields</span>
              <button onClick={()=>setCustomFields(f=>[...f,{name:"",value:""}])}
                className="flex items-center gap-1 text-[#0073aa] hover:underline text-xs"><I.Plus/>Add</button>
            </div>
            <div className="p-3 space-y-2">
              {customFields.map((cf,i)=>(
                <div key={i} className="flex gap-1.5 items-center">
                  <input placeholder="Name" value={cf.name} onChange={e=>setCustomFields(f=>f.map((x,j)=>j===i?{...x,name:e.target.value}:x))}
                    className={`flex-1 border rounded-lg px-2 py-1.5 text-xs outline-none ${t.card} ${t.text} ${t.inputBorder} ${t.inputFocus}`}/>
                  <input placeholder="Value" value={cf.value} onChange={e=>setCustomFields(f=>f.map((x,j)=>j===i?{...x,value:e.target.value}:x))}
                    className={`flex-1 border rounded-lg px-2 py-1.5 text-xs outline-none ${t.card} ${t.text} ${t.inputBorder} ${t.inputFocus}`}/>
                  <button onClick={()=>setCustomFields(f=>f.filter((_,j)=>j!==i))} className={`${t.muted} hover:text-red-500 transition-colors shrink-0`}><I.X/></button>
                </div>
              ))}
            </div>
          </div>
        

        </div>{/* end RIGHT */}
      </div>

      {/* ── Modals ── */}
      {modal==="link"    && <LinkModal    onInsert={insertLink}    onClose={()=>setModal(null)} isDark={isDark} />}
      {modal==="anchor"  && <AnchorModal  onInsert={insertAnchor}  onClose={()=>setModal(null)} isDark={isDark} />}
      {modal==="image"   && <ImageModal   onInsert={insertImage}   onClose={()=>setModal(null)} isDark={isDark} />}
      {modal==="table"   && <TableModal   onInsert={insertTable}   onClose={()=>setModal(null)} isDark={isDark}/>}
      {modal==="video"   && <VideoModal   onInsert={insertVideo}   onClose={()=>setModal(null)} isDark={isDark}/>}
      {modal==="emoji"   && <EmojiModal   onInsert={insertEmoji}   onClose={()=>setModal(null)} isDark={isDark}/>}
      {modal==="special" && <SpecialModal onInsert={insertSpecial} onClose={()=>setModal(null)} isDark={isDark}/>}
      {modal==="find"    && <FindModal    editorRef={editorRef}    onClose={()=>setModal(null)} isDark={isDark}/>}
      {modal==="code"    && <CodeModal    onInsert={insertCode}    onClose={()=>setModal(null)} isDark={isDark}/>}
      {modal==="paste"   && (() => { restoreSelection(); const sel=window.getSelection()?.toString()||""; exec("insertText",sel); setModal(null); return null; })()}
    </div>
  );
};

export default ClassicEditor;
