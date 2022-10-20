// execSQL(`SELECT ESTAB,RAZAOSOC,CNPJ FROM VIASOFTMCP.FILIAL`).then((result) => {
//     if (result) console.log(createEstab(result, 1000).ESTAB)
// })

// async function run() {
//     let connection;
//     try {

//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT ESTAB,RAZAOSOC,CNPJ FROM VIASOFTMCP.FILIAL`
//         );
//         const resultado = result.rows;

//         const object = createEstab(resultado, 2000);
//         // console.log(object)

//     } catch (err) {
//         console.error(err)
//     } finally {
//         try {
//             await connection.close()
//         } catch (err) {
//             console.error(err)
//         }
//     }
// }

// function returnEstab(result, estab) {
//     for (i = 0; i < result.length; i++) {
//         if (result.at(i).at(0) == estab) {
//             return i
//         }
//     }
// }

// function createEstab(rows){
//     const objs = []
//     for(i = 0; i < rows.length; i++){
//         objs.push({
//             ESTAB  : rows.at(i).at(0),
//             RAZAOSOC : rows.at(i).at(1),
//             CNPJ : rows.at(i).at(2)
//         })
//     }
//     return objs
// }

// app.get(`/filial/:estab?`, (req, res) => {
//     let filter = ''; 
//     if(req.params.estab){filter += ` WHERE ESTAB = ${parseInt(req.params.estab)}`}
//     const sql = `SELECT ESTAB,RAZAOSOC,CNPJ FROM VIASOFTMCP.FILIAL` + filter;
//     execSQL(sql).then((result) => {res.json(createEstab(result))})
// })

// function createEstab(result) {
//         const estabs = [];
//         for (i = 0; i < result.length; i++) {
//             estabs.push({
//                 ESTAB: result.at(i).at(0), // at(0) index of column and at(index) index of result row 
//                 RAZAOSOC: result.at(i).at(1),
//                 CNPJ: result.at(i).at(2)
//             })
//         }
//         return estabs
// }

// function declareWhere(where, result, and, equal, and2 , equal2){
//         let filter = ''
//         if(where && result){
//             filter += ` where ${where} = ${result}`
//             if(and && equal){
//                 filter += ` and ${and} = ${equal}`
//                 if(and2 && equal2){
//                     filter += ` and ${and2} = ${equal2}`
//                 }
//             }
//         }
//         return filter
// }