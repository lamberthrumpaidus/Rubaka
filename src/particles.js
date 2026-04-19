import { add } from './engine';

const particleCache = {};
function getGlowImage(color) {
    if (!particleCache[color]) {
        const c = document.createElement('canvas');
        c.width = 30;
        c.height = 30;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(15, 15, 0, 15, 15, 15);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(15, 15, 15, 0, Math.PI * 2);
        ctx.fill();
        particleCache[color] = c;
    }
    return particleCache[color];
}

export default function ParticleEmit(x, y, count, color, speedScale = 1) {
    const particles = [];
    count = count * 4; // High Quality: Increase particle count
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200 * speedScale;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.5 + Math.random() * 0.5,
            c: color,
            update(dT) {
                this.x += this.vx * dT;
                this.y += this.vy * dT;
                this.vy += 800 * dT; // gravity
                this.life -= dT;
                return this.life <= 0;
            },
            render(ctx) {
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = this.life;
                
                // Draw a small glowing circle instead of a square
                ctx.drawImage(getGlowImage(this.c), this.x - 15, this.y - 15);
                
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
            },
            order: 100 // render on top
        });
    }
    particles.map(p => add(p));
}
