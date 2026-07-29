/**
 * db.js — My African Wear
 * IndexedDB wrapper. Replaces localStorage for products and users.
 * Cart stays in localStorage (session-scoped, small data).
 *
 * Stores:
 *   products  — keyed by id (auto-increment)
 *   users     — keyed by email
 *   settings  — keyed by key string (admin password, etc.)
 */

const DB_NAME = 'myAfricanWearDB';
const DB_VERSION = 3;

let _db = null;

/* ── Open / initialise ─────────────────────────────────────────────────────── */
function openDB() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('products')) {
                const ps = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
                ps.createIndex('gender', 'gender', { unique: false });
                ps.createIndex('category', 'category', { unique: false });
            }
            if (!db.objectStoreNames.contains('users')) {
                db.createObjectStore('users', { keyPath: 'email' });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('promoCodes')) {
                const pc = db.createObjectStore('promoCodes', { keyPath: 'code' });
                pc.createIndex('active', 'active', { unique: false });
            }
            if (!db.objectStoreNames.contains('bookings')) {
                const bs = db.createObjectStore('bookings', { keyPath: 'id', autoIncrement: true });
                bs.createIndex('status', 'status', { unique: false });
                bs.createIndex('email', 'email', { unique: false });
                bs.createIndex('level', 'level', { unique: false });
            }
        };

        req.onsuccess = e => { _db = e.target.result; resolve(_db); };
        req.onerror = e => reject(e.target.error);
    });
}

/* ── Generic helpers ───────────────────────────────────────────────────────── */
function tx(storeName, mode, fn) {
    return openDB().then(db => new Promise((resolve, reject) => {
        const t = db.transaction(storeName, mode);
        const store = t.objectStore(storeName);
        const req = fn(store);
        if (req && typeof req.onsuccess !== 'undefined') {
            req.onsuccess = e => resolve(e.target.result);
            req.onerror = e => reject(e.target.error);
        } else {
            t.oncomplete = () => resolve();
            t.onerror = e => reject(e.target.error);
        }
    }));
}

function getAll(storeName) {
    return openDB().then(db => new Promise((resolve, reject) => {
        const t = db.transaction(storeName, 'readonly');
        const req = t.objectStore(storeName).getAll();
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e.target.error);
    }));
}

function getOne(storeName, key) {
    return tx(storeName, 'readonly', store => store.get(key));
}

function putOne(storeName, value) {
    return tx(storeName, 'readwrite', store => store.put(value));
}

function deleteOne(storeName, key) {
    return tx(storeName, 'readwrite', store => store.delete(key));
}

function clearStore(storeName) {
    return tx(storeName, 'readwrite', store => store.clear());
}

