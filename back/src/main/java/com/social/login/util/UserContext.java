package com.social.login.util;

import jakarta.servlet.http.HttpServletRequest;

public class UserContext {

    private UserContext(){

    }

    public static Integer getUserId(HttpServletRequest request){
        Object userId = request.getAttribute("userId");
        return userId instanceof Integer ? (Integer)userId : null;
    }
}
