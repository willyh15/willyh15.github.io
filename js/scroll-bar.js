document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("typewriter");
  const text = el.getAttribute("data-text");
  let index = 0;

  const type = () => {
    if (index < text.length) {
      el.textContent += text.charAt(index);
      index++;
      setTimeout(type, 50); // typing speed
    }
  };

  el.textContent = ""; // Clear initial content
  type();
});