package backend.backend.service;

import backend.backend.entity.Role;
import backend.backend.repository.RoleRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public Role createRole(Role role) {
        String roleName = role.getName().toUpperCase();

        if (roleRepository.findByName(roleName).isPresent()) {
            throw new RuntimeException("The role '" + roleName + "' already exists!");
        }

        role.setName(roleName);
        return roleRepository.save(role);
    }

    public Page<Role> getAllRoles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return roleRepository.findAll(pageable);
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("The role with ID " + id + " was not found!"));
    }

    public Role updateRole(Long id, Role updatedRole) {
        Role existingRole = getRoleById(id);
        String newRoleName = updatedRole.getName().toUpperCase();

        roleRepository.findByName(newRoleName).ifPresent(r -> {
            if (!r.getId().equals(id)) {
                throw new RuntimeException("The name '" + newRoleName + "' already belongs to another role!");
            }
        });

        existingRole.setName(newRoleName);
        return roleRepository.save(existingRole);
    }

    public void deleteRole(Long id) {
        Role existingRole = getRoleById(id);
        
        if (existingRole.getName().equals("ADMIN") || existingRole.getName().equals("USER")) {
            throw new RuntimeException("System roles (ADMIN/USER) cannot be deleted!");
        }

        roleRepository.delete(existingRole);
    }
}
