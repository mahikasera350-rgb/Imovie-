import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import movieService from '../services/movieService';
import { useCity } from '../context/CityContext';
import MovieCard from '../components/movie/MovieCard';
import { MovieCardSkeleton } from '../components/common/LoadingSkeleton';
import { Filter, Search, RotateCcw, Clapperboard } from 'lucide-react';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity } = useCity();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalResults: 0 });

  // Filters from query params
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const genre = searchParams.get('genre') || '';
  const language = searchParams.get('language') || '';
  const sort = searchParams.get('sort') || '-releaseDate';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const availableGenres = ['Action', 'Sci-Fi', 'Drama', 'Adventure', 'Comedy', 'Biography', 'Crime', 'Thriller'];
  const availableLanguages = ['English', 'Spanish', 'German', 'French', 'Japanese'];

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page,
          limit: 12,
          sort,
        };

        if (search) queryParams.search = search;
        if (status) queryParams.status = status;
        if (genre) queryParams.genre = genre;
        if (language) queryParams.language = language;

        const res = await movieService.getMovies(queryParams);
        setMovies(res.data.movies || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, status, genre, language, sort, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="container py-4">
      {/* Page Title & Status Switch */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h1 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <Clapperboard className="text-danger" size={28} />
            Explore Movies
          </h1>
          <p className="text-secondary small mb-0">
            Discover the latest blockbuster releases and advance screenings
          </p>
        </div>

        {/* Status Toggle Tabs */}
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm px-3 ${
              status === '' ? 'btn-cinema-red' : 'btn-cinema-outline'
            }`}
            onClick={() => updateParam('status', '')}
          >
            All Movies
          </button>
          <button
            type="button"
            className={`btn btn-sm px-3 ${
              status === 'now_showing' ? 'btn-cinema-red' : 'btn-cinema-outline'
            }`}
            onClick={() => updateParam('status', 'now_showing')}
          >
            Now Showing
          </button>
          <button
            type="button"
            className={`btn btn-sm px-3 ${
              status === 'coming_soon' ? 'btn-cinema-red' : 'btn-cinema-outline'
            }`}
            onClick={() => updateParam('status', 'coming_soon')}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 mb-4 rounded-3 bg-cinematic-card border border-secondary">
        <div className="row g-3 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-sm bg-dark border-secondary text-light ps-5 py-2"
                placeholder="Search by title, cast, director..."
                value={search}
                onChange={(e) => updateParam('search', e.target.value)}
              />
              <Search
                size={16}
                className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"
              />
            </div>
          </div>

          {/* Genre Dropdown */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-light py-2"
              value={genre}
              onChange={(e) => updateParam('genre', e.target.value)}
            >
              <option value="">All Genres</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-light py-2"
              value={language}
              onChange={(e) => updateParam('language', e.target.value)}
            >
              <option value="">All Languages</option>
              {availableLanguages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="col-8 col-md-3">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-light py-2"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              <option value="-releaseDate">Newest Releases</option>
              <option value="rating">Top Rated (IMDb / Critics)</option>
              <option value="title">Alphabetical (A - Z)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="col-4 col-md-1 text-end">
            <button
              className="btn btn-sm btn-cinema-outline w-100 py-2 d-flex align-items-center justify-content-center"
              onClick={clearFilters}
              title="Reset all filters"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="col">
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-5 bg-cinematic-card rounded border border-secondary my-4">
          <Clapperboard size={48} className="text-secondary mb-3" />
          <h4 className="text-light">No movies match your criteria</h4>
          <p className="text-secondary small mb-3">
            Try adjusting your search keywords, genre, or selected city filters.
          </p>
          <button className="btn btn-cinema-red btn-sm px-4" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
            {movies.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
              <button
                className="btn btn-sm btn-cinema-outline px-3"
                disabled={page <= 1}
                onClick={() => updateParam('page', (page - 1).toString())}
              >
                Previous
              </button>
              <span className="small text-secondary px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-sm btn-cinema-outline px-3"
                disabled={page >= pagination.totalPages}
                onClick={() => updateParam('page', (page + 1).toString())}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoviesPage;
