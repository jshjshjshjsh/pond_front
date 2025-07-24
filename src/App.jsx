import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import LoginPage from './user/LoginPage';
import RegisterPage from './user/RegisterPage';
import Header from './common/Header';
import Footer from './common/Footer'; // 1. Footer 컴포넌트 import

function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />

            <main style={{ flex: 1 }}>
                {/* 페이지 경로에 따라 다른 컴포넌트가 이 위치에 렌더링됩니다. */}
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </main>
            {/* 2. Routes 바깥에 Footer를 배치하여 모든 페이지에 공통으로 보이게 합니다. */}
            <Footer />
        </div>
    );
}

export default App;