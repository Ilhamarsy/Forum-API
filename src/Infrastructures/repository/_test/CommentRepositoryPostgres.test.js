const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange

      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'Dicoding Indonesia',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsByThreadId('thread-123');
      expect(comment).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Dicoding Indonesia',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if owner not own the comment', async () => {
      // Arrange
      const comment = 'comment-123';
      const owner = 'user-456';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(comment, owner))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if owner own the comment', async () => {
      // Arrange
      const comment = 'comment-123';
      const owner = 'user-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: comment });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(comment, owner))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('verifyComment function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      // Arrange
      const comment = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyComment(comment))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment available', async () => {
      // Arrange
      const comment = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: comment });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyComment(comment))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment correctly', async () => {
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });

      await commentRepositoryPostgres.deleteComment(commentId);

      const comment = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comment.is_delete).toStrictEqual(true);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should return comment thread data correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentData = {
        id: 'comment-123',
        content: 'dicoding',
        owner: 'user-123',
        threadId: 'thread-123',
      };
      // const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment(commentData);

      // Action & Assert
      const comment = await commentRepositoryPostgres.getCommentByThreadId(threadId);
      expect(comment[0].id).toStrictEqual('comment-123');
      expect(comment[0].username).toStrictEqual('user');
      expect(comment[0].date).toStrictEqual(new Date('2023-11-10 00:00:00.00000'));
      expect(comment[0].content).toStrictEqual('dicoding');
    });

    it('should return comment thread data with content "**komentar telah dihapus**" when is_delete is true', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentData = {
        id: 'comment-123',
        content: 'dicoding',
        owner: 'user-123',
        threadId: 'thread-123',
        date: new Date('2023-11-10 00:00:00.00000'),
        isDelete: true,
      };
      // const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment(commentData);

      // Action & Assert
      const comment = await commentRepositoryPostgres.getCommentByThreadId(threadId);
      expect(comment[0].id).toStrictEqual('comment-123');
      expect(comment[0].username).toStrictEqual('user');
      expect(comment[0].date).toStrictEqual(new Date('2023-11-10 00:00:00.00000'));
      expect(comment[0].content).toStrictEqual('**komentar telah dihapus**');
    });
  });
});
