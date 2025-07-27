import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const TeamManagement = () => {
    const [teamName, setTeamName] = useState('');
    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [members, setMembers] = useState(['']);
    const [teamMembers, setTeamMembers] = useState([]);

    // --- [추가] 역할을 한글로 변환하는 객체 ---
    const roleMap = {
        'ROLE_ADMIN': '관리자',
        'ROLE_LEADER': '리더',
        'ROLE_NORMAL': '일반 사용자'
    };
    // --- ---

    const fetchTeams = async () => {
        try {
            const response = await axiosInstance.get('/team/leader/teams');
            setTeams(response.data);
        } catch (error) {
            console.error("팀 목록 로딩 실패:", error);
            alert("팀 목록을 불러오는 데 실패했습니다.");
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const response = await axiosInstance.get('/team/my-teams/members');
            setTeamMembers(response.data);
        } catch (error) {
            console.error("팀원 목록 로딩 실패:", error);
            alert("팀원 목록을 불러오는 데 실패했습니다.");
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchTeamMembers();
    }, []);

    const handleAddMemberInput = () => {
        setMembers([...members, '']);
    };

    const handleRemoveMemberInput = (index) => {
        const newMembers = members.filter((_, i) => i !== index);
        setMembers(newMembers);
    };

    const handleMemberChange = (index, value) => {
        const newMembers = [...members];
        newMembers[index] = value;
        setMembers(newMembers);
    };

    const handleTeamRegister = async (e) => {
        e.preventDefault();
        try {
            // 현재 로그인된 사용자의 정보를 함께 보내야 합니다.
            // Member 정보는 토큰에서 추출하거나 별도의 API로 가져와야 합니다.
            // 여기서는 임시로 Member 객체를 생성하여 전달합니다.
            // 실제 구현에서는 현재 로그인한 사용자 정보를 동적으로 가져와야 합니다.
            const currentUser = { sabun: 'current_user_sabun' }; // 예시
            await axiosInstance.post('/team/leader/register', { teamName, member: currentUser });
            alert(`'${teamName}' 팀이 성공적으로 등록되었습니다.`);
            setTeamName('');
            fetchTeams();
        } catch (error) {
            console.error("팀 등록 실패:", error);
            alert(error.response?.data?.message || "팀 등록에 실패했습니다.");
        }
    };

    const handleAddMembersToTeam = async (e) => {
        e.preventDefault();
        const memberSabun = members.filter(sabun => sabun.trim() !== '');
        if (!selectedTeamId || memberSabun.length === 0) {
            alert("팀을 선택하고, 한 명 이상의 멤버 사번을 입력해주세요.");
            return;
        }

        try {
            await axiosInstance.post(`/team/leader/${selectedTeamId}/members`, { memberSabun });
            alert("팀에 멤버가 성공적으로 등록되었습니다.");
            setMembers(['']);
            fetchTeamMembers();
        } catch (error) {
            console.error("멤버 등록 실패:", error);
            alert(error.response?.data?.message || "멤버 등록에 실패했습니다.");
        }
    };

    return (
        <div>
            <h3>팀 관리</h3>

            <form onSubmit={handleTeamRegister}>
                <h4>새 팀 등록</h4>
                <div className="form-group">
                    <label htmlFor="team-name">팀 이름</label>
                    <input
                        type="text"
                        id="team-name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="새 팀의 이름을 입력하세요"
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">팀 등록</button>
            </form>

            <hr style={{ margin: '40px 0' }} />

            <form onSubmit={handleAddMembersToTeam}>
                <h4>팀에 멤버 등록</h4>
                <div className="form-group">
                    <label htmlFor="team-select">대상 팀</label>
                    <select
                        id="team-select"
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        required
                    >
                        <option value="">팀을 선택하세요</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.teamName}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>등록할 멤버 사번</label>
                    {members.map((member, index) => (
                        <div key={index} className="team-member-input-group">
                            <input
                                type="text"
                                value={member}
                                onChange={(e) => handleMemberChange(index, e.target.value)}
                                placeholder="멤버의 사번을 입력하세요"
                            />
                            {members.length > 1 && (
                                <button type="button" className="remove-btn" onClick={() => handleRemoveMemberInput(index)}>
                                    -
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" style={{ marginTop: '10px' }} onClick={handleAddMemberInput}>
                        +
                    </button>
                </div>
                <button type="submit" className="submit-btn">멤버 등록</button>
            </form>

            <div className="team-members-container">
                <hr style={{ margin: '40px 0' }} />
                <h4>소속된 팀원 목록</h4>
                <table className="team-members-table">
                    <thead>
                    <tr>
                        <th>이름</th>
                        <th>사번</th>
                        <th>소속 팀</th>
                        <th>역할</th>
                    </tr>
                    </thead>
                    <tbody>
                    {teamMembers.length > 0 ? (
                        teamMembers.map(member => (
                            <tr key={member.sabun}>
                                <td>{member.name}</td>
                                <td>{member.sabun}</td>
                                <td>
                                    {/* 멤버가 속한 팀들의 이름을 콤마로 구분하여 표시 */}
                                    {member.teams.map(team => team.teamName).join(', ')}
                                </td>
                                <td>
                                    {/* roleMap을 사용하여 역할을 한글로 변환 */}
                                    {roleMap[member.role] || member.role}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>소속된 팀원이 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamManagement;