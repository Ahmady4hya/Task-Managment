package com.example.task_management.service;

import com.example.task_management.constants.TaskStatus;
import com.example.task_management.dto.TaskDTO;

import java.util.List;

public interface TaskService {
    List<TaskDTO> getAllTasks();
    TaskDTO getTaskById(Long id);
    TaskDTO createTask(TaskDTO taskDTO);
    TaskDTO updateTask(Long id, TaskDTO taskDTO);
    void deleteTask(Long id);
    TaskDTO updateTaskStatus(Long id, TaskStatus status);
    TaskDTO assignTaskToDeveloper(Long taskId, Long developerId);
    TaskDTO unassignTask(Long taskId);
    List<TaskDTO> getTasksByProjectId(Long projectId);
    List<TaskDTO> getTasksByDeveloperId(Long developerId);
    List<TaskDTO> getTasksByStatus(TaskStatus status);
}