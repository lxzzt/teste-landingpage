// textos rotativos

document.addEventListener("DOMContentLoaded", () => {
  // todos os SVGs do indicador
  const rotors = document.querySelectorAll("svg g[id^='rotor-']");

  rotors.forEach((g) => {
    gsap.to(g, {
      rotation: 360,        // use -360 se quiser sentido horário
      duration: 20,         // velocidade (maior = mais lento)
      repeat: -1,
      ease: "none",
      svgOrigin: "100 100", // centro REAL do viewBox (cx, cy do círculo)
    });
  });
});

/* === SLIDER UNIVERSAL PARA SEÇÃO 2 E 4 === */
document.addEventListener("DOMContentLoaded", () => {

  function createSlider(containerSelector, slideSelector, dotsSelector, intervalTime = 3000) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const slidesWrapper = container.querySelector(slideSelector);
    const slides = slidesWrapper.children;
    const dotsContainer = container.querySelector(dotsSelector);

    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;
    let autoSlide;
    let autoDelay = intervalTime;
    let userInteracted = false;

    // cria as bolinhas
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement("button");
      dot.addEventListener("click", () => {
        currentIndex = i;
        updateSlider();
        pauseAutoSlide();
      });
      dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.querySelectorAll("button");

    function updateSlider() {
      slidesWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    }

    function startAutoSlide() {
      autoSlide = setInterval(nextSlide, autoDelay);
    }

    function pauseAutoSlide() {
      clearInterval(autoSlide);
      userInteracted = true;
      autoDelay = 7000; // 7 segundos após interação
      startAutoSlide();
      setTimeout(() => {
        userInteracted = false;
        autoDelay = intervalTime; // volta pro tempo padrão (3s)
      }, 7000);
    }

    // Eventos de toque/arraste
    slidesWrapper.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.pageX;
      clearInterval(autoSlide);
    });

    slidesWrapper.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const diff = e.pageX - startX;
      slidesWrapper.style.transform = `translateX(calc(-${currentIndex * 100}% + ${diff}px))`;
    });

    slidesWrapper.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      const diff = e.pageX - startX;
      if (diff > 50) {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      } else if (diff < -50) {
        currentIndex = (currentIndex + 1) % slides.length;
      }
      isDragging = false;
      updateSlider();
      pauseAutoSlide();
    });

    // toque em telas móveis
    slidesWrapper.addEventListener("touchstart", (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      clearInterval(autoSlide);
    });

    slidesWrapper.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      const diff = e.touches[0].clientX - startX;
      slidesWrapper.style.transform = `translateX(calc(-${currentIndex * 100}% + ${diff}px))`;
    });

    slidesWrapper.addEventListener("touchend", (e) => {
      if (!isDragging) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 50) {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      } else if (diff < -50) {
        currentIndex = (currentIndex + 1) % slides.length;
      }
      isDragging = false;
      updateSlider();
      pauseAutoSlide();
    });

    // inicia
    updateSlider();
    startAutoSlide();
  }

  /* === INICIALIZA SLIDERS === */

  // 🟣 Slider da seção 2 (Instagram)
  createSlider(".conteiner-insta", ".slides", ".dots", 3000);

  // 🟢 Slider da seção 4 (Reviews)
  createSlider("#quadro-modelo", ".review-slider", ".review-dots", 3000);
});


// ================================================
// === EFEITO DE TRANSIÇÃO CIRCULAR ENTRE SEÇÕES ===
// ================================================
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // Seleciona todas as seções
  const sections = gsap.utils.toArray(".page-section");

  // Cria a timeline principal
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-area",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
    }
  });

  // Anima cada transição circular
  sections.forEach((section, i) => {
    if (i === 0) return; // pula a primeira (já visível)

    const prevSection = sections[i - 1];

    tl.fromTo(section, 
      { clipPath: "circle(0% at 50% 50%)" },
      { 
        clipPath: "circle(150% at 50% 50%)",
        ease: "power2.out",
        duration: 1
      },
      i // deslocamento relativo (cada seção entra em sequência)
    );

    // opcional: esmaece o texto da seção anterior
    tl.to(prevSection, { opacity: 0, duration: 0.6 }, i);
    tl.to(section, { opacity: 1, duration: 0.8 }, i);
  });
});
// === HEADER NAV - PREENCHIMENTO PROGRESSIVO POR SCROLL (versão final) ===
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const navIcons = gsap.utils.toArray(".nav li img");
  const separacoes = gsap.utils.toArray(".separacao-icones");
  const sections = gsap.utils.toArray(".page-section");
  const totalSecoes = sections.length;

  // Estado inicial
  gsap.set(navIcons, { opacity: 0.4, filter: "brightness(0.7)" });
  gsap.set(separacoes, { backgroundColor: "white", opacity: 0.4, scaleX: 0, transformOrigin: "left center" });

  // Primeiro ícone ativo ao carregar
  gsap.set(navIcons[0], { opacity: 1, filter: "brightness(1)" });

  // === ScrollTrigger geral sincronizado com rolagem ===
  ScrollTrigger.create({
    trigger: ".scroll-area",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress; // valor entre 0 e 1
      const etapa = progress * (totalSecoes - 1);

      // Atualiza ícones
      navIcons.forEach((icon, i) => {
        const ativo = etapa >= i;
        gsap.to(icon, {
          opacity: ativo ? 1 : 0.4,
          filter: ativo ? "brightness(1)" : "brightness(0.7)",
          duration: 0.3,
          ease: "power2.out"
        });
      });

      // Atualiza barras progressivamente
      separacoes.forEach((bar, i) => {
        const start = i / (totalSecoes - 1);
        const end = (i + 1) / (totalSecoes - 1);
        const localProgress = gsap.utils.clamp(0, 1, (progress - start) / (end - start));

        gsap.to(bar, {
          scaleX: localProgress,
          opacity: localProgress > 0 ? 1 : 0.4,
          backgroundColor: "white",
          ease: "none",
          duration: 0.1
        });
      });
    }
  });
});
