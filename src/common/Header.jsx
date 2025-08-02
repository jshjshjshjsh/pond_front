import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoSettingsOutline } from "react-icons/io5";
import axiosInstance from '../api/axiosInstance.js';

const headerStyle = {
    padding: '20px 0',
    background: '#fdfdfd',
    borderBottom: '1px solid #eee',
};
const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
};
const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
};
const logoImgStyle = {
    height: '40px',
    width: 'auto',
    marginRight: '12px',
};
const logoTextStyle = {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#36454F',
};
const navLinksStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // 간격 살짝 조정
};

const baseLinkStyle = {
    textDecoration: 'none',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '8px', // 모서리를 둥글게
    transition: 'all 0.2s ease-in-out', // 부드러운 전환 효과
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hovered, setHovered] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
    }, [navigate]);

    const handleLogout = async () => {
        try {
            // 백엔드의 로그아웃 API 호출
            await axiosInstance.get('/logout');
        } catch (error) {
            console.error('로그아웃 중 에러 발생:', error);
        } finally {
            // API 호출 성공/실패와 관계없이 프론트엔드 상태 정리
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            alert('로그아웃 되었습니다.');
            navigate('/');
        }
    };

    const linkStyle = (name) => ({
        ...baseLinkStyle,
        color: '#778899',
        backgroundColor: hovered === name ? '#f0f0f0' : 'transparent' // 호버 시 배경색 변경
    });

    const iconLinkStyle = (name) => ({
        ...baseLinkStyle,
        color: '#778899',
        fontSize: '1.5rem',
        backgroundColor: hovered === name ? '#f0f0f0' : 'transparent'
    });

    return (
        <header style={headerStyle}>
            <nav style={navStyle}>
                <Link to="/" style={logoStyle}>
                    <img src="/icon.png" alt="Pond 로고" style={logoImgStyle} />
                    <span style={logoTextStyle}>Pond</span>
                </Link>
                <div style={navLinksStyle}>
                    {isLoggedIn ? (
                        <>
                            <Link
                                to="/calendar"
                                style={linkStyle('calendar')}
                                onMouseEnter={() => setHovered('calendar')}
                                onMouseLeave={() => setHovered(null)}
                            >
                                업무일지
                            </Link>
                            <Link
                                to="/admin"
                                style={iconLinkStyle('admin')}
                                title="관리"
                                onMouseEnter={() => setHovered('admin')}
                                onMouseLeave={() => setHovered(null)}
                            >
                                <IoSettingsOutline />
                            </Link>
                            <button
                                onClick={handleLogout}
                                style={{ ...baseLinkStyle, color: '#008080', border: '2px solid #008080', backgroundColor: hovered === 'logout' ? '#f0f0f0' : 'transparent', padding: '8px 24px', cursor: 'pointer' }}
                                onMouseEnter={() => setHovered('logout')}
                                onMouseLeave={() => setHovered(null)}
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={linkStyle('login')}
                                onMouseEnter={() => setHovered('login')}
                                onMouseLeave={() => setHovered(null)}
                            >
                                로그인
                            </Link>
                            <Link
                                to="/register"
                                style={{ ...baseLinkStyle, color: '#008080', border: '2px solid #008080', backgroundColor: hovered === 'register' ? '#f0f0f0' : 'transparent', padding: '8px 24px' }}
                                onMouseEnter={() => setHovered('register')}
                                onMouseLeave={() => setHovered(null)}
                            >
                                가입하기
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;