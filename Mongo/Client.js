var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://elena:test@cluster0-tksmj.mongodb.net/test?retryWrites=true&w=majority');
/*
var Schema = mongoose.Schema;

var ClientSchema = new Schema( {
    name: String,
    address: String,
    bank: String,
    ourClientName: String
    } );
    let Client = mongoose.model('Client', ClientSchema);

    module.exports = Client
    */