import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './common/Header';
import Footer from './common/Footer';
import MainPage from './MainPage';
import LoginPage from './user/LoginPage';
import RegisterPage from './user/RegisterPage';
import CalendarPage from './calendar/CalendarPage';

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
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;