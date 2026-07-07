package pe.sigaps.pai;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.auditoria.AccionAuditoria;
import pe.sigaps.auditoria.Auditable;
import pe.sigaps.catalogo.VacunaCatalogoRepository;
import pe.sigaps.catalogo.mapper.VacunaCatalogoMapper;
import pe.sigaps.pai.dto.CreatePaiDto;
import pe.sigaps.pai.dto.PaiResponseDto;
import pe.sigaps.pai.dto.UpdatePaiDto;
import pe.sigaps.paciente.PacienteService;
import pe.sigaps.profesional.ProfesionalService;
import pe.sigaps.usuario.UsuarioService;

@Service
public class PaiMenor12mService extends AbstractPaiService<PaiMenor12m> {

    public PaiMenor12mService(PaiMenor12mRepository repositorio, PacienteService pacienteService,
                               UsuarioService usuarioService,
                               ProfesionalService profesionalService,
                               VacunaCatalogoRepository vacunaCatalogoRepository,
                               VacunaCatalogoMapper vacunaCatalogoMapper) {
        super(repositorio, pacienteService, usuarioService, profesionalService, vacunaCatalogoRepository, vacunaCatalogoMapper);
    }

    @Override
    protected PaiMenor12m nuevaInstancia() {
        return new PaiMenor12m();
    }

    @Override
    protected String nombreEntidad() {
        return "Registro PAI menor de 12 meses";
    }

    @Transactional
    @Auditable(tabla = "pai_menor12m", accion = AccionAuditoria.INSERT)
    public PaiResponseDto crear(CreatePaiDto dto) {
        return crearInterno(dto);
    }

    @Transactional
    @Auditable(tabla = "pai_menor12m", accion = AccionAuditoria.UPDATE)
    public PaiResponseDto actualizar(Long id, UpdatePaiDto dto) {
        return actualizarInterno(id, dto);
    }

    @Transactional
    @Auditable(tabla = "pai_menor12m", accion = AccionAuditoria.DELETE)
    public void eliminar(Long id) {
        eliminarInterno(id);
    }
}
