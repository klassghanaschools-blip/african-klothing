/**
 * supabase.js — My African Wear
 * Cloud database layer using Supabase (PostgreSQL).
 * Replaces IndexedDB for all persistent data.
 * Cart stays in localStorage (session-scoped).
 */

const SUPABASE_URL = 'https://pdvexzvruqxyaetatiin.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmV4enZydXF4eWFldGF0aWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzczNzQsImV4cCI6MjA5NTgxMzM3NH0.7vHj6Q5H-31gjji-jWvfA4dNEotVUILoXmOdUYrBGt4';

/* ── HTTP helper ───────────────────────────────────────────────────────────── */
async function sbFetch(path, options = {}) {
    const url = SUPABASE_URL + '/rest/v1/' + path;
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': options.prefer || 'return=representation',
        ...options.headers
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const err = await res.text();
        throw new Error('Supabase error ' + res.status + ': ' + err);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : [];
}

function get(table, params = '') {
    return sbFetch(table + '?' + params);
}
function insert(table, data) {
    return sbFetch(table, { method: 'POST', body: JSON.stringify(data) });
}
function update(table, match, data) {
    return sbFetch(table + '?' + match, {
        method: 'PATCH', body: JSON.stringify(data),
        headers: { 'Prefer': 'return=representation' }
    });
}
function remove(table, match) {
    return sbFetch(table + '?' + match, { method: 'DELETE', prefer: 'return=minimal' });
}
function upsert(table, data) {
    return sbFetch(table, {
        method: 'POST', body: JSON.stringify(data),
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' }
    });
}

