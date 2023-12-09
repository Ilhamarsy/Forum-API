const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user' });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'Dicoding Indonesia',
        owner: 'user-123',
        commentId: 'comment-123',
        threadId: 'threadId',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      const reply = await RepliesTableTestHelper.findRepliesByCommentId('comment-123');
      expect(reply).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'Dicoding Indonesia',
        owner: 'user-123',
      }));
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return replies comment data correctly', async () => {
      // Arrange
      const commentId = 'comment-123';
      const replyData = {
        id: 'reply-123',
        content: 'dicoding',
        owner: 'user-123',
        commentId: 'comment-123',
      };

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await RepliesTableTestHelper.addReply(replyData);

      // Action & Assert
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(commentId);
      expect(replies[0].id).toStrictEqual('reply-123');
      expect(replies[0].username).toStrictEqual('user');
      expect(replies[0].date).toStrictEqual(new Date('2023-11-10 00:00:00.00000'));
      expect(replies[0].content).toStrictEqual('dicoding');
    });

    it('should return replies comment data with content "**balasan telah dihapus**" when is_delete is true', async () => {
      // Arrange
      const commentId = 'comment-123';
      const replyData = {
        id: 'reply-123',
        content: 'dicoding',
        owner: 'user-123',
        commentId: 'comment-123',
        date: new Date('2023-11-10 00:00:00.00000'),
        isDelete: true,
      };

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await RepliesTableTestHelper.addReply(replyData);

      // Action & Assert
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(commentId);
      expect(replies[0].id).toStrictEqual('reply-123');
      expect(replies[0].username).toStrictEqual('user');
      expect(replies[0].date).toStrictEqual(new Date('2023-11-10 00:00:00.00000'));
      expect(replies[0].content).toStrictEqual('**balasan telah dihapus**');
    });
  });

  describe('verifyReply function', () => {
    it('should throw NotFoundError if reply not available', async () => {
      // Arrange
      const reply = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReply(reply))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if reply available', async () => {
      // Arrange
      const reply = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: reply });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReply(reply))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('deleteReply function', () => {
    it('should soft delete reply correctly', async () => {
      const replytId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: replytId });

      await replyRepositoryPostgres.deleteReply(replytId);

      const reply = await RepliesTableTestHelper.findReplyById(replytId);
      expect(reply.is_delete).toStrictEqual(true);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError if owner not own the reply', async () => {
      // Arrange
      const reply = 'reply-123';
      const owner = 'user-456';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(reply, owner))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if owner own the comment', async () => {
      // Arrange
      const reply = 'reply-123';
      const owner = 'user-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: reply });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(reply, owner))
        .resolves.not.toThrow(AuthorizationError);
    });
  });
});
