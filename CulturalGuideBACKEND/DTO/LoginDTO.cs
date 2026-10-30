namespace DefaultNamespace;

public record LoginRequest(string Email, string Password, bool RememberMe = false);
public record LoginResponse(string Token, DateTime ExpiresAt, string Message);
