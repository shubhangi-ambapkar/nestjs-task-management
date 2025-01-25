import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './tasks.model';
import { TaskStatus } from './tasks.model';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-task-filter.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskWithFilters(filterDto: GetTasksFilterDto): Task[] {
    const { status, search } = filterDto;
    let tasks = this.getAllTasks();
    if (status) {
      tasks = this.tasks.filter((task) => task.status === status);
    }

    if (search) {
      tasks = this.tasks.filter((task) => {
        if (task.title.includes(search) || task.description.includes(search)) {
          return true;
        }
        return false;
      });
    }

    return tasks;
  }

  getTaskByID(id: string): Task {
    const found = this.tasks.find((task) => task.id === id);
    if (!found) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }
    return found;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };
    this.tasks.push(task);
    return task;
  }

  updateTaskById(id: string, updateTaskDto: UpdateTaskDto): Task {
    const { status } = updateTaskDto;
    this.tasks
      .filter((task) => task.id === id)
      .map((task) => (task.status = status));

    return this.getTaskByID(id);
  }

  deleteTaskById(id: string): Task[] {
    const taskTobeDeleted = this.tasks.findIndex((task) => task.id === id);
    if (taskTobeDeleted < 0) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }
    return this.tasks.splice(taskTobeDeleted, 1);
  }
}
