(() => {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchDevice = window.matchMedia("(pointer: coarse)").matches;

    // Mobile navigation
    const menuButton = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-links");

    if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
            const isOpen = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!isOpen));
            nav.classList.toggle("open", !isOpen);
        });

        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menuButton.setAttribute("aria-expanded", "false");
                nav.classList.remove("open");
            });
        });
    }

    // Footer year
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    // Scroll reveal
    const revealItems = document.querySelectorAll(".reveal");
    if (!reduceMotion && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add("visible"));
    }

    // Copy-email button; replace the sample address in index.html first.
    const toast = document.querySelector(".toast");
    const copyButton = document.querySelector(".copy-email");
    let toastTimer;

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
    }

    if (copyButton) {
        copyButton.addEventListener("click", async () => {
            const email = copyButton.dataset.email || "";
            if (!email || email.includes("your-email@example.com")) {
                showToast("Replace the sample email with your real email first.");
                return;
            }

            try {
                await navigator.clipboard.writeText(email);
                showToast("Email copied to clipboard!");
            } catch {
                showToast("Email: " + email);
            }
        });
    }

    // Mouse-following aura and interactive particle field.
    const canvas = document.getElementById("particle-canvas");
    const cursorGlow = document.querySelector(".cursor-glow");
    const context = canvas ? canvas.getContext("2d") : null;

    if (!canvas || !context || reduceMotion) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    const pointer = { x: -1000, y: -1000 };
    const palette = [
        "92,236,241",
        "167,121,255",
        "255,120,200",
        "123,240,196"
    ];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(78, Math.max(28, Math.floor(width * height / 21000)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.34,
            vy: (Math.random() - 0.5) * 0.34,
            radius: Math.random() * 1.5 + 0.6,
            color: palette[Math.floor(Math.random() * palette.length)]
        }));
    }

    function pointerMove(event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        if (cursorGlow && !touchDevice) {
            cursorGlow.style.left = pointer.x + "px";
            cursorGlow.style.top = pointer.y + "px";
            document.body.classList.add("cursor-active");
        }
    }

    function animate() {
        context.clearRect(0, 0, width, height);

        particles.forEach((p, index) => {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distance = Math.hypot(dx, dy) || 1;

            if (!touchDevice && distance < 135) {
                const force = (135 - distance) / 135;
                p.vx += (dx / distance) * force * 0.014;
                p.vy += (dy / distance) * force * 0.014;
            }

            p.vx *= 0.997;
            p.vy *= 0.997;
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -5) p.x = width + 5;
            if (p.x > width + 5) p.x = -5;
            if (p.y < -5) p.y = height + 5;
            if (p.y > height + 5) p.y = -5;

            context.beginPath();
            context.fillStyle = `rgba(${p.color}, 0.8)`;
            context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            context.fill();

            for (let j = index + 1; j < particles.length; j++) {
                const other = particles[j];
                const lineDistance = Math.hypot(p.x - other.x, p.y - other.y);

                if (lineDistance < 88) {
                    context.beginPath();
                    context.strokeStyle =
                        `rgba(145, 157, 255, ${(1 - lineDistance / 88) * 0.12})`;
                    context.lineWidth = 0.6;
                    context.moveTo(p.x, p.y);
                    context.lineTo(other.x, other.y);
                    context.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    resize();
    requestAnimationFrame(animate);
    window.addEventListener("resize", resize, { passive: true });

    if (!touchDevice) {
        window.addEventListener("pointermove", pointerMove, { passive: true });
    }

    // Subtle pointer tilt for cards
    if (!touchDevice) {
        document.querySelectorAll(".skill-card, .project-card, .achievement-card").forEach(card => {
            card.addEventListener("pointermove", event => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                const rx = (0.5 - y) * 2.8;
                const ry = (x - 0.5) * 2.8;
                card.style.transform =
                    `perspective(850px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        });
    }
})();
