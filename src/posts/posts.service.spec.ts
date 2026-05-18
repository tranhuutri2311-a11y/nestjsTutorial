import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { AuthenticatedUser } from '../auth/interfaces';
import { UserRole } from '../auth/enums';

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  const author: AuthenticatedUser = {
    sub: 'author-1',
    username: 'author',
    role: UserRole.USER,
    permissions: [],
  };

  beforeEach(async () => {
    postRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: postRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('allows authors to update their own posts', async () => {
    const post = { id: 'post-1', authorId: author.sub, title: 'Old' };
    const updateDto = { title: 'New' };
    postRepository.findOne.mockResolvedValue(post);
    postRepository.save.mockImplementation((value) => Promise.resolve(value));

    await expect(
      service.update('post-1', updateDto, author),
    ).resolves.toMatchObject(updateDto);
  });

  it('rejects non-authors when updating posts', async () => {
    postRepository.findOne.mockResolvedValue({
      id: 'post-1',
      authorId: 'other-user',
    });

    await expect(service.update('post-1', {}, author)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
