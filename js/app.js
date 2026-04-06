import { toggle, getCompletions } from "./store.js";
import { modules } from "./chapters.js";

// Estado
let currentChapter = parseInt(localStorage.getItem("aprendago_chapter")) || 0;

function saveCurrentChapter(num) {
  currentChapter = num;
  localStorage.setItem("aprendago_chapter", num);
}

// Cache de elementos DOM
const DOM = {
  get sidebarProgress() { return document.getElementById("sidebar-progress"); },
  get sidebarBar() { return document.getElementById("sidebar-bar"); },
  get nav() { return document.getElementById("sidebar-nav"); },
  get main() { return document.getElementById("main"); },
  get videoContainer() { return document.getElementById("video-container"); },
};

// Ícones SVG
const ICONS = {
  lock: '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
  check: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  play: '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
};

// Helpers de dados
function findChapter(num) {
  for (const mod of modules) {
    for (const ch of mod.chapters) {
      if (ch.number === num) return ch;
    }
  }
  return null;
}

function computeProgress() {
  const completions = getCompletions();
  let totalAll = 0;
  let doneAll = 0;

  for (const mod of modules) {
    for (const ch of mod.chapters) {
      ch.unlocked = isChapterUnlocked(ch, mod, completions);

      let chDone = 0;
      for (const l of ch.lessons) {
        l.completed = !!completions[l.id];
        if (l.completed) chDone++;
      }

      ch.done = chDone;
      ch.total = ch.lessons.length;
      ch.pct = ch.total > 0 ? Math.round((chDone / ch.total) * 100) : 0;
      totalAll += ch.total;
      doneAll += chDone;
    }
  }

  return {
    total: totalAll,
    done: doneAll,
    pct: totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0,
  };
}

function isChapterUnlocked(chapter, mod, completions) {
  const requiredChapterNum = mod.exerciseRequirements[chapter.number];
  if (requiredChapterNum === undefined) return true;

  const requiredChapter = findChapter(requiredChapterNum);
  if (!requiredChapter) return false;

  return requiredChapter.lessons.every((l) => !!completions[l.id]);
}

// Sidebar
function renderSidebar(stats) {
  updateSidebarProgress(stats);
  updateSidebarNav();
}

function updateSidebarProgress(stats) {
  DOM.sidebarProgress.textContent = `${stats.done}/${stats.total} (${stats.pct}%)`;
  DOM.sidebarBar.style.width = stats.pct + "%";
}

function updateSidebarNav() {
  DOM.nav.innerHTML = modules.map(renderSidebarModule).join("");
}

function renderSidebarModule(mod) {
  const chaptersHtml = mod.chapters.map(renderSidebarChapter).join("");
  return `
    <div class="px-3 mb-1">
      <div class="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
        ${mod.name}
      </div>
      ${chaptersHtml}
    </div>`;
}

function renderSidebarChapter(ch) {
  const isActive = ch.number === currentChapter;
  const isComplete = ch.done === ch.total;

  const itemClass = isActive
    ? "bg-go-primary/10 text-go-primary font-medium border-l-[3px] border-go-primary -ml-px"
    : !ch.unlocked
      ? "opacity-40 cursor-not-allowed text-gray-500"
      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900";

  const badgeClass = isComplete ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500";
  const badgeContent = !ch.unlocked ? ICONS.lock : ch.number;

  return `
    <div class="flex items-center gap-2.5 px-3 py-2 rounded-sm cursor-pointer text-[13px] transition-all duration-200 ${itemClass}"
         data-chapter="${ch.number}">
      <span class="w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold shrink-0 ${badgeClass}">
        ${badgeContent}
      </span>
      <span class="truncate">${ch.title}</span>
      <span class="w-8 text-xs text-right ml-auto shrink-0 text-gray-500">${ch.pct}%</span>
    </div>`;
}

function renderChapter(chapter) {
  if (!chapter.unlocked) {
    DOM.main.innerHTML = renderLockedChapter(chapter);
    return;
  }
  DOM.main.innerHTML = renderUnlockedChapter(chapter);
}

function renderLockedChapter(chapter) {
  return `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <svg class="w-16 h-16 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <h3 class="text-lg text-gray-500 mb-2">Cap. ${chapter.number} - ${chapter.title}</h3>
      <p class="text-sm text-gray-500">
        Complete todas as aulas do capítulo ${chapter.requiredBy} para desbloquear estes exercícios.
      </p>
    </div>`;
}

function renderUnlockedChapter(chapter) {
  const lessonsHtml = chapter.lessons.map(renderLesson).join("");

  return `
    <div class="mb-8">
      <h2 class="text-2xl font-bold">Cap. ${chapter.number} - ${chapter.title}</h2>
      <div class="text-sm text-gray-500 mt-1" id="chapter-progress-text">
        ${chapter.done} de ${chapter.total} aulas completas (${chapter.pct}%)
      </div>
    </div>
    <div id="video-container"></div>
    <div class="h-1 bg-gray-200 rounded overflow-hidden mb-6">
      <div class="h-full bg-go-blue rounded transition-all duration-300" id="chapter-progress-bar" style="width:${chapter.pct}%"></div>
    </div>
    <div class="flex flex-col gap-1.5 mb-8" id="lessons-list">
      ${lessonsHtml}
    </div>`;
}

