// js/scroll-bar.js

document.addEventListener("DOMContentLoaded", () => {
  const scrollBar = document.getElementById("scroll-bar");

  function updateScrollBar() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollBar.style.width = `${scrollPercent}%`;
  }

  window.addEventListener("scroll", updateScrollBar);
  updateScrollBar(); // trigger on load
});