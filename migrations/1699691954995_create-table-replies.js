/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('replies_comment', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
    is_delete: {
      type: 'BOOLEAN',
      default: false,
      notNull: true,
    },
  });

  pgm.addConstraint('replies_comment', 'fk_replies.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('replies_comment', 'fk_replies.comment_id_comments_thread.id', 'FOREIGN KEY(comment_id) REFERENCES comments_thread(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('replies_comment');
};
