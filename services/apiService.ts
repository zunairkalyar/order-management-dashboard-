import axios from 'axios';
import { Order, Customer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderService = {
  // Orders
  async getAllOrders(): Promise<Order[]> {
    const response = await api.get('/orders');
    return response.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const response = await api.post('/orders', order);
    return response.data;
  },

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    const response = await api.put(`/orders/${id}`, order);
    return response.data;
  },

  async deleteOrder(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  },

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    const response = await api.get('/customers');
    return response.data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const response = await api.post('/customers', customer);
    return response.data;
  },

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    const response = await api.put(`/customers/${id}`, customer);
    return response.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  // Audit Trail
  async getOrderAuditTrail(orderId: string): Promise<any[]> {
    const response = await api.get(`/audit/order/${orderId}`);
    return response.data;
  },

  async createAuditLog(data: { orderId: string; action: string; description: string }): Promise<any> {
    const response = await api.post('/audit', data);
    return response.data;
  }
};
