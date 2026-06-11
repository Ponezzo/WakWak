package com.social.login.common;

public class CertificationNumber {

    public static String getCertificationNumber() {

        String certificationNumber = "";

        for (int i = 0; i <
                4; i++) {
            certificationNumber += (int) (Math.random()*10);
        }

        return certificationNumber;

    }

}
