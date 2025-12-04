import { productsAPI } from './axios-config';

export const getAllProducts = async () => {
  const response = await productsAPI.get('/products');
  return response.data;
};

export const getProductById = async (id) => {
  const response = await productsAPI.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const formData = new FormData();
  
  // Only append product-specific fields
  const productFields = ['name', 'description', 'sku', 'price'];
  
  for (const key of productFields) {
    if (productData[key] !== null && productData[key] !== undefined) {
      formData.append(key, productData[key]);
    }
  }
  
  // Convert boolean to 1/0 for Laravel
  if (productData.active !== null && productData.active !== undefined) {
    formData.append('active', productData.active ? 1 : 0);
  }
  
  // Only append image if it exists and is a File object
  if (productData.image && productData.image instanceof File) {
    formData.append('image', productData.image);
  }
  
  const response = await productsAPI.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const formData = new FormData();
  
  // Only append product-specific fields
  const productFields = ['name', 'description', 'sku', 'price'];
  
  for (const key of productFields) {
    if (productData[key] !== null && productData[key] !== undefined) {
      formData.append(key, productData[key]);
    }
  }
  
  // Convert boolean to 1/0 for Laravel
  if (productData.active !== null && productData.active !== undefined) {
    formData.append('active', productData.active ? 1 : 0);
  }
  
  // Only append image if it exists and is a File object
  if (productData.image && productData.image instanceof File) {
    formData.append('image', productData.image);
  }
  
  const response = await productsAPI.post(`/products/${id}?_method=PUT`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await productsAPI.delete(`/products/${id}`);
  return response.data;
};

export const registerProductsUser = async (userData) => {
  const response = await productsAPI.post('/auth/register', userData);
  return response.data;
};

export const loginProductsUser = async (credentials) => {
  const response = await productsAPI.post('/auth/login', credentials);
  return response.data;
};

export const getProductsUserProfile = async () => {
  const response = await productsAPI.get('/auth/me');
  return response.data;
};

export const refreshProductsToken = async () => {
  const response = await productsAPI.post('/auth/refresh');
  return response.data;
};

export const logoutProductsUser = async () => {
  const response = await productsAPI.post('/auth/logout');
  return response.data;
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  registerProductsUser,
  loginProductsUser,
  getProductsUserProfile,
  refreshProductsToken,
  logoutProductsUser
};
