package pe.sigaps.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class DatabaseDiagnostic {

    private static final Logger log = LoggerFactory.getLogger(DatabaseDiagnostic.class);

    @Value("${spring.datasource.url:NOT_SET}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:NOT_SET}")
    private String datasourceUsername;

    @Value("${MYSQLHOST:NOT_SET}")
    private String mysqlHost;

    @Value("${MYSQLPORT:NOT_SET}")
    private String mysqlPort;

    @Value("${MYSQL_DATABASE:NOT_SET}")
    private String mysqlDatabase;

    @jakarta.annotation.PostConstruct
    public void logDatabaseConfig() {
        log.info("=== DATABASE DIAGNOSTIC ===");
        log.info("MYSQLHOST={}", mysqlHost);
        log.info("MYSQLPORT={}", mysqlPort);
        log.info("MYSQL_DATABASE={}", mysqlDatabase);
        log.info("datasource.url={}", datasourceUrl);
        log.info("datasource.username={}", datasourceUsername);
        log.info("=== END DIAGNOSTIC ===");
    }
}
