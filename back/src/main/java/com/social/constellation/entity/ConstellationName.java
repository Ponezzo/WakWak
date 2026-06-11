package com.social.constellation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "constellation_name")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConstellationName {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "constellation_id")
    private Integer constellationId;

    @Column(name = "constellation_name", nullable = false, length = 20)
    private String constellationName;
}
