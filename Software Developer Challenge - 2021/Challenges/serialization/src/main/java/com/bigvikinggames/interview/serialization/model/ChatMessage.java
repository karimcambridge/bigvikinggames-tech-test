package com.bigvikinggames.interview.serialization.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by cbanner on 2017-05-11.
 */
public class ChatMessage extends Message {

	// Maximum length 512
	@JsonProperty
	String message;

	public ChatMessage() {

	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof ChatMessage)) return false;
		if (!super.equals(o)) return false;

		ChatMessage that = (ChatMessage) o;

		return message.equals(that.message);
	}

	@Override
	public int hashCode() {
		int result = super.hashCode();
		result = 31 * result + message.hashCode();
		return result;
	}

}
