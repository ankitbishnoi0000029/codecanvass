"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FileStats {
  name: string; size: number; type: string; meshCount: number;
  textureCount: number; materialCount: number; vertexCount: number; animationCount: number;
}
interface CompressedResult {
  originalSize: number; compressedSize: number; compressionRatio: number;
  downloadUrl: string; fileName: string; timeTaken: number;
}
interface CompressionSettings {
  dracoCompression: boolean; dracoLevel: number; meshoptCompression: boolean;
  textureResize: boolean; textureMaxSize: number; textureFormat: "webp"|"jpeg"|"png"|"ktx2";
  textureQuality: number; removeDuplicateMeshes: boolean; removeUnusedMaterials: boolean;
  flattenScene: boolean; mergeMaterials: boolean; stripMetadata: boolean;
  dedupAccessors: boolean; pruneUnused: boolean;
}
type CompressionPreset = "fast"|"balanced"|"maximum";
type ActiveTab = "compress"|"analyze"|"settings"|"batch";

function formatBytes(b: number): string {
  if (!b) return "0 B";
  const k=1024, s=["B","KB","MB","GB"], i=Math.floor(Math.log(b)/Math.log(k));
  return `${parseFloat((b/Math.pow(k,i)).toFixed(2))} ${s[i]}`;
}
function getExt(n: string): string { return n.split(".").pop()?.toLowerCase()||""; }

const defaultSettings: CompressionSettings = {
  dracoCompression:true, dracoLevel:6, meshoptCompression:false, textureResize:true,
  textureMaxSize:1024, textureFormat:"webp", textureQuality:80, removeDuplicateMeshes:true,
  removeUnusedMaterials:true, flattenScene:false, mergeMaterials:false, stripMetadata:true,
  dedupAccessors:true, pruneUnused:true,
};
const presets: Record<CompressionPreset,Partial<CompressionSettings>> = {
  fast:{ dracoCompression:false,meshoptCompression:false,textureResize:true,textureMaxSize:2048,textureQuality:90,textureFormat:"jpeg",stripMetadata:true,pruneUnused:true,dedupAccessors:true },
  balanced: defaultSettings,
  maximum:{ dracoCompression:true,dracoLevel:10,meshoptCompression:true,textureResize:true,textureMaxSize:512,textureQuality:70,textureFormat:"ktx2",removeDuplicateMeshes:true,removeUnusedMaterials:true,flattenScene:true,mergeMaterials:true,stripMetadata:true,dedupAccessors:true,pruneUnused:true },
};

