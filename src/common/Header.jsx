import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    const handleLogout = async () => {
        const token = localStorage.getItem('accessToken');

        try {
            if (token) {
                // 1. 서버에 로그아웃 요청을 보냅니다.
                // Spring Security의 기본 logout은 주로 POST 요청을 처리합니다.
                await axios.post('http://localhost:8080/logout', {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('서버에 로그아웃 요청을 보냈습니다.');
            }
        } catch (error) {
            // 서버에 /logout 엔드포인트가 없거나 CORS 문제 등으로 에러가 발생할 수 있습니다.
            // 클라이언트 측에서는 에러 발생 여부와 관계없이 로그아웃을 계속 진행합니다.
            console.error('서버 로그아웃 처리 중 오류 발생:', error);
        } finally {
            // 2. 서버 요청 결과와 상관없이 항상 클라이언트 측의 로그아웃을 수행합니다.
            localStorage.removeItem('accessToken');
            setIsLoggedIn(false);
            alert('로그아웃 되었습니다.');
            navigate('/');
        }
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
                            // 로그인 상태일 때
                            <>
                                <Link to="/calendar" style={linkStyle}>캘린더</Link>
                                <button onClick={handleLogout} style={btnStyle}>로그아웃</button>
                            </>
                        ) : (
                            // 로그아웃 상태일 때
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