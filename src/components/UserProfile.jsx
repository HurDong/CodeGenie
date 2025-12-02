
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UserProfile = () => {
    const { user, updateProfile } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 사용자 이름 가져오기 (없으면 'Guest')
    const displayName = user?.name || user?.email?.split('@')[0] || 'Guest';
    const displayEmail = user?.email || '';

    // 이니셜 생성 (첫 글자 대문자)
    const initial = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        if (isSettingsOpen) {
            setEditName(user?.name || '');
            setEditEmail(user?.email || '');
        }
    }, [isSettingsOpen, user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!editEmail.trim()) {
            toast.error('이메일을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile(editName, editEmail);
            toast.success('프로필이 업데이트되었습니다.');
            setIsSettingsOpen(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error(error.response?.data?.message || '프로필 업데이트 실패');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                    {initial}
                </div>
                <div className="user-info" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span className="username" style={{
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '120px'
                    }}>
                        {displayName}
                    </span>
                    <span className="status" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{displayEmail}</span>
                </div>
                <button
                    className="settings-btn"
                    onClick={() => setIsSettingsOpen(true)}
                    style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    ⚙️
                </button>
            </div>

            {isSettingsOpen && (
                <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>⚙️ 설정</h3>
                            <button className="modal-close" onClick={() => setIsSettingsOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>이름</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="이름을 입력하세요"
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>이메일</label>
                                    <input
                                        type="email"
                                        className="modal-input"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        placeholder="이메일을 입력하세요"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="modal-btn save"
                                    disabled={isLoading}
                                    style={{ marginTop: '1rem' }}
                                >
                                    {isLoading ? '저장 중...' : '저장하기'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserProfile;

