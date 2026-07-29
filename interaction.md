# AfriWear E-commerce - Interaction Design

## Core User Journey
Users discover authentic African clothing through an immersive, culturally rich shopping experience that celebrates heritage, craftsmanship, and style. The journey moves from inspiration to exploration to purchase with minimal friction.

---

## Interactive Components

### 1. Navigation & Mobile Menu
- **Location**: Fixed top navbar on all pages
- **Desktop**: Horizontal links — Home, Products, Our Story — plus Sign In / user area and floating cart button
- **Mobile**: Hamburger button toggles a slide-down drawer containing all nav links and the current sign-in state
- **Interaction**: Hamburger icon swaps to a close (×) icon when the drawer is open; tapping any link or the close icon collapses the drawer smoothly

### 2. Product Filter & Search System
- **Location**: Left sidebar on the Products page; collapsible on mobile via a "🔍 Filters" toggle button
- **Functionality**:
  - Free-text search across product name, colour, and description
  - Gender filter: Men / Women (multi-select checkboxes)
  - Style filter: Agbada, Kaftan, Senator, Boubou, Aso-Oke, Ankara Dress, Skirt Set
  - Colour filter: Royal Gold, Indigo Blue, Ebony Black, Terracotta, Forest Green, Sunset Orange
  - Price range slider: $0–$400 upper bound
  - Clear All Filters button resets every active filter at once
- **Interaction**: All filters apply in real time; the results counter updates instantly; the sort dropdown re-orders the visible grid without a page reload

### 3. Product Cards & Quick View Modal
- **Location**: Product grids on `index.html` (featured) and `products.html` (full catalogue)
- **Card Functionality**:
  - Hover reveals a terracotta overlay with a "Quick View" button
  - Size selector dropdown and Add to Cart button in the card footer
  - Smooth lift animation on hover (translateY + box-shadow)
- **Modal Functionality**:
  - Full product image, name, colour, gender badge, price, description, feature tags
  - Size selector and Add to Cart button
  - Clicking the overlay or the × button closes the modal
- **Interaction**: Modal fades in with a scale transition; closing reverses the animation before the element is removed from the DOM

### 4. Shopping Cart System
- **Location**: Floating circular cart button (fixed, top-right) on all pages except `cart.html`; full cart management on `cart.html`
- **Floating Button Behaviour**:
  - Badge shows total item count; hidden when cart is empty
  - Button bounces and badge "pops" (scale + colour flash) on every Add to Cart action
- **Cart Page Functionality**:
  - Each item shows image, name, colour, inline size selector, unit price
  - Quantity +/− buttons; reducing to zero removes the item
  - Remove button with red border hover state
  - Changing size merges quantities if the new size already exists in the cart
  - Real-time order summary: subtotal, 8% tax, shipping (free over $150), total
  - Promo code input (valid codes: AFRI10, SAVE20, FREESHIP)
- **Interaction**: Cart state persists in `localStorage`; all updates re-render the cart and summary instantly

### 5. Checkout & Payment Modal
- **Location**: Triggered by "Proceed to Checkout" on `cart.html`; requires the user to be signed in (redirects to `auth.html` if not)
- **Functionality**:
  - Displays the order total prominently
  - Four payment method tabs: Debit/Credit Card, Bank Transfer, USSD, Mobile Wallet
  - Card form: cardholder name, card number (auto-formatted with spaces), expiry (MM / YY), CVV, optional issuing bank
  - Bank Transfer form: AfriWear account details, auto-generated reference number, optional proof field
  - USSD form: dynamically generated USSD code, bank selector
  - Mobile Wallet form: MTN MoMo, Telecel Cash, AirtelTigo selector with logos, phone number input
- **Interaction**: Selecting a payment method highlights its tab and reveals its form; submitting shows a success overlay and clears the cart

### 6. User Authentication
- **Location**: `auth.html` — tabbed Sign In / Create Account card
- **Sign In**:
  - Email and password fields with inline validation
  - Password visibility toggle (👁 / 🙈)
  - On success: welcome message, redirect to previous page or homepage after 1.2 seconds
- **Create Account**:
  - Personal info, full delivery address (Nigerian states datalist), password with strength meter
  - Terms & Privacy checkbox must be checked to enable the submit button
  - On success: account saved to `localStorage`, session set, redirect
- **Interaction**: Tab switching clears all alerts and validation states; field errors appear inline below each input

### 7. Admin Dashboard
- **Location**: `admin.html` — password-protected
- **Login**: Username + password; Enter key submits; incorrect credentials shake the error message
- **Mobile Sidebar**: Off-canvas slide-in panel triggered by a hamburger button in the topbar; dark overlay closes it on tap
- **Overview Section**: Animated stat cards (total products, men's, women's, average price) + recent products table
- **Products Table**: Inline price editing (input turns amber when changed, Save button appears); Edit opens the full form pre-filled; Delete shows a confirmation dialog
- **Add / Edit Product Form**: All product fields; image upload with drag-and-drop and live preview; feature tags added via Enter or comma; form resets after successful save
- **Settings**: Change admin password with current-password verification and strength meter
- **Interaction**: All section switches close the mobile sidebar; toast notifications confirm every create, update, and delete action

---

## User Interaction Flow

1. **Discovery**: Hero section on `index.html` draws users in with a bold headline and warm lifestyle imagery
2. **Exploration**: Featured Collection grid on the homepage provides an immediate taste of the range; "Explore Collection" CTA leads to the full catalogue
3. **Filtering**: On `products.html`, users narrow by gender, style, colour, and price to find their perfect piece
4. **Selection**: Quick View modal or card-level Add to Cart lets users act without leaving the grid
5. **Cart Review**: `cart.html` provides a clear summary with size-change and quantity controls before checkout
6. **Authentication**: Users sign in or create an account (with delivery address) before payment
7. **Payment**: The checkout modal guides users through their preferred payment method
8. **Confirmation**: Success overlay confirms the order and clears the cart

---

## Accessibility & UX Principles

- **Touch Targets**: All interactive elements are at least 44×44px
- **Focus States**: Terracotta border on all focused inputs and buttons
- **Colour Contrast**: Charcoal (#2C2C2C) on warm white meets WCAG AA for body text
- **ARIA Labels**: Hamburger button, cart button, and modal close buttons all carry descriptive `aria-label` attributes
- **Keyboard Navigation**: Modals and drawers are closeable via the Escape key (where implemented); form fields follow logical tab order
- **Error Messaging**: Inline field errors appear immediately below the relevant input; alert banners summarise form-level errors
- **Loading States**: Spinner shown while cart and product grid initialise from `localStorage`
- **Empty States**: Friendly empty-cart message with a Continue Shopping link; no products found message when filters return zero results
