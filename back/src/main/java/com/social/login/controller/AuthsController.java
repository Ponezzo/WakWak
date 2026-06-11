package com.social.login.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthsController {

    @GetMapping("/oauth-response")
    public ResponseEntity<?> oauthResponse(
            @RequestParam("token") String token,
            @RequestParam("exp") long exp) {
        // JWT를 받아서 프론트엔드로 전달
        return ResponseEntity.ok().body(Map.of("token", token, "exp", exp));
    }
}
