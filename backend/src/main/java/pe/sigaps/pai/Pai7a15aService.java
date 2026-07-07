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
public class Pai7a15aService extends AbstractPaiService<Pai7a15a> {

    public Pai7a15aService(Pai7a15aRepository repositorio, PacienteService pacienteService,
                           UsuarioService usuarioService,
                           ProfesionalService profesionalService,
                           VacunaCatalogoRepository vacunaCatalogoRepository,
                           VacunaCatalogoMapper vacunaCatalogoMapper) {
        super(repositorio, pacienteService, usuarioService, profesionalService, vacunaCatalogoRepository, vacunaCatalogoMapper);
    }

    @Override
    protected Pai7a15a nuevaInstancia() {
        return new Pai7a15a();
    }

    @Override
    protected String nombreEntidad() {
        return "Registro PAI 7a-15a";
    }

    @Transactional
    @Auditable(tabla = "pai_7a_15a", accion = AccionAuditoria.INSERT)
    public PaiResponseDto crear(CreatePaiDto dto) {
        return crearInterno(dto);
    }

    @Transactional
    @Auditable(tabla = "pai_7a_15a", accion = AccionAuditoria.UPDATE)
    public PaiResponseDto actualizar(Long id, UpdatePaiDto dto) {
        return actualizarInterno(id, dto);
    }

    @Transactional
    @Auditable(tabla = "pai_7a_15a", accion = AccionAuditoria.DELETE)
    public void eliminar(Long id) {
        eliminarInterno(id);
    }
}
