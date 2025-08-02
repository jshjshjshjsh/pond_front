import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance.js'; // axios 인스턴스 import

const UserProfile = () => {
    const [userData, setUserData] = useState({
        name: '',
        sabun: '',
        id: '',
        role: ''
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/member/info');
                setUserData(response.data);
            } catch (err) {
                console.error("사용자 정보 로딩 실패:", err);
                setError("사용자 정보를 불러오는 데 실패했습니다.");
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "newPassword") {
            setNewPassword(value);
        } else if (name === "confirmPassword") {
            setConfirmPassword(value);
        } else if (name === "role") {
            setUserData({ ...userData, role: value });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 업데이트할 데이터만 담을 객체
        const payload = {
            role: userData.role
        };

        // 새 비밀번호를 입력한 경우에만 payload에 추가
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                setError("새 비밀번호가 일치하지 않습니다.");
                return;
            }
            payload.pw = newPassword;
        }

        try {
            // PATCH /member/info API 호출
            await axiosInstance.patch('/member/info', payload);

            setSuccess('정보가 성공적으로 업데이트되었습니다.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("정보 업데이트 실패:", err);
            setError(err.response?.data?.message || "정보 업데이트에 실패했습니다.");
        }
    };

    return (
        <div>
            <h3>개인 설정</h3>

            <form onSubmit={handleUpdate}>
                <div className="form-group">
                    <label>이름</label>
                    <input type="text" value={userData.name} readOnly />
                </div>
                <div className="form-group">
                    <label>사번</label>
                    <input type="text" value={userData.sabun} readOnly />
                </div>
                <div className="form-group">
                    <label>아이디</label>
                    <input type="text" value={userData.id} readOnly />
                </div>
                <div className="form-group">
                    <label htmlFor="role-select">역할</label>
                    <select id="role-select" name="role" value={userData.role} onChange={handleInputChange}>
                        <option value="ROLE_NORMAL">일반 사용자</option>
                        <option value="ROLE_LEADER">리더</option>
                    </select>
                </div>

                <hr style={{ margin: '40px 0' }} />

                <h4>비밀번호 변경 (선택)</h4>
                <div className="form-group">
                    <label htmlFor="new-password">새 비밀번호</label>
                    <input
                        type="password"
                        id="new-password"
                        name="newPassword"
                        value={newPassword}
                        onChange={handleInputChange}
                        placeholder="변경을 원할 경우에만 입력하세요"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password">새 비밀번호 확인</label>
                    <input
                        type="password"
                        id="confirm-password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleInputChange}
                        placeholder="새 비밀번호를 다시 입력하세요"
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <button type="submit" className="submit-btn">변경사항 저장</button>
            </form>
        </div>
    );
};

export default UserProfile;