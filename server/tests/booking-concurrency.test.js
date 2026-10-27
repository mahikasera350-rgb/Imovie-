const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const SeatInventory = require('../models/SeatInventory');
const Booking = require('../models/Booking');

describe('Seat Inventory, Concurrency & Hold Expiration Tests', () => {
  let customer1Token;
  let customer2Token;
  let adminToken;
  let showId;

  beforeEach(async () => {
    // 1. Create Users
    const u1 = await User.create({
      name: 'Customer One',
      email: 'c1@example.com',
      passwordHash: 'Password@123',
      role: 'customer',
    });
    const u2 = await User.create({
      name: 'Customer Two',
      email: 'c2@example.com',
      passwordHash: 'Password@123',
      role: 'customer',
    });
    const adm = await User.create({
      name: 'Admin User',
      email: 'admin_shows@example.com',
      passwordHash: 'Admin@123456',
      role: 'admin',
    });

    const [r1, r2, rAdm] = await Promise.all([
      request(app).post('/api/auth/login').send({ email: 'c1@example.com', password: 'Password@123' }),
      request(app).post('/api/auth/login').send({ email: 'c2@example.com', password: 'Password@123' }),
      request(app).post('/api/auth/login').send({ email: 'admin_shows@example.com', password: 'Admin@123456' }),
    ]);

    customer1Token = r1.body.token;
    customer2Token = r2.body.token;
    adminToken = rAdm.body.token;

    // 2. Create Movie & Theatre
    const movie = await Movie.create({
      title: 'Gladiator II',
      description: 'Colosseum battle for honor',
      posterUrl: 'https://example.com/gladiator.jpg',
      genres: ['Action', 'Drama'],
      languages: ['English'],
      duration: 150,
      releaseDate: new Date(),
      director: 'Ridley Scott',
    });

    const theatre = await Theatre.create({
      name: 'IMAX Multiplex',
      address: '100 Broadway',
      city: 'New York',
      screens: [
        {
          screenNumber: 1,
          name: 'Audi 1',
          format: 'IMAX',
          seatLayout: {
            rows: ['A', 'B'],
            seatsPerRow: 6,
            categoryMap: {
              recliner: ['A'],
              regular: ['B'],
            },
          },
        },
      ],
    });

    // 3. Create Show via API to trigger seat initialization
    const showRes = await request(app)
      .post('/api/shows')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        movieId: movie._id,
        theatreId: theatre._id,
        screenNumber: 1,
        showDate: '2026-10-30',
        startTime: new Date('2026-10-30T18:00:00Z'),
        endTime: new Date('2026-10-30T20:30:00Z'),
        seatPricing: {
          regular: 15.0,
          premium: 20.0,
          recliner: 28.0,
        },
      });

    showId = showRes.body.data.show._id;
  });

  it('should prevent overlapping shows on the same screen at the same theatre', async () => {
    // Attempt to schedule another show on Screen 1 overlapping with 18:00 - 20:30
    const movie = await Movie.findOne();
    const theatre = await Theatre.findOne();

    const overlapRes = await request(app)
      .post('/api/shows')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        movieId: movie._id,
        theatreId: theatre._id,
        screenNumber: 1,
        showDate: '2026-10-30',
        startTime: new Date('2026-10-30T19:00:00Z'), // overlaps!
        endTime: new Date('2026-10-30T21:30:00Z'),
        seatPricing: { regular: 15, premium: 20, recliner: 28 },
      });

    expect(overlapRes.statusCode).toBe(409);
    expect(overlapRes.body.message).toContain('Overlapping show conflict');
  });

  it('should allow customer 1 to hold seats successfully', async () => {
    const holdRes = await request(app)
      .post('/api/bookings/hold-seats')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        showId,
        seatNumbers: ['A1', 'A2'],
      });

    expect(holdRes.statusCode).toBe(200);
    expect(holdRes.body.data.holdToken).toBeDefined();
    expect(holdRes.body.data.seats.length).toBe(2);
    expect(holdRes.body.data.pricing.subtotal).toBe(56.0); // 2 * 28 (Recliner)
  });

  it('CRITICAL: should prevent Customer 2 from holding seats already held by Customer 1', async () => {
    // Customer 1 holds A1 and A2
    const c1Hold = await request(app)
      .post('/api/bookings/hold-seats')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        showId,
        seatNumbers: ['A1', 'A2'],
      });

    expect(c1Hold.statusCode).toBe(200);

    // Customer 2 attempts to hold A2 and A3
    const c2Hold = await request(app)
      .post('/api/bookings/hold-seats')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        showId,
        seatNumbers: ['A2', 'A3'],
      });

    // Must be rejected with 409 Conflict
    expect(c2Hold.statusCode).toBe(409);
    expect(c2Hold.body.message).toContain('no longer available or currently held');

    // Verify seat A3 was rolled back and remains available
    const seatA3 = await SeatInventory.findOne({ showId, seatNumber: 'A3' });
    expect(seatA3.status).toBe('available');
  });

  it('should complete end-to-end booking and mark seats as booked after payment', async () => {
    // 1. Hold seats
    const holdRes = await request(app)
      .post('/api/bookings/hold-seats')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ showId, seatNumbers: ['B1', 'B2'] });

    const holdToken = holdRes.body.data.holdToken;

    // 2. Create booking
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        showId,
        holdToken,
        seatNumbers: ['B1', 'B2'],
      });

    expect(bookingRes.statusCode).toBe(201);
    const bookingId = bookingRes.body.data.booking._id;

    // 3. Complete Demo Payment
    const payRes = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        bookingId,
        provider: 'demo',
      });

    expect(payRes.statusCode).toBe(200);
    expect(payRes.body.data.booking.bookingStatus).toBe('confirmed');

    // 4. Verify seats in database are now 'booked'
    const bookedSeats = await SeatInventory.find({
      showId,
      seatNumber: { $in: ['B1', 'B2'] },
    });

    expect(bookedSeats.length).toBe(2);
    expect(bookedSeats[0].status).toBe('booked');
    expect(bookedSeats[1].status).toBe('booked');
  });

  it('should safely release seats and track refund when booking is cancelled', async () => {
    // 1. Setup confirmed booking
    const holdRes = await request(app)
      .post('/api/bookings/hold-seats')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ showId, seatNumbers: ['B5'] });

    const bRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ showId, holdToken: holdRes.body.data.holdToken, seatNumbers: ['B5'] });

    const bookingId = bRes.body.data.booking._id;

    await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ bookingId, provider: 'demo' });

    // 2. Cancel Booking
    const cancelRes = await request(app)
      .post(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ reason: 'Customer schedule change' });

    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.body.data.booking.bookingStatus).toBe('cancelled');
    expect(cancelRes.body.data.booking.refundAmount).toBeGreaterThan(0);

    // 3. Verify seat B5 is released back to available
    const seatB5 = await SeatInventory.findOne({ showId, seatNumber: 'B5' });
    expect(seatB5.status).toBe('available');
    expect(seatB5.bookingId).toBeNull();
  });
});
