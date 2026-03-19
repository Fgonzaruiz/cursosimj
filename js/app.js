/* ═══════════════════════════════════════════════
   SIMJ IA GUIDE — App Logic
   app.js · v1.0 · 2026
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════
     1. COPY BUTTONS — prompt blocks & code
  ══════════════════════════════════════════ */
  function initCopyButtons() {
    document.querySelectorAll('.js-copy').forEach(btn => {
      btn.addEventListener('click', function () {
        const container = this.closest('.prompt-block, .code-block');
        if (!container) return;

        const body = container.querySelector(
          '.prompt-block__body, .code-block__body, pre'
        );
        if (!body) return;

        copyText(body.innerText.trim(), this);
      });
    });
  }

  /* ══════════════════════════════════════════
     2. COPY MEGA PROMPTS
  ══════════════════════════════════════════ */
  function initMegaCopyButtons() {
    document.querySelectorAll('.js-copy-mega').forEach(btn => {
      btn.addEventListener('click', function () {
        const targetId = this.dataset.target;
        const el = document.getElementById(targetId);
        if (!el) return;

        copyText(el.innerText.trim(), this);

        if (window.animateCopyFlash) window.animateCopyFlash(this);
      });
    });
  }

  /* ══════════════════════════════════════════
     3. INDUSTRY CARD COPY
  ══════════════════════════════════════════ */
  function initICardCopy() {
    document.querySelectorAll('.js-icard-copy').forEach(btn => {
      btn.addEventListener('click', function () {
        const card = this.closest('.icard');
        if (!card) return;
        const body = card.querySelector('.icard__body');
        if (!body) return;
        copyText(body.innerText.trim(), this);
      });
    });
  }

  /* ── Shared copy helper ── */
  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = '✓ Copiado';
      btn.classList.add('is-copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('is-copied');
      }, 2200);
    }).catch(() => {
      /* Fallback for older browsers */
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);

      const original = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = original; }, 1800);
    });
  }

  /* ══════════════════════════════════════════
     4. INDUSTRY TABS
  ══════════════════════════════════════════ */
  function initIndustryTabs() {
    const tabs   = document.querySelectorAll('.js-itab');
    const panels = document.querySelectorAll('.ipanel');

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        const targetId = this.dataset.panel;

        /* Deactivate all */
        tabs.forEach(t => {
          t.classList.remove('itab--active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => {
          p.classList.remove('ipanel--active');
        });

        /* Activate target */
        this.classList.add('itab--active');
        this.setAttribute('aria-selected', 'true');

        const panel = document.getElementById(targetId);
        if (panel) {
          panel.classList.add('ipanel--active');
          if (window.animateTabSwitch) window.animateTabSwitch(panel);
        }
      });
    });
  }

  /* ══════════════════════════════════════════
     5. CHECKLIST
  ══════════════════════════════════════════ */
  function initChecklist() {
    const items = document.querySelectorAll('.js-check');

    items.forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const isChecked = this.classList.toggle('is-checked');
        const box = this.querySelector('.check-item__box');

        if (window.animateCheckTick) window.animateCheckTick(box, isChecked);

        /* Persist in sessionStorage */
        const idx = Array.from(items).indexOf(this);
        const key = `simj-check-${idx}`;
        if (isChecked) sessionStorage.setItem(key, '1');
        else sessionStorage.removeItem(key);
      });

      /* Restore state */
      const idx = Array.from(items).indexOf(item);
      if (sessionStorage.getItem(`simj-check-${idx}`)) {
        item.classList.add('is-checked');
      }
    });
  }

  /* ══════════════════════════════════════════
     6. ERROR CARDS
  ══════════════════════════════════════════ */
  function initErrorCards() {
    document.querySelectorAll('.js-error-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const fix = this.nextElementSibling;
        if (!fix) return;

        const isHidden = fix.hidden;

        if (isHidden) {
          /* Open */
          fix.hidden = false;
          fix.style.height = '0';
          fix.style.overflow = 'hidden';
          fix.style.opacity = '0';

          const h = fix.scrollHeight;
          if (window.animateErrorFix) {
            window.animateErrorFix(fix, true);
          } else {
            fix.style.height = h + 'px';
            fix.style.opacity = '1';
          }

          this.textContent = '▼ Ocultar fix';
        } else {
          /* Close */
          if (window.animateErrorFix) {
            window.animateErrorFix(fix, false);
            /* animateErrorFix sets fix.hidden = true on complete */
          } else {
            fix.hidden = true;
          }
          this.textContent = '▶ Ver fix';
        }
      });
    });
  }

  /* ══════════════════════════════════════════
     7. PROMPT DEBUGGER
  ══════════════════════════════════════════ */
  const DB_COMPONENTS = [
    {
      key: 'role',
      label: 'Rol / Contexto empresa',
      pattern: /eres|somos|empresa|simj|proyecto|producto|servicio/i,
    },
    {
      key: 'task',
      label: 'Tarea específica',
      pattern: /escribe|redacta|analiza|genera|revisa|clasifica|resume|diseña|crea/i,
    },
    {
      key: 'format',
      label: 'Formato de salida',
      pattern: /formato|tabla|json|bullet|lista|email|máximo|palabras|párrafo|sección/i,
    },
    {
      key: 'constraints',
      label: 'Restricciones explícitas',
      pattern: /sin |no |nunca |máximo |mínimo |solo |ignora |evita /i,
    },
    {
      key: 'uncertainty',
      label: 'Uncertainty Permission',
      pattern: /si no (sabes|tienes|hay|está)|no disponible|n\/d|insuficiente|necesito ver/i,
      optional: true,
    },
    {
      key: 'examples',
      label: 'Ejemplos (few-shot)',
      pattern: /ejemplo|✅|❌|bien:|mal:/i,
      optional: true,
    },
    {
      key: 'xml',
      label: 'XML tags (Claude)',
      pattern: /<[a-z_]+>/i,
      optional: true,
    },
  ];

  function analyzePrompt(text) {
    const results = DB_COMPONENTS.map(c => ({
      ...c,
      present: c.pattern.test(text),
    }));

    const required = results.filter(r => !r.optional);
    const score = Math.round(
      (required.filter(r => r.present).length / required.length) * 10
    );

    const issues = [];

    if (!results.find(r => r.key === 'role').present) {
      issues.push({
        type: 'crit',
        icon: '🎭',
        text: '<strong>Sin rol o contexto de empresa:</strong> Añade quién eres y qué hace SiMJ antes de la tarea.',
      });
    }
    if (!results.find(r => r.key === 'format').present) {
      issues.push({
        type: 'crit',
        icon: '📐',
        text: '<strong>Sin formato de salida:</strong> Especifica: email, bullets, tabla, longitud máxima.',
      });
    }
    if (!results.find(r => r.key === 'uncertainty').present) {
      issues.push({
        type: 'warn',
        icon: '🧢',
        text: '<strong>Sin permiso de incertidumbre:</strong> Añade "Si el dato no está disponible, escríbelo."',
      });
    }
    if (!results.find(r => r.key === 'constraints').present) {
      issues.push({
        type: 'warn',
        icon: '🔒',
        text: '<strong>Sin restricciones:</strong> Define qué NO debe hacer el modelo.',
      });
    }
    if (text.length < 80) {
      issues.push({
        type: 'warn',
        icon: '📝',
        text: '<strong>Prompt muy corto:</strong> Menos de 80 caracteres suele ser demasiado vago. Añade contexto.',
      });
    }

    const isCode = /laravel|php|mysql|función|clase|controller|model|migration|test/i.test(text);
    const len = text.length;

    let tier;
    if (len > 600 || /<[a-z_]+>/i.test(text)) {
      tier = 'Claude Opus 4.6 / GPT-4o (Nivel 3)';
    } else if (len > 200 || isCode) {
      tier = 'Claude Sonnet 4.6 / GPT-4o (Nivel 2)';
    } else {
      tier = 'Claude Haiku / GPT-4o-mini (Nivel 1)';
    }

    const hallRisk = !results.find(r => r.key === 'uncertainty').present ? 'MEDIO-ALTO' : 'BAJO';

    const suggestions = [];
    if (isCode && !results.find(r => r.key === 'xml').present) {
      suggestions.push('<strong>Para Claude:</strong> Añade XML tags (&lt;contexto&gt;, &lt;codigo&gt;, &lt;tarea&gt;) para mayor precisión.');
    }
    if (!results.find(r => r.key === 'examples').present && len > 150) {
      suggestions.push('Añade 1 ejemplo de input → output esperado para eliminar ambigüedad de formato.');
    }
    suggestions.push('Prueba con 5 inputs distintos antes de usar en producción.');

    return { score, results, issues, tier, hallRisk, suggestions };
  }

  function renderDebuggerResults(r) {
    const resEl = document.getElementById('db-results');
    if (!resEl) return;

    resEl.hidden = false;

    /* Scores */
    const scoreEl = document.getElementById('dr-score');
    const modelEl = document.getElementById('dr-model');
    const riskEl  = document.getElementById('dr-risk');

    if (scoreEl) {
      scoreEl.textContent = r.score + '/10';
      scoreEl.style.color = r.score >= 8 ? '#50fa7b' : r.score >= 5 ? '#a8cc1a' : '#ef4444';
    }
    if (modelEl) {
      modelEl.textContent = r.tier;
      modelEl.style.color = r.score >= 7 ? 'var(--lime)' : 'var(--cl)';
    }
    if (riskEl) {
      riskEl.textContent = r.hallRisk;
      riskEl.style.color = r.hallRisk === 'BAJO' ? '#50fa7b' : 'var(--cl)';
    }

    /* Components */
    const compsEl = document.getElementById('dr-comps');
    if (compsEl) {
      compsEl.innerHTML = r.results.map(c => `
        <div class="comp-row">
          <div class="comp-dot comp-dot--${c.present ? 'ok' : c.optional ? 'opt' : 'no'}"></div>
          <span class="comp-name">
            ${c.label}
            ${c.optional ? '<span style="font-size:.65rem;color:var(--text-dim)">(opcional)</span>' : ''}
          </span>
          <span class="comp-status comp-status--${c.present ? 'ok' : c.optional ? 'opt' : 'no'}">
            ${c.present ? '✓ Presente' : c.optional ? '— Opcional' : '✗ Falta'}
          </span>
        </div>`
      ).join('');
    }

    /* Issues */
    const issuesEl = document.getElementById('dr-issues');
    if (issuesEl) {
      if (r.issues.length) {
        issuesEl.innerHTML = r.issues.map(i => `
          <div class="issue-item issue-item--${i.type}">
            <span>${i.icon}</span>
            <div class="issue-text">${i.text}</div>
          </div>`
        ).join('');
      } else {
        issuesEl.innerHTML = `
          <div style="font-size:.8rem;color:#50fa7b;padding:.4rem 0">
            ✓ No se detectaron problemas estructurales.
          </div>`;
      }
    }

    /* Suggestions */
    const sugsEl = document.getElementById('dr-sugs');
    if (sugsEl) {
      sugsEl.innerHTML = r.suggestions.map(s => `
        <div class="sug-item">${s}</div>`
      ).join('');
    }

    /* Trigger animations */
    if (window.animateDebuggerResults) {
      window.animateDebuggerResults(scoreEl, modelEl, riskEl);
    }
  }

  function initDebugger() {
    const ta     = document.getElementById('db-ta');
    const runBtn = document.getElementById('db-run-btn');
    const chars  = document.getElementById('db-chars');
    const tokens = document.getElementById('db-tokens');

    if (!ta) return;

    ta.addEventListener('input', () => {
      const l = ta.value.length;
      if (chars)  chars.textContent  = l.toLocaleString('es-ES');
      if (tokens) tokens.textContent = '~' + Math.round(l / 4).toLocaleString('es-ES');
    });

    /* Clear */
    const clearBtn = document.querySelector('.js-db-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        ta.value = '';
        if (chars)  chars.textContent  = '0';
        if (tokens) tokens.textContent = '~0';
        const resEl = document.getElementById('db-results');
        if (resEl)  resEl.hidden = true;
      });
    }

    /* Run */
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        const text = ta.value.trim();
        if (!text) {
          showToast('Pega un prompt primero.');
          return;
        }

        runBtn.textContent = '⏳ Analizando…';
        runBtn.classList.add('is-loading');
        runBtn.disabled = true;

        setTimeout(() => {
          runBtn.textContent = '⚡ Analizar';
          runBtn.classList.remove('is-loading');
          runBtn.disabled = false;

          const result = analyzePrompt(text);
          renderDebuggerResults(result);
        }, 1100);
      });
    }
  }

  /* ══════════════════════════════════════════
     8. GLOSSARY
  ══════════════════════════════════════════ */
  const GLOSSARY_DATA = [
    {
      term: 'Token',
      cat: 'both',
      def: 'La unidad básica de procesamiento de los LLMs. ~4 caracteres o ~0.75 palabras en inglés.',
      ex: '1000 palabras ≈ 1300 tokens. Claude Sonnet 4.6: 200K tokens. GPT-5: 272K.',
      rel: ['Context Window', 'LLM'],
    },
    {
      term: 'LLM',
      cat: 'both',
      def: 'Large Language Model. Modelo entrenado en enormes corpus de texto para predecir secuencias de tokens.',
      ex: 'Base de Claude (Anthropic), ChatGPT (OpenAI) y Gemini (Google).',
      rel: ['Token', 'Hallucination'],
    },
    {
      term: 'Context Window',
      cat: 'both',
      def: 'Cantidad total de tokens que el modelo puede procesar en una llamada. Todo lo que queda fuera, el modelo no lo sabe.',
      ex: 'Claude Opus 4.6: 1M tokens (beta). GPT-5: 272K tokens. Gemini 2.5: 2M tokens.',
      rel: ['Token', 'RAG'],
    },
    {
      term: 'Hallucination',
      cat: 'both',
      def: 'Cuando el modelo genera información que parece plausible pero es factualmente incorrecta o inventada.',
      ex: 'Fix: uncertainty permission, grounding con documentos, pedir citas por afirmación.',
      rel: ['Uncertainty Permission', 'RAG'],
    },
    {
      term: 'Temperature',
      cat: 'both',
      def: 'Parámetro 0-2 que controla la aleatoriedad del output. 0 = determinista. 1 = creativo.',
      ex: 'Para código de SiGestión: 0. Para posts de LinkedIn: 0.7-1.0.',
      rel: ['LLM', 'Prompt'],
    },
    {
      term: 'System Prompt',
      cat: 'both',
      def: 'Instrucciones de alto nivel que definen el rol y comportamiento del modelo para toda la conversación.',
      ex: 'Para SiMJ: "Eres asistente de soporte de SiGestión. Solo respondes sobre nuestro ERP."',
      rel: ['Prompt', 'Temperature'],
    },
    {
      term: 'Chain-of-Thought',
      cat: 'both',
      def: 'Técnica que pide al modelo razonar paso a paso antes de responder. NO usar con o3/o4-mini.',
      ex: '"Antes de responder, analiza brevemente los pros y contras. Luego da tu recomendación."',
      rel: ['o3/o4-mini'],
    },
    {
      term: 'RAG',
      cat: 'both',
      def: 'Retrieval-Augmented Generation. Combina el LLM con una base de conocimiento externa para reducir alucinaciones.',
      ex: 'SiMJ podría usar RAG para que la IA conozca la documentación actualizada de SiGestión.',
      rel: ['Context Window', 'Hallucination'],
    },
    {
      term: 'Few-Shot',
      cat: 'both',
      def: 'Incluir ejemplos de pares input→output en el prompt para que el modelo aprenda el patrón sin fine-tuning.',
      ex: '2-3 ejemplos bien elegidos superan instrucciones largas. Incluye también ejemplos negativos.',
      rel: ['System Prompt'],
    },
    {
      term: 'Uncertainty Permission',
      cat: 'both',
      def: 'Dar permiso explícito al modelo para admitir que no sabe. Reduce alucinaciones hasta un 60%.',
      ex: '"Si el dato no está disponible, escribe: \'Dato no disponible — necesitaría: [X]\'"',
      rel: ['Hallucination', 'Prompt'],
    },
    {
      term: 'XML Tags',
      cat: 'cl',
      def: 'Etiquetas XML usadas como separadores semánticos en prompts de Claude. Más efectivas que markdown.',
      ex: '<contexto>, <codigo>, <restricciones>, <tarea>. La tarea siempre al final.',
      rel: ['System Prompt', 'Prefill'],
    },
    {
      term: 'Extended Thinking',
      cat: 'cl',
      def: 'Feature de Claude Opus 4.6 que activa razonamiento profundo interno. Configurable con budget_tokens.',
      ex: 'Para arquitectura de SiGestión, decisiones técnicas críticas o análisis de migración.',
      rel: ['Claude Opus 4.6'],
    },
    {
      term: 'Prefill',
      cat: 'cl',
      def: 'Iniciar el mensaje del asistente con el patrón exacto de output. Claude continúa el formato.',
      ex: 'Para JSON: empieza con \'```json\\n{"\'. Claude completa garantizando el formato.',
      rel: ['XML Tags'],
    },
    {
      term: 'Claude Opus 4.6',
      cat: 'cl',
      def: 'Modelo más potente de Anthropic. 1M tokens (beta), Extended Thinking, 128K output.',
      ex: 'Arquitectura de módulos de SiGestión, análisis de seguridad profundo, decisiones críticas.',
      rel: ['Claude Sonnet 4.6', 'Extended Thinking'],
    },
    {
      term: 'Claude Sonnet 4.6',
      cat: 'cl',
      def: 'Modelo de producción de Anthropic. Equilibrio calidad/coste. El 80% de las tareas de desarrollo.',
      ex: 'Revisar PRs, escribir tests, debuggear, refactorizar código de SiGestión.',
      rel: ['Claude Opus 4.6', 'Claude Haiku 4.5'],
    },
    {
      term: 'Claude Haiku 4.5',
      cat: 'cl',
      def: 'El modelo más rápido y económico de Anthropic. Para tareas simples y repetitivas.',
      ex: 'Documentar funciones, generar factories, clasificar incidencias de soporte.',
      rel: ['Claude Sonnet 4.6'],
    },
    {
      term: 'MCP',
      cat: 'cl',
      def: 'Model Context Protocol. Estándar de Anthropic para conectar agentes IA con herramientas externas.',
      ex: 'SiMJ podría usar MCP para que Claude acceda directamente a la BD de SiGestión o a GitHub.',
      rel: ['Context Engineering'],
    },
    {
      term: 'GPT-4o',
      cat: 'oa',
      def: 'Modelo principal de OpenAI. Equilibrio velocidad/calidad. Recomendado para marketing y operaciones.',
      ex: 'Propuestas comerciales, emails, posts, análisis de mercado, actas, informes.',
      rel: ['o3/o4-mini', 'Structured Outputs'],
    },
    {
      term: 'o3/o4-mini',
      cat: 'oa',
      def: 'Modelos razonadores de OpenAI. Piensan internamente. No añadir CoT explícito — empeora el resultado.',
      ex: 'Cálculos complejos, análisis estratégico profundo. o4-mini: 99.5% AIME 2025.',
      rel: ['GPT-4o', 'Chain-of-Thought'],
    },
    {
      term: 'Structured Outputs',
      cat: 'oa',
      def: 'Feature de OpenAI que garantiza que el output JSON cumpla un schema exacto. Elimina parsing frágil.',
      ex: 'Para extraer datos de emails de clientes de forma determinista en integraciones de SiGestión.',
      rel: ['GPT-4o'],
    },
    {
      term: 'Developer Message',
      cat: 'oa',
      def: 'Rol de máxima prioridad en la API de OpenAI para modelos o-series. Reemplaza al system message.',
      ex: 'Define restricciones absolutas que el modelo respetará por encima del usuario.',
      rel: ['o3/o4-mini', 'System Prompt'],
    },
    {
      term: 'Anonimización',
      cat: 'both',
      def: 'Eliminar o reemplazar datos identificables antes de enviarlos a una IA. Obligatorio bajo RGPD.',
      ex: 'Clientes → [CLIENTE_TIPO], credenciales → [REDACTED], IPs → [IP_PROD].',
      rel: ['RGPD', 'PII'],
    },
    {
      term: 'RGPD',
      cat: 'both',
      def: 'Reglamento General de Protección de Datos de la UE. Multas hasta el 4% del volumen global.',
      ex: 'Para usar IA con datos de clientes de SiMJ: DPA firmado, plan Team, datos anonimizados.',
      rel: ['Anonimización', 'PII'],
    },
    {
      term: 'PII',
      cat: 'both',
      def: 'Personally Identifiable Information. Cualquier dato que identifique directa o indirectamente a una persona.',
      ex: 'Nombres, emails, DNIs, IPs, matrículas de vehículos (relevante para SiGPS).',
      rel: ['RGPD', 'Anonimización'],
    },
    {
      term: 'Context Engineering',
      cat: 'both',
      def: 'Disciplina que reemplaza al "prompt engineering" simple. Diseñar qué información recibe el modelo en cada llamada.',
      ex: 'Las 5 capas: instrucciones del sistema, memoria corta, memoria larga, conocimiento externo, estado de tarea.',
      rel: ['RAG', 'MCP'],
    },
    {
      term: 'Fine-tuning',
      cat: 'both',
      def: 'Proceso de entrenar un modelo base con datos específicos para especializarlo en una tarea o dominio.',
      ex: 'SiMJ podría hacer fine-tuning con las incidencias históricas de soporte para mejorar el diagnóstico automático.',
      rel: ['LLM', 'Few-Shot'],
    },
  ];

  let glossCatActive = 'all';
  let glossSearch    = '';

  function highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(
      new RegExp(`(${escaped})`, 'gi'),
      '<mark class="hl">$1</mark>'
    );
  }

  function renderGlossary() {
    const grid  = document.getElementById('gloss-grid');
    const empty = document.getElementById('gloss-empty');
    if (!grid) return;

    const filtered = GLOSSARY_DATA.filter(g => {
      const matchCat = glossCatActive === 'all' || g.cat === glossCatActive;
      const q = glossSearch.toLowerCase();
      const matchSearch = !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (!filtered.length) {
      grid.style.display = 'none';
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    grid.style.display = 'grid';

    grid.innerHTML = filtered.map(g => `
      <article class="gloss-card" role="listitem">
        <div class="gloss-card__term">${highlight(g.term, glossSearch)}</div>
        <span class="gloss-card__cat gloss-card__cat--${g.cat}">
          ${g.cat === 'cl' ? 'Claude' : g.cat === 'oa' ? 'OpenAI' : 'General'}
        </span>
        <p class="gloss-card__def">${highlight(g.def, glossSearch)}</p>
        <p class="gloss-card__ex">${g.ex}</p>
        ${g.rel && g.rel.length ? `
          <div class="gloss-card__rel">
            <span class="gloss-card__rel-label">Ver también:</span>
            ${g.rel.map(r => `
              <button class="gloss-card__rel-tag" data-term="${r}">${r}</button>
            `).join('')}
          </div>` : ''}
      </article>`
    ).join('');

    /* Bind related term buttons */
    grid.querySelectorAll('.gloss-card__rel-tag').forEach(btn => {
      btn.addEventListener('click', function () {
        const term = this.dataset.term;
        glossSearch = term;
        const input = document.getElementById('gloss-input');
        if (input) input.value = term;
        renderGlossary();
        /* Scroll to glossary section */
        const sec = document.getElementById('glosario');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    if (window.animateGlossaryCards) window.animateGlossaryCards();
  }

  function initGlossary() {
    renderGlossary();

    const input = document.getElementById('gloss-input');
    if (input) {
      input.addEventListener('input', function () {
        glossSearch = this.value.trim();
        renderGlossary();
      });
    }

    document.querySelectorAll('.js-gcat').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.js-gcat').forEach(b => b.classList.remove('gcat--active'));
        this.classList.add('gcat--active');
        glossCatActive = this.dataset.cat;
        renderGlossary();
      });
    });
  }

  /* ══════════════════════════════════════════
     9. TOAST NOTIFICATION
  ══════════════════════════════════════════ */
  function showToast(msg) {
    let toast = document.getElementById('simj-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'simj-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(60px);
        background: rgba(13,27,75,0.95);
        border: 1px solid var(--lime);
        color: var(--lime);
        font-family: var(--mono, monospace);
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        padding: 0.65rem 1.5rem;
        border-radius: 100px;
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        box-shadow: 0 4px 20px rgba(168,204,26,0.2);
        transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(60px)';
    }, 2500);
  }

  /* ══════════════════════════════════════════
     10. SMOOTH SCROLL FOR ANCHOR LINKS
  ══════════════════════════════════════════ */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;

      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ══════════════════════════════════════════
     11. KEYBOARD SHORTCUT HINTS
  ══════════════════════════════════════════ */
  function initKeyboardHints() {
    /* Ctrl/Cmd+K → Focus glossary search */
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('gloss-input');
        if (input) {
          const sec = document.getElementById('glosario');
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => input.focus(), 400);
          showToast('⌘K — Buscando en el glosario');
        }
      }
    });
  }

  /* ══════════════════════════════════════════
     12. INIT
  ══════════════════════════════════════════ */
  function init() {
    initCopyButtons();
    initMegaCopyButtons();
    initICardCopy();
    initIndustryTabs();
    initChecklist();
    initErrorCards();
    initDebugger();
    initGlossary();
    initSmoothScroll();
    initKeyboardHints();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
