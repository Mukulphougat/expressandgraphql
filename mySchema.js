const mongoose = require("mongoose");
const emailValidator = require("email-validator");
const schema = mongoose.Schema;
const studSchema = new schema({
    studId: {
        type: Number,
        unique: true,
        required: true
    },
    studName: {
        type: String,
        required: true
    },
    studCourse: {
        type: String,
        required: true
    },
    studEmail: {
        type: String,
        required: true,
        unique: true,
        validate: function (){
            return emailValidator.validate(this.studEmail);
        }
    }
})

studSchema.pre("save", function () {
    console.log("Before Saving")
})
studSchema.post("save", function () {
    console.log("After Saving")
})
const studs = mongoose.model("studData",studSchema);

module.exports = {
    studData: studs
}
