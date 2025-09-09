document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("starfieldCanvas");
  const ctx = canvas.getContext("2d");

  let stars = [];
  let shootingStars = [];
  let mouse = {
    x: undefined,
    y: undefined,
    trail: [] 
  };
  let scrollY = 0;

  const config = {
    starCount: 150,
    mouseRadius: 120,
    lineDistance: 120,
    starColors: [
      "255, 255, 255",
      "255, 200, 200", 
      "200, 200, 255",
      "255, 255, 200",
      "200, 255, 200"
    ],
    lineColor: "rgba(255, 255, 255, 0.0)",
    parallaxFactor: 0.1,
    maxShootingStars: 10,
    targetFPS: 30
  };

  // --- EVENT LISTENERS ---
  function setupListeners() {
    window.addEventListener("resize", resizeCanvas);
    
    window.addEventListener("mousemove", (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
      
      // NEW: Add to mouse trail
      mouse.trail.push({ 
        x: event.x, 
        y: event.y, 
        life: 1,
        time: Date.now()
      });
      if (mouse.trail.length > 15) {
        mouse.trail.shift();
      }
    });
    
    window.addEventListener("mouseout", () => {
      mouse.x = undefined;
      mouse.y = undefined;
    });
    
    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
    });

    // NEW: Touch support
    window.addEventListener("touchmove", (event) => {
      if (event.touches[0]) {
        const touch = event.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
        
        mouse.trail.push({ 
          x: touch.clientX, 
          y: touch.clientY, 
          life: 1,
          time: Date.now()
        });
        if (mouse.trail.length > 15) {
          mouse.trail.shift();
        }
      }
    });
  }

  // --- ENHANCED STAR CLASS ---
  class Star {
    constructor(x, y, dx, dy, radius) {
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.radius = radius;
      // Enhanced twinkling properties
      this.opacity = Math.random() * 0.6 + 0.2;
      this.twinkleSpeed = (Math.random() - 0.5) * 0.02;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.01;
      // NEW: Random color for each star
      this.color = config.starColors[Math.floor(Math.random() * config.starColors.length)];
    }

    draw(parallaxOffset) {
      const y = this.y - parallaxOffset;
      
      // Enhanced twinkling with pulse effect
      const pulseEffect = Math.sin(this.pulse) * 0.3 + 0.7;
      const finalOpacity = this.opacity * pulseEffect;
      
      // NEW: Add glow effect
      ctx.shadowColor = `rgba(${this.color}, ${finalOpacity * 0.5})`;
      ctx.shadowBlur = this.radius * 2;
      
      ctx.beginPath();
      ctx.arc(this.x, y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = `rgba(${this.color}, ${finalOpacity})`;
      ctx.fill();
      
      // NEW: Bright center
      ctx.beginPath();
      ctx.arc(this.x, y, this.radius * 0.4, 0, Math.PI * 2, false);
      ctx.fillStyle = `rgba(${this.color}, ${Math.min(finalOpacity * 1.8, 1)})`;
      ctx.fill();
      
      ctx.shadowBlur = 0;
    }

    update(parallaxOffset) {
      // Smoother boundary collision
      if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
        this.dx = -this.dx * 0.9;
      }

      this.x += this.dx;
      this.y += this.dy;
      
      // Enhanced twinkling
      this.opacity += this.twinkleSpeed;
      if (this.opacity <= 0.1 || this.opacity >= 0.8) {
        this.twinkleSpeed = -this.twinkleSpeed;
      }
      
      // NEW: Update pulse animation
      this.pulse += this.pulseSpeed;

      // Infinite wrapping logic
      const renderedY = this.y - parallaxOffset;
      if (renderedY > canvas.height + this.radius) {
        this.y -= (canvas.height + this.radius * 2);
      } else if (renderedY < -this.radius) {
        this.y += (canvas.height + this.radius * 2);
      }
    }
  }

  // --- ENHANCED SHOOTING STAR CLASS ---
  class ShootingStar {
    constructor() {
      this.trail = []; // NEW: Trail effect
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -50;
      this.radius = Math.random() * 2.5 + 1;
      this.speed = Math.random() * 6 + 8;
      this.angle = Math.random() * Math.PI / 4 + Math.PI / 6;
      this.dx = Math.cos(this.angle) * this.speed;
      this.dy = Math.sin(this.angle) * this.speed;
      this.opacity = 1;
      this.fadeSpeed = 0.08;
      this.life = 1;
      this.trail = [];
    }

    draw(parallaxOffset) {
      const y = this.y - parallaxOffset;
      
      // NEW: Draw glowing trail
      for (let i = 0; i < this.trail.length; i++) {
        const point = this.trail[i];
        const trailY = point.y - parallaxOffset;
        const trailOpacity = (point.life / this.trail.length) * this.opacity * 0.1;
        
        if (trailOpacity > 0) {
          ctx.shadowColor = `rgba(255, 255, 255, ${trailOpacity})`;
          ctx.shadowBlur = 8;
          
          ctx.beginPath();
          ctx.arc(point.x, trailY, this.radius * point.life * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${trailOpacity})`;
          ctx.fill();
        }
      }
      
      // Main shooting star with enhanced glow
      if (this.opacity > 0) {
        ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.arc(this.x, y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    }

    update(parallaxOffset) {
      // NEW: Update trail
      this.trail.push({ x: this.x, y: this.y, life: 1 });
      if (this.trail.length > 12) {
        this.trail.shift();
      }
      
      // Update trail life
      this.trail.forEach(point => point.life -= 0.08);
      
      this.x += this.dx;
      this.y += this.dy;
      this.opacity -= this.fadeSpeed;
      this.life -= 0.008;
    }

    isActive() {
      return this.opacity > 0 && this.life > 0 && 
             this.x < canvas.width + 100 && this.y < canvas.height + 100;
    }
  }

  // --- NEW: MOUSE TRAIL FUNCTIONS ---
  function updateMouseTrail() {
    const currentTime = Date.now();
    mouse.trail = mouse.trail.filter(point => {
      const age = currentTime - point.time;
      point.life = Math.max(0, 1 - age / 800); // 800ms lifetime
      return point.life > 0;
    });
  }

  function drawMouseTrail() {
    if (mouse.trail.length < 2) return;
    
    // Draw smooth trail curve
    for (let i = 1; i < mouse.trail.length; i++) {
      const current = mouse.trail[i];
      const previous = mouse.trail[i - 1];
      
      const opacity = current.life * 0.4;
      const width = current.life * 3;
      
      if (opacity > 0) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }
    }
  }

  // --- NEW: CREATE SHOOTING STARS ---
  function createShootingStar() {
    if (shootingStars.length < config.maxShootingStars && Math.random() < 0.002) {
      shootingStars.push(new ShootingStar());
    }
  }

  // --- CORE FUNCTIONS ---
  function init() {
    stars = [];
    shootingStars = [];
    const starCount = Math.min(config.starCount, (canvas.width * canvas.height) / 6000);
    
    for (let i = 0; i < starCount; i++) {
      let radius = Math.random() * 1.8 + 0.4;
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      let dx = (Math.random() - 0.5) * 0.25;
      let dy = (Math.random() - 0.5) * 0.35;
      stars.push(new Star(x, y, dx, dy, radius));
    }
  }

  function connect(parallaxOffset) {
    for (let i = 0; i < stars.length; i++) {
      const starI_Y = stars[i].y - parallaxOffset;

      // Connect nearby stars with enhanced effects
      for (let j = i + 1; j < stars.length; j++) {
        const starJ_Y = stars[j].y - parallaxOffset;
        let distance = Math.hypot(stars[i].x - stars[j].x, starI_Y - starJ_Y);

        if (distance < config.lineDistance) {
          const opacity = (1 - distance / config.lineDistance) * 0.3;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.3;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, starI_Y);
          ctx.lineTo(stars[j].x, starJ_Y);
          ctx.stroke();
        }
      }

      // NEW: Enhanced mouse interaction
      if (mouse.x !== undefined && mouse.y !== undefined) {
        let mouseDistance = Math.hypot(stars[i].x - mouse.x, starI_Y - mouse.y);
        if (mouseDistance < config.mouseRadius) {
          const opacity = (1 - mouseDistance / config.mouseRadius) * 0.8;
          const hue = (mouseDistance / config.mouseRadius) * 80 + 180; // Blue to cyan
          
          // Enhanced connection line
          ctx.strokeStyle = `hsla(${hue}, 60%, 80%, ${opacity})`;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = `hsla(${hue}, 60%, 80%, ${opacity * 0.5})`;
          ctx.shadowBlur = 5;
          
          ctx.beginPath();
          ctx.moveTo(stars[i].x, starI_Y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    
    ctx.fillStyle = "rgba(0, 0, 0, .25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const parallaxOffset = scrollY * config.parallaxFactor;

    // Update and draw stars
    stars.forEach(star => {
      star.update(parallaxOffset);
      star.draw(parallaxOffset);
    });

    // NEW: Create and manage shooting stars
    createShootingStar();
    shootingStars = shootingStars.filter(shootingStar => {
      shootingStar.update(parallaxOffset);
      shootingStar.draw(parallaxOffset);
      return shootingStar.isActive();
    });

    // Draw connections
    connect(parallaxOffset);
    
    // NEW: Update and draw mouse trail
    updateMouseTrail();
    drawMouseTrail();
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
  }

  // --- START ---
  setupListeners();
  resizeCanvas();
  animate();
});
