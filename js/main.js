// Pipeline Dynamics - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {

    // ==================== MOBILE MENU ====================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            // Animate hamburger
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    // ==================== SCROLL ANIMATIONS ====================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation class to elements
    const animatedElements = document.querySelectorAll(
        '.feature-card, .service-card, .expertise-card, .philosophy-item, .engagement-card'
    );

    animatedElements.forEach((el, index) => {
        el.classList.add('animate-on-scroll');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    // ==================== HEADER SCROLL EFFECT ====================
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    // ==================== CONTACT FORM ====================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            const formWrapper = contactForm.closest('.contact-form-wrapper') || contactForm.parentNode;

            // Remove any existing messages
            const existingMessage = formWrapper.querySelector('.form-message');
            if (existingMessage) existingMessage.remove();

            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company') || undefined,
                'project-type': formData.get('project-type') || undefined,
                message: formData.get('message')
            };

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>Sending...</span>
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
                </svg>
            `;

            // Add spinner animation if not present
            if (!document.getElementById('spinner-styles')) {
                const style = document.createElement('style');
                style.id = 'spinner-styles';
                style.textContent = `
                    .spinner { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .form-message { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; transition: opacity 0.3s, transform 0.3s; }
                    .form-message.success { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
                    .form-message.error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
                `;
                document.head.appendChild(style);
            }

            try {
                // Edge Function URL - set via data attribute or use default
                const endpoint = contactForm.dataset.endpoint ||
                    'https://pwluylonglimsdxwcjshc.supabase.co/functions/v1/send-contact-email';

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-message success';
                    successMessage.innerHTML = `
                        <strong>Got it, ${escapeHtml(name)}.</strong><br>
                        I'll get back to you at ${escapeHtml(email)} soon.
                    `;
                    formWrapper.insertBefore(successMessage, formWrapper.firstChild);
                    contactForm.reset();
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Remove message after 8 seconds
                    setTimeout(() => {
                        successMessage.style.opacity = '0';
                        successMessage.style.transform = 'translateY(-10px)';
                        setTimeout(() => successMessage.remove(), 300);
                    }, 8000);
                } else {
                    throw new Error(result.error || 'Something went wrong. Please try again.');
                }
            } catch (err) {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-message error';
                errorMessage.innerHTML = `
                    <strong>Couldn't send your message.</strong><br>
                    ${escapeHtml(err.message)}<br>
                    <small>You can also email us directly at info@pipelinedynamics.com</small>
                `;
                formWrapper.insertBefore(errorMessage, formWrapper.firstChild);
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Remove message after 10 seconds
                setTimeout(() => {
                    errorMessage.style.opacity = '0';
                    errorMessage.style.transform = 'translateY(-10px)';
                    setTimeout(() => errorMessage.remove(), 300);
                }, 10000);
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==================== SMOOTH SCROLLING ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==================== BUTTON RIPPLE EFFECT ====================
    const buttons = document.querySelectorAll('.btn-primary');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                left: ${x}px;
                top: ${y}px;
                width: 100px;
                height: 100px;
                margin-left: -50px;
                margin-top: -50px;
                pointer-events: none;
            `;

            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation to document
    if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ==================== TECH ITEM HOVER EFFECT ====================
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // ==================== PARALLAX FOR HERO (subtle) ====================
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                const heroContent = hero.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
                    heroContent.style.opacity = 1 - (scrolled * 0.001);
                }
            }
        }, { passive: true });
    }

});
