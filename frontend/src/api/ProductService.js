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

  analyzeImages: async (imageFiles, productListId = null) => {
    const formData = new FormData();
    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    
    files.forEach((file) => {
      formData.append('images[]', file);
    });

    if (productListId) {
      formData.append('product_list_id', productListId);
    }

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

  deleteProductsBulk: async (ids) => {
    const response = await apiClient.post('/products/bulk-delete', { ids });
    return response.data;
  },

  getPlatforms: async () => {
    const response = await apiClient.get('/platforms');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  updatePlatform: async (id, data) => {
    const response = await apiClient.put(`/platforms/${id}`, data);
    return response.data;
  },

  createExport: async (productId, platformId) => {
    const response = await apiClient.post('/exports', {
      product_id: productId,
      platform_id: platformId,
    });
    return response.data;
  },

  createListExport: async (productListId, platformId) => {
    const response = await apiClient.post('/exports/list', {
      product_list_id: productListId,
      platform_id: platformId,
    });
    return response.data;
  },

  getDownloadUrl: (exportId) => {
    return `${API_URL}/exports/${exportId}/download`;
  },

  getProductLists: async (page = 1) => {
    const response = await apiClient.get(`/product-lists?page=${page}`);
    return response.data;
  },

  getProductList: async (id) => {
    const response = await apiClient.get(`/product-lists/${id}`);
    return response.data;
  },

  createProductList: async (data) => {
    const response = await apiClient.post('/product-lists', data);
    return response.data;
  },

  deleteProductList: async (id) => {
    const response = await apiClient.delete(`/product-lists/${id}`);
    return response.data;
  },
};
