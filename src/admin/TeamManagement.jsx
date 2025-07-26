import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // 설정된 axios 인스턴스 사용

const TeamManagement = () => {
    const [teamName, setTeamName] = useState('');
    const [teams, setTeams] = useState([{ id: 1, teamName: '개발 1팀' }]); // 예시 데이터
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [members, setMembers] = useState(['']); // 멤버 사번 배열

    useEffect(() => {
        // TODO: 페이지 로드 시 전체 팀 목록을 불러오는 API 호출
        // const fetchTeams = async () => { ... };
        // fetchTeams();
    }, []);

    const handleAddMemberInput = () => {
        setMembers([...members, '']); // 새 입력 필드 추가
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
            // TeamController의 /leader/register API 호출
            await axiosInstance.post('/team/leader/register', { teamName });
            alert(`'${teamName}' 팀이 성공적으로 등록되었습니다.`);
            setTeamName('');
            // TODO: 팀 목록 다시 불러오기
        } catch (error) {
            console.error("팀 등록 실패:", error);
            alert(error.response?.data?.message || "팀 등록에 실패했습니다.");
        }
    };

    const handleAddMembersToTeam = async (e) => {
        e.preventDefault();
        const memberSabun = members.filter(sabun => sabun.trim() !== ''); // 비어있지 않은 사번만 필터링
        if (!selectedTeamId || memberSabun.length === 0) {
            alert("팀을 선택하고, 한 명 이상의 멤버 사번을 입력해주세요.");
            return;
        }

        try {
            // TeamController의 /leader/{teamId}/members API 호출
            await axiosInstance.post(`/team/leader/${selectedTeamId}/members`, { memberSabun });
            alert("팀에 멤버가 성공적으로 등록되었습니다.");
            setMembers(['']);
            // TODO: 해당 팀의 멤버 목록 다시 불러오기
        } catch (error) {
            console.error("멤버 등록 실패:", error);
            alert(error.response?.data?.message || "멤버 등록에 실패했습니다.");
        }
    };

    return (
        <div>
            <h3>팀 관리</h3>

            {/* 팀 등록 폼 */}
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

            {/* 팀에 멤버 등록 폼 */}
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
        </div>
    );
};

export default TeamManagement;