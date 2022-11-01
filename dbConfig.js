const databaseList = {
    serverProd: {
        user: 'VIASOFTMCP',
        password: 'VIASOFTMCP',
        connectString: '11.250.34.209:1521/VIASOFT'
    },
    serverDev: {
        user: 'VIASOFTMCP',
        assword: 'VIASOFTMCP',
        connectString: '192.168.89.99:1521/ORCL2'        
    }
    
}


// Mudar para ServerProd quando no MSTSC
module.exports = dbConfig = databaseList.serverProd