// Registro dos modulos do Ato V refeito (chefes e comuns). O GameCanvas importa este arquivo uma vez.
// So agem se os tipos entram em campo — e so entram com ATO5_REFEITO (components/data/atos.ts).
import { registrarChefe } from './index';
import { sargentoAshfen } from './sargento_ashfen';
import { tesoureiro } from './tesoureiro';
import { chefeSaqueador } from './chefe_saqueador';
import { capitaoAshfen } from './capitao_ashfen';
import { lichColegiado } from './lich_colegiado';
import { reitor } from './reitor';
import { runaHostil, RUNAS_HOSTIS } from './comuns5r';

registrarChefe('sargento_ashfen', sargentoAshfen);
registrarChefe('tesoureiro', tesoureiro);
registrarChefe('chefe_saqueador', chefeSaqueador);
registrarChefe('capitao_ashfen', capitaoAshfen);
registrarChefe('lich_colegiado', lichColegiado);
registrarChefe('reitor', reitor);
for (const t of RUNAS_HOSTIS) registrarChefe(t, runaHostil);
