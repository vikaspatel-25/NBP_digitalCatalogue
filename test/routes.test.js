import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/index.js';

describe('Express HTTP Routes & Endpoint Integration', () => {
  let server;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Public Routes & Navigation', () => {
    test('GET / redirects to /home', async () => {
      const res = await fetch(`${baseUrl}/`, { redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/home');
    });

    test('GET /login redirects to /adminLogin', async () => {
      const res = await fetch(`${baseUrl}/login`, { redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/adminLogin');
    });

    test('GET /adminLogin responds with 200 OK', async () => {
      const res = await fetch(`${baseUrl}/adminLogin`);
      assert.equal(res.status, 200);
      const text = await res.text();
      assert.ok(text.includes('Admin') || text.includes('Login') || text.includes('password'));
    });

    test('GET /userLogin responds with 200 OK', async () => {
      const res = await fetch(`${baseUrl}/userLogin`);
      assert.equal(res.status, 200);
      const text = await res.text();
      assert.ok(text.includes('Login') || text.includes('Email') || text.includes('Password'));
    });

    test('GET /register responds with 200 OK', async () => {
      const res = await fetch(`${baseUrl}/register`);
      assert.equal(res.status, 200);
      const text = await res.text();
      assert.ok(text.includes('Register') || text.includes('Company'));
    });

    test('GET /api/register/check-email rejects missing email with 400', async () => {
      const res = await fetch(`${baseUrl}/api/register/check-email`);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.available, false);
    });

    test('GET /api/register/check-email reports available for new email', async () => {
      const res = await fetch(`${baseUrl}/api/register/check-email?email=brandnew-test@example.com`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.available, true);
    });
  });

  describe('Route Aliases for Products & Articles', () => {
    test('GET /product exists and handles missing ID with 400', async () => {
      const res = await fetch(`${baseUrl}/product`);
      assert.equal(res.status, 400);
      const text = await res.text();
      assert.ok(text.includes('Invalid product ID'));
    });

    test('GET /article exists and handles missing ID with 400', async () => {
      const res = await fetch(`${baseUrl}/article`);
      assert.equal(res.status, 400);
      const text = await res.text();
      assert.ok(text.includes('Invalid article ID'));
    });
  });

  describe('Session Management & Logout Endpoints', () => {
    test('POST /admin/logout clears adminToken cookie and redirects', async () => {
      const res = await fetch(`${baseUrl}/admin/logout`, { method: 'POST', redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/admin');
      const setCookie = res.headers.get('set-cookie') || '';
      assert.ok(setCookie.includes('adminToken=;'), 'should expire adminToken cookie');
    });

    test('POST /userPanel/logout clears userToken cookie and redirects', async () => {
      const res = await fetch(`${baseUrl}/userPanel/logout`, { method: 'POST', redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/userPanel');
      const setCookie = res.headers.get('set-cookie') || '';
      assert.ok(setCookie.includes('userToken=;'), 'should expire userToken cookie');
    });
  });

  describe('Protected Admin Routes Access Control', () => {
    test('GET /admin redirects unauthenticated user to /login', async () => {
      const res = await fetch(`${baseUrl}/admin`, { redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/login');
    });

    test('GET /admin/addProduct redirects unauthenticated user to /login', async () => {
      const res = await fetch(`${baseUrl}/admin/addProduct`, { redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/login');
    });

    test('GET /admin/updateProduct redirects unauthenticated user to /login', async () => {
      const res = await fetch(`${baseUrl}/admin/updateProduct`, { redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/login');
    });

    test('GET /admin/removeProduct redirects unauthenticated user to /login', async () => {
      const res = await fetch(`${baseUrl}/admin/removeProduct`, { redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/login');
    });
  });

  describe('Protected Vendor Routes Access Control', () => {
    test('GET /userPanel redirects unauthenticated user to /userLogin', async () => {
      const res = await fetch(`${baseUrl}/userPanel`, { redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/userLogin');
    });

    test('GET /userPanel/addProduct redirects unauthenticated user to /userLogin', async () => {
      const res = await fetch(`${baseUrl}/userPanel/addProduct`, { redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/userLogin');
    });

    test('GET /userPanel/updateProduct redirects unauthenticated user to /userLogin', async () => {
      const res = await fetch(`${baseUrl}/userPanel/updateProduct`, { redirect: 'manual' });
      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/userLogin');
    });
  });

  describe('Security & Admin Passkey Protection', () => {
    test('GET /admin/forgotPassword rejects unauthorized email with 403', async () => {
      const res = await fetch(`${baseUrl}/admin/forgotPassword?gmail=attacker@evil.com`);
      assert.equal(res.status, 403);
      const text = await res.text();
      assert.ok(text.includes('Unauthorized'));
    });

    test('GET /admin/forgotPassword rejects empty email query with 400', async () => {
      const res = await fetch(`${baseUrl}/admin/forgotPassword`);
      assert.equal(res.status, 400);
    });
  });

});
