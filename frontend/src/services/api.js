import axios from 'axios';

// Create an instance for easy configuration
const api = axios.create({
    baseURL: import.meta.env.PROD ? 'https://meraki.aangandevelopers.com/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5007/api'),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getMenu = async () => {
    const response = await api.get('/menu');
    return response.data;
};

export const getReviews = async () => {
    const response = await api.get('/reviews');
    return response.data;
};

export default api;
