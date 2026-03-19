# IA en SiMJ · Guía Práctica Claude & OpenAI 2026

Guía práctica de Inteligencia Artificial para el equipo de **Soluciones Informáticas MJ (SiMJ)** — Córdoba, España.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-a8cc1a?style=flat-square&logo=github)](https://TU-USUARIO.github.io/simj-ia/)
[![Anime.js](https://img.shields.io/badge/Anime.js-v4.3.6-2e5fe8?style=flat-square)](https://animejs.com/)

---

## 🚀 Ver en vivo

**`https://TU-USUARIO.github.io/simj-ia/`**

*(Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub)*

---

## 📁 Estructura

```
simj-ia/
├── index.html          ← HTML principal (12 secciones)
├── css/
│   ├── vars.css        ← Tokens de diseño, reset, variables CSS
│   ├── layout.css      ← Grid, hero, secciones, footer, responsive
│   └── components.css  ← Cards, prompts, debugger, glosario, etc.
├── js/
│   ├── animations.js   ← Todas las animaciones con Anime.js v4
│   └── app.js          ← Lógica interactiva (tabs, copy, debugger, glosario)
└── README.md
```


## 📦 Dependencias externas (CDN)

No hay dependencias npm. Todo carga desde CDN:

| Librería | Versión | CDN |
|---|---|---|
| **Outfit** (Google Fonts) | — | fonts.googleapis.com |
| **JetBrains Mono** (Google Fonts) | — | fonts.googleapis.com |
| **Anime.js** | 4.3.6 | cdn.jsdelivr.net |

Todo funciona **sin npm install** ni proceso de build.

---

## ✏️ Personalización

### Cambiar colores de marca

Edita `css/vars.css`:

```css
:root {
  --navy:  #0d1b4b;   /* Fondo principal */
  --lime:  #a8cc1a;   /* Acento SiMJ */
  --blue:  #2e5fe8;   /* Azul botones */
  --cl:    #d97742;   /* Claude orange */
  --oa:    #10b981;   /* OpenAI green */
}
```

### Añadir un prompt a la biblioteca

En `index.html`, busca el panel correspondiente (p.ej. `id="ii-dev"`) y añade:

```html
<article class="icard reveal-item">
  <div class="icard__head">
    <div>
      <div class="icard__title">Título del prompt</div>
      <div class="icard__model icard__model--cl">Claude Sonnet 4.6 · Nivel 2</div>
    </div>
    <button class="icard__copy js-icard-copy">copiar</button>
  </div>
  <pre class="icard__body">Tu prompt aquí...</pre>
</article>
```

### Añadir un término al glosario

En `js/app.js`, busca `GLOSSARY_DATA` y añade:

```js
{
  term: 'Nombre del término',
  cat: 'both',        // 'cl' | 'oa' | 'both'
  def: 'Definición concisa.',
  ex: 'Ejemplo de uso real.',
  rel: ['Término relacionado'],
},
```

### Desactivar animaciones

Las animaciones respetan automáticamente `prefers-reduced-motion`. Para desactivarlas globalmente, edita `js/animations.js`:

```js
const prefersReduced = true; // fuerza modo sin animaciones
```

---

## 🗂️ Secciones

| # | ID | Contenido |
|---|---|---|
| 01 | `#intro` | Claude vs OpenAI — qué hace cada uno |
| 02 | `#tecnicas` | 10 técnicas élite (5 Claude + 5 OpenAI) |
| 03 | `#comparador` | Prompts buenos vs malos (3 pares visuales) |
| 04 | `#tiers` | Sistema de 3 niveles de complejidad |
| 05 | `#megaprompt` | 2 meta-prompts generadores (Claude + OpenAI) |
| 06 | `#empresa` | Privacidad RGPD + checklist |
| 07 | `#industrias` | Biblioteca de prompts por departamento |
| 08 | `#debugger` | Analizador de prompts en tiempo real |
| 09 | `#errores` | Los 10 errores más comunes + fix |
| 10 | `#glosario` | 26 términos con buscador y filtros |
| 11 | `#testing` | Framework de testing en 4 fases |
| 12 | `#recursos` | 14+ links a documentación oficial |

---

## 🎨 Técnicas de animación (Anime.js v4)

| Técnica | Uso |
|---|---|
| `anime.timeline()` | Secuencia de entrada del hero |
| `anime.stagger()` | Cascada de pills, error cards, recursos |
| `spring(1,80,12,0)` | Palabras del título rebotando |
| `IntersectionObserver` + anime | Reveals al hacer scroll |
| Canvas API + RAF | Campo de partículas con líneas |
| `anime({ loop: true })` | Orbs flotantes de fondo |
| `window.animateDebuggerResults` | Contador animado del debugger |
| `window.animateErrorFix` | Acordeón de fixes con height animado |
| `window.animateTabSwitch` | Transición entre tabs de industria |
| `window.animateGlossaryCards` | Stagger de tarjetas del glosario |

---

## 📄 Licencia

Uso interno SiMJ. No redistribuir sin autorización.

---

*Soluciones Informáticas MJ SCA · C/ Estocolmo 31, CP 14014, Córdoba · simj.es*
