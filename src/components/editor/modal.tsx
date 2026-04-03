import { EMOJI_CATS, I, SPEC_CATS,dark, light } from "@/utils/consitants/consitaint";
import { EditorData } from "@/utils/types/uiTypes";
import { DragEvent, useRef, useState } from "react";

export const ModalWrap = ({ title, onClose, children, footer, isDark }: {
  title: string; onClose: () => void;
  children: React.ReactNode; footer: React.ReactNode; isDark: boolean;
    
}) => {
  const t = isDark ? dark : light;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={`w-[480px] max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden ${t.card} ${t.border} border`}>
        <div className={`flex items-center justify-between px-5 py-3.5 shrink-0 ${isDark ? "bg-[#111]" : "bg-[#23282d]"}`}>
          <span className="text-sm font-semibold text-white">{title}</span>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-0.5 rounded hover:bg-white/10"><I.Close/></button>
        </div>
        <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${t.text}`}>{children}</div>
        <div className={`flex justify-end gap-2 px-5 py-3.5 ${t.panelHeader} border-t ${t.border} shrink-0`}>{footer}</div>
      </div>
    </div>
  );
};



export const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs mt-1 opacity-60">{hint}</p>}
  </div>
);

export const mkInput = (isDark: boolean) => isDark
  ? "w-full border border-[#444] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a9eff] focus:ring-2 focus:ring-[#4a9eff]/20 transition bg-[#1e1e1e] text-[#e8e8e8] placeholder:text-[#555]"
  : "w-full border border-[#ddd] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0073aa] focus:ring-2 focus:ring-[#0073aa]/20 transition bg-white text-[#23282d] placeholder:text-[#bbb]";

export const BtnP = ({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) => (
  <button onClick={onClick} disabled={disabled}
    className="px-4 py-2 text-sm font-semibold text-white bg-[#0073aa] hover:bg-[#006799] disabled:opacity-50 disabled:cursor-not-allowed border border-[#006799] rounded-lg transition-colors flex items-center gap-1.5">
    {children}
  </button>
);
export const BtnS = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="px-4 py-2 text-sm text-[#555] dark:text-[#aaa] bg-[#f7f7f7] dark:bg-[#333] hover:bg-[#eee] dark:hover:bg-[#3a3a3a] border border-[#ccc] dark:border-[#555] rounded-lg transition-colors">
    {children}
  </button>
);

// ── Link Modal ──────────────────────────────────────────────
export const LinkModal = ({ onInsert, onClose, isDark}: { onInsert:(u:string,t:string,nb:boolean,rel:string,title:string)=>void; onClose:()=>void; isDark:boolean ;  }) => {
  const [url,setUrl]=useState("https://"); const [text,setText]=useState("");
  const [newTab,setNewTab]=useState(false); const [rel,setRel]=useState("");
  const [ttl,setTtl]=useState(""); const inp=mkInput(isDark);
  return (
    <ModalWrap title="Insert / Edit Link" onClose={onClose} isDark={isDark} 
      footer={<><BtnP onClick={()=>onInsert(url,text,newTab,rel,ttl)}>Add Link</BtnP><BtnS onClick={onClose}>Cancel</BtnS></>}>
      <Field label="URL"><input autoFocus className={inp} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://"/></Field>
      <Field label="Link Text"><input className={inp} value={text} onChange={e=>setText(e.target.value)} placeholder="Display text (optional — uses selection if empty)"/></Field>
      <Field label="Title / Tooltip"><input className={inp} value={ttl} onChange={e=>setTtl(e.target.value)} placeholder="Hover tooltip text"/></Field>
      <Field label="Rel Attribute"><input className={inp} value={rel} onChange={e=>setRel(e.target.value)} placeholder="nofollow, noopener, sponsored..."/></Field>
      <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
        <input type="checkbox" checked={newTab} onChange={e=>setNewTab(e.target.checked)} className="accent-[#0073aa] w-4 h-4"/>
        Open in a new tab
      </label>
    </ModalWrap>
  );
};

// ── Anchor Modal ────────────────────────────────────────────
export const AnchorModal = ({ onInsert, onClose, isDark}: { onInsert:(id:string)=>void; onClose:()=>void; isDark:boolean ;  }) => {
  const [id,setId]=useState(""); const inp=mkInput(isDark);
  return (
    <ModalWrap title="Insert Anchor / ID" onClose={onClose} isDark={isDark} 
      footer={<><BtnP onClick={()=>onInsert(id)}>Insert Anchor</BtnP><BtnS onClick={onClose}>Cancel</BtnS></>}>
      <Field label="Anchor ID" hint="Use lowercase letters, numbers and hyphens only">
        <input autoFocus className={inp} value={id} onChange={e=>setId(e.target.value.toLowerCase().replace(/\s+/g,"-"))} placeholder="my-section-name"/>
      </Field>
      <p className="text-xs opacity-60">Creates <code className="bg-black/10 dark:bg-white/10 px-1 rounded">&lt;span id="{id||"anchor-id"}"&gt;&lt;/span&gt;</code> at cursor.</p>
    </ModalWrap>
  );
};

// ── Image Modal with drag-drop ──────────────────────────────
export const ImageModal = ({ onInsert, onClose, isDark}: { onInsert:(src:string,alt:string,align:string,w:string,h:string,caption:string,link:string)=>void; onClose:()=>void; isDark:boolean ;  }) => {
  const [src,setSrc]=useState(""); const [alt,setAlt]=useState("");
  const [align,setAlign]=useState("none"); const [w,setW]=useState(""); const [h,setH]=useState("");
  const [caption,setCaption]=useState(""); const [link,setLink]=useState("");
  const [dragging,setDragging]=useState(false); const [uploading,setUploading]=useState(false);
  const inp=mkInput(isDark); const fileRef=useRef<HTMLInputElement>(null);
  const t= isDark?dark:light;

  const processFile = (file: File) => {
    if(!file.type.startsWith("image/")) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = e => { setSrc(e.target?.result as string); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if(file) processFile(file);
  };

  return (
    <ModalWrap title="Insert / Edit Image" onClose={onClose} isDark={isDark} 
      footer={<><BtnP onClick={()=>onInsert(src,alt,align,w,h,caption,link)} disabled={!src}>Insert Image</BtnP><BtnS onClick={onClose}>Cancel</BtnS></>}>
      
      {/* Drag & Drop Zone */}
      <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}
        onClick={()=>fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
          ${dragging ? "border-[#0073aa] bg-[#0073aa]/10 scale-[1.01]" : `border-opacity-60 hover:border-[#0073aa]/60`}`}>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) processFile(f); }}/>
        {uploading ? <><I.Spinner/><p className="text-sm mt-2 opacity-60">Processing...</p></>
          : src ? <img src={src} alt={alt} className="max-h-32 mx-auto object-contain rounded"/>
          : (<>
              <div className="flex justify-center mb-2 opacity-40"><I.Upload/></div>
              <p className="text-sm font-medium">{dragging ? "Drop image here!" : "Drag & drop or click to upload"}</p>
              <p className="text-xs opacity-50 mt-1">PNG, JPG, GIF, WebP, SVG</p>
             </>)}
      </div>

      <div className="relative"><div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${t.border}`}/></div><div className="relative flex justify-center text-xs opacity-50"><span className={`${t.card} px-2`}>or paste URL</span></div></div>

      <Field label="Image URL"><input className={inp} value={src} onChange={e=>setSrc(e.target.value)} placeholder="https://example.com/image.jpg"/></Field>
      <Field label="Alt Text" hint="Describe the image for accessibility & SEO"><input className={inp} value={alt} onChange={e=>setAlt(e.target.value)} placeholder="Describe the image"/></Field>
      <Field label="Caption (optional)"><input className={inp} value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Image caption text"/></Field>
      <Field label="Wrap in Link (optional)"><input className={inp} value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..."/></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Width (px)"><input className={inp} value={w} onChange={e=>setW(e.target.value)} placeholder="auto"/></Field>
        <Field label="Height (px)"><input className={inp} value={h} onChange={e=>setH(e.target.value)} placeholder="auto"/></Field>
        <Field label="Alignment">
          <select className={`${inp} cursor-pointer`} value={align} onChange={e=>setAlign(e.target.value)}>
            <option value="none">None</option><option value="left">Left</option>
            <option value="center">Center</option><option value="right">Right</option>
          </select>
        </Field>
      </div>
    </ModalWrap>
  );
};

// ── Table Modal ─────────────────────────────────────────────
export const TableModal = ({ onInsert, onClose, isDark}: { onInsert:(r:number,c:number,header:boolean,border:boolean,striped:boolean,caption:string)=>void; onClose:()=>void; isDark:boolean ;  }) => {
  const [rows,setRows]=useState(3); const [cols,setCols]=useState(3);
  const [header,setHeader]=useState(true); const [border,setBorder]=useState(true);
  const [striped,setStriped]=useState(false); const [caption,setCaption]=useState("");
  const inp=mkInput(isDark);
  return (
    <ModalWrap title="Insert Table" onClose={onClose} isDark={isDark}
      footer={<><BtnP onClick={()=>onInsert(rows,cols,header,border,striped,caption)}>Insert Table</BtnP><BtnS onClick={onClose}>Cancel</BtnS></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rows"><input type="number" className={inp} value={rows} onChange={e=>setRows(Math.max(1,+e.target.value))} min={1} max={20}/></Field>
        <Field label="Columns"><input type="number" className={inp} value={cols} onChange={e=>setCols(Math.max(1,+e.target.value))} min={1} max={10}/></Field>
      </div>
      <Field label="Caption (optional)"><input className={inp} value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Table caption text"/></Field>
      <div className="space-y-2">
        {[{v:header,s:setHeader,l:"First row as header"},{v:border,s:setBorder,l:"Show borders"},{v:striped,s:setStriped,l:"Striped rows"}].map(({v,s,l})=>(
          <label key={l} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={v} onChange={e=>s(e.target.checked)} className="accent-[#0073aa] w-4 h-4"/>{l}
          </label>
        ))}
      </div>
      <div className={`overflow-auto border ${isDark?"border-[#444]":"border-[#ddd]"} rounded-lg p-3 ${isDark?"bg-[#1a1a1a]":"bg-[#fafafa]"}`}>
        <table className={`text-xs w-full ${border?"border-collapse":""}`}>
          {header&&<thead><tr>{Array.from({length:cols}).map((_,i)=><th key={i} className={`px-2 py-1.5 font-semibold text-left ${isDark?"bg-[#333] text-[#e8e8e8]":"bg-[#e8e8e8] text-[#23282d]"} ${border?`border ${isDark?"border-[#555]":"border-[#ccc]"}`:""}`}>Header {i+1}</th>)}</tr></thead>}
          <tbody>{Array.from({length:rows-(header?1:0)}).map((_,r)=><tr key={r} className={striped&&r%2===1?(isDark?"bg-[#2a2a2a]":"bg-[#f9f9f9]"):""}>
            {Array.from({length:cols}).map((_,c)=><td key={c} className={`px-2 py-1.5 ${border?`border ${isDark?"border-[#444]":"border-[#ccc]"}`:""} ${isDark?"text-[#ccc]":"text-[#555]"}`}>Cell {r+1},{c+1}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
    </ModalWrap>
  );
};

// ── Video Modal ─────────────────────────────────────────────
export const VideoModal = ({ onInsert, onClose, isDark}: { onInsert:(html:string)=>void; onClose:()=>void; isDark:boolean; }) => {
  const [url,setUrl]=useState(""); const [w,setW]=useState("100%"); const [h,setH]=useState("400");
  const [autoplay,setAutoplay]=useState(false); const [loop,setLoop]=useState(false); const [muted,setMuted]=useState(false);
  const inp=mkInput(isDark);
  const embed = ()=>{
    const ytMatch=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const vmMatch=url.match(/vimeo\.com\/(\d+)/);
    const params=[autoplay?"autoplay=1":"",loop?"loop=1":"",muted?"mute=1":""].filter(Boolean).join("&");
    if(ytMatch) return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%"><iframe style="position:absolute;top:0;left:0;width:100%;height:100%" src="https://www.youtube.com/embed/${ytMatch[1]}${params?"?"+params:""}" frameborder="0" allowfullscreen allow="autoplay"></iframe></div>`;
    if(vmMatch) return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%"><iframe style="position:absolute;top:0;left:0;width:100%;height:100%" src="https://player.vimeo.com/video/${vmMatch[1]}${params?"?"+params:""}" frameborder="0" allowfullscreen></iframe></div>`;
    if(url.match(/\.(mp4|webm|ogg)$/i)) return `<video width="${w}" height="${h}" controls${autoplay?" autoplay":""}${loop?" loop":""}${muted?" muted":""} style="max-width:100%"><source src="${url}">Your browser does not support video.</video>`;
    return `<iframe width="${w}" height="${h}" src="${url}" frameborder="0" allowfullscreen style="max-width:100%"></iframe>`;
  };
  return (
    <ModalWrap title="Insert Video" onClose={onClose} isDark={isDark} 
      footer={<><BtnP onClick={()=>onInsert(embed())}>Insert Video</BtnP><BtnS onClick={onClose}>Cancel</BtnS></>}>
      <Field label="Video URL" hint="YouTube, Vimeo, or direct MP4/WebM URL"><input autoFocus className={inp} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."/></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Width"><input className={inp} value={w} onChange={e=>setW(e.target.value)}/></Field>
        <Field label="Height (px)"><input className={inp} value={h} onChange={e=>setH(e.target.value)}/></Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{v:autoplay,s:setAutoplay,l:"Autoplay"},{v:loop,s:setLoop,l:"Loop"},{v:muted,s:setMuted,l:"Muted"}].map(({v,s,l})=>(
          <label key={l} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={v} onChange={e=>s(e.target.checked)} className="accent-[#0073aa] w-4 h-4"/>{l}
          </label>
        ))}
      </div>
    </ModalWrap>
  );
};


