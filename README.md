# NursiHub — 지역사회간호학 실습 포털

Next.js(App Router, Turbopack) + Tailwind CSS로 만든 간호대학 지역사회간호학
임상실습 포털입니다. 공지사항 게시판에서 시작해, 퀴즈·AI 사례·AI 튜터·핵심술기
영상·실습 자료·커뮤니티 게시판·관리자 대시보드를 갖춘 종합 실습 사이트로
확장되었습니다.

## 기능

### 학생용 (사이트 공용 비밀번호로 입장)

| 경로 | 기능 |
| --- | --- |
| `/` | 대시보드 — 공지사항, 바로가기 카드, 실습 체크리스트 |
| `/cases` | AI 사례 — 고혈압·당뇨 등 방문간호 사례를 보고 AI 튜터와 상담 |
| `/ai-tutor` | 보건교육 튜터 — OMAHA 진단 분류, 방문간호 상담 연습 (Gemini API) |
| `/quiz`, `/quiz/history` | 지역사회 실습 퀴즈 — 학번 입력 후 응시, 본인 응시 이력 조회 |
| `/skills` | 핵심술기 동영상 — YouTube/Vimeo 임베드 + 상세 프로토콜 체크리스트 |
| `/tools` | BPRN 계산기·사정도구 |
| `/resources` | OMAHA 영역 안내 + 실습 서식(파일 첨부 가능) |
| `/community` | 실습 후기·Q&A 게시판 + 담당 교수님께 질문(Google Sheet로 전달) |

### 관리자용 (`/admin`, 별도 관리자 비밀번호)

공지사항 · 대시보드(환영 문구/체크리스트) · 퀴즈 문제 · 방문간호 사례 ·
핵심술기 영상 · 자료실(파일 업로드) · 커뮤니티 게시글 모더레이션 ·
교수님께 온 질문 확인 · AI 튜터 로그 · 이용 통계를 관리합니다. 퀴즈 응시
현황은 문항별 오답률과 함께 xlsx로 내보낼 수 있습니다.

## 보안

- **비밀번호**: 관리자/사이트 공용 비밀번호는 평문이 아니라 **bcrypt 해시**로
  저장하고 비교합니다 (`lib/password.ts`).
- **세션**: HMAC 서명된 쿠키(`lib/session.ts`), 관리자 8시간 / 학생 30일 TTL.
- **Rate limiting**: 로그인 5회/5분, 질문·AI 튜터·커뮤니티 글쓰기 5~10회/분로
  IP당 제한 (`lib/rateLimit.ts`, `proxy.ts`). 서버리스 인스턴스별 메모리
  기반이라 완벽한 전역 카운팅은 아니지만 무차별 대입/스팸 방어로는 충분합니다.
- **웹훅 검증**: 교수님께 질문 웹훅은 `WEBHOOK_SECRET`을 본문에 실어 보내고,
  Apps Script 쪽에서 검증하도록 구성해야 위조 요청을 막을 수 있습니다.
- **업로드 검증**: `/api/upload`는 확장자·MIME 화이트리스트(문서·엑셀·PPT·이미지)와
  20MB 크기 제한, 파일명 sanitize를 적용합니다 (`app/api/upload/route.ts`).
