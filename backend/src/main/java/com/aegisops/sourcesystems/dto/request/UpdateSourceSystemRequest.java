package com.aegisops.sourcesystems.dto.request;
import com.aegisops.common.enums.SourceSystemStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Map;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSourceSystemRequest {
    @Size(max = 255)
    private String name;
    @Size(max = 100)
    private String timezone;
    private SourceSystemStatus status;
    private Map<String, Object> configJson;
}