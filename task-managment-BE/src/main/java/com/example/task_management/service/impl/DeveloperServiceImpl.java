package com.example.task_management.service.impl;

import com.example.task_management.dto.DeveloperDTO;
import com.example.task_management.exception.BadRequestException;
import com.example.task_management.exception.ResourceNotFoundException;
import com.example.task_management.model.Developer;
import com.example.task_management.model.Project;
import com.example.task_management.repository.DeveloperRepository;
import com.example.task_management.repository.ProjectRepository;
import com.example.task_management.service.DeveloperService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeveloperServiceImpl implements DeveloperService {

    private final DeveloperRepository developerRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DeveloperDTO> getAllDevelopers() {
        return developerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DeveloperDTO getDeveloperById(Long id) {
        Developer developer = developerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + id));
        return convertToDTO(developer);
    }

    @Override
    @Transactional
    public DeveloperDTO createDeveloper(DeveloperDTO developerDTO) {
        if (developerRepository.existsByEmail(developerDTO.getEmail())) {
            throw new BadRequestException("Developer with email '" + developerDTO.getEmail() + "' already exists");
        }

        Developer developer = new Developer();
        developer.setName(developerDTO.getName());
        developer.setEmail(developerDTO.getEmail());
        developer.setRole(developerDTO.getRole());

        // Optionally assign to project during creation
        if (developerDTO.getProjectId() != null) {
            Project project = projectRepository.findById(developerDTO.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + developerDTO.getProjectId()));
            developer.setProject(project);
        }

        Developer savedDeveloper = developerRepository.save(developer);
        return convertToDTO(savedDeveloper);
    }

    @Override
    @Transactional
    public DeveloperDTO updateDeveloper(Long id, DeveloperDTO developerDTO) {
        Developer developer = developerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + id));

        // Check if email is being changed and if new email already exists
        if (!developer.getEmail().equals(developerDTO.getEmail()) && 
            developerRepository.existsByEmail(developerDTO.getEmail())) {
            throw new BadRequestException("Developer with email '" + developerDTO.getEmail() + "' already exists");
        }

        developer.setName(developerDTO.getName());
        developer.setEmail(developerDTO.getEmail());
        developer.setRole(developerDTO.getRole());

        Developer updatedDeveloper = developerRepository.save(developer);
        return convertToDTO(updatedDeveloper);
    }

    @Override
    @Transactional
    public void deleteDeveloper(Long id) {
        if (!developerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Developer not found with id: " + id);
        }
        developerRepository.deleteById(id);
    }

    @Override
    @Transactional
    public DeveloperDTO assignToProject(Long developerId, Long projectId) {
        Developer developer = developerRepository.findById(developerId)
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + developerId));

        if (developer.getProject() != null) {
            throw new BadRequestException("Developer is already assigned to project: " + developer.getProject().getName());
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        developer.setProject(project);
        Developer updatedDeveloper = developerRepository.save(developer);
        return convertToDTO(updatedDeveloper);
    }

    @Override
    @Transactional
    public DeveloperDTO unassignFromProject(Long developerId) {
        Developer developer = developerRepository.findById(developerId)
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + developerId));

        if (developer.getProject() == null) {
            throw new BadRequestException("Developer is not assigned to any project");
        }

        developer.setProject(null);
        Developer updatedDeveloper = developerRepository.save(developer);
        return convertToDTO(updatedDeveloper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeveloperDTO> getDevelopersByProjectId(Long projectId) {
        return developerRepository.findByProjectId(projectId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeveloperDTO> getUnassignedDevelopers() {
        return developerRepository.findByProjectIsNull().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private DeveloperDTO convertToDTO(Developer developer) {
        DeveloperDTO dto = new DeveloperDTO();
        dto.setId(developer.getId());
        dto.setName(developer.getName());
        dto.setEmail(developer.getEmail());
        dto.setRole(developer.getRole());
        dto.setProjectId(developer.getProject() != null ? developer.getProject().getId() : null);
        dto.setProjectName(developer.getProject() != null ? developer.getProject().getName() : null);
        dto.setTaskCount(developer.getTasks() != null ? developer.getTasks().size() : 0);
        dto.setCreatedAt(developer.getCreatedAt());
        return dto;
    }
}