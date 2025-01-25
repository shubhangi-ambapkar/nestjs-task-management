import { IsEnum } from 'class-validator';
import { TaskStatus } from '../tasks.model';

export class UpdateTaskDto {
  id: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;
}
