package com.social.login.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity(name="certification")
@Table(name="certification")
public class CertificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer certification_id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String certificationNumber;

    // ✅ 필요한 생성자 추가
    public CertificationEntity(String username, String email, String certificationNumber) {
        this.username = username;
        this.email = email;
        this.certificationNumber = certificationNumber;
    }
}
