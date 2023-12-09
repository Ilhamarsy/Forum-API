/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'comment-123',
    content = 'dicoding',
    owner = 'user-123',
    commentId = 'comment-123',
    date = '2023-11-10 00:00:00.00000',
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies_comment VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, commentId, date, isDelete],
    };

    await pool.query(query);
  },

  async findRepliesByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM replies_comment WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findReplyById(replyId) {
    const query = {
      text: 'SELECT * FROM replies_comment WHERE id = $1',
      values: [replyId],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies_comment WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
