# 학급 공지사항 웹사이트

Next.js(App Router) + Tailwind CSS로 만든 공지사항/질문 게시판입니다.

## 기능

- **메인 페이지 (`/`)**: 로그인 없이 누구나 접속 가능. 공지사항을 최신순으로 보여주고,
  하단 질문 폼(이름/학번/질문)을 제출하면 지정한 Google Apps Script 웹 앱으로 전달됩니다.
- **관리자 페이지 (`/admin`)**: 비밀번호 로그인 후 공지사항을 작성/수정/삭제할 수 있습니다.
  공지사항은 Neon(Postgres) 데이터베이스에 저장됩니다.

## 환경변수 설정

`.env.example`을 참고해 `.env.local` 파일을 만들고 값을 채워주세요. (이미 `.env.local`이
임의의 값으로 생성되어 있으니, 실제 배포 전에 값을 반드시 교체하세요.)

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | Neon(Postgres) 연결 문자열. Vercel에 Neon 스토리지를 연결하면 자동으로 채워집니다 |
| `ADMIN_PASSWORD` | 관리자 페이지 로그인 비밀번호 |
| `SESSION_SECRET` | 로그인 세션 쿠키 서명에 쓰이는 임의의 긴 문자열. `openssl rand -hex 32`로 생성 |
| `GOOGLE_APPS_SCRIPT_URL` | 학생 질문을 전달할 Google Apps Script 웹 앱 URL (`.../exec`로 끝나는 배포 URL) |

로컬에서 DB 기능(공지사항 목록/작성/수정/삭제)을 테스트하려면 `db/schema.sql`을 실행해
`announcements` 테이블을 먼저 만들어야 합니다.

질문 폼은 브라우저에서 직접 Google Apps Script로 요청하지 않고, 서버의 `/api/questions`
라우트를 거쳐 전달합니다. 이렇게 하면 Apps Script의 CORS 제약을 피하고 웹훅 URL이
클라이언트에 노출되지 않습니다.

## 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 메인 페이지를, [http://localhost:3000/admin](http://localhost:3000/admin) 에서 관리자 페이지를 확인할 수 있습니다.

## Vercel 배포

### 1. GitHub에 푸시

Vercel은 GitHub(또는 GitLab/Bitbucket) 저장소를 연결해 배포하는 방식을 기본으로 합니다.

```bash
git add -A
git commit -m "Initial commit"
gh repo create class-announcement-site --private --source=. --remote=origin --push
# 또는 GitHub에서 직접 저장소를 만들고
# git remote add origin <repo-url> && git push -u origin main
```

### 2. Vercel 프로젝트 생성 + Neon(Postgres) 연결

1. [vercel.com](https://vercel.com)에 로그인 → **Add New → Project** → 방금 만든 GitHub 저장소 선택 → **Import**
   (Framework는 Next.js로 자동 인식됩니다. 이 단계에서는 아직 Deploy를 누르지 않아도 됩니다.)
2. 프로젝트의 **Storage** 탭 → **Create Database** → **Postgres (Powered by Neon)** 선택 → 리전 선택 후 생성
3. 생성된 데이터베이스를 프로젝트에 **Connect**하면 `DATABASE_URL`(또는 `POSTGRES_URL`)이
   Production/Preview/Development 환경변수에 자동으로 추가됩니다
4. Neon 대시보드(또는 Vercel Storage 탭의 **Query** 화면)에서 `db/schema.sql`의 SQL을
   한 번 실행해 `announcements` 테이블을 생성합니다

### 3. 환경변수(ADMIN_PASSWORD 등) 설정

Vercel 대시보드에서: **프로젝트 → Settings → Environment Variables**로 이동해 아래 값을
각각 추가합니다. (`DATABASE_URL`은 2단계에서 이미 자동으로 채워져 있습니다.)

| Key | Value | Environment |
| --- | --- | --- |
| `ADMIN_PASSWORD` | 원하는 관리자 비밀번호 | Production (필요하면 Preview/Development도) |
| `SESSION_SECRET` | `openssl rand -hex 32`로 생성한 임의의 문자열 | Production |
| `GOOGLE_APPS_SCRIPT_URL` | Apps Script 웹 앱 `.../exec` URL | Production |

각 변수를 추가할 때 **Name**, **Value**를 입력하고 적용할 **Environment**
(Production / Preview / Development)를 체크한 뒤 **Save**를 누르면 됩니다. 값을 바꾼
뒤에는 기존 배포에 즉시 반영되지 않으므로, Deployments 탭에서 **Redeploy**를 한 번
실행해야 합니다.

Vercel CLI를 쓴다면 다음과 같이 추가할 수도 있습니다.

```bash
npm i -g vercel
vercel login
vercel link                 # 로컬 폴더를 Vercel 프로젝트와 연결
vercel env add ADMIN_PASSWORD production
vercel env add SESSION_SECRET production
vercel env add GOOGLE_APPS_SCRIPT_URL production
```

### 4. 배포

Import 시 **Deploy**를 눌렀다면 이미 첫 배포가 진행 중일 수 있습니다. 환경변수를 나중에
추가했다면 **Deployments → 최신 배포 → ⋯ → Redeploy**로 다시 배포하세요. 이후로는
`main` 브랜치에 푸시할 때마다 자동으로 재배포됩니다.

## 프로젝트 구조

```
app/
  page.tsx                 메인 페이지 (공지사항 목록 + 질문 폼)
  admin/login/page.tsx      관리자 로그인
  admin/page.tsx            관리자 대시보드 (인증 필요)
  api/announcements/        공지사항 CRUD API
  api/login, api/logout     관리자 로그인/로그아웃
  api/questions/            질문을 Google Apps Script로 전달하는 프록시
components/
  QuestionForm.tsx           질문 폼 (클라이언트 컴포넌트)
  AdminDashboard.tsx          관리자 CRUD UI (클라이언트 컴포넌트)
lib/
  data.ts                    Neon(Postgres) 기반 공지사항 저장소
  session.ts                 서명된 세션 쿠키 발급/검증
  format.ts                  날짜 포맷 유틸
proxy.ts                     /admin, /api/announcements 접근 제어 (Next.js 16 Proxy)
db/schema.sql                 announcements 테이블 스키마
```