function renderLesson(lesson) {
  const borderClass = lesson.completed
    ? "border-green-600 bg-green-50"
    : "border-gray-200 bg-white hover:border-go-blue";

  const checkClass = lesson.completed
    ? "border-green-600 bg-green-600 text-white"
    : "border-gray-300";

  return `
    <div class="flex items-center gap-3.5 px-4 py-3.5 border rounded transition-all duration-200 cursor-pointer ${borderClass}"
         data-lesson-id="${lesson.id}">
      <div class="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 ${checkClass}"
           data-toggle="${lesson.id}">
        ${lesson.completed ? ICONS.check : ""}
      </div>
      <div class="flex-1 min-w-0" data-toggle="${lesson.id}">
        <div class="text-xs text-gray-500">Aula ${lesson.lessonNumber}</div>
        <div class="text-sm font-medium truncate">${lesson.title}</div>
      </div>
      <button class="w-9 h-9 rounded bg-go-primary text-white flex items-center justify-center shrink-0 hover:bg-go-primary/80 transition-colors"
              data-watch="${lesson.youtubeId}" title="Assistir">
        ${ICONS.play}
      </button>
    </div>`;
}

function updateLessonUI(lessonId, lesson) {
  const lessonEl = DOM.main.querySelector(`[data-lesson-id="${lessonId}"]`);
  if (!lessonEl) return;

  if (lesson.completed) {
    lessonEl.classList.remove("border-gray-200", "bg-white", "hover:border-go-blue");
    lessonEl.classList.add("border-green-600", "bg-green-50");
  } else {
    lessonEl.classList.remove("border-green-600", "bg-green-50");
    lessonEl.classList.add("border-gray-200", "bg-white", "hover:border-go-blue");
  }

  const checkEl = lessonEl.querySelector(`[data-toggle="${lessonId}"]`);
  if (checkEl) {
    if (lesson.completed) {
      checkEl.classList.remove("border-gray-300");
      checkEl.classList.add("border-green-600", "bg-green-600", "text-white");
      checkEl.innerHTML = ICONS.check;
    } else {
      checkEl.classList.remove("border-green-600", "bg-green-600", "text-white");
      checkEl.classList.add("border-gray-300");
      checkEl.innerHTML = "";
    }
  }
}

function updateChapterProgress(chapter) {
  const textEl = document.getElementById("chapter-progress-text");
  const barEl = document.getElementById("chapter-progress-bar");
  if (textEl) textEl.textContent = `${chapter.done} de ${chapter.total} aulas completas (${chapter.pct}%)`;
  if (barEl) barEl.style.width = chapter.pct + "%";
}

// Player de vídeo
function openVideoPlayer(youtubeId) {
  const container = document.getElementById("video-container");
  if (!container) return;

  container.innerHTML = `
    <div class="mb-6">
      <div class="relative bg-black rounded overflow-hidden" style="padding-top:56.25%">
        <iframe class="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>
      </div>
      <button class="mt-2 px-3 py-1.5 text-xs text-white bg-go-primary hover:bg-go-primary/80 rounded-sm transition-colors"
              id="close-player">Fechar player</button>
    </div>`;

  document.getElementById("close-player").onclick = () => {
    container.innerHTML = "";
  };
}

function handleSidebarClick(e) {
  const el = e.target.closest("[data-chapter]");
  if (!el) return;

  const num = parseInt(el.dataset.chapter);
  const ch = findChapter(num);
  if (!ch || !ch.unlocked) return;

  saveCurrentChapter(num);

  const stats = computeProgress();
  updateSidebarProgress(stats);
  updateSidebarNav();
  renderChapter(ch);
}

function handleChapterClick(e) {
  const toggleEl = e.target.closest("[data-toggle]");
  if (toggleEl) {
    const lessonId = toggleEl.dataset.toggle;
    toggle(lessonId);

    const stats = computeProgress();
    const chapter = findChapter(currentChapter);
    const lesson = chapter?.lessons.find((l) => l.id === lessonId);

    if (lesson) updateLessonUI(lessonId, lesson);
    if (chapter) updateChapterProgress(chapter);

    updateSidebarProgress(stats);
    updateSidebarNav();
    return;
  }

  const watchEl = e.target.closest("[data-watch]");
  if (watchEl) {
    e.stopPropagation();
    openVideoPlayer(watchEl.dataset.watch);
  }
}

function initEventListeners() {
  DOM.nav.addEventListener("click", handleSidebarClick);
  DOM.main.addEventListener("click", handleChapterClick);
}

function selectInitialChapter() {
  if (currentChapter > 0) {
    const saved = findChapter(currentChapter);
    if (saved && saved.unlocked) return;
  }

  for (const mod of modules) {
    for (const ch of mod.chapters) {
      if (ch.unlocked) {
        saveCurrentChapter(ch.number);
        return;
      }
    }
  }
}

function render() {
  const stats = computeProgress();
  const chapter = findChapter(currentChapter);

  renderSidebar(stats);
  if (chapter) renderChapter(chapter);
}

// Inicialização
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => { });
}

computeProgress();
selectInitialChapter();
render();
initEventListeners();