"use strict";

const models = [
  { id: "claudefable5.2", name: "Claude Fable 5.2", logo: "claude" },
  { id: "deepseekv4.1flash1017", name: "DeepSeek V4.1 Flash 1017", logo: "deepseek" },
  { id: "gemini4neon", name: "Gemini 4 Neon", logo: "gemini" },
  { id: "glm5.4", name: "GLM-5.4", logo: "glm" },
  { id: "gpt6.2astra", name: "GPT-6.2 Astra", logo: "openai" },
  { id: "Hy4", name: "Hy4", logo: "hunyuan" },
  { id: "kimik3.1pro", name: "Kimi K3.1 Pro", logo: "kimi" },
  { id: "qwen4max", name: "Qwen4-Max", logo: "qwen" }
];
const tasks = {
  pelican: { title: "鹈鹕骑自行车", file: "pelican-bicycle.html" },
  trex: { title: "霸王龙三步上篮", file: "trex-layup.html" }
};
const menu = document.getElementById("model-menu");
const trigger = document.getElementById("model-button");
const nameLabel = document.getElementById("model-name");
const frame = document.getElementById("work");
const taskInputs = Array.from(document.querySelectorAll('input[name="task"]'));
const params = new URLSearchParams(location.search);
let task = params.get("task") === "trex" ? "trex" : "pelican";
let model = params.get("model") || models[0].id;

function choices() {
  if (task === "pelican") return models;
  return models.flatMap((entry) => entry.id === "glm5.4" ? [
    { ...entry, name: "GLM-5.4 → GLM-5.3 Flash", menuLabel: "GLM-5.4 → GLM-5.3 Flash（接力）" },
    { id: "glm-draft", name: "GLM-5.4（中间稿）", logo: "glm", dir: "glm5.4", file: "trex-layup-1.html" }
  ] : [entry]);
}

function icon(entry) {
  const img = document.createElement("img");
  img.src = `media/brands/${entry.logo}.png`;
  img.width = 20;
  img.height = 20;
  img.alt = "";
  return img;
}

function closeMenu(restoreFocus = false) {
  menu.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  if (restoreFocus) trigger.focus();
}

function showWork() {
  const selected = choices().find((entry) => entry.id === model) || models[0];
  model = selected.id;
  nameLabel.textContent = selected.name;
  trigger.setAttribute("aria-label", `选择模型，当前 ${selected.name}`);
  trigger.querySelector("img").src = icon(selected).src;

  const { title, file } = tasks[task];
  const source = `demos/${selected.dir || model}/${selected.file || file}`;
  frame.title = `${selected.name} · ${title}`;
  if (frame.getAttribute("src") !== source) frame.src = source;
  if (location.protocol === "https:" || location.protocol === "http:") {
    const url = new URL(location.href);
    url.searchParams.set("task", task);
    url.searchParams.set("model", model);
    history.replaceState(null, "", url);
  }
}

function openMenu(focusLast = false) {
  const options = choices().map((entry) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "model-option";
    option.setAttribute("role", "menuitemradio");
    option.setAttribute("aria-checked", String(entry.id === model));
    option.tabIndex = -1;
    const label = document.createElement("span");
    label.textContent = entry.menuLabel || entry.name;
    option.append(icon(entry), label);
    if (entry.id === model) {
      const mark = document.createElement("span");
      mark.className = "selected-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "✓";
      option.append(mark);
    }
    option.addEventListener("click", () => {
      model = entry.id;
      showWork();
      closeMenu(true);
    });
    return option;
  });
  menu.replaceChildren(...options);
  menu.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  const focused = focusLast ? options.at(-1) : options.find((option) => option.getAttribute("aria-checked") === "true");
  (focused || options[0]).focus();
}

trigger.addEventListener("click", () => {
  if (menu.hidden) openMenu();
  else closeMenu();
});
trigger.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  openMenu(event.key === "ArrowUp");
});
menu.addEventListener("keydown", (event) => {
  if (event.key === "Escape" || event.key === "Tab") {
    if (event.key === "Escape") event.preventDefault();
    closeMenu(true);
    return;
  }
  const options = Array.from(menu.querySelectorAll("button"));
  const index = options.indexOf(document.activeElement);
  let next = index;
  if (event.key === "Home") next = 0;
  else if (event.key === "End") next = options.length - 1;
  else if (event.key === "ArrowDown") next = (index + 1) % options.length;
  else if (event.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
  else return;
  event.preventDefault();
  options[next].focus();
});
document.addEventListener("pointerdown", (event) => {
  if (!menu.hidden && !event.target.closest(".model-picker")) closeMenu();
});
window.addEventListener("blur", () => {
  if (!menu.hidden && document.activeElement === frame) closeMenu();
});

for (const input of taskInputs) {
  input.checked = task === input.value;
  input.addEventListener("change", () => {
    task = input.value;
    if (task === "pelican" && model === "glm-draft") model = "glm5.4";
    closeMenu();
    showWork();
  });
}
showWork();
