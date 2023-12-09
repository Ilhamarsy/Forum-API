const Like = require('../../Domains/likes/entities/Like');

class ToggleLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const like = new Like(useCasePayload);
    await this._threadRepository.verifyThread(like.threadId);
    await this._commentRepository.verifyComment(like.commentId);
    await this._likeRepository.toggleLike(like);
  }
}

module.exports = ToggleLikeUseCase;