/* ── Default seed products ─────────────────────────────────────────────────── */
const DEFAULT_PRODUCTS = [
    { name: 'Kente Agbada', color: 'Royal Gold', price: 185, category: 'Agbada', gender: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-1.jpg', description: 'Majestic hand-woven Kente Agbada with intricate gold patterns, perfect for ceremonies and celebrations.', features: ['Hand-woven Kente', 'Ceremonial wear', 'Authentic craftsmanship'] },
    { name: 'Ankara Kaftan', color: 'Indigo Blue', price: 145, category: 'Kaftan', gender: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-2.jpg', description: 'Flowing Ankara kaftan in rich indigo blue with bold geometric prints.', features: ['Ankara fabric', 'Bold prints', 'Relaxed fit'] },
    { name: 'Dashiki Senator', color: 'Ebony Black', price: 165, category: 'Senator', gender: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-3.jpg', description: 'Sharp senator suit in premium Dashiki fabric, blending tradition with modern tailoring.', features: ['Premium Dashiki', 'Modern tailoring', 'Versatile style'] },
    { name: 'Dashiki Senator', color: 'Ivory Cream', price: 165, category: 'Senator', gender: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-4.jpg', description: 'Elegant ivory senator suit with subtle Dashiki embroidery for a refined look.', features: ['Premium Dashiki', 'Modern tailoring', 'Versatile style'] },
    { name: 'Aso-Oke Gele Set', color: 'Terracotta', price: 295, category: 'Aso-Oke', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'resources/product-5.jpg', description: 'Luxurious Aso-Oke complete set with matching Gele headwrap in warm terracotta tones.', features: ['Handwoven Aso-Oke', 'Includes Gele', 'Complete set'] },
    { name: 'Aso-Oke Gele Set', color: 'Forest Green', price: 295, category: 'Aso-Oke', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'resources/product-6.jpg', description: 'Stunning forest green Aso-Oke set with intricate weave patterns and matching accessories.', features: ['Handwoven Aso-Oke', 'Includes Gele', 'Complete set'] },
    { name: 'Boubou Grand', color: 'Sahara Sand', price: 215, category: 'Boubou', gender: 'Men', sizes: ['M', 'L', 'XL', 'XXL'], image: 'resources/product-7.jpg', description: 'Flowing grand Boubou in earthy Sahara sand, embroidered with traditional West African motifs.', features: ['Hand embroidery', 'Flowing silhouette', 'West African tradition'] },
    { name: 'Boubou Grand', color: 'Midnight Navy', price: 215, category: 'Boubou', gender: 'Men', sizes: ['M', 'L', 'XL', 'XXL'], image: 'resources/product-8.jpg', description: 'Regal midnight navy Boubou with gold embroidery, ideal for formal occasions.', features: ['Hand embroidery', 'Flowing silhouette', 'West African tradition'] },
    { name: 'Ankara Wrap Dress', color: 'Sunset Orange', price: 155, category: 'Dress', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'resources/product-9.jpg', description: 'Vibrant Ankara wrap dress in sunset orange with bold African print patterns.', features: ['Ankara fabric', 'Wrap silhouette', 'Vibrant prints'] },
    { name: 'Ankara Wrap Dress', color: 'Plum Purple', price: 155, category: 'Dress', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'resources/product-10.jpg', description: 'Elegant plum purple Ankara wrap dress with intricate floral African motifs.', features: ['Ankara fabric', 'Wrap silhouette', 'Vibrant prints'] },
    { name: 'Kente Skirt Set', color: 'Golden Yellow', price: 175, category: 'Skirt Set', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-11.jpg', description: 'Stunning Kente skirt and blouse set in golden yellow, celebrating Ghanaian heritage.', features: ['Kente weave', 'Two-piece set', 'Ghanaian heritage'] },
    { name: 'Kente Skirt Set', color: 'Crimson Red', price: 175, category: 'Skirt Set', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-12.jpg', description: 'Bold crimson Kente skirt set with traditional woven patterns and modern cut.', features: ['Kente weave', 'Two-piece set', 'Ghanaian heritage'] }
];

/* ── Password hashing (SHA-256 via Web Crypto) ─────────────────────────────── */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
    const computed = await hashPassword(password);
    return computed === hash;
}

/* ── Products API ──────────────────────────────────────────────────────────── */
const ProductsDB = {
    getAll: async () => {
        try {
            const rows = await get('products', 'order=id.asc');
            return rows.map(normalizeProduct);
        } catch (err) {
            console.warn('Failed to fetch products from Supabase, using demo products:', err);
            // Fallback to default products for offline/demo mode
            return DEFAULT_PRODUCTS.map((p, i) => ({
                id: i + 1,
                ...p,
                category: p.category || 'Fashion'
            }));
        }
    },
    getById: async id => {
        const rows = await get('products', 'id=eq.' + id);
        return rows[0] ? normalizeProduct(rows[0]) : null;
    },
    add: async product => {
        const rows = await insert('products', denormalizeProduct(product));
        return rows[0] ? normalizeProduct(rows[0]) : null;
    },
    update: async product => {
        const rows = await update('products', 'id=eq.' + product.id, denormalizeProduct(product));
        return rows[0] ? normalizeProduct(rows[0]) : null;
    },
    delete: id => remove('products', 'id=eq.' + id),
    seed: async () => {
        const existing = await get('products', 'select=id&limit=1');
        if (existing.length > 0) return;
        for (const p of DEFAULT_PRODUCTS) {
            await insert('products', denormalizeProduct(p));
        }
    }
};

function normalizeProduct(row) {
    return {
        id: row.id, name: row.name, color: row.color,
        price: parseFloat(row.price), category: row.category,
        gender: row.gender, sizes: row.sizes || [],
        image: row.image_data || row.image || '',
        imageData: row.image_data || null,
        description: row.description || '',
        features: row.features || [],
        createdAt: row.created_at
    };
}

function denormalizeProduct(p) {
    const obj = {
        name: p.name, color: p.color, price: p.price,
        category: p.category, gender: p.gender,
        sizes: p.sizes || [], image: p.image || '',
        description: p.description || '',
        features: p.features || []
    };
    if (p.imageData) obj.image_data = p.imageData;
    if (p.id) obj.id = p.id;
    return obj;
}

/* ── Users API ─────────────────────────────────────────────────────────────── */
const UsersDB = {
    getAll: async () => {
        const rows = await get('users', 'order=created_at.asc&select=id,email,first_name,last_name,phone,delivery,created_at');
        return rows.map(normalizeUser);
    },
    getByEmail: async email => {
        const rows = await get('users', 'email=eq.' + encodeURIComponent(email) + '&limit=1');
        return rows[0] ? normalizeUser(rows[0]) : null;
    },
    save: async user => {
        const data = {
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phone || '',
            password_hash: user.password_hash || user.password || '',
            delivery: user.delivery || {}
        };
        const rows = await upsert('users', data);
        return rows[0] ? normalizeUser(rows[0]) : null;
    },
    delete: email => remove('users', 'email=eq.' + encodeURIComponent(email))
};

function normalizeUser(row) {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        delivery: row.delivery || {},
        password_hash: row.password_hash,
        // Keep legacy password field for compatibility
        password: row.password_hash,
        createdAt: row.created_at
    };
}

/* ── Orders API ────────────────────────────────────────────────────────────── */
const OrdersDB = {
    getAll: async () => {
        return get('orders', 'order=created_at.desc');
    },
    getByEmail: async email => {
        return get('orders', 'user_email=eq.' + encodeURIComponent(email) + '&order=created_at.desc');
    },
    add: async order => {
        const rows = await insert('orders', order);
        return rows[0] || null;
    },
    updateStatus: async (id, status) => {
        return update('orders', 'id=eq.' + id, { status });
    }
};

/* ── Bookings API ──────────────────────────────────────────────────────────── */
const BookingsDB = {
    getAll: async () => {
        return get('bookings', 'order=submitted_at.desc');
    },
    getById: async id => {
        const rows = await get('bookings', 'id=eq.' + id);
        return rows[0] || null;
    },
    add: async booking => {
        const data = {
            first_name: booking.firstName,
            last_name: booking.lastName,
            email: booking.email,
            phone: booking.phone,
            level: booking.level,
            preferred_date: booking.preferredDate || null,
            preferred_time: booking.preferredTime || null,
            experience: booking.experience || null,
            message: booking.message || null,
            status: 'pending'
        };
        const rows = await insert('bookings', data);
        return rows[0] || null;
    },
    update: async booking => {
        const data = { status: booking.status };
        return update('bookings', 'id=eq.' + booking.id, data);
    },
    delete: id => remove('bookings', 'id=eq.' + id),
    getByStatus: async status => {
        return get('bookings', 'status=eq.' + status + '&order=submitted_at.desc');
    }
};

/* ── Promo Codes API ───────────────────────────────────────────────────────── */
const PromoCodesDB = {
    getAll: async () => {
        return get('promo_codes', 'order=created_at.desc');
    },
    getByCode: async code => {
        const rows = await get('promo_codes', 'code=eq.' + encodeURIComponent(code.toUpperCase()));
        return rows[0] || null;
    },
    add: async promo => {
        const rows = await insert('promo_codes', {
            code: promo.code,
            discount: promo.discount || 0.10,
            active: promo.active !== false,
            used_by: promo.usedBy || null,
            used_at: promo.usedAt || null
        });
        return rows[0] || null;
    },
    update: async promo => {
        const data = {
            active: promo.active,
            used_by: promo.usedBy || null,
            used_at: promo.usedAt || null
        };
        return update('promo_codes', 'code=eq.' + encodeURIComponent(promo.code), data);
    },
    delete: code => remove('promo_codes', 'code=eq.' + encodeURIComponent(code))
};

/* ── Settings API ──────────────────────────────────────────────────────────── */
const SettingsDB = {
    get: async key => {
        const rows = await get('settings', 'key=eq.' + encodeURIComponent(key));
        return rows[0] ? rows[0].value : null;
    },
    set: async (key, value) => {
        return upsert('settings', { key, value, updated_at: new Date().toISOString() });
    }
};

/* ── MAWdb — unified API (same interface as old db.js) ─────────────────────── */
const MAWdb = {
    _ready: null,

    init: async function () {
        if (this._ready) return this._ready;
        this._ready = ProductsDB.seed().catch(console.error);
        return this._ready;
    },

    products: ProductsDB,
    users: UsersDB,
    orders: OrdersDB,
    bookings: BookingsDB,
    promoCodes: PromoCodesDB,
    settings: SettingsDB,

    // Expose password utilities globally
    hashPassword,
    verifyPassword
};

// Auto-init
MAWdb.init().catch(console.error);
