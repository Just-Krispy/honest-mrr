# Accessibility Skill

**Purpose:** Ensure all digital products meet WCAG 2.1 AA accessibility standards and follow best practices for inclusive design.

**When to use:** Every web project, before launch. Accessibility is not optional—it's legally required and morally essential.

---

## Quick Checklist (Every Project)

Before declaring any web project "done," verify:

- [ ] **Keyboard navigation** works for all interactive elements
- [ ] **Focus indicators** visible on all focusable elements
- [ ] **Alt text** on all images (empty alt="" for decorative images)
- [ ] **Color contrast** meets WCAG AA (4.5:1 for text, 3:1 for UI)
- [ ] **ARIA labels** on interactive elements without text
- [ ] **Semantic HTML** (headings, landmarks, lists, buttons vs. divs)
- [ ] **Skip to content** link for keyboard users
- [ ] **Form labels** associated with inputs
- [ ] **Error messages** clearly communicated
- [ ] **Responsive text** (no fixed font sizes below 12px)

---

## Core Principles (POUR)

### 1. **Perceivable**
Content must be perceivable by all users.

**Common fixes:**
- Add alt text to images: `<img src="logo.png" alt="Company Logo">`
- Provide captions for videos
- Ensure color is not the only indicator (use icons + text)
- Test with 200% zoom (text should still be readable)

### 2. **Operable**
Users must be able to operate the interface.

**Common fixes:**
- All functionality available via keyboard (Tab, Enter, Space, Arrows)
- Focus indicators visible: `*:focus-visible { outline: 3px solid blue; }`
- No keyboard traps (users can escape modals, dropdowns)
- Give users enough time (no auto-advancing content)

### 3. **Understandable**
Content and interface must be understandable.

**Common fixes:**
- Clear, simple language
- Consistent navigation patterns
- Error messages explain what went wrong AND how to fix it
- Form inputs have visible labels

### 4. **Robust**
Content must work with assistive technologies.

**Common fixes:**
- Use semantic HTML (`<button>` not `<div onclick>`)
- Proper ARIA attributes when needed
- Valid HTML (no unclosed tags, proper nesting)
- Works with screen readers (NVDA, JAWS, VoiceOver)

---

## Common Patterns

### Tab Navigation (Proper ARIA)

```html
<nav role="tablist" aria-label="Dashboard sections">
  <button role="tab" aria-selected="true" aria-controls="panel1" id="tab1">
    Overview
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel2" id="tab2">
    Details
  </button>
</nav>

<div id="panel1" role="tabpanel" aria-labelledby="tab1" class="active">
  Panel 1 content
</div>
<div id="panel2" role="tabpanel" aria-labelledby="tab2" hidden>
  Panel 2 content
</div>
```

**JavaScript requirements:**
- Update `aria-selected` when tab changes
- Keyboard navigation: Arrow keys move between tabs, Enter/Space activates
- Home/End jump to first/last tab

### Skip to Content Link

```html
<a href="#main-content" class="skip-to-content">Skip to main content</a>

<style>
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 10000;
}

.skip-to-content:focus {
  top: 0;
}
</style>
```

### Modal Dialog

```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirmation</h2>
  <p>Are you sure?</p>
  <button aria-label="Close dialog">×</button>
</div>
```

**Requirements:**
- Trap focus inside modal while open
- Return focus to trigger element when closed
- Close on Escape key

### Clickable Cards

```html
<div role="button" tabindex="0" aria-label="View loan details for John Doe">
  <h3>John Doe</h3>
  <p>$250K loan</p>
</div>
```

**JavaScript:**
```javascript
card.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
});
```

### Form Inputs

```html
<label for="email">Email Address</label>
<input 
  type="email" 
  id="email" 
  name="email" 
  aria-required="true"
  aria-describedby="email-help"
>
<small id="email-help">We'll never share your email.</small>

<!-- Error state -->
<input 
  type="email" 
  id="email"
  aria-invalid="true"
  aria-errormessage="email-error"
>
<div id="email-error" role="alert">Please enter a valid email address.</div>
```

---

## Color Contrast

**WCAG AA Requirements:**
- Normal text (< 18pt): 4.5:1 contrast ratio
- Large text (≥ 18pt or 14pt bold): 3:1 contrast ratio
- UI components (buttons, icons): 3:1 contrast ratio

