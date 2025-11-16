const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:4200", methods: ["GET", "POST"] }
});
const PORT = 3000;

app.use(cors());
app.use(express.json());

let routes = [
  { id: 1, name: 'Viagem Centro -> Bairro A', basePrice: 20.00, currentPrice: 20.00 },
  { id: 2, name: 'Viagem Centro -> Bairro B', basePrice: 15.00, currentPrice: 15.00 },
  { id: 3, name: 'Viagem Aeroporto -> Hotel', basePrice: 50.00, currentPrice: 50.00 }
];

let simulationContext = "Iniciando...";

app.get('/products', (req, res) => {
  res.json(routes);
});

function getSimulationFactors() {
  const hour = new Date().getHours();
  let timeOfDay;
  let timeMultiplier = 1.0;

  if (hour >= 7 && hour < 10) {
    timeOfDay = "Pico da Manhã";
    timeMultiplier = 1.4;
  } else if (hour >= 17 && hour < 20) {
    timeOfDay = "Pico da Noite";
    timeMultiplier = 1.5;
  } else if (hour >= 22 || hour < 5) {
    timeOfDay = "Madrugada";
    timeMultiplier = 1.1;
  } else {
    timeOfDay = "Horário Normal";
    timeMultiplier = 1.0;
  }

  const isRaining = Math.random() < 0.1;
  const weatherMultiplier = isRaining ? 1.3 : 1.0;

  const isEvent = Math.random() < 0.05;
  const eventMultiplier = isEvent ? 1.8 : 1.0;
  
  const totalMultiplier = timeMultiplier * weatherMultiplier * eventMultiplier;

  let context = `${timeOfDay}. `;
  if (isRaining) context += "Chovendo. ";
  if (isEvent) context += "Evento na cidade! ";
  
  simulationContext = context;
  return totalMultiplier;
}

function applyDynamicPricing() {
  const multiplier = getSimulationFactors();

  routes = routes.map(route => {
    let routeMultiplier = multiplier;
    if (route.id === 3 && multiplier < 1.5) {
      routeMultiplier = (multiplier - 1.0) * 0.5 + 1.0;
    }

    const newPrice = route.basePrice * routeMultiplier;
    const finalPrice = parseFloat(newPrice.toFixed(2));
    return { ...route, currentPrice: finalPrice };
  });
}

setInterval(() => {
  applyDynamicPricing();

  io.emit('price-update', { 
    products: routes,
    context: simulationContext
  });

  console.log(`SIMULAÇÃO: ${simulationContext} | Preços emitidos.`);

}, 5000);


io.on('connection', (socket) => {
  console.log('Um usuário (Angular) se conectou');
  socket.emit('price-update', { products: routes, context: "Conectado" });
});

server.listen(PORT, () => {
  console.log(`Servidor CoinPilot (Backend V4 - Viagens) rodando em http://localhost:${PORT}`);
});