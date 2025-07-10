    document.querySelectorAll('.slideshow-container').forEach(container => {
      const slides = container.querySelectorAll('.slide');
      let index = 0;

      function showSlide(i) {
        slides.forEach((img, j) => {
          img.style.opacity = (i === j) ? 1 : 0;
        });
      }

      function nextSlide() {
        index = (index + 1) % slides.length;
        showSlide(index);
      }

      // Initial display
      showSlide(index);
      setInterval(nextSlide, 5000); // 5s per slide
    });

const videos = document.querySelectorAll('.hover-video');

videos.forEach(video => {
  let reverseInterval;

  const playForward = () => {
    clearInterval(reverseInterval);
    video.currentTime = 0;
    video.play();
  };

  const reversePlay = () => {
    video.pause();
    reverseInterval = setInterval(() => {
      if (video.currentTime <= 0.1) {
        clearInterval(reverseInterval);
        video.currentTime = 0;
      } else {
        video.currentTime -= 0.033;
      }
    }, 30);
  };

  // Desktop hover
  video.addEventListener('mouseenter', playForward);
  video.addEventListener('mouseleave', reversePlay);

  // Mobile touch
  video.addEventListener('touchstart', playForward);
  video.addEventListener('touchend', reversePlay);
});


