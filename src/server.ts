import "dotenv/config"
import App from "./index"
const PORT = process.env.APP_PORT || 3001;

new App().start(PORT);