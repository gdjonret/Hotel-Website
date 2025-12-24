// public/js/index.js
// -------------------------------------------------------------
// Shared init for all pages: navbar behavior + slideshow + carousels
// -------------------------------------------------------------

/* =========================
   NAVBAR (from navbar.js)
   ========================= */
   document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar-custom');
    const topBar = document.querySelector('.navbar');
    let lastScroll = 0;
  
    if (navbar && topBar) {
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
  
        // Content offset when scrolled
        if (currentScroll > 50) {
          document.body.classList.add('scrolled');
        } else {
          document.body.classList.remove('scrolled');
        }
  
        // Hide/reveal top bar & style navbar
        if (currentScroll > lastScroll && currentScroll > 100) {
          // Scrolling down
          navbar.classList.add('navbar-scroll');
          topBar.classList.add('top-bar-hidden');
        } else if (currentScroll < lastScroll) {
          // Scrolling up
          if (currentScroll < 100) {
            navbar.classList.remove('navbar-scroll');
            topBar.classList.remove('top-bar-hidden');
          }
        }
  
        lastScroll = currentScroll;
      });
    }
  
    // Smooth scroll to footer when clicking Contact
    const contactLink = document.querySelector('a[href="#contact"]');
    if (contactLink) {
      contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        const footer = document.querySelector('#contact');
        if (footer) footer.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
  
  /* =========================
     SLIDESHOW (from script.js)
     ========================= */
  // Keep slideIndex and functions on window so inline HTML can call them.
  (() => {
    let slideIndex = 1;
  
    function showSlides(n) {
      const slides = document.getElementsByClassName('mySlides');
      const dots = document.getElementsByClassName('dot');
      if (!slides || slides.length === 0) return;
  
      if (n > slides.length) slideIndex = 1;
      if (n < 1) slideIndex = slides.length;
  
      // Hide all slides
      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
      }
      // Deactivate all dots
      for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(' active', '');
      }
  
      // Show current slide & activate dot
      slides[slideIndex - 1].style.display = 'block';
      if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].className += ' active';
      }
    }
  
    function plusSlides(n) {
      showSlides((slideIndex += n));
    }
  
    function currentSlide(n) {
      showSlides((slideIndex = n));
    }
  
    // Expose for markup handlers: onclick="plusSlides(1)" etc.
    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;
  
    // Initialize when DOM ready
    document.addEventListener('DOMContentLoaded', () => {
      showSlides(slideIndex);
    });
  })();
  
  /* =========================
     OWL CAROUSEL inits (from script.js)
     ========================= */
  // Works whether you load jQuery via CDN or locally.
  // We guard for missing jQuery/owl to avoid runtime errors.
  (function initCarousels() {
    const ready = (fn) =>
      document.readyState !== 'loading'
        ? fn()
        : document.addEventListener('DOMContentLoaded', fn);
  
    ready(() => {
      if (typeof window.$ !== 'function' || !$.fn || !$.fn.owlCarousel) {
        // jQuery or Owl Carousel not present on this page; skip silently.
        return;
      }
  
      // .owl-carousel1
      if ($('.owl-carousel1').length) {
        $('.owl-carousel1').owlCarousel({
          margin: 20,
          loop: true,
          nav: true,
          dots: false,
          navText: [
            "<i class='fa fa-chevron-left'></i>",
            "<i class='fa fa-chevron-right'></i>",
          ],
          responsive: {
            0: { items: 1 },
            768: { items: 2 },
            992: { items: 2 },
          },
        });
      }
  
      // .owl-carousel2
      if ($('.owl-carousel2').length) {
        $('.owl-carousel2').owlCarousel({
          loop: true,
          margin: 0,
          nav: true,
          dots: false,
          autoplay: true,
          autoplayTimeout: 1000,
          autoplayHoverPause: true,
          navText: [
            "<i class='fa fa-chevron-left'></i>",
            "<i class='fa fa-chevron-right'></i>",
          ],
          responsive: {
            0: { items: 1 },
            600: { items: 3 },
            1000: { items: 5 },
          },
        });
      }
  
      // .owl-carousel3
      if ($('.owl-carousel3').length) {
        $('.owl-carousel3').owlCarousel({
          loop: true,
          margin: 0,
          dots: true,
          responsive: {
            0: { items: 1 },
            768: { items: 1 },
            1000: { items: 1 },
          },
        });
      }
    });
  })();
  