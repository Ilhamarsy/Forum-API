const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { content, owner, commentId } = addReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies_comment VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT r.id, u.username, r.date, r.content, r.is_delete AS isdelete
      FROM replies_comment AS r
      LEFT JOIN users AS u ON r.owner = u.id
      WHERE r.comment_id = $1
      ORDER BY r.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => new DetailReply({ ...row }));
  }

  async verifyReply(replyId) {
    const query = {
      text: 'SELECT * FROM replies_comment WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Reply tidak ditemukan');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies_comment SET is_delete = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyOwner(reply, owner) {
    const query = {
      text: 'SELECT * FROM replies_comment WHERE id = $1 AND owner = $2',
      values: [reply, owner],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new AuthorizationError('Tidak memiliki akses');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
