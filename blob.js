const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');

let libPath;
if (process.platform === 'win32') {           // Windows
  libPath = 'C:\\oracle\\instantclient_19_12';
} else if (process.platform === 'darwin') {   // macOS
  libPath = process.env.HOME + '/Downloads/instantclient_19_8';
}
if (libPath && fs.existsSync(libPath)) {
  oracledb.initOracleClient({ libDir: libPath });
}


// oracledb.fetchAsString = [ oracledb.CLOB ];
// oracledb.fetchAsBuffer = [ oracledb.BLOB ];

function baseto64(file){
  return new Buffer.from(file).toString('base64')
}

module.exports = async function run(sql) {

  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);


    let result;

    // CLOB
    // result = await connection.execute(
    // //   `SELECT IMAGEM FROM ITEMIMAGEM WHERE ESTAB = 1000 AND IDITEM = 4164 `,
    // //    { fetchInfo: {"IMAGEM": {type: oracledb.STRING}} })
    // // );

    // if (result.rows.length === 0)
    //   throw new Error("No row found");

    // const clob = result.rows[0][0];
    // console.log('The CLOB was: ');
    // console.log(clob);


    // Fetch a BLOB
    result = await connection.execute(
      sql,
      []
      // An alternative to oracledb.fetchAsBuffer is to use fetchInfo on the column:
      , { fetchInfo: {"IMAGEM": {type: oracledb.BUFFER}} }
    );

    if (result.rows.length === 0)
      throw new Error("No row found");

    const blob = result.rows[0][0];
    
    return baseto64(blob)

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
