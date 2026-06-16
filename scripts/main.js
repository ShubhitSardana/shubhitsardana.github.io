document.addEventListener("DOMContentLoaded", () => {
  
  // 1. PERFORMANCE DRIVEN SCROLL REVEAL (Intersection Observer)
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");
  const dotIndicators = document.querySelectorAll(".color-dot");
  
  // Elements to apply fade-in transition logic
  const targetElements = document.querySelectorAll(".section-header, .glass, .timeline-item, .hero-content, .hero-visual");
  targetElements.forEach(el => el.classList.add("reveal"));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Unobserve right away to save processes
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

  targetElements.forEach(el => revealObserver.observe(el));


  // 2. ACTIVE NAVIGATION TRACKER (Syncs header links & desktop side dots)
  const trackObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        
        // Header Nav Links sync
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });

        // Desktop Right Dots sync
        dotIndicators.forEach((dot, index) => {
          // Cross references section arrangement to sync dot states
          const correspondingSection = sections[index];
          if (correspondingSection && correspondingSection.getAttribute("id") === id) {
            document.querySelector(".color-dot.active")?.classList.remove("active");
            dot.classList.add("active");
          }
        });
      }
    });
  }, { threshold: 0.3 }); // Triggers cleanly when 30% of section enters viewport

  sections.forEach(section => trackObserver.observe(section));


  // 3. MOBILE MENU BAR EXPANSION
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinksList = document.getElementById("navLinks");

  if (mobileMenuBtn && navLinksList) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinksList.classList.toggle("active");
      
      // Swapping icon shapes elegantly
      const icon = mobileMenuBtn.querySelector("i");
      if (icon.classList.contains("fa-bars")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
      } else {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    });

    // Close mobile side container if clicked outside area
    document.addEventListener("click", () => {
      navLinksList.classList.remove("active");
      const icon = mobileMenuBtn.querySelector("i");
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
    });
  }


  // 4. SIDEREAL CLOCK ENGINE (UTC Display Tracker)
  const clockElement = document.getElementById("siderealClock");
  if (clockElement) {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      clockElement.innerText = `LST: ${h}:${m}:${s}`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }


  // 5. LIGHTWEIGHT TYPEWRITER ENGINE
  const typewriterStrings = [
    "Observational Cosmologist", 
    "Gravitational Wave Researcher", 
    "Pulsar Timing Array Member"
  ];
  const textContainer = document.getElementById("typewriter-text");
  
  if (textContainer) {
    let loopIdx = 0;
    let charIdx = 0;
    let deleting = false;

    const handleTyping = () => {
      const fullText = typewriterStrings[loopIdx];
      
      if (deleting) {
        textContainer.innerText = fullText.substring(0, charIdx - 1);
        charIdx--;
      } else {
        textContainer.innerText = fullText.substring(0, charIdx + 1);
        charIdx++;
      }

      let spacingDelay = deleting ? 40 : 80;

      if (!deleting && charIdx === fullText.length) {
        spacingDelay = 2200; // Freeze string view window duration
        deleting = true;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        loopIdx = (loopIdx + 1) % typewriterStrings.length;
        spacingDelay = 400; // Interval window ahead of next text sequence
      }

      setTimeout(handleTyping, spacingDelay);
    };
    
    // Inject custom structural cursor tracking node
    const cursor = document.createElement("span");
    cursor.className = "typewriter-cursor";
    cursor.innerText = "|";
    textContainer.parentNode.appendChild(cursor);
    
    handleTyping();
  }


  // 6. VERTICAL BAR DIRECTIONAL STEPPERS (Up/Down Buttons)
  const btnUp = document.getElementById("sectionUp");
  const btnDown = document.getElementById("sectionDown");

  const getActiveSectionIndex = () => {
    let currentIdx = 0;
    sections.forEach((sec, idx) => {
      const bounds = sec.getBoundingClientRect();
      if (bounds.top <= window.innerHeight / 2 && bounds.bottom >= window.innerHeight / 2) {
        currentIdx = idx;
      }
    });
    return currentIdx;
  };

  btnUp?.addEventListener("click", () => {
    const activeIdx = getActiveSectionIndex();
    if (activeIdx > 0) {
      sections[activeIdx - 1].scrollIntoView({ behavior: "smooth" });
    }
  });

  btnDown?.addEventListener("click", () => {
    const activeIdx = getActiveSectionIndex();
    if (activeIdx < sections.length - 1) {
      sections[activeIdx + 1].scrollIntoView({ behavior: "smooth" });
    }
  });
});