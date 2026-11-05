package com.repomind.repository;

import com.repomind.entity.RepositoryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RepositoryRecordRepository
        extends JpaRepository<RepositoryRecord, Long> {

    Optional<RepositoryRecord> findByRepositoryUrl(String repositoryUrl);
}