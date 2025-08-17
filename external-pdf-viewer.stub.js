(function (global) {
  /* ========= ユーティリティ ========= */
  function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=res;s.onerror=()=>rej(new Error('Failed to load '+src));document.head.appendChild(s);});}
  const DefaultCdn = {
    pdfjs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.min.js",
    pdfjsWorker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.js",
    pdflib: "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js",
  };
  let SDK_CFG = { pdfjsUrl: DefaultCdn.pdfjs, pdfjsWorkerUrl: DefaultCdn.pdfjsWorker, pdflibUrl: DefaultCdn.pdflib };
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

  /* ========= ダミーPDFコンテンツ生成（pdf-lib使用） ========= */
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

      // Footer
      if(footer){[p1,p2,p3].forEach(pg=>{const {width}=pg.getSize();pg.drawText(footer,{x:60,y:30,size:10,font:font2,color:PDFLib.rgb(0.4,0.4,0.4)});pg.drawLine({start:{x:60,y:48},end:{x:width-60,y:48},thickness:.7,color:PDFLib.rgb(0.85,0.85,0.85)});});}

      return new Uint8Array(await pdf.save());
    },

    async sampleB(params){
      const { title="Sample B (Report)", subtitle="KPI Snapshot", footer="" } = params||{};
      const pdf = await PDFLib.PDFDocument.create();
      const font = await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const font2 = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);

      // Page 1
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


  /* ========= ビューワ描画（pdf.js使用） ========= */
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
    const c = state.refs.canvas, t = state.refs.textLayer;
    c.width = Math.floor(vp.width*dpr); c.height = Math.floor(vp.height*dpr);
    c.style.width = Math.floor(vp.width)+'px'; c.style.height = Math.floor(vp.height)+'px';
    t.style.width = c.style.width; t.style.height = c.style.height;
    state.renderTask = page.render({ canvasContext: state.ctx, viewport: vp, transform:[dpr,0,0,dpr,0,0] });
    try{ await state.renderTask.promise; }catch(e){ if(e?.name!=="RenderingCancelledException") throw e; }
    t.innerHTML='';
    if (state.textLayer){
      const textContent = await state.pdf.getPage(state.page).then(p=>p.getTextContent());
      pdfjsLib.renderTextLayer({ textContentSource:textContent, container:t, viewport:vp, textDivs:[] });
      if (state.layout==='search' && state.searchQuery){
        const q = state.searchQuery.toLowerCase();
        (textContent.items||[]).forEach(it=>{
          const s=(it.str||'').toLowerCase();
          if(q && s.includes(q) && it.transform){
            const [a,b,_,__,e,f]=it.transform, fontSize=Math.hypot(a,b);
            const w=(it.width||(q.length*fontSize*.5))*state.zoom, h=fontSize*state.zoom;
            const left=e*state.zoom, top=(vp.height-f*state.zoom)-h;
            const hl=document.createElement('div');
            hl.style.cssText=`position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px;background:rgba(255,230,0,.35);pointer-events:none;border-radius:2px;`;
            t.appendChild(hl);
          }
        });
      }
    }
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

  /* ========= レイアウト ========= */
  function collectRefs(state){
    const r=state.root;
    state.refs = {
      viewer: r.querySelector('[data-epv="viewer"]'),
      canvas: r.querySelector('[data-epv="canvas"]'),
      textLayer: r.querySelector('[data-epv="text"]'),
      pageNum: r.querySelector('[data-epv="pnum"]'),
      pageTotal: r.querySelector('[data-epv="ptotal"]'),
      prev: r.querySelector('[data-epv="prev"]'),
      next: r.querySelector('[data-epv="next"]'),
      zin: r.querySelector('[data-epv="zin"]'),
      zout: r.querySelector('[data-epv="zout"]'),
      fit: r.querySelector('[data-epv="fit"]'),
      rot: r.querySelector('[data-epv="rot"]'),
      reload: r.querySelector('[data-epv="reload"]'),
      thumbs: r.querySelector('[data-epv="thumbs"]'),
      q: r.querySelector('[data-epv="q"]'),
      find: r.querySelector('[data-epv="find"]'),
      clear: r.querySelector('[data-epv="clear"]')
    };
    state.ctx = state.refs.canvas.getContext('2d');
  }
  function bindCommon(state){
    const R=state.refs;
    if(R.prev) R.prev.onclick=()=>{ if(state.page>1){ state.page--; renderPage(state);} };
    if(R.next) R.next.onclick=()=>{ if(state.pdf && state.page<state.pdf.numPages){ state.page++; renderPage(state);} };
    if(R.zin)  R.zin.onclick =()=>{ state.zoom=Math.min(state.zoom+0.2,6); renderPage(state); };
    if(R.zout) R.zout.onclick=()=>{ state.zoom=Math.max(state.zoom-0.2,0.2); renderPage(state); };
    if(R.fit)  R.fit.onclick =()=> renderPage(state,{fitWidth:true});
    if(R.rot)  R.rot.onclick =()=>{ state.rotation=(state.rotation+90)%360; renderPage(state); };
    if(R.reload) R.reload.onclick=()=> state.reloadContent().catch(e=>alert('再生成失敗: '+e.message));
    if(R.find) R.find.onclick=()=>{ state.searchQuery=(R.q.value||'').trim(); renderPage(state); };
    if(R.clear) R.clear.onclick=()=>{ state.searchQuery=''; if(R.q) R.q.value=''; renderPage(state); };
  }
  const layouts = {
    simple(state){
      state.root.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;">
          <button data-epv="prev">前へ</button><button data-epv="next">次へ</button>
          <span>ページ: <span data-epv="pnum">-</span>/<span data-epv="ptotal">-</span></span>
          <button data-epv="zout">－</button><button data-epv="zin">＋</button>
          <button data-epv="fit">幅にフィット</button><button data-epv="rot">回転</button>
          <button data-epv="reload">コンテンツ再生成</button>
        </div>
        <div data-epv="viewer" style="position:relative;width:100%;height:calc(80vh - 56px);border:1px solid #eee;border-radius:10px;overflow:auto;padding:8px;">
          <canvas data-epv="canvas" style="display:block;margin:0 auto;max-width:100%;"></canvas>
          <div class="textLayer" data-epv="text" style="position:absolute;left:8px;top:8px;right:8px;bottom:8px;"></div>
        </div>`;
      collectRefs(state); bindCommon(state);
    },
    thumbs(state){
      state.root.innerHTML = `
        <div style="display:flex; gap:12px;">
          <aside style="width:180px;">
            <div style="padding:8px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;">
              <div>ページ: <span data-epv="pnum">-</span>/<span data-epv="ptotal">-</span></div>
              <div style="margin-top:6px;display:flex;gap:6px;"><button data-epv="prev">前</button><button data-epv="next">次</button></div>
              <div style="margin-top:8px;"><button data-epv="reload">再生成</button></div>
            </div>
            <ul data-epv="thumbs" style="padding:0;margin:0;max-height:65vh;overflow:auto;"></ul>
          </aside>
          <main style="flex:1;min-width:0;">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;">
              <button data-epv="zout">－</button><button data-epv="zin">＋</button>
              <button data-epv="fit">幅フィット</button><button data-epv="rot">回転</button>
            </div>
            <div data-epv="viewer" style="position:relative;width:100%;height:calc(80vh - 80px);border:1px solid #eee;border-radius:10px;overflow:auto;padding:8px;">
              <canvas data-epv="canvas" style="display:block;margin:0 auto;max-width:100%;"></canvas>
              <div class="textLayer" data-epv="text" style="position:absolute;left:8px;top:8px;right:8px;bottom:8px;"></div>
            </div>
          </main>
        </div>`;
      collectRefs(state); bindCommon(state);
    },
    search(state){
      state.root.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;">
          <button data-epv="prev">前へ</button><button data-epv="next">次へ</button>
          <span>ページ: <span data-epv="pnum">-</span>/<span data-epv="ptotal">-</span></span>
          <button data-epv="zout">－</button><button data-epv="zin">＋</button>
          <button data-epv="fit">幅にフィット</button><button data-epv="rot">回転</button>
          <input data-epv="q" type="text" placeholder="検索（ページ内）" style="min-width:180px;padding:6px 8px;border:1px solid #ddd;border-radius:6px;margin-left:auto;">
          <button data-epv="find">検索</button><button data-epv="clear">解除</button>
          <button data-epv="reload">再生成</button>
        </div>
        <div data-epv="viewer" style="position:relative;width:100%;height:calc(80vh - 56px);border:1px solid #eee;border-radius:10px;overflow:auto;padding:8px;">
          <canvas data-epv="canvas" style="display:block;margin:0 auto;max-width:100%;"></canvas>
          <div class="textLayer" data-epv="text" style="position:absolute;left:8px;top:8px;right:8px;bottom:8px;"></div>
        </div>`;
      collectRefs(state); bindCommon(state);
    }
  };

  /* ========= 公開API ========= */
  const ExternalPdfViewer = {
    setConfig, // 例: ExternalPdfViewer.setConfig({ pdfjsUrl: "...", pdfjsWorkerUrl: "..." })
    async mount(args){
      await ensurePdfJs(); await ensurePdfLib();
      const container = args.container; if(!container) throw new Error("container is required");
      const state = {
        root: container,
        layout: args.layout || "simple",
        page: 1, zoom: (args.options?.zoom ?? 1.1), rotation: (args.options?.rotation ?? 0),
        textLayer: true, searchQuery: "",
        events: args.events||{},
        contentId: args.contentId || "sampleA",
        contentParams: args.contentParams || {},
        refs: {}, ctx: null, pdf: null
      };
      // レイアウト構築
      container.innerHTML = "";
      if(!layouts[state.layout]) throw new Error("unknown layout: "+state.layout);
      layouts[state.layout](state);

      // コンテンツ生成→ロード→描画
      state.reloadContent = async ()=>{
        const gen = contentGenerators[state.contentId];
        if(!gen) throw new Error("unknown contentId: "+state.contentId);
        const bytes = await gen(state.contentParams);
        state.pdf && state.pdf.destroy && state.pdf.destroy();
        state.pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        state.page = 1;
        await renderPage(state, { fitWidth: true });
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
          if(needRerender) return renderPage(state,{fitWidth:true});
        },
        destroy(){ try{ state.renderTask && state.renderTask.cancel(); state.pdf && state.pdf.destroy(); state.root.innerHTML=""; }catch(e){} }
      };
    }
  };

  // UMD公開
  global.ExternalPdfViewer = ExternalPdfViewer;
})(window);
