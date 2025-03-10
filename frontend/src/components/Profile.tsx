import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import './Profile.css';
import { User as AppUser } from '../App';

// We need a local User type without createdAt for the Profile component
interface User extends Omit<AppUser, 'createdAt'> {}

interface ProfileProps {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
}

const Profile = ({ user, onProfileUpdate }: ProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      
      // The profileImageUrl is now a complete S3 signed URL
      if (user.profileImageUrl) {
        setImagePreview(user.profileImageUrl);
      }
    }
  }, [user]);
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const uploadImage = async (): Promise<string | null> => {
    if (!profileImage) return null;
    
    const formData = new FormData();
    formData.append('profileImage', profileImage);
    
    try {
      const { data } = await axios.post('/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
        return data.user.profileImageUrl;
    } catch (err: unknown) {
      console.error('Error uploading image:', err);
      const error = err as Error;
      throw new Error(error.message || 'Failed to upload image');
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // First upload image if selected
      let imageUrl = null;
      if (profileImage) {
        try {
          imageUrl = await uploadImage();
        } catch (imageError: unknown) {
          const error = imageError as Error;
          setError(error.message);
          setLoading(false);
          return;
        }
      }
      
      // Update profile information
      const { data } = await axios.put('/profile', {
        username,
        fullName,
        bio
      });
      
      setSuccess('Profile updated successfully!');
      
      // Update parent component with new user data
      if (onProfileUpdate) {
        onProfileUpdate({
          ...data.user,
          profileImageUrl: imageUrl || data.user.profileImageUrl
        });
      }
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      const error = err as Error;
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="profile-edit-container">
      <h2>Edit Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="profile-image-section">
          <div className="profile-image-container">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="profile-image-preview" />
            ) : (
              <div className="profile-image-placeholder">
                {fullName ? fullName.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="profile-image-upload">
            <label htmlFor="profile-image" className="upload-button">
              Choose Image
            </label>
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a unique username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            rows={4}
          ></textarea>
        </div>
        
        <button type="submit" className="save-profile-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile; 