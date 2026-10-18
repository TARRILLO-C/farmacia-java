package com.sg.farmacia.exception;

public class ServicioExternoException extends RuntimeException {
    public ServicioExternoException(String message) {
        super(message);
    }

    public ServicioExternoException(String message, Throwable cause) {
        super(message, cause);
    }
}
