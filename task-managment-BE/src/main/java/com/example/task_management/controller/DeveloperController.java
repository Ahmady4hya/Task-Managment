package com.example.task_management.controller;

import com.example.task_management.constants.DeveloperApiPaths;
import com.example.task_management.dto.DeveloperDTO;
import com.example.task_management.dto.TaskDTO;
import com.example.task_management.service.DeveloperService;
import com.example.task_management.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(DeveloperApiPaths.BASE)
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class DeveloperController {

    private final DeveloperService developerService;
    private final TaskService taskService;

    @GetMapping(DeveloperApiPaths.GET_ALL)
    public ResponseEntity<List<DeveloperDTO>> getAllDevelopers() {
        return ResponseEntity.ok(developerService.getAllDevelopers());
    }

    @GetMapping(DeveloperApiPaths.GET_BY_ID)
    public ResponseEntity<DeveloperDTO> getDeveloperById(@PathVariable Long id) {
        return ResponseEntity.ok(developerService.getDeveloperById(id));
    }

    @PostMapping(DeveloperApiPaths.CREATE)
    public ResponseEntity<DeveloperDTO> createDeveloper(@Valid @RequestBody DeveloperDTO developerDTO) {
        DeveloperDTO createdDeveloper = developerService.createDeveloper(developerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDeveloper);
    }

    @PutMapping(DeveloperApiPaths.UPDATE)
    public ResponseEntity<DeveloperDTO> updateDeveloper(
            @PathVariable Long id,
            @Valid @RequestBody DeveloperDTO developerDTO) {
        return ResponseEntity.ok(developerService.updateDeveloper(id, developerDTO));
    }

    @DeleteMapping(DeveloperApiPaths.DELETE)
    public ResponseEntity<Void> deleteDeveloper(@PathVariable Long id) {
        developerService.deleteDeveloper(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping(DeveloperApiPaths.ASSIGN_TO_PROJECT)
    public ResponseEntity<DeveloperDTO> assignToProject(
            @PathVariable Long id,
            @RequestParam Long projectId) {
        return ResponseEntity.ok(developerService.assignToProject(id, projectId));
    }

    @PatchMapping(DeveloperApiPaths.UNASSIGN_FROM_PROJECT)
    public ResponseEntity<DeveloperDTO> unassignFromProject(@PathVariable Long id) {
        return ResponseEntity.ok(developerService.unassignFromProject(id));
    }

    @GetMapping(DeveloperApiPaths.GET_UNASSIGNED)
    public ResponseEntity<List<DeveloperDTO>> getUnassignedDevelopers() {
        return ResponseEntity.ok(developerService.getUnassignedDevelopers());
    }

    @GetMapping(DeveloperApiPaths.GET_TASKS)
    public ResponseEntity<List<TaskDTO>> getDeveloperTasks(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTasksByDeveloperId(id));
    }
}