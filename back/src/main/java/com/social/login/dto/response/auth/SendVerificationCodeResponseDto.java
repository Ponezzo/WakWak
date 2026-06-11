package com.social.login.dto.response.auth;

import com.social.login.common.ResponseCode;
import com.social.login.common.ResponseMessage;
import com.social.login.dto.response.ResponseDto;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Getter
public class SendVerificationCodeResponseDto extends ResponseDto {

    private SendVerificationCodeResponseDto() {
        super();
    }

    public static ResponseEntity<SendVerificationCodeResponseDto> success(){
        SendVerificationCodeResponseDto responseBody = new SendVerificationCodeResponseDto();
        return ResponseEntity.status(HttpStatus.OK).body(responseBody);
    }

    public static ResponseEntity<ResponseDto> duplicateId(){
        ResponseDto responseBody = new ResponseDto(ResponseCode.DUPLICATE_ID, ResponseMessage.DUPLICATE_ID);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
    }

    public static ResponseEntity<ResponseDto> mailSendFail(){
        ResponseDto responseBody = new ResponseDto(ResponseCode.MAIL_FAIL, ResponseMessage.MAIL_FAIL);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
    }

}
