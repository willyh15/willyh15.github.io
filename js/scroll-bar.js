document.addEventListener('DOMContentLoaded', () => {
  const scrollBar = document.getElementById('scroll-bar');

  const updateScrollBar = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTop / docHeight) * 100;
    scrollBar.style.width = `${scrolled}%`;
  };

  window.addEventListener('scroll', updateScrollBar);
  window.addEventListener('resize', updateScrollBar);
  updateScrollBar(); // Initial run
});