**Testing tools:**
- Browser DevTools (Chrome: Lighthouse, Firefox: Accessibility Inspector)
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Contrast plugin for Figma/Sketch

**Common failures:**
- Light gray text on white (#999 on #FFF = 2.85:1 ❌)
- Yellow text on white (fails contrast)
- Placeholder text (often too light)

**Fixes:**
- Use #666 or darker on white backgrounds
- Test links, buttons, badges, labels
- Don't rely on color alone (use icons + text)

---

## Testing Tools

### Automated Testing

1. **Lighthouse** (Chrome DevTools)
   - Press F12 → Lighthouse tab → Accessibility audit
   - Gives score 0-100 and lists issues

2. **axe DevTools** (Browser extension)
   - https://www.deque.com/axe/devtools/
   - Free extension for Chrome/Firefox
   - More detailed than Lighthouse

3. **WAVE** (WebAIM)
   - https://wave.webaim.org/
   - Visual feedback overlay on page
   - Shows ARIA labels, landmarks, errors

### Manual Testing

1. **Keyboard navigation**
   - Unplug your mouse
   - Tab through entire page
   - Can you access everything?
   - Can you see where focus is?

2. **Screen reader**
   - macOS: VoiceOver (Cmd+F5)
   - Windows: NVDA (free) or JAWS (paid)
   - Listen to how the page is announced
   - Do headings make sense? Are buttons labeled?

3. **200% zoom**
   - Ctrl/Cmd + "+" to zoom in
   - Text should still be readable
   - No horizontal scrolling

4. **Color blindness simulator**
   - Chrome extension: Colorblind - Dalton
   - Can you still distinguish UI elements?

---

## Common Mistakes

### ❌ Don't do this

```html
<!-- Div buttons (not keyboard accessible) -->
<div onclick="submit()">Submit</div>

<!-- Images without alt text -->
<img src="chart.png">

<!-- Links that say "click here" -->
<a href="/report">Click here</a>

<!-- Form inputs without labels -->
<input type="text" placeholder="Email">

<!-- Auto-playing videos -->
<video autoplay muted>

<!-- Fixed font sizes -->
font-size: 10px; /* Too small, doesn't scale -->
```

### ✅ Do this instead

```html
<!-- Real buttons -->
<button type="submit">Submit</button>

<!-- Descriptive alt text -->
<img src="chart.png" alt="Q4 revenue chart showing 23% growth">

<!-- Descriptive link text -->
<a href="/report">View Q4 financial report</a>

<!-- Inputs with labels -->
<label for="email">Email</label>
<input type="text" id="email" name="email">

<!-- User-controlled videos -->
<video controls>

<!-- Relative font sizes -->
font-size: 1rem; /* or 16px base, scaled with rem -->
```

---

## HTML Semantics

Use the right elements for the job.

### Headings (h1-h6)

```html
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
  <h2>Another Section</h2>
```

**Rules:**
- One `<h1>` per page (page title)
- Don't skip levels (h1 → h3 is wrong)
- Use for structure, not styling
- Screen readers use headings to navigate

### Landmarks

```html
<header>Site header</header>
<nav aria-label="Main navigation">...</nav>
<main id="main-content">
  <article>...</article>
  <aside>Sidebar</aside>
</main>
<footer>Site footer</footer>
```

**Screen readers jump between landmarks** — use them!

### Buttons vs. Links

- **Button:** Performs action (submit form, open modal, trigger JavaScript)
  ```html
  <button type="button" onclick="openModal()">Open</button>
  ```

- **Link:** Navigates to new page/location
  ```html
  <a href="/dashboard">Go to Dashboard</a>
  ```

### Lists

```html
<ul>
  <li>Unordered item</li>
</ul>

<ol>
  <li>Ordered item</li>
</ol>

<dl>
  <dt>Term</dt>
  <dd>Definition</dd>
</dl>
```

Screen readers announce "List, 3 items" — helps users understand structure.

---

## ARIA Attributes (When to Use)

**First rule of ARIA:** Don't use ARIA if HTML has a native element.

### When ARIA is needed

1. **Custom widgets** (tabs, accordions, carousels)
2. **Live regions** (notifications, status updates)
3. **Labels for icon-only buttons**
4. **Describing complex interactions**

### Common ARIA attributes

```html
<!-- Labeling -->
<button aria-label="Close modal">×</button>
<div aria-labelledby="heading-id">...</div>
<input aria-describedby="help-text-id">

<!-- State -->
<button aria-pressed="true">Bold</button>
<button aria-expanded="false">Menu</button>
<input aria-invalid="true">

<!-- Live regions -->
<div role="status" aria-live="polite">
  Saving...
</div>
<div role="alert" aria-live="assertive">
  Error: Please try again
</div>

<!-- Relationships -->
<button aria-controls="panel-id">Toggle</button>
<div id="panel-id">Content</div>
```

---

## Focus Management

### Visible Focus Indicators

```css
/* Modern approach (Safari 15.4+, Chrome 86+) */
*:focus-visible {
  outline: 3px solid blue;
  outline-offset: 2px;
}

/* Remove default outline only when replacing it */
*:focus {
  outline: none; /* ❌ Never do this alone */
}

/* Always provide an alternative */
*:focus {
  outline: 2px solid #000;
  outline-offset: 4px;
}
```

### Focus Trap (Modals)

When a modal opens, trap focus inside it.

```javascript
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
  
  firstFocusable.focus();
}
```

---

## Responsive & Mobile Accessibility

### Touch Targets

**WCAG 2.5.5:** Touch targets should be at least **44×44 pixels**.

```css
button, a, [role="button"] {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 20px;
}
```

### Zoom Support

```html
<!-- Allow zooming (don't disable it) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- ❌ Never do this -->
<meta name="viewport" content="user-scalable=no, maximum-scale=1.0">
```

### Responsive Text

```css
/* Use relative units */
font-size: 1rem; /* 16px base */
font-size: clamp(1rem, 2vw, 1.5rem); /* Scales with viewport */

/* Never use absolute units below 12px */
font-size: 10px; /* ❌ Too small */
```

---

## Legal Requirements

### United States

- **Section 508** (Federal websites)
- **ADA Title III** (Commercial websites)
- **CVAA** (Communications/video)

### International

- **WCAG 2.1 AA** (global standard)
- **EN 301 549** (Europe)
- **AODA** (Ontario, Canada)

**Bottom line:** WCAG 2.1 AA compliance covers most legal requirements.

---

## Resources

### Official Guidelines
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/

### Testing Tools
- **Lighthouse:** Built into Chrome DevTools
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WAVE:** https://wave.webaim.org/
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

### Screen Readers
- **NVDA (Windows, free):** https://www.nvaccess.org/
- **JAWS (Windows, paid):** https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver (macOS/iOS, built-in):** Cmd+F5
- **TalkBack (Android, built-in):** Settings → Accessibility

### Learning
- **WebAIM:** https://webaim.org/
- **The A11Y Project:** https://www.a11yproject.com/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility

---

## Pre-Launch Checklist

Run through this before going live:

1. **Lighthouse audit** (aim for 90+ score)
2. **Keyboard test** (navigate entire site without mouse)
3. **Screen reader test** (NVDA/VoiceOver for 10 minutes)
4. **Color contrast check** (all text, buttons, icons)
5. **Zoom to 200%** (still readable?)
6. **Check alt text** on all images
7. **Verify form labels** (all inputs have labels)
8. **Test with animations off** (`prefers-reduced-motion`)

---

## Quick Fixes for Common Issues

### Missing Alt Text
```bash
# Find images without alt text
grep -r '<img' . | grep -v 'alt='
```

### Low Contrast Text
```css
/* Instead of #999 on white (fails) */
color: #999; /* 2.85:1 ❌ */

/* Use darker gray */
color: #666; /* 5.74:1 ✅ */
```

### Clickable Divs
```html
<!-- Before -->
<div class="card" onclick="openDetails()">

<!-- After -->
<button class="card" type="button" aria-label="View details">
```

### Icon-Only Buttons
```html
<!-- Before -->
<button>×</button>

<!-- After -->
<button aria-label="Close modal">×</button>
```

---

## When in Doubt

1. **Use semantic HTML** (button, nav, header, main, footer)
2. **Test with keyboard** (Tab, Enter, Escape, Arrows)
3. **Add aria-label** if meaning isn't clear from text
4. **Run Lighthouse** and fix what it finds
5. **Ask:** "Would this make sense to a blind user?"

Accessibility is not a feature — it's a baseline requirement. Build it in from day one.
