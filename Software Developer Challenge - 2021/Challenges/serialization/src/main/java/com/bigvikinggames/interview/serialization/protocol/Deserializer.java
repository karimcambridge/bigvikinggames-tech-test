package com.bigvikinggames.interview.serialization.protocol;

import com.bigvikinggames.interview.serialization.model.Message;

import java.util.List;

/**
 * Created by cbanner on 2017-05-11.
 */
public interface Deserializer {

	/**
	 * Consume some bytes from a range in a buffer and produce a (possibly empty) list of messages.
	 *
	 * @param buffer the buffer to read bytes from
	 * @param offset the offset to start reading bytes
	 * @param length the number of bytes to read
	 * @return
	 */
	List<Message> consumeBytes(byte[] buffer, int offset, int length);

}
