const selfhelp: Array<{
  channels: Array<string>;
  nameOfService?: string;
  helpLinks?: Record<string, string>;
  machineLearningModelId?: string;
}> = [
  {
    channels: [
      "544222717373710356", // countr-support
      "511170716335603713", // countr-commands
    ],
    nameOfService: "Countr",
    helpLinks: {
      Website: "https://countr.xyz",
      Documentation: "https://docs.countr.xyz",
      "Source Code": "https://github.com/countr/countr",
    },
    machineLearningModelId: "countr",
  },
  {
    channels: [
      "757330745764347965", // the-impostor-support
      "757330721978187936", // the-impostor-commands
    ],
    nameOfService: "The Impostor",
    helpLinks: {
      "Source Code": "https://github.com/biaw/the-impostor",
    },
  },
  {
    channels: ["449637630355701760"], // general
    machineLearningModelId: "non-support",
  },
];

export default selfhelp;
