import React, { useEffect, useState } from 'react';
import './SuperAdminProfile.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  FaUserEdit,
  FaSave,
  FaUpload,
  FaPhoneAlt,
  FaBirthdayCake,
} from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdPhotoCamera } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const SuperAdminProfile = () => {
  const [superadmin, setSuperadmin] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('admin_token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error('Session expired. Please log in again.');
      navigate('/login-superadmin');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5003/admin/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setSuperadmin(data.superAdmin);
        } else {
          toast.error(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        toast.error('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleChange = (e) => {
    setSuperadmin({ ...superadmin, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'age',
      'gender',
      'nationality',
      'stateOfOrigin',
      'dateOfBirth',
      'address',
      'maritalStatus',
    ];

    const updatePayload = {};
    for (const key of allowedFields) {
      if (superadmin[key] !== undefined) {
        updatePayload[key] = superadmin[key];
      }
    }

    try {
      const res = await fetch('http://localhost:5003/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully');
        setSuperadmin(data.superAdmin);
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Profile update failed');
      }
    } catch (err) {
      toast.error('Error updating profile');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) {
      toast.warn('Please select a photo');
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', selectedPhoto);

    try {
      const res = await fetch('http://localhost:5003/admin/upload-profile-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Photo uploaded successfully');
        setSuperadmin((prev) => ({ ...prev, profilePhoto: data.url }));
        setSelectedPhoto(null);
        setPhotoPreview(null);
      } else {
        toast.error(data.message || 'Photo upload failed');
      }
    } catch (err) {
      toast.error('Error uploading photo');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="superadmin-profile-container">
      <div className="superadmin-profile-header">
        <h2>
          <AiOutlineUser /> Profile
        </h2>
        <button
          className="superadmin-profile-btn edit-toggle"
          onClick={() => setIsEditing(!isEditing)}
        >
          <FaUserEdit /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div className="superadmin-profile-photo-section">
        <img
          src={photoPreview || superadmin.profilePhoto || '/default-avatar.png'}
          alt="Profile"
          className="superadmin-profile-img"
        />
        <label htmlFor="adminPhotoUpload" className="superadmin-profile-upload-label">
          <MdPhotoCamera /> Choose Photo
        </label>
        <input
          id="adminPhotoUpload"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="superadmin-profile-file-input"
        />
        {selectedPhoto && (
          <button className="superadmin-profile-btn upload" onClick={handlePhotoUpload}>
            <FaUpload /> Upload Photo
          </button>
        )}
      </div>

      {[
        { label: 'First Name', name: 'firstName' },
        { label: 'Last Name', name: 'lastName' },
        { label: 'Email', name: 'email', icon: <MdEmail />, readOnly: true },
        { label: 'Phone Number', name: 'phoneNumber', icon: <FaPhoneAlt /> },
        { label: 'Age', name: 'age' },
        { label: 'Gender', name: 'gender' },
        { label: 'Nationality', name: 'nationality' },
        { label: 'State of Origin', name: 'stateOfOrigin' },
      ].map((field) => (
        <div className="superadmin-profile-form-group" key={field.name}>
          <label>
            {field.icon} {field.label}
          </label>
          {field.name === 'gender' ? (
            <select
              name="gender"
              value={superadmin.gender || ''}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">--Select Gender--</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <input
              type={field.name === 'age' ? 'number' : 'text'}
              name={field.name}
              value={superadmin[field.name] || ''}
              onChange={handleChange}
              readOnly={field.readOnly || !isEditing}
            />
          )}
        </div>
      ))}

      <div className="superadmin-profile-form-group">
        <label>
          <FaBirthdayCake /> Date of Birth
        </label>
        <input
          type="date"
          name="dateOfBirth"
          value={superadmin.dateOfBirth?.slice(0, 10) || ''}
          onChange={handleChange}
          readOnly={!isEditing}
        />
      </div>

      <div className="superadmin-profile-form-group">
        <label>
          <MdLocationOn /> Address
        </label>
        <textarea
          name="address"
          rows="3"
          value={superadmin.address || ''}
          onChange={handleChange}
          readOnly={!isEditing}
        />
      </div>

      <div className="superadmin-profile-form-group">
        <label>Marital Status</label>
        <select
          name="maritalStatus"
          value={superadmin.maritalStatus || ''}
          onChange={handleChange}
          disabled={!isEditing}
        >
          <option value="">--Select--</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>
      </div>

      {isEditing && (
        <button className="superadmin-profile-btn save" onClick={handleUpdate}>
          <FaSave /> Save Changes
        </button>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SuperAdminProfile;
