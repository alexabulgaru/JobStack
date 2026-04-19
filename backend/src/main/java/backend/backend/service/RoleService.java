package backend.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import backend.backend.entity.Role;
import backend.backend.exception.ConflictException;
import backend.backend.exception.ForbiddenOperationException;
import backend.backend.exception.ResourceNotFoundException;
import backend.backend.repository.RoleRepository;
import backend.backend.service.dto.RoleRequest;
import backend.backend.service.dto.RoleResponse;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public RoleResponse createRole(RoleRequest request) {
        String roleName = request.getName().toUpperCase();

        if (roleRepository.findByName(roleName).isPresent()) {
            throw new ConflictException("The role '" + roleName + "' already exists!");
        }

        Role role = new Role();
        role.setName(roleName);
        return mapToResponse(roleRepository.save(role));
    }

    public Page<RoleResponse> getAllRoles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return roleRepository.findAll(pageable).map(this::mapToResponse);
    }

    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("The role with ID " + id + " was not found!"));
        return mapToResponse(role);
    }

    public RoleResponse updateRole(Long id, RoleRequest request) {
        Role existingRole = getRoleEntityById(id);
        String newRoleName = request.getName().toUpperCase();

        roleRepository.findByName(newRoleName).ifPresent(r -> {
            if (!r.getId().equals(id)) {
                throw new ConflictException("The name '" + newRoleName + "' already belongs to another role!");
            }
        });

        existingRole.setName(newRoleName);
        return mapToResponse(roleRepository.save(existingRole));
    }

    public void deleteRole(Long id) {
        Role existingRole = getRoleEntityById(id);
        
        if (existingRole.getName().equals("ADMIN") || existingRole.getName().equals("USER")) {
            throw new ForbiddenOperationException("System roles (ADMIN/USER) cannot be deleted!");
        }

        roleRepository.delete(existingRole);
    }

    private Role getRoleEntityById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("The role with ID " + id + " was not found!"));
    }

    private RoleResponse mapToResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        return response;
    }
}