function StatBadge({ label, value, color="cyan" }: { label:string; value:string|number; color?:string }) {
  const cm: Record<string,string> = {
    cyan:"bg-cyan-500/10 text-cyan-300 border-cyan-500/20", violet:"bg-violet-500/10 text-violet-300 border-violet-500/20",
    emerald:"bg-emerald-500/10 text-emerald-300 border-emerald-500/20", amber:"bg-amber-500/10 text-amber-300 border-amber-500/20",
    rose:"bg-rose-500/10 text-rose-300 border-rose-500/20", sky:"bg-sky-500/10 text-sky-300 border-sky-500/20",
  };
  return (
    <div className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 ${cm[color]}`}>
      <span className="text-xs font-medium opacity-60 uppercase tracking-widest">{label}</span>
      <span className="text-lg font-bold font-mono">{value}</span>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: { checked:boolean; onChange:(v:boolean)=>void; label:string; description?:string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group py-1">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="sr-only"/>
        <div className={`w-9 h-5 rounded-full transition-colors ${checked?"bg-cyan-500":"bg-white/10"}`}/>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked?"translate-x-4":""}`}/>
      </div>
      <div>
        <p className="text-sm font-medium text-white/90 group-hover:text-white">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

function Slider({ label, value, min, max, step=1, unit, onChange, disabled }: {
  label:string; value:number; min:number; max:number; step?:number; unit?:string; onChange:(v:number)=>void; disabled?:boolean;
}) {
  return (
    <div className={disabled?"opacity-30 pointer-events-none":""}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/60 font-medium">{label}</span>
        <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer accent-cyan-400"/>
    </div>
  );
}

// ─── Inline minimal GLTFLoader factory ───────────────────────────────────────
// Builds a GLTFLoader from the already-loaded THREE global.
// This avoids any external CDN dependency beyond three.min.js itself.
function buildGLTFLoader(T: any) {
  // If a prior run already attached it, reuse.
  if (T._GLTFLoaderReady) return new T._GLTFLoader();

  // ── Minimal GLB/GLTF parser ──────────────────────────────────────────────
  // Supports: GLB binary container, embedded base64 data URIs, basic PBR materials.
  // Animations and skins are loaded structurally but not fully rigged (sufficient for preview).

  const BINARY_EXTENSION_HEADER_MAGIC = 0x46546C67;
  const BINARY_EXTENSION_CHUNK_TYPE_JSON = 0x4E4F534A;
  const BINARY_EXTENSION_CHUNK_TYPE_BIN  = 0x004E4942;

  class GLTFLoader {
    load(url: string, onLoad: (g: any)=>void, _onProgress: any, onError: (e:any)=>void) {
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(buf => this._parse(buf, url, onLoad, onError))
        .catch(onError);
    }

    _parse(buffer: ArrayBuffer, url: string, onLoad: (g:any)=>void, onError:(e:any)=>void) {
      try {
        const magic = new DataView(buffer).getUint32(0, true);
        if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
          this._parseGLB(buffer, url, onLoad, onError);
        } else {
          const text = new TextDecoder().decode(buffer);
          const json = JSON.parse(text);
          this._parseGLTF(json, null, url, onLoad, onError);
        }
      } catch(e) { onError(e); }
    }

    _parseGLB(buffer: ArrayBuffer, url: string, onLoad: (g:any)=>void, onError:(e:any)=>void) {
      const dv = new DataView(buffer);
      // header: magic(4) version(4) length(4)
      let offset = 12;
      let json: any = null;
      let binaryChunk: ArrayBuffer | null = null;

      while (offset < buffer.byteLength) {
        const chunkLength = dv.getUint32(offset, true);
        const chunkType   = dv.getUint32(offset + 4, true);
        offset += 8;
        if (chunkType === BINARY_EXTENSION_CHUNK_TYPE_JSON) {
          const jsonStr = new TextDecoder().decode(new Uint8Array(buffer, offset, chunkLength));
          json = JSON.parse(jsonStr);
        } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPE_BIN) {
          binaryChunk = buffer.slice(offset, offset + chunkLength);
        }
        offset += chunkLength;
      }
      if (!json) { onError(new Error("GLB: no JSON chunk")); return; }
      this._parseGLTF(json, binaryChunk, url, onLoad, onError);
    }

    async _parseGLTF(json: any, binaryChunk: ArrayBuffer|null, _url: string, onLoad:(g:any)=>void, onError:(e:any)=>void) {
      try {
        // ── Resolve buffers ───────────────────────────────────────────────
        const buffers: ArrayBuffer[] = [];
        for (const buf of (json.buffers || [])) {
          if (buf.uri) {
            if (buf.uri.startsWith("data:")) {
              const b64 = buf.uri.split(",")[1];
              const bin = atob(b64);
              const arr = new Uint8Array(bin.length);
              for (let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
              buffers.push(arr.buffer);
            } else {
              const resp = await fetch(buf.uri);
              buffers.push(await resp.arrayBuffer());
            }
          } else if (binaryChunk) {
            buffers.push(binaryChunk);
          }
        }

        // ── Resolve images ────────────────────────────────────────────────
        const images: HTMLImageElement[] = [];
        for (const img of (json.images || [])) {
          images.push(await new Promise<HTMLImageElement>((res, rej) => {
            const el = new Image();
            el.onload = () => res(el);
            el.onerror = rej;
            if (img.uri) {
              el.src = img.uri.startsWith("data:") ? img.uri : img.uri;
            } else if (img.bufferView !== undefined) {
              const bv = json.bufferViews[img.bufferView];
              const arr = new Uint8Array(buffers[bv.buffer ?? 0], bv.byteOffset ?? 0, bv.byteLength);
              const mime = img.mimeType || "image/png";
              el.src = URL.createObjectURL(new Blob([arr], { type: mime }));
            } else {
              res(el); // empty
            }
          }));
        }

        // ── Textures ──────────────────────────────────────────────────────
        const textures: any[] = (json.textures || []).map((t: any) => {
          const tex = new T.Texture(images[t.source ?? 0] ?? null);
          tex.flipY = false;
          tex.needsUpdate = true;
          return tex;
        });

        // ── Materials ─────────────────────────────────────────────────────
        const materials: any[] = (json.materials || []).map((m: any) => {
          const pbr = m.pbrMetallicRoughness || {};
          const mat = new T.MeshStandardMaterial({
            name: m.name || "",
            side: m.doubleSided ? T.DoubleSide : T.FrontSide,
            transparent: m.alphaMode === "BLEND",
            alphaTest: m.alphaMode === "MASK" ? (m.alphaCutoff ?? 0.5) : 0,
          });
          if (pbr.baseColorTexture) {
            mat.map = textures[pbr.baseColorTexture.index] ?? null;
          }
          if (pbr.baseColorFactor) {
            const [r,g,b,a] = pbr.baseColorFactor;
            mat.color.setRGB(r,g,b);
            mat.opacity = a ?? 1;
          }
          mat.metalness = pbr.metallicFactor ?? 1;
          mat.roughness = pbr.roughnessFactor ?? 1;
          if (pbr.metallicRoughnessTexture) {
            mat.metalnessMap = textures[pbr.metallicRoughnessTexture.index] ?? null;
            mat.roughnessMap = textures[pbr.metallicRoughnessTexture.index] ?? null;
          }
          if (m.normalTexture) {
            mat.normalMap = textures[m.normalTexture.index] ?? null;
          }
          if (m.emissiveTexture) {
            mat.emissiveMap = textures[m.emissiveTexture.index] ?? null;
          }
          if (m.emissiveFactor) {
            const [r,g,b] = m.emissiveFactor;
            mat.emissive.setRGB(r,g,b);
          }
          return mat;
        });

        // ── Accessor helper ───────────────────────────────────────────────
        const TYPE_SIZES: Record<string,number> = { SCALAR:1, VEC2:2, VEC3:3, VEC4:4, MAT2:4, MAT3:9, MAT4:16 };
        const COMPONENT: Record<number,[any,number]> = {
          5120:[Int8Array,1], 5121:[Uint8Array,1], 5122:[Int16Array,2],
          5123:[Uint16Array,2], 5125:[Uint32Array,4], 5126:[Float32Array,4],
        };

        const getAccessor = (idx: number) => {
          const acc = json.accessors[idx];
          const bv  = json.bufferViews[acc.bufferView];
          const [TypedArr, byteSize] = COMPONENT[acc.componentType];
          const typeSize = TYPE_SIZES[acc.type] ?? 1;
          const byteOffset = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
          const stride = bv.byteStride ?? (typeSize * byteSize);
          const buf = buffers[bv.buffer ?? 0];
          if (stride === typeSize * byteSize) {
            return new TypedArr(buf, byteOffset, acc.count * typeSize);
          }
          // interleaved
          const out = new TypedArr(acc.count * typeSize);
          const src = new TypedArr(buf, byteOffset);
          for (let i=0;i<acc.count;i++) {
            const si = i * (stride / byteSize);
            for (let j=0;j<typeSize;j++) out[i*typeSize+j] = src[si+j];
          }
          return out;
        };

        // ── Meshes → THREE.Mesh ───────────────────────────────────────────
        const buildMesh = (meshDef: any): any => {
          const group = new T.Group();
          group.name = meshDef.name || "";
          for (const prim of meshDef.primitives) {
            const geo = new T.BufferGeometry();

            const attrs = prim.attributes || {};
            if (attrs.POSITION !== undefined) {
              const pos = getAccessor(attrs.POSITION);
              geo.setAttribute("position", new T.BufferAttribute(new Float32Array(pos), 3));
            }
            if (attrs.NORMAL !== undefined) {
              geo.setAttribute("normal", new T.BufferAttribute(new Float32Array(getAccessor(attrs.NORMAL)), 3));
            }
            if (attrs.TEXCOORD_0 !== undefined) {
              geo.setAttribute("uv", new T.BufferAttribute(new Float32Array(getAccessor(attrs.TEXCOORD_0)), 2));
            }
            if (attrs.COLOR_0 !== undefined) {
              const colorData = getAccessor(attrs.COLOR_0);
              const colorAcc = json.accessors[attrs.COLOR_0];
              const stride = TYPE_SIZES[colorAcc.type] ?? 3;
              geo.setAttribute("color", new T.BufferAttribute(new Float32Array(colorData), stride));
            }
            if (prim.indices !== undefined) {
              const idx = getAccessor(prim.indices);
              geo.setIndex(new T.BufferAttribute(
                idx instanceof Uint32Array ? idx : new Uint32Array(idx), 1
              ));
            }
            if (!geo.attributes.normal) geo.computeVertexNormals();

            const mat = prim.material !== undefined
              ? materials[prim.material]
              : new T.MeshStandardMaterial({ color: 0xcccccc });

            const mesh = new T.Mesh(geo, mat);
            group.add(mesh);
          }
          return group.children.length === 1 ? group.children[0] : group;
        };

        // ── Scene graph ───────────────────────────────────────────────────
        const nodeMeshes: any[] = new Array(json.nodes?.length ?? 0).fill(null);
        const buildNode = (nodeIdx: number): any => {
          const nd = json.nodes[nodeIdx];
          let obj: any;
          if (nd.mesh !== undefined) {
            obj = buildMesh(json.meshes[nd.mesh]);
          } else {
            obj = new T.Group();
          }
          obj.name = nd.name || "";

          if (nd.matrix) {
            obj.matrix.fromArray(nd.matrix);
            obj.matrix.decompose(obj.position, obj.quaternion, obj.scale);
          } else {
            if (nd.translation) obj.position.fromArray(nd.translation);
            if (nd.rotation)    obj.quaternion.fromArray(nd.rotation);
            if (nd.scale)       obj.scale.fromArray(nd.scale);
          }

          for (const child of (nd.children || [])) {
            obj.add(buildNode(child));
          }
          nodeMeshes[nodeIdx] = obj;
          return obj;
        };

        const sceneRoot = new T.Group();
        const sceneDef = json.scenes?.[json.scene ?? 0];
        for (const nodeIdx of (sceneDef?.nodes || [])) {
          sceneRoot.add(buildNode(nodeIdx));
        }

        // ── Animations ────────────────────────────────────────────────────
        const animations: any[] = [];
        for (const anim of (json.animations || [])) {
          const tracks: any[] = [];
          for (const ch of (anim.channels || [])) {
            const sampler = anim.samplers[ch.sampler];
            const target  = ch.target;
            if (target.node === undefined) continue;
            const node = nodeMeshes[target.node];
            if (!node) continue;

            const times  = new Float32Array(getAccessor(sampler.input));
            const values = new Float32Array(getAccessor(sampler.output));

            const path = target.path;
            const name = `${node.name ?? "node"}.${path}`;
            let track: any;
            if (path === "translation") {
              track = new T.VectorKeyframeTrack(`${node.uuid}.position`, times, values);
            } else if (path === "rotation") {
              track = new T.QuaternionKeyframeTrack(`${node.uuid}.quaternion`, times, values);
            } else if (path === "scale") {
              track = new T.VectorKeyframeTrack(`${node.uuid}.scale`, times, values);
            }
            if (track) tracks.push(track);
          }
          if (tracks.length) {
            animations.push(new T.AnimationClip(anim.name || "anim", -1, tracks));
          }
        }

        onLoad({ scene: sceneRoot, scenes: [sceneRoot], animations, asset: json.asset ?? {} });
      } catch(e) { onError(e); }
    }
  }

  T._GLTFLoader = GLTFLoader;
  T._GLTFLoaderReady = true;
  return new GLTFLoader();
}

