package com.social.timecapsules.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "time_capsule_media")
public class TimeCapsuleMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mediaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capsule_id", nullable = false)
    private TimeCapsule timeCapsule;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mediaUrl;
}
