package com.social.login.dto.response.auth;

import com.social.login.common.ResponseCode;
import com.social.login.common.ResponseMessage;
import com.social.login.dto.response.ResponseDto;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Getter
public class CheckNicknameResponseDto extends ResponseDto {

    private CheckNicknameResponseDto() {
        super();
    }

    public static ResponseEntity<CheckNicknameResponseDto> success() {
        CheckNicknameResponseDto responseBody = new CheckNicknameResponseDto();
        return ResponseEntity.status(HttpStatus.OK).body(responseBody);
    }

    public static ResponseEntity<ResponseDto> duplicateNickname() {
        ResponseDto responseBody = new ResponseDto(ResponseCode.DUPLICATE_NICKNAME, ResponseMessage.DUPLICATE_NICKNAME);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseBody);
    }

}