- **보안 헤더**: CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`를 전 라우트에 적용합니다
  (`next.config.ts`).

## 환경변수 설정

`.env.example`을 참고해 `.env.local` 파일을 만들고 값을 채워주세요.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | Neon(Postgres) 연결 문자열. Vercel에 Neon 스토리지를 연결하면 자동으로 채워집니다 |
| `ADMIN_PASSWORD_HASH` | 관리자 페이지 로그인 비밀번호의 **bcrypt 해시** (평문 저장 금지). `npm run hash-password -- '비밀번호'`로 생성 |
| `SITE_PASSWORD_HASH` | 학생들이 사이트(관리자 페이지 제외)에 입장할 때 쓰는 공용 비밀번호의 **bcrypt 해시**. 위와 동일한 방법으로 생성 |
| `SESSION_SECRET` | 로그인 세션 쿠키 서명에 쓰이는 임의의 긴 문자열. `openssl rand -hex 32`로 생성 |
| `GOOGLE_APPS_SCRIPT_URL` | 학생 질문을 전달할 Google Apps Script 웹 앱 URL (`.../exec`로 끝나는 배포 URL) |
| `WEBHOOK_SECRET` | 위 웹훅 요청 본문에 함께 실어 보내는 공유 비밀값. Apps Script 쪽에서 이 값을 검증하도록 구성해야 위조 요청을 막을 수 있습니다. `openssl rand -hex 24`로 생성 |
| `GEMINI_API_KEY` | AI 사례 & 보건교육 튜터(`/ai-tutor`)에서 사용하는 Gemini API 키. [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)에서 발급 |
| `GEMINI_MODEL` | (선택) 사용할 Gemini 모델. 기본값 `gemini-3.6-flash` |
| `BLOB_READ_WRITE_TOKEN` | 자료실 파일 업로드(Vercel Blob)용 토큰. Vercel 프로젝트에 Blob 스토어를 연결하면 자동으로 채워집니다 |

**bcrypt 해시를 `.env` 파일에 넣을 때 주의**: 해시는 `$2b$10$...`처럼 `$`로 시작하는데,
Next.js가 `.env` 파일의 `$VAR`를 환경변수 참조로 치환해버려 해시가 깨집니다.
`npm run hash-password -- '비밀번호'`를 실행하면 그대로 붙여넣을 수 있도록 `\$`로
이스케이프된 값도 함께 출력해주니 그 값을 사용하세요. Vercel 대시보드에 입력할 때는
이스케이프 없이 원본 해시(`$2b$10$...`)를 그대로 넣으면 됩니다.

로컬에서 DB 기능을 테스트하려면 `db/schema.sql`을 실행해 테이블(공지사항, 퀴즈,
커뮤니티, 자료실 설정, 방문간호 사례, AI 튜터 로그, 교수님께 질문, 페이지뷰 등)을
먼저 만들어야 합니다.

질문 폼은 브라우저에서 직접 Google Apps Script로 요청하지 않고, 서버의 `/api/questions`
라우트를 거쳐 전달합니다. 이렇게 하면 Apps Script의 CORS 제약을 피하고 웹훅 URL이
클라이언트에 노출되지 않습니다. 서버는 요청 본문에 `secret` 필드로 `WEBHOOK_SECRET` 값을
함께 보내므로, Apps Script의 `doPost(e)`에서 다음과 같이 검증을 추가하세요.

```js
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (data.secret !== expected) {
    return ContentService.createTextOutput('Forbidden').setMimeType(ContentService.MimeType.TEXT);
  }
  // ...기존 처리 로직
}
```

## 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 학생용 포털을,
[http://localhost:3000/admin](http://localhost:3000/admin) 에서 관리자 페이지를
확인할 수 있습니다. 입장하려면 먼저 `/site-login`(학생) 또는
`/admin/login`(관리자)에서 비밀번호를 입력해야 합니다.

## Vercel 배포

### 1. GitHub에 푸시

Vercel은 GitHub(또는 GitLab/Bitbucket) 저장소를 연결해 배포하는 방식을 기본으로 합니다.

```bash
git add -A
git commit -m "Initial commit"
gh repo create nursihub --private --source=. --remote=origin --push
# 또는 GitHub에서 직접 저장소를 만들고
# git remote add origin <repo-url> && git push -u origin main
```

### 2. Vercel 프로젝트 생성 + Neon(Postgres) / Blob 연결

1. [vercel.com](https://vercel.com)에 로그인 → **Add New → Project** → 방금 만든 GitHub 저장소 선택 → **Import**
   (Framework는 Next.js로 자동 인식됩니다. 이 단계에서는 아직 Deploy를 누르지 않아도 됩니다.)
2. 프로젝트의 **Storage** 탭 → **Create Database** → **Postgres (Powered by Neon)** 선택 → 리전 선택 후 생성
3. 같은 **Storage** 탭에서 **Create Database** → **Blob** 선택 → 생성 (자료실 파일 업로드용)
4. 두 스토리지를 프로젝트에 **Connect**하면 `DATABASE_URL`(또는 `POSTGRES_URL`)과
   `BLOB_READ_WRITE_TOKEN`이 Production/Preview/Development 환경변수에 자동으로 추가됩니다
5. Neon 대시보드(또는 Vercel Storage 탭의 **Query** 화면)에서 `db/schema.sql`의 SQL을
   한 번 실행해 테이블을 생성합니다

### 3. 환경변수 설정

Vercel 대시보드에서: **프로젝트 → Settings → Environment Variables**로 이동해 아래 값을
각각 추가합니다. (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`은 2단계에서 이미 자동으로 채워져 있습니다.)