/* ── Default seed data ─────────────────────────────────────────────────────── */
const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Kente Agbada', color: 'Royal Gold', price: 185, category: 'Agbada', gender: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-1.jpg', description: 'Majestic hand-woven Kente Agbada with intricate gold patterns, perfect for ceremonies and celebrations.', features: ['Hand-woven Kente', 'Ceremonial wear', 'Authentic craftsmanship'] },
    { id: 2, name: 'Ankara Kaftan', color: 'Indigo Blue', price: 145, category: 'Kaftan', gender: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-2.jpg', description: 'Flowing Ankara kaftan in rich indigo blue with bold geometric prints.', features: ['Ankara fabric', 'Bold prints', 'Relaxed fit'] },
    { id: 3, name: 'Dashiki Senator', color: 'Ebony Black', price: 165, category: 'Senator', gender: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-3.jpg', description: 'Sharp senator suit in premium Dashiki fabric, blending tradition with modern tailoring.', features: ['Premium Dashiki', 'Modern tailoring', 'Versatile style'] },
    { id: 4, name: 'Dashiki Senator', color: 'Ivory Cream', price: 165, category: 'Senator', gender: 'Men', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-4.jpg', description: 'Elegant ivory senator suit with subtle Dashiki embroidery for a refined look.', features: ['Premium Dashiki', 'Modern tailoring', 'Versatile style'] },
    { id: 5, name: 'Aso-Oke Gele Set', color: 'Terracotta', price: 295, category: 'Aso-Oke', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'resources/product-5.jpg', description: 'Luxurious Aso-Oke complete set with matching Gele headwrap in warm terracotta tones.', features: ['Handwoven Aso-Oke', 'Includes Gele', 'Complete set'] },
    { id: 6, name: 'Aso-Oke Gele Set', color: 'Forest Green', price: 295, category: 'Aso-Oke', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'resources/product-6.jpg', description: 'Stunning forest green Aso-Oke set with intricate weave patterns and matching accessories.', features: ['Handwoven Aso-Oke', 'Includes Gele', 'Complete set'] },
    { id: 7, name: 'Boubou Grand', color: 'Sahara Sand', price: 215, category: 'Boubou', gender: 'Men', sizes: ['M', 'L', 'XL', 'XXL'], image: 'resources/product-7.jpg', description: 'Flowing grand Boubou in earthy Sahara sand, embroidered with traditional West African motifs.', features: ['Hand embroidery', 'Flowing silhouette', 'West African tradition'] },
    { id: 8, name: 'Boubou Grand', color: 'Midnight Navy', price: 215, category: 'Boubou', gender: 'Men', sizes: ['M', 'L', 'XL', 'XXL'], image: 'resources/product-8.jpg', description: 'Regal midnight navy Boubou with gold embroidery, ideal for formal occasions.', features: ['Hand embroidery', 'Flowing silhouette', 'West African tradition'] },
    { id: 9, name: 'Ankara Wrap Dress', color: 'Sunset Orange', price: 155, category: 'Dress', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'resources/product-9.jpg', description: 'Vibrant Ankara wrap dress in sunset orange with bold African print patterns.', features: ['Ankara fabric', 'Wrap silhouette', 'Vibrant prints'] },
    { id: 10, name: 'Ankara Wrap Dress', color: 'Plum Purple', price: 155, category: 'Dress', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'resources/product-10.jpg', description: 'Elegant plum purple Ankara wrap dress with intricate floral African motifs.', features: ['Ankara fabric', 'Wrap silhouette', 'Vibrant prints'] },
    { id: 11, name: 'Kente Skirt Set', color: 'Golden Yellow', price: 175, category: 'Skirt Set', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-11.jpg', description: 'Stunning Kente skirt and blouse set in golden yellow, celebrating Ghanaian heritage.', features: ['Kente weave', 'Two-piece set', 'Ghanaian heritage'] },
    { id: 12, name: 'Kente Skirt Set', color: 'Crimson Red', price: 175, category: 'Skirt Set', gender: 'Women', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], image: 'resources/product-12.jpg', description: 'Bold crimson Kente skirt set with traditional woven patterns and modern cut.', features: ['Kente weave', 'Two-piece set', 'Ghanaian heritage'] }
];

/* ── Seed on first run ─────────────────────────────────────────────────────── */
/**
 * Seeds the products store with defaults if it is empty.
 * Also migrates any products previously saved in localStorage.
 */
async function seedProductsIfEmpty() {
    await openDB();
    const existing = await getAll('products');
    if (existing.length > 0) return; // already seeded

    // Check if localStorage has admin-saved products to migrate
    let toSeed = DEFAULT_PRODUCTS;
    try {
        const lsData = localStorage.getItem('afriProducts');
        if (lsData) {
            const parsed = JSON.parse(lsData);
            if (Array.isArray(parsed) && parsed.length > 0) toSeed = parsed;
        }
    } catch (_) { }

    const db = await openDB();
    await new Promise((resolve, reject) => {
        const t = db.transaction('products', 'readwrite');
        const store = t.objectStore('products');
        toSeed.forEach(p => store.put(p));
        t.oncomplete = resolve;
        t.onerror = e => reject(e.target.error);
    });

    // Clean up old localStorage key after migration
    localStorage.removeItem('afriProducts');
}

/* ── Public Products API ───────────────────────────────────────────────────── */
const ProductsDB = {
    /** Returns all products sorted by id */
    getAll: () => getAll('products').then(ps => ps.sort((a, b) => a.id - b.id)),

    /** Returns a single product by numeric id */
    getById: id => getOne('products', id),

    /** Add a new product (id auto-assigned). Returns the new id. */
    add: async product => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const t = db.transaction('products', 'readwrite');
            const req = t.objectStore('products').add(product);
            req.onsuccess = e => resolve(e.target.result);
            req.onerror = e => reject(e.target.error);
        });
    },

    /** Update an existing product (must include id) */
    update: product => putOne('products', product),

    /** Delete a product by id */
    delete: id => deleteOne('products', id),

    /** Replace entire products store (used for bulk restore) */
    replaceAll: async products => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const t = db.transaction('products', 'readwrite');
            const store = t.objectStore('products');
            store.clear();
            products.forEach(p => store.put(p));
            t.oncomplete = resolve;
            t.onerror = e => reject(e.target.error);
        });
    }
};

