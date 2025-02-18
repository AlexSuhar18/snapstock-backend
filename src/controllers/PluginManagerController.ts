import { Request, Response, Router } from 'express';
import PluginManager from '../core/PluginManager';

const router = Router();

/**
 * ✅ Obține lista modulelor active/inactive
 */
router.get('/', (req: Request, res: Response) => {
  res.json(PluginManager.getModules());
});

/**
 * ✅ Activează un modul
 */
router.post('/enable/:moduleName', (req: Request, res: Response) => {
  const { moduleName } = req.params;
  PluginManager.enableModule(moduleName);
  res.json({ message: `Module ${moduleName} enabled.` });
});

/**
 * ✅ Dezactivează un modul
 */
router.post('/disable/:moduleName', (req: Request, res: Response) => {
  const { moduleName } = req.params;
  PluginManager.disableModule(moduleName);
  res.json({ message: `Module ${moduleName} disabled.` });
});

/**
 * ✅ Reîncarcă modulele din config
 */
router.post('/reload', (req: Request, res: Response) => {
  PluginManager.reloadModules();
  res.json({ message: 'Modules reloaded.' });
});

export default router;
