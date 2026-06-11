package com.social.login.service.implement;

import com.social.global.service.AwsS3Service;
import com.social.login.dto.request.*;
import com.social.starsky.service.StarSkyService;
import com.social.login.common.CertificationNumber;
import com.social.login.dto.response.ResponseDto;
import com.social.login.dto.response.auth.*;
import com.social.login.entity.CertificationEntity;
import com.social.login.entity.User;
import com.social.login.provider.EmailProvider;
import com.social.login.provider.JWTProvider;
import com.social.login.repository.CertificationRepository;
import com.social.login.repository.UserRepository;
import com.social.login.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImplement implements AuthService {

    private final UserRepository userRepository;
    private final CertificationRepository certificationRepository;
    private final JWTProvider jwtProvider;
    private final EmailProvider emailProvider;
    private final StarSkyService starSkyService;
    private final AwsS3Service awsS3Service;
    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private static final Pattern NICKNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9가-힣]{2,20}$");
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList("image/jpeg", "image/png", "image/gif");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB


    @Override
    public ResponseEntity<? super CheckIdResponseDto> idCheck(CheckIdRequestDto dto) {
        log.info("🔹 [AuthService] 아이디 중복 체크 요청 - ID: {}", dto.getId());

        try {
            String username = dto.getId();
            boolean isExistId = userRepository.existsByUsername(username);
            if (isExistId) {
                log.warn("❌ [AuthService] 중복된 ID 존재 - ID: {}", username);
                return CheckIdResponseDto.duplicateId();
            }
        } catch (Exception exception) {
            log.error("❌ [AuthService] DB 오류 발생: {}", exception.getMessage(), exception);
            return ResponseDto.databaseError();
        }

        log.info("✅ [AuthService] 사용 가능한 ID - {}", dto.getId());
        return CheckIdResponseDto.success();
    }


    @Override
    public ResponseEntity<? super CheckNicknameResponseDto> nicknameCheck(CheckNicknameRequestDto dto) {
        log.info("🔹 [AuthService] 아이디 중복 체크 요청 - ID: {}", dto.getNickname());

        try {
            String username = dto.getNickname();
            boolean isExistNickname = userRepository.existsByNickname(username);
            if (isExistNickname) {
                log.warn("❌ [AuthService] 중복된 Nickname 존재 - ID: {}", username);
                return CheckNicknameResponseDto.duplicateNickname();
            }
        } catch (Exception exception) {
            log.error("❌ [AuthService] DB 오류 발생: {}", exception.getMessage(), exception);
            return ResponseDto.databaseError();
        }

        log.info("✅ [AuthService] 사용 가능한 Nickname - {}", dto.getNickname());
        return CheckNicknameResponseDto.success();
    }

    @Override
    public ResponseEntity<? super SendVerificationCodeResponseDto> emailCertification(SendVerificationCodeRequestDto dto) {
        log.info("🔹 [AuthService] 이메일 인증 요청 - ID: {}, Email: {}", dto.getId(), dto.getEmail());

        try {
            String username = dto.getId();
            String email = dto.getEmail();
            boolean isExistId = userRepository.existsByUsername(username);
            if (isExistId) {
                log.warn("❌ [AuthService] 중복된 ID 존재 - ID: {}", username);
                return SendVerificationCodeResponseDto.duplicateId();
            }

            String certificationNumber = CertificationNumber.getCertificationNumber();
            boolean isSuccessed = emailProvider.sendCertificationMail(email, certificationNumber);
            if (!isSuccessed) {
                log.warn("❌ [AuthService] 이메일 전송 실패 - Email: {}", email);
                return SendVerificationCodeResponseDto.mailSendFail();
            }

            CertificationEntity certificationEntity = new CertificationEntity(username, email, certificationNumber);
            certificationRepository.save(certificationEntity);

            log.info("✅ [AuthService] 인증 코드 저장 완료 - ID: {}, Email: {}", username, email);
        } catch (Exception exception) {
            log.error("❌ [AuthService] DB 오류 발생: {}", exception.getMessage(), exception);
            return ResponseDto.databaseError();
        }

        return SendVerificationCodeResponseDto.success();
    }

    @Override
    public ResponseEntity<? super VerifyEmailCodeResponseDto> checkCertification(VerifyEmailCodeRequestDto dto) {
        log.info("🔹 [AuthService] 이메일 인증 코드 확인 - ID: {}, Email: {}", dto.getId(), dto.getEmail());

        try {
            String userId = dto.getId();
            String email = dto.getEmail();
            String certificationNumber = dto.getCertificationNumber();

            CertificationEntity certificationEntity = certificationRepository.findByUsername(userId);
            if (certificationEntity == null) {
                log.warn("❌ [AuthService] 인증 정보 없음 - ID: {}", userId);
                return VerifyEmailCodeResponseDto.certificationFail();
            }

            boolean isMatched = certificationEntity.getEmail().equals(email) &&
                    certificationEntity.getCertificationNumber().equals(certificationNumber);

            if (!isMatched) {
                log.warn("❌ [AuthService] 인증 코드 불일치 - ID: {}", userId);
                return VerifyEmailCodeResponseDto.certificationFail();
            }

            log.info("✅ [AuthService] 인증 코드 일치 - ID: {}", userId);
        } catch (Exception exception) {
            log.error("❌ [AuthService] DB 오류 발생: {}", exception.getMessage(), exception);
            return ResponseDto.databaseError();
        }

        return VerifyEmailCodeResponseDto.success();
    }

    @Override
    public ResponseEntity<? super SignUpResponseDto> signUp(SignUpRequestDto dto) {
        log.info("🔹 [AuthService] 회원가입 요청 - ID: {}, Email: {}", dto.getId(), dto.getEmail());

        try {
            String username = dto.getId();
            boolean isExistId = userRepository.existsByUsername(username);
            if (isExistId) {
                log.warn("❌ [AuthService] 중복된 ID 존재 - ID: {}", username);
                return SignUpResponseDto.duplicateId();
            }

            String email = dto.getEmail();
            String certificationNumber = dto.getCertificationNumber();
            CertificationEntity certificationEntity = certificationRepository.findByUsername(username);

            if (certificationEntity == null || !certificationEntity.getEmail().equals(email) ||
                    !certificationEntity.getCertificationNumber().equals(certificationNumber)) {
                log.warn("❌ [AuthService] 이메일 인증 실패 - ID: {}", username);
                return SignUpResponseDto.certificationFail();
            }

            String encodedPassword = passwordEncoder.encode(dto.getPassword());
            dto.setPassword(encodedPassword);
            User user = new User(dto);
            userRepository.save(user);
            certificationRepository.deleteByUsername(username);

            log.info("✅ [AuthService] 회원가입 성공 - ID: {}", username);
            User users=userRepository.findByUsername(username);

            int userId=users.getUserId();
            log.info("✅ [OAuth2UserService] userId 추출 - ID: {}", userId);

            Integer minStarskyId = starSkyService.getMinStarskyIdByUserId(userId);
            log.info("✅ [OAuth2UserService] 가장 빠른 별하늘ID 추출 - ID: {}", minStarskyId);

            updateUserConstellation(userId, minStarskyId);
        } catch (Exception exception) {
            log.error("❌ [AuthService] DB 오류 발생: {}", exception.getMessage(), exception);
            return ResponseDto.databaseError();
        }

        return SignUpResponseDto.success();
    }

    @Override
    public ResponseEntity<? super LoginResponseDto> signIn(LoginRequestDto dto) {
        log.info("🔹 [AuthService] 로그인 요청 - ID: {}", dto.getId());

        String token = null;

        try {
            String username = dto.getId();
            User user = userRepository.findByUsername(username);
            if (user == null) {
                log.warn("❌ [AuthService] 로그인 실패 - 존재하지 않는 ID: {}", username);
                return LoginResponseDto.signInFail();
            }

            boolean isMatched = passwordEncoder.matches(dto.getPassword(), user.getPassword());
            if (!isMatched) {
                log.warn("❌ [AuthService] 로그인 실패 - 비밀번호 불일치: {}", username);
                return LoginResponseDto.signInFail();
            }

            token = jwtProvider.createToken(username);
            log.info("✅ [AuthService] 로그인 성공 - ID: {}, Token 생성 완료", username);

        } catch (Exception exception) {
            log.error("❌ [AuthService] 로그인 중 오류 발생: {}", exception.getMessage(), exception);
            return ResponseDto.databaseError();
        }

        return LoginResponseDto.success(token);
    }

    @Transactional
    @Override
    public void updateUserConstellation(Integer userId, Integer minStarskyId) {
        log.info("🔹 [UserService] userId={}의 constellation을 {}로 업데이트 요청", userId, minStarskyId);
        userRepository.updateUserConstellation(userId, minStarskyId);
        log.info("✅ [UserService] userId={}의 constellation 업데이트 완료", userId);
    }

    @Override
    @Transactional
    public NicknameUpdateResponseDto updateNickname(Integer userId, String nickname) {

        if (nickname == null || !NICKNAME_PATTERN.matcher(nickname).matches()) {
            log.warn("❌ [닉네임 변경 실패] 유효하지 않은 닉네임: {}", nickname);
            return NicknameUpdateResponseDto.invalidNickname();
        }

        if (userRepository.existsByNickname(nickname)) {
            log.warn("❌ [닉네임 변경 실패] 중복 닉네임: {}", nickname);
            return NicknameUpdateResponseDto.duplicateNickname();
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("❌ [닉네임 변경 실패] 존재하지 않는 userId={}", userId);
            return NicknameUpdateResponseDto.unauthorized();
        }

        user.setNickname(nickname);
        userRepository.save(user);
        log.info("✅ [닉네임 변경 성공] userId={}, newNickname={}", userId, nickname);

        return NicknameUpdateResponseDto.success(userId, nickname);
    }

    @Override
    @Transactional
    public ProfileImageUpdateResponseDto updateProfileImage(Integer userId, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            log.warn("❌ [프로필 이미지 변경 실패] 파일 없음");
            return ProfileImageUpdateResponseDto.missingFile();
        }

        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            log.warn("❌ [프로필 이미지 변경 실패] 잘못된 파일 형식: {}", file.getContentType());
            return ProfileImageUpdateResponseDto.invalidFileType();
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("❌ [프로필 이미지 변경 실패] 파일 크기 초과: {} bytes", file.getSize());
            return ProfileImageUpdateResponseDto.fileSizeExceeded();
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("❌ [프로필 이미지 변경 실패] 존재하지 않는 userId={}", userId);
            return ProfileImageUpdateResponseDto.unauthorized();
        }

        // ✅ 기존 프로필 이미지 삭제 (있을 경우)
        if (user.getMediaUrl() != null) {
            log.info("📌 [기존 프로필 이미지 삭제] 기존 URL: {}", user.getMediaUrl());
            awsS3Service.deleteFileFromS3(user.getMediaUrl());
        }

        // ✅ 새 프로필 이미지 업로드
        String newMediaUrl = awsS3Service.uploadFile(file);
        user.setMediaUrl(newMediaUrl);
        userRepository.save(user);
        log.info("✅ [프로필 이미지 변경 성공] userId={}, newMediaUrl={}", userId, newMediaUrl);

        return ProfileImageUpdateResponseDto.success(userId, newMediaUrl);
    }

    @Override
    @Transactional
    public RegisterDeviceResponseDto registerDevice(Integer userId, RegisterDeviceRequestDto requestDto) {

        // 2. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. 기존 등록된 디바이스인지 확인
        if (requestDto.getDeviceId().equals(user.getDeviceId())) {
            log.info("📌 [디바이스 중복 등록] 사용자 ID: {}, Device ID: {}", userId, requestDto.getDeviceId());
            return RegisterDeviceResponseDto.success(userId, user.getDeviceId(), user.getDeviceName(), Instant.now());
        }

        // 4. 사용자 정보 업데이트 (디바이스 정보 저장)
        user.setDeviceId(requestDto.getDeviceId());
        user.setDeviceName(requestDto.getDeviceName());
        userRepository.save(user);

        log.info("✅ [디바이스 등록 완료] 사용자 ID: {}, Device ID: {}, Device Name: {}",
                userId, requestDto.getDeviceId(), requestDto.getDeviceName());

        return RegisterDeviceResponseDto.success(userId, user.getDeviceId(), user.getDeviceName(), Instant.now());
    }

    @Override
    @Transactional(readOnly = true)
    public GetUserResponseDto getUserProfile(Integer userId) {

        // 2️⃣ 사용자 정보 조회
        Optional<User> optionalUser = userRepository.findByUserId(userId);
        if (optionalUser.isEmpty()) {
            log.warn("❌ [회원 조회 실패] 존재하지 않는 사용자 - userId: {}", userId);
            return GetUserResponseDto.userNotFound();
        }

        User user = optionalUser.get();
        log.info("✅ [회원 조회 성공] userId: {}, nickname: {}", user.getUserId(), user.getNickname());

        return GetUserResponseDto.success(user.getUserId(),user.getNickname(), user.getMediaUrl());
    }

}
