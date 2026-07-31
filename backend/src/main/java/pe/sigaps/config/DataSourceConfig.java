package pe.sigaps.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String mysqlUrl = System.getenv("MYSQL_URL");
        String mysqlPublicUrl = System.getenv("MYSQL_PUBLIC_URL");
        String mysqlPrivateUrl = System.getenv("MYSQL_PRIVATE_URL");

        log.info("=== DATABASE CONNECTION DIAGNOSTIC ===");
        log.info("MYSQL_URL present: {}", mysqlUrl != null);
        log.info("MYSQL_PUBLIC_URL present: {}", mysqlPublicUrl != null);
        log.info("MYSQL_PRIVATE_URL present: {}", mysqlPrivateUrl != null);
        log.info("MYSQLHOST: {}", System.getenv("MYSQLHOST"));
        log.info("MYSQLPORT: {}", System.getenv("MYSQLPORT"));
        log.info("MYSQL_DATABASE: {}", System.getenv("MYSQL_DATABASE"));
        log.info("MYSQLUSER: {}", System.getenv("MYSQLUSER"));
        log.info("Original datasource URL: {}", properties.getUrl());

        String jdbcUrl = null;
        String username = null;
        String password = null;

        // Strategy 1: Parse MYSQL_PRIVATE_URL (best for Railway internal networking)
        if (mysqlPrivateUrl != null && !mysqlPrivateUrl.isBlank()) {
            log.info("Using MYSQL_PRIVATE_URL");
            jdbcUrl = convertToJdbc(mysqlPrivateUrl);
            username = extractUser(mysqlPrivateUrl);
            password = extractPassword(mysqlPrivateUrl);
        }
        // Strategy 2: Parse MYSQL_URL
        else if (mysqlUrl != null && !mysqlUrl.isBlank()) {
            log.info("Using MYSQL_URL");
            jdbcUrl = convertToJdbc(mysqlUrl);
            username = extractUser(mysqlUrl);
            password = extractPassword(mysqlUrl);
        }
        // Strategy 3: Parse MYSQL_PUBLIC_URL
        else if (mysqlPublicUrl != null && !mysqlPublicUrl.isBlank()) {
            log.info("Using MYSQL_PUBLIC_URL");
            jdbcUrl = convertToJdbc(mysqlPublicUrl);
            username = extractUser(mysqlPublicUrl);
            password = extractPassword(mysqlPublicUrl);
        }

        // Strategy 4: Use properties from application.yml (individual env vars)
        if (jdbcUrl == null) {
            log.info("Using application.yml datasource properties");
            jdbcUrl = properties.getUrl();
            username = properties.getUsername();
            password = properties.getPassword();
        }

        log.info("Final JDBC URL: {}", jdbcUrl);
        log.info("Final username: {}", username);
        log.info("=== END DIAGNOSTIC ===");

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(username);
        ds.setPassword(password);
        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        ds.setMaximumPoolSize(5);
        ds.setConnectionTimeout(30000);
        ds.setIdleTimeout(600000);
        ds.setMaxLifetime(1800000);
        return ds;
    }

    private String convertToJdbc(String url) {
        try {
            String cleanUrl = url;
            if (cleanUrl.startsWith("mysql://")) {
                cleanUrl = cleanUrl.substring(8); // remove "mysql://"
            }
            // Remove user:pass@ part
            int atIndex = cleanUrl.indexOf('@');
            String hostPart = (atIndex >= 0) ? cleanUrl.substring(atIndex + 1) : cleanUrl;
            return "jdbc:mysql://" + hostPart + "?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC";
        } catch (Exception e) {
            log.error("Failed to parse MySQL URL: {}", url, e);
            return null;
        }
    }

    private String extractUser(String url) {
        try {
            String cleanUrl = url.replace("mysql://", "");
            int atIndex = cleanUrl.indexOf('@');
            if (atIndex < 0) return null;
            String userInfo = cleanUrl.substring(0, atIndex);
            int colonIndex = userInfo.indexOf(':');
            return (colonIndex >= 0) ? userInfo.substring(0, colonIndex) : userInfo;
        } catch (Exception e) {
            return null;
        }
    }

    private String extractPassword(String url) {
        try {
            String cleanUrl = url.replace("mysql://", "");
            int atIndex = cleanUrl.indexOf('@');
            if (atIndex < 0) return null;
            String userInfo = cleanUrl.substring(0, atIndex);
            int colonIndex = userInfo.indexOf(':');
            return (colonIndex >= 0) ? userInfo.substring(colonIndex + 1) : null;
        } catch (Exception e) {
            return null;
        }
    }
}
