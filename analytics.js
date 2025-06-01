/**
 * Analytics Module - Handles performance tracking and reporting
 */

import { getProjects, getTasks } from './storage.js';

// DOM Elements
const activeProjectsEl = document.getElementById('active-projects');
const pendingTasksEl = document.getElementById('pending-tasks');
const productivityIndexEl = document.getElementById('productivity-index');
const completionRateEl = document.getElementById('completion-rate');
const timeEfficiencyEl = document.getElementById('time-efficiency');
const overallScoreEl = document.getElementById('overall-score');
const overdueTasksList = document.getElementById('overdue-tasks-list');

// Chart instances
let progressChart = null;
let tasksDistributionChart = null;

// Functions
export const updateDashboardStats = () => {
    const projects = getProjects();
    const tasks = getTasks();
    
    // Active projects count
    const activeProjects = projects.length;
    activeProjectsEl.textContent = activeProjects;
    
    // Pending tasks count
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    pendingTasksEl.textContent = pendingTasks;
    
    // Productivity index (simple version)
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const productivityIndex = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    productivityIndexEl.textContent = `${productivityIndex}%`;
    
    // Update analytics section
    updateCompletionRate(completedTasks, totalTasks);
    updateTimeEfficiency(tasks);
    updateOverallScore(projects, tasks);
    updateOverdueTasks(tasks);
    updateCharts(projects, tasks);
};

const updateCompletionRate = (completed, total) => {
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    completionRateEl.textContent = `${rate}%`;
};

const updateTimeEfficiency = (tasks) => {
    if (tasks.length === 0) {
        timeEfficiencyEl.textContent = '0%';
        return;
    }
    
    let totalEfficiency = 0;
    let count = 0;
    
    tasks.forEach(task => {
        if (task.status === 'completed' && task.start && task.end) {
            const plannedDays = (new Date(task.end) - new Date(task.start)) / (1000 * 60 * 60 * 24);
            const actualDays = (new Date() - new Date(task.start)) / (1000 * 60 * 60 * 24);
            
            if (plannedDays > 0 && actualDays > 0) {
                const efficiency = Math.min(100, Math.round((plannedDays / actualDays) * 100));
                totalEfficiency += efficiency;
                count++;
            }
        }
    });
    
    const avgEfficiency = count > 0 ? Math.round(totalEfficiency / count) : 0;
    timeEfficiencyEl.textContent = `${avgEfficiency}%`;
};

const updateOverallScore = (projects, tasks) => {
    if (projects.length === 0 || tasks.length === 0) {
        overallScoreEl.textContent = '0';
        return;
    }
    
    // Completion rate (50% weight)
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    
    // Time efficiency (30% weight)
    let timeEfficiency = 0;
    let efficiencyCount = 0;
    
    tasks.forEach(task => {
        if (task.status === 'completed' && task.start && task.end) {
            const plannedDays = (new Date(task.end) - new Date(task.start)) / (1000 * 60 * 60 * 24);
            const actualDays = (new Date() - new Date(task.start)) / (1000 * 60 * 60 * 24);
            
            if (plannedDays > 0 && actualDays > 0) {
                const efficiency = Math.min(1, plannedDays / actualDays);
                timeEfficiency += efficiency;
                efficiencyCount++;
            }
        }
    });
    
    const avgTimeEfficiency = efficiencyCount > 0 ? (timeEfficiency / efficiencyCount) : 0;
    
    // Priority completion (20% weight)
    const highPriorityTasks = tasks.filter(t => t.priority === 'high');
    const completedHighPriority = highPriorityTasks.filter(t => t.status === 'completed').length;
    const priorityScore = highPriorityTasks.length > 0 ? (completedHighPriority / highPriorityTasks.length) : 1;
    
    // Calculate overall score (0-100)
    const overallScore = Math.round(
        (completionRate * 0.5 + avgTimeEfficiency * 0.3 + priorityScore * 0.2) * 100
    );
    
    overallScoreEl.textContent = overallScore;
};

const updateOverdueTasks = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = tasks.filter(task => {
        if (task.status === 'completed') return false;
        
        const dueDate = new Date(task.end);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate < today;
    });
    
    // Sort by how overdue they are
    overdueTasks.sort((a, b) => {
        const dateA = new Date(a.end);
        const dateB = new Date(b.end);
        return dateA - dateB;
    });
    
    // Render list
    overdueTasksList.innerHTML = '';
    
    if (overdueTasks.length === 0) {
        overdueTasksList.innerHTML = '<p class="no-tasks">No hay tareas atrasadas 🎉</p>';
        return;
    }
    
    overdueTasks.forEach(task => {
        const project = getProjects().find(p => p.id === task.projectId);
        const dueDate = new Date(task.end);
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        
        const taskEl = document.createElement('div');
        taskEl.className = 'overdue-task-item';
        taskEl.innerHTML = `
            <div>
                <strong>${task.name}</strong>
                <span>${project?.name || 'Sin proyecto'}</span>
            </div>
            <span class="overdue-days">${daysOverdue} días</span>
        `;
        
        overdueTasksList.appendChild(taskEl);
    });
};

const updateCharts = (projects, tasks) => {
    updateProgressChart(tasks);
    updateTasksDistributionChart(projects, tasks);
};

const updateProgressChart = (tasks) => {
    const ctx = document.getElementById('progress-chart');
    
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completadas', 'En Progreso', 'Pendientes'],
            datasets: [{
                data: [completed, inProgress, pending],
                backgroundColor: [
                    '#2ecc71',
                    '#3498db',
                    '#f39c12'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
};

const updateTasksDistributionChart = (projects, tasks) => {
    const ctx = document.getElementById('tasks-distribution-chart');
    
    // Group tasks by project
    const projectData = projects.map(project => {
        return {
            name: project.name,
            count: tasks.filter(t => t.projectId === project.id).length
        };
    });
    
    // Add "No project" category
    const noProjectCount = tasks.filter(t => !t.projectId).length;
    if (noProjectCount > 0) {
        projectData.push({
            name: 'Sin proyecto',
            count: noProjectCount
        });
    }
    
    if (tasksDistributionChart) {
        tasksDistributionChart.destroy();
    }
    
    tasksDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: projectData.map(p => p.name),
            datasets: [{
                label: 'Tareas por Proyecto',
                data: projectData.map(p => p.count),
                backgroundColor: '#3498db',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
};

// Initialize
updateDashboardStats();