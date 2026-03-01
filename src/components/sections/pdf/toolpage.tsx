// @ts-nocheck
'use client';

import { getTableData } from '@/actions/dbAction';
import { dataType } from '@/utils/types/uiTypes';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

// ─── CDN loader cache ─────────────────────────────────────────────────────────
const cdnCache = {};
function loadScript(url, globalKey) {
  if (cdnCache[globalKey]) return cdnCache[globalKey];
  cdnCache[globalKey] = new Promise((resolve, reject) => {
    if (window[globalKey]) { resolve(window[globalKey]); return; }
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => resolve(window[globalKey]);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return cdnCache[globalKey];
}
const loadPdfLib   = () => loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib');
const loadPdfjsLib = async () => {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'pdfjsLib');
  if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc)
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return window.pdfjsLib;
};
const loadXLSX    = () => loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'XLSX');
const loadMammoth = () => loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', 'mammoth');

// ─── File helpers ─────────────────────────────────────────────────────────────
const readAsAB      = (f) => new Promise((r,j) => { const x=new FileReader(); x.onload=e=>r(e.target.result); x.onerror=j; x.readAsArrayBuffer(f); });
const readAsText    = (f) => new Promise((r,j) => { const x=new FileReader(); x.onload=e=>r(e.target.result); x.onerror=j; x.readAsText(f); });
const readAsDataURL = (f) => new Promise((r,j) => { const x=new FileReader(); x.onload=e=>r(e.target.result); x.onerror=j; x.readAsDataURL(f); });
const dlBlob  = (blob,name) => { const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u); };
const dlBytes = (bytes,name) => dlBlob(new Blob([bytes],{type:'application/pdf'}),name);
const dlText  = (text,name,mime='text/plain') => dlBlob(new Blob([text],{type:mime}),name);
const b64ToBytes = (b64) => Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
const fmtBytes = (b) => b<1024?`${b}B`:b<1048576?`${(b/1024).toFixed(1)}KB`:`${(b/1048576).toFixed(2)}MB`;

