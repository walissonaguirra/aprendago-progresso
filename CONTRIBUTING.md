# Contribuindo

Obrigado pelo interesse em contribuir com o **AprendaGo Progresso**! Este documento reúne tudo que você precisa para rodar o projeto localmente, entender a estrutura e enviar mudanças.

> Este é um projeto brasileiro voltado para o curso *Aprenda Go* (em pt-BR). Todos os commits, PRs, issues, comentários no código e documentação devem ser escritos em português brasileiro.

## Desenvolvimento

Pré-requisitos: [Node.js](https://nodejs.org/) e [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm watch:css   # reconstroi o CSS conforme você edita
```

Abra `index.html` diretamente no navegador ou sirva a pasta com qualquer servidor estático.

## Build de produção

```bash
pnpm build
```

Os artefatos minificados são gerados em `dist/` (`index.html`, `app.js`, `style.css`, `favicon.svg`).

## Estrutura

```
.
├── index.html          # entrada HTML (dev)
├── favicon.svg         # favicon com logo do Go
├── style.css           # fonte do Tailwind
├── js/
│   ├── app.js          # bootstrap e renderização da UI
│   ├── chapters.js     # dados do curso (módulos, capítulos, aulas)
│   ├── store.js        # persistência em localStorage
│   └── welcome.js      # modal de boas-vindas
├── rollup.config.js
└── tailwind.config.js
```

## Fluxo de contribuição

1. Abra uma issue descrevendo a mudança proposta (bug, melhoria, etc.) antes de começar trabalhos maiores.
2. Faça um fork do repositório e crie uma branch descritiva a partir de `main`.
3. Mantenha os commits pequenos e com mensagens claras em português brasileiro, seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) (ex.: `feat:`, `fix:`, `docs:`, `refactor:`).
4. Teste a aplicação localmente (`pnpm build` e abrindo o `dist/index.html`) antes de abrir o PR.
5. Envie o pull request com titulo descritivo e adicione um seção **Resumo** no corpo com as alteração no formato de lista.

Sugestões, correções e novas ideias são sempre bem-vindas!
