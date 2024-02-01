import mysql from "mysql2/promise";

export async function query({ query, values = [] }) {
  try {
    // PlanetScale;
    // const dbconnection = await mysql.createConnection(
    //   process.env.MYSQL_DATABASE_URL
    // );

    // Digital ocean ubuntu
    const dbconnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST2,
      database: process.env.MYSQL_DATABASE2,
      user: process.env.MYSQL_USER2,
      password: process.env.MYSQL_PASSWORD2,
    });

    const [results] = await dbconnection.execute(query, values);
    dbconnection.end();
    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}
