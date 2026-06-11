package com.social.global.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AwsS3Service {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.s3.path.review}")
    private String s3Path;

    /**
     * ✅ S3에 파일 업로드
     */
    public String uploadFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String fileName = s3Path + "/" + UUID.randomUUID() + "_" + originalFileName; // 고유한 파일명 생성

        log.info("📌 [S3 파일 업로드] 파일명: {}, 경로: {}", originalFileName, fileName);

        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            amazonS3.putObject(bucketName, fileName, file.getInputStream(), metadata);
            String fileUrl = amazonS3.getUrl(bucketName, fileName).toString();
            log.info("✅ [S3 업로드 성공] S3 URL: {}", fileUrl);
            return fileUrl;
        } catch (IOException e) {
            log.error("❌ [S3 업로드 실패] 오류: {}", e.getMessage());
            throw new RuntimeException("파일 업로드 실패");
        }
    }

    /**
     * ✅ S3에서 파일 삭제
     */
    public void deleteFileFromS3(String fileUrl) {
        try {
            // ✅ S3 파일 URL에서 파일 Key(경로)만 추출
            String fileKey = extractFileKeyFromUrl(fileUrl);
            log.info("📌 [S3 파일 삭제 요청] 원본 URL: {}", fileUrl);
            log.info("📌 [S3 파일 삭제 요청] 추출된 Key: {}", fileKey);

            // ✅ S3에서 파일 삭제
            amazonS3.deleteObject(bucketName, fileKey);
            log.info("✅ [S3 삭제 성공] 파일: {}", fileKey);
        } catch (Exception e) {
            log.error("❌ [S3 삭제 실패] 파일: {}, 오류: {}", fileUrl, e.getMessage());
        }
    }

    private String extractFileKeyFromUrl(String fileUrl) {
        // ✅ URL에서 S3 버킷 주소 제거하여 Key 추출
        return fileUrl.replace("https://wakwak.s3.ap-northeast-2.amazonaws.com/", "");
    }



    /**
     * ✅ S3 URL에서 파일명 추출
     */
    private String extractFileNameFromUrl(String fileUrl) {
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1); // 파일명만 추출
    }
}

