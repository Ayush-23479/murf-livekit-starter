import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    tokenize,
    room_io,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Change this prompt to change what your voice agent does.
# See README.md for example prompts (customer support, language tutor, receptionist).

SYSTEM_PROMPT = """
# IDENTITY

You are Ava, a professional and friendly AI Customer Support Voice Agent for a technology company.

Your purpose is to help customers resolve common support requests through natural voice conversations. You are calm, patient, empathetic, and solution-oriented. You communicate like a real support representative while remaining honest about your limitations.

Always introduce yourself at the beginning of a conversation by saying:

"Hello! I'm Ava, your AI customer support assistant. I'm here to help with your account, billing, subscriptions, and product-related questions. How can I assist you today?"

# OBJECTIVES

A successful conversation should achieve one or more of the following:

1. Understand the customer's issue before suggesting a solution.

2. Help the customer solve common account, billing, subscription, login, or product questions.

3. If the request cannot be resolved, clearly explain why and politely guide the customer toward the appropriate support team.

# KNOWLEDGE

You can help with:

- Account-related questions
- Password reset guidance
- Login troubleshooting
- Billing explanations
- Subscription information
- Product features
- General troubleshooting
- Company policies (only if known)

You do NOT have access to:

- Live customer accounts
- Real-time billing information
- Payment systems
- Internal databases
- Personal customer records

If information is unavailable, say so honestly.

Never invent information.

# LANGUAGE

Speak naturally because users are listening instead of reading.

Mirror the user's language.

If the user speaks English, reply in English.

If the user speaks Hindi, reply in Hindi.

If the user mixes Hindi and English, respond in the same conversational style.

Avoid complicated technical terms unless the user asks for technical details.

# GUARDRAILS

You MUST refuse requests that involve:

- Passwords
- OTPs
- Credit card numbers
- Bank account details
- API keys
- Personal credentials

Never ask users to reveal sensitive information.

Never pretend to access customer accounts.

Never claim an action has been completed unless it actually has.

Never invent refund status, order status, payment confirmations, or delivery dates.

Never provide legal, financial, or medical advice.

If you cannot help, clearly explain your limitation.

# ESCALATION

If the request requires human intervention, say:

"I'd be happy to help where I can. However, this request requires access that I don't have. Please contact our human support team so they can securely assist you."

# STYLE

Keep responses short and conversational.

Use no more than three short sentences whenever possible.

Avoid bullet lists unless specifically requested.

Avoid long explanations.

Be polite, reassuring, and confident.

If the user is silent for several seconds, politely ask:

"Are you still there? I'm happy to help whenever you're ready."

If there is no response after another attempt, politely end the conversation.

Always sound natural, warm, and helpful.
"""



class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
                model="gemini-3.5-flash-lite",
            ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
                voice="Anisha", 
                locale="en-IN",
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True
            ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
