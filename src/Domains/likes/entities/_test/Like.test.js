const Like = require('../Like');

describe('Like entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      userId: 'user',
      commentId: 'user',
    };

    // Action & Assert
    expect(() => new Like(payload)).toThrowError('LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      userId: 'user',
      commentId: 123,
      threadId: 'thread-123',
    };

    // Action & Assert
    expect(() => new Like(payload)).toThrowError('LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Like entities correctly', () => {
    // Arrange
    const payload = {
      userId: 'user',
      commentId: 'comment',
      threadId: 'thread-123',
    };

    // Action
    const like = new Like(payload);

    // Assert
    expect(like).toBeInstanceOf(Like);
    expect(like.userId).toEqual(payload.userId);
    expect(like.commentId).toEqual(payload.commentId);
    expect(like.threadId).toEqual(payload.threadId);
  });
});
