/**
 * Projects Module - Handles all project-related functionality
 */

import { getProjects, saveProject, deleteProject, initializeSampleData } from './storage.js';
import { renderProjectsList, renderRecentProjects } from './ui.js';
import { updateDashboardStats } from './analytics.js';

// Initialize sample data if storage is empty
initializeSampleData();

// DOM Elements
const projectsList = document.getElementById('projects-list');
const projectForm = document.getElementById('project-form');
const projectFormContainer = document.getElementById('project-form-container');
const addProjectBtn = document.getElementById('add-project-btn');
const cancelProjectBtn = document.getElementById('cancel-project-btn');

// Form fields
const projectName = document.getElementById('project-name');
const projectDescription = document.getElementById('project-description');
const projectStart = document.getElementById('project-start');
const projectEnd = document.getElementById('project-end');
const projectPriority = document.getElementById('project-priority');

let currentProjectId = null;

// Event Listeners
addProjectBtn.addEventListener('click', () => {
    currentProjectId = null;
    projectForm.reset();
    projectFormContainer.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

cancelProjectBtn.addEventListener('click', () => {
    projectFormContainer.style.display = 'none';
});

projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProjectForm();
});

// Functions
export const loadProjects = () => {
    const projects = getProjects();
    renderProjectsList(projects);
    renderRecentProjects(projects.slice(0, 3));
    updateDashboardStats();
};

const saveProjectForm = () => {
    const project = {
        id: currentProjectId,
        name: projectName.value.trim(),
        description: projectDescription.value.trim(),
        start: projectStart.value,
        end: projectEnd.value,
        priority: projectPriority.value
    };

    saveProject(project);
    projectFormContainer.style.display = 'none';
    loadProjects();
};

export const editProject = (projectId) => {
    const project = getProjects().find(p => p.id === projectId);
    if (project) {
        currentProjectId = project.id;
        projectName.value = project.name;
        projectDescription.value = project.description;
        projectStart.value = project.start;
        projectEnd.value = project.end;
        projectPriority.value = project.priority;
        projectFormContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

export const removeProject = (projectId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto? También se eliminarán todas sus tareas.')) {
        deleteProject(projectId);
        loadProjects();
    }
};

// Initialize
loadProjects();