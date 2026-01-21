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
        const TURNSTILE_SITE_KEY = '0x4AAAAAACN4JzJOU76zayw9';
        
        // Wait for Turnstile to load
        function setupForms() {
            if (!window.turnstile) {
                setTimeout(setupForms, 100);
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
                    
                    // Render Turnstile widget
                    window.turnstile.render(turnstileContainer, {
                        sitekey: TURNSTILE_SITE_KEY,
                        theme: 'light',
                        size: 'normal'
                    });
                }
            
            // Handle form submission
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const originalButtonText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
                
                // Clear existing messages
                clearFormMessage(form);
                
                try {
                    const formData = new FormData(form);
                    const data = {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        zip: formData.get('zip') || '',
                        source: formData.get('whichform') || formData.get('event') || 'homepage',
                        'cf-turnstile-response': formData.get('cf-turnstile-response')
                    };
                    
                    console.log('Turnstile token:', data['cf-turnstile-response']);
                    
                    const response = await fetch(WORKER_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        showVolunteerFormMessage(form, result.message || 'Thank you for signing up!', 'success');
                        form.reset();
                        
                        // Reset Turnstile
                        const turnstileContainer = form.querySelector('.cf-turnstile-container');
                        if (turnstileContainer && window.turnstile) {
                            window.turnstile.reset(turnstileContainer);
                        }
                    } else {
                        showVolunteerFormMessage(form, result.error || 'An error occurred. Please try again.', 'error');
                        
                        // Reset Turnstile on error
                        const turnstileContainer = form.querySelector('.cf-turnstile-container');
                        if (turnstileContainer && window.turnstile) {
                            window.turnstile.reset(turnstileContainer);
                        }
                    }
                } catch (error) {
                    console.error('Form submission error:', error);
                    showVolunteerFormMessage(form, 'Network error. Please check your connection and try again.', 'error');
                } finally {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                });
            });
        }
        
        // Start setup
        setupForms();
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
