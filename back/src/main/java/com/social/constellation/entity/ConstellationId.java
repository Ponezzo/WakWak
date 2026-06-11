package com.social.constellation.entity;

import lombok.EqualsAndHashCode;
import java.io.Serializable;

@EqualsAndHashCode
public class ConstellationId implements Serializable {
    private Integer star;
    private Integer constellationName;
}
