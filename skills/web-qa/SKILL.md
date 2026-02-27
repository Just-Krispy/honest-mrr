---
name: web-qa
description: Quality assurance for web pages. Checks design consistency, layout quality, accessibility, mobile responsiveness, and brand adherence. Use before deploying web projects to ensure professional user experience.
---

# Web QA Skill

Systematic quality assurance for web pages. Run this before deploying to catch layout issues, broken animations, brand inconsistencies, and UX problems.

## When to Use

- After building new HTML pages
- Before committing major UI changes
- When user reports "page feels off"
- Before client demos
- Pre-deployment checklist

## QA Checklist

### 1. Layout & Structure

**Container Consistency:**
```bash
# Check if all pages use same container approach
grep -r "max-width.*px" *.html
```

**Look for:**
- ❌ Negative margins (`margin: -40px`) causing overlap
- ❌ Inconsistent max-widths (one page 660px, another 1200px)
- ✅ Consistent padding (0 16px 48px or 0 24px 48px)
- ✅ Same gap values (14px or 24px, not both)

**Grid vs Flex:**
- If main demo uses flexbox `.cards`, new pages should too
- Avoid mixing `grid-template-columns: repeat(auto-fit...)` with flex layouts
- Keep it simple: flex column with gap for vertical card lists

### 2. Animation & Movement

**Hover Effects:**
```css
/* ✅ Good - subtle */
a.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,.14);
}

/* ❌ Bad - too aggressive */
.module-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 32px rgba(0,0,0,.12);
}
```

**Test:**
- Hover cards - should be subtle (≤3px translateY)
- Transitions should be ≤0.3s
- No jarring movements
- Smooth easing (default or ease-out)

### 3. Brand Consistency

**Farm Credit SEMO Colors:**
```css
/* Primary palette */
#345220 /* Dark green (headers, dark elements) */
#52812c /* Brand green (primary actions, accents) */
#426824 /* Medium green (gradients, hover states) */
#8bc34a /* Accent green (highlights, badges, borders) */

/* Backgrounds */
#f4f7f0 /* Page background (light cream-green) */
#f2f7ed /* Card backgrounds (light green tint) */

/* Text */
#1e3013 /* Primary text (dark green-black) */
#6b7280 /* Secondary text (gray) */
#4b5563 /* Body text (dark gray) */
```

**Check:**
```bash
# Find color usage
grep -r "#[0-9a-fA-F]\{6\}" *.html | cut -d: -f2 | sort | uniq
```

