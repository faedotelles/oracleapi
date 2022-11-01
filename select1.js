const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs')
const oracledb = require('oracledb');
const dbConfig = require('./dbConfig');
const port = 3001;
const run = require('./blob')

// configs
let libPath;

if (process.platform === 'win32') {
    libPath = 'C:\\oracle\\instantclient_21_7'
}
if (libPath && fs.existsSync(libPath)) {
    oracledb.initOracleClient({ libDir: libPath });
}

oracledb.fetchAsString = [ oracledb.CLOB ];

app.use(express());
app.use(cors());


// gets

app.get(`/itemprvda/:id/:subid`, (req, res) => {
    const subid = req.params.subid;
    execSQL(`SELECT * FROM VIASOFTMCP.WMITEMPRECO WHERE ESTAB = ${req.params.id} AND IDITEM = CASE WHEN '${subid}' NOT IN(SELECT IDITEM FROM ITEM) THEN (SELECT IDITEM FROM ITEM WHERE NROCODBARR = '${subid}') ELSE '${subid}' END
    `).then((result) => {res.json(result)
        });
})

app.get(`/itemimagem/:id/:subid`, (req, res) => {
    const subid = req.params.subid
    run(`SELECT IMAGEM FROM ITEMIMAGEM WHERE ESTAB = ${req.params.id} AND IDITEM = CASE WHEN '${subid}' NOT IN (SELECT IDITEM FROM ITEM) THEN (SELECT IDITEM FROM ITEM WHERE NROCODBARR = '${subid}') ELSE '${subid}' END`).then((result) => {
        res.json(result)
    });
})

// functions
async function execSQL(query, maxRows) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT, maxRows: maxRows? maxRows : 1000});
        connection.commit()
        return result.rows
    } catch (err) {
        console.error(err);
    } finally {
        try {
            connection.close();
        } catch (err) {
            console.error(err)
        }
    }
}

// calls

app.listen(port);
