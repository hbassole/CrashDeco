function HTMLtoPDF(){
var pdf = new jsPDF('p', 'pt', 'letter');
 pdf.cellInitialize();
    pdf.setFontSize(10);

    $.each( $('#HTMLtoPDF tr'), function (i, row){
        $.each( $(row).find("td, th"), function(j, cell){
            var txt = $(cell).text().trim() || " ";
            var width = (j==4) ? 40 : 70; //make 4th column smaller
            pdf.cell(10, 50, width, 30, txt, i);
        });
        return (row[1]);
    });

    pdf.save('sample-file.pdf');		
}