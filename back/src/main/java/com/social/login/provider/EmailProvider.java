package com.social.login.provider;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailProvider {

    private final JavaMailSender javaMailSender;

    private final String SUBJECT = "[왁왁 서비스] 인증메일입니다.";

    /**
     * 인증 메일 발송
     */
    public boolean sendCertificationMail(String email, String certificationNumber) {
        log.info("🔹 [EmailProvider] 이메일 발송 요청 - 대상: {}", email);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message, true);

            String htmlContent = getCertificationMessage(certificationNumber);

            messageHelper.setTo(email);
            messageHelper.setSubject(SUBJECT);
            messageHelper.setText(htmlContent, true);

            javaMailSender.send(message);

            log.info("✅ [EmailProvider] 이메일 발송 성공 - 대상: {}", email);
            log.debug("🔹 [EmailProvider] 발송된 인증 코드: {}", certificationNumber);
            return true;

        } catch (Exception exception) {
            log.error("❌ [EmailProvider] 이메일 발송 실패 - 대상: {}, 오류: {}", email, exception.getMessage(), exception);
            return false;
        }
    }

    /**
     * 인증 이메일 HTML 내용 생성
     */
    private String getCertificationMessage(String certificationNumber) {
        return "<h1 style='text-align: center;'>[왁왁 서비스] 인증메일</h1>" +
                "<h3 style='text-align: center;'>인증코드 : <strong style='font-size: 32px; letter-spacing: 8px;'>" +
                certificationNumber +
                "</strong></h3>";
    }
}
