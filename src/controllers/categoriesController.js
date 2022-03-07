import connection from '../database/db.js';

export async function getCategories( req, res ) {
  try {
    const { rows } = await connection.query(`SELECT * FROM categories`)

    res.send(rows).status(200);
  } catch (err) {
    res.status(500).send(err);
  } 
}

export async function insertCategory( req, res ) {
  const { name } = req.body;

  try {
    const { rows: [category]} = await connection.query(`
      SELECT *
        FROM categories
      WHERE categories.name = $1
    `, [name]);
 
    if(!category) {
      await connection.query(`
        INSERT 
          INTO categories (name)
          VALUES ($1)
      `, [name]);

      res.sendStatus(201);
    }

    res.status(409).send('category already exists');

  } catch (err) {
    res.status(500).send(err);
  }
}