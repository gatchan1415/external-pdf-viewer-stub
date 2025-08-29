(function (global) {
  /* ========= Utilities ========= */
  function loadScript(src){
    return new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src=src; s.async=true;
      s.onload=res;
      s.onerror=()=>rej(new Error('Failed to load '+src));
      document.head.appendChild(s);
    });
  }
  const DefaultCdn = {
    pdfjs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js",
    pdfjsWorker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js",
    pdflib: "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js",
  };
  let SDK_CFG = { 
    pdfjsUrl: DefaultCdn.pdfjs, 
    pdfjsWorkerUrl: DefaultCdn.pdfjsWorker, 
    pdflibUrl: DefaultCdn.pdflib 
  };
  function setConfig(cfg){ SDK_CFG = {...SDK_CFG, ...(cfg||{})}; }
  async function ensurePdfJs(){
    if(global.pdfjsLib) return;
    await loadScript(SDK_CFG.pdfjsUrl);
    global.pdfjsLib.GlobalWorkerOptions.workerSrc = SDK_CFG.pdfjsWorkerUrl;
  }
  async function ensurePdfLib(){
    if(global.PDFLib) return;
    await loadScript(SDK_CFG.pdflibUrl);
  }
  const el = (h)=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild;};

  /* ========= Dummy PDF content generators (using pdf-lib) ========= */
  const contentGenerators = {
    async sampleA(params){
      const { title="Sample A", subtitle="Overview", footer="" } = params||{};
      const pdf = await PDFLib.PDFDocument.create();
      const font = await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const font2 = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);

      // Page 1
      const p1 = pdf.addPage([595.28, 841.89]);
      const { width, height } = p1.getSize();
      p1.drawText(title,{x:60,y:height-100,size:28,font,color:PDFLib.rgb(0.1,0.1,0.3)});
      p1.drawText(subtitle,{x:60,y:height-140,size:16,font:font2,color:PDFLib.rgb(0.2,0.2,0.2)});
      p1.drawLine({start:{x:60,y:height-150},end:{x:width-60,y:height-150},thickness:1,color:PDFLib.rgb(0.8,0.8,0.8)});
      [
        "This is a stub-generated PDF.",
        "Displayed with contentId=sampleA.",
        "You can pass custom contentParams.",
        "Useful for UI confirmation before production."
      ].forEach((line,i)=>p1.drawText("• "+line,{x:60,y:height-200-i*24,size:12,font:font2,color:PDFLib.rgb(0.15,0.15,0.15)}));

      // Page 2
      const p2 = pdf.addPage([595.28,841.89]);
      p2.drawText("Page 2: Table-like content",{x:60,y:780,size:16,font,color:PDFLib.rgb(0.1,0.1,0.3)});
      const cols=["Item","Value","Note"], rows=[["A-1","123","dummy"],["B-2","456","dummy"],["C-3","789","dummy"]], X=[60,200,320];
      p2.drawLine({start:{x:60,y:760},end:{x:535,y:760},thickness:1,color:PDFLib.rgb(0.8,0.8,0.8)});
      cols.forEach((c,i)=>p2.drawText(c,{x:X[i],y:740,size:12,font,color:PDFLib.rgb(0.2,0.2,0.2)}));
      p2.drawLine({start:{x:60,y:730},end:{x:535,y:730},thickness:1,color:PDFLib.rgb(0.8,0.8,0.8)});
      rows.forEach((r,ri)=>{const y=710-ri*22; r.forEach((cell,ci)=>p2.drawText(String(cell),{x:X[ci],y,size:11,font:font2}));});

      // Page 3
      const p3 = pdf.addPage([595.28,841.89]);
      p3.drawText("Page 3: Extra notes",{x:60,y:780,size:16,font,color:PDFLib.rgb(0.1,0.1,0.3)});
      p3.drawText("Additional page for testing three-page structure.",{x:60,y:740,size:12,font:font2});

      if(footer){[p1,p2,p3].forEach(pg=>{const {width}=pg.getSize();pg.drawText(footer,{x:60,y:30,size:10,font:font2,color:PDFLib.rgb(0.4,0.4,0.4)});pg.drawLine({start:{x:60,y:48},end:{x:width-60,y:48},thickness:.7,color:PDFLib.rgb(0.85,0.85,0.85)});});}

      return new Uint8Array(await pdf.save());
    },

    async sampleB(params){
      const { title="Sample B (Report)", subtitle="KPI Snapshot", footer="" } = params||{};
      const pdf = await PDFLib.PDFDocument.create();
      const font = await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const font2 = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);

      // Page 1 (landscape)
      const p1 = pdf.addPage([841.89, 595.28]);
      const { width, height } = p1.getSize();
      p1.drawText(title,{x:50,y:height-60,size:24,font,color:PDFLib.rgb(0.1,0.2,0.35)});
      p1.drawText(subtitle,{x:50,y:height-90,size:14,font:font2,color:PDFLib.rgb(0.2,0.2,0.2)});
      const cards=[{label:"Revenue",value:"$1,234,567"},{label:"New Users",value:"1,234"},{label:"Retention",value:"92%"},{label:"Churn",value:"1.5%"}];
      cards.forEach((c,i)=>{const x=50+i*185,y=height-160;p1.drawRectangle({x,y,width:170,height:90,color:PDFLib.rgb(0.95,0.97,1),borderColor:PDFLib.rgb(0.8,0.86,1),borderWidth:1});p1.drawText(c.label,{x:x+12,y:y+60,size:12,font:font2,color:PDFLib.rgb(0.2,0.2,0.5)});p1.drawText(c.value,{x:x+12,y:y+30,size:18,font,color:PDFLib.rgb(0.1,0.15,0.35)});});

      // Page 2
      const p2 = pdf.addPage([841.89, 595.28]);
      p2.drawText("Page 2: Monthly Metrics (Dummy Data)",{x:50,y:height-60,size:16,font});
      const baseX=80,baseY=260,w=40,g=30,vals=[3,5,2,6,4];
      vals.forEach((v,i)=>p2.drawRectangle({x:baseX+i*(w+g),y:baseY,width:w,height:v*30,color:PDFLib.rgb(0.2,0.5,0.9),opacity:.8}));

      // Page 3
      const p3 = pdf.addPage([841.89, 595.28]);
      p3.drawText("Page 3: Extra Report Notes",{x:50,y:height-60,size:16,font});
      p3.drawText("This page is added to ensure sampleB has 3 pages.",{x:50,y:height-90,size:12,font:font2});

      if(footer) [p1,p2,p3].forEach(pg=>pg.drawText(footer,{x:50,y:20,size:10,font:font2,color:PDFLib.rgb(0.4,0.4,0.4)}));

      return new Uint8Array(await pdf.save());
    },

    async sampleC(params){
      const { title="Sample C (Form)", subtitle="Details", footer="" } = params||{};
      const pdf = await PDFLib.PDFDocument.create();
      const f = await pdf.embedFont(PDFLib.StandardFonts.TimesRoman);
      const fb = await pdf.embedFont(PDFLib.StandardFonts.TimesRomanBold);

      // Page 1
      const p1 = pdf.addPage([595.28, 841.89]);
      const { width, height } = p1.getSize();
      p1.drawText(title,{x:60,y:height-80,size:22,font:fb});
      p1.drawText(subtitle,{x:60,y:height-110,size:14,font:f});
      const cols=["Item","Qty","Unit Price","Subtotal"], rows=[["Apple","10","$1.20","$12.00"],["Banana","8","$0.90","$7.20"],["Orange","12","$0.80","$9.60"]], X=[60,260,340,420];
      p1.drawLine({start:{x:60,y:height-125},end:{x:width-60,y:height-125}});
      cols.forEach((c,i)=>p1.drawText(c,{x:X[i],y:height-145,size:12,font:fb}));
      p1.drawLine({start:{x:60,y:height-155},end:{x:width-60,y:height-155}});
      rows.forEach((r,ri)=>{const y=height-175-ri*20; r.forEach((cell,ci)=>p1.drawText(String(cell),{x:X[ci],y,size:12,font:f}));});
      p1.drawLine({start:{x:60,y:height-245},end:{x:width-60,y:height-245}});
      p1.drawText("Total: $28.80",{x:width-180,y:height-265,size:14,font:fb});

      // Page 2
      const p2 = pdf.addPage([595.28,841.89]);
      p2.drawText("Page 2: Additional form section",{x:60,y:780,size:16,font:fb});
      p2.drawText("This is the second page of sampleC.",{x:60,y:740,size:12,font:f});

      // Page 3
      const p3 = pdf.addPage([595.28,841.89]);
      p3.drawText("Page 3: Appendix",{x:60,y:780,size:16,font:fb});
      p3.drawText("This is the third page of sampleC.",{x:60,y:740,size:12,font:f});

      if(footer) [p1,p2,p3].forEach(pg=>pg.drawText(footer,{x:60,y:30,size:10,font:f,color:PDFLib.rgb(0.4,0.4,0.4)}));

      return new Uint8Array(await pdf.save());
    }
  };

  /* ========= Viewer rendering (pdf.js) ========= */
  async function renderPage(state, opts){
    if(!state.pdf) return;
    if(state.renderTask){ state.renderTask.cancel(); state.renderTask=null; }
    const page = await state.pdf.getPage(state.page);
    let vp = page.getViewport({ scale: state.zoom, rotation: state.rotation });

    if (opts && opts.fitWidth && state.refs.viewer){
      const pad=16, target=state.refs.viewer.clientWidth-pad, ratio=target/vp.width;
      state.zoom *= ratio; vp = page.getViewport({ scale: state.zoom, rotation: state.rotation });
    }

    const dpr = global.devicePixelRatio || 1;
    const c = state.refs.canvas, stage = state.refs.stage;
    c.width = Math.floor(vp.width*dpr); c.height = Math.floor(vp.height*dpr);
    c.style.width = Math.floor(vp.width)+'px'; c.style.height = Math.floor(vp.height)+'px';

    if (stage){
      stage.style.width  = c.style.width;
      stage.style.height = c.style.height;
    }

    state.renderTask = page.render({ canvasContext: state.ctx, viewport: vp, transform:[dpr,0,0,dpr,0,0] });
    try{ await state.renderTask.promise; }catch(e){ if(e?.name!=="RenderingCancelledException") throw e; }

    // Zoom表示
    if (state.refs.zdisp) state.refs.zdisp.textContent = `Zoom: ${(state.zoom*100).toFixed(0)}%`;

    if(state.refs.pageNum) state.refs.pageNum.textContent=String(state.page);
    if(state.refs.pageTotal) state.refs.pageTotal.textContent=String(state.pdf.numPages);
    if(state.refs.prev) state.refs.prev.disabled = (state.page<=1);
    if(state.refs.next) state.refs.next.disabled = (state.page>=state.pdf.numPages);
    if(state.layout==='thumbs' && state.refs.thumbs && !state._thumbsBuilt){ state._thumbsBuilt=true; buildThumbs(state).catch(console.error); }
    state.events.onPageChange && state.events.onPageChange(state.page, state.pdf.numPages);
  }

  async function buildThumbs(state){
    const ul=state.refs.thumbs; ul.innerHTML='';
    for(let i=1;i<=state.pdf.numPages;i++){
      const li=el(`<li style="list-style:none;margin:6px 0;"><canvas style="width:100%;display:block;border:1px solid #eee;border-radius:6px;"></canvas></li>`);
      ul.appendChild(li);
      const cv=li.querySelector('canvas'), ctx=cv.getContext('2d');
      const page=await state.pdf.getPage(i), vp=page.getViewport({ scale:.2 });
      cv.width=vp.width; cv.height=vp.height;
      await page.render({ canvasContext:ctx, viewport:vp }).promise;
      li.style.cursor='pointer'; li.onclick=()=>{ state.page=i; renderPage(state); };
    }
  }

  /* ========= Layouts ========= */
  function collectRefs(state){
    const r=state.root;
    state.refs = {
      viewer: r.querySelector('[data-epv="viewer"]'),
      stage: r.querySelector('[data-epv="stage"]'),
      canvas: r.querySelector('[data-epv="canvas"]'),
      pageNum: r.querySelector('[data-epv="pnum"]'),
      pageTotal: r.querySelector('[data-epv="ptotal"]'),
      zdisp: r.querySelector('[data-epv="zdisp"]'),
      prev: r.querySelector('[data-epv="prev"]'),
      next: r.querySelector('[data-epv="next"]'),
      zin: r.querySelector('[data-epv="zin"]'),
      zout: r.querySelector('[data-epv="zout"]'),
      fit: r.querySelector('[data-epv="fit"]'),
      rot: r.querySelector('[data-epv="rot"]'),
      reload: r.querySelector('[data-epv="reload"]'),
      thumbs: r.querySelector('[data-epv="thumbs"]'),
    };
    state.ctx = state.refs.canvas.getContext('2d');
  }

  function bindCommon(state){
    const R=state.refs;
    const on = (el, fn)=> el && el.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); fn(); });

    on(R.prev, ()=>{ if(state.page>1){ state.page--; renderPage(state);} });
    on(R.next, ()=>{ if(state.pdf && state.page<state.pdf.numPages){ state.page++; renderPage(state);} });
    on(R.zin,  ()=>{ state.zoom=Math.min(state.zoom+0.2,6); renderPage(state); });
    on(R.zout, ()=>{ state.zoom=Math.max(state.zoom-0.2,0.2); renderPage(state); });
    on(R.fit,  ()=> renderPage(state,{fitWidth:true}));   // ← ボタンでのみ Fit Width
    on(R.rot,  ()=>{ state.rotation=(state.rotation+90)%360; renderPage(state); });
    on(R.reload, ()=> state.reloadContent().catch(e=>alert('Reload failed: '+e.message)));

    // ピンチズーム：ctrl+スクロール & iOS gesture
    R.viewer.addEventListener('wheel', (e)=>{
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        if (delta > 0) state.zoom = Math.min(state.zoom * 1.1, 6);
        else           state.zoom = Math.max(state.zoom / 1.1, 0.2);
        renderPage(state);
      }
    }, { passive:false });

    let baseScale = null;
    function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
    R.viewer.addEventListener('gesturestart', ()=>{ baseScale = state.zoom; });
    R.viewer.addEventListener('gesturechange', (e)=>{
      if (baseScale==null) return;
      state.zoom = clamp(baseScale * e.scale, 0.2, 6);
      renderPage(state);
    });
    R.viewer.addEventListener('gestureend', ()=>{ baseScale=null; });
  }

  const toolbarHtml = `
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;">
      <button type="button" data-epv="prev">Prev</button><button type="button" data-epv="next">Next</button>
      <span>Page: <span data-epv="pnum">-</span>/<span data-epv="ptotal">-</span></span>
      <button type="button" data-epv="zout">−</button><button type="button" data-epv="zin">＋</button>
      <span data-epv="zdisp" style="min-width:80px;">Zoom: 100%</span>
      <button type="button" data-epv="fit">Fit Width</button><button type="button" data-epv="rot">Rotate</button>
      <button type="button" data-epv="reload">Reload</button>
    </div>`;

  const viewerShell = (h) => `
    ${h}
    <div data-epv="viewer" style="position:relative;width:100%;height:calc(80vh - 56px);border:1px solid #eee;border-radius:10px;overflow:auto;padding:8px;touch-action:none;">
      <div data-epv="stage" style="position:relative;margin:0 auto;width:fit-content;">
        <canvas data-epv="canvas" style="display:block;max-width:100%;"></canvas>
      </div>
    </div>`;

  const layouts = {
    simple(state){
      state.root.innerHTML = viewerShell(toolbarHtml);
      collectRefs(state); bindCommon(state);
    },
    thumbs(state){
      state.root.innerHTML = `
        <div style="display:flex; gap:12px;">
          <aside style="width:180px;">
            <div style="padding:8px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;">
              <div>Page: <span data-epv="pnum">-</span>/<span data-epv="ptotal">-</span></div>
              <div style="margin-top:6px;display:flex;gap:6px;"><button type="button" data-epv="prev">Prev</button><button type="button" data-epv="next">Next</button></div>
              <div style="margin-top:8px;"><button type="button" data-epv="reload">Reload</button></div>
            </div>
            <ul data-epv="thumbs" style="padding:0;margin:0;max-height:65vh;overflow:auto;"></ul>
          </aside>
          <main style="flex:1;min-width:0;">
            ${viewerShell(`
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;">
                <button type="button" data-epv="zout">−</button><button type="button" data-epv="zin">＋</button>
                <span data-epv="zdisp" style="min-width:80px;">Zoom: 100%</span>
                <button type="button" data-epv="fit">Fit Width</button><button type="button" data-epv="rot">Rotate</button>
              </div>
            `)}
          </main>
        </div>`;
      collectRefs(state); bindCommon(state);
    }
  };

  /* ========= Public API ========= */
  const ExternalPdfViewer = {
    setConfig,
    async mount(args){
      await ensurePdfJs(); await ensurePdfLib();
      const container = args.container; if(!container) throw new Error("container is required");
      const state = {
        root: container,
        layout: args.layout || "simple",
        page: 1,
        zoom: (args.options?.zoom ?? 1.0),   // デフォルト100%
        rotation: (args.options?.rotation ?? 0),
        events: args.events||{},
        contentId: args.contentId || "sampleA",
        contentParams: args.contentParams || {},
        refs: {}, ctx: null, pdf: null
      };
      container.innerHTML = "";
      if(!layouts[state.layout]) throw new Error("unknown layout: "+state.layout);
      layouts[state.layout](state);

      state.reloadContent = async ()=>{
        const gen = contentGenerators[state.contentId];
        if(!gen) throw new Error("unknown contentId: "+state.contentId);
        const bytes = await gen(state.contentParams);
        if(state.pdf && state.pdf.destroy) try{ state.pdf.destroy(); }catch(_e){}
        state.pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        state.page = 1;
        // ★ 初回ロード：fitWidth しない
        await renderPage(state);
      };
      await state.reloadContent();

      return {
        update(patch){
          if(!patch) return;
          let needReload=false, needRerender=false;
          if(patch.layout && patch.layout!==state.layout){
            state.layout = patch.layout;
            state.root.innerHTML=""; layouts[state.layout](state);
            needRerender = true;
          }
          if(patch.contentId){ state.contentId = patch.contentId; needReload = true; }
          if(patch.contentParams){ state.contentParams = {...state.contentParams, ...patch.contentParams}; needReload = true; }
          if(patch.options){
            if(typeof patch.options.zoom==='number'){ state.zoom=patch.options.zoom; needRerender=true; }
            if(typeof patch.options.rotation==='number'){ state.rotation=patch.options.rotation; needRerender=true; }
          }
          if(needReload) return state.reloadContent();
          // ★ update の再描画：fitWidth しない
          if(needRerender) return renderPage(state);
        },
        destroy(){ 
          try{ state.renderTask && state.renderTask.cancel(); }catch(_e){}
          try{ state.pdf && state.pdf.destroy(); }catch(_e){}
          state.root.innerHTML="";
        }
      };
    }
  };

  // UMD export
  global.ExternalPdfViewer = ExternalPdfViewer;
})(window);
