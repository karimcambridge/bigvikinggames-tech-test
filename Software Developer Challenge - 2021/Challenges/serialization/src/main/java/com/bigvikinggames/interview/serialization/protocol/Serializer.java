package com.bigvikinggames.interview.serialization.protocol;

import com.bigvikinggames.interview.serialization.model.Message;

/**
 * Created by cbanner on 2017-05-11.
 */
public interface Serializer {

	byte[] serialize(Message message);

}
