/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('likes_comment', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('likes_comment', 'fk_likes_thread.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('likes_comment', 'fk_likes_thread.comment_id_comments_thread.id', 'FOREIGN KEY(comment_id) REFERENCES comments_thread(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('likes_comment');
};
