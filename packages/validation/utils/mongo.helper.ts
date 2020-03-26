import { ObjectId } from 'bson';
import { isPlainObject } from '@uzert/helpers';

export const getObjectId = (dataOrId: any): ObjectId | false => {
  if (isPlainObject(dataOrId)) {
    if (dataOrId._id) {
      dataOrId = dataOrId._id;
    } else {
      return dataOrId;
    }
  }

  if (dataOrId instanceof ObjectId) {
    return dataOrId;
  }

  if (!ObjectId.isValid(dataOrId) && dataOrId._id) {
    throw new Error('No valid ObjectId');
  }

  return new ObjectId(dataOrId);
};

export const getStringFromObjectId = (dataOrId: any): string | false => {
  if (isPlainObject(dataOrId)) {
    if (dataOrId._id) {
      dataOrId._id = getStringFromObjectId(dataOrId._id);
    }

    return dataOrId;
  }

  const id = dataOrId;

  if (id instanceof ObjectId) {
    return id.toHexString();
  }

  if (!ObjectId.isValid(id)) {
    throw new Error('No valid ObjectId');
  }

  return new ObjectId(id).toHexString();
};
