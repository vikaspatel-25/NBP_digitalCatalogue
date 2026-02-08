import express from "express";
import { loginPageController, loginController, userLoginPageController, userLoginController } from "../controllers/login.js";
import { resetPasswordPageController, resetPasswordController } from "../controllers/resetPwd.js";
import { adminPageController } from "../controllers/admin.js";
import { addProductPageController, addProductController } from "../controllers/addProduct.js";
import { removeProductPageController, removeProductController } from "../controllers/removeProduct.js";
import { homePageController } from "../controllers/home.js";
import { productPageController } from "../controllers/product.js";
import { registerPageController, registerCompany } from "../controllers/register.js";
import { userApprovalPageController, approveUserController, rejectUserController } from "../controllers/userApproval.js";

import auth from "../middlewares/auth.js";
import userAuth from "../middlewares/userAuth.js";
import upload from "../config/multer.js";
import { userPanelPageController } from "../controllers/userPanel.js";
import { removeUserController, userManagementPageController } from "../controllers/userManagement.js";
import { userResetPasswordController } from "../controllers/user.resetPwd.js";
import { adminForgotPassword, userForgotPassword } from "../controllers/forgotPassword.js";

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

// Admin Routes
Router.route("/admin")
  .get(auth, adminPageController);

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

Router.route("/admin/removeProduct")
  .get(auth, removeProductPageController)
  .post(auth, removeProductController);

Router.route("/admin/userApproval")
  .get(auth, userApprovalPageController);

Router.route("/admin/userApproval/approve")
  .post(auth, approveUserController);

Router.route("/admin/userApproval/reject")
  .post(auth, rejectUserController);

Router.route("/admin/userManagement")
  .get(auth, userManagementPageController)
  .post(auth, removeUserController);

// User Routes
Router.route("/userPanel")
  .get(userAuth, userPanelPageController);

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

Router.route("/userPanel/removeProduct")
  .get(userAuth, removeProductPageController)
  .post(userAuth, removeProductController);

Router.route("/userPanel/resetPassword")
  .get(userAuth, resetPasswordPageController)
  .post(userAuth, userResetPasswordController );

Router.route("/userPanel/forgotPassword")
  .get(userForgotPassword );

Router.route("/admin/forgotPassword")
  .get(adminForgotPassword );

export default Router;
