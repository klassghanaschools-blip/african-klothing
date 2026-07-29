# AfriWear E-commerce - Project Outline

## File Structure
```
African Klothing/
├── index.html              # Homepage with hero section and featured products
├── products.html           # Product catalogue with filtering and search
├── cart.html               # Shopping cart and checkout
├── auth.html               # Sign in / Create account page
├── admin.html              # Password-protected admin dashboard
├── main.js                 # Core JavaScript functionality (AfriWearApp class)
├── resources/              # Media assets folder
│   ├── hero-nature.jpg     # Hero background image
│   ├── hero-urban.jpg      # Alternative hero image
│   ├── product-1.jpg       # Kente Agbada - Royal Gold
│   ├── product-2.jpg       # Ankara Kaftan - Indigo Blue
│   ├── product-3.jpg       # Dashiki Senator - Ebony Black
│   ├── product-4.jpg       # Dashiki Senator - Ivory Cream
│   ├── product-5.jpg       # Aso-Oke Gele Set - Terracotta
│   ├── product-6.jpg       # Aso-Oke Gele Set - Forest Green
│   ├── product-7.jpg       # Boubou Grand - Sahara Sand
│   ├── product-8.jpg       # Boubou Grand - Midnight Navy
│   ├── product-9.jpg       # Ankara Wrap Dress - Sunset Orange
│   ├── product-10.jpg      # Ankara Wrap Dress - Plum Purple
│   ├── product-11.jpg      # Kente Skirt Set - Golden Yellow
│   ├── product-12.jpg      # Kente Skirt Set - Crimson Red
│   ├── mtn.png             # MTN MoMo payment logo
│   ├── telecel.png         # Telecel Cash payment logo
│   ├── airteltigo.png      # AirtelTigo Money payment logo
│   └── wool-texture.jpg    # Background texture asset
├── design.md               # Visual design style guide
├── interaction.md          # Interaction design documentation
└── outline.md              # This project outline
```

## Page Structure & Content

### 1. index.html — Homepage
**Purpose**: Create immediate cultural impact and guide users to the product collection.

**Sections**:
- **Navigation Bar**: AfriWear logo, Home, Products, Our Story links, Sign In / user area, floating cart button
- **Hero Section**:
  - Background: Warm lifestyle image at low opacity over an earth-tone gradient
  - Headline: "African Heritage, Modern Elegance"
  - Subtext: Invitation to explore authentic African fashion for men and women
  - CTA Button: "Explore Collection" → links to `products.html`
- **Featured Collection**:
  - 6 hero products in a responsive auto-fill grid
  - Each card has a hover overlay with a Quick View button
  - Size selector and Add to Cart directly on the card
- **Brand Story Section** (`#story`):
  - Narrative about AfriWear's commitment to African artisans and textile traditions
  - Four benefit cards: Artisan Crafted, Authentic Fabrics, Men & Women, Community First
- **Newsletter Signup**: Email capture with subscribe confirmation animation
- **Footer**: Copyright line

### 2. products.html — Product Catalogue
**Purpose**: Comprehensive product browsing with filtering and search.

**Sections**:
- **Navigation Bar**: Consistent with homepage; Products link highlighted
- **Page Header**: "Our Collection" title and subtitle
- **Filter Sidebar** (collapsible on mobile):
  - Search: Free-text search across name, colour, and description
  - Gender: Men / Women checkboxes
  - Style: Agbada, Kaftan, Senator, Boubou, Aso-Oke, Ankara Dress, Skirt Set
  - Colour: Royal Gold, Indigo Blue, Ebony Black, Terracotta, Forest Green, Sunset Orange
  - Price Range: $0–$400 slider
  - Clear All Filters button
- **Product Grid**:
  - All 12 products rendered dynamically from `AfriWearApp`
  - Results counter and sort dropdown (Name, Price Low–High, Price High–Low, Newest)
  - Product cards with Quick View modal, size selector, Add to Cart
- **Product Detail Modal**: Name, colour, gender, price, description, feature tags, size selector, Add to Cart
- **Footer**: Consistent with homepage

### 3. cart.html — Shopping Cart
**Purpose**: Streamlined cart review and checkout experience.

**Sections**:
- **Navigation Bar**: Consistent design
- **Cart Items**:
  - Each item shows image, name, colour, size selector (changeable inline), price
  - Quantity +/− controls
  - Remove button
  - Empty cart state with Continue Shopping link
- **Order Summary Sidebar**:
  - Subtotal, 8% tax, shipping (free over $150), total
  - Promo code input (AFRI10, SAVE20, FREESHIP)
  - Proceed to Checkout button (requires sign-in)
  - Trust badges: Secure, Free Shipping, Easy Returns
