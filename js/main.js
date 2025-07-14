// js/main.js

document.addEventListener("DOMContentLoaded", () => {
  const repoList = document.getElementById("repo-list");
  const buttons = document.querySelectorAll("nav button");

  async function fetchRepos() {
    const res = await fetch("https://api.github.com/users/willyh15/repos?per_page=100&sort=updated");
    const repos = await res.json();

    repos.forEach(repo => {
      const card = document.createElement("repo-card");
      card.repo = repo;
      card.dataset.tags = repo.topics ? repo.topics.join(',') : '';
      repoList.appendChild(card);
    });
  }

  function filterRepos(tag) {
    const allCards = repoList.querySelectorAll("repo-card");
    allCards.forEach(card => {
      if (tag === "All" || card.dataset.tags.includes(tag)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const tag = button.getAttribute("data-filter");
      filterRepos(tag);
    });
  });

  fetchRepos();
});