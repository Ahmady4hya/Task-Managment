package com.example.task_management.repository;

import com.example.task_management.model.Developer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeveloperRepository extends JpaRepository<Developer, Long> {
    Optional<Developer> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Developer> findByProjectId(Long projectId);
    List<Developer> findByProjectIsNull();
}