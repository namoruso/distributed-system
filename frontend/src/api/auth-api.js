import { authAPI } from './axios-config.js';

export const register = async (userData) => {
  const response = await authAPI.post('/registro', {
    nombre: userData.name,
    correo: userData.email,
    clave: userData.password,
    clave2: userData.passwordConfirm
  });
  return response.data;
};

export const verifyEmail = async (email, code) => {
  const response = await authAPI.post('/verificar', {
    correo: email,
    codigo: code
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await authAPI.post('/login', {
    correo: email,
    clave: password
  });
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await authAPI.get('/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await authAPI.get('/debug/lista');
  return response.data;
};

export default {
  register,
  verifyEmail,
  login,
  getCurrentUser,
  getAllUsers
};
