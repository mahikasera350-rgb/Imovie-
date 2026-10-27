import React, { createContext, useContext, useState, useEffect } from 'react';
import theatreService from '../services/theatreService';

const CityContext = createContext(null);

const DEFAULT_CITIES = [
  'Indore',
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Pune',
  'New York',
  'Los Angeles',
  'Chicago',
  'San Francisco',
];

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('imovies_city') || 'Mumbai'
  );
  const [cities, setCities] = useState(DEFAULT_CITIES);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await theatreService.getCities();
        if (res.data?.cities?.length > 0) {
          // Combine API cities with default cities to ensure Indian cities are always present
          const uniqueCities = Array.from(new Set([...res.data.cities, ...DEFAULT_CITIES]));
          setCities(uniqueCities);
        }
      } catch (err) {
        // Fallback default cities
      }
    };
    fetchCities();
  }, []);

  const changeCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('imovies_city', city);
    setIsCityModalOpen(false);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        cities,
        changeCity,
        isCityModalOpen,
        setIsCityModalOpen,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

export default CityContext;
