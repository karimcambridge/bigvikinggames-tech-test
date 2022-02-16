package com.bigvikinggames.interview.serialization.protocol;

import com.bigvikinggames.interview.serialization.model.Message;

import java.util.Collections;
import java.util.List;

/**
 * Created by cbanner on 2017-05-11.
 */
public class DeserializerImpl implements Deserializer {

	@Override
	public List<Message> consumeBytes(byte[] buffer, int offset, int length) {
		return Collections.emptyList();
	}

}
