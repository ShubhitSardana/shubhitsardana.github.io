/* =========================================
   VISUALIZATIONS.JS
   Starfield, Gravitational Waves, Nebula Effects
   ========================================= */

class StarfieldVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.warpSpeed = false;
        this.speed = 0.5;
        // Removed mouse tracking for CPU optimization

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.stars = [];
        // Reduced star count for better performance
        const starCount = Math.min(300, Math.floor((this.width * this.height) / 6000));

        for (let i = 0; i < starCount; i++) {
            this.stars.push(new Star3D(this.width, this.height));
        }
    }

    bindEvents() {
        // Only resize handler, no mouse tracking
        window.addEventListener('resize', () => this.init());
    }

    setWarpSpeed(enabled) {
        this.warpSpeed = enabled;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update speed
        const targetSpeed = this.warpSpeed ? 55 : 1.5;
        if (this.warpSpeed) {
            this.speed += 2;
            if (this.speed > targetSpeed) this.speed = targetSpeed;
        } else {
            this.speed += (targetSpeed - this.speed) * 0.08;
        }

        // Draw stars (no mouse interaction)
        this.stars.forEach(star => {
            star.update(this.speed, this.width, this.height);
            star.draw(this.ctx, this.width, this.height, this.speed, this.warpSpeed);
        });

        requestAnimationFrame(() => this.animate());
    }
}

class Star3D {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.init();
    }

    init() {
        this.x = (Math.random() - 0.5) * this.width * 2;
        this.y = (Math.random() - 0.5) * this.height * 2;
        this.z = Math.random() * this.width;
        this.isPulsar = Math.random() < 0.02; // 2% chance of being a pulsar
        this.pulsarPhase = Math.random() * Math.PI * 2;
        this.pulsarSpeed = 0.1 + Math.random() * 0.2;
    }

    update(speed, width, height) {
        this.z -= speed;
        this.pulsarPhase += this.pulsarSpeed;

        if (this.z < 1) {
            this.z = width;
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
        }
    }

    draw(ctx, width, height, speed, warpSpeed) {
        const sx = (this.x / this.z) * (width / 2) + (width / 2);
        const sy = (this.y / this.z) * (width / 2) + (height / 2);

        const trailZ = this.z + (speed * 2.5);
        const psx = (this.x / trailZ) * (width / 2) + (width / 2);
        const psy = (this.y / trailZ) * (width / 2) + (height / 2);

        let r = (1 - this.z / width) * 2.2;

        ctx.beginPath();

        if (speed > 5) {
            // Warp streaks - blue tint
            const gradient = ctx.createLinearGradient(psx, psy, sx, sy);
            gradient.addColorStop(0, 'rgba(96, 165, 250, 0)');
            gradient.addColorStop(0.5, `rgba(130, 180, 255, ${0.5 - this.z / width})`);
            gradient.addColorStop(1, `rgba(200, 220, 255, ${1 - this.z / width})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = r * 1.2;
            ctx.lineCap = 'round';
            ctx.moveTo(psx, psy);
            ctx.lineTo(sx, sy);
            ctx.stroke();
        } else {
            // Static stars
            if (this.isPulsar) {
                // Pulsating pulsar star - blue color
                const pulsarBrightness = 0.5 + 0.5 * Math.sin(this.pulsarPhase);
                const pulsarSize = r * (1 + 0.5 * Math.sin(this.pulsarPhase));

                ctx.fillStyle = `rgba(96, 165, 250, ${pulsarBrightness})`;
                ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
                ctx.shadowBlur = 12;
                ctx.arc(sx, sy, pulsarSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                // Regular star with slight color variation
                const colorVariation = Math.random();
                let starColor;
                if (colorVariation < 0.7) {
                    starColor = 'rgba(255, 255, 255, 0.85)';
                } else if (colorVariation < 0.85) {
                    starColor = 'rgba(180, 200, 255, 0.85)'; // Blue-ish
                } else {
                    starColor = 'rgba(255, 220, 180, 0.85)'; // Warm gold
                }

                ctx.fillStyle = starColor;
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fill();
            }
            // Removed constellation lines on hover for CPU optimization
        }
    }
}

/* =========================================
   GRAVITATIONAL WAVE VISUALIZATION
   ========================================= */
class GravitationalWaveVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.waves = [];
        this.time = 0;

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // Create multiple wave sources (binary system)
        this.sources = [
            { x: this.centerX - 50, y: this.centerY, phase: 0 },
            { x: this.centerX + 50, y: this.centerY, phase: Math.PI }
        ];
    }

    bindEvents() {
        window.addEventListener('resize', () => this.init());
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.time += 0.015;

        // Rotate binary sources
        const orbitRadius = 40;
        const orbitSpeed = 0.3;
        this.sources[0].x = this.centerX + Math.cos(this.time * orbitSpeed) * orbitRadius;
        this.sources[0].y = this.centerY + Math.sin(this.time * orbitSpeed) * orbitRadius;
        this.sources[1].x = this.centerX + Math.cos(this.time * orbitSpeed + Math.PI) * orbitRadius;
        this.sources[1].y = this.centerY + Math.sin(this.time * orbitSpeed + Math.PI) * orbitRadius;

        // Draw gravitational waves
        const maxRadius = Math.max(this.width, this.height);
        const waveCount = 15;

        for (let i = 0; i < waveCount; i++) {
            const baseRadius = (this.time * 60 + i * (maxRadius / waveCount)) % maxRadius;
            const opacity = Math.max(0, 0.4 - (baseRadius / maxRadius) * 0.4);

            if (opacity > 0.01) {
                // Draw wave from center (merged effect) - deep blue color
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
                this.ctx.lineWidth = 1.8;

                // Sinusoidal distortion
                for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
                    const distortion = Math.sin(angle * 2 + this.time * 2) * 8;
                    const r = baseRadius + distortion;
                    const x = this.centerX + Math.cos(angle) * r;
                    const y = this.centerY + Math.sin(angle) * r;

                    if (angle === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }

                this.ctx.closePath();
                this.ctx.stroke();
            }
        }

        // Draw binary system representation - gold colors
        this.sources.forEach((source, index) => {
            const gradient = this.ctx.createRadialGradient(
                source.x, source.y, 0,
                source.x, source.y, 15
            );
            gradient.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
            gradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.4)');
            gradient.addColorStop(1, 'rgba(96, 165, 250, 0)');

            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.arc(source.x, source.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

/* =========================================
   INITIALIZATION
   ========================================= */
let starfield = null;
let gwVisualization = null;

function initVisualizations() {
    starfield = new StarfieldVisualization('starfieldCanvas');
    gwVisualization = new GravitationalWaveVisualization('gw-canvas');
}

// Export for use in main.js
window.initVisualizations = initVisualizations;
window.setWarpSpeed = (enabled) => {
    if (starfield) starfield.setWarpSpeed(enabled);
};
