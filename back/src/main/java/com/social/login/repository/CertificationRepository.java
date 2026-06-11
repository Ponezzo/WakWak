package com.social.login.repository;

import com.social.login.entity.CertificationEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificationRepository extends JpaRepository<CertificationEntity,String> {

    CertificationEntity findByUsername(String username);

    @Transactional
    void deleteByUsername(String username);
}