**✅ Should see:** Only colors from the palette above  
**❌ Red flags:** Random blues (#1e3a8a), teals (#10b981), etc.

### 4. Typography

**Font Stack:**
```css
font-family: 'Inter', system-ui, sans-serif;
```

**Hierarchy:**
```css
/* Headers */
h1: 32px, font-weight: 900
h2: 17px (cards), font-weight: 700
h3: 16px, font-weight: 700

/* Body */
p: 13-15px, line-height: 1.6-1.7
small: 11-12px, uppercase, letter-spacing: 0.5-1.5px

/* Never use default font sizes - always specify */
```

**Check for:**
- ❌ Missing Google Fonts link
- ❌ Inconsistent font weights (one page uses 800, another 900)
- ❌ Line-height >2.0 (too spacey) or <1.4 (too cramped)

### 5. Component Consistency

**Card Structure (Standard):**
```html
<a class="card" href="...">
  <div class="card-inner">
    <div class="card-icon">🌱</div>
    <div>
      <h2>Title <span class="card-badge badge-live">Badge</span></h2>
      <p>Description text...</p>
    </div>
    <div class="arrow">→</div>
  </div>
</a>
```

**CSS:**
```css
a.card {
  border-left: 5px solid #52812c; /* Always left border */
  border-radius: 16px; /* Consistent radius */
  padding: 22px 24px; /* Consistent padding */
}
```

**Badges:**
```css
/* Standard badge classes */
.badge-new { background: #fff3cd; color: #856404; }
.badge-live { background: #d4edda; color: #155724; }
.badge-staff { background: #e0e7ff; color: #3730a3; }
```

### 6. Header Consistency

**Standard Header:**
```html
<header>
  <div class="tag">🌾 Category Label</div>
  <h1>Main Title <span>Accent</span></h1>
  <p>Subtitle description...</p>
  <div class="stats-row">
    <!-- 3-4 stats max -->
  </div>
</header>
```

**CSS:**
```css
header {
  background: linear-gradient(135deg, #345220 0%, #52812c 60%, #426824 100%);
  padding: 48px 24px 40px; /* Consistent padding */
}

header::before {
  /* Wheat pattern overlay */
  background: url("data:image/svg+xml,...");
  opacity: 0.03;
}
```

**Check:**
- Same gradient on all pages
- Same wheat pattern overlay
- Tag badge always has same style
- Accent `<span>` always #8bc34a

### 7. Mobile Responsiveness

**Test breakpoints:**
```bash
# Check for @media queries
grep -A5 "@media" *.html
```

**Should have:**
```css
@media (max-width: 768px) {
  .cards { padding: 0 12px 32px; } /* Tighter padding */
  .stats-row { gap: 20px; } /* Smaller gaps */
  header h1 { font-size: 26px; } /* Smaller titles */
}
```

**Test on:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Phone (375x667)

### 8. Performance

**File Size Limits:**
- HTML file: <30KB (else split into components)
- Inline CSS: <15KB (else external stylesheet)
- Total page load: <100KB

**Check:**
```bash
ls -lh *.html | awk '{print $5, $9}'
```

**Red flags:**
- Single HTML file >50KB
- Repeated CSS blocks (should be DRY)
- Unused CSS rules

### 9. Accessibility

**Quick checks:**
```html
<!-- ✅ Good -->
<a class="card" href="...">
<button class="cta-button">

<!-- ❌ Bad -->
<div class="card" onclick="...">
<span class="button" onclick="...">
```

**Must have:**
- Alt text on images
- Semantic HTML (header, nav, main, footer)
- Links that look like links
- Buttons that look like buttons
- Contrast ratio ≥4.5:1 for text

### 10. Cross-Page Consistency

**Compare pages:**
```bash
# Extract CSS variables/values and diff
grep "background:" page1.html > /tmp/p1.css
grep "background:" page2.html > /tmp/p2.css
diff /tmp/p1.css /tmp/p2.css
```

**Should be identical:**
- Header gradient
- Card border-left width & color
- Hover transform values
- Font family declaration
- Container max-width
- Gap/padding values

## QA Process

### Step 1: Visual Inspection
1. Open page in browser
2. Hover all interactive elements
3. Resize window (desktop → tablet → phone)
4. Check animations are smooth (not jarring)
5. Verify color palette matches brand

### Step 2: Code Review
```bash
# Run these checks
cd /path/to/project

# 1. Find non-brand colors
grep -roh "#[0-9a-fA-F]\{6\}" *.html | sort | uniq

# 2. Check container widths
grep -r "max-width" *.html | grep -v "660px\|600px"

# 3. Find aggressive animations
grep -r "translateY" *.html | grep -E "\-[4-9]px|\-[1-9][0-9]px"

# 4. Check font consistency
grep -r "font-family" *.html | sort | uniq

# 5. Verify mobile breakpoints
grep -r "@media" *.html
```

### Step 3: Compare to Reference
```bash
# Use main demo index as reference
REFERENCE="index.html"
NEW_PAGE="new-page.html"

# Extract and compare structures
diff <(grep "class=" $REFERENCE | sort) \
     <(grep "class=" $NEW_PAGE | sort)
```

### Step 4: User Testing
1. Share live link
2. Ask: "Does anything feel off?"
3. Test on different devices
4. Check Console for errors (F12)

## Common Issues & Fixes

### Issue: Cards different heights
**Cause:** Inconsistent content or missing `align-items: flex-start`  
**Fix:**
```css
.card-inner {
  display: flex;
  align-items: flex-start; /* Not center */
}
```

### Issue: Hover too "jumpy"
**Cause:** `translateY` >5px  
**Fix:**
```css
a.card:hover {
  transform: translateY(-3px); /* Max 3px */
}
```

### Issue: Colors don't match
**Cause:** Using random hex codes  
**Fix:** Replace with brand palette (see section 3)

### Issue: Mobile layout broken
**Cause:** Missing `@media` query or fixed widths  
**Fix:**
```css
@media (max-width: 768px) {
  .cards { max-width: 100%; padding: 0 16px; }
  header h1 { font-size: 26px; }
}
```

### Issue: Page feels "busy"
**Cause:** Too many animations, colors, or elements  
**Fix:** Simplify - less is more. Use whitespace.

## Pre-Commit Checklist

Before `git commit`:

- [ ] Visual check: page looks clean
- [ ] Hover test: animations are ≤3px
- [ ] Color check: only brand palette used
- [ ] Mobile test: responsive on phone
- [ ] Code check: matches reference structure
- [ ] File size: <30KB
- [ ] Console: zero errors
- [ ] Links: all work
- [ ] Fonts: Inter loaded correctly
- [ ] Accessibility: semantic HTML used

## Example QA Report

```markdown
# QA Report: agsunrise-platform/index.html

## Issues Found

### Critical
- ❌ Hover animation too aggressive (6px, should be 3px)
- ❌ Container uses negative margin (-40px)
- ❌ Max-width 1200px (should be 660px)

### Moderate
- ⚠️ Non-brand colors used (#1e3a8a, #10b981)
- ⚠️ Grid layout when flex would be cleaner
- ⚠️ Missing mobile breakpoint

### Minor
- 📝 File size 14KB (good, <30KB limit)
- 📝 Fonts load correctly

## Recommended Fixes

1. Match main demo structure (`.cards` container, flex column)
2. Replace grid with `display: flex; flex-direction: column; gap: 14px`
3. Change hover to `translateY(-3px)`
4. Update colors to brand palette
5. Add `@media (max-width: 768px)` query

## After Fix

- ✅ All issues resolved
- ✅ Matches reference page structure
- ✅ User experience consistent
```

## Quick Fix Script

```bash
#!/bin/bash
# qa-fix.sh - Quick consistency fixes

FILE=$1

# Fix common issues
sed -i 's/translateY(-[4-9]px)/translateY(-3px)/g' $FILE
sed -i 's/max-width: 1200px/max-width: 660px/g' $FILE
sed -i 's/#1e3a8a/#52812c/g' $FILE
sed -i 's/#10b981/#8bc34a/g' $FILE

echo "✅ Quick fixes applied to $FILE"
echo "⚠️ Manual review still required"
```

## Tools

**Browser Extensions:**
- WAVE (accessibility)
- ColorZilla (color picker)
- Responsive Viewer (multi-device preview)

**CLI Tools:**
```bash
# Check HTML validity
npx html-validate *.html

# Check CSS formatting
npx stylelint "**/*.html"

# Check lighthouse scores
npx lighthouse https://example.com --view
```

## Success Criteria

A page passes QA when:

✅ Looks identical to reference page (same feel)  
✅ Hover animations are subtle (≤3px)  
✅ Only brand colors used  
✅ Mobile responsive  
✅ Zero console errors  
✅ File size reasonable (<30KB)  
✅ User says "this feels right"

---

**Remember:** Consistency > Creativity. Match the existing style, don't invent new patterns.
