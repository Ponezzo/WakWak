package com.social.login.dto.response.auth;

import com.social.login.common.ResponseCode;
import com.social.login.common.ResponseMessage;
import com.social.login.dto.response.ResponseDto;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Getter
public class LoginResponseDto extends ResponseDto {

    private String token;
    private int expirationTime;

    private LoginResponseDto(String token) {
        super();
        this.token = token;
        this.expirationTime = 3600;
    }

    @Override
    public String toString() {
        return "SignInResponseDto{" +
                "token='" + token + '\'' +
                ", expirationTime=" + expirationTime +
                '}';
    }

    public static ResponseEntity<LoginResponseDto> success (String token){
        LoginResponseDto responseBody = new LoginResponseDto(token);
        return ResponseEntity.status(HttpStatus.OK).body(responseBody);
    }

    public static ResponseEntity<ResponseDto> signInFail (){
        ResponseDto responseBody = new ResponseDto(ResponseCode.SIGN_IN_FAIL, ResponseMessage.SIGN_IN_FAIL);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseBody);
    }
}
