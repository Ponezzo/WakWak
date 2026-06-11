package com.social.constellation.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class StarOwnershipException extends RuntimeException {
    public StarOwnershipException(String message) {
        super(message);
    }
}
