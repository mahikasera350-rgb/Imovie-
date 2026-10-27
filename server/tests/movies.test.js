const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Movie = require('../models/Movie');

describe('Movie Catalog & Filtering Tests', () => {
  let adminToken;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin Tester',
      email: 'admin_test@imovies.com',
      passwordHash: 'Admin@123456',
      role: 'admin',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin_test@imovies.com', password: 'Admin@123456' });

    adminToken = loginRes.body.token;

    // Create sample movies
    await Movie.insertMany([
      {
        title: 'Interstellar',
        description: 'Mankind was born on Earth. It was never meant to die here.',
        posterUrl: 'https://example.com/poster1.jpg',
        genres: ['Sci-Fi', 'Adventure'],
        languages: ['English'],
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        director: 'Christopher Nolan',
        rating: 8.7,
        status: 'now_showing',
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on Gotham.',
        posterUrl: 'https://example.com/poster2.jpg',
        genres: ['Action', 'Crime'],
        languages: ['English', 'Spanish'],
        duration: 152,
        releaseDate: new Date('2008-07-18'),
        director: 'Christopher Nolan',
        rating: 9.0,
        status: 'now_showing',
      },
      {
        title: 'Avatar 3',
        description: 'Next chapter of the Pandora saga.',
        posterUrl: 'https://example.com/poster3.jpg',
        genres: ['Sci-Fi', 'Fantasy'],
        languages: ['English'],
        duration: 190,
        releaseDate: new Date('2025-12-19'),
        director: 'James Cameron',
        rating: 8.5,
        status: 'coming_soon',
      },
    ]);
  });

  it('should list all movies with pagination', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(3);
  });

  it('should filter movies by status', async () => {
    const res = await request(app).get('/api/movies?status=coming_soon');
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data.movies[0].title).toBe('Avatar 3');
  });

  it('should search movies by title or description', async () => {
    const res = await request(app).get('/api/movies?search=Joker');
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data.movies[0].title).toBe('The Dark Knight');
  });

  it('should filter movies by genre', async () => {
    const res = await request(app).get('/api/movies?genre=Crime');
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data.movies[0].title).toBe('The Dark Knight');
  });

  it('should allow admin to create a new movie', async () => {
    const newMovie = {
      title: 'Inception',
      description: 'Your mind is the scene of the crime.',
      posterUrl: 'https://example.com/inception.jpg',
      genres: ['Sci-Fi', 'Thriller'],
      languages: ['English'],
      duration: 148,
      releaseDate: '2010-07-16',
      director: 'Christopher Nolan',
      certification: 'PG-13',
      rating: 8.8,
      status: 'now_showing',
    };

    const res = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newMovie);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.movie.title).toBe('Inception');
  });
});
