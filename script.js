document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // Theme Toggle Functionality
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference, otherwise use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // ==========================================================================
    // Mobile Navigation Drawer
    // ==========================================================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    const toggleMobileMenu = () => {
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    };

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when resizing beyond mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileNav.classList.contains('open')) {
            toggleMobileMenu();
        }
    });

    // ==========================================================================
    // Timeline Tab Switching (Education vs Certifications)
    // ==========================================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPanelId = btn.getAttribute('aria-controls');
            
            // Deactivate all tabs & panels
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Activate selected tab & panel
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById(targetPanelId).classList.add('active');
        });
    });

    // ==========================================================================
    // Intersection Observer for Scroll Reveal
    // ==========================================================================
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Unobserve once revealed
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealOnScroll.observe(el));

    // Force hero elements to animate instantly without scroll
    const heroElements = document.querySelectorAll('#hero .reveal');
    heroElements.forEach(el => el.classList.add('active'));

    // ==========================================================================
    // Navigation Link Active State Tracking (ScrollSpy)
    // ==========================================================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const updateActiveNav = () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120; // offset navbar height
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav);

    // ==========================================================================
    // Contact Form Real Submission (Web3Forms)
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            // Get form inputs for validation
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();
            
            if (!name || !email || !subject || !message) {
                formFeedback.textContent = 'Please fill out all required fields.';
                formFeedback.className = 'form-feedback error';
                formFeedback.style.display = 'block';
                return;
            }

            // Check if Access Key is still the placeholder
            const accessKeyInput = contactForm.querySelector('input[name="access_key"]');
            if (accessKeyInput && accessKeyInput.value === 'YOUR_ACCESS_KEY_HERE') {
                formFeedback.textContent = 'Setup Required: Please add your free Web3Forms access key to the input element in index.html.';
                formFeedback.className = 'form-feedback error';
                formFeedback.style.display = 'block';
                return;
            }

            // Visual loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sending Message...</span>';
            
            // Create FormData object to send
            const formData = new FormData(contactForm);
            
            // Post data to Web3Forms API
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(async (response) => {
                const resJson = await response.json();
                if (response.status === 200) {
                    // Success response feedback
                    formFeedback.textContent = `Thank you, ${name}! Your message has been sent successfully.`;
                    formFeedback.className = 'form-feedback success';
                    formFeedback.style.display = 'block';
                    contactForm.reset();
                } else {
                    // API error response
                    formFeedback.textContent = resJson.message || 'Something went wrong. Please try again.';
                    formFeedback.className = 'form-feedback error';
                    formFeedback.style.display = 'block';
                }
            })
            .catch((error) => {
                console.error(error);
                formFeedback.textContent = 'Could not connect to email server. Please check your network connection.';
                formFeedback.className = 'form-feedback error';
                formFeedback.style.display = 'block';
            })
            .finally(() => {
                // Reset submit button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Clear success feedback after 8 seconds
                setTimeout(() => {
                    formFeedback.style.display = 'none';
                    formFeedback.className = 'form-feedback';
                }, 8000);
            });
        });
    }
});