- **Payment Modal** (opens on checkout):
  - Four methods: Debit/Credit Card, Bank Transfer, USSD, Mobile Wallet (MTN MoMo, Telecel Cash, AirtelTigo)
  - Per-method forms with validation
- **You Might Also Like**: 4 recommendation cards
- **Footer**: Consistent design

### 4. auth.html — Authentication
**Purpose**: User sign-in and account creation with delivery address capture.

**Sections**:
- **Logo**: AfriWear wordmark linking back to homepage
- **Sign In Tab**: Email + password, welcome-back redirect
- **Create Account Tab**:
  - Personal info: first name, last name, email, phone
  - Delivery address: street, city, state (Nigerian states datalist), LGA, postal code, landmark
  - Password with strength meter and confirmation
  - Terms & Privacy consent checkbox
- **Back to Store** link

### 5. admin.html — Admin Dashboard
**Purpose**: Password-protected product management for store administrators.

**Sections**:
- **Login Screen**: Username + password gate (credentials: `admin` / `afriwear2024`)
- **Sidebar Navigation**: Overview, Products, Add Product, Settings, View Store link, Sign Out
- **Overview**: Stats cards (total products, men's items, women's items, average price) + recent products table
- **Products Table**: All products with inline price editing, Edit and Delete actions
- **Add / Edit Product Form**: Full product fields including image upload with preview
- **Settings**: Change admin password with strength meter

## Interactive Features

### Shopping Cart System
- **Add to Cart**: Floating cart button bounces and badge pops on every add
- **Cart Persistence**: `localStorage` key `afriCart` for session continuity
- **Quantity Management**: +/− buttons; removing last unit deletes the item
- **Size Change**: Inline size selector in cart; merges quantities if new size already exists
- **Price Updates**: Real-time subtotal, tax, and shipping recalculation

### Product Filtering
- **Real-time Search**: Instant results filtering name, colour, and description
- **Multi-select Filters**: Gender, style, and colour filters combine with AND logic
- **Price Slider**: Upper-bound price filter with live display
- **Filter Reset**: Clear all with single click
- **Sort Options**: Name, price ascending, price descending, newest

### User Authentication
- **Sign In**: Email + password validated against `localStorage` user store
- **Sign Up**: Full delivery address captured at registration for checkout pre-fill
- **Session**: `sessionStorage` key `afriUser` (password excluded); sign-out clears session
- **Nav Integration**: Signed-in user's first name shown in navbar; Sign Out button inline

### Admin Dashboard
- **Product CRUD**: Create, read, update (price + full edit), delete
- **Image Upload**: File input with Base64 preview; drag-and-drop supported
- **Storefront Sync**: All changes written to `localStorage` key `afriProducts`; storefront reads on next load
- **Password Management**: Admin can change password; persisted to `localStorage`

## Technical Implementation

### Core Libraries
1. **Anime.js**: Button interactions, card animations, error shake effects
2. **ECharts.js**: Admin dashboard data visualisation
3. **Splide.js**: Product image carousels
4. **p5.js**: Organic background pattern generation
5. **Matter.js**: Physics-based product display interactions
6. **Pixi.js**: Advanced hero section visual effects
7. **Tailwind CSS** (CDN): Utility classes for layout and spacing

### Responsive Design
- **Mobile-first breakpoints**: 480px, 768px, 900px, 1024px
- **Touch-friendly**: 44px minimum touch targets throughout
- **Lazy loading**: `loading="lazy"` on all product images
- **Fluid typography**: `clamp()` for hero headline scaling

### Data Management
- **Product Catalogue**: `localStorage` key `afriProducts` (falls back to hardcoded array in `main.js`)
- **Cart State**: `localStorage` key `afriCart`
- **User Accounts**: `localStorage` key `afriUsers` (passwords stored as Base64)
- **Current Session**: `sessionStorage` key `afriUser`
- **Admin Auth**: `sessionStorage` key `afriAdminAuth`

## Content Strategy

### Product Descriptions
- Highlight the specific African textile tradition (Kente, Ankara, Aso-Oke, Dashiki, Boubou)
- Name the cultural origin and craftsmanship technique
- Describe the occasion suitability (ceremonial, everyday, formal)
- List key features as concise tags

### Brand Messaging
- Authentic celebration of African heritage and artisan communities
- Premium quality with cultural significance
- Inclusive range for both men and women
- Every purchase supports African weavers and textile traditions

### SEO Considerations
- Semantic HTML5 structure throughout
- Descriptive `alt` text on all product images
- Meta descriptions on every page referencing African fashion keywords
- Page titles follow the pattern: `[Page] - AfriWear | Authentic African Fashion`
