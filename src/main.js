(function(){
  "use strict";

  /* ---------------------------------------------------------------- */
  /* DATA MODEL                                                        */
  /* ---------------------------------------------------------------- */
  var CAT_COLOR = {
    "Water & Drainage": "var(--cat-water)",
    "Healthcare": "var(--cat-healthcare)",
    "Education": "var(--cat-education)",
    "Roads & Buildings": "var(--cat-other)"
  };
  var SEV_COLOR = function(sev){
    if(sev >= 7) return "var(--critical)";
    if(sev >= 5) return "var(--warning)";
    return "var(--good)";
  };

  var issues = [
    { category:"Healthcare", problem:"Limited healthcare access in the northern residential area.", location:"Northern Residential Zone (Sector 61)", severity:8.5, priority:"HIGH", zone:"healthcare-zone" },
    { category:"Water & Drainage", problem:"Building-dense area with limited nearby drainage coverage.", location:"Sector 62, Block C–D", severity:7.8, priority:"HIGH", zone:"water-zone" },
    { category:"Water & Drainage", problem:"Water pipeline network does not extend to newly developed blocks.", location:"Sector 63 Extension", severity:7.2, priority:"HIGH", zone:"water-zone" },
    { category:"Healthcare", problem:"No clinic within 2 km of a dense residential cluster.", location:"Northern Residential Zone (Sector 61)", severity:7.6, priority:"HIGH", zone:"healthcare-zone" },
    { category:"Education", problem:"Low availability of educational facilities in the eastern region.", location:"Eastern Region (Sector 63)", severity:6.2, priority:"MEDIUM", zone:"education-zone" },
    { category:"Healthcare", problem:"Single hospital reported serving three residential sectors.", location:"Sector 61–62 Boundary", severity:6.8, priority:"MEDIUM", zone:"healthcare-zone" },
    { category:"Education", problem:"College access requires travel outside the sector boundary.", location:"Eastern Region (Sector 63)", severity:5.9, priority:"MEDIUM", zone:"education-zone" },
    { category:"Roads & Buildings", problem:"Secondary road lacks a drainage tie-in at its intersection.", location:"Sector 62, Road R-4", severity:5.4, priority:"MEDIUM", zone:"water-zone" },
    { category:"Water & Drainage", problem:"Isolated building cluster sits outside the drainage service radius.", location:"Sector 63, Block F", severity:4.8, priority:"LOW", zone:"water-zone" },
    { category:"Education", problem:"School catchment overlap creates uneven enrolment pressure.", location:"Sector 61", severity:4.1, priority:"LOW", zone:"education-zone" }
  ];

  var recs = [
    { category:"Healthcare Services", problem:"Poor accessibility to healthcare facilities.", location:"Northern Residential Zone", reason:"High building density combined with a large distance from existing healthcare facilities.", severity:8.5, priority:"HIGH", action:"Consider establishing a healthcare facility or improving access to the nearest existing facility.", zone:"healthcare-zone" },
    { category:"Water & Drainage", problem:"Drainage network does not reach building-dense blocks.", location:"Sector 62, Block C–D", reason:"Rapid residential densification has outpaced the extension of drainage lines mapped in the source data.", severity:7.8, priority:"HIGH", action:"Extend drainage network to Block C–D or install interim stormwater management.", zone:"water-zone" },
    { category:"Water & Drainage", problem:"Water pipeline gap in a newly developed extension.", location:"Sector 63 Extension", reason:"Pipeline network mapped in the GeoJSON ends roughly 400m short of the new blocks.", severity:7.2, priority:"HIGH", action:"Extend water distribution mains to cover Sector 63 Extension.", zone:"water-zone" },
    { category:"Healthcare Services", problem:"Single hospital overburdened across three sectors.", location:"Sector 61–62 Boundary", reason:"One hospital is reported serving a catchment population beyond typical planning norms.", severity:6.8, priority:"MEDIUM", action:"Evaluate establishing a satellite clinic to redistribute patient load.", zone:"healthcare-zone" },
    { category:"Education Services", problem:"Low availability of educational facilities in the eastern region.", location:"Eastern Region (Sector 63)", reason:"Only one school and no college fall within a 3 km radius of a growing population.", severity:6.2, priority:"MEDIUM", action:"Plan a new school or improve transport access to existing institutions.", zone:"education-zone" },
    { category:"Education Services", problem:"College access requires travel outside the sector boundary.", location:"Eastern Region (Sector 63)", reason:"No higher-education facility is present within the sector's road network.", severity:5.9, priority:"MEDIUM", action:"Coordinate with neighbouring sectors on a shared transport link or a new campus site.", zone:"education-zone" }
  ];

  var history = {
    "Patiala Sector 61–63 Analysis": "Full analysis of 612 GeoJSON features covering buildings, roads, healthcare, education, water and drainage networks. Power outage data was not present in the source file and was correctly excluded rather than estimated. Generated 24 detected issues and 18 recommendations across 4 supported analysis modules.",
    "Urban Area Infrastructure Analysis": "Pilot analysis of Sector 22 covering roads, buildings and healthcare facilities only — the uploaded file did not include education, water, or drainage layers, so those modules were marked unavailable. Generated 16 detected issues and 12 recommendations."
  };

  /* ---------------------------------------------------------------- */
  /* UTIL                                                               */
  /* ---------------------------------------------------------------- */
  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  function $all(sel, ctx){ return Array.prototype.slice.call((ctx||document).querySelectorAll(sel)); }
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------------------------------------------------------------- */
  /* SIDEBAR NAV + SCROLLSPY                                            */
  /* ---------------------------------------------------------------- */
  var navlinks = $all(".navlink");
  navlinks.forEach(function(btn){
    btn.addEventListener("click", function(){
      var target = document.getElementById(btn.dataset.target);
      if(target){ target.scrollIntoView({behavior:"smooth", block: btn.dataset.target === "dashboard-top" ? "start" : "start"}); }
      closeSidebar();
    });
  });
  var sectionIds = ["upload-section","map-section","issues-section","rec-section","history-section","settings-section"];
  var sections = sectionIds.map(function(id){ return document.getElementById(id); }).filter(Boolean);
  function setActiveByHash(id){
    navlinks.forEach(function(l){ l.classList.toggle("active", l.dataset.target === id); });
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ setActiveByHash(e.target.id); }
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
  sections.forEach(function(s){ io.observe(s); });

  /* mobile sidebar */
  var sidebar = $("#sidebar"), scrim = $("#sidebarScrim");
  $("#menuBtn").addEventListener("click", function(){ sidebar.classList.add("open"); scrim.classList.add("show"); });
  function closeSidebar(){ sidebar.classList.remove("open"); scrim.classList.remove("show"); }
  scrim.addEventListener("click", closeSidebar);

  /* ---------------------------------------------------------------- */
  /* THEME                                                              */
  /* ---------------------------------------------------------------- */
  var root = document.documentElement;
  var themeBtns = $all("#themeSwitch button");
  // Dark is the product's default identity (a console you'd run in a dim ops
  // room), so "dark" simply means no override attribute at all — the bare
  // :root tokens already are the dark palette. "light" is the one explicit,
  // opt-in accessibility choice.
  function applyTheme(choice){
    if(choice === "light"){ root.setAttribute("data-theme","light"); }
    else { root.removeAttribute("data-theme"); choice = "dark"; }
    themeBtns.forEach(function(b){ b.classList.toggle("active", b.dataset.themeChoice === choice); });
    try{ localStorage.setItem("siars-theme", choice); }catch(e){}
  }
  themeBtns.forEach(function(b){ b.addEventListener("click", function(){ applyTheme(b.dataset.themeChoice); }); });
  (function initTheme(){
    var saved = "dark";
    try{ saved = localStorage.getItem("siars-theme") || "dark"; }catch(e){}
    applyTheme(saved);
  })();

  /* ---------------------------------------------------------------- */
  /* UPLOAD FLOW                                                        */
  /* ---------------------------------------------------------------- */
  var dropzone = $("#dropzone"), fileInput = $("#fileInput"), browseBtn = $("#browseBtn");
  var statusRow = $("#statusRow"), statusText = $("#statusText"), progressFill = $("#progressFill"), doneRow = $("#doneRow");
  var fileName = $("#fileName"), fileMeta = $("#fileMeta");
  var availTags = $("#availTags"), uploadStateTag = $("#uploadStateTag");

  var KNOWN = {
    buildings: /building/i, roads: /road|highway|street/i,
    healthcare: /hospital|clinic|health/i, education: /school|college|education/i,
    water: /water|pipe(line)?/i, drainage: /drain|sewer|storm/i,
    power: /power|electric|outage|transformer|substation/i
  };

  browseBtn.addEventListener("click", function(e){ e.stopPropagation(); fileInput.click(); });
  dropzone.addEventListener("click", function(){ fileInput.click(); });
  dropzone.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ fileInput.click(); } });
  ["dragenter","dragover"].forEach(function(ev){
    dropzone.addEventListener(ev, function(e){ e.preventDefault(); dropzone.classList.add("dragover"); });
  });
  ["dragleave","drop"].forEach(function(ev){
    dropzone.addEventListener(ev, function(e){ e.preventDefault(); dropzone.classList.remove("dragover"); });
  });
  dropzone.addEventListener("drop", function(e){
    var f = e.dataTransfer.files && e.dataTransfer.files[0];
    if(f) handleFile(f);
  });
  fileInput.addEventListener("change", function(){
    if(fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  function handleFile(file){
    fileName.textContent = file.name;
    fileMeta.textContent = (file.size/1024).toFixed(0) + " KB · reading file…";
    doneRow.style.display = "none";
    statusRow.style.display = "flex";
    statusText.textContent = "Reading file…";
    progressFill.style.width = "10%";
    uploadStateTag.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/></svg> Processing…';

    setTimeout(function(){
      progressFill.style.width = "45%";
      statusText.textContent = "Parsing GeoJSON structure…";
      var reader = new FileReader();
      reader.onload = function(){
        var found = { buildings:false, roads:false, healthcare:false, education:false, water:false, drainage:false, power:false };
        var counts = { buildings:0, roads:0, healthcare:0, education:0, water:0, drainage:0 };
        var parsedOk = false;
        try{
          var data = JSON.parse(reader.result);
          if(data && Array.isArray(data.features)){
            parsedOk = true;
            data.features.forEach(function(ft){
              var blob = JSON.stringify(ft.properties || {}) + " " + (ft.geometry ? ft.geometry.type : "");
              Object.keys(KNOWN).forEach(function(k){
                if(KNOWN[k].test(blob)){ found[k] = true; if(counts[k] !== undefined) counts[k]++; }
              });
            });
          }
        }catch(err){ parsedOk = false; }

        setTimeout(function(){
          progressFill.style.width = "100%";
          statusText.textContent = "Finalising data availability check…";
          setTimeout(function(){
            statusRow.style.display = "none";
            doneRow.style.display = "flex";
            uploadStateTag.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="var(--good)"/><path d="m7.5 12 3 3 6-6.5" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg> Data loaded';

            if(!parsedOk){
              fileMeta.textContent = (file.size/1024).toFixed(0) + " KB · could not parse as GeoJSON — showing sample categories instead";
              toast("File could not be parsed as GeoJSON. Displaying sample analysis instead.");
              renderAvailability({ buildings:true, roads:true, healthcare:true, education:true, water:true, drainage:true, power:false }, {});
              return;
            }
            var featureCount = 0;
            try{ featureCount = JSON.parse(reader.result).features.length; }catch(e){}
            fileMeta.textContent = (file.size/1024).toFixed(0) + " KB · " + featureCount + " features · uploaded just now";
            renderAvailability(found, counts);
            toast("GeoJSON processed. " + (found.power ? "Power outage data detected." : "Power outage data not found — that module stays unavailable."));
          }, 500);
        }, 550);
      };
      reader.readAsText(file);
    }, 350);
  }

  function renderAvailability(found, counts){
    var labels = [
      ["buildings","Buildings"], ["roads","Roads"], ["healthcare","Healthcare Facilities"],
      ["education","Educational Facilities"], ["water","Water Network"], ["drainage","Drainage Network"]
    ];
    var html = "";
    labels.forEach(function(pair){
      var key = pair[0], label = pair[1];
      if(found[key]){
        var c = counts[key] ? ' <span class="mono" style="opacity:.7">'+counts[key]+'</span>' : "";
        html += '<span class="tag tag-ok">✓ ' + label + c + '</span>';
      } else {
        html += '<span class="tag tag-warn">⚠ ' + label + ' Not Available</span>';
      }
    });
    html += found.power
      ? '<span class="tag tag-ok">✓ Power Outage Data <span class="mono" style="opacity:.7">'+ (counts.power||0) +'</span></span>'
      : '<span class="tag tag-warn">⚠ Power Outage Data Not Available</span>';
    availTags.innerHTML = html;

    var powerCard = document.querySelector('.module-card[data-module="Power Outages"]');
    if(found.power){
      powerCard.classList.remove("disabled");
      powerCard.querySelector(".module-unavail-box").outerHTML = '<ul class="module-list"><li>Outage zones <b>3</b></li><li>Frequent outage areas <b>1</b></li><li>Avg. outage frequency <b>2.4/mo</b></li></ul>';
      powerCard.querySelector(".module-status").className = "module-status detected";
      powerCard.querySelector(".module-status").innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 16.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/></svg> 3 Issues Detected';
      var btn = powerCard.querySelector("button");
      btn.disabled = false; btn.removeAttribute("title"); btn.textContent = "View Analysis";
      btn.className = "btn btn-secondary";
    }
  }

  /* ---------------------------------------------------------------- */
  /* ISSUES TABLE                                                       */
  /* ---------------------------------------------------------------- */
  var issuesBody = $("#issuesBody"), emptyState = $("#emptyState"), resultCount = $("#resultCount");
  var filterCategory = $("#filterCategory"), filterPriority = $("#filterPriority"), filterSeverity = $("#filterSeverity");

  var issueRows = []; // cached row elements + pre-parsed filter fields, built once in renderIssues()

  function renderIssues(){
    issuesBody.innerHTML = issues.map(function(it, i){
      return '<tr data-idx="'+i+'" data-category="'+it.category+'" data-priority="'+it.priority+'" data-severity="'+it.severity+'">' +
        '<td><span class="cell-cat"><span class="cat-dot" style="background:'+CAT_COLOR[it.category]+'"></span>'+it.category+'</span></td>' +
        '<td class="cell-problem">'+it.problem+'</td>' +
        '<td>'+it.location+'</td>' +
        '<td><span class="cell-sev"><span class="severity-bar"><span style="width:'+(it.severity*10)+'%; background:'+SEV_COLOR(it.severity)+';"></span></span><span class="num" style="color:'+SEV_COLOR(it.severity)+'">'+it.severity.toFixed(1)+'</span></span></td>' +
        '<td><span class="priority-pill '+it.priority.toLowerCase()+'">'+it.priority+'</span></td>' +
      '</tr>';
    }).join("");
    // Cache row elements once instead of re-querying the DOM on every filter change.
    issueRows = $all("#issuesBody tr").map(function(el, i){
      return { el: el, category: issues[i].category, priority: issues[i].priority, severity: issues[i].severity };
    });
  }
  renderIssues();

  function applyFilters(){
    var cat = filterCategory.value, pri = filterPriority.value, sev = parseFloat(filterSeverity.value);
    var shown = 0;
    issueRows.forEach(function(r){
      var okCat = cat === "all" || r.category === cat;
      var okPri = pri === "all" || r.priority === pri;
      var okSev = r.severity >= sev;
      var visible = okCat && okPri && okSev;
      r.el.classList.toggle("row-hidden", !visible);
      if(visible) shown++;
    });
    resultCount.textContent = shown + (shown === 1 ? " issue shown" : " issues shown");
    emptyState.style.display = shown === 0 ? "block" : "none";
  }
  [filterCategory, filterPriority, filterSeverity].forEach(function(el){ el.addEventListener("change", applyFilters); });

  $all("[data-view-category]").forEach(function(btn){
    btn.addEventListener("click", function(){
      filterCategory.value = btn.dataset.viewCategory;
      applyFilters();
      document.getElementById("issues-section").scrollIntoView({behavior:"smooth", block:"start"});
      toast('Filtered issues to "' + btn.dataset.viewCategory + '"');
    });
  });

  /* ---------------------------------------------------------------- */
  /* RECOMMENDATIONS                                                    */
  /* ---------------------------------------------------------------- */
  var recGrid = $("#recGrid");
  function catColorFor(label){
    if(/water/i.test(label)) return "var(--cat-water)";
    if(/health/i.test(label)) return "var(--cat-healthcare)";
    if(/education/i.test(label)) return "var(--cat-education)";
    return "var(--cat-other)";
  }
  recGrid.innerHTML = recs.map(function(r){
    var c = catColorFor(r.category);
    return '<div class="card rec-card">' +
      '<div class="rec-top"><span class="rec-cat"><span class="cat-dot" style="background:'+c+'"></span>'+r.category+'</span><span class="priority-pill '+r.priority.toLowerCase()+'">'+r.priority+'</span></div>' +
      '<div class="rec-problem">'+r.problem+'</div>' +
      '<div class="rec-loc"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="9.5" r="2.2" stroke="currentColor" stroke-width="1.7"/></svg>'+r.location+'</div>' +
      '<div class="rec-field"><span class="fl">Reason</span><span class="fv">'+r.reason+'</span></div>' +
      '<div class="rec-action"><b>Suggested action:</b> '+r.action+'</div>' +
      '<div class="rec-foot">' +
        '<div class="rec-sev"><span class="severity-bar" style="width:50px;"><span style="width:'+(r.severity*10)+'%; background:'+SEV_COLOR(r.severity)+';"></span></span><span class="num" style="color:'+SEV_COLOR(r.severity)+'">'+r.severity.toFixed(1)+'/10</span></div>' +
        '<button class="btn btn-secondary btn-sm" data-view-map-zone="'+r.zone+'" data-zone-title="'+r.location+'" data-zone-body="'+r.category+' &middot; Severity '+r.severity.toFixed(1)+'/10">View on Map</button>' +
      '</div>' +
    '</div>';
  }).join("");

  /* ---------------------------------------------------------------- */
  /* MAP: zoom / layers / zones / markers / popover                    */
  /* ---------------------------------------------------------------- */
  var zoomGroupWrap = $("#citySvg");
  var scale = 1;
  var svgAllGroups = $("#citySvg > *:not(defs):not(rect)");
  // wrap everything (except bg rect+defs) into a zoom group once
  var zoomG = document.createElementNS("http://www.w3.org/2000/svg","g");
  zoomG.setAttribute("id","mapZoomGroup");
  svgAllGroups.forEach(function(g){ zoomG.appendChild(g); });
  $("#citySvg").appendChild(zoomG);

  function setScale(s){
    scale = Math.max(0.7, Math.min(2.2, s));
    zoomG.style.transform = "scale(" + scale + ")";
  }
  $("#zoomIn").addEventListener("click", function(){ setScale(scale + 0.2); });
  $("#zoomOut").addEventListener("click", function(){ setScale(scale - 0.2); });
  $("#resetView").addEventListener("click", function(){ setScale(1); $all(".layer-toggle input").forEach(function(cb){ cb.checked = true; toggleLayer(cb); }); toast("Map view reset"); });

  function toggleLayer(cb){
    var layer = document.getElementById(cb.dataset.layer);
    if(layer) layer.classList.toggle("map-hide", !cb.checked);
  }
  $all(".layer-toggle input").forEach(function(cb){ cb.addEventListener("change", function(){ toggleLayer(cb); }); });

  var popover = $("#mapPopover"), popoverTitle = $("#popoverTitle"), popoverBody = $("#popoverBody");
  var mapCard = $(".map-card");
  function showPopoverNear(clientX, clientY, title, body){
    var rect = mapCard.getBoundingClientRect();
    var x = clientX - rect.left + 14, y = clientY - rect.top + 14;
    x = Math.min(x, rect.width - 240); y = Math.min(y, rect.height - 110);
    popover.style.left = Math.max(10,x) + "px";
    popover.style.top = Math.max(10,y) + "px";
    popoverTitle.textContent = title;
    popoverBody.textContent = body;
    popover.classList.add("show");
  }
  $("#popoverClose").addEventListener("click", function(){ popover.classList.remove("show"); });

  var zoneInfo = {
    "healthcare-zone": ["Northern Residential Zone", "Healthcare gap · Severity 8.5/10 · High priority"],
    "water-zone": ["Sector 62 / 63, Building-Dense Blocks", "Water & drainage gap · Severity 7.8/10 · High priority"],
    "education-zone": ["Eastern Region (Sector 63)", "Education gap · Severity 6.2/10 · Medium priority"]
  };

  $all(".zone-poly").forEach(function(z){
    z.addEventListener("click", function(e){
      var info = zoneInfo[z.dataset.zone];
      if(info) showPopoverNear(e.clientX, e.clientY, info[0], info[1]);
    });
  });
  $all(".marker").forEach(function(m){
    m.addEventListener("click", function(e){
      showPopoverNear(e.clientX, e.clientY, m.dataset.name, "Essential service facility");
    });
  });

  function pulseZone(zoneKey){
    var z = document.querySelector('.zone-poly[data-zone="'+zoneKey+'"]');
    if(!z) return;
    z.classList.remove("pulse"); void z.offsetWidth; z.classList.add("pulse");
  }

  $all("[data-view-map-zone]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var zoneKey = btn.dataset.viewMapZone;
      document.getElementById("map-section").scrollIntoView({behavior:"smooth", block:"start"});
      setTimeout(function(){
        pulseZone(zoneKey);
        var box = document.querySelector('.zone-poly[data-zone="'+zoneKey+'"]');
        if(box){
          var r = box.getBoundingClientRect();
          showPopoverNear(r.left + r.width/2, r.top + r.height/2, btn.dataset.zoneTitle, btn.dataset.zoneBody);
        }
      }, 450);
      toast("Showing location on map");
    });
  });

  /* ---------------------------------------------------------------- */
  /* HISTORY MODAL                                                      */
  /* ---------------------------------------------------------------- */
  var historyModal = $("#historyModal");
  $all("[data-history-view]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var key = btn.dataset.historyView;
      $("#historyModalTitle").textContent = key;
      $("#historyModalBody").textContent = history[key] || "No further details recorded.";
      historyModal.classList.add("show");
    });
  });
  $("#closeHistoryModal").addEventListener("click", function(){ historyModal.classList.remove("show"); });
  historyModal.addEventListener("click", function(e){ if(e.target === historyModal) historyModal.classList.remove("show"); });
  $("#loadHistoryBtn").addEventListener("click", function(){
    historyModal.classList.remove("show");
    document.getElementById("dashboard-top").scrollIntoView({behavior:"smooth"});
    toast("Loaded analysis into current workspace");
  });

  /* ---------------------------------------------------------------- */
  /* MISC TOP BAR                                                       */
  /* ---------------------------------------------------------------- */
  $("#notifBtn").addEventListener("click", function(){ toast("3 new notifications · 2 high-priority issues flagged this week"); });
  $("#areaSelect").addEventListener("click", function(){ toast("Area switching is disabled in this prototype"); });
  $("#profileRow").addEventListener("click", function(){ toast("Signed in as Sachin Ramesh · Urban Planning Dept."); });
  $("#topAvatar").addEventListener("click", function(){ toast("Signed in as Sachin Ramesh · Urban Planning Dept."); });

  /* ---------------------------------------------------------------- */
  /* LIVE CLOCK — real wall-clock time, ticking every second, matching  */
  /* the "operations console" framing of the rest of the interface.    */
  /* ---------------------------------------------------------------- */
  var lcTime = $("#lcTime"), lcDate = $("#lcDate");
  var WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function pad2(n){ return n < 10 ? "0" + n : "" + n; }
  function tickClock(){
    if(!lcTime || !lcDate) return;
    var now = new Date();
    var h24 = now.getHours();
    var ampm = h24 >= 12 ? "PM" : "AM";
    var h12 = h24 % 12; if(h12 === 0) h12 = 12;
    lcTime.textContent = h12 + ":" + pad2(now.getMinutes()) + ":" + pad2(now.getSeconds()) + " " + ampm;
    lcDate.textContent = WEEKDAYS[now.getDay()] + ", " + now.getDate() + " " + MONTHS[now.getMonth()] + " " + now.getFullYear();
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* init */
  applyFilters();
})();
