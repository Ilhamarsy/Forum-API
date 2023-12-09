/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'dicoding',
    owner = 'user-123',
    threadId = 'thread-123',
    date = '2023-11-10 00:00:00.00000',
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments_thread VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, threadId, date, isDelete],
    };

    await pool.query(query);
  },

  async findCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT * FROM comments_thread WHERE thread_id = $1',
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments_thread WHERE id = $1',
      values: [commentId],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments_thread WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
