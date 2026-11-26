# Deconstrucción de alcachofas con jamón

Landing de la charla **«Deconstrucción de alcachofas con jamón: auditoría de sistemas de diseño en producción»**, de María Rogles, presentada en Diseño e IA by Arcasiles.

La landing es a la vez el soporte de la charla (una sección por pantalla con scroll-snap en escritorio; en móvil el scroll es libre) y un recurso para después.

## Puesta en marcha

```bash
npm install
npm run dev       # servidor local con recarga
npm run build     # genera dist/
npm run preview   # sirve dist/ en local
```

Se publica en GitHub Pages con `.github/workflows/deploy.yml` en cada push a `main`. En el repo, activa *Settings → Pages → Source: GitHub Actions*.

URL prevista: `https://muirogles.github.io/deconstruccion-alcachofas/`.
⚠️ Si renombras el repo, GitHub Pages **no redirige** la URL antigua: regenera los QR de `public/qr/`.

## Stack

- Vite solo como herramienta de desarrollo y build (`base: './'`, rutas relativas).
- HTML semántico, CSS con custom properties y BEM, y JS vanilla en módulos ES. **Sin librerías** en el navegador.
- La página se lee entera sin JavaScript. JS solo añade navegación, copiar, rellenar las comandas, el rail de «El servicio» y QR.
- **Mobile first** y responsive de móvil a 4K: estilos base para móvil y solo `min-width` (y `min-height` para los títulos grandes).

## Estructura

```
index.html                 contenido (fuente en español)
src/main.js                entrada
src/modules/               navigation · slots · copy · service · qr-dialog · i18n · illustrations · announce · storage
src/illustrations/         SVG originales de cocina (decorativos, se inyectan con JS)
src/styles/main.css        orden: tema → tokens → base → layout → componentes
src/styles/themes/         valores de marca (un archivo por tema)
src/styles/tokens/         primitivos base 8 (_primitives) · roles semánticos por escalón (_semantic) · capas z-index
src/styles/base/           fuentes, reset, estilos globales, foco y reduced motion
src/styles/layout/         página y secciones (scroll-snap)
src/styles/components/     un archivo por bloque BEM
assets/fonts/              Lexend variable (SIL OFL 1.1)
assets/images/             imágenes usadas desde CSS
public/characters/         PNG originales de Alcachofil (sin modificar)
public/i18n/es.json        diccionario de referencia (español)
public/i18n/en.json        traducción al inglés, con las mismas claves
public/qr/                 QR de la landing y del reto
public/plantilla-informe.html  informe que se pinta solo con hallazgos.js
public/hallazgos-ejemplo.js    formato de los datos del informe, con un ejemplo inventado
public/hoja-de-cata.md         hoja de cata en Markdown (sin agente, reto y móvil)
public/report-template.html    el informe en inglés: se pinta con findings.js
public/findings-example.js     el ejemplo de datos en inglés (claves en inglés)
public/tasting-sheet.md        la hoja de cata en inglés
```

## Tokens y temas

- Tres capas, como en DTCG: **primitivos** → **semánticos** → **componente**.
  - Primitivos: `tokens/_primitives.css` (espaciado y tamaños de letra en base 8), `tokens/_characters.css` (colores del retrato y de la gabardina de la ponente) y la paleta, familias, movimiento y radios del tema.
  - Semánticos: `tokens/_semantic.css` (roles de texto, espaciado y contenedores, por escalón de pantalla) y los roles de color del tema (`--color-*`).
  - Componente: variables dentro de cada bloque BEM (`--button-bg`, `--ticket-bg`, `--rail-bar`…), que apuntan a los semánticos.
- Los componentes **solo** leen tokens semánticos o sus propios tokens de componente.
- `src/styles/themes/_arcasiles.css` asigna los valores de Arcasiles (canon v5.0.1). Para otra charla, duplica el tema, cambia los valores y el `@import` de `main.css`.
- La landing tiene su propio sistema de tokens, reutilizable: los valores de Arcasiles solo viven en el tema.
- Tipografía: Lexend autoalojada para todo el texto (`--font-family-display` y `--font-family-text` en el tema).
- **Base 8** en tamaños de letra y espaciados (mínimo 16 px), por escalones: móvil · 22,5rem · 37,5rem · 64rem · 100rem (Full HD y proyector) · 160rem (2K y 4K).
- **Cinco roles de texto**, cada uno con una función: etiqueta · texto · frase clave · título (`h2`) · portada (`h1`). Los títulos de tarjeta son texto en negrita.
- Contenedores **fluidos** con mínimos y máximos (`clamp()`, `min()`, `minmax()`, medidas en `ch` y `em`), sin anchos fijos.
- `rem` en el layout; dentro de los componentes, `em` cuando el espacio debe seguir al tamaño de letra.

