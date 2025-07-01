// ==================== FULLSCREEN DETECTION SYSTEM ====================
let isFullscreen = false;
let tagOverlay = null;
let originalTags = null;
let originalTagsParent = null;
let originalTagsNextSibling = null;
let isTagOverlayOpen = false;

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

function initFullscreenDetection() {
  const handleFullscreenChange = () => {
    const wasFullscreen = isFullscreen;
    isFullscreen = !!getFullscreenElement();

    if (wasFullscreen && !isFullscreen && isTagOverlayOpen) {
      closeTagOverlay();
    }

    if (tagFeedbackContainer) {
      if (isFullscreen) {
        const fullscreenElement = getFullscreenElement();
        if (fullscreenElement) {
          fullscreenElement.appendChild(tagFeedbackContainer);
        }
      } else {
        document.body.appendChild(tagFeedbackContainer);
      }
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);
}

// ==================== TAG OVERLAY SYSTEM ====================
function createTagOverlay() {
  if (tagOverlay) {
    tagOverlay.remove();
    tagOverlay = null;
  }

  tagOverlay = document.createElement("div");
  tagOverlay.className = "tag-overlay";
  tagOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 2147483647;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  if (isFullscreen) {
    const fullscreenElement = getFullscreenElement();
    if (fullscreenElement) {
      fullscreenElement.appendChild(tagOverlay);
    } else {
      document.body.appendChild(tagOverlay);
    }
  } else {
    document.body.appendChild(tagOverlay);
  }

  return tagOverlay;
}

function showTagOverlay() {
  if (isTagOverlayOpen) return;

  const overlay = createTagOverlay();
  originalTags = document.querySelector(".location-preview__tags");

  if (!originalTags) return;

  const container = document.createElement("div");
  container.className = "tag-overlay-container";
  container.style.cssText = `
    position: relative;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    background: #1a1a1a;
    border-radius: 12px;
    padding: 20px;
    overflow: auto;
    z-index: 2147483647;
    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.7);
    border: 1px solid #444;
  `;

  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.className = "tag-overlay-close";
  closeButton.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: white;
    z-index: 10;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  `;

  closeButton.addEventListener("mouseenter", () => {
    closeButton.style.background = "rgba(255, 255, 255, 0.1)";
  });

  closeButton.addEventListener("mouseleave", () => {
    closeButton.style.background = "none";
  });

  container.appendChild(closeButton);

  originalTagsParent = originalTags.parentNode;
  originalTagsNextSibling = originalTags.nextSibling;

  container.appendChild(originalTags);
  overlay.appendChild(container);

  originalTags.classList.add("tag-overlay-content");

  setTimeout(() => {
    const input = originalTags.querySelector(".form-add-tag__input");
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);

  const closeOverlay = () => {
    closeTagOverlay();
  };

  closeButton.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeOverlay();
    }
  };
  document.addEventListener("keydown", handleEscape);

  overlay._escapeHandler = handleEscape;

  isTagOverlayOpen = true;

  return overlay;
}

function restoreOriginalTags() {
  if (originalTags && originalTagsParent) {
    originalTags.classList.remove("tag-overlay-content");

    if (originalTagsNextSibling) {
      originalTagsParent.insertBefore(originalTags, originalTagsNextSibling);
    } else {
      originalTagsParent.appendChild(originalTags);
    }
  }
}

function closeTagOverlay() {
  if (isTagOverlayOpen) {
    if (tagOverlay && tagOverlay._escapeHandler) {
      document.removeEventListener("keydown", tagOverlay._escapeHandler);
    }

    restoreOriginalTags();

    if (tagOverlay) {
      tagOverlay.remove();
      tagOverlay = null;
    }

    isTagOverlayOpen = false;
  }
}

function toggleTagOverlay() {
  if (isTagOverlayOpen) {
    closeTagOverlay();
  } else {
    showTagOverlay();
  }
}

function focusTagInput() {
  if (isFullscreen) {
    toggleTagOverlay();
    return;
  }

  if (isTagOverlayOpen) {
    closeTagOverlay();
    return;
  }

  const input = document.querySelector(".form-add-tag__input");
  if (input && input.offsetParent !== null) {
    input.focus();

    input.classList.add("input-focused");

    setTimeout(() => {
      input.classList.remove("input-focused");
    }, 1000);
  } else {
    showTagOverlay();
  }
}

// ==================== TAG FEEDBACK SYSTEM ====================
let tagFeedbackContainer = null;

function createTagFeedbackContainer() {
  if (tagFeedbackContainer) return tagFeedbackContainer;

  tagFeedbackContainer = document.createElement("div");
  tagFeedbackContainer.id = "tag-feedback-container";
  tagFeedbackContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    z-index: 2147483647;
    max-width: 300px;
    pointer-events: none;
  `;

  document.body.appendChild(tagFeedbackContainer);

  return tagFeedbackContainer;
}

function showTagFeedback(tagName, bgColor, textColor) {
  const container = createTagFeedbackContainer();

  if (isFullscreen) {
    const fullscreenElement = getFullscreenElement();
    if (
      fullscreenElement &&
      tagFeedbackContainer.parentNode !== fullscreenElement
    ) {
      fullscreenElement.appendChild(tagFeedbackContainer);
    }
  }

  const feedback = document.createElement("div");
  feedback.className = "tag-feedback";
  feedback.style.cssText = `
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    animation: fadeIn 0.3s ease-out, fadeOut 0.3s ease-out 1.7s;
    opacity: 1;
    transform: translateY(0);
  `;

  feedback.style.backgroundColor = bgColor;
  feedback.style.color = textColor;

  feedback.innerHTML = `
    <span style="margin-right: 10px; font-size: 18px;">✓</span>
    Added tag: ${tagName}
  `;

  container.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 2000);
}

