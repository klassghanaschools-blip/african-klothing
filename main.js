// My African Wear E-commerce - Main JavaScript
// Products and users are stored in IndexedDB (via db.js).
// Cart stays in localStorage (session-scoped, small data).

class AfriWearApp {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('afriCart')) || [];
    this.products = [];   // populated async from Supabase
    this.filters = { category: [], color: [], size: [], priceRange: [0, 1000], gender: [] };

    // Initialize global state variables
    window._activePromo = null;
    window._cartTotal = 0;
  }

  /* ── Bootstrap ─────────────────────────────────────────────────────────── */
  async init() {
    // Render cart immediately from localStorage — no network needed
    this.updateCartCounter();
    this.renderNavUser();

    if (window.location.pathname.endsWith('cart.html') ||
      window.location.href.includes('cart.html')) {
      const navBtn = document.getElementById('navCartBtn');
      const floatBtn = document.getElementById('floatCartBtn');
      if (navBtn) navBtn.style.display = 'none';
      if (floatBtn) floatBtn.style.display = 'none';

      // Render cart immediately from localStorage data (cart items already
      // contain a full product snapshot saved at add-to-cart time)
      this.renderCart();
    }

    this.initializeAnimations();
    this.bindEvents();
    this.initializeFilters();

    // Load products from Supabase in the background
    try {
      await MAWdb.init();
      this.products = await MAWdb.products.getAll();
    } catch (err) {
      console.warn('Supabase product load failed, continuing with empty catalog:', err);
      this.products = [];
    }

    // Now render page-specific content that needs the product catalog
    this.loadPageContent();
  }

  /* ── Nav user area ─────────────────────────────────────────────────────── */
  renderNavUser() {
    const area = document.getElementById('nav-user-area');
    if (!area) return;
    let user = null;
    try { user = JSON.parse(sessionStorage.getItem('afriUser')); } catch (_) { }

    if (user) {
      area.innerHTML = `
        <span style="display:flex;align-items:center;gap:0.5rem">
          <a href="orders.html" style="font-size:0.85rem;color:#D4700A;font-weight:600;text-decoration:none;">&#128230; ${user.firstName}</a>
          <button onclick="afriSignOut()"
            style="font-size:0.78rem;color:#888;background:none;border:1px solid #e0d8ce;border-radius:6px;padding:0.2rem 0.6rem;cursor:pointer;transition:all 0.2s"
            onmouseover="this.style.background='#D4700A';this.style.color='white';this.style.borderColor='#D4700A'"
            onmouseout="this.style.background='none';this.style.color='#888';this.style.borderColor='#e0d8ce'">
            Sign Out
          </button>
        </span>`;
    } else {
      area.innerHTML = `
        <a href="auth.html"
          style="font-size:0.875rem;font-weight:600;color:#D4700A;text-decoration:none;padding:0.4rem 1rem;border:1.5px solid #D4700A;border-radius:20px;transition:all 0.2s"
          onmouseover="this.style.background='#D4700A';this.style.color='white'"
          onmouseout="this.style.background='none';this.style.color='#D4700A'">
          Sign In
        </a>`;
    }
    const mobileArea = document.getElementById('mobile-user-area');
    if (mobileArea) mobileArea.innerHTML = area.innerHTML;
  }

  /* ── Cart Management ───────────────────────────────────────────────────── */
  addToCart(productId, size = 'M') {
    // Coerce productId to number to match database ID type
    productId = Number(productId);
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      console.warn(`Product not found: ${productId}`);
      return;
    }
    const existing = this.cart.find(i => i.id === productId && i.size === size);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...product, size, quantity: 1 });
    }
    this.saveCart();
    this.updateCartCounter();
    this.showAddToCartAnimation();
    if (document.querySelector('.cart-items')) this.renderCart();
  }

  removeFromCart(productId, size) {
    productId = Number(productId);
    this.cart = this.cart.filter(i => !(i.id === productId && i.size === size));
    this.saveCart();
    this.updateCartCounter();
    this.renderCart();
  }

  changeSize(productId, oldSize, newSize) {
    productId = Number(productId);
    if (oldSize === newSize) return;
    const existing = this.cart.find(i => i.id === productId && i.size === newSize);
    const current = this.cart.find(i => i.id === productId && i.size === oldSize);
    if (!current) return;
    if (existing) {
      existing.quantity += current.quantity;
      this.cart = this.cart.filter(i => !(i.id === productId && i.size === oldSize));
    } else {
      current.size = newSize;
    }
    this.saveCart();
    this.updateCartCounter();
    this.renderCart();
  }

  updateQuantity(productId, size, newQty) {
    productId = Number(productId);
    if (newQty <= 0) { this.removeFromCart(productId, size); return; }
    const item = this.cart.find(i => i.id === productId && i.size === size);
    if (item) {
      item.quantity = newQty;
      this.saveCart();
      this.updateCartCounter();
      this.renderCart();
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartCounter();
    this.renderCart();
  }

  saveCart() { localStorage.setItem('afriCart', JSON.stringify(this.cart)); }

  updateCartCounter() {
    const total = this.cart.reduce((s, i) => s + i.quantity, 0);
    ['navCartBadge', 'floatCartBadge'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = total; el.style.display = total > 0 ? 'flex' : 'none'; }
    });
    const counter = document.querySelector('.cart-counter');
    if (counter) { counter.textContent = total; counter.style.display = total > 0 ? 'flex' : 'none'; }
  }

  /* ── Filtering ─────────────────────────────────────────────────────────── */
  applyFilters() {
    let list = [...this.products];
    if (this.filters.category.length) list = list.filter(p => this.filters.category.includes(p.category));
    if (this.filters.color.length) list = list.filter(p => this.filters.color.includes(p.color));
    if (this.filters.gender.length) list = list.filter(p => this.filters.gender.includes(p.gender));
    list = list.filter(p => p.price >= this.filters.priceRange[0] && p.price <= this.filters.priceRange[1]);
    this.renderProducts(list);
    this.updateResultsCounter(list.length);
  }

  updateResultsCounter(count) {
    const el = document.querySelector('.results-counter');
    if (el) el.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
  }

  /* ── Render Products Grid ──────────────────────────────────────────────── */
  renderProducts(products) {
    if (products === undefined) products = this.products;
    const container = document.querySelector('.products-grid');
    if (!container) return;

    if (!products.length) {
      container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:#888;">
        <p style="font-size:1.1rem;margin-bottom:1rem">No products found.</p>
        <p style="font-size:0.9rem">Try adjusting your filters or check back later.</p>
      </div>`;
      return;
    }

    container.innerHTML = products.map(p => `
      <div class="product-card" data-product-id="${p.id}">
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}" loading="lazy"
            onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect width=%22300%22 height=%22300%22 fill=%22%23f4f1ec%22/><text x=%22150%22 y=%22160%22 text-anchor=%22middle%22 font-size=%2248%22>👗</text></svg>'">
          <div class="product-overlay">
            <button class="quick-view-btn" onclick="app.openProductModal(${p.id})">Quick View</button>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-color">${p.color} &bull; ${p.gender}</p>
          <p class="product-price">GH₵${p.price}</p>
          <div class="product-actions">
            <select class="size-select" id="size-${p.id}">
              ${(p.sizes || ['S', 'M', 'L', 'XL']).map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <button class="add-to-cart-btn"
              onclick="app.addToCart(${p.id}, document.getElementById('size-${p.id}').value)">
              Add to Cart
            </button>
          </div>
        </div>
      </div>`).join('');

    this.initializeProductAnimations();
    this.initHoverEffects();
  }

  /* ── Render Cart ───────────────────────────────────────────────────────── */
  renderCart() {
    const container = document.querySelector('.cart-items');
    if (!container) return;

    // Show/hide Clear All button
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) clearBtn.style.display = this.cart.length > 0 ? 'inline-block' : 'none';

    if (!this.cart.length) {
      container.innerHTML = `<div class="empty-cart">
        <p>Your cart is empty</p>
        <a href="products.html" class="continue-shopping-btn">Continue Shopping</a>
      </div>`;
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%22 height=%22100%22 fill=%22%23f4f1ec%22/><text x=%2250%22 y=%2258%22 text-anchor=%22middle%22 font-size=%2232%22>👗</text></svg>'">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>Color: ${item.color}</p>
          <p>
            <label style="font-size:0.85rem;color:#666;margin-right:0.4rem">Size:</label>
            <select class="cart-size-select"
              onchange="app.changeSize(${item.id}, '${item.size}', this.value)">
              ${(item.sizes || ['S', 'M', 'L', 'XL']).map(s =>
      `<option value="${s}" ${s === item.size ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </p>
          <p class="price">GH₵${item.price}</p>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button onclick="app.updateQuantity(${item.id},'${item.size}',${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="app.updateQuantity(${item.id},'${item.size}',${item.quantity + 1})">+</button>
          </div>
          <button class="remove-item"
            onclick="app.removeFromCart(${item.id},'${item.size}')">Remove</button>
        </div>
      </div>`).join('');

    this.updateCartTotal();
  }

  updateCartTotal() {
    const subtotal = this.cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const promo = window._activePromo;
    const discount = promo ? subtotal * promo.discount : 0;
    const discounted = subtotal - discount;
    const tax = discounted * 0.08;
    const shipping = discounted > 150 ? 0 : 15;
    const total = discounted + tax + shipping;
    const el = document.querySelector('.cart-totals');
    if (!el) return;
    el.innerHTML = `
      <div class="totals-row"><span>Subtotal:</span><span>GH₵${subtotal.toFixed(2)}</span></div>
      ${discount > 0 ? `<div class="totals-row" style="color:#10b981;"><span>Promo (${promo.code}):</span><span>-GH₵${discount.toFixed(2)}</span></div>` : ''}
      <div class="totals-row"><span>Tax (8%):</span><span>GH₵${tax.toFixed(2)}</span></div>
      <div class="totals-row"><span>Shipping:</span><span>${shipping === 0 ? 'FREE' : 'GH₵' + shipping.toFixed(2)}</span></div>
      <div class="totals-row total"><span>Total:</span><span>GH₵${total.toFixed(2)}</span></div>`;
    // Store total for payment modal
    window._cartTotal = total;
  }

  /* ── Product Modal ─────────────────────────────────────────────────────── */
  openProductModal(productId) {
    const p = this.products.find(x => x.id === productId);
    if (!p) return;
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="app.closeProductModal()"></div>
      <div class="modal-content">
        <button class="modal-close" onclick="app.closeProductModal()">&times;</button>
        <div class="modal-image">
          <img src="${p.image}" alt="${p.name}"
            onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22><rect width=%22400%22 height=%22400%22 fill=%22%23f4f1ec%22/><text x=%22200%22 y=%22220%22 text-anchor=%22middle%22 font-size=%2264%22>👗</text></svg>'">
        </div>
        <div class="modal-details">
          <h2>${p.name}</h2>
          <p class="modal-color">${p.color} &bull; ${p.gender}</p>
          <p class="modal-price">GH₵${p.price}</p>
          <p class="modal-description">${p.description}</p>
          <div class="modal-features">
            ${(p.features || []).map(f => `<span class="feature-tag">${f}</span>`).join('')}
          </div>
          <div class="modal-actions">
            <select class="modal-size-select" id="modal-size-${p.id}">
              ${(p.sizes || ['S', 'M', 'L', 'XL']).map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <button class="modal-add-to-cart"
              onclick="app.addToCart(${p.id}, document.getElementById('modal-size-${p.id}').value); app.closeProductModal();">
              Add to Cart
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
  }

  closeProductModal() {
    const modal = document.querySelector('.product-modal');
    if (modal) { modal.classList.remove('active'); setTimeout(() => modal.remove(), 300); }
  }

  /* ── Marquee (index.html) ──────────────────────────────────────────────── */
  renderMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track || !this.products.length) return;

    // Pick up to 8 products for the marquee
    const names = ['Kwame A.', 'Adaeze O.', 'Emeka N.', 'Fatima D.', 'Moussa K.', 'Ama S.', 'Chidi U.', 'Ngozi B.'];
    const picks = this.products.slice(0, 8);

    const makeCard = (p, idx, hidden) => `
      <div class="marquee-card" ${hidden ? 'aria-hidden="true"' : ''}>
        <img src="${p.image}" alt="${hidden ? '' : 'Customer wearing ' + p.name}" loading="lazy"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22373%22><rect width=%22280%22 height=%22373%22 fill=%22%23f4f1ec%22/><text x=%22140%22 y=%22200%22 text-anchor=%22middle%22 font-size=%2248%22>👗</text></svg>'">
        <div class="marquee-card-info">
          <span class="marquee-name">${names[idx % names.length]}</span>
          <span class="marquee-item">${p.name} &middot; ${p.color}</span>
        </div>
      </div>`;

    // Set A + Set B (duplicate for seamless loop)
    track.innerHTML =
      picks.map((p, i) => makeCard(p, i, false)).join('') +
      picks.map((p, i) => makeCard(p, i, true)).join('');
  }

  /* ── Recommendations (cart.html) ──────────────────────────────────────── */
  renderRecommendations() {
    const grid = document.querySelector('.recommendations-grid');
    if (!grid || !this.products.length) return;
    const picks = this.products.slice(0, 4);
    grid.innerHTML = picks.map(p => `
      <div class="recommendation-card">
        <div class="recommendation-image">
          <img src="${p.image}" alt="${p.name}" loading="lazy"
            onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22250%22 height=%22250%22><rect width=%22250%22 height=%22250%22 fill=%22%23f4f1ec%22/><text x=%22125%22 y=%22140%22 text-anchor=%22middle%22 font-size=%2248%22>👗</text></svg>'">
        </div>
        <div class="recommendation-info">
          <p class="recommendation-name">${p.name}</p>
          <p class="recommendation-price">GH₵${p.price}</p>
          <button class="add-to-cart-small"
            onclick="app.addToCart(${p.id},'${(p.sizes || ['M'])[0]}')">Add to Cart</button>
        </div>
      </div>`).join('');
  }

  /* ── Featured products (index.html) ───────────────────────────────────── */
  renderFeatured() {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    // Show first 6 products on homepage
    this.renderProducts(this.products.slice(0, 6));
  }

  /* ── Page content dispatcher ───────────────────────────────────────────── */
  loadPageContent() {
    const path = window.location.pathname;
    const href = window.location.href;

    if (path.endsWith('products.html') || href.includes('products.html')) {
      this.renderProducts();
    } else if (path.endsWith('cart.html') || href.includes('cart.html')) {
      this.renderCart();
      this.renderRecommendations();
    } else {
      // Default: homepage (index.html, /, or any unmatched page with a products-grid)
      if (document.querySelector('.products-grid')) {
        this.renderFeatured();
      }
      if (document.querySelector('.marquee-track')) {
        this.renderMarquee();
      }
    }
  }

  /* ── Animations ────────────────────────────────────────────────────────── */
  initializeAnimations() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-in'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  }

  initHoverEffects() {
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      });
    });
  }

  initializeProductAnimations() {
    document.querySelectorAll('.product-card').forEach((card, i) => {
      card.style.animationDelay = `${i * 0.08}s`;
      card.classList.add('animate-in');
      // Ensure visibility even if animation doesn't fire
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }

  showAddToCartAnimation() {
    ['navCartBtn', 'floatCartBtn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) { btn.classList.add('cart-bounce'); setTimeout(() => btn.classList.remove('cart-bounce'), 600); }
    });
    ['navCartBadge', 'floatCartBadge'].forEach(id => {
      const badge = document.getElementById(id);
      if (badge) { badge.classList.add('badge-pop'); setTimeout(() => badge.classList.remove('badge-pop'), 400); }
    });
  }

  /* ── Event binding ─────────────────────────────────────────────────────── */
  bindEvents() {
    document.addEventListener('change', e => {
      if (e.target.classList.contains('filter-checkbox')) this.handleFilterChange(e.target);
    });
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.addEventListener('input', e => this.handleSearch(e.target.value));
    const clearBtn = document.querySelector('.clear-filters');
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearAllFilters());
  }

  handleFilterChange(checkbox) {
    const type = checkbox.dataset.filterType;
    const val = checkbox.value;
    if (checkbox.checked) {
      if (!this.filters[type].includes(val)) this.filters[type].push(val);
    } else {
      this.filters[type] = this.filters[type].filter(v => v !== val);
    }
    this.applyFilters();
  }

  handleSearch(query) {
    const q = query.toLowerCase();
    const filtered = this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    this.renderProducts(filtered);
    this.updateResultsCounter(filtered.length);
  }

  clearAllFilters() {
    this.filters = { category: [], color: [], size: [], priceRange: [0, 1000], gender: [] };
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
    const slider = document.querySelector('.price-range-slider');
    if (slider) slider.value = slider.max;
    this.applyFilters();
  }

  initializeFilters() {
    // Fix selector - check both possible class names
    let slider = document.querySelector('.price-range-slider');
    if (!slider) slider = document.querySelector('.price-slider');
    if (!slider) return;

    slider.addEventListener('input', e => {
      this.filters.priceRange[1] = parseInt(e.target.value);
      const display = document.querySelector('.price-display span:last-child');
      if (display) display.textContent = 'GH₵' + e.target.value;
      this.applyFilters();
    });
  }
}

/* ── Global init ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AfriWearApp();
  app.init().catch(console.error);
});

function afriSignOut() {
  sessionStorage.removeItem('afriUser');
  window.location.reload();
}

function afriGetUser() {
  try { return JSON.parse(sessionStorage.getItem('afriUser')); } catch (_) { return null; }
}

function formatPrice(price) { return `GH₵${Number(price).toFixed(2)}`; }

/* ── Missing UI Functions ──────────────────────────────────────────────────── */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu') || document.querySelector('[data-mobile-menu]');
  if (menu) menu.classList.toggle('open');
}

function toggleFilters() {
  const sidebar = document.getElementById('filtersSidebar') || document.querySelector('[data-filters]');
  if (sidebar) sidebar.classList.toggle('mobile-open');
}

function confirmClearCart() {
  if (confirm('Clear entire cart?')) {
    if (window.app) window.app.clearCart();
  }
}

function applyPromoCode() {
  const input = document.getElementById('promoCode');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    alert('Please enter a promo code');
    return;
  }

  // Simulate promo validation - in production, fetch from database
  const validPromos = {
    'SAVE10': { code: 'SAVE10', discount: 0.10, description: '10% off' },
    'SAVE20': { code: 'SAVE20', discount: 0.20, description: '20% off' },
    'FIRST': { code: 'FIRST', discount: 0.15, description: '15% off first order' }
  };

  if (validPromos[code]) {
    window._activePromo = validPromos[code];
    alert(`Promo applied: ${validPromos[code].description}`);
    if (window.app) window.app.updateCartTotal();
    input.disabled = true;
    input.value = `${code} (Applied)`;
  } else {
    alert('Invalid promo code');
  }
}

function proceedToCheckout() {
  if (!window.app || window.app.cart.length === 0) {
    alert('Your cart is empty');
    return;
  }

  const user = afriGetUser();
  if (!user) {
    if (confirm('Please sign in to proceed. Redirect to sign in?')) {
      window.location.href = 'auth.html';
    }
    return;
  }

  // Store order for processing
  const order = {
    id: Date.now(),
    userId: user.email,
    items: window.app.cart,
    total: window._cartTotal || 0,
    promo: window._activePromo,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  // In production, this would submit to backend
  console.log('Order submitted:', order);
  alert('Order placed successfully! Order ID: ' + order.id);

  // Clear cart and redirect
  window.app.clearCart();
  window.location.href = 'orders.html';
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.remove('open');
    const btn = document.getElementById('mobileMenuBtn');
    const hamburger = document.getElementById('hamburgerIcon');
    const close = document.getElementById('closeIcon');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (hamburger) hamburger.style.display = 'block';
    if (close) close.style.display = 'none';
  }
}

function handleNewsletter(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[type="email"]');
  const email = input?.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  // Store subscription (in production, send to backend/email service)
  console.log('Newsletter subscription:', email);
  alert('Thank you for subscribing! Check your email for confirmation.');
  form.reset();
}
