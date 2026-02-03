// VoteVega.nyc Custom JavaScript
// Basic functionality for the campaign website

(function() {
    'use strict';

    // DOM Content Loaded Event
    document.addEventListener('DOMContentLoaded', function() {
        initializeWebsite();
    });

    function initializeWebsite() {
        // Initialize various components
        initSmoothScrolling();
        initEmailForm();
        initVolunteerForms();
        initNavbarBehavior();
        initAnimations();
        initEmailParameterHandling();
    }

    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Email signup form handler
    function initEmailForm() {
        const emailForm = document.getElementById('email-signup');
        
        if (emailForm) {
            emailForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value.trim();
                
                if (validateEmail(email)) {
                    // In a real implementation, you would send this to your email service
                    showFormMessage('Thank you for signing up! We\'ll be in touch.', 'success');
                    emailInput.value = '';
                } else {
                    showFormMessage('Please enter a valid email address.', 'error');
                }
            });
        }
    }

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show form messages
    function showFormMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
        messageDiv.innerHTML = message;
        messageDiv.style.marginTop = '1rem';

        // Insert message after the form
        const form = document.getElementById('email-signup');
        form.parentNode.insertBefore(messageDiv, form.nextSibling);

        // Auto-remove message after 5 seconds
        setTimeout(function() {
            if (messageDiv && messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Navbar behavior enhancements
    function initNavbarBehavior() {
        const navbar = document.querySelector('.site-header');
        
        if (!navbar) {
            console.log('Navbar element not found!');
            return;
        }
        
        // Throttle scroll events for better performance
        let ticking = false;
        
        function updateNavbar() {
            const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            
            if (scrollTop > 100) {
                if (!navbar.classList.contains('show')) {
                    navbar.classList.add('show');
                }
            } else {
                if (navbar.classList.contains('show')) {
                    navbar.classList.remove('show');
                }
            }
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }
        
        // Add scroll listener
        window.addEventListener('scroll', requestTick, { passive: true });
        
        // Also try on window load and resize
        window.addEventListener('load', updateNavbar);
        window.addEventListener('resize', updateNavbar);

        // Close mobile menu when clicking on regular nav links (but not dropdowns)
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
        // Close menu for regular nav links
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
        
        // Close menu for dropdown items
        dropdownItems.forEach(function(item) {
            item.addEventListener('click', function() {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
        
        // Handle mobile dropdown behavior
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(function(toggle) {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth < 992) {
                    // On mobile, manually handle the dropdown
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const dropdown = this.parentElement;
                    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
                    const isOpen = dropdown.classList.contains('show');
                    
                    // Close any other open dropdowns first
                    document.querySelectorAll('.dropdown.show').forEach(function(openDropdown) {
                        if (openDropdown !== dropdown) {
                            openDropdown.classList.remove('show');
                            openDropdown.querySelector('.dropdown-menu').classList.remove('show');
                            openDropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
                        }
                    });
                    
                    // Toggle current dropdown with smooth animation
                    if (isOpen) {
                        // Close dropdown
                        dropdown.classList.remove('show');
                        dropdownMenu.classList.remove('show');
                        this.setAttribute('aria-expanded', 'false');
                    } else {
                        // Open dropdown
                        dropdown.classList.add('show');
                        // Small delay to ensure the show class is applied before menu shows
                        setTimeout(function() {
                            dropdownMenu.classList.add('show');
                        }, 10);
                        this.setAttribute('aria-expanded', 'true');
                    }
                    
                    // Ensure the navbar-collapse has enough height for the content
                    setTimeout(function() {
                        const navbarCollapse = document.querySelector('.navbar-collapse');
                        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                            // Let CSS handle the max-height with calc(100vh - 60px)
                            // The overflow-y: auto will handle scrolling if needed
                        }
                    }, 50);
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 992 && !e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown.show').forEach(function(dropdown) {
                    dropdown.classList.remove('show');
                    dropdown.querySelector('.dropdown-menu').classList.remove('show');
                    dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    // Initialize scroll animations
    function initAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        animateElements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // Utility function to debounce events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = function() {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add scroll event with debouncing
    const debouncedScroll = debounce(function() {
        // Add any scroll-based functionality here
    }, 16);

    window.addEventListener('scroll', debouncedScroll);

    // Analytics and tracking placeholder
    function trackEvent(eventName, properties = {}) {
        // In a real implementation, you would integrate with Google Analytics,
        // Facebook Pixel, or other tracking services
        console.log('Event tracked:', eventName, properties);
    }

    // Track button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn')) {
            const buttonText = e.target.textContent.trim();
            const buttonClass = e.target.className;
            
            trackEvent('button_click', {
                text: buttonText,
                class: buttonClass,
                url: e.target.href || window.location.href
            });
        }
    });

    // Volunteer and RSVP form submission with Turnstile
    function initVolunteerForms() {
        // Configuration
        const WORKER_URL = 'https://votevega-form-submission.vega-signup.workers.dev';
        // Use test key for Netlify previews, real key for production
        const TURNSTILE_SITE_KEY = location.hostname.endsWith('.netlify.app')
            ? '1x00000000000000000000AA' // Test key - works on any domain
            : '0x4AAAAAACOMujdiKI0wJfCI'; // Real key
        
        let turnstileAttempts = 0;
        const MAX_TURNSTILE_ATTEMPTS = 20; // Try for 2 seconds (20 * 100ms)
        
        // Try to load Turnstile (but don't block forms if it fails)
        function setupTurnstile() {
            if (!window.turnstile && turnstileAttempts < MAX_TURNSTILE_ATTEMPTS) {
                turnstileAttempts++;
                setTimeout(setupTurnstile, 100);
                return;
            }
            
            if (!window.turnstile) {
                console.warn('Turnstile failed to load - forms will work without verification');
                return;
            }
            
            // Find all volunteer/RSVP forms
            const forms = document.querySelectorAll('.volunteer-form, .event-rsvp-form');
            
            forms.forEach(function(form) {
                // Prevent duplicate initialization
                if (form.dataset.turnstileInit) return;
                form.dataset.turnstileInit = 'true';
                
                // Add Turnstile widget container
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton && submitButton.parentElement) {
                    const turnstileContainer = document.createElement('div');
                    turnstileContainer.className = 'cf-turnstile-container mb-3 d-flex justify-content-center';
                    submitButton.parentElement.parentElement.insertBefore(turnstileContainer, submitButton.parentElement);
                    
                    // Render Turnstile widget with error callback
                    try {
                        window.turnstile.render(turnstileContainer, {
                            sitekey: TURNSTILE_SITE_KEY,
                            theme: 'light',
                            size: 'normal',
                            'error-callback': function() {
                                console.error('Turnstile error callback triggered');
                                turnstileContainer.innerHTML = '<div class="alert alert-warning small mb-2">Security verification temporarily unavailable. Your submission will be manually reviewed.</div>';
                            }
                        });
                    } catch (error) {
                        console.error('Failed to render Turnstile:', error);
                    }
                }
            });
        }
        
        // Always attach form submission handlers (don't wait for Turnstile)
        try {
            const forms = document.querySelectorAll('.volunteer-form, .event-rsvp-form');
            console.log('Found ' + forms.length + ' forms to attach handlers');
            
            forms.forEach(function(form) {
                // Prevent duplicate initialization
                if (form.dataset.formInit) return;
                form.dataset.formInit = 'true';
                
                const submitButton = form.querySelector('button[type="submit"]');
                if (!submitButton) return;
                
                console.log('Attaching submit handler');
                
                // Handle form submission
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    console.log('Form submit handler called');
                
                const originalButtonText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
                
                // Clear existing messages
                clearFormMessage(form);
                
                try {
                    const formData = new FormData(form);
                    const turnstileToken = formData.get('cf-turnstile-response') || '';
                    
                    const data = {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        zip: formData.get('zip') || '',
                        source: formData.get('whichform') || formData.get('event') || 'homepage',
                        'cf-turnstile-response': turnstileToken
                    };
                    
                    // Add address if present (for petition pledges)
                    if (formData.get('address')) {
                        data.address = formData.get('address');
                    }
                    
                    // Log whether Turnstile was available
                    if (turnstileToken) {
                        console.log('Submitting with Turnstile token');
                    } else {
                        console.warn('Submitting WITHOUT Turnstile token (verification unavailable or blocked)');
                    }
                    
                    fetch(WORKER_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    })
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(result) {
                        if (result.success) {
                        // Replace entire form with success message and donate buttons
                        const formContainer = form.parentElement;
                        formContainer.innerHTML = `
                            <div class="text-center py-5">
                                <div class="mb-4">
                                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #28a745;"></i>
                                </div>
                                <h3 class="fw-bold mb-3">Thank you for signing up!</h3>
                                <p class="mb-4" style="font-size: 1.1rem; color: #495057;">
                                    ${result.message || 'We will be in touch soon with updates about the campaign.'}
                                </p>
                                <div class="d-grid gap-3 d-md-flex justify-content-md-center mt-4">
                                    <a href="https://secure.votevega.nyc/donate?amount=2500" class="btn btn-primary btn-lg">
                                        <i class="fas fa-heart me-2"></i>Donate $25
                                    </a>
                                    <a href="https://secure.votevega.nyc/donate?amount=5000" class="btn btn-primary btn-lg">
                                        <i class="fas fa-heart me-2"></i>Donate $50
                                    </a>
                                    <a href="https://secure.votevega.nyc/donate" class="btn btn-outline-primary btn-lg">
                                        <i class="fas fa-donate me-2"></i>Other Amount
                                    </a>
                                </div>
                            </div>
                        `;
                            formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                            showVolunteerFormMessage(form, result.error || 'An error occurred. Please try again.', 'error');
                            
                            // Reset Turnstile on error
                            const turnstileContainer = form.querySelector('.cf-turnstile-container');
                            if (turnstileContainer && window.turnstile) {
                                window.turnstile.reset(turnstileContainer);
                            }
                        }
                    })
                    .catch(function(error) {
                        console.error('Form submission error:', error);
                        showVolunteerFormMessage(form, 'Network error. Please check your connection and try again.', 'error');
                    })
                    .finally(function() {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonText;
                    });
                } catch (error) {
                    console.error('Form handler error:', error);
                    alert('Form error: ' + error.message + '. Please screenshot this and contact support.');
                }
                });
            });
        } catch (error) {
            console.error('Form initialization error:', error);
            alert('Failed to initialize forms: ' + error.message);
        }
        
        // Try to load Turnstile widget (but forms work without it)
        setupTurnstile();
    }
    
    // Show message for volunteer forms
    function showVolunteerFormMessage(form, message, type) {
        clearFormMessage(form);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message alert ${type === 'success' ? 'alert-success' : 'alert-danger'} mt-3`;
        messageDiv.style.borderRadius = '8px';
        messageDiv.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
            ${message}
        `;
        
        form.parentElement.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        if (type === 'success') {
            setTimeout(function() {
                if (messageDiv.parentElement) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
    
    // Clear form message
    function clearFormMessage(form) {
        const existingMessage = form.parentElement.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // Handle email parameter from footer signup on other pages
    function initEmailParameterHandling() {
        // Check if we're on the homepage and have an email parameter
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');
        
        if (emailParam && emailParam.includes('@')) {
            // Wait for DOM to be ready
            setTimeout(function() {
                const emailField = document.getElementById('email');
                const volunteerSection = document.getElementById('volunteer');
                
                if (emailField && volunteerSection) {
                    // Pre-fill the email field
                    emailField.value = emailParam;
                    
                    // Scroll to volunteer section with navbar offset
                    const sectionTop = volunteerSection.offsetTop - 80;
                    window.scrollTo({
                        top: sectionTop,
                        behavior: 'smooth'
                    });
                    
                    // Add highlight effect and focus
                    setTimeout(function() {
                        emailField.focus();
                        emailField.style.boxShadow = '0 0 15px rgba(220, 53, 69, 0.4)';
                        
                        // Remove the URL parameter for cleaner URL
                        const newUrl = new URL(window.location);
                        newUrl.searchParams.delete('email');
                        window.history.replaceState({}, '', newUrl.toString());
                        
                        // Remove highlight after 3 seconds
                        setTimeout(function() {
                            emailField.style.boxShadow = '';
                        }, 3000);
                    }, 800);
                }
            }, 100);
        }
    }

    // Expose some functions globally if needed
    window.VoteVega = {
        trackEvent: trackEvent,
        showFormMessage: showFormMessage
    };

})();
