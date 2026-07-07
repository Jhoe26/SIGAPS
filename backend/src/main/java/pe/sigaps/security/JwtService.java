package pe.sigaps.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import pe.sigaps.usuario.Usuario;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtService {

    private static final String CLAIM_ID = "id";
    private static final String CLAIM_ROL = "rol";
    private static final String CLAIM_NOMBRE = "nombreCompleto";
    private static final String CLAIM_TYPE = "type";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";

    private final SecretKey secretKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(@Value("${sigaps.jwt.secret}") String secret,
                       @Value("${sigaps.jwt.access-expiration-ms}") long accessExpirationMs,
                       @Value("${sigaps.jwt.refresh-expiration-ms}") long refreshExpirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generarAccessToken(Usuario usuario) {
        return construirToken(usuario, TYPE_ACCESS, accessExpirationMs);
    }

    public String generarRefreshToken(Usuario usuario) {
        return construirToken(usuario, TYPE_REFRESH, refreshExpirationMs);
    }

    private String construirToken(Usuario usuario, String tipo, long expirationMs) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expirationMs);
        return Jwts.builder()
                .subject(usuario.getDni())
                .claim(CLAIM_ID, usuario.getId())
                .claim(CLAIM_ROL, usuario.getRol().name())
                .claim(CLAIM_NOMBRE, usuario.getNombreCompleto())
                .claim(CLAIM_TYPE, tipo)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(secretKey)
                .compact();
    }

    public Claims extraerClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean esTokenValido(String token) {
        try {
            extraerClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public boolean esRefreshToken(String token) {
        return TYPE_REFRESH.equals(extraerClaims(token).get(CLAIM_TYPE, String.class));
    }

    public String extraerDni(String token) {
        return extraerClaims(token).getSubject();
    }

    public Long extraerId(String token) {
        Number id = extraerClaims(token).get(CLAIM_ID, Number.class);
        return id != null ? id.longValue() : null;
    }
}
