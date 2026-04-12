// Main JavaScript file for Meraki Coffee House
// Make sure api.js is loaded before this file

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing cart functionality');
    // Load user status and cart count on page load
    loadUserStatus();
    loadCartCount();
    checkLoginMessage();

    // Initialize animations and scroll effects
    initializeScrollEffects();
    initializeAnimations();

    // Add to Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    console.log('Found add-to-cart buttons:', addToCartButtons.length);

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            console.log('Add to cart button clicked', this.dataset);
            const itemId = this.dataset.id;
            const itemName = this.dataset.name;
            const quantityInput = document.getElementById(`qty-${itemId}`);
            const quantity = quantityInput ? quantityInput.value : 1;
            console.log('Adding item to cart:', { itemId, itemName, quantity });

            // Disable button during request
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Adding...';

            api.addToCart(itemId, parseInt(quantity))
                .then(data => {
                    console.log('API response:', data);
                    if (data.success) {
                        console.log('Cart updated successfully, new count:', data.cartCount);
                        // Update cart count
                        updateCartCount(data.cartCount);
                        showNotification(`${itemName} added to cart!`, 'success');
                    } else {
                        console.error('API returned error:', data.message);
                        showNotification('Error adding item to cart: ' + (data.message || 'Unknown error'), 'danger');
                    }
                })
                .catch(error => {
                    console.error('Error adding to cart:', error);
                    let errorMessage = 'Error adding item to cart';

                    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
                    } else if (error.message) {
                        errorMessage += ': ' + error.message;
                    }

                    showNotification(errorMessage, 'danger');
                })
                .finally(() => {
                    // Re-enable button
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-cart-plus me-1"></i> Add';
                });
        });
    });

    // Update cart item quantity
    document.querySelectorAll('.update-cart').forEach(input => {
        input.addEventListener('change', function () {
            const itemId = this.dataset.id;
            const quantity = this.value;

            api.updateCart(itemId, parseInt(quantity))
                .then(data => {
                    if (data.success) {
                        // Update total
                        const totalEl = document.getElementById('cart-total');
                        const summarySubtotal = document.getElementById('summary-subtotal');
                        if (totalEl) totalEl.textContent = '₹' + data.total;
                        if (summarySubtotal) summarySubtotal.textContent = '₹' + data.total;

                        // Update cart count
                        updateCartCount(data.cartCount);

                        // Update subtotal for this item
                        const row = document.getElementById(`cart-row-${itemId}`);
                        if (row) {
                            // Get price from data attribute instead of parsing text
                            const price = parseFloat(this.dataset.price);
                            const subtotal = (price * quantity).toFixed(2);
                            const subtotalEl = row.querySelector('.item-subtotal-display');
                            if (subtotalEl) {
                                subtotalEl.textContent = '₹' + subtotal;
                            }
                        }

                        showNotification('Cart updated', 'success');
                    } else {
                        showNotification('Error updating cart', 'danger');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Error updating cart', 'danger');
                });
        });
    });

    // Remove from cart
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', function () {
            const itemId = this.dataset.id;

            if (confirm('Remove this item from cart?')) {
                api.removeFromCart(itemId)
                    .then(data => {
                        if (data.success) {
                            // Remove row
                            const row = document.getElementById(`cart-row-${itemId}`);
                            if (row) {
                                row.remove();
                            }

                            // Update total
                            const totalEl = document.getElementById('cart-total');
                            const summarySubtotal = document.getElementById('summary-subtotal');
                            if (totalEl) totalEl.textContent = '₹' + data.total;
                            if (summarySubtotal) summarySubtotal.textContent = '₹' + data.total;

                            // Update cart count
                            if (data.cartCount > 0) {
                                updateCartCount(data.cartCount);
                            } else {
                                // Reload to show empty cart message
                                location.reload();
                            }

                            showNotification('Item removed from cart', 'success');
                        } else {
                            showNotification('Error removing item', 'danger');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('Error removing item', 'danger');
                    });
            }
        });
    });

    // Load cart count on page load
    loadCartCount();

    // Custom Quantity Steppers
    document.querySelectorAll('.qty-decrease').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            if (input && input.value > 1) {
                input.value = parseInt(input.value) - 1;
                input.dispatchEvent(new Event('change'));
            }
        });
    });

    document.querySelectorAll('.qty-increase').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            if (input && input.value < 10) {
                input.value = parseInt(input.value) + 1;
                input.dispatchEvent(new Event('change'));
            }
        });
    });
});


