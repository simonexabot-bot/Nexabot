const priceEl = document.querySelector('#market-price');
const changeEl = document.querySelector('#market-change');
const line = document.querySelector('#market-line');
const label = document.querySelector('#market-state');
const prices = [];

const draw = () => {
  if (prices.length < 2) return;
  const min = Math.min(...prices), max = Math.max(...prices), range = max - min || 1;
  line.setAttribute('points', prices.map((price, i) => `${(i / (prices.length - 1)) * 500},${180 - ((price - min) / range) * 150}`).join(' '));
};
let socket, reconnectTimer, reconnectAttempts = 0, intentionallyClosed = false;
function connect() {
socket = new WebSocket('wss://ws-feed.exchange.coinbase.com');
socket.onopen = () => { reconnectAttempts = 0; socket.send(JSON.stringify({ type: 'subscribe', product_ids: ['BTC-USD'], channels: ['ticker'] })); };
socket.onmessage = ({ data }) => {
  const tick = JSON.parse(data);
  if (tick.type !== 'ticker' || tick.product_id !== 'BTC-USD') return;
  const price = Number(tick.price), open = Number(tick.open_24h), change = ((price - open) / open) * 100;
  priceEl.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(price);
  changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}% today`;
  changeEl.style.color = change >= 0 ? 'var(--aqua)' : 'var(--danger)';
  label.textContent = 'BTC / USD · Live Coinbase market data';
  prices.push(price); if (prices.length > 50) prices.shift(); draw();
};
socket.onerror = () => { label.textContent = 'Live market feed unavailable'; socket.close(); };
socket.onclose = () => { if (intentionallyClosed) return; label.textContent = 'Live market feed reconnecting…'; const delay = Math.min(30000, 1000 * 2 ** reconnectAttempts++); clearTimeout(reconnectTimer); reconnectTimer = setTimeout(connect, delay); };
}
document.addEventListener('visibilitychange', () => { if (document.hidden) return; if (!socket || socket.readyState === WebSocket.CLOSED) { clearTimeout(reconnectTimer); connect(); } });
window.addEventListener('beforeunload', () => { intentionallyClosed = true; clearTimeout(reconnectTimer); socket?.close(); });
connect();