// ─── PDF Functions ────────────────────────────────────────────────────────────
async function mergePDFs(files) {
  const L = await loadPdfLib();
  const merged = await L.PDFDocument.create();
  for (const f of files) {
    const doc = await L.PDFDocument.load(await readAsAB(f));
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  return merged.save();
}
async function splitPDF(file, ranges) {
  const L = await loadPdfLib();
  const src = await L.PDFDocument.load(await readAsAB(file));
  const total = src.getPageCount();
  const results = [];
  for (const range of ranges) {
    const doc = await L.PDFDocument.create();
    const idxs = [];
    for (let i=range.start; i<=Math.min(range.end,total-1); i++) idxs.push(i);
    if (!idxs.length) continue;
    const pgs = await doc.copyPages(src, idxs);
    pgs.forEach(p => doc.addPage(p));
    results.push(await doc.save());
  }
  return results;
}
async function rotatePDF(file, degrees) {
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.load(await readAsAB(file));
  doc.getPages().forEach(p => p.setRotation(L.degrees((p.getRotation().angle+degrees)%360)));
  return doc.save();
}
async function addWatermark(file, text) {
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.load(await readAsAB(file));
  const font = await doc.embedFont(L.StandardFonts.HelveticaBold);
  doc.getPages().forEach(page => {
    const {width,height} = page.getSize();
    page.drawText(text,{x:width/2-(text.length*14)/2,y:height/2,size:48,font,color:L.rgb(0.8,0.1,0.1),opacity:0.25,rotate:L.degrees(45)});
  });
  return doc.save();
}
async function addPageNumbers(file, pos='bottom-center') {
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.load(await readAsAB(file));
  const font = await doc.embedFont(L.StandardFonts.Helvetica);
  const pages = doc.getPages();
  pages.forEach((page,i) => {
    const {width,height} = page.getSize();
    const text = `${i+1} / ${pages.length}`;
    const tw = font.widthOfTextAtSize(text,11);
    let x=width/2-tw/2, y=20;
    if (pos==='top-center') y=height-30;
    if (pos==='bottom-right') x=width-tw-20;
    if (pos==='bottom-left') x=20;
    page.drawText(text,{x,y,size:11,font,color:L.rgb(0.2,0.2,0.2)});
  });
  return doc.save();
}
async function compressPDF(file) {
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.load(await readAsAB(file),{updateMetadata:false});
  return doc.save({useObjectStreams:true});
}
async function unlockPDF(file) {
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.load(await readAsAB(file),{ignoreEncryption:true});
  return doc.save();
}
async function repairPDF(file) {
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.load(await readAsAB(file),{ignoreEncryption:true,throwOnInvalidObject:false});
  return doc.save();
}
async function cropPDF(file, pct) {
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.load(await readAsAB(file));
  doc.getPages().forEach(page => {
    const {width,height} = page.getSize();
    const x=width*pct.left, y=height*pct.bottom;
    const w=width*(1-pct.left-pct.right), h=height*(1-pct.top-pct.bottom);
    page.setCropBox(x,y,w,h);
  });
  return doc.save();
}
async function imagesToPDF(files) {
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.create();
  for (const f of files) {
    const dataUrl = await readAsDataURL(f);
    const bytes = b64ToBytes(dataUrl.split(',')[1]);
    const isJpeg = /jpe?g/i.test(f.type)||/jpe?g$/i.test(f.name);
    const img = isJpeg ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
    const page = doc.addPage([img.width,img.height]);
    page.drawImage(img,{x:0,y:0,width:img.width,height:img.height});
  }
  return doc.save();
}
async function pdfToImages(file, scale=2) {
  const pdfjs = await loadPdfjsLib();
  const pdf = await pdfjs.getDocument({data:await readAsAB(file)}).promise;
  const images = [];
  for (let i=1; i<=pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({scale});
    const canvas = document.createElement('canvas');
    canvas.width=vp.width; canvas.height=vp.height;
    await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
    images.push({dataUrl:canvas.toDataURL('image/jpeg',0.92),page:i});
  }
  return images;
}
async function extractPDFText(file) {
  const pdfjs = await loadPdfjsLib();
  const pdf = await pdfjs.getDocument({data:await readAsAB(file)}).promise;
  let text='';
  for (let i=1; i<=pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += `\n--- Page ${i} ---\n`+content.items.map(s=>s.str).join(' ')+'\n';
  }
  return text;
}
async function wordToPDF(file) {
  const mammoth = await loadMammoth();
  const result = await mammoth.extractRawText({arrayBuffer:await readAsAB(file)});
  const text = result.value;
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.create();
  const font = await doc.embedFont(L.StandardFonts.Helvetica);
  const lh=14,fs=11,mg=40,pw=595,ph=842,maxW=pw-mg*2;
  let page=doc.addPage([pw,ph]); let y=ph-mg;
  const lines=[];
  for (const para of text.split('\n')) {
    let line='';
    for (const word of para.split(' ')) {
      const test=line?line+' '+word:word;
      if (font.widthOfTextAtSize(test,fs)>maxW) { lines.push(line); line=word; } else line=test;
    }
    lines.push(line); lines.push('');
  }
  for (const line of lines) {
    if (y<mg+lh) { page=doc.addPage([pw,ph]); y=ph-mg; }
    if (line) page.drawText(line,{x:mg,y,size:fs,font,color:L.rgb(0,0,0)});
    y-=lh;
  }
  return doc.save();
}
async function htmlToPDF(html) {
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.create();
  const page = doc.addPage([595,842]);
  const font = await doc.embedFont(L.StandardFonts.Helvetica);
  const stripped = html.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const words=stripped.split(' '); let line='', y=800;
  for (const word of words) {
    const test=line?line+' '+word:word;
    if (font.widthOfTextAtSize(test,11)>515) {
      if (y<40) break;
      page.drawText(line,{x:40,y,size:11,font,color:L.rgb(0,0,0)}); y-=16; line=word;
    } else line=test;
  }
  if (line) page.drawText(line,{x:40,y,size:11,font,color:L.rgb(0,0,0)});
  return doc.save();
}
async function xlsxToPDF(file) {
  const XLSX = await loadXLSX();
  const wb = XLSX.read(await readAsAB(file),{type:'array'});
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.create();
  const font = await doc.embedFont(L.StandardFonts.Helvetica);
  const bold = await doc.embedFont(L.StandardFonts.HelveticaBold);
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,defval:''});
    let page=doc.addPage([841,595]);
    const {width,height}=page.getSize(); let y=height-40;
    const cols=Math.max(...rows.map(r=>r.length));
    const colW=Math.min(130,(width-40)/Math.max(1,cols));
    page.drawText(`Sheet: ${sheetName}`,{x:20,y:height-18,size:10,font:bold,color:L.rgb(0.2,0.2,0.7)});
    y-=8;
    for (let r=0; r<rows.length; r++) {
      if (y<40) { page=doc.addPage([841,595]); y=height-40; }
      for (let c=0; c<rows[r].length; c++) {
        const x=20+c*colW; if (x+colW>width-10) break;
        const cell=String(rows[r][c]).substring(0,18);
        page.drawRectangle({x,y:y-10,width:colW-1,height:14,borderColor:L.rgb(0.75,0.75,0.75),borderWidth:0.5,color:r===0?L.rgb(0.93,0.93,0.98):L.rgb(1,1,1)});
        page.drawText(cell,{x:x+2,y:y-8,size:7.5,font:r===0?bold:font,color:L.rgb(0,0,0)});
      }
      y-=16;
    }
  }
  return doc.save();
}
async function csvToPDF(file) {
  const text = await readAsText(file);
  const rows = text.split('\n').map(r=>r.split(',').map(c=>c.replace(/^"|"$/g,'').trim()));
  const L = await loadPdfLib();
  const doc = await L.PDFDocument.create();
  const font = await doc.embedFont(L.StandardFonts.Helvetica);
  const bold = await doc.embedFont(L.StandardFonts.HelveticaBold);
  let page=doc.addPage([841,595]);
  const {width,height}=page.getSize(); let y=height-40;
  const cols=Math.max(...rows.map(r=>r.length));
  const colW=Math.min(150,(width-40)/Math.max(1,cols));
  for (let r=0; r<rows.length; r++) {
    if (y<40) { page=doc.addPage([841,595]); y=height-40; }
    for (let c=0; c<rows[r].length; c++) {
      const x=20+c*colW; if (x>width-20) break;
      page.drawRectangle({x,y:y-10,width:colW-1,height:14,borderColor:L.rgb(0.75,0.75,0.75),borderWidth:0.5,color:r===0?L.rgb(0.93,0.93,0.98):L.rgb(1,1,1)});
      page.drawText(String(rows[r][c]).substring(0,20),{x:x+2,y:y-8,size:7.5,font:r===0?bold:font,color:L.rgb(0,0,0)});
    }
    y-=16;
  }
  return doc.save();
}
async function checkDuplicates(file) {
  let rows;
  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await readAsText(file);
    rows = text.split('\n').map(r=>r.split(',').map(c=>c.replace(/^"|"$/g,'').trim()));
  } else {
    const XLSX = await loadXLSX();
    const wb = XLSX.read(await readAsAB(file),{type:'array'});
    rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''});
  }
  const seen=new Map(); const duplicates=[];
  rows.forEach((row,idx) => {
    const key=JSON.stringify(row);
    if (seen.has(key)) duplicates.push({row:idx+1,firstSeen:seen.get(key)+1,data:row});
    else seen.set(key,idx);
  });
  return {total:rows.length,duplicates,unique:rows.length-duplicates.length};
}
async function removeBlankRows(file) {
  const XLSX = await loadXLSX();
  const wb = XLSX.read(await readAsAB(file),{type:'array'});
  for (const sn of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:''});
    wb.Sheets[sn] = XLSX.utils.aoa_to_sheet(rows.filter(r=>r.some(c=>String(c).trim()!=='')));
  }
  return XLSX.write(wb,{type:'array',bookType:'xlsx'});
}
async function dbfToExcel(file) {
  const ab=await readAsAB(file); const view=new DataView(ab);
  const numRecords=view.getInt32(4,true),headerSize=view.getInt16(8,true),recordSize=view.getInt16(10,true);
  const fields=[]; let offset=32;
  while (offset<headerSize-1) {
    const nameBytes=new Uint8Array(ab,offset,11);
    const name=String.fromCharCode(...nameBytes).replace(/\0/g,'').trim();
    if (!name) break;
    fields.push({name,length:view.getUint8(offset+16)}); offset+=32;
  }
  const rows=[fields.map(f=>f.name)];
  for (let i=0; i<numRecords; i++) {
    const recOffset=headerSize+i*recordSize;
    if (view.getUint8(recOffset)===0x2a) continue;
    const row=[]; let fOff=recOffset+1;
    for (const f of fields) { row.push(String.fromCharCode(...new Uint8Array(ab,fOff,f.length)).trim()); fOff+=f.length; }
    rows.push(row);
  }
  const XLSX=await loadXLSX(); const ws=XLSX.utils.aoa_to_sheet(rows);
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Data');
  return XLSX.write(wb,{type:'array',bookType:'xlsx'});
}
function resizeImageBlob(file, maxW, maxH, quality=0.9) {
  return new Promise((resolve,reject) => {
    const img=new window.Image(); const url=URL.createObjectURL(file);
    img.onload=() => {
      let {width:w,height:h}=img;
      if (w>maxW||h>maxH) { const r=Math.min(maxW/w,maxH/h); w=Math.round(w*r); h=Math.round(h*r); }
      const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      URL.revokeObjectURL(url); canvas.toBlob(resolve,'image/jpeg',quality);
    };
    img.onerror=reject; img.src=url;
  });
}
function convertImageFormat(file, format, quality=0.9) {
  return new Promise((resolve,reject) => {
    const img=new window.Image(); const url=URL.createObjectURL(file);
    img.onload=() => {
      const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height;
      const ctx=canvas.getContext('2d');
      if (format==='jpeg') { ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
      ctx.drawImage(img,0,0); URL.revokeObjectURL(url); canvas.toBlob(resolve,`image/${format}`,quality);
    };
    img.onerror=reject; img.src=url;
  });
}
function combineImages(files, dir='vertical') {
  return new Promise(async (resolve,reject) => {
    const imgs=await Promise.all(files.map(f=>new Promise((r,j)=>{const i=new window.Image();i.onload=()=>r(i);i.onerror=j;i.src=URL.createObjectURL(f);})));
    const canvas=document.createElement('canvas'); const ctx=canvas.getContext('2d');
    if (dir==='vertical') {
      canvas.width=Math.max(...imgs.map(i=>i.width)); canvas.height=imgs.reduce((s,i)=>s+i.height,0);
      let y=0; imgs.forEach(img=>{ctx.drawImage(img,0,y);y+=img.height;});
    } else {
      canvas.height=Math.max(...imgs.map(i=>i.height)); canvas.width=imgs.reduce((s,i)=>s+i.width,0);
      let x=0; imgs.forEach(img=>{ctx.drawImage(img,x,0);x+=img.width;});
    }
    canvas.toBlob(resolve,'image/jpeg',0.95);
  });
}
function removeImgWatermark(file) {
  return new Promise((resolve,reject) => {
    const img=new window.Image();
    img.onload=() => {
      const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height;
      const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0);
      const data=ctx.getImageData(0,0,canvas.width,canvas.height); const d=data.data;
      for (let i=0;i<d.length;i+=4) {
        const r=d[i],g=d[i+1],b=d[i+2]; const avg=(r+g+b)/3; const spread=Math.max(r,g,b)-Math.min(r,g,b);
        if (avg>180&&spread<30) d[i]=d[i+1]=d[i+2]=255;
      }
      ctx.putImageData(data,0,0); canvas.toBlob(resolve,'image/jpeg',0.95);
    };
    img.onerror=reject; img.src=URL.createObjectURL(file);
  });
}

