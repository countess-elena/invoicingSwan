const fs = require("fs");
const PDFDocument = require("pdfkit");
var currency="";
//const blobStream = require('blob-stream');

function createInvoice(invoice, path) {
// Create a document
const doc = new PDFDocument({ size: "A4", margin: 50 });
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
        doc
          .image("548187154.jpeg", 50, 45, { width: 50 })
          .fillColor("#444444")
          .fontSize(20)
          .text(invoice.shipping.ourCompany, 110, 57)
          .fontSize(10)
          .text(invoice.shipping.ourCompany, 200, 50, { align: "right" })
          .text("123 Main Street", 200, 65, { align: "right" })
          .text("New York, NY, 10025", 200, 80, { align: "right" })
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
          .fontSize(20)
          .text("Invoice", 50, 160);
      
        generateHr(doc, 185);
      
        const customerInformationTop = 200;
      
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
          */
      
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
            */
          )
          .moveDown();
      
        generateHr(doc, 252);
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
          "Unit Cost",
          "Quantity",
          "Line Total"
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
            formatCurrency(item.amount / item.quantity),
            item.quantity,
            formatCurrency(item.amount)
          );
      
          generateHr(doc, position + 20);
        }
      
        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
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
        doc.font("Helvetica");
      }
      
      function generateFooter(doc) {
        doc
          .fontSize(10)
          .text(
            "Payment is due within 15 days. Thank you for your business.",
            50,
            780,
            { align: "center", width: 500 }
          );
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
          .text(description, 75, y)
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
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
      
        return year + "/" + month + "/" + day;
      }
      module.exports = {
        createInvoice
      };