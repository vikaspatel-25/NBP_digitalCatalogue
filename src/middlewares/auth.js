import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';

export async function auth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findOne({});
    if (!admin) return res.redirect('/login');

    if (admin.passwordUpdatedAt.getTime() !== payload.pwdUpdatedAt) {
      res.clearCookie('token');
      return res.redirect('/login');
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.clearCookie('token');
    res.redirect('/login');
  }
}

export default auth;
