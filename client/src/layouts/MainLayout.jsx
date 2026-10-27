import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CityModal from '../components/common/CityModal';
import { ToastContainer } from 'react-toastify';

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-cinematic">
      <Navbar />
      <CityModal />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default MainLayout;
