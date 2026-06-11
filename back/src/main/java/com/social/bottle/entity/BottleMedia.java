package com.social.bottle.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "bottle_media")
public class BottleMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "media_id")
    private Integer mediaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bottle_id", nullable = false)
    private Bottle bottle;

    @Column(name = "media_url", length = 2048)
    private String mediaUrl;
}