// Update cart count in navbar with enhanced animations
function updateCartCount(count) {
    console.log('Updating cart count to:', count);
    const cartBadge = document.getElementById('cart-count');
    const cartLink = document.querySelector('.cart-link');
    console.log('Cart badge element:', cartBadge);

    if (count > 0) {
        if (cartBadge) {
            const previousCount = parseInt(cartBadge.textContent) || 0;
            cartBadge.textContent = count;
            cartBadge.classList.remove('d-none'); // Show the badge

            // Animate badge if count increased
            if (count > previousCount) {
                cartBadge.style.animation = 'none';
                cartBadge.offsetHeight; // Trigger reflow
                cartBadge.style.animation = 'bounceIn 0.6s ease-out';
            }
        } else if (cartLink) {
            // Create badge if it doesn't exist
            const badge = document.createElement('span');
            badge.id = 'cart-count';
            badge.className = 'cart-badge badge bg-danger position-absolute top-0 start-100 translate-middle';
            badge.textContent = count;
            badge.style.animation = 'bounceIn 0.6s ease-out';
            cartLink.appendChild(badge);
        }

        // Show cart text on desktop if hidden
        const cartText = cartLink?.querySelector('.cart-text');
        if (cartText && window.innerWidth >= 576) {
            cartText.classList.remove('d-none');
        }
    } else {
        // Hide badge when count is 0
        if (cartBadge) {
            cartBadge.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                cartBadge.remove();
            }, 300);
        }

        // Hide cart text on mobile when empty
        const cartText = cartLink?.querySelector('.cart-text');
        if (cartText && window.innerWidth < 576) {
            cartText.classList.add('d-none');
        }
    }
}

// Load cart count from API
function loadCartCount() {
    api.getCart()
        .then(data => {
            if (data.success && data.cartCount > 0) {
                updateCartCount(data.cartCount);
            }
        })
        .catch(error => {
            // Silently fail - user might not be logged in or cart might be empty
            console.log('Could not load cart count:', error);
        });
}

// Load user authentication status
function loadUserStatus() {
    api.getCurrentUser()
        .then(data => {
            if (data.success && data.user) {
                updateUserUI(data.user);
            } else {
                updateUserUI(null);
            }
        })
        .catch(error => {
            updateUserUI(null);
            console.log('Could not load user status:', error);
        });
}

// Update user interface based on authentication status
function updateUserUI(user) {
    const userLinks = document.getElementById('user-links');
    if (!userLinks) return;

    if (user) {
        userLinks.innerHTML = `
            ${user.role === 'admin' ? `
                <li class="nav-item dropdown mx-2">
                  <a class="nav-link dropdown-toggle font-display text-warning" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-shield-alt me-1"></i> Admin
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2" aria-labelledby="adminDropdown">
                    <li>
                        <a class="dropdown-item py-2" href="/admin/dashboard">
                            <i class="fas fa-tachometer-alt me-2 text-primary"></i> <strong>Dashboard</strong>
                        </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item py-2" href="/admin/menu">
                            <i class="fas fa-utensils me-2 text-muted"></i> Manage Menu
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item py-2" href="/admin/orders">
                            <i class="fas fa-clipboard-list me-2 text-muted"></i> View Orders
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item py-2" href="/admin/reviews">
                            <i class="fas fa-comments me-2 text-muted"></i> Manage Reviews
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item py-2" href="/admin/contact-messages">
                            <i class="fas fa-envelope me-2 text-muted"></i> Messages
                        </a>
                    </li>
                  </ul>
                </li>
            ` : ''}
            <li class="nav-item mx-2">
              <a class="nav-link" href="/my-orders">
                <i class="fas fa-box me-1"></i> My Orders
              </a>
            </li>
            <li class="nav-item mx-2">
              <span class="navbar-text">
                Welcome, <strong>${user.name}</strong>
              </span>
            </li>
            <li class="nav-item ms-2">
              <a class="btn btn-outline-danger rounded-pill px-4 btn-sm" href="#" onclick="logout()">
                Logout
              </a>
            </li>
        `;
    } else {
        userLinks.innerHTML = `
            <li class="nav-item mx-2">
              <a class="nav-link" href="/login">
                <i class="fas fa-sign-in-alt me-1"></i> Login
              </a>
            </li>
            <li class="nav-item mx-2">
              <a class="nav-link" href="/register">
                <i class="fas fa-user-plus me-1"></i> Register
              </a>
            </li>
        `;
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        api.logout()
            .then(data => {
                showNotification(data.message || 'Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 500);
            })
            .catch(error => {
                console.error('Logout error:', error);
                // Still redirect even if logout fails on backend
                window.location.href = '/';
            });
    }
}

// Check for login success message from URL parameters
function checkLoginMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
        const loginMessageDiv = document.getElementById('login-message');
        const loginMessageText = document.getElementById('login-message-text');
        if (loginMessageDiv && loginMessageText) {
            loginMessageText.textContent = decodeURIComponent(message);
            loginMessageDiv.style.display = 'block';
            // Clean up URL
            const url = new URL(window.location);
            url.searchParams.delete('message');
            window.history.replaceState({}, '', url);
        }
    }
}

