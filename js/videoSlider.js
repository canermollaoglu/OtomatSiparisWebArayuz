document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.video-slide');
  let currentSlide = 0;

  // Function to start all videos
  function startVideos() {
    slides.forEach(slide => {
      const video = slide.querySelector('video');
      if (video) {
        // Set video properties
        video.muted = true;
        video.loop = true;
        video.playsinline = true;
        
        // Load and play the video
        video.load();
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Auto-play was prevented:", error);
          });
        }
      }
    });
  }

  function nextSlide() {
    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    
    // Move to next slide
    currentSlide = (currentSlide + 1) % slides.length;
    
    // Add active class to new slide
    slides[currentSlide].classList.add('active');
  }

  // Start all videos
  startVideos();

  // Set first slide as active
  slides[0].classList.add('active');

  // Change slide every 8 seconds
  setInterval(nextSlide, 8000);
});