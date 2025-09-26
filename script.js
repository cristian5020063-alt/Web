/* script.js
   Añade en index.html y bienvenido.html (el archivo puede ser el mismo).
*/

(() => {
  const FADE_CLASS = 'page-fade-overlay';
  const STORAGE_KEY = 'alista_transition';

  // --- Helpers ---
  function createOverlay() {
    const ov = document.createElement('div');
    ov.id = 'transition-overlay';
    ov.className = FADE_CLASS;
    // estilo base (por si no quieres tocar CSS)
    ov.style.position = 'fixed';
    ov.style.inset = '0';
    ov.style.background = '#000';
    ov.style.opacity = '0';
    ov.style.pointerEvents = 'none';
    ov.style.transition = 'opacity 450ms ease';
    ov.style.zIndex = '9999';
    return ov;
  }

  function fadeInOverlay(ov, callback) {
    document.body.appendChild(ov);
    // Force reflow to ensure transition
    void ov.offsetWidth;
    ov.style.opacity = '0.9';
    ov.style.pointerEvents = 'auto';
    ov.addEventListener('transitionend', function handler(e) {
      if (e.propertyName !== 'opacity') return;
      ov.removeEventListener('transitionend', handler);
      if (typeof callback === 'function') callback();
    });
  }

  function fadeOutAndRemoveOverlay(ov, callback) {
    ov.style.opacity = '0';
    ov.addEventListener('transitionend', function handler(e) {
      if (e.propertyName !== 'opacity') return;
      ov.removeEventListener('transitionend', handler);
      if (ov.parentElement) ov.parentElement.removeChild(ov);
      if (typeof callback === 'function') callback();
    });
  }

  // --- Comportamiento en index.html ---
  const btnInicio = document.getElementById('btn-inicio');
  if (btnInicio) {
    btnInicio.addEventListener('click', (ev) => {
      // Si el link ya apunta a bienvenido.html y queremos animar:
      const targetHref = btnInicio.getAttribute('href') || 'bienvenido.html';

      // Evitar comportamiento por defecto para controlar la transición
      ev.preventDefault();

      // Guardamos una señal para que la página destino se anime al cargar
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}

      // Creamos overlay y hacemos fade-in antes de redirigir
      const ov = createOverlay();
      fadeInOverlay(ov, () => {
        // pequeña espera opcional para que el usuario perciba la transición
        setTimeout(() => {
          // Redirigir a la página de bienvenida
          window.location.href = targetHref;
        }, 120); // 120ms adicional opcional
      });
    });
  }

  // --- Comportamiento en bienvenido.html (reproducción de animación de entrada) ---
  // Comprueba si llegamos desde la transición guardada
  const shouldAnimate = (() => {
    try { return sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
  })();

  if (shouldAnimate) {
    // Limpiar la señal para futuras navegaciones
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}

    // Añadimos clase al <body> para que CSS haga la animación
    // (Asegúrate de tener las reglas CSS que respondan a .page-enter)
    document.documentElement.classList.add('page-enter--start');

    // Forzar reflow y luego activar la clase que inicia la transición
    requestAnimationFrame(() => {
      // pequeña pausa para garantizar que el navegador registre la clase inicial
      setTimeout(() => {
        document.documentElement.classList.remove('page-enter--start');
        document.documentElement.classList.add('page-enter--active');

        // Después de la animación, limpiamos la clase active
        const CLEAN_MS = 700; // debe coincidir con la duración CSS
        setTimeout(() => {
          document.documentElement.classList.remove('page-enter--active');
        }, CLEAN_MS);
      }, 20);
    });

    // Además, si aún queda el overlay por alguna razón (fallback),
    // intentamos hacer fadeOut y eliminarlo.
    window.addEventListener('load', () => {
      const existing = document.getElementById('transition-overlay');
      if (existing) {
        // permitir que el overlay se desvanezca
        existing.style.pointerEvents = 'none';
        existing.style.transition = 'opacity 450ms ease';
        existing.style.opacity = '0';
        setTimeout(() => { if (existing.parentElement) existing.parentElement.removeChild(existing); }, 500);
      }
    });
  }

})();
(() => {
  const STORAGE_KEY = 'alista_transition';

  // En index.html: interceptar clic y guardar señal
  const btnInicio = document.getElementById('btn-inicio');
  if (btnInicio) {
    btnInicio.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem(STORAGE_KEY, '1');
      window.location.href = btnInicio.getAttribute('href');
    });
  }

  // En bienvenido.html: detectar señal y animar
  const shouldAnimate = sessionStorage.getItem(STORAGE_KEY) === '1';
  if (shouldAnimate) {
    sessionStorage.removeItem(STORAGE_KEY);
    document.documentElement.classList.add('page-enter--start');

    requestAnimationFrame(() => {
      setTimeout(() => {
        document.documentElement.classList.remove('page-enter--start');
        document.documentElement.classList.add('page-enter--active');

        setTimeout(() => {
          document.documentElement.classList.remove('page-enter--active');
        }, 700);
      }, 20);
    });
  }
})();