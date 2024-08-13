import { exec } from "child_process";
import { promises as fs } from "fs";

export const audioFileToBase64 = async (file) => {
	const data = await fs.readFile(file);
	return data.toString("base64");
};

export const readJsonTranscript = async (file) => {
	const data = await fs.readFile(file, "utf8");
	return JSON.parse(data);
};

export const lipSyncMessage = async (message) => {
	const time = new Date().getTime();
	console.log(`Starting conversion for message ${message}`);
	await execCommand(
		`ffmpeg -y -i public/audios/message_${message}.mp3 public/audios/message_${message}.wav`
		// -y to overwrite the file
	);
	console.log(`Conversion done in ${new Date().getTime() - time}ms`);
	await execCommand(
		`./bin/rhubarb -f json -o public/audios/message_${message}.json public/audios/message_${message}.wav -r phonetic`
	);
	// -r phonetic is faster but less accurate
	console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

export const execCommand = (command) => {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) reject(error);
			resolve(stdout);
		});
	});
};
