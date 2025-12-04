import { inventoryAPI } from './axios-config';

export const getAllInventory = async () => {
  const response = await inventoryAPI.get('/inventory/all');
  return response.data;
};

export const getInventoryById = async (id) => {
  const response = await inventoryAPI.get(`/inventory/${id}`);
  return response.data;
};

export const addInventory = async (inventoryData) => {
  const response = await inventoryAPI.post('/inventory/add', inventoryData);
  return response.data;
};

export const updateInventory = async (id, inventoryData) => {
  const response = await inventoryAPI.put(`/inventory/update/${id}`, inventoryData);
  return response.data;
};

export const updateStock = async (id, mode, updateAmount) => {
  const response = await inventoryAPI.put(`/inventory/update/${id}/${mode}`, {
    update: updateAmount
  });
  return response.data;
};

export const increaseStock = async (id, amount) => {
  return updateStock(id, 'increase', amount);
};

export const decreaseStock = async (id, amount) => {
  return updateStock(id, 'decrease', amount);
};

export const deleteInventory = async (id) => {
  const response = await inventoryAPI.delete(`/inventory/delete/${id}`);
  return response.data;
};

export default {
  getAllInventory,
  getInventoryById,
  addInventory,
  updateInventory,
  updateStock,
  increaseStock,
  decreaseStock,
  deleteInventory
};
