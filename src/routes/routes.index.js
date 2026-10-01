import express from "express";
import { loginPageController, loginController, userLoginPageController, userLoginController } from "../controllers/login.js";
import { resetPasswordPageController, resetPasswordController } from "../controllers/resetPwd.js";
import { adminPageController } from "../controllers/admin.js";
import { addProductPageController, addProductController, addApiProductController } from "../controllers/addProduct.js";
import { removeProductPageController, removeProductController } from "../controllers/removeProduct.js";
import { homePageController } from "../controllers/home.js";
import { productPageController } from "../controllers/product.js";
import { articlePageController } from "../controllers/article.js";
import { registerPageController, registerCompany } from "../controllers/register.js";
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

Router.route("/home/product")
  .get(productPageController);

Router.route("/product")
  .get(productPageController);

Router.route("/home/article")
  .get(articlePageController);

Router.route("/article")
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


// User Routes

Router.route("/userPanel")
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
Router.post("/api/register", upload.single("document"), registerCompany);
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

export default Router;