import axios from 'axios';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // API 기본 URL
});

// 응답 인터셉터 (Response Interceptor) 추가
axiosInstance.interceptors.response.use(
    // 응답이 성공적인 경우
    (response) => {
        return response;
    },
    // 응답 에러가 발생한 경우
    (error) => {
        // 백엔드에서 403 Unauthorized 응답을 보냈는지 확인
        if (error.response && error.response.status === 403) {
            // JWT 만료 또는 인증 실패 시 처리
            console.error("Authentication Error: Token might be expired.");

            // 1. 로컬 스토리지에서 토큰 제거
            localStorage.removeItem('accessToken');

            // 2. 사용자에게 알림
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');

            // 3. 로그인 페이지로 리디렉션
            // window.location.href는 페이지를 새로고침하므로 React 상태가 초기화됩니다.
            window.location.href = '/';
        }

        // 다른 종류의 에러는 그대로 반환하여 개별 catch 블록에서 처리하도록 함
        return Promise.reject(error);
    }
);

export default axiosInstance;