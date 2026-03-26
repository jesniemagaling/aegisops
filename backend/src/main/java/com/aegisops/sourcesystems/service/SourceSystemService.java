package com.aegisops.sourcesystems.service;
import com.aegisops.audit.service.AuditService;
import com.aegisops.common.dto.PagedResponse;
import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import com.aegisops.common.enums.SourceSystemStatus;
import com.aegisops.common.exception.BusinessException;
import com.aegisops.common.exception.ErrorCode;
import com.aegisops.common.exception.ResourceNotFoundException;
import com.aegisops.sourcesystems.dto.request.CreateSourceSystemRequest;
import com.aegisops.sourcesystems.dto.request.UpdateSourceSystemRequest;
import com.aegisops.sourcesystems.dto.response.SourceSystemResponse;
import com.aegisops.sourcesystems.entity.SourceSystem;
import com.aegisops.sourcesystems.repository.SourceSystemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
/**
 * Domain service for source system management per FRD Section 4.3.
 * Slug is auto-derived from code: lowercase, spaces replaced with hyphens.
 */
@Slf4j
@Service
public class SourceSystemService {
    private final SourceSystemRepository repository;
    private final AuditService auditService;
    public SourceSystemService(SourceSystemRepository repository,
                               AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }
    @Transactional
    public SourceSystemResponse createSourceSystem(CreateSourceSystemRequest request) {
        String code = request.getCode().strip().toUpperCase();
        String slug = code.toLowerCase().replaceAll("[^a-z0-9]+", "-");
        if (repository.existsByCode(code)) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION,
                    "Source system with code '" + code + "' already exists");
        }
        if (repository.existsBySlug(slug)) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION,
                    "Source system with slug '" + slug + "' already exists");
        }
        SourceSystem entity = new SourceSystem();
        entity.setCode(code);
        entity.setName(request.getName().strip());
        entity.setSlug(slug);
        entity.setType(request.getType().strip());
        entity.setStatus(SourceSystemStatus.ACTIVE);
        entity.setTimezone(request.getTimezone());
        entity.setConfigJson(request.getConfigJson());
        SourceSystem saved = repository.save(entity);
        log.info("Source system created [id={}, slug={}]", saved.getId(), saved.getSlug());

        auditService.logAction(AuditEntityType.SOURCE_SYSTEM, saved.getId(), AuditAction.CREATE,
                "Created source system code=" + saved.getCode() + ", slug=" + saved.getSlug());

        return toResponse(saved);
    }
    @Transactional
    public SourceSystemResponse updateSourceSystem(UUID id, UpdateSourceSystemRequest request) {
        SourceSystem entity = findById(id);
        if (request.getName() != null) {
            entity.setName(request.getName().strip());
        }
        if (request.getTimezone() != null) {
            entity.setTimezone(request.getTimezone());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        if (request.getConfigJson() != null) {
            entity.setConfigJson(request.getConfigJson());
        }
        SourceSystem saved = repository.save(entity);
        log.info("Source system updated [id={}]", saved.getId());

        auditService.logAction(AuditEntityType.SOURCE_SYSTEM, saved.getId(), AuditAction.UPDATE,
                "Updated source system code=" + saved.getCode());

        return toResponse(saved);
    }
    @Transactional(readOnly = true)
    public PagedResponse<SourceSystemResponse> getSourceSystems(int page, int size) {
        Page<SourceSystem> result = repository.findAll(PageRequest.of(page - 1, size));
        List<SourceSystemResponse> items = result.getContent().stream()
                .map(this::toResponse)
                .toList();
        return PagedResponse.<SourceSystemResponse>builder()
                .page(page)
                .size(size)
                .totalItems(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .items(items)
                .build();
    }
    @Transactional(readOnly = true)
    public SourceSystemResponse getSourceSystemById(UUID id) {
        return toResponse(findById(id));
    }
    private SourceSystem findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SourceSystem", id.toString()));
    }
    private SourceSystemResponse toResponse(SourceSystem e) {
        return SourceSystemResponse.builder()
                .id(e.getId())
                .code(e.getCode())
                .name(e.getName())
                .slug(e.getSlug())
                .type(e.getType())
                .status(e.getStatus())
                .timezone(e.getTimezone())
                .configJson(e.getConfigJson())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}