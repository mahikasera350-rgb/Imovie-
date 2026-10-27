import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CityProvider>
          <AppRoutes />
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
