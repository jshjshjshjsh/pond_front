import React, { useState, useEffect } from 'react';

const UserProfile = () => {
    const [userData, setUserData] = useState({
        name: '홍길동',
        sabun: '123456',
        id: 'testuser',
        role: 'ROLE_NORMAL'
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        // TODO: API가 준비되면, 여기서 사용자 정보를 불러옵니다.
        // const fetchUserData = async () => { ... };
        // fetchUserData();
    }, []);

    const handleRoleChange = (e) => {
        setUserData({ ...userData, role: e.target.value });
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }
        if (!newPassword) {
            alert("새 비밀번호를 입력해주세요.");
            return;
        }

        // TODO: API가 준비되면, 여기서 비밀번호 변경 요청을 보냅니다.
        // const updatePassword = async () => { ... };
        // updatePassword();
        alert(`비밀번호가 ${newPassword} (으)로 변경 요청되었습니다.`);
    };

    return (
        <div>
            <h3>개인 설정</h3>
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
                <label htmlFor="role-select">역할 (Role)</label>
                <select id="role-select" value={userData.role} onChange={handleRoleChange}>
                    <option value="ROLE_NORMAL">일반 사용자</option>
                    <option value="ROLE_LEADER">리더</option>
                    <option value="ROLE_ADMIN">관리자</option>
                </select>
                <p className="description">역할 변경은 관리자에게 문의하세요.</p>
            </div>

            <form onSubmit={handlePasswordChange}>
                <h3>비밀번호 변경</h3>
                <div className="form-group">
                    <label htmlFor="new-password">새 비밀번호</label>
                    <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="새 비밀번호를 입력하세요"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password">새 비밀번호 확인</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="새 비밀번호를 다시 입력하세요"
                    />
                </div>
                <button type="submit" className="submit-btn">비밀번호 변경</button>
            </form>
        </div>
    );
};

export default UserProfile;