import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './common/Header.jsx';
import Footer from './common/Footer.jsx';
import MainPage from './MainPage.jsx';
import LoginPage from './user/LoginPage.jsx';
import RegisterPage from './user/RegisterPage.jsx';
import CalendarPage from './calendar/CalendarPage.jsx';
import AdminPage from './admin/AdminPage.jsx';
import UserProfile from './admin/UserProfile.jsx';
import TeamManagement from './admin/TeamManagement.jsx';
import NotFoundPage from './common/NotFoundPage.jsx';

function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />

            <main>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/admin" element={<AdminPage />}>
                        {/* 기본 경로(/admin) 접속 시 개인 설정 탭으로 자동 이동 */}
                        <Route index element={<Navigate to="settings" replace />} />
                        <Route path="settings" element={<UserProfile />} />
                        <Route path="team" element={<TeamManagement />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;