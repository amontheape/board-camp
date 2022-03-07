import connection from "../database/db.js";

export async function getCustomers( req, res ) {
  const { cpf } = req.query;
  const { id } = req.params;

  try {
    if (cpf) {
      const { rows: customersByCPF } = await connection.query(`
        SELECT * FROM customers 
        WHERE cpf LIKE $1
      `, [`${cpf}%`]);

      return res.send(customersByCPF);
    }

    if (id) {
      const customer = await connection.query(`
        SELECT * FROM customers
        WHERE customers.id=$1
      `, [id]);

      if(customer.rowCount === 0) return res.sendStatus(404);
      return res.send(customer.rows[0])
    }

    const { rows: customers } = await connection.query(`SELECT * FROM customers`);

    res.send(customers);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

export async function insertCustomer( req, res ) {
  const { name, phone, cpf, birthday } = req.body;

  try {
    const { rows: registeredCPFs } = await connection.query(`SELECT cpf FROM customers`);

    if ( registeredCPFs.some( e => e.cpf === cpf)) return res.status(409).send('CPF already registered');

    await connection.query(`
      INSERT 
        INTO customers ( name, phone, cpf, birthday )
        VALUES ( $1, $2, $3, $4)
    `, [name, phone, cpf, birthday]);

    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

export async function updateCustomer( req, res ) {
  const { name, phone, cpf, birthday } = req.body;
  const { id } = req.params;

  try {
    const { rows: customersIds } = await connection.query(`SELECT id FROM customers`);
    console.log(customersIds)

    if (!customersIds.some( e => e.id == id )) return res.status(404).send('clientId not found');

    await connection.query(`
      UPDATE customers 
        SET name = $1, phone = $2, cpf = $3, birthday = $4
      WHERE id = $5
    `, [name, phone, cpf, birthday, id]);

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}