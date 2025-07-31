import axios from 'axios';

// 1. Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: '/api', // API 기본 URL
    withCredentials: true,
});

// 2. 요청 인터셉터: 모든 API 요청에 토큰 자동 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. 응답 인터셉터: 토큰 만료 시 자동 재발급
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 또는 403 에러이고, 재시도한 요청이 아닐 때
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // ✨ 핵심 수정사항: withCredentials: true 추가 ✨
                // 이 옵션이 있어야 브라우저가 httpOnly 쿠키(리프레시 토큰)를 서버로 보냅니다.
                const res = await axios.post('/api/login/refresh', {}, {
                    withCredentials: true
                });

                if (res.status === 200) {
                    const newAccessToken = res.data.accessToken;
                    localStorage.setItem('accessToken', newAccessToken);

                    // 원래 요청의 헤더를 새 토큰으로 교체 후 재시도
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // 리프레시 토큰도 만료된 경우
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;