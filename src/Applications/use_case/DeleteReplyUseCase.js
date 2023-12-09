class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const {
      threadId, commentId, replyId, owner,
    } = useCasePayload;
    await this._threadRepository.verifyThread(threadId);
    await this._commentRepository.verifyComment(commentId);
    await this._replyRepository.verifyReply(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
