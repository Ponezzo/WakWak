package com.social.bottle.entity;

import com.social.login.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "bottle_comment")
public class BottleComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bottle_id", nullable = false)
    private Bottle bottle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private BottleComment parentId; // ✅ 자기 참조 FK

    @Column(nullable = false, length = 255)
    private String content;

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Instant createdAt = Instant.now();

    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private Integer isDeleted = 0; // ✅ 삭제 여부 추가
}
