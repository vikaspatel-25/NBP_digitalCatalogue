import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import auth from '../src/middlewares/auth.js';
import userAuth from '../src/middlewares/userAuth.js';

function createMockReqRes(cookies = {}) {
  const req = {
    cookies,
    user: null
  };
  let redirectedTo = null;
  let clearedCookies = [];
  const res = {
    redirect: (url) => {
      redirectedTo = url;
    },
    clearCookie: (name) => {
      clearedCookies.push(name);
    }
  };
  return { req, res, getRedirect: () => redirectedTo, getCleared: () => clearedCookies };
}

describe('Authentication Middlewares', () => {

  describe('auth (Admin Middleware)', () => {
    test('redirects to /login when no adminToken cookie is present', async () => {
      const { req, res, getRedirect } = createMockReqRes({});
      let nextCalled = false;
      await auth(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, false, 'next() should not be called without token');
      assert.equal(getRedirect(), '/login', 'should redirect to /login');
    });

    test('clears cookie and redirects to /login on invalid JWT token', async () => {
      const { req, res, getRedirect, getCleared } = createMockReqRes({ adminToken: 'invalid.jwt.token' });
      let nextCalled = false;
      await auth(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, false);
      assert.equal(getRedirect(), '/login');
      assert.ok(getCleared().includes('adminToken'), 'should clear adminToken cookie on invalid token');
    });
  });

  describe('userAuth (Vendor Middleware)', () => {
    test('redirects to /userLogin when no userToken cookie is present', async () => {
      const { req, res, getRedirect } = createMockReqRes({});
      let nextCalled = false;
      await userAuth(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, false, 'next() should not be called without token');
      assert.equal(getRedirect(), '/userLogin', 'should redirect to /userLogin');
    });

    test('clears cookie and redirects to /userLogin on invalid JWT token', async () => {
      const { req, res, getRedirect, getCleared } = createMockReqRes({ userToken: 'invalid.jwt.token' });
      let nextCalled = false;
      await userAuth(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, false);
      assert.equal(getRedirect(), '/userLogin');
      assert.ok(getCleared().includes('userToken'), 'should clear userToken cookie on invalid token');
    });
  });

});
