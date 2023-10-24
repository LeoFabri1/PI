const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const path = require('path');
const port = 1521;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'FrontEnd.html'));
  });
  
  app.listen(port, () => {
    console.log(`Servidor está ouvindo na porta ${port}`);
});


// Configuração do banco de dados Oracle
const dbConfig = {
  user: 'LEO',
  password: 'renataematheus',
  connectString: 'oracledb:LEO/renataematheus@//localhost:1521/xepdb1'
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/inserir-aeronave', async (req, res) => {
  const { modelo, numero_identificacao, fabricante, ano_fabricacao, mapa_assentos } = req.body;

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

    connection.close();
    res.status(200).json({ message: 'Aeronave inserida com sucesso' });
  } catch (error) {
    console.error('Erro ao inserir aeronave:', error);
    res.status(500).json({ error: 'Erro ao inserir aeronave' });
  }
});
app.listen(port, () => {
  console.log(`Servidor está ouvindo na porta ${port}`);
});

async function inserirAeronaveAeroporto(modelo, numero_identificacao, fabricante, ano_fabricacao, mapa_assentos, codigo_aeroporto, nome_aeroporto, cidade_id) {
  try {
    const connection = await oracledb.getConnection({
      user: 'LEO',
      password: 'renataematheus',
      connectString: 'oracledb:LEO/renataematheus@//localhost:1521/xepdb1'
    });

    await connection.beginTransaction();

    const aeronaveQuery = `
      INSERT INTO Aeronaves (modelo, numero_identificacao, fabricante, ano_fabricacao, mapa_assentos)
      VALUES (:modelo, :numero_identificacao, :fabricante, :ano_fabricacao, :mapa_assentos)
    `;
    const aeronaveParams = {
      modelo,
      numero_identificacao,
      fabricante,
      ano_fabricacao,
      mapa_assentos
    };
    await connection.execute(aeronaveQuery, aeronaveParams);

    const aeroportoQuery = `
      INSERT INTO Aeroportos (codigo_aeroporto, nome_aeroporto, cidade_id)
      VALUES (:codigo_aeroporto, :nome_aeroporto, :cidade_id)
    `;
    const aeroportoParams = {
      codigo_aeroporto,
      nome_aeroporto,
      cidade_id
    };
    await connection.execute(aeroportoQuery, aeroportoParams);

    await connection.commit();

    await connection.close();

    console.log('Dados inseridos com sucesso.');

  } catch (error) {
    console.error('Erro ao inserir dados:', error);
  }
}

async function inserirTrecho(origem_aeroporto_id, destino_aeroporto_id) {
  try {
    const connection = await oracledb.getConnection({
      user: 'LEO',
      password: 'renataematheus',
      connectString: 'oracledb:LEO/renataematheus@//localhost:1521/xepdb1'
    });

    await connection.beginTransaction();

    const trechoQuery = `
      INSERT INTO Trechos (origem_aeroporto_id, destino_aeroporto_id)
      VALUES (:origem_aeroporto_id, :destino_aeroporto_id)
    `;
    const trechoParams = {
      origem_aeroporto_id,
      destino_aeroporto_id
    };
    await connection.execute(trechoQuery, trechoParams);

    // Commit da transação
    await connection.commit();

    // Fechar a conexão
    await connection.close();

    console.log('Dados do trecho inseridos com sucesso.');

  } catch (error) {
    console.error('Erro ao inserir dados do trecho:', error);
  }
}

async function inserirVoo(data, trecho_id, horario_partida, horario_chegada, aeroporto_saida_id, aeroporto_chegada_id, valor_assento) {
  try {
    // Configurar a conexão com o banco de dados
    const connection = await oracledb.getConnection({
      user: 'LEO',
      password: 'renataematheus',
      connectString: 'oracledb:LEO/renataematheus@//localhost:1521/xepdb1'
    });

    // Iniciar uma transação
    await connection.beginTransaction();

    // Inserir dados na tabela Voos
    const vooQuery = `
      INSERT INTO Voos (voo_id, data, trecho_id, horario_partida, horario_chegada, aeroporto_saida_id, aeroporto_chegada_id, valor_assento)
      VALUES (SEQUENCE_VOOS.NEXTVAL, :data, :trecho_id, TO_TIMESTAMP(:horario_partida, 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP(:horario_chegada, 'YYYY-MM-DD HH24:MI:SS'), :aeroporto_saida_id, :aeroporto_chegada_id, :valor_assento)
    `;
    const vooParams = {
      data,
      trecho_id,
      horario_partida,
      horario_chegada,
      aeroporto_saida_id,
      aeroporto_chegada_id,
      valor_assento
    };
    await connection.execute(vooQuery, vooParams);

    // Commit da transação
    await connection.commit();

    // Fechar a conexão
    await connection.close();

    console.log('Dados do voo inseridos com sucesso.');

  } catch (error) {
    console.error('Erro ao inserir dados do voo:', error);
  }
}