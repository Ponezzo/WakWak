package com.social.starsky.entity;

import com.social.login.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "star_sky")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StarSky {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sky_id")
    private Integer skyId; // Integer로 변경

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
