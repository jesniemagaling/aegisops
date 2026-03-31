package com.aegisops.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3 / Swagger configuration.
 *
 * <ul>
 *   <li>Bearer JWT security scheme added globally</li>
 *   <li>Swagger UI available at: http://localhost:8080/api/v1/swagger-ui.html</li>
 *   <li>OpenAPI JSON at:         http://localhost:8080/api/v1/v3/api-docs</li>
 *   <li>Server URL is auto-detected from server.servlet.context-path (/api/v1).
 *       Do NOT hardcode it here — that would double the prefix in Try-it-out calls.</li>
 * </ul>
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI aegisOpsOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                // servers() intentionally omitted — springdoc auto-detects context-path
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, jwtSecurityScheme())
                );
    }

    private Info apiInfo() {
        return new Info()
                .title("AegisOps API")
                .description("""
                        Enterprise Transaction Intelligence Platform.
                        
                        All protected endpoints require a valid JWT Bearer token.
                        Use **POST /auth/login** to obtain a token, then click **Authorize** above.
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("AegisOps Team")
                        .email("dev@aegisops.com"))
                .license(new License()
                        .name("Proprietary")
                        .url("https://aegisops.com"));
    }

    private SecurityScheme jwtSecurityScheme() {
        return new SecurityScheme()
                .name(SECURITY_SCHEME_NAME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Paste the JWT token obtained from POST /auth/login");
    }
}

