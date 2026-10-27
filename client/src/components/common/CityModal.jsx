import React, { useState } from 'react';
import { useCity } from '../../context/CityContext';
import { MapPin, X, Search } from 'lucide-react';

const CityModal = () => {
  const { selectedCity, cities, changeCity, isCityModalOpen, setIsCityModalOpen } = useCity();
  const [search, setSearch] = useState('');

  if (!isCityModalOpen) return null;

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-cinematic-card border-secondary text-light shadow-lg">
          <div className="modal-header border-secondary">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <MapPin className="text-danger" size={20} />
              Select Your Cinema City
            </h5>
            <button
              type="button"
              className="btn text-secondary p-0"
              onClick={() => {
                setIsCityModalOpen(false);
                setSearch('');
              }}
            >
              <X size={20} />
            </button>
          </div>
          <div className="modal-body py-4">
            <p className="text-muted small mb-3">
              Choose your city to discover shows, theatres, and live seat availability near you.
            </p>

            {/* City search filter */}
            <div className="position-relative mb-4" style={{ maxWidth: '400px' }}>
              <input
                type="text"
                className="form-control form-control-sm bg-dark border-secondary text-light ps-5 py-2"
                placeholder="Search city (e.g. Indore, Mumbai, Delhi)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <Search
                size={16}
                className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"
              />
            </div>

            <div className="row g-2">
              {filteredCities.map((city) => (
                <div key={city} className="col-6 col-sm-4">
                  <button
                    className={`btn w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 text-capitalize ${
                      selectedCity.toLowerCase() === city.toLowerCase()
                        ? 'btn-cinema-red shadow-sm'
                        : 'btn-cinema-outline'
                    }`}
                    onClick={() => {
                      changeCity(city);
                      setSearch('');
                    }}
                  >
                    <MapPin size={15} />
                    <span className="fw-semibold text-truncate">{city}</span>
                  </button>
                </div>
              ))}
              {filteredCities.length === 0 && (
                <div className="col-12 text-center text-muted py-3 small">
                  No cities found matching "{search}".
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityModal;