## Traducción

- El HTML es la fuente en español. Cada texto traducible lleva `data-i18n="clave"` (o `data-i18n-attr="atributo:clave"`).
- `public/i18n/es.json` es la referencia de claves; `public/i18n/en.json` es la versión en inglés, con las mismas claves y el mismo HTML dentro de cada texto (los huecos `[web]` y `[sistema]` de las comandas dependen de él).
- El selector ES · EN de la cabecera cambia el idioma y el navegador lo recuerda. La página no detecta el idioma del navegador: empieza en español, salvo que antes se haya elegido EN.
- En inglés, las comandas usan nombres de archivo en inglés (`audit/`, `00-ingredients.md`…`06-adjust.md`, `findings.js`, `screenshots/`, `board.md`…) y enlazan sus propias plantillas: `report-template.html`, `findings-example.js` y `tasting-sheet.md`. El informe en inglés es una copia de `plantilla-informe.html` con los textos traducidos y una función `normalize()` que traduce las claves de `findings.js` a las que lee el informe: si cambias uno, cambia el otro.
- Si cambias textos del HTML, actualiza `es.json` y `en.json`. Para otro idioma: crea `public/i18n/<idioma>.json` con las mismas claves y añádelo a `LANGUAGES` en `src/modules/i18n.js`.

## Licencias y créditos

Detalle completo en [`LICENSE.md`](LICENSE.md). En resumen:

