import apiClient from './client';

export const ProductService = {
  getProducts: async (page = 1) => {
    const response = await apiClient.get(`/products?page=${page}`);
    return response.data;
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  analyzeImages: async (imageFiles) => {
    const formData = new FormData();
    // Ensure we handle both single file and array of files
    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    
    files.forEach((file) => {
      formData.append('images[]', file);
    });

    const response = await apiClient.post('/products/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
