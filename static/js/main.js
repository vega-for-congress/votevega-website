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
        initNavbarBehavior();
        initAnimations();
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

    // Expose some functions globally if needed
    window.VoteVega = {
        trackEvent: trackEvent,
        showFormMessage: showFormMessage
    };

})();
