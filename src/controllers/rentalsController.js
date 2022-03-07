import connection from '../database/db.js';
import dayjs from 'dayjs';

export async function getRentals( req, res ) {
  const { customerId, gameId } = req.query;

  let query = "";

  if (customerId) query = `WHERE customers.id=${parseInt(customerId)}`;
  if (gameId) query = `WHERE games.id=${parseInt(gameId)}`;
  
  try {
    const { rows: rentals } = await connection.query(`
      SELECT 
        rentals.*, 
        customers.id AS "customerId",
        customers.name AS "customerName",
        games.id AS "gameId",
        games.name AS "gameName",
        categories.name AS "categoryName"
      FROM rentals
        JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id
        JOIN categories ON games."categoryId" = categories.id
      ${query}
    `);

    const formatted = rentals.map( rental => ({
      id: rental.id,
      customerId: rental.customerId,
      gameId: rental.gameId,
      rentDate: dayjs(rental.rentDate).format("YYYY-MM-DD"),
      daysRented: rental.daysRented,
      returnDate: rental.returnDate !== null 
        ? dayjs(rental.rentDate).format("YYYY-MM-DD")
        : rental.returnDate,
      originalPrice: rental.originalPrice,
      delayFee: rental.delayFee, 
      customer: {
        id: rental.customerId,
        name: rental.customerName,
      },
      game: {
        id: rental.gameId,
        name: rental.gameName,
        categoryId: rental.categoryId,
        categoryName: rental.categoryName,
      },
    }));

    res.status(200).send(formatted);

  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

export async function insertRental( req, res ) {
  const { customerId, gameId, daysRented } = req.body;

  try {
    if ( daysRented <= 0 ) return res.status(400).send('unspecified number of days')

    const { rows: customersIds } = await connection.query(`SELECT id FROM customers`);
    if (!customersIds.some( e => e.id == customerId )) return res.status(400).send('clientId not found');

    const { rows: gameIds } = await connection.query(`SELECT * FROM games`);
    if (!gameIds.some( e => e.id == gameId )) return res.status(400).send('gameId not found');

    const { rows: numberRentals } = await connection.query(`
      SELECT ALL FROM rentals
      WHERE rentals."gameId"= $1 AND rentals."delayFee" IS NULL
    `, [gameId]);
    if ( numberRentals.length === gameIds.find( game => game.id === gameId).stockTotal) return res.status(409).send('game not available');

    const { rows: gamePrice } = await connection.query(`SELECT "pricePerDay" FROM games WHERE games.id=$1`, [gameId]);
    
    await connection.query(`
      INSERT
        INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [customerId, gameId, dayjs(), daysRented, null, (daysRented * gamePrice[0].pricePerDay), null]);

    res.sendStatus(201);
    
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

export async function returnRental( req, res ) {
  const { id } = req.params;

  try {
    const { rows: rental } = await connection.query(`SELECT * FROM rentals WHERE id=$1`, [id]);
    const { rentDate , returnDate, originalPrice, daysRented } = rental[0];

    const { rows: rentalsIds } = await connection.query(`SELECT id FROM rentals`);
    if (!rentalsIds.some( e => e.id == rental[0].id )) return res.status(404).send('rentalId not found');

    if( returnDate !== null ) return res.status(400).send('rental already finished');

    const supposedToReturn = dayjs(rentDate).add(daysRented, 'day');
    const delay = parseInt(dayjs().diff(supposedToReturn, 'day'));

    let delayFee = 0; 
    if ( delay <= 0 ) delayFee = 0;
    else delayFee = delay * ( originalPrice / daysRented );

    await connection.query(`
      UPDATE rentals
        SET "returnDate" = $1,
            "delayFee"   = $2
      WHERE id = $3 
    `, [dayjs(), delayFee, id]);

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

export async function deleteRental( req, res ) {
  const { id } = req.params;
  const { rows: rental } = await connection.query(`SELECT id FROM rentals WHERE id=$1`, [id]);
    
  try {
    const { rows: rentalsIds } = await connection.query(`SELECT id FROM rentals`);
    if (!rentalsIds.some( e => e.id == rental[0].id )) return res.status(404).send('rentalId not found');

    const { rows: aintReturned } = await connection.query(`
      SELECT * FROM rentals
      WHERE rentals.id=$1 AND rentals."returnDate" IS NULL
    `, [id]);

    if(!aintReturned.length) return res.status(400).send('rental already finished');

    await connection.query(`
      DELETE 
        FROM rentals
      WHERE id = $1
    `, [id]);

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}
