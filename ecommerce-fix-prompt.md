# E-Commerce Website Debugging & Enhancement Prompt

## Project Context
You are fixing a production e-commerce website. The site's theme, color scheme, overall design aesthetic, and business logic must remain **completely unchanged**. Your task is surgical: diagnose and fix specific display and navigation issues only.

---

## Issues to Fix

### 1. **Homepage Content Not Displaying Correctly**
**Symptoms:** Homepage renders but content is missing, misaligned, or not visible.

**Diagnosis Steps:**
- Check if all sections (hero banner, featured products, testimonials, CTAs, footer) are in the DOM
- Verify CSS classes and inline styles aren't hiding content (check `display: none`, `visibility: hidden`, `opacity: 0`, negative margins)
- Inspect CSS specificity conflicts that might override intended styles
- Check browser console for JavaScript errors preventing content rendering
- Verify image paths and asset loading (404 errors?)
- Check responsive breakpoints if mobile view is affected

**Fix Strategy:**
- Ensure all HTML elements render without CSS display overrides
- Verify component imports and props are correctly passed
- Debug state management if content depends on API calls or state
- Check for console errors or failed API requests
- Test with browser DevTools to isolate the issue

### 2. **Products Page Content Not Displaying Correctly**
**Symptoms:** Product listings, filters, or product details aren't showing.

**Diagnosis Steps:**
- Verify product data is being fetched (check Network tab for API calls)
- Check if product component rendering logic has conditional that prevents display
- Look for missing `.map()` implementations or incorrect array handling
- Verify filter/search functionality isn't incorrectly hiding all products
- Check image paths for product thumbnails
- Inspect for layout grid/flex issues causing products to overflow or collapse
- Test with dummy/mock data to isolate data fetching vs rendering issue

**Fix Strategy:**
- Ensure product API endpoint is responding correctly
- Verify data structure matches component expectations
- Fix any conditional rendering that blocks product display
- Restore proper grid/flex layout for product cards
- Test rendering with sample data

### 3. **Signin Button Missing from Header**
**Symptoms:** Header/navbar exists but no signin button visible.

**Diagnosis Steps:**
- Check if the signin button element is in the DOM (inspect HTML)
- Verify button isn't hidden by CSS (`display: none`, `opacity: 0`, overflow clipping)
- Check if z-index issues place it behind other elements
- Verify button text content isn't empty or whitespace-only
- Check responsive design—is button hidden on specific breakpoints?
- Inspect parent container's overflow or positioning that might hide the button
- Check for CSS that applies `visibility: hidden` or `width: 0`

**Fix Strategy:**
- Add/restore signin button to header component with proper visibility
- Ensure button uses existing theme colors and typography
- Add proper spacing and alignment with other header elements
- Make button responsive (visible on all breakpoints)
- Link signin button to your existing authentication flow
- Test button click functionality

---

## Implementation Requirements

### Do NOT Change:
- Project theme colors, typography, or design system
- Component architecture or business logic
- State management approach (Redux, Context, etc.)
- API endpoints or data structure
- Authentication mechanism or user roles
- Navigation routing structure
- Any other unrelated functionality

### Do Change:
- CSS/styling issues causing display problems
- Missing or hidden DOM elements
- Broken component rendering
- Missing event handlers or navigation links
- Incorrect props or state that causes display issues
- Asset paths or import statements if they're broken

---

## Debugging Approach

1. **Open Browser DevTools** (F12 or Cmd+Option+I)
   - Go to Elements/Inspector tab
   - Locate the problematic element
   - Check its computed styles
   - Note any `display: none`, `opacity: 0`, `visibility: hidden`, or positioning issues

2. **Check Console** (Console tab)
   - Look for JavaScript errors
   - Check for failed API requests
   - Monitor state/prop values if possible

3. **Check Network** (Network tab)
   - Verify API calls complete successfully
   - Check for 404 errors on images or assets
   - Confirm response data structure

4. **Isolate the Issue**
   - Temporarily comment out CSS to find which rule causes hiding
   - Add `console.log()` to verify data is being rendered
   - Use Git diff to see what recently changed if applicable

---

## Testing Checklist

- [ ] Homepage loads with all sections visible (hero, featured, testimonials, footer)
- [ ] Products page displays product grid/list with items visible
- [ ] Product filters work and don't hide all products
- [ ] Signin button is visible in header on desktop
- [ ] Signin button is visible in header on tablet
- [ ] Signin button is visible in header on mobile
- [ ] Signin button links to correct authentication flow
- [ ] No console errors after fixes
- [ ] Existing theme colors/fonts unchanged
- [ ] All internal links and navigation working
- [ ] No functionality broken that worked before

---

## Notes

- Use existing CSS classes and variables from your design system
- Match the tone and spacing of existing components
- Maintain accessibility standards (ARIA labels, semantic HTML)
- Test across Chrome, Firefox, Safari (if possible)
- Run any build/test commands required by your project
