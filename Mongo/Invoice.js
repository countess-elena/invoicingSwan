var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://elena:test@cluster0-tksmj.mongodb.net/test?retryWrites=true&w=majority');
//var Client = require('./Client.js');

var Schema = mongoose.Schema;

var ClientSchema = new Schema( {
    name: String,
    address: String,
    bank: String,
    ourClientName: String,
    invoice: {type:mongoose.Schema.Types.ObjectId, ref:'Invoice'}
    } );
    

    

var invoiceSchema = new Schema( {
    invNumber: {type: Number, required: true, unique: true},
    booking_no: String,
    date: Date,
    client: {type:mongoose.Schema.Types.ObjectId, ref:'Client'},
    ourCompany: String,
	invContent: [
        {
            cntrs: [String], 
            curr: String,
            price: Number,
            qty: Number,
            service: String
        }
    ],
	
    } );
    let Client = mongoose.model('Client', ClientSchema);
    let Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = {Client: Client, Invoice: Invoice};