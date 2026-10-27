import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import theatreService from '../../services/theatreService';
import { Building2, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminAddEditTheatrePage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'New York',
    phone: '',
    facilities: 'Dolby Atmos, IMAX, Recliner Seats, Food Court, Parking',
    screens: [
      {
        screenNumber: 1,
        name: 'Screen 1',
        format: 'IMAX',
        soundSystem: 'Dolby Atmos 7.1',
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchTheatre = async () => {
        try {
          const res = await theatreService.getTheatreById(id);
          const t = res.data.theatre;
          setFormData({
            name: t.name || '',
            address: t.address || '',
            city: t.city || 'New York',
            phone: t.phone || '',
            facilities: t.facilities?.join(', ') || '',
            screens: t.screens && t.screens.length > 0 ? t.screens : [
              { screenNumber: 1, name: 'Screen 1', format: 'Standard 2D', soundSystem: 'Dolby Atmos' },
            ],
          });
        } catch (err) {
          toast.error('Failed to load theatre');
          navigate('/admin/theatres');
        } finally {
          setFetching(false);
        }
      };
      fetchTheatre();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddScreen = () => {
    const nextNum = formData.screens.length + 1;
    setFormData((prev) => ({
      ...prev,
      screens: [
        ...prev.screens,
        {
          screenNumber: nextNum,
          name: `Screen ${nextNum}`,
          format: 'Standard 2D',
          soundSystem: 'Dolby Atmos 7.1',
        },
      ],
    }));
  };

  const handleRemoveScreen = (idx) => {
    if (formData.screens.length <= 1) {
      toast.info('At least one screen is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      screens: prev.screens.filter((_, i) => i !== idx),
    }));
  };

  const handleScreenChange = (idx, field, val) => {
    setFormData((prev) => {
      const updated = [...prev.screens];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, screens: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        facilities: formData.facilities.split(',').map((f) => f.trim()).filter(Boolean),
      };

      if (isEdit) {
        await theatreService.updateTheatre(id, payload);
        toast.success('Theatre updated successfully');
      } else {
        await theatreService.createTheatre(payload);
        toast.success('New theatre created successfully');
      }

      navigate('/admin/theatres');
    } catch (err) {
      toast.error(err.message || 'Failed to save theatre');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading theatre details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: '800px' }}>
      <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary">
        <Link to="/admin/theatres" className="btn btn-sm btn-cinema-outline p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="fw-bold text-light mb-0">
            {isEdit ? 'Edit Theatre' : 'Add New Theatre'}
          </h2>
          <p className="text-secondary small mb-0">Multiplex location, screen auditoriums, and facilities</p>
        </div>
      </div>

      <div className="card bg-cinematic-card border-secondary text-light p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label small text-secondary fw-semibold">Cinema / Theatre Name</label>
              <input
                type="text"
                required
                name="name"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="e.g. IMovies Grand Cinema & IMAX"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">City</label>
              <input
                type="text"
                required
                name="city"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="e.g. New York"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label small text-secondary fw-semibold">Full Address</label>
              <input
                type="text"
                required
                name="address"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="1540 Broadway, Times Square"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-secondary fw-semibold">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-control form-control-sm bg-dark border-secondary text-light py-2"
                placeholder="+1 212-555-0100"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="form-label small text-secondary fw-semibold">Facilities (comma separated)</label>
            <input
              type="text"
              name="facilities"
              className="form-control form-control-sm bg-dark border-secondary text-light py-2"
              placeholder="Dolby Atmos, Recliner Seats, Food Court, Parking"
              value={formData.facilities}
              onChange={handleChange}
            />
          </div>

          {/* Screen Auditoriums */}
          <div className="pt-3 border-top border-secondary">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-light mb-0">Auditoriums / Screens</h6>
              <button
                type="button"
                className="btn btn-sm btn-cinema-outline d-flex align-items-center gap-1"
                onClick={handleAddScreen}
              >
                <Plus size={14} /> Add Screen
              </button>
            </div>

            <div className="d-flex flex-column gap-2">
              {formData.screens.map((scr, idx) => (
                <div key={idx} className="p-3 rounded bg-dark border border-secondary d-flex gap-2 align-items-center">
                  <div className="fw-bold text-danger small" style={{ width: '30px' }}>
                    #{scr.screenNumber}
                  </div>
                  <input
                    type="text"
                    required
                    className="form-control form-control-sm bg-cinematic border-secondary text-light"
                    placeholder="Screen Name"
                    value={scr.name}
                    onChange={(e) => handleScreenChange(idx, 'name', e.target.value)}
                  />
                  <select
                    className="form-select form-select-sm bg-cinematic border-secondary text-light"
                    style={{ width: '150px' }}
                    value={scr.format}
                    onChange={(e) => handleScreenChange(idx, 'format', e.target.value)}
                  >
                    <option value="Standard 2D">Standard 2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                    <option value="Dolby Cinema">Dolby Cinema</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-sm text-secondary p-1"
                    onClick={() => handleRemoveScreen(idx)}
                    title="Remove screen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
            <Link to="/admin/theatres" className="btn btn-sm btn-cinema-outline px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-sm btn-cinema-red px-4 d-flex align-items-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Saving...' : isEdit ? 'Update Theatre' : 'Create Theatre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddEditTheatrePage;