// ─── Text Tools ────────────────────────────────────────────────────────────────
const ME_GLOSSARY = {thee:'you',thou:'you',thy:'your',thine:'yours',hath:'has',doth:'does',wilt:'will',shalt:'shall',wouldst:'would',couldst:'could',ye:'you (plural)',yea:'yes',nay:'no',forsooth:'indeed',prithee:'please',perchance:'perhaps',methinks:'I think',betwixt:'between',anon:'soon',ere:'before',withal:'with',mayhaps:'perhaps',henceforth:'from now on',wherefore:'why',whence:'from where'};
const modernToME = (t) => { const inv={}; Object.entries(ME_GLOSSARY).forEach(([k,v])=>{if(!inv[v])inv[v]=k;}); return t.split(/\b/).map(w=>inv[w.toLowerCase()]?w[0]===w[0].toUpperCase()?inv[w.toLowerCase()][0].toUpperCase()+inv[w.toLowerCase()].slice(1):inv[w.toLowerCase()]:w).join(''); };
const meToModern = (t) => t.split(/\b/).map(w=>ME_GLOSSARY[w.toLowerCase()]||w).join('');
const strikeText = (t) => t.split('').map(c=>c+'\u0336').join('');
const devlyToUnicode = (t) => { const m={v:'व',k:'क',K:'ख',x:'ग',X:'घ',p:'प',P:'फ',H:'ह',j:'ज',J:'झ',n:'न',N:'ण',M:'म',m:'म',y:'य',r:'र',l:'ल',s:'स',S:'श',d:'द',D:'ध',t:'त',T:'ट',c:'च',C:'छ',a:'अ',A:'आ',i:'इ',I:'ई',u:'उ',U:'ऊ',e:'ए',E:'ऐ',o:'ओ',O:'औ','0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९'}; return t.split('').map(c=>m[c]||c).join(''); };
const bretonNames = (gender,count) => { const m=['Gwenn','Maël','Ronan','Erwan','Yannick','Loïc','Tanguy','Brendan','Corentin','Goulven','Herve','Ewen','Nolann','Tugdual','Teilo','Gwenael','Bleuzen','Caradec','Denez','Gaetan']; const f=['Gaëlle','Nolwenn','Rozenn','Enora','Sterenn','Bleunvenn','Gwenaelle','Armor','Aziliz','Maewen','Elowen','Tifaine','Solenn','Morgane','Yuna','Klervi','Deilen','Kaourantin','Youenn','Tudine']; const sn=['Le Bris','Le Gall','Le Roy','Guéguen','Riou','Morin','Le Guen','Kervella','Dréan','Le Fur','Bodilis','Pennec','Tanguy','Prigent','Kergroach']; const pool=gender==='male'?m:gender==='female'?f:[...m,...f]; return Array.from({length:count},()=>`${pool[Math.floor(Math.random()*pool.length)]} ${sn[Math.floor(Math.random()*sn.length)]}`); };
const compareTexts = (a,b) => { const la=a.split('\n'),lb=b.split('\n'); return Array.from({length:Math.max(la.length,lb.length)},(_,i)=>({line:i+1,a:la[i]??'',b:lb[i]??'',changed:(la[i]??'')!==(lb[i]??'')})); };
const convertSize = (val,from) => { const bits={bit:1,byte:8,kb:8*1024,mb:8*1048576,gb:8*1073741824,mib:8*1048576,kib:8*1024,mbit:1048576}; const b=val*(bits[from.toLowerCase()]||1); return {Bits:b.toFixed(0),Bytes:(b/8).toFixed(0),KB:(b/8/1024).toFixed(3),MB:(b/8/1048576).toFixed(5),GB:(b/8/1073741824).toFixed(8),KiB:(b/8/1024).toFixed(3),MiB:(b/8/1048576).toFixed(5),Megabits:(b/1048576).toFixed(5)}; };
async function translateText(text,from,to) { const url=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`; const data=await fetch(url).then(r=>r.json()); return data[0].map(s=>s[0]).join(''); }

// ─── Route → tool ID mapping ──────────────────────────────────────────────────
// Maps the URL slug (from params.page) to a tool_id in the DB.
// The slug is the last segment of the route, e.g. /mergePDF → "mergePDF"
// and the DB tool_id is what comes after /route in image 2 list.
const ROUTE_TO_ID: Record<string, string> = {
  mergepdf:              'merge',
  splitpdf:              'split',
  compresspdf:           'compress',
  rotatepdf:             'rotate',
  watermark:             'watermark',
  repair:                'repair',
  'page-numbers':        'page-numbers',
  'crop-pdf':            'crop-pdf',
  'sign-pdf':            'sign-pdf',
  'fill-pdf':            'fill-pdf',
  organize:              'organize',
  'compare-pdf':         'compare-pdf',
  protect:               'protect',
  unlock:                'unlock',
  'pdf-to-pdfa':         'pdf-to-pdfa',
  'word-to-pdf':         'word-to-pdf',
  'csv-to-pdf':          'csv-to-pdf',
  'pptx-to-pdf':         'pptx-to-pdf',
  'pdf-to-jpg':          'pdf-to-jpg',
  'pdf-to-word':         'pdf-to-word',
  'pdf-to-ppt':          'pdf-to-ppt',
  'jpg-to-pdf':          'jpg-to-pdf',
  'mhtml-to-jpg':        'mhtml-to-jpg',
  'pdn-to-jpg':          'pdn-to-jpg',
  'xlsx-to-pdf2':        'xlsx-to-pdf2',
  'check-duplicates':    'check-duplicates',
  'remove-blank-rows':   'remove-blank-rows',
  'dbf-to-excel':        'dbf-to-excel',
  'excel-tips':          'excel-tips',
  translate:             'translate',
  'middle-english':      'middle-english',
  'breton-names':        'breton-names',
  'compare-texts':       'compare-texts',
  strikethrough:         'strikethrough',
  'blank-space':         'blank-space',
  'devlys-unicode':      'devlys-unicode',
  'data-size':           'data-size',
  'file-info':           'file-info',
  'make-smaller':        'make-smaller',
  'web-to-pdf-guide':    'web-to-pdf-guide',
  'sign-guide':          'sign-guide',
  'split-guide':         'split-guide',
  'fill-guide':          'fill-guide',
  'compress-img':        'compress-img',
  'resize-img':          'resize-img',
  'convert-img':         'convert-img',
  'crop-img':            'crop-img',
  'combine-images':      'combine-images',
  'remove-watermark-img':'remove-watermark-img',
  'html-to-pdf':         'html-to-pdf',
  'mht-to-pdf':          'mht-to-pdf',
  'excel-to-pdf':        'excel-to-pdf',
  'extract-text':        'extract-text',
};

// ─── Guides ───────────────────────────────────────────────────────────────────
const GUIDES = {
  'web-to-pdf-guide': { steps: [
    {t:'Open your browser',d:'Navigate to the webpage you want to save as PDF.'},
    {t:'Open Print dialog',d:'Press Ctrl+P (Windows/Linux) or Cmd+P (Mac).'},
    {t:'Select "Save as PDF"',d:'Change the destination/printer to "Save as PDF".'},
    {t:'Adjust settings',d:'Set margins, scale, and choose to include background graphics.'},
    {t:'Save',d:'Click Save and choose a location on your computer.'},
  ]},
  'sign-guide': { steps: [
    {t:'Upload your PDF',d:'Click Browse Files and select the PDF you need to sign.'},
    {t:'Load the signature pad',d:'The drawing canvas will appear below the file.'},
    {t:'Draw your signature',d:'Use your mouse or touchscreen to sign inside the box.'},
    {t:'Apply & Download',d:'Click "Apply Signature & Download PDF" to get the signed document.'},
  ]},
  'split-guide': { steps: [
    {t:'Upload your PDF',d:'Select the PDF you want to split.'},
    {t:'Enter page ranges',d:'Type ranges like "1-3, 4-6" or leave blank to split every page.'},
    {t:'Click Split',d:'Each range will download as a separate PDF file.'},
  ]},
  'fill-guide': { steps: [
    {t:'Upload your PDF form',d:'Select a PDF that contains interactive form fields.'},
    {t:'Click "Load Form Fields"',d:'The tool will detect all fillable fields.'},
    {t:'Fill in the fields',d:'Type values into each field in the list.'},
    {t:'Download',d:'Click "Download Filled PDF" to save your completed form.'},
  ]},
  'excel-tips': { steps: [
    {t:'Use Ctrl+T for Tables',d:'Convert your data range to a Table for auto-filtering and dynamic ranges.'},
    {t:'Flash Fill (Ctrl+E)',d:'Excel detects patterns and fills the rest of the column automatically.'},
    {t:'XLOOKUP over VLOOKUP',d:'XLOOKUP is more flexible — it searches both left and right.'},
    {t:'Power Query for transforms',d:'Use Data → Get & Transform for repeatable ETL without macros.'},
    {t:'Freeze Panes',d:'View → Freeze Panes keeps headers visible when scrolling large sheets.'},
  ]},
};

// ─── Specialized UI components ─────────────────────────────────────────────────
function SignPDFUI({file,setResult}) {
  const canvasRef=useRef(null);const [drawing,setDrawing]=useState(false);const [hasSig,setHasSig]=useState(false);const [saving,setSaving]=useState(false);
  useEffect(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#1e3a8a';ctx.lineWidth=2.5;ctx.lineCap='round';},[]);
  const pos=(e,c)=>{const r=c.getBoundingClientRect(),t=e.touches?.[0];return{x:((t?.clientX??e.clientX)-r.left)*(c.width/r.width),y:((t?.clientY??e.clientY)-r.top)*(c.height/r.height)};};
  const start=(e)=>{e.preventDefault();setDrawing(true);const c=canvasRef.current;const p=pos(e,c);c.getContext('2d').beginPath();c.getContext('2d').moveTo(p.x,p.y);};
  const draw=(e)=>{e.preventDefault();if(!drawing)return;const c=canvasRef.current;const ctx=c.getContext('2d');const p=pos(e,c);ctx.lineTo(p.x,p.y);ctx.stroke();setHasSig(true);};
  const end=()=>setDrawing(false);
  const clear=()=>{const c=canvasRef.current;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);setHasSig(false);};
  const apply=async()=>{if(!hasSig){setResult('❌ Please draw your signature first.');return;}setSaving(true);try{const L=await loadPdfLib();const sigB64=canvasRef.current.toDataURL('image/png').split(',')[1];const doc=await L.PDFDocument.load(await readAsAB(file));const sigImg=await doc.embedPng(b64ToBytes(sigB64));const pages=doc.getPages();const last=pages[pages.length-1];const{width,height}=last.getSize();const dims=sigImg.scale(0.35);last.drawImage(sigImg,{x:width-dims.width-40,y:40,width:dims.width,height:dims.height});dlBytes(await doc.save(),'signed.pdf');setResult('✅ Signed PDF downloaded!');}catch(e){setResult('❌ '+e.message);}setSaving(false);};
  return(<div className="mt-4"><p className="text-xs font-semibold text-gray-600 mb-2">Draw your signature:</p><canvas ref={canvasRef} width={500} height={150} onMouseDown={start} onMouseMove={draw} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={draw} onTouchEnd={end} className="border-2 border-gray-300 rounded-xl cursor-crosshair touch-none w-full bg-white" style={{maxWidth:500,height:150}}/><div className="flex gap-2 mt-2"><button onClick={clear} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Clear</button><button onClick={apply} disabled={saving||!hasSig} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:bg-gray-300">{saving?'Applying...':'Apply Signature & Download PDF'}</button></div></div>);
}

function FillPDFUI({file,setResult}) {
  const [fields,setFields]=useState(null);const [vals,setVals]=useState({});const [loading,setLoading]=useState(false);const [saving,setSaving]=useState(false);
  const loadFields=async()=>{setLoading(true);try{const L=await loadPdfLib();const doc=await L.PDFDocument.load(await readAsAB(file));const form=doc.getForm();const fl=form.getFields().map(f=>({name:f.getName(),type:f.constructor.name}));if(!fl.length){setResult('ℹ️ No interactive form fields found.');}else{setFields(fl);setVals(Object.fromEntries(fl.map(f=>[f.name,''])));}}catch(e){setResult('❌ '+e.message);}setLoading(false);};
  const save=async()=>{setSaving(true);try{const L=await loadPdfLib();const doc=await L.PDFDocument.load(await readAsAB(file));const form=doc.getForm();for(const[name,val]of Object.entries(vals)){try{const f=form.getField(name);if(f.constructor.name==='PDFTextField'&&val)f.setText(val);if(f.constructor.name==='PDFCheckBox')val==='true'?f.check():f.uncheck();}catch{}}form.flatten();dlBytes(await doc.save(),'filled.pdf');setResult('✅ Filled PDF downloaded!');}catch(e){setResult('❌ '+e.message);}setSaving(false);};
  if(!fields&&!loading)return<button onClick={loadFields} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">Load Form Fields</button>;
  if(loading)return<div className="mt-4 text-center text-gray-400">Loading fields...</div>;
  if(!fields)return null;
  return(<div className="mt-4 space-y-2 max-h-72 overflow-y-auto">{fields.map(f=>(<div key={f.name}><label className="text-xs font-semibold text-gray-500">{f.name}</label>{f.type==='PDFCheckBox'?<select value={vals[f.name]} onChange={e=>setVals({...vals,[f.name]:e.target.value})} className="w-full border rounded-lg px-3 py-1.5 text-sm mt-0.5"><option value="">-</option><option value="true">✓ Checked</option><option value="false">✗ Unchecked</option></select>:<input type="text" value={vals[f.name]} onChange={e=>setVals({...vals,[f.name]:e.target.value})} placeholder={f.name} className="w-full border rounded-lg px-3 py-1.5 text-sm mt-0.5 focus:outline-none focus:border-blue-400"/>}</div>))}<button onClick={save} disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 mt-2">{saving?'Saving...':'Download Filled PDF →'}</button></div>);
}

function OrganizeUI({file,setResult}) {
  const [pages,setPages]=useState(null);const [loading,setLoading]=useState(false);const [saving,setSaving]=useState(false);
  const dragRef=useRef(null);const overRef=useRef(null);
  const load=async()=>{setLoading(true);try{setPages(await pdfToImages(file,1.5));}catch(e){setResult('❌ '+e.message);}setLoading(false);};
  const onDragEnd=()=>{if(dragRef.current===null||overRef.current===null)return;const copy=[...pages];const[moved]=copy.splice(dragRef.current,1);copy.splice(overRef.current,0,moved);setPages(copy);dragRef.current=overRef.current=null;};
  const save=async()=>{setSaving(true);try{const L=await loadPdfLib();const src=await L.PDFDocument.load(await readAsAB(file));const doc=await L.PDFDocument.create();const copied=await doc.copyPages(src,pages.map(p=>p.page-1));copied.forEach(p=>doc.addPage(p));dlBytes(await doc.save(),'organized.pdf');setResult('✅ Organized PDF downloaded!');}catch(e){setResult('❌ '+e.message);}setSaving(false);};
  if(!pages&&!loading)return<button onClick={load} className="mt-4 w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700">Load Pages</button>;
  if(loading)return<div className="mt-4 text-center text-gray-400 py-6">Rendering pages...</div>;
  return(<div className="mt-4"><p className="text-xs text-gray-400 mb-2">Drag to reorder · Click ✕ to remove · {pages.length} pages</p><div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto">{pages.map((img,idx)=>(<div key={idx} draggable onDragStart={()=>dragRef.current=idx} onDragEnter={()=>overRef.current=idx} onDragEnd={onDragEnd} onDragOver={e=>e.preventDefault()} className="relative border rounded overflow-hidden cursor-move hover:border-pink-400 group select-none"><img src={img.dataUrl} alt="" className="w-full"/><div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-center text-xs py-0.5">{idx+1}</div><button onClick={()=>setPages(pages.filter((_,i)=>i!==idx))} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center">✕</button></div>))}</div><button onClick={save} disabled={saving} className="mt-3 w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 disabled:bg-gray-300">{saving?'Saving...':'Download Organized PDF →'}</button></div>);
}

function CropImgUI({file,setResult}) {
  const canvasRef=useRef(null);const imgRef=useRef(null);const [loaded,setLoaded]=useState(false);const [start,setStart]=useState(null);const [cropRect,setCropRect]=useState(null);const [dragging,setDragging]=useState(false);const natRef=useRef({w:1,h:1});
  useEffect(()=>{const img=new window.Image();const url=URL.createObjectURL(file);img.onload=()=>{imgRef.current=img;natRef.current={w:img.width,h:img.height};const c=canvasRef.current;const maxW=Math.min(img.width,480);c.width=maxW;c.height=img.height*(maxW/img.width);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);setLoaded(true);};img.src=url;},[file]);
  const getPos=(e)=>{const c=canvasRef.current,r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*(c.width/r.width),y:(e.clientY-r.top)*(c.height/r.height)};};
  const onDown=(e)=>{const p=getPos(e);setStart(p);setDragging(true);};
  const onMove=(e)=>{if(!dragging||!start)return;const p=getPos(e);const c=canvasRef.current;const ctx=c.getContext('2d');ctx.drawImage(imgRef.current,0,0,c.width,c.height);const x=Math.min(start.x,p.x),y=Math.min(start.y,p.y),w=Math.abs(p.x-start.x),h=Math.abs(p.y-start.y);ctx.strokeStyle='#3b82f6';ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.strokeRect(x,y,w,h);ctx.fillStyle='rgba(59,130,246,0.1)';ctx.fillRect(x,y,w,h);setCropRect({x,y,w,h});};
  const onUp=()=>setDragging(false);
  const doCrop=()=>{if(!cropRect){setResult('❌ Draw a crop area first.');return;}const c=canvasRef.current;const sx=natRef.current.w/c.width,sy=natRef.current.h/c.height;const out=document.createElement('canvas');out.width=cropRect.w*sx;out.height=cropRect.h*sy;out.getContext('2d').drawImage(imgRef.current,cropRect.x*sx,cropRect.y*sy,out.width,out.height,0,0,out.width,out.height);out.toBlob(blob=>{dlBlob(blob,'cropped.jpg');setResult('✅ Cropped image downloaded!');},'image/jpeg',0.95);};
  return(<div className="mt-4">{loaded&&<p className="text-xs text-gray-400 mb-2">Click and drag on the image to select crop area</p>}<canvas ref={canvasRef} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} className="border border-gray-200 rounded-xl cursor-crosshair w-full" style={{maxWidth:480}}/>{loaded&&<button onClick={doCrop} className="mt-3 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">Download Cropped Image</button>}</div>);
}

function ResizeImgUI({file,setResult}) {
  const [w,setW]=useState(1200);const [h,setH]=useState(800);const [quality,setQuality]=useState(85);const [saving,setSaving]=useState(false);
  const doResize=async()=>{setSaving(true);try{const blob=await resizeImageBlob(file,w,h,quality/100);dlBlob(blob,`resized-${w}x${h}.jpg`);setResult(`✅ Resized! Max ${w}×${h}px`);}catch(e){setResult('❌ '+e.message);}setSaving(false);};
  return(<div className="mt-4 space-y-3"><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-semibold text-gray-600">Max Width (px)</label><input type="number" value={w} onChange={e=>setW(parseInt(e.target.value)||1200)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none"/></div><div><label className="text-xs font-semibold text-gray-600">Max Height (px)</label><input type="number" value={h} onChange={e=>setH(parseInt(e.target.value)||800)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none"/></div></div><div><label className="text-xs font-semibold text-gray-600">Quality: {quality}%</label><input type="range" min={10} max={100} value={quality} onChange={e=>setQuality(+e.target.value)} className="w-full mt-1"/></div><button onClick={doResize} disabled={saving} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300">{saving?'Resizing...':'Resize & Download'}</button></div>);
}

function TranslateUI() {
  const [text,setText]=useState('');const [from,setFrom]=useState('auto');const [to,setTo]=useState('es');const [result,setResult]=useState('');const [loading,setLoading]=useState(false);
  const langs=[['auto','Auto'],['en','English'],['es','Spanish'],['fr','French'],['de','German'],['it','Italian'],['pt','Portuguese'],['ru','Russian'],['zh','Chinese'],['ja','Japanese'],['ar','Arabic'],['hi','Hindi'],['nl','Dutch'],['pl','Polish'],['tr','Turkish'],['ko','Korean'],['sv','Swedish'],['da','Danish'],['fi','Finnish'],['no','Norwegian'],['tl','Filipino/Tagalog'],['ca','Catalan'],['br','Breton'],['ga','Irish'],['cy','Welsh']];
  const go=async()=>{setLoading(true);try{setResult(await translateText(text,from,to));}catch{setResult('Translation error.');}setLoading(false);};
  return(<div className="mt-4 space-y-3"><div className="flex gap-2"><select value={from} onChange={e=>setFrom(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm">{langs.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><span className="text-gray-400 self-center text-lg">→</span><select value={to} onChange={e=>setTo(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm">{langs.filter(l=>l[0]!=='auto').map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><textarea value={text} onChange={e=>setText(e.target.value)} rows={5} placeholder="Enter text to translate..." className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none"/><button onClick={go} disabled={loading||!text.trim()} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:bg-gray-300">{loading?'Translating...':'Translate'}</button>{result&&<div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm whitespace-pre-wrap">{result}<button onClick={()=>navigator.clipboard.writeText(result)} className="block mt-2 text-xs text-indigo-500 hover:underline">Copy</button></div>}</div>);
}

function MiddleEnglishUI() {
  const [text,setText]=useState('');const [dir,setDir]=useState('toME');
  const result=text?(dir==='toME'?modernToME(text):meToModern(text)):'';
  return(<div className="mt-4 space-y-3"><div className="flex gap-2">{[['toME','Modern → Middle English'],['toMod','Middle English → Modern']].map(([v,l])=><button key={v} onClick={()=>setDir(v)} className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${dir===v?'border-indigo-500 bg-indigo-50 text-indigo-700':'border-gray-200 text-gray-500'}`}>{l}</button>)}</div><textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder={dir==='toME'?'Enter modern English...':'Enter Middle English...'} className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none"/>{result&&<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm font-serif whitespace-pre-wrap">{result}<button onClick={()=>navigator.clipboard.writeText(result)} className="block mt-2 text-xs text-amber-500 hover:underline">Copy</button></div>}</div>);
}

