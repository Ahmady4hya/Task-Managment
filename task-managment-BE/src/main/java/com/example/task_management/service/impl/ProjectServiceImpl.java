package com.example.task_management.service.impl;

import com.example.task_management.dto.ProjectDTO;
import com.example.task_management.exception.BadRequestException;
import com.example.task_management.exception.ResourceNotFoundException;
import com.example.task_management.model.Project;
import com.example.task_management.repository.ProjectRepository;
import com.example.task_management.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return convertToDTO(project);
    }

    @Override
    @Transactional
    public ProjectDTO createProject(ProjectDTO projectDTO) {
        if (projectRepository.existsByName(projectDTO.getName())) {
            throw new BadRequestException("Project with name '" + projectDTO.getName() + "' already exists");
        }

        Project project = new Project();
        project.setName(projectDTO.getName());
        project.setDescription(projectDTO.getDescription());

        Project savedProject = projectRepository.save(project);
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO projectDTO) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Check if name is being changed and if new name already exists
        if (!project.getName().equals(projectDTO.getName()) && 
            projectRepository.existsByName(projectDTO.getName())) {
            throw new BadRequestException("Project with name '" + projectDTO.getName() + "' already exists");
        }

        project.setName(projectDTO.getName());
        project.setDescription(projectDTO.getDescription());

        Project updatedProject = projectRepository.save(project);
        return convertToDTO(updatedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setDeveloperCount(project.getDevelopers() != null ? project.getDevelopers().size() : 0);
        dto.setTaskCount(project.getTasks() != null ? project.getTasks().size() : 0);
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }
}