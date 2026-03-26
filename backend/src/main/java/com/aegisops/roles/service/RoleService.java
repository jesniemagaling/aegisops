package com.aegisops.roles.service;

import com.aegisops.roles.dto.RoleResponse;
import com.aegisops.roles.entity.Role;
import com.aegisops.roles.repository.RoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Role service per API.md §6.1 — GET /roles.
 * Read-only service returning all seeded roles.
 */
@Slf4j
@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private RoleResponse toResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .createdAt(role.getCreatedAt())
                .build();
    }
}

