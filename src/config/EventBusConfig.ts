import "./StockEvents";
import "./InviteEvents";
import "./SystemEvents";
import LoggerService from "../services/LoggerService";

export default function configureEventBus() {
    LoggerService.logInfo("📡 EventBus configured successfully.");
}
