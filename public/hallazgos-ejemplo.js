// Example data for plantilla-informe.html («Deconstrucción de alcachofas con jamón»).
// Invented data about an invented web (example.com): copy the format, not the content.
//
// How to use it: write your own auditoria/hallazgos.js with this same shape and save it next to
// 05-informe.html. The report paints itself from it; there is nothing to edit in the HTML.
//
// Fields
// - web: { nombre, url } · sistema: { url, version } · fecha: 'AAAA-MM-DD' · autoria: who and with what
// - muestra: { estructuradas, aleatorias } (numbers) · viewports: optional text
// - alcanceDemo: true only if the sample was cut for a talk demo
// - resumen: { cobertura (0–100, decimals allowed: share of what is seen that comes from the system), deriva (number of hand-written values) }
// - michelin: five { puntos (0–3), evidencia }, one per criterion and in this order. Each criterion is
//   the official Michelin one, translated to the design system, and is scored with what its steps found:
//   1 «La calidad de los ingredientes»: tokens y assets con fuente única, tipados y con origen (steps 0 · 1)
//   2 «El dominio de las técnicas»: componentes fieles a sus specs, accesibles y con todos sus estados (steps 2 · 4)
//   3 «La armonía de sabores»: el mismo problema, resuelto igual en todas partes (steps 1 · 3)
//   4 «La personalidad del chef expresada en su cocina»: la marca se reconoce sin ver el logo (steps 0 · 3)
//   5 «La regularidad en toda la carta y en el tiempo»: en toda la muestra y de una auditoría a la
//     siguiente (steps 1 · 6); on a first audit, score only the whole sample and say so
//   Points: 0 no star · 1 ★ worth a stop · 2 ★★ worth a detour · 3 ★★★ worth the journey.
//   evidencia: one or two short sentences that justify the points, citing H-XX or the file they come from
// - salud: { cobertura, deriva, duplicados, huerfanos, paridad } (short texts, may cite files and H-XX)
// - hallazgos: one object per finding, ordered by impact
//   - id: 'H-01', 'H-02'… (unique; it names its screenshots)
//   - titulo · pagina (full URL) · selector · estado (only if not the normal state: 'foco', 'hover'…)
//   - capa · valorActual · valorSistema · regla · impacto ('alto' | 'medio' | 'bajo')
//   - esfuerzo ('bajo' | 'medio' | 'alto') · propuesta
//   - capturas: one { ancho, alt } for each width of step 1 where the finding fails (ancho in px).
//     Its file is capturas/<id>-<ancho>.png (H-01-1440.png, H-01-360.png…). Optional contexto:
//     alt of a second screenshot at that width, capturas/<id>-<ancho>-contexto.png
//     capturas: [] only when there is nothing visual to capture (a token file, a pattern the system
//     lacks): the card then says the evidence is in its fuente
//   - fuente: the file the evidence comes from (e.g. '02-pure.md')
//   - verificado: false when your AI writes it; true only after you check it yourself (then ask your AI to set it)
//   - dondeSeCorrige ('Sistema' | 'Producto' | 'Gobernanza'), ronda, criterio: null until step 6
// - descartados: what the AI proposed and is not a finding, each { tipo, titulo, motivo } with tipo:
//   'falso positivo' (checked, and it is not a failure) ·
//   'por comprobar' (it may be a failure, but it could not be proven; add comoComprobar: what would prove it) ·
//   'visto de paso' (not about the design system or accessibility; add para: who it is passed to)
window.hallazgos = {
  web: { nombre: 'Tienda de ejemplo', url: 'https://example.com/' },
  sistema: { url: 'https://example.com/sistema', version: '1.0.0' },
  fecha: '2026-11-25',
  autoria: 'Tu nombre, con tu agente de IA y su navegador',
  muestra: { estructuradas: 3, aleatorias: 1 },
  alcanceDemo: false,
  resumen: { cobertura: 72, deriva: 14 },
  michelin: [
    { puntos: 2, evidencia: 'Tokens en DTCG, tipados y con origen; dos grises duplicados (H-02).' },
    { puntos: 1, evidencia: 'El foco del menú no se ve (H-01) y el botón primario se sale de la escala (H-03).' },
    { puntos: 2, evidencia: 'Los formularios de contacto y de suscripción siguen el mismo patrón.' },
    { puntos: 2, evidencia: 'La voz es reconocible; dos botones dicen «Enviar» en vez de lo que hacen.' },
    { puntos: 1, evidencia: 'Primera auditoría: todavía no hay comparación en el tiempo.' },
  ],
  salud: {
    cobertura: '72 % de lo visto sale de tokens semánticos, 14 % de primitivos usados directamente y 14 % está escrito a mano (01-cucharadas-caldo.md).',
    deriva: '14 valores escritos a mano, sobre todo grises de texto y rellenos de botón.',
    duplicados: 'Tres grises de texto casi iguales donde el sistema tiene uno (H-02).',
    huerfanos: 'Una tarjeta de producto que el sistema no documenta (02-pure.md).',
    paridad: 'La documentación y el archivo de tokens coinciden, salvo la escala de espaciado (00-ingredientes.md).',
  },
  hallazgos: [
    {
      id: 'H-01',
      titulo: 'El foco no se ve en el menú principal',
      pagina: 'https://example.com/',
      selector: 'header nav a',
      estado: 'foco',
      capa: 'Baja temperatura · accesibilidad',
      valorActual: 'outline: none',
      valorSistema: 'outline: 2px solid var(--color-focus)',
      regla: 'WCAG 2.4.7 Foco visible · sistema › Accesibilidad › Foco',
      impacto: 'alto',
      esfuerzo: 'bajo',
      propuesta: 'Quitar el outline: none del menú y usar el anillo de foco del sistema.',
      capturas: [
        { ancho: 1440, alt: 'Enlace «Tienda» del menú con el foco de teclado y sin ningún anillo visible.' },
      ],
      fuente: '04-baja-temperatura.md',
      verificado: true,
      dondeSeCorrige: 'Producto',
      ronda: 1,
      criterio: 'En https://example.com/, al llegar con Tab a header nav a, el estilo calculado tiene outline-width: 2px.',
    },
    {
      id: 'H-02',
      titulo: 'Tres grises de texto que no están en el sistema',
      pagina: 'https://example.com/productos',
      selector: '.card p, .footer small',
      capa: 'Caldo · tokens',
      valorActual: '#6b6b6b · #707070 · #727272',
      valorSistema: 'var(--color-text-muted) · #666666',
      regla: 'Sistema › Color › Texto secundario',
      impacto: 'medio',
      esfuerzo: 'bajo',
      propuesta: 'Sustituir los tres grises por el token semántico de texto secundario.',
      capturas: [
        { ancho: 1440, alt: 'Tres tarjetas de producto en fila, con el texto de la descripción en tres grises distintos.', contexto: 'La página de productos con las tres tarjetas resaltadas.' },
        { ancho: 360, alt: 'Las mismas tres tarjetas, apiladas, con los tres grises en la descripción.' },
      ],
      fuente: '01-cucharadas-caldo.md',
      verificado: false,
      dondeSeCorrige: null,
      ronda: null,
      criterio: null,
    },
    {
      id: 'H-03',
      titulo: 'Botón primario con un relleno fuera de la escala',
      pagina: 'https://example.com/contacto',
      selector: 'form .button--primary',
      capa: 'Puré · componentes',
      valorActual: 'padding: 14px 20px',
      valorSistema: 'padding: 16px 24px · var(--space-2) var(--space-3)',
      regla: 'Sistema › Botón › Tamaños',
      impacto: 'bajo',
      esfuerzo: 'bajo',
      propuesta: 'Usar el tamaño mediano del botón del sistema en lugar de un relleno escrito a mano.',
      capturas: [
        { ancho: 360, alt: 'Botón «Enviar mensaje» del formulario de contacto, algo más bajo que el resto de botones.' },
      ],
      fuente: '02-pure.md',
      verificado: false,
      dondeSeCorrige: null,
      ronda: null,
      criterio: null,
    },
  ],
  descartados: [
    { tipo: 'falso positivo', titulo: 'Contraste bajo en un botón deshabilitado', motivo: 'WCAG 1.4.3 no exige contraste mínimo en controles inactivos.' },
    { tipo: 'por comprobar', titulo: 'El mensaje de error no se anuncia', motivo: 'El error tiene role=alert, pero no se ha probado con un lector de pantalla.', comoComprobar: 'Enviar el formulario de contacto vacío con NVDA o VoiceOver y escuchar si lee el error.' },
    { tipo: 'visto de paso', titulo: 'Un script de analítica carga antes del consentimiento', motivo: 'Se ve la petición con las cookies rechazadas. No es del sistema de diseño.', para: 'Quien lleve la privacidad y las cookies' },
  ],
};
