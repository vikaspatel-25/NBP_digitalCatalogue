import express from "express";
import { loginPageController, loginController, adminVerifyOtpController, adminResendOtpController, userLoginPageController, userLoginController } from "../controllers/login.js";
import { resetPasswordPageController, resetPasswordController } from "../controllers/resetPwd.js";
import { adminPageController } from "../controllers/admin.js";
import { addProductPageController, addProductController, addApiProductController } from "../controllers/addProduct.js";
import { removeProductPageController, removeProductController } from "../controllers/removeProduct.js";
import { homePageController } from "../controllers/home.js";
import { productPageController } from "../controllers/product.js";
import { articlePageController } from "../controllers/article.js";
import { registerPageController, registerCompany, checkEmailAvailability, sendRegistrationOtp, verifyRegistrationOtp } from "../controllers/register.js";
import { userApprovalPageController, approveUserController, rejectUserController } from "../controllers/userApproval.js";

import auth from "../middlewares/auth.js";
import userAuth from "../middlewares/userAuth.js";
import upload from "../config/multer.js";
import { userPanelPageController } from "../controllers/userPanel.js";
import { removeUserController, userManagementPageController } from "../controllers/userManagement.js";
import { userResetPasswordController } from "../controllers/user.resetPwd.js";
import { adminForgotPassword, userForgotPassword } from "../controllers/forgotPassword.js";
import { addArticleController, addArticlePageController } from "../controllers/addArticle.js";
import { removeArticlePageController, removeArticleController } from "../controllers/removeArticle.js";
import { updateProductPageController, updateProductController } from "../controllers/updateProduct.js";

const Router = express.Router();

Router.route("/")
  .get((req, res) => res.redirect("/home"));

Router.route("/home")
  .get(homePageController);

Router.route("/login")
  .get((req, res) => res.redirect("/adminLogin"));

Router.route("/adminLogin")
  .get(loginPageController)
  .post(loginController);

Router.route("/userLogin")
  .get(userLoginPageController)
  .post(userLoginController);

Router.route("/admin/logout")
  .post((req, res) => {
    res.clearCookie("adminToken");
    res.redirect("/admin");
  });

Router.route("/userPanel/logout")
  .post((req, res) => {
    res.clearCookie("userToken");
    res.redirect("/userPanel");
  });

Router.route("/register")
  .get(registerPageController)
  .post(upload.single("document"), registerCompany);

Router.route(["/home/product", "/home/product/:id", "/product", "/product/:id"])
  .get(productPageController);

Router.route(["/home/article", "/home/article/:id", "/article", "/article/:id"])
  .get(articlePageController);


// Admin Routes

Router.route("/admin")
  .get(auth, adminPageController);

Router.route("/admin/forgotPassword")
  .get(adminForgotPassword);

Router.route("/admin/resetPassword")
  .get(auth, resetPasswordPageController)
  .post(auth, resetPasswordController);

Router.route("/admin/addProduct")
  .get(auth, addProductPageController)
  .post(
    auth,
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ]),
    addProductController
  );

Router.route("/admin/updateProduct")
  .get(auth, updateProductPageController)
  .post(
    auth,
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ]),
    updateProductController
  );

Router.route("/admin/removeProduct")
  .get(auth, removeProductPageController)
  .post(auth, removeProductController);

Router.route("/admin/removeArticle")
  .get(auth, removeArticlePageController)
  .post(auth, removeArticleController);

Router.route("/admin/userApproval")
  .get(auth, userApprovalPageController);

Router.route("/admin/userApproval/approve")
  .post(auth, approveUserController);

Router.route("/admin/userApproval/reject")
  .post(auth, rejectUserController);

Router.route("/admin/userManagement")
  .get(auth, userManagementPageController)
  .post(auth, removeUserController);

Router.route("/admin/addArticle")
  .get(auth, addArticlePageController)
  .post(
    auth,
    upload.single("coverImage"),
    addArticleController
  );

Router.route("/admin/paymentSettings")
  .get(auth, adminPageController);

