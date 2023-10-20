// async function Tempo(request, response) {
//     const apiSecret = process.env.SECRET_API_KEY;
//     const dynamicDate = new Date();

//     const stockResponse = await fetch(`https://brapi.dev/api/quote/ciel3`);
//     const stockResponseJson = await stockResponse.json();
//     const valor = stockResponseJson.results[0].regularMarketPrice;

//     response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

//     response.json({
//         date: dynamicDate.toGMTString(),
//         valor: valor
//     });
// }


// export default Tempo;