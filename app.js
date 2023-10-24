const oracledb = require('oracledb');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const port = 8000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'FrontEnd.html'));
});

app.listen(port, () => {
    console.log(`Servidor está ouvindo na porta ${port}`);
});

const dbConfig = {
    user: 'LEO',
    password: 'renataematheus',
    connectString: 'localhost:1521/xepdb1' // Corrigido o formato da conexão
};

async function inserirAeronave(modelo, numero_identificacao, fabricante, ano_fabricacao, mapa_assentos) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const sql = `INSERT INTO Aeronaves (modelo, numero_identificacao, fabricante, ano_fabricacao, mapa_assentos) VALUES (:modelo, :numero_identificacao, :fabricante, :ano_fabricacao, :mapa_assentos)`;
        const bindParams = {
            modelo,
            numero_identificacao,
            fabricante,
            ano_fabricacao,
            mapa_assentos
        };

        const result = await connection.execute(sql, bindParams, { autoCommit: true });

        await connection.close();
        return result.rowsAffected; // Retorna o número de linhas afetadas
    } catch (error) {
        console.error('Erro ao inserir aeronave:', error);
        throw error;
    }
}

app.post('/inserir-aeronave', async (req, res) => {
    const { modelo, numero_identificacao, fabricante, ano_fabricacao, mapa_assentos } = req.body;

    try {
        const rowsAffected = await inserirAeronave(modelo, numero_identificacao, fabricante, ano_fabricacao, mapa_assentos);
        res.status(200).json({ message: 'Aeronave inserida com sucesso', rowsAffected });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao inserir aeronave' });
    }
});

// Restante do código para inserir outros tipos de dados (Aeroporto, Trecho, Voo)

app.listen(port, () => {
    console.log(`Servidor está ouvindo na porta ${port}`);
});
