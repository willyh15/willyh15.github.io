import "/components/repo-card.js";

const filters = document.querySelectorAll("nav button");
const repoList = document.getElementById("repo-list");

let allRepos = [];

fetch("static/repos.json")
  .then((res) => res.json())
  .then((repos) => {
    allRepos = repos;
    renderRepos("All");
  });

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderRepos(btn.dataset.filter);
  });
});

function renderRepos(filter) {
  repoList.innerHTML = "";

  const filtered = allRepos.filter((repo) => {
    if (filter === "All") return true;
    return repo.topics && repo.topics.includes(filter.toLowerCase());
  });

  filtered.forEach((repo) => {
    const card = document.createElement("repo-card");
    card.data = repo;
    repoList.appendChild(card);
  });
}