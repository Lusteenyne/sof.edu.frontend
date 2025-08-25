import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentProfile.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from './LoadingSpinner';
import {
  FaUserEdit,
  FaSave,
  FaUpload,
  FaPhoneAlt,
  FaBirthdayCake,
} from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdPhotoCamera } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';

const StudentProfile = () => {
  const [student, setStudent] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('student_token');

  useEffect(() => {
   
    if (!token) {
      toast.warn('Please log in first');
      navigate('/login-student');
      return;
    }

    const fetchProfile = async () => {
      console.log('Fetching student profile...');
      try {
        const res = await fetch('https://sof-edu-backend.onrender.com/student/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          console.log('Profile fetched:', data);
          setStudent(data);
        } else {
          console.warn('Failed to fetch profile:', data.message);
          toast.error(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        toast.error('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/student/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(student),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully');
        setStudent(data.student);
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
      const res = await fetch('https://sof-edu-backend.onrender.com/student/upload-profile-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Photo uploaded successfully');
        setStudent((prev) => ({ ...prev, profilePhoto: data.url }));
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
    <div className="student-profile-container">
      <div className="student-profile-header">
        <h2>
          <AiOutlineUser /> Student Profile
        </h2>
        <button
          className="student-profile-btn edit-toggle"
          onClick={() => setIsEditing(!isEditing)}
        >
          <FaUserEdit /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div className="student-profile-photo-section">
        <img
          src={photoPreview || student.profilePhoto || '/default-avatar.png'}
          alt="Profile"
          className="student-profile-img"
        />
        <label htmlFor="photoUpload" className="student-profile-upload-label">
          <MdPhotoCamera /> Choose Photo
        </label>
        <input
          id="photoUpload"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="student-profile-file-input"
        />
        {selectedPhoto && (
          <button className="student-profile-btn upload" onClick={handlePhotoUpload}>
            <FaUpload /> Upload Photo
          </button>
        )}
      </div>

      {[
        { label: 'First Name', name: 'firstname' },
        { label: 'Last Name', name: 'lastname' },
        { label: 'Email', name: 'email', readOnly: true, icon: <MdEmail /> },
        { label: 'Department', name: 'department', readOnly: true },
        { label: 'Level', name: 'level', readOnly: true },
        { label: 'Semester', name: 'semester', readOnly: true },
        { label: 'Student ID', name: 'studentId', readOnly: true },
        { label: 'Phone Number', name: 'phoneNumber', icon: <FaPhoneAlt /> },
        { label: 'Age', name: 'age' },
        { label: 'Nationality', name: 'nationality' },
        { label: 'State of Origin', name: 'stateOfOrigin' },
      ].map((field) => (
        <div className="student-profile-form-group" key={field.name}>
          <label>
            {field.icon} {field.label}
          </label>
          <input
            type={field.name === 'age' ? 'number' : 'text'}
            name={field.name}
            value={student[field.name] || ''}
            onChange={handleChange}
            readOnly={!isEditing || field.readOnly}
          />
        </div>
      ))}

      <div className="student-profile-form-group">
        <label>Gender</label>
        <select
          name="gender"
          value={student.gender || ''}
          onChange={handleChange}
          disabled={!isEditing}
        >
          <option value="">--Select--</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className="student-profile-form-group">
        <label>
          <FaBirthdayCake /> Date of Birth
        </label>
        <input
          type="date"
          name="dateOfBirth"
          value={student.dateOfBirth?.slice(0, 10) || ''}
          onChange={handleChange}
          readOnly={!isEditing}
        />
      </div>

      <div className="student-profile-form-group">
        <label>
          <MdLocationOn /> Address
        </label>
        <textarea
          name="address"
          rows="3"
          value={student.address || ''}
          onChange={handleChange}
          readOnly={!isEditing}
        />
      </div>

      <div className="student-profile-form-group">
        <label>Marital Status</label>
        <select
          name="maritalStatus"
          value={student.maritalStatus || ''}
          onChange={handleChange}
          disabled={!isEditing}
        >
          <option value="">--Select--</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>
      </div>

      {isEditing && (
        <button className="student-profile-btn save" onClick={handleUpdate}>
          <FaSave /> Save Changes
        </button>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default StudentProfile;