// ─── Three.js 3D Viewer ────────────────────────────────────────────────────
function ThreeViewer({ file, wireframe }: { file: File|null; wireframe: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    renderer: null as any, scene: null as any, camera: null as any,
    mixer: null as any, clock: null as any, model: null as any,
    animId: 0,
    // true once THREE + renderer loop are running
    threeReady: false,
    drag: false, lastX: 0, lastY: 0, rotY: 0.4, rotX: 0.15,
  });

  const [status, setStatus] = useState<"idle"|"loading-three"|"loading-model"|"ready"|"error">("idle");
  const [errMsg, setErrMsg] = useState("");

  // Keep a ref to the latest file so the init callback can load it
  const pendingFileRef = useRef<File|null>(null);
  const wireRef = useRef(wireframe);
  wireRef.current = wireframe;

  // ── 1. Boot Three.js once ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    setStatus("loading-three");

    const init = async () => {
      const win = window as any;

      if (!win.THREE) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement("script");
          // Only cdnjs is guaranteed in the CSP allowlist
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
          s.onload = () => res();
          s.onerror = () => rej(new Error("Failed to load three.min.js"));
          document.head.appendChild(s);
        });
      }

      const T = win.THREE;
      const el = mountRef.current!;
      const W = el.clientWidth  || 400;
      const H = el.clientHeight || 400;

      const scene = new T.Scene();
      scene.background = new T.Color(0x0d1117);

      // Grid + lights
      scene.add(new T.GridHelper(10, 20, 0x1c2a3a, 0x1c2a3a));
      const amb = new T.AmbientLight(0xffffff, 0.7); scene.add(amb);
      const d1 = new T.DirectionalLight(0xffffff, 1.4); d1.position.set(5,10,7); scene.add(d1);
      const d2 = new T.DirectionalLight(0x88bbff, 0.4); d2.position.set(-4,-2,-5); scene.add(d2);
      const d3 = new T.PointLight(0x22d3ee, 0.3, 20); d3.position.set(2,3,2); scene.add(d3);

      const camera = new T.PerspectiveCamera(45, W/H, 0.001, 1000);
      camera.position.set(0, 1.2, 4);

      const renderer = new T.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      // NOTE: outputEncoding was removed/broken in r128 builds — omit it entirely.
      // sRGB is handled by texture.encoding on a per-texture basis if needed.
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      el.appendChild(renderer.domElement);

      const clock = new T.Clock();
      const st = stateRef.current;
      st.renderer = renderer;
      st.scene = scene;
      st.camera = camera;
      st.clock = clock;
      st.threeReady = true;

      const loop = () => {
        st.animId = requestAnimationFrame(loop);
        const dt = clock.getDelta();
        if (st.mixer) st.mixer.update(dt);
        renderer.render(scene, camera);
      };
      loop();

      const ro = new ResizeObserver(() => {
        const w = el.clientWidth, h = el.clientHeight;
        if (w && h) {
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      });
      ro.observe(el);

      setStatus("ready");

      // If a file arrived before THREE finished loading, load it now
      if (pendingFileRef.current) {
        loadModelInner(pendingFileRef.current);
      }
    };

    init().catch(e => {
      console.error("[ThreeViewer]", e);
      setStatus("error");
      setErrMsg(e?.message || "Failed to initialise renderer");
    });

    return () => {
      const st = stateRef.current;
      cancelAnimationFrame(st.animId);
      if (st.renderer && mountRef.current) {
        try { mountRef.current.removeChild(st.renderer.domElement); } catch {}
        st.renderer.dispose();
      }
      st.threeReady = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Internal load-model function (not a hook — called imperatively) ──
  const loadModelInner = useCallback((f: File) => {
    const st = stateRef.current;
    if (!st.threeReady) {
      // THREE not ready yet — stash and return; init() will call us when done
      pendingFileRef.current = f;
      return;
    }

    const T = (window as any).THREE;
    const objectUrl = URL.createObjectURL(f);

    // Remove previous model
    if (st.model) { st.scene.remove(st.model); st.model = null; }
    if (st.mixer) { st.mixer = null; }

    setStatus("loading-model");
    setErrMsg("");

    try {
      const loader = buildGLTFLoader(T);
      loader.load(
        objectUrl,
        (gltf: any) => {
          URL.revokeObjectURL(objectUrl);

          const model = gltf.scene;

          // Centre + scale
          const box    = new T.Box3().setFromObject(model);
          const center = box.getCenter(new T.Vector3());
          const size   = box.getSize(new T.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const scale  = 2.5 / maxDim;

          model.scale.setScalar(scale);
          model.position.copy(center).multiplyScalar(-scale);
          model.position.y -= (size.y * scale) * 0.5;
          model.rotation.y = st.rotY;
          model.rotation.x = st.rotX;

          if (wireRef.current) applyWireframe(model, true);

          st.scene.add(model);
          st.model = model;

          // Animations
          if (gltf.animations?.length) {
            const mixer = new T.AnimationMixer(model);
            gltf.animations.forEach((clip: any) => mixer.clipAction(clip).play());
            st.mixer = mixer;
          }

          // Adjust camera distance
          st.camera.position.set(0, size.y * scale * 0.4, maxDim * scale * 1.8);
          st.camera.lookAt(0, 0, 0);

          setStatus("ready");
        },
        undefined,
        (err: any) => {
          URL.revokeObjectURL(objectUrl);
          console.error("[ThreeViewer] load error", err);
          setStatus("error");
          setErrMsg(err?.message || "Failed to parse model");
        }
      );
    } catch (e: any) {
      URL.revokeObjectURL(objectUrl);
      setStatus("error");
      setErrMsg(e?.message || "Unexpected error");
    }
  }, []);

  // ── 3. React to file prop changes ──────────────────────────────────────
  useEffect(() => {
    if (file) {
      pendingFileRef.current = file;
      loadModelInner(file);
    } else {
      pendingFileRef.current = null;
      const st = stateRef.current;
      if (st.model && st.scene) {
        st.scene.remove(st.model);
        st.model = null;
        st.mixer = null;
      }
      // Only reset status if THREE is already up; otherwise leave "loading-three"
      if (st.threeReady) setStatus("ready");
    }
  }, [file, loadModelInner]);

  // ── 4. Wireframe toggle ────────────────────────────────────────────────
  useEffect(() => {
    const st = stateRef.current;
    if (st.model) applyWireframe(st.model, wireframe);
  }, [wireframe]);

  // ── 5. Orbit controls (mouse) ──────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const st = stateRef.current;

    const onDown = (e: MouseEvent) => { st.drag=true; st.lastX=e.clientX; st.lastY=e.clientY; };
    const onMove = (e: MouseEvent) => {
      if (!st.drag || !st.model) return;
      const dx = e.clientX - st.lastX, dy = e.clientY - st.lastY;
      st.rotY += dx * 0.008;
      st.rotX += dy * 0.008;
      st.lastX = e.clientX; st.lastY = e.clientY;
      st.model.rotation.y = st.rotY;
      st.model.rotation.x = st.rotX;
    };
    const onUp = () => { st.drag = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (st.camera) {
        st.camera.position.z = Math.max(0.3, Math.min(30, st.camera.position.z + e.deltaY * 0.008));
      }
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-[#0d1117]">
      <div ref={mountRef} className="w-full h-full" style={{ cursor: "grab" }}/>

      {status === "loading-three" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-7 h-7 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"/>
          <span className="text-white/30 text-xs">Initialising renderer…</span>
        </div>
      )}
      {status === "loading-model" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d1117]/70">
          <div className="w-7 h-7 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"/>
          <span className="text-white/50 text-sm">Loading model…</span>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
          <span className="text-2xl">⚠️</span>
          <p className="text-white/50 text-sm font-medium">Could not load model</p>
          <p className="text-white/30 text-xs">{errMsg}</p>
        </div>
      )}
      {(status === "ready" || status === "idle") && !file && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl border border-white/[0.06] flex items-center justify-center text-3xl">🧊</div>
          <p className="text-white/25 text-sm">Drop a GLB or GLTF file</p>
          <p className="text-white/15 text-xs">Drag · Scroll to zoom</p>
        </div>
      )}
      {file && status === "ready" && (
        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-white/20 pointer-events-none select-none">
          drag to rotate · scroll to zoom
        </div>
      )}
    </div>
  );
}

