# 📖 왁왁: (기억을 심는 오리)

## 프로젝트 소개

🦆 왁왁: 기억을 심는 오리
왁왁은 당신의 소중한 순간을 오리와 함께 기록하고 간직할 수 있는 감성적인 공간입니다.
추억을 새기고, 친구들과 공유하며, 나만의 이야기를 만들어보세요.

✨ 왁왁에서 할 수 있는 것

🌍 추억을 심다 – 의미 있는 장소에 타임캡슐을 묻고, 시간이 지나 친구들과 함께 다시 열어보세요.

💌 유리병 편지 – 익명의 사용자들과 생각을 나누고, 따뜻한 메시지를 주고받아 보세요.

📖 나만의 별자리 – 하루하루 기록하는 일기가 모여, 당신만의 아름다운 별자리가 완성됩니다.

🦆 왁왁이 꾸미기 – 나만의 개성 가득한 오리를 꾸며 더욱 특별한 친구로 만들어보세요!

지금 왁왁과 함께, 소중한 순간을 기록하고 새로운 추억을 만들어 보세요! 💛✨

## 팀원 구성


| **박태건** | **권은채** | **홍민지** | **조소현** | **박성재** | **홍해지** |
| ------- | ------- | ------- | ------- | ------- | ------- |
| FE, PM  | FE      | FE      | FE      | BE      | BE      |


## 1. 개발 환경

- Front : VS Code ,Node.js ,Android Studio ,React Native 
- Back-end : IntelliJ,JDK Gradle, MySQL
- Server : AWS EC2 Ubuntu 24.04.1 LTS
- 버전 및 이슈관리 : JIRA, Gitlab, Github, Github Issues, Github Project
- 협업 툴 : Discord, Notion,  MatterMost
- 서비스 배포 환경 : docker, Jenkins
- 디자인 : [Figma](https://www.figma.com/design/jO0XlUv3i9d9vRqo9rTDpE/%EC%99%81%EC%99%81---%EA%B0%AC%EC%84%B1%EC%9D%BC%EA%B8%B0?node-id=0-1&m=dev&t=0eVOx5Ddr6lCyQiR-1)
- [커밋,코드,JIRA 컨벤션](https://glimmer-burst-e2a.notion.site/17b2f521803d81caac3ffb715d49edb0)

## 2. 📦 프로젝트 구조

VS Code file-tree-generartor 사용
VS Code의 Extensions 프로그램이 존재합니다.

1. VS Code - Extenstions에서 "file-tree-generator" 검색 후 install
2. 원하는 폴더 우클릭 후 [Generate to Tree] 클릭!

## 3. 개발 기간 및 작업 관리

### 개발 기간

- 전체 개발 기간 : 2025-01-06 ~ 2025-02-20
- 주제 선정 : 2025-01-06 ~ 2025-01-15
- 명세서 작성 : 2025-01-15 ~ 2025-01-22
- 기능 구현 : 2025-01-22 ~ 2025-02-20

## 4. 🔒 환경 설정

### application.properties 파일에 다음 설정이 필요합니다:

spring.datasource.url=jdbc:mysql{BASE_URL}/wakwak?serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username={아이디}
spring.datasource.password={비밀번호}

### Kakao OAuth 인증

spring.security.oauth2.client.registration.kakao.client-id={KAKAO_CLIENT_ID}
spring.security.oauth2.client.registration.kakao.client-secret={KAKAO_CLIENT_SECRET}

### Naver OAuth 인증

spring.security.oauth2.client.registration.naver.client-id={NAVER_CLIENT_ID}
spring.security.oauth2.client.registration.naver.client-secret={NAVER_CLIENT_SECRET}

### AWS S3

cloud.aws.credentials.accessKey={AWS_ACCESS_KEY_ID}
cloud.aws.credentials.secretKey={AWS_SECRET_ACCESS_KEY}

## 5. 아키텍쳐 구조도

image-1.png

## 6. ERD

[https://www.erdcloud.com/d/cYYAMsn2JHKLJeR8r](https://www.erdcloud.com/d/cYYAMsn2JHKLJeR8r)
image.png

## 7.  API 명세서

기능 명세서 : [https://www.notion.so/c851e3c3269c467c834a577c061701d1?v=980afe2921834d61bdb67ff80b80ed77](https://www.notion.so/c851e3c3269c467c834a577c061701d1?v=980afe2921834d61bdb67ff80b80ed77)

API 명세서 : [https://glimmer-burst-e2a.notion.site/API-02a72a458df24092a41de5520dfd0c72](https://glimmer-burst-e2a.notion.site/API-02a72a458df24092a41de5520dfd0c72)