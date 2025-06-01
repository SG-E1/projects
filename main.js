/**
 * Main Application Module - Coordinates all other modules
 */

import { loadProjects } from './projects.js';
import { loadTasks, updateTaskProjectOptions } from './tasks.js';
import { updateGanttChart, updateGanttProjectFilter } from './gantt.js';
import { updateDashboardStats } from './analytics.js';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const navItems = document.querySelectorAll('.sidebar li');
const contentSections = document.querySelectorAll('.content-section');

// Event Listeners
themeToggle.addEventListener('click', toggleTheme);

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.getAttribute('data-section');
        showSection(sectionId);
        
        // Update active nav item
        navItems.forEach(navItem => navItem.classList.remove('active'));
        item.classList.add('active');
    });
});

// Functions
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function showSection(sectionId) {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialize
loadTheme();
loadProjects();
loadTasks();
updateTaskProjectOptions();
updateGanttProjectFilter();
updateDashboardStats();

// Show dashboard by default
showSection('dashboard');