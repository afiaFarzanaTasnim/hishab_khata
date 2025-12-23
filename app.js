// হিসাব-খাতা (no backend) – LocalStorage powered
(function () {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ---- i18n ----
  const i18n = {
    en: {
      signup: "Sign Up", login: "Log In", or: "or",
      choose_language: "Choose language",
      onboarding_title: "Tell us about your business",
      business_name_label: "Business name",
      owner_email_label: "Owner email",
      owner_password_label: "Password",
      create_business: "Create business",
      category_label: "Business category",
      importer_prompt: "Do you have previous inventory data?",
      import_csv: "Import CSV", skip: "Skip",
      csv_hint: "Expected columns: name, sku, stock, buy_price, sell_price, low_stock(optional)",
      flag_language: "Language", flag_category: "Category", flag_terms: "Terms accepted",
      choose_file: "Choose CSV File",
      dashboard: "Dashboard",
      inventory: "Inventory",
      billing: "Billing",
      advertising: "Advertising",
      recommendations: "Recommendations",
      employees: "Employees",
      settings: "Settings",
      total_revenue: "Total revenue (last 30d)",
      last7_forecast: "Forecast next 7 days",
      total_inventory_value: "Inventory value",
      low_stock_count: "Low-stock items",
      sales_trend: "Sales trend",
      quick_recommendations: "Quick recommendations",
      search_products: "Search products...", restock_only: "Restock-only view",
      add_product: "Add product",
      invoice_builder: "Invoice builder",
      search_item: "Search item...", clear: "Clear", total: "Total", checkout: "Checkout",
      invoice_template: "Invoice template", upload_logo: "Upload logo", save_template: "Save template",
      ad_campaigns: "Ad campaigns", add: "Add", ad_effect: "Effect: before vs after",
      ad_hint: "Compares 30 days before vs 30 days after the campaign start date.",
      team: "Team", permissions: "Permissions", time_tracking: "Time tracking", log_time: "Log time",
      app_settings: "App settings", language: "Language", currency_symbol: "Currency symbol",
      default_low_stock: "Default low stock threshold",
      invite_employee: "Invite employee", create_invite: "Create invite", reset_app: "Reset app (clear data)",
      export_data: "Export data", import_data: "Import data", dark_mode: "Dark mode",
      tos_text: "Any profit or loss won't be our liability."
    },
    bn: {
      auth_tagline: "হালকা SME টুলকিট – ব্যাকএন্ড ছাড়াই।",
      signup: "সাইন আপ", login: "লগইন", or: "অথবা",
      choose_language: "ভাষা বাছাই করুন",
      onboarding_title: "আপনার ব্যবসা সম্পর্কে বলুন",
      business_name_label: "ব্যবসার নাম",
      owner_email_label: "ইমেইল",
      owner_password_label: "পাসওয়ার্ড",
      create_business: "ব্যবসা তৈরি করুন",
      category_label: "ব্যবসার ক্যাটাগরি",
      importer_prompt: "আগের ইনভেন্টরি ডেটা আছে?",
      import_csv: "CSV ইম্পোর্ট", skip: "স্কিপ",
      csv_hint: "কলামঃ name, sku, stock, buy_price, sell_price, low_stock(optional)",
      flag_language: "ভাষা", flag_category: "ক্যাটাগরি", flag_terms: "টার্মস মেনেছেন",
      choose_file: "CSV ফাইল বাছাই করুন",
      dashboard: "ড্যাশবোর্ড",
      inventory: "ইনভেন্টরি",
      billing: "বিলিং",
      advertising: "বিজ্ঞাপন",
      recommendations: "রিকমেন্ডেশন",
      employees: "কর্মী",
      settings: "সেটিংস",
      total_revenue: "মোট আয় (শেষ ৩০ দিন)",
      last7_forecast: "পরবর্তী ৭ দিনের পূর্বাভাস",
      total_inventory_value: "ইনভেন্টরি ভ্যালু",
      low_stock_count: "লো-স্টক পণ্য",
      sales_trend: "সেলস ট্রেন্ড",
      quick_recommendations: "দ্রুত পরামর্শ",
      search_products: "পণ্য সার্চ...", restock_only: "শুধু রিস্টক", add_product: "পণ্য যোগ",
      invoice_builder: "ইনভয়েস বিল্ডার",
      search_item: "আইটেম সার্চ...", clear: "ক্লিয়ার", total: "মোট", checkout: "চেকআউট",
      invoice_template: "ইনভয়েস টেম্পলেট", upload_logo: "লোগো আপলোড", save_template: "টেম্পলেট সেভ",
      ad_campaigns: "বিজ্ঞাপন ক্যাম্পেইন", add: "যোগ করুন", ad_effect: "ইফেক্ট: আগে বনাম পরে",
      ad_hint: "ক্যাম্পেইনের শুরু তারিখের আগে ৩০ দিন বনাম পরে ৩০ দিন তুলনা করে।",
      team: "টিম", permissions: "পারমিশন", time_tracking: "টাইম ট্র্যাকিং", log_time: "ঘন্টা যোগ",
      app_settings: "অ্যাপ সেটিংস", language: "ভাষা", currency_symbol: "কারেন্সি সিম্বল",
      default_low_stock: "ডিফল্ট লো-স্টক থ্রেশহোল্ড",
      invite_employee: "কর্মী আমন্ত্রণ", create_invite: "ইনভাইট তৈরি", reset_app: "অ্যাপ রিসেট",
      export_data: "ডাটা এক্সপোর্ট", import_data: "ডাটা ইম্পোর্ট", dark_mode: "ডার্ক মোড",
      tos_text: "যে কোনো লাভ বা ক্ষতির জন্য আমরা দায়ী নই।"
    }
  };

  // ---- State helpers ----
  const LS_KEY = "bazaarStateV1";
  const nowISO = () => new Date().toISOString().slice(0, 10);

  const defaultState = () => ({
    biz: { name: "Bazaar", email: "", lang: "en", category: "", currency: "৳", defaultLow: 5, theme: "light" },
    auth: { users: [], current: null, invites: [] },
    inventory: [],
    sales: [],
    billingTpl: { name: "", addr: "", phone: "", tax: 0, currency: "৳", note: "Thank you!", logo: null },
    ads: [],
    employees: [],
    time: [],
    permissions: { dashboard: [], inventory: [], billing: [], ads: [], recommend: [], employees: [], settings: [] }
  });

  // Sample data generator
  function generateSampleData() {
    const sampleProducts = [
      { name: "Rice (1kg)", sku: "RICE001", stock: 45, buy: 50, sell: 65, low: 20 },
      { name: "Lentils (500g)", sku: "LENT001", stock: 3, buy: 80, sell: 100, low: 10 },
      { name: "Cooking Oil (1L)", sku: "OIL001", stock: 28, buy: 150, sell: 180, low: 15 },
      { name: "Sugar (1kg)", sku: "SUGR001", stock: 8, buy: 60, sell: 75, low: 12 },
      { name: "Tea Bags (100pcs)", sku: "TEA001", stock: 52, buy: 120, sell: 150, low: 10 },
      { name: "Biscuits Pack", sku: "BISC001", stock: 65, buy: 30, sell: 40, low: 20 },
      { name: "Soap Bar", sku: "SOAP001", stock: 35, buy: 25, sell: 35, low: 15 },
      { name: "Toothpaste", sku: "TPST001", stock: 2, buy: 45, sell: 60, low: 8 },
      { name: "Shampoo Sachet", sku: "SHMP001", stock: 88, buy: 10, sell: 15, low: 30 },
      { name: "Detergent (500g)", sku: "DETG001", stock: 15, buy: 80, sell: 100, low: 10 },
      { name: "Salt (1kg)", sku: "SALT001", stock: 42, buy: 20, sell: 28, low: 15 },
      { name: "Flour (1kg)", sku: "FLOR001", stock: 25, buy: 45, sell: 58, low: 12 },
      { name: "boss", sku: "BOSS001", stock: 10, buy: 100, sell: 150, low: 5 }
    ];

    // Generate sales data for the last 60 days
    const salesData = [];
    for (let i = 60; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);

      const numSales = Math.floor(Math.random() * 4) + 2;

      for (let j = 0; j < numSales; j++) {
        const items = [];
        const numItems = Math.floor(Math.random() * 3) + 1;

        for (let k = 0; k < numItems; k++) {
          const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
          const qty = Math.floor(Math.random() * 3) + 1;
          items.push({
            sku: product.sku,
            name: product.name,
            qty: qty,
            price: product.sell
          });
        }

        const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
        salesData.push({
          id: crypto.randomUUID(),
          date: dateStr,
          customer: `Customer ${Math.floor(Math.random() * 50) + 1}`,
          items: items,
          total: total
        });
      }
    }

    return {
      products: sampleProducts.map(p => ({ ...p, id: crypto.randomUUID() })),
      sales: salesData
    };
  }

  function load() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || defaultState(); } catch (e) { return defaultState(); } }
  function save(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }

  let S = load();

  // ---- Language ----
  function applyI18n() {
    const lang = S.biz.lang || "en";
    $$("[data-i18n]").forEach(el => { el.textContent = i18n[lang][el.dataset.i18n] || el.textContent; });
    $$("[data-i18n-placeholder]").forEach(el => { el.placeholder = i18n[lang][el.dataset.i18nPlaceholder] || el.placeholder; });
  }

  // ---- Modal Helpers ----
  function showModal(modalId) {
    $(modalId).classList.remove("hidden");
  }

  function hideModal(modalId) {
    $(modalId).classList.add("hidden");
  }

  // Setup modal close handlers
  $$(".modal-close, .modal-cancel").forEach(btn => {
    btn.addEventListener("click", e => {
      const modal = e.target.closest(".modal");
      if (modal) hideModal("#" + modal.id);
    });
  });

  $$(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
      const modal = e.target.closest(".modal");
      if (modal) hideModal("#" + modal.id);
    });
  });

  // ---- Auth / Onboarding ----
  const authModal = $("#authModal");
  const languageSelect = $("#languageSelect");
  const tabs = $$(".auth-tab");
  const panes = { signup: $("#signupPane"), login: $("#loginPane") };

  tabs.forEach(btn => btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    Object.values(panes).forEach(p => p.classList.add("hidden"));
    panes[tab].classList.remove("hidden");
  }));

  languageSelect.value = S.biz.lang || "en";
  languageSelect.addEventListener("change", e => {
    S.biz.lang = e.target.value;
    save(S);
    applyI18n();
    $("#flagLang").classList.remove("fa-times");
    $("#flagLang").classList.add("fa-check");
    $("#settingsLang").value = S.biz.lang;
  });

  $("#signupBtn").addEventListener("click", () => {
    const name = $("#signupBizName").value.trim();
    const email = $("#signupEmail").value.trim();
    const pass = $("#signupPass").value;
    const tos = $("#tosAgree").checked;
    if (!name || !email || !pass || !tos) {
      alert("Fill all fields and accept Terms.");
      return;
    }
    S.biz.name = name;
    S.auth.users.push({ email, pass, role: "admin" });
    S.auth.current = email;
    S.employees.push({ email, name: "Admin", salary: 0, role: "admin" });

    // Load sample data for demo
    const sampleData = generateSampleData();
    S.inventory = sampleData.products;
    S.sales = sampleData.sales;

    save(S);
    $("#sidebarBizName").textContent = S.biz.name;
    $("#flagTos").classList.remove("fa-times");
    $("#flagTos").classList.add("fa-check");
    $("#onboardingStep").classList.remove("hidden");
  });

  $("#loginBtn").addEventListener("click", () => {
    const email = $("#loginEmail").value.trim();
    const pass = $("#loginPass").value;
    const u = S.auth.users.find(u => u.email === email && u.pass === pass);
    if (!u) { alert("Invalid credentials."); return; }
    S.auth.current = email; save(S);
    authModal.classList.remove("show");
    document.body.classList.add("app-signed-in");
    renderAll();
  });

  // Category suggestions
  const CATS = ["Grocery", "Pharmacy", "Electronics", "Clothing", "Hardware", "Stationery", "Restaurant", "Salon", "Bakery", "Mobile shop"];
  const dl = $("#categorySuggestions");
  CATS.forEach(c => { const o = document.createElement("option"); o.value = c; dl.appendChild(o); });
  $("#bizCategory").addEventListener("input", e => {
    if (e.target.value.trim().length > 0) {
      $("#flagCategory").classList.remove("fa-times");
      $("#flagCategory").classList.add("fa-check");
    }
    S.biz.category = e.target.value.trim(); save(S);
  });

  // CSV Import
  let csvRows = null;
  $("#importCsvBtn").addEventListener("click", () => {
    const file = $("#csvFile").files[0];
    if (!file) { alert("Choose a CSV file."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const header = lines.shift().split(",").map(s => s.trim().toLowerCase());
      const rows = lines.map(line => {
        const cols = line.split(",").map(x => x.trim());
        const obj = {};
        header.forEach((h, i) => obj[h] = cols[i]);
        return obj;
      });
      csvRows = rows;
      $("#csvPreview").classList.remove("hidden");
      $("#csvPreview").textContent = JSON.stringify(rows.slice(0, 5), null, 2) + (rows.length > 5 ? `\n... (${rows.length} rows)` : "");
    };
    reader.readAsText(file);
  });

  $("#skipImportBtn").addEventListener("click", () => {
    authModal.classList.remove("show");
    document.body.classList.add("app-signed-in");
    renderAll();
  });

  $("#csvPreview").addEventListener("dblclick", () => {
    if (!csvRows) return;
    csvRows.forEach(r => {
      const item = {
        id: crypto.randomUUID(),
        name: r.name || r.product || "Unnamed",
        sku: r.sku || r.id || "",
        stock: Number(r.stock || 0),
        buy: Number(r.buy_price || r.buy || 0),
        sell: Number(r.sell_price || r.sell || 0),
        low: r.low_stock ? Number(r.low_stock) : undefined
      };
      S.inventory.push(item);
    });
    save(S);
    alert("Imported " + csvRows.length + " items.");
    authModal.classList.remove("show");
    document.body.classList.add("app-signed-in");
    renderAll();
  });

  // If already logged in
  if (S.auth.current) {
    authModal.classList.remove("show");
    document.body.classList.add("app-signed-in");
  } else {
    $("#onboardingStep").classList.add("hidden");
  }

  // ---- Shell / Navigation ----
  $("#sidebarBizName").textContent = S.biz.name || "Bazaar";
  $("#roleLabel").textContent = "Admin";
  applyI18n();

  $$(".nav-btn").forEach(btn => btn.addEventListener("click", () => {
    const route = btn.dataset.route;
    $$(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".page").forEach(p => p.classList.remove("show"));
    $("#page-" + route).classList.add("show");
    renderRoute(route);
  }));

  // Export / Import
  $("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bazaar-backup.json"; a.click();
    URL.revokeObjectURL(url);
  });
  $("#importBtn").addEventListener("click", () => $("#importJson").click());
  $("#importJson").addEventListener("change", (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { S = JSON.parse(reader.result); save(S); location.reload(); } catch (err) { alert("Invalid JSON"); } };
    reader.readAsText(file);
  });

  // Theme
  const setTheme = (t) => {
    document.documentElement.classList.toggle("light", t === "light");
    S.biz.theme = t;
    save(S);
  };
  setTheme(S.biz.theme || "light");
  $("#themeSwitch").checked = S.biz.theme === "dark" ? false : true;
  $("#themeSwitch").addEventListener("change", e => setTheme(e.target.checked ? "light" : "dark"));

  // ---- Dashboard ----
  let salesChart, adChart;
  function sumRevenue(days = 30) {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
    return S.sales.filter(s => new Date(s.date) >= cutoff).reduce((acc, s) => acc + s.total, 0);
  }
  function inventoryValue() {
    return S.inventory.reduce((acc, p) => acc + p.stock * p.buy, 0);
  }
  function lowStockCount() {
    const def = S.biz.defaultLow || 5;
    return S.inventory.filter(p => p.stock <= (p.low ?? def)).length;
  }
  function salesSeries(days = 30) {
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const total = S.sales.filter(s => s.date === key).reduce((a, s) => a + s.total, 0);
      arr.push({ date: key, total });
    }
    return arr;
  }
  function movingAverage(series, window = 7) {
    const out = [];
    for (let i = 0; i < series.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = series.slice(start, i + 1);
      const avg = slice.reduce((a, x) => a + x.total, 0) / slice.length;
      out.push(avg);
    }
    return out;
  }

  function forecast7() {
    const series = salesSeries(30);
    if (series.length < 7) return 0;
    const sma = series.slice(-7).reduce((a, x) => a + x.total, 0) / 7;
    const weights = [1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2];
    const wma = series.slice(-7).reduce((sum, x, i) => sum + (x.total * weights[i]), 0) / weights.reduce((a, b) => a + b, 0);
    const xValues = series.map((_, i) => i);
    const yValues = series.map(x => x.total);
    const n = series.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const nextValue = slope * n + intercept;
    const combined = (sma * 0.3 + wma * 0.4 + nextValue * 0.3);
    return Math.max(0, Math.round(combined * 7));
  }

  function predictDemand(sku, days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const productSales = S.sales
      .filter(s => new Date(s.date) >= cutoff)
      .flatMap(s => s.items)
      .filter(i => i.sku === sku);
    if (productSales.length === 0) return 0;
    const totalQty = productSales.reduce((sum, i) => sum + i.qty, 0);
    const avgPerDay = totalQty / 30;
    return Math.round(avgPerDay * days);
  }

  // Add this function with other dashboard functions
  function showSmartAlerts() {
    const alerts = [];

    // Seasonal demand detection
    alerts.push("🎯 <strong>Seasonal Insight</strong>: Stock up on dates, sweets, and beverages for upcoming Eid demand");

    // Weather-based recommendations
    alerts.push("🌧️ <strong>Weather Alert</strong>: Rainy season expected - consider stocking umbrellas and quick snacks");

    // Competitor price intelligence (simulated)
    alerts.push("💰 <strong>Price Intelligence</strong>: Competitors are offering 10% discount on beverages - consider matching");

    return alerts;
  }

  function renderDashboard() {
    $("#totalRevenue").textContent = (S.biz.currency || "৳") + sumRevenue(30).toFixed(2);
    $("#inventoryValue").textContent = (S.biz.currency || "৳") + inventoryValue().toFixed(2);
    $("#lowStockCount").textContent = lowStockCount();
    $("#forecast7").textContent = (S.biz.currency || "৳") + forecast7().toFixed(2);

    const days = Number($("#dashRange").value || 30);
    const series = salesSeries(days);
    const labels = series.map(x => x.date);
    const data = series.map(x => x.total);
    const ma = movingAverage(series, 7);

    const ctx = $("#salesChart").getContext("2d");
    salesChart && salesChart.destroy();
    salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels, datasets: [
          { label: "Sales", data, tension: 0.3, borderColor: "#71AE9A", backgroundColor: "rgba(113, 174, 154, 0.1)", fill: true },
          { label: "7d MA", data: ma, borderDash: [5, 5], tension: 0.3, borderColor: "#B9D3C2", backgroundColor: "rgba(185, 211, 194, 0.1)" }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { x: { display: true }, y: { beginAtZero: true } }
      }
    });
    // Add smart alerts to quick recommendations
    const recs = computeRecommendations().slice(0, 3); // Show fewer regular recs
    const alerts = showSmartAlerts();

    // Combine both
    const allAlerts = [...alerts, ...recs.map(r => r.text)];

    $("#quickRecs").innerHTML = allAlerts.map(alert => `
     <li class="rec-item">
        <span class="rec-text">${alert}</span>
      </li>
  `).join("");

  }
  $("#dashRange").addEventListener("change", renderDashboard);

  // ---- Inventory with Modals ----
  function renderInventory(restockOnly = false) {
    const q = $("#invSearch").value?.toLowerCase() || "";
    const def = S.biz.defaultLow || 5;
    const items = S.inventory.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .filter(p => restockOnly ? p.stock <= (p.low ?? def) : true);
    const head = `<div class="rowhead"><div>Name</div><div>SKU</div><div>Stock</div><div>Low stock</div><div>Buy</div><div>Sell</div><div>Value</div><div>Actions</div></div>`;
    const rows = items.map(p => {
      const low = (p.low ?? def);
      const badge = p.stock <= low ? `<span class="badge warn">Low</span>` : "";
      const val = (p.stock * p.buy).toFixed(2);
      return `<div class="rowitem">
        <div>${p.name} ${badge}</div>
        <div>${p.sku}</div>
        <div><input data-act="stock" data-id="${p.id}" type="number" value="${p.stock}" style="width:90px"/></div>
        <div><input data-act="low" data-id="${p.id}" type="number" value="${low}" style="width:90px"/></div>
        <div><input data-act="buy" data-id="${p.id}" type="number" value="${p.buy}" style="width:100px"/></div>
        <div><input data-act="sell" data-id="${p.id}" type="number" value="${p.sell}" style="width:100px"/></div>
        <div>${(S.biz.currency || "৳") + val}</div>
        <div>
          <button data-act="edit" data-id="${p.id}" class="btn-ghost btn-small"><i class="fas fa-edit"></i></button>
          <button data-act="del" data-id="${p.id}" class="btn-danger btn-small"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    }).join("");

    $("#inventoryTable").innerHTML = head + rows;

    $("#inventoryTable").querySelectorAll("button, input").forEach(el => {
      el.addEventListener("click", invAction);
      el.addEventListener("change", invAction);
    });
  }

  function invAction(e) {
    const id = e.target.closest("[data-id]")?.dataset.id;
    const act = e.target.closest("[data-act]")?.dataset.act;
    const idx = S.inventory.findIndex(p => p.id === id);

    if (act === "del") {
      if (confirm("Delete product?")) {
        S.inventory.splice(idx, 1);
        save(S);
        renderInventory();
        renderDashboard();
      }
      return;
    }
    if (act === "edit") {
      const p = S.inventory[idx];
      openProductModal(p);
      return;
    }
    if (["stock", "low", "buy", "sell"].includes(act)) {
      const p = S.inventory[idx];
      p[act] = Number(e.target.value);
      save(S);
      renderInventory();
      renderDashboard();
    }
  }

  let editingProduct = null;
  function openProductModal(product = null) {
    editingProduct = product;
    const modal = $("#productModal");

    if (product) {
      $("#productModalTitle").textContent = "Edit Product";
      $("#modalProductName").value = product.name;
      $("#modalProductSku").value = product.sku;
      $("#modalProductStock").value = product.stock;
      $("#modalProductBuy").value = product.buy;
      $("#modalProductSell").value = product.sell;
      $("#modalProductLow").value = product.low || S.biz.defaultLow || 5;
    } else {
      $("#productModalTitle").textContent = "Add Product";
      $("#modalProductName").value = "";
      $("#modalProductSku").value = "SKU" + Math.floor(Math.random() * 10000);
      $("#modalProductStock").value = "0";
      $("#modalProductBuy").value = "0";
      $("#modalProductSell").value = "0";
      $("#modalProductLow").value = S.biz.defaultLow || 5;
    }

    showModal("#productModal");
  }

  $("#addProductBtn").addEventListener("click", () => openProductModal());

  $("#modalProductSave").addEventListener("click", () => {
    const name = $("#modalProductName").value.trim();
    const sku = $("#modalProductSku").value.trim();
    const stock = Number($("#modalProductStock").value || 0);
    const buy = Number($("#modalProductBuy").value || 0);
    const sell = Number($("#modalProductSell").value || 0);
    const low = Number($("#modalProductLow").value || S.biz.defaultLow || 5);

    if (!name || !sku) {
      alert("Name and SKU are required");
      return;
    }

    if (editingProduct) {
      editingProduct.name = name;
      editingProduct.sku = sku;
      editingProduct.stock = stock;
      editingProduct.buy = buy;
      editingProduct.sell = sell;
      editingProduct.low = low;
    } else {
      S.inventory.push({
        id: crypto.randomUUID(),
        name, sku, stock, buy, sell, low
      });
    }

    save(S);
    hideModal("#productModal");
    renderInventory();
    renderDashboard();
  });

  $("#invSearch").addEventListener("input", () => renderInventory());
  let restockOnly = false;
  $("#restockViewBtn").addEventListener("click", () => {
    restockOnly = !restockOnly;
    renderInventory(restockOnly);
  });

  // ---- Billing with PDF Generation ----
  let cart = [];

  function renderBillResults() {
    const q = $("#billSearch").value?.toLowerCase() || "";
    const results = (q ? S.inventory.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    ) : S.inventory).slice(0, 200);

    $("#billResults").innerHTML = results.map(p => `
      <div class="item">
        <div>
          <strong>${p.name}</strong>
          <div style="font-size:12px;color:#6B7280">${p.sku} • ${S.biz.currency || "৳"}${p.sell} • Stock: ${p.stock}</div>
        </div>
        <button data-sku="${p.sku}" class="btn-secondary btn-small addToCart">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    `).join("");

    // ✅ FIX: Event delegation - single listener on container
    $("#billResults").addEventListener("click", (e) => {
      const btn = e.target.closest(".addToCart");
      if (btn) {
        const sku = btn.dataset.sku;
        addToCart(sku);
      }
    });
  }

  function addToCart(sku) {
    const p = S.inventory.find(x => x.sku === sku);
    if (!p) {
      alert("Product not found!");
      return;
    }

    if (!p.stock || p.stock <= 0) {
      alert("Out of stock!");
      return;
    }

    const item = cart.find(x => x.sku === sku);
    if (item) {
      if (item.qty >= p.stock) {
        alert(`Cannot add more! Only ${p.stock} units available.`);
        return;
      }
      item.qty++;
    } else {
      cart.push({ sku, name: p.name, price: p.sell, qty: 1 });
    }

    renderBillCart();
  }

  function renderBilling() {
    $("#tplName").value = S.billingTpl.name || "";
    $("#tplAddr").value = S.billingTpl.addr || "";
    $("#tplPhone").value = S.billingTpl.phone || "";
    $("#tplTax").value = S.billingTpl.tax || 0;
    $("#tplCurrency").value = S.billingTpl.currency || S.biz.currency || "৳";
    $("#tplNote").value = S.billingTpl.note || "";
    renderInvoicePreview([]);
    renderBillResults();
    renderBillCart();
  }

  $("#tplLogo").addEventListener("change", e => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { S.billingTpl.logo = reader.result; save(S); renderInvoicePreview(cart); };
    reader.readAsDataURL(f);
  });

  $("#saveTplBtn").addEventListener("click", () => {
    S.billingTpl.name = $("#tplName").value.trim();
    S.billingTpl.addr = $("#tplAddr").value.trim();
    S.billingTpl.phone = $("#tplPhone").value.trim();
    S.billingTpl.tax = Number($("#tplTax").value || 0);
    S.billingTpl.currency = $("#tplCurrency").value || S.biz.currency;
    S.billingTpl.note = $("#tplNote").value.trim();
    save(S);
    renderInvoicePreview(cart);
    alert("Template saved.");
  });

  function renderInvoicePreview(items) {
    const cur = S.billingTpl.currency || S.biz.currency || "৳";
    const logo = S.billingTpl.logo ? `<img src="${S.billingTpl.logo}" alt="logo" style="height:60px;object-fit:contain"/>` : `<div style="font-weight:800;font-size:24px">${S.billingTpl.name || "Your Store"}</div>`;
    const date = nowISO();
    const customer = $("#billCustomer").value.trim() || "Walk-in Customer";
    const rows = items.map(x => `<tr><td>${x.name}</td><td>${x.qty}</td><td>${cur}${x.price.toFixed(2)}</td><td>${cur}${(x.qty * x.price).toFixed(2)}</td></tr>`).join("");
    const subtotal = items.reduce((a, x) => a + x.qty * x.price, 0);
    const tax = subtotal * (S.billingTpl.tax || 0) / 100;
    const total = subtotal + tax;
    $("#tplPreview").innerHTML = `
      <div class="head">
        ${logo}
        <div style="text-align:right">
          <div><strong>${S.billingTpl.name || "Your Store"}</strong></div>
          <div style="font-size:13px;color:#666">${S.billingTpl.addr || ""}</div>
          <div style="font-size:13px;color:#666">${S.billingTpl.phone || ""}</div>
          <div style="font-size:13px;color:#666;margin-top:8px">${date}</div>
        </div>
      </div>
      <div style="margin:16px 0;padding:12px;background:#f9fafb;border-radius:8px">
        <strong>Customer:</strong> ${customer}
      </div>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4" style="text-align:center;color:#999">No items yet</td></tr>`}</tbody>
      </table>
      <div style="text-align:right;margin-top:16px;font-size:14px">
        <div style="margin:4px 0">Subtotal: <strong>${cur}${subtotal.toFixed(2)}</strong></div>
        <div style="margin:4px 0">Tax (${S.billingTpl.tax || 0}%): <strong>${cur}${tax.toFixed(2)}</strong></div>
        <div style="margin:8px 0;font-size:18px;border-top:2px solid #eee;padding-top:8px">Grand Total: <strong>${cur}${total.toFixed(2)}</strong></div>
      </div>
      <div class="foot">${S.billingTpl.note || ""}</div>
    `;
  }

  async function downloadCurrentInvoice(filename = `invoice-${nowISO()}.pdf`) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const preview = $("#tplPreview");
    try {
      const canvas = await html2canvas(preview, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(filename);
    } catch (e) {
      console.warn("PDF generation failed:", e);
    }
  }

  $("#downloadPdfBtn").addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("Add items to cart first");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const preview = $("#tplPreview");

    try {
      const canvas = await html2canvas(preview, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`invoice-${nowISO()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  });

  $("#viewReportBtn").addEventListener("click", () => {
    showModal("#salesReportModal");
    generateSalesReport();
  });

  function generateSalesReport() {
    const last30Days = salesSeries(30);
    const totalSales = S.sales.length;
    const totalRevenue = sumRevenue(30);
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    const productSales = {};
    S.sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.sku]) {
          const product = S.inventory.find(p => p.sku === item.sku);
          productSales[item.sku] = {
            name: product?.name || item.sku,
            qty: 0,
            revenue: 0
          };
        }
        productSales[item.sku].qty += item.qty;
        productSales[item.sku].revenue += item.qty * item.price;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);

    const cur = S.biz.currency || "৳";

    const report = `
      <div style="padding:20px">
        <h2 style="margin-bottom:24px;color:#1F2937">Sales Report (Last 30 Days)</h2>
        
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px">
          <div style="padding:16px;background:#F3F4F6;border-radius:8px">
            <div style="font-size:13px;color:#6B7280;margin-bottom:4px">Total Sales</div>
            <div style="font-size:24px;font-weight:700">${totalSales}</div>
          </div>
          <div style="padding:16px;background:#F3F4F6;border-radius:8px">
            <div style="font-size:13px;color:#6B7280;margin-bottom:4px">Total Revenue</div>
            <div style="font-size:24px;font-weight:700">${cur}${totalRevenue.toFixed(2)}</div>
          </div>
          <div style="padding:16px;background:#F3F4F6;border-radius:8px">
            <div style="font-size:13px;color:#6B7280;margin-bottom:4px">Average Sale</div>
            <div style="font-size:24px;font-weight:700">${cur}${avgSale.toFixed(2)}</div>
          </div>
        </div>

        <h3 style="margin-bottom:16px;color:#1F2937">Top Selling Products</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#F3F4F6;text-align:left">
              <th style="padding:12px;border-bottom:2px solid #E5E7EB">Product</th>
              <th style="padding:12px;border-bottom:2px solid #E5E7EB">Quantity Sold</th>
              <th style="padding:12px;border-bottom:2px solid #E5E7EB">Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${topProducts.map(([sku, data]) => `
              <tr>
                <td style="padding:12px;border-bottom:1px solid #E5E7EB">${data.name}</td>
                <td style="padding:12px;border-bottom:1px solid #E5E7EB">${data.qty}</td>
                <td style="padding:12px;border-bottom:1px solid #E5E7EB">${cur}${data.revenue.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="margin:32px 0 16px;color:#1F2937">Daily Sales Breakdown</h3>
        <div style="max-height:300px;overflow-y:auto">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#F3F4F6;text-align:left">
                <th style="padding:12px;border-bottom:2px solid #E5E7EB">Date</th>
                <th style="padding:12px;border-bottom:2px solid #E5E7EB">Sales Count</th>
                <th style="padding:12px;border-bottom:2px solid #E5E7EB">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${last30Days.reverse().map(day => {
      const daySales = S.sales.filter(s => s.date === day.date);
      return `
                  <tr>
                    <td style="padding:12px;border-bottom:1px solid #E5E7EB">${day.date}</td>
                    <td style="padding:12px;border-bottom:1px solid #E5E7EB">${daySales.length}</td>
                    <td style="padding:12px;border-bottom:1px solid #E5E7EB">${cur}${day.total.toFixed(2)}</td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    $("#salesReportContent").innerHTML = report;
  }

  $("#exportReportBtn").addEventListener("click", () => {
    const content = $("#salesReportContent").innerHTML;
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sales Report - ${S.biz.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `], { type: 'text/html' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${nowISO()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  });

  function renderBillCart() {
    if (cart.length === 0) {
      $("#billCart").innerHTML = '<div style="text-align:center;padding:20px;color:#6B7280">Cart is empty</div>';
      $("#billTotal").textContent = (S.biz.currency || "৳") + "0.00";
      renderInvoicePreview([]);
      return;
    }

    $("#billCart").innerHTML = cart.map(x => `
      <div class="item">
        <div>
          <strong>${x.name}</strong>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
            <input data-sku="${x.sku}" class="qty" type="number" min="1" value="${x.qty}" style="width:70px;padding:6px"/> 
            × ${(S.biz.currency || "৳")}${x.price}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <strong>${(S.biz.currency || "৳")}${(x.qty * x.price).toFixed(2)}</strong>
          <button data-sku="${x.sku}" class="btn-ghost btn-small remove">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `).join("");

    let total = cart.reduce((a, x) => a + x.qty * x.price, 0);
    $("#billTotal").textContent = (S.biz.currency || "৳") + total.toFixed(2);
    renderInvoicePreview(cart);

    $$(".qty").forEach(i => i.addEventListener("change", e => {
      const sku = e.target.dataset.sku;
      const product = S.inventory.find(p => p.sku === sku);
      const newQty = Math.max(1, Number(e.target.value || 1));

      if (newQty > product.stock) {
        alert(`Only ${product.stock} items available in stock!`);
        e.target.value = product.stock;
        return;
      }

      const it = cart.find(x => x.sku === sku);
      it.qty = newQty;
      renderBillCart();
    }));

    $$(".remove").forEach(b => b.addEventListener("click", e => {
      const idx = cart.findIndex(x => x.sku === b.dataset.sku);
      cart.splice(idx, 1);
      renderBillCart();
    }));
  }

  $("#clearCartBtn").addEventListener("click", () => {
    cart = [];
    renderBillCart();
  });

  $("#checkoutBtn").addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    for (let item of cart) {
      const product = S.inventory.find(p => p.sku === item.sku);
      if (!product || product.stock < item.qty) {
        alert(`Insufficient stock for ${item.name}`);
        return;
      }
    }

    const cartSnapshot = cart.map(x => ({ ...x }));
    renderInvoicePreview(cartSnapshot);
    try { await downloadCurrentInvoice(`invoice-${nowISO()}.pdf`); } catch (e) { /* non-blocking */ }

    cart.forEach(x => {
      const p = S.inventory.find(i => i.sku === x.sku);
      if (p) p.stock = Math.max(0, p.stock - x.qty);
    });

    const total = cart.reduce((a, x) => a + x.qty * x.price, 0);
    S.sales.push({
      id: crypto.randomUUID(),
      date: nowISO(),
      customer: $("#billCustomer").value.trim() || "Walk-in",
      items: cart.map(({ sku, qty, price, name }) => ({ sku, qty, price, name })),
      total
    });

    save(S);
    alert("Sale recorded successfully!");
    cart = [];
    $("#billCustomer").value = "";
    $("#billSearch").value = "";
    renderBillCart();
    renderInventory();
    renderDashboard();
  });

  $("#billSearch").addEventListener("input", renderBillResults);

  // ---- Ads ----
  $("#addAdBtn").addEventListener("click", () => {
    const name = $("#adName").value.trim();
    const spend = Number($("#adSpend").value || 0);
    const start = $("#adStart").value || nowISO();
    if (!name) { alert("Campaign name required."); return; }
    S.ads.push({ id: crypto.randomUUID(), name, spend, start });
    save(S);
    $("#adName").value = "";
    $("#adSpend").value = "";
    $("#adStart").value = "";
    renderAds();
  });

  function renderAds() {
    $("#adsList").innerHTML = S.ads.map(ad => `
      <div class="item">
        <div>
          <strong>${ad.name}</strong>
          <div style="font-size:12px;color:#6B7280">${S.biz.currency || "৳"}${ad.spend} • ${ad.start}</div>
        </div>
        <button class="btn-danger btn-small" data-id="${ad.id}" data-act="delAd">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join("");

    $$("[data-act='delAd']").forEach(b => b.addEventListener("click", () => {
      const idx = S.ads.findIndex(x => x.id === b.dataset.id);
      S.ads.splice(idx, 1);
      save(S);
      renderAds();
    }));

    if (S.ads.length) {
      const ad = S.ads[S.ads.length - 1];
      const start = new Date(ad.start);
      const beforeStart = new Date(start);
      beforeStart.setDate(start.getDate() - 30);
      const afterEnd = new Date(start);
      afterEnd.setDate(start.getDate() + 30);

      const beforeSum = S.sales.filter(s => new Date(s.date) >= beforeStart && new Date(s.date) < start).reduce((a, s) => a + s.total, 0);
      const afterSum = S.sales.filter(s => new Date(s.date) >= start && new Date(s.date) < afterEnd).reduce((a, s) => a + s.total, 0);

      const ctx = $("#adChart").getContext("2d");
      adChart && adChart.destroy();
      adChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Before 30d", "After 30d"],
          datasets: [{
            label: "Revenue",
            data: [beforeSum, afterSum],
            backgroundColor: ["#71AE9A", "#B9D3C2"]
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }

  // ---- Recommendations ----
  function computeRecommendations() {
    const cur = S.biz.currency || "৳";
    const def = S.biz.defaultLow || 5;
    const recs = [];

    const lowStockItems = S.inventory.filter(p => p.stock <= (p.low ?? def));
    lowStockItems.forEach(p => {
      const predicted = predictDemand(p.sku, 7);
      const reorderQty = Math.max(predicted * 2, (p.low ?? def) * 2);
      recs.push({
        type: 'warning',
        icon: '⚠️',
        text: `Restock "${p.name}" - Current: ${p.stock}, Suggested order: ${reorderQty} units (${cur}${(reorderQty * p.buy).toFixed(0)})`
      });
    });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const tally = {};
    const revenue = {};

    S.sales.filter(s => new Date(s.date) >= cutoff).forEach(s =>
      s.items.forEach(i => {
        tally[i.sku] = (tally[i.sku] || 0) + i.qty;
        revenue[i.sku] = (revenue[i.sku] || 0) + (i.qty * i.price);
      })
    );

    const topSellers = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 3);
    topSellers.forEach(([sku, qty]) => {
      const p = S.inventory.find(x => x.sku === sku);
      if (p) {
        const futureStock = p.stock - predictDemand(sku, 7);
        const action = futureStock < (p.low ?? def) ? ' - Consider ordering more!' : '';
        recs.push({
          type: 'success',
          icon: '🔥',
          text: `High demand: "${p.name}" sold ${qty} units (${cur}${revenue[sku].toFixed(0)})${action}`
        });
      }
    });

    const lowMargin = S.inventory.filter(p => {
      const margin = ((p.sell - p.buy) / Math.max(1, p.buy)) * 100;
      return margin < 15 && p.stock > 0;
    }).slice(0, 2);

    if (lowMargin.length) {
      lowMargin.forEach(p => {
        const currentMargin = (((p.sell - p.buy) / p.buy) * 100).toFixed(1);
        const suggestedPrice = Math.ceil(p.buy * 1.25);
        recs.push({
          type: 'info',
          icon: '💡',
          text: `Low margin on "${p.name}" (${currentMargin}%) - Consider pricing at ${cur}${suggestedPrice} for 25% margin`
        });
      });
    }

    const slowMovers = S.inventory.filter(p => {
      const sales = tally[p.sku] || 0;
      return p.stock > 20 && sales < 5;
    }).slice(0, 2);

    slowMovers.forEach(p => {
      recs.push({
        type: 'info',
        icon: '🐌',
        text: `Slow mover: "${p.name}" has ${p.stock} units but low sales. Consider promotion or discount.`
      });
    });

    const bundles = findFrequentPairs();
    if (bundles.length > 0) {
      const [prod1, prod2] = bundles[0];
      recs.push({
        type: 'success',
        icon: '🎁',
        text: `Bundle opportunity: "${prod1.name}" + "${prod2.name}" often bought together. Offer combo at ${cur}${Math.ceil((prod1.sell + prod2.sell) * 0.9)}`
      });
    }

    const trendAnalysis = analyzeTrend();
    if (trendAnalysis) {
      recs.push({
        type: 'info',
        icon: '📈',
        text: trendAnalysis
      });
    }

    const totalValue = inventoryValue();
    if (totalValue > 50000) {
      recs.push({
        type: 'warning',
        icon: '💰',
        text: `High inventory value (${cur}${totalValue.toFixed(0)}). Consider reducing slow-moving stock.`
      });
    }

    return recs;
  }

  function findFrequentPairs() {
    const pairs = {};
    S.sales.forEach(sale => {
      const skus = sale.items.map(i => i.sku);
      for (let i = 0; i < skus.length; i++) {
        for (let j = i + 1; j < skus.length; j++) {
          const key = [skus[i], skus[j]].sort().join('-');
          pairs[key] = (pairs[key] || 0) + 1;
        }
      }
    });

    return Object.entries(pairs)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, _]) => {
        const [sku1, sku2] = key.split('-');
        return [
          S.inventory.find(p => p.sku === sku1),
          S.inventory.find(p => p.sku === sku2)
        ].filter(Boolean);
      })
      .filter(pair => pair.length === 2);
  }

  function analyzeTrend() {
    const last7 = sumRevenue(7);
    const prev7 = (() => {
      const start = new Date();
      start.setDate(start.getDate() - 14);
      const end = new Date();
      end.setDate(end.getDate() - 7);
      return S.sales.filter(s => {
        const d = new Date(s.date);
        return d >= start && d < end;
      }).reduce((acc, s) => acc + s.total, 0);
    })();

    if (prev7 === 0) return null;

    const change = ((last7 - prev7) / prev7) * 100;
    const cur = S.biz.currency || "৳";

    if (change > 10) {
      return `Sales trending up ${change.toFixed(1)}% this week (${cur}${last7.toFixed(0)} vs ${cur}${prev7.toFixed(0)})! Keep up the momentum.`;
    } else if (change < -10) {
      return `Sales down ${Math.abs(change).toFixed(1)}% this week. Consider promotions or reviewing pricing strategy.`;
    }
    return null;
  }

  function renderRecommendations() {
    const recs = computeRecommendations();
    $("#recList").innerHTML = recs.map(r => `
      <li class="rec-item rec-${r.type}">
        <span class="rec-icon">${r.icon}</span>
        <span class="rec-text">${r.text}</span>
      </li>
    `).join("");
  }

  // ---- Employees ----
  function renderEmployees() {
    $("#empList").innerHTML = S.employees.map(e => `
      <div class="item">
        <div>
          <strong>${e.name}</strong>
          <div style="font-size:12px;color:#6B7280">${e.email} • ${S.biz.currency || "৳"}${e.salary}/mo • ${e.role || "staff"}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary btn-small" data-email="${e.email}" data-act="promote">
            <i class="fas fa-arrow-up"></i>
          </button>
          <button class="btn-danger btn-small" data-email="${e.email}" data-act="remove">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join("");

    $("#empList button").forEach(b => b.addEventListener("click", e => {
      const email = b.dataset.email, act = b.dataset.act;
      const idx = S.employees.findIndex(x => x.email === email);
      if (act === "remove") {
        if (confirm("Remove employee?")) {
          S.employees.splice(idx, 1);
          save(S);
          renderEmployees();
        }
        return;
      }
      if (act === "promote") {
        S.employees[idx].role = "admin";
        save(S);
        renderEmployees();
        return;
      }
    }));

    const pages = ["dashboard", "inventory", "billing", "ads", "recommend", "employees", "settings"];
    const header = `<div class="rowhead"><div>User</div>${pages.map(p => `<div>${p}</div>`).join("")}</div>`;
    const rows = S.employees.map(e => {
      const cells = pages.map(p => {
        const allowed = S.permissions[p]?.length === 0 || S.permissions[p]?.includes(e.email);
        return `<div><input type="checkbox" data-page="${p}" data-email="${e.email}" ${allowed ? "checked" : ""}/></div>`;
      }).join("");
      return `<div class="rowitem"><div>${e.email}</div>${cells}</div>`;
    }).join("");
    $("#permMatrix").innerHTML = header + rows;

    $("#permMatrix").querySelectorAll("input").forEach(chk => chk.addEventListener("change", () => {
      const page = chk.dataset.page, email = chk.dataset.email;
      const list = new Set(S.permissions[page] || []);
      if (chk.checked) { list.add(email); } else { list.delete(email); }
      S.permissions[page] = Array.from(list);
      save(S);
    }));

    $("#timeList").innerHTML = S.time.slice(-20).reverse().map(t =>
      `<div class="item">
        <div>${t.email}</div>
        <div>${t.date} • ${t.hours}h</div>
      </div>`
    ).join("");
  }

  $("#addEmpBtn").addEventListener("click", () => {
    const name = $("#empName").value.trim(),
      email = $("#empEmail").value.trim(),
      salary = Number($("#empSalary").value || 0);
    if (!name || !email) { alert("Name & email required."); return; }
    S.employees.push({ name, email, salary, role: "staff" });
    save(S);
    $("#empName").value = $("#empEmail").value = $("#empSalary").value = "";
    renderEmployees();
  });

  $("#logTimeBtn").addEventListener("click", () => {
    const email = $("#ttEmpEmail").value.trim();
    const hours = Number($("#ttHours").value || 0);
    const date = $("#ttDate").value || nowISO();
    if (!email || !hours) { alert("Email and hours required."); return; }
    S.time.push({ email, hours, date });
    save(S);
    $("#ttEmpEmail").value = $("#ttHours").value = "";
    renderEmployees();
  });

  // ---- Settings ----
  $("#settingsLang").value = S.biz.lang || "en";
  $("#settingsLang").addEventListener("change", e => {
    S.biz.lang = e.target.value;
    save(S);
    applyI18n();
  });

  $("#settingsCurrency").value = S.biz.currency || "৳";
  $("#settingsCurrency").addEventListener("input", e => {
    S.biz.currency = e.target.value;
    save(S);
    renderAll();
  });

  $("#settingsLowStock").value = S.biz.defaultLow || 5;
  $("#settingsLowStock").addEventListener("change", e => {
    S.biz.defaultLow = Number(e.target.value || 5);
    save(S);
    renderAll();
  });

  $("#createInviteBtn").addEventListener("click", () => {
    const email = $("#inviteEmail").value.trim();
    if (!email) { alert("Email required."); return; }
    const token = Math.random().toString(36).slice(2, 10);
    S.auth.invites.push({ email, token, role: "staff", created: nowISO() });
    save(S);
    $("#invitePreview").textContent = `Invite token for ${email}: ${token}\n(Front-end only demo)`;
  });

  $("#resetAppBtn").addEventListener("click", () => {
    if (confirm("This will clear all data. Are you sure?")) {
      localStorage.removeItem(LS_KEY);
      location.reload();
    }
  });

  // ---- BizBot ----
  const botSuggestions = [
    "Low-stock items",
    "Top sellers this week",
    "Revenue forecast",
    "Profit analysis",
    "Restock recommendations"
  ];

  function botPost(text, me = false) {
    const div = document.createElement("div");
    div.className = "bubble" + (me ? " me" : "");
    div.innerHTML = text;
    $("#botLog").appendChild(div);
    $("#botLog").scrollTop = $("#botLog").scrollHeight;
  }

  function botHandle(q) {
    const s = q.toLowerCase();
    const cur = S.biz.currency || "৳";

    if (s.includes("low") || s.includes("stock")) {
      const def = S.biz.defaultLow || 5;
      const items = S.inventory.filter(p => p.stock <= (p.low ?? def));

      if (items.length === 0) {
        botPost("✅ Great news! All items are well-stocked.");
      } else {
        let response = `⚠️ <strong>${items.length} low-stock items:</strong><br><br>`;
        items.slice(0, 5).forEach(p => {
          const predicted = predictDemand(p.sku, 7);
          const reorder = Math.max(predicted * 2, (p.low ?? def) * 2);
          response += `• <strong>${p.name}</strong><br>Current: ${p.stock} | Reorder: ${reorder} units (${cur}${(reorder * p.buy).toFixed(0)})<br><br>`;
        });
        if (items.length > 5) response += `...and ${items.length - 5} more`;
        botPost(response);
      }

    } else if (s.includes("top") || s.includes("seller") || s.includes("best")) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const tally = {};
      const revenue = {};

      S.sales.filter(x => new Date(x.date) >= cutoff).forEach(s =>
        s.items.forEach(i => {
          tally[i.sku] = (tally[i.sku] || 0) + i.qty;
          revenue[i.sku] = (revenue[i.sku] || 0) + (i.qty * i.price);
        })
      );

      const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5);

      if (top.length === 0) {
        botPost("📊 No sales data available for the last 7 days.");
      } else {
        let response = "🔥 <strong>Top sellers (last 7 days):</strong><br><br>";
        top.forEach(([sku, qty], idx) => {
          const p = S.inventory.find(x => x.sku === sku);
          if (p) {
            response += `${idx + 1}. <strong>${p.name}</strong><br>`;
            response += `   Sold: ${qty} units | Revenue: ${cur}${revenue[sku].toFixed(0)}<br><br>`;
          }
        });
        botPost(response);
      }

    } else if (s.includes("revenue") || s.includes("sales") || s.includes("income")) {
      const last7 = sumRevenue(7);
      const last30 = sumRevenue(30);
      const forecast = forecast7();

      let response = "💰 <strong>Revenue Summary:</strong><br><br>";
      response += `Last 7 days: ${cur}${last7.toFixed(2)}<br>`;
      response += `Last 30 days: ${cur}${last30.toFixed(2)}<br>`;
      response += `Forecast (next 7d): ${cur}${forecast.toFixed(2)}<br><br>`;

      const trend = analyzeTrend();
      if (trend) response += `📈 ${trend}`;

      botPost(response);

    } else if (s.includes("profit") || s.includes("margin")) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      let totalRevenue = 0;
      let totalCost = 0;

      S.sales.filter(s => new Date(s.date) >= cutoff).forEach(sale => {
        sale.items.forEach(item => {
          const product = S.inventory.find(p => p.sku === item.sku);
          if (product) {
            totalRevenue += item.qty * item.price;
            totalCost += item.qty * product.buy;
          }
        });
      });

      const profit = totalRevenue - totalCost;
      const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

      let response = "📊 <strong>Profit Analysis (30 days):</strong><br><br>";
      response += `Revenue: ${cur}${totalRevenue.toFixed(2)}<br>`;
      response += `Cost: ${cur}${totalCost.toFixed(2)}<br>`;
      response += `<strong>Profit: ${cur}${profit.toFixed(2)}</strong><br>`;
      response += `Margin: ${margin}%<br><br>`;

      if (margin < 20) {
        response += "💡 Tip: Consider reviewing pricing to improve margins.";
      } else {
        response += "✅ Good margin! Keep up the great work.";
      }

      botPost(response);

    } else if (s.includes("forecast") || s.includes("predict") || s.includes("future")) {
      const forecast = forecast7();
      const current7 = sumRevenue(7);
      const change = current7 > 0 ? (((forecast - current7) / current7) * 100).toFixed(1) : 0;

      let response = "🔮 <strong>7-Day Forecast:</strong><br><br>";
      response += `Predicted revenue: ${cur}${forecast.toFixed(2)}<br>`;
      response += `Current week: ${cur}${current7.toFixed(2)}<br>`;
      response += `Expected change: ${change > 0 ? '+' : ''}${change}%<br><br>`;
      response += "📌 This forecast uses weighted moving average and trend analysis.";

      botPost(response);

    } else if (s.includes("restock") || s.includes("order") || s.includes("buy")) {
      const def = S.biz.defaultLow || 5;
      const lowStock = S.inventory.filter(p => p.stock <= (p.low ?? def));

      if (lowStock.length === 0) {
        botPost("✅ No items need restocking right now!");
      } else {
        let totalCost = 0;
        let response = "📦 <strong>Restock Recommendations:</strong><br><br>";

        lowStock.slice(0, 8).forEach(p => {
          const predicted = predictDemand(p.sku, 14);
          const reorder = Math.max(predicted, (p.low ?? def) * 3);
          const cost = reorder * p.buy;
          totalCost += cost;

          response += `• ${p.name}: ${reorder} units (${cur}${cost.toFixed(0)})<br>`;
        });

        response += `<br><strong>Total investment: ${cur}${totalCost.toFixed(0)}</strong>`;

        if (lowStock.length > 8) {
          response += `<br><br>Plus ${lowStock.length - 8} more items...`;
        }

        botPost(response);
      }

    } else if (s.includes("bundle") || s.includes("combo") || s.includes("pair")) {
      const bundles = findFrequentPairs();

      if (bundles.length === 0) {
        botPost("🎁 Not enough sales data yet to suggest bundles. Check back after more sales!");
      } else {
        let response = "🎁 <strong>Bundle Opportunities:</strong><br><br>";
        bundles.forEach(([p1, p2], idx) => {
          const combo = Math.ceil((p1.sell + p2.sell) * 0.9);
          const savings = (p1.sell + p2.sell) - combo;
          response += `${idx + 1}. ${p1.name} + ${p2.name}<br>`;
          response += `   Bundle price: ${cur}${combo} (Save ${cur}${savings})<br><br>`;
        });
        botPost(response);
      }

    } else if (s.includes("inventory") || s.includes("value") || s.includes("worth")) {
      const value = inventoryValue();
      const items = S.inventory.length;
      const totalUnits = S.inventory.reduce((sum, p) => sum + p.stock, 0);

      let response = "📦 <strong>Inventory Summary:</strong><br><br>";
      response += `Total value: ${cur}${value.toFixed(2)}<br>`;
      response += `Products: ${items}<br>`;
      response += `Total units: ${totalUnits}<br><br>`;

      const topValue = S.inventory
        .map(p => ({ ...p, value: p.stock * p.buy }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

      response += "💎 <strong>Highest value items:</strong><br>";
      topValue.forEach(p => {
        response += `• ${p.name}: ${cur}${p.value.toFixed(0)}<br>`;
      });

      botPost(response);

    } else if (s.includes("help") || s.includes("what") || s.includes("can")) {
      botPost(`👋 I'm BizBot! I can help you with:<br><br>
        📊 Sales & revenue analysis<br>
        📦 Inventory & stock alerts<br>
        🔮 Forecasting & predictions<br>
        💰 Profit analysis<br>
        🎁 Bundle recommendations<br>
        📈 Business insights<br><br>
        Just ask me anything about your business!`);
    } else {
      botPost("🤔 I'm not sure about that. Try asking about: low stock, top sellers, revenue, profit, forecasts, or restocking!");
    }
  }

  $("#botFab").addEventListener("click", () => $("#botPanel").classList.toggle("hidden"));
  $("#botClose").addEventListener("click", () => $("#botPanel").classList.add("hidden"));
  $("#botSend").addEventListener("click", () => {
    const msg = $("#botMsg").value.trim();
    if (!msg) return;
    botPost(msg, true);
    $("#botMsg").value = "";
    setTimeout(() => botHandle(msg), 200);
  });

  $("#botMsg").addEventListener("keypress", e => {
    if (e.key === "Enter") $("#botSend").click();
  });

  $("#botSuggestions").innerHTML = botSuggestions.map(s =>
    `<button class="btn-ghost btn-small sug">${s}</button>`
  ).join("");

  $$(".sug").forEach(b => b.addEventListener("click", () => {
    botPost(b.textContent, true);
    setTimeout(() => botHandle(b.textContent), 200);
  }));

  // ---- Camera Scanning Functionality ----

  // Add camera button to inventory header
  function addCameraButton() {
    const headerActions = $(".header-actions");
    if (headerActions && !$("#cameraScanBtn")) {
      const cameraBtn = document.createElement("button");
      cameraBtn.id = "cameraScanBtn";
      cameraBtn.className = "camera-btn";
      cameraBtn.innerHTML = `
      <i class="fas fa-camera"></i>
      <span>Scan Product</span>
    `;
      headerActions.appendChild(cameraBtn);

      cameraBtn.addEventListener("click", openCameraModal);
    }
  }

  let stream = null;

  function openCameraModal() {
    showModal("#cameraModal");
    resetCameraModal();
  }

  function resetCameraModal() {
    $("#cameraPreview").classList.add("hidden");
    $("#productForm").classList.add("hidden");
    $("#saveScannedProduct").classList.add("hidden");
    $("#captureBtn").classList.add("hidden");
    $("#retakeBtn").classList.add("hidden");
    $("#startCamera").classList.remove("hidden");

    const video = $("#cameraVideo");
    const canvas = $("#cameraCanvas");
    video.srcObject = null;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  $("#startCamera").addEventListener("click", async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Prefer rear camera
      });

      const video = $("#cameraVideo");
      video.srcObject = stream;

      $("#startCamera").classList.add("hidden");
      $("#captureBtn").classList.remove("hidden");

    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please check permissions and try again.");
    }
  });

  $("#captureBtn").addEventListener("click", () => {
    const video = $("#cameraVideo");
    const canvas = $("#cameraCanvas");
    const preview = $("#previewImage");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL for preview
    const imageData = canvas.toDataURL('image/jpeg');
    preview.src = imageData;

    // Show preview and hide video
    $("#cameraPreview").classList.remove("hidden");
    video.classList.add("hidden");

    // Show product form and controls
    $("#productForm").classList.remove("hidden");
    $("#saveScannedProduct").classList.remove("hidden");
    $("#retakeBtn").classList.remove("hidden");
    $("#captureBtn").classList.add("hidden");

    // Auto-generate SKU
    $("#scannedProductSku").value = "SCAN" + Date.now().toString().slice(-6);

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  });

  $("#retakeBtn").addEventListener("click", () => {
    resetCameraModal();
    $("#startCamera").click(); // Restart camera automatically
  });

  $("#saveScannedProduct").addEventListener("click", () => {
    const name = $("#scannedProductName").value.trim();
    const sku = $("#scannedProductSku").value.trim();
    const stock = Number($("#scannedProductStock").value || 1);
    const buy = Number($("#scannedProductBuy").value || 0);
    const sell = Number($("#scannedProductSell").value || 0);

    if (!name) {
      alert("Please enter a product name");
      return;
    }

    // Create new product
    const newProduct = {
      id: crypto.randomUUID(),
      name,
      sku,
      stock,
      buy,
      sell,
      low: S.biz.defaultLow || 5
    };

    S.inventory.push(newProduct);
    save(S);

    alert(`Product "${name}" added successfully!`);
    hideModal("#cameraModal");
    renderInventory();
    renderDashboard();
  });

  // Initialize camera button when app loads
  setTimeout(addCameraButton, 100);

  // ---- Routing render ----
  function renderRoute(route) {
    if (route === "dashboard") renderDashboard();
    if (route === "inventory") renderInventory(restockOnly);
    if (route === "billing") renderBilling();
    if (route === "ads") renderAds();
    if (route === "recommend") renderRecommendations();
    if (route === "employees") renderEmployees();
  }

  function renderAll() {
    applyI18n();
    renderRoute("dashboard");
  }

  renderAll();
})();

const logoutBtn = document.getElementById("logoutBtn");
const authModal = document.getElementById("authModal");
const app = document.getElementById("app");

logoutBtn.addEventListener("click", () => {
  const confirmLogout = confirm("Are you sure you want to log out?");
  if (!confirmLogout) return;

  // 🔐 Clear auth/session data
  localStorage.removeItem("hk_user");
  localStorage.removeItem("hk_business");
  sessionStorage.clear();

  // 🔄 Reset UI
  authModal.classList.add("show");
  authModal.classList.remove("hidden");

  // Optional: reset active page
  document.querySelectorAll(".page").forEach(p => p.classList.remove("show"));
  document.getElementById("page-dashboard").classList.add("show");

  // Optional: reset sidebar active button
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('[data-route="dashboard"]').classList.add("active");
});
