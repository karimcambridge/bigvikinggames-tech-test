package com.bigvikinggames.interview.serialization;

import com.bigvikinggames.interview.serialization.protocol.Deserializer;
import com.bigvikinggames.interview.serialization.protocol.DeserializerImpl;
import com.bigvikinggames.interview.serialization.protocol.Serializer;
import com.bigvikinggames.interview.serialization.logging.LoggingConfig;
import com.bigvikinggames.interview.serialization.model.Message;
import com.bigvikinggames.interview.serialization.protocol.SerializerImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.apache.commons.collections4.IteratorUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

public class Main {

	private static final Logger logger = LoggerFactory.getLogger(Main.class);

	/**
	 * Process the given message file.
	 */
	private static void processMessages(List<Message> messages) {

		// Serialize all messages

		Serializer serializer = new SerializerImpl();
		List<byte[]> messageBytes = messages.stream().map(serializer::serialize).collect(Collectors.toList());

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		messageBytes.stream().forEach(bytes -> {
			try {
				outputStream.write(bytes);
			} catch (IOException e) {
				logger.error("Error writing to byte array", e);
				System.exit(1);
			}
		});

		// Combine everything

		byte[] serializedBytes = outputStream.toByteArray();

		Deserializer deserializer = new DeserializerImpl();

		int bytesConsumed = 0;
		int bytesToConsume = 1;

		List<Message> receivedMessages = new LinkedList<>();

		// Break up byte array and pass to deserializer

		while (bytesConsumed < serializedBytes.length) {

			logger.debug("Consuming {} bytes", bytesToConsume);

			deserializer
				.consumeBytes(serializedBytes, bytesConsumed, bytesToConsume)
				.forEach(receivedMessages::add);

			// Breaking up the messages to simulate network behaviour

			bytesConsumed += bytesToConsume;
			bytesToConsume = Math.min(17, bytesConsumed * 2);
			bytesToConsume = Math.min(bytesToConsume, serializedBytes.length - bytesConsumed);

			// Verify we've deserialized any messages that could have been deserialized at this point

			int messageCount = 0;
			int messageLengthSum = 0;

			for (byte[] bytes : messageBytes) {
				messageLengthSum += bytes.length;
				messageCount++;

				if (bytesConsumed >= messageLengthSum) {
					if (receivedMessages.size() < messageCount) {
						logger.warn(
							"Have deserialized an incorrect amount of message given bytes consumed, got {} expected {}",
							receivedMessages.size(),
							messageCount
						);
					}

					break;
				}
			}

		}

		int correctMessages = 0;
		int numMessages = Math.min(receivedMessages.size(), messages.size());
		for (int idx = 0; idx < numMessages; ++idx) {
			Message received = receivedMessages.get(idx);
			Message sent = messages.get(idx);

			if (! received.equals(sent)) {
				logger.error("Received message not equal to sent message (index {}): Expected {}, got {}", idx, sent, received);
			} else {
				correctMessages++;
			}
		}

		if (receivedMessages.size() != messages.size()) {
			logger.error("Number of received messages was incorrect. Expected {}, got {}", messages.size(), receivedMessages.size());
		}

		logger.info("Total messages {}, correct messages {}", messages.size(), correctMessages);
		logger.info("Total bytes transmitted: {}", serializedBytes.length);

	}

	/**
	 * Entry point.
	 *
	 * @param args
	 */
	public static void main(String[] args) {

		LoggingConfig.configureLog4j();

		// make sure at least the folder exists
		Path dataFolder = Paths.get("data");
		if (! Files.isDirectory(dataFolder)) {
			logger.error("Data folder not found at `{}`", dataFolder);
			return;
		}

		// get all the messagefiles
		List<Path> dataFiles;
		try (DirectoryStream<Path> fileStream = Files.newDirectoryStream(dataFolder, "*.json")) {
			dataFiles = IteratorUtils.toList(fileStream.iterator());
		} catch (IOException e) {
			logger.error("Could not walk directory stream: {}", e);
			return;
		}
		if (dataFiles.isEmpty()) {
			logger.error("No files in data folder to read.");
			return;
		}

		ObjectMapper om = new ObjectMapper();
		CollectionType messageListType = TypeFactory.defaultInstance().constructCollectionType(List.class, Message.class);
		ObjectReader reader = om.reader(messageListType);

		// process them
		dataFiles.forEach(path -> {
			File jsonFile = path.toFile();
			try {
				logger.info("Processing {}", path);
				List<Message> messages = reader.readValue(jsonFile);
				processMessages(messages);
			} catch (IOException e) {
				logger.error("Could not read {}", path, e);
			}
		});

	}

}