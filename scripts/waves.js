/**
 * Gravitational Wave Visualization
 * Complete PTA visualization with all features
 */

class GravitationalWaveVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.binaries = [];
        this.stars = [];
        this.pulsars = [];
        this.shootingStars = [];
        this.nebulae = [];
        this.clickRipples = [];
        this.time = 0;

        // Mouse position for parallax
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        this.resize();
        this.createStars();
        this.createNebulae();
        this.createPulsars();
        this.createBinaries();
        this.setupEventListeners();
        this.animate();

        window.addEventListener('resize', () => {
            this.resize();
            this.createStars();
            this.createNebulae();
            this.createPulsars();
            this.createBinaries();
        });
    }

    setupEventListeners() {
        // Mouse parallax
        document.addEventListener('mousemove', (e) => {
            this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Click ripples
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.clickRipples.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                radius: 0,
                maxRadius: 200,
                opacity: 0.6
            });
        });
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    createStars() {
        this.stars = [];
        const numStars = Math.floor((this.width * this.height) / 5000);

        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.3 + 0.3,
                opacity: Math.random() * 0.7 + 0.2,
                twinkleSpeed: Math.random() * 0.015 + 0.005,
                twinkleOffset: Math.random() * Math.PI * 2,
                parallaxFactor: Math.random() * 0.3 + 0.1
            });
        }
    }

    createNebulae() {
        this.nebulae = [];
        const colors = [
            [80, 100, 180, 0.03],   // Deep blue
            [120, 80, 160, 0.025],  // Purple
            [60, 130, 150, 0.02],   // Teal
        ];

        for (let i = 0; i < 4; i++) {
            const color = colors[i % colors.length];
            this.nebulae.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 200 + Math.random() * 300,
                color: color,
                driftX: (Math.random() - 0.5) * 0.15,
                driftY: (Math.random() - 0.5) * 0.15,
            });
        }
    }

    createPulsars() {
        this.pulsars = [];

        const colors = [
            [255, 200, 100],
            [100, 220, 255],
            [255, 180, 120],
            [150, 255, 200],
            [255, 220, 150],
            [120, 200, 255],
            [255, 190, 100],
        ];

        const positions = [
            { x: 0.08, y: 0.18 },
            { x: 0.88, y: 0.12 },
            { x: 0.15, y: 0.72 },
            { x: 0.92, y: 0.68 },
            { x: 0.52, y: 0.06 },
            { x: 0.12, y: 0.92 },
            { x: 0.5, y: 0.5 },
        ];

        positions.forEach((pos, i) => {
            this.pulsars.push({
                x: pos.x * this.width,
                y: pos.y * this.height,
                baseX: pos.x * this.width,
                baseY: pos.y * this.height,
                angle: i * 0.9,
                rotationSpeed: 0.025 + (i % 3) * 0.01,
                beamLength: 45 + (i % 4) * 12,
                size: 3 + (i % 3) * 0.8,
                color: colors[i % colors.length],
                pulsePhase: i * 0.8,
                timingResidual: 0,
                parallaxFactor: 0.4
            });
        });
    }

    createBinaries() {
        this.binaries = [];

        const positions = [
            { x: 0.35, y: 0.4 },
            { x: 0.68, y: 0.62 },
        ];

        positions.forEach((pos, i) => {
            const isMain = i === 0;

            this.binaries.push({
                x: pos.x * this.width,
                y: pos.y * this.height,
                baseX: pos.x * this.width,
                baseY: pos.y * this.height,
                orbitRadius: isMain ? 20 : 12,
                baseOrbitRadius: isMain ? 20 : 12,
                angle: isMain ? 0 : Math.PI * 0.7,
                mass1: isMain ? 8 : 5,
                mass2: isMain ? 6 : 4,
                frequency: isMain ? 0.006 : 0.005,
                baseFrequency: isMain ? 0.006 : 0.005,
                inspiralRate: 0.000002,
                waveColorStart: [80, 140, 255],
                waveColorEnd: [160, 100, 220],
                sourceColor: isMain ? [70, 120, 200] : [120, 80, 180],
                waveSpeed: 0.012,
                numRings: 8,
                maxRadius: isMain ? 600 : 450,
                mergerFlash: 0,
                parallaxFactor: 0.2
            });
        });
    }

    spawnShootingStar() {
        if (Math.random() < 0.003) { // Occasional shooting stars
            const startX = Math.random() * this.width;
            this.shootingStars.push({
                x: startX,
                y: 0,
                speed: 8 + Math.random() * 6,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
                length: 80 + Math.random() * 60,
                opacity: 0.8,
                life: 1
            });
        }
    }

    drawNebulae() {
        this.nebulae.forEach(nebula => {
            // Drift movement
            nebula.x += nebula.driftX;
            nebula.y += nebula.driftY;

            // Wrap around
            if (nebula.x < -nebula.radius) nebula.x = this.width + nebula.radius;
            if (nebula.x > this.width + nebula.radius) nebula.x = -nebula.radius;
            if (nebula.y < -nebula.radius) nebula.y = this.height + nebula.radius;
            if (nebula.y > this.height + nebula.radius) nebula.y = -nebula.radius;

            const gradient = this.ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            gradient.addColorStop(0, `rgba(${nebula.color[0]}, ${nebula.color[1]}, ${nebula.color[2]}, ${nebula.color[3]})`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }

    drawStars() {
        this.stars.forEach(star => {
            const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset);
            const opacity = star.opacity * (0.6 + 0.4 * twinkle);

            // Parallax offset
            const offsetX = this.mouseX * star.parallaxFactor * 20;
            const offsetY = this.mouseY * star.parallaxFactor * 20;

            this.ctx.beginPath();
            this.ctx.arc(star.x + offsetX, star.y + offsetY, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.fill();
        });
    }

    drawShootingStars() {
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            star.life -= 0.015;
            star.opacity = star.life * 0.8;

            const tailX = star.x - Math.cos(star.angle) * star.length;
            const tailY = star.y - Math.sin(star.angle) * star.length;

            const gradient = this.ctx.createLinearGradient(tailX, tailY, star.x, star.y);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, `rgba(255, 255, 255, ${star.opacity})`);

            this.ctx.beginPath();
            this.ctx.moveTo(tailX, tailY);
            this.ctx.lineTo(star.x, star.y);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            return star.life > 0 && star.x < this.width && star.y < this.height;
        });
    }

    drawPTALines() {
        // Removed - not using PTA lines
    }

    drawPulsars() {
        this.pulsars.forEach((pulsar, idx) => {
            const { baseX, baseY, angle, beamLength, size, color, rotationSpeed, pulsePhase, parallaxFactor } = pulsar;

            // Parallax
            const x = baseX + this.mouseX * parallaxFactor * 30;
            const y = baseY + this.mouseY * parallaxFactor * 30;
            pulsar.x = x;
            pulsar.y = y;

            // Calculate timing residual from GW waves
            let residual = 0;
            this.binaries.forEach(binary => {
                const dist = Math.sqrt((x - binary.x) ** 2 + (y - binary.y) ** 2);
                residual += Math.sin(this.time * 0.03 - dist * 0.008) * 5 * Math.exp(-dist / 500);
            });
            pulsar.timingResidual = residual;

            const pulse = 0.6 + 0.4 * Math.sin(this.time * 0.1 + pulsePhase);

            // Draw timing residual indicator
            if (Math.abs(residual) > 0.5) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, size * 4 + Math.abs(residual), 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${Math.abs(residual) * 0.05})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }

            // Draw rotating radio beams
            for (let beam = 0; beam < 2; beam++) {
                const beamAngle = angle + beam * Math.PI;
                const endX = x + Math.cos(beamAngle) * beamLength;
                const endY = y + Math.sin(beamAngle) * beamLength;

                const gradient = this.ctx.createLinearGradient(x, y, endX, endY);
                gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.8 * pulse})`);
                gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);

                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(endX, endY);
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }

            // Core glow
            const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            glowGradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.9 * pulse})`);
            glowGradient.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.3 * pulse})`);
            glowGradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();

            // Bright core
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * pulse})`;
            this.ctx.fill();

            pulsar.angle += rotationSpeed;
        });
    }

    drawGravitationalWaves(binary) {
        const { x, y, numRings, maxRadius, waveColorStart, waveColorEnd, waveSpeed, angle } = binary;

        for (let i = 0; i < numRings; i++) {
            const phase = (this.time * waveSpeed + i * (Math.PI * 2 / numRings)) % (Math.PI * 2);
            const radius = (phase / (Math.PI * 2)) * maxRadius * 1.5;

            if (radius > 20) {
                const baseOpacity = 0.2 * Math.exp(-radius / (maxRadius * 0.45));

                const t = Math.min(1, radius / (maxRadius * 0.8));
                const r = Math.round(waveColorStart[0] + (waveColorEnd[0] - waveColorStart[0]) * t);
                const g = Math.round(waveColorStart[1] + (waveColorEnd[1] - waveColorStart[1]) * t);
                const b = Math.round(waveColorStart[2] + (waveColorEnd[2] - waveColorStart[2]) * t);

                // Quadrupolar strain pattern (plus polarization)
                const strain = 0.08 * Math.exp(-radius / 350);
                const wavePhase = this.time * 0.08 - radius * 0.015;
                const stretchX = 1 + strain * Math.cos(wavePhase * 2);
                const stretchY = 1 - strain * Math.cos(wavePhase * 2);

                // Draw multiple layers with strain distortion
                for (let layer = 0; layer < 5; layer++) {
                    const layerRadius = radius + (layer - 2) * 6;
                    const layerOpacity = baseOpacity * (1 - layer * 0.18);
                    const thickness = 14 - layer * 2.5;

                    if (layerRadius > 0 && layerOpacity > 0.002) {
                        this.ctx.save();
                        this.ctx.translate(x, y);
                        this.ctx.rotate(angle); // Align with binary orbit
                        this.ctx.scale(stretchX, stretchY);

                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, layerRadius, 0, Math.PI * 2);
                        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${layerOpacity * 0.35})`;
                        this.ctx.lineWidth = thickness;
                        this.ctx.stroke();

                        this.ctx.restore();
                    }
                }

                // Core wave ring with strain
                if (baseOpacity > 0.01) {
                    this.ctx.save();
                    this.ctx.translate(x, y);
                    this.ctx.rotate(angle);
                    this.ctx.scale(stretchX, stretchY);

                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
                    this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseOpacity * 0.5})`;
                    this.ctx.lineWidth = 5;
                    this.ctx.stroke();

                    this.ctx.restore();
                }
            }
        }
    }

    drawGravitationalLensing(binary) {
        // Subtle lensing distortion around black holes
        const { x, y, orbitRadius, angle, mass1, mass2, sourceColor } = binary;

        const x1 = x + Math.cos(angle) * orbitRadius;
        const y1 = y + Math.sin(angle) * orbitRadius;
        const x2 = x + Math.cos(angle + Math.PI) * orbitRadius;
        const y2 = y + Math.sin(angle + Math.PI) * orbitRadius;

        // Draw lensing rings
        [{ px: x1, py: y1, m: mass1 }, { px: x2, py: y2, m: mass2 }].forEach(bh => {
            const lensRadius = bh.m * 4;
            const gradient = this.ctx.createRadialGradient(
                bh.px, bh.py, bh.m * 0.5,
                bh.px, bh.py, lensRadius
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(0.4, `rgba(${sourceColor[0]}, ${sourceColor[1]}, ${sourceColor[2]}, 0.15)`);
            gradient.addColorStop(0.7, `rgba(${sourceColor[0] + 30}, ${sourceColor[1] + 30}, ${sourceColor[2] + 30}, 0.08)`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(bh.px, bh.py, lensRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }

    drawBinaryBlackHoles(binary) {
        const { x, y, orbitRadius, angle, mass1, mass2, sourceColor, parallaxFactor, baseX, baseY } = binary;

        // Parallax
        binary.x = baseX + this.mouseX * parallaxFactor * 30;
        binary.y = baseY + this.mouseY * parallaxFactor * 30;

        const x1 = binary.x + Math.cos(angle) * orbitRadius;
        const y1 = binary.y + Math.sin(angle) * orbitRadius;
        const x2 = binary.x + Math.cos(angle + Math.PI) * orbitRadius;
        const y2 = binary.y + Math.sin(angle + Math.PI) * orbitRadius;

        [{ px: x1, py: y1, mass: mass1 }, { px: x2, py: y2, mass: mass2 }].forEach(bh => {
            const gradient = this.ctx.createRadialGradient(bh.px, bh.py, bh.mass * 0.3, bh.px, bh.py, bh.mass * 2.5);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.3, `rgba(${sourceColor[0]}, ${sourceColor[1]}, ${sourceColor[2]}, 0.8)`);
            gradient.addColorStop(0.6, `rgba(${sourceColor[0]}, ${sourceColor[1]}, ${sourceColor[2]}, 0.3)`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(bh.px, bh.py, bh.mass * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(bh.px, bh.py, bh.mass * 0.6, 0, Math.PI * 2);
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
        });

        binary.angle += binary.frequency;
        binary.frequency += binary.inspiralRate;

        if (binary.frequency > 0.035) {
            binary.frequency = binary.baseFrequency;
            binary.orbitRadius = binary.baseOrbitRadius;
            binary.mergerFlash = 1;
        }

        if (binary.orbitRadius > 4) {
            binary.orbitRadius -= 0.0005;
        }
    }

    drawClickRipples() {
        this.clickRipples = this.clickRipples.filter(ripple => {
            ripple.radius += 4;
            ripple.opacity -= 0.015;

            if (ripple.opacity > 0) {
                this.ctx.beginPath();
                this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(100, 200, 255, ${ripple.opacity})`;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }

            return ripple.opacity > 0;
        });
    }

    drawMergerFlash(binary) {
        if (binary.mergerFlash > 0) {
            const c = binary.waveColorEnd;
            const gradient = this.ctx.createRadialGradient(binary.x, binary.y, 0, binary.x, binary.y, 180);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${binary.mergerFlash * 0.5})`);
            gradient.addColorStop(0.4, `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${binary.mergerFlash * 0.3})`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(binary.x, binary.y, 180, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            binary.mergerFlash -= 0.01;
        }
    }

    animate() {
        // Smooth mouse following
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Clear with trail
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.12)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Spawn shooting stars
        this.spawnShootingStar();

        // Draw layers
        this.drawNebulae();
        this.drawStars();
        this.drawShootingStars();
        this.drawPTALines();
        this.drawPulsars();

        this.binaries.forEach(binary => {
            this.drawGravitationalWaves(binary);
            this.drawGravitationalLensing(binary);
            this.drawBinaryBlackHoles(binary);
            this.drawMergerFlash(binary);
        });

        this.drawClickRipples();

        this.time++;
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GravitationalWaveVisualizer('gw-canvas');
});
