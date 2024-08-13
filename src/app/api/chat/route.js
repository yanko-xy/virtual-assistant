import { audioFileToBase64, lipSyncMessage, readJsonTranscript } from "@/utils";
import OpenAI from "openai";
import ElevenLabs from "elevenlabs-node";

const openai = new OpenAI({
	apiKey: process.env["OPENAI_API_KEY"],
});

const elevenLabsApiKey = process.env["ELEVEN_LABS_API_KEY"];
const voiceID = "WuLq5z7nEcrhppO0ZQJw";

const voice = new ElevenLabs({
	apiKey: elevenLabsApiKey,
	voiceId: voiceID,
});

export async function POST(req) {
	const userMessage = (await req.json()).message;
	if (!userMessage) {
		return Response.json({
			messages: [
				{
					text: "Hey dear... How was your day?",
					audio: await audioFileToBase64("public/audios/intro_0.wav"),
					lipsync: await readJsonTranscript(
						"public/audios/intro_0.json"
					),
					facialExpression: "smile",
					animation: "Talking_1",
				},
				{
					text: "I missed you so much... Please don't go for so long!",
					audio: await audioFileToBase64("public/audios/intro_1.wav"),
					lipsync: await readJsonTranscript(
						"public/audios/intro_1.json"
					),
					facialExpression: "sad",
					animation: "Crying",
				},
			],
		});
	}

	if (!elevenLabsApiKey || openai.apiKey === "-") {
		return Response.json({
			messages: [
				{
					text: "Please my dear, don't forget to add your API keys!",
					audio: await audioFileToBase64("public/audios/api_0.wav"),
					lipsync: await readJsonTranscript(
						"public/audios/api_0.json"
					),
					facialExpression: "angry",
					animation: "Angry",
				},
				{
					text: "You don't want to ruin Wawa Sensei with a crazy ChatGPT and ElevenLabs bill, right?",
					audio: await audioFileToBase64("public/audios/api_1.wav"),
					lipsync: await readJsonTranscript(
						"public/audios/api_1.json"
					),
					facialExpression: "smile",
					animation: "Laughing",
				},
			],
		});
	}

	const completion = await openai.chat.completions.create({
		model: "gpt-3.5-turbo-1106",
		max_tokens: 1000,
		temperature: 0.6,
		response_format: {
			type: "json_object",
		},
		messages: [
			{
				role: "system",
				content: `
            You are a virtual Chinese assistant.
            You will always reply with a JSON array of messages.
            Each message has a text, facialExpression, and animation property.
            The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
            The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
            `,
			},
			{
				role: "user",
				content: userMessage || "Hello",
			},
		],
	});

	let messages = JSON.parse(completion.choices[0].message.content);
	if (messages.messages) {
		messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
	}

	for (let i = 0; i < messages.length; i++) {
		const message = messages[i];
		// generate audio file
		const fileName = `public/audios/message_${i}.mp3`; // The name of your audio file
		const textInput = message.text; // The text you wish to convert to speech
		await voice.textToSpeech({
			voiceId: voiceID,
			fileName: fileName,
			textInput: textInput,
		});
		// generate lipsync
		await lipSyncMessage(i);
		message.audio = await audioFileToBase64(fileName);
		message.lipsync = await readJsonTranscript(
			`public/audios/message_${i}.json`
		);
	}
	return Response.json({ messages });
}
