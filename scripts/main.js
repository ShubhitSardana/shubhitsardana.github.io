/**
 * Shubhit Sardana Portfolio - Main JavaScript
 * Subtle, elegant interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSiderealClock();
    initTypewriter();
    initLightbox();
    initColorPicker();
    initSectionNav();
});

/* =========================================
   NAVIGATION
   ========================================= */
function initNavigation() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    mobileBtn?.addEventListener('click', () => {
        navLinks?.classList.toggle('open');
        const icon = mobileBtn.querySelector('i');
        icon.className = navLinks?.classList.contains('open')
            ? 'fa-solid fa-xmark'
            : 'fa-solid fa-bars';
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        const scrollY = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();

    // Close mobile menu on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks?.classList.remove('open');
            const icon = mobileBtn?.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        });
    });
}

/* =========================================
   SIDEREAL TIME CLOCK
   ========================================= */
function initSiderealClock() {
    const clockEl = document.getElementById('siderealClock');
    if (!clockEl) return;

    // IISER Bhopal longitude
    const longitude = 77.2729;

    function updateClock() {
        const now = new Date();
        const jd = getJulianDate(now);
        const gmst = getGMST(jd);
        const lst = (gmst + longitude / 15) % 24;

        const hours = Math.floor(lst);
        const mins = Math.floor((lst - hours) * 60);
        const secs = Math.floor(((lst - hours) * 60 - mins) * 60);

        clockEl.textContent = `LST: ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }

    function getJulianDate(date) {
        return date.getTime() / 86400000 + 2440587.5;
    }

    function getGMST(jd) {
        const T = (jd - 2451545.0) / 36525;
        let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * (0.000387933 - T / 38710000);
        gmst = ((gmst % 360) + 360) % 360;
        return gmst / 15;
    }

    function pad(n) {
        return n.toString().padStart(2, '0');
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* =========================================
   TYPEWRITER EFFECT
   ========================================= */
function initTypewriter() {
    const element = document.getElementById('typewriter-text');
    if (!element) return;

    const titles = [
        'Gravitational Waves',
        'Pulsar Timing Arrays',
        'Cosmology',
        'BS-MS Student @ IISER Bhopal',
        'InPTA Collaborator'
    ];

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
        const currentTitle = titles[titleIndex];

        if (isPaused) {
            isPaused = false;
            setTimeout(type, 1500);
            return;
        }

        if (!isDeleting) {
            element.textContent = currentTitle.substring(0, charIndex);
            charIndex++;

            if (charIndex > currentTitle.length) {
                isDeleting = true;
                isPaused = true;
            }
        } else {
            element.textContent = currentTitle.substring(0, charIndex);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                titleIndex = (titleIndex + 1) % titles.length;
            }
        }

        const speed = isDeleting ? 40 : 80;
        setTimeout(type, speed);
    }

    type();
}

/* =========================================
   PHOTO LIGHTBOX
   ========================================= */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!lightbox || !lightboxImage) return;

    let currentGallery = [];
    let currentIndex = 0;

    // Click handlers for photo thumbnails
    document.querySelectorAll('.photo-gallery').forEach(gallery => {
        const thumbs = gallery.querySelectorAll('.photo-thumb');

        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                // Collect real paths from data-src — NO images have loaded yet
                currentGallery = Array.from(thumbs).map(t => t.querySelector('img').dataset.src);
                currentIndex = index;
                openLightbox();
            });
        });
    });

    function openLightbox() {
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // Clear src so memory is released when closed
        setTimeout(() => { lightboxImage.src = ''; }, 300);
    }

    function updateLightboxImage() {
        // Show spinner while loading
        lightboxImage.style.opacity = '0';
        lightboxImage.onload = () => {
            lightboxImage.style.opacity = '1';
        };
        // This is the ONLY moment the full image is fetched
        lightboxImage.src = currentGallery[currentIndex];
        lightboxCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        updateLightboxImage();
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        updateLightboxImage();
    }

    // Event listeners
    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', prevImage);
    nextBtn?.addEventListener('click', nextImage);

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-container')) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    });

    // Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextImage();
            } else {
                prevImage();
            }
        }
    }
}

/* =========================================
   COLOR THEME PICKER
   ========================================= */
function initColorPicker() {
    const dots = document.querySelectorAll('.color-dot');
    if (!dots.length) return;

    // Toggle open/close
    const picker = document.getElementById('colorPicker');
    const toggleBtn = document.getElementById('colorPickerToggle');
    toggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        picker?.classList.toggle('is-open');
    });
    // Close when clicking outside
    document.addEventListener('click', () => picker?.classList.remove('is-open'));

    // Load saved accent
    const saved = localStorage.getItem('accent-color') || 'cyan';
    applyAccent(saved);

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const accent = dot.dataset.accent;
            applyAccent(accent);
            localStorage.setItem('accent-color', accent);
        });
    });

    function applyAccent(accent) {
        if (accent === 'cyan') {
            document.body.removeAttribute('data-accent');
        } else {
            document.body.setAttribute('data-accent', accent);
        }
        dots.forEach(d => d.classList.toggle('active', d.dataset.accent === accent));
    }
}

/* =========================================
   SECTION NAVIGATION (UP / DOWN)
   ========================================= */
function initSectionNav() {
    const upBtn = document.getElementById('sectionUp');
    const downBtn = document.getElementById('sectionDown');
    if (!upBtn || !downBtn) return;

    const sections = Array.from(document.querySelectorAll('section[id]'));

    function getCurrentIndex() {
        const scrollY = window.scrollY + window.innerHeight / 3;
        for (let i = sections.length - 1; i >= 0; i--) {
            if (scrollY >= sections[i].offsetTop) return i;
        }
        return 0;
    }

    function isAtBottom() {
        return (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 10;
    }

    function updateButtons() {
        const idx = getCurrentIndex();
        upBtn.disabled = idx === 0;
        downBtn.disabled = isAtBottom();
    }

    upBtn.addEventListener('click', () => {
        const idx = getCurrentIndex();
        if (idx > 0) {
            sections[idx - 1].scrollIntoView({ behavior: 'smooth' });
        }
    });

    downBtn.addEventListener('click', () => {
        const idx = getCurrentIndex();
        if (idx < sections.length - 1) {
            sections[idx + 1].scrollIntoView({ behavior: 'smooth' });
        } else {
            // Last section: scroll to page bottom to show footer
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });

    window.addEventListener('scroll', updateButtons, { passive: true });
    updateButtons();
}

/* =========================================
   SMOOTH REVEAL ANIMATION
   ========================================= */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all glass cards
document.querySelectorAll('.glass').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});