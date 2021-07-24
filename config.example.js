module.exports = {
  client: {
    id: "",
    secret: "",
    token: ""
  },

  // discord IDs
  owner: "110090225929191424",
  guild: "449576301997588490",
  permissions: {
    admin: "449577708100517888",
    staff: "449577579611947009"
  },

  // express port for endpoints
  port: 5001,

  // embed colors
  colors: {
    success: 0x1AA6B7,
    error: 0xFF414D,
    warning: 0xF56A79,
    info: 0xD9ECF2
  },

  botMonitors: {
    "467377486141980682": {
      name: "Countr",
      endpoint: "http://localhost:12345",
      category: "467068684905742337", // countr category
    },
    "625031581094117381": {
      name: "Countr Premium",
      endpoint: "http://localhost:23456",
      category: "598229124024369152", // "the second floor", patreon category
    },
    "747110939001880656": {
      name: "The Impostor",
      endpoint: "http://localhost:34567",
      category: "757331504102637669", // the impostor category
    }
  },
  monitorInterval: 30000, // every 30 seconds

  // something short, like .
  qrPrefix: ".",

  // common roles, aka. if a member has one of these roles, give them a hoisted role
  commonRoles: {},

  // separate humans from bots with these two roles
  userRole: "",
  botRole: ""
};