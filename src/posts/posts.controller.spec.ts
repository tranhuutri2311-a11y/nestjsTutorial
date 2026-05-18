import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { UserRole } from '../auth/enums';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: jest.Mocked<PostsService>;

  beforeEach(async () => {
    postsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      deletePost: jest.fn(),
    } as unknown as jest.Mocked<PostsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: postsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the authenticated user to post updates', () => {
    const user = {
      sub: 'user-1',
      username: 'author',
      role: UserRole.USER,
      permissions: [],
    };
    const updateDto = { title: 'Updated title' };

    void controller.update('post-1', updateDto, { user });

    expect(postsService.update.mock.calls[0]).toEqual([
      'post-1',
      updateDto,
      user,
    ]);
  });
});
