// Flag to prevent duplicate resizer insertion
let resizerInserted = false;

function insertDraggableResizer() {
  try {
    // Get required DOM elements
    const editor = document.querySelector(".page-map-editor");
    const left = document.querySelector(".page-map-editor > .map-embed");
    let right = document.querySelector(".page-map-editor > .map-overview");
    if (!right)
      right = document.querySelector(".page-map-editor > .location-preview");

    // Abort if essential elements are missing
    if (!editor || !left || !right) {
      console.log("Missing elements, skipping resizer insertion.");
      return;
    }

    // Cleanup previous resizer if exists
    const existingResizer = editor.querySelector(".window-resizer");
    if (existingResizer) existingResizer.remove();

    // Setup grid layout for resizing
    editor.style.display = "grid";
    editor.style.gridTemplateColumns = "1fr 1fr";
    editor.style.position = "relative";

    // Create and insert resizer element
    const resizer = document.createElement("div");
    resizer.classList.add("window-resizer");
    editor.appendChild(resizer);

    // Position resizer based on current layout
    function updateResizerPosition() {
      const editorRect = editor.getBoundingClientRect();
      const computedStyle = getComputedStyle(editor);
      // Handle different browser implementations of grid gap
      const gap = parseFloat(
        computedStyle.columnGap || computedStyle.gridColumnGap || "0"
      );

      const leftWidth = left.getBoundingClientRect().width;
      resizer.style.left = `${leftWidth}px`;
      resizer.style.width = `${gap}px`; // Span entire gap width
    }

    updateResizerPosition();

    // Drag state tracking
    let isDragging = false;

    resizer.onmousedown = (e) => {
      isDragging = true;
      // Visual feedback during drag
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    };

    document.onmousemove = (e) => {
      if (!isDragging) return;

      const editorRect = editor.getBoundingClientRect();
      const totalWidth = editorRect.width;
      // Calculate relative mouse position
      let offsetX = e.clientX - editorRect.left;

      // Enforce minimum column widths
      const minWidth = 100;
      const maxWidth = totalWidth - minWidth;
      offsetX = Math.max(minWidth, Math.min(offsetX, maxWidth));

      // Convert to percentage-based grid
      const leftPercent = (offsetX / totalWidth) * 100;
      editor.style.gridTemplateColumns = `${leftPercent}% ${
        100 - leftPercent
      }%`;

      updateResizerPosition();
    };

    document.onmouseup = () => {
      if (isDragging) {
        isDragging = false;
        // Restore cursor and selection
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    console.log("Resizer inserted.");
    resizerInserted = true; // Prevent re-execution
  } catch (err) {
    console.error("Error inserting resizer:", err);
  }
}

// Mutation observer for dynamic content
const observer = new MutationObserver((mutations, obs) => {
  if (resizerInserted) return; // Skip if already inserted

  // Same element detection as main function
  const editor = document.querySelector(".page-map-editor");
  const left = document.querySelector(".page-map-editor > .map-embed");
  let right = document.querySelector(".page-map-editor > .map-overview");
  if (!right)
    right = document.querySelector(".page-map-editor > .location-preview");

  // Insert when required elements appear
  if (editor && left && right) {
    obs.disconnect(); // Prevent multiple triggers
    insertDraggableResizer();
  }
});

// Start observing when page loads
window.addEventListener("load", () => {
  observer.observe(document.body, {
    childList: true, // Watch for element additions
    subtree: true, // Search entire DOM
  });
});
