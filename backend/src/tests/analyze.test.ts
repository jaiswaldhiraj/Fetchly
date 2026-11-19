import request from 'supertest';
import app from '../app';

describe('POST /api/analyze', () => {
  it('returns 400 for missing URL', async () => {
    const res = await request(app).post('/api/analyze').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_URL');
  });

  it('returns 400 for invalid URL string', async () => {
    const res = await request(app).post('/api/analyze').send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_URL');
  });

  it('returns 403 for localhost URL (SSRF protection)', async () => {
    const res = await request(app).post('/api/analyze').send({ url: 'http://localhost/admin' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN_HOST');
  });

  it('returns 403 for IPv6 loopback [::1] (SSRF protection)', async () => {
    const res = await request(app).post('/api/analyze').send({ url: 'http://[::1]/admin' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN_HOST');
  });

  it('returns 403 for 127.0.0.2 loopback (SSRF protection)', async () => {
    const res = await request(app).post('/api/analyze').send({ url: 'http://127.0.0.2/admin' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN_HOST');
  });

  it('returns 400 for non-http protocol', async () => {
    const res = await request(app).post('/api/analyze').send({ url: 'ftp://example.com/file' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_PROTOCOL');
  });
});

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/admin/stats', () => {
  it('returns 401 without admin key', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('returns stats with valid admin key', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('X-Admin-Key', process.env.ADMIN_API_KEY || 'change-this-secret-key');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('downloadsToday');
  });
});
