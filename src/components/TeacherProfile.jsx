import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherProfile.css';
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
import LoadingSpinner from './LoadingSpinner';

const TeacherProfile = () => {
  const [teacher, setTeacher] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('teacher_token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error('Session expired. Please log in again.');
      navigate('/login-teacher');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://sof-edu-backend.onrender.com/teacher/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setTeacher(data);
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
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/teacher/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teacher),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully');
        setTeacher(data.teacher);
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
    formData.append('photo', selectedPhoto);

    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/teacher/upload-profile-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Photo uploaded successfully');
        setTeacher((prev) => ({ ...prev, profilePhoto: data.url }));
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
    <div className="teacher-profile-container">
      <div className="teacher-profile-header">
        <h2><AiOutlineUser /> Staff Profile</h2>
        <button
          className="teacher-profile-btn edit-toggle"
          onClick={() => setIsEditing(!isEditing)}
        >
          <FaUserEdit /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div className="teacher-profile-photo-section">
        <img
          src={photoPreview || teacher.profilePhoto || '/default-avatar.png'}
          alt="Profile"
          className="teacher-profile-img"
        />
        <label htmlFor="teacherPhotoUpload" className="teacher-profile-upload-label">
          <MdPhotoCamera /> Choose Photo
        </label>
        <input
          id="teacherPhotoUpload"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="teacher-profile-file-input"
        />
        {selectedPhoto && (
          <button className="teacher-profile-btn upload" onClick={handlePhotoUpload}>
            <FaUpload /> Upload Photo
          </button>
        )}
      </div>

      {[
        { label: 'Title', name: 'title' },
        { label: 'First Name', name: 'firstName' },
        { label: 'Last Name', name: 'lastName' },
        { label: 'Email', name: 'email', icon: <MdEmail />, readOnly: true },
        { label: 'Department', name: 'department' },
        { label: 'Phone Number', name: 'phoneNumber', icon: <FaPhoneAlt /> },
        { label: 'Age', name: 'age' },
        { label: 'Gender', name: 'gender' },
        { label: 'Nationality', name: 'nationality' },
        { label: 'State of Origin', name: 'stateOfOrigin' },
      ].map((field) => (
        <div className="teacher-profile-form-group" key={field.name}>
          <label>
            {field.icon} {field.label}
          </label>
          {field.name === 'gender' ? (
            <select
              name="gender"
              value={teacher.gender || ''}
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
              value={teacher[field.name] || ''}
              onChange={handleChange}
              readOnly={field.readOnly || !isEditing}
            />
          )}
        </div>
      ))}

      <div className="teacher-profile-form-group">
        <label><FaBirthdayCake /> Date of Birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={teacher.dateOfBirth?.slice(0, 10) || ''}
          onChange={handleChange}
          readOnly={!isEditing}
        />
      </div>

      <div className="teacher-profile-form-group">
        <label><MdLocationOn /> Address</label>
        <textarea
          name="address"
          rows="3"
          value={teacher.address || ''}
          onChange={handleChange}
          readOnly={!isEditing}
        />
      </div>

      <div className="teacher-profile-form-group">
        <label>Marital Status</label>
        <select
          name="maritalStatus"
          value={teacher.maritalStatus || ''}
          onChange={handleChange}
          disabled={!isEditing}
        >
          <option value="">--Select--</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>
      </div>

      {isEditing && (
        <button className="teacher-profile-btn save" onClick={handleUpdate}>
          <FaSave /> Save Changes
        </button>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default TeacherProfile;
