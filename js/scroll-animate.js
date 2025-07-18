document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target); // Trigger only once
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  document.querySelectorAll("section").forEach((section) => {
    observer.observe(section);
  });
});