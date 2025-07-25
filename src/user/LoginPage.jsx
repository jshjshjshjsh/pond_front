import React, { useState } from 'react';
import axios from 'axios';

// 스타일을 위한 객체 (CSS-in-JS 방식)
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F5FFFA', // Mint Cream
        fontFamily: "'Poppins', sans-serif",
    },
    loginBox: {
        backgroundColor: 'white',
        padding: '40px 50px',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    logoContainer: {
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
    },
    logoImg: {
        width: '50px',
    },
    logoText: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#36454F', // Charcoal
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        background: '#FFFFFF',
        color: '#36454F',
        padding: '15px',
        marginBottom: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        fontFamily: "'Poppins', sans-serif",
    },
    button: {
        backgroundColor: '#008080', // Deep Teal
        color: 'white',
        padding: '15px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    errorMessage: {
        color: '#d9534f',
        marginTop: '15px',
        textAlign: 'center',
    }
};

const LoginPage = () => {
    // 입력 값(ID, 비밀번호) 상태 관리
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // 로그인 폼 제출 시 실행될 함수
    const handleLogin = async (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작 방지
        setError(''); // 이전 에러 메시지 초기화

        try {
            // API 요청: pond_back의 /login 엔드포인트에 POST 요청
            const response = await axios.post('http://localhost:8080/login', {
                id: id,
                pw: password // AuthenticationRequest.java의 필드명과 일치시켜야 함
            });

            // 요청 성공 시
            if (response.status === 200 && response.data.accessToken) {
                // 1. AccessToken을 LocalStorage에 저장
                localStorage.setItem('accessToken', response.data.accessToken);

                // 2. 로그인 성공 후 메인 페이지 또는 대시보드로 이동
                alert('로그인 성공!');
                // todo: 로그인 성공 후 캘린더쪽으로 url 수정
                window.location.href = '/calendar';
            }
        } catch (err) {
            // 요청 실패 시
            if (err.response) {
                // 서버에서 보낸 에러 메시지가 있을 경우
                setError('아이디 또는 비밀번호가 올바르지 않습니다.');
            } else {
                // 네트워크 에러 등
                setError('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <a href="/" >
                    <div style={styles.logoContainer}>
                        <img src="/icon.png" alt="Pond 로고" style={styles.logoImg} />
                        <span style={styles.logoText}>Pond</span>
                    </div>
                </a>
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.button}>
                        로그인
                    </button>
                </form>
                {error && <p style={styles.errorMessage}>{error}</p>}
            </div>
        </div>
    );
};

export default LoginPage;