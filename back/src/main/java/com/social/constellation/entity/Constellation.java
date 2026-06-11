package com.social.constellation.entity;

import com.social.stardiary.entity.Star;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "constellation")
@IdClass(ConstellationId.class) // ✅ 복합 키 클래스 지정
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Constellation {

    @Id
    @ManyToOne
    @JoinColumn(name = "star_id", nullable = false)
    private Star star; // ✅ FK: `star_id`

    @Id
    @ManyToOne
    @JoinColumn(name = "constellation_id", nullable = false)
    private ConstellationName constellationName; // ✅ FK: `constellation_id`

    @Column(name = "star_order", nullable = false)
    private Integer starOrder;
}
