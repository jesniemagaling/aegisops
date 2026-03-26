package com.aegisops.sourcesystems.dto.request;
import jakarta.validation.constraints.NotBlank;
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
public class CreateSourceSystemRequest {
    @NotBlank(message = "Code is required")
    @Size(max = 100)
    private String code;
    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;
    @NotBlank(message = "Type is required")
    @Size(max = 100)
    private String type;
    @Size(max = 100)
    private String timezone;
    private Map<String, Object> configJson;
}