export const EmojiModal = ({ onInsert, onClose, isDark}: { onInsert:(e:string)=>void; onClose:()=>void; isDark:boolean ; }) => {
  const [cat,setCat]=useState("😀 Smileys"); const [search,setSearch]=useState("");
  const t=isDark?dark:light; const inp=mkInput(isDark);
  const allEmojis=Object.values(EMOJI_CATS).flat();
  const displayed=search ? allEmojis.filter(e=>e.includes(search)) : (EMOJI_CATS as Record<string,string[]>)[cat]||[];
  return (
    <ModalWrap title="Insert Emoji" onClose={onClose} isDark={isDark}  footer={<BtnS onClick={onClose}>Close</BtnS>}>
      <input className={inp} placeholder="Search emoji..." value={search} onChange={e=>setSearch(e.target.value)}/>
      {!search && <div className="flex flex-wrap gap-1">{Object.keys(EMOJI_CATS).map(c=>(
        <button key={c} onClick={()=>setCat(c)} className={`px-2 py-1 text-xs rounded-full border transition-colors ${cat===c?`${t.btnActive} border`:`${t.border} border ${t.btnHover}`}`}>{c}</button>
      ))}</div>}
      <div className="grid grid-cols-8 gap-1 min-h-[100px]">
        {displayed.map(e=>(
          <button key={e} onClick={()=>{ onInsert(e); onClose(); }}
            className={`text-2xl w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:scale-125 ${t.btnHover}`}>{e}</button>
        ))}
        {displayed.length===0 && <p className="col-span-8 text-center text-sm opacity-50 py-4">No emojis found</p>}
      </div>
    </ModalWrap>
  );
};

