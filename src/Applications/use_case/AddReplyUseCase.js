const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddReply(useCasePayload);
    await this._threadRepository.verifyThread(addComment.threadId);
    await this._commentRepository.verifyComment(addComment.commentId);
    return this._replyRepository.addReply(addComment);
  }
}

module.exports = AddReplyUseCase;
