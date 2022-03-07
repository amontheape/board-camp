import connection from "../database/db.js";

export async function getGames( req, res ) {
  const { name } = req.query;

  try {
    if (name === undefined) {
      const { rows: games } = await connection.query(`
        SELECT games.*, categories.name AS "categoryName"
        FROM games
          JOIN categories ON games."categoryId"=categories.id
      `);

       return res.send(games);
    } else {
      const { rows: games } = await connection.query(`
        SELECT games.*, categories.name AS "categoryName"
        FROM games
          JOIN categories ON games."categoryId"=categories.id
        WHERE LOWER(games.name) LIKE LOWER($1)
      `, [`${name}%`]);

      return res.send(games);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

export async function insertGame( req, res ) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  try {
    const { rows: categories } = await connection.query(`SELECT id FROM categories`);
    if (!categories.some(id => categoryId === id)) return res.status(400).send('category does not exists');

    const { rows: game } = await connection.query(`
      SELECT * 
        FROM games
      WHERE games.name = $1 
    `, [name]);


    if(!game) {
      await connection.query(`
        INSERT 
          INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
          VALUES ( $1, $2, $3, $4, $5)
        `, [name, image, stockTotal, categoryId, pricePerDay]);

      return res.sendStatus(201);
    }

    res.status(409).send('game already exists');

  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}