import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Profile from '../components/Profile';
import { useAppContext, User } from '../App';

// Create a type for the Profile component's User (without createdAt)
type ProfileUser = Omit<User, 'createdAt'>;

const DashboardPage = () => {
  const { isLoggedIn, profile, setProfile, logout } = useAppContext();
  console.log(profile);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'users'
  const [pageLoading, setPageLoading] = useState(true);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Simulate page loading
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    
    // Fetch users list
    fetchUsers();
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle profile updates
  const handleProfileUpdate = (updatedUser: ProfileUser) => {
    if (profile) {
      setProfile({
        ...profile,
        user: {
          ...updatedUser,
          createdAt: profile.user.createdAt
        }
      });
    }
    setShowProfileEdit(false);
  };

  // Render skeleton loaders for profile
  const renderProfileSkeleton = () => (
    <div className="profile-card animate-fade-in">
      <div className="profile-header">
        <div className="skeleton skeleton-circle"></div>
        <div className="profile-info" style={{ width: '100%' }}>
          <div className="skeleton skeleton-text" style={{ height: '2rem', marginBottom: '1rem' }}></div>
          <div className="skeleton skeleton-text short"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>
      </div>
      <div className="bio-section">
        <div className="skeleton skeleton-text" style={{ height: '1.5rem', marginBottom: '1rem' }}></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
      </div>
      <div className="skeleton skeleton-button"></div>
    </div>
  );

  // Render skeleton loaders for users table
  const renderUsersSkeleton = () => (
    <div className="users-table-container animate-fade-in">
      <table className="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              <td>
                <div className="user-cell">
                  <div className="skeleton skeleton-circle" style={{ width: '40px', height: '40px' }}></div>
                  <div style={{ width: '100%' }}>
                    <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </td>
              <td><div className="skeleton skeleton-text"></div></td>
              <td><div className="skeleton skeleton-text" style={{ width: '70%' }}></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (pageLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div className="user-welcome">
            <div className="skeleton skeleton-text" style={{ height: '2.5rem', width: '60%' }}></div>
          </div>
          <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: 'var(--radius-md)' }}></div>
        </div>

        <div className="dashboard-tabs">
          <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: 'var(--radius-md)' }}></div>
          <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: 'var(--radius-md)' }}></div>
        </div>

        <div className="dashboard-content">
          {renderProfileSkeleton()}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-header">
        <div className="user-welcome">
          <h1>Welcome, {profile?.user?.fullName || profile?.user?.username || profile?.user?.email}</h1>
        </div>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'profile' && (
          <div className="profile-section animate-fade-in">
            {!showProfileEdit ? (
              <div className="profile-card animate-slide-up">
                <div className="profile-header">
                  {profile?.user?.profileImageUrl ? (
                    <img  
                      src={profile.user.profileImageUrl} 
                      alt="Profile" 
                      className="profile-avatar" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {profile?.user?.fullName 
                        ? profile.user.fullName.charAt(0).toUpperCase() 
                        : profile?.user?.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="profile-info">
                    <h2>{profile?.user?.fullName || 'No name set'}</h2>
                    <p className="username">@{profile?.user?.username || profile?.user?.email.split('@')[0]}</p>
                    <p className="email">{profile?.user?.email}</p>
                  </div>
                </div>
                
                <div className="bio-section">
                  <h3>Bio</h3>
                  <p>{profile?.user?.bio && profile.user.bio !== 'n/a' ? profile.user.bio : 'No bio added yet.'}</p>
                </div>
                
                <button 
                  className="btn btn-primary mt-4" 
                  onClick={() => setShowProfileEdit(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              profile && <Profile 
                user={{
                  email: profile.user.email,
                  username: profile.user.username,
                  fullName: profile.user.fullName,
                  bio: profile.user.bio,
                  profileImageUrl: profile.user.profileImageUrl
                }} 
                onProfileUpdate={handleProfileUpdate}
              />
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section animate-fade-in">
            <h2>All Users</h2>
            {loadingUsers ? (
              renderUsersSkeleton()
            ) : error ? (
              <div className="alert alert-error">{error}</div>
            ) : users.length > 0 ? (
              <div className="users-table-container animate-slide-up">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={index} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in">
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                                  {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={user.username || user.email} />
                              ) : (
                                <div className="avatar-placeholder">
                                  {user.fullName 
                                    ? user.fullName.charAt(0).toUpperCase() 
                                    : user.email.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="user-info">
                              <span className="user-name">{user.fullName || 'No name'}</span>
                              {user.username && <span className="user-username">@{user.username}</span>}
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No users found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 