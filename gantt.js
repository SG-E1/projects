/**
 * Tasks Module - Handles all task-related functionality
 */

import { getProjects, getTasks, getTasksByProject, saveTask, deleteTask } from './storage.js';
import { renderTasksList, updateProjectFilter } from './ui.js';
import { updateDashboardStats, updateGanttChart } from './analytics.js';

// DOM Elements
const tasksList = document.getElementById('tasks-list');
const taskForm = document.getElementById('task-form');
const taskFormContainer = document.getElementById('task-form-container');
const addTaskBtn = document.getElementById('add-task-btn');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const projectFilter = document.getElementById('project-filter');

// Form fields
const taskProject = document.getElementById('task-project');
const taskName = document.getElementById('task-name');
const taskDescription = document.getElementById('task-description');
const taskStart = document.getElementById('task-start');
const taskEnd = document.getElementById('task-end');
const taskPriority = document.getElementById('task-priority');
const taskStatus = document.getElementById('task-status');

let currentTaskId = null;

// Event Listeners
addTaskBtn.addEventListener('click', () => {
    currentTaskId = null;
    taskForm.reset();
    taskFormContainer.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

cancelTaskBtn.addEventListener('click', () => {
    taskFormContainer.style.display = 'none';
});

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveTaskForm();
});

projectFilter.addEventListener('change', () => {
    loadTasks();
});

// Functions
export const loadTasks = () => {
    const projectId = projectFilter.value;
    let tasks = projectId ? getTasksByProject(projectId) : getTasks();
    
    // Sort by due date and priority
    tasks.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        const dateA = new Date(a.end);
        const dateB = new Date(b.end);
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    renderTasksList(tasks);
    updateDashboardStats();
    updateGanttChart();
};

const saveTaskForm = () => {
    const task = {
        id: currentTaskId,
        projectId: taskProject.value,
        name: taskName.value.trim(),
        description: taskDescription.value.trim(),
        start: taskStart.value,
        end: taskEnd.value,
        priority: taskPriority.value,
        status: taskStatus.value
    };

    saveTask(task);
    taskFormContainer.style.display = 'none';
    loadTasks();
};

export const editTask = (taskId) => {
    const task = getTasks().find(t => t.id === taskId);
    if (task) {
        currentTaskId = task.id;
        taskProject.value = task.projectId;
        taskName.value = task.name;
        taskDescription.value = task.description;
        taskStart.value = task.start;
        taskEnd.value = task.end;
        taskPriority.value = task.priority;
        taskStatus.value = task.status;
        taskFormContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

export const removeTask = (taskId) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        deleteTask(taskId);
        loadTasks();
    }
};

export const toggleTaskStatus = (taskId) => {
    const task = getTasks().find(t => t.id === taskId);
    if (task) {
        if (task.status === 'completed') {
            task.status = 'pending';
        } else {
            task.status = 'completed';
        }
        saveTask(task);
        loadTasks();
    }
};

export const updateTaskProjectOptions = () => {
    const projects = getProjects();
    taskProject.innerHTML = '<option value="">Seleccione un proyecto</option>';
    projectFilter.innerHTML = '<option value="">Todos los proyectos</option>';
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        taskProject.appendChild(option.cloneNode(true));
        projectFilter.appendChild(option);
    });
};

// Initialize
updateTaskProjectOptions();
loadTasks();