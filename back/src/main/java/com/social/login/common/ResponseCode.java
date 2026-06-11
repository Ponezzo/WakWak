package com.social.login.common;

public interface ResponseCode {

    String SUCCESS = "SU";

    String VALIDATION_FAILED = "VF";
    String DUPLICATE_ID = "DI";
    String DUPLICATE_NICKNAME = "DN";

    String SIGN_IN_FAIL = "SF";
    String CERTIFICATION_FAIL = "CF";

    String MAIL_FAIL = "MF";
    String DATABASE_ERROR = "DBE";
}

