// Optimized Client-side i18n initialization
(function() {
  'use strict';

  // Performance optimizations
  const cache = new Map();
  let countriesLoaded = false;
  let isUpdating = false;
  
  // Add CSS for smooth transitions (non-blocking)
  const style = document.createElement('style');
  style.textContent = `
    html {
      transition: opacity 0.15s ease-in-out;
    }
    html.i18n-updating {
      opacity: 0.8;
    }
  `;
  document.head.appendChild(style);
  
  // Initialize i18next with optimizations
  i18next
    .use(i18nextHttpBackend)
    .init({
      lng: localStorage.getItem('language') || 'fr',
      fallbackLng: 'fr',
      debug: false,
      backend: {
        loadPath: '/locales/{{lng}}/translation.json'
      },
      // Performance settings
      load: 'languageOnly',
        lowerCaseLng: false,
        cleanCode: false,
        ns: ['translation'],
        defaultNS: 'translation',
        keySeparator: '.',
        nsSeparator: ':',
        pluralSeparator: '_',
        contextSeparator: '_',
        interpolation: {
          escapeValue: false,
          prefix: '{{',
          suffix: '}}'
        }
    }, function(err, t) {
      if (err) {
        console.error('i18next initialization error:', err);
        return;
      }
      
      // Update content immediately after load
      updateContent();
    });

  // Optimized function to update translatable content
  function updateContent() {
    if (isUpdating) return;
    isUpdating = true;
    
    // Add subtle updating indicator
    document.documentElement.classList.add('i18n-updating');
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      // Batch DOM updates
      const fragment = document.createDocumentFragment();
      
      // Update elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(function(element) {
        const key = element.getAttribute('data-i18n');
        if (!key) return;
        
        // Use cache for translation lookups
        let translation = cache.get(key);
        if (!translation) {
          translation = i18next.t(key);
          cache.set(key, translation);
        }
        
        // Handle special attribute syntax
        if (key.startsWith('[')) {
          const match = key.match(/\[([^\]]+)\](.+)/);
          if (match) {
            const attr = match[1];
            const translationKey = match[2];
            const cachedTranslation = cache.get(translationKey) || i18next.t(translationKey);
            cache.set(translationKey, cachedTranslation);
            element.setAttribute(attr, cachedTranslation);
            return;
          }
        }
        
        // Update element content based on type
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          if (element.hasAttribute('placeholder')) {
            element.placeholder = translation;
          } else {
            element.value = translation;
          }
        } else if (element.tagName === 'OPTION') {
          element.textContent = translation;
        } else {
          element.textContent = translation;
        }
      });

      // Update elements with data-i18n-html attribute
      document.querySelectorAll('[data-i18n-html]').forEach(function(element) {
        const key = element.getAttribute('data-i18n-html');
        if (!key) return;
        
        let translation = cache.get(key);
        if (!translation) {
          translation = i18next.t(key);
          cache.set(key, translation);
        }
        element.innerHTML = translation;
      });

      // Update language selector
      updateLanguageSelector();
      
      // Remove updating indicator
      document.documentElement.classList.remove('i18n-updating');
      isUpdating = false;
    });
  }
  
  // Separate function for language selector update
  function updateLanguageSelector() {
    const languageButtons = document.querySelectorAll('.language-chip');
    if (languageButtons.length) {
      languageButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === i18next.language);
      });
    }
  }

  // Lazy load countries when needed
  async function loadCountries() {
    if (countriesLoaded) return;
    
    try {
      const lang = i18next.language;
      const response = await fetch(`/locales/${lang}/countries.json`);
      const countries = await response.json();
      
      // Add countries to i18next resources
      i18next.addResourceBundle(lang, 'translation', { countries }, true, true);
      countriesLoaded = true;
      
      // Update any country selectors
      updateCountrySelectors();
    } catch (err) {
      console.warn('Failed to load countries:', err);
    }
  }
  
  // Update country selectors when countries are loaded
  function updateCountrySelectors() {
    document.querySelectorAll('select[data-country-select]').forEach(select => {
      // Clear existing options except the first one
      while (select.children.length > 1) {
        select.removeChild(select.lastChild);
      }
      
      // Add country options
      Object.entries(i18next.t('countries', { returnObjects: true })).forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        select.appendChild(option);
      });
    });
  }

  // Optimized language change handler
  function changeLanguage(lng) {
    if (lng === i18next.language) return;
    
    i18next.changeLanguage(lng, function(err, t) {
      if (err) {
        console.error('Language change error:', err);
        return;
      }
      
      // Save preference
      localStorage.setItem('language', lng);
      
      // Clear cache for new language
      cache.clear();
      countriesLoaded = false;
      
      // Reload countries if needed
      if (document.querySelector('select[data-country-select]')) {
        loadCountries();
      }
      
      // Update content
      updateContent();
    });
  }

  // Set up language selector with event delegation
  document.addEventListener('click', function(e) {
    const button = e.target.closest('.language-chip');
    if (button) {
      const lang = button.getAttribute('data-lang');
      if (lang) {
        changeLanguage(lang);
      }
    }
  });
  
  // Load countries when country selector is focused
  document.addEventListener('focus', function(e) {
    if (e.target.matches('select[data-country-select]')) {
      loadCountries();
    }
  }, true);

  // Expose functions globally
  window.changeLanguage = changeLanguage;
  window.updateContent = updateContent;
  window.loadCountries = loadCountries;
})();
