import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum PostStatus {
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  excerpt?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  thumbnail?: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isFeatured: boolean;

  @Column({
    type: 'varchar',
    default: 'published',
  })
  status: PostStatus;

  // Foreign key
  @Column()
  authorId: string;

  // Relation
  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
