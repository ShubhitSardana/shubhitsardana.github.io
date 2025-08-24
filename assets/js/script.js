function initializeSlideshows() {
  document.querySelectorAll(".slideshow-container").forEach((container) => {
    const slidesWrapper = container.querySelector(".slides-wrapper");
    const slides = container.querySelectorAll(".slide");
    const prevBtn = container.querySelector(".prev-btn");
    const nextBtn = container.querySelector(".next-btn");
    const dotsContainer = container.querySelector(".dots-container");
    
    if (slides.length === 0) return;

    let currentIndex = 0;
    let intervalId = null;

    // --- Create Navigation Dots ---
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      dot.addEventListener("click", () => {
        goToSlide(i);
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.querySelectorAll(".dot");

    // --- Core Function to Move Slides ---
    function goToSlide(index) {
      // Loop around if index is out of bounds
      if (index < 0) {
        currentIndex = slides.length - 1;
      } else if (index >= slides.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      // Move the wrapper
      slidesWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update active dot
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
      });
    }

    // --- Timer Logic ---
    function startTimer() {
      intervalId = setInterval(() => goToSlide(currentIndex + 1), 5000);
    }

    function resetTimer() {
      clearInterval(intervalId);
      startTimer();
    }

    // --- Event Listeners ---
    nextBtn.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
      resetTimer();
    });

    prevBtn.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
      resetTimer();
    });
    
    // Also reset timer if user swipes (on touch devices)
    // This requires a more complex implementation, but the buttons/dots cover interaction.

    // --- Initialize ---
    goToSlide(0); // Start at the first slide
    startTimer(); // Start the automatic slideshow
  });
}

// --- VIDEO HOVER SCRIPT WITH PAUSE AND RESET ---
function initializeVideoHovers() {
  const researchCards = document.querySelectorAll(".research-card");

  researchCards.forEach((card) => {
    const video = card.querySelector(".hover-video");

    if (video) {
      card.addEventListener("mouseenter", () => {
        video.play();
      });

      card.addEventListener("mouseleave", () => {
        video.pause();
        // ✅ ADDED: This line resets the video to the very beginning.
        video.currentTime = 0; 
      });
    }
  });
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", initializeVideoHovers);


// --- NAVBAR ACTIVE STATE ON SCROLL ---
function initializeActiveNav() {
  const sections = document.querySelectorAll("section[id]"); // Assumes your sections have IDs
  const navLinks = document.querySelectorAll(".nav-link");

  if (sections.length === 0 || navLinks.length === 0) return;

  const observerOptions = {
    root: null, // observes intersections in the viewport
    rootMargin: "-50% 0px -50% 0px", // triggers when the middle of the section is in the middle of the viewport
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Find the link that corresponds to the intersecting section
      const id = entry.target.getAttribute("id");
      const correspondingLink = document.querySelector(`.nav-link[href="#${id}"]`);

      if (entry.isIntersecting) {
        // Remove 'active' from all links first
        navLinks.forEach((link) => link.classList.remove("active"));
        // Then add 'active' to the correct one
        if (correspondingLink) {
          correspondingLink.classList.add("active");
        }
      }
    });
  }, observerOptions);

  // Observe each section
  sections.forEach((section) => {
    observer.observe(section);
  });
}

// Run this function when the DOM is ready
document.addEventListener("DOMContentLoaded", initializeActiveNav);