const STORAGE_KEY = "aprendago_progress";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isCompleted(lessonId) {
  return !!load()[lessonId];
}

export function toggle(lessonId) {
  const data = load();
  if (data[lessonId]) {
    delete data[lessonId];
  } else {
    data[lessonId] = new Date().toISOString();
  }
  save(data);
  return !!data[lessonId];
}

export function isChapterComplete(lessons) {
  const data = load();
  return lessons.length > 0 && lessons.every((l) => !!data[l.id]);
}

export function getCompletions() {
  return load();
}
