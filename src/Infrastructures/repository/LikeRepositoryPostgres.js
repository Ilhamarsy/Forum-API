const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async toggleLike(likeData) {
    const { userId, commentId } = likeData;

    const id = `like-${this._idGenerator()}`;
    const isliked = await this.verifyLike(likeData);

    let query;
    if (!isliked) {
      query = {
        text: 'INSERT INTO likes_comment VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, commentId],
      };
    } else {
      query = {
        text: 'DELETE FROM likes_comment WHERE user_id = $1 AND comment_id = $2',
        values: [userId, commentId],
      };
    }

    await this._pool.query(query);
  }

  async verifyLike({ userId, commentId }) {
    const query = {
      text: 'SELECT * FROM likes_comment WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.length > 0;
  }

  async getLikeCount(commentId) {
    const query = {
      text: 'SELECT * FROM likes_comment WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.length;
  }
}

module.exports = LikeRepositoryPostgres;
