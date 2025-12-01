import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const email = searchParams.get('email');
        const name = searchParams.get('name');

        if (accessToken) {
            loginWithToken(accessToken, refreshToken, { email, name });
            toast.success('로그인되었습니다!');
            navigate('/ai-mentoring');
        } else {
            toast.error('로그인 실패: 토큰이 없습니다.');
            navigate('/');
        }
    }, [searchParams, navigate, loginWithToken]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', background: '#0f172a' }}>
            <h2>로그인 처리 중...</h2>
        </div>
    );
};

export default OAuthCallback;
