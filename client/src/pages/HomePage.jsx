import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import movieService from '../services/movieService';
import { useCity } from '../context/CityContext';
import HeroBanner from '../components/movie/HeroBanner';
import MovieCard from '../components/movie/MovieCard';
import { MovieCardSkeleton } from '../components/common/LoadingSkeleton';
import {
  Film,
  Sparkles,
  TrendingUp,
  Calendar,
  Tag,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { toast } from 'react-toastify';

const HomePage = () => {
  const { selectedCity } = useCity();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Comedy', 'Thriller'];
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [nowRes, soonRes] = await Promise.all([
          movieService.getMovies({ status: 'now_showing', limit: 12 }),
          movieService.getMovies({ status: 'coming_soon', limit: 6 }),
        ]);

        const nowMovies = nowRes.data.movies || [];
        const soonMovies = soonRes.data.movies || [];

        setNowShowing(nowMovies);
        setComingSoon(soonMovies);
        setTrending([...nowMovies].sort((a, b) => b.rating - a.rating).slice(0, 4));

        // Featured banner: Pick first featured or first now showing
        const featured = nowMovies.find((m) => m.featured) || nowMovies[0] || null;
        setFeaturedMovie(featured);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCity]);

  const filteredNowShowing =
    selectedGenre === 'All'
      ? nowShowing
      : nowShowing.filter((m) => m.genres?.includes(selectedGenre));

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      toast.success('Thank you for subscribing to IMovies premiere alerts! 🎬');
      setNewsletterEmail('');
    }
  };

  return (
    <div className="homepage pb-5">
      {/* 1. Hero Premiere Banner */}
      {featuredMovie && <HeroBanner movie={featuredMovie} />}

      <div className="container">
        {/* 2. Now Showing Section */}
        <section className="mb-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 text-danger small fw-bold text-uppercase tracking-wider mb-1">
                <Film size={16} /> In Theatres Now
              </div>
              <h2 className="fw-bold text-light mb-0">Now Showing in {selectedCity}</h2>
            </div>

            {/* Genre Filter Pills */}
            <div className="d-flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <button
                  key={g}
                  className={`btn btn-sm px-3 py-1 rounded-pill ${
                    selectedGenre === g ? 'btn-cinema-red' : 'btn-cinema-outline'
                  }`}
                  onClick={() => setSelectedGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="col">
                  <MovieCardSkeleton />
                </div>
              ))}
            </div>
          ) : filteredNowShowing.length === 0 ? (
            <div className="text-center py-5 bg-cinematic-card rounded border border-secondary">
              <Film size={40} className="text-secondary mb-2" />
              <h5 className="text-light">No movies found</h5>
              <p className="text-secondary small">Try selecting another genre or city.</p>
            </div>
          ) : (
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
              {filteredNowShowing.map((movie) => (
                <div key={movie._id} className="col">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Offers & Promotions Section */}
        <section className="mb-5 py-4">
          <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase tracking-wider mb-1">
            <Tag size={16} /> Exclusive Perks
          </div>
          <h2 className="fw-bold text-light mb-4">Special Offers & Deals</h2>

          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div
                className="p-4 rounded-3 h-100 border border-danger d-flex flex-column justify-content-between"
                style={{ background: 'linear-gradient(135deg, #1f1214 0%, #111827 100%)' }}
              >
                <div>
                  <span className="badge bg-danger mb-2">FIRST TIME USER</span>
                  <h4 className="fw-bold text-light mb-1">10% Off First Booking</h4>
                  <p className="text-secondary small mb-3">
                    Use coupon code <strong className="text-warning">IMOVIE10</strong> at checkout to unlock instant discounts.
                  </p>
                </div>
                <div className="small text-danger fw-semibold">Valid on all 2D & 3D screens</div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="p-4 rounded-3 h-100 border border-primary d-flex flex-column justify-content-between"
                style={{ background: 'linear-gradient(135deg, #0f1c2e 0%, #111827 100%)' }}
              >
                <div>
                  <span className="badge bg-primary mb-2">IMAX SPECIAL</span>
                  <h4 className="fw-bold text-light mb-1">Dolby & IMAX Double Points</h4>
                  <p className="text-secondary small mb-3">
                    Experience crystal-clear laser projection and immersive 12-channel audio with bonus loyalty reward points.
                  </p>
                </div>
                <div className="small text-primary fw-semibold">Auto-applied for VIP members</div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="p-4 rounded-3 h-100 border border-warning d-flex flex-column justify-content-between"
                style={{ background: 'linear-gradient(135deg, #241a0c 0%, #111827 100%)' }}
              >
                <div>
                  <span className="badge bg-warning text-dark mb-2">STUDENT DISCOUNT</span>
                  <h4 className="fw-bold text-light mb-1">Weekday Student Pass</h4>
                  <p className="text-secondary small mb-3">
                    Enjoy up to 20% off all afternoon shows from Monday to Thursday with valid student ID.
                  </p>
                </div>
                <div className="small text-warning fw-semibold">Shows between 12 PM - 5 PM</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Trending Blockbusters Section */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase tracking-wider mb-1">
                <TrendingUp size={16} /> Fan Favorites
              </div>
              <h2 className="fw-bold text-light mb-0">Trending This Week</h2>
            </div>
            <Link to="/movies?sort=rating" className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="row row-cols-2 row-cols-md-4 g-4">
            {trending.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>

        {/* 5. Coming Soon Section */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 text-primary small fw-bold text-uppercase tracking-wider mb-1">
                <Calendar size={16} /> Anticipated Releases
              </div>
              <h2 className="fw-bold text-light mb-0">Coming Soon</h2>
            </div>
            <Link to="/movies?status=coming_soon" className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-1">
              <span>View Full Lineup</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
            {comingSoon.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>

        {/* 6. Newsletter Subscription */}
        <section className="mt-5 p-4 p-md-5 rounded-4 bg-cinematic-card border border-secondary text-center position-relative overflow-hidden">
          <div className="position-relative z-1" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <span className="badge bg-danger mb-2">STAY IN THE LOOP</span>
            <h3 className="fw-bold text-light mb-2">Never Miss a Movie Premiere</h3>
            <p className="text-secondary small mb-4">
              Get weekly updates on new releases, advance ticket sales, IMAX bookings, and exclusive discounts delivered to your inbox.
            </p>

            <form onSubmit={handleNewsletter} className="d-flex flex-column flex-sm-row gap-2">
              <input
                type="email"
                required
                className="form-control bg-dark border-secondary text-light py-2 px-3"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-cinema-red px-4 text-nowrap d-flex align-items-center justify-content-center gap-2">
                <Send size={16} /> Subscribe
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
