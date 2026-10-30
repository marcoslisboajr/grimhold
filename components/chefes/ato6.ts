// Registro dos modulos do Ato VI (chefes e comuns). O GameCanvas importa este arquivo uma vez.
import { registrarChefe } from './index';
import { cultistaMor } from './cultista_mor';
import { coro } from './coro';
import { anjoCaido } from './anjo_caido';
import { irmaDeCassiel } from './irma_de_cassiel';
import { fenixAncia } from './fenix_ancia';
import { serafimCaido } from './serafim_caido';
import { cultistaVermelho, cultistaBranco, cultistaVerde } from './comuns6';

registrarChefe('cultista_mor', cultistaMor);
registrarChefe('coro', coro);
registrarChefe('anjo_caido', anjoCaido);
registrarChefe('irma_de_cassiel', irmaDeCassiel);
registrarChefe('fenix_ancia', fenixAncia);
registrarChefe('serafim_caido', serafimCaido);
for (const t of ['cultista_vermelho', 'cultista_vermelho_b']) registrarChefe(t, cultistaVermelho);
for (const t of ['cultista_branco', 'cultista_branco_b']) registrarChefe(t, cultistaBranco);
for (const t of ['cultista_verde', 'cultista_verde_b']) registrarChefe(t, cultistaVerde);
