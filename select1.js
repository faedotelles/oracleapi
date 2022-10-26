const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs')
const oracledb = require('oracledb');
const dbConfig = require('./dbConfig');
const port = 3000;
const run = require('./blob')

// console.log(run(22750))

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

// at the moment, if needed use 'inner join' put in 'table' your 'inner join command' instead of 'pathtable'

// functions

app.get(`/itemprvda/:id?/:subid?`, (req, res) => {
    // const sql = createQuery(req.method, pathtable, primary, req.params.id, campos, secondary, req.params.subid, table)
    // console.log(sql)
    execSQL(`SELECT  DISTINCT I.DESCRICAO,IP.IDITEM,IP.PRECO FROM ITEMPRVDA IP 
    INNER JOIN ITEM I
    ON I.IDITEM = IP.IDITEM AND IP.ESTAB= ${req.params.id} AND IP.IDITEM = ${req.params.subid} 
    `).then((result) => {res.json(result)
        });
})
app.get(`/itemprvdab/:id?/:subid?`, (req, res) => {
    // const sql = createQuery(req.method, pathtable, primary, req.params.id, campos, secondary, req.params.subid, table)
    // console.log(sql)
    execSQL(`SELECT  DISTINCT I.DESCRICAO,I.NROCODBARR AS IDITEM,IP.PRECO FROM ITEMPRVDA IP 
    INNER JOIN ITEM I
    ON I.IDITEM = IP.IDITEM AND IP.ESTAB= ${req.params.id} AND I.NROCODBARR = ${req.params.subid} 
    `).then((result) => {res.json(result)
        });
})

app.get(`/itemimagem/:id?`, (req, res) => {
    // const sql = createQuery(req.method, pathtable, primary, req.params.id, campos, secondary, req.params.subid, table)
    // console.log(sql)
    run(`SELECT IMAGEM FROM ITEMIMAGEM WHERE ESTAB = 1000 AND IDITEM = ${parseInt(req.params.id)}`).then((result) => {
        res.json(result)
    });
})

app.get(`/itemimagemB/:id?`, (req, res) => {
    // const sql = createQuery(req.method, pathtable, primary, req.params.id, campos, secondary, req.params.subid, table)
    // console.log(sql)
    run(`SELECT IMAGEM FROM ITEMIMAGEM WHERE IDITEM = (SELECT IDITEM FROM ITEM WHERE NROCODBARR = ${parseInt(req.params.id)})`).then((result) => {
        res.json(result)
    });
})

function createQuery(method, pathtable, primary, id, campos, secondary, subid, table){
    let sql = ''
    if(method == 'GET'){
        sql +=` select ${campos} from ${table ? table : pathtable} `
        if(id){
            sql +=`where ${primary} = ${id} `
            if(subid){
                sql += `and ${secondary} = ${subid}`
            }
        }     
    }
    return sql
}

function geraDelete(pathtable, primary, secondary){
    app.delete(`/${pathtable}/:id/:subid`, (req, res) => {
        const sql = `delete from viasoftmcp.${pathtable} where ${primary} = ${req.params.id} and ${secondary} = ${req.params.subid}`
        execSQLBLOB(sql).then((result) =>{ res.json(result)});
    })
}

async function execSQL(query, maxRows) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT, maxRows: maxRows? maxRows : 1000});
        console.log(result.rows)
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

async function execSQLBLOB(sql){
    let connection
    try {
        connection = await oracledb.getConnection(dbConfig);
        let result;
         result = await connection.execute(sql);
        if(result.rows.length === 0){
            console.error('No results');
        } else {
            const clob = result.rows[0][0] ;
            console.log(clob)
            return clob
        }
    } catch (error) {
        console.error(error)
    }
}

// calls



app.listen(port);
