// accordion behaviour (keep whatever you already had)
document.querySelectorAll(".click-title").forEach(title => {
  title.addEventListener("click", () => {
    title.parentElement.classList.toggle("open");
  });
});

// ---- highlight logic ----

const highlightColors = [
  "#CCFF00",
  "#23FB04",
  "#00F7F7",
  "#FF6F00",
  "#FF52FF",
  "#7DF9FF"
];

// choose one color for this page load
const highlightColor =
  highlightColors[Math.floor(Math.random() * highlightColors.length)];

function handleTextSelection() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return;

  const range = selection.getRangeAt(0);
  const text = range.toString();
  if (!text.trim()) {
    selection.removeAllRanges();
    return;
  }

  const span = document.createElement("span");
  span.classList.add("highlight-span");
  span.style.backgroundColor = highlightColor; // <— one fixed color

  try {
    range.surroundContents(span);
  } catch (e) {
    selection.removeAllRanges();
    return;
  }

  // put back the selected text into the span
  span.textContent = text;

  // clear native selection
  selection.removeAllRanges();

  // 1) set initial color (no animation yet)
  span.style.backgroundColor = highlightColor;

  // 2) in the next tick, change to transparent -> triggers 30s transition
  setTimeout(() => {
    span.style.backgroundColor = "transparent";
  }, 30); // ~one frame

  // 3) optional: after fade, unwrap span to clean DOM
  setTimeout(() => {
    if (span.parentNode) {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    }
  }, 10000); // 30s fade + 1s buffer
}

document.addEventListener("mouseup", handleTextSelection);
// for phones / touch devices
document.addEventListener("touchend", handleTextSelection);
document.addEventListener("pointerup", handleTextSelection);
