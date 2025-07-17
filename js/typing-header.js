document.addEventListener("DOMContentLoaded", () => {
  const typewriter = document.getElementById("typewriter");
  const text = typewriter.getAttribute("data-text");
  let index = 0;

  function type() {
    if (index < text.length) {
      typewriter.textContent += text.charAt(index);
      index++;
      setTimeout(type, 50); // typing speed
    } else {
      blinkCursor();
    }
  }

  function blinkCursor() {
    typewriter.style.borderRight = "2px solid #58a6ff";
    setInterval(() => {
      typewriter.style.borderRight =
        typewriter.style.borderRight === "2px solid transparent"
          ? "2px solid #58a6ff"
          : "2px solid transparent";
    }, 600);
  }

  typewriter.textContent = "";
  type();
});