function CompareTextUI() {
  const [a,setA]=useState('');const [b,setB]=useState('');const [diff,setDiff]=useState(null);
  const go=()=>setDiff(compareTexts(a,b));
  const changes=diff?diff.filter(d=>d.changed):[];
  return(<div className="mt-4 space-y-3"><div className="grid grid-cols-2 gap-2"><div><div className="text-xs font-semibold text-gray-500 mb-1">Text A</div><textarea value={a} onChange={e=>setA(e.target.value)} rows={8} className="w-full border rounded-xl px-3 py-2 text-xs resize-none focus:outline-none" placeholder="First text..."/></div><div><div className="text-xs font-semibold text-gray-500 mb-1">Text B</div><textarea value={b} onChange={e=>setB(e.target.value)} rows={8} className="w-full border rounded-xl px-3 py-2 text-xs resize-none focus:outline-none" placeholder="Second text..."/></div></div><button onClick={go} disabled={!a&&!b} className="w-full bg-gray-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-300">Compare Texts</button>{diff&&<div><div className="text-sm font-semibold text-gray-600 mb-2">{changes.length} difference{changes.length!==1?'s':''}</div><div className="max-h-64 overflow-y-auto space-y-1 font-mono text-xs">{changes.length===0?<div className="text-green-600 text-center py-4">✅ Texts are identical!</div>:changes.slice(0,100).map(d=><div key={d.line}><div className="bg-red-50 text-red-700 px-2 py-0.5">− L{d.line}: {d.a||'(empty)'}</div><div className="bg-green-50 text-green-700 px-2 py-0.5">+ L{d.line}: {d.b||'(empty)'}</div></div>)}</div></div>}</div>);
}

