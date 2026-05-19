/* MAIN APP INITIALIZATION & UI INTERACTIVITY - KIMCHI FOOD */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Cart state on load
    if (typeof updateCart === 'function') {
        updateCart();
    }
    
    // 2. Render Unified Store Catalog
    renderStoreCatalog('todos');
    
    // 3. Setup Scroll Handlers (Sticky nav & active sections highlight)
    setupScrollEffects();
    
    // 4. Setup Mobile Navigation Drawer
    setupMobileNav();
    
    // 5. Setup Hero Promos Slider Carousel
    setupHeroSlider();
    
    // 6. Setup general modal closing handlers
    setupOverlayClicks();
    
    // 7. Setup Contact Form submission mock
    setupContactForm();
});

// Render the active store items on "Tienda" section
function renderStoreCatalog(categoryFilter = 'todos') {
    const storeGrid = document.getElementById('storeGrid');
    if (!storeGrid) return;
    
    storeGrid.innerHTML = '';
    
    // Filter database based on selected category
    const filteredData = categoryFilter === 'todos' 
        ? MENU_DATA 
        : MENU_DATA.filter(item => item.category === categoryFilter);
        
    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <div class="food-card-img-container">
                <span class="food-badge">${item.badge}</span>
                <img src="${item.image}" alt="${item.name}" class="food-card-img" loading="lazy">
            </div>
            <div class="food-card-content">
                <span class="food-card-category">${item.category === 'pote' ? 'Pote Artesanal' : item.category}</span>
                <h3 class="food-card-title">${item.name}</h3>
                <p class="food-card-desc">${item.description}</p>
                <div class="food-card-footer">
                    <span class="food-card-price">${formatGuarani(item.price)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart('${item.id}')" title="Añadir al carrito">
                        <i class="fas fa-plus"></i> Añadir
                    </button>
                </div>
            </div>
        `;
        storeGrid.appendChild(card);
    });
}

// Wire visual filter buttons on "Tienda" section
function filterStore(category, btn) {
    // Toggle active classes on filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => button.classList.remove('active'));
    btn.classList.add('active');
    
    // Render
    renderStoreCatalog(category);
}

// Setup Scroll Handlers (Header scrolling styling & highlighters)
function setupScrollEffects() {
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // 1. Optimized Sticky Header Scroll (Passive Event Listener + Throttled via requestAnimationFrame)
    let lastScrollY = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (lastScrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // 2. High-performance Active Section Tracker (Intersection Observer)
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '-120px 0px -60% 0px', // Matches the original -120 offset perfectly
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);
        
        sections.forEach(section => observer.observe(section));
    } else {
        // Fallback for older browsers: simple debounced scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                let currentSectionId = '';
                const scrollPos = window.scrollY + 120;
                sections.forEach(section => {
                    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.clientHeight) {
                        currentSectionId = section.getAttribute('id');
                    }
                });
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });
            }, 100);
        }, { passive: true });
    }
}

// Mobile navigation toggle menu burger actions
function setupMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Automatic Hero Slider controls for promotions
function setupHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds
    
    // Build navigation dots dynamically
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.slider-dot');
    
    function goToSlide(idx) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = idx;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }
    
    // Loop
    setInterval(nextSlide, slideInterval);
}

// Close Drawers & Modals on backdrop click
function setupOverlayClicks() {
    const overlay = document.getElementById('bodyOverlay');
    
    overlay.addEventListener('click', () => {
        if (typeof closeCartDrawer === 'function') closeCartDrawer();
        if (typeof closeCheckoutModal === 'function') closeCheckoutModal();
        overlay.classList.remove('open');
    });
}

// General contact form submit helper
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        
        showToast(`¡Muchas gracias ${name}! Tu consulta ha sido recibida.`, 'success');
        form.reset();
    });
}
