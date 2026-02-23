// API Client for Meraki Coffee House
// Get API URL from script tag data attribute or default
const getApiBaseUrl = () => {
    // Check if we are on the live site
    if (window.location.hostname === 'meraki.aangandevelopers.com') {
        return 'https://meraki.aangandevelopers.com/api';
    }
    // Always use the backend API URL for local development (port 5007)
    return 'http://localhost:5007/api';
};

class ApiClient {
    constructor() {
        this.baseURL = getApiBaseUrl();
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            credentials: 'include', // Include cookies for session
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async login(email, password, rememberMe = false) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, rememberMe })
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    // Menu endpoints
    async getMenu() {
        return this.request('/menu');
    }

    async getFeaturedItems() {
        return this.request('/menu/featured');
    }

    async getMenuItem(id) {
        return this.request(`/menu/${id}`);
    }

    async addToCart(itemId, quantity) {
        return this.request('/menu/add-to-cart', {
            method: 'POST',
            body: JSON.stringify({ itemId, quantity })
        });
    }

    async getCart() {
        return this.request('/menu/cart/items');
    }

    async updateCart(itemId, quantity) {
        return this.request('/menu/update-cart', {
            method: 'POST',
            body: JSON.stringify({ itemId, quantity })
        });
    }

    async removeFromCart(itemId) {
        return this.request('/menu/remove-from-cart', {
            method: 'POST',
            body: JSON.stringify({ itemId })
        });
    }

    async clearCart() {
        return this.request('/menu/clear-cart', {
            method: 'POST'
        });
    }

    // Order endpoints
    async getCartSummary() {
        return this.request('/order/cart-summary');
    }

    async submitOrder(orderData) {
        return this.request('/order/submit', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getMyOrders() {
        return this.request('/order/my-orders');
    }

    async getOrder(id) {
        return this.request(`/order/${id}`);
    }

    // Review endpoints
    async getReviews() {
        return this.request('/review');
    }

    async getFeaturedReviews(limit = 3) {
        return this.request(`/review/featured?limit=${limit}`);
    }

    async submitReview(rating, comment) {
        return this.request('/review/submit', {
            method: 'POST',
            body: JSON.stringify({ rating, comment })
        });
    }

    // Contact endpoint
    async submitContact(formData) {
        return this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Admin endpoints
    async getDashboardStats() {
        return this.request('/admin/dashboard');
    }

    async getAdminMenu() {
        return this.request('/admin/menu');
    }

    async addMenuItem(itemData) {
        return this.request('/admin/menu/add', {
            method: 'POST',
            body: JSON.stringify(itemData)
        });
    }

    async updateMenuItem(id, itemData) {
        return this.request(`/admin/menu/${id}`, {
            method: 'PUT',
            body: JSON.stringify(itemData)
        });
    }

    async deleteMenuItem(id) {
        return this.request(`/admin/menu/${id}`, {
            method: 'DELETE'
        });
    }

    async getAdminOrders() {
        return this.request('/admin/orders');
    }

    async updateOrderStatus(id, status) {
        return this.request(`/admin/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async getAdminReviews() {
        return this.request('/admin/reviews');
    }

    async approveReview(id) {
        return this.request(`/admin/reviews/${id}/approve`, {
            method: 'PUT'
        });
    }

    async deleteReview(id) {
        return this.request(`/admin/reviews/${id}`, {
            method: 'DELETE'
        });
    }

    async getContactMessages() {
        return this.request('/admin/contact-messages');
    }

    async replyToContactMessage(messageId, replyData) {
        return this.request(`/admin/contact-messages/${messageId}/reply`, {
            method: 'POST',
            body: JSON.stringify(replyData)
        });
    }

    async deleteContactMessage(messageId) {
        return this.request(`/admin/contact-messages/${messageId}`, {
            method: 'DELETE'
        });
    }
}

// Create and export API client instance
const api = new ApiClient();
