package com.example.task_management.controller;

import com.example.task_management.constants.ProjectApiPaths;
import com.example.task_management.dto.DeveloperDTO;
import com.example.task_management.dto.ProjectDTO;
import com.example.task_management.dto.TaskDTO;
import com.example.task_management.service.DeveloperService;
import com.example.task_management.service.ProjectService;
import com.example.task_management.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ProjectApiPaths.BASE)
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService;
    private final DeveloperService developerService;

    @GetMapping(ProjectApiPaths.GET_ALL)
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping(ProjectApiPaths.GET_BY_ID)
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping(ProjectApiPaths.CREATE)
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody ProjectDTO projectDTO) {
        ProjectDTO createdProject = projectService.createProject(projectDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }

    @PutMapping(ProjectApiPaths.UPDATE)
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectDTO projectDTO) {
        return ResponseEntity.ok(projectService.updateProject(id, projectDTO));
    }

    @DeleteMapping(ProjectApiPaths.DELETE)
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(ProjectApiPaths.GET_TASKS)
    public ResponseEntity<List<TaskDTO>> getProjectTasks(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(id));
    }

    @GetMapping(ProjectApiPaths.GET_DEVELOPERS)
    public ResponseEntity<List<DeveloperDTO>> getProjectDevelopers(@PathVariable Long id) {
        return ResponseEntity.ok(developerService.getDevelopersByProjectId(id));
    }
}