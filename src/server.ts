import "dotenv/config";
import App from "./index";

const PORT = process.env.APP_PORT || 30001; // HTTP port

new App().start(PORT);
