const fs = require("fs");
const PDFDocument = require("pdfkit");
var currency="";
//const blobStream = require('blob-stream');

function createInvoice(invoice, path) {
// Create a document
const doc = new PDFDocument({ size: "A4", margin: 40 });
currency=invoice.items[0].currency;
console.log (currency);

generateHeader(doc, invoice);
generateCustomerInformation(doc, invoice);
generateBookingInfo (doc, invoice);
generateInvoiceTable(doc, invoice);
generateFooter(doc);


//const stream = doc.pipe(blobStream());
doc.pipe(fs.createWriteStream(path));
//doc.pipe(res);  
doc.end();
/*
stream.on('finish', function() {
    // get a blob you can do whatever you like with
    const blob = stream.toBlob('application/pdf');
   
    // or get a blob URL for display in the browser
    const url = stream.toBlobURL('application/pdf');
    iframe.src = url;
  });
  */
};

    function generateHeader(doc, invoice) {
      var address = "";
      var bank = "OP CORPORATE BANK PLC";
      var address = "HELSINKI, FINLAND";
      var swift = "OKOYFIHH"; 
      var ibanEuro = "FI57 5000 0120 4000 63"
      var ibanUsd = "FI79 5000 0131 1089 52"
        doc
          .image("SLOY.jpg", 50, 0, { width: 600 })
          .fillColor("#444444")
          .fontSize(20)
          .fontSize(10)
          .text("Beneficiary: " + invoice.shipping.ourCompany, 350, 90, {height: 7})
          .text("Bank: "+bank,{fontSize: 7}) 
          .text(address, {height: 7})
          .text("SWIFT: " + swift)
          .text ("IBAN (EUR): " + ibanEuro)
          .text ("IBAN (USD): " + ibanUsd)
          .fontSize(15)
          .text (invoice.shipping.name, 50, 90)
          .text (invoice.shipping.address)
         
          .moveDown();
      }

      function generateBookingInfo (doc, invoice) {
        doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Booking Number: ", 50, 260)
        .text(invoice.general.bookingno, 50, 280)
        .fontSize(10)
        .font("Helvetica")
        .text("POL: " + invoice.general.POL, 200, 260)
        .font("Helvetica")
        .fontSize(10)
        .text("POD: " +invoice.general.POD, 200, 280)
        .font("Helvetica")
        .fontSize(10)
        .text("Cntrs: " + invoice.general.cntr_numbers, 350, 260)
        .font("Helvetica")

        generateHr(doc, 300);
      }
      
      function generateCustomerInformation(doc, invoice) {
        doc
          .fillColor("#444444")
          .fontSize(15)
          .text("Invoice: "+ invoice.invoice_nr , 50, 160)
          .fontSize(13)
          .text ("Date: "+ formatDate(new Date()))
      
        //generateHr(doc, 185);
      
        const customerInformationTop = 200;
      /*
        doc
          .fontSize(10)
          .text("Invoice Number:", 50, customerInformationTop)
          .font("Helvetica-Bold")
          .text(invoice.invoice_nr, 150, customerInformationTop)
          .font("Helvetica")
          .text("Invoice Date:", 50, customerInformationTop + 15)
          .text(formatDate(new Date()), 150, customerInformationTop + 15)
          /*
          .text("Balance Due:", 50, customerInformationTop + 30)
          .text(
            formatCurrency(invoice.subtotal - invoice.paid),
            150,
            customerInformationTop + 30
          )
          
      
          .font("Helvetica-Bold")
          .text(invoice.shipping.name, 300, customerInformationTop)
          .font("Helvetica")
          .text(invoice.shipping.address, 300, customerInformationTop + 15)
          
          .text(
            
            /*
            invoice.shipping.city +
              ", " +
              invoice.shipping.state +
              ", " +
              invoice.shipping.country,
              
            300,
            
            customerInformationTop + 30
            
          )
          .moveDown();
          */
      
        //generateHr(doc, 252);
      }
      
      function generateInvoiceTable(doc, invoice) {
        let i;
        const invoiceTableTop = 330;
      
        doc.font("Helvetica-Bold");
        generateTableRow(
          doc,
          invoiceTableTop,
          "Item",
          "Description",
          "Price",
          "QTE",
          "Amount"
        );
        generateHr(doc, invoiceTableTop + 20);
        doc.font("Helvetica");
      
        for (i = 0; i < invoice.items.length; i++) {
          const item = invoice.items[i];
          const position = invoiceTableTop + (i + 1) * 30;
          generateTableRow(
            doc,
            position,
            item.item,
            item.description,
            formatCurrency(item.amount*100),
            item.quantity,
            formatCurrency(item.amount*item.quantity*100)
          );
      
          generateHr(doc, position + 20);
        }
      
        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
        /*
        generateTableRow(
          doc,
          subtotalPosition,
          "",
          "",
          "Subtotal",
          "",
          formatCurrency(invoice.subtotal)
        );
      
        const paidToDatePosition = subtotalPosition + 20;
        generateTableRow(
          doc,
          paidToDatePosition,
          "",
          "",
          "Paid To Date",
          "",
          formatCurrency(invoice.paid)
        );
      
        const duePosition = paidToDatePosition + 25;
        doc.font("Helvetica-Bold");
        generateTableRow(
          doc,
          duePosition,
          "",
          "",
          "Balance Due",
          "",
          formatCurrency(invoice.subtotal - invoice.paid)
        );
        */
        doc.font("Helvetica");
      }
      
      
      function generateFooter(doc) {
        generateHr(doc, 645);
        generateHr(doc, 665);

        doc
          .fontSize(10)
          .text(
            "TOTAL: " ,
            50,
            650,
            { align: "right"}
          )
          .text ("VAT = 0%, International freight service", 50, 670, {align: 'center'})
          .text ("ALL BANK CHARGES ARE FOR ACCOUNT OF PAYER",  {align: 'center'})
          .text ("Valid without signature", {align: 'center'})
          .image("SLOY_footer.jpg", 50, 750, { width: 600 })

      }
      
      function generateTableRow(
        doc,
        y,
        item,
        description,
        unitCost,
        quantity,
        lineTotal
      ) {
        doc
          .fontSize(10)
          .text(item, 50, y)
          .text(description, 75, y, {width: 240, height: 30, align: "left"})
          .text(unitCost, 280, y, { width: 90, align: "right" })
          .text(quantity, 370, y, { width: 90, align: "right" })
          .text(lineTotal, 0, y, { align: "right" });
      }
      
      function generateHr(doc, y) {
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(50, y)
          .lineTo(550, y)
          .stroke();
      }
      
      function formatCurrency(cents) {
        
        if (currency == "EUR") {
          console.log ("curr" + currency)
          return "EUR "+ (cents / 100).toFixed(2);
        }
        console.log ("curr" + currency)
        return "USD " + (cents / 100).toFixed(2);
      }
      
      function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
      
        return day + "/" + month + "/"  + year;
      }
      module.exports = {
        createInvoice
      };