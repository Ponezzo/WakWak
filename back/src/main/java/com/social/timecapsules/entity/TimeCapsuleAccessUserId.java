package com.social.timecapsules.entity;

import java.io.Serializable;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimeCapsuleAccessUserId implements Serializable {
    private Integer user;
    private Integer timeCapsule;
}
