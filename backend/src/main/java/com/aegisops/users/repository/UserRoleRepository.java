package com.aegisops.users.repository;
import com.aegisops.users.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
/**
 * Provides direct query access to user_roles rows.
 * Write operations are handled through User.userRoles (CascadeType.ALL).
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
    List<UserRole> findByUser_Id(UUID userId);
}
