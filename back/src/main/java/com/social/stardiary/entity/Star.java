package com.social.stardiary.entity;

import com.social.starsky.entity.StarSky;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "star")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Star {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "star_id")
    private Integer starId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sky_id", nullable = false)
    private StarSky starSky; // ✅ 별 하늘과 연결

    @Column(nullable = false)
    private Double latitude; // ✅ 위도

    @Column(nullable = false)
    private Double longitude; // ✅ 경도
}
