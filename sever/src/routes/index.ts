import { Router } from "express";
import AuthController from "../controllers/AuthController";
import CustomersController from "../controllers/CustomersController";
import ProductsController from "../controllers/ProductsController";
import InvoicesController from "../controllers/InvoicesController";
import PaymentsController from "../controllers/PaymentsController";
import ReportsController from "../controllers/ReportsController";
import AuthMiddleware from "../middlewares/AuthMIddleware";

const router = Router();

// Auth routes
router.post("/auth/login", AuthController.oauthLogin);
router.post("/auth/logincheck", AuthController.loginCheck);
router.post("/auth/register", AuthController.register);
router.post("/auth/forgot-password", AuthController.forgotPassword);
router.post("/auth/reset-password", AuthController.resetPassword);

// Customers
router.get("/customers", AuthMiddleware, CustomersController.index);
router.post("/customers", AuthMiddleware, CustomersController.store);
router.get("/customers/:id", AuthMiddleware, CustomersController.show);
router.put("/customers/:id", AuthMiddleware, CustomersController.update);
router.delete("/customers/:id", AuthMiddleware, CustomersController.destroy);

// Products
router.get("/products", AuthMiddleware, ProductsController.index);
router.post("/products", AuthMiddleware, ProductsController.store);
router.get("/products/:id", AuthMiddleware, ProductsController.show);
router.put("/products/:id", AuthMiddleware, ProductsController.update);
router.delete("/products/:id", AuthMiddleware, ProductsController.destroy);

// Invoices
router.get("/invoices", AuthMiddleware, InvoicesController.index);
router.post("/invoices", AuthMiddleware, InvoicesController.store);
router.get("/invoices/:id", AuthMiddleware, InvoicesController.show);
router.put("/invoices/:id", AuthMiddleware, InvoicesController.update);
router.delete("/invoices/:id", AuthMiddleware, InvoicesController.destroy);

// Payments
router.get("/payments", AuthMiddleware, PaymentsController.index);
router.post("/payments", AuthMiddleware, PaymentsController.store);

// Reports
router.get("/reports/summary", AuthMiddleware, ReportsController.summary);

export default router;
