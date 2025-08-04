## 🐸 Pond: 업무 보고서 작성을 위한 캘린더 기반 협업 서비스 (Frontend)
Pond는 매월 수행한 업무를 캘린더에 간편하게 기록하고, 팀 단위로 쉽게 공유하여 월간 업무 보고서 작성을 혁신하는 웹 서비스의 프론트엔드입니다.

이 저장소는 React로 구현된 Pond의 사용자 인터페이스(UI) 코드를 관리합니다.

<br>

<img width="2538" height="2238" alt="localhost_5173_" src="https://github.com/user-attachments/assets/a0fa8315-f20c-40dd-9c40-90970f43076f" />

<img width="2538" height="3576" alt="localhost_calendar" src="https://github.com/user-attachments/assets/16949d29-e68d-453e-884f-5eae5c6cdc25" />

<br>

### ✨ 주요 기능
- **🖥️ 직관적인 메인 페이지:**

  - 서비스의 핵심 가치를 소개하고, 사용자가 쉽게 시작할 수 있도록 안내합니다.

  - 애니메이션 효과를 통해 사용자 경험을 향상시킵니다.

- **🔐 안전한 인증 시스템:**

  - 사용자는 아이디/비밀번호를 통해 로그인하고, 회원가입을 할 수 있습니다.

  - AccessToken 만료 시 RefreshToken을 사용하여 자동으로 토큰을 재발급받아 로그인 세션을 유지합니다.

- **📅 인터랙티브 캘린더:**

  - react-big-calendar를 활용하여 업무 내용을 시각적으로 관리합니다.

  - 드래그 앤 드롭 방식으로 날짜를 선택하고, 업무를 등록, 수정, 삭제하는 직관적인 UX를 제공합니다.

  - 팀 공유 여부를 토글 스위치로 쉽게 설정할 수 있습니다.

- **🤖 AI 업무 요약 및 관리:**

  - 사용자가 선택한 기간의 업무 기록들을 백엔드 AI API를 통해 요약합니다.

  - 생성된 월간 요약을 저장하고, 월별로 조회하며, 팀 공유 여부를 설정할 수 있습니다.

- **🛠️ 관리자 페이지:**

  - **개인 설정:** 사용자는 자신의 역할(Role)을 변경하거나, 새로운 비밀번호를 설정할 수 있습니다.

  - **팀 관리 (리더 권한):** LEADER 또는 ADMIN 역할을 가진 사용자는 팀을 생성하고, 사번을 통해 팀원을 추가하는 등 팀을 관리할 수 있는 전용 UI에 접근할 수 있습니다.

<br>

### 🛠️ 기술 스택
Pond 프론트엔드는 사용성과 개발 생산성을 높이는 라이브러리로 아래와 같이 구성되어 있습니다.

| 분야 |	기술 |
| ----------------| --------------------------------------------------|
| Core |	React 19, Vite |
| Routing |	React Router DOM |
| API Communication |	Axios (자동 토큰 재발급 인터셉터 포함) |
| State Management |	React Hooks (useState, useEffect, useCallback) |
| Calendar |	React Big Calendar with date-fns |
| Styling |	CSS-in-JS, CSS Modules |
| Icons |	React Icons |
| JWT | Utility	jwt-decode |
| CI/CD |	GitHub Actions (Docker Image Build & Push to GHCR) |
| Deployment |	Docker (Multi-stage build with Nginx), Kubernetes |

<br>

### 🚢 배포
이 프로젝트는 GitHub Actions를 통해 main 브랜치에 코드가 푸시될 때마다 자동으로 Docker 이미지를 빌드하여 **GHCR(GitHub Container Registry)에** 푸시하도록 구성되어 있습니다.

- **Multi-stage Dockerfile:** Dockerfile은 node 이미지에서 React 앱을 빌드한 후, 가벼운 nginx 이미지에 빌드 결과물만 복사하여 최종 이미지의 용량을 최소화하는 멀티 스테이지 빌드 전략을 사용합니다.

- **Nginx 설정:** nginx.conf 파일은 SPA(Single Page Application) 라우팅을 지원하도록 설정되어 있어, 어떤 경로로 접속하더라도 index.html을 먼저 로드하여 React Router가 올바르게 동작하도록 합니다.

- **Kubernetes 배포:** 최종적으로, 이 Docker 이미지는 pond_k8s_config 저장소에 정의된 Helm 차트를 통해 ArgoCD에 의해 Kubernetes 클러스터에 배포됩니다.
