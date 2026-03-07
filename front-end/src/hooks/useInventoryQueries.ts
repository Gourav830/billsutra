"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPurchase,
  updatePurchase,
  createSale,
  createSupplier,
  deleteSupplier,
  createProduct,
  deleteProduct,
  createCustomer,
  deleteCustomer,
  fetchCategories,
  fetchCustomers,
  fetchProducts,
  fetchPurchases,
  fetchSales,
  fetchInvoices,
  fetchInvoice,
  createInvoice,
  deleteInvoice,
  fetchSuppliers,
  fetchWarehouse,
  fetchWarehouses,
  fetchInventories,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  adjustInventory,
  updateSale,
  updateSupplier,
  updateProduct,
  updateCustomer,
} from "@/lib/apiClient";

export const useProductsQuery = () =>
  useQuery({ queryKey: ["products"], queryFn: fetchProducts });

export const useCategoriesQuery = () =>
  useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

export const useCustomersQuery = () =>
  useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) => updateProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) => updateCustomer(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
};

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
};

export const useSuppliersQuery = () =>
  useQuery({ queryKey: ["suppliers"], queryFn: fetchSuppliers });

export const useCreateSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useUpdateSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) => updateSupplier(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useDeleteSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const usePurchasesQuery = () =>
  useQuery({ queryKey: ["purchases"], queryFn: fetchPurchases });

export const useCreatePurchaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPurchase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  });
};

export const useUpdatePurchaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updatePurchase>[1];
    }) => updatePurchase(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  });
};

export const useSalesQuery = () =>
  useQuery({ queryKey: ["sales"], queryFn: fetchSales });

export const useInvoicesQuery = () =>
  useQuery({ queryKey: ["invoices"], queryFn: fetchInvoices });

export const useInvoiceQuery = (invoiceId?: number) =>
  useQuery({
    queryKey: ["invoices", invoiceId],
    queryFn: () => fetchInvoice(invoiceId ?? 0),
    enabled: Number.isFinite(invoiceId) && (invoiceId ?? 0) > 0,
  });

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
};

export const useDeleteInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
};

export const useCreateSaleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales"] }),
  });
};

export const useUpdateSaleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) => updateSale(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales"] }),
  });
};

export const useWarehousesQuery = () =>
  useQuery({ queryKey: ["warehouses"], queryFn: fetchWarehouses });

export const useCreateWarehouseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });
};

export const useUpdateWarehouseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) => updateWarehouse(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });
};

export const useDeleteWarehouseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });
};

export const useWarehouseQuery = (warehouseId: number) =>
  useQuery({
    queryKey: ["warehouses", warehouseId],
    queryFn: () => fetchWarehouse(warehouseId),
    enabled: Number.isFinite(warehouseId),
  });

export const useInventoriesQuery = (warehouseId?: number) =>
  useQuery({
    queryKey: ["inventories", warehouseId ?? "all"],
    queryFn: () => fetchInventories(warehouseId),
  });

export const useAdjustInventoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustInventory,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventories"] }),
        queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
      ]),
  });
};
