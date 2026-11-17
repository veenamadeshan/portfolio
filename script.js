/* ============================================================
   Veenasri M — Portfolio · interactions (vanilla JS)
   All content/functionality preserved from the original script:
   header scroll state, mobile menu, reveal observer, tools
   accordion, show-more articles, client projects accordion.
   Added: theme toggle, scroll progress, scroll spy, back-to-top,
   timeline draw, hero parallax. No external dependencies.
   ============================================================ */
(function () {
    'use strict';

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isDesktop = window.matchMedia('(min-width: 920px)').matches;

    /* ---------- 1 · Theme toggle (localStorage + prefers-color-scheme) ---------- */
    var themeToggle = document.getElementById('theme-toggle');

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function syncThemeUI() {
        if (!themeToggle) return;
        var dark = currentTheme() === 'dark';
        themeToggle.setAttribute('aria-pressed', String(dark));
        themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem('vm-theme', next);
            } catch (e) { /* storage unavailable */ }
            if (next === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            syncThemeUI();
        });
        syncThemeUI();
    }

    /* If the user has no stored choice, follow OS theme changes live */
    var systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (systemThemeQuery.addEventListener) {
        systemThemeQuery.addEventListener('change', function (e) {
            var stored = null;
            try { stored = localStorage.getItem('vm-theme'); } catch (err) { /* ignore */ }
            if (stored) return;
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        });
    }

    /* ---------- 2 · Sticky header state + scroll progress + back-to-top ---------- */
    var header = document.querySelector('.header');
    var progressBar = document.getElementById('scroll-progress-bar');
    var backToTop = document.getElementById('back-to-top');
    var timeline = document.querySelector('.timeline');
    var heroPhoto = document.querySelector('.hero-photo');
    var ticking = false;

    function clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    function onScroll() {
        var scrollY = window.scrollY || window.pageYOffset;

        if (header) {
            header.classList.toggle('scrolled', scrollY > 50);
        }

        if (progressBar) {
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var progress = docHeight > 0 ? clamp(scrollY / docHeight, 0, 1) : 0;
            progressBar.style.transform = 'scaleX(' + progress + ')';
        }

        if (backToTop) {
            backToTop.classList.toggle('visible', scrollY > 600);
        }

        /* Timeline accent line draws with scroll (0 → 1) */
        if (timeline) {
            var rect = timeline.getBoundingClientRect();
            var vh = window.innerHeight;
            var fill = clamp((vh * 0.75 - rect.top) / rect.height, 0, 1);
            timeline.style.setProperty('--fill', fill.toFixed(3));
        }

        /* Subtle hero parallax, desktop only */
        if (heroPhoto && isDesktop && !prefersReduced && scrollY < window.innerHeight) {
            heroPhoto.style.transform = 'translateY(' + (scrollY * 0.05).toFixed(1) + 'px)';
        }
    }

    function requestScrollUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        });
    }

    /* ---------- 3 · Mobile menu ---------- */
    var mobileMenuBtn = document.getElementById('mobile-menu-btn');
    var navMenu = document.getElementById('nav-menu');

    function setMenu(open) {
        if (!mobileMenuBtn || !navMenu) return;
        navMenu.classList.toggle('open', open);
        mobileMenuBtn.classList.toggle('is-open', open);
        mobileMenuBtn.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('no-scroll', open);
    }

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            setMenu(!navMenu.classList.contains('open'));
        });

        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                setMenu(false);
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navMenu.classList.contains('open')) {
                setMenu(false);
                mobileMenuBtn.focus();
            }
        });
    }

    /* ---------- 4 · Scroll spy (active nav link) ---------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    var sections = navLinks
        .map(function (link) {
            var id = link.getAttribute('href').slice(1);
            return id ? document.getElementById(id) : null;
        })
        .filter(Boolean);

    function setActiveLink(id) {
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
    }

    if (sections.length && 'IntersectionObserver' in window) {
        var spyObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        sections.forEach(function (section) { spyObserver.observe(section); });
    }

    /* ---------- 5 · Smooth anchor scrolling (kept from original) ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: prefersReduced ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /* ---------- 6 · Scroll-reveal with stagger (.reveal → .in-view) ---------- */
    var revealTargets = document.querySelectorAll('.reveal, .stagger-container');

    function showAll(instantTargets) {
        instantTargets.forEach(function (el) { el.classList.add('in-view'); });
        document.querySelectorAll('.progress.fill-anim').forEach(function (fill) {
            fill.classList.add('is-filled');
        });
    }

    if (revealTargets.length && 'IntersectionObserver' in window && !prefersReduced) {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                el.classList.add('in-view');
                if (el.classList.contains('languages-card')) {
                    el.querySelectorAll('.progress.fill-anim').forEach(function (fill) {
                        fill.classList.add('is-filled');
                    });
                }
                observer.unobserve(el);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach(function (el) { revealObserver.observe(el); });
    } else {
        showAll(Array.prototype.slice.call(revealTargets));
    }

    /* ---------- 7 · Tools accordion (behavior unchanged) ---------- */
    document.querySelectorAll('.tool-category').forEach(function (category) {
        var toggle = category.querySelector('.tool-category-toggle');
        var panel = category.querySelector('.tool-category-panel');
        if (!toggle || !panel) return;

        toggle.addEventListener('click', function () {
            var willExpand = toggle.getAttribute('aria-expanded') !== 'true';
            toggle.setAttribute('aria-expanded', String(willExpand));
            panel.setAttribute('aria-hidden', String(!willExpand));
            if (willExpand) {
                panel.removeAttribute('inert');
            } else {
                panel.setAttribute('inert', '');
            }
            category.classList.toggle('is-open', willExpand);
        });
    });

    /* ---------- 8 · Show More / Show Less articles (smooth height + fade) ---------- */
    var showMoreBtn = document.getElementById('show-more-btn');
    var moreArticles = document.getElementById('more-articles');

    if (showMoreBtn && moreArticles) {
        var moreText = showMoreBtn.querySelector('.show-more-text');
        var lessText = showMoreBtn.querySelector('.show-less-text');

        var onHeightEnd = function (e) {
            if (e.propertyName !== 'height' || e.target !== moreArticles) return;
            if (moreArticles.classList.contains('is-open')) {
                moreArticles.style.height = 'auto';
            } else {
                moreArticles.style.display = 'none';
                moreArticles.style.height = '';
            }
            moreArticles.removeEventListener('transitionend', onHeightEnd);
        };

        showMoreBtn.addEventListener('click', function () {
            var isExpanded = showMoreBtn.getAttribute('aria-expanded') === 'true';
            var willExpand = !isExpanded;

            showMoreBtn.setAttribute('aria-expanded', String(willExpand));
            moreArticles.setAttribute('aria-hidden', String(!willExpand));
            moreArticles.classList.toggle('is-open', willExpand);

            if (moreText && lessText) {
                moreText.style.display = willExpand ? 'none' : '';
                lessText.style.display = willExpand ? '' : 'none';
            }

            if (willExpand) {
                moreArticles.style.display = 'grid';
                moreArticles.style.height = '0px';
                moreArticles.style.opacity = '0';
                void moreArticles.offsetHeight; /* force reflow */
                moreArticles.addEventListener('transitionend', onHeightEnd);
                moreArticles.style.height = moreArticles.scrollHeight + 'px';
                moreArticles.style.opacity = '1';
            } else {
                moreArticles.style.height = moreArticles.scrollHeight + 'px';
                void moreArticles.offsetHeight; /* force reflow */
                moreArticles.addEventListener('transitionend', onHeightEnd);
                moreArticles.style.height = '0px';
                moreArticles.style.opacity = '0';
            }
        });
    }

    /* ---------- 9 · Client Projects accordion (behavior unchanged) ---------- */
    document.querySelectorAll('.project-entry').forEach(function (entry) {
        var toggle = entry.querySelector('.project-entry-toggle');
        var panel = entry.querySelector('.project-entry-panel');
        if (!toggle || !panel) return;

        toggle.addEventListener('click', function () {
            var willExpand = toggle.getAttribute('aria-expanded') !== 'true';
            toggle.setAttribute('aria-expanded', String(willExpand));
            panel.setAttribute('aria-hidden', String(!willExpand));
            if (willExpand) {
                panel.removeAttribute('inert');
            } else {
                panel.setAttribute('inert', '');
            }
            entry.classList.toggle('is-open', willExpand);
        });
    });

    /* No console errors, no unhandled paths — end of init */
})();
