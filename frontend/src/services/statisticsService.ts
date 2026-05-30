import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = Cookies.get('authToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const statisticsService = {
    async getOverview() {
        const response = await axios.get(
            `${API_URL}/door-locks/statistics/overview`,
            getAuthHeaders()
        );
        return response.data;
    },

    async getUsageTimeline() {
        const response = await axios.get(
            `${API_URL}/door-locks/statistics/usage-timeline`,
            getAuthHeaders()
        );
        return response.data;
    },

    async getMostUsed() {
        const response = await axios.get(
            `${API_URL}/door-locks/statistics/most-used`,
            getAuthHeaders()
        );
        return response.data;
    },

    async getStatusDistribution() {
        const response = await axios.get(
            `${API_URL}/door-locks/statistics/status-distribution`,
            getAuthHeaders()
        );
        return response.data;
    },

    async getRecentActivity() {
        const response = await axios.get(
            `${API_URL}/door-locks/statistics/recent-activity`,
            getAuthHeaders()
        );
        return response.data;
    },
};
