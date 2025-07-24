import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 스타일 객체
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
    gap: '16px',
};
const linkStyle = {
    textDecoration: 'none',
    color: '#778899',
    fontWeight: '500',
    padding: '8px 12px',
    transition: 'color 0.3s',
};
const btnStyle = {
    background: 'transparent',
    color: '#008080',
    border: '2px solid #008080',
    padding: '8px 24px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
};


const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    // 컴포넌트가 렌더링될 때 로그인 상태를 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    // 로그아웃 처리 함수
    const handleLogout = () => {
        localStorage.removeItem('accessToken'); // 토큰 삭제
        setIsLoggedIn(false);
        navigate('/'); // 메인 페이지로 이동
    };

    return (
        <header style={headerStyle}>
            <nav style={navStyle}>
                <Link to="/" style={logoStyle}>
                    <img src="/icon.png" alt="Pond 로고" style={logoImgStyle} />
                    <span style={logoTextStyle}>Pond</span>
                </Link>
                <div style={navLinksStyle}>
                    {isLoggedIn ? (
                        // 로그인 상태일 때 보여줄 UI
                        <button onClick={handleLogout} style={btnStyle}>
                            로그아웃
                        </button>
                    ) : (
                        // 로그아웃 상태일 때 보여줄 UI
                        <>
                            <Link to="/login" style={linkStyle}>로그인</Link>
                            <Link to="/register" style={{...linkStyle, ...btnStyle}}>가입하기</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;