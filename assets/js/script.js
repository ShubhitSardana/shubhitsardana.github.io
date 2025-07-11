document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".slideshow-container").forEach((container) => {
    const slides = container.querySelectorAll(".slide");
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

    showSlide(index);
    setInterval(nextSlide, 5000);
  });
});

const videos = document.querySelectorAll(".hover-video");

videos.forEach((video) => {
  let reverseInterval;

  const playForward = () => {
    clearInterval(reverseInterval);
    video.currentTime = 0;
    video.play();
  };

  video.addEventListener("mouseenter", playForward);
  video.addEventListener("mouseleave", video.pause());
});