| Key | Value | Environment |
| --- | --- | --- |
| `ADMIN_PASSWORD_HASH` | `npm run hash-password -- '비밀번호'`로 생성한 해시 (이스케이프 없이 `$2b$10$...` 그대로) | Production (필요하면 Preview/Development도) |
| `SITE_PASSWORD_HASH` | 위와 동일한 방법으로 생성한 공용 비밀번호 해시 | Production |
| `SESSION_SECRET` | `openssl rand -hex 32`로 생성한 임의의 문자열 | Production |
| `GOOGLE_APPS_SCRIPT_URL` | Apps Script 웹 앱 `.../exec` URL | Production |
| `WEBHOOK_SECRET` | `openssl rand -hex 24`로 생성한 임의의 문자열 (Apps Script 쪽 검증용으로도 동일하게 설정) | Production |
| `GEMINI_API_KEY` | Gemini API 키 | Production |
| `GEMINI_MODEL` | (선택) 사용할 Gemini 모델 | Production |

각 변수를 추가할 때 **Name**, **Value**를 입력하고 적용할 **Environment**
(Production / Preview / Development)를 체크한 뒤 **Save**를 누르면 됩니다. 값을 바꾼
뒤에는 기존 배포에 즉시 반영되지 않으므로, Deployments 탭에서 **Redeploy**를 한 번
실행해야 합니다.

Vercel CLI를 쓴다면 다음과 같이 추가할 수도 있습니다.

```bash
npm i -g vercel
vercel login
vercel link                 # 로컬 폴더를 Vercel 프로젝트와 연결
vercel env add ADMIN_PASSWORD_HASH production
vercel env add SITE_PASSWORD_HASH production
vercel env add SESSION_SECRET production
vercel env add GOOGLE_APPS_SCRIPT_URL production
vercel env add WEBHOOK_SECRET production
vercel env add GEMINI_API_KEY production
```

### 4. 배포

Import 시 **Deploy**를 눌렀다면 이미 첫 배포가 진행 중일 수 있습니다. 환경변수를 나중에
추가했다면 **Deployments → 최신 배포 → ⋯ → Redeploy**로 다시 배포하세요. 이후로는
`main` 브랜치에 푸시할 때마다 자동으로 재배포됩니다.

## 프로젝트 구조

```
app/
  (portal)/                  학생·관리자 공용 레이아웃(PortalShell)을 쓰는 라우트 그룹
    page.tsx                 대시보드
    cases/, ai-tutor/        AI 사례, 보건교육 튜터
    quiz/, quiz/history/     퀴즈, 응시 이력
    skills/, tools/, resources/, community/
    admin/                   관리자 제어 센터 + 섹션별 하위 페이지
  admin/login/page.tsx        관리자 로그인
  site-login/page.tsx         학생용 사이트 입장
  api/                        각 기능별 REST API 라우트 (announcements, quiz, skills,
                               cases, community, professor-questions, ai-tutor,
                               ai-tutor-logs, settings, upload, track, questions,
                               login, site-login, logout 등)
components/
  admin/                      관리자 CRUD/모더레이션 UI
  portal/                     공용 셸(PortalShell), 방문 로그 트래커
  quiz/, skills/, cases/, community/, ai-tutor/, tools/, resources/, dashboard/
lib/
  data.ts, quiz.ts, community.ts, cases.ts, skills.ts, ...   DB 액세스 함수
  session.ts                  서명된 세션 쿠키 발급/검증
  password.ts                 bcrypt 해시 생성/검증
  rateLimit.ts                IP별 rate limit
  studentId.ts, visitorId.ts  학번/방문자 식별자 유틸
proxy.ts                      로그인 게이트, 관리자 권한, rate limit 적용 (Next.js 16 Proxy)
next.config.ts                보안 헤더(CSP 등) 설정
db/schema.sql                 전체 테이블 스키마
scripts/hash-password.mjs     bcrypt 해시 생성 CLI
```
