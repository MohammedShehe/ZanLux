(() => {
  const C = window.ZANLUX; const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => `${C.CURRENCY} ${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  // Cloudinary delivery optimisation: auto format/quality + sensible width (other URLs are left untouched)
  const opt = (u, w = 700) => (u && /res\.cloudinary\.com\/.+\/image\/upload\//.test(u) && !/\/upload\/[a-z]_/.test(u)) ? u.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${w}/`) : u;
  const BOTTLE = '<svg class="ph" viewBox="0 0 64 64" fill="none" stroke="#d4af55" stroke-width="1.6"><rect x="26" y="4" width="12" height="8" rx="1"/><rect x="22" y="12" width="20" height="6" rx="1"/><circle cx="32" cy="40" r="18"/><path d="M20 38c4-6 12-8 22-2" opacity=".5"/></svg>';
  let info = { settings: {}, categories: [], product_count: 0 }; let products = []; let state = { q: '', category: '', sort: '', price: '', avail: false, page: 1, total: 0 };
  let cart = JSON.parse(localStorage.getItem('zl_cart') || '[]'); const LIMIT = 12;

  async function api(path, opts = {}) {
    let res; try { res = await fetch(`${C.API}/public/${C.SLUG}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts }); } catch { throw new Error('Cannot reach the shop right now. Please check your connection.'); }
    let d = null; try { d = await res.json(); } catch (_) {} if (!res.ok) throw new Error((d && d.message) || 'Something went wrong'); return d;
  }
  function toast(m, err) { const t = document.createElement('div'); t.className = 'zt' + (err ? ' err' : ''); t.textContent = m; $('#toasts').appendChild(t); setTimeout(() => { t.style.opacity = 0; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, 2600); }
  const waNum = () => String(info.settings.whatsapp || '255774040506').replace(/\D/g, '');
  const waLink = text => `https://wa.me/${waNum()}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  /* ---------- static chrome ---------- */
  $('#yr').textContent = new Date().getFullYear();
  const sp = $('.sparkles'); for (let i = 0; i < 26; i++) { const e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.top = 30 + Math.random() * 70 + '%'; e.style.animationDelay = Math.random() * 6 + 's'; e.style.animationDuration = 5 + Math.random() * 5 + 's'; sp.appendChild(e); }
  const onScroll = () => $('#nav').classList.toggle('scrolled', window.scrollY > 40); onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  $$('#menu .nav-link').forEach(a => a.addEventListener('click', () => { const c = bootstrap.Collapse.getInstance($('#menu')); if (c) c.hide(); }));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.section-head,.step,.mini,.founder,.contact-form,.about-card,.strip .col-6').forEach(e => { e.classList.add('io'); io.observe(e); });
  const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('.zl-nav .nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id],header[id]').forEach(s => spy.observe(s));

  /* ---------- shop info ---------- */
  function applyInfo() {
    const s = info.settings;
    document.title = `${info.name || 'ZanLux Scents'} — Luxury Perfumes & Fragrances${s.location ? ' in ' + s.location : ''}`;
    if (s.announcement) { const a = $('#announce'); a.textContent = s.announcement; a.classList.remove('d-none'); document.body.classList.add('has-announce'); }
    if (s.hero_title) { const parts = s.hero_title.trim().split(' '); const k = Math.ceil(parts.length / 2); $('#heroTitle').innerHTML = `${esc(parts.slice(0, k).join(' '))} <em>${esc(parts.slice(k).join(' '))}</em>`; }
    if (s.hero_subtitle) $('#heroSub').textContent = s.hero_subtitle;
    if (s.about) $('#aboutText').textContent = s.about;
    $('#statProducts').textContent = info.product_count || '—';
    const vm = []; if (s.mission) vm.push(`<h5>Our mission</h5><p>${esc(s.mission)}</p>`); if (s.vision) vm.push(`<h5>Our vision</h5><p>${esc(s.vision)}</p>`); $('#vm').innerHTML = vm.join('');
    $('#values').innerHTML = (s.values || []).map(v => `<div class="col-sm-6"><div class="mini"><b>${esc(v.title)}</b><span>${esc(v.text)}</span></div></div>`).join('');
    const f = s.founder || {}; if (f.name) $('#fName').textContent = f.name;
    $('#fMeta').textContent = ['Doctor by profession', f.origin, f.since ? 'Founded ' + f.since : ''].filter(Boolean).join(' · '); if (f.bio) $('#fBio').textContent = f.bio;
    const links = []; if (f.phone) links.push(`<a class="chip-link" href="tel:${esc(f.phone.replace(/\s/g, ''))}"><i class="bi bi-telephone"></i>${esc(f.phone)}</a>`); if (f.portfolio) links.push(`<a class="chip-link" target="_blank" rel="noopener" href="https://${esc(f.portfolio.replace(/^https?:\/\//, ''))}"><i class="bi bi-globe2"></i>Portfolio</a>`); $('#fLinks').innerHTML = links.join('');
    const phone = s.phone || '+255 774 040 506';
    $('#contactList').innerHTML = [
      [`tel:${phone.replace(/\s/g, '')}`, 'bi-telephone', 'Call us', phone], [waLink(), 'bi-whatsapp', 'WhatsApp', phone], s.email ? [`mailto:${s.email}`, 'bi-envelope', 'Email', s.email] : null,
      [s.map_url || `https://www.google.com/maps/search/${encodeURIComponent((s.address || '') + ' ' + (s.location || 'Dodoma, Tanzania'))}`, 'bi-geo-alt', 'Visit us', [s.address, s.location].filter(Boolean).join(', ') || 'Dodoma, Tanzania'],
      s.hours ? [null, 'bi-clock', 'Opening hours', s.hours] : null, s.instagram ? [s.instagram, 'bi-instagram', 'Instagram', '@zanlux_scents'] : null
    ].filter(Boolean).map(([h, i, l, t]) => `<${h ? `a href="${esc(h)}" target="_blank" rel="noopener"` : 'div'} class="item"><i class="bi ${i}"></i><div><small>${l}</small>${esc(t)}</div></${h ? 'a' : 'div'}>`).join('');
    $('#socials').innerHTML = [s.instagram ? `<a href="${esc(s.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><i class="bi bi-instagram"></i></a>` : '', s.facebook ? `<a href="${esc(s.facebook)}" target="_blank" rel="noopener" aria-label="Facebook"><i class="bi bi-facebook"></i></a>` : '', s.tiktok ? `<a href="${esc(s.tiktok)}" target="_blank" rel="noopener" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>` : '', `<a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>`].join('');
    $('#footAddr').textContent = [s.address, s.location].filter(Boolean).join(', ') || 'Dodoma, Tanzania';
    $$('[data-wa]').forEach(a => { a.href = waLink('Hello ZanLux, I would like to know more about your perfumes.'); a.target = '_blank'; a.rel = 'noopener'; });
    const tpl = { '@context': 'https://schema.org', '@type': 'Store', name: info.name || 'ZanLux Scents', description: info.tagline, telephone: phone, url: 'https://zanlux.online', image: 'https://zanlux.online/assets/zanlux-icon.png', address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: 'Dodoma', addressCountry: 'TZ' }, sameAs: [s.instagram].filter(Boolean) };
    let ld = $('#ld'); if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'ld'; document.head.appendChild(ld); } ld.textContent = JSON.stringify(tpl);
    $('#cats').innerHTML = `<button class="cchip ${state.category ? '' : 'active'}" data-c="">All</button>` + info.categories.map(c => `<button class="cchip ${state.category == c.id ? 'active' : ''}" data-c="${c.id}">${esc(c.name)}</button>`).join('');
    $$('#cats .cchip').forEach(b => b.onclick = () => { state.category = b.dataset.c; state.page = 1; applyInfoCats(); loadProducts(true); });
    const p = $('#price'); if (p.options.length < 2) { [['', 'Any price'], ['0-50000', 'Under 50,000'], ['50000-100000', '50,000 – 100,000'], ['100000-200000', '100,000 – 200,000'], ['200000-', 'Above 200,000']].forEach(([v, t], i) => { if (i) p.add(new Option(t, v)); }); }
  }
  const applyInfoCats = () => $$('#cats .cchip').forEach(b => b.classList.toggle('active', b.dataset.c === String(state.category)));

  /* ---------- products ---------- */
  const tagFor = p => p.availability === 'out' ? '<span class="tag out">Sold out</span>' : p.availability === 'low' ? '<span class="tag low">Few left</span>' : p.is_featured ? '<span class="tag">Featured</span>' : '';
  const card = p => `<div class="col-6 col-md-4 col-xl-3"><article class="pcard"><div class="pimg" data-v="${p.id}">${p.image_url ? `<img src="${esc(opt(p.image_url, 600))}" alt="${esc(p.name)}" loading="lazy">` : BOTTLE}${tagFor(p)}</div><div class="pbody">${p.brand ? `<div class="pbrand">${esc(p.brand)}</div>` : ''}<h3 class="pname" data-v="${p.id}">${esc(p.name)}</h3>${p.size ? `<div class="psize">${esc(p.size)}</div>` : ''}<div class="pfoot"><div class="price">${money(p.price)}</div><button class="add-btn" data-a="${p.id}" ${p.availability === 'out' ? 'disabled' : ''} aria-label="Add ${esc(p.name)} to bag"><i class="bi bi-plus-lg"></i></button></div></div></article></div>`;
  function paint(append) {
    const g = $('#grid');
    if (!products.length) { g.innerHTML = `<div class="col-12"><div class="empty-state"><i class="bi bi-flower1"></i><h4>${state.q || state.category || state.price ? 'No fragrances match your search' : 'Our collection is being curated'}</h4><p>${state.q || state.category || state.price ? 'Try clearing the filters.' : 'New arrivals are coming very soon. Message us on WhatsApp for what is available today.'}</p><a href="${waLink('Hello ZanLux, what fragrances do you have available?')}" target="_blank" rel="noopener" class="btn btn-gold mt-2"><i class="bi bi-whatsapp me-2"></i>Ask on WhatsApp</a></div></div>`; }
    else if (append) g.insertAdjacentHTML('beforeend', products.slice(-state.lastBatch).map(card).join('')); else g.innerHTML = products.map(card).join('');
    $('#resultLine').textContent = state.total ? `Showing ${products.length} of ${state.total} fragrance${state.total === 1 ? '' : 's'}` : '';
    $('#more').classList.toggle('d-none', products.length >= state.total);
  }
  let fetching = 0;
  async function loadProducts(reset, silent) {
    const my = ++fetching; if (reset) { state.page = 1; if (!silent) $('#grid').innerHTML = Array.from({ length: 8 }, () => '<div class="col-6 col-md-4 col-xl-3"><div class="skel"></div></div>').join(''); }
    const [min, max] = (state.price || '').split('-');
    const params = new URLSearchParams({ limit: reset && silent ? Math.max(LIMIT, products.length) : LIMIT, page: reset && silent ? 1 : state.page, sort: state.sort }); if (state.q) params.set('q', state.q); if (state.category) params.set('category', state.category); if (min) params.set('min', min); if (max) params.set('max', max); if (state.avail) params.set('available', '1');
    try { const r = await api('/products?' + params); if (my !== fetching) return; state.total = r.total; state.lastBatch = r.rows.length;
      if (reset) products = r.rows; else products = products.concat(r.rows); paint(!reset); syncCart(); }
    catch (e) { if (!silent) { $('#grid').innerHTML = `<div class="col-12"><div class="empty-state"><i class="bi bi-wifi-off"></i><h4>We couldn’t load the collection</h4><p>${esc(e.message)}</p><button class="btn btn-ghost" onclick="location.reload()">Try again</button></div></div>`; } }
  }
  $('#more').onclick = () => { state.page++; loadProducts(false); };
  let st; $('#q').oninput = e => { clearTimeout(st); st = setTimeout(() => { state.q = e.target.value.trim(); loadProducts(true); }, 350); };
  $('#sort').onchange = e => { state.sort = e.target.value; loadProducts(true); }; $('#price').onchange = e => { state.price = e.target.value; loadProducts(true); }; $('#avail').onchange = e => { state.avail = e.target.checked; loadProducts(true); };
  $('#grid').addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (a) return add(Number(a.dataset.a)); const v = e.target.closest('[data-v]'); if (v) quick(Number(v.dataset.v)); });

  /* ---------- quick view ---------- */
  function modal(id, html, size = '') { let el = document.getElementById(id); if (el) { bootstrap.Modal.getInstance(el)?.dispose(); el.remove(); } el = document.createElement('div'); el.className = 'modal fade'; el.id = id; el.tabIndex = -1; el.innerHTML = `<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable ${size}"><div class="modal-content">${html}</div></div>`; $('#modals').appendChild(el); const m = new bootstrap.Modal(el); m.show(); return { el, m }; }
  async function quick(id) {
    let p = products.find(x => x.id === id); try { p = await api('/products/' + id); } catch (_) {} if (!p) return;
    const { el, m } = modal('qv', `<div class="modal-header border-0 pb-0"><button class="btn-close ms-auto" data-bs-dismiss="modal"></button></div><div class="modal-body pt-0"><div class="row g-4"><div class="col-md-6"><div class="pimg rounded-4" style="cursor:default">${p.image_url ? `<img src="${esc(opt(p.image_url, 900))}" alt="${esc(p.name)}">` : BOTTLE}${tagFor(p)}</div></div><div class="col-md-6 d-flex flex-column"><div class="pbrand">${esc(p.brand || p.category_name || '')}</div><h3 style="font-size:2rem">${esc(p.name)}</h3>${p.size ? `<div class="psize mb-2">${esc(p.size)}</div>` : ''}<div class="price mb-3" style="font-size:1.9rem">${money(p.price)}</div><p class="muted-t" style="white-space:pre-line">${esc(p.description || 'A refined fragrance from our curated collection. Message us to learn more about its notes and longevity.')}</p><div class="small mb-3">${p.availability === 'out' ? '<span class="text-danger">Currently sold out</span>' : p.availability === 'low' ? '<span style="color:#ffb84d">Only a few left</span>' : '<span class="text-success">In stock</span>'}</div><div class="mt-auto d-flex gap-2 flex-wrap"><button class="btn btn-gold flex-grow-1" id="qvAdd" ${p.availability === 'out' ? 'disabled' : ''}><i class="bi bi-bag-plus me-2"></i>Add to bag</button><a class="btn btn-ghost" target="_blank" rel="noopener" href="${waLink('Hello ZanLux, I am interested in ' + p.name + (p.size ? ' (' + p.size + ')' : '') + '.')}"><i class="bi bi-whatsapp"></i></a></div></div></div></div>`, 'modal-lg');
    $('#qvAdd', el).onclick = () => { add(p.id, p); m.hide(); };
  }

  /* ---------- cart ---------- */
  const save = () => localStorage.setItem('zl_cart', JSON.stringify(cart));
  function add(id, p) {
    p = p || products.find(x => x.id === id); if (!p) return; const l = cart.find(x => x.id === id);
    if (l) { if (l.qty >= p.max_qty) return toast(`Only ${p.max_qty} available`, true); l.qty++; l.max = p.max_qty; l.price = p.price; } else cart.push({ id, qty: 1, name: p.name, price: p.price, size: p.size, image: p.image_url, max: p.max_qty });
    save(); drawCart(); toast(`${p.name} added to your bag`); const c = $('#cartCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  }
  function syncCart() { // keep prices/limits fresh from the live catalogue
    let ch = false; cart.forEach(l => { const p = products.find(x => x.id === l.id); if (p) { if (p.price !== l.price) { l.price = p.price; ch = true; } if (p.max_qty !== l.max) { l.max = p.max_qty; if (l.qty > l.max) l.qty = Math.max(1, l.max); ch = true; } } }); if (ch) { save(); drawCart(); }
  }
  function drawCart() {
    const n = cart.reduce((s, l) => s + l.qty, 0); const c = $('#cartCount'); c.textContent = n; c.classList.toggle('d-none', !n);
    $('#cartLines').innerHTML = cart.length ? cart.map(l => `<div class="cl"><div class="im">${l.image ? `<img src="${esc(opt(l.image, 160))}" alt="">` : BOTTLE}</div><div><div class="n">${esc(l.name)}</div><div class="s">${esc(l.size || '')} ${money(l.price)}</div><div class="qty"><button data-m="${l.id}" aria-label="Less">−</button><span>${l.qty}</span><button data-p="${l.id}" aria-label="More">+</button></div></div><div class="text-end"><div class="fw-semibold small mb-2">${money(l.price * l.qty)}</div><button class="rm" data-r="${l.id}" aria-label="Remove"><i class="bi bi-trash3"></i></button></div></div>`).join('') : '<div class="empty-state"><i class="bi bi-bag"></i><h4>Your bag is empty</h4><p>Add a fragrance you love.</p><a href="#shop" class="btn btn-ghost" data-bs-dismiss="offcanvas">Browse collection</a></div>';
    $('#cartTotal').textContent = money(cart.reduce((s, l) => s + l.price * l.qty, 0)); $('#checkoutBtn').disabled = !cart.length;
    $$('#cartLines [data-m]').forEach(b => b.onclick = () => { const l = cart.find(x => x.id == b.dataset.m); l.qty--; if (l.qty < 1) cart = cart.filter(x => x !== l); save(); drawCart(); });
    $$('#cartLines [data-p]').forEach(b => b.onclick = () => { const l = cart.find(x => x.id == b.dataset.p); if (l.qty >= l.max) return toast(`Only ${l.max} available`, true); l.qty++; save(); drawCart(); });
    $$('#cartLines [data-r]').forEach(b => b.onclick = () => { cart = cart.filter(x => x.id != b.dataset.r); save(); drawCart(); });
  }
  $('#cartBtn').onclick = () => bootstrap.Offcanvas.getOrCreateInstance($('#cart')).show();

  /* ---------- checkout ---------- */
  $('#checkoutBtn').onclick = () => { bootstrap.Offcanvas.getInstance($('#cart')).hide(); checkout(); };
  function checkout() {
    const saved = JSON.parse(localStorage.getItem('zl_cust') || '{}'); const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
    const { el, m } = modal('co', `<div class="modal-header"><h5 class="modal-title">Complete your order</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="mb-3 p-3 rounded-4" style="background:var(--card)">${cart.map(l => `<div class="d-flex justify-content-between small py-1"><span>${l.qty} × ${esc(l.name)}</span><span>${money(l.price * l.qty)}</span></div>`).join('')}<hr style="border-color:var(--line)"><div class="d-flex justify-content-between"><b>Total</b><b class="text-gold">${money(total)}</b></div></div>
      <div class="alert-err d-none mb-3 p-3 rounded-4 small" style="background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:#ff8a8a" id="coErr"></div>
      <div class="row g-3"><div class="col-12"><label class="form-label">Full name *</label><input class="form-control" id="cName" value="${esc(saved.name || '')}" autocomplete="name"></div><div class="col-md-6"><label class="form-label">Phone / WhatsApp *</label><input class="form-control" id="cPhone" inputmode="tel" placeholder="0774 040 506" value="${esc(saved.phone || '')}" autocomplete="tel"></div><div class="col-md-6"><label class="form-label">Email (optional)</label><input class="form-control" id="cEmail" type="email" value="${esc(saved.email || '')}" autocomplete="email"></div>
      <div class="col-12"><label class="form-label">How would you like to receive it?</label><div class="delivery-opt"><label><input type="radio" name="dm" value="pickup" checked> <i class="bi bi-shop me-1"></i>Pick up</label><label><input type="radio" name="dm" value="delivery"> <i class="bi bi-truck me-1"></i>Delivery</label></div></div>
      <div class="col-12 d-none" id="addrBox"><label class="form-label">Delivery address *</label><input class="form-control" id="cAddr" placeholder="Area, street, landmark" value="${esc(saved.address || '')}"></div>
      <div class="col-12"><label class="form-label">Note (optional)</label><textarea class="form-control" id="cNote" rows="2" placeholder="Anything we should know?"></textarea></div><div style="position:absolute;left:-9999px" aria-hidden="true"><input id="cHp" tabindex="-1" autocomplete="off"></div></div>
      <p class="small muted-t mt-3 mb-0"><i class="bi bi-shield-lock me-1"></i>${esc(info.settings.order_note || 'We will contact you shortly to confirm your order.')} No payment is taken online.</p></div>
      <div class="modal-footer border-0"><button class="btn btn-gold w-100" id="place">Place order · ${money(total)}</button></div>`);
    $$('input[name=dm]', el).forEach(r => r.onchange = () => $('#addrBox', el).classList.toggle('d-none', r.value !== 'delivery' || !r.checked));
    $('#place', el).onclick = async () => {
      const err = $('#coErr', el); err.classList.add('d-none'); const b = $('#place', el); const v = id => $('#' + id, el).value.trim();
      const body = { customer_name: v('cName'), customer_phone: v('cPhone'), customer_email: v('cEmail'), delivery_method: $('input[name=dm]:checked', el).value, address: v('cAddr'), notes: v('cNote'), company: v('cHp'), items: cart.map(l => ({ product_id: l.id, qty: l.qty })) };
      if (body.customer_name.length < 2) return show('Please enter your full name'); if (!/^\+?[0-9][0-9\s-]{7,16}$/.test(body.customer_phone)) return show('Please enter a valid phone number'); if (body.delivery_method === 'delivery' && body.address.length < 4) return show('Please tell us where to deliver');
      function show(msg) { err.textContent = msg; err.classList.remove('d-none'); }
      b.disabled = true; b.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending your order…';
      try { const r = await api('/orders', { method: 'POST', body: JSON.stringify(body) });
        localStorage.setItem('zl_cust', JSON.stringify({ name: body.customer_name, phone: body.customer_phone, email: body.customer_email, address: body.address }));
        const rec = JSON.parse(localStorage.getItem('zl_orders') || '[]'); rec.unshift({ no: r.order_no, phone: body.customer_phone }); localStorage.setItem('zl_orders', JSON.stringify(rec.slice(0, 5)));
        const lines = cart.map(l => `• ${l.qty} × ${l.name} (${money(l.price * l.qty)})`).join('\n'); const wa = waLink(`Hello ZanLux, I just placed order ${r.order_no}.\n${lines}\nTotal: ${money(r.total)}\nName: ${body.customer_name}`);
        cart = []; save(); drawCart();
        el.querySelector('.modal-content').innerHTML = `<div class="modal-body text-center p-4 p-md-5"><div class="success-ring"><i class="bi bi-check-lg"></i></div><h3>Thank you, ${esc(body.customer_name.split(' ')[0])}!</h3><p class="muted-t">Your order has been received.</p><div class="order-no">${esc(r.order_no)}</div><p class="small muted-t mt-2">${esc(r.message)}<br>Keep this number to track your order.</p><div class="d-grid gap-2 mt-4"><a class="btn btn-gold" target="_blank" rel="noopener" href="${wa}"><i class="bi bi-whatsapp me-2"></i>Send order on WhatsApp (faster)</a><button class="btn btn-ghost" data-bs-dismiss="modal">Continue shopping</button></div></div>`;
        loadProducts(true, true);
      } catch (e) { show(e.message); b.disabled = false; b.textContent = 'Place order'; loadProducts(true, true); }
    };
  }

  /* ---------- tracking ---------- */
  $('#trackBtn').onclick = () => {
    const last = JSON.parse(localStorage.getItem('zl_orders') || '[]')[0] || {};
    const { el } = modal('tr', `<div class="modal-header"><h5 class="modal-title">Track your order</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="row g-3"><div class="col-md-6"><label class="form-label">Order number</label><input class="form-control" id="tNo" placeholder="ZL-W00001" value="${esc(last.no || '')}"></div><div class="col-md-6"><label class="form-label">Phone used</label><input class="form-control" id="tPh" inputmode="tel" value="${esc(last.phone || '')}"></div><div class="col-12"><button class="btn btn-gold w-100" id="tGo">Check status</button></div></div><div id="tRes" class="mt-4"></div></div>`);
    $('#tGo', el).onclick = async () => { const r = $('#tRes', el); r.innerHTML = '<div class="text-center"><div class="spinner-border text-warning"></div></div>';
      try { const o = await api(`/orders/track?order_no=${encodeURIComponent($('#tNo', el).value)}&phone=${encodeURIComponent($('#tPh', el).value)}`); const steps = [['new', 'Received', 'bi-inbox'], ['contacted', 'Contacted', 'bi-telephone'], ['confirmed', 'Confirmed', 'bi-check2-circle'], ['completed', 'Completed', 'bi-gift']]; const idx = steps.findIndex(s => s[0] === o.status);
        r.innerHTML = `<div class="d-flex justify-content-between"><b class="order-no" style="font-size:1.4rem">${esc(o.order_no)}</b><b class="text-gold">${money(o.total)}</b></div>${o.status === 'cancelled' ? '<div class="p-3 rounded-4 mt-3" style="background:rgba(255,107,107,.1);color:#ff8a8a">This order was cancelled. Please contact us if this is unexpected.</div>' : `<div class="tl">${steps.map((s, i) => `<div class="s ${i <= idx ? 'done' : ''}"><i class="bi ${s[2]}"></i>${s[1]}</div>`).join('')}</div>`}<div class="small muted-t">${o.items.map(i => `${i.qty} × ${esc(i.name)}`).join('<br>')}</div>`; }
      catch (e) { r.innerHTML = `<div class="p-3 rounded-4 small" style="background:rgba(255,107,107,.1);color:#ff8a8a">${esc(e.message)}</div>`; } };
  };

  /* ---------- contact form -> WhatsApp ---------- */
  $('#msgForm').onsubmit = e => { e.preventDefault(); const n = $('#mName').value.trim(), t = $('#mText').value.trim(); if (!n || !t) return toast('Please add your name and message', true); window.open(waLink(`Hello ZanLux, I'm ${n}${$('#mPhone').value ? ' (' + $('#mPhone').value + ')' : ''}.\n${t}`), '_blank', 'noopener'); };

  /* ---------- boot ---------- */
  drawCart();
  (async () => { try { info = await api('/info'); } catch (_) { /* fallback content stays */ } applyInfo(); await loadProducts(true);
    setInterval(() => { if (!document.hidden) { api('/info').then(i => { info = i; $('#statProducts').textContent = i.product_count || '—'; }).catch(() => {}); loadProducts(true, true); } }, C.POLL_MS);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) loadProducts(true, true); }); })();
})();
