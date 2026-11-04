package com.repomind.exception;
import java.util.*;
import java.util.stream.Collectors;
import com.repomind.service.PythonServiceException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
@RestControllerAdvice
public class GlobalExceptionHandler {
 @ExceptionHandler(MethodArgumentNotValidException.class)
 public ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException ex){
  String message=ex.getBindingResult().getFieldErrors().stream().map(e->e.getField()+": "+e.getDefaultMessage()).collect(Collectors.joining("; "));
  return error(HttpStatus.BAD_REQUEST,message);
 }
 @ExceptionHandler(PythonServiceException.class)
 public ResponseEntity<Map<String,Object>> python(PythonServiceException ex){return error(HttpStatus.BAD_GATEWAY,ex.getMessage());}
 @ExceptionHandler(Exception.class)
 public ResponseEntity<Map<String,Object>> other(Exception ex){return error(HttpStatus.INTERNAL_SERVER_ERROR,"An unexpected server error occurred");}
 private ResponseEntity<Map<String,Object>> error(HttpStatus status,String message){
  Map<String,Object> body=new LinkedHashMap<>(); body.put("status",status.value()); body.put("error",status.getReasonPhrase()); body.put("message",message);
  return ResponseEntity.status(status).body(body);
 }
}