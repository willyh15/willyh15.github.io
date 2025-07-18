document.addEventListener("scroll", () => {
  const scrollBar = document.getElementById("scroll-bar");
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollPercent = (scrollTop / scrollHeight) * 100;
  scrollBar.style.width = scrollPercent + "%";
});