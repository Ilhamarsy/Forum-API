const ToggleLikeUseCase = require('../../../../Applications/use_case/ToggleLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.toggleLikeHandler = this.toggleLikeHandler.bind(this);
  }

  async toggleLikeHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(ToggleLikeUseCase.name);

    const { threadId, commentId } = request.params;

    await addReplyUseCase.execute({
      commentId,
      userId: request.auth.credentials.id,
      threadId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
