const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Auth API & Security Tests', () => {
  it('should register a new customer successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        city: 'New York',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should prevent registration with duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'duplicate@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Jane',
        email: 'duplicate@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toContain('already exists');
  });

  it('should verify password hashing and secure login', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Secure User',
        email: 'secure@example.com',
        password: 'MySecretPassword123',
        confirmPassword: 'MySecretPassword123',
      });

    // Check DB directly to verify password is encrypted
    const dbUser = await User.findOne({ email: 'secure@example.com' }).select('+passwordHash');
    expect(dbUser.passwordHash).not.toBe('MySecretPassword123');
    expect(dbUser.passwordHash.startsWith('$2')).toBe(true); // bcrypt salt prefix

    // Successful login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'secure@example.com',
        password: 'MySecretPassword123',
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    // Failed login with wrong password
    const failRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'secure@example.com',
        password: 'WrongPassword',
      });

    expect(failRes.statusCode).toBe(401);
  });

  it('should reject access to protected endpoint without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('should reject non-admin access to admin dashboard', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Standard Customer',
        email: 'cust@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    const token = regRes.body.token;

    const adminRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(adminRes.statusCode).toBe(403);
  });
});
