import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsCalendar2Check } from "react-icons/bs";
import { HiOutlineUsers } from "react-icons/hi";
import { IoAnalyticsSharp } from "react-icons/io5";

// MainPage 컴포넌트
function MainPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 2. 컴포넌트가 렌더링될 때 로그인 상태를 확인하는 useEffect 추가
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    return (
        <>
            <style>
                {`
                    /* Google Fonts 'Poppins' & 'Noto Sans KR' 폰트 import */
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
                    
                    /* 색상 변수 정의 */
                    :root {
                        --main-color: #008080;      /* Deep Teal */
                        --secondary-color: #F5FFFA; /* Mint Cream */
                        --accent-color: #FFDAB9;    /* Soft Apricot */
                        --text-color: #36454F;      /* Charcoal */
                        --point-color: #778899;     /* Light Slate Gray */
                        --bg-color: #fdfdfd;
                    }
                    
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 0 24px;
                    }
                    
                    /* 헤더 */
                    .main-header {
                        padding: 20px 0;
                        background: var(--bg-color);
                        border-bottom: 1px solid #eee;
                    }
                    
                    .main-nav {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .logo {
                        display: flex;
                        align-items: center;
                        text-decoration: none;
                    }
                    
                    .logo img {
                        height: 40px;
                        width: auto;
                        margin-right: 12px;
                    }
                    
                    .logo-text {
                        font-size: 1.75rem;
                        font-weight: 700;
                        color: var(--text-color);
                    }
                    
                    .nav-links {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                    }
                    
                    .nav-links a {
                        text-decoration: none;
                        color: var(--point-color);
                        font-weight: 500;
                        padding: 8px 12px;
                        transition: color 0.3s;
                    }
                    
                    .nav-links a:hover {
                        color: var(--main-color);
                    }
                    
                    .nav-links .start-btn, .nav-links .signup-btn {
                        background-color: transparent;
                        color: var(--main-color);
                        border: 2px solid var(--main-color);
                        padding: 8px 24px;
                        border-radius: 8px;
                        font-weight: 700;
                        transition: all 0.3s;
                    }
                    
                    .nav-links .start-btn:hover, .nav-links .signup-btn:hover {
                        background-color: var(--main-color);
                        color: white;
                    }
                    
                    /* 메인 Hero 섹션 */
                    .hero-section {
                        background-color: var(--main-color);
                        padding: 100px 0;
                        position: relative;
                        overflow: hidden;
                        text-align: center;
                    }
                    
                    .hero-content {
                        position: relative;
                        z-index: 2;
                    }
                    
                    .hero-content h1 {
                        font-size: 3.5rem;
                        color: white;
                        font-weight: 700;
                        margin-bottom: 16px;
                    }
                    
                    .hero-content p {
                        font-size: 1.25rem;
                        color: rgba(255, 255, 255, 0.8);
                        margin-bottom: 32px;
                    }
                    
                    .hero-content .cta-button {
                        background-color: var(--accent-color);
                        color: var(--text-color);
                        padding: 16px 40px;
                        border: none;
                        border-radius: 12px;
                        font-size: 1.1rem;
                        font-weight: 700;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                        transition: all 0.3s;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    }
                    
                    .hero-content .cta-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                    }
                    
                    /* 기능 소개 섹션 */
                    .introduction-section {
                        padding: 100px 0;
                        text-align: center;
                    }
                    
                    .introduction-section h2 {
                        font-size: 2.5rem;
                        margin-bottom: 24px;
                    }
                    
                    .introduction-section .section-description {
                        font-size: 1.2rem;
                        color: var(--point-color);
                        max-width: 700px;
                        margin: 0 auto 60px auto;
                    }
                    
                    .features-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 32px;
                        text-align: center;
                    }
                    
                    .feature-item {
                        padding: 20px;
                    }
                    
                    .feature-item .icon {
                        font-size: 3em;
                        color: var(--main-color);
                        margin-bottom: 15px;
                    }
                    
                    .feature-item h3 {
                        font-size: 1.5rem;
                        margin-bottom: 12px;
                    }
                    
                    .feature-item p {
                        font-size: 1rem;
                        color: var(--point-color);
                        line-height: 1.7;
                    }
                    
                    /* 푸터 */
                    .main-footer {
                        margin-top: 100px;
                        padding: 40px 0;
                        background-color: #f8f9fa;
                        border-top: 1px solid #eee;
                        text-align: center;
                        color: var(--point-color);
                    }
                    
                    :root {
                        --main-color: #008080;
                        --secondary-color: #F5FFFA;
                        --accent-color: #FFDAB9;
                        --text-color: #36454F;
                        --point-color: #778899;
                        --bg-color: #fdfdfd;
                    }
                    
                    .feature-item .icon {
                        font-size: 3em;
                        color: var(--main-color);
                        margin-bottom: 15px;
                    }
                    
                    @keyframes shake {
                        0% { transform: rotate(0deg); }
                        25% { transform: rotate(5deg); }
                        50% { transform: rotate(0deg); }
                        75% { transform: rotate(-5deg); }
                        100% { transform: rotate(0deg); }
                    }
    
                    .feature-item .icon {
                        font-size: 3em;
                        color: var(--main-color);
                        margin-bottom: 15px;
                        transition: color 0.3s ease; /* 부드러운 색상 전환 */
                    }
    
                    .feature-item:hover .icon {
                        color: var(--accent-color); /* 호버 시 색상 변경 (시작하기 버튼과 유사) */
                        animation: shake 0.5s ease-in-out infinite; /* 흔들림 애니메이션 적용 */
                    }
                `}
            </style>

            <main>
                <section className="hero-section">
                    <div className="container">
                        <div className="hero-content">
                            <h1>업무 보고, 이제 달력에 기록하고 팀과 공유하세요.</h1>
                            <p>
                                Pond는 매월 수행한 업무를 캘린더에 간편하게 기록하고, 팀 단위로 쉽게 공유하여<br />업무 보고서 작성을 혁신하는 프로젝트입니다.
                            </p>
                            <Link to={isLoggedIn ? "/calendar" : "/register"} className="cta-button">
                                시작하기
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="introduction-section">
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2>당신의 프로젝트를 한눈에</h2>
                            <p className="section-description">
                                Pond는 팀의 생산성을 극대화하고, 투명한 업무 공유를 통해<br />프로젝트의 성공적인 완수를 돕습니다.
                            </p>
                        </div>
                        <div className="features-grid">
                            <div className="feature-item">
                                <div className="icon"><BsCalendar2Check/></div>
                                <h3>업무 캘린더</h3>
                                <p>모든 업무 내역과 프로젝트 일정을 직관적인 캘린더에 기록하고 관리하세요.</p>
                            </div>
                            <div className="feature-item">
                                <div className="icon"><HiOutlineUsers/></div>
                                <h3>손쉬운 팀 공유</h3>
                                <p>팀원들과 캘린더를 공유하고 협업하여 모두가 같은 목표를 향해 나아가세요.</p>
                            </div>
                            <div className="feature-item">
                                <div className="icon"><IoAnalyticsSharp/></div>
                                <h3>간편한 리포트</h3>
                                <p>클릭 한 번으로 기록된 업무 내역을 보고서 형식으로 만들어 시간을 절약하세요.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default MainPage;