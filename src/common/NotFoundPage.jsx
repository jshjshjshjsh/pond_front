import React from 'react';
import { Link } from 'react-router-dom';

// 스타일을 위한 객체 (CSS-in-JS 방식)
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 200px)', // 헤더와 푸터 높이를 제외한 대략적인 높이
        textAlign: 'center',
        fontFamily: "'Poppins', sans-serif",
    },
    errorImage: {
        width: '100%',
        maxWidth: '500px', // 이미지의 최대 너비를 조절합니다.
        marginBottom: '0px', // 이미지와 버튼 사이의 간격
    },
    homeLink: {
        textDecoration: 'none',
        backgroundColor: '#008080',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    }
};

const NotFoundPage = () => {
    return (
        <div style={styles.container}>
            <img
                src="/404.png"
                alt="Page Not Found"
                style={styles.errorImage}
            />
            <Link to="/" style={styles.homeLink}>
                메인으로 돌아가기
            </Link>
        </div>
    );
};

export default NotFoundPage;