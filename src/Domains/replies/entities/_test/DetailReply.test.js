const DetailReply = require('../DetailReply');

describe('DetailReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: 'abc',
      username: 'abc',
      date: 'abc',
    };

    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: 'abc',
      username: 'abc',
      date: 'abc',
      content: 123,
      isdelete: false,
    };

    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailComment entities correctly', () => {
    const payload = {
      id: 'abc',
      username: 'abc',
      date: new Date(),
      content: 'abc',
      isdelete: false,
    };

    const detailReply = new DetailReply(payload);

    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.content).toEqual(payload.content);
  });

  it('should return "**balasan telah dihapus**" when is_delete is true', () => {
    const payload = {
      id: 'abc',
      username: 'abc',
      date: new Date(),
      content: 'abc',
      isdelete: true,
    };

    const detailComment = new DetailReply(payload);

    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual('**balasan telah dihapus**');
  });
});
