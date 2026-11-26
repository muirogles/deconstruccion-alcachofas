// Entry point: styles + progressive enhancements. The page is fully readable without JS.
import './styles/main.css';
import { initNavigation } from './modules/navigation.js';
import { initSlots } from './modules/slots.js';
import { initCopy } from './modules/copy.js';
import { initService } from './modules/service.js';
import { initQrDialog } from './modules/qr-dialog.js';
import { initI18n } from './modules/i18n.js';
import { initIllustrations } from './modules/illustrations.js';

document.documentElement.classList.add('has-js');

initI18n();
initIllustrations();
initNavigation();
initSlots();
initCopy();
initService();
initQrDialog();
