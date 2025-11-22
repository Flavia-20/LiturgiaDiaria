# Liturgia Diária — SPA (HTML/CSS/JS)

Aplicativo *estático* (Single Page Application) para leitura da *Liturgia Diária*, com **tema claro/escuro**, **narração por voz (TTS)** e *seleção de data* com navegação por seções.  
O app consome uma API pública hospedada no Railway para obter as leituras do dia.

> *Estilo:* README técnico para desenvolvedores (setup, estrutura, execução e deploy).

---

## ✨ Funcionalidades

- *Liturgia do dia* com paginação por seções (Ritos Iniciais, 1ª Leitura, Salmo, 2ª Leitura — se houver — Evangelho, Ritos Finais).
- *Seleção de data* (date picker) + botão *Buscar* para carregar a liturgia de outras datas.
- *Tema claro/escuro* (persistência em `localStorage`).
- *Cores litúrgicas dinâmicas* (verde, roxo, branco, vermelho, rosa, preto, marrom).
- *Narração por voz (TTS)* via *Web Speech API* (botão “🔊 Ouvir / Parar”).
- *Abas de navegação* entre páginas da liturgia, com contador e botões *Anterior/Próximo*.
- *View “Catequese”* com embeds de playlists do YouTube.
- *View “Configurações”* com troca de tema.
- *Layout responsivo* e foco em legibilidade.

---

## 🧱 Stack e arquitetura

- *Frontend:* HTML5, CSS3, JavaScript (vanilla)
- *Padrão:* Single Page Application (sem frameworks)
- *APIs externas:*
  - *Liturgia:* `https://liturgia.up.railway.app/v2/?date=YYYY-MM-DD`
  - *YouTube embeds* (somente para catequese)
- *Acessibilidade:* Web Speech API (SpeechSynthesis)

> *Não há Node/Java/Maven* — é um projeto 100% estático (pode ser servido por qualquer HTTP server).

---

## 📁 Estrutura do projeto

```
.
├─ index.html       # Estrutura das views (Liturgia, Catequese, Configurações)
├─ style.css        # Estilos, variáveis de tema, responsividade
├─ script.js        # Lógica da aplicação (fetch, paginação, TTS, tema, views)
└─ .gitattributes   # Normalização de final de linha para o Git
```

---

## ⚙️ Configuração e execução local

Como o app é estático, você pode rodar de várias formas:

### Opção A) VS Code — Live Server (recomendado)
1. Abra a pasta do projeto no VS Code.
2. Instale a extensão *Live Server* (Ritwick Dey).
3. Clique em *“Go Live”* no rodapé ou com botão direito em `index.html` → *Open with Live Server*.
4. Acesse a URL indicada (ex.: `http://127.0.0.1:5500`).

> *Observação:* A API de liturgia é HTTPS; servir o app por HTTP/HTTPS evita restrições de CORS/mixed-content entre navegadores.  
> Evite abrir o `index.html` direto pelo `file://` quando possível.

---

A aplicação envia a data no formato **YYYY-MM-DD (ISO)**.

> *Observação:* A chave `segundaLeitura` pode estar vazia (depende do dia).  
> Quebras de linha são tratadas e renderizadas como `<br>` no app.

---

## 🗣️ Narração por voz (TTS)

- Implementada via `window.speechSynthesis` (Web Speech API).
- A aplicação tenta escolher uma voz `pt-BR` (se não houver, usa `pt` ou a primeira disponível).
- Taxa e pitch são ajustados para leitura natural.
- O áudio *para automaticamente* quando o usuário muda de aba/página.

> Em navegadores que *não suportam* a API de TTS, o botão de áudio é ocultado.

---

## 🎨 Tema e cores litúrgicas

- Preferência de tema salva em `localStorage` (`light`/`dark`).
- Cores litúrgicas influenciam *bordas, botões e destaques*; há paletas distintas para cada tema.
- Variáveis CSS centralizam o tema (`:root`), facilitando customização.

---

## 🚀 Deploy (GitHub Pages)

1. Faça push do conteúdo para o branch `main` (ou `docs`).
2. No GitHub, acesse *Settings → Pages*.
3. Em *Source*, selecione **Deploy from a branch** e a pasta/branch que contém `index.html`.
4. Salve e aguarde a publicação.  
   A URL será `https://<seu-usuario>.github.io/<seu-repo>/`.

---

## 🧪 Testes manuais rápidos

- Alterne o *tema* em *Configurações* e recarregue — o app deve lembrar.
- Use o seletor de *data* para buscar outra liturgia.
- Clique em *🔊 Ouvir* em cada página para testar TTS.
- Navegue por *Abas* e botões *Anterior/Próximo*; o contador deve acompanhar.
- Acesse a *view Catequese* e verifique os embeds do YouTube.

---

## 🤝 Contribuição

1. Crie uma *issue* descrevendo a melhoria/bug.
2. Faça um *fork* do repositório.
3. Crie uma branch: `feat/minha-feature` ou `fix/meu-bug`.
4. Abra um *Pull Request* bem descritivo (inclua prints/gifs).

---

## 👤 Autor / Contato


- Tecnologias: HTML, CSS, JS vanilla  
- API: Railway — Liturgia v2 (data ISO)

---
