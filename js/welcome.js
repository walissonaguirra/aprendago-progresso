const STORAGE_KEY = "aprendago_welcome_seen";

const slides = [
  {
    title: "Bem-vindo ao Aprenda Go Progresso!",
    body: `
      <p class="mb-3 text-base">
        Este projeto foi desenvolvido para iniciantes no mundo do
        <strong>Go Lang</strong> e também para devs que estão migrando de outras linguagens.
      </p>
      <p class="text-base">
        Esta aplicação funciona como um <em>wrapper</em> (organizador) para acompanhar
        seu progresso no curso <strong><a href="https://youtube.com/@aprendago?si=63CbOJUcwxI5CR42" target="_blank" class="text-go-primary hover:underline">Aprenda Go</a></strong>, que foi criado e disponibilizado
        gratuitamente no YouTube pela <strong><a href="https://gotocph.com/2018/speakers/639/ellen-koerbes" target="_blank" class="text-go-primary hover:underline">Ellen Körbes</a></strong>.
      </p>`,
  },
  {
    title: "Totalmente Gratuito e Aberto",
    body: `
      <p class="mb-3 text-base">
        Este projeto é e sempre será gratuito. Todo o código-fonte está disponível no
        <strong><a href="https://codeberg.org/walissonaguirra/aprendago-progresso" target="_blank" class="text-go-primary hover:underline">Codeberg</a></strong> sob as licenças
        <strong><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pt-br" class="text-go-primary hover:underline">CC BY-NC-SA 4.0</a></strong>. Sugestões e contribuições para
        melhorar a plataforma são sempre bem-vindas!
      </p>`,
  },
  {
    title: "Obrigado, Ellen Körbes!",
    body: `
      <p class="mb-4 text-base">
        A comunidade Go agradece pela sua contribuição através deste
        curso. Este projeto é também uma homenagem ao seu trabalho.
      </p>
      <p class="text-base">
        <button type="button"
                class="text-go-primary underline hover:text-go-blue font-medium"
                data-welcome-ellen>
          Você é a Ellen Körbes? Clique aqui
        </button>
      </p>
      <div id="welcome-ellen-msg" class="hidden mt-4 border border-go-light bg-go-bg rounded-sm px-4 py-3 text-base text-gray-700">
        <p class="mb-2">
          Hey, Ellen! Criei este projeto como uma forma de retribuir e ajudar iniciantes
          na linguagem Go, inspirado pela sua iniciativa.
        </p>
        <p>
          Se, por qualquer motivo, você não estiver de acordo com esta aplicação, ou se
          tiver interesse em assumir a gestão do repositório, por favor, entre em
          contato comigo por e-mail <a href="mailto:walissonaguirra@proton.me" class="text-go-primary hover:underline">walissonaguirra@proton.me</a>. Terei o maior prazer em conversar!
        </p>
      </div>`,
  },
];

let currentStep = 0;
let root = null;
let previouslyFocused = null;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function hasSeen() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch { }
}

function renderDots() {
  return slides
    .map((_, i) => {
      const active = i === currentStep;
      return `<span aria-hidden="true" class="h-2 rounded-full transition-all duration-200 ${
        active ? "w-6 bg-go-primary" : "w-2 bg-gray-300"
      }"></span>`;
    })
    .join("");
}

function renderModal() {
  const slide = slides[currentStep];
  const isLast = currentStep === slides.length - 1;
  const isFirst = currentStep === 0;

  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center px-4"
         role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div class="absolute inset-0 bg-gray-900/60" data-welcome-backdrop></div>

      <div class="relative w-full max-w-lg bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Passo ${currentStep + 1} de ${slides.length}
          </span>
          <button type="button"
                  class="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500"
                  data-welcome-close
                  aria-label="Fechar boas-vindas">
            <svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="px-6 py-5 overflow-y-auto">
          <h2 id="welcome-title" class="text-xl font-bold text-gray-900 mb-3">
            ${slide.title}
          </h2>
          <div class="text-sm text-gray-700 leading-relaxed">
            ${slide.body}
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 shrink-0">
          <div class="flex items-center gap-1.5" aria-hidden="true">
            ${renderDots()}
          </div>
          <div class="flex items-center gap-2">
            <button type="button"
                    class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 ${isFirst ? "invisible" : ""}"
                    data-welcome-prev>
              Anterior
            </button>
            <button type="button"
                    class="px-4 py-2 text-sm font-medium text-white bg-go-primary hover:bg-go-primary/90 rounded transition-colors"
                    data-welcome-next>
              ${isLast ? "Começar" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>`;

  const focusTarget = root.querySelector("[data-welcome-next]");
  if (focusTarget) focusTarget.focus();
}

function close() {
  markSeen();
  document.removeEventListener("keydown", handleKeydown, true);
  root.innerHTML = "";
  root.classList.add("hidden");
  if (previouslyFocused && typeof previouslyFocused.focus === "function") {
    previouslyFocused.focus();
  }
}

function next() {
  if (currentStep < slides.length - 1) {
    currentStep++;
    renderModal();
  } else {
    close();
  }
}

function prev() {
  if (currentStep > 0) {
    currentStep--;
    renderModal();
  }
}

function trapFocus(e) {
  const focusables = root.querySelectorAll(FOCUSABLE);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function handleKeydown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    close();
    return;
  }
  if (e.key === "Tab") {
    trapFocus(e);
    return;
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    next();
    return;
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    prev();
  }
}

function handleClick(e) {
  if (e.target.closest("[data-welcome-next]")) {
    next();
    return;
  }
  if (e.target.closest("[data-welcome-prev]")) {
    prev();
    return;
  }
  if (e.target.closest("[data-welcome-close]") || e.target.closest("[data-welcome-backdrop]")) {
    close();
    return;
  }
  if (e.target.closest("[data-welcome-ellen]")) {
    const msg = document.getElementById("welcome-ellen-msg");
    if (msg) msg.classList.toggle("hidden");
  }
}

export function initWelcome({ force = false } = {}) {
  if (!force && hasSeen()) return;

  root = document.getElementById("welcome-root");
  if (!root) return;

  previouslyFocused = document.activeElement;
  currentStep = 0;
  root.classList.remove("hidden");
  root.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown, true);
  renderModal();
}
