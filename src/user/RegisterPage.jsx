import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        sabun: '',
        id: '',
        pw: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.pw !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/member/register', {
                sabun: formData.sabun,
                id: formData.id,
                pw: formData.pw,
                name: formData.name,
                role: 'ROLE_NORMAL'
            });

            if (response.status === 200) {
                setSuccess('회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 이동합니다.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || '이미 사용 중인 아이디 또는 사번입니다.');
            } else {
                setError('회원가입 중 문제가 발생했습니다. 다시 시도해주세요.');
            }
        }
    };

    return (
        <>
            {/* 스타일 코드를 컴포넌트 내에 직접 포함 */}
            <style>
                {`
                    .register-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 60px 0;
                        min-height: 100vh;
                        background-color: #F5FFFA; /* Mint Cream */
                        font-family: 'Poppins', sans-serif;
                    }

                    .register-box {
                        background-color: white;
                        padding: 40px 50px;
                        border-radius: 16px;
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
                        width: 90%;
                        max-width: 420px;
                        text-align: center;
                    }

                    .register-box .logo-container {
                        margin-bottom: 30px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 15px;
                        text-decoration: none;
                    }

                    .register-box .logo-img {
                        width: 50px;
                    }

                    .register-box .logo-text {
                        font-size: 2rem;
                        font-weight: 700;
                        color: #36454F; /* Charcoal */
                    }

                    .register-form {
                        display: flex;
                        flex-direction: column;
                    }

                    .register-form .input {
                        background-color: #FFFFFF;
                        padding: 15px;
                        margin-bottom: 20px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-family: 'Poppins', sans-serif;
                    }

                    .register-form .register-button {
                        background-color: #008080; /* Deep Teal */
                        color: white;
                        padding: 15px;
                        border: none;
                        border-radius: 8px;
                        font-size: 1.1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background-color 0.3s ease;
                    }

                    .message {
                        margin-top: 15px;
                        text-align: center;
                        font-weight: 500;
                    }

                    .error-message {
                        color: #d9534f; /* Red for errors */
                    }

                    .success-message {
                        color: #008080; /* Deep Teal for success */
                    }
                `}
            </style>

            {/* JSX 렌더링 부분 */}
            <div className="register-container">
                <div className="register-box">
                    <Link to="/" className="logo-container">
                        <img src="/icon.png" alt="Pond 로고" className="logo-img" />
                        <span className="logo-text">Pond</span>
                    </Link>
                    <form onSubmit={handleRegister} className="register-form">
                        <input type="text" name="name" placeholder="이름" value={formData.name} onChange={handleChange} className="input" required />
                        <input type="text" name="sabun" placeholder="사번" value={formData.sabun} onChange={handleChange} className="input" required />
                        <input type="text" name="id" placeholder="아이디" value={formData.id} onChange={handleChange} className="input" required />
                        <input type="password" name="pw" placeholder="비밀번호" value={formData.pw} onChange={handleChange} className="input" required />
                        <input type="password" name="confirmPassword" placeholder="비밀번호 확인" value={formData.confirmPassword} onChange={handleChange} className="input" required />
                        <button type="submit" className="register-button">가입하기</button>
                    </form>
                    {error && <p className="message error-message">{error}</p>}
                    {success && <p className="message success-message">{success}</p>}
                </div>
            </div>
        </>
    );
};

export default RegisterPage;