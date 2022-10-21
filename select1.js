const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs')
const oracledb = require('oracledb');
const dbConfig = require('./dbConfig');
const port = 3000;

app.use(express());
app.use(cors());
// at the moment, if needed use 'inner join' put in 'table' your 'inner join command' instead of 'pathtable'
function geraGet(pathtable, primary, campos, maxRows, secondary, table){
    app.get(`/${pathtable}/:id?/:subid?`, (req, res) => {
        console.time(`RESPONSE TIME request`)
        const sql = createQuery(req.method, pathtable, primary, req.params.id, campos, secondary, req.params.subid, table)
        console.log(sql)
        execSQL(sql, maxRows).then((result) => {res.json(result)
            });
            console.timeEnd(`RESPONSE TIME request`)
    })
}
app.get('/balanco1/:id/:subid', (req, res) => {
    console.time('BALANCO1: ')
    const sql = `SELECT * FROM BALANCO WHERE ESTAB = ${req.params.id} AND IDBALANCO = ${req.params.subid} `
    execSQL(sql).then((result) => {
        res.json(result)
    })
    console.timeEnd('BALANCO1: ')
})// somente balanco

function geraGetSQL(sql, pathtable){
    console.time('geraget')
    app.get(`/${pathtable}/:id?/`, (req, res) => {
        execSQL(sql).then((result) => {res.json(result)
        console.timeEnd('geraend')});
    })
}

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




geraDelete('itemarquivos', 'estab', 'iditem')

geraGet('balanco', 'estab', 'estab,idbalanco,descricao',null , 'idbalanco' )

geraGet('filial', 'estab','estab,razaosoc,cnpj');
geraGet('itemprvda', 'ip.estab','ip.estab,ip.iditem,i.descricao,ip.preco',1,'ip.iditem','itemprvda ip inner join item i on ip.iditem = i.iditem ');
geraGet('itemarquivos', 'estab','estab,iditem',null, 'iditem');
geraGet('notaconf', 'idnotaconf','idnotaconf,estab,descricao',5);
geraGet('nota', 'estab', 'idnota,idnotaconf,estab',10, 'idnota');
geraGet('pessoa', 'idpessoa', 'idpessoa,nome');
geraGet('notaitem', 'estab', 'estab, iditem, idnota',1,'iditem')
geraGetSQL(`select pdfrps from notanfse where idnota = 306264 and estab = 2000`, 'notanfse')



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
oracledb.fetchAsString = [ oracledb.CLOB ];

async function execSQLBLOB(){
    let connection
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`select codigobarras from duprec where codigobarras is not null`);
        
        if(result.rows.length === 0){
            console.error('No results');
        } else {
            const clob = result.rows[0][0] ;
            console.log(clob)
        }
    } catch (error) {
        console.error(error)
    }
}

app.listen(port);

