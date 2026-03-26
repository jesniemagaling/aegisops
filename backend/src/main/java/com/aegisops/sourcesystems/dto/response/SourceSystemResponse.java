package com.aegisops.sourcesystems.dto.response;
import com.aegisops.common.enums.SourceSystemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SourceSystemResponse {
    private UUID id;
    private String code;
    private String name;
    private String slug;
    private String type;
    private SourceSystemStatus status;
    private String timezone;
    private Map<String, Object> configJson;
    private Instant createdAt;
    private Instant updatedAt;
}