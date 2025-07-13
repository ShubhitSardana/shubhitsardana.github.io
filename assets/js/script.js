function initializeSlideshows() {
  document.querySelectorAll(".slideshow-container").forEach((container) => {
    const slides = container.querySelectorAll(".slide");
    if (slides.length === 0) return;
    let index = 0;

    function showSlide(i) {
      slides.forEach((img, j) => {
        img.style.opacity = i === j ? 1 : 0;
      });
    }

    function nextSlide() {
      index = (index + 1) % slides.length;
      showSlide(index);
    }

    container.addEventListener("click", nextSlide);
    showSlide(index);
    setInterval(nextSlide, 5000);
  });
}

function initializeVideoHovers() {
  const videos = document.querySelectorAll(".hover-video");
  videos.forEach((video) => {
    video.addEventListener("mouseenter", () => video.play());
    video.addEventListener("mouseleave", () => video.pause());
  });
}
