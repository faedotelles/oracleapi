const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs')
const oracledb = require('oracledb');
const dbConfig = require('./dbConfig');
const path = require('path');
const port = 3000;

app.use(express());
app.use(cors());
// at the moment, if needed use 'inner join' put in 'table' your 'inner join command' instead of 'pathtable'
function gerarGet(pathtable, primary, campos, maxRows, secondary, table){
    app.get(`/${pathtable}/:id?/:subid?`, (req, res) => {
        let filter = declareWhere(primary, req.params.id, secondary, req.params.subid)
        const sql = `SELECT ${campos ? campos : '*'} FROM VIASOFTMCP.${table ? table : pathtable}` + filter;
        console.log(sql)
        execSQL(sql, maxRows).then((result) => {res.json(result)});
    })
}

function declareWhere(where, result, and, equal, and2 , equal2){
        let filter = ''
        if(where && result){
            filter += ` where ${where} = ${result}`
            if(and && equal){
                filter += ` and ${and} = ${equal}`
                if(and2 && equal2){
                    filter += ` and ${and2} = ${equal2}`
                }
            }
        }
        return filter
}
function geraDelete(pathtable, primary, secondary){
    app.delete(`/${pathtable}/:id/:subid`, (req, res) => {
        const sql = `DELETE FROM VIASOFTMCP.${pathtable} where ${primary} = ${req.params.id} and ${secondary} = ${req.params.subid}`
        execSQL(sql).then((result) =>{ res.json(result)});
    })
}

geraDelete('itemarquivos', 'estab', 'iditem')

gerarGet('filial', 'estab','ESTAB,RAZAOSOC,CNPJ');
gerarGet('itemprvda', 'ip.estab','ip.estab,ip.iditem,i.descricao,ip.preco',1,'ip.iditem','itemprvda ip inner join item i on ip.iditem = i.iditem ');
gerarGet('itemarquivos', 'estab','estab,iditem',null, 'iditem');
gerarGet('notaconf', 'IDNOTACONF','IDNOTACONF,ESTAB,DESCRICAO',5);
gerarGet('nota', 'estab', 'idnota,idnotaconf,estab',10, 'idnota');
gerarGet('pessoa', 'idpessoa', 'idpessoa,nome');
gerarGet('notaitem', 'estab', 'estab, iditem, idnota',1,'iditem')

let libPath;

if (process.platform === 'win32') {
    libPath = 'C:\\oracle\\instantclient_21_7'
}
if (libPath && fs.existsSync(libPath)) {
    oracledb.initOracleClient({ libDir: libPath });
}

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

app.listen(port);
