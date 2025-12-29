import express from 'express';
import { loginPageController, loginController } from '../controllers/login.js';
import { resetPasswordPageController, resetPasswordController } from '../controllers/resetPwd.js';
import { adminPageController } from '../controllers/admin.js';
import { addProductPageController, addProductController } from '../controllers/addProduct.js';
import { removeProductPageController, removeProductController } from '../controllers/removeProduct.js';
import { homePageController } from '../controllers/home.js';
import { productPageController } from '../controllers/product.js';

import auth from '../middlewares/auth.js';
import upload from "../config/multer.js";

const Router = express.Router();

Router.route("/")
  .get((req, res) => {
    res.redirect('/home');
  });

Router.route('/home')
  .get(homePageController);

Router.route('/login')
  .get(loginPageController)
  .post(loginController);

Router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

Router.route('/home/product')
  .get(productPageController);

Router.route('/admin')
  .get(auth, adminPageController);

Router.route('/admin/resetPassword')
  .get(auth, resetPasswordPageController)
  .post(auth, resetPasswordController);

Router.route('/admin/addProduct')
  .get(auth, addProductPageController)
  .post(
    auth,
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 }
    ]),
    addProductController
  );

Router.route('/admin/removeProduct')
  .get(auth, removeProductPageController)
  .post(auth, removeProductController);

export default Router;
