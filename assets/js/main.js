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
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.header__nav-link[data-nav]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
              link.classList.toggle(
                'header__nav-link--active',
                link.dataset.nav === id
              );
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
    );

    sections.forEach(section => observer.observe(section));
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ComponentLoader.loadAll();
  AccordionController.init();
  StackedImagesController.init();
  TabsController.init();
});
