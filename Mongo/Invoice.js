var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://elena:test@cluster0-tksmj.mongodb.net/test?retryWrites=true&w=majority');

var Schema = mongoose.Schema;

var invoiceSchema = new Schema( {
    invNumber: {type: Number, required: true, unique: true},
    booking_no: String,
    date: Date,
    Client: String,
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

module.exports = mongoose.model('Invoice', invoiceSchema);