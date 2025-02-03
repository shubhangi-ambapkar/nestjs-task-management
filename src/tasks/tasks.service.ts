import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './tasks.model';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-task-filter.dto';
import { User } from 'src/auth/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class TasksService {
  private logger = new Logger('TaskService');
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  getAllTasks(user: User): Promise<Task[]> {
    return this.taskRepo.findBy({ user: user });
  }

  async getTaskWithFilters(
    filterDto: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.taskRepo
      .createQueryBuilder('task')
      .andWhere('task.user = :user', { user: user.id });
    if (status) {
      await query.andWhere('task.status = :status', { status: status });
    }

    if (search) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    try {
      const tasks = query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed in retriving tasks for User "${user.username}"`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.taskRepo.findOneBy({ id: id, user: user });
    if (!found) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.taskRepo.create({
      title: title,
      description: description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.taskRepo.save(task);
    return task;
  }

  async updateTaskById(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const { status } = updateTaskDto;
    const task = await this.getTaskById(id, user);
    task.status = status;
    await this.taskRepo.save(task);
    return task;
  }

  async deleteTaskById(id: string, user: User): Promise<boolean> {
    const taskTobeDeleted = await this.taskRepo.delete({ id, user });
    if (taskTobeDeleted.affected === 0) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }
    return true;
  }
}
