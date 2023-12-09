const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2023-11-10 00:00:00.00000'),
      username: 'dicoding',
    };

    const mockComment = [
      new DetailComment({
        id: 'comment-123',
        username: 'johndoe',
        date: new Date('2023-11-10 00:00:00.00000'),
        content: 'sebuah comment',
        isdelete: false,
      }),
      new DetailComment({
        id: 'comment-456',
        username: 'johndoe',
        date: new Date('2023-11-10 00:00:00.00000'),
        content: 'sebuah comment',
        isdelete: true,
      }),
    ];

    const mockReply = [
      new DetailReply({
        id: 'reply-123',
        username: 'johndoe',
        date: new Date('2023-11-10 00:00:00.00000'),
        content: 'sebuah reply',
        isdelete: false,
      }),
      new DetailReply({
        id: 'reply-456',
        username: 'johndoe',
        date: new Date('2023-11-10 00:00:00.00000'),
        content: 'sebuah reply',
        isdelete: true,
      }),
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    // Mocking
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReply));
    mockLikeRepository.getLikeCount = jest.fn()
      .mockImplementation(() => Promise.resolve(1));

    // create use case instance
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });
    // Action
    const detailThread = await getThreadDetailUseCase.execute(useCasePayload);
    // Assert
    expect(detailThread.id).toStrictEqual('thread-123');
    expect(detailThread.title).toStrictEqual('sebuah thread');
    expect(detailThread.body).toStrictEqual('sebuah body thread');
    expect(detailThread.date).toStrictEqual(new Date('2023-11-10 00:00:00.00000'));
    expect(detailThread.username).toStrictEqual('dicoding');

    expect(detailThread.comments[0].id).toStrictEqual('comment-123');
    expect(detailThread.comments[0].username).toStrictEqual('johndoe');
    expect(detailThread.comments[0].date).toStrictEqual(new Date('2023-11-10 00:00:00.00000'));
    expect(detailThread.comments[0].content).toStrictEqual('sebuah comment');
    expect(detailThread.comments[0].likeCount).toStrictEqual(1);

    expect(detailThread.comments[0].replies[0].id).toStrictEqual('reply-123');
    expect(detailThread.comments[0].replies[0].content).toStrictEqual('sebuah reply');
    expect(detailThread.comments[0].replies[0].date).toStrictEqual(new Date('2023-11-10 00:00:00.00000'));
    expect(detailThread.comments[0].replies[0].username).toStrictEqual('johndoe');

    expect(detailThread.comments[0].replies[1].id).toStrictEqual('reply-456');
    expect(detailThread.comments[0].replies[1].content).toStrictEqual('**balasan telah dihapus**');
    expect(detailThread.comments[0].replies[1].date).toStrictEqual(new Date('2023-11-10 00:00:00.00000'));
    expect(detailThread.comments[0].replies[1].username).toStrictEqual('johndoe');

    expect(detailThread.comments[1].id).toStrictEqual('comment-456');
    expect(detailThread.comments[1].username).toStrictEqual('johndoe');
    expect(detailThread.comments[1].date).toStrictEqual(new Date('2023-11-10 00:00:00.00000'));
    expect(detailThread.comments[1].content).toStrictEqual('**komentar telah dihapus**');
    expect(detailThread.comments[1].likeCount).toStrictEqual(1);

    expect(mockThreadRepository.verifyThread)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getThreadById)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentByThreadId)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByCommentId)
      .toBeCalledWith(mockComment[0].id);
    expect(mockReplyRepository.getRepliesByCommentId)
      .toBeCalledWith(mockComment[1].id);
  });
});
