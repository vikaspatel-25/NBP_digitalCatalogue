import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import Product from '../src/models/product.model.js';
import Article from '../src/models/article.model.js';
import Company from '../src/models/company.model.js';
import Admin from '../src/models/admin.model.js';
import User from '../src/models/user.model.js';

describe('Mongoose Models & Schema Validation', () => {

  describe('Product Model', () => {
    test('validates successfully with required fields', () => {
      const product = new Product({
        productName: 'Eco Solar Cell',
        shortDescription: 'High efficiency monocrystalline cell',
        detailedDescription: 'Full technical details and specifications.',
        images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
        priceMin: 1500,
        priceMax: 2500,
        priceNote: 'Per unit'
      });

      const err = product.validateSync();
      assert.equal(err, undefined, 'Product with required fields should pass validation');
      assert.equal(product.creatorId, null, 'creatorId should default to null for legacy compatibility');
      assert.equal(product.creatorRole, null, 'creatorRole should default to null for legacy compatibility');
      assert.deepEqual(product.videos, [], 'videos should default to empty array');
      assert.deepEqual(product.youtubeLinks, [], 'youtubeLinks should default to empty array');
      assert.deepEqual(product.articleLinks, [], 'articleLinks should default to empty array');
    });

    test('fails validation when required fields are missing', () => {
      const product = new Product({ images: null });
      const err = product.validateSync();
      assert.ok(err, 'Validation should fail on empty product');
      assert.ok(err.errors.productName, 'productName is required');
      assert.ok(err.errors.shortDescription, 'shortDescription is required');
      assert.ok(err.errors.detailedDescription, 'detailedDescription is required');
      assert.ok(err.errors.images, 'images is required');
      assert.ok(err.errors.priceMin, 'priceMin is required');
      assert.ok(err.errors.priceMax, 'priceMax is required');
    });

    test('accepts valid creatorRole values or null', () => {
      const pAdmin = new Product({
        productName: 'P1',
        shortDescription: 'SD',
        detailedDescription: 'DD',
        images: ['img.png'],
        priceMin: 10,
        priceMax: 20,
        creatorRole: 'admin'
      });
      assert.equal(pAdmin.validateSync(), undefined);

      const pUser = new Product({
        productName: 'P2',
        shortDescription: 'SD',
        detailedDescription: 'DD',
        images: ['img.png'],
        priceMin: 10,
        priceMax: 20,
        creatorRole: 'user'
      });
      assert.equal(pUser.validateSync(), undefined);

      const pInvalid = new Product({
        productName: 'P3',
        shortDescription: 'SD',
        detailedDescription: 'DD',
        images: ['img.png'],
        priceMin: 10,
        priceMax: 20,
        creatorRole: 'invalid_role'
      });
      const err = pInvalid.validateSync();
      assert.ok(err && err.errors.creatorRole, 'Invalid creatorRole should be rejected');
    });
  });

  describe('Article Model', () => {
    test('validates successfully with title and content', () => {
      const article = new Article({
        title: 'NetZero Guidelines 2026',
        content: '<p>A deep dive into decarbonization policies.</p>',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/article.jpg'
      });

      const err = article.validateSync();
      assert.equal(err, undefined, 'Article should pass validation');
      assert.equal(article.coverImage, 'https://res.cloudinary.com/demo/image/upload/v1/article.jpg');
      assert.deepEqual(article.productLinks, []);
      assert.equal(article.creatorId, null);
    });

    test('fails validation when title or content are missing', () => {
      const article = new Article({});
      const err = article.validateSync();
      assert.ok(err, 'Validation should fail on empty article');
      assert.ok(err.errors.title, 'title is required');
      assert.ok(err.errors.content, 'content is required');
    });
  });

  describe('Company Model', () => {
    test('validates successfully and defaults approved to false', () => {
      const company = new Company({
        companyName: 'GreenTech Solutions',
        userName: 'John Doe',
        mobile: '+91 9876543210',
        email: 'INFO@GreenTech.com'
      });

      const err = company.validateSync();
      assert.equal(err, undefined);
      assert.equal(company.approved, false, 'approved must default to false');
      assert.equal(company.email, 'info@greentech.com', 'email should be normalized to lowercase');
    });

    test('fails validation when required fields are missing', () => {
      const company = new Company({});
      const err = company.validateSync();
      assert.ok(err);
      assert.ok(err.errors.companyName);
      assert.ok(err.errors.userName);
      assert.ok(err.errors.mobile);
      assert.ok(err.errors.email);
    });
  });

  describe('User & Admin Models', () => {
    test('Admin model validates with passwordHash', () => {
      const admin = new Admin({
        passwordHash: '$2a$12$samplehashedpasswordstring',
        passKey: 'tempkey123'
      });
      const err = admin.validateSync();
      assert.equal(err, undefined);
      assert.ok(admin.passwordUpdatedAt);
    });

    test('Admin model fails without passwordHash', () => {
      const admin = new Admin({});
      const err = admin.validateSync();
      assert.ok(err && err.errors.passwordHash);
    });

    test('User model sets active status and user role by default', () => {
      const user = new User({
        companyName: 'SolarCorp',
        userName: 'solar_user',
        email: 'USER@SolarCorp.com'
      });
      assert.equal(user.role, 'user');
      assert.equal(user.status, 'active');
      assert.equal(user.email, 'user@solarcorp.com');
    });
  });

});
