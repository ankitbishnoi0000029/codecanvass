// @ts-nocheck
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload } from 'lucide-react';

const FlagMaker = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState([
    { id: 1, type: 'rect', x: 0, y: 0, width: 33.33, height: 100, color: '#0066cc' },
    { id: 2, type: 'rect', x: 33.33, y: 0, width: 33.33, height: 100, color: '#ffffff' },
    { id: 3, type: 'rect', x: 66.66, y: 0, width: 33.34, height: 100, color: '#ffdd00' }
  ]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [bgColor, setBgColor] = useState('#cccccc');
  const [bgImage, setBgImage] = useState(null);
  const [text, setText] = useState('');
  const [textSize, setTextSize] = useState(12);
  const [textStyle, setTextStyle] = useState({ bold: false, italic: false, underline: false, color: '#000000' });
  const [rotation, setRotation] = useState(0);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(300);
  const [activeTab, setActiveTab] = useState('Flags');
  const bgInputRef = useRef(null);
  const shapeInputRef = useRef(null);
  const [nextId, setNextId] = useState(4);

  const flags = [
    { name: 'India', layers: [
      { type: 'rect', x: 0, y: 0, width: 100, height: 33.33, color: '#ff9933' },
      { type: 'rect', x: 0, y: 33.33, width: 100, height: 33.33, color: '#ffffff' },
      { type: 'rect', x: 0, y: 66.66, width: 100, height: 33.34, color: '#138808' }
    ]},
    { name: 'Netherlands', layers: [
      { type: 'rect', x: 0, y: 0, width: 100, height: 33.33, color: '#21468b' },
      { type: 'rect', x: 0, y: 33.33, width: 100, height: 33.33, color: '#ffffff' },
      { type: 'rect', x: 0, y: 66.66, width: 100, height: 33.34, color: '#ae1c28' }
    ]},
    { name: 'Italy', layers: [
      { type: 'rect', x: 0, y: 0, width: 33.33, height: 100, color: '#009246' },
      { type: 'rect', x: 33.33, y: 0, width: 33.33, height: 100, color: '#ffffff' },
      { type: 'rect', x: 66.66, y: 0, width: 33.34, height: 100, color: '#ce2b37' }
    ]},
    { name: 'France', layers: [
      { type: 'rect', x: 0, y: 0, width: 33.33, height: 100, color: '#0055a4' },
      { type: 'rect', x: 33.33, y: 0, width: 33.33, height: 100, color: '#ffffff' },
      { type: 'rect', x: 66.66, y: 0, width: 33.34, height: 100, color: '#ef4135' }
    ]},
    { name: 'Ireland', layers: [
      { type: 'rect', x: 0, y: 0, width: 33.33, height: 100, color: '#169b62' },
      { type: 'rect', x: 33.33, y: 0, width: 33.33, height: 100, color: '#ffffff' },
      { type: 'rect', x: 66.66, y: 0, width: 33.34, height: 100, color: '#ff883e' }
    ]},
    { name: 'Belgium', layers: [
      { type: 'rect', x: 0, y: 0, width: 33.33, height: 100, color: '#000000' },
      { type: 'rect', x: 33.33, y: 0, width: 33.33, height: 100, color: '#fdda24' },
      { type: 'rect', x: 66.66, y: 0, width: 33.34, height: 100, color: '#ef3340' }
    ]}
  ];

  useEffect(() => {
    drawCanvas();
  }, [layers, bgColor, bgImage, width, height, selectedLayer]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    layers.forEach(layer => {
      const x = (layer.x / 100) * canvas.width;
      const y = (layer.y / 100) * canvas.height;
      const w = (layer.width / 100) * canvas.width;
      const h = (layer.height / 100) * canvas.height;

      ctx.save();
      
      if (layer.rotation) {
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.translate(-(x + w / 2), -(y + h / 2));
      }

      ctx.fillStyle = layer.color;

      if (layer.type === 'rect') {
        ctx.fillRect(x, y, w, h);
      } else if (layer.type === 'circle') {
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (layer.type === 'star') {
        drawStar(ctx, x + w / 2, y + h / 2, 5, Math.min(w, h) / 2, Math.min(w, h) / 4);
        ctx.fill();
      } else if (layer.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
      } else if (layer.type === 'text') {
        ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize}px Arial`;
        ctx.fillText(layer.text, x, y);
        
        if (layer.underline) {
          const textWidth = ctx.measureText(layer.text).width;
          ctx.beginPath();
          ctx.moveTo(x, y + 2);
          ctx.lineTo(x + textWidth, y + 2);
          ctx.stroke();
        }
      } else if (layer.type === 'image') {
        ctx.drawImage(layer.img, x, y, w, h);
      }

      if (selectedLayer === layer.id) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  };

  const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (x >= layer.x && x <= layer.x + layer.width && y >= layer.y && y <= layer.y + layer.height) {
        setSelectedLayer(layer.id);
        return;
      }
    }
    setSelectedLayer(null);
  };

  const loadFlag = (flag) => {
    const newLayers = flag.layers.map((l, i) => ({ ...l, id: nextId + i }));
    setLayers(newLayers);
    setNextId(nextId + newLayers.length);
    setSelectedLayer(null);
    setBgImage(null);
  };

  const addText = () => {
    if (text.trim()) {
      const newLayer = {
        id: nextId,
        type: 'text',
        text: text,
        x: 20,
        y: 50,
        width: 50,
        height: 10,
        color: textStyle.color,
        fontSize: textSize,
        bold: textStyle.bold,
        italic: textStyle.italic,
        underline: textStyle.underline,
        rotation: 0
      };
      setLayers([...layers, newLayer]);
      setNextId(nextId + 1);
      setText('');
    }
  };

  const updateLayer = (updates) => {
    if (selectedLayer) {
      setLayers(layers.map(l => l.id === selectedLayer ? { ...l, ...updates } : l));
    }
  };

  const deleteLayer = () => {
    if (selectedLayer) {
      setLayers(layers.filter(l => l.id !== selectedLayer));
      setSelectedLayer(null);
    }
  };

  const downloadFlag = () => {
    const canvas = downloadCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    layers.forEach(layer => {
      const x = (layer.x / 100) * canvas.width;
      const y = (layer.y / 100) * canvas.height;
      const w = (layer.width / 100) * canvas.width;
      const h = (layer.height / 100) * canvas.height;

      ctx.save();
      
      if (layer.rotation) {
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.translate(-(x + w / 2), -(y + h / 2));
      }

      ctx.fillStyle = layer.color;

      if (layer.type === 'rect') {
        ctx.fillRect(x, y, w, h);
      } else if (layer.type === 'circle') {
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (layer.type === 'star') {
        drawStar(ctx, x + w / 2, y + h / 2, 5, Math.min(w, h) / 2, Math.min(w, h) / 4);
        ctx.fill();
      } else if (layer.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
      } else if (layer.type === 'text') {
        ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize}px Arial`;
        ctx.fillText(layer.text, x, y);
      } else if (layer.type === 'image') {
        ctx.drawImage(layer.img, x, y, w, h);
      }

      ctx.restore();
    });

    const link = document.createElement('a');
    link.download = 'flag.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setBgImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShapeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const newLayer = {
            id: nextId,
            type: 'image',
            img: img,
            x: 25,
            y: 25,
            width: 20,
            height: 20,
            rotation: 0
          };
          setLayers([...layers, newLayer]);
          setNextId(nextId + 1);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const randomize = () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000', '#ff9933', '#138808'];
    const count = Math.floor(Math.random() * 4) + 2;
    const horizontal = Math.random() > 0.5;
    
    const newLayers = [];
    for (let i = 0; i < count; i++) {
      if (horizontal) {
        newLayers.push({
          id: nextId + i,
          type: 'rect',
          x: 0,
          y: (100 / count) * i,
          width: 100,
          height: 100 / count,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: 0
        });
      } else {
        newLayers.push({
          id: nextId + i,
          type: 'rect',
          x: (100 / count) * i,
          y: 0,
          width: 100 / count,
          height: 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: 0
        });
      }
    }
    setLayers(newLayers);
    setNextId(nextId + count);
  };

  const flipHorizontal = () => {
    setLayers(layers.map(l => ({ ...l, x: 100 - l.x - l.width })));
  };

  const selected = layers.find(l => l.id === selectedLayer);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-100 border-b px-4 py-3">
        <h1 className="text-2xl font-bold text-center text-gray-800">Flag Maker</h1>
      </div>

      <div className="flex">
        <div className="w-56 bg-gray-800 p-4 space-y-3">
          <button onClick={() => setLayers([])} className="w-full bg-white text-gray-800 py-2 px-3 rounded text-sm font-medium">
            New Blank Flag
          </button>
          
          <select className="w-full bg-gray-700 text-white py-2 px-3 rounded text-sm">
            <option>PNG</option>
            <option>JPG</option>
            <option>SVG</option>
          </select>

          <select className="w-full bg-gray-700 text-white py-2 px-3 rounded text-sm">
            <option>Original Size</option>
            <option>Custom</option>
          </select>

          <button onClick={downloadFlag} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium">
            Download
          </button>

          <button onClick={randomize} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm">
            Random
          </button>

          <select className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm">
            <option>Horizontal</option>
            <option>Vertical</option>
            <option>Diagonal</option>
          </select>

          <button onClick={flipHorizontal} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm">
            Flip
          </button>

          <button onClick={deleteLayer} disabled={!selectedLayer} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm disabled:opacity-50">
            Delete
          </button>
        </div>

        <div className="flex-1 p-6 bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={360}
            className="border-2 border-gray-300 cursor-pointer"
            onClick={handleCanvasClick}
          />
        </div>

        <div className="w-96 bg-gray-800 text-white overflow-y-auto" style={{maxHeight: '100vh'}}>
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-bold mb-3">Choose background</h3>
            <button
              onClick={() => bgInputRef.current?.click()}
              className="w-full bg-gray-700 border-2 border-dashed border-gray-600 rounded py-8 mb-3 hover:bg-gray-600"
            >
              <Upload className="mx-auto mb-2" size={24} />
              <div className="text-sm">Choose a file...</div>
            </button>
            <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
            
            <div className="flex gap-2 mb-2">
              <button onClick={() => setBgColor('#0038a8')} className="w-12 h-12 rounded" style={{backgroundColor: '#0038a8'}} />
              <button onClick={() => setBgColor('#ffffff')} className="w-12 h-12 rounded border" style={{backgroundColor: '#ffffff'}} />
              <button onClick={() => setBgColor('#ffc400')} className="w-12 h-12 rounded" style={{backgroundColor: '#ffc400'}} />
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
            </div>
            <p className="text-xs text-gray-400">Upload image for flag background.</p>
          </div>

          <div className="p-4 border-b border-gray-700">
            <h3 className="font-bold mb-3">Add Text</h3>
            <input
              type="text"
              placeholder="text to add in flag"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mb-3 text-sm"
            />
            <button onClick={addText} className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-3 rounded text-sm mb-3">
              Add
            </button>
            <div className="text-right text-xs mb-3 text-gray-400">Size</div>
            <div className="flex gap-2">
              <button
                onClick={() => setTextStyle({...textStyle, bold: !textStyle.bold})}
                className={`px-3 py-2 rounded ${textStyle.bold ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => setTextStyle({...textStyle, underline: !textStyle.underline})}
                className={`px-3 py-2 rounded ${textStyle.underline ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                <u>U</u>
              </button>
              <button
                onClick={() => setTextStyle({...textStyle, italic: !textStyle.italic})}
                className={`px-3 py-2 rounded ${textStyle.italic ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                <em>I</em>
              </button>
              <div className="w-12 h-10 rounded cursor-pointer" style={{backgroundColor: textStyle.color, border: '1px solid #666'}} onClick={() => setTextStyle({...textStyle, color: prompt('Enter color:', textStyle.color) || textStyle.color})} />
              <input
                type="number"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                className="w-16 bg-gray-700 border border-gray-600 rounded px-2 text-center"
              />
            </div>
          </div>

          {selected && (
            <div className="p-4 border-b border-gray-700">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-xs mb-1">Rotate Image</label>
                  <input
                    type="number"
                    value={selected.rotation || 0}
                    onChange={(e) => updateLayer({rotation: Number(e.target.value)})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Width</label>
                  <input
                    type="number"
                    value={Math.round(width)}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Height</label>
                  <input
                    type="number"
                    value={Math.round(height)}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateLayer({color: '#0038a8'})} className="w-12 h-12 rounded" style={{backgroundColor: '#0038a8'}} />
                <button onClick={() => updateLayer({color: '#ffffff'})} className="w-12 h-12 rounded border" style={{backgroundColor: '#ffffff'}} />
                <button onClick={() => updateLayer({color: '#ffc400'})} className="w-12 h-12 rounded" style={{backgroundColor: '#ffc400'}} />
              </div>
            </div>
          )}

          <div className="p-4">
            <h3 className="font-bold mb-3">Shapes</h3>
            <button
              onClick={() => shapeInputRef.current?.click()}
              className="w-full bg-gray-700 border-2 border-dashed border-gray-600 rounded py-8 mb-3 hover:bg-gray-600"
            >
              <Upload className="mx-auto mb-2" size={24} />
              <div className="text-sm">Upload a shape for flag.</div>
            </button>
            <input ref={shapeInputRef} type="file" accept="image/*" onChange={handleShapeUpload} className="hidden" />
            
            <div className="flex gap-2 border-b border-gray-700 pb-2 mb-3 text-sm overflow-x-auto">
              {['Flags', 'Symbols', 'Shapes', 'Creatures'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === tab ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {activeTab === 'Flags' && flags.map((flag, i) => (
                <button
                  key={i}
                  onClick={() => loadFlag(flag)}
                  className="aspect-video bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 text-xs flex items-center justify-center"
                >
                  {flag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <canvas ref={downloadCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default FlagMaker;
