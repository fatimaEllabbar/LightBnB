const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return  pool.query(`
  SELECT * FROM users WHERE  email=$1;`,[email.toLowerCase()])
  .then(res => {
    if(res.rows.length > 0) {
      return res.rows[0];
    } else {
      return null;
    }
  })
  .catch(err => console.error('query error', err.stack));
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return  pool.query(`
  SELECT * FROM users WHERE  id=$1;`,[id])
  .then(res => {
    if(res.rows.length > 0) {
      console.log(res.rows[0])
      return res.rows[0];
    } else {
      return null;
    }
  })
  .catch(err => console.error('query error', err.stack));
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return  pool.query(`
  insert into users(name,email,password) values($1,$2,$3) RETURNING *;`,[user.name,user.email,user.password])
  .then(res => {
    console.log("added")
      console.log(res.rows[0])
      return res.rows[0];
  })
  .catch(err => console.error('query error', err.stack));
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return  pool.query(`
  select properties.*,reservations.* ,avg(rating) as average_rating from properties 
  inner join reservations on reservations.property_id=properties.id
  inner join property_reviews on property_reviews.property_id=properties.id
  inner join users on users.id=reservations.guest_id
  where users.id= $1 and end_date < now()
  group by properties.id , reservations.id
  order by start_date
  limit $2;
  `,[guest_id,limit])
  .then(res => {
    return res.rows;
  })
  .catch(err => console.error('query error', err.stack));
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
   // 1
   const queryParams = [];
   // 2
   let queryString = `
   SELECT properties.*, avg(property_reviews.rating) as average_rating
   FROM properties
   JOIN property_reviews ON properties.id = property_id
   `;
 
   // 3
   if (options.city) {
     queryParams.push(`%${options.city}%`);
     queryString += `WHERE city LIKE $${queryParams.length} `;
   }
   if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `and owner_id=$${queryParams.length} `;
   }
   if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryString += `and  cost_per_night >= $${queryParams.length} `;
   }
   if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    queryString += `and  cost_per_night <= $${queryParams.length} `;
   }

   queryString += `
  GROUP BY properties.id ` ;
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += ` HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
   }

  // 4
  queryParams.push(limit);
  queryString += ` 
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams)
  .then(res => res.rows); 
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
