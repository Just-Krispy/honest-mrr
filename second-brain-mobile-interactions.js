/**
 * Second Brain Mobile Interactions
 * Created: 2026-03-15
 * Handles touch gestures, pinch-to-zoom, swipe mode switching, and collapsible UI
 */

// ============================================
// ENHANCEMENT 1: PINCH-TO-ZOOM
// ============================================

class GraphZoom {
  constructor(graphElement) {
    this.graph = graphElement;
    this.scale = 1;
    this.minScale = 0.5;
    this.maxScale = 3;
    this.lastDistance = 0;
    this.lastScale = 1;
    
    this.init();
  }

  init() {
    // Pinch zoom
    this.graph.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.graph.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.graph.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Double tap to reset
    this.graph.addEventListener('dblclick', this.resetZoom.bind(this));
    
    // Create zoom indicator
    this.createZoomIndicator();
    this.createResetButton();
  }

  handleTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.lastDistance = this.getDistance(e.touches[0], e.touches[1]);
      this.lastScale = this.scale;
    }
  }

  handleTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      
      const distance = this.getDistance(e.touches[0], e.touches[1]);
      const delta = distance / this.lastDistance;
      this.scale = Math.min(Math.max(this.lastScale * delta, this.minScale), this.maxScale);
      
      this.applyZoom();
      this.showZoomIndicator();
    }
  }

  handleTouchEnd(e) {
    if (e.touches.length < 2) {
      this.hideZoomIndicator();
    }
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  applyZoom() {
    this.graph.style.transform = `scale(${this.scale})`;
    this.updateZoomIndicator();
    
    // Show/hide reset button
    if (this.scale !== 1) {
      this.resetBtn.style.display = 'flex';
    } else {
      this.resetBtn.style.display = 'none';
    }
  }

  resetZoom() {
    this.scale = 1;
    this.lastScale = 1;
    this.graph.style.transform = 'scale(1)';
    this.resetBtn.style.display = 'none';
  }

  createZoomIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'zoom-indicator';
    this.indicator.textContent = '100%';
    document.body.appendChild(this.indicator);
  }

  createResetButton() {
    this.resetBtn = document.createElement('button');
    this.resetBtn.className = 'reset-zoom-btn';
    this.resetBtn.innerHTML = '⊗';
    this.resetBtn.style.display = 'none';
    this.resetBtn.addEventListener('click', this.resetZoom.bind(this));
    document.body.appendChild(this.resetBtn);
  }

  showZoomIndicator() {
    this.indicator.classList.add('visible');
  }

  hideZoomIndicator() {
    setTimeout(() => {
      this.indicator.classList.remove('visible');
    }, 1000);
  }

  updateZoomIndicator() {
    const percent = Math.round(this.scale * 100);
    this.indicator.textContent = `${percent}%`;
  }
}

// ============================================
// ENHANCEMENT 2: SWIPE FOR MODE TOGGLE
// ============================================

class SwipeMode {
  constructor(graphElement, modes = ['play', 'crt', 'therm', 'nvis']) {
    this.graph = graphElement;
    this.modes = modes;
    this.currentIndex = 0;
    this.startX = 0;
    this.startY = 0;
    this.threshold = 50; // pixels to trigger swipe
    
    this.init();
  }

  init() {
    this.graph.addEventListener('touchstart', this.handleSwipeStart.bind(this), { passive: true });
    this.graph.addEventListener('touchmove', this.handleSwipeMove.bind(this), { passive: false });
    this.graph.addEventListener('touchend', this.handleSwipeEnd.bind(this), { passive: true });
    
    this.createModeIndicator();
    this.createSwipeArrows();
    this.showSwipeHint();
  }

  handleSwipeStart(e) {
    if (e.touches.length === 1) {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }
  }

