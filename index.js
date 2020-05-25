
var express = require('express');
var app = express();
app.set ('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
var Invoice = require('./Mongo/Invoice.js');

const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

app.use(fileUpload({
    createParentPath: true
}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));


app.use ('/testAPI', (req, res)=>{
    msg = upload();
    console.log ('msg: '+ msg);
res.send(msg);

});

function upload () {
    var myjson;
    }





app.use ('/xlstojson', (req, res)=>{
    //преобразование из эксель в Json
    xlsxj = require("xlsx-to-json-lc");
    xlsxj({
      input: "uploads/excelmiddleimp.xlsx", 
      output: "outputExcelmiddleImp.json",
      //input: "uploads/excelsmall.xlsx", 
      //output: "outputsmall.json",
      //sheet: "IMPORT",
      lowerCaseHeaders:true //converts excel header rows into lowercase as json keys
    }, 
    function(err, result) {
      if(err) {
        console.log ('problem');
        console.error(err);
    }
        else {
        //var myobj=JSON.parse(result[3])
        console.log ('file uploaded');
        myjson=JSON.stringify(result);
        myobj=JSON.parse(myjson);
        //console.log(myobj);
        //res.send(result)

        //поиск по номеру букина
            if (req.query.booking) {
                book_no=req.query.booking;
                book_number="booking number";
                console.log (book_no); 
                cntrs=[];
                resp=myobj.filter(
                    function (itm){
                        oneitm=itm[book_number]==book_no;
                        //console.log('filter ' + oneitm );
                        return oneitm;
                    });
                    console.log(resp);
                    resp.forEach(function(item) {
                        cntrs.push(
                            {
                            'cntr_number': item['containernumber'], 
                            'type': item['cntr type'],
                            'rate': item['rate to client'],
                            'Client': item['client'],
                            'bookingno': item['ourbookingref'],
                            'POL': item.pol,
                            'extra': item['extra'],
                            'POD': item['to'],
                            'docs': item['docs incl/excl'],
                            'ETA': item['eta stp'],
                            "ourcompany": item ['ourcompany']

                        });
                        })
                console.log(cntrs)
                res.json(cntrs);}            
        else {
            res.json ({message: 'no booking number'});
        }
    }
          }

    );
});


    


//загрузка файла с компа на сервер
app.use(express.static('uploads'));

/*
app.post('/upload-avatar', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.avatar;
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./uploads/' + avatar.name);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size,
                    encoding: avatar.encoding,
                    destination: avatar.destination
                }
            });
            
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
*/

app.use ('/loadfileandjson', (req, res)=> {
    if(typeof require !== 'undefined') XLSX = require('xlsx');
var workbook = XLSX.readFile('uploads/Imp, Exp, Cross bookings 2020.xlsb');
res.json ({'msg': "uploaded xls"}); 
});


require('pdfkit') ;

function invoiceToDB (invoice) {
    
    //var Invoice = mongoose.model('Invoice', invoiceSchema);
    var invContent = [];
    for (i = 0; i < invoice.items.length; i++) {
        const item = invoice.items[i];
        invContent.push({
            cntrs: item.cntrs, 
            curr: item.currency,
            price: item.amount,
            qty: item.quantity,
            service: item.description
        })}
    Invoice = new Invoice ({
    invNumber: invoice.invoice_nr,
    booking_no: invoice.general.bookingno,
    date: 24/05/2020,
    Client: invoice.shipping.name,
    ourCompany: "SLOY",
	invContent: invContent
    })
    
        Invoice.save (function(err, invoice) {
            if (err) {
                throw (err);
                }
                console.log (invoice);
        });
        
 console.log ("client: " + invoice.shipping.name, "POL: "+ invoice.general.POL);

}

//загрузка пдф
app.use('/test', (req, res) => {
    var invContent =JSON.parse(req.query.invContent)
//var description = invContent[0]["service"] + "; " + invContent[0]["cntrs"];
var cntr_numbers =JSON.parse(req.query.cntr_numbers);
cntr_numbers=cntr_numbers.cntrs;
var apiResponce =JSON.parse(req.query.apiResponce);
let firstline = apiResponce[0];
console.log("firstline: " + firstline.toString());
let newinvContent = [];
let total=0; 
let number=0;
invContent.forEach(function(line){
    total+=Number(line["price"])*Number(line["qty"])*100;
    number+=1;
    newinvContent.push ({
        item: number, 
        description: line["service"] + "; " + line["cntrs"],
        cntrs: line["cntrs"],
        quantity: line ["qty"],
        currency: line.curr,
        amount: Number(line["price"])*Number(line["qty"])*100,
        type: line.type
    })
})

//console.log (newinvContent);

    const {createInvoice} = require("./createInvoice.js");

    const invoice = {
      shipping: {
        name: firstline.Client,
        address: "Reshetnikova",
        city: "Stp",
        state: "CA",
        country: "Russia",
        postal_code: 94111
      },
      general: {
        POL: firstline.POL,
        POD: firstline.POD,
        ETA: firstline.ETA,
        bookingno: firstline.bookingno,
        client: firstline.Client,
        cntr_numbers: cntr_numbers,
        currency: invContent[0].currency
      },
      items: newinvContent,
      
      subtotal: total,
      paid: 0,
      invoice_nr: 1239
    };
    
    createInvoice(invoice, "invoice.pdf");
    invoiceToDB (invoice);


 res.json ({'msg': "check pdf file"}); 
    });
      

app.listen(2000, () => {
	console.log('Listening on port 2000');
    });
