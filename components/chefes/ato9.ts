// Registro dos modulos do Ato IX (chefes e comuns). O GameCanvas importa este arquivo uma vez.
import { registrarChefe } from './index';
import { generalOssos } from './general_ossos';
import { cranioAncestral } from './cranio_ancestral';
import { drider } from './drider';
import { estatuas } from './estatuas';
import { cerberoAlfa } from './cerbero_alfa';
import { quimera } from './quimera';
import { estatuaLamina, ESTATUAS_LAMINA, aranha, ARANHAS } from './comuns9';

registrarChefe('general_ossos', generalOssos);
registrarChefe('cranio_ancestral', cranioAncestral);
registrarChefe('drider', drider);
registrarChefe('estatua_leste', estatuas);
registrarChefe('estatua_oeste', estatuas);
registrarChefe('cerbero_alfa', cerberoAlfa);
registrarChefe('quimera', quimera);
for (const t of ESTATUAS_LAMINA) registrarChefe(t, estatuaLamina);
for (const t of ARANHAS) registrarChefe(t, aranha);
