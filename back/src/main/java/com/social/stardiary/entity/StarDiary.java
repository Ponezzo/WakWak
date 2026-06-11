package com.social.stardiary.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "star_diary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StarDiary {

    @Id
    @Column(name = "star_id")
    private Integer starId; // ✅ `star` 테이블의 star_id (PK & FK)

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "star_id")
    private Star star; // ✅ 별과 1:1 관계

    @Column(nullable = false)
    private String title; // ✅ 일기 제목

    @Column(nullable = false)
    private String content; // ✅ 일기 내용

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // ✅ 작성 시간 (자동 저장)

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
