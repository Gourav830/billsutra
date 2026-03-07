import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import CustomersController from "../controllers/CustomersController.js";
import CategoriesController from "../controllers/CategoriesController.js";
import ProductsController from "../controllers/ProductsController.js";
import InvoicesController from "../controllers/InvoicesController.js";
import PaymentsController from "../controllers/PaymentsController.js";
import ReportsController from "../controllers/ReportsController.js";
import SuppliersController from "../controllers/SuppliersController.js";
import PurchasesController from "../controllers/PurchasesController.js";
import SalesController from "../controllers/SalesController.js";
import WarehousesController from "../controllers/WarehousesController.js";
import InventoriesController from "../controllers/InventoriesController.js";
import AuthMiddleware from "../middlewares/AuthMIddleware.js";
import validate from "../middlewares/validate.js";
import {
  idParamSchema,
  authOauthSchema,
  authLoginSchema,
  authRegisterSchema,
  authForgotSchema,
  authResetSchema,
  customerCreateSchema,
  customerUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  supplierCreateSchema,
  supplierUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  invoiceCreateSchema,
  invoiceUpdateSchema,
  paymentCreateSchema,
  purchaseCreateSchema,
  purchaseUpdateSchema,
  saleCreateSchema,
  saleUpdateSchema,
  warehouseCreateSchema,
  warehouseUpdateSchema,
  inventoryQuerySchema,
  inventoryAdjustSchema,
} from "../validations/apiValidations.js";

const router = Router();

// Auth routes
router.post(
  "/auth/login",
  validate({ body: authOauthSchema }),
  AuthController.oauthLogin,
);
router.post(
  "/auth/logincheck",
  validate({ body: authLoginSchema }),
  AuthController.loginCheck,
);
router.post(
  "/auth/register",
  validate({ body: authRegisterSchema }),
  AuthController.register,
);
router.post(
  "/auth/forgot-password",
  validate({ body: authForgotSchema }),
  AuthController.forgotPassword,
);
router.post(
  "/auth/reset-password",
  validate({ body: authResetSchema }),
  AuthController.resetPassword,
);

// Customers
router.get("/customers", AuthMiddleware, CustomersController.index);
router.post(
  "/customers",
  AuthMiddleware,
  validate({ body: customerCreateSchema }),
  CustomersController.store,
);
router.get(
  "/customers/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  CustomersController.show,
);
router.put(
  "/customers/:id",
  AuthMiddleware,
  validate({ params: idParamSchema, body: customerUpdateSchema }),
  CustomersController.update,
);
router.delete(
  "/customers/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  CustomersController.destroy,
);

// Categories
router.get("/categories", AuthMiddleware, CategoriesController.index);
router.post(
  "/categories",
  AuthMiddleware,
  validate({ body: categoryCreateSchema }),
  CategoriesController.store,
);
router.get(
  "/categories/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  CategoriesController.show,
);
router.put(
  "/categories/:id",
  AuthMiddleware,
  validate({ params: idParamSchema, body: categoryUpdateSchema }),
  CategoriesController.update,
);
router.delete("/categories/:id", AuthMiddleware, CategoriesController.destroy);

// Products
router.get("/products", AuthMiddleware, ProductsController.index);
router.post(
  "/products",
  AuthMiddleware,
  validate({ body: productCreateSchema }),
  ProductsController.store,
);
router.get(
  "/products/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  ProductsController.show,
);
router.put(
  "/products/:id",
  AuthMiddleware,
  validate({ params: idParamSchema, body: productUpdateSchema }),
  ProductsController.update,
);
router.delete("/products/:id", AuthMiddleware, ProductsController.destroy);

// Suppliers
router.get("/suppliers", AuthMiddleware, SuppliersController.index);
router.post(
  "/suppliers",
  AuthMiddleware,
  validate({ body: supplierCreateSchema }),
  SuppliersController.store,
);
router.get(
  "/suppliers/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  SuppliersController.show,
);
router.put(
  "/suppliers/:id",
  AuthMiddleware,
  validate({ params: idParamSchema, body: supplierUpdateSchema }),
  SuppliersController.update,
);
router.delete("/suppliers/:id", AuthMiddleware, SuppliersController.destroy);

// Purchases
router.get("/purchases", AuthMiddleware, PurchasesController.index);
router.post(
  "/purchases",
  AuthMiddleware,
  validate({ body: purchaseCreateSchema }),
  PurchasesController.store,
);
router.get(
  "/purchases/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  PurchasesController.show,
);
router.put(
  "/purchases/:id",
  AuthMiddleware,
  validate({ params: idParamSchema, body: purchaseUpdateSchema }),
  PurchasesController.update,
);

// Sales
router.get("/sales", AuthMiddleware, SalesController.index);
router.post(
  "/sales",
  AuthMiddleware,
  validate({ body: saleCreateSchema }),
  SalesController.store,
);
router.get(
  "/sales/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  SalesController.show,
);
router.put(
  "/sales/:id",
  AuthMiddleware,
  validate({ params: idParamSchema, body: saleUpdateSchema }),
  SalesController.update,
);

// Warehouses
router.get("/warehouses", AuthMiddleware, WarehousesController.index);
router.post(
  "/warehouses",
  AuthMiddleware,
  validate({ body: warehouseCreateSchema }),
  WarehousesController.store,
);
router.get(
  "/warehouses/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  WarehousesController.show,
);
router.put(
  "/warehouses/:id",
  AuthMiddleware,
  validate({ params: idParamSchema, body: warehouseUpdateSchema }),
  WarehousesController.update,
);
router.delete("/warehouses/:id", AuthMiddleware, WarehousesController.destroy);

// Inventory
router.get(
  "/inventories",
  AuthMiddleware,
  validate({ query: inventoryQuerySchema }),
  InventoriesController.index,
);
router.post(
  "/inventories/adjust",
  AuthMiddleware,
  validate({ body: inventoryAdjustSchema }),
  InventoriesController.adjust,
);

// Invoices
router.get("/invoices", AuthMiddleware, InvoicesController.index);
router.post(
  "/invoices",
  AuthMiddleware,
  validate({ body: invoiceCreateSchema }),
  InvoicesController.store,
);
router.get(
  "/invoices/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  InvoicesController.show,
);
router.put(
  "/invoices/:id",
  AuthMiddleware,
  validate({ params: idParamSchema, body: invoiceUpdateSchema }),
  InvoicesController.update,
);
router.delete(
  "/invoices/:id",
  AuthMiddleware,
  validate({ params: idParamSchema }),
  InvoicesController.destroy,
);

// Payments
router.get("/payments", AuthMiddleware, PaymentsController.index);
router.post(
  "/payments",
  AuthMiddleware,
  validate({ body: paymentCreateSchema }),
  PaymentsController.store,
);

// Reports
router.get("/reports/summary", AuthMiddleware, ReportsController.summary);

export default router;