function DataSizeUI() {
  const [val,setVal]=useState('');const [unit,setUnit]=useState('mb');const [res,setRes]=useState(null);
  const units=[['bit','Bit'],['byte','Byte'],['kb','Kilobyte'],['mb','Megabyte'],['gb','Gigabyte'],['mib','Mebibyte'],['kib','Kibibyte'],['mbit','Megabit']];
  return(<div className="mt-4 space-y-3"><div className="flex gap-2"><input type="number" value={val} onChange={e=>setVal(e.target.value)} placeholder="Value" className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none"/><select value={unit} onChange={e=>setUnit(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">{units.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><button onClick={()=>val&&setRes(convertSize(parseFloat(val),unit))} disabled={!val} className="w-full bg-amber-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:bg-gray-300">Convert</button>{res&&<div className="grid grid-cols-2 gap-2">{Object.entries(res).map(([k,v])=><div key={k} className="bg-amber-50 rounded-lg px-3 py-2 border border-amber-100"><div className="text-xs text-amber-500 font-semibold">{k}</div><div className="text-sm font-bold text-gray-800 truncate">{v}</div></div>)}</div>}</div>);
}

function BretonNamesUI() {
  const [gender,setGender]=useState('neutral');const [count,setCount]=useState(12);const [names,setNames]=useState([]);
  return(<div className="mt-4 space-y-3"><div className="flex gap-2"><select value={gender} onChange={e=>setGender(e.target.value)} className="flex-1 border rounded-xl px-3 py-2 text-sm"><option value="neutral">Any</option><option value="male">Masculine</option><option value="female">Feminine</option></select><input type="number" value={count} onChange={e=>setCount(+e.target.value||10)} min={1} max={50} className="w-20 border rounded-xl px-3 py-2 text-sm focus:outline-none"/><button onClick={()=>setNames(bretonNames(gender,count))} className="bg-indigo-600 text-white px-4 rounded-xl text-sm font-semibold hover:bg-indigo-700">Generate</button></div>{names.length>0&&<div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto">{names.map((n,i)=><div key={i} onClick={()=>navigator.clipboard.writeText(n)} className="bg-indigo-50 hover:bg-indigo-100 cursor-pointer rounded-lg px-3 py-1.5 text-sm text-indigo-900 font-medium">{n}</div>)}</div>}</div>);
}

function TextFxUI({mode}) {
  const [text,setText]=useState('');
  const out=mode==='strike'?strikeText(text):mode==='devlys'?devlyToUnicode(text):'\u2060'.repeat(parseInt(text)||0);
  return(<div className="mt-4 space-y-3"><textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder={mode==='blank'?'Number of invisible characters...':mode==='devlys'?'Paste Devlys 010 text here...':'Enter text...'} className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none"/>{text&&<div className="bg-gray-50 rounded-xl p-3 border cursor-pointer" onClick={()=>navigator.clipboard.writeText(mode==='blank'?'\u2060'.repeat(parseInt(text)||1):out)}><div className="text-xs text-gray-400 mb-1">{mode==='strike'?'Strikethrough':mode==='devlys'?'Unicode Devanagari':'Invisible Characters'} (click to copy):</div>{mode==='blank'?<div className="text-gray-400 italic text-sm">[{parseInt(text)||1} invisible chars — click to copy]</div>:<div className={`text-base ${mode==='devlys'?'font-serif text-lg':''} text-gray-800`}>{out}</div>}</div>}</div>);
}

function GuideUI({toolId}) {
  const g=GUIDES[toolId]; if(!g)return null;
  return(<div className="mt-4 space-y-2">{g.steps.map((s,i)=><div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex gap-3"><div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</div><div><div className="font-semibold text-gray-800 text-sm">{s.t}</div><div className="text-sm text-gray-500 mt-0.5">{s.d}</div></div></div>)}</div>);
}

function CheckDupUI({file,setResult}) {
  const [dup,setDup]=useState(null);const [loading,setLoading]=useState(false);
  const go=async()=>{setLoading(true);try{const r=await checkDuplicates(file);setDup(r);setResult(r.duplicates.length?`⚠️ ${r.duplicates.length} duplicate rows found`:'✅ No duplicates!');}catch(e){setResult('❌ '+e.message);}setLoading(false);};
  return(<><button onClick={go} disabled={loading} className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-300">{loading?'Analyzing...':'Check for Duplicates'}</button>{dup&&<div className="mt-4"><div className="grid grid-cols-3 gap-2 mb-3"><div className="bg-gray-50 rounded-xl p-3 text-center border"><div className="text-xl font-bold">{dup.total}</div><div className="text-xs text-gray-400">Total</div></div><div className="bg-red-50 rounded-xl p-3 text-center border border-red-100"><div className="text-xl font-bold text-red-600">{dup.duplicates.length}</div><div className="text-xs text-gray-400">Duplicates</div></div><div className="bg-green-50 rounded-xl p-3 text-center border border-green-100"><div className="text-xl font-bold text-green-600">{dup.unique}</div><div className="text-xs text-gray-400">Unique</div></div></div>{dup.duplicates.length>0&&<div className="max-h-48 overflow-y-auto space-y-1">{dup.duplicates.slice(0,50).map((d,i)=><div key={i} className="bg-red-50 rounded px-3 py-1 text-xs text-red-800">Row {d.row} duplicates row {d.firstSeen}: {d.data.slice(0,3).join(' | ')}</div>)}</div>}{dup.duplicates.length===0&&<div className="text-center text-green-600 font-semibold py-3">✅ No duplicate rows found!</div>}</div>}</>);
}

function CompareFilesPDFUI({files,setResult}) {
  const [diff,setDiff]=useState(null);const [loading,setLoading]=useState(false);
  const go=async()=>{setLoading(true);try{const[t1,t2]=await Promise.all([extractPDFText(files[0]),extractPDFText(files[1])]);setDiff(compareTexts(t1,t2));}catch(e){setResult('❌ '+e.message);}setLoading(false);};
  if(loading)return<div className="mt-4 text-center text-gray-400">Comparing...</div>;
  if(diff){const changes=diff.filter(d=>d.changed);return(<div className="mt-4"><div className="text-sm text-gray-600 mb-2 font-semibold">{changes.length} difference{changes.length!==1?'s':''}</div><div className="max-h-72 overflow-y-auto space-y-1 font-mono text-xs">{changes.slice(0,100).map(d=><div key={d.line}><div className="bg-red-50 text-red-700 px-2 py-0.5 rounded">− L{d.line}: {d.a||'(empty)'}</div><div className="bg-green-50 text-green-700 px-2 py-0.5 rounded">+ L{d.line}: {d.b||'(empty)'}</div></div>)}{changes.length===0&&<div className="text-green-600 text-center py-4">✅ PDFs have identical text!</div>}</div></div>);}
  return<button onClick={go} className="mt-4 w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-800">Compare PDFs</button>;
}

// ─── Row → tool mapper ────────────────────────────────────────────────────────
function rowToTool(row) {
  return {
    id: row.url_id,
    name: row.name,
    desc: row.description,
    icon: row.icon,
    route: row.route,
    category: row.category,
    catColor: row.cat_color,
    accept: row.accept ?? null,
    multiple: !!row.multiple,
  };
}

// ─── Main page component ──────────────────────────────────────────────────────
export default function ToolPage() {
  const params = useParams();
  const router = useRouter();

  // Normalise the slug: lowercase, strip leading slash
  const rawSlug = Array.isArray(params?.page) ? params.page[0] : (params?.page ?? '');
  const slug = rawSlug.toLowerCase().replace(/^\//, '');
console.log('Tool slug:', slug);
  // ── DB state ────────────────────────────────────────────────────────────────
  const [list, setList] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = (await getTableData('pdf')) as dataType[];
        setList(data);
      } catch (err) {
        setDbError('Failed to load tool data.');
        console.error(err);
      } finally {
        setDbLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Resolve tool from slug → DB row ────────────────────────────────────────
  const allTools = list.map(rowToTool);

  // First try matching by route field directly, then by ROUTE_TO_ID map, then by tool_id
  const tool = allTools.find(t => {
    const normalRoute = (t.route ?? '').toLowerCase().replace(/^\//, '');
    return normalRoute === slug;
  }) ?? allTools.find(t => t.id === ROUTE_TO_ID[slug]) ?? allTools.find(t => t.id === slug);

  // ── Tool interaction state ──────────────────────────────────────────────────
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [opts, setOpts] = useState({
    rotate: 90,
    watermarkText: 'CONFIDENTIAL',
    splitRanges: '',
    pageNumPos: 'bottom-center',
    imgFmt: 'jpeg',
    combineDir: 'vertical',
    cropPct: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  // Reset file/result when navigating to a new tool
  useEffect(() => { setFiles([]); setResult(null); }, [slug]);

  // ── Loading / error states ──────────────────────────────────────────────────
  if (dbLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f9fa' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading tool…</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f9fa' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <div className="text-red-500 font-medium">{dbError}</div>
          <button onClick={() => router.push('/')} className="mt-4 text-sm text-gray-400 hover:underline">← Back to all tools</button>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f9fa' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <div className="text-gray-600 font-semibold text-lg mb-1">Tool not found</div>
          <div className="text-gray-400 text-sm mb-4">No tool matched the route "/{slug}"</div>
          <button onClick={() => router.push('/')} className="text-sm text-red-500 hover:underline">← Back to all tools</button>
        </div>
      </div>
    );
  }

  const color = tool.catColor || '#dc2626';

  const isNoFile = ['translate','middle-english','breton-names','compare-texts','strikethrough','blank-space','devlys-unicode','data-size','web-to-pdf-guide','sign-guide','split-guide','fill-guide','excel-tips'].includes(tool.id);
  const isGuide  = ['web-to-pdf-guide','sign-guide','split-guide','fill-guide','excel-tips','pdf-to-ppt'].includes(tool.id);

  const addFiles = (e) => {
    const nf = Array.from(e.target.files || []);
    setFiles(prev => tool.multiple ? [...prev, ...nf] : nf);
    setResult(null);
  };

  const process = async () => {
    if (!files.length && !isNoFile) { setResult('❌ Please select a file first.'); return; }
    setProcessing(true); setResult(null);
    try {
      const f = files[0];
      switch (tool.route) {
        case '/merge': { const b=await mergePDFs(files); dlBytes(b,'merged.pdf'); setResult(`✅ ${files.length} PDFs merged!`); break; }
        case '/split': { const L=await loadPdfLib(); const src=await L.PDFDocument.load(await readAsAB(f)); const total=src.getPageCount(); const rs=opts.splitRanges.trim(); const ranges=rs?rs.split(',').map(r=>{const[a,b]=r.split('-').map(n=>parseInt(n.trim())-1);return{start:Math.max(0,a),end:Math.min(total-1,isNaN(b)?a:b)};}): [...Array(total)].map((_,i)=>({start:i,end:i})); const parts=await splitPDF(f,ranges); parts.forEach((b,i)=>dlBytes(b,`part-${i+1}.pdf`)); setResult(`✅ Split into ${parts.length} file(s)!`); break; }
        case '/compress': { const before=f.size; const b=await compressPDF(f); dlBytes(b,'compressed.pdf'); setResult(`✅ ${fmtBytes(before)} → ${fmtBytes(b.length)}`); break; }
        case '/rotate': { dlBytes(await rotatePDF(f,opts.rotate),'rotated.pdf'); setResult(`✅ Rotated ${opts.rotate}°!`); break; }
        case '/watermark': { if(!opts.watermarkText?.trim()){setResult('❌ Enter watermark text.');break;} dlBytes(await addWatermark(f,opts.watermarkText),'watermarked.pdf'); setResult('✅ Watermarked PDF downloaded!'); break; }
        case '/page-numbers': { dlBytes(await addPageNumbers(f,opts.pageNumPos),'numbered.pdf'); setResult('✅ Page numbers added!'); break; }
        case '/unlock': { dlBytes(await unlockPDF(f),'unlocked.pdf'); setResult('✅ Unlocked PDF downloaded!'); break; }
        case '/repair': { dlBytes(await repairPDF(f),'repaired.pdf'); setResult('✅ Repaired PDF downloaded!'); break; }
        case '/crop-pdf': { const p=opts.cropPct; dlBytes(await cropPDF(f,{top:p.top/100,right:p.right/100,bottom:p.bottom/100,left:p.left/100}),'cropped.pdf'); setResult('✅ Cropped PDF downloaded!'); break; }
        case '/jpg-to-pdf': { dlBytes(await imagesToPDF(files),'images.pdf'); setResult(`✅ ${files.length} image(s) → PDF!`); break; }
        case '/pdf-to-jpg': { setResult('🔄 Rendering pages...'); const imgs=await pdfToImages(f); imgs.forEach(({dataUrl,page})=>{const a=document.createElement('a');a.href=dataUrl;a.download=`page-${page}.jpg`;a.click();}); setResult(`✅ ${imgs.length} JPG(s) downloaded!`); break; }
        case '/pdf-to-word':
        case '/extract-text': { const t=await extractPDFText(f); dlText(t,f.name.replace('.pdf','.txt')); setResult('✅ Text extracted as .txt!'); break; }
        case '/word-to-pdf': { dlBytes(await wordToPDF(f),f.name.replace(/\.docx?$/i,'.pdf')); setResult('✅ Word → PDF downloaded!'); break; }
        case '/excel-to-pdf':
        case '/xlsx-to-pdf2': { dlBytes(await xlsxToPDF(f),f.name.replace(/\.[^.]+$/,'.pdf')); setResult('✅ Excel → PDF downloaded!'); break; }
        case '/csv-to-pdf': { dlBytes(await csvToPDF(f),f.name.replace('.csv','.pdf')); setResult('✅ CSV → PDF downloaded!'); break; }
        case '/compress-img': { const blob=await resizeImageBlob(f,9999,9999,0.7); dlBlob(blob,`compressed-${f.name}`); setResult(`✅ ${fmtBytes(f.size)} → ${fmtBytes(blob.size)}`); break; }
        case '/convert-img': { const blob=await convertImageFormat(f,opts.imgFmt); dlBlob(blob,f.name.replace(/\.[^.]+$/,'.'+opts.imgFmt)); setResult(`✅ Converted to ${opts.imgFmt.toUpperCase()}!`); break; }
        case '/combine-images': { const blob=await combineImages(files,opts.combineDir); dlBlob(blob,'combined.jpg'); setResult('✅ Images combined!'); break; }
        case '/remove-watermark-img': { const blob=await removeImgWatermark(f); dlBlob(blob,`clean-${f.name}`); setResult('✅ Downloaded! Results vary by image.'); break; }
        case '/mhtml-to-jpg': { const text=await readAsText(f); const m=text.match(/Content-Transfer-Encoding: base64[\s\S]*?\n\n([\s\S]*?)(?:\n--|$)/i); if(m){const b64=m[1].replace(/\s/g,'');const mime=text.match(/Content-Type: (image\/[^\s;]+)/i)?.[1]||'image/jpeg';dlBlob(new Blob([b64ToBytes(b64)],{type:mime}),'extracted.jpg');setResult('✅ Image extracted!');}else setResult('⚠️ Could not extract image.'); break; }
        case '/pdn-to-jpg': { const ab=await readAsAB(f); const bytes=new Uint8Array(ab); let found=false; for(let i=0;i<bytes.length-4;i++){if(bytes[i]===0x89&&bytes[i+1]===0x50&&bytes[i+2]===0x4e&&bytes[i+3]===0x47){dlBlob(new Blob([bytes.slice(i)],{type:'image/png'}),f.name.replace('.pdn','.png'));setResult('✅ PNG extracted from PDN!');found=true;break;}} if(!found)setResult('❌ Could not extract PNG from PDN.'); break; }
        case '/html-to-pdf': { const t=await readAsText(f); dlBytes(await htmlToPDF(t),f.name.replace(/\.html?$/i,'.pdf')); setResult('✅ HTML → PDF downloaded!'); break; }
        case '/mht-to-pdf': { const t=await readAsText(f); dlBytes(await htmlToPDF(t),f.name.replace(/\.mh?t(ml)?$/i,'.pdf')); setResult('✅ MHT → PDF converted.'); break; }
        case '/remove-blank-rows': { const b=await removeBlankRows(f); dlBlob(new Blob([b],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`clean-${f.name}`); setResult('✅ Blank rows removed!'); break; }
        case '/dbf-to-excel': { const b=await dbfToExcel(f); dlBlob(new Blob([b],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),f.name.replace('.dbf','.xlsx')); setResult('✅ DBF → Excel downloaded!'); break; }
        case '/pdf-to-pdfa': { dlBytes(await compressPDF(f),f.name.replace('.pdf','-pdfa.pdf')); setResult('✅ PDF/A generated.'); break; }
        case '/protect': setResult('⚠️ Browser-based PDF encryption is not secure. Use Adobe Acrobat for true password protection.'); break;
        case '/pptx-to-pdf': setResult('⚠️ PowerPoint to PDF requires server processing. Try Google Drive: right-click → Download as PDF.'); break;
        case '/make-smaller': { if(f.type.includes('pdf')||f.name.endsWith('.pdf')){const before=f.size;const b=await compressPDF(f);dlBytes(b,`smaller-${f.name}`);setResult(`✅ ${fmtBytes(before)} → ${fmtBytes(b.length)}`);}else{const blob=await resizeImageBlob(f,2000,2000,0.75);dlBlob(blob,`smaller-${f.name}`);setResult(`✅ ${fmtBytes(f.size)} → ${fmtBytes(blob.size)}`);} break; }
        case '/file-info': { setResult(`ℹ️ File Info:\n• Name: ${f.name}\n• Size: ${fmtBytes(f.size)} (${f.size.toLocaleString()} bytes)\n• Type: ${f.type||'unknown'}\n• Modified: ${new Date(f.lastModified).toLocaleString()}`); break; }
        default: setResult('⚠️ This tool is not yet implemented in browser mode.'); break;
      }
    } catch(e) { setResult('❌ Error: '+(e.message||String(e))); }
    setProcessing(false);
  };

  const showProcessBtn = !isNoFile && !isGuide && !['sign-pdf','fill-pdf','organize','compare-pdf','check-duplicates','crop-img','resize-img'].includes(tool.id);

  const renderOptions = () => {
    if (tool.id==='rotate') return(<div className="mt-4"><div className="text-sm font-semibold text-gray-700 mb-2">Rotation angle</div><div className="flex gap-2">{[90,180,270].map(d=><button key={d} onClick={()=>setOpts({...opts,rotate:d})} className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${opts.rotate===d?'border-red-500 bg-red-50 text-red-700':'border-gray-200 text-gray-500'}`}>{d}°</button>)}</div></div>);
    if (tool.id==='watermark') return(<div className="mt-4"><div className="text-sm font-semibold text-gray-700 mb-1">Watermark text</div><input value={opts.watermarkText} onChange={e=>setOpts({...opts,watermarkText:e.target.value})} placeholder="CONFIDENTIAL" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none"/></div>);
    if (tool.id==='split') return(<div className="mt-4"><div className="text-sm font-semibold text-gray-700 mb-1">Page ranges <span className="font-normal text-gray-400">(e.g. "1-3, 4-6" — blank = every page)</span></div><input value={opts.splitRanges} onChange={e=>setOpts({...opts,splitRanges:e.target.value})} placeholder="1-3, 4-6, 7" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none"/></div>);
    if (tool.id==='page-numbers') return(<div className="mt-4"><div className="text-sm font-semibold text-gray-700 mb-1">Position</div><select value={opts.pageNumPos} onChange={e=>setOpts({...opts,pageNumPos:e.target.value})} className="border-2 border-gray-200 rounded-xl px-4 py-2"><option value="bottom-center">Bottom Center</option><option value="bottom-right">Bottom Right</option><option value="bottom-left">Bottom Left</option><option value="top-center">Top Center</option></select></div>);
    if (tool.id==='convert-img') return(<div className="mt-4"><div className="text-sm font-semibold text-gray-700 mb-1">Convert to</div><select value={opts.imgFmt} onChange={e=>setOpts({...opts,imgFmt:e.target.value})} className="border-2 border-gray-200 rounded-xl px-4 py-2"><option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option></select></div>);
    if (tool.id==='combine-images') return(<div className="mt-4"><div className="text-sm font-semibold text-gray-700 mb-2">Direction</div><div className="flex gap-2"><button onClick={()=>setOpts({...opts,combineDir:'vertical'})} className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold ${opts.combineDir==='vertical'?'border-green-500 bg-green-50 text-green-700':'border-gray-200 text-gray-500'}`}>⬇ Vertical</button><button onClick={()=>setOpts({...opts,combineDir:'horizontal'})} className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold ${opts.combineDir==='horizontal'?'border-green-500 bg-green-50 text-green-700':'border-gray-200 text-gray-500'}`}>➡ Horizontal</button></div></div>);
    if (tool.id==='crop-pdf') return(<div className="mt-4 grid grid-cols-2 gap-3">{['top','right','bottom','left'].map(s=><div key={s}><div className="text-xs font-semibold text-gray-600 capitalize">{s} crop %</div><input type="number" min={0} max={45} value={opts.cropPct[s]||0} onChange={e=>setOpts({...opts,cropPct:{...opts.cropPct,[s]:+e.target.value||0}})} className="w-full border rounded-xl px-3 py-1.5 text-sm mt-1 focus:outline-none"/></div>)}</div>);
    return null;
  };

  const renderSpecial = () => {
    if (isGuide) return <GuideUI toolId={tool.id}/>;
    if (tool.id==='translate') return <TranslateUI/>;
    if (tool.id==='middle-english') return <MiddleEnglishUI/>;
    if (tool.id==='breton-names') return <BretonNamesUI/>;
    if (tool.id==='compare-texts') return <CompareTextUI/>;
    if (tool.id==='strikethrough') return <TextFxUI mode="strike"/>;
    if (tool.id==='blank-space') return <TextFxUI mode="blank"/>;
    if (tool.id==='devlys-unicode') return <TextFxUI mode="devlys"/>;
    if (tool.id==='data-size') return <DataSizeUI/>;
    if (tool.id==='sign-pdf' && files.length>0) return <SignPDFUI file={files[0]} setResult={setResult}/>;
    if (tool.id==='fill-pdf' && files.length>0) return <FillPDFUI file={files[0]} setResult={setResult}/>;
    if (tool.id==='organize' && files.length>0) return <OrganizeUI file={files[0]} setResult={setResult}/>;
    if (tool.id==='compare-pdf' && files.length>=2) return <CompareFilesPDFUI files={files} setResult={setResult}/>;
    if (tool.id==='check-duplicates' && files.length>0) return <CheckDupUI file={files[0]} setResult={setResult}/>;
    if (tool.id==='crop-img' && files.length>0) return <CropImgUI file={files[0]} setResult={setResult}/>;
    if (tool.id==='resize-img' && files.length>0) return <ResizeImgUI file={files[0]} setResult={setResult}/>;
    return null;
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa' }}>
      {/* Sticky top nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="font-black text-lg tracking-tight flex-shrink-0" style={{ color: '#dc2626' }}>
            PDF<span className="text-gray-800">&</span>Tools
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-600 truncate">{tool.name}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => router.push('/pdf-tool')} className="text-gray-400 hover:text-gray-600 text-sm font-medium mb-6 flex items-center gap-1 transition-colors bg-red-500 px-3 py-1.5 rounded-xl border border-gray-200 text-white hover:bg-black hover:border-gray-600 cursor-pointer w-max">
          ← All tools
        </button>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 text-white rounded-2xl mb-4 text-3xl" style={{ background: color }}>
            {tool.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
          <p className="text-gray-400">{tool.desc}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          {/* File drop zone */}
          {!isNoFile && (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-gray-300 transition-colors">
              <input id="fi" type="file" onChange={addFiles} multiple={!!tool.multiple} accept={tool.accept || '*'} className="hidden" />
              <label htmlFor="fi" className="cursor-pointer block">
                <div className="text-4xl mb-3">{tool.icon}</div>
                <div className="font-semibold text-gray-700 mb-1 text-sm">{tool.multiple ? 'Select files' : 'Select file'}</div>
                <div className="text-xs text-gray-400 mb-4">or drag & drop</div>
                <span className="inline-block text-white px-6 py-2.5 rounded-xl font-semibold text-sm" style={{ background: color }}>Browse Files</span>
              </label>
            </div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                  <span className="text-lg flex-shrink-0">📄</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{f.name}</div>
                    <div className="text-xs text-gray-400">{fmtBytes(f.size)}</div>
                  </div>
                  <button onClick={() => setFiles(files.filter((_,j)=>j!==i))} className="text-gray-300 hover:text-red-500 text-lg leading-none">×</button>
                </div>
              ))}
            </div>
          )}

          {renderOptions()}
          {renderSpecial()}

          {showProcessBtn && files.length > 0 && (
            <button
              onClick={process}
              disabled={processing}
              className="w-full mt-5 text-white py-3.5 rounded-2xl text-base font-semibold disabled:bg-gray-200 cursor-pointer transition-colors"
              style={{ background: processing ? undefined : color }}
            >
              {processing ? '⏳ Processing…' : `${tool.icon} ${tool.name} →`}
            </button>
          )}

          {result && (
            <div className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium whitespace-pre-line ${result.startsWith('❌') ? 'bg-red-50 text-red-700 border border-red-100' : result.startsWith('⚠️') ? 'bg-yellow-50 text-yellow-800 border border-yellow-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              {result}
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-400">
          🔒 All processing happens in your browser — files never leave your device
        </div>
      </div>
    </div>
  );
}