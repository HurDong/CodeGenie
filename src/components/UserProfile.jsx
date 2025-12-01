import React from 'react';

const UserProfile = () => {
    return (
        <div className="user-profile-container" style={{
            padding: '1rem',
            borderTop: '1px solid #334155',
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#e2e8f0'
        }}>
            <div className="avatar" style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
            }}>
                👤
            </div>
            <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="username" style={{ fontWeight: '600', fontSize: '0.95rem' }}>User</span>
                <span className="status" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Free Plan</span>
            </div>
            <button className="settings-btn" style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
            }}>
                ⚙️
            </button>
        </div>
    );
};

export default UserProfile;
