import { useState, useEffect } from 'react';
import { CITIES, type CityConfig } from '../lib/riskEngine';

// Simple state management for the current city
// In a larger app, this would be a Context or Zustand store
let currentCityId = 'delhi';
const listeners: ((city: CityConfig) => void)[] = [];

export const setCity = (cityId: string) => {
  if (CITIES[cityId]) {
    currentCityId = cityId;
    const city = CITIES[cityId];
    listeners.forEach(listener => listener(city));
    localStorage.setItem('rakshika_current_city', cityId);
  }
};

export const getCity = (): CityConfig => {
  return CITIES[currentCityId] || CITIES.delhi;
};

export const useCity = () => {
  const [city, setCityState] = useState<CityConfig>(getCity());

  useEffect(() => {
    const savedCity = localStorage.getItem('rakshika_current_city');
    if (savedCity && CITIES[savedCity] && savedCity !== currentCityId) {
      setCity(savedCity);
    }

    const listener = (newCity: CityConfig) => {
      setCityState(newCity);
    };

    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return { 
    city, 
    setCity: (id: string) => setCity(id),
    allCities: Object.values(CITIES)
  };
};
