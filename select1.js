const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs')
const oracledb = require('oracledb');
const dbConfig = require('./dbConfig');
const { maxRows } = require('oracledb');
const path = require('path');
const port = 3000;

app.use(express());
app.use(cors());

function gerarGet(pathtable, primary, campos, maxRows){
    app.get(`/${pathtable}/:id?`, (req, res) => {
        let filter = req.params.id ? ` WHERE ${primary} = ${parseInt(req.params.id)}` : ''; 
        const sql = `SELECT ${campos ? campos : '*'} FROM VIASOFTMCP.${pathtable}` + filter;
        execSQL(sql, maxRows).then((result) => {res.json(result)})
    })
}

function geraDelete(pathtable, primary, subprimary){
    app.delete(`/${pathtable}/:id/:subid`, (req, res) => {
        const sql = `DELETE FROM VIASOFTMCP.${pathtable} where ${primary} = ${req.params.id} and ${subprimary} = ${req.params.subid}`
        execSQL(sql).then((result) =>{ res.json(result)})
    })
}



geraDelete('itemarquivos', 'estab', 'iditem')
gerarGet('filial', 'estab','ESTAB,RAZAOSOC,CNPJ');
gerarGet('itemarquivos', 'iditem','estab,iditem');
gerarGet('notaconf', 'IDNOTACONF','IDNOTACONF,ESTAB,DESCRICAO',5);
gerarGet('nota', 'idnota', 'idnota,idnotaconf,estab',10);
gerarGet('pessoa', 'idpessoa', 'idpessoa,nome');

let libPath;

if (process.platform === 'win32') {
    libPath = 'C:\\oracle\\instantclient_21_7'
}
if (libPath && fs.existsSync(libPath)) {
    oracledb.initOracleClient({ libDir: libPath });
}

async function execSQL(execSQL, maxRows) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(execSQL, [], { outFormat: oracledb.OUT_FORMAT_OBJECT, maxRows: maxRows? maxRows : 1000});
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

app.listen(port);