Router.route("/admin/paymentRequests")
  .get(auth, adminPageController);

Router.route("/admin/plans")
  .get(auth, adminPageController);

Router.route("/admin/mediaSettings")
  .get(auth, adminPageController);

Router.route("/admin/*")
  .get(auth, adminPageController);


// User Routes
Router.route(["/userPanel", "/userPanel/*"])
  .get(userAuth, userPanelPageController);

Router.route("/userPanel/forgotPassword")
  .get(userForgotPassword);

Router.route("/userPanel/addProduct")
  .get(userAuth, addProductPageController)
  .post(
    userAuth,
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ]),
    addProductController
  );

Router.route("/userPanel/updateProduct")
  .get(userAuth, updateProductPageController)
  .post(
    userAuth,
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ]),
    updateProductController
  );

Router.route("/userPanel/removeProduct")
  .get(userAuth, removeProductPageController)
  .post(userAuth, removeProductController);

Router.route("/userPanel/removeArticle")
  .get(userAuth, removeArticlePageController)
  .post(userAuth, removeArticleController);

Router.route("/userPanel/resetPassword")
  .get(userAuth, resetPasswordPageController)
  .post(userAuth, userResetPasswordController);

Router.route("/userPanel/addArticle")
  .get(userAuth, addArticlePageController)
  .post(
    userAuth,
    upload.single("coverImage"),
    addArticleController
  );

// API Routes for React Frontend
Router.post(
  "/api/admin/addProduct",
  auth,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  addApiProductController
);

Router.post(
  "/api/userPanel/addProduct",
  userAuth,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  addApiProductController
);

// Public API Routes for React Registration & Sign In
Router.get("/api/register/check-email", checkEmailAvailability);
Router.post("/api/register/send-otp", sendRegistrationOtp);
Router.post("/api/register/verify-otp", verifyRegistrationOtp);
Router.post("/api/register", upload.single("document"), registerCompany);

Router.post("/adminLogin/verify-otp", adminVerifyOtpController);
Router.post("/api/adminLogin/verify-otp", adminVerifyOtpController);
Router.post("/adminLogin/resend-otp", adminResendOtpController);
Router.post("/api/adminLogin/resend-otp", adminResendOtpController);

Router.post("/api/adminLogin", loginController);
Router.post("/api/login", loginController);
Router.post("/api/userLogin", userLoginController);

// Admin API Routes
Router.get("/api/admin/userApproval", auth, async (req, res) => {
  const { apiUserApprovalPageController } = await import("../controllers/userApproval.js");
  return apiUserApprovalPageController(req, res);
});
Router.post("/api/admin/userApproval/approve", auth, async (req, res) => {
  const { apiApproveUserController } = await import("../controllers/userApproval.js");
  return apiApproveUserController(req, res);
});
Router.post("/api/admin/userApproval/reject", auth, async (req, res) => {
  const { apiRejectUserController } = await import("../controllers/userApproval.js");
  return apiRejectUserController(req, res);
});

Router.get("/api/admin/userManagement", auth, async (req, res) => {
  const { apiUserManagementPageController } = await import("../controllers/userManagement.js");
  return apiUserManagementPageController(req, res);
});
Router.post("/api/admin/userManagement", auth, async (req, res) => {
  const { apiRemoveUserController } = await import("../controllers/userManagement.js");
  return apiRemoveUserController(req, res);
});

Router.get("/api/admin/updateProduct", auth, async (req, res) => {
  const { apiUpdateProductPageController } = await import("../controllers/updateProduct.js");
  return apiUpdateProductPageController(req, res);
});
Router.post("/api/admin/updateProduct", auth, upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 5 }]), async (req, res) => {
  const { apiUpdateProductController } = await import("../controllers/updateProduct.js");
  return apiUpdateProductController(req, res);
});

Router.get("/api/admin/removeProduct", auth, async (req, res) => {
  const { apiRemoveProductPageController } = await import("../controllers/removeProduct.js");
  return apiRemoveProductPageController(req, res);
});
Router.post("/api/admin/removeProduct", auth, async (req, res) => {
  const { apiRemoveProductController } = await import("../controllers/removeProduct.js");
  return apiRemoveProductController(req, res);
});

