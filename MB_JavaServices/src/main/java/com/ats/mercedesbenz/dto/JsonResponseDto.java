package com.ats.mercedesbenz.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standard JSON Response DTO
 * Based on iprod JsonResponseDto pattern
 * 
 * Status codes:
 * - 1: Success
 * - 0: Error
 * - 2: Unauthorized (need login)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JsonResponseDto<T> {

    /**
     * Status: 1=Success, 0=Error, 2=Unauthorized
     */
    private Integer status;

    /**
     * Success message
     */
    private String successMsg;

    /**
     * Error message
     */
    private String errorMsg;

    /**
     * Response data
     */
    private T data;

    /**
     * Success response with data
     */
    public static <T> JsonResponseDto<T> success(T data) {
        JsonResponseDto<T> response = new JsonResponseDto<>();
        response.setStatus(1);
        response.setData(data);
        return response;
    }

    /**
     * Success response with message
     */
    public static <T> JsonResponseDto<T> success(String message, T data) {
        JsonResponseDto<T> response = new JsonResponseDto<>();
        response.setStatus(1);
        response.setSuccessMsg(message);
        response.setData(data);
        return response;
    }

    /**
     * Error response
     */
    public static <T> JsonResponseDto<T> error(String errorMsg) {
        JsonResponseDto<T> response = new JsonResponseDto<>();
        response.setStatus(0);
        response.setErrorMsg(errorMsg);
        return response;
    }

    /**
     * Unauthorized response
     */
    public static <T> JsonResponseDto<T> unauthorized() {
        JsonResponseDto<T> response = new JsonResponseDto<>();
        response.setStatus(2);
        response.setErrorMsg("Sorry!! You have to Login first");
        return response;
    }
}
