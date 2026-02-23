// Form handlers for API integration

document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('loginBtn');
            const btnText = document.getElementById('loginBtnText');
            const btnSpinner = document.getElementById('loginBtnSpinner');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Disable button and show spinner
            submitBtn.disabled = true;
            btnText.textContent = 'Signing in...';
            btnSpinner.classList.remove('d-none');
            
            try {
                const response = await api.login(email, password, rememberMe);
                
                if (response.success) {
                    showNotification(response.message || 'Login successful!', 'success');
                    // Redirect after short delay
                    setTimeout(() => {
                        // Check for redirect parameter in URL
                        const urlParams = new URLSearchParams(window.location.search);
                        const redirect = urlParams.get('redirect');
                        window.location.href = response.redirect || redirect || '/';
                    }, 500);
                } else {
                    showNotification(response.message || 'Login failed', 'danger');
                    submitBtn.disabled = false;
                    btnText.textContent = 'Sign In';
                    btnSpinner.classList.add('d-none');
                }
            } catch (error) {
                showNotification(error.message || 'An error occurred. Please try again.', 'danger');
                submitBtn.disabled = false;
                btnText.textContent = 'Sign In';
                btnSpinner.classList.add('d-none');
            }
        });
    }
    
    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                phone: document.getElementById('phone').value || ''
            };
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registering...';
            
            try {
                const response = await api.register(formData);
                
                if (response.success) {
                    showNotification(response.message || 'Registration successful!', 'success');
                    // Redirect to login after short delay
                    setTimeout(() => {
                        window.location.href = '/login?message=' + encodeURIComponent(response.message || 'Registration successful! Please login.');
                    }, 1500);
                } else {
                    showNotification(response.message || 'Registration failed', 'danger');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Register';
                }
            } catch (error) {
                showNotification(error.message || 'An error occurred. Please try again.', 'danger');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Register';
            }
        });
    }
    
    // Contact form handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
            
            try {
                const response = await api.submitContact(formData);
                
                if (response.success) {
                    showNotification(response.message || 'Message sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    showNotification(response.message || 'Failed to send message', 'danger');
                }
            } catch (error) {
                showNotification(error.message || 'An error occurred. Please try again.', 'danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Message';
            }
        });
    }
    
    // Review form handler
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const ratingSelect = document.getElementById('rating');
            const rating = ratingSelect ? ratingSelect.value : null;
            const comment = document.getElementById('comment') ? document.getElementById('comment').value : '';
            
            if (!rating || !comment.trim()) {
                showNotification('Please provide both rating and comment', 'danger');
                return;
            }
            
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
            
            try {
                const response = await api.submitReview(parseInt(rating), comment);
                
                if (response.success) {
                    showNotification(response.message || 'Review submitted successfully!', 'success');
                    reviewForm.reset();
                    // Reload reviews after short delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showNotification(response.message || 'Failed to submit review', 'danger');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            } catch (error) {
                showNotification(error.message || 'An error occurred. Please try again.', 'danger');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // Order form handler
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = orderForm.querySelector('button[type="submit"]');
            const btnText = document.getElementById('orderBtnText');
            const btnSpinner = document.getElementById('orderBtnSpinner');
            
            // Get form values
            const deliveryAddress = document.getElementById('delivery_address').value.trim();
            const contactNumber = document.getElementById('contact_number').value.trim();
            const paymentMethod = document.getElementById('payment_method').value;
            const notes = document.getElementById('notes').value.trim();
            
            // Validation
            if (!deliveryAddress) {
                showNotification('Please enter a delivery address', 'danger');
                return;
            }
            
            if (!contactNumber) {
                showNotification('Please enter a contact number', 'danger');
                return;
            }
            
            if (!paymentMethod) {
                showNotification('Please select a payment method', 'danger');
                return;
            }
            
            const formData = {
                delivery_address: deliveryAddress,
                contact_number: contactNumber,
                payment_method: paymentMethod,
                notes: notes || ''
            };
            
            // Disable button and show spinner
            submitBtn.disabled = true;
            if (btnText) btnText.textContent = 'Placing Order...';
            if (btnSpinner) btnSpinner.classList.remove('d-none');
            
            try {
                const response = await api.submitOrder(formData);
                
                if (response.success) {
                    showNotification(response.message || 'Order placed successfully!', 'success');
                    // Redirect to orders page after short delay
                    setTimeout(() => {
                        window.location.href = '/my-orders?message=' + encodeURIComponent(response.message || 'Order placed successfully!');
                    }, 1500);
                } else {
                    showNotification(response.message || 'Failed to place order', 'danger');
                    submitBtn.disabled = false;
                    if (btnText) btnText.textContent = 'Confirm Order';
                    if (btnSpinner) btnSpinner.classList.add('d-none');
                }
            } catch (error) {
                console.error('Order submission error:', error);
                let errorMessage = 'An error occurred. Please try again.';
                if (error.message) {
                    errorMessage = error.message;
                } else if (error.toString().includes('Failed to fetch') || error.toString().includes('NetworkError')) {
                    errorMessage = 'Unable to connect to server. Please check your connection and try again.';
                }
                showNotification(errorMessage, 'danger');
                submitBtn.disabled = false;
                if (btnText) btnText.textContent = 'Confirm Order';
                if (btnSpinner) btnSpinner.classList.add('d-none');
            }
        });
    }
});
