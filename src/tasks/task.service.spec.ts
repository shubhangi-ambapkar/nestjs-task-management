import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { getRepositoryToken } from '@nestjs/typeorm'; // Helper to get the repository token
import { User } from '../auth/user.entity'; // Adjust as needed
import { TaskStatus } from './tasks.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotFoundException } from '@nestjs/common';

// Mock the task repository itself
const mockTaskRepository = () => ({
  getTaskById: jest.fn(),
});

const mockUser: User = {
  id: 'someID',
  username: 'TestUser',
  password: 'Testpassword',
  task: [],
};

describe('TasksService', () => {
  let taskService: TasksService;
  let taskRepository: Repository<Task>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task)); // Mock repository injection
  });

  const mockTask: Task = {
    id: 'task1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.OPEN,
    user: mockUser,
  };

  const mockTasks: Task[] = [
    {
      id: 'task1',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.OPEN,
      user: mockUser,
    },
  ];

  describe('getTasks', () => {
    it('should call getAllTasks and return the result', async () => {
      jest.spyOn(taskService, 'getAllTasks').mockResolvedValue(mockTasks);
      const result = await taskService.getAllTasks(mockUser);
      expect(taskService.getAllTasks).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('should call getTaskByID and return the result', async () => {
      jest.spyOn(taskService, 'getTaskById').mockResolvedValue(mockTask);
      const result = await taskService.getTaskById(mockTask.id, mockUser);
      expect(taskService.getTaskById).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('getTaskById', () => {
    it('Error to retrive task: getTaskByID', async () => {
      taskRepository.findOneBy = jest.fn().mockResolvedValue(null);
      expect(taskService.getTaskById('someID', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('call createTask and return results', async () => {
      const input: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      jest.spyOn(taskService, 'createTask').mockResolvedValue(mockTask);
      const result = await taskService.createTask(input, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTaskById', () => {
    it('call deleteTaskById and return true', async () => {
      jest.spyOn(taskService, 'deleteTaskById').mockResolvedValue(true);
      const result = await taskService.deleteTaskById(mockTask.id, mockUser);
      expect(result).toEqual(true);
    });
  });
});
