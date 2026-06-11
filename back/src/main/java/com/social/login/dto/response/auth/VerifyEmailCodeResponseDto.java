package com.social.login.dto.response.auth;

import com.social.login.common.ResponseCode;
import com.social.login.common.ResponseMessage;
import com.social.login.dto.response.ResponseDto;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Getter
public class VerifyEmailCodeResponseDto extends ResponseDto {

    private VerifyEmailCodeResponseDto() {
        super();
    }

    public static ResponseEntity<VerifyEmailCodeResponseDto> success() {
        VerifyEmailCodeResponseDto responseBody = new VerifyEmailCodeResponseDto();
        return ResponseEntity.status(HttpStatus.OK).body(responseBody);
    }

    public static ResponseEntity<ResponseDto> certificationFail() {
        ResponseDto responseBody = new ResponseDto(ResponseCode.CERTIFICATION_FAIL, ResponseMessage.CERTIFICATION_FAIL);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseBody);
    }
}
