import axios from "axios";
import { API_URL } from "./apiEndPoints";

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      const header = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      config.headers.Authorization = header;
    }
  }
  return config;
});

export type ReportsSummary = {
  invoices: number;
  total_billed: number;
  total_paid: number;
  sales: number;
  total_sales: number;
  purchases: number;
  total_purchases: number;
  profit: number;
  overdue: number;
  low_stock: Array<{
    id: number;
    name: string;
    sku: string;
    stock_on_hand: number;
    reorder_level: number;
  }>;
};

export type Product = {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  price: string;
  cost?: string | null;
  gst_rate: string;
  stock_on_hand: number;
  reorder_level: number;
  category?: { id: number; name: string } | null;
};

export type Category = {
  id: number;
  name: string;
};

export type ProductInput = {
  name: string;
  sku: string;
  price: number;
  cost?: number | null;
  barcode?: string | null;
  gst_rate?: number | null;
  stock_on_hand?: number | null;
  reorder_level?: number | null;
  category_id?: number | null;
};

export type Customer = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type CustomerInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type Supplier = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type SupplierInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type Purchase = {
  id: number;
  purchase_date: string;
  subtotal: string;
  tax: string;
  total: string;
  notes?: string | null;
  supplier?: Supplier | null;
  warehouse?: { id: number; name: string } | null;
  items: Array<{
    id: number;
    product_id?: number | null;
    name: string;
    quantity: number;
    unit_cost: string;
    tax_rate?: string | null;
    line_total: string;
  }>;
};

export type PurchaseInput = {
  supplier_id?: number | null;
  warehouse_id?: number | null;
  purchase_date?: string | Date | null;
  notes?: string | null;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_cost: number;
    tax_rate?: number | null;
  }>;
};

export type Sale = {
  id: number;
  sale_date: string;
  status: string;
  subtotal: string;
  tax: string;
  total: string;
  customer?: Customer | null;
  items: Array<{
    id: number;
    product_id?: number | null;
    name: string;
    quantity: number;
    unit_price: string;
    tax_rate?: string | null;
    line_total: string;
  }>;
};

export type SaleInput = {
  customer_id?: number | null;
  warehouse_id?: number | null;
  sale_date?: string | Date | null;
  status?: string | null;
  notes?: string | null;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    tax_rate?: number | null;
  }>;
};

export type Warehouse = {
  id: number;
  name: string;
  location?: string | null;
  inventories?: Array<{
    id: number;
    quantity: number;
    product: Product;
  }>;
};

export type Inventory = {
  id: number;
  quantity: number;
  warehouse: Warehouse;
  product: Product;
};

export const fetchReportsSummary = async (): Promise<ReportsSummary> => {
  const response = await apiClient.get("/reports/summary");
  return response.data.data as ReportsSummary;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get("/products");
  return response.data.data as Product[];
};

export const createProduct = async (
  payload: ProductInput,
): Promise<Product> => {
  const response = await apiClient.post("/products", payload);
  return response.data.data as Product;
};

export const updateProduct = async (
  id: number,
  payload: Partial<ProductInput>,
): Promise<void> => {
  await apiClient.put(`/products/${id}`, payload);
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get("/customers");
  return response.data.data as Customer[];
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get("/categories");
  return response.data.data as Category[];
};

export const createCustomer = async (
  payload: CustomerInput,
): Promise<Customer> => {
  const response = await apiClient.post("/customers", payload);
  return response.data.data as Customer;
};

export const updateCustomer = async (
  id: number,
  payload: Partial<CustomerInput>,
): Promise<void> => {
  await apiClient.put(`/customers/${id}`, payload);
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiClient.delete(`/customers/${id}`);
};

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const response = await apiClient.get("/suppliers");
  return response.data.data as Supplier[];
};

export const createSupplier = async (
  payload: SupplierInput,
): Promise<Supplier> => {
  const response = await apiClient.post("/suppliers", payload);
  return response.data.data as Supplier;
};

export const updateSupplier = async (
  id: number,
  payload: Partial<SupplierInput>,
): Promise<void> => {
  await apiClient.put(`/suppliers/${id}`, payload);
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await apiClient.delete(`/suppliers/${id}`);
};

export const fetchPurchases = async (): Promise<Purchase[]> => {
  const response = await apiClient.get("/purchases");
  return response.data.data as Purchase[];
};

export const createPurchase = async (
  payload: PurchaseInput,
): Promise<Purchase> => {
  const response = await apiClient.post("/purchases", payload);
  return response.data.data as Purchase;
};

export const updatePurchase = async (
  id: number,
  payload: PurchaseInput,
): Promise<Purchase> => {
  const response = await apiClient.put(`/purchases/${id}`, payload);
  return response.data.data as Purchase;
};

export const fetchSales = async (): Promise<Sale[]> => {
  const response = await apiClient.get("/sales");
  return response.data.data as Sale[];
};

export const createSale = async (payload: SaleInput): Promise<Sale> => {
  const response = await apiClient.post("/sales", payload);
  return response.data.data as Sale;
};

export const updateSale = async (
  id: number,
  payload: { status?: string; notes?: string },
): Promise<void> => {
  await apiClient.put(`/sales/${id}`, payload);
};

export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  const response = await apiClient.get("/warehouses");
  return response.data.data as Warehouse[];
};

export const fetchWarehouse = async (
  warehouseId: number,
): Promise<Warehouse> => {
  const response = await apiClient.get(`/warehouses/${warehouseId}`);
  return response.data.data as Warehouse;
};

export const fetchInventories = async (
  warehouseId?: number,
): Promise<Inventory[]> => {
  const response = await apiClient.get("/inventories", {
    params: warehouseId ? { warehouse_id: warehouseId } : undefined,
  });
  return response.data.data as Inventory[];
};

export default apiClient;
