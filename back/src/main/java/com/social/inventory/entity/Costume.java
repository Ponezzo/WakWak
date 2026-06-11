package com.social.inventory.entity;

import com.social.login.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "costume")
public class Costume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "costume_id")
    private Integer costumeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "has_item", nullable = false)
    private Integer hasItem;
}
