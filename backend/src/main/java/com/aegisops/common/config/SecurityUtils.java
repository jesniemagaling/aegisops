package com.aegisops.common.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Stateless utility to extract the authenticated principal from
 * {@link SecurityContextHolder}.
 *
 * The JWT filter stores the userId as the principal and role-based
 * GrantedAuthority instances as authorities.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // utility class
    }

    /**
     * Returns the authenticated user's UUID, or empty if unauthenticated.
     */
    public static Optional<UUID> getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return Optional.empty();
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UUID uuid) {
            return Optional.of(uuid);
        }
        return Optional.empty();
    }

    /**
     * Returns role codes (without ROLE_ prefix) for the current user.
     */
    public static List<String> getCurrentUserRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return Collections.emptyList();
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .toList();
    }

    /**
     * Returns the authenticated user's UUID or throws if not authenticated.
     */
    public static UUID requireCurrentUserId() {
        return getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("No authenticated user in SecurityContext"));
    }
}

