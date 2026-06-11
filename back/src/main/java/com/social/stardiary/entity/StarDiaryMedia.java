package com.social.stardiary.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "star_diary_media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StarDiaryMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "media_id")
    private Integer mediaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "star_id", nullable = false)
    private Star star; // ✅ `star_id` FK

    @Column(nullable = false)
    private String mediaUrl; // ✅ 미디어 파일 URL
}