// ==================== TAG SHORTCUT SYSTEM ====================
function getTagButtons() {
  if (tagOverlay && isTagOverlayOpen) {
    const overlayButtons = tagOverlay.querySelectorAll(".tag__button--add");
    if (overlayButtons.length > 0) return overlayButtons;
  }

  const mainButtons = document.querySelectorAll(".tag__button--add");
  if (mainButtons.length > 0) return mainButtons;

  return null;
}

function addTagWithShortcut(index) {
  const buttons = getTagButtons();
  if (!buttons) return;

  const buttonIndex = index - 1;

  if (buttonIndex >= 0 && buttonIndex < buttons.length) {
    const button = buttons[buttonIndex];
    const tagName =
      button.getAttribute("data-tag-name") ||
      button.parentElement.querySelector(".tag__text").textContent;

    const tagElement = button.closest(".tag");
    const bgColor = tagElement
      ? tagElement.style.backgroundColor
      : "rgb(100, 100, 100)";
    const textColor = tagElement
      ? tagElement.style.color
      : "rgb(255, 255, 255)";

    button.classList.add("tag-shortcut-active");
    setTimeout(() => {
      button.classList.remove("tag-shortcut-active");
    }, 300);

    button.click();

    if (isFullscreen) {
      showTagFeedback(tagName, bgColor, textColor);
    }
  }
}

// ==================== MAIN INITIALIZATION ====================
function init() {
  initFullscreenDetection();

  createTagFeedbackContainer();

  document.addEventListener("keydown", function (event) {
    // Only prevent default for number keys when not in an input field
    const isInputField =
      event.target.tagName === "INPUT" ||
      event.target.tagName === "TEXTAREA" ||
      event.target.isContentEditable;

    if (event.ctrlKey && event.code === "Space") {
      focusTagInput();
      event.preventDefault();
    }

    if (event.key === "Escape" && isTagOverlayOpen) {
      closeTagOverlay();
    }

    if (
      !isInputField &&
      ((event.code >= "Digit1" && event.code <= "Digit9") ||
        (event.code >= "Numpad1" && event.code <= "Numpad9"))
    ) {
      const tagNumber = parseInt(event.code.replace(/\D/g, ""));
      addTagWithShortcut(tagNumber);
      event.preventDefault();
    }
  });
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
