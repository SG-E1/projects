/**
 * Storage Module - Handles all data persistence
 * Uses localStorage for simplicity, can be replaced with API calls
 */

const STORAGE_KEYS = {
    PROJECTS: 'pm_projects',
    TASKS: 'pm_tasks'
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {object} data - Data to be stored
 */
const saveData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
};

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @returns {object} - Parsed data or empty array if not found
 */
const loadData = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
};

/**
 * Projects CRUD Operations
 */
export const getProjects = () => loadData(STORAGE_KEYS.PROJECTS);

export const saveProject = (project) => {
    const projects = getProjects();
    if (project.id) {
        // Update existing project
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            projects[index] = project;
        }
    } else {
        // Add new project
        project.id = generateId();
        project.createdAt = new Date().toISOString();
        projects.push(project);
    }
    saveData(STORAGE_KEYS.PROJECTS, projects);
    return project;
};

export const deleteProject = (projectId) => {
    const projects = getProjects().filter(p => p.id !== projectId);
    saveData(STORAGE_KEYS.PROJECTS, projects);
    
    // Also delete associated tasks
    const tasks = getTasks().filter(t => t.projectId !== projectId);
    saveData(STORAGE_KEYS.TASKS, tasks);
};

/**
 * Tasks CRUD Operations
 */
export const getTasks = () => loadData(STORAGE_KEYS.TASKS);

export const getTasksByProject = (projectId) => {
    return getTasks().filter(task => task.projectId === projectId);
};

export const saveTask = (task) => {
    const tasks = getTasks();
    if (task.id) {
        // Update existing task
        const index = tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
            tasks[index] = task;
        }
    } else {
        // Add new task
        task.id = generateId();
        task.createdAt = new Date().toISOString();
        tasks.push(task);
    }
    saveData(STORAGE_KEYS.TASKS, tasks);
    return task;
};

export const deleteTask = (taskId) => {
    const tasks = getTasks().filter(t => t.id !== taskId);
    saveData(STORAGE_KEYS.TASKS, tasks);
};

/**
 * Generate a simple ID
 */
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initialize with sample data if empty
export const initializeSampleData = () => {
    if (getProjects().length === 0) {
        const sampleProjects = [
            {
                id: '1',
                name: 'Sitio Web Corporativo',
                description: 'Desarrollo del sitio web principal de la empresa',
                start: '2023-06-01',
                end: '2023-08-15',
                priority: 'high',
                createdAt: new Date('2023-05-20').toISOString()
            },
            {
                id: '2',
                name: 'App Móvil',
                description: 'Desarrollo de la aplicación móvil para clientes',
                start: '2023-07-01',
                end: '2023-09-30',
                priority: 'medium',
                createdAt: new Date('2023-06-15').toISOString()
            }
        ];
        saveData(STORAGE_KEYS.PROJECTS, sampleProjects);
    }

    if (getTasks().length === 0) {
        const sampleTasks = [
            {
                id: '1',
                projectId: '1',
                name: 'Diseño UI/UX',
                description: 'Crear wireframes y prototipos',
                start: '2023-06-01',
                end: '2023-06-10',
                priority: 'high',
                status: 'completed',
                createdAt: new Date('2023-05-20').toISOString()
            },
            {
                id: '2',
                projectId: '1',
                name: 'Desarrollo Frontend',
                description: 'Implementar interfaz de usuario',
                start: '2023-06-11',
                end: '2023-07-05',
                priority: 'high',
                status: 'in-progress',
                createdAt: new Date('2023-05-20').toISOString()
            },
            {
                id: '3',
                projectId: '2',
                name: 'Planificación de características',
                description: 'Definir las funcionalidades principales',
                start: '2023-07-01',
                end: '2023-07-07',
                priority: 'medium',
                status: 'pending',
                createdAt: new Date('2023-06-15').toISOString()
            }
        ];
        saveData(STORAGE_KEYS.TASKS, sampleTasks);
    }
};