document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. (Form removed in favor of mailto button)

    // 4. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the visible class to trigger CSS transition
                entry.target.classList.add('is-visible');
                
                // If it's the progress bar container, animate the fills
                if (entry.target.classList.contains('languages-card')) {
                    const fills = entry.target.querySelectorAll('.progress.fill-anim');
                    fills.forEach(fill => fill.classList.add('is-filled'));
                }
                
                // Unobserve after animating once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements that need scroll animation
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .stagger-container');
    
    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // 5. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = mobileMenuBtn.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // 6. Published Work Filter (removed - all work shown with Show More toggle)

    // 7. Tools Accordion
    document.querySelectorAll('.tool-category').forEach(category => {
        const toggle = category.querySelector('.tool-category-toggle');
        const panel = category.querySelector('.tool-category-panel');

        if (!toggle || !panel) return;

        toggle.addEventListener('click', () => {
            const willExpand = toggle.getAttribute('aria-expanded') !== 'true';

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

    // 8. Show More Articles Toggle
    const showMoreBtn = document.getElementById('show-more-btn');
    const moreArticles = document.getElementById('more-articles');

    if (showMoreBtn && moreArticles) {
        const moreText = showMoreBtn.querySelector('.show-more-text');
        const lessText = showMoreBtn.querySelector('.show-less-text');

        showMoreBtn.addEventListener('click', () => {
            const isExpanded = showMoreBtn.getAttribute('aria-expanded') === 'true';
            const willExpand = !isExpanded;

            showMoreBtn.setAttribute('aria-expanded', String(willExpand));
            moreArticles.setAttribute('aria-hidden', String(!willExpand));

            if (moreText && lessText) {
                moreText.style.display = willExpand ? 'none' : '';
                lessText.style.display = willExpand ? '' : 'none';
            }

            if (willExpand) {
                moreArticles.style.display = 'grid';
                // Force reflow for animation
                moreArticles.offsetHeight;
            } else {
                moreArticles.style.display = 'none';
            }
        });
    }

    // 9. Client Projects Accordion
    document.querySelectorAll('.project-entry').forEach(entry => {
        const toggle = entry.querySelector('.project-entry-toggle');
        const panel = entry.querySelector('.project-entry-panel');

        if (!toggle || !panel) return;

        toggle.addEventListener('click', () => {
            const willExpand = toggle.getAttribute('aria-expanded') !== 'true';

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
});
