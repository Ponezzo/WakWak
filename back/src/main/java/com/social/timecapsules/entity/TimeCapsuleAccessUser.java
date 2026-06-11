package com.social.timecapsules.entity;

import com.social.login.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "time_capsule_access_users")
@IdClass(TimeCapsuleAccessUserId.class) // 복합 키 클래스 적용
public class TimeCapsuleAccessUser {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capsule_id", nullable = false)
    private TimeCapsule timeCapsule;

    @Column(name = "is_read", nullable = false)
    private int isRead = 0;  // 기본값 0 (읽지 않음)
}
