const { quickresponses } = require("../../database");

module.exports = {
  "help": {
    input: [
      "help me",
      "please help me",
      "need help",
      "i need help",
      "can someone help me",
      "is anyone here?"
    ],
    output: () => quickresponses.get("need-help"),
    confidenceRequired: 0.2
  },
  "!": {
    input: [
      "any way to make moderators bypass message deletion",
      "bypass deletion",
      "delete messages written by mods",
      "delete staff messages",
      "post a message without deletion",
      "can my message not get deleted"
    ],
    output: () => quickresponses.get("!"),
    confidenceRequired: 0.2
  },
  "commands": {
    input: [
      "commands doesn't work",
      "countr is not responding",
      "doesn't respond",
      "won't respond"
    ],
    output: () => quickresponses.get("check"),
    confidenceRequired: 0.2
  },
  "flows": {
    input: [
      "what are flows",
      "what is flows",
      "create role reward",
      "pin count",
      "pin a count",
      "pin milestone",
      "pin a milestone",
      "set up a flow",
      "create a flow"
    ],
    output: () => quickresponses.get("flows"),
    confidenceRequired: 0.2
  },
  "premium": {
    input: [
      "what is premium",
      "what do i get with premium",
      "premium benefits",
      "donating"
    ],
    output: () => quickresponses.get("premium"),
    confidenceRequired: 0.2
  },
  "stopped_working": {
    input: [
      "stopped deleting counts",
      "stopped working",
      "is stuck"
    ],
    output: () => quickresponses.get("set"),
    confidenceRequired: 0.2
  },
  "setup": {
    input: [
      "setup",
      "set up",
      "how to set up",
      "how to set up countr"
    ],
    output: () => quickresponses.get("setup"),
    confidenceRequired: 0.2
  },
  "multiple_counts": {
    input: [
      "count multiple times",
      "doesn't let me type 2"
    ],
    output: () => quickresponses.get("spam"),
    confidenceRequired: 0.2
  },
  "counting_chat": {
    input: [
      "allow people to chat",
      "text after count"
    ],
    output: () => quickresponses.get("talking"),
    confidenceRequired: 0.2
  },
  "topic_deprecated": {
    input: [
      "update topic",
      "topic with next count",
      "change the topic"
    ],
    output: () => quickresponses.get("topic"),
    confidenceRequired: 0.2
  },
  "bot_user": {
    input: [
      "count as bot",
      "count as a bot",
      "bot tag",
      "i'm not a bot"
    ],
    output: () => quickresponses.get("webhook"),
    confidenceRequired: 0.2
  }
};