package pe.sigaps.sistema;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.parametro.ParametroSistemaRepository;
import pe.sigaps.sistema.dto.SistemaInfoDto;

import javax.sql.DataSource;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SistemaService {

    private static final String CLAVE_VERSION = "VERSION_SCHEMA";

    private final ParametroSistemaRepository parametroSistemaRepository;
    private final DataSource dataSource;

    @Value("${spring.profiles.active:default}")
    private String entorno;

    public SistemaInfoDto obtenerInfo() {
        String version = parametroSistemaRepository.findById(CLAVE_VERSION)
                .map(p -> p.getValor())
                .orElse("N/D");
        return new SistemaInfoDto(
                version,
                obtenerBaseDatos(),
                entorno,
                parametroSistemaRepository.obtenerUltimaActualizacion()
        );
    }

    private String obtenerBaseDatos() {
        try (var connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            return metaData.getDatabaseProductName() + " " + metaData.getDatabaseProductVersion();
        } catch (SQLException e) {
            return "N/D";
        }
    }
}
