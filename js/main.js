/* leon — interactions */
(() => {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* split headings into words */
    $$(".split").forEach((el) => {
        let i = 0;
        const wrap = (node) => {
            [...node.childNodes].forEach((child) => {
                if (child.nodeType === 3) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach((part) => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) return frag.append(" ");
                        const w = document.createElement("span");
                        w.className = "w";
                        const inner = document.createElement("span");
                        inner.style.setProperty("--i", i++);
                        inner.textContent = part;
                        w.append(inner);
                        frag.append(w);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === 1 && child.tagName !== "BR") {
                    wrap(child);
                }
            });
        };
        wrap(el);
    });

    /* reveal on scroll */
    const io = new IntersectionObserver(
        (entries) =>
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("visible");
                    io.unobserve(e.target);
                }
            }),
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    $$(".reveal, .split, .special-heading").forEach((el) => io.observe(el));

    /* header hide on scroll down */
    const header = $(".header");
    const menu = $(".links ul");
    const burger = $(".links .icon");
    let lastY = 0;
    window.addEventListener(
        "scroll",
        () => {
            const y = scrollY;
            header.classList.toggle("hide", y > 400 && y > lastY && !menu.classList.contains("open"));
            lastY = y;
        },
        { passive: true }
    );

    /* mobile menu */
    burger.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        burger.classList.toggle("open", open);
        burger.setAttribute("aria-expanded", open);
    });
    $$("a", menu).forEach((a) =>
        a.addEventListener("click", () => {
            menu.classList.remove("open");
            burger.classList.remove("open");
            burger.setAttribute("aria-expanded", false);
        })
    );

    /* scroll spy */
    const spy = new IntersectionObserver(
        (entries) =>
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                $$("a", menu).forEach((a) => a.classList.toggle("active", a.hash === `#${e.target.id}`));
            }),
        { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("section[id]").forEach((s) => spy.observe(s));

    /* parallax tilt on hero photo */
    const visual = $(".landing-visual");
    if (matchMedia("(hover: hover)").matches) {
        visual.addEventListener("mousemove", (e) => {
            const r = visual.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            $(".photo", visual).style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
        });
        visual.addEventListener("mouseleave", () => ($(".photo", visual).style.transform = ""));
        visual.style.perspective = "900px";
        $(".photo", visual).style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
    }

    /* lightbox */
    const lb = $(".lightbox");
    const lbImg = $("img", lb);
    const close = () => {
        lb.classList.remove("open");
        lb.setAttribute("aria-hidden", true);
    };
    $$(".card-media").forEach((m) =>
        m.addEventListener("click", () => {
            lbImg.src = m.dataset.full;
            lbImg.alt = $("img", m).alt;
            lb.classList.add("open");
            lb.setAttribute("aria-hidden", false);
        })
    );
    lb.addEventListener("click", (e) => e.target !== lbImg && close());
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());

    /* counters */
    const cio = new IntersectionObserver(
        (entries) =>
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                const el = e.target;
                const end = +el.dataset.count;
                const t0 = performance.now();
                const tick = (t) => {
                    const p = Math.min((t - t0) / 1600, 1);
                    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + "+";
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                cio.unobserve(el);
            }),
        { threshold: 0.6 }
    );
    $$("[data-count]").forEach((el) => cio.observe(el));

    /* copy email */
    const copy = $(".copy");
    copy.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(copy.dataset.copy);
            $("span", copy).textContent = "Copied!";
        } catch {
            $("span", copy).textContent = copy.dataset.copy;
        }
        setTimeout(() => ($("span", copy).textContent = "Copy email"), 2000);
    });

    /* contact form */
    const form = $(".form");
    const note = $(".note");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let ok = true;
        $$("input, textarea", form).forEach((f) => {
            const bad = !f.value.trim() || (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
            f.classList.toggle("error", bad);
            if (bad) ok = false;
        });
        note.classList.toggle("err", !ok);
        note.textContent = ok ? "Yay! Message sent — we’ll be in touch soon." : "Please fill in every field with a valid email.";
        if (ok) form.reset();
    });

    $(".year-now").textContent = new Date().getFullYear();
})();
