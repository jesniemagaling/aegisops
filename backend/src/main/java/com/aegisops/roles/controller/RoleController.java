package com.aegisops.roles.controller;

import com.aegisops.common.dto.ApiResponse;
import com.aegisops.common.enums.RoleCode;
import com.aegisops.roles.dto.RoleResponse;
import com.aegisops.roles.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Role endpoints per API.md §6.1.
 *
 * GET /roles — list all roles (ADMIN only)
 */
@RestController
@RequestMapping("/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PreAuthorize(RoleCode.HAS_ADMIN)
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }
}
