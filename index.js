
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

app.use ('/getInvoices', (req,res)=>{
invoicem.find({}).sort('-invNumber').exec (function (err,doc){
    res.json(doc);
})

}

)

function testfind(invoice) {
    invoicem.find ({}, 'invNumber').sort('-invNumber').exec (function(err, doc){
        invoiceToDB(invoice, doc);
    })
}

function invoiceToDB (invoice, doc) {
    console.log ('testfind: ' + doc)

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
    
        var maxNumber = doc[0].invNumber;
        
    Invoice = new invoicem ({
    invNumber: maxNumber+1,
    booking_no: invoice.general.bookingno,
    date: 24/05/2020,
    client: invoice.shipping.client_id,
    ourCompany: invoice.shipping.ourCo,
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
//var description = invContent[0]["service"] + "; " + invContent[0]["cntrs"];
var cntr_numbers =JSON.parse(req.query.cntr_numbers);
cntr_numbers=cntr_numbers.cntrs;
var ourCo = req.query.ourCo;
//console.log(ourCo);
var client=req.query.client; 
//console.log (client);
client=client.split(",");
//console.log(client); 
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
        ourCompany: ourCo
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
      invoice_nr: 1280
    };
    
    createInvoice(invoice, "invoice.pdf");
    testfind (invoice);


 res.json ({'msg': "check pdf file"}); 
    });
      

    let port = process.env.PORT;
    if (port == null || port == "") {
      port = 8000;
    }
    app.listen(port);
    
