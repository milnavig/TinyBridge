import express from 'express';

import mainController from '../controllers/mainController';

const router = express.Router();

// route for generating short urls
router.post('/generate', mainController.generate);
// route for short urls
router.get('/:short_hash', mainController.getShortLink);

export default router;