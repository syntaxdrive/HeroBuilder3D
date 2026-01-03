
# 📐 Visual Alignment & Layout Architecture

This document defines the strict logic for handling visual alignment between the HTML Overlay Layer (Text/Buttons) and the WebGL Render Layer (3D Models).

## 1. The Coordinate Systems

To achieve seamless alignment, we must map two distinct coordinate systems:

1.  **DOM Space (2D):** Measured in Pixels (`px`), Percentages (`%`), and Viewport Units (`vw`/`vh`).
    *   Origin: Top-Left (0,0).
    *   Used for: Text, Buttons, UI.
2.  **Three.js World Space (3D):** Measured in arbitrary Units.
    *   Origin: Center of Scene (0,0,0).
    *   Used for: 3D Meshes, Lights, Camera.

### The Synchronization Constant
For a standard Perspective Camera setup:
*   **FOV:** 35 degrees
*   **Camera Z-Position:** 15 units
*   **Visible Height at Z=0:** ~9.5 units
*   **Visible Width at Z=0:** `9.5 * (window.innerWidth / window.innerHeight)`

---

## 2. Layout States & Logic

The application supports 4 distinct layout modes defined in `LayoutType`.

### A. `split-left` (Standard SaaS)
*   **Concept:** Text on the Left (40% width), Model on the Right (60% width).
*   **DOM Layer:**
    *   `top: 50%`, `transform: translateY(-50%)`
    *   `left: 8%` (Desktop) / `left: 15%` (Tablet)
    *   `text-align: left`
    *   `max-width: 550px`
*   **WebGL Layer:**
    *   `position.x`: Positive (Right). Value: `+4.8`
    *   `position.y`: `0` (Vertically Centered)
    *   `rotation`: Slow Y-axis spin.

### B. `split-right` (Inverted)
*   **Concept:** Text on the Right, Model on the Left.
*   **DOM Layer:**
    *   `top: 50%`, `transform: translateY(-50%)`
    *   `right: 8%`
    *   `text-align: right` (or Left aligned, anchored Right)
*   **WebGL Layer:**
    *   `position.x`: Negative (Left). Value: `-4.8`
    *   `position.y`: `0`

### C. `centered-stack` (Immersive)
*   **Concept:** Text centered in the middle of the screen. Model behind text or integrated.
*   **DOM Layer:**
    *   `top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`
    *   `text-align: center`
    *   `width: 80%`
*   **WebGL Layer:**
    *   `position.x`: `0`
    *   `position.y`: `0`
    *   **Opacity Rule:** The model must either:
        1.  Have lower opacity (`0.25`).
        2.  Or float slightly above/behind the text to ensure readability.

### D. `asymmetric-offset` (Artistic)
*   **Concept:** Text anchored Bottom-Left. Model floats Top-Right.
*   **DOM Layer:**
    *   `bottom: 15vh`
    *   `left: 10%`
    *   `text-align: left`
*   **WebGL Layer:**
    *   `position.x`: Positive (Right). Value: `+3.5`
    *   `position.y`: Positive (Up). Value: `+1.5`

---

## 3. Responsive Breakpoints

The alignment logic shifts drastically between Mobile (< 768px) and Desktop (> 768px).

### Mobile View (< 768px)
*   **Global Rule:** Layout presets are ignored. Vertical Stacking is enforced.
*   **Stack Order:**
    1.  **Top 50%:** 3D Model Area.
    2.  **Bottom 50%:** Text/Content Area.
*   **DOM Layer:**
    *   `position`: Absolute/Fixed to bottom half.
    *   `text-align`: Center.
    *   `padding`: 24px.
*   **WebGL Layer:**
    *   `position.x`: `0` (Centered).
    *   `position.y`: Positive (Up). Value: `+2.8`.
    *   `scale`: Reduced by 20-30% to fit width.
    *   `camera.z`: Increased (moved back) to `24` to prevent clipping edges on narrow screens.

### Tablet View (768px - 1024px)
*   **Rule:** Follows Desktop layouts but with tighter margins.
*   **Sidebar:** Sidebar is usually closed by default or overlays content (z-index higher).

---

## 4. The Sidebar Offset Calculation

When the Editor Sidebar is **OPEN** (Width: 420px), the "Optical Center" of the page shifts.
If we do not account for this, the 3D model will be hidden behind the sidebar.

### The Algorithm
1.  **Detect State:** `sidebarOpen === true` AND `!isMobile`.
2.  **Calculate HTML Shift:**
    *   Add `margin-left: 420px` to the Text Container.
    *   *Alternative:* Add `margin-left: 210px` (Half width) to center it in the *remaining* space.
3.  **Calculate WebGL Shift:**
    *   We need to shift the Camera or the Object to the right to center it in the remaining viewport.
    *   **Math:**
        *   Viewport Width: `W`
        *   Sidebar Width: `S` (420px)
        *   Visible 3D Width at depth: `V_w` (approx 28 units at z=15)
        *   **Shift Formula (Units):** `(S / W) * V_w * 0.5`
    *   **Result:** Move mesh `position.x` by roughly `+3.5` units when sidebar opens.

---

## 5. Implementation Checklist

### HTML (React)
- [ ] Text container must use `absolute` positioning.
- [ ] Text container z-index must be `10` (Above Canvas).
- [ ] Transitions on `left`, `right`, `text-align` must be `duration-500` CSS transitions for smoothness.

### WebGL (Three.js)
- [ ] `SceneManager.updateObject()` must act as the orchestrator.
- [ ] `applyLayoutOffsets()` function must run on:
    1.  Config Change (Layout select).
    2.  Resize Event.
    3.  Sidebar Toggle.
- [ ] **Smoothness:** Do not snap positions. Use Linear Interpolation (Lerp) in the `animate` loop for positions:
    ```javascript
    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetX, 0.1);
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, 0.1);
    ```

## 6. Edge Case Handling

1.  **Ultra-Wide Monitors:**
    *   Clamp the Text Container to a `max-width` container (e.g., `1400px`) so text doesn't fly to the far edges.
    *   3D Model should stay relatively centered within the visual viewport, not the physical screen edge.

2.  **Short Vertical Screens (Laptops):**
    *   If `aspectRatio > 2.0` (Very wide, short), increase Camera FOV or move Camera Z back to ensure the model doesn't get cropped vertically.