- **Código** (JS, CSS, marcado HTML, configuración): [MIT](LICENSE.md#4-mit-license) · © 2026 María Rogles.
- **Contenido** (textos, metodología, comandas, plantillas, ilustraciones de `src/illustrations/`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es) · © 2026 María Rogles. Puedes usarlo también en tu trabajo, citando la fuente.
- **Material de terceros, fuera de MIT y de CC BY:**
  - **Alcachofil, logotipo, paleta y tema** (`public/characters/`, `assets/images/`, `src/styles/themes/_arcasiles.css` y el logo y los colores de `public/plantilla-informe.html`): © Arcasiles Group, usados con su permiso en el contexto de esta colaboración. Solo archivos originales, sin redibujar ni recolorear. Condiciones: [brand.arcasiles.com/licencia](https://brand.arcasiles.com/licencia).
  - **Lexend:** © 2018 The Lexend Project Authors, SIL Open Font License 1.1 (`assets/fonts/Lexend-OFL.txt`).
  - **Receta:** © Alcachofa Vega Baja Del Segura, elaborada por la Bodega La Venganza de Orihuela. Se cita con enlace.
- **Para reutilizar la landing o el informe con otro sistema:** duplica el tema con tus valores y cambia los colores de `:root` en `public/plantilla-informe.html`. El logo solo aparece si la web auditada es arcasiles.com.

## Ilustraciones y animación

- `src/illustrations/*.svg`: ilustraciones originales en la paleta del tema (clases `ill-*` → tokens `--color-illustration-*`). No redibujan a Alcachofil: la alcachofa no tiene cara.
- Se colocan con `<span class="illustration" data-illustration="nombre"></span>`; `illustrations.js` las inyecta con `aria-hidden="true"`.
- **La escena de incógnito** (`.incognito__scene`, decorativa): la inspectora llega mientras Alcachofil, de maître, sirve el plato deconstruido (cada elaboración por separado, con la campana levantada). La inspectora (`.inspector`) es HTML y CSS: gabardina cruzada y sombrero de lluvia, y su cara (`.portrait`, en `_portrait.css`), exportada como CSS calculado desde el personaje reanimado de Disaster System, con las medidas en `cqi`. No se edita a mano: se vuelve a exportar.
- Las animaciones se lanzan una vez al entrar la sección en pantalla, son finitas (menos de 5 s, WCAG 2.2.2), usan la curva y duraciones del tema y se desactivan con `prefers-reduced-motion`.

## Cómo se cuenta la metodología

- **Los pasos explican el método** con su cata: «Qué se cata · Cómo se cata · En su punto». Al pie, un enlace a su comanda en el servicio.
- **«Cenamos de incógnito»** (`#incognito`), justo antes de «El servicio»: por qué se audita en producción, como los inspectores de la guía Michelin.
- **«La casa recomienda»** (`#la-casa`), antes de la demo: quién cocina qué en cada tiempo (sin IA, tu IA y tú), escrito en la pizarra de Alcachofil, con la regla de oro.
- **«Para llevar»**: la ventanilla (`#automatiza`), donde se pide el pase automático; tu carpeta y las plantillas; y las referencias.

## Las comandas: «El servicio»

- Cada comanda de la auditoría vive **una sola vez**, completa, en su ticket del rail de «El servicio» (`#servicio`). El pase automático es el pedido de la ventanilla «Para llevar».
- Arriba, en una pantalla: la web y el sistema de Arcasiles, el alcance de la demo (solo la home, por tiempo) y **la mesa**: tu web y tu sistema (rellenan todas las comandas), las URLs de Arcasiles y el modo demo.
- Cada paso enlaza a su ticket (`#comanda-00` … `#comanda-06`; además `#comanda-menu` y `#comanda-pase-automatico`) y cada ticket vuelve a su paso.
- Cada ticket lleva la comanda, «La pruebas tú» (la comprobación a mano) y «Sale a» (el archivo que guarda).
- Estados de cada ticket: **pendiente** → **marchando** (al copiarla, con la hora) → **servida** (lo marcas tú cuando su archivo está guardado). Se guardan solo en tu navegador. «Nueva mesa» vacía web, sistema y estados.
- Sin JavaScript, todas las comandas se ven seguidas y completas.

## Archivos de la auditoría

La receta tiene la mise en place (0) y seis pases en tres tiempos: I Deconstruir (1 Cucharadas de caldo · 2 Puré · 3 Yema y migas · 4 Baja temperatura) · II Emplatar (5 Emplatado) · III Rectificar y pase (6). El pase automático es el pedido de la ventanilla.

Cada comanda termina guardando su resultado en `auditoria/` (`00-ingredientes.md` … `06-rectificar.md`, `datos/`, `capturas/`, `herramientas/`, `hallazgos.js` y `pizarra.md`). Si se queda en el chat, se pierde. Con `pizarra.md`, cada tiempo puede empezar en una sesión limpia.

- **El informe, para tu equipo** (con agente): `public/plantilla-informe.html` se pinta solo con el `hallazgos.js` que escribe la IA en el paso 5, guardado a su lado. Resumen, guía Michelin, salud del sistema, índice y una ficha por hallazgo con su captura (una por cada ancho en que falla, con el ancho en el nombre: `capturas/H-XX-1440.png`, `H-XX-360.png`… y, si existe, `H-XX-1440-contexto.png`; los datos antiguos con `H-XX.png` se siguen pintando). «Dónde se corrige», el criterio y la ronda aparecen cuando el paso 6 los añade. Al final, «Fuera de los hallazgos» separa lo que la IA propuso y no entra: falsos positivos, por comprobar (con cómo se comprobaría) y visto de paso (con a quién se le pasa). Sin `hallazgos.js`, muestra el ejemplo de `public/hallazgos-ejemplo.js`, marcado como ejemplo. Los datos se pintan siempre como texto.
- Lleva el logo oficial de Arcasiles Group (SVG `dark`, incrustado sin modificar), que solo aparece si la web auditada es arcasiles.com, y su paleta, porque la demo y el reto auditan arcasiles.com. Para otra web, cambia los colores de `:root`. El crédito de la metodología y el aviso de licencia se mantienen siempre.
- **La hoja de cata** (sin agente): `public/hoja-de-cata.md`, para anotar la auditoría a mano, desde el móvil o desde un chat, y para enviarla al reto. Sus columnas usan los mismos campos que `hallazgos.js`.
- Nadie escribe `hallazgos.js` a mano: lo escribe la IA en el paso 5. Para compartir el informe con una sola cosa: Imprimir → Guardar como PDF.