  handleSwipeMove(e) {
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - this.startX;
      const deltaY = e.touches[0].clientY - this.startY;
      
      // Show arrow indicators during swipe
      if (Math.abs(deltaX) > 20 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          this.showArrow('left');
        } else {
          this.showArrow('right');
        }
      }
    }
  }

  handleSwipeEnd(e) {
    const deltaX = e.changedTouches[0].clientX - this.startX;
    const deltaY = e.changedTouches[0].clientY - this.startY;
    
    this.hideArrows();
    
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.threshold) {
      if (deltaX > 0) {
        // Swipe right - previous mode
        this.previousMode();
      } else {
        // Swipe left - next mode
        this.nextMode();
      }
    }
  }

  nextMode() {
    this.currentIndex = (this.currentIndex + 1) % this.modes.length;
    this.changeMode();
  }

  previousMode() {
    this.currentIndex = (this.currentIndex - 1 + this.modes.length) % this.modes.length;
    this.changeMode();
  }

  changeMode() {
    const mode = this.modes[this.currentIndex];
    
    // Dispatch custom event
    const event = new CustomEvent('modeChange', { 
      detail: { mode, index: this.currentIndex } 
    });
    this.graph.dispatchEvent(event);
    
    // Update UI
    this.showModeIndicator(mode);
    
    // Update mode buttons if they exist
    this.updateModeButtons(mode);
    
    // Apply mode to graph (you'll need to implement this based on your graph library)
    this.applyMode(mode);
  }

  applyMode(mode) {
    // Example: Update graph visualization based on mode
    // This will depend on your specific graph implementation
    console.log(`Applying mode: ${mode}`);
    
    // You might do something like:
    // if (mode === 'crt') {
    //   this.graph.classList.add('crt-mode');
    // }
    
    // Or call your graph library's API:
    // graphInstance.setMode(mode);
  }

  updateModeButtons(activeMode) {
    const buttons = document.querySelectorAll('.mode-button, .view-mode-btn');
    buttons.forEach(btn => {
      const btnMode = btn.dataset.mode || btn.textContent.toLowerCase();
      if (btnMode === activeMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  createModeIndicator() {
    this.modeIndicator = document.createElement('div');
    this.modeIndicator.className = 'mode-indicator';
    document.body.appendChild(this.modeIndicator);
  }

  showModeIndicator(mode) {
    this.modeIndicator.textContent = mode.toUpperCase();
    this.modeIndicator.classList.add('visible');
    
    setTimeout(() => {
      this.modeIndicator.classList.remove('visible');
    }, 1500);
  }

  createSwipeArrows() {
    this.leftArrow = document.createElement('div');
    this.leftArrow.className = 'swipe-arrow left';
    this.leftArrow.textContent = '←';
    document.body.appendChild(this.leftArrow);
    
    this.rightArrow = document.createElement('div');
    this.rightArrow.className = 'swipe-arrow right';
    this.rightArrow.textContent = '→';
    document.body.appendChild(this.rightArrow);
  }

  showArrow(direction) {
    if (direction === 'left') {
      this.leftArrow.classList.add('visible');
      this.rightArrow.classList.remove('visible');
    } else {
      this.rightArrow.classList.add('visible');
      this.leftArrow.classList.remove('visible');
    }
  }

  hideArrows() {
    this.leftArrow.classList.remove('visible');
    this.rightArrow.classList.remove('visible');
  }

  showSwipeHint() {
    // Only show once per session
    if (sessionStorage.getItem('swipeHintShown')) return;
    
    const hint = document.createElement('div');
    hint.className = 'swipe-hint show';
    hint.textContent = '← Swipe to change view mode →';
    document.body.appendChild(hint);
    
    setTimeout(() => {
      hint.classList.remove('show');
      setTimeout(() => hint.remove(), 500);
    }, 4000);
    
    sessionStorage.setItem('swipeHintShown', 'true');
  }
}

// ============================================
// ENHANCEMENT 3: COLLAPSIBLE LEGEND
// ============================================

class CollapsibleLegend {
  constructor(legendElement) {
    this.legend = legendElement;
    this.isMinimized = false;
    
    this.init();
  }

  init() {
    // Create toggle button
    const toggle = document.createElement('div');
    toggle.className = 'legend-toggle';
    toggle.innerHTML = '−';
    toggle.addEventListener('click', this.toggleLegend.bind(this));
    this.legend.appendChild(toggle);
    
    // Store original content
    this.details = this.legend.querySelector('.legend-details') || 
                   this.createDetailsWrapper();
    
    // Click to toggle when minimized
    this.legend.addEventListener('click', (e) => {
      if (this.isMinimized && e.target !== toggle) {
        this.toggleLegend();
      }
    });
  }

  createDetailsWrapper() {
    const wrapper = document.createElement('div');
    wrapper.className = 'legend-details';
    
    // Move all children except toggle into wrapper
    const children = Array.from(this.legend.children);
    children.forEach(child => {
      if (!child.classList.contains('legend-toggle')) {
        wrapper.appendChild(child);
      }
    });
    
    this.legend.appendChild(wrapper);
    return wrapper;
  }

  toggleLegend() {
    this.isMinimized = !this.isMinimized;
    
    if (this.isMinimized) {
      this.legend.classList.add('minimized');
      const toggle = this.legend.querySelector('.legend-toggle');
      if (toggle) toggle.innerHTML = '+';
    } else {
      this.legend.classList.remove('minimized');
      const toggle = this.legend.querySelector('.legend-toggle');
      if (toggle) toggle.innerHTML = '−';
    }
  }
}

// ============================================
// ENHANCEMENT 4: BOTTOM SHEET STATS
// ============================================

class BottomSheet {
  constructor(statsElement) {
    this.stats = statsElement;
    this.isCollapsed = true;
    this.startY = 0;
    this.currentY = 0;
    
    this.init();
  }

  init() {
    // Add classes
    this.stats.classList.add('stats-container', 'collapsed');
    
    // Create handle
    const handle = document.createElement('div');
    handle.className = 'stats-handle';
    this.stats.insertBefore(handle, this.stats.firstChild);
    
    // Create header
    const header = this.createHeader();
    this.stats.insertBefore(header, handle.nextSibling);
    
    // Touch events
    handle.addEventListener('touchstart', this.handleDragStart.bind(this));
    handle.addEventListener('touchmove', this.handleDragMove.bind(this));
    handle.addEventListener('touchend', this.handleDragEnd.bind(this));
    
    // Click header to toggle
    header.addEventListener('click', this.toggle.bind(this));
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'stats-header';
    
    const title = document.createElement('div');
    title.className = 'stats-title';
    title.textContent = 'Vault Stats';
    
    const icon = document.createElement('div');
    icon.className = 'stats-expand-icon';
    icon.textContent = '▼';
    
    header.appendChild(title);
    header.appendChild(icon);
    
    return header;
  }

  handleDragStart(e) {
    this.startY = e.touches[0].clientY;
  }

  handleDragMove(e) {
    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;
    
    // Only allow dragging in valid directions
    if ((this.isCollapsed && deltaY < 0) || (!this.isCollapsed && deltaY > 0)) {
      e.preventDefault();
      const translateY = this.isCollapsed 
        ? Math.max(deltaY, -300) 
        : Math.min(deltaY, 300);
      this.stats.style.transform = `translateY(${translateY}px)`;
    }
  }

  handleDragEnd(e) {
    const deltaY = this.currentY - this.startY;
    const threshold = 50;
    
    this.stats.style.transform = '';
    
    if (Math.abs(deltaY) > threshold) {
      if (deltaY < 0 && this.isCollapsed) {
        this.expand();
      } else if (deltaY > 0 && !this.isCollapsed) {
        this.collapse();
      }
    }
  }

  toggle() {
    if (this.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  expand() {
    this.isCollapsed = false;
    this.stats.classList.remove('collapsed');
  }

  collapse() {
    this.isCollapsed = true;
    this.stats.classList.add('collapsed');
  }
}

// ============================================
// INITIALIZATION
// ============================================

function initMobileEnhancements() {
  // Only run on mobile devices
  if (window.innerWidth > 768) return;
  
  // Get graph element (adjust selector to match your HTML)
  const graph = document.querySelector('.knowledge-graph') || 
                document.querySelector('.graph-container') ||
                document.querySelector('#graph');
  
  if (graph) {
    // Initialize zoom
    new GraphZoom(graph);
    
    // Initialize swipe mode switching
    // Adjust modes array to match your actual modes
    new SwipeMode(graph, ['play', 'crt', 'therm', 'nvis']);
  }
  
  // Get legend element
  const legend = document.querySelector('.legend') || 
                 document.querySelector('.graph-legend');
  
  if (legend) {
    new CollapsibleLegend(legend);
  }
  
  // Get stats element
  const stats = document.querySelector('.stats-section') || 
                document.querySelector('.bottom-stats') ||
                document.querySelector('.vault-stats');
  
  if (stats) {
    new BottomSheet(stats);
  }
  
  console.log('✅ Mobile enhancements initialized');
}

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileEnhancements);
} else {
  initMobileEnhancements();
}

// Re-initialize on resize (if switching from desktop to mobile)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth <= 768) {
      initMobileEnhancements();
    }
  }, 250);
});

// Export for manual initialization if needed
window.SecondBrainMobile = {
  GraphZoom,
  SwipeMode,
  CollapsibleLegend,
  BottomSheet,
  init: initMobileEnhancements
};
