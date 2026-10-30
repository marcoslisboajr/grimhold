// Registro dos modulos do Ato VIII (chefes e comuns). O GameCanvas importa este arquivo uma vez.
import { registrarChefe } from './index';
import { capitaoAfogado } from './capitao_afogado';
import { maeDasAguas, AGUAS_VIVAS } from './mae_das_aguas';
import { garuda } from './garuda';
import { reiCaranguejo } from './rei_caranguejo';
import { serpenteAncia } from './serpente_ancia';
import { kraken } from './kraken';
import { aguaViva, tartaruga } from './comuns8';

registrarChefe('capitao_afogado', capitaoAfogado);
registrarChefe('mae_das_aguas', maeDasAguas);
registrarChefe('garuda', garuda);
registrarChefe('rei_caranguejo', reiCaranguejo);
registrarChefe('serpente_ancia', serpenteAncia);
registrarChefe('kraken', kraken);
for (const t of AGUAS_VIVAS) registrarChefe(t, aguaViva);
for (const t of ['tartaruga', 'tartaruga_b', 'tartaruga_c']) registrarChefe(t, tartaruga);
