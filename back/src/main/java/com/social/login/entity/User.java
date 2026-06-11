package com.social.login.entity;

import com.social.login.dto.request.SignUpRequestDto;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "username", length = 30)
    private String username;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "user_type", length = 10)
    private String userType;

    @Column(name = "user_role", length = 10)
    private String userRole;

    @Column(name = "nickname", length = 255)
    private String nickname;

    @Column(name = "constellation")
    private Integer constellation;

    @Column(name = "media_url", length = 2048)
    private String mediaUrl;

    @Column(name = "device_id", length = 255)
    private String deviceId;

    @Column(name = "device_name", length = 255)
    private String deviceName;


    public User(SignUpRequestDto dto) {
        this.username = dto.getId();
        this.password = dto.getPassword();
        this.email = dto.getEmail();
        this.userType = "app";
        this.userRole = "ROLE_USER";
    }

    public User(String id, String email, String type, String nickname){
        this.username = id;
        this.password = "socialLogin";
        this.email = email;
        this.userType = type;
        this.userRole = "ROLE_USER";
        this.nickname = nickname;
    }
}
