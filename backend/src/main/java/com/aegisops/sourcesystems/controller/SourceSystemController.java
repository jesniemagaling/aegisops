package com.aegisops.sourcesystems.controller;
import com.aegisops.common.dto.ApiResponse;
import com.aegisops.common.dto.PagedResponse;
import com.aegisops.common.enums.RoleCode;
import com.aegisops.sourcesystems.dto.request.CreateSourceSystemRequest;
import com.aegisops.sourcesystems.dto.request.UpdateSourceSystemRequest;
import com.aegisops.sourcesystems.dto.response.SourceSystemResponse;
import com.aegisops.sourcesystems.service.SourceSystemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;
/**
 * REST controller for source system management per API.md Section 6.2.
 *
 * POST   /source-systems          — create   (ADMIN only)
 * GET    /source-systems          — list     (ADMIN, ANALYST)
 * GET    /source-systems/{id}     — get      (ADMIN, ANALYST)
 * PATCH  /source-systems/{id}     — update   (ADMIN only)
 */
@RestController
@RequestMapping("/source-systems")
public class SourceSystemController {
    private final SourceSystemService service;
    public SourceSystemController(SourceSystemService service) {
        this.service = service;
    }
    @PreAuthorize(RoleCode.HAS_ADMIN)
    @PostMapping
    public ResponseEntity<ApiResponse<SourceSystemResponse>> create(
            @Valid @RequestBody CreateSourceSystemRequest request) {
        SourceSystemResponse response = service.createSourceSystem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Source system created"));
    }
    @PreAuthorize(RoleCode.HAS_ADMIN_ANALYST)
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SourceSystemResponse>>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int size) {
        PagedResponse<SourceSystemResponse> response = service.getSourceSystems(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    @PreAuthorize(RoleCode.HAS_ADMIN_ANALYST)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SourceSystemResponse>> getById(@PathVariable UUID id) {
        SourceSystemResponse response = service.getSourceSystemById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    @PreAuthorize(RoleCode.HAS_ADMIN)
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<SourceSystemResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSourceSystemRequest request) {
        SourceSystemResponse response = service.updateSourceSystem(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Source system updated"));
    }
}