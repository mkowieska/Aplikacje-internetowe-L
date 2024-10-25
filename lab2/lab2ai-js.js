class To_Do_List {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.render();
        document.getElementById('add-task-btn').addEventListener('click', () => this.addTask());
        document.getElementById('search-bar').addEventListener('input', (e) => this.searchTasks(e.target.value));

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.task-item') && !event.target.classList.contains('save-task-btn')) {
                this.tasks.forEach(task => {
                    const taskElement = document.querySelector(`[data-id="${task.id}"] .task-name`);
                    if (taskElement && taskElement.contentEditable === 'true') {
                        this.saveChanges(task.id);
                    }
                });
            }
        });
    }

    addTask() {
        const taskInput = document.getElementById('task-input').value.trim();
        const taskDeadline = document.getElementById('task-deadline').value;

        if (taskInput.length < 3 || taskInput.length > 255) {
            alert('Task must be between 3 and 255 characters.');
            return;
        }

        const task = {
            id: Date.now(),
            name: taskInput,
            deadline: taskDeadline ? new Date(taskDeadline).toLocaleString() : 'No deadline',
            completed: false
        };

        this.tasks.push(task);
        this.updateLocalStorage();
        this.render();
        document.getElementById('task-input').value = '';
        document.getElementById('task-deadline').value = '';
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.updateLocalStorage();
        this.render();
    }

    editTask(id) {
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        const taskNameElement = taskItem.querySelector('.task-name');
        const taskDeadlineElement = taskItem.querySelector('.task-deadline');

        taskNameElement.contentEditable = true;
        taskNameElement.focus();

        const task = this.tasks.find(task => task.id === id);
        const formattedDeadline = task.deadline && task.deadline !== 'No deadline'
            ? this.formatDateForInput(task.deadline)
            : '';

        taskDeadlineElement.innerHTML = `
            <input type="datetime-local" value="${formattedDeadline}"/>
            <button class="save-task-btn" onclick="todo.saveChanges(${id})">Save</button>
        `;
    }

    saveChanges(id) {
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        const taskNameElement = taskItem.querySelector('.task-name');
        const taskDeadlineElement = taskItem.querySelector('.task-deadline input');

        const updatedName = taskNameElement.textContent.trim();
        const updatedDeadline = taskDeadlineElement.value;

        if (updatedName.length < 3 || updatedName.length > 255) {
            alert('Task must be between 3 and 255 characters.');
            this.render();
            return;
        }

        const task = this.tasks.find(task => task.id === id);
        task.name = updatedName;
        task.deadline = updatedDeadline ? new Date(updatedDeadline).toLocaleString() : 'No deadline';

        taskNameElement.contentEditable = false;

        const saveButton = taskItem.querySelector('.save-task-btn');
        if (saveButton) saveButton.remove();

        this.updateLocalStorage();
        this.render();
    }

    formatDateForInput(deadline) {
        const date = new Date(deadline);
        return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
    }

    searchTasks(term) {
        this.searchTerm = term.toLowerCase();
        this.render();
    }

    updateLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    render() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';

        const filteredTasks = this.tasks.filter(task => task.name.toLowerCase().includes(this.searchTerm));

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');
            taskItem.setAttribute('data-id', task.id);

            taskItem.innerHTML = `
                <span class="task-name" onclick="todo.editTask(${task.id})">${task.name}</span>
                <span class="task-deadline">${task.deadline}</span>
                <button class="delete-task-btn" onclick="todo.deleteTask(${task.id})">Delete</button>
            `;

            taskList.appendChild(taskItem);
        });
    }
}

const todo = new To_Do_List();
