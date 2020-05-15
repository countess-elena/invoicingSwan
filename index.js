
var express = require('express');
var app = express();
app.set ('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));


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
    
    //return myjson; }
//return myjson; 
    }



app.use ('/xlstojson', (req, res)=>{
    //преобразование из эксель в Json
    xlsxj = require("xlsx-to-json-lc");
    xlsxj({
      input: "uploads/excelmiddle.xlsb", 
      output: "outputmiddle.json",
      //input: "uploads/excelsmall.xlsx", 
      //output: "outputsmall.json",
      sheet: "EXPORT",
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
                            {'cntr_number': item['cntr number'], 
                            'type': item['cntr type'],
                            'rate': item.rate});
                        })
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

//загрузка пдф
app.use('/test', (req, res) => {

    const {createInvoice} = require("./createInvoice.js");

    const invoice = {
      shipping: {
        name: "Elena yus",
        address: "Reshetnikova",
        city: "Stp",
        state: "CA",
        country: "US",
        postal_code: 94111
      },
      items: [
        {
          item: "1",
          description: "Freight",
          quantity: 1,
          amount: 5000
        },
        {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
          {
            item: "1",
            description: "Freight",
            quantity: 1,
            amount: 5000
          },
        {
          item: "USB_EXT",
          description: "USB Cable Extender",
          quantity: 1,
          amount: 2000
        }
      ],
      subtotal: 8000,
      paid: 0,
      invoice_nr: 1234
    };
    
    createInvoice(invoice, "invoice.pdf");


 res.json ({'msg': "check pdf file"}); 
    });
      

app.listen(2000, () => {
	console.log('Listening on port 2000');
    });
