async function returnData(){
    try {
        const response = await fetch('http://127.0.0.1:3000/notanfse');
        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
    }
}

returnData().then((response) => {
    console.log(response[0].PDFRPS)
    showPDF(response[0].PDFRPS)
})
const divIMG = document.getElementById('nfsepdf');

function showPDF(base64){
    let output = `<img src="data:image/png;base64,${base64}">`
    divIMG.innerHTML = output;
}