Router.post("/api/admin/addArticle", auth, upload.single("coverImage"), async (req, res) => {
  const { apiAddArticleController } = await import("../controllers/addArticle.js");
  return apiAddArticleController(req, res);
});

Router.get("/api/admin/removeArticle", auth, async (req, res) => {
  const { apiRemoveArticlePageController } = await import("../controllers/removeArticle.js");
  return apiRemoveArticlePageController(req, res);
});
Router.post("/api/admin/removeArticle", auth, async (req, res) => {
  const { apiRemoveArticleController } = await import("../controllers/removeArticle.js");
  return apiRemoveArticleController(req, res);
});


// UserPanel API Routes
Router.get("/api/userPanel/updateProduct", userAuth, async (req, res) => {
  const { apiUpdateProductPageController } = await import("../controllers/updateProduct.js");
  return apiUpdateProductPageController(req, res);
});
Router.post("/api/userPanel/updateProduct", userAuth, upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 5 }]), async (req, res) => {
  const { apiUpdateProductController } = await import("../controllers/updateProduct.js");
  return apiUpdateProductController(req, res);
});

Router.get("/api/userPanel/removeProduct", userAuth, async (req, res) => {
  const { apiRemoveProductPageController } = await import("../controllers/removeProduct.js");
  return apiRemoveProductPageController(req, res);
});
Router.post("/api/userPanel/removeProduct", userAuth, async (req, res) => {
  const { apiRemoveProductController } = await import("../controllers/removeProduct.js");
  return apiRemoveProductController(req, res);
});

Router.post("/api/userPanel/addArticle", userAuth, upload.single("coverImage"), async (req, res) => {
  const { apiAddArticleController } = await import("../controllers/addArticle.js");
  return apiAddArticleController(req, res);
});

Router.get("/api/userPanel/removeArticle", userAuth, async (req, res) => {
  const { apiRemoveArticlePageController } = await import("../controllers/removeArticle.js");
  return apiRemoveArticlePageController(req, res);
});
Router.post("/api/userPanel/removeArticle", userAuth, async (req, res) => {
  const { apiRemoveArticleController } = await import("../controllers/removeArticle.js");
  return apiRemoveArticleController(req, res);
});

// Admin Offline UPI/QR Settings & Verification API Routes
Router.get("/api/admin/payment-settings", auth, async (req, res) => {
  const { getAdminPaymentSettings } = await import("../controllers/adminPayment.js");
  return getAdminPaymentSettings(req, res);
});

Router.post("/api/admin/payment-settings", auth, upload.single("qrCode"), async (req, res) => {
  const { updateAdminPaymentSettings } = await import("../controllers/adminPayment.js");
  return updateAdminPaymentSettings(req, res);
});

// Admin Dynamic Plans Management APIs
Router.get("/api/admin/plans", auth, async (req, res) => {
  const { getAdminPlans } = await import("../controllers/adminPayment.js");
  return getAdminPlans(req, res);
});

Router.post("/api/admin/plans", auth, async (req, res) => {
  const { saveAdminPlan } = await import("../controllers/adminPayment.js");
  return saveAdminPlan(req, res);
});

Router.delete("/api/admin/plans/:planId", auth, async (req, res) => {
  const { deleteAdminPlan } = await import("../controllers/adminPayment.js");
  return deleteAdminPlan(req, res);
});

// Media & Upload Limits Settings APIs
Router.get("/api/admin/media-settings", auth, async (req, res) => {
  const { getAdminPaymentSettings } = await import("../controllers/adminPayment.js");
  return getAdminPaymentSettings(req, res);
});

Router.post("/api/admin/media-settings", auth, async (req, res) => {
  const { updateAdminPaymentSettings } = await import("../controllers/adminPayment.js");
  return updateAdminPaymentSettings(req, res);
});

