import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './AdminPage.css';
import { jwtDecode } from 'jwt-decode'; // JWT 토큰을 디코딩하기 위한 라이브러리

const AdminPage = () => {
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Spring Security의 기본 권한 접두사 "ROLE_"을 제거하고 저장
                console.log(decoded.auth)
                const role = decoded.auth.replace('ROLE_', '');
                setUserRole(role);
            } catch (error) {
                console.error("토큰 디코딩 실패:", error);
                // 에러 처리, 예: 로그아웃
            }
        }
    }, []);

    // 현재 경로가 '/admin'일 때 기본으로 보여줄 탭을 결정
    const isRootAdminPath = location.pathname === '/admin';

    return (
        <div className="admin-page-container">
            <aside className="admin-sidebar">
                <h2>관리</h2>
                <ul>
                    <li>
                        <NavLink
                            to="/admin/settings"
                            className={({ isActive }) => (isActive || isRootAdminPath ? 'active' : '')}
                        >
                            개인 설정
                        </NavLink>
                    </li>
                    {/* 사용자가 'LEADER' 또는 'ADMIN' 역할일 때만 팀 관리 탭을 보여줌 */}
                    {(userRole === 'LEADER' || userRole === 'ADMIN') && (
                        <li>
                            <NavLink to="/admin/team">팀 관리</NavLink>
                        </li>
                    )}
                </ul>
            </aside>
            <main className="admin-content">
                <Outlet /> {/* 자식 라우트(개인 설정, 팀 관리)가 이 위치에 렌더링됩니다. */}
            </main>
        </div>
    );
};

export default AdminPage;