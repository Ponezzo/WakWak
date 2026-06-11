package com.social.bottle.entity;

import com.social.login.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "bottle")
public class Bottle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bottle_id")
    private Integer bottleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp  // Hibernate가 자동으로 현재 시간 삽입
    private Instant createdAt;

    @OneToMany(mappedBy = "bottle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BottleMedia> mediaList;

    @OneToMany(mappedBy = "bottle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BottleComment> comments;
}
