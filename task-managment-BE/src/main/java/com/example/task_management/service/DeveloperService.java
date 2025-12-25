package com.example.task_management.service;

import com.example.task_management.dto.DeveloperDTO;

import java.util.List;

public interface DeveloperService {
    List<DeveloperDTO> getAllDevelopers();
    DeveloperDTO getDeveloperById(Long id);
    DeveloperDTO createDeveloper(DeveloperDTO developerDTO);
    DeveloperDTO updateDeveloper(Long id, DeveloperDTO developerDTO);
    void deleteDeveloper(Long id);
    DeveloperDTO assignToProject(Long developerId, Long projectId);
    DeveloperDTO unassignFromProject(Long developerId);
    List<DeveloperDTO> getDevelopersByProjectId(Long projectId);
    List<DeveloperDTO> getUnassignedDevelopers();
}