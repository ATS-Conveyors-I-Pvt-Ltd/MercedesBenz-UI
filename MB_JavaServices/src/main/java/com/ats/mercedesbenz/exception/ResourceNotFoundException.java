package com.ats.mercedesbenz.exception;

/**
 * Resource Not Found Exception
 * Thrown when requested resource is not found in database
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
