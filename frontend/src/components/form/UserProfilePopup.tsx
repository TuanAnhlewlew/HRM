import React, { useRef, useEffect, useState } from 'react';
import { api } from '../../api';
import './UserProfilePopup.css';

interface UserProfile {
  id: number;
  type: 'admin' | 'employee';
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  department_id?: number;
  department_name?: string;
  phone_number?: string;
  hire_date?: string;
  is_active?: boolean;
}

interface UserProfilePopupProps {
  user: any;
  onEmployeeDetails?: () => void;
  onChangePassword?: () => void;
}

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ user, onEmployeeDetails, onChangePassword }) => {
  const [visible, setVisible] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!visible || profile) return;
    setLoading(true);
    api('/me')
      .then((data) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible]);

  if (loading) {
    return (
      <div className="avatar-wrapper" ref={popupRef}>
        <div className="user-profile clickable" onClick={() => setVisible(!visible)}>
          <span className="user-initials">
            {user
              ? (user.first_name?.[0] || user.username?.[0] || '').toUpperCase() +
                (user.last_name?.[0] || '')
              : 'U'}
          </span>
          <span className="user-name">
            {user
              ? user.first_name
                ? `${user.first_name} ${user.last_name}`
                : user.username
              : 'User'}
          </span>
        </div>
        {visible && <div className="profile-popup">Loading...</div>}
      </div>
    );
  }

  const p = profile || ({
    id: user?.id,
    type: user?.type || 'user',
    username: user?.username,
    email: user?.email,
    first_name: user?.first_name,
    last_name: user?.last_name,
    job_title: user?.job_title,
    department_id: user?.department_id,
    phone_number: '',
    hire_date: user?.hire_date,
  } as UserProfile);

  const displayName = p
    ? p.first_name
      ? `${p.first_name} ${p.last_name}`
      : p.username || 'User'
    : 'User';

  const initials = p
    ? (p.first_name?.[0] || p.username?.[0] || '').toUpperCase() +
      (p.last_name?.[0] || '')
    : 'U';

  return (
    <div className="avatar-wrapper" ref={popupRef}>
      <div className="user-profile clickable" onClick={() => setVisible(!visible)}>
        <span className="user-initials">{initials}</span>
        <span className="user-name">{displayName}</span>
      </div>
      {visible && (
        <div className="profile-popup">
          <div className="popup-header">
            <div className="popup-avatar">{initials}</div>
            <div className="popup-name">{displayName}</div>
            <span className="popup-badge">{p.type}</span>
          </div>
          <ul className="popup-details">
            {p.type === 'admin' ? (
              <>
                <li>
                  <span className="detail-label">Username</span>
                  <span className="detail-value">{p.username}</span>
                </li>
                {p.email && (
                  <li>
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{p.email}</span>
                  </li>
                )}
                <li>
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{p.is_active ? 'Active' : 'Inactive'}</span>
                </li>
                {onChangePassword && (
                  <li className="popup-action-row">
                    <button className="popup-view-btn" onClick={onChangePassword}>
                      Change Password
                    </button>
                  </li>
                )}
              </>
            ) : (
              <>
                {p.first_name && (
                  <li>
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">
                      {p.first_name} {p.last_name}
                    </span>
                  </li>
                )}
                {p.email && (
                  <li>
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{p.email}</span>
                  </li>
                )}
                {p.phone_number && (
                  <li>
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{p.phone_number}</span>
                  </li>
                )}
                {p.job_title && (
                  <li>
                    <span className="detail-label">Role</span>
                    <span className="detail-value">{p.job_title}</span>
                  </li>
                )}
                {p.department_name && (
                  <li>
                    <span className="detail-label">Department</span>
                    <span className="detail-value">{p.department_name}</span>
                  </li>
                )}
                {p.hire_date && (
                  <li>
                    <span className="detail-label">Hire Date</span>
                    <span className="detail-value">
                      {new Date(p.hire_date).toLocaleDateString()}
                    </span>
                  </li>
                )}
                {onChangePassword && (
                  <li className="popup-action-row">
                    <button className="popup-view-btn" onClick={onChangePassword}>
                      Change Password
                    </button>
                  </li>
                )}
                {onEmployeeDetails && (
                  <li className="popup-action-row">
                    <button className="popup-view-btn" onClick={onEmployeeDetails}>
                      Employee Details
                    </button>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfilePopup;