/* ── Public Users API ──────────────────────────────────────────────────────── */
const UsersDB = {
    getAll: () => getAll('users'),
    getByEmail: email => getOne('users', email),
    save: user => putOne('users', user),
    delete: email => deleteOne('users', email),

    /** Migrate users from localStorage on first run */
    migrateFromLocalStorage: async () => {
        try {
            const lsData = localStorage.getItem('afriUsers');
            if (!lsData) return;
            const users = JSON.parse(lsData);
            if (!Array.isArray(users) || users.length === 0) return;
            const existing = await getAll('users');
            if (existing.length > 0) return; // already migrated
            const db = await openDB();
            await new Promise((resolve, reject) => {
                const t = db.transaction('users', 'readwrite');
                const store = t.objectStore('users');
                users.forEach(u => store.put(u));
                t.oncomplete = resolve;
                t.onerror = e => reject(e.target.error);
            });
            localStorage.removeItem('afriUsers');
        } catch (_) { }
    }
};

/* ── Public Promo Codes API ────────────────────────────────────────────────── */
const PromoCodesDB = {
    getAll: () => getAll('promoCodes').then(cs => cs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))),
    getByCode: code => getOne('promoCodes', code.toUpperCase()),
    add: promo => putOne('promoCodes', promo),
    update: promo => putOne('promoCodes', promo),
    delete: code => deleteOne('promoCodes', code)
};

/* ── Public Bookings API ───────────────────────────────────────────────────── */
const BookingsDB = {
    getAll: () => getAll('bookings').then(bs => bs.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))),
    getById: id => getOne('bookings', id),
    add: async booking => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const t = db.transaction('bookings', 'readwrite');
            const req = t.objectStore('bookings').add(booking);
            req.onsuccess = e => resolve(e.target.result);
            req.onerror = e => reject(e.target.error);
        });
    },
    update: booking => putOne('bookings', booking),
    delete: id => deleteOne('bookings', id),
    getByStatus: async status => {
        const all = await getAll('bookings');
        return all.filter(b => b.status === status).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }
};

/* ── Public Settings API ───────────────────────────────────────────────────── */
const SettingsDB = {
    get: key => getOne('settings', key).then(r => r ? r.value : null),
    set: (key, value) => putOne('settings', { key, value }),

    /** Migrate admin password from localStorage */
    migrateFromLocalStorage: async () => {
        try {
            const pw = localStorage.getItem('afriAdminPass');
            if (!pw) return;
            const existing = await getOne('settings', 'adminPass');
            if (existing) return;
            await putOne('settings', { key: 'adminPass', value: pw });
            localStorage.removeItem('afriAdminPass');
        } catch (_) { }
    }
};

/* ── Bootstrap: run migrations + seed on page load ────────────────────────── */
const MAWdb = {
    ready: null,

    init: async function () {
        if (this.ready) return this.ready;
        this.ready = (async () => {
            await openDB();
            await Promise.all([
                seedProductsIfEmpty(),
                UsersDB.migrateFromLocalStorage(),
                SettingsDB.migrateFromLocalStorage()
            ]);
        })();
        return this.ready;
    },

    products: ProductsDB,
    users: UsersDB,
    settings: SettingsDB,
    bookings: BookingsDB,
    promoCodes: PromoCodesDB
};

// Auto-init when script loads
MAWdb.init().catch(console.error);
