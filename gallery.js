"use strict";

const screens = Array.from(document.querySelectorAll(".screen"));
const viewer = document.querySelector(".viewer");
const statusLine = document.getElementById("viewer-status");
const layoutToggle = document.getElementById("layout-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let selectedTask = "pelican";
let twoScreens = true;

function choiceList() {
  return models.flatMap((model) => {
    if (model.id !== "glm5.4" || selectedTask === "pelican") {
      return [[model.id, model.name]];
    }
    return [
      [model.id, "GLM-5.4 → 5.3 Flash · 接力成品"],
      ["glm-draft", "GLM-5.4 · 中间稿"]
    ];
  });
}

function setOptions(select, preferred) {
  const options = choiceList();
  select.replaceChildren(...options.map(([value, label]) => new Option(label, value)));
  select.value = options.some(([value]) => value === preferred) ? preferred : "glm5.4";
}

function showWork(screen, replay = false) {
  const selectedModel = screen.querySelector("select").value;
  const isDraft = selectedModel === "glm-draft";
  const model = models.find(({ id }) => id === (isDraft ? "glm5.4" : selectedModel));
  const task = tasks[selectedTask];
  const file = isDraft ? "trex-layup-1.html" : task.file;
  const source = `demos/${model.id}/${file}`;
  const workLabel = choiceList().find(([value]) => value === selectedModel)[1];
  const stage = screen.querySelector(".stage");
  const original = screen.querySelector(".original");
  const replayButton = screen.querySelector(".replay");
  const info = screen.querySelector(".model-config");
  const time = model.time[selectedTask === "pelican" ? 0 : 1];

  original.href = source;
  original.setAttribute("aria-label", `打开 ${workLabel} 的原始作品`);
  info.textContent = isDraft ? `${model.setup} · 接力前版本` : `${model.setup} · ${time}`;

  function play() {
    const frame = document.createElement("iframe");
    frame.title = `${task.title}，${workLabel}`;
    frame.setAttribute("sandbox", "allow-scripts allow-downloads");
    frame.src = source;
    stage.replaceChildren(frame);
    const action = reducedMotion.matches ? "已显示" : "播放";
    statusLine.textContent = `${action} ${frame.title}`;
    replayButton.textContent = reducedMotion.matches ? "重新载入" : "重播";
  }

  if (reducedMotion.matches && !replay) {
    const poster = document.createElement("button");
    poster.type = "button";
    poster.className = "play-poster";
    poster.textContent = `显示 ${workLabel} 的作品`;
    poster.addEventListener("click", play, { once: true });
    stage.replaceChildren(poster);
    replayButton.textContent = "加载动画";
    return;
  }
  play();
}

function setTask(id) {
  if (id === selectedTask) return;
  selectedTask = id;
  document.querySelector(`input[name="task"][value="${id}"]`).checked = true;
  for (const screen of screens) {
    const select = screen.querySelector("select");
    setOptions(select, select.value);
    if (!screen.hidden) showWork(screen);
  }
}

for (const [index, screen] of screens.entries()) {
  const select = screen.querySelector("select");
  setOptions(select, index === 0 ? "claudefable5.2" : "gpt6.2astra");
  select.addEventListener("change", () => showWork(screen));
  screen.querySelector(".replay").addEventListener("click", () => showWork(screen, true));
  showWork(screen);
}

for (const input of document.querySelectorAll('input[name="task"]')) {
  input.addEventListener("change", () => setTask(input.value));
}
for (const link of document.querySelectorAll("[data-pick-task]")) {
  link.addEventListener("click", () => setTask(link.dataset.pickTask));
}

layoutToggle.addEventListener("click", () => {
  twoScreens = !twoScreens;
  layoutToggle.setAttribute("aria-pressed", String(twoScreens));
  layoutToggle.textContent = twoScreens ? "切换为单屏" : "开启并排";
  viewer.classList.toggle("single", !twoScreens);
  screens[1].hidden = !twoScreens;
  if (twoScreens) {
    showWork(screens[1]);
  } else {
    screens[1].querySelector(".stage").replaceChildren();
  }
});

reducedMotion.addEventListener("change", () => {
  for (const screen of screens) if (!screen.hidden) showWork(screen);
});

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("arrived");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -28px 0px" });
  for (const item of document.querySelectorAll(".hero-copy > *, .film, .section-head > *, .prompts figure, .observations h3, .observations p, .observations figure")) {
    observer.observe(item);
  }
}
