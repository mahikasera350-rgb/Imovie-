import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import theatreService from '../services/theatreService';
import showService from '../services/showService';
import { useCity } from '../context/CityContext';
import { formatDate, formatTime } from '../utils/formatters';
import { Building2, MapPin, Phone, Film, Calendar } from 'lucide-react';

const TheatresPage = () => {
  const navigate = useNavigate();
  const { selectedCity, cities, changeCity } = useCity();

  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheatres = async () => {
      setLoading(true);
      try {
        const res = await theatreService.getTheatres({ city: selectedCity });
        setTheatres(res.data.theatres || []);
      } catch (err) {
        console.error('Failed to load theatres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, [selectedCity]);

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <Building2 className="text-danger" size={26} />
            Cinemas & Theatres in {selectedCity}
          </h2>
          <p className="text-secondary small mb-0">
            Discover IMAX auditoriums, Dolby Atmos screens, and luxury seating locations
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="d-flex gap-2 flex-wrap">
          {cities.map((city) => (
            <button
              key={city}
              className={`btn btn-sm px-3 py-1.5 rounded-pill ${
                selectedCity.toLowerCase() === city.toLowerCase()
                  ? 'btn-cinema-red'
                  : 'btn-cinema-outline'
              }`}
              onClick={() => changeCity(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading theatres...</span>
          </div>
        </div>
      ) : theatres.length === 0 ? (
        <div className="p-5 text-center bg-cinematic-card rounded-3 border border-secondary">
          <Building2 size={44} className="text-secondary mb-2" />
          <h5 className="text-light">No theatres registered in {selectedCity}</h5>
          <p className="text-secondary small mb-0">Please switch to another city to explore venues.</p>
        </div>
      ) : (
        <div className="row g-4">
          {theatres.map((theatre) => (
            <div key={theatre._id} className="col-12 col-lg-6">
              <div className="p-4 rounded-3 bg-cinematic-card border border-secondary h-100 d-flex flex-column justify-content-between shadow-sm">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 className="fw-bold text-light mb-1">{theatre.name}</h4>
                    <span className="badge bg-danger">{theatre.screens?.length || 1} Screen(s)</span>
                  </div>

                  <div className="small text-secondary mb-3 d-flex flex-column gap-1">
                    <div className="d-flex align-items-center gap-2">
                      <MapPin size={15} className="text-danger" />
                      <span>{theatre.address}, {theatre.city}</span>
                    </div>
                    {theatre.phone && (
                      <div className="d-flex align-items-center gap-2">
                        <Phone size={14} className="text-muted" />
                        <span>{theatre.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Screens & Formats */}
                  <div className="mb-3">
                    <div className="small text-muted fw-semibold mb-2">Auditorium Experiences:</div>
                    <div className="d-flex flex-wrap gap-1.5">
                      {theatre.screens?.map((scr) => (
                        <span key={scr._id || scr.screenNumber} className="badge bg-dark border border-secondary text-light px-2.5 py-1">
                          {scr.name} ({scr.format})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Facilities */}
                  {theatre.facilities && theatre.facilities.length > 0 && (
                    <div className="mb-4">
                      <div className="small text-muted fw-semibold mb-1">Amenities:</div>
                      <div className="small text-secondary">
                        {theatre.facilities.join(' • ')}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-sm btn-cinema-red w-100 py-2 fw-semibold"
                  onClick={() => navigate(`/movies?city=${theatre.city}`)}
                >
                  View Active Movies at this Cinema
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
