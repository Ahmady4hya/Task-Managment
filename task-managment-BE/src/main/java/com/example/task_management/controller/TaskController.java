package com.example.task_management.controller;

import com.example.task_management.constants.TaskApiPaths;
import com.example.task_management.constants.TaskStatus;
import com.example.task_management.dto.TaskDTO;
import com.example.task_management.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(TaskApiPaths.BASE)
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TaskController {

    private final TaskService taskService;

    @GetMapping(TaskApiPaths.GET_ALL)
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping(TaskApiPaths.GET_BY_ID)
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping(TaskApiPaths.CREATE)
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody TaskDTO taskDTO) {
        TaskDTO createdTask = taskService.createTask(taskDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    @PutMapping(TaskApiPaths.UPDATE)
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDTO));
    }

    @DeleteMapping(TaskApiPaths.DELETE)
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping(TaskApiPaths.UPDATE_STATUS)
    public ResponseEntity<TaskDTO> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }

    @PatchMapping(TaskApiPaths.ASSIGN_TO_DEVELOPER)
    public ResponseEntity<TaskDTO> assignTaskToDeveloper(
            @PathVariable Long id,
            @RequestParam Long developerId) {
        return ResponseEntity.ok(taskService.assignTaskToDeveloper(id, developerId));
    }

    @PatchMapping(TaskApiPaths.UNASSIGN)
    public ResponseEntity<TaskDTO> unassignTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.unassignTask(id));
    }

    @GetMapping(TaskApiPaths.GET_BY_STATUS)
    public ResponseEntity<List<TaskDTO>> getTasksByStatus(@PathVariable TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }
}