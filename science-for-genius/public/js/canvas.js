const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class SoftGlowOrb {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -100 || this.x > width + 100) this.vx *= -1;
        if (this.y < -100 || this.y > height + 100) this.vy *= -1;
    }

    draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.06)';

        ctx.beginPath();
        let gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

const orbs = [
    new SoftGlowOrb(width * 0.15, height * 0.2, 450),
    new SoftGlowOrb(width * 0.85, height * 0.3, 500),
    new SoftGlowOrb(width * 0.5, height * 0.85, 480)
];

function animate() {
    ctx.clearRect(0, 0, width, height);
    orbs.forEach(orb => {
        orb.update();
        orb.draw();
    });
    requestAnimationFrame(animate);
}

animate();