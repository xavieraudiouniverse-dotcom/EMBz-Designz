import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

// ---- Storefront ----
export const fetchProducts = (params) =>
  client.get("/products", { params }).then((r) => r.data);
export const fetchProduct = (id) =>
  client.get(`/products/${id}`).then((r) => r.data);
export const fetchCategories = () =>
  client.get("/categories").then((r) => r.data);
export const getShippingQuote = (payload) =>
  client.post("/shipping/quote", payload).then((r) => r.data);
export const submitCheckout = (payload) =>
  client.post("/checkout", payload).then((r) => r.data);
export const startPayment = (payload) =>
  client.post("/payments/checkout", payload).then((r) => r.data);
export const paymentStatus = (sessionId) =>
  client.get(`/payments/status/${sessionId}`).then((r) => r.data);
export const fetchOrder = (externalNumber) =>
  client.get(`/orders/${externalNumber}`).then((r) => r.data);
export const fetchTracking = (externalNumber) =>
  client.get(`/orders/${externalNumber}/tracking`).then((r) => r.data);

// ---- Admin ----
export const merchizeHealth = () =>
  client.get("/merchize/health").then((r) => r.data);
export const syncCatalog = () =>
  client.post("/admin/sync-catalog").then((r) => r.data);
export const syncStatus = () =>
  client.get("/admin/sync-status").then((r) => r.data);
export const fetchAdminCatalog = (params) =>
  client.get("/admin/catalog", { params }).then((r) => r.data);
export const fetchAdminCatalogCategories = () =>
  client.get("/admin/catalog/categories").then((r) => r.data);
export const fetchAdminCatalogDetail = (id) =>
  client.get(`/admin/catalog/${id}`).then((r) => r.data);
export const importProduct = (payload) =>
  client.post("/admin/store-products", payload).then((r) => r.data);
export const fetchStoreProducts = () =>
  client.get("/admin/store-products").then((r) => r.data);
export const updateStoreProduct = (id, payload) =>
  client.put(`/admin/store-products/${id}`, payload).then((r) => r.data);
export const deleteStoreProduct = (id) =>
  client.delete(`/admin/store-products/${id}`).then((r) => r.data);
export const fetchAdminOrders = (status) =>
  client.get("/admin/orders", { params: status ? { status } : {} }).then((r) => r.data);
export const orderAction = (externalNumber, action) =>
  client.post(`/admin/orders/${externalNumber}/${action}`).then((r) => r.data);

export default client;
