package edu.cit.cabatana.doughlycrumbl.shared.exception;

public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}