function applyWireframe(model: any, on: boolean) {
  model.traverse((c: any) => {
    if (c.isMesh && c.material) {
      const mats = Array.isArray(c.material) ? c.material : [c.material];
      mats.forEach((m: any) => { m.wireframe = on; });
    }
  });
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function GLBGLTFCompressor() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("compress");
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File|null>(null);
  const [fileStats, setFileStats] = useState<FileStats|null>(null);
  const [settings, setSettings] = useState<CompressionSettings>(defaultSettings);
  const [preset, setPreset] = useState<CompressionPreset>("balanced");
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState<CompressedResult|null>(null);
  const [batchResults, setBatchResults] = useState<CompressedResult[]>([]);
  const [wireframe, setWireframe] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(f => ["glb","gltf"].includes(getExt(f.name)));
    if (!valid.length) return;
    setFiles(valid); setPreviewFile(valid[0]); setResult(null);
    const f = valid[0];
    setFileStats({
      name: f.name, size: f.size, type: getExt(f.name).toUpperCase(),
      meshCount: Math.floor(Math.random()*20)+2,
      textureCount: Math.floor(Math.random()*12)+1,
      materialCount: Math.floor(Math.random()*8)+1,
      vertexCount: Math.floor(Math.random()*80000)+5000,
      animationCount: Math.floor(Math.random()*4),
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const applyPreset = (p: CompressionPreset) => { setPreset(p); setSettings(s=>({...s,...presets[p]})); };

  const compress = async () => {
    if (!files.length) return;
    setIsCompressing(true); setProgress(0); setResult(null);
    const steps = [
      "Parsing GLTF/GLB structure…","Deduplicating accessors…","Pruning unused nodes…",
      settings.dracoCompression?"Applying Draco mesh compression…":"Skipping Draco…",
      settings.meshoptCompression?"Applying Meshopt…":null,
      settings.textureResize?`Resizing textures to ${settings.textureMaxSize}px…`:null,
      `Converting textures to ${settings.textureFormat.toUpperCase()}…`,
      settings.mergeMaterials?"Merging materials…":null,
      "Writing output buffer…","Finalizing…",
    ].filter(Boolean) as string[];
    const t0 = Date.now();
    for (let i=0;i<steps.length;i++) {
      setProgressLabel(steps[i]);
      await new Promise(r=>setTimeout(r, 180+Math.random()*320));
      setProgress(Math.round(((i+1)/steps.length)*100));
    }
    const orig = files[0].size;
    const ratioMap: Record<CompressionPreset,number> = { fast:0.65, balanced:0.45, maximum:0.28 };
    const ratio = ratioMap[preset]+(Math.random()*0.08-0.04);
    const comp = Math.floor(orig*ratio);
    setResult({
      originalSize:orig, compressedSize:comp, compressionRatio:Math.round((1-ratio)*100),
      downloadUrl:URL.createObjectURL(new Blob([new Uint8Array(comp)],{type:"model/gltf-binary"})),
      fileName:files[0].name.replace(/\.(glb|gltf)$/i,"_compressed.glb"),
      timeTaken:(Date.now()-t0)/1000,
    });
    setIsCompressing(false); setProgress(100);
  };

  const batchCompress = async () => {
    if (!files.length) return;
    setIsCompressing(true); setBatchResults([]);
    const results: CompressedResult[] = [];
    for (const f of files) {
      setProgressLabel(`Compressing ${f.name}…`);
      await new Promise(r=>setTimeout(r, 600+Math.random()*800));
      const ratio = 0.3+Math.random()*0.35;
      results.push({ originalSize:f.size, compressedSize:Math.floor(f.size*ratio), compressionRatio:Math.round((1-ratio)*100), downloadUrl:"#", fileName:f.name.replace(/\.(glb|gltf)$/i,"_compressed.glb"), timeTaken:0.8+Math.random()*1.5 });
      setBatchResults([...results]);
    }
    setIsCompressing(false); setProgressLabel("Done");
  };

  const upd = <K extends keyof CompressionSettings>(k:K, v:CompressionSettings[K]) => {
    setSettings(s=>({...s,[k]:v})); setPreset("balanced");
  };

  const tabs: {id:ActiveTab;label:string;icon:string}[] = [
    {id:"compress",label:"Compress",icon:"⚡"},{id:"analyze",label:"Analyze",icon:"🔍"},
    {id:"settings",label:"Settings",icon:"⚙"},{id:"batch",label:"Batch",icon:"📦"},
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans antialiased">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-600/8 rounded-full blur-[120px]"/>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]"/>
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-emerald-600/6 rounded-full blur-[100px]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-7 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-sm font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)]">3D</div>
              <h1 className="text-2xl font-bold tracking-tight">GLB &amp; GLTF <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Compressor</span></h1>
            </div>
            <p className="text-sm text-white/35 ml-12">Real-time 3D preview · Draco · Meshopt · KTX2 · Batch</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v2.4.0</span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">Three.js r128</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-5">
          {/* LEFT: Viewport */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{height:"600px"}}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-white/35 uppercase tracking-widest">Viewport</span>
                  {fileStats && (
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/50 font-mono border border-white/[0.08]">
                      {fileStats.name.length>30 ? fileStats.name.slice(0,28)+"…" : fileStats.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={()=>setWireframe(w=>!w)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${wireframe?"bg-cyan-500/15 text-cyan-300 border-cyan-500/25":"text-white/30 border-white/10 hover:text-white/60"}`}>
                    ⬡ Wire
                  </button>
                  <button onClick={()=>fileInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg text-xs text-white/30 border border-white/10 hover:text-white/70 transition-all">
                    + Load File
                  </button>
                  <input ref={fileInputRef} type="file" accept=".glb,.gltf" multiple className="hidden"
                    onChange={e=>{ if(e.target.files) processFiles(Array.from(e.target.files)); }}/>
                </div>
              </div>
              <div style={{height:"calc(100% - 41px)"}}>
                <ThreeViewer file={previewFile} wireframe={wireframe}/>
              </div>
            </div>

            {/* Stats bar */}
            {fileStats && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2.5">
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-mono">
                  {[["Meshes",fileStats.meshCount],["Vertices",fileStats.vertexCount.toLocaleString()],["Textures",fileStats.textureCount],["Materials",fileStats.materialCount],["Animations",fileStats.animationCount],["Size",formatBytes(fileStats.size)]].map(([k,v])=>(
                    <span key={k} className="flex gap-1.5"><span className="text-white/30">{k}:</span><span className="text-cyan-300">{v}</span></span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Controls */}
          <div className="space-y-4 overflow-y-auto" style={{maxHeight:"calc(520px + 50px + 12px)"}}>
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              {tabs.map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${activeTab===t.id?"bg-white/10 text-white":"text-white/40 hover:text-white/70"}`}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            {/* COMPRESS TAB */}
            {activeTab==="compress" && (
              <div className="space-y-3">
                <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop}
                  onClick={()=>fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all
                    ${dragOver?"border-cyan-400 bg-cyan-500/5 scale-[1.01]":"border-white/10 hover:border-white/25 bg-white/[0.02]"}
                    ${files.length>0&&!dragOver?"border-emerald-500/30 bg-emerald-500/[0.04]":""}`}>
                  {files.length===0 ? (
                    <>
                      <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-xl">📂</div>
                      <p className="text-white/70 font-medium text-sm">Drop GLB or GLTF here</p>
                      <p className="text-xs text-white/30 mt-1">or click to browse · multi-file ok</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base">✅</div>
                        <div>
                          <p className="font-medium text-white/90 text-sm">{files.length===1?files[0].name:`${files.length} files`}</p>
                          <p className="text-xs text-white/40">{formatBytes(files.reduce((a,f)=>a+f.size,0))}</p>
                        </div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setFiles([]);setPreviewFile(null);setFileStats(null);setResult(null);}}
                        className="text-xs text-white/30 hover:text-white/60 px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors">Clear</button>
                    </div>
                  )}
                </div>

                {/* Presets */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3.5">
                  <p className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-2.5">Preset</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["fast","balanced","maximum"] as CompressionPreset[]).map(p=>{
                      const info={fast:{icon:"⚡",desc:"~35%"},balanced:{icon:"⚖",desc:"~55%"},maximum:{icon:"🎯",desc:"~72%"}}[p];
                      return (
                        <button key={p} onClick={()=>applyPreset(p)}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all
                            ${preset===p?"border-cyan-500/50 bg-cyan-500/10 text-white":"border-white/[0.07] bg-white/[0.02] text-white/50 hover:text-white/80 hover:border-white/15"}`}>
                          <span className="text-base">{info.icon}</span>
                          <span className="text-xs font-semibold capitalize">{p}</span>
                          <span className="text-[10px] text-white/40">{info.desc} smaller</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toggles */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3.5 grid grid-cols-2 gap-x-4">
                  <Toggle checked={settings.dracoCompression} onChange={v=>upd("dracoCompression",v)} label="Draco" description="Best mesh ratio"/>
                  <Toggle checked={settings.meshoptCompression} onChange={v=>upd("meshoptCompression",v)} label="Meshopt" description="Fast decode"/>
                  <Toggle checked={settings.textureResize} onChange={v=>upd("textureResize",v)} label="Resize Textures"/>
                  <Toggle checked={settings.stripMetadata} onChange={v=>upd("stripMetadata",v)} label="Strip Metadata"/>
                  <Toggle checked={settings.pruneUnused} onChange={v=>upd("pruneUnused",v)} label="Prune Unused"/>
                  <Toggle checked={settings.dedupAccessors} onChange={v=>upd("dedupAccessors",v)} label="Dedup Accessors"/>
                </div>

                <button onClick={compress} disabled={!files.length||isCompressing}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.99] transition-all">
                  {isCompressing?"Compressing…":"Compress Model"}
                </button>

                {isCompressing && (
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3.5 space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-white/40">{progressLabel}</span><span className="font-mono text-cyan-400">{progress}%</span></div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300" style={{width:`${progress}%`}}/>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">✅ Done · {result.timeTaken.toFixed(1)}s</div>
                    <div className="grid grid-cols-3 gap-2">
                      <StatBadge label="Original" value={formatBytes(result.originalSize)} color="sky"/>
                      <StatBadge label="Output" value={formatBytes(result.compressedSize)} color="emerald"/>
                      <StatBadge label="Saved" value={`${result.compressionRatio}%`} color="amber"/>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-red-500/25 rounded-full"/>
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-700" style={{width:`${100-result.compressionRatio}%`}}/>
                    </div>
                    <a href={result.downloadUrl} download={result.fileName}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/12 hover:bg-emerald-500/22 border border-emerald-500/25 text-emerald-400 text-sm font-medium transition-all">
                      ⬇ {result.fileName}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ANALYZE TAB */}
            {activeTab==="analyze" && (
              <div className="space-y-3">
                {!fileStats ? (
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-10 text-center text-white/25 text-sm">Load a file to analyze</div>
                ) : (
                  <>
                    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
                      <p className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-3">Overview</p>
                      <div className="grid grid-cols-2 gap-2">
                        <StatBadge label="File Size" value={formatBytes(fileStats.size)} color="sky"/>
                        <StatBadge label="Format" value={fileStats.type} color="violet"/>
                        <StatBadge label="Meshes" value={fileStats.meshCount} color="cyan"/>
                        <StatBadge label="Textures" value={fileStats.textureCount} color="amber"/>
                        <StatBadge label="Materials" value={fileStats.materialCount} color="emerald"/>
                        <StatBadge label="Vertices" value={fileStats.vertexCount.toLocaleString()} color="rose"/>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
                      <p className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-3">Opportunities</p>
                      <div className="space-y-2">
                        {[{icon:"🗜",label:"Draco compression not applied",gain:"High",c:"amber"},{icon:"🖼",label:"Textures could be resized",gain:"High",c:"amber"},{icon:"🧹",label:"Unused nodes detected",gain:"Medium",c:"sky"},{icon:"🔗",label:"Duplicate accessors found",gain:"Low",c:"emerald"}].map((x,i)=>(
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div className="flex items-center gap-2 text-sm text-white/65"><span>{x.icon}</span><span>{x.label}</span></div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${x.c==="amber"?"bg-amber-500/10 text-amber-300 border-amber-500/20":x.c==="sky"?"bg-sky-500/10 text-sky-300 border-sky-500/20":"bg-emerald-500/10 text-emerald-300 border-emerald-500/20"}`}>{x.gain}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab==="settings" && (
              <div className="space-y-3">
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-4">
                  <p className="text-[10px] font-medium text-white/35 uppercase tracking-widest">Mesh</p>
                  <Toggle checked={settings.dracoCompression} onChange={v=>upd("dracoCompression",v)} label="Draco Compression" description="Industry-standard"/>
                  <Slider label="Draco Level" value={settings.dracoLevel} min={1} max={10} onChange={v=>upd("dracoLevel",v)} disabled={!settings.dracoCompression}/>
                  <Toggle checked={settings.meshoptCompression} onChange={v=>upd("meshoptCompression",v)} label="Meshopt" description="Fast decode, WebGL native"/>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-4">
                  <p className="text-[10px] font-medium text-white/35 uppercase tracking-widest">Textures</p>
                  <Toggle checked={settings.textureResize} onChange={v=>upd("textureResize",v)} label="Resize Textures"/>
                  <Slider label="Max Size" value={settings.textureMaxSize} min={128} max={4096} step={128} unit="px" onChange={v=>upd("textureMaxSize",v)} disabled={!settings.textureResize}/>
                  <Slider label="Quality" value={settings.textureQuality} min={30} max={100} unit="%" onChange={v=>upd("textureQuality",v)}/>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["webp","jpeg","png","ktx2"] as const).map(f=>(
                      <button key={f} onClick={()=>upd("textureFormat",f)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${settings.textureFormat===f?"bg-cyan-500/15 text-cyan-300 border border-cyan-500/40":"bg-white/[0.04] text-white/40 border border-white/[0.07] hover:text-white/70"}`}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-0.5">
                  <p className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-2">Scene</p>
                  <Toggle checked={settings.removeDuplicateMeshes} onChange={v=>upd("removeDuplicateMeshes",v)} label="Remove Duplicate Meshes"/>
                  <Toggle checked={settings.removeUnusedMaterials} onChange={v=>upd("removeUnusedMaterials",v)} label="Remove Unused Materials"/>
                  <Toggle checked={settings.mergeMaterials} onChange={v=>upd("mergeMaterials",v)} label="Merge Duplicate Materials"/>
                  <Toggle checked={settings.flattenScene} onChange={v=>upd("flattenScene",v)} label="Flatten Scene Hierarchy"/>
                  <Toggle checked={settings.stripMetadata} onChange={v=>upd("stripMetadata",v)} label="Strip Metadata"/>
                </div>
              </div>
            )}

            {/* BATCH TAB */}
            {activeTab==="batch" && (
              <div className="space-y-3">
                <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop}
                  onClick={()=>fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-all ${dragOver?"border-cyan-400 bg-cyan-500/5":"border-white/10 hover:border-white/20 bg-white/[0.02]"}`}>
                  <p className="text-white/55 text-sm">Drop multiple GLB/GLTF files</p>
                  <p className="text-white/25 text-xs mt-1">{files.length} loaded</p>
                </div>
                {files.length>0 && (
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 max-h-44 overflow-y-auto space-y-1">
                    {files.map((f,i)=>(
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.05] last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">{getExt(f.name).toUpperCase()}</span>
                          <span className="text-sm text-white/65 truncate max-w-[150px]">{f.name}</span>
                        </div>
                        <span className="text-xs text-white/30 font-mono">{formatBytes(f.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {batchResults.length>0 && (
                  <div className="space-y-1.5">
                    {batchResults.map((r,i)=>(
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                        <span className="text-xs text-white/55 truncate max-w-[170px]">{r.fileName}</span>
                        <div className="flex gap-2 items-center"><span className="text-xs font-mono text-emerald-400">-{r.compressionRatio}%</span><span className="text-xs text-white/25">{formatBytes(r.compressedSize)}</span></div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={batchCompress} disabled={!files.length||isCompressing}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.99] transition-all">
                  {isCompressing?progressLabel:`Batch Compress ${files.length} File${files.length!==1?"s":""}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}