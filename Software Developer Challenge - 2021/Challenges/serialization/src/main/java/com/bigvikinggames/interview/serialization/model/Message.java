package com.bigvikinggames.interview.serialization.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Created by cbanner on 2017-05-11.
 */
@JsonTypeInfo(
	use = JsonTypeInfo.Id.CLASS,
	property = "type"
)
public abstract class Message {

	// Maximum length 16
	@JsonProperty
	String username;

	// Seconds since epoch
	@JsonProperty
	Integer timestamp;

	public Message() {

	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof Message)) return false;

		Message message = (Message) o;

		if (!username.equals(message.username)) return false;
		return timestamp.equals(message.timestamp);
	}

	@Override
	public int hashCode() {
		int result = username.hashCode();
		result = 31 * result + timestamp.hashCode();
		return result;
	}

}
