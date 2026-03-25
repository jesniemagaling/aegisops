package com.aegisops.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Servlet filter that establishes full request traceability context.
 *
 * <p>On every inbound request, this filter:
 * <ol>
 *   <li>Reads the {@code X-Request-ID} header, or generates a UUID if absent/blank.</li>
 *   <li>Populates SLF4J MDC with three keys so every log line emitted during
 *       the request automatically carries them:
 *       <ul>
 *         <li>{@code requestId} — unique trace identifier</li>
 *         <li>{@code method}    — HTTP method (GET, POST, PATCH…)</li>
 *         <li>{@code path}      — request URI path</li>
 *       </ul>
 *   </li>
 *   <li>Echoes {@code requestId} back to the caller via the
 *       {@code X-Request-ID} response header.</li>
 *   <li>Unconditionally clears MDC in a {@code finally} block to prevent
 *       context leaks in thread-pool environments.</li>
 * </ol>
 *
 * <p>Runs at {@link Ordered#HIGHEST_PRECEDENCE} so the context is available
 * before Spring Security and all other filters execute.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

    public static final String REQUEST_ID_KEY = "requestId";
    public static final String METHOD_KEY     = "method";
    public static final String PATH_KEY       = "path";

    private static final String REQUEST_ID_HEADER = "X-Request-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String requestId = request.getHeader(REQUEST_ID_HEADER);
            if (requestId == null || requestId.isBlank()) {
                requestId = UUID.randomUUID().toString();
            }

            MDC.put(REQUEST_ID_KEY, requestId);
            MDC.put(METHOD_KEY,     request.getMethod());
            MDC.put(PATH_KEY,       request.getRequestURI());

            response.setHeader(REQUEST_ID_HEADER, requestId);

            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}

