package com.bigvikinggames.interview.serialization.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by cbanner on 2017-05-11.
 */
public class PositionMessage extends Message {

	// World is 1024 units wide
	@JsonProperty
	Integer worldX;

	// World is 1024 units tall
	@JsonProperty
	Integer worldY;

	public PositionMessage() {

	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof PositionMessage)) return false;
		if (!super.equals(o)) return false;

		PositionMessage that = (PositionMessage) o;

		if (!worldX.equals(that.worldX)) return false;
		return worldY.equals(that.worldY);
	}

	@Override
	public int hashCode() {
		int result = super.hashCode();
		result = 31 * result + worldX.hashCode();
		result = 31 * result + worldY.hashCode();
		return result;
	}

}