Router.get("/api/platform/media-settings", async (req, res) => {
  const { getAdminPaymentSettings } = await import("../controllers/adminPayment.js");
  return getAdminPaymentSettings(req, res);
});

Router.get("/api/plans", async (req, res) => {
  const { getPublicPlans } = await import("../controllers/vendorPayment.js");
  return getPublicPlans(req, res);
});

Router.get("/api/admin/payment-requests", auth, async (req, res) => {
  const { getPaymentRequests } = await import("../controllers/adminPayment.js");
  return getPaymentRequests(req, res);
});

Router.post("/api/admin/payment-requests/verify", auth, async (req, res) => {
  const { verifyPaymentRequest } = await import("../controllers/adminPayment.js");
  return verifyPaymentRequest(req, res);
});

Router.post("/api/admin/renew-vendor", auth, async (req, res) => {
  const { directRenewVendor } = await import("../controllers/adminPayment.js");
  return directRenewVendor(req, res);
});

Router.post("/api/admin/discontinue-subscription", auth, async (req, res) => {
  const { discontinueSubscription } = await import("../controllers/adminPayment.js");
  return discontinueSubscription(req, res);
});

Router.post("/api/admin/send-reminder", auth, async (req, res) => {
  const { apiSendReminderController } = await import("../controllers/userManagement.js");
  return apiSendReminderController(req, res);
});

// Vendor Offline Payment & Subscription APIs
Router.get("/api/userPanel/payment-info", userAuth, async (req, res) => {
  const { getVendorPaymentInfo } = await import("../controllers/vendorPayment.js");
  return getVendorPaymentInfo(req, res);
});

Router.post("/api/userPanel/submit-payment", userAuth, upload.single("screenshot"), async (req, res) => {
  const { submitVendorPayment } = await import("../controllers/vendorPayment.js");
  return submitVendorPayment(req, res);
});

// Razorpay Payment & Subscription API Routes
Router.get("/api/payment/plans", async (req, res) => {
  const { getSubscriptionPlans } = await import("../controllers/payment.js");
  return getSubscriptionPlans(req, res);
});

Router.get("/api/payment/status", userAuth, async (req, res) => {
  const { getSubscriptionStatus } = await import("../controllers/payment.js");
  return getSubscriptionStatus(req, res);
});

Router.post("/api/payment/create-order", userAuth, async (req, res) => {
  const { createOrder } = await import("../controllers/payment.js");
  return createOrder(req, res);
});

Router.post("/api/payment/verify", userAuth, async (req, res) => {
  const { verifyPayment } = await import("../controllers/payment.js");
  return verifyPayment(req, res);
});

// Razorpay Webhook (public endpoint with signature verification)
Router.post("/api/payment/webhook", async (req, res) => {
  const { handleRazorpayWebhook } = await import("../controllers/payment.js");
  return handleRazorpayWebhook(req, res);
});

// Onboarding completion
Router.post("/api/userPanel/complete-onboarding", userAuth, async (req, res) => {
  const { completeVendorOnboarding } = await import("../controllers/payment.js");
  return completeVendorOnboarding(req, res);
});

// Public Compliance & Legal Pages (Required by Razorpay)
Router.get("/pricing", async (req, res) => {
  const isVendorLoggedIn = Boolean(req.cookies.userToken);
  try {
    const { getOrSeedPlans } = await import("../controllers/adminPayment.js");
    const allPlans = await getOrSeedPlans();
    const plans = allPlans.filter(p => p.isActive !== false);
    res.render("pages/pricing.ejs", { isVendorLoggedIn, plans });
  } catch (err) {
    console.error("Error loading pricing plans:", err);
    res.render("pages/pricing.ejs", { isVendorLoggedIn, plans: [] });
  }
});
Router.get("/terms", (req, res) => {
  res.render("pages/terms.ejs");
});
Router.get("/refund-policy", (req, res) => {
  res.render("pages/refund.ejs");
});
Router.get("/privacy", (req, res) => {
  res.render("pages/privacy.ejs");
});

export default Router;