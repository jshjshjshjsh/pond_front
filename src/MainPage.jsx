import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsCalendar2Check } from "react-icons/bs";
import { HiOutlineUsers } from "react-icons/hi";
import { IoAnalyticsSharp } from "react-icons/io5";
import './MainPage.css';

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

            <main>
                <section className="hero-section">
                  <div className="floating-icon icon-1">📅</div>
                  <div className="floating-icon icon-2">👥</div>
                  <div className="floating-icon icon-3">📊</div>
                  <div className="floating-icon icon-4">✅</div>

                  <div className="container">
                    <div className="hero-content">
                      <h1>업무 보고, 이제 달력에 기록하고 팀과 공유하세요.</h1>
                      <p>
                        Pond는 매월 수행한 업무를 캘린더에 간편하게 기록하고, 팀 단위로 쉽게 공유하여<br />업무 보고서 작성의 노고를 줄여줍니다.
                      </p>
                        <Link to={isLoggedIn ? "/calendar" : "/register"} className="cta-button animated button">
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