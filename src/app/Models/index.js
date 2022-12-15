module.exports = {
  File: require("utils").FileService.Model,
  User: require("./User"),
  UserVerification: require("./UserVerification"),
  Session: require("./Session"),

  Country: require("./Country"),
  City: require("./City"),

  Notification: require("./Notification"),
  NotificationToken: require("./NotificationToken"),

  Specialty: require("./Specialty"),
  Payment: require("./Payment"),
};
