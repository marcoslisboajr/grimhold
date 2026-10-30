// Registro dos modulos do Ato VII (chefes e comuns). O GameCanvas importa este arquivo uma vez.
import { registrarChefe } from './index';
import { sapoRei } from './sapo_rei';
import { kwazul } from './kwazul';
import { alfaMatilha } from './alfa_matilha';
import { xiphra } from './xiphra';
import { chefeTribal } from './chefe_tribal';
import { ossoth } from './ossoth';
import { sapoXama, totemXama } from './comuns7';

registrarChefe('sapo_rei', sapoRei);
registrarChefe('kwazul', kwazul);
registrarChefe('alfa_matilha', alfaMatilha);
registrarChefe('xiphra', xiphra);
registrarChefe('chefe_tribal', chefeTribal);
registrarChefe('ossoth', ossoth);
for (const t of ['sapo_xama', 'sapo_xama_b']) registrarChefe(t, sapoXama);
registrarChefe('totem_xama', totemXama);
