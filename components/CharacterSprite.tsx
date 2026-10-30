// ══════════════════════════════════════════════════════════════════════
// components/CharacterSprite.tsx
// Extracted from GameCanvas.tsx — ally sprites and profile avatars.
// Componentes puramente apresentacionais, sem estado do jogo.
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
import { AVATAR_DEFS } from './data/account';
import { skinEquipada, useSkins } from './data/skins';

// ---------------------------------------------------------------------------
// CharacterSprite
// Carrega o sprite PNG do aliado a partir de /sprites/allies/<filename>.png
// ---------------------------------------------------------------------------

interface CharacterSpriteProps {
  type: string; // AllyType | 'unknown'
  isAttacking?: boolean;
  className?: string;
  isHero?: boolean;
  // herói do Guardião Solitário: monta a camada de passos; quem liga é o data-andando
  // do elemento pai (GameCanvas, sem render do React)
  passos?: boolean;
}

// Folhas de caminhada 4x4 (public/sprites/walk): só os sprites de paperdoll.
// Quem não tem folha anda com um balanço. CSS (.sp-andar/.sp-parado) no <style> do GameCanvas.
const COM_PASSOS = new Set(['yue', 'billy',
  'archer__cacadora', 'bard__menestrel', 'bard__mercador_de_cancoes', 'berserker__brigao', 'berserker__saqueador',
  'billy__capitao', 'billy__mercador', 'cleric__voto_branco', 'dreadlord__sentinela_negro', 'druid__andarilha',
  'frost_warden__cavaleiro_de_gelo', 'frost_warden__guarda_do_inverno', 'hyo__peregrina', 'inquisitor__juiz_de_aco',
  'mage__aprendiz_rubro', 'morrigan__viuva_palida', 'necromancer__capuz_negro', 'paladin__cavaleiro_azul',
  'paladin__cruzado_dourado', 'sylvanite__batedora_do_bosque', 'sylvanite__folha_nova', 'warlock__capuz_do_vazio',
  'warlock__manto_violeta', 'yue__ensaio', 'yue__tunica_de_palco', 'zylvara__oraculo_azul', 'zylvara__vidente',
  // skins EA (docs/skins-ea)
  'mage__erudito_de_jade', 'mage__chama_de_papel', 'paladin__vigilia_de_luto', 'berserker__furia_da_savana',
  'necromancer__coveiro', 'necromancer__embalsamador_de_neferu', 'cleric__voto_das_lanternas',
  'cleric__mestra_do_voto', 'dreadlord__couraca_da_savana', 'dreadlord__senhor_mestre', 'druid__druida_da_savana',
  'druid__guardia_de_jade', 'frost_warden__guardiao_mestre', 'hyo__sacerdotisa_de_jade', 'hyo__noite_das_lanternas',
  'inquisitor__inquisidor_desonrado', 'inquisitor__juiz_dourado', 'runesmith__forjador_da_savana',
  'runesmith__gravador_de_neferu', 'warlock__capuz_de_luto', 'sylvanite__folha_dourada',
  'bard__cantor_das_lanternas', 'morrigan__bruxa_mestra', 'morrigan__viuva_de_neferu', 'zylvara__oraculo_de_neferu',
  'yue__noite_das_lanternas', 'billy__noite_de_estreia',
  // skins EA 2 (arqueira + homenagem; so pecas + recolor)
  'archer__cavaleira_da_estepe', 'archer__arqueira_de_luto', 'frost_warden__sombra_da_nevasca',
  'paladin__cavaleiro_do_lago', 'cleric__donzela_do_cerco', 'necromancer__rei_do_tumulo_gelado',
  'billy__andarilho_do_poente', 'berserker__barbaro_das_terras_frias', 'mage__mago_errante',
  'inquisitor__cacador_do_crepusculo']);

export const CharacterSprite = React.memo(({
  type,
  isAttacking = false,
  className = '',
  isHero = false,
  passos = false,
}: CharacterSpriteProps) => {

  // Animação baseada no tipo de aliado
  let animClass = '';
  if (isAttacking) {
    if (type === 'archer' || type === 'zylvara') animClass = 'anim-recoil';
    else if (type === 'warlock' || type === 'necromancer'
          || type === 'morrigan') animClass = 'anim-summon';
    else if (type === 'jester' || type === 'bard') animClass = 'anim-play';
    else animClass = 'anim-attack';
  }

  const containerClass = [
    className,
    animClass,
    isHero ? 'drop-' : '',
    'overflow-visible',
  ].filter(Boolean).join(' ');

  // Mapeamento type → nome do arquivo (exceções)
  const nameMap: Record<string, string> = {
    priest: 'hyo',
    malachar_human: 'Malachar',
  };
  const filename = nameMap[type] ?? type;
  useSkins();
  const skin = skinEquipada(type);   // skin equipada (data/skins.ts) troca o sprite em todo lugar

  const chaveAndar = skin ?? filename;
  const img = (
    <img
      src={skin ? `./sprites/skins/${skin}.png` : `./sprites/allies/${filename}.png`}
      className={passos ? `sp-parado ${COM_PASSOS.has(chaveAndar) ? 'tem-passos' : 'balanca'} w-full h-full` : containerClass}
      style={{ imageRendering: 'pixelated' }}
      draggable={false}
      onError={(e) => {
        const el = e.currentTarget;
        el.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = [
          'width:100%', 'height:100%', 'background:#344045',
          'border-radius:50%', 'display:flex',
          'align-items:center', 'justify-content:center',
          'border:1px solid #80776c',
        ].join(';');
        placeholder.innerHTML = `<span style="color:white;font-size:10px;font-weight:bold">${String(type).slice(0, 2).toUpperCase()}</span>`;
        el.parentNode?.insertBefore(placeholder, el);
      }}
    />
  );
  if (!passos) return img;
  return (
    <div className={containerClass} style={{ position: 'relative' }}>
      {img}
      {COM_PASSOS.has(chaveAndar) && <div className="sp-andar" style={{ backgroundImage: `url(./sprites/walk/${chaveAndar}.png)` }} />}
    </div>
  );
});

CharacterSprite.displayName = 'CharacterSprite';

// ---------------------------------------------------------------------------
// AvatarFaceSprite
// Retrato pixel do avatar (public/ui/pixel/avatars/<id>.png, gerado por
// scripts/retratos-pixel.py a partir dos sprites dos herois). A moldura
// usa a cor da raridade (AVATAR_DEFS.border).
// ---------------------------------------------------------------------------

interface AvatarFaceSpriteProps {
  type: string;
  size?: number;
}

export const AvatarFaceSprite = React.memo(({
  type,
  size = 52,
}: AvatarFaceSpriteProps) => {
  const def = AVATAR_DEFS.find(a => a.id === type);
  if (!def) return null;
  const border = def.border ?? '#47585f';
  return (
    <div style={{
      width: size,
      height: size,
      overflow: 'hidden',
      flexShrink: 0,
      background: '#0b0906',
      border: `2px solid ${border}`,
      boxShadow: 'inset 0 0 0 2px #0b0906',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img src={`./ui/pixel/avatars/${type}.png`} width={size - 4} height={size - 4} alt="" draggable={false}
        style={{ imageRendering: 'pixelated', display: 'block' }} />
    </div>
  );
});

AvatarFaceSprite.displayName = 'AvatarFaceSprite';
