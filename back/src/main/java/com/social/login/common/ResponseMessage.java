package com.social.login.common;

public interface ResponseMessage {

    String SUCCESS = "Success.";

    String VALIDATION_FAILED = "Validation failed.";
    String DUPLICATE_ID = "Duplicate Id";

    String DUPLICATE_NICKNAME = "Duplicate Nickname";

    String SIGN_IN_FAIL = "Login information mismatch.";
    String CERTIFICATION_FAIL = "Certification failed.";

    String MAIL_FAIL = "Mail send failed.";
    String DATABASE_ERROR = "Database error.";
}
