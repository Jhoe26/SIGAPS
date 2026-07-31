package pe.sigaps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SigapsApplication {

    public static void main(String[] args) {
        System.out.println("=== DB ENV DIAGNOSTIC ===");
        System.out.println("MYSQLHOST=" + System.getenv("MYSQLHOST"));
        System.out.println("MYSQLPORT=" + System.getenv("MYSQLPORT"));
        System.out.println("MYSQL_DATABASE=" + System.getenv("MYSQL_DATABASE"));
        System.out.println("MYSQLUSER=" + System.getenv("MYSQLUSER"));
        System.out.println("MYSQLPASSWORD=" + (System.getenv("MYSQLPASSWORD") != null ? "***SET***" : "NOT_SET"));
        System.out.println("MYSQL_URL=" + System.getenv("MYSQL_URL"));
        System.out.println("=== END DIAGNOSTIC ===");
        SpringApplication.run(SigapsApplication.class, args);
    }
}
