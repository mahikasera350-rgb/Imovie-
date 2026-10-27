import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Common Route Guards
import ProtectedRoute, { AdminRoute } from '../components/common/ProtectedRoute';

// Public & Customer Pages
import HomePage from '../pages/HomePage';
import MoviesPage from '../pages/MoviesPage';
import MovieDetailPage from '../pages/MovieDetailPage';
import TheatresPage from '../pages/TheatresPage';
import SeatSelectionPage from '../pages/SeatSelectionPage';
import BookingSummaryPage from '../pages/BookingSummaryPage';
import PaymentPage from '../pages/PaymentPage';
import BookingConfirmationPage from '../pages/BookingConfirmationPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import UserDashboardPage from '../pages/UserDashboardPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import BookingDetailPage from '../pages/BookingDetailPage';
import ProfilePage from '../pages/ProfilePage';
import NotificationsPage from '../pages/NotificationsPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import PrivacyPage from '../pages/PrivacyPage';
import TermsPage from '../pages/TermsPage';
import NotFoundPage from '../pages/NotFoundPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminMoviesPage from '../pages/admin/AdminMoviesPage';
import AdminAddEditMoviePage from '../pages/admin/AdminAddEditMoviePage';
import AdminTheatresPage from '../pages/admin/AdminTheatresPage';
import AdminAddEditTheatrePage from '../pages/admin/AdminAddEditTheatrePage';
import AdminShowsPage from '../pages/admin/AdminShowsPage';
import AdminAddEditShowPage from '../pages/admin/AdminAddEditShowPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer & Public Facing Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="movies/:id" element={<MovieDetailPage />} />
        <Route path="theatres" element={<TheatresPage />} />
        <Route path="seats/:showId" element={<SeatSelectionPage />} />

        {/* Protected Customer Booking Checkout Flow */}
        <Route
          path="booking/summary"
          element={
            <ProtectedRoute>
              <BookingSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="booking/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="confirmation/:bookingId"
          element={
            <ProtectedRoute>
              <BookingConfirmationPage />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected User Account Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* General Static Informational Pages */}
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />

        {/* 404 Catch All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Panel Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="movies" element={<AdminMoviesPage />} />
        <Route path="movies/add" element={<AdminAddEditMoviePage />} />
        <Route path="movies/edit/:id" element={<AdminAddEditMoviePage />} />
        <Route path="theatres" element={<AdminTheatresPage />} />
        <Route path="theatres/add" element={<AdminAddEditTheatrePage />} />
        <Route path="theatres/edit/:id" element={<AdminAddEditTheatrePage />} />
        <Route path="shows" element={<AdminShowsPage />} />
        <Route path="shows/add" element={<AdminAddEditShowPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