// Show notification
function showNotification(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 250px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Initialize scroll effects
function initializeScrollEffects() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initialize navbar enhancements
    initializeNavbarFeatures();
}

// Initialize enhanced navbar features
function initializeNavbarFeatures() {
    const searchToggle = document.querySelector('.search-toggle');
    const mobileSearchOverlay = document.querySelector('.mobile-search-overlay');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbarToggler = document.querySelector('.navbar-toggler');

    // Mobile search toggle
    if (searchToggle && mobileSearchOverlay) {
        searchToggle.addEventListener('click', () => {
            mobileSearchOverlay.classList.toggle('active');
            searchToggle.classList.toggle('active');
        });

        // Close mobile search when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileSearchOverlay.contains(e.target) && !searchToggle.contains(e.target)) {
                mobileSearchOverlay.classList.remove('active');
                searchToggle.classList.remove('active');
            }
        });
    }

    // Enhanced navbar collapse behavior
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', () => {
            setTimeout(() => {
                if (navbarCollapse.classList.contains('show')) {
                    // Menu opened
                    document.body.style.overflow = 'hidden';
                } else {
                    // Menu closed
                    document.body.style.overflow = '';
                    document.body.style.overflow = '';
                    if (mobileSearchOverlay) mobileSearchOverlay.classList.remove('active');
                    if (searchToggle) searchToggle.classList.remove('active');
                }
            }, 10);
        });

        // Close mobile menu when clicking on a link
        navbarCollapse.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link') && window.innerWidth < 992) {
                navbarToggler.click();
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('.navbar-nav .nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const offset = navbar.offsetHeight;
                const targetPosition = target.offsetTop - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Search functionality (basic implementation)
    const searchInputs = document.querySelectorAll('.search-input');
    const searchButtons = document.querySelectorAll('.search-btn');

    searchButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const input = searchInputs[index];
            if (input && input.value.trim()) {
                // Basic search functionality - can be enhanced
                console.log('Searching for:', input.value.trim());
                showNotification(`Searching for "${input.value.trim()}"...`, 'info');
                input.value = '';
            }
        });
    });

    // Enter key support for search
    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const btn = input.parentElement.querySelector('.search-btn');
                if (btn) btn.click();
            }
        });
    });
}

// Initialize animations
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections with fade-in class
    document.querySelectorAll('.section-fade-in').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        observer.observe(section);
    });

    // Staggered card animations
    document.querySelectorAll('.card-hover, .review-card').forEach((card, index) => {
        const delay = card.dataset.animationDelay || (index * 0.2);
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`;

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300);
    });
}

// Enhanced ripple effect with modern styling
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
        const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');

        // Create multiple ripple effects for modern look
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * (1.5 - i * 0.3);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: ${i === 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(212, 165, 116, 0.3)'};
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.8s ease-out;
                    pointer-events: none;
                    z-index: 10;
                `;

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 800);
            }, i * 100);
        }

        // Add a subtle scale animation
        button.style.transform = 'scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
});

// Add magnetic effect to buttons on hover
document.addEventListener('mousemove', function (e) {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / 10;
        const deltaY = (e.clientY - centerY) / 10;

        if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
            button.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        } else {
            button.style.transform = '';
        }
    });
});

// Add smooth reveal animations for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
        }
    });
}, observerOptions);

// Observe elements with data-reveal attribute
document.querySelectorAll('[data-reveal]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px) scale(0.95)';
    el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    observer.observe(el);
});
