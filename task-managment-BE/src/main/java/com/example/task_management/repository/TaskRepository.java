package com.example.task_management.repository;

import com.example.task_management.constants.TaskStatus;
import com.example.task_management.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(Long developerId);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);
}