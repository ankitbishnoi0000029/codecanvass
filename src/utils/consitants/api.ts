import axios from 'axios';

// Get the base URL for API calls (works in both client and server)
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // Client-side: use relative URL
        return '';
    }
    // Server-side: use environment variable or default to localhost
    return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000';
};

export const ssr = {
    getTT: async () => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/tt`);
            return response.data; // Return only the data, not the entire response object
        } catch (error) {
            // Properly handle and throw errors instead of returning them
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch trending tools'
                );
            }
            throw error;
        }
    },
    getPopular: async () => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/popular`);
            return response.data; // Return only the data, not the entire response object
        } catch (error) {
            // Properly handle and throw errors instead of returning them
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch trending tools'
                );
            }
            throw error;
        }
    },
    getDp: async () => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/dptools`);
            return response.data; // Return only the data, not the entire response object
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch trending tools'
                );
            }
            throw error;
        }
    },
   getNf : async () => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/nf`);
            return response.data; // Return only the data, not the entire response object
        } catch (error) {
            // Properly handle and throw errors instead of returning them
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch trending tools'
                );
            }
            throw error;
        }
    },
    getSn : async () => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/sub-categories`);
            return response.data; // Return only the data, not the entire response object
        } catch (error) {
            // Properly handle and throw errors instead of returning them
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch trending tools'
                );
            }
            throw error;
        }
    },
    getSQLcon : async () => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/sqlCon`);
            return response.data; // Return only the data, not the entire response object
        } catch (error) {
            // Properly handle and throw errors instead of returning them
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch trending tools'
                );
            }
            throw error;
        }
    },
    getSQLconBySlug: async (slug: string) => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/sqlCon`);
            const data = response.data;
            if (data.success && Array.isArray(data.data)) {
                const converter = data.data.find((item: any) => item.yrl === slug);
                return converter || null;
            }
            return null;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch SQL converter'
                );
            }
            throw error;
        }
    },
    getEandD : async () => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/encode_decode`);
            return response.data; // Return only the data, not the entire response object
        } catch (error) {
            // Properly handle and throw errors instead of returning them
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch trending tools'
                );
            }
            throw error;
        }
    },
    getSEOed: async (slug: string) => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/encode_decode`);
            const data = response.data;
            if (data.success && Array.isArray(data.data)) {
                const converter = data.data.find((item: any) => item.yrl === slug);
                return converter || null;
            }
            return null;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch SQL converter'
                );
            }
            throw error;
        }
    },
    getBase64 : async () => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/base64`);
            return response.data; // Return only the data, not the entire response object
        } catch (error) {
            // Properly handle and throw errors instead of returning them
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch trending tools'
                );
            }
            throw error;
        }
    },
    getSEObase64: async (slug: string) => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.get(`${baseUrl}/api/base64`);
            const data = response.data;
            if (data.success && Array.isArray(data.data)) {
                const converter = data.data.find((item: any) => item.yrl === slug);
                return converter || null;
            }
            return null;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.error || 
                    error.message || 
                    'Failed to fetch SQL converter'
                );
            }
            throw error;
        }
    },
};