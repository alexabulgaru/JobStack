package backend.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(title = "JobStack API", version = "1.0", description = "Documentația API-ului pentru platforma de aplicare la joburi."),
    security = @SecurityRequirement(name = "bearerAuth") // Aplică securitatea pe toate endpoint-urile
)
@SecurityScheme(
    name = "bearerAuth",
    description = "Introdu token-ul JWT aici (fără cuvântul 'Bearer ' în față)",
    scheme = "bearer",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
