
var express = require('express');
var app = express();
app.set ('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
var {invoicem} = require('./Mongo/Invoice.js');
var {Client} = require('./Mongo/Invoice.js');

const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

const Papaparse=require('papaparse');
const { isEmpty } = require('lodash');

app.use(fileUpload({
    createParentPath: true
}));
app.use(cors({
    origin: 'http://localhost:3000'
}));
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

function newClient (req){
    console.log("req: "+req);
    let newClient = new Client ({
        name: req.clName,
        address: req.clAddress,
        bank: req.clBank,
        ourClientName: req.clourClient

    })


    newClient.save (function(err, client) {
        if (err) {
            throw (err);
            }
            console.log (newClient);
    });
}

app.use ('/newClient', (req, res) =>{
    var obj = req.query.myobj;
    obj = JSON.parse (obj)
    console.log("reqqueryobj" + obj.clName);

    newClient (obj);

    res.json ({msg: 'client is saved to DB'});
});

app.use ('/clientList', (req, res) => {

    Client.find({}, 'name address', function (err, docs){
        if (err) return console.log (err);

        //console.log(docs)
        res.json (docs);
    });    
    
})



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

function download (doc) {
    
    //console.log (doc)
    let invoicesHandled = []; 
    //let tableLine = []; 
    let invoices = doc;
    invoices.forEach(invoice => {
      invoice.invContent.forEach (invLine =>{
        invLine.cntrs.forEach (cntr=>{
          invoicesHandled.push ([invoice.invNumber, invoice.booking_no, invLine.service, invLine.price, cntr]);
        })
      })
  
    });
    //console.log(invoicesHandled);
  
    var csv = Papaparse.unparse(invoicesHandled);
    console.log (csv);
    return csv; 
    
  }

 function uploadFile (doc) {

    const fs = require('fs');
    //C:\Users\count\edxreact

fs.writeFile('file.csv', doc, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 

  }

  app.use ('/oneInvoice', (req,res)=>{
    invoicem.find({invNumber: req.query.invNumber}, {_id:0}).populate('client', 'name').exec (function (err,doc){
        console.log(doc);
        res.json(doc);
    })
    
    }
    
    )


app.use ('/dowloadInvoices', (req,res)=>{
        invoicem.find({}, {_id:0}).sort('-invNumber').populate('client', 'name').exec (function (err,doc){
        let fileD=download(doc); 
        uploadFile(fileD);
        const file ='file.csv';
        console.log (file);
        res.download(file);
    })
    
    })

app.use ('/getInvoices', (req,res)=>{
invoicem.find({}, {_id:0}).sort('-invNumber').populate('client', 'name').exec (function (err,doc){
    console.log(doc);
    res.json(doc);
})

}

)
function updateInvoice (invoice) {
    console.log ("update invoice check ")
    var invNumber=invoice.general.invNumber;
    var invCont = [];
    var sum=0;
    var ourCompany= invoice.shipping.ourCompany;
    console.log (ourCompany);
    for (i = 0; i < invoice.items.length; i++) {    
        const item = invoice.items[i];
        var price = item.amount;
        invCont.push({
            cntrs: item.cntrs, 
            curr: item.currency,
            price: price,
            qty: item.quantity,
            service: item.description
        })
        sum+=price*item.quantity;
    }
        
    var invUpdated = {
    booking_no: invoice.general.bookingno,
    client: invoice.shipping.client_id,
    ourCompany: ourCompany,
    invContent: invCont,
    sum: sum
}
    
    console.log (invUpdated);

    invoicem.findOneAndUpdate ( {invNumber: invNumber}, invUpdated , function(err, doc){
        if (err) console.log (err);
    console.log ('Succesfully saved.');
    });
}

function testfind(invoice) {
    invoicem.find ({}, 'invNumber').sort('-invNumber').exec (function(err, doc){
        invoiceToDB(invoice, doc);

    })
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return day + "/" + month + "/"  + year;
      }

function invoiceToDB (invoice, doc) {
    console.log ('testfind: ' + doc[0])
    var date = new Date;
    var today = formatDate (date); 
var sum = 0; 
    var invCont = [];
    for (i = 0; i < invoice.items.length; i++) {    
        const item = invoice.items[i];
        var price = item.amount;
        invCont.push({
            cntrs: item.cntrs, 
            curr: item.currency,
            price: price,
            qty: item.quantity,
            service: item.description
        })
        sum+=price*item.quantity;
    }
        if (doc[0]!=undefined){
        var maxNumber = doc[0].invNumber;}
        else {maxNumber=0};
        console.log("invoice.shipping.sum: " + invoice.shipping.sum)
        
    Invoice = new invoicem ({
    invNumber: maxNumber+1,
    booking_no: invoice.general.bookingno,
    //date: {$currentDate},
    client: invoice.shipping.client_id,
    ourCompany: invoice.shipping.ourCo,
    invContent: invCont,
    sum: sum
    
    })
    
        Invoice.save (function(err, invoice) {
            if (err) {
                throw (err);
                }
                console.log (invoice);
        });

        
 console.log ("client: " + invoice.shipping.name, "POL: "+ invoice.general.POL);

}


app.use('/getinvoice', (req,res) => {
    var id="5ed1521057c5c13804a8d01f";
    //Invoice.findOne ({invNumber: '1251'}, function (err, docs) {
    Invoice.findOne ({invNumber: '1258'}).populate('client').exec (function (err, docs) {
        //if (err) throw (err);
        //else {
        console.log(docs);
        console.log (docs.client.name);
        res.json(docs); }
)})

function getClientName (clientId) {
    console.log(clientId);
var client = Client.findById (clientId, 'name').exec();
return client
}

//загрузка пдф
app.use('/test', (req, res) => {

var invContent =JSON.parse(req.query.invContent)
var cntr_numbers =JSON.parse(req.query.cntr_numbers);
var invNumber = req.query.invNumber;
cntr_numbers=cntr_numbers.cntrs;
var ourCo = req.query.ourCo;
var sum= req.query.sum;
var client=req.query.client; 
console.log (ourCo);
client=client.split(",");
//console.log(client); 
var apiResponce =JSON.parse(req.query.apiResponce);
let firstline = apiResponce[0];
console.log("firstline: " + firstline.toString());
let newinvContent = [];
let total=0; 
let number=0;


invContent.forEach(function(line){
    total+=Number(line["price"])*Number(line["qty"]);
    number+=1;
    newinvContent.push ({
        item: number, 
        description: line["service"] + "; " + line["cntrs"],
        cntrs: line["cntrs"],
        quantity: line ["qty"],
        currency: line.curr,
        amount: Number(line["price"]),
        type: line.type,
        //client: clientId
    })
})

//console.log (newinvContent);

    const {createInvoice} = require("./createInvoice.js");
//ar clientId = invContent[0].client;

//console.log (client.name); 

    const invoice = {
      shipping: {
        name: client[1],
        client_id: client[0],
        address: client[2],
        //city: "Stp",
        //state: "CA",
        //country: "Russia",
        //postal_code: 94111, 
        ourCompany: ourCo,
        sum: sum
      },
      general: {
        POL: firstline.POL,
        POD: firstline.POD,
        ETA: firstline.ETA,
        bookingno: firstline.bookingno,
        client: firstline.Client,
        cntr_numbers: cntr_numbers,
        currency: invContent[0].currency,
        invNumber: invNumber
      },
      items: newinvContent,
      
      subtotal: total,
      paid: 0,
      invoice_nr: 1280
    };
    
    createInvoice(invoice, "invoice.pdf");
    if (invNumber=="") {
    testfind (invoice);}

    else {
        updateInvoice (invoice);
    }


 res.json ({'msg': "check pdf file"}); 
    });
      

    let port = process.env.PORT;
    if (port == null || port == "") {
      port = 8000;
    }
    app.listen(port);
    
