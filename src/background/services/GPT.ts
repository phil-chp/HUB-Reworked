import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const agent_instruction = `You are a consultant for tech students please generate a list of exactly 4 ideas (2 xp and 2 prj) this student can create in relation to the keywords they will give you. Make the ideas feasible in 1 month by for a student.

Please generate the text in the following format (do not include the backticks, nor the <placeholders>):
\`\`\`
<xp1>
<xp2>
<prj1>
<prj2>
\`\`\`

- "xp" refer to a pretty quick Experience that can be done in under 2h, in which the student will be able to discover a subject or a tool.
- "prj" refers to a longer Project that can be organized over an entire month, the idea is to produce something tech related.

Please make all 4 ideas feasible depending on their specific contexts (xp, prj)

Stay extremely brief, do not write anything more than the 3 ideas. For each of them, try to stay under 15 words.`;

const assistant = await openai.beta.assistants.create({
  name: "Idea Consultant",
  instructions: agent_instruction,
  tools: [],
  model: "gpt-3.5-turbo",
});

const thread = await openai.beta.threads.create();


function awaitResponse(threadId: string, runId: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    await setTimeout(async () => {
      const run = await openai.beta.threads.runs.retrieve(
        threadId,
        runId
      );

      console.log("Requesting GPT for ideas...");
      if (run.status === "completed") {
        const messages = await openai.beta.threads.messages.list(threadId);
        const content = messages.data[0].content[0] as OpenAI.Beta.Threads.Messages.MessageContentText;
        resolve(content.text.value);
      } else {
        console.log("An error occurred", run.last_error);
      }
    }, 1000);
  });
}


export default async function generateIdeas(keywords: string[]) {
  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: keywords.join(" "),
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  const res = await awaitResponse(thread.id, run.id);

  // Because the formatting can be a little bit different each time, we can't trust the process and have to work step by step.
  try {
    return res.split("\n")
      .filter((x) => x !== "" && x !== "```")
      .map((x) => x.replace(/<(xp|prj)\d>/g, "")
        .trim());
  } catch (e) {
    // ignore
  }

  try {
    return res.split("\n").filter((x) => x !== "" && x !== "```");
  } catch (e) {
    // ignore
  }

  try {
    return res.split("\n");
  } catch (e) {
    // ignore
  }

  return [ res ];
}