// ── Special Characters ──────────────────────────────────────

export const SpecialModal = ({ onInsert, onClose, isDark  }: { onInsert:(c:string)=>void; onClose:()=>void; isDark:boolean ; }) => {
  const [cat,setCat]=useState("Currency"); const t=isDark?dark:light;
  return (
    <ModalWrap title="Special Characters" onClose={onClose} isDark={isDark}  footer={<BtnS onClick={onClose}>Close</BtnS>}>
      <div className="flex flex-wrap gap-1">{Object.keys(SPEC_CATS).map(c=>(
        <button key={c} onClick={()=>setCat(c)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${cat===c?`${t.btnActive} border`:`${t.border} border ${t.btnHover}`}`}>{c}</button>
      ))}</div>
      <div className="grid grid-cols-8 gap-1">
        {((SPEC_CATS as Record<string,string[]>)[cat]||[]).map(c=>(
          <button key={c} onClick={()=>{ onInsert(c); onClose(); }}
            className={`h-9 flex items-center justify-center rounded-lg border transition-colors cursor-pointer text-sm ${t.border} ${t.btnHover}`}
            title={c} dangerouslySetInnerHTML={{__html:c}}/>
        ))}
      </div>
      <p className="text-xs opacity-50">Click a character to insert it at cursor.</p>
    </ModalWrap>
  );
};


// ── Find & Replace ──────────────────────────────────────────
export const FindModal = ({ editorRef, onClose, isDark }: { editorRef: React.RefObject<HTMLDivElement | null>; onClose:()=>void; isDark:boolean }) => {
  const [find,setFind]=useState(""); const [replace,setReplace]=useState("");
  const [matchCase,setMatchCase]=useState(false); const [count,setCount]=useState<number|null>(null);
  const inp=mkInput(isDark);
  const flags = matchCase ? "g" : "gi";
  const doFind = () => {
    if(!find||!editorRef.current) return;
    const text=editorRef.current.innerText;
    const matches=(text.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),flags))||[]).length;
    setCount(matches);
  };
  const doReplace = () => {
    if(!find||!editorRef.current) return;
    editorRef.current.innerHTML=editorRef.current.innerHTML.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),flags), replace);
    setCount(0);
  };
  return (
    <ModalWrap title="Find & Replace" onClose={onClose} isDark={isDark} 
      footer={<><BtnP onClick={doReplace}>Replace All</BtnP><button onClick={doFind} className="px-4 py-2 text-sm font-semibold text-white bg-[#555] hover:bg-[#333] border border-[#444] rounded-lg transition-colors">Find</button><BtnS onClick={onClose}>Close</BtnS></>}>
      <Field label="Find"><input autoFocus className={inp} value={find} onChange={e=>setFind(e.target.value)} placeholder="Search text..." onKeyDown={e=>e.key==="Enter"&&doFind()}/></Field>
      <Field label="Replace with"><input className={inp} value={replace} onChange={e=>setReplace(e.target.value)} placeholder="Replacement text..."/></Field>
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input type="checkbox" checked={matchCase} onChange={e=>setMatchCase(e.target.checked)} className="accent-[#0073aa] w-4 h-4"/> Match case
      </label>
      {count!==null && <p className="text-sm text-[#0073aa]">{count} match{count!==1?"es":""} found{count>0?" — click Replace All to replace":""}</p>}
    </ModalWrap>
  );
};

// ── Code Block Modal ────────────────────────────────────────
const LANGS = ["javascript","typescript","python","php","html","css","bash","json","sql","java","csharp","cpp","go","rust","ruby","swift","kotlin","r","matlab","scala"];
export const CodeModal = ({ onInsert, onClose, isDark }: { onInsert:(code:string,lang:string)=>void; onClose:()=>void; isDark:boolean }) => {
  const [code,setCode]=useState(""); const [lang,setLang]=useState("javascript");
  const [showLineNums,setShowLineNums]=useState(true); const inp=mkInput(isDark);
  return (
    <ModalWrap title="Insert Code Block" onClose={onClose} isDark={isDark} 
      footer={<><BtnP onClick={()=>onInsert(code,lang)}>Insert Code</BtnP><BtnS onClick={onClose}>Cancel</BtnS></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Language">
          <select className={`${inp} cursor-pointer`} value={lang} onChange={e=>setLang(e.target.value)}>
            {LANGS.map(l=><option key={l} value={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Options">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none mt-2">
            <input type="checkbox" checked={showLineNums} onChange={e=>setShowLineNums(e.target.checked)} className="accent-[#0073aa] w-4 h-4"/> Line numbers
          </label>
        </Field>
      </div>
      <Field label="Code">
        <textarea className={`${inp} font-mono text-xs min-h-[160px] resize-y`} value={code} onChange={e=>setCode(e.target.value)} placeholder="Paste your code here..." spellCheck={false}/>
      </Field>
    </ModalWrap>
  );
};

// ── Preview Modal ────────────────────────────────────────────
export const PreviewModal = ({ data, onClose, isDark }: { data: EditorData; onClose:()=>void; isDark:boolean }) => {
  const t=isDark?dark:light;
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/80 backdrop-blur-sm">
      <div className={`flex items-center justify-between px-6 py-3 ${isDark?"bg-[#111]":"bg-[#23282d]"}`}>
        <span className="text-white font-semibold">Preview — {data.title || "Untitled"}</span>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors"><I.Close/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <div className={`max-w-3xl mx-auto rounded-xl shadow-2xl overflow-hidden ${t.card}`}>
          {data.featuredImage && <img src={data.featuredImage} className="w-full h-64 object-cover"/>}
          <div className="p-8">
            <h1 className={`text-3xl font-bold mb-4 ${t.text}`}>{data.title || "Untitled Post"}</h1>
            <div className={`flex items-center gap-3 text-sm ${t.muted} mb-6`}>
              <span>By {data.author}</span><span>•</span><span>{data.readingTime} min read</span>
              <span>•</span><span>{data.wordCount} words</span>
            </div>
            <div className={`prose max-w-none ${t.text}`} dangerouslySetInnerHTML={{__html:data.content||"<p>No content yet.</p>"}}/>
            {data.tags.length>0 && <div className="flex flex-wrap gap-2 mt-6">{data.tags.map(tag=><span key={tag} className="px-3 py-1 bg-[#0073aa]/10 text-[#0073aa] text-xs rounded-full">#{tag}</span>)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};