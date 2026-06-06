/* ==========================================================================
   GECM Consulting - Component Loader
   Loads reusable HTML components (header, footer) into the page.
   ========================================================================== */

class ComponentLoader {
  /**
   * Load an HTML component into a placeholder element.
   * @param {string} componentPath - Path to the component HTML file
   * @param {string} placeholderId - ID of the placeholder element
   */
  static async load(componentPath, placeholderId) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
      console.warn(`Placeholder #${placeholderId} not found.`);
      return;
    }

    try {
      const response = await fetch(componentPath);
      if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
      const html = await response.text();
      placeholder.innerHTML = html;
    } catch (error) {
      console.error(`Error loading component: ${error.message}`);
    }
  }

  /**
   * Load all page components.
   */
  static async loadAll() {
    await Promise.all([
      ComponentLoader.load('components/header.html', 'header-placeholder'),
      ComponentLoader.load('components/footer.html', 'footer-placeholder'),
    ]);

    // Initialize functionality after components are loaded
    HeaderController.init();
  }
}

/* ==========================================================================
   Header Controller
   ========================================================================== */

class HeaderController {
  static init() {
    const header = document.getElementById('main-header');
    const hamburger = document.getElementById('header-hamburger');
    const nav = document.getElementById('header-nav');

    if (!header || !hamburger || !nav) return;

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('header__nav--open');
      hamburger.classList.toggle('header__hamburger--active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on link click
    nav.querySelectorAll('.header__nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('header__nav--open');
        hamburger.classList.remove('header__hamburger--active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Scroll behavior - solid header on scroll
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.remove('header--transparent');
        header.classList.add('header--solid');
      } else {
        header.classList.remove('header--solid');
        header.classList.add('header--transparent');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run once on load

    // Active nav link based on scroll position
    HeaderController.initActiveNav();
  }

  static initActiveNav() {
    const navLinks = document.querySelectorAll('.header__nav-link');
    const currentPath = window.location.pathname;
    let currentPage = currentPath.split('/').pop().split('?')[0].split('#')[0];

    if (currentPage === '' || currentPage === '/') {
      currentPage = 'index.html';
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('header__nav-link--active');
      } else {
        link.classList.remove('header__nav-link--active');
      }
    });
  }
}

class AccordionController {
  static init() {
    const accordions = document.querySelectorAll('.accordion__item');
    if (!accordions.length) return;

    accordions.forEach(item => {
      const header = item.querySelector('.accordion__header');
      if (!header) return;

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('is-active');
        
        // Close all other accordions
        accordions.forEach(acc => {
          acc.classList.remove('is-active');
        });

        // Toggle current
        if (!isActive) {
          item.classList.add('is-active');
        }
      });
    });
  }
}

class StackedImagesController {
  static init() {
    const containers = document.querySelectorAll('.stacked-images');
    if (!containers.length) return;

    containers.forEach(container => {
      const images = Array.from(container.querySelectorAll('.stacked-image'));
      if (!images.length) return;

      // Initialize classes
      images.forEach((img, index) => {
        img.className = `stacked-image stacked-pos-${index}`;
      });

      container.addEventListener('click', () => {
        // Move the first element to the end of the array
        const first = images.shift();
        images.push(first);
        
        // Re-apply classes based on new array order
        images.forEach((img, index) => {
          img.className = `stacked-image stacked-pos-${index}`;
        });
      });
    });
  }
}

class TabsController {
  static init() {
    const tabsMenus = document.querySelectorAll('.metod-tabs-menu');
    if (!tabsMenus.length) return;

    tabsMenus.forEach(menu => {
      const buttons = menu.querySelectorAll('.metod-tab-btn');
      
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-target');
          const targetPanel = document.getElementById(targetId);
          
          if (!targetPanel) return;
          
          // Remove active class from all buttons and panels in this container
          const container = btn.closest('.metod-tabs-container');
          container.querySelectorAll('.metod-tab-btn').forEach(b => b.classList.remove('is-active'));
          container.querySelectorAll('.metod-tab-panel').forEach(p => p.classList.remove('is-active'));
          
          // Add active class to clicked button and target panel
          btn.classList.add('is-active');
          targetPanel.classList.add('is-active');
        });
      });
    });
  }
}

class ContactFormController {
  static init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const questionSpan = document.getElementById('captcha-question');
    const statusDiv = document.getElementById('contact-status');
    const submitBtn = document.getElementById('btn-submit-contact');
    
    if (!questionSpan || !statusDiv || !submitBtn) return;
    
    // Generate Captcha
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let expectedSum = num1 + num2;
    questionSpan.textContent = `${num1} + ${num2}`;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      formData.append('captcha_expected', expectedSum.toString());
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando...';
      statusDiv.style.display = 'none';
      statusDiv.className = '';

      try {
        const response = await fetch('enviar_correo.php', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        statusDiv.style.display = 'block';
        if (response.ok) {
          statusDiv.style.color = '#15803d'; // Green
          statusDiv.textContent = result.message;
          form.reset();
          // Reset captcha
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          expectedSum = num1 + num2;
          questionSpan.textContent = `${num1} + ${num2}`;
        } else {
          statusDiv.style.color = '#b91c1c'; // Red
          statusDiv.textContent = result.message;
        }
      } catch (error) {
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#b91c1c';
        statusDiv.textContent = 'Ocurrió un error al enviar el formulario. Intenta nuevamente.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          Enviar Mensaje
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        `;
      }
    });
  }
}

class LightboxController {
  static init() {
    const images = document.querySelectorAll('.metod-tab-img');
    if (!images.length) return;

    // Create lightbox HTML
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Cerrar">&times;</button>
        <img class="lightbox-img" src="" alt="Ampliada">
        <div class="lightbox-hint">Haz clic derecho en la imagen para guardarla / descargarla.</div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    const closeLightbox = () => {
      lightbox.classList.remove('is-active');
      setTimeout(() => { lightboxImg.src = ''; }, 300); // clear after fade out
    };

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === closeBtn) {
        closeLightbox();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
        closeLightbox();
      }
    });

    images.forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-active');
      });
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ComponentLoader.loadAll();
  AccordionController.init();
  StackedImagesController.init();
  TabsController.init();
  ContactFormController.init();
  LightboxController.init();
});
