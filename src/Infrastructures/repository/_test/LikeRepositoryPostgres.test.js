const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const Like = require('../../../Domains/likes/entities/Like');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('toggleLike function', () => {
    it('should add like correctly when user doesn\'t like it yet', async () => {
      // Arrange
      const like = new Like({
        userId: 'user-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.toggleLike(like);

      // Assert
      const reply = await LikesTableTestHelper.findLikeById('like-123');
      expect(reply).toHaveLength(1);
    });

    it('should delete like correctly when user already like it', async () => {
      // Arrange
      const like = new Like({
        userId: 'user-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => {});

      // Action
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      await likeRepositoryPostgres.toggleLike(like);

      // Assert
      const reply = await LikesTableTestHelper.findLikeById('like-123');
      expect(reply).toHaveLength(0);
    });
  });

  describe('getLikeCount function', () => {
    it('should return comment like count correctly', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const comment = await likeRepositoryPostgres.getLikeCount('comment-123');
      expect(comment).toStrictEqual(1);
    });
  });
});
